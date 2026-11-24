// ─────────────────────────────────────────────
//  StrategicPerformanceList.jsx  —  Strategic Meeting
//  Same design system as TacticalView / PerformanceList
// ─────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getStrategicparticipantsbyuserid,
  getstrategicperformacepercentagebyuserid,
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
import StrategicModal from "./Components/StrategicModal";
import StrategicTaskViewModal from "./Components/StrategicTaskViewModal";
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
  @keyframes spFadeIn {
    from { opacity:0; transform:translateY(8px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .sp-fade { animation: spFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes spSpin { to { transform: rotate(360deg); } }
  .sp-spinner {
    width:28px; height:28px; border-radius:50%;
    border:3px solid ${THEME.brandLight};
    border-top-color:${THEME.brand};
    animation:spSpin 0.8s linear infinite;
  }
  .sp-top-grid      { display:grid; grid-template-columns:1fr 170px 170px; gap:16px; }
  .sp-stats-grid    { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; }
  .sp-reflect-grid  { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  @media(max-width:960px){ .sp-top-grid { grid-template-columns:1fr !important; } }
  @media(max-width:700px){
    .sp-stats-grid   { grid-template-columns:1fr !important; }
    .sp-reflect-grid { grid-template-columns:1fr !important; }
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

function StatTile({ label, value }) {
  return (
    <div style={{ background: THEME.brandLight, border: `1px solid #D4C4A0`, borderRadius: 12, padding: "14px 18px", textAlign: "center" }}>
      <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 600, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
      <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: THEME.brand, fontFamily: "'Sora',sans-serif" }}>
        {value ?? 0}<span style={{ fontSize: 12, fontWeight: 600 }}>%</span>
      </p>
    </div>
  );
}

/** Coloured task count tile — Goal tile is clickable */
function TaskCountTile({ label, value, color, bg, border, onClick }) {
  const [hov, setHov] = useState(false);
  const clickable = !!onClick;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => clickable && setHov(true)}
      onMouseLeave={() => clickable && setHov(false)}
      style={{
        background: hov ? bg.replace("FF", "EE") : bg,
        border: `1px solid ${hov ? color : border}`,
        borderRadius: 12, padding: "14px 16px", textAlign: "center",
        cursor: clickable ? "pointer" : "default",
        transition: "all 0.15s",
        transform: hov ? "translateY(-2px)" : "none",
        boxShadow: hov ? `0 4px 12px ${color}22` : "none",
      }}
    >
      <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 600, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
        {clickable && <span style={{ marginLeft: 4, fontSize: 10, color: color }}>↗</span>}
      </p>
      <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color, fontFamily: "'Sora',sans-serif" }}>{value ?? "—"}</p>
    </div>
  );
}

/** Rich-text panel */
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
      onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
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

/** Inline meta pill in card header */
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
function StrategicPerformanceList() {
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

  const [showModal,     setShowModal]     = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editId,        setEditId]        = useState("");

  const authHeader = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };

  // ── API ───────────────────────────────────

  const fetchAll = async (empId) => {
    if (!empId) return;
    setLoading(true);
    try {
      const [meetRes, pctRes] = await Promise.all([
        ApiService(null, empId, authHeader, getStrategicparticipantsbyuserid.method, getStrategicparticipantsbyuserid.url),
        ApiService(null, empId, authHeader, getstrategicperformacepercentagebyuserid.method, getstrategicperformacepercentagebyuserid.url),
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

  // ── Edit permission helpers ───────────────

  const isEditDisabled = (item) =>
    !!(item.what_did_u_well || item.what_did_u_not_well || item.what_can_u_do_diff);

  const showEditBtn = (item) =>
    isAdmin() ||
    (!isAdmin() && item.user_id === getUserId()) ||
    (!isAdmin() && ishod() && item.user_id !== getUserId());

  const handleEdit = (item) => {
    if (isAdmin() || !isEditDisabled(item)) {
      setEditId(item.id);
      setShowModal(true);
    }
  };

  // ── Pie chart ────────────────────────────

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
            <button onClick={() => navigate(`/${MeetingRoute.strategicview}`)} style={{
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
                Monthly Review Meeting
              </h1>
            </div>
          </div>

          {/* Employee selector — admin only */}
          {isAdmin() && (
            <select value={selectedEmployee}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedEmployee(id);
                if (id) navigate(`/${MeetingRoute.startegicperformancelist}/${id}`, { replace: true });
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
            <div className="sp-spinner" />
            <p style={{ color: THEME.textLight, fontSize: 13, margin: 0 }}>Loading…</p>
          </div>
        )}

        {!loading && (
          <div className="sp-fade">

            {/* ── Top Row ── */}
            <div className="sp-top-grid" style={{ marginBottom: 16 }}>
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

              <Card style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Task %</p>
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

                return (
                  <div key={item.id} style={{
                    border: `1px solid ${THEME.border}`, borderRadius: 14,
                    marginBottom: 16, overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(136,117,73,0.05)",
                  }}>

                    {/* Card header */}
                    <div style={{
                      background: THEME.brandLight, padding: "12px 18px",
                      display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10,
                      borderBottom: `1px solid ${THEME.border}`,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: THEME.brandDark, fontFamily: "'Sora',sans-serif" }}>
                          {new Date(item.date).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })}
                        </p>
                        <MetaPill label="On Time" value={item.on_time}              color={THEME.brand} />
                        <MetaPill label="Task %"  value={item.on_time_task_comp_per} color="#2F54EB"   />
                      </div>
                      {showEditBtn(item) && (
                        <EditBtn
                          onClick={() => handleEdit(item)}
                          disabled={editDisabled && !isAdmin()}
                        />
                      )}
                    </div>

                    <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}>

                      {/* Task Summary */}
                      <div>
                        <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: THEME.brand, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          Task Summary
                        </p>
                        <div className="sp-stats-grid">
                          <TaskCountTile
                            label="What Was the Goal?"
                            value={item.total_task}
                            color="#2F54EB" bg="#F0F5FF" border="#ADC6FF"
                            onClick={() => { setEditId(item.user_id); setShowTaskModal(true); }}
                          />
                          <TaskCountTile
                            label="What Is Done?"
                            value={item.total_completed_tasks}
                            color="#389E0D" bg="#F6FFED" border="#B7EB8F"
                          />
                          <TaskCountTile
                            label="What Is Not Done?"
                            value={item.total_uncompleted_tasks}
                            color="#CF1322" bg="#FFF1F0" border="#FFA39E"
                          />
                        </div>
                      </div>

                      {/* Self-assessment */}
                      <div>
                        <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: "#00796B", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          Self-Assessment
                        </p>
                        <div className="sp-reflect-grid">
                          <RichPanel title="What you did well?"     html={item.what_did_u_well}     accent="#389E0D" />
                          <RichPanel title="What you did NOT well?" html={item.what_did_u_not_well} accent="#CF1322" />
                        </div>
                      </div>

                      {/* Improvement */}
                      <div>
                        <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: "#D46B08", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          Improvement
                        </p>
                        <RichPanel
                          title="What can you do differently?"
                          html={item.what_can_u_do_diff}
                          accent="#D46B08"
                        />
                      </div>

                    </div>
                  </div>
                );
              })}
            </Card>
          </div>
        )}
      </div>

      <StrategicModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        id={editId}
        meetingId={params.id}
      />
      <StrategicTaskViewModal
        show={showTaskModal}
        handleClose={() => setShowTaskModal(false)}
        id={editId}
      />
    </>
  );
}

export default StrategicPerformanceList;