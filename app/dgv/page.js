import Link from "next/link";

export default function DgvPage() {
  return (
    <main style={{ padding: "2rem 1rem", maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <img src="/icons/discgolf.svg" alt="" width="34" height="34" style={{ display: "block" }} />
        <h1 style={{ margin: 0 }}>Disc Golf Valley</h1>
      </div>

      <p style={{ marginTop: 12, opacity: 0.85 }}>
        Download the Disc Golf Valley mobile game:
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <a
          href="https://apps.apple.com/us/app/disc-golf-valley/id1463950775"
          target="_blank"
          rel="noreferrer"
          style={{
            textDecoration: "none",
            color: "inherit",
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            padding: 14,
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontWeight: 700 }}>Download on the App Store</span>
          <span style={{ opacity: 0.6 }}>↗</span>
        </a>

        <a
          href="https://play.google.com/store/apps/details?id=com.spinapp.discgolf"
          target="_blank"
          rel="noreferrer"
          style={{
            textDecoration: "none",
            color: "inherit",
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            padding: 14,
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontWeight: 700 }}>Get it on Google Play</span>
          <span style={{ opacity: 0.6 }}>↗</span>
        </a>
      </div>

      <div style={{ marginTop: 18 }}>
        <Link href="/" style={{ textDecoration: "underline" }}>
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}
