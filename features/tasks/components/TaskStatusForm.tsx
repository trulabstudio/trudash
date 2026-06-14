"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";

import { updateTaskStatusAction, type TaskActionState } from "@/features/tasks/actions/task.action";
import type { TaskStatusFormValues } from "@/features/tasks/schemas/task.schema";
import type { Task } from "@/features/tasks/types/task.type";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const initialState: TaskActionState = {};

type TaskStatusFormProps = {
  task: Task;
};

export function TaskStatusForm({ task }: TaskStatusFormProps) {
  const [state, action, isPending] = useActionState(updateTaskStatusAction, initialState);
  const { register } = useForm<TaskStatusFormValues>({
    defaultValues: {
      taskId: task.id,
      status: task.status,
      finalLink: task.finalLink ?? ""
    }
  });

  return (
    <form action={action} className="mt-4 grid gap-3 md:grid-cols-[160px_1fr_auto]">
      <input type="hidden" {...register("taskId")} />
      <select
        className="h-10 rounded-md border border-border bg-surface px-3 text-sm text-foreground"
        {...register("status")}
      >
        <option value="todo">To Do</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="blocked">Blocked</option>
      </select>
      <Input type="url" placeholder="Final delivery link" {...register("finalLink")} />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving" : "Update"}
      </Button>
      {state.error ? <p className="text-sm text-destructive md:col-span-3">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-primary md:col-span-3">{state.success}</p> : null}
    </form>
  );
}
