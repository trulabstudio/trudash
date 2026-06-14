import Image from "next/image";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/helpers/cn";

type BrandMarkProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14"
};

export function BrandMark({ className, size = "md" }: BrandMarkProps) {
  return (
    <Image
      src="/logo.png"
      alt={siteConfig.name}
      width={56}
      height={56}
      priority
      className={cn("shrink-0 rounded-sm object-contain", sizeClasses[size], className)}
    />
  );
}
