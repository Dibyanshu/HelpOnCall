import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { db } from "../db/index.js";
import { rfqs } from "../db/schema.js";

const rfqSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1),
  phone: z.string().min(1),
  address: z.string().min(1),
  preferredContact: z.enum(["email", "phone", "any"]),
  serviceSelected: z.record(z.any()),
  startDate: z.string().transform((str) => new Date(str)),
  durationVal: z.number().positive(),
  durationType: z.enum(["Day", "Week", "Month"]),
  selfCare: z.boolean(),
  recipientName: z.string().min(1),
  recipientRelation: z.string().min(1),
});

const rfqRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/rfqs", async (request, reply) => {
    try {
      const body = rfqSchema.parse(request.body);

      const [newRfq] = await db
        .insert(rfqs)
        .values({
          ...body,
          status: "new",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return reply.code(201).send({
        success: true,
        message: "RFQ submitted successfully",
        data: newRfq,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          message: "Validation failed",
          errors: error.errors,
        });
      }
      fastify.log.error(error);
      return reply.code(500).send({
        success: false,
        message: "Failed to submit RFQ",
      });
    }
  });
};

export default rfqRoutes;
