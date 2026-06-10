# TMDB API Proxy — Cloudflare Worker

Proxies TMDB API requests through a Cloudflare Worker so the API key never reaches the browser.

---

## How it works

Without a proxy, your TMDB API key is visible to anyone who opens DevTools:
```
Browser → api.themoviedb.org?api_key=SECRET
```

With the Worker:
```
Browser → vibeflix-movie-api.arnoldtee01.workers.dev → api.themoviedb.org?api_key=SECRET (hidden)
```

---

## Setup

### 1. Create a Cloudflare account
Sign up at cloudflare.com (free).

### 2. Create a Worker
Dashboard → **Workers & Pages** → **Start building** → **Start with Hello World** → name it `vibeflix-movie-api` → **Deploy**

### 3. Edit the Worker code
Click **Edit code** and replace everything with:

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const tmdbUrl = `https://api.themoviedb.org${url.pathname}${url.search}`;

    const response = await fetch(tmdbUrl, {
      headers: {
        Authorization: `Bearer ${env.TMDB_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  },
};
```

Click **Deploy**.

### 4. Add the API key as a secret
**Settings** → **Variables and secrets** → add variable:
- Type: **Secret**
- Name: `TMDB_API_KEY`
- Value: your TMDB Bearer token

Click **Deploy**.

### 5. Update .env
```
VITE_TMDB_BASE_URL=https://vibeflix-movie-api.arnoldtee01.workers.dev/3
```

Note: `/3` is included in the base URL — it's TMDB's API version prefix.

### 6. Code change
`src/lib/tmdb.js` already reads from `VITE_TMDB_BASE_URL`. No other changes needed.

---

## Testing

Visit this URL in your browser — it should return JSON movie data:
```
https://vibeflix-movie-api.arnoldtee01.workers.dev/3/movie/476926
```

---

## Worker URL
```
https://vibeflix-movie-api.arnoldtee01.workers.dev
```
