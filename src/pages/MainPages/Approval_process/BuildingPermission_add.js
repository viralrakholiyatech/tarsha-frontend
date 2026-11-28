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
  fetchActiveEmployee,
  inwardDetailsbyID,
  addupdateInwardDetails,
  getInwardDetails,
  deleteRoadDeposit,
  deleteScrunity,
  documentcbyID,
} from "../../../config/config";
import { ApprovalRoute } from "../../../config/RouteConfig";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import toast from "react-hot-toast";
import Approvalprocess from "./buildingcomponents/Approvalprocess";
import OutwardDetails from "./buildingcomponents/OutwardDetails";
import AllFees from "./buildingcomponents/AllFees";
import { GetDate } from "../../../services/DateAndTimeService";
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
  @keyframes bpSpin { to{transform:rotate(360deg)} }
  @keyframes bpFadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  .bp-fade { animation:bpFadeIn 0.25s cubic-bezier(0.4,0,0.2,1) both; }

  .bp-tabs { display:flex;gap:6px;flex-wrap:nowrap;overflow-x:auto;padding:0;margin:0;list-style:none;scrollbar-width:none; }
  .bp-tabs::-webkit-scrollbar { display:none; }
  .bp-tab { padding:8px 14px;border-radius:20px;cursor:pointer;white-space:nowrap;font-size:12px;font-weight:600;border:1.5px solid transparent;background:transparent;color:#595959;transition:all 0.18s;font-family:'DM Sans',sans-serif; }
  .bp-tab:hover  { background:${THEME.brandLight};color:${THEME.brand}; }
  .bp-tab.active { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand};font-weight:700; }

  .bp-sub-tabs { display:flex;gap:8px;flex-wrap:wrap; }
  .bp-sub-tab { padding:8px 18px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:600;border:1.5px solid ${THEME.border};background:#fff;color:#595959;transition:all 0.18s;font-family:'DM Sans',sans-serif; }
  .bp-sub-tab:hover  { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand}; }
  .bp-sub-tab.active { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand};font-weight:700; }

  .bp-input, .bp-select {
    width:100%;padding:9px 13px;border-radius:10px;border:1.5px solid #E0D5C5;
    font-size:13px;font-family:'DM Sans',sans-serif;color:#1A1A2E;
    outline:none;background:#fff;transition:border-color 0.15s,box-shadow 0.15s;
  }
  .bp-input:focus, .bp-select:focus { border-color:${THEME.brand};box-shadow:0 0 0 3px ${THEME.brand}18; }

  .bp-file-zone {
    border:2px dashed #D4C4A0;border-radius:10px;padding:10px 14px;background:#FDFAF5;
    font-size:12px;color:${THEME.textMuted};cursor:pointer;position:relative;transition:all 0.18s;
  }
  .bp-file-zone:hover { border-color:${THEME.brand};background:${THEME.brandLight}; }
  .bp-file-zone input[type=file] { position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%; }

  .bp-icon-btn { width:28px;height:28px;border-radius:7px;border:1.5px solid ${THEME.border};background:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all 0.15s;text-decoration:none;flex-shrink:0;margin-left:6px; }
  .bp-icon-btn:hover { background:${THEME.brandLight};border-color:${THEME.brand}; }
  .bp-del-btn { width:28px;height:28px;border-radius:7px;border:1.5px solid #FFA39E;background:#FFF1F0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all 0.15s;flex-shrink:0;margin-left:6px; }
  .bp-del-btn:hover { background:#CF1322;border-color:#CF1322; }
  .bp-del-btn:hover svg { stroke:#fff; }

  .bp-btn-primary { padding:10px 24px;border-radius:10px;border:none;background:${THEME.brand};color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:'Sora',sans-serif;transition:all 0.18s;box-shadow:0 2px 8px ${THEME.brand}44; }
  .bp-btn-primary:hover:not(:disabled) { background:${THEME.brandDark}; }
  .bp-btn-primary:disabled { background:#C4C4C4;box-shadow:none;cursor:not-allowed; }
  .bp-btn-outline { padding:10px 24px;border-radius:10px;border:1.5px solid ${THEME.border};background:#fff;color:#595959;font-size:13px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.18s; }
  .bp-btn-outline:hover { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand}; }

  .bp-avatar { width:32px;height:32px;border-radius:50%;object-fit:cover;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.1); }
  .bp-avatar-stack { display:flex;align-items:center; }
  .bp-avatar-stack .bp-avatar { margin-left:-8px; }
  .bp-avatar-stack .bp-avatar:first-child { margin-left:0; }

  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:${THEME.brandLight}; }
  ::-webkit-scrollbar-thumb { background:${THEME.brandMid};border-radius:10px; }
`;

const STAGE_TABS = [
  { key: "all_files", label: "All Files" },
  { key: "dc", label: "D.C." },
  { key: "pv", label: "P.V." },
  { key: "fire_noc", label: "Fire NOC" },
  { key: "e_nagar_portal", label: "E-Nagar Portal" },
  { key: "b_permission", label: "B. Permission" },
  { key: "site_visit", label: "Site Visit" },
];

const INNER_TABS = [
  { key: "inward", label: "Inward Details" },
  { key: "approval", label: "Approval Process" },
  { key: "all_fees", label: "All Fees" },
  { key: "outward", label: "Outward Details" },
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

function AvatarStack({ src }) {
  if (!src || !src.length) return null;
  return (
    <div className="bp-avatar-stack">
      {src.split(",").map((p, i) => (
        <img
          key={i}
          className="bp-avatar"
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

function FileField({ label, name, onChange, existingFile, onDelete }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="bp-file-zone">
        <input type="file" name={name} onChange={onChange} />
        <span>📎 {existingFile ? "Replace file…" : "Click to upload…"}</span>
      </div>
      {existingFile && typeof existingFile === "string" && (
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
            className="bp-icon-btn"
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
            className="bp-del-btn"
            title="Delete"
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
function BuildingPermission_add() {
  const params = useParams();
  const navigate = useNavigate();
  const header = {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };

  const [caseId, setCaseId] = useState("");
  const [startDate, setstartDate] = useState("");
  const [endDate, setendDate] = useState("");
  const [activeTab, setActiveTab] = useState("inward");
  const [subactiveTab, setSubActiveTab] = useState("b_permission");
  const [teamId, setTeamId] = useState("");
  const [loading, setLoading] = useState(false);
  const [applicationInward, setApplicationInward] = useState("");
  const [scrunityfees, setScrunityFees] = useState("");
  const [roadDeposit, setRoadDeposit] = useState("");
  const [scrunityCleared, setScrunityCleared] = useState(false);
  const [roadDepositCleared, setRoadDepositCleared] = useState(false);
  const [dataId, setDataId] = useState("");
  const [hod, setHod] = useState("");
  const [filedata, setFiledata] = useState(null);

  const fetchInwardData = async () => {
    setLoading(true);
    try {
      const res = await ApiService(
        null,
        params.id,
        header,
        inwardDetailsbyID.method,
        inwardDetailsbyID.url,
      );
      if (!res.data.error) {
        const D = res.data.data[0];
        setDataId(D.id);
        setApplicationInward(D.application_inward);
        setScrunityFees(D.scruityfees || "");
        setRoadDeposit(D.roaddeposit || "");
        setScrunityCleared(false);
        setRoadDepositCleared(false);
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
        const D = res.data.data?.find((item) => item.title === "B.Permission");
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
    fetchInwardData();
    fetchData();
    fetchFileDataById();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      id: dataId,
      approval_id: params.id,
      application_inward: applicationInward,
      scrunityfees: scrunityfees || "",
      roaddeposit: roadDeposit || "",
      scrunityfees_cleared: scrunityCleared ? "true" : "false",
      roaddeposit_cleared: roadDepositCleared ? "true" : "false",
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
        addupdateInwardDetails.method,
        addupdateInwardDetails.url,
      );
      if (!res.data.error) {
        toast.success("Inward details submitted successfully");
        fetchInwardData();
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
        {/* ── Stage tab card ── */}
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
          {/* Case ID */}
          <div style={{ marginBottom: 14 }}>
            <p
              style={{
                margin: "0 0 2px",
                fontSize: 11,
                fontWeight: 700,
                color: THEME.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
              }}
            >
              TP Case No
            </p>
            <h1
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 800,
                color: THEME.text,
                fontFamily: "'Sora',sans-serif",
              }}
            >
              {caseId || "—"}
            </h1>
          </div>

          {/* File data tiles */}
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
          <ul className="bp-tabs">
            {STAGE_TABS.map((t) => (
              <li key={t.key}>
                <button
                  type="button"
                  className={`bp-tab${subactiveTab === t.key ? " active" : ""}`}
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

        {/* ── Main card with inner tabs ── */}
        <div
          style={{
            background: "#fff",
            border: `1px solid ${THEME.border}`,
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 2px 10px rgba(136,117,73,0.06)",
          }}
        >
          {/* Inner sub-tab header */}
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
              Building Permission
            </h2>
            <div className="bp-sub-tabs">
              {INNER_TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  className={`bp-sub-tab${activeTab === t.key ? " active" : ""}`}
                  onClick={() => setActiveTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── INWARD DETAILS ── */}
          {activeTab === "inward" && (
            <div className="bp-fade" style={{ padding: 20 }}>
              {/* Team / date row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 16,
                  justifyContent: "space-between",
                  marginBottom: 20,
                  paddingBottom: 16,
                  borderBottom: `1px solid ${THEME.border}`,
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

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
                    gap: 16,
                    marginBottom: 20,
                  }}
                >
                  {/* Application Inward */}
                  <div>
                    <FieldLabel>Application Inward</FieldLabel>
                    <select
                      className="bp-select"
                      value={applicationInward}
                      onChange={(e) => setApplicationInward(e.target.value)}
                    >
                      <option value="">— Select —</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>

                  {/* Scrutiny Fees */}
                  <S3FileUpload
                    label="Scrutiny Fees"
                    folder="approval/building/inward"
                    value={scrunityfees}
                    onChange={(url) => {
                      setScrunityFees(url);
                      setScrunityCleared(false);
                    }}
                    onRemove={() => {
                      if (dataId && scrunityfees) {
                        swalDelete(params.id, deleteScrunity, () => {
                          setScrunityFees("");
                          setScrunityCleared(true);
                        });
                      } else {
                        setScrunityFees("");
                        setScrunityCleared(true);
                      }
                    }}
                  />

                  {/* Road Deposit */}
                  <S3FileUpload
                    label="Road Deposit"
                    folder="approval/building/inward"
                    value={roadDeposit}
                    onChange={(url) => {
                      setRoadDeposit(url);
                      setRoadDepositCleared(false);
                    }}
                    onRemove={() => {
                      if (dataId && roadDeposit) {
                        swalDelete(params.id, deleteRoadDeposit, () => {
                          setRoadDeposit("");
                          setRoadDepositCleared(true);
                        });
                      } else {
                        setRoadDeposit("");
                        setRoadDepositCleared(true);
                      }
                    }}
                  />
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
                    className="bp-btn-outline"
                    onClick={() => navigate(`/${ApprovalRoute.approval_list}`)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bp-btn-primary"
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
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            border: "2px solid #ffffff88",
                            borderTopColor: "#fff",
                            display: "inline-block",
                            animation: "bpSpin 0.7s linear infinite",
                          }}
                        />
                        Saving…
                      </span>
                    ) : (
                      "Submit"
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── APPROVAL PROCESS ── */}
          {activeTab === "approval" && (
            <div className="bp-fade" style={{ padding: 20 }}>
              <Approvalprocess />
            </div>
          )}

          {/* ── ALL FEES ── */}
          {activeTab === "all_fees" && (
            <div className="bp-fade" style={{ padding: 20 }}>
              <AllFees />
            </div>
          )}

          {/* ── OUTWARD DETAILS ── */}
          {activeTab === "outward" && (
            <div className="bp-fade" style={{ padding: 20 }}>
              <OutwardDetails />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default BuildingPermission_add;
