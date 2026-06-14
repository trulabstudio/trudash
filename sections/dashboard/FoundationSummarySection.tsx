import { StatusBadge } from "@/components/ui/StatusBadge";

const items = [
  "Next.js App Router",
  "TypeScript",
  "Tailwind theme tokens",
  "Supabase Auth plumbing",
  "Role model",
  "Dashboard shell"
];

export function FoundationSummarySection() {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div key={item} className="rounded-md border border-border bg-surface p-4 shadow-soft">
          <StatusBadge tone="success">Ready</StatusBadge>
          <h2 className="mt-3 text-sm font-semibold text-foreground">{item}</h2>
        </div>
      ))}
    </section>
  );
}
