import Image from "next/image";

export default function Home() {
  return (
    <main>
      {/* HERO SECTION */}
      <section
        style={{
          background: "linear-gradient(135deg, #1f2933, #0b3d2e)",
          color: "white",
          padding: "4rem 1.5rem",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <Image
            src="/logo.png"
            alt="In The Pitts Disc Golf"
            width={160}
            height={160}
            style={{ margin: "0 auto 1.5rem auto" }}
            priority
          />

          <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
            In The Pitts Disc Golf Course
          </h1>

          <p style={{ fontSize: "1.15rem", lineHeight: "1.6" }}>
            A well-rounded 18-hole disc golf experience featuring tight wooded
            challenges, wide-open distance shots, and a fun atmosphere filled
            with wildlife — including a friendly donkey midway through your
            round.
          </p>
        </div>
      </section>

      {/* CONTENT SECTION */}
      <section
        style={{
          padding: "2.5rem 1.5rem",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <p style={{ fontSize: "1.1rem", lineHeight: "1.7" }}>
          Scan the QR codes located throughout the course to watch drone videos
          showcasing hole layouts and flight paths.
        </p>
      </section>
    </main>
  );
}

