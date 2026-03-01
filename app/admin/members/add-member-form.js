"use client";

import { useEffect, useMemo, useState } from "react";

function toDatetimeLocal(dt) {
  const d = dt instanceof Date ? dt : new Date(dt);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

export default function AddMemberForm() {
  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [membership, setMembership] = useState("daypass");
  const [expiresAt, setExpiresAt] = useState(toDatetimeLocal(new Date()));
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("ADMIN_KEY") || "";
    if (saved) setKey(saved);
  }, []);

  const canSave = useMemo(() => key.trim() && name.trim(), [key, name]);

  async function createMember() {
    if (!canSave) return;
    setSaving(true);
    setStatus(null);

    try {
      localStorage.setItem("ADMIN_KEY", key);

      const res = await fetch("/api/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key.trim()}`,
        },
        body: JSON.stringify({
          name,
          email,
          membership,
          expiresAt: expiresAt || null,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Create failed");

      setStatus({ ok: true, msg: "Member created ✅ (refresh page)" });
      setName("");
      setEmail("");
    } catch (e) {
      setStatus({ ok: false, msg: e?.message || "Create failed" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.06)",
        borderRadius: 18,
        padding: 18,
        color: "#eafff2",
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: 12 }}>Add Member</h2>

      <div style={{ display: "grid", gap: 12 }}>
        <div>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Admin Key</div>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Paste ADMIN_KEY"
            autoComplete="off"
            name="admin_key_nope"
            spellCheck={false}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(0,0,0,0.18)",
              color: "#eafff2",
            }}
          />
        </div>

        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Name *</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(0,0,0,0.18)",
                color: "#eafff2",
              }}
            />
          </div>

          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Email</div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(0,0,0,0.18)",
                color: "#eafff2",
              }}
            />
          </div>

          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Membership</div>
            <select
              value={membership}
              onChange={(e) => setMembership(e.target.value)}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(0,0,0,0.18)",
                color: "#eafff2",
              }}
            >
              <option value="daypass">daypass</option>
              <option value="yearly">yearly</option>
            </select>
          </div>

          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Expires</div>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(0,0,0,0.18)",
                color: "#eafff2",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={createMember}
            disabled={!canSave || saving}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.18)",
              background: !canSave || saving ? "rgba(255,255,255,0.06)" : "rgba(34,197,94,0.25)",
              color: "#eafff2",
              fontWeight: 900,
            }}
          >
            {saving ? "Creating..." : "Create member"}
          </button>

          {status && (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.12)",
                background: status.ok ? "rgba(34,197,94,0.18)" : "rgba(239,68,68,0.18)",
                fontWeight: 900,
              }}
            >
              {status.msg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
