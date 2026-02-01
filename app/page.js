import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

/* -----------------------
   HOME TILES
------------------------ */
const tiles = [
  { type: "internal", href: "/checkin", icon: "/tile-icons/checkin.png", label: "Check-In" },
  { type: "internal", href: "/memberships", icon: "/tile-icons/membership.png", label: "Membership" },
  { type: "internal", href: "/events", icon: "/tile-icons/events.png", label: "Events" },
  { type: "internal", href: "/chat", icon: "/tile-icons/chat.png", label: "Chat" },

  { type: "internal", href: "/stats", icon: "/tile-icons/stats.png", label: "Stats" },
  { type: "internal", href: "/leaderboard", icon: "/tile-icons/leaderboard.png", label: "Leaderboard" },
  { type: "internal", href: "/review", icon: "/tile-icons/reviews.png", label: "Reviews" },
  { type: "internal", href: "/sponsors", icon: "/tile-icons/sponsors.png", label: "Sponsors" },

  { type: "external", href: "https://www.youtube.com/@InThePittsDiscGolfCourse", icon: "/tile-icons/youtube.png", label: "YouTube" },
  { type: "external", href: "https://www.facebook.com/share/1D8MpvLLtv/", icon: "/tile-icons/facebook.png", label: "Facebook" },
  { type: "internal", href: "/dgv", icon: "/tile-icons/dgv.png", label: "Disc Golf Valley" },
];

/* -----------------------
   TILE (SVG-CLIPPED)
   Safari-safe, zero bleed
------------------------ */
function Tile({ t }) {
  const id = `clip-${t.label.replace(/\s+/g, "")}`;

  const icon = (
    <svg width="190" height="190" viewBox="0 0 190 190">
      <defs>
        <clipPath id={id}>
          <circle cx="95" cy="95" r="95" />
        </clipPath>
      </defs>

      <image
        href={t.icon}
        width="190"
        height="190"
        preserveAspectRatio="xMidYMid slice"
        clipPath={`url(#${id})`}
      />
    </svg>
  );

  if (t.type === "external") {
    return (
      <a href={t.href} target="_blank" rel="noreferrer" style={styles.tileLink}>
        {icon}
      </a>
    );
  }

  return (
    <Link href={t.href} style={styles.tileLink}>
      {icon}
    </Link>
  );
}

/* -----------------------
   PAGE
------------------------ */
export default function Page() {
  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <Image
          src="/logo.png"
          alt="In The Pitts Disc Golf"
          width={240}
          height={240}
          priority
          style={styles.logo}
        />

        <p style={styles.desc}>
          A well-rounded 18-hole disc golf course with wooded and open holes,
          short technical forest shots, long bombers, and even a friendly donkey
          at Hole 6.
        </p>

        <Link href="/course">
          <button style={styles.primaryBtn}>Hole Layout</button>
        </Link>
      </section>

      <section style={styles.gridWrap}>
        <div className="tileGrid">
          {tiles.map((t) => (
            <Tile key={t.href} t={t} />
          ))}
        </div>
      </section>
    </main>
  );
}

/* -----------------------
   STYLES
------------------------ */
const styles = {
  page: {
    minHeight: "100vh",
    padding: "20px 14px 44px",
    backgroundImage: `
      radial-gradient(900px 500px at 15% -10%, rgba(239,68,68,0.05), transparent 60%),
      radial-gradient(900px 500px at 85% 10%, rgba(255,255,255,0.08), transparent 55%),
      radial-gradient(700px 450px at 50% 110%, rgba(34,197,94,0.15), transparent 55%)
    `,
  },

  hero: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 28,
  },

  logo: {
    background: "transparent",
    boxShadow: "none",
    filter: "drop-shadow(0 10px 25px rgba(0,0,0,0.12))",
  },

  desc: {
    maxWidth: 720,
    margin: "12px auto",
    fontSize: 15,
    textAlign: "center",
  },

  primaryBtn: {
    marginTop: 10,
    padding: "10px 16px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    background: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },

  gridWrap: {
    maxWidth: 980,
    margin: "0 auto",
  },

  tileLink: {
    width: 190,
    height: 190,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};
