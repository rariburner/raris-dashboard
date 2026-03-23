import { useState } from "react";
import { generateScript } from "./api.js";

const C = { orange:"#FF6B00",green:"#00D084",purple:"#7C3AED",muted:"#888888" };
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const FORMATS = ["Format 1 — Social Leverage","Format 2 — Curiosity / Elimination","Format 3 — Value Drop","Format 4 — Storytelling","Format 5 — Bold Take"];
const TONES = ["Convicted","Raw / Unfiltered","Educational","Conversational"];
const HOOKS = ["Reversal","Elimination","Social Leverage","Identity Trigger","Income Voyeurism","Loss Scenario"];
const CTAS = ["Comment VIRAL","Comment PIPELINE","Comment SYSTEM","Comment FREE","Comment BUYERS","No CTA"];
const LENGTHS = [{label:"~30 sec",words:"130-150 words"},{label:"~45 sec",words:"175-200 words"},{label:"~60 sec",words:"225-250 words"}];

export default function ScriptWriter({onSaveScript}){
  const [idea,setIdea]=useState("");
  const [format,setFormat]=useState(FORMATS[0]);
  const [tones,setTones]=useState(["Convicted"]);
  const [hook,setHook]=useState(HOOKS[0]);
  const [cta,setCta]=useState(CTAS[0]);
  const [length,setLength]=useState(LENGTHS[2]);
  const [loading,setLoading]=useState(false);
  const [result,setResult]=useState(null);
  const [suggestions,setSuggestions]=useState([]);
  const [saved,setSaved]=useState(false);
  const [hookText,setHookText]=useState("");
  const [bodyText,setBodyText]=useState("");
  const [ctaText,setCtaText]=useState("");

  const hasIdea = idea.trim().length > 0;
  const toggleTone=t=>setTones(prev=>prev.includes(t)?prev.filter(x=>x!==t):[...prev,t]);

  const generate=async()=>{
    if(!idea.trim())return;
    setLoading(true);setResult(null);setSuggestions([]);setSaved(false);
    const prompt="You are Sakura, content operator for Mike Rari. Generate a short-form video script.\n\nRAW IDEA: "+idea+"\nFORMAT: "+format+"\nTONE: "+tones.join(", ")+"\nHOOK STYLE: "+hook+"\nCTA: "+cta+"\nLENGTH: "+length.words+"\n\nWrite ONLY the script. Hook then Body then CTA separated by blank lines. Then write ---SUGGESTIONS--- on a new line followed by 3 bullet suggestions starting with •";
    try{
      const res=await generateScript(idea,format,cta,prompt,idea);
      if(res.script){
        const parts=res.script.split("---SUGGESTIONS---");
        const scriptText=parts[0].trim();
        const sugs=(parts[1]||"").split("\n").filter(l=>l.trim().startsWith("•")).map(l=>l.replace("•","").trim());
        setResult(scriptText);
        setSuggestions(sugs);
        const lines=scriptText.split("\n\n").filter(Boolean);
        setHookText(lines[0]||"");
        setBodyText(lines.slice(1,-1).join("\n\n")||lines[1]||"");
        setCtaText(lines[lines.length-1]||"");
      }
    }catch(e){}
    setLoading(false);
  };

  const handleSave=()=>{
    if(!result||!onSaveScript)return;
    const fullScript=[hookText,bodyText,ctaText].filter(Boolean).join("\n\n");
    onSaveScript({hook:idea.substring(0,120),script:fullScript,format,cta,status:"Draft",date:new Date().toISOString(),category:"Other"});
    setSaved(true);
  };

  const cardStyle={background:"#161616",borderRadius:16,padding:"24px",border:"1px solid rgba(255,255,255,0.07)"};
  const cardFadedStyle={background:"#161616",borderRadius:16,padding:"24px",border:"1px solid rgba(255,255,255,0.07)",opacity:0.4};
  const labelStyle={fontSize:11,color:C.orange,fontWeight:800,letterSpacing:1.5,marginBottom:14};
  const taBase={width:"100%",background:"#141414",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"14px",color:"#e8e8e8",fontFamily:FONT,fontSize:14,lineHeight:1.8,resize:"none",outline:"none",boxSizing:"border-box"};
  const taStyle100={width:"100%",background:"#141414",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"14px",color:"#e8e8e8",fontFamily:FONT,fontSize:14,lineHeight:1.8,resize:"none",outline:"none",boxSizing:"border-box",minHeight:100};
  const taStyle80={width:"100%",background:"#141414",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"14px",color:"#e8e8e8",fontFamily:FONT,fontSize:14,lineHeight:1.8,resize:"none",outline:"none",boxSizing:"border-box",minHeight:80};
  const taStyle180={width:"100%",background:"#141414",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"14px",color:"#e8e8e8",fontFamily:FONT,fontSize:14,lineHeight:1.8,resize:"none",outline:"none",boxSizing:"border-box",minHeight:180};
  const taStyle60={width:"100%",background:"#141414",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"14px",color:"#e8e8e8",fontFamily:FONT,fontSize:14,lineHeight:1.8,resize:"none",outline:"none",boxSizing:"border-box",minHeight:60};

  const pill=(active)=>({background:active?"rgba(255,107,0,0.12)":"#111",border:"1px solid "+(active?C.orange:"rgba(255,255,255,0.06)"),borderRadius:20,padding:"8px 18px",color:active?C.orange:"#aaa",fontSize:13,fontWeight:active?700:400,cursor:"pointer",fontFamily:FONT});
  const formatPill=(active)=>({background:active?"rgba(255,107,0,0.12)":"#111",border:"1px solid "+(active?C.orange:"rgba(255,255,255,0.06)"),borderRadius:10,padding:"12px 16px",color:active?C.orange:"#aaa",fontSize:13,fontWeight:active?700:400,cursor:"pointer",fontFamily:FONT,textAlign:"left",width:"100%"});
  const secLabel=(text,color)=>(<div style={{fontSize:10,color,fontWeight:800,marginBottom:8,letterSpacing:1.5,display:"flex",alignItems:"center",gap:8}}><div style={{width:3,height:14,background:color,borderRadius:2}}/>{text}</div>);

  return(
    <div style={{padding:"32px 40px 60px",overflowY:"auto",height:"100%",boxSizing:"border-box",fontFamily:FONT}}>
      <div style={{marginBottom:32}}>
        <h1 style={{fontSize:32,fontWeight:900,color:"#fff",margin:0}}>Idea to Script</h1>
        <div style={{fontSize:13,color:"#888",marginTop:4}}>Drop a raw idea. Sakura builds the script.</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:result?"1fr 1fr":"1fr",gap:28,maxWidth:result?"100%":720}}>
        <div style={{display:"flex",flexDirection:"column",gap:20}}>
          <div style={cardStyle}>
            <div style={labelStyle}>STEP 1 — YOUR IDEA</div>
            <textarea value={idea} onChange={e=>setIdea(e.target.value)} placeholder="Drop your raw idea here..." style={taStyle100} rows={4}/>
          </div>
          <div style={hasIdea?cardStyle:cardFadedStyle}>
            <div style={labelStyle}>STEP 2 — FORMAT</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {FORMATS.map(f=><button key={f} onClick={()=>setFormat(f)} style={formatPill(format===f)}>{f}</button>)}
            </div>
          </div>
          <div style={hasIdea?cardStyle:cardFadedStyle}>
            <div style={labelStyle}>STEP 3 — TONE <span style={{fontSize:10,color:"#888",fontWeight:400}}>(pick all that apply)</span></div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {TONES.map(t=><button key={t} onClick={()=>toggleTone(t)} style={pill(tones.includes(t))}>{t}</button>)}
            </div>
          </div>
          <div style={hasIdea?cardStyle:cardFadedStyle}>
            <div style={labelStyle}>STEP 4 — HOOK STYLE</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {HOOKS.map(h=><button key={h} onClick={()=>setHook(h)} style={pill(hook===h)}>{h}</button>)}
            </div>
          </div>
          <div style={hasIdea?cardStyle:cardFadedStyle}>
            <div style={labelStyle}>STEP 5 — CALL TO ACTION</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {CTAS.map(c=><button key={c} onClick={()=>setCta(c)} style={pill(cta===c)}>{c}</button>)}
            </div>
          </div>
          <div style={hasIdea?cardStyle:cardFadedStyle}>
            <div style={labelStyle}>STEP 6 — LENGTH</div>
            <div style={{display:"flex",gap:10}}>
              {LENGTHS.map(l=><button key={l.label} onClick={()=>setLength(l)} style={{flex:1,background:length.label===l.label?"rgba(255,107,0,0.12)":"#111",border:"1px solid "+(length.label===l.label?C.orange:"rgba(255,255,255,0.06)"),borderRadius:12,padding:"14px 10px",color:length.label===l.label?C.orange:"#aaa",fontSize:13,fontWeight:length.label===l.label?700:400,cursor:"pointer",fontFamily:FONT,textAlign:"center"}}>
                <div>{l.label}</div><div style={{fontSize:10,marginTop:4,color:length.label===l.label?"rgba(255,107,0,0.7)":"#555"}}>{l.words}</div>
              </button>)}
            </div>
          </div>
          <button onClick={generate} disabled={loading||!hasIdea} style={{background:loading||!hasIdea?"#222":"linear-gradient(135deg,#FF6B00,#E55A00)",border:"none",borderRadius:14,padding:"18px",color:loading||!hasIdea?"#555":"#fff",fontSize:16,fontWeight:800,cursor:loading||!hasIdea?"not-allowed":"pointer",fontFamily:FONT}}>
            {loading?"✦ Sakura is writing...":"Generate Script →"}
          </button>
        </div>
        {result&&(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{background:"#161616",borderRadius:16,border:"1px solid rgba(255,255,255,0.07)",overflow:"hidden"}}>
              <div style={{padding:"20px 24px 16px",borderBottom:"1px solid rgba(255,255,255,0.07)",background:"#161616",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>Generated Script</div>
                <div style={{fontSize:11,color:"#555"}}>{result.split(/\s+/).filter(Boolean).length} words</div>
              </div>
              <div style={{padding:"20px 24px",display:"flex",flexDirection:"column",gap:16}}>
                <div>{secLabel("PART 1 — HOOK",C.orange)}<textarea value={hookText} onChange={e=>setHookText(e.target.value)} style={taStyle80} rows={3}/></div>
                <div>{secLabel("PART 2 — BODY","#aaa")}<textarea value={bodyText} onChange={e=>setBodyText(e.target.value)} style={taStyle180} rows={7}/></div>
                <div>{secLabel("PART 3 — CTA",C.green)}<textarea value={ctaText} onChange={e=>setCtaText(e.target.value)} style={taStyle60} rows={2}/></div>
              </div>
            </div>
            {suggestions.length>0&&(
              <div style={{background:"#161616",borderRadius:16,padding:"20px 24px",border:"1px solid rgba(124,58,237,0.3)"}}>
                <div style={{fontSize:11,color:C.purple,fontWeight:800,letterSpacing:1.5,marginBottom:14}}>✦ SAKURA'S SUGGESTIONS</div>
                {suggestions.map((s,i)=>(
                  <div key={i} style={{background:"#111",borderRadius:10,padding:"12px 16px",fontSize:13,color:"#ccc",lineHeight:1.6,marginBottom:8,border:"1px solid rgba(255,255,255,0.05)"}}>
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
      </div>
    </div>
  );
}
