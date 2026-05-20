# CourtIQ

NBA stats, scoreboard, and analytics — built for fans who love the numbers.

**Live:** [courtiq-mocha.vercel.app](https://courtiq-mocha.vercel.app)
(soon: [courtiq.app](https://courtiq.app))

---

## What it does

- **Scores + boxscores** — live, today, any past date
- **150 active players** with full per-game stats, sortable, searchable, with mini sparklines
- **Player profiles** — radar chart, shot zones, last-10 game log heatmap, head-to-head compare
- **Trade Machine** — swap any two players, see projected standings impact
- **2026 Playoff Bracket** — pickable, scored against real results
- **Power Rankings** with playoff penalty
- **Pro tier ($9.99/mo)** — Lineup Explorer, more coming
- **User Dashboard** — favorite team, pinned players, bracket picks
- **Cmd-K** command palette anywhere

## Stack

| Layer | Tech |
| --- | --- |
| Frontend | Next.js 16 · React 19 · Tailwind 4 · TypeScript |
| Backend | FastAPI (Python 3.11) on Railway |
| Cache | Upstash Redis |
| Auth | Clerk |
| Payments | Stripe |
| Data | NBA.com (via [nba_api](https://github.com/swar/nba_api)) · ESPN public endpoints |
| Hosting | Vercel (frontend) · Railway (backend) |
| Analytics | Vercel Analytics + Speed Insights |

## Local development

**Frontend:**

```bash
npm install
cp .env.local.example .env.local   # fill in keys (see LAUNCH.md)
npm run dev                         # http://localhost:3001
```

**Backend:**

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env                # fill in Upstash + BallDontLie keys
uvicorn main:app --reload --port 8000
```

The frontend talks to the backend via `NBA_BACKEND_URL` in `.env.local`.

## Project structure

```
src/
  app/                    # Next.js app router
    (pages)/              # each route is a folder with page.tsx
    api/                  # API routes proxy backend + handle webhooks
  components/             # shared UI
  lib/                    # hooks, helpers, data files
backend/
  main.py                 # FastAPI app
  routes/                 # one file per API namespace
  cache.py                # Upstash wrapper
```

## Deploying

See [LAUNCH.md](./LAUNCH.md) for the full playbook — custom domain,
cron, Sentry, Resend, Reddit launch post.

## Built by

[Roger Jackman](https://github.com/rogerjackman0517-del) · Portland, OR ·
Knicks fan.

PRs and feedback welcome.
