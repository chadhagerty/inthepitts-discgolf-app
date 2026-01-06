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
      {/* COURSE INFO SECTION */}
      <section
        style={{
          padding: "2.5rem 1.5rem",
          maxWidth: "900px",
          margin: "0 auto",
          borderTop: "1px solid #e5e7eb",
        }}
      >
        <h2 style={{ fontSize: "1.75rem", marginBottom: "1rem" }}>
          Course Information
        </h2>

        <ul style={{ fontSize: "1.05rem", lineHeight: "1.8", paddingLeft: "1.2rem" }}>
          <li><strong>Holes:</strong> 18</li>
          <li><strong>Terrain:</strong> Mixed wooded and open fairways</li>
          <li><strong>Skill Level:</strong> Beginner friendly with advanced challenges</li>
          <li><strong>Distances:</strong> Short technical shots to long-distance drives</li>
          <li><strong>Atmosphere:</strong> Relaxed, fun, and family-friendly</li>
          <li><strong>Wildlife:</strong> Deer, birds, and a friendly donkey midway through the course</li>
        </ul>
      </section>

