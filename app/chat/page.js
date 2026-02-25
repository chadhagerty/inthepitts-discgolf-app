"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
export default function ChatPage() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState(null); // {ok:boolean,msg:string}
  const [sending, setSending] = useState(false);
  const pollRef = useRef(null);
  async function load() {
    try {
      const res = await fetch("/api/chat", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to load chat");
      setMessages(Array.isArray(data?.messages) ? data.messages : []);
    } catch (e) {
      setStatus({ ok: false, msg: e?.message || "Load failed" });
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
      await load(); // refresh after send
      setStatus({ ok: true, msg: "Sent ✅" });
    } catch (e) {
      setStatus({ ok: false, msg: e?.message || "Send failed" });
    } finally {
      setSending(false);
    }
  }
  useEffect(() => {
    // remember name on device
    const saved = localStorage.getItem("CHAT_NAME") || "";
    if (saved) setName(saved);
    load();
    pollRef.current = setInterval(load, 4000);
    return () => clearInterval(pollRef.current);
  }, []);
  useEffect(() => {
    localStorage.setItem("CHAT_NAME", name);
  }, [name]);
  return (
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <h1 style={{ margin: 0 }}>Course Chat</h1>
        <Link href="/" style={{ textDecoration: "underline" }}>
          ← Home
        </Link>
      </div>
      <p style={{ marginTop: 8, color: "#555" }}>
        Shared chat for everyone. Auto-refreshes every few seconds.
      </p>
      <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
        <div>
          <label style={{ fontWeight: 700 }}>Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Chad"
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 10,
              border: "1px solid #ccc",
              marginTop: 6,
            }}
          />
        </div>
        <div>
          <label style={{ fontWeight: 700 }}>Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            rows={3}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 10,
              border: "1px solid #ccc",
              marginTop: 6,
              resize: "vertical",
            }}
          />
        </div>
        <button
          onClick={send}
          disabled={sending}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 12,
            border: "1px solid #111",
            background: sending ? "#eee" : "#111",
            color: sending ? "#111" : "#fff",
            fontWeight: 900,
            cursor: sending ? "default" : "pointer",
          }}
        >
          {sending ? "Sending..." : "Send"}
        </button>
        {status && (
          <div
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid #ddd",
              background: status.ok ? "#ecfdf5" : "#fef2f2",
              color: status.ok ? "#065f46" : "#991b1b",
              fontWeight: 800,
            }}
          >
            {status.msg}
          </div>
        )}
      </div>
      <div style={{ marginTop: 18 }}>
        <button
          onClick={load}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #ccc",
            background: "#fff",
            fontWeight: 800,
          }}
        >
          Refresh
        </button>
      </div>
      <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
        {(messages || []).map((m) => (
          <div
            key={m.id}
            style={{
              border: "1px solid #e5e5e5",
              borderRadius: 12,
              padding: 12,
              background: "#fff",
            }}
          >
            <div style={{ fontWeight: 900 }}>{m.name}</div>
            <div style={{ marginTop: 6 }}>{m.message}</div>
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
              {m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div style={{ opacity: 0.7, marginTop: 8 }}>No messages yet.</div>
        )}
      </div>
    </main>
  );
}

