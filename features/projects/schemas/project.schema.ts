import { z } from "zod";

export const projectSchema = z.object({
  clientId: z.string().uuid("Select a client."),
  assignedProfileId: z.string().uuid("Select a team member.").optional().or(z.literal("")),
  projectName: z.string().min(2, "Project name is required."),
  description: z.string().optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.enum(["not_started", "in_progress", "completed", "on_hold"]).default("not_started")
});

export const projectUpdateSchema = projectSchema.omit({ assignedProfileId: true }).extend({
  projectId: z.string().uuid()
});

export const projectDeleteSchema = z.object({
  projectId: z.string().uuid()
});

export const projectAssignmentSchema = z.object({
  projectId: z.string().uuid("Project is required."),
  profileId: z.string().uuid("Team member is required.")
});

export type ProjectFormValues = z.infer<typeof projectSchema>;
export type ProjectUpdateFormValues = z.infer<typeof projectUpdateSchema>;
export type ProjectAssignmentFormValues = z.infer<typeof projectAssignmentSchema>;
