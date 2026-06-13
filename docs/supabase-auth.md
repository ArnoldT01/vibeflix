# Supabase Auth, Watchlist, History & Watch Party

VibeFlix uses Supabase for user authentication and to persist watchlist, watch history, and watch party rooms. The site is fully usable without an account — auth is only required to save titles or start a watch party.

---

## 1. Create a Supabase project

Sign up at [supabase.com](https://supabase.com) and create a new project. Once ready, go to **Settings → API** and copy:

- **Project URL** → `VITE_SUPABASE_URL`
- **anon public key** → `VITE_SUPABASE_ANON_KEY`

Add both to your `.env` file.

---

## 2. Create the database tables

Open **SQL Editor** in your Supabase dashboard and run all of the following:

```sql
-- Watchlist
create table watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  media_type text not null,
  media_id text not null,
  title text,
  poster_path text,
  created_at timestamptz default now()
);

-- Watch history
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

-- Watch party rooms
create table watch_rooms (
  id uuid primary key default gen_random_uuid(),
  room_code text unique not null,
  host_id uuid references auth.users(id) on delete cascade not null,
  host_name text,
  media_type text not null,
  media_id text not null,
  title text,
  poster_path text,
  season int default 1,
  episode int default 1,
  is_started boolean default false,
  created_at timestamptz default now(),
  last_active timestamptz default now()
);

-- Watch party chat
create table room_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references watch_rooms(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  display_name text not null,
  content text not null,
  created_at timestamptz default now()
);

-- RLS
alter table watchlist    enable row level security;
alter table history      enable row level security;
alter table watch_rooms  enable row level security;
alter table room_messages enable row level security;

create policy "own watchlist"  on watchlist    for all using (auth.uid() = user_id);
create policy "own history"    on history      for all using (auth.uid() = user_id);

create policy "read rooms"     on watch_rooms  for select using (auth.uid() is not null);
create policy "host insert"    on watch_rooms  for insert with check (auth.uid() = host_id);
create policy "host update"    on watch_rooms  for update using (auth.uid() = host_id);
create policy "host delete"    on watch_rooms  for delete using (auth.uid() = host_id);

create policy "read messages"  on room_messages for select using (auth.uid() is not null);
create policy "send messages"  on room_messages for insert with check (auth.uid() = user_id);
```

---

## 3. Enable Realtime for watch party tables

In Supabase dashboard → **Database → Replication**, enable Realtime for:
- `watch_rooms`
- `room_messages`

This is required for the watch party sync to work.

---

## 4. Enable email auth

**Authentication → Providers → Email** is enabled by default. No extra configuration needed.

---

## How it works in the app

| Feature | Behaviour |
|---|---|
| **Sign In / Sign Up** | Modal accessible via the nav. Signup enforces a password strength check with live feedback. Includes a password generator. |
| **Watchlist** | `+ Watchlist` button on every movie/TV page. Toggles add/remove. Prompts login if not signed in. |
| **History** | Auto-recorded when the video player is loaded. Stored once per title (upsert on re-watch). |
| **Library page** | `/library` — tabbed view of Watchlist and History. Accessible from the user menu in the nav. |
| **Watch Party** | `👥 Watch Party` button on every movie/TV page. Creates a room and navigates to `/watch/{roomCode}`. Share the URL to invite others. Host controls start and episode; guests sync automatically. Includes real-time chat. |

---

## Watch party architecture

- **Supabase Realtime Broadcast** — used for live sync events (start, episode change, chat messages) between all room participants
- **Supabase Presence** — tracks who is currently in the room
- **`watch_rooms` table** — persists room state so late joiners can catch up (current episode, is_started)
- **`room_messages` table** — persists chat history

The host is the only one who can start playback or change episodes. Guests receive sync events and their player updates automatically.

---

## User menu

- **Signed out** — "Sign In" link in the nav opens the auth modal.
- **Signed in** — avatar circle (first letter of email) opens a dropdown with **My Library** and **Sign Out**.
