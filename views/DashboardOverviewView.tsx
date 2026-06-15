import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { listClients } from "@/features/clients/actions/client.action";
import { listDashboardProjectAssignments, listProjects } from "@/features/projects/actions/project.action";
import { listDashboardTasks } from "@/features/tasks/actions/task.action";
import { getCurrentProfile, listProfiles } from "@/features/users/actions/user.action";
import { CoreOverviewSection } from "@/sections/dashboard/CoreOverviewSection";

export async function DashboardOverviewView() {
  const profile = await getCurrentProfile();
  const [clients, projects, tasks, profiles] = await Promise.all([
    listClients(profile),
    listProjects(profile),
    listDashboardTasks(profile),
    listProfiles(profile)
  ]);
  const projectAssignments = await listDashboardProjectAssignments(profile, profiles);
  const header =
    profile?.role === "client"
      ? {
          title: "Client Dashboard",
          description: "Track project progress, open tasks, and ready final delivery links."
        }
      : profile?.role === "team_member"
        ? {
            title: "Team Dashboard",
            description: "Review assigned projects, open tasks, blocked work, and delivery updates."
          }
        : {
            title: "Admin Dashboard",
            description: "Manage client organizations, project delivery health, task workload, and user access."
          };

  return (
    <>
      <PageHeader title={header.title} description={header.description} />
      {!profile ? (
        <EmptyState
          title="Application profile required"
          description="Create a profile with this user's email in Users. It will link automatically on first login."
        />
      ) : (
        <CoreOverviewSection
          profile={profile}
          clients={clients}
          projects={projects}
          tasks={tasks}
          profiles={profiles}
          projectAssignments={projectAssignments}
        />
      )}
    </>
  );
}
