import Link from "next/link";

export default function MembershipsPage() {
  return (
    <main style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <h1>Memberships</h1>

      <p><strong>Day Pass:</strong> $10</p>
      <p><strong>Yearly Membership:</strong> $100</p>
      <p><strong>Pay by e-transfer:</strong> inthepittsdiscgolf@gmail.com</p>

      <div style={{ marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/" style={{ textDecoration: "underline" }}>← Home</Link>
        <Link href="/checkin" style={{ textDecoration: "underline" }}>Course Check-In</Link>
      </div>
    </main>
  );
}
