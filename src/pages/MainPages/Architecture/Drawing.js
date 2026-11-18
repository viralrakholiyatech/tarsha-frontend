import React, { useEffect, useState, memo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArchitectureRoute } from "../../../config/RouteConfig";
import AddCategory from "./Modals/AddCategory";
import AddDrawingModal from "./Modals/AddDrawingModal";
import InternalstatusModal from "./Modals/InternalstatusModal";
import ClientstatusModal from "./Modals/ClientstatusModal";
import ApiService from "../../../services/ApiService";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import toast from "react-hot-toast";
import { getToken } from "../../../services/useLocalStorage";
import {
  fetcharchdrwaingbyid,
  deletedrawing,
  getArchData,
  updatearchdrawingstage,
} from "../../../config/config";
import { FileUrl } from "../../../config/file_url";
import axios from "axios";
import { getfileDatabyId } from "../../../config/config";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaMapLocationDot } from "react-icons/fa6";
import { openFileInNewTab, getFileDisplayUrl } from "../../../services/S3Service";

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
  @keyframes drFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .dr-fade { animation:drFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes drSpin { to{transform:rotate(360deg)} }
  .dr-spinner { width:26px;height:26px;border-radius:50%;border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};animation:drSpin 0.8s linear infinite; }

  /* ── Stage tabs ── */
  .dr-tabs { display:flex;gap:6px;flex-wrap:nowrap;overflow-x:auto;padding:0;margin:0;list-style:none;scrollbar-width:none; }
  .dr-tabs::-webkit-scrollbar { display:none; }
  .dr-tab { padding:8px 14px;border-radius:20px;cursor:pointer;white-space:nowrap;font-size:12px;font-weight:600;border:1.5px solid transparent;background:transparent;color:#595959;transition:all 0.18s;font-family:'DM Sans',sans-serif; }
  .dr-tab:hover  { background:${THEME.brandLight};color:${THEME.brand}; }
  .dr-tab.active { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand};font-weight:700; }

  /* ── Table ── */
  .dr-table { width:100%;border-collapse:collapse;font-family:'DM Sans',sans-serif;font-size:13px; }
  .dr-table th { padding:9px 12px;font-size:10px;font-weight:700;color:${THEME.brandDark};text-transform:uppercase;letter-spacing:0.07em;background:${THEME.brandLight};border-bottom:2px solid #D4C4A0;white-space:nowrap; }
  .dr-table td { padding:11px 12px;border-bottom:1px solid #F5EFE4;vertical-align:middle; }
  .dr-table tbody tr:nth-child(even) { background:${THEME.rowAlt}; }
  .dr-table tbody tr:hover { background:${THEME.rowHover}; }

  /* ── Status badges (string "0"/"1"/"2") ── */
  .dr-badge { display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600; }
  .dr-badge.approved { background:#F6FFED;color:#389E0D;border:1px solid #B7EB8F; }
  .dr-badge.rejected { background:#FFF1F0;color:#CF1322;border:1px solid #FFA39E; }
  .dr-badge.pending  { background:#FFF7E6;color:#D46B08;border:1px solid #FFD591; }

  /* ── Accordion ── */
  .dr-acc-header { display:flex;align-items:center;justify-content:space-between;padding:12px 16px;cursor:pointer;background:#FDFAF5;border-radius:12px;transition:background 0.15s;user-select:none; }
  .dr-acc-header:hover { background:${THEME.brandLight}; }
  .dr-acc-header.open { border-radius:12px 12px 0 0;background:${THEME.brandLight}; }

  /* ── Buttons ── */
  .dr-del-btn { width:28px;height:28px;border-radius:7px;border:1.5px solid #FFA39E;background:#FFF1F0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all 0.15s; }
  .dr-del-btn:hover { background:#CF1322;border-color:#CF1322; }
  .dr-del-btn:hover svg { stroke:#fff; }
  .dr-btn-primary { padding:8px 16px;border-radius:10px;border:none;background:${THEME.brand};color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:'Sora',sans-serif;transition:all 0.18s;box-shadow:0 2px 6px ${THEME.brand}44; }
  .dr-btn-primary:hover { background:${THEME.brandDark}; }
  .dr-btn-sm { padding:5px 12px;border-radius:8px;border:none;background:${THEME.brand};color:#fff;font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s; }
  .dr-btn-sm:hover { background:${THEME.brandDark}; }

  /* ── Avatar ── */
  .dr-avatar { width:28px;height:28px;border-radius:50%;object-fit:cover;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.1); }
  .dr-avatar-stack { display:flex;align-items:center; }
  .dr-avatar-stack .dr-avatar { margin-left:-8px; }
  .dr-avatar-stack .dr-avatar:first-child { margin-left:0; }

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
  }[String(status)] ?? { cls: "pending", label: "Pending" };
  return (
    <span
      className={`dr-badge ${cfg.cls}`}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
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

const getDisplayName = (filePath) => {
  if (!filePath) return "";
  const fileName = filePath.split("/").pop();
  const withoutTimestamp = fileName.replace(/^[\d.]+_[\d.]+-/, "");
  return withoutTimestamp;
};

function FileThumb({ path }) {
  if (!path) return null;
  const isPdf = path.toLowerCase().endsWith(".pdf");
  const name = getDisplayName(path);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: "pointer",
        minWidth: 0,
      }}
      onClick={() => openFileInNewTab(path, FileUrl)}
      title={name}
    >
      {isPdf ? (
        <span style={{ fontSize: 28 }}>📄</span>
      ) : (
        <img
          src={getFileDisplayUrl(path, FileUrl)}
          alt="design"
          style={{
            width: 44,
            height: 44,
            objectFit: "cover",
            borderRadius: 6,
            border: `1px solid ${THEME.border}`,
          }}
        />
      )}
      <span
        style={{
          fontSize: 11,
          color: "#657488",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: 180,
          display: "block",
          marginTop: 3,
        }}
      >
        {name}
      </span>
    </div>
  );
}

function AvatarStack({ src, alt = "User" }) {
  if (!src)
    return (
      <img
        src={`${FileUrl}/img/profile.jpeg`}
        className="dr-avatar"
        style={{ marginLeft: 0 }}
        alt={alt}
      />
    );
  return (
    <div className="dr-avatar-stack">
      {src.split(",").map((p, i) => (
        <img
          key={i}
          className="dr-avatar"
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

// ─────────────────────────────────────────────
//  DRAWING ACCORDION
// ─────────────────────────────────────────────
const DrawingAccordion = memo(
  ({ groupName, items, onInternal, onClient, onDelete, onAdd }) => {
    const [open, setOpen] = useState(true);
    return (
      <div
        style={{
          border: `1px solid ${THEME.border}`,
          borderRadius: 12,
          marginBottom: 12,
          overflow: "hidden",
        }}
      >
        <div
          className={`dr-acc-header${open ? " open" : ""}`}
          onClick={() => setOpen((v) => !v)}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg
              style={{
                transition: "transform 0.2s",
                transform: open ? "rotate(180deg)" : "rotate(0)",
                flexShrink: 0,
              }}
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke={THEME.textMuted}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 700, color: THEME.text }}>
              {groupName}
            </span>
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
              {items.length} item{items.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {open && (
          <div style={{ overflowX: "auto" }}>
            <table className="dr-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Design</th>
                  <th>Internal Review</th>
                  <th>Client Review</th>
                  <th>Team (Upload By)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        textAlign: "center",
                        color: THEME.textLight,
                        padding: 20,
                      }}
                    >
                      No drawings added.
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <tr key={item.adid}>
                      <td
                        style={{
                          color: THEME.textMuted,
                          fontWeight: 700,
                          width: 36,
                        }}
                      >
                        {idx + 1}
                      </td>
                      {/* Design */}
                      <td style={{ minWidth: 200 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <FileThumb path={item.design} />
                          {item?.notes && (
                            <span
                              style={{
                                fontSize: 13,
                                color: "#657488",
                              }}
                            >
                              {item?.notes}
                            </span>
                          )}
                        </div>
                      </td>
                      {/* Internal review */}
                      <td
                        onClick={() => onInternal(item?.adid)}
                        style={{ cursor: "pointer" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          {item.review_profile && (
                            <img
                              src={`${FileUrl}/${item.review_profile}`}
                              className="dr-avatar"
                              alt="reviewer"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `${FileUrl}/img/profile.jpeg`;
                              }}
                            />
                          )}
                          <StatusBadge status={item.internalstatus} />
                          {item.internalremark && (
                            <span
                              title={item.internalremark}
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
                      {/* Client review */}
                      <td
                        onClick={() => onClient(item?.adid)}
                        style={{ cursor: "pointer" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <StatusBadge status={item.clientstatus} />
                          {item.clientremark && (
                            <span
                              title={item.clientremark}
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
                      {/* Upload by */}
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
                              className="dr-avatar"
                              alt="uploader"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `${FileUrl}/img/profile.jpeg`;
                              }}
                            />
                          )}
                          {item.date && (
                            <span
                              style={{ fontSize: 11, color: THEME.textMuted }}
                            >
                              {item.date}
                            </span>
                          )}
                        </div>
                      </td>
                      {/* Action */}
                      <td>
                        {item.clientstatus === "0" &&
                          item.internalstatus === "0" && (
                            <button
                              className="dr-del-btn"
                              title="Delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(item?.adid);
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
                          )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div
              style={{
                padding: "10px 16px",
                display: "flex",
                justifyContent: "flex-end",
                borderTop: `1px solid ${THEME.border}`,
              }}
            >
              <button
                className="dr-btn-sm"
                onClick={() => onAdd(items[0]?.mad_id)}
              >
                + Add
              </button>
            </div>
          </div>
        )}
      </div>
    );
  },
);

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const Drawing = () => {
  const params = useParams();
  const navigate = useNavigate();
  const header = {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("technical");
  const [catgeoryId, setCatgeoryId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSpaceModal, setShowSpaceModal] = useState(false);
  const [showInternalModal, setShowInternalModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [catgeoryData, setCatgeoryData] = useState({});
  const [hodimage, setHodImage] = useState("");
  const [teamId, setTeamId] = useState("");
  const [caseId, setCaseId] = useState("");
  const [startDate, setstartDate] = useState("");
  const [endDate, setendDate] = useState("");
  const [stageCompleted, setStageCompleted] = useState(false);
  const [data, setData] = useState({});
  const [filedata, setFiledata] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await ApiService(
        null,
        params.id,
        header,
        fetcharchdrwaingbyid.method,
        fetcharchdrwaingbyid.url,
      );
      if (!res.data.error) {
        const payload = res.data.data || [];
        if (payload.length > 0) setStageCompleted(payload[0].is_done);
        const grouped = payload.reduce((acc, item) => {
          const cat = item.name ?? "uncategorized";
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(item);
          return acc;
        }, {});
        setCatgeoryData(grouped);
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
          (item) => item.title === "Technical Drawings",
        );
        if (D) {
          setData(D);
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
        updatearchdrawingstage.method,
        updatearchdrawingstage.url,
      );
    } catch (e) {
      console.error(e);
    }
  };

  const onRemovedrawing = (id) => {
    SwalAlert({}).then(async (r) => {
      if (!r.isConfirmed) return;
      setLoading(true);
      try {
        const res = await ApiService(
          null,
          id,
          header,
          deletedrawing.method,
          deletedrawing.url,
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

  const categories = Object.entries(catgeoryData).filter(
    ([g, items]) => g.trim() && items.length > 0,
  );

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
                {data.project_name || "—"}
              </h1>
              {data.client_name && (
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
                  {data.client_name}
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
          <ul className="dr-tabs">
            {STAGES.map((s) => (
              <li key={s.key}>
                <button
                  className={`dr-tab${activeTab === s.key ? " active" : ""}`}
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
                    {data.hod_name || "—"}
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
                  {data.assign_name && (
                    <span style={{ fontSize: 12, color: THEME.textMuted }}>
                      {data.assign_name}
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

        {/* ── Drawings card ── */}
        <div
          style={{
            background: "#fff",
            border: `1px solid ${THEME.border}`,
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 2px 10px rgba(136,117,73,0.06)",
          }}
        >
          {/* Card header */}
          <div
            style={{
              padding: "14px 20px",
              borderBottom: `1px solid ${THEME.border}`,
              background: "#FDFAF5",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
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
              Technical Drawings
            </h2>
            <button
              className="dr-btn-primary"
              onClick={() => setShowModal(true)}
            >
              + Add Category
            </button>
          </div>

          <div style={{ padding: 20 }}>
            {/* Loading */}
            {loading && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "40px 0",
                  gap: 12,
                }}
              >
                <div className="dr-spinner" />
                <p style={{ color: THEME.textLight, fontSize: 13, margin: 0 }}>
                  Loading…
                </p>
              </div>
            )}

            {/* Empty */}
            {!loading && categories.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📐</div>
                <p
                  style={{
                    color: THEME.textLight,
                    fontSize: 13,
                    margin: "0 0 12px",
                  }}
                >
                  No drawing categories yet.
                </p>
              </div>
            )}

            {/* Accordions */}
            {!loading &&
              categories.map(([groupName, items]) => (
                <DrawingAccordion
                  key={groupName}
                  groupName={groupName}
                  items={items}
                  onInternal={(id) => {
                    setCatgeoryId(id);
                    setShowInternalModal(true);
                  }}
                  onClient={(id) => {
                    setCatgeoryId(id);
                    setShowClientModal(true);
                  }}
                  onDelete={onRemovedrawing}
                  onAdd={(id) => {
                    setCatgeoryId(id);
                    setShowSpaceModal(true);
                  }}
                />
              ))}
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
      <AddDrawingModal
        show={showSpaceModal}
        handleClose={() => setShowSpaceModal(false)}
        id={catgeoryId}
        params={params.id}
        onSuccess={fetchData}
      />
      <AddCategory
        show={showModal}
        handleClose={() => setShowModal(false)}
        id={params.id}
        onSuccess={fetchData}
      />
      <InternalstatusModal
        show={showInternalModal}
        handleClose={() => setShowInternalModal(false)}
        id={catgeoryId}
        onSuccess={fetchData}
      />
      <ClientstatusModal
        show={showClientModal}
        handleClose={() => setShowClientModal(false)}
        id={catgeoryId}
        onSuccess={fetchData}
      />
    </>
  );
};

export default Drawing;
