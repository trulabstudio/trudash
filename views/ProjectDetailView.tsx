import { PageHeader } from "@/components/shared/PageHeader";
import { getProjectById, listProjectAssignments } from "@/features/projects/actions/project.action";
import { listTasks } from "@/features/tasks/actions/task.action";
import { getCurrentProfile, listProfiles } from "@/features/users/actions/user.action";
import { ProjectDetailSection } from "@/sections/projects/ProjectDetailSection";
import { ProjectAssignmentsSection } from "@/sections/projects/ProjectAssignmentsSection";

type ProjectDetailViewProps = {
  projectId: string;
};

export async function ProjectDetailView({ projectId }: ProjectDetailViewProps) {
  const profile = await getCurrentProfile();
  const [project, tasks, profiles] = await Promise.all([
    getProjectById(projectId, profile),
    listTasks(profile, projectId),
    listProfiles(profile)
  ]);
  const teamMembers = profiles.filter((item) => item.role === "team_member");
  const assignments = await listProjectAssignments(projectId, profile, profiles);

  return (
    <>
      <PageHeader
        title="Project Detail"
        description="View project progress, task status, and delivery links."
      />
      <ProjectDetailSection project={project} tasks={tasks} canShare={profile?.role === "client"} />
      {profile?.role === "admin" && project ? (
        <div className="mt-6">
          <ProjectAssignmentsSection
            projectId={projectId}
            assignments={assignments}
            teamMembers={teamMembers}
          />
        </div>
      ) : null}
    </>
  );
}
