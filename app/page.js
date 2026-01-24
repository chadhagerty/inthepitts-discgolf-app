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
    subtitle: "Trends (coming soon)",
  },
  {
    type: "internal",
    href: "/leaderboard",
    icon: "/icons/leaderboard.svg",
    title: "Leaderboard",
    subtitle: "Aces + wins (coming soon)",
  },

  // External links (your real URLs)
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

  // Disc Golf Valley (website for now; we can add App Store / Play Store buttons next)
  {
    type: "external",
    href: "https://www.discgolfvalley.com/",
    icon: "/icons/discgolf.svg",
    title: "Disc Golf Valley",
    subtitle: "Play the game",
  },
];

function Tile({ t }) {
  const inner = (
    <div
      style={{
        display: "flex",
        gap: 14,
        alignItems: "center",
        padding: 16,
        border: "1px solid #e5e5e5",
        borderRadius: 14,
        background: "white",
        boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
        width: "100%",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          border: "1px solid #eee",
          display: "grid",
          placeItems: "center",
          background: "#fafafa",
          flex: "0 0 auto",
        }}
      >
        <img src={t.icon} alt="" width="26" height="26" style={{ display: "block" }} />
      </div>

      <div style={{ lineHeight: 1.15 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>{t.title}</div>
        <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>{t.subtitle}</div>
      </div>
    </div>
  );

  if (t.type === "external") {
    return (
      <a href={t.href} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "inherit" }}>
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

export default function HomePage() {
  return (
    <main style={{ padding: "2rem", maxWidth: 980, margin: "0 auto" }}>
      <div style={{ display: "grid", gap: 10, justifyItems: "center", marginBottom: 14 }}>
        <img src="/logo.png" alt="In The Pitts" style={{ height: 60, width: "auto" }} />
        <h1 style={{ margin: 0, textAlign: "center" }}>In The Pitts Disc Golf Course</h1>
        <p style={{ margin: 0, opacity: 0.8, textAlign: "center", maxWidth: 760 }}>
          A well-rounded 18-hole disc golf experience featuring tight wooded challenges, wide-open distance shots, and a fun
          atmosphere with wildlife — including a friendly donkey midway through your round.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gap: 14,
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          marginTop: 24,
        }}
      >
        {tiles.map((t) => (
          <Tile key={t.title} t={t} />
        ))}
      </div>

      <p style={{ marginTop: 18, fontSize: 12, opacity: 0.6 }}>
        Tip: Bookmark Admin pages if you need them (they’re not shown on the homepage).
      </p>
    </main>
  );
}
