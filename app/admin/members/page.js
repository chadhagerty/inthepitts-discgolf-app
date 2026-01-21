"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminMembersPage() {
  const [key, setKey] = useState("");
  const [data, setData] = useState(null); // { ok, count, members } or { ok:false, error }
  const [loading, setLoading] = useState(false);

  const [newName, setNewName] = useState("");
  const [newMembership, setNewMembership] = useState("yearly");
  const [newExpiresAt, setNewExpiresAt] = useState(""); // optional ISO string

  useEffect(() => {
    const saved = localStorage.getItem("ADMIN_KEY") || "";
    if (saved) setKey(saved);
  }, []);

  async function load() {
    setLoading(true);
    setData(null);

    try {
      const res = await fetch("/api/members", {
        headers: { Authorization: `Bearer ${key}` },
      });

      const json = await res.json().catch(() => ({}));
      setData(json);
      localStorage.setItem("ADMIN_KEY", key);
    } catch {
      setData({ ok: false, error: "network-error" });
    } finally {
      setLoading(false);
    }
  }

  async function addMember() {
    if (!newName.trim()) return;

    setLoading(true);

    try {
      const payload = {
        name: newName.trim(),
        membership: newMembership,
      };

      if (newExpiresAt.trim()) {
        payload.expiresAt = newExpiresAt.trim();
      }

      const res = await fetch("/api/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || json?.ok === false) {
        setData(json?.ok === false ? json : { ok: false, error: "error" });
        return;
      }

      setNewName("");
      setNewMembership("yearly");
      setNewExpiresAt("");
      await load();
    } catch {
      setData({ ok: false, error: "network-error" });
    } finally {
      setLoading(false);
    }
  }

  async function deleteMember(id) {
    if (!confirm("Delete this member?")) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/members?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${key}` },
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || json?.ok === false) {
        setData(json?.ok === false ? json : { ok: false, error: "error" });
        return;
      }

      await load();
    } catch {
      setData({ ok: false, error: "network-error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <h1>Admin: Members</h1>

      <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/admin/checkins" style={{ textDecoration: "underline" }}>
          Check-ins
        </Link>
        <Link href="/" style={{ textDecoration: "underline" }}>
          Home
        </Link>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <label style={{ display: "block", marginBottom: 6 }}>
          Admin Key (paste exactly)
        </label>
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="chad-super-secret-2026-01"
          style={{ padding: "0.5rem", width: "100%", maxWidth: 420 }}
        />
        <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={load} disabled={loading || !key.trim()}>
            {loading ? "Loading..." : "Load members"}
          </button>
        </div>
      </div>

      <hr style={{ margin: "1.5rem 0" }} />

      <h2 style={{ marginBottom: 8 }}>Add member</h2>
      <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Full name"
          style={{ padding: "0.5rem" }}
        />

        <select
          value={newMembership}
          onChange={(e) => setNewMembership(e.target.value)}
          style={{ padding: "0.5rem" }}
        >
          <option value="yearly">yearly</option>
          <option value="daypass">daypass</option>
        </select>

        <input
          value={newExpiresAt}
          onChange={(e) => setNewExpiresAt(e.target.value)}
          placeholder='ExpiresAt (optional ISO) e.g. 2027-01-01T00:00:00.000Z'
          style={{ padding: "0.5rem" }}
        />

        <button
          onClick={addMember}
          disabled={loading || !key.trim() || !newName.trim()}
        >
          {loading ? "Working..." : "Add member"}
        </button>

        <p style={{ opacity: 0.8, margin: 0 }}>
          Leave expires blank to default to 1 year from today.
        </p>
      </div>

      {data?.ok === false && (
        <p style={{ color: "red", marginTop: "1rem" }}>
          ❌ {data?.error || "unauthorized"}
        </p>
      )}

      {data?.ok && (
        <div style={{ marginTop: "1.5rem" }}>
          <p>
            <strong>Total:</strong> {data.count}
          </p>

          <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
            {(data.members || []).map((m) => (
              <div
                key={m.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{m.name}</div>
                  <div style={{ opacity: 0.8, fontSize: 14 }}>
                    {m.membership || "—"} • expires{" "}
                    {m.expiresAt ? new Date(m.expiresAt).toLocaleDateString() : "—"}
                  </div>
                </div>

                <button onClick={() => deleteMember(m.id)} disabled={loading}>
                  Delete
                </button>
              </div>
            ))}

            {data.count === 0 && <p style={{ opacity: 0.8 }}>No members yet.</p>}
          </div>
        </div>
      )}
    </main>
  );
}
