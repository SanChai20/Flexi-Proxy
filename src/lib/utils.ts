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

//TODO...Move To ENV
export const REGISTERED_PROVIDER_PREFIX = "registered:target:provider";
export const VERIFY_TOKEN_EXPIRE_SECONDS = 900;
export const USER_ADAPTER_PREFIX = "user:adapter:lists";
