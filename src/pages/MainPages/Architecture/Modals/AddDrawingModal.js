

import React, { useState, useRef } from "react";
import ApiService from "../../../../services/ApiService";
import { Addarchdrawing } from "../../../../config/config";
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

  .adw-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45); z-index: 1040;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .adw-dialog {
    background: #fff; border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.18);
    width: 100%; max-width: 440px;
    display: flex; flex-direction: column;
    font-family: 'DM Sans', sans-serif; overflow: hidden;
  }
  .adw-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px; border-bottom: 1px solid ${THEME.border};
    background: #FDFAF5; flex-shrink: 0;
  }
  .adw-body   { padding: 22px 24px; display: flex; flex-direction: column; gap: 16px; }
  .adw-footer {
    display: flex; align-items: center; justify-content: flex-end;
    gap: 10px; padding: 14px 24px;
    border-top: 1px solid ${THEME.border};
  }

  .adw-input {
    width: 100%; padding: 9px 12px; border-radius: 10px;
    border: 1.5px solid #E0D5C5; font-size: 13px;
    font-family: 'DM Sans', sans-serif; color: ${THEME.text};
    outline: none; background: #fff;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .adw-input:focus {
    border-color: ${THEME.brand};
    box-shadow: 0 0 0 3px ${THEME.brand}18;
  }
  .adw-input::placeholder { color: ${THEME.textLight}; }
  .adw-input.err {
    border-color: ${THEME.errorBorder};
    background: ${THEME.errorLight};
  }

  .adw-dropzone {
    border: 1.5px dashed ${THEME.brandMid};
    border-radius: 10px; padding: 22px 16px;
    text-align: center; background: #FDFAF5;
    cursor: pointer; transition: background 0.15s, border-color 0.15s;
  }
  .adw-dropzone:hover { background: ${THEME.brandLight}; border-color: ${THEME.brand}; }
  .adw-dropzone.err   { border-color: ${THEME.errorBorder}; background: ${THEME.errorLight}; }
  .adw-dropzone input[type="file"] { display: none; }

  @keyframes adwSpin { to { transform: rotate(360deg); } }
  .adw-btn-spinner {
    width: 13px; height: 13px; border-radius: 50%;
    border: 2px solid #ffffff88; border-top-color: #fff;
    animation: adwSpin 0.7s linear infinite; display: inline-block;
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

const EMPTY_FORM = { design: "", notes: "" };

const AddDrawingModal = ({ show, handleClose, id, params, onSuccess }) => {
  const [formData,   setFormData]   = useState(EMPTY_FORM);
  const [fileName,   setFileName]   = useState("");
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = async (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setFileName(file.name);
      setErrors((p) => ({ ...p, [name]: "" }));
      const toastId = toast.loading("Uploading drawing file to AWS S3...");
      try {
        setUploading(true);
        const { key } = await uploadFileToS3(file, null, "architecture/drawing");
        setFormData((p) => ({ ...p, [name]: key }));
        toast.success("Drawing file uploaded to AWS S3!", { id: toastId });
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
    if (!formData.notes.trim()) e.notes  = "Name is required";
    if (!formData.design)       e.design = "Please select a design file";
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

    try {
      setSubmitting(true);
      const header  = { Authorization: `Bearer ${getToken()}` };
      const payload = new FormData();
      payload.append("editId",      id);
      payload.append("arch_id", params);
      payload.append("design", formData.design);
      payload.append("notes",       formData.notes);

      const res = await ApiService(payload, 0, header, Addarchdrawing.method, Addarchdrawing.url);

      if (res.status === 201 && !res.data.error) {
        toast.success(res.data.message || "Drawing added successfully");
        handleClose();
        onSuccess?.();
        fileInputRef.current.value = "";
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

      <div className="adw-backdrop" onClick={handleClose}>
        <div className="adw-dialog" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="adw-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 3, height: 20, borderRadius: 2,
                background: `linear-gradient(180deg, ${THEME.brand} 0%, ${THEME.brandMid} 100%)`,
              }} />
              <h2 style={{
                margin: 0, fontSize: 16, fontWeight: 700,
                color: THEME.text, fontFamily: "'Sora', sans-serif",
              }}>
                Add Drawing
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
            <div className="adw-body">

            

              {/* Design File */}
              <div>
                <FieldLabel required>Design File</FieldLabel>
                <div
                  className={`adw-dropzone ${errors.design ? "err" : ""}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    name="design"
                    ref={fileInputRef}
                    onChange={handleChange}
                  />
                  <div style={{ fontSize: 24, marginBottom: 6 }}>🎨</div>
                  {fileName
                    ? <p style={{ margin: 0, fontSize: 13, color: THEME.brand, fontWeight: 600 }}>{fileName}</p>
                    : <>
                        <p style={{ margin: 0, fontSize: 13, color: THEME.textMuted }}>Click to browse or drag &amp; drop</p>
                        <p style={{ margin: "4px 0 0", fontSize: 11, color: THEME.textLight }}>DWG, PDF, PNG, SVG up to 20MB</p>
                      </>
                  }
                </div>
                <FieldError msg={errors.design} />
              </div>

                {/* Name */}
              <div>
                <FieldLabel required>Notes</FieldLabel>
                <input
                  type="text"
                  className={`adw-input ${errors.notes ? "err" : ""}`}
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Enter drawing name…"
                  autoFocus
                />
                <FieldError msg={errors.notes} />
              </div>

            </div>

            {/* Footer */}
            <div className="adw-footer">
              <SecondaryBtn onClick={handleClose}>Cancel</SecondaryBtn>
              <PrimaryBtn type="submit" disabled={submitting || uploading}>
                {submitting || uploading
                  ? <><span className="adw-btn-spinner" /> {uploading ? "Uploading to S3…" : "Submitting…"}</>
                  : "✓ Submit"}
              </PrimaryBtn>
            </div>
          </form>

        </div>
      </div>
    </>
  );
};

export default AddDrawingModal;