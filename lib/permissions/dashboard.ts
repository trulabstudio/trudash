import { dashboardNavigation } from "@/config/navigation";
import type { UserRole } from "@/config/roles";

export function getNavigationForRole(role: UserRole | null | undefined) {
  if (!role) {
    return dashboardNavigation.filter((item) => item.href === "/dashboard");
  }

  return dashboardNavigation.filter((item) => item.roles.includes(role));
}
