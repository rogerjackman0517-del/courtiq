from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    redis_url: str = "redis://localhost:6379"
    upstash_redis_rest_url: str = ""
    upstash_redis_rest_token: str = ""
    balldontlie_api_key: str = ""
    the_odds_api_key: str = ""
    cron_secret: str = ""
    allowed_origins: str = "http://localhost:3000,http://localhost:3001"
    cache_ttl_live: int = 30
    cache_ttl_stats: int = 3600
    cache_ttl_roster: int = 86400

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
