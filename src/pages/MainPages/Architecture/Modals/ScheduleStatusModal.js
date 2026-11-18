

import React, { useEffect, useState } from "react";
import ApiService from "../../../../services/ApiService";
import {
  updatearchscheduleStatus,
  archschedulestatusbyid,
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

  .sst-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45); z-index: 1040;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .sst-dialog {
    background: #fff; border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.18);
    width: 100%; max-width: 420px;
    display: flex; flex-direction: column;
    font-family: 'DM Sans', sans-serif; overflow: hidden;
  }
  .sst-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px; border-bottom: 1px solid ${THEME.border};
    background: #FDFAF5; flex-shrink: 0;
  }
  .sst-body   { padding: 22px 24px; display: flex; flex-direction: column; gap: 16px; }
  .sst-footer {
    display: flex; align-items: center; justify-content: flex-end;
    gap: 10px; padding: 14px 24px;
    border-top: 1px solid ${THEME.border};
  }

  .sst-input {
    width: 100%; padding: 9px 12px; border-radius: 10px;
    border: 1.5px solid #E0D5C5; font-size: 13px;
    font-family: 'DM Sans', sans-serif; color: ${THEME.text};
    outline: none; background: #fff;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .sst-input:focus {
    border-color: ${THEME.brand};
    box-shadow: 0 0 0 3px ${THEME.brand}18;
  }
  .sst-input::placeholder { color: ${THEME.textLight}; }

  .sst-status-btn {
    flex: 1; border-radius: 10px; padding: 10px 14px;
    display: flex; align-items: center; gap: 8px;
    cursor: pointer; transition: all 0.18s;
    border: 1.5px solid #E0D5C5; background: #fff;
  }
  .sst-status-btn.active-approved {
    border-color: ${THEME.brandMid};
    background: ${THEME.brandLight};
  }
  .sst-status-btn.active-rejected {
    border-color: #FFA39E;
    background: ${THEME.errorLight};
  }
  .sst-radio {
    width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0;
    border: 2px solid #E0D5C5; background: #fff;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
  }
  .sst-radio.checked-approved { background: ${THEME.brand}; border-color: ${THEME.brand}; }
  .sst-radio.checked-rejected { background: ${THEME.error}; border-color: ${THEME.error}; }
  .sst-radio-dot {
    width: 6px; height: 6px; border-radius: 50%; background: #fff;
  }

  @keyframes sstSpin { to { transform: rotate(360deg); } }
  .sst-btn-spinner {
    width: 13px; height: 13px; border-radius: 50%;
    border: 2px solid #ffffff88; border-top-color: #fff;
    animation: sstSpin 0.7s linear infinite; display: inline-block;
  }
`;

const STATUS_OPTIONS = [
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

const EMPTY_FORM = { status: "", status_remark: "" };

const ScheduleStatusModal = ({ show, handleClose, id, onSuccess }) => {
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
        archschedulestatusbyid.method,
        archschedulestatusbyid.url
      );
      if ((res.status === 200 || res.status === 201) && res.data?.data?.length > 0) {
        const d = res.data.data[0];
        setFormData({
          // ✅ FIX: stringify so "1" === "1" works in toggle card comparison
          status:        d.status != null ? String(d.status) : "",
          status_remark: d.status_remark || "",
        });
      } else {
        toast.error("Failed to fetch schedule data");
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
    if (!formData.status) e.status = "Please select a status";
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
        updatearchscheduleStatus.method,
        updatearchscheduleStatus.url
      );
      if (res.status === 200 && !res.data.error) {
        toast.success(res.data.message || "Status updated successfully");
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

      <div className="sst-backdrop" onClick={handleClose}>
        <div className="sst-dialog" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="sst-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 3, height: 20, borderRadius: 2,
                background: `linear-gradient(180deg, ${THEME.brand} 0%, ${THEME.brandMid} 100%)`,
              }} />
              <h2 style={{
                margin: 0, fontSize: 16, fontWeight: 700,
                color: THEME.text, fontFamily: "'Sora', sans-serif",
              }}>
                Schedule Status
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
            <div className="sst-body">

              {/* Status toggle cards */}
              <div>
                <FieldLabel required>Status</FieldLabel>
                <div style={{ display: "flex", gap: 10 }}>
                  {STATUS_OPTIONS.map((opt) => {
                    const isActive = formData.status === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        className={`sst-status-btn ${isActive ? opt.activeClass : ""}`}
                        onClick={() => {
                          setFormData((p) => ({ ...p, status: opt.value }));
                          setErrors((p) => ({ ...p, status: "" }));
                        }}
                      >
                        <div className={`sst-radio ${isActive ? opt.radioClass : ""}`}>
                          {isActive && <div className="sst-radio-dot" />}
                        </div>
                        <span style={{
                          fontSize: 13,
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
                <FieldError msg={errors.status} />
              </div>

              {/* Remark */}
              <div>
                <FieldLabel>Remark</FieldLabel>
                <input
                  type="text"
                  className="sst-input"
                  name="status_remark"
                  value={formData.status_remark}
                  onChange={handleChange}
                  placeholder="Add a remark…"
                />
              </div>

            </div>

            {/* Footer */}
            <div className="sst-footer">
              <SecondaryBtn onClick={handleClose}>Cancel</SecondaryBtn>
              <PrimaryBtn type="submit" disabled={submitting}>
                {submitting
                  ? <><span className="sst-btn-spinner" /> Updating…</>
                  : "✓ Submit"}
              </PrimaryBtn>
            </div>
          </form>

        </div>
      </div>
    </>
  );
};

export default ScheduleStatusModal;