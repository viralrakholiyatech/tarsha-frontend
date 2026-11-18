import React, { useState, useEffect, useRef } from "react";
import { getToken } from "../../../services/useLocalStorage";
import toast from "react-hot-toast";
import ApiService from "../../../services/ApiService";
import { addcategory } from "../../../config/config";

// ─────────────────────────────────────────────
//  🎨  THEME  (matches CategoryList)
// ─────────────────────────────────────────────
const THEME = {
  brand: "#887549",
  brandLight: "#F5F0E8",
  brandMid: "#C4A97D",
  brandDark: "#5C4E32",
  border: "#EDE5D5",
  text: "#1A1A2E",
  textMuted: "#ADADAD",
  textLight: "#BDBDBD",
};

const MODAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }

  @keyframes catOverlayIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes catSlideUp {
    from { opacity: 0; transform: translateY(24px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    }
  }
  @keyframes catSpin { to { transform: rotate(360deg); } }

  .cat-overlay {
    position: fixed; inset: 0; z-index: 1050;
    background: rgba(26,26,46,0.45);
    backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    animation: catOverlayIn 0.2s ease both;
    padding: 16px;
  }
  .cat-modal {
    background: #fff;
    border-radius: 18px;
    width: 100%; max-width: 440px;
    box-shadow: 0 24px 64px rgba(136,117,73,0.18), 0 4px 16px rgba(0,0,0,0.08);
    animation: catSlideUp 0.28s cubic-bezier(0.34,1.56,0.64,1) both;
    overflow: hidden;
    font-family: 'DM Sans', sans-serif;
  }

  /* ── Input ── */
  .cat-input {
    width: 100%; padding: 11px 14px;
    border: 1.5px solid #E0D5C5; border-radius: 10px;
    font-size: 13.5px; font-family: 'DM Sans', sans-serif;
    color: #1A1A2E; outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    background: #FDFAF5;
  }
  .cat-input:focus {
    border-color: #887549;
    box-shadow: 0 0 0 3px #88754918;
    background: #fff;
  }
  .cat-input::placeholder { color: #BDBDBD; }
  .cat-input.error { border-color: #FF4D4F; box-shadow: 0 0 0 3px #FF4D4F18; }

  /* ── Checkbox ── */
  .cat-check-wrap {
    display: flex; align-items: center; gap: 12px;
    padding: 13px 16px; border-radius: 12px;
    border: 1.5px solid #E0D5C5; background: #FDFAF5;
    cursor: pointer; user-select: none;
    transition: border-color 0.15s, background 0.15s;
  }
  .cat-check-wrap:hover { border-color: #887549; background: #FBF8F2; }
  .cat-check-wrap.checked { border-color: #25D366; background: #F0FBF4; }

  .cat-checkbox {
    appearance: none; -webkit-appearance: none;
    width: 20px; height: 20px; border-radius: 6px; flex-shrink: 0;
    border: 2px solid #C4A97D; background: #fff;
    cursor: pointer; position: relative;
    transition: all 0.15s;
  }
  .cat-checkbox:checked {
    background: #25D366; border-color: #25D366;
  }
  .cat-checkbox:checked::after {
    content: '';
    position: absolute; left: 5px; top: 2px;
    width: 6px; height: 10px;
    border: 2px solid #fff; border-top: none; border-left: none;
    transform: rotate(45deg);
  }
  .cat-checkbox:focus { outline: none; box-shadow: 0 0 0 3px #25D36620; }

  /* ── Buttons ── */
  .cat-btn-cancel {
    flex: 1; padding: 11px;
    border-radius: 10px; border: 1.5px solid #E0D5C5;
    background: #fff; color: #595959;
    font-size: 13px; font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer; transition: all 0.15s;
  }
  .cat-btn-cancel:hover { border-color: #C4A97D; background: #FDFAF5; color: #887549; }

  .cat-btn-submit {
    flex: 1; padding: 11px;
    border-radius: 10px; border: none;
    background: #887549; color: #fff;
    font-size: 13px; font-weight: 700;
    font-family: 'Sora', sans-serif;
    cursor: pointer; transition: all 0.18s;
    box-shadow: 0 2px 8px #88754944;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .cat-btn-submit:hover:not(:disabled) { background: #5C4E32; box-shadow: 0 4px 14px #88754955; }
  .cat-btn-submit:disabled { opacity: 0.65; cursor: not-allowed; }

  .cat-spinner {
    width: 15px; height: 15px; border-radius: 50%;
    border: 2px solid #ffffff55; border-top-color: #fff;
    animation: catSpin 0.7s linear infinite;
  }

  /* ── Close button ── */
  .cat-close {
    width: 32px; height: 32px; border-radius: 8px;
    border: none; background: #F5F0E8;
    color: #887549; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s; flex-shrink: 0;
  }
  .cat-close:hover { background: #EDE5D5; color: #5C4E32; }
`;

// ─────────────────────────────────────────────
//  🚀  ADD MODAL
// ─────────────────────────────────────────────
const AddModal = ({ show, handleClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState("");
  const inputRef = useRef(null);

  // Reset form whenever modal opens
  useEffect(() => {
    if (show) {
      setName("");
      setWhatsapp(false);
      setNameError("");
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [show]);

  // Close on Escape key
  useEffect(() => {
    if (!show) return;
    const onKey = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show, handleClose]);

  const validate = () => {
    if (!name.trim()) {
      setNameError("Category name is required.");
      return false;
    }
    if (name.trim().length < 2) {
      setNameError("Name must be at least 2 characters.");
      return false;
    }
    return true;
  };

const handleSubmit = async () => {
  if (!validate()) return;
  setLoading(true);
  try {
    const header = {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    };
    const body = { name: name.trim(), whatsapp: whatsapp ? 1 : 0 };



    const res = await ApiService(
      body,
      0,
      header,
      addcategory.method,
      addcategory.url,
    );

    if (!res.data.error) {
      toast.success(res.data?.message || "Category added successfully!");
      onSuccess?.();
      handleClose();
    } else {
      toast.error(res.data?.message || "Failed to add category.");
    }
  } catch (err) {
    // ✅ Log the full error so you can see exactly what broke
    console.error("Add category error:", err);
    toast.error(
      err?.response?.data?.message ||
      err?.message ||
      "Something went wrong."
    );
  } finally {
    setLoading(false);
  }
};

  if (!show) return null;

  return (
    <>
      <style>{MODAL_CSS}</style>

      {/* Overlay — click outside to close */}
      <div
        className="cat-overlay"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        <div className="cat-modal">
          {/* ── Modal Header ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 24px 18px",
              borderBottom: "1px solid #F5EFE4",
              background: THEME.brandLight,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Accent bar */}
              <div
                style={{
                  width: 4,
                  height: 24,
                  borderRadius: 3,
                  background: `linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)`,
                }}
              />
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 17,
                    fontWeight: 800,
                    color: THEME.text,
                    fontFamily: "'Sora',sans-serif",
                    letterSpacing: "-0.2px",
                  }}
                >
                  Add Category
                </h2>
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    color: THEME.textMuted,
                    marginTop: 1,
                  }}
                >
                  Fill in the details below
                </p>
              </div>
            </div>

            <button className="cat-close" onClick={handleClose} title="Close">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* ── Modal Body ── */}
          <div style={{ padding: "24px" }}>
            {/* Category Name */}
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 700,
                  color: THEME.brandDark,
                  marginBottom: 7,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Category Name <span style={{ color: "#FF4D4F" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                {/* Left icon */}
                <span
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    fontSize: 15,
                  }}
                >
                  🗂️
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  className={`cat-input${nameError ? " error" : ""}`}
                  placeholder="e.g. Electronics, Furniture…"
                  value={name}
                  style={{ paddingLeft: 38 }}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                  }}
                  maxLength={100}
                />
              </div>
              {nameError && (
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: 11.5,
                    color: "#FF4D4F",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="#FF4D4F"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                  {nameError}
                </p>
              )}
            </div>

            {/* WhatsApp Checkbox */}
            <div style={{ marginBottom: 28 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 700,
                  color: THEME.brandDark,
                  marginBottom: 7,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                WhatsApp
              </label>
              <label
                className={`cat-check-wrap${whatsapp ? " checked" : ""}`}
                htmlFor="cat-whatsapp"
              >
                <input
                  id="cat-whatsapp"
                  type="checkbox"
                  className="cat-checkbox"
                  checked={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.checked)}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 7 }}
                  >
                    {/* WhatsApp icon */}
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill={whatsapp ? "#25D366" : THEME.textMuted}
                    >
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.41A9.945 9.945 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Zm5.093 13.857c-.214.601-1.257 1.148-1.715 1.18-.44.031-.855.21-2.88-.6-2.43-.978-3.984-3.46-4.104-3.619-.12-.16-.975-1.297-.975-2.473 0-1.177.614-1.756.832-1.995.217-.24.474-.3.632-.3l.455.009c.146.006.341-.056.534.408.199.479.678 1.656.738 1.776.06.12.099.26.019.42-.08.16-.12.26-.238.4-.12.14-.252.313-.36.42-.12.12-.244.25-.105.49.14.24.62 1.024 1.33 1.658.915.814 1.686 1.066 1.924 1.186.238.12.377.1.516-.06.14-.16.598-.698.758-.938.16-.24.319-.2.538-.12.22.08 1.397.659 1.636.779.24.12.399.18.458.28.06.099.06.579-.153 1.18Z" />
                    </svg>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: whatsapp ? "#1B5E20" : THEME.text,
                      }}
                    >
                      Enable WhatsApp
                    </span>
                    {whatsapp && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#25D366",
                          background: "#E8F5E9",
                          padding: "2px 7px",
                          borderRadius: 20,
                          border: "1px solid #A5D6A7",
                        }}
                      >
                        ON
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      margin: "3px 0 0",
                      fontSize: 11,
                      color: THEME.textMuted,
                    }}
                  >
                    Send WhatsApp notifications for this category
                  </p>
                </div>
              </label>
            </div>

            {/* ── Footer Buttons ── */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="cat-btn-cancel"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="cat-btn-submit"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="cat-spinner" /> Saving…
                  </>
                ) : (
                  <>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Category
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddModal;
