// ─────────────────────────────────────────────
//  ListTeam.jsx  —  Team Member Task View
//  Same design system as ListAdmin.jsx
// ─────────────────────────────────────────────

import React, { useEffect, useState, useMemo, useCallback, memo } from "react";
import ApiService from "../../../../services/ApiService";
import {
  fetchtaskforTask,
  fetchActiveEmployee,
} from "../../../../config/config";
import { getToken, getUserId } from "../../../../services/useLocalStorage";
import { useNavigate } from "react-router-dom";
import { TodosRoute } from "../../../../config/RouteConfig";
import StatusModal from "../StatusModal";
import CounterDataModal from "../CounterDataModal";
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
  // numeric keys from ListAdmin also supported
  2: { label: "High", color: "#CF1322", bg: "#FFF1F0", border: "#FFA39E" },
  1: { label: "Medium", color: "#D46B08", bg: "#FFF7E6", border: "#FFD591" },
  0: { label: "Low", color: "#389E0D", bg: "#F6FFED", border: "#B7EB8F" },
};

const PAGE_SIZE = 15;

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

function StyledSelect({ label, value, onChange, children }) {
  return (
    <div>
      {label && <FilterLabel>{label}</FilterLabel>}
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
          minWidth: 140,
          cursor: "pointer",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = THEME.brand;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#E0D5C5";
        }}
      >
        {children}
      </select>
    </div>
  );
}

/** Collaboration toggle — styled checkbox pill */
function CollabToggle({ checked, onChange }) {
  return (
    <div>
      <FilterLabel>Collaboration</FilterLabel>
      <label
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 14px",
          borderRadius: 20,
          cursor: "pointer",
          border: `1.5px solid ${checked ? THEME.brand : "#E0D5C5"}`,
          background: checked ? THEME.brandLight : "#fff",
          fontSize: 13,
          fontWeight: 600,
          color: checked ? THEME.brand : "#595959",
          transition: "all 0.18s",
        }}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          style={{ display: "none" }}
        />
        <span
          style={{
            width: 16,
            height: 16,
            borderRadius: 4,
            border: `2px solid ${checked ? THEME.brand : "#C4C4C4"}`,
            background: checked ? THEME.brand : "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "all 0.15s",
          }}
        >
          {checked && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path
                d="M1 4l3 3 5-6"
                stroke="#fff"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        🤝 Only collab
      </label>
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

const DEFAULT_AVATAR =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%23887549'><circle cx='12' cy='8' r='4'/><path d='M12 14c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z'/></svg>";

const AVATAR_COLORS = [
  "#1890FF",
  "#52C41A",
  "#FA8C16",
  "#722ED1",
  "#13C2C2",
  "#EB2F96",
  "#887549",
  "#2F54EB",
];

const getAvatarColor = (str) => {
  if (!str) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

// Lazy-loaded avatars, robust fallbacks
const AvatarStack = memo(({ profiles, title }) => {
  const cleanProfiles =
    profiles && profiles !== "null" && profiles !== "undefined"
      ? String(profiles)
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean)
      : [];

  const names =
    title && title !== "null" && title !== "undefined"
      ? String(title)
          .split(",")
          .map((n) => n.trim())
          .filter(Boolean)
      : [];

  if (cleanProfiles.length === 0 && names.length === 0) {
    return <span style={{ color: THEME.textLight, fontSize: 12 }}>—</span>;
  }

  const count = Math.max(cleanProfiles.length, names.length);
  const items = [];
  for (let i = 0; i < count; i++) {
    const rawPath = cleanProfiles[i] || "";
    const name = names[i] || names[0] || (cleanProfiles.length === 1 ? title : "") || "";
    items.push({ path: rawPath, name });
  }

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {items.map((item, i) => {
        const cleanPath = item.path.replace(/\\/g, "/").trim();
        const hasValidPath =
          cleanPath &&
          cleanPath !== "null" &&
          cleanPath !== "undefined" &&
          !cleanPath.endsWith("default/DefaultImage.png");

        const src = hasValidPath
          ? cleanPath.startsWith("http://") ||
            cleanPath.startsWith("https://") ||
            cleanPath.startsWith("data:")
            ? cleanPath
            : `${FileUrl}/${cleanPath.replace(/^\/+/, "")}`
          : "";

        const initial = item.name ? item.name.charAt(0).toUpperCase() : "";

        if (src) {
          return (
            <img
              key={i}
              src={src}
              alt={item.name || "User"}
              title={item.name || title || "User"}
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
                backgroundColor: "#F5EFE4",
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = DEFAULT_AVATAR;
              }}
            />
          );
        }

        return (
          <div
            key={i}
            title={item.name || title || "User"}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              border: "2px solid #fff",
              marginLeft: i === 0 ? 0 : -8,
              boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
              backgroundColor: initial ? getAvatarColor(item.name) : "#F5EFE4",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              userSelect: "none",
            }}
          >
            {initial ? (
              initial
            ) : (
              <img
                src={DEFAULT_AVATAR}
                alt="User"
                style={{ width: 16, height: 16 }}
              />
            )}
          </div>
        );
      })}
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
//  📊  STATS BAR
// ─────────────────────────────────────────────
function StatsBar({ tasks, filteredTasks, selectedStatus, onSelectStatus }) {
  const total = (tasks || []).length;
  const pending = (tasks || []).filter((t) => Number(t.status) === 0).length;
  const completed = (tasks || []).filter((t) => Number(t.status) === 1).length;
  const collab = (tasks || []).filter(
    (t) => t.contributon && t.contributon !== "0",
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
      key: "collab",
      label: "Collab",
      value: collab,
      color: "#2F54EB",
      bg: "#F0F5FF",
      border: "#ADC6FF",
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

// ─────────────────────────────────────────────
//  🏗  TABLE ROW  —  memo for performance
// ─────────────────────────────────────────────
const TaskRow = memo(({ item, index, onStatus, onCounter, onUpdateTask }) => {
  const [hov, setHov] = useState(false);
  const myId = String(getUserId());

  const isCollab = item.contributon && item.contributon !== "0";
  const amICollab =
    String(item.contributon) === myId ||
    String(item.contributon).includes(myId);

  // If current user is the contributor, collab partner is the creator/other person
  const collabProfiles = amICollab
    ? item.user_profile || item.contribution_profiles
    : item.contribution_profiles;
  const collabTitle = amICollab
    ? item.user_name || item.contributon_name
    : item.contributon_name;

  const assignProfiles =
    item.assign_to_profiles ||
    (isCollab ? item.user_profile : "") ||
    "";
  const assignTitle =
    item.assign_name ||
    (isCollab ? item.user_name || "Creator" : "") ||
    "";

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

      {/* Dates */}
      <td style={tdStyle()}>
        <span style={dateStyle}>{item.start_date || "—"}</span>
      </td>
      <td style={tdStyle()}>
        <span style={dateStyle}>{item.due_date || "—"}</span>
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

      {/* Collaboration avatars */}
      <td style={tdStyle()}>
        <AvatarStack profiles={collabProfiles} title={collabTitle} />
      </td>

      {/* Assigned To */}
      <td style={tdStyle()}>
        <AvatarStack
          profiles={assignProfiles}
          title={assignTitle}
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
function ListTeam() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [updateTotalMinutes, setUpdateTotalMinutes] = useState(0);
const [updateUsedMinutes, setUpdateUsedMinutes] = useState(0);

  // Filters
  const [selectedTeamMember, setSelectedTeamMember] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [collbration, setCollbration] = useState(false);
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

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ApiService(
        null,
        0,
        authHeader,
        fetchtaskforTask.method,
        fetchtaskforTask.url,
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
        setTeamMembers(
          (res.data.data || []).map((m) => ({
            value: m.id,
            label: `${m.first_name} ${m.last_name}`,
          })),
        );
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, []);

  // ── Filtering ─────────────────────────────

  const filtered = useMemo(() => {
    return tasks.filter((item) => {
      if (selectedTeamMember && !item.assign_to?.includes(selectedTeamMember))
        return false;
      if (selectedStatus !== "" && item.status != parseInt(selectedStatus))
        return false;
      if (collbration && (!item.contributon || item.contributon === "0"))
        return false;

      const taskDate = new Date(item.due_date);
      const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
      const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;
      if (start && taskDate < start) return false;
      if (end && taskDate > end) return false;
      return true;
    });
  }, [
    tasks,
    selectedTeamMember,
    selectedStatus,
    collbration,
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
    selectedTeamMember ||
    selectedStatus !== "" ||
    startDate ||
    endDate ||
    collbration;

  const clearFilters = () => {
    setSelectedTeamMember("");
    setSelectedStatus("");
    setStartDate("");
    setEndDate("");
    setCollbration(false);
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
                My Tasks
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
          {/* Team member dropdown — only shown for userId 231 */}
          {getUserId() === 231 && (
            <StyledSelect
              label="Team Member"
              value={selectedTeamMember}
              onChange={(e) => {
                setSelectedTeamMember(e.target.value);
                resetPage();
              }}
            >
              <option value="">All Members</option>
              {teamMembers.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </StyledSelect>
          )}

          <StyledSelect
            label="Status"
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              resetPage();
            }}
          >
            <option value="">All ({allCount})</option>
            <option value="0">Pending ({pendingCount})</option>
            <option value="1">Completed ({completedCount})</option>
          </StyledSelect>

          <CollabToggle
            checked={collbration}
            onChange={(e) => {
              setCollbration(e.target.checked);
              resetPage();
            }}
          />

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
                      "Action",
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
                        setUpdateUsedHours(item.used_hours); // sum already logged, from backend
                          setUpdateTotalMinutes(item.minutes);
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
        onSuccess={fetchTasks}
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
        onSuccess={fetchTasks}
      />
    </>
  );
}

export default ListTeam;
