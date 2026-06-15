"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { bulkAssignTasksAction, type TaskActionState } from "@/features/tasks/actions/task.action";
import type { Task } from "@/features/tasks/types/task.type";
import type { Profile } from "@/features/users/types/user.type";

const initialState: TaskActionState = {};

type TaskBulkAssignFormProps = {
  tasks: Task[];
  teamMembers: Profile[];
};

export function TaskBulkAssignForm({ tasks, teamMembers }: TaskBulkAssignFormProps) {
  const [state, action, isPending] = useActionState(bulkAssignTasksAction, initialState);

  return (
    <details className="rounded-md border border-border bg-surface p-5 shadow-soft">
      <summary className="cursor-pointer text-sm font-semibold text-foreground">
        Bulk assign tasks
      </summary>

      <form action={action} className="mt-4 grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="bulkAssignedToProfileId">Assign to Team Member</Label>
          <select
            id="bulkAssignedToProfileId"
            name="assignedToProfileId"
            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground"
            required
          >
            <option value="">Select team member</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.fullName ?? member.email}
              </option>
            ))}
          </select>
        </div>

        <div className="grid max-h-72 gap-2 overflow-y-auto rounded-md border border-border bg-muted p-3">
          {tasks.map((task) => (
            <label
              key={task.id}
              className="flex min-w-0 items-start gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                name="taskIds"
                value={task.id}
                className="mt-1 h-4 w-4 shrink-0 accent-primary"
              />
              <span className="min-w-0">
                <span className="block break-words font-medium text-foreground">{task.taskName}</span>
                <span className="block text-xs text-muted-foreground">
                  {task.projectName ?? "Project not set"} · {task.clientName ?? "Client not set"}
                </span>
              </span>
            </label>
          ))}
        </div>

        {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
        {state.success ? <p className="text-sm text-primary">{state.success}</p> : null}

        <Button type="submit" className="w-full sm:w-auto" disabled={isPending || teamMembers.length === 0}>
          {isPending ? "Assigning" : "Assign Selected Tasks"}
        </Button>
      </form>
    </details>
  );
}
