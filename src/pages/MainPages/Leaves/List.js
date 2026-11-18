import React, { useEffect, useState, useMemo } from "react";
import { getToken } from "../../../services/useLocalStorage";
import ApiService from "../../../services/ApiService";
import { getLeaveByTeamIdForTeam } from "../../../config/config";
import toast from "react-hot-toast";

const BRAND       = "#887549";
const BRAND_LIGHT = "#F5F0E8";
const BRAND_MID   = "#C4A97D";
const BRAND_DARK  = "#5C4E32";

const MONTHS_FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];

/* ── Format date as "12 March 2025" ── */
function formatDate(raw) {
  if (!raw) return "—";
  const d = new Date(raw);
  if (isNaN(d)) return raw;
  return `${d.getDate()} ${MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}`;
}

/* ── Leave type badge ── */
const leaveTypeColors = {
  "sick":     { bg: "#FFF1F0", color: "#FF4D4F", border: "#FFA39E", label: "Sick" },
  "casual":   { bg: "#F0F5FF", color: "#2F54EB", border: "#ADC6FF", label: "Casual" },
  "annual":   { bg: "#F6FFED", color: "#52C41A", border: "#B7EB8F", label: "Annual" },
  "emergency":{ bg: "#FFF7E6", color: "#FA8C16", border: "#FFD591", label: "Emergency" },
  "half day": { bg: "#F9F0FF", color: "#722ED1", border: "#D3ADF7", label: "Half Day" },
  "full day": { bg: "#E6FFFB", color: "#08979C", border: "#87E8DE", label: "Full Day" },
  "halfday":  { bg: "#F9F0FF", color: "#722ED1", border: "#D3ADF7", label: "Half Day" },
  "fullday":  { bg: "#E6FFFB", color: "#08979C", border: "#87E8DE", label: "Full Day" },
  default:    { bg: BRAND_LIGHT, color: BRAND,   border: "#D4C4A0", label: "Leave" },
};

function LeaveTypeBadge({ type }) {
  const s = leaveTypeColors[(type || "").toLowerCase()] || leaveTypeColors.default;
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 700,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap",
    }}>
      {s.label}
    </span>
  );
}

/* ── Status badge ── */
function StatusBadge({ label }) {
  const lower = (label || "").toLowerCase();
  let bg, color, border, dot;
  if (lower === "approved") {
    bg = "#F6FFED"; color = "#389E0D"; border = "#B7EB8F"; dot = "#52C41A";
  } else if (lower === "rejected") {
    bg = "#FFF1F0"; color = "#CF1322"; border = "#FFA39E"; dot = "#FF4D4F";
  } else {
    bg = "#FFFBE6"; color = "#D48806"; border = "#FFE58F"; dot = "#FAAD14";
  }
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
      background: bg, color, border: `1px solid ${border}`, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, display: "inline-block" }} />
      {label || "Pending"}
    </span>
  );
}

/* ── Stats Bar ── */
function StatsBar({ data }) {
  const total    = data.length;
  const approved = data.filter((r) => (r.Status || "").toLowerCase() === "approved").length;
  const rejected = data.filter((r) => (r.Status || "").toLowerCase() === "rejected").length;
  const pending  = data.filter((r) => {
    const s = (r.Status || "").toLowerCase();
    return s !== "approved" && s !== "rejected";
  }).length;

  const stats = [
    { label: "Total",    value: total,    color: BRAND,     bg: BRAND_LIGHT, border: "#D4C4A0" },
    { label: "Pending",  value: pending,  color: "#D48806", bg: "#FFFBE6",   border: "#FFE58F" },
    { label: "Approved", value: approved, color: "#389E0D", bg: "#F6FFED",   border: "#B7EB8F" },
    { label: "Rejected", value: rejected, color: "#CF1322", bg: "#FFF1F0",   border: "#FFA39E" },
  ];

  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 22, flexWrap: "wrap" }}>
      {stats.map((s) => (
        <div key={s.label} style={{
          flex: "1 1 110px", background: "#fff",
          border: `1px solid ${s.border}`, borderRadius: 12,
          padding: "13px 16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: s.bg, border: `1px solid ${s.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: s.color }}>{s.value}</span>
          </div>
          <span style={{ fontSize: 12, color: "#8C8C8C", fontWeight: 600 }}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Search Input ── */
function SearchInput({ value, onChange }) {
  return (
    <div style={{ position: "relative" }}>
      <span style={{
        position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
        color: BRAND_MID, fontSize: 14, pointerEvents: "none",
      }}>🔍</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by reason, type, status…"
        style={{
          paddingLeft: 34, paddingRight: 14, paddingTop: 9, paddingBottom: 9,
          borderRadius: 10, border: `1.5px solid #E0D5C5`,
          fontSize: 13, color: "#434343",
          fontFamily: "'DM Sans', sans-serif",
          outline: "none", width: 240,
          background: "#fff",
          transition: "border-color 0.18s",
        }}
        onFocus={(e) => { e.target.style.borderColor = BRAND; }}
        onBlur={(e)  => { e.target.style.borderColor = "#E0D5C5"; }}
      />
    </div>
  );
}

/* ── Table Row ── */
function LeaveRow({ row, idx, isLast }) {
  const [hov, setHov] = useState(false);
  return (
    <tr
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "#FDFAF5" : idx % 2 === 0 ? "#fff" : "#FEFCF9",
        transition: "background 0.15s",
      }}
    >
      {/* Sr */}
      <td style={{
        padding: "12px 16px", textAlign: "center",
        borderBottom: isLast ? "none" : "1px solid #F5EFE4",
        fontSize: 12, color: "#BDBDBD", fontWeight: 600,
      }}>
        {idx + 1}
      </td>

      {/* Date */}
      <td style={{
        padding: "12px 16px",
        borderBottom: isLast ? "none" : "1px solid #F5EFE4",
        whiteSpace: "nowrap", fontSize: 13, color: "#595959", fontWeight: 500,
      }}>
        {formatDate(row.Date)}
      </td>

      {/* Leave Type */}
      <td style={{
        padding: "12px 16px",
        borderBottom: isLast ? "none" : "1px solid #F5EFE4",
      }}>
        <LeaveTypeBadge type={row.Leave} />
      </td>

      {/* Reason */}
      <td style={{
        padding: "12px 16px",
        borderBottom: isLast ? "none" : "1px solid #F5EFE4",
        maxWidth: 280,
      }}>
        <span style={{
          fontSize: 13, color: "#434343",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {row.Reason || "—"}
        </span>
      </td>

      {/* Status */}
      <td style={{
        padding: "12px 16px",
        borderBottom: isLast ? "none" : "1px solid #F5EFE4",
      }}>
        <StatusBadge label={row.Status} />
      </td>
    </tr>
  );
}

/* ── Pagination ── */
function Pagination({ page, totalPages, onPrev, onNext, onFirst, onLast, canPrev, canNext }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "flex-end",
      gap: 6, padding: "12px 20px",
      borderTop: "1px solid #F5EFE4",
      background: "#FDFAF5",
    }}>
      {[
        { label: "«", action: onFirst,  disabled: !canPrev },
        { label: "‹", action: onPrev,   disabled: !canPrev },
      ].map((b) => (
        <button key={b.label} onClick={b.action} disabled={b.disabled} style={{
          width: 32, height: 32, borderRadius: 8,
          background: b.disabled ? "#F5F5F5" : "#fff",
          border: `1px solid ${b.disabled ? "#E8E8E8" : "#E0D5C5"}`,
          color: b.disabled ? "#BDBDBD" : BRAND,
          cursor: b.disabled ? "default" : "pointer",
          fontSize: 14, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.15s",
        }}>
          {b.label}
        </button>
      ))}

      <span style={{
        fontSize: 13, color: "#595959", fontWeight: 600,
        padding: "0 8px",
      }}>
        Page <span style={{ color: BRAND }}>{page}</span> of {totalPages}
      </span>

      {[
        { label: "›", action: onNext,  disabled: !canNext },
        { label: "»", action: onLast,  disabled: !canNext },
      ].map((b) => (
        <button key={b.label} onClick={b.action} disabled={b.disabled} style={{
          width: 32, height: 32, borderRadius: 8,
          background: b.disabled ? "#F5F5F5" : "#fff",
          border: `1px solid ${b.disabled ? "#E8E8E8" : "#E0D5C5"}`,
          color: b.disabled ? "#BDBDBD" : BRAND,
          cursor: b.disabled ? "default" : "pointer",
          fontSize: 14, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.15s",
        }}>
          {b.label}
        </button>
      ))}
    </div>
  );
}

/* ── Main ── */
const List = () => {
  const [custData, setCustData] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const PAGE_SIZE = 10;

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const header = {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      };
      const res = await ApiService(null, 0, header, getLeaveByTeamIdForTeam.method, getLeaveByTeamIdForTeam.url);
      if (!res.data.error) {
        const payload = res.data.data;
        if (Array.isArray(payload) && payload.length > 0) {
          setCustData(payload.map((el) => ({
            id:     el.id,
            Date:   el.date,
            Leave:  el.att_type,
            Reason: el.reason,
            Notes:  el.notes,
            Status: el.status_label,
          })));
        }
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  /* Filter */
  const filtered = useMemo(() => {
    if (!search.trim()) return custData;
    const q = search.toLowerCase();
    return custData.filter((r) =>
      (r.Reason || "").toLowerCase().includes(q) ||
      (r.Leave  || "").toLowerCase().includes(q) ||
      (r.Status || "").toLowerCase().includes(q) ||
      formatDate(r.Date).toLowerCase().includes(q)
    );
  }, [custData, search]);

  /* Pagination */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(pageIndex, totalPages - 1);
  const pageData   = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const canPrev = safePage > 0;
  const canNext = safePage < totalPages - 1;

  return (
    <>
      <style>{`
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
          border: 3px solid ${BRAND_LIGHT};
          border-top-color: ${BRAND};
          animation: spin 0.8s linear infinite;
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        fontFamily: "'DM Sans', sans-serif", padding: "28px 24px",
      }}>

        {/* ── Header ── */}
        <div style={{
          display: "flex", alignItems: "flex-start",
          justifyContent: "space-between", flexWrap: "wrap",
          gap: 14, marginBottom: 22,
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{
                width: 4, height: 26, borderRadius: 3,
                background: `linear-gradient(180deg, ${BRAND} 0%, ${BRAND_MID} 100%)`,
              }} />
              <h1 style={{
                margin: 0, fontSize: 22, fontWeight: 800, color: "#1A1A2E",
                fontFamily: "'Sora', sans-serif", letterSpacing: "-0.3px",
              }}>
                My Leaves
              </h1>
            </div>
            <p style={{ margin: "0 0 0 12px", fontSize: 12, color: "#ADADAD" }}>
              {loading ? "Loading…" : `${filtered.length} record${filtered.length !== 1 ? "s" : ""} found`}
            </p>
          </div>

          <SearchInput value={search} onChange={(v) => { setSearch(v); setPageIndex(0); }} />
        </div>

        {/* ── Stats ── */}
        {!loading && custData.length > 0 && <StatsBar data={custData} />}

        {/* ── Loading ── */}
        {loading && (
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "80px 0", gap: 16,
          }}>
            <div className="spinner" />
            <p style={{ color: "#BFBFBF", fontSize: 13, margin: 0 }}>Loading leaves…</p>
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && filtered.length === 0 && (
          <div style={{
            textAlign: "center", padding: "64px 0",
            background: "#fff", border: "1px solid #EDE5D5",
            borderRadius: 14,
          }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
            <p style={{ color: "#BFBFBF", fontSize: 14, margin: 0 }}>
              {search ? `No results for "${search}"` : "No leave records found."}
            </p>
          </div>
        )}

        {/* ── Table ── */}
        {!loading && filtered.length > 0 && (
          <div className="fade-in" style={{
            background: "#fff",
            border: "1px solid #EDE5D5",
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 2px 12px rgba(136,117,73,0.07)",
          }}>
            {/* Column headers */}
            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%", borderCollapse: "collapse",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                <thead>
                  <tr style={{ background: BRAND_LIGHT }}>
                    {["#", "Date", "Leave Type", "Reason", "Status"].map((h, i) => (
                      <th key={i} style={{
                        padding: "11px 16px",
                        fontSize: 11, fontWeight: 700, color: BRAND,
                        textTransform: "uppercase", letterSpacing: "0.08em",
                        borderBottom: "2px solid #D4C4A0",
                        textAlign: i === 0 ? "center" : "left",
                        whiteSpace: "nowrap",
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((row, idx) => (
                    <LeaveRow
                      key={row.id || idx}
                      row={row}
                      idx={safePage * PAGE_SIZE + idx}
                      isLast={idx === pageData.length - 1}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                page={safePage + 1}
                totalPages={totalPages}
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
    </>
  );
};

export default List;