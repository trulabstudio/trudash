# Live Ready Checklist

## Required Environment Variables

Set these in local `.env.local` and in the hosting provider:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

`NEXT_PUBLIC_SITE_URL` should be the production URL. It is used by password recovery redirects.
`SUPABASE_SERVICE_ROLE_KEY` must stay server-only. It is required when Admin creates a user login with a password.

## Supabase Setup

1. Run `lib/supabase/schema.sql` in Supabase SQL Editor.
2. Create the first Admin profile by email with `lib/supabase/bootstrap-admin.sql`.
3. Create or invite the matching Admin user in Supabase Authentication.
4. On first login, the profile links automatically by matching email.
5. Log in at `/login`.
6. Use `/dashboard/users` to add profiles for Team Members and Clients.

For an existing database where `profiles.user_id` is still required, run `lib/supabase/patch-auto-profile-link.sql` once.

## MVP Verification

- Unauthenticated dashboard routes redirect to `/login`.
- Admin can create clients, projects, tasks, and user profiles.
- Team Member can only see assigned projects/tasks.
- Client can only see their own client projects/tasks.
- Client task queries do not select `internal_notes`.
- Project progress is calculated from completed tasks.
- Final delivery links are visible only through authenticated task access.
- User profiles can be created without entering Supabase Auth user IDs.
- Admin can create a user login with a temporary password when the service role key is configured.
- Every logged-in role can update their own display name and password in Account Settings.

## Pre-Deploy Commands

Run these before every deployment:

```bash
npm run lint
npm run typecheck
npm run build
```
