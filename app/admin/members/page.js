import Link from "next/link";
import { getPrisma } from "@/lib/prisma";
import AddMemberForm from "./add-member-form";

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
  const prisma = getPrisma();

  const members = await prisma.member.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      checkIns: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 24,
        background:
          "radial-gradient(1200px 600px at 20% 0%, rgba(34,197,94,0.20), transparent 60%), radial-gradient(900px 500px at 90% 20%, rgba(16,185,129,0.18), transparent 55%), linear-gradient(180deg, #0b1b13, #0b1220)",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          border: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(255,255,255,0.06)",
          borderRadius: 18,
          padding: 18,
          boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img
              src="/logo.png"
              alt="In The Pitts"
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(0,0,0,0.2)",
              }}
            />
            <div>
              <h1 style={{ margin: 0, color: "#eafff2" }}>Admin: Members</h1>
              <div
                style={{
                  marginTop: 4,
                  color: "rgba(234,255,242,0.75)",
                  fontWeight: 700,
                }}
              >
                Total: {members.length}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link
              href="/admin"
              style={{
                textDecoration: "underline",
                color: "#eafff2",
                fontWeight: 800,
              }}
            >
              ← Admin HQ
            </Link>
          </div>
        </div>

        {/* ✅ ADD MEMBER FORM (NEW) */}
        <div style={{ marginTop: 14 }}>
          <AddMemberForm />
        </div>

        <div
          style={{
            marginTop: 14,
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 14,
            background: "rgba(0,0,0,0.18)",
            padding: 12,
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: 980,
              color: "#eafff2",
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
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid rgba(255,255,255,0.12)",
                      padding: "10px 10px",
                      fontSize: 13,
                      color: "rgba(234,255,242,0.8)",
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
                    <td
                      style={{
                        padding: "10px 10px",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      {m.name}
                    </td>
                    <td
                      style={{
                        padding: "10px 10px",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      {m.email}
                    </td>
                    <td
                      style={{
                        padding: "10px 10px",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <b>{m.membership}</b>
                    </td>
                    <td
                      style={{
                        padding: "10px 10px",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      {fmt(m.expiresAt)}
                    </td>
                    <td
                      style={{
                        padding: "10px 10px",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      {last ? fmt(last.createdAt) : "—"}
                    </td>
                    <td
                      style={{
                        padding: "10px 10px",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      {last?.source || "—"}
                    </td>
                    <td
                      style={{
                        padding: "10px 10px",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        fontFamily: "monospace",
                        color: "rgba(234,255,242,0.85)",
                      }}
                    >
                      {m.stripeCustomerId || "—"}
                    </td>
                    <td
                      style={{
                        padding: "10px 10px",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <Link
                        href={`/admin/members/${m.id}`}
                        style={{
                          display: "inline-block",
                          padding: "8px 10px",
                          borderRadius: 12,
                          border: "1px solid rgba(255,255,255,0.18)",
                          background: "rgba(255,255,255,0.08)",
                          color: "#eafff2",
                          fontWeight: 900,
                          textDecoration: "none",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 14 }}>
          <Link
            href="/admin/checkins"
            style={{
              textDecoration: "underline",
              color: "#eafff2",
              fontWeight: 800,
            }}
          >
            View Check-ins →
          </Link>
        </div>
      </div>
    </main>
  );
}
