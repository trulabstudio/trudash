"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  updateToolSettingsAction,
  type ToolSettingsActionState
} from "@/features/tools/actions/tool-settings.action";
import type { ToolSettings } from "@/features/tools/lib/tool-settings";
import type { ToolSettingsFormValues } from "@/features/tools/schemas/tool-settings.schema";

type ToolSettingsFormProps = {
  settings: ToolSettings;
};

const initialState: ToolSettingsActionState = {};

export function ToolSettingsForm({ settings }: ToolSettingsFormProps) {
  const [state, action, isPending] = useActionState(updateToolSettingsAction, initialState);
  const { register } = useForm<ToolSettingsFormValues>({
    defaultValues: settings
  });

  return (
    <section className="rounded-md border border-border bg-surface p-5 shadow-soft">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-foreground">Tool & Token Settings</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Configure default client tokens, download token costs, top up pricing, and payment details.
        </p>
      </div>

      <form action={action}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="defaultClientTokens">Default Client Tokens</Label>
            <Input id="defaultClientTokens" type="number" min={0} {...register("defaultClientTokens")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pricePer10TokensRm">Price per 10 Tokens (RM)</Label>
            <Input id="pricePer10TokensRm" type="number" min={0} step="0.01" {...register("pricePer10TokensRm")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="qrDownloadCost">QR Download Cost</Label>
            <Input id="qrDownloadCost" type="number" min={0} {...register("qrDownloadCost")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="backgroundRemoverDownloadCost">Background Remover Cost</Label>
            <Input
              id="backgroundRemoverDownloadCost"
              type="number"
              min={0}
              {...register("backgroundRemoverDownloadCost")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank</Label>
            <Input id="bankName" {...register("bankName")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bankAccountNumber">Bank Account Number</Label>
            <Input id="bankAccountNumber" {...register("bankAccountNumber")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bankAccountName">Bank Account Name</Label>
            <Input id="bankAccountName" {...register("bankAccountName")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
            <Input id="whatsappNumber" {...register("whatsappNumber")} />
          </div>
        </div>
        {state.error ? <p className="mt-4 text-sm text-destructive">{state.error}</p> : null}
        {state.success ? <p className="mt-4 text-sm text-primary">{state.success}</p> : null}
        <Button type="submit" className="mt-5 w-full sm:w-auto" disabled={isPending}>
          {isPending ? "Saving" : "Save Tool Settings"}
        </Button>
      </form>
    </section>
  );
}
