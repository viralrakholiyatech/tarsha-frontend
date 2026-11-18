import React from "react";
import { useNavigate } from "react-router-dom";
import { superAdminApi } from "./superAdminApi";

const SuperAdminHeader = ({
  activeTab,
  onNewCompany,
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    superAdminApi.logout();
    navigate("/super-admin/login");
  };

  const titles = {
    overview: {
      title: "Dashboard Overview",
      subtitle: "Multi-tenant health metrics, revenue growth & system telemetry",
    },
    companies: {
      title: "Companies & Tenants",
      subtitle: "Directory of provisioned client organizations & database routing",
    },
    subscriptions: {
      title: "Company Subscriptions & Modules",
      subtitle: "Manage client plans, module licenses & preview their team's sidebar",
    },
    databases: {
      title: "Multi-Tenant Database Infrastructure",
      subtitle: "Dedicated MySQL schemas, 195 template tables & connection cluster",
    },
  };

  const current = titles[activeTab] || titles.overview;

  return (
    <header style={{
      height: "52px",
      minHeight: "52px",
      padding: "0 24px",
      background: "#FFFFFF",
      borderBottom: "1px solid #E2E8F0",
      position: "sticky",
      top: 0,
      zIndex: 50,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "16px",
    }}>
      {/* Title & Subtitle */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
        <h1 style={{
          fontSize: "16px",
          fontWeight: "800",
          color: "#0F172A",
          letterSpacing: "-0.01em",
          margin: 0,
        }}>
          {current.title}
        </h1>
        <span style={{
          fontSize: "11px",
          color: "#64748B",
          display: "none",
        }} className="sa-header-sub">
          • {current.subtitle}
        </span>
      </div>

      {/* Right Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* System Uptime Badge */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "3px 9px",
          borderRadius: "12px",
          background: "#ECFDF5",
          border: "1px solid #A7F3D0",
          fontSize: "11px",
          fontWeight: "700",
          color: "#059669",
        }}>
          <span style={{
            width: "5px",
            height: "5px",
            borderRadius: "50%",
            background: "#10B981",
          }} />
          Cluster Online
        </div>

        {/* Primary CTA */}
        <button
          onClick={onNewCompany}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "5px 12px",
            background: "#0F172A",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "6px",
            fontSize: "11.5px",
            fontWeight: "700",
            cursor: "pointer",
            transition: "all 0.12s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#1E293B")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#0F172A")}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Company
        </button>

        {/* Header Instant Sign Out Button */}
        <button
          onClick={handleLogout}
          title="Sign Out of Super Admin"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "5px 10px",
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: "6px",
            color: "#64748B",
            fontSize: "11px",
            fontWeight: "700",
            cursor: "pointer",
            transition: "all 0.12s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#FEF2F2";
            e.currentTarget.style.color = "#E11D48";
            e.currentTarget.style.borderColor = "#FECDD3";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#F8FAFC";
            e.currentTarget.style.color = "#64748B";
            e.currentTarget.style.borderColor = "#E2E8F0";
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign Out
        </button>
      </div>
    </header>
  );
};

export default SuperAdminHeader;
