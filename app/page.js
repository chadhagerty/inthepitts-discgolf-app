import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

const tiles = [
  { type: "internal", href: "/checkin", icon: "/icons/checkin.svg", title: "Course Check-In", subtitle: "Members + day pass" },
  { type: "internal", href: "/memberships", icon: "/icons/membership.svg", title: "Become a Member", subtitle: "Pricing + how to pay" },
  { type: "internal", href: "/stats", icon: "/icons/stats.svg", title: "Course Stats", subtitle: "Coming soon" },
  { type: "internal", href: "/leaderboard", icon: "/icons/leaderboard.svg", title: "Leaderboard", subtitle: "Coming soon" },
  { type: "external", href: "https://www.youtube.com/@InThePittsDiscGolfCourse", icon: "/icons/youtube.svg", title: "YouTube", subtitle: "Course videos" },
  { type: "external", href: "https://www.facebook.com/share/1D8MpvLLtv/?mibextid=wwXIfr", icon: "/icons/facebook.svg", title: "Facebook", subtitle: "Updates + community" },
  { type: "internal", href: "/dgv", icon: "/icons/discgolf.svg", title: "Disc Golf Valley", subtitle: "Get the mobile game" },
];

function Tile({ t }) {
  const inner = (
    <div style={styles.tile}>
      <img src={t.icon} alt="" width={44} height={44} />
      <div>
        <div style={styles.tileTitle}>{t.title}</div>
        <div style={styles.tileSub}>{t.subtitle}</div>
      </div>
    </div>
  );

  return t.type === "external" ? (
    <a href={t.href} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "inherit" }}>
      {inner}
    </a>
  ) : (
    <Link href={t.href} style={{ textDecoration: "none", color: "inherit" }}>
      {inner}
    </Link>
  );
}

export default function Page() {
  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <Image src="/logo.png" alt="In The Pitts Disc Golf" width={220} height={220} priority />
        <p style={styles.desc}>
          A well-rounded 18-hole disc golf experience featuring tight wooded challenges, wide-open distance shots,
          and a fun atmosphere — including a friendly donkey midway through your round.
        </p>
        <Link href="/course">
          <button style={styles.primaryBtn}>Hole Layout</button>
        </Link>
      </section>

      <section style={styles.grid}>
        {tiles.map(t => <Tile key={t.href} t={t} />)}
      </section>
    </main>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f6f7fb", padding: 24 },
  hero: { textAlign: "center", maxWidth: 900, margin: "0 auto" },
  desc: { margin: "12px auto", maxWidth: 700, color: "#1f2937" },
  primaryBtn: { padding: "10px 16px", borderRadius: 10, border: "1px solid #ccc", background: "#fff", cursor: "pointer" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 14, maxWidth: 900, margin: "24px auto" },
  tile: { display: "flex", gap: 12, alignItems: "center", padding: 14, background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb" },
  tileTitle: { fontWeight: 600 },
  tileSub: { fontSize: 13, color: "#6b7280" },
};
