"use server";

import { revalidatePath } from "next/cache";

import { getCurrentProfile } from "@/features/users/actions/user.action";
import { getToolSettings } from "@/features/tools/lib/tool-settings";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseServiceRoleKey } from "@/lib/supabase/env";
import type { ToolKey } from "@/types/database.type";

export type ToolTokenState = {
  error?: string;
  success?: string;
  remainingTokens?: number;
};

export async function consumeToolTokensAction(tool: ToolKey): Promise<ToolTokenState> {
  const profile = await getCurrentProfile();
  const settings = await getToolSettings();
  const toolCosts: Record<ToolKey, number> = {
    qr_generator: settings.qrDownloadCost,
    background_remover: settings.backgroundRemoverDownloadCost
  };
  const cost = toolCosts[tool];

  if (!profile) {
    return { error: "You must be logged in to download from this tool." };
  }

  if (profile.accountStatus !== "active") {
    return { error: "Your account is inactive." };
  }

  if (profile.role === "admin" || profile.role === "team_member") {
    return { success: "Internal download." };
  }

  if (!hasSupabaseServiceRoleKey()) {
    return { error: "SUPABASE_SERVICE_ROLE_KEY is required for token downloads." };
  }

  if (profile.toolTokens < cost) {
    return { error: `Not enough tokens. This download costs ${cost} tokens.` };
  }

  const supabase = createAdminClient();
  const remainingTokens = profile.toolTokens - cost;
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      tool_tokens: remainingTokens,
      updated_at: new Date().toISOString()
    })
    .eq("id", profile.id);

  if (updateError) {
    return { error: updateError.message };
  }

  const { error: insertError } = await supabase.from("tool_download_events").insert({
    profile_id: profile.id,
    tool,
    tokens_spent: cost
  });

  if (insertError) {
    return { error: insertError.message };
  }

  revalidatePath("/dashboard/users");
  revalidatePath("/dashboard/tools/qr-generator");
  revalidatePath("/dashboard/tools/background-remover");

  return {
    success: `${cost} token${cost === 1 ? "" : "s"} used.`,
    remainingTokens
  };
}
