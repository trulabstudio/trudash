"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";

import type { Project } from "@/features/projects/types/project.type";
import { createTaskAction, type TaskActionState } from "@/features/tasks/actions/task.action";
import type { TaskFormValues } from "@/features/tasks/schemas/task.schema";
import type { Profile } from "@/features/users/types/user.type";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";

const initialState: TaskActionState = {};

type TaskFormProps = {
  projects: Project[];
  teamMembers: Profile[];
};

export function TaskForm({ projects, teamMembers }: TaskFormProps) {
  const [state, action, isPending] = useActionState(createTaskAction, initialState);
  const { register } = useForm<TaskFormValues>({
    defaultValues: {
      status: "todo"
    }
  });

  return (
    <form action={action} className="rounded-md border border-border bg-surface p-5 shadow-soft">
      <div className="grid gap-4 md:grid-cols-2">
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
            <option value="">Unassigned</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.fullName ?? member.email}
              </option>
            ))}
          </select>
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
        {isPending ? "Creating" : "Create Task"}
      </Button>
    </form>
  );
}
