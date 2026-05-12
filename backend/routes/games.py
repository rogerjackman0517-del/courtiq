import httpx
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from cache import cache_get, cache_set
from config import settings

router = APIRouter(prefix="/games", tags=["games"])

ESPN_SCOREBOARD_URL = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard"

# Map NBA tricodes to canonical NBA team IDs (for cdn.nba.com logo URLs)
TRICODE_TO_NBA_ID = {
    "ATL": 1610612737, "BOS": 1610612738, "BKN": 1610612751, "CHA": 1610612766,
    "CHI": 1610612741, "CLE": 1610612739, "DAL": 1610612742, "DEN": 1610612743,
    "DET": 1610612765, "GSW": 1610612744, "GS":  1610612744,
    "HOU": 1610612745, "IND": 1610612754, "LAC": 1610612746, "LA":  1610612746,
    "LAL": 1610612747, "MEM": 1610612763, "MIA": 1610612748, "MIL": 1610612749,
    "MIN": 1610612750, "NOP": 1610612740, "NO":  1610612740,
    "NYK": 1610612752, "NY":  1610612752,
    "OKC": 1610612760, "ORL": 1610612753, "PHI": 1610612755, "PHX": 1610612756,
    "POR": 1610612757, "SAC": 1610612758, "SAS": 1610612759, "SA":  1610612759,
    "TOR": 1610612761, "UTA": 1610612762, "WAS": 1610612764,
}


def _parse_espn_status(comp_status: dict) -> tuple[int, str]:
    """Map ESPN status to our format. Returns (gameStatus, gameStatusText)."""
    state = comp_status.get("type", {}).get("state", "")
    detail = comp_status.get("type", {}).get("shortDetail", "")
    if state == "in":
        return 2, detail or "LIVE"
    if state == "post":
        return 3, "Final"
    return 1, detail or "Scheduled"


def _format_game(event: dict) -> dict:
    """Transform ESPN event into our nba_api-compatible game format."""
    comp = (event.get("competitions") or [{}])[0]
    competitors = comp.get("competitors", [])
    home = next((c for c in competitors if c.get("homeAway") == "home"), {})
    away = next((c for c in competitors if c.get("homeAway") == "away"), {})

    def fmt_team(c: dict) -> dict:
        team = c.get("team", {})
        record_summary = ""
        records = c.get("records", [])
        if records:
            record_summary = records[0].get("summary", "")
        wins, losses = 0, 0
        if "-" in record_summary:
            try:
                wins, losses = map(int, record_summary.split("-")[:2])
            except (ValueError, IndexError):
                pass
        leader_name = ""
        leader_pts, leader_reb, leader_ast = 0, 0, 0
        for leader in c.get("leaders", []):
            if leader.get("name") == "rating":
                leaders_list = leader.get("leaders", [])
                if leaders_list:
                    athlete = leaders_list[0].get("athlete", {})
                    leader_name = athlete.get("displayName", "")
                    stats_str = leaders_list[0].get("displayValue", "")
                    for part in stats_str.split(","):
                        part = part.strip()
                        try:
                            num, label = part.split(" ", 1)
                            n = int(num)
                            if "PTS" in label.upper(): leader_pts = n
                            elif "REB" in label.upper(): leader_reb = n
                            elif "AST" in label.upper(): leader_ast = n
                        except (ValueError, IndexError):
                            pass
                break
        return {
            "teamId": TRICODE_TO_NBA_ID.get((team.get("abbreviation") or "").upper(), 0),
            "teamName": team.get("name", ""),
            "teamCity": team.get("location", ""),
            "teamTricode": team.get("abbreviation", ""),
            "wins": wins,
            "losses": losses,
            "score": int(c.get("score", 0) or 0),
            "seed": None,
            "_leader": {
                "name": leader_name,
                "points": leader_pts,
                "rebounds": leader_reb,
                "assists": leader_ast,
            },
        }

    home_obj = fmt_team(home)
    away_obj = fmt_team(away)
    home_leader = home_obj.pop("_leader")
    away_leader = away_obj.pop("_leader")

    game_status, game_status_text = _parse_espn_status(comp.get("status", {}))
    notes = comp.get("notes") or []
    series_text = notes[0].get("headline", "") if notes else ""

    return {
        "gameId": event.get("id", ""),
        "gameStatus": game_status,
        "gameStatusText": game_status_text,
        "gameLabel": "",
        "gameSubLabel": "",
        "seriesText": series_text,
        "seriesConference": "",
        "gameEt": event.get("date", ""),
        "homeTeam": home_obj,
        "awayTeam": away_obj,
        "gameLeaders": {
            "homeLeaders": home_leader,
            "awayLeaders": away_leader,
        },
    }


@router.get("/today")
async def get_today_scores():
    """Live scores via ESPN's public scoreboard API. Cached 30s."""
    cache_key = "games:today:espn"
    hit = await cache_get(cache_key)
    if hit:
        return hit

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                ESPN_SCOREBOARD_URL,
                headers={"User-Agent": "Mozilla/5.0 CourtIQ/1.0"},
            )
            resp.raise_for_status()
            espn_data = resp.json()

        events = espn_data.get("events", [])
        games = [_format_game(e) for e in events]

        out = {
            "meta": {"version": 1, "code": 200, "request": "", "time": ""},
            "scoreboard": {
                "gameDate": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                "leagueId": "00",
                "leagueName": "National Basketball Association",
                "games": games,
            },
        }
        await cache_set(cache_key, out, 30)
        return out
    except Exception as e:
        print(f"[games/today] ESPN scoreboard fetch failed: {e}")
        return {
            "meta": {"version": 1, "code": 200, "request": "", "time": ""},
            "scoreboard": {
                "gameDate": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                "leagueId": "00",
                "leagueName": "National Basketball Association",
                "games": [],
            },
        }


@router.get("/{game_id}/boxscore")
async def get_boxscore(game_id: str):
    """Boxscore not implemented for ESPN fallback yet."""
    return {"detail": "Boxscore not available for ESPN data source"}
