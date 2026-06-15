import { EmptyState } from "@/components/shared/EmptyState";
import { DeleteActionForm } from "@/components/shared/DeleteActionForm";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { taskStatusLabels } from "@/config/status";
import { ShareLinkForm } from "@/features/sharing/components/ShareLinkForm";
import { deleteTaskAction } from "@/features/tasks/actions/task.action";
import { TaskBulkAssignForm } from "@/features/tasks/components/TaskBulkAssignForm";
import { TaskForm } from "@/features/tasks/components/TaskForm";
import { TaskStatusForm } from "@/features/tasks/components/TaskStatusForm";
import type { Task } from "@/features/tasks/types/task.type";
import type { Project } from "@/features/projects/types/project.type";
import type { Profile } from "@/features/users/types/user.type";

type TasksListSectionProps = {
  tasks: Task[];
  projects?: Project[];
  teamMembers?: Profile[];
  canUpdate?: boolean;
  canManage?: boolean;
  canShare?: boolean;
};

export function TasksListSection({
  tasks,
  projects = [],
  teamMembers = [],
  canUpdate = false,
  canManage = false,
  canShare = false
}: TasksListSectionProps) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks found"
        description="Create tasks inside a project, or confirm your role has access to assigned tasks."
      />
    );
  }

  return (
    <section className="grid gap-4">
      {canManage ? <TaskBulkAssignForm tasks={tasks} teamMembers={teamMembers} /> : null}
      {tasks.map((task) => (
        <article key={task.id} className="rounded-md border border-border bg-surface p-5 shadow-soft">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">{task.taskName}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {task.projectName ?? "Project not set"} · {task.clientName ?? "Client not set"}
              </p>
            </div>
            <StatusBadge tone={task.status === "completed" ? "success" : "neutral"}>
              {taskStatusLabels[task.status]}
            </StatusBadge>
          </div>
          {task.description ? (
            <p className="mt-4 text-sm leading-6 text-muted-foreground">{task.description}</p>
          ) : null}
          <dl className="mt-4 grid gap-3 text-sm md:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">Due Date</dt>
              <dd className="mt-1 font-medium text-foreground">{task.dueDate ?? "Not set"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Final Link</dt>
              <dd className="mt-1 font-medium text-foreground">
                {task.finalLink ? (
                  <a href={task.finalLink} className="text-primary" target="_blank" rel="noreferrer">
                    Open delivery
                  </a>
                ) : (
                  "Not set"
                )}
              </dd>
            </div>
            {task.internalNotes ? (
              <div>
                <dt className="text-muted-foreground">Internal Notes</dt>
                <dd className="mt-1 font-medium text-foreground">{task.internalNotes}</dd>
              </div>
            ) : null}
          </dl>
          {canUpdate ? <TaskStatusForm task={task} /> : null}
          {canShare && task.status === "completed" ? (
            <div className="mt-4">
              <ShareLinkForm resourceType="task" resourceId={task.id} label="Share Task" />
            </div>
          ) : null}
          {canManage ? (
            <details className="mt-4 rounded-md border border-border bg-muted p-3">
              <summary className="cursor-pointer text-sm font-medium text-foreground">Edit task</summary>
              <div className="mt-4 grid gap-3">
                <TaskForm projects={projects} teamMembers={teamMembers} task={task} />
                <DeleteActionForm action={deleteTaskAction} fieldName="taskId" id={task.id} />
              </div>
            </details>
          ) : null}
        </article>
      ))}
    </section>
  );
}
