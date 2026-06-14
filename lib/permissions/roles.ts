import type { UserRole } from "@/config/roles";

export function isAdmin(role: UserRole | null | undefined) {
  return role === "admin";
}

export function isTeamMember(role: UserRole | null | undefined) {
  return role === "team_member";
}

export function isClient(role: UserRole | null | undefined) {
  return role === "client";
}

export function canAccessDashboard(role: UserRole | null | undefined) {
  return Boolean(role);
}
