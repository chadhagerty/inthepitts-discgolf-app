import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis;

export function getPrisma() {
  // Reuse in dev hot-reload
  if (globalForPrisma.__prisma) return globalForPrisma.__prisma;

  // IMPORTANT: do not init Prisma during Next build step
  if (process.env.NEXT_PHASE === "phase-production-build") {
    throw new Error("Prisma should not initialize during build");
  }

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is missing");

  // Neon generally wants SSL; keep this
  const pool = new Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });

  // Prisma v7 requires options (adapter or accelerateUrl) — adapter-pg is the simplest
  const prisma = new PrismaClient({
    adapter: new PrismaPg(pool),
  });

  globalForPrisma.__prisma = prisma;
  return prisma;
}
