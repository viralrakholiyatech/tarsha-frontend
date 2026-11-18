import React, { useEffect, useState, useCallback } from "react";
import ApiService from "../../../../services/ApiService";
import { updateQuotation, fetchVendorbyId,getVendor } from "../../../../config/config";
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

  .uvm-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45); z-index: 1040;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .uvm-dialog {
    background: #fff; border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.18);
    width: 100%; max-width: 440px;
    display: flex; flex-direction: column;
    font-family: 'DM Sans', sans-serif; overflow: hidden;
    max-height: 90vh;
  }
  .uvm-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px; border-bottom: 1px solid ${THEME.border};
    background: #FDFAF5; flex-shrink: 0;
  }
  .uvm-body {
    padding: 22px 24px; display: flex; flex-direction: column; gap: 14px;
    overflow-y: auto;
  }
  .uvm-footer {
    display: flex; align-items: center; justify-content: flex-end;
    gap: 10px; padding: 14px 24px;
    border-top: 1px solid ${THEME.border}; flex-shrink: 0;
  }
  .uvm-row-2 {
    display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
  }
  .uvm-input {
    width: 100%; padding: 9px 12px; border-radius: 10px;
    border: 1.5px solid #E0D5C5; font-size: 13px;
    font-family: 'DM Sans', sans-serif; color: ${THEME.text};
    outline: none; background: #fff;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .uvm-input:focus {
    border-color: ${THEME.brand};
    box-shadow: 0 0 0 3px ${THEME.brand}18;
  }
  .uvm-input::placeholder { color: ${THEME.textLight}; }
  .uvm-input.err {
    border-color: ${THEME.errorBorder};
    background: ${THEME.errorLight};
  }

    .uvm-select {
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
  .uvm-select:focus {
    border-color: ${THEME.brand};
    box-shadow: 0 0 0 3px ${THEME.brand}18;
  }
  .uvm-select.err {
    border-color: ${THEME.errorBorder};
    background-color: ${THEME.errorLight};
  }
  .uvm-select:disabled {
    opacity: 0.6; cursor: not-allowed;
  }

  .uvm-status-btn {
    flex: 1; border-radius: 10px; padding: 9px 10px;
    display: flex; align-items: center; gap: 7px;
    cursor: pointer; transition: all 0.18s;
    border: 1.5px solid #E0D5C5; background: #fff;
  }
  .uvm-status-btn.active-pending  { border-color: #888780; background: #F1EFE8; }
  .uvm-status-btn.active-approved { border-color: ${THEME.brandMid}; background: ${THEME.brandLight}; }
  .uvm-status-btn.active-rejected { border-color: #FFA39E; background: ${THEME.errorLight}; }

  .uvm-radio {
    width: 15px; height: 15px; border-radius: 50%; flex-shrink: 0;
    border: 2px solid #E0D5C5; background: #fff;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
  }
  .uvm-radio.checked-pending  { background: #888780; border-color: #888780; }
  .uvm-radio.checked-approved { background: ${THEME.brand}; border-color: ${THEME.brand}; }
  .uvm-radio.checked-rejected { background: ${THEME.error}; border-color: ${THEME.error}; }
  .uvm-radio-dot { width: 5px; height: 5px; border-radius: 50%; background: #fff; }

  @keyframes uvmSpin { to { transform: rotate(360deg); } }
  .uvm-page-spinner {
    width: 26px; height: 26px; border-radius: 50%;
    border: 3px solid ${THEME.brandLight}; border-top-color: ${THEME.brand};
    animation: uvmSpin 0.8s linear infinite;
    margin: 32px auto; display: block;
  }
  .uvm-btn-spinner {
    width: 13px; height: 13px; border-radius: 50%;
    border: 2px solid #ffffff88; border-top-color: #fff;
    animation: uvmSpin 0.7s linear infinite; display: inline-block;
  }

    .uvm-select-spinner {
    width: 11px; height: 11px; border-radius: 50%;
    border: 2px solid ${THEME.brandMid}66; border-top-color: ${THEME.brand};
    animation: uvmSpin 0.7s linear infinite; display: inline-block;
  }
`;

const STATUS_OPTIONS = [
  {
    value: "0",
    label: "Pending",
    activeClass: "active-pending",
    radioClass: "checked-pending",
    labelColor: "#444441",
  },
  {
    value: "1",
    label: "Approved",
    activeClass: "active-approved",
    radioClass: "checked-approved",
    labelColor: "#5C4E32",
  },
  {
    value: "2",
    label: "Rejected",
    activeClass: "active-rejected",
    radioClass: "checked-rejected",
    labelColor: "#CF1322",
  },
];

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

const EMPTY_FORM = { id: "", vendorId: "", price: "", remark: "", status: "" };

const UpdateVendorModal = ({ show, handleClose, editId, onSuccess }) => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [fetching, setFetching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [vendorData, setVendorData] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(false);

  const fetchVendors = useCallback(async () => {
    setLoadingVendors(true);
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
      setLoadingVendors(false);
    }
  }, []);

  useEffect(() => {
    if (!show || !editId) return;
    const fetchData = async () => {
      try {
        setFetching(true);
        const header = {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        };
        const res = await ApiService(
          formData,
          editId,
          header,
          fetchVendorbyId.method,
          fetchVendorbyId.url,
        );
        if (
          (res.status === 200 || res.status === 201) &&
          res.data?.data?.length > 0
        ) {
          const d = res.data.data[0];
          setFormData({
            id: d.id,
            vendorId: d.vendors != null ? String(d.vendors) : "",
            price: d.price != null ? String(d.price) : "",
            remark: d.remark || "",
            status: d.status != null ? String(d.status) : "",
          });
        } else {
          toast.error("Failed to fetch vendor data");
        }
      } catch (err) {
        console.error(err);
        toast.error("An unexpected error occurred.");
      } finally {
        setFetching(false);
      }
    };
    fetchVendors();
    fetchData();
  }, [show, editId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!formData.vendorId) e.vendorId = "Vendor is required";
    if (!String(formData.price ?? "").trim()) e.price = "Amount is required";
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
      const res = await ApiService(
        {
          id: formData.id,
          vendor_id: formData.vendorId,
          price: formData.price,
          remark: formData.remark,
          status: formData.status,
        },
        0,
        header,
        updateQuotation.method,
        updateQuotation.url,
      );
      if (res.status === 200 && !res.data.error) {
        toast.success(res.data.message || "Vendor updated successfully");
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

      <div className="uvm-backdrop" onClick={handleClose}>
        <div className="uvm-dialog" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="uvm-header">
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
                Update Vendor
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

          {/* Body */}
          <form onSubmit={handleSubmit}>
            <div className="uvm-body">
              {fetching ? (
                <div className="uvm-page-spinner" />
              ) : (
                <>
                  {/* Vendor Name */}
                  <div>
                    <FieldLabel required>Vendor</FieldLabel>
                    <div style={{ position: "relative" }}>
                      {loadingVendors && (
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
                          <span className="uvm-select-spinner" />
                        </span>
                      )}
                      <select
                        className={`uvm-select ${errors.vendorId ? "err" : ""}`}
                        name="vendorId"
                        value={formData.vendorId}
                        onChange={handleChange}
                        disabled={loadingVendors}
                        style={loadingVendors ? { paddingLeft: 30 } : {}}
                      >
                        <option value="">
                          {loadingVendors
                            ? "Loading vendors…"
                            : "Select a vendor…"}
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

                  {/* Price side by side */}
                  <div className="uvm-row-2">
                    <div>
                      <FieldLabel>Price</FieldLabel>
                      <input
                        type="text"
                        className="uvm-input"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="Enter price…"
                      />
                    </div>
                  </div>

                  {/* Remark */}
                  <div>
                    <FieldLabel>Remark</FieldLabel>
                    <input
                      type="text"
                      className="uvm-input"
                      name="remark"
                      value={formData.remark}
                      onChange={handleChange}
                      placeholder="Add a remark…"
                    />
                  </div>

                  {/* Status toggle cards */}
                  <div>
                    <FieldLabel>Status</FieldLabel>
                    <div style={{ display: "flex", gap: 8 }}>
                      {STATUS_OPTIONS.map((opt) => {
                        const isActive = String(formData.status) === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            className={`uvm-status-btn ${isActive ? opt.activeClass : ""}`}
                            onClick={() => {
                              setFormData((p) => ({ ...p, status: opt.value }));
                              setErrors((p) => ({ ...p, status: "" }));
                            }}
                          >
                            <div
                              className={`uvm-radio ${isActive ? opt.radioClass : ""}`}
                            >
                              {isActive && <div className="uvm-radio-dot" />}
                            </div>
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: isActive ? 600 : 500,
                                color: isActive ? opt.labelColor : "#595959",
                                fontFamily: "'DM Sans', sans-serif",
                              }}
                            >
                              {opt.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="uvm-footer">
              <SecondaryBtn onClick={handleClose}>Cancel</SecondaryBtn>
              <PrimaryBtn type="submit" disabled={submitting || fetching}>
                {submitting ? (
                  <>
                    <span className="uvm-btn-spinner" /> Updating…
                  </>
                ) : (
                  "✓ Update"
                )}
              </PrimaryBtn>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default UpdateVendorModal;
