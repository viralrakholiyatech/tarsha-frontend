import React, { useState } from "react";

const CompaniesTab = ({
  companies = [],
  loading = false,
  onExtend,
  onToggleStatus,
  onConfigureModules,
  onNewCompany,
}) => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = companies.filter((c) => {
    const isExpired = c.expiry_date && new Date(c.expiry_date) < new Date();
    const status = !c.is_active ? "suspended" : isExpired ? "expired" : "active";
    const matchesFilter = filterStatus === "all" || status === filterStatus;
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.db_name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{
      background: "#FFFFFF",
      borderRadius: "10px",
      border: "1px solid #E2E8F0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
      overflow: "hidden",
    }}>
      {/* ─── Header & Controls ─── */}
      <div style={{
        padding: "14px 18px",
        borderBottom: "1px solid #E2E8F0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        flexWrap: "wrap",
        background: "#FFFFFF",
      }}>
        <div>
          <div style={{ fontSize: "15px", fontWeight: "700", color: "#0F172A" }}>
            Company Directory ({filtered.length})
          </div>
          <div style={{ fontSize: "11px", color: "#64748B", marginTop: "1px" }}>
            Isolated client database schemas and access controls
          </div>
        </div>

        {/* Filter segment + search bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <div style={{
            display: "flex",
            background: "#F1F5F9",
            padding: "2px",
            borderRadius: "6px",
          }}>
            {["all", "active", "expired", "suspended"].map((f) => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                style={{
                  padding: "4px 9px",
                  border: "none",
                  borderRadius: "4px",
                  background: filterStatus === f ? "#0F172A" : "transparent",
                  color: filterStatus === f ? "#FFFFFF" : "#64748B",
                  fontSize: "11px",
                  fontWeight: "700",
                  textTransform: "capitalize",
                  cursor: "pointer",
                  transition: "all 0.12s ease",
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Search company, code, db..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "210px",
                height: "30px",
                padding: "0 10px 0 28px",
                borderRadius: "6px",
                border: "1px solid #CBD5E1",
                fontSize: "11.5px",
                outline: "none",
                color: "#0F172A",
              }}
            />
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94A3B8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ position: "absolute", left: "9px", top: "50%", transform: "translateY(-50%)" }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>
      </div>

      {/* ─── Table ─── */}
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#64748B", fontSize: "12px" }}>Loading companies...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center" }}>
          <div style={{ fontSize: "15px", fontWeight: "700", color: "#0F172A", marginBottom: "4px" }}>
            No companies found
          </div>
          <div style={{ fontSize: "12px", color: "#64748B", marginBottom: "12px" }}>
            Try adjusting your search criteria or provision a new company.
          </div>
          <button
            onClick={onNewCompany}
            style={{
              padding: "6px 14px",
              background: "#0F172A",
              color: "#FFF",
              border: "none",
              borderRadius: "6px",
              fontSize: "11.5px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            + Add Company
          </button>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                <th style={{ padding: "8px 14px", textAlign: "left", fontSize: "10.5px", fontWeight: "700", textTransform: "uppercase", color: "#64748B" }}>Company</th>
                <th style={{ padding: "8px 14px", textAlign: "left", fontSize: "10.5px", fontWeight: "700", textTransform: "uppercase", color: "#64748B" }}>Database Routing</th>
                <th style={{ padding: "8px 14px", textAlign: "left", fontSize: "10.5px", fontWeight: "700", textTransform: "uppercase", color: "#64748B" }}>Plan & Validity</th>
                <th style={{ padding: "8px 14px", textAlign: "left", fontSize: "10.5px", fontWeight: "700", textTransform: "uppercase", color: "#64748B" }}>Modules</th>
                <th style={{ padding: "8px 14px", textAlign: "left", fontSize: "10.5px", fontWeight: "700", textTransform: "uppercase", color: "#64748B" }}>Status</th>
                <th style={{ padding: "8px 14px", textAlign: "right", fontSize: "10.5px", fontWeight: "700", textTransform: "uppercase", color: "#64748B" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const isExpired = c.expiry_date && new Date(c.expiry_date) < new Date();
                const status = !c.is_active ? "suspended" : isExpired ? "expired" : "active";
                return (
                  <tr key={c.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {c.logo ? (
                          <div style={{
                            width: "32px",
                            height: "32px",
                            minWidth: "32px",
                            borderRadius: "7px",
                            background: "#FFFFFF",
                            border: "1px solid #E2E8F0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "2px",
                            overflow: "hidden",
                          }}>
                            <img
                              src={c.logo}
                              alt={c.name}
                              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                            />
                          </div>
                        ) : (
                          <div style={{
                            width: "32px",
                            height: "32px",
                            minWidth: "32px",
                            borderRadius: "7px",
                            background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
                            color: "#FFFFFF",
                            display: "grid",
                            placeItems: "center",
                            fontSize: "12px",
                            fontWeight: "800",
                          }}>
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: "700", color: "#0F172A" }}>{c.name}</div>
                          <div style={{ fontSize: "10.5px", color: "#64748B" }}>
                            Code: <strong>{c.code}</strong> • Host: {c.db_host || "localhost"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{
                        fontFamily: "monospace",
                        fontSize: "11px",
                        color: "#4F46E5",
                        background: "#EEF2FF",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        border: "1px solid #E0E7FF",
                      }}>
                        {c.db_name}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ fontSize: "12px", fontWeight: "600", color: "#334155" }}>
                        {c.subscription_months ? `${c.subscription_months} Mo Plan` : "Standard"}
                      </div>
                      <div style={{ fontSize: "10.5px", color: "#64748B" }}>
                        Exp: {c.expiry_date ? new Date(c.expiry_date).toLocaleDateString("en-IN") : "—"}
                      </div>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", gap: "3px", flexWrap: "wrap", maxWidth: "240px" }}>
                        {(c.features || []).map((f) => (
                          <span key={f} style={{
                            fontSize: "10px",
                            fontWeight: "600",
                            background: "#F1F5F9",
                            color: "#334155",
                            padding: "2px 5px",
                            borderRadius: "3px",
                            border: "1px solid #E2E8F0",
                          }}>
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "10px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        padding: "2px 7px",
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
                    <td style={{ padding: "10px 14px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => onConfigureModules(c)}
                          style={{
                            padding: "4px 8px",
                            fontSize: "10.5px",
                            fontWeight: "700",
                            color: "#4F46E5",
                            background: "#EEF2FF",
                            border: "1px solid #E0E7FF",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Modules
                        </button>
                        <button
                          onClick={() => onExtend(c)}
                          style={{
                            padding: "4px 8px",
                            fontSize: "10.5px",
                            fontWeight: "700",
                            color: "#334155",
                            background: "#FFFFFF",
                            border: "1px solid #CBD5E1",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Extend
                        </button>
                        <button
                          onClick={() => onToggleStatus(c)}
                          style={{
                            padding: "4px 8px",
                            fontSize: "10.5px",
                            fontWeight: "700",
                            color: c.is_active ? "#E11D48" : "#059669",
                            background: c.is_active ? "#FFF1F2" : "#ECFDF5",
                            border: `1px solid ${c.is_active ? "#FECDD3" : "#A7F3D0"}`,
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          {c.is_active ? "Suspend" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CompaniesTab;
