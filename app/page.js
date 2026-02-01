import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

const tiles = [
  // Row 1
  { type: "internal", href: "/checkin", icon: "/tile-icons/checkin.png", label: "Course Check-In" },
  { type: "internal", href: "/memberships", icon: "/tile-icons/membership.png", label: "Membership" },
  { type: "internal", href: "/events", icon: "/tile-icons/events.png", label: "Events" },
  { type: "internal", href: "/chat", icon: "/tile-icons/chat.png", label: "Chat" },

  // Row 2
  { type: "internal", href: "/stats", icon: "/tile-icons/stats.png", label: "Stats" },
  { type: "internal", href: "/leaderboard", icon: "/tile-icons/leaderboard.png", label: "Leaderboard" },
  { type: "internal", href: "/review", icon: "/tile-icons/reviews.png", label: "Reviews" },
  { type: "internal", href: "/sponsors", icon: "/tile-icons/sponsors.png", label: "Sponsors" },

  // Row 3
  { type: "external", href: "https://www.youtube.com/@InThePittsDiscGolfCourse", icon: "/tile-icons/youtube.png", label: "YouTube" },
  { type: "external", href: "https://www.facebook.com/share/1D8MpvLLtv/", icon: "/tile-icons/facebook.png", label: "Facebook" },
  { type: "internal", href: "/dgv", icon: "/tile-icons/dgv.png", label: "Disc Golf Valley" },
];

function Tile({ t }) {
  const content = (
    <span className="tileFrame">
      <img className="tileImg" src={t.icon} alt={t.label} draggable={false} />
    </span>
  );

  if (t.type === "external") {
    return (
      <a href={t.href} target="_blank" rel="noreferrer" className="tileLink" aria-label={t.label}>
        {content}
      </a>
    );
  }

  return (
    <Link href={t.href} className="tileLink" aria-label={t.label}>
      {content}
    </Link>
  );
}

export default function Page() {
  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <Image src="/logo.png" alt="In The Pitts Disc Golf" width={240} height={240} priority style={styles.logo} />

        <p style={styles.desc}>
          A well rounded 18 hole course with both wooded and open holes. Great for the beginner or seasoned vet,
          features some short forest holes and some long bombers. Say hello to the friendly donkey at hole 6 tee pad.
        </p>

        <Link href="/course" style={{ textDecoration: "none" }}>
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

const styles = {
  page: {
    minHeight: "100vh",
    padding: "20px 14px 44px",
    backgroundColor: "#ffffff00",
    backgroundImage: `
      radial-gradient(900px 500px at 15% -10%, rgba(239, 68, 68, 0.03), transparent 60%),
      radial-gradient(900px 500px at 85% 10%, rgba(255,255,255,0.08), transparent 55%),
      radial-gradient(700px 450px at 50% 110%, rgba(34,197,94,0.18), transparent 55%)
    `,
  },
  hero: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "transparent",
    padding: 0,
    marginBottom: 24,
    textAlign: "center",
  },
  logo: {
    background: "transparent",
    boxShadow: "none",
    padding: 0,
    borderRadius: 0,
    filter: "drop-shadow(0 10px 25px rgba(0,0,0,0.10))",
    mixBlendMode: "multiply",
  },
  desc: {
    maxWidth: 700,
    margin: "10px auto",
    fontSize: 15,
    lineHeight: 1.45,
    color: "#1f2937",
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
    margin: "16px auto 0",
    display: "flex",
    justifyContent: "center",
  },
};
