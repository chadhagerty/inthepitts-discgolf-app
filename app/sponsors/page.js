"use client";

import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

const sponsors = [
  { name: "Wicks Contracting", href: "https://www.wickscontracting.com", logo: "/sponsors/wicks_contracting.png", tier: "Course Partner" },
  { name: "Mundell Plumbing", href: "mailto:mundellplumbing@gmail.com", logo: "/sponsors/mundell_plumbing.png", tier: "Local Legend" },
  { name: "Jan Kahlen Real Estate", href: "https://www.kahlenrealestate.com", logo: "/sponsors/kahlen_real_estate.png", tier: "Local Legend" },
  { name: "Kingston Masonry Services", href: "https://kingstonmasonryservices.ca", logo: "/sponsors/kingston_masonry_services.png", tier: "Course Partner" },
  { name: "Lakins Painting & Decorating", href: "mailto:blakins8888@hotmail.com", logo: "/sponsors/lakins_painting_decorating.png", tier: "Local Legend" },
  { name: "Kingston Billiards & Games", href: "https://www.kingstonbilliardsandgames.com", logo: "/sponsors/kingston_billiards_games.png", tier: "Local Legend" },
  { name: "Mo Brothers Inc", href: "https://www.mobrothersinc.com", logo: "/sponsors/mo_brothers_inc.png", tier: "Local Legend" },
  { name: "REP Windows & Doors", href: "https://www.repwindowsdoors.com", logo: "/sponsors/rep_windows_doors.png", tier: "Course Partner" },

  { name: "Connie and Mel Hagerty", href: "", logo: "/sponsors/connie_mel_hagerty.png", tier: "Helping Hands" },

  { name: "Grekos Pizzeria", href: "https://www.facebook.com/GrekosPizza", logo: "/sponsors/grekos_pizzeria.png", tier: "Local Legend" },
  { name: "Versus Forms & Labels", href: "https://www.versusforms.com", logo: "/sponsors/versus_forms_labels.png", tier: "Local Legend" },
  { name: "Full House Roofing", href: "https://fullhouseroofing.ca", logo: "/sponsors/full_house_roofing.png", tier: "Local Legend" },

  {
    name: "Jayz Automotive Service",
    href: "https://bestprosintown.com/on/gananoque/jayz-automotive-service-gananoque-inc-/",
    logo: "/sponsors/jayz_automotive_service.png",
    tier: "Local Legend",
  },

  { name: "SouthEastern Group", href: "https://www.southeasterngroupinc.ca", logo: "/sponsors/southeastern_group.png", tier: "Local Legend" },
  { name: "Nick Hogan Trucking (NHT Excavations)", href: "https://www.facebook.com/NHTExcavations", logo: "/sponsors/nht_excavations.png", tier: "Course Partner" },

  { name: "In The Pitts Disc Golf", href: "", logo: "/sponsors/in_the_pitts_text.png", tier: "House" },
  { name: "In The Pitts Disc Golf (Helping hands + donators)", href: "", logo: "/sponsors/in_the_pitts_disc_golf.png", tier: "Helping Hands" },

  { name: "Sponsor Spot Available", href: "", logo: "/sponsors/sponsor_spot_available.png", tier: "Spot Open" },
];

function initials(name) {
  return (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function tierStyles(tier) {
  // little “gamey rarity” chips
  switch (tier) {
    case "Course Partner":
      return { bg: "rgba(34,197,94,0.18)", border: "rgba(34,197,94,0.35)", text: "#bbf7d0" };
    case "Local Legend":
      return { bg: "rgba(16,185,129,0.16)", border: "rgba(16,185,129,0.33)", text: "#a7f3d0" };
    case "Helping Hands":
      return { bg: "rgba(59,130,246,0.16)", border: "rgba(59,130,246,0.30)", text: "#bfdbfe" };
    case "Spot Open":
      return { bg: "rgba(245,158,11,0.16)", border: "rgba(245,158,11,0.30)", text: "#fde68a" };
    case "House":
    default:
      return { bg: "rgba(255,255,255,0.10)", border: "rgba(255,255,255,0.18)", text: "rgba(234,255,242,0.90)" };
  }
}

function SponsorCard({ s }) {
  const chip = tierStyles(s.tier);

  const inner = (
    <div
      style={{
        ...styles.card,
        cursor: s.href ? "pointer" : "default",
      }}
      onMouseEnter={(e) => {
        Object.assign(e.currentTarget.style, styles.cardHover);
      }}
      onMouseLeave={(e) => {
        Object.assign(e.currentTarget.style, {
          transform: "translateY(0)",
          boxShadow: "none",
          borderColor: "rgba(255,255,255,0.10)",
        });
      }}
    >
      <div style={styles.cardTop}>
        <div
          style={{
            ...styles.chip,
            background: chip.bg,
            borderColor: chip.border,
            color: chip.text,
          }}
        >
          {s.tier || "Sponsor"}
        </div>

        {!!s.href && (
          <div style={styles.linkPill}>
            {s.href.startsWith("mailto:") ? "Email" : "Visit"}
          </div>
        )}
      </div>

      <div style={styles.logoWrap}>
        {s.logo ? (
          <Image
            src={s.logo}
            alt={s.name}
            width={520}
            height={260}
            draggable={false}
            style={styles.logoImg}
          />
        ) : (
          <div style={styles.fallback}>{initials(s.name)}</div>
        )}
      </div>

      <div style={styles.name}>{s.name}</div>

      {/* tiny flavor text */}
      <div style={styles.flavor}>
        {s.tier === "Spot Open"
          ? "Want your logo here? 🥏"
          : "Thanks for keeping the course dialed. ✅"}
      </div>
    </div>
  );

  if (!s.href) return inner;

  const isExternal = s.href.startsWith("http") || s.href.startsWith("mailto:");
  return isExternal ? (
    <a href={s.href} target="_blank" rel="noreferrer" style={styles.a} aria-label={s.name}>
      {inner}
    </a>
  ) : (
    <Link href={s.href} style={styles.a} aria-label={s.name}>
      {inner}
    </Link>
  );
}

export default function SponsorsPage() {
  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        {/* HEADER */}
        <div style={styles.headerRow}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <img
              src="/logo.png"
              alt="In The Pitts"
              draggable={false}
              style={styles.logo}
            />
            <div>
              <h1 style={styles.h1}>Sponsors</h1>
              <div style={styles.sub}>
                Huge thanks to the businesses and people helping keep In The Pitts Disc Golf running.
              </div>
            </div>
          </div>

          <Link href="/" style={styles.homeLink}>
            ← Home
          </Link>
        </div>

        {/* GRID */}
        <div style={styles.grid}>
          {sponsors.map((s) => (
            <SponsorCard key={s.name} s={s} />
          ))}
        </div>

        {/* FOOTER NOTE */}
        <div style={styles.footerNote}>
          <div style={{ fontWeight: 900 }}>Want to sponsor a hole?</div>
          <div style={{ marginTop: 6, opacity: 0.85, fontWeight: 700 }}>
            Message us through the app or email{" "}
            <span style={{ fontFamily: "monospace" }}>inthepittsdiscgolf@gmail.com</span>
          </div>
        </div>
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: 24,
    background:
      "radial-gradient(1200px 600px at 20% 0%, rgba(34,197,94,0.22), transparent 60%), radial-gradient(900px 500px at 90% 20%, rgba(16,185,129,0.18), transparent 55%), linear-gradient(180deg, #0b1b13, #0b1220)",
  },
  shell: {
    maxWidth: 1100,
    margin: "0 auto",
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.06)",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "center",
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(0,0,0,0.2)",
  },
  h1: { margin: 0, color: "#eafff2" },
  sub: { marginTop: 4, color: "rgba(234,255,242,0.75)", fontWeight: 700, lineHeight: 1.35, maxWidth: 720 },
  homeLink: { textDecoration: "underline", color: "#eafff2", fontWeight: 800 },

  grid: {
    marginTop: 16,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 12,
  },

  a: { textDecoration: "none", color: "inherit" },

  card: {
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.18)",
    padding: 14,
    transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
  },
  cardHover: {
    transform: "translateY(-4px)",
    boxShadow: "0 14px 30px rgba(0,0,0,0.35)",
    borderColor: "rgba(34,197,94,0.25)",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.18)",
    fontWeight: 900,
    fontSize: 12,
    letterSpacing: 0.2,
    whiteSpace: "nowrap",
  },
  linkPill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(234,255,242,0.9)",
    fontWeight: 900,
    fontSize: 12,
    whiteSpace: "nowrap",
  },

  logoWrap: {
    width: "100%",
    height: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.05)",
    overflow: "hidden",
  },
  logoImg: {
    maxWidth: "92%",
    maxHeight: "86px",
    width: "auto",
    height: "auto",
    objectFit: "contain",
  },
  fallback: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 28,
    fontWeight: 900,
    color: "#eafff2",
  },
  name: { fontWeight: 900, fontSize: 16, marginTop: 10, color: "#eafff2" },
  flavor: { marginTop: 6, fontSize: 13, color: "rgba(234,255,242,0.75)", fontWeight: 700 },

  footerNote: {
    marginTop: 16,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.14)",
    padding: 14,
    color: "#eafff2",
  },
};
