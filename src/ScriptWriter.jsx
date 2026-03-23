import { useState } from "react";
import { generateScript } from "./api.js";

const C = { orange:"#FF6B00",green:"#00D084",purple:"#7C3AED" };
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const FORMATS = ["Format 1 — Social Leverage","Format 2 — Curiosity / Elimination","Format 3 — Value Drop","Format 4 — Storytelling","Format 5 — Bold Take"];
const TONES = ["Convicted","Raw / Unfiltered","Educational","Conversational"];
const HOOKS = [
  {name:"Reversal",desc:"Flip the expected answer. Everyone says X, but actually Y."},
  {name:"Elimination",desc:"Cross out options. Not X, not Y, not Z — it is THIS."},
  {name:"Social Leverage",desc:"Drop a creator name to borrow their authority."},
  {name:"Identity Trigger",desc:"Speak to who they are. If you are a creator who..."},
  {name:"Income Voyeurism",desc:"Reveal real numbers. A trainer makes $73K/month..."},
  {name:"Loss Scenario",desc:"Show what they lose by not acting. Every day you wait..."},
  {name:"Myth Busting",desc:"Challenge a belief. You have been lied to about..."},
  {name:"The Confession",desc:"Start with a mistake. I used to do X. I was wrong."},
  {name:"Future Pacing",desc:"Paint what is coming. 5 years from now, creators who..."},
  {name:"Pattern Interrupt",desc:"Start mid-sentence or unexpected. Breaks the scroll."},
];
const CTAS = ["Comment VIRAL","Comment PIPELINE","Comment SYSTEM","Comment FREE","Comment BUYERS","No CTA","Custom"];
const LENGTHS = [{label:"Standard (28-35 sec)",words:"170-210 words"},{label:"Extended (38-42 sec)",words:"225-250 words"}];

export default function ScriptWriter({onSaveScript}){
  const [idea,setIdea]=useState("");
  const [format,setFormat]=useState(FORMATS[0]);
  const [tones,setTones]=useState(["Convicted"]);
  const [hook,setHook]=useState(HOOKS[0].name);
  const [cta,setCta]=useState(CTAS[0]);
  const [customCta,setCustomCta]=useState("");
  const [length,setLength]=useState(LENGTHS[0]);
  const [loading,setLoading]=useState(false);
  const [result,setResult]=useState(null);
  const [suggestions,setSuggestions]=useState([]);
  const [saved,setSaved]=useState(false);
  const [hookText,setHookText]=useState("");
  const [bodyText,setBodyText]=useState("");
  const [ctaText,setCtaText]=useState("");
  const [showGuide,setShowGuide]=useState(false);
  const [fadeIn,setFadeIn]=useState(false);

  const hasIdea = idea.trim().length > 0;
  const toggleTone = t => setTones(prev=>prev.includes(t)?prev.filter(x=>x!==t):[...prev,t]);
  const activeCta = cta==="Custom" ? customCta : cta;

  const generate = async () => {
    if(!idea.trim()) return;
    setLoading(true); setResult(null); setSuggestions([]); setSaved(false); setFadeIn(false);
    const prompt = "You are Sakura, content operator for Mike Rari (@realmikerari).\n\nCRITICAL RULES:\n- Write LIKE Mike. Do NOT force his personal stories unless they naturally serve this specific idea.\n- Do NOT force the $400K story, brand deals, or the 6-year struggle into every script.\n- Do NOT be a motivational speaker. Mike is nonchalant and convicted, not preachy.\n- He observes things. He points at something real and lets people sit with it.\n- MIX sentence rhythm — some short, some longer, some flowing. Repetitive short sentences sound like AI.\n- Use simple common words. 7th grade reading level. If a simpler word exists, use it.\n- Only reference personal stories if they genuinely serve the idea. Otherwise skip them.\n\nRAW IDEA: "+idea+"\nFORMAT: "+format+"\nTONE: "+tones.join(", ")+"\nHOOK STYLE: "+hook+"\nCTA: "+activeCta+"\nLENGTH: "+length.words+"\n\nWrite ONLY the script. Hook paragraph, then Body paragraphs, then CTA — separated by blank lines. Then write ---SUGGESTIONS--- followed by 3 bullet suggestions starting with bullet character.";
    try {
      const res = await generateScript(idea,format,activeCta,prompt,idea);
      if(res.script){
        const parts = res.script.split("---SUGGESTIONS---");
        const scriptText = parts[0].trim();
        const sugs = (parts[1]||"").split("\n").filter(l=>l.trim().startsWith("•")).map(l=>l.replace("•","").trim());
        setResult(scriptText); setSuggestions(sugs);
        const lines = scriptText.split("\n\n").filter(Boolean);
        setHookText(lines[0]||"");
        setBodyText(lines.slice(1,-1).join("\n\n")||lines[1]||"");
        setCtaText(lines[lines.length-1]||"");
        setTimeout(()=>setFadeIn(true),50);
      }
    } catch(e){}
    setLoading(false);
  };

  const handleSave = () => {
    if(!result||!onSaveScript) return;
    const fullScript = [hookText,bodyText,ctaText].filter(Boolean).join("\n\n");
    onSaveScript({hook:idea.substring(0,120),script:fullScript,format,cta:activeCta,status:"Draft",date:new Date().toISOString(),category:"Other"});
    setSaved(true);
  };

  const S = {
    card: {background:"#161616",borderRadius:16,padding:"24px",border:"1px solid rgba(255,255,255,0.07)"},
    cardFaded: {background:"#161616",borderRadius:16,padding:"24px",border:"1px solid rgba(255,255,255,0.05)",opacity:0.35,pointerEvents:"none"},
    lbl: {fontSize:11,color:C.orange,fontWeight:800,letterSpacing:1.5,marginBottom:14,display:"block"},
    ta100: {width:"100%",background:"#141414",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"14px",color:"#e8e8e8",fontFamily:FONT,fontSize:14,lineHeight:1.8,resize:"none",outline:"none",boxSizing:"border-box",minHeight:100},
    ta80: {width:"100%",background:"#141414",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"14px",color:"#e8e8e8",fontFamily:FONT,fontSize:14,lineHeight:1.8,resize:"none",outline:"none",boxSizing:"border-box",minHeight:80},
    ta180: {width:"100%",background:"#141414",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"14px",color:"#e8e8e8",fontFamily:FONT,fontSize:14,lineHeight:1.8,resize:"none",outline:"none",boxSizing:"border-box",minHeight:180},
    ta60: {width:"100%",background:"#141414",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"14px",color:"#e8e8e8",fontFamily:FONT,fontSize:14,lineHeight:1.8,resize:"none",outline:"none",boxSizing:"border-box",minHeight:60},
  };

  const pill = active => ({background:active?"rgba(255,107,0,0.12)":"#111",border:"1px solid "+(active?C.orange:"rgba(255,255,255,0.06)"),borderRadius:20,padding:"8px 18px",color:active?C.orange:"#aaa",fontSize:13,fontWeight:active?700:400,cursor:"pointer",fontFamily:FONT});
  const fmtPill = active => ({background:active?"rgba(255,107,0,0.12)":"#111",border:"1px solid "+(active?C.orange:"rgba(255,255,255,0.06)"),borderRadius:10,padding:"12px 16px",color:active?C.orange:"#aaa",fontSize:13,fontWeight:active?700:400,cursor:"pointer",fontFamily:FONT,textAlign:"left",width:"100%"});
  const secLbl = (text,color) => (<div style={{fontSize:10,color,fontWeight:800,marginBottom:8,letterSpacing:1.5,display:"flex",alignItems:"center",gap:8}}><div style={{width:3,height:14,background:color,borderRadius:2}}/>{text}</div>);

  return (
    <div style={{padding:"32px 40px 60px",overflowY:"auto",height:"100%",boxSizing:"border-box",fontFamily:FONT}}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .sw-fade { animation: fadeUp 0.45s ease forwards; }
        .sw-spinner { width:52px;height:52px;border:4px solid rgba(124,58,237,0.15);border-top-color:#7C3AED;border-radius:50%;animation:spin 0.75s linear infinite; }
      `}</style>

      <div style={{marginBottom:28}}>
        <h1 style={{fontSize:32,fontWeight:900,color:"#fff",margin:0}}>Idea to Script</h1>
        <div style={{fontSize:13,color:"#888",marginTop:4}}>Drop a raw idea. Sakura builds the script.</div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:(result||loading)?"1fr 1fr":"1fr",gap:28,maxWidth:(result||loading)?"100%":740,alignItems:"start"}}>
        
        <div style={{display:"flex",flexDirection:"column",gap:16}}>

          <div style={S.card}>
            <span style={S.lbl}>STEP 1 — YOUR IDEA</span>
            <textarea value={idea} onChange={e=>setIdea(e.target.value)} placeholder="Drop your raw idea here. A thought, a competitor video you want to adapt, a story you want to tell..." style={S.ta100} rows={4}/>
          </div>

          <div style={hasIdea?S.card:S.cardFaded}>
            <span style={S.lbl}>STEP 2 — FORMAT</span>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {FORMATS.map(f=><button key={f} onClick={()=>setFormat(f)} style={fmtPill(format===f)}>{f}</button>)}
            </div>
          </div>

          <div style={hasIdea?S.card:S.cardFaded}>
            <span style={S.lbl}>STEP 3 — TONE <span style={{fontSize:10,color:"#888",fontWeight:400}}>(pick all that apply)</span></span>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {TONES.map(t=><button key={t} onClick={()=>toggleTone(t)} style={pill(tones.includes(t))}>{t}</button>)}
            </div>
          </div>

          <div style={S.card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <span style={{fontSize:11,color:C.orange,fontWeight:800,letterSpacing:1.5}}>STEP 4 — HOOK STYLE</span>
              <button onClick={()=>setShowGuide(!showGuide)} style={{background:showGuide?"rgba(124,58,237,0.2)":"rgba(255,255,255,0.05)",border:"1px solid "+(showGuide?"rgba(124,58,237,0.4)":"rgba(255,255,255,0.08)"),borderRadius:20,padding:"4px 12px",color:showGuide?"#A78BFA":"#777",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:FONT}}>
                {showGuide?"Hide Guide":"? Guide"}
              </button>
            </div>
            {showGuide&&(
              <div style={{background:"rgba(124,58,237,0.05)",borderRadius:12,padding:"16px",marginBottom:16,border:"1px solid rgba(124,58,237,0.12)"}}>
                {HOOKS.map(h=>(
                  <div key={h.name} style={{marginBottom:10,paddingBottom:10,borderBottom:"1px solid rgba(255,255,255,0.04)",lastChild:{border:"none"}}}>
                    <div style={{fontSize:12,fontWeight:700,color:hook===h.name?C.orange:"#ccc",marginBottom:3}}>{h.name}</div>
                    <div style={{fontSize:12,color:"#666",lineHeight:1.5}}>{h.desc}</div>
                  </div>
                ))}
              </div>
            )}
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {HOOKS.map(h=><button key={h.name} onClick={()=>setHook(h.name)} style={pill(hook===h.name)}>{h.name}</button>)}
            </div>
          </div>

          <div style={hasIdea?S.card:S.cardFaded}>
            <span style={S.lbl}>STEP 5 — CALL TO ACTION</span>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {CTAS.map(c=><button key={c} onClick={()=>setCta(c)} style={pill(cta===c)}>{c}</button>)}
            </div>
            {cta==="Custom"&&(
              <input value={customCta} onChange={e=>setCustomCta(e.target.value)} placeholder="Type your custom CTA..." style={{width:"100%",background:"#141414",border:"1px solid rgba(255,107,0,0.35)",borderRadius:10,padding:"11px 14px",color:"#fff",fontFamily:FONT,fontSize:13,outline:"none",boxSizing:"border-box",marginTop:12}}/>
            )}
          </div>

          <div style={hasIdea?S.card:S.cardFaded}>
            <span style={S.lbl}>STEP 6 — LENGTH</span>
            <div style={{display:"flex",gap:10}}>
              {LENGTHS.map(l=>(
                <button key={l.label} onClick={()=>setLength(l)} style={{flex:1,background:length.label===l.label?"rgba(255,107,0,0.12)":"#111",border:"1px solid "+(length.label===l.label?C.orange:"rgba(255,255,255,0.06)"),borderRadius:12,padding:"14px 10px",color:length.label===l.label?C.orange:"#aaa",fontSize:13,fontWeight:length.label===l.label?700:400,cursor:"pointer",fontFamily:FONT,textAlign:"center"}}>
                  <div>{l.label}</div>
                  <div style={{fontSize:10,marginTop:4,color:length.label===l.label?"rgba(255,107,0,0.7)":"#555"}}>{l.words}</div>
                </button>
              ))}
            </div>
          </div>

          <button onClick={generate} disabled={loading||!hasIdea} style={{background:loading||!hasIdea?"#1A1A1A":"linear-gradient(135deg,#FF6B00,#E55A00)",border:"1px solid "+(loading||!hasIdea?"rgba(255,255,255,0.06)":"transparent"),borderRadius:14,padding:"18px",color:loading||!hasIdea?"#444":"#fff",fontSize:16,fontWeight:800,cursor:loading||!hasIdea?"not-allowed":"pointer",fontFamily:FONT,transition:"all 0.2s"}}>
            {loading?"Writing...":"Generate Script →"}
          </button>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:16,minHeight:400}}>
          {loading&&(
            <div style={{background:"#161616",borderRadius:16,border:"1px solid rgba(124,58,237,0.3)",padding:"80px 40px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:24,minHeight:420}}>
              <div className="sw-spinner"/>
              <div style={{fontSize:22,fontWeight:800,color:"#fff",textAlign:"center",lineHeight:1.5}}>Sakura is generating<br/>your script...</div>
              <div style={{fontSize:12,color:"#555",textAlign:"center",lineHeight:1.8}}>
                Hook: <span style={{color:"#A78BFA"}}>{hook}</span><br/>
                Format: <span style={{color:C.orange}}>{format.split(" — ")[0]}</span><br/>
                Length: <span style={{color:"#aaa"}}>{length.label}</span>
              </div>
            </div>
          )}
          {result&&(
            <div className={fadeIn?"sw-fade":""} style={{display:"flex",flexDirection:"column",gap:16,opacity:fadeIn?1:0}}>
              <div style={{background:"#161616",borderRadius:16,border:"1px solid rgba(255,255,255,0.07)",overflow:"hidden"}}>
                <div style={{padding:"18px 24px",borderBottom:"1px solid rgba(255,255,255,0.07)",background:"#161616",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>Generated Script</div>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{fontSize:11,color:"#555"}}>{result.split(/\s+/).filter(Boolean).length} words</div>
                    <div style={{fontSize:10,background:"rgba(167,139,250,0.12)",color:"#A78BFA",padding:"3px 10px",borderRadius:20,fontWeight:700}}>{hook}</div>
                  </div>
                </div>
                <div style={{padding:"20px 24px",display:"flex",flexDirection:"column",gap:16}}>
                  <div>{secLbl("PART 1 — HOOK",C.orange)}<textarea value={hookText} onChange={e=>setHookText(e.target.value)} style={S.ta80} rows={3}/></div>
                  <div>{secLbl("PART 2 — BODY","#aaa")}<textarea value={bodyText} onChange={e=>setBodyText(e.target.value)} style={S.ta180} rows={7}/></div>
                  <div>{secLbl("PART 3 — CTA",C.green)}<textarea value={ctaText} onChange={e=>setCtaText(e.target.value)} style={S.ta60} rows={2}/></div>
                </div>
              </div>
              {suggestions.length>0&&(
                <div style={{background:"#161616",borderRadius:16,padding:"20px 24px",border:"1px solid rgba(124,58,237,0.2)"}}>
                  <div style={{fontSize:11,color:C.purple,fontWeight:800,letterSpacing:1.5,marginBottom:14}}>✦ SAKURA'S SUGGESTIONS</div>
                  {suggestions.map((s,i)=>(
                    <div key={i} style={{background:"#111",borderRadius:10,padding:"12px 16px",fontSize:13,color:"#ccc",lineHeight:1.6,marginBottom:8,border:"1px solid rgba(255,255,255,0.04)"}}>
                      <span style={{color:C.purple,fontWeight:700,marginRight:8}}>{i+1}.</span>{s}
                    </div>
                  ))}
                </div>
              )}
              <div style={{display:"flex",gap:10}}>
                <button onClick={generate} style={{flex:1,background:"#1E1E1E",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"13px",color:"#aaa",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:FONT}}>↺ Regenerate</button>
                <button onClick={handleSave} disabled={saved} style={{flex:2,background:saved?"rgba(0,208,132,0.12)":"linear-gradient(135deg,#FF6B00,#E55A00)",border:saved?"1px solid #00D084":"none",borderRadius:12,padding:"13px",color:saved?"#00D084":"#fff",fontSize:13,fontWeight:700,cursor:saved?"default":"pointer",fontFamily:FONT}}>
                  {saved?"✓ Saved to Scripts":"Save to Scripts →"}
                </button>
              </div>
            </div>
          )}
          {!loading&&!result&&(
            <div style={{background:"#161616",borderRadius:16,border:"1px dashed rgba(255,255,255,0.07)",padding:"80px 40px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,minHeight:420}}>
              <div style={{fontSize:32}}>✦</div>
              <div style={{fontSize:16,fontWeight:700,color:"#444"}}>Your script will appear here</div>
              <div style={{fontSize:13,color:"#333",textAlign:"center"}}>Fill in the steps on the left and hit Generate</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
