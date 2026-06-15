"use server";

import { revalidatePath } from "next/cache";

import {
  projectAssignmentSchema,
  projectDeleteSchema,
  projectSchema,
  projectUpdateSchema
} from "@/features/projects/schemas/project.schema";
import type { Project, ProjectAssignment } from "@/features/projects/types/project.type";
import { calculateProjectProgress } from "@/features/tasks/types/task.type";
import type { Profile } from "@/features/users/types/user.type";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { canCreateProjects } from "@/lib/permissions/resources";
import type { Database } from "@/types/database.type";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
type ProjectAssignmentRow = Database["public"]["Tables"]["project_assignments"]["Row"];

export type ProjectActionState = {
  error?: string;
  success?: string;
};

function mapProjectAssignment(row: ProjectAssignmentRow, profiles: Profile[]): ProjectAssignment {
  const profile = profiles.find((item) => item.id === row.profile_id);

  return {
    id: row.id,
    projectId: row.project_id,
    profileId: row.profile_id,
    profileName: profile?.fullName,
    profileEmail: profile?.email,
    createdAt: row.created_at
  };
}

function mapProject(row: ProjectRow, clients: ClientRow[], tasks: TaskRow[]): Project {
  const projectTasks = tasks.filter((task) => task.project_id === row.id);
  const completedTasks = projectTasks.filter((task) => task.status === "completed").length;

  return {
    id: row.id,
    clientId: row.client_id,
    clientName: clients.find((client) => client.id === row.client_id)?.company_name,
    projectName: row.project_name,
    description: row.description,
    startDate: row.start_date,
    dueDate: row.due_date,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    progress: calculateProjectProgress(projectTasks),
    totalTasks: projectTasks.length,
    completedTasks
  };
}

function compareByDueDate<T extends { dueDate: string | null; createdAt: string }>(a: T, b: T) {
  if (a.dueDate && b.dueDate) {
    return a.dueDate.localeCompare(b.dueDate);
  }

  if (a.dueDate) {
    return -1;
  }

  if (b.dueDate) {
    return 1;
  }

  return b.createdAt.localeCompare(a.createdAt);
}

export async function listProjects(profile: Profile | null): Promise<Project[]> {
  if (!hasSupabaseEnv() || !profile) {
    return [];
  }

  const supabase = await createSupabaseClient();
  let projects: ProjectRow[] = [];

  if (profile.role === "admin") {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });
    projects = data ?? [];
  }

  if (profile.role === "client" && profile.clientId) {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("client_id", profile.clientId)
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });
    projects = data ?? [];
  }

  if (profile.role === "team_member") {
    const { data: assignments } = await supabase
      .from("project_assignments")
      .select("project_id")
      .eq("profile_id", profile.id);
    const projectIds = assignments?.map((assignment) => assignment.project_id) ?? [];

    if (projectIds.length > 0) {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .in("id", projectIds)
        .order("due_date", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });
      projects = data ?? [];
    }
  }

  const clientIds = Array.from(new Set(projects.map((project) => project.client_id)));
  const projectIds = projects.map((project) => project.id);

  const { data: clients } =
    clientIds.length > 0
      ? await supabase.from("clients").select("*").in("id", clientIds)
      : { data: [] as ClientRow[] };

  const { data: tasks } =
    projectIds.length > 0
      ? await supabase.from("tasks").select("*").in("project_id", projectIds)
      : { data: [] as TaskRow[] };

  return projects
    .map((project) => mapProject(project, clients ?? [], tasks ?? []))
    .sort(compareByDueDate);
}

export async function getProjectById(projectId: string, profile: Profile | null): Promise<Project | null> {
  const projects = await listProjects(profile);
  return projects.find((project) => project.id === projectId) ?? null;
}

export async function listProjectAssignments(
  projectId: string,
  profile: Profile | null,
  profiles: Profile[]
): Promise<ProjectAssignment[]> {
  if (!hasSupabaseEnv() || profile?.role !== "admin") {
    return [];
  }

  const supabase = await createSupabaseClient();
  const { data } = await supabase
    .from("project_assignments")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  return data?.map((assignment) => mapProjectAssignment(assignment, profiles)) ?? [];
}

export async function createProjectAction(
  _: ProjectActionState,
  formData: FormData
): Promise<ProjectActionState> {
  const profile = await import("@/features/users/actions/user.action").then((mod) => mod.getCurrentProfile());

  if (!canCreateProjects(profile)) {
    return { error: "Only Admin users can create projects." };
  }

  const parsed = projectSchema.safeParse({
    clientId: formData.get("clientId"),
    projectName: formData.get("projectName"),
    description: formData.get("description"),
    startDate: formData.get("startDate"),
    dueDate: formData.get("dueDate"),
    status: formData.get("status") ?? "not_started"
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid project details." };
  }

  const supabase = await createSupabaseClient();
  const { error } = await supabase.from("projects").insert({
    client_id: parsed.data.clientId,
    project_name: parsed.data.projectName,
    description: parsed.data.description || null,
    start_date: parsed.data.startDate || null,
    due_date: parsed.data.dueDate || null,
    status: parsed.data.status
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/projects");
  return { success: "Project created." };
}

export async function assignTeamMemberAction(
  _: ProjectActionState,
  formData: FormData
): Promise<ProjectActionState> {
  const profile = await import("@/features/users/actions/user.action").then((mod) => mod.getCurrentProfile());

  if (profile?.role !== "admin") {
    return { error: "Only Admin users can assign team members." };
  }

  const parsed = projectAssignmentSchema.safeParse({
    projectId: formData.get("projectId"),
    profileId: formData.get("profileId")
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid assignment details." };
  }

  const supabase = await createSupabaseClient();
  const { error } = await supabase.from("project_assignments").upsert(
    {
      project_id: parsed.data.projectId,
      profile_id: parsed.data.profileId
    },
    {
      onConflict: "project_id,profile_id"
    }
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/dashboard/projects/${parsed.data.projectId}`);
  revalidatePath("/dashboard/projects");
  return { success: "Team member assigned." };
}

export async function updateProjectAction(
  _: ProjectActionState,
  formData: FormData
): Promise<ProjectActionState> {
  const profile = await import("@/features/users/actions/user.action").then((mod) => mod.getCurrentProfile());

  if (!canCreateProjects(profile)) {
    return { error: "Only Admin users can update projects." };
  }

  const parsed = projectUpdateSchema.safeParse({
    projectId: formData.get("projectId"),
    clientId: formData.get("clientId"),
    projectName: formData.get("projectName"),
    description: formData.get("description"),
    startDate: formData.get("startDate"),
    dueDate: formData.get("dueDate"),
    status: formData.get("status") ?? "not_started"
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid project update." };
  }

  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from("projects")
    .update({
      client_id: parsed.data.clientId,
      project_name: parsed.data.projectName,
      description: parsed.data.description || null,
      start_date: parsed.data.startDate || null,
      due_date: parsed.data.dueDate || null,
      status: parsed.data.status
    })
    .eq("id", parsed.data.projectId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/projects/${parsed.data.projectId}`);
  return { success: "Project updated." };
}

export async function deleteProjectAction(
  _: ProjectActionState,
  formData: FormData
): Promise<ProjectActionState> {
  const profile = await import("@/features/users/actions/user.action").then((mod) => mod.getCurrentProfile());

  if (!canCreateProjects(profile)) {
    return { error: "Only Admin users can delete projects." };
  }

  const parsed = projectDeleteSchema.safeParse({
    projectId: formData.get("projectId")
  });

  if (!parsed.success) {
    return { error: "Invalid project." };
  }

  const supabase = await createSupabaseClient();
  const { error } = await supabase.from("projects").delete().eq("id", parsed.data.projectId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/projects");
  return { success: "Project deleted." };
}
