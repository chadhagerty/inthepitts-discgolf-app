import Link from "next/link";

export default function CancelPage({ searchParams }) {
  const mode = searchParams?.mode || "payment";
  return (
    <main style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <h1>Payment cancelled</h1>
      <p>No worries — you can try again anytime. ({mode})</p>
      <Link href="/memberships" style={{ textDecoration: "underline" }}>← Back to Memberships</Link>
    </main>
  );
}
