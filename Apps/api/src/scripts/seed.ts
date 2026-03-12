import { ensureTables } from "../db/bootstrap.js";
import { seedSuperAdmin } from "../db/seed.js";

async function runSeed() {
  await ensureTables();
  await seedSuperAdmin();
}

runSeed().catch((error) => {
  console.error("Failed to seed data", error);
  process.exit(1);
});
