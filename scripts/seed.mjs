import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL missing in .env");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const name = "Chad Hagerty";
  const expiresAt = new Date("2026-01-01");
  const membership = "yearly"; // "day" | "yearly"

  const existing = await prisma.member.findFirst({
    where: { name },
  });

  if (existing) {
    const updated = await prisma.member.update({
      where: { id: existing.id },
      data: { expiresAt, membership },
    });

    console.log("✅ Updated member:", {
      id: updated.id,
      name: updated.name,
      membership: updated.membership,
      expiresAt: updated.expiresAt,
    });
    return;
  }

  const created = await prisma.member.create({
    data: { name, membership, expiresAt },
  });

  console.log("✅ Created member:", {
    id: created.id,
    name: created.name,
    membership: created.membership,
    expiresAt: created.expiresAt,
  });
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
