"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/Button";

type ActionState = {
  error?: string;
  success?: string;
};

type DeleteActionFormProps = {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  fieldName: string;
  id: string;
  label?: string;
};

const initialState: ActionState = {};

export function DeleteActionForm({ action, fieldName, id, label = "Delete" }: DeleteActionFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name={fieldName} value={id} />
      <Button type="submit" variant="secondary" disabled={isPending}>
        {isPending ? "Deleting" : label}
      </Button>
      {state.error ? <p className="text-xs text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-xs text-primary">{state.success}</p> : null}
    </form>
  );
}
