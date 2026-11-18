import React, { useEffect, useState, useCallback, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PerformanceModal from "./Components/PerformanceModal";
import ClarityFocusModal from "./Components/ClarityFocusModal";
import VerifyModal from "./Components/VerifyModal";
import ApiService from "../../../services/ApiService";
import {
  getoperationViewbyid,
  getdepartmentshowbyuserid,
  updateTaskcheck,
} from "../../../config/config";
import {
  getToken,
  isAdmin,
  getUserId,
  ishod,
} from "../../../services/useLocalStorage";
import { MeetingRoute } from "../../../config/RouteConfig";
import { FileUrl } from "../../../config/file_url";
import toast from "react-hot-toast";

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
  @keyframes ovFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .ov-fade { animation:ovFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes ovSpin { to{transform:rotate(360deg)} }
  .ov-spinner {
    width:28px;height:28px;border-radius:50%;
    border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};
    animation:ovSpin 0.8s linear infinite;
  }

  /* ── Dept tabs ── */
  .ov-tabs { display:flex;gap:6px;flex-wrap:nowrap;overflow-x:auto;padding:0;margin:0;list-style:none;scrollbar-width:none; }
  .ov-tabs::-webkit-scrollbar { display:none; }
  .ov-tab {
    padding:8px 16px;border-radius:20px;cursor:pointer;white-space:nowrap;
    font-size:13px;font-weight:600;border:1.5px solid transparent;
    background:transparent;color:#595959;transition:all 0.18s;
    font-family:'DM Sans',sans-serif;
  }
  .ov-tab:hover  { background:${THEME.brandLight};color:${THEME.brand}; }
  .ov-tab.active { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand};font-weight:700; }

  /* ── Date input ── */
  .ov-date-input {
    padding:9px 14px;border-radius:10px;border:1.5px solid #E0D5C5;
    font-size:13px;font-family:'DM Sans',sans-serif;color:#1A1A2E;
    outline:none;background:#fff;transition:border-color 0.15s,box-shadow 0.15s;
  }
  .ov-date-input:focus { border-color:${THEME.brand};box-shadow:0 0 0 3px ${THEME.brand}18; }

  /* ── Participant card ── */
  .ov-p-card {
    background:#fff;border:1.5px solid ${THEME.border};border-radius:14px;
    margin-bottom:14px;overflow:hidden;
    box-shadow:0 2px 10px rgba(136,117,73,0.06);transition:border-color 0.2s;
  }
  .ov-p-card:hover { border-color:${THEME.brandMid}; }

  /* ── Card header ── */
  .ov-p-header {
    display:flex;align-items:center;justify-content:space-between;
    padding:14px 18px;cursor:pointer;gap:12px;
    background:#FDFAF5;border-bottom:1px solid transparent;transition:all 0.15s;
  }
  .ov-p-header.open { border-bottom-color:${THEME.border}; }
  .ov-p-header:hover { background:${THEME.brandLight}; }

  /* ── Checkbox ── */
  .ov-check-item {
    display:flex;align-items:flex-start;gap:10px;padding:7px 0;
    border-bottom:1px dashed ${THEME.border};
  }
  .ov-check-item:last-child { border-bottom:none; }
  .ov-checkbox {
    width:17px;height:17px;flex-shrink:0;margin-top:2px;accent-color:${THEME.brand};cursor:pointer;
  }
  .ov-checkbox:disabled { cursor:not-allowed; }
  .ov-check-label { font-size:13px;color:${THEME.text};line-height:1.5;cursor:pointer; }
  .ov-check-label.done { text-decoration:line-through;color:${THEME.textMuted}; }

  /* ── Section boxes ── */
  .ov-section-box {
    border-radius:12px;padding:14px 16px;
  }

  /* ── Progress bar ── */
  .ov-progress-track { width:100%;height:6px;border-radius:10px;background:#F0EBE0;overflow:hidden; }
  .ov-progress-fill  { height:100%;border-radius:10px;background:linear-gradient(90deg,${THEME.brand},${THEME.brandMid});transition:width 0.5s ease; }

  ::-webkit-scrollbar { width:5px;height:5px; }
  ::-webkit-scrollbar-track { background:${THEME.brandLight}; }
  ::-webkit-scrollbar-thumb { background:${THEME.brandMid};border-radius:10px; }
`;

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
const ALL_TABS = [
  { id: "5", label: "Sales" },
  { id: "1", label: "Approval" },
  { id: "2", label: "Architecture" },
  { id: "3", label: "Interior" },
  { id: "4", label: "Operation" },
  { id: "6", label: "Accounts" },
];

function parsePipe(str) {
  return str ? str.split("|").map((s) => s.trim()) : [];
}

// ─────────────────────────────────────────────
//  TASK LIST SECTION
// ─────────────────────────────────────────────
function TaskSection({
  title,
  tasks,
  taskIds,
  statuses,
  type,
  item,
  onCheck,
  caseIds,
  projectNames,
  clientNames, // ← new props
}) {
  const taskArr = parsePipe(tasks);
  const idArr = parsePipe(taskIds);
  const statusArr = parsePipe(statuses);
  const caseArr = parsePipe(caseIds);
  const projectArr = parsePipe(projectNames);
  const clientArr = parsePipe(clientNames);

  if (!taskArr.length || (taskArr.length === 1 && !taskArr[0])) return null;

  const canCheck = isAdmin() || ishod() || item.user_id === getUserId();

  return (
    <div>
      <p
        style={{
          margin: "0 0 8px",
          fontSize: 11,
          fontWeight: 700,
          color: THEME.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        }}
      >
        {title}
      </p>
      {taskArr.map((task, idx) => {
        const taskId = idArr[idx] || "";
        const isDone = statusArr[idx] === "1";
        const caseId = caseArr[idx];
        const projectName = projectArr[idx];
        const clientName = clientArr[idx];
        const hasProject = caseId || projectName || clientName;

        return (
          <div key={`${taskId}-${isDone}`} className="ov-check-item">
            <input
              type="checkbox"
              className="ov-checkbox"
              id={`${type}-${taskId}`}
              checked={isDone}
              disabled={!canCheck}
              onChange={(e) => onCheck(e, taskId, type)}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <label
                htmlFor={`${type}-${taskId}`}
                className={`ov-check-label${isDone ? " done" : ""}`}
              >
                {task}
              </label>
              {hasProject && (
                <span
                  style={{
                    fontSize: 11,
                    color: THEME.textMuted,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    flexWrap: "wrap",
                  }}
                >
                  {clientName && (
                    <span style={{ fontWeight: 600, color: THEME.brandDark }}>
                      {clientName}
                    </span>
                  )}
                  {clientName && (caseId || projectName) && (
                    <span style={{ color: THEME.textLight }}>·</span>
                  )}
                  {caseId && (
                    <span
                      style={{
                        background: THEME.brandLight,
                        color: THEME.brand,
                        padding: "1px 6px",
                        borderRadius: 4,
                        fontWeight: 600,
                        fontSize: 10,
                        letterSpacing: "0.03em",
                      }}
                    >
                      {caseId}
                    </span>
                  )}
                  {projectName && (
                    <span style={{ color: THEME.textMuted }}>
                      {projectName}
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}


// ─────────────────────────────────────────────
//  CLARITY BOX
// ─────────────────────────────────────────────
function ClarityBox({ title, bg, keyHighlight, keyAction, canEdit, onEdit }) {
  return (
    <div className="ov-section-box" style={{ background: bg, flex: 1 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 12,
            fontWeight: 700,
            color: THEME.text,
          }}
        >
          {title}
        </p>
        {canEdit && (
          <button
            onClick={onEdit}
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              border: `1.5px solid ${THEME.border}`,
              background: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s",
            }}
            title="Edit"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke={THEME.brand}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <p
            style={{
              margin: "0 0 4px",
              fontSize: 10,
              fontWeight: 700,
              color: THEME.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            Key Highlight
          </p>
          <div
            style={{ fontSize: 12, color: THEME.text, lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{
              __html:
                keyHighlight || "<em style='color:#BDBDBD'>Not filled</em>",
            }}
          />
        </div>
        <div>
          <p
            style={{
              margin: "0 0 4px",
              fontSize: 10,
              fontWeight: 700,
              color: THEME.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            Key Action
          </p>
          <div
            style={{ fontSize: 12, color: THEME.text, lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{
              __html: keyAction || "<em style='color:#BDBDBD'>Not filled</em>",
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  PARTICIPANT CARD  (accordion)
// ─────────────────────────────────────────────
const ParticipantCard = memo(
  ({
    item,
    onCheck,
    onShowModal,
    onShowClarityModal,
    onShowConfirmModal,
    onView,
  }) => {
    const [open, setOpen] = useState(false);

    const totalPrev =
      (item.total_completed_prevdate_tasks || 0) +
      (item.total_uncompleted_prevdate_tasks || 0);
    const donePrev = item.total_completed_prevdate_tasks || 0;
    const pct = totalPrev > 0 ? Math.round((donePrev / totalPrev) * 100) : 0;

    const isVerified = item.verified === 1;
    const canVerify =
      !isVerified && (isAdmin() || ishod()) && item.user_id !== getUserId();

    // Edit permission checks
    const canEdit1 =
      (isAdmin() ||
        (ishod() && item.user_id !== getUserId()) ||
        (!isAdmin() && item.user_id === getUserId())) &&
      !item.clarity_1_key_highlight &&
      !item.clarity_1_key_action;
    const canEdit2 =
      (isAdmin() ||
        (ishod() && item.user_id !== getUserId()) ||
        (!isAdmin() && item.user_id === getUserId())) &&
      !item.clarity_2_key_highlight &&
      !item.clarity_2_key_action;

    return (
      <div className="ov-p-card ov-fade">
        {/* ── Header ── */}
        <div
          className={`ov-p-header${open ? " open" : ""}`}
          onClick={() => setOpen((v) => !v)}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flex: 1,
              minWidth: 0,
            }}
          >
            {/* Avatar */}
            <img
              src={`${FileUrl}/${item.profile_picture}`}
              alt="User"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `${FileUrl}/img/profile.jpeg`;
              }}
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                objectFit: "cover",
                border: `2px solid ${THEME.border}`,
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  margin: "0 0 4px",
                  fontSize: 14,
                  fontWeight: 700,
                  color: THEME.text,
                  fontFamily: "'Sora',sans-serif",
                }}
              >
                {item.first_name} {item.last_name}
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
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
                    background:
                      item.total_uncompleted_tasks > 0
                        ? "#FFF1F0"
                        : "#F5F5F5",
                    color:
                      item.total_uncompleted_tasks > 0
                        ? "#CF1322"
                        : THEME.textMuted,
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
                    background:
                      item.total_completed_tasks > 0
                        ? "#F6FFED"
                        : "#F5F5F5",
                    color:
                      item.total_completed_tasks > 0
                        ? "#389E0D"
                        : THEME.textMuted,
                    border: `1px solid ${item.total_completed_tasks > 0 ? "#B7EB8F" : "#D9D9D9"}`,
                  }}
                >
                  👍 {item.total_completed_tasks || 0}
                </span>
                {/* Verified badge */}
                {/* Verified badge */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 3 }}
                >
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      if (canVerify) onShowConfirmModal(item.id);
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "2px 8px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: canVerify ? "pointer" : "default",
                      background: isVerified ? "#F6FFED" : "#F5F5F5",
                      color: isVerified ? "#389E0D" : THEME.textMuted,
                      border: `1px solid ${isVerified ? "#B7EB8F" : "#D9D9D9"}`,
                    }}
                  >
                    {isVerified ? "✅ Verified" : "○ Unverified"}
                    {item.verified_name && (
                      <span style={{ color: THEME.textMuted }}>
                        · {item.verified_name}
                      </span>
                    )}
                  </span>

                  {/* Remark — only shown after verification */}
                  {isVerified && item.remark && (
                    <span
                      onClick={(e) => e.stopPropagation()}
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
            </div>
          </div>

          {/* Right: progress + chevron */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexShrink: 0,
            }}
          >
            <div style={{ textAlign: "right", minWidth: 80 }}>
              <p
                style={{
                  margin: "0 0 4px",
                  fontSize: 12,
                  fontWeight: 800,
                  color: THEME.brand,
                  fontFamily: "'Sora',sans-serif",
                }}
              >
                {pct}%
              </p>
              <div className="ov-progress-track" style={{ width: 80 }}>
                <div
                  className="ov-progress-fill"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            <svg
              style={{
                transition: "transform 0.2s",
                transform: open ? "rotate(180deg)" : "rotate(0)",
              }}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke={THEME.textMuted}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        {/* ── Body (expanded) ── */}
        {open && (
          <div style={{ padding: "18px" }}>
            {/* Yesterday / Today tasks */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginBottom: 16,
              }}
            >
              {/* Yesterday */}
              <div
                style={{
                  background: THEME.bg,
                  borderRadius: 12,
                  padding: "14px 16px",
                }}
              >
                <p
                  style={{
                    margin: "0 0 12px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: THEME.brandDark,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  📅 Yesterday
                </p>
                <TaskSection
                  title="Tasks"
                  tasks={item.prevdate_tasks}
                  taskIds={item.prevdate_task_ids}
                  statuses={item.prevdate_tasks_status}
                  caseIds={item.prevdate_task_case_ids}
                  projectNames={item.prevdate_task_project_names}
                  clientNames={item.prevdate_task_client_names}
                  type="prevdate_tasks"
                  item={item}
                  onCheck={onCheck}
                />
                <div style={{ marginTop: 10 }}>
                  <TaskSection
                    title="Collaboration"
                    tasks={item.prevdate_contributions}
                    taskIds={item.prevdate_contribution_ids}
                    statuses={item.prevdate_contributions_status}
                    caseIds={item.prevdate_contribution_case_ids}
                    projectNames={item.prevdate_contribution_project_names}
                    clientNames={item.prevdate_contribution_client_names}
                    type="prevdate_contributions"
                    item={item}
                    onCheck={onCheck}
                  />
                </div>
              </div>

              {/* Today */}
              <div
                style={{
                  background: "#F0F7FF",
                  borderRadius: 12,
                  padding: "14px 16px",
                }}
              >
                <p
                  style={{
                    margin: "0 0 12px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#0050B3",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  🌅 Today
                </p>
                <TaskSection
                  title="Tasks"
                  tasks={item.tasks_by_meeting}
                  taskIds={item.today_task_ids}
                  statuses={item.tasks_by_meeting_status}
                  caseIds={item.today_task_case_ids}
                  projectNames={item.today_task_project_names}
                  clientNames={item.today_task_client_names}
                  type="today_tasks"
                  item={item}
                  onCheck={onCheck}
                />
                <div style={{ marginTop: 10 }}>
                  <TaskSection
                    title="Collaboration"
                    tasks={item.contributions_by_meeting}
                    taskIds={item.today_contribution_ids}
                    statuses={item.contributions_by_meeting_status}
                    caseIds={item.today_contribution_case_ids}
                    projectNames={item.today_contribution_project_names}
                    clientNames={item.today_contribution_client_names}
                    type="today_contributions"
                    item={item}
                    onCheck={onCheck}
                  />
                </div>
              </div>
            </div>

            {/* Clarity boxes */}
            <div style={{ display: "flex", gap: 14 }}>
              <ClarityBox
                title="🏆 Top 2–3 Outcomes"
                bg="#E6F7F0"
                keyHighlight={item.clarity_1_key_highlight}
                keyAction={item.clarity_1_key_action}
                canEdit={canEdit1}
                onEdit={() => onShowModal(item.id)}
              />
              <ClarityBox
                title="🎯 Focus → Tactical / Strategic Goals"
                bg="#FFF7E6"
                keyHighlight={item.clarity_2_key_highlight}
                keyAction={item.clarity_2_key_action}
                canEdit={canEdit2}
                onEdit={() => onShowClarityModal(item.id)}
              />
            </div>

            {/* Footer */}
            {(isAdmin() || item.user_id === getUserId()) && (
              <div
                style={{
                  marginTop: 14,
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() => onView(item.user_id)}
                  style={{
                    padding: "7px 16px",
                    borderRadius: 10,
                    border: `1.5px solid ${THEME.border}`,
                    background: "#fff",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    color: THEME.brand,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontFamily: "'DM Sans',sans-serif",
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
                  📊 View History →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
);

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
function OperationView() {
  const navigate = useNavigate();
  const params = useParams();
  const header = {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };

  const [showModal, setShowModal] = useState(false);
  const [showClarityModal, setShowClarityModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [editId, setEditId] = useState("");
  const [totalmember, setTotalMembers] = useState(0);
  const [totaltask, setTotalTask] = useState({});
  const [tabs, setTabs] = useState(ALL_TABS);
  const [activeTabId, setActiveTabId] = useState("");
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toLocaleDateString("en-CA"),
  );

  const fetchdata = useCallback(async () => {
    if (!activeTabId) return;
    setLoading(true);
    try {
      const deptSegment = activeTabId
        ? `/${encodeURIComponent(activeTabId)}`
        : "";
      const pathParams = `${params.id}/${selectedDate}${deptSegment}`;
      const res = await ApiService(
        null,
        pathParams,
        header,
        getoperationViewbyid.method,
        getoperationViewbyid.url,
      );
      if (!res.data.error) {
        const payload = res.data.data || [];
        setData(payload);
        setTotalMembers(payload.length);
        setTotalTask(res.data.departmentStats || {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [activeTabId, selectedDate, params.id]);

  const fetchdepartment = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService(
        null,
        0,
        header,
        getdepartmentshowbyuserid.method,
        getdepartmentshowbyuserid.url,
      );
      if (!res.data.error) {
        if (isAdmin()) {
          setTabs(ALL_TABS);
          setActiveTabId(ALL_TABS[0].id);
        } else {
          const userIds = (res.data.data || []).map((d) => String(d.id));
          const filtered = ALL_TABS.filter((t) => userIds.includes(t.id));
          setTabs(filtered);
          if (filtered.length > 0) setActiveTabId(filtered[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchdepartment();
  }, []);
  useEffect(() => {
    if (activeTabId) fetchdata();
  }, [selectedDate, activeTabId]);

  const handleTaskCheckChange = useCallback((e, taskId, type) => {
    const status = e.target.checked ? "1" : "0";
    setData((prev) =>
      prev.map((item) => {
        const fieldMap = {
          prevdate_tasks: {
            ids: "prevdate_task_ids",
            statuses: "prevdate_tasks_status",
          },
          prevdate_contributions: {
            ids: "prevdate_contribution_ids",
            statuses: "prevdate_contributions_status",
          },
          today_tasks: {
            ids: "today_task_ids",
            statuses: "tasks_by_meeting_status",
          },
          today_contributions: {
            ids: "today_contribution_ids",
            statuses: "contributions_by_meeting_status",
          },
        };
        const f = fieldMap[type];
        if (!f) return item;
        const idArr = parsePipe(item[f.ids]);
        const stArr = parsePipe(item[f.statuses]);
        const idx = idArr.indexOf(taskId);
        if (idx === -1) return item;
        const newSt = [...stArr];
        newSt[idx] = status;
        ApiService(
          { task_id: taskId, status },
          0,
          header,
          updateTaskcheck.method,
          updateTaskcheck.url,
        )
          .then(() => toast.success("Task updated"))
          .catch(() => toast.error("Update failed"));
        return { ...item, [f.statuses]: newSt.join("|") };
      }),
    );
  }, []);

  const pct =
    totaltask.total_tasks > 0
      ? Math.round((totaltask.completed_tasks / totaltask.total_tasks) * 100)
      : 0;

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
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 20,
          }}
        >
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
            Operational Meeting
          </h1>
        </div>

        {/* ── Date + Tabs card ── */}
        <div
          style={{
            background: "#fff",
            border: `1px solid ${THEME.border}`,
            borderRadius: 14,
            padding: "16px 20px",
            marginBottom: 20,
            boxShadow: "0 2px 8px rgba(136,117,73,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 14,
            }}
          >
            <div>
              <p
                style={{
                  margin: "0 0 2px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: THEME.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                }}
              >
                Selected Date
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 700,
                  color: THEME.text,
                  fontFamily: "'Sora',sans-serif",
                }}
              >
                {new Date(selectedDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <input
              type="date"
              className="ov-date-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          {/* Dept tab strip */}
          <div className="ov-tabs" style={{ display: "flex" }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`ov-tab${String(activeTabId) === String(tab.id) ? " active" : ""}`}
                onClick={() => setActiveTabId(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Stats row (admin / hod) ── */}
        {(isAdmin() || ishod()) && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 14,
              marginBottom: 20,
            }}
          >
            {[
              {
                label: "Active Members",
                value: totalmember,
                sub: "on selected date",
                color: THEME.brand,
              },
              {
                label: "Tasks Done",
                value: `${totaltask.completed_tasks ?? "—"}/${totaltask.total_tasks ?? "—"}`,
                sub: "completed vs total",
                color: "#D46B08",
              },
              {
                label: "Departments",
                value: tabs.length,
                sub: "active today",
                color: "#2F54EB",
              },
              {
                label: "Completion",
                value: `${pct}%`,
                sub: "overall rate",
                color: "#389E0D",
              },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: "#fff",
                  border: `1px solid ${THEME.border}`,
                  borderRadius: 12,
                  padding: "14px 16px",
                  borderTop: `3px solid ${s.color}`,
                  boxShadow: "0 2px 8px rgba(136,117,73,0.06)",
                }}
              >
                <p
                  style={{
                    margin: "0 0 2px",
                    fontSize: 10,
                    fontWeight: 700,
                    color: THEME.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  {s.label}
                </p>
                <p
                  style={{
                    margin: "3px 0 1px",
                    fontSize: 20,
                    fontWeight: 800,
                    color: s.color,
                    fontFamily: "'Sora',sans-serif",
                  }}
                >
                  {s.value}
                </p>
                <p style={{ margin: 0, fontSize: 10, color: THEME.textLight }}>
                  {s.sub}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── Participants header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 3,
                height: 14,
                borderRadius: 2,
                background: `linear-gradient(180deg,${THEME.brand},${THEME.brandMid})`,
              }}
            />
            <h2
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 800,
                color: THEME.text,
                fontFamily: "'Sora',sans-serif",
              }}
            >
              All Participants
            </h2>
          </div>
          <span
            style={{
              padding: "3px 12px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              background: THEME.brandLight,
              color: THEME.brandDark,
              border: `1px solid #D4C4A0`,
            }}
          >
            👥 {totalmember} Members
          </span>
        </div>

        {/* Loading */}
        {loading && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "60px 0",
              gap: 16,
            }}
          >
            <div className="ov-spinner" />
            <p style={{ color: THEME.textLight, fontSize: 13, margin: 0 }}>
              Loading participants…
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && data.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>👥</div>
            <p style={{ color: THEME.textLight, fontSize: 14, margin: 0 }}>
              No participants found for this date & department.
            </p>
          </div>
        )}

        {/* Participant accordion cards */}
        {!loading &&
          data.map((item) => (
            <ParticipantCard
              key={item.id}
              item={item}
              onCheck={handleTaskCheckChange}
              onShowModal={(id) => {
                setEditId(id);
                setShowModal(true);
              }}
              onShowClarityModal={(id) => {
                setEditId(id);
                setShowClarityModal(true);
              }}
              onShowConfirmModal={(id) => {
                setEditId(id);
                setShowConfirmModal(true);
              }}
              onView={(uid) =>
                navigate(`/${MeetingRoute.performancelist}/${uid}`)
              }
            />
          ))}
      </div>

      <PerformanceModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        id={editId}
        onSuccess={fetchdata}
      />
      <ClarityFocusModal
        show={showClarityModal}
        handleClose={() => setShowClarityModal(false)}
        id={editId}
        onSuccess={fetchdata}
      />
      <VerifyModal
        show={showConfirmModal}
        handleClose={() => setShowConfirmModal(false)}
        id={editId}
        onSuccess={fetchdata}
      />
    </>
  );
}

export default OperationView;
