import httpx
import re
from fastapi import APIRouter, HTTPException
from cache import cache_get, cache_set
from config import settings

router = APIRouter(prefix="/news", tags=["news"])

NBA_RSS_URL = "https://www.espn.com/espn/rss/nba/news"


def _strip_tags(s: str) -> str:
    return re.sub(r"<[^>]+>", "", s or "").strip()


def _parse_rss(xml: str) -> list:
    """Lightweight RSS parser — pulls items without external deps."""
    items = []
    for m in re.finditer(r"<item>(.*?)</item>", xml, re.DOTALL):
        block = m.group(1)
        def get(tag):
            m2 = re.search(rf"<{tag}[^>]*>(.*?)</{tag}>", block, re.DOTALL)
            if not m2:
                return ""
            raw = m2.group(1)
            # Handle CDATA
            cdata = re.match(r"\s*<!\[CDATA\[(.*?)\]\]>\s*", raw, re.DOTALL)
            if cdata:
                return cdata.group(1).strip()
            return _strip_tags(raw)
        # Look for image in enclosure or media:content
        img = ""
        m_enc = re.search(r'<enclosure[^>]*url="([^"]+)"', block)
        if m_enc:
            img = m_enc.group(1)
        else:
            m_media = re.search(r'<media:content[^>]*url="([^"]+)"', block)
            if m_media:
                img = m_media.group(1)
        items.append({
            "title": get("title"),
            "link":  get("link"),
            "pubDate": get("pubDate"),
            "description": get("description"),
            "image": img,
        })
    return items


@router.get("/feed")
async def get_news_feed():
    cache_key = "news:nba:rss"
    hit = await cache_get(cache_key)
    if hit:
        return hit
    try:
        async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
            resp = await client.get(NBA_RSS_URL, headers={"User-Agent": "Mozilla/5.0 CourtIQ/1.0"})
            resp.raise_for_status()
            items = _parse_rss(resp.text)[:30]
        await cache_set(cache_key, items, 600)  # 10 min
        return items
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"RSS fetch error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
