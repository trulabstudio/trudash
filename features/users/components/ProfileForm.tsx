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
  const { register, watch } = useForm<ProfileFormValues>({
    defaultValues: {
      role: "team_member",
      accountStatus: "active"
    }
  });
  const selectedRole = watch("role");
  const isClientRole = selectedRole === "client";

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
          <p className="text-xs leading-5 text-muted-foreground">
            Admin and Team Member are internal users. Client users must be linked to a client organization.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="clientId">Linked Client Organization</Label>
          <select
            id="clientId"
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
          <p className="text-xs leading-5 text-muted-foreground">
            Create the organization in Client Organizations before creating a Client login.
          </p>
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
      <Button type="submit" className="mt-5 w-full sm:w-auto" disabled={isPending}>
        {isPending ? "Creating" : "Create Login Profile"}
      </Button>
    </form>
  );
}
