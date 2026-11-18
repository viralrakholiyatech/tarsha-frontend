// ─────────────────────────────────────────────
//  AddDeposit.jsx  —  Add Deposit
//  Same design system as AddCampaign / AddPost
// ─────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DepositExpenseRoute } from "../../../config/RouteConfig";
import { getToken } from "../../../services/useLocalStorage";
import { useForm } from "react-hook-form";
import { todayDate } from "../../../services/DateAndTimeService";
import { floatPattern } from "../../../services/Pattern";
import { fetchActiveEmployee, insertDeposit } from "../../../config/config";
import ApiService from "../../../services/ApiService";
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

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }
  @keyframes adFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .ad-fade { animation:adFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes adSpin { to{transform:rotate(360deg)} }

  .ad-input {
    width:100%;padding:10px 13px;border-radius:10px;
    border:1.5px solid #E0D5C5;font-size:13px;
    font-family:'DM Sans',sans-serif;color:#1A1A2E;
    outline:none;background:#fff;appearance:auto;
    transition:border-color 0.15s,box-shadow 0.15s;
    resize:vertical;
  }
  .ad-input:focus { border-color:${THEME.brand};box-shadow:0 0 0 3px ${THEME.brand}18; }
  .ad-input::placeholder { color:${THEME.textLight}; }
  .ad-input.error { border-color:${THEME.errorBorder};background:${THEME.errorBg}; }

  ::-webkit-scrollbar{width:5px;}
  ::-webkit-scrollbar-track{background:${THEME.brandLight};}
  ::-webkit-scrollbar-thumb{background:${THEME.brandMid};border-radius:10px;}
`;

const selectStyles = (hasError) => ({
  control: (base, state) => ({
    ...base,
    border: `1.5px solid ${hasError ? THEME.errorBorder : state.isFocused ? THEME.brand : "#E0D5C5"}`,
    borderRadius: 10, minHeight: 42,
    boxShadow: state.isFocused ? `0 0 0 3px ${THEME.brand}18` : "none",
    fontFamily: "'DM Sans',sans-serif", fontSize: 13,
    background: hasError ? THEME.errorBg : "#fff",
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
});


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

function PrimaryBtn({ children, type="button", disabled }) {
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
const AddDeposit = () => {
  const navigate   = useNavigate();
  const [loading,   setLoading]   = useState(false);
  const [employees, setEmployees] = useState([]);

  const {
    register,
    formState: { errors },
    setValue,
    handleSubmit,
  } = useForm({ mode: "onChange" });

  useEffect(() => {
    const load = async () => {
      try {
        const h = { Authorization: `Bearer ${getToken()}` };
        const res = await ApiService(null, 0, h, fetchActiveEmployee.method, fetchActiveEmployee.url);
        if (!res.data.error && Array.isArray(res.data.data)) setEmployees(res.data.data);
      } catch (e) { console.error(e); }
    };
    load();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };
      const res = await ApiService(data, 0, header, insertDeposit.method, insertDeposit.url);
      if (!res.data.error) {
        toast.success(res.data.message);
        navigate(`/${DepositExpenseRoute.list}`);
      } else { toast.error(res.data.message); }
    } catch (err) { toast.error(err?.response?.data?.message || "Something went wrong"); }
    finally { setLoading(false); }
  };

  const empOptions = employees.map((e) => ({ value: e.id, label: `${e.first_name} ${e.last_name}` }));

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div style={{ minHeight:"100vh", background:THEME.bg, fontFamily:"'DM Sans',sans-serif", padding:"28px 24px" }}>

        {/* ── Header ── */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:24 }}>
          <div style={{ width:4, height:26, borderRadius:3, background:`linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
          <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:THEME.text, fontFamily:"'Sora',sans-serif", letterSpacing:"-0.3px" }}>
            Add Deposit
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="ad-fade">

            <CardSection title="Deposit Details" icon="💰">
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>

                {/* Amount */}
                <div>
                  <FieldLabel required>Amount</FieldLabel>
                  <input type="text" placeholder="e.g. 5000.00"
                    className={`ad-input${errors.amount ? " error" : ""}`}
                    {...register("amount", {
                      required: "Amount is required",
                      pattern: { value: floatPattern, message: "Enter a valid amount" },
                      validate: (v) => parseFloat(v) > 0 || "Must be greater than zero",
                    })}
                  />
                  <ErrorMsg message={errors.amount?.message} />
                </div>

                {/* Date */}
                <div>
                  <FieldLabel required>Date</FieldLabel>
                  <input type="date"
                    className={`ad-input${errors.date ? " error" : ""}`}
                    defaultValue={todayDate()}
                    {...register("date", { required: "Date is required" })}
                  />
                  <ErrorMsg message={errors.date?.message} />
                </div>
              </div>

              {/* Team Member */}
              <div style={{ marginBottom:16 }}>
                <FieldLabel required>Team Member</FieldLabel>
                <Select
                  options={empOptions}
                  isSearchable
                  placeholder="Select team member…"
                  styles={selectStyles(!!errors.team_id)}
                  onChange={(opt) => setValue("team_id", opt?.value, { shouldValidate: true })}
                />
                <input type="hidden" {...register("team_id", { required: "Team member is required" })} />
                <ErrorMsg message={errors.team_id?.message} />
              </div>

              {/* Description */}
              <div>
                <FieldLabel>Description</FieldLabel>
                <textarea rows={4} placeholder="Add any notes or context…"
                  className={`ad-input${errors.description ? " error" : ""}`}
                  {...register("description")}
                />
              </div>
            </CardSection>

            {/* ── Actions ── */}
            <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
              <SecondaryBtn onClick={() => navigate(`/${DepositExpenseRoute.list}`)}>← Back</SecondaryBtn>
              <PrimaryBtn type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span style={{ width:14, height:14, borderRadius:"50%", border:"2px solid #ffffff88", borderTopColor:"#fff", display:"inline-block", animation:"adSpin 0.7s linear infinite" }} />
                    Saving…
                  </>
                ) : "✓ Add Deposit"}
              </PrimaryBtn>
            </div>

          </div>
        </form>
      </div>
    </>
  );
};

export default AddDeposit;