import React, { useState } from "react";
import ApiService from "../../../../services/ApiService";
import { addFees } from "../../../../config/config";
import { getToken } from "../../../../services/useLocalStorage";
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

  .af2-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45); z-index: 1040;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .af2-dialog {
    background: #fff; border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.18);
    width: 100%; max-width: 440px;
    display: flex; flex-direction: column;
    font-family: 'DM Sans', sans-serif; overflow: hidden;
  }
  .af2-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px; border-bottom: 1px solid ${THEME.border};
    background: #FDFAF5; flex-shrink: 0;
  }
  .af2-body {
    padding: 22px 24px;
    display: flex; flex-direction: column; gap: 14px;
  }
  .af2-footer {
    display: flex; align-items: center; justify-content: flex-end;
    gap: 10px; padding: 14px 24px;
    border-top: 1px solid ${THEME.border};
  }

  .af2-input, .af2-select {
    width: 100%; padding: 9px 12px; border-radius: 10px;
    border: 1.5px solid #E0D5C5; font-size: 13px;
    font-family: 'DM Sans', sans-serif; color: ${THEME.text};
    outline: none; background: #fff; appearance: auto;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .af2-input:focus, .af2-select:focus {
    border-color: ${THEME.brand};
    box-shadow: 0 0 0 3px ${THEME.brand}18;
  }
  .af2-input::placeholder { color: ${THEME.textLight}; }
  .af2-input.err { border-color: ${THEME.errorBorder}; background: ${THEME.errorLight}; }

  .af2-label {
    display: block; margin-bottom: 5px;
    font-size: 12px; font-weight: 600; color: #434343;
    font-family: 'DM Sans', sans-serif;
  }

  /* Status pills */
  .af2-status-group { display: flex; gap: 8px; }
  .af2-status-pill {
    flex: 1; padding: 9px 8px; border-radius: 10px;
    border: 1.5px solid #E0D5C5; background: #fff;
    cursor: pointer; transition: all 0.15s;
    font-size: 12px; font-weight: 600;
    font-family: 'DM Sans', sans-serif; color: #595959;
    text-align: center;
  }
  .af2-status-pill.pending.active  { background: #FFFBE6; border-color: #FFE58F; color: #D48806; }
  .af2-status-pill.approved.active { background: #F6FFED; border-color: #B7EB8F; color: #389E0D; }
  .af2-status-pill.rejected.active { background: ${THEME.errorLight}; border-color: ${THEME.errorBorder}; color: ${THEME.error}; }

  @keyframes af2Spin { to { transform: rotate(360deg); } }
  .af2-btn-spinner {
    width: 13px; height: 13px; border-radius: 50%;
    border: 2px solid #ffffff88; border-top-color: #fff;
    animation: af2Spin 0.7s linear infinite; display: inline-block;
  }
`;

const EMPTY = { price: "", status: "0", remark: "" };

const STATUS_OPTIONS = [
  { value: "0", label: "⏳ Pending",  cls: "pending"  },
  { value: "1", label: "✅ Approved", cls: "approved" },
  { value: "2", label: "❌ Rejected", cls: "rejected" },
];

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
const AddFeesModal = ({ show, handleClose, id, onSuccess }) => {
  const [formData,   setFormData]   = useState(EMPTY);
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p)   => ({ ...p, [e.target.name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.price.trim()) newErrors.price = "Price is required";
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    setErrors({});

    try {
      setSubmitting(true);
      const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };
      const res    = await ApiService(
        { ...formData, Id: id }, 0, header, addFees.method, addFees.url
      );
      if (res.status === 201 && !res.data.error) {
        toast.success(res.data.message || "Fees added successfully");
        handleClose();
        onSuccess?.();
        setFormData(EMPTY);
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

      <div className="af2-backdrop" onClick={handleClose}>
        <div className="af2-dialog" onClick={(e) => e.stopPropagation()}>

          {/* ── Header ── */}
          <div className="af2-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 3, height: 20, borderRadius: 2,
                background: `linear-gradient(180deg, ${THEME.brand} 0%, ${THEME.brandMid} 100%)`,
              }} />
              <div>
                <h2 style={{
                  margin: 0, fontSize: 16, fontWeight: 700,
                  color: THEME.text, fontFamily: "'Sora', sans-serif",
                }}>
                  Add Fees
                </h2>
                <p style={{ margin: 0, fontSize: 11, color: THEME.textMuted }}>
                  Enter fee amount and approval status
                </p>
              </div>
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
            <div className="af2-body">

              {/* Price */}
              <div>
                <label className="af2-label">
                  Price (₹)
                  <span style={{ color: THEME.error, marginLeft: 3 }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{
                    position: "absolute", left: 10, top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 13, fontWeight: 700, color: THEME.brandMid,
                    pointerEvents: "none",
                  }}>₹</span>
                  <input
                    className={`af2-input ${errors.price ? "err" : ""}`}
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    style={{ paddingLeft: 26 }}
                  />
                </div>
                {errors.price && (
                  <p style={{ margin: "4px 0 0", fontSize: 11, color: THEME.error }}>
                    {errors.price}
                  </p>
                )}
              </div>

              {/* Status pills */}
              <div>
                <label className="af2-label">Status</label>
                <div className="af2-status-group">
                  {STATUS_OPTIONS.map((opt) => (
                    <div
                      key={opt.value}
                      className={`af2-status-pill ${opt.cls} ${formData.status === opt.value ? "active" : ""}`}
                      onClick={() => setFormData((p) => ({ ...p, status: opt.value }))}
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Remark */}
              <div>
                <label className="af2-label">Remark</label>
                <input
                  className="af2-input"
                  type="text"
                  name="remark"
                  value={formData.remark}
                  onChange={handleChange}
                  placeholder="Add a remark…"
                />
              </div>

            </div>

            {/* ── Footer ── */}
            <div className="af2-footer">
              <SecondaryBtn onClick={handleClose}>Cancel</SecondaryBtn>
              <PrimaryBtn type="submit" disabled={submitting}>
                {submitting
                  ? <><span className="af2-btn-spinner" /> Saving…</>
                  : "✓ Add Fees"}
              </PrimaryBtn>
            </div>
          </form>

        </div>
      </div>
    </>
  );
};

export default AddFeesModal;