## Quick Start Guide

### 1. Clone and install

```bash
git clone https://github.com/ArnoldT01/vibeflix.git
cd vibeflix
npm i
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```
VITE_TMDB_BASE_URL=https://vibeflix-movie-api.arnoldtee01.workers.dev/3
VITE_PLAYER_URL=your_player_base_url
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

- `VITE_TMDB_BASE_URL` — Cloudflare Worker proxy for TMDB (see [cloudflare-worker-proxy.md](cloudflare-worker-proxy.md))
- `VITE_PLAYER_URL` — base URL for the video embed player
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — from your Supabase project dashboard under Settings → API (see [supabase-auth.md](supabase-auth.md))

### 3. Run locally

```bash
npm run dev
```

### 4. Deploy to GitHub Pages

```bash
npm run deploy
```
