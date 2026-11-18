import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArchitectureRoute } from "../../../config/RouteConfig";
import ApiService from "../../../services/ApiService";
import { getToken } from "../../../services/useLocalStorage";
import { getArchData, getfileDatabyId } from "../../../config/config";
import { FileUrl } from "../../../config/file_url";
import axios from "axios";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaMapLocationDot } from "react-icons/fa6";
import ProjectSiteInspection from "../sitevisit/ProjectSiteInspection";

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
  @keyframes rmFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .rm-fade { animation:rmFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes rmSpin { to{transform:rotate(360deg)} }
  .rm-spinner { width:26px;height:26px;border-radius:50%;border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};animation:rmSpin 0.8s linear infinite; }

  /* ── Stage tabs ── */
  .rm-tabs { display:flex;gap:6px;flex-wrap:nowrap;overflow-x:auto;padding:0;margin:0;list-style:none;scrollbar-width:none; }
  .rm-tabs::-webkit-scrollbar { display:none; }
  .rm-tab { padding:8px 14px;border-radius:20px;cursor:pointer;white-space:nowrap;font-size:12px;font-weight:600;border:1.5px solid transparent;background:transparent;color:#595959;transition:all 0.18s;font-family:'DM Sans',sans-serif; }
  .rm-tab:hover  { background:${THEME.brandLight};color:${THEME.brand}; }
  .rm-tab.active { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand};font-weight:700; }

  /* ── Avatar ── */
  .rm-avatar { width:28px;height:28px;border-radius:50%;object-fit:cover;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.1); }
  .rm-avatar-stack { display:flex;align-items:center; }
  .rm-avatar-stack .rm-avatar { margin-left:-8px; }
  .rm-avatar-stack .rm-avatar:first-child { margin-left:0; }

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
function AvatarStack({ src, alt = "User" }) {
  if (!src)
    return (
      <img
        src={`${FileUrl}/img/profile.jpeg`}
        className="rm-avatar"
        style={{ marginLeft: 0 }}
        alt={alt}
      />
    );
  return (
    <div className="rm-avatar-stack">
      {src.split(",").map((p, i) => (
        <img
          key={i}
          className="rm-avatar"
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

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const ArchitectureSiteVisit = () => {
  const params = useParams();
  const navigate = useNavigate();

  const [documentdata, setDocumentData] = useState({});
  const [filedata, setFiledata] = useState(null);
  const [hodimage, setHodImage] = useState("");
  const [teamId, setTeamId] = useState("");
  const [caseId, setCaseId] = useState("");

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
        const D = res.data.data?.[0];
        if (D) {
          setDocumentData(D);
          setTeamId(D.assign_picture || "");
          setHodImage(D.hod_pictures || "");
          setCaseId(D.case_id || "");
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
    fetchArchData();
    fetchFileDataById();
  }, [params.id]);

  const handleAccordionClick = (id, label) => {
    const route = ROUTE_MAP[label];
    if (route) navigate(`/${route}/${id}`);
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

          {/* ── Tabs navigation ── */}
          <ul className="rm-tabs">
            {STAGES.map((s) => (
              <li key={s.key}>
                <button
                  className={`rm-tab${s.key === "sitevisit" ? " active" : ""}`}
                  onClick={() => {
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
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: THEME.text,
                  }}
                >
                  Lead Architect
                </span>
              </div>

              {teamId && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ position: "relative" }}>
                    <AvatarStack src={teamId} alt="Team" />
                    <span
                      style={{
                        position: "absolute",
                        bottom: -4,
                        right: -4,
                        padding: "1px 5px",
                        borderRadius: 20,
                        fontSize: 8,
                        fontWeight: 800,
                        background: THEME.brandDark,
                        color: "#fff",
                      }}
                    >
                      TEAM
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: THEME.text,
                    }}
                  >
                    Assigned Team
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Site Visit Content Container ── */}
        <div
          style={{
            background: "#fff",
            border: `1px solid ${THEME.border}`,
            borderRadius: 14,
            padding: "20px 24px",
            boxShadow: "0 2px 8px rgba(136,117,73,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 16,
              paddingBottom: 12,
              borderBottom: `1px solid ${THEME.border}`,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: THEME.brandLight,
                border: `1px solid #D4C4A0`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 17,
              }}
            >
              🏗️
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 15,
                  fontWeight: 700,
                  color: THEME.text,
                  fontFamily: "'Sora',sans-serif",
                }}
              >
                Project Site Visits
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  color: THEME.textMuted,
                }}
              >
                Showing site visits recorded exclusively for this project
              </p>
            </div>
          </div>

          <ProjectSiteInspection
            projectId={params.id}
            defaultDepartment="Architecture"
          />
        </div>
      </div>
    </>
  );
};

export default ArchitectureSiteVisit;
