// ─────────────────────────────────────────────
//  EmpMeeting.jsx  —  Operational Meeting (Employee)
//  Same brand design system as StrategicList
// ─────────────────────────────────────────────

import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ApiService from "../../../../services/ApiService";
import { getToken } from "../../../../services/useLocalStorage";
import { fetchTeamOpMeeting } from "../../../../config/config";
import { MeetingRoute } from "../../../../config/RouteConfig";
import { FileUrl } from "../../../../config/file_url";
import { getFileDisplayUrl } from "../../../../services/S3Service";


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
  @keyframes emFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .em-fade { animation:emFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes emSpin { to{transform:rotate(360deg)} }
  .em-spinner {
    width:28px;height:28px;border-radius:50%;
    border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};
    animation:emSpin 0.8s linear infinite;
  }

  /* ── Meeting card ── */
  .em-card {
    background:#fff;border:1.5px solid ${THEME.border};border-radius:14px;
    padding:18px;cursor:pointer;transition:all 0.2s;
    box-shadow:0 2px 10px rgba(136,117,73,0.06);
    display:flex;flex-direction:column;gap:14px;height:100%;
  }
  .em-card:hover {
    border-color:${THEME.brand};
    box-shadow:0 6px 24px rgba(136,117,73,0.14);
    transform:translateY(-2px);
  }

  /* ── Avatar stack ── */
  .em-avatar-stack { display:flex;align-items:center; }
  .em-avatar {
    width:34px;height:34px;border-radius:50%;border:2.5px solid #fff;
    object-fit:cover;margin-left:-8px;
    box-shadow:0 1px 4px rgba(0,0,0,0.12);flex-shrink:0;
  }
  .em-avatar:first-child { margin-left:0; }

  /* ── Arrow button ── */
  .em-arrow-btn {
    width:32px;height:32px;border-radius:50%;border:none;
    background:${THEME.brand};cursor:pointer;flex-shrink:0;
    display:flex;align-items:center;justify-content:center;transition:all 0.15s;
  }
  .em-arrow-btn:hover { background:${THEME.brandDark}; }

  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:${THEME.brandLight}; }
  ::-webkit-scrollbar-thumb { background:${THEME.brandMid};border-radius:10px; }
`;


// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
function fmtGroupDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
}

function groupByDate(data) {
  const acc = {};
  data.forEach((meeting) => {
    const d = new Date(meeting.date);
    const key = d.toISOString().split("T")[0]; // YYYY-MM-DD for sorting
    if (!acc[key]) acc[key] = [];
    acc[key].push(meeting);
  });
  // Sort descending
  return Object.entries(acc).sort(([a], [b]) => new Date(b) - new Date(a));
}


// ─────────────────────────────────────────────
//  MEETING CARD
// ─────────────────────────────────────────────
function MeetingCard({ meeting, onView }) {
  const pictures = meeting.participants_pictures
    ? meeting.participants_pictures.split(",").filter(Boolean)
    : [];

  return (
    <div className="em-card" onClick={() => onView(meeting.id)}>
      {/* Header: avatars + arrow */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div className="em-avatar-stack">
          {(pictures.length > 0 ? pictures : [null]).slice(0, 5).map((pic, i) => (
            <img
              key={i}
              className="em-avatar"
              src={pic ? getFileDisplayUrl(pic, FileUrl) : `${FileUrl}/default/DefaultImage.png`}
              alt="participant"
              onError={(e) => { e.target.onerror = null; e.target.src = `${FileUrl}/default/DefaultImage.png`; }}
            />
          ))}
          {pictures.length > 5 && (
            <div style={{
              width:34, height:34, borderRadius:"50%", border:"2.5px solid #fff",
              background:THEME.brandLight, marginLeft:-8,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:10, fontWeight:700, color:THEME.brand, flexShrink:0,
            }}>
              +{pictures.length - 5}
            </div>
          )}
        </div>
        <button className="em-arrow-btn" onClick={(e) => { e.stopPropagation(); onView(meeting.id); }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>

      {/* Dept name */}
      <div>
        <p style={{ margin:"0 0 4px", fontSize:15, fontWeight:800, color:THEME.text, fontFamily:"'Sora',sans-serif" }}>
          {meeting.department_name}
        </p>
        <p style={{ margin:0, fontSize:12, color:THEME.textMuted }}>
          Facilitator:{" "}
          <span style={{ fontWeight:600, color:THEME.brandDark }}>
            {meeting.facilitator_first_name} {meeting.facilitator_last_name}
          </span>
        </p>
      </div>

      {/* Participant count pill */}
      {pictures.length > 0 && (
        <div>
          <span style={{
            padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600,
            background:THEME.brandLight, color:THEME.brandDark, border:`1px solid #D4C4A0`,
          }}>
            👥 {pictures.length} participant{pictures.length > 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
}


// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
function EmpMeeting() {
  const params   = useParams();
  const navigate = useNavigate();
  const header   = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };

  const [loading, setLoading] = useState(false);
  const [data,    setData]    = useState([]);

  const fetchdata = async () => {
    setLoading(true);
    try {
      const res = await ApiService(null, params.id, header, fetchTeamOpMeeting.method, fetchTeamOpMeeting.url);
      if (!res.data.error) setData(res.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchdata(); }, []);

  const handleView = (id) => navigate(`/${MeetingRoute.operationalview}/${id}`);

  const groupedData = useMemo(() => groupByDate(data), [data]);

  return (
    <>
      <style>{CSS}</style>

      <div style={{ minHeight:"100vh", background:THEME.bg, fontFamily:"'DM Sans',sans-serif", padding:"28px 24px" }}>

        {/* ── Header ── */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:24 }}>
          <div style={{ width:4, height:26, borderRadius:3, background:`linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
          <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:THEME.text, fontFamily:"'Sora',sans-serif", letterSpacing:"-0.3px" }}>
            Daily Overview Meetings
          </h1>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"80px 0", gap:16 }}>
            <div className="em-spinner" />
            <p style={{ color:THEME.textLight, fontSize:13, margin:0 }}>Loading meetings…</p>
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && groupedData.length === 0 && (
          <div style={{ textAlign:"center", padding:"64px 0" }}>
            <div style={{ fontSize:40, marginBottom:10 }}>📅</div>
            <p style={{ color:THEME.textLight, fontSize:14, margin:0 }}>No Daily Overview meetings found.</p>
          </div>
        )}

        {/* ── Date groups ── */}
        {!loading && groupedData.map(([isoDate, meetings]) => (
          <div key={isoDate} className="em-fade" style={{ marginBottom:28 }}>

            {/* Date header */}
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
              <div style={{ width:3, height:16, borderRadius:2, background:`linear-gradient(180deg,${THEME.brand},${THEME.brandMid})` }} />
              <h2 style={{ margin:0, fontSize:14, fontWeight:800, color:THEME.text, fontFamily:"'Sora',sans-serif" }}>
                {fmtGroupDate(isoDate)}
              </h2>
              <span style={{
                padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:700,
                background:THEME.brandLight, color:THEME.brandDark, border:`1px solid #D4C4A0`,
                marginLeft:4,
              }}>
                {meetings.length} meeting{meetings.length > 1 ? "s" : ""}
              </span>
            </div>

            {/* Cards grid */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:16 }}>
              {meetings.map((meeting, idx) => (
                <MeetingCard key={idx} meeting={meeting} onView={handleView} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default EmpMeeting;
