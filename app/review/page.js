import Link from "next/link";

export default function ReviewPage() {
  return (
    <main style={{ minHeight: "100vh", padding: 24, background: "#f6f7fb" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h1 style={{ margin: "8px 0 12px" }}>Reviews</h1>
        <p style={{ margin: 0, opacity: 0.85 }}>
          Coming soon — this will be where people can leave feedback and read reviews.
        </p>

        <div style={{ marginTop: 18 }}>
          <Link href="/" style={{ textDecoration: "underline" }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
