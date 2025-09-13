"use client";

import { i18n, Locale } from "i18n-config";
import { useGlobalSettingsContext } from "./context";
import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";

export default function LanguageSwitcher({ dict }: { dict: any; }) {
    const { locale, setLocale } = useGlobalSettingsContext();
    const router = useRouter();
    const switchLanguage = (newLocale: Locale) => {
        setLocale(newLocale);
        // Reload the page to apply the new language
        router.push(`/${newLocale}/settings`);
    };
    return (
        <div className="flex items-center justify-between p-4 bg-card shadow-sm">
            <div className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                <label
                    htmlFor="language"
                    className="text-lg font-medium text-foreground"
                >
                    {dict?.settings?.language || "Language"}
                </label>
            </div>
            <div className="relative">
                <select
                    id="language"
                    name="language"
                    onChange={(e) => switchLanguage(e.target.value as Locale)}
                    value={locale}
                    className="appearance-none bg-background border border-input rounded-lg py-2 pl-3 pr-10 text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition cursor-pointer min-w-[120px]"
                >
                    {i18n.locales.map((locale) => (
                        <option key={locale} value={locale}>
                            {i18n.localesDisplay[locale]}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-foreground">
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
        </div>
    );
}