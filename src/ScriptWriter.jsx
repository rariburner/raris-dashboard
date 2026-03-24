import { useState } from "react";
import { generateScript } from "./api.js";

const C = { orange:"#FF6B00",green:"#00D084",purple:"#7C3AED" };
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const FORMATS = ["Format 1 — Social Leverage","Format 2 — Curiosity / Elimination","Format 3 — Value Drop","Format 4 — Storytelling","Format 5 — Bold Take"];
const TONES = [
  {id:"convicted",label:"Convicted",desc:"Strong, hits hard. You have a point and you're making it."},
  {id:"professional",label:"Professional",desc:"Structured, credible, educational. Clean delivery."},
  {id:"yap",label:"Yap",desc:"Picked up your phone and started talking. Casual, real, mid-thought. Invisible structure."},
];
const HOOKS = [
  {name:"Reversal",desc:"Flip the expected answer. Everyone says X, but actually Y."},
  {name:"Elimination",desc:"Cross out options. Not X, not Y — it is THIS."},
  {name:"Social Leverage",desc:"Drop a name to borrow their gravity."},
  {name:"Identity Trigger",desc:"Speak directly to who they are. If you are the type of person who..."},
  {name:"Income Voyeurism",desc:"Reveal real numbers. A trainer makes $73K/month..."},
  {name:"Loss Scenario",desc:"Show what they lose by not acting."},
  {name:"Myth Busting",desc:"Challenge a belief. You have been lied to about..."},
  {name:"The Confession",desc:"Start with a mistake. I used to do X. I was wrong."},
  {name:"Future Pacing",desc:"Paint what is coming. 5 years from now..."},
  {name:"Pattern Interrupt",desc:"Start mid-sentence or unexpected. Breaks the scroll."},
];
const CTAS = ["Comment VIRAL","Comment PIPELINE","Comment SYSTEM","Comment FREE","Comment BUYERS","No CTA","Custom"];
const LENGTHS = [{label:"Standard (28-35 sec)",words:"170-210 words"},{label:"Extended (38-42 sec)",words:"225-250 words"}];
const AI_ACTIONS = [
  {label:"Improve this",icon:"✦"},
  {label:"Make it shorter",icon:"↓"},
  {label:"Make it longer",icon:"↑"},
  {label:"More convicted",icon:"⚡"},
  {label:"More casual",icon:"~"},
  {label:"Sharpen it",icon:"🎯"},
  {label:"Fix grammar",icon:"✓"},
];

function AIContextMenu({x,y,onAction,onClose}){
  const [custom,setCustom]=useState("");
  return(
    <>
      <div style={{position:"fixed",inset:0,zIndex:9998}} onClick={onClose}/>
      <div onClick={e=>e.stopPropagation()} onMouseDown={e=>e.stopPropagation()} style={{position:"fixed",left:Math.min(x,window.innerWidth-280),top:Math.min(y,window.innerHeight-380),background:"#1A1A1A",border:"1px solid rgba(255,255,255,0.12)",borderRadius:14,padding:"10px",width:265,zIndex:9999,boxShadow:"0 24px 64px rgba(0,0,0,0.9)"}}>
        <div style={{display:"flex",gap:8,marginBottom:8}}>
          <input value={custom} onChange={e=>setCustom(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&custom.trim()){onAction("custom: "+custom);onClose();}}} placeholder="Ask Sakura..." style={{flex:1,background:"#111",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"8px 10px",color:"#fff",fontSize:12,outline:"none",fontFamily:FONT}} autoFocus/>
          <button onClick={e=>{e.stopPropagation();if(custom.trim()){onAction("custom: "+custom);onClose();}}} style={{background:C.orange,border:"none",borderRadius:8,padding:"8px 12px",color:"#fff",fontSize:13,cursor:"pointer"}}>↑</button>
        </div>
        <div style={{height:1,background:"rgba(255,255,255,0.06)",margin:"6px 0"}}/>
        <div style={{fontSize:10,color:"#555",padding:"4px 8px",fontWeight:700,letterSpacing:0.8}}>EDIT SELECTION</div>
        {AI_ACTIONS.map(a=>(
          <button key={a.label} onClick={e=>{e.stopPropagation();onAction(a.label);onClose();}}
            style={{display:"flex",alignItems:"center",gap:10,width:"100%",background:"transparent",border:"none",padding:"9px 10px",color:"#ccc",fontSize:13,cursor:"pointer",borderRadius:8,textAlign:"left",fontFamily:FONT}}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.06)";e.currentTarget.style.color="#fff";}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#ccc";}}>
            <span style={{fontSize:13,width:20,textAlign:"center"}}>{a.icon}</span>{a.label}
          </button>
        ))}
      </div>
    </>
  );
}

export default function ScriptWriter({onSaveScript}){
  const [idea,setIdea]=useState("");
  const [format,setFormat]=useState(FORMATS[0]);
  const [tone,setTone]=useState("convicted");
  const [hook,setHook]=useState(HOOKS[0].name);
  const [cta,setCta]=useState(CTAS[0]);
  const [customCta,setCustomCta]=useState("");
  const [length,setLength]=useState(LENGTHS[0]);
  const [showGuide,setShowGuide]=useState(false);

  // Hook selection phase
  const [hookOptions,setHookOptions]=useState(null);
  const [selectedHook,setSelectedHook]=useState(null);
  const [hookLoading,setHookLoading]=useState(false);
  const [hookSuggestion,setHookSuggestion]=useState("");
  const [showHookSuggestion,setShowHookSuggestion]=useState(false);

  // Script phase
  const [hookText,setHookText]=useState("");
  const [bodyText,setBodyText]=useState("");
  const [ctaText,setCtaText]=useState("");
  const [result,setResult]=useState(null);
  const [suggestions,setSuggestions]=useState([]);
  const [scriptLoading,setScriptLoading]=useState(false);
  const [saved,setSaved]=useState(false);
  const [fadeIn,setFadeIn]=useState(false);

  // Inline AI editing
  const [contextMenu,setContextMenu]=useState(null);
  const [activeSection,setActiveSection]=useState(null);
  const [inlineLoading,setInlineLoading]=useState(false);

  const hasIdea=idea.trim().length>0;
  const activeCta=cta==="Custom"?customCta:cta;
  const toneObj=TONES.find(t=>t.id===tone)||TONES[0];

  const buildPrompt=(hookOverride)=>{
    const toneInstructions={
      convicted:"Write with strong conviction. You have a point and you are making it. Direct, confident, no hedging.",
      professional:"Write with structure and credibility. Educational, clean, authoritative without being stiff.",
      yap:"Write like you just picked up your phone and started talking. Mid-thought opener. Casual and real. No performance. Each sentence should make the next one feel necessary — not through structure but through genuine curiosity. The structure is invisible. It sounds like you just happened to be interesting."
    };
    return "You are Sakura, writing a short-form video script for Mike Rari (@realmikerari).\n\nMike's voice: He is an observer. He notices something true, says it plainly, and moves on. He does not build to a crescendo. He does not preach. He points at something real and lets it land. One idea, one turn, done.\n\nTONE: "+toneInstructions[tone]+"\n\nRULES:\n- Do NOT force his personal stories ($400K, brand deals, 6 years) unless they naturally serve THIS specific idea\n- Mix sentence rhythm naturally — not every sentence the same length\n- Simple words, 7th grade reading level\n- One idea, said well, then stop\n\nRAW IDEA: "+idea+"\nFORMAT: "+format+"\nHOOK TO USE: "+(hookOverride||selectedHook)+"\nCTA: "+activeCta+"\nLENGTH: "+length.words+"\n\nWrite ONLY the script. Hook paragraph, then body, then CTA — separated by blank lines. Then write ---SUGGESTIONS--- followed by 3 one-line suggestions starting with •";
  };

  const generateHooks=async()=>{
    if(!idea.trim())return;
    setHookLoading(true);setHookOptions(null);setSelectedHook(null);setResult(null);setSaved(false);
    const suggestionLine=hookSuggestion.trim()?"\nExtra note from Mike: "+hookSuggestion:"";
    const prompt="You are Sakura, writing hook options for Mike Rari (@realmikerari).\n\nMike's voice: Observer, nonchalant, convicted. He notices something true and says it plainly.\n\nGenerate exactly 3 different hook options for this video idea. Each hook should be 1-2 sentences max. Make each one feel distinctly different in approach.\n\nRAW IDEA: "+idea+"\nFORMAT: "+format+"\nHOOK STYLE: "+hook+"\nTONE: "+toneObj.label+suggestionLine+"\n\nRespond with exactly this format:\nHOOK 1: [hook text]\nHOOK 2: [hook text]\nHOOK 3: [hook text]";
    try{
      const res=await generateScript(idea,format,activeCta,prompt,idea);
      if(res.script){
        const lines=res.script.split("\n").filter(l=>l.match(/^HOOK [123]:/));
        const hooks=lines.map(l=>l.replace(/^HOOK [123]:\s*/,"").trim());
        if(hooks.length>=3)setHookOptions(hooks);
      }
    }catch(e){}
    setHookLoading(false);
  };

  const generateFullScript=async(hookText)=>{
    setScriptLoading(true);setResult(null);setSuggestions([]);setFadeIn(false);
    const prompt=buildPrompt(hookText);
    try{
      const res=await generateScript(idea,format,activeCta,prompt,idea);
      if(res.script){
        const parts=res.script.split("---SUGGESTIONS---");
        const scriptText=parts[0].trim();
        const sugs=(parts[1]||"").split("\n").filter(l=>l.trim().startsWith("•")).map(l=>l.replace("•","").trim());
        setResult(scriptText);setSuggestions(sugs);
        const lines=scriptText.split("\n\n").filter(Boolean);
        setHookText(lines[0]||"");
        setBodyText(lines.slice(1,-1).join("\n\n")||lines[1]||"");
        setCtaText(lines[lines.length-1]||"");
        setTimeout(()=>setFadeIn(true),50);
      }
    }catch(e){}
    setScriptLoading(false);
  };

  const handleContextMenu=(section)=>(e)=>{
    const selected=window.getSelection()?.toString()?.trim();
    if(selected&&selected.length>3){
      e.preventDefault();
      setActiveSection(section);
      setContextMenu({x:e.clientX,y:e.clientY,selected});
    }
  };

  const handleInlineAction=async(action)=>{
    if(!contextMenu?.selected)return;
    setInlineLoading(true);
    const prompt=action.startsWith("custom:")?action.replace("custom:","").trim()+" this: \""+contextMenu.selected+"\"":action+" this text (reply with ONLY the rewritten text, nothing else): \""+contextMenu.selected+"\"";
    try{
      const res=await generateScript(contextMenu.selected,"edit","",prompt,contextMenu.selected);
      if(res.script){
        const newText=res.script.trim();
        if(activeSection==="hook")setHookText(prev=>prev.replace(contextMenu.selected,newText));
        if(activeSection==="body")setBodyText(prev=>prev.replace(contextMenu.selected,newText));
        if(activeSection==="cta")setCtaText(prev=>prev.replace(contextMenu.selected,newText));
      }
    }catch(e){}
    setInlineLoading(false);
    setContextMenu(null);
  };

  const handleSave=()=>{
    if(!result||!onSaveScript)return;
    const fullScript=[hookText,bodyText,ctaText].filter(Boolean).join("\n\n");
    onSaveScript({hook:idea.substring(0,120),script:fullScript,format,cta:activeCta,status:"Draft",date:new Date().toISOString(),category:"Other"});
    setSaved(true);
  };

  const S={
    card:{background:"#161616",borderRadius:16,padding:"24px",border:"1px solid rgba(255,255,255,0.07)"},
    cardFaded:{background:"#161616",borderRadius:16,padding:"24px",border:"1px solid rgba(255,255,255,0.05)",opacity:0.35,pointerEvents:"none"},
    lbl:{fontSize:11,color:C.orange,fontWeight:800,letterSpacing:1.5,marginBottom:14,display:"block"},
    ta80:{width:"100%",background:"#141414",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"14px",color:"#e8e8e8",fontFamily:FONT,fontSize:14,lineHeight:1.8,resize:"none",outline:"none",boxSizing:"border-box",minHeight:80},
    ta180:{width:"100%",background:"#141414",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"14px",color:"#e8e8e8",fontFamily:FONT,fontSize:14,lineHeight:1.8,resize:"none",outline:"none",boxSizing:"border-box",minHeight:180},
    ta60:{width:"100%",background:"#141414",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"14px",color:"#e8e8e8",fontFamily:FONT,fontSize:14,lineHeight:1.8,resize:"none",outline:"none",boxSizing:"border-box",minHeight:60},
  };
  const pill=active=>({background:active?"rgba(255,107,0,0.12)":"#111",border:"1px solid "+(active?C.orange:"rgba(255,255,255,0.06)"),borderRadius:20,padding:"8px 18px",color:active?C.orange:"#aaa",fontSize:13,fontWeight:active?700:400,cursor:"pointer",fontFamily:FONT});
  const fmtPill=active=>({background:active?"rgba(255,107,0,0.12)":"#111",border:"1px solid "+(active?C.orange:"rgba(255,255,255,0.06)"),borderRadius:10,padding:"12px 16px",color:active?C.orange:"#aaa",fontSize:13,fontWeight:active?700:400,cursor:"pointer",fontFamily:FONT,textAlign:"left",width:"100%"});
  const secLbl=(text,color)=>(<div style={{fontSize:10,color,fontWeight:800,marginBottom:8,letterSpacing:1.5,display:"flex",alignItems:"center",gap:8}}><div style={{width:3,height:14,background:color,borderRadius:2}}/>{text}</div>);

  const showRight=hookOptions||hookLoading||result||scriptLoading;

  return(
    <div style={{padding:"32px 40px 60px",overflowY:"auto",height:"100%",boxSizing:"border-box",fontFamily:FONT,position:"relative"}}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .sw-fade{animation:fadeUp 0.45s ease forwards}
        .sw-spinner{width:52px;height:52px;border:4px solid rgba(124,58,237,0.15);border-top-color:#7C3AED;border-radius:50%;animation:spin 0.75s linear infinite}
      `}</style>

      {contextMenu&&<AIContextMenu x={contextMenu.x} y={contextMenu.y} onAction={handleInlineAction} onClose={()=>setContextMenu(null)}/>}

      <div style={{marginBottom:28}}>
        <h1 style={{fontSize:32,fontWeight:900,color:"#fff",margin:0}}>Idea to Script</h1>
        <div style={{fontSize:13,color:"#888",marginTop:4}}>Drop a raw idea. Sakura builds the script.</div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:showRight?"1fr 1fr":"1fr",gap:28,maxWidth:showRight?"100%":740,alignItems:"start"}}>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>

          <div style={S.card}>
            <span style={S.lbl}>STEP 1 — YOUR IDEA</span>
            <textarea value={idea} onChange={e=>setIdea(e.target.value)} placeholder="Drop your raw idea here..." style={{width:"100%",background:"#141414",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"14px",color:"#e8e8e8",fontFamily:FONT,fontSize:14,lineHeight:1.8,resize:"none",outline:"none",boxSizing:"border-box",minHeight:100}} rows={4}/>
          </div>

          <div style={hasIdea?S.card:S.cardFaded}>
            <span style={S.lbl}>STEP 2 — FORMAT</span>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {FORMATS.map(f=><button key={f} onClick={()=>setFormat(f)} style={fmtPill(format===f)}>{f}</button>)}
            </div>
          </div>

          <div style={hasIdea?S.card:S.cardFaded}>
            <span style={S.lbl}>STEP 3 — TONE</span>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {TONES.map(t=>(
                <button key={t.id} onClick={()=>setTone(t.id)} style={{background:tone===t.id?"rgba(255,107,0,0.12)":"#111",border:"1px solid "+(tone===t.id?C.orange:"rgba(255,255,255,0.06)"),borderRadius:10,padding:"12px 16px",cursor:"pointer",textAlign:"left",fontFamily:FONT}}>
                  <div style={{fontSize:13,fontWeight:tone===t.id?700:400,color:tone===t.id?C.orange:"#aaa",marginBottom:3}}>{t.label}</div>
                  <div style={{fontSize:11,color:"#555"}}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={S.card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <span style={{fontSize:11,color:C.orange,fontWeight:800,letterSpacing:1.5}}>STEP 4 — HOOK STYLE</span>
              <button onClick={()=>setShowGuide(!showGuide)} style={{background:showGuide?"rgba(124,58,237,0.2)":"rgba(255,255,255,0.05)",border:"1px solid "+(showGuide?"rgba(124,58,237,0.4)":"rgba(255,255,255,0.08)"),borderRadius:20,padding:"4px 12px",color:showGuide?"#A78BFA":"#777",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:FONT}}>
                {showGuide?"Hide":"? Guide"}
              </button>
            </div>
            {showGuide&&(
              <div style={{background:"rgba(124,58,237,0.05)",borderRadius:12,padding:"14px",marginBottom:14,border:"1px solid rgba(124,58,237,0.1)"}}>
                {HOOKS.map(h=>(
                  <div key={h.name} style={{marginBottom:8,paddingBottom:8,borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                    <div style={{fontSize:12,fontWeight:700,color:hook===h.name?C.orange:"#ccc",marginBottom:2}}>{h.name}</div>
                    <div style={{fontSize:11,color:"#666",lineHeight:1.5}}>{h.desc}</div>
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
            {cta==="Custom"&&<input value={customCta} onChange={e=>setCustomCta(e.target.value)} placeholder="Type your custom CTA..." style={{width:"100%",background:"#141414",border:"1px solid rgba(255,107,0,0.35)",borderRadius:10,padding:"11px 14px",color:"#fff",fontFamily:FONT,fontSize:13,outline:"none",boxSizing:"border-box",marginTop:12}}/>}
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

          <button onClick={generateHooks} disabled={hookLoading||scriptLoading||!hasIdea} style={{background:hookLoading||scriptLoading||!hasIdea?"#1A1A1A":"linear-gradient(135deg,#FF6B00,#E55A00)",border:"1px solid "+(hookLoading||scriptLoading||!hasIdea?"rgba(255,255,255,0.06)":"transparent"),borderRadius:14,padding:"18px",color:hookLoading||scriptLoading||!hasIdea?"#444":"#fff",fontSize:16,fontWeight:800,cursor:hookLoading||scriptLoading||!hasIdea?"not-allowed":"pointer",fontFamily:FONT}}>
            {hookLoading?"Generating hooks...":hookOptions&&!result?"Regenerate Hooks":"Get Hook Options →"}
          </button>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:16,minHeight:400}}>

          {hookLoading&&(
            <div style={{background:"#161616",borderRadius:16,border:"1px solid rgba(124,58,237,0.3)",padding:"60px 40px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20,minHeight:300}}>
              <div className="sw-spinner"/>
              <div style={{fontSize:18,fontWeight:800,color:"#fff",textAlign:"center"}}>Generating 3 hooks...</div>
              <div style={{fontSize:12,color:"#555",textAlign:"center"}}>{hook} style · {toneObj.label} tone</div>
            </div>
          )}

          {hookOptions&&!result&&!scriptLoading&&(
            <div className="sw-fade" style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{fontSize:13,color:"#888",marginBottom:4}}>Pick the hook that feels most like you — then Sakura builds the full script.</div>
              {hookOptions.map((h,i)=>(
                <div key={i} onClick={()=>{setSelectedHook(h);generateFullScript(h);}} style={{background:selectedHook===h?"rgba(255,107,0,0.08)":"#161616",border:"1px solid "+(selectedHook===h?C.orange:"rgba(255,255,255,0.07)"),borderRadius:14,padding:"18px 20px",cursor:"pointer",transition:"all 0.15s"}}
                  onMouseEnter={e=>{if(selectedHook!==h){e.currentTarget.style.borderColor="rgba(255,107,0,0.3)";e.currentTarget.style.background="rgba(255,255,255,0.03)";}}}
                  onMouseLeave={e=>{if(selectedHook!==h){e.currentTarget.style.borderColor="rgba(255,255,255,0.07)";e.currentTarget.style.background="#161616";}}}>
                  <div style={{fontSize:10,color:C.orange,fontWeight:800,letterSpacing:1,marginBottom:8}}>OPTION {i+1}</div>
                  <div style={{fontSize:14,color:"#fff",lineHeight:1.6,fontWeight:500}}>{h}</div>
                </div>
              ))}
              <div style={{marginTop:4}}>
                {!showHookSuggestion?(
                  <button onClick={()=>setShowHookSuggestion(true)} style={{background:"transparent",border:"1px dashed rgba(255,255,255,0.1)",borderRadius:10,padding:"10px 16px",color:"#555",fontSize:12,cursor:"pointer",fontFamily:FONT,width:"100%"}}>+ Regenerate with a suggestion</button>
                ):(
                  <div style={{display:"flex",gap:8}}>
                    <input value={hookSuggestion} onChange={e=>setHookSuggestion(e.target.value)} placeholder="e.g. make it reference Jake Paul..." style={{flex:1,background:"#141414",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"10px 14px",color:"#fff",fontFamily:FONT,fontSize:13,outline:"none"}}/>
                    <button onClick={()=>{setShowHookSuggestion(false);generateHooks();}} style={{background:C.orange,border:"none",borderRadius:10,padding:"10px 16px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:FONT,whiteSpace:"nowrap"}}>Regenerate</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {scriptLoading&&(
            <div style={{background:"#161616",borderRadius:16,border:"1px solid rgba(124,58,237,0.3)",padding:"80px 40px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:24,minHeight:420}}>
              <div className="sw-spinner"/>
              <div style={{fontSize:22,fontWeight:800,color:"#fff",textAlign:"center",lineHeight:1.5}}>Sakura is generating<br/>your script...</div>
              <div style={{fontSize:12,color:"#555",textAlign:"center",lineHeight:1.8}}>
                Hook: <span style={{color:"#A78BFA"}}>{hook}</span><br/>
                Format: <span style={{color:C.orange}}>{format.split(" — ")[0]}</span><br/>
                Tone: <span style={{color:"#aaa"}}>{toneObj.label}</span>
              </div>
            </div>
          )}

          {result&&(
            <div className={fadeIn?"sw-fade":""} style={{display:"flex",flexDirection:"column",gap:16,opacity:fadeIn?1:0}}>
              {inlineLoading&&<div style={{fontSize:12,color:C.purple,textAlign:"center",padding:"8px",background:"rgba(124,58,237,0.08)",borderRadius:8}}>✦ Sakura is rewriting...</div>}
              <div style={{background:"#161616",borderRadius:16,border:"1px solid rgba(255,255,255,0.07)",overflow:"hidden"}}>
                <div style={{padding:"18px 24px",borderBottom:"1px solid rgba(255,255,255,0.07)",background:"#161616",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>Generated Script</div>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{fontSize:11,color:"#555"}}>{result.split(/\s+/).filter(Boolean).length} words</div>
                    <div style={{fontSize:10,background:"rgba(167,139,250,0.12)",color:"#A78BFA",padding:"3px 10px",borderRadius:20,fontWeight:700}}>{hook}</div>
                  </div>
                </div>
                <div style={{padding:"8px 16px",borderBottom:"1px solid rgba(255,255,255,0.05)",background:"rgba(255,255,255,0.02)"}}>
                  <div style={{fontSize:11,color:"#444"}}>Select text → right-click → Sakura rewrites just that part</div>
                </div>
                <div style={{padding:"20px 24px",display:"flex",flexDirection:"column",gap:16}}>
                  <div>{secLbl("PART 1 — HOOK",C.orange)}<textarea value={hookText} onChange={e=>setHookText(e.target.value)} onContextMenu={handleContextMenu("hook")} style={S.ta80} rows={3}/></div>
                  <div>{secLbl("PART 2 — BODY","#aaa")}<textarea value={bodyText} onChange={e=>setBodyText(e.target.value)} onContextMenu={handleContextMenu("body")} style={S.ta180} rows={7}/></div>
                  <div>{secLbl("PART 3 — CTA",C.green)}<textarea value={ctaText} onChange={e=>setCtaText(e.target.value)} onContextMenu={handleContextMenu("cta")} style={S.ta60} rows={2}/></div>
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
                <button onClick={()=>{setResult(null);setHookOptions(null);setSelectedHook(null);}} style={{flex:1,background:"#1E1E1E",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"13px",color:"#aaa",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:FONT}}>← New Hooks</button>
                <button onClick={handleSave} disabled={saved} style={{flex:2,background:saved?"rgba(0,208,132,0.12)":"linear-gradient(135deg,#FF6B00,#E55A00)",border:saved?"1px solid #00D084":"none",borderRadius:12,padding:"13px",color:saved?"#00D084":"#fff",fontSize:13,fontWeight:700,cursor:saved?"default":"pointer",fontFamily:FONT}}>
                  {saved?"✓ Saved to Scripts":"Save to Scripts →"}
                </button>
              </div>
            </div>
          )}

          {!showRight&&(
            <div style={{background:"#161616",borderRadius:16,border:"1px dashed rgba(255,255,255,0.07)",padding:"80px 40px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,minHeight:420}}>
              <div style={{fontSize:32}}>✦</div>
              <div style={{fontSize:16,fontWeight:700,color:"#444"}}>Your hooks will appear here</div>
              <div style={{fontSize:13,color:"#333",textAlign:"center"}}>Fill in the steps and hit Get Hook Options</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
