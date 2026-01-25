import Image from "next/image";
import Link from "next/link";

const tiles = [
  // Core
  {
    type: "internal",
    href: "/checkin",
    icon: "/icons/checkin.svg",
    title: "Course Check-In",
    subtitle: "Members + day pass",
  },
  {
    type: "internal",
    href: "/memberships",
    icon: "/icons/membership.svg",
    title: "Become a Member",
    subtitle: "Pricing + how to pay",
  },

  // Course / community
  {
    type: "internal",
    href: "/stats",
    icon: "/icons/stats.svg",
    title: "Course Stats",
    subtitle: "Coming soon",
  },
  {
    type: "internal",
    href: "/leaderboard",
    icon: "/icons/leaderboard.svg",
    title: "Leaderboard",
    subtitle: "Coming soon",
  },

  // External
  {
    type: "external",
    href: "https://www.youtube.com/@InThePittsDiscGolfCourse",
    icon: "/icons/youtube.svg",
    title: "YouTube",
    subtitle: "Course videos",
  },
  {
    type: "external",
    href: "https://www.facebook.com/share/1D8MpvLLtv/?mibextid=wwXIfr",
    icon: "/icons/facebook.svg",
    title: "Facebook",
    subtitle: "Updates + community",
  },

  // Disc Golf Valley (internal page)
  {
    type: "internal",
    href: "/dgv",
    icon: "/icons/discgolf.svg",
    title: "Disc Golf Valley",
    subtitle: "Get the app",
  },
];

function Tile({ t }) {
  const content = (
    <div style={styles.tile}>
      <div style={styles.iconWrap}>
        <img src={t.icon} alt="" width={56} height={56} style={styles.iconImg} />
      </div>

      <div style={styles.textWrap}>
        <div style={styles.tileTitle}>{t.title}</div>
        <div style={styles.tileSub}>{t.subtitle}</div>
      </div>
    </div>
  );

  if (t.type === "external") {
    return (
      <a
        href={t.href}
        target="_blank"
        rel="noreferrer"
        style={styles.tileLink}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={t.href} style={styles.tileLink}>
      {content}
    </Link>
  );
}

export default function Page() {
  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        {/* LOGO ONLY (no headline text) */}
        <div style={styles.logoRow}>
          <Image
            src="/logo.png"
            alt="In The Pitts Disc Golf Course"
            width={260}
            height={120}
            priority
            style={styles.logo}
          />
        </div>

        {/* Description */}
        <p style={styles.desc}>
          A well-rounded 18-hole disc golf experience featuring tight wooded
          challenges, wide-open distance shots, and a fun atmosphere with
          wildlife — including a friendly donkey midway through your round.
        </p>

        {/* Hole layout button */}
        <div style={styles.heroActions}>
          <Link href="/course" style={{ textDecoration: "none" }}>
            <button style={styles.primaryBtn}>Hole Layout</button>
          </Link>
        </div>
      </section>

      {/* Tile grid */}
      <section style={styles.gridWrap}>
        <div style={styles.grid}>
          {tiles.map((t) => (
            <Tile key={t.href} t={t} />
          ))}
        </div>

        <div style={styles.tip}>
          Tip: Add this page to your Home Screen for an “app” feel.
        </div>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f6f7fb",
    padding: "22px 14px 48px",
  },

  hero: {
    maxWidth: 980,
    margin: "0 auto",
    textAlign: "center",
    padding: "18px 10px 10px",
  },

  logoRow: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 6,
  },

  // Keeps your logo from looking tiny
  logo: {
    width: "auto",
    height: "auto",
    maxWidth: "92vw",
  },

  desc: {
    maxWidth: 860,
    margin: "10px auto 14px",
    fontSize: 16,
    lineHeight: 1.55,
    color: "#1f2937",
  },

  heroActions: {
    display: "flex",
    justifyContent: "center",
    gap: 10,
    marginTop: 10,
  },

  primaryBtn: {
    padding: "11px 16px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    background: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
  },

  gridWrap: {
    maxWidth: 980,
    margin: "18px auto 0",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 14,
    padding: "0 8px",
  },

  tileLink: {
    textDecoration: "none",
    color: "inherit",
  },

  tile: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: "14px 14px",
    boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
  },

  iconWrap: {
    width: 64,
    height: 64,
    display: "grid",
    placeItems: "center",
    flex: "0 0 auto",
  },

  iconImg: {
    display: "block",
    width: 56,
    height: 56,
  },

  textWrap: {
    minWidth: 0,
  },

  tileTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: "#111827",
  },

  tileSub: {
    marginTop: 3,
    fontSize: 13,
    color: "#6b7280",
  },

  tip: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 12,
    color: "#6b7280",
  },
};
