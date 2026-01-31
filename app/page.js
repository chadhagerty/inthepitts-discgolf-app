import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "In The Pitts Disc Golf",
  description: "In The Pitts Disc Golf Course",
};


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
    <div className="tileFrame">
      <img src={t.icon} alt={t.label} draggable={false} className="tileImg" />
    </div>
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
    <main className="homePage">
      <section className="hero">
        <Image
          src="/logo.png"
          alt="In The Pitts Disc Golf"
          width={240}
          height={240}
          priority
          className="logo"
        />

        <p className="desc">
          A well rounded 18 hole course with both wooded and open holes. Great for the beginner or seasoned vet,
          features some short forest holes and some long bombers. Say hello to the friendly donkey at hole 6 tee pad.
        </p>

        <Link href="/course" style={{ textDecoration: "none" }}>
          <button className="primaryBtn">Hole Layout</button>
        </Link>
      </section>

      <section className="gridWrap">
        <div className="tileGrid">
          {tiles.map((t) => (
            <Tile key={t.href} t={t} />
          ))}
        </div>
      </section>

      {/* IMPORTANT: plain <style> tag (NOT styled-jsx), so no Server Component errors */}
      <style>{`
        .homePage{
          min-height:100vh;
          padding:20px 14px 44px;
          overflow-x:hidden; /* kills sideways scroll */
          background-color: transparent;
          background-image:
            radial-gradient(900px 500px at 15% -10%, rgba(239,68,68,0.03), transparent 60%),
            radial-gradient(900px 500px at 85% 10%, rgba(255,255,255,0.08), transparent 55%),
            radial-gradient(700px 450px at 50% 110%, rgba(34,197,94,0.18), transparent 55%);
        }

        .hero{
          display:flex;
          flex-direction:column;
          align-items:center;
          text-align:center;
          background:transparent;
          padding:0;
          margin-bottom:24px;
        }

        .logo{
          background:transparent;
          box-shadow:none;
          padding:0;
          border-radius:0;
          filter: drop-shadow(0 10px 25px rgba(0,0,0,0.10));
          mix-blend-mode:multiply;
          height:auto;
          width:auto;
        }

        .desc{
          max-width:700px;
          margin:10px auto;
          font-size:15px;
          line-height:1.45;
        }

        .primaryBtn{
          margin-top:10px;
          padding:10px 16px;
          border-radius:12px;
          border:1px solid #d1d5db;
          background:#fff;
          font-weight:700;
          cursor:pointer;
        }

        .gridWrap{
          width:100%;
          max-width:980px;
          margin:16px auto 0;
          padding:0 8px;
          box-sizing:border-box;
        }

        .tileGrid{
          width:100%;
          display:grid;
          grid-template-columns:repeat(4, minmax(0, 1fr));
          gap:16px;
          justify-items:center;
          align-items:center;
          box-sizing:border-box;
        }

        /* Tablet */
        @media (max-width: 900px){
          .tileGrid{ grid-template-columns:repeat(3, minmax(0, 1fr)); }
        }

        /* Phone */
        @media (max-width: 640px){
          .tileGrid{
            grid-template-columns:repeat(2, minmax(0, 1fr));
            gap:12px;
          }
        }

        .tileLink{
          width:100%;
          display:flex;
          justify-content:center;
          text-decoration:none;
          color:inherit;
        }

        tileFrame: {
  width: 170,
  height: 170,
  maxWidth: "42vw",
  maxHeight: "42vw",
  borderRadius: "50%",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
},




        .tileImg{
          width:92%;
          height:92%;
          object-fit: "contain";
          display: "block";
        }
      `
    
    }</style>
    </main>
  );
}
