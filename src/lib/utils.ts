import { type ClassValue, clsx } from "clsx";
import { i18n } from "i18n-config";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function pathCullLocale(pathname: string) {
  const pattern = i18n.locales.join("|");
  return pathname.replace(new RegExp(`^\\/(${pattern})(\\/|$)`), "/");
}

export interface BaseAdapter {
  provider: string;
  token: string;
  url: string;
}

export interface TargetProvider {
  id: string;
  name: string;
  url: string;
}
