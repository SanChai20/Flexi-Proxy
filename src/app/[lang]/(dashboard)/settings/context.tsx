"use client";

import { Locale } from "i18n-config";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Theme } from "theme-config";

interface GlobalSettingsContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    locale: Locale;
    setLocale: (locale: Locale) => void;
}

const GlobalSettingsContext = createContext<GlobalSettingsContextType | undefined>(undefined);

export function useGlobalSettingsContext() {
    const context = useContext(GlobalSettingsContext);
    if (context === undefined) {
        throw new Error("useSettingsContext must be used within a GlobalSettingsProvider");
    }
    return context;
}

export function GlobalSettingsProvider({
    children,
    defaultLocale
}: {
    children: ReactNode;
    defaultLocale: Locale;
}) {
    const [theme, setTheme] = useState<Theme>("system");
    const [locale, setLocale] = useState<Locale>(defaultLocale);

    // Theme handling
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") as Theme | null;
        if (savedTheme) {
            setTheme(savedTheme);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("theme", theme);
        if (theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [theme]);

    // Language handling
    useEffect(() => {
        const savedLocale = localStorage.getItem("locale") as Locale | null;
        if (savedLocale) {
            setLocale(savedLocale);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("locale", locale);
    }, [locale]);

    return (
        <GlobalSettingsContext.Provider value={{ theme, setTheme, locale, setLocale }}>
            {children}
        </GlobalSettingsContext.Provider>
    );
}