"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";

import { createClientAction, type ClientActionState } from "@/features/clients/actions/client.action";
import type { ClientFormValues } from "@/features/clients/schemas/client.schema";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

const initialState: ClientActionState = {};

export function ClientForm() {
  const [state, action, isPending] = useActionState(createClientAction, initialState);
  const { register } = useForm<ClientFormValues>({
    defaultValues: {
      accountStatus: "active",
      loginAccess: false
    }
  });

  return (
    <form action={action} className="rounded-md border border-border bg-surface p-5 shadow-soft">
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
      <p className="mt-4 text-xs leading-5 text-muted-foreground">
        This creates a company record only. Admin users create login accounts from User Accounts.
      </p>
      {state.error ? <p className="mt-4 text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="mt-4 text-sm text-primary">{state.success}</p> : null}
      <Button type="submit" className="mt-5 w-full sm:w-auto" disabled={isPending}>
        {isPending ? "Creating" : "Create Client Organization"}
      </Button>
    </form>
  );
}
