import { desc, eq } from "drizzle-orm";
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
          isActive,
          createdAt: now,
          updatedAt: now
        })
        .returning({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
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
