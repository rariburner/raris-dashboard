import { useState, useEffect } from "react";
import { getScripts, deleteScript, generateScript } from "./api.js";

const C = {
  bg: "#0D0D0D", card: "#161616", card2: "#1E1E1E",
  orange: "#FF6B00", green: "#00D084", purple: "#7C3AED", blue: "#3B82F6",
  text: "#FFFFFF", muted: "#888888", border: "rgba(255,255,255,0.07)",
  red: "#EF4444", yellow: "#EAB308",
};

const STATUS_COLORS = {
  "Draft": { bg: "#222", c: "#888" },
  "Ready": { bg: "#0F1E2A", c: "#60A5FA" },
  "Recorded": { bg: "#2D1B69", c: "#A78BFA" },
  "Posted": { bg: "#0F2A1A", c: "#00D084" },
};

function ScriptCard({ script, onDelete, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState(script.status || "Draft");
  const [rewriteInput, setRewriteInput] = useState("");
  const [rewriting, setRewriting] = useState(false);
  const [currentScript, setCurrentScript] = useState(script.script);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRewrite = () => {
    if (!rewriteInput.trim()) return;
    setRewriting(true);
    generateScript(script.hook, script.format, script.cta, rewriteInput, currentScript).then(d => {
      if (d.script) {
        setCurrentScript(d.script);
        onUpdate(script.id, d.script);
      }
      setRewriting(false);
      setRewriteInput("");
    }).catch(() => setRewriting(false));
  };

  const sc = STATUS_COLORS[status] || STATUS_COLORS["Draft"];
  const wordCount = currentScript.split(/\s+/).filter(Boolean).length;

  return (
    <div style={{ background: C.card2, borderRadius: 14, border: `1px solid ${C.border}`, marginBottom: 12, borderLeft: `3px solid ${C.orange}` }}>
      <div style={{ padding: "16px 18px", cursor: "pointer" }} onClick={() => setExpanded(!expanded)}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", lineHeight: 1.5, marginBottom: 8 }}>"{script.hook}"</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ background: C.orange + "22", color: C.orange, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5 }}>{script.format}</span>
              <span style={{ background: sc.bg, color: sc.c, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5 }}>{status}</span>
              <span style={{ fontSize: 11, color: C.muted }}>{wordCount} words</span>
              <span style={{ fontSize: 11, color: C.muted }}>·</span>
              <span style={{ fontSize: 11, color: C.muted }}>{new Date(script.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            <button onClick={e => { e.stopPropagation(); handleCopy(); }} style={{ background: copied ? C.green + "22" : C.card, border: `1px solid ${copied ? C.green : C.border}`, borderRadius: 8, padding: "6px 12px", color: copied ? C.green : C.muted, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              {copied ? "Copied!" : "Copy"}
            </button>
            <button onClick={e => { e.stopPropagation(); onDelete(script.id); }} style={{ background: "transparent", border: "none", color: C.red, fontSize: 16, cursor: "pointer", padding: "4px 8px" }}>×</button>
            <span style={{ color: C.muted, fontSize: 14 }}>{expanded ? "▲" : "▼"}</span>
          </div>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 14, color: "#fff", lineHeight: 1.8, whiteSpace: "pre-wrap", background: C.card, borderRadius: 10, padding: "16px", marginTop: 16, marginBottom: 16 }}>
            {currentScript}
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {["Draft", "Ready", "Recorded", "Posted"].map(s => (
              <button key={s} onClick={() => setStatus(s)} style={{ background: status === s ? STATUS_COLORS[s].bg : "transparent", border: `1px solid ${status === s ? STATUS_COLORS[s].c : C.border}`, borderRadius: 8, padding: "5px 12px", color: status === s ? STATUS_COLORS[s].c : C.muted, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                {s}
              </button>
            ))}
          </div>

          <div style={{ background: C.card, borderRadius: 12, padding: "14px 16px", border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, marginBottom: 8 }}>TELL SAKURA HOW TO CHANGE IT</div>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                value={rewriteInput}
                onChange={e => setRewriteInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleRewrite()}
                placeholder='e.g. "Make it more aggressive" or "Add the $400K story"'
                style={{ flex: 1, background: C.card2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 13, outline: "none" }}
              />
              <button onClick={handleRewrite} disabled={rewriting} style={{ background: rewriting ? "#333" : C.purple, border: "none", borderRadius: 8, padding: "10px 18px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: rewriting ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
                {rewriting ? "Rewriting..." : "✦ Rewrite"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Scripts() {
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    getScripts().then(data => {
      setScripts(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleDelete = (id) => {
    deleteScript(id).then(() => setScripts(prev => prev.filter(s => s.id !== id)));
  };

  const handleUpdate = (id, newScript) => {
    setScripts(prev => prev.map(s => s.id === id ? { ...s, script: newScript } : s));
  };

  const statuses = ["All", "Draft", "Ready", "Recorded", "Posted"];
  const filtered = filter === "All" ? scripts : scripts.filter(s => s.status === filter);

  const counts = { Draft: 0, Ready: 0, Recorded: 0, Posted: 0 };
  scripts.forEach(s => { if (counts[s.status] !== undefined) counts[s.status]++; });

  return (
    <div style={{ padding: "32px 32px 40px", overflowY: "auto", height: "100%", boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "#fff", margin: 0, letterSpacing: -0.5 }}>Scripts</h1>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{scripts.length} total · {counts.Draft} drafts · {counts.Ready} ready to record</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {Object.entries(counts).map(([s, c]) => (
          <div key={s} style={{ background: C.card, borderRadius: 10, padding: "10px 16px", border: `1px solid ${C.border}`, borderLeft: `3px solid ${STATUS_COLORS[s].c}` }}>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>{s}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{c}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ background: filter === s ? C.orange : C.card2, border: `1px solid ${filter === s ? C.orange : C.border}`, borderRadius: 8, padding: "7px 14px", color: filter === s ? "#fff" : C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            {s}
          </button>
        ))}
      </div>

      {loading && <div style={{ color: C.muted, textAlign: "center", padding: 40 }}>Loading scripts...</div>}
      {!loading && filtered.length === 0 && (
        <div style={{ color: C.muted, textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>✦</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>No scripts yet</div>
          <div style={{ fontSize: 13 }}>Click "Script →" on any idea in Today's Ideas or Ideas Bank to generate your first script.</div>
        </div>
      )}
      {filtered.map(script => (
        <ScriptCard key={script.id} script={script} onDelete={handleDelete} onUpdate={handleUpdate} />
      ))}
    </div>
  );
}
