import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const prisma = getPrisma();
    const { email, source = "manual", hole = null } = await req.json();

    if (!email || typeof email !== "string") {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    const member = await prisma.member.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!member) {
      return Response.json(
        { error: "No member found for that email" },
        { status: 404 }
      );
    }

    const now = new Date();
    if (!member.expiresAt || new Date(member.expiresAt) <= now) {
      return Response.json(
        { error: "Membership/day pass expired" },
        { status: 403 }
      );
    }

    await prisma.checkIn.create({
      data: {
        memberId: member.id,
        source,
        // NOTE: we’re not storing hole yet in schema (optional upgrade later)
      },
    });

    return Response.json({
      ok: true,
      message: `Checked in: ${member.name} (${member.membership})`,
    });
  } catch (e) {
    return Response.json(
      { error: e?.message || "Check-in error" },
      { status: 500 }
    );
  }
}
