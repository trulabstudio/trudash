"use server";

import { randomBytes } from "crypto";

import { getCurrentProfile } from "@/features/users/actions/user.action";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseServiceRoleKey } from "@/lib/supabase/env";
import type { ShareResourceType } from "@/types/database.type";

export type ShareActionState = {
  error?: string;
  success?: string;
  sharePath?: string;
};

type ShareLinkRow = {
  token: string;
};

function createToken() {
  return randomBytes(24).toString("base64url");
}

function getSharePath(resourceType: ShareResourceType, token: string) {
  return `/share/${resourceType}/${token}`;
}

export async function createShareLinkAction(
  _: ShareActionState,
  formData: FormData
): Promise<ShareActionState> {
  const profile = await getCurrentProfile();

  if (profile?.role !== "client" || !profile.clientId) {
    return { error: "Only Client users can create share links." };
  }

  if (!hasSupabaseServiceRoleKey()) {
    return { error: "SUPABASE_SERVICE_ROLE_KEY is required to create share links." };
  }

  const resourceType = formData.get("resourceType")?.toString() as ShareResourceType | undefined;
  const resourceId = formData.get("resourceId")?.toString();

  if ((resourceType !== "project" && resourceType !== "task") || !resourceId) {
    return { error: "Invalid share request." };
  }

  const supabase = createAdminClient();

  if (resourceType === "project") {
    const { data: project } = await supabase
      .from("projects")
      .select("id,client_id")
      .eq("id", resourceId)
      .maybeSingle();

    if (!project || project.client_id !== profile.clientId) {
      return { error: "Project not available for sharing." };
    }
  }

  if (resourceType === "task") {
    const { data: task } = await supabase
      .from("tasks")
      .select("id,status,project_id")
      .eq("id", resourceId)
      .maybeSingle();

    if (!task || task.status !== "completed") {
      return { error: "Only completed tasks can be shared." };
    }

    const { data: project } = await supabase
      .from("projects")
      .select("client_id")
      .eq("id", task.project_id)
      .maybeSingle();

    if (!project || project.client_id !== profile.clientId) {
      return { error: "Task not available for sharing." };
    }
  }

  const { data: existingLink } = await supabase
    .from("share_links")
    .select("token")
    .eq("resource_type", resourceType)
    .eq("resource_id", resourceId)
    .eq("created_by_profile_id", profile.id)
    .eq("is_active", true)
    .maybeSingle<ShareLinkRow>();

  if (existingLink) {
    return {
      success: "Share link ready.",
      sharePath: getSharePath(resourceType, existingLink.token)
    };
  }

  const token = createToken();
  const { error } = await supabase.from("share_links").insert({
    token,
    resource_type: resourceType,
    resource_id: resourceId,
    created_by_profile_id: profile.id
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: "Share link created.",
    sharePath: getSharePath(resourceType, token)
  };
}
