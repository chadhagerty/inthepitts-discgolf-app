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

  // External links (your real links)
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
    subtitle: "Get the mobile game",
  },
];

function Tile({ t }) {
  const inner = (
    <div style={styles.tile} role="button" aria-label={t.title}>
      <div style={styles.iconWrap}>
        <img src={t.icon} alt="" width={26} height={26} style={{ display: "block" }} />
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={styles.tileTitle}>{t.title}</div>
        <div style={styles.tileSub}>{t.subtitle}</div>
      </div>

      <div style={styles.chev} aria-hidden="true">
        ›
      </div>
    </div>
  );

  if (t.type === "external") {
    return (
      <a
        href={t.href}
        target="_blank"
        rel="noreferrer"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link href={t.href} style={{ textDecoration: "none", color: "inherit" }}>
      {inner}
    </Link>
  );
}

export default function Page() {
  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        {/* Logo only (no big title text) */}
        <div style={styles.logoRow}>
          <Image
            src="/logo.png"
            alt="In The Pitts Disc Golf Course"
            width={220}
            height={220}
            priority
            style={styles.logo}
          />
        </div>

        {/* Short intro (Hybrid B) */}
        <p style={styles.desc}>
          A fun 18-hole disc golf experience with tight woods, open shots, and a friendly
          donkey midway through your round.
        </p>

        <div style={styles.heroActions}>
          <Link href="/course" style={{ textDecoration: "none" }}>
            <button style={styles.primaryBtn}>Hole Layout</button>
          </Link>

          <Link href="/checkin" style={{ textDecoration: "none" }}>
            <button style={styles.secondaryBtn}>Check In</button>
          </Link>
        </div>
      </section>

      <section style={styles.gridWrap}>
        <div style={styles.grid}>
          {tiles.map((t) => (
            <Tile key={t.href} t={t} />
          ))}
        </div>
      </section>

      {/* Bottom nav (app-like) */}
      <nav style={styles.bottomNav} aria-label="Bottom navigation">
        <Link href="/" style={styles.bottomLink}>
          Home
        </Link>
        <Link href="/checkin" style={styles.bottomLink}>
          Check In
        </Link>
        <Link href="/memberships" style={styles.bottomLink}>
          Membership
        </Link>
        <Link href="/admin" style={styles.bottomLink}>
          Admin
        </Link>
      </nav>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #f6f7fb 0%, #ffffff 60%)",
    padding: "20px 14px 88px", // extra bottom space for nav
    color: "#111827",
  },

  hero: {
    maxWidth: 960,
    margin: "0 auto",
    padding: "10px 10px 6px",
    textAlign: "center",
  },

  logoRow: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 8,
  },

  logo: {
    height: "auto",
    width: "auto",
    borderRadius: 18,
    boxShadow: "0 10px 30px rgba(17,24,39,0.10)",
  },

  desc: {
    maxWidth: 820,
    margin: "10px auto 14px",
    fontSize: 16,
    lineHeight: 1.5,
    color: "#374151",
  },

  heroActions: {
    display: "flex",
    justifyContent: "center",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 8,
  },

  primaryBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid #111827",
    background: "#111827",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
  },

  secondaryBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    background: "#ffffff",
    cursor: "pointer",
    fontWeight: 700,
    color: "#111827",
  },

  gridWrap: {
    maxWidth: 960,
    margin: "18px auto 0",
    padding: "0 6px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 12,
  },

  tile: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 14px",
    borderRadius: 16,
    border: "1px solid rgba(17,24,39,0.08)",
    background: "#ffffff",
    boxShadow: "0 10px 24px rgba(17,24,39,0.06)",
    transition: "transform 120ms ease, box-shadow 120ms ease",
  },

  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    background: "rgba(17,24,39,0.06)",
    flex: "0 0 auto",
  },

  tileTitle: {
    fontWeight: 800,
    fontSize: 16,
    color: "#111827",
    lineHeight: 1.2,
  },

  tileSub: {
    marginTop: 4,
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 1.3,
  },

  chev: {
    marginLeft: "auto",
    fontSize: 22,
    color: "#9ca3af",
    lineHeight: 1,
    flex: "0 0 auto",
  },

  bottomNav: {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    height: 64,
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(10px)",
    borderTop: "1px solid rgba(17,24,39,0.08)",
    padding: "0 8px",
  },

  bottomLink: {
    textDecoration: "none",
    color: "#111827",
    fontWeight: 800,
    fontSize: 13,
    padding: "10px 10px",
    borderRadius: 12,
  },
};
