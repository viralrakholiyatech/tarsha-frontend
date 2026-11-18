import React, { useEffect, useState } from "react";
import ApiService from "../../../services/ApiService";
import { fetchcounterDataById } from "../../../config/config";
import { getToken } from "../../../services/useLocalStorage";

const T = {
  brand:      "#887549",
  brandLight: "#F5F0E8",
  brandMid:   "#C4A97D",
  brandDark:  "#5C4E32",
  bg:         "#F8F5F0",
  border:     "#EDE5D5",
  text:       "#1A1A2E",
  textMuted:  "#8C8C8C",
  textLight:  "#BDBDBD",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

  @keyframes cdm-in  { from{opacity:0}                          to{opacity:1} }
  @keyframes cdm-up  { from{opacity:0;transform:translateY(20px) scale(0.97)} to{opacity:1;transform:none} }
  @keyframes cdm-row { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:none} }
  @keyframes cdm-spin{ to{transform:rotate(360deg)} }

  .cdm-overlay {
    position:fixed;inset:0;z-index:1050;
    background:rgba(20,18,14,0.5);
    backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);
    display:flex;align-items:center;justify-content:center;padding:16px;
    animation:cdm-in 0.18s ease both;
  }
  .cdm-panel {
    background:#fff;width:100%;max-width:780px;
    border-radius:18px;overflow:hidden;
    box-shadow:0 32px 72px rgba(136,117,73,0.22),0 4px 16px rgba(0,0,0,0.1);
    animation:cdm-up 0.26s cubic-bezier(0.22,1,0.36,1) both;
    display:flex;flex-direction:column;max-height:88vh;
  }

  /* ── Header ─────────────────────────────────── */
  .cdm-hd {
    display:flex;align-items:center;justify-content:space-between;
    padding:18px 22px 14px;
    background:linear-gradient(120deg,${T.brandLight} 0%,#fff 55%);
    border-bottom:1.5px solid ${T.border};flex-shrink:0;
  }
  .cdm-hd-left { display:flex;align-items:center;gap:12px; }
  .cdm-icon {
    width:38px;height:38px;border-radius:10px;flex-shrink:0;
    background:${T.brandLight};border:1.5px solid ${T.border};
    display:flex;align-items:center;justify-content:center;font-size:17px;
  }
  .cdm-title {
    margin:0;font-size:16px;font-weight:800;color:${T.text};
    font-family:'Sora',sans-serif;letter-spacing:-0.2px;
  }
  .cdm-subtitle {
    margin:2px 0 0;font-size:11px;color:${T.textMuted};
    font-family:'DM Sans',sans-serif;font-weight:500;
  }
  .cdm-x {
    width:30px;height:30px;border-radius:8px;cursor:pointer;
    border:1.5px solid ${T.border};background:#fff;
    display:flex;align-items:center;justify-content:center;
    color:${T.textMuted};font-size:14px;font-weight:700;
    transition:background 0.14s,border-color 0.14s,color 0.14s;
    line-height:1;font-family:'DM Sans',sans-serif;
  }
  .cdm-x:hover { background:${T.brandLight};border-color:${T.brand};color:${T.brandDark}; }

  /* ── Body ────────────────────────────────────── */
  .cdm-body {
    overflow-y:auto;padding:18px 22px;flex:1;
    scrollbar-width:thin;scrollbar-color:${T.brandMid} ${T.brandLight};
  }
  .cdm-body::-webkit-scrollbar{width:4px}
  .cdm-body::-webkit-scrollbar-track{background:${T.brandLight}}
  .cdm-body::-webkit-scrollbar-thumb{background:${T.brandMid};border-radius:10px}

  /* ── Column headers ──────────────────────────── */
  .cdm-col-heads {
    display:grid;
    grid-template-columns:88px 88px 76px 1fr 110px;
    gap:0 12px;padding:0 14px 8px;
    font-size:10px;font-weight:700;text-transform:uppercase;
    letter-spacing:0.08em;color:${T.textMuted};
    font-family:'DM Sans',sans-serif;
    border-bottom:1.5px solid ${T.border};margin-bottom:10px;
  }

  /* ── Row card ────────────────────────────────── */
  .cdm-row-card {
    display:grid;
    grid-template-columns:88px 88px 76px 1fr 110px;
    gap:0 12px;align-items:center;
    padding:11px 14px;border-radius:12px;
    border:1.5px solid ${T.border};background:#fff;
    margin-bottom:8px;
    box-shadow:0 1px 4px rgba(136,117,73,0.06);
    transition:box-shadow 0.15s,border-color 0.15s,transform 0.15s;
    animation:cdm-row 0.22s ease both;
  }
  .cdm-row-card:hover {
    border-color:${T.brandMid};
    box-shadow:0 4px 16px rgba(136,117,73,0.13);
    transform:translateY(-1px);
  }

  /* ── Date chip ───────────────────────────────── */
  .cdm-chip {
    display:inline-flex;align-items:center;gap:4px;
    padding:3px 9px;border-radius:20px;
    font-size:11px;font-weight:600;white-space:nowrap;
    font-family:'DM Sans',sans-serif;
  }
  .cdm-chip-date { background:${T.brandLight};color:${T.brandDark};border:1px solid #D4C4A0; }
  .cdm-chip-due  { background:#FFF1F0;color:#CF1322;border:1px solid #FFBBB8; }
  .cdm-chip-team { background:#E6F4FF;color:#0958D9;border:1px solid #91CAFF; }
  .cdm-chip-client{ background:#FFF7E6;color:#D46B08;border:1px solid #FFD591; }
  .cdm-chip-other { background:${T.brandLight};color:${T.brandDark};border:1px solid #D4C4A0; }

  /* ── Remarks ─────────────────────────────────── */
  .cdm-rem {
    font-size:12px;color:${T.text};line-height:1.45;
    font-family:'DM Sans',sans-serif;word-break:break-word;
  }

  /* ── Rejected by ─────────────────────────────── */
  .cdm-by {
    display:inline-flex;align-items:center;gap:6px;
    font-size:12px;font-weight:600;color:${T.brandDark};
    font-family:'DM Sans',sans-serif;
  }
  .cdm-avatar {
    width:22px;height:22px;border-radius:50%;flex-shrink:0;
    background:linear-gradient(135deg,${T.brand},${T.brandMid});
    display:flex;align-items:center;justify-content:center;
    font-size:9px;font-weight:700;color:#fff;letter-spacing:0;
    border:1.5px solid ${T.border};font-family:'DM Sans',sans-serif;
  }

  /* ── States ──────────────────────────────────── */
  .cdm-state { text-align:center;padding:52px 0;font-family:'DM Sans',sans-serif; }
  .cdm-state-icon { font-size:36px;margin-bottom:10px; }
  .cdm-state p { margin:0;font-size:13px;color:${T.textLight}; }
  .cdm-spinner {
    width:26px;height:26px;border-radius:50%;margin:0 auto 12px;
    border:3px solid ${T.brandLight};border-top-color:${T.brand};
    animation:cdm-spin 0.8s linear infinite;
  }
`;

function fmt(d) {
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2,"0")}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getFullYear()).slice(2)}`;
}

function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length-1][0]).toUpperCase()
    : parts[0].slice(0,2).toUpperCase();
}

function ReasonChip({ raw }) {
  if (raw === "0" || raw?.toLowerCase() === "team")
    return <span className="cdm-chip cdm-chip-team">👥 Team</span>;
  if (raw === "1" || raw?.toLowerCase() === "client")
    return <span className="cdm-chip cdm-chip-client">🤝 Client</span>;
  return <span className="cdm-chip cdm-chip-other">{raw || "—"}</span>;
}

const CounterDataModal = ({ show, handleClose, id }) => {
  const [loading, setLoading] = useState(false);
  const [task,    setTask]    = useState([]);

  const header = {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };

  const fetchdata = async () => {
    try {
      setLoading(true);
      const res = await ApiService(null, id, header, fetchcounterDataById.method, fetchcounterDataById.url);
      if (!res.data?.error) setTask(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (show && id) fetchdata(); }, [id, show]);

  if (!show) return null;

  return (
    <>
      <style>{CSS}</style>
      <div className="cdm-overlay" onClick={handleClose}>
        <div className="cdm-panel" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="cdm-hd">
            <div className="cdm-hd-left">
              <div className="cdm-icon">📋</div>
              <div>
                <p className="cdm-title">Task Reason Log</p>
                <p className="cdm-subtitle">
                  {loading ? "Loading…" : `${task.length} ${task.length === 1 ? "entry" : "entries"} found`}
                </p>
              </div>
            </div>
            <button className="cdm-x" onClick={handleClose}>✕</button>
          </div>

          {/* Body */}
          <div className="cdm-body">

            {/* Loading */}
            {loading && (
              <div className="cdm-state">
                <div className="cdm-spinner" />
                <p>Fetching records…</p>
              </div>
            )}

            {/* Empty */}
            {!loading && task.length === 0 && (
              <div className="cdm-state">
                <div className="cdm-state-icon">🗂️</div>
                <p>No records available.</p>
              </div>
            )}

            {/* List */}
            {!loading && task.length > 0 && (
              <>
                {/* Column heads */}
                <div className="cdm-col-heads">
                  <span>Date</span>
                  <span>Due Date</span>
                  <span>Reason</span>
                  <span>Remarks</span>
                  <span>Rejected By</span>
                </div>

                {/* Rows */}
                {task.map((item, idx) => (
                  <div
                    key={idx}
                    className="cdm-row-card"
                    style={{ animationDelay:`${idx * 0.04}s` }}
                  >
                    {/* Date */}
                    <span className="cdm-chip cdm-chip-date">
                      🗓 {fmt(item.created_at)}
                    </span>

                    {/* Due date */}
                    <span className="cdm-chip cdm-chip-due">
                      ⏰ {fmt(item.due_date)}
                    </span>

                    {/* Reason */}
                    <ReasonChip raw={item.reason} />

                    {/* Remarks */}
                    <span className="cdm-rem" title={item.remarks}>
                      {item.remarks || <em style={{ color:T.textLight }}>—</em>}
                    </span>

                    {/* Rejected by */}
                    <span className="cdm-by">
                      <span className="cdm-avatar">{initials(item.first_name)}</span>
                      {item.first_name || "—"}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default CounterDataModal;