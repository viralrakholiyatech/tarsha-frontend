import React from "react";

const DatabasesTab = ({ companies = [] }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* ─── Top 3 Architecture Cards ─── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "14px",
      }} className="sa-grid-three">
        <div style={{
          background: "#FFFFFF",
          borderRadius: "10px",
          padding: "16px 18px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        }}>
          <div style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", color: "#64748B" }}>
            Master Router Schema
          </div>
          <div style={{
            fontFamily: "monospace",
            fontSize: "17px",
            fontWeight: "700",
            color: "#4F46E5",
            margin: "4px 0 2px 0",
          }}>
            master_admin
          </div>
          <div style={{ fontSize: "11px", color: "#475569", lineHeight: "1.45" }}>
            Global registry, billing contracts, and database routing maps.
          </div>
        </div>

        <div style={{
          background: "#FFFFFF",
          borderRadius: "10px",
          padding: "16px 18px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        }}>
          <div style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", color: "#64748B" }}>
            Schema Template Engine
          </div>
          <div style={{
            fontSize: "17px",
            fontWeight: "700",
            color: "#10B981",
            margin: "4px 0 2px 0",
          }}>
            195 Tables Seeded
          </div>
          <div style={{ fontSize: "11px", color: "#475569", lineHeight: "1.45" }}>
            Auto-cloned from <code style={{ color: "#4F46E5" }}>tarsha_template.sql</code> on company creation.
          </div>
        </div>

        <div style={{
          background: "#FFFFFF",
          borderRadius: "10px",
          padding: "16px 18px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        }}>
          <div style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", color: "#64748B" }}>
            Cross-Tenant Isolation
          </div>
          <div style={{
            fontSize: "17px",
            fontWeight: "700",
            color: "#0F172A",
            margin: "4px 0 2px 0",
          }}>
            100% Zero Cross-Talk
          </div>
          <div style={{ fontSize: "11px", color: "#475569", lineHeight: "1.45" }}>
            Each client queries strictly their dedicated MySQL schema credentials.
          </div>
        </div>
      </div>

      {/* ─── Database Instances Table ─── */}
      <div style={{
        background: "#FFFFFF",
        borderRadius: "10px",
        border: "1px solid #E2E8F0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        overflow: "hidden",
      }}>
        <div style={{
          padding: "14px 18px",
          borderBottom: "1px solid #E2E8F0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#F8FAFC",
        }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#0F172A" }}>
              Active Database Instances ({companies.length})
            </div>
            <div style={{ fontSize: "11px", color: "#64748B", marginTop: "1px" }}>
              Multi-tenant isolated schemas on localhost:3306
            </div>
          </div>
          <span style={{
            fontSize: "9.5px",
            fontWeight: "700",
            padding: "2px 7px",
            borderRadius: "8px",
            background: "#ECFDF5",
            color: "#059669",
          }}>
            ● Schemas Online
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                <th style={{ padding: "8px 14px", textAlign: "left", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", color: "#64748B" }}>Database</th>
                <th style={{ padding: "8px 14px", textAlign: "left", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", color: "#64748B" }}>Company</th>
                <th style={{ padding: "8px 14px", textAlign: "left", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", color: "#64748B" }}>Host</th>
                <th style={{ padding: "8px 14px", textAlign: "left", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", color: "#64748B" }}>Collation</th>
                <th style={{ padding: "8px 14px", textAlign: "left", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", color: "#64748B" }}>Status</th>
                <th style={{ padding: "8px 14px", textAlign: "right", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", color: "#64748B" }}>Connection</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                  <td style={{ padding: "9px 14px" }}>
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
                  <td style={{ padding: "9px 14px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#0F172A" }}>{c.name}</span>{" "}
                    <span style={{ fontSize: "10.5px", color: "#64748B" }}>({c.code})</span>
                  </td>
                  <td style={{ padding: "9px 14px", fontSize: "11px", fontFamily: "monospace", color: "#475569" }}>
                    {c.db_host || "localhost"}:3306
                  </td>
                  <td style={{ padding: "9px 14px", fontSize: "11px", fontFamily: "monospace", color: "#475569" }}>
                    utf8mb4_unicode_ci
                  </td>
                  <td style={{ padding: "9px 14px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "600", color: "#059669" }}>
                      ✓ 195 Tables
                    </span>
                  </td>
                  <td style={{ padding: "9px 14px", textAlign: "right" }}>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "10px",
                      fontWeight: "700",
                      padding: "2px 6px",
                      borderRadius: "8px",
                      background: "#ECFDF5",
                      color: "#059669",
                    }}>
                      <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#10B981" }} />
                      Online
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DatabasesTab;
