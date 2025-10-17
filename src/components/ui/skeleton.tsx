import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  pulse?: boolean;
  variant?: "default" | "circular" | "text";
}

function Skeleton({
  className,
  pulse = true,
  variant = "default",
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-muted",
        pulse && "animate-pulse",
        variant === "circular" && "rounded-full",
        variant === "text" && "rounded-sm h-4",
        variant === "default" && "rounded-md",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
