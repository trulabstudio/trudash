import Link from "next/link";

import { EmptyState } from "@/components/shared/EmptyState";
import { DeleteActionForm } from "@/components/shared/DeleteActionForm";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { projectStatusLabels } from "@/config/status";
import { deleteProjectAction } from "@/features/projects/actions/project.action";
import type { Project } from "@/features/projects/types/project.type";

type ProjectsListSectionProps = {
  projects: Project[];
  canManage?: boolean;
};

export function ProjectsListSection({ projects, canManage = false }: ProjectsListSectionProps) {
  if (projects.length === 0) {
    return (
      <EmptyState
        title="No projects found"
        description="Create a project for an active client, or confirm your role has access to assigned projects."
      />
    );
  }

  return (
    <section className="grid gap-4">
      {projects.map((project) => (
        <article key={project.id} className="rounded-md border border-border bg-surface p-5 shadow-soft">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Link
                href={`/dashboard/projects/${project.id}`}
                className="text-base font-semibold text-foreground hover:text-primary"
              >
                {project.projectName}
              </Link>
              <p className="mt-1 text-sm text-muted-foreground">{project.clientName ?? "Client not set"}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Due date: {project.dueDate ?? "Not set"}
              </p>
            </div>
            <StatusBadge tone={project.status === "completed" ? "success" : "neutral"}>
              {projectStatusLabels[project.status]}
            </StatusBadge>
          </div>
          <div className="mt-5">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>
                {project.completedTasks}/{project.totalTasks} tasks
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-sm bg-muted">
              <div className="h-full bg-primary" style={{ width: `${project.progress}%` }} />
            </div>
          </div>
          {canManage ? (
            <div className="mt-4">
              <DeleteActionForm action={deleteProjectAction} fieldName="projectId" id={project.id} />
            </div>
          ) : null}
        </article>
      ))}
    </section>
  );
}
