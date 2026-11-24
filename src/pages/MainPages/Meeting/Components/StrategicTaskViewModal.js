import React, { useEffect, useState } from "react";
import ApiService from "../../../../services/ApiService";
import { getToken } from "../../../../services/useLocalStorage";
import { fetchtaskforstrategic } from "../../../../config/config";

const THEME = {
  brand:      "#887549",
  brandLight: "#F5F0E8",
  brandMid:   "#C4A97D",
  brandDark:  "#5C4E32",
  border:     "#EDE5D5",
  text:       "#1A1A2E",
  textMuted:  "#ADADAD",
  textLight:  "#BDBDBD",
};

const MODAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }

  .stv-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45); z-index: 1040;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .stv-dialog {
    background: #fff; border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.18);
    width: 100%; max-width: 780px; max-height: 90vh;
    display: flex; flex-direction: column;
    font-family: 'DM Sans', sans-serif; overflow: hidden;
  }
  .stv-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px; border-bottom: 1px solid ${THEME.border};
    background: #FDFAF5; flex-shrink: 0;
  }
  .stv-body {
    padding: 20px 24px; overflow-y: auto; flex: 1;
  }
  .stv-body::-webkit-scrollbar { width: 4px; }
  .stv-body::-webkit-scrollbar-thumb { background: ${THEME.brandMid}; border-radius: 4px; }

  /* Table */
  .stv-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .stv-table th {
    padding: 10px 14px; font-size: 10px; font-weight: 700;
    color: ${THEME.brandDark}; text-transform: uppercase;
    letter-spacing: 0.07em; background: ${THEME.brandLight};
    border-bottom: 2px solid #D4C4A0; text-align: left; white-space: nowrap;
  }
  .stv-table td {
    padding: 12px 14px; border-bottom: 1px solid #F5EFE4;
    vertical-align: middle;
  }
  .stv-table tbody tr:nth-child(even) { background: #FEFCF9; }
  .stv-table tbody tr:hover { background: ${THEME.brandLight}; transition: background 0.12s; }

  /* Priority badge */
  .stv-priority {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 8px; border-radius: 20px;
    font-size: 10px; font-weight: 700;
    font-family: 'DM Sans', sans-serif; white-space: nowrap;
  }
  .stv-priority-dot {
    width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
  }

  /* Status badge */
  .stv-status {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px; border-radius: 20px;
    font-size: 11px; font-weight: 700;
    font-family: 'DM Sans', sans-serif;
  }

  /* Counter bubble */
  .stv-counter {
    display: inline-flex; align-items: center; justify-content: center;
    width: 20px; height: 20px; border-radius: 50%;
    background: ${THEME.brand}; color: #fff;
    font-size: 10px; font-weight: 800;
    font-family: 'Sora', sans-serif;
  }

  @keyframes stvSpin { to { transform: rotate(360deg); } }
  .stv-spinner {
    width: 26px; height: 26px; border-radius: 50%;
    border: 3px solid ${THEME.brandLight}; border-top-color: ${THEME.brand};
    animation: stvSpin 0.8s linear infinite;
    margin: 60px auto; display: block;
  }
`;

// ─────────────────────────────────────────────
//  🧩  HELPERS
// ─────────────────────────────────────────────
const PRIORITY_MAP = {
  High:   { bg: "#FFF1F0", color: "#CF1322", border: "#FFA39E", dot: "#FF4D4F" },
  Medium: { bg: "#FFFBE6", color: "#D48806", border: "#FFE58F", dot: "#FAAD14" },
  Low:    { bg: "#F6FFED", color: "#389E0D", border: "#B7EB8F", dot: "#52C41A" },
};

const STATUS_MAP = {
  pending:   { bg: "#FFFBE6", color: "#D48806", border: "#FFE58F", dot: "#FAAD14" },
  completed: { bg: "#F6FFED", color: "#389E0D", border: "#B7EB8F", dot: "#52C41A" },
};

function PriorityBadge({ priority }) {
  const s = PRIORITY_MAP[priority] || PRIORITY_MAP.Low;
  return (
    <span className="stv-priority" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      <span className="stv-priority-dot" style={{ background: s.dot }} />
      {priority || "Low"}
    </span>
  );
}

function StatusBadge({ status }) {
  const label = status === 0 ? "Pending" : "Completed";
  const s     = status === 0 ? STATUS_MAP.pending : STATUS_MAP.completed;
  return (
    <span className="stv-status" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const StrategicTaskViewModal = ({ show, handleClose, id }) => {
  const [loading, setLoading] = useState(false);
  const [report,  setReport]  = useState([]);

  const authHeader = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };

  const fetchReportdata = async () => {
    try {
      setLoading(true);
      const res = await ApiService(null, id, authHeader, fetchtaskforstrategic.method, fetchtaskforstrategic.url);
      if (!res.data?.error) setReport(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (show) fetchReportdata(); }, [id, show]);

  if (!show) return null;

  const clientName = (item) =>
    item.client_name || item.cllii_name || item.sclient_name || "—";

  const caseId = (item) => item.case_id || item.caseId || "";

  return (
    <>
      <style>{MODAL_CSS}</style>

      <div className="stv-backdrop" onClick={handleClose}>
        <div className="stv-dialog" onClick={(e) => e.stopPropagation()}>

          {/* ── Header ── */}
          <div className="stv-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 3, height: 20, borderRadius: 2,
                background: `linear-gradient(180deg, ${THEME.brand} 0%, ${THEME.brandMid} 100%)`,
              }} />
              <div>
                <h2 style={{
                  margin: 0, fontSize: 16, fontWeight: 700,
                  color: THEME.text, fontFamily: "'Sora', sans-serif",
                }}>
                  Monthly Review Tasks
                </h2>
                {!loading && (
                  <p style={{ margin: 0, fontSize: 11, color: THEME.textMuted }}>
                    {report.length} {report.length === 1 ? "task" : "tasks"} found
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              style={{
                width: 32, height: 32, borderRadius: 8,
                border: `1.5px solid ${THEME.border}`, background: "#fff",
                cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 18, color: THEME.textMuted,
                lineHeight: 1, transition: "all 0.15s",
              }}
            >×</button>
          </div>

          {/* ── Body ── */}
          <div className="stv-body">
            {loading ? (
              <div className="stv-spinner" />
            ) : report.length === 0 ? (
              <div style={{ textAlign: "center", padding: "56px 0" }}>
                <div style={{ fontSize: 34, marginBottom: 10 }}>📋</div>
                <p style={{ color: THEME.textLight, fontSize: 13, margin: 0 }}>
                  No tasks found.
                </p>
              </div>
            ) : (
              <div style={{ borderRadius: 10, border: `1px solid ${THEME.border}`, overflow: "hidden" }}>
                <table className="stv-table">
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>#</th>
                      <th>Task</th>
                      <th>Due Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.map((item, index) => (
                      <tr key={item.id || index}>
                        <td style={{ color: THEME.textMuted, fontWeight: 700, fontSize: 12 }}>
                          {index + 1}
                        </td>

                        <td>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                            <PriorityBadge priority={item.priority} />
                            <div>
                              <p style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 600, color: THEME.text }}>
                                {item.task}
                              </p>
                              <p style={{ margin: 0, fontSize: 11, color: THEME.textMuted }}>
                                {clientName(item)}
                                {caseId(item) && (
                                  <span style={{ marginLeft: 6, padding: "1px 6px", borderRadius: 6, background: THEME.brandLight, color: THEME.brandDark, fontSize: 10, fontWeight: 700 }}>
                                    {caseId(item)}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td style={{ fontSize: 12, color: THEME.textMuted, whiteSpace: "nowrap" }}>
                          {new Date(item.due_date).toLocaleDateString("en-GB")}
                        </td>

                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <StatusBadge status={item.status} />
                            {item.counter >= 1 && (
                              <span className="stv-counter">{item.counter}</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default StrategicTaskViewModal;