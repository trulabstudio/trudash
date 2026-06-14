import { z } from "zod";

export const taskSchema = z.object({
  projectId: z.string().uuid("Select a project."),
  assignedToProfileId: z.string().uuid().optional().or(z.literal("")),
  taskName: z.string().min(2, "Task name is required."),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.enum(["todo", "in_progress", "completed", "blocked"]).default("todo"),
  finalLink: z.string().url("Enter a valid URL.").optional().or(z.literal("")),
  internalNotes: z.string().optional()
});

export const taskUpdateSchema = taskSchema.extend({
  taskId: z.string().uuid()
});

export const taskDeleteSchema = z.object({
  taskId: z.string().uuid()
});

export const taskStatusSchema = z.object({
  taskId: z.string().uuid(),
  status: z.enum(["todo", "in_progress", "completed", "blocked"]),
  finalLink: z.string().url("Enter a valid URL.").optional().or(z.literal(""))
});

export const taskCsvImportSchema = z.object({
  projectId: z.string().uuid("Select a project."),
  rows: z
    .array(
      z.object({
        taskName: z.string().min(2, "Each row needs a task_name."),
        description: z.string().optional(),
        dueDate: z.string().optional(),
        status: z.enum(["todo", "in_progress", "completed", "blocked"]).default("todo"),
        finalLink: z.string().url("Enter a valid final_link URL.").optional().or(z.literal("")),
        internalNotes: z.string().optional(),
        assignedToEmail: z.string().email("assigned_to_email must be a valid email.").optional().or(z.literal(""))
      })
    )
    .min(1, "CSV must contain at least one task.")
    .max(100, "Import up to 100 tasks at a time.")
});

export type TaskFormValues = z.infer<typeof taskSchema>;
export type TaskUpdateFormValues = z.infer<typeof taskUpdateSchema>;
export type TaskStatusFormValues = z.infer<typeof taskStatusSchema>;
export type TaskCsvImportValues = z.infer<typeof taskCsvImportSchema>;
