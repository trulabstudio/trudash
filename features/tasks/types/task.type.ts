import type { TaskStatus } from "@/types/database.type";

export type Task = {
  id: string;
  projectId: string;
  projectName?: string;
  clientName?: string;
  assignedToProfileId: string | null;
  taskName: string;
  description: string | null;
  dueDate: string | null;
  status: TaskStatus;
  finalLink: string | null;
  internalNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

export function calculateProjectProgress(tasks: Pick<Task, "status">[]) {
  if (tasks.length === 0) {
    return 0;
  }

  const completedTasks = tasks.filter((task) => task.status === "completed").length;
  return Math.round((completedTasks / tasks.length) * 100);
}
