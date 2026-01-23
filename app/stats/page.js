import Link from "next/link";

export default function StatsPage() {
  return (
    <main style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <h1>Course Stats</h1>
      <p>Coming soon: check-in totals, trends, busiest days, etc.</p>

      <div style={{ marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/" style={{ textDecoration: "underline" }}>← Home</Link>
        <Link href="/checkin" style={{ textDecoration: "underline" }}>Course Check-In</Link>
      </div>
    </main>
  );
}
