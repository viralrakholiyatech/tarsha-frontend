// ─────────────────────────────────────────────
//  TopPerformer.jsx  —  Participants List
//  Same design system as ListAdmin / EmployeeList
// ─────────────────────────────────────────────

import React, { useEffect, useState, useCallback, memo } from "react";
import { FetchTopPerformer, updateMarks } from "../../../config/config";
import ApiService from "../../../services/ApiService";
import { getToken } from "../../../services/useLocalStorage";
import toast from "react-hot-toast";
import { FileUrl } from "../../../config/file_url";


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
  rowAlt:     "#FEFCF9",
  rowHover:   "#FDFAF5",
  text:       "#1A1A2E",
  textMuted:  "#ADADAD",
  textLight:  "#BDBDBD",
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }
  @keyframes tpFadeIn {
    from { opacity:0; transform:translateY(8px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .tp-fade { animation: tpFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes tpSpin { to { transform:rotate(360deg); } }
  .tp-spinner {
    width:28px; height:28px; border-radius:50%;
    border:3px solid ${THEME.brandLight};
    border-top-color:${THEME.brand};
    animation:tpSpin 0.8s linear infinite;
  }
  /* Compact number inputs inside table */
  .tp-num-input {
    width:90px; padding:7px 10px; border-radius:8px;
    border:1.5px solid #E0D5C5; font-size:13px;
    font-family:'DM Sans',sans-serif; color:#1A1A2E;
    outline:none; background:#fff; transition:border-color 0.15s;
    -moz-appearance:textfield;
  }
  .tp-num-input::-webkit-outer-spin-button,
  .tp-num-input::-webkit-inner-spin-button { -webkit-appearance:none; }
  .tp-num-input:focus { border-color:${THEME.brand}; box-shadow:0 0 0 3px ${THEME.brand}18; }
  .tp-num-input::placeholder { color:${THEME.textLight}; font-size:11px; }

  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background:${THEME.brandLight}; }
  ::-webkit-scrollbar-thumb { background:${THEME.brandMid}; border-radius:10px; }
`;

// ─────────────────────────────────────────────
//  SCORE CONFIG  —  each column's max + color
// ─────────────────────────────────────────────
const SCORE_COLS = [
  { key: "task_mark",   label: "Tasks",         max: 70,  color: "#2F54EB", bg: "#F0F5FF", border: "#ADC6FF" },
  { key: "attendance",  label: "Attendance",     max: 10,  color: "#389E0D", bg: "#F6FFED", border: "#B7EB8F" },
  { key: "meeting",     label: "Meeting",        max: 5,   color: "#08979C", bg: "#E6FFFB", border: "#87E8DE" },
  { key: "collabation", label: "Collaboration",  max: 5,   color: "#D46B08", bg: "#FFF7E6", border: "#FFD591" },
];

// ─────────────────────────────────────────────
//  🧩  ATOMS
// ─────────────────────────────────────────────

/** Coloured score pill */
function ScorePill({ value, max, color, bg, border }) {
  const pct = max ? Math.min(100, ((value ?? 0) / max) * 100) : 0;
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 3, minWidth: 54 }}>
      <span style={{
        padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
        background: bg, color, border: `1px solid ${border}`, whiteSpace: "nowrap",
      }}>
        {value ?? 0}<span style={{ fontSize: 10, fontWeight: 500, color: "#8C8C8C" }}>/{max}</span>
      </span>
      {/* Mini progress bar */}
      <div style={{ width: 48, height: 3, borderRadius: 4, background: "#EEE", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.4s" }} />
      </div>
    </div>
  );
}

/** On-time percentage pill — color shifts green/amber/red */
function OnTimePill({ value }) {
  const pct = value ?? 0;
  const color  = pct >= 80 ? "#389E0D" : pct >= 50 ? "#D46B08" : "#CF1322";
  const bg     = pct >= 80 ? "#F6FFED"  : pct >= 50 ? "#FFF7E6"  : "#FFF1F0";
  const border = pct >= 80 ? "#B7EB8F"  : pct >= 50 ? "#FFD591"  : "#FFA39E";
  return (
    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: bg, color, border: `1px solid ${border}`, whiteSpace: "nowrap" }}>
      {pct}%
    </span>
  );
}

/** Total marks badge — gold + rank dot */
function TotalBadge({ value, rank }) {
  const rankColor = rank === 1 ? "#FFD700" : rank === 2 ? "#C0C0C0" : rank === 3 ? "#CD7F32" : THEME.brand;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
      {rank <= 3 && (
        <span style={{ fontSize: 14 }}>{rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}</span>
      )}
      <span style={{
        padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 800,
        background: THEME.brandLight, color: THEME.brandDark,
        border: `1.5px solid ${rankColor}`, fontFamily: "'Sora',sans-serif",
      }}>
        {value ?? 0}
      </span>
    </div>
  );
}

/** Avatar with fallback initials */
function Avatar({ src, firstName, lastName }) {
  const [err, setErr] = useState(false);
  const initials = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();

  if (!src || err) {
    return (
      <div style={{
        width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
        background: `linear-gradient(135deg,${THEME.brand} 0%,${THEME.brandMid} 100%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 700, color: "#fff",
      }}>{initials}</div>
    );
  }
  return (
    <img src={`${FileUrl}/${src}`} alt={firstName}
      onError={() => setErr(true)}
      style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `2px solid ${THEME.brandLight}` }}
    />
  );
}

/** Per-row submit button */
function SubmitBtn({ onClick, submitting }) {
  const [hov, setHov] = useState(false);
  return (
    <button type="button" onClick={onClick} disabled={submitting}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: "6px 14px", borderRadius: 8, border: "none",
        background: submitting ? "#C4C4C4" : hov ? THEME.brandDark : THEME.brand,
        color: "#fff", fontSize: 12, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer",
        fontFamily: "'Sora',sans-serif", transition: "all 0.15s",
        display: "inline-flex", alignItems: "center", gap: 5,
        boxShadow: submitting ? "none" : `0 2px 6px ${THEME.brand}44`,
      }}>
      {submitting ? (
        <span style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid #ffffff88", borderTopColor: "#fff", display: "inline-block", animation: "tpSpin 0.7s linear infinite" }} />
      ) : "✓"} Save
    </button>
  );
}

// ─────────────────────────────────────────────
//  TABLE ROW  —  memo for performance
// ─────────────────────────────────────────────
const PerformerRow = memo(({ item, rank, formData, onChange, onSubmit }) => {
  const [hov,        setHov]        = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async (e) => {
    setSubmitting(true);
    await onSubmit(e, item.user_id);
    setSubmitting(false);
  };

  return (
    <tr
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ background: hov ? THEME.rowHover : rank % 2 === 0 ? "#fff" : THEME.rowAlt, transition: "background 0.15s" }}
    >
      {/* Rank */}
      <td style={td("center")}>
        <span style={{ fontSize: 13, fontWeight: 700, color: THEME.textMuted }}>{rank}</span>
      </td>

      {/* Employee */}
      <td style={td()}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 150 }}>
          <Avatar src={item.profile_picture} firstName={item.first_name} lastName={item.last_name} />
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: THEME.text }}>{item.first_name} {item.last_name}</p>
            {item.departmentName && (
              <p style={{ margin: 0, fontSize: 11, color: THEME.textMuted }}>{item.departmentName}</p>
            )}
          </div>
        </div>
      </td>

      {/* Score pills */}
      {SCORE_COLS.map(({ key, max, color, bg, border }) => (
        <td key={key} style={td("center")}>
          <ScorePill value={item[key]} max={max} color={color} bg={bg} border={border} />
        </td>
      ))}

      {/* On-time */}
      <td style={td("center")}>
        <OnTimePill value={item.on_time} />
      </td>

      {/* Software input */}
      <td style={td("center")}>
        <input type="number" className="tp-num-input" placeholder="0–10"
          name="software"
          value={formData[item.user_id]?.software ?? item.software ?? ""}
          onChange={(e) => onChange(e, item.user_id)}
        />
      </td>

      {/* Conflict input */}
      <td style={td("center")}>
        <input type="number" className="tp-num-input" placeholder="0–10"
          name="conflict"
          value={formData[item.user_id]?.conflict ?? item.conflict ?? ""}
          onChange={(e) => onChange(e, item.user_id)}
        />
      </td>

      {/* Total */}
      <td style={td("center")}>
        <TotalBadge value={item.total_marks_data} rank={rank} />
      </td>

      {/* Action */}
      <td style={td("center")}>
        <SubmitBtn onClick={handleSave} submitting={submitting} />
      </td>
    </tr>
  );
});

const td = (align = "left") => ({
  padding: "11px 14px",
  borderBottom: "1px solid #F5EFE4",
  verticalAlign: "middle",
  textAlign: align,
});

const HEADERS = ["#", "Employee", "Tasks", "Attendance", "Meeting", "Collab", "On Time", "Software", "Discipline", "Total", "Action"];
const HEADER_ALIGN = ["center", "left", "center", "center", "center", "center", "center", "center", "center", "center", "center"];


// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
function TopPerformer() {
  const [data,     setData]     = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [formData, setFormData] = useState({});

  const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };

  const fetchdata = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService(null, 0, header, FetchTopPerformer.method, FetchTopPerformer.url);
      if (!res.data.error) setData(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchdata(); }, []);

  const handleChange = useCallback((e, userId) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [userId]: { ...prev[userId], [name]: value } }));
  }, []);

  const handleSubmit = useCallback(async (e, userId) => {
    e.preventDefault();
    const userData = formData[userId];
    if (!userData?.software || !userData?.conflict)
      return toast.error("Please fill Software and Discipline fields.");

    try {
      const res = await ApiService({ ...userData, editId: userId }, 0, header, updateMarks.method, updateMarks.url);
      if (res.status === 200 && !res.data.error) {
        toast.success(res.data.message || "Marks saved");
        fetchdata();
      } else { toast.error(res.data?.message || "An error occurred"); }
    } catch { toast.error("An unexpected error occurred."); }
  }, [formData]);

  // Sort by total marks desc for ranking
  const ranked = [...data].sort((a, b) => (b.total_marks_data ?? 0) - (a.total_marks_data ?? 0));

  // Stats
  const avgTotal = data.length
    ? Math.round(data.reduce((s, d) => s + (d.total_marks_data ?? 0), 0) / data.length)
    : 0;
  const avgOnTime = data.length
    ? Math.round(data.reduce((s, d) => s + (d.on_time ?? 0), 0) / data.length)
    : 0;

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div style={{ minHeight: "100vh", background: THEME.bg, fontFamily: "'DM Sans',sans-serif", padding: "28px 24px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <div style={{ width: 4, height: 26, borderRadius: 3, background: `linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: THEME.text, fontFamily: "'Sora',sans-serif", letterSpacing: "-0.3px" }}>
              Participants List
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: THEME.textMuted }}>
              {loading ? "Loading…" : `${data.length} participant${data.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        {/* Stats bar */}
        {!loading && data.length > 0 && (
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            {[
              { label: "Total Participants", value: data.length,  color: THEME.brand,  bg: THEME.brandLight, border: "#D4C4A0" },
              { label: "Avg Score",          value: avgTotal,     color: "#2F54EB",    bg: "#F0F5FF",        border: "#ADC6FF" },
              { label: "Avg On-Time",        value: `${avgOnTime}%`, color: "#389E0D", bg: "#F6FFED",        border: "#B7EB8F" },
              { label: "Top Score",          value: ranked[0]?.total_marks_data ?? 0, color: "#D46B08", bg: "#FFF7E6", border: "#FFD591" },
            ].map((s) => (
              <div key={s.label} style={{
                flex: "0 1 160px", background: "#fff", border: `1px solid ${s.border}`,
                borderRadius: 12, padding: "12px 16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: s.color, fontFamily: "'Sora',sans-serif" }}>{s.value}</span>
                </div>
                <span style={{ fontSize: 11, color: "#8C8C8C", fontWeight: 600, lineHeight: 1.3 }}>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0", gap: 16 }}>
            <div className="tp-spinner" />
            <p style={{ color: THEME.textLight, fontSize: 13, margin: 0 }}>Loading participants…</p>
          </div>
        )}

        {/* Empty */}
        {!loading && data.length === 0 && (
          <div style={{ textAlign: "center", padding: "64px 0", background: "#fff", border: `1px solid ${THEME.border}`, borderRadius: 14 }}>
            <div style={{ fontSize: 38, marginBottom: 10 }}>🏆</div>
            <p style={{ color: THEME.textLight, fontSize: 14, margin: 0 }}>No participant data found.</p>
          </div>
        )}

        {/* Table */}
        {!loading && data.length > 0 && (
          <div className="tp-fade" style={{ background: "#fff", border: `1px solid ${THEME.border}`, borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 12px rgba(136,117,73,0.07)" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Sans',sans-serif" }}>
                <thead>
                  <tr style={{ background: THEME.brandLight }}>
                    {HEADERS.map((h, i) => (
                      <th key={h} style={{
                        padding: "11px 14px", fontSize: 11, fontWeight: 700,
                        color: THEME.brandDark, textTransform: "uppercase", letterSpacing: "0.07em",
                        borderBottom: "2px solid #D4C4A0", whiteSpace: "nowrap",
                        textAlign: HEADER_ALIGN[i],
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ranked.map((item, index) => (
                    <PerformerRow
                      key={item.user_id}
                      item={item}
                      rank={index + 1}
                      formData={formData}
                      onChange={handleChange}
                      onSubmit={handleSubmit}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer hint */}
            <div style={{ padding: "10px 18px", background: "#FDFAF5", borderTop: "1px solid #F5EFE4", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: THEME.textMuted }}>
                🏅 Ranked by total marks. Fill <b>Software</b> and <b>Discipline</b> fields and hit <b>Save</b> to update scores.
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default TopPerformer;