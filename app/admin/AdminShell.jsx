import Link from "next/link";

export default function AdminShell({ title, subtitle, right, children }) {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 24,
        background:
          "radial-gradient(1200px 600px at 20% 0%, rgba(34,197,94,0.20), transparent 60%), radial-gradient(900px 500px at 90% 20%, rgba(16,185,129,0.18), transparent 55%), linear-gradient(180deg, #0b1b13, #0b1220)",
      }}
    >
      <div
        style={{
          maxWidth: 980,
          margin: "0 auto",
          border: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(255,255,255,0.06)",
          borderRadius: 18,
          padding: 18,
          boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img
              src="/logo.png"
              alt="In The Pitts"
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(0,0,0,0.2)",
              }}
            />
            <div>
              <h1 style={{ margin: 0, color: "#eafff2" }}>{title}</h1>
              {subtitle ? (
                <div
                  style={{
                    marginTop: 4,
                    color: "rgba(234,255,242,0.75)",
                    fontWeight: 700,
                  }}
                >
                  {subtitle}
                </div>
              ) : null}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            {right}
            <Link href="/" style={{ textDecoration: "underline", color: "#eafff2", fontWeight: 800 }}>
              Home
            </Link>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>{children}</div>
      </div>
    </main>
  );
}
