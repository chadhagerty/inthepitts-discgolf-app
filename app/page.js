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

function safeId(label) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function Tile({ t }) {
  const clipId = `clip-${safeId(t.label)}`;

  // NOTE: slight zoom-in (1.08) pushes any dirty edge pixels outside the circle
  const icon = (
    <svg width="190" height="190" viewBox="0 0 190 190" style={{ display: "block" }}>
      <defs>
        <clipPath id={clipId}>
          <circle cx="95" cy="95" r="95" />
        </clipPath>
      </defs>

      <image
        href={t.icon}
        width="190"
        height="190"
        preserveAspectRatio="xMidYMid slice"
        clipPath={`url(#${clipId})`}
        transform="translate(95 95) scale(1.08) translate(-95 -95)"
      />
    </svg>
  );

  if (t.type === "external") {
    return (
      <a href={t.href} target="_blank" rel="noreferrer" className="tileLink" aria-label={t.label}>
        {icon}
      </a>
    );
  }

  return (
    <Link href={t.href} className="tileLink" aria-label={t.label}>
      {icon}
    </Link>
  );
}

export default function Page() {
  return (
    <main className="homePage">
      <section className="homeHero">
        <Image src="/logo.png" alt="In The Pitts Disc Golf" width={240} height={240} priority className="homeLogo" />

        <p className="homeDesc">
          A well rounded 18 hole course with both wooded and open holes. Great for the beginner or seasoned vet,
          features some short forest holes and some long bombers. Say hello to the friendly donkey at hole 6 tee pad.
        </p>

        <Link href="/course" className="homeBtnLink">
          <button className="homeBtn">Hole Layout</button>
        </Link>
      </section>

      <section className="homeGridWrap">
        <div className="tileGrid">
          {tiles.map((t) => (
            <Tile key={t.href} t={t} />
          ))}
        </div>
      </section>
    </main>
  );
}
