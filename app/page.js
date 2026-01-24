import Link from "next/link";

const LOGO_SRC = "/logo.png"; // <-- CHANGE THIS to your real logo file (e.g. "/pitts.png") OR set to null

export default function HomePage() {
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
      subtitle: "Trends + totals (soon)",
    },
    {
      type: "internal",
      href: "/leaderboard",
      icon: "/icons/leaderboard.svg",
      title: "Leaderboard",
      subtitle: "Aces + wins (soon)",
    },

    // External links (yours)
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

    // Disc Golf Valley (use our internal helper page)
    {
      type: "internal",
      href: "/dgv",
      icon: "/icons/discgolf.svg",
      title: "Disc Golf Valley",
      subtitle: "Get the app",
    },
  ];

  return (
    <main style={{ padding: "2rem", maxWidth: 980, margin: "0 auto" }}>
      {/* Logo */}
      {LOGO_SRC ? (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <img
            src={LOGO_SRC}
            alt="In The Pitts Disc Golf Course"
            style={{ height: 70, width: "auto" }}
          />
        </div>
      ) : null}

      <h1 style={{ textAlign: "center", margin: 0 }}>In The Pitts Disc Golf</h1>
      <p style={{ textAlign: "center", marginTop: 8, opacity: 0.8 }}>
        Quick links for check-in, memberships, stats, and community.
      </p>

      {/* Tile grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
          marginTop: 28,
        }}
      >
        {tiles.map((t) => {
          const CardInner = (
            <div
              style={{
                border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: 14,
                padding: 16,
                display: "flex",
                alignItems: "center",
                gap: 14,
                textDecoration: "none",
                color: "inherit",
                background: "white",
              }}
            >
              {/* Icon bubble */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(0,0,0,0.06)",
                  flex: "0 0 auto",
                }}
              >
                <img src={t.icon} alt="" width="24" height="24" style={{ display: "block" }} />
              </div>

              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontWeight: 700 }}>{t.title}</div>
                <div style={{ opacity: 0.75, marginTop: 4, fontSize: 14 }}>{t.subtitle}</div>
              </div>
            </div>
          );

          if (t.type === "external") {
            return (
              <a
                key={t.title}
                href={t.href}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: "none" }}
              >
                {CardInner}
              </a>
            );
          }

          return (
            <Link key={t.title} href={t.href} style={{ textDecoration: "none" }}>
              {CardInner}
            </Link>
          );
        })}
      </div>

      <p style={{ textAlign: "center", opacity: 0.6, marginTop: 28, fontSize: 13 }}>
        Tip: Add this page to your Home Screen for an “app” feel.
      </p>
    </main>
  );
}
