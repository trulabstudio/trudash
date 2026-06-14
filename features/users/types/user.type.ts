import type { UserRole } from "@/config/roles";

export type AccountStatus = "active" | "inactive";

export type Profile = {
  id: string;
  userId: string | null;
  fullName: string | null;
  email: string;
  role: UserRole;
  clientId: string | null;
  accountStatus: AccountStatus;
};
