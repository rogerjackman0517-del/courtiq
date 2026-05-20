from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from config import settings
from routes import players, teams, games, stats, news, draft

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="CourtIQ API",
    description="NBA analytics data layer — wraps nba_api, BallDontLie, and The Odds API",
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins.split(","),
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(players.router)
app.include_router(teams.router)
app.include_router(games.router)
app.include_router(stats.router)
app.include_router(news.router)
app.include_router(draft.router)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/cron/refresh")
async def cron_refresh(secret: str = ""):
    """Warm critical caches. Called by a Railway cron job every hour.

    Protected by a shared secret in the CRON_SECRET env var so the endpoint
    can't be hammered by anyone who finds the URL.
    """
    expected = settings.cron_secret if hasattr(settings, "cron_secret") else ""
    if expected and secret != expected:
        return JSONResponse(status_code=401, content={"error": "unauthorized"})

    refreshed: dict[str, str] = {}

    # Refresh the things most pages depend on. Best-effort — partial success
    # is fine because individual endpoints will lazily refill on miss.
    try:
        from cache import cache_delete
        for key in [
            "players:with-stats:2025-26",
            "teams:records:hc:2025-26",
            "stats:leaders",
        ]:
            await cache_delete(key)
            refreshed[key] = "evicted"
    except Exception as e:
        refreshed["_error"] = str(e)

    return {"refreshed": refreshed, "timestamp": __import__("datetime").datetime.utcnow().isoformat()}


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": str(exc)})
