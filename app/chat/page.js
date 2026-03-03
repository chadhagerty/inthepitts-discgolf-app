"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";

function Badge({ children }) {
  return (
    <span
      className="itp-badgeMuted"
      style={{
        background: "rgba(245,158,11,0.14)",
        borderColor: "rgba(0,0,0,0.12)",
      }}
    >
      {children}
    </span>
  );
}

export default function ChatPage() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState(null); // { ok:boolean, msg:string }
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const pollRef = useRef(null);
  const endRef = useRef(null);

  async function load({ silent = false } = {}) {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/chat", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to load chat");

      const list = Array.isArray(data?.messages) ? data.messages : [];
      setMessages(list);
      if (!silent) setStatus(null);
    } catch (e) {
      if (!silent) setStatus({ ok: false, msg: e?.message || "Load failed" });
    } finally {
      if (!silent) setLoading(false);
    }
  }

  async function send() {
    const cleanName = (name || "").trim();
    const cleanMsg = (message || "").trim();

    if (!cleanName || !cleanMsg) {
      setStatus({ ok: false, msg: "Enter a name and a message." });
      return;
    }

    setSending(true);
    setStatus(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cleanName, message: cleanMsg }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Send failed");

      setMessage("");
      await load({ silent: true });
      setStatus({ ok: true, msg: "Sent ✅" });

      // scroll to latest after sending
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (e) {
      setStatus({ ok: false, msg: e?.message || "Send failed" });
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem("CHAT_NAME") || "";
    if (saved) setName(saved);

    load();
    pollRef.current = setInterval(() => load({ silent: true }), 4000);

    return () => clearInterval(pollRef.current);
  }, []);

  useEffect(() => {
    localStorage.setItem("CHAT_NAME", name);
  }, [name]);

  useEffect(() => {
    // auto-scroll when new messages arrive (but not on first mount if empty)
    if (messages.length > 0) {
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [messages.length]);

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
                Course Chat
              </h1>
              <div className="itp-subtitle">Shared chat for everyone (auto-refresh)</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/" className="itp-link">
              ← Home
            </Link>
            <button
              type="button"
              onClick={() => load()}
              className="itp-btnSecondary"
              disabled={sending}
              title="Refresh messages"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="itp-badgesRow">
          <Badge>💬 Public</Badge>
          <Badge>🔄 Updates every 4s</Badge>
          <Badge>📝 Name saved on device</Badge>
        </div>

        {/* Composer */}
        <div className="itp-panel">
          <div className="itp-formGrid" style={{ marginTop: 0 }}>
            <div className="itp-field">
              <label className="itp-label">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Chad"
                className="itp-input"
                autoComplete="nickname"
              />
            </div>

            <div className="itp-field">
              <label className="itp-label">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                rows={3}
                className="itp-input"
                style={{ resize: "vertical" }}
              />
              <div className="itp-muted" style={{ marginTop: 6 }}>
                Tip: keep it course-friendly 😄🥏
              </div>
            </div>

            <button
              type="button"
              onClick={send}
              disabled={sending}
              className={`itp-btn ${sending ? "isDisabled" : ""}`}
              style={{ maxWidth: 420 }}
            >
              {sending ? "Sending..." : "Send"}
            </button>

            {status && (
              <div className={`itp-alert ${status.ok ? "ok" : "bad"}`}>
                {status.ok ? status.msg : `❌ ${status.msg}`}
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="itp-panel">
          <div className="itp-headerRow" style={{ alignItems: "center" }}>
            <h3 className="itp-sectionTitle" style={{ margin: 0 }}>
              Messages
            </h3>
            <div className="itp-muted">
              {loading ? "Loading…" : `${messages.length} total`}
            </div>
          </div>

          {loading ? (
            <p className="itp-muted" style={{ marginTop: 10 }}>
              Loading…
            </p>
          ) : messages.length === 0 ? (
            <p className="itp-muted" style={{ marginTop: 10 }}>
              No messages yet.
            </p>
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
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ fontWeight: 1000 }}>{m.name}</div>
                    <div className="itp-muted" style={{ fontSize: 12, whiteSpace: "nowrap" }}>
                      {m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}
                    </div>
                  </div>

                  <div style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{m.message}</div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="itp-footerRow">
          <Link href="/" className="itp-link">
            ← Home
          </Link>
        </div>
      </div>
    </main>
  );
}
