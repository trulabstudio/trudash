import type { ProjectStatus } from "@/types/database.type";

export type Project = {
  id: string;
  clientId: string;
  clientName?: string;
  projectName: string;
  description: string | null;
  startDate: string | null;
  dueDate: string | null;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  progress: number;
  totalTasks: number;
  completedTasks: number;
};

export type ProjectAssignment = {
  id: string;
  projectId: string;
  profileId: string;
  profileName?: string | null;
  profileEmail?: string;
  createdAt: string;
};
