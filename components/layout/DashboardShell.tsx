import Link from "next/link";

import { DashboardNav } from "@/components/layout/DashboardNav";
import { BrandMark } from "@/components/shared/BrandMark";
import { siteConfig } from "@/config/site";
import { signOutAction } from "@/features/auth/actions/auth.action";
import { getCurrentProfile } from "@/features/users/actions/user.action";
import { getNavigationForRole } from "@/lib/permissions/dashboard";
import { hasSupabaseEnv } from "@/lib/supabase/env";

type DashboardShellProps = {
  children: React.ReactNode;
};

export async function DashboardShell({ children }: DashboardShellProps) {
  const profile = await getCurrentProfile();
  const navigation = getNavigationForRole(hasSupabaseEnv() ? profile?.role : "admin");
  const navigationItems = navigation.map(({ href, label }) => ({ href, label }));

  return (
    <div className="min-h-screen bg-background bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.08),transparent_32rem)]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-surface/95 p-4 shadow-sm md:flex md:flex-col">
        <div className="mb-6 border-b border-border pb-5">
          <Link href="/" className="flex items-center gap-3">
            <BrandMark size="sm" />
            <div>
              <span className="block text-base font-semibold text-foreground">
                {siteConfig.name}
              </span>
              <span className="block text-xs text-muted-foreground">
                Project operations
              </span>
            </div>
          </Link>
        </div>
        <DashboardNav items={navigationItems} />
      </aside>
      <div className="md:pl-64">
        <header className="sticky top-0 z-10 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/"
              className="min-w-0 flex items-center gap-2 text-sm font-semibold text-foreground md:hidden"
            >
              <BrandMark size="sm" />
              <span className="truncate">{siteConfig.name}</span>
            </Link>
            <div className="ml-auto flex min-w-0 items-center gap-2 text-sm text-muted-foreground md:gap-3">
              <span className="max-w-[36vw] truncate rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground sm:max-w-[44vw] md:max-w-none">
                {profile?.fullName ?? profile?.email ?? "Profile setup required"}
              </span>
              {hasSupabaseEnv() ? (
                <form action={signOutAction}>
                  <button className="shrink-0 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted">
                    Sign out
                  </button>
                </form>
              ) : null}
            </div>
          </div>
          <div className="mt-3 md:hidden">
            <DashboardNav items={navigationItems} variant="mobile" />
          </div>
        </header>
        <main className="px-4 py-6 sm:px-5 md:px-8">{children}</main>
      </div>
    </div>
  );
}
