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
  const rows = await prisma.checkIn.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: { member: true },
  });

  console.log(
    rows.map((r) => ({
      when: r.createdAt,
      name: r.member?.name,
      membership: r.member?.membership,
      source: r.source,
    }))
  );
}

main()
  .catch((e) => {
    console.error("❌ Query failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
