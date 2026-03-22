import { useState, useEffect } from "react";
import { getIdeas } from "./api.js";

const C = {
  bg: "#0D0D0D", card: "#161616", card2: "#1E1E1E",
  orange: "#FF6B00", green: "#00D084", purple: "#7C3AED", blue: "#3B82F6",
  text: "#FFFFFF", muted: "#888888", border: "rgba(255,255,255,0.07)",
  red: "#EF4444", yellow: "#EAB308",
};

const sampleIdeas = [
  { id: 1, date: "2026-03-21", hook: "I made a brand $400,000 in one month. They paid me four grand. That's the day I stopped working for other people forever.", format: "Storytelling", angle: "Desire + loss scenario", cta: "Comment PIPELINE", why: "Income voyeurism is the strongest scroll-stopper. Mike's version is injustice, not flexing.", account: "therealbrianmark", plays: 2572350, url: "https://www.instagram.com/p/DJpphhIhGVn/", used: false },
  { id: 2, date: "2026-03-21", hook: "Jake Paul went from making YouTube videos to standing next to the President of the United States. And creators are still out here arguing about what time to post.", format: "Social Leverage", angle: "Controversy + desire", cta: "Comment FREE", why: "Jake Paul is the most polarizing name in content. The punchline reframes the entire game.", account: "jun_yuh", plays: 24732970, url: "https://www.instagram.com/p/DAXXuQFOlnL/", used: false },
  { id: 3, date: "2026-03-21", hook: "The reason you're not growing has nothing to do with your niche. Nothing to do with your hashtags. Nothing to do with your posting schedule.", format: "Value Drop", angle: "Curiosity + inadequacy", cta: "Comment VIRAL", why: "Negation chain hooks drove 33K comments on 1M plays for a competitor.", account: "minolee.mp4", plays: 1089985, url: "https://www.instagram.com/p/C8QFlapP9YW/", used: false },
  { id: 4, date: "2026-03-21", hook: "I have 350 million views. If I lost every follower, every post, and every dollar tomorrow — here's exactly what I'd do on day one.", format: "Storytelling", angle: "Fear + curiosity", cta: "Comment SYSTEM", why: "The restart scenario is evergreen viral. Mike's version is credible because he actually lost everything.", account: "jun_yuh", plays: 939128, url: "https://www.instagram.com/p/DQVX6PskWOP/", used: false },
  { id: 5, date: "2026-03-21", hook: "Everyone thinks Alex Hormozi is successful because of his business advice. That's not why.", format: "Social Leverage", angle: "Controversy + reversal", cta: "Comment BUYERS", why: "Reversal hooks on big names drove 869K plays. Hormozi's audience overlaps heavily with Mike's.", account: "meagnunez", plays: 869837, url: "https://www.instagram.com/p/DUR7uD-jgCf/", used: true },
  { id: 6, date: "2026-03-21", hook: "If you're attractive, use your looks. If you're smart, build something. Stop pretending you don't have an unfair advantage.", format: "Value Drop", angle: "Desire + identity", cta: "Comment SYSTEM", why: "Unfair advantage content is shareable. People tag friends saying 'this is you.'", account: "getpaidtoexist", plays: 870040, url: "https://www.instagram.com/p/DL2l01uRLUc/", used: false },
  { id: 7, date: "2026-03-21", hook: "I built 2 million followers, got banned, lost everything, and started over from zero. Most people would've quit.", format: "Storytelling", angle: "Curiosity + loss scenario", cta: "Comment VIRAL", why: "Loss scenarios drive high engagement. Mike's version is real which makes it 10x more powerful.", account: "ginnyfears", plays: 840502, url: "https://www.instagram.com/p/DIJYvCqNthD/", used: false },
  { id: 8, date: "2026-03-20", hook: "The creator economy doesn't have too many creators. It doesn't have enough. The ones who quit are the only reason you still have a chance.", format: "Bold Take", angle: "Desire + identity trigger", cta: "Comment FREE", why: "Worldview reels build cult followings. People adopt the take as their own.", account: "getpaidtoexist", plays: 656418, url: "https://www.instagram.com/p/DM1LjonSAsp/", used: false },
  { id: 9, date: "2026-03-20", hook: "Dan Koe built a $4 million business with less than 500K followers. Most creators with a million followers can't pay rent.", format: "Social Leverage", angle: "Curiosity + fear of follower trap", cta: "Comment BUYERS", why: "Social leverage is Mike's highest-performing format. Dan Koe borrows a sophisticated audience.", account: "minolee.mp4", plays: 566466, url: "https://www.instagram.com/p/C1kzUmsRcEl/", used: false },
  { id: 10, date: "2026-03-20", hook: "Stop making content. Seriously. If you don't have these three things set up first, every reel you post is wasted.", format: "Value Drop", angle: "Fear of wasting effort", cta: "Comment SYSTEM", why: "The contrarian open creates instant tension in a feed full of 'post more' advice.", account: "therealbrianmark", plays: 2572350, url: "https://www.instagram.com/p/DJpphhIhGVn/", used: false },
];

const FORMAT_COLORS = {
  "Social Leverage": "#FF6B00",
  "Curiosity Hook": "#3B82F6",
  "Value Drop": "#00D084",
  "Bold Take": "#7C3AED",
  "Storytelling": "#F59E0B",
};

function getFormatColor(format) {
  for (const [key, color] of Object.entries(FORMAT_COLORS)) {
    if (format.includes(key)) return color;
  }
  return "#888888";
}

export default function IdeasBank() {
  const [ideas, setIdeas] = useState(sampleIdeas);
  const [loading, setLoading] = useState(false);

  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    setLoading(true);
    getIdeas().then(d => {
      if (d.ideas && d.ideas.length > 0) {
        setIdeas(d.ideas.map((idea, i) => ({...idea, id: i+1, used: false})));
      }
      if (d.lastUpdated) setLastUpdated(d.lastUpdated);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [showUsed, setShowUsed] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const formats = ["All", "Social Leverage", "Curiosity Hook", "Value Drop", "Bold Take", "Storytelling"];

  const filtered = ideas
    .filter(i => {
      if (!showUsed && i.used) return false;
      if (filter === "All") return true;
      return i.format.includes(filter);
    })
    .sort((a, b) => {
      if (sortBy === "plays") return b.plays - a.plays;
      return new Date(b.date) - new Date(a.date);
    });

  const toggleUsed = (id) => {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, used: !i.used } : i));
  };

  const unusedCount = ideas.filter(i => !i.used).length;

  return (
    <div style={{ padding: "32px 32px 40px", overflowY: "auto", height: "100%", boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "#fff", margin: 0, letterSpacing: -0.5 }}>Ideas Bank</h1>
          <div style={{ fontSize: 13, color: "#888888", marginTop: 4 }}>{unusedCount} unused ideas · {ideas.length} total{lastUpdated && <span style={{marginLeft:12, color:"#555"}}>· Last Updated: {lastUpdated}</span>}</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ background: "#1E1E1E", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "7px 12px", color: "#fff", fontSize: 12, outline: "none" }}>
            <option value="date">Sort: Newest</option>
            <option value="plays">Sort: Most Plays</option>
          </select>
          <button onClick={() => setShowUsed(!showUsed)} style={{ background: showUsed ? "#1E1E1E" : "#FF6B0022", border: "1px solid " + (showUsed ? "rgba(255,255,255,0.07)" : "#FF6B00"), borderRadius: 8, padding: "7px 14px", color: showUsed ? "#888888" : "#FF6B00", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            {showUsed ? "All Ideas" : "Unused Only"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {formats.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? "#FF6B00" : "#1E1E1E", border: "1px solid " + (filter === f ? "#FF6B00" : "rgba(255,255,255,0.07)"), borderRadius: 8, padding: "7px 14px", color: filter === f ? "#fff" : "#888888", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            {f}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
        {Object.entries(FORMAT_COLORS).map(([fmt, color]) => {
          const count = ideas.filter(i => i.format.includes(fmt) && !i.used).length;
          return (
            <div key={fmt} style={{ background: "#161616", borderRadius: 10, padding: "10px 16px", border: "1px solid rgba(255,255,255,0.07)", borderLeft: "3px solid " + color }}>
              <div style={{ fontSize: 11, color: "#888888", marginBottom: 2 }}>{fmt}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{count}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map(idea => (
          <div key={idea.id} style={{ background: idea.used ? "#111" : "#1E1E1E", borderRadius: 14, border: "1px solid " + (idea.used ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.07)"), borderLeft: "3px solid " + getFormatColor(idea.format), opacity: idea.used ? 0.5 : 1 }}>
            <div style={{ padding: "16px 18px", cursor: "pointer" }} onClick={() => setExpanded(expanded === idea.id ? null : idea.id)}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: idea.used ? "#888888" : "#fff", lineHeight: 1.5, marginBottom: 10 }}>"{idea.hook}"</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ background: getFormatColor(idea.format) + "22", color: getFormatColor(idea.format), fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5 }}>{idea.format.split(" — ")[0]}</span>
                    <span style={{ fontSize: 11, color: "#888888" }}>@{idea.account}</span>
                    <span style={{ fontSize: 11, color: "#888888" }}>·</span>
                    <span style={{ fontSize: 11, color: "#888888" }}>{idea.plays ? (idea.plays / 1000000).toFixed(1) + "M plays" : "—"}</span>
                    <span style={{ fontSize: 11, color: "#888888" }}>·</span>
                    <span style={{ fontSize: 11, color: "#888888" }}>{idea.date}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                  <a href={idea.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ background: "#161616", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "6px 12px", color: "#FF6B00", fontSize: 11, fontWeight: 700, textDecoration: "none" }}>Watch</a>
                  <button onClick={e => { e.stopPropagation(); toggleUsed(idea.id); }} style={{ background: idea.used ? "#161616" : "#00D08422", border: "1px solid " + (idea.used ? "rgba(255,255,255,0.07)" : "#00D084"), borderRadius: 8, padding: "6px 12px", color: idea.used ? "#888888" : "#00D084", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                    {idea.used ? "Used" : "Mark Used"}
                  </button>
                  <span style={{ color: "#888888", fontSize: 14 }}>{expanded === idea.id ? "▲" : "▼"}</span>
                </div>
              </div>
            </div>
            {expanded === idea.id && (
              <div style={{ padding: "0 18px 18px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
                  <div style={{ background: "#161616", borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ fontSize: 10, color: "#888888", fontWeight: 700, marginBottom: 6 }}>FORMAT</div>
                    <div style={{ fontSize: 13, color: "#fff" }}>{idea.format}</div>
                  </div>
                  <div style={{ background: "#161616", borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ fontSize: 10, color: "#888888", fontWeight: 700, marginBottom: 6 }}>ANGLE</div>
                    <div style={{ fontSize: 13, color: "#fff" }}>{idea.angle}</div>
                  </div>
                  <div style={{ background: "#161616", borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ fontSize: 10, color: "#888888", fontWeight: 700, marginBottom: 6 }}>CTA</div>
                    <div style={{ fontSize: 13, color: "#FF6B00", fontWeight: 700 }}>{idea.cta}</div>
                  </div>
                  <div style={{ background: "#161616", borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ fontSize: 10, color: "#888888", fontWeight: 700, marginBottom: 6 }}>WHY IT WORKS</div>
                    <div style={{ fontSize: 13, color: "#fff", lineHeight: 1.5 }}>{idea.why}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
