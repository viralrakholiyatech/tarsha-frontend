import React, { useState } from "react";

/* ─── Compact Metric Card ────────────────────────────────────── */
const MetricCard = ({ title, value, sub, trend, trendPositive = true, color = "#4F46E5", icon }) => (
  <div style={{
    background: "#FFFFFF",
    borderRadius: "10px",
    padding: "14px 16px",
    border: "1px solid #E2E8F0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 16px rgba(0,0,0,0.02)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "relative",
    overflow: "hidden",
  }}>
    <div style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "2.5px",
      background: color,
    }} />

    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
      <div>
        <div style={{ fontSize: "10.5px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748B" }}>
          {title}
        </div>
        <div style={{
          fontSize: "24px",
          fontWeight: "800",
          color: "#0F172A",
          lineHeight: "1.2",
          marginTop: "4px",
          fontFamily: "'Manrope', -apple-system, sans-serif",
        }}>
          {value}
        </div>
      </div>
      <div style={{
        width: "32px",
        height: "32px",
        borderRadius: "8px",
        background: "#F8FAFC",
        color: color,
        display: "grid",
        placeItems: "center",
        border: "1px solid #E2E8F0",
        flexShrink: 0,
      }}>
        {icon}
      </div>
    </div>

    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #F1F5F9" }}>
      <span style={{ fontSize: "11px", color: "#64748B" }}>{sub}</span>
      {trend && (
        <span style={{
          fontSize: "10px",
          fontWeight: "700",
          padding: "2px 6px",
          borderRadius: "6px",
          background: trendPositive ? "#ECFDF5" : "#FFF1F2",
          color: trendPositive ? "#059669" : "#E11D48",
        }}>
          {trendPositive ? "↑ " : "↓ "}
          {trend}
        </span>
      )}
    </div>
  </div>
);

/* ─── Compact SVG Area Curve Chart (Revenue / MRR) ───────────── */
const RevenueGrowthChart = ({ totalCompanies = 0 }) => {
  const [hoverIdx, setHoverIdx] = useState(null);

  const points = [
    { month: "May", companies: Math.max(1, Math.round(totalCompanies * 0.2)), mrr: "₹29,990" },
    { month: "Jun", companies: Math.max(1, Math.round(totalCompanies * 0.35)), mrr: "₹59,980" },
    { month: "Jul", companies: Math.max(2, Math.round(totalCompanies * 0.5)), mrr: "₹89,970" },
    { month: "Aug", companies: Math.max(2, Math.round(totalCompanies * 0.7)), mrr: "₹1,34,950" },
    { month: "Sep", companies: Math.max(3, Math.round(totalCompanies * 0.85)), mrr: "₹1,79,940" },
    { month: "Oct (Now)", companies: Math.max(3, totalCompanies), mrr: `₹${(Math.max(3, totalCompanies) * 24999).toLocaleString("en-IN")}` },
  ];

  const maxVal = Math.max(...points.map((p) => p.companies), 5);
  const chartW = 500;
  const chartH = 130;
  const padX = 24;
  const padY = 16;

  const getX = (idx) => padX + (idx / (points.length - 1)) * (chartW - padX * 2);
  const getY = (val) => chartH - padY - (val / maxVal) * (chartH - padY * 2);

  const coords = points.map((p, idx) => ({ x: getX(idx), y: getY(p.companies) }));
  const pathD = coords.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = arr[i - 1];
    const cpX = (prev.x + pt.x) / 2;
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${pt.y}, ${pt.x} ${pt.y}`;
  }, "");
  const areaD = `${pathD} L ${coords[coords.length - 1].x} ${chartH} L ${coords[0].x} ${chartH} Z`;

  return (
    <div style={{ position: "relative" }}>
      <svg
        viewBox={`0 0 ${chartW} ${chartH}`}
        style={{ width: "100%", height: "135px", overflow: "visible" }}
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.00" />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
        </defs>

        {[0, 0.5, 1].map((pct, idx) => (
          <line
            key={idx}
            x1={padX}
            y1={padY + pct * (chartH - padY * 2)}
            x2={chartW - padX}
            y2={padY + pct * (chartH - padY * 2)}
            stroke="#F1F5F9"
            strokeDasharray="3 3"
            strokeWidth="0.8"
          />
        ))}

        <path d={areaD} fill="url(#areaGradient)" />
        <path d={pathD} fill="none" stroke="url(#lineGradient)" strokeWidth="2.5" strokeLinecap="round" />

        {coords.map((pt, i) => (
          <g key={i}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hoverIdx === i ? 5 : 3.5}
              fill="#FFFFFF"
              stroke="#4F46E5"
              strokeWidth="2"
              style={{ cursor: "pointer", transition: "all 0.15s ease" }}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
            />
            <text
              x={pt.x}
              y={chartH + 13}
              textAnchor="middle"
              fill="#64748B"
              fontSize="9"
              fontWeight="600"
              fontFamily="system-ui"
            >
              {points[i].month}
            </text>
          </g>
        ))}
      </svg>

      {hoverIdx !== null && (
        <div style={{
          position: "absolute",
          left: `${(coords[hoverIdx].x / chartW) * 100}%`,
          top: "4px",
          transform: "translateX(-50%)",
          background: "#0F172A",
          color: "#FFFFFF",
          padding: "5px 10px",
          borderRadius: "6px",
          fontSize: "11px",
          pointerEvents: "none",
          boxShadow: "0 4px 12px rgba(15,23,42,0.25)",
          whiteSpace: "nowrap",
          zIndex: 10,
        }}>
          <strong>{points[hoverIdx].month}</strong>: {points[hoverIdx].companies} Tenants • {points[hoverIdx].mrr}
        </div>
      )}
    </div>
  );
};

/* ─── Compact Donut Chart ────────────────────────────────────── */
const TenantStatusDonut = ({ active = 0, expired = 0, suspended = 0 }) => {
  const total = active + expired + suspended || 1;
  const activePct = (active / total) * 100;
  const expiredPct = (expired / total) * 100;
  const suspendedPct = (suspended / total) * 100;

  const size = 105;
  const strokeW = 12;
  const r = (size - strokeW) / 2;
  const circ = 2 * Math.PI * r;

  const aLen = (activePct / 100) * circ;
  const eLen = (expiredPct / 100) * circ;
  const sLen = (suspendedPct / 100) * circ;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
      <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1F5F9" strokeWidth={strokeW} />
          {active > 0 && (
            <circle
              cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#10B981" strokeWidth={strokeW}
              strokeDasharray={`${aLen} ${circ - aLen}`}
              strokeDashoffset="0"
            />
          )}
          {expired > 0 && (
            <circle
              cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F59E0B" strokeWidth={strokeW}
              strokeDasharray={`${eLen} ${circ - eLen}`}
              strokeDashoffset={-aLen}
            />
          )}
          {suspended > 0 && (
            <circle
              cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F43F5E" strokeWidth={strokeW}
              strokeDasharray={`${sLen} ${circ - sLen}`}
              strokeDashoffset={-(aLen + eLen)}
            />
          )}
        </svg>

        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}>
          <span style={{
            fontSize: "20px",
            fontWeight: "800",
            color: "#0F172A",
            lineHeight: "1",
          }}>
            {active + expired + suspended}
          </span>
          <span style={{ fontSize: "8.5px", fontWeight: "700", textTransform: "uppercase", color: "#64748B", marginTop: "1px" }}>
            Total
          </span>
        </div>
      </div>

      {/* Compact Legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10B981" }} />
            <span style={{ color: "#334155", fontWeight: "600" }}>Active</span>
          </div>
          <span style={{ fontWeight: "700", color: "#10B981" }}>{active}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#F59E0B" }} />
            <span style={{ color: "#334155", fontWeight: "600" }}>Expiring (7d)</span>
          </div>
          <span style={{ fontWeight: "700", color: "#F59E0B" }}>{expired}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#F43F5E" }} />
            <span style={{ color: "#334155", fontWeight: "600" }}>Suspended</span>
          </div>
          <span style={{ fontWeight: "700", color: "#F43F5E" }}>{suspended}</span>
        </div>
      </div>
    </div>
  );
};

/* ─── Compact Module Adoption ────────────────────────────────── */
const ModuleAdoptionChart = ({ companies = [] }) => {
  const modulesToCheck = [
    { key: "Meeting", label: "Meetings" },
    { key: "Team", label: "Team / HR" },
    { key: "Interior", label: "Interior Design" },
    // { key: "Finance", label: "Finance & Bills" },
    { key: "Architecture", label: "Architecture" },
    { key: "Site Inspection", label: "Site Inspection" },
  ];

  const total = companies.length || 1;

  const counts = modulesToCheck.map((mod) => {
    const subscribed = companies.filter((c) => (c.features || []).includes(mod.key)).length;
    const pct = Math.round((subscribed / total) * 100);
    return { ...mod, count: subscribed, pct };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {counts.map((m) => (
        <div key={m.key}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" }}>
            <span style={{ fontSize: "11px", fontWeight: "600", color: "#334155" }}>{m.label}</span>
            <span style={{ fontSize: "10.5px", color: "#4F46E5", fontWeight: "700" }}>
              {m.count} ({m.pct}%)
            </span>
          </div>
          <div style={{ width: "100%", height: "5px", borderRadius: "4px", background: "#F1F5F9", overflow: "hidden" }}>
            <div style={{
              width: `${Math.max(m.pct, 6)}%`,
              height: "100%",
              borderRadius: "4px",
              background: "linear-gradient(90deg, #4F46E5 0%, #6366F1 100%)",
            }} />
          </div>
        </div>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPACT OVERVIEW TAB
═══════════════════════════════════════════════════════════════ */
const OverviewTab = ({ stats, companies = [], onNavigateTab }) => {
  const totalTables = companies.length * 195;
  const activeCount = stats.activeCompanies || 0;
  const expiringCount = stats.expiringSoon || 0;
  const inactiveCount = (stats.expiredCompanies || 0) + (stats.suspendedCompanies || 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* ─── 1. Top 4 Metric Cards ─── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
        gap: "14px",
      }}>
        <MetricCard
          title="Registered Tenants"
          value={stats.totalCompanies || companies.length}
          sub="Isolated MySQL schemas"
          trend="+100%"
          trendPositive={true}
          color="#4F46E5"
          icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path d="M6 12H4a2 2 0 0 0-2 2v8h4" />
              <path d="M18 9h2a2 2 0 0 1 2 2v11h-4" />
            </svg>
          }
        />

        <MetricCard
          title="Active Licenses"
          value={activeCount}
          sub="Paid & operational"
          trend={`${Math.round((activeCount / Math.max(companies.length, 1)) * 100)}%`}
          trendPositive={true}
          color="#10B981"
          icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          }
        />

        <MetricCard
          title="Expiring Within 7d"
          value={expiringCount}
          sub="Requires renewal"
          trend={expiringCount > 0 ? "Action" : "None"}
          trendPositive={expiringCount === 0}
          color="#F59E0B"
          icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />

        <MetricCard
          title="Tables Provisioned"
          value={totalTables.toLocaleString()}
          sub={`195 per client schema`}
          trend="100% Sync"
          trendPositive={true}
          color="#06B6D4"
          icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            </svg>
          }
        />
      </div>

      {/* ─── 2. Row: Growth Area Chart + Status Donut ─── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1.7fr 1fr",
        gap: "14px",
      }} className="sa-grid-two">
        {/* Growth Curve */}
        <div style={{
          background: "#FFFFFF",
          borderRadius: "10px",
          border: "1px solid #E2E8F0",
          padding: "16px 18px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div>
              <div style={{ fontSize: "13.5px", fontWeight: "700", color: "#0F172A" }}>
                Tenant Growth & Revenue Run-Rate
              </div>
              <div style={{ fontSize: "11px", color: "#64748B", marginTop: "1px" }}>
                Monthly onboarding & MRR projection curve
              </div>
            </div>
            <span style={{
              fontSize: "9.5px",
              fontWeight: "700",
              padding: "2px 7px",
              borderRadius: "5px",
              background: "#EEF2FF",
              color: "#4F46E5",
            }}>
              Last 6 Months
            </span>
          </div>

          <RevenueGrowthChart totalCompanies={companies.length} />
        </div>

        {/* Donut Status */}
        <div style={{
          background: "#FFFFFF",
          borderRadius: "10px",
          border: "1px solid #E2E8F0",
          padding: "16px 18px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: "13.5px", fontWeight: "700", color: "#0F172A" }}>
              Subscription Status
            </div>
            <div style={{ fontSize: "11px", color: "#64748B", marginTop: "1px", marginBottom: "12px" }}>
              Active vs Expiring vs Suspended
            </div>
            <TenantStatusDonut
              active={activeCount}
              expired={expiringCount}
              suspended={inactiveCount}
            />
          </div>

          <div style={{
            marginTop: "10px",
            padding: "7px 10px",
            background: "#F8FAFC",
            borderRadius: "6px",
            border: "1px solid #E2E8F0",
            fontSize: "11px",
            color: "#475569",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <span>Expiring Action Needed:</span>
            <strong style={{ color: "#D97706" }}>{expiringCount} companies</strong>
          </div>
        </div>
      </div>

      {/* ─── 3. Row: Feature Adoption + Cluster Status ─── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "14px",
      }} className="sa-grid-two">
        {/* Module Adoption */}
        <div style={{
          background: "#FFFFFF",
          borderRadius: "10px",
          border: "1px solid #E2E8F0",
          padding: "16px 18px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div>
              <div style={{ fontSize: "13.5px", fontWeight: "700", color: "#0F172A" }}>
                Feature & Module Adoption
              </div>
              <div style={{ fontSize: "11px", color: "#64748B", marginTop: "1px" }}>
                Active modules in client sidebars
              </div>
            </div>
            <button
              onClick={() => onNavigateTab("subscriptions")}
              style={{
                fontSize: "11px",
                fontWeight: "700",
                color: "#4F46E5",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              Configure →
            </button>
          </div>

          <ModuleAdoptionChart companies={companies} />
        </div>

        {/* Database Cluster Health */}
        <div style={{
          background: "#FFFFFF",
          borderRadius: "10px",
          border: "1px solid #E2E8F0",
          padding: "16px 18px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <div>
                <div style={{ fontSize: "13.5px", fontWeight: "700", color: "#0F172A" }}>
                  Cluster & Schema Health
                </div>
                <div style={{ fontSize: "11px", color: "#64748B", marginTop: "1px" }}>
                  MySQL Multi-tenant isolation engine
                </div>
              </div>
              <span style={{
                fontSize: "9.5px",
                fontWeight: "700",
                color: "#059669",
                background: "#ECFDF5",
                padding: "2px 6px",
                borderRadius: "8px",
              }}>
                ● Healthy
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 8px", background: "#F8FAFC", borderRadius: "5px", fontSize: "11px" }}>
                <span style={{ color: "#64748B" }}>Master Router DB</span>
                <code style={{ fontWeight: "700", color: "#4F46E5" }}>master_admin</code>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 8px", background: "#F8FAFC", borderRadius: "5px", fontSize: "11px" }}>
                <span style={{ color: "#64748B" }}>Base Schema Template</span>
                <span style={{ fontWeight: "600", color: "#059669" }}>195 tables</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 8px", background: "#F8FAFC", borderRadius: "5px", fontSize: "11px" }}>
                <span style={{ color: "#64748B" }}>Collation / Engine</span>
                <span style={{ fontFamily: "monospace", color: "#334155" }}>utf8mb4_unicode_ci</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 8px", background: "#F8FAFC", borderRadius: "5px", fontSize: "11px" }}>
                <span style={{ color: "#64748B" }}>Connection Host</span>
                <span style={{ fontFamily: "monospace", color: "#334155" }}>localhost:3306</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("databases")}
            style={{
              marginTop: "10px",
              width: "100%",
              padding: "6px",
              background: "#FFFFFF",
              border: "1px solid #CBD5E1",
              borderRadius: "5px",
              fontSize: "11px",
              fontWeight: "700",
              color: "#334155",
              cursor: "pointer",
            }}
          >
            Inspect Databases & Tables →
          </button>
        </div>
      </div>

      {/* ─── 4. Recent Deployments Strip ─── */}
      <div style={{
        background: "#FFFFFF",
        borderRadius: "10px",
        border: "1px solid #E2E8F0",
        padding: "16px 18px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div>
            <div style={{ fontSize: "13.5px", fontWeight: "700", color: "#0F172A" }}>
              Recent Deployments
            </div>
            <div style={{ fontSize: "11px", color: "#64748B", marginTop: "1px" }}>
              Provisioned tenant databases
            </div>
          </div>
          <button
            onClick={() => onNavigateTab("companies")}
            style={{
              padding: "4px 9px",
              background: "#F1F5F9",
              border: "1px solid #E2E8F0",
              borderRadius: "5px",
              fontSize: "10.5px",
              fontWeight: "700",
              color: "#334155",
              cursor: "pointer",
            }}
          >
            All Tenants ({companies.length}) →
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                <th style={{ padding: "7px 10px", textAlign: "left", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", color: "#64748B" }}>Company</th>
                <th style={{ padding: "7px 10px", textAlign: "left", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", color: "#64748B" }}>Database</th>
                <th style={{ padding: "7px 10px", textAlign: "left", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", color: "#64748B" }}>Expiry</th>
                <th style={{ padding: "7px 10px", textAlign: "left", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", color: "#64748B" }}>Modules</th>
                <th style={{ padding: "7px 10px", textAlign: "left", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", color: "#64748B" }}>Status</th>
                <th style={{ padding: "7px 10px", textAlign: "right", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", color: "#64748B" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {companies.slice(0, 5).map((c) => {
                const isExpired = c.expiry_date && new Date(c.expiry_date) < new Date();
                const status = !c.is_active ? "suspended" : isExpired ? "expired" : "active";
                return (
                  <tr key={c.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "8px 10px" }}>
                      <div style={{ fontSize: "12px", fontWeight: "700", color: "#0F172A" }}>{c.name}</div>
                      <div style={{ fontSize: "10px", color: "#64748B" }}>Code: {c.code}</div>
                    </td>
                    <td style={{ padding: "8px 10px" }}>
                      <span style={{
                        fontFamily: "monospace",
                        fontSize: "10.5px",
                        color: "#4F46E5",
                        background: "#EEF2FF",
                        padding: "2px 5px",
                        borderRadius: "4px",
                      }}>
                        {c.db_name}
                      </span>
                    </td>
                    <td style={{ padding: "8px 10px", fontSize: "11px", color: "#475569" }}>
                      {c.expiry_date ? new Date(c.expiry_date).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td style={{ padding: "8px 10px" }}>
                      <div style={{ display: "flex", gap: "3px", flexWrap: "wrap" }}>
                        {(c.features || []).slice(0, 3).map((f) => (
                          <span key={f} style={{
                            fontSize: "9.5px",
                            fontWeight: "600",
                            background: "#F1F5F9",
                            color: "#334155",
                            padding: "1px 5px",
                            borderRadius: "3px",
                            border: "1px solid #E2E8F0",
                          }}>
                            {f}
                          </span>
                        ))}
                        {(c.features || []).length > 3 && (
                          <span style={{ fontSize: "9px", color: "#64748B" }}>
                            +{c.features.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "8px 10px" }}>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "9.5px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        padding: "2px 6px",
                        borderRadius: "8px",
                        background: status === "active" ? "#ECFDF5" : status === "expired" ? "#FFFBEB" : "#FFF1F2",
                        color: status === "active" ? "#059669" : status === "expired" ? "#D97706" : "#E11D48",
                      }}>
                        <span style={{
                          width: "4px",
                          height: "4px",
                          borderRadius: "50%",
                          background: status === "active" ? "#10B981" : status === "expired" ? "#F59E0B" : "#F43F5E",
                        }} />
                        {status}
                      </span>
                    </td>
                    <td style={{ padding: "8px 10px", textAlign: "right" }}>
                      <button
                        onClick={() => onNavigateTab("subscriptions")}
                        style={{
                          padding: "3px 8px",
                          fontSize: "10px",
                          fontWeight: "700",
                          color: "#4F46E5",
                          background: "#FFFFFF",
                          border: "1px solid #CBD5E1",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Modules
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
