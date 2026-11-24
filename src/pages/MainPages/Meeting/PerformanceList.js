import React, { useEffect, useState } from "react";
import PerformanceModal from "./Components/PerformanceModal";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchperformanceTaskbyid,
  fetchPerformancebyUserId,
  fetchperformanceTaskpercentagebyid,
  updateTaskcheck,
  fetchActiveEmployee,
} from "../../../config/config";
import ApiService from "../../../services/ApiService";
import {
  getToken,
  isAdmin,
  ishod,
  getUserId,
} from "../../../services/useLocalStorage";
import { MeetingRoute } from "../../../config/RouteConfig";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faThumbsDown,
  faThumbsUp,
} from "@fortawesome/free-solid-svg-icons";
import { MdOutlineArrowBackIos } from "react-icons/md";
import { FileUrl } from "../../../config/file_url";
import StatusModal from "../Todo/StatusModal";
import CounterDataModal from "../Todo/CounterDataModal";
import ClarityFocusModal from "./Components/ClarityFocusModal";
import VerifyModal from "./Components/VerifyModal";
import toast from "react-hot-toast";

ChartJS.register(ArcElement, Tooltip, Legend);

// ─────────────────────────────────────────────
//  THEME
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
  rowAlt: "#FEFCF9",
};

const PRIORITY = {
  High: { label: "High", color: "#CF1322", bg: "#FFF1F0", border: "#FFA39E" },
  Medium: {
    label: "Medium",
    color: "#D46B08",
    bg: "#FFF7E6",
    border: "#FFD591",
  },
  Low: { label: "Low", color: "#389E0D", bg: "#F6FFED", border: "#B7EB8F" },
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }
  @keyframes pfFadeIn {
    from { opacity:0; transform:translateY(8px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .pf-fade { animation: pfFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes pfSpin { to { transform: rotate(360deg); } }
  .pf-spinner {
    width:28px; height:28px; border-radius:50%;
    border:3px solid ${THEME.brandLight};
    border-top-color:${THEME.brand};
    animation:pfSpin 0.8s linear infinite;
  }
  .pf-check {
    width:15px; height:15px; accent-color:${THEME.brand};
    cursor:pointer; flex-shrink:0; margin-top:3px;
  }
  .pf-check:disabled { opacity:0.35; cursor:not-allowed; }
  .pf-top-grid { display:grid; grid-template-columns:1fr 160px 160px; gap:16px; }
  .pf-day-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  .pf-clarity-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  @media(max-width:960px){ .pf-top-grid { grid-template-columns:1fr !important; } }
  @media(max-width:700px){ .pf-day-grid, .pf-clarity-grid { grid-template-columns:1fr !important; } }
  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background:${THEME.brandLight}; }
  ::-webkit-scrollbar-thumb { background:${THEME.brandMid}; border-radius:10px; }
`;

const tdStyle = (center = false) => ({
  padding: "11px 14px",
  borderBottom: "1px solid #F5EFE4",
  verticalAlign: "middle",
  textAlign: center ? "center" : "left",
});

// ─────────────────────────────────────────────
//  ATOMS
// ─────────────────────────────────────────────

function Card({ children, style }) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${THEME.border}`,
        borderRadius: 14,
        padding: "20px 22px",
        boxShadow: "0 2px 10px rgba(136,117,73,0.06)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
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
          height: 18,
          borderRadius: 2,
          background: `linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)`,
        }}
      />
      <h2
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
        {children}
      </h2>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 0",
        borderBottom: `1px solid ${THEME.border}`,
      }}
    >
      <span style={{ fontSize: 12, color: THEME.textMuted, fontWeight: 600 }}>
        {label}
      </span>
      <span style={{ fontSize: 13, color: THEME.text, fontWeight: 600 }}>
        {value || "—"}
      </span>
    </div>
  );
}

function StatTile({ label, value }) {
  return (
    <div
      style={{
        background: THEME.brandLight,
        border: `1px solid #D4C4A0`,
        borderRadius: 12,
        padding: "14px 18px",
        textAlign: "center",
      }}
    >
      <p
        style={{
          margin: "0 0 4px",
          fontSize: 11,
          fontWeight: 600,
          color: THEME.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: 24,
          fontWeight: 800,
          color: THEME.brand,
          fontFamily: "'Sora',sans-serif",
        }}
      >
        {value ?? 0}
        <span style={{ fontSize: 12, fontWeight: 600 }}>%</span>
      </p>
    </div>
  );
}

function Tabs({ active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
      {[
        { k: "performance", l: "📈 Performance" },
        { k: "task", l: "📋 Tasks" },
      ].map(({ k, l }) => {
        const on = active === k;
        return (
          <button
            key={k}
            onClick={() => onChange(k)}
            style={{
              padding: "8px 20px",
              borderRadius: 10,
              cursor: "pointer",
              fontFamily: "'Sora',sans-serif",
              fontSize: 13,
              fontWeight: 700,
              transition: "all 0.18s",
              background: on ? THEME.brand : "#fff",
              border: `1.5px solid ${on ? THEME.brand : "#E0D5C5"}`,
              color: on ? "#fff" : "#595959",
              boxShadow: on ? `0 2px 8px ${THEME.brand}33` : "none",
            }}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}

function PriorityDot({ priority }) {
  const p = PRIORITY[priority] || PRIORITY["Low"];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "2px 9px",
        borderRadius: 20,
        fontSize: 10,
        fontWeight: 700,
        background: p.bg,
        color: p.color,
        border: `1px solid ${p.border}`,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: p.color,
          display: "inline-block",
        }}
      />
      {p.label}
    </span>
  );
}

function StatusBadge({ status, onClick }) {
  const done = status === 1;
  return (
    <span
      onClick={onClick}
      title="Click to change"
      style={{
        display: "inline-block",
        padding: "3px 12px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        cursor: "pointer",
        whiteSpace: "nowrap",
        background: done ? "#F6FFED" : "#FFF7E6",
        color: done ? "#389E0D" : "#D46B08",
        border: `1px solid ${done ? "#B7EB8F" : "#FFD591"}`,
      }}
    >
      {done ? "✓ Completed" : "● Pending"}
    </span>
  );
}

function CounterBadge({ count, onClick }) {
  if (!count || count < 1) return null;
  return (
    <span
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 20,
        height: 20,
        borderRadius: "50%",
        fontSize: 10,
        fontWeight: 800,
        cursor: "pointer",
        background: THEME.brand,
        color: "#fff",
      }}
    >
      {count}
    </span>
  );
}

function AvatarStack({ profiles }) {
  if (!profiles || profiles.trim() === "")
    return <span style={{ color: THEME.textLight, fontSize: 12 }}>—</span>;
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {profiles.split(",").map((p, i) => (
        <img
          key={i}
          src={`${FileUrl}/${p.trim()}`}
          alt=""
          loading="lazy"
          decoding="async"
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: "2px solid #fff",
            objectFit: "cover",
            marginLeft: i === 0 ? 0 : -8,
            boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
          }}
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
//  MEETING CARD PIECES
// ─────────────────────────────────────────────

function ScoreLine({ item, onVerify }) {
  const verified = item.verified === 1;
  const canVerify = (isAdmin() || ishod()) && item.user_id !== getUserId();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      {/* Thumbs down — uncompleted */}
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "2px 8px",
          borderRadius: 20,
          fontSize: 11,
          fontWeight: 600,
          background: item.total_uncompleted_tasks > 0 ? "#FFF1F0" : "#F5F5F5",
          color: item.total_uncompleted_tasks > 0 ? "#CF1322" : THEME.textMuted,
          border: `1px solid ${item.total_uncompleted_tasks > 0 ? "#FFA39E" : "#D9D9D9"}`,
        }}
      >
        👎 {item.total_uncompleted_tasks || 0}
      </span>

      {/* Thumbs up — completed */}
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "2px 8px",
          borderRadius: 20,
          fontSize: 11,
          fontWeight: 600,
          background: item.total_completed_tasks > 0 ? "#F6FFED" : "#F5F5F5",
          color: item.total_completed_tasks > 0 ? "#389E0D" : THEME.textMuted,
          border: `1px solid ${item.total_completed_tasks > 0 ? "#B7EB8F" : "#D9D9D9"}`,
        }}
      >
        👍 {item.total_completed_tasks || 0}
      </span>

      {/* Verified badge */}
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <span
          onClick={canVerify ? onVerify : undefined}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "2px 8px",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 600,
            cursor: canVerify ? "pointer" : "default",
            background: verified ? "#F6FFED" : "#F5F5F5",
            color: verified ? "#389E0D" : THEME.textMuted,
            border: `1px solid ${verified ? "#B7EB8F" : "#D9D9D9"}`,
          }}
        >
          {verified ? "✅ Verified" : "○ Unverified"}
          {item.verified_name && (
            <span style={{ color: THEME.textMuted }}>· {item.verified_name}</span>
          )}
        </span>

        {/* Remark — only shown after verification */}
        {verified && item.remark && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "2px 10px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 500,
              background: "#FFFBE6",
              color: "#7C5E00",
              border: "1px solid #FFD666",
              maxWidth: 260,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={item.remark}
          >
            💬 {item.remark}
          </span>
        )}
      </div>
    </div>
  );
}

// function ScoreLine({ item, onVerify }) {
//   const verified = item.verified === 1;
//   const canVerify = (isAdmin() || ishod()) && item.user_id !== getUserId();
//   return (
//     <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//       <span
//         style={{
//           display: "flex",
//           alignItems: "center",
//           gap: 4,
//           fontSize: 12,
//           color:
//             item.total_uncompleted_prevdate_tasks > 0
//               ? "#CF1322"
//               : THEME.textLight,
//         }}
//       >
//         <FontAwesomeIcon icon={faThumbsDown} />{" "}
//         {item.total_uncompleted_prevdate_tasks}
//       </span>
//       <span
//         style={{
//           display: "flex",
//           alignItems: "center",
//           gap: 4,
//           fontSize: 12,
//           color:
//             item.total_completed_prevdate_tasks > 0
//               ? "#389E0D"
//               : THEME.textLight,
//         }}
//       >
//         <FontAwesomeIcon icon={faThumbsUp} />{" "}
//         {item.total_completed_prevdate_tasks}
//       </span>
//       <span
//         title={item.verified_name || (verified ? "Verified" : "Not verified")}
//         onClick={canVerify ? onVerify : undefined}
//         style={{
//           fontSize: 17,
//           cursor: canVerify ? "pointer" : "default",
//           color: verified ? THEME.brand : THEME.textLight,
//           transition: "color 0.15s",
//         }}
//       >
//         <FontAwesomeIcon icon={faCircleCheck} />
//       </span>
//     </div>
//   );
// }

function CheckList({ tasks, ids, statuses, type, isDisabled, onChange }) {
  if (!tasks) return null;
  const tArr = tasks.split("|");
  const iArr = ids?.split("|") || [];
  const sArr = statuses?.split("|") || [];
  return (
    <>
      {tArr.map((task, idx) => {
        const taskId = iArr[idx]?.trim();
        const checked = sArr[idx]?.trim() === "1";
        return (
          <label
            key={`${taskId}-${idx}`}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              cursor: isDisabled ? "not-allowed" : "pointer",
              fontSize: 13,
              lineHeight: 1.5,
              color: checked ? THEME.textMuted : THEME.text,
              textDecoration: checked ? "line-through" : "none",
              marginBottom: 6,
            }}
          >
            <input
              type="checkbox"
              className="pf-check"
              checked={checked}
              disabled={isDisabled}
              onChange={(e) => onChange(e, taskId, type)}
            />
            {task.trim()}
          </label>
        );
      })}
    </>
  );
}

function DayPanel({
  title,
  accent,
  item,
  taskKey,
  idKey,
  statusKey,
  taskType,
  contribKey,
  contribIdKey,
  contribStatusKey,
  contribType,
  isDisabled,
  onChange,
}) {
  const hasTasks = !!item[taskKey];
  const hasContrib = !!item[contribKey];
  return (
    <div
      style={{
        background: `${accent}12`,
        border: `1px solid ${accent}33`,
        borderRadius: 12,
        padding: 16,
      }}
    >
      <p
        style={{
          margin: "0 0 12px",
          fontSize: 11,
          fontWeight: 700,
          color: accent,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {title}
      </p>

      {hasTasks && (
        <div style={{ marginBottom: hasContrib ? 14 : 0 }}>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 10,
              fontWeight: 700,
              color: THEME.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Tasks
          </p>
          <CheckList
            tasks={item[taskKey]}
            ids={item[idKey]}
            statuses={item[statusKey]}
            type={taskType}
            isDisabled={isDisabled}
            onChange={onChange}
          />
        </div>
      )}

      {hasContrib && (
        <div>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 10,
              fontWeight: 700,
              color: THEME.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            🤝 Collaboration
          </p>
          <CheckList
            tasks={item[contribKey]}
            ids={item[contribIdKey]}
            statuses={item[contribStatusKey]}
            type={contribType}
            isDisabled={isDisabled}
            onChange={onChange}
          />
        </div>
      )}

      {!hasTasks && !hasContrib && (
        <p style={{ margin: 0, fontSize: 12, color: THEME.textLight }}>
          No entries
        </p>
      )}
    </div>
  );
}

function ClarityCard({
  title,
  accent,
  keyHighlight,
  keyAction,
  onEdit,
  editDisabled,
}) {
  return (
    <div
      style={{
        background: `${accent}14`,
        border: `1px solid ${accent}44`,
        borderRadius: 12,
        padding: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 14,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 12,
            fontWeight: 700,
            color: accent,
            maxWidth: "88%",
            lineHeight: 1.5,
          }}
        >
          {title}
        </p>
        <button
          onClick={onEdit}
          disabled={editDisabled}
          style={{
            background: "transparent",
            border: "none",
            cursor: editDisabled ? "not-allowed" : "pointer",
            fontSize: 13,
            padding: 4,
            opacity: editDisabled ? 0.35 : 1,
            color: accent,
          }}
        >
          ✏️
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          { label: "Key Highlight", html: keyHighlight },
          { label: "Key Action", html: keyAction },
        ].map(({ label, html }) => (
          <div key={label}>
            <p
              style={{
                margin: "0 0 6px",
                fontSize: 10,
                fontWeight: 700,
                color: THEME.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {label}
            </p>
            <div
              style={{ fontSize: 13, color: THEME.text, lineHeight: 1.6 }}
              dangerouslySetInnerHTML={{
                __html: html || "<em style='color:#bbb'>—</em>",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────
function PerformanceList() {
  const navigate = useNavigate();
  const params = useParams();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [name, setName] = useState({});
  const [performance, setPerformance] = useState([]);
  const [editId, setEditId] = useState("");
  const [percentage, setPercentage] = useState(0);
  const [perfPct, setPerfPct] = useState({});
  const [activeTab, setActiveTab] = useState("performance");
  const [emp, setEmp] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(params.id || "");

  const [showModal, setShowModal] = useState(false);
  const [showCountModal, setShowCountModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showClarityModal, setShowClarityModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const authHeader = {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };

  // ── API ──────────────────────────────────

  const fetchAll = async (empId) => {
    if (!empId) return;
    setLoading(true);
    try {
      const [taskRes, meetRes, pctRes] = await Promise.all([
        ApiService(
          null,
          empId,
          authHeader,
          fetchperformanceTaskbyid.method,
          fetchperformanceTaskbyid.url,
        ),
        ApiService(
          null,
          empId,
          authHeader,
          fetchPerformancebyUserId.method,
          fetchPerformancebyUserId.url,
        ),
        ApiService(
          null,
          empId,
          authHeader,
          fetchperformanceTaskpercentagebyid.method,
          fetchperformanceTaskpercentagebyid.url,
        ),
      ]);
      if (!taskRes.data.error) setData(taskRes.data.data || []);
      if (!meetRes.data.error) setPerformance(meetRes.data.data || []);
      if (!pctRes.data.error) {
        setName(pctRes.data.data.namestats || {});
        setPerfPct(pctRes.data.data.taskstats || {});
        setPercentage(pctRes.data.data.taskstats?.completion_percentage ?? 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getEmployees = async () => {
    try {
      const h = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService(
        null,
        0,
        h,
        fetchActiveEmployee.method,
        fetchActiveEmployee.url,
      );
      if (!res.data.error) {
        setEmp(
          (res.data.data || []).map((m) => ({
            value: m.id,
            label: `${m.first_name} ${m.last_name}`,
          })),
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (params.id) setSelectedEmployee(params.id);
  }, [params.id]);
  useEffect(() => {
    fetchAll(selectedEmployee);
  }, [selectedEmployee]);
  useEffect(() => {
    if (isAdmin()) getEmployees();
  }, []);

  // ── Task checkbox ─────────────────────────

  const handleTaskCheckChange = (e, taskId, type) => {
    const status = e.target.checked ? "1" : "0";
    const fieldMap = {
      prevdate_tasks: ["prevdate_task_ids", "prevdate_tasks_status"],
      prevdate_contributions: [
        "prevdate_contribution_ids",
        "prevdate_contributions_status",
      ],
      today_tasks: ["today_task_ids", "tasks_by_meeting_status"],
      today_contributions: [
        "today_contribution_ids",
        "contributions_by_meeting_status",
      ],
    };
    const [idField, statusField] = fieldMap[type] || [];
    if (!idField) return;
    setData((prev) =>
      prev.map((item) => {
        const ids = item[idField]?.split("|").map((s) => s.trim()) || [];
        const stats = item[statusField]?.split("|").map((s) => s.trim()) || [];
        const idx = ids.indexOf(taskId);
        if (idx === -1) return item;
        const updated = [...stats];
        updated[idx] = status;
        updateTaskInDB(taskId, status);
        return { ...item, [statusField]: updated.join("|") };
      }),
    );
  };

  const updateTaskInDB = async (taskId, status) => {
    try {
      await ApiService(
        { task_id: taskId, status },
        0,
        authHeader,
        updateTaskcheck.method,
        updateTaskcheck.url,
      );
      toast.success("Task updated");
    } catch {
      toast.error("Failed to update");
    }
  };

  // ── Deduplicate: keep first record per date ───────────────
  const deduplicatedPerformance = Object.values(
    performance.reduce((acc, item) => {
      const dateKey = new Date(item.date).toDateString();
      // Keep the item with the lowest id (first inserted) per date
      if (!acc[dateKey] || item.id < acc[dateKey].id) {
        acc[dateKey] = item;
      }
      return acc;
    }, {}),
  ).sort((a, b) => new Date(b.date) - new Date(a.date)); // newest date first

  // ── Pie chart ─────────────────────────────

  const pieData = {
    labels: ["Good Work", "Try Hard"],
    datasets: [
      {
        data: [perfPct.completion_percentage, perfPct.uncompleted_percentage],
        backgroundColor: [THEME.brandLight, "#FFF7E6"],
        borderColor: [THEME.brand, "#D46B08"],
        borderWidth: 2,
      },
    ],
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div
        style={{
          minHeight: "100vh",
          background: THEME.bg,
          fontFamily: "'DM Sans',sans-serif",
          padding: "28px 24px",
        }}
      >
        {/* Page Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => navigate(`/${MeetingRoute.operationalview}`)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                cursor: "pointer",
                background: THEME.brandLight,
                border: `1px solid #D4C4A0`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: THEME.brand,
                fontSize: 14,
              }}
            >
              <MdOutlineArrowBackIos />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 4,
                  height: 26,
                  borderRadius: 3,
                  background: `linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)`,
                }}
              />
              <h1
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 800,
                  color: THEME.text,
                  fontFamily: "'Sora',sans-serif",
                  letterSpacing: "-0.3px",
                }}
              >
                Daily Overview Meeting
              </h1>
            </div>
          </div>

          {isAdmin() && (
            <select
              value={selectedEmployee}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedEmployee(id);
                if (id)
                  navigate(`/${MeetingRoute.performancelist}/${id}`, {
                    replace: true,
                  });
              }}
              style={{
                padding: "8px 14px",
                borderRadius: 10,
                fontSize: 13,
                border: "1.5px solid #E0D5C5",
                fontFamily: "'DM Sans',sans-serif",
                color: THEME.text,
                outline: "none",
                background: "#fff",
                minWidth: 190,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = THEME.brand;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#E0D5C5";
              }}
            >
              <option value="">Select Employee</option>
              {emp.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "80px 0",
              gap: 16,
            }}
          >
            <div className="pf-spinner" />
            <p style={{ color: THEME.textLight, fontSize: 13, margin: 0 }}>
              Loading…
            </p>
          </div>
        )}

        {!loading && (
          <div className="pf-fade">
            {/* Top row */}
            <div className="pf-top-grid" style={{ marginBottom: 16 }}>
              <Card>
                <SectionTitle>Personal Details</SectionTitle>
                <DetailRow
                  label="Name"
                  value={`${name.first_name || ""} ${name.last_name || ""}`.trim()}
                />
                <DetailRow label="Department" value={name.departmentName} />
                <DetailRow label="Designation" value={name.RolesName} />
                <DetailRow label="Overall" value="Good" />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                    marginTop: 16,
                  }}
                >
                  <StatTile label="Task Completion" value={percentage} />
                  <StatTile
                    label="On-Time Ratio"
                    value={perfPct.on_time_completion_percentage}
                  />
                </div>
              </Card>
              <Card
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ width: 130 }}>
                  <CircularProgressbar
                    value={percentage ?? 0}
                    text={`${percentage ?? 0}%`}
                    styles={buildStyles({
                      textColor: THEME.brandDark,
                      pathColor: THEME.brand,
                      trailColor: THEME.brandLight,
                      textSize: "18px",
                    })}
                  />
                </div>
              </Card>
              <Card
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ width: 140 }}>
                  <Pie
                    data={pieData}
                    options={{
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: { font: { size: 11 }, color: "#595959" },
                        },
                      },
                    }}
                  />
                </div>
              </Card>
            </div>

            {/* Tabs card */}
            <Card>
              <Tabs active={activeTab} onChange={setActiveTab} />

              {/* ━━━ PERFORMANCE ━━━ */}
              {activeTab === "performance" && (
                <>
                  <SectionTitle>Performance Details</SectionTitle>

                  {deduplicatedPerformance.length === 0 && (
                    <div style={{ textAlign: "center", padding: "48px 0" }}>
                      <div style={{ fontSize: 36, marginBottom: 8 }}>📊</div>
                      <p
                        style={{
                          color: THEME.textLight,
                          fontSize: 13,
                          margin: 0,
                        }}
                      >
                        No performance data available.
                      </p>
                    </div>
                  )}

                  {deduplicatedPerformance.map((item) => {
                    const hasData =
                      item?.tasks_by_meeting ||
                      item?.prevdate_tasks ||
                      item?.contributions_by_meeting ||
                      item?.prevdate_contributions ||
                      item?.clarity_1_key_highlight ||
                      item?.clarity_1_key_action ||
                      item?.clarity_2_key_highlight ||
                      item?.clarity_2_key_action;
                    if (!hasData) return null;

                    const isDisabled = !(
                      isAdmin() ||
                      ishod() ||
                      item.user_id === getUserId()
                    );

                    return (
                      <div
                        key={item.id}
                        style={{
                          border: `1px solid ${THEME.border}`,
                          borderRadius: 14,
                          marginBottom: 16,
                          overflow: "hidden",
                          boxShadow: "0 2px 8px rgba(136,117,73,0.05)",
                        }}
                      >
                        {/* Card header */}
                        <div
                          style={{
                            background: THEME.brandLight,
                            padding: "12px 18px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            borderBottom: `1px solid ${THEME.border}`,
                          }}
                        >
                          <p
                            style={{
                              margin: 0,
                              fontSize: 14,
                              fontWeight: 700,
                              color: THEME.brandDark,
                              fontFamily: "'Sora',sans-serif",
                            }}
                          >
                            {new Date(item.date).toLocaleDateString("en-GB", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                          <ScoreLine
                            item={item}
                            onVerify={() => {
                              setEditId(item.id);
                              setShowConfirmModal(true);
                            }}
                          />
                        </div>

                        {/* Yesterday / Today panels */}
                        <div
                          className="pf-day-grid"
                          style={{ padding: "16px 18px" }}
                        >
                          <DayPanel
                            title="📅 Yesterday"
                            accent={THEME.brandDark}
                            item={item}
                            isDisabled={isDisabled}
                            onChange={handleTaskCheckChange}
                            taskKey="prevdate_tasks"
                            idKey="prevdate_task_ids"
                            statusKey="prevdate_tasks_status"
                            taskType="prevdate_tasks"
                            contribKey="prevdate_contributions"
                            contribIdKey="prevdate_contribution_ids"
                            contribStatusKey="prevdate_contributions_status"
                            contribType="prevdate_contributions"
                          />
                          <DayPanel
                            title="🌅 Today"
                            accent={THEME.brand}
                            item={item}
                            isDisabled={isDisabled}
                            onChange={handleTaskCheckChange}
                            taskKey="tasks_by_meeting"
                            idKey="today_task_ids"
                            statusKey="tasks_by_meeting_status"
                            taskType="today_tasks"
                            contribKey="contributions_by_meeting"
                            contribIdKey="today_contribution_ids"
                            contribStatusKey="contributions_by_meeting_status"
                            contribType="today_contributions"
                          />
                        </div>

                        {/* Clarity cards */}
                        {(item.clarity_1_key_highlight ||
                          item.clarity_1_key_action ||
                          item.clarity_2_key_highlight ||
                          item.clarity_2_key_action) && (
                          <div
                            className="pf-clarity-grid"
                            style={{ padding: "0 18px 18px" }}
                          >
                            {(item.clarity_1_key_highlight ||
                              item.clarity_1_key_action) && (
                              <ClarityCard
                                title="Top 2–3 Outcomes"
                                accent="#00796B"
                                keyHighlight={item.clarity_1_key_highlight}
                                keyAction={item.clarity_1_key_action}
                                editDisabled={
                                  !!(
                                    item.clarity_1_key_highlight ||
                                    item.clarity_1_key_action
                                  )
                                }
                                onEdit={() => {
                                  if (
                                    !item.clarity_1_key_highlight &&
                                    !item.clarity_1_key_action
                                  ) {
                                    setEditId(item.id);
                                    setShowModal(true);
                                  }
                                }}
                              />
                            )}
                            {(item.clarity_2_key_highlight ||
                              item.clarity_2_key_action) && (
                              <ClarityCard
                                title="Focus · Accomplishment · Reach Goal → Tactical / Strategic Meeting"
                                accent="#D46B08"
                                keyHighlight={item.clarity_2_key_highlight}
                                keyAction={item.clarity_2_key_action}
                                editDisabled={
                                  !!(
                                    item.clarity_2_key_highlight ||
                                    item.clarity_2_key_action
                                  )
                                }
                                onEdit={() => {
                                  if (
                                    !item.clarity_2_key_highlight &&
                                    !item.clarity_2_key_action
                                  ) {
                                    setEditId(item.id);
                                    setShowClarityModal(true);
                                  }
                                }}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}

              {/* ━━━ TASKS ━━━ */}
              {activeTab === "task" && (
                <>
                  <SectionTitle>Task Details</SectionTitle>
                  {data.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "48px 0" }}>
                      <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
                      <p
                        style={{
                          color: THEME.textLight,
                          fontSize: 13,
                          margin: 0,
                        }}
                      >
                        No tasks found.
                      </p>
                    </div>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          fontFamily: "'DM Sans',sans-serif",
                        }}
                      >
                        <thead>
                          <tr style={{ background: THEME.brandLight }}>
                            {[
                              "#",
                              "Task",
                              "Due Date",
                              "Status",
                              "Collaboration",
                              "Assigned To",
                            ].map((h) => (
                              <th
                                key={h}
                                style={{
                                  padding: "11px 14px",
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: THEME.brand,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.07em",
                                  borderBottom: "2px solid #D4C4A0",
                                  textAlign: h === "#" ? "center" : "left",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {data.map((item, idx) => {
                            const clientLabel =
                              item.client_name || item.cllii_name || "";
                            const caseLabel = item.case_id || "";
                            return (
                              <tr
                                key={item.id || idx}
                                style={{
                                  background:
                                    idx % 2 === 0 ? "#fff" : THEME.rowAlt,
                                }}
                              >
                                <td style={tdStyle(true)}>{idx + 1}</td>
                                <td style={{ ...tdStyle(), maxWidth: 340 }}>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "flex-start",
                                      gap: 8,
                                    }}
                                  >
                                    <PriorityDot priority={item.priority} />
                                    <span
                                      style={{
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: THEME.text,
                                      }}
                                    >
                                      {item.task}
                                      {(clientLabel || caseLabel) && (
                                        <span
                                          style={{
                                            fontWeight: 400,
                                            color: THEME.textMuted,
                                          }}
                                        >
                                          {" "}
                                          — {clientLabel}
                                          {caseLabel ? ` · ${caseLabel}` : ""}
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                </td>
                                <td style={tdStyle()}>
                                  <span
                                    style={{
                                      fontSize: 12,
                                      color: "#595959",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {item.due_date || "—"}
                                  </span>
                                </td>
                                <td style={tdStyle()}>
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
                                        setShowStatusModal(true);
                                      }}
                                    />
                                    <CounterBadge
                                      count={item.counter}
                                      onClick={() => {
                                        setEditId(item.id);
                                        setShowCountModal(true);
                                      }}
                                    />
                                  </div>
                                </td>
                                <td style={tdStyle()}>
                                  <AvatarStack
                                    profiles={item.contribution_profiles}
                                  />
                                </td>
                                <td style={tdStyle()}>
                                  <AvatarStack
                                    profiles={item.assign_to_profiles}
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </Card>
          </div>
        )}
      </div>

      <PerformanceModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        id={editId}
      />
      <VerifyModal
        show={showConfirmModal}
        handleClose={() => setShowConfirmModal(false)}
        id={editId}
      />
      <ClarityFocusModal
        show={showClarityModal}
        handleClose={() => setShowClarityModal(false)}
        id={editId}
      />
      <StatusModal
        show={showStatusModal}
        handleClose={() => setShowStatusModal(false)}
        id={editId}
      />
      <CounterDataModal
        show={showCountModal}
        handleClose={() => setShowCountModal(false)}
        id={editId}
      />
    </>
  );
}

export default PerformanceList;
