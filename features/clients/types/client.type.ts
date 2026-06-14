import type { AccountStatus } from "@/types/database.type";

export type Client = {
  id: string;
  companyName: string;
  contactPerson: string | null;
  email: string;
  phoneNumber: string | null;
  loginAccess: boolean;
  accountStatus: AccountStatus;
  createdAt: string;
  updatedAt: string;
};
