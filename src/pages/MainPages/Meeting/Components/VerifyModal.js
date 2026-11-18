import React, { useState } from "react";
import ApiService from "../../../../services/ApiService";
import { getToken } from "../../../../services/useLocalStorage";
import toast from "react-hot-toast";
import { verifiedtask } from "../../../../config/config";

const THEME = {
  brand:      "#887549",
  brandLight: "#F5F0E8",
  brandMid:   "#C4A97D",
  brandDark:  "#5C4E32",
  border:     "#EDE5D5",
  text:       "#1A1A2E",
  textMuted:  "#ADADAD",
  textLight:  "#BDBDBD",
  success:    "#389E0D",
  successBg:  "#F6FFED",
  successBorder: "#B7EB8F",
};

const MODAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }

  .vm-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45); z-index: 1040;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .vm-dialog {
    background: #fff; border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.18);
    width: 100%; max-width: 420px;
    display: flex; flex-direction: column;
    font-family: 'DM Sans', sans-serif; overflow: hidden;
  }
  .vm-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px; border-bottom: 1px solid ${THEME.border};
    background: #FDFAF5; flex-shrink: 0;
  }
  .vm-body   { padding: 22px 24px; }
  .vm-footer {
    display: flex; align-items: center; justify-content: flex-end;
    gap: 10px; padding: 14px 24px;
    border-top: 1px solid ${THEME.border};
  }

  .vm-textarea {
    width: 100%; padding: 9px 12px; border-radius: 10px;
    border: 1.5px solid #E0D5C5; font-size: 13px;
    font-family: 'DM Sans', sans-serif; color: ${THEME.text};
    outline: none; background: #fff; resize: vertical;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .vm-textarea:focus {
    border-color: ${THEME.brand};
    box-shadow: 0 0 0 3px ${THEME.brand}18;
  }
  .vm-textarea::placeholder { color: ${THEME.textLight}; }

  @keyframes vmSpin { to { transform: rotate(360deg); } }
  .vm-btn-spinner {
    width: 13px; height: 13px; border-radius: 50%;
    border: 2px solid #ffffff88; border-top-color: #fff;
    animation: vmSpin 0.7s linear infinite; display: inline-block;
  }
`;

// ─────────────────────────────────────────────
//  🧩  ATOMS
// ─────────────────────────────────────────────
function ConfirmBtn({ children, type = "button", onClick, disabled }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type={type} onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: "9px 22px", borderRadius: 10, border: "none",
        background: disabled ? "#C4C4C4" : hov ? "#2A7D0A" : THEME.success,
        color: "#fff", fontSize: 13, fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "'Sora', sans-serif", transition: "all 0.18s",
        boxShadow: disabled ? "none" : `0 2px 8px ${THEME.success}44`,
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
const VerifyModal = ({ show, handleClose, id, onSuccess }) => {
  const [remark,     setRemark]     = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleModalClose = () => { setRemark(""); handleClose(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };
      const res    = await ApiService({ remark: remark.trim() }, id, header, verifiedtask.method, verifiedtask.url);

      if (res.status === 200 && !res.data.error) {
        toast.success(res.data.message || "Verified successfully");
        setRemark("");
        handleClose();
        onSuccess?.();
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

      <div className="vm-backdrop" onClick={handleModalClose}>
        <div className="vm-dialog" onClick={(e) => e.stopPropagation()}>

          {/* ── Header ── */}
          <div className="vm-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 3, height: 20, borderRadius: 2,
                background: `linear-gradient(180deg, ${THEME.success} 0%, #52C41A 100%)`,
              }} />
              <h2 style={{
                margin: 0, fontSize: 16, fontWeight: 700,
                color: THEME.text, fontFamily: "'Sora', sans-serif",
              }}>
                Verify Task
              </h2>
            </div>
            <button
              onClick={handleModalClose}
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
            <div className="vm-body">

              {/* Confirm message */}
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "12px 14px", borderRadius: 10,
                background: THEME.successBg, border: `1px solid ${THEME.successBorder}`,
                marginBottom: 18,
              }}>
                <span style={{ fontSize: 18, lineHeight: 1, marginTop: 1 }}>✅</span>
                <p style={{
                  margin: 0, fontSize: 13, color: THEME.success,
                  fontWeight: 600, lineHeight: 1.5,
                }}>
                  Are you sure you want to verify this task?
                  This action cannot be undone.
                </p>
              </div>

              {/* Remark */}
              <label style={{
                display: "block", marginBottom: 6,
                fontSize: 13, fontWeight: 600, color: "#434343",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                Remark
                <span style={{ fontSize: 11, fontWeight: 400, color: THEME.textMuted, marginLeft: 6 }}>
                  (optional)
                </span>
              </label>
              <textarea
                className="vm-textarea"
                rows={3}
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="Add a remark…"
              />

            </div>

            {/* ── Footer ── */}
            <div className="vm-footer">
              <SecondaryBtn onClick={handleModalClose}>Cancel</SecondaryBtn>
              <ConfirmBtn type="submit" disabled={submitting}>
                {submitting
                  ? <><span className="vm-btn-spinner" /> Verifying…</>
                  : "✓ Yes, Verify"}
              </ConfirmBtn>
            </div>
          </form>

        </div>
      </div>
    </>
  );
};

export default VerifyModal;