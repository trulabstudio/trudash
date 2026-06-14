import type { AccountStatus, ProjectStatus, TaskStatus } from "@/types/database.type";

export const accountStatusLabels: Record<AccountStatus, string> = {
  active: "Active",
  inactive: "Inactive"
};

export const projectStatusLabels: Record<ProjectStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
  on_hold: "On Hold"
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  completed: "Completed",
  blocked: "Blocked"
};
