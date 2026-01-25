import Link from "next/link";

export default function EventsPage() {
  return (
    <main style={{ minHeight: "100vh", padding: 24, background: "#f6f7fb" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h1 style={{ margin: "8px 0 12px" }}>Upcoming Events</h1>
        <p style={{ margin: 0, opacity: 0.85 }}>
          Coming soon — leagues, tournaments, and course events will show up here.
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
