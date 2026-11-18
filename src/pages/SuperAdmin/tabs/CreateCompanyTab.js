import React, { useState } from "react";
import { superAdminApi } from "../superAdminApi";
import Swal from "sweetalert2";
import toast, { Toaster } from "react-hot-toast";

const ALL_MODULES = [
  { key: "Meeting",        label: "Meetings",          icon: "🗓️", category: "Collaboration", desc: "Schedule, minutes & video meets" },
  { key: "Team",           label: "Team / HR",         icon: "👥", category: "Human Capital",  desc: "Directory, attendance & payroll" },
  { key: "Work",           label: "Work & Tasks",      icon: "📋", category: "Operations",     desc: "Project tracking & deliverables" },
  { key: "Interior",       label: "Interior Design",   icon: "🎨", category: "Design Suite",   desc: "3D layouts, moodboards & finishes" },
  { key: "Architecture",   label: "Architecture",      icon: "📐", category: "Design Suite",   desc: "Blueprints, CAD specs & elevations" },
  { key: "Approval",       label: "Approvals & Signs", icon: "✍️", category: "Workflow",       desc: "Multi-level signoff workflows" },
  { key: "Social Media",   label: "Social Media",      icon: "📢", category: "Marketing",      desc: "Brand posts, campaigns & schedule" },
  { key: "Finance",        label: "Finance & Bills",   icon: "💳", category: "Accounting",     desc: "Invoicing, expenses & tax ledger" },
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
    modules: ["Meeting", "Team", "Work", "Site Inspection", "Interior", "Architecture", "Approval", "Finance"],
    desc: "Complete architectural, design & billing suite",
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

const CreateCompanyTab = ({ onBack, onSuccess }) => {
  const [form, setForm] = useState({
    name: "",
    code: "",
    logo: "",
    admin_name: "",
    admin_email: "",
    admin_password: "",
    admin_phone: "",
    subscription_months: 1,
    features: ["Meeting", "Team", "Work", "Site Inspection", "Interior", "Architecture", "Approval", "Finance"],
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload a valid image file (PNG, JPG, SVG, WebP).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg("Image size exceeds 2MB limit. Please upload a smaller logo.");
      return;
    }

    setErrorMsg("");
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setField("logo", dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleUseTarshaLogo = () => {
    setField("logo", "/img/tarsha_logo.png");
  };

  const handleRemoveLogo = () => {
    setField("logo", "");
  };

  const setField = (k, v) => {
    setForm((prev) => {
      const next = { ...prev, [k]: v };
      if (k === "name" && !prev.code) {
        next.code = v.toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 15);
      }
      return next;
    });
  };

  const toggleFeature = (f) => {
    setForm((prev) => {
      const currentFeatures = Array.isArray(prev.features) ? prev.features : [];
      return {
        ...prev,
        features: currentFeatures.includes(f)
          ? currentFeatures.filter((x) => x !== f)
          : [...currentFeatures, f],
      };
    });
  };

  const getActivePreset = () => {
    for (const preset of PLAN_PRESETS) {
      if (
        preset.modules.length === form.features.length &&
        preset.modules.every((m) => form.features.includes(m))
      ) {
        return preset.id;
      }
    }
    return null;
  };

  const applyPreset = (preset) => {
    setField("features", [...preset.modules]);
  };

  const expectedDb = form.code
    ? `tarsha_${form.code.toLowerCase().replace(/[^a-z0-9_]/g, "_")}`
    : "tarsha_[code]";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!form.name || !form.code || !form.admin_email || !form.admin_password) {
      const msg = "Please complete all required fields (marked with *).";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Provisioning database & cloning 195 tables...");
    try {
      const res = await superAdminApi.createCompany(form);
      if (res && !res.error) {
        toast.success(`Company "${res.data.name}" provisioned successfully!`, {
          id: toastId,
          duration: 4000,
        });
        await Swal.fire({
          icon: "success",
          title: "Tenant Provisioned Successfully!",
          html: `
            <div style="text-align: left; font-size: 13px; color: #334155; line-height: 1.6;">
              <p><strong>Company:</strong> ${res.data.name} (Code: <code>${res.data.code}</code>)</p>
              <p><strong>Isolated Database:</strong> <code style="color: #2563EB;">${res.data.db_name}</code></p>
              <p><strong>Tables Cloned:</strong> 195 empty tables from schema template</p>
              <p><strong>Admin Login:</strong> <code>${res.data.admin_email}</code></p>
            </div>
          `,
          confirmButtonColor: "#0F172A",
          confirmButtonText: "Go to Companies Directory",
        });
        onSuccess();
      } else {
        const msg = res.message || "Failed to provision company";
        setErrorMsg(msg);
        toast.error(msg, { id: toastId, duration: 6000 });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "An unexpected error occurred.";
      setErrorMsg(msg);
      toast.error(msg, { id: toastId, duration: 6000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Toast Notification Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontSize: "12.5px",
            fontWeight: "600",
            borderRadius: "8px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
          },
        }}
      />
      {/* ─── Top Bar / Breadcrumb ─── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "20px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={onBack}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "6px",
              color: "#475569",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#F1F5F9";
              e.currentTarget.style.color = "#0F172A";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#FFFFFF";
              e.currentTarget.style.color = "#475569";
            }}
          >
            ← Back
          </button>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0F172A", margin: 0 }}>
              Provision New Tenant Company
            </h2>
            <p style={{ fontSize: "11.5px", color: "#64748B", margin: "2px 0 0 0" }}>
              Automates MySQL database creation, 195 table cloning, and admin account setup.
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 18px",
            background: "#0F172A",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "7px",
            fontSize: "12.5px",
            fontWeight: "700",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 2px 8px rgba(15,23,42,0.15)",
          }}
        >
          {loading ? "Provisioning Database..." : "🚀 Provision Company"}
        </button>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div style={{
          padding: "10px 14px",
          background: "#FEF2F2",
          border: "1px solid #FECDD3",
          borderRadius: "8px",
          color: "#991B1B",
          fontSize: "12px",
          marginBottom: "16px",
          fontWeight: "600",
        }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Form - 100% Width Stacked Layout */}
      <form onSubmit={handleSubmit} style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        width: "100%",
      }}>
        {/* Card 1: Company Profile */}
        <div style={{
          background: "#FFFFFF",
          borderRadius: "10px",
          border: "1px solid #E2E8F0",
          padding: "18px 20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        }}>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#0F172A", marginBottom: "14px" }}>
              1. Company Organization
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
                  Company Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Interior Labs"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  style={{
                    width: "100%",
                    height: "34px",
                    padding: "0 10px",
                    borderRadius: "6px",
                    border: "1px solid #CBD5E1",
                    fontSize: "12px",
                    outline: "none",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
                  Tenant Code (Slug) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. acme"
                  value={form.code}
                  onChange={(e) => setField("code", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  style={{
                    width: "100%",
                    height: "34px",
                    padding: "0 10px",
                    borderRadius: "6px",
                    border: "1px solid #CBD5E1",
                    fontSize: "12px",
                    fontFamily: "monospace",
                    outline: "none",
                  }}
                  required
                />
              </div>
            </div>

            {/* Company Brand Logo Upload */}
            <div style={{ marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "#475569" }}>
                  Company Brand Logo (Used in Website & Staff Portal)
                </label>
                {!form.logo && (
                  <button
                    type="button"
                    onClick={handleUseTarshaLogo}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "10.5px",
                      fontWeight: "700",
                      color: "#2563EB",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    + Use Tarsha Default Logo
                  </button>
                )}
              </div>

              {form.logo ? (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1.5px solid #BFDBFE",
                  background: "#F0F7FF",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "60px",
                      height: "44px",
                      borderRadius: "6px",
                      background: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "4px",
                      overflow: "hidden",
                    }}>
                      <img
                        src={form.logo}
                        alt="Company Logo Preview"
                        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: "700", color: "#0F172A" }}>
                        Logo Ready ✓
                      </div>
                      <div style={{ fontSize: "10.5px", color: "#64748B" }}>
                        Will display on tenant login, dashboard, & staff sidebar
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <label style={{
                      padding: "5px 10px",
                      fontSize: "11px",
                      fontWeight: "700",
                      background: "#FFFFFF",
                      border: "1px solid #CBD5E1",
                      borderRadius: "5px",
                      cursor: "pointer",
                      color: "#334155",
                    }}>
                      Replace
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml,image/webp"
                        onChange={handleLogoUpload}
                        style={{ display: "none" }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      style={{
                        padding: "5px 10px",
                        fontSize: "11px",
                        fontWeight: "700",
                        background: "#FFFFFF",
                        border: "1px solid #FECDD3",
                        borderRadius: "5px",
                        cursor: "pointer",
                        color: "#E11D48",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1.5px dashed #CBD5E1",
                  background: "#F8FAFC",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}>
                  <div style={{ fontSize: "22px", marginBottom: "4px" }}>🖼️</div>
                  <div style={{ fontSize: "12px", fontWeight: "700", color: "#0F172A" }}>
                    Click to upload company logo
                  </div>
                  <div style={{ fontSize: "10.5px", color: "#64748B", marginTop: "2px" }}>
                    PNG, JPG, SVG or WebP up to 2MB (Used on website & portal)
                  </div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    onChange={handleLogoUpload}
                    style={{ display: "none" }}
                  />
                </label>
              )}
            </div>

            {/* Live DB Name Indicator */}
            <div style={{
              padding: "10px 12px",
              background: "#F8FAFC",
              borderRadius: "6px",
              border: "1px solid #E2E8F0",
              fontSize: "11.5px",
              color: "#475569",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <span>Target Database to Provision:</span>
              <code style={{ fontWeight: "700", color: "#2563EB", fontSize: "12px" }}>
                {expectedDb}
              </code>
            </div>
          </div>

          {/* Card 2: Primary Administrator */}
          <div style={{
            background: "#FFFFFF",
            borderRadius: "10px",
            border: "1px solid #E2E8F0",
            padding: "18px 20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#0F172A", marginBottom: "14px" }}>
              2. Primary Administrator Account
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
                  Admin Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={form.admin_name}
                  onChange={(e) => setField("admin_name", e.target.value)}
                  style={{
                    width: "100%",
                    height: "34px",
                    padding: "0 10px",
                    borderRadius: "6px",
                    border: "1px solid #CBD5E1",
                    fontSize: "12px",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={form.admin_phone}
                  onChange={(e) => setField("admin_phone", e.target.value)}
                  style={{
                    width: "100%",
                    height: "34px",
                    padding: "0 10px",
                    borderRadius: "6px",
                    border: "1px solid #CBD5E1",
                    fontSize: "12px",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
                  Admin Email (Login) *
                </label>
                <input
                  type="email"
                  placeholder="admin@company.com"
                  value={form.admin_email}
                  onChange={(e) => setField("admin_email", e.target.value)}
                  style={{
                    width: "100%",
                    height: "34px",
                    padding: "0 10px",
                    borderRadius: "6px",
                    border: "1px solid #CBD5E1",
                    fontSize: "12px",
                    outline: "none",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
                  Password *
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.admin_password}
                    onChange={(e) => setField("admin_password", e.target.value)}
                    style={{
                      width: "100%",
                      height: "34px",
                      padding: "0 34px 0 10px",
                      borderRadius: "6px",
                      border: "1px solid #CBD5E1",
                      fontSize: "12px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "6px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px",
                      color: showPassword ? "#2563EB" : "#94A3B8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "4px",
                    }}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Subscription Validity */}
          <div style={{
            background: "#FFFFFF",
            borderRadius: "10px",
            border: "1px solid #E2E8F0",
            padding: "18px 20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#0F172A", marginBottom: "14px" }}>
              3. Subscription Period
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
              {[
                { months: 1, label: "1 Month", note: "Trial / Monthly" },
                { months: 3, label: "3 Months", note: "Quarterly" },
                { months: 6, label: "6 Months", note: "Half-Year" },
                { months: 12, label: "12 Months", note: "Annual Plan" },
              ].map((p) => {
                const isSelected = form.subscription_months === p.months;
                return (
                  <div
                    key={p.months}
                    onClick={() => setField("subscription_months", p.months)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "7px",
                      border: isSelected ? "2px solid #2563EB" : "1px solid #CBD5E1",
                      background: isSelected ? "#EFF6FF" : "#FFFFFF",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.12s ease",
                    }}
                  >
                    <div style={{ fontSize: "12.5px", fontWeight: "700", color: isSelected ? "#1E40AF" : "#0F172A" }}>
                      {p.label}
                    </div>
                    <div style={{ fontSize: "10px", color: isSelected ? "#3B82F6" : "#64748B", marginTop: "2px" }}>
                      {p.note}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 4: Subscription Plan & Module Licensing (Down Side - 100% Width) */}
          <div style={{
            background: "#FFFFFF",
            borderRadius: "10px",
            border: "1px solid #E2E8F0",
            padding: "18px 20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#0F172A", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>4. Subscription Plan & Modules</span>
                  <span style={{
                    fontSize: "10px",
                    fontWeight: "700",
                    background: "#EFF6FF",
                    color: "#2563EB",
                    padding: "2px 7px",
                    borderRadius: "4px",
                    border: "1px solid #BFDBFE",
                  }}>
                    {form.features.length} / {ALL_MODULES.length} Active
                  </span>
                </div>
                <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
                  Select a tier preset for quick setup or customize individual modules below
                </div>
              </div>

              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  type="button"
                  onClick={() => setField("features", ALL_MODULES.map((m) => m.key))}
                  style={{
                    padding: "4px 9px",
                    background: "#F8FAFC",
                    border: "1px solid #CBD5E1",
                    borderRadius: "5px",
                    fontSize: "11px",
                    fontWeight: "600",
                    color: "#334155",
                    cursor: "pointer",
                  }}
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => setField("features", [])}
                  style={{
                    padding: "4px 9px",
                    background: "#F8FAFC",
                    border: "1px solid #CBD5E1",
                    borderRadius: "5px",
                    fontSize: "11px",
                    fontWeight: "600",
                    color: "#64748B",
                    cursor: "pointer",
                  }}
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Plan Tier Presets Section */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{
                fontSize: "10.5px",
                fontWeight: "700",
                color: "#64748B",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}>
                <span>⚡ Plan Tier Presets (1-Click Apply)</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                {PLAN_PRESETS.map((preset) => {
                  const isActive = getActivePreset() === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => applyPreset(preset)}
                      style={{
                        padding: "12px 14px",
                        borderRadius: "8px",
                        border: isActive ? `2px solid ${preset.color}` : "1px solid #E2E8F0",
                        background: isActive ? `${preset.color}08` : "#F8FAFC",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <span style={{ fontSize: "12px", fontWeight: "700", color: isActive ? preset.color : "#0F172A" }}>
                            {preset.name}
                          </span>
                          {isActive && (
                            <span style={{
                              fontSize: "9px",
                              fontWeight: "700",
                              background: preset.color,
                              color: "#FFFFFF",
                              padding: "1px 6px",
                              borderRadius: "10px",
                            }}>
                              ✓ Active
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: "10px", fontWeight: "600", color: preset.color, marginBottom: "4px" }}>
                          {preset.badge} ({preset.modules.length} modules)
                        </div>
                        <div style={{ fontSize: "10px", color: "#64748B", lineHeight: "1.4" }}>
                          {preset.desc}
                        </div>
                      </div>

                      <div style={{
                        marginTop: "8px",
                        fontSize: "10px",
                        fontWeight: "600",
                        color: isActive ? preset.color : "#475569",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}>
                        {isActive ? "● Current Selection" : "→ Click to Apply"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Customization Section */}
            <div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
                paddingTop: "12px",
                borderTop: "1px solid #F1F5F9",
              }}>
                <div style={{
                  fontSize: "10.5px",
                  fontWeight: "700",
                  color: "#64748B",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}>
                  🛠️ Customize Individual Modules ({form.features.length} Selected)
                </div>
                <div style={{ fontSize: "10.5px", fontWeight: "600", color: "#0F172A" }}>
                  {Math.round((form.features.length / ALL_MODULES.length) * 100)}% Coverage
                </div>
              </div>

              {/* Progress bar */}
              <div style={{
                height: "4px",
                width: "100%",
                background: "#F1F5F9",
                borderRadius: "2px",
                marginBottom: "12px",
                overflow: "hidden",
              }}>
                <div style={{
                  height: "100%",
                  width: `${(form.features.length / ALL_MODULES.length) * 100}%`,
                  background: form.features.length === ALL_MODULES.length ? "#059669" : "#2563EB",
                  transition: "width 0.2s ease",
                }} />
              </div>

              {/* Modules Grid - 100% Width Responsive */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "10px",
              }}>
                {ALL_MODULES.map((m) => {
                  const isChecked = form.features.includes(m.key);
                  const catStyle = CATEGORY_COLORS[m.category] || { bg: "#F1F5F9", text: "#475569", border: "#CBD5E1" };
                  return (
                    <div
                      key={m.key}
                      onClick={() => toggleFeature(m.key)}
                      style={{
                        padding: "8px 10px",
                        borderRadius: "7px",
                        border: isChecked ? "1.5px solid #2563EB" : "1px solid #E2E8F0",
                        background: isChecked ? "#F0F7FF" : "#FFFFFF",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        transition: "all 0.12s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
                        <span style={{ fontSize: "15px", flexShrink: 0 }}>{m.icon}</span>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: "11.5px", fontWeight: "700", color: isChecked ? "#1E40AF" : "#0F172A", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                            {m.label}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "1px" }}>
                            <span style={{
                              fontSize: "8.5px",
                              fontWeight: "700",
                              color: catStyle.text,
                              background: catStyle.bg,
                              border: `1px solid ${catStyle.border}`,
                              padding: "0.5px 5px",
                              borderRadius: "3px",
                            }}>
                              {m.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "4px",
                        border: isChecked ? "none" : "1px solid #CBD5E1",
                        background: isChecked ? "#2563EB" : "#FFFFFF",
                        color: "#FFFFFF",
                        display: "grid",
                        placeItems: "center",
                        fontSize: "11px",
                        fontWeight: "800",
                        flexShrink: 0,
                        marginLeft: "8px",
                      }}>
                        {isChecked && "✓"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card 5: Provisioning Guarantee & Bottom Action Bar */}
          <div style={{
            background: "#F8FAFC",
            borderRadius: "10px",
            border: "1px solid #E2E8F0",
            padding: "18px 20px",
            fontSize: "11.5px",
            color: "#475569",
            lineHeight: "1.6",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}>
            <div style={{ flex: "1 1 500px" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "#0F172A", marginBottom: "6px" }}>
                ⚡ What happens automatically upon clicking Provision:
              </div>
              <ul style={{ paddingLeft: "16px", margin: 0 }}>
                <li>Creates MySQL database <code>{expectedDb}</code> with utf8mb4 encoding</li>
                <li>Imports all 195 empty tables from schema template</li>
                <li>Inserts primary admin credentials with bcrypt salt</li>
                <li>Registers company in <code>master_admin.companies</code> with active status</li>
              </ul>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                type="button"
                onClick={onBack}
                style={{
                  padding: "9px 18px",
                  background: "#FFFFFF",
                  border: "1px solid #CBD5E1",
                  borderRadius: "7px",
                  fontSize: "12.5px",
                  fontWeight: "600",
                  color: "#475569",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "9px 22px",
                  background: "#0F172A",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "7px",
                  fontSize: "12.5px",
                  fontWeight: "700",
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: "0 2px 8px rgba(15,23,42,0.15)",
                }}
              >
                {loading ? "Provisioning..." : "🚀 Provision Company"}
              </button>
            </div>
          </div>
      </form>
    </div>
  );
};

export default CreateCompanyTab;
