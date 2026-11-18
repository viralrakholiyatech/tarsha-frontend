import React, { useEffect } from "react";

// ─────────────────────────────────────────────
//  🎨  THEME (matches AddFile / TentativeList)
// ─────────────────────────────────────────────
const THEME = {
  brand: "#887549",
  brandLight: "#F5F0E8",
  brandMid: "#C4A97D",
  brandDark: "#5C4E32",
  bg: "#F8F5F0",
  border: "#EDE5D5",
  text: "#1A1A2E",
  textMuted: "#8C8C8C",
  textLight: "#BDBDBD",
  success: "#389E0D",
  successLight: "#F6FFED",
  successBorder: "#B7EB8F",
};

const MODAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

  @keyframes smFadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes smPopIn {
    0%   { opacity: 0; transform: translateY(20px) scale(0.96); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes smCheckScale {
    0%   { transform: scale(0); }
    60%  { transform: scale(1.15); }
    100% { transform: scale(1); }
  }
  @keyframes smPulse {
    0%, 100% { box-shadow: 0 0 0 0 ${THEME.success}55; }
    50%      { box-shadow: 0 0 0 14px ${THEME.success}00; }
  }
  @keyframes smShimmer {
    0%   { background-position: -200px 0; }
    100% { background-position: 200px 0; }
  }

  .sm-backdrop {
    position: fixed; inset: 0;
    background: rgba(26, 26, 46, 0.55);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    z-index: 9999;
    animation: smFadeIn 0.2s ease-out;
    padding: 20px;
  }

  .sm-dialog {
    background: #fff;
    border-radius: 18px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.25), 0 0 0 1px ${THEME.border};
    width: 100%;
    max-width: 460px;
    overflow: hidden;
    font-family: 'DM Sans', sans-serif;
    animation: smPopIn 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .sm-banner {
    background: linear-gradient(135deg, ${THEME.brandLight} 0%, #FAF6EE 100%);
    padding: 32px 24px 26px;
    position: relative;
    text-align: center;
    border-bottom: 1px solid ${THEME.border};
  }
  .sm-close {
    position: absolute;
    top: 12px; right: 12px;
    width: 30px; height: 30px;
    border-radius: 8px;
    border: none;
    background: rgba(255,255,255,0.6);
    cursor: pointer;
    font-size: 20px;
    line-height: 1;
    color: ${THEME.textMuted};
    transition: all 0.15s;
    display: flex; align-items: center; justify-content: center;
  }
  .sm-close:hover {
    background: #fff;
    color: ${THEME.text};
    transform: rotate(90deg);
  }

  .sm-check-circle {
    width: 64px; height: 64px;
    margin: 0 auto 14px;
    border-radius: 50%;
    background: ${THEME.success};
    display: flex; align-items: center; justify-content: center;
    animation: smCheckScale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), smPulse 2s 0.5s infinite;
  }
  .sm-check-circle svg {
    width: 32px; height: 32px;
    stroke: #fff;
    stroke-width: 3.5;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .sm-title {
    margin: 0 0 4px;
    font-family: 'Sora', sans-serif;
    font-size: 19px;
    font-weight: 800;
    color: ${THEME.text};
    letter-spacing: -0.3px;
  }
  .sm-subtitle {
    margin: 0;
    font-size: 13px;
    color: ${THEME.textMuted};
  }

  .sm-body {
    padding: 22px 24px 8px;
  }
  .sm-label {
    font-size: 10px;
    font-weight: 700;
    color: ${THEME.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.09em;
    margin: 0 0 8px;
    display: flex; align-items: center; gap: 6px;
  }
  .sm-case-card {
    background: linear-gradient(135deg, #FAF6EE 0%, ${THEME.brandLight} 100%);
    border: 1.5px dashed ${THEME.brandMid};
    border-radius: 12px;
    padding: 16px 18px;
    display: flex; align-items: center; gap: 10px;
    position: relative;
  }
  .sm-case-card .sm-case-text {
    flex: 1;
    font-family: 'Sora', sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: ${THEME.brandDark};
    word-break: break-all;
    line-height: 1.4;
  }
  .sm-copy-btn {
    flex-shrink: 0;
    padding: 7px 12px;
    border-radius: 8px;
    border: 1.5px solid ${THEME.brand};
    background: #fff;
    color: ${THEME.brand};
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.18s;
    white-space: nowrap;
    display: inline-flex; align-items: center; gap: 4px;
  }
  .sm-copy-btn:hover {
    background: ${THEME.brand};
    color: #fff;
  }
  .sm-copy-btn.copied {
    background: ${THEME.success};
    border-color: ${THEME.success};
    color: #fff;
  }

  .sm-footer {
    padding: 18px 24px 22px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
  .sm-btn {
    padding: 10px 22px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    font-family: 'Sora', sans-serif;
    transition: all 0.18s;
    border: 1.5px solid transparent;
    display: inline-flex; align-items: center; gap: 6px;
  }
  .sm-btn-cancel {
    background: #fff;
    color: #595959;
    border-color: #E0D5C5;
  }
  .sm-btn-cancel:hover {
    background: ${THEME.brandLight};
    color: ${THEME.brand};
    border-color: ${THEME.brand};
  }
  .sm-btn-primary {
    background: ${THEME.brand};
    color: #fff;
    box-shadow: 0 2px 10px ${THEME.brand}55;
  }
  .sm-btn-primary:hover {
    background: ${THEME.brandDark};
    box-shadow: 0 4px 14px ${THEME.brand}77;
    transform: translateY(-1px);
  }
`;

const SubmitModal = ({
  show,
  handleClose,
  fileId,
  MonthId,
  YearId,
  selectedFileID,
  fileName,
}) => {
  const [copied, setCopied] = React.useState(false);

  // Build case number
  const now = new Date();
  const monthName = now
    .toLocaleString("default", { month: "short" })
    .toUpperCase();
  const year = now.getFullYear();
  const monthMap = {
    JAN: "01", FEB: "02", MAR: "03", APR: "04",
    MAY: "05", JUN: "06", JUL: "07", AUG: "08",
    SEP: "09", OCT: "10", NOV: "11", DEC: "12",
  };
  const month = monthMap[monthName] || "01";

  const caseNumber = `ZED/PR0${MonthId || month}${YearId || year}/00${
    selectedFileID || fileId
  }/${fileName}`;

  // Close on Escape
  useEffect(() => {
    if (!show) return;
    const onKey = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    // lock body scroll while open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [show, handleClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(caseNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      // fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = caseNumber;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (_) {}
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const handleAddNew = () => {
    window.location.reload();
  };

  if (!show) return null;

  return (
    <>
      <style>{MODAL_CSS}</style>
      <div
        className="sm-backdrop"
        onClick={(e) => {
          // close when clicking outside the dialog
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        <div className="sm-dialog" role="dialog" aria-modal="true">
          {/* Banner */}
          <div className="sm-banner">
            <button
              type="button"
              className="sm-close"
              onClick={handleClose}
              aria-label="Close"
            >
              ×
            </button>

            <div className="sm-check-circle">
              <svg viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h2 className="sm-title">File Created Successfully</h2>
            <p className="sm-subtitle">
              Your new file has been added to the system.
            </p>
          </div>

          {/* Body */}
          <div className="sm-body">
            <p className="sm-label">
              <span>🗂️</span> Case Number
            </p>
            <div className="sm-case-card">
              <span className="sm-case-text">{caseNumber}</span>
              <button
                type="button"
                className={`sm-copy-btn${copied ? " copied" : ""}`}
                onClick={handleCopy}
              >
                {copied ? "✓ Copied" : "📋 Copy"}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="sm-footer">
            <button
              type="button"
              className="sm-btn sm-btn-cancel"
              onClick={handleClose}
            >
              Close
            </button>
            <button
              type="button"
              className="sm-btn sm-btn-primary"
              onClick={handleAddNew}
            >
              + Add New File
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubmitModal;