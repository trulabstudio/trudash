import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.")
});

export const passwordRecoverySchema = z.object({
  email: z.string().email("Enter a valid email address.")
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type PasswordRecoveryFormValues = z.infer<typeof passwordRecoverySchema>;
