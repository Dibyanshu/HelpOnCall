import { buildApp } from "./app.js";
import { ensureTables } from "./db/bootstrap.js";
import { seedInitialServices, seedInitialTestimonials, seedSuperAdmin } from "./db/seed.js";

let appPromise: Promise<any> | null = null;

async function getApp() {
  if (!appPromise) {
    appPromise = (async () => {
      const app = buildApp();

      try {
        await ensureTables();
        await seedSuperAdmin();
        await seedInitialServices();
        await seedInitialTestimonials();
      } catch (error) {
        // Avoid crashing the whole function on startup; log details for Vercel logs.
        app.log.error({ error }, "Startup bootstrap/seed failed in serverless mode");
      }

      await app.ready();

      return app;
    })();
  }

  return appPromise;
}

export default async function handler(req: any, res: any) {
  const app = await getApp();
  app.server.emit("request", req, res);
}
