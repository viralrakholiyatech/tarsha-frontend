

import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FileUrl } from "../../../config/file_url";
import {
  EmpRoute, FilesRoute, FileExpenseRoute, OfficeExpenseRoute,
  DepositExpenseRoute, TodosRoute, SearchRoute, SiteRoute,
} from "../../../config/RouteConfig";
import {
  Cordinator, isAdmin, getFullName, getUserProfilePic,
  isEmp, ishod, superAccess, getCompanyFeatures,
} from "../../../services/useLocalStorage";
import { useForm } from "react-hook-form";
import { adminKey, subadmin } from "../../../config/RoleConfig";
import { getRole } from "../../../services/useLocalStorage";
import ApiService from "../../../services/ApiService";
import { AuthHeader } from "../../../services/FormCommon";
import {
  getNotification_admin, getNotification_employee, SendToSeenNotification,
} from "../../../config/config";
import { GetDate, GetTime } from "../../../services/DateAndTimeService";
import AddModal from "../../MainPages/client/Add";
import jwt_decode from "jwt-decode";
import toast from "react-hot-toast";


// ─────────────────────────────────────────────
//  🎨  THEME
// ─────────────────────────────────────────────
const THEME = {
  brand:      "#887549",
  brandLight: "#F5F0E8",
  brandMid:   "#C4A97D",
  brandDark:  "#5C4E32",
  bg:         "#F8F5F0",
  border:     "#EDE5D5",
  text:       "#1A1A2E",
  textMuted:  "#ADADAD",
  textLight:  "#BDBDBD",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

  /* ── Header ── */
  .hdr-root {
    position:sticky;top:0;z-index:100;
    background:#fff;border-bottom:1.5px solid ${THEME.border};
    padding:0 24px;height:60px;
    display:flex;align-items:center;justify-content:space-between;
    gap:12px;font-family:'DM Sans',sans-serif;
    box-shadow:0 2px 12px rgba(136,117,73,0.07);
  }

  /* ── Search ── */
  .hdr-search {
    padding:8px 14px 8px 38px;border-radius:10px;border:1.5px solid #E0D5C5;
    font-size:13px;font-family:'DM Sans',sans-serif;color:#1A1A2E;
    outline:none;background:#fff;width:220px;
    transition:border-color 0.15s,box-shadow 0.15s;
  }
  .hdr-search:focus { border-color:${THEME.brand};box-shadow:0 0 0 3px ${THEME.brand}18; }
  .hdr-search::placeholder { color:${THEME.textLight}; }

  /* ── Add button ── */
  .hdr-add-btn {
    padding:7px 16px;border-radius:10px;border:none;
    background:${THEME.brand};color:#fff;font-size:13px;font-weight:700;
    cursor:pointer;font-family:'Sora',sans-serif;transition:all 0.18s;
    display:inline-flex;align-items:center;gap:5px;
    box-shadow:0 2px 8px ${THEME.brand}44;white-space:nowrap;
  }
  .hdr-add-btn:hover { background:${THEME.brandDark}; }

  /* ── Icon button ── */
  .hdr-icon-btn {
    width:36px;height:36px;border-radius:10px;border:1.5px solid ${THEME.border};
    background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;
    font-size:18px;transition:all 0.15s;position:relative;flex-shrink:0;
  }
  .hdr-icon-btn:hover { background:${THEME.brandLight};border-color:${THEME.brand}; }

  /* ── Badge ── */
  .hdr-badge {
    position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;
    background:${THEME.brand};color:#fff;font-size:9px;font-weight:800;
    display:flex;align-items:center;justify-content:center;border:2px solid #fff;
  }

  /* ── Dropdown panel ── */
  .hdr-dropdown {
    position:absolute;top:calc(100% + 8px);z-index:300;
    background:#fff;border:1.5px solid ${THEME.border};border-radius:14px;
    box-shadow:0 8px 32px rgba(0,0,0,0.12);overflow:hidden;
  }

  /* ── Add menu items ── */
  .hdr-menu-item {
    display:flex;align-items:center;gap:10px;padding:10px 16px;
    font-size:13px;font-weight:600;color:${THEME.text};text-decoration:none;
    transition:background 0.15s;cursor:pointer;border:none;background:transparent;
    width:100%;text-align:left;font-family:'DM Sans',sans-serif;white-space:nowrap;
  }
  .hdr-menu-item:hover { background:${THEME.brandLight};color:${THEME.brand}; }
  .hdr-menu-icon {
    width:32px;height:32px;border-radius:8px;background:${THEME.brandLight};
    display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px;
  }

  /* ── Notification items ── */
  .hdr-notif-item {
    display:flex;gap:10px;padding:10px 16px;border-bottom:1px solid ${THEME.border};
    transition:background 0.15s;cursor:pointer;
  }
  .hdr-notif-item:hover { background:${THEME.brandLight}; }
  .hdr-notif-item:last-child { border-bottom:none; }
  .hdr-notif-acc {
    padding:10px 16px;border-bottom:1px solid ${THEME.border};
  }
  .hdr-notif-acc:last-child { border-bottom:none; }
  .hdr-notif-acc-header {
    display:flex;justify-content:space-between;align-items:center;
    cursor:pointer;gap:8px;
  }
  .hdr-notif-acc-body { padding:8px 0 2px;font-size:11px;color:${THEME.textMuted}; }

  /* ── Avatar ── */
  .hdr-avatar {
    width:34px;height:34px;border-radius:50%;object-fit:cover;
    border:2px solid ${THEME.border};cursor:pointer;flex-shrink:0;
    transition:border-color 0.15s;
  }
  .hdr-avatar:hover { border-color:${THEME.brand}; }

  /* ── User dropdown ── */
  .hdr-user-dropdown { right:0;min-width:160px; }
  .hdr-user-name { font-size:13px;font-weight:600;color:${THEME.text};max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }

  /* ── Mobile menu btn ── */
  .hdr-hamburger { display:none; }
  @media (max-width:768px) { .hdr-hamburger { display:flex; } .hdr-search-wrap { display:none !important; } }

  @keyframes hdrSlideDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
  .hdr-dropdown { animation:hdrSlideDown 0.15s ease both; }
`;


// ─────────────────────────────────────────────
//  QUICK-CLOSE HOOK
// ─────────────────────────────────────────────
function useClickOutside(ref, onClose) {
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
}


// ─────────────────────────────────────────────
//  ADD MENU ITEMS CONFIG
// ─────────────────────────────────────────────
function AddMenu({ userId, onAddClient, onClose }) {
  const feats = getCompanyFeatures();
  const hasFeature = (key) => (!feats ? true : feats.includes(key));
  const hasAnyFeature = (...keys) => (!feats ? true : keys.some((k) => feats.includes(k)));

  const items = [
    { show: (isAdmin() || ishod()) && hasAnyFeature("Work", "Architecture", "Interior"), icon:"📂", label:"Project",       to:`/${FilesRoute.add}` },
    { show: isEmp() && hasAnyFeature("HR", "Team"),                                       icon:"👤", label:"Profile",       to:`/${EmpRoute.EditProfile}/${userId}` },
    { show: !isEmp() && hasFeature("Team"),                                               icon:"👥", label:"Team",          to:`/${EmpRoute.add}` },
    { show: (isAdmin() || Cordinator() || ishod()) && hasFeature("Work"),                 icon:"✅", label:"Todo",          to:`/${TodosRoute.add}` },
    { show: superAccess([adminKey]) && hasAnyFeature("Leads", "Work"),                   icon:"🤝", label:"Client",        onClick:() => { onAddClient(); onClose(); } },
    { show: superAccess([adminKey]) && hasFeature("Finance"),                            icon:"💰", label:"Deposit",       to:`/${DepositExpenseRoute.add}` },
    { show: hasFeature("Finance"),                                                        icon:"🧾", label:"File Expense",  to:`/${FileExpenseRoute.add}` },
    { show: hasFeature("Finance"),                                                        icon:"🏢", label:"Office Expense",to:`/${OfficeExpenseRoute.add}` },
    { show: hasFeature("Site Inspection"),                                                icon:"📍", label:"Site Inspection",to:`/${SiteRoute.add}` },
  ].filter((i) => i.show);

  return (
    <div style={{ minWidth:200 }}>
      <div style={{ padding:"10px 16px 6px", borderBottom:`1px solid ${THEME.border}` }}>
        <p style={{ margin:0, fontSize:10, fontWeight:700, color:THEME.textMuted, textTransform:"uppercase", letterSpacing:"0.07em" }}>Quick Add</p>
      </div>
      {items.length === 0 ? (
        <div style={{ padding:"14px 16px", textAlign:"center", fontSize:12, color:THEME.textMuted }}>
          No quick actions available
        </div>
      ) : (
        items.map((item) => (
          item.onClick ? (
            <button key={item.label} className="hdr-menu-item" onClick={() => { item.onClick(); onClose(); }}>
              <span className="hdr-menu-icon">{item.icon}</span>
              {item.label}
            </button>
          ) : (
            <Link key={item.label} className="hdr-menu-item" to={item.to} onClick={onClose}>
              <span className="hdr-menu-icon">{item.icon}</span>
              {item.label}
            </Link>
          )
        ))
      )}
    </div>
  );
}


// ─────────────────────────────────────────────
//  NOTIFICATION PANEL
// ─────────────────────────────────────────────
function NotifPanel({ adminNotifs, empNotifs, onClear, onClearAdmin, onClearAllAdmin, onNavigate, onClose }) {
  const [expanded, setExpanded] = useState(null);
  const isAdminUser = superAccess([adminKey, subadmin]);
  const list        = isAdminUser ? adminNotifs : empNotifs;
  const total       = list.length;

  return (
    <div style={{ width:360, maxHeight:420, display:"flex", flexDirection:"column" }}>
      {/* Header */}
      <div style={{ padding:"12px 16px", borderBottom:`1px solid ${THEME.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <h3 style={{ margin:0, fontSize:13, fontWeight:800, color:THEME.text, fontFamily:"'Sora',sans-serif" }}>Notifications</h3>
          {total > 0 && (
            <span style={{ padding:"1px 8px", borderRadius:20, fontSize:10, fontWeight:800, background:THEME.brand, color:"#fff" }}>{total}</span>
          )}
        </div>
        {total > 0 && (
          <button
            onClick={onClearAllAdmin}
            style={{ padding:"4px 10px", borderRadius:6, border:"none", background:"#CF1322", color:"#fff", fontSize:10, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"opacity 0.15s" }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
          >
            Clear All
          </button>
        )}
      </div>

      {/* List */}
      <div style={{ overflowY:"auto", flex:1 }}>
        {total === 0 ? (
          <div style={{ textAlign:"center", padding:"40px 0" }}>
            <div style={{ fontSize:32, marginBottom:8 }}>🔔</div>
            <p style={{ color:THEME.textLight, fontSize:13, margin:0 }}>No new notifications</p>
          </div>
        ) : isAdminUser ? (
          adminNotifs.map((n, i) => (
            <div key={n.id} className="hdr-notif-acc">
              <div className="hdr-notif-acc-header" onClick={() => setExpanded(expanded === i ? null : i)}>
                <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, minWidth:0 }}>
                  <div style={{ width:32, height:32, borderRadius:50, background:THEME.brandLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>📋</div>
                  <p style={{ margin:0, fontSize:12, fontWeight:600, color:THEME.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {n.table_name} — {n.json_data?.message || ""}
                  </p>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <button onClick={(e) => { e.stopPropagation(); onClearAdmin(i, n.id); }} style={{ width:20, height:20, borderRadius:50, border:"none", background:"#f0f0f0", cursor:"pointer", fontSize:10, color:THEME.textMuted, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                  <span style={{ fontSize:10, color:THEME.textMuted, flexShrink:0 }}>{expanded === i ? "▲" : "▼"}</span>
                </div>
              </div>
              {expanded === i && (
                <div className="hdr-notif-acc-body">
                  <p style={{ margin:"2px 0" }}><strong>{n.fullname}</strong></p>
                  <p style={{ margin:"2px 0" }}>{new Date(n.created_at).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })} · {GetTime(n.created_at, "hh:mm:ss A")}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          empNotifs.map((n, i) => (
            <div key={n.id} className="hdr-notif-item">
              <div style={{ width:32, height:32, borderRadius:50, background:THEME.brandLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>🔔</div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ margin:"0 0 2px", fontSize:12, fontWeight:700, color:THEME.text }}>{n.json_data?.title || "Task Update"}</p>
                <p style={{ margin:"0 0 4px", fontSize:11, color:THEME.textMuted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{n.json_data?.message}</p>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:10, color:THEME.textLight }}>{GetDate(n.created_at, "DD-MM-YYYY")} {GetTime(n.created_at, "hh:mm A")}</span>
                  <button onClick={() => { onNavigate(`/${TodosRoute.markTodo}/${n.child_id}`, n.id); onClose(); }}
                    style={{ padding:"2px 8px", borderRadius:6, border:`1px solid ${THEME.brand}`, background:THEME.brandLight, color:THEME.brand, fontSize:10, fontWeight:700, cursor:"pointer" }}>
                    View →
                  </button>
                </div>
              </div>
              <button onClick={() => onClear(i, n.id)} style={{ width:20, height:20, borderRadius:50, border:"none", background:"#f0f0f0", cursor:"pointer", fontSize:10, color:THEME.textMuted, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const Header = (props) => {
  const navigate  = useNavigate();
  const location  = useLocation();

  const { register, handleSubmit } = useForm({ mode:"onChange" });

  const [showAddMenu,  setShowAddMenu]  = useState(false);
  const [showNotif,    setShowNotif]    = useState(false);
  const [showUser,     setShowUser]     = useState(false);
  const [showModal,    setShowModal]    = useState(false);
  const [userId,       setUserId]       = useState("");
  const [adminNotifs,  setAdminNotifs]  = useState([]);
  const [empNotifs,    setEmpNotifs]    = useState([]);

  const addRef   = useRef();
  const notifRef = useRef();
  const userRef  = useRef();
  const prevNotifIdsRef = useRef(new Set());
  const dismissedIdsRef = useRef(new Set());

  useClickOutside(addRef,   () => setShowAddMenu(false));
  useClickOutside(notifRef, () => setShowNotif(false));
  useClickOutside(userRef,  () => setShowUser(false));

  // ── Decode userId ─────────────────────────
  useEffect(() => {
    try {
      const userinfo = JSON.parse(localStorage.getItem("userinfo"));
      if (userinfo?.token) {
        const decoded = jwt_decode(userinfo.token);
        setUserId(decoded.id);
      }
    } catch (e) { console.error(e); }
  }, []);


  const safeJson = (str) => { try { return JSON.parse(str); } catch { return {}; } };



  // ── Actions ───────────────────────────────
  const onSubmit = (data) => navigate(`/${SearchRoute.list}/${data.key}`);

  const doLogout = () => {
    ["userinfo", "token", "login_time", "wallet", "path", "company_features"].forEach((k) =>
      localStorage.removeItem(k)
    );
    navigate("/", { state: { name: location }, replace: true });
  };

  const handleMenuClick = () => document.body.classList.toggle("menu-open");

  const clearEmpNotif = (i, id) => {
    if (id) {
      dismissedIdsRef.current.add(id);
      ApiService({ id }, 0, AuthHeader(), SendToSeenNotification.method, SendToSeenNotification.url);
    }
    const updated = [...empNotifs];
    updated.splice(i, 1);
    setEmpNotifs(updated);
  };

  const clearAdminNotif = (i, id) => {
    if (id) {
      dismissedIdsRef.current.add(id);
      ApiService({ id }, 0, AuthHeader(), SendToSeenNotification.method, SendToSeenNotification.url);
    }
    const updated = [...adminNotifs];
    updated.splice(i, 1);
    setAdminNotifs(updated);
  };

  const clearAllAdminNotif = () => {
    adminNotifs.forEach(n => {
      if (n.id) {
        dismissedIdsRef.current.add(n.id);
        ApiService({ id: n.id }, 0, AuthHeader(), SendToSeenNotification.method, SendToSeenNotification.url);
      }
    });
    setAdminNotifs([]);
  };

  const handleNavigate = (route, id) => {
    ApiService({ id }, 0, AuthHeader(), SendToSeenNotification.method, SendToSeenNotification.url);
    navigate(route);
  };

  const totalNotifs = superAccess([adminKey, subadmin]) ? adminNotifs.length : empNotifs.length;

  return (
    <>
      <style>{CSS}</style>

      <header className="hdr-root">

        {/* ── Left: hamburger + page title ── */}
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button className="hdr-icon-btn hdr-hamburger" onClick={handleMenuClick} title="Menu">
            <svg fill={THEME.brand} width="18" height="18" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M3 6h18a1 1 0 0 1 0 2H3a1 1 0 0 1 0-2zm0 5h18a1 1 0 0 1 0 2H3a1 1 0 0 1 0-2zm0 5h18a1 1 0 0 1 0 2H3a1 1 0 0 1 0-2z"/>
            </svg>
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:3, height:18, borderRadius:2, background:`linear-gradient(180deg,${THEME.brand},${THEME.brandMid})` }} />
            <h1 style={{ margin:0, fontSize:16, fontWeight:800, color:THEME.text, fontFamily:"'Sora',sans-serif" }}>
              {props.headerTitle || window.location.pathname.split("/")[1] || "Dashboard"}
            </h1>
          </div>
        </div>

        {/* ── Right: search + actions ── */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>

        

          {/* Add + menu */}
          <div style={{ position:"relative" }} ref={addRef}>
            <button className="hdr-add-btn" onClick={() => { setShowAddMenu((o) => !o); setShowNotif(false); setShowUser(false); }}>
              + Add
            </button>
            {showAddMenu && (
              <div className="hdr-dropdown" style={{ right:0 }}>
                <AddMenu userId={userId} onAddClient={() => setShowModal(true)} onClose={() => setShowAddMenu(false)} />
              </div>
            )}
          </div>

          {/* Notification bell */}
          <div style={{ position:"relative" }} ref={notifRef}>
            <button className="hdr-icon-btn" title="Notifications"
              onClick={() => { setShowNotif((o) => !o); setShowAddMenu(false); setShowUser(false); }}>
              🔔
              {totalNotifs > 0 && (
                <span className="hdr-badge">{totalNotifs > 9 ? "9+" : totalNotifs}</span>
              )}
            </button>
            {showNotif && (
              <div className="hdr-dropdown" style={{ right:0 }}>
                <NotifPanel
                  adminNotifs={adminNotifs}
                  empNotifs={empNotifs}
                  onClear={clearEmpNotif}
                  onClearAdmin={clearAdminNotif}
                  onClearAllAdmin={clearAllAdminNotif}
                  onNavigate={handleNavigate}
                  onClose={() => setShowNotif(false)}
                />
              </div>
            )}
          </div>

          {/* User avatar + logout */}
          <div style={{ position:"relative" }} ref={userRef}>
            <div style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}
              onClick={() => { setShowUser((o) => !o); setShowAddMenu(false); setShowNotif(false); }}>
              <img
                className="hdr-avatar"
                src={getUserProfilePic()}
                alt="profile"
                onError={(e) => { e.target.src = "https://webappapi.zaidexceldesign.com/public/img/profile.jpeg"; }}
              />
              <span className="hdr-user-name">{getFullName()}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={THEME.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
            {showUser && (
              <div className="hdr-dropdown hdr-user-dropdown" style={{ right:0 }}>
                <div style={{ padding:"12px 16px", borderBottom:`1px solid ${THEME.border}` }}>
                  <p style={{ margin:0, fontSize:12, fontWeight:700, color:THEME.text }}>{getFullName()}</p>
                  <p style={{ margin:"2px 0 0", fontSize:11, color:THEME.textMuted }}>
                    {getRole() === adminKey ? "Admin" : isEmp() ? "Employee" : "User"}
                  </p>
                </div>
                <button
                  onClick={doLogout}
                  style={{ width:"100%", padding:"10px 16px", border:"none", background:"transparent", cursor:"pointer", textAlign:"left", fontSize:13, fontWeight:600, color:"#CF1322", display:"flex", alignItems:"center", gap:8, fontFamily:"'DM Sans',sans-serif", transition:"background 0.15s" }}
                  onMouseEnter={(e) => e.currentTarget.style.background="#FFF1F0"}
                  onMouseLeave={(e) => e.currentTarget.style.background="transparent"}
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <AddModal show={showModal} handleClose={() => setShowModal(false)} />
    </>
  );
};

export default Header;































// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { useNavigate, useLocation } from "react-router-dom";
// import $ from "jquery";
// import { FileUrl } from "../../../config/file_url";
// import {
//   EmpRoute,
//   FilesRoute,
//   FileExpenseRoute,
//   OfficeExpenseRoute,
//   DepositExpenseRoute,
//   TodosRoute,
//   SearchRoute,
//   SiteRoute,
// } from "../../../config/RouteConfig";
// import { image2svg } from "../../../UtilsComponent/UtilFunctions";
// import {
//   Cordinator,
//   isAdmin,
//   getFullName,
//   getUserProfilePic,
//   isEmp,
//   ishod,
//   superAccess,
// } from "../../../services/useLocalStorage";
// import { useForm } from "react-hook-form";
// import { adminKey, subadmin } from "../../../config/RoleConfig";
// import { getRole } from "../../../services/useLocalStorage";
// import ApiService from "../../../services/ApiService";
// import { AuthHeader } from "../../../services/FormCommon";
// import {
//   getNotification_admin,
//   getNotification_employee,
//   SendToSeenNotification,
// } from "../../../config/config";
// import { GetDate, GetTime } from "../../../services/DateAndTimeService";
// import AddModal from "../../MainPages/client/Add";
// import jwt_decode from "jwt-decode";
// import { Accordion, Tab, Nav } from "react-bootstrap";

// const Header = (props) => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const {
//     register,
//     formState: { errors },
//     handleSubmit,
//   } = useForm({
//     mode: "onChange",
//   });

//   const handleMenuClick = () => {
//     document.body.classList.toggle("menu-open");
//   };
//   const handleCloseMenu = () => {
//     document.body.classList.remove("menu-open");
//   };

//   const [notifications, setNotifications] = useState([]);

//   const [todoNotification, setTodoNotification] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [todoNotification_forOthers, setTodoNotification_forOthers] = useState(
//     []
//   );
//   const [userId, setUserId] = useState("");

//   useEffect(() => {
//     const userinfo = JSON.parse(localStorage.getItem("userinfo"));
//     const token = userinfo.token;
//     if (token) {
//       const decodedToken = jwt_decode(token);
//       const userId = decodedToken.id;
//       setUserId(userId);
//     }
//   }, []);

//   const handleShowModal = () => setShowModal(true);
//   const handleCloseModal = () => setShowModal(false);

//   const notificationTodo = async () => {
//     try {
//       if (superAccess([adminKey, subadmin])) {
//         const res = await ApiService(
//           null,
//           0,
//           AuthHeader(),
//           getNotification_admin.method,
//           getNotification_admin.url
//         );
//         if (!res?.data?.error) {
//           const data1 = res?.data?.data;

//           if (Array.isArray(data1) && data1?.length) {
//             const arr = [];
//             for (let d of data1) {
//               const data = {
//                 id: d?.id,
//                 json_data: validJson(d?.json_data)
//                   ? JSON.parse(d?.json_data)
//                   : {},
//                 table_name: d?.table_name,
//                 fullname: d?.fullname,
//                 child_id: d?.child_id,
//                 created_at: d?.created_at,
//               };

//               arr.push(data);
//             }
//             setTodoNotification(arr);
//           }
//         } else {
//         }
//       }

//       if (isEmp()) {
//         const res = await ApiService(
//           null,
//           0,
//           AuthHeader(),
//           getNotification_employee.method,
//           getNotification_employee.url
//         );
//         if (!res?.data?.error) {
//           const data1 = res?.data?.data;
//           if (Array.isArray(data1) && data1?.length) {
//             const arr = [];
//             for (let d of data1) {
//               const data = {
//                 id: d?.id,
//                 json_data: validJson(d?.json_data),
//                 table_name: d?.table_name,
//                 child_id: d?.child_id,
//                 created_at: d?.created_at,
//               };

//               arr.push(data);
//             }
//             setTodoNotification_forOthers(arr);
//           }
//         } else {
//         }
//       }
//     } catch (err) {
//       console.log(err);
//       toast.error(`${err?.response?.data?.message}`);
//     }
//   };

//   const validJson = (jsonString) => {
//     try {
//       return JSON.parse(jsonString);
//     } catch (err) {
//       console.log(err);
//       return {};
//     }
//   };

//   const onSubmit = async (data) => {
//     navigate(`/${SearchRoute.list}/${data?.key}`);
//   };

//   const doLogout = () => {
//     localStorage.removeItem("userinfo");
//     localStorage.removeItem("wallet");
//     localStorage.removeItem("path");
//     navigate("/", { state: { name: location }, replace: true });
//   };


//   const seenNotification = (route, data = null, fireApi = false, index) => {
//     if (fireApi) {
//       ApiService(
//         data,
//         0,
//         AuthHeader(),
//         SendToSeenNotification.method,
//         SendToSeenNotification.url
//       );
//     }
//     clearMessage(index);
//     // Navigate to the specified route if needed
//     if (route) {
//       if (fireApi) {
//         ApiService(
//           data,
//           0,
//           AuthHeader(),
//           SendToSeenNotification.method,
//           SendToSeenNotification.url
//         );
//       }
//       navigate(`${route}`);
//     }
//   };

//   const clearMessage = (index) => {
//     const updatedNotifications = [...todoNotification];
//     updatedNotifications.splice(index, 1);
//     setTodoNotification(updatedNotifications);
//   };

//   useEffect(() => {
//     image2svg();
//     $(".toggle__menu").on("click", function (e) {
//       e.preventDefault();
//       $(this).toggleClass("open");
//       $("body").toggleClass("sidebar-toggle");
//     });
//   }, []);

//   useEffect(() => {
//     notificationTodo();
//   }, [window.location.pathname]);

//   return (
//     <>
//       <a className="close_menu" onClick={handleCloseMenu}>
//         <svg
//           width="20px"
//           height="20px"
//           viewBox="0 0 1.2 1.2"
//           fill="none"
//           xmlns="http://www.w3.org/2000/svg"
//         >
//           <path
//             width="48"
//             height="48"
//             fill="white"
//             fillOpacity="0.01"
//             d="M0 0H1.2V1.2H0V0z"
//           />
//           <path
//             d="m0.2 0.2 0.8 0.8"
//             stroke="#ffffff"
//             strokeWidth="0.1"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//           />
//           <path
//             d="M0.2 1 1 0.2"
//             stroke="#ffffff"
//             strokeWidth="0.1"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//           />
//         </svg>
//       </a>
//       <header className="header navbar navbar-expand justify-content-between">
//         <div className="page-title">
//           <h1 className="h4 mb-0">
//             {props?.headerTitle
//               ? props.headerTitle
//               : window.location.pathname.split("/")[1]}
//           </h1>
//         </div>
//         <div className="header-action-form d-flex gap-2 ml-lg-2 ml-0">
//           <a
//             className="menu_icon d-flex align-items-center d-lg-none d-block"
//             onClick={handleMenuClick}
//           >
//             <svg
//               fill="#887549"
//               width="24px"
//               height="24px"
//               viewBox="0 0 0.72 0.72"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 fillRule="evenodd"
//                 d="M0.63 0.51a0.03 0.03 0 0 1 0 0.06h-0.54a0.03 0.03 0 0 1 0 -0.06zm0 -0.18a0.03 0.03 0 0 1 0 0.06h-0.54a0.03 0.03 0 0 1 0 -0.06zm0 -0.18a0.03 0.03 0 0 1 0 0.06h-0.54a0.03 0.03 0 1 1 0 -0.06z"
//               />
//             </svg>
//           </a>
//           {[adminKey].includes(getRole()) ? (
//             <form
//               className="d-lg-block d-none"
//               onSubmit={handleSubmit(onSubmit)}
//             >
//               <div className="form-group mb-0">
//                 <i className="search-icon">
//                   <img
//                     src={`${FileUrl}/img/icons/Search.svg`}
//                     className="in__svg"
//                     alt="search"
//                   />
//                 </i>
//                 <input
//                   type="text"
//                   name="key"
//                   id="key"
//                   {...register("key", { required: true })}
//                   className="form-control ps-5"
//                   placeholder="Search"
//                 />
//               </div>
//             </form>
//           ) : (
//             ""
//           )}
//           <div className="header-add-action dropdown ms-0">
//             <a
//               className="header_btn"
//               role="button"
//               id="add-plus"
//               data-toggle="dropdown"
//               aria-haspopup="true"
//               aria-expanded="false"
//             >
//               Add +
//             </a>
//             <ul
//               className="list-unstyled dropdown-menu"
//               aria-labelledby="add-plus"
//             >
//               {isAdmin() || ishod() ? (
//                 <li className="dropdown-item">
//                   <Link to={`/${FilesRoute.add}`}>
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       width="24"
//                       height="24"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                     >
//                       <g clipPath="url(#clip0_3161_7685)">
//                         <path
//                           d="M12.6094 7.03125C11.7047 7.03125 10.9688 6.29527 10.9688 5.39062V0H2.57812C1.15655 0 0 1.15655 0 2.57812V21.4219C0 22.8435 1.15655 24 2.57812 24H15.7031C17.1247 24 18.2812 22.8435 18.2812 21.4219V7.03125H12.6094ZM3.84375 16.875H7.2525C7.64081 16.875 7.95563 17.1898 7.95563 17.5781C7.95563 17.9664 7.64081 18.2812 7.2525 18.2812H3.84375C3.45544 18.2812 3.14062 17.9664 3.14062 17.5781C3.14062 17.1898 3.45544 16.875 3.84375 16.875ZM3.14062 13.8281C3.14062 13.4398 3.45544 13.125 3.84375 13.125H14.1562C14.5446 13.125 14.8594 13.4398 14.8594 13.8281C14.8594 14.2164 14.5446 14.5312 14.1562 14.5312H3.84375C3.45544 14.5312 3.14062 14.2164 3.14062 13.8281ZM14.1562 9.375C14.5446 9.375 14.8594 9.68981 14.8594 10.0781C14.8594 10.4664 14.5446 10.7812 14.1562 10.7812H3.84375C3.45544 10.7812 3.14062 10.4664 3.14062 10.0781C3.14062 9.68981 3.45544 9.375 3.84375 9.375H14.1562Z"
//                           fill="#CBAD67"
//                         />
//                         <path
//                           d="M12.375 5.39052C12.375 5.51975 12.4801 5.62489 12.6094 5.62489H17.9678C17.8386 5.38562 17.6722 5.16836 17.475 4.98121L12.9551 0.705176C12.7818 0.541167 12.5866 0.401954 12.375 0.291504V5.39052H12.375Z"
//                           fill="#CBAD67"
//                         />
//                       </g>
//                       <defs>
//                         <clipPath id="clip0_3161_7685">
//                           <rect width="24" height="24" fill="white" />
//                         </clipPath>
//                       </defs>
//                     </svg>
//                     Project
//                   </Link>
//                 </li>
//               ) : (
//                 ""
//               )}
//               {isEmp() ? (
//                 <li className="dropdown-item">
//                   <Link to={`/${EmpRoute.EditProfile}/${userId}`}>
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       width="24"
//                       height="24"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                     >
//                       <path
//                         d="M4 9C5.65685 9 7 7.65685 7 6C7 4.34315 5.65685 3 4 3C2.34315 3 1 4.34315 1 6C1 7.65685 2.34315 9 4 9Z"
//                         fill="#CBAD67"
//                       />
//                       <path
//                         d="M7.29 11.07C6.2835 11.6981 5.45339 12.5719 4.87782 13.6094C4.30226 14.6468 4.00017 15.8136 4 17H2C1.47005 16.9984 0.962265 16.7872 0.587535 16.4125C0.212805 16.0377 0.00158273 15.5299 0 15L0 13C0.00237409 12.2051 0.319207 11.4434 0.881302 10.8813C1.4434 10.3192 2.20508 10.0024 3 10H5C5.43657 10.001 5.86767 10.0972 6.26319 10.2821C6.65872 10.4669 7.00914 10.7358 7.29 11.07Z"
//                         fill="#CBAD67"
//                       />
//                       <path
//                         d="M20 9C21.6569 9 23 7.65685 23 6C23 4.34315 21.6569 3 20 3C18.3431 3 17 4.34315 17 6C17 7.65685 18.3431 9 20 9Z"
//                         fill="#CBAD67"
//                       />
//                       <path
//                         d="M24.0009 13V15C23.9994 15.5299 23.7881 16.0377 23.4134 16.4125C23.0387 16.7872 22.5309 16.9984 22.0009 17H20.0009C20.0008 15.8136 19.6987 14.6468 19.1231 13.6094C18.5475 12.5719 17.7174 11.6981 16.7109 11.07C16.9918 10.7358 17.3422 10.4669 17.7377 10.2821C18.1333 10.0972 18.5644 10.001 19.0009 10H21.0009C21.7959 10.0024 22.5575 10.3192 23.1196 10.8813C23.6817 11.4434 23.9986 12.2051 24.0009 13Z"
//                         fill="#CBAD67"
//                       />
//                       <path
//                         d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
//                         fill="#CBAD67"
//                       />
//                       <path
//                         d="M18 17V18C17.9976 18.7949 17.6808 19.5566 17.1187 20.1187C16.5566 20.6808 15.7949 20.9976 15 21H9C8.20508 20.9976 7.4434 20.6808 6.8813 20.1187C6.31921 19.5566 6.00237 18.7949 6 18V17C6 15.6739 6.52678 14.4021 7.46447 13.4645C8.40215 12.5268 9.67392 12 11 12H13C14.3261 12 15.5979 12.5268 16.5355 13.4645C17.4732 14.4021 18 15.6739 18 17Z"
//                         fill="#CBAD67"
//                       />
//                     </svg>
//                     Profile
//                   </Link>
//                 </li>
//               ) : (
//                 <li className="dropdown-item">
//                   <Link to={`/${EmpRoute.add}`}>
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       width="24"
//                       height="24"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                     >
//                       <path
//                         d="M4 9C5.65685 9 7 7.65685 7 6C7 4.34315 5.65685 3 4 3C2.34315 3 1 4.34315 1 6C1 7.65685 2.34315 9 4 9Z"
//                         fill="#CBAD67"
//                       />
//                       <path
//                         d="M7.29 11.07C6.2835 11.6981 5.45339 12.5719 4.87782 13.6094C4.30226 14.6468 4.00017 15.8136 4 17H2C1.47005 16.9984 0.962265 16.7872 0.587535 16.4125C0.212805 16.0377 0.00158273 15.5299 0 15L0 13C0.00237409 12.2051 0.319207 11.4434 0.881302 10.8813C1.4434 10.3192 2.20508 10.0024 3 10H5C5.43657 10.001 5.86767 10.0972 6.26319 10.2821C6.65872 10.4669 7.00914 10.7358 7.29 11.07Z"
//                         fill="#CBAD67"
//                       />
//                       <path
//                         d="M20 9C21.6569 9 23 7.65685 23 6C23 4.34315 21.6569 3 20 3C18.3431 3 17 4.34315 17 6C17 7.65685 18.3431 9 20 9Z"
//                         fill="#CBAD67"
//                       />
//                       <path
//                         d="M24.0009 13V15C23.9994 15.5299 23.7881 16.0377 23.4134 16.4125C23.0387 16.7872 22.5309 16.9984 22.0009 17H20.0009C20.0008 15.8136 19.6987 14.6468 19.1231 13.6094C18.5475 12.5719 17.7174 11.6981 16.7109 11.07C16.9918 10.7358 17.3422 10.4669 17.7377 10.2821C18.1333 10.0972 18.5644 10.001 19.0009 10H21.0009C21.7959 10.0024 22.5575 10.3192 23.1196 10.8813C23.6817 11.4434 23.9986 12.2051 24.0009 13Z"
//                         fill="#CBAD67"
//                       />
//                       <path
//                         d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
//                         fill="#CBAD67"
//                       />
//                       <path
//                         d="M18 17V18C17.9976 18.7949 17.6808 19.5566 17.1187 20.1187C16.5566 20.6808 15.7949 20.9976 15 21H9C8.20508 20.9976 7.4434 20.6808 6.8813 20.1187C6.31921 19.5566 6.00237 18.7949 6 18V17C6 15.6739 6.52678 14.4021 7.46447 13.4645C8.40215 12.5268 9.67392 12 11 12H13C14.3261 12 15.5979 12.5268 16.5355 13.4645C17.4732 14.4021 18 15.6739 18 17Z"
//                         fill="#CBAD67"
//                       />
//                     </svg>
//                     Team
//                   </Link>
//                 </li>
//               )}
//               {isAdmin() || Cordinator() || ishod() ? (
//                 <li className="dropdown-item">
//                   <Link to={`/${TodosRoute.add}`}>
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       width="24"
//                       height="24"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                     >
//                       <path
//                         d="M16.19 2H7.81C4.17 2 2 4.17 2 7.81V16.19C2 19.83 4.17 22 7.81 22H16.19C19.83 22 22 19.83 22 16.19V7.81C22 4.17 19.83 2 16.19 2ZM9.97 14.9L7.72 17.15C7.57 17.3 7.38 17.37 7.19 17.37C7 17.37 6.8 17.3 6.66 17.15L5.91 16.4C5.61 16.11 5.61 15.63 5.91 15.34C6.2 15.05 6.67 15.05 6.97 15.34L7.19 15.56L8.91 13.84C9.2 13.55 9.67 13.55 9.97 13.84C10.26 14.13 10.26 14.61 9.97 14.9ZM9.97 7.9L7.72 10.15C7.57 10.3 7.38 10.37 7.19 10.37C7 10.37 6.8 10.3 6.66 10.15L5.91 9.4C5.61 9.11 5.61 8.63 5.91 8.34C6.2 8.05 6.67 8.05 6.97 8.34L7.19 8.56L8.91 6.84C9.2 6.55 9.67 6.55 9.97 6.84C10.26 7.13 10.26 7.61 9.97 7.9ZM17.56 16.62H12.31C11.9 16.62 11.56 16.28 11.56 15.87C11.56 15.46 11.9 15.12 12.31 15.12H17.56C17.7589 15.12 17.9497 15.199 18.0903 15.3397C18.231 15.4803 18.31 15.6711 18.31 15.87C18.31 16.0689 18.231 16.2597 18.0903 16.4003C17.9497 16.541 17.7589 16.62 17.56 16.62ZM17.56 9.62H12.31C11.9 9.62 11.56 9.28 11.56 8.87C11.56 8.46 11.9 8.12 12.31 8.12H17.56C17.7589 8.12 17.9497 8.19902 18.0903 8.33967C18.231 8.48032 18.31 8.67109 18.31 8.87C18.31 9.06891 18.231 9.25968 18.0903 9.40033C17.9497 9.54098 17.7589 9.62 17.56 9.62Z"
//                         fill="#CBAD67"
//                       />
//                     </svg>
//                     Todo
//                   </Link>
//                 </li>
//               ) : null}
//               {superAccess([adminKey]) ? (
//                 <>
//                   <li className="dropdown-item">
//                     <Link onClick={handleShowModal}>
//                       <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         width="24"
//                         height="24"
//                         viewBox="0 0 24 24"
//                         fill="none"
//                       >
//                         <path
//                           d="M12 9.68579C14.2523 9.68579 16.0781 7.85995 16.0781 5.60767C16.0781 3.35538 14.2523 1.52954 12 1.52954C9.74771 1.52954 7.92188 3.35538 7.92188 5.60767C7.92188 7.85995 9.74771 9.68579 12 9.68579Z"
//                           fill="#CBAD67"
//                         />
//                         <path
//                           d="M20.25 9.68579C21.6739 9.68579 22.8281 8.53153 22.8281 7.10767C22.8281 5.68381 21.6739 4.52954 20.25 4.52954C18.8261 4.52954 17.6719 5.68381 17.6719 7.10767C17.6719 8.53153 18.8261 9.68579 20.25 9.68579Z"
//                           fill="#CBAD67"
//                         />
//                         <path
//                           d="M3.75 9.68579C5.17386 9.68579 6.32812 8.53153 6.32812 7.10767C6.32812 5.68381 5.17386 4.52954 3.75 4.52954C2.32614 4.52954 1.17188 5.68381 1.17188 7.10767C1.17188 8.53153 2.32614 9.68579 3.75 9.68579Z"
//                           fill="#CBAD67"
//                         />
//                         <path
//                           d="M6.29016 12.0009C5.27531 11.1694 4.35623 11.2795 3.18281 11.2795C1.42781 11.2795 0 12.6989 0 14.4431V19.5623C0 20.3198 0.618281 20.9357 1.37859 20.9357C4.66106 20.9357 4.26562 20.9951 4.26562 20.7942C4.26562 17.1667 3.83597 14.5065 6.29016 12.0009Z"
//                           fill="#CBAD67"
//                         />
//                         <path
//                           d="M13.1153 11.2982C11.0657 11.1273 9.28421 11.3002 7.7476 12.5685C5.17618 14.6282 5.67104 17.4015 5.67104 20.7942C5.67104 21.6918 6.40135 22.4357 7.3126 22.4357C17.2071 22.4357 17.6009 22.7549 18.1876 21.4556C18.38 21.0162 18.3273 21.1558 18.3273 16.9523C18.3273 13.6136 15.4364 11.2982 13.1153 11.2982ZM20.8163 11.2795C19.6365 11.2795 18.7225 11.1705 17.709 12.0009C20.1449 14.4879 19.7335 16.9666 19.7335 20.7942C19.7335 20.9964 19.4053 20.9357 22.5713 20.9357C23.3588 20.9357 23.9992 20.2978 23.9992 19.5135V14.4431C23.9992 12.6989 22.5713 11.2795 20.8163 11.2795Z"
//                           fill="#CBAD67"
//                         />
//                       </svg>
//                       Client
//                     </Link>
//                   </li>

//                   <li className="dropdown-item">
//                     <Link to={`/${DepositExpenseRoute.add}`}>
//                       <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         width="24"
//                         height="24"
//                         viewBox="0 0 24 24"
//                         fill="none"
//                       >
//                         <path
//                           fillRule="evenodd"
//                           clipRule="evenodd"
//                           d="M18 3H6C3.8 3 2 4.8 2 7C2 8.7 3 10.1 4.5 10.7V7C4.5 6.6 4.7 6.2 4.9 5.9C5.1 5.6 5.6 5.5 6 5.5H18C18.4 5.5 18.8 5.7 19.1 5.9C19.4 6.1 19.5 6.6 19.5 7V10.7C21 10.1 22 8.7 22 7C22 4.8 20.2 3 18 3ZM18 19V7H6V19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19ZM11.2 12.4L10.5 13.1C10.2 13.4 9.7 13.4 9.4 13.1C9.1 12.8 9.1 12.3 9.4 12L10.7 10.7C11.4 10 12.5 10 13.2 10.7L14.5 12C14.8 12.3 14.8 12.8 14.5 13.1C14.2 13.4 13.7 13.4 13.4 13.1L12.7 12.4V16.6C12.7 17 12.4 17.4 11.9 17.4C11.4 17.4 11.1 17.1 11.1 16.6V12.4H11.2Z"
//                           fill="#CBAD67"
//                         />
//                       </svg>
//                       Deposit
//                     </Link>
//                   </li>
//                 </>
//               ) : (
//                 ""
//               )}

//               <li className="dropdown-item">
//                 <Link to={`/${FileExpenseRoute.add}`}>
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     width="24"
//                     height="24"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                   >
//                     <g clipPath="url(#clip0_3161_9167)">
//                       <path
//                         fillRule="evenodd"
//                         clipRule="evenodd"
//                         d="M19.7823 11.0741C21.1409 12.5796 22.1537 13.8857 22.8208 15.0569C25.2635 19.346 21.7885 23.7023 17.1346 23.6239C12.4807 23.7023 9.00567 19.346 11.4484 15.0569C12.1155 13.8857 13.1283 12.5796 14.4869 11.0741C14.6529 11.1267 14.8261 11.1534 15.0003 11.1532H19.2689C19.4477 11.1532 19.6202 11.1255 19.7823 11.0741ZM2.50622 0.375C1.33402 0.375 0.375 1.33406 0.375 2.50622V18.0864C0.375 19.2586 1.33402 20.2177 2.50622 20.2177H10.3544C9.58734 18.3848 9.81942 16.4017 10.7968 14.6857C10.9964 14.3352 11.2154 13.9878 11.4489 13.6446C11.3138 13.5572 11.2241 13.4052 11.2241 13.233V12.596C11.2241 12.3262 11.4442 12.1061 11.7141 12.1061H12.6027C12.9998 11.6179 13.4131 11.1427 13.8267 10.6839C13.7041 10.5677 13.5994 10.434 13.5158 10.2872H11.7141C11.4442 10.2872 11.2241 10.0671 11.2241 9.79725V9.16026C11.2241 8.8904 11.4442 8.67033 11.7141 8.67033H13.4808C13.6334 8.37376 13.8688 8.12788 14.1585 7.96256L13.6493 7.45345C13.3394 7.14356 13.1719 6.74395 13.1465 6.33698H3.21661C2.94675 6.33698 2.72667 6.11691 2.72667 5.84705V3.924C2.72667 3.65414 2.94675 3.43406 3.21661 3.43406H13.9954C14.2652 3.43406 14.4853 3.65414 14.4853 3.924V4.54055C14.8311 4.46123 15.1988 4.48762 15.5349 4.62548C15.7621 4.08155 16.2551 3.6863 16.837 3.58444V2.50622C16.837 1.33406 15.878 0.375 14.7058 0.375H2.50622ZM15.0003 10.4032C14.474 10.4032 14.0435 9.9727 14.0435 9.44644C14.0435 8.92022 14.4741 8.48967 15.0003 8.48967H19.2689C19.7952 8.48967 20.2257 8.92022 20.2257 9.44648C20.2257 9.97266 19.7952 10.4032 19.2689 10.4032H15.0003ZM3.66675 8.67033H5.49792C5.76778 8.67033 5.98786 8.8904 5.98786 9.16026V9.7972C5.98786 10.0671 5.76778 10.2871 5.49792 10.2871H3.66675C3.39689 10.2871 3.17681 10.0671 3.17681 9.7972V9.16026C3.17681 8.8904 3.39689 8.67033 3.66675 8.67033ZM7.69041 15.5418C7.42055 15.5418 7.20047 15.7619 7.20047 16.0317V16.6687C7.20047 16.9385 7.42055 17.1586 7.69041 17.1586H9.52158C9.79144 17.1586 10.0115 16.9385 10.0115 16.6687V16.0317C10.0115 15.7619 9.79144 15.5418 9.52158 15.5418H7.69041ZM3.66675 15.5418H5.49792C5.76778 15.5418 5.98786 15.7619 5.98786 16.0317V16.6687C5.98786 16.9385 5.76778 17.1586 5.49792 17.1586H3.66675C3.39689 17.1586 3.17681 16.9385 3.17681 16.6687V16.0317C3.17681 15.7619 3.39689 15.5418 3.66675 15.5418ZM7.69041 12.106C7.42055 12.106 7.20047 12.3261 7.20047 12.596V13.2329C7.20047 13.5028 7.42055 13.7228 7.69041 13.7228H9.52158C9.79144 13.7228 10.0115 13.5028 10.0115 13.2329V12.596C10.0115 12.3261 9.79144 12.106 9.52158 12.106H7.69041ZM3.66675 12.106H5.49792C5.76778 12.106 5.98786 12.3261 5.98786 12.596V13.2329C5.98786 13.5028 5.76778 13.7228 5.49792 13.7228H3.66675C3.39689 13.7228 3.17681 13.5028 3.17681 13.2329V12.596C3.17681 12.3262 3.39689 12.106 3.66675 12.106ZM7.69041 8.67033H9.52158C9.79144 8.67033 10.0115 8.8904 10.0115 9.16026V9.7972C10.0115 10.0671 9.79144 10.2871 9.52158 10.2871H7.69041C7.42055 10.2871 7.20047 10.0671 7.20047 9.7972V9.16026C7.20047 8.8904 7.42055 8.67033 7.69041 8.67033ZM17.0855 19.1243C16.798 19.1168 16.5188 19.039 16.2963 18.8908C16.095 18.7567 15.9411 18.5605 15.8768 18.3028C15.8632 18.2474 15.8389 18.1953 15.8051 18.1494C15.7714 18.1035 15.7289 18.0647 15.6802 18.0352C15.6315 18.0058 15.5774 17.9861 15.5211 17.9776C15.4648 17.969 15.4073 17.9715 15.352 17.9851C15.2967 17.9987 15.2446 18.0231 15.1987 18.0569C15.1528 18.0906 15.114 18.133 15.0845 18.1818C15.055 18.2305 15.0354 18.2846 15.0268 18.3409C15.0182 18.3972 15.0208 18.4547 15.0344 18.51C15.1557 18.9968 15.4427 19.3649 15.8174 19.6144C16.0732 19.7848 16.3704 19.8975 16.6816 19.9523V20.2899C16.6828 20.4044 16.7292 20.5139 16.8106 20.5945C16.892 20.675 17.0019 20.7202 17.1165 20.7202C17.231 20.7202 17.341 20.675 17.4224 20.5945C17.5038 20.5139 17.5501 20.4044 17.5513 20.2899V19.9606C17.9295 19.903 18.3148 19.7649 18.6173 19.5354C18.9809 19.2596 19.2227 18.8646 19.2101 18.3345C19.2092 18.2811 19.2057 18.2278 19.1997 18.1747C19.1292 17.5939 18.8149 17.2158 18.3982 16.9642C18.0322 16.7432 17.5933 16.6331 17.1908 16.5671C16.9006 16.5194 16.5949 16.4388 16.371 16.2926C16.1975 16.1794 16.0731 16.0154 16.0614 15.7757C16.0488 15.5163 16.1621 15.307 16.3405 15.1619C16.4803 15.0483 16.6586 14.9693 16.8519 14.9304C16.9306 14.9146 17.0104 14.9056 17.0906 14.9036C17.1096 14.9047 17.1286 14.9046 17.1476 14.9032C17.2545 14.9048 17.3621 14.9185 17.4673 14.9452C17.7905 15.0271 18.0848 15.2401 18.2398 15.6093C18.3327 15.8307 18.5875 15.9348 18.8088 15.842C19.0302 15.7491 19.1344 15.4943 19.0415 15.273C18.7686 14.623 18.249 14.2474 17.6779 14.1027C17.636 14.092 17.5938 14.0827 17.5513 14.0747V13.7377C17.5493 13.6238 17.5025 13.5152 17.4212 13.4353C17.3399 13.3554 17.2305 13.3107 17.1165 13.3107C17.0025 13.3107 16.8931 13.3554 16.8117 13.4353C16.7304 13.5152 16.6837 13.6238 16.6816 13.7377V14.0812C16.3522 14.1476 16.0428 14.2867 15.7936 14.4893C15.4106 14.8007 15.1678 15.2528 15.1951 15.8165C15.2226 16.3829 15.5053 16.7628 15.8988 17.0197C16.2418 17.2436 16.6631 17.3595 17.0516 17.4232C17.3636 17.4745 17.6967 17.5554 17.9498 17.7082C18.1522 17.8305 18.3043 18.0091 18.3368 18.2767C18.3411 18.3124 18.3435 18.3383 18.3438 18.3549C18.3489 18.5677 18.2471 18.7298 18.0942 18.8459C17.9028 18.9911 17.634 19.0767 17.3652 19.1093C17.292 19.1182 17.2281 19.1233 17.1739 19.1245L17.1532 19.1249C17.141 19.1239 17.1287 19.1234 17.1165 19.1234C17.1061 19.1233 17.0958 19.1236 17.0855 19.1243ZM14.9962 7.73972L14.1796 6.92311C13.7972 6.5407 13.7972 5.91497 14.1796 5.53261C14.5049 5.20734 15.0197 5.15241 15.4067 5.4008C15.5505 5.49305 15.7156 5.50777 15.8733 5.44247C16.0311 5.37712 16.1374 5.25005 16.1738 5.08312C16.2702 4.64175 16.6653 4.30861 17.1346 4.30852C17.5953 4.30852 17.9972 4.63331 18.0954 5.08312C18.1319 5.25005 18.2382 5.37712 18.3959 5.44247C18.5537 5.50786 18.7188 5.49305 18.8625 5.4008C19.2427 5.15677 19.7578 5.20078 20.0895 5.53252V5.53261C20.472 5.91502 20.472 6.54075 20.0895 6.92311L19.2729 7.73972L19.2689 7.73967H15.0003L14.9962 7.73972Z"
//                         fill="#CBAD67"
//                       />
//                     </g>
//                     <defs>
//                       <clipPath id="clip0_3161_9167">
//                         <rect width="24" height="24" fill="white" />
//                       </clipPath>
//                     </defs>
//                   </svg>
//                   File Expense
//                 </Link>
//               </li>

//               <li className="dropdown-item">
//                 <Link to={`/${OfficeExpenseRoute.add}`}>
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     width="24"
//                     height="24"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                   >
//                     <path
//                       d="M15.375 16.125C15.375 15.4759 15.375 13.5 17.25 13.5H21V11.25C21 10.2161 20.1589 9.37501 19.125 9.37501H3C1.96613 9.37501 1.125 10.2161 1.125 11.25V21C1.125 22.0339 1.96613 22.875 3 22.875H19.125C20.1589 22.875 21 22.0339 21 21V18.75H17.25C15.375 18.75 15.375 16.7741 15.375 16.125ZM16.125 8.62501V6.35176C16.125 5.96438 15.9229 5.61301 15.5842 5.41201C15.4137 5.3097 15.2193 5.25398 15.0205 5.25043C14.8217 5.24687 14.6254 5.29561 14.4514 5.39176L7.96725 8.62501H16.125Z"
//                       fill="#CBAD67"
//                     />
//                     <path
//                       d="M18.375 16.8748C18.7892 16.8748 19.125 16.539 19.125 16.1248C19.125 15.7105 18.7892 15.3748 18.375 15.3748C17.9608 15.3748 17.625 15.7105 17.625 16.1248C17.625 16.539 17.9608 16.8748 18.375 16.8748Z"
//                       fill="#CBAD67"
//                     />
//                     <path
//                       d="M12.749 5.40225V3.80587C12.7532 3.57909 12.6912 3.356 12.5706 3.16391C12.45 2.97182 12.2759 2.81907 12.0698 2.72437C11.6716 2.54362 11.2351 2.61037 10.9021 2.9025L4.37109 8.625H6.28584L12.749 5.40225ZM21.749 14.25H17.249C16.5736 14.25 16.124 14.5691 16.124 16.125C16.124 17.6809 16.5736 18 17.249 18H21.749C22.3692 18 22.874 17.4952 22.874 16.875V15.375C22.874 14.7547 22.3692 14.25 21.749 14.25ZM18.374 17.625C17.5467 17.625 16.874 16.9522 16.874 16.125C16.874 15.2977 17.5467 14.625 18.374 14.625C19.2012 14.625 19.874 15.2977 19.874 16.125C19.874 16.9522 19.2012 17.625 18.374 17.625ZM23.1661 3.29925L21.4411 0.978747C21.389 0.908726 21.3213 0.851856 21.2434 0.812688C21.1654 0.773519 21.0794 0.753137 20.9921 0.753174C20.9049 0.75321 20.8189 0.773663 20.7409 0.812897C20.663 0.852131 20.5953 0.909057 20.5433 0.979122L18.8288 3.288C18.7909 3.32579 18.765 3.37401 18.7545 3.42654C18.744 3.47907 18.7493 3.53354 18.7698 3.58304C18.7903 3.63253 18.825 3.67483 18.8696 3.70456C18.9141 3.73428 18.9665 3.7501 19.0201 3.75H19.8668C19.9786 4.29828 19.9175 4.86773 19.6921 5.37985C19.4666 5.89197 19.0878 6.32155 18.608 6.60937L18.374 6.75L19.874 7.875L19.94 7.83112C20.6118 7.38314 21.1626 6.77626 21.5436 6.06434C21.9245 5.35241 22.1239 4.55745 22.124 3.75H22.9793C23.0316 3.75003 23.0827 3.73456 23.1261 3.70555C23.1695 3.67655 23.2034 3.6353 23.2234 3.58704C23.2434 3.53879 23.2486 3.48568 23.2384 3.43445C23.2282 3.38322 23.203 3.33617 23.1661 3.29925Z"
//                       fill="#CBAD67"
//                     />
//                   </svg>
//                   Office Expense
//                 </Link>
//               </li>

//               <li className="dropdown-item">
//                 <Link to={`/${SiteRoute.add}`}>
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     width="24"
//                     height="24"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                   >
//                     <path
//                       d="M12 9.1875C12.7767 9.1875 13.4062 8.5579 13.4062 7.78125C13.4062 7.0046 12.7767 6.375 12 6.375C11.2233 6.375 10.5938 7.0046 10.5938 7.78125C10.5938 8.5579 11.2233 9.1875 12 9.1875Z"
//                       fill="#CBAD67"
//                     />
//                     <path
//                       d="M11.9983 12C11.2343 12 10.5621 12.4183 10.1914 13.0521C10.7522 13.2749 11.3592 13.4062 11.9983 13.4062C12.6374 13.4062 13.2444 13.2749 13.8052 13.0521C13.4345 12.4183 12.7623 12 11.9983 12Z"
//                       fill="#CBAD67"
//                     />
//                     <path
//                       d="M8.97483 12.3371C9.59339 11.2811 10.7276 10.5937 12 10.5937C10.4489 10.5937 9.1875 9.33239 9.1875 7.78125C9.1875 6.23011 10.4489 4.96875 12 4.96875C13.5511 4.96875 14.8125 6.23011 14.8125 7.78125C14.8125 9.33239 13.5511 10.5937 12 10.5937C13.2724 10.5937 14.4066 11.2811 15.0252 12.3371C16.171 11.4352 16.9219 10.0522 16.9219 8.48437C16.9219 5.77073 14.7136 3.5625 12 3.5625C9.28636 3.5625 7.07812 5.77073 7.07812 8.48437C7.07812 10.0522 7.82897 11.4352 8.97483 12.3371Z"
//                       fill="#CBAD67"
//                     />
//                     <path
//                       d="M3.5625 8.48438C3.5625 14.2593 8.65467 16.0982 12 19.7344C15.3428 16.1005 20.4375 14.2769 20.4375 8.48438C20.4375 3.83166 16.6527 0 12 0C7.34728 0 3.5625 3.83166 3.5625 8.48438ZM12 2.15625C15.4895 2.15625 18.3281 4.99486 18.3281 8.48438C18.3281 11.9739 15.4895 14.8125 12 14.8125C8.51048 14.8125 5.67188 11.9739 5.67188 8.48438C5.67188 4.99486 8.51048 2.15625 12 2.15625Z"
//                       fill="#CBAD67"
//                     />
//                     <path
//                       d="M16.5406 17.5602L12 21.6212L7.45973 17.5601C5.44228 18.1909 4.26562 19.2154 4.26562 20.4374C4.26562 22.7212 8.25023 23.9999 12 23.9999C15.7498 23.9999 19.7344 22.7212 19.7344 20.4374C19.7344 19.2154 18.5578 18.1911 16.5406 17.5602Z"
//                       fill="#CBAD67"
//                     />
//                   </svg>
//                   Site Inspection
//                 </Link>
//               </li>
//             </ul>
//           </div>
//         </div>
//         <ul className="navbar-nav topbar__menu list-unstyled align-items-center">
//           <li className="dropdown">
//             <a
//               role="button"
//               id="notification"
//               data-toggle="dropdown"
//               aria-haspopup="true"
//               aria-expanded="false"
//             >
//               <span className="header-action-icon">
//                 <img
//                   src={`${FileUrl}/img/icons/Notification.svg`}
//                   className="in__svg"
//                   alt="Employees"
//                 />
//               </span>

//               {superAccess([adminKey, subadmin]) ? (
//                 todoNotification?.length > 0 ? (
//                   <span className="notification-icon-badge"></span>
//                 ) : (
//                   ""
//                 )
//               ) : isEmp() ? (
//                 todoNotification_forOthers?.length > 0 ? (
//                   <span className="notification-icon-badge"></span>
//                 ) : (
//                   ""
//                 )
//               ) : (
//                 ""
//               )}
//             </a>
//             <div
//               className="dropdown-menu dropdown-menu-right"
//               aria-labelledby="notification"
//               style={{ width: "640px" }}
//             >
//               <h6 className="mb-3">
//                 <span className="float-right">
//                   <a></a>
//                 </span>
//                 Notification111
//               </h6>
//               <ul
//                 className="notification__list list-unstyled"
//                 style={{ maxHeight: "300px", overflowY: "auto" }}
//               >
//                 <li className="notification--item unread">
//                   {superAccess([adminKey, subadmin]) ? (
//                     <>
//                       {todoNotification.length > 0 ? (
//                         <>
//                           {todoNotification.map((n, i) => (
//                             <Accordion
//                               className="dropdown-item d-flex"
//                               onClick={(e) => e.stopPropagation()}
//                             >
//                               <Accordion.Item
//                                 key={n?.id}
//                                 eventKey={n?.id}
//                                 style={{ display: "block", width: "100%" }}
//                               >
//                                 <Accordion.Header>
//                                   {n?.table_name} - ( {n?.json_data.message})
//                                 </Accordion.Header>
//                                 <Accordion.Body>
//                                   <span>
//                                     {new Date(n?.created_at).toLocaleDateString(
//                                       "en-GB",
//                                       {
//                                         day: "numeric",
//                                         month: "short",
//                                         year: "numeric",
//                                       }
//                                     )}{" "}
//                                   </span>
//                                   <p>{n?.fullname}</p>

//                                   {GetTime(n?.created_at, "hh:mm:ss A")}
//                                 </Accordion.Body>
//                               </Accordion.Item>
//                             </Accordion>
                            
//                           ))}
//                         </>
//                       ) : (
//                         ""
//                       )}
//                     </>
//                   ) : (
//                     ""
//                   )}

//                   {isEmp() ? (
//                     <>
//                       {todoNotification_forOthers.length > 0 ? (
//                         <>
//                           {todoNotification_forOthers.map((n, i) => (
//                             <div className="dropdown-item d-flex">
//                               <div className="notification-details ml-2">
//                                 <button
//                                   className="close"
//                                   onClick={() => {
//                                     clearMessage(i);
//                                     seenNotification(
//                                       "",
                                    
//                                       { id: n?.id },
//                                       true,
//                                       i
//                                     );
//                                   }}
//                                   style={{
//                                     position: "absolute",
//                                     top: "-2px",
//                                     right: "0",
//                                     fontSize: "12px",
//                                     padding: "4px",
//                                   }}
//                                 >
//                                   X
//                                 </button>
//                                 <h5 className="user-name mb-0">
//                                   Admin{" "}
//                                   <small>
//                                     {GetDate(n?.created_at, "DD-MM-YYYY")}{" "}
//                                     {GetTime(n?.created_at, "hh:mm:ss A")}
//                                   </small>
//                                 </h5>
//                                 <p className="user-message small text-truncate mb-0">
//                                   {n?.json_data?.title}
//                                 </p>
//                                 <p className="user-message small text-truncate mb-0">
//                                   {n?.json_data?.message}
//                                 </p>
//                                 <a
//                                   role="button"
//                                   onClick={() =>
//                                     seenNotification(
//                                       `/${TodosRoute.markTodo}/${n?.child_id}`,
//                                       { id: n?.id },
//                                       true
//                                     )
//                                   }
//                                 >
//                                   View details{" "}
//                                   <img
//                                     src={`${FileUrl}/img/icons/Notification.svg`}
//                                     className="in__svg"
//                                     alt="Employees"
//                                   />
//                                 </a>
//                               </div>
//                             </div>
//                           ))}
//                         </>
//                       ) : (
//                         ""
//                       )}
//                     </>
//                   ) : (
//                     ""
//                   )}

                  
//                 </li>
               
//               </ul>
//             </div>
//           </li>
       
//           <li className="dropdown">
//             <a
//               role="button"
//               id="user-account"
//               data-toggle="dropdown"
//               aria-haspopup="true"
//               aria-expanded="false"
//             >
//               <span className="account-user-avatar">
//                 <img
//                   src={getUserProfilePic()}
//                   alt="User Profile"
//                   onError={(e) =>
//                     (e.target.src =
//                       "https://webappapi.zaidexceldesign.com/public/img/profile.jpeg")
//                   }
//                 />
//               </span>
//               <span className="account-user-name">{getFullName()}</span>
//             </a>
//             <ul
//               className="list-unstyled dropdown-menu"
//               aria-labelledby="user-account"
//             >
//               <li className="dropdown-item">
//                 <a href="#" onClick={doLogout}>
//                   Logout
//                 </a>
//               </li>
//             </ul>
//           </li>
       
//         </ul>
//       </header>
//       <AddModal show={showModal} handleClose={handleCloseModal} />

//     </>
//   );
// };

// export default Header;
