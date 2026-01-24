import Link from "next/link";

export default function HomePage() {
  const tiles = [
    { type: "internal", href: "/checkin", icon: "/icons/checkin.svg", title: "Course Check-In", subtitle: "Members + day pass" },
    { type: "internal", href: "/memberships", icon: "/icons/membership.svg", title: "Become a Member", subtitle: "Pricing + how to pay" },
    { type: "internal", href: "/stats", icon: "/icons/stats.svg", title: "Course Stats", subtitle: "Trends + totals (soon)" },
    { type: "internal", href: "/leaderboard", icon: "/icons/leaderboard.svg", title: "Leaderboard", subtitle: "Aces + wins (soon)" },

    { type: "external", href: "https://www.youtube.com/@InThePittsDiscGolfCourse", icon: "/icons/youtube.svg", title: "YouTube", subtitle: "Course videos" },
    { type: "external", href: "https://www.facebook.com/share/1D8MpvLLtv/?mibextid=wwXIfr", icon: "/icons/facebook.svg", title: "Facebook", subtitle: "Updates + community" },

    // Disc Golf Valley: we can link to a small page later with App Store + Google Play buttons
    { type: "internal", href: "/dgv", icon: "/icons/discgolf.svg", title: "Disc Golf Valley", subtitle: "Get the app" },

  ];

  const Tile = ({ t }) => {
    const content = (
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: 16,
          background: "white",
          display: "flex",
          gap: 14,
          alignItems: "center",
          boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: "#f3f4f6",
            display: "grid",
            placeItems: "center",
            flex: "0 0 auto",
          }}
        >
          <img src={t.icon} alt="" width="34" height="34" style={{ display: "block" }} />
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>{t.title}</div>
          <div style={{ opacity: 0.75, marginTop: 4, fontSize: 13, lineHeight: 1.2 }}>{t.subtitle}</div>
        </div>
      </div>
    );

    if (t.type === "external") {
      return (
        <a href={t.href} target="_blank" rel="noreferrer" style={{ textDecoration: "none", color: "inherit" }}>
          {content}
        </a>
      );
    }

    return (
      <Link href={t.href} style={{ textDecoration: "none", color: "inherit" }}>
        {content}
      </Link>
    );
  };

  return (
    <main style={{ padding: "2rem 1rem", maxWidth: 980, margin: "0 auto" }}>
      <header style={{ textAlign: "center", marginBottom: 18 }}>
        <h1 style={{ margin: 0 }}>In The Pitts Disc Golf</h1>
        <p style={{ margin: "10px auto 0", maxWidth: 700, opacity: 0.8 }}>
          Quick links for check-in, memberships, stats, and community.
        </p>
      </header>

      <section
        style={{
          display: "grid",
          gap: 14,
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        }}
      >
        {tiles.map((t) => (
          <Tile key={t.href} t={t} />
        ))}
      </section>

      <footer style={{ textAlign: "center", marginTop: 18, opacity: 0.7, fontSize: 12 }}>
        Tip: Add this page to your Home Screen for an “app” feel.
      </footer>
    </main>
  );
}
