import React, { useState, useEffect, useCallback } from "react";
import ApiService from "../../../../services/ApiService";
import { addarchContractor, getVendor } from "../../../../config/config";
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

  .acm-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45); z-index: 1040;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .acm-dialog {
    background: #fff; border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.18);
    width: 100%; max-width: 440px;
    display: flex; flex-direction: column;
    font-family: 'DM Sans', sans-serif; overflow: hidden;
  }
  .acm-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px; border-bottom: 1px solid ${THEME.border};
    background: #FDFAF5; flex-shrink: 0;
  }
  .acm-body { padding: 22px 24px; display: flex; flex-direction: column; gap: 14px; }
  .acm-footer {
    display: flex; align-items: center; justify-content: flex-end;
    gap: 10px; padding: 14px 24px;
    border-top: 1px solid ${THEME.border};
  }
  .acm-input {
    width: 100%; padding: 9px 12px; border-radius: 10px;
    border: 1.5px solid #E0D5C5; font-size: 13px;
    font-family: 'DM Sans', sans-serif; color: ${THEME.text};
    outline: none; background: #fff;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .acm-input:focus {
    border-color: ${THEME.brand};
    box-shadow: 0 0 0 3px ${THEME.brand}18;
  }
  .acm-input::placeholder { color: ${THEME.textLight}; }
  .acm-input.err {
    border-color: ${THEME.errorBorder};
    background: ${THEME.errorLight};
  }

  .acm-select {
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
  .acm-select:focus {
    border-color: ${THEME.brand};
    box-shadow: 0 0 0 3px ${THEME.brand}18;
  }
  .acm-select.err {
    border-color: ${THEME.errorBorder};
    background-color: ${THEME.errorLight};
  }
  .acm-select:disabled { opacity: 0.6; cursor: not-allowed; }

  @keyframes acmSpin { to { transform: rotate(360deg); } }
  .acm-btn-spinner {
    width: 13px; height: 13px; border-radius: 50%;
    border: 2px solid #ffffff88; border-top-color: #fff;
    animation: acmSpin 0.7s linear infinite; display: inline-block;
  }
  .acm-select-spinner {
    width: 11px; height: 11px; border-radius: 50%;
    border: 2px solid ${THEME.brandMid}66; border-top-color: ${THEME.brand};
    animation: acmSpin 0.7s linear infinite; display: inline-block;
  }
`;

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

function FieldLabel({ children, required }) {
  return (
    <label
      style={{
        display: "block",
        marginBottom: 6,
        fontSize: 12,
        fontWeight: 600,
        color: "#434343",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {children}
      {required && <span style={{ color: THEME.error, marginLeft: 3 }}>*</span>}
    </label>
  );
}

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p style={{ margin: "4px 0 0", fontSize: 11, color: THEME.error }}>{msg}</p>
  );
}

const EMPTY_FORM = { vendorId: "", price: "", remark: "" };

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const AddContractorModal = ({ show, handleClose, id, params, onSuccess }) => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [vendorData, setVendorData] = useState([]);
  const [loading, setLoading] = useState(false);

  // ── Fetch vendor dropdown list ──
  const fetchVendors = useCallback(async () => {
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

  // ── Fetch vendors + reset form when modal opens ──
  useEffect(() => {
    if (show) {
      fetchVendors();
      setFormData(EMPTY_FORM);
      setErrors({});
    }
  }, [show]);

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!formData.vendorId) e.vendorId = "Vendor is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    try {
      setSubmitting(true);
      const header = {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      };
      const payload = {
        vendor_id: formData.vendorId,
        price: formData.price,
        remark: formData.remark,
        editId: id,
        arch_id: params,
      };
      const res = await ApiService(
        payload,
        0,
        header,
        addarchContractor.method,
        addarchContractor.url,
      );

      if (res.status === 201 && !res.data.error) {
        toast.success(res.data.message || "Contractor added successfully");
        handleClose();
        onSuccess?.();
        setFormData(EMPTY_FORM);
      } else {
        toast.error(res.data?.message || "An error occurred");
      }
    } catch (error) {
      console.error("Error during submission:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <>
      <style>{MODAL_CSS}</style>

      <div className="acm-backdrop" onClick={handleClose}>
        <div className="acm-dialog" onClick={(e) => e.stopPropagation()}>
          {/* ── Header ── */}
          <div className="acm-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 3,
                  height: 20,
                  borderRadius: 2,
                  background: `linear-gradient(180deg, ${THEME.brand} 0%, ${THEME.brandMid} 100%)`,
                }}
              />
              <h2
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 700,
                  color: THEME.text,
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                Add Contractor
              </h2>
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
              }}
            >
              ×
            </button>
          </div>

          {/* ── Body ── */}
          <form onSubmit={handleSubmit}>
            <div className="acm-body">
              {/* Vendor Dropdown */}
              <div>
                <FieldLabel required>Vendor</FieldLabel>
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
                      <span className="acm-select-spinner" />
                    </span>
                  )}
                  <select
                    className={`acm-select ${errors.vendorId ? "err" : ""}`}
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
                      <option key={v.id} value={String(v.id)}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
                <FieldError msg={errors.vendorId} />
              </div>

              <div>
                <FieldLabel>Amount</FieldLabel>
                <input
                  type="text"
                  className="acm-input"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Enter amount…"
                />
              </div>

              {/* Remark */}
              <div>
                <FieldLabel>Remark</FieldLabel>
                <input
                  type="text"
                  className="acm-input"
                  name="remark"
                  value={formData.remark}
                  onChange={handleChange}
                  placeholder="Add a remark…"
                />
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="acm-footer">
              <SecondaryBtn onClick={handleClose}>Cancel</SecondaryBtn>
              <PrimaryBtn type="submit" disabled={submitting || loading}>
                {submitting ? (
                  <>
                    <span className="acm-btn-spinner" /> Submitting…
                  </>
                ) : (
                  "✓ Submit"
                )}
              </PrimaryBtn>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddContractorModal;
