import React, { useState } from "react";
import ApiService from "../../../services/ApiService";
import { addShifts } from "../../../config/config";
import { getToken } from "../../../services/useLocalStorage";
import toast from "react-hot-toast";

// ─────────────────────────────────────────────
//  🎨  THEME
// ─────────────────────────────────────────────
const THEME = {
  brand:      "#887549",
  brandLight: "#F5F0E8",
  brandMid:   "#C4A97D",
  brandDark:  "#5C4E32",
  border:     "#EDE5D5",
  text:       "#1A1A2E",
  textMuted:  "#ADADAD",
  textLight:  "#BDBDBD",
  error:      "#CF1322",
  errorLight: "#FFF1F0",
  errorBorder:"#FFA39E",
};

const MODAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }

  .as-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45);
    z-index: 1040;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .as-dialog {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.18);
    width: 100%; max-width: 560px;
    max-height: 90vh;
    display: flex; flex-direction: column;
    font-family: 'DM Sans', sans-serif;
    overflow: hidden;
  }
  .as-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px;
    border-bottom: 1px solid ${THEME.border};
    flex-shrink: 0;
    background: #FDFAF5;
  }
  .as-body {
    padding: 20px 24px;
    overflow-y: auto; flex: 1;
  }
  .as-body::-webkit-scrollbar { width: 4px; }
  .as-body::-webkit-scrollbar-thumb { background: ${THEME.brandMid}; border-radius: 4px; }
  .as-footer {
    display: flex; align-items: center; justify-content: flex-end;
    gap: 10px; padding: 14px 24px;
    border-top: 1px solid ${THEME.border};
    flex-shrink: 0;
  }

  /* Input */
  .as-input {
    width: 100%; padding: 9px 12px; border-radius: 10px;
    border: 1.5px solid #E0D5C5; font-size: 13px;
    font-family: 'DM Sans', sans-serif; color: ${THEME.text};
    outline: none; background: #fff;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .as-input:focus {
    border-color: ${THEME.brand};
    box-shadow: 0 0 0 3px ${THEME.brand}18;
  }
  .as-input.error {
    border-color: ${THEME.errorBorder};
    background: ${THEME.errorLight};
  }
  .as-input::placeholder { color: ${THEME.textLight}; }
  .as-input[type="time"] { cursor: pointer; }

  /* Schedule table */
  .as-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .as-table th {
    padding: 9px 12px; font-size: 10px; font-weight: 700;
    color: ${THEME.brandDark}; text-transform: uppercase;
    letter-spacing: 0.07em; background: ${THEME.brandLight};
    border-bottom: 2px solid #D4C4A0; text-align: left;
  }
  .as-table td {
    padding: 7px 10px; border-bottom: 1px solid #F5EFE4;
    vertical-align: middle;
  }
  .as-table tbody tr:nth-child(even) { background: #FEFCF9; }
  .as-table tbody tr:hover { background: ${THEME.brandLight}; transition: background 0.12s; }

  /* Day badge */
  .as-day {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 12px; font-weight: 700; color: ${THEME.brandDark};
  }
  .as-day-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: ${THEME.brandMid}; flex-shrink: 0;
  }

  @keyframes asSpin { to { transform: rotate(360deg); } }
  .as-btn-spinner {
    width: 13px; height: 13px; border-radius: 50%;
    border: 2px solid #ffffff88; border-top-color: #fff;
    animation: asSpin 0.7s linear infinite;
    display: inline-block;
  }
`;

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const EMPTY_SCHEDULE = () =>
  DAYS.reduce((acc, d) => ({ ...acc, [d]: { from: "", to: "" } }), {});

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
    >
      {children}
    </button>
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
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const AddShift = ({ show, handleClose, onSuccess }) => {
  const [formData,    setFormData]    = useState({ name: "" });
  const [schedule,    setSchedule]    = useState(EMPTY_SCHEDULE());
  const [errors,      setErrors]      = useState({});
  const [submitting,  setSubmitting]  = useState(false);

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p)    => ({ ...p, [e.target.name]: "" }));
  };

  const handleTimeChange = (day, field, value) => {
    setSchedule((p) => ({ ...p, [day]: { ...p[day], [field]: value } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Shift name is required";
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    setErrors({});

    try {
      setSubmitting(true);
      const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };
      const res    = await ApiService({ ...formData, schedule }, 0, header, addShifts.method, addShifts.url);

      if (res.status === 201 && !res.data.error) {
        toast.success(res.data.message || "Shift added successfully");
        handleClose();
        onSuccess?.();
        setFormData({ name: "" });
        setSchedule(EMPTY_SCHEDULE());
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

      {/* Backdrop */}
      <div className="as-backdrop" onClick={handleClose}>
        <div className="as-dialog" onClick={(e) => e.stopPropagation()}>

          {/* ── Header ── */}
          <div className="as-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 3, height: 20, borderRadius: 2,
                background: `linear-gradient(180deg, ${THEME.brand} 0%, ${THEME.brandMid} 100%)`,
              }} />
              <h2 style={{
                margin: 0, fontSize: 16, fontWeight: 700,
                color: THEME.text, fontFamily: "'Sora', sans-serif",
              }}>
                Add Shift
              </h2>
            </div>
            <button
              onClick={handleClose}
              style={{
                width: 32, height: 32, borderRadius: 8,
                border: `1.5px solid ${THEME.border}`,
                background: "#fff", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, color: THEME.textMuted, lineHeight: 1,
                transition: "all 0.15s",
              }}
            >
              ×
            </button>
          </div>

          {/* ── Body ── */}
          <form onSubmit={handleSubmit}>
            <div className="as-body">

              {/* Shift name */}
              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: "block", marginBottom: 6,
                  fontSize: 13, fontWeight: 600, color: "#434343",
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  Shift Name
                  <span style={{ color: THEME.error, marginLeft: 3 }}>*</span>
                </label>
                <input
                  className={`as-input ${errors.name ? "error" : ""}`}
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Morning Shift, Night Shift…"
                />
                {errors.name && (
                  <p style={{ margin: "4px 0 0", fontSize: 11, color: THEME.error }}>
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Schedule table */}
              <label style={{
                display: "block", marginBottom: 10,
                fontSize: 13, fontWeight: 600, color: "#434343",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                Weekly Schedule
              </label>

              <div style={{ borderRadius: 10, border: `1px solid ${THEME.border}`, overflow: "hidden" }}>
                <table className="as-table">
                  <thead>
                    <tr>
                      <th style={{ width: 130 }}>Day</th>
                      <th>From</th>
                      <th>To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS.map((day) => (
                      <tr key={day}>
                        <td>
                          <span className="as-day">
                            <span className="as-day-dot" />
                            {day}
                          </span>
                        </td>
                        <td style={{ minWidth: 130 }}>
                          <input
                            className="as-input"
                            type="time"
                            value={schedule[day].from}
                            onChange={(e) => handleTimeChange(day, "from", e.target.value)}
                          />
                        </td>
                        <td style={{ minWidth: 130 }}>
                          <input
                            className="as-input"
                            type="time"
                            value={schedule[day].to}
                            onChange={(e) => handleTimeChange(day, "to", e.target.value)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

            {/* ── Footer ── */}
            <div className="as-footer">
              <SecondaryBtn onClick={handleClose}>Cancel</SecondaryBtn>
              <PrimaryBtn type="submit" disabled={submitting}>
                {submitting ? (
                  <><span className="as-btn-spinner" /> Saving…</>
                ) : "✓ Add Shift"}
              </PrimaryBtn>
            </div>
          </form>

        </div>
      </div>
    </>
  );
};

export default AddShift;