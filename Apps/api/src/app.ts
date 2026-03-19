import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import Fastify from "fastify";
import { env } from "./config/env.js";
import authPlugin from "./plugins/auth.js";
import mailPlugin from "./plugins/mail.js";
import adminUserRoutes from "./routes/admin-users.js";
import authRoutes from "./routes/auth.js";
import employmentRoutes from "./routes/employment.js";
import healthRoutes from "./routes/health.js";
import servicesRoutes from "./routes/services.js";
import totpRoutes from "./routes/totp.js";

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

  app.register(healthRoutes, { prefix: "/api/v1" });
  app.register(authRoutes, { prefix: "/api/v1" });
  app.register(adminUserRoutes, { prefix: "/api/v1" });
  app.register(servicesRoutes, { prefix: "/api/v1" });
  app.register(totpRoutes, { prefix: "/api/v1" });
  app.register(employmentRoutes, { prefix: "/api/v1" });

  return app;
}
