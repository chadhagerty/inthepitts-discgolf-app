"use client";


import { useEffect, useState } from "react";
import Link from "next/link";


export const dynamic = "force-dynamic";


function Badge({ children }) {
  return (
    <span
      className="itp-badgeMuted"
      style={{ background: "rgba(245,158,11,0.14)", borderColor: "rgba(0,0,0,0.12)" }}
    >
      {children}
    </span>
  );
}


export default function AdminChatPage() {
  const [key, setKey] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");


  const authed = key.trim().length > 0;


  async function load({ silent = false } = {}) {
  setErr("");
  setOkMsg("");
  if (!silent) setLoading(true);


  try {
    const res = await fetch("/api/chat", { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Failed to load chat");
    setMessages(Array.isArray(data?.messages) ? data.messages : []);
  } catch (e) {
    setMessages([]);
    setErr(e?.message || "Load failed");
  } finally {
    if (!silent) setLoading(false);
  }
}



  useEffect(() => {
    load();
  }, []);


async function del(id) {
  try {
    if (!authed) {
      setErr("Paste ADMIN_KEY first.");
      return;
    }


    const cleanId = String(id || "").trim();
    if (!cleanId) {
      setErr("missing-id");
      return;
    }


    if (!confirm("Delete this message?")) return;


    setErr("");
    setOkMsg("");
    setWorkingId(cleanId);


    const res = await fetch(`/api/chat/${cleanId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${key.trim()}` },
    });


    const data = await res.json().catch(() => ({}));


    if (!res.ok || !data?.ok) {
      throw new Error(data?.error || `Delete failed (${res.status})`);
    }


    setOkMsg("Deleted ✅");
    await load();
  } catch (e) {
    setErr(e?.message || "Delete failed");
  } finally {
    setWorkingId(null);
  }
}




  async function clearAll() {
    if (!authed) return setErr("Paste ADMIN_KEY first.");
    if (!confirm("DELETE ALL CHAT MESSAGES? This cannot be undone.")) return;


    setWorkingId("CLEAR_ALL");
    setErr("");
    setOkMsg("");


    try {
      const res = await fetch(`/api/chat/clear`, {
        method: "POST",
        headers: { Authorization: `Bearer ${key.trim()}` },
      });


      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Clear failed");


      setOkMsg(`Cleared ✅ (${data.deleted || 0} deleted)`);
      await load();
    } catch (e) {
      setErr(e?.message || "Clear failed");
    } finally {
      setWorkingId(null);
    }
  }


  return (
    <main className="itp-page">
      <div className="itp-card itp-cardWide">
        {/* Header */}
        <div className="itp-headerRow">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img
              src="/logo.png"
              alt="In The Pitts"
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                border: "1px solid rgba(0,0,0,0.12)",
                background: "white",
              }}
            />
            <div>
              <h1 className="itp-title" style={{ margin: 0 }}>
                Admin: Chat
              </h1>
              <div className="itp-subtitle">Delete messages + keep it course-friendly</div>
            </div>
          </div>


          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/admin" className="itp-link">
              ← Admin HQ
            </Link>
            <Link href="/" className="itp-link">
              Home
            </Link>
          </div>
        </div>


        <div className="itp-badgesRow">
          <Badge>🔐 ADMIN_KEY required</Badge>
          <Badge>💬 Public chat moderation</Badge>
        </div>


        {/* Controls */}
        <div className="itp-panel">
          <div className="itp-field">
            <label className="itp-label">Admin Key</label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Paste ADMIN_KEY"
              autoComplete="new-password"
              name="nope"
              spellCheck={false}
              className="itp-input"
              style={{ maxWidth: 520 }}
            />
            <div className="itp-muted" style={{ marginTop: 8 }}>
              For privacy, we’re NOT saving this on the device.
            </div>
          </div>


          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
            <button type="button" onClick={load} className="itp-btnSecondary" disabled={loading || workingId}>
              {loading ? "Loading…" : "Refresh"}
            </button>


            <button
              type="button"
              onClick={clearAll}
              className={`itp-btnSecondary ${!authed || workingId ? "isDisabled" : ""}`}
              disabled={!authed || !!workingId}
              title="Delete ALL chat messages"
            >
              🧹 Clear All
            </button>


            <Link href="/chat" className="itp-link">
              View Public Chat →
            </Link>
          </div>


          {okMsg && <div className="itp-alert ok" style={{ marginTop: 12 }}>{okMsg}</div>}
          {err && <div className="itp-alert bad" style={{ marginTop: 12 }}>❌ {err}</div>}
        </div>


        {/* List */}
        <div className="itp-panel">
          <div className="itp-headerRow" style={{ alignItems: "center" }}>
            <h3 className="itp-sectionTitle" style={{ margin: 0 }}>
              Messages
            </h3>
            <div className="itp-muted">{loading ? "Loading…" : `${messages.length} total`}</div>
          </div>


          {loading ? (
            <p className="itp-muted" style={{ marginTop: 10 }}>Loading…</p>
          ) : messages.length === 0 ? (
            <p className="itp-muted" style={{ marginTop: 10 }}>No messages yet.</p>
          ) : (
            <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
              {messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderRadius: 14,
                    padding: 12,
                    background: "rgba(255,255,255,0.85)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
                    <div>
                      <div style={{ fontWeight: 1000 }}>{m.name}</div>
                      <div className="itp-muted" style={{ fontSize: 12, marginTop: 2 }}>
                        {m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}
                      </div>
                    </div>


                    <button
                      type="button"
                      className="itp-btnSecondary"
                      onClick={() => del(m.id)}
                      disabled={!authed || workingId === m.id}
                      title={!authed ? "Paste ADMIN_KEY first" : "Delete message"}
                    >
                      {workingId === m.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>


                  <div style={{ marginTop: 10, whiteSpace: "pre-wrap" }}>{m.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>


        <div className="itp-footerRow">
          <Link href="/admin" className="itp-link">← Admin HQ</Link>
        </div>
      </div>
    </main>
  );
}
