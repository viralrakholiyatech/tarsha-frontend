import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { EmpRoute } from "../../../../config/RouteConfig";
import TeamExpenseReport from "../TeamExpenseReport";
import EmpTask from "./EmpTask";
import EmpAttedance from "./EmpAttendance";
import EmpDocument from "./EmpDocument";
import EmpProject from "./EmpProject";
import EmpHRProfile from "./HrProfile";  // ← NEW IMPORT


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
  * { box-sizing:border-box; }

  /* ── Tabs ── */
  .ep-tabs {
    display:flex;gap:6px;flex-wrap:nowrap;overflow-x:auto;
    padding:0;margin:0;list-style:none;scrollbar-width:none;
  }
  .ep-tabs::-webkit-scrollbar { display:none; }
  .ep-tab {
    padding:9px 18px;border-radius:20px;cursor:pointer;white-space:nowrap;
    font-size:13px;font-weight:600;border:1.5px solid transparent;
    background:transparent;color:#595959;transition:all 0.18s;
    font-family:'DM Sans',sans-serif;display:inline-flex;align-items:center;gap:6px;
  }
  .ep-tab:hover  { background:${THEME.brandLight};color:${THEME.brand}; }
  .ep-tab.active {
    background:${THEME.brandLight};color:${THEME.brand};
    border-color:${THEME.brand};font-weight:700;
  }

  /* ── Edit btn ── */
  .ep-edit-btn {
    width:32px;height:32px;border-radius:8px;border:1.5px solid ${THEME.border};
    background:#fff;cursor:pointer;display:inline-flex;align-items:center;
    justify-content:center;transition:all 0.15s;flex-shrink:0;
  }
  .ep-edit-btn:hover { background:${THEME.brandLight};border-color:${THEME.brand}; }

  ::-webkit-scrollbar { width:5px;height:5px; }
  ::-webkit-scrollbar-track { background:${THEME.brandLight}; }
  ::-webkit-scrollbar-thumb { background:${THEME.brandMid};border-radius:10px; }
`;

// ─────────────────────────────────────────────
//  TAB CONFIG  (HR Profile added first)
// ─────────────────────────────────────────────
const TABS = [
  { key:"hr",         label:"HR Profile",  icon:"🏢" },  // ← NEW
  { key:"attendance", label:"Attendance",  icon:"📅" },
  { key:"task",       label:"Task",        icon:"✅" },
  { key:"wallet",     label:"Wallet",      icon:"💰" },
  { key:"project",    label:"Project",     icon:"🏗" },
  { key:"document",   label:"Document",    icon:"📁" },
];


// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
function EmpProfile() {
  const params   = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("hr");  // default to HR Profile

  const name = localStorage.getItem("selectedEmployeeName") || "Employee";

  // ── Initial of name for avatar fallback ───
  const initials = name.split(" ").map((w) => w[0]?.toUpperCase()).slice(0, 2).join("");

  return (
    <>
      <style>{CSS}</style>

      <div style={{ minHeight:"100vh", background:THEME.bg, fontFamily:"'DM Sans',sans-serif", padding:"28px 24px" }}>

        {/* ── Profile header card ── */}
        <div style={{ background:"#fff", border:`1px solid ${THEME.border}`, borderRadius:14, padding:"20px 24px", marginBottom:16, boxShadow:"0 2px 10px rgba(136,117,73,0.06)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>

            {/* Avatar + name */}
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              {/* Gold gradient avatar */}
              <div style={{
                width:48, height:48, borderRadius:"50%", flexShrink:0,
                background:`linear-gradient(135deg,${THEME.brand},${THEME.brandMid})`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:18, fontWeight:800, color:"#fff", fontFamily:"'Sora',sans-serif",
                boxShadow:`0 2px 8px ${THEME.brand}44`,
              }}>
                {initials}
              </div>
              <div>
                <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:THEME.text, fontFamily:"'Sora',sans-serif", letterSpacing:"-0.2px" }}>
                  {name}
                </h1>
                <p style={{ margin:"2px 0 0", fontSize:12, color:THEME.textMuted }}>Employee Profile</p>
              </div>
            </div>

            {/* Edit button */}
            <button
              className="ep-edit-btn"
              title="Edit Employee"
              onClick={() => navigate(`/${EmpRoute.edit}/${params.id}`)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={THEME.brand} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── Tabs card ── */}
        <div style={{ background:"#fff", border:`1px solid ${THEME.border}`, borderRadius:14, overflow:"hidden", boxShadow:"0 2px 10px rgba(136,117,73,0.06)" }}>

          {/* Tab bar */}
          <div style={{ padding:"14px 20px", borderBottom:`1px solid ${THEME.border}`, background:"#FDFAF5" }}>
            <ul className="ep-tabs">
              {TABS.map((t) => (
                <li key={t.key}>
                  <button
                    className={`ep-tab${activeTab === t.key ? " active" : ""}`}
                    onClick={() => setActiveTab(t.key)}
                  >
                    <span>{t.icon}</span>
                    {t.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Tab content */}
          <div>
            {activeTab === "hr"         && <EmpHRProfile />}        {/* ← NEW */}
            {activeTab === "attendance" && <EmpAttedance />}
            {activeTab === "task"       && <EmpTask />}
            {activeTab === "wallet"     && <TeamExpenseReport />}
            {activeTab === "project"    && <EmpProject />}
            {activeTab === "document"   && <EmpDocument />}
          </div>
        </div>

      </div>
    </>
  );
}

export default EmpProfile;