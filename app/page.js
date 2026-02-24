import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

const tiles = [
  { type: "internal", href: "/checkin", icon: "/tile-icons/checkin.png?v=3", label: "Course Check-In" },
  { type: "internal", href: "/memberships", icon: "/tile-icons/membership.png?v=3", label: "Membership" },
  { type: "internal", href: "/events", icon: "/tile-icons/events.png?v=3", label: "Events" },
  { type: "internal", href: "/chat", icon: "/tile-icons/chat.png?v=3", label: "Chat" },

  { type: "internal", href: "/stats", icon: "/tile-icons/stats.png?v=3", label: "Stats" },
  { type: "internal", href: "/leaderboard", icon: "/tile-icons/leaderboard.png?v=3", label: "Leaderboard" },
  { type: "internal", href: "/review", icon: "/tile-icons/reviews.png?v=3", label: "Reviews" },
  { type: "internal", href: "/sponsors", icon: "/tile-icons/sponsors.png?v=3", label: "Sponsors" },

  { type: "external", href: "https://www.youtube.com/@InThePittsDiscGolfCourse", icon: "/tile-icons/youtube.png?v=3", label: "YouTube" },
  { type: "external", href: "https://www.facebook.com/share/1D8MpvLLtv/", icon: "/tile-icons/facebook.png?v=3", label: "Facebook" },
  { type: "internal", href: "/dgv", icon: "/tile-icons/dgv.png?v=3", label: "Disc Golf Valley" },
  { type: "internal", href: "/the-game", icon: "/tile-icons/ITP_Game.png?v=3", label: "In The Pitts - The Game" },
];

function safeId(label) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function Tile({ t }) {
  const content = (
    <div className="tileFrame">
      <img
        src={t.icon}
        alt={t.label}
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
          width={240}
          height={240}
          priority
          className="homeLogo"
        />

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
  <Tile key={`${t.type}-${t.href}-${t.icon}`} t={t} />

))}

        </div>
      </section>
    </main>
  );
}
