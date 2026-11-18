import React, { useEffect, useState } from "react";
import ApiService from "../../../services/ApiService";
import { updateClient } from "../../../config/config";
import { getToken } from "../../../services/useLocalStorage";
import toast from "react-hot-toast";
import { getCustomerById } from "../../../services/CustomerService";

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

  .ec-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45); z-index: 1040;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .ec-dialog {
    background: #fff; border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.18);
    width: 100%; max-width: 680px; max-height: 90vh;
    display: flex; flex-direction: column;
    font-family: 'DM Sans', sans-serif; overflow: hidden;
  }
  .ec-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px; border-bottom: 1px solid ${THEME.border};
    flex-shrink: 0; background: #FDFAF5;
  }
  .ec-body {
    padding: 22px 24px; overflow-y: auto; flex: 1;
  }
  .ec-body::-webkit-scrollbar { width: 4px; }
  .ec-body::-webkit-scrollbar-thumb { background: ${THEME.brandMid}; border-radius: 4px; }
  .ec-footer {
    display: flex; align-items: center; justify-content: flex-end;
    gap: 10px; padding: 14px 24px;
    border-top: 1px solid ${THEME.border}; flex-shrink: 0;
  }

  .ec-input, .ec-select, .ec-textarea {
    width: 100%; padding: 9px 12px; border-radius: 10px;
    border: 1.5px solid #E0D5C5; font-size: 13px;
    font-family: 'DM Sans', sans-serif; color: ${THEME.text};
    outline: none; background: #fff; appearance: auto;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .ec-input:focus, .ec-select:focus, .ec-textarea:focus {
    border-color: ${THEME.brand}; box-shadow: 0 0 0 3px ${THEME.brand}18;
  }
  .ec-input::placeholder, .ec-textarea::placeholder { color: ${THEME.textLight}; }
  .ec-textarea { resize: vertical; }

  .ec-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 14px; margin-bottom: 14px;
  }
  .ec-grid.full { grid-template-columns: 1fr; }
  @media (max-width: 520px) { .ec-grid { grid-template-columns: 1fr; } }

  .ec-label {
    display: block; margin-bottom: 5px;
    font-size: 12px; font-weight: 600; color: #434343;
    font-family: 'DM Sans', sans-serif;
  }

  .ec-section-label {
    font-size: 10px; font-weight: 700; color: ${THEME.brandMid};
    text-transform: uppercase; letter-spacing: 0.08em;
    margin: 18px 0 10px; display: flex; align-items: center; gap: 6px;
  }
  .ec-section-label::after {
    content: ''; flex: 1; height: 1px; background: ${THEME.border};
  }

  @keyframes ecSpin { to { transform: rotate(360deg); } }
  .ec-spinner {
    width: 26px; height: 26px; border-radius: 50%;
    border: 3px solid ${THEME.brandLight}; border-top-color: ${THEME.brand};
    animation: ecSpin 0.8s linear infinite;
    margin: 48px auto; display: block;
  }
  .ec-btn-spinner {
    width: 13px; height: 13px; border-radius: 50%;
    border: 2px solid #ffffff88; border-top-color: #fff;
    animation: ecSpin 0.7s linear infinite; display: inline-block;
  }
`;

const EMPTY_FORM = {
  first_name: "", company_name: "", email: "", phone: "",
  gst: "", country: "", state: "", city: "",
  zip_code: "", address: "", password: "", source: "", id: "",
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

function Field({ label, children }) {
  return (
    <div>
      <label className="ec-label">{label}</label>
      {children}
    </div>
  );
}

function SectionLabel({ children }) {
  return <div className="ec-section-label">{children}</div>;
}

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const EditModal = ({ editshow, handleeditClose, clientId, onSuccess }) => {
  const [formData,   setFormData]   = useState(EMPTY_FORM);
  const [loading,    setLoading]    = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPass,   setShowPass]   = useState(false);

  useEffect(() => {
    if (editshow && clientId) {
      const fetchClientData = async () => {
        try {
          setLoading(true);
          const res = await getCustomerById(clientId, getToken());
          if (
            (res.status === 200 || res.status === 201) &&
            res.data?.data?.length > 0
          ) {
            const d = res.data.data[0];
            setFormData({
              id:           d.id           || "",
              first_name:   d.first_name   || "",
              company_name: d.company_name || "",
              email:        d.email        || "",
              phone:        d.phone        || "",
              gst:          d.gst          || "",
              country:      d.country      || "",
              state:        d.state        || "",
              city:         d.city         || "",
              zip_code:     d.zip_code     || "",
              address:      d.address      || "",
              source:       d.source       || "",
              password:     "",
            });
          } else {
            toast.error("Failed to fetch client data");
          }
        } catch (err) {
          console.error(err);
          toast.error("An unexpected error occurred.");
        } finally {
          setLoading(false);
        }
      };
      fetchClientData();
    }
  }, [editshow, clientId]);

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };
      const res    = await ApiService(formData, 0, header, updateClient.method, updateClient.url);

      if (res.status === 201 && !res.data.error) {
        toast.success(res.data.message || "Client updated successfully");
        handleeditClose();
        onSuccess?.();
        setFormData(EMPTY_FORM);
      } else {
        toast.error(res.data?.message || "An error occurred");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!editshow) return null;

  const inp = (name, type = "text", placeholder = "") => (
    <input
      className="ec-input" type={type}
      name={name} value={formData[name]}
      onChange={handleChange} placeholder={placeholder}
    />
  );

  return (
    <>
      <style>{MODAL_CSS}</style>

      <div className="ec-backdrop" onClick={handleeditClose}>
        <div className="ec-dialog" onClick={(e) => e.stopPropagation()}>

          {/* ── Header ── */}
          <div className="ec-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 3, height: 20, borderRadius: 2,
                background: `linear-gradient(180deg, ${THEME.brand} 0%, ${THEME.brandMid} 100%)`,
              }} />
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: THEME.text, fontFamily: "'Sora', sans-serif" }}>
                Edit Client
              </h2>
            </div>
            <button onClick={handleeditClose} style={{
              width: 32, height: 32, borderRadius: 8,
              border: `1.5px solid ${THEME.border}`, background: "#fff",
              cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 18, color: THEME.textMuted,
              lineHeight: 1, transition: "all 0.15s",
            }}>×</button>
          </div>

          {/* ── Body ── */}
          <form onSubmit={handleSubmit}>
            <div className="ec-body">
              {loading ? (
                <div className="ec-spinner" />
              ) : (
                <>
                  {/* Basic info */}
                  <SectionLabel>Basic Info</SectionLabel>
                  <div className="ec-grid">
                    <Field label="Full Name">{inp("first_name", "text", "Enter full name")}</Field>
                    <Field label="Company Name">{inp("company_name", "text", "Enter company name")}</Field>
                  </div>
                  <div className="ec-grid">
                    <Field label="Email">{inp("email", "email", "email@example.com")}</Field>
                    <Field label="Phone No.">{inp("phone", "text", "+91 00000 00000")}</Field>
                  </div>
                  <div className="ec-grid">
                    <Field label="GST No.">{inp("gst", "text", "Enter GST number")}</Field>
                    <Field label="Source">
                      <select
                        className="ec-select"
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
                  <div className="ec-grid">
                    <Field label="Country">{inp("country", "text", "Country")}</Field>
                    <Field label="State">{inp("state", "text", "State")}</Field>
                  </div>
                  <div className="ec-grid">
                    <Field label="City">{inp("city", "text", "City")}</Field>
                    <Field label="Zip Code">{inp("zip_code", "text", "Zip / PIN")}</Field>
                  </div>
                  <div className="ec-grid full" style={{ marginBottom: 14 }}>
                    <Field label="Full Address">
                      <textarea
                        className="ec-textarea"
                        name="address" rows={3}
                        value={formData.address} onChange={handleChange}
                        placeholder="Street, Area, Landmark…"
                      />
                    </Field>
                  </div>

                  {/* Security */}
                  <SectionLabel>Security</SectionLabel>
                  <div className="ec-grid">
                    <Field label="New Password (leave blank to keep current)">
                      <div style={{ position: "relative" }}>
                        <input
                          className="ec-input"
                          type={showPass ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Enter new password…"
                        />
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
                  </div>
                </>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="ec-footer">
              <SecondaryBtn onClick={handleeditClose}>Cancel</SecondaryBtn>
              <PrimaryBtn type="submit" disabled={submitting || loading}>
                {submitting
                  ? <><span className="ec-btn-spinner" /> Saving…</>
                  : "✓ Save Changes"}
              </PrimaryBtn>
            </div>
          </form>

        </div>
      </div>
    </>
  );
};

export default EditModal;