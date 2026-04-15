import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import Fastify from "fastify";
import { env } from "./config/env.js";
import authPlugin from "./plugins/auth.js";
import mailPlugin from "./plugins/mail.js";
import adminUserRoutes from "./routes/admin-users.js";
import emailValidatorRoutes from "./routes/emailValidator.js";
import emailTemplateRoutes from "./routes/emailTemplates.js";
import authRoutes from "./routes/auth.js";
import employmentRoutes from "./routes/employment.js";
import healthRoutes from "./routes/health.js";
import rfqsRoute from "./routes/rfqs.js";
import servicesRoutes from "./routes/services.js";
import testimonialsRoutes from "./routes/testimonials.js";

function registerV1Routes(app: ReturnType<typeof Fastify>, plugin: Parameters<typeof app.register>[0]) {
  app.register(plugin, { prefix: "/api/v1" });
  app.register(plugin, { prefix: "/v1" });
}

export function buildApp() {
  const app = Fastify({
    logger: true
  });

  app.register(cors, {
    origin: true
  });

  app.register(multipart, {
    limits: {
      files: 1,
      fileSize: env.EMPLOYMENT_RESUME_MAX_FILE_SIZE_MB * 1024 * 1024
    }
  });

  app.register(authPlugin);
  app.register(mailPlugin);

  registerV1Routes(app, healthRoutes);
  registerV1Routes(app, authRoutes);
  registerV1Routes(app, adminUserRoutes);
  registerV1Routes(app, emailValidatorRoutes);
  registerV1Routes(app, emailTemplateRoutes);
  registerV1Routes(app, servicesRoutes);
  registerV1Routes(app, employmentRoutes);
  registerV1Routes(app, rfqsRoute);
  registerV1Routes(app, testimonialsRoutes);

  return app;
}
