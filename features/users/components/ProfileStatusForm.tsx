"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";

import { DeleteActionForm } from "@/components/shared/DeleteActionForm";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import type { Client } from "@/features/clients/types/client.type";
import {
  deleteProfileAction,
  topUpProfileTokensAction,
  updateProfileAction,
  updateProfilePasswordAction,
  type ProfileActionState
} from "@/features/users/actions/user.action";
import type {
  ProfilePasswordFormValues,
  ProfileTokenTopUpFormValues,
  ProfileUpdateFormValues
} from "@/features/users/schemas/user.schema";
import type { Profile } from "@/features/users/types/user.type";

const initialState: ProfileActionState = {};

type ProfileStatusFormProps = {
  profile: Profile;
  clients: Client[];
};

export function ProfileStatusForm({ profile, clients }: ProfileStatusFormProps) {
  const [updateState, updateAction, isUpdatePending] = useActionState(updateProfileAction, initialState);
  const [passwordState, passwordAction, isPasswordPending] = useActionState(
    updateProfilePasswordAction,
    initialState
  );
  const [tokenState, tokenAction, isTokenPending] = useActionState(topUpProfileTokensAction, initialState);
  const { register, watch } = useForm<ProfileUpdateFormValues>({
    defaultValues: {
      profileId: profile.id,
      fullName: profile.fullName ?? "",
      email: profile.email,
      role: profile.role,
      clientId: profile.clientId ?? "",
      accountStatus: profile.accountStatus
    }
  });
  const { register: registerPassword } = useForm<ProfilePasswordFormValues>({
    defaultValues: {
      profileId: profile.id,
      password: ""
    }
  });
  const { register: registerToken } = useForm<ProfileTokenTopUpFormValues>({
    defaultValues: {
      profileId: profile.id,
      amount: 20
    }
  });
  const selectedRole = watch("role");
  const isClientRole = selectedRole === "client";

  return (
    <div className="grid gap-4">
      <form action={updateAction} className="grid gap-3 lg:grid-cols-2">
        <input type="hidden" {...register("profileId")} />
        <div className="space-y-2">
          <Label htmlFor={`fullName-${profile.id}`}>Full Name</Label>
          <Input id={`fullName-${profile.id}`} {...register("fullName")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`email-${profile.id}`}>Email</Label>
          <Input id={`email-${profile.id}`} type="email" {...register("email")} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`role-${profile.id}`}>Role</Label>
          <select
            id={`role-${profile.id}`}
            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground"
            {...register("role")}
          >
            <option value="admin">Admin</option>
            <option value="team_member">Team Member</option>
            <option value="client">Client</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`clientId-${profile.id}`}>Linked Client Organization</Label>
          <select
            id={`clientId-${profile.id}`}
            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
            disabled={!isClientRole}
            {...register("clientId")}
          >
            <option value="">{isClientRole ? "Select organization" : "Only required for Client users"}</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.companyName}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`accountStatus-${profile.id}`}>Account Status</Label>
          <select
            id={`accountStatus-${profile.id}`}
            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground"
            {...register("accountStatus")}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="flex items-end">
          <Button type="submit" variant="secondary" className="w-full sm:w-auto" disabled={isUpdatePending}>
            {isUpdatePending ? "Saving" : "Save User"}
          </Button>
        </div>
        {updateState.error ? <p className="text-sm text-destructive lg:col-span-2">{updateState.error}</p> : null}
        {updateState.success ? <p className="text-sm text-primary lg:col-span-2">{updateState.success}</p> : null}
      </form>

      <div className="grid gap-3 border-t border-border pt-4 lg:grid-cols-[1fr_auto_auto]">
        <form action={passwordAction} className="grid gap-3 lg:col-span-2 lg:grid-cols-[1fr_auto]">
          <input type="hidden" {...registerPassword("profileId")} />
          <div className="space-y-2">
            <Label htmlFor={`password-${profile.id}`}>New Password</Label>
            <Input
              id={`password-${profile.id}`}
              type="password"
              autoComplete="new-password"
              {...registerPassword("password")}
            />
          </div>
          <div className="flex items-end">
            <Button
              type="submit"
              variant="secondary"
              className="w-full sm:w-auto"
              disabled={isPasswordPending || !profile.userId}
            >
              {isPasswordPending ? "Updating" : "Update Password"}
            </Button>
          </div>
          {!profile.userId ? (
            <p className="text-xs text-muted-foreground lg:col-span-2">
              Password can be changed after this profile is linked to a login.
            </p>
          ) : null}
          {passwordState.error ? <p className="text-sm text-destructive lg:col-span-2">{passwordState.error}</p> : null}
          {passwordState.success ? <p className="text-sm text-primary lg:col-span-2">{passwordState.success}</p> : null}
        </form>
        <div className="flex items-end">
          <DeleteActionForm action={deleteProfileAction} fieldName="profileId" id={profile.id} label="Delete User" />
        </div>
      </div>

      {profile.role === "client" ? (
        <form action={tokenAction} className="grid gap-3 border-t border-border pt-4 lg:grid-cols-[1fr_auto]">
          <input type="hidden" {...registerToken("profileId")} />
          <div className="space-y-2">
            <Label htmlFor={`tokenAmount-${profile.id}`}>Token Top Up</Label>
            <Input
              id={`tokenAmount-${profile.id}`}
              type="number"
              min={1}
              step={1}
              {...registerToken("amount")}
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" variant="secondary" className="w-full sm:w-auto" disabled={isTokenPending}>
              {isTokenPending ? "Adding" : "Add Tokens"}
            </Button>
          </div>
          {tokenState.error ? <p className="text-sm text-destructive lg:col-span-2">{tokenState.error}</p> : null}
          {tokenState.success ? <p className="text-sm text-primary lg:col-span-2">{tokenState.success}</p> : null}
        </form>
      ) : null}
    </div>
  );
}
