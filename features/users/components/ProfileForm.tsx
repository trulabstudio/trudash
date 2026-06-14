"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";

import type { Client } from "@/features/clients/types/client.type";
import { createProfileAction, type ProfileActionState } from "@/features/users/actions/user.action";
import type { ProfileFormValues } from "@/features/users/schemas/user.schema";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

const initialState: ProfileActionState = {};

type ProfileFormProps = {
  clients: Client[];
};

export function ProfileForm({ clients }: ProfileFormProps) {
  const [state, action, isPending] = useActionState(createProfileAction, initialState);
  const { register } = useForm<ProfileFormValues>({
    defaultValues: {
      role: "team_member",
      accountStatus: "active"
    }
  });

  return (
    <form action={action} className="rounded-md border border-border bg-surface p-5 shadow-soft">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" {...register("fullName")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Temporary Password</Label>
          <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
          <p className="text-xs leading-5 text-muted-foreground">
            Set a password to create the Supabase login now, or leave blank to link by email on first login.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground"
            {...register("role")}
          >
            <option value="admin">Admin</option>
            <option value="team_member">Team Member</option>
            <option value="client">Client</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="clientId">Client Company</Label>
          <select
            id="clientId"
            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground"
            {...register("clientId")}
          >
            <option value="">None</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.companyName}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="accountStatus">Account Status</Label>
          <select
            id="accountStatus"
            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground"
            {...register("accountStatus")}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      {state.error ? <p className="mt-4 text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="mt-4 text-sm text-primary">{state.success}</p> : null}
      <Button type="submit" className="mt-5" disabled={isPending}>
        {isPending ? "Creating" : "Create Profile"}
      </Button>
    </form>
  );
}
