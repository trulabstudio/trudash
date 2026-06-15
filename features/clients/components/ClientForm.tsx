"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";

import { createClientAction, updateClientAction, type ClientActionState } from "@/features/clients/actions/client.action";
import type { ClientFormValues } from "@/features/clients/schemas/client.schema";
import type { Client } from "@/features/clients/types/client.type";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

const initialState: ClientActionState = {};

type ClientFormProps = {
  client?: Client;
};

export function ClientForm({ client }: ClientFormProps) {
  const isEditing = Boolean(client);
  const [state, action, isPending] = useActionState(isEditing ? updateClientAction : createClientAction, initialState);
  const { register } = useForm<ClientFormValues>({
    defaultValues: {
      companyName: client?.companyName ?? "",
      contactPerson: client?.contactPerson ?? "",
      email: client?.email ?? "",
      phoneNumber: client?.phoneNumber ?? "",
      accountStatus: client?.accountStatus ?? "active",
      loginAccess: client?.loginAccess ?? false
    }
  });

  return (
    <form action={action} className="rounded-md border border-border bg-surface p-5 shadow-soft">
      {client ? <input type="hidden" name="clientId" value={client.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input id="companyName" {...register("companyName")} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactPerson">Primary Contact</Label>
          <Input id="contactPerson" {...register("contactPerson")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Company Contact Email</Label>
          <Input id="email" type="email" {...register("email")} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input id="phoneNumber" {...register("phoneNumber")} />
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
        <input type="hidden" value="false" {...register("loginAccess")} />
      </div>
      {!isEditing ? (
        <p className="mt-4 text-xs leading-5 text-muted-foreground">
          This creates a company record only. Admin users create login accounts from User Accounts.
        </p>
      ) : null}
      {state.error ? <p className="mt-4 text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="mt-4 text-sm text-primary">{state.success}</p> : null}
      <Button type="submit" className="mt-5 w-full sm:w-auto" disabled={isPending}>
        {isPending ? "Saving" : isEditing ? "Save Client Organization" : "Create Client Organization"}
      </Button>
    </form>
  );
}
