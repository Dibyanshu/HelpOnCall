export const rolePermissions = {
  content_publisher: ["content:publish"],
  resume_reviewer: ["resume:review"],
  job_poster: ["job:post"],
  admin: ["admin:user:read"],
  super_admin: ["*"]
} as const;

export type Role = keyof typeof rolePermissions;
type Permission = (typeof rolePermissions)[Role][number];

export interface AuthTokenPayload {
  userId: number;
  email: string;
  role: Role;
}

export function hasPermission(role: Role, requiredPermission: string): boolean {
  const permissions = rolePermissions[role] as readonly Permission[];
  return permissions.includes("*") || permissions.includes(requiredPermission as Permission);
}
