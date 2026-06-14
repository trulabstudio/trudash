export const USER_ROLES = {
  admin: "Admin",
  team_member: "Team Member",
  client: "Client"
} as const;

export type UserRole = keyof typeof USER_ROLES;

export const INTERNAL_ROLES: UserRole[] = ["admin", "team_member"];
