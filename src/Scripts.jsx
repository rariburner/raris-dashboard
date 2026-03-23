import { useState, useEffect } from "react";
import { getScripts, deleteScript, generateScript } from "./api.js";

const C = {
  bg: "#0D0D0D", card: "#161616", card2: "#1E1E1E",
  orange: "#FF6B00", green: "#00D084", purple: "#7C3AED", blue: "#3B82F6",
  text: "#FFFFFF", muted: "#888888", border: "rgba(255,255,255,0.07)", red: "#EF4444",
};

const STATUSES = ["Draft", "Ready", "Recorded", "Posted"];
const STATUS_COLORS = {
  "Draft":    { bg: "#2A2A2A", c: "#888888" },
  "Ready":    { bg: "#0F1E2A", c: "#60A5FA" },
  "Recorded": { bg: "#2D1B69", c: "#A78BFA" },
  "Posted":   { bg: "#0F2A1A", c: "#00D084" },
};

const AI_ACTIONS = [
  { label: "Improve writing", icon: "✦" },
  { label: "Make shorter", icon: "↓" },
  { label: "Make longer", icon: "↑" },
  { label: "More convicted", icon: "⚡" },
  { label: "More casual", icon: "~" },
  { label: "Add my $400K story", icon: "💰" },
  { label: "Sharpen the hook", icon: "🎯" },
  { label: "Fix grammar", icon: "✓" },
];

const FONT = "-apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif";

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#1A1A1A", borderRadius: 18, padding: "36px", width: 380, border: "1px solid rgba(255,255,255,0.1)", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 24 }}>🗑️</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 10 }}>Delete Scripts?</div>
        <div style={{ fontSize: 14, color: C.muted, marginBottom: 28, lineHeight: 1.6 }}>{message}</div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={onCancel} style={{ background: "#222", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 24px", color: "#fff", fontSize: 14, cursor: "pointer" }}>Cancel</button>
          <button onClick={onConfirm} style={{ background: C.red, border: "none", borderRadius: 10, padding: "11px 24px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function StatusSlider({ status, onChange }) {
  const idx = STATUSES.indexOf(status);
  const sc = STATUS_COLORS[status] || STATUS_COLORS["Draft"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: 0.5 }}>STATUS</span>
      <div style={{ position: "relative", display: "flex", background: "#111", borderRadius: 10, padding: 3, border: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ position: "absolute", top: 3, left: "calc(" + (idx * 25) + "% + 3px)", width: "calc(25% - 6px)", height: "calc(100% - 6px)", background: sc.bg, border: "1px solid " + sc.c, borderRadius: 8, transition: "left 0.25s cubic-bezier(0.4,0,0.2,1), background 0.25s, border-color 0.25s", boxShadow: "0 0 12px " + sc.c + "44" }} />
        {STATUSES.map((s) => (
          <button key={s} onClick={() => onChange(s)} style={{ position: "relative", zIndex: 1, background: "transparent", border: "none", padding: "6px 16px", color: status === s ? sc.c : C.muted, fontSize: 12, fontWeight: status === s ? 700 : 400, cursor: "pointer", borderRadius: 7, transition: "color 0.2s", whiteSpace: "nowrap", fontFamily: FONT }}>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function AIContextMenu({ x, y, onAction, onClose }) {
  const [customPrompt, setCustomPrompt] = useState("");
  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 9998 }} onClick={onClose} />
      <div style={{ position: "fixed", left: Math.min(x, window.innerWidth - 280), top: Math.min(y, window.innerHeight - 420), background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: "10px", width: 270, zIndex: 9999, boxShadow: "0 24px 64px rgba(0,0,0,0.9)" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 8, padding: "2px" }}>
          <input value={customPrompt} onChange={e => setCustomPrompt(e.target.value)} onKeyDown={e => { if(e.key === "Enter" && customPrompt.trim()) { onAction("custom: " + customPrompt); onClose(); }}} placeholder="Ask Sakura what to do..." style={{ flex: 1, background: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 10px", color: "#fff", fontSize: 12, outline: "none", fontFamily: FONT }} autoFocus />
          <button onClick={() => { if(customPrompt.trim()) { onAction("custom: " + customPrompt); onClose(); }}} style={{ background: C.orange, border: "none", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 14, cursor: "pointer" }}>↑</button>
        </div>
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "6px 0" }} />
        <div style={{ fontSize: 10, color: "#555", padding: "4px 8px", fontWeight: 700, letterSpacing: 0.8 }}>EDIT SELECTION</div>
        {AI_ACTIONS.map(action => (
          <button key={action.label} onClick={() => { onAction(action.label); onClose(); }}
            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", background: "transparent", border: "none", padding: "9px 10px", color: "#ccc", fontSize: 13, cursor: "pointer", borderRadius: 8, textAlign: "left", fontFamily: FONT }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#ccc"; }}>
            <span style={{ fontSize: 13, width: 20, textAlign: "center" }}>{action.icon}</span>
            {action.label}
          </button>
        ))}
      </div>
    </>
  );
}

function ScriptEditor({ script, onClose, onSave, onDelete }) {
  const [sections, setSections] = useState(() => {
    const text = script.script || "";
    const lines = text.split("\n").filter(Boolean);
    const hookEnd = Math.min(2, lines.length);
    const ctaStart = Math.max(lines.length - 1, hookEnd);
    return {
      hook: lines.slice(0, hookEnd).join("\n"),
      body: lines.slice(hookEnd, ctaStart).join("\n"),
      cta: lines.slice(ctaStart).join("\n"),
    };
  });
  const [status, setStatus] = useState(script.status || "Draft");
  const [notes, setNotes] = useState(script.notes || "");
  const [contextMenu, setContextMenu] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  const fullScript = [sections.hook, sections.body, sections.cta].filter(Boolean).join("\n\n");
  const wordCount = fullScript.split(/\s+/).filter(Boolean).length;

  const handleContextMenu = (section) => (e) => {
    const selected = window.getSelection()?.toString()?.trim();
    if (selected && selected.length > 3) {
      e.preventDefault();
      setActiveSection(section);
      setContextMenu({ x: e.clientX, y: e.clientY, selected });
    }
  };

  const handleAIAction = async (action) => {
    if (!contextMenu?.selected) return;
    setLoading(true);
    try {
      const prompt = action.startsWith("custom:") ? action.replace("custom:", "").trim() : action;
      const res = await generateScript(contextMenu.selected, "edit", "", prompt + ' this text: "' + contextMenu.selected + '"', contextMenu.selected);
      if (res.script) {
        setHistory(h => [...h, { ...sections }]);
        setSections(prev => ({ ...prev, [activeSection]: prev[activeSection].replace(contextMenu.selected, res.script) }));
      }
    } catch(e) {}
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fullScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ta = {
    width: "100%", background: "#141414", border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 10, padding: "16px", color: "#e8e8e8",
    fontFamily: FONT, fontSize: 14, lineHeight: 1.8,
    resize: "none", outline: "none", boxSizing: "border-box",
  };

  const sectionLabel = (label, color) => (
    <div style={{ fontSize: 10, color, fontWeight: 800, marginBottom: 8, letterSpacing: 1.5, display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 3, height: 14, background: color, borderRadius: 2 }} />
      {label}
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      {contextMenu && <AIContextMenu x={contextMenu.x} y={contextMenu.y} onAction={handleAIAction} onClose={() => setContextMenu(null)} />}
      <div style={{ background: "#141414", borderRadius: 20, width: 780, maxWidth: "96vw", maxHeight: "92vh", overflow: "hidden", display: "flex", flexDirection: "column", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 40px 100px rgba(0,0,0,0.9)" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "22px 28px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#161616" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 18 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: C.orange, fontWeight: 800, letterSpacing: 1.5, marginBottom: 6 }}>{(script.format || "").toUpperCase()}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", lineHeight: 1.5, maxWidth: 560, fontFamily: FONT }}>"{script.hook}"</div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 11, color: "#555", background: "#1E1E1E", padding: "4px 10px", borderRadius: 6 }}>{wordCount} words</span>
              {history.length > 0 && <button onClick={() => { setSections(history[history.length-1]); setHistory(h => h.slice(0,-1)); }} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 12px", color: "#aaa", fontSize: 11, cursor: "pointer", fontFamily: FONT }}>↩ Undo</button>}
              <button onClick={handleCopy} style={{ background: copied ? "rgba(0,208,132,0.12)" : "rgba(255,255,255,0.06)", border: "1px solid " + (copied ? C.green : "rgba(255,255,255,0.08)"), borderRadius: 8, padding: "6px 14px", color: copied ? C.green : "#aaa", fontSize: 11, cursor: "pointer", fontFamily: FONT }}>{copied ? "✓ Copied" : "Copy"}</button>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, width: 32, height: 32, color: "#666", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
          </div>
          <StatusSlider status={status} onChange={(s) => { setStatus(s); onSave(script.id, fullScript, s); }} />
          {loading && <div style={{ fontSize: 11, color: C.purple, marginTop: 10 }}>✦ Sakura is rewriting...</div>}
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20, scrollbarWidth: "thin", scrollbarColor: "#333 #111" }}>
          <div style={{ fontSize: 11, color: "#444", marginBottom: -8 }}>Select any text then right-click to get AI suggestions from Sakura</div>
          <div>
            {sectionLabel("PART 1 — HOOK", C.orange)}
            <textarea value={sections.hook} onChange={e => setSections(p => ({...p, hook: e.target.value}))} onContextMenu={handleContextMenu("hook")} style={{...ta, minHeight: 90}} rows={3} />
          </div>
          <div>
            {sectionLabel("PART 2 — BODY", "#aaa")}
            <textarea value={sections.body} onChange={e => setSections(p => ({...p, body: e.target.value}))} onContextMenu={handleContextMenu("body")} style={{...ta, minHeight: 220}} rows={9} />
          </div>
          <div>
            {sectionLabel("PART 3 — CTA", C.green)}
            <textarea value={sections.cta} onChange={e => setSections(p => ({...p, cta: e.target.value}))} onContextMenu={handleContextMenu("cta")} style={{...ta, minHeight: 70}} rows={2} />
          </div>
          <div>
            {sectionLabel("FILMING NOTES", "#555")}
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="B-roll ideas, wardrobe, visual direction, location..." style={{...ta, minHeight: 60, color: "#666"}} rows={2} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, padding: "18px 28px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "#161616", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => { onDelete(script.id); onClose(); }} style={{ background: "transparent", border: "none", color: "rgba(239,68,68,0.6)", fontSize: 13, cursor: "pointer", fontFamily: FONT }}>Delete Script</button>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ background: "#1E1E1E", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "11px 22px", color: C.muted, fontSize: 13, cursor: "pointer", fontFamily: FONT }}>Cancel</button>
            <button onClick={() => { onSave(script.id, fullScript, status); onClose(); }} style={{ background: C.orange, border: "none", borderRadius: 10, padding: "11px 26px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Scripts() {
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(new Set());
  const [editingScript, setEditingScript] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    getScripts().then(data => { setScripts(Array.isArray(data) ? data : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleDelete = (id) => {
    deleteScript(id).then(() => setScripts(prev => prev.filter(s => s.id !== id)));
  };

  const handleBulkDelete = () => {
    const ids = Array.from(selected);
    Promise.all(ids.map(id => deleteScript(id))).then(() => {
      setScripts(prev => prev.filter(s => !selected.has(s.id)));
      setSelected(new Set());
      setConfirmDelete(null);
    });
  };

  const handleUpdate = (id, newScript, newStatus) => {
    setScripts(prev => prev.map(s => s.id === id ? { ...s, script: newScript, ...(newStatus ? { status: newStatus } : {}) } : s));
  };

  const toggleSelect = (id) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const exportDoc = () => {
    const sel = scripts.filter(s => selected.has(s.id));
    const date = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    let content = "MIKE RARI SCRIPTS\nGenerated: " + date + "\n" + "─".repeat(40) + "\n\n";
    sel.forEach((s, i) => { content += "SCRIPT " + (i+1) + " — " + s.format + "\nHook: " + s.hook + "\nCTA: " + s.cta + "\nStatus: " + s.status + "\n\n" + s.script + "\n\n" + "─".repeat(40) + "\n\n"; });
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Mike Rari Scripts — " + date + " — " + sel.length + " Scripts.txt";
    a.click();
    URL.revokeObjectURL(url);
    setSelected(new Set());
  };

  const statuses = ["All", "Draft", "Ready", "Recorded", "Posted"];
  const filtered = filter === "All" ? scripts : scripts.filter(s => s.status === filter);
  const counts = { Draft: 0, Ready: 0, Recorded: 0, Posted: 0 };
  scripts.forEach(s => { if (counts[s.status] !== undefined) counts[s.status]++; });

  return (
    <div style={{ padding: "32px 32px 40px", overflowY: "auto", height: "100%", boxSizing: "border-box", fontFamily: FONT }}>
      {confirmDelete && <ConfirmDialog message={confirmDelete} onConfirm={handleBulkDelete} onCancel={() => setConfirmDelete(null)} />}
      {editingScript && <ScriptEditor script={editingScript} onClose={() => setEditingScript(null)} onSave={handleUpdate} onDelete={handleDelete} />}

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "#fff", margin: 0 }}>Scripts</h1>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{scripts.length} total · {counts.Draft} drafts · {counts.Ready} ready to record</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {selected.size > 0 && (
            <>
              <span style={{ fontSize: 13, color: C.muted }}>{selected.size} selected</span>
              <button onClick={exportDoc} style={{ background: C.green, border: "none", borderRadius: 8, padding: "9px 18px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>Export to Doc</button>
              <button onClick={() => setConfirmDelete("Are you sure you want to delete " + selected.size + " script" + (selected.size > 1 ? "s" : "") + "? This cannot be undone.")} style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "9px 14px", color: C.red, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>× Delete</button>
              <button onClick={() => setSelected(new Set())} style={{ background: C.card2, border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "9px 14px", color: C.muted, fontSize: 13, cursor: "pointer", fontFamily: FONT }}>Clear</button>
            </>
          )}
          {selected.size === 0 && scripts.length > 0 && (
            <button onClick={() => setSelected(new Set(scripts.map(s => s.id)))} style={{ background: C.card2, border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "9px 14px", color: C.muted, fontSize: 13, cursor: "pointer", fontFamily: FONT }}>Select All</button>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {Object.entries(counts).map(([s, c]) => (
          <div key={s} style={{ background: C.card, borderRadius: 10, padding: "10px 16px", border: "1px solid rgba(255,255,255,0.07)", borderLeft: "3px solid " + STATUS_COLORS[s].c }}>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>{s}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{c}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ background: filter === s ? C.orange : C.card2, border: "1px solid " + (filter === s ? C.orange : "rgba(255,255,255,0.07)"), borderRadius: 8, padding: "7px 14px", color: filter === s ? "#fff" : C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>{s}</button>
        ))}
      </div>

      {loading && <div style={{ color: C.muted, textAlign: "center", padding: 40 }}>Loading scripts...</div>}
      {!loading && filtered.length === 0 && (
        <div style={{ color: C.muted, textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>✦</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>No scripts yet</div>
          <div style={{ fontSize: 13 }}>Click "Script →" on any idea to generate your first script.</div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(script => {
          const sc = STATUS_COLORS[script.status] || STATUS_COLORS["Draft"];
          const wordCount = (script.script || "").split(/\s+/).filter(Boolean).length;
          const isSelected = selected.has(script.id);
          return (
            <div key={script.id} style={{ background: isSelected ? "rgba(255,107,0,0.06)" : C.card2, borderRadius: 14, border: "1px solid " + (isSelected ? C.orange : "rgba(255,255,255,0.07)"), borderLeft: "3px solid " + C.orange, display: "flex", alignItems: "stretch" }}>
              <div onClick={() => toggleSelect(script.id)} style={{ width: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                <div style={{ width: 18, height: 18, borderRadius: 5, border: "2px solid " + (isSelected ? C.orange : "#444"), background: isSelected ? C.orange : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isSelected && <span style={{ color: "#fff", fontSize: 11, fontWeight: 900 }}>✓</span>}
                </div>
              </div>
              <div style={{ flex: 1, padding: "16px 14px 16px 0", cursor: "pointer" }} onClick={() => setEditingScript(script)}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 10, lineHeight: 1.5 }}>"{script.hook}"</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ background: C.orange + "22", color: C.orange, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5 }}>{script.format}</span>
                  <span style={{ background: sc.bg, color: sc.c, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5 }}>{script.status}</span>
                  <span style={{ fontSize: 11, color: C.muted }}>{wordCount} words</span>
                  <span style={{ fontSize: 11, color: C.muted }}>·</span>
                  <span style={{ fontSize: 11, color: C.muted }}>{new Date(script.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", padding: "0 16px", gap: 10 }}>
                <button onClick={e => { e.stopPropagation(); setEditingScript(script); }} style={{ background: "rgba(255,107,0,0.12)", border: "1px solid rgba(255,107,0,0.3)", borderRadius: 8, padding: "7px 16px", color: C.orange, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>Edit</button>
                <button onClick={e => { e.stopPropagation(); handleDelete(script.id); }} style={{ background: "transparent", border: "none", color: "#555", fontSize: 20, cursor: "pointer", lineHeight: 1, padding: "0 4px" }}>×</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
