
import React, { useEffect, useState } from "react";
import ApiService from "../../../../services/ApiService";
import { addarchitectureschedule, fetchActiveEmployee } from "../../../../config/config";
import { getToken } from "../../../../services/useLocalStorage";
import toast from "react-hot-toast";
import Select from "react-select";

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

  .ssm-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45); z-index: 1040;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .ssm-dialog {
    background: #fff; border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.18);
    width: 100%; max-width: 480px;
    display: flex; flex-direction: column;
    font-family: 'DM Sans', sans-serif;
    overflow: hidden;
    max-height: 90vh;
  }
  .ssm-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px; border-bottom: 1px solid ${THEME.border};
    background: #FDFAF5; flex-shrink: 0;
  }
  .ssm-body {
    padding: 22px 24px;
    display: flex; flex-direction: column; gap: 14px;
    overflow-y: auto;
  }
  .ssm-footer {
    display: flex; align-items: center; justify-content: flex-end;
    gap: 10px; padding: 14px 24px;
    border-top: 1px solid ${THEME.border};
    flex-shrink: 0;
  }
  .ssm-row-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .ssm-input {
    width: 100%; padding: 9px 12px; border-radius: 10px;
    border: 1.5px solid #E0D5C5; font-size: 13px;
    font-family: 'DM Sans', sans-serif; color: ${THEME.text};
    outline: none; background: #fff;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .ssm-input:focus {
    border-color: ${THEME.brand};
    box-shadow: 0 0 0 3px ${THEME.brand}18;
  }
  .ssm-input::placeholder { color: ${THEME.textLight}; }
  .ssm-input.err {
    border-color: ${THEME.errorBorder};
    background: ${THEME.errorLight};
  }

  /* react-select overrides */
  .ssm-select .select__control {
    border-radius: 10px !important;
    border: 1.5px solid #E0D5C5 !important;
    box-shadow: none !important;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    min-height: 40px;
  }
  .ssm-select .select__control--is-focused {
    border-color: ${THEME.brand} !important;
    box-shadow: 0 0 0 3px ${THEME.brand}18 !important;
  }
  .ssm-select .select__multi-value {
    background: ${THEME.brandLight};
    border: 1px solid ${THEME.brandMid};
    border-radius: 6px;
  }
  .ssm-select .select__multi-value__label {
    color: ${THEME.brandDark};
    font-size: 12px;
    font-family: 'DM Sans', sans-serif;
  }
  .ssm-select .select__multi-value__remove:hover {
    background: ${THEME.brandMid};
    color: #fff;
    border-radius: 0 6px 6px 0;
  }
  .ssm-select .select__placeholder { color: ${THEME.textLight}; font-size: 13px; }
  .ssm-select .select__option--is-focused { background: ${THEME.brandLight}; }
  .ssm-select .select__option--is-selected {
    background: ${THEME.brand}; color: #fff;
  }

  @keyframes ssmSpin { to { transform: rotate(360deg); } }
  .ssm-btn-spinner {
    width: 13px; height: 13px; border-radius: 50%;
    border: 2px solid #ffffff88; border-top-color: #fff;
    animation: ssmSpin 0.7s linear infinite; display: inline-block;
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

const EMPTY_FORM = {
  fromdate: "", todate: "", type: "",
  team_member: [], agency: "", remark: "",
};

const ShowScheduleModal = ({ show, handleClose, id, onSuccess }) => {
  const [emp,        setEmp]        = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData,   setFormData]   = useState(EMPTY_FORM);
  const [errors,     setErrors]     = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((p)   => ({ ...p, [name]: "" }));
  };

  const getEmployees = async () => {
    try {
      setLoading(true);
      const header = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService(null, 0, header, fetchActiveEmployee.method, fetchActiveEmployee.url);
      if (!res.data.error) {
        const options = res.data.data.map((m) => ({
          value: m.id,
          label: `${m.first_name} ${m.last_name}`,
        }));
        setEmp(options);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { getEmployees(); }, []);

  const validate = () => {
    const e = {};
    if (!formData.fromdate) e.fromdate = "From date is required";
    if (!formData.todate)   e.todate   = "To date is required";
    if (formData.fromdate && formData.todate && formData.todate < formData.fromdate)
      e.todate = "To date must be after from date";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    setErrors({});

    try {
      setSubmitting(true);
      const header  = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };
      const payload = { ...formData, editId: id };
      const res = await ApiService(payload, 0, header, addarchitectureschedule.method, addarchitectureschedule.url);

      if (res.status === 201 && !res.data.error) {
        toast.success(res.data.message || "Schedule added successfully");
        handleClose();
        onSuccess?.();
        setFormData(EMPTY_FORM);
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

      <div className="ssm-backdrop" onClick={handleClose}>
        <div className="ssm-dialog" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="ssm-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 3, height: 20, borderRadius: 2,
                background: `linear-gradient(180deg, ${THEME.brand} 0%, ${THEME.brandMid} 100%)`,
              }} />
              <h2 style={{
                margin: 0, fontSize: 16, fontWeight: 700,
                color: THEME.text, fontFamily: "'Sora', sans-serif",
              }}>
                Add Schedule
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
            <div className="ssm-body">

              {/* From / To Date row */}
              <div className="ssm-row-2">
                <div>
                  <FieldLabel required>From Date</FieldLabel>
                  <input
                    type="date"
                    className={`ssm-input ${errors.fromdate ? "err" : ""}`}
                    name="fromdate"
                    value={formData.fromdate}
                    onChange={handleChange}
                  />
                  <FieldError msg={errors.fromdate} />
                </div>
                <div>
                  <FieldLabel required>To Date</FieldLabel>
                  <input
                    type="date"
                    className={`ssm-input ${errors.todate ? "err" : ""}`}
                    name="todate"
                    value={formData.todate}
                    onChange={handleChange}
                  />
                  <FieldError msg={errors.todate} />
                </div>
              </div>

              {/* Type */}
              <div>
                <FieldLabel>Type</FieldLabel>
                <input
                  type="text"
                  className="ssm-input"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  placeholder="Enter schedule type…"
                />
              </div>

              {/* Team Members */}
              <div>
                <FieldLabel>Team Members</FieldLabel>
                <Select
                  isMulti
                  isLoading={loading}
                  options={emp}
                  className="ssm-select"
                  classNamePrefix="select"
                  placeholder="Select team members…"
                  value={formData.team_member.map((id) =>
                    emp.find((o) => o.value === id)
                  )}
                  onChange={(selected) => {
                    setFormData((p) => ({
                      ...p,
                      team_member: selected.map((o) => o.value),
                    }));
                  }}
                />
              </div>

              {/* Agency */}
              <div>
                <FieldLabel>Agency / Vendor</FieldLabel>
                <input
                  type="text"
                  className="ssm-input"
                  name="agency"
                  value={formData.agency}
                  onChange={handleChange}
                  placeholder="Enter agency or vendor name…"
                />
              </div>

              {/* Remark */}
              <div>
                <FieldLabel>Remarks</FieldLabel>
                <input
                  type="text"
                  className="ssm-input"
                  name="remark"
                  value={formData.remark}
                  onChange={handleChange}
                  placeholder="Add remarks…"
                />
              </div>

            </div>

            {/* Footer */}
            <div className="ssm-footer">
              <SecondaryBtn onClick={handleClose}>Cancel</SecondaryBtn>
              <PrimaryBtn type="submit" disabled={submitting}>
                {submitting
                  ? <><span className="ssm-btn-spinner" /> Submitting…</>
                  : "✓ Submit"}
              </PrimaryBtn>
            </div>
          </form>

        </div>
      </div>
    </>
  );
};

export default ShowScheduleModal;