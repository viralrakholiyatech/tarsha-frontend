// ─────────────────────────────────────────────
//  AddInward.jsx  —  Add Inward
//  Same design as AddFileExpense / AddOfficeExpense
// ─────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import Select from "react-select";
import toast from "react-hot-toast";
import { getCustomers } from "../../../services/CustomerService";
import { getToken } from "../../../services/useLocalStorage";
import ApiService from "../../../services/ApiService";
import { fetchActiveEmployee, fetchallStage, addinward } from "../../../config/config";
import { InwardRoute } from "../../../config/RouteConfig";
import { useNavigate } from "react-router-dom";
import S3FileUpload from "../../../components/S3FileUpload";


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
  @keyframes aiwFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .aiw-fade { animation:aiwFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes aiwSpin { to{transform:rotate(360deg)} }
  .aiw-spinner { width:28px;height:28px;border-radius:50%;border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};animation:aiwSpin 0.8s linear infinite; }

  .aiw-input {
    width:100%;padding:10px 13px;border-radius:10px;
    border:1.5px solid #E0D5C5;font-size:13px;
    font-family:'DM Sans',sans-serif;color:#1A1A2E;
    outline:none;background:#fff;appearance:auto;
    transition:border-color 0.15s,box-shadow 0.15s;
  }
  .aiw-input:focus { border-color:${THEME.brand};box-shadow:0 0 0 3px ${THEME.brand}18; }
  .aiw-input::placeholder { color:${THEME.textLight}; }

  ::-webkit-scrollbar{width:5px;}
  ::-webkit-scrollbar-track{background:${THEME.brandLight};}
  ::-webkit-scrollbar-thumb{background:${THEME.brandMid};border-radius:10px;}
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
function AddInward() {
  const navigate = useNavigate();
  const [loading,    setLoading]   = useState(false);
  const [submitting, setSubmitting]= useState(false);
  const [custData,   setCustData]  = useState([]);
  const [emp,        setEmp]       = useState([]);
  const [fileList,   setFileList]  = useState([]);

  const [formData, setFormData] = useState({
    clientId:          "",
    project:           "",
    item:              "",
    received_from:     "",
    received_contact:  "",
    handover:          "",
    signature:         "",
    photo:             "",
  });

  // ── Load all data in parallel ─────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const h = { Authorization: `Bearer ${getToken()}` };
        const [custRes, empRes, projRes] = await Promise.all([
          getCustomers(getToken()),
          ApiService(null, 0, h, fetchActiveEmployee.method, fetchActiveEmployee.url),
          ApiService(null, 0, h, fetchallStage.method, fetchallStage.url),
        ]);

        if (!custRes.data.error) {
          setCustData((custRes.data.data || []).map((d) => ({ value: d.id, label: d.first_name })));
        }
        if (!empRes.data.error) {
          setEmp((empRes.data.data || []).map((m) => ({ value: m.id, label: `${m.first_name} ${m.last_name}` })));
        }
        if (!projRes.data.error) {
          setFileList((projRes.data.data || []).map((d) => ({ value: d.id, label: `${d.case_id} - (${d.first_name})` })));
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.item?.trim()) { toast.error("Item is required"); return; }

    const form = new FormData();
    ["clientId","project","item","received_from","received_contact","handover"].forEach((k) => {
      if (formData[k]) form.append(k, formData[k]);
    });
    if (formData.signature) form.append("signature", formData.signature);
    if (formData.photo)     form.append("photo",     formData.photo);

    setSubmitting(true);
    try {
      const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "multipart/form-data" };
      const res = await ApiService(form, 0, header, addinward.method, addinward.url);
      if (!res.data.error) {
        toast.success("Inward added successfully!");
        navigate(`/${InwardRoute.list}`);
      } else { toast.error(res.data.message); }
    } catch (e) { console.error(e); toast.error("Something went wrong."); }
    finally { setSubmitting(false); }
  };

  if (loading) {
    return (
      <div style={{ minHeight:"100vh", background:THEME.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
        <div className="aiw-spinner" />
        <p style={{ color:THEME.textLight, fontSize:13 }}>Loading data…</p>
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
          <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:THEME.text, fontFamily:"'Sora',sans-serif", letterSpacing:"-0.3px" }}>
            Add Inward
          </h1>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="aiw-fade">

            {/* ── 1. Inward Details ── */}
            <CardSection title="Inward Details" icon="📥">
              <Grid>
                <div>
                  <FieldLabel>Customer</FieldLabel>
                  <Select
                    options={custData} isSearchable placeholder="Select customer…"
                    styles={selectStyles}
                    value={custData.find((o) => o.value === formData.clientId) || null}
                    onChange={(opt) => setFormData((p) => ({ ...p, clientId: opt?.value }))}
                  />
                </div>
                <div>
                  <FieldLabel>Project</FieldLabel>
                  <Select
                    options={fileList} isSearchable placeholder="Select project…"
                    styles={selectStyles}
                    value={fileList.find((o) => o.value === formData.project) || null}
                    onChange={(opt) => setFormData((p) => ({ ...p, project: opt?.value }))}
                  />
                </div>
                <div>
                  <FieldLabel required>Item</FieldLabel>
                  <input className="aiw-input" type="text" name="item"
                    placeholder="Enter item name…" onChange={handleInput} value={formData.item} />
                </div>
              </Grid>
            </CardSection>

            {/* ── 2. Sender Details ── */}
            <CardSection title="Sender Details" icon="👤">
              <Grid>
                <div>
                  <FieldLabel>Received From</FieldLabel>
                  <input className="aiw-input" type="text" name="received_from"
                    placeholder="Enter name…" onChange={handleInput} value={formData.received_from} />
                </div>
                <div>
                  <FieldLabel>Received Contact</FieldLabel>
                  <input className="aiw-input" type="text" name="received_contact"
                    placeholder="Enter contact number…" onChange={handleInput} value={formData.received_contact} />
                </div>
                <div>
                  <FieldLabel>Collected By</FieldLabel>
                  <Select
                    options={emp} isSearchable placeholder="Select employee…"
                    styles={selectStyles}
                    value={emp.find((o) => o.value === formData.handover) || null}
                    onChange={(opt) => setFormData((p) => ({ ...p, handover: opt?.value }))}
                  />
                </div>
              </Grid>
            </CardSection>

            {/* ── 3. Attachments ── */}
            <CardSection title="Attachments" icon="📎">
              <Grid cols="repeat(auto-fit, minmax(280px, 1fr))">
                <S3FileUpload
                  label="Signature"
                  value={formData.signature}
                  onChange={(url) => setFormData((p) => ({ ...p, signature: url }))}
                  folder="inward/signatures"
                  accept="image/*"
                />
                <S3FileUpload
                  label="Photo"
                  value={formData.photo}
                  onChange={(url) => setFormData((p) => ({ ...p, photo: url }))}
                  folder="inward/photos"
                  accept="image/*"
                />
              </Grid>
            </CardSection>

            {/* ── Actions ── */}
            <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
              <SecondaryBtn onClick={() => navigate(`/${InwardRoute.list}`)}>← Back</SecondaryBtn>
              <PrimaryBtn type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <span style={{ width:14, height:14, borderRadius:"50%", border:"2px solid #ffffff88", borderTopColor:"#fff", display:"inline-block", animation:"aiwSpin 0.7s linear infinite" }} />
                    Saving…
                  </>
                ) : "✓ Add Inward"}
              </PrimaryBtn>
            </div>

          </div>
        </form>
      </div>
    </>
  );
}

export default AddInward;