from fastapi import APIRouter, HTTPException, Query
import unicodedata
from nba_api.stats.endpoints import (
    commonallplayers,
    playercareerstats,
    playerdashboardbyyearoveryear,
    shotchartdetail,
    playergamelog,
    commonplayerinfo,
    leagueleaders,
)
from nba_api.stats.static import players as nba_players, teams as nba_teams
from cache import cached
from config import settings

router = APIRouter(prefix="/players", tags=["players"])

CURRENT_SEASON = "2025-26"

# Build a lookup: team_id -> abbreviation
_TEAM_BY_ID = {t["id"]: t["abbreviation"] for t in nba_teams.get_teams()}


@router.get("")
@cached(ttl=settings.cache_ttl_stats, key_fn=lambda season="2025-26": f"players:all:{season}")
async def get_all_players(season: str = Query(CURRENT_SEASON)):
    """All active players with basic info."""
    endpoint = commonallplayers.CommonAllPlayers(
        is_only_current_season=1,
        league_id="00",
        season=season,
    )
    df = endpoint.get_data_frames()[0]
    return df.to_dict(orient="records")


@router.get("/with-stats")
@cached(ttl=settings.cache_ttl_stats, key_fn=lambda season="2025-26": f"players:with-stats:{season}")
async def get_players_with_stats(season: str = Query(CURRENT_SEASON)):
    """Top ~150 players (PTS leaders) with PPG/RPG/APG/FG% for the table page."""
    leaders = leagueleaders.LeagueLeaders(
        season=season,
        season_type_all_star="Regular Season",
        per_mode48="PerGame",
        stat_category_abbreviation="PTS",
    )
    df = leaders.get_data_frames()[0]
    rows = df.to_dict(orient="records")

    # Get all players for slug/position lookup
    all_players = {p["id"]: p for p in nba_players.get_players()}

    out = []
    for r in rows[:150]:
        pid = r.get("PLAYER_ID")
        meta = all_players.get(pid, {})
        out.append({
            "id": pid,
            "fullName": r.get("PLAYER"),
            "slug": "".join(c for c in unicodedata.normalize("NFD", (r.get("PLAYER") or "")) if unicodedata.category(c) != "Mn").lower().replace(" ", "-").replace(".", "").replace("'", ""),
            "teamId": int(r.get("TEAM_ID") or 0),
            "teamAbbr": _TEAM_BY_ID.get(r.get("TEAM_ID"), r.get("TEAM") or ""),
            "position": "—",  # not in leaders endpoint
            "pts": float(r.get("PTS") or 0),
            "reb": float(r.get("REB") or 0),
            "ast": float(r.get("AST") or 0),
            "stl": float(r.get("STL") or 0),
            "blk": float(r.get("BLK") or 0),
            "fgPct": float(r.get("FG_PCT") or 0),
            "fg3Pct": float(r.get("FG3_PCT") or 0),
            "ftPct": float(r.get("FT_PCT") or 0),
            "min": float(r.get("MIN") or 0),
            "gp": int(r.get("GP") or 0),
            "salary": None,
            "injuryStatus": "Healthy",
        })
    return out


@router.get("/{player_id}/info")
async def get_player_info(player_id: int):
    """Full player bio (position, height, team, salary hint, etc.)."""
    cache_key = f"player:info:{player_id}"
    from cache import cache_get, cache_set
    cached_val = await cache_get(cache_key)
    if cached_val:
        return cached_val

    try:
        info = commonplayerinfo.CommonPlayerInfo(player_id=player_id)
        frames = info.get_data_frames()
        result = {
            "info": frames[0].to_dict(orient="records")[0],
            "headline": frames[1].to_dict(orient="records")[0] if len(frames) > 1 else {},
        }
        await cache_set(cache_key, result, settings.cache_ttl_stats)
        return result
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{player_id}/stats")
async def get_player_stats(player_id: int, season: str = Query(CURRENT_SEASON)):
    cache_key = f"player:stats:{player_id}:{season}"
    from cache import cache_get, cache_set
    cached_val = await cache_get(cache_key)
    if cached_val:
        return cached_val

    try:
        career = playercareerstats.PlayerCareerStats(player_id=player_id, per_mode36="PerGame")
        frames = career.get_data_frames()
        result = {
            "season": frames[0][frames[0]["SEASON_ID"] == season].to_dict(orient="records"),
            "career": frames[0].to_dict(orient="records"),
            "career_totals": frames[1].to_dict(orient="records") if len(frames) > 1 else [],
        }
        await cache_set(cache_key, result, settings.cache_ttl_stats)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{player_id}/advanced")
async def get_player_advanced(player_id: int, season: str = Query(CURRENT_SEASON)):
    cache_key = f"player:advanced:{player_id}:{season}"
    from cache import cache_get, cache_set
    cached_val = await cache_get(cache_key)
    if cached_val:
        return cached_val

    try:
        dash = playerdashboardbyyearoveryear.PlayerDashboardByYearOverYear(
            player_id=player_id,
            season=season,
            per_mode_simple="PerGame",
        )
        result = dash.get_data_frames()[0].to_dict(orient="records")
        await cache_set(cache_key, result, settings.cache_ttl_stats)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{player_id}/gamelog")
async def get_player_gamelog(player_id: int, season: str = Query(CURRENT_SEASON)):
    cache_key = f"player:gamelog:{player_id}:{season}"
    from cache import cache_get, cache_set
    cached_val = await cache_get(cache_key)
    if cached_val:
        return cached_val

    try:
        log = playergamelog.PlayerGameLog(player_id=player_id, season=season)
        result = log.get_data_frames()[0].to_dict(orient="records")
        await cache_set(cache_key, result, settings.cache_ttl_stats)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{player_id}/shotchart")
async def get_player_shotchart(player_id: int, season: str = Query(CURRENT_SEASON)):
    cache_key = f"player:shots:{player_id}:{season}"
    from cache import cache_get, cache_set
    cached_val = await cache_get(cache_key)
    if cached_val:
        return cached_val

    try:
        chart = shotchartdetail.ShotChartDetail(
            team_id=0,
            player_id=player_id,
            season_nullable=season,
            season_type_all_star="Regular Season",
            context_measure_simple="FGA",
        )
        frames = chart.get_data_frames()
        result = {
            "shots": frames[0].to_dict(orient="records"),
            "league_avg": frames[1].to_dict(orient="records") if len(frames) > 1 else [],
        }
        await cache_set(cache_key, result, settings.cache_ttl_stats)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search/{query}")
async def search_players(query: str):
    """Static search — no API call needed."""
    all_players = nba_players.get_players()
    q = query.lower()
    matches = [p for p in all_players if q in p["full_name"].lower()][:20]
    return matches
