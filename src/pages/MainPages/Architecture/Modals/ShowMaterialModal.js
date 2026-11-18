import React, { useState, useRef, useEffect, useCallback } from "react";
import ApiService from "../../../../services/ApiService";
import { AddarchMaterial, getVendor } from "../../../../config/config";
import { getToken } from "../../../../services/useLocalStorage";
import toast from "react-hot-toast";
import { uploadFileToS3 } from "../../../../services/S3Service";

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

  .smm-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45); z-index: 1040;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .smm-dialog {
    background: #fff; border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.18);
    width: 100%; max-width: 480px;
    display: flex; flex-direction: column;
    font-family: 'DM Sans', sans-serif; overflow: hidden;
    max-height: 90vh;
  }
  .smm-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px; border-bottom: 1px solid ${THEME.border};
    background: #FDFAF5; flex-shrink: 0;
  }
  .smm-body {
    padding: 22px 24px; display: flex; flex-direction: column; gap: 14px;
    overflow-y: auto;
  }
  .smm-footer {
    display: flex; align-items: center; justify-content: flex-end;
    gap: 10px; padding: 14px 24px;
    border-top: 1px solid ${THEME.border}; flex-shrink: 0;
  }
  .smm-row-2 {
    display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
  }
  .smm-input {
    width: 100%; padding: 9px 12px; border-radius: 10px;
    border: 1.5px solid #E0D5C5; font-size: 13px;
    font-family: 'DM Sans', sans-serif; color: ${THEME.text};
    outline: none; background: #fff;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .smm-input:focus {
    border-color: ${THEME.brand};
    box-shadow: 0 0 0 3px ${THEME.brand}18;
  }
  .smm-input::placeholder { color: ${THEME.textLight}; }
  .smm-input.err {
    border-color: ${THEME.errorBorder};
    background: ${THEME.errorLight};
  }

  .smm-select {
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
  .smm-select:focus {
    border-color: ${THEME.brand};
    box-shadow: 0 0 0 3px ${THEME.brand}18;
  }
  .smm-select.err {
    border-color: ${THEME.errorBorder};
    background-color: ${THEME.errorLight};
  }
  .smm-select:disabled { opacity: 0.6; cursor: not-allowed; }

  .smm-dropzone {
    border: 1.5px dashed ${THEME.brandMid};
    border-radius: 10px; padding: 18px 16px;
    text-align: center; background: #FDFAF5;
    cursor: pointer; transition: background 0.15s, border-color 0.15s;
  }
  .smm-dropzone:hover { background: ${THEME.brandLight}; border-color: ${THEME.brand}; }
  .smm-dropzone.err   { border-color: ${THEME.errorBorder}; background: ${THEME.errorLight}; }
  .smm-dropzone input[type="file"] { display: none; }

  .smm-status-btn {
    flex: 1; border-radius: 10px; padding: 9px 10px;
    display: flex; align-items: center; gap: 7px;
    cursor: pointer; transition: all 0.18s;
    border: 1.5px solid #E0D5C5; background: #fff;
  }
  .smm-status-btn.active-pending  { border-color: #888780; background: #F1EFE8; }
  .smm-status-btn.active-approved { border-color: ${THEME.brandMid}; background: ${THEME.brandLight}; }
  .smm-status-btn.active-rejected { border-color: #FFA39E; background: ${THEME.errorLight}; }

  .smm-radio {
    width: 15px; height: 15px; border-radius: 50%; flex-shrink: 0;
    border: 2px solid #E0D5C5; background: #fff;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
  }
  .smm-radio.checked-pending  { background: #888780; border-color: #888780; }
  .smm-radio.checked-approved { background: ${THEME.brand}; border-color: ${THEME.brand}; }
  .smm-radio.checked-rejected { background: ${THEME.error}; border-color: ${THEME.error}; }
  .smm-radio-dot { width: 5px; height: 5px; border-radius: 50%; background: #fff; }

  @keyframes smmSpin { to { transform: rotate(360deg); } }
  .smm-btn-spinner {
    width: 13px; height: 13px; border-radius: 50%;
    border: 2px solid #ffffff88; border-top-color: #fff;
    animation: smmSpin 0.7s linear infinite; display: inline-block;
  }
  .smm-select-spinner {
    width: 11px; height: 11px; border-radius: 50%;
    border: 2px solid ${THEME.brandMid}66; border-top-color: ${THEME.brand};
    animation: smmSpin 0.7s linear infinite; display: inline-block;
  }
`;

const STATUS_OPTIONS = [
  { value: "0", label: "Pending",  activeClass: "active-pending",  radioClass: "checked-pending",  labelColor: "#444441" },
  { value: "1", label: "Approved", activeClass: "active-approved", radioClass: "checked-approved", labelColor: "#5C4E32" },
  { value: "2", label: "Rejected", activeClass: "active-rejected", radioClass: "checked-rejected", labelColor: "#CF1322" },
];

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

function FieldLabel({ children, required }) {
  return (
    <label style={{
      display: "block", marginBottom: 6,
      fontSize: 12, fontWeight: 600, color: "#434343",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {children}
      {required && <span style={{ color: THEME.error, marginLeft: 3 }}>*</span>}
    </label>
  );
}

function FieldError({ msg }) {
  if (!msg) return null;
  return <p style={{ margin: "4px 0 0", fontSize: 11, color: THEME.error }}>{msg}</p>;
}

const EMPTY_FORM = {
  vendorId: "", materialphoto: "",
  materialName: "", status: "0", remark: "", rate: "",
};

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const ShowMaterialModal = ({ show, handleClose, editId, id, onSuccess }) => {
  const [formData,   setFormData]   = useState(EMPTY_FORM);
  const [fileName,   setFileName]   = useState("");
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [vendorData, setVendorData] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const fileInputRef = useRef(null);

  // ── Fetch vendor dropdown list ──
  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const header = {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      };
      const res = await ApiService(null, 0, header, getVendor.method, getVendor.url);
      if (!res.data.error) {
        const payload = res.data?.data || [];
        setVendorData(payload.map((e) => ({ id: e.id, name: e.name, mobile: e.mobile })));
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
      setFileName("");
      setErrors({});
    }
  }, [show]);

  const handleChange = async (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setFileName(file.name);
      setErrors((p) => ({ ...p, [name]: "" }));
      const toastId = toast.loading("Uploading material photo to AWS S3...");
      try {
        setUploading(true);
        const { key } = await uploadFileToS3(file, null, "architecture/material");
        setFormData((p) => ({ ...p, [name]: key }));
        toast.success("Material photo uploaded to AWS S3!", { id: toastId });
      } catch (err) {
        console.error(err);
        toast.error("Failed to upload file to AWS S3. Please retry.", { id: toastId });
      } finally {
        setUploading(false);
      }
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
      setErrors((p) => ({ ...p, [name]: "" }));
    }
  };

  const validate = () => {
    const e = {};
    if (!formData.materialName.trim()) e.materialName = "Material name is required";
    if (!formData.vendorId)            e.vendorId     = "Vendor is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploading) {
      toast.error("Please wait for file to finish uploading to AWS S3");
      return;
    }
    const newErrors = validate();
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    setErrors({});

    // Resolve vendor name + mobile from selected id
    const selectedVendor = vendorData.find(
      (v) => String(v.id) === String(formData.vendorId)
    );

    try {
      setSubmitting(true);
      const header  = { Authorization: `Bearer ${getToken()}` };
      const payload = new FormData();
      payload.append("editId",        editId);
      payload.append("ID",            id);
      payload.append("materialphoto", formData.materialphoto);
      payload.append("vendor_id",     formData.vendorId);
      payload.append("materialName",  formData.materialName);
      payload.append("rate",          formData.rate);
      payload.append("status",        formData.status);
      payload.append("remark",        formData.remark);

      const res = await ApiService(payload, 0, header, AddarchMaterial.method, AddarchMaterial.url);

      if (res.status === 201 && !res.data.error) {
        toast.success(res.data.message || "Material added successfully");
        handleClose();
        onSuccess?.();
        if (fileInputRef.current) fileInputRef.current.value = "";
        setFormData(EMPTY_FORM);
        setFileName("");
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

      <div className="smm-backdrop" onClick={handleClose}>
        <div className="smm-dialog" onClick={(e) => e.stopPropagation()}>

          {/* ── Header ── */}
          <div className="smm-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 3, height: 20, borderRadius: 2,
                background: `linear-gradient(180deg, ${THEME.brand} 0%, ${THEME.brandMid} 100%)`,
              }} />
              <h2 style={{
                margin: 0, fontSize: 16, fontWeight: 700,
                color: THEME.text, fontFamily: "'Sora', sans-serif",
              }}>
                Add Material
              </h2>
            </div>
            <button
              onClick={handleClose}
              style={{
                width: 32, height: 32, borderRadius: 8,
                border: `1.5px solid ${THEME.border}`, background: "#fff",
                cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 18, color: THEME.textMuted,
                lineHeight: 1,
              }}
            >×</button>
          </div>

          {/* ── Body ── */}
          <form onSubmit={handleSubmit}>
            <div className="smm-body">

              {/* Vendor Dropdown — full width */}
              <div>
                <FieldLabel required>Vendor</FieldLabel>
                <div style={{ position: "relative" }}>
                  {loading && (
                    <span style={{
                      position: "absolute", left: 10, top: "50%",
                      transform: "translateY(-50%)", zIndex: 1,
                      display: "flex", alignItems: "center",
                    }}>
                      <span className="smm-select-spinner" />
                    </span>
                  )}
                  <select
                    className={`smm-select ${errors.vendorId ? "err" : ""}`}
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

              {/* Material Name + Rate side by side */}
              <div className="smm-row-2">
                <div>
                  <FieldLabel required>Material Name</FieldLabel>
                  <input
                    type="text"
                    className={`smm-input ${errors.materialName ? "err" : ""}`}
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
                    className="smm-input"
                    name="rate"
                    value={formData.rate}
                    onChange={handleChange}
                    placeholder="Enter rate…"
                  />
                </div>
              </div>

              {/* Material Photo dropzone */}
              <div>
                <FieldLabel>Material Photo</FieldLabel>
                <div
                  className="smm-dropzone"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    name="materialphoto"
                    ref={fileInputRef}
                    onChange={handleChange}
                  />
                  <div style={{ fontSize: 22, marginBottom: 6 }}>🖼️</div>
                  {fileName
                    ? <p style={{ margin: 0, fontSize: 13, color: THEME.brand, fontWeight: 600 }}>{fileName}</p>
                    : <>
                        <p style={{ margin: 0, fontSize: 13, color: THEME.textMuted }}>Click to browse or drag &amp; drop</p>
                        <p style={{ margin: "4px 0 0", fontSize: 11, color: THEME.textLight }}>PNG, JPG up to 10MB</p>
                      </>
                  }
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
                        className={`smm-status-btn ${isActive ? opt.activeClass : ""}`}
                        onClick={() => setFormData((p) => ({ ...p, status: opt.value }))}
                      >
                        <div className={`smm-radio ${isActive ? opt.radioClass : ""}`}>
                          {isActive && <div className="smm-radio-dot" />}
                        </div>
                        <span style={{
                          fontSize: 12,
                          fontWeight: isActive ? 600 : 500,
                          color: isActive ? opt.labelColor : "#595959",
                          fontFamily: "'DM Sans', sans-serif",
                        }}>
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
                  className="smm-input"
                  name="remark"
                  value={formData.remark}
                  onChange={handleChange}
                  placeholder="Add a remark…"
                />
              </div>

            </div>

            {/* ── Footer ── */}
            <div className="smm-footer">
              <SecondaryBtn onClick={handleClose}>Cancel</SecondaryBtn>
              <PrimaryBtn type="submit" disabled={submitting || loading || uploading}>
                {submitting || uploading
                  ? <><span className="smm-btn-spinner" /> {uploading ? "Uploading to S3…" : "Submitting…"}</>
                  : "✓ Submit"}
              </PrimaryBtn>
            </div>
          </form>

        </div>
      </div>
    </>
  );
};

export default ShowMaterialModal;