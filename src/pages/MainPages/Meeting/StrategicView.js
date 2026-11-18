

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchstrategicParticipantsbyid, fetchstrategicmeetingbyid,
  getStrategicmeetingPercentage, getStrategicDates, getdepartmentshowbyuserid,
} from "../../../config/config";
import ApiService from "../../../services/ApiService";
import { getToken, isAdmin, getUserId, ishod } from "../../../services/useLocalStorage";
import { MeetingRoute } from "../../../config/RouteConfig";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "react-circular-progressbar/dist/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faPencil } from "@fortawesome/free-solid-svg-icons";
import StrategicModal from "./Components/StrategicModal";
import MarksModal from "./Components/MarksModal";
import StrategicTaskViewModal from "./Components/StrategicTaskViewModal";
import { Accordion } from "react-bootstrap";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { FileUrl } from "../../../config/file_url";
ChartJS.register(ArcElement, Tooltip, Legend);


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
  * { box-sizing: border-box; }
  @keyframes svFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .sv-fade { animation:svFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes svSpin { to{transform:rotate(360deg)} }
  .sv-spinner { width:28px;height:28px;border-radius:50%;border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};animation:svSpin 0.8s linear infinite; }

  /* ── Date timeline ── */
  .sv-timeline { display:flex;gap:10px;flex-wrap:nowrap;overflow-x:auto;padding:4px 0 10px;scrollbar-width:none; }
  .sv-timeline::-webkit-scrollbar { display:none; }
  .sv-date-tile {
    display:flex;flex-direction:column;align-items:center;gap:2px;
    padding:10px 14px;border-radius:12px;cursor:pointer;
    border:2px solid ${THEME.border};background:#fff;min-width:72px;
    transition:all 0.18s;flex-shrink:0;
  }
  .sv-date-tile:hover { border-color:${THEME.brand};background:${THEME.brandLight}; }
  .sv-date-tile.active { border-color:${THEME.brand};background:${THEME.brandLight}; }
  .sv-date-tile input[type=radio] { display:none; }
  .sv-date-month { font-size:10px;font-weight:700;text-transform:uppercase;color:${THEME.textMuted};letter-spacing:0.08em; }
  .sv-date-day   { font-size:22px;font-weight:800;color:${THEME.text};font-family:'Sora',sans-serif;line-height:1; }
  .sv-date-year  { font-size:10px;color:${THEME.textMuted}; }
  .sv-date-pill  { font-size:9px;font-weight:700;padding:2px 8px;border-radius:20px;margin-top:3px;text-transform:uppercase;letter-spacing:0.04em; }
  .sv-date-pill.today    { background:#E6F7FF;color:#0070BB; }
  .sv-date-pill.done     { background:#F6FFED;color:#389E0D; }
  .sv-date-pill.upcoming { background:#FFF7E6;color:#D46B08; }

  /* ── Department tabs ── */
  .sv-tabs { display:flex;gap:6px;flex-wrap:nowrap;overflow-x:auto;padding:0;margin:0;list-style:none;scrollbar-width:none; }
  .sv-tabs::-webkit-scrollbar { display:none; }
  .sv-tab {
    padding:8px 16px;border-radius:20px;cursor:pointer;white-space:nowrap;
    font-size:12px;font-weight:600;border:1.5px solid transparent;
    background:transparent;color:#595959;transition:all 0.18s;
    font-family:'DM Sans',sans-serif;
  }
  .sv-tab:hover { background:${THEME.brandLight};color:${THEME.brand}; }
  .sv-tab.active { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand};font-weight:700; }

  /* ── Accordion overrides ── */
  .sv-accordion .accordion-item {
    border:1.5px solid ${THEME.border};border-radius:12px !important;margin-bottom:10px;overflow:hidden;
    background:#fff;box-shadow:0 2px 8px rgba(136,117,73,0.05);
  }
  .sv-accordion .accordion-button {
    background:#fff;padding:7px 0;font-family:'DM Sans',sans-serif;
    box-shadow:none !important;border-radius:12px !important;
  }
  .sv-accordion .accordion-button:not(.collapsed) {
    background:${THEME.brandLight};color:${THEME.brand};border-bottom:1px solid ${THEME.border};
  }
  .sv-accordion .accordion-button::after { filter:none; }
  .sv-accordion .accordion-body { padding:16px;background:#FDFAF5; }

  /* ── Stat row ── */
  .sv-stat-row { display:flex;align-items:baseline;gap:6px;margin-bottom:7px; }
  .sv-stat-label { font-size:12px;color:${THEME.textMuted};min-width:130px;font-weight:600; }
  .sv-stat-val   { font-size:13px;font-weight:800;color:${THEME.brand};font-family:'Sora',sans-serif; }
  .sv-stat-pct   { font-size:11px;color:${THEME.textMuted}; }

  /* ── Task boxes ── */
  .sv-task-box {
    flex:1;background:#fff;border-radius:10px;border:1.5px solid ${THEME.border};
    padding:12px 14px;text-align:center;
  }
  .sv-task-title { font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:${THEME.textMuted};margin-bottom:6px; }
  .sv-task-count { font-size:22px;font-weight:800;font-family:'Sora',sans-serif; }

  /* ── Reflection boxes ── */
  .sv-reflect-box {
    flex:1;background:#fff;border-radius:10px;border:1.5px solid ${THEME.border};
    padding:12px 14px;
  }
  .sv-reflect-title { font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:${THEME.textMuted};margin-bottom:8px; }

  /* ── Action icon buttons ── */
  .sv-icon-btn {
    width:30px;height:30px;border-radius:8px;border:1.5px solid ${THEME.border};
    background:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;
    font-size:12px;transition:all 0.15s;
  }
  .sv-icon-btn.last{
    width:auto
  }
  .sv-icon-btn.edit:hover  { background:${THEME.brandLight};border-color:${THEME.brand};color:${THEME.brand}; }
  .sv-icon-btn.view:hover  { background:#F0F5FF;border-color:#ADC6FF;color:#2F54EB; }
  .sv-icon-btn:disabled    { opacity:0.4;cursor:not-allowed; }

  ::-webkit-scrollbar{width:5px;height:5px;}
  ::-webkit-scrollbar-track{background:${THEME.brandLight};}
  ::-webkit-scrollbar-thumb{background:${THEME.brandMid};border-radius:10px;}
`;


// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
const allTabs = [
  { id:"5", label:"Sales" },
  { id:"1", label:"Approval" },
  { id:"2", label:"Architecture" },
  { id:"3", label:"Interior" },
  { id:"4", label:"Operation" },
  { id:"6", label:"Accounts" },
];

function formatDateKey(dateStr) {
  const d = new Date(dateStr);
  const day   = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("default", { month: "short" });
  const year  = d.getFullYear();
  const isoMonth = String(d.getMonth() + 1).padStart(2, "0");
  const isoDay   = String(d.getDate()).padStart(2, "0");
  const iso = `${year}-${isoMonth}-${isoDay}`;
  return { dateKey:`${day} ${month} ${year}`, day, month, year, iso };
}

function pillClass(dt) {
  const d = new Date(dt);
  const today = new Date();
  const nd = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const nt = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (nd.getTime() === nt.getTime()) return { label:"Today", cls:"today" };
  if (nd.getTime() < nt.getTime())  return { label:"Done",  cls:"done" };
  return { label:"Upcoming", cls:"upcoming" };
}


// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
function StrategicView() {
  const navigate = useNavigate();
  const params   = useParams();
  const header   = { Authorization:`Bearer ${getToken()}`, "Content-Type":"application/json" };

  const [showModal,      setShowModal]      = useState(false);
  const [showMarksModal, setShowMarksModal] = useState(false);
  const [showTaskModal,  setShowTaskModal]  = useState(false);
  const [loading,        setLoading]        = useState(false);
  const [data,           setData]           = useState([]);
  const [editId,         setEditId]         = useState("");
  const [strategicDates, setStrategicDates] = useState([]);
  const [selectedDate,   setSelectedDate]   = useState("");
  const [tabs,           setTabs]           = useState(allTabs);
  const [activeTabId,    setActiveTabId]    = useState("");

  const fetchMeeting = async () => {
    try {
      await ApiService(null, params.id, header, fetchstrategicmeetingbyid.method, fetchstrategicmeetingbyid.url);
    } catch (e) { console.error(e); }
  };

  const fetchdate = async () => {
    try {
      setLoading(true);
      const res = await ApiService(null, 0, header, getStrategicDates.method, getStrategicDates.url);
      if (!res.data.error) {
        const dates = Array.isArray(res.data.data)
          ? res.data.data.map((p) => (p && p.date ? p.date : p))
          : [];
        setStrategicDates(dates);
        if (!selectedDate && dates.length > 0) setSelectedDate(formatDateKey(dates[0]).iso);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchdepartment = async () => {
    try {
      setLoading(true);
      const res = await ApiService(null, 0, header, getdepartmentshowbyuserid.method, getdepartmentshowbyuserid.url);
      if (!res.data.error) {
        if (isAdmin()) {
          setTabs(allTabs); setActiveTabId(allTabs[0].id);
        } else {
          const ids = (res.data.data || []).map((d) => String(d.id));
          const filtered = allTabs.filter((t) => ids.includes(t.id));
          setTabs(filtered);
          if (filtered.length > 0) setActiveTabId(filtered[0].id);
        }
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchdata = async () => {
    if (!activeTabId || !selectedDate) return;
    try {
      setLoading(true);
      const pathParams = `${selectedDate}/${encodeURIComponent(activeTabId)}`;
      const res = await ApiService(null, pathParams, header, fetchstrategicParticipantsbyid.method, fetchstrategicParticipantsbyid.url);
      if (!res.data.error) setData(res.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchMeeting();
    fetchdepartment();
    fetchdate();
  }, []);

  useEffect(() => {
    if (activeTabId) fetchdata();
  }, [selectedDate, activeTabId]);

  const handleView = (id) => navigate(`/${MeetingRoute.startegicperformancelist}/${id}`);

  const canEdit = (item) => !item.what_did_u_well && !item.what_did_u_not_well && !item.what_can_u_do_diff;

  return (
    <>
      <style>{CSS}</style>

      <div style={{ minHeight:"100vh", background:THEME.bg, fontFamily:"'DM Sans',sans-serif", padding:"28px 24px" }}>

        {/* ── Header ── */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:24 }}>
          <div style={{ width:4, height:26, borderRadius:3, background:`linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
          <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:THEME.text, fontFamily:"'Sora',sans-serif", letterSpacing:"-0.3px" }}>
            Strategic Meeting
          </h1>
        </div>

        <div className="sv-fade">

          {/* ── Meeting Timeline ── */}
          <div style={{ background:"#fff", border:`1px solid ${THEME.border}`, borderRadius:14, padding:"18px 20px", marginBottom:16, boxShadow:"0 2px 10px rgba(136,117,73,0.06)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
              <div style={{ width:3, height:14, borderRadius:2, background:`linear-gradient(180deg,${THEME.brand},${THEME.brandMid})` }} />
              <h2 style={{ margin:0, fontSize:11, fontWeight:700, color:THEME.brand, textTransform:"uppercase", letterSpacing:"0.07em", fontFamily:"'Sora',sans-serif" }}>
                📅 Meeting Timeline
              </h2>
            </div>

            {strategicDates.length > 0 ? (
              <div className="sv-timeline">
                {strategicDates.map((dt) => {
                  const { day, month, year, iso } = formatDateKey(dt);
                  const { label, cls } = pillClass(dt);
                  return (
                    <label
                      key={iso}
                      htmlFor={`sv-date-${iso}`}
                      className={`sv-date-tile${selectedDate === iso ? " active" : ""}`}
                      onClick={() => setSelectedDate(iso)}
                    >
                      <input id={`sv-date-${iso}`} type="radio" name="sv-meeting" value={iso}
                        checked={selectedDate === iso} onChange={() => setSelectedDate(iso)} />
                      <span className="sv-date-month">{month}</span>
                      <span className="sv-date-day">{day}</span>
                      <span className="sv-date-year">{year}</span>
                      <span className={`sv-date-pill ${cls}`}>{label}</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <p style={{ color:THEME.textLight, fontSize:13, margin:0 }}>No scheduled meetings</p>
            )}
          </div>

          {/* ── Department Tabs ── */}
          <div style={{ background:"#fff", border:`1px solid ${THEME.border}`, borderRadius:14, padding:"14px 20px", marginBottom:16, boxShadow:"0 2px 10px rgba(136,117,73,0.06)" }}>
            <div className="sv-tabs">
              {tabs.map((tab) => (
                <button key={tab.id}
                  className={`sv-tab${String(activeTabId) === String(tab.id) ? " active" : ""}`}
                  onClick={() => setActiveTabId(tab.id)}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Participants ── */}
          <div style={{ background:"#fff", border:`1px solid ${THEME.border}`, borderRadius:14, padding:"20px", boxShadow:"0 2px 10px rgba(136,117,73,0.06)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
              <div style={{ width:3, height:14, borderRadius:2, background:`linear-gradient(180deg,${THEME.brand},${THEME.brandMid})` }} />
              <h2 style={{ margin:0, fontSize:11, fontWeight:700, color:THEME.brand, textTransform:"uppercase", letterSpacing:"0.07em", fontFamily:"'Sora',sans-serif" }}>
                👥 Participants List
              </h2>
            </div>

            {loading && (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"60px 0", gap:14, flexDirection:"column" }}>
                <div className="sv-spinner" />
                <p style={{ color:THEME.textLight, fontSize:13, margin:0 }}>Loading…</p>
              </div>
            )}

            {!loading && data.length === 0 && (
              <div style={{ textAlign:"center", padding:"48px 0" }}>
                <div style={{ fontSize:36, marginBottom:8 }}>📋</div>
                <p style={{ color:THEME.textLight, fontSize:13, margin:0 }}>No participants for this date and department.</p>
              </div>
            )}

            {!loading && data.length > 0 && (
              <Accordion className="sv-accordion">
                {data.map((item) => {
                  const showAdminEdit    = isAdmin();
                  const showOwnEdit      = !isAdmin() && item.user_id === getUserId();
                  const showHodEdit      = !isAdmin() && ishod() && item.user_id !== getUserId();
                  const editDisabled     = !canEdit(item);

                  return (
                    <Accordion.Item key={item.id} eventKey={String(item.id)}>
                      <Accordion.Header>
                        {/* ── Participant header ── */}
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                            {/* Avatar */}
                            <div style={{ width:40, height:40, borderRadius:"50%", overflow:"hidden", flexShrink:0, border:`2px solid ${THEME.border}` }}>
                              <img
                                src={item.profile_picture ? `${FileUrl}/${item.profile_picture}` : `${FileUrl}/img/profile.jpeg`}
                                alt={item.first_name}
                                style={{ width:"100%", height:"100%", objectFit:"cover" }}
                                onError={(e) => { e.target.onerror=null; e.target.src=`${FileUrl}/img/profile.jpeg`; }}
                              />
                            </div>
                            <div>
                              <p style={{ margin:0, fontSize:14, fontWeight:700, color:THEME.text }}>
                                {item.first_name} {item.last_name}
                              </p>
                              {item.total_marks_data !== undefined && (
                                <span style={{ fontSize:11, fontWeight:600, color:THEME.brand }}>
                                  Score: {item.total_marks_data}%
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div style={{ display:"flex", gap:6, marginRight:8 }} onClick={(e) => e.stopPropagation()}>
                            {(showAdminEdit || showOwnEdit || showHodEdit) && (
                              <button className="sv-icon-btn edit" disabled={!showAdminEdit && editDisabled}
                                onClick={() => { if (showAdminEdit || !editDisabled) setEditId(item.id); if (showAdminEdit || !editDisabled) setShowModal(true); }}>
                                <FontAwesomeIcon icon={faPencil} />
                              </button>
                            )}
                            {(showAdminEdit || showOwnEdit || showHodEdit) && (
                              <button className="sv-icon-btn view" onClick={() => handleView(item.user_id)}>
                                <FontAwesomeIcon icon={faArrowRight} />
                              </button>
                            )}
                            {showAdminEdit && (
                              <button className="sv-icon-btn edit last" style={{ marginLeft:2 }}
                                onClick={() => { setEditId(item.id); setShowMarksModal(true); }}>
                                <FontAwesomeIcon icon={faPencil} style={{ fontSize:10 }} />
                                <span style={{ fontSize:9, marginLeft:2, fontFamily:"'DM Sans',sans-serif" }}>Marks</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </Accordion.Header>

                      <Accordion.Body>
                        {/* ── Performance grid ── */}
                        <div style={{ display:"grid", gridTemplateColumns:"140px 1fr", gap:16, marginBottom:16 }}>
                          {/* Circular progress */}
                          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", background:"#fff", borderRadius:12, border:`1px solid ${THEME.border}`, padding:16 }}>
                            <div style={{ width:100 }}>
                              <CircularProgressbar
                                value={item.total_marks_data || 0}
                                text={`${item.total_marks_data || 0}%`}
                                styles={buildStyles({ textColor:THEME.text, pathColor:THEME.brand, trailColor:THEME.border })}
                              />
                            </div>
                          </div>

                          {/* Stats */}
                          <div style={{ background:"#fff", borderRadius:12, border:`1px solid ${THEME.border}`, padding:"14px 0" }}>
                            {[
                              { label:"Task",               val:`${item.task_mark||0}/70`,    pct:`${item.task_percentage}%`, extra:`${item.com_task}/${item.out_of_task} tasks` },
                              { label:"Attendance",         val:`${item.attendance||0}/10`,   pct:`${item.attendance_percentage}%`, extra:`${item.total_attendance}/43.5 days` },
                              { label:"Software Data",      val:`${item.software||0}/5`,      pct:`${item.soft_percent}%` },
                              { label:"Discipline+Conflict",val:`${item.conflict||0}/5`,      pct:`${item.con_percent}%` },
                              { label:"Meeting Data",       val:`${item.meeting||0}/5`,       pct:`${item.meeting_percent}%` },
                              { label:"Collaboration",      val:`${item.collabation||0}/5`,   pct:`${item.collbration_per}%`, extra:item.total_contribution },
                            ].map(({ label, val, pct, extra }) => (
                              <div key={label} className="sv-stat-row">
                                <span className="sv-stat-label">{label}</span>
                                <span className="sv-stat-val">{val}</span>
                                {pct && <span className="sv-stat-pct">({pct})</span>}
                                {extra && <span className="sv-stat-pct">{extra}</span>}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* ── Task summary ── */}
                        <div style={{ display:"flex", gap:10, marginBottom:14 }}>
                          <div className="sv-task-box">
                            <p className="sv-task-title">Goal</p>
                            <span className="sv-task-count" style={{ color:"#2F54EB", cursor:"pointer" }}
                              onClick={() => { setEditId(item.user_id); setShowTaskModal(true); }}>
                              {item.total_task}
                            </span>
                          </div>
                          <div className="sv-task-box">
                            <p className="sv-task-title">Done</p>
                            <span className="sv-task-count" style={{ color:"#389E0D" }}>{item.total_completed_tasks}</span>
                          </div>
                          <div className="sv-task-box">
                            <p className="sv-task-title">Not Done</p>
                            <span className="sv-task-count" style={{ color:"#CF1322" }}>{item.total_uncompleted_tasks}</span>
                          </div>
                        </div>

                        {/* ── Reflections ── */}
                        <div style={{ display:"flex", gap:10, marginBottom:10 }}>
                          {[
                            { title:"What You Did Well",     html:item.what_did_u_well },
                            { title:"What You Did Not Well", html:item.what_did_u_not_well },
                          ].map(({ title, html }) => (
                            <div key={title} className="sv-reflect-box">
                              <p className="sv-reflect-title">{title}</p>
                              <div style={{ fontSize:12, color:"#595959" }}
                                dangerouslySetInnerHTML={{ __html: html || '<span style="color:#BDBDBD">—</span>' }} />
                            </div>
                          ))}
                        </div>
                        <div style={{ display:"flex", gap:10 }}>
                          <div className="sv-reflect-box" style={{ maxWidth:"50%" }}>
                            <p className="sv-reflect-title">What You Can Do Differently</p>
                            <div style={{ fontSize:12, color:"#595959" }}
                              dangerouslySetInnerHTML={{ __html: item.what_can_u_do_diff || '<span style="color:#BDBDBD">—</span>' }} />
                          </div>
                        </div>
                      </Accordion.Body>
                    </Accordion.Item>
                  );
                })}
              </Accordion>
            )}
          </div>
        </div>
      </div>

      <StrategicModal  show={showModal}      handleClose={() => setShowModal(false)}      id={editId} meetingId={params.id} />
      <MarksModal      show={showMarksModal}  handleClose={() => setShowMarksModal(false)} id={editId} meetingId={params.id} />
      <StrategicTaskViewModal show={showTaskModal} handleClose={() => setShowTaskModal(false)} id={editId} />
    </>
  );
}

export default StrategicView;