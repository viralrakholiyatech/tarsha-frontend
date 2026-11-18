import React, { useEffect, useState } from "react";
import { getAlldocument, addoredit } from "../config/config";
import ApiService from "../services/ApiService";
import { getToken } from "../services/useLocalStorage";
import toast from "react-hot-toast";

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
};

const MODAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }

  .dc-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45); z-index: 1040;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .dc-dialog {
    background: #fff; border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.18);
    width: 100%; max-width: 480px; max-height: 90vh;
    display: flex; flex-direction: column;
    font-family: 'DM Sans', sans-serif; overflow: hidden;
  }
  .dc-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px; border-bottom: 1px solid ${THEME.border};
    background: #FDFAF5; flex-shrink: 0;
  }
  .dc-body {
    padding: 20px 24px; overflow-y: auto; flex: 1;
  }
  .dc-body::-webkit-scrollbar { width: 4px; }
  .dc-body::-webkit-scrollbar-thumb { background: ${THEME.brandMid}; border-radius: 4px; }
  .dc-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 24px; border-top: 1px solid ${THEME.border};
    flex-shrink: 0;
  }

  /* Checkbox row */
  .dc-doc-row {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 10px;
    border: 1.5px solid transparent;
    cursor: pointer; transition: all 0.15s;
    margin-bottom: 6px;
  }
  .dc-doc-row:hover { background: ${THEME.brandLight}; border-color: #D4C4A0; }
  .dc-doc-row.selected {
    background: ${THEME.brandLight};
    border-color: ${THEME.brand};
  }

  /* Custom checkbox */
  .dc-checkbox {
    width: 18px; height: 18px; border-radius: 5px;
    border: 1.5px solid #D4C4A0; background: #fff;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: all 0.15s;
  }
  .dc-checkbox.checked {
    background: ${THEME.brand}; border-color: ${THEME.brand};
  }
  .dc-check-icon {
    width: 10px; height: 10px;
  }

  /* Select all bar */
  .dc-select-all {
    display: flex; align-items: center; justify-content: space-between;
    padding: 8px 12px; border-radius: 10px;
    background: ${THEME.brandLight}; border: 1px solid #D4C4A0;
    margin-bottom: 14px; cursor: pointer;
  }

  @keyframes dcSpin { to { transform: rotate(360deg); } }
  .dc-spinner {
    width: 24px; height: 24px; border-radius: 50%;
    border: 3px solid ${THEME.brandLight}; border-top-color: ${THEME.brand};
    animation: dcSpin 0.8s linear infinite;
    margin: 48px auto; display: block;
  }
  .dc-btn-spinner {
    width: 13px; height: 13px; border-radius: 50%;
    border: 2px solid #ffffff88; border-top-color: #fff;
    animation: dcSpin 0.7s linear infinite; display: inline-block;
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

function CustomCheckbox({ checked }) {
  return (
    <div className={`dc-checkbox ${checked ? "checked" : ""}`}>
      {checked && (
        <svg className="dc-check-icon" viewBox="0 0 10 10" fill="none">
          <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#fff" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const DocumentCollectionModal = ({
  show, handleClose, documentType, paramsId, teamId, onSuccess,
}) => {
  const [loading,           setLoading]           = useState(false);
  const [submitting,        setSubmitting]         = useState(false);
  const [data,              setData]              = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);

  const authHeader = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await ApiService(null, 0, authHeader, getAlldocument.method, getAlldocument.url);
      if (!res.data?.error) setData(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (show) fetchData(); }, [show]);

  const filteredData = data.filter((item) => item.type === documentType);
  const allSelected  = filteredData.length > 0 && filteredData.every((d) => selectedDocuments.includes(d.id));

  const handleCheckboxChange = (id) => {
    setSelectedDocuments((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedDocuments((prev) => prev.filter((id) => !filteredData.find((d) => d.id === id)));
    } else {
      const allIds = filteredData.map((d) => d.id);
      setSelectedDocuments((prev) => [...new Set([...prev, ...allIds])]);
    }
  };

  const handleSubmit = async () => {
    if (selectedDocuments.length === 0) {
      toast.error("Please select at least one document.");
      return;
    }
    try {
      setSubmitting(true);
      const res = await ApiService(
        { type: documentType, selectedData: selectedDocuments, id: paramsId, teamId },
        0, authHeader, addoredit.method, addoredit.url
      );
      if (!res.data?.error) {
        toast.success("Documents submitted successfully.");
        handleClose();
        onSuccess?.();
      } else {
        toast.error("Error submitting documents.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while submitting.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <>
      <style>{MODAL_CSS}</style>

      <div className="dc-backdrop" onClick={handleClose}>
        <div className="dc-dialog" onClick={(e) => e.stopPropagation()}>

          {/* ── Header ── */}
          <div className="dc-header">
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
                  Add Document
                </h2>
                {documentType && (
                  <p style={{ margin: 0, fontSize: 11, color: THEME.textMuted }}>
                    {documentType}
                  </p>
                )}
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
          <div className="dc-body">
            {loading ? (
              <div className="dc-spinner" />
            ) : filteredData.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>📄</div>
                <p style={{ color: THEME.textLight, fontSize: 13, margin: 0 }}>
                  No documents available for {documentType}.
                </p>
              </div>
            ) : (
              <>
                {/* Select All */}
                <div className="dc-select-all" onClick={handleSelectAll}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <CustomCheckbox checked={allSelected} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: THEME.brandDark }}>
                      Select All
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: THEME.textMuted }}>
                    {selectedDocuments.filter((id) => filteredData.find((d) => d.id === id)).length} / {filteredData.length} selected
                  </span>
                </div>

                {/* Document list */}
                {filteredData.map((doc) => {
                  const isSelected = selectedDocuments.includes(doc.id);
                  return (
                    <div
                      key={doc.id}
                      className={`dc-doc-row ${isSelected ? "selected" : ""}`}
                      onClick={() => handleCheckboxChange(doc.id)}
                    >
                      <CustomCheckbox checked={isSelected} />
                      <span style={{
                        fontSize: 13, fontWeight: isSelected ? 600 : 400,
                        color: isSelected ? THEME.brandDark : THEME.text,
                        flex: 1,
                      }}>
                        {doc.doc_name}
                      </span>
                      {isSelected && (
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "2px 8px",
                          borderRadius: 20, background: THEME.brand, color: "#fff",
                        }}>
                          ✓
                        </span>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="dc-footer">
            <span style={{ fontSize: 12, color: THEME.textMuted, fontWeight: 500 }}>
              {selectedDocuments.length > 0
                ? `${selectedDocuments.length} document${selectedDocuments.length > 1 ? "s" : ""} selected`
                : "No documents selected"}
            </span>
            <div style={{ display: "flex", gap: 10 }}>
              <SecondaryBtn onClick={handleClose}>Cancel</SecondaryBtn>
              <PrimaryBtn onClick={handleSubmit} disabled={submitting || loading}>
                {submitting
                  ? <><span className="dc-btn-spinner" /> Saving…</>
                  : "✓ Save"}
              </PrimaryBtn>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default DocumentCollectionModal;