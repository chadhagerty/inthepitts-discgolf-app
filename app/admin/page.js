export const dynamic = "force-dynamic";

import Link from "next/link";
import AdminShell from "./AdminShell";

function AdminCardLink({ href, label, sub }) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        textDecoration: "none",
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(0,0,0,0.18)",
        borderRadius: 16,
        padding: 14,
        color: "#eafff2",
        boxShadow: "0 10px 26px rgba(0,0,0,0.18)",
      }}
    >
      <div style={{ fontWeight: 950, fontSize: 16 }}>{label}</div>
      {sub ? <div style={{ marginTop: 6, opacity: 0.75, fontWeight: 700 }}>{sub}</div> : null}
    </Link>
  );
}

export default function AdminHome() {
  return (
    <AdminShell
      title="Admin HQ"
      subtitle="Private dashboard — use this page for all admin tools."
      right={
        <span style={{ color: "rgba(234,255,242,0.75)", fontWeight: 800 }}>
          In The Pitts
        </span>
      }
    >
      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        }}
      >
        <AdminCardLink href="/admin/stats" label="Stats" sub="Edit course stats (sponsors love this)" />
        <AdminCardLink href="/admin/checkins" label="Check-ins" sub="View recent check-ins" />
        <AdminCardLink href="/admin/members" label="Members" sub="View + edit members" />
        <AdminCardLink href="/admin/reviews" label="Reviews" sub="Reply to reviews + delete spam" />
      </div>

      <div style={{ marginTop: 14, color: "rgba(234,255,242,0.72)", fontWeight: 700 }}>
        Tip: Don’t share these links publicly.
      </div>
    </AdminShell>
  );
}
