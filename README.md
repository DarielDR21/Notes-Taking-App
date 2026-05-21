# Notes Taking App

A private Next.js notes app backed by Supabase Auth, Postgres row-level security, and full-text search.

## Stack

- Next.js App Router, React 19, TypeScript, Tailwind CSS
- shadcn/ui primitives
- Supabase Auth and Postgres
- Server Actions for note mutations
- Vitest for focused helper tests

## Hosted Supabase Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Supabase project at `https://supabase.com/dashboard`.

3. Apply the database migration without Docker. The automatic CLI path is preferred:

   ```bash
   npx supabase login
   npx supabase link --project-ref your-project-ref
   npx supabase db push --linked --dry-run
   npx supabase db push --linked
   ```

   Your project ref is the short ID in your Supabase URL:

   ```text
   https://your-project-ref.supabase.co
   ```

   If the CLI asks for the database password, use the database password from your Supabase project settings.

   You can also apply it manually:

   - Open the Supabase Dashboard.
   - Go to **SQL Editor**.
   - Copy the contents of `supabase/migrations/20260521170021_create_notes.sql`.
   - Paste and run it once.

4. Copy `.env.local.example` to `.env.local`:

   ```bash
   cp .env.local.example .env.local
   ```

5. Fill in the values from **Project Settings > API**:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_SITE_URL`, usually `http://localhost:3000` while developing on the same computer

6. In **Authentication > URL Configuration**, add your local callback as a redirect URL:

   ```text
   http://localhost:3000/auth/confirm
   ```

   If you click confirmation emails on a phone, use a public tunnel or deployed URL instead of `localhost`, because your phone cannot open your computer's localhost.

7. Start Next.js:

   ```bash
   npm run dev
   ```

Open `http://localhost:3000`, create an account, and start writing notes.

If email confirmation is enabled in Supabase, signup will ask you to confirm your email before signing in.

## Useful Commands

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Supabase Model

The `public.notes` table belongs to `auth.users`, has RLS enabled, and grants CRUD only to authenticated users operating on their own rows. Search uses a generated `tsvector` column over note title and body.
