import React, { useEffect, useState, useRef } from "react";
import ApiService from "../../../services/ApiService";
import { fetchAllLeave } from "../../../config/config";
import { getToken } from "../../../services/useLocalStorage";
import ApprovedModal from "./ApprovedModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faChevronDown, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { FileUrl } from "../../../config/file_url";

const BRAND       = "#887549";
const BRAND_LIGHT = "#F5F0E8";
const BRAND_MID   = "#C4A97D";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const leaveTypeColors = {
  sick:       { bg: "#FFF1F0", color: "#FF4D4F", label: "Sick" },
  casual:     { bg: "#F0F5FF", color: "#2F54EB", label: "Casual" },
  annual:     { bg: "#F6FFED", color: "#52C41A", label: "Annual" },
  emergency:  { bg: "#FFF7E6", color: "#FA8C16", label: "Emergency" },
  "half day": { bg: "#F9F0FF", color: "#722ED1", label: "Half Day" },
  "full day": { bg: "#E6FFFB", color: "#08979C", label: "Full Day" },
  halfday:    { bg: "#F9F0FF", color: "#722ED1", label: "Half Day" },
  fullday:    { bg: "#E6FFFB", color: "#08979C", label: "Full Day" },
  default:    { bg: BRAND_LIGHT, color: BRAND,   label: "Leave" },
};

function getLeaveStyle(type) {
  return leaveTypeColors[type?.toLowerCase()] || leaveTypeColors.default;
}

function formatDate(raw) {
  if (!raw) return "—";
  let d = new Date(raw);
  if (isNaN(d)) {
    const parts = raw.split(/[-/]/);
    if (parts.length === 3) d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  }
  if (isNaN(d)) return raw;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function parseDate(raw) {
  if (!raw) return null;
  let d = new Date(raw);
  if (isNaN(d)) {
    const parts = raw.split(/[-/]/);
    if (parts.length === 3) d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  }
  return isNaN(d) ? null : d;
}

function getAvailableMonths(leaves) {
  const seen = new Set();
  const list = [];
  leaves.forEach((l) => {
    const d = parseDate(l.date);
    if (!d) return;
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!seen.has(key)) {
      seen.add(key);
      list.push({ year: d.getFullYear(), month: d.getMonth() });
    }
  });
  list.sort((a, b) => b.year - a.year || b.month - a.month);
  return list;
}

function filterByMonth(leaves, year, month) {
  return leaves.filter((l) => {
    const d = parseDate(l.date);
    return d && d.getFullYear() === year && d.getMonth() === month;
  });
}

/* ─── Avatar ─── */
function Avatar({ src, name }) {
  const [err, setErr] = useState(false);
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";
  if (err || !src) {
    return (
      <div style={{
        width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
        background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_MID} 100%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontWeight: 700, fontSize: 13,
      }}>
        {initials}
      </div>
    );
  }
  return (
    <img src={src} alt={name} onError={() => setErr(true)}
      style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
  );
}

/* ─── Leave Row ─── */
// Grid: avatar | employee+reason | leave date | leave type | applied at | status | action
function LeaveRow({ meeting, onEdit, isLast }) {
  const [hovered, setHovered] = useState(false);
  const fullName  = `${meeting.first_name} ${meeting.last_name}`;
  const typeStyle = getLeaveStyle(meeting.leave_type);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "38px 1fr 150px 110px 150px 115px 44px",
        alignItems: "center",
        gap: 14,
        padding: "13px 22px",
        borderBottom: isLast ? "none" : "1px solid #F5F0E8",
        background: hovered ? "#FDFAF5" : "transparent",
        transition: "background 0.15s",
      }}
    >
      {/* Avatar */}
      <Avatar src={`${FileUrl}/${meeting.profile_picture}`} name={fullName} />

      {/* Name + Reason */}
      <div style={{ overflow: "hidden" }}>
        <p style={{
          margin: 0, fontWeight: 600, fontSize: 14, color: "#1A1A2E",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {fullName}
        </p>
        <p style={{
          margin: "2px 0 0", fontSize: 12, color: "#ADADAD",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {meeting.reason || "—"}
        </p>
      </div>

      {/* Leave Date */}
      <span style={{ fontSize: 13, color: "#595959", whiteSpace: "nowrap" }}>
        {formatDate(meeting.date)}
      </span>

      {/* Leave Type */}
      <span style={{
        display: "inline-block",
        padding: "3px 10px", borderRadius: 20,
        fontSize: 11, fontWeight: 700,
        background: typeStyle.bg, color: typeStyle.color,
        textTransform: "uppercase", letterSpacing: "0.06em",
        whiteSpace: "nowrap",
        border: `1px solid ${typeStyle.color}22`,
      }}>
        {typeStyle.label}
      </span>

      {/* Applied At */}
      <span style={{ fontSize: 13, color: "#595959", whiteSpace: "nowrap" }}>
        {formatDate(meeting.applied_at || meeting.created_at)}
      </span>

      {/* Status */}
      <div>
        {meeting.status ? (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
            background: meeting.status == 1 ? "#F6FFED" : "#FFF1F0",
            color: meeting.status == 1 ? "#389E0D" : "#CF1322",
            border: `1px solid ${meeting.status == 1 ? "#B7EB8F" : "#FFA39E"}`,
            whiteSpace: "nowrap",
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: meeting.status == 1 ? "#52C41A" : "#FF4D4F",
              display: "inline-block",
            }} />
            {meeting.status == 1 ? "Approved" : "Rejected"}
          </span>
        ) : (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
            background: "#FFFBE6", color: "#D48806",
            border: "1px solid #FFE58F", whiteSpace: "nowrap",
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "#FAAD14", display: "inline-block",
            }} />
            Pending
          </span>
        )}
      </div>

      {/* Action */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        {!meeting.status && (
          <button
            onClick={() => onEdit(meeting.id)}
            title="Review Leave"
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: hovered ? BRAND_LIGHT : "#F5F5F5",
              border: `1px solid ${hovered ? BRAND_MID : "#E8E8E8"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "all 0.15s",
              color: hovered ? BRAND : "#595959",
            }}
          >
            <FontAwesomeIcon icon={faPencil} style={{ fontSize: 12 }} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Month/Year Dropdown ─── */
function MonthYearDropdown({ available, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const label = selected ? `${MONTHS[selected.month]} ${selected.year}` : "Select Month";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "9px 16px", borderRadius: 10,
          background: open ? BRAND : "#fff",
          border: `1.5px solid ${open ? BRAND : "#E0D5C5"}`,
          color: open ? "#fff" : BRAND,
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 600, fontSize: 14,
          cursor: "pointer", transition: "all 0.18s",
          boxShadow: open ? `0 4px 16px ${BRAND}33` : "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        <FontAwesomeIcon icon={faCalendarAlt} style={{ fontSize: 13 }} />
        {label}
        <FontAwesomeIcon
          icon={faChevronDown}
          style={{
            fontSize: 11, marginLeft: 2,
            transform: open ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0,
          background: "#fff", borderRadius: 12, border: "1px solid #EDE5D5",
          boxShadow: "0 8px 32px rgba(136,117,73,0.15)",
          minWidth: 190, zIndex: 999, overflow: "hidden",
          animation: "dropIn 0.18s cubic-bezier(0.4,0,0.2,1)",
        }}>
          {available.map((item, i) => {
            const isActive = selected && selected.year === item.year && selected.month === item.month;
            return (
              <div
                key={i}
                onClick={() => { onChange(item); setOpen(false); }}
                style={{
                  padding: "10px 16px",
                  fontSize: 14, fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#fff" : "#434343",
                  background: isActive ? BRAND : "transparent",
                  cursor: "pointer", transition: "background 0.12s",
                  borderBottom: i < available.length - 1 ? "1px solid #F5EFE4" : "none",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = BRAND_LIGHT; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                {MONTHS[item.month]} {item.year}
              </div>
            );
          })}
          {available.length === 0 && (
            <div style={{ padding: "12px 16px", color: "#BFBFBF", fontSize: 13 }}>No data</div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Stats Bar ─── */
function StatsBar({ leaves }) {
  const total    = leaves.length;
  const pending  = leaves.filter((l) => !l.status).length;
  const approved = leaves.filter((l) => l.status == 1).length;
  const rejected = leaves.filter((l) => l.status == 2).length;

  const stats = [
    { label: "Total",    value: total,    color: BRAND,     bg: BRAND_LIGHT, border: "#D4C4A0" },
    { label: "Pending",  value: pending,  color: "#D48806", bg: "#FFFBE6",   border: "#FFE58F" },
    { label: "Approved", value: approved, color: "#389E0D", bg: "#F6FFED",   border: "#B7EB8F" },
    { label: "Rejected", value: rejected, color: "#CF1322", bg: "#FFF1F0",   border: "#FFA39E" },
  ];

  return (
    <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
      {stats.map((s) => (
        <div key={s.label} style={{
          flex: "1 1 120px", background: "#fff",
          border: `1px solid ${s.border}`, borderRadius: 12,
          padding: "14px 18px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          display: "flex", alignItems: "center", gap: 13,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 11,
            background: s.bg,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: `1px solid ${s.border}`,
          }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</span>
          </div>
          <span style={{ fontSize: 13, color: "#8C8C8C", fontWeight: 600 }}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Main Component ─── */
function LeaveApprove() {
  const [leave, setLeave]                = useState([]);
  const [editshowModal, setEditShowModal] = useState(false);
  const [editId, setEditId]              = useState(null);
  const [loading, setLoading]            = useState(true);
  const [selected, setSelected]          = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchLeaveList = async () => {
      try {
        const header = {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        };
        const res = await ApiService(null, 0, header, fetchAllLeave.method, fetchAllLeave.url);
        if (isMounted) {
          const data = res.data.data;
          setLeave(data);
          const now = new Date();
          const currentKey = { year: now.getFullYear(), month: now.getMonth() };
          const available  = getAvailableMonths(data);
          const hasCurrent = available.some(
            (a) => a.year === currentKey.year && a.month === currentKey.month
          );
          setSelected(hasCurrent ? currentKey : available[0] || currentKey);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setLoading(false);
      }
    };
    fetchLeaveList();
    return () => { isMounted = false; };
  }, []);

  const handleEditShowModal  = (id) => { setEditId(id); setEditShowModal(true); };
  const handleEditCloseModal = ()   => { setEditShowModal(false); setEditId(null); };

  const available     = getAvailableMonths(leave);
  const filteredLeave = selected ? filterByMonth(leave, selected.year, selected.month) : [];
  const monthLabel    = selected ? `${MONTHS[selected.month]} ${selected.year}` : "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.35s cubic-bezier(0.4,0,0.2,1) both; }
        .skeleton-pulse {
          background: linear-gradient(90deg,#f0ebe0 25%,#e8e0d0 50%,#f0ebe0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 12px;
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        fontFamily: "'DM Sans', sans-serif", padding: "32px 28px",
      }}>

        {/* ── Header ── */}
        <div style={{
          display: "flex", alignItems: "flex-start",
          justifyContent: "space-between", flexWrap: "wrap",
          gap: 14, marginBottom: 24,
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div style={{
                width: 4, height: 28, borderRadius: 4,
                background: `linear-gradient(180deg, ${BRAND} 0%, ${BRAND_MID} 100%)`,
              }} />
              <h1 style={{
                margin: 0, fontSize: 24, fontWeight: 800,
                color: "#1A1A2E", letterSpacing: "-0.4px",
              }}>
                Leave Requests
              </h1>
            </div>
            <p style={{ margin: "0 0 0 14px", color: "#ADADAD", fontSize: 13 }}>
              {loading
                ? "Loading..."
                : `Showing ${filteredLeave.length} request${filteredLeave.length !== 1 ? "s" : ""} for ${monthLabel}`}
            </p>
          </div>

          {!loading && (
            <MonthYearDropdown
              available={available}
              selected={selected}
              onChange={setSelected}
            />
          )}
        </div>

        {/* ── Stats ── */}
        {!loading && <StatsBar leaves={filteredLeave} />}

        {/* ── Skeleton ── */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="skeleton-pulse" style={{ height: 72 }} />
            <div className="skeleton-pulse" style={{ height: 260 }} />
          </div>
        )}

        {/* ── Table ── */}
        {!loading && (
          <div className="fade-up">
            {filteredLeave.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "60px 0",
                background: "#fff", border: "1px solid #EDE5D5", borderRadius: 14,
              }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                <p style={{ color: "#BFBFBF", fontSize: 14, margin: 0 }}>
                  No leave requests for <strong>{monthLabel}</strong>
                </p>
              </div>
            ) : (
              <div style={{
                background: "#fff",
                border: "1px solid #EDE5D5",
                borderRadius: 14,
                overflow: "hidden",
                boxShadow: "0 2px 12px rgba(136,117,73,0.08)",
              }}>
                {/* Column headers */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "38px 1fr 150px 110px 150px 115px 44px",
                  gap: 14, padding: "11px 22px",
                  background: BRAND_LIGHT,
                  borderBottom: "1px solid #EDE5D5",
                }}>
                  {["", "Employee", "Leave Date", "Type", "Applied At", "Status", ""].map((h, i) => (
                    <span key={i} style={{
                      fontSize: 11, fontWeight: 700, color: BRAND,
                      textTransform: "uppercase", letterSpacing: "0.08em",
                    }}>
                      {h}
                    </span>
                  ))}
                </div>

                {/* Month label sub-row */}
                <div style={{
                  padding: "7px 22px",
                  background: "#FDFAF5",
                  borderBottom: "1px solid #F5EFE4",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <FontAwesomeIcon icon={faCalendarAlt} style={{ color: BRAND_MID, fontSize: 12 }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: BRAND, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                    {monthLabel}
                  </span>
                  <span style={{ fontSize: 11, color: "#BFBFBF", fontWeight: 500 }}>
                    — {filteredLeave.length} record{filteredLeave.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Data rows */}
                {filteredLeave.map((meeting, idx) => (
                  <LeaveRow
                    key={meeting.id || idx}
                    meeting={meeting}
                    onEdit={handleEditShowModal}
                    isLast={idx === filteredLeave.length - 1}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <ApprovedModal
        editshow={editshowModal}
        handleeditClose={handleEditCloseModal}
        editId={editId}
      />
    </>
  );
}

export default LeaveApprove;