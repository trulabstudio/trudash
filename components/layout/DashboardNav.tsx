"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BriefcaseBusiness, CheckSquare, Image, QrCode, Settings, UserCog, Users } from "lucide-react";

import { cn } from "@/lib/helpers/cn";

type DashboardNavProps = {
  items: {
    label: string;
    href: string;
  }[];
  variant?: "sidebar" | "mobile";
};

const iconsByHref = {
  "/dashboard": BarChart3,
  "/dashboard/clients": Users,
  "/dashboard/users": UserCog,
  "/dashboard/projects": BriefcaseBusiness,
  "/dashboard/tasks": CheckSquare,
  "/dashboard/tools/qr-generator": QrCode,
  "/dashboard/tools/background-remover": Image,
  "/dashboard/settings": Settings
};

export function DashboardNav({ items, variant = "sidebar" }: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        variant === "sidebar" && "space-y-1",
        variant === "mobile" && "flex gap-2 overflow-x-auto pb-1"
      )}
      aria-label="Dashboard navigation"
    >
      {items.map((item) => {
        const Icon = iconsByHref[item.href as keyof typeof iconsByHref] ?? BarChart3;
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
              variant === "mobile" && "shrink-0 border border-border bg-surface",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon aria-hidden="true" className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
