import React, { useEffect, useState } from "react";
import { filedetailsbyId } from "../config/config";
import ApiService from "../services/ApiService";
import { getToken } from "../services/useLocalStorage";
import { FileUrl } from "../config/file_url";

// ─────────────────────────────────────────────
//  🎨  THEME
// ─────────────────────────────────────────────
const THEME = {
  brand:      "#887549",
  brandLight: "#F5F0E8",
  brandMid:   "#C4A97D",
  brandDark:  "#5C4E32",
  border:     "#EDE5D5",
  text:       "#1A1A2E",
  textMuted:  "#ADADAD",
  textLight:  "#BDBDBD",
  error:      "#CF1322",
};

const MODAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }

  .fd-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45);
    z-index: 1040;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .fd-dialog {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.18);
    width: 100%; max-width: 1000px;
    max-height: 90vh;
    display: flex; flex-direction: column;
    font-family: 'DM Sans', sans-serif;
    overflow: hidden;
  }
  .fd-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px;
    border-bottom: 1px solid ${THEME.border};
    flex-shrink: 0;
  }
  .fd-body {
    padding: 24px;
    overflow-y: auto;
    flex: 1;
  }

  /* Table */
  .fd-table { width: 100%; border-collapse: collapse; font-size: 13px; font-family: 'DM Sans', sans-serif; }
  .fd-table th {
    padding: 10px 14px; font-size: 11px; font-weight: 700;
    color: ${THEME.brandDark}; text-transform: uppercase;
    letter-spacing: 0.07em; background: ${THEME.brandLight};
    border-bottom: 2px solid #D4C4A0; white-space: nowrap;
    text-align: left;
  }
  .fd-table td {
    padding: 10px 14px; border-bottom: 1px solid #F5EFE4;
    vertical-align: middle; color: ${THEME.text};
  }
  .fd-table tbody tr:nth-child(even) { background: #FEFCF9; }
  .fd-table tbody tr:hover { background: ${THEME.brandLight}; transition: background 0.15s; }

  /* Avatar stack */
  .fd-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    border: 2px solid #fff;
    object-fit: cover;
    box-shadow: 0 1px 4px rgba(0,0,0,0.12);
    margin-right: -6px; display: inline-block;
  }
  .fd-avatar-wrap { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; }

  /* Status badge */
  .fd-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px; border-radius: 20px;
    font-size: 11px; font-weight: 700;
    font-family: 'DM Sans', sans-serif;
  }

  @keyframes fdSpin { to { transform: rotate(360deg); } }
  .fd-spinner {
    width: 26px; height: 26px; border-radius: 50%;
    border: 3px solid ${THEME.brandLight};
    border-top-color: ${THEME.brand};
    animation: fdSpin 0.8s linear infinite;
    margin: 48px auto; display: block;
  }

  .fd-empty {
    text-align: center; padding: 48px 0;
    color: ${THEME.textMuted}; font-size: 13px;
    font-family: 'DM Sans', sans-serif;
  }
`;

// ─────────────────────────────────────────────
//  🧩  ATOMS
// ─────────────────────────────────────────────

const DEFAULT_IMG = "https://webapp.zaidexceldesign.com/public/default/DefaultImage.png";

/** Stacked avatar(s) from comma-separated paths */
function AvatarStack({ paths, names }) {
  if (!paths || paths.trim().length === 0) {
    return <span style={{ color: THEME.textLight, fontSize: 12 }}>—</span>;
  }
  const nameList = (names || "").split(",");
  return (
    <div className="fd-avatar-wrap">
      {paths.split(",").map((src, i) => (
        <img
          key={i}
          className="fd-avatar"
          src={`${FileUrl}/${src.trim()}`}
          alt={nameList[i] || "User"}
          title={nameList[i] || ""}
          onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_IMG; }}
        />
      ))}
    </div>
  );
}

/** Status badge */
function StatusBadge({ value }) {
  const map = {
    completed: { bg: "#F6FFED", color: "#389E0D", border: "#B7EB8F", dot: "#52C41A", label: "Completed" },
    pending:   { bg: "#FFFBE6", color: "#D48806", border: "#FFE58F", dot: "#FAAD14", label: "Pending"   },
    ongoing:   { bg: "#E6F4FF", color: "#0958D9", border: "#91CAFF", dot: "#1677FF", label: "Ongoing"   },
  };
  const s = map[value?.toLowerCase()] || { bg: THEME.brandLight, color: THEME.brandDark, border: "#D4C4A0", dot: THEME.brandMid, label: value || "—" };
  return (
    <span className="fd-badge" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
      {s.label}
    </span>
  );
}

/** Format date safely */
function fmt(val) {
  if (!val) return <span style={{ color: THEME.textLight }}>—</span>;
  return new Date(val).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/** Close button */
function CloseBtn({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 32, height: 32, borderRadius: 8,
        border: `1.5px solid ${hov ? THEME.brand : THEME.border}`,
        background: hov ? THEME.brandLight : "#fff",
        cursor: "pointer", display: "flex",
        alignItems: "center", justifyContent: "center",
        fontSize: 18, color: THEME.textMuted,
        transition: "all 0.15s", lineHeight: 1,
      }}
    >
      ×
    </button>
  );
}

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const FileDetailsModal = ({ show, handleClose, fileId }) => {
  const [loading, setLoading] = useState(false);
  const [data,    setData]    = useState([]);

  const authHeader = {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };

  const fetchdata = async () => {
    try {
      setLoading(true);
      const res = await ApiService(null, fileId, authHeader, filedetailsbyId.method, filedetailsbyId.url);
      if (!res.data?.error) setData(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (fileId) fetchdata();
  }, [fileId]);

  if (!show) return null;

  return (
    <>
      <style>{MODAL_CSS}</style>

      {/* Backdrop */}
      <div className="fd-backdrop" onClick={handleClose}>

        {/* Dialog */}
        <div className="fd-dialog" onClick={(e) => e.stopPropagation()}>

          {/* ── Header ── */}
          <div className="fd-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 3, height: 20, borderRadius: 2,
                background: `linear-gradient(180deg, ${THEME.brand} 0%, ${THEME.brandMid} 100%)`,
              }} />
              <h2 style={{
                margin: 0, fontSize: 16, fontWeight: 700,
                color: THEME.text, fontFamily: "'Sora', sans-serif",
              }}>
                Application Details
              </h2>
              {data.length > 0 && (
                <span style={{
                  padding: "2px 10px", borderRadius: 20,
                  background: THEME.brandLight, border: `1px solid #D4C4A0`,
                  fontSize: 11, fontWeight: 700, color: THEME.brandDark,
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  {data.length} {data.length === 1 ? "record" : "records"}
                </span>
              )}
            </div>
            <CloseBtn onClick={handleClose} />
          </div>

          {/* ── Body ── */}
          <div className="fd-body">
            {loading ? (
              <div className="fd-spinner" />
            ) : data.length === 0 ? (
              <div className="fd-empty">
                <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
                No application data found.
              </div>
            ) : (
              <div style={{ overflowX: "auto", borderRadius: 10, border: `1px solid ${THEME.border}` }}>
                <table className="fd-table">
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>#</th>
                      <th>Application</th>
                      <th>HOD</th>
                      <th>Team</th>
                      <th>Days</th>
                      <th>Assigned On</th>
                      <th>Completed By</th>
                      <th>Completed At</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, index) => (
                      <tr key={item.id}>
                        <td style={{ color: THEME.textMuted, fontWeight: 700, fontSize: 12 }}>
                          {index + 1}
                        </td>

                        <td>
                          <span style={{ fontWeight: 600, color: THEME.brandDark }}>
                            {item.application_name || "—"}
                          </span>
                        </td>

                        <td>
                          <AvatarStack paths={item.hod_picture} names={item.hod_name} />
                        </td>

                        <td>
                          <AvatarStack paths={item.assign_pictures} names={item.assign_members} />
                        </td>

                        <td>
                          {item.days ? (
                            <span style={{
                              display: "inline-block", padding: "2px 10px",
                              borderRadius: 20, fontSize: 12, fontWeight: 600,
                              background: THEME.brandLight, color: THEME.brandDark,
                              border: `1px solid #D4C4A0`,
                            }}>
                              {item.days}d
                            </span>
                          ) : <span style={{ color: THEME.textLight }}>—</span>}
                        </td>

                        <td style={{ fontSize: 12, color: THEME.textMuted }}>{fmt(item.assign_on)}</td>
                        <td style={{ fontSize: 12, color: THEME.textMuted }}>{fmt(item.completed_by)}</td>
                        <td style={{ fontSize: 12, color: THEME.textMuted }}>{fmt(item.completed_at)}</td>

                        <td>
                          <StatusBadge value={item.status} />
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

export default FileDetailsModal;