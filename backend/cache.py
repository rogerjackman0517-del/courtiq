from __future__ import annotations
import json
import os
from functools import wraps
from typing import Optional

try:
    from upstash_redis.asyncio import Redis as UpstashRedis
except ImportError:
    UpstashRedis = None

_client: Optional["UpstashRedis"] = None
_disabled: bool = False


def _get_client():
    global _client, _disabled
    if _disabled:
        return None
    if _client is not None:
        return _client
    url = os.getenv("UPSTASH_REDIS_REST_URL")
    token = os.getenv("UPSTASH_REDIS_REST_TOKEN")
    if not url or not token or UpstashRedis is None:
        print("[cache] Upstash not configured, caching disabled")
        _disabled = True
        return None
    _client = UpstashRedis(url=url, token=token)
    return _client


async def cache_get(key: str):
    client = _get_client()
    if client is None:
        return None
    try:
        val = await client.get(key)
        return json.loads(val) if val else None
    except Exception as e:
        print(f"[cache] get failed: {e}")
        return None


async def cache_set(key: str, value, ttl: int):
    client = _get_client()
    if client is None:
        return
    try:
        await client.set(key, json.dumps(value), ex=ttl)
    except Exception as e:
        print(f"[cache] set failed: {e}")


async def cache_delete(key: str):
    """Evict a key. No-op if cache is disabled."""
    client = _get_client()
    if client is None:
        return
    try:
        await client.delete(key)
    except Exception as e:
        print(f"[cache] delete failed: {e}")


def cached(ttl: int, key_fn=None):
    def decorator(fn):
        @wraps(fn)
        async def wrapper(*args, **kwargs):
            cache_key = key_fn(*args, **kwargs) if key_fn else f"{fn.__module__}:{fn.__name__}:{args}:{kwargs}"
            hit = await cache_get(cache_key)
            if hit is not None:
                return hit
            result = await fn(*args, **kwargs)
            await cache_set(cache_key, result, ttl)
            return result
        return wrapper
    return decorator
