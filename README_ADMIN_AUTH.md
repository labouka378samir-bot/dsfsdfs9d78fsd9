# Admin Dashboard Credentials via .env

The admin dashboard uses an in-memory login that is independent from Supabase auth.
To keep credentials out of the codebase:

1. Copy `.env.example` to `.env` (or set env vars in your hosting provider).
2. Set:
   - `VITE_ADMIN_EMAIL`
   - `VITE_ADMIN_PASSWORD`
3. Restart the dev server (`npm run dev`) or redeploy.

> Note: Because this is a client-side app, env values are baked at build time.
  Do **not** commit your real values; configure them in the deployment environment.
