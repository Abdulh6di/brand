export const ROLE_NAMES = ["SUPER_ADMIN", "ADMIN", "MANAGER", "EDITOR", "CUSTOMER"] as const;
export type RoleName = (typeof ROLE_NAMES)[number];

const resources = [
  "products",
  "categories",
  "collections",
  "inventory",
  "orders",
  "customers",
  "coupons",
  "reviews",
  "customOrders",
  "payments",
  "shipping",
  "blog",
  "lookbook",
  "homepage",
  "banners",
  "newsletter",
  "analytics",
  "settings",
  "users",
  "roles",
  "auditLogs",
] as const;

const actions = ["read", "create", "update", "delete"] as const;

export const PERMISSIONS = resources.flatMap((resource) =>
  actions.map((action) => `${resource}.${action}` as const),
);

export type Permission = (typeof PERMISSIONS)[number];

/** Default permission grants seeded per role. SUPER_ADMIN always has every permission. */
export const DEFAULT_ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  SUPER_ADMIN: [...PERMISSIONS],
  ADMIN: PERMISSIONS.filter((p) => !p.startsWith("roles.")),
  MANAGER: PERMISSIONS.filter((p) => {
    const [resource, action] = p.split(".");
    if (["users", "roles", "settings", "auditLogs"].includes(resource)) return false;
    if (resource === "coupons" && action === "delete") return false;
    return true;
  }),
  EDITOR: PERMISSIONS.filter((p) => {
    const [resource, action] = p.split(".");
    if (["blog", "lookbook", "homepage", "banners"].includes(resource)) return true;
    if (resource === "products" && action === "read") return true;
    if (resource === "collections" && action === "read") return true;
    return false;
  }),
  CUSTOMER: [],
};

export function roleHasPermission(rolePermissions: string[], permission: Permission) {
  return rolePermissions.includes(permission);
}
