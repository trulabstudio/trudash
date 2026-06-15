import {
  BarChart3,
  BriefcaseBusiness,
  CheckSquare,
  Image,
  QrCode,
  Settings,
  UserCog,
  Users
} from "lucide-react";

import type { UserRole } from "@/config/roles";

export type NavigationItem = {
  label: string;
  href: string;
  icon: typeof BarChart3;
  roles: UserRole[];
};

export const dashboardNavigation: NavigationItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: BarChart3,
    roles: ["admin", "team_member", "client"]
  },
  {
    label: "Client Orgs",
    href: "/dashboard/clients",
    icon: Users,
    roles: ["admin", "team_member"]
  },
  {
    label: "User Accounts",
    href: "/dashboard/users",
    icon: UserCog,
    roles: ["admin"]
  },
  {
    label: "Projects",
    href: "/dashboard/projects",
    icon: BriefcaseBusiness,
    roles: ["admin", "team_member", "client"]
  },
  {
    label: "Tasks",
    href: "/dashboard/tasks",
    icon: CheckSquare,
    roles: ["admin", "team_member", "client"]
  },
  {
    label: "QR Generator",
    href: "/dashboard/tools/qr-generator",
    icon: QrCode,
    roles: ["admin", "team_member", "client"]
  },
  {
    label: "Background Remover",
    href: "/dashboard/tools/background-remover",
    icon: Image,
    roles: ["admin", "team_member", "client"]
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["admin", "team_member", "client"]
  }
];
