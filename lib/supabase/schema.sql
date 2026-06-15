create extension if not exists "pgcrypto";

create type public.user_role as enum ('admin', 'team_member', 'client');
create type public.account_status as enum ('active', 'inactive');
create type public.project_status as enum ('not_started', 'in_progress', 'completed', 'on_hold');
create type public.task_status as enum ('todo', 'in_progress', 'completed', 'blocked');
create type public.notification_status as enum ('pending', 'sent', 'failed');
create type public.tool_key as enum ('qr_generator', 'background_remover');

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_person text,
  email text not null,
  phone_number text,
  created_by_profile_id uuid,
  login_access boolean not null default false,
  account_status public.account_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  full_name text,
  email text not null,
  role public.user_role not null,
  client_id uuid references public.clients(id) on delete set null,
  account_status public.account_status not null default 'active',
  tool_tokens integer not null default 0 check (tool_tokens >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.clients
add constraint clients_created_by_profile_id_fkey
foreign key (created_by_profile_id) references public.profiles(id) on delete set null;

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  project_name text not null,
  description text,
  start_date date,
  due_date date,
  status public.project_status not null default 'not_started',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_assignments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (project_id, profile_id)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  assigned_to_profile_id uuid references public.profiles(id) on delete set null,
  task_name text not null,
  description text,
  due_date date,
  status public.task_status not null default 'todo',
  final_link text,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notification_events (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  event_type text not null,
  recipient_email text not null,
  status public.notification_status not null default 'pending',
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create table public.tool_download_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  tool public.tool_key not null,
  tokens_spent integer not null check (tokens_spent > 0),
  created_at timestamptz not null default now()
);

create table public.tool_settings (
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

create index profiles_user_id_idx on public.profiles(user_id);
create index profiles_role_idx on public.profiles(role);
create index profiles_client_id_idx on public.profiles(client_id);
create unique index profiles_email_unique_idx on public.profiles(email);
create index clients_email_idx on public.clients(email);
create index clients_created_by_profile_id_idx on public.clients(created_by_profile_id);
create index projects_client_id_idx on public.projects(client_id);
create index projects_status_idx on public.projects(status);
create index project_assignments_project_id_idx on public.project_assignments(project_id);
create index project_assignments_profile_id_idx on public.project_assignments(profile_id);
create index tasks_project_id_idx on public.tasks(project_id);
create index tasks_assigned_to_profile_id_idx on public.tasks(assigned_to_profile_id);
create index tasks_status_idx on public.tasks(status);
create index notification_events_task_id_idx on public.notification_events(task_id);
create index notification_events_status_idx on public.notification_events(status);
create index tool_download_events_profile_id_idx on public.tool_download_events(profile_id);
create index tool_download_events_tool_idx on public.tool_download_events(tool);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger clients_set_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

create trigger tool_settings_set_updated_at
before update on public.tool_settings
for each row execute function public.set_updated_at();

create or replace function public.current_profile_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select id from public.profiles where user_id = auth.uid() limit 1;
$$;

create or replace function public.current_user_role()
returns public.user_role
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where user_id = auth.uid() limit 1;
$$;

create or replace function public.current_client_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select client_id from public.profiles where user_id = auth.uid() limit 1;
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.current_user_role() = 'admin';
$$;

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.project_assignments enable row level security;
alter table public.tasks enable row level security;
alter table public.notification_events enable row level security;
alter table public.tool_download_events enable row level security;
alter table public.tool_settings enable row level security;

create policy "profiles_admin_all"
on public.profiles
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "profiles_read_own"
on public.profiles
for select
to authenticated
using (user_id = auth.uid());

create policy "profiles_claim_by_email_read"
on public.profiles
for select
to authenticated
using (
  user_id is null
  and lower(email) = lower(auth.jwt() ->> 'email')
);

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

create policy "tool_download_events_admin_all"
on public.tool_download_events
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "tool_download_events_client_own_read"
on public.tool_download_events
for select
to authenticated
using (profile_id = public.current_profile_id());

create policy "tool_settings_read"
on public.tool_settings
for select
to authenticated
using (true);

create policy "tool_settings_admin_all"
on public.tool_settings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "clients_admin_all"
on public.clients
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "clients_team_assigned_read"
on public.clients
for select
to authenticated
using (
  public.current_user_role() = 'team_member'
  and exists (
    select 1
    from public.projects
    join public.project_assignments on project_assignments.project_id = projects.id
    where projects.client_id = clients.id
      and project_assignments.profile_id = public.current_profile_id()
  )
);

create policy "clients_team_created_read"
on public.clients
for select
to authenticated
using (
  public.current_user_role() = 'team_member'
  and created_by_profile_id = public.current_profile_id()
);

create policy "clients_team_create"
on public.clients
for insert
to authenticated
with check (
  public.current_user_role() = 'team_member'
  and created_by_profile_id = public.current_profile_id()
);

create policy "clients_client_own_read"
on public.clients
for select
to authenticated
using (id = public.current_client_id());

create policy "projects_admin_all"
on public.projects
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "projects_team_assigned_read"
on public.projects
for select
to authenticated
using (
  public.current_user_role() = 'team_member'
  and exists (
    select 1
    from public.project_assignments
    where project_assignments.project_id = projects.id
      and project_assignments.profile_id = public.current_profile_id()
  )
);

create policy "projects_client_own_read"
on public.projects
for select
to authenticated
using (client_id = public.current_client_id());

create policy "project_assignments_admin_all"
on public.project_assignments
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "project_assignments_team_own_read"
on public.project_assignments
for select
to authenticated
using (profile_id = public.current_profile_id());

create policy "tasks_admin_all"
on public.tasks
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "tasks_team_assigned_read"
on public.tasks
for select
to authenticated
using (
  public.current_user_role() = 'team_member'
  and assigned_to_profile_id = public.current_profile_id()
);

create policy "tasks_team_assigned_update"
on public.tasks
for update
to authenticated
using (
  public.current_user_role() = 'team_member'
  and assigned_to_profile_id = public.current_profile_id()
)
with check (
  public.current_user_role() = 'team_member'
  and assigned_to_profile_id = public.current_profile_id()
);

create policy "tasks_client_project_read"
on public.tasks
for select
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = tasks.project_id
      and projects.client_id = public.current_client_id()
  )
);

create policy "notification_events_admin_read"
on public.notification_events
for select
to authenticated
using (public.is_admin());
