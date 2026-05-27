from fastapi import APIRouter, HTTPException, Query
from nba_api.stats.endpoints import (
    leagueleaders,
    leaguedashplayerstats,
    leaguedashteamstats,
)
from cache import cache_get, cache_set
from config import settings

router = APIRouter(prefix="/stats", tags=["stats"])

CURRENT_SEASON = "2025-26"

NBA_HEADERS = {
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Host": "stats.nba.com",
    "Origin": "https://www.nba.com",
    "Referer": "https://www.nba.com/",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "x-nba-stats-origin": "stats",
    "x-nba-stats-token": "true",
}


@router.get("/leaders")
async def get_stat_leaders(
    season: str = Query(CURRENT_SEASON),
    stat_category: str = Query("PTS", description="PTS, REB, AST, STL, BLK, FG_PCT, FG3_PCT, FT_PCT, EFF"),
    per_mode: str = Query("PerGame"),
):
    cache_key = f"leaders:{season}:{stat_category}:{per_mode}"
    hit = await cache_get(cache_key)
    if hit:
        return hit

    try:
        leaders = leagueleaders.LeagueLeaders(
            season=season,
            stat_category_abbreviation=stat_category,
            per_mode48=per_mode,
            scope="S",
            headers=NBA_HEADERS,
            timeout=30,
        )
        result = leaders.get_data_frames()[0].to_dict(orient="records")
        await cache_set(cache_key, result, settings.cache_ttl_stats)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/players")
async def get_player_stats(
    season: str = Query(CURRENT_SEASON),
    per_mode: str = Query("PerGame"),
    sort_by: str = Query("PTS"),
):
    cache_key = f"stats:players:{season}:{per_mode}:{sort_by}"
    hit = await cache_get(cache_key)
    if hit:
        return hit

    try:
        dash = leaguedashplayerstats.LeagueDashPlayerStats(
            season=season,
            per_mode_simple=per_mode,
            measure_type_simple="Base",
            headers=NBA_HEADERS,
            timeout=30,
        )
        df = dash.get_data_frames()[0]
        if sort_by in df.columns:
            df = df.sort_values(sort_by, ascending=False)
        result = df.head(200).to_dict(orient="records")
        await cache_set(cache_key, result, settings.cache_ttl_stats)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/players/advanced")
async def get_player_advanced_stats(season: str = Query(CURRENT_SEASON)):
    cache_key = f"stats:players:advanced:{season}"
    hit = await cache_get(cache_key)
    if hit:
        return hit

    try:
        dash = leaguedashplayerstats.LeagueDashPlayerStats(
            season=season,
            per_mode_simple="PerGame",
            measure_type_simple="Advanced",
        )
        result = dash.get_data_frames()[0].to_dict(orient="records")
        await cache_set(cache_key, result, settings.cache_ttl_stats)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/teams")
async def get_team_stats(season: str = Query(CURRENT_SEASON)):
    cache_key = f"stats:teams:{season}"
    hit = await cache_get(cache_key)
    if hit:
        return hit

    try:
        dash = leaguedashteamstats.LeagueDashTeamStats(
            season=season,
            per_mode_simple="PerGame",
            headers=NBA_HEADERS,
            timeout=30,
        )
        result = dash.get_data_frames()[0].to_dict(orient="records")
        await cache_set(cache_key, result, settings.cache_ttl_stats)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
