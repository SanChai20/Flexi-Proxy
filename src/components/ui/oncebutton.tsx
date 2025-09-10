"use client";

import { useFormStatus } from "react-dom";
import { useState, useEffect } from "react";
import { LoadingIcon } from "@/components/ui/icons";

export function OnceButton({
  children,
  className,
  type = "submit",
  coolDown = 8000,
  loading = false,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  type?: "submit" | "button";
  coolDown?: number;
  loading?: boolean;
}) {
  const { pending } = useFormStatus();
  const [wasPending, setWasPending] = useState(false);

  useEffect(() => {
    if (pending) setWasPending(true);
    if (!pending && wasPending) {
      const timer = setTimeout(() => setWasPending(false), coolDown);
      return () => clearTimeout(timer);
    }
  }, [pending, wasPending, coolDown]);

  const isDisabled = pending || wasPending || loading;

  return (
    <button type={type} disabled={isDisabled} className={className} {...props}>
      {isDisabled ? (
        <div className="flex items-center justify-center gap-2 w-full">
          <LoadingIcon className="animate-spin h-4 w-4" />
          {children}
        </div>
      ) : (
        children
      )}
    </button>
  );
}
