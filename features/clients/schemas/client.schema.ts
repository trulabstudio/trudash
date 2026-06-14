import { z } from "zod";

export const clientSchema = z.object({
  companyName: z.string().min(2, "Company name is required."),
  contactPerson: z.string().optional(),
  email: z.string().email("Enter a valid email address."),
  phoneNumber: z.string().optional(),
  loginAccess: z.coerce.boolean().default(false),
  accountStatus: z.enum(["active", "inactive"]).default("active")
});

export const clientUpdateSchema = clientSchema.extend({
  clientId: z.string().uuid()
});

export const clientDeleteSchema = z.object({
  clientId: z.string().uuid()
});

export type ClientFormValues = z.infer<typeof clientSchema>;
export type ClientUpdateFormValues = z.infer<typeof clientUpdateSchema>;
