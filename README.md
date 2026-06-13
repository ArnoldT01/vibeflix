# VibeFlix

> Browse and watch movies and TV series — search, filter, and stream hassle free.

Live: [arnoldt01.github.io/vibeflix](https://arnoldt01.github.io/vibeflix)

---

## Features

- Browse movies, TV series, and anime with filters for genre, year, and rating
- Hero carousel — drag to scrub through featured titles
- Trending section (weekly, updates per media type)
- Detail pages with persistent player, trailer popup, cast grid, franchise and episode sections
- Live search across movies and TV
- Email/password auth (sign up with live password strength check + generator)
- Watchlist — save titles to watch later (requires account)
- Watch history — auto-recorded when you play something (requires account)
- Library page — tabbed view of watchlist and history

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router v7 |
| Styling | Tailwind CSS v4 |
| Auth & Database | Supabase |
| Data | TMDB API (proxied via Cloudflare Worker) |
| Hosting | GitHub Pages |

---

## Docs

- [Quick start guide](docs/quick_start_guide.md)
- [Cloudflare Worker proxy](docs/cloudflare-worker-proxy.md)
- [Supabase auth, watchlist & history](docs/supabase-auth.md)
