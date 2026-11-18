// ─────────────────────────────────────────────
//  EmpDocument.jsx  —  Employee Document Upload
//  Same brand design as AddFileExpense / EditFileExpense
// ─────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import ApiService from "../../../../services/ApiService";
import { getToken } from "../../../../services/useLocalStorage";
import { useParams } from "react-router-dom";
import {
  addupdateDocument, fetchdocumentbyid,
  deleteAdharcard, deleteGraduation, deleteOfferletter,
  deletebondAgreement, deleteSignature,
} from "../../../../config/config";
import toast from "react-hot-toast";
import { FileUrl } from "../../../../config/file_url";
import { SwalAlert } from "../../../../UtilsComponent/SwalDialog";
import S3FileUpload from "../../../../components/S3FileUpload";


// ─────────────────────────────────────────────
//  🎨  THEME
// ─────────────────────────────────────────────
const THEME = {
  brand:      "#887549",
  brandLight: "#F5F0E8",
  brandMid:   "#C4A97D",
  brandDark:  "#5C4E32",
  bg:         "#F8F5F0",
  border:     "#EDE5D5",
  text:       "#1A1A2E",
  textMuted:  "#ADADAD",
  textLight:  "#BDBDBD",
  error:      "#CF1322",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing:border-box; }
  @keyframes edocFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .edoc-fade { animation:edocFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes edocSpin { to{transform:rotate(360deg)} }
  .edoc-spinner {
    width:28px;height:28px;border-radius:50%;
    border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};
    animation:edocSpin 0.8s linear infinite;
  }

  /* ── Upload zone ── */
  .edoc-zone {
    border:2px dashed #D4C4A0;border-radius:12px;
    padding:18px 16px;text-align:center;cursor:pointer;
    background:#FDFAF5;transition:all 0.18s;position:relative;flex:1;
    min-height:90px;display:flex;align-items:center;justify-content:center;
  }
  .edoc-zone:hover  { border-color:${THEME.brand};background:${THEME.brandLight}; }
  .edoc-zone.active { border-color:${THEME.brand};background:${THEME.brandLight};border-style:solid; }
  .edoc-zone input[type=file] {
    position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;
  }

  /* ── View button ── */
  .edoc-view-btn {
    padding:7px 12px;border-radius:10px;border:1.5px solid #ADC6FF;
    background:#F0F5FF;color:#2F54EB;font-size:12px;font-weight:700;
    cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:5px;
    transition:all 0.15s;font-family:'DM Sans',sans-serif;white-space:nowrap;
    flex-shrink:0;
  }
  .edoc-view-btn:hover { background:#2F54EB;color:#fff;border-color:#2F54EB; }

  /* ── Delete button ── */
  .edoc-del-btn {
    width:32px;height:32px;border-radius:8px;border:1.5px solid #FFA39E;
    background:#FFF1F0;cursor:pointer;display:inline-flex;align-items:center;
    justify-content:center;transition:all 0.15s;flex-shrink:0;
  }
  .edoc-del-btn:hover { background:#CF1322;border-color:#CF1322; }
  .edoc-del-btn:hover svg { stroke:#fff; }

  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:${THEME.brandLight}; }
  ::-webkit-scrollbar-thumb { background:${THEME.brandMid};border-radius:10px; }
`;


// ─────────────────────────────────────────────
//  🧩  ATOMS
// ─────────────────────────────────────────────

function FieldLabel({ children }) {
  return (
    <label style={{ display:"block", marginBottom:6, fontSize:11, fontWeight:700, color:THEME.textMuted, textTransform:"uppercase", letterSpacing:"0.07em" }}>
      {children}
    </label>
  );
}

function CardSection({ title, icon, children }) {
  return (
    <div style={{ background:"#fff", border:`1px solid ${THEME.border}`, borderRadius:14, padding:"20px 24px", marginBottom:16, boxShadow:"0 2px 10px rgba(136,117,73,0.06)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:18 }}>
        <div style={{ width:3, height:16, borderRadius:2, background:`linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
        <h2 style={{ margin:0, fontSize:12, fontWeight:700, color:THEME.brand, textTransform:"uppercase", letterSpacing:"0.07em", fontFamily:"'Sora',sans-serif" }}>
          {icon && <span style={{ marginRight:6 }}>{icon}</span>}{title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function PrimaryBtn({ children, type="button", disabled }) {
  const [hov, setHov] = useState(false);
  return (
    <button type={type} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding:"10px 28px", borderRadius:10, border:"none",
        background: disabled ? "#C4C4C4" : hov ? THEME.brandDark : THEME.brand,
        color:"#fff", fontSize:13, fontWeight:700,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily:"'Sora',sans-serif", transition:"all 0.18s",
        boxShadow: disabled ? "none" : `0 2px 8px ${THEME.brand}44`,
        display:"inline-flex", alignItems:"center", gap:6,
      }}>
      {children}
    </button>
  );
}


// ─────────────────────────────────────────────
//  DOCUMENT ROW
//  Shows upload zone + optional View/Delete for saved file
// ─────────────────────────────────────────────
function DocRow({ label, icon, newFile, savedUrl, onFileChange, onDelete }) {
  // Determine what to show in the zone
  const hasNew   = newFile instanceof File;
  const hasSaved = !!savedUrl && typeof savedUrl === "string";

  return (
    <div style={{ marginBottom:16 }}>
      <FieldLabel>{icon} {label}</FieldLabel>
      <div style={{ display:"flex", gap:10, alignItems:"stretch" }}>

        {/* Upload zone */}
        <div className={`edoc-zone${hasNew ? " active" : ""}`}>
          <input type="file" accept="image/*,application/pdf" onChange={onFileChange} />
          {hasNew ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, pointerEvents:"none" }}>
              <span style={{ fontSize:20 }}>✅</span>
              <span style={{ fontSize:11, fontWeight:600, color:THEME.brand, maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {newFile.name}
              </span>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, pointerEvents:"none" }}>
              <span style={{ fontSize:20 }}>📎</span>
              <span style={{ fontSize:11, color:THEME.textMuted, fontWeight:600 }}>Click to upload</span>
              {hasSaved && <span style={{ fontSize:10, color:THEME.textLight }}>Current file saved</span>}
              {!hasSaved && <span style={{ fontSize:10, color:THEME.textLight }}>PDF, JPG, PNG</span>}
            </div>
          )}
        </div>

        {/* View + Delete if saved */}
        {hasSaved && (
          <div style={{ display:"flex", flexDirection:"column", gap:8, justifyContent:"center" }}>
            <a href={`${FileUrl}/${savedUrl}`} target="_blank" rel="noopener noreferrer" className="edoc-view-btn">
              👁 View
            </a>
            {onDelete && (
              <button className="edoc-del-btn" title="Delete" onClick={(e) => { e.preventDefault(); onDelete(); }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#CF1322" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6"/><path d="M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
function EmpDocument() {
  const params = useParams();
  const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };

  const [loading,   setLoading]   = useState(false);
  const [submitting,setSubmitting]= useState(false);

  // Saved URLs from API
  const [savedDocs, setSavedDocs] = useState({
    adhar_card:             null,
    graduation_certificate: null,
    offer_letter:           null,
    bond_agreement:         null,
    signature:              null,
  });

  // Newly uploaded S3 URLs
  const [newS3Docs, setNewS3Docs] = useState({});

  // ── Fetch existing docs ───────────────────
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await ApiService(null, params.id, header, fetchdocumentbyid.method, fetchdocumentbyid.url);
      if (!res.data.error) {
        const d = res.data.data[0] || {};
        setSavedDocs({
          adhar_card:             d.adhar_card             || null,
          graduation_certificate: d.graduation_certificate || null,
          offer_letter:           d.offer_letter           || null,
          bond_agreement:         d.bond_agreement         || null,
          signature:              d.signature              || null,
        });
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Delete helpers ─────────────────────────
  const makeDeleter = (apiConfig, docKey) => () => {
    SwalAlert({}).then(async (result) => {
      if (!result?.isConfirmed) return;
      setLoading(true);
      try {
        const res = await ApiService(null, params.id, header, apiConfig.method, apiConfig.url);
        if (!res.data.error) {
          toast.success(res.data.message);
          setSavedDocs((p) => ({ ...p, [docKey]: null }));
        } else { toast.error(res.data.message); }
      } catch (e) { toast.error(e?.response?.data?.message || "Something went wrong"); }
      finally { setLoading(false); }
    });
  };

  const deleters = {
    adhar_card:             makeDeleter(deleteAdharcard,     "adhar_card"),
    graduation_certificate: makeDeleter(deleteGraduation,    "graduation_certificate"),
    offer_letter:           makeDeleter(deleteOfferletter,   "offer_letter"),
    bond_agreement:         makeDeleter(deletebondAgreement, "bond_agreement"),
    signature:              makeDeleter(deleteSignature,     "signature"),
  };

  // ── Submit ────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("id", params.id);
    Object.entries(newS3Docs).forEach(([key, url]) => {
      if (url !== undefined) formData.append(key, url);
    });

    setSubmitting(true);
    try {
      const h = { Authorization: `Bearer ${getToken()}`, "Content-Type": "multipart/form-data" };
      const res = await ApiService(formData, 0, h, addupdateDocument.method, addupdateDocument.url);
      if (!res.data.error) {
        toast.success(res.data.message);
        fetchData(); // Refresh saved URLs
        setNewS3Docs({});
      } else { toast.error(res.data.message); }
    } catch (e) { toast.error(e?.response?.data?.message || "An error occurred"); }
    finally { setSubmitting(false); }
  };

  const setFile = (key) => (e) => setNewFiles((p) => ({ ...p, [key]: e.target.files[0] || null }));

  if (loading) {
    return (
      <div style={{ minHeight:"60vh", background:THEME.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
        <div className="edoc-spinner" />
        <p style={{ color:THEME.textLight, fontSize:13 }}>Loading documents…</p>
      </div>
    );
  }

  const DOCS = [
    { key:"adhar_card",             label:"Aadhar Card",            icon:"🪪", api: deleteAdharcard     },
    { key:"graduation_certificate", label:"Graduation Certificate", icon:"🎓", api: deleteGraduation    },
    { key:"offer_letter",           label:"Offer Letter",           icon:"📄", api: deleteOfferletter   },
    { key:"bond_agreement",         label:"Bond Agreement",         icon:"📋", api: deletebondAgreement },
    { key:"signature",              label:"Signature",              icon:"✍️", api: deleteSignature     },
  ];

  return (
    <>
      <style>{CSS}</style>

      <div style={{ minHeight:"100vh", background:THEME.bg, fontFamily:"'DM Sans',sans-serif", padding:"28px 24px" }}>

        {/* ── Header ── */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:24 }}>
          <div style={{ width:4, height:26, borderRadius:3, background:`linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
          <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:THEME.text, fontFamily:"'Sora',sans-serif", letterSpacing:"-0.3px" }}>
            Document Upload
          </h1>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="edoc-fade">

            <CardSection title="Employee Documents (AWS S3 Cloud)" icon="📁">
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {DOCS.map(({ key, label, icon }) => (
                  <S3FileUpload
                    key={key}
                    label={`${icon} ${label}`}
                    value={newS3Docs[key] !== undefined ? newS3Docs[key] : savedDocs[key]}
                    onChange={(url) => {
                      setNewS3Docs((p) => ({ ...p, [key]: url }));
                      setSavedDocs((p) => ({ ...p, [key]: url }));
                    }}
                    onRemove={() => {
                      if (savedDocs[key] && deleters[key]) {
                        deleters[key]();
                      }
                      setNewS3Docs((p) => ({ ...p, [key]: "" }));
                      setSavedDocs((p) => ({ ...p, [key]: null }));
                    }}
                    accept="image/*,application/pdf,.doc,.docx"
                    folder="employee_documents"
                  />
                ))}
              </div>
            </CardSection>

            {/* ── Actions ── */}
            <div style={{ display:"flex", justifyContent:"flex-end" }}>
              <PrimaryBtn type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <span style={{ width:14, height:14, borderRadius:"50%", border:"2px solid #ffffff88", borderTopColor:"#fff", display:"inline-block", animation:"edocSpin 0.7s linear infinite" }} />
                    Uploading…
                  </>
                ) : "⬆ Upload Documents"}
              </PrimaryBtn>
            </div>

          </div>
        </form>
      </div>
    </>
  );
}

export default EmpDocument;