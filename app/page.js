import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

const tiles = [
  { type: "internal", href: "/checkin", icon: "/tile-icons/checkin.png", label: "Course Check-In" },
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

function Tile({ t }) {
  const content = (
    <div style={styles.tileFrame}>
      <img
        src={t.icon}
        alt={t.label}
        draggable={false}
        style={styles.tileImg}
      />
    </div>
  );

  if (t.type === "external") {
    return (
      <a href={t.href} target="_blank" rel="noreferrer" style={styles.tileLink}>
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
        <Image
  src="/logo.png"
  alt="In The Pitts Disc Golf"
  width={240}
  height={240}
  priority
  style={styles.logo}
/>

        <p style={styles.desc}>
          A well rounded 18 hole course with both wooded and open holes. Great for the beginner or seasoned vet, feature's some short forest holes and some long bombers. Say hello to the friendly donkey at hole 6 tee pad
        </p>
        <Link href="/course">
          <button style={styles.primaryBtn}>Hole Layout</button>
        </Link>
      </section>

      <section style={styles.gridWrap}>
        <div style={styles.tileGrid}>
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
},

  desc: {
    maxWidth: 700,
    margin: "10px auto",
    fontSize: 15,
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

tileGrid: {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",  
  gap: 22,
  justifyItems: "center",
},

tileLink: {
  textDecoration: "none",
  color: "inherit",
  width: "100%",
  maxWidth: 180,                           // <-- prevents squeezing into 6 columns
  display: "flex",
  justifyContent: "center",
},

  tileFrame: {
  width: 190,
  height: 190,
  borderRadius: 999,
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
},






logo: {
  background: "transparent",
  boxShadow: "none",
  padding: 0,
  borderRadius: 0,

  filter: "drop-shadow(0 10px 25px rgba(0,0,0,0.10))",
  mixBlendMode: "multiply",
},

tileImg: {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  filter: "none",

  // THIS is the fix:
  // it clips the PNG to a perfect circle so no stray bits can show.
  clipPath: "circle(32% at 50% 50%)",
},


};
