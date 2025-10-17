import Link from "next/link";
import {
  BookText,
  Home,
  LayoutDashboard,
  Mails,
  MessageCircleQuestionMark,
  PanelLeft,
  Settings,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { User } from "./user";
import Providers from "./providers";
import { NavItem } from "./nav-item";
import DashboardBreadcrumb from "./breadcrumb";
import { Locale } from "i18n-config";
import { getTrans } from "@/lib/dictionary";
import { Footer } from "@/components/ui/footer";
import dynamic from "next/dynamic";

const Tooltip = dynamic(() =>
  import("@/components/ui/tooltip").then((m) => m.Tooltip)
);
const TooltipContent = dynamic(() =>
  import("@/components/ui/tooltip").then((m) => m.TooltipContent)
);
const TooltipTrigger = dynamic(() =>
  import("@/components/ui/tooltip").then((m) => m.TooltipTrigger)
);

const Sheet = dynamic(() =>
  import("@/components/ui/sheet").then((m) => m.Sheet)
);
const SheetContent = dynamic(() =>
  import("@/components/ui/sheet").then((m) => m.SheetContent)
);
const SheetTitle = dynamic(() =>
  import("@/components/ui/sheet").then((m) => m.SheetTitle)
);
const SheetTrigger = dynamic(() =>
  import("@/components/ui/sheet").then((m) => m.SheetTrigger)
);

export default async function DashboardLayout(props: LayoutProps<"/[lang]">) {
  const { lang } = await props.params;
  const dict = await getTrans(lang as Locale);
  return (
    <Providers>
      <main className="flex min-h-screen w-full flex-col bg-muted/40">
        <DesktopNav dict={dict} />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 flex-1">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <MobileNav dict={dict} />
            <DashboardBreadcrumb dict={dict} />
          </header>
          <main className="grid flex-1 items-start gap-2 p-4 sm:px-6 sm:py-0 md:gap-4">
            {props.children}
          </main>
        </div>
        <Footer dict={dict} />
      </main>
    </Providers>
  );
}

function DesktopNav({ dict }: { dict: any }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <User dict={dict} />

        <NavItem href="/" label={dict["navigation"]["home"]}>
          <Home className="h-5 w-5" />
        </NavItem>

        <NavItem href="/management" label={dict["navigation"]["management"]}>
          <LayoutDashboard className="h-5 w-5" />
        </NavItem>

        <NavItem
          href="/documentation"
          label={dict["navigation"]["documentation"]}
        >
          <BookText className="h-5 w-5" />
        </NavItem>

        <NavItem href="/faq" label={dict["navigation"]["faq"]}>
          <MessageCircleQuestionMark className="h-5 w-5" />
        </NavItem>

        <NavItem href="/contact" label={dict["navigation"]["contact"]}>
          <Mails className="h-5 w-5" />
        </NavItem>
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/settings"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            {dict["navigation"]["settings"]}
          </TooltipContent>
        </Tooltip>
      </nav>
    </aside>
  );
}

function MobileNav({ dict }: { dict: any }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 sm:max-w-xs">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <nav className="grid gap-6 text-lg font-medium pt-6">
          <User dict={dict} />
          <Link
            href="/"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <Home className="h-5 w-5" />
            {dict["navigation"]["home"]}
          </Link>
          <Link
            href="/management"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <LayoutDashboard className="h-5 w-5" />
            {dict["navigation"]["management"]}
          </Link>
          <Link
            href="/documentation"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <BookText className="h-5 w-5" />
            {dict["navigation"]["documentation"]}
          </Link>
          <Link
            href="/faq"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <MessageCircleQuestionMark className="h-5 w-5" />
            {dict["navigation"]["faq"]}
          </Link>
          <Link
            href="/contact"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <Mails className="h-5 w-5" />
            {dict["navigation"]["contact"]}
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <Settings className="h-5 w-5" />
            {dict["navigation"]["settings"]}
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
