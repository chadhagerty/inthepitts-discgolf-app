import Link from "next/link";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

function fmtToronto(d) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleString("en-CA", { timeZone: "America/Toronto" });
  } catch {
    return String(d);
  }
}

function fmtTorontoDate(d) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-CA", { timeZone: "America/Toronto" });
  } catch {
    return String(d);
  }
}

function isExpired(expiresAt) {
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() < Date.now();
}

export default async function AdminMembersPage() {
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
            minWidth: 980,
          }}
        >
          <thead>
            <tr>
              {[
                "Status",
                "Name",
                "Email",
                "Membership",
                "Expires",
                "Created",
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
              const expired = isExpired(m.expiresAt);

              const statusText = expired ? "EXPIRED" : "ACTIVE";
              const statusBg = expired ? "#ffe8e8" : "#e9f7ef";
              const statusBorder = expired ? "#ffb3b3" : "#b9e4c9";

              const isDayPass = (m.membership || "").toLowerCase() === "daypass";

              return (
                <tr key={m.id}>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #f0f0f0" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: 999,
                        fontSize: 12,
                        background: statusBg,
                        border: `1px solid ${statusBorder}`,
                        color: "#222",
                        fontWeight: 700,
                        letterSpacing: 0.2,
                      }}
                    >
                      {statusText}
                    </span>
                  </td>

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
                    {isDayPass ? (
                      <>
                        <b>Today (Day Pass)</b>
                        <div style={{ color: "#666", fontSize: 12 }}>
                          {fmtToronto(m.expiresAt)}
                        </div>
                      </>
                    ) : (
                      fmtToronto(m.expiresAt)
                    )}
                  </td>

                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #f0f0f0" }}>
                    {fmtToronto(m.createdAt)}
                  </td>

                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #f0f0f0" }}>
                    {last ? fmtToronto(last.createdAt) : "—"}
                  </td>

                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #f0f0f0" }}>
                    {last?.source || "—"}
                  </td>

                  <td
                    style={{
                      padding: "10px 8px",
                      borderBottom: "1px solid #f0f0f0",
                      fontFamily: "monospace",
                      fontSize: 12,
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

      <div style={{ marginTop: 18, display: "flex", gap: 14 }}>
        <Link href="/admin/checkins" style={{ textDecoration: "underline" }}>
          View Check-ins →
        </Link>

        <span style={{ color: "#888" }}>
          Times shown in <b>America/Toronto</b>
        </span>
      </div>
    </main>
  );
}
