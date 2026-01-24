export const dynamic = "force-dynamic";

import Link from "next/link";

export default function AdminHome() {
  return (
    <main style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <h1>Admin</h1>

      <p style={{ opacity: 0.85 }}>
        If you can see this, you probably typed the URL on purpose.
      </p>

      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
        <Link href="/admin/checkins" style={{ textDecoration: "underline" }}>
          Admin → Check-ins
        </Link>
        <Link href="/admin/members" style={{ textDecoration: "underline" }}>
          Admin → Members
        </Link>
        <Link href="/" style={{ textDecoration: "underline" }}>
          Back to Home
        </Link>
      </div>
    </main>
  );
}
