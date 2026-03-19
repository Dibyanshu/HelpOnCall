import { asc, eq } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { buildAuditCreateFields, buildAuditUpdateFields } from "../db/audit.js";
import { db } from "../db/index.js";
import { serviceCategories, services } from "../db/schema.js";
import type { Role } from "../types/auth.js";
import {
  reindexDisplayOrderAfterDelete,
  reindexDisplayOrderForWrite
} from "../utils/display-order.js";

const categoryIdParamsSchema = z.object({
  categoryId: z.coerce.number().int().positive()
});

const serviceIdParamsSchema = z.object({
  serviceId: z.coerce.number().int().positive()
});

const createCategorySchema = z.object({
  title: z.string().min(1),
  displayOrder: z.number().int().optional().default(0)
});

const updateCategorySchema = z
  .object({
    title: z.string().min(1).optional(),
    displayOrder: z.number().int().optional()
  })
  .refine((value) => value.title !== undefined || value.displayOrder !== undefined, {
    message: "At least one field is required"
  });

const createServiceSchema = z.object({
  categoryId: z.number().int().positive(),
  label: z.string().min(1),
  desc: z.string().optional(),
  image: z.string().url().optional(),
  icon: z.string().min(1).optional(),
  displayOrder: z.number().int().optional().default(0)
});

const updateServiceSchema = z
  .object({
    categoryId: z.number().int().positive().optional(),
    label: z.string().min(1).optional(),
    desc: z.string().optional(),
    image: z.string().url().optional(),
    icon: z.string().min(1).optional(),
    displayOrder: z.number().int().optional()
  })
  .refine(
    (value) =>
      value.categoryId !== undefined ||
      value.label !== undefined ||
      value.desc !== undefined ||
      value.image !== undefined ||
      value.icon !== undefined ||
      value.displayOrder !== undefined,
    {
      message: "At least one field is required"
    }
  );

const servicesRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    "/admin/service-categories",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize(["super_admin" as Role, "admin" as Role])
      ]
    },
    async () => {
      const list = await db
        .select({
          id: serviceCategories.id,
          title: serviceCategories.title,
          displayOrder: serviceCategories.displayOrder,
          createdBy: serviceCategories.createdBy,
          createdAt: serviceCategories.createdAt,
          updatedAt: serviceCategories.updatedAt
        })
        .from(serviceCategories)
        .orderBy(asc(serviceCategories.displayOrder), asc(serviceCategories.id));

      return { data: list };
    }
  );

  fastify.get(
    "/admin/services",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize(["super_admin" as Role, "admin" as Role])
      ]
    },
    async () => {
      const list = await db
        .select({
          id: services.id,
          categoryId: services.categoryId,
          label: services.label,
          desc: services.description,
          image: services.imageUrl,
          icon: services.iconName,
          displayOrder: services.displayOrder,
          createdBy: services.createdBy,
          createdAt: services.createdAt,
          updatedAt: services.updatedAt
        })
        .from(services)
        .orderBy(asc(services.displayOrder), asc(services.id));

      return { data: list };
    }
  );

  fastify.get("/services", async () => {
    const [categories, servicesList] = await Promise.all([
      db
        .select({
          id: serviceCategories.id,
          title: serviceCategories.title,
          displayOrder: serviceCategories.displayOrder
        })
        .from(serviceCategories)
        .orderBy(asc(serviceCategories.displayOrder), asc(serviceCategories.id)),
      db
        .select({
          id: services.id,
          categoryId: services.categoryId,
          label: services.label,
          desc: services.description,
          image: services.imageUrl,
          icon: services.iconName,
          displayOrder: services.displayOrder
        })
        .from(services)
        .orderBy(asc(services.displayOrder), asc(services.id))
    ]);

    const servicesByCategoryId = new Map<number, Array<{
      categoryId: number;
      serviceId: number;
      label: string;
      desc: string | null;
      image: string | null;
      icon: string | null;
      displayOrder: number;
    }>>();

    for (const item of servicesList) {
      const current = servicesByCategoryId.get(item.categoryId) ?? [];
      current.push({
        categoryId: item.categoryId,
        serviceId: item.id,
        label: item.label,
        desc: item.desc,
        image: item.image,
        icon: item.icon,
        displayOrder: item.displayOrder ?? 0
      });
      servicesByCategoryId.set(item.categoryId, current);
    }

    return categories.map((category) => ({
      categoryId: category.id,
      title: category.title,
      displayOrder: category.displayOrder ?? 0,
      features: servicesByCategoryId.get(category.id) ?? []
    }));
  });

  fastify.post(
    "/admin/service-categories",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize(["super_admin" as Role, "admin" as Role])
      ]
    },
    async (request, reply) => {
      const bodyParse = createCategorySchema.safeParse(request.body);

      if (!bodyParse.success) {
        return reply.code(400).send({
          message: "Invalid request body",
          errors: bodyParse.error.flatten()
        });
      }

      const authUser = request.authUser;

      if (!authUser) {
        return reply.code(401).send({ message: "Unauthorized" });
      }

      const normalizedDisplayOrder = await reindexDisplayOrderForWrite(
        "service-category",
        bodyParse.data.displayOrder
      );

      const inserted = await db
        .insert(serviceCategories)
        .values({
          title: bodyParse.data.title,
          displayOrder: normalizedDisplayOrder,
          ...buildAuditCreateFields(authUser.role)
        })
        .returning({
          id: serviceCategories.id,
          title: serviceCategories.title,
          displayOrder: serviceCategories.displayOrder,
          createdBy: serviceCategories.createdBy,
          createdAt: serviceCategories.createdAt,
          updatedAt: serviceCategories.updatedAt
        });

      return reply.code(201).send({
        message: "Service category created successfully",
        category: inserted[0]
      });
    }
  );

  fastify.patch(
    "/admin/service-categories/:categoryId",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize(["super_admin" as Role, "admin" as Role])
      ]
    },
    async (request, reply) => {
      const paramsParse = categoryIdParamsSchema.safeParse(request.params);

      if (!paramsParse.success) {
        return reply.code(400).send({
          message: "Invalid route params",
          errors: paramsParse.error.flatten()
        });
      }

      const bodyParse = updateCategorySchema.safeParse(request.body);

      if (!bodyParse.success) {
        return reply.code(400).send({
          message: "Invalid request body",
          errors: bodyParse.error.flatten()
        });
      }

      const existing = await db
        .select({ id: serviceCategories.id })
        .from(serviceCategories)
        .where(eq(serviceCategories.id, paramsParse.data.categoryId))
        .limit(1);

      if (existing.length === 0) {
        return reply.code(404).send({ message: "Service category not found" });
      }

      const normalizedDisplayOrder =
        bodyParse.data.displayOrder !== undefined
          ? await reindexDisplayOrderForWrite(
              "service-category",
              bodyParse.data.displayOrder,
              paramsParse.data.categoryId
            )
          : undefined;

      const updated = await db
        .update(serviceCategories)
        .set({
          ...bodyParse.data,
          ...(normalizedDisplayOrder !== undefined
            ? { displayOrder: normalizedDisplayOrder }
            : {}),
          ...buildAuditUpdateFields()
        })
        .where(eq(serviceCategories.id, paramsParse.data.categoryId))
        .returning({
          id: serviceCategories.id,
          title: serviceCategories.title,
          displayOrder: serviceCategories.displayOrder,
          createdBy: serviceCategories.createdBy,
          createdAt: serviceCategories.createdAt,
          updatedAt: serviceCategories.updatedAt
        });

      return reply.send({
        message: "Service category updated successfully",
        category: updated[0]
      });
    }
  );

  fastify.delete(
    "/admin/service-categories/:categoryId",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize(["super_admin" as Role, "admin" as Role])
      ]
    },
    async (request, reply) => {
      const paramsParse = categoryIdParamsSchema.safeParse(request.params);

      if (!paramsParse.success) {
        return reply.code(400).send({
          message: "Invalid route params",
          errors: paramsParse.error.flatten()
        });
      }

      const existing = await db
        .select({ id: serviceCategories.id })
        .from(serviceCategories)
        .where(eq(serviceCategories.id, paramsParse.data.categoryId))
        .limit(1);

      if (existing.length === 0) {
        return reply.code(404).send({ message: "Service category not found" });
      }

      await db
        .delete(serviceCategories)
        .where(eq(serviceCategories.id, paramsParse.data.categoryId));

      await reindexDisplayOrderAfterDelete("service-category");
      await reindexDisplayOrderAfterDelete("service");

      return reply.send({ message: "Service category deleted successfully" });
    }
  );

  fastify.post(
    "/admin/services",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize(["super_admin" as Role, "admin" as Role])
      ]
    },
    async (request, reply) => {
      const bodyParse = createServiceSchema.safeParse(request.body);

      if (!bodyParse.success) {
        return reply.code(400).send({
          message: "Invalid request body",
          errors: bodyParse.error.flatten()
        });
      }

      const authUser = request.authUser;

      if (!authUser) {
        return reply.code(401).send({ message: "Unauthorized" });
      }

      const categoryExists = await db
        .select({ id: serviceCategories.id })
        .from(serviceCategories)
        .where(eq(serviceCategories.id, bodyParse.data.categoryId))
        .limit(1);

      if (categoryExists.length === 0) {
        return reply.code(404).send({ message: "Service category not found" });
      }

      const normalizedDisplayOrder = await reindexDisplayOrderForWrite(
        "service",
        bodyParse.data.displayOrder
      );

      const inserted = await db
        .insert(services)
        .values({
          categoryId: bodyParse.data.categoryId,
          label: bodyParse.data.label,
          description: bodyParse.data.desc ?? null,
          imageUrl: bodyParse.data.image ?? null,
          iconName: bodyParse.data.icon ?? null,
          displayOrder: normalizedDisplayOrder,
          ...buildAuditCreateFields(authUser.role)
        })
        .returning({
          id: services.id,
          categoryId: services.categoryId,
          label: services.label,
          desc: services.description,
          image: services.imageUrl,
          icon: services.iconName,
          displayOrder: services.displayOrder,
          createdBy: services.createdBy,
          createdAt: services.createdAt,
          updatedAt: services.updatedAt
        });

      return reply.code(201).send({
        message: "Service created successfully",
        service: inserted[0]
      });
    }
  );

  fastify.patch(
    "/admin/services/:serviceId",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize(["super_admin" as Role, "admin" as Role])
      ]
    },
    async (request, reply) => {
      const paramsParse = serviceIdParamsSchema.safeParse(request.params);

      if (!paramsParse.success) {
        return reply.code(400).send({
          message: "Invalid route params",
          errors: paramsParse.error.flatten()
        });
      }

      const bodyParse = updateServiceSchema.safeParse(request.body);

      if (!bodyParse.success) {
        return reply.code(400).send({
          message: "Invalid request body",
          errors: bodyParse.error.flatten()
        });
      }

      const existing = await db
        .select({ id: services.id })
        .from(services)
        .where(eq(services.id, paramsParse.data.serviceId))
        .limit(1);

      if (existing.length === 0) {
        return reply.code(404).send({ message: "Service not found" });
      }

      if (bodyParse.data.categoryId !== undefined) {
        const categoryExists = await db
          .select({ id: serviceCategories.id })
          .from(serviceCategories)
          .where(eq(serviceCategories.id, bodyParse.data.categoryId))
          .limit(1);

        if (categoryExists.length === 0) {
          return reply.code(404).send({ message: "Service category not found" });
        }
      }

      const normalizedDisplayOrder =
        bodyParse.data.displayOrder !== undefined
          ? await reindexDisplayOrderForWrite(
              "service",
              bodyParse.data.displayOrder,
              paramsParse.data.serviceId
            )
          : undefined;

      const updated = await db
        .update(services)
        .set({
          categoryId: bodyParse.data.categoryId,
          label: bodyParse.data.label,
          description: bodyParse.data.desc,
          imageUrl: bodyParse.data.image,
          iconName: bodyParse.data.icon,
          ...(normalizedDisplayOrder !== undefined
            ? { displayOrder: normalizedDisplayOrder }
            : {}),
          ...buildAuditUpdateFields()
        })
        .where(eq(services.id, paramsParse.data.serviceId))
        .returning({
          id: services.id,
          categoryId: services.categoryId,
          label: services.label,
          desc: services.description,
          image: services.imageUrl,
          icon: services.iconName,
          displayOrder: services.displayOrder,
          createdBy: services.createdBy,
          createdAt: services.createdAt,
          updatedAt: services.updatedAt
        });

      return reply.send({
        message: "Service updated successfully",
        service: updated[0]
      });
    }
  );

  fastify.delete(
    "/admin/services/:serviceId",
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize(["super_admin" as Role, "admin" as Role])
      ]
    },
    async (request, reply) => {
      const paramsParse = serviceIdParamsSchema.safeParse(request.params);

      if (!paramsParse.success) {
        return reply.code(400).send({
          message: "Invalid route params",
          errors: paramsParse.error.flatten()
        });
      }

      const existing = await db
        .select({ id: services.id })
        .from(services)
        .where(eq(services.id, paramsParse.data.serviceId))
        .limit(1);

      if (existing.length === 0) {
        return reply.code(404).send({ message: "Service not found" });
      }

      await db.delete(services).where(eq(services.id, paramsParse.data.serviceId));

      await reindexDisplayOrderAfterDelete("service");

      return reply.send({ message: "Service deleted successfully" });
    }
  );
};

export default servicesRoutes;
