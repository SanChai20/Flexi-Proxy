import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18n } from "../i18n-config";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

// Route Whitelist for i18n
const i18nRouteWhitelist = ["", "login", "policy", "terms", "verification", "contact", "document", "subscription"]
// Access after verification(login)
const protectedRouteList = ["contact", "document", "subscription"]

// Add locale if necessary
function routeCompletion(req: NextRequest): string | NextResponse {

    const pathName = req.nextUrl.pathname;
    const pathNameIsMissingLocale = i18n.locales.every(
      (locale) => !pathName.startsWith(`/${locale}/`) && pathName !== `/${locale}`,
    );
    
    // If pathname already has a locale, return as is
    if (!pathNameIsMissingLocale) {
        return pathName;
    }
    
    // Check if the path is in the whitelist (without leading slash for comparison)
    const pathWithoutSlash = pathName.startsWith('/') ? pathName.substring(1) : pathName;
    console.log(`[ORIGIN] ${pathWithoutSlash}`)
    const isWhitelisted = i18nRouteWhitelist.includes(pathWithoutSlash) || i18nRouteWhitelist.includes(pathName);
    
    // If it's a whitelisted route, add the default locale
    if (isWhitelisted) {
        // Negotiator expects plain object so we need to transform headers
        const negotiatorHeaders: Record<string, string> = {};
        req.headers.forEach((value, key) => (negotiatorHeaders[key] = value));
        // @ts-ignore locales are readonly
        const locales: string[] = i18n.locales;
        // Use negotiator and intl-localematcher to get best locale
        let languages = new Negotiator({ headers: negotiatorHeaders }).languages( locales );
        const locale = matchLocale(languages, locales, i18n.defaultLocale);
        return NextResponse.redirect(new URL(pathName.startsWith('/') ? `/${locale}${pathName}` : `/${locale}/${pathName}`, req.url))
    }
    // For non-whitelisted routes, return as is
    return pathName;
}

// Navigate to auth page if not logged in
function navigateRoutes(pathName: string, isLoggedIn: boolean, req: NextRequest): NextResponse<unknown> {

    const parts = pathName.replace(/^\/+|\/+$/g, "").split("/");
    console.log(`[PARTS] ${parts}`)
    if (parts.length < 1 || !parts[0] || !i18n.locales.includes(parts[0] as any)) 
        return NextResponse.next();

    const locale = parts[0]
    let redirectPath: string | null = null
    if (parts.length === 1) { // Home Page
        if (!isLoggedIn) {
            redirectPath = `/${locale}/verification`
        }
    } else {
        const section = parts[1]
        if (section === "login") {
            const fromParam = req.nextUrl.searchParams.get('from');
            if (!fromParam) {
                redirectPath = `/${locale}/verification`
            } else if (isLoggedIn) {
                redirectPath = `/${locale}`
            }
        } else if (protectedRouteList.includes(section) && !isLoggedIn) {
            redirectPath = `/${locale}/verification`
        }
    } 
    if (redirectPath) {
        return NextResponse.redirect(new URL(redirectPath, req.url))
    }
    return NextResponse.next();
}

export default auth(async function middleware(req: NextRequest) {
    const session = await auth();
    const isLoggedIn = !!(session && session.user && session.user.id);
    const route: string | NextResponse = routeCompletion(req);
    if (route instanceof NextResponse) {
        return route;
    }
    return navigateRoutes(route, isLoggedIn, req);
});

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
