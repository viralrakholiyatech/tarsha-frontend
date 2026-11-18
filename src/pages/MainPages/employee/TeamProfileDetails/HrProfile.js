import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getEmployeeById } from "../../../../services/EmployeeService";
import { getToken } from "../../../../services/useLocalStorage";
import { FileUrl } from "../../../../config/file_url";

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
  textMuted: "#8A8A8A",
  textLight: "#BDBDBD",
  success: "#2D9D78",
  successBg: "#EAF7F2",
  warning: "#D97706",
  warningBg: "#FEF3C7",
  danger: "#DC2626",
  dangerBg: "#FEE2E2",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }

  @keyframes hrFadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes hrShimmer { 0% { background-position:-400px 0; } 100% { background-position:400px 0; } }
  .hr-fade { animation: hrFadeIn 0.35s cubic-bezier(0.4,0,0.2,1) both; }

  .hr-grid      { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .hr-grid-3    { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; }
  .hr-grid-full { grid-column:1 / -1; }
  @media (max-width:700px) { .hr-grid, .hr-grid-3 { grid-template-columns:1fr; } }

  .hr-section { background:#fff; border:1.5px solid ${THEME.border}; border-radius:12px; overflow:hidden; }
  .hr-section-header { display:flex; align-items:center; gap:10px; padding:13px 18px; background:#FDFAF5; border-bottom:1px solid ${THEME.border}; }
  .hr-section-icon { width:30px; height:30px; border-radius:8px; background:${THEME.brandLight}; display:flex; align-items:center; justify-content:center; font-size:15px; flex-shrink:0; }
  .hr-section-title { font-family:'Sora',sans-serif; font-size:13px; font-weight:700; color:${THEME.brandDark}; margin:0; letter-spacing:0.3px; text-transform:uppercase; }
  .hr-section-body { padding:16px 18px; }

  .hr-field { display:flex; flex-direction:column; gap:3px; }
  .hr-label { font-size:11px; font-weight:600; color:${THEME.textMuted}; text-transform:uppercase; letter-spacing:0.5px; font-family:'DM Sans',sans-serif; }
  .hr-value { font-size:14px; font-weight:600; color:${THEME.text}; font-family:'DM Sans',sans-serif; line-height:1.4; }

  .hr-badge { display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:20px; font-size:12px; font-weight:600; font-family:'DM Sans',sans-serif; }
  .hr-badge-green  { background:${THEME.successBg}; color:${THEME.success}; }
  .hr-badge-gold   { background:${THEME.brandLight}; color:${THEME.brand}; }
  .hr-badge-orange { background:${THEME.warningBg}; color:${THEME.warning}; }
  .hr-badge-red    { background:${THEME.dangerBg};  color:${THEME.danger}; }
  .hr-badge-blue   { background:#E6F7FF; color:#0958D9; }
  .hr-badge-purple { background:#F9F0FF; color:#722ED1; }

  .hr-pill-wrap { display:flex; flex-wrap:wrap; gap:7px; margin-top:4px; }
  .hr-pill { padding:5px 12px; border-radius:20px; background:${THEME.brandLight}; color:${THEME.brandDark}; font-size:12px; font-weight:600; font-family:'DM Sans',sans-serif; border:1px solid ${THEME.border}; }

  .hr-progress-wrap { margin-top:12px; display:flex; flex-direction:column; gap:10px; }
  .hr-progress-row  { display:flex; flex-direction:column; gap:4px; }
  .hr-progress-label { display:flex; justify-content:space-between; }
  .hr-progress-track { height:6px; border-radius:10px; background:${THEME.brandLight}; overflow:hidden; }
  .hr-progress-bar { height:100%; border-radius:10px; background:linear-gradient(90deg,${THEME.brandMid},${THEME.brand}); transition:width 0.6s cubic-bezier(.4,0,.2,1); }

  .hr-timeline { display:flex; flex-direction:column; }
  .hr-timeline-item { display:flex; gap:12px; padding-bottom:16px; }
  .hr-timeline-item:last-child { padding-bottom:0; }
  .hr-timeline-dot-wrap { display:flex; flex-direction:column; align-items:center; flex-shrink:0; }
  .hr-timeline-dot { width:10px; height:10px; border-radius:50%; background:${THEME.brand}; border:2px solid #fff; box-shadow:0 0 0 2px ${THEME.brandMid}; flex-shrink:0; margin-top:4px; }
  .hr-timeline-line { width:2px; flex:1; background:${THEME.border}; margin-top:4px; min-height:20px; }
  .hr-timeline-content { flex:1; }
  .hr-timeline-role { font-size:13px; font-weight:700; color:${THEME.text}; font-family:'Sora',sans-serif; }
  .hr-timeline-meta { font-size:12px; color:${THEME.textMuted}; margin-top:2px; font-family:'DM Sans',sans-serif; }

  .hr-stat-card { background:linear-gradient(135deg,${THEME.brandLight} 0%,#fff 100%); border:1.5px solid ${THEME.border}; border-radius:10px; padding:14px 16px; display:flex; flex-direction:column; gap:4px; }
  .hr-stat-number { font-size:22px; font-weight:800; color:${THEME.brand}; font-family:'Sora',sans-serif; }
  .hr-stat-label  { font-size:11px; color:${THEME.textMuted}; font-weight:600; text-transform:uppercase; letter-spacing:0.4px; font-family:'DM Sans',sans-serif; }

  .hr-contact-row { display:flex; align-items:center; gap:10px; padding:10px 0; border-bottom:1px solid ${THEME.border}; }
  .hr-contact-row:last-child { border-bottom:none; }
  .hr-contact-icon { font-size:16px; flex-shrink:0; width:24px; text-align:center; }
  .hr-contact-info { flex:1; }
  .hr-contact-name { font-size:13px; font-weight:700; color:${THEME.text}; font-family:'DM Sans',sans-serif; }
  .hr-contact-sub  { font-size:12px; color:${THEME.textMuted}; font-family:'DM Sans',sans-serif; }

  .hr-skeleton { background:linear-gradient(90deg,#f0e8d8 25%,#faf5ed 50%,#f0e8d8 75%); background-size:400px 100%; animation:hrShimmer 1.4s ease-in-out infinite; border-radius:8px; }
  .hr-empty { text-align:center; padding:20px; color:${THEME.textMuted}; font-size:13px; font-family:'DM Sans',sans-serif; }

  /* ── Deliverables Tab ── */
  .hr-tab-strip { display:flex; gap:8px; margin-bottom:16px; flex-wrap:wrap; }
  .hr-tab-btn { padding:6px 14px; border-radius:8px; font-size:12px; font-weight:700; border:1.5px solid ${THEME.border}; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.15s; background:#fff; color:#595959; }
  .hr-tab-btn.active { background:${THEME.brand}; color:#fff; border-color:${THEME.brand}; }

  /* ── Authority blocks ── */
  .hr-authority-block { border-radius:10px; padding:14px 16px; margin-bottom:10px; }
  .hr-authority-block:last-child { margin-bottom:0; }

  /* ── KPI card ── */
  .hr-kpi-row { display:flex; align-items:center; gap:10px; padding:8px 12px; background:${THEME.brandLight}; border-radius:10px; border:1px solid ${THEME.border}; margin-bottom:6px; }
  .hr-kpi-row:last-child { margin-bottom:0; }

  /* ── Stage items ── */
  .hr-stage-item { display:flex; align-items:flex-start; gap:10px; padding:10px 14px; border-radius:10px; margin-bottom:8px; border:1px solid ${THEME.border}; }
  .hr-stage-item:last-child { margin-bottom:0; }
  .hr-stage-badge { flex-shrink:0; padding:2px 10px; border-radius:20px; font-size:11px; font-weight:700; font-family:'DM Sans',sans-serif; }

  /* ── Growth bar ── */
  .hr-growth-track { height:10px; border-radius:10px; background:${THEME.brandLight}; overflow:hidden; margin:8px 0; }
  .hr-growth-fill  { height:100%; border-radius:10px; background:linear-gradient(90deg,${THEME.brandMid},${THEME.brand}); transition:width 0.6s ease; }

  /* ── Career timeline (growth path) ── */
  .hr-career-item { display:flex; align-items:flex-start; gap:12px; padding-left:44px; position:relative; margin-bottom:10px; }
  .hr-career-item:last-child { margin-bottom:0; }
  .hr-career-dot { position:absolute; left:12px; top:10px; width:16px; height:16px; border-radius:50%; background:${THEME.brand}; border:2px solid #fff; box-shadow:0 0 0 2px ${THEME.brandMid}; }
  .hr-career-line { position:absolute; left:19px; top:26px; bottom:-10px; width:2px; background:${THEME.border}; }
`;

// ─────────────────────────────────────────────
//  UTILS
// ─────────────────────────────────────────────
function fmtDate(val) {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d)) return val;
  return d.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}
function orDash(val) {
  return val && String(val).trim() ? val : "—";
}
function calcTenure(joiningDate) {
  if (!joiningDate) return "—";
  const start = new Date(joiningDate);
  const now = new Date();
  const totalMonths = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  const y = Math.floor(totalMonths / 12);
  const m = totalMonths % 12;
  if (y === 0) return `${m} mo`;
  if (m === 0) return `${y} yr${y > 1 ? "s" : ""}`;
  return `${y} yr${y > 1 ? "s" : ""} ${m} mo`;
}
function contactIcon(relation = "") {
  const r = relation.toLowerCase();
  if (r.includes("spouse") || r.includes("wife")) return "👩";
  if (r.includes("husband")) return "👨";
  if (r.includes("father") || r.includes("dad")) return "👨‍🦳";
  if (r.includes("mother") || r.includes("mom")) return "👩‍🦳";
  if (r.includes("brother")) return "👦";
  if (r.includes("sister")) return "👧";
  return "👤";
}

// ─────────────────────────────────────────────
//  ATOMS
// ─────────────────────────────────────────────
function Section({ icon, title, children }) {
  return (
    <div className="hr-section">
      <div className="hr-section-header">
        <div className="hr-section-icon">{icon}</div>
        <p className="hr-section-title">{title}</p>
      </div>
      <div className="hr-section-body">{children}</div>
    </div>
  );
}
function Field({ label, value, badge, badgeType = "gold" }) {
  return (
    <div className="hr-field">
      <span className="hr-label">{label}</span>
      {badge ? (
        <span className={`hr-badge hr-badge-${badgeType}`}><span>●</span>{orDash(value)}</span>
      ) : (
        <span className="hr-value">{orDash(value)}</span>
      )}
    </div>
  );
}
function Empty({ msg = "No data added yet." }) {
  return <div className="hr-empty">{msg}</div>;
}
function PillList({ items, styleOverride }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="hr-pill-wrap">
      {items.map((item, i) => (
        <span className="hr-pill" key={i} style={styleOverride}>{item}</span>
      ))}
    </div>
  );
}
function LoadingSkeleton() {
  const Skel = ({ h = 14, w = "100%" }) => (
    <div className="hr-skeleton" style={{ height: h, width: w }} />
  );
  return (
    <div style={{ padding: "20px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="hr-section">
          <div className="hr-section-header" style={{ gap: 10 }}>
            <Skel h={30} w="30px" /><Skel h={12} w="140px" />
          </div>
          <div className="hr-section-body">
            <div className="hr-grid" style={{ rowGap: 16 }}>
              {[1, 2, 3, 4].map((j) => (
                <div key={j} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <Skel h={10} w="70px" /><Skel h={16} w="90%" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
//  EXISTING SECTION COMPONENTS
// ─────────────────────────────────────────────

/** 🔐 Authority & Decision Rights */
function AuthoritySection({ authority }) {
  const blocks = [
    { key: "can_decide", label: "✅ Can Decide Independently", color: "#F6FFED", border: "#B7EB8F", badge: "#52C41A" },
    { key: "must_escalate", label: "⚠️ Must Escalate", color: "#FFFBE6", border: "#FFE58F", badge: "#FAAD14" },
    { key: "cannot_decide", label: "🚫 Cannot Decide or Commit", color: "#FFF1F0", border: "#FFA39E", badge: "#FF4D4F" },
  ];
  const hasAny = blocks.some((b) => (authority[b.key] || []).length > 0);
  if (!hasAny) return <Empty msg="No authority rights defined yet." />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {blocks.map(({ key, label, color, border, badge }) => {
        const items = authority[key] || [];
        if (items.length === 0) return null;
        return (
          <div key={key} style={{ background: color, border: `1.5px solid ${border}`, borderRadius: 12, padding: "12px 16px" }}>
            <span style={{ display: "inline-block", background: badge, color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20, fontFamily: "'DM Sans',sans-serif", marginBottom: 10 }}>{label}</span>
            <div className="hr-pill-wrap" style={{ marginTop: 0 }}>
              {items.map((item, i) => (
                <span key={i} style={{ padding: "4px 12px", borderRadius: 20, background: "#fff", border: `1px solid ${border}`, fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", color: "#1A1A2E" }}>{item}</span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** 📅 Deliverables (tabbed) */
function DeliverablesSection({ deliverables }) {
  const [activeTab, setActiveTab] = useState("daily");
  const tabs = [
    { key: "daily", label: "📅 Daily" },
    { key: "weekly", label: "📆 Weekly" },
    { key: "monthly", label: "🗓️ Monthly" },
  ];
  const hasAny = tabs.some((t) => (deliverables[t.key] || []).length > 0);
  if (!hasAny) return <Empty msg="No deliverables defined yet." />;
  return (
    <div>
      <div className="hr-tab-strip">
        {tabs.map((t) => (
          <button key={t.key} className={`hr-tab-btn${activeTab === t.key ? " active" : ""}`} onClick={() => setActiveTab(t.key)}>{t.label}</button>
        ))}
      </div>
      {tabs.map((t) => activeTab === t.key ? (
        <div key={t.key}>
          {(deliverables[t.key] || []).length > 0 ? (
            <div className="hr-pill-wrap">
              {deliverables[t.key].map((item, i) => <span className="hr-pill" key={i}>✓ {item}</span>)}
            </div>
          ) : <Empty msg={`No ${t.key} deliverables added yet.`} />}
        </div>
      ) : null)}
    </div>
  );
}

/** 📊 KPIs */
function KpiSection({ kpis }) {
  if (!kpis || kpis.length === 0) return <Empty msg="No KPIs defined yet." />;
  const grouped = kpis.reduce((acc, kpi) => {
    const cat = kpi.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(kpi);
    return acc;
  }, {});
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat}>
          <div style={{ fontSize: 11, fontWeight: 700, color: THEME.brand, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, fontFamily: "'DM Sans',sans-serif" }}>{cat} KPIs</div>
          {items.map((kpi, i) => (
            <div className="hr-kpi-row" key={i}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: THEME.text, fontFamily: "'DM Sans',sans-serif" }}>{kpi.metric}</div>
                {kpi.target && <div style={{ fontSize: 11, color: THEME.textMuted, fontFamily: "'DM Sans',sans-serif", marginTop: 2 }}>Target: {kpi.target}</div>}
              </div>
              <span className="hr-badge hr-badge-gold">{cat}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/** 📈 Growth Index */
function GrowthIndexSection({ growth }) {
  const zones = [
    { range: "1–2", label: "New / highly dependent" },
    { range: "3–4", label: "Contributing but learning" },
    { range: "5–6", label: "Reliable; needs ownership support" },
    { range: "7–8", label: "Strong performer; trusted" },
    { range: "9–10", label: "Top-level; leads outcomes" },
  ];
  const hasData = growth.current_zone || growth.target_zone || (growth.top_level_criteria || []).length > 0;
  if (!hasData) return <Empty msg="No growth index data added yet." />;
  const currentPct = growth.current_zone ? (Math.min(10, Math.max(1, Number(growth.current_zone))) / 10) * 100 : 0;
  const targetPct = growth.target_zone ? (Math.min(10, Math.max(1, Number(growth.target_zone))) / 10) * 100 : 0;
  return (
    <div>
      <div className="hr-grid" style={{ rowGap: 16, marginBottom: 16 }}>
        <div className="hr-field">
          <span className="hr-label">Current Growth Zone</span>
          <span className="hr-value" style={{ fontSize: 22, color: THEME.brand }}>{growth.current_zone ? `${growth.current_zone} / 10` : "—"}</span>
        </div>
        <div className="hr-field">
          <span className="hr-label">Target Growth Zone</span>
          <span className="hr-value" style={{ fontSize: 22, color: THEME.brandDark }}>{growth.target_zone ? `${growth.target_zone} / 10` : "—"}</span>
        </div>
      </div>
      {growth.current_zone && (
        <div style={{ marginBottom: 16 }}>
          <span className="hr-label" style={{ display: "block", marginBottom: 4 }}>Current Level</span>
          <div className="hr-growth-track"><div className="hr-growth-fill" style={{ width: `${currentPct}%` }} /></div>
          {growth.target_zone && (
            <>
              <span className="hr-label" style={{ display: "block", marginBottom: 4, marginTop: 10 }}>Target Level</span>
              <div className="hr-growth-track"><div className="hr-growth-fill" style={{ width: `${targetPct}%`, background: `linear-gradient(90deg,${THEME.brandLight},${THEME.brandMid})`, opacity: 0.7 }} /></div>
            </>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: THEME.textMuted, fontFamily: "'DM Sans',sans-serif", marginTop: 2 }}>
            <span>1</span><span>5</span><span>10</span>
          </div>
        </div>
      )}
      {(growth.top_level_criteria || []).length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <span className="hr-label" style={{ display: "block", marginBottom: 8 }}>What Top Level Looks Like</span>
          <div className="hr-pill-wrap">
            {growth.top_level_criteria.map((c, i) => <span className="hr-pill" key={i}>★ {c}</span>)}
          </div>
        </div>
      )}
      <div style={{ background: THEME.brandLight, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: "14px 16px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: THEME.brand, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10, fontFamily: "'DM Sans',sans-serif" }}>Scale Reference</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {zones.map((z) => (
            <div key={z.range} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ background: growth.current_zone && Number(growth.current_zone) >= parseInt(z.range) && Number(growth.current_zone) <= parseInt(z.range.split("–")[1]) ? THEME.brand : THEME.brandMid, color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 20, minWidth: 36, textAlign: "center", fontFamily: "'DM Sans',sans-serif" }}>{z.range}</span>
              <span style={{ fontSize: 12, color: THEME.text, fontFamily: "'DM Sans',sans-serif" }}>{z.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** ⚠️ Risks & Warning Ladder */
function RisksWarningSection({ risks }) {
  const stages = [
    { key: "stage_1", label: "Stage 1", desc: "Coaching conversation with clear expectations", color: "#FFFBE6", border: "#FFE58F", badge: "#FAAD14" },
    { key: "stage_2", label: "Stage 2", desc: "Written development focus with measurable support goals", color: "#FFF7E6", border: "#FFD591", badge: "#FA8C16" },
    { key: "stage_3", label: "Stage 3", desc: "Role redesign, focused mentoring, or reassessment of responsibility load", color: "#FFF1F0", border: "#FFA39E", badge: "#FF4D4F" },
  ];
  const hasAny = (risks.risk_flags || []).length > 0 || risks.stage_1 || risks.stage_2 || risks.stage_3 || (risks.not_responsible || []).length > 0;
  if (!hasAny) return <Empty msg="No risk data added yet." />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {(risks.risk_flags || []).length > 0 && (
        <div>
          <span className="hr-label" style={{ display: "block", marginBottom: 8 }}>🚩 Risk Flags — This Role Needs Support If</span>
          <div className="hr-pill-wrap">
            {risks.risk_flags.map((flag, i) => <span key={i} className="hr-pill" style={{ background: "#FFF7E6", color: "#D97706", borderColor: "#FFD591" }}>⚠ {flag}</span>)}
          </div>
        </div>
      )}
      {stages.some((s) => risks[s.key]) && (
        <div>
          <span className="hr-label" style={{ display: "block", marginBottom: 8 }}>📋 HR Review / Warning Ladder</span>
          {stages.map((s) => risks[s.key] ? (
            <div key={s.key} className="hr-stage-item" style={{ background: s.color, borderColor: s.border }}>
              <span className="hr-stage-badge" style={{ background: s.badge, color: "#fff" }}>{s.label}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: THEME.text, fontFamily: "'DM Sans',sans-serif", marginBottom: 4 }}>{s.desc}</div>
                <div style={{ fontSize: 13, color: THEME.text, fontFamily: "'DM Sans',sans-serif" }}>{risks[s.key]}</div>
              </div>
            </div>
          ) : null)}
        </div>
      )}
      {(risks.not_responsible || []).length > 0 && (
        <div>
          <span className="hr-label" style={{ display: "block", marginBottom: 8 }}>🚫 What This Role Is NOT Responsible For</span>
          <div className="hr-pill-wrap">
            {risks.not_responsible.map((item, i) => <span key={i} className="hr-pill" style={{ background: "#FFF1F0", color: THEME.danger, borderColor: "#FFA39E" }}>✕ {item}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
//  NEW SECTION COMPONENTS
// ─────────────────────────────────────────────

/** 🧠 Domain Knowledge */
function DomainKnowledgeSection({ items }) {
  if (!items || items.length === 0) return <Empty msg="No domain knowledge added yet." />;
  const levelColors = {
    Awareness: { bg: "#F5F5F5", color: "#595959", border: "#D9D9D9" },
    Working:   { bg: "#E6F7FF", color: "#0958D9", border: "#91CAFF" },
    Deep:      { bg: "#F6FFED", color: "#389E0D", border: "#B7EB8F" },
    Expert:    { bg: "#FFF7E6", color: "#D46B08", border: "#FFD591" },
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((d, i) => {
        const lc = levelColors[d.level] || levelColors.Working;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", background: THEME.brandLight, borderRadius: 10, border: `1px solid ${THEME.border}` }}>
            <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: THEME.text, fontFamily: "'DM Sans',sans-serif" }}>{d.topic}</div>
            <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: lc.bg, color: lc.color, border: `1px solid ${lc.border}`, fontFamily: "'DM Sans',sans-serif", flexShrink: 0 }}>{d.level}</span>
          </div>
        );
      })}
    </div>
  );
}

/** 💻 Software & Tools */
function SoftwareToolsSection({ items }) {
  if (!items || items.length === 0) return <Empty msg="No software & tools added yet." />;
  const levelColors = {
    Basic:        { bg: "#F5F5F5", color: "#595959", border: "#D9D9D9" },
    Proficient:   { bg: "#E6F7FF", color: "#0958D9", border: "#91CAFF" },
    Intermediate: { bg: "#FFF7E6", color: "#D46B08", border: "#FFD591" },
    Expert:       { bg: "#F6FFED", color: "#389E0D", border: "#B7EB8F" },
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((s, i) => {
        const lc = levelColors[s.level] || levelColors.Proficient;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", background: THEME.brandLight, borderRadius: 10, border: `1px solid ${THEME.border}` }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: THEME.text, fontFamily: "'DM Sans',sans-serif" }}>{s.tool}</div>
              {s.note && <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2, fontFamily: "'DM Sans',sans-serif" }}>{s.note}</div>}
            </div>
            <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: lc.bg, color: lc.color, border: `1px solid ${lc.border}`, fontFamily: "'DM Sans',sans-serif", flexShrink: 0 }}>{s.level}</span>
          </div>
        );
      })}
    </div>
  );
}

/** 🎭 Behavioural Competencies */
function BehaviouralCompetenciesSection({ items }) {
  if (!items || items.length === 0) return <Empty msg="No behavioural competencies added yet." />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((c, i) => (
        <div key={i} style={{ padding: "10px 14px", background: THEME.brandLight, borderRadius: 10, border: `1px solid ${THEME.border}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: THEME.brand, fontFamily: "'DM Sans',sans-serif" }}>{c.competency}</div>
          {c.description && <div style={{ fontSize: 12, color: THEME.text, marginTop: 4, lineHeight: 1.5, fontFamily: "'DM Sans',sans-serif" }}>{c.description}</div>}
        </div>
      ))}
    </div>
  );
}

/** 📋 KRAs & Monthly Targets */
function KraSection({ items }) {
  if (!items || items.length === 0) return <Empty msg="No KRAs defined yet." />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((k, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", background: THEME.brandLight, borderRadius: 10, border: `1px solid ${THEME.border}` }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: THEME.text, fontFamily: "'DM Sans',sans-serif" }}>{k.kra}</div>
          </div>
          {k.target && (
            <span style={{ padding: "2px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: THEME.brand, color: "#fff", fontFamily: "'DM Sans',sans-serif", flexShrink: 0 }}>{k.target}</span>
          )}
        </div>
      ))}
    </div>
  );
}

/** 🖥️ System & Software Module Duties */
function SystemDutiesSection({ items }) {
  if (!items || items.length === 0) return <Empty msg="No system duties defined yet." />;
  const freqColors = {
    "Daily":          { bg: "#F6FFED", color: "#389E0D", border: "#B7EB8F" },
    "Weekly":         { bg: "#E6F7FF", color: "#0958D9", border: "#91CAFF" },
    "Every 15 days":  { bg: "#FFF7E6", color: "#D46B08", border: "#FFD591" },
    "Monthly":        { bg: "#F9F0FF", color: "#722ED1", border: "#D3ADF7" },
    "Per task":       { bg: "#F5F5F5", color: "#595959", border: "#D9D9D9" },
  };
  const grouped = items.reduce((acc, item) => {
    const freq = item.frequency || "Per task";
    if (!acc[freq]) acc[freq] = [];
    acc[freq].push(item);
    return acc;
  }, {});
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {Object.entries(grouped).map(([freq, group]) => {
        const fc = freqColors[freq] || freqColors["Per task"];
        return (
          <div key={freq}>
            <div style={{ display: "inline-flex", alignItems: "center", padding: "3px 12px", borderRadius: 20, background: fc.bg, border: `1px solid ${fc.border}`, marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: fc.color, fontFamily: "'DM Sans',sans-serif" }}>{freq}</span>
            </div>
            {group.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", background: THEME.brandLight, borderRadius: 10, border: `1px solid ${THEME.border}`, marginBottom: 6 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: THEME.text, fontFamily: "'DM Sans',sans-serif" }}>{s.module}</div>
                  <div style={{ fontSize: 12, color: THEME.textMuted, marginTop: 2, fontFamily: "'DM Sans',sans-serif" }}>{s.duty}</div>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

/** 📝 Hiring Requirements & Onboarding */
function HiringRequirementsSection({ data }) {
  const hasData = (data.min_requirements || []).length > 0 || data.interview_test || data.first_45_days;
  if (!hasData) return <Empty msg="No hiring requirements added yet." />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {(data.min_requirements || []).length > 0 && (
        <div>
          <span className="hr-label" style={{ display: "block", marginBottom: 8 }}>📌 Minimum Requirements</span>
          <div className="hr-pill-wrap">
            {data.min_requirements.map((r, i) => <span key={i} className="hr-pill">✓ {r}</span>)}
          </div>
        </div>
      )}
      {data.interview_test && (
        <div>
          <span className="hr-label" style={{ display: "block", marginBottom: 8 }}>🧪 Interview Test — Mandatory</span>
          <div style={{ padding: "12px 16px", background: "#E6F7FF", border: "1.5px solid #91CAFF", borderRadius: 10 }}>
            <p style={{ margin: 0, fontSize: 13, color: THEME.text, lineHeight: 1.6, fontFamily: "'DM Sans',sans-serif" }}>{data.interview_test}</p>
          </div>
        </div>
      )}
      {data.first_45_days && (
        <div>
          <span className="hr-label" style={{ display: "block", marginBottom: 8 }}>🗓️ First 45 Days Onboarding Plan</span>
          <div style={{ padding: "12px 16px", background: "#F6FFED", border: "1.5px solid #B7EB8F", borderRadius: 10 }}>
            <p style={{ margin: 0, fontSize: 13, color: THEME.text, lineHeight: 1.6, fontFamily: "'DM Sans',sans-serif" }}>{data.first_45_days}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/** 🚦 Hiring Flags */
function HiringFlagsSection({ data }) {
  const hasData = (data.green_flags || []).length > 0 || (data.red_flags || []).length > 0;
  if (!hasData) return <Empty msg="No hiring flags added yet." />;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      {(data.green_flags || []).length > 0 && (
        <div style={{ background: "#F6FFED", border: "1.5px solid #B7EB8F", borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ marginBottom: 10 }}>
            <span style={{ background: "#52C41A", color: "#fff", fontSize: 11, fontWeight: 800, padding: "3px 12px", borderRadius: 20, fontFamily: "'DM Sans',sans-serif" }}>✓ GREEN FLAGS — HIRE</span>
          </div>
          <div className="hr-pill-wrap" style={{ marginTop: 0 }}>
            {data.green_flags.map((f, i) => <span key={i} style={{ padding: "4px 12px", borderRadius: 20, background: "#fff", border: "1px solid #B7EB8F", fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", color: "#1A1A2E" }}>✓ {f}</span>)}
          </div>
        </div>
      )}
      {(data.red_flags || []).length > 0 && (
        <div style={{ background: "#FFF1F0", border: "1.5px solid #FFA39E", borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ marginBottom: 10 }}>
            <span style={{ background: "#CF1322", color: "#fff", fontSize: 11, fontWeight: 800, padding: "3px 12px", borderRadius: 20, fontFamily: "'DM Sans',sans-serif" }}>✗ RED FLAGS — DO NOT HIRE</span>
          </div>
          <div className="hr-pill-wrap" style={{ marginTop: 0 }}>
            {data.red_flags.map((f, i) => <span key={i} style={{ padding: "4px 12px", borderRadius: 20, background: "#fff", border: "1px solid #FFA39E", fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", color: "#1A1A2E" }}>✕ {f}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}

/** 🏆 Gates (Competency / Performance / Behavioural) */
function GatesSection({ data }) {
  const gateTypes = [
    { key: "competency_gates", label: "Competency Gates", color: "#E6F7FF", border: "#91CAFF", badge: "#1677FF" },
    { key: "performance_gates", label: "Performance Gates", color: "#F6FFED", border: "#B7EB8F", badge: "#52C41A" },
    { key: "behavioural_gates", label: "Behavioural Gates", color: "#FFF7E6", border: "#FFD591", badge: "#FA8C16" },
  ];
  const hasAny = gateTypes.some((g) => (data[g.key] || []).length > 0);
  if (!hasAny) return <Empty msg="No gates defined yet." />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {gateTypes.map(({ key, label, color, border, badge }) => {
        const items = data[key] || [];
        if (items.length === 0) return null;
        return (
          <div key={key} style={{ background: color, border: `1.5px solid ${border}`, borderRadius: 12, padding: "12px 16px" }}>
            <span style={{ display: "inline-block", background: badge, color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 20, fontFamily: "'DM Sans',sans-serif", marginBottom: 10 }}>{label}</span>
            <div className="hr-pill-wrap" style={{ marginTop: 0 }}>
              {items.map((item, i) => <span key={i} style={{ padding: "4px 12px", borderRadius: 20, background: "#fff", border: `1px solid ${border}`, fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans',sans-serif", color: "#1A1A2E" }}>✓ {item}</span>)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** 🚀 Career Growth Path */
function CareerGrowthSection({ items }) {
  if (!items || items.length === 0) return <Empty msg="No career growth path defined yet." />;
  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "absolute", left: 20, top: 12, bottom: 12, width: 2, background: `linear-gradient(180deg, ${THEME.brand}, ${THEME.brandMid})`, borderRadius: 2 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((c, i) => (
          <div key={i} className="hr-career-item">
            <div className="hr-career-dot" />
            {i < items.length - 1 && <div className="hr-career-line" />}
            <div style={{ flex: 1, padding: "8px 12px", background: THEME.brandLight, borderRadius: 10, border: `1px solid ${THEME.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {c.grade && <span style={{ background: THEME.brand, color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 8px", borderRadius: 20, fontFamily: "'DM Sans',sans-serif" }}>{c.grade}</span>}
                <span style={{ fontSize: 13, fontWeight: 700, color: THEME.text, fontFamily: "'DM Sans',sans-serif" }}>{c.title}</span>
              </div>
              {c.condition && <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 3, fontFamily: "'DM Sans',sans-serif" }}>{c.condition}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 🛑 STOP Meeting Duties */
function StopMeetingDutiesSection({ items }) {
  if (!items || items.length === 0) return <Empty msg="No STOP meeting duties defined yet." />;
  const typeColors = {
    "Operational (Daily)":      { bg: "#F6FFED", color: "#389E0D", border: "#B7EB8F" },
    "Tactical (Every 15 days)": { bg: "#E6F7FF", color: "#0958D9", border: "#91CAFF" },
    "Strategic (Monthly)":      { bg: "#FFF7E6", color: "#D46B08", border: "#FFD591" },
    "Other":                    { bg: "#F5F5F5", color: "#595959", border: "#D9D9D9" },
  };
  const grouped = items.reduce((acc, item) => {
    const t = item.meeting_type || "Other";
    if (!acc[t]) acc[t] = [];
    acc[t].push(item);
    return acc;
  }, {});
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {Object.entries(grouped).map(([type, group]) => {
        const tc = typeColors[type] || typeColors["Other"];
        return (
          <div key={type}>
            <div style={{ display: "inline-flex", alignItems: "center", padding: "3px 12px", borderRadius: 20, background: tc.bg, border: `1px solid ${tc.border}`, marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: tc.color, fontFamily: "'DM Sans',sans-serif" }}>{type}</span>
            </div>
            {group.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", background: THEME.brandLight, borderRadius: 10, border: `1px solid ${THEME.border}`, marginBottom: 6 }}>
                <div style={{ flex: 1, fontSize: 13, color: THEME.text, fontFamily: "'DM Sans',sans-serif" }}>{item.duty}</div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
function EmpHRProfile() {
  const params = useParams();

  const [loading, setLoading] = useState(true);
  const [emp, setEmp] = useState(null);
  const [depts, setDepts] = useState([]);
  const [hrData, setHrData] = useState({
    // Original
    responsibilities: [],
    skills: [],
    work_history: [],
    education: [],
    emergency_contacts: [],
    strengths: [],
    weaknesses: [],
    authority: { can_decide: [], must_escalate: [], cannot_decide: [] },
    deliverables: { daily: [], weekly: [], monthly: [] },
    kpis: [],
    growth_index: { current_zone: "", target_zone: "", top_level_criteria: [] },
    risks_and_warning: { risk_flags: [], stage_1: "", stage_2: "", stage_3: "", not_responsible: [] },
    // New
    domain_knowledge: [],
    software_tools: [],
    behavioural_competencies: [],
    kras: [],
    system_duties: [],
    hiring_requirements: { min_requirements: [], interview_test: "", first_45_days: "" },
    hiring_flags: { green_flags: [], red_flags: [] },
    gates: { competency_gates: [], performance_gates: [], behavioural_gates: [] },
    career_growth: [],
    stop_meeting_duties: [],
  });

  useEffect(() => {
    if (!params.id) return;
    (async () => {
      try {
        setLoading(true);
        const res = await getEmployeeById(params.id, getToken());
        if (!res.data.error) {
          setEmp(res.data.data?.[0] || null);
          setDepts(res.data.departments || []);
          setHrData({
            // Original
            responsibilities: res.data.responsibilities || [],
            skills: res.data.skills || [],
            work_history: res.data.work_history || [],
            education: res.data.education || [],
            emergency_contacts: res.data.emergency_contacts || [],
            strengths: res.data.strength || [],
            weaknesses: res.data.weakness || [],
            authority: res.data.authority_rights || { can_decide: [], must_escalate: [], cannot_decide: [] },
            deliverables: res.data.deliverables || { daily: [], weekly: [], monthly: [] },
            kpis: res.data.kpis || [],
            growth_index: res.data.growth_index || { current_zone: "", target_zone: "", top_level_criteria: [] },
            risks_and_warning: res.data.risks_and_warning || { risk_flags: [], stage_1: "", stage_2: "", stage_3: "", not_responsible: [] },
            // New
            domain_knowledge: res.data.domain_knowledge || [],
            software_tools: res.data.software_tools || [],
            behavioural_competencies: res.data.behavioural_competencies || [],
            kras: res.data.kras || [],
            system_duties: res.data.system_duties || [],
            hiring_requirements: res.data.hiring_requirements || { min_requirements: [], interview_test: "", first_45_days: "" },
            hiring_flags: res.data.hiring_flags || { green_flags: [], red_flags: [] },
            gates: res.data.gates || { competency_gates: [], performance_gates: [], behavioural_gates: [] },
            career_growth: res.data.career_growth || [],
            stop_meeting_duties: res.data.stop_meeting_duties || [],
          });
        }
      } catch (e) {
        console.error("EmpHRProfile:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  if (loading) return <><style>{CSS}</style><LoadingSkeleton /></>;

  if (!emp) {
    return (
      <>
        <style>{CSS}</style>
        <div style={{ padding: 40, textAlign: "center", color: THEME.textMuted, fontFamily: "'DM Sans',sans-serif" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
          <p>No HR profile data found.</p>
        </div>
      </>
    );
  }

  const deptNames = depts.map((d) => d.name).join(", ") || "—";
  const statusLabel = parseInt(emp.active) === 1 ? "Active" : "Inactive";
  const statusType = parseInt(emp.active) === 1 ? "green" : "red";
  const tenure = calcTenure(emp.joining_date);
  const maskedBank = emp.bank_account ? `••••${String(emp.bank_account).slice(-4)}` : "—";

  return (
    <>
      <style>{CSS}</style>
      <div className="hr-fade" style={{ padding: "20px 18px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── Quick Stats ── */}
        <div className="hr-grid">
          {[
            { label: "Tenure", value: tenure },
            { label: "Department", value: depts.length > 0 ? depts[0].name : "—" },
            { label: "Employment", value: orDash(emp.employment_type) },
            { label: "Status", value: statusLabel },
          ].map((s) => (
            <div className="hr-stat-card" key={s.label}>
              <span className="hr-stat-number">{s.value}</span>
              <span className="hr-stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Job Information ── */}
        {/* <Section icon="💼" title="Job Information">
          <div className="hr-grid" style={{ rowGap: 16 }}>
            <Field label="Job Title" value={emp.job_title} />
            <Field label="Employee ID" value={emp.employee_id} />
            <Field label="Department" value={deptNames} />
            <Field label="Sub-Department" value={emp.sub_department} />
            <Field label="Employment Type" value={orDash(emp.employment_type)} badge badgeType="green" />
            <Field label="Status" value={statusLabel} badge badgeType={statusType} />
            <Field label="Work Location" value={emp.work_location} />
            <Field label="Reporting To" value={emp.reporting_to} />
            {emp.coordinates_with && <Field label="Directly Coordinates With" value={emp.coordinates_with} />}
          </div>
        </Section> */}

        {/* ── Profile & Documents ── */}
        {/* <Section icon="🪪" title="Profile & Documents">
          <div className="hr-grid" style={{ rowGap: 16 }}>
            <div className="hr-field">
              <span className="hr-label">Profile Picture</span>
              {emp.profile_picture ? (
                <img src={`${FileUrl}/${emp.profile_picture}`} alt="Profile"
                  style={{ width: 90, height: 90, borderRadius: 12, objectFit: "cover", marginTop: 6, border: `2px solid ${THEME.border}` }}
                  onError={(e) => { e.target.style.display = "none"; }} />
              ) : (
                <div style={{ width: 90, height: 90, borderRadius: 12, marginTop: 6, background: THEME.brandLight, border: `2px solid ${THEME.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>👤</div>
              )}
            </div>
            <div className="hr-field">
              <span className="hr-label">Resume</span>
              {emp.resume ? (
                <a href={`${FileUrl}/${emp.resume}`} target="_blank" rel="noreferrer"
                  style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 10, background: THEME.brandLight, border: `1.5px solid ${THEME.border}`, color: THEME.brandDark, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
                  📄 View Resume
                </a>
              ) : <span className="hr-value">—</span>}
            </div>
          </div>
        </Section> */}

        {/* ── Important Dates ── */}
        {/* <Section icon="📅" title="Important Dates">
          <div className="hr-grid" style={{ rowGap: 16 }}>
            <Field label="Date of Joining" value={fmtDate(emp.joining_date)} />
            <Field label="Probation End Date" value={fmtDate(emp.probation_end_date)} />
            <Field label="Email" value={emp.email} />
            <Field label="Phone" value={emp.phone} />
          </div>
        </Section> */}

        {/* ── Job Overview ── */}
        {/* <Section icon="📋" title="Job Overview">
          {emp.job_overview ? (
            <p style={{ margin: 0, fontSize: 14, color: THEME.text, lineHeight: 1.7, fontFamily: "'DM Sans',sans-serif" }}>{emp.job_overview}</p>
          ) : <Empty msg="No job overview added yet." />}
        </Section> */}

        {/* ── Role Purpose ── */}
        {emp.role_purpose && (
          <Section icon="🎯" title="Role Purpose">
            <p style={{ margin: 0, fontSize: 14, color: THEME.text, lineHeight: 1.7, fontFamily: "'DM Sans',sans-serif" }}>{emp.role_purpose}</p>
          </Section>
        )}

        {/* ── Key Responsibilities ── */}
        <Section icon="🎯" title="Key Responsibilities">
          {hrData.responsibilities.length > 0 ? (
            <div className="hr-pill-wrap">
              {hrData.responsibilities.map((r, i) => <span className="hr-pill" key={i}>✓ {r}</span>)}
            </div>
          ) : <Empty msg="No responsibilities added yet." />}
        </Section>

        {/* ── 🔐 Authority & Decision Rights ── */}
        {/* <Section icon="🔐" title="Authority & Decision Rights">
          <AuthoritySection authority={hrData.authority} />
        </Section> */}

        {/* ── 📅 Deliverables ── */}
        {/* <Section icon="📅" title="Deliverables">
          <DeliverablesSection deliverables={hrData.deliverables} />
        </Section> */}

        {/* ── 📊 KPIs & Performance Metrics ── */}
        {/* <Section icon="📊" title="KPIs & Performance Metrics">
          <KpiSection kpis={hrData.kpis} />
        </Section> */}

        {/* ── 📋 KRAs & Monthly Targets ── NEW ── */}
        {/* <Section icon="📋" title="KRAs & Monthly Targets">
          <KraSection items={hrData.kras} />
        </Section> */}

        {/* ── Strengths & Weaknesses ── */}
        {/* <Section icon="⚖️" title="Strengths & Weaknesses">
          <div className="hr-grid" style={{ rowGap: 20 }}>
            <div>
              <span className="hr-label" style={{ display: "block", marginBottom: 8 }}>💪 Strengths</span>
              {hrData.strengths.length > 0 ? (
                <div className="hr-pill-wrap">
                  {hrData.strengths.map((s, i) => <span key={i} className="hr-pill" style={{ background: THEME.successBg, color: THEME.success, borderColor: THEME.success + "33" }}>✓ {typeof s === "string" ? s : s.title}</span>)}
                </div>
              ) : <Empty msg="No strengths added yet." />}
            </div>
            <div>
              <span className="hr-label" style={{ display: "block", marginBottom: 8 }}>🎯 Areas to Improve</span>
              {hrData.weaknesses.length > 0 ? (
                <div className="hr-pill-wrap">
                  {hrData.weaknesses.map((w, i) => <span key={i} className="hr-pill" style={{ background: THEME.warningBg, color: THEME.warning, borderColor: THEME.warning + "33" }}>△ {typeof w === "string" ? w : w.title}</span>)}
                </div>
              ) : <Empty msg="No areas to improve added yet." />}
            </div>
          </div>
        </Section> */}

        {/* ── Skills & Proficiency ── */}
        <Section icon="⚡" title="Skills & Proficiency">
          {hrData.skills.length > 0 ? (
            <div className="hr-progress-wrap">
              {hrData.skills.map((s) => (
                <div className="hr-progress-row" key={s.id || s.name}>
                  <div className="hr-progress-label">
                    <span className="hr-label" style={{ textTransform: "none", fontSize: 13 }}>{s.name}</span>
                    <span className="hr-label">{s.level}%</span>
                  </div>
                  <div className="hr-progress-track">
                    <div className="hr-progress-bar" style={{ width: `${s.level}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : <Empty msg="No skills added yet." />}
        </Section>

        {/* ── 🧠 Domain Knowledge ── NEW ── */}
        <Section icon="🧠" title="Domain Knowledge">
          <DomainKnowledgeSection items={hrData.domain_knowledge} />
        </Section>

        {/* ── 💻 Software & Tools ── NEW ── */}
        {/* <Section icon="💻" title="Software & Tools">
          <SoftwareToolsSection items={hrData.software_tools} />
        </Section> */}

        {/* ── 🎭 Behavioural Competencies ── NEW ── */}
        {/* <Section icon="🎭" title="Behavioural Competencies">
          <BehaviouralCompetenciesSection items={hrData.behavioural_competencies} />
        </Section> */}

        {/* ── 🖥️ System & Software Module Duties ── NEW ── */}
        {/* <Section icon="🖥️" title="System & Software Module Duties">
          <SystemDutiesSection items={hrData.system_duties} />
        </Section> */}

        {/* ── 📈 Performance Growth Index ── */}
        {/* <Section icon="📈" title="Performance Growth Index">
          <GrowthIndexSection growth={hrData.growth_index} />
        </Section> */}

        {/* ── ⚠️ Development Risks & Warning Ladder ── */}
        {/* <Section icon="⚠️" title="Development Risks & Warning Ladder">
          <RisksWarningSection risks={hrData.risks_and_warning} />
        </Section> */}

        {/* ── 📝 Hiring — Requirements & Onboarding ── NEW ── */}
        {/* <Section icon="📝" title="Hiring — Requirements & Onboarding">
          <HiringRequirementsSection data={hrData.hiring_requirements} />
        </Section> */}

        {/* ── 🚦 Hiring Flags ── NEW ── */}
        {/* <Section icon="🚦" title="Hiring Flags — Hire / Do Not Hire">
          <HiringFlagsSection data={hrData.hiring_flags} />
        </Section> */}

        {/* ── 🏆 Gates ── NEW ── */}
        {/* <Section icon="🏆" title="Competency, Performance & Behavioural Gates">
          <GatesSection data={hrData.gates} />
        </Section> */}

        {/* ── 🚀 Career Growth Path ── NEW ── */}
        {/* <Section icon="🚀" title="Career Growth Path">
          <CareerGrowthSection items={hrData.career_growth} />
        </Section> */}

        {/* ── 🛑 STOP Meeting Duties ── NEW ── */}
        {/* <Section icon="🛑" title="STOP Meeting Duties">
          <StopMeetingDutiesSection items={hrData.stop_meeting_duties} />
        </Section> */}

        {/* ── Compensation & Payroll ── */}
        {/* <Section icon="💰" title="Compensation & Payroll">
          <div className="hr-grid" style={{ rowGap: 16 }}>
            <div className="hr-field hr-grid-full">
              <span className="hr-label">Annual CTC</span>
              <span className="hr-value" style={{ fontSize: 18, color: THEME.brand }}>{orDash(emp.ctc)}</span>
            </div>
            <Field label="Basic Salary" value={emp.basic_salary} />
            <Field label="HRA" value={emp.hra} />
            <Field label="Allowances" value={emp.allowances} />
            <Field label="Annual Bonus" value={emp.bonus} />
            <Field label="Pay Mode" value={emp.pay_mode} />
            <Field label="Pay Cycle" value={emp.pay_cycle} />
            <Field label="Bank Account" value={maskedBank} />
          </div>
        </Section> */}

        {/* ── Work History ── */}
        <Section icon="🏢" title="Work History">
          {hrData.work_history.length > 0 ? (
            <div className="hr-timeline">
              {hrData.work_history.map((w, i) => (
                <div className="hr-timeline-item" key={w.id || i}>
                  <div className="hr-timeline-dot-wrap">
                    <div className="hr-timeline-dot" />
                    {i < hrData.work_history.length - 1 && <div className="hr-timeline-line" />}
                  </div>
                  <div className="hr-timeline-content">
                    <div className="hr-timeline-role">{w.role}</div>
                    <div className="hr-timeline-meta">{w.company}{w.period ? ` · ${w.period}` : ""}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : <Empty msg="No work history added yet." />}
        </Section>

        {/* ── Education ── */}
        <Section icon="🎓" title="Education">
          {hrData.education.length > 0 ? (
            <div className="hr-timeline">
              {hrData.education.map((e, i) => (
                <div className="hr-timeline-item" key={e.id || i}>
                  <div className="hr-timeline-dot-wrap">
                    <div className="hr-timeline-dot" style={{ background: THEME.brandMid }} />
                    {i < hrData.education.length - 1 && <div className="hr-timeline-line" />}
                  </div>
                  <div className="hr-timeline-content">
                    <div className="hr-timeline-role">{e.degree}</div>
                    <div className="hr-timeline-meta">{e.institution}{e.year ? ` · ${e.year}` : ""}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : <Empty msg="No education records added yet." />}
        </Section>

        {/* ── Emergency Contacts ── */}
        <Section icon="🚨" title="Emergency Contacts">
          {hrData.emergency_contacts.length > 0 ? (
            hrData.emergency_contacts.map((c, i) => (
              <div className="hr-contact-row" key={c.id || i}>
                <div className="hr-contact-icon">{contactIcon(c.relation)}</div>
                <div className="hr-contact-info">
                  <div className="hr-contact-name">
                    {c.name}
                    {c.relation && <span style={{ color: THEME.textMuted, fontWeight: 400, fontSize: 12 }}> ({c.relation})</span>}
                  </div>
                  <div className="hr-contact-sub">{c.phone}</div>
                </div>
                <span className="hr-badge hr-badge-gold">Contact</span>
              </div>
            ))
          ) : <Empty msg="No emergency contacts added yet." />}
        </Section>

      </div>
    </>
  );
}

export default EmpHRProfile;






// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import { getEmployeeById } from "../../../../services/EmployeeService";
// import { getToken } from "../../../../services/useLocalStorage";
// import { FileUrl } from "../../../../config/file_url";

// // ─────────────────────────────────────────────
// //  🎨  THEME
// // ─────────────────────────────────────────────
// const THEME = {
//   brand: "#887549",
//   brandLight: "#F5F0E8",
//   brandMid: "#C4A97D",
//   brandDark: "#5C4E32",
//   bg: "#F8F5F0",
//   border: "#EDE5D5",
//   text: "#1A1A2E",
//   textMuted: "#8A8A8A",
//   textLight: "#BDBDBD",
//   success: "#2D9D78",
//   successBg: "#EAF7F2",
//   warning: "#D97706",
//   warningBg: "#FEF3C7",
//   danger: "#DC2626",
//   dangerBg: "#FEE2E2",
// };

// const CSS = `
//   @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
//   * { box-sizing: border-box; }

//   @keyframes hrFadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
//   @keyframes hrShimmer { 0% { background-position:-400px 0; } 100% { background-position:400px 0; } }
//   .hr-fade { animation: hrFadeIn 0.35s cubic-bezier(0.4,0,0.2,1) both; }

//   .hr-grid      { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
//   .hr-grid-3    { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; }
//   .hr-grid-full { grid-column:1 / -1; }
//   @media (max-width:700px) { .hr-grid, .hr-grid-3 { grid-template-columns:1fr; } }

//   .hr-section { background:#fff; border:1.5px solid ${THEME.border}; border-radius:12px; overflow:hidden; }
//   .hr-section-header { display:flex; align-items:center; gap:10px; padding:13px 18px; background:#FDFAF5; border-bottom:1px solid ${THEME.border}; }
//   .hr-section-icon { width:30px; height:30px; border-radius:8px; background:${THEME.brandLight}; display:flex; align-items:center; justify-content:center; font-size:15px; flex-shrink:0; }
//   .hr-section-title { font-family:'Sora',sans-serif; font-size:13px; font-weight:700; color:${THEME.brandDark}; margin:0; letter-spacing:0.3px; text-transform:uppercase; }
//   .hr-section-body { padding:16px 18px; }

//   .hr-field { display:flex; flex-direction:column; gap:3px; }
//   .hr-label { font-size:11px; font-weight:600; color:${THEME.textMuted}; text-transform:uppercase; letter-spacing:0.5px; font-family:'DM Sans',sans-serif; }
//   .hr-value { font-size:14px; font-weight:600; color:${THEME.text}; font-family:'DM Sans',sans-serif; line-height:1.4; }

//   .hr-badge { display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:20px; font-size:12px; font-weight:600; font-family:'DM Sans',sans-serif; }
//   .hr-badge-green  { background:${THEME.successBg}; color:${THEME.success}; }
//   .hr-badge-gold   { background:${THEME.brandLight}; color:${THEME.brand}; }
//   .hr-badge-orange { background:${THEME.warningBg}; color:${THEME.warning}; }
//   .hr-badge-red    { background:${THEME.dangerBg};  color:${THEME.danger}; }

//   .hr-pill-wrap { display:flex; flex-wrap:wrap; gap:7px; margin-top:4px; }
//   .hr-pill { padding:5px 12px; border-radius:20px; background:${THEME.brandLight}; color:${THEME.brandDark}; font-size:12px; font-weight:600; font-family:'DM Sans',sans-serif; border:1px solid ${THEME.border}; }

//   .hr-progress-wrap { margin-top:12px; display:flex; flex-direction:column; gap:10px; }
//   .hr-progress-row  { display:flex; flex-direction:column; gap:4px; }
//   .hr-progress-label { display:flex; justify-content:space-between; }
//   .hr-progress-track { height:6px; border-radius:10px; background:${THEME.brandLight}; overflow:hidden; }
//   .hr-progress-bar { height:100%; border-radius:10px; background:linear-gradient(90deg,${THEME.brandMid},${THEME.brand}); transition:width 0.6s cubic-bezier(.4,0,.2,1); }

//   .hr-timeline { display:flex; flex-direction:column; }
//   .hr-timeline-item { display:flex; gap:12px; padding-bottom:16px; }
//   .hr-timeline-item:last-child { padding-bottom:0; }
//   .hr-timeline-dot-wrap { display:flex; flex-direction:column; align-items:center; flex-shrink:0; }
//   .hr-timeline-dot { width:10px; height:10px; border-radius:50%; background:${THEME.brand}; border:2px solid #fff; box-shadow:0 0 0 2px ${THEME.brandMid}; flex-shrink:0; margin-top:4px; }
//   .hr-timeline-line { width:2px; flex:1; background:${THEME.border}; margin-top:4px; min-height:20px; }
//   .hr-timeline-content { flex:1; }
//   .hr-timeline-role { font-size:13px; font-weight:700; color:${THEME.text}; font-family:'Sora',sans-serif; }
//   .hr-timeline-meta { font-size:12px; color:${THEME.textMuted}; margin-top:2px; font-family:'DM Sans',sans-serif; }

//   .hr-stat-card { background:linear-gradient(135deg,${THEME.brandLight} 0%,#fff 100%); border:1.5px solid ${THEME.border}; border-radius:10px; padding:14px 16px; display:flex; flex-direction:column; gap:4px; }
//   .hr-stat-number { font-size:22px; font-weight:800; color:${THEME.brand}; font-family:'Sora',sans-serif; }
//   .hr-stat-label  { font-size:11px; color:${THEME.textMuted}; font-weight:600; text-transform:uppercase; letter-spacing:0.4px; font-family:'DM Sans',sans-serif; }

//   .hr-contact-row { display:flex; align-items:center; gap:10px; padding:10px 0; border-bottom:1px solid ${THEME.border}; }
//   .hr-contact-row:last-child { border-bottom:none; }
//   .hr-contact-icon { font-size:16px; flex-shrink:0; width:24px; text-align:center; }
//   .hr-contact-info { flex:1; }
//   .hr-contact-name { font-size:13px; font-weight:700; color:${THEME.text}; font-family:'DM Sans',sans-serif; }
//   .hr-contact-sub  { font-size:12px; color:${THEME.textMuted}; font-family:'DM Sans',sans-serif; }

//   .hr-skeleton { background:linear-gradient(90deg,#f0e8d8 25%,#faf5ed 50%,#f0e8d8 75%); background-size:400px 100%; animation:hrShimmer 1.4s ease-in-out infinite; border-radius:8px; }
//   .hr-empty { text-align:center; padding:20px; color:${THEME.textMuted}; font-size:13px; font-family:'DM Sans',sans-serif; }

//   /* ── Deliverables Tab ── */
//   .hr-tab-strip { display:flex; gap:8px; margin-bottom:16px; flex-wrap:wrap; }
//   .hr-tab-btn { padding:6px 14px; border-radius:8px; font-size:12px; font-weight:700; border:1.5px solid ${THEME.border}; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.15s; background:#fff; color:#595959; }
//   .hr-tab-btn.active { background:${THEME.brand}; color:#fff; border-color:${THEME.brand}; }

//   /* ── Authority blocks ── */
//   .hr-authority-block { border-radius:10px; padding:14px 16px; margin-bottom:10px; }
//   .hr-authority-block:last-child { margin-bottom:0; }

//   /* ── KPI card ── */
//   .hr-kpi-row { display:flex; align-items:center; gap:10px; padding:8px 12px; background:${THEME.brandLight}; border-radius:10px; border:1px solid ${THEME.border}; margin-bottom:6px; }
//   .hr-kpi-row:last-child { margin-bottom:0; }

//   /* ── Stage items ── */
//   .hr-stage-item { display:flex; align-items:flex-start; gap:10px; padding:10px 14px; border-radius:10px; margin-bottom:8px; border:1px solid ${THEME.border}; }
//   .hr-stage-item:last-child { margin-bottom:0; }
//   .hr-stage-badge { flex-shrink:0; padding:2px 10px; border-radius:20px; font-size:11px; font-weight:700; font-family:'DM Sans',sans-serif; }

//   /* ── Growth bar ── */
//   .hr-growth-track { height:10px; border-radius:10px; background:${THEME.brandLight}; overflow:hidden; margin:8px 0; }
//   .hr-growth-fill  { height:100%; border-radius:10px; background:linear-gradient(90deg,${THEME.brandMid},${THEME.brand}); transition:width 0.6s ease; }
// `;

// // ─────────────────────────────────────────────
// //  UTILS
// // ─────────────────────────────────────────────
// function fmtDate(val) {
//   if (!val) return "—";
//   const d = new Date(val);
//   if (isNaN(d)) return val;
//   return d.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
// }
// function orDash(val) {
//   return val && String(val).trim() ? val : "—";
// }
// function calcTenure(joiningDate) {
//   if (!joiningDate) return "—";
//   const start = new Date(joiningDate);
//   const now = new Date();
//   const totalMonths =
//     (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
//   const y = Math.floor(totalMonths / 12);
//   const m = totalMonths % 12;
//   if (y === 0) return `${m} mo`;
//   if (m === 0) return `${y} yr${y > 1 ? "s" : ""}`;
//   return `${y} yr${y > 1 ? "s" : ""} ${m} mo`;
// }
// function contactIcon(relation = "") {
//   const r = relation.toLowerCase();
//   if (r.includes("spouse") || r.includes("wife")) return "👩";
//   if (r.includes("husband")) return "👨";
//   if (r.includes("father") || r.includes("dad")) return "👨‍🦳";
//   if (r.includes("mother") || r.includes("mom")) return "👩‍🦳";
//   if (r.includes("brother")) return "👦";
//   if (r.includes("sister")) return "👧";
//   return "👤";
// }

// // ─────────────────────────────────────────────
// //  ATOMS
// // ─────────────────────────────────────────────
// function Section({ icon, title, children }) {
//   return (
//     <div className="hr-section">
//       <div className="hr-section-header">
//         <div className="hr-section-icon">{icon}</div>
//         <p className="hr-section-title">{title}</p>
//       </div>
//       <div className="hr-section-body">{children}</div>
//     </div>
//   );
// }
// function Field({ label, value, badge, badgeType = "gold" }) {
//   return (
//     <div className="hr-field">
//       <span className="hr-label">{label}</span>
//       {badge ? (
//         <span className={`hr-badge hr-badge-${badgeType}`}>
//           <span>●</span>
//           {orDash(value)}
//         </span>
//       ) : (
//         <span className="hr-value">{orDash(value)}</span>
//       )}
//     </div>
//   );
// }
// function Empty({ msg = "No data added yet." }) {
//   return <div className="hr-empty">{msg}</div>;
// }
// function PillList({ items, styleOverride }) {
//   if (!items || items.length === 0) return null;
//   return (
//     <div className="hr-pill-wrap">
//       {items.map((item, i) => (
//         <span className="hr-pill" key={i} style={styleOverride}>
//           {item}
//         </span>
//       ))}
//     </div>
//   );
// }
// function LoadingSkeleton() {
//   const Skel = ({ h = 14, w = "100%" }) => (
//     <div className="hr-skeleton" style={{ height: h, width: w }} />
//   );
//   return (
//     <div style={{ padding: "20px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
//       {[1, 2, 3, 4].map((i) => (
//         <div key={i} className="hr-section">
//           <div className="hr-section-header" style={{ gap: 10 }}>
//             <Skel h={30} w="30px" />
//             <Skel h={12} w="140px" />
//           </div>
//           <div className="hr-section-body">
//             <div className="hr-grid" style={{ rowGap: 16 }}>
//               {[1, 2, 3, 4].map((j) => (
//                 <div key={j} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
//                   <Skel h={10} w="70px" />
//                   <Skel h={16} w="90%" />
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────
// //  NEW SECTION COMPONENTS
// // ─────────────────────────────────────────────

// /** 🔐 Authority & Decision Rights */
// function AuthoritySection({ authority }) {
//   const blocks = [
//     {
//       key: "can_decide",
//       label: "✅ Can Decide Independently",
//       color: "#F6FFED",
//       border: "#B7EB8F",
//       badge: "#52C41A",
//     },
//     {
//       key: "must_escalate",
//       label: "⚠️ Must Escalate",
//       color: "#FFFBE6",
//       border: "#FFE58F",
//       badge: "#FAAD14",
//     },
//     {
//       key: "cannot_decide",
//       label: "🚫 Cannot Decide or Commit",
//       color: "#FFF1F0",
//       border: "#FFA39E",
//       badge: "#FF4D4F",
//     },
//   ];

//   const hasAny = blocks.some((b) => (authority[b.key] || []).length > 0);
//   if (!hasAny) return <Empty msg="No authority rights defined yet." />;

//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//       {blocks.map(({ key, label, color, border, badge }) => {
//         const items = authority[key] || [];
//         if (items.length === 0) return null;
//         return (
//           <div
//             key={key}
//             style={{
//               background: color,
//               border: `1.5px solid ${border}`,
//               borderRadius: 12,
//               padding: "12px 16px",
//             }}
//           >
//             <span
//               style={{
//                 display: "inline-block",
//                 background: badge,
//                 color: "#fff",
//                 fontSize: 11,
//                 fontWeight: 700,
//                 padding: "2px 10px",
//                 borderRadius: 20,
//                 fontFamily: "'DM Sans',sans-serif",
//                 marginBottom: 10,
//               }}
//             >
//               {label}
//             </span>
//             <div className="hr-pill-wrap" style={{ marginTop: 0 }}>
//               {items.map((item, i) => (
//                 <span
//                   key={i}
//                   style={{
//                     padding: "4px 12px",
//                     borderRadius: 20,
//                     background: "#fff",
//                     border: `1px solid ${border}`,
//                     fontSize: 12,
//                     fontWeight: 600,
//                     fontFamily: "'DM Sans',sans-serif",
//                     color: "#1A1A2E",
//                   }}
//                 >
//                   {item}
//                 </span>
//               ))}
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// /** 📅 Deliverables (tabbed) */
// function DeliverablesSection({ deliverables }) {
//   const [activeTab, setActiveTab] = useState("daily");
//   const tabs = [
//     { key: "daily", label: "📅 Daily" },
//     { key: "weekly", label: "📆 Weekly" },
//     { key: "monthly", label: "🗓️ Monthly" },
//   ];
//   const hasAny = tabs.some((t) => (deliverables[t.key] || []).length > 0);
//   if (!hasAny) return <Empty msg="No deliverables defined yet." />;

//   return (
//     <div>
//       <div className="hr-tab-strip">
//         {tabs.map((t) => (
//           <button
//             key={t.key}
//             className={`hr-tab-btn${activeTab === t.key ? " active" : ""}`}
//             onClick={() => setActiveTab(t.key)}
//           >
//             {t.label}
//           </button>
//         ))}
//       </div>
//       {tabs.map((t) =>
//         activeTab === t.key ? (
//           <div key={t.key}>
//             {(deliverables[t.key] || []).length > 0 ? (
//               <div className="hr-pill-wrap">
//                 {deliverables[t.key].map((item, i) => (
//                   <span className="hr-pill" key={i}>
//                     ✓ {item}
//                   </span>
//                 ))}
//               </div>
//             ) : (
//               <Empty msg={`No ${t.key} deliverables added yet.`} />
//             )}
//           </div>
//         ) : null
//       )}
//     </div>
//   );
// }

// /** 📊 KPIs */
// function KpiSection({ kpis }) {
//   if (!kpis || kpis.length === 0) return <Empty msg="No KPIs defined yet." />;

//   // group by category
//   const grouped = kpis.reduce((acc, kpi) => {
//     const cat = kpi.category || "Other";
//     if (!acc[cat]) acc[cat] = [];
//     acc[cat].push(kpi);
//     return acc;
//   }, {});

//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
//       {Object.entries(grouped).map(([cat, items]) => (
//         <div key={cat}>
//           <div
//             style={{
//               fontSize: 11,
//               fontWeight: 700,
//               color: THEME.brand,
//               textTransform: "uppercase",
//               letterSpacing: "0.06em",
//               marginBottom: 8,
//               fontFamily: "'DM Sans',sans-serif",
//             }}
//           >
//             {cat} KPIs
//           </div>
//           {items.map((kpi, i) => (
//             <div className="hr-kpi-row" key={i}>
//               <div style={{ flex: 1 }}>
//                 <div
//                   style={{
//                     fontSize: 13,
//                     fontWeight: 600,
//                     color: THEME.text,
//                     fontFamily: "'DM Sans',sans-serif",
//                   }}
//                 >
//                   {kpi.metric}
//                 </div>
//                 {kpi.target && (
//                   <div
//                     style={{
//                       fontSize: 11,
//                       color: THEME.textMuted,
//                       fontFamily: "'DM Sans',sans-serif",
//                       marginTop: 2,
//                     }}
//                   >
//                     Target: {kpi.target}
//                   </div>
//                 )}
//               </div>
//               <span className="hr-badge hr-badge-gold">{cat}</span>
//             </div>
//           ))}
//         </div>
//       ))}
//     </div>
//   );
// }

// /** 📈 Growth Index */
// function GrowthIndexSection({ growth }) {
//   const zones = [
//     { range: "1–2", label: "New / highly dependent" },
//     { range: "3–4", label: "Contributing but learning" },
//     { range: "5–6", label: "Reliable; needs ownership support" },
//     { range: "7–8", label: "Strong performer; trusted" },
//     { range: "9–10", label: "Top-level; leads outcomes" },
//   ];

//   const hasData =
//     growth.current_zone ||
//     growth.target_zone ||
//     (growth.top_level_criteria || []).length > 0;

//   if (!hasData) return <Empty msg="No growth index data added yet." />;

//   const currentPct = growth.current_zone
//     ? (Math.min(10, Math.max(1, Number(growth.current_zone))) / 10) * 100
//     : 0;
//   const targetPct = growth.target_zone
//     ? (Math.min(10, Math.max(1, Number(growth.target_zone))) / 10) * 100
//     : 0;

//   return (
//     <div>
//       <div className="hr-grid" style={{ rowGap: 16, marginBottom: 16 }}>
//         <div className="hr-field">
//           <span className="hr-label">Current Growth Zone</span>
//           <span className="hr-value" style={{ fontSize: 22, color: THEME.brand }}>
//             {growth.current_zone ? `${growth.current_zone} / 10` : "—"}
//           </span>
//         </div>
//         <div className="hr-field">
//           <span className="hr-label">Target Growth Zone</span>
//           <span className="hr-value" style={{ fontSize: 22, color: THEME.brandDark }}>
//             {growth.target_zone ? `${growth.target_zone} / 10` : "—"}
//           </span>
//         </div>
//       </div>

//       {growth.current_zone && (
//         <div style={{ marginBottom: 16 }}>
//           <span
//             className="hr-label"
//             style={{ display: "block", marginBottom: 4 }}
//           >
//             Current Level
//           </span>
//           <div className="hr-growth-track">
//             <div className="hr-growth-fill" style={{ width: `${currentPct}%` }} />
//           </div>
//           {growth.target_zone && (
//             <>
//               <span
//                 className="hr-label"
//                 style={{ display: "block", marginBottom: 4, marginTop: 10 }}
//               >
//                 Target Level
//               </span>
//               <div className="hr-growth-track">
//                 <div
//                   className="hr-growth-fill"
//                   style={{
//                     width: `${targetPct}%`,
//                     background: `linear-gradient(90deg,${THEME.brandLight},${THEME.brandMid})`,
//                     opacity: 0.7,
//                   }}
//                 />
//               </div>
//             </>
//           )}
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               fontSize: 10,
//               color: THEME.textMuted,
//               fontFamily: "'DM Sans',sans-serif",
//               marginTop: 2,
//             }}
//           >
//             <span>1</span>
//             <span>5</span>
//             <span>10</span>
//           </div>
//         </div>
//       )}

//       {(growth.top_level_criteria || []).length > 0 && (
//         <div style={{ marginBottom: 16 }}>
//           <span
//             className="hr-label"
//             style={{ display: "block", marginBottom: 8 }}
//           >
//             What Top Level Looks Like
//           </span>
//           <div className="hr-pill-wrap">
//             {growth.top_level_criteria.map((c, i) => (
//               <span className="hr-pill" key={i}>
//                 ★ {c}
//               </span>
//             ))}
//           </div>
//         </div>
//       )}

//       <div
//         style={{
//           background: THEME.brandLight,
//           border: `1px solid ${THEME.border}`,
//           borderRadius: 12,
//           padding: "14px 16px",
//         }}
//       >
//         <div
//           style={{
//             fontSize: 11,
//             fontWeight: 700,
//             color: THEME.brand,
//             textTransform: "uppercase",
//             letterSpacing: "0.06em",
//             marginBottom: 10,
//             fontFamily: "'DM Sans',sans-serif",
//           }}
//         >
//           Scale Reference
//         </div>
//         <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
//           {zones.map((z) => (
//             <div
//               key={z.range}
//               style={{ display: "flex", alignItems: "center", gap: 10 }}
//             >
//               <span
//                 style={{
//                   background:
//                     growth.current_zone &&
//                     Number(growth.current_zone) >= parseInt(z.range) &&
//                     Number(growth.current_zone) <= parseInt(z.range.split("–")[1])
//                       ? THEME.brand
//                       : THEME.brandMid,
//                   color: "#fff",
//                   fontSize: 10,
//                   fontWeight: 700,
//                   padding: "2px 9px",
//                   borderRadius: 20,
//                   minWidth: 36,
//                   textAlign: "center",
//                   fontFamily: "'DM Sans',sans-serif",
//                 }}
//               >
//                 {z.range}
//               </span>
//               <span
//                 style={{
//                   fontSize: 12,
//                   color: THEME.text,
//                   fontFamily: "'DM Sans',sans-serif",
//                 }}
//               >
//                 {z.label}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// /** ⚠️ Risks & Warning Ladder */
// function RisksWarningSection({ risks }) {
//   const stages = [
//     {
//       key: "stage_1",
//       label: "Stage 1",
//       desc: "Coaching conversation with clear expectations",
//       color: "#FFFBE6",
//       border: "#FFE58F",
//       badge: "#FAAD14",
//     },
//     {
//       key: "stage_2",
//       label: "Stage 2",
//       desc: "Written development focus with measurable support goals",
//       color: "#FFF7E6",
//       border: "#FFD591",
//       badge: "#FA8C16",
//     },
//     {
//       key: "stage_3",
//       label: "Stage 3",
//       desc: "Role redesign, focused mentoring, or reassessment of responsibility load",
//       color: "#FFF1F0",
//       border: "#FFA39E",
//       badge: "#FF4D4F",
//     },
//   ];

//   const hasAny =
//     (risks.risk_flags || []).length > 0 ||
//     risks.stage_1 ||
//     risks.stage_2 ||
//     risks.stage_3 ||
//     (risks.not_responsible || []).length > 0;

//   if (!hasAny) return <Empty msg="No risk data added yet." />;

//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
//       {/* Risk Flags */}
//       {(risks.risk_flags || []).length > 0 && (
//         <div>
//           <span
//             className="hr-label"
//             style={{ display: "block", marginBottom: 8 }}
//           >
//             🚩 Risk Flags — This Role Needs Support If
//           </span>
//           <div className="hr-pill-wrap">
//             {risks.risk_flags.map((flag, i) => (
//               <span
//                 key={i}
//                 className="hr-pill"
//                 style={{
//                   background: "#FFF7E6",
//                   color: "#D97706",
//                   borderColor: "#FFD591",
//                 }}
//               >
//                 ⚠ {flag}
//               </span>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Warning Ladder */}
//       {stages.some((s) => risks[s.key]) && (
//         <div>
//           <span
//             className="hr-label"
//             style={{ display: "block", marginBottom: 8 }}
//           >
//             📋 HR Review / Warning Ladder
//           </span>
//           {stages.map((s) =>
//             risks[s.key] ? (
//               <div
//                 key={s.key}
//                 className="hr-stage-item"
//                 style={{ background: s.color, borderColor: s.border }}
//               >
//                 <span
//                   className="hr-stage-badge"
//                   style={{ background: s.badge, color: "#fff" }}
//                 >
//                   {s.label}
//                 </span>
//                 <div style={{ flex: 1 }}>
//                   <div
//                     style={{
//                       fontSize: 12,
//                       fontWeight: 600,
//                       color: THEME.text,
//                       fontFamily: "'DM Sans',sans-serif",
//                       marginBottom: 4,
//                     }}
//                   >
//                     {s.desc}
//                   </div>
//                   <div
//                     style={{
//                       fontSize: 13,
//                       color: THEME.text,
//                       fontFamily: "'DM Sans',sans-serif",
//                     }}
//                   >
//                     {risks[s.key]}
//                   </div>
//                 </div>
//               </div>
//             ) : null
//           )}
//         </div>
//       )}

//       {/* Not Responsible For */}
//       {(risks.not_responsible || []).length > 0 && (
//         <div>
//           <span
//             className="hr-label"
//             style={{ display: "block", marginBottom: 8 }}
//           >
//             🚫 What This Role Is NOT Responsible For
//           </span>
//           <div className="hr-pill-wrap">
//             {risks.not_responsible.map((item, i) => (
//               <span
//                 key={i}
//                 className="hr-pill"
//                 style={{
//                   background: "#FFF1F0",
//                   color: THEME.danger,
//                   borderColor: "#FFA39E",
//                 }}
//               >
//                 ✕ {item}
//               </span>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────
// //  🚀  MAIN COMPONENT
// // ─────────────────────────────────────────────
// function EmpHRProfile() {
//   const params = useParams();

//   const [loading, setLoading] = useState(true);
//   const [emp, setEmp] = useState(null);
//   const [depts, setDepts] = useState([]);
//   const [hrData, setHrData] = useState({
//     responsibilities: [],
//     skills: [],
//     work_history: [],
//     education: [],
//     emergency_contacts: [],
//     strengths: [],
//     weaknesses: [],
//     // ── NEW ──
//     authority: { can_decide: [], must_escalate: [], cannot_decide: [] },
//     deliverables: { daily: [], weekly: [], monthly: [] },
//     kpis: [],
//     growth_index: { current_zone: "", target_zone: "", top_level_criteria: [] },
//     risks_and_warning: {
//       risk_flags: [],
//       stage_1: "",
//       stage_2: "",
//       stage_3: "",
//       not_responsible: [],
//     },
//   });

//   useEffect(() => {
//     if (!params.id) return;
//     (async () => {
//       try {
//         setLoading(true);
//         const res = await getEmployeeById(params.id, getToken());
//         if (!res.data.error) {
//           setEmp(res.data.data?.[0] || null);
//           setDepts(res.data.departments || []);
//           setHrData({
//             responsibilities: res.data.responsibilities || [],
//             skills: res.data.skills || [],
//             work_history: res.data.work_history || [],
//             education: res.data.education || [],
//             emergency_contacts: res.data.emergency_contacts || [],
//             strengths: res.data.strength || [],
//             weaknesses: res.data.weakness || [],
//             // ── NEW: map from API response ──
//             authority: res.data.authority_rights || {
//               can_decide: [],
//               must_escalate: [],
//               cannot_decide: [],
//             },
//             deliverables: res.data.deliverables || {
//               daily: [],
//               weekly: [],
//               monthly: [],
//             },
//             kpis: res.data.kpis || [],
//             growth_index: res.data.growth_index || {
//               current_zone: "",
//               target_zone: "",
//               top_level_criteria: [],
//             },
//             risks_and_warning: res.data.risks_and_warning || {
//               risk_flags: [],
//               stage_1: "",
//               stage_2: "",
//               stage_3: "",
//               not_responsible: [],
//             },
//           });
//         }
//       } catch (e) {
//         console.error("EmpHRProfile:", e);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [params.id]);

//   if (loading)
//     return (
//       <>
//         <style>{CSS}</style>
//         <LoadingSkeleton />
//       </>
//     );

//   if (!emp) {
//     return (
//       <>
//         <style>{CSS}</style>
//         <div
//           style={{
//             padding: 40,
//             textAlign: "center",
//             color: THEME.textMuted,
//             fontFamily: "'DM Sans',sans-serif",
//           }}
//         >
//           <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
//           <p>No HR profile data found.</p>
//         </div>
//       </>
//     );
//   }

//   // ── Derived ────────────────────────────────
//   const deptNames = depts.map((d) => d.name).join(", ") || "—";
//   const statusLabel = parseInt(emp.active) === 1 ? "Active" : "Inactive";
//   const statusType = parseInt(emp.active) === 1 ? "green" : "red";
//   const tenure = calcTenure(emp.joining_date);
//   const maskedBank = emp.bank_account
//     ? `••••${String(emp.bank_account).slice(-4)}`
//     : "—";

//   return (
//     <>
//       <style>{CSS}</style>

//       <div
//         className="hr-fade"
//         style={{
//           padding: "20px 18px",
//           display: "flex",
//           flexDirection: "column",
//           gap: 16,
//         }}
//       >
//         {/* ── Quick Stats ── */}
//         <div className="hr-grid">
//           {[
//             { label: "Tenure", value: tenure },
//             { label: "Department", value: depts.length > 0 ? depts[0].name : "—" },
//             { label: "Employment", value: orDash(emp.employment_type) },
//             { label: "Status", value: statusLabel },
//           ].map((s) => (
//             <div className="hr-stat-card" key={s.label}>
//               <span className="hr-stat-number">{s.value}</span>
//               <span className="hr-stat-label">{s.label}</span>
//             </div>
//           ))}
//         </div>

//         {/* ── Job Information ── */}
//         <Section icon="💼" title="Job Information">
//           <div className="hr-grid" style={{ rowGap: 16 }}>
//             <Field label="Job Title" value={emp.job_title} />
//             <Field label="Employee ID" value={emp.employee_id} />
//             <Field label="Department" value={deptNames} />
//             <Field label="Sub-Department" value={emp.sub_department} />
//             <Field
//               label="Employment Type"
//               value={orDash(emp.employment_type)}
//               badge
//               badgeType="green"
//             />
//             <Field label="Status" value={statusLabel} badge badgeType={statusType} />
//             <Field label="Work Location" value={emp.work_location} />
//             <Field label="Reporting To" value={emp.reporting_to} />
//             {emp.coordinates_with && (
//               <Field
//                 label="Directly Coordinates With"
//                 value={emp.coordinates_with}
//               />
//             )}
//           </div>
//         </Section>

//         {/* ── Profile & Documents ── */}
//         <Section icon="🪪" title="Profile & Documents">
//           <div className="hr-grid" style={{ rowGap: 16 }}>
//             <div className="hr-field">
//               <span className="hr-label">Profile Picture</span>
//               {emp.profile_picture ? (
//                 <img
//                   src={`${FileUrl}/${emp.profile_picture}`}
//                   alt="Profile"
//                   style={{
//                     width: 90,
//                     height: 90,
//                     borderRadius: 12,
//                     objectFit: "cover",
//                     marginTop: 6,
//                     border: `2px solid ${THEME.border}`,
//                   }}
//                   onError={(e) => { e.target.style.display = "none"; }}
//                 />
//               ) : (
//                 <div
//                   style={{
//                     width: 90,
//                     height: 90,
//                     borderRadius: 12,
//                     marginTop: 6,
//                     background: THEME.brandLight,
//                     border: `2px solid ${THEME.border}`,
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     fontSize: 30,
//                   }}
//                 >
//                   👤
//                 </div>
//               )}
//             </div>
//             <div className="hr-field">
//               <span className="hr-label">Resume</span>
//               {emp.resume ? (
//                 <a
//                   href={`${FileUrl}/${emp.resume}`}
//                   target="_blank"
//                   rel="noreferrer"
//                   style={{
//                     marginTop: 6,
//                     display: "inline-flex",
//                     alignItems: "center",
//                     gap: 8,
//                     padding: "10px 16px",
//                     borderRadius: 10,
//                     background: THEME.brandLight,
//                     border: `1.5px solid ${THEME.border}`,
//                     color: THEME.brandDark,
//                     fontFamily: "'DM Sans',sans-serif",
//                     fontWeight: 600,
//                     fontSize: 13,
//                     textDecoration: "none",
//                   }}
//                 >
//                   📄 View Resume
//                 </a>
//               ) : (
//                 <span className="hr-value">—</span>
//               )}
//             </div>
//           </div>
//         </Section>

//         {/* ── Important Dates ── */}
//         <Section icon="📅" title="Important Dates">
//           <div className="hr-grid" style={{ rowGap: 16 }}>
//             <Field label="Date of Joining" value={fmtDate(emp.joining_date)} />
//             <Field label="Probation End Date" value={fmtDate(emp.probation_end_date)} />
//             <Field label="Email" value={emp.email} />
//             <Field label="Phone" value={emp.phone} />
//           </div>
//         </Section>

//         {/* ── Job Overview ── */}
//         <Section icon="📋" title="Job Overview">
//           {emp.job_overview ? (
//             <p
//               style={{
//                 margin: 0,
//                 fontSize: 14,
//                 color: THEME.text,
//                 lineHeight: 1.7,
//                 fontFamily: "'DM Sans',sans-serif",
//               }}
//             >
//               {emp.job_overview}
//             </p>
//           ) : (
//             <Empty msg="No job overview added yet." />
//           )}
//         </Section>

//         {/* ── Role Purpose ── */}
//         {emp.role_purpose && (
//           <Section icon="🎯" title="Role Purpose">
//             <p
//               style={{
//                 margin: 0,
//                 fontSize: 14,
//                 color: THEME.text,
//                 lineHeight: 1.7,
//                 fontFamily: "'DM Sans',sans-serif",
//               }}
//             >
//               {emp.role_purpose}
//             </p>
//           </Section>
//         )}

//         {/* ── Key Responsibilities ── */}
//         <Section icon="🎯" title="Key Responsibilities">
//           {hrData.responsibilities.length > 0 ? (
//             <div className="hr-pill-wrap">
//               {hrData.responsibilities.map((r, i) => (
//                 <span className="hr-pill" key={i}>
//                   ✓ {r}
//                 </span>
//               ))}
//             </div>
//           ) : (
//             <Empty msg="No responsibilities added yet." />
//           )}
//         </Section>

//         {/* ── 🔐 Authority & Decision Rights ── NEW ── */}
//         <Section icon="🔐" title="Authority & Decision Rights">
//           <AuthoritySection authority={hrData.authority} />
//         </Section>

//         {/* ── 📅 Deliverables ── NEW ── */}
//         <Section icon="📅" title="Deliverables">
//           <DeliverablesSection deliverables={hrData.deliverables} />
//         </Section>

//         {/* ── 📊 KPIs & Performance Metrics ── NEW ── */}
//         <Section icon="📊" title="KPIs & Performance Metrics">
//           <KpiSection kpis={hrData.kpis} />
//         </Section>

//         {/* ── Strengths & Weaknesses ── */}
//         <Section icon="⚖️" title="Strengths & Weaknesses">
//           <div className="hr-grid" style={{ rowGap: 20 }}>
//             <div>
//               <span className="hr-label" style={{ display: "block", marginBottom: 8 }}>
//                 💪 Strengths
//               </span>
//               {hrData.strengths.length > 0 ? (
//                 <div className="hr-pill-wrap">
//                   {hrData.strengths.map((s, i) => (
//                     <span
//                       key={i}
//                       className="hr-pill"
//                       style={{
//                         background: THEME.successBg,
//                         color: THEME.success,
//                         borderColor: THEME.success + "33",
//                       }}
//                     >
//                       ✓ {typeof s === "string" ? s : s.title}
//                     </span>
//                   ))}
//                 </div>
//               ) : (
//                 <Empty msg="No strengths added yet." />
//               )}
//             </div>
//             <div>
//               <span className="hr-label" style={{ display: "block", marginBottom: 8 }}>
//                 🎯 Areas to Improve
//               </span>
//               {hrData.weaknesses.length > 0 ? (
//                 <div className="hr-pill-wrap">
//                   {hrData.weaknesses.map((w, i) => (
//                     <span
//                       key={i}
//                       className="hr-pill"
//                       style={{
//                         background: THEME.warningBg,
//                         color: THEME.warning,
//                         borderColor: THEME.warning + "33",
//                       }}
//                     >
//                       △ {typeof w === "string" ? w : w.title}
//                     </span>
//                   ))}
//                 </div>
//               ) : (
//                 <Empty msg="No areas to improve added yet." />
//               )}
//             </div>
//           </div>
//         </Section>

//         {/* ── Skills & Proficiency ── */}
//         <Section icon="⚡" title="Skills & Proficiency">
//           {hrData.skills.length > 0 ? (
//             <div className="hr-progress-wrap">
//               {hrData.skills.map((s) => (
//                 <div className="hr-progress-row" key={s.id || s.name}>
//                   <div className="hr-progress-label">
//                     <span className="hr-label" style={{ textTransform: "none", fontSize: 13 }}>
//                       {s.name}
//                     </span>
//                     <span className="hr-label">{s.level}%</span>
//                   </div>
//                   <div className="hr-progress-track">
//                     <div className="hr-progress-bar" style={{ width: `${s.level}%` }} />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <Empty msg="No skills added yet." />
//           )}
//         </Section>

//         {/* ── 📈 Performance Growth Index ── NEW ── */}
//         <Section icon="📈" title="Performance Growth Index">
//           <GrowthIndexSection growth={hrData.growth_index} />
//         </Section>

//         {/* ── ⚠️ Development Risks & Warning Ladder ── NEW ── */}
//         <Section icon="⚠️" title="Development Risks & Warning Ladder">
//           <RisksWarningSection risks={hrData.risks_and_warning} />
//         </Section>

//         {/* ── Compensation & Payroll ── */}
//         <Section icon="💰" title="Compensation & Payroll">
//           <div className="hr-grid" style={{ rowGap: 16 }}>
//             <div className="hr-field hr-grid-full">
//               <span className="hr-label">Annual CTC</span>
//               <span className="hr-value" style={{ fontSize: 18, color: THEME.brand }}>
//                 {orDash(emp.ctc)}
//               </span>
//             </div>
//             <Field label="Basic Salary" value={emp.basic_salary} />
//             <Field label="HRA" value={emp.hra} />
//             <Field label="Allowances" value={emp.allowances} />
//             <Field label="Annual Bonus" value={emp.bonus} />
//             <Field label="Pay Mode" value={emp.pay_mode} />
//             <Field label="Pay Cycle" value={emp.pay_cycle} />
//             <Field label="Bank Account" value={maskedBank} />
//           </div>
//         </Section>

//         {/* ── Work History ── */}
//         <Section icon="🏢" title="Work History">
//           {hrData.work_history.length > 0 ? (
//             <div className="hr-timeline">
//               {hrData.work_history.map((w, i) => (
//                 <div className="hr-timeline-item" key={w.id || i}>
//                   <div className="hr-timeline-dot-wrap">
//                     <div className="hr-timeline-dot" />
//                     {i < hrData.work_history.length - 1 && (
//                       <div className="hr-timeline-line" />
//                     )}
//                   </div>
//                   <div className="hr-timeline-content">
//                     <div className="hr-timeline-role">{w.role}</div>
//                     <div className="hr-timeline-meta">
//                       {w.company}
//                       {w.period ? ` · ${w.period}` : ""}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <Empty msg="No work history added yet." />
//           )}
//         </Section>

//         {/* ── Education ── */}
//         <Section icon="🎓" title="Education">
//           {hrData.education.length > 0 ? (
//             <div className="hr-timeline">
//               {hrData.education.map((e, i) => (
//                 <div className="hr-timeline-item" key={e.id || i}>
//                   <div className="hr-timeline-dot-wrap">
//                     <div
//                       className="hr-timeline-dot"
//                       style={{ background: THEME.brandMid }}
//                     />
//                     {i < hrData.education.length - 1 && (
//                       <div className="hr-timeline-line" />
//                     )}
//                   </div>
//                   <div className="hr-timeline-content">
//                     <div className="hr-timeline-role">{e.degree}</div>
//                     <div className="hr-timeline-meta">
//                       {e.institution}
//                       {e.year ? ` · ${e.year}` : ""}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <Empty msg="No education records added yet." />
//           )}
//         </Section>

//         {/* ── Emergency Contacts ── */}
//         <Section icon="🚨" title="Emergency Contacts">
//           {hrData.emergency_contacts.length > 0 ? (
//             hrData.emergency_contacts.map((c, i) => (
//               <div className="hr-contact-row" key={c.id || i}>
//                 <div className="hr-contact-icon">{contactIcon(c.relation)}</div>
//                 <div className="hr-contact-info">
//                   <div className="hr-contact-name">
//                     {c.name}
//                     {c.relation && (
//                       <span style={{ color: THEME.textMuted, fontWeight: 400, fontSize: 12 }}>
//                         {" "}({c.relation})
//                       </span>
//                     )}
//                   </div>
//                   <div className="hr-contact-sub">{c.phone}</div>
//                 </div>
//                 <span className="hr-badge hr-badge-gold">Contact</span>
//               </div>
//             ))
//           ) : (
//             <Empty msg="No emergency contacts added yet." />
//           )}
//         </Section>
//       </div>
//     </>
//   );
// }

// export default EmpHRProfile;
