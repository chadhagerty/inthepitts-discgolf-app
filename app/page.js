import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

const tiles = [
  // Core
  { type: "internal", href: "/checkin", icon: "/icons/checkin.svg", title: "Course Check-In", subtitle: "Members + day pass" },
  { type: "internal", href: "/memberships", icon: "/icons/membership.svg", title: "Become a Member", subtitle: "Pricing + how to pay" },

  // Course / community
  { type: "internal", href: "/stats", icon: "/icons/stats.svg", title: "Course Stats", subtitle: "Coming soon" },
  { type: "internal", href: "/leaderboard", icon: "/icons/leaderboard.svg", title: "Leaderboard", subtitle: "Coming soon" },

  // New pages
  { type: "internal", href: "/reviews", icon: "/icons/reviews.svg", title: "Reviews", subtitle: "Coming soon" },
  { type: "internal", href: "/events", icon: "/icons/events.svg", title: "Upcoming Events", subtitle: "Coming soon" },
  { type: "internal", href: "/chat", icon: "/icons/chat.svg", title: "Chat", subtitle: "Coming soon" },

  // External links (your real links)
  { type: "external", href: "https://www.youtube.com/@InThePittsDiscGolfCourse", icon: "/icons/youtube.svg", title: "YouTube", subtitle: "Course videos" },
  { type: "external", href: "https://www.facebook.com/share/1D8MpvLLtv/?mibextid=wwXIfr", icon: "/icons/facebook.svg", title: "Facebook", subtitle: "Updates + community" },

  // Disc Golf Valley (your internal page)
  { type: "internal", href: "/dgv", icon: "/icons/discgolf.svg", title: "Disc Golf Valley", subtitle: "Get the mobile game" },
];

function BannerIcon({ src, label }) {
  return (
    <div style={styles.badgeWrap} aria-hidden="true">
      <div style={styles.badgeCircle}>
        <img src={src} alt="" width={26} height={26} style={styles.badgeImg} />
      </div>
      <div style={styles.badgeBanner}>{label}</div>
    </div>
  );
}

function Tile({ t }) {
  const content = (
    <div style={styles.tile}>
      <BannerIcon src={t.icon} label={t.title} />
      <div style={{ minWidth: 0 }}>
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
        style={{ textDecoration: "none", color: "inherit" }}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={t.href} style={{ textDecoration: "none", color: "inherit" }}>
      {content}
    </Link>
  );
}

export default function Page() {
  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.logoRow}>
          <Image
            src="/logo.png"
            alt="In The Pitts Disc Golf"
            width={200}
            height={200}
            priority
            style={styles.logo}
          />
        </div>

        <p style={styles.desc}>
          A well-rounded 18-hole disc golf experience featuring tight wooded challenges,
          wide-open distance shots, and a fun atmosphere with wildlife — including a friendly
          donkey midway through your round.
        </p>

        <div style={styles.heroActions}>
          <Link href="/course" style={{ textDecoration: "none" }}>
            <button style={styles.primaryBtn}>Hole Layout</button>
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
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f6f7fb",
    padding: "24px 16px 48px",
  },

  hero: {
    maxWidth: 980,
    margin: "0 auto",
    padding: "18px 16px 10px",
    textAlign: "center",
  },

  logoRow: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 10,
  },

  logo: {
    height: "auto",
    width: "auto",
  },

  desc: {
    maxWidth: 860,
    margin: "10px auto 14px",
    fontSize: 16,
    lineHeight: 1.5,
    color: "#1f2937",
  },

  heroActions: {
    display: "flex",
    justifyContent: "center",
    gap: 10,
    marginTop: 8,
  },

  primaryBtn: {
    padding: "10px 14px",
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
    gap: 12,
    padding: "0 8px",
  },

  tile: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    background: "#fff",
    padding: 14,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },

  tileTitle: {
    fontWeight: 800,
    fontSize: 15,
    color: "#111827",
    lineHeight: 1.2,
  },

  tileSub: {
    marginTop: 4,
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 1.2,
  },

  // Banner badge styles (the “look” you want)
  badgeWrap: {
    width: 70,
    flex: "0 0 auto",
    display: "grid",
    justifyItems: "center",
    rowGap: 6,
  },

  badgeCircle: {
    width: 48,
    height: 48,
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    display: "grid",
    placeItems: "center",
    boxShadow: "0 4px 14px rgba(17,24,39,0.08)",
  },

  badgeImg: {
    display: "block",
  },

  badgeBanner: {
    maxWidth: 76,
    padding: "4px 8px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    fontSize: 10.5,
    fontWeight: 800,
    color: "#111827",
    textAlign: "center",
    lineHeight: 1.1,
    boxShadow: "0 4px 14px rgba(17,24,39,0.06)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
};
