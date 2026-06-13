# Google OAuth Setup

Enables "Continue with Google" on the sign in / sign up modal.

---

## 1. Google Cloud Console

### Create a project
Go to [console.cloud.google.com](https://console.cloud.google.com) and create a new project named `vibeflix` (or use an existing one).

### Configure the consent screen
Before creating credentials you must set up the OAuth consent screen.

1. **APIs & Services → OAuth consent screen**
2. Choose **External** → **Create**
3. Fill in:
   - App name: `VibeFlix`
   - User support email: your email
   - Developer contact email: your email
4. **Save and continue** through Scopes and Test users (defaults are fine)
5. Back to dashboard

### Create OAuth credentials
1. **APIs & Services → Credentials → + Create credentials → OAuth client ID**
2. Application type: **Web application**
3. Name: `VibeFlix Web`
4. **Authorized JavaScript origins:**
   ```
   http://localhost:5173
   https://arnoldt01.github.io
   ```
5. **Authorized redirect URIs** — paste the callback URL from Supabase (see step 2 below):
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
6. Click **Create**
7. Copy the **Client ID** and **Client Secret**

---

## 2. Supabase

### Enable Google provider
1. **Authentication → Providers → Google** → toggle **Enable**
2. Paste the **Client ID** and **Client Secret** from Google
3. Copy the **Callback URL** shown — this is what you added to Google in step 1
4. Save

### Add site URL
1. **Authentication → URL Configuration**
2. Add to **Redirect URLs**:
   ```
   http://localhost:5173
   https://arnoldt01.github.io/vibeflix
   ```
3. Save

---

## 3. Test it

Run locally:
```bash
npm run dev
```

Open the app, click **Sign In**, then **Continue with Google**. It should redirect to Google, let you sign in, and bring you back to the app.
