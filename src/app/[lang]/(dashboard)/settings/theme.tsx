"use client";

import { SunMoon } from "lucide-react";
import { useGlobalSettingsContext } from "./context";
import { Theme, themes } from "theme-config";

export default function ThemeSwitcher({ dict }: { dict: any; }) {
    const { theme, setTheme } = useGlobalSettingsContext();
    const switchTheme = (newTheme: Theme) => {
        setTheme(newTheme);
    };
    return (
        <div className="flex items-center justify-between p-4 bg-card shadow-sm">
            <div className="flex items-center gap-2">
                <SunMoon className="h-5 w-5" />
                <label
                    htmlFor="theme"
                    className="text-lg font-medium text-foreground"
                >
                    {dict?.settings?.theme || "Theme"}
                </label>
            </div>
            <div className="relative">
                <select
                    id="theme"
                    name="theme"
                    onChange={(e) => switchTheme(e.target.value as Theme)}
                    value={theme}
                    className="appearance-none bg-background border border-input rounded-lg py-2 pl-3 pr-10 text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition cursor-pointer min-w-[120px]"
                >
                    {themes.map((theme) => (
                        <option key={theme} value={theme}>
                            {dict.settings[theme]}
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