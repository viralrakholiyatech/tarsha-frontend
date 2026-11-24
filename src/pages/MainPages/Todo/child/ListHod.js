import React, { useEffect, useState, useMemo, useCallback, memo } from "react";
import ApiService from "../../../../services/ApiService";
import {
  fetchtaskforHod,
  fetchActiveEmployee,
} from "../../../../config/config";
import { getToken, getUserId } from "../../../../services/useLocalStorage";
import { TodosRoute } from "../../../../config/RouteConfig";
import { useNavigate } from "react-router-dom";
import StatusModal from "../StatusModal";
import CounterDataModal from "../CounterDataModal";
import Select from "react-select";
import { FileUrl } from "../../../../config/file_url";
import AddPms from "../../pms/Add";

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
  rowAlt: "#FEFCF9",
  rowHover: "#FDFAF5",
  text: "#1A1A2E",
  textMuted: "#ADADAD",
  textLight: "#BDBDBD",
};

// ─────────────────────────────────────────────
//  🏷  PRIORITY CONFIG
// ─────────────────────────────────────────────
const PRIORITY = {
  High: { label: "High", color: "#CF1322", bg: "#FFF1F0", border: "#FFA39E" },
  Medium: {
    label: "Medium",
    color: "#D46B08",
    bg: "#FFF7E6",
    border: "#FFD591",
  },
  Low: { label: "Low", color: "#389E0D", bg: "#F6FFED", border: "#B7EB8F" },
  2: { label: "High", color: "#CF1322", bg: "#FFF1F0", border: "#FFA39E" },
  1: { label: "Medium", color: "#D46B08", bg: "#FFF7E6", border: "#FFD591" },
  0: { label: "Low", color: "#389E0D", bg: "#F6FFED", border: "#B7EB8F" },
};

// ─────────────────────────────────────────────
//  ⏰  OVERDUE THRESHOLD (days)
// ─────────────────────────────────────────────
const OVERDUE_DAYS = 7;

const PAGE_SIZE = 15;

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

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }
  @keyframes fadeIn {
    from { opacity:0; transform:translateY(8px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .fade-in { animation: fadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner {
    width:28px; height:28px; border-radius:50%;
    border:3px solid ${THEME.brandLight};
    border-top-color:${THEME.brand};
    animation:spin 0.8s linear infinite;
  }
  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background:${THEME.brandLight}; }
  ::-webkit-scrollbar-thumb { background:${THEME.brandMid}; border-radius:10px; }
`;

// ─────────────────────────────────────────────
//  🔧  HELPERS
// ─────────────────────────────────────────────

/** Returns true if due date is more than OVERDUE_DAYS days ago */
function isDueDateExpired(dueDate) {
  if (!dueDate) return false;
  const diffDays = (new Date() - new Date(dueDate)) / (1000 * 60 * 60 * 24);
  return diffDays > OVERDUE_DAYS;
}

function buildQueryString(params) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.append(k, v);
  });
  const s = qs.toString();
  return s ? `?${s}` : "";
}

// ─────────────────────────────────────────────
//  🧩  UI PIECES
// ─────────────────────────────────────────────

function FilterLabel({ children }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: THEME.textMuted,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        display: "block",
        marginBottom: 4,
      }}
    >
      {children}
    </span>
  );
}

function DateInput({ label, value, onChange }) {
  return (
    <div>
      <FilterLabel>{label}</FilterLabel>
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

function StatusSelect({
  value,
  onChange,
  allCount,
  pendingCount,
  completedCount,
}) {
  return (
    <div>
      <FilterLabel>Status</FilterLabel>
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
        onFocus={(e) => {
          e.target.style.borderColor = THEME.brand;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#E0D5C5";
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

function PriorityDot({ priority }) {
  const p = PRIORITY[String(priority)] || PRIORITY["Low"];
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
      }}
      title="Click to change status"
    >
      {isDone ? "✓ Completed" : "● Pending"}
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
      title="View counter details"
    >
      {count}
    </span>
  );
}

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


function HoursCell({ total, used, totalMinutes, usedMinutes }) {
  const t = Number(total) || 0;
  const u = Number(used) || 0;
  const tm = Number(totalMinutes) || 0;
  const um = Number(usedMinutes) || 0;

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

/** Overdue warning pill — shown when task is >OVERDUE_DAYS days past due */
function OverduePill() {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "1px 8px",
        borderRadius: 20,
        fontSize: 10,
        fontWeight: 700,
        background: "#FFF1F0",
        color: "#CF1322",
        border: "1px solid #FFA39E",
        marginLeft: 6,
        whiteSpace: "nowrap",
      }}
    >
      ⚠ Overdue
    </span>
  );
}

const AvatarStack = memo(({ profiles, title }) => {
  if (!profiles || profiles === "null" || profiles.trim() === "") {
    return <span style={{ color: THEME.textLight, fontSize: 12 }}>—</span>;
  }
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {profiles.split(",").map((path, i) => (
        <img
          key={i}
          src={`${FileUrl}/${path.trim()}`}
          alt=""
          title={title || ""}
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
});

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
  const done = (tasks || []).filter((t) => Number(t.status) === 1).length;
  const overdue = (tasks || []).filter(
    (t) => Number(t.status) === 0 && isDueDateExpired(t.due_date),
  ).length;

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
      value: done,
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
      key: "overdue",
      label: "Overdue",
      value: overdue,
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
const TaskRow = memo(({ item, index, onStatus, onCounter,  onUpdateTask, }) => {
  const [hov, setHov] = useState(false);
  const myId = String(getUserId());
  const expired = isDueDateExpired(item.due_date) && item.status === 0;

  // Collaboration column: show user_profile if current user IS the contributor
  const collabProfiles =
    item.contributon === myId ? item.user_profile : item.contribution_profiles;

  const collabTitle =
    item.contributon === myId ? item.user_name : item.contributon_name;

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
          : expired
            ? "#FFFBF9" // very subtle red tint for overdue rows
            : index % 2 === 0
              ? "#fff"
              : THEME.rowAlt,
        transition: "background 0.15s",
        borderLeft: expired ? "3px solid #FFA39E" : "3px solid transparent",
      }}
    >
      {/* # */}
      <td style={tdStyle(true)}>{index + 1}</td>

      {/* Task */}
      <td style={{ ...tdStyle(), maxWidth: 360 }}>
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
            {item.contributon && item.contributon !== "0" && (
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

      {/* Start date */}
      <td style={tdStyle()}>
        <span style={dateStyle}>{item.start_date || "—"}</span>
      </td>

      {/* Due date — with overdue pill */}
      <td style={tdStyle()}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            flexWrap: "wrap",
          }}
        >
          <span style={dateStyle}>
            {item.formatted_due_date || item.due_date || "—"}
          </span>
          {expired && <OverduePill />}
        </div>
      </td>

       <td style={tdStyle()}>
        <HoursCell
    total={item.hours}
    used={item.used_hours}
    totalMinutes={item.minutes}
    usedMinutes={item.used_minutes}
  />
      </td>

      {/* Status */}
      <td style={tdStyle()}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <StatusBadge status={item.status} onClick={() => onStatus(item.id)} />
          <CounterBadge
            count={item.counter}
            onClick={() => onCounter(item.id)}
          />
        </div>
      </td>

      {/* Collaboration */}
      <td style={tdStyle()}>
        <AvatarStack profiles={collabProfiles} title={collabTitle} />
      </td>

      {/* Assigned To */}
      <td style={tdStyle()}>
        <AvatarStack
          profiles={item.assign_to_profiles}
          title={item.assign_name}
        />
      </td>
<td style={tdStyle()}>
         {/* <PlusBtn onClick={() => onUpdateTask(item)} /> */}
      </td>
    </tr>
  );
});

const tdStyle = (center = false) => ({
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
function ListHod() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [updateTotalMinutes, setUpdateTotalMinutes] = useState(0);
const [updateUsedMinutes, setUpdateUsedMinutes] = useState(0);

  // Filters
  const [selectedTeamMember, setSelectedTeamMember] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedContrib, setSelectedContrib] = useState(null);
  const [selectedContribId, setSelectedContribId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showCountModal, setShowCountModal] = useState(false);
  const [editId, setEditId] = useState("");

    const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateTaskId, setUpdateTaskId] = useState("");
  const [updateTaskText, setUpdateTaskText] = useState("");
  const [updateTotalHours, setUpdateTotalHours] = useState(0); // ← add this
  const [updateUsedHours, setUpdateUsedHours] = useState(0);

  const authHeader = {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };

  // ── API ───────────────────────────────────

  const currentFilters = () => ({
    assign_to: selectedTeamMember?.value,
    contributon: selectedContrib?.value,
    start_date: startDate,
    end_date: endDate,
  });

  const fetchTasks = useCallback(async (filters = {}) => {
    try {
      setLoading(true);

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
        fetchtaskforHod.method,
        `${fetchtaskforHod.url}${qs}`,
      );
      if (!res.data.error) setTasks(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEmployees = useCallback(async () => {
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
  }, []);
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Debounced re-fetch on filter changes
  useEffect(() => {
    const t = setTimeout(() => {
      fetchTasks(currentFilters());
      setPageIndex(0);
    }, 250);
    return () => clearTimeout(t);
  }, [selectedTeamMember, selectedContrib, startDate, endDate]);

  // ── Filtering ─────────────────────────────

  const filtered = useMemo(() => {
    return tasks.filter((item) => {
      if (selectedTeam && !item.assign_to?.includes(selectedTeam)) return false;
      if (selectedContribId && !item.contributon?.includes(selectedContribId))
        return false;
      if (selectedStatus !== "" && selectedStatus !== "all") {
        if (Number(item.status) !== Number(selectedStatus)) return false;
      }

      const taskDate = new Date(item.due_date);
      const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
      const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;
      if (start && taskDate < start) return false;
      if (end && taskDate > end) return false;
      return true;
    });
  }, [
    tasks,
    selectedTeam,
    selectedContribId,
    selectedStatus,
    startDate,
    endDate,
  ]);

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
  const resetPage = useCallback(() => setPageIndex(0), []);

  const hasActiveFilters =
    selectedTeam ||
    selectedContribId ||
    selectedStatus !== "" ||
    startDate ||
    endDate;

  const clearFilters = () => {
    setSelectedTeamMember(null);
    setSelectedTeam(null);
    setSelectedContrib(null);
    setSelectedContribId(null);
    setSelectedStatus("");
    setStartDate("");
    setEndDate("");
    resetPage();
  };

  const handleStatus = useCallback((id) => {
    setEditId(id);
    setShowModal(true);
  }, []);
  const handleCounter = useCallback((id) => {
    setEditId(id);
    setShowCountModal(true);
  }, []);

  // ── Render ────────────────────────────────

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
        {/* Header */}
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
                Department Tasks
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

        {/* Filter bar */}
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

          {/* Contribution react-select */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 0,
              minWidth: 180,
            }}
          >
            <FilterLabel>Contribution</FilterLabel>
            <Select
              options={teamMembers}
              isLoading={loading}
              isSearchable
              value={selectedContrib}
              onChange={(v) => {
                setSelectedContrib(v);
                setSelectedContribId(v?.value || null);
                resetPage();
              }}
              styles={selectStyles}
              placeholder="All Members"
            />
          </div>

          {/* Assign To react-select */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 0,
              minWidth: 180,
            }}
          >
            <FilterLabel>Team Member</FilterLabel>
            <Select
              options={teamMembers}
              isLoading={loading}
              isSearchable
              value={selectedTeamMember}
              onChange={(v) => {
                setSelectedTeamMember(v);
                setSelectedTeam(v?.value || null);
                resetPage();
              }}
              styles={selectStyles}
              placeholder="All Employees"
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

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
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
              ✕ Clear all
            </button>
          )}
        </div>

        {/* Stats */}
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
            <div className="spinner" />
            <p style={{ color: THEME.textLight, fontSize: 13, margin: 0 }}>
              Loading tasks…
            </p>
          </div>
        )}

        {/* Empty state */}
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
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                style={{
                  marginTop: 12,
                  padding: "7px 16px",
                  borderRadius: 10,
                  border: `1px solid ${THEME.border}`,
                  background: THEME.brandLight,
                  color: THEME.brand,
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Table */}
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
                      "Start Date",
                      "Due Date",
                        "Hours",
                      "Status",
                      "Collaboration",
                      "Assigned To",
                      "Action"
                      
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
                      onStatus={handleStatus}
                      onCounter={handleCounter}
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
                      colSpan={4}
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
                canPrev={safePage > 0}
                canNext={safePage < totalPages - 1}
                onFirst={() => setPageIndex(0)}
                onPrev={() => setPageIndex((p) => p - 1)}
                onNext={() => setPageIndex((p) => p + 1)}
                onLast={() => setPageIndex(totalPages - 1)}
              />
            )}
          </div>
        )}
      </div>

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
        totalMinutes={updateTotalMinutes}
        totalHours={updateTotalHours}
        usedHours={updateUsedHours}
        usedMinutes={updateUsedMinutes}
        onSuccess={() => fetchTasks(currentFilters())}
      />
    </>
  );
}

export default ListHod;
