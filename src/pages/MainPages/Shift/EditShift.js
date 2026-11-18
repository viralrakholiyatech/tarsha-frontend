import React, { useEffect, useState } from "react";
import ApiService from "../../../services/ApiService";
import { updateShifts, getShiftbyid } from "../../../config/config";
import { getToken } from "../../../services/useLocalStorage";
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

  .es-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45);
    z-index: 1040;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .es-dialog {
    background: #fff; border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.18);
    width: 100%; max-width: 560px; max-height: 90vh;
    display: flex; flex-direction: column;
    font-family: 'DM Sans', sans-serif; overflow: hidden;
  }
  .es-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px; border-bottom: 1px solid ${THEME.border};
    flex-shrink: 0; background: #FDFAF5;
  }
  .es-body {
    padding: 20px 24px; overflow-y: auto; flex: 1;
  }
  .es-body::-webkit-scrollbar { width: 4px; }
  .es-body::-webkit-scrollbar-thumb { background: ${THEME.brandMid}; border-radius: 4px; }
  .es-footer {
    display: flex; align-items: center; justify-content: flex-end;
    gap: 10px; padding: 14px 24px;
    border-top: 1px solid ${THEME.border}; flex-shrink: 0;
  }

  .es-input {
    width: 100%; padding: 9px 12px; border-radius: 10px;
    border: 1.5px solid #E0D5C5; font-size: 13px;
    font-family: 'DM Sans', sans-serif; color: ${THEME.text};
    outline: none; background: #fff;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .es-input:focus { border-color: ${THEME.brand}; box-shadow: 0 0 0 3px ${THEME.brand}18; }
  .es-input::placeholder { color: ${THEME.textLight}; }
  .es-input[type="time"] { cursor: pointer; }

  .es-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .es-table th {
    padding: 9px 12px; font-size: 10px; font-weight: 700;
    color: ${THEME.brandDark}; text-transform: uppercase;
    letter-spacing: 0.07em; background: ${THEME.brandLight};
    border-bottom: 2px solid #D4C4A0; text-align: left;
  }
  .es-table td { padding: 7px 10px; border-bottom: 1px solid #F5EFE4; vertical-align: middle; }
  .es-table tbody tr:nth-child(even) { background: #FEFCF9; }
  .es-table tbody tr:hover { background: ${THEME.brandLight}; transition: background 0.12s; }

  .es-day { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: ${THEME.brandDark}; }
  .es-day-dot { width: 7px; height: 7px; border-radius: 50%; background: ${THEME.brandMid}; flex-shrink: 0; }

  @keyframes esSpin { to { transform: rotate(360deg); } }
  .es-spinner {
    width: 24px; height: 24px; border-radius: 50%;
    border: 3px solid ${THEME.brandLight}; border-top-color: ${THEME.brand};
    animation: esSpin 0.8s linear infinite; margin: 40px auto; display: block;
  }
  .es-btn-spinner {
    width: 13px; height: 13px; border-radius: 50%;
    border: 2px solid #ffffff88; border-top-color: #fff;
    animation: esSpin 0.7s linear infinite; display: inline-block;
  }
`;

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const EMPTY_SCHEDULE = () => DAYS.reduce((acc, d) => ({ ...acc, [d]: { from: "", to: "" } }), {});

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
const EditShift = ({ editshow, handleeditClose, clientId, onSuccess }) => {
  const [formData,   setFormData]   = useState({ name: "", id: "" });
  const [schedule,   setSchedule]   = useState(EMPTY_SCHEDULE());
  const [loading,    setLoading]    = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editshow && clientId) {
      const fetchShiftData = async () => {
        try {
          setLoading(true);
          const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };
          const res    = await ApiService({}, clientId, header, getShiftbyid.method, getShiftbyid.url);

          if ((res.status === 200 || res.status === 201) && res.data?.data) {
            const d = res.data.data;
            setFormData({ id: d.id, name: d.name || "" });

            const updated = EMPTY_SCHEDULE();
            d.schedule.forEach((item) => {
              if (updated[item.week]) {
                updated[item.week] = {
                  from: item.from_time ? item.from_time.slice(0, 5) : "",
                  to:   item.to_time   ? item.to_time.slice(0, 5)   : "",
                };
              }
            });
            setSchedule(updated);
          } else {
            toast.error("Failed to fetch shift data");
          }
        } catch (err) {
          console.error(err);
          toast.error("An unexpected error occurred.");
        } finally {
          setLoading(false);
        }
      };
      fetchShiftData();
    }
  }, [editshow, clientId]);

  const handleChange      = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleTimeChange  = (day, field, value) =>
    setSchedule((p) => ({ ...p, [day]: { ...p[day], [field]: value } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };
      const res    = await ApiService({ ...formData, schedule }, 0, header, updateShifts.method, updateShifts.url);

      if (res.status === 200 && !res.data.error) {
        toast.success(res.data.message || "Shift updated successfully");
        handleeditClose();
        onSuccess?.();
        setFormData({ name: "" });
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

  if (!editshow) return null;

  return (
    <>
      <style>{MODAL_CSS}</style>

      <div className="es-backdrop" onClick={handleeditClose}>
        <div className="es-dialog" onClick={(e) => e.stopPropagation()}>

          {/* ── Header ── */}
          <div className="es-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 3, height: 20, borderRadius: 2,
                background: `linear-gradient(180deg, ${THEME.brand} 0%, ${THEME.brandMid} 100%)`,
              }} />
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: THEME.text, fontFamily: "'Sora', sans-serif" }}>
                Edit Shift
              </h2>
            </div>
            <button
              onClick={handleeditClose}
              style={{
                width: 32, height: 32, borderRadius: 8,
                border: `1.5px solid ${THEME.border}`, background: "#fff",
                cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 18, color: THEME.textMuted,
                lineHeight: 1, transition: "all 0.15s",
              }}
            >
              ×
            </button>
          </div>

          {/* ── Body ── */}
          <form onSubmit={handleSubmit}>
            <div className="es-body">
              {loading ? (
                <div className="es-spinner" />
              ) : (
                <>
                  {/* Shift name */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{
                      display: "block", marginBottom: 6, fontSize: 13,
                      fontWeight: 600, color: "#434343", fontFamily: "'DM Sans', sans-serif",
                    }}>
                      Shift Name
                      <span style={{ color: THEME.error, marginLeft: 3 }}>*</span>
                    </label>
                    <input
                      className="es-input"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Morning Shift…"
                    />
                  </div>

                  {/* Schedule table */}
                  <label style={{
                    display: "block", marginBottom: 10, fontSize: 13,
                    fontWeight: 600, color: "#434343", fontFamily: "'DM Sans', sans-serif",
                  }}>
                    Weekly Schedule
                  </label>

                  <div style={{ borderRadius: 10, border: `1px solid ${THEME.border}`, overflow: "hidden" }}>
                    <table className="es-table">
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
                              <span className="es-day">
                                <span className="es-day-dot" />
                                {day}
                              </span>
                            </td>
                            <td style={{ minWidth: 130 }}>
                              <input
                                className="es-input"
                                type="time"
                                value={schedule[day].from}
                                onChange={(e) => handleTimeChange(day, "from", e.target.value)}
                              />
                            </td>
                            <td style={{ minWidth: 130 }}>
                              <input
                                className="es-input"
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
                </>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="es-footer">
              <SecondaryBtn onClick={handleeditClose}>Cancel</SecondaryBtn>
              <PrimaryBtn type="submit" disabled={submitting || loading}>
                {submitting ? (
                  <><span className="es-btn-spinner" /> Saving…</>
                ) : "✓ Save Changes"}
              </PrimaryBtn>
            </div>
          </form>

        </div>
      </div>
    </>
  );
};

export default EditShift;