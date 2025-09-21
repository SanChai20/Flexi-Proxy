// page route that needs locale
export const i18nRouteWhitelist = [
  "",
  "login",
  "policy",
  "terms",
  "verification",
  "contact",
  "contact/feedback",
  "documentation",
  "management",
  "management/create",
  "management/modify",
  "settings",
  "faq",
];
// page route that needs verification check first
export const protectedRouteList = [
  "contact",
  "documentation",
  "management",
  "settings",
  "faq",
];
// page route that belongs dashboard
export const dashboardRouteWhitelist = [
  "",
  "contact",
  "settings",
  "documentation",
  "management",
  "faq",
];
