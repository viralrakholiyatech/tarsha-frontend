// ─────────────────────────────────────────────
//  Approvalprocess.jsx  —  BuildingPermission > Approval Process
//  Brand design — no Bootstrap to remove, clean table redesign
// ─────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import ApiService from "../../../../services/ApiService";
import { getToken } from "../../../../services/useLocalStorage";
import { SwalAlert } from "../../../../UtilsComponent/SwalDialog";
import { GetDate } from "../../../../services/DateAndTimeService";
import {
  addupdateApproval,
  fetchApprovalbyID,
  deleteapprovalletter,
} from "../../../../config/config";
import { ApprovalRoute } from "../../../../config/RouteConfig";
import { FileUrl } from "../../../../config/file_url";
import { uploadFileToS3, openFileInNewTab } from "../../../../services/S3Service";

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

const CSS = `
  @keyframes apFadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  .ap-fade { animation:apFadeIn 0.25s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes apSpin { to{transform:rotate(360deg)} }
  .ap-spinner { width:18px;height:18px;border-radius:50%;border:2.5px solid ${THEME.brandLight};border-top-color:${THEME.brand};animation:apSpin 0.8s linear infinite; }

  /* ── Approval table ── */
  .ap-table { width:100%;border-collapse:collapse;font-family:'DM Sans',sans-serif;font-size:13px; }
  .ap-table th { padding:10px 12px;font-size:10px;font-weight:700;color:${THEME.brandDark};text-transform:uppercase;letter-spacing:0.07em;background:${THEME.brandLight};border-bottom:2px solid #D4C4A0;white-space:nowrap; }
  .ap-table td { padding:10px 12px;border-bottom:1px solid ${THEME.border};vertical-align:middle; }
  .ap-table tbody tr:nth-child(even) { background:${THEME.rowAlt}; }
  .ap-table tbody tr:hover { background:${THEME.rowHover}; }

  /* ── Level badge ── */
  .ap-level { display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:${THEME.brandLight};color:${THEME.brandDark};border:1px solid #D4C4A0; }

  /* ── Inline inputs ── */
  .ap-input, .ap-select {
    width:100%;padding:7px 10px;border-radius:8px;border:1.5px solid #E0D5C5;
    font-size:12px;font-family:'DM Sans',sans-serif;color:#1A1A2E;
    outline:none;background:#fff;transition:border-color 0.15s,box-shadow 0.15s;min-width:100px;
  }
  .ap-input:focus, .ap-select:focus { border-color:${THEME.brand};box-shadow:0 0 0 3px ${THEME.brand}18; }
  .ap-input::placeholder { color:${THEME.textLight}; }

  /* ── File zone ── */
  .ap-file-zone {
    border:1.5px dashed #D4C4A0;border-radius:8px;padding:7px 10px;background:#FDFAF5;
    font-size:11px;color:${THEME.textMuted};cursor:pointer;position:relative;transition:all 0.15s;min-width:130px;
  }
  .ap-file-zone:hover { border-color:${THEME.brand};background:${THEME.brandLight}; }
  .ap-file-zone input[type=file] { position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%; }

  /* ── Icon/delete buttons ── */
  .ap-icon-btn { width:26px;height:26px;border-radius:6px;border:1.5px solid ${THEME.border};background:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all 0.15s;text-decoration:none;flex-shrink:0;margin-left:4px; }
  .ap-icon-btn:hover { background:${THEME.brandLight};border-color:${THEME.brand}; }
  .ap-del-btn { width:26px;height:26px;border-radius:6px;border:1.5px solid #FFA39E;background:#FFF1F0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all 0.15s;flex-shrink:0;margin-left:4px; }
  .ap-del-btn:hover { background:#CF1322;border-color:#CF1322; }
  .ap-del-btn:hover svg { stroke:#fff; }

  /* ── Status badge ── */
  .ap-status { display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600; }
  .ap-status.approved { background:#F6FFED;color:#389E0D;border:1px solid #B7EB8F; }
  .ap-status.reject   { background:#FFF1F0;color:#CF1322;border:1px solid #FFA39E; }

  /* ── Buttons ── */
  .ap-btn-primary { padding:9px 22px;border-radius:10px;border:none;background:${THEME.brand};color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.18s;box-shadow:0 2px 6px ${THEME.brand}44; }
  .ap-btn-primary:hover:not(:disabled) { background:${THEME.brandDark}; }
  .ap-btn-primary:disabled { background:#C4C4C4;box-shadow:none;cursor:not-allowed; }
  .ap-btn-outline { padding:9px 22px;border-radius:10px;border:1.5px solid ${THEME.border};background:#fff;color:#595959;font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.18s; }
  .ap-btn-outline:hover { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand}; }
`;

// ─────────────────────────────────────────────
//  INITIAL STAGES
// ─────────────────────────────────────────────
const INITIAL_STAGES = [
  {
    level: "Level 1",
    officer: "AE/JE",
    date: "",
    status: "",
    query: "",
    approved_letter: null,
  },
  {
    level: "Level 2",
    officer: "DE",
    date: "",
    status: "",
    query: "",
    approved_letter: null,
  },
  {
    level: "Level 3",
    officer: "Zone Officer",
    date: "",
    status: "",
    query: "",
    approved_letter: null,
  },
  {
    level: "Level 4",
    officer: "DC",
    date: "",
    status: "",
    query: "",
    approved_letter: null,
  },
  {
    level: "Level 5",
    officer: "Commissioner",
    date: "",
    status: "",
    query: "",
    approved_letter: null,
  },
];

const LEVEL_ICONS = {
  "Level 1": "1️⃣",
  "Level 2": "2️⃣",
  "Level 3": "3️⃣",
  "Level 4": "4️⃣",
  "Level 5": "5️⃣",
};

function Approvalprocess() {
  const params = useParams();
  const navigate = useNavigate();
  const header = {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };

  const [loading, setLoading] = useState(false);
  const [stages, setStages] = useState(INITIAL_STAGES);

  const fetchApprovalData = async () => {
    setLoading(true);
    try {
      const res = await ApiService(
        null,
        params.id,
        header,
        fetchApprovalbyID.method,
        fetchApprovalbyID.url,
      );
      if (!res.data.error) {
        const fetched = res.data.data;
        setStages(
          INITIAL_STAGES.map((stage) => {
            const d = fetched.find((item) => item.level === stage.level);
            return d
              ? {
                  ...stage,
                  id: d.id,
                  date: GetDate(d.date, "YYYY-MM-DD"),
                  status: d.status || "",
                  query: d.query || "",
                  approved_letter: d.approved_letter || null,
                }
              : stage;
          }),
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovalData();
  }, []);

  const handleInputChange = async (e, index, field) => {
    if (field === "approved_letter") {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const toastId = toast.loading("Uploading letter to S3...");
      try {
        const { fileUrl } = await uploadFileToS3(
          file,
          null,
          "approval/building/process",
        );
        setStages((prev) => {
          const upd = [...prev];
          upd[index] = {
            ...upd[index],
            approved_letter: fileUrl,
            approved_letter_cleared: false,
          };
          return upd;
        });
        toast.success("Letter uploaded to S3!", { id: toastId });
      } catch (err) {
        toast.error("Failed to upload to S3", { id: toastId });
      }
      return;
    }
    const value = e.target.value;
    setStages((prev) => {
      const upd = [...prev];
      upd[index] = { ...upd[index], [field]: value };
      return upd;
    });
  };

  const onRemoveApproveLetter = (id) => {
    SwalAlert({}).then(async (r) => {
      if (!r.isConfirmed) return;
      setLoading(true);
      try {
        const res = await ApiService(
          null,
          id,
          header,
          deleteapprovalletter.method,
          deleteapprovalletter.url,
        );
        if (!res.data.error) {
          toast.success(res.data.message);
          fetchApprovalData();
        } else toast.error(res.data.message);
      } catch (e) {
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      stages: stages.map((stage) => ({
        id: stage.id || "",
        approval_id: params.id,
        level: stage.level,
        officer: stage.officer,
        date: stage.date,
        status: stage.status,
        query: stage.query,
        approved_letter: stage.approved_letter || "",
        approved_letter_cleared: stage.approved_letter_cleared ? "true" : "false",
      })),
    };
    setLoading(true);
    try {
      const res = await ApiService(
        payload,
        0,
        {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        addupdateApproval.method,
        addupdateApproval.url,
      );
      if (!res.data.error) {
        toast.success("Approval submitted successfully");
        fetchApprovalData();
      } else toast.error(res.data.message);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>

      <div style={{ fontFamily: "'DM Sans',sans-serif" }} className="ap-fade">
        {/* Section title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 3,
              height: 14,
              borderRadius: 2,
              background: `linear-gradient(180deg,${THEME.brand},${THEME.brandMid})`,
            }}
          />
          <h3
            style={{
              margin: 0,
              fontSize: 12,
              fontWeight: 700,
              color: THEME.brand,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              fontFamily: "'Sora',sans-serif",
            }}
          >
            Approval Process
          </h3>
          <span
            style={{
              padding: "1px 8px",
              borderRadius: 20,
              fontSize: 10,
              fontWeight: 600,
              background: "#F0F5FF",
              color: "#2F54EB",
              border: "1px solid #ADC6FF",
            }}
          >
            5 Levels
          </span>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ overflowX: "auto", marginBottom: 16 }}>
            <table className="ap-table">
              <thead>
                <tr>
                  <th>Stage</th>
                  <th>Officer</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Query</th>
                  <th>Approved Letter</th>
                </tr>
              </thead>
              <tbody>
                {stages.map((stage, index) => (
                  <tr key={index}>
                    {/* Level badge */}
                    <td>
                      <span className="ap-level">
                        <span>{LEVEL_ICONS[stage.level] || "•"}</span>
                        {stage.level}
                      </span>
                    </td>
                    {/* Officer */}
                    <td
                      style={{
                        fontWeight: 600,
                        color: THEME.text,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {stage.officer}
                    </td>
                    {/* Date */}
                    <td>
                      <input
                        type="date"
                        className="ap-input"
                        value={stage.date}
                        onChange={(e) => handleInputChange(e, index, "date")}
                      />
                    </td>
                    {/* Status */}
                    <td>
                      <select
                        className="ap-select"
                        value={stage.status}
                        onChange={(e) => handleInputChange(e, index, "status")}
                      >
                        <option value="">— Select —</option>
                        <option value="approved">Approved</option>
                        <option value="reject">Reject</option>
                      </select>
                      {stage.status && (
                        <span
                          className={`ap-status ${stage.status}`}
                          style={{ marginTop: 4, display: "inline-flex" }}
                        >
                          <span
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              background: "currentColor",
                            }}
                          />
                          {stage.status === "approved"
                            ? "Approved"
                            : "Rejected"}
                        </span>
                      )}
                    </td>
                    {/* Query */}
                    <td>
                      <input
                        type="text"
                        className="ap-input"
                        placeholder="Type query…"
                        value={stage.query}
                        onChange={(e) => handleInputChange(e, index, "query")}
                      />
                    </td>
                    {/* Approved Letter */}
                    <td>
                      <div className="ap-file-zone">
                        <input
                          type="file"
                          onChange={(e) =>
                            handleInputChange(e, index, "approved_letter")
                          }
                        />
                        <span>
                          📎{" "}
                          {stage.approved_letter &&
                          typeof stage.approved_letter === "string"
                            ? "Replace…"
                            : "Upload…"}
                        </span>
                      </div>
                      {stage.approved_letter &&
                        typeof stage.approved_letter === "string" && (
                          <div
                            style={{ display: "flex", gap: 4, marginTop: 4 }}
                          >
                            <span
                              style={{ fontSize: 10, color: THEME.textMuted }}
                            >
                              ✅ Attached
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                openFileInNewTab(
                                  stage.approved_letter,
                                  FileUrl,
                                )
                              }
                              className="ap-icon-btn"
                              title="View"
                            >
                              <svg
                                width="11"
                                height="11"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke={THEME.brand}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="ap-del-btn"
                              title="Delete"
                              onClick={() => {
                                if (stage.id) {
                                  onRemoveApproveLetter(stage.id);
                                } else {
                                  setStages((prev) => {
                                    const upd = [...prev];
                                    upd[index] = {
                                      ...upd[index],
                                      approved_letter: null,
                                      approved_letter_cleared: true,
                                    };
                                    return upd;
                                  });
                                }
                              }}
                            >
                              <svg
                                width="10"
                                height="10"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#CF1322"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              </svg>
                            </button>
                          </div>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              type="button"
              className="ap-btn-outline"
              onClick={() => navigate(`/${ApprovalRoute.approval_list}`)}
            >
              Cancel
            </button>
            <button type="submit" className="ap-btn-primary" disabled={loading}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span className="ap-spinner" />
                  Saving…
                </span>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default Approvalprocess;
