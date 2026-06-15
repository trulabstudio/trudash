import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv, hasSupabaseServiceRoleKey } from "@/lib/supabase/env";
import type { Database } from "@/types/database.type";

type ToolSettingsRow = Database["public"]["Tables"]["tool_settings"]["Row"];

export type ToolSettings = {
  defaultClientTokens: number;
  qrDownloadCost: number;
  backgroundRemoverDownloadCost: number;
  pricePer10TokensRm: number;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  whatsappNumber: string;
};

export const defaultToolSettings: ToolSettings = {
  defaultClientTokens: 20,
  qrDownloadCost: 1,
  backgroundRemoverDownloadCost: 2,
  pricePer10TokensRm: 10,
  bankName: "Maybank",
  bankAccountNumber: "552023021990",
  bankAccountName: "TRULAB PRODUCTION",
  whatsappNumber: "60176982032"
};

function mapToolSettings(row: ToolSettingsRow): ToolSettings {
  return {
    defaultClientTokens: row.default_client_tokens,
    qrDownloadCost: row.qr_download_cost,
    backgroundRemoverDownloadCost: row.background_remover_download_cost,
    pricePer10TokensRm: Number(row.price_per_10_tokens_rm),
    bankName: row.bank_name,
    bankAccountNumber: row.bank_account_number,
    bankAccountName: row.bank_account_name,
    whatsappNumber: row.whatsapp_number
  };
}

export async function getToolSettings(): Promise<ToolSettings> {
  if (!hasSupabaseEnv()) {
    return defaultToolSettings;
  }

  const supabase = hasSupabaseServiceRoleKey() ? createAdminClient() : await createClient();
  const { data, error } = await supabase
    .from("tool_settings")
    .select("*")
    .eq("id", "default")
    .maybeSingle();

  if (error || !data) {
    return defaultToolSettings;
  }

  return mapToolSettings(data);
}
