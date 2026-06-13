# Supabase Auth, Watchlist & History

VibeFlix uses Supabase for user authentication and to persist watchlist and watch history per user. The site is fully usable without an account — auth is only required to save titles.

---

## 1. Create a Supabase project

Sign up at [supabase.com](https://supabase.com) and create a new project. Once ready, go to **Settings → API** and copy:

- **Project URL** → `VITE_SUPABASE_URL`
- **anon public key** → `VITE_SUPABASE_ANON_KEY`

Add both to your `.env` file.

---

## 2. Create the database tables

Open **SQL Editor** in your Supabase dashboard and run:

```sql
create table watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  media_type text not null,
  media_id text not null,
  title text,
  poster_path text,
  created_at timestamptz default now()
);

create table history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  media_type text not null,
  media_id text not null,
  title text,
  poster_path text,
  watched_at timestamptz default now(),
  unique (user_id, media_type, media_id)
);

alter table watchlist enable row level security;
alter table history enable row level security;

create policy "own watchlist" on watchlist for all using (auth.uid() = user_id);
create policy "own history"   on history   for all using (auth.uid() = user_id);
```

Row-level security ensures users can only read and write their own rows.

---

## 3. Enable email auth

**Authentication → Providers → Email** is enabled by default. No extra configuration needed.

---

## How it works in the app

| Feature | Behaviour |
|---|---|
| **Sign In / Sign Up** | Modal accessible via the nav. Signup enforces a password strength check with live feedback. Includes a password generator. |
| **Watchlist** | `+ Watchlist` button on every movie/TV page. Toggles add/remove. Prompts login if not signed in. |
| **History** | Auto-recorded when the video player is loaded. Stored once per title (upsert on re-watch). |
| **Library page** | `/library` — tabbed view of Watchlist and History. Accessible from the user menu in the nav. |

---

## User menu

- **Signed out** — "Sign In" link in the nav opens the auth modal.
- **Signed in** — avatar circle (first letter of email) opens a dropdown with **My Library** and **Sign Out**.
