import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { listProjects } from "@/features/projects/actions/project.action";
import { listTasks } from "@/features/tasks/actions/task.action";
import { getCurrentProfile, listProfiles } from "@/features/users/actions/user.action";
import { canCreateTasks } from "@/lib/permissions/resources";
import { TaskCreateSection } from "@/sections/tasks/TaskCreateSection";
import { TasksListSection } from "@/sections/tasks/TasksListSection";

export async function TasksView() {
  const profile = await getCurrentProfile();
  const [projects, tasks, profiles] = await Promise.all([
    listProjects(profile),
    listTasks(profile),
    listProfiles(profile)
  ]);
  const teamMembers = profiles.filter((item) => item.role === "team_member");
  const canUpdateTasks = profile?.role === "admin" || profile?.role === "team_member";

  return (
    <>
      <PageHeader
        title="Tasks"
        description="Create tasks manually, import tasks by CSV, update status, and manage final delivery links. Tasks are sorted by nearest due date."
      />
      {canCreateTasks(profile) ? <TaskCreateSection projects={projects} teamMembers={teamMembers} /> : null}
      {!profile ? (
        <EmptyState
          title="Application profile required"
          description="Create a profile with this user's email in Users. It will link automatically on first login."
        />
      ) : (
        <TasksListSection tasks={tasks} canUpdate={canUpdateTasks} canManage={canCreateTasks(profile)} />
      )}
    </>
  );
}
