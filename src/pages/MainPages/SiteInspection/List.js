// ─────────────────────────────────────────────
//  SiteInspectionList.jsx
//  All colours, table columns, and text live at
//  the TOP of this file — easy to find & change.
// ─────────────────────────────────────────────

import React, { useEffect, useState, useMemo, useRef } from "react";
import { deletesites, getsites, fetchallStage } from "../../../config/config";
import ApiService from "../../../services/ApiService";
import { getToken } from "../../../services/useLocalStorage";
import { useNavigate } from "react-router-dom";
import { SiteRoute } from "../../../config/RouteConfig";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import toast from "react-hot-toast";
import Select from "react-select";
import { FileUrl } from "../../../config/file_url";
import { format, parse } from "date-fns";


// ─────────────────────────────────────────────
//  🎨  THEME  —  change colours here
// ─────────────────────────────────────────────
const THEME = {
  brand:      "#887549",   // primary brand gold
  brandLight: "#F5F0E8",   // soft gold background
  brandMid:   "#C4A97D",   // mid-tone gold
  brandDark:  "#5C4E32",   // dark gold
  bg:         "#F8F5F0",   // page background
  border:     "#EDE5D5",   // card border
  rowAlt:     "#FEFCF9",   // alternating row tint
  rowHover:   "#FDFAF5",   // row hover background
  text:       "#1A1A2E",   // primary text
  textMuted:  "#ADADAD",   // subtitle text
  textLight:  "#BDBDBD",   // placeholder / dash colour
};


// ─────────────────────────────────────────────
//  📋  TABLE COLUMNS
//  label   → header text shown in the table
//  key     → field name from the API response
//  center  → centre-align the cell?
//  noPrint → hide this column when printing?
//  width   → optional min-width (px)
// ─────────────────────────────────────────────
const COLUMNS = [
  { label: "#",             key: "__index",       center: true                     },
  { label: "Date",          key: "created_at",                                     },
  { label: "Department",    key: "department",    badge: "gold"                    },
  { label: "File",          key: "case_id",       bold: true                       },
  { label: "Client",        key: "client_name"                                     },
  { label: "Inspected By",  key: "inspectedby"                                     },
  { label: "Site Incharge", key: "site_incharge"                                   },
  { label: "Category",      key: "visit_category", badge: "blue"                   },
  { label: "Work",          key: "visit_work",    truncate: true, width: 160       },
  { label: "Client Sign",   key: "client_sign",   noPrint: true, type: "sign"      },
  { label: "Action",        key: "__action",      noPrint: true, center: true      },
];


// ─────────────────────────────────────────────
//  🏷  BADGE STYLES  —  add more types here
// ─────────────────────────────────────────────
const BADGE = {
  gold: { bg: THEME.brandLight, color: THEME.brand,  border: "#D4C4A0" },
  blue: { bg: "#F0F5FF",        color: "#2F54EB",    border: "#ADC6FF" },
};


// ─────────────────────────────────────────────
//  📝  GLOBAL CSS
// ─────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fade-in { animation: fadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner {
    width: 28px; height: 28px; border-radius: 50%;
    border: 3px solid ${THEME.brandLight};
    border-top-color: ${THEME.brand};
    animation: spin 0.8s linear infinite;
  }

  @media print { .no-print { display: none !important; } }
`;


// ─────────────────────────────────────────────
//  🔧  HELPERS
// ─────────────────────────────────────────────

/** Returns padding/border style object for a <td> */
function tdStyle(isLastRow, center = false, minWidth) {
  return {
    padding: "11px 14px",
    borderBottom: isLastRow ? "none" : `1px solid #F5EFE4`,
    textAlign: center ? "center" : "left",
    verticalAlign: "middle",
    ...(minWidth ? { minWidth } : {}),
  };
}

/** Groups an array of site objects by "Month YYYY" using created_at */
function groupByMonth(sites) {
  const groups = {};
  sites.forEach((site) => {
    try {
      const key = format(parse(site.created_at, "dd MMM yyyy", new Date()), "MMMM yyyy");
      if (!groups[key]) groups[key] = [];
      groups[key].push(site);
    } catch {
      // skip items with unreadable dates
    }
  });
  return groups;
}


// ─────────────────────────────────────────────
//  🧩  SMALL REUSABLE UI PIECES
// ─────────────────────────────────────────────

/** Pill badge — pass a key from BADGE object above */
function Badge({ text, type = "gold" }) {
  if (!text) return <span style={{ color: THEME.textLight }}>—</span>;
  const s = BADGE[type] || BADGE.gold;
  return (
    <span style={{
      padding: "2px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      {text}
    </span>
  );
}

/** Client signature — shows image thumbnail or PDF icon */
function ClientSign({ sign }) {
  if (!sign) return <span style={{ color: THEME.textLight, fontSize: 12 }}>—</span>;

  // 🔧 Change this base URL if your API changes
  const FILE_BASE_URL = "https://webappapi.zaidexceldesign.com";
  const url    = `${FILE_BASE_URL}/${sign}`;
  const isPdf  = sign.toLowerCase().endsWith(".pdf");

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block" }}>
      {isPdf ? (
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: "#FFF1F0", border: "1px solid #FFA39E",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18,
        }}>
          📄
        </div>
      ) : (
        <img
          src={url}
          alt="Client signature"
          style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 8, border: `1px solid ${THEME.border}`, transition: "transform 0.15s" }}
          onMouseEnter={(e) => { e.target.style.transform = "scale(1.1)"; }}
          onMouseLeave={(e) => { e.target.style.transform = "scale(1)"; }}
        />
      )}
    </a>
  );
}

/** Small square icon button (Edit / Delete) */
function IconBtn({ onClick, title, bg, border, hoverBg, children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 30, height: 30, borderRadius: 8,
        background: hovered ? hoverBg : bg,
        border: `1px solid ${border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
}

/** Solid (primary) or outline action button used in the page header */
function ActionBtn({ label, icon, onClick, variant = "primary" }) {
  const [hovered, setHovered] = useState(false);
  const isPrimary = variant === "primary";

  const bg     = isPrimary ? (hovered ? THEME.brandDark : THEME.brand)      : (hovered ? THEME.brandLight : "#fff");
  const border = isPrimary ? (hovered ? THEME.brandDark : THEME.brand)      : "#E0D5C5";
  const color  = isPrimary ? "#fff"                                          : (hovered ? THEME.brand : "#595959");
  const shadow = isPrimary
    ? (hovered ? `0 4px 14px ${THEME.brand}55` : `0 2px 8px ${THEME.brand}33`)
    : "0 1px 4px rgba(0,0,0,0.05)";

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "8px 16px", borderRadius: 10,
        fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
        fontFamily: "'Sora', sans-serif",
        background: bg, border: `1.5px solid ${border}`,
        color, cursor: "pointer", transition: "all 0.18s", boxShadow: shadow,
      }}
    >
      {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
      {label}
    </button>
  );
}

/** react-select custom styles — matches brand colours */
const SELECT_STYLES = {
  control: (base, state) => ({
    ...base, minWidth: 240, borderRadius: 10,
    fontFamily: "'DM Sans', sans-serif", fontSize: 13,
    borderColor: state.isFocused ? THEME.brand : "#E0D5C5",
    boxShadow: state.isFocused ? `0 0 0 2px ${THEME.brand}33` : "0 1px 4px rgba(0,0,0,0.06)",
    "&:hover": { borderColor: THEME.brand },
  }),
  option: (base, state) => ({
    ...base, cursor: "pointer", fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    background: state.isSelected ? THEME.brand : state.isFocused ? THEME.brandLight : "#fff",
    color: state.isSelected ? "#fff" : "#434343",
  }),
  placeholder: (base) => ({ ...base, color: THEME.textLight, fontSize: 13 }),
  singleValue:  (base) => ({ ...base, color: "#434343" }),
  menu: (base) => ({
    ...base, borderRadius: 12,
    border: `1px solid ${THEME.border}`,
    boxShadow: "0 8px 24px rgba(136,117,73,0.12)",
  }),
};


// ─────────────────────────────────────────────
//  📊  STATS BAR WITH INSPECTORS
// ─────────────────────────────────────────────
const INSPECTOR_COLORS = [
  { bg: "#E6F7FF", border: "#91D5FF", text: "#096DD9", avatarBg: "#1890FF" },
  { bg: "#F6FFED", border: "#B7EB8F", text: "#389E0D", avatarBg: "#52C41A" },
  { bg: "#FFF7E6", border: "#FFD591", text: "#D46B08", avatarBg: "#FA8C16" },
  { bg: "#F9F0FF", border: "#D3ADF7", text: "#531DAB", avatarBg: "#722ED1" },
  { bg: "#FFF0F6", border: "#FFADD2", text: "#C41D7F", avatarBg: "#EB2F96" },
  { bg: "#E6FFFB", border: "#87E8DE", text: "#08979C", avatarBg: "#13C2C2" },
];

function StatsBar({ sites, selectedInspector, onSelectInspector }) {
  const total = sites.length;
  const counts = {};

  sites.forEach((s) => {
    let rawName = s.inspectedby?.trim() || s.site_incharge?.trim() || "Unassigned";
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

  return (
    <div
      style={{
        background: "#fff",
        border: `1.5px solid ${THEME.border}`,
        borderRadius: 14,
        padding: "16px 20px",
        marginBottom: 22,
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
            Site Inspection Overview & Inspector Breakdown
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
          >
            <span>Showing: <strong>{selectedInspector}</strong></span>
            <span style={{ fontSize: 14, lineHeight: 1, fontWeight: 800 }}>×</span>
            <span style={{ color: THEME.brand }}>Show All</span>
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "stretch" }}>
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
        <div style={{ width: 1, background: THEME.border, alignSelf: "stretch", margin: "0 4px" }} />

        {/* Inspector Cards / Pills */}
        <div style={{ flex: 1, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
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
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: THEME.text, fontFamily: "'Sora', sans-serif" }}>
                      {ins.name}
                    </span>
                    {isSelected && (
                      <span style={{ fontSize: 10, background: col.text, color: "#fff", borderRadius: 10, padding: "1px 5px", fontWeight: 800 }}>
                        ✓ Active
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: col.text, fontWeight: 700, marginTop: 1 }}>
                    {ins.count} inspection{ins.count !== 1 ? "s" : ""}{" "}
                    <span style={{ color: THEME.textMuted, fontWeight: 500 }}>({ins.percent}%)</span>
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
//  🏗  SITE TABLE ROW
// ─────────────────────────────────────────────
function SiteRow({ site, index, isLast, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false);

  // Renders the correct content for each column based on its config
  function renderCell(col) {
    if (col.key === "__index")  return index + 1;
    if (col.key === "__action") return (
      <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
        <IconBtn onClick={() => onEdit(site.id)} title="Edit" bg="#F0F5FF" border="#ADC6FF" hoverBg="#D6E4FF">
          <img src={`${FileUrl}/img/icons/edit.svg`}   alt="Edit"   style={{ width: 14, height: 14 }} />
        </IconBtn>
        <IconBtn onClick={() => onDelete(site.id)} title="Delete" bg="#FFF1F0" border="#FFA39E" hoverBg="#FFCDD2">
          <img src={`${FileUrl}/img/icons/delete.svg`} alt="Delete" style={{ width: 14, height: 14 }} />
        </IconBtn>
      </div>
    );
    if (col.type === "sign")  return <ClientSign sign={site[col.key]} />;
    if (col.badge)            return <Badge text={site[col.key]} type={col.badge} />;

    const value = site[col.key] || "—";
    return (
      <span style={{
        fontSize: 13,
        fontWeight: col.bold ? 600 : 400,
        color: col.bold ? THEME.text : "#434343",
        ...(col.truncate ? { display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: col.width || 160 } : { whiteSpace: "nowrap" }),
      }}>
        {value}
      </span>
    );
  }

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? THEME.rowHover : index % 2 === 0 ? "#fff" : THEME.rowAlt,
        transition: "background 0.15s",
      }}
    >
      {COLUMNS.map((col) => (
        <td
          key={col.key}
          className={col.noPrint ? "no-print" : ""}
          style={tdStyle(isLast, col.center, col.width)}
        >
          {renderCell(col)}
        </td>
      ))}
    </tr>
  );
}


// ─────────────────────────────────────────────
//  📅  MONTH GROUP CARD
// ─────────────────────────────────────────────
function MonthCard({ monthKey, sites, onEdit, onDelete }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="fade-in" style={{
      background: "#fff", border: `1px solid ${THEME.border}`,
      borderRadius: 14, overflow: "hidden",
      boxShadow: "0 2px 12px rgba(136,117,73,0.07)", marginBottom: 20,
    }}>

      {/* ── Month header (click to collapse) ── */}
      <div
        onClick={() => setCollapsed((c) => !c)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "13px 20px", background: THEME.brandLight,
          borderBottom: collapsed ? "none" : `1px solid ${THEME.border}`,
          cursor: "pointer", userSelect: "none", flexWrap: "wrap", gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Month icon square */}
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: `linear-gradient(135deg, ${THEME.brand} 0%, ${THEME.brandMid} 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 10, fontWeight: 800, letterSpacing: "0.02em",
          }}>
            {monthKey.slice(0, 3).toUpperCase()}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: THEME.brandDark, fontFamily: "'Sora', sans-serif" }}>
              {monthKey}
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "#212121" }}>
              {sites.length} inspection{sites.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Chevron */}
        <span style={{
          fontSize: 13, color: THEME.textLight, display: "inline-block",
          transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
          transition: "transform 0.2s",
        }}>▾</span>
      </div>

      {/* ── Table (hidden when collapsed) ── */}
      {!collapsed && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Sans', sans-serif" }}>

            {/* Column headers — driven by COLUMNS array above */}
            <thead>
              <tr style={{ background: "#FDFAF5" }}>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className={col.noPrint ? "no-print" : ""}
                    style={{
                      padding: "9px 14px",
                      fontSize: 11, fontWeight: 700, color: THEME.brand,
                      textTransform: "uppercase", letterSpacing: "0.07em",
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
              {sites.map((site, idx) => (
                <SiteRow
                  key={site.id}
                  site={site}
                  index={idx}
                  isLast={idx === sites.length - 1}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const List = () => {
  const navigate  = useNavigate();
  const printRef  = useRef(null);

  const [sites,          setSites]          = useState([]);
  const [files,          setFiles]          = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [selectedFileId, setSelectedFileId] = useState("");
  const [selectedInspector, setSelectedInspector] = useState(null);

  const authHeader = {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };

  // ── API calls ──────────────────────────────

  const fetchSites = async () => {
    try {
      setLoading(true);
      const res = await ApiService(null, 0, authHeader, getsites.method, getsites.url);
      if (!res.data.error) setSites(res.data.data);
      else toast.error(res.data.message);
    } catch (err) {
      console.error(err);
      if (err.response?.data?.error) toast.error(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const res = await ApiService(null, 0, authHeader, fetchallStage.method, fetchallStage.url);
      if (!res.data.error) setFiles(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteSite = async (id) => {
    try {
      setLoading(true);
      const res = await ApiService(null, id, authHeader, deletesites.method, deletesites.url);
      if (!res.data.error) { fetchSites(); toast.success(res.data.message); }
      else toast.error(res.data.message);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id) => {
    SwalAlert({})
      .then(async (result) => { if (result?.isConfirmed) await deleteSite(id); })
      .catch(() => toast.error("Unable to remove"));
  };

  useEffect(() => {
    fetchSites();
    fetchFiles();
  }, []);

  // ── Derived data ───────────────────────────

  const fileOptions = [
    { value: "", label: "All Files" },
    ...files.map((f) => ({
      value: f.id,
      label: `${f.case_id} — ${f.first_name} ${f.last_name}`,
    })),
  ];

  const filteredSites = useMemo(() => {
    let filtered = selectedFileId
      ? sites.filter((s) => s.nmf_id == selectedFileId)
      : sites;
    if (selectedInspector) {
      filtered = filtered.filter((s) => {
        let rawName = s.inspectedby?.trim() || s.site_incharge?.trim() || "Unassigned";
        if (rawName && rawName !== "Unassigned") {
          rawName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
        }
        return rawName.toLowerCase() === selectedInspector.toLowerCase();
      });
    }
    return [...filtered].sort((a, b) => b.id - a.id);
  }, [sites, selectedFileId, selectedInspector]);

  const groupedSites = useMemo(() => groupByMonth(filteredSites), [filteredSites]);

  // ── Print handler ──────────────────────────

  const handlePrint = () => {
    const printContent  = printRef.current.innerHTML;
    const originalBody  = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalBody;
    window.location.reload();
  };

  // ── Render ─────────────────────────────────

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div style={{
        minHeight: "100vh", 
        fontFamily: "'DM Sans', sans-serif",
        padding: "28px 24px",
      }}>

        {/* Page header */}
        <div style={{
          display: "flex", alignItems: "flex-start",
          justifyContent: "space-between", flexWrap: "wrap",
          gap: 14, marginBottom: 22,
        }}>
          {/* Title */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{
                width: 4, height: 26, borderRadius: 3,
                background: `linear-gradient(180deg, ${THEME.brand} 0%, ${THEME.brandMid} 100%)`,
              }} />
              <h1 style={{
                margin: 0, fontSize: 22, fontWeight: 800,
                color: THEME.text, fontFamily: "'Sora', sans-serif", letterSpacing: "-0.3px",
              }}>
                Site Inspections
              </h1>
            </div>
            <p style={{ margin: "0 0 0 12px", fontSize: 12, color: THEME.textMuted }}>
              {loading
                ? "Loading…"
                : `${filteredSites.length} inspection${filteredSites.length !== 1 ? "s" : ""} found`}
            </p>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <ActionBtn label="Add"   icon="+"    variant="primary" onClick={() => navigate(`/${SiteRoute.add}`)} />
            <ActionBtn label="Print" icon="🖨️"  variant="outline" onClick={handlePrint} />
            <Select
              options={fileOptions}
              isLoading={loading}
              isSearchable
              placeholder="Filter by File…"
              styles={SELECT_STYLES}
              value={fileOptions.find((o) => o.value === selectedFileId) || fileOptions[0]}
              onChange={(opt) => {
                setSelectedFileId(opt?.value || "");
                setSelectedInspector(null);
              }}
            />
          </div>
        </div>

        {/* Stats */}
        {!loading && sites.length > 0 && (
          <StatsBar
            sites={selectedFileId ? sites.filter((s) => s.nmf_id == selectedFileId) : sites}
            selectedInspector={selectedInspector}
            onSelectInspector={setSelectedInspector}
          />
        )}

        {/* Loading spinner */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0", gap: 16 }}>
            <div className="spinner" />
            <p style={{ color: THEME.textLight, fontSize: 13, margin: 0 }}>Loading site inspections…</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && Object.keys(groupedSites).length === 0 && (
          <div style={{
            textAlign: "center", padding: "64px 0",
            background: "#fff", border: `1px solid ${THEME.border}`, borderRadius: 14,
          }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🏗️</div>
            <p style={{ color: THEME.textLight, fontSize: 14, margin: 0 }}>No site inspections found.</p>
          </div>
        )}

        {/* Month group cards */}
        <div ref={printRef}>
          {!loading && Object.keys(groupedSites).map((monthKey, i) => (
            <div key={monthKey} style={{ animationDelay: `${i * 0.06}s` }}>
              <MonthCard
                monthKey={monthKey}
                sites={groupedSites[monthKey]}
                onEdit={(id) => navigate(`/${SiteRoute.edit}/${id}`)}
                onDelete={confirmDelete}
              />
            </div>
          ))}
        </div>

      </div>
    </>
  );
};

export default List;