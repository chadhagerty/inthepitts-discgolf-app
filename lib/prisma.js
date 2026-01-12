import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis;

// Reuse pool + prisma in dev (prevents too many connections)
const pool =
  globalForPrisma.__pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Neon friendly
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.__pgPool = pool;

const adapter = new PrismaPg(pool);

const prisma =
  globalForPrisma.__prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.__prisma = prisma;

export default prisma;
