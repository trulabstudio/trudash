"use client";

import { useActionState } from "react";
import Link from "next/link";

import { resetPasswordAction, type AuthActionState } from "@/features/auth/actions/auth.action";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

const initialState: AuthActionState = {};

export function PasswordRecoveryForm() {
  const [state, action, isPending] = useActionState(resetPasswordAction, initialState);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      {state.error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
          {state.success}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Sending" : "Send recovery email"}
      </Button>
      <Link href="/login" className="block text-center text-sm font-medium text-primary">
        Back to login
      </Link>
    </form>
  );
}
