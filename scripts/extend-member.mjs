import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("❌ DATABASE_URL is missing. Check your .env file.");
  process.exit(1);
}
console.log("DB host:", new URL(url).host);

const pool = new Pool({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const NAME = "Chad Hagerty";
const NEW_EXPIRY = new Date("2027-01-01T00:00:00.000Z");

const member = await prisma.member.findFirst({
  where: { name: { equals: NAME, mode: "insensitive" } },
});

if (!member) {
  console.error("❌ Member not found:", NAME);
  process.exit(1);
}

const updated = await prisma.member.update({
  where: { id: member.id },
  data: { expiresAt: NEW_EXPIRY, membership: "yearly" },
});

console.log("✅ Updated member:", {
  id: updated.id,
  name: updated.name,
  expiresAt: updated.expiresAt,
  membership: updated.membership,
});

await prisma.$disconnect();

await pool.end();
