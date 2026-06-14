import type { Profile } from "@/features/users/types/user.type";

export function canManageClients(profile: Profile | null) {
  return profile?.role === "admin";
}

export function canCreateProjects(profile: Profile | null) {
  return profile?.role === "admin";
}

export function canCreateTasks(profile: Profile | null) {
  return profile?.role === "admin";
}

export function canUpdateTask(profile: Profile | null, assignedProfileId?: string | null) {
  if (!profile) {
    return false;
  }

  if (profile.role === "admin") {
    return true;
  }

  return profile.role === "team_member" && profile.id === assignedProfileId;
}

export function canViewInternalNotes(profile: Profile | null) {
  return profile?.role === "admin" || profile?.role === "team_member";
}
