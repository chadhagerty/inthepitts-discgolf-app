import Link from "next/link";

export default function LeaderboardPage() {
  return (
    <main style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <h1>Leaderboard</h1>
      <p style={{ marginTop: 12, opacity: 0.85 }}>
        Coming soon: aces, wins, and top rounds.
      </p>

      <div style={{ marginTop: 20 }}>
        <Link href="/" style={{ textDecoration: "underline" }}>← Home</Link>
      </div>
    </main>
  );
}
