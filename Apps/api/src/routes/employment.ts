import { randomUUID } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { access, mkdir, unlink } from "node:fs/promises";
import { basename, extname } from "node:path";
import { resolve } from "node:path";
import { pipeline } from "node:stream/promises";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { env } from "../config/env.js";
import { buildAuditCreateFields, buildAuditUpdateFields } from "../db/audit.js";
import { db } from "../db/index.js";
import { employment, serviceCategories, services, users } from "../db/schema.js";
import type { Role } from "../types/auth.js";
import {
  buildAdminSubmissionNotificationEmail,
  buildApplicantStatusEmail,
  buildApplicantStatusTemplateData,
  buildApplicantSubmissionConfirmationEmail
} from "../utils/email-template/email-builders.js";
import { sendTemplatedEmail } from "../utils/email-template/email-template.service.js";
import { TEMPLATE_KEYS } from "../utils/email-template/template-registry.js";

const allowedResumeExtensions = new Set([".pdf", ".doc", ".docx"]);

const specializationSelectionSchema = z.object({
  categoryId: z.number().int().positive(),
  serviceId: z.number().int().positive()
});

const createEmploymentSchema = z
  .object({
    fullName: z.string().min(2),
    emailAddress: z.string().email().optional(),
    email: z.string().email().optional(),
    phoneNumber: z.string().min(7).optional(),
    phone: z.string().min(7).optional(),
    specializations: z.array(z.union([z.string().min(1), specializationSelectionSchema])).min(1),
    coverLetter: z.string().min(1)
  })
  .refine((value) => value.emailAddress !== undefined || value.email !== undefined, {
    message: "Either emailAddress or email is required",
    path: ["emailAddress"]
  })
  .refine((value) => value.phoneNumber !== undefined || value.phone !== undefined, {
    message: "Either phoneNumber or phone is required",
    path: ["phoneNumber"]
  });

const employmentEmpIdParamsSchema = z.object({
  empId: z.string().uuid()
});

const adminEmploymentQuerySchema = z.object({
  search: z.string().trim().optional().default(""),
  status: z.enum(["new", "approve", "reject"]).optional()
});

function buildStoredResumeFileName(sourceFileName: string): string {
  const extension = extname(sourceFileName).toLowerCase();

  if (!allowedResumeExtensions.has(extension)) {
    throw new Error("Unsupported resume file extension");
  }

  return `${randomUUID()}${extension}`;
}

async function removeFileIfExists(filePath?: string): Promise<void> {
  if (!filePath) {
    return;
  }

  try {
    await unlink(filePath);
  } catch {
    // Ignore cleanup errors to avoid hiding the main response.
  }
}

function escapeLikePattern(input: string): string {
  return input.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

function parseSpecializations(value: string): Array<string | { categoryId: number; serviceId: number }> {
  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (
          item &&
          typeof item === "object" &&
          typeof item.categoryId === "number" &&
          typeof item.serviceId === "number"
        ) {
          return {
            categoryId: item.categoryId,
            serviceId: item.serviceId
          };
        }

        return null;
      })
      .filter((item): item is string | { categoryId: number; serviceId: number } => item !== null);
  } catch {
    return [];
  }
}

async function updateEmploymentStatusByEmpId(
  empId: string,
  status: "approve" | "reject"
): Promise<{
  id: number;
  empId: string;
  fullName: string;
  emailAddress: string;
  status: "new" | "approve" | "reject";
  updatedAt: Date;
} | null> {
  const updated = await db
    .update(employment)
    .set({
      status,
      ...buildAuditUpdateFields()
    })
    .where(eq(employment.empId, empId))
    .returning({
      id: employment.id,
      empId: employment.empId,
      fullName: employment.fullName,
      emailAddress: employment.emailAddress,
      status: employment.status,
      updatedAt: employment.updatedAt
    });

  return updated[0] ?? null;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function findAdminRecipientEmails(): Promise<string[]> {
  const rows = await db
    .select({ email: users.personalEmail })
    .from(users)
    .where(
      and(
        inArray(users.role, ["admin", "super_admin"]),
        eq(users.isActive, true)
      )
    );

  return [...new Set(rows.map((item) => item.email.trim()).filter((email) => email.length > 0))];
}

const employmentRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/employment", async (request, reply) => {
    if (!request.isMultipart()) {
      return reply.code(400).send({
        message: "Content-Type must be multipart/form-data"
      });
    }

    const uploadDir = resolve(process.cwd(), env.EMPLOYMENT_RESUME_UPLOAD_DIR);
    const multipartFields: Record<string, string> = {};
    let resumeStoredFileName = "";
    let savedResumePath: string | undefined;

    try {
      await mkdir(uploadDir, { recursive: true });

      for await (const part of request.parts()) {
        if (part.type === "file") {
          if (part.fieldname !== "resume") {
            part.file.resume();
            continue;
          }

          if (resumeStoredFileName) {
            part.file.resume();
            continue;
          }

          const originalFileName = part.filename ?? "";
          resumeStoredFileName = buildStoredResumeFileName(originalFileName);
          savedResumePath = resolve(uploadDir, resumeStoredFileName);
          await pipeline(part.file, createWriteStream(savedResumePath));
          continue;
        }

        multipartFields[part.fieldname] = String(part.value ?? "");
      }
    } catch (error) {
      await removeFileIfExists(savedResumePath);

      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "FST_REQ_FILE_TOO_LARGE"
      ) {
        return reply.code(400).send({
          message: `Resume exceeds ${env.EMPLOYMENT_RESUME_MAX_FILE_SIZE_MB}MB limit`
        });
      }

      if (error instanceof Error && error.message.includes("Unsupported resume file extension")) {
        return reply.code(400).send({
          message: "Unsupported resume file extension. Allowed: .pdf, .doc, .docx"
        });
      }

      throw error;
    }

    if (!resumeStoredFileName) {
      return reply.code(400).send({
        message: "Resume file is required under 'resume' form-data field"
      });
    }

    let parsedSpecializations: unknown;

    try {
      parsedSpecializations = JSON.parse(multipartFields.specializations ?? "[]");
    } catch {
      await removeFileIfExists(savedResumePath);
      return reply.code(400).send({
        message: "specializations must be valid JSON"
      });
    }

    const bodyParse = createEmploymentSchema.safeParse({
      fullName: multipartFields.fullName,
      emailAddress: multipartFields.emailAddress,
      email: multipartFields.email,
      phoneNumber: multipartFields.phoneNumber,
      phone: multipartFields.phone,
      specializations: parsedSpecializations,
      coverLetter: multipartFields.coverLetter
    });

    if (!bodyParse.success) {
      await removeFileIfExists(savedResumePath);
      return reply.code(400).send({
        message: "Invalid request body",
        errors: bodyParse.error.flatten()
      });
    }

    const emailAddress = bodyParse.data.emailAddress ?? bodyParse.data.email ?? "";
    const phoneNumber = bodyParse.data.phoneNumber ?? bodyParse.data.phone ?? "";

    const structuredSelections = bodyParse.data.specializations.filter(
      (item): item is z.infer<typeof specializationSelectionSchema> => typeof item !== "string"
    );

    if (structuredSelections.length > 0) {
      const serviceIds = [...new Set(structuredSelections.map((item) => item.serviceId))];

      const existingServices = await db
        .select({
          id: services.id,
          categoryId: services.categoryId
        })
        .from(services)
        .where(inArray(services.id, serviceIds));

      const serviceById = new Map(existingServices.map((item) => [item.id, item.categoryId]));

      const hasInvalidSelection = structuredSelections.some(
        (item) => serviceById.get(item.serviceId) !== item.categoryId
      );

      if (hasInvalidSelection || existingServices.length !== serviceIds.length) {
        await removeFileIfExists(savedResumePath);
        return reply.code(400).send({
          message: "One or more selected specializations are invalid"
        });
      }
    }

    try {
      const inserted = await db
        .insert(employment)
        .values({
          fullName: bodyParse.data.fullName,
          emailAddress,
          phoneNumber,
          specializations: JSON.stringify(bodyParse.data.specializations),
          coverLetter: bodyParse.data.coverLetter,
          resumeFileName: resumeStoredFileName,
          status: "new",
          ...buildAuditCreateFields("public_employment_form")
        })
        .returning({
          id: employment.id,
          empId: employment.empId,
          fullName: employment.fullName,
          emailAddress: employment.emailAddress,
          phoneNumber: employment.phoneNumber,
          status: employment.status,
          resumeFileName: employment.resumeFileName,
          createdAt: employment.createdAt
        });

      const createdSubmission = inserted[0];

      void findAdminRecipientEmails()
        .then(async (adminEmails) => {
          if (adminEmails.length === 0) {
            return;
          }

          const emailContent = buildAdminSubmissionNotificationEmail({
            fullName: createdSubmission.fullName,
            emailAddress: createdSubmission.emailAddress,
            phoneNumber: createdSubmission.phoneNumber,
            empId: createdSubmission.empId
          });

          await fastify.mail.send({
            to: adminEmails,
            subject: emailContent.subject,
            text: emailContent.text,
            html: emailContent.html
          });
        })
        .catch((error) => {
          fastify.log.error({ error }, "Failed to send employment submission email to admins");
        });

      void sendTemplatedEmail(
        {
          to: createdSubmission.emailAddress,
          templateKey: TEMPLATE_KEYS.EMPLOYMENT_APPLICANT_CONFIRMATION,
          data: {
            fullName: createdSubmission.fullName,
            emailAddress: createdSubmission.emailAddress
          },
          fallback: () => buildApplicantSubmissionConfirmationEmail({
            fullName: createdSubmission.fullName,
            emailAddress: createdSubmission.emailAddress
          }),
          strict: false
        },
        fastify.mail,
        fastify.log
      ).catch((error) => {
        fastify.log.error({ error }, "Failed to send employment submission confirmation email to applicant");
      });

      return reply.code(201).send({
        message: "Employment application submitted successfully",
        submission: {
          id: createdSubmission.id,
          empId: createdSubmission.empId,
          status: createdSubmission.status,
          resumeFileName: createdSubmission.resumeFileName,
          createdAt: createdSubmission.createdAt
        }
      });
    } catch (error) {
      await removeFileIfExists(savedResumePath);
      throw error;
    }
  });

  fastify.get(
    "/admin/employment",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize(["super_admin" as Role, "admin" as Role])
      ]
    },
    async (request, reply) => {
      const queryParse = adminEmploymentQuerySchema.safeParse(request.query);

      if (!queryParse.success) {
        return reply.code(400).send({
          message: "Invalid query params",
          errors: queryParse.error.flatten()
        });
      }

      const statusClause = queryParse.data.status
        ? eq(employment.status, queryParse.data.status)
        : undefined;

      const searchClause = queryParse.data.search
        ? (() => {
        const normalizedSearch = `%${escapeLikePattern(queryParse.data.search.toLowerCase())}%`;

        return sql`(
            lower(${employment.fullName}) LIKE ${normalizedSearch} ESCAPE '\\'
            OR lower(${employment.emailAddress}) LIKE ${normalizedSearch} ESCAPE '\\'
            OR lower(${employment.phoneNumber}) LIKE ${normalizedSearch} ESCAPE '\\'
            OR lower(${employment.empId}) LIKE ${normalizedSearch} ESCAPE '\\'
          )`;
          })()
        : undefined;

      const whereClause =
        statusClause && searchClause
          ? and(statusClause, searchClause)
          : statusClause ?? searchClause;

      const baseQuery = db
        .select({
          id: employment.id,
          empId: employment.empId,
          fullName: employment.fullName,
          emailAddress: employment.emailAddress,
          phoneNumber: employment.phoneNumber,
          specializations: employment.specializations,
          coverLetter: employment.coverLetter,
          resumeFileName: employment.resumeFileName,
          status: employment.status,
          createdBy: employment.createdBy,
          createdAt: employment.createdAt,
          updatedAt: employment.updatedAt
        })
        .from(employment)
        .orderBy(desc(employment.createdAt), desc(employment.id));

      const list = whereClause ? await baseQuery.where(whereClause) : await baseQuery;

      const parsedByEmpId = new Map<string, Array<string | { categoryId: number; serviceId: number }>>();
      const categoryIds = new Set<number>();
      const serviceIds = new Set<number>();

      for (const row of list) {
        const parsed = parseSpecializations(row.specializations);
        parsedByEmpId.set(row.empId, parsed);

        for (const item of parsed) {
          if (typeof item === "string") {
            continue;
          }

          categoryIds.add(item.categoryId);
          serviceIds.add(item.serviceId);
        }
      }

      const [categoryRows, serviceRows] = await Promise.all([
        categoryIds.size > 0
          ? db
              .select({ id: serviceCategories.id, title: serviceCategories.title })
              .from(serviceCategories)
              .where(inArray(serviceCategories.id, Array.from(categoryIds)))
          : Promise.resolve([]),
        serviceIds.size > 0
          ? db
              .select({ id: services.id, label: services.label })
              .from(services)
              .where(inArray(services.id, Array.from(serviceIds)))
          : Promise.resolve([])
      ]);

      const categoryTitleById = new Map(categoryRows.map((item) => [item.id, item.title]));
      const serviceLabelById = new Map(serviceRows.map((item) => [item.id, item.label]));

      const enriched = list.map((row) => {
        const parsed = parsedByEmpId.get(row.empId) ?? [];

        const resolved = parsed.map((item) => {
          if (typeof item === "string") {
            return item;
          }

          const categoryTitle = categoryTitleById.get(item.categoryId);
          const serviceLabel = serviceLabelById.get(item.serviceId);

          if (categoryTitle && serviceLabel) {
            return `${categoryTitle}: ${serviceLabel}`;
          }

          if (serviceLabel) {
            return serviceLabel;
          }

          if (categoryTitle) {
            return categoryTitle;
          }

          return `${item.categoryId}:${item.serviceId}`;
        });

        return {
          ...row,
          specializations: JSON.stringify(resolved)
        };
      });

      return reply.send({ data: enriched });
    }
  );

  fastify.get(
    "/admin/employment/:empId/resume",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize(["super_admin" as Role, "admin" as Role])
      ]
    },
    async (request, reply) => {
      const paramsParse = employmentEmpIdParamsSchema.safeParse(request.params);

      if (!paramsParse.success) {
        return reply.code(400).send({
          message: "Invalid route params",
          errors: paramsParse.error.flatten()
        });
      }

      const existing = await db
        .select({
          empId: employment.empId,
          resumeFileName: employment.resumeFileName
        })
        .from(employment)
        .where(eq(employment.empId, paramsParse.data.empId))
        .limit(1);

      const submission = existing[0];

      if (!submission) {
        return reply.code(404).send({ message: "Employment submission not found" });
      }

      const uploadDir = resolve(process.cwd(), env.EMPLOYMENT_RESUME_UPLOAD_DIR);
      const safeStoredName = basename(submission.resumeFileName);
      const filePath = resolve(uploadDir, safeStoredName);

      try {
        await access(filePath);
      } catch {
        return reply.code(404).send({ message: "Resume file not found" });
      }

      const extension = extname(safeStoredName).toLowerCase();
      const contentType =
        extension === ".pdf"
          ? "application/pdf"
          : extension === ".doc"
            ? "application/msword"
            : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

      reply.header(
        "Content-Disposition",
        `attachment; filename="employment-${submission.empId}${extension}"`
      );
      reply.type(contentType);
      return reply.send(createReadStream(filePath));
    }
  );

  fastify.post(
    "/admin/employment/:empId/approve",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize(["super_admin" as Role, "admin" as Role])
      ]
    },
    async (request, reply) => {
      const paramsParse = employmentEmpIdParamsSchema.safeParse(request.params);

      if (!paramsParse.success) {
        return reply.code(400).send({
          message: "Invalid route params",
          errors: paramsParse.error.flatten()
        });
      }

      const updated = await updateEmploymentStatusByEmpId(paramsParse.data.empId, "approve");

      if (!updated) {
        return reply.code(404).send({ message: "Employment submission not found" });
      }

      void sendTemplatedEmail(
        {
          to: updated.emailAddress,
          templateKey: TEMPLATE_KEYS.EMPLOYMENT_APPLICANT_STATUS,
          data: {
            fullName: updated.fullName,
            empId: updated.empId,
            ...buildApplicantStatusTemplateData("approve")
          },
          fallback: () => buildApplicantStatusEmail({ fullName: updated.fullName, empId: updated.empId, status: "approve" }),
          strict: false
        },
        fastify.mail,
        fastify.log
      ).catch((error) => {
        fastify.log.error({ error, empId: updated.empId }, "Failed to send approval email");
      });

      return reply.send({
        message: "Employment submission approved successfully",
        submission: {
          id: updated.id,
          empId: updated.empId,
          status: updated.status,
          updatedAt: updated.updatedAt
        }
      });
    }
  );

  fastify.post(
    "/admin/employment/:empId/reject",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize(["super_admin" as Role, "admin" as Role])
      ]
    },
    async (request, reply) => {
      const paramsParse = employmentEmpIdParamsSchema.safeParse(request.params);

      if (!paramsParse.success) {
        return reply.code(400).send({
          message: "Invalid route params",
          errors: paramsParse.error.flatten()
        });
      }

      const updated = await updateEmploymentStatusByEmpId(paramsParse.data.empId, "reject");

      if (!updated) {
        return reply.code(404).send({ message: "Employment submission not found" });
      }

      void sendTemplatedEmail(
        {
          to: updated.emailAddress,
          templateKey: TEMPLATE_KEYS.EMPLOYMENT_APPLICANT_STATUS,
          data: {
            fullName: updated.fullName,
            empId: updated.empId,
            ...buildApplicantStatusTemplateData("reject")
          },
          fallback: () => buildApplicantStatusEmail({ fullName: updated.fullName, empId: updated.empId, status: "reject" }),
          strict: false
        },
        fastify.mail,
        fastify.log
      ).catch((error) => {
        fastify.log.error({ error, empId: updated.empId }, "Failed to send rejection email");
      });

      return reply.send({
        message: "Employment submission rejected successfully",
        submission: {
          id: updated.id,
          empId: updated.empId,
          status: updated.status,
          updatedAt: updated.updatedAt
        }
      });
    }
  );
};

export default employmentRoutes;