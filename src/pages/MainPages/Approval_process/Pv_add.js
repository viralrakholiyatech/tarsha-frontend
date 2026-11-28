import axios from "axios";
import { getfileDatabyId } from "../../../config/config";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaMapLocationDot } from "react-icons/fa6";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiService from "../../../services/ApiService";
import { getToken } from "../../../services/useLocalStorage";
import {
  deletecertficatefiles,
  fetchActiveEmployee,
  pvbyID,
  addupdatePv,
  deletedocumentfiles,
  documentcbyID,
} from "../../../config/config";
import toast from "react-hot-toast";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import { GetDate } from "../../../services/DateAndTimeService";
import { ApprovalRoute } from "../../../config/RouteConfig";
import { FileUrl } from "../../../config/file_url";
import S3FileUpload from "../../../components/S3FileUpload";
import { openFileInNewTab } from "../../../services/S3Service";

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
  text: "#1A1A2E",
  textMuted: "#ADADAD",
  textLight: "#BDBDBD",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing:border-box; }
  @keyframes pvSpin { to{transform:rotate(360deg)} }
  .pv-spinner { width:24px;height:24px;border-radius:50%;border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};animation:pvSpin 0.8s linear infinite; }

  /* ── Stage tabs ── */
  .pv-tabs { display:flex;gap:6px;flex-wrap:nowrap;overflow-x:auto;padding:0;margin:0;list-style:none;scrollbar-width:none; }
  .pv-tabs::-webkit-scrollbar { display:none; }
  .pv-tab { padding:8px 14px;border-radius:20px;cursor:pointer;white-space:nowrap;font-size:12px;font-weight:600;border:1.5px solid transparent;background:transparent;color:#595959;transition:all 0.18s;font-family:'DM Sans',sans-serif; }
  .pv-tab:hover  { background:${THEME.brandLight};color:${THEME.brand}; }
  .pv-tab.active { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand};font-weight:700; }

  /* ── Inputs ── */
  .pv-input {
    width:100%;padding:9px 13px;border-radius:10px;border:1.5px solid #E0D5C5;
    font-size:13px;font-family:'DM Sans',sans-serif;color:#1A1A2E;
    outline:none;background:#fff;transition:border-color 0.15s,box-shadow 0.15s;
  }
  .pv-input:focus { border-color:${THEME.brand};box-shadow:0 0 0 3px ${THEME.brand}18; }
  .pv-input[type=date]:disabled { background:${THEME.bg};color:${THEME.textMuted};cursor:default; }

  /* ── File zone ── */
  .pv-file-zone {
    border:2px dashed #D4C4A0;border-radius:10px;padding:10px 14px;background:#FDFAF5;
    font-size:12px;color:${THEME.textMuted};cursor:pointer;position:relative;transition:all 0.18s;
  }
  .pv-file-zone:hover { border-color:${THEME.brand};background:${THEME.brandLight}; }
  .pv-file-zone input[type=file] { position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%; }

  /* ── Icon buttons ── */
  .pv-icon-btn { width:28px;height:28px;border-radius:7px;border:1.5px solid ${THEME.border};background:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all 0.15s;text-decoration:none;flex-shrink:0;margin-left:6px; }
  .pv-icon-btn:hover { background:${THEME.brandLight};border-color:${THEME.brand}; }
  .pv-del-btn { width:28px;height:28px;border-radius:7px;border:1.5px solid #FFA39E;background:#FFF1F0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all 0.15s;flex-shrink:0;margin-left:6px; }
  .pv-del-btn:hover { background:#CF1322;border-color:#CF1322; }
  .pv-del-btn:hover svg { stroke:#fff; }

  /* ── Buttons ── */
  .pv-btn-primary { padding:10px 24px;border-radius:10px;border:none;background:${THEME.brand};color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:'Sora',sans-serif;transition:all 0.18s;box-shadow:0 2px 8px ${THEME.brand}44; }
  .pv-btn-primary:hover:not(:disabled) { background:${THEME.brandDark}; }
  .pv-btn-primary:disabled { background:#C4C4C4;box-shadow:none;cursor:not-allowed; }
  .pv-btn-outline { padding:10px 24px;border-radius:10px;border:1.5px solid ${THEME.border};background:#fff;color:#595959;font-size:13px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.18s; }
  .pv-btn-outline:hover { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand}; }

  /* ── Avatar ── */
  .pv-avatar { width:32px;height:32px;border-radius:50%;object-fit:cover;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.1); }
  .pv-avatar-stack { display:flex;align-items:center; }
  .pv-avatar-stack .pv-avatar { margin-left:-8px; }
  .pv-avatar-stack .pv-avatar:first-child { margin-left:0; }

  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:${THEME.brandLight}; }
  ::-webkit-scrollbar-thumb { background:${THEME.brandMid};border-radius:10px; }
`;

// ─────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────
const STAGE_TABS = [
  { key: "all_files", label: "All Files" },
  { key: "dc", label: "D.C." },
  { key: "pv", label: "P.V." },
  { key: "fire_noc", label: "Fire NOC" },
  { key: "e_nagar_portal", label: "E-Nagar Portal" },
  { key: "b_permission", label: "B. Permission" },
  { key: "site_visit", label: "Site Visit" },
];

// ─────────────────────────────────────────────
//  ATOMS
// ─────────────────────────────────────────────
function FieldLabel({ children }) {
  return (
    <label
      style={{
        display: "block",
        marginBottom: 5,
        fontSize: 11,
        fontWeight: 700,
        color: THEME.textMuted,
        textTransform: "uppercase",
        letterSpacing: "0.07em",
      }}
    >
      {children}
    </label>
  );
}

function InfoTile({ label, value, children }) {
  return (
    <div style={{
      background: THEME.brandLight, border: `1px solid #D4C4A0`,
      borderRadius: 10, padding: "8px 12px",
    }}>
      <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: THEME.brandMid,
        textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
      <div style={{ marginTop: 3, fontSize: 12, fontWeight: 600, color: THEME.brandDark }}>
        {children || value || <span style={{ color: THEME.textLight }}>N/A</span>}
      </div>
    </div>
  );
}

function AvatarStack({ src }) {
  if (!src || !src.length) return null;
  return (
    <div className="pv-avatar-stack">
      {src.split(",").map((p, i) => (
        <img
          key={i}
          className="pv-avatar"
          src={`${FileUrl}/${p}`}
          alt="User"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%20width%3D%2264%22%20height%3D%2264%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2232%22%20r%3D%2232%22%20fill%3D%22%23d1d5db%22%2F%3E%3Cpath%20d%3D%22M32%2014a12%2012%200%201%200%200%2024%2012%2012%200%200%200%200-24zm0%2028c-13.3%200-24%208.5-24%2019v3h48v-3c0-10.5-10.7-19-24-19z%22%20fill%3D%22%239ca3af%22%2F%3E%3C%2Fsvg%3E";
          }}
        />
      ))}
    </div>
  );
}

function CardSection({ title, children }) {
  return (
    <div
      style={{
        background: THEME.bg,
        border: `1px solid ${THEME.border}`,
        borderRadius: 12,
        padding: "16px 18px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 14,
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
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
//  FILE INPUT FIELD
// ─────────────────────────────────────────────
function FileField({ label, name, onChange, existingFile, onView, onDelete }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="pv-file-zone">
        <input type="file" name={name} onChange={onChange} />
        <span>📎 {existingFile ? "Replace file…" : "Click to upload…"}</span>
      </div>
      {existingFile && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginTop: 6,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: THEME.textMuted,
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            ✅ File attached
          </span>
          <button
            type="button"
            onClick={() => openFileInNewTab(existingFile, FileUrl)}
            className="pv-icon-btn"
            title="View file"
          >
            <svg
              width="12"
              height="12"
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
            className="pv-del-btn"
            title="Delete file"
            onClick={onDelete}
          >
            <svg
              width="11"
              height="11"
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
    </div>
  );
}

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const PvAdd = () => {
  const params = useParams();
  const navigate = useNavigate();
  const header = {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };

  const [caseId, setCaseId] = useState("");
  const [startDate, setstartDate] = useState("");
  const [endDate, setendDate] = useState("");
  const [dataId, setDataId] = useState("");
  const [hod, setHod] = useState("");
  const [subactiveTab, setSubActiveTab] = useState("pv");
  const [loading, setLoading] = useState(false);
  const [teamId, setTeamId] = useState("");
  const [applicationDate, setApplicationDate] = useState("");
  const [validationDate, setValidationDate] = useState("");
  const [documentFile, setDocumentFile] = useState(null);
  const [certificateFile, setCertificateFile] = useState(null);
  const [docCleared, setDocCleared] = useState(false);
  const [certCleared, setCertCleared] = useState(false);
  const [filedata, setFiledata] = useState(null);
  // ── Fetchers ──────────────────────────────
  const fetchPvData = async () => {
    setLoading(true);
    try {
      const res = await ApiService(
        null,
        params.id,
        header,
        pvbyID.method,
        pvbyID.url,
      );
      if (!res.data.error) {
        const D = res.data.data[0];
        setDataId(D.id);
        setApplicationDate(GetDate(D.application_date, "YYYY-MM-DD"));
        setValidationDate(GetDate(D.pv_date, "YYYY-MM-DD"));
        setDocumentFile(D.document_file);
        setCertificateFile(D.pv_file);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const res = await ApiService(
        null,
        params.id,
        header,
        documentcbyID.method,
        documentcbyID.url,
      );
      if (!res.data.error) {
        const D = res.data.data?.find((item) => item.title === "P.V.");
        if (D) {
          setTeamId(D.assign_picture || "");
          setHod(D.hod_pictures || "");
          setCaseId(D.case_id || "");
          setstartDate(GetDate(D.assign_on, "YYYY-MM-DD"));
          setendDate(GetDate(D.completed_by, "YYYY-MM-DD"));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFileDataById = async () => {
    try {
      const res = await axios.get(`${getfileDatabyId.url}/${params.id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.data.error) setFiledata(res.data.data[0]);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPvData();
    fetchData();
    fetchFileDataById();
  }, []);

  // ── Stage nav ─────────────────────────────
  const handleStageNav = (key) => {
    const routes = {
      all_files: () => navigate(`/${ApprovalRoute.approval_list}`),
      dc: () => navigate(`/${ApprovalRoute.document_add}/${params.id}`),
      pv: () => navigate(`/${ApprovalRoute.pv_add}/${params.id}`),
      fire_noc: () => navigate(`/${ApprovalRoute.fire_noc_add}/${params.id}`),
      e_nagar_portal: () =>
        navigate(`/${ApprovalRoute.e_nagar_portal_add}/${params.id}`),
      b_permission: () =>
        navigate(`/${ApprovalRoute.buildingpermissionadd}/${params.id}`),
      site_visit: () =>
        navigate(`/${ApprovalRoute.sitevisit}/${params.id}`),
    };
    routes[key]?.();
  };

  // ── Delete ────────────────────────────────
  const onRemovedocumentfile = (id) => {
    SwalAlert({}).then(async (r) => {
      if (!r.isConfirmed) return;
      setLoading(true);
      try {
        const res = await ApiService(
          null,
          id,
          header,
          deletedocumentfiles.method,
          deletedocumentfiles.url,
        );
        if (!res.data.error) {
          toast.success(res.data.message);
          fetchPvData();
        } else toast.error(res.data.message);
      } catch (e) {
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    });
  };

  const onRemovecertificatefile = (id) => {
    SwalAlert({}).then(async (r) => {
      if (!r.isConfirmed) return;
      setLoading(true);
      try {
        const res = await ApiService(
          null,
          id,
          header,
          deletecertficatefiles.method,
          deletecertficatefiles.url,
        );
        if (!res.data.error) {
          toast.success(res.data.message);
          fetchPvData();
        } else toast.error(res.data.message);
      } catch (e) {
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    });
  };

  // ── Submit ────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !applicationDate &&
      !validationDate &&
      !documentFile &&
      !certificateFile
    ) {
      toast.error("Please provide at least one field before submitting.");
      return;
    }
    const formData = new FormData();
    formData.append("id", dataId);
    formData.append("approval_id", params.id);
    formData.append("application_date", applicationDate);
    formData.append("validation_date", validationDate);
    if (documentFile) {
      formData.append("document_file", documentFile);
    } else if (docCleared) {
      formData.append("document_file_cleared", "true");
    }

    if (certificateFile) {
      formData.append("certificate_file", certificateFile);
    } else if (certCleared) {
      formData.append("certificate_file_cleared", "true");
    }

    setLoading(true);
    try {
      const res = await ApiService(
        formData,
        0,
        {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "multipart/form-data",
        },
        addupdatePv.method,
        addupdatePv.url,
      );
      if (!res.data.error) {
        toast.success("P.V. submitted successfully");
        fetchPvData();
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

      <div
        style={{
          minHeight: "100vh",
          background: THEME.bg,
          fontFamily: "'DM Sans',sans-serif",
          padding: "28px 24px",
        }}
      >
        <form onSubmit={handleSubmit} noValidate>
          {/* ── Stage tab card ── */}
          <div style={{ background:"#fff", border:`1px solid ${THEME.border}`, borderRadius:14,
  padding:"18px 20px", marginBottom:14, boxShadow:"0 2px 8px rgba(136,117,73,0.06)" }}>

  {/* Case ID */}
  <div style={{ marginBottom:14 }}>
    <p style={{ margin:"0 0 2px", fontSize:11, fontWeight:700, color:THEME.textMuted,
      textTransform:"uppercase", letterSpacing:"0.07em" }}>TP Case No</p>
    <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:THEME.text,
      fontFamily:"'Sora',sans-serif" }}>{caseId || "—"}</h1>
  </div>

  {/* File data tiles */}
  {filedata && (
    <div style={{ display:"grid",
      gridTemplateColumns:"repeat(auto-fill, minmax(160px, 1fr))", gap:10, marginBottom:16 }}>
      <InfoTile label="Company"      value={filedata.company_name} />
      <InfoTile label="Project Type" value={filedata.project_type} />
      <InfoTile label="Category"     value={filedata.category_type} />
      <InfoTile label="Address"      value={filedata.address} />
      <InfoTile label="Location">
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <Link to={`https://www.google.com/maps?q=${filedata.lat},${filedata.long}`} target="_blank">
            <FaMapMarkerAlt style={{ color:"#F44336", fontSize:15 }} />
          </Link>
          <Link to={filedata.google_location || "#"} target="_blank">
            <FaMapLocationDot style={{ color:"#28a745", fontSize:15 }} />
          </Link>
        </div>
      </InfoTile>
      {(filedata.fp_no || filedata.ward_no || filedata.tpscheme ||
        filedata.cs_no || filedata.b_no || filedata.op_no || filedata.rs_no) && (
        <InfoTile label="Land Details">
          <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
            {[
              { label:"FP No",     value: filedata.fp_no    },
              { label:"Ward No",   value: filedata.ward_no  },
              { label:"TP Scheme", value: filedata.tpscheme },
              { label:"CS No",     value: filedata.cs_no    },
              { label:"B No",      value: filedata.b_no     },
              { label:"OP No",     value: filedata.op_no    },
              { label:"RS No",     value: filedata.rs_no    },
            ].filter(r => r.value?.trim()).map(r => (
              <div key={r.label} style={{ display:"flex", gap:5, fontSize:11 }}>
                <span style={{ color:THEME.brandMid, fontWeight:700, minWidth:60 }}>{r.label}:</span>
                <span style={{ color:THEME.brandDark, fontWeight:600 }}>{r.value}</span>
              </div>
            ))}
          </div>
        </InfoTile>
      )}
    </div>
  )}
            <ul className="pv-tabs">
              {STAGE_TABS.map((t) => (
                <li key={t.key}>
                  <button
                    type="button"
                    className={`pv-tab${subactiveTab === t.key ? " active" : ""}`}
                    onClick={() => {
                      setSubActiveTab(t.key);
                      handleStageNav(t.key);
                    }}
                  >
                    {t.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Team / date strip ── */}
          <div
            style={{
              background: "#fff",
              border: `1px solid ${THEME.border}`,
              borderRadius: 14,
              padding: "14px 20px",
              marginBottom: 14,
              boxShadow: "0 2px 8px rgba(136,117,73,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 16,
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                {hod && (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div style={{ position: "relative" }}>
                      <AvatarStack src={hod} />
                      <span
                        style={{
                          position: "absolute",
                          bottom: -4,
                          right: -4,
                          padding: "1px 5px",
                          borderRadius: 20,
                          fontSize: 8,
                          fontWeight: 800,
                          background: THEME.brand,
                          color: "#fff",
                        }}
                      >
                        LEAD
                      </span>
                    </div>
                  </div>
                )}
                {teamId && (
                  <div>
                    <p
                      style={{
                        margin: "0 0 4px",
                        fontSize: 9,
                        fontWeight: 700,
                        color: THEME.textMuted,
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                      }}
                    >
                      Team
                    </p>
                    <AvatarStack src={teamId} />
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[
                  { label: "Start", value: startDate },
                  { label: "End", value: endDate },
                ].map((d) => (
                  <div
                    key={d.label}
                    style={{
                      background: THEME.bg,
                      border: `1px solid ${THEME.border}`,
                      borderRadius: 10,
                      padding: "8px 14px",
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 2px",
                        fontSize: 10,
                        fontWeight: 700,
                        color: THEME.textMuted,
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                      }}
                    >
                      {d.label}
                    </p>
                    <input
                      type="date"
                      value={d.value || ""}
                      disabled
                      style={{
                        border: "none",
                        background: "transparent",
                        fontSize: 13,
                        fontWeight: 600,
                        color: THEME.text,
                        outline: "none",
                        padding: 0,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Form card ── */}
          <div
            style={{
              background: "#fff",
              border: `1px solid ${THEME.border}`,
              borderRadius: 14,
              padding: "20px 24px",
              boxShadow: "0 2px 10px rgba(136,117,73,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 4,
                  height: 22,
                  borderRadius: 3,
                  background: `linear-gradient(180deg,${THEME.brand},${THEME.brandMid})`,
                }}
              />
              <h2
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 800,
                  color: THEME.text,
                  fontFamily: "'Sora',sans-serif",
                }}
              >
                P.V. Details
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 20,
              }}
            >
              {/* Application Details */}
              <CardSection title="Application Details">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 14,
                  }}
                >
                  <div>
                    <FieldLabel>Application Date</FieldLabel>
                    <input
                      type="date"
                      className="pv-input"
                      value={applicationDate}
                      onChange={(e) => setApplicationDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <FieldLabel>Upload Document</FieldLabel>
                    <S3FileUpload
                      folder="approval/pv"
                      value={documentFile}
                      onChange={(url) => {
                        setDocumentFile(url);
                        setDocCleared(false);
                      }}
                      onRemove={() => {
                        setDocumentFile(null);
                        setDocCleared(true);
                        onRemovedocumentfile(params.id);
                      }}
                    />
                  </div>
                </div>
              </CardSection>

              {/* PVC Details */}
              <CardSection title="P.V.C Details">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 14,
                  }}
                >
                  <div>
                    <FieldLabel>Plot Validation Date</FieldLabel>
                    <input
                      type="date"
                      className="pv-input"
                      value={validationDate}
                      onChange={(e) => setValidationDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <FieldLabel>Plot Validation Certificate</FieldLabel>
                    <S3FileUpload
                      folder="approval/pv"
                      value={certificateFile}
                      onChange={(url) => {
                        setCertificateFile(url);
                        setCertCleared(false);
                      }}
                      onRemove={() => {
                        setCertificateFile(null);
                        setCertCleared(true);
                        onRemovecertificatefile(params.id);
                      }}
                    />
                  </div>
                </div>
              </CardSection>
            </div>

            {/* Actions */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 20,
              }}
            >
              <button
                type="button"
                className="pv-btn-outline"
                onClick={() => navigate(`/${ApprovalRoute.approval_list}`)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="pv-btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        border: "2px solid #ffffff88",
                        borderTopColor: "#fff",
                        display: "inline-block",
                        animation: "pvSpin 0.7s linear infinite",
                      }}
                    />
                    Saving…
                  </span>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default PvAdd;
