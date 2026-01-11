import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";


const { Pool } = pg;


function makeClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing. Put it in .env at project root.");
  }


  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });


  const adapter = new PrismaPg(pool);


  // Prisma 7: PrismaClient must be constructed with options (adapter here).
  return new PrismaClient({ adapter });
}


const globalForPrisma = globalThis;


export const prisma = globalForPrisma.prisma ?? makeClient();


if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

