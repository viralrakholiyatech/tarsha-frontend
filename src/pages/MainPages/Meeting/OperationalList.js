// ─────────────────────────────────────────────
//  OperationalList.jsx  —  Operational Meetings
//  Brand design system consistent with app
// ─────────────────────────────────────────────

import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import OperationalModalAdd from "./Components/OperationalModalAdd";
import OperationalEditModal from "./Components/OperationalEditModal";
import ApiService from "../../../services/ApiService";
import { getToken } from "../../../services/useLocalStorage";
import { fetchalloperationalmeeting, gererateoperatingMeeting } from "../../../config/config";
import { MeetingRoute } from "../../../config/RouteConfig";
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
  @keyframes olFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .ol-fade { animation:olFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes olSpin { to{transform:rotate(360deg)} }
  .ol-spinner {
    width:28px;height:28px;border-radius:50%;
    border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};
    animation:olSpin 0.8s linear infinite;
  }

  /* ── Stat card ── */
  .ol-stat-card {
    background:#fff;border:1.5px solid ${THEME.border};border-radius:14px;
    padding:18px;box-shadow:0 2px 10px rgba(136,117,73,0.06);height:100%;
    display:flex;flex-direction:column;gap:10px;
  }

  /* ── Progress bar ── */
  .ol-progress-track { width:100%;height:7px;border-radius:10px;background:#F0EBE0;overflow:hidden; }
  .ol-progress-fill  { height:100%;border-radius:10px;background:linear-gradient(90deg,${THEME.brand},${THEME.brandMid});transition:width 0.5s ease; }

  /* ── Dept card ── */
  .ol-dept-card {
    background:#fff;border:1.5px solid ${THEME.border};border-radius:16px;
    padding:18px;cursor:pointer;transition:all 0.2s;
    box-shadow:0 2px 10px rgba(136,117,73,0.06);
    display:flex;flex-direction:column;gap:10px;height:100%;
  }
  .ol-dept-card:hover {
    border-color:${THEME.brand};box-shadow:0 6px 24px rgba(136,117,73,0.14);
    transform:translateY(-2px);
  }

  /* ── Avatar stack ── */
  .ol-avatar-stack { display:flex;align-items:center; }
  .ol-avatar {
    width:32px;height:32px;border-radius:50%;border:2.5px solid #fff;
    object-fit:cover;margin-left:-8px;box-shadow:0 1px 4px rgba(0,0,0,0.12);flex-shrink:0;
  }
  .ol-avatar:first-child { margin-left:0; }

  /* ── Arrow button ── */
  .ol-arrow-btn {
    width:32px;height:32px;border-radius:50%;border:none;flex-shrink:0;
    background:${THEME.brand};cursor:pointer;
    display:flex;align-items:center;justify-content:center;transition:all 0.15s;
  }
  .ol-arrow-btn:hover { background:${THEME.brandDark}; }

  /* ── Date input ── */
  .ol-date-input {
    padding:9px 14px;border-radius:10px;border:1.5px solid #E0D5C5;
    font-size:13px;font-family:'DM Sans',sans-serif;color:#1A1A2E;
    outline:none;background:#fff;transition:border-color 0.15s,box-shadow 0.15s;
  }
  .ol-date-input:focus { border-color:${THEME.brand};box-shadow:0 0 0 3px ${THEME.brand}18; }

  /* ── Generate button ── */
  .ol-gen-btn {
    padding:9px 20px;border-radius:10px;border:none;
    background:${THEME.brand};color:#fff;font-size:13px;font-weight:700;
    cursor:pointer;font-family:'Sora',sans-serif;transition:all 0.18s;
    display:inline-flex;align-items:center;gap:7px;
    box-shadow:0 2px 8px ${THEME.brand}44;white-space:nowrap;
  }
  .ol-gen-btn:hover:not(:disabled) { background:${THEME.brandDark}; }
  .ol-gen-btn:disabled { background:#C4C4C4;box-shadow:none;cursor:not-allowed; }

  /* ── Dept row ── */
  .ol-dept-row {
    display:flex;justify-content:space-between;align-items:center;
    font-size:12px;color:${THEME.textMuted};padding:4px 0;
    border-bottom:1px dashed ${THEME.border};
  }
  .ol-dept-row:last-child { border-bottom:none; }

  ::-webkit-scrollbar { width:5px;height:5px; }
  ::-webkit-scrollbar-track { background:${THEME.brandLight}; }
  ::-webkit-scrollbar-thumb { background:${THEME.brandMid};border-radius:10px; }
`;


// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
function fmtDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric", weekday:"long" });
}

// ─────────────────────────────────────────────
//  STAT CARD
// ─────────────────────────────────────────────
function StatCard({ icon, label, value, sub, pill, pillColor, pct, children }) {
  const pillCfg = {
    green:  { bg:"#F6FFED", color:"#389E0D", border:"#B7EB8F" },
    amber:  { bg:"#FFF7E6", color:"#D46B08", border:"#FFD591" },
    red:    { bg:"#FFF1F0", color:"#CF1322", border:"#FFA39E" },
    brand:  { bg:THEME.brandLight, color:THEME.brandDark, border:"#D4C4A0" },
  }[pillColor] || { bg:THEME.brandLight, color:THEME.brandDark, border:"#D4C4A0" };

  return (
    <div className="ol-stat-card">
      {/* Top row */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={{ width:44, height:44, borderRadius:12, background:THEME.brandLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>
          {icon}
        </div>
        {pill && (
          <span style={{ padding:"2px 10px", borderRadius:20, fontSize:10, fontWeight:700, background:pillCfg.bg, color:pillCfg.color, border:`1px solid ${pillCfg.border}` }}>
            {pill}
          </span>
        )}
      </div>

      {/* Value */}
      {value !== undefined && (
        <div>
          <p style={{ margin:0, fontSize:26, fontWeight:800, color:THEME.text, fontFamily:"'Sora',sans-serif", lineHeight:1 }}>
            {value}
            {sub && <span style={{ fontSize:13, fontWeight:400, color:THEME.textMuted, marginLeft:4 }}>{sub}</span>}
          </p>
          <p style={{ margin:"4px 0 0", fontSize:12, color:THEME.textMuted }}>{label}</p>
        </div>
      )}

      {/* Progress bar */}
      {pct !== undefined && (
        <div>
          <div className="ol-progress-track">
            <div className="ol-progress-fill" style={{ width:`${Math.min(pct,100)}%` }} />
          </div>
        </div>
      )}

      {/* Custom children (for blocker list) */}
      {children}
    </div>
  );
}


// ─────────────────────────────────────────────
//  DEPARTMENT CARD  (memo)
// ─────────────────────────────────────────────
const DeptCard = memo(({ meeting, onView }) => {
  const pictures = meeting.participants_pictures
    ? meeting.participants_pictures.split(",").filter(Boolean)
    : [];
  const pct = meeting.prev_on_time_percentage || 0;

  return (
    <div className="ol-dept-card" onClick={() => onView(meeting.id)}>
      {/* Avatars + arrow */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div className="ol-avatar-stack">
          {(pictures.length > 0 ? pictures : [null]).slice(0,5).map((pic, i) => (
            <img key={i} className="ol-avatar"
              src={pic ? `${FileUrl}/${pic}` : "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%20width%3D%2264%22%20height%3D%2264%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2232%22%20r%3D%2232%22%20fill%3D%22%23d1d5db%22%2F%3E%3Cpath%20d%3D%22M32%2014a12%2012%200%201%200%200%2024%2012%2012%200%200%200%200-24zm0%2028c-13.3%200-24%208.5-24%2019v3h48v-3c0-10.5-10.7-19-24-19z%22%20fill%3D%22%239ca3af%22%2F%3E%3C%2Fsvg%3E"}
              alt="participant"
              onError={(e) => { e.target.onerror=null; e.target.src = "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%20width%3D%2264%22%20height%3D%2264%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2232%22%20r%3D%2232%22%20fill%3D%22%23d1d5db%22%2F%3E%3Cpath%20d%3D%22M32%2014a12%2012%200%201%200%200%2024%2012%2012%200%200%200%200-24zm0%2028c-13.3%200-24%208.5-24%2019v3h48v-3c0-10.5-10.7-19-24-19z%22%20fill%3D%22%239ca3af%22%2F%3E%3C%2Fsvg%3E"; }} />
          ))}
          {pictures.length > 5 && (
            <div style={{ width:32, height:32, borderRadius:"50%", border:"2.5px solid #fff", background:THEME.brandLight, marginLeft:-8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:THEME.brand, flexShrink:0 }}>
              +{pictures.length - 5}
            </div>
          )}
        </div>
        <button className="ol-arrow-btn" onClick={(e) => { e.stopPropagation(); onView(meeting.id); }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>

      {/* Dept name */}
      <div>
        <p style={{ margin:"0 0 3px", fontSize:15, fontWeight:800, color:THEME.text, fontFamily:"'Sora',sans-serif" }}>
          {meeting.department_name}
        </p>
        <p style={{ margin:0, fontSize:12, color:THEME.textMuted }}>
          Facilitator: <span style={{ fontWeight:600, color:THEME.brandDark }}>
            {meeting.facilitator_first_name} {meeting.facilitator_last_name}
          </span>
        </p>
      </div>

      {/* Stats rows */}
      <div style={{ borderRadius:10, background:THEME.bg, padding:"10px 12px" }}>
        <div className="ol-dept-row">
          <span>Tasks</span>
          <span style={{ fontWeight:700, color:THEME.text }}>
            {meeting.prev_completed_tasks}/{meeting.prev_total_tasks}
          </span>
        </div>
        <div className="ol-dept-row">
          <span>On-Time</span>
          <span style={{ fontWeight:700, color:"#389E0D" }}>{meeting.prev_on_time_percentage}%</span>
        </div>
        <div className="ol-dept-row">
          <span>Performance</span>
          <span style={{ fontWeight:700, color:"#D46B08" }}>{meeting.team_performance}/5</span>
        </div>
      </div>

      {/* Completion bar */}
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
          <span style={{ fontSize:11, fontWeight:700, color:THEME.textMuted, textTransform:"uppercase", letterSpacing:"0.06em" }}>Completion</span>
          <span style={{ fontSize:13, fontWeight:800, color:THEME.brand, fontFamily:"'Sora',sans-serif" }}>{pct}%</span>
        </div>
        <div className="ol-progress-track">
          <div className="ol-progress-fill" style={{ width:`${pct}%` }} />
        </div>
      </div>
    </div>
  );
});


// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
function OperationalList() {
  const navigate = useNavigate();
  const header   = { Authorization:`Bearer ${getToken()}`, "Content-Type":"application/json" };

  const [showModal,      setShowModal]      = useState(false);
  const [showeditModal,  setShowEditModal]  = useState(false);
  const [editId,         setEditId]         = useState(null);
  const [loading,        setLoading]        = useState(false);
  const [generating,     setGenerating]     = useState(false);
  const [data,           setData]           = useState([]);
  const [meetingData,    setMeetingData]    = useState({});
  const [blocker,        setBlocker]        = useState({});
  const [selectedDate,   setSelectedDate]   = useState(new Date().toLocaleDateString("en-CA"));

  const handleView = useCallback((id) => {
    navigate(`/${MeetingRoute.operationalview}`);
  }, [navigate]);

  const fetchdata = useCallback(async () => {
    setLoading(true);
    try {
      const url = `${fetchalloperationalmeeting.url}?date=${selectedDate}`;
      const res = await ApiService(null, 0, header, fetchalloperationalmeeting.method, url);
      console.log("Fetched meetings:.....", res.data);
      if (!res.data.error) {
        setData(res.data.data || []);
        setMeetingData(res.data.aggregated || {});
        setBlocker(res.data.department_stats || {});
      }

    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [selectedDate]);

  useEffect(() => { fetchdata(); }, [fetchdata]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await ApiService(null, 0, header, gererateoperatingMeeting.method, gererateoperatingMeeting.url);
      if (!res.data.error) { toast.success(res.data.message || "Meeting generated"); fetchdata(); }
      else toast.error(res.data.message);
    } catch (e) { console.error(e); }
    finally { setGenerating(false); }
  };

  // ── Computed stats ─────────────────────────
  const taskPct = useMemo(() => {
    if (!meetingData.total_tasks) return 0;
    return Math.round((meetingData.completed_tasks / meetingData.total_tasks) * 100);
  }, [meetingData]);

  // Group meetings by date (already single date but preserve structure)
  const groupedData = useMemo(() => {
    const acc = {};
    data.forEach((m) => {
      const key = m.date ? String(m.date).split(/[T ]/)[0] : "";
      if (!acc[key]) acc[key] = [];
      acc[key].push(m);
    });
    return Object.entries(acc);
  }, [data]);

  return (
    <>
      <style>{CSS}</style>

      <div style={{ minHeight:"100vh",   fontFamily:"'DM Sans',sans-serif", padding:"28px 24px" }}>

        {/* ── Page header ── */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:4, height:26, borderRadius:3, background:`linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
            <div>
              <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:THEME.text, fontFamily:"'Sora',sans-serif", letterSpacing:"-0.3px" }}>
                 Daily Review Meetings
              </h1>
              <p style={{ margin:"2px 0 0", fontSize:12, color:THEME.textMuted }}>
                Daily execution tracking and performance monitoring
              </p>
            </div>
          </div>
          <button className="ol-gen-btn" onClick={handleGenerate} disabled={generating || loading}>
            {generating ? (
              <>
                <span style={{ width:14, height:14, borderRadius:"50%", border:"2px solid #ffffff88", borderTopColor:"#fff", display:"inline-block", animation:"olSpin 0.7s linear infinite" }} />
                Generating…
              </>
            ) : "⚡ Generate Meeting"}
          </button>
        </div>

        {/* ── Date selector card ── */}
        <div style={{ background:"#fff", border:`1px solid ${THEME.border}`, borderRadius:14, padding:"18px 20px", marginBottom:20, boxShadow:"0 2px 8px rgba(136,117,73,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div>
            <p style={{ margin:"0 0 2px", fontSize:11, fontWeight:700, color:THEME.textMuted, textTransform:"uppercase", letterSpacing:"0.07em" }}>Meeting Date</p>
            <p style={{ margin:0, fontSize:15, fontWeight:700, color:THEME.text, fontFamily:"'Sora',sans-serif" }}>
              {fmtDate(selectedDate)}
            </p>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ padding:"3px 12px", borderRadius:20, fontSize:11, fontWeight:700, background:"#F6FFED", color:"#389E0D", border:"1px solid #B7EB8F" }}>
              ● Active
            </span>
            <input
              type="date"
              className="ol-date-input"
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setData([]); }}
            />
          </div>
        </div>

        {/* ── Stats row ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:16, marginBottom:28 }}>

          <StatCard icon="✅" label="Tasks Completed" pill={`${taskPct}%`} pillColor="green"
            value={`${meetingData.completed_tasks ?? "—"}/${meetingData.total_tasks ?? "—"}`}
            pct={taskPct} />

          <StatCard icon="⏱" label="On-Time Rate" pill={`${meetingData.on_time_rate_percentage ?? 0}%`} pillColor="green"
            value={`${meetingData.on_time_rate_percentage ?? "—"}%`}
            pct={meetingData.on_time_rate_percentage} />

          <StatCard icon="⭐" label="Avg Performance" pill={`${meetingData.avg_performance_out_of_5 ?? 0}/5`} pillColor="amber"
            value={meetingData.avg_performance_out_of_5 ?? "—"}
            sub="/5" />

          {/* Pending tasks by dept */}
          <div className="ol-stat-card">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div style={{ width:44, height:44, borderRadius:12, background:"#FFF1F0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>📋</div>
              <span style={{ padding:"2px 10px", borderRadius:20, fontSize:10, fontWeight:700, background:"#FFF1F0", color:"#CF1322", border:"1px solid #FFA39E" }}>
                Pending
              </span>
            </div>
            <p style={{ margin:"4px 0 0", fontSize:11, fontWeight:700, color:THEME.textMuted, textTransform:"uppercase", letterSpacing:"0.07em" }}>Pending by Dept</p>
            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
              {Object.entries(blocker).length === 0 ? (
                <p style={{ margin:0, fontSize:12, color:THEME.textLight }}>No pending tasks</p>
              ) : Object.entries(blocker).map(([dept, count]) => (
                <div key={dept} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:11, color:THEME.textMuted }}>{dept}</span>
                  <span style={{ fontSize:14, fontWeight:800, color: count > 0 ? "#CF1322" : "#389E0D", fontFamily:"'Sora',sans-serif" }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"60px 0", gap:16 }}>
            <div className="ol-spinner" />
            <p style={{ color:THEME.textLight, fontSize:13, margin:0 }}>Loading meetings…</p>
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && data.length === 0 && (
          <div style={{ textAlign:"center", padding:"60px 0" }}>
            <div style={{ fontSize:40, marginBottom:10 }}>📅</div>
            <p style={{ color:THEME.textLight, fontSize:14, margin:0 }}>No meetings found for this date.</p>
          </div>
        )}

        {/* ── Department cards ── */}
        {!loading && groupedData.length > 0 && (
          <div className="ol-fade">
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
              <div style={{ width:3, height:14, borderRadius:2, background:`linear-gradient(180deg,${THEME.brand},${THEME.brandMid})` }} />
              <h2 style={{ margin:0, fontSize:14, fontWeight:800, color:THEME.text, fontFamily:"'Sora',sans-serif" }}>All Departments</h2>
              <span style={{ padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:700, background:THEME.brandLight, color:THEME.brandDark, border:`1px solid #D4C4A0` }}>
                {data.length} meeting{data.length !== 1 ? "s" : ""}
              </span>
            </div>

            {groupedData.map(([isoDate, meetings]) => (
              <div key={isoDate} style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:16 }}>
                {meetings.map((meeting, idx) => (
                  <DeptCard key={idx} meeting={meeting} onView={handleView} />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <OperationalModalAdd show={showModal} handleClose={() => setShowModal(false)} />
      <OperationalEditModal
        show={showeditModal}
        handleClose={() => { setEditId(null); setShowEditModal(false); }}
        editId={editId}
      />
    </>
  );
}

export default OperationalList;
















