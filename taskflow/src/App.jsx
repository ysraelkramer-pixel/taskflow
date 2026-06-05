import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const PRIORITIES = {
  critical: { label:"קריטי", color:"#EF4444", icon:"🔴" },
  high:     { label:"גבוה",  color:"#F97316", icon:"🟠" },
  medium:   { label:"בינוני",color:"#EAB308", icon:"🟡" },
  low:      { label:"נמוך",  color:"#22C55E", icon:"🟢" },
};
const AREAS = [
  { id:"work",     label:"עבודה",  icon:"💼", color:"#6366F1" },
  { id:"personal", label:"אישי",   icon:"🌱", color:"#10B981" },
  { id:"health",   label:"בריאות", icon:"❤️", color:"#F43F5E" },
  { id:"learning", label:"למידה",  icon:"📚", color:"#F59E0B" },
  { id:"finance",  label:"פיננסי", icon:"💰", color:"#06B6D4" },
  { id:"social",   label:"חברתי",  icon:"👥", color:"#EC4899" },
];
const DARK = {
  bg:"#0D0D14", card:"#14141F", card2:"#1A1A28",
  border:"#25253A", text:"#EEEEFF", muted:"#6B6B8A",
  accent:"#6366F1", accentSoft:"#6366F118",
  success:"#22C55E", danger:"#EF4444",
  tabBar:"#10101A",
};

// ─── MOCK DATA ───────────────────────────────────────────────────────────────
const MOCK_EMAILS = [
  {
    id:1, from:"roi@company.com", name:"רועי כהן", subject:"דוח מכירות Q2 – נדרש עד יום ראשון",
    body:`שלום,\n\nהדוח הרבעוני של Q2 צריך להיות מוכן ומוגש להנהלה עד יום ראשון הקרוב ב-9:00.\nאנא כלול: נתוני מכירות, השוואה לתקופה המקבילה אשתקד, ותחזית Q3.\n\nתודה,\nרועי`,
    time:"לפני שעה", unread:true, label:"עבודה", priority:"critical"
  },
  {
    id:2, from:"client@bigcorp.com", name:"דנה לוי", subject:"פגישת סיכום פרויקט – יש לתאם",
    body:`היי,\n\nנרצה לקיים פגישת סיכום לפרויקט. נוח לנו ביום שלישי או רביעי הקרובים, בין 10:00-14:00.\nאנא אשר זמינות ושלח זימון ליומן.\n\nבברכה,\nדנה`,
    time:"לפני 3 שעות", unread:true, label:"עבודה", priority:"high"
  },
  {
    id:3, from:"hr@company.com", name:"מחלקת HR", subject:"תזכורת: הגשת דוח שעות – מחר עד 17:00",
    body:`שלום,\n\nתזכורת ידידותית: יש להגיש את דוח השעות החודשי מחר (6.6) עד השעה 17:00.\nמי שלא יגיש – יופיע חסר בתשלום החודשי.\n\nHR`,
    time:"אתמול", unread:true, label:"עבודה", priority:"high"
  },
  {
    id:4, from:"trainer@gym.co.il", name:"מאמן כושר", subject:"תזכורת אימון ביום שלישי 07:00",
    body:`היי,\n\nתזכורת לאימון המתוכנן ביום שלישי 9.6 בשעה 07:00.\nאם אינך יכול להגיע – אנא בטל 24 שעות מראש.\n\nמאמן כושר`,
    time:"אתמול", unread:false, label:"בריאות", priority:"medium"
  },
  {
    id:5, from:"bank@leumi.co.il", name:"בנק לאומי", subject:"עדכון: חיוב כרטיס אשראי לחודש יוני",
    body:`לקוח יקר,\n\nסכום החיוב הצפוי לחודש יוני: ₪4,230.\nתאריך חיוב: 15.6.2026.\nלצפייה בפירוט עסקאות – כנס לאתר הבנק.\n\nבנק לאומי`,
    time:"לפני יומיים", unread:false, label:"פיננסי", priority:"medium"
  },
  {
    id:6, from:"newsletter@techcrunch.com", name:"TechCrunch", subject:"Top AI stories this week",
    body:`This week in AI:\n• OpenAI releases new model\n• Google announces Gemini 3\n• Meta open-sources LLaMA 4\n\nRead more on techcrunch.com`,
    time:"לפני יומיים", unread:false, label:"למידה", priority:"low"
  },
];

const MOCK_CALENDAR = [
  { id:1, title:"Stand-up יומי",      start:"2026-06-05 09:00", end:"2026-06-05 09:30", color:"#6366F1", recurring:true },
  { id:2, title:"ראיון מועמד",         start:"2026-06-05 14:00", end:"2026-06-05 15:00", color:"#6366F1" },
  { id:3, title:"אימון כושר",          start:"2026-06-09 07:00", end:"2026-06-09 08:00", color:"#F43F5E" },
  { id:4, title:"ארוחת ערב משפחתית",  start:"2026-06-06 19:00", end:"2026-06-06 21:00", color:"#10B981" },
  { id:5, title:"פגישת לקוח BigCorp", start:"2026-06-08 11:00", end:"2026-06-08 12:00", color:"#6366F1" },
  { id:6, title:"רופא שיניים",         start:"2026-06-10 10:00", end:"2026-06-10 11:00", color:"#F43F5E" },
];

const INIT_TASKS = [
  { id:1, title:"הכנת דוח רבעוני Q2", area:"work", priority:"critical", done:false, dueDate:"2026-06-08", energy:"high", notes:"", subtasks:["איסוף נתונים","ניתוח מגמות","הצגה להנהלה"], completedSubtasks:[], starred:true },
  { id:2, title:"אימון כושר", area:"health", priority:"medium", done:true, dueDate:"2026-06-05", energy:"high", notes:"", subtasks:[], completedSubtasks:[], starred:false },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const getArea = id => AREAS.find(a=>a.id===id);
const getPrio = id => PRIORITIES[id];
const fmt = d => { try { return new Date(d).toLocaleDateString("he-IL",{day:"numeric",month:"short"}); } catch { return d; } };
const fmtTime = s => s?.split(" ")[1]?.slice(0,5) || "";

// ─── PERSISTENT STORAGE HOOK ─────────────────────────────────────────────────
function usePersisted(key, fallback) {
  const [val, setValRaw] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== undefined) return JSON.parse(stored);
    } catch {}
    return fallback;
  });

  // load from artifact storage on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await Promise.resolve({ value: localStorage.getItem(key) });
        if (res?.value !== undefined) setValRaw(JSON.parse(res.value));
      } catch {}
    })();
  }, [key]);

  const setVal = useCallback((updater) => {
    setValRaw(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      (async () => {
        try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      })();
      return next;
    });
  }, [key]);

  return [val, setVal];
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab]             = useState("home");
  const [tasks, setTasks]         = usePersisted("tf:tasks", INIT_TASKS);
  const [scheduledSlots, setScheduledSlots] = usePersisted("tf:slots", {});
  const [relevantLabels, setRelevantLabels] = usePersisted("tf:labels", ["עבודה","בריאות","פיננסי"]);
  const [sheet, setSheet]         = useState(null);
  const [filterArea, setFilterArea] = useState("all");
  const [toast, setToast]         = useState(null);
  const [expandedTask, setExpandedTask] = useState(null);
  const [storageReady, setStorageReady] = useState(false);

  // email state
  const [emails]                  = useState(MOCK_EMAILS);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [emailFilter, setEmailFilter]     = useState("all");

  // calendar state
  const [calEvents]               = useState(MOCK_CALENDAR);

  // agent state
  const [agentMsgs, setAgentMsgs] = useState([
    { role:"assistant", text:"היי! אני הסוכן שלך 🤖\n\nאני יכול:\n📧 לקרוא מיילים ולחלץ משימות\n📅 למצוא זמן ביומן לכל משימה\n🎙️ לקבל הכתבה קולית\n✍️ לקבל טקסט חופשי\n\nרשום או הקלט!" }
  ]);
  const [agentInput, setAgentInput] = useState("");
  const [agentLoading, setAgentLoading] = useState(false);

  // voice state
  const [recording, setRecording]   = useState(false);
  const [audioBlob, setAudioBlob]   = useState(null);
  const [transcribing, setTranscribing] = useState(false);
  const [micError, setMicError]     = useState("");
  const mediaRecRef  = useRef(null);
  const chunksRef    = useRef([]);
  const agentEndRef  = useRef(null);

  // check storage available + show indicator
  useEffect(() => {
    (async () => {
      try {
        localStorage.setItem("tf:ping","1");
        setStorageReady(true);
      } catch {
        setStorageReady(false);
      }
    })();
  }, []);

  const showToast = (msg, type="success") => {
    setToast({msg,type});
    setTimeout(()=>setToast(null), 2800);
  };

  const resetData = async () => {
    setTasks(INIT_TASKS);
    setScheduledSlots({});
    try {
      localStorage.setItem("tf:tasks", JSON.stringify(INIT_TASKS));
      localStorage.setItem("tf:slots", JSON.stringify({}));
    } catch {}
    showToast("הנתונים אופסו");
  };
  const toggleDone  = id => setTasks(p=>p.map(t=>t.id===id?{...t,done:!t.done}:t));
  const toggleStar  = id => setTasks(p=>p.map(t=>t.id===id?{...t,starred:!t.starred}:t));
  const deleteTask  = id => { setTasks(p=>p.filter(t=>t.id!==id)); setSheet(null); showToast("משימה נמחקה"); };
  const addTasks    = (list) => {
    setTasks(p=>[...p,...list]);
    showToast(`${list.length} משימות נוספו ✓`);
  };
  const toggleSubtask = (tid,st) => setTasks(p=>p.map(t=>{
    if(t.id!==tid) return t;
    const has=t.completedSubtasks.includes(st);
    return {...t,completedSubtasks:has?t.completedSubtasks.filter(s=>s!==st):[...t.completedSubtasks,st]};
  }));

  // ── Voice recording ───────────────────────────────────────────────────────
  const startRecording = async () => {
    setMicError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported("audio/webm")?'audio/webm':'audio/ogg' });
      mr.ondataavailable = e => { if(e.data.size>0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType });
        setAudioBlob(blob);
        stream.getTracks().forEach(t=>t.stop());
        transcribeAudio(blob);
      };
      mr.start(200);
      mediaRecRef.current = mr;
      setRecording(true);
    } catch(e) {
      setMicError("לא ניתן לגשת למיקרופון. אפשר הרשאה בדפדפן.");
    }
  };

  const stopRecording = () => {
    mediaRecRef.current?.stop();
    setRecording(false);
  };

  // Transcribe via Claude (send as base64 + ask to transcribe text)
  const transcribeAudio = async (blob) => {
    setTranscribing(true);
    try {
      // Convert blob to base64
      const buf  = await blob.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let bin = "";
      bytes.forEach(b => bin += String.fromCharCode(b));
      const b64 = btoa(bin);
      const mtype = blob.type || "audio/webm";

      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || "";
    const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{
        "Content-Type":"application/json",
        ...(apiKey ? {"x-api-key": apiKey, "anthropic-version":"2023-06-01"} : {})
      },
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:500,
          messages:[{
            role:"user",
            content:[
              { type:"text", text:"תמלל את ההקלטה הזו לעברית. החזר רק את הטקסט המתומלל, ללא הסברים." },
              { type:"document", source:{ type:"base64", media_type: mtype, data: b64 } }
            ]
          }]
        })
      });
      const data = await res.json();
      // If transcription works, use it; otherwise fall back gracefully
      const txt = data.content?.map(b=>b.text||"").join("").trim();
      if(txt && !txt.toLowerCase().includes("cannot") && !txt.toLowerCase().includes("error")) {
        setAgentInput(txt);
        showToast("הקלטה תומללה ✓");
      } else {
        // Fallback: tell user transcription not supported, keep input
        setMicError("תמלול אודיו אינו נתמך כאן — הקלד ידנית.");
      }
    } catch {
      setMicError("שגיאת תמלול — הקלד ידנית.");
    }
    setTranscribing(false);
    setAudioBlob(null);
  };

  // ── AI: parse free text → structured tasks ────────────────────────────────
  const callAI = async (prompt, systemPrompt) => {
    const res = await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        model:"claude-sonnet-4-20250514", max_tokens:1200,
        system: systemPrompt,
        messages:[{ role:"user", content: prompt }]
      })
    });
    const data = await res.json();
    return data.content?.map(b=>b.text||"").join("") || "";
  };

  const TASK_SYSTEM = `אתה סוכן AI שמחלץ משימות מטקסט ומחזיר JSON בלבד — מערך של אובייקטים.
שדות כל אובייקט:
- title: שם המשימה בעברית (חובה)
- area: work/personal/health/learning/finance/social
- priority: critical/high/medium/low
- dueDate: YYYY-MM-DD אם הוזכר, אחרת ""
  היום הוא 2026-06-05. מחר=06-06, שלישי=06-09, רביעי=06-10, ראשון=06-07, סוף שבוע=06-07
- energy: high/medium/low
- notes: הערה רלוונטית אם יש
- starred: true אם דחוף מאוד
- durationMin: משך המשימה בדקות (הערכה)
החזר JSON בלבד. אם אין משימות — [].`;

  const SCHEDULE_SYSTEM = `אתה עוזר לתזמון חכם.
יש לך רשימת משימות ויומן קיים. מצא slot פנוי אידיאלי לכל משימה.
החזר JSON בלבד — מערך:
[{"taskId": ..., "slot": "2026-06-06 10:00", "reason": "פנוי אחרי stand-up"}]
שעות עבודה: 08:00-20:00. אל תחפוף לאירועים קיימים.
TODAY: 2026-06-05.`;

  const parseJSON = raw => {
    try { return JSON.parse(raw.replace(/```json|```/g,"").trim()); }
    catch { return null; }
  };

  // ── Send agent message ─────────────────────────────────────────────────────
  const sendAgent = async (textOverride) => {
    const text = (textOverride || agentInput).trim();
    if(!text || agentLoading) return;
    setAgentInput("");
    setAgentMsgs(p=>[...p,{ role:"user", text }]);
    setAgentLoading(true);
    try {
      const raw  = await callAI(text, TASK_SYSTEM);
      const list = parseJSON(raw);
      if(!list || list.length===0) {
        setAgentMsgs(p=>[...p,{ role:"assistant", text:"לא מצאתי משימות ברורות 🤔\nנסה לנסח כגון: \"להגיש דוח מחר\"" }]);
      } else {
        const withId = list.map(t=>({...t, id:Date.now()+Math.random(), done:false, subtasks:[], completedSubtasks:[]}));
        setAgentMsgs(p=>[...p,{ role:"assistant", text:`מצאתי ${withId.length} משימה${withId.length>1?"ות":""}:`, tasks:withId, pending:true }]);
      }
    } catch {
      setAgentMsgs(p=>[...p,{ role:"assistant", text:"שגיאת חיבור 😓" }]);
    }
    setAgentLoading(false);
  };

  // ── Extract tasks from email ───────────────────────────────────────────────
  const extractFromEmail = async (email) => {
    setAgentMsgs(p=>[...p,{ role:"user", text:`📧 חלץ משימות מהמייל: "${email.subject}"` }]);
    setSheet(null);
    setTab("agent");
    setAgentLoading(true);
    try {
      const prompt = `מייל מ-${email.name}:\nנושא: ${email.subject}\n\n${email.body}`;
      const raw  = await callAI(prompt, TASK_SYSTEM);
      const list = parseJSON(raw);
      if(!list||list.length===0) {
        setAgentMsgs(p=>[...p,{ role:"assistant", text:"לא מצאתי משימות אופרטיביות במייל הזה." }]);
      } else {
        const withId = list.map(t=>({...t,id:Date.now()+Math.random(),done:false,subtasks:[],completedSubtasks:[],notes:`מייל: ${email.subject}`}));
        setAgentMsgs(p=>[...p,{ role:"assistant", text:`חילצתי ${withId.length} משימה${withId.length>1?"ות":""} מהמייל:`, tasks:withId, pending:true }]);
      }
    } catch {
      setAgentMsgs(p=>[...p,{ role:"assistant", text:"שגיאה בחילוץ." }]);
    }
    setAgentLoading(false);
  };

  // ── Schedule tasks into calendar ──────────────────────────────────────────
  const scheduleTasks = async (taskList) => {
    setAgentLoading(true);
    const calStr = calEvents.map(e=>`${e.title}: ${e.start}–${e.end}`).join("\n");
    const taskStr = taskList.map(t=>`id:${t.id} "${t.title}" dur:${t.durationMin||60}min due:${t.dueDate||"flexible"}`).join("\n");
    const prompt = `יומן קיים:\n${calStr}\n\nמשימות לתזמון:\n${taskStr}`;
    try {
      const raw = await callAI(prompt, SCHEDULE_SYSTEM);
      const slots = parseJSON(raw);
      if(slots && slots.length>0) {
        const map = {};
        slots.forEach(s=>{ map[s.taskId]=s; });
        setScheduledSlots(prev=>({...prev,...map}));
        const preview = slots.map(s=>`• ${taskList.find(t=>t.id==s.taskId)?.title||"משימה"}: ${s.slot?.split(" ")[0]?fmt(s.slot.split(" ")[0]):""} ${s.slot?.split(" ")[1]||""}`).join("\n");
        setAgentMsgs(p=>[...p,{ role:"assistant", text:`📅 נמצאו slots ביומן:\n\n${preview}`, scheduled:true }]);
      } else {
        setAgentMsgs(p=>[...p,{ role:"assistant", text:"לא הצלחתי למצוא slots מתאימים." }]);
      }
    } catch {
      setAgentMsgs(p=>[...p,{ role:"assistant", text:"שגיאה בתזמון." }]);
    }
    setAgentLoading(false);
  };

  const confirmTasks = (msgTasks) => {
    const withCleanId = msgTasks.map(t=>({...t,id:Date.now()+Math.random()}));
    addTasks(withCleanId);
    setAgentMsgs(p=>p.map(m=>m.pending?{...m,pending:false,confirmed:true}:m));
    // offer scheduling
    setAgentMsgs(p=>[...p,{role:"assistant",text:"רוצה שאמצא זמן ביומן לכל אחת?",offerSchedule:true,scheduleTasks:withCleanId}]);
  };
  const rejectTasks = () => setAgentMsgs(p=>p.map(m=>m.pending?{...m,pending:false,rejected:true}:m));

  useEffect(()=>{ agentEndRef.current?.scrollIntoView({behavior:"smooth"}); },[agentMsgs,agentLoading]);

  // ─── SHARED UI ────────────────────────────────────────────────────────────
  const Chip = ({label,color,small})=>(
    <span style={{background:color+"22",color,borderRadius:6,padding:small?"1px 6px":"3px 9px",fontSize:small?10:12,fontWeight:700,display:"inline-block",lineHeight:1.6}}>{label}</span>
  );
  const SectionH = ({title,action,onAction})=>(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 16px 8px"}}>
      <span style={{fontWeight:700,fontSize:15,color:DARK.text}}>{title}</span>
      {action&&<button onClick={onAction} style={{background:"none",border:"none",color:DARK.accent,fontSize:13,fontWeight:600,cursor:"pointer",padding:0}}>{action}</button>}
    </div>
  );

  const TaskRow = ({task})=>{
    const p=getPrio(task.priority), a=getArea(task.area), exp=expandedTask===task.id;
    const subPct=task.subtasks.length?task.completedSubtasks.length/task.subtasks.length:0;
    const slot=Object.values(scheduledSlots).find(s=>s.taskId==task.id);
    return(
      <div style={{borderBottom:`1px solid ${DARK.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",background:exp?DARK.card2:"transparent"}}>
          <div onClick={()=>toggleDone(task.id)} style={{width:22,height:22,borderRadius:99,border:`2px solid ${task.done?p.color:DARK.border}`,background:task.done?p.color:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .2s"}}>
            {task.done&&<span style={{color:"#fff",fontSize:11}}>✓</span>}
          </div>
          <div style={{flex:1,minWidth:0,cursor:"pointer"}} onClick={()=>setExpandedTask(exp?null:task.id)}>
            <div style={{fontWeight:600,fontSize:14,color:task.done?DARK.muted:DARK.text,textDecoration:task.done?"line-through":"none",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
              {task.starred&&<span style={{marginLeft:4}}>⭐</span>}{task.title}
            </div>
            <div style={{display:"flex",gap:5,marginTop:4,flexWrap:"wrap",alignItems:"center"}}>
              <Chip label={`${a?.icon} ${a?.label}`} color={a?.color} small/>
              <Chip label={`${p.icon} ${p.label}`} color={p.color} small/>
              {task.dueDate&&<span style={{fontSize:10,color:DARK.muted}}>📅 {fmt(task.dueDate)}</span>}
              {slot&&<span style={{fontSize:10,color:DARK.success}}>🗓 {slot.slot?.split(" ")[0]?fmt(slot.slot.split(" ")[0]):""} {slot.slot?.split(" ")[1]||""}</span>}
            </div>
            {task.subtasks.length>0&&(
              <div style={{display:"flex",alignItems:"center",gap:6,marginTop:5}}>
                <div style={{flex:1,height:3,background:DARK.border,borderRadius:99,overflow:"hidden"}}>
                  <div style={{width:`${subPct*100}%`,height:"100%",background:DARK.accent,borderRadius:99}}/>
                </div>
                <span style={{fontSize:10,color:DARK.muted}}>{task.completedSubtasks.length}/{task.subtasks.length}</span>
              </div>
            )}
          </div>
          <div style={{display:"flex",gap:0}}>
            <button onClick={()=>toggleStar(task.id)} style={{background:"none",border:"none",fontSize:16,cursor:"pointer",padding:"4px 6px",opacity:task.starred?1:0.3}}>⭐</button>
            <button onClick={()=>setSheet("task:"+task.id)} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",padding:"4px 6px",color:DARK.muted}}>›</button>
          </div>
        </div>
        {exp&&task.subtasks.length>0&&(
          <div style={{background:DARK.card2,padding:"8px 16px 12px 48px",borderTop:`1px solid ${DARK.border}`}}>
            {task.subtasks.map(st=>(
              <div key={st} onClick={()=>toggleSubtask(task.id,st)} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",cursor:"pointer"}}>
                <div style={{width:16,height:16,borderRadius:4,border:`2px solid ${task.completedSubtasks.includes(st)?DARK.accent:DARK.border}`,background:task.completedSubtasks.includes(st)?DARK.accent:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {task.completedSubtasks.includes(st)&&<span style={{color:"#fff",fontSize:9}}>✓</span>}
                </div>
                <span style={{fontSize:13,color:task.completedSubtasks.includes(st)?DARK.muted:DARK.text,textDecoration:task.completedSubtasks.includes(st)?"line-through":"none"}}>{st}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const Sheet = ({title,children,onClose,height="85%"})=>(
    <div style={{position:"fixed",inset:0,zIndex:200}}>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"#00000088"}}/>
      <div style={{position:"absolute",bottom:0,left:0,right:0,height,background:DARK.card,borderRadius:"20px 20px 0 0",overflow:"hidden",display:"flex",flexDirection:"column"}}>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"12px 16px 0",flexShrink:0}}>
          <div style={{width:40,height:4,borderRadius:99,background:DARK.border,marginBottom:12}}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",paddingBottom:12,borderBottom:`1px solid ${DARK.border}`}}>
            <button onClick={onClose} style={{background:"none",border:"none",color:DARK.muted,fontSize:14,cursor:"pointer",padding:"4px 8px"}}>סגור</button>
            <span style={{fontWeight:700,fontSize:16,color:DARK.text}}>{title}</span>
            <div style={{width:52}}/>
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto"}}>{children}</div>
      </div>
    </div>
  );

  // ─── SCREENS ──────────────────────────────────────────────────────────────

  // HOME
  const HomeScreen = ()=>{
    const pending=tasks.filter(t=>!t.done);
    const critical=tasks.filter(t=>!t.done&&t.priority==="critical");
    const starred=tasks.filter(t=>!t.done&&t.starred);
    const unread=emails.filter(e=>e.unread);
    const todayEv=calEvents.filter(e=>e.start.startsWith("2026-06-05"));
    return(
      <div style={{paddingBottom:80}}>
        <div style={{padding:"20px 16px 14px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontSize:13,color:DARK.muted}}>יום שישי, 5 ביוני 2026</div>
              <div style={{fontSize:24,fontWeight:800,color:DARK.text}}>שלום 👋</div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setTab("email")} style={{background:"#EA433518",border:"none",borderRadius:12,padding:"8px 12px",color:"#EA4335",fontSize:13,fontWeight:700,cursor:"pointer"}}>
                ✉️ {unread.length}
              </button>
              <button onClick={()=>setTab("agent")} style={{background:DARK.accentSoft,border:"none",borderRadius:12,padding:"8px 12px",color:DARK.accent,fontSize:13,fontWeight:700,cursor:"pointer"}}>🤖 סוכן</button>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginTop:14}}>
            {[{v:pending.length,l:"פתוחות",c:"#6366F1"},{v:critical.length,l:"קריטיות",c:"#EF4444"},{v:todayEv.length,l:"היום",c:"#22C55E"}].map(s=>(
              <div key={s.l} style={{background:DARK.card,borderRadius:14,padding:"12px 10px",textAlign:"center"}}>
                <div style={{fontSize:26,fontWeight:800,color:s.c}}>{s.v}</div>
                <div style={{fontSize:11,color:DARK.muted,marginTop:1}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Today calendar strip */}
        {todayEv.length>0&&(
          <>
            <SectionH title="📅 היום ביומן"/>
            <div style={{overflowX:"auto",paddingRight:16,display:"flex",gap:10,marginBottom:4}}>
              {todayEv.map(ev=>(
                <div key={ev.id} style={{background:DARK.card,borderRadius:14,padding:"10px 14px",flexShrink:0,minWidth:140,borderTop:`3px solid ${ev.color}`}}>
                  <div style={{fontWeight:700,fontSize:13,color:DARK.text}}>{ev.title}</div>
                  <div style={{fontSize:11,color:DARK.muted,marginTop:3}}>🕐 {fmtTime(ev.start)}</div>
                </div>
              ))}
              <div style={{width:16,flexShrink:0}}/>
            </div>
          </>
        )}

        {/* Unread mail peek */}
        {unread.length>0&&(
          <>
            <SectionH title={`✉️ מיילים חדשים (${unread.length})`} action="כל המיילים" onAction={()=>setTab("email")}/>
            <div style={{background:DARK.card,marginBottom:4}}>
              {unread.slice(0,3).map((m,i)=>(
                <div key={m.id} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",borderBottom:i<2?`1px solid ${DARK.border}`:"none"}}>
                  <div style={{width:8,height:8,borderRadius:99,background:getPrio(m.priority).color,flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:700,color:DARK.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.subject}</div>
                    <div style={{fontSize:11,color:DARK.muted}}>{m.name} · {m.time}</div>
                  </div>
                  <button onClick={()=>extractFromEmail(m)} style={{background:DARK.accentSoft,border:"none",borderRadius:8,padding:"5px 10px",color:DARK.accent,fontSize:11,fontWeight:700,cursor:"pointer",flexShrink:0}}>⚡ משימה</button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Starred */}
        <SectionH title="⭐ פוקוס" action="כל המשימות" onAction={()=>setTab("tasks")}/>
        <div style={{background:DARK.card}}>
          {starred.length===0
            ?<div style={{padding:"16px",color:DARK.muted,fontSize:13,textAlign:"center"}}>סמן משימות בכוכב לראות כאן</div>
            :starred.map(t=><TaskRow key={t.id} task={t}/>)
          }
        </div>
        {critical.length>0&&(
          <>
            <SectionH title="🔴 קריטי"/>
            <div style={{background:DARK.card}}>{critical.map(t=><TaskRow key={t.id} task={t}/>)}</div>
          </>
        )}
      </div>
    );
  };

  // EMAIL SCREEN
  const EmailScreen = ()=>{
    const displayed = emails.filter(e=>{
      if(emailFilter==="unread") return e.unread;
      if(emailFilter==="relevant") return relevantLabels.includes(e.label);
      return true;
    });
    return(
      <div style={{paddingBottom:80}}>
        <div style={{padding:"20px 16px 12px",background:DARK.bg,position:"sticky",top:0,zIndex:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <span style={{fontSize:20,fontWeight:800}}>תיבת דואר</span>
            <span style={{fontSize:13,color:DARK.muted}}>{emails.filter(e=>e.unread).length} לא נקראו</span>
          </div>
          <div style={{overflowX:"auto",display:"flex",gap:8}}>
            {[{id:"all",l:"הכל"},{id:"unread",l:"לא נקראו"},{id:"relevant",l:"רלוונטי לי"}].map(f=>(
              <button key={f.id} onClick={()=>setEmailFilter(f.id)} style={{flexShrink:0,background:emailFilter===f.id?DARK.accent:DARK.card,color:emailFilter===f.id?"#fff":DARK.muted,border:"none",borderRadius:99,padding:"6px 16px",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                {f.l}
              </button>
            ))}
          </div>
          {emailFilter==="relevant"&&(
            <div style={{marginTop:10,padding:"10px 12px",background:DARK.card2,borderRadius:12,fontSize:12,color:DARK.muted}}>
              📌 מציג מיילים בנושאי: {relevantLabels.join(" · ")}
              <button onClick={()=>setSheet("emailSettings")} style={{background:"none",border:"none",color:DARK.accent,fontSize:12,cursor:"pointer",marginRight:6}}>ערוך</button>
            </div>
          )}
        </div>
        <div style={{background:DARK.card}}>
          {displayed.map((m,i)=>(
            <div key={m.id} style={{borderBottom:`1px solid ${DARK.border}`,opacity:m.unread?1:0.7}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:12,padding:"14px 16px"}}>
                {/* Avatar */}
                <div style={{width:38,height:38,borderRadius:99,background:getPrio(m.priority).color+"33",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:getPrio(m.priority).color}}>
                  {m.name[0]}
                </div>
                <div style={{flex:1,minWidth:0,cursor:"pointer"}} onClick={()=>setSelectedEmail(m)}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:13,fontWeight:m.unread?700:500,color:DARK.text}}>{m.name}</span>
                    <span style={{fontSize:11,color:DARK.muted}}>{m.time}</span>
                  </div>
                  <div style={{fontSize:13,fontWeight:m.unread?600:400,color:m.unread?DARK.text:DARK.muted,marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.subject}</div>
                  <div style={{fontSize:11,color:DARK.muted,marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.body.split("\n")[2]||""}</div>
                  <div style={{display:"flex",gap:6,marginTop:6}}>
                    <Chip label={m.label} color={getArea(AREAS.find(a=>a.label===m.label)?.id||"work")?.color||DARK.muted} small/>
                    <Chip label={getPrio(m.priority).icon+" "+getPrio(m.priority).label} color={getPrio(m.priority).color} small/>
                  </div>
                </div>
              </div>
              <div style={{display:"flex",gap:8,padding:"0 16px 12px 66px"}}>
                <button onClick={()=>extractFromEmail(m)} style={{background:DARK.accentSoft,border:"none",borderRadius:8,padding:"6px 12px",color:DARK.accent,fontSize:12,fontWeight:700,cursor:"pointer"}}>⚡ חלץ משימות</button>
                <button onClick={()=>setSelectedEmail(m)} style={{background:DARK.card2,border:`1px solid ${DARK.border}`,borderRadius:8,padding:"6px 12px",color:DARK.muted,fontSize:12,cursor:"pointer"}}>קרא</button>
              </div>
            </div>
          ))}
        </div>

        {/* Email detail sheet */}
        {selectedEmail&&(
          <Sheet title={selectedEmail.subject} onClose={()=>setSelectedEmail(null)} height="80%">
            <div style={{padding:"14px 16px"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,paddingBottom:12,borderBottom:`1px solid ${DARK.border}`}}>
                <div style={{width:40,height:40,borderRadius:99,background:getPrio(selectedEmail.priority).color+"33",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:getPrio(selectedEmail.priority).color}}>
                  {selectedEmail.name[0]}
                </div>
                <div>
                  <div style={{fontWeight:700,fontSize:14,color:DARK.text}}>{selectedEmail.name}</div>
                  <div style={{fontSize:12,color:DARK.muted}}>{selectedEmail.from} · {selectedEmail.time}</div>
                </div>
              </div>
              <div style={{fontSize:14,color:DARK.text,lineHeight:1.8,whiteSpace:"pre-wrap",marginBottom:20}}>{selectedEmail.body}</div>
              <button onClick={()=>{extractFromEmail(selectedEmail);setSelectedEmail(null);}} style={{width:"100%",background:DARK.accent,color:"#fff",border:"none",borderRadius:14,padding:14,fontWeight:800,fontSize:15,cursor:"pointer"}}>
                ⚡ חלץ משימות אופרטיביות
              </button>
            </div>
          </Sheet>
        )}

        {/* Email settings sheet */}
        {sheet==="emailSettings"&&(
          <Sheet title="הגדרות סינון מיילים" onClose={()=>setSheet(null)} height="60%">
            <div style={{padding:"16px"}}>
              <div style={{fontSize:13,color:DARK.muted,marginBottom:12}}>בחר נושאים רלוונטיים לסינון אוטומטי:</div>
              {AREAS.map(a=>(
                <div key={a.id} onClick={()=>setRelevantLabels(p=>p.includes(a.label)?p.filter(l=>l!==a.label):[...p,a.label])} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:`1px solid ${DARK.border}`,cursor:"pointer"}}>
                  <div style={{width:24,height:24,borderRadius:6,border:`2px solid ${relevantLabels.includes(a.label)?a.color:DARK.border}`,background:relevantLabels.includes(a.label)?a.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {relevantLabels.includes(a.label)&&<span style={{color:"#fff",fontSize:12}}>✓</span>}
                  </div>
                  <span style={{fontSize:20}}>{a.icon}</span>
                  <span style={{fontSize:15,fontWeight:600,color:DARK.text}}>{a.label}</span>
                </div>
              ))}
            </div>
          </Sheet>
        )}
      </div>
    );
  };

  // TASKS SCREEN
  const TasksScreen = ()=>{
    const filtered=tasks.filter(t=>filterArea==="all"||t.area===filterArea);
    return(
      <div style={{paddingBottom:80}}>
        <div style={{padding:"20px 16px 12px",background:DARK.bg,position:"sticky",top:0,zIndex:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <span style={{fontSize:20,fontWeight:800}}>משימות</span>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{ if(window.confirm("לאפס את כל הנתונים?")) resetData(); }} style={{background:"none",border:`1px solid ${DARK.border}`,borderRadius:10,padding:"7px 12px",color:DARK.muted,fontSize:12,cursor:"pointer"}}>איפוס</button>
              <button onClick={()=>setSheet("addTask")} style={{background:DARK.accent,color:"#fff",border:"none",borderRadius:10,padding:"8px 16px",fontWeight:700,fontSize:14,cursor:"pointer"}}>+ חדשה</button>
            </div>
          </div>
          <div style={{overflowX:"auto",display:"flex",gap:8}}>
            {[{id:"all",label:"הכל",icon:"📋"},...AREAS].map(a=>(
              <button key={a.id} onClick={()=>setFilterArea(a.id)} style={{flexShrink:0,background:filterArea===a.id?DARK.accent:DARK.card,color:filterArea===a.id?"#fff":DARK.muted,border:"none",borderRadius:99,padding:"6px 14px",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                {a.icon} {a.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{background:DARK.card,marginBottom:2}}>
          <div style={{padding:"8px 16px 4px",fontSize:12,fontWeight:700,color:DARK.muted,textTransform:"uppercase",letterSpacing:1}}>ממתינות · {filtered.filter(t=>!t.done).length}</div>
          {filtered.filter(t=>!t.done).sort((a,b)=>({critical:0,high:1,medium:2,low:3}[a.priority]-{critical:0,high:1,medium:2,low:3}[b.priority])).map(t=><TaskRow key={t.id} task={t}/>)}
          {filtered.filter(t=>!t.done).length===0&&<div style={{padding:"20px",textAlign:"center",color:DARK.muted}}>🎉 הכל הושלם!</div>}
        </div>
        {filtered.filter(t=>t.done).length>0&&(
          <div style={{background:DARK.card}}>
            <div style={{padding:"8px 16px 4px",fontSize:12,fontWeight:700,color:DARK.muted,textTransform:"uppercase",letterSpacing:1}}>הושלמו · {filtered.filter(t=>t.done).length}</div>
            {filtered.filter(t=>t.done).map(t=><TaskRow key={t.id} task={t}/>)}
          </div>
        )}
      </div>
    );
  };

  // AGENT SCREEN
  const AgentScreen = ()=>{
    const QUICK = ["להכין מצגת למחר בצהריים, דחוף","לשלוח דוח לבוס עד יום ראשון","אימון שלוש פעמים השבוע","לקנות מצרכים ביום שלישי"];
    return(
      <div style={{display:"flex",flexDirection:"column",height:"100vh",paddingBottom:64}}>
        {/* Header */}
        <div style={{padding:"16px 16px 12px",borderBottom:`1px solid ${DARK.border}`,background:DARK.bg,flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:38,height:38,borderRadius:99,background:`linear-gradient(135deg,${DARK.accent},#A855F7)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🤖</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:800,fontSize:15,color:DARK.text}}>סוכן משימות</div>
              <div style={{fontSize:11,color:agentLoading?"#22C55E":DARK.muted}}>{agentLoading?"⚡ עובד...":"מוכן · טקסט + קול"}</div>
            </div>
            <button onClick={()=>setAgentMsgs([{role:"assistant",text:"היי! אני הסוכן שלך 🤖\n\nרשום, הכתב, או שלח לי מייל לניתוח!"}])} style={{background:DARK.card2,border:`1px solid ${DARK.border}`,borderRadius:8,padding:"5px 10px",color:DARK.muted,fontSize:12,cursor:"pointer"}}>נקה</button>
          </div>
        </div>

        {/* Messages */}
        <div style={{flex:1,overflowY:"auto",padding:"10px 0"}}>
          {agentMsgs.map((msg,i)=>(
            <div key={i} style={{padding:"4px 14px",marginBottom:4}}>
              {msg.role==="user"?(
                <div style={{display:"flex",justifyContent:"flex-start"}}>
                  <div style={{background:DARK.accent,color:"#fff",borderRadius:"18px 18px 4px 18px",padding:"10px 14px",maxWidth:"78%",fontSize:14,lineHeight:1.5}}>{msg.text}</div>
                </div>
              ):(
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
                  <div style={{background:msg.confirmed?"#22C55E18":msg.rejected?DARK.card2:DARK.card,border:`1px solid ${msg.confirmed?"#22C55E33":DARK.border}`,color:DARK.text,borderRadius:"18px 18px 18px 4px",padding:"12px 14px",maxWidth:"90%",fontSize:14,lineHeight:1.7,whiteSpace:"pre-wrap"}}>
                    {msg.confirmed&&<div style={{color:"#22C55E",fontWeight:700,marginBottom:4,fontSize:13}}>✅ נוספו!</div>}
                    {msg.rejected&&<div style={{color:DARK.muted,fontWeight:700,marginBottom:4,fontSize:13}}>❌ בוטל</div>}
                    {msg.text}
                    {/* Task previews */}
                    {msg.tasks&&msg.tasks.map(t=>(
                      <div key={t.id} style={{background:DARK.card2,borderRadius:10,padding:"8px 10px",marginTop:8,fontSize:13}}>
                        <div style={{fontWeight:700,color:DARK.text}}>{t.title}</div>
                        <div style={{display:"flex",gap:6,marginTop:4,flexWrap:"wrap"}}>
                          <Chip label={`${getArea(t.area)?.icon} ${getArea(t.area)?.label}`} color={getArea(t.area)?.color} small/>
                          <Chip label={`${getPrio(t.priority)?.icon} ${getPrio(t.priority)?.label}`} color={getPrio(t.priority)?.color} small/>
                          {t.dueDate&&<span style={{fontSize:10,color:DARK.muted}}>📅 {fmt(t.dueDate)}</span>}
                          {t.durationMin&&<span style={{fontSize:10,color:DARK.muted}}>⏱ {t.durationMin}ד'</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Confirm/reject */}
                  {msg.pending&&!msg.confirmed&&!msg.rejected&&(
                    <div style={{display:"flex",gap:8,maxWidth:"90%",width:"100%"}}>
                      <button onClick={()=>confirmTasks(msg.tasks)} style={{flex:1,background:"#22C55E",color:"#fff",border:"none",borderRadius:12,padding:"10px",fontWeight:700,fontSize:14,cursor:"pointer"}}>✅ הוסף!</button>
                      <button onClick={rejectTasks} style={{flex:1,background:DARK.card2,color:DARK.muted,border:`1px solid ${DARK.border}`,borderRadius:12,padding:"10px",fontWeight:700,fontSize:14,cursor:"pointer"}}>✕ לא</button>
                    </div>
                  )}
                  {/* Offer schedule */}
                  {msg.offerSchedule&&!msg.scheduled&&(
                    <div style={{display:"flex",gap:8,maxWidth:"90%",width:"100%"}}>
                      <button onClick={()=>{ scheduleTasks(msg.scheduleTasks); setAgentMsgs(p=>p.map(m=>m.offerSchedule?{...m,scheduled:true}:m)); }} style={{flex:1,background:DARK.accent,color:"#fff",border:"none",borderRadius:12,padding:"10px",fontWeight:700,fontSize:14,cursor:"pointer"}}>📅 כן, תזמן!</button>
                      <button onClick={()=>setAgentMsgs(p=>p.map(m=>m.offerSchedule?{...m,scheduled:true}:m))} style={{flex:1,background:DARK.card2,color:DARK.muted,border:`1px solid ${DARK.border}`,borderRadius:12,padding:"10px",fontWeight:700,fontSize:14,cursor:"pointer"}}>לא עכשיו</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {agentLoading&&(
            <div style={{padding:"4px 14px"}}>
              <div style={{display:"flex",justifyContent:"flex-end"}}>
                <div style={{background:DARK.card,border:`1px solid ${DARK.border}`,borderRadius:"18px 18px 18px 4px",padding:"12px 16px",display:"flex",gap:5,alignItems:"center"}}>
                  {[0,1,2].map(d=><div key={d} style={{width:7,height:7,borderRadius:99,background:DARK.accent,animation:`bounce 1.2s ${d*0.2}s infinite`}}/>)}
                </div>
              </div>
            </div>
          )}
          <div ref={agentEndRef}/>
        </div>

        {/* Quick prompts */}
        {agentMsgs.length<=1&&(
          <div style={{padding:"0 14px 8px",flexShrink:0}}>
            <div style={{fontSize:11,color:DARK.muted,marginBottom:6,textAlign:"right"}}>דוגמאות:</div>
            <div style={{overflowX:"auto",display:"flex",gap:8}}>
              {QUICK.map(q=>(
                <button key={q} onClick={()=>setAgentInput(q)} style={{flexShrink:0,background:DARK.card,border:`1px solid ${DARK.border}`,borderRadius:10,padding:"7px 12px",color:DARK.muted,fontSize:12,cursor:"pointer",whiteSpace:"nowrap"}}>{q}</button>
              ))}
              <div style={{width:6,flexShrink:0}}/>
            </div>
          </div>
        )}

        {/* Mic error */}
        {micError&&<div style={{padding:"6px 16px",background:"#EF444422",fontSize:12,color:"#EF4444",textAlign:"center",flexShrink:0}}>{micError}</div>}

        {/* Input bar */}
        <div style={{padding:"10px 12px",borderTop:`1px solid ${DARK.border}`,background:DARK.bg,flexShrink:0}}>
          <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
            {/* Mic button */}
            <button
              onPointerDown={startRecording}
              onPointerUp={stopRecording}
              onPointerLeave={()=>{ if(recording) stopRecording(); }}
              disabled={transcribing}
              style={{width:46,height:46,borderRadius:99,background:recording?"#EF4444":transcribing?"#F97316":DARK.card2,color:recording||transcribing?"#fff":DARK.muted,border:`2px solid ${recording?"#EF4444":DARK.border}`,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s",boxShadow:recording?`0 0 0 4px #EF444433`:""}}
            >
              {transcribing?"⏳":recording?"🔴":"🎙️"}
            </button>
            <textarea
              value={agentInput}
              onChange={e=>setAgentInput(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendAgent();}}}
              placeholder={recording?"מקליט... שחרר להפסיק":transcribing?"ממלל...":"כתוב משימות או לחץ לחיצה ארוכה על 🎙️"}
              rows={1}
              style={{flex:1,background:DARK.card,border:`1px solid ${DARK.border}`,borderRadius:14,padding:"11px 14px",color:DARK.text,fontSize:14,fontFamily:"inherit",outline:"none",resize:"none",direction:"rtl",lineHeight:1.4,maxHeight:100,overflowY:"auto"}}
            />
            <button onClick={()=>sendAgent()} disabled={agentLoading||!agentInput.trim()} style={{width:46,height:46,borderRadius:99,background:agentInput.trim()&&!agentLoading?DARK.accent:DARK.border,color:"#fff",border:"none",cursor:agentInput.trim()&&!agentLoading?"pointer":"not-allowed",fontSize:20,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background .2s"}}>
              ↑
            </button>
          </div>
          <div style={{textAlign:"center",fontSize:10,color:DARK.muted,marginTop:5}}>לחץ ארוך על 🎙️ להקלטה · שחרר להפסיק ולתמלל</div>
        </div>
        <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}`}</style>
      </div>
    );
  };

  // MATRIX SCREEN
  const MatrixScreen = ()=>{
    const pending=tasks.filter(t=>!t.done);
    const qs=[
      {key:"q1",label:"עשה עכשיו",sub:"דחוף + חשוב",color:"#EF4444",tasks:pending.filter(t=>(t.priority==="critical"||t.priority==="high")&&t.dueDate<="2026-06-07")},
      {key:"q2",label:"תכנן",sub:"חשוב + לא דחוף",color:"#6366F1",tasks:pending.filter(t=>t.priority==="high"&&(!t.dueDate||t.dueDate>"2026-06-07"))},
      {key:"q3",label:"האצל",sub:"דחוף + לא חשוב",color:"#F97316",tasks:pending.filter(t=>t.priority==="medium")},
      {key:"q4",label:"דחה/מחק",sub:"לא חשוב + לא דחוף",color:"#22C55E",tasks:pending.filter(t=>t.priority==="low")},
    ];
    return(
      <div style={{padding:"20px 16px 96px"}}>
        <div style={{fontSize:20,fontWeight:800,marginBottom:4}}>מטריצת תעדוף</div>
        <div style={{fontSize:13,color:DARK.muted,marginBottom:16}}>אייזנהאואר — עשה, תכנן, האצל, דחה</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {qs.map(q=>(
            <div key={q.key} style={{background:DARK.card,borderRadius:16,overflow:"hidden"}}>
              <div style={{borderTop:`4px solid ${q.color}`,padding:"12px 12px 10px"}}>
                <div style={{fontWeight:800,fontSize:14,color:q.color}}>{q.label}</div>
                <div style={{fontSize:11,color:DARK.muted,marginBottom:8}}>{q.sub}</div>
                {q.tasks.length===0
                  ?<div style={{fontSize:12,color:DARK.muted}}>ריק ✨</div>
                  :q.tasks.map(t=>(
                    <div key={t.id} style={{background:q.color+"18",borderRadius:8,padding:"7px 10px",marginBottom:6}}>
                      <div style={{fontSize:12,fontWeight:600,color:DARK.text}}>{t.title}</div>
                      {t.dueDate&&<div style={{fontSize:10,color:DARK.muted}}>📅 {fmt(t.dueDate)}</div>}
                    </div>
                  ))
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ─── TASK DETAIL SHEET ────────────────────────────────────────────────────
  const renderSheet = ()=>{
    if(!sheet) return null;
    if(sheet.startsWith("task:")){
      const tid=+sheet.split(":")[1];
      const task=tasks.find(t=>t.id===tid);
      if(!task) return null;
      const p=getPrio(task.priority), a=getArea(task.area);
      return(
        <Sheet title={task.title} onClose={()=>setSheet(null)} height="72%">
          <div style={{padding:"12px 16px",display:"flex",flexWrap:"wrap",gap:8}}>
            <Chip label={`${a?.icon} ${a?.label}`} color={a?.color}/>
            <Chip label={`${p.icon} ${p.label}`} color={p.color}/>
            {task.dueDate&&<Chip label={`📅 ${fmt(task.dueDate)}`} color={DARK.muted}/>}
          </div>
          {task.notes&&<div style={{padding:"0 16px 14px",fontSize:14,color:DARK.muted}}>📝 {task.notes}</div>}
          {task.subtasks.length>0&&(
            <div style={{padding:"0 16px 14px"}}>
              {task.subtasks.map(st=>(
                <div key={st} onClick={()=>toggleSubtask(tid,st)} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",cursor:"pointer",borderBottom:`1px solid ${DARK.border}`}}>
                  <div style={{width:20,height:20,borderRadius:5,border:`2px solid ${task.completedSubtasks.includes(st)?DARK.accent:DARK.border}`,background:task.completedSubtasks.includes(st)?DARK.accent:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {task.completedSubtasks.includes(st)&&<span style={{color:"#fff",fontSize:10}}>✓</span>}
                  </div>
                  <span style={{fontSize:14,textDecoration:task.completedSubtasks.includes(st)?"line-through":"none",color:task.completedSubtasks.includes(st)?DARK.muted:DARK.text}}>{st}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{padding:"12px 16px",display:"flex",gap:10,borderTop:`1px solid ${DARK.border}`}}>
            <button onClick={()=>{toggleDone(tid);setSheet(null);}} style={{flex:1,background:task.done?DARK.border:DARK.success,color:"#fff",border:"none",borderRadius:12,padding:13,fontWeight:700,fontSize:14,cursor:"pointer"}}>
              {task.done?"בטל השלמה":"✓ הושלם"}
            </button>
            <button onClick={()=>deleteTask(tid)} style={{background:DARK.danger+"22",color:DARK.danger,border:"none",borderRadius:12,padding:"13px 16px",fontWeight:700,fontSize:14,cursor:"pointer"}}>מחק</button>
          </div>
        </Sheet>
      );
    }
    if(sheet==="emailSettings") return null; // handled inside EmailScreen
    return null;
  };

  const TABS=[
    {id:"home", icon:"🏠", label:"בית"},
    {id:"email",icon:"✉️", label:"מיילים"},
    {id:"agent",icon:"🤖", label:"סוכן"},
    {id:"tasks",icon:"✅", label:"משימות"},
    {id:"matrix",icon:"📊",label:"תעדוף"},
  ];
  const SCREENS={home:<HomeScreen/>,email:<EmailScreen/>,agent:<AgentScreen/>,tasks:<TasksScreen/>,matrix:<MatrixScreen/>};

  return(
    <div style={{maxWidth:430,margin:"0 auto",minHeight:"100vh",background:DARK.bg,color:DARK.text,fontFamily:"'Heebo','Assistant',sans-serif",direction:"rtl",position:"relative",overflow:"hidden"}}>
      <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
      <style>{`*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}body{margin:0;background:#0D0D14}input[type=range]{-webkit-appearance:none;height:4px;border-radius:99px}input[type=date]{color-scheme:dark}::-webkit-scrollbar{display:none}@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}`}</style>

      <div style={{paddingTop:0}}>{SCREENS[tab]}</div>

      {/* Bottom tab bar */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:DARK.tabBar,borderTop:`1px solid ${DARK.border}`,display:"flex",zIndex:100,paddingBottom:"env(safe-area-inset-bottom,10px)"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,background:"none",border:"none",padding:"9px 0 5px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,position:"relative"}}>
            {t.id==="email"&&emails.filter(e=>e.unread).length>0&&(
              <div style={{position:"absolute",top:6,right:"50%",marginRight:-18,width:16,height:16,borderRadius:99,background:"#EF4444",fontSize:9,fontWeight:800,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>{emails.filter(e=>e.unread).length}</div>
            )}
            <span style={{fontSize:18,filter:tab===t.id?"none":"grayscale(1) opacity(0.4)",transition:"filter .2s"}}>{t.icon}</span>
            <span style={{fontSize:10,fontWeight:700,color:tab===t.id?DARK.accent:DARK.muted,transition:"color .2s"}}>{t.label}</span>
            {tab===t.id&&<div style={{width:4,height:4,borderRadius:99,background:DARK.accent,marginTop:1}}/>}
          </button>
        ))}
      </div>

      {/* Storage indicator */}
      <div style={{position:"fixed",top:10,left:16,zIndex:50,display:"flex",alignItems:"center",gap:5,opacity:0.7}}>
        <div style={{width:6,height:6,borderRadius:99,background:storageReady?"#22C55E":"#EF4444"}}/>
        <span style={{fontSize:9,color:DARK.muted}}>{storageReady?"נשמר":"זמני"}</span>
      </div>

      {renderSheet()}

      {toast&&(
        <div style={{position:"fixed",top:24,left:"50%",transform:"translateX(-50%)",background:toast.type==="success"?"#22C55E":DARK.danger,color:"#fff",borderRadius:12,padding:"10px 20px",fontWeight:700,fontSize:14,zIndex:300,whiteSpace:"nowrap",boxShadow:"0 4px 20px #00000066"}}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
