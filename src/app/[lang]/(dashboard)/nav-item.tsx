"use client";

import { pathCullLocale } from "@/lib/utils";
import clsx from "clsx";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const Tooltip = dynamic(
  () => import("@/components/ui/tooltip").then((m) => m.Tooltip),
  { ssr: false }
);
const TooltipContent = dynamic(
  () => import("@/components/ui/tooltip").then((m) => m.TooltipContent),
  { ssr: false }
);
const TooltipTrigger = dynamic(
  () => import("@/components/ui/tooltip").then((m) => m.TooltipTrigger),
  { ssr: false }
);

export function NavItem({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [pathNameWithoutLocale, setPathNameWithoutLocale] =
    useState<string>("");
  useEffect(() => {
    setPathNameWithoutLocale(pathCullLocale(pathname));
  }, [pathname]);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className={clsx(
            "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
            {
              "bg-accent text-black":
                pathNameWithoutLocale === href ||
                pathNameWithoutLocale.startsWith(href + "/"),
            }
          )}
        >
          {children}
          <span className="sr-only">{label}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}
