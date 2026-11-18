import React, { useEffect, useState } from "react";
import ApiService from "../../../../services/ApiService";
import { getToken } from "../../../../services/useLocalStorage";
import { fetchtaskforteamforreport } from "../../../../config/config";

const THEME = {
  brand:       "#887549",
  brandLight:  "#F5F0E8",
  brandMid:    "#C4A97D",
  brandDark:   "#5C4E32",
  border:      "#EDE5D5",
  text:        "#1A1A2E",
  textMuted:   "#ADADAD",
  textLight:   "#BDBDBD",
};

const MODAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }

  .tvm-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45); z-index: 1040;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .tvm-dialog {
    background: #fff; border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.18);
    width: 100%; max-width: 720px;
    display: flex; flex-direction: column;
    font-family: 'DM Sans', sans-serif; overflow: hidden;
    max-height: 88vh;
  }
  .tvm-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px; border-bottom: 1px solid ${THEME.border};
    background: #FDFAF5; flex-shrink: 0;
  }
  .tvm-body {
    padding: 20px 24px;
    overflow-y: auto; flex: 1;
  }

  /* Table */
  .tvm-table {
    width: 100%; border-collapse: collapse; font-size: 13px;
    font-family: 'DM Sans', sans-serif;
  }
  .tvm-table thead tr {
    border-bottom: 1.5px solid ${THEME.border};
  }
  .tvm-table thead th {
    padding: 10px 12px; text-align: left;
    font-size: 11px; font-weight: 600;
    color: ${THEME.textMuted}; text-transform: uppercase;
    letter-spacing: 0.05em; white-space: nowrap;
  }
  .tvm-table tbody tr {
    border-bottom: 1px solid #F5F0E8;
    transition: background 0.12s;
  }
  .tvm-table tbody tr:last-child { border-bottom: none; }
  .tvm-table tbody tr:hover { background: #FDFAF5; }
  .tvm-table td {
    padding: 12px 12px; vertical-align: middle;
    color: ${THEME.text};
  }



  /* Status badge */
  .tvm-status {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 20px;
    font-size: 11px; font-weight: 600; white-space: nowrap;
  }
  .tvm-status.pending   { background: #FFFBE6; color: #D46B08; border: 1px solid #FFE58F; }
  .tvm-status.completed { background: #F6FFED; color: #389E0D; border: 1px solid #B7EB8F; }

  /* Counter bubble */
  .tvm-counter {
    display: inline-flex; align-items: center; justify-content: center;
    width: 20px; height: 20px; border-radius: 50%;
    background: ${THEME.brand}; color: #fff;
    font-size: 10px; font-weight: 700; flex-shrink: 0;
  }

  /* Empty / loading */
  .tvm-empty {
    text-align: center; padding: 48px 24px;
    color: ${THEME.textMuted}; font-size: 13px;
  }

  @keyframes tvmSpin { to { transform: rotate(360deg); } }
  .tvm-spinner {
    width: 28px; height: 28px; border-radius: 50%;
    border: 3px solid ${THEME.brandLight}; border-top-color: ${THEME.brand};
    animation: tvmSpin 0.8s linear infinite;
    margin: 40px auto; display: block;
  }
`;



const TaskViewModal = ({ show, handleClose, id }) => {
  const [loading, setLoading] = useState(false);
  const [report,  setReport]  = useState([]);

  const fetchReportdata = async () => {
    try {
      setLoading(true);
      const header = {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      };
      const res = await ApiService(
        null, id, header,
        fetchtaskforteamforreport.method,
        fetchtaskforteamforreport.url
      );
      if (!res.data?.error) {
        setReport(res?.data?.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchReportdata();
  }, [id]);

  // ✅ KEY FIX: unmounts completely when hidden
  if (!show) return null;

  return (
    <>
      <style>{MODAL_CSS}</style>

      <div className="tvm-backdrop" onClick={handleClose}>
        <div className="tvm-dialog" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="tvm-header">
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
                  Tasks
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
                lineHeight: 1,
              }}
            >×</button>
          </div>

          {/* Body */}
          <div className="tvm-body">
            {loading ? (
              <div className="tvm-spinner" />
            ) : report.length === 0 ? (
              <div className="tvm-empty">No tasks found.</div>
            ) : (
              <table className="tvm-table">
                <thead>
                  <tr>
                    <th style={{ width: 36 }}>#</th>
                    <th>Task</th>
                    <th style={{ whiteSpace: "nowrap" }}>Due Date</th>
                   
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {report.map((item, index) => {
                    const clientName =
                      item.client_name || item.cllii_name || item.sclient_name || "—";
                    const caseId = item.case_id || item.caseId || "";
                  
                    const isCompleted = item.status !== 0;

                    return (
                      <tr key={index}>
                        {/* # */}
                        <td style={{ color: THEME.textMuted, fontWeight: 500 }}>
                          {index + 1}
                        </td>

                        {/* Task */}
                        <td>
                          <p style={{ margin: 0, fontWeight: 600, color: THEME.text, fontSize: 13 }}>
                            {item.task}
                          </p>
                          <p style={{ margin: "2px 0 0", fontSize: 11, color: THEME.textMuted }}>
                            {clientName}{caseId ? ` · ${caseId}` : ""}
                          </p>
                        </td>

                        {/* Due Date */}
                        <td style={{ color: THEME.textMuted, whiteSpace: "nowrap" }}>
                          {new Date(item.due_date).toLocaleDateString("en-GB")}
                        </td>

                     

                        {/* Status */}
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span className={`tvm-status ${isCompleted ? "completed" : "pending"}`}>
                              {isCompleted ? "Completed" : "Pending"}
                            </span>
                            {item.counter >= 1 && (
                              <span className="tvm-counter">{item.counter}</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default TaskViewModal;