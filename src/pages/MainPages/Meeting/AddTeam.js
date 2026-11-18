

import React, { useEffect, useState, useCallback, memo } from "react";
import { fetchmstMeeting } from "../../../config/config";
import ApiService from "../../../services/ApiService";
import { getToken } from "../../../services/useLocalStorage";
import EditMeetingModal from "./Components/EditMeetingModal";
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
  @keyframes mtFadeIn {
    from { opacity:0; transform:translateY(8px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .mt-fade { animation: mtFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes mtSpin { to { transform:rotate(360deg); } }
  .mt-spinner {
    width:28px; height:28px; border-radius:50%;
    border:3px solid ${THEME.brandLight};
    border-top-color:${THEME.brand};
    animation:mtSpin 0.8s linear infinite;
  }
  /* Overlapping avatar stack */
  .mt-avatar-stack { display:flex; align-items:center; }
  .mt-avatar-stack .av { margin-left:-8px; transition:transform 0.15s, z-index 0s; }
  .mt-avatar-stack .av:first-child { margin-left:0; }
  .mt-avatar-stack:hover .av { margin-left:2px; }

  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background:${THEME.brandLight}; }
  ::-webkit-scrollbar-thumb { background:${THEME.brandMid}; border-radius:10px; }
`;


// ─────────────────────────────────────────────
//  🧩  ATOMS
// ─────────────────────────────────────────────

/** Single avatar with tooltip fallback to initials */
function Avatar({ src, name, size = 30, zIndex = 0 }) {
  const [err, setErr] = useState(false);
  const initials = (name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="av" title={name}
      style={{ width: size, height: size, borderRadius: "50%", zIndex, position: "relative", flexShrink: 0, border: "2px solid #fff" }}>
      {!src || err ? (
        <div style={{
          width: "100%", height: "100%", borderRadius: "50%",
          background: `linear-gradient(135deg,${THEME.brand} 0%,${THEME.brandMid} 100%)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: size * 0.34, fontWeight: 700, color: "#fff",
        }}>{initials}</div>
      ) : (
        <img src={`${FileUrl}/${src}`} alt={name}
          onError={() => setErr(true)}
          style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
        />
      )}
    </div>
  );
}

/** Stacked avatar group from comma-separated strings */
function AvatarStack({ pictures = "", names = "", max = 4 }) {
  const picArr  = pictures ? pictures.split(",").map(p => p.trim()).filter(Boolean) : [];
  const nameArr = names   ? names.split(",").map(n => n.trim())   : [];
  const total   = nameArr.length || picArr.length;
  if (total === 0) return <span style={{ fontSize: 12, color: THEME.textLight, fontStyle: "italic" }}>—</span>;

  const visible = Math.min(total, max);
  const overflow = total - visible;

  return (
    <div className="mt-avatar-stack" style={{ flexWrap: "nowrap" }}>
      {Array.from({ length: visible }).map((_, i) => (
        <Avatar
          key={i}
          src={picArr[i] || ""}
          name={nameArr[i] || ""}
          size={30}
          zIndex={visible - i}
        />
      ))}
      {overflow > 0 && (
        <div className="av" style={{
          width: 30, height: 30, borderRadius: "50%",
          background: THEME.brandLight, border: `2px solid ${THEME.brandMid}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700, color: THEME.brand,
        }}>+{overflow}</div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  // status === 0 → Active (matching original logic)
  const active = status === 0;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: active ? "#F6FFED" : "#FFF1F0",
      color:       active ? "#389E0D" : "#CF1322",
      border:     `1px solid ${active ? "#B7EB8F" : "#FFA39E"}`,
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: active ? "#389E0D" : "#CF1322" }} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function EditIconBtn({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} title="Edit"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: 32, height: 32, borderRadius: 8, cursor: "pointer",
        background: hov ? THEME.brandLight : "#fff",
        border: `1.5px solid ${hov ? THEME.brand : "#E0D5C5"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: hov ? THEME.brand : "#657488", transition: "all 0.15s",
      }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none">
        <path d="M13.26 4L5.05 12.69C4.74 13.02 4.44 13.67 4.38 14.12L4.01 17.36C3.88 18.53 4.72 19.33 5.88 19.13L9.1 18.58C9.55 18.5 10.18 18.17 10.49 17.83L18.7 9.14C20.12 7.64 20.76 5.93 18.55 3.84C16.35 1.77 14.68 2.5 13.26 4Z" stroke="currentColor" strokeWidth="1.8" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M11.89 5.45C12.32 8.21 14.56 10.32 17.34 10.6" stroke="currentColor" strokeWidth="1.8" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 22H21" stroke="currentColor" strokeWidth="1.8" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

// ─────────────────────────────────────────────
//  TABLE ROW  —  memo for performance
// ─────────────────────────────────────────────
const MeetingRow = memo(({ item, index, onEdit }) => {
  const [hov, setHov] = useState(false);
  return (
    <tr
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? THEME.rowHover : index % 2 === 0 ? "#fff" : THEME.rowAlt,
        transition: "background 0.15s",
      }}
    >
      {/* Index */}
      <td style={td("center")}>
        <span style={{ fontSize: 12, fontWeight: 700, color: THEME.textMuted }}>{index + 1}</span>
      </td>

      {/* Department */}
      <td style={td()}>
        {item.department_name ? (
          <span style={{
            display: "inline-block", padding: "3px 12px", borderRadius: 20,
            fontSize: 11, fontWeight: 700,
            background: THEME.brandLight, color: THEME.brandDark,
            border: `1px solid #D4C4A0`,
          }}>
            🏢 {item.department_name}
          </span>
        ) : "—"}
      </td>

      {/* Facilitator */}
      <td style={td()}>
        <AvatarStack pictures={item.facilator_profile} names={item.facilator_name} max={3} />
      </td>

      {/* Team Members */}
      <td style={td()}>
        <AvatarStack pictures={item.participants_pictures} names={item.participants_name} max={5} />
      </td>

      {/* Status */}
      <td style={td("center")}>
        <StatusBadge status={item.status} />
      </td>

      {/* Action */}
      <td style={td("center")}>
        <EditIconBtn onClick={() => onEdit(item.id)} />
      </td>
    </tr>
  );
});

const td = (align = "left") => ({
  padding: "12px 14px",
  borderBottom: "1px solid #F5EFE4",
  verticalAlign: "middle",
  textAlign: align,
});

const HEADERS      = ["#", "Department", "Facilitator", "Team Members", "Status", "Action"];
const HEADER_ALIGN = ["center", "left", "left", "left", "center", "center"];


// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
function MeetingTeamList() {
  const [data,      setData]      = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editId,    setEditId]    = useState("");

  const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };

  const fetchmeeting = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService(null, 0, header, fetchmstMeeting.method, fetchmstMeeting.url);
      if (!res.data.error) setData(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchmeeting(); }, []);

  const handleEdit  = useCallback((id) => { setEditId(id); setShowModal(true); }, []);

  // Quick stats
  const active   = data.filter((d) => d.status === 0).length;
  const inactive = data.length - active;

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div style={{ minHeight: "100vh", background: THEME.bg, fontFamily: "'DM Sans',sans-serif", padding: "28px 24px" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <div style={{ width: 4, height: 26, borderRadius: 3, background: `linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: THEME.text, fontFamily: "'Sora',sans-serif", letterSpacing: "-0.3px" }}>
              Meeting Teams
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: THEME.textMuted }}>
              {loading ? "Loading…" : `${data.length} team${data.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        {/* ── Stats ── */}
        {!loading && data.length > 0 && (
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            {[
              { label: "Total Teams", value: data.length, color: THEME.brand, bg: THEME.brandLight, border: "#D4C4A0" },
              { label: "Active",      value: active,      color: "#389E0D",   bg: "#F6FFED",        border: "#B7EB8F" },
              { label: "Inactive",    value: inactive,    color: "#CF1322",   bg: "#FFF1F0",        border: "#FFA39E" },
            ].map((s) => (
              <div key={s.label} style={{
                flex: "0 1 150px", background: "#fff", border: `1px solid ${s.border}`,
                borderRadius: 12, padding: "12px 16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: s.color, fontFamily: "'Sora',sans-serif" }}>{s.value}</span>
                </div>
                <span style={{ fontSize: 11, color: "#8C8C8C", fontWeight: 600 }}>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0", gap: 16 }}>
            <div className="mt-spinner" />
            <p style={{ color: THEME.textLight, fontSize: 13, margin: 0 }}>Loading meeting teams…</p>
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && data.length === 0 && (
          <div style={{ textAlign: "center", padding: "64px 0", background: "#fff", border: `1px solid ${THEME.border}`, borderRadius: 14 }}>
            <div style={{ fontSize: 38, marginBottom: 10 }}>🤝</div>
            <p style={{ color: THEME.textLight, fontSize: 14, margin: 0 }}>No meeting teams found.</p>
          </div>
        )}

        {/* ── Table ── */}
        {!loading && data.length > 0 && (
          <div className="mt-fade" style={{ background: "#fff", border: `1px solid ${THEME.border}`, borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 12px rgba(136,117,73,0.07)" }}>
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
                  {data.map((item, idx) => (
                    <MeetingRow
                      key={item.id}
                      item={item}
                      index={idx}
                      onEdit={handleEdit}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <EditMeetingModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        id={editId}
        onSuccess={fetchmeeting}
      />
    </>
  );
}

export default MeetingTeamList;