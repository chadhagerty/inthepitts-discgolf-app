import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

function authOk(req: Request) {
  const key = process.env.ADMIN_KEY || "";
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  return key && token && token === key;
}

export async function GET(req: Request) {
  if (!authOk(req)) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const prisma = getPrisma();
  const rows = await prisma.statsOverride.findMany({ orderBy: { key: "asc" } });

  const obj: Record<string, string> = {};
  for (const r of rows) obj[r.key] = r.value;

  return Response.json({ ok: true, overrides: obj });
}

export async function POST(req: Request) {
  if (!authOk(req)) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const prisma = getPrisma();
  const body = await req.json().catch(() => ({}));

  const key = String(body?.key || "").trim();
  const value = String(body?.value ?? "").trim();

  if (!key) return Response.json({ ok: false, error: "missing key" }, { status: 400 });

  await prisma.statsOverride.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  return Response.json({ ok: true });
}
