import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";


const globalForPrisma = globalThis;


export function getPrisma() {
  if (globalForPrisma.__prisma) return globalForPrisma.__prisma;


  if (process.env.NEXT_PHASE === "phase-production-build") {
    throw new Error("Prisma should not initialize during build");
  }


  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is missing");


  const pool = new Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });


  const prisma = new PrismaClient({
    adapter: new PrismaPg(pool),
  });


  globalForPrisma.__prisma = prisma;
  return prisma;
}


