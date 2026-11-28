import React, { useEffect, useState, memo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { InteriorRoute } from "../../../config/RouteConfig";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import ApiService from "../../../services/ApiService";
import { getToken } from "../../../services/useLocalStorage";
import { FileUrl } from "../../../config/file_url";
import toast from "react-hot-toast";
import {
  getFees,
  deleteFees,
  getQuationbyid,
  getInteriorData,
  updatequotationstage,
  deleteVendor,
} from "../../../config/config";
import Contractor from "./Contractor";
import Material from "./Material";
import AddFeesModal from "./Modals/AddFeesModal";
import UpdateFeesModal from "./Modals/UpdateFeesModal";
import UpdateVendorCatgoryModal from "./Modals/UpdateVendorCatgoryModal";
import UpdateVendorModal from "./Modals/UpdateVendorModal";
import AddVendorQuationModal from "./Modals/AddVendorQuationModal";
import AddVendorsModal from "./Modals/AddVendorsModal";
import axios from "axios";
import { getfileDatabyId } from "../../../config/config";
import { FaMapMarkerAlt } from "react-icons/fa";
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
  @keyframes qFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .q-fade { animation:qFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes qSpin { to{transform:rotate(360deg)} }
  .q-spinner { width:26px;height:26px;border-radius:50%;border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};animation:qSpin 0.8s linear infinite; }

  /* ── Stage tabs ── */
  .q-tabs { display:flex;gap:6px;flex-wrap:nowrap;overflow-x:auto;padding:0;margin:0;list-style:none;scrollbar-width:none; }
  .q-tabs::-webkit-scrollbar { display:none; }
  .q-tab { padding:8px 14px;border-radius:20px;cursor:pointer;white-space:nowrap;font-size:12px;font-weight:600;border:1.5px solid transparent;background:transparent;color:#595959;transition:all 0.18s;font-family:'DM Sans',sans-serif; }
  .q-tab:hover  { background:${THEME.brandLight};color:${THEME.brand}; }
  .q-tab.active { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand};font-weight:700; }

  /* ── Sub tabs ── */
  .q-sub-tabs { display:flex;gap:8px;flex-wrap:wrap; }
  .q-sub-tab { padding:8px 18px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:600;border:1.5px solid ${THEME.border};background:#fff;color:#595959;transition:all 0.18s;font-family:'DM Sans',sans-serif; }
  .q-sub-tab:hover  { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand}; }
  .q-sub-tab.active { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand};font-weight:700; }

  /* ── Table ── */
  .q-table { width:100%;border-collapse:collapse;font-family:'DM Sans',sans-serif;font-size:13px; }
  .q-table th { padding:9px 12px;font-size:10px;font-weight:700;color:${THEME.brandDark};text-transform:uppercase;letter-spacing:0.07em;background:${THEME.brandLight};border-bottom:2px solid #D4C4A0;white-space:nowrap; }
  .q-table td { padding:11px 12px;border-bottom:1px solid #F5EFE4;vertical-align:middle; }
  .q-table tbody tr:nth-child(even) { background:${THEME.rowAlt}; }
  .q-table tbody tr:hover { background:${THEME.rowHover}; }

  /* ── Status badge ── */
  .q-badge { display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600;white-space:nowrap; }
  .q-badge.approved { background:#F6FFED;color:#389E0D;border:1px solid #B7EB8F; }
  .q-badge.rejected { background:#FFF1F0;color:#CF1322;border:1px solid #FFA39E; }
  .q-badge.pending  { background:#FFF7E6;color:#D46B08;border:1px solid #FFD591; }

  /* ── Accordion ── */
  .q-acc-header { display:flex;align-items:center;justify-content:space-between;padding:12px 16px;cursor:pointer;background:#FDFAF5;border-radius:12px;transition:background 0.15s; }
  .q-acc-header:hover { background:${THEME.brandLight}; }
  .q-acc-header.open { border-radius:12px 12px 0 0;background:${THEME.brandLight}; }

  /* ── Action buttons ── */
  .q-edit-btn { width:28px;height:28px;border-radius:7px;border:1.5px solid ${THEME.border};background:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all 0.15s;margin-right:4px; }
  .q-edit-btn:hover { background:${THEME.brandLight};border-color:${THEME.brand}; }
  .q-del-btn  { width:28px;height:28px;border-radius:7px;border:1.5px solid #FFA39E;background:#FFF1F0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all 0.15s; }
  .q-del-btn:hover { background:#CF1322;border-color:#CF1322; }
  .q-del-btn:hover svg { stroke:#fff; }

  /* ── Primary / outline buttons ── */
  .q-btn-primary { padding:8px 18px;border-radius:10px;border:none;background:${THEME.brand};color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:'Sora',sans-serif;transition:all 0.18s;box-shadow:0 2px 6px ${THEME.brand}44; }
  .q-btn-primary:hover { background:${THEME.brandDark}; }

  /* ── Avatar ── */
  .q-avatar { width:28px;height:28px;border-radius:50%;object-fit:cover;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.1); }
  .q-avatar-stack { display:flex;align-items:center; }
  .q-avatar-stack .q-avatar { margin-left:-6px; }
  .q-avatar-stack .q-avatar:first-child { margin-left:0; }

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
  "Basic Details": InteriorRoute.basicdetails,
  Study: InteriorRoute.study,
  "Study/RND": InteriorRoute.study,
  Quotation: InteriorRoute.quotation,
  "Design Concept": InteriorRoute.concept,
  Consultants: InteriorRoute.consultants,
  "Technical Drawings": InteriorRoute.technicaldrawing,
  Schedule: InteriorRoute.schedule,
  "Risk Matrix": InteriorRoute.riskMatrix,
  "Site Visit": InteriorRoute.sitevisit,
};

const SUB_TABS = [
  { key: "fees", label: "Fees" },
  { key: "vendor", label: "Vendors" },
  { key: "contactors", label: "Contractors" },
  { key: "material", label: "Material" },
];

// ─────────────────────────────────────────────
//  ATOMS
// ─────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = {
    1: { cls: "approved", label: "Approved" },
    2: { cls: "rejected", label: "Rejected" },
    0: { cls: "pending", label: "Pending" },
  }[status] ?? { cls: "pending", label: "Pending" };
  return (
    <span className={`q-badge ${cfg.cls}`}>
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

function EditBtn({ onClick }) {
  return (
    <button className="q-edit-btn" onClick={onClick} title="Edit">
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke={THEME.brand}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    </button>
  );
}

function DelBtn({ onClick }) {
  return (
    <button className="q-del-btn" onClick={onClick} title="Delete">
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

function AvatarStack({ src, alt = "User" }) {
  if (!src)
    return (
      <img
        src={"data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%20width%3D%2264%22%20height%3D%2264%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2232%22%20r%3D%2232%22%20fill%3D%22%23d1d5db%22%2F%3E%3Cpath%20d%3D%22M32%2014a12%2012%200%201%200%200%2024%2012%2012%200%200%200%200-24zm0%2028c-13.3%200-24%208.5-24%2019v3h48v-3c0-10.5-10.7-19-24-19z%22%20fill%3D%22%239ca3af%22%2F%3E%3C%2Fsvg%3E"}
        className="q-avatar"
        style={{ marginLeft: 0 }}
        alt={alt}
      />
    );
  return (
    <div className="q-avatar-stack">
      {src.split(",").map((p, i) => (
        <img
          key={i}
          className="q-avatar"
          src={`${FileUrl}/${p}`}
          alt={alt}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%20width%3D%2264%22%20height%3D%2264%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2232%22%20r%3D%2232%22%20fill%3D%22%23d1d5db%22%2F%3E%3Cpath%20d%3D%22M32%2014a12%2012%200%201%200%200%2024%2012%2012%200%200%200%200-24zm0%2028c-13.3%200-24%208.5-24%2019v3h48v-3c0-10.5-10.7-19-24-19z%22%20fill%3D%22%239ca3af%22%2F%3E%3C%2Fsvg%3E";
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
//  VENDOR ACCORDION
// ─────────────────────────────────────────────
const VendorAccordion = memo(
  ({ groupName, data, onEditCat, onEditVendor, onDeleteVendor, onAdd }) => {
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
          className={`q-acc-header${open ? " open" : ""}`}
          onClick={() => setOpen((v) => !v)}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg
              style={{
                transition: "transform 0.2s",
                transform: open ? "rotate(180deg)" : "rotate(0)",
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
                fontWeight: 700,
                background: THEME.brandLight,
                color: THEME.brandDark,
                border: `1px solid #D4C4A0`,
              }}
            >
              ₹{data.totalPrice?.toLocaleString?.() ?? data.totalPrice}
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
              {data.items.length} vendor{data.items.length !== 1 ? "s" : ""}
            </span>
          </div>
          <button
            className="q-edit-btn"
            style={{ fontSize: 10, padding: "3px 10px" }}
            onClick={(e) => {
              e.stopPropagation();
              onEditCat(data.items[0]?.mst_id);
            }}
          >
            ✏️ Edit
          </button>
        </div>

        {open && (
          <div style={{ overflowX: "auto" }}>
            <table className="q-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Vendor</th>
                  <th>Mobile No.</th>
                  <th>Amount</th>
                  <th>Remark</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        textAlign: "center",
                        color: THEME.textLight,
                        padding: 20,
                      }}
                    >
                      No vendors
                    </td>
                  </tr>
                ) : (
                  data.items.map((item, idx) => (
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
                      <td style={{ fontWeight: 600 }}>{item.vendors}</td>
                      <td>{item.mobile_no}</td>
                      <td style={{ fontWeight: 700, color: THEME.brandDark }}>
                        ₹{item.price}
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
                        <StatusBadge status={item.status} />
                      </td>
                      <td>
                     
                        {item.qid && (
                          <>
                            <EditBtn
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditVendor(item.qid);
                              }}
                            />
                            <DelBtn
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteVendor(item.qid);
                              }}
                            />
                          </>
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
                className="q-btn-primary"
                style={{ fontSize: 11 }}
                onClick={() => onAdd(data.items[0]?.mst_id)}
              >
                + Add Vendor
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
function Quotation() {
  const params = useParams();
  const navigate = useNavigate();
  const header = {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };

  const [activeTab, setActiveTab] = useState("quotation");
  const [subActiveTab, setSubActiveTab] = useState("fees");
  const [Fees, setFees] = useState([]);
  const [startDate, setstartDate] = useState("");
  const [endDate, setendDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [stageCompleted, setStageCompleted] = useState(false);
  const [catgeoryData, setCatgeoryData] = useState({});
  const [hodimage, setHodImage] = useState("");
  const [teamId, setTeamId] = useState("");
  const [catgeoryId, setCatgeoryId] = useState(null);
  const [showfeesModal, setShowfeesModal] = useState(false);
  const [showupdateFeesModal, setShowupdateFeesModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showVendorcatModal, setShowVendorcatModal] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showSpaceModal, setShowSpaceModal] = useState(false);
  const [data, setData] = useState({});
  const [caseId, setCaseId] = useState("");
  const [filedata, setFiledata] = useState(null);

  // ── Fetchers ──────────────────────────────
  const fetchFees = async () => {
    setLoading(true);
    try {
      const res = await ApiService(
        null,
        params.id,
        header,
        getFees.method,
        getFees.url,
      );
      if (!res.data.error) {
        const payload = res.data.data || [];
        setFees(payload);
        if (payload.length > 0) setStageCompleted(payload[0].is_done);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await ApiService(
        null,
        params.id,
        header,
        getQuationbyid.method,
        getQuationbyid.url,
      );
      if (!res.data.error) {
        const grouped = (res.data.data || []).reduce((acc, item) => {
          const cat = item.name ?? "uncategorized";
          if (!acc[cat]) acc[cat] = { items: [], totalPrice: 0 };
          acc[cat].items.push(item);
          acc[cat].totalPrice += item.price || 0;
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
        getInteriorData.method,
        getInteriorData.url,
      );
      if (!res.data.error) {
        const D = res.data.data?.find((item) => item.title === "Quotation");
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
  } catch (e) { console.error(e); }
};

  useEffect(() => {
    fetchFees();
    fetchArchData();
    fetchData();
    fetchFileDataById()
  }, [params.id]);

  // ── Handlers ──────────────────────────────
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
        updatequotationstage.method,
        updatequotationstage.url,
      );
    } catch (e) {
      console.error(e);
    }
  };

  const onRemovefees = (id) => {
    SwalAlert({}).then(async (r) => {
      if (!r.isConfirmed) return;
      setLoading(true);
      try {
        const res = await ApiService(
          null,
          id,
          header,
          deleteFees.method,
          deleteFees.url,
        );
        if (!res.data.error) {
          toast.success(res.data.message);
          fetchFees();
        } else toast.error(res.data.message);
      } catch (e) {
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    });
  };

  const onRemoveVendor = (id) => {
    SwalAlert({}).then(async (r) => {
      if (!r.isConfirmed) return;
      setLoading(true);
      try {
        const res = await ApiService(
          null,
          id,
          header,
          deleteVendor.method,
          deleteVendor.url,
        );
        if (!res.data.error) {
          toast.success(res.data.message);
          fetchData();
        } else toast.error(res.data.message);
      } catch (e) {
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    });
  };

  // ── Shared header + strip (reused across sub-tabs) ──
  const PageHeader = (
    <>
      {/* Top header card */}
<div style={{ background:"#fff", border:`1px solid ${THEME.border}`, borderRadius:14,
  padding:"18px 20px", marginBottom:14, boxShadow:"0 2px 8px rgba(136,117,73,0.06)" }}>

  {/* Project info row */}
  <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:14 }}>
    <button onClick={() => navigate(-1)}
      style={{ width:34, height:34, borderRadius:8, border:`1.5px solid ${THEME.border}`, background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.15s" }}
      onMouseEnter={(e) => e.currentTarget.style.background = THEME.brandLight}
      onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={THEME.brand} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
      </svg>
    </button>
    <div style={{ flex:1 }}>
      <p style={{ margin:"0 0 3px", fontSize:11, fontWeight:700, color:THEME.textMuted,
        textTransform:"uppercase", letterSpacing:"0.07em" }}>
        Project No: {caseId || "—"}
      </p>
      <h1 style={{ margin:"0 0 5px", fontSize:18, fontWeight:800, color:THEME.text,
        fontFamily:"'Sora',sans-serif" }}>
        {data.project_name || "—"}
      </h1>
      {data.client_name && (
        <span style={{ padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600,
          background:THEME.brandLight, color:THEME.brandDark, border:`1px solid #D4C4A0` }}>
          {data.client_name}
        </span>
      )}
    </div>
  </div>

  {/* ── File data tiles ── */}
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

        <ul className="q-tabs">
          {STAGES.map((s) => (
            <li key={s.key}>
              <button
                className={`q-tab${activeTab === s.key ? " active" : ""}`}
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

      {/* Team strip */}
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
    </>
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
        {PageHeader}

        {/* ── Main quotation card ── */}
        <div
          style={{
            background: "#fff",
            border: `1px solid ${THEME.border}`,
            borderRadius: 14,
            // overflow: "hidden",
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
              Quotation
            </h2>
            <div className="q-sub-tabs">
              {SUB_TABS.map((t) => (
                <button
                  key={t.key}
                  className={`q-sub-tab${subActiveTab === t.key ? " active" : ""}`}
                  onClick={() => setSubActiveTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: 20 }}>
            {/* ── FEES ── */}
            {subActiveTab === "fees" && (
              <div className="q-fade">
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
                    <div className="q-spinner" />
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
                      <table className="q-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Remark</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Fees.length === 0 ? (
                            <tr>
                              <td
                                colSpan={5}
                                style={{
                                  textAlign: "center",
                                  color: THEME.textLight,
                                  padding: 24,
                                }}
                              >
                                No fees added yet.
                              </td>
                            </tr>
                          ) : (
                            Fees.map((item, idx) => (
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
                                <td
                                  style={{
                                    fontWeight: 700,
                                    color: THEME.brandDark,
                                  }}
                                >
                                  ₹{item.price}
                                </td>
                                <td>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 6,
                                    }}
                                  >
                                    <StatusBadge status={item.status} />
                                    {item.remark && (
                                      <span
                                        title={item.remark}
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
                                <td style={{ color: THEME.textMuted }}>
                                  {item.remark || "—"}
                                </td>
                                <td>
                                  <EditBtn
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCatgeoryId(item.id);
                                      setShowupdateFeesModal(true);
                                    }}
                                  />
                                  <DelBtn
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onRemovefees(item.id);
                                    }}
                                  />
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
                        className="q-btn-primary"
                        onClick={() => setShowfeesModal(true)}
                      >
                        + Add Fee
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── VENDORS ── */}
            {subActiveTab === "vendor" && (
              <div className="q-fade">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 14,
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
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
                        fontSize: 13,
                        fontWeight: 700,
                        color: THEME.text,
                      }}
                    >
                      Vendor Categories
                    </h3>
                    <span
                      style={{
                        padding: "2px 10px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        background: THEME.brandLight,
                        color: THEME.brandDark,
                        border: `1px solid #D4C4A0`,
                      }}
                    >
                      {Object.keys(catgeoryData).length} categories
                    </span>
                  </div>
                  <button
                    className="q-btn-primary"
                    onClick={() => setShowModal(true)}
                  >
                    + Add Category
                  </button>
                </div>

                {Object.entries(catgeoryData).filter(
                  ([g, d]) => g.trim() && d.items.length > 0,
                ).length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>📦</div>
                    <p
                      style={{
                        color: THEME.textLight,
                        fontSize: 13,
                        margin: 0,
                      }}
                    >
                      No vendor categories yet.
                    </p>
                  </div>
                ) : (
                  Object.entries(catgeoryData)
                    .filter(([g, d]) => g.trim() && d.items.length > 0)
                    .map(([groupName, d]) => (
                      <VendorAccordion
                        key={groupName}
                        groupName={groupName}
                        data={d}
                        onEditCat={(id) => {
                          setCatgeoryId(id);
                          setShowVendorcatModal(true);
                        }}
                        onEditVendor={(id) => {
                          setCatgeoryId(id);
                          setShowVendorModal(true);
                        }}
                        onDeleteVendor={onRemoveVendor}
                        onAdd={(id) => {
                          setCatgeoryId(id);
                          setShowSpaceModal(true);
                        }}
                      />
                    ))
                )}
              </div>
            )}

            {/* ── CONTRACTORS ── */}
            {subActiveTab === "contactors" && (
              <div className="q-fade">
                <Contractor />
              </div>
            )}

            {/* ── MATERIAL ── */}
            {subActiveTab === "material" && (
              <div className="q-fade">
                <Material />
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
      <AddFeesModal
        show={showfeesModal}
        handleClose={() => setShowfeesModal(false)}
        id={params.id}
        onSuccess={fetchFees}
      />
      <UpdateFeesModal
        show={showupdateFeesModal}
        handleClose={() => setShowupdateFeesModal(false)}
        editId={catgeoryId}
        onSuccess={fetchFees}
      />
      <UpdateVendorCatgoryModal
        show={showVendorcatModal}
        handleClose={() => setShowVendorcatModal(false)}
        editId={catgeoryId}
        onSuccess={fetchData}
      />
      <UpdateVendorModal
        show={showVendorModal}
        handleClose={() => setShowVendorModal(false)}
        editId={catgeoryId}
        onSuccess={fetchData}
      />
      <AddVendorQuationModal
        show={showSpaceModal}
        handleClose={() => setShowSpaceModal(false)}
        id={catgeoryId}
        params={params.id}
        onSuccess={fetchData}
      />
      <AddVendorsModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        id={params.id}
        onSuccess={fetchData}
      />
    </>
  );
}

export default Quotation;
