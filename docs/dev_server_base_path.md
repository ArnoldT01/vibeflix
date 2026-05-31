## Dev Server Base Path

The app is configured with `base: "/vibeflix"` in `vite.config.js` so it deploys correctly to GitHub Pages at `/vibeflix/`.

This base path also applies in local development, so you **must** access the dev server at:

```
http://localhost:5173/vibeflix/
```

### Why this matters

Static assets in the `public/` folder (icons, images, SVGs) are served relative to the base path. If you open `http://localhost:5173/` instead, the browser resolves relative asset paths against the wrong root and every asset returns a **404**.

### Common symptom

```
search.svg — Failed to load resource: 404 (Not Found)
star.svg   — Failed to load resource: 404 (Not Found)
```

### Fix

Just make sure the URL in your browser includes `/vibeflix/` after the port. No code changes needed.
