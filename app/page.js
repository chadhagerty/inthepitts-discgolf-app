import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

const tiles = [
  { type: "internal", href: "/checkin", icon: "/tile-icons/checkin.png", label: "Tap In" },
  { type: "internal", href: "/memberships", icon: "/tile-icons/membership.png", label: "Membership" },
  { type: "internal", href: "/events", icon: "/tile-icons/events.png", label: "Events" },
  { type: "internal", href: "/chat", icon: "/tile-icons/chat.png", label: "Chat" },

  { type: "internal", href: "/stats", icon: "/tile-icons/stats.png", label: "Stats" },
  { type: "internal", href: "/leaderboard", icon: "/tile-icons/leaderboard.png", label: "Leaderboard" },
  { type: "internal", href: "/review", icon: "/tile-icons/reviews.png", label: "Reviews" },
  { type: "internal", href: "/sponsors", icon: "/tile-icons/sponsors.png", label: "Sponsors" },

  { type: "external", href: "https://www.youtube.com/@InThePittsDiscGolfCourse", icon: "/tile-icons/youtube.png", label: "YouTube" },
  { type: "external", href: "https://www.facebook.com/share/1D8MpvLLtv/", icon: "/tile-icons/facebook.png", label: "Facebook" },

  // REPLACE Disc Golf Valley tile with About (you asked for this)
  { type: "internal", href: "/about", icon: "/tile-icons/course-info.png", label: "About" },

  { type: "internal", href: "/the-game", icon: "/tile-icons/ITP_Game.png", label: "In The Pitts - The Game" },
];

function Tile({ t }) {
  const content = (
    <div className="tileFrame">
      <Image
        src={t.icon}
        alt={t.label}
        fill
        sizes="160px"
        draggable={false}
        className="tileImg"
      />
    </div>
  );

  if (t.type === "external") {
    return (
      <a
        href={t.href}
        target="_blank"
        rel="noreferrer"
        className="tileLink"
        aria-label={t.label}
      >
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
    <main className="homePage">
      <section className="homeHero">
        <Image
          src="/logo.png"
          alt="In The Pitts Disc Golf"
          width={300}
          height={300}
          priority
          className="homeLogo"
        />

        <p className="homeDesc" style={{ marginTop: 10, fontWeight: 800 }}>
          18-hole course • wooded + open
        </p>
      </section>

      <section className="homeGridWrap">
        <div className="tileGrid">
          {tiles.map((t) => (
            <Tile key={`${t.type}-${t.href}-${t.icon}`} t={t} />
          ))}
        </div>
      </section>
    </main>
  );
}
