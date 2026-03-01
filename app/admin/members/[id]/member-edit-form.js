"use client";

import { useEffect, useMemo, useState } from "react";

export default function MemberEditForm({ initial }) {
  const [key, setKey] = useState("");
  const [name, setName] = useState(initial.name);
  const [membership, setMembership] = useState(initial.membership);
  const [expiresAt, setExpiresAt] = useState(initial.expiresAt);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("ADMIN_KEY") || "";
    if (saved) setKey(saved);
  }, []);

  const canSave = useMemo(() => key.trim().length > 0, [key]);

  function addDays(days) {
    const base = expiresAt ? new Date(expiresAt) : new Date();
    base.setDate(base.getDate() + days);
    const pad = (n) => String(n).padStart(2, "0");
    const yyyy = base.getFullYear();
    const mm = pad(base.getMonth() + 1);
    const dd = pad(base.getDate());
    const hh = pad(base.getHours());
    const mi = pad(base.getMinutes());
    setExpiresAt(`${yyyy}-${mm}-${dd}T${hh}:${mi}`);
  }

  async function save() {
    if (!canSave) return;
    setSaving(true);
    setStatus(null);

    try {
      localStorage.setItem("ADMIN_KEY", key);

      const res = await fetch(`/api/members/${initial.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key.trim()}`,
        },
        body: JSON.stringify({
          name,
          membership,
          expiresAt: expiresAt || null,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Save failed");
      setStatus({ ok: true, msg: "Saved ✅" });
    } catch (e) {
      setStatus({ ok: false, msg: e?.message || "Save failed" });
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
        boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
        color: "#eafff2",
      }}
    >
      <div style={{ display: "grid", gap: 12 }}>
        <div>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>Admin Key (required to save)</div>
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
              outline: "none",
            }}
          />
        </div>

        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          <div>
            <div style={{ fontWeight: 900, marginBottom: 6 }}>Name</div>
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
            <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => addDays(1)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(255,255,255,0.08)",
                  color: "#eafff2",
                  fontWeight: 900,
                }}
              >
                +1 day
              </button>
              <button
                type="button"
                onClick={() => addDays(365)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(255,255,255,0.08)",
                  color: "#eafff2",
                  fontWeight: 900,
                }}
              >
                +1 year
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={save}
            disabled={!canSave || saving}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.18)",
              background: !canSave || saving ? "rgba(255,255,255,0.06)" : "rgba(34,197,94,0.25)",
              color: "#eafff2",
              fontWeight: 900,
              cursor: !canSave || saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving..." : "Save"}
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
