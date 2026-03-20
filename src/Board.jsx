import { useState, useRef } from "react";

const C = {
  bg: "#0D0D0D", card: "#161616", card2: "#1E1E1E", sidebar: "#111111",
  orange: "#FF6B00", green: "#00D084", purple: "#7C3AED", blue: "#3B82F6",
  text: "#FFFFFF", muted: "#888888", border: "rgba(255,255,255,0.07)",
  red: "#EF4444", yellow: "#EAB308",
};

const CATEGORY_COLORS = {
  content: C.orange,
  tech: C.purple,
  business: C.green,
  sakura: C.blue,
};

const COLUMNS = ["Backlog", "This Week", "In Progress", "Review", "Done"];

const initialCards = [
  { id: 1, title: "Add Board page to dashboard", assignee: "SAKURA", priority: "HIGH", category: "tech", due: "2026-03-21", description: "Full kanban board with drag and drop", column: "In Progress", actionRequired: true },
  { id: 2, title: "Fix dashboard responsiveness", assignee: "SAKURA", priority: "HIGH", category: "tech", due: "2026-03-22", description: "Dashboard doesn't fit screen perfectly yet", column: "This Week", actionRequired: false },
  { id: 3, title: "Connect real data to dashboard", assignee: "SAKURA", priority: "HIGH", category: "tech", due: "2026-03-28", description: "Sakura updates stats via Telegram commands", column: "Backlog", actionRequired: false },
  { id: 4, title: "6am daily cron automation", assignee: "SAKURA", priority: "HIGH", category: "tech", due: "2026-04-01", description: "Scrape + transcribe + analyze + generate ideas", column: "Backlog", actionRequired: false },
  { id: 5, title: "Mike Rari-ify feature", assignee: "SAKURA", priority: "MED", category: "sakura", due: "2026-04-07", description: "Forward any reel to Sakura, she outputs Mike's version", column: "Backlog", actionRequired: false },
  { id: 6, title: "Record 5 videos this week", assignee: "MIKE", priority: "HIGH", category: "content", due: "2026-03-22", description: "Batch record using scripted ideas from Sakura", column: "This Week", actionRequired: true },
  { id: 7, title: "Script 10 hooks from Intelligence", assignee: "MIKE", priority: "MED", category: "content", due: "2026-03-23", description: "Use top performing competitor hooks as inspiration", column: "This Week", actionRequired: false },
  { id: 8, title: "Set up ManyChat keyword flows", assignee: "MIKE", priority: "HIGH", category: "business", due: "2026-03-25", description: "Trigger DMs from comment keywords", column: "In Progress", actionRequired: true },
  { id: 9, title: "Launch viral masterclass course", assignee: "MIKE", priority: "HIGH", category: "business", due: "2026-04-15", description: "MON3TIZE first course drop", column: "Backlog", actionRequired: false },
  { id: 10, title: "Vision analysis for reels", assignee: "SAKURA", priority: "MED", category: "sakura", due: "2026-04-10", description: "Sakura sees visual hooks, text overlays, editing style", column: "Backlog", actionRequired: false },
  { id: 11, title: "Session sync briefing system", assignee: "SAKURA", priority: "MED", category: "sakura", due: "2026-04-05", description: "End of Claude session generates briefing Sakura ingests", column: "Backlog", actionRequired: false },
  { id: 12, title: "Post 2 reels today", assignee: "MIKE", priority: "HIGH", category: "content", due: "2026-03-20", description: "", column: "Review", actionRequired: false },
];

const sakuraQueue = [
  { id: "sq1", title: "Daily scrape — 10 IG accounts", status: "DONE", time: "6:00 AM" },
  { id: "sq2", title: "Transcribe new reels", status: "DONE", time: "6:15 AM" },
  { id: "sq3", title: "Generate 20 content ideas", status: "RUNNING", time: "6:30 AM" },
  { id: "sq4", title: "Analyze virality scores", status: "QUEUED", time: "7:00 AM" },
];

const Tag = ({ label }) => {
  const map = {
    HIGH: { bg: "#2A0F0F", c: "#F87171" },
    MED: { bg: "#2A1A0F", c: "#FB923C" },
    LOW: { bg: "#222", c: "#666" },
    MIKE: { bg: "#2A1200", c: "#FF6B00" },
    SAKURA: { bg: "#1A1230", c: "#A78BFA" },
    DONE: { bg: "#0F2A1A", c: "#00D084" },
    RUNNING: { bg: "#0F1E2A", c: "#60A5FA" },
    QUEUED: { bg: "#222", c: "#888" },
    "Action Required": { bg: "#2A0F0F", c: "#F87171" },
  };
  const s = map[label] || { bg: "#222", c: "#888" };
  return (
    <span style={{ background: s.bg, color: s.c, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5, display: "inline-block", letterSpacing: 0.3, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
};

function CardModal({ card, onClose, onSave }) {
  const [edit, setEdit] = useState({ ...card });
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: C.card2, borderRadius: 16, padding: 32, width: 520, maxWidth: "95vw", border: `1px solid ${C.border}` }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <input
            value={edit.title}
            onChange={e => setEdit({ ...edit, title: e.target.value })}
            style={{ fontSize: 18, fontWeight: 800, color: "#fff", background: "transparent", border: "none", outline: "none", flex: 1, marginRight: 12 }}
          />
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: C.muted, fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          <Tag label={edit.priority} />
          <Tag label={edit.assignee} />
          {edit.actionRequired && <Tag label="Action Required" />}
          <span style={{ background: CATEGORY_COLORS[edit.category] + "22", color: CATEGORY_COLORS[edit.category], fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5 }}>{edit.category.toUpperCase()}</span>
        </div>
        <textarea
          value={edit.description}
          onChange={e => setEdit({ ...edit, description: e.target.value })}
          placeholder="Add description..."
          style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 14, resize: "vertical", minHeight: 80, boxSizing: "border-box", outline: "none" }}
        />
        <div style={{ display: "flex", gap: 12, marginTop: 16, alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>DUE DATE</div>
            <input
              type="date"
              value={edit.due}
              onChange={e => setEdit({ ...edit, due: e.target.value })}
              style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 13, outline: "none" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>COLUMN</div>
            <select
              value={edit.column}
              onChange={e => setEdit({ ...edit, column: e.target.value })}
              style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 13, outline: "none", width: "100%" }}
            >
              {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 20px", color: C.muted, fontSize: 13, cursor: "pointer" }}>Cancel</button>
          <button onClick={() => { onSave(edit); onClose(); }} style={{ background: C.orange, border: "none", borderRadius: 8, padding: "9px 20px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

function KanbanCard({ card, onDragStart, onClick }) {
  const today = new Date().toISOString().split("T")[0];
  const isOverdue = card.due && card.due < today && card.column !== "Done";
  const noDue = !card.due;
  const catColor = CATEGORY_COLORS[card.category] || C.muted;
  return (
    <div
      draggable
      onDragStart={() => onDragStart(card.id)}
      onClick={() => onClick(card)}
      style={{
        background: C.card2,
        borderRadius: 12,
        padding: "14px 14px 12px",
        marginBottom: 8,
        borderLeft: `3px solid ${catColor}`,
        cursor: "grab",
        border: `1px solid ${isOverdue ? "#EF444440" : C.border}`,
        borderLeftColor: catColor,
        transition: "opacity 0.15s",
        position: "relative",
      }}
    >
      {isOverdue && <div style={{ fontSize: 10, color: C.red, fontWeight: 700, marginBottom: 6 }}>⚠ OVERDUE</div>}
      {noDue && <div style={{ fontSize: 10, color: C.yellow, fontWeight: 700, marginBottom: 6 }}>○ NO DUE DATE</div>}
      <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 10, lineHeight: 1.4 }}>{card.title}</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        <Tag label={card.priority} />
        <Tag label={card.assignee} />
        {card.actionRequired && <Tag label="Action Required" />}
      </div>
      {card.due && <div style={{ fontSize: 11, color: isOverdue ? C.red : C.muted, marginTop: 8 }}>Due {card.due}</div>}
    </div>
  );
}

export default function Board() {
  const [cards, setCards] = useState(initialCards);
  const [filter, setFilter] = useState("All");
  const [collapsed, setCollapsed] = useState({});
  const [quickAdd, setQuickAdd] = useState({});
  const [selectedCard, setSelectedCard] = useState(null);
  const [dragId, setDragId] = useState(null);
  const nextId = useRef(100);

  const filters = ["All", "MIKE", "SAKURA", "HIGH", "Content", "Tech"];

  const filtered = cards.filter(c => {
    if (filter === "All") return true;
    if (filter === "MIKE") return c.assignee === "MIKE";
    if (filter === "SAKURA") return c.assignee === "SAKURA";
    if (filter === "HIGH") return c.priority === "HIGH";
    if (filter === "Content") return c.category === "content";
    if (filter === "Tech") return c.category === "tech";
    return true;
  });

  const handleDrop = (col) => {
    if (!dragId) return;
    setCards(prev => prev.map(c => c.id === dragId ? { ...c, column: col } : c));
    setDragId(null);
  };

  const handleQuickAdd = (col) => {
    const title = quickAdd[col]?.trim();
    if (!title) return;
    setCards(prev => [...prev, {
      id: nextId.current++, title, assignee: "MIKE", priority: "MED",
      category: "content", due: "", description: "", column: col, actionRequired: false,
    }]);
    setQuickAdd(prev => ({ ...prev, [col]: "" }));
  };

  const handleSave = (updated) => {
    setCards(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const statusColor = { DONE: C.green, RUNNING: C.blue, QUEUED: C.muted };

  return (
    <div style={{ padding: "32px 32px 0", overflowY: "auto", height: "100%", boxSizing: "border-box" }}>
      {selectedCard && <CardModal card={selectedCard} onClose={() => setSelectedCard(null)} onSave={handleSave} />}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "#fff", margin: 0, letterSpacing: -0.5 }}>Board</h1>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{cards.length} total cards</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? C.orange : C.card2, border: `1px solid ${filter === f ? C.orange : C.border}`, borderRadius: 8, padding: "7px 14px", color: filter === f ? "#fff" : C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div style={{ background: "#0F0F1A", border: `1px solid ${C.purple}30`, borderRadius: 14, padding: "16px 20px", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 16 }}>✦</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: C.purple }}>Sakura's Automated Queue</span>
          <span style={{ fontSize: 11, color: C.muted, marginLeft: 4 }}>Today's automated tasks</span>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {sakuraQueue.map(task => (
            <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 10, background: C.card2, borderRadius: 10, padding: "10px 14px", border: `1px solid ${C.border}` }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor[task.status], flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{task.title}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{task.time}</div>
              </div>
              <Tag label={task.status} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", paddingBottom: 40, overflowX: "auto" }}>
        {COLUMNS.map(col => {
          const colCards = filtered.filter(c => c.column === col);
          const isCollapsed = collapsed[col];
          return (
            <div key={col} style={{ minWidth: isCollapsed ? 48 : 260, width: isCollapsed ? 48 : 260, flexShrink: 0 }} onDragOver={e => e.preventDefault()} onDrop={() => handleDrop(col)}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, padding: "0 4px" }}>
                {!isCollapsed && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#fff", letterSpacing: 0.5 }}>{col.toUpperCase()}</span>
                    <span style={{ background: C.card2, color: C.muted, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>{colCards.length}</span>
                  </div>
                )}
                <button onClick={() => setCollapsed(prev => ({ ...prev, [col]: !prev[col] }))} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 14, padding: 4, marginLeft: "auto" }}>
                  {isCollapsed ? "▶" : "◀"}
                </button>
              </div>
              {!isCollapsed && (
                <>
                  <div style={{ minHeight: 80 }}>
                    {colCards.map(card => (
                      <KanbanCard key={card.id} card={card} onDragStart={setDragId} onClick={setSelectedCard} />
                    ))}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <input
                      value={quickAdd[col] || ""}
                      onChange={e => setQuickAdd(prev => ({ ...prev, [col]: e.target.value }))}
                      onKeyDown={e => e.key === "Enter" && handleQuickAdd(col)}
                      placeholder="+ Quick add..."
                      style={{ width: "100%", background: "transparent", border: `1px dashed ${C.border}`, borderRadius: 10, padding: "10px 12px", color: C.muted, fontSize: 13, outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
