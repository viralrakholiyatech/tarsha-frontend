import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiService from "../../../services/ApiService";
import { getToken } from "../../../services/useLocalStorage";
import {
  deleteInputDrawing,
  fetchActiveEmployee,
  EnagarinputbyID,
  addupdateenagarinput,
  addupdateenagaroutput,
  EnagaroutputbyID,
  deletepermissionletter,
  deletesmcDrawing,
  deleteEngarDetails,
  deleteEngarDrawing,
  documentcbyID,
} from "../../../config/config";
import toast from "react-hot-toast";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import { GetDate } from "../../../services/DateAndTimeService";
import { ApprovalRoute } from "../../../config/RouteConfig";
import { FileUrl } from "../../../config/file_url";
import axios from "axios";
import { getfileDatabyId } from "../../../config/config";
import { Link } from "react-router-dom";
import S3FileUpload from "../../../components/S3FileUpload";
import { openFileInNewTab, uploadFileToS3 } from "../../../services/S3Service";
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
  @keyframes enSpin { to{transform:rotate(360deg)} }

  .en-tabs { display:flex;gap:6px;flex-wrap:nowrap;overflow-x:auto;padding:0;margin:0;list-style:none;scrollbar-width:none; }
  .en-tabs::-webkit-scrollbar { display:none; }
  .en-tab { padding:8px 14px;border-radius:20px;cursor:pointer;white-space:nowrap;font-size:12px;font-weight:600;border:1.5px solid transparent;background:transparent;color:#595959;transition:all 0.18s;font-family:'DM Sans',sans-serif; }
  .en-tab:hover  { background:${THEME.brandLight};color:${THEME.brand}; }
  .en-tab.active { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand};font-weight:700; }

  .en-sub-tabs { display:flex;gap:8px;flex-wrap:wrap; }
  .en-sub-tab { padding:8px 18px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:600;border:1.5px solid ${THEME.border};background:#fff;color:#595959;transition:all 0.18s;font-family:'DM Sans',sans-serif; }
  .en-sub-tab:hover  { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand}; }
  .en-sub-tab.active { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand};font-weight:700; }

  .en-input, .en-select {
    width:100%;padding:9px 13px;border-radius:10px;border:1.5px solid #E0D5C5;
    font-size:13px;font-family:'DM Sans',sans-serif;color:#1A1A2E;
    outline:none;background:#fff;transition:border-color 0.15s,box-shadow 0.15s;
  }
  .en-input:focus, .en-select:focus { border-color:${THEME.brand};box-shadow:0 0 0 3px ${THEME.brand}18; }
  .en-input::placeholder { color:${THEME.textLight}; }
  .en-input[type=password] { letter-spacing:2px; }

  .en-file-zone {
    border:2px dashed #D4C4A0;border-radius:10px;padding:9px 12px;background:#FDFAF5;
    font-size:12px;color:${THEME.textMuted};cursor:pointer;position:relative;transition:all 0.18s;
  }
  .en-file-zone:hover { border-color:${THEME.brand};background:${THEME.brandLight}; }
  .en-file-zone input[type=file] { position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%; }

  /* ── Dynamic table ── */
  .en-table { width:100%;border-collapse:collapse;font-size:13px;font-family:'DM Sans',sans-serif; }
  .en-table th { padding:9px 12px;font-size:10px;font-weight:700;color:${THEME.brandDark};text-transform:uppercase;letter-spacing:0.07em;background:${THEME.brandLight};border-bottom:2px solid #D4C4A0;white-space:nowrap; }
  .en-table td { padding:9px 10px;border-bottom:1px solid ${THEME.border};vertical-align:middle; }
  .en-table tbody tr:nth-child(even) { background:${THEME.rowAlt}; }
  .en-table tbody tr:hover { background:${THEME.rowHover}; }

  /* ── Icon/action buttons ── */
  .en-icon-btn { width:28px;height:28px;border-radius:7px;border:1.5px solid ${THEME.border};background:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all 0.15s;text-decoration:none;flex-shrink:0;margin-left:5px; }
  .en-icon-btn:hover { background:${THEME.brandLight};border-color:${THEME.brand}; }
  .en-del-btn { width:28px;height:28px;border-radius:7px;border:1.5px solid #FFA39E;background:#FFF1F0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all 0.15s;flex-shrink:0;margin-left:5px; }
  .en-del-btn:hover { background:#CF1322;border-color:#CF1322; }
  .en-del-btn:hover svg { stroke:#fff; }

  .en-btn-primary { padding:10px 22px;border-radius:10px;border:none;background:${THEME.brand};color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:'Sora',sans-serif;transition:all 0.18s;box-shadow:0 2px 8px ${THEME.brand}44; }
  .en-btn-primary:hover:not(:disabled) { background:${THEME.brandDark}; }
  .en-btn-primary:disabled { background:#C4C4C4;box-shadow:none;cursor:not-allowed; }
  .en-btn-outline { padding:10px 22px;border-radius:10px;border:1.5px solid ${THEME.border};background:#fff;color:#595959;font-size:12px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.18s; }
  .en-btn-outline:hover { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand}; }
  .en-btn-add { padding:6px 14px;border-radius:8px;border:1.5px solid ${THEME.brand};background:${THEME.brandLight};color:${THEME.brand};font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s; }
  .en-btn-add:hover { background:${THEME.brand};color:#fff; }

  /* ── Avatar ── */
  .en-avatar { width:32px;height:32px;border-radius:50%;object-fit:cover;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.1); }
  .en-avatar-stack { display:flex;align-items:center; }
  .en-avatar-stack .en-avatar { margin-left:-8px; }
  .en-avatar-stack .en-avatar:first-child { margin-left:0; }

  .en-divider { border:none;border-top:1px solid ${THEME.border};margin:18px 0; }

  ::-webkit-scrollbar { width:5px;height:5px; }
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

function SectionTitle({ children }) {
  return (
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
        {children}
      </h3>
    </div>
  );
}

function AvatarStack({ src }) {
  if (!src || !src.length) return null;
  return (
    <div className="en-avatar-stack">
      {src.split(",").map((p, i) => (
        <img
          key={i}
          className="en-avatar"
          src={`${FileUrl}/${p}`}
          alt="User"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `${FileUrl}/img/profile.jpeg`;
          }}
        />
      ))}
    </div>
  );
}

function FileAttachment({ value, onView, onDelete }) {
  if (!value || typeof value !== "string") return null;
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}
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
        onClick={() => openFileInNewTab(value, FileUrl)}
        className="en-icon-btn"
        title="View"
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
        className="en-del-btn"
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
  );
}


// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const E_nagar_portalAdd = () => {
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
  const [activeTab, setActiveTab] = useState("input");
  const [subactiveTab, setSubActiveTab] = useState("e_nagar_portal");
  const [loading, setLoading] = useState(false);
  const [teamId, setTeamId] = useState("");
  const [hod, setHod] = useState("");
  const [architectureName, setArchitectureName] = useState("");
  const [developerName, setDeveloperName] = useState("");
  const [applicationUploaddate, setApplicationUploaddate] = useState("");
  const [applicationNumber, setApplicationNumber] = useState("");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [smcAssignApplication, setSmcAssignApplication] = useState("");
  const [smcPrdecrDrawing, setsmcPrdecrDrawing] = useState(null);
  const [permissionLetter, setPermissionLetter] = useState(null);
  const [smcDrawingCleared, setSmcDrawingCleared] = useState(false);
  const [permLetterCleared, setPermLetterCleared] = useState(false);
  const [detailId, setDetailId] = useState("");
  const [filedata, setFiledata] = useState(null);
  const [dynamicFields, setDynamicFields] = useState([
    { upload_date: "", predcr_drawing: "", query: "" },
  ]);
  const [smcFields, setSmcFields] = useState([
    { statusdate: "", applicationstatus: "" },
  ]);

  // ── Fetchers ──────────────────────────────
  const fetchinputData = async () => {
    setLoading(true);
    try {
      const res = await ApiService(
        null,
        params.id,
        header,
        EnagarinputbyID.method,
        EnagarinputbyID.url,
      );
      if (!res.data.error) {
        const D = res.data.data;
        setDataId(D?.id || "");
        setArchitectureName(D?.architecturename || "");
        setDeveloperName(D?.developername || "");
        setApplicationUploaddate(
          GetDate(D?.application_upload_date, "YYYY-MM-DD"),
        );
        setApplicationNumber(D?.applicationnumber || "");
        setLoginId(D?.loginId || "");
        setPassword(D?.password || "");
        if (D?.drawings)
          setDynamicFields(
            D.drawings.map((d) => ({
              drawing_id: d.drawing_id || "",
              upload_date: GetDate(d.upload_date, "YYYY-MM-DD"),
              predcr_drawing: d.predcr_drawing || "",
              query: d.query || "",
            })),
          );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchoutputData = async () => {
    setLoading(true);
    try {
      const res = await ApiService(
        null,
        params.id,
        header,
        EnagaroutputbyID.method,
        EnagaroutputbyID.url,
      );
      if (!res.data.error) {
        const D = res.data.data;
        setSmcAssignApplication(D?.smcassign_application || "");
        setDetailId(D?.id);
        setsmcPrdecrDrawing(D?.smc_checker_predcrdrawing || "");
        setPermissionLetter(D?.permissionletter || "");
        if (D?.details)
          setSmcFields(
            D.details.map((d) => ({
              details_id: d.details_id || "",
              statusdate: GetDate(d.status_date, "YYYY-MM-DD"),
              applicationstatus: d.applicationstatus || "",
            })),
          );
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
        const D = res.data.data?.find(
          (item) => item.title === "E-Nagar Portal",
        );
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
  } catch (e) { console.error(e); }
};

  useEffect(() => {
    fetchinputData();
    fetchData();
    fetchoutputData();
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

  // ── Dynamic drawing rows ──────────────────
  const handleDynamicChange = async (index, e) => {
    const { name, value, type, files } = e.target;
    if (type === "file" && files && files[0]) {
      const file = files[0];
      const toastId = toast.loading("Uploading drawing to S3...");
      try {
        const { fileUrl } = await uploadFileToS3(file, null, "approval/enagar/input");
        setDynamicFields((prev) => {
          const upd = [...prev];
          upd[index] = { ...upd[index], [name]: fileUrl };
          return upd;
        });
        toast.success("Drawing uploaded to S3!", { id: toastId });
      } catch (err) {
        toast.error("Failed to upload to S3", { id: toastId });
      }
      return;
    }
    setDynamicFields((prev) => {
      const upd = [...prev];
      upd[index] = {
        ...upd[index],
        [name]: value,
      };
      return upd;
    });
  };

  const removeField = (index, id) => {
    SwalAlert({}).then(async (r) => {
      if (!r.isConfirmed) return;
      setLoading(true);
      try {
        if (id)
          await ApiService(
            null,
            id,
            header,
            deleteEngarDrawing.method,
            deleteEngarDrawing.url,
          );
        setDynamicFields((prev) => prev.filter((_, i) => i !== index));
        toast.success("Drawing removed");
      } catch (e) {
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    });
  };

  // ── SMC rows ──────────────────────────────
  const handleSmcChange = (index, e) => {
    const { name, value } = e.target;
    setSmcFields((prev) => {
      const upd = [...prev];
      upd[index] = { ...upd[index], [name]: value };
      return upd;
    });
  };

  const removeSmcField = (index, id) => {
    SwalAlert({}).then(async (r) => {
      if (!r.isConfirmed) return;
      setLoading(true);
      try {
        if (id)
          await ApiService(
            null,
            id,
            header,
            deleteEngarDetails.method,
            deleteEngarDetails.url,
          );
        setSmcFields((prev) => prev.filter((_, i) => i !== index));
        toast.success("Row removed");
        fetchoutputData();
      } catch (e) {
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    });
  };

  // ── Submit handlers ───────────────────────
  const handleSubmitInput = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("id", dataId);
    formData.append("approval_id", params.id);
    formData.append("architectureName", architectureName);
    formData.append("developerName", developerName);
    formData.append("applicationUploaddate", applicationUploaddate);
    formData.append("applicationNumber", applicationNumber);
    formData.append("loginId", loginId);
    formData.append("password", password);
    dynamicFields.forEach((field, index) => {
      formData.append(
        `dynamicFields[${index}][upload_date]`,
        field.upload_date,
      );
      formData.append(`dynamicFields[${index}][query]`, field.query);
      formData.append(
        `dynamicFields[${index}][drawing_id]`,
        field.drawing_id || "",
      );
      if (field.predcr_drawing)
        formData.append(
          `dynamicFields[${index}][predcr_drawing]`,
          field.predcr_drawing,
        );
    });
    setLoading(true);
    try {
      const res = await ApiService(
        formData,
        0,
        {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "multipart/form-data",
        },
        addupdateenagarinput.method,
        addupdateenagarinput.url,
      );
      if (!res.data.error) {
        toast.success("Input data submitted!");
        fetchinputData();
      } else toast.error("Failed to submit");
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOutput = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("id", detailId);
    formData.append("approval_id", params.id);
    formData.append("smc_assign_application", smcAssignApplication);
    if (smcPrdecrDrawing) {
      formData.append("smc_predcr_drawing", smcPrdecrDrawing);
    } else if (smcDrawingCleared) {
      formData.append("smc_predcr_drawing_cleared", "true");
    }

    if (permissionLetter) {
      formData.append("perimissionletter", permissionLetter);
    } else if (permLetterCleared) {
      formData.append("perimissionletter_cleared", "true");
    }
    smcFields.forEach((field, index) => {
      formData.append(
        `smcFields[${index}][details_id]`,
        field.details_id || "",
      );
      formData.append(`smcFields[${index}][statusdate]`, field.statusdate);
      formData.append(
        `smcFields[${index}][applicationstatus]`,
        field.applicationstatus,
      );
    });
    try {
      const res = await ApiService(
        formData,
        0,
        {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "multipart/form-data",
        },
        addupdateenagaroutput.method,
        addupdateenagaroutput.url,
      );
      if (!res.data.error) {
        toast.success("Output data submitted!");
        fetchoutputData();
      } else toast.error("Failed to submit");
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  // ── Delete file handlers ──────────────────
  const swalDelete = (id, api, refetch) => {
    SwalAlert({}).then(async (r) => {
      if (!r.isConfirmed) return;
      setLoading(true);
      try {
        const res = await ApiService(null, id, header, api.method, api.url);
        if (!res.data.error) {
          toast.success(res.data.message);
          refetch();
        } else toast.error(res.data.message);
      } catch (e) {
        toast.error("Something went wrong");
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
          <ul className="en-tabs">
            {STAGE_TABS.map((t) => (
              <li key={t.key}>
                <button
                  type="button"
                  className={`en-tab${subactiveTab === t.key ? " active" : ""}`}
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

        {/* ── E-Nagar Portal card ── */}
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
              E-Nagar Portal
            </h2>
            <div className="en-sub-tabs">
              {[
                { key: "input", label: "Input Details" },
                { key: "output", label: "Output Details" },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  className={`en-sub-tab${activeTab === t.key ? " active" : ""}`}
                  onClick={() => setActiveTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: 20 }}>
            {/* ── INPUT TAB ── */}
            {activeTab === "input" && (
              <form onSubmit={handleSubmitInput} noValidate>
                {/* Professional */}
                <SectionTitle>Professional</SectionTitle>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <FieldLabel>Architecture Name</FieldLabel>
                    <input
                      className="en-input"
                      placeholder="Type here…"
                      value={architectureName}
                      onChange={(e) => setArchitectureName(e.target.value)}
                    />
                  </div>
                  <div>
                    <FieldLabel>Developer Name</FieldLabel>
                    <input
                      className="en-input"
                      placeholder="Type here…"
                      value={developerName}
                      onChange={(e) => setDeveloperName(e.target.value)}
                    />
                  </div>
                </div>
                <hr className="en-divider" />

                {/* Application Details */}
                <SectionTitle>Application Details</SectionTitle>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
                    gap: 14,
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <FieldLabel>Upload Date</FieldLabel>
                    <input
                      type="date"
                      className="en-input"
                      value={applicationUploaddate}
                      onChange={(e) => setApplicationUploaddate(e.target.value)}
                    />
                  </div>
                  <div>
                    <FieldLabel>Application Number</FieldLabel>
                    <input
                      className="en-input"
                      placeholder="Type here…"
                      value={applicationNumber}
                      onChange={(e) => setApplicationNumber(e.target.value)}
                    />
                  </div>
                  <div>
                    <FieldLabel>Login ID</FieldLabel>
                    <input
                      className="en-input"
                      placeholder="Type here…"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                    />
                  </div>
                  <div>
                    <FieldLabel>Password</FieldLabel>
                    <input
                      type="password"
                      className="en-input"
                      placeholder="Type here…"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <hr className="en-divider" />

                {/* Predcr Drawing table */}
                <SectionTitle>Predcr Drawing</SectionTitle>
                <div style={{ overflowX: "auto", marginBottom: 10 }}>
                  <table className="en-table">
                    <thead>
                      <tr>
                        <th>Upload Date</th>
                        <th>Predcr Drawing</th>
                        <th>Query</th>
                        <th style={{ width: 36 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {dynamicFields.map((field, index) => (
                        <tr key={index}>
                          <td>
                            <input
                              type="date"
                              name="upload_date"
                              className="en-input"
                              style={{ minWidth: 140 }}
                              value={field.upload_date}
                              onChange={(e) => handleDynamicChange(index, e)}
                            />
                          </td>
                          <td>
                            <div
                              className="en-file-zone"
                              style={{ minWidth: 160 }}
                            >
                              <input
                                type="file"
                                name="predcr_drawing"
                                onChange={(e) => handleDynamicChange(index, e)}
                              />
                              <span>
                                📎{" "}
                                {field.predcr_drawing &&
                                typeof field.predcr_drawing === "string"
                                  ? "Replace…"
                                  : "Upload…"}
                              </span>
                            </div>
                            {field.predcr_drawing &&
                              typeof field.predcr_drawing === "string" && (
                                <div
                                  style={{
                                    display: "flex",
                                    gap: 4,
                                    marginTop: 4,
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openFileInNewTab(
                                        field.predcr_drawing,
                                        FileUrl,
                                      )
                                    }
                                    className="en-icon-btn"
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
                                    className="en-del-btn"
                                    title="Delete"
                                    onClick={() =>
                                      swalDelete(
                                        field.drawing_id,
                                        deleteInputDrawing,
                                        fetchinputData,
                                      )
                                    }
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
                          <td>
                            <input
                              name="query"
                              className="en-input"
                              style={{ minWidth: 140 }}
                              value={field.query}
                              onChange={(e) => handleDynamicChange(index, e)}
                            />
                          </td>
                          <td>
                            {index !== 0 && (
                              <button
                                type="button"
                                className="en-del-btn"
                                title="Remove row"
                                onClick={() =>
                                  removeField(index, field.drawing_id)
                                }
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
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginBottom: 16,
                  }}
                >
                  <button
                    type="button"
                    className="en-btn-add"
                    onClick={() =>
                      setDynamicFields((p) => [
                        ...p,
                        { upload_date: "", predcr_drawing: "", query: "" },
                      ])
                    }
                  >
                    + Add Row
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 10,
                  }}
                >
                  <button
                    type="button"
                    className="en-btn-outline"
                    onClick={() => navigate(`/${ApprovalRoute.approval_list}`)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="en-btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span
                          style={{
                            width: 13,
                            height: 13,
                            borderRadius: "50%",
                            border: "2px solid #ffffff88",
                            borderTopColor: "#fff",
                            display: "inline-block",
                            animation: "enSpin 0.7s linear infinite",
                          }}
                        />
                        Saving…
                      </span>
                    ) : (
                      "Submit Input"
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* ── OUTPUT TAB ── */}
            {activeTab === "output" && (
              <form onSubmit={handleSubmitOutput} noValidate>
                {/* Top 3 fields */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
                    gap: 16,
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <FieldLabel>SMC Assign of Application</FieldLabel>
                    <input
                      className="en-input"
                      placeholder="Type here…"
                      value={smcAssignApplication}
                      onChange={(e) => setSmcAssignApplication(e.target.value)}
                    />
                  </div>
                  <div>
                    <FieldLabel>SMC Check Predcr Drawing</FieldLabel>
                    <S3FileUpload
                      folder="approval/enagar/output"
                      value={smcPrdecrDrawing}
                      onChange={(url) => {
                        setsmcPrdecrDrawing(url);
                        setSmcDrawingCleared(false);
                      }}
                      onRemove={() => {
                        setsmcPrdecrDrawing(null);
                        setSmcDrawingCleared(true);
                        swalDelete(detailId, deletesmcDrawing, fetchoutputData);
                      }}
                    />
                  </div>
                  <div>
                    <FieldLabel>Permission Letter</FieldLabel>
                    <S3FileUpload
                      folder="approval/enagar/output"
                      value={permissionLetter}
                      onChange={(url) => {
                        setPermissionLetter(url);
                        setPermLetterCleared(false);
                      }}
                      onRemove={() => {
                        setPermissionLetter(null);
                        setPermLetterCleared(true);
                        swalDelete(
                          detailId,
                          deletepermissionletter,
                          fetchoutputData,
                        );
                      }}
                    />
                  </div>
                </div>
                <hr className="en-divider" />

                {/* SMC Approval Details table */}
                <SectionTitle>SMC Application Approval Details</SectionTitle>
                <div style={{ overflowX: "auto", marginBottom: 10 }}>
                  <table className="en-table">
                    <thead>
                      <tr>
                        <th>Status Date</th>
                        <th>Application Status</th>
                        <th style={{ width: 36 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {smcFields.map((field, index) => (
                        <tr key={index}>
                          <td>
                            <input
                              type="date"
                              name="statusdate"
                              className="en-input"
                              style={{ minWidth: 150 }}
                              value={field.statusdate}
                              onChange={(e) => handleSmcChange(index, e)}
                            />
                          </td>
                          <td>
                            <select
                              name="applicationstatus"
                              className="en-select"
                              style={{ minWidth: 150 }}
                              value={field.applicationstatus}
                              onChange={(e) => handleSmcChange(index, e)}
                            >
                              <option value="">— Select —</option>
                              <option value="approved">Approved</option>
                              <option value="reject">Reject</option>
                            </select>
                          </td>
                          <td>
                            {index !== 0 && (
                              <button
                                type="button"
                                className="en-del-btn"
                                title="Remove row"
                                onClick={() =>
                                  removeSmcField(index, field.details_id)
                                }
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
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginBottom: 16,
                  }}
                >
                  <button
                    type="button"
                    className="en-btn-add"
                    onClick={() =>
                      setSmcFields((p) => [
                        ...p,
                        { statusdate: "", applicationstatus: "" },
                      ])
                    }
                  >
                    + Add Row
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 10,
                  }}
                >
                  <button
                    type="button"
                    className="en-btn-outline"
                    onClick={() => navigate(`/${ApprovalRoute.approval_list}`)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="en-btn-primary">
                    Submit Output
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default E_nagar_portalAdd;
