import React, { useState, useEffect, useCallback } from "react";
import ApiService from "../../../../services/ApiService";
import { addarchVendors, getVendor } from "../../../../config/config";
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

  .avq-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45); z-index: 1040;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .avq-dialog {
    background: #fff; border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.18);
    width: 100%; max-width: 480px;
    display: flex; flex-direction: column;
    font-family: 'DM Sans', sans-serif; overflow: hidden;
  }
  .avq-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px; border-bottom: 1px solid ${THEME.border};
    background: #FDFAF5; flex-shrink: 0;
  }
  .avq-body {
    padding: 22px 24px;
    display: flex; flex-direction: column; gap: 14px;
  }
  .avq-footer {
    display: flex; align-items: center; justify-content: flex-end;
    gap: 10px; padding: 14px 24px;
    border-top: 1px solid ${THEME.border};
  }

  .avq-input {
    width: 100%; padding: 9px 12px; border-radius: 10px;
    border: 1.5px solid #E0D5C5; font-size: 13px;
    font-family: 'DM Sans', sans-serif; color: ${THEME.text};
    outline: none; background: #fff;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .avq-input:focus {
    border-color: ${THEME.brand};
    box-shadow: 0 0 0 3px ${THEME.brand}18;
  }
  .avq-input::placeholder { color: ${THEME.textLight}; }
  .avq-input.err {
    border-color: ${THEME.errorBorder};
    background: ${THEME.errorLight};
  }

  .avq-select {
    width: 100%; padding: 9px 32px 9px 12px; border-radius: 10px;
    border: 1.5px solid #E0D5C5; font-size: 13px;
    font-family: 'DM Sans', sans-serif; color: ${THEME.text};
    outline: none; background: #fff;
    appearance: none; -webkit-appearance: none;
    cursor: pointer;
    transition: border-color 0.15s, box-shadow 0.15s;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23887549' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
  }
  .avq-select:focus {
    border-color: ${THEME.brand};
    box-shadow: 0 0 0 3px ${THEME.brand}18;
  }
  .avq-select.err {
    border-color: ${THEME.errorBorder};
    background-color: ${THEME.errorLight};
  }
  .avq-select:disabled {
    opacity: 0.6; cursor: not-allowed;
  }

  .avq-label {
    display: block; margin-bottom: 5px;
    font-size: 12px; font-weight: 600; color: #434343;
    font-family: 'DM Sans', sans-serif;
  }

  @keyframes avqSpin { to { transform: rotate(360deg); } }
  .avq-btn-spinner {
    width: 13px; height: 13px; border-radius: 50%;
    border: 2px solid #ffffff88; border-top-color: #fff;
    animation: avqSpin 0.7s linear infinite; display: inline-block;
  }
  .avq-select-spinner {
    width: 11px; height: 11px; border-radius: 50%;
    border: 2px solid ${THEME.brandMid}66; border-top-color: ${THEME.brand};
    animation: avqSpin 0.7s linear infinite; display: inline-block;
    margin-right: 6px; vertical-align: middle;
  }
`;

const EMPTY = { vendorId: "", price: "", remark: "" };

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

function SecondaryBtn({ children, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
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
        cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
        transition: "all 0.18s",
      }}
    >
      {children}
    </button>
  );
}

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="avq-label">
        {label}
        {required && (
          <span style={{ color: THEME.error, marginLeft: 3 }}>*</span>
        )}
      </label>
      {children}
      {error && (
        <p style={{ margin: "4px 0 0", fontSize: 11, color: THEME.error }}>
          {error}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const AddVendorQuationModal = ({
  show,
  handleClose,
  id,
  params,
  onSuccess,
}) => {
  const [formData, setFormData] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [vendorData, setVendorData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: "" }));
  };

  const fetchvendor = useCallback(async () => {
    setLoading(true);
    try {
      const header = {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      };
      const res = await ApiService(
        null,
        0,
        header,
        getVendor.method,
        getVendor.url,
      );
      if (!res.data.error) {
        const payload = res.data?.data || [];
        setVendorData(
          payload.map((e) => ({ id: e.id, name: e.name, mobile: e.mobile })),
        );
      } else {
        toast.error(res.data?.message);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (show) {
      fetchvendor();
      setFormData(EMPTY);
      setErrors({});
    }
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.vendorId) newErrors.vendorId = "Vendor is required";
    if (!formData.price.trim()) newErrors.price = "Amount is required";
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    // Resolve selected vendor's name for submission
    const selectedVendor = vendorData.find(
      (v) => String(v.id) === String(formData.vendorId)
    );

    try {
      setSubmitting(true);
      const header = {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      };
      const res = await ApiService(
        {
          price: formData.price,
          remark: formData.remark,
          editId: id,
          arch_id: params,
          vendor_id: formData.vendorId,
        },
        0,
        header,
        addarchVendors.method,
        addarchVendors.url,
      );
      if (res.status === 201 && !res.data.error) {
        toast.success(res.data.message || "Vendor added successfully");
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

  const inp = (name, type = "text", placeholder = "") => (
    <input
      className={`avq-input ${errors[name] ? "err" : ""}`}
      type={type}
      name={name}
      value={formData[name]}
      onChange={handleChange}
      placeholder={placeholder}
    />
  );

  return (
    <>
      <style>{MODAL_CSS}</style>

      <div className="avq-backdrop" onClick={handleClose}>
        <div className="avq-dialog" onClick={(e) => e.stopPropagation()}>
          {/* ── Header ── */}
          <div className="avq-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 3,
                  height: 20,
                  borderRadius: 2,
                  background: `linear-gradient(180deg, ${THEME.brand} 0%, ${THEME.brandMid} 100%)`,
                }}
              />
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 700,
                    color: THEME.text,
                    fontFamily: "'Sora', sans-serif",
                  }}
                >
                  Add Vendor
                </h2>
                <p style={{ margin: 0, fontSize: 11, color: THEME.textMuted }}>
                  Fill in vendor quotation details
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: `1.5px solid ${THEME.border}`,
                background: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                color: THEME.textMuted,
                lineHeight: 1,
                transition: "all 0.15s",
              }}
            >
              ×
            </button>
          </div>

          {/* ── Body ── */}
          <form onSubmit={handleSubmit}>
            <div className="avq-body">
              {/* Vendor Dropdown — full width */}
              <Field label="Vendor" required error={errors.vendorId}>
                <div style={{ position: "relative" }}>
                  {loading && (
                    <span
                      style={{
                        position: "absolute",
                        left: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        zIndex: 1,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <span className="avq-select-spinner" />
                    </span>
                  )}
                  <select
                    className={`avq-select ${errors.vendorId ? "err" : ""}`}
                    name="vendorId"
                    value={formData.vendorId}
                    onChange={handleChange}
                    disabled={loading}
                    style={loading ? { paddingLeft: 30 } : {}}
                  >
                    <option value="">
                      {loading ? "Loading vendors…" : "Select a vendor…"}
                    </option>
                    {vendorData.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
              </Field>

              {/* Amount — full width */}
              <Field label="Amount (₹)" required error={errors.price}>
                <div style={{ position: "relative" }}>
                  {inp("price", "text", "0.00")}
                  <span
                    style={{
                      position: "absolute",
                      left: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: 13,
                      color: THEME.brandMid,
                      fontWeight: 700,
                      pointerEvents: "none",
                    }}
                  >
                    ₹
                  </span>
                  <style>{`.avq-input[name="price"] { padding-left: 26px; }`}</style>
                </div>
              </Field>

              {/* Remark — full width */}
              <Field label="Remark">
                {inp("remark", "text", "Add a remark…")}
              </Field>
            </div>

            {/* ── Footer ── */}
            <div className="avq-footer">
              <SecondaryBtn onClick={handleClose}>Cancel</SecondaryBtn>
              <PrimaryBtn type="submit" disabled={submitting || loading}>
                {submitting ? (
                  <>
                    <span className="avq-btn-spinner" /> Saving…
                  </>
                ) : (
                  "✓ Add Vendor"
                )}
              </PrimaryBtn>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddVendorQuationModal;