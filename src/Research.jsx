import { useState, useEffect } from "react";

const C = {
  bg: "#0D0D0D", card: "#161616", card2: "#1E1E1E",
  orange: "#FF6B00", green: "#00D084", purple: "#7C3AED", blue: "#3B82F6",
  text: "#FFFFFF", muted: "#666666", border: "rgba(255,255,255,0.07)",
};
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const API = "https://incogitable-orville-superwise.ngrok-free.dev";

function fmtPlays(n) {
  if (!n) return "—";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(0) + "K";
  return n.toString();
}

function timeAgo(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  const diff = (Date.now() - d) / 1000;
  if (diff < 86400) return "Today";
  if (diff < 172800) return "Yesterday";
  if (diff < 604800) return Math.floor(diff / 86400) + "d ago";
  if (diff < 2592000) return Math.floor(diff / 604800) + "w ago";
  return Math.floor(diff / 2592000) + "mo ago";
}

function useProxiedImage(url) {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    if (!url) return;
    let revoked = false;
    fetch(url, { headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then(r => r.ok ? r.blob() : null)
      .then(blob => { if (blob && !revoked) setSrc(URL.createObjectURL(blob)); })
      .catch(() => {});
    return () => { revoked = true; };
  }, [url]);
  return src;
}

function VideoCard({ reel, onRariify }) {
  const [hovered, setHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const thumbnailSrc = useProxiedImage(reel.thumbnail);

  const handleRariify = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      const res = await fetch(API + '/api/rariify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({
          caption: reel.caption,
          account: reel.account,
          plays: reel.plays,
          likes: reel.likes,
          duration: reel.duration,
          postUrl: reel.postUrl,
        })
      });
      const data = await res.json();
      onRariify({ ...reel, analysis: data.analysis, script: data.script });
    } catch {
      onRariify(reel);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.card2,
        borderRadius: 12,
        overflow: "hidden",
        border: `1px solid ${hovered ? "rgba(255,255,255,0.15)" : C.border}`,
        transition: "border 0.15s, transform 0.15s",
        transform: hovered ? "translateY(-2px)" : "none",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Thumbnail */}
      <div style={{ position: "relative", aspectRatio: "9/16", background: "#111", overflow: "hidden" }}>
        {thumbnailSrc ? (
          <img
            src={thumbnailSrc}
            alt={reel.caption}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 32 }}>🎬</span>
          </div>
        )}
        {reel.duration && (
          <div style={{
            position: "absolute", bottom: 8, right: 8,
            background: "rgba(0,0,0,0.75)", borderRadius: 4,
            padding: "2px 6px", fontSize: 11, color: "#fff", fontWeight: 600,
          }}>
            {Math.floor(reel.duration)}s
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "10px 12px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.orange }}>@{reel.account}</span>
          <span style={{ fontSize: 11, color: C.muted }}>{timeAgo(reel.timestamp)}</span>
        </div>
        <div style={{
          fontSize: 12, color: "#ccc", lineHeight: 1.4,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {reel.caption || "No caption"}
        </div>

        {/* Metrics */}
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <span style={{ fontSize: 11, color: C.green, fontWeight: 700 }}>▶ {fmtPlays(reel.plays)}</span>
          <span style={{ fontSize: 11, color: C.muted }}>♥ {fmtPlays(reel.likes)}</span>
          <span style={{ fontSize: 11, color: C.muted }}>💬 {fmtPlays(reel.comments)}</span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
          <button
            onClick={(e) => { e.stopPropagation(); window.open(reel.postUrl, "_blank"); }}
            style={{
              flex: 1, background: "transparent", border: `1px solid ${C.border}`,
              borderRadius: 6, padding: "5px 0", color: C.muted, fontSize: 11,
              cursor: "pointer", fontFamily: FONT,
            }}
          >
            Open ↗
          </button>
          <button
            onClick={handleRariify}
            disabled={loading}
            style={{
              flex: 1, background: loading ? 'rgba(255,107,0,0.08)' : `${C.orange}18`,
              border: `1px solid ${C.orange}44`,
              borderRadius: 6, padding: "5px 0", color: C.orange, fontSize: 11,
              cursor: loading ? "default" : "pointer", fontWeight: 700, fontFamily: FONT,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Writing..." : "Rari-ify ✦"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Research({ onRariify }) {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("All");
  const [sortBy, setSortBy] = useState("plays");
  const [dateFilter, setDateFilter] = useState("all");
  const [minPlays, setMinPlays] = useState("");
  const [maxPlays, setMaxPlays] = useState("");
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    fetch(API + "/api/research", { headers: { "ngrok-skip-browser-warning": "true" } })
      .then(r => r.json())
      .then(d => {
        const data = d.reels || [];
        setReels(data);
        const accs = [...new Set(data.map(r => r.account))].sort();
        setAccounts(accs);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = reels.filter(r => {
    if (selectedAccount !== "All" && r.account !== selectedAccount) return false;
    if (search && !r.caption?.toLowerCase().includes(search.toLowerCase()) && !r.account?.toLowerCase().includes(search.toLowerCase())) return false;
    if (minPlays && r.plays < parseInt(minPlays)) return false;
    if (maxPlays && r.plays > parseInt(maxPlays)) return false;
    if (dateFilter !== "all") {
      const days = dateFilter === "week" ? 7 : dateFilter === "month" ? 30 : 90;
      const cutoff = Date.now() - days * 86400000;
      if (!r.timestamp || new Date(r.timestamp).getTime() < cutoff) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === "plays") return (b.plays || 0) - (a.plays || 0);
    if (sortBy === "likes") return (b.likes || 0) - (a.likes || 0);
    if (sortBy === "recent") return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
    return 0;
  });

  const filterBtn = (val, cur, set, label) => (
    <button
      key={val}
      onClick={() => set(val)}
      style={{
        background: cur === val ? C.orange : "transparent",
        border: `1px solid ${cur === val ? C.orange : C.border}`,
        borderRadius: 6, padding: "5px 10px",
        color: cur === val ? "#fff" : C.muted,
        fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: FONT,
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", fontFamily: FONT }}>
      {/* Sidebar filters */}
      <div style={{
        width: 220, minWidth: 220, background: "#111", borderRight: `1px solid ${C.border}`,
        padding: "24px 16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 20,
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 1, marginBottom: 10 }}>SEARCH</div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search captions..."
            style={{
              width: "100%", background: C.card2, border: `1px solid ${C.border}`,
              borderRadius: 8, padding: "8px 10px", color: "#fff", fontSize: 12,
              outline: "none", boxSizing: "border-box", fontFamily: FONT,
            }}
          />
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 1, marginBottom: 10 }}>ACCOUNT</div>
          <select
            value={selectedAccount}
            onChange={e => setSelectedAccount(e.target.value)}
            style={{
              width: "100%", background: C.card2, border: `1px solid ${C.border}`,
              borderRadius: 8, padding: "8px 10px", color: "#fff", fontSize: 12,
              outline: "none", cursor: "pointer", fontFamily: FONT,
            }}
          >
            <option value="All">All accounts</option>
            {accounts.map(a => <option key={a} value={a}>@{a}</option>)}
          </select>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 1, marginBottom: 10 }}>POSTED IN</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[["all","All time"],["week","This week"],["month","This month"],["quarter","Last 90 days"]].map(([v,l]) =>
              filterBtn(v, dateFilter, setDateFilter, l)
            )}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 1, marginBottom: 10 }}>SORT BY</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[["plays","Most views"],["likes","Most likes"],["recent","Most recent"]].map(([v,l]) =>
              filterBtn(v, sortBy, setSortBy, l)
            )}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 1, marginBottom: 10 }}>MIN VIEWS</div>
          <input
            value={minPlays}
            onChange={e => setMinPlays(e.target.value)}
            placeholder="e.g. 100000"
            type="number"
            style={{
              width: "100%", background: C.card2, border: `1px solid ${C.border}`,
              borderRadius: 8, padding: "8px 10px", color: "#fff", fontSize: 12,
              outline: "none", boxSizing: "border-box", fontFamily: FONT,
            }}
          />
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: "#fff", margin: 0, letterSpacing: -0.5 }}>Research</h1>
            <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
              {loading ? "Loading..." : `Showing ${filtered.length} of ${reels.length} reels`}
            </div>
          </div>
        </div>

        {loading && (
          <div style={{ color: C.muted, textAlign: "center", padding: 80 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⟳</div>
            <div>Loading reels...</div>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ color: C.muted, textAlign: "center", padding: 80 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>◎</div>
            <div style={{ fontSize: 16, color: "#fff", fontWeight: 700, marginBottom: 8 }}>No reels found</div>
            <div style={{ fontSize: 13 }}>Try adjusting your filters.</div>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 16,
          }}>
            {filtered.map(reel => (
              <VideoCard key={reel.id || reel.postUrl} reel={reel} onRariify={onRariify} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
