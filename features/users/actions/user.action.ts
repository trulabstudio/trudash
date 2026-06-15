"use server";

import { revalidatePath } from "next/cache";

import {
  accountSettingsSchema,
  profileDeleteSchema,
  profilePasswordSchema,
  profileSchema,
  profileStatusSchema,
  profileTokenTopUpSchema,
  profileUpdateSchema
} from "@/features/users/schemas/user.schema";
import { getToolSettings } from "@/features/tools/lib/tool-settings";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv, hasSupabaseServiceRoleKey } from "@/lib/supabase/env";
import { isAdmin } from "@/lib/permissions/roles";
import type { Profile } from "@/features/users/types/user.type";
import type { Database } from "@/types/database.type";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileData = Pick<
  ProfileRow,
  "id" | "user_id" | "full_name" | "email" | "role" | "client_id" | "account_status" | "tool_tokens"
>;
type ToolDownloadCountRow = Database["public"]["Views"]["tool_download_counts"]["Row"];

const profileSelect = "id,user_id,full_name,email,role,client_id,account_status,tool_tokens";

export type ProfileActionState = {
  error?: string;
  success?: string;
};

function mapProfile(data: ProfileData): Profile {
  return {
    id: data.id,
    userId: data.user_id,
    fullName: data.full_name,
    email: data.email,
    role: data.role,
    clientId: data.client_id,
    accountStatus: data.account_status,
    toolTokens: data.tool_tokens,
    qrDownloadCount: 0,
    backgroundRemovalDownloadCount: 0
  };
}

function applyDownloadCounts(profiles: Profile[], counts: ToolDownloadCountRow[]) {
  const countsByProfile = new Map(
    counts
      .filter((item): item is ToolDownloadCountRow & { profile_id: string } => Boolean(item.profile_id))
      .map((item) => [item.profile_id, item])
  );

  return profiles.map((profile) => {
    const counts = countsByProfile.get(profile.id);

    return {
      ...profile,
      qrDownloadCount: counts?.qr_download_count ?? 0,
      backgroundRemovalDownloadCount: counts?.background_remover_download_count ?? 0
    };
  });
}

async function createProfileManagementClient() {
  if (hasSupabaseServiceRoleKey()) {
    return createAdminClient();
  }

  return createClient();
}

export async function getCurrentProfile(): Promise<Profile | null> {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select(profileSelect)
    .eq("user_id", user.id)
    .maybeSingle();

  if (data) {
    return mapProfile(data);
  }

  if (!user.email) {
    return null;
  }

  const { data: claimableProfile } = await supabase
    .from("profiles")
    .select(profileSelect)
    .is("user_id", null)
    .ilike("email", user.email)
    .maybeSingle();

  if (!claimableProfile) {
    return null;
  }

  const { data: linkedProfile } = await supabase
    .from("profiles")
    .update({
      user_id: user.id,
      updated_at: new Date().toISOString()
    })
    .eq("id", claimableProfile.id)
    .select(profileSelect)
    .maybeSingle();

  return linkedProfile ? mapProfile(linkedProfile) : mapProfile(claimableProfile);
}

export async function listProfiles(currentProfile: Profile | null): Promise<Profile[]> {
  if (!hasSupabaseEnv() || !isAdmin(currentProfile?.role)) {
    return [];
  }

  const supabase = await createProfileManagementClient();
  const { data } = await supabase
    .from("profiles")
    .select(profileSelect)
    .order("created_at", { ascending: false });

  const profiles = data?.map(mapProfile) ?? [];
  const profileIds = profiles.map((profile) => profile.id);
  const { data: events } =
    profileIds.length > 0
      ? await supabase
          .from("tool_download_counts")
          .select("profile_id,qr_download_count,background_remover_download_count")
          .in("profile_id", profileIds)
      : { data: [] as ToolDownloadCountRow[] };

  return applyDownloadCounts(profiles, (events ?? []) as ToolDownloadCountRow[]);
}

export async function createProfileAction(
  _: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const currentProfile = await getCurrentProfile();

  if (!isAdmin(currentProfile?.role)) {
    return { error: "Only Admin users can create profiles." };
  }

  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    clientId: formData.get("clientId") ?? "",
    accountStatus: formData.get("accountStatus") ?? "active"
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid profile details." };
  }

  if (parsed.data.role === "client" && !parsed.data.clientId) {
    return { error: "Select a client organization for Client users." };
  }

  let authUserId: string | null = null;

  if (parsed.data.password) {
    if (!hasSupabaseServiceRoleKey()) {
      return { error: "SUPABASE_SERVICE_ROLE_KEY is required to create login passwords from Admin." };
    }

    const adminSupabase = createAdminClient();
    const { data: authUser, error: authError } = await adminSupabase.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true,
      user_metadata: {
        full_name: parsed.data.fullName || parsed.data.email
      }
    });

    if (authError) {
      return { error: authError.message };
    }

    authUserId = authUser.user.id;
  }

  const [supabase, toolSettings] = await Promise.all([createProfileManagementClient(), getToolSettings()]);
  const { error } = await supabase.from("profiles").insert({
    user_id: authUserId,
    full_name: parsed.data.fullName || null,
    email: parsed.data.email,
    role: parsed.data.role,
    client_id: parsed.data.role === "client" ? parsed.data.clientId : null,
    account_status: parsed.data.accountStatus,
    tool_tokens: parsed.data.role === "client" ? toolSettings.defaultClientTokens : 0
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/users");
  return { success: authUserId ? "User login and profile created." : "Profile created." };
}

export async function updateProfileStatusAction(
  _: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const currentProfile = await getCurrentProfile();

  if (!isAdmin(currentProfile?.role)) {
    return { error: "Only Admin users can update profiles." };
  }

  const parsed = profileStatusSchema.safeParse({
    profileId: formData.get("profileId"),
    role: formData.get("role"),
    accountStatus: formData.get("accountStatus")
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid profile update." };
  }

  const supabase = await createProfileManagementClient();
  if (parsed.data.role === "client") {
    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("client_id")
      .eq("id", parsed.data.profileId)
      .maybeSingle();

    if (!targetProfile?.client_id) {
      return { error: "Client users must be linked to a client organization. Create a new linked Client profile instead." };
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      role: parsed.data.role,
      account_status: parsed.data.accountStatus,
      updated_at: new Date().toISOString()
    })
    .eq("id", parsed.data.profileId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/users");
  return { success: "Profile updated." };
}

export async function updateProfileAction(
  _: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const currentProfile = await getCurrentProfile();

  if (!isAdmin(currentProfile?.role)) {
    return { error: "Only Admin users can update profiles." };
  }

  const parsed = profileUpdateSchema.safeParse({
    profileId: formData.get("profileId"),
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    role: formData.get("role"),
    clientId: formData.get("clientId") ?? "",
    accountStatus: formData.get("accountStatus")
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid profile update." };
  }

  if (parsed.data.role === "client" && !parsed.data.clientId) {
    return { error: "Select a client organization for Client users." };
  }

  if (
    parsed.data.profileId === currentProfile.id &&
    (parsed.data.role !== "admin" || parsed.data.accountStatus !== "active")
  ) {
    return { error: "You cannot remove Admin access or deactivate your own account." };
  }

  const supabase = await createProfileManagementClient();
  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("id,user_id,email")
    .eq("id", parsed.data.profileId)
    .maybeSingle();

  if (!targetProfile) {
    return { error: "Profile not found." };
  }

  if (targetProfile.user_id && targetProfile.email !== parsed.data.email) {
    if (!hasSupabaseServiceRoleKey()) {
      return { error: "SUPABASE_SERVICE_ROLE_KEY is required to update linked login emails." };
    }

    const { error: authError } = await supabase.auth.admin.updateUserById(targetProfile.user_id, {
      email: parsed.data.email,
      user_metadata: {
        full_name: parsed.data.fullName || parsed.data.email
      }
    });

    if (authError) {
      return { error: authError.message };
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName || null,
      email: parsed.data.email,
      role: parsed.data.role,
      client_id: parsed.data.role === "client" ? parsed.data.clientId : null,
      account_status: parsed.data.accountStatus,
      updated_at: new Date().toISOString()
    })
    .eq("id", parsed.data.profileId);

  if (error) {
    return { error: error.message };
  }

  if (targetProfile.user_id && targetProfile.email === parsed.data.email && hasSupabaseServiceRoleKey()) {
    await supabase.auth.admin.updateUserById(targetProfile.user_id, {
      user_metadata: {
        full_name: parsed.data.fullName || parsed.data.email
      }
    });
  }

  revalidatePath("/dashboard/users");
  return { success: "User updated." };
}

export async function updateProfilePasswordAction(
  _: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const currentProfile = await getCurrentProfile();

  if (!isAdmin(currentProfile?.role)) {
    return { error: "Only Admin users can change user passwords." };
  }

  if (!hasSupabaseServiceRoleKey()) {
    return { error: "SUPABASE_SERVICE_ROLE_KEY is required to change user passwords from Admin." };
  }

  const parsed = profilePasswordSchema.safeParse({
    profileId: formData.get("profileId"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid password update." };
  }

  const supabase = createAdminClient();
  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("id", parsed.data.profileId)
    .maybeSingle();

  if (!targetProfile) {
    return { error: "Profile not found." };
  }

  if (!targetProfile.user_id) {
    return { error: "This profile is not linked to a login yet." };
  }

  const { error } = await supabase.auth.admin.updateUserById(targetProfile.user_id, {
    password: parsed.data.password
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/users");
  return { success: "Password updated." };
}

export async function deleteProfileAction(
  _: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const currentProfile = await getCurrentProfile();

  if (!isAdmin(currentProfile?.role)) {
    return { error: "Only Admin users can delete profiles." };
  }

  const parsed = profileDeleteSchema.safeParse({
    profileId: formData.get("profileId")
  });

  if (!parsed.success) {
    return { error: "Invalid profile." };
  }

  if (parsed.data.profileId === currentProfile.id) {
    return { error: "You cannot delete your own account." };
  }

  const supabase = await createProfileManagementClient();
  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("id", parsed.data.profileId)
    .maybeSingle();

  if (!targetProfile) {
    return { error: "Profile not found." };
  }

  if (targetProfile.user_id) {
    if (!hasSupabaseServiceRoleKey()) {
      return { error: "SUPABASE_SERVICE_ROLE_KEY is required to delete linked login users." };
    }

    const { error: authError } = await supabase.auth.admin.deleteUser(targetProfile.user_id);

    if (authError) {
      return { error: authError.message };
    }
  } else {
    const { error } = await supabase.from("profiles").delete().eq("id", parsed.data.profileId);

    if (error) {
      return { error: error.message };
    }
  }

  revalidatePath("/dashboard/users");
  return { success: "User deleted." };
}

export async function topUpProfileTokensAction(
  _: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const currentProfile = await getCurrentProfile();

  if (!isAdmin(currentProfile?.role)) {
    return { error: "Only Admin users can top up tokens." };
  }

  const parsed = profileTokenTopUpSchema.safeParse({
    profileId: formData.get("profileId"),
    amount: formData.get("amount")
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid token top up." };
  }

  const supabase = await createProfileManagementClient();
  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("role,tool_tokens")
    .eq("id", parsed.data.profileId)
    .maybeSingle();

  if (!targetProfile) {
    return { error: "Profile not found." };
  }

  if (targetProfile.role !== "client") {
    return { error: "Only Client users can receive tool tokens." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      tool_tokens: targetProfile.tool_tokens + parsed.data.amount,
      updated_at: new Date().toISOString()
    })
    .eq("id", parsed.data.profileId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/users");
  return { success: `${parsed.data.amount} tokens added.` };
}

export async function updateAccountSettingsAction(
  _: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const currentProfile = await getCurrentProfile();

  if (!currentProfile) {
    return { error: "You must be logged in to update account settings." };
  }

  const parsed = accountSettingsSchema.safeParse({
    fullName: formData.get("fullName"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid account update." };
  }

  if (!parsed.data.fullName && !parsed.data.password) {
    return { error: "Update your name, password, or both." };
  }

  const supabase = await createClient();

  if (parsed.data.fullName) {
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: parsed.data.fullName,
        updated_at: new Date().toISOString()
      })
      .eq("id", currentProfile.id);

    if (error) {
      return { error: error.message };
    }
  }

  if (parsed.data.password) {
    const { error } = await supabase.auth.updateUser({
      password: parsed.data.password
    });

    if (error) {
      return { error: error.message };
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  return { success: "Account updated." };
}
