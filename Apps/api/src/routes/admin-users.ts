import { and, desc, eq, ne } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { buildAuditCreateFields, buildAuditUpdateFields } from "../db/audit.js";
import { db } from "../db/index.js";
import * as mysqlSchema from "../db/schema.mysql.js";
import * as sqliteSchema from "../db/schema.js";
const isProd = process.env.APP_ENV === "production";
const { users } = (isProd ? mysqlSchema : sqliteSchema) as any;
import type { Role } from "../types/auth.js";
import { hashPassword } from "../utils/crypto.js";
import { buildNewStaffAccountEmail } from "../utils/email-template/email-builders.js";
import { sendTemplatedEmail } from "../utils/email-template/email-template.service.js";
import { TEMPLATE_KEYS } from "../utils/email-template/template-registry.js";

const USER_ROLE_VALUES = [
  "content_publisher",
  "resume_reviewer",
  "job_poster",
  "admin",
  "super_admin"
] as const;

const createUserSchema = z.object({
  personalEmail: z.string().email().optional(),
  email: z.string().email().optional(),
  fullName: z.string().min(2).optional(),
  name: z.string().min(2).optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  dateOfJoining: z.string().optional(),
  staffId: z.string().optional(),
  password: z.string().min(8),
  role: z.enum(USER_ROLE_VALUES),
  isActive: z.boolean().optional().default(true),
  newStaffTemplate: z.object({
    subject: z.string().min(1),
    text: z.string().min(1),
    html: z.string().min(1)
  }).optional()
}).superRefine((value, ctx) => {
  if (!value.personalEmail && !value.email) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["personalEmail"],
      message: "Personal email is required"
    });
  }

  if (!value.fullName && !value.name) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["fullName"],
      message: "Full name is required"
    });
  }
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
    personalEmail: z.string().email().optional(),
    email: z.string().email().optional(),
    fullName: z.string().min(2).optional(),
    name: z.string().min(2).optional(),
    gender: z.string().optional(),
    dateOfBirth: z.string().optional(),
    dateOfJoining: z.string().optional(),
    staffId: z.string().optional(),
    role: z.enum(USER_ROLE_VALUES).optional(),
    isActive: z.boolean().optional()
  })
  .refine(
    (value) =>
      value.personalEmail !== undefined ||
      value.email !== undefined ||
      value.fullName !== undefined ||
      value.name !== undefined ||
      value.gender !== undefined ||
      value.dateOfBirth !== undefined ||
      value.dateOfJoining !== undefined ||
      value.staffId !== undefined ||
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
      preHandler: [
        fastify.authenticate,
        fastify.authorize(["super_admin" as Role, "admin" as Role])
      ]
    },
    async (request) => {
      const authUser = request.authUser;
      const allowedRoles = authUser?.role === "super_admin"
        ? USER_ROLE_VALUES
        : USER_ROLE_VALUES.filter((role) => role !== "super_admin");

      return {
        data: allowedRoles.map((value) => ({
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
        fastify.authorize(["super_admin" as Role, "admin" as Role])
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

      const auditUpdateFields = buildAuditUpdateFields();

      const updated = await db
        .update(users)
        .set({
          isActive,
          ...auditUpdateFields
        })
        .where(eq(users.id, userId))
        .returning({
          id: users.id,
          personalEmail: users.personalEmail,
          fullName: users.fullName,
          email: users.personalEmail,
          name: users.fullName,
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
      fastify.authorize(["super_admin" as Role, "admin" as Role])
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

      const nextPersonalEmail = bodyParse.data.personalEmail ?? bodyParse.data.email;
      const nextFullName = bodyParse.data.fullName ?? bodyParse.data.name;

      if (nextPersonalEmail) {
        const duplicate = await db
          .select({ id: users.id })
          .from(users)
          .where(and(eq(users.personalEmail, nextPersonalEmail), ne(users.id, userId)))
          .limit(1);

        if (duplicate.length > 0) {
          return reply.code(409).send({ message: "User with this email already exists" });
        }
      }

      if (bodyParse.data.staffId) {
        const duplicateStaffId = await db
          .select({ id: users.id })
          .from(users)
          .where(and(eq(users.staffId, bodyParse.data.staffId), ne(users.id, userId)))
          .limit(1);

        if (duplicateStaffId.length > 0) {
          return reply.code(409).send({ message: "A staff member with this ID already exists." });
        }
      }

      const auditUpdateFields = buildAuditUpdateFields();
      const nextDateOfBirth = bodyParse.data.dateOfBirth ? new Date(bodyParse.data.dateOfBirth) : undefined;
      const nextDateOfJoining = bodyParse.data.dateOfJoining ? new Date(bodyParse.data.dateOfJoining) : undefined;

      const updated = await db
        .update(users)
        .set({
          ...(nextPersonalEmail ? { personalEmail: nextPersonalEmail } : {}),
          ...(nextFullName ? { fullName: nextFullName } : {}),
          ...(bodyParse.data.gender !== undefined ? { gender: bodyParse.data.gender } : {}),
          ...(bodyParse.data.dateOfBirth !== undefined ? { dateOfBirth: nextDateOfBirth } : {}),
          ...(bodyParse.data.dateOfJoining !== undefined ? { dateOfJoining: nextDateOfJoining } : {}),
          ...(bodyParse.data.staffId !== undefined ? { staffId: bodyParse.data.staffId } : {}),
          ...(bodyParse.data.role !== undefined ? { role: bodyParse.data.role } : {}),
          ...(bodyParse.data.isActive !== undefined ? { isActive: bodyParse.data.isActive } : {}),
          ...auditUpdateFields
        })
        .where(eq(users.id, userId))
        .returning({
          id: users.id,
          personalEmail: users.personalEmail,
          fullName: users.fullName,
          email: users.personalEmail,
          name: users.fullName,
          gender: users.gender,
          dateOfBirth: users.dateOfBirth,
          dateOfJoining: users.dateOfJoining,
          staffId: users.staffId,
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
        fastify.authorize(["super_admin" as Role, "admin" as Role])
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

      const personalEmail = bodyParse.data.personalEmail ?? bodyParse.data.email!;
      const fullName = bodyParse.data.fullName ?? bodyParse.data.name!;
      const { gender, dateOfBirth, dateOfJoining, staffId, password, role, isActive, newStaffTemplate } = bodyParse.data;
      const authUser = request.authUser;

      if (authUser?.role === "admin" && role === "super_admin") {
        return reply.code(403).send({ message: "Admin cannot assign super admin role" });
      }

      const createdBy = authUser?.userId != null ? String(authUser.userId) : "";

      const exists = await db.select().from(users).where(eq(users.personalEmail, personalEmail)).limit(1);
      if (exists.length > 0) {
        return reply.code(409).send({ message: "User with this email already exists" });
      }

      if (staffId) {
        const staffIdExists = await db.select().from(users).where(eq(users.staffId, staffId)).limit(1);
        if (staffIdExists.length > 0) {
          return reply.code(409).send({ message: "A staff member with this ID already exists." });
        }
      }

      const auditCreateFields = buildAuditCreateFields(createdBy);
      const passwordHash = await hashPassword(password);

      // Convert date strings to timestamps
      const dateOfBirthTimestamp = dateOfBirth ? new Date(dateOfBirth) : undefined;
      const dateOfJoiningTimestamp = dateOfJoining ? new Date(dateOfJoining) : undefined;

      const inserted = await db
        .insert(users)
        .values({
          personalEmail,
          fullName,
          gender,
          dateOfBirth: dateOfBirthTimestamp,
          dateOfJoining: dateOfJoiningTimestamp,
          staffId,
          passwordHash,
          role,
          ...auditCreateFields,
          isActive,
        })
        .returning({
          id: users.id,
          personalEmail: users.personalEmail,
          fullName: users.fullName,
          email: users.personalEmail,
          name: users.fullName,
          gender: users.gender,
          dateOfBirth: users.dateOfBirth,
          dateOfJoining: users.dateOfJoining,
          staffId: users.staffId,
          role: users.role,
          createdBy: users.createdBy,
          isActive: users.isActive,
          createdAt: users.createdAt
        });

      const staffEmail = staffId ? `${staffId.toLowerCase()}@helponcall.com` : personalEmail;
      const shouldSendWelcomeEmail = isActive !== false;

      if (shouldSendWelcomeEmail) {
        try {
          await sendTemplatedEmail(
            {
              to: personalEmail,
              templateKey: TEMPLATE_KEYS.NEW_STAFF_ACCOUNT_CREATED,
              data: {
                fullName,
                personalEmail,
                staffEmail,
                password,
              },
              fallback: () => newStaffTemplate ?? buildNewStaffAccountEmail({
                fullName,
                personalEmail,
                staffEmail,
                password,
              }),
              strict: false,
            },
            fastify.mail,
            fastify.log
          );
        } catch (error) {
          fastify.log.error({ error, personalEmail }, "Failed to send new staff account email");
        }
      }

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
        fastify.authorize(["super_admin" as Role, "admin" as Role])
      ]
    },
    async (request) => {
      let list = await db
        .select({
          id: users.id,
          personalEmail: users.personalEmail,
          fullName: users.fullName,
          email: users.personalEmail,
          name: users.fullName,
          gender: users.gender,
          dateOfBirth: users.dateOfBirth,
          dateOfJoining: users.dateOfJoining,
          staffId: users.staffId,
          role: users.role,
          createdBy: users.createdBy,
          isActive: users.isActive,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt
        })
        .from(users)
        .orderBy(desc(users.createdAt));

      // Filter out super_admin users if the requester is not a super_admin
      if (request.authUser?.role !== "super_admin") {
        list = list.filter((user) => user.role !== "super_admin");
      }


      return { data: list };
    }
  );
};

export default adminRoutes;
