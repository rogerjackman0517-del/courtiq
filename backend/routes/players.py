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
    leaguedashplayerstats,
)
from nba_api.stats.static import players as nba_players, teams as nba_teams
from cache import cached, cache_get, cache_set
import httpx
from config import settings

router = APIRouter(prefix="/players", tags=["players"])

CURRENT_SEASON = "2025-26"

# Browser-like headers — required to avoid NBA.com blocking Railway IPs
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
        headers=NBA_HEADERS,
        timeout=30,
    )
    df = endpoint.get_data_frames()[0]
    return df.to_dict(orient="records")


@router.get("/with-stats")
@cached(ttl=settings.cache_ttl_stats, key_fn=lambda season="2025-26": f"players:with-stats:{season}")
async def get_players_with_stats(season: str = Query(CURRENT_SEASON)):
    """All players with at least 1 GP — no min-game qualification filter.
    Sorted by PPG so injured/limited players still appear (Tatum, Embiid, etc.)."""
    dash = leaguedashplayerstats.LeagueDashPlayerStats(
        season=season,
        per_mode_detailed="PerGame",
        measure_type_detailed_defense="Base",
        headers=NBA_HEADERS,
        timeout=30,
    )
    import pandas as pd
    df = dash.get_data_frames()[0]
    df = df[df["GP"] >= 1].sort_values("PTS", ascending=False)
    rows = df.to_dict(orient="records")

    out = []
    for r in rows[:400]:
        pid = r.get("PLAYER_ID")
        name = r.get("PLAYER_NAME") or ""
        out.append({
            "id": pid,
            "fullName": name,
            "slug": "".join(c for c in unicodedata.normalize("NFD", name) if unicodedata.category(c) != "Mn").lower().replace(" ", "-").replace(".", "").replace("'", ""),
            "teamId": int(r.get("TEAM_ID") or 0),
            "teamAbbr": _TEAM_BY_ID.get(r.get("TEAM_ID"), r.get("TEAM_ABBREVIATION") or ""),
            "position": r.get("START_POSITION") or "—",
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
        info = commonplayerinfo.CommonPlayerInfo(player_id=player_id, headers=NBA_HEADERS, timeout=30)
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
        career = playercareerstats.PlayerCareerStats(player_id=player_id, per_mode36="PerGame", headers=NBA_HEADERS, timeout=30)
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
            headers=NBA_HEADERS,
            timeout=30,
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
            headers=NBA_HEADERS,
            timeout=30,
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

# NBA player ID → ESPN athlete ID. Bulk-resolved via ESPN search for all 150
# active players in /players/with-stats. Falls back to ESPN search at request
# time for anyone not in this map.
NBA_TO_ESPN_ID = {
    # ── Stars added — missing from original map ───────────────────────────────
    202681: 6442,      # Kyrie Irving
    202710: 6434,      # Jimmy Butler
    202331: 3032977,   # Paul George
    203954: 3059318,   # Joel Embiid
    1628369: 4065697,  # Jayson Tatum
    203076: 6583,      # Anthony Davis
    203507: 3032980,   # Giannis Antetokounmpo
    203110: 6606,      # Draymond Green
    # ─────────────────────────────────────────────────────────────────────────
    2544: 1966,        # LeBron James
    201142: 3202,      # Kevin Durant
    201566: 3468,      # Russell Westbrook
    201935: 3992,      # James Harden
    201942: 3978,      # DeMar DeRozan
    202685: 6477,      # Jonas Valančiūnas
    202691: 6475,      # Klay Thompson
    202695: 6450,      # Kawhi Leonard
    202696: 6478,      # Nikola Vučević
    202699: 6440,      # Tobias Harris
    203084: 6578,      # Harrison Barnes
    203114: 6609,      # Khris Middleton
    203468: 2490149,   # CJ McCollum
    203471: 3032979,   # Dennis Schröder
    203497: 3032976,   # Rudy Gobert
    203501: 2528210,   # Tim Hardaway Jr.
    203903: 2528426,   # Jordan Clarkson
    203935: 2990992,   # Marcus Smart
    203944: 3064514,   # Julius Randle
    203952: 3059319,   # Andrew Wiggins
    203999: 3112335,   # Nikola Jokić
    1626157: 3136195,  # Karl-Anthony Towns
    1626164: 3136193,  # Devin Booker
    1626167: 3133628,  # Myles Turner
    1626171: 3064482,  # Bobby Portis
    1626181: 2595516,  # Norman Powell
    1626220: 2583632,  # Royce O'Neale
    1627742: 3913176,  # Brandon Ingram
    1627750: 3936299,  # Jamal Murray
    1627759: 3917376,  # Jaylen Brown
    1627783: 3149673,  # Pascal Siakam
    1628368: 4066259,  # De'Aaron Fox
    1628370: 4066262,  # Malik Monk
    1628378: 3908809,  # Donovan Mitchell
    1628381: 3908845,  # John Collins
    1628384: 3934719,  # OG Anunoby
    1628389: 4066261,  # Bam Adebayo
    1628398: 3134907,  # Kyle Kuzma
    1628401: 3078576,  # Derrick White
    1628404: 3062679,  # Josh Hart
    1628963: 4277848,  # Marvin Bagley III
    1628969: 3147657,  # Mikal Bridges
    1628970: 4066383,  # Miles Bridges
    1628973: 3934672,  # Jalen Brunson
    1628976: 4277847,  # Wendell Carter Jr.
    1628978: 3934673,  # Donte DiVincenzo
    1628983: 4278073,  # Shai Gilgeous-Alexander
    1628989: 4066372,  # Kevin Huerter
    1629012: 4277811,  # Collin Sexton
    1629028: 4278129,  # Deandre Ayton
    1629029: 3945274,  # Luka Dončić
    1629060: 4066648,  # Rui Hachimura
    1629111: 3146557,  # Jock Landale
    1629130: 3157465,  # Duncan Robinson
    1629627: 4395628,  # Zion Williamson
    1629638: 4278039,  # Nickeil Alexander-Walker
    1629640: 4395723,  # Keldon Johnson
    1629651: 4278067,  # Nic Claxton
    1629656: 4397014,  # Quentin Grimes
    1629674: 4397424,  # Neemias Queta
    1629675: 4396971,  # Naz Reid
    1630162: 4594268,  # Anthony Edwards
    1630163: 4432816,  # LaMelo Ball
    1630166: 4683021,  # Deni Avdija
    1630168: 4431680,  # Onyeka Okongwu
    1630170: 4395630,  # Devin Vassell
    1630171: 4432822,  # Isaac Okoro
    1630173: 4431679,  # Precious Achiuwa
    1630178: 4431678,  # Tyrese Maxey
    1630180: 4397136,  # Saddiq Bey
    1630183: 4431671,  # Jaden McDaniels
    1630191: 4432810,  # Isaiah Stewart
    1630193: 4395724,  # Immanuel Quickley
    1630198: 4395702,  # Isaiah Joe
    1630200: 4395626,  # Tre Jones
    1630202: 4066354,  # Payton Pritchard
    1630217: 4066320,  # Desmond Bane
    1630230: 4278594,  # Naji Marshall
    1630245: 4397002,  # Ayo Dosunmu
    1630314: 4397040,  # Brandon Williams
    1630530: 4397688,  # Trey Murphy III
    1630541: 4432171,  # Moses Moody
    1630549: 4432194,  # Day'Ron Sharpe
    1630551: 4432907,  # Justin Champagnie
    1630552: 4701230,  # Jalen Johnson
    1630557: 4280151,  # Corey Kispert
    1630558: 4278053,  # Davion Mitchell
    1630567: 4433134,  # Scottie Barnes
    1630572: 4278580,  # Sandro Mamukelashvili
    1630573: 4065804,  # Sam Hauser
    1630577: 4592479,  # Julian Champagnie
    1630578: 4871144,  # Alperen Şengün
    1630595: 4432166,  # Cade Cunningham
    1630596: 4432158,  # Evan Mobley
    1630598: 4397183,  # Aaron Wiggins
    1630611: 4997536,  # Gui Santos
    1630643: 4065731,  # Jay Huff
    1630692: 4278402,  # Jordan Goodwin
    1630700: 4869342,  # Dyson Daniels
    1631094: 4432573,  # Paolo Banchero
    1631095: 4432639,  # Jabari Smith Jr.
    1631096: 4433255,  # Chet Holmgren
    1631105: 4433621,  # Jalen Duren
    1631106: 4433192,  # Tari Eason
    1631108: 4432582,  # Max Christie
    1631109: 4701232,  # Mark Williams
    1631157: 4591725,  # Ryan Rollins
    1631170: 4432848,  # Jaime Jaquez Jr.
    1631221: 4278585,  # Collin Gillespie
    1631260: 4397475,  # AJ Green
    1641705: 5104157,  # Victor Wembanyama
    1641706: 4433287,  # Brandon Miller
    1641708: 4684740,  # Amen Thompson
    1641709: 4684742,  # Ausar Thompson
    1641710: 4712849,  # Anthony Black
    1641716: 5106060,  # Jarace Walker
    1641717: 4683692,  # Cason Wallace
    1641729: 5105839,  # Brice Sensabaugh
    1641730: 4712896,  # Noah Clowney
    1641739: 4431736,  # Toumani Camara
    1641757: 4396818,  # Jordan Miller
    1641764: 4709138,  # Brandin Podziemski
    1641783: 4702382,  # Tristan da Silva
    1641796: 4601025,  # Pelle Larsson
    1641824: 4711294,  # Matas Buzelis
    1642258: 5211175,  # Zaccharie Risacher
    1642262: 4895758,  # Cody Williams
    1642263: 4711272,  # Reed Sheppard
    1642264: 4845367,  # Stephon Castle
    1642267: 4845374,  # Bub Carrington
    1642268: 4683766,  # Isaiah Collier
    1642270: 5105565,  # Donovan Clingan
    1642271: 4684793,  # Kyle Filipowski
    1642276: 5105623,  # Kel'el Ware
    1642281: 4683747,  # Jaylon Tyson
    1642285: 4433083,  # Cam Spencer
    1642363: 4702384,  # Nique Clifford
    1642377: 5112087,  # Jaylen Wells
    1642450: 5107199,  # Daniss Jenkins
    1642843: 5041939,  # Cooper Flagg
    1642844: 5037871,  # Dylan Harper
    1642845: 5124612,  # VJ Edgecombe
    1642846: 4873138,  # Ace Bailey
    1642847: 5144091,  # Jeremiah Fears
    1642848: 5238230,  # Tre Johnson
    1642851: 5061575,  # Kon Knueppel
    1642852: 4869780,  # Derik Queen
    1642860: 5144126,  # Will Riley
    1642875: 4898371,  # Maxime Raynaud
    1642907: 4903027,  # Cedric Coward
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
