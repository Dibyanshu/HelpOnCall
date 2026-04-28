import { eq } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
import { db } from "../db/index.js";
import { env } from "../config/env.js";
const dbProvider = env.DB_PROVIDER;
const mysqlSchema = await import("../db/schema.mysql.js");
const sqliteSchema = await import("../db/schema.js");
const { customerTestimonials } = dbProvider === "cloudways" ? mysqlSchema : sqliteSchema;

const testimonialsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/testimonials", async () => {
    const list = await db
      .select({
        id: customerTestimonials.id,
        customerName: customerTestimonials.customerName,
        customerEmail: customerTestimonials.customerEmail,
        message: customerTestimonials.message,
        rating: customerTestimonials.rating,
        profilePic: customerTestimonials.profilePic,
        createdOn: customerTestimonials.createdAt,
        status: customerTestimonials.status
      } as any)
      .from(customerTestimonials)
      .where(eq(customerTestimonials.status, "active"));

    return { data: list };
  });
};

export default testimonialsRoutes;
