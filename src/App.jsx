import IdeasBank from "./IdeasBank.jsx";
import Scripts from "./Scripts.jsx";
import Board from "./Board.jsx";
import { useState, useEffect } from "react";
import { getIdeas, getNotifications, getStatus, pauseScraping, resumeScraping, scrapeNow, analyzeNow, generateScript, getIntelligence } from "./api.js";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const C = {
  bg: "#0D0D0D", card: "#161616", card2: "#1E1E1E", sidebar: "#111111",
  orange: "#FF6B00", green: "#00D084", purple: "#7C3AED", blue: "#3B82F6",
  text: "#FFFFFF", muted: "#888888", border: "rgba(255,255,255,0.07)",
};

const revenueData = [
  {day:1,rev:497,sales:1},{day:3,rev:994,sales:2},{day:5,rev:497,sales:1},
  {day:7,rev:1491,sales:3},{day:9,rev:497,sales:1},{day:11,rev:994,sales:2},
  {day:13,rev:1988,sales:4},{day:15,rev:497,sales:1},{day:17,rev:1491,sales:3},
  {day:19,rev:994,sales:2},{day:21,rev:497,sales:1},{day:23,rev:1491,sales:3},
  {day:25,rev:994,sales:2},
];

const Tag = ({ label }) => {
  const map = {
    "Talking Head":{bg:"#2D1B69",c:"#A78BFA"},"Value":{bg:"#0F2A1A",c:"#00D084"},
    "Silent":{bg:"#0F1E2A",c:"#60A5FA"},"Trending Audio":{bg:"#2A0F0F",c:"#F87171"},
    "HIGH":{bg:"#2A0F0F",c:"#F87171"},"MED":{bg:"#2A1A0F",c:"#FB923C"},
    "LOW":{bg:"#222",c:"#666"},"MIKE":{bg:"#2A1200",c:"#FF6B00"},
    "SAKURA":{bg:"#1A1230",c:"#A78BFA"},"NEW":{bg:"#FF6B00",c:"#fff"},
    "DONE":{bg:"#0F2A1A",c:"#00D084"},"RUNNING":{bg:"#0F1E2A",c:"#60A5FA"},
    "QUEUED":{bg:"#222",c:"#888"},
  };
  const s = map[label]||{bg:"#222",c:"#888"};
  return <span style={{background:s.bg,color:s.c,fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:6,display:"inline-block",letterSpacing:0.3}}>{label}</span>;
};

const CustomTooltip = ({active,payload}) => {
  if(!active||!payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{background:"#1E1E1E",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"10px 16px"}}>
      <div style={{fontSize:12,color:C.muted,marginBottom:4}}>Day {d.day}</div>
      <div style={{fontSize:18,fontWeight:800,color:C.green}}>${d.rev.toLocaleString()}</div>
      <div style={{fontSize:12,color:C.muted}}>{d.sales} sale{d.sales!==1?"s":""}</div>
    </div>
  );
};

function Dashboard({realIdeas=[], lastUpdated=null}) {
  const [scriptModal, setScriptModal] = useState(null);
  const [scriptLoading, setScriptLoading] = useState(false);
  const [missions, setMissions] = useState([
    {id:1,label:"Record 5 videos",done:false},{id:2,label:"Post 2 short-form videos",done:false},
    {id:3,label:"Review analytics",done:false},{id:4,label:"Engage with 10 comments",done:false},
    {id:5,label:"Script tomorrow's content",done:false},{id:6,label:"Update course module",done:false},
    {id:7,label:"Check ManyChat leads",done:false},
  ]);
  const [pipeline] = useState([
    {id:1,hook:"5 mistakes killing your content",format:"Talking Head",cta:"Download Guide",status:"idea"},
    {id:2,hook:"How I made $10k in 30 days",format:"Value",cta:"Course Link",status:"idea"},
    {id:3,hook:"Why most creators fail",format:"Silent",cta:"Watch Now",status:"scripted"},
    {id:4,hook:"The algorithm changed again",format:"Trending Audio",cta:"Learn More",status:"recorded"},
    {id:5,hook:"My daily routine exposed",format:"Talking Head",cta:"Free PDF",status:"recorded"},
    {id:6,hook:"3 tools I use every day",format:"Value",cta:"Tool Links",status:"posted"},
  ]);
  const defaultIdeas = [
    {hook:"AI creators are going viral. Real creators are going broke. Here's why.",format:"Talking Head"},
    {hook:"Hot take: brand deals are making creators broke and they don't even know it",format:"Value"},
    {hook:"Your audience doesn't need to be big. It needs to be YOURS.",format:"Talking Head"},
    {hook:"Everyone's teaching you how to go viral. Nobody's teaching you how to get paid.",format:"Value"},
    {hook:"I could've taken brand deals. Instead I built something I own. Here's the math.",format:"Talking Head"},
  ];
  const [ideas, setIdeas] = useState(defaultIdeas);
  useEffect(() => { if(realIdeas.length > 0) setIdeas(realIdeas); }, [realIdeas]);
  const [priorities] = useState([
    {label:"Launch viral masterclass course",priority:"HIGH",assignee:"MIKE",action:true},
    {label:"Analyze top performing content",priority:"MED",assignee:"SAKURA",action:false},
    {label:"Update email sequence",priority:"LOW",assignee:"SAKURA",action:false},
    {label:"Set up ManyChat keyword flows",priority:"HIGH",assignee:"MIKE",action:true},
  ]);

  const done = missions.filter(m=>m.done).length;
  const handleScript = (idea) => {
    setScriptLoading(true);
    setScriptModal({hook: idea.hook, script: 'Generating script...'});
    generateScript(idea.hook, idea.format, idea.cta).then(d => {
      setScriptModal({hook: idea.hook, script: d.script || 'Failed to generate script'});
      setScriptLoading(false);
    }).catch(() => { setScriptModal({hook: idea.hook, script: 'Error — is the API running?'}); setScriptLoading(false); });
  };
  const statusC = {idea:C.orange,scripted:"#EAB308",recorded:C.blue,posted:C.green};
  const cols = ["idea","scripted","recorded","posted"];
  const colLabel = {idea:"IDEA",scripted:"SCRIPTED",recorded:"RECORDED",posted:"POSTED"};

  return (
    <div style={{padding:"36px 40px",overflowY:"auto",height:"100%"}}>
      {scriptModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setScriptModal(null)}>
          <div style={{background:"#1E1E1E",borderRadius:16,padding:32,width:560,maxWidth:"90vw",border:"1px solid rgba(255,255,255,0.1)"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:12,color:"#888",marginBottom:8}}>HOOK</div>
            <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:20,lineHeight:1.5}}>"{scriptModal.hook}"</div>
            <div style={{fontSize:12,color:"#888",marginBottom:8}}>SCRIPT</div>
            <div style={{fontSize:14,color:scriptLoading?"#555":"#fff",lineHeight:1.7,background:"#161616",borderRadius:10,padding:"16px",whiteSpace:"pre-wrap"}}>{scriptModal.script}</div>
            <div style={{display:"flex",gap:10,marginTop:20,justifyContent:"flex-end"}}>
              <button onClick={()=>{navigator.clipboard.writeText(scriptModal.script)}} style={{background:"#FF6B00",border:"none",borderRadius:8,padding:"9px 20px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Copy Script</button>
              <button onClick={()=>setScriptModal(null)} style={{background:"#161616",border:"1px solid rgba(255,255,255,0.07)",borderRadius:8,padding:"9px 20px",color:"#888",fontSize:13,cursor:"pointer"}}>Close</button>
            </div>
          </div>
        </div>
      )}
      <h1 style={{fontSize:48,fontWeight:900,color:"#fff",marginBottom:32,letterSpacing:-1,lineHeight:1}}>Good morning, Mike.</h1>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:36}}>
        {[
          {label:"Followers",val:"—",sub:"Update via Sakura",grad:"linear-gradient(135deg,#FF6B00,#DC2626)"},
          {label:"Monthly Views",val:"—",sub:"Connect analytics",grad:"linear-gradient(135deg,#7C3AED,#3B82F6)"},
          {label:"Course Revenue",val:"$0",sub:"0 sales this month",grad:"linear-gradient(135deg,#00D084,#0891B2)"},
          {label:"Posts Published",val:"0",sub:"0 this month",grad:null},
        ].map((s,i)=>(
          <div key={i} style={{background:s.grad||C.card,backgroundImage:s.grad,borderRadius:18,padding:"24px 22px",border:s.grad?"none":`1px solid ${C.border}`}}>
            <div style={{fontSize:13,color:s.grad?"rgba(255,255,255,0.75)":C.muted,marginBottom:8}}>{s.label}</div>
            <div style={{fontSize:34,fontWeight:900,color:"#fff",lineHeight:1,marginBottom:8}}>{s.val}</div>
            <div style={{fontSize:13,color:s.grad?"rgba(255,255,255,0.65)":C.muted}}>{s.sub}</div>
          </div>
        ))}
      </div>
      <div style={{background:C.card,borderRadius:18,padding:"26px 28px",marginBottom:28,border:`1px solid ${C.border}`}}>
        <h2 style={{fontSize:20,fontWeight:800,color:"#fff",marginBottom:22}}>Content Pipeline</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
          {cols.map(status=>(
            <div key={status}>
              <div style={{fontSize:11,fontWeight:800,color:statusC[status],letterSpacing:2,marginBottom:12}}>{colLabel[status]}</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {pipeline.filter(p=>p.status===status).map(p=>(
                  <div key={p.id} style={{background:C.card2,borderRadius:12,padding:"13px 14px",borderLeft:`3px solid ${statusC[status]}`}}>
                    <div style={{fontSize:13,fontWeight:600,color:"#fff",marginBottom:8,lineHeight:1.4}}>{p.hook}</div>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}><Tag label={p.format}/><span style={{fontSize:11,color:C.muted}}>{p.cta}</span></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"3fr 2fr",gap:20,marginBottom:28}}>
        <div style={{background:C.card,borderRadius:18,padding:"26px 28px",border:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}><h2 style={{fontSize:20,fontWeight:800,color:"#fff",margin:0}}>Today's Ideas</h2>{lastUpdated && <span style={{fontSize:11,color:"#555"}}>Last Updated: {lastUpdated}</span>}</div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
            {ideas.map((idea,i)=>(
              <div key={i} style={{background:C.card2,borderRadius:12,padding:"13px 16px",display:"flex",alignItems:"center",gap:12,border:`1px solid ${C.border}`}}>
                <span style={{fontSize:16,color:C.orange,flexShrink:0}}>💡</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,color:"#fff",marginBottom:6,lineHeight:1.4}}>{idea.hook}</div>
                  <Tag label={idea.format}/>
                </div>
                <button onClick={()=>handleScript(idea)} style={{background:"transparent",border:"none",color:C.orange,fontSize:13,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>Script →</button>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>analyzeNow().then(()=>setTimeout(()=>getIdeas().then(d=>{if(d.ideas&&d.ideas.length>0)setIdeas(d.ideas);}),5000))} style={{flex:1,background:C.orange,border:"none",color:"#fff",borderRadius:10,padding:"13px",fontSize:14,fontWeight:700,cursor:"pointer"}}>Generate 20 Ideas</button>
            <button onClick={()=>getIdeas().then(d=>{if(d.ideas&&d.ideas.length>0)setIdeas(d.ideas);})} style={{background:C.card2,border:`1px solid ${C.border}`,color:"#fff",borderRadius:10,padding:"13px 18px",fontSize:14,cursor:"pointer"}}>↻ Refresh</button>
          </div>
        </div>
        <div style={{background:C.card,borderRadius:18,padding:"26px 28px",border:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
            <span style={{fontSize:20,color:C.orange}}>✦</span>
            <h2 style={{fontSize:20,fontWeight:800,color:"#fff"}}>SakuraOS</h2>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:22}}>
            <span style={{fontSize:13,color:C.muted}}>Autonomous operator</span>
            <div style={{width:7,height:7,borderRadius:"50%",background:C.green}}/>
            <span style={{fontSize:13,color:C.green}}>online</span>
          </div>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:10,fontWeight:800,color:C.muted,letterSpacing:2,marginBottom:10}}>COMPLETED</div>
            {["Analyzed top 10 competitor accounts","Generated 10 hook ideas","Transcribed 30 reels"].map((t,i)=>(
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:8}}>
                <span style={{color:C.green,fontSize:13}}>⊙</span>
                <span style={{fontSize:13,color:C.muted,textDecoration:"line-through"}}>{t}</span>
              </div>
            ))}
          </div>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:10,fontWeight:800,color:C.blue,letterSpacing:2,marginBottom:10}}>IN PROGRESS</div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:C.blue}}/>
              <span style={{fontSize:13,color:"#fff"}}>Monitoring trending topics</span>
            </div>
          </div>
          <div style={{marginBottom:20}}>
            <div style={{fontSize:10,fontWeight:800,color:C.muted,letterSpacing:2,marginBottom:10}}>UPCOMING</div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{color:C.muted,fontSize:13}}>⏱</span>
              <span style={{fontSize:13,color:C.muted}}>Daily analytics report (6 PM)</span>
            </div>
          </div>
          <div style={{background:"#1E0D00",border:`1px solid #FF6B0033`,borderRadius:12,padding:"13px 16px"}}>
            <div style={{fontSize:11,fontWeight:800,color:C.orange,marginBottom:4}}>What's Next?</div>
            <div style={{fontSize:13,color:"#fff",lineHeight:1.4}}>Review 3 high-virality hooks for tomorrow's content</div>
          </div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        <div style={{background:C.card,borderRadius:18,padding:"26px 28px",border:`1px solid ${C.border}`}}>
          <h2 style={{fontSize:20,fontWeight:800,color:C.orange,marginBottom:18}}>Mike's Daily Missions</h2>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <span style={{fontSize:13,color:C.muted}}>Progress</span>
            <span style={{fontSize:13,color:C.orange,fontWeight:700}}>{done}/7 complete</span>
          </div>
          <div style={{background:"#222",borderRadius:99,height:4,marginBottom:20}}>
            <div style={{background:C.orange,height:4,borderRadius:99,width:`${(done/7)*100}%`,transition:"width 0.3s"}}/>
          </div>
          {missions.map(m=>(
            <div key={m.id} onClick={()=>setMissions(missions.map(x=>x.id===m.id?{...x,done:!x.done}:x))}
              style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",cursor:"pointer",borderBottom:`1px solid ${C.border}`}}>
              <div style={{width:20,height:20,borderRadius:5,border:`2px solid ${m.done?C.orange:"#444"}`,background:m.done?C.orange:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {m.done&&<span style={{color:"#fff",fontSize:11,fontWeight:900}}>✓</span>}
              </div>
              <span style={{fontSize:14,color:m.done?C.muted:"#fff",textDecoration:m.done?"line-through":"none"}}>{m.label}</span>
            </div>
          ))}
        </div>
        <div style={{background:C.card,borderRadius:18,padding:"26px 28px",border:`1px solid ${C.border}`}}>
          <h2 style={{fontSize:20,fontWeight:800,color:"#fff",marginBottom:20}}>Monthly Priorities</h2>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {priorities.map((p,i)=>(
              <div key={i} style={{background:C.card2,borderRadius:12,padding:"16px",border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                <div>
                  <div style={{fontSize:14,fontWeight:600,color:"#fff",marginBottom:8}}>{p.label}</div>
                  <div style={{display:"flex",gap:6}}><Tag label={p.priority}/><Tag label={p.assignee}/></div>
                </div>
                {p.action&&<span style={{background:"#2A0A0A",color:"#F87171",fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:6,whiteSpace:"nowrap"}}>Action Required</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Intelligence() {
  const [filter,setFilter] = useState("All");
  const [intelData, setIntelData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const filters = ["All","Talking Head","Value","Silent","Trending Audio"];

  useEffect(() => {
    getIntelligence().then(d => {
      setIntelData(d);
      setLastUpdated(d.stats?.lastUpdated || null);
    }).catch(() => {});
  }, []);

  const content = intelData?.topContent?.map(r => ({
    account: "@" + r.account,
    plays: r.plays >= 1000000 ? (r.plays/1000000).toFixed(1)+"M" : r.plays >= 1000 ? (r.plays/1000).toFixed(0)+"K" : r.plays.toString(),
    hook: r.caption || r.transcript?.substring(0, 80) || "No caption",
    format: "Talking Head",
    isNew: true,
    url: r.url,
  })) || [
    {account:"@therealbrianmark",plays:"2.5M",hook:"Dm me '10k' to grow your fitness business",format:"Value",isNew:true},
    {account:"@jun_yuh",plays:"939K",hook:"if i had to restart from zero......",format:"Talking Head",isNew:false},
    {account:"@meagnunez",plays:"720K",hook:"Most creators are posting. You should be building a money machine.",format:"Value",isNew:true},
    {account:"@ginnyfears",plays:"840K",hook:"This simple shift changed the entire game for me",format:"Talking Head",isNew:true},
    {account:"@minolee.mp4",plays:"555K",hook:"Day 32 of road to $100k a MONTH before leaving college",format:"Silent",isNew:false},
    {account:"@brock11johnson",plays:"270K",hook:"IF YOU WANT MORE VIEWS THIS MUST HAPPEN",format:"Talking Head",isNew:false},
    {account:"@personalbrandlaunch",plays:"385K",hook:"0 to 10,000 in a Month",format:"Value",isNew:true},
    {account:"@brandonfergg",plays:"302K",hook:"The day I stopped copying other creators was the day everything changed",format:"Trending Audio",isNew:false},
  ];
  const leaderboard = intelData?.leaderboard?.map((r,i) => ({
    rank: i+1,
    account: "@"+r.account,
    hook: r.url ? r.account : r.account,
    plays: r.topPlays >= 1000000 ? (r.topPlays/1000000).toFixed(1)+"M" : (r.topPlays/1000).toFixed(0)+"K",
    followers: "—",
    score: r.score,
    format: "Talking Head",
    isMe: r.account === "realmikerari",
    url: r.url,
  })) || [
    {rank:1,account:"@therealbrianmark",hook:"Dm me '10k' to grow...",plays:"2.5M",followers:"480K",score:98,format:"Value",isMe:false},
    {rank:2,account:"@ginnyfears",hook:"This simple shift changed...",plays:"840K",followers:"200K",score:91,format:"Talking Head",isMe:false},
    {rank:3,account:"@realmikerari",hook:"The TOGI Mentality needs to be studied",plays:"837K",followers:"—",score:88,format:"Talking Head",isMe:true},
    {rank:4,account:"@jun_yuh",hook:"if i had to restart from zero",plays:"939K",followers:"5.1M",score:72,format:"Talking Head",isMe:false},
    {rank:5,account:"@meagnunez",hook:"You should be building a money machine",plays:"720K",followers:"80K",score:67,format:"Value",isMe:false},
  ];
  const filtered = filter==="All"?content:content.filter(c=>c.format===filter);
  const sc = s=>s>=90?C.green:s>=75?"#EAB308":C.orange;

  return (
    <div style={{padding:"36px 40px",overflowY:"auto",height:"100%"}}>
      <h1 style={{fontSize:40,fontWeight:900,color:"#fff",marginBottom:6,letterSpacing:-0.5}}>Content Intelligence</h1>
      <div style={{fontSize:14,color:C.muted,marginBottom:32}}>Last Updated: {lastUpdated || new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:28}}>
        {[
          {label:"Trending formats this week",val:"Talking Head + Value",tags:["Talking Head","Value"]},
          {label:"Highest virality score in niche",val:intelData?.stats?.topViralScore?.toString()||"98",sub:"@"+(intelData?.stats?.topViralAccount||"therealbrianmark")},
          {label:"Total reels tracked",val:intelData?.stats?.totalReels?.toString()||"194",sub:intelData?.stats?.totalAccounts+" accounts",green:true},
        ].map((s,i)=>(
          <div key={i} style={{background:C.card,borderRadius:16,padding:24,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:13,color:C.muted,marginBottom:10}}>{s.label}</div>
            <div style={{fontSize:26,fontWeight:900,color:"#fff",marginBottom:8}}>{s.val}</div>
            {s.sub&&<div style={{fontSize:13,color:s.green?C.green:C.muted}}>{s.sub}</div>}
            {s.tags&&<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{s.tags.map(t=><Tag key={t} label={t}/>)}</div>}
          </div>
        ))}
      </div>
      <div style={{background:C.card,borderRadius:18,padding:"26px 28px",marginBottom:28,border:`1px solid ${C.border}`}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22,flexWrap:"wrap",gap:12}}>
          <h2 style={{fontSize:20,fontWeight:800,color:"#fff"}}>This Week's Top Content</h2>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {filters.map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={{background:filter===f?C.orange:C.card2,border:`1px solid ${filter===f?C.orange:C.border}`,color:filter===f?"#fff":C.muted,borderRadius:8,padding:"6px 14px",fontSize:13,cursor:"pointer",fontWeight:filter===f?700:400}}>{f}</button>
            ))}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {filtered.map((item,i)=>(
            <div key={i} style={{background:C.card2,borderRadius:12,padding:"18px 20px",border:`1px solid ${C.border}`,position:"relative"}}>
              {item.isNew&&<div style={{position:"absolute",top:14,right:14}}><Tag label="NEW"/></div>}
              <div style={{fontSize:13,color:C.muted,marginBottom:4}}>{item.account}</div>
              <div style={{fontSize:30,fontWeight:900,color:"#fff",marginBottom:8}}>{item.plays}</div>
              <div style={{fontSize:13,color:"#fff",marginBottom:14,lineHeight:1.4,paddingRight:40}}>{item.hook}</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <Tag label={item.format}/>
                <div style={{display:"flex",gap:14}}>
                  <span style={{fontSize:13,color:C.muted,cursor:"pointer"}}>⬡ Watch</span>
                  <span style={{fontSize:13,color:C.orange,cursor:"pointer",fontWeight:700}}>✦ Mike Rari-ify</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:C.card,borderRadius:18,padding:"26px 28px",border:`1px solid ${C.border}`}}>
        <h2 style={{fontSize:20,fontWeight:800,color:"#fff",marginBottom:22}}>Virality Score Leaderboard</h2>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{borderBottom:`1px solid ${C.border}`}}>
              {["Rank","Account","Hook","Plays","Followers","Virality Score","Format"].map(h=>(
                <th key={h} style={{fontSize:12,color:C.muted,fontWeight:600,padding:"0 12px 12px",textAlign:"left"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((r,i)=>(
              <tr key={i} style={{background:r.isMe?"#1A0A00":"transparent",borderBottom:`1px solid ${C.border}`}}>
                <td style={{padding:"13px 12px"}}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:i===0?C.orange:r.isMe?"#3A1500":"#222",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"#fff"}}>{r.rank}</div>
                </td>
                <td style={{padding:"13px 12px",fontSize:14,color:r.isMe?C.orange:"#fff",fontWeight:r.isMe?700:400}}>
                  {r.account}{r.isMe&&<span style={{fontSize:11,color:C.muted,marginLeft:6}}>(You)</span>}
                </td>
                <td style={{padding:"13px 12px",fontSize:13,color:C.muted,maxWidth:180}}>{r.hook}</td>
                <td style={{padding:"13px 12px",fontSize:14,color:"#fff",fontWeight:600}}>{r.plays}</td>
                <td style={{padding:"13px 12px",fontSize:14,color:C.muted}}>{r.followers}</td>
                <td style={{padding:"13px 12px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:80,height:4,background:"#222",borderRadius:99}}>
                      <div style={{width:`${r.score}%`,height:4,background:sc(r.score),borderRadius:99}}/>
                    </div>
                    <span style={{fontSize:14,fontWeight:800,color:sc(r.score)}}>{r.score}</span>
                  </div>
                </td>
                <td style={{padding:"13px 12px"}}><Tag label={r.format}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Revenue() {
  const [activeIdx,setActiveIdx] = useState(null);
  const salesLog = [
    {date:"Mar 18, 2026",num:142},{date:"Mar 17, 2026",num:141},
    {date:"Mar 16, 2026",num:140},{date:"Mar 15, 2026",num:139},
    {date:"Mar 14, 2026",num:138},{date:"Mar 13, 2026",num:137},
    {date:"Mar 12, 2026",num:136},
  ];
  const keywords = [
    {kw:"PIPELINE",leads:33,conv:11,rate:33.3},{kw:"VIRAL",leads:61,conv:15,rate:24.6},
    {kw:"SYSTEM",leads:47,conv:12,rate:25.5},{kw:"FREE",leads:38,conv:9,rate:23.7},
    {kw:"SETUP",leads:29,conv:7,rate:24.1},
  ].sort((a,b)=>b.rate-a.rate);
  const total = salesLog.length*497;
  const avg = Math.round(total/18);

  return (
    <div style={{padding:"36px 40px",overflowY:"auto",height:"100%"}}>
      <h1 style={{fontSize:40,fontWeight:900,color:"#fff",marginBottom:4,letterSpacing:-0.5}}>Revenue</h1>
      <div style={{fontSize:14,color:C.muted,marginBottom:32}}>MON3TIZE Masterclass</div>
      <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr 1fr",gap:16,marginBottom:28}}>
        <div style={{background:"linear-gradient(135deg,#00D084,#0891B2)",borderRadius:18,padding:"26px 24px"}}>
          <div style={{fontSize:13,color:"rgba(255,255,255,0.8)",marginBottom:8}}>Total Revenue</div>
          <div style={{fontSize:40,fontWeight:900,color:"#fff",lineHeight:1}}>${total.toLocaleString()}</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,0.7)",marginTop:8}}>↗ +18% vs last month</div>
        </div>
        {[{label:"Total Sales",val:salesLog.length,sub:"This month"},{label:"Avg Revenue / Day",val:`$${avg}`,sub:"This month"}].map((s,i)=>(
          <div key={i} style={{background:C.card,borderRadius:18,padding:"26px 24px",border:`1px solid ${C.border}`}}>
            <div style={{fontSize:13,color:C.muted,marginBottom:8}}>{s.label}</div>
            <div style={{fontSize:40,fontWeight:900,color:"#fff",lineHeight:1}}>{s.val}</div>
            <div style={{fontSize:13,color:C.muted,marginTop:8}}>{s.sub}</div>
          </div>
        ))}
      </div>
      <div style={{background:C.card,borderRadius:18,padding:"26px 28px",marginBottom:28,border:`1px solid ${C.border}`}}>
        <h2 style={{fontSize:20,fontWeight:800,color:"#fff",marginBottom:24}}>Monthly Revenue</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={revenueData} style={{outline:"none"}} tabIndex={-1} onMouseLeave={()=>setActiveIdx(null)} barCategoryGap="30%">
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill:C.muted,fontSize:12}}/>
            <YAxis axisLine={false} tickLine={false} tick={{fill:C.muted,fontSize:12}} tickFormatter={v=>`$${v}`}/>
            <Tooltip content={<CustomTooltip/>} cursor={false}/>
            <Bar dataKey="rev" radius={[8,8,0,0]} onMouseEnter={(_,i)=>setActiveIdx(i)}>
              {revenueData.map((_,i)=><Cell key={i} fill={activeIdx===i?"#00F5A0":C.green}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        <div style={{background:C.card,borderRadius:18,padding:"26px 28px",border:`1px solid ${C.border}`}}>
          <h2 style={{fontSize:20,fontWeight:800,color:"#fff",marginBottom:18}}>Recent Sales</h2>
          {salesLog.map((s,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 0",borderBottom:`1px solid ${C.border}`}}>
              <div>
                <div style={{fontSize:14,color:"#fff",fontWeight:500}}>{s.date}</div>
                <div style={{fontSize:12,color:C.muted}}>#{s.num}</div>
              </div>
              <div style={{fontSize:16,fontWeight:800,color:C.green}}>$497</div>
            </div>
          ))}
        </div>
        <div style={{background:C.card,borderRadius:18,padding:"26px 28px",border:`1px solid ${C.border}`}}>
          <h2 style={{fontSize:20,fontWeight:800,color:"#fff",marginBottom:18}}>ManyChat Keywords</h2>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{borderBottom:`1px solid ${C.border}`}}>
                {["Keyword","Leads","Conv.","Rate"].map(h=>(
                  <th key={h} style={{fontSize:12,color:C.muted,fontWeight:600,padding:"0 8px 12px",textAlign:"left"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {keywords.map((k,i)=>(
                <tr key={i} style={{borderBottom:`1px solid ${C.border}`}}>
                  <td style={{padding:"12px 8px",fontSize:14,fontWeight:800,color:"#fff"}}>{k.kw}</td>
                  <td style={{padding:"12px 8px",fontSize:14,color:C.muted}}>{k.leads}</td>
                  <td style={{padding:"12px 8px",fontSize:14,color:C.muted}}>{k.conv}</td>
                  <td style={{padding:"12px 8px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:50,height:4,background:"#222",borderRadius:99}}>
                        <div style={{width:`${Math.min(k.rate*3,100)}%`,height:4,background:C.green,borderRadius:99}}/>
                      </div>
                      <span style={{fontSize:13,fontWeight:700,color:C.green}}>{k.rate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Goals() {
  const bangkokDays = Math.ceil((new Date("2026-08-01")-new Date())/(1000*60*60*24));
  const goals = [
    {label:"Followers",icon:"📈",current:0,target:250000,unit:"",deadline:"Dec 2026",color:C.orange,bg:"#FF6B0022"},
    {label:"Monthly Revenue",icon:"💰",current:0,target:25000,unit:"$",deadline:"Aug 2026",color:C.green,bg:"#00D08422"},
    {label:"Course Sales",icon:"🛒",current:0,target:50,unit:"",deadline:"Jun 2026",color:C.purple,bg:"#7C3AED22"},
    {label:"Posts This Month",icon:"📄",current:0,target:120,unit:"",deadline:"Mar 31, 2026",color:C.blue,bg:"#3B82F622"},
  ];
  return (
    <div style={{padding:"36px 40px",overflowY:"auto",height:"100%"}}>
      <h1 style={{fontSize:40,fontWeight:900,color:"#fff",marginBottom:4,letterSpacing:-0.5}}>Goals</h1>
      <div style={{fontSize:14,color:C.muted,marginBottom:36}}>The scoreboard</div>
      <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:28}}>
        {goals.map((g,i)=>{
          const pct = g.target>0?Math.min((g.current/g.target)*100,100):0;
          const toGo = g.target-g.current;
          return (
            <div key={i} style={{background:C.card,borderRadius:18,padding:"24px 28px",border:`1px solid ${C.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div style={{width:48,height:48,borderRadius:14,background:g.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{g.icon}</div>
                  <div>
                    <div style={{fontSize:18,fontWeight:800,color:"#fff"}}>{g.label}</div>
                    <div style={{fontSize:13,color:C.muted}}>Deadline: {g.deadline}</div>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:34,fontWeight:900,color:"#fff",lineHeight:1}}>{g.unit}{g.current.toLocaleString()}</div>
                  <div style={{fontSize:13,color:C.muted}}>of {g.unit}{g.target.toLocaleString()}</div>
                </div>
              </div>
              <div style={{background:"#222",borderRadius:99,height:6}}>
                <div style={{background:g.color,height:6,borderRadius:99,width:`${pct}%`,minWidth:pct>0?6:0}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
                <span style={{fontSize:13,color:C.muted}}>{pct.toFixed(1)}% complete</span>
                <span style={{fontSize:13,color:g.color,fontWeight:700}}>{g.unit}{toGo.toLocaleString()} to go</span>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{background:"linear-gradient(135deg,#FF6B00,#DC2626)",borderRadius:18,padding:"32px 36px",marginBottom:28,textAlign:"center"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:12}}>
          <span style={{fontSize:24}}>✈️</span>
          <div style={{fontSize:22,fontWeight:800,color:"#fff"}}>Bangkok Countdown</div>
        </div>
        <div style={{fontSize:80,fontWeight:900,color:"#fff",lineHeight:1,marginBottom:8}}>{bangkokDays}</div>
        <div style={{fontSize:18,color:"rgba(255,255,255,0.8)"}}>days remaining</div>
        <div style={{fontSize:14,color:"rgba(255,255,255,0.65)",marginTop:8}}>Until the big move to Bangkok — August 2026</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
        {[
          {label:"Weekly Growth Rate",val:"+0%",sub:"Followers per week",color:C.green},
          {label:"Avg. Daily Revenue",val:"$0",sub:"This month",color:C.green},
          {label:"Consistency Streak",val:"0 days",sub:"Daily posts",color:C.orange},
        ].map((s,i)=>(
          <div key={i} style={{background:C.card,borderRadius:14,padding:"20px 22px",border:`1px solid ${C.border}`}}>
            <div style={{fontSize:13,color:C.muted,marginBottom:8}}>{s.label}</div>
            <div style={{fontSize:26,fontWeight:900,color:s.color}}>{s.val}</div>
            <div style={{fontSize:13,color:C.muted,marginTop:4}}>{s.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SakuraOS() {
  const missions = [
    {time:"06:00 AM",task:"Scraped 10 competitor accounts via Apify",status:"DONE"},
    {time:"06:30 AM",task:"Transcribed top 3 reels per account with Whisper",status:"DONE"},
    {time:"07:00 AM",task:"Analyzed 30 reels — type, niche fit, virality score",status:"DONE"},
    {time:"07:30 AM",task:"Generated 10 content ideas in Mike's voice",status:"DONE"},
    {time:"10:30 AM",task:"Scraped top 100 videos in niche",status:"DONE"},
    {time:"11:00 AM",task:"Monitoring trending topics in creator niche",status:"RUNNING"},
    {time:"06:00 PM",task:"Generate evening analytics summary",status:"QUEUED"},
    {time:"08:00 PM",task:"Prepare tomorrow's content suggestions",status:"QUEUED"},
  ];
  const skills = [
    {name:"Apify",desc:"Web scraping & automation",last:"2 min ago",active:true},
    {name:"Whisper",desc:"Audio transcription",last:"1 hour ago",active:true},
    {name:"Video Frames",desc:"Extract video thumbnails",last:"3 hours ago",active:false},
    {name:"Summarize",desc:"Content summarization",last:"30 min ago",active:true},
    {name:"Analytics",desc:"Data analysis & insights",last:"5 min ago",active:true},
    {name:"Vision",desc:"Image analysis",last:"2 days ago",active:false},
  ];
  const briefing = [
    "✓ Analyzed 20 competitor videos overnight. Identified 3 emerging hook patterns with 90%+ virality scores.",
    "✓ Generated 50 fresh content ideas based on trending topics in the creator economy niche.",
    "✓ Top recommendation: 'Why most creators quit after 90 days' format showing 85% higher engagement.",
    "⚡ Action item: 3 high-priority hooks ready for scripting. Review in 'Today's Ideas' section.",
    "📊 Your weekly growth rate is tracking. Stay consistent with daily posting.",
  ];
  const sc = {DONE:C.green,RUNNING:C.blue,QUEUED:"#555"};

  return (
    <div style={{padding:"36px 40px",overflowY:"auto",height:"100%"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:6}}>
        <span style={{fontSize:32,color:C.orange}}>✦</span>
        <h1 style={{fontSize:40,fontWeight:900,color:"#fff",letterSpacing:-0.5}}>SakuraOS</h1>
        <div style={{display:"flex",alignItems:"center",gap:6,background:"#0F2A1A",borderRadius:99,padding:"6px 14px",marginLeft:4}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:C.green}}/>
          <span style={{fontSize:13,color:C.green,fontWeight:700}}>Online</span>
        </div>
      </div>
      <div style={{fontSize:14,color:C.muted,marginBottom:32}}>Autonomous content creation operator</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:28}}>
        {[
          {label:"Model",val:"Claude Opus 4.6",sub:"via Vercel"},
          {label:"Status",val:"Online",sub:"All systems go",green:true},
          {label:"Last Active",val:"2 min ago",sub:"Analyzing content"},
          {label:"Tasks Today",val:"12",sub:"Completed",orange:true},
        ].map((s,i)=>(
          <div key={i} style={{background:C.card,borderRadius:14,padding:"20px",border:`1px solid ${C.border}`}}>
            <div style={{fontSize:12,color:C.muted,marginBottom:6}}>{s.label}</div>
            <div style={{fontSize:16,fontWeight:800,color:s.green?C.green:s.orange?C.orange:"#fff"}}>{s.val}</div>
            <div style={{fontSize:12,color:C.muted,marginTop:3}}>{s.sub}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"3fr 2fr",gap:20,marginBottom:28}}>
        <div style={{background:C.card,borderRadius:18,padding:"26px 28px",border:`1px solid ${C.border}`}}>
          <h2 style={{fontSize:20,fontWeight:800,color:"#fff",marginBottom:22}}>Mission Log</h2>
          <div style={{position:"relative"}}>
            <div style={{position:"absolute",left:11,top:6,bottom:6,width:1,background:C.border}}/>
            {missions.map((m,i)=>(
              <div key={i} style={{display:"flex",gap:20,marginBottom:16,paddingLeft:32,position:"relative"}}>
                <div style={{position:"absolute",left:5,top:5,width:13,height:13,borderRadius:"50%",background:sc[m.status],border:`2px solid ${C.bg}`}}/>
                <div style={{flex:1,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                  <div>
                    <div style={{fontSize:13,color:"#fff",lineHeight:1.4,marginBottom:3}}>{m.task}</div>
                    <div style={{fontSize:12,color:C.muted}}>{m.time}</div>
                  </div>
                  <Tag label={m.status}/>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{background:C.card,borderRadius:18,padding:"26px 28px",border:`1px solid ${C.border}`}}>
          <h2 style={{fontSize:20,fontWeight:800,color:"#fff",marginBottom:18}}>Skill Stack</h2>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {skills.map((s,i)=>(
              <div key={i} style={{background:C.card2,borderRadius:10,padding:"12px 14px",border:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:2}}>{s.name}</div>
                  <div style={{fontSize:12,color:C.muted}}>{s.desc}</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:2}}>Last: {s.last}</div>
                </div>
                <div style={{width:7,height:7,borderRadius:"50%",background:s.active?C.green:"#444"}}/>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{background:"linear-gradient(135deg,#1A0A4A,#0A0A3A)",borderRadius:18,padding:"28px 32px",marginBottom:28,border:`1px solid #7C3AED44`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,flexWrap:"wrap",gap:12}}>
          <div>
            <h2 style={{fontSize:20,fontWeight:800,color:C.purple}}>Sync with Claude</h2>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.5)",marginTop:2}}>Last synced: 9:00 AM today</div>
          </div>
          <button style={{background:"#fff",border:"none",color:C.purple,borderRadius:10,padding:"10px 20px",fontSize:13,fontWeight:800,cursor:"pointer"}}>Generate Session Briefing</button>
        </div>
        <div style={{background:"rgba(255,255,255,0.06)",borderRadius:12,padding:"18px 20px"}}>
          <div style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:12}}>Morning Briefing — {new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</div>
          {briefing.map((b,i)=>(
            <div key={i} style={{fontSize:13,color:"rgba(255,255,255,0.75)",marginBottom:8,lineHeight:1.5}}>{b}</div>
          ))}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
        {[
          {label:"Ideas Generated",val:"0",sub:"Total this month"},
          {label:"Videos Analyzed",val:"30",sub:"Competitor research"},
          {label:"Uptime",val:"99.8%",sub:"Last 30 days",green:true},
        ].map((s,i)=>(
          <div key={i} style={{background:C.card,borderRadius:14,padding:"20px 22px",border:`1px solid ${C.border}`}}>
            <div style={{fontSize:13,color:C.muted,marginBottom:8}}>{s.label}</div>
            <div style={{fontSize:28,fontWeight:900,color:s.green?C.green:"#fff"}}>{s.val}</div>
            <div style={{fontSize:13,color:C.muted,marginTop:4}}>{s.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Settings({scrapePaused, setScrapePaused}) {
  const [notifs,setNotifs] = useState({ideas:true,sales:true,sakura:false});
  const [theme,setTheme] = useState("Dark");
  const [saved, setSaved] = useState(false);
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div style={{padding:"36px 40px",overflowY:"auto",height:"100%"}}>
      <h1 style={{fontSize:40,fontWeight:900,color:"#fff",marginBottom:36,letterSpacing:-0.5}}>Settings</h1>
      <div style={{background:C.card,borderRadius:18,padding:"26px 28px",marginBottom:20,border:`1px solid ${C.border}`}}>
        <h2 style={{fontSize:20,fontWeight:800,color:"#fff",marginBottom:20}}>🔔 Notifications</h2>
        {[
          {label:"New Ideas Ready",desc:"Get notified when Sakura generates daily ideas",key:"ideas"},
          {label:"New Course Sales",desc:"Get notified of new course sales",key:"sales"},
          {label:"SakuraOS Updates",desc:"AI assistant activity notifications",key:"sakura"},
        ].map((item,i,arr)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 0",borderBottom:i<arr.length-1?`1px solid ${C.border}`:"none"}}>
            <div>
              <div style={{fontSize:14,fontWeight:600,color:"#fff",marginBottom:3}}>{item.label}</div>
              <div style={{fontSize:13,color:C.muted}}>{item.desc}</div>
            </div>
            <div onClick={()=>setNotifs({...notifs,[item.key]:!notifs[item.key]})}
              style={{width:44,height:24,borderRadius:99,background:notifs[item.key]?C.orange:"#333",cursor:"pointer",position:"relative",transition:"background 0.2s",flexShrink:0}}>
              <div style={{width:18,height:18,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:notifs[item.key]?23:3,transition:"left 0.2s"}}/>
            </div>
          </div>
        ))}
      </div>
      <div style={{background:C.card,borderRadius:18,padding:"26px 28px",marginBottom:20,border:`1px solid ${C.border}`}}>
        <h2 style={{fontSize:20,fontWeight:800,color:"#fff",marginBottom:20}}>🎨 Appearance</h2>
        <div style={{fontSize:14,color:C.muted,marginBottom:12}}>Theme</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {["Dark","Light","Auto"].map(t=>(
            <button key={t} onClick={()=>setTheme(t)} style={{background:"transparent",border:`${theme===t?"2px":"1px"} solid ${theme===t?C.orange:C.border}`,color:theme===t?"#fff":C.muted,borderRadius:10,padding:"14px",fontSize:14,fontWeight:theme===t?700:400,cursor:"pointer"}}>{t}</button>
          ))}
        </div>
      </div>
      <div style={{background:C.card,borderRadius:18,padding:"26px 28px",marginBottom:28,border:`1px solid ${C.border}`}}>
        <h2 style={{fontSize:20,fontWeight:800,color:"#fff",marginBottom:20}}>🤖 Sakura Automation</h2>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 0",borderBottom:`1px solid ${C.border}`}}>
          <div>
            <div style={{fontSize:14,fontWeight:600,color:"#fff",marginBottom:3}}>Daily Scraping</div>
            <div style={{fontSize:13,color:C.muted}}>{scrapePaused?"Paused — no credits being used":"Active — scraping 18 accounts at 6am PT"}</div>
          </div>
          <div onClick={()=>{ if(scrapePaused){ resumeScraping().then(()=>setScrapePaused(false)); } else { pauseScraping().then(()=>setScrapePaused(true)); } }} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",background:scrapePaused?"rgba(239,68,68,0.1)":"rgba(0,208,132,0.1)",border:"1px solid "+(scrapePaused?"#EF4444":"#00D084"),borderRadius:10,padding:"8px 16px"}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:scrapePaused?"#EF4444":"#00D084"}}/>
            <span style={{fontSize:13,fontWeight:700,color:scrapePaused?"#EF4444":"#00D084"}}>{scrapePaused?"Paused":"Active"}</span>
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 0"}}>
          <div>
            <div style={{fontSize:14,fontWeight:600,color:"#fff",marginBottom:3}}>Idea Generation</div>
            <div style={{fontSize:13,color:C.muted}}>Sakura generates 10 ideas daily after scraping</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,background:"rgba(0,208,132,0.1)",border:"1px solid #00D084",borderRadius:10,padding:"8px 16px"}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:"#00D084"}}/>
            <span style={{fontSize:13,fontWeight:700,color:"#00D084"}}>Active</span>
          </div>
        </div>
        {[
          {label:"Export Data",desc:"Download all your dashboard data"},
          {label:"Clear Cache",desc:"Reset local storage and preferences"},
        ].map((item,i)=>(
          <div key={i} style={{background:C.card2,borderRadius:12,padding:"16px 18px",marginBottom:10,cursor:"pointer",border:`1px solid ${C.border}`}}>
            <div style={{fontSize:14,fontWeight:600,color:"#fff",marginBottom:2}}>{item.label}</div>
            <div style={{fontSize:13,color:C.muted}}>{item.desc}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:12}}>
        <button onClick={handleSave} style={{background:saved?"#00D084":C.orange,border:"none",color:"#fff",borderRadius:10,padding:"14px 28px",fontSize:14,fontWeight:800,cursor:"pointer",transition:"background 0.3s"}}>{saved?"Saved!":"Save Changes"}</button>
        <button onClick={()=>window.location.reload()} style={{background:C.card2,border:`1px solid ${C.border}`,color:"#fff",borderRadius:10,padding:"14px 28px",fontSize:14,cursor:"pointer"}}>Cancel</button>
      </div>
    </div>
  );
}

export default function RarisDashboard() {
  const [active,setActive] = useState("dashboard");
  const [realIdeas, setRealIdeas] = useState([]);
  const [apiOnline, setApiOnline] = useState(false);
  const [ideasLastUpdated, setIdeasLastUpdated] = useState(null);

  useEffect(() => {
    getStatus().then(s => {
      setApiOnline(true);
      setScrapePaused(s.scrapePaused);
    }).catch(() => setApiOnline(false));
    getIdeas().then(d => {
      if (d.ideas && d.ideas.length > 0) setRealIdeas(d.ideas);
      if (d.lastUpdated) setIdeasLastUpdated(d.lastUpdated);
    }).catch(() => {});
    getNotifications().then(n => {
      if (n && n.length > 0) setNotifications(n.map((notif, i) => ({...notif, id: i+1, read: notif.read || false})));
    }).catch(() => {});
  }, []);
  const [scrapePaused, setScrapePaused] = useState(false);

  const [notifications, setNotifications] = useState([
    {id:1,type:"scrape_complete",category:"content",message:"Daily scrape finished — 18 accounts scraped",time:"6:00 AM",read:false},
    {id:2,type:"ideas_ready",category:"content",message:"10 new ideas generated by Sakura",time:"6:32 AM",read:false},
    {id:3,type:"inactive",category:"system",message:"@bonusfootage inactive for 6 days",time:"6:01 AM",read:true},
    {id:4,type:"cron",category:"system",message:"6am cron job completed successfully",time:"6:45 AM",read:false},
    {id:5,type:"goal",category:"personal",message:"Bangkok countdown: 132 days to go",time:"Today",read:true},
  ]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifFilter, setNotifFilter] = useState("All");
  const unreadCount = notifications.filter(n => !n.read).length;
  const markAllRead = () => setNotifications(prev => prev.map(n => ({...n, read: true})));
  const nav = [
    {id:"dashboard",label:"Dashboard",icon:"⊞"},
    {id:"intelligence",label:"Intelligence",icon:"◎"},
    {id:"revenue",label:"Revenue",icon:"$"},
    {id:"goals",label:"Goals",icon:"◎"},
    {id:"sakuraos",label:"SakuraOS",icon:"✦"},
    {id:"ideasbank",label:"Ideas Bank",icon:"◈"},{id:"scripts",label:"Scripts",icon:"✍"},{id:"board",label:"Board",icon:"▦"},
    {id:"settings",label:"Settings",icon:"⚙"},
  ];
  const pages = {
    dashboard:<Dashboard realIdeas={realIdeas} lastUpdated={ideasLastUpdated}/>,intelligence:<Intelligence/>,
    revenue:<Revenue/>,goals:<Goals/>,
    sakuraos:<SakuraOS/>,ideasbank:<IdeasBank/>,scripts:<Scripts/>,board:<Board/>,settings:<Settings scrapePaused={scrapePaused} setScrapePaused={setScrapePaused}/>
  };
  return (
    <div style={{display:"flex",height:"100vh",background:C.bg,fontFamily:"system-ui,-apple-system,sans-serif",overflow:"hidden"}}>
      <div style={{width:220,minWidth:220,background:C.sidebar,display:"flex",flexDirection:"column",borderRight:`1px solid ${C.border}`,height:"100%"}}>
        <div style={{padding:"28px 22px 24px"}}>
          <div style={{fontSize:15,fontWeight:900,color:C.orange,letterSpacing:1,lineHeight:1}}>RARI'S</div>
          <div style={{fontSize:15,fontWeight:900,color:"#fff",letterSpacing:1}}>DASHBOARD</div>
        </div>
        <nav style={{flex:1,padding:"0 10px"}}>
          {nav.map(item=>(
            <div key={item.id} onClick={()=>setActive(item.id)}
              style={{display:"flex",alignItems:"center",gap:12,padding:"11px 12px",borderRadius:10,cursor:"pointer",marginBottom:2,background:active===item.id?"rgba(255,107,0,0.12)":"transparent",borderLeft:active===item.id?`3px solid ${C.orange}`:"3px solid transparent",transition:"all 0.15s"}}>
              <span style={{fontSize:16,color:active===item.id?C.orange:C.muted}}>{item.icon}</span>
              <span style={{fontSize:14,fontWeight:active===item.id?700:400,color:active===item.id?C.orange:C.muted}}>{item.label}</span>
            </div>
          ))}
        </nav>
        <div style={{padding:"20px 22px",borderTop:`1px solid ${C.border}`}}>
          <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>MIKE RARI</div>
          <div style={{fontSize:12,color:C.muted}}>@realmikerari</div>
        </div>
      </div>
      <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
        <div style={{display:"flex",justifyContent:"flex-end",alignItems:"center",padding:"12px 24px 0",gap:12,position:"relative"}}>
          <div onClick={()=>setShowNotifs(!showNotifs)} style={{position:"relative",cursor:"pointer",background:"#1E1E1E",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"8px 12px",display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:16}}>🔔</span>
            {unreadCount>0 && <span style={{background:"#FF6B00",color:"#fff",fontSize:10,fontWeight:800,borderRadius:99,padding:"2px 6px",marginLeft:2}}>{unreadCount}</span>}
          </div>
          {showNotifs && <div style={{position:"absolute",top:44,right:24,background:"#161616",border:"1px solid rgba(255,255,255,0.1)",borderRadius:16,width:360,zIndex:999,boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}>
            <div style={{padding:"16px 16px 0"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div style={{fontSize:16,fontWeight:800,color:"#fff"}}>Notifications</div>
                <button onClick={markAllRead} style={{background:"transparent",border:"none",color:"#888",fontSize:12,cursor:"pointer",padding:4}}>↺ Refresh</button>
              </div>
              <div style={{display:"flex",gap:6,marginBottom:12}}>
                {["All","Content","Personal","System"].map(f=>{
                  const count = f==="All"?notifications.length:notifications.filter(n=>n.category===f.toLowerCase()).length;
                  return <button key={f} onClick={()=>setNotifFilter(f)} style={{background:notifFilter===f?"#FF6B00":"#1E1E1E",border:"1px solid "+(notifFilter===f?"#FF6B00":"rgba(255,255,255,0.07)"),borderRadius:20,padding:"4px 10px",color:notifFilter===f?"#fff":"#888",fontSize:11,fontWeight:700,cursor:"pointer"}}>{f} {count}</button>
                })}
              </div>
            </div>
            <div style={{maxHeight:360,overflowY:"auto",padding:"0 16px"}}>
              {notifications.filter(n=>notifFilter==="All"||n.category===notifFilter.toLowerCase()).map(n=>(
                <div key={n.id} onClick={()=>setNotifications(prev=>prev.map(x=>x.id===n.id?{...x,read:true}:x))} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"12px 0",borderBottom:"1px solid rgba(255,255,255,0.05)",cursor:"pointer"}}>
                  <div style={{width:36,height:36,borderRadius:10,background:n.read?"#1E1E1E":"rgba(255,107,0,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{n.type==="scrape_complete"?"⚡":n.type==="ideas_ready"?"💡":n.type==="inactive"?"⚠️":"🔔"}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:n.read?400:700,color:n.read?"#888":"#fff",lineHeight:1.4,marginBottom:3}}>{n.message}</div>
                    <div style={{fontSize:11,color:"#555"}}>{n.time}</div>
                  </div>
                  {!n.read && <div style={{width:8,height:8,borderRadius:"50%",background:"#FF6B00",flexShrink:0,marginTop:4}}/>}
                </div>
              ))}
              {notifications.length===0 && <div style={{fontSize:13,color:"#888",textAlign:"center",padding:"20px 0"}}>No notifications</div>}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",padding:"12px 16px",borderTop:"1px solid rgba(255,255,255,0.07)"}}>
              <button onClick={markAllRead} style={{background:"transparent",border:"none",color:"#888",fontSize:12,cursor:"pointer"}}>Mark all as read</button>
              <button style={{background:"transparent",border:"none",color:"#FF6B00",fontSize:12,fontWeight:700,cursor:"pointer"}}>View all</button>
            </div>
          </div>}
        </div>
        {pages[active]}
      </div>
    </div>
  );
}