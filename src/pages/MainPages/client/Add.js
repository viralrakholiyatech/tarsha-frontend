import React, { useState } from "react";
import ApiService from "../../../services/ApiService";
import { insertClient } from "../../../config/config";
import { getToken } from "../../../services/useLocalStorage";
import toast from "react-hot-toast";

const THEME = {
  brand:       "#887549",
  brandLight:  "#F5F0E8",
  brandMid:    "#C4A97D",
  brandDark:   "#5C4E32",
  border:      "#EDE5D5",
  text:        "#1A1A2E",
  textMuted:   "#ADADAD",
  textLight:   "#BDBDBD",
  error:       "#CF1322",
  errorLight:  "#FFF1F0",
  errorBorder: "#FFA39E",
};

const MODAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }

  .ac-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45); z-index: 1040;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .ac-dialog {
    background: #fff; border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.18);
    width: 100%; max-width: 680px; max-height: 90vh;
    display: flex; flex-direction: column;
    font-family: 'DM Sans', sans-serif; overflow: hidden;
  }
  .ac-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px; border-bottom: 1px solid ${THEME.border};
    flex-shrink: 0; background: #FDFAF5;
  }
  .ac-body {
    padding: 22px 24px; overflow-y: auto; flex: 1;
  }
  .ac-body::-webkit-scrollbar { width: 4px; }
  .ac-body::-webkit-scrollbar-thumb { background: ${THEME.brandMid}; border-radius: 4px; }
  .ac-footer {
    display: flex; align-items: center; justify-content: flex-end;
    gap: 10px; padding: 14px 24px;
    border-top: 1px solid ${THEME.border}; flex-shrink: 0;
  }

  .ac-input, .ac-select, .ac-textarea {
    width: 100%; padding: 9px 12px; border-radius: 10px;
    border: 1.5px solid #E0D5C5; font-size: 13px;
    font-family: 'DM Sans', sans-serif; color: ${THEME.text};
    outline: none; background: #fff; appearance: auto;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .ac-input:focus, .ac-select:focus, .ac-textarea:focus {
    border-color: ${THEME.brand}; box-shadow: 0 0 0 3px ${THEME.brand}18;
  }
  .ac-input::placeholder, .ac-textarea::placeholder { color: ${THEME.textLight}; }
  .ac-input.err, .ac-select.err, .ac-textarea.err {
    border-color: ${THEME.errorBorder}; background: ${THEME.errorLight};
  }
  .ac-textarea { resize: vertical; }

  .ac-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
    margin-bottom: 14px;
  }
  .ac-grid.full { grid-template-columns: 1fr; }
  @media (max-width: 520px) { .ac-grid { grid-template-columns: 1fr; } }

  .ac-label {
    display: block; margin-bottom: 5px;
    font-size: 12px; font-weight: 600; color: #434343;
    font-family: 'DM Sans', sans-serif;
  }
  .ac-err-msg { margin: 4px 0 0; font-size: 11px; color: ${THEME.error}; }

  .ac-section-label {
    font-size: 10px; font-weight: 700; color: ${THEME.brandMid};
    text-transform: uppercase; letter-spacing: 0.08em;
    margin: 18px 0 10px; display: flex; align-items: center; gap: 6px;
  }
  .ac-section-label::after {
    content: ''; flex: 1; height: 1px; background: ${THEME.border};
  }

  @keyframes acSpin { to { transform: rotate(360deg); } }
  .ac-btn-spinner {
    width: 13px; height: 13px; border-radius: 50%;
    border: 2px solid #ffffff88; border-top-color: #fff;
    animation: acSpin 0.7s linear infinite; display: inline-block;
  }
`;

const EMPTY_FORM = {
  first_name: "", company_name: "", email: "", phone: "",
  gst: "", country: "", state: "", city: "",
  zip_code: "", address: "", password: "", confirmpassword: "", source: "",
};

// ─────────────────────────────────────────────
//  🧩  ATOMS
// ─────────────────────────────────────────────
function PrimaryBtn({ children, type = "button", onClick, disabled }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type={type} onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: "9px 22px", borderRadius: 10, border: "none",
        background: disabled ? "#C4C4C4" : hov ? THEME.brandDark : THEME.brand,
        color: "#fff", fontSize: 13, fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "'Sora', sans-serif", transition: "all 0.18s",
        boxShadow: disabled ? "none" : `0 2px 8px ${THEME.brand}44`,
        display: "inline-flex", alignItems: "center", gap: 6,
      }}
    >{children}</button>
  );
}

function SecondaryBtn({ children, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button" onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: "9px 22px", borderRadius: 10,
        border: `1.5px solid ${hov ? THEME.brand : "#E0D5C5"}`,
        background: hov ? THEME.brandLight : "#fff",
        color: hov ? THEME.brand : "#595959",
        fontSize: 13, fontWeight: 600, cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif", transition: "all 0.18s",
      }}
    >{children}</button>
  );
}

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="ac-label">
        {label}{required && <span style={{ color: THEME.error, marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {error && <p className="ac-err-msg">{error}</p>}
    </div>
  );
}

function SectionLabel({ children }) {
  return <div className="ac-section-label">{children}</div>;
}

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const AddModal = ({ show, handleClose, onSuccess }) => {
  const [formData,   setFormData]   = useState(EMPTY_FORM);
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPass,   setShowPass]   = useState(false);

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p)   => ({ ...p, [e.target.name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.first_name.trim())                          newErrors.first_name      = "Name is required";
    if (!formData.password)                                   newErrors.password        = "Password is required";
    if (!formData.confirmpassword)                            newErrors.confirmpassword = "Confirm password is required";
    if (formData.password !== formData.confirmpassword)       newErrors.confirmpassword = "Passwords do not match";
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    setErrors({});

    try {
      setSubmitting(true);
      const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };
      const res    = await ApiService(formData, 0, header, insertClient.method, insertClient.url);

      if (res.status === 201 && !res.data.error) {
        toast.success(res.data.message || "Client added successfully");
        handleClose();
        onSuccess?.();
        setFormData(EMPTY_FORM);
      } else {
        toast.error(res.data?.message || "An error occurred");
      }
    } catch (err) {
      console.error(err);
      // Handle HTTP error responses (4xx / 5xx) — axios throws on non-2xx
      if (err?.response) {
        const { status, data } = err.response;
        if (status === 409) {
          toast.error(data?.message || "Email is already registered. Please use a different email.");
        } else {
          toast.error(data?.message || "An error occurred. Please try again.");
        }
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;

  const inp = (name, type = "text", placeholder = "") => (
    <input
      className={`ac-input ${errors[name] ? "err" : ""}`}
      type={type} name={name}
      value={formData[name]} onChange={handleChange}
      placeholder={placeholder}
    />
  );

  return (
    <>
      <style>{MODAL_CSS}</style>

      <div className="ac-backdrop" onClick={handleClose}>
        <div className="ac-dialog" onClick={(e) => e.stopPropagation()}>

          {/* ── Header ── */}
          <div className="ac-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 3, height: 20, borderRadius: 2,
                background: `linear-gradient(180deg, ${THEME.brand} 0%, ${THEME.brandMid} 100%)`,
              }} />
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: THEME.text, fontFamily: "'Sora', sans-serif" }}>
                Add Client
              </h2>
            </div>
            <button onClick={handleClose} style={{
              width: 32, height: 32, borderRadius: 8,
              border: `1.5px solid ${THEME.border}`, background: "#fff",
              cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 18, color: THEME.textMuted,
              lineHeight: 1, transition: "all 0.15s",
            }}>×</button>
          </div>

          {/* ── Body ── */}
          <form onSubmit={handleSubmit}>
            <div className="ac-body">

              {/* Basic info */}
              <SectionLabel>Basic Info</SectionLabel>
              <div className="ac-grid">
                <Field label="Full Name" required error={errors.first_name}>
                  {inp("first_name", "text", "Enter full name")}
                </Field>
                <Field label="Company Name">
                  {inp("company_name", "text", "Enter company name")}
                </Field>
              </div>

              <div className="ac-grid">
                <Field label="Email">
                  {inp("email", "email", "email@example.com")}
                </Field>
                <Field label="Phone No.">
                  {inp("phone", "text", "+91 00000 00000")}
                </Field>
              </div>

              <div className="ac-grid">
                <Field label="GST No.">
                  {inp("gst", "text", "Enter GST number")}
                </Field>
                <Field label="Source">
                  <select
                    className={`ac-select ${errors.source ? "err" : ""}`}
                    name="source" value={formData.source} onChange={handleChange}
                  >
                    <option value="">— Select source —</option>
                    <option value="Website">Website</option>
                    <option value="Events">Events</option>
                    <option value="References">References</option>
                  </select>
                </Field>
              </div>

              {/* Address */}
              <SectionLabel>Address</SectionLabel>
              <div className="ac-grid">
                <Field label="Country">{inp("country", "text", "Country")}</Field>
                <Field label="State">{inp("state",   "text", "State")}</Field>
              </div>
              <div className="ac-grid">
                <Field label="City">{inp("city",     "text", "City")}</Field>
                <Field label="Zip Code">{inp("zip_code","text","Zip / PIN")}</Field>
              </div>
              <div className="ac-grid full" style={{ marginBottom: 14 }}>
                <Field label="Full Address">
                  <textarea
                    className="ac-textarea"
                    name="address" rows={3}
                    value={formData.address} onChange={handleChange}
                    placeholder="Street, Area, Landmark…"
                  />
                </Field>
              </div>

              {/* Security */}
              <SectionLabel>Security</SectionLabel>
              <div className="ac-grid">
                <Field label="Password" required error={errors.password}>
                  <div style={{ position: "relative" }}>
                    {inp("password", showPass ? "text" : "password", "••••••••")}
                    <button
                      type="button"
                      onClick={() => setShowPass((p) => !p)}
                      style={{
                        position: "absolute", right: 10, top: "50%",
                        transform: "translateY(-50%)", background: "none",
                        border: "none", cursor: "pointer", fontSize: 14,
                        color: THEME.textMuted, padding: 0,
                      }}
                    >
                      {showPass ? "🙈" : "👁"}
                    </button>
                  </div>
                </Field>
                <Field label="Confirm Password" required error={errors.confirmpassword}>
                  {inp("confirmpassword", showPass ? "text" : "password", "••••••••")}
                </Field>
              </div>

            </div>

            {/* ── Footer ── */}
            <div className="ac-footer">
              <SecondaryBtn onClick={handleClose}>Cancel</SecondaryBtn>
              <PrimaryBtn type="submit" disabled={submitting}>
                {submitting ? <><span className="ac-btn-spinner" /> Saving…</> : "✓ Add Client"}
              </PrimaryBtn>
            </div>
          </form>

        </div>
      </div>
    </>
  );
};

export default AddModal;