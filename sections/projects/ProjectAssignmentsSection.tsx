import { EmptyState } from "@/components/shared/EmptyState";
import type { ProjectAssignment } from "@/features/projects/types/project.type";
import { ProjectAssignmentForm } from "@/features/projects/components/ProjectAssignmentForm";
import type { Profile } from "@/features/users/types/user.type";

type ProjectAssignmentsSectionProps = {
  projectId: string;
  assignments: ProjectAssignment[];
  teamMembers: Profile[];
};

export function ProjectAssignmentsSection({
  projectId,
  assignments,
  teamMembers
}: ProjectAssignmentsSectionProps) {
  return (
    <section className="rounded-md border border-border bg-surface p-5 shadow-soft">
      <h2 className="text-base font-semibold text-foreground">Project Team</h2>
      <div className="mt-4">
        <ProjectAssignmentForm projectId={projectId} teamMembers={teamMembers} />
      </div>
      <div className="mt-5">
        {assignments.length === 0 ? (
          <EmptyState
            title="No team members assigned"
            description="Assign team members so they can access this project and their assigned tasks."
          />
        ) : (
          <ul className="divide-y divide-border text-sm">
            {assignments.map((assignment) => (
              <li key={assignment.id} className="py-3">
                <p className="font-medium text-foreground">
                  {assignment.profileName ?? assignment.profileEmail ?? "Team member"}
                </p>
                {assignment.profileEmail ? (
                  <p className="mt-1 text-muted-foreground">{assignment.profileEmail}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
