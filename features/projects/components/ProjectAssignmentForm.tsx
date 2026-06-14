"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";

import { assignTeamMemberAction, type ProjectActionState } from "@/features/projects/actions/project.action";
import type { ProjectAssignmentFormValues } from "@/features/projects/schemas/project.schema";
import type { Profile } from "@/features/users/types/user.type";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";

const initialState: ProjectActionState = {};

type ProjectAssignmentFormProps = {
  projectId: string;
  teamMembers: Profile[];
};

export function ProjectAssignmentForm({ projectId, teamMembers }: ProjectAssignmentFormProps) {
  const [state, action, isPending] = useActionState(assignTeamMemberAction, initialState);
  const { register } = useForm<ProjectAssignmentFormValues>({
    defaultValues: {
      projectId
    }
  });

  return (
    <form action={action} className="grid gap-3 md:grid-cols-[1fr_auto]">
      <input type="hidden" {...register("projectId")} />
      <div className="space-y-2">
        <Label htmlFor="profileId">Team Member</Label>
        <select
          id="profileId"
          className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground"
          {...register("profileId")}
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
      <Button type="submit" className="self-end" disabled={isPending || teamMembers.length === 0}>
        {isPending ? "Assigning" : "Assign"}
      </Button>
      {state.error ? <p className="text-sm text-destructive md:col-span-2">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-primary md:col-span-2">{state.success}</p> : null}
    </form>
  );
}
