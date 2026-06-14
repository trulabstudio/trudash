import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/helpers/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60",
        variant === "primary" &&
          "bg-primary text-primary-foreground hover:opacity-90 focus-visible:outline-primary",
        variant === "secondary" &&
          "border border-border bg-surface text-foreground hover:bg-muted focus-visible:outline-primary",
        variant === "ghost" && "text-muted-foreground hover:bg-muted hover:text-foreground",
        className
      )}
      {...props}
    />
  );
}
