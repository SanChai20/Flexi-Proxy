// page route that needs locale
export const i18nRouteWhitelist = [
  "",
  "login",
  "policy",
  "terms",
  "verification",
  "contact",
  "documentation",
  "subscription",
  "management",
  "managementconf",
  "settings",
  "faq",
];
// page route that needs verification check first
export const protectedRouteList = [
  "contact",
  "documentation",
  "subscription",
  "management",
  "managementconf",
  "settings",
  "faq",
];
// page route that belongs dashboard
export const dashboardRouteWhitelist = [
  "",
  "contact",
  "settings",
  "subscription",
  "documentation",
  "management",
  "faq",
];
