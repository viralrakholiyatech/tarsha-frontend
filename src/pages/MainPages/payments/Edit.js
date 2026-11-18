// ─────────────────────────────────────────────
//  EditPayments.jsx  —  Edit Payment
//  Design system consistent with AddPayments
// ─────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PaymentRoute } from "../../../config/RouteConfig";
import { getToken } from "../../../services/useLocalStorage";
import { useForm } from "react-hook-form";
import { floatPattern } from "../../../services/Pattern";
import { fetchActiveEmployee, getPaymentcategory, getPaymentById, updatePayment } from "../../../config/config";
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
  @keyframes adPulse { 0%,100%{opacity:1} 50%{opacity:.4} }

  .ad-input {
    width:100%;padding:10px 13px;border-radius:10px;
    border:1.5px solid #E0D5C5;font-size:13px;
    font-family:'DM Sans',sans-serif;color:#1A1A2E;
    outline:none;background:#fff;appearance:auto;
    transition:border-color 0.15s,box-shadow 0.15s;
    resize:vertical;
  }
  .ad-input:focus { border-color:#887549;box-shadow:0 0 0 3px #88754918; }
  .ad-input::placeholder { color:#BDBDBD; }
  .ad-input.error { border-color:#FFA39E;background:#FFF1F0; }

  .ad-skeleton { animation:adPulse 1.4s ease-in-out infinite; background:#EDE5D5; border-radius:8px; display:block; }

  ::-webkit-scrollbar{width:5px;}
  ::-webkit-scrollbar-track{background:#F5F0E8;}
  ::-webkit-scrollbar-thumb{background:#C4A97D;border-radius:10px;}
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
  return (
    <p style={{ margin:"4px 0 0", fontSize:11, color:THEME.error, display:"flex", alignItems:"center", gap:4 }}>
      ⚠ {message}
    </p>
  );
}

function CardSection({ title, icon, subtitle, children }) {
  return (
    <div style={{ background:"#fff", border:`1px solid ${THEME.border}`, borderRadius:14, padding:"20px 24px", marginBottom:16, boxShadow:"0 2px 10px rgba(136,117,73,0.06)" }}>
      <div style={{ display:"flex", alignItems:"flex-start", gap:8, marginBottom:18 }}>
        <div style={{ width:3, minHeight:16, borderRadius:2, background:`linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)`, marginTop:2 }} />
        <div>
          <h2 style={{ margin:0, fontSize:12, fontWeight:700, color:THEME.brand, textTransform:"uppercase", letterSpacing:"0.07em", fontFamily:"'Sora',sans-serif" }}>
            {icon && <span style={{ marginRight:6 }}>{icon}</span>}{title}
          </h2>
          {subtitle && (
            <p style={{ margin:"3px 0 0", fontSize:13, fontWeight:600, color:THEME.text, fontFamily:"'Sora',sans-serif", letterSpacing:"-0.2px" }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function PrimaryBtn({ children, type = "button", disabled }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type={type} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding:"10px 24px", borderRadius:10, border:"none", background:disabled ? "#C4C4C4" : hov ? THEME.brandDark : THEME.brand, color:"#fff", fontSize:13, fontWeight:700, cursor:disabled ? "not-allowed" : "pointer", fontFamily:"'Sora',sans-serif", transition:"all 0.18s", boxShadow:disabled ? "none" : `0 2px 8px ${THEME.brand}44`, display:"inline-flex", alignItems:"center", gap:6 }}
    >
      {children}
    </button>
  );
}

function SecondaryBtn({ children, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button" onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding:"10px 24px", borderRadius:10, border:`1.5px solid ${hov ? THEME.brand : "#E0D5C5"}`, background:hov ? THEME.brandLight : "#fff", color:hov ? THEME.brand : "#595959", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.18s" }}
    >
      {children}
    </button>
  );
}

// ── Skeleton field placeholder ───────────────
function SkeletonField({ height = 42 }) {
  return <span className="ad-skeleton" style={{ width:"100%", height }} />;
}


// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const EditPayments = () => {
  const navigate    = useNavigate();
  const { id }      = useParams();

  const [fetching,   setFetching]   = useState(true);   // loading existing record
  const [loading,    setLoading]    = useState(false);   // submit
  const [employees,  setEmployees]  = useState([]);
  const [categories, setCategories] = useState([]);

  // Controlled Select values (needed to pre-select)
  const [selectedCat, setSelectedCat] = useState(null);
  const [selectedEmp, setSelectedEmp] = useState(null);

  const {
    register,
    formState: { errors },
    setValue,
    handleSubmit,
    reset,
  } = useForm({ mode: "onChange" });

  // ── Load dropdowns + existing record in parallel ──
  useEffect(() => {
    const h = { Authorization: `Bearer ${getToken()}` };

    const loadEmployees = async () => {
      try {
        const res = await ApiService(null, 0, h, fetchActiveEmployee.method, fetchActiveEmployee.url);
        if (!res.data.error && Array.isArray(res.data.data)) return res.data.data;
      } catch (e) { console.error(e); }
      return [];
    };

    const loadCategories = async () => {
      try {
        const res = await ApiService(null, 0, h, getPaymentcategory.method, getPaymentcategory.url);
        if (!res.data.error && Array.isArray(res.data.data)) return res.data.data;
      } catch (e) { console.error(e); }
      return [];
    };

const loadRecord = async () => {
  try {
    const res = await ApiService(null, 0, h, getPaymentById.method, `${getPaymentById.url}/${id}`);
    console.log("getPaymentById response:", res.data); // ← add this
    if (!res.data.error && res.data.data) return res.data.data;
  } catch (e) { 
    console.error("getPaymentById error:", e); // ← and this
  }
  return null;
};

    const init = async () => {
      setFetching(true);
      const [emps, cats, record] = await Promise.all([loadEmployees(), loadCategories(), loadRecord()]);

      setEmployees(emps);
      setCategories(cats);

      if (record) {
        // Pre-fill react-hook-form
        reset({
          name:            record.name          ?? "",
          mobile_no:       record.mobile_no     ?? "",
date: record.date ? new Date(record.date).toLocaleDateString("en-CA") : "",
          amount:          record.amount        ?? "",
          remarks:         record.remarks       ?? "",
          category_id:     record.category_id   ?? null,
          via_employee_id: record.via_employee_id ?? null,
        });

        // Pre-select react-select dropdowns
        const matchedCat = cats.find((c) => (c.id ?? c.value) === record.category_id);
        if (matchedCat) setSelectedCat({ value: matchedCat.id ?? matchedCat.value, label: matchedCat.name ?? matchedCat.label });

        const matchedEmp = emps.find((e) => e.id === record.via_employee_id);
        if (matchedEmp) setSelectedEmp({ value: matchedEmp.id, label: `${matchedEmp.first_name} ${matchedEmp.last_name}` });
      } else {
        toast.error("Could not load payment record");
        navigate(`/${PaymentRoute.list}`);
      }

      setFetching(false);
    };

    init();
  }, [id]);

  // ── Submit ───────────────────────────────────
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };
      const res = await ApiService({ ...data, id }, 0, header, updatePayment.method, updatePayment.url);
      if (!res.data.error) {
        toast.success(res.data.message || "Payment updated successfully");
        navigate(`/${PaymentRoute.list}`);
      } else { toast.error(res.data.message); }
    } catch (err) { toast.error(err?.response?.data?.message || "Something went wrong"); }
    finally { setLoading(false); }
  };

  const empOptions = employees.map((e) => ({ value: e.id, label: `${e.first_name} ${e.last_name}` }));
  const catOptions = categories.map((c) => ({ value: c.id ?? c.value, label: c.name ?? c.label }));

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div style={{ minHeight:"100vh", background:THEME.bg, fontFamily:"'DM Sans',sans-serif", padding:"28px 24px" }}>

        {/* ── Page Header ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, marginBottom:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:4, height:26, borderRadius:3, background:`linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
            <div>
              <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:THEME.text, fontFamily:"'Sora',sans-serif", letterSpacing:"-0.3px" }}>
                Edit Payment
              </h1>
              {!fetching && (
                <p style={{ margin:"2px 0 0", fontSize:12, color:THEME.textMuted, fontFamily:"'DM Sans',sans-serif" }}>
                  ID #{id}
                </p>
              )}
            </div>
          </div>

          {/* Edit badge */}
          <span style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"5px 12px", borderRadius:20, background:THEME.brandLight, border:`1px solid ${THEME.border}`, fontSize:11, fontWeight:700, color:THEME.brand, fontFamily:"'Sora',sans-serif", textTransform:"uppercase", letterSpacing:"0.06em" }}>
            ✏️ Editing
          </span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="ad-fade">

            {/* ══ LEDGER DETAILS ══ */}
            <CardSection title="Ledger Details" icon="🧾" subtitle="In Ledger">
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

                {/* Name */}
                <div>
                  <FieldLabel required>Name</FieldLabel>
                  {fetching ? <SkeletonField /> : (
                    <>
                      <input
                        type="text"
                        placeholder="e.g. John Doe"
                        className={`ad-input${errors.name ? " error" : ""}`}
                        {...register("name", {
                          required: "Name is required",
                          minLength: { value: 2, message: "At least 2 characters" },
                        })}
                      />
                      <ErrorMsg message={errors.name?.message} />
                    </>
                  )}
                </div>

                {/* Mobile No */}
                <div>
                  <FieldLabel required>Mobile No.</FieldLabel>
                  {fetching ? <SkeletonField /> : (
                    <>
                      <input
                        type="tel"
                        placeholder="e.g. 9876543210"
                        className={`ad-input${errors.mobile_no ? " error" : ""}`}
                        {...register("mobile_no", {
                          required: "Mobile number is required",
                          pattern: { value: /^[0-9]{10}$/, message: "Enter a valid 10-digit mobile number" },
                        })}
                      />
                      <ErrorMsg message={errors.mobile_no?.message} />
                    </>
                  )}
                </div>
              </div>
            </CardSection>

            {/* ══ TRANSACTION DETAILS ══ */}
            <CardSection title="Transaction Details" icon="💰">
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>

                {/* Date */}
                <div>
                  <FieldLabel required>Date</FieldLabel>
                  {fetching ? <SkeletonField /> : (
                    <>
                      <input
                        type="date"
                        className={`ad-input${errors.date ? " error" : ""}`}
                        {...register("date", { required: "Date is required" })}
                      />
                      <ErrorMsg message={errors.date?.message} />
                    </>
                  )}
                </div>

                {/* Category */}
                <div>
                  <FieldLabel required>Category</FieldLabel>
                  {fetching ? <SkeletonField /> : (
                    <>
                      <Select
                        options={catOptions}
                        isSearchable
                        placeholder="Select category…"
                        value={selectedCat}
                        styles={selectStyles(!!errors.category_id)}
                        onChange={(opt) => {
                          setSelectedCat(opt);
                          setValue("category_id", opt?.value ?? null, { shouldValidate: true });
                        }}
                      />
                      <input type="hidden" {...register("category_id", { required: "Category is required" })} />
                      <ErrorMsg message={errors.category_id?.message} />
                    </>
                  )}
                </div>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>

                {/* Amount */}
                <div>
                  <FieldLabel required>Amount</FieldLabel>
                  {fetching ? <SkeletonField /> : (
                    <>
                      <input
                        type="text"
                        placeholder="e.g. 5000.00"
                        className={`ad-input${errors.amount ? " error" : ""}`}
                        {...register("amount", {
                          required: "Amount is required",
                          pattern: { value: floatPattern, message: "Enter a valid amount" },
                          validate: (v) => parseFloat(v) > 0 || "Must be greater than zero",
                        })}
                      />
                      <ErrorMsg message={errors.amount?.message} />
                    </>
                  )}
                </div>

                {/* Via Employee — optional */}
                <div>
                  <FieldLabel>Via Employee</FieldLabel>
                  {fetching ? <SkeletonField /> : (
                    <Select
                      options={empOptions}
                      isSearchable
                      isClearable
                      placeholder="Select employee…"
                      value={selectedEmp}
                      styles={selectStyles(false)}
                      onChange={(opt) => {
                        setSelectedEmp(opt);
                        setValue("via_employee_id", opt?.value ?? null);
                      }}
                    />
                  )}
                  <input type="hidden" {...register("via_employee_id")} />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <FieldLabel>Remarks</FieldLabel>
                {fetching ? <SkeletonField height={80} /> : (
                  <textarea
                    rows={3}
                    placeholder="Add any remarks or context…"
                    className="ad-input"
                    {...register("remarks")}
                  />
                )}
              </div>
            </CardSection>

            {/* ── Actions ── */}
            <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
              <SecondaryBtn onClick={() => navigate(`/${PaymentRoute.list}`)}>← Back</SecondaryBtn>
              <PrimaryBtn type="submit" disabled={loading || fetching}>
                {loading ? (
                  <>
                    <span style={{ width:14, height:14, borderRadius:"50%", border:"2px solid #ffffff88", borderTopColor:"#fff", display:"inline-block", animation:"adSpin 0.7s linear infinite" }} />
                    Saving…
                  </>
                ) : "✓ Update Payment"}
              </PrimaryBtn>
            </div>

          </div>
        </form>
      </div>
    </>
  );
};

export default EditPayments;