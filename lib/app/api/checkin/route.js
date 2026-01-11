import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const name = (body?.name || "").trim();
  const source = (body?.source || "manual").trim(); // "manual" | "qr"

  if (!name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  const member = await prisma.member.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });

  // Not a member (day pass / yearly options)
  if (!member) {
    return NextResponse.json({
      status: "not-member",
      pricing: { dayPass: 10, yearly: 100 },
      etransfer: "inthepittsdiscgolf@gmail.com",
    });
  }

  const now = new Date();

  // Expired membership
  if (member.expiresAt && new Date(member.expiresAt) < now) {
    return NextResponse.json({
      status: "expired",
      member: { name: member.name, membership: member.membership, expiresAt: member.expiresAt },
      pricing: { yearly: 100 },
      etransfer: "inthepittsdiscgolf@gmail.com",
    });
  }

  // ✅ Valid membership → create a check-in record
  await prisma.checkIn.create({
    data: {
      memberId: member.id,
      source,
    },
  });

  return NextResponse.json({
    status: "checked-in",
    member: {
      name: member.name,
      membership: member.membership,
      expiresAt: member.expiresAt,
    },
  });
}

