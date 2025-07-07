import type { UnionToIntersection } from "type-fest";

type Role = "ADMIN" | "TSP" | "CUSTOMER";
type User = { id: string; role: Role };

const defineRolePermissions = <
  T extends {
    [key: string]: boolean | ((user: User, data: any) => boolean);
  },
>(
  permissions: T
): T => permissions;

const defineRoles = <
  T extends {
    [key: string]: ReturnType<typeof defineRolePermissions>;
  },
>(
  roles: T
): T => roles;

const canFactory = <Permissions extends { permission: string; data?: any }[]>(
  roles: ReturnType<typeof defineRoles>
) => {
  type PermissionData<Permission extends Permissions[number]["permission"]> =
    Permissions[number] & { permission: Permission } extends infer P
      ? P extends { data: any }
        ? P["data"]
        : undefined
      : never;

  function can<Permission extends Permissions[number]["permission"]>(
    ...[user, permission, data]: PermissionData<Permission> extends undefined
      ? [user: User, permission: Permission, data?: never]
      : [user: User, permission: Permission, data: PermissionData<Permission>]
  ): boolean {
    const role = user.role;
    const rule = (
      roles[role] as UnionToIntersection<(typeof roles)[keyof typeof roles]>
    )[permission];
    if (!rule) return false;

    if (typeof rule === "boolean") {
      return rule === true;
    } else {
      return rule(user, data as any) === true;
    }
  }

  const canUserFactory =
    (user: User) =>
    <Permission extends Permissions[number]["permission"]>(
      ...[permission, data]: PermissionData<Permission> extends undefined
        ? [permission: Permission, data?: never]
        : [permission: Permission, data: PermissionData<Permission>]
    ): boolean =>
      can(user, permission, data);

  return {
    can,
    canUserFactory,
  };
};

export { defineRoles, defineRolePermissions, canFactory };
