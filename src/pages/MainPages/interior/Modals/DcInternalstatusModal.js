


import React, { useEffect, useState } from "react";
import ApiService from "../../../../services/ApiService";
import {
  updateinteriordcintenalstatus,
  interiordcinternalStatusbyid,
} from "../../../../config/config";
import { getToken } from "../../../../services/useLocalStorage";
import toast from "react-hot-toast";

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

  .is3d-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45); z-index: 1040;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .is3d-dialog {
    background: #fff; border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.18);
    width: 100%; max-width: 420px;
    display: flex; flex-direction: column;
    font-family: 'DM Sans', sans-serif; overflow: hidden;
  }
  .is3d-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px; border-bottom: 1px solid ${THEME.border};
    background: #FDFAF5; flex-shrink: 0;
  }
  .is3d-body   { padding: 22px 24px; display: flex; flex-direction: column; gap: 16px; }
  .is3d-footer {
    display: flex; align-items: center; justify-content: flex-end;
    gap: 10px; padding: 14px 24px;
    border-top: 1px solid ${THEME.border};
  }

  .is3d-input {
    width: 100%; padding: 9px 12px; border-radius: 10px;
    border: 1.5px solid #E0D5C5; font-size: 13px;
    font-family: 'DM Sans', sans-serif; color: ${THEME.text};
    outline: none; background: #fff;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .is3d-input:focus {
    border-color: ${THEME.brand};
    box-shadow: 0 0 0 3px ${THEME.brand}18;
  }
  .is3d-input::placeholder { color: ${THEME.textLight}; }

  .is3d-status-btn {
    flex: 1; border-radius: 10px; padding: 10px;
    display: flex; align-items: center; gap: 7px;
    cursor: pointer; transition: all 0.18s;
    border: 1.5px solid #E0D5C5; background: #fff;
  }
  .is3d-status-btn.active-pending  { border-color: #888780; background: #F1EFE8; }
  .is3d-status-btn.active-approved { border-color: ${THEME.brandMid}; background: ${THEME.brandLight}; }
  .is3d-status-btn.active-rejected { border-color: #FFA39E; background: ${THEME.errorLight}; }

  .is3d-radio {
    width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0;
    border: 2px solid #E0D5C5; background: #fff;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
  }
  .is3d-radio.checked-pending  { background: #888780; border-color: #888780; }
  .is3d-radio.checked-approved { background: ${THEME.brand}; border-color: ${THEME.brand}; }
  .is3d-radio.checked-rejected { background: ${THEME.error}; border-color: ${THEME.error}; }
  .is3d-radio-dot { width: 6px; height: 6px; border-radius: 50%; background: #fff; }

  @keyframes is3dSpin { to { transform: rotate(360deg); } }
  .is3d-btn-spinner {
    width: 13px; height: 13px; border-radius: 50%;
    border: 2px solid #ffffff88; border-top-color: #fff;
    animation: is3dSpin 0.7s linear infinite; display: inline-block;
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
      display: "block", marginBottom: 8,
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

const EMPTY_FORM = { internalstatus: "", internalremark: "" };

const DcInternalstatusModal = ({ show, handleClose, id, onSuccess }) => {
  const [formData,   setFormData]   = useState(EMPTY_FORM);
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((p)   => ({ ...p, [name]: "" }));
  };

  useEffect(() => {
    if (!show || !id) return;
    const fetchData = async () => {
      try {
        const header = {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        };
        const res = await ApiService(
          formData, id, header,
          interiordcinternalStatusbyid.method,
          interiordcinternalStatusbyid.url
        );
        if ((res.status === 200 || res.status === 201) && res.data?.data?.length > 0) {
          const d = res.data.data[0];
          setFormData({
            internalstatus: d.internalstatus || "",
            internalremark: d.internalremark || "",
          });
        } else {
          toast.error("Failed to fetch data");
        }
      } catch (err) {
        console.error(err);
        toast.error("An unexpected error occurred.");
      }
    };
    fetchData();
  }, [show, id]);

  const validate = () => {
    const e = {};
    if (formData.internalstatus === "") e.internalstatus = "Please select a status";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    setErrors({});

    try {
      setSubmitting(true);
      const header = {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      };
      const res = await ApiService(
        { ...formData, Id: id }, 0, header,
        updateinteriordcintenalstatus.method,
        updateinteriordcintenalstatus.url
      );
      if (res.status === 200 && !res.data.error) {
        toast.success(res.data.message || "Internal status updated successfully");
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

  if (!show) return null;

  return (
    <>
      <style>{MODAL_CSS}</style>

      <div className="is3d-backdrop" onClick={handleClose}>
        <div className="is3d-dialog" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="is3d-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 3, height: 20, borderRadius: 2,
                background: `linear-gradient(180deg, ${THEME.brand} 0%, ${THEME.brandMid} 100%)`,
              }} />
              <h2 style={{
                margin: 0, fontSize: 16, fontWeight: 700,
                color: THEME.text, fontFamily: "'Sora', sans-serif",
              }}>
                Internal Status
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
            <div className="is3d-body">

              {/* Status toggle cards — 3 options */}
              <div>
                <FieldLabel required>Internal Review Status</FieldLabel>
                <div style={{ display: "flex", gap: 8 }}>
                  {STATUS_OPTIONS.map((opt) => {
                    const isActive = String(formData.internalstatus) === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        className={`is3d-status-btn ${isActive ? opt.activeClass : ""}`}
                        onClick={() => {
                          setFormData((p) => ({ ...p, internalstatus: opt.value }));
                          setErrors((p) => ({ ...p, internalstatus: "" }));
                        }}
                      >
                        <div className={`is3d-radio ${isActive ? opt.radioClass : ""}`}>
                          {isActive && <div className="is3d-radio-dot" />}
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
                <FieldError msg={errors.internalstatus} />
              </div>

              {/* Remark */}
              <div>
                <FieldLabel>Remark</FieldLabel>
                <input
                  type="text"
                  className="is3d-input"
                  name="internalremark"
                  value={formData.internalremark}
                  onChange={handleChange}
                  placeholder="Add a remark…"
                />
              </div>

            </div>

            {/* Footer */}
            <div className="is3d-footer">
              <SecondaryBtn onClick={handleClose}>Cancel</SecondaryBtn>
              <PrimaryBtn type="submit" disabled={submitting}>
                {submitting
                  ? <><span className="is3d-btn-spinner" /> Updating…</>
                  : "✓ Submit"}
              </PrimaryBtn>
            </div>
          </form>

        </div>
      </div>
    </>
  );
};

export default DcInternalstatusModal;