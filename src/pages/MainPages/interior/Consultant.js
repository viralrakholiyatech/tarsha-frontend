// ─────────────────────────────────────────────
//  Consultants.jsx  —  Interior Consultants
//  Brand design — removes Bootstrap Tab/Nav
// ─────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import { useParams, useNavigate,Link } from "react-router-dom";
import { InteriorRoute } from "../../../config/RouteConfig";
import ApiService from "../../../services/ApiService";
import { getInteriorData } from "../../../config/config";
import { getToken } from "../../../services/useLocalStorage";
import { FileUrl } from "../../../config/file_url";
import ThreeD from "./ThreeD";
import Structure from "./Structure";
import Mepf from "./Mepf";
import axios from "axios";
import { getfileDatabyId } from "../../../config/config";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaMapLocationDot } from "react-icons/fa6";

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
  @keyframes icsFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .ics-fade { animation:icsFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }

  .ics-tabs { display:flex;gap:6px;flex-wrap:nowrap;overflow-x:auto;padding:0;margin:0;list-style:none;scrollbar-width:none; }
  .ics-tabs::-webkit-scrollbar { display:none; }
  .ics-tab { padding:8px 14px;border-radius:20px;cursor:pointer;white-space:nowrap;font-size:12px;font-weight:600;border:1.5px solid transparent;background:transparent;color:#595959;transition:all 0.18s;font-family:'DM Sans',sans-serif; }
  .ics-tab:hover  { background:${THEME.brandLight};color:${THEME.brand}; }
  .ics-tab.active { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand};font-weight:700; }

  .ics-sub-tabs { display:flex;gap:8px;flex-wrap:wrap; }
  .ics-sub-tab { padding:8px 18px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:600;border:1.5px solid ${THEME.border};background:#fff;color:#595959;transition:all 0.18s;font-family:'DM Sans',sans-serif; }
  .ics-sub-tab:hover  { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand}; }
  .ics-sub-tab.active { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand};font-weight:700; }

  .ics-avatar { width:34px;height:34px;border-radius:50%;object-fit:cover;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.12); }
  .ics-avatar-stack { display:flex;align-items:center; }
  .ics-avatar-stack .ics-avatar { margin-left:-8px; }
  .ics-avatar-stack .ics-avatar:first-child { margin-left:0; }

  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:${THEME.brandLight}; }
  ::-webkit-scrollbar-thumb { background:${THEME.brandMid};border-radius:10px; }
`;

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
  { key: "3d", label: "3D" },
  { key: "structure", label: "Structure" },
  { key: "mepf", label: "MEPF" },
];

function AvatarStack({ src, alt = "User" }) {
  if (!src)
    return (
      <img
        src={`${FileUrl}/img/profile.jpeg`}
        className="ics-avatar"
        style={{ marginLeft: 0 }}
        alt={alt}
      />
    );
  return (
    <div className="ics-avatar-stack">
      {src.split(",").map((p, i) => (
        <img
          key={i}
          className="ics-avatar"
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

const Consultants = () => {
  const params = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("consultants");
  const [subActiveTab, setSubActiveTab] = useState("3d");
  const [hodimage, setHodImage] = useState("");
  const [teamId, setTeamId] = useState("");
  const [caseId, setCaseId] = useState("");
  const [startDate, setstartDate] = useState("");
  const [endDate, setendDate] = useState("");
  const [data, setData] = useState({});
  const [filedata, setFiledata] = useState(null);

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
        const D = res.data.data?.find((item) => item.title === "Consultants");
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
    fetchArchData();
    fetchFileDataById()
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
          <ul className="ics-tabs">
            {STAGES.map((s) => (
              <li key={s.key}>
                <button
                  type="button"
                  className={`ics-tab${activeTab === s.key ? " active" : ""}`}
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

        {/* ── Consultants card ── */}
        <div
          style={{
            background: "#fff",
            border: `1px solid ${THEME.border}`,
            borderRadius: 14,
            // overflow: "hidden",
            boxShadow: "0 2px 10px rgba(136,117,73,0.06)",
          }}
        >
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
              Consultants
            </h2>
            <div className="ics-sub-tabs">
              {SUB_TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  className={`ics-sub-tab${subActiveTab === t.key ? " active" : ""}`}
                  onClick={() => setSubActiveTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ padding: 20 }}>
            {subActiveTab === "3d" && (
              <div className="ics-fade">
                <ThreeD />
              </div>
            )}
            {subActiveTab === "structure" && (
              <div className="ics-fade">
                <Structure />
              </div>
            )}
            {subActiveTab === "mepf" && (
              <div className="ics-fade">
                <Mepf />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Consultants;
