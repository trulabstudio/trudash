"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";

import { updateProfileStatusAction, type ProfileActionState } from "@/features/users/actions/user.action";
import type { ProfileStatusFormValues } from "@/features/users/schemas/user.schema";
import type { Profile } from "@/features/users/types/user.type";
import { Button } from "@/components/ui/Button";

const initialState: ProfileActionState = {};

type ProfileStatusFormProps = {
  profile: Profile;
};

export function ProfileStatusForm({ profile }: ProfileStatusFormProps) {
  const [state, action, isPending] = useActionState(updateProfileStatusAction, initialState);
  const { register } = useForm<ProfileStatusFormValues>({
    defaultValues: {
      profileId: profile.id,
      role: profile.role,
      accountStatus: profile.accountStatus
    }
  });

  return (
    <form action={action} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
      <input type="hidden" {...register("profileId")} />
      <select
        className="h-10 rounded-md border border-border bg-surface px-3 text-sm text-foreground"
        {...register("role")}
      >
        <option value="admin">Admin</option>
        <option value="team_member">Team Member</option>
        <option value="client">Client</option>
      </select>
      <select
        className="h-10 rounded-md border border-border bg-surface px-3 text-sm text-foreground"
        {...register("accountStatus")}
      >
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <Button type="submit" variant="secondary" disabled={isPending}>
        {isPending ? "Saving" : "Save"}
      </Button>
      {state.error ? <p className="text-sm text-destructive md:col-span-3">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-primary md:col-span-3">{state.success}</p> : null}
    </form>
  );
}
