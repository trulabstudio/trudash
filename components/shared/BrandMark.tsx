import Image from "next/image";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/helpers/cn";

type BrandMarkProps = {
  className?: string;
  priority?: boolean;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14"
};

export function BrandMark({ className, priority = false, size = "md" }: BrandMarkProps) {
  return (
    <Image
      src="/logo.png"
      alt={siteConfig.name}
      width={56}
      height={56}
      priority={priority}
      className={cn("shrink-0 rounded-sm object-contain", sizeClasses[size], className)}
    />
  );
}
