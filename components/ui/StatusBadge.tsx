import { cn } from "@/lib/helpers/cn";

type StatusBadgeProps = {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning";
};

export function StatusBadge({ children, tone = "neutral" }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-1 text-xs font-medium",
        tone === "neutral" && "border-border bg-muted text-muted-foreground",
        tone === "success" && "border-primary/30 bg-primary/10 text-primary",
        tone === "warning" && "border-accent/40 bg-accent/15 text-accent-foreground"
      )}
    >
      {children}
    </span>
  );
}
