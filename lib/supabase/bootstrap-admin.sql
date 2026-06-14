-- Run this after creating the first Supabase Auth user.
-- Replace the values below with the first Admin email.

insert into public.profiles (full_name, email, role, account_status)
values (
  'Admin User',
  'admin@example.com',
  'admin',
  'active'
)
on conflict (email) do update
set
  full_name = excluded.full_name,
  email = excluded.email,
  role = 'admin',
  account_status = 'active',
  updated_at = now();
