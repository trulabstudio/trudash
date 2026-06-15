create index if not exists projects_due_date_idx
on public.projects(due_date);

create index if not exists projects_client_id_due_date_idx
on public.projects(client_id, due_date);

create index if not exists tasks_due_date_idx
on public.tasks(due_date);

create index if not exists tasks_project_id_due_date_idx
on public.tasks(project_id, due_date);

create index if not exists tasks_assigned_to_profile_id_due_date_idx
on public.tasks(assigned_to_profile_id, due_date);

create index if not exists tool_download_events_profile_id_tool_idx
on public.tool_download_events(profile_id, tool);

create or replace view public.tool_download_counts as
select
  profile_id,
  count(*) filter (where tool = 'qr_generator')::integer as qr_download_count,
  count(*) filter (where tool = 'background_remover')::integer as background_remover_download_count,
  count(*)::integer as total_download_count
from public.tool_download_events
group by profile_id;
