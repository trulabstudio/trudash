"use server";

import { revalidatePath } from "next/cache";

import { clientDeleteSchema, clientSchema, clientUpdateSchema } from "@/features/clients/schemas/client.schema";
import type { Client } from "@/features/clients/types/client.type";
import type { Profile } from "@/features/users/types/user.type";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { canManageClients } from "@/lib/permissions/resources";
import type { Database } from "@/types/database.type";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

export type ClientActionState = {
  error?: string;
  success?: string;
};

function mapClient(row: ClientRow): Client {
  return {
    id: row.id,
    companyName: row.company_name,
    contactPerson: row.contact_person,
    email: row.email,
    phoneNumber: row.phone_number,
    loginAccess: row.login_access,
    accountStatus: row.account_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function listClients(profile: Profile | null): Promise<Client[]> {
  if (!hasSupabaseEnv() || !profile) {
    return [];
  }

  const supabase = await createSupabaseClient();

  if (profile.role === "admin") {
    const { data } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
    return data?.map(mapClient) ?? [];
  }

  if (profile.role === "client" && profile.clientId) {
    const { data } = await supabase.from("clients").select("*").eq("id", profile.clientId);
    return data?.map(mapClient) ?? [];
  }

  const { data: assignments } = await supabase
    .from("project_assignments")
    .select("project_id")
    .eq("profile_id", profile.id);
  const projectIds = assignments?.map((assignment) => assignment.project_id) ?? [];

  if (projectIds.length === 0) {
    return [];
  }

  const { data: projects } = await supabase.from("projects").select("client_id").in("id", projectIds);
  const clientIds = Array.from(new Set(projects?.map((project) => project.client_id) ?? []));

  if (clientIds.length === 0) {
    return [];
  }

  const { data } = await supabase.from("clients").select("*").in("id", clientIds);
  return data?.map(mapClient) ?? [];
}

export async function getClientById(clientId: string, profile: Profile | null): Promise<Client | null> {
  if (!hasSupabaseEnv() || !profile) {
    return null;
  }

  const clients = await listClients(profile);
  return clients.find((client) => client.id === clientId) ?? null;
}

export async function createClientAction(
  _: ClientActionState,
  formData: FormData
): Promise<ClientActionState> {
  const profile = await import("@/features/users/actions/user.action").then((mod) => mod.getCurrentProfile());

  if (!canManageClients(profile)) {
    return { error: "Only Admin users can create clients." };
  }

  const parsed = clientSchema.safeParse({
    companyName: formData.get("companyName"),
    contactPerson: formData.get("contactPerson"),
    email: formData.get("email"),
    phoneNumber: formData.get("phoneNumber"),
    loginAccess: formData.get("loginAccess") === "on",
    accountStatus: formData.get("accountStatus") ?? "active"
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid client details." };
  }

  const supabase = await createSupabaseClient();
  const { error } = await supabase.from("clients").insert({
    company_name: parsed.data.companyName,
    contact_person: parsed.data.contactPerson || null,
    email: parsed.data.email,
    phone_number: parsed.data.phoneNumber || null,
    login_access: parsed.data.loginAccess,
    account_status: parsed.data.accountStatus
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/clients");
  return { success: "Client created." };
}

export async function updateClientAction(
  _: ClientActionState,
  formData: FormData
): Promise<ClientActionState> {
  const profile = await import("@/features/users/actions/user.action").then((mod) => mod.getCurrentProfile());

  if (!canManageClients(profile)) {
    return { error: "Only Admin users can update clients." };
  }

  const parsed = clientUpdateSchema.safeParse({
    clientId: formData.get("clientId"),
    companyName: formData.get("companyName"),
    contactPerson: formData.get("contactPerson"),
    email: formData.get("email"),
    phoneNumber: formData.get("phoneNumber"),
    loginAccess: formData.get("loginAccess") === "on",
    accountStatus: formData.get("accountStatus") ?? "active"
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid client update." };
  }

  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from("clients")
    .update({
      company_name: parsed.data.companyName,
      contact_person: parsed.data.contactPerson || null,
      email: parsed.data.email,
      phone_number: parsed.data.phoneNumber || null,
      login_access: parsed.data.loginAccess,
      account_status: parsed.data.accountStatus
    })
    .eq("id", parsed.data.clientId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/clients");
  revalidatePath(`/dashboard/clients/${parsed.data.clientId}`);
  return { success: "Client updated." };
}

export async function deleteClientAction(
  _: ClientActionState,
  formData: FormData
): Promise<ClientActionState> {
  const profile = await import("@/features/users/actions/user.action").then((mod) => mod.getCurrentProfile());

  if (!canManageClients(profile)) {
    return { error: "Only Admin users can delete clients." };
  }

  const parsed = clientDeleteSchema.safeParse({
    clientId: formData.get("clientId")
  });

  if (!parsed.success) {
    return { error: "Invalid client." };
  }

  const supabase = await createSupabaseClient();
  const { error } = await supabase.from("clients").delete().eq("id", parsed.data.clientId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/clients");
  return { success: "Client deleted." };
}
