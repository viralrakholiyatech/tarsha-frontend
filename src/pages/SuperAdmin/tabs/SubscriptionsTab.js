import React, { useState, useEffect } from "react";
import { superAdminApi } from "../superAdminApi";
import Swal from "sweetalert2";

// ─── Module Definitions with Categories, Descriptions & Icons ───
const ALL_MODULES = [
  { key: "Meeting",        label: "Meetings",          icon: "🗓️", category: "Collaboration", desc: "Schedule, minutes & video meets" },
  { key: "Team",           label: "Team / HR",         icon: "👥", category: "Human Capital",  desc: "Directory, attendance & payroll" },
  { key: "Work",           label: "Work & Tasks",      icon: "📋", category: "Operations",     desc: "Project tracking & deliverables" },
  { key: "Interior",       label: "Interior Design",   icon: "🎨", category: "Design Suite",   desc: "3D layouts, moodboards & finishes" },
  { key: "Architecture",   label: "Architecture",      icon: "📐", category: "Design Suite",   desc: "Blueprints, CAD specs & elevations" },
  { key: "Approval",       label: "Approvals & Signs", icon: "✍️", category: "Workflow",       desc: "Multi-level signoff workflows" },
  // { key: "Social Media",   label: "Social Media",      icon: "📢", category: "Marketing",      desc: "Brand posts, campaigns & schedule" },
  // { key: "Finance",        label: "Finance & Bills",   icon: "💳", category: "Accounting",     desc: "Invoicing, expenses & tax ledger" },
  { key: "HR",             label: "HR Module",         icon: "🏢", category: "Human Capital",  desc: "Leaves, recruitment & appraisals" },
  { key: "Site Inspection",label: "Site Inspection",   icon: "🔍", category: "Operations",     desc: "Field audits, punch lists & GPS" },
  { key: "Location",       label: "Location Tracking", icon: "📍", category: "Operations",     desc: "Real-time site & field telemetry" },
  { key: "Leads",          label: "Leads / CRM",       icon: "📈", category: "Sales",          desc: "Pipelines, client inquiry & deals" },
];

const PLAN_PRESETS = [
  {
    id: "starter",
    name: "Starter Tier",
    badge: "Core Operations",
    modules: ["Meeting", "Team", "Work", "Site Inspection"],
    desc: "Essential team, site & task execution",
    color: "#2563EB",
  },
  {
    id: "growth",
    name: "Professional Tier",
    badge: "Architect & Finance",
    modules: ["Meeting", "Team", "Work", "Site Inspection", "Interior", "Architecture", "Approval"],
    desc: "Complete architectural & design suite",
    color: "#7C3AED",
  },
  {
    id: "enterprise",
    name: "Enterprise Suite",
    badge: "All 12 Modules",
    modules: ALL_MODULES.map((m) => m.key),
    desc: "Unlimited multi-module ERP with all capabilities",
    color: "#059669",
  },
];

const CATEGORY_COLORS = {
  "Collaboration": { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  "Human Capital":  { bg: "#FAF5FF", text: "#7E22CE", border: "#E9D5FF" },
  "Operations":     { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  "Design Suite":   { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  "Workflow":       { bg: "#EEF2FF", text: "#4338CA", border: "#C7D2FE" },
  "Marketing":      { bg: "#FDF2F8", text: "#BE185D", border: "#FBCFE8" },
  "Accounting":     { bg: "#ECFDF5", text: "#047857", border: "#A7F3D0" },
  "Sales":          { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" },
};

const SubscriptionsTab = ({
  companies = [],
  selectedCompanyId,
  onSelectCompany,
  onRefresh,
  onExtend,
}) => {
  // inspectingCompanyId controls whether we view the Master List or the Detail Inspector
  const [inspectingCompanyId, setInspectingCompanyId] = useState(selectedCompanyId || null);
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");

  // Keep in sync with parent if parent sets it
  useEffect(() => {
    setInspectingCompanyId(selectedCompanyId || null);
  }, [selectedCompanyId]);

  const activeCompany = companies.find((c) => c.id === inspectingCompanyId) || null;
  const [editFeatures, setEditFeatures] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Sync features when active company changes
  useEffect(() => {
    if (activeCompany) {
      setEditFeatures(activeCompany.features || []);
    }
  }, [activeCompany]);

  const toggleModule = (modKey) => {
    setEditFeatures((prev) =>
      prev.includes(modKey) ? prev.filter((k) => k !== modKey) : [...prev, modKey]
    );
  };

  const applyPreset = (modules) => {
    setEditFeatures(modules);
  };

  const handleBackToList = () => {
    setInspectingCompanyId(null);
    if (onSelectCompany) onSelectCompany(null);
  };

  const handleSave = async () => {
    if (!activeCompany) return;
    setIsSaving(true);
    try {
      await superAdminApi.updateSubscription(activeCompany.id, {
        features: editFeatures,
      });
      Swal.fire({
        title: "Subscription Updated!",
        text: `Modules for ${activeCompany.name} saved successfully. Client navigation updated immediately.`,
        icon: "success",
        confirmButtonColor: "#0F172A",
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      Swal.fire({
        title: "Update Failed",
        text: err.message || "Could not save modules",
        icon: "error",
        confirmButtonColor: "#0F172A",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to determine active plan tier preset
  const getActivePreset = () => {
    for (const p of PLAN_PRESETS) {
      if (
        p.modules.length === editFeatures.length &&
        p.modules.every((m) => editFeatures.includes(m))
      ) {
        return p.id;
      }
    }
    return "custom";
  };

  // Filtered companies for the master table
  const filteredCompanies = companies.filter((c) => {
    const query = search.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(query) ||
      c.code.toLowerCase().includes(query) ||
      c.db_name.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    if (filterPlan === "active") return c.is_active;
    if (filterPlan === "enterprise") return (c.features || []).length === ALL_MODULES.length;
    if (filterPlan === "expiring") {
      if (!c.expiry_date) return false;
      const diffDays = Math.ceil((new Date(c.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    }
    return true;
  });

  // Calculate summary metrics
  const totalTenants = companies.length;
  const activeTenants = companies.filter((c) => c.is_active).length;
  const totalModuleLicenses = companies.reduce((acc, c) => acc + (c.features || []).length, 0);
  const avgModules = totalTenants > 0 ? (totalModuleLicenses / totalTenants).toFixed(1) : "0";

  /* ═══════════════════════════════════════════════════════════════════════════
     VIEW 2: DEDICATED INSPECTOR & REAL-TIME LIVE TENANT SIDEBAR PREVIEW
     (Rendered when a company is selected via "Configure & Preview" or "View")
  ════════════════════════════════════════════════════════════════════════════ */
  if (activeCompany) {
    const isCustom = getActivePreset() === "custom";

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {/* ─── Breadcrumb & Save Action Bar ─── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          background: "#FFFFFF",
          borderRadius: "10px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
          gap: "12px",
          flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <button
              onClick={handleBackToList}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding: "8px 14px",
                background: "#F8FAFC",
                border: "1px solid #CBD5E1",
                borderRadius: "7px",
                color: "#334155",
                fontSize: "12.5px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#EFF6FF";
                e.currentTarget.style.color = "#2563EB";
                e.currentTarget.style.borderColor = "#93C5FD";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#F8FAFC";
                e.currentTarget.style.color = "#334155";
                e.currentTarget.style.borderColor = "#CBD5E1";
              }}
            >
              <span>←</span>
              <span>Back to Subscriptions List</span>
            </button>

            <div style={{ height: "24px", width: "1px", background: "#E2E8F0" }} />

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "16px", fontWeight: "800", color: "#0F172A" }}>
                  Configuring: <span style={{ color: "#2563EB" }}>{activeCompany.name}</span>
                </span>
                <span style={{
                  fontSize: "10px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  padding: "2px 7px",
                  borderRadius: "10px",
                  background: activeCompany.is_active ? "#ECFDF5" : "#FFF1F2",
                  color: activeCompany.is_active ? "#059669" : "#E11D48",
                  border: activeCompany.is_active ? "1px solid #A7F3D0" : "1px solid #FECDD3",
                }}>
                  {activeCompany.is_active ? "Active Tenant" : "Suspended"}
                </span>
              </div>
              <div style={{ fontSize: "11.5px", color: "#64748B", marginTop: "2px" }}>
                Tenant Code: <strong>{activeCompany.code}</strong> • Database: <code style={{ color: "#2563EB", fontFamily: "monospace", fontWeight: "600" }}>{activeCompany.db_name}</code>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() => onExtend && onExtend(activeCompany)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "8px 14px",
                background: "#FFFFFF",
                border: "1px solid #CBD5E1",
                borderRadius: "7px",
                color: "#334155",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#F8FAFC";
                e.currentTarget.style.borderColor = "#94A3B8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#FFFFFF";
                e.currentTarget.style.borderColor = "#CBD5E1";
              }}
            >
              <span>+ Extend Plan</span>
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding: "9px 20px",
                background: isSaving ? "#64748B" : "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "7px",
                fontSize: "12.5px",
                fontWeight: "700",
                cursor: isSaving ? "not-allowed" : "pointer",
                boxShadow: "0 2px 8px rgba(15,23,42,0.18)",
                transition: "all 0.15s ease",
              }}
            >
              <span>{isSaving ? "Saving Changes..." : "✓ Save Modules"}</span>
            </button>
          </div>
        </div>

        {/* ─── Stacked Layout: 100% Width Modules on Top, Live Client Preview Down Below ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
          {/* ════════════ TOP SECTION: PLAN PRESETS & MODULE TOGGLES (100% WIDTH) ════════════ */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
            {/* Card 1: 1-Click Plan Tier Presets */}
            <div style={{
              background: "#FFFFFF",
              borderRadius: "10px",
              border: "1px solid #E2E8F0",
              padding: "18px 22px",
              boxShadow: "0 1px 3px rgba(15,23,42,0.03)",
              width: "100%",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "#475569", letterSpacing: "0.05em" }}>
                    PLAN TIER PRESETS
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>
                    Select a standardized tier preset to apply module bundles in one click, or customize individual modules below.
                  </div>
                </div>
                {isCustom && (
                  <span style={{
                    fontSize: "10.5px",
                    fontWeight: "700",
                    padding: "3px 8px",
                    borderRadius: "5px",
                    background: "#EEF2FF",
                    color: "#4F46E5",
                    border: "1px solid #C7D2FE",
                  }}>
                    Custom Module Bundle Active
                  </span>
                )}
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "14px",
              }}>
                {PLAN_PRESETS.map((p) => {
                  const isCurrent = getActivePreset() === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => applyPreset(p.modules)}
                      style={{
                        padding: "14px 16px",
                        borderRadius: "8px",
                        border: isCurrent ? `2px solid ${p.color}` : "1px solid #E2E8F0",
                        background: isCurrent ? "#F8FAFC" : "#FFFFFF",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                      onMouseEnter={(e) => {
                        if (!isCurrent) {
                          e.currentTarget.style.borderColor = p.color;
                          e.currentTarget.style.background = "#F8FAFC";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isCurrent) {
                          e.currentTarget.style.borderColor = "#E2E8F0";
                          e.currentTarget.style.background = "#FFFFFF";
                        }
                      }}
                    >
                      {isCurrent && (
                        <div style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          background: p.color,
                          color: "#FFFFFF",
                          display: "grid",
                          placeItems: "center",
                          fontSize: "10px",
                          fontWeight: "800",
                        }}>
                          ✓
                        </div>
                      )}

                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "13.5px", fontWeight: "800", color: "#0F172A" }}>
                            {p.name}
                          </span>
                          <span style={{
                            fontSize: "9.5px",
                            fontWeight: "700",
                            padding: "1px 5px",
                            borderRadius: "4px",
                            background: "#F1F5F9",
                            color: "#475569",
                          }}>
                            {p.badge}
                          </span>
                        </div>
                        <div style={{ fontSize: "11px", color: "#64748B", marginTop: "4px", lineHeight: "1.4" }}>
                          {p.desc}
                        </div>
                      </div>

                      <div style={{
                        marginTop: "12px",
                        paddingTop: "8px",
                        borderTop: "1px dashed #E2E8F0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}>
                        <span style={{ fontSize: "11.5px", fontWeight: "800", color: p.color }}>
                          {p.modules.length} Modules Included
                        </span>
                        <span style={{ fontSize: "11px", color: "#94A3B8", fontWeight: "600" }}>
                          Apply Preset →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card 2: Interactive Module Checklist (100% Width, Responsive Grid) */}
            <div style={{
              background: "#FFFFFF",
              borderRadius: "10px",
              border: "1px solid #E2E8F0",
              padding: "18px 22px",
              boxShadow: "0 1px 3px rgba(15,23,42,0.03)",
              width: "100%",
            }}>
              {/* Header with counter and quick buttons */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
                flexWrap: "wrap",
                gap: "12px",
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "13.5px", fontWeight: "800", color: "#0F172A", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      MODULES ({editFeatures.length} OF {ALL_MODULES.length} SELECTED)
                    </span>
                    <span style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "2px 7px",
                      borderRadius: "10px",
                      background: editFeatures.length === ALL_MODULES.length ? "#ECFDF5" : "#EFF6FF",
                      color: editFeatures.length === ALL_MODULES.length ? "#059669" : "#2563EB",
                    }}>
                      {Math.round((editFeatures.length / ALL_MODULES.length) * 100)}% Coverage
                    </span>
                  </div>
                  <div style={{
                    width: "240px",
                    height: "6px",
                    background: "#E2E8F0",
                    borderRadius: "3px",
                    overflow: "hidden",
                    marginTop: "8px",
                  }}>
                    <div style={{
                      height: "100%",
                      width: `${(editFeatures.length / ALL_MODULES.length) * 100}%`,
                      background: "linear-gradient(90deg, #2563EB, #4F46E5)",
                      borderRadius: "3px",
                      transition: "width 0.2s ease",
                    }} />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => setEditFeatures(ALL_MODULES.map((m) => m.key))}
                    style={{
                      padding: "6px 14px",
                      fontSize: "11.5px",
                      fontWeight: "700",
                      background: "#FFFFFF",
                      border: "1px solid #CBD5E1",
                      borderRadius: "6px",
                      cursor: "pointer",
                      color: "#334155",
                      transition: "all 0.12s ease",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#F1F5F9"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#FFFFFF"; }}
                  >
                    Select All Modules
                  </button>
                  <button
                    onClick={() => setEditFeatures([])}
                    style={{
                      padding: "6px 14px",
                      fontSize: "11.5px",
                      fontWeight: "700",
                      background: "#FFFFFF",
                      border: "1px solid #CBD5E1",
                      borderRadius: "6px",
                      cursor: "pointer",
                      color: "#64748B",
                      transition: "all 0.12s ease",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#F1F5F9"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#FFFFFF"; }}
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Module Cards Grid (100% width, 3 to 4 items per row) */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "12px",
                width: "100%",
              }}>
                {ALL_MODULES.map((m) => {
                  const isChecked = editFeatures.includes(m.key);
                  const catStyle = CATEGORY_COLORS[m.category] || { bg: "#F1F5F9", text: "#475569", border: "#E2E8F0" };

                  return (
                    <div
                      key={m.key}
                      onClick={() => toggleModule(m.key)}
                      style={{
                        padding: "12px 14px",
                        borderRadius: "8px",
                        border: isChecked ? "1.5px solid #2563EB" : "1px solid #E2E8F0",
                        background: isChecked ? "#F0F7FF" : "#FFFFFF",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: "12px",
                        transition: "all 0.12s ease",
                        boxShadow: isChecked ? "0 2px 6px rgba(37,99,235,0.08)" : "none",
                      }}
                      onMouseEnter={(e) => {
                        if (!isChecked) {
                          e.currentTarget.style.borderColor = "#CBD5E1";
                          e.currentTarget.style.background = "#F8FAFC";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isChecked) {
                          e.currentTarget.style.borderColor = "#E2E8F0";
                          e.currentTarget.style.background = "#FFFFFF";
                        }
                      }}
                    >
                      <div style={{ display: "flex", gap: "10px" }}>
                        <span style={{ fontSize: "20px", marginTop: "1px" }}>{m.icon}</span>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{
                              fontSize: "9.5px",
                              fontWeight: "700",
                              textTransform: "uppercase",
                              padding: "1px 6px",
                              borderRadius: "4px",
                              background: catStyle.bg,
                              color: catStyle.text,
                              border: `1px solid ${catStyle.border}`,
                              letterSpacing: "0.03em",
                            }}>
                              {m.category}
                            </span>
                          </div>
                          <div style={{
                            fontSize: "13px",
                            fontWeight: "700",
                            color: isChecked ? "#1E3A8A" : "#0F172A",
                            marginTop: "3px",
                          }}>
                            {m.label}
                          </div>
                          <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px", lineHeight: "1.3" }}>
                            {m.desc}
                          </div>
                        </div>
                      </div>

                      {/* Custom Checkbox Pill */}
                      <div style={{
                        width: "20px",
                        height: "20px",
                        minWidth: "20px",
                        borderRadius: "5px",
                        border: isChecked ? "none" : "1.5px solid #CBD5E1",
                        background: isChecked ? "#2563EB" : "#FFFFFF",
                        color: "#FFFFFF",
                        display: "grid",
                        placeItems: "center",
                        fontSize: "12px",
                        fontWeight: "800",
                        transition: "all 0.12s ease",
                        marginTop: "2px",
                      }}>
                        {isChecked && "✓"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ════════════ DOWN SECTION: LIVE CLIENT PORTAL & SIDEBAR PREVIEW (100% WIDTH) ════════════ */}
          <div style={{
            background: "#FFFFFF",
            borderRadius: "10px",
            border: "1px solid #E2E8F0",
            overflow: "hidden",
            boxShadow: "0 2px 10px rgba(15,23,42,0.04)",
            width: "100%",
          }}>
            {/* macOS Browser Window Chrome Bar */}
            <div style={{
              background: "#0F172A",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #1E293B",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#EF4444", display: "inline-block" }} />
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#F59E0B", display: "inline-block" }} />
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10B981", display: "inline-block" }} />
              </div>

              {/* Mock Address Bar */}
              <div style={{
                background: "#1E293B",
                borderRadius: "6px",
                padding: "4px 16px",
                fontSize: "11px",
                color: "#94A3B8",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: "monospace",
              }}>
                <span style={{ color: "#10B981" }}>🔒</span>
                <span>https://app.tarsha.com/{activeCompany.code}/portal</span>
              </div>

              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "10px",
                fontWeight: "700",
                textTransform: "uppercase",
                color: "#10B981",
              }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981" }} />
                LIVE PREVIEW (REAL-TIME)
              </div>
            </div>

            {/* Preview Window Canvas (Sidebar on Left, Rich Portal Dashboard on Right) */}
            <div style={{
              display: "flex",
              background: "#F8FAFC",
              minHeight: "440px",
              width: "100%",
            }}>
              {/* ─── Client Dynamic Sidebar Preview ─── */}
              <div style={{
                width: "230px",
                minWidth: "230px",
                background: "#FFFFFF",
                borderRight: "1px solid #E2E8F0",
                padding: "16px 12px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}>
                {/* Brand Header inside client preview */}
                <div style={{
                  padding: "0 6px 12px",
                  borderBottom: "1px solid #F1F5F9",
                  marginBottom: "8px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <img
                      src={activeCompany.logo || "/img/tarsha_logo.png"}
                      alt={activeCompany.name}
                      style={{ maxHeight: "22px", maxWidth: "80px", objectFit: "contain" }}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/img/tarsha_logo.png";
                      }}
                    />
                    <span style={{ fontSize: "12px", fontWeight: "800", color: "#0F172A", letterSpacing: "0.03em" }}>
                      {activeCompany.name.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: "10px", color: "#64748B", marginTop: "3px" }}>
                    Tenant Staff Portal Navigation
                  </div>
                </div>

                <div style={{ fontSize: "9px", fontWeight: "800", textTransform: "uppercase", color: "#94A3B8", padding: "4px 8px", letterSpacing: "0.05em" }}>
                  CORE NAVIGATION
                </div>

                {/* Default Core Item: Dashboard */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "7px 10px",
                  background: "#EFF6FF",
                  borderRadius: "6px",
                  fontSize: "11.5px",
                  fontWeight: "700",
                  color: "#1D4ED8",
                  borderLeft: "3px solid #2563EB",
                }}>
                  <span>📊</span>
                  <span>Dashboard</span>
                </div>

                <div style={{ fontSize: "9px", fontWeight: "800", textTransform: "uppercase", color: "#94A3B8", padding: "8px 8px 4px", letterSpacing: "0.05em" }}>
                  ACTIVE MODULES ({editFeatures.length})
                </div>

                {/* Dynamic Modules List (Renders in real time based on editFeatures) */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", maxHeight: "320px", overflowY: "auto" }}>
                  {ALL_MODULES.map((mod) => {
                    const isSubscribed = editFeatures.includes(mod.key);
                    if (!isSubscribed) return null;

                    return (
                      <div
                        key={mod.key}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "6px 8px",
                          borderRadius: "5px",
                          fontSize: "11.5px",
                          fontWeight: "600",
                          color: "#334155",
                          background: "#FFFFFF",
                          border: "1px solid #F1F5F9",
                          transition: "all 0.12s ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                          <span style={{ fontSize: "13px" }}>{mod.icon}</span>
                          <span>{mod.label}</span>
                        </div>
                        <span style={{
                          width: "5px",
                          height: "5px",
                          borderRadius: "50%",
                          background: "#10B981",
                        }} />
                      </div>
                    );
                  })}
                </div>

                {editFeatures.length === 0 && (
                  <div style={{
                    fontSize: "11px",
                    color: "#EF4444",
                    padding: "14px 10px",
                    fontStyle: "italic",
                    background: "#FEF2F2",
                    borderRadius: "6px",
                    border: "1px dashed #FECDD3",
                    marginTop: "8px",
                  }}>
                    No optional modules active. Only core Dashboard will appear for staff.
                  </div>
                )}
              </div>

              {/* ─── Client Workspace Mock Canvas (Wide 100% Experience) ─── */}
              <div style={{
                flex: 1,
                padding: "24px 28px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}>
                <div>
                  {/* Top Canvas Bar */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: "14px",
                    borderBottom: "1px solid #E2E8F0",
                  }}>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: "800", color: "#0F172A" }}>
                        Staff Portal Dashboard Preview
                      </div>
                      <div style={{ fontSize: "11.5px", color: "#64748B", marginTop: "2px" }}>
                        Simulating authorized workspace for <strong>{activeCompany.name}</strong> • Connected schema: <code style={{ color: "#2563EB" }}>{activeCompany.db_name}</code>
                      </div>
                    </div>
                    <span style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      background: "#FFFFFF",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      border: "1px solid #E2E8F0",
                      color: "#2563EB",
                    }}>
                      {editFeatures.length} Licensed Features
                    </span>
                  </div>

                  {/* Visual module preview tiles grid across the full width */}
                  <div style={{
                    marginTop: "18px",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
                    gap: "12px",
                  }}>
                    {editFeatures.map((fKey) => {
                      const mod = ALL_MODULES.find((m) => m.key === fKey);
                      if (!mod) return null;
                      return (
                        <div key={fKey} style={{
                          padding: "12px 14px",
                          background: "#FFFFFF",
                          borderRadius: "8px",
                          border: "1px solid #E2E8F0",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "18px" }}>{mod.icon}</span>
                            <div>
                              <div style={{ fontSize: "12px", fontWeight: "700", color: "#0F172A" }}>{mod.label}</div>
                              <div style={{ fontSize: "10px", color: "#64748B" }}>{mod.category}</div>
                            </div>
                          </div>
                          <div style={{ fontSize: "10.5px", color: "#64748B", marginTop: "6px", lineHeight: "1.3" }}>
                            {mod.desc}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {editFeatures.length === 0 && (
                    <div style={{
                      padding: "36px 20px",
                      textAlign: "center",
                      color: "#64748B",
                      background: "#FFFFFF",
                      borderRadius: "8px",
                      border: "1px dashed #CBD5E1",
                      marginTop: "18px",
                    }}>
                      <div style={{ fontSize: "28px", marginBottom: "8px" }}>📦</div>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: "#0F172A" }}>No Active Modules Selected</div>
                      <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
                        Click on modules or select a plan preset above to activate workspace features for this client.
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer sync info bar */}
                <div style={{
                  marginTop: "20px",
                  padding: "10px 16px",
                  background: "#FFFFFF",
                  borderRadius: "8px",
                  border: "1px solid #E2E8F0",
                  fontSize: "11px",
                  color: "#64748B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: "#10B981", fontSize: "13px" }}>⚡</span>
                    <span>Ticking or unticking modules above reflects here immediately.</span>
                  </div>
                  <span style={{ fontWeight: "700", color: "#0F172A" }}>
                    Click "✓ Save Modules" above to commit to MySQL
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     VIEW 1: SUBSCRIPTION DIRECTORY & ALL COMPANIES LIST (DEFAULT MASTER VIEW)
     (Rendered by default so user always sees the list first!)
  ════════════════════════════════════════════════════════════════════════════ */
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      {/* ─── Top Executive Summary KPI Cards ─── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "14px",
      }}>
        {/* KPI 1 */}
        <div style={{
          background: "#FFFFFF",
          borderRadius: "10px",
          border: "1px solid #E2E8F0",
          padding: "14px 16px",
          boxShadow: "0 1px 3px rgba(15,23,42,0.03)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#64748B" }}>
              Total Subscriptions
            </span>
            <span style={{ fontSize: "16px" }}>🏢</span>
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#0F172A", marginTop: "4px" }}>
            {totalTenants}
          </div>
          <div style={{ fontSize: "11px", color: "#10B981", fontWeight: "600", marginTop: "2px" }}>
            {activeTenants} Active Organizations
          </div>
        </div>

        {/* KPI 2 */}
        <div style={{
          background: "#FFFFFF",
          borderRadius: "10px",
          border: "1px solid #E2E8F0",
          padding: "14px 16px",
          boxShadow: "0 1px 3px rgba(15,23,42,0.03)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#64748B" }}>
              Module Licenses Active
            </span>
            <span style={{ fontSize: "16px" }}>🧩</span>
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#2563EB", marginTop: "4px" }}>
            {totalModuleLicenses}
          </div>
          <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
            Avg {avgModules} per client tenant
          </div>
        </div>

        {/* KPI 3 */}
        <div style={{
          background: "#FFFFFF",
          borderRadius: "10px",
          border: "1px solid #E2E8F0",
          padding: "14px 16px",
          boxShadow: "0 1px 3px rgba(15,23,42,0.03)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#64748B" }}>
              Available Modules
            </span>
            <span style={{ fontSize: "16px" }}>⚡</span>
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#7C3AED", marginTop: "4px" }}>
            12
          </div>
          <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
            ERP, HR, Finance & CAD
          </div>
        </div>

        {/* KPI 4 */}
        <div style={{
          background: "#FFFFFF",
          borderRadius: "10px",
          border: "1px solid #E2E8F0",
          padding: "14px 16px",
          boxShadow: "0 1px 3px rgba(15,23,42,0.03)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#64748B" }}>
              Routing Status
            </span>
            <span style={{ fontSize: "16px" }}>🛡️</span>
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#10B981", marginTop: "4px" }}>
            100%
          </div>
          <div style={{ fontSize: "11px", color: "#10B981", fontWeight: "600", marginTop: "2px" }}>
            Isolated MySQL Databases
          </div>
        </div>
      </div>

      {/* ─── Directory Header, Search & Filter Bar ─── */}
      <div style={{
        padding: "14px 18px",
        background: "#FFFFFF",
        borderRadius: "10px",
        border: "1px solid #E2E8F0",
        boxShadow: "0 1px 3px rgba(15,23,42,0.03)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        flexWrap: "wrap",
      }}>
        <div>
          <div style={{ fontSize: "15px", fontWeight: "800", color: "#0F172A" }}>
            Company Subscriptions & Module Entitlements
          </div>
          <div style={{ fontSize: "11px", color: "#64748B", marginTop: "1px" }}>
            Select any tenant below to configure their active modules and preview their live sidebar
          </div>
        </div>

        {/* Filter pills & search input */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Quick filter pills */}
          <div style={{
            display: "flex",
            background: "#F1F5F9",
            padding: "2px",
            borderRadius: "6px",
          }}>
            {[
              { id: "all", label: "All Tenants" },
              { id: "active", label: "Active" },
              { id: "enterprise", label: "Enterprise (12)" },
              { id: "expiring", label: "Expiring Soon" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterPlan(f.id)}
                style={{
                  padding: "4px 9px",
                  fontSize: "11px",
                  fontWeight: filterPlan === f.id ? "700" : "500",
                  background: filterPlan === f.id ? "#FFFFFF" : "transparent",
                  color: filterPlan === f.id ? "#0F172A" : "#64748B",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  boxShadow: filterPlan === f.id ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                  transition: "all 0.12s ease",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Search tenant or database..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "220px",
                height: "32px",
                padding: "0 10px 0 28px",
                borderRadius: "6px",
                border: "1px solid #CBD5E1",
                fontSize: "12px",
                outline: "none",
                color: "#0F172A",
                background: "#FFFFFF",
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
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>
      </div>

      {/* ─── High-End Subscriptions Master Table ─── */}
      <div style={{
        background: "#FFFFFF",
        borderRadius: "10px",
        border: "1px solid #E2E8F0",
        boxShadow: "0 1px 3px rgba(15,23,42,0.03)",
        overflow: "hidden",
      }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                <th style={{ padding: "11px 16px", textAlign: "left", fontSize: "10.5px", fontWeight: "700", textTransform: "uppercase", color: "#64748B" }}>
                  Tenant / Organization
                </th>
                <th style={{ padding: "11px 16px", textAlign: "left", fontSize: "10.5px", fontWeight: "700", textTransform: "uppercase", color: "#64748B" }}>
                  Database Instance
                </th>
                <th style={{ padding: "11px 16px", textAlign: "left", fontSize: "10.5px", fontWeight: "700", textTransform: "uppercase", color: "#64748B" }}>
                  Plan & Module Adoption
                </th>
                <th style={{ padding: "11px 16px", textAlign: "left", fontSize: "10.5px", fontWeight: "700", textTransform: "uppercase", color: "#64748B" }}>
                  Validity & Expiry
                </th>
                <th style={{ padding: "11px 16px", textAlign: "left", fontSize: "10.5px", fontWeight: "700", textTransform: "uppercase", color: "#64748B" }}>
                  Status
                </th>
                <th style={{ padding: "11px 16px", textAlign: "right", fontSize: "10.5px", fontWeight: "700", textTransform: "uppercase", color: "#64748B" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((c) => {
                const isExpired = c.expiry_date && new Date(c.expiry_date) < new Date();
                const status = !c.is_active ? "suspended" : isExpired ? "expired" : "active";
                const modCount = (c.features || []).length;
                const percent = Math.round((modCount / ALL_MODULES.length) * 100);

                // Tier badge
                const tierName =
                  modCount === 12
                    ? "Enterprise Suite"
                    : modCount >= 8
                    ? "Professional Tier"
                    : "Starter Tier";

                return (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom: "1px solid #F1F5F9",
                      transition: "background 0.12s ease",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#F8FAFC"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    {/* Organization Avatar & Name */}
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {c.logo ? (
                          <div style={{
                            width: "34px",
                            height: "34px",
                            minWidth: "34px",
                            borderRadius: "8px",
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
                            width: "34px",
                            height: "34px",
                            minWidth: "34px",
                            borderRadius: "8px",
                            background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
                            color: "#FFFFFF",
                            display: "grid",
                            placeItems: "center",
                            fontSize: "13px",
                            fontWeight: "800",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          }}>
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: "13.5px", fontWeight: "700", color: "#0F172A" }}>
                            {c.name}
                          </div>
                          <div style={{ fontSize: "11px", color: "#64748B" }}>
                            Code: <strong>{c.code}</strong>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Database Instance */}
                    <td style={{ padding: "12px 16px" }}>
                      <div>
                        <span style={{
                          fontFamily: "monospace",
                          fontSize: "11px",
                          fontWeight: "600",
                          color: "#2563EB",
                          background: "#EFF6FF",
                          padding: "2px 7px",
                          borderRadius: "4px",
                          border: "1px solid #DBEAFE",
                        }}>
                          {c.db_name}
                        </span>
                        <div style={{ fontSize: "10px", color: "#94A3B8", marginTop: "3px" }}>
                          Host: {c.db_host || "localhost:3306"}
                        </div>
                      </div>
                    </td>

                    {/* Plan & Module Adoption Bar */}
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          color: modCount === 12 ? "#059669" : "#2563EB",
                        }}>
                          {tierName}
                        </span>
                        <span style={{ fontSize: "10.5px", color: "#64748B" }}>
                          ({modCount}/12)
                        </span>
                      </div>

                      {/* Mini Adoption Bar */}
                      <div style={{
                        width: "140px",
                        height: "4px",
                        background: "#E2E8F0",
                        borderRadius: "2px",
                        overflow: "hidden",
                        marginTop: "5px",
                      }}>
                        <div style={{
                          width: `${percent}%`,
                          height: "100%",
                          background: modCount === 12 ? "#10B981" : "#2563EB",
                        }} />
                      </div>

                      {/* First few module tags */}
                      <div style={{ display: "flex", gap: "3px", marginTop: "5px", flexWrap: "wrap", maxWidth: "240px" }}>
                        {(c.features || []).slice(0, 3).map((f) => (
                          <span key={f} style={{
                            fontSize: "9.5px",
                            fontWeight: "600",
                            background: "#F1F5F9",
                            color: "#475569",
                            padding: "1px 5px",
                            borderRadius: "3px",
                            border: "1px solid #E2E8F0",
                          }}>
                            {f}
                          </span>
                        ))}
                        {(c.features || []).length > 3 && (
                          <span style={{ fontSize: "9.5px", color: "#2563EB", fontWeight: "700", padding: "1px 3px" }}>
                            +{c.features.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Validity & Expiry */}
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontSize: "12.5px", fontWeight: "700", color: "#0F172A" }}>
                        {c.expiry_date ? new Date(c.expiry_date).toLocaleDateString("en-IN") : "Unlimited"}
                      </div>
                      <div style={{ fontSize: "10.5px", color: "#64748B", marginTop: "1px" }}>
                        {c.subscription_months ? `${c.subscription_months} Months Plan` : "Standard Tier"}
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "10px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        padding: "3px 8px",
                        borderRadius: "10px",
                        background: status === "active" ? "#ECFDF5" : status === "expired" ? "#FFFBEB" : "#FFF1F2",
                        color: status === "active" ? "#059669" : status === "expired" ? "#D97706" : "#E11D48",
                        border: status === "active" ? "1px solid #A7F3D0" : status === "expired" ? "1px solid #FDE68A" : "1px solid #FECDD3",
                      }}>
                        <span style={{
                          width: "5px",
                          height: "5px",
                          borderRadius: "50%",
                          background: status === "active" ? "#10B981" : status === "expired" ? "#F59E0B" : "#F43F5E",
                        }} />
                        {status}
                      </span>
                    </td>

                    {/* Actions: View & Configure Modules */}
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => {
                            setInspectingCompanyId(c.id);
                            if (onSelectCompany) onSelectCompany(c.id);
                          }}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "6px 12px",
                            fontSize: "11.5px",
                            fontWeight: "700",
                            color: "#2563EB",
                            background: "#EFF6FF",
                            border: "1px solid #BFDBFE",
                            borderRadius: "6px",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#2563EB";
                            e.currentTarget.style.color = "#FFFFFF";
                            e.currentTarget.style.borderColor = "#2563EB";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#EFF6FF";
                            e.currentTarget.style.color = "#2563EB";
                            e.currentTarget.style.borderColor = "#BFDBFE";
                          }}
                        >
                          <span>Configure & Preview</span>
                          <span>→</span>
                        </button>

                        <button
                          onClick={() => onExtend && onExtend(c)}
                          style={{
                            padding: "6px 10px",
                            fontSize: "11px",
                            fontWeight: "700",
                            color: "#334155",
                            background: "#FFFFFF",
                            border: "1px solid #CBD5E1",
                            borderRadius: "6px",
                            cursor: "pointer",
                            transition: "all 0.12s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#F8FAFC";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#FFFFFF";
                          }}
                        >
                          + Extend
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredCompanies.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: "36px 16px", textAlign: "center", color: "#64748B" }}>
                    <div style={{ fontSize: "28px", marginBottom: "8px" }}>🔍</div>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: "#0F172A" }}>No Subscriptions Found</div>
                    <div style={{ fontSize: "12px", color: "#64748B", marginTop: "3px" }}>
                      Try adjusting your search query or filters.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsTab;
