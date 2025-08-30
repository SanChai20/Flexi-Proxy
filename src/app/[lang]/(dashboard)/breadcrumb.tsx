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

const DashboardPathWhitelist = ["", "contact", "settings", "subscription", "documentation"]

export default function DashboardBreadcrumb({ dict }: { dict: any }) {
  const pathname = usePathname();


  // const [wasPending, setWasPending] = useState(false);

  //   useEffect(() => {
  //     if (pending) setWasPending(true);
  //     if (!pending && wasPending) {
  //       const timer = setTimeout(() => setWasPending(false), coolDown);
  //       return () => clearTimeout(timer);
  //     }
  //   }, [pending, wasPending, coolDown]);





  console.log("Original pathname:", pathname);
  const localesPattern = i18n.locales.join("|");
  const pathNameWithoutLocale = pathname.replace(
    new RegExp(`^\\/(${localesPattern})(\\/|$)`),
    "/"
  );
  console.log("Pathname without locale:", pathNameWithoutLocale);
  const pathNames = pathNameWithoutLocale.split("/").filter((x) => x);
  console.log("Path names array:", pathNames);
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
