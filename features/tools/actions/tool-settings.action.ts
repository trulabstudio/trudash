"use server";

import { revalidatePath } from "next/cache";

import { toolSettingsSchema } from "@/features/tools/schemas/tool-settings.schema";
import { getCurrentProfile } from "@/features/users/actions/user.action";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseServiceRoleKey } from "@/lib/supabase/env";

export type ToolSettingsActionState = {
  error?: string;
  success?: string;
};

export async function updateToolSettingsAction(
  _: ToolSettingsActionState,
  formData: FormData
): Promise<ToolSettingsActionState> {
  const profile = await getCurrentProfile();

  if (profile?.role !== "admin") {
    return { error: "Only Admin users can update tool settings." };
  }

  if (!hasSupabaseServiceRoleKey()) {
    return { error: "SUPABASE_SERVICE_ROLE_KEY is required to update tool settings." };
  }

  const parsed = toolSettingsSchema.safeParse({
    defaultClientTokens: formData.get("defaultClientTokens"),
    qrDownloadCost: formData.get("qrDownloadCost"),
    backgroundRemoverDownloadCost: formData.get("backgroundRemoverDownloadCost"),
    pricePer10TokensRm: formData.get("pricePer10TokensRm"),
    bankName: formData.get("bankName"),
    bankAccountNumber: formData.get("bankAccountNumber"),
    bankAccountName: formData.get("bankAccountName"),
    whatsappNumber: formData.get("whatsappNumber")
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid tool settings." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("tool_settings").upsert({
    id: "default",
    default_client_tokens: parsed.data.defaultClientTokens,
    qr_download_cost: parsed.data.qrDownloadCost,
    background_remover_download_cost: parsed.data.backgroundRemoverDownloadCost,
    price_per_10_tokens_rm: parsed.data.pricePer10TokensRm,
    bank_name: parsed.data.bankName,
    bank_account_number: parsed.data.bankAccountNumber,
    bank_account_name: parsed.data.bankAccountName,
    whatsapp_number: parsed.data.whatsappNumber,
    updated_at: new Date().toISOString()
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tools/qr-generator");
  revalidatePath("/dashboard/tools/background-remover");
  return { success: "Tool settings updated." };
}
