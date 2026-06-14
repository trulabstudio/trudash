"use server";

import { revalidatePath } from "next/cache";

import {
  taskCsvImportSchema,
  taskDeleteSchema,
  taskSchema,
  taskStatusSchema,
  taskUpdateSchema
} from "@/features/tasks/schemas/task.schema";
import type { Task } from "@/features/tasks/types/task.type";
import type { Profile } from "@/features/users/types/user.type";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { canCreateTasks, canUpdateTask, canViewInternalNotes } from "@/lib/permissions/resources";
import type { Database } from "@/types/database.type";

type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
type TaskSelectRow = Omit<TaskRow, "internal_notes"> & {
  internal_notes?: string | null;
};
type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

export type TaskActionState = {
  error?: string;
  success?: string;
};

function mapTask(row: TaskSelectRow, projects: ProjectRow[], clients: ClientRow[], profile: Profile | null): Task {
  const project = projects.find((item) => item.id === row.project_id);
  const client = clients.find((item) => item.id === project?.client_id);

  return {
    id: row.id,
    projectId: row.project_id,
    projectName: project?.project_name,
    clientName: client?.company_name,
    assignedToProfileId: row.assigned_to_profile_id,
    taskName: row.task_name,
    description: row.description,
    dueDate: row.due_date,
    status: row.status,
    finalLink: row.final_link,
    internalNotes: canViewInternalNotes(profile) ? (row.internal_notes ?? null) : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function listTasks(profile: Profile | null, projectId?: string): Promise<Task[]> {
  if (!hasSupabaseEnv() || !profile) {
    return [];
  }

  const supabase = await createSupabaseClient();
  let projectIds: string[] = [];

  if (projectId) {
    projectIds = [projectId];
  } else if (profile.role === "admin") {
    const { data } = await supabase.from("projects").select("id");
    projectIds = data?.map((project) => project.id) ?? [];
  } else if (profile.role === "client" && profile.clientId) {
    const { data } = await supabase.from("projects").select("id").eq("client_id", profile.clientId);
    projectIds = data?.map((project) => project.id) ?? [];
  } else if (profile.role === "team_member") {
    const { data } = await supabase
      .from("project_assignments")
      .select("project_id")
      .eq("profile_id", profile.id);
    projectIds = data?.map((assignment) => assignment.project_id) ?? [];
  }

  if (projectIds.length === 0) {
    return [];
  }

  const { data: tasks } =
    profile.role === "client"
      ? await supabase
          .from("tasks")
          .select(
            "id,project_id,assigned_to_profile_id,task_name,description,due_date,status,final_link,created_at,updated_at"
          )
          .in("project_id", projectIds)
          .order("created_at", { ascending: false })
      : profile.role === "team_member"
        ? await supabase
            .from("tasks")
            .select("*")
            .in("project_id", projectIds)
            .eq("assigned_to_profile_id", profile.id)
            .order("created_at", { ascending: false })
        : await supabase.from("tasks").select("*").in("project_id", projectIds).order("created_at", {
            ascending: false
          });
  const { data: projects } = await supabase.from("projects").select("*").in("id", projectIds);
  const clientIds = Array.from(new Set(projects?.map((project) => project.client_id) ?? []));
  const { data: clients } =
    clientIds.length > 0
      ? await supabase.from("clients").select("*").in("id", clientIds)
      : { data: [] as ClientRow[] };

  return ((tasks ?? []) as TaskSelectRow[]).map((task) => mapTask(task, projects ?? [], clients ?? [], profile));
}

export async function createTaskAction(_: TaskActionState, formData: FormData): Promise<TaskActionState> {
  const profile = await import("@/features/users/actions/user.action").then((mod) => mod.getCurrentProfile());

  if (!canCreateTasks(profile)) {
    return { error: "Only Admin users can create tasks." };
  }

  const parsed = taskSchema.safeParse({
    projectId: formData.get("projectId"),
    assignedToProfileId: formData.get("assignedToProfileId"),
    taskName: formData.get("taskName"),
    description: formData.get("description"),
    dueDate: formData.get("dueDate"),
    status: formData.get("status") ?? "todo",
    finalLink: formData.get("finalLink"),
    internalNotes: formData.get("internalNotes")
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid task details." };
  }

  const supabase = await createSupabaseClient();
  const { error } = await supabase.from("tasks").insert({
    project_id: parsed.data.projectId,
    assigned_to_profile_id: parsed.data.assignedToProfileId || null,
    task_name: parsed.data.taskName,
    description: parsed.data.description || null,
    due_date: parsed.data.dueDate || null,
    status: parsed.data.status,
    final_link: parsed.data.finalLink || null,
    internal_notes: parsed.data.internalNotes || null
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard/projects");
  return { success: "Task created." };
}

export async function importTasksCsvAction(_: TaskActionState, formData: FormData): Promise<TaskActionState> {
  const profile = await import("@/features/users/actions/user.action").then((mod) => mod.getCurrentProfile());

  if (!canCreateTasks(profile)) {
    return { error: "Only Admin users can import tasks." };
  }

  const rawRows = formData.get("csvRows")?.toString() ?? "[]";
  let rows: unknown;

  try {
    rows = JSON.parse(rawRows);
  } catch {
    return { error: "CSV could not be read. Check the file format and try again." };
  }

  const parsed = taskCsvImportSchema.safeParse({
    projectId: formData.get("projectId"),
    rows
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid CSV import." };
  }

  const supabase = await createSupabaseClient();
  const assignedEmails = Array.from(
    new Set(
      parsed.data.rows
        .map((row) => row.assignedToEmail?.trim().toLowerCase())
        .filter((email): email is string => Boolean(email))
    )
  );
  const { data: assignees } =
    assignedEmails.length > 0
      ? await supabase.from("profiles").select("id,email,role").eq("role", "team_member")
      : { data: [] as { id: string; email: string; role: string }[] };
  const assigneesByEmail = new Map(
    (assignees ?? [])
      .map((assignee) => [assignee.email.toLowerCase(), assignee.id])
  );
  const missingAssignees = assignedEmails.filter((email) => !assigneesByEmail.has(email));

  if (missingAssignees.length > 0) {
    return { error: `Assigned team member not found: ${missingAssignees.slice(0, 3).join(", ")}` };
  }

  const { error } = await supabase.from("tasks").insert(
    parsed.data.rows.map((row) => ({
      project_id: parsed.data.projectId,
      assigned_to_profile_id: row.assignedToEmail
        ? assigneesByEmail.get(row.assignedToEmail.trim().toLowerCase()) ?? null
        : null,
      task_name: row.taskName,
      description: row.description || null,
      due_date: row.dueDate || null,
      status: row.status,
      final_link: row.finalLink || null,
      internal_notes: row.internalNotes || null
    }))
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard/projects");
  return { success: `${parsed.data.rows.length} tasks imported.` };
}

export async function updateTaskStatusAction(
  _: TaskActionState,
  formData: FormData
): Promise<TaskActionState> {
  const profile = await import("@/features/users/actions/user.action").then((mod) => mod.getCurrentProfile());
  const parsed = taskStatusSchema.safeParse({
    taskId: formData.get("taskId"),
    status: formData.get("status"),
    finalLink: formData.get("finalLink")
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid task update." };
  }

  const supabase = await createSupabaseClient();
  const { data: task } = await supabase
    .from("tasks")
    .select("assigned_to_profile_id")
    .eq("id", parsed.data.taskId)
    .maybeSingle();

  if (!canUpdateTask(profile, task?.assigned_to_profile_id)) {
    return { error: "You do not have permission to update this task." };
  }

  const { error } = await supabase
    .from("tasks")
    .update({
      status: parsed.data.status,
      final_link: parsed.data.finalLink || null,
      updated_at: new Date().toISOString()
    })
    .eq("id", parsed.data.taskId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard/projects");
  return { success: "Task updated." };
}

export async function updateTaskAction(_: TaskActionState, formData: FormData): Promise<TaskActionState> {
  const profile = await import("@/features/users/actions/user.action").then((mod) => mod.getCurrentProfile());

  if (!canCreateTasks(profile)) {
    return { error: "Only Admin users can update task details." };
  }

  const parsed = taskUpdateSchema.safeParse({
    taskId: formData.get("taskId"),
    projectId: formData.get("projectId"),
    assignedToProfileId: formData.get("assignedToProfileId"),
    taskName: formData.get("taskName"),
    description: formData.get("description"),
    dueDate: formData.get("dueDate"),
    status: formData.get("status") ?? "todo",
    finalLink: formData.get("finalLink"),
    internalNotes: formData.get("internalNotes")
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid task update." };
  }

  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from("tasks")
    .update({
      project_id: parsed.data.projectId,
      assigned_to_profile_id: parsed.data.assignedToProfileId || null,
      task_name: parsed.data.taskName,
      description: parsed.data.description || null,
      due_date: parsed.data.dueDate || null,
      status: parsed.data.status,
      final_link: parsed.data.finalLink || null,
      internal_notes: parsed.data.internalNotes || null
    })
    .eq("id", parsed.data.taskId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard/projects");
  return { success: "Task details updated." };
}

export async function deleteTaskAction(_: TaskActionState, formData: FormData): Promise<TaskActionState> {
  const profile = await import("@/features/users/actions/user.action").then((mod) => mod.getCurrentProfile());

  if (!canCreateTasks(profile)) {
    return { error: "Only Admin users can delete tasks." };
  }

  const parsed = taskDeleteSchema.safeParse({
    taskId: formData.get("taskId")
  });

  if (!parsed.success) {
    return { error: "Invalid task." };
  }

  const supabase = await createSupabaseClient();
  const { error } = await supabase.from("tasks").delete().eq("id", parsed.data.taskId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard/projects");
  return { success: "Task deleted." };
}
