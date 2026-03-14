import { and, desc, eq, ne } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import type { Role } from "../types/auth.js";
import { hashPassword } from "../utils/crypto.js";

const USER_ROLE_VALUES = [
  "content_publisher",
  "resume_reviewer",
  "job_poster",
  "admin",
  "super_admin"
] as const;

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8),
  role: z.enum(USER_ROLE_VALUES),
  isActive: z.boolean().optional().default(true)
});

const updateUserStatusSchema = z.object({
  userId: z.number().int().positive(),
  isActive: z.boolean()
});

const userIdParamSchema = z.object({
  userId: z.coerce.number().int().positive()
});

const editUserSchema = z
  .object({
    email: z.string().email().optional(),
    name: z.string().min(2).optional(),
    role: z.enum(USER_ROLE_VALUES).optional(),
    isActive: z.boolean().optional()
  })
  .refine(
    (value) =>
      value.email !== undefined ||
      value.name !== undefined ||
      value.role !== undefined ||
      value.isActive !== undefined,
    {
      message: "At least one editable field is required"
    }
  );

function roleLabel(role: (typeof USER_ROLE_VALUES)[number]): string {
  return role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const adminRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    "/admin/roles",
    {
      preHandler: [fastify.authenticate, fastify.authorize(["super_admin" as Role])]
    },
    async () => {
      return {
        data: USER_ROLE_VALUES.map((value) => ({
          value,
          label: roleLabel(value)
        }))
      };
    }
  );

  fastify.post(
    "/admin/users/status",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize(["super_admin" as Role], "admin:user:update-status")
      ]
    },
    async (request, reply) => {
      const bodyParse = updateUserStatusSchema.safeParse(request.body);

      if (!bodyParse.success) {
        return reply.code(400).send({
          message: "Invalid request body",
          errors: bodyParse.error.flatten()
        });
      }

      const { userId, isActive } = bodyParse.data;

      const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (existing.length === 0) {
        return reply.code(404).send({ message: "User not found" });
      }

      const now = new Date();

      const updated = await db
        .update(users)
        .set({
          isActive,
          updatedAt: now
        })
        .where(eq(users.id, userId))
        .returning({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          createdBy: users.createdBy,
          isActive: users.isActive,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt
        });

      return reply.send({
        message: "User status updated successfully",
        user: updated[0]
      });
    }
  );

  fastify.route({
    method: ["PUT", "PATCH"],
    url: "/admin/users/:userId",
    preHandler: [
      fastify.authenticate,
      fastify.authorize(["super_admin" as Role, "admin" as Role], "admin:user:update")
    ],
    handler: async (request, reply) => {
      const paramsParse = userIdParamSchema.safeParse(request.params);

      if (!paramsParse.success) {
        return reply.code(400).send({
          message: "Invalid route params",
          errors: paramsParse.error.flatten()
        });
      }

      const bodyParse = editUserSchema.safeParse(request.body);

      if (!bodyParse.success) {
        return reply.code(400).send({
          message: "Invalid request body",
          errors: bodyParse.error.flatten()
        });
      }

      const { userId } = paramsParse.data;
      const authUser = request.authUser;

      if (!authUser) {
        return reply.code(401).send({ message: "Unauthorized" });
      }

      const existing = await db
        .select({
          id: users.id,
          role: users.role
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      const targetUser = existing[0];

      if (!targetUser) {
        return reply.code(404).send({ message: "User not found" });
      }

      if (authUser.role === "admin") {
        if (targetUser.role === "super_admin") {
          return reply.code(403).send({ message: "Admin cannot edit super admin users" });
        }

        if (bodyParse.data.role === "super_admin") {
          return reply.code(403).send({ message: "Admin cannot assign super admin role" });
        }
      }

      if (bodyParse.data.email) {
        const duplicate = await db
          .select({ id: users.id })
          .from(users)
          .where(and(eq(users.email, bodyParse.data.email), ne(users.id, userId)))
          .limit(1);

        if (duplicate.length > 0) {
          return reply.code(409).send({ message: "User with this email already exists" });
        }
      }

      const now = new Date();

      const updated = await db
        .update(users)
        .set({
          ...bodyParse.data,
          updatedAt: now
        })
        .where(eq(users.id, userId))
        .returning({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          createdBy: users.createdBy,
          isActive: users.isActive,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt
        });

      return reply.send({
        message: "User updated successfully",
        user: updated[0]
      });
    }
  });

  fastify.post(
    "/admin/users",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize(["super_admin" as Role], "admin:user:create")
      ]
    },
    async (request, reply) => {
      const bodyParse = createUserSchema.safeParse(request.body);

      if (!bodyParse.success) {
        return reply.code(400).send({
          message: "Invalid request body",
          errors: bodyParse.error.flatten()
        });
      }

      const { email, name, password, role, isActive } = bodyParse.data;
      const createdBy = request.authUser?.role === "super_admin" ? "super_admin" : "";

      const exists = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (exists.length > 0) {
        return reply.code(409).send({ message: "User with this email already exists" });
      }

      const now = new Date();
      const passwordHash = await hashPassword(password);

      const inserted = await db
        .insert(users)
        .values({
          email,
          name,
          passwordHash,
          role,
          createdBy,
          isActive,
          createdAt: now,
          updatedAt: now
        })
        .returning({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          createdBy: users.createdBy,
          isActive: users.isActive,
          createdAt: users.createdAt
        });

      return reply.code(201).send({
        message: "User created successfully",
        user: inserted[0]
      });
    }
  );

  fastify.get(
    "/admin/users",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize(["super_admin" as Role, "admin" as Role], "admin:user:read")
      ]
    },
    async () => {
      const list = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          createdBy: users.createdBy,
          isActive: users.isActive,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt
        })
        .from(users)
        .orderBy(desc(users.createdAt));

      return { data: list };
    }
  );
};

export default adminRoutes;
