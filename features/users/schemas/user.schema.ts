import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.").optional().or(z.literal("")),
  role: z.enum(["admin", "team_member", "client"]),
  clientId: z.string().uuid().optional().or(z.literal("")),
  accountStatus: z.enum(["active", "inactive"]).default("active")
});

export const profileStatusSchema = z.object({
  profileId: z.string().uuid(),
  role: z.enum(["admin", "team_member", "client"]),
  accountStatus: z.enum(["active", "inactive"])
});

export const profileUpdateSchema = z.object({
  profileId: z.string().uuid(),
  fullName: z.string().optional(),
  email: z.string().email("Enter a valid email address."),
  role: z.enum(["admin", "team_member", "client"]),
  clientId: z.string().uuid().optional().or(z.literal("")),
  accountStatus: z.enum(["active", "inactive"])
});

export const profilePasswordSchema = z.object({
  profileId: z.string().uuid(),
  password: z.string().min(8, "Password must be at least 8 characters.")
});

export const profileDeleteSchema = z.object({
  profileId: z.string().uuid()
});

export const profileTokenTopUpSchema = z.object({
  profileId: z.string().uuid(),
  amount: z.coerce.number().int().min(1, "Enter at least 1 token.").max(10000, "Top up amount is too high.")
});

export const accountSettingsSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters.").optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters.").optional().or(z.literal(""))
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type ProfileStatusFormValues = z.infer<typeof profileStatusSchema>;
export type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>;
export type ProfilePasswordFormValues = z.infer<typeof profilePasswordSchema>;
export type ProfileTokenTopUpFormValues = z.infer<typeof profileTokenTopUpSchema>;
export type AccountSettingsFormValues = z.infer<typeof accountSettingsSchema>;
