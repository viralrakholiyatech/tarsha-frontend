import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../../../services/useLocalStorage";
import toast from "react-hot-toast";
import { LeadsRoute } from "../../../config/RouteConfig";
import ApiService from "../../../services/ApiService";
import { fetchAdminleads } from "../../../config/config";
import { DeleteLead } from "../../../services/EmployeeService";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import AddLeads from "./Add";
import EditLeads from "./Edit";

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

const PAGE_SIZE = 15;

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }
  @keyframes ldFadeIn {
    from { opacity:0; transform:translateY(8px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .ld-fade { animation: ldFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes ldSpin { to { transform:rotate(360deg); } }
  .ld-spinner {
    width:28px; height:28px; border-radius:50%;
    border:3px solid #F5F0E8;
    border-top-color:#887549;
    animation:ldSpin 0.8s linear infinite;
  }
  .ld-search {
    padding:8px 14px 8px 36px; border-radius:10px;
    border:1.5px solid #E0D5C5; font-size:13px;
    font-family:'DM Sans',sans-serif; color:#1A1A2E;
    outline:none; background:#fff; width:220px;
    transition:border-color 0.15s, width 0.2s;
  }
  .ld-search:focus { border-color:#887549; box-shadow:0 0 0 3px #88754918; width:260px; }
  .ld-search::placeholder { color:#BDBDBD; }
  .ld-th { cursor:pointer; user-select:none; white-space:nowrap; }
  .ld-th:hover { color:#887549; }
  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background:#F5F0E8; }
  ::-webkit-scrollbar-thumb { background:#C4A97D; border-radius:10px; }

  /* Toggle button */
  .view-toggle {
    display: flex;
    align-items: center;
    background: #F5F0E8;
    border-radius: 12px;
    padding: 4px;
    gap: 2px;
    border: 1px solid #D4C4A0;
  }
  .toggle-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    border-radius: 9px;
    border: none;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    font-family: 'Sora', sans-serif;
    transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
  }
  .toggle-btn.active {
    background: #887549;
    color: #fff;
    box-shadow: 0 2px 8px #88754944;
  }
  .toggle-btn.inactive {
    background: transparent;
    color: #887549;
  }
  .toggle-btn.inactive:hover {
    background: #EDE5D5;
  }

  /* Dashboard cards */
  @keyframes countUp {
    from { opacity: 0; transform: translateY(12px) scale(0.95); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .dash-card { animation: ldFadeIn 0.4s cubic-bezier(0.4,0,0.2,1) both; }
  .dash-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(136,117,73,0.12) !important; }
  .dash-card { transition: transform 0.2s, box-shadow 0.2s; }

  /* Source bar */
  .src-bar-fill {
    transition: width 0.8s cubic-bezier(0.4,0,0.2,1);
  }

  /* Donut */
  @keyframes dashOffset {
    from { stroke-dashoffset: 283; }
  }
  .donut-seg { transition: stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1); }

  /* Agent row */
  .agent-row:hover { background: #FDFAF5 !important; }
  .agent-row { transition: background 0.15s; }
`;

// Source → color
const SOURCE_COLORS = {
  default: { color: THEME.brand, bg: THEME.brandLight, border: "#D4C4A0" },
  website: { color: "#2F54EB", bg: "#F0F5FF", border: "#ADC6FF" },
  referral: { color: "#389E0D", bg: "#F6FFED", border: "#B7EB8F" },
  social: { color: "#D46B08", bg: "#FFF7E6", border: "#FFD591" },
  cold: { color: "#08979C", bg: "#E6FFFB", border: "#87E8DE" },
};

function sourceStyle(source) {
  if (!source) return SOURCE_COLORS.default;
  const s = source.toLowerCase();
  if (s.includes("web")) return SOURCE_COLORS.website;
  if (s.includes("ref")) return SOURCE_COLORS.referral;
  if (s.includes("social") || s.includes("facebook") || s.includes("instagram"))
    return SOURCE_COLORS.social;
  if (s.includes("cold")) return SOURCE_COLORS.cold;
  return SOURCE_COLORS.default;
}

function typeStyle(type) {
  if (!type) return null;
  const map = {
    hot: { color: "#CF1322", bg: "#FFF1F0", border: "#FFA39E", label: "🔥 Hot" },
    cold: { color: "#08979C", bg: "#E6FFFB", border: "#87E8DE", label: "❄️ Cold" },
    avg: { color: "#D46B08", bg: "#FFF7E6", border: "#FFD591", label: "📊 Average" },
    lost: { color: "#CF1322", bg: "#FFF1F0", border: "#FFA39E", label: "❌ Lost" },
  };
  return map[type?.toLowerCase()] || null;
}

function statusStyle(status) {
  const map = {
    active: { color: "#389E0D", bg: "#F6FFED", border: "#B7EB8F", label: "● Active" },
    inactive: { color: "#8C8C8C", bg: "#F5F5F5", border: "#D9D9D9", label: "● Inactive" },
    lost: { color: "#CF1322", bg: "#FFF1F0", border: "#FFA39E", label: "● Lost" },
  };
  return map[status?.toLowerCase()] || map.active;
}

// ─────────────────────────────────────────────
//  ❌  LOST LEAD HELPER
//  A lead is "lost" if its status OR type is "lost".
//  Change this one function if your backend uses something else
//  (e.g. status === "closed_lost" or a lost_reason field).
// ─────────────────────────────────────────────
const isLost = (d) => {
  const s = d.status?.toLowerCase() || "";
  const t = d.type?.toLowerCase() || "";
  return s === "lost" || t === "lost";
};

// ─────────────────────────────────────────────
//  📊  DASHBOARD COMPONENT
// ─────────────────────────────────────────────
const Dashboard = ({ data }) => {
  const total = data.length;

  // Type breakdown
  const typeCount = useMemo(() => {
    const map = { hot: 0, cold: 0, avg: 0, lost: 0, other: 0 };
    data.forEach((d) => {
      const t = d.type?.toLowerCase();
      if (t === "hot") map.hot++;
      else if (t === "cold") map.cold++;
      else if (t === "avg") map.avg++;
      else if (t === "lost") map.lost++;
      else map.other++;
    });
    return map;
  }, [data]);

  // Status breakdown
  const statusCount = useMemo(() => {
    const map = {};
    data.forEach((d) => {
      const s = d.status?.toLowerCase() || "active";
      map[s] = (map[s] || 0) + 1;
    });
    return map;
  }, [data]);

  // Lost leads (status OR type is "lost")
  const lostCount = useMemo(() => data.filter(isLost).length, [data]);

  // Source breakdown
  const sourceCount = useMemo(() => {
    const map = {};
    data.forEach((d) => {
      if (d.source) map[d.source] = (map[d.source] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [data]);

  // Agent leaderboard
  const agentCount = useMemo(() => {
    const map = {};
    data.forEach((d) => {
      if (d.last_followup_assigned_to) {
        map[d.last_followup_assigned_to] = (map[d.last_followup_assigned_to] || 0) + 1;
      }
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [data]);

  // Service breakdown
  const serviceCount = useMemo(() => {
    const map = {};
    data.forEach((d) => {
      if (d.service) map[d.service] = (map[d.service] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [data]);

  // Next F/U upcoming (next 7 days)
  const upcomingFollowups = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const in7 = new Date(today);
    in7.setDate(in7.getDate() + 7);
    const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
    return data.filter((d) => {
      if (!d.last_followup_next_date) return false;
      const parts = d.last_followup_next_date.split("-");
      if (parts.length !== 3) return false;
      const dt = new Date(parseInt(parts[2]), months[parts[1]], parseInt(parts[0]));
      return dt >= today && dt <= in7;
    }).length;
  }, [data]);

  // Overdue
  const overdue = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
    return data.filter((d) => {
      if (!d.last_followup_next_date) return false;
      const parts = d.last_followup_next_date.split("-");
      if (parts.length !== 3) return false;
      const dt = new Date(parseInt(parts[2]), months[parts[1]], parseInt(parts[0]));
      return dt < today;
    }).length;
  }, [data]);

  const activeCount = statusCount["active"] || 0;
  const inactiveCount = statusCount["inactive"] || 0;
  const maxSource = sourceCount[0]?.[1] || 1;

  // Donut chart for types
  const donutData = [
    { label: "Hot", value: typeCount.hot, color: "#CF1322" },
    { label: "Cold", value: typeCount.cold, color: "#08979C" },
    { label: "Average", value: typeCount.avg, color: "#D46B08" },
    { label: "Lost", value: typeCount.lost, color: "#8C1D18" },
    { label: "Other", value: typeCount.other, color: "#BDBDBD" },
  ].filter(d => d.value > 0);

  // SVG Donut
  const DonutChart = () => {
    const r = 45;
    const cx = 60, cy = 60;
    const circumference = 2 * Math.PI * r;
    let offset = 0;
    const totalVal = donutData.reduce((s, d) => s + d.value, 0) || 1;
    return (
      <svg width="120" height="120" viewBox="0 0 120 120">
        {donutData.map((seg, i) => {
          const pct = seg.value / totalVal;
          const dashArray = pct * circumference;
          const startOffset = circumference - offset * circumference / totalVal;
          const seg_el = (
            <circle
              key={i}
              className="donut-seg"
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="18"
              strokeDasharray={`${dashArray} ${circumference - dashArray}`}
              strokeDashoffset={startOffset}
              style={{ transform: "rotate(-90deg)", transformOrigin: "60px 60px" }}
            />
          );
          offset += seg.value;
          return seg_el;
        })}
        <circle cx={cx} cy={cy} r="28" fill="white" />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="14" fontWeight="800" fill={THEME.text} fontFamily="Sora">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill={THEME.textMuted} fontFamily="DM Sans">leads</text>
      </svg>
    );
  };

  const KpiCard = ({ value, label, color, bg, border, icon, delay = 0 }) => (
    <div className="dash-card" style={{
      flex: "1 1 140px",
      background: "#fff",
      border: `1px solid ${border}`,
      borderRadius: 16,
      padding: "18px 20px",
      display: "flex",
      alignItems: "center",
      gap: 14,
      animationDelay: `${delay}s`,
      boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color, fontFamily: "'Sora',sans-serif", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, color: "#8C8C8C", fontWeight: 600, marginTop: 4, lineHeight: 1.3 }}>{label}</div>
      </div>
    </div>
  );

  return (
    <div className="ld-fade" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Row 1 — KPI Cards */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <KpiCard value={total} label="Total Leads" color={THEME.brand} bg={THEME.brandLight} border="#D4C4A0" icon="📋" delay={0} />
        <KpiCard value={activeCount} label="Active Leads" color="#389E0D" bg="#F6FFED" border="#B7EB8F" icon="✅" delay={0.05} />
        <KpiCard value={typeCount.hot} label="Hot Leads" color="#CF1322" bg="#FFF1F0" border="#FFA39E" icon="🔥" delay={0.1} />
        <KpiCard value={upcomingFollowups} label="Follow-ups (7 days)" color="#2F54EB" bg="#F0F5FF" border="#ADC6FF" icon="📅" delay={0.15} />
        <KpiCard value={overdue} label="Overdue Follow-ups" color="#D46B08" bg="#FFF7E6" border="#FFD591" icon="⚠️" delay={0.2} />
        <KpiCard value={lostCount} label="Lost Leads" color="#CF1322" bg="#FFF1F0" border="#FFA39E" icon="❌" delay={0.25} />
      </div>

      {/* Row 2 — Type donut + Source bars + Status */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>

        {/* Lead Type Breakdown */}
        <div className="dash-card" style={{
          flex: "0 1 260px", background: "#fff",
          border: `1px solid ${THEME.border}`, borderRadius: 16,
          padding: "20px 22px", animationDelay: "0.3s",
          boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: THEME.text, fontFamily: "'Sora',sans-serif", marginBottom: 16 }}>
            Lead Type Mix
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <DonutChart />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {donutData.map(d => (
                <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: "#595959", fontWeight: 600 }}>{d.label}</span>
                  <span style={{ fontSize: 11, color: THEME.textMuted, marginLeft: "auto", fontWeight: 700, paddingLeft: 12 }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Source Breakdown */}
        <div className="dash-card" style={{
          flex: "1 1 260px", background: "#fff",
          border: `1px solid ${THEME.border}`, borderRadius: 16,
          padding: "20px 22px", animationDelay: "0.35s",
          boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: THEME.text, fontFamily: "'Sora',sans-serif", marginBottom: 16 }}>
            Lead Sources
          </div>
          {sourceCount.length === 0 ? (
            <p style={{ fontSize: 12, color: THEME.textLight, margin: 0 }}>No source data</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {sourceCount.map(([src, cnt], i) => {
                const style = sourceStyle(src);
                const pct = Math.round((cnt / (total || 1)) * 100);
                return (
                  <div key={src}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700,
                        color: style.color, background: style.bg,
                        border: `1px solid ${style.border}`,
                        padding: "2px 8px", borderRadius: 20,
                      }}>{src}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: THEME.text }}>{cnt} <span style={{ color: THEME.textMuted, fontWeight: 500 }}>({pct}%)</span></span>
                    </div>
                    <div style={{ height: 6, background: "#F5EFE4", borderRadius: 10, overflow: "hidden" }}>
                      <div className="src-bar-fill" style={{
                        height: "100%",
                        width: `${(cnt / maxSource) * 100}%`,
                        background: `linear-gradient(90deg, ${style.color}88, ${style.color})`,
                        borderRadius: 10,
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Status + Service */}
        <div style={{ flex: "0 1 260px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Status */}
          <div className="dash-card" style={{
            background: "#fff",
            border: `1px solid ${THEME.border}`, borderRadius: 16,
            padding: "18px 20px", animationDelay: "0.4s",
            boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: THEME.text, fontFamily: "'Sora',sans-serif", marginBottom: 14 }}>
              Status
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { label: "Active", value: activeCount, color: "#389E0D", bg: "#F6FFED", border: "#B7EB8F" },
                { label: "Inactive", value: inactiveCount, color: "#8C8C8C", bg: "#F5F5F5", border: "#D9D9D9" },
                { label: "Lost", value: lostCount, color: "#CF1322", bg: "#FFF1F0", border: "#FFA39E" },
              ].map(s => (
                <div key={s.label} style={{
                  flex: 1, background: s.bg, border: `1px solid ${s.border}`,
                  borderRadius: 12, padding: "12px 6px", textAlign: "center",
                }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: "'Sora',sans-serif" }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: s.color, fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Services */}
          <div className="dash-card" style={{
            background: "#fff",
            border: `1px solid ${THEME.border}`, borderRadius: 16,
            padding: "18px 20px", animationDelay: "0.45s",
            flex: 1,
            boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: THEME.text, fontFamily: "'Sora',sans-serif", marginBottom: 12 }}>
              Top Services
            </div>
            {serviceCount.length === 0 ? (
              <p style={{ fontSize: 12, color: THEME.textLight, margin: 0 }}>No data</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {serviceCount.map(([svc, cnt]) => (
                  <div key={svc} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      background: "#F9F0FF", color: "#531DAB",
                      border: "1px solid #D3ADF7",
                      padding: "2px 8px", borderRadius: 20,
                      maxWidth: 120, overflow: "hidden",
                      textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>{svc}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: THEME.text }}>{cnt}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3 — Agent Leaderboard */}
      {agentCount.length > 0 && (
        <div className="dash-card" style={{
          background: "#fff",
          border: `1px solid ${THEME.border}`, borderRadius: 16,
          padding: "20px 22px", animationDelay: "0.5s",
          boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: THEME.text, fontFamily: "'Sora',sans-serif", marginBottom: 14 }}>
            🏆 Top Assigned Agents
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {agentCount.map(([agent, cnt], i) => {
              const pct = Math.round((cnt / (total || 1)) * 100);
              const medals = ["🥇", "🥈", "🥉"];
              return (
                <div key={agent} className="agent-row" style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "10px 12px",
                  borderRadius: 10,
                  borderBottom: i < agentCount.length - 1 ? "1px solid #F5EFE4" : "none",
                }}>
                  <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>{medals[i] || `${i + 1}`}</span>
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%",
                    background: `linear-gradient(135deg,${THEME.brand},${THEME.brandMid})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0,
                  }}>
                    {agent[0]?.toUpperCase()}
                  </div>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: THEME.text }}>{agent}</span>
                  <div style={{ flex: 2, height: 8, background: "#F5EFE4", borderRadius: 10, overflow: "hidden" }}>
                    <div className="src-bar-fill" style={{
                      height: "100%",
                      width: `${(cnt / (agentCount[0]?.[1] || 1)) * 100}%`,
                      background: `linear-gradient(90deg,${THEME.brandMid},${THEME.brand})`,
                      borderRadius: 10,
                    }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: THEME.brand, minWidth: 60, textAlign: "right" }}>
                    {cnt} <span style={{ fontSize: 11, color: THEME.textMuted, fontWeight: 500 }}>({pct}%)</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
//  🧩  ATOMS
// ─────────────────────────────────────────────

function AddBtn({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "9px 18px", borderRadius: 10, border: "none",
        background: hov ? THEME.brandDark : THEME.brand,
        color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
        fontFamily: "'Sora',sans-serif", transition: "all 0.18s",
        boxShadow: `0 2px 8px ${THEME.brand}44`, whiteSpace: "nowrap",
      }}
    >
      + Add Lead
    </button>
  );
}

function EditIconBtn({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} title="Edit"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, color: hov ? THEME.brand : "#657488", transition: "color 0.15s" }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none">
        <path d="M13.26 4L5.05 12.69C4.74 13.02 4.44 13.67 4.38 14.12L4.01 17.36C3.88 18.53 4.72 19.33 5.88 19.13L9.1 18.58C9.55 18.5 10.18 18.17 10.49 17.83L18.7 9.14C20.12 7.64 20.76 5.93 18.55 3.84C16.35 1.77 14.68 2.5 13.26 4Z" stroke="currentColor" strokeWidth="1.8" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.89 5.45C12.32 8.21 14.56 10.32 17.34 10.6" stroke="currentColor" strokeWidth="1.8" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 22H21" stroke="currentColor" strokeWidth="1.8" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function DeleteIconBtn({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} title="Delete"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, color: hov ? "#FF4D4F" : "#FF8096", transition: "color 0.15s" }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 20 20" fill="none">
        <path d="M17.5 4.98c-2.775-.275-5.567-.417-8.35-.417q-2.475 0-4.95.25l-1.7.167" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m7.083 4.142.183-1.092C7.4 2.258 7.5 1.667 8.908 1.667h2.183c1.408 0 1.517.625 1.642 1.392l.183 1.083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m15.707 7.617-.542 8.392c-.092 1.308-.167 2.325-2.492 2.325h-5.35c-2.325 0-2.4-1.017-2.492-2.325l-.542-8.392" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.607 13.75h2.775M7.913 10.417h4.167" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function Pagination({ page, total, canPrev, canNext, onFirst, onPrev, onNext, onLast }) {
  const btn = (disabled) => ({
    width: 30, height: 30, borderRadius: 8,
    background: disabled ? "#F5F5F5" : "#fff",
    border: `1px solid ${disabled ? "#E8E8E8" : "#E0D5C5"}`,
    color: disabled ? THEME.textLight : THEME.brand,
    cursor: disabled ? "default" : "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 14, fontWeight: 700, transition: "all 0.15s",
  });
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "flex-end",
      gap: 6, padding: "12px 20px",
      borderTop: "1px solid #F5EFE4", background: "#FDFAF5",
    }}>
      <button style={btn(!canPrev)} onClick={onFirst} disabled={!canPrev}>«</button>
      <button style={btn(!canPrev)} onClick={onPrev} disabled={!canPrev}>‹</button>
      <span style={{ fontSize: 13, color: "#595959", fontWeight: 600, padding: "0 8px" }}>
        Page <span style={{ color: THEME.brand }}>{page}</span> of {total}
      </span>
      <button style={btn(!canNext)} onClick={onNext} disabled={!canNext}>›</button>
      <button style={btn(!canNext)} onClick={onLast} disabled={!canNext}>»</button>
    </div>
  );
}

// ─────────────────────────────────────────────
//  TABLE ROW  —  memo for performance
// ─────────────────────────────────────────────
const LeadRow = memo(({ lead, index, onDetail, onEdit, onDelete }) => {
  const [hov, setHov] = useState(false);
  const src = sourceStyle(lead.source);

  return (
    <tr
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? THEME.rowHover : index % 2 === 0 ? "#fff" : THEME.rowAlt,
        transition: "background 0.15s",
      }}
    >
      <td style={td("center")}>
        <span style={{ fontSize: 12, fontWeight: 700, color: THEME.textMuted }}>{index + 1}</span>
      </td>
      <td style={td()}>
        <button onClick={() => onDetail(lead.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: THEME.brand, textDecoration: "underline", textDecorationStyle: "dotted", textUnderlineOffset: 3 }}>
            {lead.name || "—"}
          </span>
        </button>
      </td>
      <td style={td()}>
        <span style={{ fontSize: 12, color: "#595959", whiteSpace: "nowrap" }}>{lead.mobile_no || "—"}</span>
      </td>
      <td style={td()}>
        {lead.source ? (
          <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: src.bg, color: src.color, border: `1px solid ${src.border}`, whiteSpace: "nowrap" }}>
            {lead.source}
          </span>
        ) : <span style={{ fontSize: 12, color: THEME.textLight }}>—</span>}
      </td>
      <td style={td()}>
        <span style={{ fontSize: 12, color: "#595959", display: "block", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={lead.remarks}>
          {lead.remarks || "—"}
        </span>
      </td>
      <td style={td()}>
        {(() => {
          const t = typeStyle(lead.type);
          return t ? (
            <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: t.bg, color: t.color, border: `1px solid ${t.border}`, whiteSpace: "nowrap" }}>
              {t.label}
            </span>
          ) : <span style={{ fontSize: 12, color: THEME.textLight }}>—</span>;
        })()}
      </td>
      <td style={td()}>
        {lead.service ? (
          <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "#F9F0FF", color: "#531DAB", border: "1px solid #D3ADF7", whiteSpace: "nowrap" }}>
            {lead.service}
          </span>
        ) : <span style={{ fontSize: 12, color: THEME.textLight }}>—</span>}
      </td>
      <td style={td()}>
        <span style={{ fontSize: 12, color: "#595959", whiteSpace: "nowrap" }}>{lead.last_followup_date || "—"}</span>
      </td>
      <td style={td()}>
        {lead.last_followup_assigned_to ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: `linear-gradient(135deg,${THEME.brand},${THEME.brandMid})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
              {lead.last_followup_assigned_to[0]?.toUpperCase()}
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: THEME.text }}>{lead.last_followup_assigned_to}</span>
          </span>
        ) : <span style={{ fontSize: 12, color: THEME.textLight }}>—</span>}
      </td>
      <td style={td()}>
        <span style={{ fontSize: 12, color: "#595959", display: "block", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={lead.last_followup_talk}>
          {lead.last_followup_talk || "—"}
        </span>
      </td>
      <td style={td()}>
        {lead.last_followup_next_date ? (
          <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "#F0F5FF", color: "#2F54EB", border: "1px solid #ADC6FF", whiteSpace: "nowrap" }}>
            📅 {lead.last_followup_next_date}
          </span>
        ) : <span style={{ fontSize: 12, color: THEME.textLight }}>—</span>}
      </td>
      <td style={td("center")}>
        {(() => {
          const s = statusStyle(lead.status);
          return (
            <span style={{ display: "inline-block", padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: "nowrap" }}>
              {s.label}
            </span>
          );
        })()}
      </td>
      <td style={td("center")}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
          <EditIconBtn onClick={() => onEdit(lead.id)} />
          <DeleteIconBtn onClick={() => onDelete(lead.id)} />
        </div>
      </td>
    </tr>
  );
});

const td = (align = "left") => ({
  padding: "11px 14px",
  borderBottom: "1px solid #F5EFE4",
  verticalAlign: "middle",
  textAlign: align,
});

const HEADERS = ["#", "Name", "Mobile", "Source", "Remarks", "Type", "Service", "Last F/U Date", "Assigned To", "Talk", "Next F/U Date", "Status", "Actions"];
const SORT_KEYS = [null, "name", "mobile_no", "source", "remarks", "type", "service", "last_followup_date", "last_followup_assigned_to", null, "last_followup_next_date", "status", null];
const HEADER_ALIGN = ["center", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "center", "center"];

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const LeadsList = () => {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [sortKey, setSortKey] = useState("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [Id, setId] = useState(null);
  const [nextFuFilter, setNextFuFilter] = useState("");
  const [viewMode, setViewMode] = useState("list"); // "list" | "dashboard"

  const header = {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService(null, 0, header, fetchAdminleads.method, fetchAdminleads.url);
      if (!res.data.error) {
        const payload = res.data?.data || [];
        setData(payload.map((e) => ({
          id: e.id, name: e.name, mobile_no: e.mobile_no, email: e.email,
          source: e.source, remarks: e.remarks, type: e.type, service: e.service,
          status: e.status, last_followup_date: e.last_followup_date,
          last_followup_talk: e.last_followup_talk,
          last_followup_next_date: e.last_followup_next_date,
          last_followup_assigned_to: e.last_followup_assigned_to,
        })));
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, []);

  const handleDelete = useCallback((id) => {
    SwalAlert({}).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        const res = await DeleteLead(id, getToken());
        if (!res.data.error) {
          toast.success(res.data?.message);
          setData((prev) => prev.filter((e) => e.id !== id));
        } else toast.error(res.data?.message);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Something went wrong");
      }
    });
  }, []);

  const handleEdit = useCallback((id) => { setId(id); setEditModal(true); }, []);
  const handleDetail = useCallback((id) => navigate(`/${LeadsRoute.detail}/${id}`), []);

  const filtered = useMemo(() => {
    let result = data;
    const q = search.toLowerCase();
    if (q) {
      result = result.filter((d) =>
        d.name?.toLowerCase().includes(q) ||
        d.mobile_no?.includes(q) ||
        d.email?.toLowerCase().includes(q) ||
        d.source?.toLowerCase().includes(q) ||
        d.service?.toLowerCase().includes(q),
      );
    }
    if (nextFuFilter) {
      result = result.filter((d) => {
        if (!d.last_followup_next_date) return false;
        const parts = d.last_followup_next_date.split("-");
        const months = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" };
        const iso = `${parts[2]}-${months[parts[1]]}-${parts[0]}`;
        return iso === nextFuFilter;
      });
    }
    return result;
  }, [data, search, nextFuFilter]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = String(a[sortKey] ?? "").toLowerCase();
      const bv = String(b[sortKey] ?? "").toLowerCase();
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [filtered, sortKey, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(pageIndex, totalPages - 1);
  const pageData = sorted.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const handleSort = (key) => {
    if (!key) return;
    if (sortKey === key) setSortAsc((a) => !a);
    else { setSortKey(key); setSortAsc(true); }
    setPageIndex(0);
  };

  const sortIcon = (key) => {
    if (sortKey !== key) return <span style={{ opacity: 0.25, marginLeft: 3 }}>↕</span>;
    return <span style={{ color: THEME.brand, marginLeft: 3 }}>{sortAsc ? "↑" : "↓"}</span>;
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ minHeight: "100vh", fontFamily: "'DM Sans',sans-serif", padding: "28px 24px" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ width: 4, height: 26, borderRadius: 3, background: `linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: THEME.text, fontFamily: "'Sora',sans-serif", letterSpacing: "-0.3px" }}>
                Leads
              </h1>
            </div>
            <p style={{ margin: "0 0 0 12px", fontSize: 12, color: THEME.textMuted }}>
              {loading ? "Loading…" : `${filtered.length} lead${filtered.length !== 1 ? "s" : ""} found`}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {/* View toggle */}
            <div className="view-toggle">
              <button
                className={`toggle-btn ${viewMode === "list" ? "active" : "inactive"}`}
                onClick={() => setViewMode("list")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 6H21M8 12H21M8 18H21M3 6H3.01M3 12H3.01M3 18H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                List
              </button>
              <button
                className={`toggle-btn ${viewMode === "dashboard" ? "active" : "inactive"}`}
                onClick={() => setViewMode("dashboard")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3H10.5V12H3V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13.5 3H21V8H13.5V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13.5 11H21V21H13.5V11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 15H10.5V21H3V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Dashboard
              </button>
            </div>

            {/* Search & filter (list mode only) */}
            {viewMode === "list" && (
              <>
                <div style={{ position: "relative" }}>
                  <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: THEME.textLight, pointerEvents: "none" }}
                    xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <input type="search" className="ld-search" placeholder="Search leads…" value={search}
                    onChange={(e) => { setSearch(e.target.value); setPageIndex(0); }} />
                </div>
                <input type="date" value={nextFuFilter}
                  onChange={(e) => { setNextFuFilter(e.target.value); setPageIndex(0); }}
                  style={{
                    padding: "8px 14px", borderRadius: 10,
                    border: `1.5px solid ${nextFuFilter ? THEME.brand : "#E0D5C5"}`,
                    fontSize: 13, fontFamily: "'DM Sans',sans-serif",
                    color: nextFuFilter ? THEME.text : THEME.textLight,
                    outline: "none", background: nextFuFilter ? THEME.brandLight : "#fff",
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                />
                {nextFuFilter && (
                  <button onClick={() => { setNextFuFilter(""); setPageIndex(0); }}
                    style={{ padding: "8px 12px", borderRadius: 10, border: `1px solid ${THEME.border}`, background: "#fff", color: THEME.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    ✕ Clear
                  </button>
                )}
              </>
            )}

            <AddBtn onClick={() => setShowModal(true)} />
          </div>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0", gap: 16 }}>
            <div className="ld-spinner" />
            <p style={{ color: THEME.textLight, fontSize: 13, margin: 0 }}>Loading leads…</p>
          </div>
        )}

        {/* ── Dashboard View ── */}
        {!loading && viewMode === "dashboard" && (
          <Dashboard data={data} />
        )}

        {/* ── List View ── */}
        {!loading && viewMode === "list" && (
          <>
            {/* Total Leads stat (single) */}
            {data.length > 0 && (
              <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                <div style={{
                  flex: "0 1 155px", background: "#fff",
                  border: "1px solid #D4C4A0", borderRadius: 12,
                  padding: "12px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: THEME.brandLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: THEME.brand, fontFamily: "'Sora',sans-serif" }}>{data.length}</span>
                  </div>
                  <span style={{ fontSize: 11, color: "#8C8C8C", fontWeight: 600, lineHeight: 1.3 }}>Total Leads</span>
                </div>
              </div>
            )}

            {/* Empty */}
            {sorted.length === 0 && (
              <div style={{ textAlign: "center", padding: "64px 0", background: "#fff", border: `1px solid ${THEME.border}`, borderRadius: 14 }}>
                <div style={{ fontSize: 38, marginBottom: 10 }}>📊</div>
                <p style={{ color: THEME.textLight, fontSize: 14, margin: 0 }}>
                  {search ? "No leads match your search." : "No leads found."}
                </p>
                {search && (
                  <button onClick={() => setSearch("")}
                    style={{ marginTop: 12, padding: "7px 16px", borderRadius: 10, border: `1px solid ${THEME.border}`, background: THEME.brandLight, color: THEME.brand, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                    Clear search
                  </button>
                )}
              </div>
            )}

            {/* Table */}
            {sorted.length > 0 && (
              <div className="ld-fade" style={{ background: "#fff", border: `1px solid ${THEME.border}`, borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 12px rgba(136,117,73,0.07)" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Sans',sans-serif" }}>
                    <thead>
                      <tr style={{ background: THEME.brandLight }}>
                        {HEADERS.map((h, i) => {
                          const key = SORT_KEYS[i];
                          return (
                            <th key={h} className={key ? "ld-th" : ""} onClick={() => handleSort(key)}
                              style={{ padding: "11px 14px", fontSize: 11, fontWeight: 700, color: sortKey === key ? THEME.brand : THEME.brandDark, textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "2px solid #D4C4A0", whiteSpace: "nowrap", textAlign: HEADER_ALIGN[i] }}>
                              {h}{key && sortIcon(key)}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {pageData.map((lead, idx) => (
                        <LeadRow key={lead.id} lead={lead} index={safePage * PAGE_SIZE + idx}
                          onDetail={handleDetail} onEdit={handleEdit} onDelete={handleDelete} />
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <Pagination page={safePage + 1} total={totalPages} canPrev={safePage > 0} canNext={safePage < totalPages - 1}
                    onFirst={() => setPageIndex(0)} onPrev={() => setPageIndex((p) => p - 1)}
                    onNext={() => setPageIndex((p) => p + 1)} onLast={() => setPageIndex(totalPages - 1)} />
                )}
              </div>
            )}
          </>
        )}
      </div>

      <AddLeads show={showModal} handleClose={() => setShowModal(false)} onSuccess={fetchLeads} />
      <EditLeads editshow={editModal} handleeditClose={() => { setEditModal(false); setId(null); }} LeadId={Id} onSuccess={fetchLeads} />
    </>
  );
};

export default LeadsList;




// import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
// import { useNavigate } from "react-router-dom";
// import { getToken } from "../../../services/useLocalStorage";
// import toast from "react-hot-toast";
// import { LeadsRoute } from "../../../config/RouteConfig";
// import ApiService from "../../../services/ApiService";
// import { fetchAdminleads } from "../../../config/config";
// import { DeleteLead } from "../../../services/EmployeeService";
// import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
// import AddLeads from "./Add";
// import EditLeads from "./Edit";

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
//   rowAlt: "#FEFCF9",
//   rowHover: "#FDFAF5",
//   text: "#1A1A2E",
//   textMuted: "#ADADAD",
//   textLight: "#BDBDBD",
// };

// const PAGE_SIZE = 15;

// const GLOBAL_CSS = `
//   @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
//   * { box-sizing: border-box; }
//   @keyframes ldFadeIn {
//     from { opacity:0; transform:translateY(8px); }
//     to   { opacity:1; transform:translateY(0); }
//   }
//   .ld-fade { animation: ldFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
//   @keyframes ldSpin { to { transform:rotate(360deg); } }
//   .ld-spinner {
//     width:28px; height:28px; border-radius:50%;
//     border:3px solid #F5F0E8;
//     border-top-color:#887549;
//     animation:ldSpin 0.8s linear infinite;
//   }
//   .ld-search {
//     padding:8px 14px 8px 36px; border-radius:10px;
//     border:1.5px solid #E0D5C5; font-size:13px;
//     font-family:'DM Sans',sans-serif; color:#1A1A2E;
//     outline:none; background:#fff; width:220px;
//     transition:border-color 0.15s, width 0.2s;
//   }
//   .ld-search:focus { border-color:#887549; box-shadow:0 0 0 3px #88754918; width:260px; }
//   .ld-search::placeholder { color:#BDBDBD; }
//   .ld-th { cursor:pointer; user-select:none; white-space:nowrap; }
//   .ld-th:hover { color:#887549; }
//   ::-webkit-scrollbar { width:5px; height:5px; }
//   ::-webkit-scrollbar-track { background:#F5F0E8; }
//   ::-webkit-scrollbar-thumb { background:#C4A97D; border-radius:10px; }

//   /* Toggle button */
//   .view-toggle {
//     display: flex;
//     align-items: center;
//     background: #F5F0E8;
//     border-radius: 12px;
//     padding: 4px;
//     gap: 2px;
//     border: 1px solid #D4C4A0;
//   }
//   .toggle-btn {
//     display: flex;
//     align-items: center;
//     gap: 6px;
//     padding: 7px 14px;
//     border-radius: 9px;
//     border: none;
//     font-size: 12px;
//     font-weight: 700;
//     cursor: pointer;
//     font-family: 'Sora', sans-serif;
//     transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
//   }
//   .toggle-btn.active {
//     background: #887549;
//     color: #fff;
//     box-shadow: 0 2px 8px #88754944;
//   }
//   .toggle-btn.inactive {
//     background: transparent;
//     color: #887549;
//   }
//   .toggle-btn.inactive:hover {
//     background: #EDE5D5;
//   }

//   /* Dashboard cards */
//   @keyframes countUp {
//     from { opacity: 0; transform: translateY(12px) scale(0.95); }
//     to   { opacity: 1; transform: translateY(0) scale(1); }
//   }
//   .dash-card { animation: ldFadeIn 0.4s cubic-bezier(0.4,0,0.2,1) both; }
//   .dash-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(136,117,73,0.12) !important; }
//   .dash-card { transition: transform 0.2s, box-shadow 0.2s; }

//   /* Source bar */
//   .src-bar-fill {
//     transition: width 0.8s cubic-bezier(0.4,0,0.2,1);
//   }

//   /* Donut */
//   @keyframes dashOffset {
//     from { stroke-dashoffset: 283; }
//   }
//   .donut-seg { transition: stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1); }

//   /* Agent row */
//   .agent-row:hover { background: #FDFAF5 !important; }
//   .agent-row { transition: background 0.15s; }
// `;

// // Source → color
// const SOURCE_COLORS = {
//   default: { color: THEME.brand, bg: THEME.brandLight, border: "#D4C4A0" },
//   website: { color: "#2F54EB", bg: "#F0F5FF", border: "#ADC6FF" },
//   referral: { color: "#389E0D", bg: "#F6FFED", border: "#B7EB8F" },
//   social: { color: "#D46B08", bg: "#FFF7E6", border: "#FFD591" },
//   cold: { color: "#08979C", bg: "#E6FFFB", border: "#87E8DE" },
// };

// function sourceStyle(source) {
//   if (!source) return SOURCE_COLORS.default;
//   const s = source.toLowerCase();
//   if (s.includes("web")) return SOURCE_COLORS.website;
//   if (s.includes("ref")) return SOURCE_COLORS.referral;
//   if (s.includes("social") || s.includes("facebook") || s.includes("instagram"))
//     return SOURCE_COLORS.social;
//   if (s.includes("cold")) return SOURCE_COLORS.cold;
//   return SOURCE_COLORS.default;
// }

// function typeStyle(type) {
//   if (!type) return null;
//   const map = {
//     hot: { color: "#CF1322", bg: "#FFF1F0", border: "#FFA39E", label: "🔥 Hot" },
//     cold: { color: "#08979C", bg: "#E6FFFB", border: "#87E8DE", label: "❄️ Cold" },
//     avg: { color: "#D46B08", bg: "#FFF7E6", border: "#FFD591", label: "📊 Average" },
//   };
//   return map[type?.toLowerCase()] || null;
// }

// function statusStyle(status) {
//   const map = {
//     active: { color: "#389E0D", bg: "#F6FFED", border: "#B7EB8F", label: "● Active" },
//     inactive: { color: "#8C8C8C", bg: "#F5F5F5", border: "#D9D9D9", label: "● Inactive" },
//   };
//   return map[status?.toLowerCase()] || map.active;
// }

// // ─────────────────────────────────────────────
// //  📊  DASHBOARD COMPONENT
// // ─────────────────────────────────────────────
// const Dashboard = ({ data }) => {
//   const total = data.length;

//   // Type breakdown
//   const typeCount = useMemo(() => {
//     const map = { hot: 0, cold: 0, avg: 0, other: 0 };
//     data.forEach((d) => {
//       const t = d.type?.toLowerCase();
//       if (t === "hot") map.hot++;
//       else if (t === "cold") map.cold++;
//       else if (t === "avg") map.avg++;
//       else map.other++;
//     });
//     return map;
//   }, [data]);

//   // Status breakdown
//   const statusCount = useMemo(() => {
//     const map = {};
//     data.forEach((d) => {
//       const s = d.status?.toLowerCase() || "active";
//       map[s] = (map[s] || 0) + 1;
//     });
//     return map;
//   }, [data]);

//   // Source breakdown
//   const sourceCount = useMemo(() => {
//     const map = {};
//     data.forEach((d) => {
//       if (d.source) map[d.source] = (map[d.source] || 0) + 1;
//     });
//     return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
//   }, [data]);

//   // Agent leaderboard
//   const agentCount = useMemo(() => {
//     const map = {};
//     data.forEach((d) => {
//       if (d.last_followup_assigned_to) {
//         map[d.last_followup_assigned_to] = (map[d.last_followup_assigned_to] || 0) + 1;
//       }
//     });
//     return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
//   }, [data]);

//   // Service breakdown
//   const serviceCount = useMemo(() => {
//     const map = {};
//     data.forEach((d) => {
//       if (d.service) map[d.service] = (map[d.service] || 0) + 1;
//     });
//     return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
//   }, [data]);

//   // Next F/U upcoming (next 7 days)
//   const upcomingFollowups = useMemo(() => {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const in7 = new Date(today);
//     in7.setDate(in7.getDate() + 7);
//     const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
//     return data.filter((d) => {
//       if (!d.last_followup_next_date) return false;
//       const parts = d.last_followup_next_date.split("-");
//       if (parts.length !== 3) return false;
//       const dt = new Date(parseInt(parts[2]), months[parts[1]], parseInt(parts[0]));
//       return dt >= today && dt <= in7;
//     }).length;
//   }, [data]);

//   // Overdue
//   const overdue = useMemo(() => {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
//     return data.filter((d) => {
//       if (!d.last_followup_next_date) return false;
//       const parts = d.last_followup_next_date.split("-");
//       if (parts.length !== 3) return false;
//       const dt = new Date(parseInt(parts[2]), months[parts[1]], parseInt(parts[0]));
//       return dt < today;
//     }).length;
//   }, [data]);

//   const activeCount = statusCount["active"] || 0;
//   const inactiveCount = statusCount["inactive"] || 0;
//   const maxSource = sourceCount[0]?.[1] || 1;

//   // Donut chart for types
//   const donutData = [
//     { label: "Hot", value: typeCount.hot, color: "#CF1322" },
//     { label: "Cold", value: typeCount.cold, color: "#08979C" },
//     { label: "Average", value: typeCount.avg, color: "#D46B08" },
//     { label: "Other", value: typeCount.other, color: "#BDBDBD" },
//   ].filter(d => d.value > 0);

//   // SVG Donut
//   const DonutChart = () => {
//     const r = 45;
//     const cx = 60, cy = 60;
//     const circumference = 2 * Math.PI * r;
//     let offset = 0;
//     const totalVal = donutData.reduce((s, d) => s + d.value, 0) || 1;
//     return (
//       <svg width="120" height="120" viewBox="0 0 120 120">
//         {donutData.map((seg, i) => {
//           const pct = seg.value / totalVal;
//           const dashArray = pct * circumference;
//           const startOffset = circumference - offset * circumference / totalVal;
//           const seg_el = (
//             <circle
//               key={i}
//               className="donut-seg"
//               cx={cx} cy={cy} r={r}
//               fill="none"
//               stroke={seg.color}
//               strokeWidth="18"
//               strokeDasharray={`${dashArray} ${circumference - dashArray}`}
//               strokeDashoffset={startOffset}
//               style={{ transform: "rotate(-90deg)", transformOrigin: "60px 60px" }}
//             />
//           );
//           offset += seg.value;
//           return seg_el;
//         })}
//         <circle cx={cx} cy={cy} r="28" fill="white" />
//         <text x={cx} y={cy - 4} textAnchor="middle" fontSize="14" fontWeight="800" fill={THEME.text} fontFamily="Sora">{total}</text>
//         <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill={THEME.textMuted} fontFamily="DM Sans">leads</text>
//       </svg>
//     );
//   };

//   const KpiCard = ({ value, label, color, bg, border, icon, delay = 0 }) => (
//     <div className="dash-card" style={{
//       flex: "1 1 140px",
//       background: "#fff",
//       border: `1px solid ${border}`,
//       borderRadius: 16,
//       padding: "18px 20px",
//       display: "flex",
//       alignItems: "center",
//       gap: 14,
//       animationDelay: `${delay}s`,
//       boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
//     }}>
//       <div style={{
//         width: 48, height: 48, borderRadius: 14,
//         background: bg,
//         display: "flex", alignItems: "center", justifyContent: "center",
//         fontSize: 20, flexShrink: 0,
//       }}>{icon}</div>
//       <div>
//         <div style={{ fontSize: 26, fontWeight: 800, color, fontFamily: "'Sora',sans-serif", lineHeight: 1 }}>{value}</div>
//         <div style={{ fontSize: 11, color: "#8C8C8C", fontWeight: 600, marginTop: 4, lineHeight: 1.3 }}>{label}</div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="ld-fade" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

//       {/* Row 1 — KPI Cards */}
//       <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
//         <KpiCard value={total} label="Total Leads" color={THEME.brand} bg={THEME.brandLight} border="#D4C4A0" icon="📋" delay={0} />
//         <KpiCard value={activeCount} label="Active Leads" color="#389E0D" bg="#F6FFED" border="#B7EB8F" icon="✅" delay={0.05} />
//         <KpiCard value={typeCount.hot} label="Hot Leads" color="#CF1322" bg="#FFF1F0" border="#FFA39E" icon="🔥" delay={0.1} />
//         <KpiCard value={upcomingFollowups} label="Follow-ups (7 days)" color="#2F54EB" bg="#F0F5FF" border="#ADC6FF" icon="📅" delay={0.15} />
//         <KpiCard value={overdue} label="Overdue Follow-ups" color="#D46B08" bg="#FFF7E6" border="#FFD591" icon="⚠️" delay={0.2} />
//       </div>

//       {/* Row 2 — Type donut + Source bars + Status */}
//       <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>

//         {/* Lead Type Breakdown */}
//         <div className="dash-card" style={{
//           flex: "0 1 260px", background: "#fff",
//           border: `1px solid ${THEME.border}`, borderRadius: 16,
//           padding: "20px 22px", animationDelay: "0.25s",
//           boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
//         }}>
//           <div style={{ fontSize: 13, fontWeight: 700, color: THEME.text, fontFamily: "'Sora',sans-serif", marginBottom: 16 }}>
//             Lead Type Mix
//           </div>
//           <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
//             <DonutChart />
//             <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
//               {donutData.map(d => (
//                 <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
//                   <div style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }} />
//                   <span style={{ fontSize: 11, color: "#595959", fontWeight: 600 }}>{d.label}</span>
//                   <span style={{ fontSize: 11, color: THEME.textMuted, marginLeft: "auto", fontWeight: 700, paddingLeft: 12 }}>{d.value}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Source Breakdown */}
//         <div className="dash-card" style={{
//           flex: "1 1 260px", background: "#fff",
//           border: `1px solid ${THEME.border}`, borderRadius: 16,
//           padding: "20px 22px", animationDelay: "0.3s",
//           boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
//         }}>
//           <div style={{ fontSize: 13, fontWeight: 700, color: THEME.text, fontFamily: "'Sora',sans-serif", marginBottom: 16 }}>
//             Lead Sources
//           </div>
//           {sourceCount.length === 0 ? (
//             <p style={{ fontSize: 12, color: THEME.textLight, margin: 0 }}>No source data</p>
//           ) : (
//             <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//               {sourceCount.map(([src, cnt], i) => {
//                 const style = sourceStyle(src);
//                 const pct = Math.round((cnt / (total || 1)) * 100);
//                 return (
//                   <div key={src}>
//                     <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
//                       <span style={{
//                         fontSize: 11, fontWeight: 700,
//                         color: style.color, background: style.bg,
//                         border: `1px solid ${style.border}`,
//                         padding: "2px 8px", borderRadius: 20,
//                       }}>{src}</span>
//                       <span style={{ fontSize: 11, fontWeight: 700, color: THEME.text }}>{cnt} <span style={{ color: THEME.textMuted, fontWeight: 500 }}>({pct}%)</span></span>
//                     </div>
//                     <div style={{ height: 6, background: "#F5EFE4", borderRadius: 10, overflow: "hidden" }}>
//                       <div className="src-bar-fill" style={{
//                         height: "100%",
//                         width: `${(cnt / maxSource) * 100}%`,
//                         background: `linear-gradient(90deg, ${style.color}88, ${style.color})`,
//                         borderRadius: 10,
//                       }} />
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>

//         {/* Status + Service */}
//         <div style={{ flex: "0 1 220px", display: "flex", flexDirection: "column", gap: 14 }}>
//           {/* Status */}
//           <div className="dash-card" style={{
//             background: "#fff",
//             border: `1px solid ${THEME.border}`, borderRadius: 16,
//             padding: "18px 20px", animationDelay: "0.35s",
//             boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
//           }}>
//             <div style={{ fontSize: 13, fontWeight: 700, color: THEME.text, fontFamily: "'Sora',sans-serif", marginBottom: 14 }}>
//               Status
//             </div>
//             <div style={{ display: "flex", gap: 12 }}>
//               {[
//                 { label: "Active", value: activeCount, color: "#389E0D", bg: "#F6FFED", border: "#B7EB8F" },
//                 { label: "Inactive", value: inactiveCount, color: "#8C8C8C", bg: "#F5F5F5", border: "#D9D9D9" },
//               ].map(s => (
//                 <div key={s.label} style={{
//                   flex: 1, background: s.bg, border: `1px solid ${s.border}`,
//                   borderRadius: 12, padding: "12px 10px", textAlign: "center",
//                 }}>
//                   <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: "'Sora',sans-serif" }}>{s.value}</div>
//                   <div style={{ fontSize: 10, color: s.color, fontWeight: 600, marginTop: 2 }}>{s.label}</div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Top Services */}
//           <div className="dash-card" style={{
//             background: "#fff",
//             border: `1px solid ${THEME.border}`, borderRadius: 16,
//             padding: "18px 20px", animationDelay: "0.4s",
//             flex: 1,
//             boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
//           }}>
//             <div style={{ fontSize: 13, fontWeight: 700, color: THEME.text, fontFamily: "'Sora',sans-serif", marginBottom: 12 }}>
//               Top Services
//             </div>
//             {serviceCount.length === 0 ? (
//               <p style={{ fontSize: 12, color: THEME.textLight, margin: 0 }}>No data</p>
//             ) : (
//               <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
//                 {serviceCount.map(([svc, cnt]) => (
//                   <div key={svc} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//                     <span style={{
//                       fontSize: 11, fontWeight: 600,
//                       background: "#F9F0FF", color: "#531DAB",
//                       border: "1px solid #D3ADF7",
//                       padding: "2px 8px", borderRadius: 20,
//                       maxWidth: 120, overflow: "hidden",
//                       textOverflow: "ellipsis", whiteSpace: "nowrap",
//                     }}>{svc}</span>
//                     <span style={{ fontSize: 12, fontWeight: 700, color: THEME.text }}>{cnt}</span>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Row 3 — Agent Leaderboard */}
//       {agentCount.length > 0 && (
//         <div className="dash-card" style={{
//           background: "#fff",
//           border: `1px solid ${THEME.border}`, borderRadius: 16,
//           padding: "20px 22px", animationDelay: "0.45s",
//           boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
//         }}>
//           <div style={{ fontSize: 13, fontWeight: 700, color: THEME.text, fontFamily: "'Sora',sans-serif", marginBottom: 14 }}>
//             🏆 Top Assigned Agents
//           </div>
//           <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
//             {agentCount.map(([agent, cnt], i) => {
//               const pct = Math.round((cnt / (total || 1)) * 100);
//               const medals = ["🥇", "🥈", "🥉"];
//               return (
//                 <div key={agent} className="agent-row" style={{
//                   display: "flex", alignItems: "center", gap: 14,
//                   padding: "10px 12px",
//                   borderRadius: 10,
//                   borderBottom: i < agentCount.length - 1 ? "1px solid #F5EFE4" : "none",
//                 }}>
//                   <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>{medals[i] || `${i + 1}`}</span>
//                   <div style={{
//                     width: 34, height: 34, borderRadius: "50%",
//                     background: `linear-gradient(135deg,${THEME.brand},${THEME.brandMid})`,
//                     display: "flex", alignItems: "center", justifyContent: "center",
//                     fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0,
//                   }}>
//                     {agent[0]?.toUpperCase()}
//                   </div>
//                   <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: THEME.text }}>{agent}</span>
//                   <div style={{ flex: 2, height: 8, background: "#F5EFE4", borderRadius: 10, overflow: "hidden" }}>
//                     <div className="src-bar-fill" style={{
//                       height: "100%",
//                       width: `${(cnt / (agentCount[0]?.[1] || 1)) * 100}%`,
//                       background: `linear-gradient(90deg,${THEME.brandMid},${THEME.brand})`,
//                       borderRadius: 10,
//                     }} />
//                   </div>
//                   <span style={{ fontSize: 13, fontWeight: 700, color: THEME.brand, minWidth: 60, textAlign: "right" }}>
//                     {cnt} <span style={{ fontSize: 11, color: THEME.textMuted, fontWeight: 500 }}>({pct}%)</span>
//                   </span>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // ─────────────────────────────────────────────
// //  🧩  ATOMS
// // ─────────────────────────────────────────────

// function AddBtn({ onClick }) {
//   const [hov, setHov] = useState(false);
//   return (
//     <button
//       onClick={onClick}
//       onMouseEnter={() => setHov(true)}
//       onMouseLeave={() => setHov(false)}
//       style={{
//         padding: "9px 18px", borderRadius: 10, border: "none",
//         background: hov ? THEME.brandDark : THEME.brand,
//         color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
//         fontFamily: "'Sora',sans-serif", transition: "all 0.18s",
//         boxShadow: `0 2px 8px ${THEME.brand}44`, whiteSpace: "nowrap",
//       }}
//     >
//       + Add Lead
//     </button>
//   );
// }

// function EditIconBtn({ onClick }) {
//   const [hov, setHov] = useState(false);
//   return (
//     <button onClick={onClick} title="Edit"
//       onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
//       style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, color: hov ? THEME.brand : "#657488", transition: "color 0.15s" }}
//     >
//       <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none">
//         <path d="M13.26 4L5.05 12.69C4.74 13.02 4.44 13.67 4.38 14.12L4.01 17.36C3.88 18.53 4.72 19.33 5.88 19.13L9.1 18.58C9.55 18.5 10.18 18.17 10.49 17.83L18.7 9.14C20.12 7.64 20.76 5.93 18.55 3.84C16.35 1.77 14.68 2.5 13.26 4Z" stroke="currentColor" strokeWidth="1.8" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
//         <path d="M11.89 5.45C12.32 8.21 14.56 10.32 17.34 10.6" stroke="currentColor" strokeWidth="1.8" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
//         <path d="M3 22H21" stroke="currentColor" strokeWidth="1.8" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
//       </svg>
//     </button>
//   );
// }

// function DeleteIconBtn({ onClick }) {
//   const [hov, setHov] = useState(false);
//   return (
//     <button onClick={onClick} title="Delete"
//       onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
//       style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, color: hov ? "#FF4D4F" : "#FF8096", transition: "color 0.15s" }}
//     >
//       <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 20 20" fill="none">
//         <path d="M17.5 4.98c-2.775-.275-5.567-.417-8.35-.417q-2.475 0-4.95.25l-1.7.167" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//         <path d="m7.083 4.142.183-1.092C7.4 2.258 7.5 1.667 8.908 1.667h2.183c1.408 0 1.517.625 1.642 1.392l.183 1.083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//         <path d="m15.707 7.617-.542 8.392c-.092 1.308-.167 2.325-2.492 2.325h-5.35c-2.325 0-2.4-1.017-2.492-2.325l-.542-8.392" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//         <path d="M8.607 13.75h2.775M7.913 10.417h4.167" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//       </svg>
//     </button>
//   );
// }

// function Pagination({ page, total, canPrev, canNext, onFirst, onPrev, onNext, onLast }) {
//   const btn = (disabled) => ({
//     width: 30, height: 30, borderRadius: 8,
//     background: disabled ? "#F5F5F5" : "#fff",
//     border: `1px solid ${disabled ? "#E8E8E8" : "#E0D5C5"}`,
//     color: disabled ? THEME.textLight : THEME.brand,
//     cursor: disabled ? "default" : "pointer",
//     display: "flex", alignItems: "center", justifyContent: "center",
//     fontSize: 14, fontWeight: 700, transition: "all 0.15s",
//   });
//   return (
//     <div style={{
//       display: "flex", alignItems: "center", justifyContent: "flex-end",
//       gap: 6, padding: "12px 20px",
//       borderTop: "1px solid #F5EFE4", background: "#FDFAF5",
//     }}>
//       <button style={btn(!canPrev)} onClick={onFirst} disabled={!canPrev}>«</button>
//       <button style={btn(!canPrev)} onClick={onPrev} disabled={!canPrev}>‹</button>
//       <span style={{ fontSize: 13, color: "#595959", fontWeight: 600, padding: "0 8px" }}>
//         Page <span style={{ color: THEME.brand }}>{page}</span> of {total}
//       </span>
//       <button style={btn(!canNext)} onClick={onNext} disabled={!canNext}>›</button>
//       <button style={btn(!canNext)} onClick={onLast} disabled={!canNext}>»</button>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────
// //  TABLE ROW  —  memo for performance
// // ─────────────────────────────────────────────
// const LeadRow = memo(({ lead, index, onDetail, onEdit, onDelete }) => {
//   const [hov, setHov] = useState(false);
//   const src = sourceStyle(lead.source);

//   return (
//     <tr
//       onMouseEnter={() => setHov(true)}
//       onMouseLeave={() => setHov(false)}
//       style={{
//         background: hov ? THEME.rowHover : index % 2 === 0 ? "#fff" : THEME.rowAlt,
//         transition: "background 0.15s",
//       }}
//     >
//       <td style={td("center")}>
//         <span style={{ fontSize: 12, fontWeight: 700, color: THEME.textMuted }}>{index + 1}</span>
//       </td>
//       <td style={td()}>
//         <button onClick={() => onDetail(lead.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}>
//           <span style={{ fontSize: 13, fontWeight: 600, color: THEME.brand, textDecoration: "underline", textDecorationStyle: "dotted", textUnderlineOffset: 3 }}>
//             {lead.name || "—"}
//           </span>
//         </button>
//       </td>
//       <td style={td()}>
//         <span style={{ fontSize: 12, color: "#595959", whiteSpace: "nowrap" }}>{lead.mobile_no || "—"}</span>
//       </td>
//       <td style={td()}>
//         {lead.source ? (
//           <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: src.bg, color: src.color, border: `1px solid ${src.border}`, whiteSpace: "nowrap" }}>
//             {lead.source}
//           </span>
//         ) : <span style={{ fontSize: 12, color: THEME.textLight }}>—</span>}
//       </td>
//       <td style={td()}>
//         <span style={{ fontSize: 12, color: "#595959", display: "block", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={lead.remarks}>
//           {lead.remarks || "—"}
//         </span>
//       </td>
//       <td style={td()}>
//         {(() => {
//           const t = typeStyle(lead.type);
//           return t ? (
//             <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: t.bg, color: t.color, border: `1px solid ${t.border}`, whiteSpace: "nowrap" }}>
//               {t.label}
//             </span>
//           ) : <span style={{ fontSize: 12, color: THEME.textLight }}>—</span>;
//         })()}
//       </td>
//       <td style={td()}>
//         {lead.service ? (
//           <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "#F9F0FF", color: "#531DAB", border: "1px solid #D3ADF7", whiteSpace: "nowrap" }}>
//             {lead.service}
//           </span>
//         ) : <span style={{ fontSize: 12, color: THEME.textLight }}>—</span>}
//       </td>
//       <td style={td()}>
//         <span style={{ fontSize: 12, color: "#595959", whiteSpace: "nowrap" }}>{lead.last_followup_date || "—"}</span>
//       </td>
//       <td style={td()}>
//         {lead.last_followup_assigned_to ? (
//           <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
//             <div style={{ width: 24, height: 24, borderRadius: "50%", background: `linear-gradient(135deg,${THEME.brand},${THEME.brandMid})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
//               {lead.last_followup_assigned_to[0]?.toUpperCase()}
//             </div>
//             <span style={{ fontSize: 12, fontWeight: 600, color: THEME.text }}>{lead.last_followup_assigned_to}</span>
//           </span>
//         ) : <span style={{ fontSize: 12, color: THEME.textLight }}>—</span>}
//       </td>
//       <td style={td()}>
//         <span style={{ fontSize: 12, color: "#595959", display: "block", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={lead.last_followup_talk}>
//           {lead.last_followup_talk || "—"}
//         </span>
//       </td>
//       <td style={td()}>
//         {lead.last_followup_next_date ? (
//           <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "#F0F5FF", color: "#2F54EB", border: "1px solid #ADC6FF", whiteSpace: "nowrap" }}>
//             📅 {lead.last_followup_next_date}
//           </span>
//         ) : <span style={{ fontSize: 12, color: THEME.textLight }}>—</span>}
//       </td>
//       <td style={td("center")}>
//         {(() => {
//           const s = statusStyle(lead.status);
//           return (
//             <span style={{ display: "inline-block", padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: "nowrap" }}>
//               {s.label}
//             </span>
//           );
//         })()}
//       </td>
//       <td style={td("center")}>
//         <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
//           <EditIconBtn onClick={() => onEdit(lead.id)} />
//           <DeleteIconBtn onClick={() => onDelete(lead.id)} />
//         </div>
//       </td>
//     </tr>
//   );
// });

// const td = (align = "left") => ({
//   padding: "11px 14px",
//   borderBottom: "1px solid #F5EFE4",
//   verticalAlign: "middle",
//   textAlign: align,
// });

// const HEADERS = ["#", "Name", "Mobile", "Source", "Remarks", "Type", "Service", "Last F/U Date", "Assigned To", "Talk", "Next F/U Date", "Status", "Actions"];
// const SORT_KEYS = [null, "name", "mobile_no", "source", "remarks", "type", "service", "last_followup_date", "last_followup_assigned_to", null, "last_followup_next_date", "status", null];
// const HEADER_ALIGN = ["center", "left", "left", "left", "left", "left", "left", "left", "left", "left", "left", "center", "center"];

// // ─────────────────────────────────────────────
// //  🚀  MAIN COMPONENT
// // ─────────────────────────────────────────────
// const LeadsList = () => {
//   const navigate = useNavigate();

//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [search, setSearch] = useState("");
//   const [pageIndex, setPageIndex] = useState(0);
//   const [sortKey, setSortKey] = useState("name");
//   const [sortAsc, setSortAsc] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [editModal, setEditModal] = useState(false);
//   const [Id, setId] = useState(null);
//   const [nextFuFilter, setNextFuFilter] = useState("");
//   const [viewMode, setViewMode] = useState("list"); // "list" | "dashboard"

//   const header = {
//     Authorization: `Bearer ${getToken()}`,
//     "Content-Type": "application/json",
//   };

//   const fetchLeads = useCallback(async () => {
//     setLoading(true);
//     try {
//       const res = await ApiService(null, 0, header, fetchAdminleads.method, fetchAdminleads.url);
//       if (!res.data.error) {
//         const payload = res.data?.data || [];
//         setData(payload.map((e) => ({
//           id: e.id, name: e.name, mobile_no: e.mobile_no, email: e.email,
//           source: e.source, remarks: e.remarks, type: e.type, service: e.service,
//           status: e.status, last_followup_date: e.last_followup_date,
//           last_followup_talk: e.last_followup_talk,
//           last_followup_next_date: e.last_followup_next_date,
//           last_followup_assigned_to: e.last_followup_assigned_to,
//         })));
//       }
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "An error occurred");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => { fetchLeads(); }, []);

//   const handleDelete = useCallback((id) => {
//     SwalAlert({}).then(async (result) => {
//       if (!result.isConfirmed) return;
//       try {
//         const res = await DeleteLead(id, getToken());
//         if (!res.data.error) {
//           toast.success(res.data?.message);
//           setData((prev) => prev.filter((e) => e.id !== id));
//         } else toast.error(res.data?.message);
//       } catch (err) {
//         toast.error(err?.response?.data?.message || "Something went wrong");
//       }
//     });
//   }, []);

//   const handleEdit = useCallback((id) => { setId(id); setEditModal(true); }, []);
//   const handleDetail = useCallback((id) => navigate(`/${LeadsRoute.detail}/${id}`), []);

//   const filtered = useMemo(() => {
//     let result = data;
//     const q = search.toLowerCase();
//     if (q) {
//       result = result.filter((d) =>
//         d.name?.toLowerCase().includes(q) ||
//         d.mobile_no?.includes(q) ||
//         d.email?.toLowerCase().includes(q) ||
//         d.source?.toLowerCase().includes(q) ||
//         d.service?.toLowerCase().includes(q),
//       );
//     }
//     if (nextFuFilter) {
//       result = result.filter((d) => {
//         if (!d.last_followup_next_date) return false;
//         const parts = d.last_followup_next_date.split("-");
//         const months = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" };
//         const iso = `${parts[2]}-${months[parts[1]]}-${parts[0]}`;
//         return iso === nextFuFilter;
//       });
//     }
//     return result;
//   }, [data, search, nextFuFilter]);

//   const sorted = useMemo(() => {
//     if (!sortKey) return filtered;
//     return [...filtered].sort((a, b) => {
//       const av = String(a[sortKey] ?? "").toLowerCase();
//       const bv = String(b[sortKey] ?? "").toLowerCase();
//       return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
//     });
//   }, [filtered, sortKey, sortAsc]);

//   const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
//   const safePage = Math.min(pageIndex, totalPages - 1);
//   const pageData = sorted.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

//   const handleSort = (key) => {
//     if (!key) return;
//     if (sortKey === key) setSortAsc((a) => !a);
//     else { setSortKey(key); setSortAsc(true); }
//     setPageIndex(0);
//   };

//   const sortIcon = (key) => {
//     if (sortKey !== key) return <span style={{ opacity: 0.25, marginLeft: 3 }}>↕</span>;
//     return <span style={{ color: THEME.brand, marginLeft: 3 }}>{sortAsc ? "↑" : "↓"}</span>;
//   };

//   return (
//     <>
//       <style>{GLOBAL_CSS}</style>
//       <div style={{ minHeight: "100vh", fontFamily: "'DM Sans',sans-serif", padding: "28px 24px" }}>

//         {/* ── Header ── */}
//         <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
//           <div>
//             <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
//               <div style={{ width: 4, height: 26, borderRadius: 3, background: `linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
//               <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: THEME.text, fontFamily: "'Sora',sans-serif", letterSpacing: "-0.3px" }}>
//                 Leads
//               </h1>
//             </div>
//             <p style={{ margin: "0 0 0 12px", fontSize: 12, color: THEME.textMuted }}>
//               {loading ? "Loading…" : `${filtered.length} lead${filtered.length !== 1 ? "s" : ""} found`}
//             </p>
//           </div>

//           <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
//             {/* View toggle */}
//             <div className="view-toggle">
//               <button
//                 className={`toggle-btn ${viewMode === "list" ? "active" : "inactive"}`}
//                 onClick={() => setViewMode("list")}
//               >
//                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                   <path d="M8 6H21M8 12H21M8 18H21M3 6H3.01M3 12H3.01M3 18H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                 </svg>
//                 List
//               </button>
//               <button
//                 className={`toggle-btn ${viewMode === "dashboard" ? "active" : "inactive"}`}
//                 onClick={() => setViewMode("dashboard")}
//               >
//                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                   <path d="M3 3H10.5V12H3V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                   <path d="M13.5 3H21V8H13.5V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                   <path d="M13.5 11H21V21H13.5V11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                   <path d="M3 15H10.5V21H3V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                 </svg>
//                 Dashboard
//               </button>
//             </div>

//             {/* Search & filter (list mode only) */}
//             {viewMode === "list" && (
//               <>
//                 <div style={{ position: "relative" }}>
//                   <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: THEME.textLight, pointerEvents: "none" }}
//                     xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none">
//                     <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
//                   </svg>
//                   <input type="search" className="ld-search" placeholder="Search leads…" value={search}
//                     onChange={(e) => { setSearch(e.target.value); setPageIndex(0); }} />
//                 </div>
//                 <input type="date" value={nextFuFilter}
//                   onChange={(e) => { setNextFuFilter(e.target.value); setPageIndex(0); }}
//                   style={{
//                     padding: "8px 14px", borderRadius: 10,
//                     border: `1.5px solid ${nextFuFilter ? THEME.brand : "#E0D5C5"}`,
//                     fontSize: 13, fontFamily: "'DM Sans',sans-serif",
//                     color: nextFuFilter ? THEME.text : THEME.textLight,
//                     outline: "none", background: nextFuFilter ? THEME.brandLight : "#fff",
//                     cursor: "pointer", transition: "all 0.15s",
//                   }}
//                 />
//                 {nextFuFilter && (
//                   <button onClick={() => { setNextFuFilter(""); setPageIndex(0); }}
//                     style={{ padding: "8px 12px", borderRadius: 10, border: `1px solid ${THEME.border}`, background: "#fff", color: THEME.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
//                     ✕ Clear
//                   </button>
//                 )}
//               </>
//             )}

//             <AddBtn onClick={() => setShowModal(true)} />
//           </div>
//         </div>

//         {/* ── Loading ── */}
//         {loading && (
//           <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0", gap: 16 }}>
//             <div className="ld-spinner" />
//             <p style={{ color: THEME.textLight, fontSize: 13, margin: 0 }}>Loading leads…</p>
//           </div>
//         )}

//         {/* ── Dashboard View ── */}
//         {!loading && viewMode === "dashboard" && (
//           <Dashboard data={data} />
//         )}

//         {/* ── List View ── */}
//         {!loading && viewMode === "list" && (
//           <>
//             {/* Total Leads stat (single) */}
//             {data.length > 0 && (
//               <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
//                 <div style={{
//                   flex: "0 1 155px", background: "#fff",
//                   border: "1px solid #D4C4A0", borderRadius: 12,
//                   padding: "12px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
//                   display: "flex", alignItems: "center", gap: 12,
//                 }}>
//                   <div style={{ width: 38, height: 38, borderRadius: 10, background: THEME.brandLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
//                     <span style={{ fontSize: 15, fontWeight: 800, color: THEME.brand, fontFamily: "'Sora',sans-serif" }}>{data.length}</span>
//                   </div>
//                   <span style={{ fontSize: 11, color: "#8C8C8C", fontWeight: 600, lineHeight: 1.3 }}>Total Leads</span>
//                 </div>
//               </div>
//             )}

//             {/* Empty */}
//             {sorted.length === 0 && (
//               <div style={{ textAlign: "center", padding: "64px 0", background: "#fff", border: `1px solid ${THEME.border}`, borderRadius: 14 }}>
//                 <div style={{ fontSize: 38, marginBottom: 10 }}>📊</div>
//                 <p style={{ color: THEME.textLight, fontSize: 14, margin: 0 }}>
//                   {search ? "No leads match your search." : "No leads found."}
//                 </p>
//                 {search && (
//                   <button onClick={() => setSearch("")}
//                     style={{ marginTop: 12, padding: "7px 16px", borderRadius: 10, border: `1px solid ${THEME.border}`, background: THEME.brandLight, color: THEME.brand, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
//                     Clear search
//                   </button>
//                 )}
//               </div>
//             )}

//             {/* Table */}
//             {sorted.length > 0 && (
//               <div className="ld-fade" style={{ background: "#fff", border: `1px solid ${THEME.border}`, borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 12px rgba(136,117,73,0.07)" }}>
//                 <div style={{ overflowX: "auto" }}>
//                   <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Sans',sans-serif" }}>
//                     <thead>
//                       <tr style={{ background: THEME.brandLight }}>
//                         {HEADERS.map((h, i) => {
//                           const key = SORT_KEYS[i];
//                           return (
//                             <th key={h} className={key ? "ld-th" : ""} onClick={() => handleSort(key)}
//                               style={{ padding: "11px 14px", fontSize: 11, fontWeight: 700, color: sortKey === key ? THEME.brand : THEME.brandDark, textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "2px solid #D4C4A0", whiteSpace: "nowrap", textAlign: HEADER_ALIGN[i] }}>
//                               {h}{key && sortIcon(key)}
//                             </th>
//                           );
//                         })}
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {pageData.map((lead, idx) => (
//                         <LeadRow key={lead.id} lead={lead} index={safePage * PAGE_SIZE + idx}
//                           onDetail={handleDetail} onEdit={handleEdit} onDelete={handleDelete} />
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//                 {totalPages > 1 && (
//                   <Pagination page={safePage + 1} total={totalPages} canPrev={safePage > 0} canNext={safePage < totalPages - 1}
//                     onFirst={() => setPageIndex(0)} onPrev={() => setPageIndex((p) => p - 1)}
//                     onNext={() => setPageIndex((p) => p + 1)} onLast={() => setPageIndex(totalPages - 1)} />
//                 )}
//               </div>
//             )}
//           </>
//         )}
//       </div>

//       <AddLeads show={showModal} handleClose={() => setShowModal(false)} onSuccess={fetchLeads} />
//       <EditLeads editshow={editModal} handleeditClose={() => { setEditModal(false); setId(null); }} LeadId={Id} onSuccess={fetchLeads} />
//     </>
//   );
// };

// export default LeadsList;