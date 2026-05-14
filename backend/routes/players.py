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
from cache import cached, cache_get, cache_set
import httpx
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


ESPN_GAMELOG_URL = "https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/athletes/{espn_id}/gamelog"

# Manual NBA → ESPN ID mapping for top players (we built this from player names earlier)
# For now: lookup by name via ESPN search if we don't have it cached
NBA_TO_ESPN_ID = {
    1629029: 3945274,  # Luka Doncic
    1628983: 4278073,  # Shai Gilgeous-Alexander
    1630224: 4396993,  # Anthony Edwards
    1627759: 3917376,  # Jaylen Brown
    203954: 3149673,   # Joel Embiid
    1626156: 3037789,  # Devin Booker
    1628369: 4066648,  # Jayson Tatum
    1629627: 4432174,  # Zion Williamson
    1641705: 4683020,  # Wembanyama (Victor)
    203999: 3112335,   # Nikola Jokic
    1627742: 3917376,  # placeholder
    1628378: 4066648,  # placeholder (will fix as we go)
}


@router.get("/{slug}/gamelog")
async def get_player_gamelog(slug: str, season: str = "2026") -> dict:
    """Fetch recent game logs for a player via ESPN."""
    cache_key = f"gamelog:{slug}:{season}"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    # Load all players to find the NBA ID + name
    all_players = await get_players_with_stats(season="2025-26")
    player = next((p for p in all_players if p.get("slug") == slug), None)
    if not player:
        return {"games": [], "error": "Player not found"}

    nba_id = player.get("id")
    espn_id = NBA_TO_ESPN_ID.get(nba_id)

    # If not in our mapping, try to resolve via ESPN search
    if not espn_id:
        try:
            async with httpx.AsyncClient(timeout=8) as client:
                search_url = f"https://site.web.api.espn.com/apis/search/v2"
                r = await client.get(search_url, params={
                    "query": player.get("fullName"),
                    "limit": 5,
                    "type": "player",
                    "sport": "basketball",
                    "league": "nba",
                })
                r.raise_for_status()
                results = r.json().get("results", [])
                for grp in results:
                    if grp.get("type") == "player":
                        contents = grp.get("contents", [])
                        if contents:
                            espn_id_str = contents[0].get("uid", "").split(":")[-1]
                            try:
                                espn_id = int(espn_id_str)
                                break
                            except ValueError:
                                continue
        except Exception as e:
            print(f"[gamelog] ESPN search failed for {slug}: {e}")

    if not espn_id:
        return {"games": [], "error": "Could not resolve ESPN player ID"}

    # Fetch the gamelog
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(
                ESPN_GAMELOG_URL.format(espn_id=espn_id),
                params={"season": season},
                headers={"User-Agent": "Mozilla/5.0 CourtIQ/1.0"},
            )
            r.raise_for_status()
            data = r.json()
    except Exception as e:
        print(f"[gamelog] ESPN fetch failed: {e}")
        return {"games": [], "error": "ESPN fetch failed"}

    labels = data.get("labels", [])
    events_meta = data.get("events", {})

    # Build a flat list of games from all categories of the first season type (regular)
    season_types = data.get("seasonTypes", [])
    if not season_types:
        return {"games": []}

    # Collect all event stats from all category groups
    games_dict: dict = {}
    for st in season_types:
        for cat in st.get("categories", []):
            for ev in cat.get("events", []):
                eid = ev.get("eventId")
                if eid and eid not in games_dict:
                    games_dict[eid] = ev.get("stats", [])

    # Get the index of each label so we can pull values by name
    def idx(name: str) -> int:
        try:
            return labels.index(name)
        except ValueError:
            return -1

    i_min = idx("MIN")
    i_pts = idx("PTS")
    i_reb = idx("REB")
    i_ast = idx("AST")
    i_fg = idx("FG")
    i_3pt = idx("3PT")

    games = []
    for eid, stats in games_dict.items():
        meta = events_meta.get(eid, {})
        opp = meta.get("opponent", {}) or {}
        score = meta.get("score", "")
        result = meta.get("gameResult", "")
        at_vs = meta.get("atVs", "vs")
        date_str = meta.get("gameDate", "")

        def get(i: int) -> str:
            if i < 0 or i >= len(stats): return "0"
            return stats[i]

        games.append({
            "eventId": eid,
            "date": date_str,
            "opponent": {
                "abbr": (opp.get("abbreviation") or "").upper(),
                "displayName": opp.get("displayName", ""),
                "logo": opp.get("logo", ""),
            },
            "atVs": at_vs,  # "vs" or "@"
            "result": result,  # "W" or "L"
            "score": score,
            "min": get(i_min),
            "pts": get(i_pts),
            "reb": get(i_reb),
            "ast": get(i_ast),
            "fg": get(i_fg),
            "fg3": get(i_3pt),
        })

    # Sort newest first (date is ISO so string sort works)
    games.sort(key=lambda g: g["date"], reverse=True)

    result_data = {"games": games}
    await cache_set(cache_key, result_data, ttl=600)
    return result_data
