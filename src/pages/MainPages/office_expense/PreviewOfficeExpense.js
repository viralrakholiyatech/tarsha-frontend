// ─────────────────────────────────────────────
//  PreviewOfficeExpense.jsx  —  Preview & Approve
//  Same design as PreviewFileExpense
// ─────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GetDate } from "../../../services/DateAndTimeService";
import { getToken } from "../../../services/useLocalStorage";
import toast from "react-hot-toast";
import ApiService from "../../../services/ApiService";
import { checkOfficeExpense, fetchOfficeExpenseById } from "../../../config/config";
import { OfficeExpenseRoute } from "../../../config/RouteConfig";
import { useForm } from "react-hook-form";


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

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }
  @keyframes poeFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .poe-fade { animation:poeFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes poeSpin { to{transform:rotate(360deg)} }
  .poe-spinner { width:28px;height:28px;border-radius:50%;border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};animation:poeSpin 0.8s linear infinite; }

  .poe-input,.poe-textarea {
    width:100%;padding:10px 13px;border-radius:10px;
    border:1.5px solid #E0D5C5;font-size:13px;
    font-family:'DM Sans',sans-serif;color:${THEME.textMuted};
    outline:none;background:#F9F7F4;resize:none;
  }
  .poe-select-active {
    width:100%;padding:10px 13px;border-radius:10px;
    border:1.5px solid #E0D5C5;font-size:13px;
    font-family:'DM Sans',sans-serif;color:#1A1A2E;
    outline:none;background:#fff;appearance:auto;
    transition:border-color 0.15s,box-shadow 0.15s;
  }
  .poe-select-active:focus { border-color:${THEME.brand};box-shadow:0 0 0 3px ${THEME.brand}18; }
  .poe-select-active.error { border-color:${THEME.errorBorder};background:${THEME.errorBg}; }

  .poe-attach-card {
    border:1.5px solid ${THEME.border};border-radius:10px;padding:14px;
    background:#FDFAF5;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;
  }
  .poe-view-btn {
    padding:7px 14px;border-radius:10px;border:1.5px solid #ADC6FF;
    background:#F0F5FF;color:#2F54EB;font-size:12px;font-weight:700;
    cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:5px;
    transition:all 0.15s;font-family:'DM Sans',sans-serif;
  }
  .poe-view-btn:hover { background:#2F54EB;color:#fff;border-color:#2F54EB; }

  ::-webkit-scrollbar{width:5px;}
  ::-webkit-scrollbar-track{background:${THEME.brandLight};}
  ::-webkit-scrollbar-thumb{background:${THEME.brandMid};border-radius:10px;}
`;

const FileUrls = "https://webappapi.zaidexceldesign.com/public";


// ─────────────────────────────────────────────
//  🧩  ATOMS
// ─────────────────────────────────────────────

function FieldLabel({ children }) {
  return (
    <label style={{ display:"block", marginBottom:5, fontSize:11, fontWeight:700, color:THEME.textMuted, textTransform:"uppercase", letterSpacing:"0.07em" }}>
      {children}
    </label>
  );
}

function ErrorMsg({ message }) {
  if (!message) return null;
  return <p style={{ margin:"4px 0 0", fontSize:11, color:THEME.error, display:"flex", alignItems:"center", gap:4 }}>⚠ {message}</p>;
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

function Grid({ children, cols = "repeat(auto-fill, minmax(200px, 1fr))" }) {
  return <div style={{ display:"grid", gridTemplateColumns:cols, gap:14 }}>{children}</div>;
}

function AttachCard({ label, url }) {
  return (
    <div className="poe-attach-card">
      <span style={{ fontSize:24 }}>{url ? "🖼️" : "📄"}</span>
      <span style={{ fontSize:11, fontWeight:700, color:THEME.textMuted, textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</span>
      {url ? (
        <a href={`${FileUrls}/${url}`} target="_blank" rel="noopener noreferrer" className="poe-view-btn">
          👁 View File
        </a>
      ) : (
        <span style={{ color:THEME.textLight, fontSize:12, fontWeight:500 }}>No file</span>
      )}
    </div>
  );
}

function StatusBadge({ value }) {
  const cfg = {
    "1": { label:"Approved", bg:"#F6FFED", color:"#389E0D", border:"#B7EB8F" },
    "0": { label:"Pending",  bg:"#FFF7E6", color:"#D46B08", border:"#FFD591" },
    "2": { label:"Rejected", bg:"#FFF1F0", color:"#CF1322", border:"#FFA39E" },
  }[String(value)] || { label:"Unknown", bg:"#F5F5F5", color:"#8C8C8C", border:"#D9D9D9" };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 12px", borderRadius:20, fontSize:12, fontWeight:700, background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}` }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:cfg.color }} />
      {cfg.label}
    </span>
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
const PreviewOfficeExpense = () => {
  const navigate  = useNavigate();
  const params    = useParams();

  const [loading,    setLoading]    = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expense,    setExpense]    = useState({});

  const { register, handleSubmit, formState: { errors }, reset } = useForm({ mode: "onChange" });

  // ── Fetch ─────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };
        const res = await ApiService(null, parseInt(params.id), header, fetchOfficeExpenseById.method, fetchOfficeExpenseById.url);
        if (!res.data.error && res.data.data?.length > 0) {
          const d = res.data.data[0];
          setExpense({
            team_fullname:   d.team_fullname   || "",
            amount:          d.amount          || "",
            description:     d.description     || "",
            date:            d.date ? GetDate(d.date, "YYYY-MM-DD") : "",
            receipt_image:   d.receipt_image   || "",
            submitters_img1: d.submitters_img1 || "",
            submitters_img2: d.submitters_img2 || "",
            submitters_img3: d.submitters_img3 || "",
            is_approved:     d.is_approved,
          });
          reset({ is_approved: String(d.is_approved) });
        } else {
          toast.error(res.data.message);
          navigate(`/${OfficeExpenseRoute.list}`);
        }
      } catch (e) {
        console.error(e);
        toast.error(e?.response?.data?.message || "Something went wrong");
      } finally { setLoading(false); }
    };
    load();
  }, [params.id]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };
      const res = await ApiService({ ...data, id: parseInt(params.id) }, 0, header, checkOfficeExpense.method, checkOfficeExpense.url);
      if (!res.data.error) { toast.success(res.data.message); navigate(`/${OfficeExpenseRoute.list}`); }
      else { toast.error(res.data.message); navigate(`/${OfficeExpenseRoute.list}`); }
    } catch (e) { toast.error(e?.response?.data?.message || "Something went wrong"); }
    finally { setSubmitting(false); }
  };

  if (loading) {
    return (
      <div style={{ minHeight:"100vh", background:THEME.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
        <div className="poe-spinner" />
        <p style={{ color:THEME.textLight, fontSize:13 }}>Loading expense…</p>
      </div>
    );
  }

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div style={{ minHeight:"100vh", background:THEME.bg, fontFamily:"'DM Sans',sans-serif", padding:"28px 24px" }}>

        {/* ── Header ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:4, height:26, borderRadius:3, background:`linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
            <div>
              <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:THEME.text, fontFamily:"'Sora',sans-serif", letterSpacing:"-0.3px" }}>
                Preview Office Expense
              </h1>
              <p style={{ margin:"2px 0 0", fontSize:12, color:THEME.textMuted }}>ID #{params.id}</p>
            </div>
          </div>
          {expense.is_approved !== undefined && <StatusBadge value={expense.is_approved} />}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="poe-fade">

            {/* ── 1. Expense Details (read-only) ── */}
            <CardSection title="Expense Details" icon="🏢">
              <div style={{ marginBottom:14 }}>
                <FieldLabel>Description</FieldLabel>
                <textarea className="poe-textarea" rows={3} value={expense.description || ""} disabled />
              </div>
              <Grid>
                <div>
                  <FieldLabel>Team Member</FieldLabel>
                  <input className="poe-input" type="text" value={expense.team_fullname || ""} disabled />
                </div>
                <div>
                  <FieldLabel>Amount</FieldLabel>
                  <div style={{ padding:"10px 13px", borderRadius:10, border:`1.5px solid ${THEME.border}`, background:"#F9F7F4", fontSize:14, fontWeight:800, color:THEME.brand, fontFamily:"'Sora',sans-serif" }}>
                    ₹ {parseFloat(expense.amount || 0).toLocaleString("en-IN")}
                  </div>
                </div>
                <div>
                  <FieldLabel>Date</FieldLabel>
                  {expense.date
                    ? <input className="poe-input" type="date" value={expense.date} disabled />
                    : <span style={{ color:THEME.textLight, fontSize:13 }}>—</span>
                  }
                </div>
              </Grid>
            </CardSection>

            {/* ── 2. Attachments ── */}
            <CardSection title="Attachments" icon="📎">
              <Grid cols="repeat(4, 1fr)">
                <AttachCard label="Receipt"  url={expense.receipt_image} />
                <AttachCard label="Image 1"  url={expense.submitters_img1} />
                <AttachCard label="Image 2"  url={expense.submitters_img2} />
                <AttachCard label="Image 3"  url={expense.submitters_img3} />
              </Grid>
            </CardSection>

            {/* ── 3. Approval ── */}
            <CardSection title="Approval Decision" icon="✅">
              <div style={{ maxWidth:300 }}>
                <FieldLabel>Status</FieldLabel>
                <select
                  className={`poe-select-active${errors.is_approved ? " error" : ""}`}
                  {...register("is_approved", { required: "Please select a status" })}
                >
                  <option value="">-- Select Status --</option>
                  <option value="0">⏳ Pending</option>
                  <option value="1">✅ Approved</option>
                  <option value="2">❌ Rejected</option>
                </select>
                <ErrorMsg message={errors.is_approved?.message} />
              </div>
            </CardSection>

            {/* ── Actions ── */}
            <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
              <SecondaryBtn onClick={() => navigate(`/${OfficeExpenseRoute.list}`)}>← Back</SecondaryBtn>
              <PrimaryBtn type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <span style={{ width:14, height:14, borderRadius:"50%", border:"2px solid #ffffff88", borderTopColor:"#fff", display:"inline-block", animation:"poeSpin 0.7s linear infinite" }} />
                    Saving…
                  </>
                ) : "✓ Submit Decision"}
              </PrimaryBtn>
            </div>

          </div>
        </form>
      </div>
    </>
  );
};

export default PreviewOfficeExpense;