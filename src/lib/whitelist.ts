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
  "settings",
  "faq",
  "gateway",
  "gateway/private",
  "subscription",
  "subscription/checkout",
  "subscription/success",
];
// page route that needs verification check first
export const protectedRouteList = ["contact", "token", "settings", "gateway"];
// page route that belongs dashboard
export const dashboardRouteWhitelist = [
  "",
  "contact",
  "settings",
  "documentation",
  "token",
  "faq",
  "gateway",
  "subscription",
];
