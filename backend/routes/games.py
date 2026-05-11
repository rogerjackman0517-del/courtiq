import httpx
from fastapi import APIRouter, HTTPException, Query
from nba_api.live.nba.endpoints import scoreboard, boxscore
from cache import cache_get, cache_set
from config import settings

router = APIRouter(prefix="/games", tags=["games"])

BALLDONTLIE_BASE = "https://api.balldontlie.io/v1"


@router.get("/today")
async def get_today_scores():
    """Live scores from nba_api live endpoint — cached 30s."""
    cache_key = "games:today"
    hit = await cache_get(cache_key)
    if hit:
        return hit

    try:
        board = scoreboard.ScoreBoard()
        data = board.get_dict()
        await cache_set(cache_key, data, settings.cache_ttl_live)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{game_id}/boxscore")
async def get_boxscore(game_id: str):
    cache_key = f"boxscore:{game_id}"
    hit = await cache_get(cache_key)
    if hit:
        return hit

    try:
        box = boxscore.BoxScore(game_id=game_id)
        data = box.get_dict()
        await cache_set(cache_key, data, settings.cache_ttl_live)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/schedule")
async def get_schedule(
    start_date: str = Query(..., description="YYYY-MM-DD"),
    end_date: str = Query(..., description="YYYY-MM-DD"),
):
    """Game schedule from BallDontLie API."""
    cache_key = f"schedule:{start_date}:{end_date}"
    hit = await cache_get(cache_key)
    if hit:
        return hit

    headers = {"Authorization": settings.balldontlie_api_key} if settings.balldontlie_api_key else {}
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{BALLDONTLIE_BASE}/games",
                params={"start_date": start_date, "end_date": end_date, "per_page": 100},
                headers=headers,
                timeout=10,
            )
            resp.raise_for_status()
            data = resp.json()
            await cache_set(cache_key, data, 300)  # 5 min
            return data
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/odds")
async def get_odds(sport: str = "basketball_nba"):
    """Betting odds from The Odds API."""
    cache_key = f"odds:{sport}"
    hit = await cache_get(cache_key)
    if hit:
        return hit

    if not settings.the_odds_api_key:
        return {"error": "THE_ODDS_API_KEY not configured", "data": []}

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"https://api.the-odds-api.com/v4/sports/{sport}/odds",
                params={
                    "apiKey": settings.the_odds_api_key,
                    "regions": "us",
                    "markets": "h2h,spreads,totals",
                    "oddsFormat": "american",
                },
                timeout=10,
            )
            resp.raise_for_status()
            data = resp.json()
            await cache_set(cache_key, data, 300)
            return data
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=str(e))
