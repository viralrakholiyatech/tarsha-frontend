// ─────────────────────────────────────────────
//  AddProposal.jsx  —  Add Proposal
//  Centered modal — matches AddSitevisit design
// ─────────────────────────────────────────────

import React, { useState } from "react";
import ApiService from "../../../services/ApiService";
import { AddOrUpdateproposal } from "../../../config/config";
import { getToken } from "../../../services/useLocalStorage";
import toast from "react-hot-toast";


// ─────────────────────────────────────────────
//  🎨  THEME
// ─────────────────────────────────────────────
const THEME = {
  brand:       "#887549",
  brandLight:  "#F5F0E8",
  brandMid:    "#C4A97D",
  brandDark:   "#5C4E32",
  bg:          "#F8F5F0",
  border:      "#EDE5D5",
  text:        "#1A1A2E",
  textMuted:   "#ADADAD",
  textLight:   "#BDBDBD",
  error:       "#CF1322",
  errorBg:     "#FFF1F0",
  errorBorder: "#FFA39E",
};

const MODAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }
  @keyframes apSlide {
    from { opacity:0; transform:translateY(-16px) scale(0.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes apFade { from { opacity:0; } to { opacity:1; } }
  @keyframes apSpin { to { transform:rotate(360deg); } }

  .ap-overlay {
    position:fixed; inset:0; z-index:1040;
    background:rgba(26,26,46,0.45); backdrop-filter:blur(3px);
    display:flex; align-items:center; justify-content:center;
    animation:apFade 0.2s ease; padding:16px;
  }
  .ap-modal {
    position:relative; width:100%; max-width:520px; max-height:90vh;
    background:${THEME.bg}; border-radius:18px; overflow:hidden;
    display:flex; flex-direction:column;
    box-shadow:0 20px 60px rgba(0,0,0,0.2);
    animation:apSlide 0.25s cubic-bezier(0.4,0,0.2,1);
    font-family:'DM Sans',sans-serif;
  }
  @media(max-width:560px){ .ap-modal { max-width:100%; max-height:95vh; } }

  .ap-header {
    background:#fff; border-bottom:1px solid ${THEME.border};
    padding:18px 24px;
    display:flex; align-items:center; justify-content:space-between;
    flex-shrink:0;
  }
  .ap-body  { flex:1; overflow-y:auto; padding:24px; }
  .ap-footer {
    background:#fff; border-top:1px solid ${THEME.border};
    padding:16px 24px;
    display:flex; justify-content:flex-end; gap:10px;
    flex-shrink:0;
  }

  .ap-input {
    width:100%; padding:10px 13px; border-radius:10px;
    border:1.5px solid #E0D5C5; font-size:13px;
    font-family:'DM Sans',sans-serif; color:#1A1A2E;
    outline:none; background:#fff;
    transition:border-color 0.15s, box-shadow 0.15s;
    appearance:auto;
  }
  .ap-input:focus { border-color:${THEME.brand}; box-shadow:0 0 0 3px ${THEME.brand}18; }
  .ap-input::placeholder { color:${THEME.textLight}; }
  .ap-input.error { border-color:${THEME.errorBorder}; background:${THEME.errorBg}; }

  /* Status radio pills */
  .ap-status-radio { display:none; }
  .ap-status-label {
    display:inline-flex; align-items:center; gap:6px;
    padding:7px 16px; border-radius:20px; cursor:pointer;
    font-size:12px; font-weight:600; border:1.5px solid #E0D5C5;
    background:#fff; color:#8C8C8C; transition:all 0.18s;
    font-family:'DM Sans',sans-serif; user-select:none;
  }
  .ap-status-radio[value="1"]:checked + .ap-status-label { background:#FFF7E6; color:#D46B08; border-color:#FFD591; }
  .ap-status-radio[value="2"]:checked + .ap-status-label { background:#F6FFED; color:#389E0D; border-color:#B7EB8F; }
  .ap-status-radio[value="3"]:checked + .ap-status-label { background:#FFF1F0; color:#CF1322; border-color:#FFA39E; }

  /* Upload zone */
  .ap-upload {
    border:2px dashed #D4C4A0; border-radius:12px;
    padding:24px 20px; text-align:center; cursor:pointer;
    background:${THEME.brandLight}; transition:all 0.18s;
    display:flex; flex-direction:column; align-items:center; gap:8px;
  }
  .ap-upload:hover { border-color:${THEME.brand}; background:#F0E8D8; }
  .ap-upload input[type=file] { display:none; }

  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:${THEME.brandLight}; }
  ::-webkit-scrollbar-thumb { background:${THEME.brandMid}; border-radius:10px; }
`;

const STATUSES = [
  { value: "1", label: "⏳ Pending"  },
  { value: "2", label: "✅ Approved" },
  { value: "3", label: "❌ Rejected" },
];

const EMPTY = { proposal: null, scope_of_work: "", status: "1" };


// ─────────────────────────────────────────────
//  🧩  ATOMS
// ─────────────────────────────────────────────

function FieldLabel({ children, required }) {
  return (
    <label style={{
      display: "block", marginBottom: 5,
      fontSize: 11, fontWeight: 700, color: THEME.textMuted,
      textTransform: "uppercase", letterSpacing: "0.07em",
    }}>
      {children}{required && <span style={{ color: THEME.error, marginLeft: 3 }}>*</span>}
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

function SectionTitle({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "20px 0 14px" }}>
      <div style={{ width: 3, height: 14, borderRadius: 2, background: `linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
      <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: THEME.brand, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "'Sora',sans-serif" }}>
        {children}
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
        padding: "10px 26px", borderRadius: 10, border: "none",
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


// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const AddProposal = ({ show, handleClose, onSuccess, leadId }) => {
  const [formData,   setFormData]   = useState(EMPTY);
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [fileName,   setFileName]   = useState("");

  // Lock body scroll
  React.useEffect(() => {
    document.body.style.overflow = show ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [show]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData((p) => ({ ...p, proposal: file }));
    setFileName(file.name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.scope_of_work.trim()) newErrors.scope_of_work = "Scope of work is required";
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("lead_id",       leadId);
      form.append("scope_of_work", formData.scope_of_work);
      form.append("status",        formData.status);
      if (formData.proposal) form.append("proposal", formData.proposal);

      const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "multipart/form-data" };
      const res = await ApiService(form, 0, header, AddOrUpdateproposal.method, AddOrUpdateproposal.url);

      if (res.status === 201 && !res.data.error) {
        toast.success(res.data.message || "Proposal added successfully");
        handleClose();
        onSuccess?.();
        setFormData(EMPTY); setFileName(""); setErrors({});
      } else { toast.error(res.data?.message || "An error occurred"); }
    } catch { toast.error("An unexpected error occurred."); }
    finally { setSubmitting(false); }
  };

  return (
    <>
      <style>{MODAL_CSS}</style>

      <div className="ap-overlay" onClick={handleClose}>
        <div className="ap-modal" onClick={(e) => e.stopPropagation()}>

          {/* ── Header ── */}
          <div className="ap-header">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: THEME.brandLight, border: `1px solid #D4C4A0`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
              }}>📄</div>
              <div>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: THEME.text, fontFamily: "'Sora',sans-serif" }}>
                  Add Proposal
                </h2>
                <p style={{ margin: 0, fontSize: 11, color: THEME.textMuted }}>Upload a proposal for this lead</p>
              </div>
            </div>
            <button onClick={handleClose}
              style={{ width: 34, height: 34, borderRadius: 10, border: `1.5px solid ${THEME.border}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: THEME.textMuted, transition: "all 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = THEME.brandLight; e.currentTarget.style.color = THEME.brand; e.currentTarget.style.borderColor = THEME.brand; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = THEME.textMuted; e.currentTarget.style.borderColor = THEME.border; }}>
              ×
            </button>
          </div>

          {/* ── Body ── */}
          <form onSubmit={handleSubmit} noValidate className="ap-body">

            <SectionTitle>Proposal Details</SectionTitle>

            {/* Scope of Work */}
            <div style={{ marginBottom: 16 }}>
              <FieldLabel required>Scope of Work</FieldLabel>
              <input type="text" className={`ap-input${errors.scope_of_work ? " error" : ""}`}
                name="scope_of_work" placeholder="Describe the scope of work…"
                value={formData.scope_of_work} onChange={handleChange} />
              <ErrorMsg message={errors.scope_of_work} />
            </div>

            {/* Status — radio pills */}
            <div style={{ marginBottom: 16 }}>
              <FieldLabel>Status</FieldLabel>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                {STATUSES.map(({ value, label }) => (
                  <React.Fragment key={value}>
                    <input type="radio" id={`ap-st-${value}`} value={value}
                      name="status" className="ap-status-radio"
                      checked={formData.status === value}
                      onChange={handleChange}
                    />
                    <label htmlFor={`ap-st-${value}`} className="ap-status-label">{label}</label>
                  </React.Fragment>
                ))}
              </div>
            </div>

            <SectionTitle>Proposal File</SectionTitle>

            {/* File upload */}
            <label htmlFor="ap-file" className="ap-upload">
              <input type="file" id="ap-file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,image/*"
                onChange={handleFileChange} />
              {fileName ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "#F0F5FF", border: "1.5px solid #ADC6FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📎</div>
                  <div style={{ textAlign: "left" }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: THEME.text }}>{fileName}</p>
                    <p style={{ margin: 0, fontSize: 11, color: THEME.textMuted }}>Click to change file</p>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: "#fff", border: `1px solid #D4C4A0`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                    📎
                  </div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: THEME.brand }}>Click to upload proposal</p>
                  <p style={{ margin: 0, fontSize: 11, color: THEME.textMuted }}>PDF, DOC, XLS, PPT, Images supported</p>
                </>
              )}
            </label>

            {fileName && (
              <button type="button"
                onClick={() => { setFileName(""); setFormData((p) => ({ ...p, proposal: null })); }}
                style={{ marginTop: 8, fontSize: 12, color: THEME.error, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                × Remove file
              </button>
            )}

          </form>

          {/* ── Footer ── */}
          <div className="ap-footer">
            <SecondaryBtn onClick={handleClose}>Cancel</SecondaryBtn>
            <PrimaryBtn type="submit" onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #ffffff88", borderTopColor: "#fff", display: "inline-block", animation: "apSpin 0.7s linear infinite" }} />
                  Saving…
                </>
              ) : "✓ Add Proposal"}
            </PrimaryBtn>
          </div>

        </div>
      </div>
    </>
  );
};

export default AddProposal;