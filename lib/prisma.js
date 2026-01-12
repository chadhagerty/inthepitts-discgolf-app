import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis;

export function getPrisma() {
  if (globalForPrisma.__prisma) return globalForPrisma.__prisma;

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is missing on the server.");

  const pool =
    globalForPrisma.__pool ??
    new Pool({
      connectionString: url,
      ssl: { rejectUnauthorized: false },
    });

  globalForPrisma.__pool = pool;

  const prisma = new PrismaClient({
    adapter: new PrismaPg(pool),
  });

  globalForPrisma.__prisma = prisma;
  return prisma;
}

