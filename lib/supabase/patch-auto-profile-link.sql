-- Run this once after the original schema if profiles.user_id is still required.
-- It allows Admin to create a profile by email before the Supabase Auth user exists.
-- On first login, the app links profiles.user_id automatically when email matches.

alter table public.profiles
alter column user_id drop not null;

drop index if exists profiles_user_id_idx;
create unique index if not exists profiles_user_id_unique_idx
on public.profiles(user_id)
where user_id is not null;

create index if not exists profiles_email_idx on public.profiles(lower(email));

create unique index if not exists profiles_email_unique_idx
on public.profiles(email);

drop policy if exists "profiles_claim_by_email_read" on public.profiles;
create policy "profiles_claim_by_email_read"
on public.profiles
for select
to authenticated
using (
  user_id is null
  and lower(email) = lower(auth.jwt() ->> 'email')
);

drop policy if exists "profiles_claim_by_email_update" on public.profiles;
create policy "profiles_claim_by_email_update"
on public.profiles
for update
to authenticated
using (
  user_id is null
  and lower(email) = lower(auth.jwt() ->> 'email')
)
with check (
  user_id = auth.uid()
  and lower(email) = lower(auth.jwt() ->> 'email')
);
