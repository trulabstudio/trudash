# Supabase

This folder contains Supabase client setup and database setup SQL for TRUDASH.

## Local Environment

Create `.env.local` in the project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only. Do not expose it with a `NEXT_PUBLIC_` prefix.

## Database Setup

Run `lib/supabase/schema.sql` in the Supabase SQL editor for a fresh project.

Create application profiles by email in `/dashboard/users`. The profile links to the Supabase Auth user automatically on first login when the email matches.

For an existing database created before auto-linking, run:

```sql
-- lib/supabase/patch-auto-profile-link.sql
```

For manual bootstrap, insert the first Admin profile:

```sql
insert into public.profiles (full_name, email, role, account_status)
values ('Admin User', 'admin@example.com', 'admin', 'active');
```

Client users should have `role = 'client'` and `client_id` pointing to their client company.

For the first Admin user, copy `lib/supabase/bootstrap-admin.sql`, replace the placeholder email, and run it in Supabase SQL Editor.
