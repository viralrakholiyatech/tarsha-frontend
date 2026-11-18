// ─────────────────────────────────────────────
//  EmpProject.jsx  —  Employee Projects
//  Same brand design system as ApprovalProcessList
//  + status string parsing for stage badges
// ─────────────────────────────────────────────

import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import ApiService from "../../../../services/ApiService";
import { getToken } from "../../../../services/useLocalStorage";
import { useParams } from "react-router-dom";
import {
  empProjectApproval, empProjectArchitecture, empProjectInterior,
} from "../../../../config/config";


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
  rowAlt:     "#FEFCF9",
  rowHover:   "#FDFAF5",
  text:       "#1A1A2E",
  textMuted:  "#ADADAD",
  textLight:  "#BDBDBD",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing:border-box; }
  @keyframes epjFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .epj-fade { animation:epjFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes epjSpin { to{transform:rotate(360deg)} }
  .epj-spinner {
    width:28px;height:28px;border-radius:50%;
    border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};
    animation:epjSpin 0.8s linear infinite;
  }

  /* ── Tabs ── */
  .epj-tabs { display:flex;gap:6px;flex-wrap:nowrap;overflow-x:auto;padding:0;margin:0;list-style:none;scrollbar-width:none; }
  .epj-tabs::-webkit-scrollbar { display:none; }
  .epj-tab {
    padding:8px 16px;border-radius:20px;cursor:pointer;white-space:nowrap;
    font-size:12px;font-weight:600;border:1.5px solid transparent;
    background:transparent;color:#595959;transition:all 0.18s;
    font-family:'DM Sans',sans-serif;display:inline-flex;align-items:center;gap:6px;
  }
  .epj-tab:hover  { background:${THEME.brandLight};color:${THEME.brand}; }
  .epj-tab.active { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand};font-weight:700; }
  .epj-tab-count  { background:${THEME.brand};color:#fff;border-radius:20px;padding:1px 7px;font-size:10px;font-weight:800; }
  .epj-tab.active .epj-tab-count { background:${THEME.brandDark}; }

  /* ── Table ── */
  .epj-table { width:100%;border-collapse:collapse;font-family:'DM Sans',sans-serif; }
  .epj-table th {
    padding:10px 14px;font-size:11px;font-weight:700;color:${THEME.brandDark};
    text-transform:uppercase;letter-spacing:0.07em;
    background:${THEME.brandLight};border-bottom:2px solid #D4C4A0;white-space:nowrap;
  }
  .epj-table td { padding:12px 14px;border-bottom:1px solid #F5EFE4;vertical-align:top; }
  .epj-table tbody tr:nth-child(even) { background:${THEME.rowAlt}; }
  .epj-table tbody tr:hover { background:${THEME.rowHover}; }

  /* ── Progress bar ── */
  .epj-progress-track {
    width:100%;height:5px;border-radius:10px;background:#EDE5D5;overflow:hidden;margin-top:5px;
  }
  .epj-progress-fill {
    height:100%;border-radius:10px;
    background:linear-gradient(90deg,${THEME.brand},${THEME.brandMid});
    transition:width 0.4s ease;
  }

  ::-webkit-scrollbar { width:5px;height:5px; }
  ::-webkit-scrollbar-track { background:${THEME.brandLight}; }
  ::-webkit-scrollbar-thumb { background:${THEME.brandMid};border-radius:10px; }
`;


// ─────────────────────────────────────────────
//  🔧  STATUS HELPERS  (same as ApprovalProcessList)
// ─────────────────────────────────────────────
function parseCompletedStages(statusStr) {
  if (!statusStr) return [];
  return statusStr.split(",").map((s) => s.trim()).filter(Boolean);
}

function stageIsDone(title, completedList) {
  const norm = (s) => s.replace(/\./g, "").replace(/\s/g, "").toLowerCase();
  const t = norm(title);
  return completedList.some((c) => norm(c) === t);
}

// ─────────────────────────────────────────────
//  STAGE BADGE
// ─────────────────────────────────────────────
function StageBadge({ title, done, days, members, hod }) {
  return (
    <div style={{ marginBottom: 5 }}>
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"5px 9px", borderRadius:8,
        background: done ? "#F6FFED" : "#FAFAFA",
        border: `1.5px solid ${done ? "#B7EB8F" : THEME.border}`,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{
            width:7, height:7, borderRadius:"50%", flexShrink:0,
            background: done ? "#389E0D" : "#D9D9D9",
            boxShadow: done ? "0 0 0 2px #B7EB8F" : "none",
          }} />
          <span style={{ fontSize:11, fontWeight:700, color: done ? "#389E0D" : THEME.textMuted }}>
            {title}
          </span>
          {done && <span style={{ fontSize:9, color:"#389E0D" }}>✓</span>}
        </div>
        {days !== undefined && days !== 0 && (
          <span style={{
            fontSize:9, fontWeight:700, padding:"1px 6px", borderRadius:20,
            background: done ? "#F6FFED" : (days > 0 ? "#FFF1F0" : "#F6FFED"),
            color:      done ? "#389E0D" : (days > 0 ? "#CF1322" : "#389E0D"),
            border:`1px solid ${done ? "#B7EB8F" : (days > 0 ? "#FFA39E" : "#B7EB8F")}`,
          }}>
            {days > 0 ? `+${days}d` : `${days}d`}
          </span>
        )}
      </div>
      {(hod || members) && (
        <p style={{ margin:"2px 0 0 18px", fontSize:9, color:THEME.textMuted }}>
          👤 {[hod, members].filter(Boolean).join(", ")}
        </p>
      )}
    </div>
  );
}


// ─────────────────────────────────────────────
//  TABLE ROW  (memo)
// ─────────────────────────────────────────────
const ProjectRow = memo(({ item, index }) => {
  const completedStages = useMemo(() => parseCompletedStages(item.status), [item.status]);
  const total     = item.member_names?.length || 0;
  const doneCount = item.member_names?.filter((s) => stageIsDone(s.title, completedStages)).length || 0;
  const pct       = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  return (
    <tr>
      {/* # */}
      <td style={{ color:THEME.textMuted, fontWeight:700, fontSize:12, width:36, paddingTop:14 }}>{index + 1}</td>

      {/* Case No. */}
      <td>
        <p style={{ margin:"0 0 2px", fontSize:13, fontWeight:700, color:THEME.brand }}>
          {item.case_id}
          {item.client_name && (
            <span style={{ fontWeight:400, color:THEME.textMuted }}> ({item.client_name})</span>
          )}
        </p>
        {item.project_name && (
          <p style={{ margin:"2px 0 6px", fontSize:12, color:THEME.textMuted }}>{item.project_name}</p>
        )}
        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
          {item.projectType && (
            <span style={{ padding:"2px 8px", borderRadius:20, fontSize:10, fontWeight:600, background:THEME.brandLight, color:THEME.brandDark, border:`1px solid #D4C4A0` }}>
              {item.projectType}
            </span>
          )}
          {item.category && (
            <span style={{ padding:"2px 8px", borderRadius:20, fontSize:10, fontWeight:600, background:"#F9F0FF", color:"#531DAB", border:"1px solid #D3ADF7" }}>
              {item.category}
            </span>
          )}
        </div>
      </td>

      {/* Land Details */}
      <td style={{ maxWidth:200, fontSize:12, color:"#595959" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
          {(item.village || item.tpscheme) && (
            <span>🏘️ {[item.village, item.tpscheme].filter(Boolean).join(", ")}</span>
          )}
          {(item.op_no || item.fp_no) && (
            <span>O.P: {item.op_no || "—"} / F.P: {item.fp_no || "—"}</span>
          )}
          {item.subplot_no && <span>Subplot: {item.subplot_no}</span>}
          {(item.rs_no || item.b_no) && (
            <span>R.S: {item.rs_no || "—"} / B: {item.b_no || "—"}</span>
          )}
        </div>
      </td>

      {/* Authority */}
      <td style={{ whiteSpace:"nowrap" }}>
        {item.authority ? (
          <span style={{ padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, background:"#F0F5FF", color:"#2F54EB", border:"1px solid #ADC6FF" }}>
            {item.authority}
          </span>
        ) : "—"}
      </td>

      {/* Team & Stage Progress */}
      <td style={{ minWidth:260 }}>
        {/* Progress bar */}
        {total > 0 && (
          <div style={{ marginBottom:8 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:9, fontWeight:700, color:THEME.textMuted, textTransform:"uppercase", letterSpacing:"0.06em" }}>
                Stage Progress
              </span>
              <span style={{ fontSize:11, fontWeight:800, color:THEME.brand, fontFamily:"'Sora',sans-serif" }}>
                {doneCount}/{total}
              </span>
            </div>
            <div className="epj-progress-track">
              <div className="epj-progress-fill" style={{ width:`${pct}%` }} />
            </div>
          </div>
        )}

        {Array.isArray(item.member_names) && item.member_names.map((stage, i) => (
          <StageBadge
            key={i}
            title={stage.title}
            done={stageIsDone(stage.title, completedStages)}
            days={stage.days}
            members={stage.member_names}
            hod={item.hod}
          />
        ))}
      </td>
    </tr>
  );
});


// ─────────────────────────────────────────────
//  TAB CONFIG
// ─────────────────────────────────────────────
const TABS = [
  { key:"approval",     label:"Approval",     icon:"📋" },
  { key:"architecture", label:"Architecture", icon:"🏛" },
  { key:"interior",     label:"Interior",     icon:"🏠" },
];


// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
function EmpProject() {
  const params = useParams();
  const header = { Authorization:`Bearer ${getToken()}`, "Content-Type":"application/json" };

  const [activeTab,        setActiveTab]        = useState("approval");
  const [loading,          setLoading]          = useState(false);
  const [approvalData,     setApprovalData]     = useState([]);
  const [architectureData, setArchitectureData] = useState([]);
  const [interiorData,     setInteriorData]     = useState([]);

  // ── All 3 in parallel ─────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [approvalRes, archRes, intRes] = await Promise.all([
        ApiService(null, params.id, header, empProjectApproval.method,     empProjectApproval.url),
        ApiService(null, params.id, header, empProjectArchitecture.method, empProjectArchitecture.url),
        ApiService(null, params.id, header, empProjectInterior.method,     empProjectInterior.url),
      ]);
      const safe = (res) => Array.isArray(res?.data?.data) ? res.data.data : [];
      setApprovalData(safe(approvalRes));
      setArchitectureData(safe(archRes));
      setInteriorData(safe(intRes));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [params.id]);

  useEffect(() => { fetchAll(); }, []);

  // ── Active tab data ───────────────────────
  const filteredData = useMemo(() => {
    const src = { approval:approvalData, architecture:architectureData, interior:interiorData }[activeTab] || [];
    return [...src].sort((a, b) => b.id - a.id);
  }, [activeTab, approvalData, architectureData, interiorData]);

  const counts = useMemo(() => ({
    approval:     approvalData.length,
    architecture: architectureData.length,
    interior:     interiorData.length,
  }), [approvalData, architectureData, interiorData]);

  return (
    <>
      <style>{CSS}</style>

      <div style={{ fontFamily:"'DM Sans',sans-serif", padding:"20px 0 0" }}>

        {/* ── Stats bar ── */}
        {!loading && (approvalData.length + architectureData.length + interiorData.length) > 0 && (
          <div style={{ display:"flex", gap:12, marginBottom:16, flexWrap:"wrap" }}>
            {[
              { label:"Approval",     value:approvalData.length,     color:THEME.brand  },
              { label:"Architecture", value:architectureData.length,  color:"#2F54EB"   },
              { label:"Interior",     value:interiorData.length,      color:"#08979C"   },
            ].map((s) => (
              <div key={s.label} style={{ background:"#fff", border:`1px solid ${THEME.border}`, borderRadius:10, padding:"10px 16px", borderTop:`3px solid ${s.color}`, boxShadow:"0 2px 8px rgba(136,117,73,0.06)", minWidth:110 }}>
                <p style={{ margin:0, fontSize:10, fontWeight:700, color:THEME.textMuted, textTransform:"uppercase", letterSpacing:"0.07em" }}>{s.label}</p>
                <p style={{ margin:"3px 0 0", fontSize:18, fontWeight:800, color:s.color, fontFamily:"'Sora',sans-serif" }}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Main card ── */}
        <div style={{ background:"#fff", border:`1px solid ${THEME.border}`, borderRadius:14, overflow:"hidden", boxShadow:"0 2px 12px rgba(136,117,73,0.07)" }}>

          {/* Tab bar */}
          <div style={{ padding:"14px 20px", borderBottom:`1px solid ${THEME.border}`, background:"#FDFAF5" }}>
            <ul className="epj-tabs">
              {TABS.map((t) => (
                <li key={t.key}>
                  <button
                    className={`epj-tab${activeTab === t.key ? " active" : ""}`}
                    onClick={() => setActiveTab(t.key)}
                  >
                    <span>{t.icon}</span>
                    {t.label}
                    <span className="epj-tab-count">{counts[t.key] ?? 0}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"60px 0", gap:16 }}>
              <div className="epj-spinner" />
              <p style={{ color:THEME.textLight, fontSize:13, margin:0 }}>Loading projects…</p>
            </div>
          )}

          {/* Empty */}
          {!loading && filteredData.length === 0 && (
            <div style={{ textAlign:"center", padding:"56px 0" }}>
              <div style={{ fontSize:38, marginBottom:10 }}>🏗</div>
              <p style={{ color:THEME.textLight, fontSize:14, margin:0 }}>No projects found for this category.</p>
            </div>
          )}

          {/* Table */}
          {!loading && filteredData.length > 0 && (
            <div className="epj-fade" style={{ overflowX:"auto" }}>
              <table className="epj-table">
                <thead>
                  <tr>
                    <th style={{ width:36 }}>#</th>
                    <th>Case No.</th>
                    <th>Land Details</th>
                    <th>Authority</th>
                    <th>Team & Stage Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, idx) => (
                    <ProjectRow key={item.id} item={item} index={idx} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default EmpProject;