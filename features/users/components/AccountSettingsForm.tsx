"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { updateAccountSettingsAction, type ProfileActionState } from "@/features/users/actions/user.action";
import type { AccountSettingsFormValues } from "@/features/users/schemas/user.schema";
import type { Profile } from "@/features/users/types/user.type";

type AccountSettingsFormProps = {
  profile: Profile;
};

const initialState: ProfileActionState = {};

export function AccountSettingsForm({ profile }: AccountSettingsFormProps) {
  const [state, action, isPending] = useActionState(updateAccountSettingsAction, initialState);
  const { register } = useForm<AccountSettingsFormValues>({
    defaultValues: {
      fullName: profile.fullName ?? ""
    }
  });

  return (
    <form action={action} className="rounded-md border border-border bg-surface p-5 shadow-soft">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Display Name</Label>
          <Input id="fullName" autoComplete="name" {...register("fullName")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
          <p className="text-xs leading-5 text-muted-foreground">Leave blank if you only want to update your name.</p>
        </div>
      </div>
      {state.error ? <p className="mt-4 text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="mt-4 text-sm text-primary">{state.success}</p> : null}
      <Button type="submit" className="mt-5" disabled={isPending}>
        {isPending ? "Saving" : "Save Changes"}
      </Button>
    </form>
  );
}
