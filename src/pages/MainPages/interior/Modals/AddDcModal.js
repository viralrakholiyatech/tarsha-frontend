import React, { useRef, useState } from "react";
import ApiService from "../../../../services/ApiService";
import { AddConcept } from "../../../../config/config";
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

  .adc-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45); z-index: 1040;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .adc-dialog {
    background: #fff; border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.18);
    width: 100%; max-width: 460px;
    display: flex; flex-direction: column;
    font-family: 'DM Sans', sans-serif; overflow: hidden;
  }
  .adc-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px; border-bottom: 1px solid ${THEME.border};
    background: #FDFAF5; flex-shrink: 0;
  }
  .adc-body {
    padding: 22px 24px;
    display: flex; flex-direction: column; gap: 16px;
  }
  .adc-footer {
    display: flex; align-items: center; justify-content: flex-end;
    gap: 10px; padding: 14px 24px;
    border-top: 1px solid ${THEME.border};
  }

  .adc-input {
    width: 100%; padding: 9px 12px; border-radius: 10px;
    border: 1.5px solid #E0D5C5; font-size: 13px;
    font-family: 'DM Sans', sans-serif; color: ${THEME.text};
    outline: none; background: #fff;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .adc-input:focus {
    border-color: ${THEME.brand};
    box-shadow: 0 0 0 3px ${THEME.brand}18;
  }
  .adc-input::placeholder { color: ${THEME.textLight}; }
  .adc-input.err { border-color: ${THEME.errorBorder}; background: ${THEME.errorLight}; }

  .adc-label {
    display: block; margin-bottom: 5px;
    font-size: 12px; font-weight: 600; color: #434343;
    font-family: 'DM Sans', sans-serif;
  }
  .adc-err { margin: 4px 0 0; font-size: 11px; color: ${THEME.error}; }

  /* Drop zone */
  .adc-dropzone {
    border: 2px dashed #D4C4A0; border-radius: 12px;
    padding: 24px 16px; text-align: center;
    cursor: pointer; transition: all 0.15s;
    background: ${THEME.brandLight};
  }
  .adc-dropzone:hover { border-color: ${THEME.brand}; background: #F0E8D8; }
  .adc-dropzone.has-file { border-color: ${THEME.brand}; border-style: solid; background: #F0E8D8; }
  .adc-dropzone.err { border-color: ${THEME.errorBorder}; background: ${THEME.errorLight}; }

  @keyframes adcSpin { to { transform: rotate(360deg); } }
  .adc-btn-spinner {
    width: 13px; height: 13px; border-radius: 50%;
    border: 2px solid #ffffff88; border-top-color: #fff;
    animation: adcSpin 0.7s linear infinite; display: inline-block;
  }
`;

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
const AddDcModal = ({ show, handleClose, id, params, onSuccess }) => {
  const [formData,   setFormData]   = useState({ designphoto: "", notes: "" });
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
      const toastId = toast.loading("Uploading design file to AWS S3...");
      try {
        setUploading(true);
        const { key } = await uploadFileToS3(file, null, "interior/design_concept");
        setFormData((p) => ({ ...p, [name]: key }));
        toast.success("File uploaded to AWS S3!", { id: toastId });
      } catch (err) {
        console.error(err);
        toast.error("Failed to upload file to AWS S3. Please retry.", { id: toastId });
      } finally {
        setUploading(false);
      }
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
      setErrors((p)   => ({ ...p, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploading) {
      toast.error("Please wait for file to finish uploading to AWS S3");
      return;
    }
    const newErrors = {};
    if (!formData.notes.trim())  newErrors.notes       = "Name is required";
    if (!formData.designphoto)   newErrors.designphoto = "Design file is required";
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    setErrors({});

    try {
      setSubmitting(true);
      const header  = { Authorization: `Bearer ${getToken()}` };
      const payload = new FormData();
      payload.append("editId",      id);
      payload.append("id",          params);
      payload.append("designphoto", formData.designphoto);
      payload.append("notes",       formData.notes);

      const res = await ApiService(payload, 0, header, AddConcept.method, AddConcept.url);

      if (res.status === 201 && !res.data.error) {
        toast.success(res.data.message || "Data submitted successfully");
        handleClose();
        onSuccess?.();
        if (fileInputRef.current) fileInputRef.current.value = "";
        setFormData({ designphoto: "", notes: "" });
        setFileName("");
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

      <div className="adc-backdrop" onClick={handleClose}>
        <div className="adc-dialog" onClick={(e) => e.stopPropagation()}>

          {/* ── Header ── */}
          <div className="adc-header">
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
                  Add Design Concept
                </h2>
                <p style={{ margin: 0, fontSize: 11, color: THEME.textMuted }}>
                  Upload a design file with a name
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
            <div className="adc-body">

              {/* Name */}
              <div>
                <label className="adc-label">
                  Name
                  <span style={{ color: THEME.error, marginLeft: 3 }}>*</span>
                </label>
                <input
                  className={`adc-input ${errors.notes ? "err" : ""}`}
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Enter design concept name…"
                  autoFocus
                />
                {errors.notes && <p className="adc-err">{errors.notes}</p>}
              </div>

              {/* File upload */}
              <div>
                <label className="adc-label">
                  Design File
                  <span style={{ color: THEME.error, marginLeft: 3 }}>*</span>
                </label>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  name="designphoto"
                  onChange={handleChange}
                  style={{ display: "none" }}
                />

                {/* Drop zone */}
                <div
                  className={`adc-dropzone ${fileName ? "has-file" : ""} ${errors.designphoto ? "err" : ""}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {fileName ? (
                    <>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>📎</div>
                      <p style={{
                        margin: "0 0 4px", fontSize: 13, fontWeight: 600,
                        color: THEME.brandDark, wordBreak: "break-all",
                      }}>
                        {fileName}
                      </p>
                      <p style={{ margin: 0, fontSize: 11, color: THEME.brandMid }}>
                        Click to change file
                      </p>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>🖼️</div>
                      <p style={{
                        margin: "0 0 4px", fontSize: 13, fontWeight: 600,
                        color: THEME.brandDark,
                      }}>
                        Click to upload design file
                      </p>
                      <p style={{ margin: 0, fontSize: 11, color: THEME.textMuted }}>
                        Supports JPG, PNG, PDF, DWG…
                      </p>
                    </>
                  )}
                </div>
                {errors.designphoto && <p className="adc-err">{errors.designphoto}</p>}
              </div>

            </div>

            {/* ── Footer ── */}
            <div className="adc-footer">
              <SecondaryBtn onClick={handleClose}>Cancel</SecondaryBtn>
              <PrimaryBtn type="submit" disabled={submitting || uploading}>
                {uploading
                  ? <><span className="adc-btn-spinner" /> Uploading to S3…</>
                  : submitting
                  ? <><span className="adc-btn-spinner" /> Saving…</>
                  : "✓ Add Concept"}
              </PrimaryBtn>
            </div>
          </form>

        </div>
      </div>
    </>
  );
};

export default AddDcModal;