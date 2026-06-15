"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseServiceRoleKey } from "@/lib/supabase/env";

export type SharedTask = {
  taskName: string;
  description: string | null;
  dueDate: string | null;
  finalLink: string | null;
  projectName: string;
  clientName: string;
};

export type SharedProject = {
  projectName: string;
  description: string | null;
  dueDate: string | null;
  clientName: string;
  tasks: {
    taskName: string;
    description: string | null;
    dueDate: string | null;
    finalLink: string | null;
  }[];
};

async function getActiveShare(token: string, resourceType: "project" | "task") {
  if (!hasSupabaseServiceRoleKey()) {
    return null;
  }

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("share_links")
    .select("resource_id,expires_at")
    .eq("token", token)
    .eq("resource_type", resourceType)
    .eq("is_active", true)
    .maybeSingle();

  if (!data) {
    return null;
  }

  if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
    return null;
  }

  return data;
}

export async function getSharedTask(token: string): Promise<SharedTask | null> {
  const share = await getActiveShare(token, "task");

  if (!share) {
    return null;
  }

  const supabase = createAdminClient();
  const { data: task } = await supabase
    .from("tasks")
    .select("task_name,description,due_date,final_link,status,project_id")
    .eq("id", share.resource_id)
    .maybeSingle();

  if (!task || task.status !== "completed") {
    return null;
  }

  const { data: project } = await supabase
    .from("projects")
    .select("project_name,client_id")
    .eq("id", task.project_id)
    .maybeSingle();

  if (!project) {
    return null;
  }

  const { data: client } = await supabase
    .from("clients")
    .select("company_name")
    .eq("id", project.client_id)
    .maybeSingle();

  return {
    taskName: task.task_name,
    description: task.description,
    dueDate: task.due_date,
    finalLink: task.final_link,
    projectName: project.project_name,
    clientName: client?.company_name ?? "Client"
  };
}

export async function getSharedProject(token: string): Promise<SharedProject | null> {
  const share = await getActiveShare(token, "project");

  if (!share) {
    return null;
  }

  const supabase = createAdminClient();
  const { data: project } = await supabase
    .from("projects")
    .select("project_name,description,due_date,client_id")
    .eq("id", share.resource_id)
    .maybeSingle();

  if (!project) {
    return null;
  }

  const [{ data: client }, { data: tasks }] = await Promise.all([
    supabase.from("clients").select("company_name").eq("id", project.client_id).maybeSingle(),
    supabase
      .from("tasks")
      .select("task_name,description,due_date,final_link")
      .eq("project_id", share.resource_id)
      .eq("status", "completed")
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false })
  ]);

  return {
    projectName: project.project_name,
    description: project.description,
    dueDate: project.due_date,
    clientName: client?.company_name ?? "Client",
    tasks: (tasks ?? []).map((task) => ({
      taskName: task.task_name,
      description: task.description,
      dueDate: task.due_date,
      finalLink: task.final_link
    }))
  };
}
