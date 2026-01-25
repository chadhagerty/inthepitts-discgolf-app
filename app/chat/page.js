import Link from "next/link";

export default function ChatPage() {
  return (
    <main style={{ minHeight: "100vh", padding: 24, background: "#f6f7fb" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h1 style={{ margin: "8px 0 12px" }}>Chat</h1>
        <p style={{ margin: 0, opacity: 0.85 }}>
          Coming soon — this will be a community chat / updates hub.
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
