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
              src={pic ? `${FileUrl}/${pic}` : `${FileUrl}/img/profile.jpeg`}
              alt="participant"
              onError={(e) => { e.target.onerror=null; e.target.src=`${FileUrl}/img/profile.jpeg`; }} />
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
                Operational Meetings
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






















// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import OperationalModalAdd from "./Components/OperationalModalAdd";
// import ApiService from "../../../services/ApiService";
// import { getToken } from "../../../services/useLocalStorage";
// import {
//   fetchalloperationalmeeting,
//   gererateoperatingMeeting,
// } from "../../../config/config";
// import OperationalEditModal from "./Components/OperationalEditModal";
// import { MeetingRoute } from "../../../config/RouteConfig";
// import { FileUrl } from "../../../config/file_url";

// function OperationalList() {
//   const navigate = useNavigate();
//   const header = {
//     Authorization: `Bearer ${getToken()}`,
//     ["Content-Type"]: "application/json",
//   };

//   const [showModal, setShowModal] = useState(false);
//   const [showeditModal, setShowEditModal] = useState(false);
//   const [editId, setEditId] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [data, setData] = useState([]);
//   const [meetingData, setMeetingData] = useState([]);
//     const [Blocker, setBlocker] = useState([]);

//   // Add selectedDate state - default to today
//   const [selectedDate, setSelectedDate] = useState(
//     new Date().toISOString().split("T")[0],
//   );

//   const handleShowModal = () => setShowModal(true);
//   const handleCloseModal = () => setShowModal(false);

//   const handleShowEditModal = (id) => {
//     setEditId(id);
//     setShowEditModal(true);
//   };
//   const handleCloseEditModal = () => {
//     setEditId(null);
//     setShowEditModal(false);
//   };

//   const handleView = (id) => {
//     navigate(`/${MeetingRoute.operationalview}`);
//   };

//   // Handle date change
//   const handleDateChange = (e) => {
//     setSelectedDate(e.target.value);
//     setData([]); 
//   };

//   const fetchdata = async () => {
//     try {
//       setLoading(true);
//       const url = `${fetchalloperationalmeeting.url}?date=${selectedDate}`;

//       const res = await ApiService(
//         null,
//         0,
//         header,
//         fetchalloperationalmeeting.method,
//         url,
//       );

//       if (!res.data?.error) {
//         const newMeetings = res?.data?.data || [];
//         setData(newMeetings);
//         setMeetingData(res?.data?.aggregated);
//     setBlocker(res?.data?.department_stats)
//       }
//       setLoading(false);
//     } catch (err) {
//       setLoading(false);
//       console.log(err);
//     }
//   };

//   const handleGenerate = async () => {
//     try {
//       setLoading(true);
//       const res = await ApiService(
//         null,
//         0,
//         header,
//         gererateoperatingMeeting.method,
//         gererateoperatingMeeting.url,
//       );
//       if (!res.data?.error) {
//         toast.success(res.data.message || "Meeting generate successfully");
//         fetchdata();
//       } else {
//         setLoading(false);
//       }
//     } catch (err) {
//       setLoading(false);
//       console.log(err);
//     }
//   };

//   // Fetch data when selectedDate changes
//   useEffect(() => {
//     fetchdata();
//   }, [selectedDate]);

//   const groupedData = data.reduce((acc, meeting) => {
//     const meetingDate = new Date(meeting.date);

//     const day = String(meetingDate.getDate()).padStart(2, "0");
//     const month = meetingDate.toLocaleString("default", { month: "short" });
//     const year = meetingDate.getFullYear();

//     const date = `${day} ${month} ${year}`;

//     if (!acc[date]) {
//       acc[date] = [];
//     }
//     acc[date].push(meeting);
//     return acc;
//   }, {});

//   const formatDisplayDate = (dateString) => {
//     const date = new Date(dateString);
//     const day = String(date.getDate()).padStart(2, "0");
//     const month = date.toLocaleString("default", { month: "short" });
//     const year = date.getFullYear();
//     return `${month} ${day}, ${year}`;
//   };

//   return (
//     <>
//       <div className="content__wrapper">
//         <section className="page-content">
//           <div class="page-content">
//             <div class="dashboard_box_header d-md-flex align-items-center justify-content-between p-0">
//               <div>
//                 <h4 class="dashboard_heading">Operational Meeting</h4>
//                 <p class="dashboard_subtitle">
//                   Daily execution tracking and performance monitoring
//                 </p>
//               </div>
//               <div>
//                 <button
//                   class="main-teal-btn"
//                   onClick={handleGenerate}
//                   disabled={loading}
//                 >
//                   Generate Operational Meeting
//                 </button>
//               </div>
//             </div>

//             <div class="meeting-date-card mt-4">
//               <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
//                 <h6 class="meeting-title">Select Meeting Date</h6>
//                 <div class="d-flex align-items-center gap-2">
//                   <input
//                     id="dateInput"
//                     type="date"
//                     class="date-pill-btn"
//                     value={selectedDate}
//                     onChange={handleDateChange}
//                   />
//                 </div>
//               </div>
//               <div class="meeting-date-inner mt-3">
//                 <div class="d-flex align-items-center justify-content-between mb-2">
//                   <span class="tiny-muted">Selected Date:</span>
//                   <span class="text-detail-box">
//                     {formatDisplayDate(selectedDate)}
//                   </span>
//                 </div>
//                 <div class="d-flex align-items-center justify-content-between">
//                   <span class="tiny-muted">Meeting Status:</span>
//                   <span class="status-chip">Active</span>
//                 </div>
//               </div>
//             </div>

//             <div class="row no-gutters mt-4">
//               <div class="col-md-3 pr-md-3 pb-3 pb-md-0">
//                 <div class="stat-card h-100 d-flex flex-column justify-content-between">
//                   <div class="d-flex justify-content-between align-items-start">
//                     <div class="stat-dot d-flex align-items-center justify-content-center">
//                       <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg"><path cx="50" cy="50" r="45" fill="#ECFDF5" stroke="#3f4f6a" stroke-width="1.5" d="M28.5 15A13.5 13.5 0 0 1 15 28.5 13.5 13.5 0 0 1 1.5 15a13.5 13.5 0 0 1 27 0z"/><path d="m9 15.6 3.9 3.9 8.1 -8.1" stroke="#3f4f6a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
//                     </div>
//                     <span class="stat-pill pill-green">
//                       {meetingData && meetingData.total_tasks
//                         ? (
//                             (meetingData.completed_tasks /
//                               meetingData.total_tasks) *
//                             100
//                           ).toFixed(2) + "%"
//                         : "0%"}
//                     </span>
//                   </div>
//                   <div class="mt-4">
//                     <div class="stat-value">
//                       {meetingData.completed_tasks}/{meetingData.total_tasks}
//                     </div>
//                     <div class="stat-label">Tasks Completed</div>
//                   </div>
//                 </div>
//               </div>
//               <div class="col-md-3 pr-md-3 pb-3 pb-md-0">
//                 <div class="stat-card h-100 d-flex flex-column justify-content-between">
//                   <div class="d-flex justify-content-between align-items-start">
//                     <div class="stat-dot green  d-flex align-items-center justify-content-center">
//                       <svg width="30px" height="30px" fill="#1c7a3f" viewBox="0 0 1.8 1.8" xmlns="http://www.w3.org/2000/svg"><title>time-alarm-on</title><g id="Layer_2" data-name="Layer 2"><g id="invisible_box" data-name="invisible box"><path width="48" height="48" fill="none" d="M0 0h1.8v1.8H0z"/></g><g id="icons_Q2" data-name="icons Q2"><path d="m0.735 1.215 -0.15 -0.147a0.077 0.077 0 0 1 -0.008 -0.101 0.071 0.071 0 0 1 0.112 -0.008l0.098 0.098 0.322 -0.322a0.075 0.075 0 0 1 0.105 0.105l-0.375 0.375a0.071 0.071 0 0 1 -0.105 0"/><path d="M0.9 0.45a0.562 0.562 0 1 1 -0.562 0.562 0.562 0.562 0 0 1 0.562 -0.562m0 -0.15a0.712 0.712 0 1 0 0.712 0.712A0.711 0.711 0 0 0 0.9 0.3"/><path d="M0.225 0.45A0.086 0.086 0 0 1 0.165 0.42 0.075 0.075 0 0 1 0.179 0.315l0.3 -0.225a0.075 0.075 0 0 1 0.105 0.015 0.075 0.075 0 0 1 -0.015 0.105l-0.3 0.225a0.086 0.086 0 0 1 -0.045 0.015"/><path d="M1.575 0.45a0.086 0.086 0 0 1 -0.045 -0.015l-0.3 -0.225a0.075 0.075 0 0 1 -0.015 -0.105 0.075 0.075 0 0 1 0.105 -0.015l0.3 0.225a0.075 0.075 0 0 1 0.015 0.105 0.086 0.086 0 0 1 -0.06 0.03"/></g></g></svg>
//                     </div>
//                     <span class="stat-pill pill-green">
//                       {meetingData.on_time_rate_percentage}%
//                     </span>
//                   </div>
//                   <div class="mt-4">
//                     <div class="stat-value">
//                       {meetingData.on_time_rate_percentage}%
//                     </div>
//                     <div class="stat-label">On-Time Rate</div>
//                   </div>
//                 </div>
//               </div>
//               <div class="col-md-3 pr-md-3 pb-3 pb-md-0">
//                 <div class="stat-card h-100 d-flex flex-column justify-content-between">
//                   <div class="d-flex justify-content-between align-items-start">
//                     <div class="stat-dot yellow  d-flex align-items-center justify-content-center">
//                       <svg xmlns="http://www.w3.org/2000/svg" fill="#af7b00" width="30px" height="30px" viewBox="0 -0.003 0.75 0.75" data-name="Capa 1" id="Capa_1"><path d="M0.682 0.384a0.306 0.306 0 0 0 -0.112 -0.194A0.31 0.31 0 0 0 0.375 0.124a0.343 0.343 0 0 0 -0.183 0.057 0.297 0.297 0 0 0 -0.128 0.237A0.294 0.294 0 0 0 0.11 0.6a0.055 0.055 0 0 0 0.044 0.021 0.06 0.06 0 0 0 0.024 -0.005 0.052 0.052 0 0 0 0.028 -0.063 0.011 0.011 0 0 0 0 -0.004s-0.06 -0.112 -0.004 -0.209L0.203 0.337A0.189 0.189 0 0 1 0.375 0.237 0.206 0.206 0 0 1 0.548 0.337a0.191 0.191 0 0 1 0.022 0.133l-0.188 -0.07a0.014 0.014 0 1 0 -0.01 0.026L0.563 0.497a0.225 0.225 0 0 1 -0.014 0.037 0.061 0.061 0 0 0 -0.005 0.051 0.052 0.052 0 0 0 0.028 0.03c0.024 0.01 0.058 0.011 0.083 -0.041a0.304 0.304 0 0 0 0.028 -0.19M0.18 0.559a0.024 0.024 0 0 1 -0.013 0.029 0.028 0.028 0 0 1 -0.034 -0.007 0.263 0.263 0 0 1 -0.041 -0.16 0.337 0.337 0 0 1 0.03 -0.116l0.05 0.029a0.26 0.26 0 0 0 0.008 0.225M0.188 0.31l-0.052 -0.029a0.27 0.27 0 0 1 0.075 -0.075 0.313 0.313 0 0 1 0.153 -0.052v0.056A0.214 0.214 0 0 0 0.188 0.31m0.204 -0.101v-0.056a0.275 0.275 0 0 1 0.159 0.058 0.3 0.3 0 0 1 0.063 0.07L0.563 0.31a0.234 0.234 0 0 0 -0.172 -0.101ZM0.629 0.563c-0.018 0.037 -0.037 0.032 -0.046 0.027a0.025 0.025 0 0 1 -0.013 -0.013 0.037 0.037 0 0 1 0.004 -0.029 0.214 0.214 0 0 0 0.015 -0.037l0.011 0.004a0.015 0.015 0 0 0 0.005 0 0.015 0.015 0 0 0 0.013 -0.009 0.014 0.014 0 0 0 -0.008 -0.018l-0.014 -0.005a0.225 0.225 0 0 0 -0.018 -0.145l0.05 -0.028a0.274 0.274 0 0 1 0.026 0.082 0.276 0.276 0 0 1 -0.025 0.172"/><path d="M0.295 0.281a0.013 0.013 0 1 0 0.012 0.012 0.013 0.013 0 0 0 -0.012 -0.012"/><path cx="12.14" cy="7.81" r="0.33" d="M0.468 0.293A0.012 0.012 0 0 1 0.455 0.305A0.012 0.012 0 0 1 0.443 0.293A0.012 0.012 0 0 1 0.468 0.293z"/><path d="M0.557 0.436a0.013 0.013 0 1 0 -0.013 0.012 0.013 0.013 0 0 0 0.013 -0.012"/><path d="M0.209 0.423a0.012 0.012 0 1 0 0.013 0.012 0.012 0.012 0 0 0 -0.013 -0.012"/></svg>
//                     </div>
//                     <span class="stat-pill pill-yellow">
//                       {meetingData.avg_performance_out_of_5}/5
//                     </span>
//                   </div>
//                   <div class="mt-4">
//                     <div class="stat-value">
//                       {meetingData.avg_performance_out_of_5}
//                     </div>
//                     <div class="stat-label">Avg Performance</div>
//                   </div>
//                 </div>
//               </div>
//          <div className="col-md-3">
//   <div className="stat-card h-100 d-flex flex-column justify-content-between">
//     <div className="d-flex justify-content-between align-items-start">
//       <div className="stat-dot red  d-flex align-items-center justify-content-center">
//         <svg xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" fill="#b63030" viewBox="0 0 23 29.515" width="23" height="29.515"><path d="M5.568 2.059h2.012C7.721 0.898 8.658 0 9.795 0c1.13 0 2.062 0.886 2.213 2.035l2.045 0.025c0.136 0 0.245 0.109 0.245 0.245v2.709c0 0.136 -0.109 0.245 -0.245 0.245H5.57a0.245 0.245 0 0 1 -0.245 -0.245V2.305a0.242 0.242 0 0 1 0.243 -0.245m6.23 17.387a0.569 0.569 0 0 1 0 -1.137h7.201a0.567 0.567 0 1 1 0 1.137zm5.946 -9.838h0.051c0.18 0 0.34 0.083 0.444 0.213l4.613 5.065a0.567 0.567 0 0 1 0.147 0.382l0.002 0.153v12.871c0 0.335 -0.139 0.642 -0.36 0.863s-0.527 0.36 -0.863 0.36h-12.757c-0.333 0 -0.639 -0.138 -0.861 -0.36l-0.002 -0.002a1.227 1.227 0 0 1 -0.359 -0.861V10.82a1.223 1.223 0 0 1 1.223 -1.222h8.61q0.059 0 0.114 0.011m4.119 6.387c-2.522 -0.098 -3.771 -0.189 -4.478 -0.93s-0.663 -1.877 -0.578 -4.05l0.011 -0.281H9.02a0.084 0.084 0 0 0 -0.086 0.085v17.472q0.001 0.037 0.024 0.059l0.002 0.002q0.023 0.024 0.06 0.025h12.758q0.034 -0.002 0.059 -0.027c0.025 -0.025 0.027 -0.038 0.027 -0.059zm-3.935 -4.664c-0.065 1.681 -0.081 2.575 0.278 2.952 0.354 0.372 1.23 0.471 2.919 0.547zm-6.133 14.484a0.568 0.568 0 0 1 0 -1.136h7.201a0.567 0.567 0 1 1 0 1.136zm0 -3.186a0.568 0.568 0 0 1 0 -1.136h7.201a0.567 0.567 0 1 1 0 1.136zm-6.011 0.432a0.724 0.724 0 0 1 0 1.447h-3.519a2.269 2.269 0 0 1 -1.599 -0.669A2.246 2.246 0 0 1 0 22.243V5.278c0 -0.624 0.255 -1.191 0.665 -1.602l0.048 -0.044a2.254 2.254 0 0 1 1.553 -0.621h1.871v1.447H2.267c-0.212 0 -0.406 0.081 -0.552 0.212l-0.027 0.028a0.82 0.82 0 0 0 -0.242 0.578v16.965c0 0.223 0.094 0.428 0.243 0.577v0.003c0.149 0.149 0.354 0.241 0.577 0.241zM15.484 3.011h1.87c0.622 0 1.188 0.257 1.598 0.666 0.413 0.412 0.67 0.981 0.67 1.6v1.724a0.724 0.724 0 0 1 -1.447 0V5.278c0 -0.224 -0.092 -0.429 -0.241 -0.577a0.82 0.82 0 0 0 -0.58 -0.242h-1.87zm-5.714 -1.957a1.163 1.163 0 1 1 0 2.326 1.163 1.163 0 0 1 0 -2.326"/></svg>
//       </div>
//       <span className="stat-pill pill-red">Pending Tasks</span>
//     </div>
//     <div className="mt-4">
//       {Object.entries(Blocker || {}).map(([deptName, pendingCount], index) => (
//         <div key={index} className="d-flex justify-content-between align-items-center mb-1">
//           <span className="stat-label mb-0">{deptName}</span>
//           <span className="stat-value" style={{ fontSize: "16px" }}>{pendingCount}</span>
//         </div>
//       ))}
//     </div>
//   </div>
// </div>
//               {/* <div class="col-md-3">
//                 <div class="stat-card h-100 d-flex flex-column justify-content-between">
//                   <div class="d-flex justify-content-between align-items-start">
//                     <div class="stat-dot red"></div>
//                     <span class="stat-pill pill-red">4 Active</span>
//                   </div>
//                   <div class="mt-4">
//                     <div class="stat-value">4</div>
//                     <div class="stat-label">Active Blockers</div>
//                   </div>
//                 </div>
//               </div> */}
//             </div>
//             <div class="mt-5">
//               <h3 class="dashboard_mini_heading">All Departments</h3>

//               {Object.entries(groupedData).map(([date, meetings]) => (
//                 <div class="row" key={date}>
//                   {meetings.map((meeting, index) => (
//                     <div key={index} class="col-lg-4 col-md-6 col-12  mb-4">
//                       <div class="dept-card cursor-pointer" onClick={() => handleView()}>
//                         <div class="d-flex justify-content-between align-items-start mb-3">
//                           <div class="avatar-stack">
//                             {meeting.participants_pictures &&
//                             meeting.participants_pictures.length > 0 ? (
//                               meeting.participants_pictures
//                                 .split(",")
//                                 .map((participantId, idx) => (
//                                   <div className="img_box" key={idx}>
//                                     <img
//                                       src={`${FileUrl}/${participantId}`}
//                                       alt="User"
//                                       onError={(e) => {
//                                         e.target.onerror = null;
//                                         e.target.src = `${FileUrl}/img/profile.jpeg`;
//                                       }}
//                                       className=""
//                                       data-bs-toggle="tooltip"
//                                       data-bs-placement="top"
//                                       title={meeting.contributon_name}
//                                     />
//                                   </div>
//                                 ))
//                             ) : (
//                               <div className="img_box">
//                                 <img
//                                   src={`${FileUrl}/img/profile.jpeg`}
//                                   alt="User"
//                                   className=""
//                                   data-bs-toggle="tooltip"
//                                   data-bs-placement="top"
//                                   title={meeting.contributon_name}
//                                 />
//                               </div>
//                             )}
//                           </div>
//                           <span class="badge-dot d-flex align-items-center justify-content-center">
//                             <svg fill="#fff" width="20px" height="20px" viewBox="0 0 0.6 0.6" xmlns="http://www.w3.org/2000/svg"><path d="M0.448 0.166a0.025 0.025 0 0 0 -0.014 -0.014A0.025 0.025 0 0 0 0.425 0.15H0.175a0.025 0.025 0 0 0 0 0.05h0.19l-0.208 0.207a0.025 0.025 0 0 0 0 0.035 0.025 0.025 0 0 0 0.035 0L0.4 0.235V0.425a0.025 0.025 0 0 0 0.05 0V0.175a0.025 0.025 0 0 0 -0.002 -0.01"/></svg>
//                           </span>
//                         </div>
//                         <div class="dept-title">{meeting.department_name}</div>
//                         <div class="dept-sub">
//                           {meeting.facilitator_first_name}{" "}
//                           {meeting.facilitator_last_name}
//                         </div>
//                         <div class="dept-row d-flex justify-content-between">
//                           <span>Tasks</span>
//                           <span>
//                             <strong>
//                               {meeting.prev_completed_tasks}/
//                               {meeting.prev_total_tasks}
//                             </strong>
//                           </span>
//                         </div>
//                         <div class="dept-row d-flex justify-content-between">
//                           <span>On-Time</span>
//                           <span class="value-green">
//                             {meeting.prev_on_time_percentage}%
//                           </span>
//                         </div>
//                         <div class="dept-row d-flex justify-content-between mb-2">
//                           <span>Performance</span>
//                           <span class="value-yellow">
//                             {meeting.team_performance}/5
//                           </span>
//                         </div>
//                         <div class="pt-4">
//                           <div class="d-flex align-items-center justify-content-between">
//                             <div class="dept-row">Completion</div>
//                             <span class="value-green large-text">
//                               {meeting.prev_on_time_percentage}%
//                             </span>
//                           </div>
//                           <div class="progress mt-1" style={{ height: "8px" }}>
//                             <div
//                               class="progress-bar green"
//                               style={{
//                                 width: `${meeting.prev_on_time_percentage}%`,
//                               }}
//                             ></div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>
//       </div>

//       <OperationalModalAdd show={showModal} handleClose={handleCloseModal} />
//       <OperationalEditModal
//         show={showeditModal}
//         handleClose={handleCloseEditModal}
//         editId={editId}
//       />
//     </>
//   );
// }

// export default OperationalList;
