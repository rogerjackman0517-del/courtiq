from fastapi import APIRouter, HTTPException, Query
from nba_api.stats.endpoints import teamdashboardbygeneralsplits, commonteamroster, teaminfocommon
from nba_api.stats.static import teams as nba_teams
from cache import cache_get, cache_set
from config import settings

router = APIRouter(prefix="/teams", tags=["teams"])
CURRENT_SEASON = "2025-26"

_TEAM_BY_ABBR = {t["abbreviation"]: t for t in nba_teams.get_teams()}

_TEAM_COLORS = {
    "ATL": "#E03A3E", "BOS": "#007A33", "BKN": "#000000", "CHA": "#1D1160",
    "CHI": "#CE1141", "CLE": "#860038", "DAL": "#00538C", "DEN": "#0E2240",
    "DET": "#C8102E", "GSW": "#1D428A", "HOU": "#CE1141", "IND": "#002D62",
    "LAC": "#C8102E", "LAL": "#552583", "MEM": "#5D76A9", "MIA": "#98002E",
    "MIL": "#00471B", "MIN": "#0C2340", "NOP": "#0C2340", "NYK": "#006BB6",
    "OKC": "#007AC1", "ORL": "#0077C0", "PHI": "#006BB6", "PHX": "#1D1160",
    "POR": "#E03A3E", "SAC": "#5A2D81", "SAS": "#C4CED4", "TOR": "#CE1141",
    "UTA": "#002B5C", "WAS": "#002B5C",
}

# 2025-26 NBA final regular-season standings
# Format: (abbr, wins, losses, conference, conference_rank, streak, last_10)
_STANDINGS_2025_26 = [
    ("DET", 45, 16, "East", 1, "L2", "7-3"),
    ("BOS", 42, 21, "East", 2, "W1", "8-2"),
    ("NYK", 41, 23, "East", 3, "W1", "7-3"),
    ("CLE", 39, 24, "East", 4, "W2", "7-3"),
    ("TOR", 35, 27, "East", 5, "L2", "5-5"),
    ("PHI", 34, 28, "East", 6, "W1", "4-6"),
    ("MIA", 35, 29, "East", 7, "W4", "7-3"),
    ("ORL", 33, 28, "East", 8, "W2", "6-4"),
    ("ATL", 32, 31, "East", 9, "W5", "6-4"),
    ("CHA", 32, 32, "East", 10, "L1", "7-3"),
    ("MIL", 26, 35, "East", 11, "L4", "5-5"),
    ("CHI", 26, 37, "East", 12, "W1", "2-8"),
    ("WAS", 16, 46, "East", 13, "L7", "2-8"),
    ("BKN", 15, 47, "East", 14, "L10", "0-10"),
    ("IND", 15, 48, "East", 15, "L8", "2-8"),
    ("OKC", 49, 15, "West", 1, "W4", "8-2"),
    ("SAS", 46, 17, "West", 2, "W3", "9-1"),
    ("MIN", 40, 23, "West", 3, "W5", "8-2"),
    ("HOU", 39, 23, "West", 4, "W1", "6-4"),
    ("DEN", 39, 25, "West", 5, "L1", "5-5"),
    ("LAL", 38, 25, "West", 6, "W1", "6-4"),
    ("PHX", 36, 27, "West", 7, "W1", "5-5"),
    ("GSW", 32, 30, "West", 8, "W1", "4-6"),
    ("LAC", 30, 32, "West", 9, "L1", "5-5"),
    ("POR", 30, 34, "West", 10, "L1", "4-6"),
    ("MEM", 23, 38, "West", 11, "L2", "3-7"),
    ("DAL", 21, 42, "West", 12, "L6", "2-8"),
    ("NOP", 20, 45, "West", 13, "L1", "5-5"),
    ("UTA", 19, 44, "West", 14, "W1", "3-7"),
    ("SAC", 14, 50, "West", 15, "L3", "2-8"),
]


@router.get("")
async def get_all_teams():
    return nba_teams.get_teams()


@router.get("/with-records")
async def get_teams_with_records(season: str = Query(CURRENT_SEASON)):
    cache_key = f"teams:records:hc:{season}"
    hit = await cache_get(cache_key)
    if hit:
        return hit

    out = []
    for abbr, wins, losses, conf, rank, streak, l10 in _STANDINGS_2025_26:
        meta = _TEAM_BY_ABBR.get(abbr, {})
        total = wins + losses
        out.append({
            "id": meta.get("id"),
            "abbreviation": abbr,
            "city": meta.get("city", ""),
            "name": meta.get("nickname", ""),
            "fullName": meta.get("full_name", ""),
            "slug": abbr.lower(),
            "conference": conf,
            "confRank": rank,
            "wins": wins,
            "losses": losses,
            "winPct": wins / total if total else 0,
            "streak": streak,
            "l10": l10,
            "primaryColor": _TEAM_COLORS.get(abbr, "#888899"),
        })

    out.sort(key=lambda t: (t["conference"], t["confRank"]))
    await cache_set(cache_key, out, settings.cache_ttl_stats)
    return out


@router.get("/standings")
async def get_standings(season: str = Query(CURRENT_SEASON)):
    return await get_teams_with_records(season)


@router.get("/{team_id}/roster")
async def get_team_roster(team_id: int, season: str = Query(CURRENT_SEASON)):
    cache_key = f"team:roster:{team_id}:{season}"
    hit = await cache_get(cache_key)
    if hit:
        return hit
    try:
        roster = commonteamroster.CommonTeamRoster(team_id=team_id, season=season, timeout=30)
        frames = roster.get_data_frames()
        result = {"roster": frames[0].to_dict(orient="records"), "coaches": frames[1].to_dict(orient="records") if len(frames) > 1 else []}
        await cache_set(cache_key, result, settings.cache_ttl_roster)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{team_id}/stats")
async def get_team_stats(team_id: int, season: str = Query(CURRENT_SEASON)):
    cache_key = f"team:stats:{team_id}:{season}"
    hit = await cache_get(cache_key)
    if hit:
        return hit
    try:
        dash = teamdashboardbygeneralsplits.TeamDashboardByGeneralSplits(team_id=team_id, season=season, per_mode_simple="PerGame", timeout=30)
        result = dash.get_data_frames()[0].to_dict(orient="records")
        await cache_set(cache_key, result, settings.cache_ttl_stats)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{team_id}/info")
async def get_team_info(team_id: int, season: str = Query(CURRENT_SEASON)):
    cache_key = f"team:info:{team_id}:{season}"
    hit = await cache_get(cache_key)
    if hit:
        return hit
    try:
        info = teaminfocommon.TeamInfoCommon(team_id=team_id, season_nullable=season, timeout=30)
        frames = info.get_data_frames()
        result = {"info": frames[0].to_dict(orient="records")[0], "season_ranks": frames[1].to_dict(orient="records")[0] if len(frames) > 1 else {}}
        await cache_set(cache_key, result, settings.cache_ttl_stats)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# 2026 NBA Playoff status (manually updated as series progress)
# "alive" = still playing or advanced. "out-r1/r2" = eliminated in that round.
# "missed" = didn't make the playoffs at all.
PLAYOFF_STATUS_2026 = {
    # Still alive — Conference Semis or beyond
    "NYK": "alive",  # Knicks, advanced to ECF
    "CLE": "alive",  # Cavs, leading Pistons 3-1
    "SAS": "alive",  # Spurs vs Wolves, series 2-2
    "MIN": "alive",  # Wolves vs Spurs, series 2-2
    "OKC": "alive",  # Thunder, beat Lakers

    # Eliminated round 2
    "PHI": "out-r2",  # Swept by Knicks
    "LAL": "out-r2",  # Eliminated by Thunder
    "DET": "out-r2",  # On verge vs Cavs (3-1 down)

    # Eliminated round 1 (best guesses based on standings)
    "BOS": "out-r1", "MIA": "out-r1", "MIL": "out-r1", "ORL": "out-r1",
    "IND": "out-r1", "ATL": "out-r1", "CHI": "out-r1",
    "DEN": "out-r1", "DAL": "out-r1", "GSW": "out-r1", "PHX": "out-r1",
    "MEM": "out-r1", "HOU": "out-r1", "LAC": "out-r1",

    # Missed playoffs
    "CHA": "missed", "WAS": "missed", "TOR": "missed", "BKN": "missed",
    "POR": "missed", "SAC": "missed", "UTA": "missed", "NOP": "missed",
}

PLAYOFF_PENALTY = {
    "alive": 0,
    "out-r2": -8,
    "out-r1": -16,
    "missed": -25,
}

PLAYOFF_LABEL = {
    "alive": "Alive",
    "out-r2": "Out · Round 2",
    "out-r1": "Out · Round 1",
    "missed": "Missed playoffs",
}


@router.get("/power-rankings")
async def get_power_rankings(season: str = "2025-26") -> list[dict]:
    """
    Compute algorithmic team power rankings.
    Score = 60% win% + 40% last-10 win%, scaled to 100, then adjusted by playoff status.
    Returns teams sorted by power score, with rank.
    """
    cache_key = f"power-rankings:{season}:v2"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    # Reuse the with-records data
    teams = await get_teams_with_records(season=season)

    def parse_l10(l10: str) -> float:
        """Parse '7-3' format into win pct."""
        try:
            w, l = map(int, l10.split("-"))
            total = w + l
            return w / total if total > 0 else 0
        except (ValueError, AttributeError):
            return 0

    ranked = []
    for t in teams:
        win_pct = t.get("winPct", 0) or 0
        l10_pct = parse_l10(t.get("l10", ""))
        abbr = (t.get("abbreviation") or "").upper()
        playoff_status = PLAYOFF_STATUS_2026.get(abbr, "missed")
        base_power = (win_pct * 0.6 + l10_pct * 0.4) * 100
        power = base_power + PLAYOFF_PENALTY[playoff_status]
        ranked.append({
            **t,
            "power": round(power, 1),
            "l10Pct": round(l10_pct, 3),
            "playoffStatus": playoff_status,
            "playoffLabel": PLAYOFF_LABEL[playoff_status],
        })

    ranked.sort(key=lambda x: x["power"], reverse=True)
    for i, t in enumerate(ranked, start=1):
        t["rank"] = i

    await cache_set(cache_key, ranked, ttl=600)
    return ranked
