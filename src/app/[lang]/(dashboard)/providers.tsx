"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Locale } from "i18n-config";
import { GlobalSettingsProvider } from "./settings/context";

export default function Providers({ children, lang }: { children: React.ReactNode, lang: Locale }) {
  return <GlobalSettingsProvider defaultLocale={lang} >
    <TooltipProvider>{children}</TooltipProvider>
  </GlobalSettingsProvider>
}
