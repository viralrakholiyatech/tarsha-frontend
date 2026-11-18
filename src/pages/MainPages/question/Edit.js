// ─────────────────────────────────────────────
//  EditQuestion.jsx  —  Edit Question Modal
//  Same design system as AddQuestion / EditFollowups
// ─────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import ApiService from "../../../services/ApiService";
import { AddOrUpdateQuestion, fetchQuestiondatabyid } from "../../../config/config";
import { getToken } from "../../../services/useLocalStorage";
import toast from "react-hot-toast";


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
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  @keyframes eqSlideIn {
    from { opacity:0; transform:translateY(-18px) scale(0.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes eqFadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes eqSpin   { to { transform:rotate(360deg); } }
  @keyframes eqShimmer {
    0%   { background-position:200% 0; }
    100% { background-position:-200% 0; }
  }

  .eq-overlay {
    position:fixed; inset:0; z-index:1050;
    background:rgba(26,26,46,0.45); backdrop-filter:blur(3px);
    display:flex; align-items:center; justify-content:center;
    animation:eqFadeIn 0.2s ease; padding:16px;
  }
  .eq-dialog {
    background:#fff; border-radius:18px; width:100%; max-width:460px;
    box-shadow:0 20px 60px rgba(0,0,0,0.18);
    animation:eqSlideIn 0.25s cubic-bezier(0.4,0,0.2,1);
    font-family:'DM Sans',sans-serif; overflow:hidden;
  }
  .eq-input {
    width:100%; padding:10px 13px; border-radius:10px;
    border:1.5px solid #E0D5C5; font-size:13px;
    font-family:'DM Sans',sans-serif; color:#1A1A2E;
    outline:none; background:#fff;
    transition:border-color 0.15s, box-shadow 0.15s;
    resize:vertical;
  }
  .eq-input:focus { border-color:${THEME.brand}; box-shadow:0 0 0 3px ${THEME.brand}18; }
  .eq-input::placeholder { color:${THEME.textLight}; }
  .eq-input.error { border-color:${THEME.errorBorder}; background:${THEME.errorBg}; }
  .eq-skel {
    border-radius:8px;
    background:linear-gradient(90deg,#F5EFE8 25%,#EDE5D5 50%,#F5EFE8 75%);
    background-size:200% 100%;
    animation:eqShimmer 1.4s infinite;
  }
`;

const EMPTY = { heading: "", answer: "" };


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
      {[{ w: "100%", h: 42 }, { w: "100%", h: 96 }].map((s, i) => (
        <div key={i}>
          <div className="eq-skel" style={{ width: 80, height: 10, marginBottom: 6 }} />
          <div className="eq-skel" style={{ width: s.w, height: s.h }} />
        </div>
      ))}
    </div>
  );
}


// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const EditQuestion = ({ editshow, handleeditClose, onSuccess, leadsId, LeadId }) => {
  const [formData,   setFormData]   = useState(EMPTY);
  const [errors,     setErrors]     = useState({});
  const [fetching,   setFetching]   = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ── Fetch existing data ───────────────────
  useEffect(() => {
    if (!editshow || !LeadId) return;
    const fetchData = async () => {
      setFetching(true);
      try {
        const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };
        const res = await ApiService(null, LeadId, header, fetchQuestiondatabyid.method, fetchQuestiondatabyid.url);
        if ((res.status === 200 || res.status === 201) && res.data?.data?.length > 0) {
          const d = res.data.data[0];
          setFormData({ heading: d.heading || "", answer: d.answer || "" });
        }
      } catch { toast.error("An unexpected error occurred."); }
      finally { setFetching(false); }
    };
    fetchData();
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
    if (!formData.heading.trim()) newErrors.heading = "Question is required";
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setSubmitting(true);
    try {
      const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };
      const res = await ApiService({ ...formData, id: LeadId, lead_id: leadsId }, 0, header, AddOrUpdateQuestion.method, AddOrUpdateQuestion.url);
      if (res.status === 200 && !res.data.error) {
        toast.success(res.data.message || "Question updated successfully");
        handleeditClose();
        onSuccess?.();
        setFormData(EMPTY);
        setErrors({});
      } else { toast.error(res.data?.message || "An error occurred"); }
    } catch { toast.error("An unexpected error occurred."); }
    finally { setSubmitting(false); }
  };

  return (
    <>
      <style>{MODAL_CSS}</style>

      <div className="eq-overlay" onClick={(e) => e.target === e.currentTarget && handleeditClose()}>
        <div className="eq-dialog">

          {/* ── Header ── */}
          <div style={{
            padding: "20px 24px 18px", borderBottom: `1px solid ${THEME.border}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: THEME.brandLight, border: `1px solid #D4C4A0`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
              }}>✏️</div>
              <div>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: THEME.text, fontFamily: "'Sora',sans-serif" }}>
                  Edit Question
                </h2>
                <p style={{ margin: 0, fontSize: 11, color: THEME.textMuted }}>
                  {fetching ? "Loading…" : `Question #${LeadId}`}
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

              <div>
                <FieldLabel required>Question</FieldLabel>
                <input type="text" className={`eq-input${errors.heading ? " error" : ""}`}
                  name="heading" placeholder="Enter the question…"
                  value={formData.heading} onChange={handleChange} />
                <ErrorMsg message={errors.heading} />
              </div>

              <div>
                <FieldLabel>Answer</FieldLabel>
                <textarea className="eq-input" rows={4}
                  name="answer" placeholder="Enter the answer…"
                  value={formData.answer} onChange={handleChange} />
              </div>

              {/* Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 8, borderTop: `1px solid ${THEME.border}` }}>
                <SecondaryBtn onClick={handleeditClose}>Cancel</SecondaryBtn>
                <PrimaryBtn type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #ffffff88", borderTopColor: "#fff", display: "inline-block", animation: "eqSpin 0.7s linear infinite" }} />
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

export default EditQuestion;