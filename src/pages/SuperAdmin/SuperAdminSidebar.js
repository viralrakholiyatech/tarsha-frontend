import React from "react";
import { useNavigate } from "react-router-dom";
import { superAdminApi } from "./superAdminApi";

const Icon = ({ name, size = 16, color = "currentColor" }) => {
  const icons = {
    overview: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
    companies: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path d="M6 12H4a2 2 0 0 0-2 2v8h4" />
        <path d="M18 9h2a2 2 0 0 1 2 2v11h-4" /><path d="M10 6h4M10 10h4M10 14h4M10 18h4" />
      </svg>
    ),
    subscriptions: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    databases: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
    plus: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    logout: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
  };
  return icons[name] || null;
};

const SuperAdminSidebar = ({
  activeTab,
  setActiveTab,
  companiesCount = 0,
  onNewCompany,
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    superAdminApi.logout();
    navigate("/super-admin/login");
  };

  const navItems = [
    { id: "overview", label: "Dashboard", icon: "overview" },
    { id: "companies", label: "Companies & Tenants", icon: "companies", count: companiesCount },
    { id: "subscriptions", label: "Subscriptions & Plans", icon: "subscriptions", tag: "Dynamic" },
    { id: "databases", label: "Databases & Tables", icon: "databases", tag: "195" },
  ];

  return (
    <aside style={{
      width: "240px",
      position: "fixed",
      top: 0,
      bottom: 0,
      left: 0,
      background: "#FFFFFF",
      borderRight: "1px solid #E2E8F0",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      zIndex: 100,
    }}>
      {/* ─── Top Section: Logo + CTA + Nav ─── */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {/* Brand */}
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #F1F5F9" }}>
          <img
            src="/img/tarsha_logo.png"
            alt="Tarsha Tech"
            style={{ height: "30px", width: "auto", display: "block", marginBottom: "8px" }}
          />
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "10px",
            fontWeight: "700",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#64748B",
          }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#10B981" }} />
            Super Admin Console
          </div>
        </div>

      

        {/* Navigation items */}
        <nav style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: "2px" }}>
          <div style={{
            fontSize: "9.5px",
            fontWeight: "700",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#94A3B8",
            padding: "6px 8px 4px",
          }}>
            Menu
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 10px",
                  borderRadius: "7px",
                  cursor: "pointer",
                  background: isActive ? "#F1F5F9" : "transparent",
                  color: isActive ? "#0F172A" : "#64748B",
                  fontWeight: isActive ? "700" : "500",
                  fontSize: "12.5px",
                  transition: "all 0.12s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = "#F8FAFC";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = "transparent";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                  <span style={{ color: isActive ? "#2563EB" : "#94A3B8", display: "grid", placeItems: "center" }}>
                    <Icon name={item.icon} size={15} />
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.count !== undefined && (
                  <span style={{
                    fontSize: "10.5px",
                    fontWeight: "700",
                    padding: "1px 6px",
                    borderRadius: "10px",
                    background: isActive ? "#2563EB" : "#E2E8F0",
                    color: isActive ? "#FFFFFF" : "#475569",
                  }}>
                    {item.count}
                  </span>
                )}

                {item.tag && (
                  <span style={{
                    fontSize: "9px",
                    fontWeight: "700",
                    padding: "1px 5px",
                    borderRadius: "4px",
                    background: "#EFF6FF",
                    color: "#2563EB",
                  }}>
                    {item.tag}
                  </span>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* ─── Bottom Section: Fixed Profile & Sign Out (Never Scrolls) ─── */}
      <div style={{
        padding: "12px 14px",
        borderTop: "1px solid #E2E8F0",
        background: "#F8FAFC",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
          {/* User info */}
          <div style={{ display: "flex", alignItems: "center", gap: "9px", minWidth: 0 }}>
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "#0F172A",
              color: "#FFFFFF",
              display: "grid",
              placeItems: "center",
              fontSize: "11px",
              fontWeight: "700",
              flexShrink: 0,
            }}>
              SA
            </div>
            <div style={{ minWidth: 0, overflow: "hidden" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Platform Admin
              </div>
              <div style={{ fontSize: "10px", color: "#64748B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                master_admin
              </div>
            </div>
          </div>

          {/* Clean Logout Icon Button */}
          <button
            onClick={handleLogout}
            title="Sign Out"
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "6px",
              border: "1px solid #E2E8F0",
              background: "#FFFFFF",
              color: "#64748B",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              flexShrink: 0,
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#FEF2F2";
              e.currentTarget.style.color = "#EF4444";
              e.currentTarget.style.borderColor = "#FECDD3";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#FFFFFF";
              e.currentTarget.style.color = "#64748B";
              e.currentTarget.style.borderColor = "#E2E8F0";
            }}
          >
            <Icon name="logout" size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default SuperAdminSidebar;
