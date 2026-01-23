import Link from "next/link";

export default function LeaderboardPage() {
  return (
    <main style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <h1>Leaderboard</h1>
      <p>Coming soon: aces, wins, and other fun stuff.</p>

      <div style={{ marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/" style={{ textDecoration: "underline" }}>← Home</Link>
        <Link href="/stats" style={{ textDecoration: "underline" }}>Course Stats</Link>
      </div>
    </main>
  );
}
