// src/components/ui/skeleton.tsx
import { cn } from "@/lib/utils";
import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLElement> {
  pulse?: boolean;
  as?: "div" | "span"; // Add this prop
}

const Skeleton = React.forwardRef<HTMLElement, SkeletonProps>(
  ({ className, pulse = true, as: Component = "div", ...props }, ref) => {
    return (
      <Component
        ref={ref as any}
        className={cn(
          "bg-muted",
          pulse && "animate-pulse",
          "rounded-md",
          className
        )}
        {...props}
      />
    );
  }
);
Skeleton.displayName = "Skeleton";

export { Skeleton };
