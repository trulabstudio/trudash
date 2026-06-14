import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FolderKanban,
  Link2,
  LockKeyhole,
  QrCode,
  ShieldCheck,
  Sparkles,
  Wand2
} from "lucide-react";

import { BrandMark } from "@/components/shared/BrandMark";
import { siteConfig } from "@/config/site";

const features = [
  {
    label: "Client projects",
    icon: FolderKanban
  },
  {
    label: "Task tracking",
    icon: CheckCircle2
  },
  {
    label: "Delivery links",
    icon: Link2
  },
  {
    label: "QR generator",
    icon: QrCode
  },
  {
    label: "Background remover",
    icon: Wand2
  },
  {
    label: "Secure access",
    icon: ShieldCheck
  }
];

export function HomeView() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-8">
      <div className="pointer-events-none absolute left-1/2 top-[-18rem] h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-14rem] right-[-12rem] h-[30rem] w-[30rem] rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <section className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-soft">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Project Operations Dashboard
            </div>

            <div className="mt-6">
              <BrandMark size="lg" />
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {siteConfig.name}
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
              Manage clients, projects, tasks, progress, QR codes, background
              removal, preview links, and final delivery assets from one clean
              portal.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-soft transition hover:opacity-90"
              >
                Sign in
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-surface px-5 text-sm font-medium text-foreground shadow-soft transition hover:bg-muted"
              >
                Open dashboard
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
              <LockKeyhole className="h-4 w-4 text-primary" />
              Secure workspace for clients, staff, and admin operations.
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
            <div className="rounded-xl border border-border bg-background p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Operations overview
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Live project workflow
                  </p>
                </div>

                <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  Active
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <MiniStat label="Projects" value="12" />
                <MiniStat label="Tasks" value="48" />
                <MiniStat label="Delivery" value="8" />
              </div>

              <div className="mt-5 rounded-lg border border-border bg-surface p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">
                    Client delivery progress
                  </span>
                  <span className="text-muted-foreground">72%</span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[72%] rounded-full bg-primary" />
                </div>

                <div className="mt-4 space-y-3">
                  {[
                    "Project created",
                    "Assets prepared",
                    "Preview link generated",
                    "Final delivery pending"
                  ].map((item, index) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle2
                        className={`h-4 w-4 ${
                          index < 3 ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                      <span className="text-sm text-muted-foreground">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.label}
                    className="flex items-center gap-3 rounded-xl border border-border bg-background p-4"
                  >
                    <div className="rounded-md bg-muted p-2 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>

                    <p className="text-sm font-medium text-foreground">
                      {feature.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <p className="text-lg font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}