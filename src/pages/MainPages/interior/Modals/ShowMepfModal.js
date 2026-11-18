
import React, { useState, useRef } from "react";
import ApiService from "../../../../services/ApiService";
import { Addmepf } from "../../../../config/config";
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

  .ssm2-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45); z-index: 1040;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .ssm2-dialog {
    background: #fff; border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.18);
    width: 100%; max-width: 460px;
    display: flex; flex-direction: column;
    font-family: 'DM Sans', sans-serif; overflow: hidden;
    max-height: 90vh;
  }
  .ssm2-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px; border-bottom: 1px solid ${THEME.border};
    background: #FDFAF5; flex-shrink: 0;
  }
  .ssm2-body {
    padding: 22px 24px; display: flex; flex-direction: column; gap: 16px;
    overflow-y: auto;
  }
  .ssm2-footer {
    display: flex; align-items: center; justify-content: flex-end;
    gap: 10px; padding: 14px 24px;
    border-top: 1px solid ${THEME.border}; flex-shrink: 0;
  }
  .ssm2-input {
    width: 100%; padding: 9px 12px; border-radius: 10px;
    border: 1.5px solid #E0D5C5; font-size: 13px;
    font-family: 'DM Sans', sans-serif; color: ${THEME.text};
    outline: none; background: #fff;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .ssm2-input:focus {
    border-color: ${THEME.brand};
    box-shadow: 0 0 0 3px ${THEME.brand}18;
  }
  .ssm2-input::placeholder { color: ${THEME.textLight}; }
  .ssm2-input.err {
    border-color: ${THEME.errorBorder};
    background: ${THEME.errorLight};
  }
  .ssm2-dropzone {
    border: 1.5px dashed ${THEME.brandMid};
    border-radius: 10px; padding: 18px 16px;
    text-align: center; background: #FDFAF5;
    cursor: pointer; transition: background 0.15s, border-color 0.15s;
  }
  .ssm2-dropzone:hover { background: ${THEME.brandLight}; border-color: ${THEME.brand}; }
  .ssm2-dropzone.err   { border-color: ${THEME.errorBorder}; background: ${THEME.errorLight}; }
  .ssm2-dropzone input[type="file"] { display: none; }

  @keyframes ssm2Spin { to { transform: rotate(360deg); } }
  .ssm2-btn-spinner {
    width: 13px; height: 13px; border-radius: 50%;
    border: 2px solid #ffffff88; border-top-color: #fff;
    animation: ssm2Spin 0.7s linear infinite; display: inline-block;
  }
`;

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

function Dropzone({ label, required, fileName, onFileChange, inputRef, error, accept }) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <div
        className={`ssm2-dropzone ${error ? "err" : ""}`}
        onClick={() => inputRef.current?.click()}
      >
        <input
          type="file"
          ref={inputRef}
          accept={accept}
          onChange={onFileChange}
        />
        <div style={{ fontSize: 20, marginBottom: 5 }}>📎</div>
        {fileName
          ? <p style={{ margin: 0, fontSize: 13, color: THEME.brand, fontWeight: 600 }}>{fileName}</p>
          : <>
              <p style={{ margin: 0, fontSize: 13, color: THEME.textMuted }}>Click to browse or drag &amp; drop</p>
              <p style={{ margin: "3px 0 0", fontSize: 11, color: THEME.textLight }}>PDF, DOC, PNG up to 10MB</p>
            </>
        }
      </div>
      <FieldError msg={error} />
    </div>
  );
}

const EMPTY_FORM = { zed_upload: "", agency_upload: "", agency_name: "" };

const ShowMepfModal = ({ show, handleClose, id, editID, onSuccess }) => {
  const [formData,   setFormData]   = useState(EMPTY_FORM);
  const [fileNames,  setFileNames]  = useState({ zed_upload: "", agency_upload: "" });
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [uploading,  setUploading]  = useState(false);

  // separate refs for each file input
  const zedRef    = useRef(null);
  const agencyRef = useRef(null);

  const handleFileChange = (name) => async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileNames((p) => ({ ...p, [name]: file.name }));
    setErrors((p) => ({ ...p, [name]: "" }));
    const label = name === "zed_upload" ? "ZED document" : "Agency document";
    const toastId = toast.loading(`Uploading ${label} to AWS S3...`);
    try {
      setUploading(true);
      const { key } = await uploadFileToS3(file, null, "interior/mepf");
      setFormData((p) => ({ ...p, [name]: key }));
      toast.success(`${label} uploaded to AWS S3!`, { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error(`Failed to upload ${label} to AWS S3. Please retry.`, { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!formData.agency_name.trim()) e.agency_name = "Agency name is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploading) {
      toast.error("Please wait for files to finish uploading to AWS S3");
      return;
    }
    const newErrors = validate();
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    setErrors({});

    try {
      setSubmitting(true);
      const header  = { Authorization: `Bearer ${getToken()}` };
      const payload = new FormData();
      payload.append("editId",        editID);
      payload.append("ID",            id);
      payload.append("zed_upload",    formData.zed_upload);
      payload.append("agency_upload", formData.agency_upload);
      payload.append("agency_name",   formData.agency_name);

      const res = await ApiService(payload, 0, header, Addmepf.method, Addmepf.url);

      if (res.status === 201 && !res.data.error) {
        toast.success(res.data.message || "Data submitted successfully");
        handleClose();
        onSuccess?.();
        if (zedRef.current)    zedRef.current.value    = "";
        if (agencyRef.current) agencyRef.current.value = "";
        setFormData(EMPTY_FORM);
        setFileNames({ zed_upload: "", agency_upload: "" });
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

  // ✅ KEY FIX: unmounts completely when hidden
  if (!show) return null;

  return (
    <>
      <style>{MODAL_CSS}</style>

      <div className="ssm2-backdrop" onClick={handleClose}>
        <div className="ssm2-dialog" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="ssm2-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 3, height: 20, borderRadius: 2,
                background: `linear-gradient(180deg, ${THEME.brand} 0%, ${THEME.brandMid} 100%)`,
              }} />
              <h2 style={{
                margin: 0, fontSize: 16, fontWeight: 700,
                color: THEME.text, fontFamily: "'Sora', sans-serif",
              }}>
                Add Agency
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

          {/* Body */}
          <form onSubmit={handleSubmit}>
            <div className="ssm2-body">

              {/* Agency Name */}
              <div>
                <FieldLabel required>Agency Name</FieldLabel>
                <input
                  type="text"
                  className={`ssm2-input ${errors.agency_name ? "err" : ""}`}
                  name="agency_name"
                  value={formData.agency_name}
                  onChange={handleChange}
                  placeholder="Enter agency name…"
                  autoFocus
                />
                <FieldError msg={errors.agency_name} />
              </div>

              {/* ZED Upload */}
              <Dropzone
                label="ZED Upload"
                fileName={fileNames.zed_upload}
                inputRef={zedRef}
                error={errors.zed_upload}
                onFileChange={handleFileChange("zed_upload")}
              />

              {/* Agency Upload */}
              <Dropzone
                label="Agency Upload"
                fileName={fileNames.agency_upload}
                inputRef={agencyRef}
                error={errors.agency_upload}
                onFileChange={handleFileChange("agency_upload")}
              />

            </div>

            {/* Footer */}
            <div className="ssm2-footer">
              <SecondaryBtn onClick={handleClose}>Cancel</SecondaryBtn>
              <PrimaryBtn type="submit" disabled={submitting || uploading}>
                {uploading
                  ? <><span className="ssm2-btn-spinner" /> Uploading to S3…</>
                  : submitting
                  ? <><span className="ssm2-btn-spinner" /> Submitting…</>
                  : "✓ Submit"}
              </PrimaryBtn>
            </div>
          </form>

        </div>
      </div>
    </>
  );
};

export default ShowMepfModal;