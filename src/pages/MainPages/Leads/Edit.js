// ─────────────────────────────────────────────
//  EditLeads.jsx  —  Edit Lead Modal
// ─────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import ApiService from "../../../services/ApiService";
import { AddOrUpdateLeads, fetchleadsbyid } from "../../../config/config";
import { getToken } from "../../../services/useLocalStorage";
import toast from "react-hot-toast";

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
  textMuted: "#ADADAD",
  textLight: "#BDBDBD",
  error: "#CF1322",
  errorBg: "#FFF1F0",
  errorBorder: "#FFA39E",
};

const MODAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  @keyframes elSlideIn {
    from { opacity:0; transform:translateY(-20px) scale(0.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes elFadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes elSpin   { to { transform:rotate(360deg); } }
  @keyframes elShimmer {
    0%   { background-position:200% 0; }
    100% { background-position:-200% 0; }
  }

  .el-overlay {
    position:fixed; inset:0; z-index:1050;
    background:rgba(26,26,46,0.45); backdrop-filter:blur(3px);
    display:flex; align-items:center; justify-content:center;
    animation:elFadeIn 0.2s ease; padding:16px;
  }
  .el-dialog {
    background:#fff; border-radius:18px; width:100%; max-width:580px;
    max-height:90vh; overflow-y:auto;
    box-shadow:0 20px 60px rgba(0,0,0,0.18);
    animation:elSlideIn 0.25s cubic-bezier(0.4,0,0.2,1);
    font-family:'DM Sans',sans-serif;
  }
  .el-input {
    width:100%; padding:10px 13px; border-radius:10px;
    border:1.5px solid #E0D5C5; font-size:13px;
    font-family:'DM Sans',sans-serif; color:#1A1A2E;
    outline:none; background:#fff;
    transition:border-color 0.15s, box-shadow 0.15s;
    resize:vertical; appearance:auto;
  }
  .el-input:focus { border-color:${THEME.brand}; box-shadow:0 0 0 3px ${THEME.brand}18; }
  .el-input::placeholder { color:${THEME.textLight}; }
  .el-input.error { border-color:${THEME.errorBorder}; background:${THEME.errorBg}; }

  .el-check-input { display:none; }
  .el-check-label {
    display:inline-flex; align-items:center; gap:6px;
    padding:7px 14px; border-radius:20px; cursor:pointer;
    font-size:12px; font-weight:600; border:1.5px solid #E0D5C5;
    background:#fff; color:#595959; transition:all 0.18s;
    user-select:none; font-family:'DM Sans',sans-serif;
  }
  .el-check-input:checked + .el-check-label {
    background:${THEME.brandLight}; color:${THEME.brand}; border-color:${THEME.brand};
  }
  .el-check-label::before {
    content:''; width:14px; height:14px; border-radius:4px;
    border:1.5px solid currentColor; display:inline-block;
    flex-shrink:0; transition:background 0.15s;
  }
  .el-check-input:checked + .el-check-label::before {
    background:${THEME.brand}; border-color:${THEME.brand};
    content:'✓'; font-size:10px; color:#fff;
    display:inline-flex; align-items:center; justify-content:center;
  }

  /* Status pill selector */
  .el-status-pill {
    display:inline-flex; align-items:center; gap:6px;
    padding:8px 14px; border-radius:22px; cursor:pointer;
    font-size:12px; font-weight:700; border:1.5px solid transparent;
    transition:all 0.18s cubic-bezier(0.4,0,0.2,1);
    user-select:none; font-family:'DM Sans',sans-serif;
    position:relative; overflow:hidden;
  }
  .el-status-pill:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,0.1); }
  .el-status-pill.selected { box-shadow:0 3px 10px rgba(0,0,0,0.15); transform:translateY(-1px); }

  /* Skeleton shimmer */
  .el-skel {
    border-radius:8px;
    background:linear-gradient(90deg,#F5EFE8 25%,#EDE5D5 50%,#F5EFE8 75%);
    background-size:200% 100%;
    animation:elShimmer 1.4s infinite;
  }

  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:${THEME.brandLight}; }
  ::-webkit-scrollbar-thumb { background:${THEME.brandMid}; border-radius:10px; }
`;

const SERVICES = [
  { value: "1", label: "🏠 Interior" },
  { value: "2", label: "🏗️ Architecture" },
  { value: "3", label: "📋 Approval Process" },
];

const SOURCES = [
  { value: "1", label: "📱 Social Media" },
  { value: "2", label: "🌐 Website" },
  { value: "3", label: "📧 Email Campaign" },
  { value: "4", label: "🔍 Google Ads" },
  { value: "5", label: "🤝 Reference" },
  { value: "6", label: "🎪 Event" },
];

const LEAD_TYPES = [
  { value: "hot", label: "🔥 Hot" },
  { value: "cold", label: "❄️ Cold" },
  { value: "avg", label: "📊 Average" },
];

// ─── Enhanced Lead Statuses ───────────────────
const LEAD_STATUSES = [
  {
    value: "active",
    label: "Active",
    emoji: "🟢",
    description: "In progress",
    color: "#389E0D",
    bg: "#F6FFED",
    border: "#B7EB8F",
    selectedBg: "#52C41A",
    selectedColor: "#fff",
  },
  {
    value: "inactive",
    label: "Inactive",
    emoji: "⚫",
    description: "On hold",
    color: "#595959",
    bg: "#F5F5F5",
    border: "#D9D9D9",
    selectedBg: "#595959",
    selectedColor: "#fff",
  },
  {
    value: "follow_up",
    label: "Follow Up",
    emoji: "🔔",
    description: "Needs follow-up",
    color: "#1677FF",
    bg: "#E6F4FF",
    border: "#91CAFF",
    selectedBg: "#1677FF",
    selectedColor: "#fff",
  },
  {
    value: "proposal_sent",
    label: "Proposal Sent",
    emoji: "📤",
    description: "Awaiting response",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#C4B5FD",
    selectedBg: "#7C3AED",
    selectedColor: "#fff",
  },
  {
    value: "negotiation",
    label: "Negotiation",
    emoji: "🤝",
    description: "In negotiation",
    color: "#D46B08",
    bg: "#FFF7E6",
    border: "#FFD591",
    selectedBg: "#FA8C16",
    selectedColor: "#fff",
  },
  {
    value: "won",
    label: "Won",
    emoji: "🏆",
    description: "Deal closed!",
    color: "#08979C",
    bg: "#E6FFFB",
    border: "#87E8DE",
    selectedBg: "#13C2C2",
    selectedColor: "#fff",
  },
  {
    value: "lost",
    label: "Lost",
    emoji: "❌",
    description: "Deal lost",
    color: "#CF1322",
    bg: "#FFF1F0",
    border: "#FFA39E",
    selectedBg: "#F5222D",
    selectedColor: "#fff",
  },
  {
    value: "converted",
    label: "Converted",
    emoji: "⭐",
    description: "Became a client",
    color: "#887549",
    bg: "#F5F0E8",
    border: "#C4A97D",
    selectedBg: "#887549",
    selectedColor: "#fff",
  },
];

const PRIORITIES = [
  { value: "low",    label: "Low",    emoji: "🔵", color: "#1677FF", bg: "#E6F4FF", border: "#91CAFF", selBg: "#1677FF" },
  { value: "medium", label: "Medium", emoji: "🟡", color: "#D46B08", bg: "#FFF7E6", border: "#FFD591", selBg: "#FA8C16" },
  { value: "high",   label: "High",   emoji: "🔴", color: "#CF1322", bg: "#FFF1F0", border: "#FFA39E", selBg: "#F5222D" },
];

const EMPTY = {
  id: "",
  name: "",
  mobile_no: "",
  email: "",
  description: "",
  address: "",
  source: "",
  service: [],
  remarks: "",
  type: "",
  status: "active",
  budget: "",
  timeline: "",
  priority: "",
};

// ─────────────────────────────────────────────
//  🧩  ATOMS
// ─────────────────────────────────────────────

function FieldLabel({ children, required }) {
  return (
    <label style={{
      display: "block", marginBottom: 5, fontSize: 11,
      fontWeight: 700, color: THEME.textMuted,
      textTransform: "uppercase", letterSpacing: "0.07em",
    }}>
      {children}
      {required && <span style={{ color: THEME.error, marginLeft: 3 }}>*</span>}
    </label>
  );
}

function ErrorMsg({ message }) {
  if (!message) return null;
  return (
    <p style={{ margin: "4px 0 0", fontSize: 11, color: THEME.error, display: "flex", alignItems: "center", gap: 4 }}>
      ⚠ {message}
    </p>
  );
}

function SectionTitle({ children, icon }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "20px 0 14px" }}>
      <div style={{ width: 3, height: 14, borderRadius: 2, background: `linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
      <p style={{
        margin: 0, fontSize: 11, fontWeight: 700, color: THEME.brand,
        textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "'Sora',sans-serif",
      }}>
        {icon && <span style={{ marginRight: 5 }}>{icon}</span>}{children}
      </p>
    </div>
  );
}

function PrimaryBtn({ children, type = "button", onClick, disabled }) {
  const [hov, setHov] = useState(false);
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: "10px 24px", borderRadius: 10, border: "none",
        background: disabled ? "#C4C4C4" : hov ? THEME.brandDark : THEME.brand,
        color: "#fff", fontSize: 13, fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "'Sora',sans-serif", transition: "all 0.18s",
        boxShadow: disabled ? "none" : `0 2px 8px ${THEME.brand}44`,
        display: "inline-flex", alignItems: "center", gap: 6,
      }}>
      {children}
    </button>
  );
}

function SecondaryBtn({ children, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: "10px 24px", borderRadius: 10,
        border: `1.5px solid ${hov ? THEME.brand : "#E0D5C5"}`,
        background: hov ? THEME.brandLight : "#fff",
        color: hov ? THEME.brand : "#595959",
        fontSize: 13, fontWeight: 600, cursor: "pointer",
        fontFamily: "'DM Sans',sans-serif", transition: "all 0.18s",
      }}>
      {children}
    </button>
  );
}

// ─── Status Pill Selector ─────────────────────
function StatusPillSelector({ value, onChange }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {LEAD_STATUSES.map((s) => {
        const selected = value === s.value;
        return (
          <button
            key={s.value}
            type="button"
            onClick={() => onChange(s.value)}
            className={`el-status-pill${selected ? " selected" : ""}`}
            title={s.description}
            style={{
              background: selected ? s.selectedBg : s.bg,
              color: selected ? s.selectedColor : s.color,
              border: `1.5px solid ${selected ? s.selectedBg : s.border}`,
            }}
          >
            <span style={{ fontSize: 14 }}>{s.emoji}</span>
            <span>{s.label}</span>
            {selected && (
              <span style={{
                marginLeft: 2, fontSize: 10, opacity: 0.85,
                background: "rgba(255,255,255,0.25)", borderRadius: 4,
                padding: "1px 4px",
              }}>✓</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Priority Selector ────────────────────────
function PrioritySelector({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {PRIORITIES.map((p) => {
        const selected = value === p.value;
        return (
          <button key={p.value} type="button" onClick={() => onChange(p.value)}
            style={{
              flex: 1, padding: "9px 10px", borderRadius: 10,
              border: `1.5px solid ${selected ? p.selBg : p.border}`,
              background: selected ? p.selBg : p.bg,
              color: selected ? "#fff" : p.color,
              cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
              fontWeight: 700, fontSize: 12, transition: "all 0.18s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
            }}>
            <span>{p.emoji}</span> {p.label}
          </button>
        );
      })}
    </div>
  );
}

function SkeletonForm() {
  return (
    <div style={{ padding: "4px 24px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <div key={n}>
          <div className="el-skel" style={{ width: 80, height: 10, marginBottom: 6 }} />
          <div className="el-skel" style={{ width: "100%", height: 40 }} />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const EditLeads = ({ editshow, handleeditClose, LeadId, onSuccess }) => {
  const [formData, setFormData] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [fetching, setFetching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!editshow || !LeadId) return;
    const fetchData = async () => {
      setFetching(true);
      try {
        const header = {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        };
        const res = await ApiService(null, LeadId, header, fetchleadsbyid.method, fetchleadsbyid.url);
        if ((res.status === 200 || res.status === 201) && res.data?.data?.length > 0) {
          const d = res.data.data[0];
          setFormData({
            id: d.id,
            name: d.name || "",
            mobile_no: d.mobile_no || "",
            email: d.email || "",
            description: d.description || "",
            address: d.address || "",
            source: d.source || "",
            service: Array.isArray(d.service) ? d.service.map(String) : [],
            remarks: d.remarks || "",
            type: d.type || "",
            status: d.status || "active",
            budget: d.budget || "",
            timeline: d.timeline || "",
            priority: d.priority || "",
          });
        } else {
          toast.error("Failed to fetch lead data");
        }
      } catch {
        toast.error("An unexpected error occurred.");
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [editshow, LeadId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleCheckbox = (e) => {
    const { value, checked } = e.target;
    setFormData((p) => ({
      ...p,
      service: checked ? [...p.service, value] : p.service.filter((s) => s !== value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setSubmitting(true);
    try {
      const header = {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      };
      const dataToSend = {
        ...formData,
        service: JSON.stringify(formData.service.map(Number)),
      };
      const res = await ApiService(dataToSend, 0, header, AddOrUpdateLeads.method, AddOrUpdateLeads.url);
      if (res.status === 200 && !res.data.error) {
        toast.success(res.data.message || "Lead updated successfully");
        handleeditClose();
        onSuccess?.();
        setFormData(EMPTY);
        setErrors({});
      } else {
        toast.error(res.data?.message || "An error occurred");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!editshow) return null;

  const selectedStatus = LEAD_STATUSES.find((s) => s.value === formData.status);

  return (
    <>
      <style>{MODAL_CSS}</style>

      <div className="el-overlay" onClick={(e) => e.target === e.currentTarget && handleeditClose()}>
        <div className="el-dialog">

          {/* ── Modal Header ── */}
          <div style={{
            padding: "20px 24px 18px", borderBottom: `1px solid ${THEME.border}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            position: "sticky", top: 0, background: "#fff",
            borderRadius: "18px 18px 0 0", zIndex: 1,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: THEME.brandLight,
                border: `1px solid #D4C4A0`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
              }}>✏️</div>
              <div>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: THEME.text, fontFamily: "'Sora',sans-serif" }}>
                  Edit Lead
                </h2>
                <p style={{ margin: 0, fontSize: 11, color: THEME.textMuted }}>
                  {fetching ? "Loading…" : `ID #${LeadId}`}
                </p>
              </div>
            </div>
            <button onClick={handleeditClose}
              style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${THEME.border}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: THEME.textMuted, transition: "all 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = THEME.brandLight; e.currentTarget.style.color = THEME.brand; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = THEME.textMuted; }}>
              ×
            </button>
          </div>

          {/* ── Skeleton or Form ── */}
          {fetching ? (
            <SkeletonForm />
          ) : (
            <form onSubmit={handleSubmit} noValidate style={{ padding: "4px 24px 24px" }}>

              {/* Contact Info */}
              <SectionTitle icon="👤">Contact Information</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <FieldLabel required>Name</FieldLabel>
                  <input type="text" className={`el-input${errors.name ? " error" : ""}`}
                    name="name" placeholder="Full name" value={formData.name} onChange={handleChange} />
                  <ErrorMsg message={errors.name} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <FieldLabel>Mobile No</FieldLabel>
                    <input type="text" className="el-input" name="mobile_no" placeholder="Mobile number" value={formData.mobile_no} onChange={handleChange} />
                  </div>
                  <div>
                    <FieldLabel>Email</FieldLabel>
                    <input type="email" className="el-input" name="email" placeholder="email@example.com" value={formData.email} onChange={handleChange} />
                  </div>
                </div>
                <div>
                  <FieldLabel>Address</FieldLabel>
                  <textarea className="el-input" rows={2} name="address" placeholder="Site / project address…" value={formData.address} onChange={handleChange} />
                </div>
              </div>

              {/* Services */}
              <SectionTitle icon="🛠️">Services Required</SectionTitle>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {SERVICES.map(({ value, label }) => (
                  <React.Fragment key={value}>
                    <input type="checkbox" id={`el-svc-${value}`} value={value}
                      className="el-check-input" checked={formData.service.includes(value)} onChange={handleCheckbox} />
                    <label htmlFor={`el-svc-${value}`} className="el-check-label">{label}</label>
                  </React.Fragment>
                ))}
              </div>

              {/* Lead Source */}
              <SectionTitle icon="📡">Lead Source</SectionTitle>
              <div>
                <FieldLabel>Source</FieldLabel>
                <select className="el-input" name="source" value={formData.source} onChange={handleChange}>
                  <option value="">Select lead source</option>
                  {SOURCES.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Remarks */}
              <SectionTitle icon="📝">Remarks</SectionTitle>
              <div>
                <FieldLabel>Remarks</FieldLabel>
                <textarea className="el-input" rows={2} name="remarks" placeholder="Any additional remarks…" value={formData.remarks} onChange={handleChange} />
              </div>

              {/* Classification */}
              <SectionTitle icon="🏷️">Classification</SectionTitle>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <FieldLabel>Lead Type</FieldLabel>
                  <select className="el-input" name="type" value={formData.type} onChange={handleChange}>
                    <option value="">Select type</option>
                    {LEAD_TYPES.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <FieldLabel>Priority</FieldLabel>
                  <PrioritySelector value={formData.priority} onChange={(v) => setFormData((p) => ({ ...p, priority: v }))} />
                </div>
              </div>

              {/* ── Status — Visual Pill Selector ── */}
              <div style={{
                background: selectedStatus ? selectedStatus.bg : THEME.brandLight,
                border: `1.5px solid ${selectedStatus ? selectedStatus.border : THEME.border}`,
                borderRadius: 14, padding: "16px 18px", transition: "all 0.25s",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14 }}>📌</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: THEME.brand, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "'Sora',sans-serif" }}>
                      Lead Status
                    </span>
                  </div>
                  {selectedStatus && (
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                      background: selectedStatus.selectedBg, color: "#fff",
                      boxShadow: `0 2px 8px ${selectedStatus.selectedBg}55`,
                    }}>
                      {selectedStatus.emoji} {selectedStatus.label}
                      <span style={{ fontSize: 10, opacity: 0.8 }}>— {selectedStatus.description}</span>
                    </span>
                  )}
                </div>
                <StatusPillSelector
                  value={formData.status}
                  onChange={(v) => setFormData((p) => ({ ...p, status: v }))}
                />
              </div>

              {/* Project Details */}
              <SectionTitle icon="🏗️">Project Details</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <FieldLabel>Budget</FieldLabel>
                    <input type="text" className="el-input" name="budget" placeholder="e.g. ₹5,00,000" value={formData.budget} onChange={handleChange} />
                  </div>
                  <div>
                    <FieldLabel>Timeline</FieldLabel>
                    <input type="text" className="el-input" name="timeline" placeholder="e.g. 3 months" value={formData.timeline} onChange={handleChange} />
                  </div>
                </div>
                <div>
                  <FieldLabel>Project Description</FieldLabel>
                  <textarea className="el-input" rows={3} name="description" placeholder="Describe the project requirements…" value={formData.description} onChange={handleChange} />
                </div>
              </div>

              {/* Actions */}
              <div style={{
                display: "flex", justifyContent: "flex-end", gap: 10,
                marginTop: 24, paddingTop: 16, borderTop: `1px solid ${THEME.border}`,
              }}>
                <SecondaryBtn onClick={handleeditClose}>Cancel</SecondaryBtn>
                <PrimaryBtn type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #ffffff88", borderTopColor: "#fff", display: "inline-block", animation: "elSpin 0.7s linear infinite" }} />
                      Saving…
                    </>
                  ) : "✓ Save Changes"}
                </PrimaryBtn>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default EditLeads;