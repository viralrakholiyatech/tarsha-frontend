import React, { useEffect, useState } from "react";
import ApiService from "../../../../services/ApiService";
import { getToken } from "../../../../services/useLocalStorage";
import toast from "react-hot-toast";
import { updatePerformance, fetchPerformancebyid } from "../../../../config/config";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const THEME = {
  brand:      "#887549",
  brandLight: "#F5F0E8",
  brandMid:   "#C4A97D",
  brandDark:  "#5C4E32",
  border:     "#EDE5D5",
  text:       "#1A1A2E",
  textMuted:  "#ADADAD",
  textLight:  "#BDBDBD",
};

const MODAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }

  .pm-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45); z-index: 1040;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .pm-dialog {
    background: #fff; border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.18);
    width: 100%; max-width: 680px; max-height: 90vh;
    display: flex; flex-direction: column;
    font-family: 'DM Sans', sans-serif; overflow: hidden;
  }
  .pm-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px; border-bottom: 1px solid ${THEME.border};
    background: #FDFAF5; flex-shrink: 0;
  }
  .pm-body {
    padding: 22px 24px; overflow-y: auto; flex: 1;
  }
  .pm-body::-webkit-scrollbar { width: 4px; }
  .pm-body::-webkit-scrollbar-thumb { background: ${THEME.brandMid}; border-radius: 4px; }
  .pm-footer {
    display: flex; align-items: center; justify-content: flex-end;
    gap: 10px; padding: 14px 24px;
    border-top: 1px solid ${THEME.border}; flex-shrink: 0;
  }

  /* Quill overrides */
  .pm-quill-wrap { margin-bottom: 20px; }
  .pm-quill-wrap .ql-toolbar {
    border-radius: 10px 10px 0 0 !important;
    border-color: #E0D5C5 !important;
    background: ${THEME.brandLight} !important;
    font-family: 'DM Sans', sans-serif !important;
  }
  .pm-quill-wrap .ql-container {
    border-radius: 0 0 10px 10px !important;
    border-color: #E0D5C5 !important;
    font-family: 'DM Sans', sans-serif !important;
    font-size: 13px !important;
    min-height: 120px;
  }
  .pm-quill-wrap .ql-container:focus-within {
    border-color: ${THEME.brand} !important;
    box-shadow: 0 0 0 3px ${THEME.brand}18 !important;
  }
  .pm-quill-wrap .ql-editor { min-height: 120px; color: ${THEME.text}; }
  .pm-quill-wrap .ql-editor.ql-blank::before {
    color: ${THEME.textLight}; font-style: normal;
  }
  .pm-quill-wrap .ql-toolbar .ql-stroke { stroke: ${THEME.brandDark} !important; }
  .pm-quill-wrap .ql-toolbar .ql-fill   { fill:   ${THEME.brandDark} !important; }
  .pm-quill-wrap .ql-toolbar button:hover .ql-stroke { stroke: ${THEME.brand} !important; }

  .pm-label {
    display: block; margin-bottom: 8px;
    font-size: 13px; font-weight: 600; color: #434343;
    font-family: 'DM Sans', sans-serif;
  }

  @keyframes pmSpin { to { transform: rotate(360deg); } }
  .pm-spinner {
    width: 26px; height: 26px; border-radius: 50%;
    border: 3px solid ${THEME.brandLight}; border-top-color: ${THEME.brand};
    animation: pmSpin 0.8s linear infinite;
    margin: 48px auto; display: block;
  }
  .pm-btn-spinner {
    width: 13px; height: 13px; border-radius: 50%;
    border: 2px solid #ffffff88; border-top-color: #fff;
    animation: pmSpin 0.7s linear infinite; display: inline-block;
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
const PerformanceModal = ({ show, handleClose, id, onSuccess }) => {
  const [formData,   setFormData]   = useState({ keyhighlight: "", keyaction: "" });
  const [loading,    setLoading]    = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const authHeader = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };

  const fetchdata = async () => {
    try {
      setLoading(true);
      const res = await ApiService(null, id, authHeader, fetchPerformancebyid.method, fetchPerformancebyid.url);
      if (!res.data?.error) {
        const p = res.data.data[0];
        setFormData({
          keyhighlight: p.clarity_1_key_highlight || "",
          keyaction:    p.clarity_1_key_action    || "",
        });
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (show) fetchdata(); }, [id, show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await ApiService(
        { ...formData, editId: id }, 0, authHeader,
        updatePerformance.method, updatePerformance.url
      );
      if (res.status === 200 && !res.data.error) {
        toast.success(res.data.message || "Updated successfully");
        handleClose();
        onSuccess?.();
        setFormData({ keyhighlight: "", keyaction: "" });
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

      <div className="pm-backdrop" onClick={handleClose}>
        <div className="pm-dialog" onClick={(e) => e.stopPropagation()}>

          {/* ── Header ── */}
          <div className="pm-header">
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
                  Top 2 to 3 Outcome
                </h2>
                <p style={{ margin: 0, fontSize: 11, color: THEME.textMuted }}>
                  Update key highlights and actions
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
            <div className="pm-body">
              {loading ? (
                <div className="pm-spinner" />
              ) : (
                <>
                  {/* Key Highlight */}
                  <div className="pm-quill-wrap">
                    <label className="pm-label">
                      Key Highlight
                    </label>
                    <ReactQuill
                      theme="snow"
                      value={formData.keyhighlight}
                      onChange={(value) =>
                        setFormData((p) => ({ ...p, keyhighlight: value }))
                      }
                      placeholder="Enter key highlights…"
                    />
                  </div>

                  {/* Key Action */}
                  <div className="pm-quill-wrap">
                    <label className="pm-label">
                      Key Action
                    </label>
                    <ReactQuill
                      theme="snow"
                      value={formData.keyaction}
                      onChange={(value) =>
                        setFormData((p) => ({ ...p, keyaction: value }))
                      }
                      placeholder="Enter key actions…"
                    />
                  </div>
                </>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="pm-footer">
              <SecondaryBtn onClick={handleClose}>Cancel</SecondaryBtn>
              <PrimaryBtn type="submit" disabled={submitting || loading}>
                {submitting
                  ? <><span className="pm-btn-spinner" /> Saving…</>
                  : "✓ Save Changes"}
              </PrimaryBtn>
            </div>
          </form>

        </div>
      </div>
    </>
  );
};

export default PerformanceModal;