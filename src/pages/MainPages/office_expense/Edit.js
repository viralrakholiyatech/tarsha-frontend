import { PUBLIC_URL } from "../../../config/backend";
// ─────────────────────────────────────────────
//  EditOfficeExpense.jsx  —  Edit Office Expense
//  Same design as AddOfficeExpense / EditFileExpense
// ─────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GetDate, todayDate } from "../../../services/DateAndTimeService";
import { getRole, getToken } from "../../../services/useLocalStorage";
import useValidator from "../../../services/Validation";
import toast from "react-hot-toast";
import ApiService from "../../../services/ApiService";
import {
  fetchOfficeExpenseById,
  updateOfficeExpenseById,
  updateOfficeExpenseByIdForAdmin,
} from "../../../config/config";
import { OfficeExpenseRoute } from "../../../config/RouteConfig";
import { adminKey } from "../../../config/RoleConfig";


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

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }
  @keyframes eoeFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .eoe-fade { animation:eoeFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes eoeSpin { to{transform:rotate(360deg)} }
  .eoe-spinner { width:28px;height:28px;border-radius:50%;border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};animation:eoeSpin 0.8s linear infinite; }

  .eoe-input,.eoe-textarea {
    width:100%;padding:10px 13px;border-radius:10px;
    border:1.5px solid #E0D5C5;font-size:13px;
    font-family:'DM Sans',sans-serif;color:#1A1A2E;
    outline:none;background:#fff;
    transition:border-color 0.15s,box-shadow 0.15s;
    resize:vertical;
  }
  .eoe-input:focus,.eoe-textarea:focus { border-color:${THEME.brand};box-shadow:0 0 0 3px ${THEME.brand}18; }
  .eoe-input::placeholder,.eoe-textarea::placeholder { color:${THEME.textLight}; }

  /* Upload zone */
  .eoe-upload-zone {
    border:2px dashed #D4C4A0;border-radius:12px;
    padding:16px;text-align:center;cursor:pointer;
    background:#FDFAF5;transition:all 0.18s;position:relative;flex:1;
  }
  .eoe-upload-zone:hover { border-color:${THEME.brand};background:${THEME.brandLight}; }
  .eoe-upload-zone input[type=file] {
    position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;
  }
  .eoe-upload-zone.has-file { border-color:${THEME.brand};background:${THEME.brandLight}; }

  .eoe-view-btn {
    padding:8px 14px;border-radius:10px;border:1.5px solid #ADC6FF;
    background:#F0F5FF;color:#2F54EB;font-size:12px;font-weight:700;
    cursor:pointer;text-decoration:none;white-space:nowrap;
    display:inline-flex;align-items:center;gap:5px;transition:all 0.15s;
    font-family:'DM Sans',sans-serif;
  }
  .eoe-view-btn:hover { background:#2F54EB;color:#fff;border-color:#2F54EB; }

  ::-webkit-scrollbar{width:5px;}
  ::-webkit-scrollbar-track{background:${THEME.brandLight};}
  ::-webkit-scrollbar-thumb{background:${THEME.brandMid};border-radius:10px;}
`;

const FileUrls = PUBLIC_URL;


// ─────────────────────────────────────────────
//  🧩  ATOMS
// ─────────────────────────────────────────────

function FieldLabel({ children, required }) {
  return (
    <label style={{ display:"block", marginBottom:5, fontSize:11, fontWeight:700, color:THEME.textMuted, textTransform:"uppercase", letterSpacing:"0.07em" }}>
      {children}{required && <span style={{ color:THEME.error, marginLeft:3 }}>*</span>}
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

function Grid({ children, cols = "repeat(auto-fill, minmax(220px, 1fr))" }) {
  return <div style={{ display:"grid", gridTemplateColumns:cols, gap:14 }}>{children}</div>;
}

// ─── Upload zone with existing-file view link ─
function UploadZone({ name, label, onChange, newFile, existingUrl, required }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      <FieldLabel required={required}>{label}</FieldLabel>
      <div style={{ display:"flex", gap:8, alignItems:"stretch" }}>
        <div className={`eoe-upload-zone${newFile ? " has-file" : ""}`}>
          <input type="file" name={name} onChange={onChange} accept="image/*,application/pdf" />
          {newFile ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, pointerEvents:"none" }}>
              <span style={{ fontSize:18 }}>✅</span>
              <span style={{ fontSize:11, fontWeight:600, color:THEME.brand, maxWidth:130, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{newFile.name}</span>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, pointerEvents:"none" }}>
              <span style={{ fontSize:18 }}>📎</span>
              <span style={{ fontSize:11, color:THEME.textMuted, fontWeight:600 }}>Click to upload</span>
              {existingUrl && <span style={{ fontSize:10, color:THEME.textLight }}>Current file saved</span>}
            </div>
          )}
        </div>
        {existingUrl && (
          <a href={`${FileUrls}/${existingUrl}`} target="_blank" rel="noopener noreferrer" className="eoe-view-btn">
            👁 View
          </a>
        )}
      </div>
    </div>
  );
}

function PrimaryBtn({ children, type = "button", disabled }) {
  const [hov, setHov] = useState(false);
  return (
    <button type={type} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding:"10px 24px", borderRadius:10, border:"none", background:disabled ? "#C4C4C4" : hov ? THEME.brandDark : THEME.brand, color:"#fff", fontSize:13, fontWeight:700, cursor:disabled ? "not-allowed" : "pointer", fontFamily:"'Sora',sans-serif", transition:"all 0.18s", boxShadow:disabled ? "none" : `0 2px 8px ${THEME.brand}44`, display:"inline-flex", alignItems:"center", gap:6 }}>
      {children}
    </button>
  );
}

function SecondaryBtn({ children, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding:"10px 24px", borderRadius:10, border:`1.5px solid ${hov ? THEME.brand : "#E0D5C5"}`, background:hov ? THEME.brandLight : "#fff", color:hov ? THEME.brand : "#595959", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.18s" }}>
      {children}
    </button>
  );
}


// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const EditOfficeExpense = () => {
  const navigate = useNavigate();
  const params   = useParams();

  const [loading,    setLoading]    = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageUrls,  setImageUrls]  = useState({ receipt_image:"", submitters_img1:"", submitters_img2:"", submitters_img3:"" });

  const [validator, showValidationMessage] = useValidator();

  const [expense, setExpense] = useState({
    amount:          "",
    description:     "",
    types:           "expense",
    date:            todayDate(),
    receipt_image:   null,
    submitters_img1: null,
    submitters_img2: null,
    submitters_img3: null,
  });

  // ── Fetch expense ─────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };
        const res = await ApiService(null, parseInt(params.id), header, fetchOfficeExpenseById.method, fetchOfficeExpenseById.url);
        if (!res.data.error && res.data.data?.length > 0) {
          const d = res.data.data[0];
          setExpense((p) => ({
            ...p,
            amount:      d.amount      || "",
            description: d.description || "",
            date:        d.date ? GetDate(d.date, "YYYY-MM-DD") : todayDate(),
          }));
          setImageUrls({
            receipt_image:   d.receipt_image   || "",
            submitters_img1: d.submitters_img1 || "",
            submitters_img2: d.submitters_img2 || "",
            submitters_img3: d.submitters_img3 || "",
          });
        } else {
          toast.error(res.data.message);
          navigate(`/${OfficeExpenseRoute.list}`);
        }
      } catch (e) {
        console.error(e);
        toast.error(e?.response?.data?.message || "Failed to load data");
      } finally { setLoading(false); }
    };
    load();
  }, [params.id]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    showValidationMessage(true);
    setExpense((p) => ({ ...p, [name]: value }));
  };

  const onFileInput = (e) => {
    const file = e.target.files[0];
    const name = e.target.name;
    setExpense((p) => ({ ...p, [name]: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    for (const key of Object.keys(expense)) {
      if (expense[key] !== null && expense[key] !== undefined) formData.append(key, expense[key]);
    }
    formData.append("id", parseInt(params.id));

    setSubmitting(true);
    try {
      const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "multipart/form-data" };
      const updateObj = getRole() === adminKey ? { ...updateOfficeExpenseByIdForAdmin } : { ...updateOfficeExpenseById };
      const res = await ApiService(formData, 0, header, updateObj.method, updateObj.url);
      if (!res.data.error) { toast.success(res.data.message); navigate(`/${OfficeExpenseRoute.list}`); }
      else { toast.error(res.data.message); }
    } catch (e) { console.error(e); toast.error(e?.response?.data?.message || "Something went wrong"); }
    finally { setSubmitting(false); }
  };

  if (loading) {
    return (
      <div style={{ minHeight:"100vh", background:THEME.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
        <div className="eoe-spinner" />
        <p style={{ color:THEME.textLight, fontSize:13 }}>Loading expense data…</p>
      </div>
    );
  }

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div style={{ minHeight:"100vh", background:THEME.bg, fontFamily:"'DM Sans',sans-serif", padding:"28px 24px" }}>

        {/* ── Header ── */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:24 }}>
          <div style={{ width:4, height:26, borderRadius:3, background:`linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
          <div>
            <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:THEME.text, fontFamily:"'Sora',sans-serif", letterSpacing:"-0.3px" }}>
              Edit Office Expense
            </h1>
            <p style={{ margin:"2px 0 0", fontSize:12, color:THEME.textMuted }}>ID #{params.id}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="eoe-fade">

            {/* ── 1. Expense Info ── */}
            <CardSection title="Expense Info" icon="🏢">
              <div style={{ marginBottom:14 }}>
                <FieldLabel>Description</FieldLabel>
                <textarea className="eoe-textarea" rows={3} name="description"
                  placeholder="Describe this expense…"
                  onChange={handleInput} value={expense.description} />
              </div>
              <Grid>
                <div>
                  <FieldLabel required>Amount</FieldLabel>
                  <input className="eoe-input" type="text" name="amount"
                    placeholder="e.g. 1500" onChange={handleInput} value={expense.amount} />
                  {validator.message("amount", expense.amount, "required|numeric", { className:"text-danger" })}
                </div>
                <div>
                  <FieldLabel required>Date</FieldLabel>
                  <input className="eoe-input" type="date" name="date"
                    onChange={handleInput} value={expense.date} />
                  {validator.message("date", expense.date, "required", { className:"text-danger" })}
                </div>
              </Grid>
            </CardSection>

            {/* ── 2. Attachments ── */}
            <CardSection title="Attachments" icon="📎">
              <div style={{ marginBottom:14 }}>
                <UploadZone
                  name="receipt_image" label="Receipt"
                  onChange={onFileInput}
                  newFile={expense.receipt_image}
                  existingUrl={imageUrls.receipt_image}
                />
              </div>
              <Grid cols="repeat(3, 1fr)">
                {[
                  { name:"submitters_img1", label:"Submitter Image 1" },
                  { name:"submitters_img2", label:"Submitter Image 2" },
                  { name:"submitters_img3", label:"Submitter Image 3" },
                ].map((img) => (
                  <UploadZone
                    key={img.name}
                    name={img.name}
                    label={img.label}
                    onChange={onFileInput}
                    newFile={expense[img.name]}
                    existingUrl={imageUrls[img.name]}
                  />
                ))}
              </Grid>
            </CardSection>

            {/* ── Actions ── */}
            <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
              <SecondaryBtn onClick={() => navigate(`/${OfficeExpenseRoute.list}`)}>← Back</SecondaryBtn>
              <PrimaryBtn type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <span style={{ width:14, height:14, borderRadius:"50%", border:"2px solid #ffffff88", borderTopColor:"#fff", display:"inline-block", animation:"eoeSpin 0.7s linear infinite" }} />
                    Saving…
                  </>
                ) : "✓ Save Changes"}
              </PrimaryBtn>
            </div>

          </div>
        </form>
      </div>
    </>
  );
};

export default EditOfficeExpense;