do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'tool_key'
  ) then
    create type public.tool_key as enum ('qr_generator', 'background_remover');
  end if;
end $$;

alter table public.profiles
add column if not exists tool_tokens integer not null default 0;

alter table public.profiles
drop constraint if exists profiles_tool_tokens_check;

alter table public.profiles
add constraint profiles_tool_tokens_check check (tool_tokens >= 0);

create table if not exists public.tool_download_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  tool public.tool_key not null,
  tokens_spent integer not null check (tokens_spent > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.tool_settings (
  id text primary key default 'default',
  default_client_tokens integer not null default 20 check (default_client_tokens >= 0),
  qr_download_cost integer not null default 1 check (qr_download_cost >= 0),
  background_remover_download_cost integer not null default 2 check (background_remover_download_cost >= 0),
  price_per_10_tokens_rm numeric(10,2) not null default 10 check (price_per_10_tokens_rm >= 0),
  bank_name text not null default 'Maybank',
  bank_account_number text not null default '552023021990',
  bank_account_name text not null default 'TRULAB PRODUCTION',
  whatsapp_number text not null default '60176982032',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.tool_settings (id)
values ('default')
on conflict (id) do nothing;

create index if not exists tool_download_events_profile_id_idx
on public.tool_download_events(profile_id);

create index if not exists tool_download_events_tool_idx
on public.tool_download_events(tool);

alter table public.tool_download_events enable row level security;
alter table public.tool_settings enable row level security;

drop trigger if exists tool_settings_set_updated_at on public.tool_settings;
create trigger tool_settings_set_updated_at
before update on public.tool_settings
for each row execute function public.set_updated_at();

update public.profiles
set tool_tokens = (
  select default_client_tokens
  from public.tool_settings
  where id = 'default'
)
where role = 'client'
  and tool_tokens = 0
  and not exists (
    select 1
    from public.tool_download_events
    where tool_download_events.profile_id = profiles.id
  );

drop policy if exists "tool_download_events_admin_all" on public.tool_download_events;
create policy "tool_download_events_admin_all"
on public.tool_download_events
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "tool_download_events_client_own_read" on public.tool_download_events;
create policy "tool_download_events_client_own_read"
on public.tool_download_events
for select
to authenticated
using (profile_id = public.current_profile_id());

drop policy if exists "tool_settings_read" on public.tool_settings;
create policy "tool_settings_read"
on public.tool_settings
for select
to authenticated
using (true);

drop policy if exists "tool_settings_admin_all" on public.tool_settings;
create policy "tool_settings_admin_all"
on public.tool_settings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
