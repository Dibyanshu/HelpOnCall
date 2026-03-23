import { eq } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";
import { db } from "../db/index.js";
import { customerTestimonials } from "../db/schema.js";

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
      })
      .from(customerTestimonials)
      .where(eq(customerTestimonials.status, "active"));

    return { data: list };
  });
};

export default testimonialsRoutes;
