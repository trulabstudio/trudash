import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { listClients } from "@/features/clients/actions/client.action";
import { listProjects } from "@/features/projects/actions/project.action";
import { getCurrentProfile, listProfiles } from "@/features/users/actions/user.action";
import { canCreateProjects } from "@/lib/permissions/resources";
import { ProjectCreateSection } from "@/sections/projects/ProjectCreateSection";
import { ProjectsListSection } from "@/sections/projects/ProjectsListSection";

export async function ProjectsView() {
  const profile = await getCurrentProfile();
  const [clients, projects, profiles] = await Promise.all([
    listClients(profile),
    listProjects(profile),
    listProfiles(profile)
  ]);
  const teamMembers = profiles.filter((item) => item.role === "team_member");

  return (
    <>
      <PageHeader
        title="Projects"
        description="Manage projects by client and monitor task-based progress. Projects are sorted by nearest due date."
      />
      {canCreateProjects(profile) ? <ProjectCreateSection clients={clients} teamMembers={teamMembers} /> : null}
      {!profile ? (
        <EmptyState
          title="Application profile required"
          description="Create a profile with this user's email in Users. It will link automatically on first login."
        />
      ) : (
        <ProjectsListSection projects={projects} clients={clients} canManage={canCreateProjects(profile)} />
      )}
    </>
  );
}
