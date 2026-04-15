import { seedInitialEmailTemplates } from "./db/seed.js";

let appPromise: Promise<any> | null = null;

async function getApp() {
  if (!appPromise) {
    appPromise = (async () => {
      const [{ buildApp }, { ensureTables }, { seedInitialServices, seedInitialTestimonials, seedSuperAdmin }] =
        await Promise.all([import("./app.js"), import("./db/bootstrap.js"), import("./db/seed.js")]);

      const app = buildApp();

      try {
        await ensureTables();
        await seedSuperAdmin();
        await seedInitialServices();
        await seedInitialTestimonials();
        await seedInitialEmailTemplates();
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
  try {
    const app = await getApp();
    app.server.emit("request", req, res);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown startup error";

    console.error("Serverless startup failed", error);

    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ status: "error", message }));
  }
}
