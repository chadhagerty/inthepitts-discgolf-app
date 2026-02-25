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
    <main style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <h1>Memberships</h1>

      <p style={{ marginTop: 12 }}>
        Day Pass: <strong>$10</strong>
        <br />
        Yearly Membership: <strong>$100</strong>
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
        <button onClick={() => startCheckout("daypass")} style={{ padding: "10px 14px", fontWeight: 700 }}>
          Buy Day Pass
        </button>

        <button onClick={() => startCheckout("membership")} style={{ padding: "10px 14px", fontWeight: 700 }}>
          Buy Yearly Membership
        </button>
      </div>
 
      <p style={{ marginTop: 16 }}>
        Or pay by e-transfer or cash (call ahead to get checked in 613-331-3462): <strong>inthepittsdiscgolf@gmail.com</strong>
      </p>

      <div style={{ marginTop: 20 }}>
        <Link href="/" style={{ textDecoration: "underline" }}>← Home</Link>
      </div>
    </main>
  );
}
