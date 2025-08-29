import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18n } from "../i18n-config";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

function getLocale(request: NextRequest): string | undefined {
  // Negotiator expects plain object so we need to transform headers
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  // @ts-ignore locales are readonly
  const locales: string[] = i18n.locales;

  // Use negotiator and intl-localematcher to get best locale
  let languages = new Negotiator({ headers: negotiatorHeaders }).languages(
    locales,
  );

  const locale = matchLocale(languages, locales, i18n.defaultLocale);

  return locale;
}

export default auth(async function middleware(req: NextRequest) {
    const session = await auth();
    const pathName = req.nextUrl.pathname;
    const isLoggedIn = !!(session && session.user && session.user.id);

    // Check if there is any supported locale in the pathname
    const pathnameIsMissingLocale = i18n.locales.every(
      (locale) =>
        !pathName.startsWith(`/${locale}/`) && pathName !== `/${locale}`,
    );
    let fullPath = pathName
    if (pathnameIsMissingLocale) {
      const locale = getLocale(req);
      fullPath = `/${locale}${pathName.startsWith("/") ? "" : "/"}${pathName}`
    }
    
    // const splits: string[] = fullPath.split("/")
    // const actual_route : string = splits[splits.length - 1] //e.g. login
    // const actual_locale: string = splits[splits.length - 2] //e.g. en

    // if (actual_route === "login") {
    //     const fromParam = req.nextUrl.searchParams.get('from');
    //     if (!fromParam) {
    //         return NextResponse.redirect(new URL(`/${actual_locale}/verification`, req.url));
    //     }
    //     if (isLoggedIn) {
    //         return NextResponse.redirect(new URL(`/${actual_locale}/dashboard`, req.url));
    //     }
    // } else if (actual_route === "") {
    //   return NextResponse.redirect(new URL(`/${actual_locale}/login`, req.url));
    // }
    // const protectedRoutes = ["dashboard", "contact"];
    // if (!isLoggedIn && protectedRoutes.some(routeName => actual_route === routeName)) {
    //     return NextResponse.redirect(new URL(`/${actual_locale}/verification`, req.url));
    // }
    if (fullPath !== pathName) {
      return NextResponse.redirect(new URL(fullPath, req.url));
    }
    return NextResponse.next();
});

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
