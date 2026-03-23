import { useState, useEffect, useRef, useCallback } from "react";
import { getScripts, deleteScript, generateScript } from "./api.js";

const C = {
  bg: "#0D0D0D", card: "#161616", card2: "#1E1E1E",
  orange: "#FF6B00", green: "#00D084", purple: "#7C3AED", blue: "#3B82F6",
  text: "#FFFFFF", muted: "#888888", border: "rgba(255,255,255,0.07)",
  red: "#EF4444",
};

const STATUS_COLORS = {
  "Draft": { bg: "#222", c: "#888" },
  "Ready": { bg: "#0F1E2A", c: "#60A5FA" },
  "Recorded": { bg: "#2D1B69", c: "#A78BFA" },
  "Posted": { bg: "#0F2A1A", c: "#00D084" },
};

const AI_ACTIONS = [
  { label: "Improve writing", icon: "✦" },
  { label: "Make shorter", icon: "↓" },
  { label: "Make longer", icon: "↑" },
  { label: "More convicted", icon: "⚡" },
  { label: "More casual", icon: "~" },
  { label: "Add my $400K story", icon: "💰" },
  { label: "Fix grammar", icon: "✓" },
  { label: "Sharpen the hook", icon: "🎯" },
];

function AIContextMenu({ x, y, selectedText, onAction, onClose }) {
  const [customPrompt, setCustomPrompt] = useState("");
  return (
    <div style={{ position: "fixed", left: x, top: y, background: "#1E1E1E", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "8px", width: 260, zIndex: 9999, boxShadow: "0 20px 60px rgba(0,0,0,0.8)" }} onClick={e => e.stopPropagation()}>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, padding: "4px 8px" }}>
        <input value={customPrompt} onChange={e => setCustomPrompt(e.target.value)} onKeyDown={e => { if(e.key === "Enter" && customPrompt.trim()) { onAction("custom: " + customPrompt); onClose(); }}} placeholder="Ask Sakura what to do..." style={{ flex: 1, background: "#161616", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 10px", color: "#fff", fontSize: 12, outline: "none" }} />
        <button onClick={() => { if(customPrompt.trim()) { onAction("custom: " + customPrompt); onClose(); }}} style={{ background: C.orange, border: "none", borderRadius: 8, padding: "7px 10px", color: "#fff", fontSize: 12, cursor: "pointer" }}>↑</button>
      </div>
      <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "4px 0" }}/>
      <div style={{ fontSize: 10, color: C.muted, padding: "4px 8px", fontWeight: 700 }}>QUICK ACTIONS</div>
      {AI_ACTIONS.map(action => (
        <button key={action.label} onClick={() => { onAction(action.label); onClose(); }} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", background: "transparent", border: "none", padding: "8px 10px", color: "#fff", fontSize: 13, cursor: "pointer", borderRadius: 8, textAlign: "left" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <span style={{ fontSize: 14, width: 18 }}>{action.icon}</span>
          {action.label}
        </button>
      ))}
    </div>
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
  const [contextMenu, setContextMenu] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  const fullScript = [sections.hook, sections.body, sections.cta].filter(Boolean).join("\n\n");
  const wordCount = fullScript.split(/\s+/).filter(Boolean).length;

  const handleTextSelect = (section) => (e) => {
    const selected = window.getSelection()?.toString()?.trim();
    if (selected && selected.length > 3) {
      setActiveSection(section);
    }
  };

  const handleContextMenu = (section) => (e) => {
    const selected = window.getSelection()?.toString()?.trim();
    if (selected && selected.length > 3) {
      e.preventDefault();
      setActiveSection(section);
      setContextMenu({ x: Math.min(e.clientX, window.innerWidth - 280), y: Math.min(e.clientY, window.innerHeight - 400), selected });
    }
  };

  const handleAIAction = async (action) => {
    if (!contextMenu?.selected) return;
    setLoading(true);
    const prompt = action.startsWith("custom:") ? action.replace("custom:", "").trim() : action;
    try {
      const res = await generateScript(contextMenu.selected, "edit", "", `${prompt} this text: "${contextMenu.selected}"`, contextMenu.selected);
      if (res.script) {
        setHistory(h => [...h, { ...sections }]);
        setSections(prev => ({ ...prev, [activeSection]: prev[activeSection].replace(contextMenu.selected, res.script) }));
      }
    } catch(e) {}
    setLoading(false);
  };

  const handleUndo = () => {
    if (history.length > 0) {
      setSections(history[history.length - 1]);
      setHistory(h => h.slice(0, -1));
    }
  };

  const handleSave = () => {
    onSave(script.id, fullScript, status);
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fullScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => { setContextMenu(null); onClose(); }}>
      {contextMenu && <AIContextMenu x={contextMenu.x} y={contextMenu.y} selectedText={contextMenu.selected} onAction={handleAIAction} onClose={() => setContextMenu(null)} />}
      <div style={{ background: "#161616", borderRadius: 18, width: 680, maxWidth: "95vw", maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", border: "1px solid rgba(255,255,255,0.1)" }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div>
            <div style={{ fontSize: 11, color: C.muted, fontWeight: 700, marginBottom: 4 }}>{script.format}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", maxWidth: 400 }}>"{script.hook}"</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: C.muted }}>{wordCount} words</span>
            {history.length > 0 && <button onClick={handleUndo} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 12px", color: "#fff", fontSize: 11, cursor: "pointer" }}>↩ Undo</button>}
            <button onClick={handleCopy} style={{ background: copied ? C.green + "22" : "rgba(255,255,255,0.06)", border: `1px solid ${copied ? C.green : "rgba(255,255,255,0.1)"}`, borderRadius: 8, padding: "6px 12px", color: copied ? C.green : "#fff", fontSize: 11, cursor: "pointer" }}>{copied ? "Copied!" : "Copy"}</button>
            <button onClick={onClose} style={{ background: "transparent", border: "none", color: C.muted, fontSize: 22, cursor: "pointer" }}>×</button>
          </div>
        </div>

        {/* Status bar */}
        <div style={{ display: "flex", gap: 6, padding: "12px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: C.muted, marginRight: 4 }}>STATUS:</span>
          {["Draft", "Ready", "Recorded", "Posted"].map(s => (
            <button key={s} onClick={() => setStatus(s)} style={{ background: status === s ? STATUS_COLORS[s].bg : "transparent", border: `1px solid ${status === s ? STATUS_COLORS[s].c : "rgba(255,255,255,0.07)"}`, borderRadius: 6, padding: "4px 12px", color: status === s ? STATUS_COLORS[s].c : C.muted, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{s}</button>
          ))}
          {loading && <span style={{ fontSize: 11, color: C.purple, marginLeft: 8 }}>✦ Sakura is rewriting...</span>}
        </div>

        {/* Editor sections */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          <div style={{ fontSize: 10, color: C.orange, fontWeight: 700, marginBottom: 6, letterSpacing: 1 }}>HOOK</div>
          <textarea value={sections.hook} onChange={e => setSections(p => ({...p, hook: e.target.value}))} onMouseUp={handleTextSelect("hook")} onContextMenu={handleContextMenu("hook")} style={{ width: "100%", background: "#1E1E1E", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px", color: "#fff", fontSize: 14, lineHeight: 1.7, resize: "none", outline: "none", boxSizing: "border-box", minHeight: 80 }} rows={3} />
          
          <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, marginBottom: 6, marginTop: 16, letterSpacing: 1 }}>BODY</div>
          <textarea value={sections.body} onChange={e => setSections(p => ({...p, body: e.target.value}))} onMouseUp={handleTextSelect("body")} onContextMenu={handleContextMenu("body")} style={{ width: "100%", background: "#1E1E1E", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px", color: "#fff", fontSize: 14, lineHeight: 1.7, resize: "none", outline: "none", boxSizing: "border-box", minHeight: 200 }} rows={8} />
          
          <div style={{ fontSize: 10, color: C.green, fontWeight: 700, marginBottom: 6, marginTop: 16, letterSpacing: 1 }}>CTA</div>
          <textarea value={sections.cta} onChange={e => setSections(p => ({...p, cta: e.target.value}))} onMouseUp={handleTextSelect("cta")} onContextMenu={handleContextMenu("cta")} style={{ width: "100%", background: "#1E1E1E", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px", color: "#fff", fontSize: 14, lineHeight: 1.7, resize: "none", outline: "none", boxSizing: "border-box", minHeight: 60 }} rows={2} />

          <div style={{ fontSize: 11, color: "#444", marginTop: 12, textAlign: "center" }}>Select any text then right-click to get AI suggestions from Sakura</div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", gap: 10, padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.07)", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => { onDelete(script.id); onClose(); }} style={{ background: "transparent", border: "none", color: C.red, fontSize: 13, cursor: "pointer" }}>Delete Script</button>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ background: "#1E1E1E", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "10px 20px", color: C.muted, fontSize: 13, cursor: "pointer" }}>Cancel</button>
            <button onClick={handleSave} style={{ background: C.orange, border: "none", borderRadius: 10, padding: "10px 24px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Save Changes</button>
          </div>
        </div>
      </div>
    </div></>
  );
}

export default function Scripts() {
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(new Set());
  const [editingScript, setEditingScript] = useState(null);

  useEffect(() => {
    getScripts().then(data => { setScripts(Array.isArray(data) ? data : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleDelete = (id) => {
    deleteScript(id).then(() => setScripts(prev => prev.filter(s => s.id !== id)));
  };

  const handleUpdate = (id, newScript, newStatus) => {
    setScripts(prev => prev.map(s => s.id === id ? { ...s, script: newScript, ...(newStatus ? { status: newStatus } : {}) } : s));
  };

  const toggleSelect = (id) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const exportDocx = () => {
    const selectedScripts = scripts.filter(s => selected.has(s.id));
    const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    let content = `MIKE RARI SCRIPTS\nGenerated: ${date}\n${'─'.repeat(40)}\n\n`;
    selectedScripts.forEach((s, i) => {
      content += `SCRIPT ${i + 1} — ${s.format}\nHook: ${s.hook}\nCTA: ${s.cta}\nStatus: ${s.status}\n\n${s.script}\n\n${'─'.repeat(40)}\n\n`;
    });
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mike Rari Scripts — ${date} — ${selectedScripts.length} Scripts.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setSelected(new Set());
  };

  const statuses = ["All", "Draft", "Ready", "Recorded", "Posted"];
  const filtered = filter === "All" ? scripts : scripts.filter(s => s.status === filter);
  const counts = { Draft: 0, Ready: 0, Recorded: 0, Posted: 0 };
  scripts.forEach(s => { if (counts[s.status] !== undefined) counts[s.status]++; });

  return (
    <div style={{ padding: "32px 32px 40px", overflowY: "auto", height: "100%", boxSizing: "border-box" }}>
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
              <button onClick={exportDocx} style={{ background: C.green, border: "none", borderRadius: 8, padding: "9px 18px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Export to Doc</button>
              <button onClick={() => setSelected(new Set())} style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 14px", color: C.muted, fontSize: 13, cursor: "pointer" }}>Clear</button>
            </>
          )}
          {selected.size === 0 && scripts.length > 0 && (
            <button onClick={() => setSelected(new Set(scripts.map(s => s.id)))} style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 14px", color: C.muted, fontSize: 13, cursor: "pointer" }}>Select All</button>
          )}
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
          <button key={s} onClick={() => setFilter(s)} style={{ background: filter === s ? C.orange : C.card2, border: `1px solid ${filter === s ? C.orange : C.border}`, borderRadius: 8, padding: "7px 14px", color: filter === s ? "#fff" : C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{s}</button>
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

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(script => {
          const sc = STATUS_COLORS[script.status] || STATUS_COLORS["Draft"];
          const wordCount = (script.script || "").split(/\s+/).filter(Boolean).length;
          const isSelected = selected.has(script.id);
          return (
            <div key={script.id} style={{ background: isSelected ? "rgba(255,107,0,0.06)" : C.card2, borderRadius: 14, border: `1px solid ${isSelected ? C.orange : C.border}`, borderLeft: `3px solid ${C.orange}`, display: "flex", gap: 0, alignItems: "stretch" }}>
              <div onClick={() => toggleSelect(script.id)} style={{ width: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${isSelected ? C.orange : "#444"}`, background: isSelected ? C.orange : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isSelected && <span style={{ color: "#fff", fontSize: 11, fontWeight: 900 }}>✓</span>}
                </div>
              </div>
              <div style={{ flex: 1, padding: "14px 14px 14px 0", cursor: "pointer" }} onClick={() => setEditingScript(script)}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 8, lineHeight: 1.5 }}>"{script.hook}"</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ background: C.orange + "22", color: C.orange, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5 }}>{script.format}</span>
                  <span style={{ background: sc.bg, color: sc.c, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5 }}>{script.status}</span>
                  <span style={{ fontSize: 11, color: C.muted }}>{wordCount} words</span>
                  <span style={{ fontSize: 11, color: C.muted }}>·</span>
                  <span style={{ fontSize: 11, color: C.muted }}>{new Date(script.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", padding: "0 14px", gap: 8 }}>
                <button onClick={e => { e.stopPropagation(); setEditingScript(script); }} style={{ background: "rgba(255,107,0,0.12)", border: `1px solid rgba(255,107,0,0.3)`, borderRadius: 8, padding: "6px 14px", color: C.orange, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Edit</button>
                <button onClick={e => { e.stopPropagation(); handleDelete(script.id); }} style={{ background: "transparent", border: "none", color: "#444", fontSize: 18, cursor: "pointer" }}>×</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
