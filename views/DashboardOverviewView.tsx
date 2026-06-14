import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { listClients } from "@/features/clients/actions/client.action";
import { listProjects } from "@/features/projects/actions/project.action";
import { listTasks } from "@/features/tasks/actions/task.action";
import { getCurrentProfile } from "@/features/users/actions/user.action";
import { CoreOverviewSection } from "@/sections/dashboard/CoreOverviewSection";

export async function DashboardOverviewView() {
  const profile = await getCurrentProfile();
  const [clients, projects, tasks] = await Promise.all([
    listClients(profile),
    listProjects(profile),
    listTasks(profile)
  ]);
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
            description: "Manage client accounts, project delivery health, task workload, and user access."
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
        <CoreOverviewSection profile={profile} clients={clients} projects={projects} tasks={tasks} />
      )}
    </>
  );
}
