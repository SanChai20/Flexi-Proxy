"use client";

import { i18n } from "i18n-config";
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

export default function DashboardBreadcrumb({ dict }: { dict: any }) {
  const pathname = usePathname();
  const [pathNames, setPathNames] = useState<string[]>([]);
  useEffect(() => {
    const localesPattern = i18n.locales.join("|");
    const pathNameWithoutLocale = pathname.replace(
      new RegExp(`^\\/(${localesPattern})(\\/|$)`),
      "/"
    );
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
            <Link href="/">{dict["navigation"]["dashboard"]}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {pathNames.length > 0 && <BreadcrumbSeparator />}
        {pathNames.map((pathname, index) => {
          const routeTo = `/${pathNames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathNames.length - 1;
          return (
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
              {!isLast && <BreadcrumbSeparator />}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
