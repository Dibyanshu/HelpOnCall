import cors from "@fastify/cors";
import Fastify from "fastify";
import authPlugin from "./plugins/auth.js";
import mailPlugin from "./plugins/mail.js";
import adminUserRoutes from "./routes/admin-users.js";
import authRoutes from "./routes/auth.js";
import healthRoutes from "./routes/health.js";

export function buildApp() {
  const app = Fastify({
    logger: true
  });

  app.register(cors, {
    origin: true
  });

  app.register(authPlugin);
  app.register(mailPlugin);

  app.register(healthRoutes, { prefix: "/api/v1" });
  app.register(authRoutes, { prefix: "/api/v1" });
  app.register(adminUserRoutes, { prefix: "/api/v1" });

  return app;
}
