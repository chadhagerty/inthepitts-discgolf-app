"use client";

import Link from "next/link";

async function startCheckout(mode) {
  const res = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode }), // "membership" | "daypass"
  });

  const data = await res.json();
  if (data?.url) window.location.href = data.url;
  else alert(data?.error || "Checkout failed");
}

export default function MembershipsPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 24,
        background:
          "radial-gradient(1200px 600px at 20% 0%, rgba(34,197,94,0.22), transparent 60%), radial-gradient(900px 500px at 90% 20%, rgba(16,185,129,0.18), transparent 55%), linear-gradient(180deg, #0b1b13, #0b1220)",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          border: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(255,255,255,0.06)",
          borderRadius: 18,
          padding: 20,
          boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Bigger logo (top-left) */}
            <img
              src="/logo.png"
              alt="In The Pitts"
              draggable={false}
              style={{
                width: 70,
                height: 70,
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(0,0,0,0.2)",
              }}
            />

            <div>
              <h1 style={{ margin: 0, color: "#eafff2" }}>Memberships</h1>
              <div style={{ marginTop: 4, color: "rgba(234,255,242,0.75)", fontWeight: 700 }}>
                Grab a Day Pass or lock in the Yearly.
              </div>
            </div>
          </div>

          <Link href="/" style={{ textDecoration: "underline", color: "#eafff2", fontWeight: 800 }}>
            ← Home
          </Link>
        </div>

        {/* CONTENT */}
        <div
          style={{
            marginTop: 16,
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 14,
            background: "rgba(0,0,0,0.18)",
            padding: 16,
          }}
        >
          <div
            style={{
              display: "grid",
              gap: 12,
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            }}
          >
            {/* Day Pass card */}
            <div
              style={{
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 14,
                padding: 14,
                background: "rgba(255,255,255,0.06)",
                color: "#eafff2",
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 18 }}>Day Pass</div>
              <div style={{ marginTop: 6, fontSize: 28, fontWeight: 900 }}>$10</div>
              <div style={{ marginTop: 6, opacity: 0.85, fontWeight: 700 }}>
                Good for today. Quick and easy.
              </div>

              <button
                onClick={() => startCheckout("daypass")}
                style={{
                  marginTop: 12,
                  width: "100%",
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(34,197,94,0.25)",
                  color: "#eafff2",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Buy Day Pass 🥏
              </button>
            </div>

            {/* Yearly card */}
            <div
              style={{
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 14,
                padding: 14,
                background: "rgba(255,255,255,0.06)",
                color: "#eafff2",
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 18 }}>Yearly Membership</div>
              <div style={{ marginTop: 6, fontSize: 28, fontWeight: 900 }}>$100</div>
              <div style={{ marginTop: 6, opacity: 0.85, fontWeight: 700 }}>
                Best value if you play here a bunch.
              </div>

              <button
                onClick={() => startCheckout("membership")}
                style={{
                  marginTop: 12,
                  width: "100%",
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(34,197,94,0.25)",
                  color: "#eafff2",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Buy Yearly Membership ✅
              </button>
            </div>
          </div>

          {/* Alternate payment */}
          <div
            style={{
              marginTop: 14,
              padding: 14,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(0,0,0,0.14)",
              color: "#eafff2",
            }}
          >
            <div style={{ fontWeight: 900 }}>Pay by e-transfer or cash</div>
            <div style={{ marginTop: 6, opacity: 0.9, fontWeight: 700 }}>
              If you pay off-app, you’ll need to be checked in manually.
            </div>
            <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
              <div style={{ fontWeight: 800 }}>
                E-transfer: <span style={{ fontFamily: "monospace" }}>inthepittsdiscgolf@gmail.com</span>
              </div>
              <div style={{ fontWeight: 800 }}>
                Text/Call: <span style={{ fontFamily: "monospace" }}>613-331-3462</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
