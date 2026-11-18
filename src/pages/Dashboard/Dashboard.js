
import React, { useEffect, useMemo, useState, memo } from "react";
import {
  fetchdashboardData,
  dashboardInfoForTeam,
  getNotification,
  getNotification_admin,
  getNotification_employee,
  fetchsourcebyclient,
  SendToSeenNotification,
  fetchdashboardtaskforAdmin,
} from "../../config/config";
import { adminKey, empKey, subadmin } from "../../config/RoleConfig";
import ApiService from "../../services/ApiService";
import {
  getRole,
  getToken,
  isEmp,
  superAccess,
} from "../../services/useLocalStorage";
import toast from "react-hot-toast";
import { defaultuserpic, FileUrl, host_name } from "../../config/file_url";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import {
  CustRoute,
  DepositExpenseRoute,
  AttendanceRoute,
  EmpRoute,
  SiteRoute,
  TodosRoute,
  FileExpenseRoute,
  OfficeExpenseRoute,
  ApprovalRoute,
  TentativeRoute,
  InteriorRoute,
  ArchitectureRoute,
} from "../../config/RouteConfig";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthHeader } from "../../services/FormCommon";
import StatusModal from "../MainPages/Todo/StatusModal";
import CounterDataModal from "../MainPages/Todo/CounterDataModal";
ChartJS.register(ArcElement, Tooltip, Legend);

// ─────────────────────────────────────────────
//  🎨  THEME
// ─────────────────────────────────────────────
const THEME = {
  brand: "#887549",
  brandLight: "#F5F0E8",
  brandMid: "#C4A97D",
  brandDark: "#5C4E32",
  bg: "#F8F5F0",
  border: "#EDE5D5",
  text: "#1A1A2E",
  textMuted: "#ADADAD",
  textLight: "#BDBDBD",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing:border-box; }
  @keyframes dbFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .db-fade { animation:dbFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes dbSpin { to{transform:rotate(360deg)} }
  .db-spinner { width:28px;height:28px;border-radius:50%;border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};animation:dbSpin 0.8s linear infinite; }

  /* ── Stat Cards ── */
  .db-stat-card {
    background:#fff;border:1.5px solid ${THEME.border};border-radius:16px;
    padding:20px;cursor:pointer;transition:all 0.2s;
    box-shadow:0 2px 10px rgba(136,117,73,0.06);
  }
  .db-stat-card:hover { border-color:${THEME.brand};box-shadow:0 6px 24px rgba(136,117,73,0.14);transform:translateY(-2px); }

  /* ── Progress ── */
  .db-progress-track { width:100%;height:7px;border-radius:10px;background:#F0EBE0;overflow:hidden; }
  .db-progress-fill  { height:100%;border-radius:10px;background:linear-gradient(90deg,${THEME.brand},${THEME.brandMid});transition:width 0.6s ease; }

  /* ── Dept cards ── */
  .db-dept-card {
    background:#fff;border:1.5px solid ${THEME.border};border-radius:16px;overflow:hidden;
    box-shadow:0 2px 10px rgba(136,117,73,0.06);transition:all 0.2s;height:100%;
  }
  .db-dept-card:hover { border-color:${THEME.brand};box-shadow:0 6px 24px rgba(136,117,73,0.14); }
  .db-dept-header {
    padding:14px 18px;background:linear-gradient(135deg,${THEME.brandLight} 0%,#FDF7F0 100%);
    border-bottom:1px solid ${THEME.border};display:flex;align-items:center;justify-content:space-between;
  }
  .db-mini-box {
    background:${THEME.bg};border:1px solid ${THEME.border};border-radius:10px;
    padding:10px 12px;text-align:center;
  }
  .db-stack-bar { width:100%;height:8px;border-radius:10px;display:flex;overflow:hidden;gap:2px; }
  .db-stack-seg { height:100%;border-radius:10px; }

  /* ── Task Table ── */
  .db-table { width:100%;border-collapse:collapse;font-family:'DM Sans',sans-serif; }
  .db-table th {
    padding:10px 14px;font-size:11px;font-weight:700;color:${THEME.brandDark};
    text-transform:uppercase;letter-spacing:0.07em;
    background:${THEME.brandLight};border-bottom:2px solid #D4C4A0;white-space:nowrap;
  }
  .db-table td { padding:12px 14px;border-bottom:1px solid #F5EFE4;vertical-align:middle; }
  .db-table tbody tr:nth-child(even) { background:#FEFCF9; }
  .db-table tbody tr:hover { background:#FDFAF5; }

  /* ── Avatar stack ── */
  .db-avatar-stack { display:flex;align-items:center; }
  .db-avatar { width:26px;height:26px;border-radius:50%;border:2px solid #fff;object-fit:cover;margin-left:-6px;box-shadow:0 1px 3px rgba(0,0,0,0.1); }
  .db-avatar:first-child { margin-left:0; }

  /* ── Notification item ── */
  .db-notif-item { display:flex;gap:10px;padding:10px 0;border-bottom:1px solid ${THEME.border};cursor:pointer;transition:all 0.15s; }
  .db-notif-item:hover { background:${THEME.brandLight};margin:0 -16px;padding:10px 16px;border-radius:8px;border-color:transparent; }
  .db-notif-item:last-child { border-bottom:none; }

  /* ── Quick link ── */
  .db-quick-link {
    display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;
    padding:14px 10px;border-radius:12px;background:#fff;border:1.5px solid ${THEME.border};
    cursor:pointer;transition:all 0.18s;text-decoration:none;color:${THEME.text};
    font-family:'DM Sans',sans-serif;font-size:11px;font-weight:600;
  }
  .db-quick-link:hover { border-color:${THEME.brand};background:${THEME.brandLight};color:${THEME.brand}; }

  /* ── Responsive Dashboard Grids ── */
  .db-snapshot-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    width: 100%;
  }
  @media (max-width: 1200px) {
    .db-snapshot-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (max-width: 580px) {
    .db-snapshot-grid {
      grid-template-columns: 1fr;
    }
  }

  .db-emp-snapshot-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    width: 100%;
  }
  @media (max-width: 992px) {
    .db-emp-snapshot-grid {
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    }
  }
  @media (max-width: 580px) {
    .db-emp-snapshot-grid {
      grid-template-columns: 1fr;
    }
  }

  .db-dept-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    width: 100%;
  }
  @media (max-width: 1100px) {
    .db-dept-grid {
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    }
  }
  @media (max-width: 600px) {
    .db-dept-grid {
      grid-template-columns: 1fr;
    }
  }

  .db-links-chart-grid {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 16px;
    margin-bottom: 32px;
    width: 100%;
  }
  .db-links-chart-grid.single-col {
    grid-template-columns: 1fr;
  }
  @media (max-width: 992px) {
    .db-links-chart-grid {
      grid-template-columns: 1fr;
    }
  }

  .db-quick-links-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
    gap: 10px;
    width: 100%;
  }

  ::-webkit-scrollbar { width:5px;height:5px; }
  ::-webkit-scrollbar-track { background:${THEME.brandLight}; }
  ::-webkit-scrollbar-thumb { background:${THEME.brandMid};border-radius:10px; }
`;

// ─────────────────────────────────────────────
//  🧩  ATOMS
// ─────────────────────────────────────────────

function SectionTitle({ children, subtitle }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 4,
            height: 22,
            borderRadius: 3,
            background: `linear-gradient(180deg,${THEME.brand},${THEME.brandMid})`,
          }}
        />
        <h2
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 800,
            color: THEME.text,
            fontFamily: "'Sora',sans-serif",
          }}
        >
          {children}
        </h2>
      </div>
      {subtitle && (
        <p
          style={{
            margin: "3px 0 0 12px",
            fontSize: 12,
            color: THEME.textMuted,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

function PriorityFlag({ priority }) {
  const cfg = {
    High: { bg: "#FFF1F0", color: "#CF1322", border: "#FFA39E" },
    Medium: { bg: "#FFF7E6", color: "#D46B08", border: "#FFD591" },
    Low: { bg: "#F6FFED", color: "#389E0D", border: "#B7EB8F" },
  }[priority] || { bg: "#F5F5F5", color: "#8C8C8C", border: "#D9D9D9" };
  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: 20,
        fontSize: 10,
        fontWeight: 700,
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {priority || "Low"}
    </span>
  );
}

function StatusBadge({ status, onClick }) {
  const done = status !== 0;
  return (
    <span
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.15s",
        background: done ? "#F6FFED" : "#FFF7E6",
        color: done ? "#389E0D" : "#D46B08",
        border: `1px solid ${done ? "#B7EB8F" : "#FFD591"}`,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: done ? "#389E0D" : "#D46B08",
        }}
      />
      {done ? "Completed" : "Pending"}
    </span>
  );
}

function AvatarStack({
  profiles,
  baseUrl = "https://webappapi.zaidexceldesign.com/public",
}) {
  if (!profiles)
    return <span style={{ color: THEME.textLight, fontSize: 12 }}>—</span>;
  const pics = profiles.split(",").filter(Boolean);
  if (!pics.length)
    return <span style={{ color: THEME.textLight, fontSize: 12 }}>—</span>;
  return (
    <div className="db-avatar-stack">
      {pics.slice(0, 4).map((src, i) => (
        <img
          key={i}
          className="db-avatar"
          src={`${baseUrl}/${src}`}
          alt="user"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `${baseUrl}/img/profile.jpeg`;
          }}
        />
      ))}
      {pics.length > 4 && (
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            border: "2px solid #fff",
            background: THEME.brandLight,
            marginLeft: -6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 9,
            fontWeight: 800,
            color: THEME.brand,
          }}
        >
          +{pics.length - 4}
        </div>
      )}
    </div>
  );
}

// ─── Stat snapshot card ──────────────────────
function SnapshotCard({
  icon,
  label,
  badge,
  value,
  sub,
  footer,
  pct,
  onClick,
}) {
  return (
    <div
      className="db-stat-card"
      onClick={onClick}
      style={{ display: "flex", flexDirection: "column", gap: 12 }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: THEME.brandLight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
          }}
        >
          {icon}
        </div>
        {badge && (
          <span
            style={{
              padding: "2px 10px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 600,
              background: THEME.brandLight,
              color: THEME.brandDark,
              border: `1px solid #D4C4A0`,
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: THEME.text,
              fontFamily: "'Sora',sans-serif",
              lineHeight: 1,
            }}
          >
            {value ?? "—"}
          </span>
          {sub && (
            <span
              style={{ fontSize: 13, color: THEME.textMuted, fontWeight: 500 }}
            >
              {sub}
            </span>
          )}
        </div>
        <p
          style={{
            margin: "4px 0 0",
            fontSize: 13,
            fontWeight: 600,
            color: THEME.textMuted,
          }}
        >
          {label}
        </p>
      </div>
      {pct !== undefined && (
        <div>
          <div className="db-progress-track">
            <div
              className="db-progress-fill"
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          {footer && (
            <p
              style={{
                margin: "5px 0 0",
                fontSize: 11,
                color: THEME.textMuted,
              }}
            >
              {footer}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Department card ─────────────────────────
function DeptCard({ title, icon, total, miniItems, onNavigate }) {
  return (
    <div
      className="db-dept-card"
      style={{ display: "flex", flexDirection: "column" }}
    >
      <div className="db-dept-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>{icon}</span>
          <h3
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 800,
              color: THEME.text,
              fontFamily: "'Sora',sans-serif",
            }}
          >
            {title}
          </h3>
        </div>
        <button
          onClick={onNavigate}
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            border: `1.5px solid ${THEME.border}`,
            background: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s",
            color: THEME.brand,
          }}
          title="View All"
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = THEME.brandLight)
          }
          onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
      <div style={{ padding: "16px 18px", flex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 28,
                fontWeight: 800,
                color: THEME.brand,
                fontFamily: "'Sora',sans-serif",
                lineHeight: 1,
              }}
            >
              {total ?? "—"}
            </p>
            <p
              style={{
                margin: "3px 0 0",
                fontSize: 12,
                color: THEME.textMuted,
              }}
            >
              Total Projects
            </p>
          </div>
          <div style={{ width: 50, height: 50 }}>
            <Doughnut
              data={{
                datasets: [
                  {
                    data: [total || 1, 0],
                    backgroundColor: [THEME.brand, "#F0EBE0"],
                    borderWidth: 0,
                  },
                ],
              }}
              options={{
                cutout: "75%",
                plugins: {
                  legend: { display: false },
                  tooltip: { enabled: false },
                },
              }}
            />
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(miniItems.length, 3)}, 1fr)`,
            gap: 8,
          }}
        >
          {miniItems.map((m) => (
            <div key={m.label} className="db-mini-box">
              <p
                style={{
                  margin: "0 0 2px",
                  fontSize: 16,
                  fontWeight: 800,
                  color: THEME.text,
                  fontFamily: "'Sora',sans-serif",
                }}
              >
                {m.value ?? "—"}
              </p>
              <span
                style={{
                  fontSize: 10,
                  color: THEME.textMuted,
                  fontWeight: 600,
                }}
              >
                {m.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Quick links row ─────────────────────────
function QuickLinks({ items }) {
  return (
    <div className="db-quick-links-grid">
      {items.map(({ icon, label, onClick }) => (
        <button key={label} className="db-quick-link" onClick={onClick}>
          <span style={{ fontSize: 22 }}>{icon}</span>
          {label}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const header = {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };
  const defaultUserImgPath = useMemo(
    () => `${host_name}/${defaultuserpic}`,
    [],
  );

  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState([]);
  const [cardData, setCardData] = useState({});
  const [editId, setEditId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showCountModal, setShowCountModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [chartData1, setChartData1] = useState({
    labels: ["Website", "References", "Events"],
    datasets: [
      { data: [1, 1, 2], backgroundColor: ["#887549", "#C4A97D", "#5C4E32"] },
    ],
  });

  // ── Fetch dashboard data ──────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      const apiObj = isEmp()
        ? { method: dashboardInfoForTeam.method, url: dashboardInfoForTeam.url }
        : { method: fetchdashboardData.method, url: fetchdashboardData.url };
      const res = await axios({
        method: apiObj.method,
        url: apiObj.url,
        headers: AuthHeader(),
      });
      if (!res.data.error) setCardData(res.data.data || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      const res = await axios({
        method: fetchsourcebyclient.method,
        url: fetchsourcebyclient.url,
        headers: AuthHeader(),
      });
      const p = res.data.data?.[0] || {};
      setChartData1({
        labels: ["Website", "References", "Events"],
        datasets: [
          {
            data: [
              p.total_website || 0,
              p.total_references || 0,
              p.total_events || 0,
            ],
            backgroundColor: [THEME.brand, THEME.brandMid, THEME.brandDark],
            borderWidth: 0,
          },
        ],
      });
    } catch (e) {
      console.error(e);
    }
  };

  // const notification = async () => {
  //   try {
  //     const res = await ApiService(
  //       null,
  //       0,
  //       header,
  //       getNotification.method,
  //       getNotification.url,
  //     );
  //     if (!res.data.error && Array.isArray(res.data.data)) {
  //       setNotifications(
  //         res.data.data.slice(0, 6).map((d) => ({
  //           id: d.id,
  //           name: d.name,
  //           file: d.file_name,
  //           code: d.code,
  //           is_seen: d.is_seen,
  //           created_at: d.created_at,
  //         })),
  //       );
  //     }
  //   } catch (e) {
  //     console.error(e);
  //   }
  // };

  const fetchtask = async () => {
    try {
      const res = await ApiService(
        null,
        0,
        header,
        fetchdashboardtaskforAdmin.method,
        fetchdashboardtaskforAdmin.url,
      );
      if (!res.data.error) setTask(res.data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
    // notification();
    fetchtask();
    if (superAccess()) fetchChartData();
  }, []);

  // ─────────────────────────────────────────
  // ── Admin-level derived values
  // ─────────────────────────────────────────
  const completed = cardData?.taskData?.total_completed_task || 0;
  const total = cardData?.taskData?.total_task || 0;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const attPresent = cardData?.attendanceData?.present_count || 0;
  const attTotal = cardData?.attendanceData?.total_employees || 0;
  const attPct = attTotal > 0 ? Math.round((attPresent / attTotal) * 100) : 0;

  // Attendance → only present_count is returned (no total_work_days in API)
  const empPresent = cardData?.attendanceData?.present_count || 0;

  // Tasks → use API values directly, already scoped to today + this employee
  const empTotalTask = Number(cardData?.taskData?.total_task) || 0;
  const empDoneTask = Number(cardData?.taskData?.total_completed_task) || 0;
  const empTaskPct =
    empTotalTask > 0 ? Math.round((empDoneTask / empTotalTask) * 100) : 0;

  // Site visits → today only
  const empSiteToday = cardData?.siteData?.today_siteinspection || 0;

  // ─────────────────────────────────────────
  const pd = cardData?.projectData || {};
  const ad = cardData?.ArchData || {};
  const id = cardData?.interiorData || {};

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <style>{CSS}</style>

      <div
        style={{
          minHeight: "100vh",
          background: THEME.bg,
          fontFamily: "'DM Sans',sans-serif",
          padding: "28px 24px",
        }}
      >
        {/* ── Top bar ── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 28,
          }}
          className="db-fade"
        >
          <div>
            <p
              style={{
                margin: "3px 0 0",
                fontSize: 12,
                color: THEME.textMuted,
              }}
            >
              📅 {today}
            </p>
          </div>
        </div>

        {/* ─────────────────────────────────── */}
        {/* ── 1. Daily Snapshot               */}
        {/* ─────────────────────────────────── */}
        <div style={{ marginBottom: 32 }}>
          <SectionTitle subtitle="Real-time overview of today's activity">
            Daily Snapshot
          </SectionTitle>

          {isEmp() ? (
            // ── Employee view ──────────────────────────────────────────
            // Card 1 → This Month Present   (attendanceData.present_count)
            // Card 2 → Today's Tasks        (taskData.total_task / total_completed_task)
            // Card 3 → Today's Site Visits  (siteData.today_siteinspection)
            // ──────────────────────────────────────────────────────────
            <div className="db-emp-snapshot-grid">
              {/* ── Card 1: This Month Present ── */}
              <SnapshotCard
                icon="🗓️"
                label="This Month Present"
                badge="Month"
                value={empPresent}
                footer="Days present this month"
                onClick={() => navigate(`/${AttendanceRoute.list}`)}
              />

              {/* ── Card 2: Today's Tasks ── */}
              <SnapshotCard
                icon="✅"
                label="Today's Tasks"
                badge="Today"
                value={empDoneTask}
                sub={`/ ${empTotalTask} Done`}
                pct={empTaskPct}
                footer={
                  empTotalTask > 0
                    ? `${empTaskPct}% of today's tasks complete`
                    : "No tasks due today"
                }
                onClick={() => navigate(`/${TodosRoute.list}`)}
              />

              {/* ── Card 3: Today's Site Visits ── */}
              <SnapshotCard
                icon="📍"
                label="Today's Site Visits"
                badge="Today"
                value={empSiteToday}
                onClick={() => navigate(`/${SiteRoute.list}`)}
              />
            </div>
          ) : (
            // ── Admin / Super-admin view (unchanged) ──────────────────
            <div className="db-snapshot-grid">
              <SnapshotCard
                icon="👤"
                label="Attendance Rate"
                badge="Today"
                value={attPresent}
                sub={`/ ${attTotal} Present`}
                pct={attPct}
                footer={`${attPct}% attendance rate`}
                onClick={() => navigate(`/${AttendanceRoute.list}`)}
              />

              <SnapshotCard
                icon="✅"
                label="Task Completion"
                badge="Pending"
                value={completed}
                sub={`/ ${total} Tasks`}
                pct={pct}
                footer={`${pct}% completion rate`}
                onClick={() => navigate(`/${TodosRoute.list}`)}
              />

              <SnapshotCard
                icon="🤝"
                label="Active Clients"
                badge="+New"
                value={cardData?.clientData?.total_client}
                onClick={() => navigate(`/${CustRoute.list}`)}
              />

              <SnapshotCard
                icon="📍"
                label="Site Visits"
                badge="This Week"
                value={cardData?.siteData?.total_siteinspection}
                onClick={() => navigate(`/${SiteRoute.list}`)}
              />
            </div>
          )}
        </div>

        {/* ─────────────────────────────────── */}
        {/* ── 2. Department Overview           */}
        {/* ─────────────────────────────────── */}
        <div style={{ marginBottom: 32 }}>
          <SectionTitle subtitle="Project counts across all departments">
            Department Overview
          </SectionTitle>
          <div className="db-dept-grid">
            <DeptCard
              title="Approvals"
              icon="📋"
              total={pd?.approval_process_count}
              onNavigate={() => navigate(`/${ApprovalRoute.approval_list}`)}
              miniItems={[
                { label: "D.C.", value: pd?.dc },
                { label: "P.V.", value: pd?.pv },
                { label: "Fire NOC", value: pd?.firenoc },
                { label: "E-Nagar", value: pd?.enagr },
                { label: "B.Permit", value: pd?.bpermission },
              ]}
            />
            <DeptCard
              title="Architecture"
              icon="🏛"
              total={ad?.total_length}
              onNavigate={() => navigate(`/${ArchitectureRoute.list}`)}
              miniItems={[
                { label: "Basic Details", value: ad?.arch_basic_details_count },
                { label: "Study/RND", value: ad?.arch_space_planning_count },
                { label: "Quotation", value: ad?.arch_material_count },
                { label: "Design Concept", value: ad?.arch_finald_count },
                { label: "Tech Drawing", value: ad?.arch_drawing_count },
                { label: "Risk Matrix", value: ad?.arch_risk_matrix_count },
                { label: "Schedule", value: ad?.schedule },
                { label: "Consulatants", value: ad?.arch_consultant },
              ]}
            />
            <DeptCard
              title="Interior"
              icon="🏠"
              total={id?.total_length}
              onNavigate={() => navigate(`/${InteriorRoute.list}`)}
              miniItems={[
                { label: "Basic Details", value: id?.basic_details_count },
                { label: "Study/RND", value: id?.space_planning_count },
                { label: "Quotation", value: id?.material_count },
                { label: "Design Concept", value: id?.finald_count },
                { label: "Tech Drawing", value: id?.drawing_count },
                { label: "Risk Matrix", value: id?.risk_matrix_count },
                { label: "Schedule", value: id?.schedule },
                { label: "Consulatants", value: id?.consultant },
              ]}
            />
          </div>
        </div>

        {/* ─────────────────────────────────── */}
        {/* ── 3. Quick Links + Chart           */}
        {/* ─────────────────────────────────── */}
        <div className={`db-links-chart-grid ${!superAccess() ? "single-col" : ""}`}>
          {/* Quick Links */}
          <div
            style={{
              background: "#fff",
              border: `1px solid ${THEME.border}`,
              borderRadius: 16,
              padding: "20px",
              boxShadow: "0 2px 10px rgba(136,117,73,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 3,
                  height: 14,
                  borderRadius: 2,
                  background: `linear-gradient(180deg,${THEME.brand},${THEME.brandMid})`,
                }}
              />
              <h3
                style={{
                  margin: 0,
                  fontSize: 13,
                  fontWeight: 700,
                  color: THEME.brand,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  fontFamily: "'Sora',sans-serif",
                }}
              >
                Quick Links
              </h3>
            </div>
            <QuickLinks
              items={[
                {
                  icon: "💰",
                  label: "Deposits",
                  onClick: () => navigate(`/${DepositExpenseRoute.list}`),
                },
                {
                  icon: "🧾",
                  label: "File Expense",
                  onClick: () => navigate(`/${FileExpenseRoute.list}`),
                },
                {
                  icon: "🏢",
                  label: "Office Expense",
                  onClick: () => navigate(`/${OfficeExpenseRoute.list}`),
                },
                {
                  icon: "👥",
                  label: "Employees",
                  onClick: () => navigate(`/${EmpRoute.list}`),
                },
                {
                  icon: "📐",
                  label: "Tentative",
                  onClick: () => navigate(`/${TentativeRoute.list}`),
                },
                {
                  icon: "📅",
                  label: "Attendance",
                  onClick: () => navigate(`/${AttendanceRoute.list}`),
                },
              ]}
            />
          </div>

          {/* Source chart — admin / superadmin only */}
          {superAccess() && (
            <div
              style={{
                background: "#fff",
                border: `1px solid ${THEME.border}`,
                borderRadius: 16,
                padding: "20px",
                boxShadow: "0 2px 10px rgba(136,117,73,0.06)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                  alignSelf: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 3,
                    height: 14,
                    borderRadius: 2,
                    background: `linear-gradient(180deg,${THEME.brand},${THEME.brandMid})`,
                  }}
                />
                <h3
                  style={{
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 700,
                    color: THEME.brand,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    fontFamily: "'Sora',sans-serif",
                  }}
                >
                  Client Source
                </h3>
              </div>
              <div style={{ width: 160 }}>
                <Doughnut
                  data={chartData1}
                  options={{
                    cutout: "65%",
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: {
                          font: { family: "'DM Sans'", size: 11 },
                          boxWidth: 10,
                          padding: 8,
                        },
                      },
                      tooltip: { enabled: true },
                    },
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ─────────────────────────────────── */}
        {/* ── 4. Task Table                    */}
        {/* ─────────────────────────────────── */}
        <div
          style={{
            background: "#fff",
            border: `1px solid ${THEME.border}`,
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 2px 10px rgba(136,117,73,0.06)",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              padding: "18px 20px",
              borderBottom: `1px solid ${THEME.border}`,
              background: "#FDFAF5",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 3,
                    height: 14,
                    borderRadius: 2,
                    background: `linear-gradient(180deg,${THEME.brand},${THEME.brandMid})`,
                  }}
                />
                <h3
                  style={{
                    margin: 0,
                    fontSize: 14,
                    fontWeight: 800,
                    color: THEME.text,
                    fontFamily: "'Sora',sans-serif",
                  }}
                >
                  Tasks
                </h3>
              </div>
              <p
                style={{
                  margin: "2px 0 0 12px",
                  fontSize: 12,
                  color: THEME.textMuted,
                }}
              >
                Manage ongoing project deliverables
              </p>
            </div>
            <button
              onClick={() => navigate(`/${TodosRoute.list}`)}
              style={{
                padding: "7px 16px",
                borderRadius: 10,
                border: `1.5px solid ${THEME.border}`,
                background: "#fff",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'DM Sans',sans-serif",
                color: THEME.brand,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = THEME.brandLight;
                e.currentTarget.style.borderColor = THEME.brand;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.borderColor = THEME.border;
              }}
            >
              View All →
            </button>
          </div>

          {task.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <div style={{ fontSize: 38, marginBottom: 8 }}>✅</div>
              <p style={{ color: THEME.textLight, fontSize: 13, margin: 0 }}>
                No tasks found.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="db-table">
                <thead>
                  <tr>
                    <th style={{ width: 36 }}>#</th>
                    <th>Task</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Collaboration</th>
                    <th>Assign To</th>
                  </tr>
                </thead>
                <tbody>
                  {task.slice(0, 10).map((item, idx) => {
                    const clientName =
                      item.client_name ||
                      item.cllii_name ||
                      item.sclient_name ||
                      "";
                    const caseId = item.case_id || item.caseId || "";
                    const overdue =
                      item.status === 0 && new Date(item.due_date) < new Date();
                    return (
                      <tr key={idx}>
                        <td
                          style={{
                            color: THEME.textMuted,
                            fontWeight: 700,
                            fontSize: 12,
                          }}
                        >
                          {idx + 1}
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 8,
                            }}
                          >
                            <div style={{ paddingTop: 2, flexShrink: 0 }}>
                              <PriorityFlag priority={item.priority} />
                            </div>
                            <div>
                              <p
                                style={{
                                  margin: "0 0 2px",
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: THEME.text,
                                  maxWidth: 280,
                                }}
                              >
                                {item.task}
                              </p>
                              {(clientName || caseId) && (
                                <p
                                  style={{
                                    margin: 0,
                                    fontSize: 11,
                                    color: THEME.textMuted,
                                  }}
                                >
                                  {clientName}
                                  {caseId ? ` · ${caseId}` : ""}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: overdue ? "#CF1322" : THEME.text,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {overdue && "⚠ "}
                          {item.due_date}
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <StatusBadge
                              status={item.status}
                              onClick={() => {
                                setEditId(item.id);
                                setShowModal(true);
                              }}
                            />
                            {item.counter >= 1 && (
                              <span
                                onClick={() => {
                                  setEditId(item.id);
                                  setShowCountModal(true);
                                }}
                                style={{
                                  minWidth: 20,
                                  height: 20,
                                  borderRadius: 20,
                                  padding: "0 6px",
                                  background: THEME.brand,
                                  color: "#fff",
                                  fontSize: 10,
                                  fontWeight: 800,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                }}
                              >
                                {item.counter}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <AvatarStack profiles={item.contribution_profiles} />
                        </td>
                        <td>
                          <AvatarStack profiles={item.assign_to_profiles} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <StatusModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        id={editId}
        onSuccess={fetchtask}
      />
      <CounterDataModal
        show={showCountModal}
        handleClose={() => setShowCountModal(false)}
        id={editId}
      />
    </>
  );
};

export default Dashboard;
