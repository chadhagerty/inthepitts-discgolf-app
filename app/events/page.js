"use client";


import { useEffect, useState } from "react";
import Link from "next/link";


const DIVISIONS = [
  "MPO",
  "FPO",
  "MA1",
  "MA2",
  "MA3",
  "MA4",
  "FA1",
  "FA2",
  "Junior",
  "Other",
];


function formatType(type) {
  if (type === "tournament") return "Tournament";
  if (type === "league") return "League";
  if (type === "special") return "Special Event";
  if (type === "community") return "Community / Casual";
  return type || "Event";
}


function formatLayout(layout) {
  if (layout === "red-12") return "Red 12";
  if (layout === "blue-12") return "Blue 12";
  if (layout === "red-18") return "Red 18";
  if (layout === "blue-18") return "Blue 18";
  return layout || "—";
}


function formatPayment(event) {
  const paymentType = String(event?.paymentType || "free");
  const price = Number(event?.price || 0);


  if (paymentType === "free") return "Free Event";
  if (paymentType === "cash") return price > 0 ? `$${price} • Cash` : "Cash";
  if (paymentType === "etransfer") return price > 0 ? `$${price} • E-Transfer` : "E-Transfer";
  if (paymentType === "stripe") return price > 0 ? `$${price} • Stripe` : "Stripe";
  return "—";
}


function paymentStatusText(event) {
  const paymentType = String(event?.paymentType || "free");


  if (paymentType === "free") {
    return "Registration only — no payment required.";
  }


  if (paymentType === "cash") {
    return "Joining reserves your spot. Payment is still required in cash.";
  }


  if (paymentType === "etransfer") {
    return "Joining reserves your spot. E-transfer payment is still required.";
  }


  if (paymentType === "stripe") {
    return "Joining reserves your spot. Stripe payment will be required.";
  }


  return "";
}


function cardStyle() {
  return {
    border: "1px solid rgba(0,0,0,0.08)",
    background: "rgba(255,255,255,0.72)",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
  };
}


export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [joiningId, setJoiningId] = useState("");
  const [joinName, setJoinName] = useState("");
  const [joinDivision, setJoinDivision] = useState("MA3");
  const [status, setStatus] = useState("");
  const [openPlayersId, setOpenPlayersId] = useState("");


  async function load() {
    setLoading(true);
    setErr("");


    try {
      const res = await fetch("/api/events?take=100", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));


      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Failed to load events");
      }


      setEvents(Array.isArray(data.events) ? data.events : []);
    } catch (e) {
      setEvents([]);
      setErr(e?.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    load();
  }, []);


  function openJoin(eventId) {
    setJoiningId(eventId);
    setJoinName("");
    setJoinDivision("MA3");
    setStatus("");
  }


  function closeJoin() {
    setJoiningId("");
    setJoinName("");
    setJoinDivision("MA3");
    setStatus("");
  }


  function togglePlayers(eventId) {
    setOpenPlayersId((current) => (current === eventId ? "" : eventId));
  }


  async function submitJoin() {
    const cleanName = String(joinName || "").trim();


    if (!joiningId) {
      setStatus("No event selected.");
      return;
    }


    if (!cleanName) {
      setStatus("Enter your name.");
      return;
    }


    if (!joinDivision) {
      setStatus("Select a division.");
      return;
    }


    setStatus("Joining…");


    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: joiningId,
          name: cleanName,
          division: joinDivision,
        }),
      });


      const data = await res.json().catch(() => ({}));


      if (!res.ok || !data?.ok) {
        const msg =
          data?.error === "already-joined"
            ? "You already joined this event."
            : data?.error || "Join failed";
        throw new Error(msg);
      }


      setStatus("Joined ✅");
      await load();
      setOpenPlayersId(joiningId);


      setTimeout(() => {
        closeJoin();
      }, 700);
    } catch (e) {
      setStatus(e?.message || "Join failed");
    }
  }


  return (
    <main className="itp-page">
      <div className="itp-card itp-cardWide">
        <div className="itp-headerRow">
          <div>
            <h1 className="itp-title" style={{ margin: 0 }}>
              Events
            </h1>
            <div className="itp-subtitle">
              Leagues, tournaments, and course events
            </div>
          </div>


          <Link href="/" className="itp-link">
            ← Home
          </Link>
        </div>


        {err && (
          <div className="itp-panel">
            <div className="itp-alert bad">❌ {err}</div>
          </div>
        )}


        {loading ? (
          <div className="itp-panel">
            <div className="itp-muted">Loading events…</div>
          </div>
        ) : events.length === 0 ? (
          <div className="itp-panel">
            <div className="itp-muted">No events scheduled yet.</div>
            <div style={{ marginTop: 10 }}>
              Upcoming events such as leagues, tournaments, and special course
              challenges will appear here.
            </div>
          </div>
        ) : (
          <div className="itp-panel">
            <h3 className="itp-sectionTitle">Upcoming</h3>


            <div style={{ display: "grid", gap: 14, marginTop: 10 }}>
              {events.map((event) => {
                const isJoining = joiningId === event.id;
                const playersOpen = openPlayersId === event.id;
                const joinedCount = Array.isArray(event.joins) ? event.joins.length : 0;


                return (
                  <div key={event.id} style={cardStyle()}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        flexWrap: "wrap",
                        alignItems: "start",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 1000, fontSize: 20 }}>
                          {event.title}
                        </div>


                        <div
                          className="itp-muted"
                          style={{ marginTop: 6, fontWeight: 800 }}
                        >
                          {String(event.date || "").slice(0, 10)} •{" "}
                          {formatType(event.type)} • {formatLayout(event.layout)}
                        </div>


                        <div style={{ marginTop: 10, fontWeight: 900 }}>
                          Entry: {formatPayment(event)}
                        </div>


                        {event.paymentNotes ? (
                          <div className="itp-muted" style={{ marginTop: 6, fontWeight: 700 }}>
                            {event.paymentNotes}
                          </div>
                        ) : null}


                        {event.description ? (
                          <div style={{ marginTop: 10 }}>{event.description}</div>
                        ) : null}


                        <div style={{ marginTop: 10, fontWeight: 900 }}>
                          Joined: {joinedCount}
                        </div>
                      </div>


                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button
  type="button"
  className="itp-btnSecondary"
  onClick={() => togglePlayers(event.id)}
>
  {playersOpen
    ? "Hide Players"
    : `View Players (${joinedCount})`}
</button>



                        <button
                          type="button"
                          className="itp-btn"
                          onClick={() => openJoin(event.id)}
                        >
                          Join Event
                        </button>
                      </div>
                    </div>


                    {playersOpen && (
                      <div style={{ marginTop: 14 }}>
                        <div className="itp-label" style={{ marginBottom: 8 }}>
                          Registered Players
                        </div>


                        {joinedCount === 0 ? (
                          <div className="itp-muted">No players joined yet.</div>
                        ) : (
                          <div style={{ display: "grid", gap: 8 }}>
                            {event.joins.map((join) => (
                              <div
                                key={join.id}
                                style={{
                                  padding: "8px 10px",
                                  borderRadius: 10,
                                  background: "rgba(255,255,255,0.55)",
                                  border: "1px solid rgba(0,0,0,0.06)",
                                  fontWeight: 700,
                                }}
                              >
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
  <span>{join.name} — {join.division}</span>


  {join.paymentStatus === "paid" && (
    <span style={{ color: "#16a34a", fontWeight: 800 }}>
      🟢 Paid
    </span>
  )}


  {join.paymentStatus === "pending" && (
    <span style={{ color: "#d97706", fontWeight: 800 }}>
      🟡 Payment Pending
    </span>
  )}
</div>

                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}


                    {isJoining && (
                      <div
                        style={{
                          marginTop: 14,
                          padding: 14,
                          borderRadius: 14,
                          background: "rgba(255,255,255,0.6)",
                          border: "1px solid rgba(0,0,0,0.08)",
                        }}
                      >
                        <div style={{ fontWeight: 1000, marginBottom: 10 }}>
                          Join {event.title}
                        </div>


                        <div
                          className="itp-muted"
                          style={{ marginBottom: 10, fontWeight: 700 }}
                        >
                          {paymentStatusText(event)}
                        </div>


                        <div style={{ display: "grid", gap: 10 }}>
                          <input
                            value={joinName}
                            onChange={(e) => setJoinName(e.target.value)}
                            className="itp-input"
                            placeholder="Your name"
                          />


                          <select
                            value={joinDivision}
                            onChange={(e) => setJoinDivision(e.target.value)}
                            className="itp-input"
                          >
                            {DIVISIONS.map((division) => (
                              <option key={division} value={division}>
                                {division}
                              </option>
                            ))}
                          </select>


                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <button
                              type="button"
                              className="itp-btn"
                              onClick={submitJoin}
                            >
                              Confirm Join
                            </button>


                            <button
                              type="button"
                              className="itp-btnSecondary"
                              onClick={closeJoin}
                            >
                              Cancel
                            </button>
                          </div>


                          {status && <div className="itp-muted">{status}</div>}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
