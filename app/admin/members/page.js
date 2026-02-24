import Link from "next/link";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function fmt(d) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleString("en-CA", { timeZone: "America/Toronto" });
  } catch {
    return String(d);
  }
}

export default async function AdminMembersPage() {
  // Because this page is force-dynamic, this will ONLY run at request time (not at build)
  const prisma = getPrisma();

  const members = await prisma.member.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      checkIns: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <h1 style={{ margin: 0 }}>Admin: Members</h1>
        <Link href="/admin" style={{ textDecoration: "underline" }}>
          ← Admin Home
        </Link>
      </div>

      <p style={{ marginTop: 10, color: "#555" }}>
        Total: <b>{members.length}</b>
      </p>

      <div style={{ overflowX: "auto", marginTop: 12 }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: 900,
          }}
        >
          <thead>
            <tr>
              {[
                "Name",
                "Email",
                "Membership",
                "Expires",
                "Last check-in",
                "Source",
                "Stripe Customer",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                    padding: "10px 8px",
                    fontSize: 13,
                    color: "#444",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {members.map((m) => {
              const last = m.checkIns?.[0] || null;
              return (
                <tr key={m.id}>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #f0f0f0" }}>
                    {m.name}
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #f0f0f0" }}>
                    {m.email}
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #f0f0f0" }}>
                    <b>{m.membership}</b>
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #f0f0f0" }}>
                    {fmt(m.expiresAt)}
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #f0f0f0" }}>
                    {last ? fmt(last.createdAt) : "—"}
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #f0f0f0" }}>
                    {last?.source || "—"}
                  </td>
                  <td
                    style={{
                      padding: "10px 8px",
                      borderBottom: "1px solid #f0f0f0",
                      fontFamily: "monospace",
                    }}
                  >
                    {m.stripeCustomerId || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 18 }}>
        <Link href="/admin/checkins" style={{ textDecoration: "underline" }}>
          View Check-ins →
        </Link>
      </div>
    </main>
  );
}
