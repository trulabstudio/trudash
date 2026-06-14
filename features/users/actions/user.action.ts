"use server";

import { revalidatePath } from "next/cache";

import { accountSettingsSchema, profileSchema, profileStatusSchema } from "@/features/users/schemas/user.schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv, hasSupabaseServiceRoleKey } from "@/lib/supabase/env";
import { isAdmin } from "@/lib/permissions/roles";
import type { Profile } from "@/features/users/types/user.type";
import type { Database } from "@/types/database.type";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileData = Pick<
  ProfileRow,
  "id" | "user_id" | "full_name" | "email" | "role" | "client_id" | "account_status"
>;

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
    accountStatus: data.account_status
  };
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
    .select("id,user_id,full_name,email,role,client_id,account_status")
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
    .select("id,user_id,full_name,email,role,client_id,account_status")
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
    .select("id,user_id,full_name,email,role,client_id,account_status")
    .maybeSingle();

  return linkedProfile ? mapProfile(linkedProfile) : mapProfile(claimableProfile);
}

export async function listProfiles(currentProfile: Profile | null): Promise<Profile[]> {
  if (!hasSupabaseEnv() || !isAdmin(currentProfile?.role)) {
    return [];
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return data?.map(mapProfile) ?? [];
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
    clientId: formData.get("clientId"),
    accountStatus: formData.get("accountStatus") ?? "active"
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid profile details." };
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

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").insert({
    user_id: authUserId,
    full_name: parsed.data.fullName || null,
    email: parsed.data.email,
    role: parsed.data.role,
    client_id: parsed.data.clientId || null,
    account_status: parsed.data.accountStatus
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

  const supabase = await createClient();
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
