import React, { useEffect, useState } from "react";
import ApiService from "../../../services/ApiService";
import { addTpscheme, getVillage } from "../../../config/config";
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

  .at-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45); z-index: 1040;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .at-dialog {
    background: #fff; border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.18);
    width: 100%; max-width: 480px;
    display: flex; flex-direction: column;
    font-family: 'DM Sans', sans-serif; overflow: hidden;
  }
  .at-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px; border-bottom: 1px solid ${THEME.border};
    background: #FDFAF5; flex-shrink: 0;
  }
  .at-body   { padding: 22px 24px; }
  .at-footer {
    display: flex; align-items: center; justify-content: flex-end;
    gap: 10px; padding: 14px 24px;
    border-top: 1px solid ${THEME.border};
  }

  .at-input, .at-select {
    width: 100%; padding: 9px 12px; border-radius: 10px;
    border: 1.5px solid #E0D5C5; font-size: 13px;
    font-family: 'DM Sans', sans-serif; color: ${THEME.text};
    outline: none; background: #fff; appearance: auto;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .at-input:focus, .at-select:focus {
    border-color: ${THEME.brand};
    box-shadow: 0 0 0 3px ${THEME.brand}18;
  }
  .at-input::placeholder { color: ${THEME.textLight}; }
  .at-input.err, .at-select.err {
    border-color: ${THEME.errorBorder};
    background: ${THEME.errorLight};
  }

  .at-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 14px; margin-bottom: 4px;
  }
  @media (max-width: 480px) { .at-grid { grid-template-columns: 1fr; } }

  .at-label {
    display: block; margin-bottom: 5px;
    font-size: 12px; font-weight: 600; color: #434343;
    font-family: 'DM Sans', sans-serif;
  }
  .at-err { margin: 4px 0 0; font-size: 11px; color: ${THEME.error}; }

  @keyframes atSpin { to { transform: rotate(360deg); } }
  .at-spinner {
    width: 18px; height: 18px; border-radius: 50%;
    border: 2px solid ${THEME.brandLight}; border-top-color: ${THEME.brand};
    animation: atSpin 0.8s linear infinite; display: inline-block;
  }
  .at-btn-spinner {
    width: 13px; height: 13px; border-radius: 50%;
    border: 2px solid #ffffff88; border-top-color: #fff;
    animation: atSpin 0.7s linear infinite; display: inline-block;
  }
`;

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

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const AddModal = ({ show, handleClose, onSuccess }) => {
  const [formData,   setFormData]   = useState({ tpscheme: "", village: "" });
  const [errors,     setErrors]     = useState({});
  const [villages,   setVillages]   = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p)   => ({ ...p, [e.target.name]: "" }));
  };

  const fetchVillage = async () => {
    try {
      setLoading(true);
      const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };
      const res    = await ApiService(null, 0, header, getVillage.method, getVillage.url);
      if (!res.data.error) setVillages(res.data.data || []);
      else toast.error(res.data?.message);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVillage(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.village)        newErrors.village  = "Village is required";
    if (!formData.tpscheme.trim()) newErrors.tpscheme = "TP Scheme is required";
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    setErrors({});

    try {
      setSubmitting(true);
      const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };
      const res    = await ApiService(formData, 0, header, addTpscheme.method, addTpscheme.url);

      if (res.status === 201 && !res.data.error) {
        toast.success(res.data.message || "TP Scheme added successfully");
        handleClose();
        onSuccess?.();
        setFormData({ tpscheme: "", village: "" });
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

  if (!show) return null;

  return (
    <>
      <style>{MODAL_CSS}</style>

      <div className="at-backdrop" onClick={handleClose}>
        <div className="at-dialog" onClick={(e) => e.stopPropagation()}>

          {/* ── Header ── */}
          <div className="at-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 3, height: 20, borderRadius: 2,
                background: `linear-gradient(180deg, ${THEME.brand} 0%, ${THEME.brandMid} 100%)`,
              }} />
              <h2 style={{
                margin: 0, fontSize: 16, fontWeight: 700,
                color: THEME.text, fontFamily: "'Sora', sans-serif",
              }}>
                Add TP Scheme
              </h2>
            </div>
            <button
              onClick={handleClose}
              style={{
                width: 32, height: 32, borderRadius: 8,
                border: `1.5px solid ${THEME.border}`, background: "#fff",
                cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 18, color: THEME.textMuted,
                lineHeight: 1, transition: "all 0.15s",
              }}
            >×</button>
          </div>

          {/* ── Body ── */}
          <form onSubmit={handleSubmit}>
            <div className="at-body">
              <div className="at-grid">

                {/* Village */}
                <div>
                  <label className="at-label">
                    Village
                    <span style={{ color: THEME.error, marginLeft: 3 }}>*</span>
                  </label>
                  {loading ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 0" }}>
                      <span className="at-spinner" />
                      <span style={{ fontSize: 12, color: THEME.textMuted }}>Loading…</span>
                    </div>
                  ) : (
                    <select
                      className={`at-select ${errors.village ? "err" : ""}`}
                      name="village"
                      value={formData.village}
                      onChange={handleChange}
                    >
                      <option value="">— Select village —</option>
                      {villages.map((v) => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  )}
                  {errors.village && <p className="at-err">{errors.village}</p>}
                </div>

                {/* TP Scheme */}
                <div>
                  <label className="at-label">
                    TP Scheme
                    <span style={{ color: THEME.error, marginLeft: 3 }}>*</span>
                  </label>
                  <input
                    className={`at-input ${errors.tpscheme ? "err" : ""}`}
                    type="text"
                    name="tpscheme"
                    value={formData.tpscheme}
                    onChange={handleChange}
                    placeholder="Enter TP scheme…"
                  />
                  {errors.tpscheme && <p className="at-err">{errors.tpscheme}</p>}
                </div>

              </div>
            </div>

            {/* ── Footer ── */}
            <div className="at-footer">
              <SecondaryBtn onClick={handleClose}>Cancel</SecondaryBtn>
              <PrimaryBtn type="submit" disabled={submitting || loading}>
                {submitting
                  ? <><span className="at-btn-spinner" /> Saving…</>
                  : "✓ Add TP Scheme"}
              </PrimaryBtn>
            </div>
          </form>

        </div>
      </div>
    </>
  );
};

export default AddModal;