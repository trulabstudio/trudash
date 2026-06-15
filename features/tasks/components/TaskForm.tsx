"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";

import type { Project } from "@/features/projects/types/project.type";
import { createTaskAction, updateTaskAction, type TaskActionState } from "@/features/tasks/actions/task.action";
import type { TaskFormValues } from "@/features/tasks/schemas/task.schema";
import type { Task } from "@/features/tasks/types/task.type";
import type { Profile } from "@/features/users/types/user.type";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";

const initialState: TaskActionState = {};

type TaskFormProps = {
  projects: Project[];
  teamMembers: Profile[];
  task?: Task;
};

export function TaskForm({ projects, teamMembers, task }: TaskFormProps) {
  const isEditing = Boolean(task);
  const [state, action, isPending] = useActionState(isEditing ? updateTaskAction : createTaskAction, initialState);
  const { register } = useForm<TaskFormValues>({
    defaultValues: {
      projectId: task?.projectId ?? "",
      assignedToProfileId: task?.assignedToProfileId ?? "",
      taskName: task?.taskName ?? "",
      description: task?.description ?? "",
      dueDate: task?.dueDate ?? "",
      status: task?.status ?? "todo",
      finalLink: task?.finalLink ?? "",
      internalNotes: task?.internalNotes ?? ""
    }
  });

  return (
    <form action={action} className="rounded-md border border-border bg-surface p-5 shadow-soft">
      {task ? <input type="hidden" name="taskId" value={task.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        {isEditing ? (
          <div className="space-y-2">
            <Label htmlFor="projectId">Project</Label>
            <select
              id="projectId"
              className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground"
              {...register("projectId")}
              required
            >
              <option value="">Select project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.projectName}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="space-y-2 md:col-span-2">
            <Label>Projects</Label>
            <div className="grid max-h-60 gap-2 overflow-y-auto rounded-md border border-border bg-muted p-3 sm:grid-cols-2">
              {projects.map((project) => (
                <label
                  key={project.id}
                  className="flex min-w-0 items-start gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    name="projectIds"
                    value={project.id}
                    className="mt-1 h-4 w-4 shrink-0 accent-primary"
                  />
                  <span className="min-w-0">
                    <span className="block break-words font-medium text-foreground">{project.projectName}</span>
                    <span className="block text-xs text-muted-foreground">{project.clientName ?? "Client not set"}</span>
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs leading-5 text-muted-foreground">
              Select one or more projects. The same task details will be created once for each selected project.
            </p>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="taskName">Task Name</Label>
          <Input id="taskName" {...register("taskName")} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input id="dueDate" type="date" {...register("dueDate")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground"
            {...register("status")}
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="assignedToProfileId">Assigned Team Member</Label>
          <select
            id="assignedToProfileId"
            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground"
            {...register("assignedToProfileId")}
          >
            <option value="">Use project team default</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.fullName ?? member.email}
              </option>
            ))}
          </select>
          <p className="text-xs leading-5 text-muted-foreground">
            Leave blank to assign this task to the first team member assigned to the selected project.
          </p>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="finalLink">Final Delivery Link</Label>
          <Input id="finalLink" type="url" {...register("finalLink")} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...register("description")} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="internalNotes">Internal Notes</Label>
          <Textarea id="internalNotes" {...register("internalNotes")} />
        </div>
      </div>
      {state.error ? <p className="mt-4 text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="mt-4 text-sm text-primary">{state.success}</p> : null}
      <Button type="submit" className="mt-5" disabled={isPending || projects.length === 0}>
        {isPending ? "Saving" : isEditing ? "Save Task" : "Create Task"}
      </Button>
    </form>
  );
}
