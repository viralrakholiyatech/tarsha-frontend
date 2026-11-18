// ─────────────────────────────────────────────
//  Documents.jsx  —  Architecture Design Concept
//  Brand design — removes Bootstrap Tab/Nav + react-icons
// ─────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArchitectureRoute } from "../../../config/RouteConfig";
import ApiService from "../../../services/ApiService";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import toast from "react-hot-toast";
import {
  fetcharchFinaldbyid,
  deletearchfinald,
  getArchData,
  updatearchfinaldstage,
} from "../../../config/config";
import { getToken } from "../../../services/useLocalStorage";
import { FileUrl } from "../../../config/file_url";
import DesignConcept from "./DesignConcept";
import AddDocumentModal from "./Modals/AddDocumentModal";
import EditDocumentStatusModal from "./Modals/EditDocumentStatusModal";
import axios from "axios";
import { getfileDatabyId } from "../../../config/config";
import { FaMapMarkerAlt } from "react-icons/fa";
import { openFileInNewTab, getFileDisplayUrl } from "../../../services/S3Service";
import { FaMapLocationDot } from "react-icons/fa6";

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
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing:border-box; }
  @keyframes dcFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .dc-fade { animation:dcFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes dcSpin { to{transform:rotate(360deg)} }
  .dc-spinner { width:26px;height:26px;border-radius:50%;border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};animation:dcSpin 0.8s linear infinite; }

  /* ── Stage tabs ── */
  .dc-tabs { display:flex;gap:6px;flex-wrap:nowrap;overflow-x:auto;padding:0;margin:0;list-style:none;scrollbar-width:none; }
  .dc-tabs::-webkit-scrollbar { display:none; }
  .dc-tab { padding:8px 14px;border-radius:20px;cursor:pointer;white-space:nowrap;font-size:12px;font-weight:600;border:1.5px solid transparent;background:transparent;color:#595959;transition:all 0.18s;font-family:'DM Sans',sans-serif; }
  .dc-tab:hover  { background:${THEME.brandLight};color:${THEME.brand}; }
  .dc-tab.active { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand};font-weight:700; }

  /* ── Sub tabs ── */
  .dc-sub-tabs { display:flex;gap:8px;flex-wrap:wrap; }
  .dc-sub-tab { padding:8px 18px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:600;border:1.5px solid ${THEME.border};background:#fff;color:#595959;transition:all 0.18s;font-family:'DM Sans',sans-serif; }
  .dc-sub-tab:hover  { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand}; }
  .dc-sub-tab.active { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand};font-weight:700; }

  /* ── Table ── */
  .dc-table { width:100%;border-collapse:collapse;font-family:'DM Sans',sans-serif;font-size:13px; }
  .dc-table th { padding:9px 12px;font-size:10px;font-weight:700;color:${THEME.brandDark};text-transform:uppercase;letter-spacing:0.07em;background:${THEME.brandLight};border-bottom:2px solid #D4C4A0;white-space:nowrap; }
  .dc-table td { padding:11px 12px;border-bottom:1px solid #F5EFE4;vertical-align:middle; }
  .dc-table tbody tr:nth-child(even) { background:${THEME.rowAlt}; }
  .dc-table tbody tr:hover { background:${THEME.rowHover}; }

  /* ── Status badge ── */
  .dc-badge { display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600;cursor:pointer; }
  .dc-badge.approved { background:#F6FFED;color:#389E0D;border:1px solid #B7EB8F; }
  .dc-badge.rejected { background:#FFF1F0;color:#CF1322;border:1px solid #FFA39E; }
  .dc-badge.pending  { background:#FFF7E6;color:#D46B08;border:1px solid #FFD591; }

  /* ── Avatar ── */
  .dc-avatar { width:28px;height:28px;border-radius:50%;object-fit:cover;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.1); }
  .dc-avatar-stack { display:flex;align-items:center; }
  .dc-avatar-stack .dc-avatar { margin-left:-6px; }
  .dc-avatar-stack .dc-avatar:first-child { margin-left:0; }

  /* ── Buttons ── */
  .dc-del-btn { width:28px;height:28px;border-radius:7px;border:1.5px solid #FFA39E;background:#FFF1F0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all 0.15s; }
  .dc-del-btn:hover { background:#CF1322;border-color:#CF1322; }
  .dc-del-btn:hover svg { stroke:#fff; }
  .dc-btn-primary { padding:8px 18px;border-radius:10px;border:none;background:${THEME.brand};color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:'Sora',sans-serif;transition:all 0.18s;box-shadow:0 2px 6px ${THEME.brand}44; }
  .dc-btn-primary:hover { background:${THEME.brandDark}; }

  ::-webkit-scrollbar { width:5px;height:5px; }
  ::-webkit-scrollbar-track { background:${THEME.brandLight}; }
  ::-webkit-scrollbar-thumb { background:${THEME.brandMid};border-radius:10px; }
`;

// ─────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────
const STAGES = [
  { key: "basic_details", label: "Basic Details" },
  { key: "study", label: "Study/RND" },
  { key: "quotation", label: "Quotation" },
  { key: "design", label: "Design Concept" },
  { key: "consultants", label: "Consultants" },
  { key: "technical", label: "Technical Drawings" },
  { key: "schedule", label: "Schedule" },
  { key: "riskMatrix", label: "Risk Matrix" },
  { key: "sitevisit", label: "Site Visit" },
];
const ROUTE_MAP = {
  "Basic Details": ArchitectureRoute.basicdetails,
  Study: ArchitectureRoute.study,
  "Study/RND": ArchitectureRoute.study,
  Quotation: ArchitectureRoute.quotation,
  "Design Concept": ArchitectureRoute.documents,
  Consultants: ArchitectureRoute.consultants,
  "Technical Drawings": ArchitectureRoute.drawing,
  Schedule: ArchitectureRoute.schedule,
  "Risk Matrix": ArchitectureRoute.riskMatrix,
  "Site Visit": ArchitectureRoute.sitevisit,
};

// ─────────────────────────────────────────────
//  ATOMS
// ─────────────────────────────────────────────
function StatusBadge({ status, onClick }) {
  const cfg = {
    1: { cls: "approved", label: "Approved" },
    2: { cls: "rejected", label: "Rejected" },
    0: { cls: "pending", label: "Pending" },
  }[status] ?? { cls: "pending", label: "Pending" };
  return (
    <span className={`dc-badge ${cfg.cls}`} onClick={onClick}>
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: "currentColor",
        }}
      />
      {cfg.label}
    </span>
  );
}

function InfoTile({ label, value, children }) {
  return (
    <div
      style={{
        background: THEME.brandLight,
        border: `1px solid #D4C4A0`,
        borderRadius: 10,
        padding: "8px 12px",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 10,
          fontWeight: 700,
          color: THEME.brandMid,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </p>
      <div
        style={{
          marginTop: 3,
          fontSize: 12,
          fontWeight: 600,
          color: THEME.brandDark,
        }}
      >
        {children || value || (
          <span style={{ color: THEME.textLight }}>N/A</span>
        )}
      </div>
    </div>
  );
}

function AvatarStack({ src, alt = "User" }) {
  if (!src)
    return (
      <img
        src={`${FileUrl}/img/profile.jpeg`}
        className="dc-avatar"
        style={{ marginLeft: 0 }}
        alt={alt}
      />
    );
  return (
    <div className="dc-avatar-stack">
      {src.split(",").map((p, i) => (
        <img
          key={i}
          className="dc-avatar"
          src={`${FileUrl}/${p}`}
          alt={alt}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `${FileUrl}/img/profile.jpeg`;
          }}
        />
      ))}
    </div>
  );
}

function FileThumb({ path }) {
  if (!path) return null;
  const isPdf = path.toLowerCase().endsWith(".pdf");
  return isPdf ? (
    <span
      onClick={() => openFileInNewTab(path, FileUrl)}
      style={{ fontSize: 22, cursor: "pointer" }}
      title="View PDF"
    >
      📄
    </span>
  ) : (
    <img
      src={getFileDisplayUrl(path, FileUrl)}
      alt="upload"
      onClick={() => openFileInNewTab(path, FileUrl)}
      style={{
        width: 44,
        height: 44,
        objectFit: "cover",
        borderRadius: 6,
        border: `1px solid ${THEME.border}`,
        cursor: "pointer",
      }}
    />
  );
}

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const Documents = () => {
  const params = useParams();
  const navigate = useNavigate();
  const header = {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };

  const [activeTab, setActiveTab] = useState("design");
  const [subActiveTab, setSubActiveTab] = useState("design_concept");
  const [showModal, setShowModal] = useState(false);
  const [statusEditModal, setStatusEditModal] = useState(false);
  const [catgeoryId, setCatgeoryId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [hodimage, setHodImage] = useState("");
  const [teamId, setTeamId] = useState("");
  const [caseId, setCaseId] = useState("");
  const [startDate, setstartDate] = useState("");
  const [endDate, setendDate] = useState("");
  const [stageCompleted, setStageCompleted] = useState(false);
  const [documentdata, setdocumentData] = useState({});
  const [filedata, setFiledata] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await ApiService(
        null,
        params.id,
        header,
        fetcharchFinaldbyid.method,
        fetcharchFinaldbyid.url,
      );
      if (!res.data.error) {
        const payload = res.data.data || [];
        setData(payload);
        if (payload.length > 0) setStageCompleted(payload[0].is_done);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchArchData = async () => {
    try {
      const res = await ApiService(
        null,
        params.id,
        { Authorization: `Bearer ${getToken()}` },
        getArchData.method,
        getArchData.url,
      );
      if (!res.data.error) {
        const D = res.data.data?.find(
          (item) => item.title === "Design Concept",
        );
        if (D) {
          setdocumentData(D);
          setTeamId(D.assign_picture || "");
          setHodImage(D.hod_pictures || "");
          setCaseId(D.case_id || "");
          setstartDate(
            D.assign_on
              ? String(D.assign_on).split(/[T ]/)[0]
              : "",
          );
          setendDate(
            D.completed_by
              ? String(D.completed_by).split(/[T ]/)[0]
              : "",
          );
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
    fetchData();
    fetchArchData();
    fetchFileDataById();
  }, [params.id]);

  const handleAccordionClick = (id, label) => {
    const route = ROUTE_MAP[label];
    if (route) navigate(`/${route}/${id}`);
  };

  const handleCheckboxChange = async () => {
    const isChecked = !stageCompleted;
    setStageCompleted(isChecked);
    try {
      await ApiService(
        { stage_completed: isChecked ? 1 : 0, id: params.id },
        0,
        {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        updatearchfinaldstage.method,
        updatearchfinaldstage.url,
      );
    } catch (e) {
      console.error(e);
    }
  };

  const onRemovedocument = (id) => {
    SwalAlert({}).then(async (r) => {
      if (!r.isConfirmed) return;
      setLoading(true);
      try {
        const res = await ApiService(
          null,
          id,
          header,
          deletearchfinald.method,
          deletearchfinald.url,
        );
        if (!res.data.error) {
          toast.success(res.data.message);
          fetchData();
        } else toast.error(res.data.message);
      } catch (e) {
        toast.error(e?.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    });
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
        {/* ── Top header card ── */}
        <div
          style={{
            background: "#fff",
            border: `1px solid ${THEME.border}`,
            borderRadius: 14,
            padding: "18px 20px",
            marginBottom: 14,
            boxShadow: "0 2px 8px rgba(136,117,73,0.06)",
          }}
        >
          {/* Project info row */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              marginBottom: 14,
            }}
          >
            <button
              onClick={() => navigate(-1)}
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                border: `1.5px solid ${THEME.border}`,
                background: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = THEME.brandLight)
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke={THEME.brand}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  margin: "0 0 3px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: THEME.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                }}
              >
                Project No: {caseId || "—"}
              </p>
              <h1
                style={{
                  margin: "0 0 5px",
                  fontSize: 18,
                  fontWeight: 800,
                  color: THEME.text,
                  fontFamily: "'Sora',sans-serif",
                }}
              >
                {documentdata.project_name || "—"}
              </h1>
            {documentdata.client_name && (
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 600,
                    background: THEME.brandLight,
                    color: THEME.brandDark,
                    border: `1px solid #D4C4A0`,
                  }}
                >
                 {documentdata.client_name}
                </span>
              )}
            </div>
          </div>

          {/* ── File data tiles ── */}
          {filedata && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <InfoTile label="Company" value={filedata.company_name} />
              <InfoTile label="Project Type" value={filedata.project_type} />
              <InfoTile label="Category" value={filedata.category_type} />
              <InfoTile label="Address" value={filedata.address} />
              <InfoTile label="Location">
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Link
                    to={`https://www.google.com/maps?q=${filedata.lat},${filedata.long}`}
                    target="_blank"
                  >
                    <FaMapMarkerAlt
                      style={{ color: "#F44336", fontSize: 15 }}
                    />
                  </Link>
                  <Link to={filedata.google_location || "#"} target="_blank">
                    <FaMapLocationDot
                      style={{ color: "#28a745", fontSize: 15 }}
                    />
                  </Link>
                </div>
              </InfoTile>
              {(filedata.fp_no ||
                filedata.ward_no ||
                filedata.tpscheme ||
                filedata.cs_no ||
                filedata.b_no ||
                filedata.op_no ||
                filedata.rs_no) && (
                <InfoTile label="Land Details">
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 3 }}
                  >
                    {[
                      { label: "FP No", value: filedata.fp_no },
                      { label: "Ward No", value: filedata.ward_no },
                      { label: "TP Scheme", value: filedata.tpscheme },
                      { label: "CS No", value: filedata.cs_no },
                      { label: "B No", value: filedata.b_no },
                      { label: "OP No", value: filedata.op_no },
                      { label: "RS No", value: filedata.rs_no },
                    ]
                      .filter((r) => r.value?.trim())
                      .map((r) => (
                        <div
                          key={r.label}
                          style={{ display: "flex", gap: 5, fontSize: 11 }}
                        >
                          <span
                            style={{
                              color: THEME.brandMid,
                              fontWeight: 700,
                              minWidth: 60,
                            }}
                          >
                            {r.label}:
                          </span>
                          <span
                            style={{ color: THEME.brandDark, fontWeight: 600 }}
                          >
                            {r.value}
                          </span>
                        </div>
                      ))}
                  </div>
                </InfoTile>
              )}
            </div>
          )}
          
          <ul className="dc-tabs">
            {STAGES.map((s) => (
              <li key={s.key}>
                <button
                  className={`dc-tab${activeTab === s.key ? " active" : ""}`}
                  onClick={() => {
                    setActiveTab(s.key);
                    handleAccordionClick(params.id, s.label);
                  }}
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Team strip ── */}
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
              gap: 20,
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ position: "relative" }}>
                  <AvatarStack src={hodimage} alt="HOD" />
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
                <div>
                  <p
                    style={{
                      margin: "0 0 1px",
                      fontSize: 9,
                      fontWeight: 700,
                      color: THEME.textMuted,
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                    }}
                  >
                    Core Facilitator
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      fontWeight: 700,
                      color: THEME.text,
                    }}
                  >
                    {documentdata.hod_name || "—"}
                  </p>
                </div>
              </div>
              <div>
                <p
                  style={{
                    margin: "0 0 5px",
                    fontSize: 9,
                    fontWeight: 700,
                    color: THEME.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  Sub-function Team
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <AvatarStack src={teamId} alt="Team" />
                  {documentdata.assign_name && (
                    <span style={{ fontSize: 12, color: THEME.textMuted }}>
                      {documentdata.assign_name}
                    </span>
                  )}
                </div>
              </div>
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

        {/* ── Documents card ── */}
        <div
          style={{
            background: "#fff",
            border: `1px solid ${THEME.border}`,
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 2px 10px rgba(136,117,73,0.06)",
          }}
        >
          {/* Sub-tab header */}
          <div
            style={{
              padding: "14px 20px",
              borderBottom: `1px solid ${THEME.border}`,
              background: "#FDFAF5",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 800,
                color: THEME.text,
                fontFamily: "'Sora',sans-serif",
              }}
            >
              Documents
            </h2>
            <div className="dc-sub-tabs">
              {[
                { key: "design_concept", label: "Design Concept" },
                { key: "final_design", label: "Final Design" },
              ].map((t) => (
                <button
                  key={t.key}
                  className={`dc-sub-tab${subActiveTab === t.key ? " active" : ""}`}
                  onClick={() => setSubActiveTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: 20 }}>
            {/* ── Design Concept sub-tab ── */}
            {subActiveTab === "design_concept" && (
              <div className="dc-fade">
                <DesignConcept />
              </div>
            )}

            {/* ── Final Design sub-tab ── */}
            {subActiveTab === "final_design" && (
              <div className="dc-fade">
                {loading ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "40px 0",
                      gap: 12,
                    }}
                  >
                    <div className="dc-spinner" />
                    <p
                      style={{
                        color: THEME.textLight,
                        fontSize: 13,
                        margin: 0,
                      }}
                    >
                      Loading…
                    </p>
                  </div>
                ) : (
                  <>
                    <div style={{ overflowX: "auto", marginBottom: 14 }}>
                      <table className="dc-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Upload</th>
                            <th>Type</th>
                            <th>Remarks</th>
                            <th>Status</th>
                            <th>Team (Upload By)</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.length === 0 ? (
                            <tr>
                              <td
                                colSpan={7}
                                style={{
                                  textAlign: "center",
                                  color: THEME.textLight,
                                  padding: 24,
                                }}
                              >
                                No documents uploaded yet.
                              </td>
                            </tr>
                          ) : (
                            data.map((item, idx) => (
                              <tr key={item.id}>
                                <td
                                  style={{
                                    color: THEME.textMuted,
                                    fontWeight: 700,
                                    width: 36,
                                  }}
                                >
                                  {idx + 1}
                                </td>
                                <td>
                                  <FileThumb path={item.upload} />
                                </td>
                                <td style={{ fontWeight: 600 }}>
                                  {item.type || "—"}
                                </td>
                                <td
                                  style={{
                                    color: THEME.textMuted,
                                    maxWidth: 160,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {item.remark || "—"}
                                </td>
                                <td>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 6,
                                    }}
                                  >
                                    <StatusBadge
                                      status={item.status}
                                      onClick={() => {
                                        setCatgeoryId(item.id);
                                        setStatusEditModal(true);
                                      }}
                                    />
                                    {item.statusremark && (
                                      <span
                                        title={item.statusremark}
                                        style={{
                                          fontSize: 13,
                                          color: "#657488",
                                          cursor: "help",
                                        }}
                                      >
                                        ℹ️
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 8,
                                    }}
                                  >
                                    {item.profile_picture && (
                                      <img
                                        src={`${FileUrl}/${item.profile_picture}`}
                                        className="dc-avatar"
                                        alt="uploader"
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = `${FileUrl}/img/profile.jpeg`;
                                        }}
                                      />
                                    )}
                                    {item.date && (
                                      <span
                                        style={{
                                          fontSize: 11,
                                          color: THEME.textMuted,
                                        }}
                                      >
                                        {item.date}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <button
                                    className="dc-del-btn"
                                    title="Delete"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onRemovedocument(item.id);
                                    }}
                                  >
                                    <svg
                                      width="12"
                                      height="12"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="#CF1322"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <polyline points="3 6 5 6 21 6" />
                                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                      <path d="M10 11v6" />
                                      <path d="M14 11v6" />
                                    </svg>
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div
                      style={{ display: "flex", justifyContent: "flex-end" }}
                    >
                      <button
                        className="dc-btn-primary"
                        onClick={() => setShowModal(true)}
                      >
                        + Add Document
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Stage completed checkbox */}
          <div
            style={{
              padding: "14px 20px",
              borderTop: `1px solid ${THEME.border}`,
              background: "#FDFAF5",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <input
              type="checkbox"
              id="stage_completed"
              style={{
                width: 16,
                height: 16,
                accentColor: THEME.brand,
                cursor: "pointer",
              }}
              checked={!!stageCompleted}
              onChange={handleCheckboxChange}
            />
            <label
              htmlFor="stage_completed"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: THEME.text,
                cursor: "pointer",
              }}
            >
              Mark Initial Stage as Completed
            </label>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <AddDocumentModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        id={params.id}
        onSuccess={fetchData}
      />
      <EditDocumentStatusModal
        show={statusEditModal}
        handleClose={() => setStatusEditModal(false)}
        id={catgeoryId}
        onSuccess={fetchData}
      />
    </>
  );
};

export default Documents;
