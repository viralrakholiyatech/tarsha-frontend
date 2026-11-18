import React, { useState, useEffect, useCallback, useRef } from "react";
import ApiService from "../../../../services/ApiService";
import { addledger, getledgergroup } from "../../../../config/config";
import { getToken } from "../../../../services/useLocalStorage";
import toast from "react-hot-toast";

const THEME = {
  brand: "#887549",
  brandLight: "#F5F0E8",
  brandMid: "#C4A97D",
  brandDark: "#5C4E32",
  border: "#EDE5D5",
  text: "#1A1A2E",
  textMuted: "#ADADAD",
  textLight: "#BDBDBD",
  error: "#CF1322",
  errorLight: "#FFF1F0",
  errorBorder: "#FFA39E",
};

const MODAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }

  .av-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45); z-index: 1040;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .av-dialog {
    background: #fff; border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.18);
    width: 100%; max-width: 420px;
    display: flex; flex-direction: column;
    font-family: 'DM Sans', sans-serif; overflow: hidden;
  }
  .av-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px; border-bottom: 1px solid ${THEME.border};
    background: #FDFAF5; flex-shrink: 0;
  }
  .av-body   { padding: 22px 24px; display: flex; flex-direction: column; gap: 18px; }
  .av-footer {
    display: flex; align-items: center; justify-content: flex-end;
    gap: 10px; padding: 14px 24px;
    border-top: 1px solid ${THEME.border};
  }

  .av-label {
    display: block; margin-bottom: 6px;
    font-size: 13px; font-weight: 600;
    color: #434343; font-family: 'DM Sans', sans-serif;
  }

  .av-input, .av-select {
    width: 100%; padding: 9px 12px; border-radius: 10px;
    border: 1.5px solid #E0D5C5; font-size: 13px;
    font-family: 'DM Sans', sans-serif; color: ${THEME.text};
    outline: none; background: #fff;
    transition: border-color 0.15s, box-shadow 0.15s;
    appearance: none; -webkit-appearance: none;
  }
  .av-input:focus, .av-select:focus {
    border-color: ${THEME.brand};
    box-shadow: 0 0 0 3px ${THEME.brand}18;
  }
  .av-input.err, .av-select.err {
    border-color: ${THEME.errorBorder};
    background: ${THEME.errorLight};
  }
  .av-input::placeholder { color: ${THEME.textLight}; }
  .av-input:disabled, .av-select:disabled {
    background: #F5F5F5; color: ${THEME.textMuted}; cursor: not-allowed;
  }

  .av-select-wrap {
    position: relative;
  }
  .av-select-wrap::after {
    content: '';
    position: absolute; right: 12px; top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 5px solid ${THEME.brandMid};
  }

  .av-err-text {
    margin: 4px 0 0; font-size: 11px; color: ${THEME.error};
  }

  @keyframes avSpin { to { transform: rotate(360deg); } }
  .av-btn-spinner {
    width: 13px; height: 13px; border-radius: 50%;
    border: 2px solid #ffffff88; border-top-color: #fff;
    animation: avSpin 0.7s linear infinite; display: inline-block;
  }
  .av-skeleton {
    height: 38px; border-radius: 10px;
    background: linear-gradient(90deg, #F0EBE1 25%, #FAF7F2 50%, #F0EBE1 75%);
    background-size: 200% 100%;
    animation: avShimmer 1.2s infinite;
  }
  @keyframes avShimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  input[type="checkbox"]:checked::after {
  content: '';
  position: absolute; left: 5px; top: 2px;
  width: 6px; height: 10px;
  border: 2px solid #fff; border-top: none; border-left: none;
  transform: rotate(45deg);
}
`;

// ─────────────────────────────────────────────
//  🧩  ATOMS
// ─────────────────────────────────────────────
function PrimaryBtn({ children, type = "button", onClick, disabled }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "9px 22px",
        borderRadius: 10,
        border: "none",
        background: disabled ? "#C4C4C4" : hov ? THEME.brandDark : THEME.brand,
        color: "#fff",
        fontSize: 13,
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "'Sora', sans-serif",
        transition: "all 0.18s",
        boxShadow: disabled ? "none" : `0 2px 8px ${THEME.brand}44`,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      {children}
    </button>
  );
}

function SecondaryBtn({ children, onClick, disabled }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "9px 22px",
        borderRadius: 10,
        border: `1.5px solid ${hov ? THEME.brand : "#E0D5C5"}`,
        background: hov ? THEME.brandLight : "#fff",
        color: hov ? THEME.brand : "#595959",
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "'DM Sans', sans-serif",
        transition: "all 0.18s",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const AddModal = ({ show, handleClose, onSuccess }) => {
  const [formData, setFormData] = useState({ name: "", ledger_group_id: "" });
  const [errors, setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [groups, setGroups]     = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const nameRef = useRef(null);
  const [whatsapp, setWhatsapp] = useState(false);

  // ── Build auth header ──────────────────────
  const getHeader = () => ({
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  });

  // ── Fetch ledger groups on open ────────────
  const fetchGroups = useCallback(async () => {
    setGroupsLoading(true);
    try {
      const res = await ApiService(
        null,
        0,
        getHeader(),
        getledgergroup.method,
        getledgergroup.url
      );
      if (!res.data.error) {
        setGroups(res.data?.data || []);
      } else {
        toast.error(res.data?.message || "Failed to load ledger groups.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load ledger groups.");
    } finally {
      setGroupsLoading(false);
    }
  }, []);

  // ── Reset + fetch whenever modal opens ────
  useEffect(() => {
    if (!show) return;
    setFormData({ name: "", ledger_group_id: "" });
    setErrors({});
    fetchGroups();
    setWhatsapp(false);
    setTimeout(() => nameRef.current?.focus(), 120);
  }, [show, fetchGroups]);

  // ── Escape to close ───────────────────────
  useEffect(() => {
    if (!show) return;
    const onKey = (e) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show, handleClose]);

  // ── Field change ──────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  // ── Validation ────────────────────────────
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim())
      newErrors.name = "Ledger name is required.";
    else if (formData.name.trim().length < 2)
      newErrors.name = "Name must be at least 2 characters.";

    if (!formData.ledger_group_id)
      newErrors.ledger_group_id = "Please select a ledger group.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ────────────────────────────────
  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const body = {
        name: formData.name.trim(),
        ledger_group_id: formData.ledger_group_id,
          whatsapp: whatsapp ? 1 : 0,

      };

      const res = await ApiService(
        body,
        0,
        getHeader(),
        addledger.method,
        addledger.url
      );

      if (!res.data.error) {
        toast.success(res.data?.message || "Ledger added successfully!");
        onSuccess?.();
        handleClose();
      } else {
        toast.error(res.data?.message || "Failed to add ledger.");
      }
    } catch (err) {
      console.error("Add ledger error:", err);
      toast.error(
        err?.response?.data?.message || err?.message || "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <>
      <style>{MODAL_CSS}</style>

      <div
        className="av-backdrop"
        onMouseDown={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      >
        <div className="av-dialog">

          {/* ── Header ── */}
          <div className="av-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 3, height: 20, borderRadius: 2,
                  background: `linear-gradient(180deg, ${THEME.brand} 0%, ${THEME.brandMid} 100%)`,
                }}
              />
              <h2
                style={{
                  margin: 0, fontSize: 16, fontWeight: 700,
                  color: THEME.text, fontFamily: "'Sora', sans-serif",
                }}
              >
                Add Ledger
              </h2>
            </div>
            <button
              onClick={handleClose}
              style={{
                width: 32, height: 32, borderRadius: 8,
                border: `1.5px solid ${THEME.border}`,
                background: "#fff", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, color: THEME.textMuted, lineHeight: 1,
                transition: "all 0.15s",
              }}
            >
              ×
            </button>
          </div>

          {/* ── Body ── */}
          <form onSubmit={handleSubmit}>
            <div className="av-body">

              {/* Ledger Group Dropdown */}
              <div>
                <label className="av-label">
                  Ledger Group
                  <span style={{ color: THEME.error, marginLeft: 3 }}>*</span>
                </label>

                {groupsLoading ? (
                  <div className="av-skeleton" />
                ) : (
                  <div className="av-select-wrap">
                    <select
                      className={`av-select${errors.ledger_group_id ? " err" : ""}`}
                      name="ledger_group_id"
                      value={formData.ledger_group_id}
                      onChange={handleChange}
                      disabled={submitting}
                    >
                      <option value="">— Select a group —</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {errors.ledger_group_id && (
                  <p className="av-err-text">{errors.ledger_group_id}</p>
                )}
              </div>

              {/* Ledger Name */}
              <div>
                <label className="av-label">
                  Ledger Name
                  <span style={{ color: THEME.error, marginLeft: 3 }}>*</span>
                </label>
                <input
                  ref={nameRef}
                  className={`av-input${errors.name ? " err" : ""}`}
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter ledger name…"
                  disabled={submitting}
                  maxLength={100}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
                />
                {errors.name && (
                  <p className="av-err-text">{errors.name}</p>
                )}
              </div>


              {/* WhatsApp */}
<div>
  <label className="av-label">WhatsApp</label>
  <label
    style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "13px 16px", borderRadius: 12,
      border: `1.5px solid ${whatsapp ? "#25D366" : "#E0D5C5"}`,
      background: whatsapp ? "#F0FBF4" : "#FDFAF5",
      cursor: "pointer", userSelect: "none",
      transition: "all 0.15s",
    }}
  >
    <input
      type="checkbox"
      checked={whatsapp}
      onChange={(e) => setWhatsapp(e.target.checked)}
      disabled={submitting}
      style={{
        appearance: "none", WebkitAppearance: "none",
        width: 20, height: 20, borderRadius: 6, flexShrink: 0,
        border: `2px solid ${whatsapp ? "#25D366" : "#C4A97D"}`,
        background: whatsapp ? "#25D366" : "#fff",
        cursor: "pointer", position: "relative",
        transition: "all 0.15s",
      }}
    />
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill={whatsapp ? "#25D366" : THEME.textMuted}>
          <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.41A9.945 9.945 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Zm5.093 13.857c-.214.601-1.257 1.148-1.715 1.18-.44.031-.855.21-2.88-.6-2.43-.978-3.984-3.46-4.104-3.619-.12-.16-.975-1.297-.975-2.473 0-1.177.614-1.756.832-1.995.217-.24.474-.3.632-.3l.455.009c.146.006.341-.056.534.408.199.479.678 1.656.738 1.776.06.12.099.26.019.42-.08.16-.12.26-.238.4-.12.14-.252.313-.36.42-.12.12-.244.25-.105.49.14.24.62 1.024 1.33 1.658.915.814 1.686 1.066 1.924 1.186.238.12.377.1.516-.06.14-.16.598-.698.758-.938.16-.24.319-.2.538-.12.22.08 1.397.659 1.636.779.24.12.399.18.458.28.06.099.06.579-.153 1.18Z" />
        </svg>
        <span style={{ fontSize: 13, fontWeight: 600, color: whatsapp ? "#1B5E20" : THEME.text }}>
          Enable WhatsApp
        </span>
        {whatsapp && (
          <span style={{ fontSize: 10, fontWeight: 700, color: "#25D366", background: "#E8F5E9", padding: "2px 7px", borderRadius: 20, border: "1px solid #A5D6A7" }}>
            ON
          </span>
        )}
      </div>
      <p style={{ margin: "3px 0 0", fontSize: 11, color: THEME.textMuted }}>
        Send WhatsApp notifications for this ledger
      </p>
    </div>
  </label>
</div>

            </div>

            {/* ── Footer ── */}
            <div className="av-footer">
              <SecondaryBtn onClick={handleClose} disabled={submitting}>
                Cancel
              </SecondaryBtn>
              <PrimaryBtn type="submit" disabled={submitting || groupsLoading}>
                {submitting ? (
                  <>
                    <span className="av-btn-spinner" /> Saving…
                  </>
                ) : (
                  "✓ Add Ledger"
                )}
              </PrimaryBtn>
            </div>
          </form>

        </div>
      </div>
    </>
  );
};

export default AddModal;