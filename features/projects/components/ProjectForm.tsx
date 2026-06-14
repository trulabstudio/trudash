"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";

import type { Client } from "@/features/clients/types/client.type";
import { createProjectAction, type ProjectActionState } from "@/features/projects/actions/project.action";
import type { ProjectFormValues } from "@/features/projects/schemas/project.schema";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";

const initialState: ProjectActionState = {};

type ProjectFormProps = {
  clients: Client[];
};

export function ProjectForm({ clients }: ProjectFormProps) {
  const [state, action, isPending] = useActionState(createProjectAction, initialState);
  const { register } = useForm<ProjectFormValues>({
    defaultValues: {
      status: "not_started"
    }
  });

  return (
    <form action={action} className="rounded-md border border-border bg-surface p-5 shadow-soft">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="clientId">Client</Label>
          <select
            id="clientId"
            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground"
            {...register("clientId")}
            required
          >
            <option value="">Select client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.companyName}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="projectName">Project Name</Label>
          <Input id="projectName" {...register("projectName")} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input id="startDate" type="date" {...register("startDate")} />
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
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...register("description")} />
        </div>
      </div>
      {state.error ? <p className="mt-4 text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="mt-4 text-sm text-primary">{state.success}</p> : null}
      <Button type="submit" className="mt-5" disabled={isPending || clients.length === 0}>
        {isPending ? "Creating" : "Create Project"}
      </Button>
    </form>
  );
}
