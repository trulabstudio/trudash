import { z } from "zod";

export const toolSettingsSchema = z.object({
  defaultClientTokens: z.coerce.number().int().min(0).max(100000),
  qrDownloadCost: z.coerce.number().int().min(0).max(100000),
  backgroundRemoverDownloadCost: z.coerce.number().int().min(0).max(100000),
  pricePer10TokensRm: z.coerce.number().min(0).max(100000),
  bankName: z.string().min(2, "Bank name is required."),
  bankAccountNumber: z.string().min(4, "Bank account number is required."),
  bankAccountName: z.string().min(2, "Bank account name is required."),
  whatsappNumber: z.string().min(8, "WhatsApp number is required.")
});

export type ToolSettingsFormValues = z.infer<typeof toolSettingsSchema>;
