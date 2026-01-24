import Link from "next/link";

export default function MembershipsPage() {
  return (
    <main style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <h1>Memberships</h1>

      <p style={{ marginTop: 12 }}>
        Day Pass: <strong>$10</strong>
        <br />
        Yearly Membership: <strong>$100</strong>
      </p>

      <p style={{ marginTop: 12 }}>
        Pay by e-transfer: <strong>inthepittsdiscgolf@gmail.com</strong>
      </p>

      <div style={{ marginTop: 20 }}>
        <Link href="/" style={{ textDecoration: "underline" }}>← Home</Link>
      </div>
    </main>
  );
}
