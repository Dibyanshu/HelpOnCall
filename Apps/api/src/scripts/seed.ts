import { ensureTables } from "../db/bootstrap.js";
import { seedInitialServices, seedInitialTestimonials, seedSuperAdmin } from "../db/seed.js";

async function runSeed() {
  await ensureTables();
  await seedSuperAdmin();
  await seedInitialServices();
  console.log("Seeding testimonials...");
  await seedInitialTestimonials();
}

runSeed().catch((error) => {
  console.error("Failed to seed data", error);
  process.exit(1);
});
