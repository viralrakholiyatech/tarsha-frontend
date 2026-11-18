// ─────────────────────────────────────────────
//  EditFollowups.jsx  —  Edit Follow Up Modal
//  Same design system as AddFollowups modal
// ─────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import ApiService from "../../../services/ApiService";
import { AddOrUpdateFollowups, fetchActiveEmployee, fetchFollowupsbyid } from "../../../config/config";
import { getToken } from "../../../services/useLocalStorage";
import toast from "react-hot-toast";
import Select from "react-select";


// ─────────────────────────────────────────────
//  🎨  THEME
// ─────────────────────────────────────────────
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
  errorBg:     "#FFF1F0",
  errorBorder: "#FFA39E",
};

const MODAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  @keyframes efSlideIn {
    from { opacity:0; transform:translateY(-18px) scale(0.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes efFadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes efSpin   { to { transform:rotate(360deg); } }
  @keyframes efShimmer {
    0%   { background-position:200% 0; }
    100% { background-position:-200% 0; }
  }

  .ef-overlay {
    position:fixed; inset:0; z-index:1050;
    background:rgba(26,26,46,0.45); backdrop-filter:blur(3px);
    display:flex; align-items:center; justify-content:center;
    animation:efFadeIn 0.2s ease; padding:16px;
  }
  .ef-dialog {
    background:#fff; border-radius:18px; width:100%; max-width:480px;
    box-shadow:0 20px 60px rgba(0,0,0,0.18);
    animation:efSlideIn 0.25s cubic-bezier(0.4,0,0.2,1);
    font-family:'DM Sans',sans-serif; overflow:hidden;
  }
  .ef-input {
    width:100%; padding:10px 13px; border-radius:10px;
    border:1.5px solid #E0D5C5; font-size:13px;
    font-family:'DM Sans',sans-serif; color:#1A1A2E;
    outline:none; background:#fff;
    transition:border-color 0.15s, box-shadow 0.15s;
    resize:vertical;
  }
  .ef-input:focus { border-color:${THEME.brand}; box-shadow:0 0 0 3px ${THEME.brand}18; }
  .ef-input::placeholder { color:${THEME.textLight}; }
  .ef-input.error { border-color:${THEME.errorBorder}; background:${THEME.errorBg}; }

  .ef-skel {
    border-radius:8px;
    background:linear-gradient(90deg,#F5EFE8 25%,#EDE5D5 50%,#F5EFE8 75%);
    background-size:200% 100%;
    animation:efShimmer 1.4s infinite;
  }

  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:${THEME.brandLight}; }
  ::-webkit-scrollbar-thumb { background:${THEME.brandMid}; border-radius:10px; }
`;

const selectStyles = {
  control: (base, state) => ({
    ...base,
    border: `1.5px solid ${state.isFocused ? THEME.brand : "#E0D5C5"}`,
    borderRadius: 10, minHeight: 42,
    boxShadow: state.isFocused ? `0 0 0 3px ${THEME.brand}18` : "none",
    fontFamily: "'DM Sans',sans-serif", fontSize: 13,
    "&:hover": { borderColor: THEME.brand },
  }),
  option: (base, state) => ({
    ...base,
    background:  state.isSelected ? THEME.brand : state.isFocused ? THEME.brandLight : "#fff",
    color:       state.isSelected ? "#fff" : THEME.text,
    fontSize: 13, fontFamily: "'DM Sans',sans-serif", cursor: "pointer",
  }),
  placeholder: (base) => ({ ...base, color: THEME.textLight, fontSize: 13 }),
  singleValue:  (base) => ({ ...base, color: THEME.text, fontSize: 13 }),
};

const EMPTY = { next_date: "", talk: "", assign_person: "", id: "" };


// ─────────────────────────────────────────────
//  🧩  ATOMS
// ─────────────────────────────────────────────

function FieldLabel({ children, required }) {
  return (
    <label style={{
      display: "block", marginBottom: 5,
      fontSize: 11, fontWeight: 700, color: THEME.textMuted,
      textTransform: "uppercase", letterSpacing: "0.07em",
    }}>
      {children}{required && <span style={{ color: THEME.error, marginLeft: 3 }}>*</span>}
    </label>
  );
}

function ErrorMsg({ message }) {
  if (!message) return null;
  return (
    <p style={{ margin: "4px 0 0", fontSize: 11, color: THEME.error, display: "flex", alignItems: "center", gap: 4 }}>
      ⚠ {message}
    </p>
  );
}

function PrimaryBtn({ children, type = "button", disabled }) {
  const [hov, setHov] = useState(false);
  return (
    <button type={type} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: "10px 24px", borderRadius: 10, border: "none",
        background: disabled ? "#C4C4C4" : hov ? THEME.brandDark : THEME.brand,
        color: "#fff", fontSize: 13, fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "'Sora',sans-serif", transition: "all 0.18s",
        boxShadow: disabled ? "none" : `0 2px 8px ${THEME.brand}44`,
        display: "inline-flex", alignItems: "center", gap: 6,
      }}>
      {children}
    </button>
  );
}

function SecondaryBtn({ children, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: "10px 24px", borderRadius: 10,
        border: `1.5px solid ${hov ? THEME.brand : "#E0D5C5"}`,
        background: hov ? THEME.brandLight : "#fff",
        color: hov ? THEME.brand : "#595959",
        fontSize: 13, fontWeight: 600, cursor: "pointer",
        fontFamily: "'DM Sans',sans-serif", transition: "all 0.18s",
      }}>
      {children}
    </button>
  );
}

function SkeletonBody() {
  return (
    <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {[1, 2].map((n) => (
          <div key={n}>
            <div className="ef-skel" style={{ width: 80, height: 10, marginBottom: 6 }} />
            <div className="ef-skel" style={{ height: 42 }} />
          </div>
        ))}
      </div>
      <div>
        <div className="ef-skel" style={{ width: 60, height: 10, marginBottom: 6 }} />
        <div className="ef-skel" style={{ height: 96 }} />
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const EditFollowups = ({ editshow, handleeditClose, onSuccess, LeadId, leadsId }) => {
  const [formData,   setFormData]   = useState(EMPTY);
  const [errors,     setErrors]     = useState({});
  const [emp,        setEmp]        = useState([]);
  const [fetching,   setFetching]   = useState(false);
  const [empLoading, setEmpLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ── Load employees + followup data ────────

  useEffect(() => {
    if (!editshow || !LeadId) return;

    const getEmployees = async () => {
      setEmpLoading(true);
      try {
        const h = { Authorization: `Bearer ${getToken()}` };
        const res = await ApiService(null, 0, h, fetchActiveEmployee.method, fetchActiveEmployee.url);
        if (!res.data.error)
          setEmp((res.data.data || []).map((m) => ({ value: m.id, label: `${m.first_name} ${m.last_name}` })));
      } catch (err) { console.error(err); }
      finally { setEmpLoading(false); }
    };

    const fetchFollowup = async () => {
      setFetching(true);
      try {
        const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };
        const res = await ApiService(null, LeadId, header, fetchFollowupsbyid.method, fetchFollowupsbyid.url);
        if ((res.status === 200 || res.status === 201) && res.data?.data?.length > 0) {
          const d = res.data.data[0];
          setFormData({
            assign_person: d.assign_person || "",
            next_date:     d.next_date     || "",
            talk:          d.talk          || "",
            id:            d.id            || "",
          });
        }
      } catch (err) { toast.error("An unexpected error occurred."); }
      finally { setFetching(false); }
    };

    getEmployees();
    fetchFollowup();
  }, [editshow, LeadId]);

  if (!editshow) return null;

  // ── Handlers ─────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.talk.trim()) newErrors.talk = "Remark is required";
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setSubmitting(true);
    try {
      const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };
      const payload = { ...formData, id: LeadId, lead_id: leadsId };
      const res = await ApiService(payload, 0, header, AddOrUpdateFollowups.method, AddOrUpdateFollowups.url);
      if (res.status === 200 && !res.data.error) {
        toast.success(res.data.message || "Follow-up updated successfully");
        handleeditClose();
        onSuccess?.();
      } else { toast.error(res.data?.message || "An error occurred"); }
    } catch { toast.error("An unexpected error occurred."); }
    finally { setSubmitting(false); }
  };

  return (
    <>
      <style>{MODAL_CSS}</style>

      <div className="ef-overlay" onClick={(e) => e.target === e.currentTarget && handleeditClose()}>
        <div className="ef-dialog">

          {/* ── Header ── */}
          <div style={{
            padding: "20px 24px 18px",
            borderBottom: `1px solid ${THEME.border}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "#fff",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: THEME.brandLight, border: `1px solid #D4C4A0`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                ✏️
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: THEME.text, fontFamily: "'Sora',sans-serif" }}>Edit Follow Up</h2>
                <p style={{ margin: 0, fontSize: 11, color: THEME.textMuted }}>
                  {fetching ? "Loading…" : `Follow-up #${LeadId}`}
                </p>
              </div>
            </div>
            <button onClick={handleeditClose}
              style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${THEME.border}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: THEME.textMuted, transition: "all 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = THEME.brandLight; e.currentTarget.style.color = THEME.brand; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = THEME.textMuted; }}>
              ×
            </button>
          </div>

          {/* ── Skeleton or Form ── */}
          {fetching ? <SkeletonBody /> : (
            <form onSubmit={handleSubmit} noValidate style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Date + Assign side by side */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <FieldLabel>Next Follow-Up Date</FieldLabel>
                  <input type="date" className="ef-input"
                    name="next_date" value={formData.next_date} onChange={handleChange} />
                </div>
                <div>
                  <FieldLabel>Assign Person</FieldLabel>
                  <Select
                    options={emp}
                    isLoading={empLoading}
                    isSearchable
                    placeholder="Select person…"
                    styles={selectStyles}
                    value={emp.find((o) => o.value == formData.assign_person) || null}
                    onChange={(opt) => setFormData((p) => ({ ...p, assign_person: opt?.value || "" }))}
                  />
                </div>
              </div>

              {/* Remark */}
              <div>
                <FieldLabel required>Remark</FieldLabel>
                <textarea className={`ef-input${errors.talk ? " error" : ""}`}
                  rows={4} name="talk"
                  placeholder="What was discussed?"
                  value={formData.talk} onChange={handleChange} />
                <ErrorMsg message={errors.talk} />
              </div>

              {/* Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 8, borderTop: `1px solid ${THEME.border}` }}>
                <SecondaryBtn onClick={handleeditClose}>Cancel</SecondaryBtn>
                <PrimaryBtn type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #ffffff88", borderTopColor: "#fff", display: "inline-block", animation: "efSpin 0.7s linear infinite" }} />
                      Saving…
                    </>
                  ) : "✓ Save Changes"}
                </PrimaryBtn>
              </div>
            </form>
          )}

        </div>
      </div>
    </>
  );
};

export default EditFollowups;