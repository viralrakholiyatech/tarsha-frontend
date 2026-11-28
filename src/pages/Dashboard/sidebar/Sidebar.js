import React, { useState, useMemo, useCallback, memo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  adminKey,
  empKey,
  subadmin,
  cordinator,
} from "../../../config/RoleConfig";
import {
  CustRoute,
  VillageRoute,
  EmpRoute,
  FilesRoute,
  FileExpenseRoute,
  OfficeExpenseRoute,
  dashboard,
  TpschemeRoute,
  DepositExpenseRoute,
  TodosRoute,
  LeaveRoute,
  ProjectRoute,
  ArchitectureRoute,
  SiteRoute,
  ApprovalRoute,
  AttendanceRoute,
  MeetingRoute,
  InteriorRoute,
  TentativeRoute,
  InwardRoute,
  OutwardRoute,
  ShiftRoute,
  PostRoute,
  LeadsRoute,
  CampaignRoute,
  LocationRoute,
  PaymentRoute,
  VendorRoute,
  LedgerRoute,
  ReceiptRoute,
  // PmsRoute,
  CityRoute,
  DepartmentRoute,
  // WorkflowRoute
  ProgressReportRoute,
} from "../../../config/RouteConfig";
import {
  getRole,
  getUserId,
  getToken,
  getUserRoles,
  isEmp,
  shouldAllowedOfRoles,
  superAccess,
  Cordinator,
  ishod,
  getCompanyLogo,
  getCompanyFeatures,
} from "../../../services/useLocalStorage";
import { FileUrl } from "../../../config/file_url";

// ─────────────────────────────────────────────
//  🎨  THEME
// ─────────────────────────────────────────────
const T = {
  brand: "#887549",
  brandLight: "#F5F0E8",
  brandMid: "#C4A97D",
  brandDark: "#5C4E32",
  bg: "#1A1512", // dark sidebar background
  bgHover: "#261E15",
  bgActive: "#2E2112",
  border: "rgba(136,117,73,0.15)",
  text: "#E8DDD0",
  textMuted: "#9A8878",
  textActive: "#C4A97D",
  sub: "#0F0D0A", // submenu bg
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

  .sb-root {
    width:240px;background:${T.bg};
    display:flex;flex-direction:column;font-family:'DM Sans',sans-serif;
    border-right:1px solid ${T.border};
    position:fixed;top:0;left:0;bottom:0;overflow-y:auto;z-index:200;
    scrollbar-width:none;
  }
  .sb-root::-webkit-scrollbar { display:none; }

  /* ── Logo ── */
  .sb-logo {
    padding:18px 20px 14px;display:flex;align-items:center;
    border-bottom:1px solid ${T.border};margin-bottom:6px;
  }

  /* ── Section heading ── */
  .sb-section {
    padding:10px 20px 4px;font-size:9px;font-weight:700;
    color:${T.textMuted};text-transform:uppercase;letter-spacing:0.1em;
  }

  /* ── Nav item ── */
  .sb-item {
    display:flex;align-items:center;gap:10px;padding:9px 16px;
    border-radius:10px;margin:1px 8px;cursor:pointer;
    font-size:13px;font-weight:500;color:${T.text};
    text-decoration:none;transition:background 0.15s,color 0.15s;
    position:relative;
  }
  .sb-item:hover { background:${T.bgHover};color:#fff; }
  .sb-item.active {
    background:linear-gradient(135deg,${T.brand}22 0%,${T.brand}11 100%);
    color:${T.textActive};font-weight:700;
  }
  .sb-item.active::before {
    content:'';position:absolute;left:-8px;top:50%;transform:translateY(-50%);
    width:3px;height:70%;background:${T.brand};border-radius:0 3px 3px 0;
  }
  .sb-item-icon {
    width:18px;height:18px;flex-shrink:0;opacity:0.8;
    display:inline-flex;align-items:center;justify-content:center;
    color:currentColor;
  }
  .sb-item-icon svg { width:18px;height:18px;display:block;stroke:currentColor; }
  .sb-item:hover .sb-item-icon { opacity:1;color:#fff; }
  .sb-item.active .sb-item-icon { opacity:1;color:${T.textActive}; }
  .sb-item .sb-chevron {
    margin-left:auto;font-size:10px;transition:transform 0.2s;opacity:0.5;
  }
  .sb-item .sb-chevron.open { transform:rotate(180deg);opacity:1; }

  /* ── Submenu ── */
  .sb-sub {
    margin:0 8px 2px;
    border-radius:0 0 10px 10px;
    background:${T.sub};
  }
  .sb-sub-item {
    display:flex;align-items:center;gap:8px;padding:8px 16px 8px 40px;
    font-size:12px;font-weight:500;color:${T.textMuted};
    text-decoration:none;border-radius:8px;margin:1px;
    transition:background 0.15s,color 0.15s;
  }
  .sb-sub-item:hover { background:${T.bgHover};color:${T.text}; }
  .sb-sub-item.active { color:${T.textActive};font-weight:700; }
  .sb-sub-item::before {
    content:'';width:4px;height:4px;border-radius:50%;
    background:currentColor;flex-shrink:0;
  }

  /* Slide animation */
  @keyframes sbSlide { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
  .sb-sub { animation:sbSlide 0.15s ease both; }

  /* ── Bottom spacer ── */
  .sb-spacer { flex:1;min-height:24px; }
`;

// ─── Chevron SVG ─────────────────────────────
const Chevron = ({ open }) => (
  <svg
    className={`sb-chevron${open ? " open" : ""}`}
    width="10"
    height="10"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const SubToggle = memo(({ label, open, onToggle }) => (
  <div
    className="sb-sub-item"
    onClick={onToggle}
    style={{ cursor: "pointer", justifyContent: "space-between" }}
  >
    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span
        style={{
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: "currentColor",
          flexShrink: 0,
        }}
      />
      Escrow
    </span>
    <Chevron open={open} />
  </div>
));

const SubSubMenu = memo(({ open, children }) =>
  open ? (
    <div
      style={{
        marginLeft: 16,
        borderLeft: `1px solid ${T.border}`,
        paddingLeft: 4,
      }}
    >
      {children}
    </div>
  ) : null,
);

// ─── Inline Sidebar SVGs ───────────────────────
const SIDEBAR_SVGS = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="8" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
    </svg>
  ),
  team: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      <path d="M18.5 10c1.38 0 2.5-1.12 2.5-2.5S19.88 5 18.5 5 16 6.12 16 7.5s1.12 2.5 2.5 2.5zm1 2c-1.07 0-2.09.28-2.98.77.62.91 1 2.01 1 3.23v2h4c.55 0 1-.45 1-1v-1c0-1.66-2-3-4.02-3zm-13-2c1.38 0 2.5-1.12 2.5-2.5S7.88 5 6.5 5 4 6.12 4 7.5 5.12 10 6.5 10zm-1 2C3.48 12 1.48 13.34 1.48 15v1c0 .55.45 1 1 1h4v-2c0-1.22.38-2.32 1-3.23-.89-.49-1.91-.77-2.98-.77z" opacity="0.85" />
    </svg>
  ),
  master: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
    </svg>
  ),
  tentative: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6A4.997 4.997 0 0 1 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  ),
  approval: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z" />
      <path d="M10.8 17.2l-2.4-2.4 1.4-1.4 1 1 3.2-3.2 1.4 1.4-4.6 4.6z" fill="#19140F" />
    </svg>
  ),
  architecture: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.71 6.88l-4.59-4.59a1.003 1.003 0 0 0-1.41 0L14 4.01 4.7 13.31a.996.996 0 0 0-.29.71V19c0 .55.45 1 1 1h5c.27 0 .52-.11.71-.29l9.59-9.59 1.71-1.71c.39-.39.39-1.02 0-1.41zM6.41 18H6v-.41l8.59-8.59.41.41L6.41 18zm4.41 0l-1.41-1.41 8.59-8.59 1.41 1.41L10.82 18zm7.18-9.18l-1.41-1.41 1.59-1.59 1.41 1.41-1.59 1.59z" />
      <path d="M2 21h20v1.5H2z" />
    </svg>
  ),
  interior: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 10V7c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v3c-1.1 0-2 .9-2 2v5h1.33L4 19h1.5l.67-2h11.66l.67 2H20l.67-2H22v-5c0-1.1-.9-2-2-2zm-9-3h2v5h-2V7zM6 7h3v5H6V7zm12 5h-3V7h3v5z" />
    </svg>
  ),
  workflow: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 13c-1.35 0-2.48.9-2.85 2.13-1.63.22-3.15-.49-4.15-1.5-1-1.01-1.72-2.52-1.5-4.15C11.6 9.1 12.5 8 12.5 6.5A3.5 3.5 0 0 0 9 3 3.5 3.5 0 0 0 5.5 6.5c0 1.5 1 2.62 2.38 3.12-.22 2.15.65 4.3 2.12 5.78 1.47 1.47 3.63 2.34 5.78 2.12.38 1.38 1.5 2.48 2.87 2.48a3.5 3.5 0 0 0 3.5-3.5 3.5 3.5 0 0 0-3.5-3.5z" />
    </svg>
  ),
  task: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14H7v-2h4v2zm6-4H7v-2h10v2zm0-4H7V7h10v2z" />
    </svg>
  ),
  pms: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14H7v-2h4v2zm6-4H7v-2h10v2zm0-4H7V7h10v2z" />
    </svg>
  ),
  meeting: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  ),
  register: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
    </svg>
  ),
  siteinspection: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
    </svg>
  ),
  socialmedia: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 16H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V6h12v4z" />
    </svg>
  ),
  accounts: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 14H9v-2h6v2zm2-4H7v-2h10v2zm0-4H7V7h10v2z" />
    </svg>
  ),
  fileexpenses: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 14H9v-2h6v2zm2-4H7v-2h10v2zm0-4H7V7h10v2z" />
    </svg>
  ),
  attendance: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-12 4h3v3H7V7zm0 5h3v3H7v-3zm0 5h3v2H7v-2zm5-10h5v3h-5V7zm0 5h5v3h-5v-3zm0 5h5v2h-5v-2z" />
    </svg>
  ),
  location: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
  ),
  leave: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
    </svg>
  ),
  wallet: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 7.28V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-2.28c.59-.35 1-.98 1-1.72V9c0-.74-.41-1.37-1-1.72zM20 9v6h-7V9h7zM5 19V5h14v2h-6c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h6v2H5z" />
      <circle cx="16" cy="12" r="1.5" />
    </svg>
  ),
  progressreport: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 11h3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1zm6.5-7h3a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm6.5 4h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
    </svg>
  ),
};

const getSidebarIcon = (iconName) => {
  if (!iconName) return null;
  const key = iconName.toLowerCase().replace(".svg", "").replace(".png", "");
  if (key.includes("dashboard")) return SIDEBAR_SVGS.dashboard;
  if (key.includes("team") || key.includes("member")) return SIDEBAR_SVGS.team;
  if (key.includes("master")) return SIDEBAR_SVGS.master;
  if (key.includes("tent")) return SIDEBAR_SVGS.tentative;
  if (key.includes("approv")) return SIDEBAR_SVGS.approval;
  if (key.includes("arch")) return SIDEBAR_SVGS.architecture;
  if (key.includes("interior")) return SIDEBAR_SVGS.interior;
  if (key.includes("workflow")) return SIDEBAR_SVGS.workflow;
  if (key.includes("pms")) return SIDEBAR_SVGS.pms;
  if (key.includes("task") || key.includes("todo")) return SIDEBAR_SVGS.task;
  if (key.includes("meet")) return SIDEBAR_SVGS.meeting;
  if (key.includes("register")) return SIDEBAR_SVGS.register;
  if (key.includes("site") || key.includes("inspect")) return SIDEBAR_SVGS.siteinspection;
  if (key.includes("attend")) return SIDEBAR_SVGS.attendance;
  if (key.includes("progress") || key.includes("report")) return SIDEBAR_SVGS.progressreport;
  if (key.includes("account")) return SIDEBAR_SVGS.accounts;
  if (key.includes("expense") || key.includes("file")) return SIDEBAR_SVGS.fileexpenses;
  if (key.includes("leave")) return SIDEBAR_SVGS.leave;
  if (key.includes("wallet") || key.includes("pay")) return SIDEBAR_SVGS.wallet;
  if (key.includes("location")) return SIDEBAR_SVGS.location;
  if (key.includes("social")) return SIDEBAR_SVGS.socialmedia;
  return SIDEBAR_SVGS[key] || (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
};

// ─── Icon Component ──────────────────────────
const Icon = memo(({ src, alt, className = "", iconName = "" }) => {
  const svg = getSidebarIcon(iconName || alt);
  if (svg) {
    return (
      <span className={`sb-item-icon ${className}`.trim()}>
        {svg}
      </span>
    );
  }
  return (
    <img
      className={`sb-item-icon ${className}`.trim()}
      src={src}
      alt={alt}
      onError={(e) => { e.currentTarget.style.display = "none"; }}
    />
  );
});

// ─────────────────────────────────────────────
//  NAV ATOMS  (all memo)
// ─────────────────────────────────────────────
const NavItem = memo(({ to, active, icon, label, iconClass = "", iconSvg = null }) => (
  <Link to={to} className={`sb-item${active ? " active" : ""}`}>
    {iconSvg ? (
      <span className="sb-item-icon">
        {iconSvg}
      </span>
    ) : icon ? (
      <Icon
        iconName={icon}
        src={`${FileUrl}/img/icons/${icon}`}
        alt={label}
        className={iconClass}
      />
    ) : null}
    <span>{label}</span>
  </Link>
));

const SubItem = memo(({ to, active, label }) => (
  <Link to={to} className={`sb-sub-item${active ? " active" : ""}`}>
    {label}
  </Link>
));

const DropToggle = memo(({ icon, label, open, onToggle, iconClass = "", iconSvg = null }) => (
  <div className="sb-item" onClick={onToggle}>
    {iconSvg ? (
      <span className="sb-item-icon">
        {iconSvg}
      </span>
    ) : icon ? (
      <Icon
        iconName={icon}
        src={`${FileUrl}/img/icons/${icon}`}
        alt={label}
        className={iconClass}
      />
    ) : null}
    <span>{label}</span>
    <Chevron open={open} />
  </div>
));

const SubMenu = memo(({ open, children }) =>
  open ? <div className="sb-sub">{children}</div> : null,
);

const SectionHead = memo(({ label }) => (
  <div className="sb-section">{label}</div>
));

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const Sidebar = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const segment1 = pathname.split("/")[1];

  const [open, setOpen] = useState(null);
  const toggle = useCallback(
    (name) => setOpen((prev) => (prev === name ? null : name)),
    [],
  );

  const [openSub, setOpenSub] = useState(null);
  const toggleSub = useCallback(
    (name) => setOpenSub((prev) => (prev === name ? null : name)),
    [],
  );

  // ── Role checks (don't change mid-session) ─
  const isAdmin = useMemo(() => superAccess(), []);
  const isEmployee = useMemo(() => isEmp(), []);
  const isHod = useMemo(() => ishod(), []);
  const isCordinator = useMemo(() => Cordinator(cordinator), []);
  const isAdminOrSubadmin = useMemo(
    () => superAccess([adminKey, subadmin]),
    [],
  );

  const myId = useMemo(() => getUserId(), []);

  // ── Subscription Feature Filtering ─────────
  const subscribedFeatures = useMemo(() => getCompanyFeatures(), []);

  const hasFeature = useCallback(
    (featureKey) => {
      // If features is null, tenant has full access (legacy / no limit)
      if (!subscribedFeatures) return true;
      return subscribedFeatures.includes(featureKey);
    },
    [subscribedFeatures]
  );

  const hasAnyFeature = useCallback(
    (...featureKeys) => {
      if (!subscribedFeatures) return true;
      return featureKeys.some((k) => subscribedFeatures.includes(k));
    },
    [subscribedFeatures]
  );

  // ── Active states ─────────────────────────
  const a = useMemo(
    () => ({
      dashboard: pathname === "/dashboard",
      team:
        pathname === `/${EmpRoute.list}` ||
        pathname === `/${EmpRoute.add}` ||
        segment1 === EmpRoute.edit,
      clients:
        pathname === `/${CustRoute.list}` ||
        pathname === `/${CustRoute.add}` ||
        segment1 === CustRoute.edit,
      village: pathname === `/${VillageRoute.list}`,
      city:pathname === `/${CityRoute.list}`,
      department: pathname === `/${DepartmentRoute.list}`,
      tpscheme: pathname === `/${TpschemeRoute.list}`,
      meetingMaster: pathname === `/${MeetingRoute.addteam}`,
      shift: pathname === `/${ShiftRoute.list}`,
      paymentcategory: pathname === `/${PaymentRoute.paymentlist}`,
      vendors: pathname === `/${VendorRoute.list}`,

      ledger: pathname === `/${LedgerRoute.list}`,
      operational:
        pathname === `/${MeetingRoute.operational_list}` ||
        segment1 === MeetingRoute.operationalview ||
        segment1 === MeetingRoute.performancelist,
      // tactical:
      //   pathname === `/${MeetingRoute.tacticallist}` ||
      //   segment1 === MeetingRoute.tacticalview ||
      //   segment1 === MeetingRoute.tacticalperformancelist,
      strategic:
        pathname === `/${MeetingRoute.strategiclist}` ||
        segment1 === MeetingRoute.strategicview ||
        segment1 === MeetingRoute.startegicperformancelist,
      tentative: pathname === `/${TentativeRoute.list}`,
      approval:
        pathname === `/${ApprovalRoute.approval_list}` ||
        pathname === `/${ApprovalRoute.add}` ||
        segment1 === ApprovalRoute.edit,
      architecture:
        pathname === `/${ArchitectureRoute.list}` ||
        pathname === `/${ArchitectureRoute.add}` ||
        segment1 === ArchitectureRoute.preview,
      interior:
        pathname === `/${InteriorRoute.list}` ||
        pathname === `/${InteriorRoute.add}` ||
        segment1 === InteriorRoute.preview,
      todos:
        pathname === `/${TodosRoute.list}` ||
        pathname === `/${TodosRoute.add}` ||
        segment1 === TodosRoute.edit,
      progressReport: pathname === `/${ProgressReportRoute.list}`,

      // workflow:
      //   pathname === `/${WorkflowRoute.list}` ||
      //   segment1 === WorkflowRoute.list,
      // pms:
      //   pathname === `/${PmsRoute.list}` ||
      //   pathname === `/${PmsRoute.add}` ||
      //   segment1 === PmsRoute.edit,
      inward:
        pathname === `/${InwardRoute.list}` ||
        pathname === `/${InwardRoute.add}`,
      outward:
        pathname === `/${OutwardRoute.list}` ||
        pathname === `/${OutwardRoute.add}`,
      deposit:
        pathname === `/${DepositExpenseRoute.list}` ||
        pathname === `/${DepositExpenseRoute.add}` ||
        segment1 === DepositExpenseRoute.edit,
      fileExpense:
        pathname === `/${FileExpenseRoute.list}` ||
        pathname === `/${FileExpenseRoute.add}` ||
        segment1 === FileExpenseRoute.edit,
      officeExpense:
        pathname === `/${OfficeExpenseRoute.list}` ||
        pathname === `/${OfficeExpenseRoute.add}` ||
        segment1 === OfficeExpenseRoute.edit,
      payments:
        pathname === `/${PaymentRoute.reports}` ||
        pathname === `/${PaymentRoute.add}` ||
        segment1 === PaymentRoute.edit,

      receipt:
        pathname === `/${ReceiptRoute.list}` ||
        pathname === `/${ReceiptRoute.add}` ||
        segment1 === ReceiptRoute.edit,

      paymentsExpense:
        pathname === `/${PaymentRoute.expense}` ||
        pathname === `/${PaymentRoute.addexpense}` ||
        segment1 === PaymentRoute.editexpense,

      escrowIncome:
        pathname === `/${PaymentRoute.escrowIncome}` ||
        pathname === `/${PaymentRoute.escrowincomeAdd}` ||
        segment1 === PaymentRoute.escrowincomeEdit,

      escrowExpense:
        pathname === `/${PaymentRoute.escrowExpense}` ||
        pathname === `/${PaymentRoute.escrowexpenseAdd}` ||
        segment1 === PaymentRoute.escrowexpenseEdit,
      escrowReports: pathname === `/${PaymentRoute.escrowReports}`,

      socialMedia:
        pathname === `/${CampaignRoute.list}` ||
        pathname === `/${CampaignRoute.add}` ||
        segment1 === CampaignRoute.detail ||
        pathname === `/${LeadsRoute.list}` ||
        segment1 === LeadsRoute.detail ||
        pathname === `/${PostRoute.list}`,
      campaign:
        pathname === `/${CampaignRoute.list}` ||
        pathname === `/${CampaignRoute.add}` ||
        segment1 === CampaignRoute.detail,
      leads:
        pathname === `/${LeadsRoute.list}` || segment1 === LeadsRoute.detail,
      post:
        pathname === `/${PostRoute.list}` ||
        pathname === `/${PostRoute.add}` ||
        segment1 === PostRoute.edit,
      attendanceAdmin:
        pathname === `/${AttendanceRoute.list}` ||
        segment1 === AttendanceRoute.edit,
      attendanceEmp:
        pathname === `/${AttendanceRoute.emplist}` ||
        segment1 === AttendanceRoute.edit,
      locationLive: pathname === `/${LocationRoute.location}`,
      locationMember: pathname === `/${LocationRoute.member}`,
      locationTeam: pathname === `/${LocationRoute.team}`,
      leave:
        pathname === `/${LeaveRoute.list}` ||
        pathname === `/${LeaveRoute.add}` ||
        segment1 === LeaveRoute.edit,
      siteAdmin:
        pathname === `/${SiteRoute.list}` ||
        pathname === `/${SiteRoute.add}` ||
        segment1 === SiteRoute.edit,
      siteEmp:
        pathname === `/${SiteRoute.emplist}` ||
        pathname === `/${SiteRoute.add}` ||
        segment1 === SiteRoute.preview,
      hrProfile: pathname === `/${EmpRoute.hrprofile}/${myId}`,
    }),
    [pathname, segment1, myId],
  );

  // ── Auto-expand dropdown if a child is active ─
  useMemo(() => {
    if (
      a.clients ||
      a.village ||
      a.city||
      a.department ||
      a.tpscheme ||
      a.meetingMaster ||
      a.shift ||
      a.paymentcategory ||
      a.vendors
    )
      setOpen("master");
    else if (a.operational || a.tactical || a.strategic) setOpen("meeting");
    else if (a.campaign || a.leads || a.post) setOpen("socialMedia");
    else if (a.inward || a.outward) setOpen("register");
    else if (
      a.deposit ||
      // a.fileExpense ||
      // a.officeExpense ||
      a.payments ||
      a.receipt ||
      a.paymentsExpense ||
      a.escrowIncome ||
      a.escrowExpense ||
      a.escrowReports
    )
      setOpen("accounts");
    else if (a.locationLive || a.locationMember || a.locationTeam)
      setOpen("location");
  }, [pathname]);
  const [isActive, setIsActive] = useState(false);

  return (
    <>
      <style>{CSS}</style>

      <aside className={`sb-root ${isActive ? "toggled" : ""}`}>
        <div
          className={`menu-icon ${isActive ? "toggled" : ""}`}
          onClick={() => setIsActive(!isActive)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 640"
            style={{ width: "32px" }}
          >
            <path
              fill="#fff"
              d="M96 160C96 142.3 110.3 128 128 128L512 128C529.7 128 544 142.3 544 160C544 177.7 529.7 192 512 192L128 192C110.3 192 96 177.7 96 160zM96 320C96 302.3 110.3 288 128 288L512 288C529.7 288 544 302.3 544 320C544 337.7 529.7 352 512 352L128 352C110.3 352 96 337.7 96 320zM544 480C544 497.7 529.7 512 512 512L128 512C110.3 512 96 497.7 96 480C96 462.3 110.3 448 128 448L512 448C529.7 448 544 462.3 544 480z"
            />
          </svg>
          {/* <span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path fill="rgb(38, 61, 102)" d="M183.1 137.4C170.6 124.9 150.3 124.9 137.8 137.4C125.3 149.9 125.3 170.2 137.8 182.7L275.2 320L137.9 457.4C125.4 469.9 125.4 490.2 137.9 502.7C150.4 515.2 170.7 515.2 183.2 502.7L320.5 365.3L457.9 502.6C470.4 515.1 490.7 515.1 503.2 502.6C515.7 490.1 515.7 469.8 503.2 457.3L365.8 320L503.1 182.6C515.6 170.1 515.6 149.8 503.1 137.3C490.6 124.8 470.3 124.8 457.8 137.3L320.5 274.7L183.1 137.4z"/></svg>
          </span> */}
        </div>
        {/* ── Logo ── */}
        <div className="sb-logo" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 14px" }}>
          <Link
            to={`/${dashboard.list}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={getCompanyLogo()}
              alt="Company Logo"
              style={{ maxHeight: 42, maxWidth: 170, objectFit: "contain", display: "block" }}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/img/logo.png";
              }}
            />
          </Link>
        </div>

        {/* ── Dashboard ── */}
        <NavItem
          to={`/${dashboard.list}`}
          active={a.dashboard}
          icon="Dashboard.svg"
          label="Dashboard"
        />

        {/* ── Team ── */}
        {hasFeature("Team") && (isAdmin || isCordinator) && (
          <NavItem
            to={`/${EmpRoute.list}`}
            active={a.team}
            icon="TeamMember.svg"
            label="Team Members"
          />
        )}

        {/* ── Master (admin only) ── */}
        {isAdmin && (
          <>
            <SectionHead label="Master Data" />
            <DropToggle
              icon="Master.svg"
              label="Master"
              open={open === "master"}
              onToggle={() => toggle("master")}
            />
            <SubMenu open={open === "master"}>
              <SubItem
                to={`/${CustRoute.list}`}
                active={a.clients}
                label="Clients"
              />
              <SubItem
                to={`/${VillageRoute.list}`}
                active={a.village}
                label="Village"
              />
               <SubItem
                to={`/${CityRoute.list}`}
                active={a.city}
                label="City"
              />
              <SubItem
                to={`/${DepartmentRoute.list}`}
                active={a.department}
                label="Department"
              />
              <SubItem
                to={`/${TpschemeRoute.list}`}
                active={a.tpscheme}
                label="TP Scheme"
              />
              {hasFeature("Meeting") && (
                <SubItem
                  to={`/${MeetingRoute.addteam}`}
                  active={a.meetingMaster}
                  label="Meeting"
                />
              )}
              {(hasFeature("Team") || hasFeature("HR")) && (
                <SubItem
                  to={`/${ShiftRoute.list}`}
                  active={a.shift}
                  label="Shift"
                />
              )}
              <SubItem
                to={`/${VendorRoute.list}`}
                active={a.vendors}
                label="Vendors"
              />
              {hasFeature("Finance") && (
                <SubItem
                  to={`/${LedgerRoute.list}`}
                  active={a.ledger}
                  label="Ledgers"
                />
              )}
            </SubMenu>
          </>
        )}

        {/* ── Projects ── */}
        {hasAnyFeature("Work", "Approval", "Architecture", "Interior") && (
          <>
            <SectionHead label="Projects" />
            {hasFeature("Work") && (
              <NavItem
                to={`/${TentativeRoute.list}`}
                active={a.tentative}
                icon="Tentetive.svg"
                label="Tentative"
                iconClass="white-icon"
              />
            )}
            {hasFeature("Approval") && (
              <NavItem
                to={`/${ApprovalRoute.approval_list}`}
                active={a.approval}
                icon="ApprovalProcess.svg"
                label="Approval Process"
              />
            )}
            {(isAdminOrSubadmin || isEmployee) && (
              <>
                {hasFeature("Architecture") && (
                  <NavItem
                    to={`/${ArchitectureRoute.list}`}
                    active={a.architecture}
                    icon="Architecture.svg"
                    label="Architecture"
                  />
                )}
                {hasFeature("Interior") && (
                  <NavItem
                    to={`/${InteriorRoute.list}`}
                    active={a.interior}
                    icon="Interior.svg"
                    label="Interior"
                  />
                )}
              </>
            )}
          </>
        )}

        {/* ── Work ── */}
        {hasAnyFeature("Work", "Meeting") && (
          <>
            <SectionHead label="Work" />
            {/* {hasFeature("Work") && (isAdmin || isHod) && (
              <NavItem
                to={`/${WorkflowRoute.list}`}
                active={a.workflow}
                icon="Task.svg"
                iconSvg={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="6" height="6" rx="1.5" />
                    <rect x="15" y="3" width="6" height="6" rx="1.5" />
                    <rect x="9" y="15" width="6" height="6" rx="1.5" />
                    <path d="M6 9v3a3 3 0 0 0 3 3h3" />
                    <path d="M18 9v3a3 3 0 0 1-3 3" />
                  </svg>
                }
                label="Workflow"
              />
            )} */}
            {hasFeature("Work") && (isAdminOrSubadmin || isEmployee) && (
              <NavItem
                to={`/${TodosRoute.list}`}
                active={a.todos}
                icon="Task.svg"
                label="Task"
              />
            )}

            {/* Progress Report */}
            {(isAdminOrSubadmin || isEmployee) && (
              <NavItem
                to={`/${ProgressReportRoute.list}`}
                active={a.progressReport}
                icon="Dashboard.svg"
                iconSvg={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                }
                label="Progress Report"
              />
            )}

            {/* {hasFeature("Work") && (
              <NavItem
                to={`/${PmsRoute.list}`}
                active={a.pms}
                icon="Task.svg"
                label="PMS"
              />
            )} */}

            {/* Meeting dropdown */}
            {hasFeature("Meeting") && (
              <>
                <DropToggle
                  icon="Meeting.svg"
                  label="Meeting"
                  open={open === "meeting"}
                  onToggle={() => toggle("meeting")}
                />
                <SubMenu open={open === "meeting"}>
                  <SubItem
                    to={`/${MeetingRoute.operational_list}`}
                    active={a.operational}
                  label="Daily Overview Meeting"
                  />
                  {/* <SubItem
                    to={`/${MeetingRoute.tacticallist}`}
                    active={a.tactical}
                    label="Tactical"
                  /> */}
                  <SubItem
                    to={`/${MeetingRoute.strategiclist}`}
                    active={a.strategic}
                    label="Monthly Review Meeting"
                  />
                </SubMenu>
              </>
            )}

            {/* Register dropdown */}
            {hasFeature("Work") && (
              <>
                <DropToggle
                  icon="SiteInspection.svg"
                  label="Register"
                  open={open === "register"}
                  onToggle={() => toggle("register")}
                />
                <SubMenu open={open === "register"}>
                  <SubItem
                    to={`/${InwardRoute.list}`}
                    active={a.inward}
                    label="Inward"
                  />
                  <SubItem
                    to={`/${OutwardRoute.list}`}
                    active={a.outward}
                    label="Outward"
                  />
                </SubMenu>
              </>
            )}
          </>
        )}

        {/* ── Social Media (Hidden) ── */}
        {/* {hasAnyFeature("Social Media", "Leads") && (
          <>
            <SectionHead label="Social Media" />
            <DropToggle
              icon="Attendance.svg"
              label="Social Media"
              open={open === "socialMedia"}
              onToggle={() => toggle("socialMedia")}
            />
            <SubMenu open={open === "socialMedia"}>
              {hasFeature("Social Media") && (
                <SubItem
                  to={`/${CampaignRoute.list}`}
                  active={a.campaign}
                  label="Campaign"
                />
              )}
              {hasFeature("Leads") && (
                <SubItem to={`/${LeadsRoute.list}`} active={a.leads} label="Leads" />
              )}
              {hasFeature("Social Media") && (
                <SubItem to={`/${PostRoute.list}`} active={a.post} label="Post" />
              )}
            </SubMenu>
          </>
        )} */}

        {/* ── Finance / Accounts (Hidden) ── */}
        {/* {hasFeature("Finance") && (isAdmin || myId === 290) && (
          <>
            <SectionHead label="Finance" />
            <DropToggle
              icon="FileExpenses.svg"
              label="Accounts"
              open={open === "accounts"}
              onToggle={() => toggle("accounts")}
            />
            <SubMenu open={open === "accounts"}>
              {isAdmin && (
                <SubItem
                  to={`/${DepositExpenseRoute.list}`}
                  active={a.deposit}
                  label="Deposit"
                />
              )}
              <SubItem
                to={`/${PaymentRoute.reports}`}
                active={a.payments}
                label="Reports"
              />
              <SubItem
                to={`/${ReceiptRoute.list}`}
                active={a.receipt}
                label="Receipts"
              />
              <SubItem
                to={`/${PaymentRoute.expense}`}
                active={a.paymentsExpense}
                label="Payment"
              />
              <SubToggle
                open={openSub === "escrow"}
                onToggle={() => toggleSub("escrow")}
              />
              <SubSubMenu open={openSub === "escrow"}>
                <SubItem
                  to={`/${PaymentRoute.escrowIncome}`}
                  active={a.escrowIncome}
                  label="Income"
                />
                <SubItem
                  to={`/${PaymentRoute.escrowExpense}`}
                  active={a.escrowExpense}
                  label="Expense"
                />
                <SubItem
                  to={`/${PaymentRoute.escrowReports}`}
                  active={a.escrowReports}
                  label="Reports"
                />
              </SubSubMenu>
            </SubMenu>
          </>
        )} */}

        {/* ── HR ── */}
        {hasAnyFeature("HR", "Team") && (
          <>
            <SectionHead label="HR" />
            {isAdmin ? (
              <NavItem
                to={`/${AttendanceRoute.list}`}
                active={a.attendanceAdmin}
                icon="Attendance.svg"
                label="Attendance"
              />
            ) : isEmployee ? (
              <NavItem
                to={`/${AttendanceRoute.emplist}`}
                active={a.attendanceEmp}
                icon="Attendance.svg"
                label="Attendance"
              />
            ) : null}

            {isEmployee && (
              <>
                {hasFeature("HR") && (
                  <NavItem
                    to={`/${LeaveRoute.list}`}
                    active={a.leave}
                    icon="Leave.svg"
                    label="Leaves"
                  />
                )}
                {/* {hasAnyFeature("HR", "Finance") && !isCordinator && (
                  <NavItem
                    to={`/${EmpRoute.deposit_expense_report}/${getUserId()}`}
                    active={false}
                    icon="Wallet.svg"
                    label="Wallet"
                  />
                )} */}
                <NavItem
                  to={`/${EmpRoute.hrprofile}/${myId}`}
                  active={a.hrProfile}
                  icon="TeamMember.svg"
                  label="My HR Profile"
                />
              </>
            )}
          </>
        )}

        {/* Site Inspection */}
        {hasFeature("Site Inspection") && (
          isAdmin ? (
            <NavItem
              to={`/${SiteRoute.list}`}
              active={a.siteAdmin}
              icon="SiteInspection.svg"
              label="Site Inspection"
            />
          ) : isEmployee ? (
            <NavItem
              to={`/${SiteRoute.emplist}`}
              active={a.siteEmp}
              icon="SiteInspection.svg"
              label="Site Inspection"
            />
          ) : null
        )}

        {/* Location — admin only */}
        {hasFeature("Location") && isAdmin && (
          <>
            <DropToggle
              icon="Master.svg"
              label="Location"
              open={open === "location"}
              onToggle={() => toggle("location")}
            />
            <SubMenu open={open === "location"}>
              <SubItem
                to={`/${LocationRoute.location}`}
                active={a.locationLive}
                label="Live Overview"
              />
              <SubItem
                to={`/${LocationRoute.member}`}
                active={a.locationMember}
                label="Member History"
              />
              <SubItem
                to={`/${LocationRoute.team}`}
                active={a.locationTeam}
                label="Team Snapshot"
              />
            </SubMenu>
          </>
        )}

        <div className="sb-spacer" />
      </aside>
    </>
  );
};

export default memo(Sidebar);
