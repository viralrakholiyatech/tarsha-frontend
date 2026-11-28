// ─────────────────────────────────────────────
//  TacticalView.jsx  —  Tactical Meeting View
//  Brand design — removes Bootstrap Accordion + FontAwesome + ProgressBar
// ─────────────────────────────────────────────

import React, { useEffect, useState, useCallback, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchTacticalParticipantsbyid, getdepartmentshowbyuserid,
  gettotaldepartment, getTacticalDates,
} from "../../../config/config";
import ApiService from "../../../services/ApiService";
import { getToken, isAdmin, getUserId, ishod } from "../../../services/useLocalStorage";
import { MeetingRoute } from "../../../config/RouteConfig";
import { FileUrl } from "../../../config/file_url";
import TacticalModal from "./Components/TacticalModal";
import TaskViewModal from "./Components/TaskViewModal";


// ─────────────────────────────────────────────
//  🎨  THEME
// ─────────────────────────────────────────────
const THEME = {
  brand:      "#887549",
  brandLight: "#F5F0E8",
  brandMid:   "#C4A97D",
  brandDark:  "#5C4E32",
  bg:         "#F8F5F0",
  border:     "#EDE5D5",
  text:       "#1A1A2E",
  textMuted:  "#ADADAD",
  textLight:  "#BDBDBD",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing:border-box; }
  @keyframes tvFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .tv-fade { animation:tvFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes tvSpin { to{transform:rotate(360deg)} }
  .tv-spinner { width:28px;height:28px;border-radius:50%;border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};animation:tvSpin 0.8s linear infinite; }

  /* ── Timeline ── */
  .tv-timeline { display:flex;gap:8px;overflow-x:auto;padding:4px 2px 12px;scrollbar-width:none; }
  .tv-timeline::-webkit-scrollbar { display:none; }
  .tv-tile {
    flex-shrink:0;width:72px;border-radius:14px;padding:10px 6px;
    border:2px solid ${THEME.border};background:#fff;cursor:pointer;text-align:center;
    transition:all 0.18s;display:flex;flex-direction:column;align-items:center;gap:2px;
  }
  .tv-tile:hover  { border-color:${THEME.brand};background:${THEME.brandLight}; }
  .tv-tile.active { border-color:${THEME.brand};background:${THEME.brandLight};box-shadow:0 4px 14px ${THEME.brand}33; }
  .tv-tile input  { display:none; }
  .tv-tile-month  { font-size:10px;font-weight:700;color:${THEME.textMuted};text-transform:uppercase;letter-spacing:0.07em; }
  .tv-tile-day    { font-size:22px;font-weight:800;color:${THEME.text};font-family:'Sora',sans-serif;line-height:1; }
  .tv-tile-year   { font-size:9px;color:${THEME.textMuted}; }
  .tv-tile.active .tv-tile-day { color:${THEME.brand}; }
  .tv-pill { font-size:9px;font-weight:700;padding:2px 7px;border-radius:20px;margin-top:4px;white-space:nowrap; }
  .tv-pill.today    { background:${THEME.brandLight};color:${THEME.brand};border:1px solid #D4C4A0; }
  .tv-pill.done     { background:#F6FFED;color:#389E0D;border:1px solid #B7EB8F; }
  .tv-pill.upcoming { background:#F0F5FF;color:#2F54EB;border:1px solid #ADC6FF; }

  /* ── Dept tabs ── */
  .tv-tabs { display:flex;gap:6px;flex-wrap:nowrap;overflow-x:auto;padding:0;list-style:none;margin:0;scrollbar-width:none; }
  .tv-tabs::-webkit-scrollbar { display:none; }
  .tv-tab {
    padding:8px 16px;border-radius:20px;cursor:pointer;white-space:nowrap;
    font-size:13px;font-weight:600;border:1.5px solid transparent;
    background:transparent;color:#595959;transition:all 0.18s;font-family:'DM Sans',sans-serif;
  }
  .tv-tab:hover  { background:${THEME.brandLight};color:${THEME.brand}; }
  .tv-tab.active { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand};font-weight:700; }

  /* ── Progress bar ── */
  .tv-prog-track { width:100%;height:6px;border-radius:10px;background:#EDE5D5;overflow:hidden; }
  .tv-prog-fill  { height:100%;border-radius:10px;background:linear-gradient(90deg,${THEME.brand},${THEME.brandMid});transition:width 0.4s ease; }

  /* ── Member card ── */
  .tv-member-card { background:#fff;border:1.5px solid ${THEME.border};border-radius:14px;margin-bottom:12px;overflow:hidden;box-shadow:0 2px 10px rgba(136,117,73,0.06);transition:border-color 0.2s; }
  .tv-member-card:hover { border-color:${THEME.brandMid}; }
  .tv-member-header { display:flex;align-items:center;justify-content:space-between;padding:14px 18px;cursor:pointer;background:#FDFAF5;border-bottom:1px solid transparent;transition:all 0.15s;gap:12px; }
  .tv-member-header.open { border-bottom-color:${THEME.border}; }
  .tv-member-header:hover { background:${THEME.brandLight}; }

  /* ── Note boxes ── */
  .tv-note { border-radius:10px;padding:12px 14px;border:1px solid ${THEME.border};background:${THEME.bg}; }
  .tv-note-label { font-size:10px;font-weight:700;color:${THEME.textMuted};text-transform:uppercase;letter-spacing:0.07em;margin-bottom:6px; }

  /* ── Metric tile ── */
  .tv-metric { flex:1;text-align:center;padding:12px 8px;border-radius:10px;background:#fff;border:1.5px solid ${THEME.border};min-width:80px; }
  .tv-metric.click { cursor:pointer; }
  .tv-metric.click:hover { border-color:${THEME.brand};background:${THEME.brandLight}; }

  /* ── Icon btn ── */
  .tv-icon-btn { width:30px;height:30px;border-radius:8px;border:1.5px solid ${THEME.border};background:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all 0.15s; }
  .tv-icon-btn:hover    { background:${THEME.brandLight};border-color:${THEME.brand}; }
  .tv-icon-btn:disabled { opacity:0.35;cursor:not-allowed; }

  ::-webkit-scrollbar { width:5px;height:5px; }
  ::-webkit-scrollbar-track { background:${THEME.brandLight}; }
  ::-webkit-scrollbar-thumb { background:${THEME.brandMid};border-radius:10px; }
`;

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
const ALL_TABS = [
  { id:"5", label:"Sales"        },
  { id:"1", label:"Approval"     },
  { id:"2", label:"Architecture" },
  { id:"3", label:"Interior"     },
  { id:"4", label:"Operation"    },
  { id:"6", label:"Accounts"     },
];

function fmtDate(dateStr) {
  const d   = new Date(dateStr);
  const day = String(d.getDate()).padStart(2,"0");
  const mon = d.toLocaleString("default",{month:"short"});
  const yr  = d.getFullYear();
  const iso = `${yr}-${String(d.getMonth()+1).padStart(2,"0")}-${day}`;
  return {day, month:mon, year:yr, iso};
}

function tilePill(dateStr) {
  const d  = new Date(dateStr); d.setHours(0,0,0,0);
  const t  = new Date();         t.setHours(0,0,0,0);
  if (d.getTime()===t.getTime()) return "today";
  return d<t ? "done" : "upcoming";
}


// ─────────────────────────────────────────────
//  MEMBER CARD
// ─────────────────────────────────────────────
const MemberCard = memo(({ item, onEdit, onTaskModal, onView }) => {
  const [open, setOpen] = useState(false);
  const pct = parseFloat(item.completion_percentage) || 0;

  const filled = !!(item.key_highlight || item.key_action || item.what_missing ||
    item.what_learn || item.what_different || item.what_done_when);

  const canEdit = isAdmin()
    || (!isAdmin() && item.user_id===getUserId() && !filled)
    || (!isAdmin() && ishod() && item.user_id!==getUserId() && !filled);

  const canView = isAdmin() || (!isAdmin() && item.user_id===getUserId());

  return (
    <div className="tv-member-card tv-fade">
      {/* Header */}
      <div className={`tv-member-header${open?" open":""}`} onClick={() => setOpen(v=>!v)}>
        <div style={{ display:"flex", alignItems:"center", gap:12, flex:1, minWidth:0 }}>
          <img src={`${FileUrl}/${item.profile_picture}`} alt="Member"
            onError={(e)=>{e.target.onerror=null;e.target.src = "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%20width%3D%2264%22%20height%3D%2264%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2232%22%20r%3D%2232%22%20fill%3D%22%23d1d5db%22%2F%3E%3Cpath%20d%3D%22M32%2014a12%2012%200%201%200%200%2024%2012%2012%200%200%200%200-24zm0%2028c-13.3%200-24%208.5-24%2019v3h48v-3c0-10.5-10.7-19-24-19z%22%20fill%3D%22%239ca3af%22%2F%3E%3C%2Fsvg%3E";}}
            style={{ width:42,height:42,borderRadius:"50%",objectFit:"cover",border:`2px solid ${THEME.border}`,flexShrink:0 }} />
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ margin:"0 0 5px", fontSize:14, fontWeight:700, color:THEME.text, fontFamily:"'Sora',sans-serif" }}>
              {item.first_name} {item.last_name}
            </p>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:11, color:THEME.textMuted, fontWeight:600 }}>Sales</span>
              <div style={{ flex:1, maxWidth:120 }}>
                <div className="tv-prog-track">
                  <div className="tv-prog-fill" style={{ width:`${Math.min(pct,100)}%` }} />
                </div>
              </div>
              <span style={{ fontSize:11, fontWeight:800, color:THEME.brand }}>{pct}%</span>
            </div>
          </div>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}
          onClick={e => e.stopPropagation()}>
          {canEdit && (
            <button className="tv-icon-btn" title="Edit" onClick={() => onEdit(item.id)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={THEME.brand} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          )}
          {canView && (
            <button className="tv-icon-btn" title="View history" onClick={() => onView(item.user_id)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={THEME.brand} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          )}
          <svg style={{ transition:"transform 0.2s", transform:open?"rotate(180deg)":"rotate(0)", flexShrink:0 }}
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={THEME.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      {/* Body */}
      {open && (
        <div style={{ padding:18 }}>

          {/* Key Highlight + Action */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
            {[
              { label:"🏆 Key Highlight", html:item.key_highlight },
              { label:"⚡ Key Action",    html:item.key_action    },
            ].map((b) => (
              <div key={b.label} className="tv-note">
                <div className="tv-note-label">{b.label}</div>
                <div style={{ fontSize:13, color:THEME.text, lineHeight:1.6 }}
                  dangerouslySetInnerHTML={{ __html: b.html || "<em style='color:#BDBDBD'>Not filled</em>" }} />
              </div>
            ))}
          </div>

          {/* Metric tiles */}
          <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap" }}>
            {[
              { label:"Total Goals", value:item.total_task,                color:THEME.brand,  click:true },
              { label:"Completed",   value:item.total_completed_tasks,    color:"#389E0D" },
              { label:"Pending",     value:item.total_uncompleted_tasks,  color:"#CF1322" },
            ].map((m) => (
              <div key={m.label}
                className={`tv-metric${m.click?" click":""}`}
                onClick={m.click ? ()=>onTaskModal(item.user_id) : undefined}
                style={{ borderTop:`3px solid ${m.color}` }}>
                <p style={{ margin:"0 0 2px", fontSize:10, fontWeight:700, color:THEME.textMuted, textTransform:"uppercase", letterSpacing:"0.06em" }}>{m.label}</p>
                <p style={{ margin:0, fontSize:20, fontWeight:800, color:m.color, fontFamily:"'Sora',sans-serif" }}>{m.value ?? "—"}</p>
              </div>
            ))}
          </div>

          {/* Reflections 3-col */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(380px, 1fr))", gap:10, marginBottom:12 }}>
            {[
              { label:"❓ What was missing?",      html:item.what_missing   },
              { label:"📚 What did you learn?",    html:item.what_learn     },
              { label:"🔄 What will be different?",html:item.what_different },
            ].map((b) => (
              <div key={b.label} className="tv-note">
                <div className="tv-note-label">{b.label}</div>
                <div style={{ fontSize:12, color:THEME.text, lineHeight:1.6 }}
                  dangerouslySetInnerHTML={{ __html: b.html || "<em style='color:#BDBDBD'>Not filled</em>" }} />
              </div>
            ))}
          </div>

          {/* What will get done */}
          <div className="tv-note" style={{ background:"#F0F7FF", borderColor:"#ADC6FF" }}>
            <div className="tv-note-label" style={{ color:"#0050B3" }}>📅 What will get done & by when?</div>
            <div style={{ fontSize:13, color:THEME.text, lineHeight:1.6 }}
              dangerouslySetInnerHTML={{ __html: item.what_done_when || "<em style='color:#BDBDBD'>Not filled</em>" }} />
          </div>
        </div>
      )}
    </div>
  );
});


// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
function TacticalView() {
  const navigate = useNavigate();
  const params   = useParams();
  const header   = { Authorization:`Bearer ${getToken()}`, "Content-Type":"application/json" };

  const [showModal,     setShowModal]    = useState(false);
  const [showTaskModal, setShowTaskModal]= useState(false);
  const [loading,       setLoading]      = useState(false);
  const [data,          setData]         = useState([]);
  const [editId,        setEditId]       = useState("");
  const [selectedDate,  setSelectedDate] = useState("");
  const [tacticalDates, setTacticalDates]= useState([]);
  const [total,         setTotal]        = useState({});
  const [tabs,          setTabs]         = useState(ALL_TABS);
  const [activeTabId,   setActiveTabId]  = useState("");

  const fetchdate = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService(null, 0, header, getTacticalDates.method, getTacticalDates.url);
      if (!res.data.error) {
        const dates = (res.data.data||[]).map((p)=>p?.date||p).filter(Boolean);
        setTacticalDates(dates);
        if (!selectedDate && dates.length>0) setSelectedDate(fmtDate(dates[0]).iso);
      }
    } catch(e){console.error(e);}
    finally{setLoading(false);}
  },[]);

  const fetchdata = useCallback(async () => {
    if (!activeTabId||!selectedDate) return;
    setLoading(true);
    try {
      const res = await ApiService(null, `${selectedDate}/${encodeURIComponent(activeTabId)}`,
        header, fetchTacticalParticipantsbyid.method, fetchTacticalParticipantsbyid.url);
      if (!res.data.error) setData(res.data.data||[]);
    } catch(e){console.error(e);}
    finally{setLoading(false);}
  },[activeTabId,selectedDate]);

  const fetchdepartment = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService(null,0,header,getdepartmentshowbyuserid.method,getdepartmentshowbyuserid.url);
      if (!res.data.error) {
        if (isAdmin()){setTabs(ALL_TABS);setActiveTabId(ALL_TABS[0].id);}
        else {
          const ids=((res.data.data||[])).map((d)=>String(d.id));
          const f=ALL_TABS.filter((t)=>ids.includes(t.id));
          setTabs(f);
          if(f.length>0) setActiveTabId(f[0].id);
        }
      }
    } catch(e){console.error(e);}
    finally{setLoading(false);}
  },[]);

  const fetchTotaldepartment = useCallback(async()=>{
    try {
      const res=await ApiService(null,0,header,gettotaldepartment.method,gettotaldepartment.url);
      if(!res.data.error) setTotal(res.data.data||{});
    } catch(e){console.error(e);}
  },[]);

  useEffect(()=>{fetchdepartment();fetchdate();fetchTotaldepartment();},[]);
  useEffect(()=>{if(activeTabId&&selectedDate)fetchdata();},[selectedDate,activeTabId]);

  return (
    <>
      <style>{CSS}</style>

      <div style={{ minHeight:"100vh",   fontFamily:"'DM Sans',sans-serif", padding:"28px 24px" }}>

        {/* Header */}
        <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:24 }}>
          <div style={{ width:4,height:26,borderRadius:3,background:`linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
          <h1 style={{ margin:0,fontSize:22,fontWeight:800,color:THEME.text,fontFamily:"'Sora',sans-serif",letterSpacing:"-0.3px" }}>
            Tactical Meeting
          </h1>
        </div>

        {/* Team stats bar */}
        {(total.total_employees||total.departments) && (
          <div style={{ display:"flex",gap:12,marginBottom:20,flexWrap:"wrap",overflowX:"auto" }}>
            <div style={{ background:"#fff",border:`1px solid ${THEME.border}`,borderTop:`3px solid ${THEME.brand}`,borderRadius:10,padding:"10px 18px",boxShadow:"0 2px 8px rgba(136,117,73,0.06)",minWidth:110 }}>
              <p style={{ margin:0,fontSize:10,fontWeight:700,color:THEME.textMuted,textTransform:"uppercase",letterSpacing:"0.07em" }}>Total Team</p>
              <p style={{ margin:"3px 0 0",fontSize:20,fontWeight:800,color:THEME.brand,fontFamily:"'Sora',sans-serif" }}>{total.total_employees??"—"}</p>
            </div>
            {(total.departments||[]).map((d)=>(
              <div key={d.name} style={{ background:"#fff",border:`1px solid ${THEME.border}`,borderTop:`3px solid ${THEME.brandMid}`,borderRadius:10,padding:"10px 18px",boxShadow:"0 2px 8px rgba(136,117,73,0.06)",minWidth:110 }}>
                <p style={{ margin:0,fontSize:10,fontWeight:700,color:THEME.textMuted,textTransform:"uppercase",letterSpacing:"0.07em" }}>{d.name}</p>
                <p style={{ margin:"3px 0 0",fontSize:20,fontWeight:800,color:THEME.brandDark,fontFamily:"'Sora',sans-serif" }}>{d.employee_count}</p>
              </div>
            ))}
          </div>
        )}

        {/* Timeline */}
        <div style={{ background:"#fff",border:`1px solid ${THEME.border}`,borderRadius:14,padding:"18px 20px",marginBottom:16,boxShadow:"0 2px 8px rgba(136,117,73,0.06)" }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
            <div style={{ width:3,height:14,borderRadius:2,background:`linear-gradient(180deg,${THEME.brand},${THEME.brandMid})` }} />
            <h2 style={{ margin:0,fontSize:13,fontWeight:700,color:THEME.brand,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:"'Sora',sans-serif" }}>
              Meeting Timeline
            </h2>
          </div>
          {tacticalDates.length===0?(
            <p style={{ color:THEME.textLight,fontSize:13,margin:0 }}>No scheduled meetings.</p>
          ):(
            <div className="tv-timeline">
              {tacticalDates.map((dt)=>{
                const {day,month,year,iso}=fmtDate(dt);
                const pill=tilePill(dt);
                return (
                  <label key={iso} className={`tv-tile${selectedDate===iso?" active":""}`}
                    onClick={()=>setSelectedDate(iso)}>
                    <input type="radio" name="tv-meeting" value={iso}
                      checked={selectedDate===iso} onChange={()=>setSelectedDate(iso)} />
                    <span className="tv-tile-month">{month}</span>
                    <span className="tv-tile-day">{day}</span>
                    <span className="tv-tile-year">{year}</span>
                    <span className={`tv-pill ${pill}`}>
                      {pill==="today"?"Today":pill==="done"?"Done":"Upcoming"}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Dept tabs */}
        <div style={{ background:"#fff",border:`1px solid ${THEME.border}`,borderRadius:14,padding:"12px 16px",marginBottom:20,boxShadow:"0 2px 8px rgba(136,117,73,0.06)" }}>
          <div className="tv-tabs">
            {tabs.map((tab)=>(
              <button key={tab.id}
                className={`tv-tab${String(activeTabId)===String(tab.id)?" active":""}`}
                onClick={()=>setActiveTabId(tab.id)}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading&&(
          <div style={{ display:"flex",flexDirection:"column",alignItems:"center",padding:"60px 0",gap:16 }}>
            <div className="tv-spinner" />
            <p style={{ color:THEME.textLight,fontSize:13,margin:0 }}>Loading participants…</p>
          </div>
        )}

        {/* Empty */}
        {!loading&&data.length===0&&(
          <div style={{ textAlign:"center",padding:"60px 0" }}>
            <div style={{ fontSize:40,marginBottom:10 }}>👥</div>
            <p style={{ color:THEME.textLight,fontSize:14,margin:0 }}>No participants found.</p>
          </div>
        )}

        {/* Member cards */}
        {!loading&&data.length>0&&(
          <div>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:14 }}>
              <div style={{ width:3,height:14,borderRadius:2,background:`linear-gradient(180deg,${THEME.brand},${THEME.brandMid})` }} />
              <h2 style={{ margin:0,fontSize:14,fontWeight:800,color:THEME.text,fontFamily:"'Sora',sans-serif" }}>Participants</h2>
              <span style={{ padding:"2px 10px",borderRadius:20,fontSize:11,fontWeight:700,background:THEME.brandLight,color:THEME.brandDark,border:`1px solid #D4C4A0` }}>
                {data.length} member{data.length!==1?"s":""}
              </span>
            </div>
            {data.map((item)=>(
              <MemberCard key={item.id} item={item}
                onEdit={(id)=>{setEditId(id);setShowModal(true);}}
                onTaskModal={(uid)=>{setEditId(uid);setShowTaskModal(true);}}
                onView={(uid)=>navigate(`/${MeetingRoute.tacticalperformancelist}/${uid}`)}
              />
            ))}
          </div>
        )}
      </div>

      <TacticalModal show={showModal} handleClose={()=>setShowModal(false)} id={editId} meetingId={params.id} />
      <TaskViewModal show={showTaskModal} handleClose={()=>setShowTaskModal(false)} id={editId} />
    </>
  );
}

export default TacticalView;