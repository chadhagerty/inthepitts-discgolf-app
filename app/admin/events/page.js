"use client";


import { useEffect, useState } from "react";
import AdminShell from "../AdminShell";


const EMPTY_FORM = {
  title: "",
  date: "",
  type: "tournament",
  layout: "red-18",
  description: "",
  paymentType: "free",
  price: 0,
  paymentNotes: "",
};


const TYPE_OPTIONS = [
  { value: "tournament", label: "Tournament" },
  { value: "league", label: "League" },
  { value: "special", label: "Special Event" },
  { value: "community", label: "Community / Casual" },
];


const LAYOUT_OPTIONS = [
  { value: "red-12", label: "Red 12" },
  { value: "blue-12", label: "Blue 12" },
  { value: "red-18", label: "Red 18" },
  { value: "blue-18", label: "Blue 18" },
];


const PAYMENT_OPTIONS = [
  { value: "free", label: "Free" },
  { value: "cash", label: "Cash" },
  { value: "etransfer", label: "E-Transfer" },
  { value: "stripe", label: "Stripe" },
];


function cardStyle() {
  return {
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.18)",
    borderRadius: 16,
    padding: 14,
    color: "#eafff2",
    boxShadow: "0 10px 26px rgba(0,0,0,0.18)",
  };
}


function inputStyle() {
  return {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.08)",
    color: "#eafff2",
    outline: "none",
    fontWeight: 700,
  };
}


function buttonStyle(primary = false) {
  return {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.16)",
    background: primary ? "rgba(34,197,94,0.24)" : "rgba(255,255,255,0.08)",
    color: "#eafff2",
    fontWeight: 900,
    cursor: "pointer",
  };
}


function smallButtonStyle(kind = "default") {
  return {
    padding: "6px 10px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.14)",
    background:
      kind === "paid"
        ? "rgba(34,197,94,0.24)"
        : kind === "pending"
          ? "rgba(245,158,11,0.24)"
          : "rgba(255,255,255,0.08)",
    color: "#eafff2",
    fontWeight: 800,
    cursor: "pointer",
    fontSize: 12,
  };
}


function formatType(type) {
  if (type === "tournament") return "Tournament";
  if (type === "league") return "League";
  if (type === "special") return "Special Event";
  if (type === "community") return "Community / Casual";
  return type || "—";
}


function formatLayout(layout) {
  if (layout === "red-12") return "Red 12";
  if (layout === "blue-12") return "Blue 12";
  if (layout === "red-18") return "Red 18";
  if (layout === "blue-18") return "Blue 18";
  return layout || "—";
}


function formatPayment(event) {
  const paymentType = String(event.paymentType || "free");


  if (paymentType === "free") return "Free";
  if (paymentType === "cash") return event.price > 0 ? `$${event.price} • Cash` : "Cash";
  if (paymentType === "etransfer") return event.price > 0 ? `$${event.price} • E-Transfer` : "E-Transfer";
  if (paymentType === "stripe") return event.price > 0 ? `$${event.price} • Stripe` : "Stripe";
  return "—";
}


function paymentBadge(join) {
  if (join.paymentStatus === "paid") return "Paid";
  if (join.paymentStatus === "pending") return "Pending";
  return "No Payment Needed";
}


export default function AdminEventsPage() {
  const [key, setKey] = useState("");
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [editingId, setEditingId] = useState(null);


  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }


  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setErr("");
    setOkMsg("");
  }


  function startEdit(event) {
    setEditingId(event.id);
    setErr("");
    setOkMsg("");


    setForm({
      title: event.title || "",
      date: String(event.date || "").slice(0, 10),
      type: event.type || "tournament",
      layout: event.layout || "red-18",
      description: event.description || "",
      paymentType: event.paymentType || "free",
      price: Number(event.price || 0),
      paymentNotes: event.paymentNotes || "",
    });


    window.scrollTo({ top: 0, behavior: "smooth" });
  }


  async function load() {
    setLoading(true);
    setErr("");
    setOkMsg("");


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


  async function createEvent() {
    if (!key.trim()) {
      setErr("Paste ADMIN_KEY first.");
      return;
    }


    const title = String(form.title || "").trim();
    const date = String(form.date || "").trim();
    const paymentType = String(form.paymentType || "free").trim();
    const price = Number(form.price || 0);


    if (!title) {
      setErr("Event title is required.");
      return;
    }


    if (!date) {
      setErr("Event date is required.");
      return;
    }


    if (!Number.isFinite(price) || price < 0) {
      setErr("Price must be 0 or higher.");
      return;
    }


    setSaving(true);
    setErr("");
    setOkMsg("");


    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key.trim()}`,
        },
        body: JSON.stringify({
          title,
          date,
          type: form.type,
          layout: form.layout,
          description: String(form.description || "").trim(),
          paymentType,
          price: Math.trunc(price),
          paymentNotes: String(form.paymentNotes || "").trim(),
        }),
      });


      const data = await res.json().catch(() => ({}));


      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Create failed");
      }


      setForm(EMPTY_FORM);
      setOkMsg("Event created ✅");
      await load();
    } catch (e) {
      setErr(e?.message || "Create failed");
    } finally {
      setSaving(false);
    }
  }


  async function saveEdit() {
    if (!editingId) return;


    if (!key.trim()) {
      setErr("Paste ADMIN_KEY first.");
      return;
    }


    const title = String(form.title || "").trim();
    const date = String(form.date || "").trim();
    const paymentType = String(form.paymentType || "free").trim();
    const price = Number(form.price || 0);


    if (!title) {
      setErr("Event title is required.");
      return;
    }


    if (!date) {
      setErr("Event date is required.");
      return;
    }


    if (!Number.isFinite(price) || price < 0) {
      setErr("Price must be 0 or higher.");
      return;
    }


    setSaving(true);
    setErr("");
    setOkMsg("");


    try {
      const res = await fetch(`/api/events/${editingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key.trim()}`,
        },
        body: JSON.stringify({
          title,
          date,
          type: form.type,
          layout: form.layout,
          description: String(form.description || "").trim(),
          paymentType,
          price: Math.trunc(price),
          paymentNotes: String(form.paymentNotes || "").trim(),
        }),
      });


      const data = await res.json().catch(() => ({}));


      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Save failed");
      }


      setOkMsg("Event updated ✅");
      setEditingId(null);
      setForm(EMPTY_FORM);
      await load();
    } catch (e) {
      setErr(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }


  async function deleteEvent(id) {
    if (!key.trim()) {
      setErr("Paste ADMIN_KEY first.");
      return;
    }


    if (!confirm("Delete this event?")) return;


    setErr("");
    setOkMsg("");


    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${key.trim()}`,
        },
      });


      const data = await res.json().catch(() => ({}));


      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Delete failed");
      }


      if (editingId === id) {
        resetForm();
      }


      setOkMsg("Event deleted ✅");
      await load();
    } catch (e) {
      setErr(e?.message || "Delete failed");
    }
  }


  async function updateJoinPaymentStatus(joinId, paymentStatus) {
    if (!key.trim()) {
      setErr("Paste ADMIN_KEY first.");
      return;
    }


    setErr("");
    setOkMsg("");


    try {
      const res = await fetch(`/api/events/joins/${joinId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key.trim()}`,
        },
        body: JSON.stringify({ paymentStatus }),
      });


      const data = await res.json().catch(() => ({}));


      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Update failed");
      }


      setOkMsg("Registration updated ✅");
      await load();
    } catch (e) {
      setErr(e?.message || "Update failed");
    }
  }


  async function removeJoin(joinId) {
    if (!key.trim()) {
      setErr("Paste ADMIN_KEY first.");
      return;
    }


    if (!confirm("Remove this player from the event?")) return;


    setErr("");
    setOkMsg("");


    try {
      const res = await fetch(`/api/events/joins/${joinId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${key.trim()}`,
        },
      });


      const data = await res.json().catch(() => ({}));


      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Remove failed");
      }


      setOkMsg("Player removed ✅");
      await load();
    } catch (e) {
      setErr(e?.message || "Remove failed");
    }
  }


  const isEditing = !!editingId;
  const showPrice = form.paymentType !== "free";


  return (
    <AdminShell
      title="Events Admin"
      subtitle="Create events and manage player registrations."
      right={
        <span style={{ color: "rgba(234,255,242,0.75)", fontWeight: 800 }}>
          In The Pitts
        </span>
      }
    >
      <div style={{ display: "grid", gap: 14 }}>
        <div style={cardStyle()}>
          <div style={{ fontWeight: 950, fontSize: 18, marginBottom: 12 }}>
            {isEditing ? "Edit Event" : "Add Event"}
          </div>


          <div style={{ display: "grid", gap: 12 }}>
            <input
              type="password"
              placeholder="Paste ADMIN_KEY"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              style={inputStyle()}
            />


            <input
              placeholder="Event Title"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              style={inputStyle()}
            />


            <input
              type="date"
              value={form.date}
              onChange={(e) => setField("date", e.target.value)}
              style={inputStyle()}
            />


            <select
              value={form.type}
              onChange={(e) => setField("type", e.target.value)}
              style={inputStyle()}
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} style={{ color: "#111827" }}>
                  {opt.label}
                </option>
              ))}
            </select>


            <select
              value={form.layout}
              onChange={(e) => setField("layout", e.target.value)}
              style={inputStyle()}
            >
              {LAYOUT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} style={{ color: "#111827" }}>
                  {opt.label}
                </option>
              ))}
            </select>


            <select
              value={form.paymentType}
              onChange={(e) => setField("paymentType", e.target.value)}
              style={inputStyle()}
            >
              {PAYMENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} style={{ color: "#111827" }}>
                  {opt.label}
                </option>
              ))}
            </select>


            {showPrice && (
              <input
                type="number"
                min="0"
                placeholder="Price (whole dollars)"
                value={form.price}
                onChange={(e) => setField("price", e.target.value)}
                style={inputStyle()}
              />
            )}


            <textarea
              placeholder="Payment notes (ex: e-transfer to..., pay at course, Stripe link coming soon)"
              value={form.paymentNotes}
              onChange={(e) => setField("paymentNotes", e.target.value)}
              rows={3}
              style={{ ...inputStyle(), resize: "vertical" }}
            />


            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              rows={4}
              style={{ ...inputStyle(), resize: "vertical" }}
            />


            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={isEditing ? saveEdit : createEvent}
                disabled={saving}
                style={buttonStyle(true)}
              >
                {saving
                  ? (isEditing ? "Saving..." : "Creating...")
                  : (isEditing ? "Save Changes" : "Create Event")}
              </button>


              <button
                type="button"
                onClick={resetForm}
                style={buttonStyle(false)}
              >
                {isEditing ? "Cancel Edit" : "Reset"}
              </button>


              <button
                type="button"
                onClick={load}
                style={buttonStyle(false)}
              >
                Refresh
              </button>
            </div>


            {okMsg ? (
              <div style={{ color: "#86efac", fontWeight: 800 }}>{okMsg}</div>
            ) : null}


            {err ? (
              <div style={{ color: "#fca5a5", fontWeight: 800 }}>{err}</div>
            ) : null}
          </div>
        </div>


        <div style={cardStyle()}>
          <div style={{ fontWeight: 950, fontSize: 18, marginBottom: 12 }}>
            Current Events
          </div>


          {loading ? (
            <div style={{ color: "rgba(234,255,242,0.75)", fontWeight: 700 }}>
              Loading...
            </div>
          ) : events.length === 0 ? (
            <div style={{ color: "rgba(234,255,242,0.75)", fontWeight: 700 }}>
              No events yet.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {events.map((event) => (
                <div
                  key={event.id}
                  style={{
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: 14,
                    padding: 14,
                  }}
                >
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
                      <div style={{ fontWeight: 950, fontSize: 17 }}>
                        {event.title}
                      </div>


                      <div style={{ marginTop: 6, opacity: 0.8, fontWeight: 700 }}>
                        {String(event.date || "").slice(0, 10)} • {formatType(event.type)} • {formatLayout(event.layout)}
                      </div>


                      <div style={{ marginTop: 8, opacity: 0.9, fontWeight: 800 }}>
                        Payment: {formatPayment(event)}
                      </div>


                      {event.paymentNotes ? (
                        <div style={{ marginTop: 6, opacity: 0.8 }}>
                          {event.paymentNotes}
                        </div>
                      ) : null}


                      {event.description ? (
                        <div style={{ marginTop: 8, opacity: 0.9 }}>
                          {event.description}
                        </div>
                      ) : null}


                      <div style={{ marginTop: 8, opacity: 0.72, fontWeight: 700 }}>
                        Joined: {Array.isArray(event.joins) ? event.joins.length : 0}
                      </div>
                    </div>


                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={() => startEdit(event)}
                        style={buttonStyle(false)}
                      >
                        Edit
                      </button>


                      <button
                        type="button"
                        onClick={() => deleteEvent(event.id)}
                        style={buttonStyle(false)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>


                  {Array.isArray(event.joins) && event.joins.length > 0 ? (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontWeight: 900, marginBottom: 8 }}>
                        Joined Players
                      </div>


                      <div style={{ display: "grid", gap: 8 }}>
                        {event.joins.map((join) => (
                          <div
                            key={join.id}
                            style={{
                              padding: "10px 12px",
                              borderRadius: 10,
                              background: "rgba(255,255,255,0.05)",
                              fontWeight: 700,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 10,
                                flexWrap: "wrap",
                                alignItems: "center",
                              }}
                            >
                              <div>
                                {join.name} — {join.division}
                                <div style={{ marginTop: 4, opacity: 0.78, fontSize: 13 }}>
                                  {paymentBadge(join)}
                                </div>
                              </div>


                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                {join.paymentStatus !== "paid" && (
                                  <button
                                    type="button"
                                    style={smallButtonStyle("paid")}
                                    onClick={() => updateJoinPaymentStatus(join.id, "paid")}
                                  >
                                    Mark Paid
                                  </button>
                                )}


                                {join.paymentStatus !== "pending" && event.paymentType !== "free" && (
                                  <button
                                    type="button"
                                    style={smallButtonStyle("pending")}
                                    onClick={() => updateJoinPaymentStatus(join.id, "pending")}
                                  >
                                    Mark Pending
                                  </button>
                                )}


                                {event.paymentType === "free" && join.paymentStatus !== "not_required" && (
                                  <button
                                    type="button"
                                    style={smallButtonStyle("default")}
                                    onClick={() => updateJoinPaymentStatus(join.id, "not_required")}
                                  >
                                    No Payment Needed
                                  </button>
                                )}


                                <button
                                  type="button"
                                  style={smallButtonStyle("default")}
                                  onClick={() => removeJoin(join.id)}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
