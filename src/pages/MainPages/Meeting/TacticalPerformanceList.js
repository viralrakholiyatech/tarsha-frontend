
// ─────────────────────────────────────────────
//  TacticalView.jsx  —  Tactical Meeting
//  Same design system as ListAdmin / PerformanceList
// ─────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getTacticalparticipantsbyuserid,
  getTacticalperformacepercentagebyuserid,
  fetchActiveEmployee,
} from "../../../config/config";
import ApiService from "../../../services/ApiService";
import { getToken, isAdmin, getUserId, ishod } from "../../../services/useLocalStorage";
import { MeetingRoute } from "../../../config/RouteConfig";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import TacticalModal from "./Components/TacticalModal";
import { MdOutlineArrowBackIos } from "react-icons/md";

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

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }
  @keyframes tvFadeIn {
    from { opacity:0; transform:translateY(8px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .tv-fade { animation: tvFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes tvSpin { to { transform: rotate(360deg); } }
  .tv-spinner {
    width:28px; height:28px; border-radius:50%;
    border:3px solid ${THEME.brandLight};
    border-top-color:${THEME.brand};
    animation:tvSpin 0.8s linear infinite;
  }
  .tv-top-grid {
    display:grid; grid-template-columns:1fr 170px 170px; gap:16px;
  }
  .tv-outcome-grid {
    display:grid; grid-template-columns:1fr 1fr; gap:14px;
  }
  .tv-reflection-grid {
    display:grid; grid-template-columns:1fr 1fr; gap:14px;
  }
  .tv-stats-grid {
    display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;
  }
  @media(max-width:960px){ .tv-top-grid{ grid-template-columns:1fr !important; } }
  @media(max-width:700px){
    .tv-outcome-grid, .tv-reflection-grid { grid-template-columns:1fr !important; }
    .tv-stats-grid { grid-template-columns:1fr !important; }
  }
  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background:${THEME.brandLight}; }
  ::-webkit-scrollbar-thumb { background:${THEME.brandMid}; border-radius:10px; }
`;


// ─────────────────────────────────────────────
//  🧩  ATOMS
// ─────────────────────────────────────────────

function Card({ children, style }) {
  return (
    <div style={{
      background: "#fff", border: `1px solid ${THEME.border}`,
      borderRadius: 14, padding: "20px 22px",
      boxShadow: "0 2px 10px rgba(136,117,73,0.06)", ...style,
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
      <div style={{ width: 3, height: 18, borderRadius: 2, background: `linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
      <h2 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: THEME.brand, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "'Sora',sans-serif" }}>
        {children}
      </h2>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${THEME.border}` }}>
      <span style={{ fontSize: 12, color: THEME.textMuted, fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 13, color: THEME.text, fontWeight: 600 }}>{value || "—"}</span>
    </div>
  );
}

function StatTile({ label, value, unit = "%" }) {
  return (
    <div style={{ background: THEME.brandLight, border: `1px solid #D4C4A0`, borderRadius: 12, padding: "14px 18px", textAlign: "center" }}>
      <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 600, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
      <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: THEME.brand, fontFamily: "'Sora',sans-serif" }}>
        {value ?? 0}<span style={{ fontSize: 12, fontWeight: 600 }}>{unit}</span>
      </p>
    </div>
  );
}

/** Coloured task count tile (Goal / Done / Not Done) */
function TaskCountTile({ label, value, color, bg, border }) {
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
      <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 600, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
      <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color, fontFamily: "'Sora',sans-serif" }}>{value ?? "—"}</p>
    </div>
  );
}

/** Rich-text section panel */
function RichPanel({ title, html, accent = THEME.brand }) {
  return (
    <div style={{ background: `${accent}0E`, border: `1px solid ${accent}33`, borderRadius: 12, padding: "14px 16px" }}>
      <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.06em" }}>{title}</p>
      {html ? (
        <div style={{ fontSize: 13, color: THEME.text, lineHeight: 1.65 }} dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <p style={{ margin: 0, fontSize: 12, color: THEME.textLight, fontStyle: "italic" }}>Not filled yet</p>
      )}
    </div>
  );
}

/** Edit pencil button */
function EditBtn({ onClick, disabled }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={disabled ? "Already filled" : "Edit"}
      style={{
        width: 32, height: 32, borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer",
        background: disabled ? "#F5F5F5" : hov ? THEME.brandLight : "#fff",
        border: `1.5px solid ${disabled ? "#E8E8E8" : hov ? THEME.brand : "#E0D5C5"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: disabled ? THEME.textLight : THEME.brand,
        transition: "all 0.15s", opacity: disabled ? 0.5 : 1,
      }}
    >
      <FontAwesomeIcon icon={faPencil} style={{ fontSize: 12 }} />
    </button>
  );
}

/** Inline stat pill shown in card header */
function MetaPill({ label, value, color }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: `${color}14`, color, border: `1px solid ${color}44`,
    }}>
      <span style={{ fontWeight: 400, color: THEME.textMuted }}>{label}:</span>
      <b>{value ?? "—"}</b>
    </span>
  );
}


// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
function TacticalView() {
  const navigate = useNavigate();
  const params   = useParams();

  const [loading,          setLoading]          = useState(false);
  const [performance,      setPerformance]      = useState([]);
  const [name,             setName]             = useState({});
  const [perfPct,          setPerfPct]          = useState({});
  const [ontime,           setOntime]           = useState({});
  const [percentage,       setPercentage]       = useState(0);
  const [emp,              setEmp]              = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(params.id || "");
  const [showModal,        setShowModal]        = useState(false);
  const [editId,           setEditId]           = useState("");

  const authHeader = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };

  // ── API ───────────────────────────────────

  const fetchAll = async (empId) => {
    if (!empId) return;
    setLoading(true);
    try {
      const [meetRes, pctRes] = await Promise.all([
        ApiService(null, empId, authHeader, getTacticalparticipantsbyuserid.method, getTacticalparticipantsbyuserid.url),
        ApiService(null, empId, authHeader, getTacticalperformacepercentagebyuserid.method, getTacticalperformacepercentagebyuserid.url),
      ]);
      if (!meetRes.data.error) setPerformance(meetRes.data.data || []);
      if (!pctRes.data.error) {
        setName(pctRes.data.data.namestats || {});
        setPerfPct(pctRes.data.data.taskstats || {});
        setOntime(pctRes.data.data.ontimestats || {});
        setPercentage(pctRes.data.data.taskstats?.completed_percentage ?? 0);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const getEmployees = async () => {
    try {
      const h = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService(null, 0, h, fetchActiveEmployee.method, fetchActiveEmployee.url);
      if (!res.data.error) {
        setEmp((res.data.data || []).map((m) => ({ value: m.id, label: `${m.first_name} ${m.last_name}` })));
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { if (params.id) setSelectedEmployee(params.id); }, [params.id]);
  useEffect(() => { fetchAll(selectedEmployee); }, [selectedEmployee]);
  useEffect(() => { if (isAdmin()) getEmployees(); }, []);

  // ── Edit permission helper ────────────────

  const canEdit = (item) => {
    const allFilled = item.key_highlight && item.key_action &&
      item.what_missing && item.what_learn && item.what_different && item.what_done_when;
    if (isAdmin()) return true;
    if (!isAdmin() && item.user_id === getUserId()) return !allFilled;
    if (!isAdmin() && ishod() && item.user_id !== getUserId()) return !allFilled;
    return false;
  };

  const isEditDisabled = (item) =>
    !!(item.key_highlight && item.key_action &&
      item.what_missing && item.what_learn && item.what_different && item.what_done_when);

  // ── Pie data ──────────────────────────────

  const pieData = {
    labels: ["Good Work", "Try Hard"],
    datasets: [{
      data: [perfPct.completed_percentage, perfPct.uncompleted_percentage],
      backgroundColor: [THEME.brandLight, "#FFF7E6"],
      borderColor:     [THEME.brand, "#D46B08"],
      borderWidth: 2,
    }],
  };

  // ── Render ────────────────────────────────

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div style={{ minHeight: "100vh",  fontFamily: "'DM Sans',sans-serif", padding: "28px 24px" }}>

        {/* ── Page Header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => navigate(`/${MeetingRoute.tacticalview}`)} style={{
              width: 36, height: 36, borderRadius: 10, cursor: "pointer",
              background: THEME.brandLight, border: `1px solid #D4C4A0`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: THEME.brand, fontSize: 14,
            }}>
              <MdOutlineArrowBackIos />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 4, height: 26, borderRadius: 3, background: `linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: THEME.text, fontFamily: "'Sora',sans-serif", letterSpacing: "-0.3px" }}>
                Tactical Meeting
              </h1>
            </div>
          </div>

          {/* Employee selector — admin only */}
          {isAdmin() && (
            <select value={selectedEmployee}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedEmployee(id);
                if (id) navigate(`/${MeetingRoute.tacticalperformancelist}/${id}`, { replace: true });
              }}
              style={{ padding: "8px 14px", borderRadius: 10, fontSize: 13, border: "1.5px solid #E0D5C5", fontFamily: "'DM Sans',sans-serif", color: THEME.text, outline: "none", background: "#fff", minWidth: 190 }}
              onFocus={(e) => { e.target.style.borderColor = THEME.brand; }}
              onBlur={(e)  => { e.target.style.borderColor = "#E0D5C5"; }}
            >
              <option value="">Select Employee</option>
              {emp.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0", gap: 16 }}>
            <div className="tv-spinner" />
            <p style={{ color: THEME.textLight, fontSize: 13, margin: 0 }}>Loading…</p>
          </div>
        )}

        {!loading && (
          <div className="tv-fade">

            {/* ── Top Row: Personal Details + Charts ── */}
            <div className="tv-top-grid" style={{ marginBottom: 16 }}>

              {/* Personal details */}
              <Card>
                <SectionTitle>Personal Details</SectionTitle>
                <DetailRow label="Name"        value={`${name.first_name || ""} ${name.last_name || ""}`.trim()} />
                <DetailRow label="Department"  value={name.departmentName} />
                <DetailRow label="Designation" value={name.RolesName} />
                <DetailRow label="Overall"     value="Good" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
                  <StatTile label="Task Completion" value={ontime?.completed_percentage} />
                  <StatTile label="On-Time Ratio"   value={ontime?.on_time} />
                </div>
              </Card>

              {/* Circular progress */}
              <Card style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Task %
                </p>
                <div style={{ width: 120 }}>
                  <CircularProgressbar
                    value={percentage ?? 0}
                    text={`${percentage ?? 0}%`}
                    styles={buildStyles({
                      textColor:  THEME.brandDark,
                      pathColor:  THEME.brand,
                      trailColor: THEME.brandLight,
                      textSize:   "18px",
                    })}
                  />
                </div>
              </Card>

              {/* Pie chart */}
              <Card style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 150 }}>
                  <Pie data={pieData}
                    options={{ plugins: { legend: { position: "bottom", labels: { font: { size: 11 }, color: "#595959" } } } }}
                  />
                </div>
              </Card>
            </div>

            {/* ── Performance Cards ── */}
            <Card>
              <SectionTitle>Performance Details</SectionTitle>

              {performance.length === 0 && (
                <div style={{ textAlign: "center", padding: "48px 0" }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📊</div>
                  <p style={{ color: THEME.textLight, fontSize: 13, margin: 0 }}>No performance data available.</p>
                </div>
              )}

              {performance.map((item) => {
                const editDisabled = isEditDisabled(item);
                const showEdit     = isAdmin()
                  ? true
                  : (!isAdmin() && item.user_id === getUserId())
                  ? true
                  : (!isAdmin() && ishod() && item.user_id !== getUserId())
                  ? true
                  : false;

                return (
                  <div key={item.id} style={{
                    border: `1px solid ${THEME.border}`, borderRadius: 14,
                    marginBottom: 16, overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(136,117,73,0.05)",
                  }}>

                    {/* Card header — date + meta + edit */}
                    <div style={{
                      background: THEME.brandLight, padding: "12px 18px",
                      display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10,
                      borderBottom: `1px solid ${THEME.border}`,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: THEME.brandDark, fontFamily: "'Sora',sans-serif" }}>
                          {new Date(item.date).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })}
                        </p>
                        <MetaPill label="On Time"        value={item.on_time}             color={THEME.brand} />
                        <MetaPill label="Task %"         value={item.on_time_task_comp_per} color="#2F54EB"   />
                      </div>
                      {showEdit && (
                        <EditBtn
                          onClick={() => { if (!editDisabled || isAdmin()) handleShowModal(item.id); }}
                          disabled={editDisabled && !isAdmin()}
                        />
                      )}
                    </div>

                    <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}>

                      {/* Outcome: Key Highlight + Key Action */}
                      <div>
                        <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: "#00796B", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          Outcomes
                        </p>
                        <div className="tv-outcome-grid">
                          <RichPanel title="Key Highlight" html={item.key_highlight} accent="#00796B" />
                          <RichPanel title="Key Action"    html={item.key_action}    accent="#00796B" />
                        </div>
                      </div>

                      {/* Task Stats: Goal / Done / Not Done */}
                      <div>
                        <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: THEME.brand, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          Task Summary
                        </p>
                        <div className="tv-stats-grid">
                          <TaskCountTile label="What Was the Goal?"  value={item.total_task}             color="#2F54EB" bg="#F0F5FF" border="#ADC6FF" />
                          <TaskCountTile label="What Is Done?"       value={item.total_completed_tasks}  color="#389E0D" bg="#F6FFED" border="#B7EB8F" />
                          <TaskCountTile label="What Is Not Done?"   value={item.total_uncompleted_tasks} color="#CF1322" bg="#FFF1F0" border="#FFA39E" />
                        </div>
                      </div>

                      {/* Reflection row 1 */}
                      <div>
                        <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: "#D46B08", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          Reflection
                        </p>
                        <div className="tv-reflection-grid">
                          <RichPanel title="What was missing from your end?" html={item.what_missing}  accent="#D46B08" />
                          <RichPanel title="What did you learn?"             html={item.what_learn}    accent="#D46B08" />
                        </div>
                      </div>

                      {/* Reflection row 2 */}
                      <div className="tv-reflection-grid">
                        <RichPanel title="What will be different from your end?" html={item.what_different} accent="#5C4E32" />
                        <RichPanel title="What will be done and by when?"        html={item.what_done_when} accent="#5C4E32" />
                      </div>

                    </div>
                  </div>
                );
              })}
            </Card>
          </div>
        )}
      </div>

      <TacticalModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        id={editId}
        meetingId={params.id}
      />
    </>
  );

  function handleShowModal(id) {
    setEditId(id);
    setShowModal(true);
  }
}

export default TacticalView;



































// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   getTacticalparticipantsbyuserid,
//   getTacticalperformacepercentagebyuserid,
//     fetchActiveEmployee,
// } from "../../../config/config";
// import ApiService from "../../../services/ApiService";
// import {
//   getToken,
//   isAdmin,
//   getUserId,
//   ishod,
// } from "../../../services/useLocalStorage";
// import { MeetingRoute } from "../../../config/RouteConfig";
// import { Pie } from "react-chartjs-2";
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
// import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
// import "react-circular-progressbar/dist/styles.css";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faPencil } from "@fortawesome/free-solid-svg-icons";
// import TacticalModal from "./Components/TacticalModal";
// import { MdOutlineArrowBackIos } from "react-icons/md";
// ChartJS.register(ArcElement, Tooltip, Legend);

// function TacticalView() {
//   const navigate = useNavigate();
//   const params = useParams();

//   const header = {
//     Authorization: `Bearer ${getToken()}`,
//     ["Content-Type"]: "application/json",
//   };

//   const [showModal, setShowModal] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [editId, setEditId] = useState("");
//   const [percentage, setPercentage] = useState(0);
//   const [name, setName] = useState([]);
//   const [performnacePercentage, setPerformancePercentage] = useState(0);
//   const [ontime, setOnTime] = useState(0);
//   const [performance, setPerformance] = useState([]);
//     const [selectedEmployee, setSelectedEmployee] = useState(params.id || "");
//       const [emp, setEmp] = useState([]);

//   const handleShowModal = (id) => {
//     setEditId(id);
//     setShowModal(true);
//   };
//   const handleCloseModal = () => setShowModal(false);

//     const getEmployees = async () => {
//     try {
//       setLoading(true);
//       const header = { Authorization: `Bearer ${getToken()}` };
//       const res = await ApiService(
//         null,
//         0,
//         header,
//         fetchActiveEmployee.method,
//         fetchActiveEmployee.url,
//       );

//       if (!res.data.error) {
//         setLoading(false);
//         const payload = res.data?.data;
//         const options = payload.map((member) => ({
//           value: member.id,
//           label: `${member.first_name} ${member.last_name}`,
//         }));

//         setEmp(options);
//       } else {
//         setLoading(false);
//       }
//     } catch (err) {
//       setLoading(false);
//       console.log(err);
//     }
//   };

//   const fetchMeeting = async (employeeId) => {
//     try {
//       setLoading(true);
//       const res = await ApiService(
//         null,
//         employeeId || selectedEmployee,
//         header,
//         getTacticalparticipantsbyuserid.method,
//         getTacticalparticipantsbyuserid.url
//       );
//       if (!res.data?.error) {
//         setLoading(false);

//         const payload = res?.data?.data;

//         setPerformance(payload);
//       } else {
//         setLoading(false);
//       }
//     } catch (err) {
//       setLoading(false);

//       console.log(err);
//     }
//   };

//   const fetchTaskPercentage = async (employeeId) => {
//     try {
//       setLoading(true);
//       const res = await ApiService(
//         null,
//           employeeId || selectedEmployee,
//         header,
//         getTacticalperformacepercentagebyuserid.method,
//         getTacticalperformacepercentagebyuserid.url
//       );
//       if (!res.data?.error) {
//         setLoading(false);

//         setName(res.data.data.namestats);
//         setPerformancePercentage(res?.data?.data.taskstats);
//         setOnTime(res.data.data.ontimestats);

//         setPercentage(res?.data?.data.taskstats.completed_percentage);
//       } else {
//         setLoading(false);
//       }
//     } catch (err) {
//       setLoading(false);

//       console.log(err);
//     }
//   };

//    useEffect(() => {
//     if (params.id) {
//       setSelectedEmployee(params.id);
//     }
//   }, [params.id]);

//     useEffect(() => {
//     if (selectedEmployee) {
//       fetchMeeting(selectedEmployee);
//       fetchTaskPercentage(selectedEmployee);
//     }
//   }, [selectedEmployee]);

//     useEffect(() => {
//     if (isAdmin()) {
//       getEmployees();
//     }
//   }, []);


//   const Piedata = {
//     labels: ["Good Work", "Try Hard"],
//     datasets: [
//       {
//         label: "# of Votes",
//         data: [
//           performnacePercentage?.completed_percentage,
//           performnacePercentage?.uncompleted_percentage,
//         ],
//         backgroundColor: ["rgba(75, 192, 192, 0.2)", "rgba(255, 159, 64, 0.2)"],
//         borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 159, 64, 1)"],
//         borderWidth: 1,
//       },
//     ],
//   };
//   const handleback = () => {
//  navigate(`/${MeetingRoute.tacticalview}`);
//   };

//       const handleEmployeeChange = (e) => {
//     const employeeId = e.target.value;
//     setSelectedEmployee(employeeId);
    
//     // Update URL with new employee ID
//     if (employeeId) {
//       navigate(`/${MeetingRoute.tacticalperformancelist}/${employeeId}`, { replace: true });
//     }
//   };

//   return (
//     <>
//       <div className="content__wrapper">
//         <section className="page-content">
         
//           <div className="row">
//             <div className="col-md-12">
//               <div className="zed__table">
//                 <div className="d-flex aign-items-center justify-content-between">
//                   <h5 className="text-shadow-yellow px-2 mb-4">
//                     <button
//                       className="bg-transparent border-0"
//                       onClick={handleback}
//                     >
//                       <MdOutlineArrowBackIos />
//                     </button>{" "}
//                     Tactical Meeting
//                   </h5>
//                 </div>
//                          {(isAdmin()) && (
//                   <div className="col-lg-2 col-md-6 col-12 my-3">
//                     <select
//                       name="dropdown"
//                       id="dropdown"
//                       className="form-control appearance-auto"
//                       value={selectedEmployee}
//                       onChange={handleEmployeeChange}
//                     >
//                       <option value="">Select Team</option>
//                       {emp.map((item) => (
//                         <option key={item.value} value={item.value}>
//                           {item.label}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 )}
//                 <div className="row">
//                   <div className="col-xl-6 col-md-12 mb-lg-0 mb-3">
//                     <div className="main_team_box grey_bg">
//                       <div class="team_header">
//                         <h3 className="gery_bg_heading">Personal Details</h3>
//                       </div>
//                       <div className="team_body">
//                         <div className="row">
//                           <div className="col-lg-6">
//                             <div className="personal_row d-flex align-items-center justify-content-between">
//                               <span className="key">Name</span>
//                               <span className="value">
//                                 {" "}
//                                 {name.first_name} {name.last_name}
//                               </span>
//                             </div>
//                           </div>
//                           <div className="col-lg-6">
//                             <div className="personal_row d-flex align-items-center justify-content-between">
//                               <span className="key">Department</span>
//                               <span className="value">{name.departmentName}</span>
//                             </div>
//                           </div>
//                         </div>
//                         <div className="row">
//                           <div className="col-lg-6">
//                             <div className="personal_row d-flex align-items-center justify-content-between">
//                               <span className="key">Overall Performance:</span>
//                               <span className="value">Good</span>
//                             </div>
//                           </div>
//                            <div className="col-lg-6">
//                             <div className="personal_row d-flex align-items-center justify-content-between">
//                               <span className="key">Designation:</span>
//                               <span className="value">{name?.RolesName}</span>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="row mt-3 ">
//                       <div className="col-lg-6">
//                         <div className="grey_bg tasks_box">
//                           <p>Task Completion Ratio</p>
//                           <h3>{ontime?.completed_percentage}%</h3>
//                         </div>
//                       </div>
//                       <div className="col-lg-6">
//                         <div className="grey_bg tasks_box">
//                           <p>On Time ratio</p>
//                           <h3>{ontime?.on_time}%</h3>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="col-xl-3 col-md-6 col-12">
//                     <div className="chart_main_box grey_bg d-flex align-items-center justify-content-center">
//                       <p>Task Percentage</p>
//                       <CircularProgressbar
//                         value={percentage}
//                         text={`${percentage}%`}
//                         className="w-75"
//                         styles={buildStyles({
//                           textColor: "#000",
//                           pathColor: "#4caf50",
//                           trailColor: "#d6d6d6",
//                         })}
//                       />
//                     </div>
//                   </div>
//                   <div className="col-xl-3 col-md-6 col-12">
//                     <div className="chart_main_box grey_bg pie_canvas">
//                       <Pie data={Piedata} />
//                     </div>
//                   </div>
//                 </div>
//                 <div className="row mt-3">
//                   <div className="grey_bg tasks_box">
//                     <div>
//                       <h5 className="text-shadow-yellow px-2 mb-4">
//                         Performance Details
//                       </h5>
//                       {performance?.map((item, index) => (
//                         <div key={item.id} className="col-lg-12">
//                           <div className="main_card_meeting">
//                             <div className="main_card_heading">
//                               <div className="main_icon_box">
//                                 <div className="role_and_name d-flex ">
//                                   <p className="usename">
//                                     {new Date(item.date).toLocaleDateString(
//                                       "en-GB",
//                                       {
//                                         year: "numeric",
//                                         month: "short",
//                                         day: "numeric",
//                                       }
//                                     )}
//                                   </p>
                                  
//                                   <span className="mx-2 ms-3">On Time : <b>{item?.on_time}</b></span>
//                                   <span className="mx-2">Task Percentage : <b>{item?.on_time_task_comp_per}</b></span>
//                                 </div>
//                                 <div className="arrow_icon">
//                                   {" "}
//                                   {isAdmin() && (
//                                     <>
//                                       <button className="edit_view edit_btn">
//                                         <FontAwesomeIcon
//                                           icon={faPencil}
//                                           onClick={() =>
//                                             handleShowModal(item.id)
//                                           }
//                                         />
//                                       </button>
//                                     </>
//                                   )}
//                                   <>
//                                     {!isAdmin() &&
//                                       item.user_id === getUserId() && (
//                                         <>
//                                           <button
//                                             className="edit_view edit_btn"
//                                             onClick={() => {
//                                               if (
//                                                 !item.key_highlight &&
//                                                 !item.key_action &&
//                                                 !item.what_missing &&
//                                                 !item.what_learn &&
//                                                 !item.what_different &&
//                                                 !item.what_done_when
//                                               ) {
//                                                 handleShowModal(item.id);
//                                               }
//                                             }}
//                                             disabled={
//                                               item.key_highlight ||
//                                               item.key_action ||
//                                               item.what_missing ||
//                                               item.what_learn ||
//                                               item.what_different ||
//                                               item.what_done_when
//                                             }
//                                           >
//                                             <FontAwesomeIcon icon={faPencil} />
//                                           </button>
//                                         </>
//                                       )}
//                                     {!isAdmin() &&
//                                       ishod() &&
//                                       item.user_id !== getUserId() && (
//                                         <>
//                                           <button
//                                             className="edit_view edit_btn"
//                                             onClick={() => {
//                                               if (
//                                                 !item.key_highlight &&
//                                                 !item.key_action &&
//                                                 !item.what_missing &&
//                                                 !item.what_learn &&
//                                                 !item.what_different &&
//                                                 !item.what_done_when
//                                               ) {
//                                                 handleShowModal(item.id);
//                                               }
//                                             }}
//                                             disabled={
//                                               item.key_highlight ||
//                                               item.key_action ||
//                                               item.what_missing ||
//                                               item.what_learn ||
//                                               item.what_different ||
//                                               item.what_done_when
//                                             }
//                                           >
//                                             <FontAwesomeIcon icon={faPencil} />
//                                           </button>
//                                         </>
//                                       )}
//                                   </>
//                                 </div>
//                               </div>
//                             </div>
//                             <div className="main_highlight_box">
//                               <div className="d-flex align-items-center justify-content-between">
//                                 <span className="outcome_title">Outcome</span>
//                               </div>
//                               <div className="row">
//                                 <div className="col-lg-6">
//                                   <h6 className="key_box_title">
//                                     Key Highlight
//                                   </h6>
//                                   <div
//                                     className="rich-text-content"
//                                     dangerouslySetInnerHTML={{
//                                       __html: item?.key_highlight,
//                                     }}
//                                   />
//                                 </div>
//                                 <div className="col-lg-6">
//                                   <h6 className="key_box_title">Key Action</h6>
//                                   <div
//                                     className="rich-text-content"
//                                     dangerouslySetInnerHTML={{
//                                       __html: item?.key_action,
//                                     }}
//                                   />
//                                 </div>
//                               </div>
//                             </div>
//                             <div className="row">
//                               <div className="col-lg-12">
//                                 <div className="d-md-flex">
//                                   <div className="task_box col-lg-4">
//                                     <h5 className="key_box_title">
//                                       What Was the Goal?
//                                     </h5>
//                                     <span className="task_total text-primary">
//                                       {item.total_task}
//                                     </span>
//                                   </div>
//                                   <div className="task_box col-lg-4">
//                                     <h5 className="key_box_title">
//                                       What is Done?
//                                     </h5>
//                                     <span className="task_total text-success">
//                                       {item.total_completed_tasks}
//                                     </span>
//                                   </div>
//                                   <div className="task_box col-lg-4">
//                                     <h5 className="key_box_title">
//                                       What Is not done?
//                                     </h5>
//                                     <span className="task_total text-danger">
//                                       {item.total_uncompleted_tasks}
//                                     </span>
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>
//                             <div className="row">
//                               <div className="col-lg-12">
//                                 <div className="d-md-flex">
//                                   <div className="task_box col-lg-6">
//                                     <h5 className="key_box_title">
//                                       What was missing from your end?
//                                     </h5>
//                                     <div
//                                       className="rich-text-content"
//                                       dangerouslySetInnerHTML={{
//                                         __html: item?.what_missing,
//                                       }}
//                                     />
//                                   </div>
//                                   <div className="task_box col-lg-6">
//                                     <h5 className="key_box_title">
//                                       What did you learn?
//                                     </h5>
//                                     <div
//                                       className="rich-text-content"
//                                       dangerouslySetInnerHTML={{
//                                         __html: item?.what_learn,
//                                       }}
//                                     />
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>
//                             <div className="row">
//                               <div className="col-lg-12">
//                                 <div className="d-md-flex">
//                                   <div className="task_box col-lg-6">
//                                     <h5 className="key_box_title">
//                                       What will be different from your end?
//                                     </h5>
//                                     <div
//                                       className="rich-text-content"
//                                       dangerouslySetInnerHTML={{
//                                         __html: item?.what_different,
//                                       }}
//                                     />
//                                   </div>
//                                   <div className="task_box col-lg-6">
//                                     <h5 className="key_box_title">
//                                       What will be done and by when?
//                                     </h5>
//                                     <div
//                                       className="rich-text-content"
//                                       dangerouslySetInnerHTML={{
//                                         __html: item?.what_done_when,
//                                       }}
//                                     />
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>
//       </div>

//       <TacticalModal
//         show={showModal}
//         handleClose={handleCloseModal}
//         id={editId}
//         meetingId={params.id}
//       />
//     </>
//   );
// }

// export default TacticalView;
