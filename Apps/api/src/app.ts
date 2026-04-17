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

  const allowedCorsOrigins = (env.CORS_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
  const useStrictCorsAllowlist = env.APP_ENV === "production" && allowedCorsOrigins.length > 0;

  if (useStrictCorsAllowlist) {
    app.log.info(
      { allowedOrigins: allowedCorsOrigins },
      "CORS mode: strict allowlist enabled"
    );
  } else if (env.APP_ENV === "production") {
    app.log.warn("CORS_ALLOWED_ORIGINS is not set. Falling back to permissive CORS origin policy.");
  } else {
    app.log.info("CORS mode: permissive (non-production environment)");
  }

  app.register(cors, {
    origin: (origin, callback) => {
      if (!useStrictCorsAllowlist) {
        callback(null, true);
        return;
      }

      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedCorsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"), false);
    }
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
