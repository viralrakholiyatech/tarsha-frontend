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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  team: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  master: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
  tentative: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  approval: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  architecture: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  ),
  interior: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  task: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  meeting: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  siteinspection: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  attendance: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  fileexpenses: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  ),
  leave: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  ),
  wallet: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
      <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
      <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
    </svg>
  ),
  location: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  socialmedia: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
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
  if (key.includes("task") || key.includes("todo") || key.includes("workflow") || key.includes("pms")) return SIDEBAR_SVGS.task;
  if (key.includes("meet")) return SIDEBAR_SVGS.meeting;
  if (key.includes("site") || key.includes("inspect")) return SIDEBAR_SVGS.siteinspection;
  if (key.includes("attend")) return SIDEBAR_SVGS.attendance;
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
              {/* {hasFeature("Finance") && (
                <>
                  <SubItem
                    to={`/${VendorRoute.list}`}
                    active={a.vendors}
                    label="Vendors"
                  />
                  <SubItem
                    to={`/${LedgerRoute.list}`}
                    active={a.ledger}
                    label="Ledgers"
                  />
                </>
              )} */}
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
