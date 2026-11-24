import React, { useEffect, useState, useMemo } from "react";
import ApiService from "../../../../services/ApiService";
import {
  fetchtaskforAdmin,
  deleteTaskForAdmin,
  fetchActiveEmployee,
} from "../../../../config/config";
import {
  getToken,
  isAdmin,
  getUserId,
} from "../../../../services/useLocalStorage";
import { SwalAlert } from "../../../../UtilsComponent/SwalDialog";
import toast from "react-hot-toast";
import { TodosRoute } from "../../../../config/RouteConfig";
import { useNavigate } from "react-router-dom";
import StatusModal from "../StatusModal";
import CounterDataModal from "../CounterDataModal";
import Select from "react-select";
import { FileUrl } from "../../../../config/file_url";
import AddPms from "../../pms/Add";

// ─────────────────────────────────────────────
//  🎨  THEME  —  change colours here
// ─────────────────────────────────────────────
const THEME = {
  brand: "#887549",
  brandLight: "#F5F0E8",
  brandMid: "#C4A97D",
  brandDark: "#5C4E32",
  bg: "#F8F5F0",
  border: "#EDE5D5",
  rowAlt: "#FEFCF9",
  rowHover: "#FDFAF5",
  text: "#1A1A2E",
  textMuted: "#ADADAD",
  textLight: "#BDBDBD",
};

// ─────────────────────────────────────────────
//  🏷  PRIORITY CONFIG
//  Add new priorities here
// ─────────────────────────────────────────────
const PRIORITY = {
  2: { label: "High", color: "#CF1322", bg: "#FFF1F0", border: "#FFA39E" },
  1: { label: "Medium", color: "#D46B08", bg: "#FFF7E6", border: "#FFD591" },
  0: { label: "Low", color: "#389E0D", bg: "#F6FFED", border: "#B7EB8F" },
};

// ─────────────────────────────────────────────
//  📄  ROWS PER PAGE
// ─────────────────────────────────────────────
const PAGE_SIZE = 15;

// ─────────────────────────────────────────────
//  📅  DATE HELPERS
// ─────────────────────────────────────────────
const formatDateForInput = (date) => {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const getDefaultStartDate = () => formatDateForInput(new Date());

const getDefaultEndDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 15);
  return formatDateForInput(d);
};

// ─────────────────────────────────────────────
//  🎨  react-select brand styles
// ─────────────────────────────────────────────
const selectStyles = {
  control: (base, state) => ({
    ...base,
    borderRadius: 10,
    borderColor: state.isFocused ? THEME.brand : "#E0D5C5",
    boxShadow: state.isFocused ? `0 0 0 3px ${THEME.brand}22` : "none",
    fontSize: 13,
    minHeight: 36,
    fontFamily: "'DM Sans', sans-serif",
    "&:hover": { borderColor: THEME.brand },
  }),
  option: (base, state) => ({
    ...base,
    fontSize: 13,
    background: state.isSelected
      ? THEME.brand
      : state.isFocused
        ? THEME.brandLight
        : "#fff",
    color: state.isSelected ? "#fff" : THEME.text,
    fontFamily: "'DM Sans', sans-serif",
  }),
  placeholder: (base) => ({ ...base, color: THEME.textLight, fontSize: 13 }),
  singleValue: (base) => ({ ...base, fontSize: 13, color: THEME.text }),
  menu: (base) => ({
    ...base,
    borderRadius: 10,
    border: `1px solid ${THEME.border}`,
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  }),
};

// ─────────────────────────────────────────────
//  📝  GLOBAL CSS
// ─────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fade-in { animation: fadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner {
    width: 28px; height: 28px; border-radius: 50%;
    border: 3px solid ${THEME.brandLight};
    border-top-color: ${THEME.brand};
    animation: spin 0.8s linear infinite;
  }

  /* Thin branded scrollbar */
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: ${THEME.brandLight}; }
  ::-webkit-scrollbar-thumb { background: ${THEME.brandMid}; border-radius: 10px; }
`;

// ─────────────────────────────────────────────
//  🧩  SMALL UI PIECES
// ─────────────────────────────────────────────

/** Compact filter input for date */
function DateInput({ label, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: THEME.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </span>
      <input
        type="date"
        value={value}
        onChange={onChange}
        style={{
          padding: "7px 10px",
          borderRadius: 10,
          border: "1.5px solid #E0D5C5",
          fontSize: 13,
          fontFamily: "'DM Sans', sans-serif",
          color: "#434343",
          outline: "none",
          background: "#fff",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = THEME.brand;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#E0D5C5";
        }}
      />
    </div>
  );
}

/** Status dropdown */
function StatusSelect({
  value,
  onChange,
  allCount,
  pendingCount,
  completedCount,
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: THEME.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        Status
      </span>
      <select
        value={value}
        onChange={onChange}
        style={{
          padding: "7px 10px",
          borderRadius: 10,
          border: "1.5px solid #E0D5C5",
          fontSize: 13,
          fontFamily: "'DM Sans', sans-serif",
          color: "#434343",
          outline: "none",
          background: "#fff",
          minWidth: 155,
          cursor: "pointer",
        }}
      >
        <option value="">
          All {allCount !== undefined ? `(${allCount})` : ""}
        </option>
        <option value="0">
          Pending {pendingCount !== undefined ? `(${pendingCount})` : ""}
        </option>
        <option value="1">
          Completed {completedCount !== undefined ? `(${completedCount})` : ""}
        </option>
      </select>
    </div>
  );
}

/** + Add button */
function AddBtn({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "9px 18px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 700,
        cursor: "pointer",
        fontFamily: "'Sora', sans-serif",
        whiteSpace: "nowrap",
        background: hov ? THEME.brandDark : THEME.brand,
        border: "none",
        color: "#fff",
        boxShadow: `0 2px 8px ${THEME.brand}44`,
        transition: "all 0.18s",
      }}
    >
      + Add Task
    </button>
  );
}

/** Priority pill */
function PriorityDot({ priority }) {
  const p = PRIORITY[String(priority)] || PRIORITY["2"];
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

/** Status badge — clickable */
function StatusBadge({ status, onClick }) {
  const isDone = status === 1;
  return (
    <span
      onClick={onClick}
      style={{
        display: "inline-block",
        padding: "3px 12px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        cursor: "pointer",
        whiteSpace: "nowrap",
        background: isDone ? "#F6FFED" : "#FFF7E6",
        color: isDone ? "#389E0D" : "#D46B08",
        border: `1px solid ${isDone ? "#B7EB8F" : "#FFD591"}`,
        transition: "opacity 0.15s",
      }}
      title="Click to change status"
    >
      {isDone ? "✓ Completed" : "● Pending"}
    </span>
  );
}

/** Counter bubble */
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
      title="View counter details"
    >
      {count}
    </span>
  );
}

function HoursCell({ total, used, totalMinutes, usedMinutes }) {
  const t = Number(total) || 0;
  const u = Number(used) || 0;
  const tm = Number(totalMinutes) || 0;
  const um = Number(usedMinutes) || 0;

  // Convert everything to total minutes for accurate progress/remaining math
  const totalInMinutes = t * 60 + tm;
  const usedInMinutes = u * 60 + um;
  const remainingInMinutes = Math.max(totalInMinutes - usedInMinutes, 0);
  const overLimit = totalInMinutes > 0 && usedInMinutes > totalInMinutes;
  const pct =
    totalInMinutes > 0
      ? Math.min((usedInMinutes / totalInMinutes) * 100, 100)
      : 0;

  const remH = Math.floor(remainingInMinutes / 60);
  const remM = remainingInMinutes % 60;
  const usedH = Math.floor(usedInMinutes / 60);
  const usedM = usedInMinutes % 60;
  const totalH = Math.floor(totalInMinutes / 60);
  const totalM = totalInMinutes % 60;

  if (!t && !tm)
    return <span style={{ fontSize: 12, color: THEME.textLight }}>—</span>;

  return (
    <div style={{ minWidth: 90 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          fontWeight: 600,
        }}
      >
        <span style={{ color: overLimit ? "#CF1322" : THEME.text }}>
          {usedH}h {usedM}m
        </span>
        <span style={{ color: THEME.textMuted }}>
          / {totalH}h {totalM}m
        </span>
      </div>
      <div
        style={{
          width: "100%",
          height: 5,
          borderRadius: 4,
          background: THEME.border,
          marginTop: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: 4,
            background: overLimit ? "#CF1322" : THEME.brand,
            transition: "width 0.2s ease",
          }}
        />
      </div>
      <span
        style={{
          fontSize: 10,
          color: remainingInMinutes > 0 ? "#389E0D" : "#CF1322",
        }}
      >
        {remH}h {remM}m left
      </span>
    </div>
  );
}

function AvatarStack({ profiles, title }) {
  if (!profiles || profiles === "null" || profiles.trim() === "") {
    return null; // don't show default image
  }

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {profiles.split(",").map((path, i) => (
        <img
          key={i}
          src={`${FileUrl}/${path}`}
          alt="User"
          title={title || ""}
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
            e.target.style.display = "none"; // hide broken image
          }}
        />
      ))}
    </div>
  );
}

/** Edit icon button */
function EditBtn({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title="Edit"
      style={{
        width: 30,
        height: 30,
        borderRadius: 8,
        cursor: "pointer",
        background: hov ? THEME.brandLight : "#fff",
        border: `1px solid ${hov ? THEME.brand : "#E0D5C5"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.15s",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path
          d="M13.26 4L5.05 12.69c-.31.33-.61.98-.67 1.43l-.37 3.24c-.13 1.17.71 1.97 1.87 1.77l3.22-.55c.45-.08 1.08-.41 1.39-.75l8.21-8.69c1.42-1.5 2.06-3.21-.15-5.3C16.35 1.87 14.68 2.6 13.26 4Z"
          stroke={hov ? THEME.brand : "#657488"}
          strokeWidth="1.8"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.89 5.05c.43 2.76 2.67 4.87 5.45 5.15M3 22h18"
          stroke={hov ? THEME.brand : "#657488"}
          strokeWidth="1.8"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

/** Delete icon button */
function DeleteBtn({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title="Delete"
      style={{
        width: 30,
        height: 30,
        borderRadius: 8,
        cursor: "pointer",
        background: hov ? "#FFF1F0" : "#fff",
        border: `1px solid ${hov ? "#FFA39E" : "#E0D5C5"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.15s",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
        <path
          d="M17.5 4.98c-2.77-.27-5.57-.42-8.35-.42q-2.47 0-4.95.25l-1.7.17"
          stroke="#FF5275"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="m7.08 4.14.18-1.09C7.4 2.26 7.5 1.67 8.91 1.67h2.18c1.41 0 1.52.62 1.64 1.39l.18 1.08"
          stroke="#FF5275"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="m15.71 7.62-.54 8.39c-.09 1.31-.17 2.32-2.49 2.32h-5.35c-2.33 0-2.4-1.01-2.49-2.32l-.54-8.39"
          stroke="#FF5275"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.61 13.75h2.78M7.91 10.42h4.17"
          stroke="#FF5275"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

/** Plus (update) icon button */
function PlusBtn({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title="Work Done"
      style={{
        width: 30,
        height: 30,
        borderRadius: 8,
        cursor: "pointer",
        background: hov ? THEME.brandLight : "#fff",
        border: `1px solid ${hov ? THEME.brand : "#E0D5C5"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.15s",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 5v14M5 12h14"
          stroke={hov ? THEME.brand : "#657488"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

/** Pagination bar */
function Pagination({
  page,
  total,
  canPrev,
  canNext,
  onFirst,
  onPrev,
  onNext,
  onLast,
}) {
  const btn = (disabled) => ({
    width: 30,
    height: 30,
    borderRadius: 8,
    background: disabled ? "#F5F5F5" : "#fff",
    border: `1px solid ${disabled ? "#E8E8E8" : "#E0D5C5"}`,
    color: disabled ? THEME.textLight : THEME.brand,
    cursor: disabled ? "default" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 700,
    transition: "all 0.15s",
  });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 6,
        padding: "12px 20px",
        borderTop: "1px solid #F5EFE4",
        background: "#FDFAF5",
      }}
    >
      <button style={btn(!canPrev)} onClick={onFirst} disabled={!canPrev}>
        «
      </button>
      <button style={btn(!canPrev)} onClick={onPrev} disabled={!canPrev}>
        ‹
      </button>
      <span
        style={{
          fontSize: 13,
          color: "#595959",
          fontWeight: 600,
          padding: "0 8px",
        }}
      >
        Page <span style={{ color: THEME.brand }}>{page}</span> of {total}
      </span>
      <button style={btn(!canNext)} onClick={onNext} disabled={!canNext}>
        ›
      </button>
      <button style={btn(!canNext)} onClick={onLast} disabled={!canNext}>
        »
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
//  📊  STATS BAR
// ─────────────────────────────────────────────
function StatsBar({ tasks, filteredTasks, selectedStatus, onSelectStatus }) {
  const total = (tasks || []).length;
  const pending = (tasks || []).filter((t) => Number(t.status) === 0).length;
  const completed = (tasks || []).filter((t) => Number(t.status) === 1).length;
  const highPri = (tasks || []).filter((t) => String(t.priority) === "2").length;

  // Calculate total time used and allocated across all loaded tasks
  let totalUsedMinutes = 0;
  let totalAllocMinutes = 0;
  (tasks || []).forEach((t) => {
    totalUsedMinutes += (Number(t.used_hours) || 0) * 60 + (Number(t.used_minutes) || 0);
    totalAllocMinutes += (Number(t.hours) || 0) * 60 + (Number(t.minutes) || 0);
  });
  const usedH = Math.floor(totalUsedMinutes / 60);
  const usedM = totalUsedMinutes % 60;
  const allocH = Math.floor(totalAllocMinutes / 60);
  const allocM = totalAllocMinutes % 60;

  // Filtered tasks time (if filtered differently)
  let filtUsedMinutes = 0;
  (filteredTasks || []).forEach((t) => {
    filtUsedMinutes += (Number(t.used_hours) || 0) * 60 + (Number(t.used_minutes) || 0);
  });
  const filtUsedH = Math.floor(filtUsedMinutes / 60);
  const filtUsedM = filtUsedMinutes % 60;

  const isStatusFiltered = selectedStatus !== "" && selectedStatus !== "all";

  const stats = [
    {
      key: "all",
      statusValue: "",
      label: "All Tasks",
      value: total,
      color: THEME.brand,
      bg: THEME.brandLight,
      border: "#D4C4A0",
      clickable: true,
      active: selectedStatus === "" || selectedStatus === "all",
    },
    {
      key: "pending",
      statusValue: "0",
      label: "Pending",
      value: pending,
      color: "#D46B08",
      bg: "#FFF7E6",
      border: "#FFD591",
      clickable: true,
      active: selectedStatus === "0",
    },
    {
      key: "completed",
      statusValue: "1",
      label: "Completed",
      value: completed,
      color: "#389E0D",
      bg: "#F6FFED",
      border: "#B7EB8F",
      clickable: true,
      active: selectedStatus === "1",
    },
    {
      key: "time",
      label: "Total Time Used",
      value: `${usedH}h ${usedM}m`,
      subtext: isStatusFiltered
        ? `Filtered: ${filtUsedH}h ${filtUsedM}m · Alloc: ${allocH}h ${allocM}m`
        : `Allocated: ${allocH}h ${allocM}m`,
      icon: "⏱️",
      color: "#08979C",
      bg: "#E6FFFB",
      border: "#87E8DE",
      clickable: false,
    },
    {
      key: "highPri",
      label: "High Priority",
      value: highPri,
      color: "#CF1322",
      bg: "#FFF1F0",
      border: "#FFA39E",
      clickable: false,
    },
  ];

  return (
    <div
      style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}
    >
      {stats.map((s) => {
        const isClickable = s.clickable && typeof onSelectStatus === "function";
        return (
          <div
            key={s.key || s.label}
            onClick={() => {
              if (isClickable) onSelectStatus(s.statusValue);
            }}
            style={{
              flex: s.key === "time" ? "1 1 210px" : "0 1 150px",
              minWidth: s.key === "time" ? 190 : 130,
              background: "#fff",
              border: s.active
                ? `2px solid ${s.color}`
                : `1px solid ${s.border}`,
              borderRadius: 12,
              padding: "12px 16px",
              boxShadow: s.active
                ? `0 4px 14px ${s.color}25`
                : "0 2px 8px rgba(0,0,0,0.04)",
              display: "flex",
              alignItems: "center",
              gap: 12,
              cursor: isClickable ? "pointer" : "default",
              transform: s.active ? "translateY(-2px)" : "none",
              transition: "all 0.18s ease",
            }}
            title={isClickable ? `Click to filter by ${s.label}` : ""}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: s.bg,
                border: `1px solid ${s.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {s.icon ? (
                <span style={{ fontSize: 20 }}>{s.icon}</span>
              ) : (
                <span style={{ fontSize: 16, fontWeight: 800, color: s.color }}>
                  {s.value}
                </span>
              )}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
                overflow: "hidden",
              }}
            >
              {s.icon ? (
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: s.color,
                    lineHeight: 1.2,
                  }}
                >
                  {s.value}
                </span>
              ) : null}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    fontSize: 12,
                    color: "#8C8C8C",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.label}
                </span>
                {s.active && (
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: s.color,
                      background: s.bg,
                      padding: "1px 5px",
                      borderRadius: 4,
                      textTransform: "uppercase",
                    }}
                  >
                    Active
                  </span>
                )}
              </div>
              {s.subtext && (
                <span
                  style={{
                    fontSize: 10,
                    color: THEME.textMuted,
                    marginTop: 2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {s.subtext}
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
//  🏗  TABLE ROW
// ─────────────────────────────────────────────
function TaskRow({
  item,
  index,
  onEdit,
  onDelete,
  onStatus,
  onCounter,
  onUpdateTask,
}) {
  const [hov, setHov] = useState(false);

  // Derive collaboration profiles for "Assign to" column
  const assignProfiles =
    item.contribution_profiles?.length > 0
      ? item.contri_assign_profile
      : item.assign_to_profiles;

  // Client/case label
  const clientLabel =
    item.client_name || item.cllii_name || item.sclient_name || "";
  const caseLabel = item.case_id || item.caseId || "";

  return (
    <tr
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov
          ? THEME.rowHover
          : index % 2 === 0
            ? "#fff"
            : THEME.rowAlt,
        transition: "background 0.15s",
      }}
    >
      {/* # */}
      <td style={td(true)}>{index + 1}</td>

      {/* Task */}
      <td style={{ ...td(), maxWidth: 340 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <PriorityDot priority={item.priority} />
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 600,
                color: THEME.text,
                lineHeight: 1.4,
              }}
            >
              {item.task}
              {(clientLabel || caseLabel) && (
                <span style={{ fontWeight: 400, color: THEME.textMuted }}>
                  {" "}
                  — {clientLabel}
                  {caseLabel ? ` · ${caseLabel}` : ""}
                </span>
              )}
            </p>
            {item.contribution_profiles?.length > 0 && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#2F54EB",
                  background: "#F0F5FF",
                  border: "1px solid #ADC6FF",
                  borderRadius: 6,
                  padding: "1px 6px",
                  marginTop: 4,
                  display: "inline-block",
                }}
              >
                🤝 Collaboration
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Dates */}
      <td style={td()}>
        <span style={dateStyle}>{item.formatted_created_date || "—"}</span>
      </td>
      <td style={td()}>
        <span style={dateStyle}>{item.start_date || "—"}</span>
      </td>
      <td style={td()}>
        <span style={dateStyle}>{item.formatted_due_date || "—"}</span>
      </td>

      {/* Hours */}
      <td style={td()}>
       <HoursCell
    total={item.hours}
    used={item.used_hours}
    totalMinutes={item.minutes}
    usedMinutes={item.used_minutes}
  />
      </td>

      {/* Status */}
      <td style={td()}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <StatusBadge status={item.status} onClick={() => onStatus(item.id)} />
          <CounterBadge
            count={item.counter}
            onClick={() => onCounter(item.id)}
          />
        </div>
      </td>

      {/* Collaboration */}
      <td style={td()}>
        <AvatarStack
          profiles={item.contri_assign_profile}
          title={item.contributon_name}
        />
      </td>

      {/* Assigned To */}
      <td style={td()}>
        <AvatarStack profiles={assignProfiles} title={item.assign_name} />
      </td>

      {/* Actions */}
      <td style={td()}>
        {isAdmin() ? (
          <div style={{ display: "flex", gap: 6 }}>
            <EditBtn onClick={() => onEdit(item.id)} />
            <DeleteBtn onClick={() => onDelete(item.id)} />
            {/* <PlusBtn onClick={() => onUpdateTask(item)} /> */}
          </div>
        ):null}
        {/* ) : (
          <div style={{ display: "flex", gap: 6 }}>
             <PlusBtn onClick={() => onUpdateTask(item)} />
        </div>
         )} */}
      </td>
    </tr>
  );
}

// Cell style helper
const td = (center = false) => ({
  padding: "11px 14px",
  borderBottom: "1px solid #F5EFE4",
  verticalAlign: "middle",
  textAlign: center ? "center" : "left",
});

const dateStyle = {
  fontSize: 12,
  color: "#595959",
  whiteSpace: "nowrap",
  fontFamily: "'DM Sans', sans-serif",
};

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
function ListAdmin() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [updateTotalMinutes, setUpdateTotalMinutes] = useState(0);
const [updateUsedMinutes, setUpdateUsedMinutes] = useState(0);

  // Filter state - default to "" (All)
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedTeamMember, setSelectedTeamMember] = useState(null);
  const [selectedContrib, setSelectedContrib] = useState(null);
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(getDefaultEndDate());
  const [teamMembers, setTeamMembers] = useState([]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [showCountModal, setShowCountModal] = useState(false);
  const [editId, setEditId] = useState("");

  // New state near your other modal state
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateTaskId, setUpdateTaskId] = useState("");
  const [updateTaskText, setUpdateTaskText] = useState("");
  const [updateTotalHours, setUpdateTotalHours] = useState(0);
  const [updateUsedHours, setUpdateUsedHours] = useState(0);

  const authHeader = {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };

  // ── API calls ──────────────────────────────

  const buildQueryString = (params) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") qs.append(k, v);
    });
    const s = qs.toString();
    return s ? `?${s}` : "";
  };

  const currentFilters = () => ({
    assign_to: selectedTeamMember?.value,
    contributon: selectedContrib?.value,
    start_date: startDate,
    end_date: endDate,
  });

  const fetchTasks = async (filters = {}) => {
    try {
      setLoading(true);
      // Omit status parameter so all tasks within the date range are returned.
      // This allows calculating pending and completed counts and total time used.
      const qs = buildQueryString({
        assign_to: filters.assign_to,
        contributon: filters.contributon,
        start_date: filters.start_date,
        end_date: filters.end_date,
      });
      const res = await ApiService(
        null,
        0,
        authHeader,
        fetchtaskforAdmin.method,
        `${fetchtaskforAdmin.url}${qs}`,
      );
      if (!res.data.error) setTasks(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const header = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService(
        null,
        0,
        header,
        fetchActiveEmployee.method,
        fetchActiveEmployee.url,
      );
      if (!res.data.error) {
        const options = (res.data.data || []).map((m) => ({
          value: m.id,
          label: `${m.first_name} ${m.last_name}`,
        }));
        setTeamMembers([{ value: "", label: "All Employees" }, ...options]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (id) => {
    try {
      setLoading(true);
      const res = await ApiService(
        null,
        id,
        authHeader,
        deleteTaskForAdmin.method,
        deleteTaskForAdmin.url,
      );
      if (!res.data.error) {
        toast.success(res.data.message);
        fetchTasks(currentFilters());
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id) => {
    SwalAlert({})
      .then(async (r) => {
        if (r?.isConfirmed) await deleteTask(id);
      })
      .catch(() => toast.error("Unable to remove"));
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Refetch whenever team member, contribution, or dates change
  useEffect(() => {
    const t = setTimeout(() => {
      fetchTasks(currentFilters());
      setPageIndex(0);
    }, 250);
    return () => clearTimeout(t);
  }, [selectedTeamMember, selectedContrib, startDate, endDate]);

  // ── Filtering by Status in Memory ──────────────────────────────
  const filtered = useMemo(() => {
    return tasks.filter((item) => {
      if (selectedStatus !== "" && selectedStatus !== "all") {
        if (Number(item.status) !== Number(selectedStatus)) return false;
      }
      return true;
    });
  }, [tasks, selectedStatus]);

  // Derived counts and time totals
  const allCount = tasks.length;
  const pendingCount = tasks.filter((t) => Number(t.status) === 0).length;
  const completedCount = tasks.filter((t) => Number(t.status) === 1).length;

  let filtTotalUsedMin = 0;
  let filtTotalAllocMin = 0;
  filtered.forEach((t) => {
    filtTotalUsedMin +=
      (Number(t.used_hours) || 0) * 60 + (Number(t.used_minutes) || 0);
    filtTotalAllocMin +=
      (Number(t.hours) || 0) * 60 + (Number(t.minutes) || 0);
  });
  const filteredUsedH = Math.floor(filtTotalUsedMin / 60);
  const filteredUsedM = filtTotalUsedMin % 60;
  const filteredAllocH = Math.floor(filtTotalAllocMin / 60);
  const filteredAllocM = filtTotalAllocMin % 60;

  // ── Pagination ────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(pageIndex, totalPages - 1);
  const pageData = filtered.slice(
    safePage * PAGE_SIZE,
    (safePage + 1) * PAGE_SIZE,
  );

  const canPrev = safePage > 0;
  const canNext = safePage < totalPages - 1;

  // Reset page when filters change
  const resetPage = () => setPageIndex(0);

  // ── Render ─────────────────────────────────

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div
        style={{
          minHeight: "100vh",
          fontFamily: "'DM Sans', sans-serif",
          padding: "28px 24px",
        }}
      >
        {/* ── Page Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 14,
            marginBottom: 20,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  width: 4,
                  height: 26,
                  borderRadius: 3,
                  background: `linear-gradient(180deg, ${THEME.brand} 0%, ${THEME.brandMid} 100%)`,
                }}
              />
              <h1
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 800,
                  color: THEME.text,
                  fontFamily: "'Sora', sans-serif",
                  letterSpacing: "-0.3px",
                }}
              >
                Task Management
              </h1>
            </div>
            <p
              style={{
                margin: "0 0 0 12px",
                fontSize: 12,
                color: THEME.textMuted,
              }}
            >
              {loading
                ? "Loading…"
                : `${filtered.length} task${filtered.length !== 1 ? "s" : ""} found`}
            </p>
          </div>
          <AddBtn onClick={() => navigate(`/${TodosRoute.add}`)} />
        </div>

        {/* ── Filter Bar ── */}
        <div
          style={{
            background: "#fff",
            border: `1px solid ${THEME.border}`,
            borderRadius: 14,
            padding: "16px 20px",
            marginBottom: 20,
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            alignItems: "flex-end",
            boxShadow: "0 2px 8px rgba(136,117,73,0.05)",
          }}
        >
          <StatusSelect
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              resetPage();
            }}
            allCount={allCount}
            pendingCount={pendingCount}
            completedCount={completedCount}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              minWidth: 170,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: THEME.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Assign To
            </span>
            <Select
              options={teamMembers}
              isLoading={loading}
              isSearchable
              value={selectedTeamMember}
              onChange={(v) => {
                setSelectedTeamMember(v);
                resetPage();
              }}
              styles={selectStyles}
              placeholder="All Employees"
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              minWidth: 170,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: THEME.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Contribution
            </span>
            <Select
              options={teamMembers}
              isLoading={loading}
              isSearchable
              value={selectedContrib}
              onChange={(v) => {
                setSelectedContrib(v);
                resetPage();
              }}
              styles={selectStyles}
              placeholder="All Members"
            />
          </div>

          <DateInput
            label="From"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              resetPage();
            }}
          />
          <DateInput
            label="To"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              resetPage();
            }}
          />

          {/* Clear filters */}
          {(selectedTeamMember || selectedContrib || startDate || endDate) && (
            <button
              onClick={() => {
                setSelectedTeamMember(null);
                setSelectedContrib(null);
                setStartDate("");
                setEndDate("");
                resetPage();
              }}
              style={{
                padding: "7px 12px",
                borderRadius: 10,
                border: "1px solid #E0D5C5",
                background: "#fff",
                fontSize: 12,
                color: "#595959",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                alignSelf: "flex-end",
              }}
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* ── Stats ── */}
        {!loading && tasks.length > 0 && (
          <StatsBar
            tasks={tasks}
            filteredTasks={filtered}
            selectedStatus={selectedStatus}
            onSelectStatus={(st) => {
              setSelectedStatus(st);
              resetPage();
            }}
          />
        )}

        {/* ── Loading ── */}
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
            <div className="spinner" />
            <p style={{ color: THEME.textLight, fontSize: 13, margin: 0 }}>
              Loading tasks…
            </p>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && filtered.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "64px 0",
              background: "#fff",
              border: `1px solid ${THEME.border}`,
              borderRadius: 14,
            }}
          >
            <div style={{ fontSize: 38, marginBottom: 10 }}>📋</div>
            <p style={{ color: THEME.textLight, fontSize: 14, margin: 0 }}>
              No tasks match the current filters.
            </p>
          </div>
        )}

        {/* ── Table ── */}
        {!loading && filtered.length > 0 && (
          <div
            className="fade-in"
            style={{
              background: "#fff",
              border: `1px solid ${THEME.border}`,
              borderRadius: 14,
              overflow: "hidden",
              boxShadow: "0 2px 12px rgba(136,117,73,0.07)",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <thead>
                  <tr style={{ background: THEME.brandLight }}>
                    {[
                      "#",
                      "Task",
                      "Created Date",
                      "Start Date",
                      "Due Date",
                      "Hours",
                      "Status",
                      "Collaboration",
                      "Assigned To",
                      "Actions",
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
                  {pageData.map((item, idx) => (
                    <TaskRow
                      key={item.id}
                      item={item}
                      index={safePage * PAGE_SIZE + idx}
                      onEdit={(id) => navigate(`/${TodosRoute.edit}/${id}`)}
                      onDelete={confirmDelete}
                      onStatus={(id) => {
                        setEditId(id);
                        setShowModal(true);
                      }}
                      onCounter={(id) => {
                        setEditId(id);
                        setShowCountModal(true);
                      }}
                      onUpdateTask={(item) => {
                        setUpdateTaskId(item.id);
                        setUpdateTaskText(item.task);
                        setUpdateTotalHours(item.hours); // total budget for this task
                          setUpdateTotalMinutes(item.minutes); 
                        setUpdateUsedHours(item.used_hours); // sum already logged, from backend
                        setUpdateUsedMinutes(item.used_minutes);
                        setShowUpdateModal(true);
                      }}
                    />
                  ))}
                </tbody>
                <tfoot>
                  <tr
                    style={{
                      background: "#FBF9F5",
                      borderTop: "2px solid #E0D5C5",
                    }}
                  >
                    <td
                      colSpan={5}
                      style={{
                        padding: "12px 14px",
                        fontSize: 12,
                        fontWeight: 700,
                        color: THEME.brandDark,
                      }}
                    >
                      Showing {filtered.length} of {allCount} tasks
                      {selectedStatus === "0" && " (Pending only)"}
                      {selectedStatus === "1" && " (Completed only)"}
                      {(selectedStatus === "" || selectedStatus === "all") &&
                        " (All statuses)"}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: THEME.brandDark,
                        }}
                      >
                        {filteredUsedH}h {filteredUsedM}m
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 500,
                            color: THEME.textMuted,
                          }}
                        >
                          {" "}
                          / {filteredAllocH}h {filteredAllocM}m
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          color: "#08979C",
                          fontWeight: 700,
                        }}
                      >
                        Total Time Used
                      </span>
                    </td>
                    <td
                      colSpan={4}
                      style={{
                        padding: "12px 14px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: THEME.textMuted,
                      }}
                    >
                      <span style={{ color: "#D46B08", fontWeight: 700 }}>
                        {pendingCount} Pending
                      </span>{" "}
                      ·{" "}
                      <span style={{ color: "#389E0D", fontWeight: 700 }}>
                        {completedCount} Completed
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {totalPages > 1 && (
              <Pagination
                page={safePage + 1}
                total={totalPages}
                canPrev={canPrev}
                canNext={canNext}
                onFirst={() => setPageIndex(0)}
                onPrev={() => setPageIndex((p) => p - 1)}
                onNext={() => setPageIndex((p) => p + 1)}
                onLast={() => setPageIndex(totalPages - 1)}
              />
            )}
          </div>
        )}
      </div>

      {/* ── Modals (unchanged API) ── */}
      <StatusModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        id={editId}
        onSuccess={() => fetchTasks(currentFilters())}
      />
      <CounterDataModal
        show={showCountModal}
        handleClose={() => setShowCountModal(false)}
        id={editId}
      />

      <AddPms
        show={showUpdateModal}
        handleClose={() => setShowUpdateModal(false)}
        id={updateTaskId}
        initialTask={updateTaskText}
        totalHours={updateTotalHours}
        totalMinutes={updateTotalMinutes}
        usedHours={updateUsedHours}
        usedMinutes={updateUsedMinutes}
        onSuccess={() => fetchTasks(currentFilters())}
      />
    </>
  );
}

export default ListAdmin;
