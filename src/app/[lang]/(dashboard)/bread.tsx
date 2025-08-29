"use client";

import { i18n } from "i18n-config";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import Link from 'next/link';

export default function DashboardBreadcrumb() {
    const pathname = usePathname();
    const localesPattern = i18n.locales.join('|');
    const pathNameWithoutLocale = pathname.replace(new RegExp(`^\\/(${localesPattern})(\\/|$)`), '/');
    const pathNames = pathNameWithoutLocale.split("/").filter((x) => x);

    return (
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {pathNames.length > 0 && <BreadcrumbSeparator />}
          {pathNames.map((pathname, index) => {
            const routeTo = `/${pathNames.slice(0, index + 1).join("/")}`;
            const isLast = index === pathNames.length - 1;
            return (
              <BreadcrumbItem key={pathname}>
                {isLast ? (
                  <BreadcrumbPage>{pathname.charAt(0).toUpperCase() + pathname.slice(1)}</BreadcrumbPage>    
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={routeTo}>{pathname.charAt(0).toUpperCase() + pathname.slice(1)}</Link>
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
