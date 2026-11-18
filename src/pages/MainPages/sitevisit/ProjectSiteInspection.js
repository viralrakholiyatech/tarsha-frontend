import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import ApiService from "../../../services/ApiService";
import { getToken, isAdmin } from "../../../services/useLocalStorage";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import toast from "react-hot-toast";
import Select from "react-select";
import { FileUrl } from "../../../config/file_url";
import { format, parse } from "date-fns";
import axios from "axios";
import S3FileUpload from "../../../components/S3FileUpload";
import { getFileDisplayUrl, openFileInNewTab } from "../../../services/S3Service";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaMapLocationDot } from "react-icons/fa6";
import {
  getsites,
  getsitesbyid,
  addsites,
  updatesites,
  deletesites,
  getchecklist,
  fetchActiveEmployee,
  getfileDatabyId,
  getDepartment,
} from "../../../config/config";

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
  error: "#CF1322",
  errorBg: "#FFF1F0",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fade-in { animation: fadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner {
    width: 26px; height: 26px; border-radius: 50%;
    border: 3px solid ${THEME.brandLight}; border-top-color: ${THEME.brand};
    animation: spin 0.8s linear infinite;
  }

  .si-input {
    width: 100%;
    padding: 9px 12px;
    border-radius: 10px;
    border: 1.5px solid #E0D5C5;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    color: #434343;
    background: #fff;
    outline: none;
    transition: border-color 0.18s, box-shadow 0.18s;
    appearance: auto;
  }
  .si-input:focus {
    border-color: ${THEME.brand};
    box-shadow: 0 0 0 3px ${THEME.brand}22;
  }
  .si-input::placeholder { color: ${THEME.textLight}; }
  .si-radio { accent-color: ${THEME.brand}; width: 15px; height: 15px; cursor: pointer; }
  .si-input[type="file"] { padding: 7px 12px; cursor: pointer; }

  @media print { .no-print { display: none !important; } }
`;

// ─────────────────────────────────────────────
//  COLUMNS
// ─────────────────────────────────────────────
const COLUMNS = [
  { label: "#", key: "__index", center: true },
  { label: "Date", key: "created_at" },
  { label: "Department", key: "department", badge: "gold" },
  { label: "File", key: "case_id", bold: true },
  { label: "Client", key: "client_name" },
  { label: "Inspected By", key: "inspectedby" },
  { label: "Site Incharge", key: "site_incharge" },
  { label: "Category", key: "visit_category", badge: "blue" },
  { label: "Work", key: "visit_work", truncate: true, width: 160 },
  { label: "Client Sign", key: "client_sign", noPrint: true, type: "sign" },
  { label: "Action", key: "__action", noPrint: true, center: true },
];

const BADGE = {
  gold: { bg: THEME.brandLight, color: THEME.brand, border: "#D4C4A0" },
  blue: { bg: "#F0F5FF", color: "#2F54EB", border: "#ADC6FF" },
};

function Badge({ text, type = "gold" }) {
  if (!text) return <span style={{ color: THEME.textLight }}>—</span>;
  const s = BADGE[type] || BADGE.gold;
  return (
    <span
      style={{
        padding: "2px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: "nowrap",
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      {text}
    </span>
  );
}

function SignThumb({ sign }) {
  if (!sign) return <span style={{ color: THEME.textLight, fontSize: 12 }}>—</span>;
  const url = getFileDisplayUrl(sign, FileUrl);
  const isPdf = typeof sign === "string" && sign.toLowerCase().includes(".pdf");

  return (
    <a
      href={url}
      onClick={(e) => {
        e.preventDefault();
        openFileInNewTab(sign, FileUrl);
      }}
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: "inline-block", textDecoration: "none" }}
    >
      {isPdf ? (
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "#FFF1F0",
            border: "1px solid #FFA39E",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
          }}
          title="View PDF"
        >
          📄
        </div>
      ) : (
        <img
          src={url}
          alt="Signature"
          style={{
            width: 44,
            height: 44,
            objectFit: "cover",
            borderRadius: 8,
            border: `1px solid ${THEME.border}`,
            transition: "transform 0.15s",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
          }}
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      )}
    </a>
  );
}

function IconBtn({ onClick, title, bg, border, hoverBg, children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 30,
        height: 30,
        borderRadius: 8,
        background: hovered ? hoverBg : bg,
        border: `1px solid ${border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
}

function ActionBtn({ label, icon, onClick, variant = "primary" }) {
  const [hovered, setHovered] = useState(false);
  const isPrimary = variant === "primary";
  const bg = isPrimary
    ? hovered
      ? THEME.brandDark
      : THEME.brand
    : hovered
    ? THEME.brandLight
    : "#fff";
  const border = isPrimary ? (hovered ? THEME.brandDark : THEME.brand) : "#E0D5C5";
  const color = isPrimary ? "#fff" : hovered ? THEME.brand : "#595959";

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 16px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 600,
        whiteSpace: "nowrap",
        fontFamily: "'Sora', sans-serif",
        background: bg,
        border: `1.5px solid ${border}`,
        color,
        cursor: "pointer",
        transition: "all 0.18s",
        boxShadow: isPrimary ? `0 2px 8px ${THEME.brand}33` : "0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
      {label}
    </button>
  );
}

function Card({ children, style }) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${THEME.border}`,
        borderRadius: 14,
        padding: "20px 22px",
        boxShadow: "0 2px 10px rgba(136,117,73,0.06)",
        marginBottom: 16,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
      <div
        style={{
          width: 3,
          height: 18,
          borderRadius: 2,
          background: `linear-gradient(180deg, ${THEME.brand} 0%, ${THEME.brandMid} 100%)`,
        }}
      />
      <p
        style={{
          margin: 0,
          fontSize: 13,
          fontWeight: 700,
          color: THEME.brand,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          fontFamily: "'Sora', sans-serif",
        }}
      >
        {children}
      </p>
    </div>
  );
}

function Label({ children, required }) {
  return (
    <label
      style={{
        display: "block",
        marginBottom: 6,
        fontSize: 12,
        fontWeight: 700,
        color: "#434343",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {children}
      {required && <span style={{ color: THEME.error, marginLeft: 3 }}>*</span>}
    </label>
  );
}

function Row({ children, cols = 2 }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gap: 16,
        marginBottom: 16,
      }}
    >
      {children}
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
          fontWeight: 600,
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
        {children || value || <span style={{ color: THEME.textLight }}>N/A</span>}
      </div>
    </div>
  );
}

function ConfirmModal({ onConfirm, onCancel, title = "Confirm Submission", message = "Are you sure you want to submit this site inspection? This action cannot be undone." }) {
  return (
    <>
      <div
        onClick={onCancel}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.45)",
          zIndex: 1040,
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 10px 40px rgba(0,0,0,0.18)",
          zIndex: 1050,
          width: "100%",
          maxWidth: 400,
          padding: "32px 28px",
          textAlign: "center",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: THEME.brandLight,
            margin: "0 auto 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={THEME.brand} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h5 style={{ fontWeight: 700, marginBottom: 8, color: THEME.text, fontSize: 16 }}>
          {title}
        </h5>
        <p style={{ color: "#6B7280", marginBottom: 24, fontSize: 13, lineHeight: 1.6 }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <ActionBtn label="Cancel" variant="outline" onClick={onCancel} />
          <ActionBtn label="Yes, Submit" variant="primary" onClick={onConfirm} />
        </div>
      </div>
    </>
  );
}

function groupByMonth(sites) {
  const groups = {};
  sites.forEach((site) => {
    try {
      const key = format(parse(site.created_at, "dd MMM yyyy", new Date()), "MMMM yyyy");
      if (!groups[key]) groups[key] = [];
      groups[key].push(site);
    } catch {
      if (!groups["Other"]) groups["Other"] = [];
      groups["Other"].push(site);
    }
  });
  return groups;
}

// ─────────────────────────────────────────────
//  📊  INSPECTOR STATS BAR
// ─────────────────────────────────────────────
const INSPECTOR_COLORS = [
  { bg: "#E6F7FF", border: "#91D5FF", text: "#096DD9", avatarBg: "#1890FF" }, // Blue
  { bg: "#F6FFED", border: "#B7EB8F", text: "#389E0D", avatarBg: "#52C41A" }, // Green
  { bg: "#FFF7E6", border: "#FFD591", text: "#D46B08", avatarBg: "#FA8C16" }, // Orange
  { bg: "#F9F0FF", border: "#D3ADF7", text: "#531DAB", avatarBg: "#722ED1" }, // Purple
  { bg: "#FFF0F6", border: "#FFADD2", text: "#C41D7F", avatarBg: "#EB2F96" }, // Pink
  { bg: "#E6FFFB", border: "#87E8DE", text: "#08979C", avatarBg: "#13C2C2" }, // Cyan
];

function InspectorStatsBar({ total, inspectors, selectedInspector, onSelectInspector }) {
  if (total === 0) return null;

  return (
    <div
      style={{
        background: "#fff",
        border: `1.5px solid ${THEME.border}`,
        borderRadius: 14,
        padding: "16px 20px",
        marginBottom: 18,
        boxShadow: "0 2px 10px rgba(136,117,73,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
          paddingBottom: 10,
          borderBottom: `1px solid ${THEME.border}`,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>📊</span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: THEME.brandDark,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontFamily: "'Sora', sans-serif",
            }}
          >
            Site Visit Summary & Inspector Breakdown
          </span>
        </div>
        {selectedInspector && (
          <button
            onClick={() => onSelectInspector(null)}
            style={{
              background: THEME.brandLight,
              border: `1px solid ${THEME.brandMid}`,
              color: THEME.brandDark,
              borderRadius: 20,
              padding: "4px 12px",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              transition: "all 0.15s",
            }}
            title="Clear inspector filter"
          >
            <span>Showing: <strong>{selectedInspector}</strong></span>
            <span style={{ fontSize: 14, lineHeight: 1, fontWeight: 800 }}>×</span>
            <span style={{ color: THEME.brand }}>Show All</span>
          </button>
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "stretch",
        }}
      >
        {/* Total Visits Card */}
        <div
          onClick={() => onSelectInspector(null)}
          style={{
            flex: "0 0 170px",
            background: selectedInspector === null ? THEME.brandLight : "#FDFAF5",
            border: `1.5px solid ${selectedInspector === null ? THEME.brand : THEME.border}`,
            borderRadius: 12,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            cursor: "pointer",
            transition: "all 0.18s",
            boxShadow: selectedInspector === null ? `0 2px 8px ${THEME.brand}33` : "none",
          }}
          title="Click to view all site visits"
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${THEME.brand} 0%, ${THEME.brandDark} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 20,
              flexShrink: 0,
            }}
          >
            🏗️
          </div>
          <div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: THEME.brandDark,
                fontFamily: "'Sora', sans-serif",
                lineHeight: 1.1,
              }}
            >
              {total}
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: THEME.brand,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginTop: 2,
              }}
            >
              Total Visits
            </div>
          </div>
        </div>

        {/* Vertical divider */}
        <div
          style={{
            width: 1,
            background: THEME.border,
            alignSelf: "stretch",
            margin: "0 4px",
          }}
        />

        {/* Inspector Cards / Pills */}
        <div
          style={{
            flex: 1,
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {inspectors.map((ins, idx) => {
            const col = INSPECTOR_COLORS[idx % INSPECTOR_COLORS.length];
            const isSelected = selectedInspector?.toLowerCase() === ins.name.toLowerCase();
            const initial = ins.name.charAt(0).toUpperCase();

            return (
              <div
                key={ins.name}
                onClick={() => onSelectInspector(isSelected ? null : ins.name)}
                style={{
                  background: isSelected ? col.bg : "#fff",
                  border: `1.5px solid ${isSelected ? col.text : col.border}`,
                  borderRadius: 12,
                  padding: "8px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  transition: "all 0.18s",
                  boxShadow: isSelected ? `0 2px 8px ${col.text}33` : "0 1px 3px rgba(0,0,0,0.03)",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = col.bg;
                    e.currentTarget.style.borderColor = col.text;
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.borderColor = col.border;
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
                title={`Click to filter inspections by ${ins.name}`}
              >
                {/* Initial Avatar */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: col.avatarBg,
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: `0 2px 4px ${col.avatarBg}44`,
                  }}
                >
                  {initial}
                </div>

                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: THEME.text,
                        fontFamily: "'Sora', sans-serif",
                      }}
                    >
                      {ins.name}
                    </span>
                    {isSelected && (
                      <span
                        style={{
                          fontSize: 10,
                          background: col.text,
                          color: "#fff",
                          borderRadius: 10,
                          padding: "1px 5px",
                          fontWeight: 800,
                        }}
                      >
                        ✓ Active
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: col.text,
                      fontWeight: 700,
                      marginTop: 1,
                    }}
                  >
                    {ins.count} inspection{ins.count !== 1 ? "s" : ""}{" "}
                    <span style={{ color: THEME.textMuted, fontWeight: 500 }}>
                      ({ins.percent}%)
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  🚀  MAIN UNIFIED COMPONENT
// ─────────────────────────────────────────────
const ProjectSiteInspection = ({ projectId, defaultDepartment = "Architecture" }) => {
  const [viewMode, setViewMode] = useState("list"); // "list" | "add" | "edit" | "preview"
  const [sitesList, setSitesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedInspector, setSelectedInspector] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    mst_type_id: "",
    department: "",
    mst_inspection_checklist_id: "",
    others_text: "",
    mst_file_project_id: projectId,
    key_observation: "",
    remarks: "",
    site_incharge: "",
    authorized_person: "",
    review_by: "",
    client_sign: "",
    review_by_sign: "",
  });

  const [departments, setDepartments] = useState([]);
  const [checklistData, setChecklistData] = useState([]);
  const [secondDropdownOptions, setSecondDropdownOptions] = useState([]);
  const [secondDropdownValue, setSecondDropdownValue] = useState("");
  const [visitCategory, setVisitCategory] = useState("Interior Work");
  const [employees, setEmployees] = useState([]);
  const [filedata, setFileData] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [existingClientSign, setExistingClientSign] = useState("");
  const [existingReviewSign, setExistingReviewSign] = useState("");

  const authHeader = useMemo(() => ({ Authorization: `Bearer ${getToken()}` }), []);

  // ── Fetch List ─────────────────────────────
  const fetchSitesList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService(
        null,
        0,
        authHeader,
        getsites.method,
        `${getsites.url}?project_id=${projectId}`,
      );
      if (!res.data.error) {
        const raw = res.data.data || [];
        // Strict filter for this project ID
        const filtered = raw.filter(
          (s) => String(s.nmf_id) === String(projectId) || String(s.mst_file_project_id) === String(projectId),
        );
        setSitesList(filtered.length > 0 ? filtered : raw);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [projectId, authHeader]);

  // ── Fetch Dropdowns ────────────────────────
  const fetchMeta = useCallback(async () => {
    try {
      const [depRes, chkRes, empRes, fileRes] = await Promise.allSettled([
        ApiService(null, 0, authHeader, getDepartment.method, getDepartment.url),
        axios.get(getchecklist.url, { headers: authHeader }),
        ApiService(null, 0, authHeader, fetchActiveEmployee.method, fetchActiveEmployee.url),
        axios.get(`${getfileDatabyId.url}/${projectId}`, { headers: authHeader }),
      ]);

      if (depRes.status === "fulfilled" && !depRes.value.data.error) {
        setDepartments(depRes.value.data.data || []);
      }
      if (chkRes.status === "fulfilled" && !chkRes.value.data.error) {
        const d = chkRes.value.data.data || [];
        setChecklistData(d);
        const options = d.map((item) => ({
          id: item.id,
          types: item.mst_type_id,
          title: item.title,
        }));
        setSecondDropdownOptions(options);
      }
      if (empRes.status === "fulfilled" && !empRes.value.data.error) {
        setEmployees(empRes.value.data.data || []);
      }
      if (fileRes.status === "fulfilled" && !fileRes.value.data.error) {
        setFileData(fileRes.value.data.data?.[0] || null);
      }
    } catch (err) {
      console.error(err);
    }
  }, [projectId, authHeader]);

  useEffect(() => {
    fetchSitesList();
    fetchMeta();
  }, [fetchSitesList, fetchMeta]);

  // Set default department when departments load
  useEffect(() => {
    if (departments.length > 0 && !formData.department) {
      const matched = departments.find(
        (d) => d.name?.toLowerCase() === defaultDepartment.toLowerCase(),
      );
      if (matched) {
        setFormData((p) => ({ ...p, department: matched.id }));
      }
    }
  }, [departments, defaultDepartment, formData.department]);

  // ── Month options for filter ───────────────
  const monthOptions = useMemo(() => {
    const months = new Set();
    sitesList.forEach((s) => {
      try {
        const m = format(parse(s.created_at, "dd MMM yyyy", new Date()), "MMMM yyyy");
        months.add(m);
      } catch {}
    });
    return [{ value: "all", label: "All Months" }, ...Array.from(months).map((m) => ({ value: m, label: m }))];
  }, [sitesList]);

  // ── Inspector Stats Breakdown ───────────────
  const inspectorStats = useMemo(() => {
    const baseList =
      selectedMonth && selectedMonth.value !== "all"
        ? sitesList.filter((s) => {
            try {
              return (
                format(
                  parse(s.created_at, "dd MMM yyyy", new Date()),
                  "MMMM yyyy",
                ) === selectedMonth.value
              );
            } catch {
              return false;
            }
          })
        : sitesList;

    const total = baseList.length;
    const counts = {};

    baseList.forEach((s) => {
      let rawName =
        s.inspectedby?.trim() || s.site_incharge?.trim() || "Unassigned";
      if (rawName && rawName !== "Unassigned") {
        rawName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
      }
      counts[rawName] = (counts[rawName] || 0) + 1;
    });

    const inspectors = Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percent: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    return { total, inspectors };
  }, [sitesList, selectedMonth]);

  // ── Filtered list ──────────────────────────
  const filteredList = useMemo(() => {
    let result = sitesList;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.client_name?.toLowerCase().includes(q) ||
          s.inspectedby?.toLowerCase().includes(q) ||
          s.site_incharge?.toLowerCase().includes(q) ||
          s.visit_work?.toLowerCase().includes(q) ||
          s.visit_category?.toLowerCase().includes(q) ||
          s.case_id?.toLowerCase().includes(q) ||
          s.department?.toLowerCase().includes(q),
      );
    }
    if (selectedMonth && selectedMonth.value !== "all") {
      result = result.filter((s) => {
        try {
          const m = format(parse(s.created_at, "dd MMM yyyy", new Date()), "MMMM yyyy");
          return m === selectedMonth.value;
        } catch {
          return false;
        }
      });
    }
    if (selectedInspector) {
      result = result.filter((s) => {
        let rawName =
          s.inspectedby?.trim() || s.site_incharge?.trim() || "Unassigned";
        if (rawName && rawName !== "Unassigned") {
          rawName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
        }
        return rawName.toLowerCase() === selectedInspector.toLowerCase();
      });
    }
    return result;
  }, [sitesList, searchQuery, selectedMonth, selectedInspector]);

  const monthGroups = useMemo(() => groupByMonth(filteredList), [filteredList]);

  // ── Handlers ───────────────────────────────
  const handleDelete = (id) => {
    SwalAlert({}).then(async (result) => {
      if (!result?.isConfirmed) return;
      setLoading(true);
      try {
        const res = await ApiService(null, id, authHeader, deletesites.method, `${deletesites.url}/${id}`);
        if (!res.data.error) {
          toast.success(res.data.message || "Site inspection deleted.");
          fetchSitesList();
        } else {
          toast.error(res.data.message);
        }
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to delete.");
      } finally {
        setLoading(false);
      }
    });
  };

  const handleOpenAdd = () => {
    const matchedDept = departments.find(
      (d) => d.name?.toLowerCase() === defaultDepartment.toLowerCase(),
    );
    setFormData({
      mst_type_id: "",
      department: matchedDept ? matchedDept.id : "",
      mst_inspection_checklist_id: "",
      others_text: "",
      mst_file_project_id: projectId,
      key_observation: "",
      remarks: "",
      site_incharge: "",
      authorized_person: "",
      review_by: "",
      client_sign: "",
      review_by_sign: "",
    });
    setSecondDropdownValue("");
    setExistingClientSign("");
    setExistingReviewSign("");
    setEditingId(null);
    setViewMode("add");
  };

  const handleOpenEdit = async (id) => {
    setLoading(true);
    try {
      const res = await axios.get(`${getsitesbyid.url}/${id}`, { headers: authHeader });
      if (!res.data.error && res.data.data?.length > 0) {
        const d = res.data.data[0];
        setFormData({
          mst_type_id: d.mst_type_id || "",
          department: d.department || "",
          mst_inspection_checklist_id: d.mst_inspection_checklist_id || "",
          others_text: d.others_text || "",
          mst_file_project_id: d.mst_file_project_id || projectId,
          key_observation: d.key_observation || "",
          remarks: d.remarks || "",
          site_incharge: d.site_incharge || "",
          authorized_person: d.authorized_person || "",
          review_by: d.review_by || "",
          client_sign: d.client_sign || "",
          review_by_sign: d.review_by_sign || "",
        });
        setSecondDropdownValue(d.mst_inspection_checklist_id || "");
        setExistingClientSign(d.client_sign || "");
        setExistingReviewSign(d.review_by_sign || "");
        setEditingId(id);
        setViewMode("edit");
      }
    } catch (err) {
      toast.error("Failed to load details for editing.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPreview = async (id) => {
    setLoading(true);
    try {
      const res = await axios.get(`${getsitesbyid.url}/${id}`, { headers: authHeader });
      if (!res.data.error && res.data.data?.length > 0) {
        setPreviewData(res.data.data[0]);
        setViewMode("preview");
      }
    } catch (err) {
      toast.error("Failed to load inspection preview.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files?.[0]) {
      setFormData((p) => ({ ...p, [name]: files[0] }));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.remarks?.trim()) {
      toast.error("Remarks is required.");
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmedSubmit = async () => {
    setShowConfirmModal(false);
    setSubmitting(true);
    try {
      const payload = new FormData();
      Object.keys(formData).forEach((k) => {
        if (formData[k] !== null && formData[k] !== undefined) {
          payload.append(k, formData[k]);
        }
      });
      payload.set("selectedSecondDropdownValue", secondDropdownValue || "");
      payload.set("mst_inspection_checklist_id", secondDropdownValue || "");
      if (formData.client_sign !== null && formData.client_sign !== undefined) {
        payload.set("client_sign", formData.client_sign);
      }
      if (formData.review_by_sign !== null && formData.review_by_sign !== undefined) {
        payload.set("review_by_sign", formData.review_by_sign);
      }

      if (editingId) {
        payload.append("id", editingId);
        const res = await ApiService(
          payload,
          0,
          { ...authHeader, "Content-Type": "multipart/form-data" },
          updatesites.method,
          updatesites.url,
        );
        if (!res.data.error) {
          toast.success(res.data.message || "Site inspection updated successfully.");
          setViewMode("list");
          fetchSitesList();
        } else {
          toast.error(res.data.message);
        }
      } else {
        const res = await ApiService(
          payload,
          0,
          { ...authHeader, "Content-Type": "multipart/form-data" },
          addsites.method,
          addsites.url,
        );
        if (!res.data.error) {
          toast.success(res.data.message || "Site inspection added successfully.");
          setViewMode("list");
          fetchSitesList();
        } else {
          toast.error(res.data.message);
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────
  //  VIEW: ADD / EDIT FORM
  // ─────────────────────────────────────────────
  if (viewMode === "add" || viewMode === "edit") {
    return (
      <>
        <style>{CSS}</style>
        {showConfirmModal && (
          <ConfirmModal
            onConfirm={handleConfirmedSubmit}
            onCancel={() => setShowConfirmModal(false)}
          />
        )}

        <div className="fade-in">
          {/* Form Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: `1.5px solid ${THEME.border}`,
                  background: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ←
              </button>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: THEME.text, fontFamily: "'Sora', sans-serif" }}>
                  {viewMode === "add" ? "Add Site Visit / Inspection" : "Edit Site Visit / Inspection"}
                </h3>
                <p style={{ margin: 0, fontSize: 12, color: THEME.textMuted }}>
                  Record site inspection observations and signatures for this project
                </p>
              </div>
            </div>
            <ActionBtn label="Back to List" variant="outline" onClick={() => setViewMode("list")} />
          </div>

          <form onSubmit={handleFormSubmit}>
            {/* Card 1: Project Details */}
            {filedata && (
              <Card>
                <SectionTitle>Project Information</SectionTitle>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
                  <InfoTile label="Company" value={filedata.company_name} />
                  <InfoTile label="Project Type" value={filedata.project_type} />
                  <InfoTile label="Category" value={filedata.category_type} />
                  <InfoTile label="Address" value={filedata.address} />
                  <InfoTile label="Case No" value={filedata.case_id} />
                </div>
              </Card>
            )}

            {/* Card 2: Department & Checklist */}
            <Card>
              <SectionTitle>Inspection Categorization</SectionTitle>
              <Row cols={2}>
                <div>
                  <Label required>Department</Label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleFormChange}
                    className="si-input"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Inspection Checklist / Work</Label>
                  <select
                    value={secondDropdownValue}
                    onChange={(e) => {
                      setSecondDropdownValue(e.target.value);
                      const matched = checklistData.find((x) => String(x.id) === String(e.target.value));
                      if (matched) {
                        setFormData((p) => ({
                          ...p,
                          mst_type_id: matched.mst_type_id,
                          mst_inspection_checklist_id: matched.id,
                        }));
                      }
                    }}
                    className="si-input"
                  >
                    <option value="">Select Checklist Item</option>
                    {secondDropdownOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.title}
                      </option>
                    ))}
                  </select>
                </div>
              </Row>

              {secondDropdownValue === "Other" && (
                <div style={{ marginTop: 10 }}>
                  <Label>Specify Other Work</Label>
                  <input
                    type="text"
                    name="others_text"
                    value={formData.others_text}
                    onChange={handleFormChange}
                    placeholder="Enter details..."
                    className="si-input"
                  />
                </div>
              )}
            </Card>

            {/* Card 3: Observations & Remarks */}
            <Card>
              <SectionTitle>Observations & Notes</SectionTitle>
              <div style={{ marginBottom: 14 }}>
                <Label>Key Observation</Label>
                <textarea
                  name="key_observation"
                  value={formData.key_observation}
                  onChange={handleFormChange}
                  rows={3}
                  className="si-input"
                  placeholder="Record any critical observations noticed on the site visit..."
                />
              </div>

              <div>
                <Label required>Remarks</Label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleFormChange}
                  rows={3}
                  className="si-input"
                  placeholder="Enter remarks or instructions for the project team..."
                  required
                />
              </div>
            </Card>

            {/* Card 4: Personnel & Signatures */}
            <Card>
              <SectionTitle>Personnel & Attachments</SectionTitle>
              <Row cols={3}>
                <div>
                  <Label required>Site Incharge</Label>
                  <select
                    name="site_incharge"
                    value={formData.site_incharge}
                    onChange={handleFormChange}
                    className="si-input"
                    required
                  >
                    <option value="">Select Incharge</option>
                    {employees.map((e) => (
                      <option key={e.id} value={`${e.first_name} ${e.last_name}`}>
                        {e.first_name} {e.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label required>Authorized Person</Label>
                  <input
                    type="text"
                    name="authorized_person"
                    value={formData.authorized_person}
                    onChange={handleFormChange}
                    placeholder="Name of authorized person"
                    className="si-input"
                    required
                  />
                </div>

                <div>
                  <Label required>Review By</Label>
                  <select
                    name="review_by"
                    value={formData.review_by}
                    onChange={handleFormChange}
                    className="si-input"
                    required
                  >
                    <option value="">Select Reviewer</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.first_name} {e.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              </Row>

              <Row cols={2}>
                <div>
                  <S3FileUpload
                    label="Client Signature / Site Photo"
                    value={formData.client_sign !== undefined && formData.client_sign !== null ? formData.client_sign : existingClientSign}
                    onChange={(url) => {
                      setFormData((p) => ({ ...p, client_sign: url }));
                      setExistingClientSign(url);
                    }}
                    onRemove={() => {
                      setFormData((p) => ({ ...p, client_sign: "" }));
                      setExistingClientSign("");
                    }}
                    accept="image/*,application/pdf"
                    folder="site_inspection"
                  />
                </div>

                <div>
                  <S3FileUpload
                    label="Reviewer Signature / Photo"
                    value={formData.review_by_sign !== undefined && formData.review_by_sign !== null ? formData.review_by_sign : existingReviewSign}
                    onChange={(url) => {
                      setFormData((p) => ({ ...p, review_by_sign: url }));
                      setExistingReviewSign(url);
                    }}
                    onRemove={() => {
                      setFormData((p) => ({ ...p, review_by_sign: "" }));
                      setExistingReviewSign("");
                    }}
                    accept="image/*,application/pdf"
                    folder="site_inspection"
                  />
                </div>
              </Row>
            </Card>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 18 }}>
              <ActionBtn label="Cancel" variant="outline" onClick={() => setViewMode("list")} />
              <ActionBtn
                label={submitting ? "Submitting…" : viewMode === "add" ? "Submit Site Inspection" : "Update Site Inspection"}
                variant="primary"
                type="submit"
                disabled={submitting}
              />
            </div>
          </form>
        </div>
      </>
    );
  }

  // ─────────────────────────────────────────────
  //  VIEW: PREVIEW CARD
  // ─────────────────────────────────────────────
  if (viewMode === "preview" && previewData) {
    return (
      <>
        <style>{CSS}</style>
        <div className="fade-in">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: THEME.text, fontFamily: "'Sora', sans-serif" }}>
              Site Inspection Details
            </h3>
            <ActionBtn label="← Back to List" variant="outline" onClick={() => setViewMode("list")} />
          </div>

          <Card>
            <SectionTitle>Inspection Summary</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 12, marginBottom: 18 }}>
              <InfoTile label="Inspection Date" value={previewData.created_at || "—"} />
              <InfoTile label="Department" value={previewData.department || defaultDepartment} />
              <InfoTile label="Site Incharge" value={previewData.site_incharge || "—"} />
              <InfoTile label="Authorized Person" value={previewData.authorized_person || "—"} />
              <InfoTile label="Key Observation" value={previewData.key_observation || "None"} />
              <InfoTile label="Remarks" value={previewData.remarks || "None"} />
            </div>

            <Row cols={2}>
              <div>
                <Label>Client Signature / Photo</Label>
                {previewData.client_sign ? (
                  <SignThumb sign={previewData.client_sign} />
                ) : (
                  <span style={{ color: THEME.textLight }}>No attachment</span>
                )}
              </div>
              <div>
                <Label>Reviewer Signature / Photo</Label>
                {previewData.review_by_sign ? (
                  <SignThumb sign={previewData.review_by_sign} />
                ) : (
                  <span style={{ color: THEME.textLight }}>No attachment</span>
                )}
              </div>
            </Row>
          </Card>
        </div>
      </>
    );
  }

  // ─────────────────────────────────────────────
  //  VIEW: LIST (DEFAULT)
  // ─────────────────────────────────────────────
  return (
    <>
      <style>{CSS}</style>

      <div className="fade-in">
        {/* ── Inspector Stats Overview ── */}
        {!loading && sitesList.length > 0 && (
          <InspectorStatsBar
            total={inspectorStats.total}
            inspectors={inspectorStats.inspectors}
            selectedInspector={selectedInspector}
            onSelectInspector={setSelectedInspector}
          />
        )}

        {/* ── Toolbar ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 16,
          }}
        >
          {/* Search + Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search inspections…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: "8px 12px 8px 30px",
                  borderRadius: 10,
                  border: `1.5px solid #E0D5C5`,
                  fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif",
                  width: 220,
                  outline: "none",
                }}
              />
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: THEME.textLight }}>
                🔍
              </span>
            </div>

            {monthOptions.length > 1 && (
              <Select
                options={monthOptions}
                value={selectedMonth}
                onChange={setSelectedMonth}
                placeholder="Filter Month…"
                isClearable
                styles={{
                  control: (base) => ({
                    ...base,
                    minWidth: 160,
                    borderRadius: 10,
                    borderColor: "#E0D5C5",
                    fontSize: 13,
                    fontFamily: "'DM Sans', sans-serif",
                  }),
                }}
              />
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ActionBtn label="Print" icon="🖨️" variant="outline" onClick={() => window.print()} />
            <ActionBtn label="+ Add Site Visit" variant="primary" onClick={handleOpenAdd} />
          </div>
        </div>

        {/* ── Loading Spinner ── */}
        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
            <div className="spinner" />
          </div>
        )}

        {/* ── Empty State ── */}
        {!loading && filteredList.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "48px 20px",
              background: "#fff",
              border: `1px solid ${THEME.border}`,
              borderRadius: 14,
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 10 }}>🏗️</div>
            <h4 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: THEME.text }}>
              No Site Visits Recorded
            </h4>
            <p style={{ margin: "0 0 16px", color: THEME.textLight, fontSize: 13 }}>
              No site inspection or visit records found for this project yet.
            </p>
            <ActionBtn label="+ Add Site Visit" variant="primary" onClick={handleOpenAdd} />
          </div>
        )}

        {/* ── Month Cards Grouping (Matches Site Inspection List) ── */}
        {!loading &&
          Object.keys(monthGroups).map((monthKey) => {
            const items = monthGroups[monthKey];
            return (
              <div
                key={monthKey}
                style={{
                  background: "#fff",
                  border: `1px solid ${THEME.border}`,
                  borderRadius: 14,
                  overflow: "hidden",
                  boxShadow: "0 2px 10px rgba(136,117,73,0.06)",
                  marginBottom: 18,
                }}
              >
                {/* Month Group Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 18px",
                    background: THEME.brandLight,
                    borderBottom: `1px solid ${THEME.border}`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: `linear-gradient(135deg, ${THEME.brand} 0%, ${THEME.brandMid} 100%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 800,
                      }}
                    >
                      {monthKey.slice(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: THEME.brandDark, fontFamily: "'Sora', sans-serif" }}>
                        {monthKey}
                      </p>
                      <p style={{ margin: 0, fontSize: 11, color: "#212121" }}>
                        {items.length} inspection{items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Sans', sans-serif" }}>
                    <thead>
                      <tr style={{ background: "#FDFAF5" }}>
                        {COLUMNS.map((col) => (
                          <th
                            key={col.key}
                            style={{
                              padding: "9px 12px",
                              fontSize: 10,
                              fontWeight: 700,
                              color: THEME.brand,
                              textTransform: "uppercase",
                              letterSpacing: "0.07em",
                              borderBottom: `1px solid ${THEME.border}`,
                              textAlign: col.center ? "center" : "left",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((site, idx) => (
                        <tr
                          key={site.id}
                          style={{
                            background: idx % 2 === 0 ? "#fff" : THEME.rowAlt,
                            borderBottom: `1px solid #F5EFE4`,
                          }}
                        >
                          <td style={{ padding: "10px 12px", textAlign: "center", fontSize: 12, color: THEME.textMuted, fontWeight: 700 }}>
                            {idx + 1}
                          </td>
                          <td style={{ padding: "10px 12px", fontSize: 12, color: THEME.text, whiteSpace: "nowrap" }}>
                            {site.created_at || "—"}
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <Badge text={site.department} type="gold" />
                          </td>
                          <td style={{ padding: "10px 12px", fontSize: 12, fontWeight: 700, color: THEME.brandDark }}>
                            {site.case_id || "—"}
                          </td>
                          <td style={{ padding: "10px 12px", fontSize: 12, color: THEME.text }}>
                            {site.client_name || "—"}
                          </td>
                          <td style={{ padding: "10px 12px", fontSize: 12, color: THEME.text }}>
                            {site.inspectedby || "—"}
                          </td>
                          <td style={{ padding: "10px 12px", fontSize: 12, color: THEME.text }}>
                            {site.site_incharge || "—"}
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <Badge text={site.visit_category} type="blue" />
                          </td>
                          <td style={{ padding: "10px 12px", fontSize: 12, color: THEME.text, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {site.visit_work || "—"}
                          </td>
                          <td style={{ padding: "10px 12px", textAlign: "center" }}>
                            <SignThumb sign={site.client_sign} />
                          </td>
                          <td style={{ padding: "10px 12px", textAlign: "center" }}>
                            <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                              {/* Preview */}
                              <IconBtn
                                onClick={() => handleOpenPreview(site.id)}
                                title="View Details"
                                bg="#fff"
                                border="#E0D5C5"
                                hoverBg={THEME.brandLight}
                              >
                                👁️
                              </IconBtn>
                              {/* Edit */}
                              <IconBtn
                                onClick={() => handleOpenEdit(site.id)}
                                title="Edit"
                                bg="#fff"
                                border="#E0D5C5"
                                hoverBg={THEME.brandLight}
                              >
                                ✏️
                              </IconBtn>
                              {/* Delete */}
                              <IconBtn
                                onClick={() => handleDelete(site.id)}
                                title="Delete"
                                bg="#FFF1F0"
                                border="#FFA39E"
                                hoverBg="#CF1322"
                              >
                                🗑️
                              </IconBtn>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
      </div>
    </>
  );
};

export default ProjectSiteInspection;
