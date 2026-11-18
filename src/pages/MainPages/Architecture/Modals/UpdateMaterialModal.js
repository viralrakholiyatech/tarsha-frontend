import React, { useEffect, useState, useCallback } from "react";
import ApiService from "../../../../services/ApiService";
import {
  archmaterialupdate,
  fetcharchmaterialbyid,
  getVendor,
} from "../../../../config/config";
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

  .umm-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45); z-index: 1040;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .umm-dialog {
    background: #fff; border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.18);
    width: 100%; max-width: 480px;
    display: flex; flex-direction: column;
    font-family: 'DM Sans', sans-serif; overflow: hidden;
    max-height: 90vh;
  }
  .umm-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px; border-bottom: 1px solid ${THEME.border};
    background: #FDFAF5; flex-shrink: 0;
  }
  .umm-body {
    padding: 22px 24px; display: flex; flex-direction: column; gap: 14px;
    overflow-y: auto;
  }
  .umm-footer {
    display: flex; align-items: center; justify-content: flex-end;
    gap: 10px; padding: 14px 24px;
    border-top: 1px solid ${THEME.border}; flex-shrink: 0;
  }
  .umm-row-2 {
    display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
  }
  .umm-input {
    width: 100%; padding: 9px 12px; border-radius: 10px;
    border: 1.5px solid #E0D5C5; font-size: 13px;
    font-family: 'DM Sans', sans-serif; color: ${THEME.text};
    outline: none; background: #fff;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .umm-input:focus {
    border-color: ${THEME.brand};
    box-shadow: 0 0 0 3px ${THEME.brand}18;
  }
  .umm-input::placeholder { color: ${THEME.textLight}; }
  .umm-input.err {
    border-color: ${THEME.errorBorder};
    background: ${THEME.errorLight};
  }
      .ucm-select {
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

  .umm-status-btn {
    flex: 1; border-radius: 10px; padding: 9px 10px;
    display: flex; align-items: center; gap: 7px;
    cursor: pointer; transition: all 0.18s;
    border: 1.5px solid #E0D5C5; background: #fff;
  }
  .umm-status-btn.active-pending  { border-color: #888780; background: #F1EFE8; }
  .umm-status-btn.active-approved { border-color: ${THEME.brandMid}; background: ${THEME.brandLight}; }
  .umm-status-btn.active-rejected { border-color: #FFA39E; background: ${THEME.errorLight}; }

  .umm-radio {
    width: 15px; height: 15px; border-radius: 50%; flex-shrink: 0;
    border: 2px solid #E0D5C5; background: #fff;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
  }
  .umm-radio.checked-pending  { background: #888780; border-color: #888780; }
  .umm-radio.checked-approved { background: ${THEME.brand}; border-color: ${THEME.brand}; }
  .umm-radio.checked-rejected { background: ${THEME.error}; border-color: ${THEME.error}; }
  .umm-radio-dot { width: 5px; height: 5px; border-radius: 50%; background: #fff; }

  @keyframes ummSpin { to { transform: rotate(360deg); } }
  .umm-page-spinner {
    width: 26px; height: 26px; border-radius: 50%;
    border: 3px solid ${THEME.brandLight}; border-top-color: ${THEME.brand};
    animation: ummSpin 0.8s linear infinite;
    margin: 32px auto; display: block;
  }
  .umm-btn-spinner {
    width: 13px; height: 13px; border-radius: 50%;
    border: 2px solid #ffffff88; border-top-color: #fff;
    animation: ummSpin 0.7s linear infinite; display: inline-block;
  }
     .ucm-select-spinner {
    width: 11px; height: 11px; border-radius: 50%;
    border: 2px solid ${THEME.brandMid}66; border-top-color: ${THEME.brand};
    animation: ucmSpin 0.7s linear infinite; display: inline-block;
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

const EMPTY_FORM = {
  id: "",
  vendorId: "",
  materialName: "",
  rate: "",
  status: "",
  remark: "",
};

const UpdateMaterialModal = ({ show, handleClose, editId, onSuccess }) => {
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
          {},
          editId,
          header,
          fetcharchmaterialbyid.method,
          fetcharchmaterialbyid.url,
        );
        if (
          (res.status === 200 || res.status === 201) &&
          res.data?.data?.length > 0
        ) {
          const d = res.data.data[0];
          setFormData({
            id: d.id,
            vendorId: d.vendor || "",
            rate: d.rate != null ? String(d.rate) : "",
            materialName: d.material_name || "",
            status: d.status != null ? String(d.status) : "",
            remark: d.remark || "",
          });
        } else {
          toast.error("Failed to fetch material data");
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
    if (!String(formData.rate ?? "").trim()) e.rate = "Amount is required";
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
          materialName: formData.materialName,
          rate: formData.rate,
          remark: formData.remark,
          status: formData.status,
        },
        0,
        header,
        archmaterialupdate.method,
        archmaterialupdate.url,
      );
      if (res.status === 200 && !res.data.error) {
        toast.success(res.data.message || "Material updated successfully");
        handleClose();
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

  // ✅ KEY FIX: unmounts completely when hidden
  if (!show) return null;

  return (
    <>
      <style>{MODAL_CSS}</style>

      <div className="umm-backdrop" onClick={handleClose}>
        <div className="umm-dialog" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="umm-header">
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
                Update Material
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
            <div className="umm-body">
              {fetching ? (
                <div className="umm-page-spinner" />
              ) : (
                <>
                  {/* Vendor + Mobile */}
                  <div className="umm-row-2">
                    <div>
                      <FieldLabel required>Vendor</FieldLabel>
                      <select
                        className={`ucm-select ${errors.vendorId ? "err" : ""}`}
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
                      <FieldError msg={errors.vendorId} />
                    </div>
                  </div>

                  {/* Material Name + Rate */}
                  <div className="umm-row-2">
                    <div>
                      <FieldLabel required>Material Name</FieldLabel>
                      <input
                        type="text"
                        className={`umm-input ${errors.materialName ? "err" : ""}`}
                        name="materialName"
                        value={formData.materialName}
                        onChange={handleChange}
                        placeholder="Material name…"
                      />
                      <FieldError msg={errors.materialName} />
                    </div>
                    <div>
                      <FieldLabel>Rate</FieldLabel>
                      <input
                        type="text"
                        className="umm-input"
                        name="rate"
                        value={formData.rate}
                        onChange={handleChange}
                        placeholder="Enter rate…"
                      />
                    </div>
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
                            className={`umm-status-btn ${isActive ? opt.activeClass : ""}`}
                            onClick={() => {
                              setFormData((p) => ({ ...p, status: opt.value }));
                              setErrors((p) => ({ ...p, status: "" }));
                            }}
                          >
                            <div
                              className={`umm-radio ${isActive ? opt.radioClass : ""}`}
                            >
                              {isActive && <div className="umm-radio-dot" />}
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

                  {/* Remark */}
                  <div>
                    <FieldLabel>Remark</FieldLabel>
                    <input
                      type="text"
                      className="umm-input"
                      name="remark"
                      value={formData.remark}
                      onChange={handleChange}
                      placeholder="Add a remark…"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="umm-footer">
              <SecondaryBtn onClick={handleClose}>Cancel</SecondaryBtn>
              <PrimaryBtn type="submit" disabled={submitting || fetching}>
                {submitting ? (
                  <>
                    <span className="umm-btn-spinner" /> Updating…
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

export default UpdateMaterialModal;
