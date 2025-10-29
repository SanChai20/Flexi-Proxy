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
  "token",
  "token/create",
  "token/modify",
  "settings",
  "faq",
  "gateway",
  "gateway/private",
];
// page route that needs verification check first
export const protectedRouteList = [
  "contact",
  "documentation",
  "token",
  "settings",
  "faq",
  "gateway",
];
// page route that belongs dashboard
export const dashboardRouteWhitelist = [
  "",
  "contact",
  "settings",
  "documentation",
  "token",
  "faq",
  "gateway",
];
