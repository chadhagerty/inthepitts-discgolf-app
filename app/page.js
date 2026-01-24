import Image from "next/image";
import Link from "next/link";

const tiles = [
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
  {
    type: "internal",
    href: "/dgv",
    icon: "/icons/discgolf.svg",
    title: "Disc Golf Valley",
    subtitle: "Mobile game",
  },
];

function Tile({ t }) {
  const content = (
    <div style={styles.tile}>
      <div style={styles.iconWrap}>
        <img src={t.icon} width={28} height={28} alt="" />
      </div>
      <div>
        <div style={styles.tileTitle}>{t.title}</div>
        <div style={styles.tileSub}>{t.subtitle}</div>
      </div>
    </div>
  );

  if (t.type === "external") {
    return (
      <a href={t.href} target="_blank" rel="noreferrer" style={styles.link}>
        {content}
      </a>
    );
  }

  return (
    <Link href={t.href} style={styles.link}>
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
          alt=""
          width={260}
          height={260}
          priority
        />

        <p style={styles.desc}>
          A well-rounded 18-hole disc golf experience featuring tight wooded
          challenges, wide-open distance shots, and a fun atmosphere — including
          a friendly donkey midway through your round.
        </p>

        <Link href="/course">
          <button style={styles.primaryBtn}>Hole Layout</button>
        </Link>
      </section>

      <section style={styles.grid}>
        {tiles.map((t) => (
          <Tile key={t.href} t={t} />
        ))}
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
    maxWidth: 900,
    margin: "0 auto",
    textAlign: "center",
  },
  desc: {
    maxWidth: 760,
    margin: "14px auto",
    fontSize: 16,
    lineHeight: 1.5,
    color: "#1f2937",
  },
  primaryBtn: {
    marginTop: 10,
    padding: "10px 16px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    background: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
  },
  grid: {
    maxWidth: 900,
    margin: "28px auto 0",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
  },
  tile: {
    display: "flex",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    alignItems: "center",
  },
  iconWrap: {
    width: 36,
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  tileTitle: {
    fontWeight: 600,
  },
  tileSub: {
    fontSize: 13,
    color: "#6b7280",
  },
  link: {
    textDecoration: "none",
    color: "inherit",
  },
};
