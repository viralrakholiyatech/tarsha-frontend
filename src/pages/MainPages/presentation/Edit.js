// ─────────────────────────────────────────────
//  EditPresentation.jsx  —  Edit Presentation
//  Centered modal — matches AddPresentation design
// ─────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import ApiService from "../../../services/ApiService";
import {
  AddOrUpdatepresentation,
  fetchActiveEmployee,
  fetchpresentationbyid,
} from "../../../config/config";
import { getToken } from "../../../services/useLocalStorage";
import { FileUrl } from "../../../config/file_url";
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
  bg:          "#F8F5F0",
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
  * { box-sizing: border-box; }
  @keyframes epSlide {
    from { opacity:0; transform:translateY(-16px) scale(0.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes epFade    { from { opacity:0; } to { opacity:1; } }
  @keyframes epSpin    { to { transform:rotate(360deg); } }
  @keyframes epShimmer {
    0%   { background-position:200% 0; }
    100% { background-position:-200% 0; }
  }

  .ep2-overlay {
    position:fixed; inset:0; z-index:1040;
    background:rgba(26,26,46,0.45); backdrop-filter:blur(3px);
    display:flex; align-items:center; justify-content:center;
    animation:epFade 0.2s ease; padding:16px;
  }
  .ep2-modal {
    position:relative; width:100%; max-width:540px; max-height:90vh;
    background:${THEME.bg}; border-radius:18px; overflow:hidden;
    display:flex; flex-direction:column;
    box-shadow:0 20px 60px rgba(0,0,0,0.2);
    animation:epSlide 0.25s cubic-bezier(0.4,0,0.2,1);
    font-family:'DM Sans',sans-serif;
  }
  @media(max-width:580px){ .ep2-modal { max-width:100%; max-height:95vh; } }

  .ep2-header {
    background:#fff; border-bottom:1px solid ${THEME.border};
    padding:18px 24px;
    display:flex; align-items:center; justify-content:space-between;
    flex-shrink:0;
  }
  .ep2-body  { flex:1; overflow-y:auto; padding:24px; }
  .ep2-footer {
    background:#fff; border-top:1px solid ${THEME.border};
    padding:16px 24px;
    display:flex; justify-content:flex-end; gap:10px;
    flex-shrink:0;
  }

  .ep2-input {
    width:100%; padding:10px 13px; border-radius:10px;
    border:1.5px solid #E0D5C5; font-size:13px;
    font-family:'DM Sans',sans-serif; color:#1A1A2E;
    outline:none; background:#fff;
    transition:border-color 0.15s, box-shadow 0.15s;
    resize:vertical; appearance:auto;
  }
  .ep2-input:focus { border-color:${THEME.brand}; box-shadow:0 0 0 3px ${THEME.brand}18; }
  .ep2-input::placeholder { color:${THEME.textLight}; }
  .ep2-input.error { border-color:${THEME.errorBorder}; background:${THEME.errorBg}; }

  .ep2-upload {
    border:2px dashed #D4C4A0; border-radius:12px;
    padding:22px 20px; text-align:center; cursor:pointer;
    background:${THEME.brandLight}; transition:all 0.18s;
    display:flex; flex-direction:column; align-items:center; gap:8px;
  }
  .ep2-upload:hover { border-color:${THEME.brand}; background:#F0E8D8; }
  .ep2-upload input[type=file] { display:none; }

  .ep2-skel {
    border-radius:8px;
    background:linear-gradient(90deg,#F5EFE8 25%,#EDE5D5 50%,#F5EFE8 75%);
    background-size:200% 100%;
    animation:epShimmer 1.4s infinite;
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
    background: state.isSelected ? THEME.brand : state.isFocused ? THEME.brandLight : "#fff",
    color: state.isSelected ? "#fff" : THEME.text,
    fontSize: 13, cursor: "pointer",
  }),
  placeholder: (base) => ({ ...base, color: THEME.textLight, fontSize: 13 }),
  singleValue:  (base) => ({ ...base, color: THEME.text, fontSize: 13 }),
};

const EMPTY = { date: "", presentation: null, presented_by: "", summary: "", feedback: "" };


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

function SectionTitle({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "20px 0 14px" }}>
      <div style={{ width: 3, height: 14, borderRadius: 2, background: `linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
      <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: THEME.brand, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "'Sora',sans-serif" }}>
        {children}
      </p>
    </div>
  );
}

function PrimaryBtn({ children, type = "button", onClick, disabled }) {
  const [hov, setHov] = useState(false);
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: "10px 26px", borderRadius: 10, border: "none",
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
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {[1, 2].map((n) => (
          <div key={n}>
            <div className="ep2-skel" style={{ width: 70, height: 10, marginBottom: 6 }} />
            <div className="ep2-skel" style={{ height: 42 }} />
          </div>
        ))}
      </div>
      {[42, 42, 80].map((h, i) => (
        <div key={i}>
          <div className="ep2-skel" style={{ width: 70, height: 10, marginBottom: 6 }} />
          <div className="ep2-skel" style={{ height: h }} />
        </div>
      ))}
    </div>
  );
}


// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const EditPresentation = ({ editshow, handleeditClose, onSuccess, LeadId, leadsId }) => {
  const [formData,   setFormData]   = useState(EMPTY);
  const [errors,     setErrors]     = useState({});
  const [emp,        setEmp]        = useState([]);
  const [empLoading, setEmpLoading] = useState(false);
  const [fetching,   setFetching]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fileName,   setFileName]   = useState("");
  const [savedFile,  setSavedFile]  = useState("");
  const [newFile,    setNewFile]    = useState(null);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = editshow ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [editshow]);

  // Load employees + presentation data in parallel
  useEffect(() => {
    if (!editshow || !LeadId) return;

    const loadEmployees = async () => {
      setEmpLoading(true);
      try {
        const h = { Authorization: `Bearer ${getToken()}` };
        const res = await ApiService(null, 0, h, fetchActiveEmployee.method, fetchActiveEmployee.url);
        if (!res.data.error)
          setEmp((res.data.data || []).map((m) => ({ value: m.id, label: `${m.first_name} ${m.last_name}` })));
      } catch (e) { console.error(e); }
      finally { setEmpLoading(false); }
    };

    const loadPresentation = async () => {
      setFetching(true);
      try {
        const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };
        const res = await ApiService(null, LeadId, header, fetchpresentationbyid.method, fetchpresentationbyid.url);
        if ((res.status === 200 || res.status === 201) && res.data?.data?.length > 0) {
          const d = res.data.data[0];
          setFormData({
            date:          d.date          || "",
            presented_by:  d.presented_by  || "",
            summary:       d.summary       || "",
            feedback:      d.feedback      || "",
            presentation:  d.presentation  || null,
          });
          if (d.presentation) setSavedFile(d.presentation);
        }
      } catch { toast.error("An unexpected error occurred."); }
      finally { setFetching(false); }
    };

    loadEmployees();
    loadPresentation();
  }, [editshow, LeadId]);

  if (!editshow) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewFile(file);
    setFileName(file.name);
    setFormData((p) => ({ ...p, presentation: file }));
  };

  const clearFile = () => {
    setNewFile(null); setFileName(""); setSavedFile("");
    setFormData((p) => ({ ...p, presentation: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.date) newErrors.date = "Date is required";
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("id",           LeadId);
      form.append("lead_id",      leadsId);
      form.append("date",         formData.date);
      form.append("presented_by", formData.presented_by);
      form.append("summary",      formData.summary);
      form.append("feedback",     formData.feedback);
      if (newFile) form.append("presentation", newFile);

      const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "multipart/form-data" };
      const res = await ApiService(form, 0, header, AddOrUpdatepresentation.method, AddOrUpdatepresentation.url);

      if (res.status === 200 && !res.data.error) {
        toast.success(res.data.message || "Presentation updated successfully");
        handleeditClose();
        onSuccess?.();
        setFormData(EMPTY); setFileName(""); setNewFile(null); setSavedFile(""); setErrors({});
      } else { toast.error(res.data?.message || "An error occurred"); }
    } catch { toast.error("An unexpected error occurred."); }
    finally { setSubmitting(false); }
  };

  const displayFile = fileName || savedFile;

  return (
    <>
      <style>{MODAL_CSS}</style>

      <div className="ep2-overlay" onClick={handleeditClose}>
        <div className="ep2-modal" onClick={(e) => e.stopPropagation()}>

          {/* ── Header ── */}
          <div className="ep2-header">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: THEME.brandLight, border: `1px solid #D4C4A0`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
              }}>✏️</div>
              <div>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: THEME.text, fontFamily: "'Sora',sans-serif" }}>
                  Edit Presentation
                </h2>
                <p style={{ margin: 0, fontSize: 11, color: THEME.textMuted }}>
                  {fetching ? "Loading…" : `Presentation #${LeadId}`}
                </p>
              </div>
            </div>
            <button onClick={handleeditClose}
              style={{ width: 34, height: 34, borderRadius: 10, border: `1.5px solid ${THEME.border}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: THEME.textMuted, transition: "all 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = THEME.brandLight; e.currentTarget.style.color = THEME.brand; e.currentTarget.style.borderColor = THEME.brand; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = THEME.textMuted; e.currentTarget.style.borderColor = THEME.border; }}>
              ×
            </button>
          </div>

          {/* ── Body — skeleton or form ── */}
          {fetching ? <SkeletonBody /> : (
            <form onSubmit={handleSubmit} noValidate className="ep2-body">

              <SectionTitle>Presentation Details</SectionTitle>

              {/* Date + Presented By */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <FieldLabel required>Date</FieldLabel>
                  <input type="date" className={`ep2-input${errors.date ? " error" : ""}`}
                    name="date" value={formData.date} onChange={handleChange} />
                  <ErrorMsg message={errors.date} />
                </div>
                <div>
                  <FieldLabel>Presented By</FieldLabel>
                  <Select
                    options={emp} isLoading={empLoading} isSearchable
                    placeholder="Select presenter…" styles={selectStyles}
                    value={emp.find((o) => o.value == formData.presented_by) || null}
                    onChange={(opt) => setFormData((p) => ({ ...p, presented_by: opt?.value || "" }))}
                  />
                </div>
              </div>

              {/* Summary */}
              <div style={{ marginBottom: 14 }}>
                <FieldLabel>Summary</FieldLabel>
                <input type="text" className="ep2-input"
                  name="summary" placeholder="Brief summary of the presentation…"
                  value={formData.summary} onChange={handleChange} />
              </div>

              {/* Feedback */}
              <div style={{ marginBottom: 14 }}>
                <FieldLabel>Feedback</FieldLabel>
                <input type="text" className="ep2-input"
                  name="feedback" placeholder="Client feedback or next steps…"
                  value={formData.feedback} onChange={handleChange} />
              </div>

              <SectionTitle>Presentation File</SectionTitle>

              {/* Existing file info */}
              {savedFile && !fileName && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#F9F0FF", border: "1px solid #D3ADF7", borderRadius: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 18 }}>🖥️</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#531DAB", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {savedFile}
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: THEME.textMuted }}>Current file</p>
                  </div>
                  <a href={`${FileUrl}/${savedFile}`} target="_blank" rel="noreferrer"
                    style={{ fontSize: 11, color: "#531DAB", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
                    View ↗
                  </a>
                </div>
              )}

              {/* Upload zone */}
              <label htmlFor="ep2-file" className="ep2-upload">
                <input type="file" id="ep2-file"
                  accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,image/*"
                  onChange={handleFileChange} />
                {fileName ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "#F9F0FF", border: "1.5px solid #D3ADF7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🖥️</div>
                    <div style={{ textAlign: "left" }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: THEME.text }}>{fileName}</p>
                      <p style={{ margin: 0, fontSize: 11, color: THEME.textMuted }}>Click to change file</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: "#fff", border: `1px solid #D4C4A0`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                      🖥️
                    </div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: THEME.brand }}>
                      {savedFile ? "Click to replace file" : "Click to upload presentation"}
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: THEME.textMuted }}>PPT, PDF, DOC, Images supported</p>
                  </>
                )}
              </label>

              {displayFile && (
                <button type="button" onClick={clearFile}
                  style={{ marginTop: 8, fontSize: 12, color: THEME.error, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  × Remove file
                </button>
              )}

            </form>
          )}

          {/* ── Footer ── */}
          <div className="ep2-footer">
            <SecondaryBtn onClick={handleeditClose}>Cancel</SecondaryBtn>
            <PrimaryBtn type="submit" onClick={handleSubmit} disabled={submitting || fetching}>
              {submitting ? (
                <>
                  <span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #ffffff88", borderTopColor: "#fff", display: "inline-block", animation: "epSpin 0.7s linear infinite" }} />
                  Saving…
                </>
              ) : "✓ Save Changes"}
            </PrimaryBtn>
          </div>

        </div>
      </div>
    </>
  );
};

export default EditPresentation;