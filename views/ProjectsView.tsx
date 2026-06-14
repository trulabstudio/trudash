import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { listClients } from "@/features/clients/actions/client.action";
import { listProjects } from "@/features/projects/actions/project.action";
import { getCurrentProfile } from "@/features/users/actions/user.action";
import { canCreateProjects } from "@/lib/permissions/resources";
import { ProjectCreateSection } from "@/sections/projects/ProjectCreateSection";
import { ProjectsListSection } from "@/sections/projects/ProjectsListSection";

export async function ProjectsView() {
  const profile = await getCurrentProfile();
  const [clients, projects] = await Promise.all([listClients(profile), listProjects(profile)]);

  return (
    <>
      <PageHeader
        title="Projects"
        description="Manage projects by client and monitor task-based progress."
      />
      {canCreateProjects(profile) ? <ProjectCreateSection clients={clients} /> : null}
      {!profile ? (
        <EmptyState
          title="Application profile required"
          description="Create a profile with this user's email in Users. It will link automatically on first login."
        />
      ) : (
        <ProjectsListSection projects={projects} canManage={canCreateProjects(profile)} />
      )}
    </>
  );
}
