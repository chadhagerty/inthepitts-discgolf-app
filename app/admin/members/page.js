"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function fmtDate(d) {
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return "";
  }
}

function isExpired(expiresAt) {
  try {
    return new Date(expiresAt).getTime() < Date.now();
  } catch {
    return false;
  }
}

export default function AdminMembersPage() {
  const [key, setKey] = useState("");
  const [q, setQ] = useState("");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null); // { ok, text }

  // Create form
  const [newName, setNewName] = useState("");
  const [newExpiry, setNewExpiry] = useState(""); // YYYY-MM-DD

  useEffect(() => {
    const saved = localStorage.getItem("ADMIN_KEY") || "";
    if (saved) setKey(saved);
  }, []);

  async function apiFetch(path, options = {}) {
    const headers = {
      ...(options.headers || {}),
      Authorization: key.trim(), // API accepts raw OR Bearer
      "Content-Type": "application/json",
    };
    return fetch(path, { ...options, headers });
  }

  async function load() {
    setLoading(true);
    setMsg(null);
    try {
      localStorage.setItem("ADMIN_KEY", key);
      const res = await apiFetch(`/api/members?q=${encodeURIComponent(q.trim())}`, { method: "GET" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.ok === false) {
        setMembers([]);
        setMsg({ ok: false, text: json?.error || "unauthorized" });
        return;
      }
      setMembers(json.members || []);
    } catch (e) {
      setMsg({ ok: false, text: "network-error" });
    } finally {
      setLoading(false);
    }
  }

  async function createMember() {
    setLoading(true);
    setMsg(null);
    try {
      localStorage.setItem("ADMIN_KEY", key);
      const res = await apiFetch("/api/members", {
        method: "POST",
        body: JSON.stringify({ name: newName.trim(), expiresAt: newExpiry.trim() || undefined }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.ok === false) {
        setMsg({ ok: false, text: json?.error || "error" });
        return;
      }
      setMsg({ ok: true, text: `Created: ${json.member?.name}` });
      setNewName("");
      setNewExpiry("");
      await load();
    } catch {
      setMsg({ ok: false, text: "network-error" });
    } finally {
      setLoading(false);
    }
  }

  async function updateMember(id, action) {
    setLoading(true);
    setMsg(null);
    try {
      localStorage.setItem("ADMIN_KEY", key);
      const res = await apiFetch("/api/members", {
        method: "PATCH",
        body: JSON.stringify({ id, action }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json?.ok === false) {
        setMsg({ ok: false, text: json?.error || "error" });
        return;
      }
      setMsg({ ok: true, text: `Updated: ${json.member?.name}` });
      await load();
    } catch {
      setMsg({ ok: false, text: "network-error" });
    } finally {
      setLoading(false);
    }
  }

  const canUse = key.trim().length > 0;

  return (
    <main style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <h1>Admin: Members</h1>

      <div style={{ marginTop: 8, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/admin/checkins" style={{ textDecoration: "underline" }}>
          ← Check-ins
        </Link>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <label style={{ display: "block", marginBottom: 6 }}>Admin Key (paste exactly)</label>
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="chad-super-secret-2026-01"
          style={{ padding: "0.5rem", width: "100%", maxWidth: 420 }}
        />
      </div>

      <hr style={{ margin: "1.5rem 0" }} />

      <h2 style={{ marginBottom: 8 }}>Create Member</h2>
      <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Member name (exact)"
          style={{ padding: "0.5rem" }}
        />
        <input
          value={newExpiry}
          onChange={(e) => setNewExpiry(e.target.value)}
          placeholder="Expiry (YYYY-MM-DD) optional"
          style={{ padding: "0.5rem" }}
        />
        <button
          onClick={createMember}
          disabled={loading || !canUse || !newName.trim()}
          style={{ width: "fit-content" }}
        >
          {loading ? "Working..." : "Create"}
        </button>
      </div>

      <hr style={{ margin: "1.5rem 0" }} />

      <h2 style={{ marginBottom: 8 }}>Search / Manage</h2>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name (optional)"
          style={{ padding: "0.5rem", width: "100%", maxWidth: 420 }}
        />
        <button onClick={load} disabled={loading || !canUse}>
          {loading ? "Loading..." : "Load"}
        </button>
      </div>

      {msg && (
        <p style={{ marginTop: 12, color: msg.ok ? "green" : "red" }}>
          {msg.ok ? "✅ " : "❌ "}
          {msg.text}
        </p>
      )}

      <div style={{ marginTop: 18 }}>
        <p>
          <strong>Total:</strong> {members.length}
        </p>

        <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
          {members.map((m) => (
            <div
              key={m.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 12,
                display: "grid",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ fontWeight: 700 }}>{m.name}</div>
                <div style={{ opacity: 0.85 }}>
                  Expires: <strong>{fmtDate(m.expiresAt)}</strong>{" "}
                  {isExpired(m.expiresAt) ? <span style={{ color: "red" }}>(expired)</span> : null}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={() => updateMember(m.id, "renew")} disabled={loading || !canUse}>
                  Renew +1 year
                </button>
                <button onClick={() => updateMember(m.id, "expire")} disabled={loading || !canUse}>
                  Expire now
                </button>
              </div>
            </div>
          ))}

          {members.length === 0 && <p style={{ opacity: 0.8 }}>No members found.</p>}
        </div>
      </div>
    </main>
  );
}
