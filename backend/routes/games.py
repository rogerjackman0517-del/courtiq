import httpx
from fastapi import APIRouter, HTTPException, Query
from nba_api.stats.library import http
from nba_api.live.nba.endpoints import scoreboard, boxscore
from cache import cache_get, cache_set
from config import settings

router = APIRouter(prefix="/games", tags=["games"])

# Spoof headers to bypass NBA.com cloud-IP blocking
http.STATS_HEADERS = {
    "Host": "stats.nba.com",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Referer": "https://www.nba.com/",
    "Origin": "https://www.nba.com",
    "Connection": "keep-alive",
    "x-nba-stats-origin": "stats",
    "x-nba-stats-token": "true",
}

BALLDONTLIE_BASE = "https://api.balldontlie.io/v1"


@router.get("/today")
async def get_today_scores():
    """Live scores from nba_api live endpoint — cached 30s.
    Falls back to empty scoreboard if NBA.com blocks the request."""
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
        # Graceful fallback — return empty scoreboard so frontend doesn't crash
        print(f"[games/today] nba_api failed: {e}")
        return {
            "meta": {"version": 1, "code": 200, "request": "", "time": ""},
            "scoreboard": {
                "gameDate": "",
                "leagueId": "00",
                "leagueName": "National Basketball Association",
                "games": [],
            },
        }


@router.get("/{game_id}/boxscore")
async def get_boxscore(game_id: str):
    cache_key = f"games:boxscore:{game_id}"
    hit = await cache_get(cache_key)
    if hit:
        return hit
    try:
        bs = boxscore.BoxScore(game_id=game_id)
        data = bs.get_dict()
        await cache_set(cache_key, data, settings.cache_ttl_live)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
