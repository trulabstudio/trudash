alter table public.clients
add column if not exists created_by_profile_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'clients_created_by_profile_id_fkey'
  ) then
    alter table public.clients
    add constraint clients_created_by_profile_id_fkey
    foreign key (created_by_profile_id) references public.profiles(id) on delete set null;
  end if;
end $$;

create index if not exists clients_created_by_profile_id_idx
on public.clients(created_by_profile_id);

drop policy if exists "clients_team_created_read" on public.clients;
create policy "clients_team_created_read"
on public.clients
for select
to authenticated
using (
  public.current_user_role() = 'team_member'
  and created_by_profile_id = public.current_profile_id()
);

drop policy if exists "clients_team_create" on public.clients;
create policy "clients_team_create"
on public.clients
for insert
to authenticated
with check (
  public.current_user_role() = 'team_member'
  and created_by_profile_id = public.current_profile_id()
);
