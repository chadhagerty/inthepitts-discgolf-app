"use client";

import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

const sponsors = [
  { name: "Wicks Contracting", href: "https://www.wickscontracting.com", logo: "/sponsors/wicks_contracting.png" },
  { name: "Mundell Plumbing", href: "mailto:mundellplumbing@gmail.com", logo: "/sponsors/mundell_plumbing.png" },
  { name: "Jan Kahlen Real Estate", href: "https://www.kahlenrealestate.com", logo: "/sponsors/kahlen_real_estate.png" },
  { name: "Kingston Masonry Services", href: "https://kingstonmasonryservices.ca", logo: "/sponsors/kingston_masonry_services.png" },
  { name: "Lakins Painting & Decorating", href: "mailto:blakins8888@hotmail.com", logo: "/sponsors/lakins_painting_decorating.png" },
  { name: "Kingston Billiards & Games", href: "https://www.kingstonbilliardsandgames.com", logo: "/sponsors/kingston_billiards_games.png" },
  { name: "Mo Brothers Inc", href: "https://www.mobrothersinc.com", logo: "/sponsors/mo_brothers_inc.png" },
  { name: "REP Windows & Doors", href: "https://www.repwindowsdoors.com", logo: "/sponsors/rep_windows_doors.png" },

  { name: "Connie and Mel Hagerty", href: "", logo: "/sponsors/connie_mel_hagerty.png" },

  { name: "Grekos Pizzeria", href: "https://www.facebook.com/GrekosPizza", logo: "/sponsors/grekos_pizzeria.png" },
  { name: "Versus Forms & Labels", href: "https://www.versusforms.com", logo: "/sponsors/versus_forms_labels.png" },
  { name: "Full House Roofing", href: "https://fullhouseroofing.ca", logo: "/sponsors/full_house_roofing.png" },

  {
    name: "Jayz Automotive Service",
    href: "https://bestprosintown.com/on/gananoque/jayz-automotive-service-gananoque-inc-/",
    logo: "/sponsors/jayz_automotive_service.png",
  },

  { name: "OYYC", href: "https://www.facebook.com/OYYC", logo: "/sponsors/oyyc.png" },
  { name: "Nick Hogan Trucking (NHT Excavations)", href: "https://www.facebook.com/NHTExcavations", logo: "/sponsors/nht_excavations.png" },

  {
    name: "In The Pitts Disc Golf",
    href: "",
    logo: "/sponsors/in_the_pitts_text.png",
  },

  {
    name: "In The Pitts Disc Golf (Helping hands + donators)",
    href: "",
    logo: "/sponsors/in_the_pitts_disc_golf.png",
  },

  { name: "Sponsor Spot Available", href: "", logo: "/sponsors/sponsor_spot_available.png" },
];

function initials(name) {
  return (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function SponsorCard({ s }) {
  const cardInner = (
    <div
  style={styles.card}
  onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.cardHover)}
  onMouseLeave={(e) =>
    Object.assign(e.currentTarget.style, {
      transform: "translateY(0)",
      boxShadow: "none",
    })
  }
>

      <div style={styles.logoWrap}>
        {s.logo ? (
          <Image
  src={s.logo}
  alt={s.name}
  width={520}
  height={260}
  style={{
    maxWidth: "100%",
    maxHeight: "100px",
    width: "auto",
    height: "auto",
    objectFit: "contain",
  }}
/>

        ) : (
          <div style={styles.fallback}>{initials(s.name)}</div>
        )}
      </div>

      <div style={styles.name}>{s.name}</div>

      {!!s.href && (
        <div style={styles.linkText}>
          {s.href.startsWith("mailto:") ? "Email" : "Visit"}
        </div>
      )}
    </div>
  );

  if (!s.href) return cardInner;

  const isExternal = s.href.startsWith("http") || s.href.startsWith("mailto:");
  return isExternal ? (
    <a href={s.href} target="_blank" rel="noreferrer" style={styles.a}>
      {cardInner}
    </a>
  ) : (
    <Link href={s.href} style={styles.a}>
      {cardInner}
    </Link>
  );
}

export default function SponsorsPage() {
  return (
    <main style={styles.page}>
      <div style={styles.topBar}>
        <h1 style={styles.h1}>Sponsors</h1>
        <Link href="/" style={styles.homeLink}>
          ← Home
        </Link>
      </div>

      <p style={styles.sub}>
        Huge thanks to the businesses and people helping keep In The Pitts Disc Golf running.
      </p>

      <div style={styles.grid}>
        {sponsors.map((s) => (
          <SponsorCard key={s.name} s={s} />
        ))}
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f6f7fb",
    padding: "24px 16px 48px",
  },
  topBar: {
    maxWidth: 980,
    margin: "0 auto",
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 12,
  },
  h1: { margin: 0, fontSize: 28 },
  homeLink: { textDecoration: "underline", fontWeight: 700 },
  sub: {
    maxWidth: 980,
    margin: "10px auto 18px",
    color: "#374151",
    lineHeight: 1.5,
  },
  grid: {
    maxWidth: 980,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
  },
  a: { textDecoration: "none", color: "inherit" },
 card: {
  borderRadius: 16,
  background: "#ffffff",
  padding: 14,
  transition: "transform 160ms ease, box-shadow 160ms ease",
},

cardHover: {
  transform: "translateY(-4px)",
  boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
},


logoWrap: {
  width: "100%",
  height: "90px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
},

  logo: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    padding: 10,
  },
  fallback: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 28,
    fontWeight: 900,
    color: "#111827",
  },
  name: { fontWeight: 800, fontSize: 16, marginTop: 2 },
  linkText: { marginTop: 6, fontSize: 13, color: "#2563eb", fontWeight: 700 },
};
