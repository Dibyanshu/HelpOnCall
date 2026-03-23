import { buildApp } from "./app.js";
import { env } from "./config/env.js";
import { ensureTables } from "./db/bootstrap.js";
import { seedInitialServices, seedSuperAdmin } from "./db/seed.js";

async function start() {
  const app = buildApp();

  await ensureTables();
  await seedSuperAdmin();
  await seedInitialServices();

  try {
    await app.listen({
      port: env.PORT,
      host: env.HOST
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void start();
//
