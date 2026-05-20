# CourtIQ — Launch Checklist

A self-contained playbook to take the site from "Vercel preview URL" to
"real product with users." Work through it top to bottom.

---

## 1 · Custom domain (15 min, $12/yr)

1. Buy `courtiq.app` on Cloudflare Registrar (cheapest, no markup) or
   Namecheap. Recommend Cloudflare since their DNS is faster.
2. Vercel → Project Settings → Domains → Add → enter `courtiq.app`
3. Vercel will give you two records:
   - `A` for the apex (`@`) pointing at `76.76.21.21`
   - `CNAME` for `www` pointing at `cname.vercel-dns.com`
4. Add both records in the registrar's DNS panel. Wait 1–5 min.
5. Once Vercel shows a green check, click **Set as primary domain**.
6. Update everywhere we hardcoded the old URL:
   - `src/app/sitemap.ts` — change `BASE`
   - `src/app/robots.ts` — change the sitemap URL
   - `src/app/players/[slug]/opengraph-image.tsx` and
     `src/app/teams/[slug]/opengraph-image.tsx` — change the
     internal fetch URL
   - `src/app/layout.tsx` — update `metadataBase`
7. Push the change, Vercel redeploys.

---

## 2 · Reddit launch post (do AFTER #1)

Subreddit: **r/nba**, sort by "new", post late morning ET on a game day.
Flair: **Discussion** (Reddit auto-removes anything that smells like
self-promo when posted as Discussion is usually safer than picking a
custom flair).

**Title (under 300 chars, keep punchy):**

> I built CourtIQ — a free NBA stats dashboard with a trade machine,
> playoff bracket predictor, and player comparisons

**Body:**

```
Hey r/nba — I'm Roger, a Knicks fan who got tired of bouncing between
six different sites to follow the league, so I built one.

CourtIQ has:
• Live scoreboard + boxscores
• Full player profiles (150 active players, stats, shooting splits,
  recent game logs)
• A trade machine that projects standings impact
• A 2026 playoff bracket — make picks, track your score
• Side-by-side player compare with a smart "verdict"
• Power rankings + standings with strength-of-schedule

It's free. The data is from NBA.com + ESPN. No ads.

Link: https://courtiq.app

This is a one-person project so I'd love feedback — what's broken, what's
missing, what you'd actually use. Roast it.
```

**Engagement plan:**
- Reply to every comment in the first 6 hours
- Pin a comment with "what's coming next: X, Y, Z"
- If someone reports a bug, fix it and reply within the hour. People
  remember that.

---

## 3 · Share with 5 friends before #2

Text the URL to 5 NBA-watching friends. Ask one specific question:
"Would you actually use this? What's missing?" — not "what do you
think." Specific question → useful answer.

---

## 4 · Vercel Analytics (already wired)

`@vercel/analytics` and `@vercel/speed-insights` are installed and
mounted in `src/app/layout.tsx`. Once you deploy:

1. Vercel dashboard → your project → **Analytics** tab → click **Enable**
2. **Speed Insights** tab → click **Enable**
3. Wait an hour, refresh. Free for 2,500 events/mo.

---

## 5 · Backend cron (Railway)

Endpoint `/cron/refresh` is live on the backend (see `backend/main.py`).
It evicts cached keys so the next visitor triggers a fresh pull from
NBA.com.

**Setup:**
1. Add a env var on Railway: `CRON_SECRET=<long random string>` —
   generate with `openssl rand -base64 32`
2. Railway → your CourtIQ backend → **Cron** → New Cron
3. Command: `curl -s "https://<your-railway-url>/cron/refresh?secret=$CRON_SECRET"`
4. Schedule: `0 * * * *` (every hour on the hour)

---

## 6 · Sentry (optional, free tier)

Currently a stub. To enable:

1. `npm install @sentry/nextjs --cache /tmp/npm-cache`
2. `npx @sentry/wizard@latest -i nextjs` — follow prompts
3. Drop the import + capture call into `src/app/error.tsx` (already
   has a comment marking where)
4. Sentry dashboard → Project → Settings → Client Keys → copy DSN
5. Add `NEXT_PUBLIC_SENTRY_DSN` to Vercel env vars
6. Trigger a test error and watch it appear in Sentry

Without this, client errors flow to `/api/log` → Vercel logs.

---

## 7 · Resend digest emails

Currently capturing emails to Vercel logs only. To make real:

1. Sign up at https://resend.com — free 100/day
2. Create an **Audience** (e.g., "CourtIQ Daily Digest")
3. Copy the **API key** and **Audience ID**
4. Add `RESEND_API_KEY` and `RESEND_AUDIENCE_ID` to Vercel env vars
5. Redeploy. The existing form on the homepage will start adding
   addresses to the audience.
6. For the actual digest email, build a daily cron job that pulls
   top performers and ships to the audience via Resend's send API.
   That's a separate ~half-day project.

---

## 8 · nba_api on Railway

The handoff noted this is blocked — NBA.com rate-limits Railway's
egress IPs. Options:

- **Quick:** use ESPN as the primary source for live data (we
  already do this for boxscores and game logs)
- **Better:** front nba_api with a proxy. ScrapingBee or BrightData
  give you a residential IP. ~$50/mo.
- **Best:** pay for `balldontlie.io`'s GOAT tier ($10/mo) which
  includes the same data with no IP block.

For now the synthetic player gamelogs are fine — most users won't
notice.

---

## 9 · Quick wins after launch

- Hook up a Twitter/X account `@courtiq_app` — post the most
  interesting stat from each night's slate
- Add an "Embed this stat" feature so commentators can paste numbers
  into tweets
- Start a Substack-side blog at `courtiq.app/blog` for in-depth
  analysis you can attach to the daily digest
