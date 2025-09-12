"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { useEffect, useState } from "react";
import { dashboardRouteWhitelist } from "@/lib/whitelist";
import { pathCullLocale } from "@/lib/utils";
import React from "react";

export default function DashboardBreadcrumb({ dict }: { dict: any }) {
  const pathname = usePathname();
  const [pathNames, setPathNames] = useState<string[]>([]);
  useEffect(() => {
    const pathNameWithoutLocale = pathCullLocale(pathname);
    const pathSplits: string[] = pathNameWithoutLocale
      .split("/")
      .filter((x) => x);

    const allowed = pathSplits.some((path) =>
      dashboardRouteWhitelist.includes(path)
    );
    if (allowed) {
      setPathNames(pathSplits);
    } else {
      setPathNames([]);
    }
  }, [pathname]);

  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">{dict["navigation"]["home"]}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {pathNames.map((pathname, index) => {
          const routeTo = `/${pathNames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathNames.length - 1;
          return [
            <BreadcrumbSeparator key={`separator-${pathname}`} />,
            <BreadcrumbItem key={pathname}>
              {isLast ? (
                <BreadcrumbPage>
                  {dict["navigation"][pathname.toLowerCase()]}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={routeTo}>
                    {dict["navigation"][pathname.toLowerCase()]}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>,
          ];
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
