import React, { useEffect, useState } from "react";
import ApiService from "../../../../services/ApiService";
import { getToken } from "../../../../services/useLocalStorage";
import toast from "react-hot-toast";
import { updateClarityFocus, getClarityFocusbyId } from "../../../../config/config";
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

  .cf-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45); z-index: 1040;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .cf-dialog {
    background: #fff; border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.18);
    width: 100%; max-width: 680px; max-height: 90vh;
    display: flex; flex-direction: column;
    font-family: 'DM Sans', sans-serif; overflow: hidden;
  }
  .cf-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px; border-bottom: 1px solid ${THEME.border};
    background: #FDFAF5; flex-shrink: 0;
  }
  .cf-body {
    padding: 22px 24px; overflow-y: auto; flex: 1;
  }
  .cf-body::-webkit-scrollbar { width: 4px; }
  .cf-body::-webkit-scrollbar-thumb { background: ${THEME.brandMid}; border-radius: 4px; }
  .cf-footer {
    display: flex; align-items: center; justify-content: flex-end;
    gap: 10px; padding: 14px 24px;
    border-top: 1px solid ${THEME.border}; flex-shrink: 0;
  }

  /* Quill overrides */
  .cf-quill-wrap { margin-bottom: 20px; }
  .cf-quill-wrap .ql-toolbar {
    border-radius: 10px 10px 0 0 !important;
    border-color: #E0D5C5 !important;
    background: ${THEME.brandLight} !important;
    font-family: 'DM Sans', sans-serif !important;
  }
  .cf-quill-wrap .ql-container {
    border-radius: 0 0 10px 10px !important;
    border-color: #E0D5C5 !important;
    font-family: 'DM Sans', sans-serif !important;
    font-size: 13px !important;
    min-height: 120px;
  }
  .cf-quill-wrap .ql-container:focus-within {
    border-color: ${THEME.brand} !important;
    box-shadow: 0 0 0 3px ${THEME.brand}18 !important;
  }
  .cf-quill-wrap .ql-editor { min-height: 120px; color: ${THEME.text}; }
  .cf-quill-wrap .ql-editor.ql-blank::before {
    color: ${THEME.textLight}; font-style: normal;
  }
  .cf-quill-wrap .ql-toolbar .ql-stroke { stroke: ${THEME.brandDark} !important; }
  .cf-quill-wrap .ql-toolbar .ql-fill   { fill:   ${THEME.brandDark} !important; }
  .cf-quill-wrap .ql-toolbar button:hover .ql-stroke { stroke: ${THEME.brand} !important; }

  .cf-label {
    display: block; margin-bottom: 8px;
    font-size: 13px; font-weight: 600; color: #434343;
    font-family: 'DM Sans', sans-serif;
  }

  @keyframes cfSpin { to { transform: rotate(360deg); } }
  .cf-spinner {
    width: 26px; height: 26px; border-radius: 50%;
    border: 3px solid ${THEME.brandLight}; border-top-color: ${THEME.brand};
    animation: cfSpin 0.8s linear infinite;
    margin: 48px auto; display: block;
  }
  .cf-btn-spinner {
    width: 13px; height: 13px; border-radius: 50%;
    border: 2px solid #ffffff88; border-top-color: #fff;
    animation: cfSpin 0.7s linear infinite; display: inline-block;
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
const ClarityFocusModal = ({ show, handleClose, id, onSuccess }) => {
  const [formData,   setFormData]   = useState({ keyhighlight: "", keyaction: "" });
  const [loading,    setLoading]    = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const authHeader = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };

  const fetchdata = async () => {
    try {
      setLoading(true);
      const res = await ApiService(null, id, authHeader, getClarityFocusbyId.method, getClarityFocusbyId.url);
      if (!res.data?.error) {
        const p = res.data.data[0];
        setFormData({
          keyhighlight: p.clarity_2_key_highlight || "",
          keyaction:    p.clarity_2_key_action    || "",
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
        updateClarityFocus.method, updateClarityFocus.url
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

      <div className="cf-backdrop" onClick={handleClose}>
        <div className="cf-dialog" onClick={(e) => e.stopPropagation()}>

          {/* ── Header ── */}
          <div className="cf-header">
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
                  Clarity Focus
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
            <div className="cf-body">
              {loading ? (
                <div className="cf-spinner" />
              ) : (
                <>
                  <div className="cf-quill-wrap">
                    <label className="cf-label">Key Highlight</label>
                    <ReactQuill
                      theme="snow"
                      value={formData.keyhighlight}
                      onChange={(value) =>
                        setFormData((p) => ({ ...p, keyhighlight: value }))
                      }
                      placeholder="Enter key highlights…"
                    />
                  </div>

                  <div className="cf-quill-wrap">
                    <label className="cf-label">Key Action</label>
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
            <div className="cf-footer">
              <SecondaryBtn onClick={handleClose}>Cancel</SecondaryBtn>
              <PrimaryBtn type="submit" disabled={submitting || loading}>
                {submitting
                  ? <><span className="cf-btn-spinner" /> Saving…</>
                  : "✓ Save Changes"}
              </PrimaryBtn>
            </div>
          </form>

        </div>
      </div>
    </>
  );
};

export default ClarityFocusModal;