do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'share_resource_type'
  ) then
    create type public.share_resource_type as enum ('project', 'task');
  end if;
end $$;

create table if not exists public.share_links (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  resource_type public.share_resource_type not null,
  resource_id uuid not null,
  created_by_profile_id uuid not null references public.profiles(id) on delete cascade,
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (resource_type, resource_id, created_by_profile_id)
);

create index if not exists share_links_token_idx
on public.share_links(token);

create index if not exists share_links_resource_idx
on public.share_links(resource_type, resource_id);

create index if not exists share_links_created_by_profile_id_idx
on public.share_links(created_by_profile_id);

alter table public.share_links enable row level security;

drop trigger if exists share_links_set_updated_at on public.share_links;
create trigger share_links_set_updated_at
before update on public.share_links
for each row execute function public.set_updated_at();

drop policy if exists "share_links_owner_all" on public.share_links;
create policy "share_links_owner_all"
on public.share_links
for all
to authenticated
using (created_by_profile_id = public.current_profile_id())
with check (created_by_profile_id = public.current_profile_id());

drop policy if exists "share_links_admin_all" on public.share_links;
create policy "share_links_admin_all"
on public.share_links
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
