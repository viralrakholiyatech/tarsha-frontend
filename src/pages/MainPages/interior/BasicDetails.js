import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { InteriorRoute } from "../../../config/RouteConfig";
import ApiService from "../../../services/ApiService";
import { getToken } from "../../../services/useLocalStorage";
import {
  fetchHod,
  addDetails,
  fetchbasicdetailsbyid,
  fetchquestionbyid,
  getInteriorData,
  updatebdstage,
} from "../../../config/config";
import toast from "react-hot-toast";
import { FileUrl } from "../../../config/file_url";
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
  text: "#1A1A2E",
  textMuted: "#ADADAD",
  textLight: "#BDBDBD",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing:border-box; }
  @keyframes ibdFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .ibd-fade { animation:ibdFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes ibdSpin { to{transform:rotate(360deg)} }
  .ibd-spinner { width:28px;height:28px;border-radius:50%;border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};animation:ibdSpin 0.8s linear infinite; }

  /* ── Stage tabs ── */
  .ibd-tabs { display:flex;gap:6px;flex-wrap:nowrap;overflow-x:auto;padding:0;margin:0;list-style:none;scrollbar-width:none; }
  .ibd-tabs::-webkit-scrollbar { display:none; }
  .ibd-tab { padding:8px 14px;border-radius:20px;cursor:pointer;white-space:nowrap;font-size:12px;font-weight:600;border:1.5px solid transparent;background:transparent;color:#595959;transition:all 0.18s;font-family:'DM Sans',sans-serif; }
  .ibd-tab:hover  { background:${THEME.brandLight};color:${THEME.brand}; }
  .ibd-tab.active { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand};font-weight:700; }

  /* ── Form inputs ── */
  .ibd-input, .ibd-textarea {
    width:100%;padding:9px 13px;border-radius:10px;border:1.5px solid #E0D5C5;
    font-size:13px;font-family:'DM Sans',sans-serif;color:#1A1A2E;
    outline:none;background:#fff;transition:border-color 0.15s,box-shadow 0.15s;
  }
  .ibd-input:focus, .ibd-textarea:focus { border-color:${THEME.brand};box-shadow:0 0 0 3px ${THEME.brand}18; }
  .ibd-input::placeholder,.ibd-textarea::placeholder { color:${THEME.textLight}; }
  .ibd-input[readonly], .ibd-textarea[readonly] { background:${THEME.bg};color:${THEME.textMuted};cursor:default; }
  .ibd-textarea { resize:vertical;min-height:80px; }

  /* ── Info box ── */
  .ibd-info-box { background:${THEME.bg};border:1px solid ${THEME.border};border-radius:10px;padding:12px 14px; }
  .ibd-info-label { font-size:10px;font-weight:700;color:${THEME.textMuted};text-transform:uppercase;letter-spacing:0.07em;margin-bottom:3px; }
  .ibd-info-value { font-size:14px;font-weight:700;color:${THEME.text};margin:0; }

  /* ── Avatar ── */
  .ibd-avatar { width:34px;height:34px;border-radius:50%;border:2px solid #fff;object-fit:cover;margin-left:-8px;box-shadow:0 1px 4px rgba(0,0,0,0.12); }
  .ibd-avatar:first-child { margin-left:0; }

  /* ── Buttons ── */
  .ibd-btn-primary { padding:10px 24px;border-radius:10px;border:none;background:${THEME.brand};color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:'Sora',sans-serif;transition:all 0.18s;box-shadow:0 2px 8px ${THEME.brand}44; }
  .ibd-btn-primary:hover:not(:disabled) { background:${THEME.brandDark}; }
  .ibd-btn-primary:disabled { background:#C4C4C4;box-shadow:none;cursor:not-allowed; }
  .ibd-btn-outline { padding:10px 24px;border-radius:10px;border:1.5px solid ${THEME.border};background:#fff;color:#595959;font-size:13px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.18s; }
  .ibd-btn-outline:hover { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand}; }

  /* ── Map link ── */
  .ibd-map-link { width:30px;height:30px;border-radius:8px;border:1.5px solid ${THEME.border};background:#fff;display:inline-flex;align-items:center;justify-content:center;text-decoration:none;transition:all 0.15s;font-size:14px; }
  .ibd-map-link:hover { background:${THEME.brandLight};border-color:${THEME.brand}; }

  ::-webkit-scrollbar { width:5px; }
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

function CardSection({ title, icon, children, right }) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${THEME.border}`,
        borderRadius: 14,
        padding: "20px 24px",
        marginBottom: 14,
        boxShadow: "0 2px 10px rgba(136,117,73,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 3,
              height: 16,
              borderRadius: 2,
              background: `linear-gradient(180deg,${THEME.brand},${THEME.brandMid})`,
            }}
          />
          <h2
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
            {icon && <span style={{ marginRight: 5 }}>{icon}</span>}
            {title}
          </h2>
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function FormGrid({ children }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 14,
      }}
    >
      {children}
    </div>
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
        className="ibd-avatar"
        style={{ marginLeft: 0 }}
        alt={alt}
      />
    );
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {src.split(",").map((p, i) => (
        <img
          key={i}
          className="ibd-avatar"
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
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
function BasicDetails() {
  const params = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("basic_details");
  const [questionData, setQuestionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hodimage, setHodImage] = useState("");
  const [teamId, setTeamId] = useState("");
  const [caseId, setCaseId] = useState("");
  const [startDate, setstartDate] = useState("");
  const [endDate, setendDate] = useState("");
  const [stageCompleted, setStageCompleted] = useState(false);
  const [data, setData] = useState({});
  const [filedata, setFiledata] = useState(null);
  const [details, setDetails] = useState({
    client_name: "",
    company_name: "",
    email: "",
    phone: "",
    work: "",
    requirement: "",
    report: "",
    project_detail: "",
    scopework: "",
    project_type: "",
  });

  const getdata = async () => {
    setLoading(true);
    try {
      const res = await ApiService(
        null,
        params.id,
        { Authorization: `Bearer ${getToken()}` },
        fetchbasicdetailsbyid.method,
        fetchbasicdetailsbyid.url,
      );
      if (!res.data.error) {
        const payload = res.data.data[0];
        setStageCompleted(payload.is_done);
        setDetails(payload);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestion = async () => {
    try {
      const res = await ApiService(
        null,
        params.id,
        { Authorization: `Bearer ${getToken()}` },
        fetchquestionbyid.method,
        fetchquestionbyid.url,
      );
      if (!res.data.error) setQuestionData(res.data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchInteriorData = async () => {
    try {
      const res = await ApiService(
        null,
        params.id,
        { Authorization: `Bearer ${getToken()}` },
        getInteriorData.method,
        getInteriorData.url,
      );
      if (!res.data.error) {
        const D = res.data.data?.find((item) => item.title === "Basic Details");
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
    fetchInteriorData();
    getdata();
    fetchQuestion();
    fetchFileDataById()
  }, [params.id]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setDetails((p) => ({ ...p, [name]: value }));
  };

  const handleAccordionClick = (id, label) => {
    const route = ROUTE_MAP[label];
    if (route) navigate(`/${route}/${id}`);
  };

  const handleCheckboxChange = async (id) => {
    const isChecked = !stageCompleted;
    setStageCompleted(isChecked);
    try {
      await ApiService(
        { stage_completed: isChecked ? 1 : 0, id },
        0,
        {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        updatebdstage.method,
        updatebdstage.url,
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const questionAnswers = questionData.flatMap((item) =>
        item.question.map((q) => ({
          id: q.id,
          name: q.name,
          answer: details[`question_${q.id}`] || "",
        })),
      );
      const payload = {
        ...details,
        editid: params.id,
        questions: questionAnswers,
      };
      const res = await ApiService(
        payload,
        0,
        {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        addDetails.method,
        addDetails.url,
      );
      if (res.status === 200 || res.status === 201)
        toast.success(res.data.message || "Saved successfully.");
      else toast.error(res.data.message || "Failed to save.");
    } catch (e) {
      console.error(e);
      toast.error("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: THEME.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div className="ibd-spinner" />
        <p style={{ color: THEME.textLight, fontSize: 13 }}>Loading…</p>
      </div>
    );
  }

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
          <ul className="ibd-tabs">
            {STAGES.map((s) => (
              <li key={s.key}>
                <button
                  type="button"
                  className={`ibd-tab${activeTab === s.key ? " active" : ""}`}
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

        {/* ── FORM ── */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Client Details */}
          <CardSection title="Client Details" icon="👤">
            <FormGrid>
              {[
                { name: "client_name", label: "Client Name" },
                { name: "company_name", label: "Company Name" },
                { name: "email", label: "Email ID" },
                { name: "phone", label: "Phone No." },
              ].map((f) => (
                <div key={f.name}>
                  <FieldLabel>{f.label}</FieldLabel>
                  <input
                    type="text"
                    name={f.name}
                    className="ibd-input"
                    value={details[f.name] || ""}
                    readOnly
                  />
                </div>
              ))}
            </FormGrid>
          </CardSection>

          {/* Project Details */}
          <CardSection title="Project Details" icon="📋">
            <FormGrid>
              <div>
                <FieldLabel>Project Type</FieldLabel>
                <input
                  type="text"
                  name="project_type"
                  className="ibd-input"
                  value={details.project_type || ""}
                  readOnly
                />
              </div>
              <div>
                <FieldLabel>Scope of Work</FieldLabel>
                <textarea
                  name="scopework"
                  className="ibd-textarea"
                  placeholder="Type here…"
                  value={details.scopework || ""}
                  onChange={handleInput}
                />
              </div>
              <div>
                <FieldLabel>Requirement</FieldLabel>
                <textarea
                  name="requirement"
                  className="ibd-textarea"
                  placeholder="Requirement"
                  value={details.requirement || ""}
                  onChange={handleInput}
                />
              </div>
              <div>
                <FieldLabel>Project Detail</FieldLabel>
                <textarea
                  name="project_detail"
                  className="ibd-textarea"
                  placeholder="Project Detail"
                  value={details.project_detail || ""}
                  onChange={handleInput}
                />
              </div>
            </FormGrid>
            <div
              style={{
                marginTop: 14,
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
                onChange={() => handleCheckboxChange(details.id)}
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
          </CardSection>

          {/* Property Information */}
          <CardSection
            title="Property Information"
            icon="🏘️"
            right={
              <div style={{ display: "flex", gap: 8 }}>
                <Link
                  className="ibd-map-link"
                  title="Google Maps"
                  to={`https://www.google.com/maps?q=${details?.lat},${details?.long}`}
                  target="_blank"
                >
                  📍
                </Link>
                <Link
                  className="ibd-map-link"
                  title="Google Location"
                  to={details?.google_location || "#"}
                  target="_blank"
                >
                  🗺️
                </Link>
              </div>
            }
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                gap: 10,
                marginBottom: 14,
              }}
            >
              {[
                { label: "City", value: details?.village },
                { label: "Project Type", value: details?.project_type },
                { label: "Category", value: details?.category },
              ].map((b) => (
                <div key={b.label} className="ibd-info-box">
                  <p className="ibd-info-label">{b.label}</p>
                  <p className="ibd-info-value">{b.value || "N/A"}</p>
                </div>
              ))}
            </div>

            {details?.address && (
              <div className="ibd-info-box" style={{ marginBottom: 14 }}>
                <p className="ibd-info-label">Address</p>
                <p
                  className="ibd-info-value"
                  style={{ fontWeight: 400, fontSize: 13 }}
                >
                  {details.address}
                </p>
              </div>
            )}

            {/* Dynamic questions */}
            {questionData.map((item) => (
              <div key={item.id} style={{ marginBottom: 14 }}>
                <p
                  style={{
                    margin: "0 0 10px",
                    fontSize: 13,
                    fontWeight: 700,
                    color: THEME.text,
                  }}
                >
                  {item.title}
                </p>
                {item.question.length > 0 ? (
                  <FormGrid>
                    {item.question.map((q) => (
                      <div key={q.id}>
                        <FieldLabel>{q.name}</FieldLabel>
                        <input
                          type="text"
                          className="ibd-input"
                          name={`question_${q.id}`}
                          value={details[`question_${q.id}`] || q.answer || ""}
                          onChange={handleInput}
                        />
                      </div>
                    ))}
                  </FormGrid>
                ) : (
                  <p style={{ color: THEME.textLight, fontSize: 12 }}>
                    No questions available
                  </p>
                )}
              </div>
            ))}

            {/* Actions */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 10,
              }}
            >
              <button
                type="button"
                className="ibd-btn-outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="ibd-btn-primary"
                disabled={submitting}
              >
                {submitting ? (
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
                        animation: "ibdSpin 0.7s linear infinite",
                      }}
                    />
                    Saving…
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </CardSection>
        </form>
      </div>
    </>
  );
}

export default BasicDetails;
