import { describe, it, expect } from "vitest";
import { DEFAULT_ROLE_PERMISSIONS, PERMISSIONS, roleHasPermission, ROLE_NAMES } from "@/lib/permissions";

describe("permissions matrix", () => {
  it("defines a default permission set for every role", () => {
    for (const role of ROLE_NAMES) {
      expect(DEFAULT_ROLE_PERMISSIONS[role]).toBeDefined();
    }
  });

  it("grants SUPER_ADMIN every permission", () => {
    expect(DEFAULT_ROLE_PERMISSIONS.SUPER_ADMIN).toHaveLength(PERMISSIONS.length);
  });

  it("grants CUSTOMER no admin permissions", () => {
    expect(DEFAULT_ROLE_PERMISSIONS.CUSTOMER).toHaveLength(0);
  });

  it("never grants ADMIN role management", () => {
    expect(DEFAULT_ROLE_PERMISSIONS.ADMIN.some((p) => p.startsWith("roles."))).toBe(false);
  });

  it("never grants MANAGER settings, users, roles, or audit log access", () => {
    const forbidden = ["settings.", "users.", "roles.", "auditLogs."];
    const hasForbidden = DEFAULT_ROLE_PERMISSIONS.MANAGER.some((p) => forbidden.some((f) => p.startsWith(f)));
    expect(hasForbidden).toBe(false);
  });

  it("roleHasPermission checks membership correctly", () => {
    expect(roleHasPermission(["products.read"], "products.read")).toBe(true);
    expect(roleHasPermission(["products.read"], "products.delete")).toBe(false);
  });
});
