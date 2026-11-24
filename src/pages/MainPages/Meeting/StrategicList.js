// ─────────────────────────────────────────────
//  StrategicList.jsx  —  Strategic Meeting Schedule
//  Same design as TacticalList + Top Performer btn
// ─────────────────────────────────────────────

import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../../services/ApiService";
import { getToken } from "../../../services/useLocalStorage";
import {
  fetchallStrategicmeeting, generateStrategicMeeting, getStrategicDates,
} from "../../../config/config";
import { MeetingRoute } from "../../../config/RouteConfig";
import AddTacticalMeetingModal from "./Components/AddTacticalMeetingModal";
import { FileUrl } from "../../../config/file_url";
import toast from "react-hot-toast";


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
  @keyframes slFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .sl-fade { animation:slFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes slSpin { to{transform:rotate(360deg)} }
  .sl-spinner { width:28px;height:28px;border-radius:50%;border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};animation:slSpin 0.8s linear infinite; }

  /* ── Timeline tiles ── */
  .sl-timeline { display:flex;gap:8px;overflow-x:auto;padding:4px 2px 12px;scrollbar-width:none; }
  .sl-timeline::-webkit-scrollbar { display:none; }
  .sl-tile {
    flex-shrink:0;width:72px;border-radius:14px;padding:10px 6px;
    border:2px solid ${THEME.border};background:#fff;cursor:pointer;text-align:center;
    transition:all 0.18s;display:flex;flex-direction:column;align-items:center;gap:2px;
  }
  .sl-tile:hover  { border-color:${THEME.brand};background:${THEME.brandLight}; }
  .sl-tile.active { border-color:${THEME.brand};background:${THEME.brandLight};box-shadow:0 4px 14px ${THEME.brand}33; }
  .sl-tile input  { display:none; }
  .sl-tile-month { font-size:10px;font-weight:700;color:${THEME.textMuted};text-transform:uppercase;letter-spacing:0.07em; }
  .sl-tile-day   { font-size:22px;font-weight:800;color:${THEME.text};font-family:'Sora',sans-serif;line-height:1; }
  .sl-tile-year  { font-size:9px;color:${THEME.textMuted}; }
  .sl-tile.active .sl-tile-day { color:${THEME.brand}; }
  .sl-pill { font-size:9px;font-weight:700;padding:2px 7px;border-radius:20px;margin-top:4px;white-space:nowrap; }
  .sl-pill.today    { background:${THEME.brandLight};color:${THEME.brand};border:1px solid #D4C4A0; }
  .sl-pill.done     { background:#F6FFED;color:#389E0D;border:1px solid #B7EB8F; }
  .sl-pill.upcoming { background:#F0F5FF;color:#2F54EB;border:1px solid #ADC6FF; }

  /* ── Progress bar ── */
  .sl-progress-track { width:100%;height:7px;border-radius:10px;background:#F0EBE0;overflow:hidden; }
  .sl-progress-fill  { height:100%;border-radius:10px;background:linear-gradient(90deg,${THEME.brand},${THEME.brandMid});transition:width 0.5s ease; }

  /* ── Buttons ── */
  .sl-gen-btn {
    padding:9px 20px;border-radius:10px;border:none;
    background:${THEME.brand};color:#fff;font-size:13px;font-weight:700;
    cursor:pointer;font-family:'Sora',sans-serif;transition:all 0.18s;
    display:inline-flex;align-items:center;gap:7px;
    box-shadow:0 2px 8px ${THEME.brand}44;white-space:nowrap;
  }
  .sl-gen-btn:hover:not(:disabled) { background:${THEME.brandDark}; }
  .sl-gen-btn:disabled { background:#C4C4C4;box-shadow:none;cursor:not-allowed; }

  .sl-outline-btn {
    padding:9px 18px;border-radius:10px;
    border:1.5px solid ${THEME.border};background:#fff;
    color:${THEME.brand};font-size:13px;font-weight:600;cursor:pointer;
    font-family:'DM Sans',sans-serif;transition:all 0.18s;white-space:nowrap;
    display:inline-flex;align-items:center;gap:6px;
  }
  .sl-outline-btn:hover { background:${THEME.brandLight};border-color:${THEME.brand}; }

  /* ── Dept card ── */
  .sl-dept-card {
    background:#fff;border:1.5px solid ${THEME.border};border-radius:16px;
    padding:18px;cursor:pointer;transition:all 0.2s;
    box-shadow:0 2px 10px rgba(136,117,73,0.06);
    display:flex;flex-direction:column;gap:10px;height:100%;
  }
  .sl-dept-card:hover { border-color:${THEME.brand};box-shadow:0 6px 24px rgba(136,117,73,0.14);transform:translateY(-2px); }

  .sl-avatar-stack { display:flex;align-items:center; }
  .sl-avatar { width:32px;height:32px;border-radius:50%;border:2.5px solid #fff;object-fit:cover;margin-left:-8px;box-shadow:0 1px 4px rgba(0,0,0,0.12);flex-shrink:0; }
  .sl-avatar:first-child { margin-left:0; }
  .sl-arrow-btn { width:32px;height:32px;border-radius:50%;border:none;flex-shrink:0;background:${THEME.brand};cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s; }
  .sl-arrow-btn:hover { background:${THEME.brandDark}; }
  .sl-dept-row { display:flex;justify-content:space-between;align-items:center;font-size:12px;color:${THEME.textMuted};padding:4px 0;border-bottom:1px dashed ${THEME.border}; }
  .sl-dept-row:last-child { border-bottom:none; }

  ::-webkit-scrollbar { width:5px;height:5px; }
  ::-webkit-scrollbar-track { background:${THEME.brandLight}; }
  ::-webkit-scrollbar-thumb { background:${THEME.brandMid};border-radius:10px; }
`;

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
function fmtDate(dateStr) {
  const d   = new Date(dateStr);
  const day = String(d.getDate()).padStart(2,"0");
  const mon = d.toLocaleString("default",{month:"short"});
  const yr  = d.getFullYear();
  const iso = `${yr}-${String(d.getMonth()+1).padStart(2,"0")}-${day}`;
  return {day, month:mon, year:yr, iso};
}

function tilePill(dateStr) {
  const d = new Date(dateStr); d.setHours(0,0,0,0);
  const t = new Date();         t.setHours(0,0,0,0);
  if (d.getTime()===t.getTime()) return "today";
  return d < t ? "done" : "upcoming";
}

// ─────────────────────────────────────────────
//  STAT CARD
// ─────────────────────────────────────────────
function StatCard({ icon, label, value, sub, borderColor, pct }) {
  return (
    <div style={{ background:"#fff", border:`1px solid ${THEME.border}`, borderTop:`3px solid ${borderColor||THEME.brand}`, borderRadius:14, padding:18, boxShadow:"0 2px 10px rgba(136,117,73,0.06)", display:"flex", flexDirection:"column", gap:8 }}>
      <div style={{ fontSize:22 }}>{icon}</div>
      <div>
        <p style={{ margin:0, fontSize:22, fontWeight:800, color:THEME.text, fontFamily:"'Sora',sans-serif", lineHeight:1 }}>
          {value ?? "—"}{sub && <span style={{ fontSize:13, fontWeight:400, color:THEME.textMuted, marginLeft:4 }}>{sub}</span>}
        </p>
        <p style={{ margin:"4px 0 0", fontSize:12, color:THEME.textMuted }}>{label}</p>
      </div>
      {pct !== undefined && (
        <div className="sl-progress-track">
          <div className="sl-progress-fill" style={{ width:`${Math.min(pct,100)}%` }} />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
//  DEPT CARD  (memo)
// ─────────────────────────────────────────────
const DeptCard = memo(({ meeting, onView }) => {
  const pictures = meeting.participants_pictures
    ? meeting.participants_pictures.split(",").filter(Boolean) : [];
  const pct = meeting.completed_percentage || 0;
  return (
    <div className="sl-dept-card" onClick={() => onView()}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div className="sl-avatar-stack">
          {(pictures.length > 0 ? pictures : [null]).slice(0,5).map((pic,i) => (
            <img key={i} className="sl-avatar"
              src={pic ? `${FileUrl}/${pic}` : `${FileUrl}/img/profile.jpeg`}
              alt="participant"
              onError={(e)=>{e.target.onerror=null;e.target.src=`${FileUrl}/img/profile.jpeg`;}} />
          ))}
          {pictures.length > 5 && (
            <div style={{ width:32, height:32, borderRadius:"50%", border:"2.5px solid #fff", background:THEME.brandLight, marginLeft:-8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:THEME.brand, flexShrink:0 }}>
              +{pictures.length - 5}
            </div>
          )}
        </div>
        <button className="sl-arrow-btn" onClick={(e)=>{e.stopPropagation();onView();}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>
      <div>
        <p style={{ margin:"0 0 3px", fontSize:15, fontWeight:800, color:THEME.text, fontFamily:"'Sora',sans-serif" }}>{meeting.department_name}</p>
        <p style={{ margin:0, fontSize:12, color:THEME.textMuted }}>
          Facilitator: <span style={{ fontWeight:600, color:THEME.brandDark }}>{meeting.facilitator_first_name} {meeting.facilitator_last_name}</span>
        </p>
      </div>
      <div style={{ borderRadius:10, background:THEME.bg, padding:"10px 12px" }}>
        <div className="sl-dept-row"><span>Tasks</span><span style={{ fontWeight:700, color:THEME.text }}>{meeting.completed_tasks}/{meeting.total_tasks}</span></div>
        <div className="sl-dept-row"><span>On-Time</span><span style={{ fontWeight:700, color:"#389E0D" }}>{meeting.on_time_percentage}%</span></div>
      </div>
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
          <span style={{ fontSize:11, fontWeight:700, color:THEME.textMuted, textTransform:"uppercase", letterSpacing:"0.06em" }}>Completion</span>
          <span style={{ fontSize:13, fontWeight:800, color:THEME.brand, fontFamily:"'Sora',sans-serif" }}>{pct}%</span>
        </div>
        <div className="sl-progress-track">
          <div className="sl-progress-fill" style={{ width:`${pct}%` }} />
        </div>
      </div>
    </div>
  );
});


// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
function StrategicList() {
  const navigate = useNavigate();
  const header   = { Authorization:`Bearer ${getToken()}`, "Content-Type":"application/json" };

  const [showModal,      setShowModal]      = useState(false);
  const [loading,        setLoading]        = useState(false);
  const [generating,     setGenerating]     = useState(false);
  const [data,           setData]           = useState([]);
  const [strategicDates, setStrategicDates] = useState([]);
  const [selectedDate,   setSelectedDate]   = useState("");
  const [meetingData,    setMeetingData]    = useState({});

  const handleView = useCallback(() => navigate(`/${MeetingRoute.strategicview}`), [navigate]);

  const fetchdate = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService(null, 0, header, getStrategicDates.method, getStrategicDates.url);
      if (!res.data.error) {
        const dates = (res.data.data||[]).map((p)=>p?.date||p).filter(Boolean);
        setStrategicDates(dates);
        if (!selectedDate && dates.length > 0) setSelectedDate(fmtDate(dates[0]).iso);
      }
    } catch(e){console.error(e);}
    finally{setLoading(false);}
  }, []);

  const fetchdata = useCallback(async () => {
    if (!selectedDate) return;
    setLoading(true);
    try {
      const url = `${fetchallStrategicmeeting.url}?date=${selectedDate}`;
      const res = await ApiService(null, 0, header, fetchallStrategicmeeting.method, url);
      if (!res.data.error) {
        setData(res.data.data || []);
        setMeetingData(res.data.aggregatedStats || {});
      }
    } catch(e){console.error(e);}
    finally{setLoading(false);}
  }, [selectedDate]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await ApiService(null, 0, header, generateStrategicMeeting.method, generateStrategicMeeting.url);
      if (!res.data.error) { toast.success(res.data.message || "Meeting generated"); fetchdate(); }
      else toast.error(res.data.message);
    } catch(e){console.error(e);}
    finally{setGenerating(false);}
  };

  useEffect(() => { fetchdate(); }, []);
  useEffect(() => { if (selectedDate) fetchdata(); }, [selectedDate]);

  const displayedMeetings = useMemo(() => {
    const acc = {};
    data.forEach((m)=>{ const {iso}=fmtDate(m.date); if(!acc[iso])acc[iso]=[]; acc[iso].push(m); });
    if (selectedDate && acc[selectedDate]) return acc[selectedDate];
    return Object.values(acc).flat();
  }, [data, selectedDate]);

  const taskPct = meetingData.total_tasks > 0
    ? Math.round((meetingData.completed_tasks / meetingData.total_tasks) * 100) : 0;

  return (
    <>
      <style>{CSS}</style>

      <div style={{ minHeight:"100vh", background:THEME.bg, fontFamily:"'DM Sans',sans-serif", padding:"28px 24px" }}>

        {/* ── Page header ── */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:4, height:26, borderRadius:3, background:`linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
            <div>
              <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:THEME.text, fontFamily:"'Sora',sans-serif", letterSpacing:"-0.3px" }}>
                Monthly Review Meeting Schedule
              </h1>
              <p style={{ margin:"2px 0 0", fontSize:12, color:THEME.textMuted }}>
                Meetings occur every 45 days — select a date to view detailed performance.
              </p>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
            <button className="sl-outline-btn" onClick={() => navigate(`/${MeetingRoute.topperformer}`)}>
              🏆 Top Performer
            </button>
            <button className="sl-gen-btn" onClick={handleGenerate} disabled={generating || loading}>
              {generating ? (
                <>
                  <span style={{ width:14, height:14, borderRadius:"50%", border:"2px solid #ffffff88", borderTopColor:"#fff", display:"inline-block", animation:"slSpin 0.7s linear infinite" }} />
                  Generating…
                </>
              ) : "⚡ Generate Meeting"}
            </button>
          </div>
        </div>

        {/* ── Meeting Timeline ── */}
        <div style={{ background:"#fff", border:`1px solid ${THEME.border}`, borderRadius:14, padding:"18px 20px", marginBottom:20, boxShadow:"0 2px 8px rgba(136,117,73,0.06)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
            <div style={{ width:3, height:14, borderRadius:2, background:`linear-gradient(180deg,${THEME.brand},${THEME.brandMid})` }} />
            <h2 style={{ margin:0, fontSize:13, fontWeight:700, color:THEME.brand, textTransform:"uppercase", letterSpacing:"0.07em", fontFamily:"'Sora',sans-serif" }}>
              Meeting Timeline
            </h2>
          </div>
          {strategicDates.length === 0 ? (
            <p style={{ color:THEME.textLight, fontSize:13, margin:0 }}>No scheduled meetings found.</p>
          ) : (
            <div className="sl-timeline">
              {strategicDates.map((dt) => {
                const {day,month,year,iso} = fmtDate(dt);
                const pill = tilePill(dt);
                return (
                  <label key={iso} className={`sl-tile${selectedDate===iso?" active":""}`}
                    onClick={() => setSelectedDate(iso)}>
                    <input type="radio" name="sl-meeting" value={iso}
                      checked={selectedDate===iso} onChange={() => setSelectedDate(iso)} />
                    <span className="sl-tile-month">{month}</span>
                    <span className="sl-tile-day">{day}</span>
                    <span className="sl-tile-year">{year}</span>
                    <span className={`sl-pill ${pill}`}>
                      {pill==="today"?"Today":pill==="done"?"Done":"Upcoming"}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Stats row ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px,1fr))", gap:14, marginBottom:24 }}>
          <StatCard icon="👥" label="Participants"   value={10}                                           borderColor={THEME.brand} />
          <StatCard icon="✅" label="Avg Completion" value={`${meetingData.completed_percentage??"—"}%`}  borderColor="#389E0D" />
          <StatCard icon="⏱" label="On-Time Rate"   value={`${meetingData.on_time_rate_percentage??"—"}%`} borderColor="#389E0D" pct={meetingData.on_time_rate_percentage} />
          <StatCard icon="📋" label="Tasks Done"
            value={meetingData.completed_tasks ?? "—"}
            sub={`/${meetingData.total_tasks ?? "—"}`}
            borderColor="#D46B08" pct={taskPct} />
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"60px 0", gap:16 }}>
            <div className="sl-spinner" />
            <p style={{ color:THEME.textLight, fontSize:13, margin:0 }}>Loading meetings…</p>
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && displayedMeetings.length === 0 && selectedDate && (
          <div style={{ textAlign:"center", padding:"60px 0" }}>
            <div style={{ fontSize:40, marginBottom:10 }}>📅</div>
            <p style={{ color:THEME.textLight, fontSize:14, margin:0 }}>No meetings found for this date.</p>
          </div>
        )}

        {/* ── Dept cards ── */}
        {!loading && displayedMeetings.length > 0 && (
          <div className="sl-fade">
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
              <div style={{ width:3, height:14, borderRadius:2, background:`linear-gradient(180deg,${THEME.brand},${THEME.brandMid})` }} />
              <h2 style={{ margin:0, fontSize:14, fontWeight:800, color:THEME.text, fontFamily:"'Sora',sans-serif" }}>Departments</h2>
              <span style={{ padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:700, background:THEME.brandLight, color:THEME.brandDark, border:`1px solid #D4C4A0` }}>
                {displayedMeetings.length} meeting{displayedMeetings.length!==1?"s":""}
              </span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px,1fr))", gap:16 }}>
              {displayedMeetings.map((meeting,idx) => (
                <DeptCard key={idx} meeting={meeting} onView={handleView} />
              ))}
            </div>
          </div>
        )}
      </div>

      <AddTacticalMeetingModal show={showModal} handleClose={() => setShowModal(false)} />
    </>
  );
}

export default StrategicList;