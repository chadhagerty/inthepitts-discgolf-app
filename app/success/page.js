import Link from "next/link";

export default function SuccessPage({ searchParams }) {
  const mode = searchParams?.mode || "payment";
  return (
    <main style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <h1>Payment successful ✅</h1>
      <p>Thanks! Your {mode} payment went through.</p>
      <Link href="/" style={{ textDecoration: "underline" }}>← Back to Home</Link>
    </main>
  );
}
