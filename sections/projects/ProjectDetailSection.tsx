import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { projectStatusLabels } from "@/config/status";
import { ShareLinkForm } from "@/features/sharing/components/ShareLinkForm";
import type { Project } from "@/features/projects/types/project.type";
import type { Task } from "@/features/tasks/types/task.type";
import { TasksListSection } from "@/sections/tasks/TasksListSection";

type ProjectDetailSectionProps = {
  project: Project | null;
  tasks: Task[];
  canShare?: boolean;
};

export function ProjectDetailSection({ project, tasks, canShare = false }: ProjectDetailSectionProps) {
  if (!project) {
    return (
      <EmptyState
        title="Project not available"
        description="The project was not found or your role does not have access to this record."
      />
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-md border border-border bg-surface p-5 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{project.projectName}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{project.clientName ?? "Client not set"}</p>
          </div>
          <StatusBadge tone={project.status === "completed" ? "success" : "neutral"}>
            {projectStatusLabels[project.status]}
          </StatusBadge>
        </div>
        {project.description ? (
          <p className="mt-4 text-sm leading-6 text-muted-foreground">{project.description}</p>
        ) : null}
        <div className="mt-5">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{project.progress}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-sm bg-muted">
            <div className="h-full bg-primary" style={{ width: `${project.progress}%` }} />
          </div>
        </div>
        {canShare ? (
          <div className="mt-4">
            <ShareLinkForm resourceType="project" resourceId={project.id} label="Share Project" />
          </div>
        ) : null}
      </div>
      <div>
        <h2 className="mb-3 text-base font-semibold text-foreground">Tasks</h2>
        <TasksListSection tasks={tasks} canShare={canShare} />
      </div>
    </section>
  );
}
