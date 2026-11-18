import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../../../services/useLocalStorage";
import toast from "react-hot-toast";
import { EmpRoute } from "../../../config/RouteConfig";
import ApiService from "../../../services/ApiService";
import {
  getDepartments,
  getPosts,
  insertEmployee,
  getRoles,
} from "../../../config/config";
import { useForm } from "react-hook-form";
import { checkFile } from "../../../services/ValidationService";
import {
  alphabetSpaceWithDot,
  mailPattern,
  phonePattern,
} from "../../../services/Pattern";
import Multiselect from "multiselect-react-dropdown";
import { ReactComponent as ImageIcon } from "../../../assets/svg/image.svg";
import S3FileUpload from "../../../components/S3FileUpload";

// ─────────────────────────────────────────────
//  🎨  THEME
// ─────────────────────────────────────────────
const THEME = {
  brand: "#887549",
  brandLight: "#F5F0E8",
  brandMid: "#C4A97D",
  brandDark: "#5C4E32",
  bg: "#F8F5F0",
  border: "#EDE5D5",
  text: "#1A1A2E",
  textMuted: "#ADADAD",
  textLight: "#BDBDBD",
  error: "#CF1322",
  errorBg: "#FFF1F0",
  errorBorder: "#FFA39E",
  success: "#2D9D78",
  successBg: "#EAF7F2",
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }
  @keyframes aeFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .ae-fade { animation:aeFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes aeSpin { to{transform:rotate(360deg)} }

  .ae-input {
    width:100%; padding:10px 13px; border-radius:10px;
    border:1.5px solid #E0D5C5; font-size:13px;
    font-family:'DM Sans',sans-serif; color:#1A1A2E;
    outline:none; background:#fff; transition:border-color 0.15s,box-shadow 0.15s;
    appearance:auto;
  }
  .ae-input:focus { border-color:#887549; box-shadow:0 0 0 3px #88754918; }
  .ae-input::placeholder { color:#BDBDBD; }
  .ae-input.error { border-color:#FFA39E; background:#FFF1F0; }
  .ae-input.error:focus { box-shadow:0 0 0 3px #CF132218; }

  .ae-textarea {
    width:100%; padding:10px 13px; border-radius:10px;
    border:1.5px solid #E0D5C5; font-size:13px;
    font-family:'DM Sans',sans-serif; color:#1A1A2E;
    outline:none; background:#fff; transition:border-color 0.15s,box-shadow 0.15s;
    resize:vertical; min-height:90px; line-height:1.6;
  }
  .ae-textarea:focus { border-color:#887549; box-shadow:0 0 0 3px #88754918; }
  .ae-textarea::placeholder { color:#BDBDBD; }

  /* Multiselect */
  .ae-multiselect .searchWrapper {
    border:1.5px solid #E0D5C5 !important; border-radius:10px !important;
    padding:6px 10px !important; min-height:42px !important;
    font-family:'DM Sans',sans-serif !important; transition:border-color 0.15s;
  }
  .ae-multiselect.error .searchWrapper { border-color:#FFA39E !important; background:#FFF1F0 !important; }
  .ae-multiselect .searchWrapper:focus-within { border-color:#887549 !important; box-shadow:0 0 0 3px #88754918; }
  .ae-multiselect .chip { background:#887549 !important; font-size:11px !important; border-radius:20px !important; }
  .ae-multiselect .optionContainer li:hover,
  .ae-multiselect .optionContainer .highlight { background:#F5F0E8 !important; color:#887549 !important; }
  .ae-multiselect input { font-family:'DM Sans',sans-serif !important; font-size:13px !important; }

  /* Upload zone */
  .ae-upload-zone {
    border:2px dashed #D4C4A0; border-radius:12px;
    padding:28px 20px; text-align:center; cursor:pointer;
    background:#F5F0E8; transition:all 0.18s;
    display:flex; flex-direction:column; align-items:center; gap:8px;
  }
  .ae-upload-zone:hover { border-color:#887549; background:#F0E8D8; }
  .ae-upload-zone.has-img { border-style:solid; border-color:#887549; }

  /* Status toggle */
  .ae-status-toggle { display:none; }
  .ae-status-label {
    display:inline-flex; align-items:center; gap:6px;
    padding:7px 16px; border-radius:20px; cursor:pointer;
    font-size:12px; font-weight:700; border:1.5px solid #E0D5C5;
    background:#fff; color:#8C8C8C; transition:all 0.18s;
    font-family:'DM Sans',sans-serif; user-select:none;
  }
  .ae-status-toggle[value="1"]:checked + .ae-status-label { background:#F6FFED; color:#389E0D; border-color:#B7EB8F; }
  .ae-status-toggle[value="0"]:checked + .ae-status-label { background:#FFF1F0; color:#CF1322; border-color:#FFA39E; }

  /* Tag input */
  .ae-tag-input-wrap {
    display:flex; flex-wrap:wrap; gap:7px; padding:8px 10px;
    border:1.5px solid #E0D5C5; border-radius:10px; background:#fff;
    min-height:44px; align-items:center; cursor:text;
    transition:border-color 0.15s,box-shadow 0.15s;
  }
  .ae-tag-input-wrap:focus-within { border-color:#887549; box-shadow:0 0 0 3px #88754918; }
  .ae-tag-input-wrap.error { border-color:#FFA39E; background:#FFF1F0; }
  .ae-tag {
    display:inline-flex; align-items:center; gap:5px;
    padding:3px 10px 3px 12px; border-radius:20px;
    background:#F5F0E8; color:#5C4E32; border:1px solid #EDE5D5;
    font-size:12px; font-weight:600; font-family:'DM Sans',sans-serif;
  }
  .ae-tag-remove {
    background:none; border:none; cursor:pointer; padding:0;
    color:#C4A97D; font-size:14px; line-height:1; font-weight:700;
    display:inline-flex; align-items:center;
  }
  .ae-tag-remove:hover { color:#887549; }
  .ae-tag-input {
    border:none; outline:none; font-size:13px; font-family:'DM Sans',sans-serif;
    color:#1A1A2E; background:transparent; min-width:140px; flex:1;
  }
  .ae-tag-input::placeholder { color:#BDBDBD; }

  /* Skill row */
  .ae-skill-row {
    display:grid; grid-template-columns:1fr auto auto; gap:10px; align-items:center;
    padding:8px 0; border-bottom:1px solid #EDE5D5;
  }
  .ae-skill-row:last-child { border-bottom:none; }
  .ae-skill-level {
    width:70px; padding:7px 10px; border-radius:8px;
    border:1.5px solid #E0D5C5; font-size:12px; text-align:center;
    font-family:'DM Sans',sans-serif; outline:none; transition:border-color 0.15s;
  }
  .ae-skill-level:focus { border-color:#887549; }

  .ae-add-btn {
    display:inline-flex; align-items:center; gap:5px;
    padding:7px 14px; border-radius:8px;
    background:#F5F0E8; border:1.5px solid #EDE5D5;
    color:#887549; font-size:12px; font-weight:700;
    cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.15s;
  }
  .ae-add-btn:hover { background:#887549; color:#fff; border-color:#887549; }
  .ae-remove-btn {
    width:28px; height:28px; border-radius:7px;
    background:#FFF1F0; border:1.5px solid #FFA39E;
    color:#CF1322; cursor:pointer; display:inline-flex;
    align-items:center; justify-content:center; font-size:14px; transition:all 0.15s;
  }
  .ae-remove-btn:hover { background:#CF1322; color:#fff; }

  /* Resume zone */
  .ae-resume-zone {
    border:2px dashed #D4C4A0; border-radius:12px; padding:16px 18px;
    cursor:pointer; background:#F5F0E8; transition:all 0.18s;
    display:flex; align-items:center; gap:14px;
    position:relative; overflow:hidden;
  }
  .ae-resume-zone:hover { border-color:#887549; background:#F0E8D8; }
  .ae-resume-zone input[type=file] { position:absolute; inset:0; opacity:0; cursor:pointer; width:100%; }
  .ae-resume-zone.has-file { border-style:solid; border-color:#887549; }

  /* KPI row */
  .ae-kpi-row {
    display:grid; grid-template-columns:1fr 1fr; gap:10px; align-items:start;
    padding:10px 0; border-bottom:1px solid #EDE5D5;
  }
  .ae-kpi-row:last-child { border-bottom:none; }

  /* Authority block */
  .ae-authority-block {
    border-radius:10px; padding:14px 16px; margin-bottom:10px;
  }
  .ae-authority-block:last-child { margin-bottom:0; }

  /* Deliverable tabs */
  .ae-tab-btn {
    padding:7px 16px; border-radius:8px; font-size:12px; font-weight:700;
    border:1.5px solid #E0D5C5; cursor:pointer; font-family:'DM Sans',sans-serif;
    transition:all 0.15s; background:#fff; color:#595959;
  }
  .ae-tab-btn.active { background:#887549; color:#fff; border-color:#887549; }
  .ae-tab-btn:hover:not(.active) { border-color:#887549; color:#887549; }

  /* Growth index display */
  .ae-growth-bar {
    height:10px; border-radius:10px; background:#F5F0E8; overflow:hidden; margin:8px 0;
  }
  .ae-growth-fill {
    height:100%; border-radius:10px;
    background:linear-gradient(90deg,#C4A97D,#887549);
    transition:width 0.4s ease;
  }

  /* Warning/Risk stage list */
  .ae-stage-item {
    display:flex; align-items:flex-start; gap:10px;
    padding:10px 14px; border-radius:10px; margin-bottom:8px;
    border:1px solid #EDE5D5;
  }
  .ae-stage-badge {
    flex-shrink:0; padding:2px 10px; border-radius:20px;
    font-size:11px; font-weight:700; font-family:'DM Sans',sans-serif;
  }

  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:#F5F0E8; }
  ::-webkit-scrollbar-thumb { background:#C4A97D; border-radius:10px; }
`;

// ─────────────────────────────────────────────
//  🧩  ATOMS
// ─────────────────────────────────────────────
function FieldLabel({ children, required }) {
  return (
    <label style={{ display:"block", marginBottom:5, fontSize:11, fontWeight:700, color:THEME.textMuted, textTransform:"uppercase", letterSpacing:"0.07em" }}>
      {children}
      {required && <span style={{ color:THEME.error, marginLeft:3 }}>*</span>}
    </label>
  );
}
function ErrorMsg({ message }) {
  if (!message) return null;
  return (
    <p style={{ margin:"4px 0 0", fontSize:11, color:THEME.error, display:"flex", alignItems:"center", gap:4 }}>
      <span>⚠</span> {message}
    </p>
  );
}
function CardSection({ title, icon, children }) {
  return (
    <div style={{ background:"#fff", border:`1px solid ${THEME.border}`, borderRadius:14, padding:"22px 24px", marginBottom:16, boxShadow:"0 2px 10px rgba(136,117,73,0.06)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
        <div style={{ width:3, height:16, borderRadius:2, background:`linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
        <h2 style={{ margin:0, fontSize:12, fontWeight:700, color:THEME.brand, textTransform:"uppercase", letterSpacing:"0.07em", fontFamily:"'Sora',sans-serif" }}>
          {icon && <span style={{ marginRight:6 }}>{icon}</span>}
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}
function PrimaryBtn({ children, type="button", onClick, disabled }) {
  const [hov, setHov] = useState(false);
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding:"10px 24px", borderRadius:10, border:"none", background:disabled?"#C4C4C4":hov?THEME.brandDark:THEME.brand, color:"#fff", fontSize:13, fontWeight:700, cursor:disabled?"not-allowed":"pointer", fontFamily:"'Sora',sans-serif", transition:"all 0.18s", boxShadow:disabled?"none":`0 2px 8px ${THEME.brand}44`, display:"inline-flex", alignItems:"center", gap:6 }}>
      {children}
    </button>
  );
}
function SecondaryBtn({ children, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding:"10px 24px", borderRadius:10, border:`1.5px solid ${hov?THEME.brand:"#E0D5C5"}`, background:hov?THEME.brandLight:"#fff", color:hov?THEME.brand:"#595959", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.18s" }}>
      {children}
    </button>
  );
}
function FormField({ label, required, error, children, fullWidth }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gridColumn:fullWidth?"1 / -1":undefined }}>
      <FieldLabel required={required}>{label}</FieldLabel>
      {children}
      <ErrorMsg message={error} />
    </div>
  );
}

// ─────────────────────────────────────────────
//  🏷  Tag Input  (paste-aware)
// ─────────────────────────────────────────────
function TagInput({ value = [], onChange, placeholder, hasError }) {
  const [inputVal, setInputVal] = useState("");

  const cleanTag = (raw) =>
    raw
      .replace(/^[\s\u2022\u00b7\u2013\u2014\-\*]+/, "")
      .replace(/[\u2022\u00b7]+/g, "")
      .trim();

  const splitBlock = (text) =>
    text
      .split(/[\n\r]+/)
      .flatMap((line) => line.split(/,/))
      .map(cleanTag)
      .filter(Boolean);

  const addTags = (rawList) => {
    const next = [...value];
    rawList.forEach((raw) => {
      const tag = cleanTag(raw);
      if (tag && !next.includes(tag)) next.push(tag);
    });
    if (next.length !== value.length) onChange(next);
  };

  const handleKey = (e) => {
    if (["Enter", ","].includes(e.key)) {
      e.preventDefault();
      if (inputVal.trim()) { addTags([inputVal]); setInputVal(""); }
    } else if (e.key === "Backspace" && !inputVal && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    const tags = splitBlock(pasted);
    if (tags.length > 0) { addTags(tags); setInputVal(""); }
  };

  const handleBlur = () => {
    if (inputVal.trim()) { addTags([inputVal]); setInputVal(""); }
  };

  return (
    <div
      className={`ae-tag-input-wrap${hasError ? " error" : ""}`}
      onClick={(e) => e.currentTarget.querySelector("input")?.focus()}
    >
      {value.map((t) => (
        <span className="ae-tag" key={t}>
          {t}
          <button type="button" className="ae-tag-remove" onClick={() => onChange(value.filter((x) => x !== t))}>×</button>
        </span>
      ))}
      <input
        className="ae-tag-input"
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        onKeyDown={handleKey}
        onPaste={handlePaste}
        onBlur={handleBlur}
        placeholder={value.length === 0 ? placeholder : "Add more…"}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
//  ⚡  Skill Builder
// ─────────────────────────────────────────────
function SkillBuilder({ value = [], onChange }) {
  const [skillName, setSkillName] = useState("");
  const [skillLevel, setSkillLevel] = useState(80);
  const add = () => {
    const name = skillName.trim();
    if (!name) return;
    if (value.find((s) => s.name.toLowerCase() === name.toLowerCase())) { toast.error("Skill already added"); return; }
    onChange([...value, { name, level: Number(skillLevel) }]);
    setSkillName(""); setSkillLevel(80);
  };
  return (
    <div>
      {value.length > 0 && (
        <div style={{ marginBottom:12 }}>
          {value.map((s) => (
            <div className="ae-skill-row" key={s.name}>
              <span style={{ fontSize:13, fontWeight:600, color:THEME.text, fontFamily:"'DM Sans',sans-serif" }}>{s.name}</span>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:80, height:6, borderRadius:10, background:THEME.brandLight, overflow:"hidden" }}>
                  <div style={{ width:`${s.level}%`, height:"100%", borderRadius:10, background:`linear-gradient(90deg,${THEME.brandMid},${THEME.brand})` }} />
                </div>
                <span style={{ fontSize:11, color:THEME.textMuted, fontWeight:600, minWidth:30 }}>{s.level}%</span>
              </div>
              <button type="button" className="ae-remove-btn" onClick={() => onChange(value.filter((x) => x.name !== s.name))}>×</button>
            </div>
          ))}
        </div>
      )}
      <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
        <input className="ae-input" style={{ flex:"1 1 180px", minWidth:140 }} placeholder="Skill name (e.g. AutoCAD, SketchUp…)"
          value={skillName} onChange={(e) => setSkillName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} />
        <input type="number" min="1" max="100" className="ae-skill-level" value={skillLevel}
          onChange={(e) => setSkillLevel(Math.min(100, Math.max(1, e.target.value)))} title="Proficiency %" />
        <span style={{ fontSize:12, color:THEME.textMuted }}>%</span>
        <button type="button" className="ae-add-btn" onClick={add}>+ Add Skill</button>
      </div>
      <p style={{ margin:"6px 0 0", fontSize:11, color:THEME.textMuted }}>Press Enter or click Add Skill. Proficiency 1–100.</p>
    </div>
  );
}

// ─────────────────────────────────────────────
//  📚  Work History Builder
// ─────────────────────────────────────────────
function WorkHistoryBuilder({ value = [], onChange }) {
  const [form, setForm] = useState({ role:"", company:"", period:"" });
  const add = () => {
    if (!form.role.trim() || !form.company.trim()) { toast.error("Role and Company are required"); return; }
    onChange([...value, { ...form }]);
    setForm({ role:"", company:"", period:"" });
  };
  return (
    <div>
      {value.length > 0 && (
        <div style={{ marginBottom:12, display:"flex", flexDirection:"column", gap:8 }}>
          {value.map((w, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", background:THEME.brandLight, borderRadius:10, border:`1px solid ${THEME.border}` }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:700, color:THEME.text, fontFamily:"'DM Sans',sans-serif" }}>{w.role}</div>
                <div style={{ fontSize:12, color:THEME.textMuted }}>{w.company}{w.period && ` · ${w.period}`}</div>
              </div>
              <button type="button" className="ae-remove-btn" onClick={() => onChange(value.filter((_, idx) => idx !== i))}>×</button>
            </div>
          ))}
        </div>
      )}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr auto", gap:8, alignItems:"end" }}>
        <div><FieldLabel>Role / Position</FieldLabel><input className="ae-input" placeholder="e.g. Site Engineer" value={form.role} onChange={(e) => setForm({ ...form, role:e.target.value })} /></div>
        <div><FieldLabel>Company</FieldLabel><input className="ae-input" placeholder="e.g. K2India" value={form.company} onChange={(e) => setForm({ ...form, company:e.target.value })} /></div>
        <div><FieldLabel>Period</FieldLabel><input className="ae-input" placeholder="e.g. Jan 2020 – Mar 2022" value={form.period} onChange={(e) => setForm({ ...form, period:e.target.value })} /></div>
        <button type="button" className="ae-add-btn" style={{ marginBottom:0 }} onClick={add}>+ Add</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  🎓  Education Builder
// ─────────────────────────────────────────────
function EducationBuilder({ value = [], onChange }) {
  const [form, setForm] = useState({ degree:"", institution:"", year:"" });
  const add = () => {
    if (!form.degree.trim() || !form.institution.trim()) { toast.error("Degree and Institution are required"); return; }
    onChange([...value, { ...form }]);
    setForm({ degree:"", institution:"", year:"" });
  };
  return (
    <div>
      {value.length > 0 && (
        <div style={{ marginBottom:12, display:"flex", flexDirection:"column", gap:8 }}>
          {value.map((e, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", background:THEME.brandLight, borderRadius:10, border:`1px solid ${THEME.border}` }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:700, color:THEME.text, fontFamily:"'DM Sans',sans-serif" }}>{e.degree}</div>
                <div style={{ fontSize:12, color:THEME.textMuted }}>{e.institution}{e.year && ` · ${e.year}`}</div>
              </div>
              <button type="button" className="ae-remove-btn" onClick={() => onChange(value.filter((_, idx) => idx !== i))}>×</button>
            </div>
          ))}
        </div>
      )}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto auto", gap:8, alignItems:"end" }}>
        <div><FieldLabel>Degree</FieldLabel><input className="ae-input" placeholder="e.g. B.Tech Civil" value={form.degree} onChange={(e) => setForm({ ...form, degree:e.target.value })} /></div>
        <div><FieldLabel>Institution</FieldLabel><input className="ae-input" placeholder="e.g. SVNIT Surat" value={form.institution} onChange={(e) => setForm({ ...form, institution:e.target.value })} /></div>
        <div><FieldLabel>Year</FieldLabel><input className="ae-input" style={{ width:80 }} placeholder="2021" value={form.year} onChange={(e) => setForm({ ...form, year:e.target.value })} /></div>
        <button type="button" className="ae-add-btn" onClick={add}>+ Add</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  🚨  Emergency Contact Builder
// ─────────────────────────────────────────────
function EmergencyBuilder({ value = [], onChange }) {
  const [form, setForm] = useState({ name:"", relation:"", phone:"" });
  const add = () => {
    if (!form.name.trim() || !form.phone.trim()) { toast.error("Name and Phone are required"); return; }
    onChange([...value, { ...form }]);
    setForm({ name:"", relation:"", phone:"" });
  };
  return (
    <div>
      {value.length > 0 && (
        <div style={{ marginBottom:12, display:"flex", flexDirection:"column", gap:8 }}>
          {value.map((c, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", background:THEME.brandLight, borderRadius:10, border:`1px solid ${THEME.border}` }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:700, color:THEME.text, fontFamily:"'DM Sans',sans-serif" }}>{c.name} <span style={{ color:THEME.textMuted, fontWeight:400 }}>({c.relation})</span></div>
                <div style={{ fontSize:12, color:THEME.textMuted }}>{c.phone}</div>
              </div>
              <button type="button" className="ae-remove-btn" onClick={() => onChange(value.filter((_, idx) => idx !== i))}>×</button>
            </div>
          ))}
        </div>
      )}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr auto", gap:8, alignItems:"end" }}>
        <div><FieldLabel>Full Name</FieldLabel><input className="ae-input" placeholder="Contact name" value={form.name} onChange={(e) => setForm({ ...form, name:e.target.value })} /></div>
        <div><FieldLabel>Relation</FieldLabel><input className="ae-input" placeholder="e.g. Spouse" value={form.relation} onChange={(e) => setForm({ ...form, relation:e.target.value })} /></div>
        <div><FieldLabel>Phone</FieldLabel><input className="ae-input" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setForm({ ...form, phone:e.target.value })} /></div>
        <button type="button" className="ae-add-btn" onClick={add}>+ Add</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  🔐  Authority & Decision Rights Builder
// ─────────────────────────────────────────────
function AuthorityBuilder({ value, onChange }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {[
        { key:"can_decide", label:"✅ Can Decide Independently", color:"#F6FFED", border:"#B7EB8F", badge:"#52C41A", placeholder:"e.g. Internal work allocation, daily task planning…" },
        { key:"must_escalate", label:"⚠️ Must Escalate", color:"#FFFBE6", border:"#FFE58F", badge:"#FAAD14", placeholder:"e.g. Design changes affecting compliance, approval delays…" },
        { key:"cannot_decide", label:"🚫 Cannot Decide or Commit", color:"#FFF1F0", border:"#FFA39E", badge:"#FF4D4F", placeholder:"e.g. Commercial commitments, HR salary changes…" },
      ].map(({ key, label, color, border, badge, placeholder }) => (
        <div key={key} style={{ background:color, border:`1.5px solid ${border}`, borderRadius:12, padding:"14px 16px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
            <span style={{ background:badge, color:"#fff", fontSize:10, fontWeight:700, padding:"2px 10px", borderRadius:20, fontFamily:"'DM Sans',sans-serif" }}>{label}</span>
          </div>
          <TagInput value={value[key] || []} onChange={(v) => onChange({ ...value, [key]:v })} placeholder={placeholder} />
          <p style={{ margin:"5px 0 0", fontSize:11, color:THEME.textMuted }}>{(value[key] || []).length} item{(value[key] || []).length !== 1 ? "s" : ""} added</p>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
//  📅  Deliverables Builder
// ─────────────────────────────────────────────
function DeliverablesBuilder({ value, onChange }) {
  const [activeTab, setActiveTab] = useState("daily");
  const tabs = [
    { key:"daily", label:"📅 Daily", placeholder:"e.g. Task schedule created and followed…" },
    { key:"weekly", label:"📆 Weekly", placeholder:"e.g. Project movement review across all live assignments…" },
    { key:"monthly", label:"🗓️ Monthly", placeholder:"e.g. Architecture team output summary…" },
  ];
  return (
    <div>
      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
        {tabs.map((t) => (
          <button key={t.key} type="button" className={`ae-tab-btn${activeTab === t.key ? " active" : ""}`} onClick={() => setActiveTab(t.key)}>{t.label}</button>
        ))}
      </div>
      {tabs.map((t) => activeTab === t.key && (
        <div key={t.key}>
          <TagInput value={value[t.key] || []} onChange={(v) => onChange({ ...value, [t.key]:v })} placeholder={t.placeholder} />
          <p style={{ margin:"6px 0 0", fontSize:11, color:THEME.textMuted }}>{(value[t.key] || []).length} {t.key} deliverable{(value[t.key] || []).length !== 1 ? "s" : ""} added</p>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
//  📊  KPI Builder
// ─────────────────────────────────────────────
function KpiBuilder({ value = [], onChange }) {
  const [form, setForm] = useState({ category:"", metric:"", target:"" });
  const categories = ["Delivery", "Team", "Approval", "System", "Other"];
  const add = () => {
    if (!form.metric.trim()) { toast.error("Metric description is required"); return; }
    onChange([...value, { ...form }]);
    setForm({ category:"", metric:"", target:"" });
  };
  return (
    <div>
      {value.length > 0 && (
        <div style={{ marginBottom:14 }}>
          {Object.entries(
            value.reduce((acc, kpi) => {
              const cat = kpi.category || "Other";
              if (!acc[cat]) acc[cat] = [];
              acc[cat].push(kpi);
              return acc;
            }, {})
          ).map(([cat, kpis]) => (
            <div key={cat} style={{ marginBottom:10 }}>
              <div style={{ fontSize:11, fontWeight:700, color:THEME.brand, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>{cat} KPIs</div>
              {kpis.map((kpi, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", background:THEME.brandLight, borderRadius:10, border:`1px solid ${THEME.border}`, marginBottom:6 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:THEME.text, fontFamily:"'DM Sans',sans-serif" }}>{kpi.metric}</div>
                    {kpi.target && <div style={{ fontSize:11, color:THEME.textMuted }}>Target: {kpi.target}</div>}
                  </div>
                  <button type="button" className="ae-remove-btn" onClick={() => onChange(value.filter((k) => k !== kpi))}>×</button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr 1fr auto", gap:8, alignItems:"end" }}>
        <div>
          <FieldLabel>Category</FieldLabel>
          <select className="ae-input" value={form.category} onChange={(e) => setForm({ ...form, category:e.target.value })}>
            <option value="">Select</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <FieldLabel>KPI / Metric</FieldLabel>
          <input className="ae-input" placeholder="e.g. On-time task completion rate" value={form.metric} onChange={(e) => setForm({ ...form, metric:e.target.value })} />
        </div>
        <div>
          <FieldLabel>Target</FieldLabel>
          <input className="ae-input" placeholder="e.g. 90%" value={form.target} onChange={(e) => setForm({ ...form, target:e.target.value })} />
        </div>
        <button type="button" className="ae-add-btn" onClick={add}>+ Add</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  📈  Growth Index Builder
// ─────────────────────────────────────────────
function GrowthIndexBuilder({ value, onChange }) {
  const zones = [
    { range:"1–2", label:"New / highly dependent" },
    { range:"3–4", label:"Contributing but learning" },
    { range:"5–6", label:"Reliable; needs ownership support" },
    { range:"7–8", label:"Strong performer; trusted" },
    { range:"9–10", label:"Top-level; leads outcomes" },
  ];
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px,1fr))", gap:18, marginBottom:20 }}>
        <FormField label="Current Growth Zone (1–10)">
          <input className="ae-input" type="number" min="1" max="10" placeholder="e.g. 7"
            value={value.current_zone || ""} onChange={(e) => onChange({ ...value, current_zone:e.target.value })} />
        </FormField>
        <FormField label="Target Growth Zone (1–10)">
          <input className="ae-input" type="number" min="1" max="10" placeholder="e.g. 9"
            value={value.target_zone || ""} onChange={(e) => onChange({ ...value, target_zone:e.target.value })} />
        </FormField>
      </div>
      {value.current_zone && (
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:11, fontWeight:700, color:THEME.textMuted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>Current Level Visual</div>
          <div className="ae-growth-bar">
            <div className="ae-growth-fill" style={{ width:`${(Math.min(10, Math.max(1, Number(value.current_zone))) / 10) * 100}%` }} />
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:THEME.textMuted }}>
            <span>1</span><span>5</span><span>10</span>
          </div>
        </div>
      )}
      <div style={{ marginBottom:20 }}>
        <FieldLabel>What Top Level Looks Like for This Role</FieldLabel>
        <TagInput value={value.top_level_criteria || []} onChange={(v) => onChange({ ...value, top_level_criteria:v })}
          placeholder="e.g. Clear project control without founder follow-up…" />
        <p style={{ margin:"5px 0 0", fontSize:11, color:THEME.textMuted }}>{(value.top_level_criteria || []).length} criteria added</p>
      </div>
      <div style={{ background:THEME.brandLight, border:`1px solid ${THEME.border}`, borderRadius:12, padding:"14px 16px" }}>
        <div style={{ fontSize:11, fontWeight:700, color:THEME.brand, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>Scale Reference</div>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {zones.map((z) => (
            <div key={z.range} style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ background:THEME.brand, color:"#fff", fontSize:10, fontWeight:700, padding:"2px 9px", borderRadius:20, minWidth:36, textAlign:"center", fontFamily:"'DM Sans',sans-serif" }}>{z.range}</span>
              <span style={{ fontSize:12, color:THEME.text, fontFamily:"'DM Sans',sans-serif" }}>{z.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  ⚠️  Development Risks & Warning Ladder
// ─────────────────────────────────────────────
function RisksAndWarningBuilder({ value, onChange }) {
  const stages = [
    { key:"stage_1", label:"Stage 1", desc:"Coaching conversation with clear expectations", color:"#FFFBE6", border:"#FFE58F", badge:"#FAAD14" },
    { key:"stage_2", label:"Stage 2", desc:"Written development focus with measurable support goals", color:"#FFF7E6", border:"#FFD591", badge:"#FA8C16" },
    { key:"stage_3", label:"Stage 3", desc:"Role redesign, focused mentoring, or reassessment of responsibility load", color:"#FFF1F0", border:"#FFA39E", badge:"#FF4D4F" },
  ];
  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <FieldLabel>Risk Flags — This Role Needs Support If</FieldLabel>
        <TagInput value={value.risk_flags || []} onChange={(v) => onChange({ ...value, risk_flags:v })}
          placeholder="e.g. Projects move late without early escalation…" />
        <p style={{ margin:"5px 0 0", fontSize:11, color:THEME.textMuted }}>{(value.risk_flags || []).length} risk flag{(value.risk_flags || []).length !== 1 ? "s" : ""} added</p>
      </div>
      <FieldLabel>HR Review / Warning Ladder</FieldLabel>
      <div style={{ marginBottom:20 }}>
        {stages.map((s) => (
          <div key={s.key} className="ae-stage-item" style={{ background:s.color, borderColor:s.border }}>
            <span className="ae-stage-badge" style={{ background:s.badge, color:"#fff" }}>{s.label}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, fontWeight:600, color:THEME.text, fontFamily:"'DM Sans',sans-serif", marginBottom:4 }}>{s.desc}</div>
              <input className="ae-input" style={{ fontSize:12 }} placeholder="Add custom note for this stage…"
                value={value[s.key] || ""} onChange={(e) => onChange({ ...value, [s.key]:e.target.value })} />
            </div>
          </div>
        ))}
      </div>
      <div>
        <FieldLabel>What This Role Is NOT Responsible For</FieldLabel>
        <TagInput value={value.not_responsible || []} onChange={(v) => onChange({ ...value, not_responsible:v })}
          placeholder="e.g. Final financial decisions, HR policy authority…" />
        <p style={{ margin:"5px 0 0", fontSize:11, color:THEME.textMuted }}>{(value.not_responsible || []).length} item{(value.not_responsible || []).length !== 1 ? "s" : ""} added</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  🧠  Domain Knowledge Builder  ← NEW
// ─────────────────────────────────────────────
function DomainKnowledgeBuilder({ value = [], onChange }) {
  const [form, setForm] = useState({ topic: "", level: "Working" });
  const levels = ["Awareness", "Working", "Deep", "Expert"];
  const levelColors = {
    Awareness: { bg: "#F5F5F5", color: "#595959", border: "#D9D9D9" },
    Working:   { bg: "#E6F7FF", color: "#0958D9", border: "#91CAFF" },
    Deep:      { bg: "#F6FFED", color: "#389E0D", border: "#B7EB8F" },
    Expert:    { bg: "#FFF7E6", color: "#D46B08", border: "#FFD591" },
  };
  const add = () => {
    if (!form.topic.trim()) { toast.error("Topic is required"); return; }
    onChange([...value, { ...form }]);
    setForm({ topic: "", level: "Working" });
  };
  return (
    <div>
      {value.length > 0 && (
        <div style={{ marginBottom: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {value.map((d, i) => {
            const lc = levelColors[d.level] || levelColors.Working;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: THEME.brandLight, borderRadius: 10, border: `1px solid ${THEME.border}` }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: THEME.text, fontFamily: "'DM Sans',sans-serif" }}>{d.topic}</span>
                </div>
                <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: lc.bg, color: lc.color, border: `1px solid ${lc.border}`, fontFamily: "'DM Sans',sans-serif" }}>{d.level}</span>
                <button type="button" className="ae-remove-btn" onClick={() => onChange(value.filter((_, idx) => idx !== i))}>×</button>
              </div>
            );
          })}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8, alignItems: "end" }}>
        <div>
          <FieldLabel>Domain / Topic</FieldLabel>
          <input className="ae-input" placeholder="e.g. Space planning, BOQ preparation…" value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} />
        </div>
        <div>
          <FieldLabel>Proficiency Level</FieldLabel>
          <select className="ae-input" style={{ width: 130 }} value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
            {levels.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <button type="button" className="ae-add-btn" onClick={add}>+ Add</button>
      </div>
      <p style={{ margin: "6px 0 0", fontSize: 11, color: THEME.textMuted }}>Levels: Awareness → Working → Deep → Expert</p>
    </div>
  );
}

// ─────────────────────────────────────────────
//  💻  Software & Tools Builder  ← NEW
// ─────────────────────────────────────────────
function SoftwareToolsBuilder({ value = [], onChange }) {
  const [form, setForm] = useState({ tool: "", level: "Proficient", note: "" });
  const levels = ["Basic", "Proficient", "Intermediate", "Expert"];
  const levelColors = {
    Basic:        { bg: "#F5F5F5", color: "#595959", border: "#D9D9D9" },
    Proficient:   { bg: "#E6F7FF", color: "#0958D9", border: "#91CAFF" },
    Intermediate: { bg: "#FFF7E6", color: "#D46B08", border: "#FFD591" },
    Expert:       { bg: "#F6FFED", color: "#389E0D", border: "#B7EB8F" },
  };
  const add = () => {
    if (!form.tool.trim()) { toast.error("Tool name is required"); return; }
    onChange([...value, { ...form }]);
    setForm({ tool: "", level: "Proficient", note: "" });
  };
  return (
    <div>
      {value.length > 0 && (
        <div style={{ marginBottom: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {value.map((s, i) => {
            const lc = levelColors[s.level] || levelColors.Proficient;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: THEME.brandLight, borderRadius: 10, border: `1px solid ${THEME.border}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: THEME.text, fontFamily: "'DM Sans',sans-serif" }}>{s.tool}</div>
                  {s.note && <div style={{ fontSize: 11, color: THEME.textMuted }}>{s.note}</div>}
                </div>
                <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: lc.bg, color: lc.color, border: `1px solid ${lc.border}`, fontFamily: "'DM Sans',sans-serif", flexShrink: 0 }}>{s.level}</span>
                <button type="button" className="ae-remove-btn" onClick={() => onChange(value.filter((_, idx) => idx !== i))}>×</button>
              </div>
            );
          })}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 2fr auto", gap: 8, alignItems: "end" }}>
        <div>
          <FieldLabel>Tool / Software</FieldLabel>
          <input className="ae-input" placeholder="e.g. AutoCAD, SketchUp…" value={form.tool}
            onChange={(e) => setForm({ ...form, tool: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} />
        </div>
        <div>
          <FieldLabel>Level</FieldLabel>
          <select className="ae-input" style={{ width: 130 }} value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
            {levels.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <FieldLabel>Note (optional)</FieldLabel>
          <input className="ae-input" placeholder="e.g. primary tool, tested at interview" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        </div>
        <button type="button" className="ae-add-btn" onClick={add}>+ Add</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  🎭  Behavioural Competencies Builder  ← NEW
// ─────────────────────────────────────────────
function BehaviouralCompetenciesBuilder({ value = [], onChange }) {
  const [form, setForm] = useState({ competency: "", description: "" });
  const add = () => {
    if (!form.competency.trim()) { toast.error("Competency name is required"); return; }
    onChange([...value, { ...form }]);
    setForm({ competency: "", description: "" });
  };
  return (
    <div>
      {value.length > 0 && (
        <div style={{ marginBottom: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {value.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", background: THEME.brandLight, borderRadius: 10, border: `1px solid ${THEME.border}` }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: THEME.brand, fontFamily: "'DM Sans',sans-serif" }}>{c.competency}</div>
                {c.description && <div style={{ fontSize: 12, color: THEME.text, marginTop: 2 }}>{c.description}</div>}
              </div>
              <button type="button" className="ae-remove-btn" onClick={() => onChange(value.filter((_, idx) => idx !== i))}>×</button>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto", gap: 8, alignItems: "end" }}>
        <div>
          <FieldLabel>Competency Name</FieldLabel>
          <input className="ae-input" placeholder="e.g. Design integrity" value={form.competency}
            onChange={(e) => setForm({ ...form, competency: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} />
        </div>
        <div>
          <FieldLabel>Description / Behaviour</FieldLabel>
          <input className="ae-input" placeholder="e.g. maintains quality under schedule and budget pressure" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <button type="button" className="ae-add-btn" onClick={add}>+ Add</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  📋  KRA & Monthly Targets Builder  ← NEW
// ─────────────────────────────────────────────
function KraBuilder({ value = [], onChange }) {
  const [form, setForm] = useState({ kra: "", target: "" });
  const add = () => {
    if (!form.kra.trim()) { toast.error("KRA is required"); return; }
    onChange([...value, { ...form }]);
    setForm({ kra: "", target: "" });
  };
  return (
    <div>
      {value.length > 0 && (
        <div style={{ marginBottom: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {value.map((k, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: THEME.brandLight, borderRadius: 10, border: `1px solid ${THEME.border}` }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: THEME.text, fontFamily: "'DM Sans',sans-serif" }}>{k.kra}</div>
                {k.target && <div style={{ fontSize: 11, color: THEME.brand, fontWeight: 700 }}>Target: {k.target}</div>}
              </div>
              <button type="button" className="ae-remove-btn" onClick={() => onChange(value.filter((_, idx) => idx !== i))}>×</button>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto", gap: 8, alignItems: "end" }}>
        <div>
          <FieldLabel>Key Result Area</FieldLabel>
          <input className="ae-input" placeholder="e.g. Assigned projects delivered on schedule" value={form.kra}
            onChange={(e) => setForm({ ...form, kra: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} />
        </div>
        <div>
          <FieldLabel>Monthly Target</FieldLabel>
          <input className="ae-input" placeholder="e.g. 90%+" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} />
        </div>
        <button type="button" className="ae-add-btn" onClick={add}>+ Add</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  🖥️  System / Software Module Duties Builder  ← NEW
// ─────────────────────────────────────────────
function SystemDutiesBuilder({ value = [], onChange }) {
  const [form, setForm] = useState({ module: "", duty: "", frequency: "Daily" });
  const frequencies = ["Daily", "Weekly", "Every 15 days", "Monthly", "Per task"];
  const freqColors = {
    "Daily":          { bg: "#F6FFED", color: "#389E0D", border: "#B7EB8F" },
    "Weekly":         { bg: "#E6F7FF", color: "#0958D9", border: "#91CAFF" },
    "Every 15 days":  { bg: "#FFF7E6", color: "#D46B08", border: "#FFD591" },
    "Monthly":        { bg: "#F9F0FF", color: "#722ED1", border: "#D3ADF7" },
    "Per task":       { bg: "#F5F5F5", color: "#595959", border: "#D9D9D9" },
  };
  const add = () => {
    if (!form.module.trim() || !form.duty.trim()) { toast.error("Module and duty are required"); return; }
    onChange([...value, { ...form }]);
    setForm({ module: "", duty: "", frequency: "Daily" });
  };
  return (
    <div>
      {value.length > 0 && (
        <div style={{ marginBottom: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {value.map((s, i) => {
            const fc = freqColors[s.frequency] || freqColors["Per task"];
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: THEME.brandLight, borderRadius: 10, border: `1px solid ${THEME.border}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: THEME.text, fontFamily: "'DM Sans',sans-serif" }}>{s.module}</div>
                  <div style={{ fontSize: 12, color: THEME.textMuted }}>{s.duty}</div>
                </div>
                <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: fc.bg, color: fc.color, border: `1px solid ${fc.border}`, flexShrink: 0 }}>{s.frequency}</span>
                <button type="button" className="ae-remove-btn" onClick={() => onChange(value.filter((_, idx) => idx !== i))}>×</button>
              </div>
            );
          })}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto auto", gap: 8, alignItems: "end" }}>
        <div>
          <FieldLabel>Module / System</FieldLabel>
          <input className="ae-input" placeholder="e.g. Interior Process" value={form.module} onChange={(e) => setForm({ ...form, module: e.target.value })} />
        </div>
        <div>
          <FieldLabel>Duty / Action</FieldLabel>
          <input className="ae-input" placeholder="e.g. Update all steps for assigned projects" value={form.duty} onChange={(e) => setForm({ ...form, duty: e.target.value })} />
        </div>
        <div>
          <FieldLabel>Frequency</FieldLabel>
          <select className="ae-input" style={{ width: 140 }} value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
            {frequencies.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <button type="button" className="ae-add-btn" onClick={add}>+ Add</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  📝  Hiring Requirements Builder  ← NEW
// ─────────────────────────────────────────────
function HiringRequirementsBuilder({ value, onChange }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: 20 }}>
      <div style={{ gridColumn: "1 / -1" }}>
        <FieldLabel>Minimum Requirements</FieldLabel>
        <TagInput
          value={value.min_requirements || []}
          onChange={(v) => onChange({ ...value, min_requirements: v })}
          placeholder="e.g. Diploma or Degree in Interior Design — mandatory…"
        />
        <p style={{ margin: "5px 0 0", fontSize: 11, color: THEME.textMuted }}>{(value.min_requirements || []).length} requirement{(value.min_requirements || []).length !== 1 ? "s" : ""} added</p>
      </div>
      <div>
        <FieldLabel>Interview Test — Mandatory</FieldLabel>
        <textarea
          className="ae-textarea"
          placeholder="Describe the interview test task and conditions…"
          value={value.interview_test || ""}
          onChange={(e) => onChange({ ...value, interview_test: e.target.value })}
        />
      </div>
      <div>
        <FieldLabel>First 45 Days Onboarding Plan</FieldLabel>
        <textarea
          className="ae-textarea"
          placeholder="What happens in the first 45 days — supervision, KPI activation date…"
          value={value.first_45_days || ""}
          onChange={(e) => onChange({ ...value, first_45_days: e.target.value })}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  🚦  Green / Red Flags Builder  ← NEW
// ─────────────────────────────────────────────
function HiringFlagsBuilder({ value, onChange }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <div style={{ background: "#F6FFED", border: "1.5px solid #B7EB8F", borderRadius: 12, padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ background: "#52C41A", color: "#fff", fontSize: 11, fontWeight: 800, padding: "3px 12px", borderRadius: 20, fontFamily: "'DM Sans',sans-serif" }}>✓ GREEN FLAGS — HIRE</span>
        </div>
        <TagInput
          value={value.green_flags || []}
          onChange={(v) => onChange({ ...value, green_flags: v })}
          placeholder="e.g. Portfolio shows multiple project types at multiple stages…"
        />
        <p style={{ margin: "5px 0 0", fontSize: 11, color: "#389E0D", fontWeight: 600 }}>{(value.green_flags || []).length} flag{(value.green_flags || []).length !== 1 ? "s" : ""} added</p>
      </div>
      <div style={{ background: "#FFF1F0", border: "1.5px solid #FFA39E", borderRadius: 12, padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ background: "#CF1322", color: "#fff", fontSize: 11, fontWeight: 800, padding: "3px 12px", borderRadius: 20, fontFamily: "'DM Sans',sans-serif" }}>✗ RED FLAGS — DO NOT HIRE</span>
        </div>
        <TagInput
          value={value.red_flags || []}
          onChange={(v) => onChange({ ...value, red_flags: v })}
          placeholder="e.g. Portfolio shows only renders — no execution drawings or BOQs…"
        />
        <p style={{ margin: "5px 0 0", fontSize: 11, color: "#CF1322", fontWeight: 600 }}>{(value.red_flags || []).length} flag{(value.red_flags || []).length !== 1 ? "s" : ""} added</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  🏆  Gates Builder  ← NEW
// ─────────────────────────────────────────────
function GatesBuilder({ value, onChange }) {
  const gateTypes = [
    { key: "competency_gates", label: "Competency Gates", color: "#E6F7FF", border: "#91CAFF", badge: "#1677FF", placeholder: "e.g. Has independently delivered 5+ interior projects end-to-end…" },
    { key: "performance_gates", label: "Performance Gates", color: "#F6FFED", border: "#B7EB8F", badge: "#52C41A", placeholder: "e.g. Assigned projects on schedule 90%+ for 3 consecutive cycles…" },
    { key: "behavioural_gates", label: "Behavioural Gates", color: "#FFF7E6", border: "#FFD591", badge: "#FA8C16", placeholder: "e.g. Weekly G2 mentoring: 0 missed sessions for 3 consecutive months…" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {gateTypes.map(({ key, label, color, border, badge, placeholder }) => (
        <div key={key} style={{ background: color, border: `1.5px solid ${border}`, borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ background: badge, color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 20, fontFamily: "'DM Sans',sans-serif" }}>{label}</span>
          </div>
          <TagInput value={value[key] || []} onChange={(v) => onChange({ ...value, [key]: v })} placeholder={placeholder} />
          <p style={{ margin: "5px 0 0", fontSize: 11, color: THEME.textMuted }}>{(value[key] || []).length} gate{(value[key] || []).length !== 1 ? "s" : ""} added</p>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
//  🚀  Career Growth Path Builder  ← NEW
// ─────────────────────────────────────────────
function CareerGrowthBuilder({ value = [], onChange }) {
  const [form, setForm] = useState({ grade: "", title: "", condition: "" });
  const add = () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    onChange([...value, { ...form }]);
    setForm({ grade: "", title: "", condition: "" });
  };
  return (
    <div>
      {value.length > 0 && (
        <div style={{ marginBottom: 12, position: "relative" }}>
          <div style={{ position: "absolute", left: 20, top: 12, bottom: 12, width: 2, background: `linear-gradient(180deg, ${THEME.brand}, ${THEME.brandMid})`, borderRadius: 2 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {value.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, paddingLeft: 44, position: "relative" }}>
                <div style={{ position: "absolute", left: 12, top: 10, width: 16, height: 16, borderRadius: "50%", background: THEME.brand, border: "2px solid #fff", boxShadow: `0 0 0 2px ${THEME.brandMid}` }} />
                <div style={{ flex: 1, padding: "8px 12px", background: THEME.brandLight, borderRadius: 10, border: `1px solid ${THEME.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {c.grade && <span style={{ background: THEME.brand, color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 8px", borderRadius: 20, fontFamily: "'DM Sans',sans-serif" }}>{c.grade}</span>}
                    <span style={{ fontSize: 13, fontWeight: 700, color: THEME.text, fontFamily: "'DM Sans',sans-serif" }}>{c.title}</span>
                  </div>
                  {c.condition && <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 3 }}>{c.condition}</div>}
                </div>
                <button type="button" className="ae-remove-btn" style={{ marginTop: 6 }} onClick={() => onChange(value.filter((_, idx) => idx !== i))}>×</button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 2fr auto", gap: 8, alignItems: "end" }}>
        <div>
          <FieldLabel>Grade</FieldLabel>
          <input className="ae-input" style={{ width: 80 }} placeholder="e.g. G5" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} />
        </div>
        <div>
          <FieldLabel>Title</FieldLabel>
          <input className="ae-input" placeholder="e.g. Interior Design Facilitator" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <FieldLabel>Condition / Timeline</FieldLabel>
          <input className="ae-input" placeholder="e.g. 7–12 years or ZED Fast Track" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} />
        </div>
        <button type="button" className="ae-add-btn" onClick={add}>+ Add</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  🛑  STOP Meeting Duties Builder  ← NEW
// ─────────────────────────────────────────────
function StopMeetingDutiesBuilder({ value = [], onChange }) {
  const [form, setForm] = useState({ meeting_type: "Operational (Daily)", duty: "" });
  const meetingTypes = ["Operational (Daily)", "Tactical (Every 15 days)", "Strategic (Monthly)", "Other"];
  const typeColors = {
    "Operational (Daily)":      { bg: "#F6FFED", color: "#389E0D", border: "#B7EB8F" },
    "Tactical (Every 15 days)": { bg: "#E6F7FF", color: "#0958D9", border: "#91CAFF" },
    "Strategic (Monthly)":      { bg: "#FFF7E6", color: "#D46B08", border: "#FFD591" },
    "Other":                    { bg: "#F5F5F5", color: "#595959", border: "#D9D9D9" },
  };
  const add = () => {
    if (!form.duty.trim()) { toast.error("Duty description is required"); return; }
    onChange([...value, { ...form }]);
    setForm({ meeting_type: "Operational (Daily)", duty: "" });
  };
  const grouped = value.reduce((acc, item) => {
    const t = item.meeting_type || "Other";
    if (!acc[t]) acc[t] = [];
    acc[t].push(item);
    return acc;
  }, {});
  return (
    <div>
      {value.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          {Object.entries(grouped).map(([type, items]) => {
            const tc = typeColors[type] || typeColors["Other"];
            return (
              <div key={type} style={{ marginBottom: 12 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 12px", borderRadius: 20, background: tc.bg, border: `1px solid ${tc.border}`, marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: tc.color, fontFamily: "'DM Sans',sans-serif" }}>{type}</span>
                </div>
                {items.map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: THEME.brandLight, borderRadius: 10, border: `1px solid ${THEME.border}`, marginBottom: 6 }}>
                    <div style={{ flex: 1, fontSize: 13, color: THEME.text, fontFamily: "'DM Sans',sans-serif" }}>{item.duty}</div>
                    <button type="button" className="ae-remove-btn" onClick={() => onChange(value.filter((x) => x !== item))}>×</button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 8, alignItems: "end" }}>
        <div>
          <FieldLabel>Meeting Type</FieldLabel>
          <select className="ae-input" style={{ width: 210 }} value={form.meeting_type} onChange={(e) => setForm({ ...form, meeting_type: e.target.value })}>
            {meetingTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <FieldLabel>Duty / Action Required</FieldLabel>
          <input className="ae-input" placeholder="e.g. Fill own STOP data; all assigned project steps updated same day"
            value={form.duty} onChange={(e) => setForm({ ...form, duty: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} />
        </div>
        <button type="button" className="ae-add-btn" onClick={add}>+ Add</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const AddEmployee = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [department, setDepartment] = useState([]);
  const [roles, setRoles] = useState([]);
  const [post, setPost] = useState([]);

  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isPreviewed, setIsPreviewed] = useState(false);
  const [previewSrc, setPreviewSrc] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");

  // ── Original HR state ─────────────────────
  const [responsibilities, setResponsibilities] = useState([]);
  const [skills, setSkills] = useState([]);
  const [workHistory, setWorkHistory] = useState([]);
  const [education, setEducation] = useState([]);
  const [emergency, setEmergency] = useState([]);
  const [strengths, setStrengths] = useState([]);
  const [weaknesses, setWeaknesses] = useState([]);
  const [authority, setAuthority] = useState({ can_decide:[], must_escalate:[], cannot_decide:[] });
  const [deliverables, setDeliverables] = useState({ daily:[], weekly:[], monthly:[] });
  const [kpis, setKpis] = useState([]);
  const [growthIndex, setGrowthIndex] = useState({ current_zone:"", target_zone:"", top_level_criteria:[] });
  const [risksWarning, setRisksWarning] = useState({ risk_flags:[], stage_1:"", stage_2:"", stage_3:"", not_responsible:[] });

  // ── New HR state ──────────────────────────
  const [domainKnowledge, setDomainKnowledge] = useState([]);
  const [softwareTools, setSoftwareTools] = useState([]);
  const [behaviouralCompetencies, setBehaviouralCompetencies] = useState([]);
  const [kras, setKras] = useState([]);
  const [systemDuties, setSystemDuties] = useState([]);
  const [hiringRequirements, setHiringRequirements] = useState({ min_requirements: [], interview_test: "", first_45_days: "" });
  const [hiringFlags, setHiringFlags] = useState({ green_flags: [], red_flags: [] });
  const [gates, setGates] = useState({ competency_gates: [], performance_gates: [], behavioural_gates: [] });
  const [careerGrowth, setCareerGrowth] = useState([]);
  const [stopMeetingDuties, setStopMeetingDuties] = useState([]);

  const { register, formState:{ errors }, getValues, setValue, setError, clearErrors, handleSubmit } = useForm({ mode:"onChange" });

  useEffect(() => {
    const h = { Authorization:`Bearer ${getToken()}`, "Content-Type":"application/json" };
    const load = async (config, setter) => {
      try {
        const res = await ApiService(null, 0, h, config.method, config.url);
        if (!res.data.error) setter(res.data?.data || []);
      } catch (err) { toast.error(err.response?.data?.message); }
    };
    load(getDepartments, setDepartment);
    load(getRoles, setRoles);
    load(getPosts, setPost);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) { setSelectedFile(null); setIsPreviewed(false); setPreviewSrc(""); return; }
    if (checkFile(file.name)) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => { setPreviewSrc(ev.target.result); setIsPreviewed(true); };
      reader.readAsDataURL(file);
    } else {
      toast.error("Invalid file type. Use PNG, JPG or GIF.");
      setSelectedFile(null); setIsPreviewed(false); setPreviewSrc("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  const clearProfilePic = () => {
    setSelectedFile(null); setIsPreviewed(false); setPreviewSrc("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const handleResumeChange = (e) => setResumeName(e.target.files?.[0]?.name || "");

  const onSubmit = async (data) => {
    const formData = new FormData();
    for (let key of Object.keys(data)) {
      if (key === "file") continue;
      else if (key === "resume") { if (data.resume?.[0]) formData.append("resume", data.resume[0]); }
      else if (key === "departments") formData.append(key, JSON.stringify(data[key]));
      else formData.append(key, data[key]);
    }
    if (profilePicture) formData.append("profile_picture", profilePicture);
    else if (selectedFile) formData.append("profile_picture", selectedFile);

    if (resumeUrl) formData.append("resume", resumeUrl);

    // Original fields
    formData.append("responsibilities", JSON.stringify(responsibilities));
    formData.append("skills", JSON.stringify(skills));
    formData.append("work_history", JSON.stringify(workHistory));
    formData.append("education", JSON.stringify(education));
    formData.append("strengths", JSON.stringify(strengths));
    formData.append("weaknesses", JSON.stringify(weaknesses));
    formData.append("emergency_contacts", JSON.stringify(emergency));
    formData.append("authority_rights", JSON.stringify(authority));
    formData.append("deliverables", JSON.stringify(deliverables));
    formData.append("kpis", JSON.stringify(kpis));
    formData.append("growth_index", JSON.stringify(growthIndex));
    formData.append("risks_and_warning", JSON.stringify(risksWarning));

    // New fields
    formData.append("domain_knowledge", JSON.stringify(domainKnowledge));
    formData.append("software_tools", JSON.stringify(softwareTools));
    formData.append("behavioural_competencies", JSON.stringify(behaviouralCompetencies));
    formData.append("kras", JSON.stringify(kras));
    formData.append("system_duties", JSON.stringify(systemDuties));
    formData.append("hiring_requirements", JSON.stringify(hiringRequirements));
    formData.append("hiring_flags", JSON.stringify(hiringFlags));
    formData.append("gates", JSON.stringify(gates));
    formData.append("career_growth", JSON.stringify(careerGrowth));
    formData.append("stop_meeting_duties", JSON.stringify(stopMeetingDuties));

    setLoading(true);
    try {
      const h = { Authorization:`Bearer ${getToken()}`, "Content-Type":"multipart/form-data" };
      const res = await ApiService(formData, 0, h, insertEmployee.method, insertEmployee.url);
      if (!res.data.error) { toast.success(res.data.message); navigate(`/${EmpRoute.list}`); }
      else toast.error(res.data.message);
    } catch (err) {
      toast.error(err?.response?.data?.message);
      navigate(`/${EmpRoute.list}`);
    } finally { setLoading(false); }
  };

  const onSelect = (list) => { if (list.length > 0) clearErrors("departments"); setValue("departments", list.map((v) => v.id)); };
  const onRemove = (list) => { if (!list.length) setError("departments", { type:"custom", message:"Required" }); else clearErrors("departments"); setValue("departments", list.map((v) => v.id)); };
  const onSelectRole = (list) => { if (list.length > 0) clearErrors("roles"); setValue("roles", list.map((v) => v.id)); };
  const onRemoveRole = (list) => { if (!list.length) setError("roles", { type:"custom", message:"Required" }); else clearErrors("roles"); setValue("roles", list.map((v) => v.id)); };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ minHeight:"100vh", background:THEME.bg, fontFamily:"'DM Sans',sans-serif", padding:"28px 24px" }}>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:14, marginBottom:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:4, height:26, borderRadius:3, background:`linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
            <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:THEME.text, fontFamily:"'Sora',sans-serif", letterSpacing:"-0.3px" }}>Add Team Member</h1>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:11, fontWeight:700, color:THEME.textMuted, textTransform:"uppercase", letterSpacing:"0.07em" }}>Status</span>
            <div style={{ display:"flex", gap:6 }}>
              {[{ v:"1", label:"● Active" }, { v:"0", label:"● Inactive" }].map(({ v, label }) => (
                <React.Fragment key={v}>
                  <input type="radio" id={`ae-st-${v}`} value={v} className="ae-status-toggle" {...register("active")} defaultChecked={v === "1"} />
                  <label htmlFor={`ae-st-${v}`} className="ae-status-label">{label}</label>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"80px 0", gap:16 }}>
            <div style={{ width:28, height:28, borderRadius:"50%", border:`3px solid ${THEME.brandLight}`, borderTopColor:THEME.brand, animation:"aeSpin 0.8s linear infinite" }} />
            <p style={{ color:THEME.textLight, fontSize:13, margin:0 }}>Saving…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="ae-fade">

              {/* ══════ 1. Personal Info ══════ */}
              <CardSection title="Personal Information" icon="👤">
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:18 }}>
                  <FormField label="First Name" required error={errors?.first_name?.message}>
                    <input className={`ae-input${errors?.first_name?" error":""}`} type="text" placeholder="First name"
                      {...register("first_name", { required:"Required", pattern:{ value:alphabetSpaceWithDot, message:"Letters only" } })} />
                  </FormField>
                  <FormField label="Last Name" required error={errors?.last_name?.message}>
                    <input className={`ae-input${errors?.last_name?" error":""}`} type="text" placeholder="Last name"
                      {...register("last_name", { required:"Required", pattern:{ value:alphabetSpaceWithDot, message:"Letters only" } })} />
                  </FormField>
                  <FormField label="Personal Email" required error={errors?.email?.message}>
                    <input className={`ae-input${errors?.email?" error":""}`} type="text" placeholder="email@example.com"
                      {...register("email", { required:"Required", pattern:{ value:mailPattern, message:"Invalid email" } })} />
                  </FormField>
                  <FormField label="Mobile Number" required error={errors?.phone?.message}>
                    <input className={`ae-input${errors?.phone?" error":""}`} type="text" placeholder="10-digit mobile number"
                      {...register("phone", { required:"Required", pattern:{ value:phonePattern, message:"10 digits required" } })} />
                  </FormField>
                  <FormField label="Date of Birth" error={errors?.dob?.message}>
                    <input className={`ae-input${errors?.dob?" error":""}`} type="date" {...register("dob")} />
                  </FormField>
                </div>
              </CardSection>

              {/* ══════ 2. Account Security ══════ */}
              <CardSection title="Account Security" icon="🔒">
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:18 }}>
                  <FormField label="Password" required error={errors?.password?.message}>
                    <input className={`ae-input${errors?.password?" error":""}`} type="password" placeholder="Set a password"
                      {...register("password", { required:"Required" })} />
                  </FormField>
                  <FormField label="Confirm Password" required error={errors?.confirm_password?.message}>
                    <input className={`ae-input${errors?.confirm_password?" error":""}`} type="password" placeholder="Re-enter password"
                      {...register("confirm_password", { required:"Required", validate:(val) => val === getValues("password") || "Passwords don't match" })} />
                  </FormField>
                </div>
              </CardSection>

              {/* ══════ 3. Role & Department ══════ */}
              <CardSection title="Role & Department" icon="🏢">
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:18 }}>
                  <FormField label="Department" required error={errors?.departments?.message}>
                    <div className={`ae-multiselect${errors?.departments?" error":""}`}>
                      <Multiselect options={department} displayValue="name" onSelect={onSelect} onRemove={onRemove} placeholder="Select departments" {...register("departments", { required:"Required" })} />
                    </div>
                  </FormField>
                  <FormField label="Roles" required error={errors?.roles?.message}>
                    <div className={`ae-multiselect${errors?.roles?" error":""}`}>
                      <Multiselect options={roles} displayValue="name" onSelect={onSelectRole} onRemove={onRemoveRole} placeholder="Select roles" {...register("roles", { required:"Required" })} />
                    </div>
                  </FormField>
                </div>
              </CardSection>

              {/* ══════ 4. HR Profile — Job Details ══════ */}
              <CardSection title="HR Profile — Job Details" icon="💼">
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:18 }}>
                  <FormField label="Job Title" required error={errors?.job_title?.message}>
                    <input className={`ae-input${errors?.job_title?" error":""}`} type="text" placeholder="e.g. Senior Site Engineer"
                      {...register("job_title", { required:"Required" })} />
                  </FormField>
                  <FormField label="Employee ID" error={errors?.employee_id?.message}>
                    <input className="ae-input" type="text" placeholder="e.g. EMP-00142" {...register("employee_id")} />
                  </FormField>
                  <FormField label="Sub-Department">
                    <input className="ae-input" type="text" placeholder="e.g. Architecture Team" {...register("sub_department")} />
                  </FormField>
                  <FormField label="Employment Type" required error={errors?.employment_type?.message}>
                    <select className={`ae-input${errors?.employment_type?" error":""}`} {...register("employment_type", { required:"Required" })}>
                      <option value="">Select type</option>
                      <option value="Full-Time">Full-Time</option>
                      <option value="Part-Time">Part-Time</option>
                      <option value="Contract">Contract</option>
                      <option value="Intern">Intern</option>
                      <option value="Freelance">Freelance</option>
                    </select>
                  </FormField>
                  <FormField label="Work Location">
                    <select className="ae-input" {...register("work_location")}>
                      <option value="">Select location</option>
                      <option value="On-Site">On-Site</option>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </FormField>
                  <FormField label="Reporting To">
                    <input className="ae-input" type="text" placeholder="e.g. Priya Mehta (VP Engineering)" {...register("reporting_to")} />
                  </FormField>
                  <FormField label="Directly Coordinates With">
                    <input className="ae-input" type="text" placeholder="e.g. Hely, Denish, PMC, consultants…" {...register("coordinates_with")} />
                  </FormField>
                  <FormField label="Date of Joining" required error={errors?.date_of_joining?.message}>
                    <input className={`ae-input${errors?.date_of_joining?" error":""}`} type="date"
                      {...register("date_of_joining", { required:"Required" })} />
                  </FormField>
                  <FormField label="Probation End Date">
                    <input className="ae-input" type="date" {...register("probation_end_date")} />
                  </FormField>
                  <div style={{ gridColumn:"1 / -1" }}>
                    <FieldLabel>Job Overview</FieldLabel>
                    <textarea className="ae-textarea" placeholder="Brief description of this employee's role and purpose within the team…" {...register("job_overview")} />
                  </div>
                  <div style={{ gridColumn:"1 / -1" }}>
                    <FieldLabel>Role Purpose</FieldLabel>
                    <textarea className="ae-textarea" placeholder="Why does this role exist? What does it convert, enable, or protect for the organisation…" {...register("role_purpose")} />
                  </div>
                </div>
              </CardSection>

              {/* ══════ 5. Key Responsibilities ══════ */}
              <CardSection title="Key Responsibilities" icon="🎯">
                <FieldLabel>Add responsibilities (press Enter or comma to add each, or paste a list)</FieldLabel>
                <TagInput value={responsibilities} onChange={setResponsibilities} placeholder="e.g. Draft floor plans, Inspect structural work…" />
                <p style={{ margin:"6px 0 0", fontSize:11, color:THEME.textMuted }}>{responsibilities.length} responsibilit{responsibilities.length === 1 ? "y" : "ies"} added</p>
              </CardSection>

              {/* ══════ 6. Authority & Decision Rights ══════ */}
              {/* <CardSection title="Authority & Decision Rights" icon="🔐">
                <p style={{ margin:"0 0 16px", fontSize:12, color:THEME.textMuted, lineHeight:1.6 }}>
                  Define what this role can decide independently, what must be escalated, and what is outside its authority.
                </p>
                <AuthorityBuilder value={authority} onChange={setAuthority} />
              </CardSection> */}

              {/* ══════ 7. Deliverables ══════ */}
              {/* <CardSection title="Deliverables" icon="📅">
                <p style={{ margin:"0 0 16px", fontSize:12, color:THEME.textMuted, lineHeight:1.6 }}>
                  Define the expected outputs for this role across daily, weekly, and monthly cadences.
                </p>
                <DeliverablesBuilder value={deliverables} onChange={setDeliverables} />
              </CardSection> */}

              {/* ══════ 8. KPIs & Performance Metrics ══════ */}
              {/* <CardSection title="KPIs & Performance Metrics" icon="📊">
                <p style={{ margin:"0 0 16px", fontSize:12, color:THEME.textMuted, lineHeight:1.6 }}>
                  Add measurable KPIs across Delivery, Team, Approval, System, or other categories.
                </p>
                <KpiBuilder value={kpis} onChange={setKpis} />
              </CardSection> */}

              {/* ══════ 9. KRAs & Monthly Targets ══════ */}
              {/* <CardSection title="KRAs & Monthly Targets" icon="📋">
                <p style={{ margin:"0 0 16px", fontSize:12, color:THEME.textMuted, lineHeight:1.6 }}>
                  Define Key Result Areas with their monthly performance targets.
                </p>
                <KraBuilder value={kras} onChange={setKras} />
              </CardSection> */}

              {/* ══════ 10. Strengths & Weaknesses ══════ */}
              <CardSection title="Strengths & Areas to Improve" icon="💪">
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
                  <div>
                    <FieldLabel>Strengths</FieldLabel>
                    <TagInput value={strengths} onChange={setStrengths} placeholder="e.g. Problem solving, Leadership…" />
                    <p style={{ margin:"5px 0 0", fontSize:11, color:THEME.textMuted }}>{strengths.length} strength{strengths.length !== 1 ? "s" : ""} added</p>
                  </div>
                  <div>
                    <FieldLabel>Areas to Improve (Weaknesses)</FieldLabel>
                    <TagInput value={weaknesses} onChange={setWeaknesses} placeholder="e.g. Overthinking, Public speaking…" />
                    <p style={{ margin:"5px 0 0", fontSize:11, color:THEME.textMuted }}>{weaknesses.length} area{weaknesses.length !== 1 ? "s" : ""} added</p>
                  </div>
                </div>
              </CardSection>

              {/* ══════ 11. Skills & Proficiency ══════ */}
              <CardSection title="Skills & Proficiency" icon="⚡">
                <SkillBuilder value={skills} onChange={setSkills} />
              </CardSection>

              {/* ══════ 12. Domain Knowledge ══════ */}
              <CardSection title="Domain Knowledge" icon="🧠">
                <p style={{ margin:"0 0 16px", fontSize:12, color:THEME.textMuted, lineHeight:1.6 }}>
                  Define knowledge areas and proficiency depth required for this role.
                </p>
                <DomainKnowledgeBuilder value={domainKnowledge} onChange={setDomainKnowledge} />
              </CardSection>

              {/* ══════ 13. Software & Tools ══════ */}
              {/* <CardSection title="Software & Tools" icon="💻">
                <p style={{ margin:"0 0 16px", fontSize:12, color:THEME.textMuted, lineHeight:1.6 }}>
                  List required software proficiencies with skill levels for this role.
                </p>
                <SoftwareToolsBuilder value={softwareTools} onChange={setSoftwareTools} />
              </CardSection> */}

              {/* ══════ 14. Behavioural Competencies ══════ */}
              {/* <CardSection title="Behavioural Competencies" icon="🎭">
                <p style={{ margin:"0 0 16px", fontSize:12, color:THEME.textMuted, lineHeight:1.6 }}>
                  Define the behavioural traits and mindset expected of this role.
                </p>
                <BehaviouralCompetenciesBuilder value={behaviouralCompetencies} onChange={setBehaviouralCompetencies} />
              </CardSection> */}

              {/* ══════ 15. System & Software Module Duties ══════ */}
              {/* <CardSection title="System & Software Module Duties" icon="🖥️">
                <p style={{ margin:"0 0 16px", fontSize:12, color:THEME.textMuted, lineHeight:1.6 }}>
                  Define which software modules this role must maintain and at what frequency.
                </p>
                <SystemDutiesBuilder value={systemDuties} onChange={setSystemDuties} />
              </CardSection> */}

              {/* ══════ 16. Performance Growth Index ══════ */}
              {/* <CardSection title="Performance Growth Index" icon="📈">
                <p style={{ margin:"0 0 16px", fontSize:12, color:THEME.textMuted, lineHeight:1.6 }}>
                  Rate where this team member currently stands and what the next level target is.
                </p>
                <GrowthIndexBuilder value={growthIndex} onChange={setGrowthIndex} />
              </CardSection> */}

              {/* ══════ 17. Development Risks & Warning Ladder ══════ */}
              {/* <CardSection title="Development Risks & Warning Ladder" icon="⚠️">
                <p style={{ margin:"0 0 16px", fontSize:12, color:THEME.textMuted, lineHeight:1.6 }}>
                  Document early warning signals, the HR review ladder, and what this role is not responsible for.
                </p>
                <RisksAndWarningBuilder value={risksWarning} onChange={setRisksWarning} />
              </CardSection> */}

              {/* ══════ 18. Hiring — Requirements & Onboarding ══════ */}
              {/* <CardSection title="Hiring — Requirements & Onboarding" icon="📝">
                <p style={{ margin:"0 0 16px", fontSize:12, color:THEME.textMuted, lineHeight:1.6 }}>
                  Minimum hiring requirements, mandatory interview test, and the first 45 days onboarding plan.
                </p>
                <HiringRequirementsBuilder value={hiringRequirements} onChange={setHiringRequirements} />
              </CardSection> */}

              {/* ══════ 19. Hiring Flags ══════ */}
              {/* <CardSection title="Hiring Flags — Hire / Do Not Hire" icon="🚦">
                <p style={{ margin:"0 0 16px", fontSize:12, color:THEME.textMuted, lineHeight:1.6 }}>
                  Observable signals during the interview that indicate a strong or poor candidate fit.
                </p>
                <HiringFlagsBuilder value={hiringFlags} onChange={setHiringFlags} />
              </CardSection> */}

              {/* ══════ 20. Competency, Performance & Behavioural Gates ══════ */}
              {/* <CardSection title="Competency, Performance & Behavioural Gates" icon="🏆">
                <p style={{ margin:"0 0 16px", fontSize:12, color:THEME.textMuted, lineHeight:1.6 }}>
                  Define the gates that must be cleared for role confirmation or grade promotion.
                </p>
                <GatesBuilder value={gates} onChange={setGates} />
              </CardSection> */}

              {/* ══════ 21. Career Growth Path ══════ */}
              {/* <CardSection title="Career Growth Path" icon="🚀">
                <p style={{ margin:"0 0 16px", fontSize:12, color:THEME.textMuted, lineHeight:1.6 }}>
                  Map out the progression path from this role upward, with grade labels and conditions.
                </p>
                <CareerGrowthBuilder value={careerGrowth} onChange={setCareerGrowth} />
              </CardSection> */}

              {/* ══════ 22. STOP Meeting Duties ══════ */}
              {/* <CardSection title="STOP Meeting Duties" icon="🛑">
                <p style={{ margin:"0 0 16px", fontSize:12, color:THEME.textMuted, lineHeight:1.6 }}>
                  Define what this role must prepare and update for each STOP meeting cadence.
                </p>
                <StopMeetingDutiesBuilder value={stopMeetingDuties} onChange={setStopMeetingDuties} />
              </CardSection> */}

              {/* ══════ 23. Compensation & Payroll ══════ */}
              {/* <CardSection title="Compensation & Payroll" icon="💰">
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:18 }}>
                  <FormField label="Annual CTC"><input className="ae-input" type="text" placeholder="e.g. ₹24,00,000" {...register("ctc")} /></FormField>
                  <FormField label="Basic Salary"><input className="ae-input" type="text" placeholder="e.g. ₹10,00,000" {...register("basic_salary")} /></FormField>
                  <FormField label="HRA"><input className="ae-input" type="text" placeholder="e.g. ₹4,00,000" {...register("hra")} /></FormField>
                  <FormField label="Allowances"><input className="ae-input" type="text" placeholder="e.g. ₹3,00,000" {...register("allowances")} /></FormField>
                  <FormField label="Annual Bonus"><input className="ae-input" type="text" placeholder="e.g. ₹2,00,000" {...register("bonus")} /></FormField>
                  <FormField label="Pay Cycle">
                    <select className="ae-input" {...register("pay_cycle")}>
                      <option value="">Select cycle</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Bi-Weekly">Bi-Weekly</option>
                      <option value="Weekly">Weekly</option>
                    </select>
                  </FormField>
                  <FormField label="Pay Mode">
                    <select className="ae-input" {...register("pay_mode")}>
                      <option value="">Select mode</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Cash">Cash</option>
                    </select>
                  </FormField>
                  <FormField label="Bank Account No."><input className="ae-input" type="text" placeholder="Account number" {...register("bank_account")} /></FormField>
                </div>
              </CardSection> */}

              {/* ══════ 24. Work History ══════ */}
              <CardSection title="Work History" icon="🏢">
                <WorkHistoryBuilder value={workHistory} onChange={setWorkHistory} />
              </CardSection>

              {/* ══════ 25. Education ══════ */}
              <CardSection title="Education" icon="🎓">
                <EducationBuilder value={education} onChange={setEducation} />
              </CardSection>

              {/* ══════ 26. Emergency Contacts ══════ */}
              {/* <CardSection title="Emergency Contacts" icon="🚨">
                <EmergencyBuilder value={emergency} onChange={setEmergency} />
              </CardSection> */}

              {/* ══════ 27. Resume / CV ══════ */}
              <CardSection title="Resume / CV" icon="📄">
                <S3FileUpload
                  label="Upload Resume (PDF, DOC, DOCX)"
                  value={resumeUrl}
                  onChange={(url) => {
                    setResumeUrl(url);
                    setResumeName(url.split("/").pop());
                  }}
                  onRemove={() => {
                    setResumeUrl("");
                    setResumeName("");
                  }}
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  folder="employee_resumes"
                />
              </CardSection>

              {/* ══════ 28. Profile Picture ══════ */}
              <CardSection title="Profile Picture" icon="🖼️">
                <S3FileUpload
                  label="Profile Picture (PNG, JPG, WEBP)"
                  value={profilePicture}
                  onChange={(url) => {
                    setProfilePicture(url);
                    setPreviewSrc(url);
                    setIsPreviewed(true);
                  }}
                  onRemove={() => {
                    setProfilePicture("");
                    setPreviewSrc("");
                    setIsPreviewed(false);
                  }}
                  accept="image/*"
                  folder="employees"
                />
              </CardSection>

              {/* ── Actions ── */}
              <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
                <SecondaryBtn onClick={() => navigate(`/${EmpRoute.list}`)}>← Back</SecondaryBtn>
                <PrimaryBtn type="submit">✓ Add Member</PrimaryBtn>
              </div>

            </div>
          </form>
        )}
      </div>
    </>
  );
};

export default AddEmployee;









// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { getToken } from "../../../services/useLocalStorage";
// import toast from "react-hot-toast";
// import { EmpRoute } from "../../../config/RouteConfig";
// import ApiService from "../../../services/ApiService";
// import {
//   getDepartments,
//   getPosts,
//   insertEmployee,
//   getRoles,
// } from "../../../config/config";
// import { useForm } from "react-hook-form";
// import { checkFile } from "../../../services/ValidationService";
// import {
//   alphabetSpaceWithDot,
//   mailPattern,
//   phonePattern,
// } from "../../../services/Pattern";
// import Multiselect from "multiselect-react-dropdown";
// import { ReactComponent as ImageIcon } from "../../../assets/svg/image.svg";

// // ─────────────────────────────────────────────
// //  🎨  THEME
// // ─────────────────────────────────────────────
// const THEME = {
//   brand: "#887549",
//   brandLight: "#F5F0E8",
//   brandMid: "#C4A97D",
//   brandDark: "#5C4E32",
//   bg: "#F8F5F0",
//   border: "#EDE5D5",
//   text: "#1A1A2E",
//   textMuted: "#ADADAD",
//   textLight: "#BDBDBD",
//   error: "#CF1322",
//   errorBg: "#FFF1F0",
//   errorBorder: "#FFA39E",
//   success: "#2D9D78",
//   successBg: "#EAF7F2",
// };

// const GLOBAL_CSS = `
//   @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
//   * { box-sizing: border-box; }
//   @keyframes aeFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
//   .ae-fade { animation:aeFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
//   @keyframes aeSpin { to{transform:rotate(360deg)} }

//   .ae-input {
//     width:100%; padding:10px 13px; border-radius:10px;
//     border:1.5px solid #E0D5C5; font-size:13px;
//     font-family:'DM Sans',sans-serif; color:#1A1A2E;
//     outline:none; background:#fff; transition:border-color 0.15s,box-shadow 0.15s;
//     appearance:auto;
//   }
//   .ae-input:focus { border-color:#887549; box-shadow:0 0 0 3px #88754918; }
//   .ae-input::placeholder { color:#BDBDBD; }
//   .ae-input.error { border-color:#FFA39E; background:#FFF1F0; }
//   .ae-input.error:focus { box-shadow:0 0 0 3px #CF132218; }

//   .ae-textarea {
//     width:100%; padding:10px 13px; border-radius:10px;
//     border:1.5px solid #E0D5C5; font-size:13px;
//     font-family:'DM Sans',sans-serif; color:#1A1A2E;
//     outline:none; background:#fff; transition:border-color 0.15s,box-shadow 0.15s;
//     resize:vertical; min-height:90px; line-height:1.6;
//   }
//   .ae-textarea:focus { border-color:#887549; box-shadow:0 0 0 3px #88754918; }
//   .ae-textarea::placeholder { color:#BDBDBD; }

//   /* Multiselect */
//   .ae-multiselect .searchWrapper {
//     border:1.5px solid #E0D5C5 !important; border-radius:10px !important;
//     padding:6px 10px !important; min-height:42px !important;
//     font-family:'DM Sans',sans-serif !important; transition:border-color 0.15s;
//   }
//   .ae-multiselect.error .searchWrapper { border-color:#FFA39E !important; background:#FFF1F0 !important; }
//   .ae-multiselect .searchWrapper:focus-within { border-color:#887549 !important; box-shadow:0 0 0 3px #88754918; }
//   .ae-multiselect .chip { background:#887549 !important; font-size:11px !important; border-radius:20px !important; }
//   .ae-multiselect .optionContainer li:hover,
//   .ae-multiselect .optionContainer .highlight { background:#F5F0E8 !important; color:#887549 !important; }
//   .ae-multiselect input { font-family:'DM Sans',sans-serif !important; font-size:13px !important; }

//   /* Upload zone */
//   .ae-upload-zone {
//     border:2px dashed #D4C4A0; border-radius:12px;
//     padding:28px 20px; text-align:center; cursor:pointer;
//     background:#F5F0E8; transition:all 0.18s;
//     display:flex; flex-direction:column; align-items:center; gap:8px;
//   }
//   .ae-upload-zone:hover { border-color:#887549; background:#F0E8D8; }
//   .ae-upload-zone.has-img { border-style:solid; border-color:#887549; }

//   /* Status toggle */
//   .ae-status-toggle { display:none; }
//   .ae-status-label {
//     display:inline-flex; align-items:center; gap:6px;
//     padding:7px 16px; border-radius:20px; cursor:pointer;
//     font-size:12px; font-weight:700; border:1.5px solid #E0D5C5;
//     background:#fff; color:#8C8C8C; transition:all 0.18s;
//     font-family:'DM Sans',sans-serif; user-select:none;
//   }
//   .ae-status-toggle[value="1"]:checked + .ae-status-label { background:#F6FFED; color:#389E0D; border-color:#B7EB8F; }
//   .ae-status-toggle[value="0"]:checked + .ae-status-label { background:#FFF1F0; color:#CF1322; border-color:#FFA39E; }

//   /* Tag input */
//   .ae-tag-input-wrap {
//     display:flex; flex-wrap:wrap; gap:7px; padding:8px 10px;
//     border:1.5px solid #E0D5C5; border-radius:10px; background:#fff;
//     min-height:44px; align-items:center; cursor:text;
//     transition:border-color 0.15s,box-shadow 0.15s;
//   }
//   .ae-tag-input-wrap:focus-within { border-color:#887549; box-shadow:0 0 0 3px #88754918; }
//   .ae-tag-input-wrap.error { border-color:#FFA39E; background:#FFF1F0; }
//   .ae-tag {
//     display:inline-flex; align-items:center; gap:5px;
//     padding:3px 10px 3px 12px; border-radius:20px;
//     background:#F5F0E8; color:#5C4E32; border:1px solid #EDE5D5;
//     font-size:12px; font-weight:600; font-family:'DM Sans',sans-serif;
//   }
//   .ae-tag-remove {
//     background:none; border:none; cursor:pointer; padding:0;
//     color:#C4A97D; font-size:14px; line-height:1; font-weight:700;
//     display:inline-flex; align-items:center;
//   }
//   .ae-tag-remove:hover { color:#887549; }
//   .ae-tag-input {
//     border:none; outline:none; font-size:13px; font-family:'DM Sans',sans-serif;
//     color:#1A1A2E; background:transparent; min-width:140px; flex:1;
//   }
//   .ae-tag-input::placeholder { color:#BDBDBD; }

//   /* Skill row */
//   .ae-skill-row {
//     display:grid; grid-template-columns:1fr auto auto; gap:10px; align-items:center;
//     padding:8px 0; border-bottom:1px solid #EDE5D5;
//   }
//   .ae-skill-row:last-child { border-bottom:none; }
//   .ae-skill-level {
//     width:70px; padding:7px 10px; border-radius:8px;
//     border:1.5px solid #E0D5C5; font-size:12px; text-align:center;
//     font-family:'DM Sans',sans-serif; outline:none; transition:border-color 0.15s;
//   }
//   .ae-skill-level:focus { border-color:#887549; }

//   .ae-add-btn {
//     display:inline-flex; align-items:center; gap:5px;
//     padding:7px 14px; border-radius:8px;
//     background:#F5F0E8; border:1.5px solid #EDE5D5;
//     color:#887549; font-size:12px; font-weight:700;
//     cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.15s;
//   }
//   .ae-add-btn:hover { background:#887549; color:#fff; border-color:#887549; }
//   .ae-remove-btn {
//     width:28px; height:28px; border-radius:7px;
//     background:#FFF1F0; border:1.5px solid #FFA39E;
//     color:#CF1322; cursor:pointer; display:inline-flex;
//     align-items:center; justify-content:center; font-size:14px; transition:all 0.15s;
//   }
//   .ae-remove-btn:hover { background:#CF1322; color:#fff; }

//   /* Resume zone */
//   .ae-resume-zone {
//     border:2px dashed #D4C4A0; border-radius:12px; padding:16px 18px;
//     cursor:pointer; background:#F5F0E8; transition:all 0.18s;
//     display:flex; align-items:center; gap:14px;
//     position:relative; overflow:hidden;
//   }
//   .ae-resume-zone:hover { border-color:#887549; background:#F0E8D8; }
//   .ae-resume-zone input[type=file] { position:absolute; inset:0; opacity:0; cursor:pointer; width:100%; }
//   .ae-resume-zone.has-file { border-style:solid; border-color:#887549; }

//   /* KPI row */
//   .ae-kpi-row {
//     display:grid; grid-template-columns:1fr 1fr; gap:10px; align-items:start;
//     padding:10px 0; border-bottom:1px solid #EDE5D5;
//   }
//   .ae-kpi-row:last-child { border-bottom:none; }

//   /* Authority block */
//   .ae-authority-block {
//     border-radius:10px; padding:14px 16px; margin-bottom:10px;
//   }
//   .ae-authority-block:last-child { margin-bottom:0; }

//   /* Deliverable tabs */
//   .ae-tab-btn {
//     padding:7px 16px; border-radius:8px; font-size:12px; font-weight:700;
//     border:1.5px solid #E0D5C5; cursor:pointer; font-family:'DM Sans',sans-serif;
//     transition:all 0.15s; background:#fff; color:#595959;
//   }
//   .ae-tab-btn.active { background:#887549; color:#fff; border-color:#887549; }
//   .ae-tab-btn:hover:not(.active) { border-color:#887549; color:#887549; }

//   /* Growth index display */
//   .ae-growth-bar {
//     height:10px; border-radius:10px; background:#F5F0E8; overflow:hidden; margin:8px 0;
//   }
//   .ae-growth-fill {
//     height:100%; border-radius:10px;
//     background:linear-gradient(90deg,#C4A97D,#887549);
//     transition:width 0.4s ease;
//   }

//   /* Warning/Risk stage list */
//   .ae-stage-item {
//     display:flex; align-items:flex-start; gap:10px;
//     padding:10px 14px; border-radius:10px; margin-bottom:8px;
//     border:1px solid #EDE5D5;
//   }
//   .ae-stage-badge {
//     flex-shrink:0; padding:2px 10px; border-radius:20px;
//     font-size:11px; font-weight:700; font-family:'DM Sans',sans-serif;
//   }

//   ::-webkit-scrollbar { width:5px; }
//   ::-webkit-scrollbar-track { background:#F5F0E8; }
//   ::-webkit-scrollbar-thumb { background:#C4A97D; border-radius:10px; }
// `;

// // ─────────────────────────────────────────────
// //  🧩  ATOMS
// // ─────────────────────────────────────────────
// function FieldLabel({ children, required }) {
//   return (
//     <label style={{ display:"block", marginBottom:5, fontSize:11, fontWeight:700, color:THEME.textMuted, textTransform:"uppercase", letterSpacing:"0.07em" }}>
//       {children}
//       {required && <span style={{ color:THEME.error, marginLeft:3 }}>*</span>}
//     </label>
//   );
// }
// function ErrorMsg({ message }) {
//   if (!message) return null;
//   return (
//     <p style={{ margin:"4px 0 0", fontSize:11, color:THEME.error, display:"flex", alignItems:"center", gap:4 }}>
//       <span>⚠</span> {message}
//     </p>
//   );
// }
// function CardSection({ title, icon, children }) {
//   return (
//     <div style={{ background:"#fff", border:`1px solid ${THEME.border}`, borderRadius:14, padding:"22px 24px", marginBottom:16, boxShadow:"0 2px 10px rgba(136,117,73,0.06)" }}>
//       <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
//         <div style={{ width:3, height:16, borderRadius:2, background:`linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
//         <h2 style={{ margin:0, fontSize:12, fontWeight:700, color:THEME.brand, textTransform:"uppercase", letterSpacing:"0.07em", fontFamily:"'Sora',sans-serif" }}>
//           {icon && <span style={{ marginRight:6 }}>{icon}</span>}
//           {title}
//         </h2>
//       </div>
//       {children}
//     </div>
//   );
// }
// function PrimaryBtn({ children, type="button", onClick, disabled }) {
//   const [hov, setHov] = useState(false);
//   return (
//     <button type={type} onClick={onClick} disabled={disabled}
//       onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
//       style={{ padding:"10px 24px", borderRadius:10, border:"none", background:disabled?"#C4C4C4":hov?THEME.brandDark:THEME.brand, color:"#fff", fontSize:13, fontWeight:700, cursor:disabled?"not-allowed":"pointer", fontFamily:"'Sora',sans-serif", transition:"all 0.18s", boxShadow:disabled?"none":`0 2px 8px ${THEME.brand}44`, display:"inline-flex", alignItems:"center", gap:6 }}>
//       {children}
//     </button>
//   );
// }
// function SecondaryBtn({ children, onClick }) {
//   const [hov, setHov] = useState(false);
//   return (
//     <button type="button" onClick={onClick}
//       onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
//       style={{ padding:"10px 24px", borderRadius:10, border:`1.5px solid ${hov?THEME.brand:"#E0D5C5"}`, background:hov?THEME.brandLight:"#fff", color:hov?THEME.brand:"#595959", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.18s" }}>
//       {children}
//     </button>
//   );
// }
// function FormField({ label, required, error, children, fullWidth }) {
//   return (
//     <div style={{ display:"flex", flexDirection:"column", gridColumn:fullWidth?"1 / -1":undefined }}>
//       <FieldLabel required={required}>{label}</FieldLabel>
//       {children}
//       <ErrorMsg message={error} />
//     </div>
//   );
// }

// // ─────────────────────────────────────────────
// //  🏷  Tag Input  (paste-aware)
// // ─────────────────────────────────────────────
// function TagInput({ value = [], onChange, placeholder, hasError }) {
//   const [inputVal, setInputVal] = useState("");

//   // Strip leading bullet chars / asterisks / dashes from a single string
//   const cleanTag = (raw) =>
//     raw
//       .replace(/^[\s\u2022\u00b7\u2013\u2014\-\*]+/, "")
//       .replace(/[\u2022\u00b7]+/g, "")
//       .trim();

//   // Split a block of text into individual tag candidates
//   const splitBlock = (text) =>
//     text
//       .split(/[\n\r]+/)
//       .flatMap((line) => line.split(/,/))
//       .map(cleanTag)
//       .filter(Boolean);

//   // Add one or many tags, deduplicating against existing
//   const addTags = (rawList) => {
//     const next = [...value];
//     rawList.forEach((raw) => {
//       const tag = cleanTag(raw);
//       if (tag && !next.includes(tag)) next.push(tag);
//     });
//     if (next.length !== value.length) onChange(next);
//   };

//   const handleKey = (e) => {
//     if (["Enter", ","].includes(e.key)) {
//       e.preventDefault();
//       if (inputVal.trim()) { addTags([inputVal]); setInputVal(""); }
//     } else if (e.key === "Backspace" && !inputVal && value.length) {
//       onChange(value.slice(0, -1));
//     }
//   };

//   const handlePaste = (e) => {
//     e.preventDefault();
//     const pasted = e.clipboardData.getData("text");
//     const tags = splitBlock(pasted);
//     if (tags.length > 0) { addTags(tags); setInputVal(""); }
//   };

//   const handleBlur = () => {
//     if (inputVal.trim()) { addTags([inputVal]); setInputVal(""); }
//   };

//   return (
//     <div
//       className={`ae-tag-input-wrap${hasError ? " error" : ""}`}
//       onClick={(e) => e.currentTarget.querySelector("input")?.focus()}
//     >
//       {value.map((t) => (
//         <span className="ae-tag" key={t}>
//           {t}
//           <button type="button" className="ae-tag-remove" onClick={() => onChange(value.filter((x) => x !== t))}>×</button>
//         </span>
//       ))}
//       <input
//         className="ae-tag-input"
//         value={inputVal}
//         onChange={(e) => setInputVal(e.target.value)}
//         onKeyDown={handleKey}
//         onPaste={handlePaste}
//         onBlur={handleBlur}
//         placeholder={value.length === 0 ? placeholder : "Add more…"}
//       />
//     </div>
//   );
// }

// // ─────────────────────────────────────────────
// //  ⚡  Skill Builder
// // ─────────────────────────────────────────────
// function SkillBuilder({ value = [], onChange }) {
//   const [skillName, setSkillName] = useState("");
//   const [skillLevel, setSkillLevel] = useState(80);
//   const add = () => {
//     const name = skillName.trim();
//     if (!name) return;
//     if (value.find((s) => s.name.toLowerCase() === name.toLowerCase())) { toast.error("Skill already added"); return; }
//     onChange([...value, { name, level: Number(skillLevel) }]);
//     setSkillName(""); setSkillLevel(80);
//   };
//   return (
//     <div>
//       {value.length > 0 && (
//         <div style={{ marginBottom:12 }}>
//           {value.map((s) => (
//             <div className="ae-skill-row" key={s.name}>
//               <span style={{ fontSize:13, fontWeight:600, color:THEME.text, fontFamily:"'DM Sans',sans-serif" }}>{s.name}</span>
//               <div style={{ display:"flex", alignItems:"center", gap:6 }}>
//                 <div style={{ width:80, height:6, borderRadius:10, background:THEME.brandLight, overflow:"hidden" }}>
//                   <div style={{ width:`${s.level}%`, height:"100%", borderRadius:10, background:`linear-gradient(90deg,${THEME.brandMid},${THEME.brand})` }} />
//                 </div>
//                 <span style={{ fontSize:11, color:THEME.textMuted, fontWeight:600, minWidth:30 }}>{s.level}%</span>
//               </div>
//               <button type="button" className="ae-remove-btn" onClick={() => onChange(value.filter((x) => x.name !== s.name))}>×</button>
//             </div>
//           ))}
//         </div>
//       )}
//       <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
//         <input className="ae-input" style={{ flex:"1 1 180px", minWidth:140 }} placeholder="Skill name (e.g. AutoCAD, SketchUp…)"
//           value={skillName} onChange={(e) => setSkillName(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} />
//         <input type="number" min="1" max="100" className="ae-skill-level" value={skillLevel}
//           onChange={(e) => setSkillLevel(Math.min(100, Math.max(1, e.target.value)))} title="Proficiency %" />
//         <span style={{ fontSize:12, color:THEME.textMuted }}>%</span>
//         <button type="button" className="ae-add-btn" onClick={add}>+ Add Skill</button>
//       </div>
//       <p style={{ margin:"6px 0 0", fontSize:11, color:THEME.textMuted }}>Press Enter or click Add Skill. Proficiency 1–100.</p>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────
// //  📚  Work History Builder
// // ─────────────────────────────────────────────
// function WorkHistoryBuilder({ value = [], onChange }) {
//   const [form, setForm] = useState({ role:"", company:"", period:"" });
//   const add = () => {
//     if (!form.role.trim() || !form.company.trim()) { toast.error("Role and Company are required"); return; }
//     onChange([...value, { ...form }]);
//     setForm({ role:"", company:"", period:"" });
//   };
//   return (
//     <div>
//       {value.length > 0 && (
//         <div style={{ marginBottom:12, display:"flex", flexDirection:"column", gap:8 }}>
//           {value.map((w, i) => (
//             <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", background:THEME.brandLight, borderRadius:10, border:`1px solid ${THEME.border}` }}>
//               <div style={{ flex:1 }}>
//                 <div style={{ fontSize:13, fontWeight:700, color:THEME.text, fontFamily:"'DM Sans',sans-serif" }}>{w.role}</div>
//                 <div style={{ fontSize:12, color:THEME.textMuted }}>{w.company}{w.period && ` · ${w.period}`}</div>
//               </div>
//               <button type="button" className="ae-remove-btn" onClick={() => onChange(value.filter((_, idx) => idx !== i))}>×</button>
//             </div>
//           ))}
//         </div>
//       )}
//       <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr auto", gap:8, alignItems:"end" }}>
//         <div><FieldLabel>Role / Position</FieldLabel><input className="ae-input" placeholder="e.g. Site Engineer" value={form.role} onChange={(e) => setForm({ ...form, role:e.target.value })} /></div>
//         <div><FieldLabel>Company</FieldLabel><input className="ae-input" placeholder="e.g. K2India" value={form.company} onChange={(e) => setForm({ ...form, company:e.target.value })} /></div>
//         <div><FieldLabel>Period</FieldLabel><input className="ae-input" placeholder="e.g. Jan 2020 – Mar 2022" value={form.period} onChange={(e) => setForm({ ...form, period:e.target.value })} /></div>
//         <button type="button" className="ae-add-btn" style={{ marginBottom:0 }} onClick={add}>+ Add</button>
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────
// //  🎓  Education Builder
// // ─────────────────────────────────────────────
// function EducationBuilder({ value = [], onChange }) {
//   const [form, setForm] = useState({ degree:"", institution:"", year:"" });
//   const add = () => {
//     if (!form.degree.trim() || !form.institution.trim()) { toast.error("Degree and Institution are required"); return; }
//     onChange([...value, { ...form }]);
//     setForm({ degree:"", institution:"", year:"" });
//   };
//   return (
//     <div>
//       {value.length > 0 && (
//         <div style={{ marginBottom:12, display:"flex", flexDirection:"column", gap:8 }}>
//           {value.map((e, i) => (
//             <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", background:THEME.brandLight, borderRadius:10, border:`1px solid ${THEME.border}` }}>
//               <div style={{ flex:1 }}>
//                 <div style={{ fontSize:13, fontWeight:700, color:THEME.text, fontFamily:"'DM Sans',sans-serif" }}>{e.degree}</div>
//                 <div style={{ fontSize:12, color:THEME.textMuted }}>{e.institution}{e.year && ` · ${e.year}`}</div>
//               </div>
//               <button type="button" className="ae-remove-btn" onClick={() => onChange(value.filter((_, idx) => idx !== i))}>×</button>
//             </div>
//           ))}
//         </div>
//       )}
//       <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto auto", gap:8, alignItems:"end" }}>
//         <div><FieldLabel>Degree</FieldLabel><input className="ae-input" placeholder="e.g. B.Tech Civil" value={form.degree} onChange={(e) => setForm({ ...form, degree:e.target.value })} /></div>
//         <div><FieldLabel>Institution</FieldLabel><input className="ae-input" placeholder="e.g. SVNIT Surat" value={form.institution} onChange={(e) => setForm({ ...form, institution:e.target.value })} /></div>
//         <div><FieldLabel>Year</FieldLabel><input className="ae-input" style={{ width:80 }} placeholder="2021" value={form.year} onChange={(e) => setForm({ ...form, year:e.target.value })} /></div>
//         <button type="button" className="ae-add-btn" onClick={add}>+ Add</button>
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────
// //  🚨  Emergency Contact Builder
// // ─────────────────────────────────────────────
// function EmergencyBuilder({ value = [], onChange }) {
//   const [form, setForm] = useState({ name:"", relation:"", phone:"" });
//   const add = () => {
//     if (!form.name.trim() || !form.phone.trim()) { toast.error("Name and Phone are required"); return; }
//     onChange([...value, { ...form }]);
//     setForm({ name:"", relation:"", phone:"" });
//   };
//   return (
//     <div>
//       {value.length > 0 && (
//         <div style={{ marginBottom:12, display:"flex", flexDirection:"column", gap:8 }}>
//           {value.map((c, i) => (
//             <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", background:THEME.brandLight, borderRadius:10, border:`1px solid ${THEME.border}` }}>
//               <div style={{ flex:1 }}>
//                 <div style={{ fontSize:13, fontWeight:700, color:THEME.text, fontFamily:"'DM Sans',sans-serif" }}>{c.name} <span style={{ color:THEME.textMuted, fontWeight:400 }}>({c.relation})</span></div>
//                 <div style={{ fontSize:12, color:THEME.textMuted }}>{c.phone}</div>
//               </div>
//               <button type="button" className="ae-remove-btn" onClick={() => onChange(value.filter((_, idx) => idx !== i))}>×</button>
//             </div>
//           ))}
//         </div>
//       )}
//       <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr auto", gap:8, alignItems:"end" }}>
//         <div><FieldLabel>Full Name</FieldLabel><input className="ae-input" placeholder="Contact name" value={form.name} onChange={(e) => setForm({ ...form, name:e.target.value })} /></div>
//         <div><FieldLabel>Relation</FieldLabel><input className="ae-input" placeholder="e.g. Spouse" value={form.relation} onChange={(e) => setForm({ ...form, relation:e.target.value })} /></div>
//         <div><FieldLabel>Phone</FieldLabel><input className="ae-input" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setForm({ ...form, phone:e.target.value })} /></div>
//         <button type="button" className="ae-add-btn" onClick={add}>+ Add</button>
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────
// //  🔐  Authority & Decision Rights Builder
// // ─────────────────────────────────────────────
// function AuthorityBuilder({ value, onChange }) {
//   return (
//     <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
//       {[
//         { key:"can_decide", label:"✅ Can Decide Independently", color:"#F6FFED", border:"#B7EB8F", badge:"#52C41A", placeholder:"e.g. Internal work allocation, daily task planning…" },
//         { key:"must_escalate", label:"⚠️ Must Escalate", color:"#FFFBE6", border:"#FFE58F", badge:"#FAAD14", placeholder:"e.g. Design changes affecting compliance, approval delays…" },
//         { key:"cannot_decide", label:"🚫 Cannot Decide or Commit", color:"#FFF1F0", border:"#FFA39E", badge:"#FF4D4F", placeholder:"e.g. Commercial commitments, HR salary changes…" },
//       ].map(({ key, label, color, border, badge, placeholder }) => (
//         <div key={key} style={{ background:color, border:`1.5px solid ${border}`, borderRadius:12, padding:"14px 16px" }}>
//           <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
//             <span style={{ background:badge, color:"#fff", fontSize:10, fontWeight:700, padding:"2px 10px", borderRadius:20, fontFamily:"'DM Sans',sans-serif" }}>{label}</span>
//           </div>
//           <TagInput value={value[key] || []} onChange={(v) => onChange({ ...value, [key]:v })} placeholder={placeholder} />
//           <p style={{ margin:"5px 0 0", fontSize:11, color:THEME.textMuted }}>{(value[key] || []).length} item{(value[key] || []).length !== 1 ? "s" : ""} added</p>
//         </div>
//       ))}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────
// //  📅  Deliverables Builder
// // ─────────────────────────────────────────────
// function DeliverablesBuilder({ value, onChange }) {
//   const [activeTab, setActiveTab] = useState("daily");
//   const tabs = [
//     { key:"daily", label:"📅 Daily", placeholder:"e.g. Task schedule created and followed…" },
//     { key:"weekly", label:"📆 Weekly", placeholder:"e.g. Project movement review across all live assignments…" },
//     { key:"monthly", label:"🗓️ Monthly", placeholder:"e.g. Architecture team output summary…" },
//   ];
//   return (
//     <div>
//       <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
//         {tabs.map((t) => (
//           <button key={t.key} type="button" className={`ae-tab-btn${activeTab === t.key ? " active" : ""}`} onClick={() => setActiveTab(t.key)}>{t.label}</button>
//         ))}
//       </div>
//       {tabs.map((t) => activeTab === t.key && (
//         <div key={t.key}>
//           <TagInput value={value[t.key] || []} onChange={(v) => onChange({ ...value, [t.key]:v })} placeholder={t.placeholder} />
//           <p style={{ margin:"6px 0 0", fontSize:11, color:THEME.textMuted }}>{(value[t.key] || []).length} {t.key} deliverable{(value[t.key] || []).length !== 1 ? "s" : ""} added</p>
//         </div>
//       ))}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────
// //  📊  KPI Builder
// // ─────────────────────────────────────────────
// function KpiBuilder({ value = [], onChange }) {
//   const [form, setForm] = useState({ category:"", metric:"", target:"" });
//   const categories = ["Delivery", "Team", "Approval", "System", "Other"];
//   const add = () => {
//     if (!form.metric.trim()) { toast.error("Metric description is required"); return; }
//     onChange([...value, { ...form }]);
//     setForm({ category:"", metric:"", target:"" });
//   };
//   return (
//     <div>
//       {value.length > 0 && (
//         <div style={{ marginBottom:14 }}>
//           {Object.entries(
//             value.reduce((acc, kpi) => {
//               const cat = kpi.category || "Other";
//               if (!acc[cat]) acc[cat] = [];
//               acc[cat].push(kpi);
//               return acc;
//             }, {})
//           ).map(([cat, kpis]) => (
//             <div key={cat} style={{ marginBottom:10 }}>
//               <div style={{ fontSize:11, fontWeight:700, color:THEME.brand, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>{cat} KPIs</div>
//               {kpis.map((kpi, i) => (
//                 <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", background:THEME.brandLight, borderRadius:10, border:`1px solid ${THEME.border}`, marginBottom:6 }}>
//                   <div style={{ flex:1 }}>
//                     <div style={{ fontSize:13, fontWeight:600, color:THEME.text, fontFamily:"'DM Sans',sans-serif" }}>{kpi.metric}</div>
//                     {kpi.target && <div style={{ fontSize:11, color:THEME.textMuted }}>Target: {kpi.target}</div>}
//                   </div>
//                   <button type="button" className="ae-remove-btn" onClick={() => onChange(value.filter((k) => k !== kpi))}>×</button>
//                 </div>
//               ))}
//             </div>
//           ))}
//         </div>
//       )}
//       <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr 1fr auto", gap:8, alignItems:"end" }}>
//         <div>
//           <FieldLabel>Category</FieldLabel>
//           <select className="ae-input" value={form.category} onChange={(e) => setForm({ ...form, category:e.target.value })}>
//             <option value="">Select</option>
//             {categories.map((c) => <option key={c} value={c}>{c}</option>)}
//           </select>
//         </div>
//         <div>
//           <FieldLabel>KPI / Metric</FieldLabel>
//           <input className="ae-input" placeholder="e.g. On-time task completion rate" value={form.metric} onChange={(e) => setForm({ ...form, metric:e.target.value })} />
//         </div>
//         <div>
//           <FieldLabel>Target</FieldLabel>
//           <input className="ae-input" placeholder="e.g. 90%" value={form.target} onChange={(e) => setForm({ ...form, target:e.target.value })} />
//         </div>
//         <button type="button" className="ae-add-btn" onClick={add}>+ Add</button>
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────
// //  📈  Growth Index Builder
// // ─────────────────────────────────────────────
// function GrowthIndexBuilder({ value, onChange }) {
//   const zones = [
//     { range:"1–2", label:"New / highly dependent" },
//     { range:"3–4", label:"Contributing but learning" },
//     { range:"5–6", label:"Reliable; needs ownership support" },
//     { range:"7–8", label:"Strong performer; trusted" },
//     { range:"9–10", label:"Top-level; leads outcomes" },
//   ];
//   return (
//     <div>
//       <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px,1fr))", gap:18, marginBottom:20 }}>
//         <FormField label="Current Growth Zone (1–10)">
//           <input className="ae-input" type="number" min="1" max="10" placeholder="e.g. 7"
//             value={value.current_zone || ""} onChange={(e) => onChange({ ...value, current_zone:e.target.value })} />
//         </FormField>
//         <FormField label="Target Growth Zone (1–10)">
//           <input className="ae-input" type="number" min="1" max="10" placeholder="e.g. 9"
//             value={value.target_zone || ""} onChange={(e) => onChange({ ...value, target_zone:e.target.value })} />
//         </FormField>
//       </div>
//       {value.current_zone && (
//         <div style={{ marginBottom:20 }}>
//           <div style={{ fontSize:11, fontWeight:700, color:THEME.textMuted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>Current Level Visual</div>
//           <div className="ae-growth-bar">
//             <div className="ae-growth-fill" style={{ width:`${(Math.min(10, Math.max(1, Number(value.current_zone))) / 10) * 100}%` }} />
//           </div>
//           <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:THEME.textMuted }}>
//             <span>1</span><span>5</span><span>10</span>
//           </div>
//         </div>
//       )}
//       <div style={{ marginBottom:20 }}>
//         <FieldLabel>What Top Level Looks Like for This Role</FieldLabel>
//         <TagInput value={value.top_level_criteria || []} onChange={(v) => onChange({ ...value, top_level_criteria:v })}
//           placeholder="e.g. Clear project control without founder follow-up…" />
//         <p style={{ margin:"5px 0 0", fontSize:11, color:THEME.textMuted }}>{(value.top_level_criteria || []).length} criteria added</p>
//       </div>
//       <div style={{ background:THEME.brandLight, border:`1px solid ${THEME.border}`, borderRadius:12, padding:"14px 16px" }}>
//         <div style={{ fontSize:11, fontWeight:700, color:THEME.brand, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>Scale Reference</div>
//         <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
//           {zones.map((z) => (
//             <div key={z.range} style={{ display:"flex", alignItems:"center", gap:10 }}>
//               <span style={{ background:THEME.brand, color:"#fff", fontSize:10, fontWeight:700, padding:"2px 9px", borderRadius:20, minWidth:36, textAlign:"center", fontFamily:"'DM Sans',sans-serif" }}>{z.range}</span>
//               <span style={{ fontSize:12, color:THEME.text, fontFamily:"'DM Sans',sans-serif" }}>{z.label}</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────
// //  ⚠️  Development Risks & Warning Ladder
// // ─────────────────────────────────────────────
// function RisksAndWarningBuilder({ value, onChange }) {
//   const stages = [
//     { key:"stage_1", label:"Stage 1", desc:"Coaching conversation with clear expectations", color:"#FFFBE6", border:"#FFE58F", badge:"#FAAD14" },
//     { key:"stage_2", label:"Stage 2", desc:"Written development focus with measurable support goals", color:"#FFF7E6", border:"#FFD591", badge:"#FA8C16" },
//     { key:"stage_3", label:"Stage 3", desc:"Role redesign, focused mentoring, or reassessment of responsibility load", color:"#FFF1F0", border:"#FFA39E", badge:"#FF4D4F" },
//   ];
//   return (
//     <div>
//       <div style={{ marginBottom:20 }}>
//         <FieldLabel>Risk Flags — This Role Needs Support If</FieldLabel>
//         <TagInput value={value.risk_flags || []} onChange={(v) => onChange({ ...value, risk_flags:v })}
//           placeholder="e.g. Projects move late without early escalation…" />
//         <p style={{ margin:"5px 0 0", fontSize:11, color:THEME.textMuted }}>{(value.risk_flags || []).length} risk flag{(value.risk_flags || []).length !== 1 ? "s" : ""} added</p>
//       </div>
//       <FieldLabel>HR Review / Warning Ladder</FieldLabel>
//       <div style={{ marginBottom:20 }}>
//         {stages.map((s) => (
//           <div key={s.key} className="ae-stage-item" style={{ background:s.color, borderColor:s.border }}>
//             <span className="ae-stage-badge" style={{ background:s.badge, color:"#fff" }}>{s.label}</span>
//             <div style={{ flex:1 }}>
//               <div style={{ fontSize:12, fontWeight:600, color:THEME.text, fontFamily:"'DM Sans',sans-serif", marginBottom:4 }}>{s.desc}</div>
//               <input className="ae-input" style={{ fontSize:12 }} placeholder="Add custom note for this stage…"
//                 value={value[s.key] || ""} onChange={(e) => onChange({ ...value, [s.key]:e.target.value })} />
//             </div>
//           </div>
//         ))}
//       </div>
//       <div>
//         <FieldLabel>What This Role Is NOT Responsible For</FieldLabel>
//         <TagInput value={value.not_responsible || []} onChange={(v) => onChange({ ...value, not_responsible:v })}
//           placeholder="e.g. Final financial decisions, HR policy authority…" />
//         <p style={{ margin:"5px 0 0", fontSize:11, color:THEME.textMuted }}>{(value.not_responsible || []).length} item{(value.not_responsible || []).length !== 1 ? "s" : ""} added</p>
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────
// //  🚀  MAIN COMPONENT
// // ─────────────────────────────────────────────
// const AddEmployee = () => {
//   const navigate = useNavigate();

//   const [loading, setLoading] = useState(false);
//   const [department, setDepartment] = useState([]);
//   const [roles, setRoles] = useState([]);
//   const [post, setPost] = useState([]);
//   const [resumeName, setResumeName] = useState("");

//   const fileInputRef = useRef(null);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [isPreviewed, setIsPreviewed] = useState(false);
//   const [previewSrc, setPreviewSrc] = useState("");

//   const [responsibilities, setResponsibilities] = useState([]);
//   const [skills, setSkills] = useState([]);
//   const [workHistory, setWorkHistory] = useState([]);
//   const [education, setEducation] = useState([]);
//   const [emergency, setEmergency] = useState([]);
//   const [strengths, setStrengths] = useState([]);
//   const [weaknesses, setWeaknesses] = useState([]);

//   const [authority, setAuthority] = useState({ can_decide:[], must_escalate:[], cannot_decide:[] });
//   const [deliverables, setDeliverables] = useState({ daily:[], weekly:[], monthly:[] });
//   const [kpis, setKpis] = useState([]);
//   const [growthIndex, setGrowthIndex] = useState({ current_zone:"", target_zone:"", top_level_criteria:[] });
//   const [risksWarning, setRisksWarning] = useState({ risk_flags:[], stage_1:"", stage_2:"", stage_3:"", not_responsible:[] });

//   const { register, formState:{ errors }, getValues, setValue, setError, clearErrors, handleSubmit } = useForm({ mode:"onChange" });

//   useEffect(() => {
//     const h = { Authorization:`Bearer ${getToken()}`, "Content-Type":"application/json" };
//     const load = async (config, setter) => {
//       try {
//         const res = await ApiService(null, 0, h, config.method, config.url);
//         if (!res.data.error) setter(res.data?.data || []);
//       } catch (err) { toast.error(err.response?.data?.message); }
//     };
//     load(getDepartments, setDepartment);
//     load(getRoles, setRoles);
//     load(getPosts, setPost);
//   }, []);

//   const handleFileChange = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) { setSelectedFile(null); setIsPreviewed(false); setPreviewSrc(""); return; }
//     if (checkFile(file.name)) {
//       setSelectedFile(file);
//       const reader = new FileReader();
//       reader.onload = (ev) => { setPreviewSrc(ev.target.result); setIsPreviewed(true); };
//       reader.readAsDataURL(file);
//     } else {
//       toast.error("Invalid file type. Use PNG, JPG or GIF.");
//       setSelectedFile(null); setIsPreviewed(false); setPreviewSrc("");
//       if (fileInputRef.current) fileInputRef.current.value = "";
//     }
//   };
//   const clearProfilePic = () => {
//     setSelectedFile(null); setIsPreviewed(false); setPreviewSrc("");
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   };
//   const handleResumeChange = (e) => setResumeName(e.target.files?.[0]?.name || "");

//   const onSubmit = async (data) => {
//     const formData = new FormData();
//     for (let key of Object.keys(data)) {
//       if (key === "file") continue;
//       else if (key === "resume") { if (data.resume?.[0]) formData.append("resume", data.resume[0]); }
//       else if (key === "departments") formData.append(key, JSON.stringify(data[key]));
//       else formData.append(key, data[key]);
//     }
//     if (selectedFile) formData.append("profile_picture", selectedFile);

//     formData.append("responsibilities", JSON.stringify(responsibilities));
//     formData.append("skills", JSON.stringify(skills));
//     formData.append("work_history", JSON.stringify(workHistory));
//     formData.append("education", JSON.stringify(education));
//     formData.append("strengths", JSON.stringify(strengths));
//     formData.append("weaknesses", JSON.stringify(weaknesses));
//     formData.append("emergency_contacts", JSON.stringify(emergency));
//     formData.append("authority_rights", JSON.stringify(authority));
//     formData.append("deliverables", JSON.stringify(deliverables));
//     formData.append("kpis", JSON.stringify(kpis));
//     formData.append("growth_index", JSON.stringify(growthIndex));
//     formData.append("risks_and_warning", JSON.stringify(risksWarning));

//     setLoading(true);
//     try {
//       const h = { Authorization:`Bearer ${getToken()}`, "Content-Type":"multipart/form-data" };
//       const res = await ApiService(formData, 0, h, insertEmployee.method, insertEmployee.url);
//       if (!res.data.error) { toast.success(res.data.message); navigate(`/${EmpRoute.list}`); }
//       else toast.error(res.data.message);
//     } catch (err) {
//       toast.error(err?.response?.data?.message);
//       navigate(`/${EmpRoute.list}`);
//     } finally { setLoading(false); }
//   };

//   const onSelect = (list) => { if (list.length > 0) clearErrors("departments"); setValue("departments", list.map((v) => v.id)); };
//   const onRemove = (list) => { if (!list.length) setError("departments", { type:"custom", message:"Required" }); else clearErrors("departments"); setValue("departments", list.map((v) => v.id)); };
//   const onSelectRole = (list) => { if (list.length > 0) clearErrors("roles"); setValue("roles", list.map((v) => v.id)); };
//   const onRemoveRole = (list) => { if (!list.length) setError("roles", { type:"custom", message:"Required" }); else clearErrors("roles"); setValue("roles", list.map((v) => v.id)); };

//   return (
//     <>
//       <style>{GLOBAL_CSS}</style>
//       <div style={{ minHeight:"100vh", background:THEME.bg, fontFamily:"'DM Sans',sans-serif", padding:"28px 24px" }}>

//         <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:14, marginBottom:24 }}>
//           <div style={{ display:"flex", alignItems:"center", gap:8 }}>
//             <div style={{ width:4, height:26, borderRadius:3, background:`linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
//             <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:THEME.text, fontFamily:"'Sora',sans-serif", letterSpacing:"-0.3px" }}>Add Team Member</h1>
//           </div>
//           <div style={{ display:"flex", alignItems:"center", gap:8 }}>
//             <span style={{ fontSize:11, fontWeight:700, color:THEME.textMuted, textTransform:"uppercase", letterSpacing:"0.07em" }}>Status</span>
//             <div style={{ display:"flex", gap:6 }}>
//               {[{ v:"1", label:"● Active" }, { v:"0", label:"● Inactive" }].map(({ v, label }) => (
//                 <React.Fragment key={v}>
//                   <input type="radio" id={`ae-st-${v}`} value={v} className="ae-status-toggle" {...register("active")} defaultChecked={v === "1"} />
//                   <label htmlFor={`ae-st-${v}`} className="ae-status-label">{label}</label>
//                 </React.Fragment>
//               ))}
//             </div>
//           </div>
//         </div>

//         {loading ? (
//           <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"80px 0", gap:16 }}>
//             <div style={{ width:28, height:28, borderRadius:"50%", border:`3px solid ${THEME.brandLight}`, borderTopColor:THEME.brand, animation:"aeSpin 0.8s linear infinite" }} />
//             <p style={{ color:THEME.textLight, fontSize:13, margin:0 }}>Saving…</p>
//           </div>
//         ) : (
//           <form onSubmit={handleSubmit(onSubmit)} noValidate>
//             <div className="ae-fade">

//               {/* ══════ 1. Personal Info ══════ */}
//               <CardSection title="Personal Information" icon="👤">
//                 <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:18 }}>
//                   <FormField label="First Name" required error={errors?.first_name?.message}>
//                     <input className={`ae-input${errors?.first_name?" error":""}`} type="text" placeholder="First name"
//                       {...register("first_name", { required:"Required", pattern:{ value:alphabetSpaceWithDot, message:"Letters only" } })} />
//                   </FormField>
//                   <FormField label="Last Name" required error={errors?.last_name?.message}>
//                     <input className={`ae-input${errors?.last_name?" error":""}`} type="text" placeholder="Last name"
//                       {...register("last_name", { required:"Required", pattern:{ value:alphabetSpaceWithDot, message:"Letters only" } })} />
//                   </FormField>
//                   <FormField label="Personal Email" required error={errors?.email?.message}>
//                     <input className={`ae-input${errors?.email?" error":""}`} type="text" placeholder="email@example.com"
//                       {...register("email", { required:"Required", pattern:{ value:mailPattern, message:"Invalid email" } })} />
//                   </FormField>
//                   <FormField label="Mobile Number" required error={errors?.phone?.message}>
//                     <input className={`ae-input${errors?.phone?" error":""}`} type="text" placeholder="10-digit mobile number"
//                       {...register("phone", { required:"Required", pattern:{ value:phonePattern, message:"10 digits required" } })} />
//                   </FormField>
//                   <FormField label="Date of Birth" error={errors?.dob?.message}>
//                     <input className={`ae-input${errors?.dob?" error":""}`} type="date" {...register("dob")} />
//                   </FormField>
//                 </div>
//               </CardSection>

//               {/* ══════ 2. Account Security ══════ */}
//               <CardSection title="Account Security" icon="🔒">
//                 <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:18 }}>
//                   <FormField label="Password" required error={errors?.password?.message}>
//                     <input className={`ae-input${errors?.password?" error":""}`} type="password" placeholder="Set a password"
//                       {...register("password", { required:"Required" })} />
//                   </FormField>
//                   <FormField label="Confirm Password" required error={errors?.confirm_password?.message}>
//                     <input className={`ae-input${errors?.confirm_password?" error":""}`} type="password" placeholder="Re-enter password"
//                       {...register("confirm_password", { required:"Required", validate:(val) => val === getValues("password") || "Passwords don't match" })} />
//                   </FormField>
//                 </div>
//               </CardSection>

//               {/* ══════ 3. Role & Department ══════ */}
//               <CardSection title="Role & Department" icon="🏢">
//                 <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:18 }}>
//                   <FormField label="Department" required error={errors?.departments?.message}>
//                     <div className={`ae-multiselect${errors?.departments?" error":""}`}>
//                       <Multiselect options={department} displayValue="name" onSelect={onSelect} onRemove={onRemove} placeholder="Select departments" {...register("departments", { required:"Required" })} />
//                     </div>
//                   </FormField>
//                   <FormField label="Roles" required error={errors?.roles?.message}>
//                     <div className={`ae-multiselect${errors?.roles?" error":""}`}>
//                       <Multiselect options={roles} displayValue="name" onSelect={onSelectRole} onRemove={onRemoveRole} placeholder="Select roles" {...register("roles", { required:"Required" })} />
//                     </div>
//                   </FormField>
//                 </div>
//               </CardSection>

//               {/* ══════ 4. HR Profile — Job Details ══════ */}
//               <CardSection title="HR Profile — Job Details" icon="💼">
//                 <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:18 }}>
//                   <FormField label="Job Title" required error={errors?.job_title?.message}>
//                     <input className={`ae-input${errors?.job_title?" error":""}`} type="text" placeholder="e.g. Senior Site Engineer"
//                       {...register("job_title", { required:"Required" })} />
//                   </FormField>
//                   <FormField label="Employee ID" error={errors?.employee_id?.message}>
//                     <input className="ae-input" type="text" placeholder="e.g. EMP-00142" {...register("employee_id")} />
//                   </FormField>
//                   <FormField label="Sub-Department">
//                     <input className="ae-input" type="text" placeholder="e.g. Architecture Team" {...register("sub_department")} />
//                   </FormField>
//                   <FormField label="Employment Type" required error={errors?.employment_type?.message}>
//                     <select className={`ae-input${errors?.employment_type?" error":""}`} {...register("employment_type", { required:"Required" })}>
//                       <option value="">Select type</option>
//                       <option value="Full-Time">Full-Time</option>
//                       <option value="Part-Time">Part-Time</option>
//                       <option value="Contract">Contract</option>
//                       <option value="Intern">Intern</option>
//                       <option value="Freelance">Freelance</option>
//                     </select>
//                   </FormField>
//                   <FormField label="Work Location">
//                     <select className="ae-input" {...register("work_location")}>
//                       <option value="">Select location</option>
//                       <option value="On-Site">On-Site</option>
//                       <option value="Remote">Remote</option>
//                       <option value="Hybrid">Hybrid</option>
//                     </select>
//                   </FormField>
//                   <FormField label="Reporting To">
//                     <input className="ae-input" type="text" placeholder="e.g. Priya Mehta (VP Engineering)" {...register("reporting_to")} />
//                   </FormField>
//                   <FormField label="Directly Coordinates With">
//                     <input className="ae-input" type="text" placeholder="e.g. Hely, Denish, PMC, consultants…" {...register("coordinates_with")} />
//                   </FormField>
//                   <FormField label="Date of Joining" required error={errors?.date_of_joining?.message}>
//                     <input className={`ae-input${errors?.date_of_joining?" error":""}`} type="date"
//                       {...register("date_of_joining", { required:"Required" })} />
//                   </FormField>
//                   <FormField label="Probation End Date">
//                     <input className="ae-input" type="date" {...register("probation_end_date")} />
//                   </FormField>
//                   <div style={{ gridColumn:"1 / -1" }}>
//                     <FieldLabel>Job Overview</FieldLabel>
//                     <textarea className="ae-textarea" placeholder="Brief description of this employee's role and purpose within the team…" {...register("job_overview")} />
//                   </div>
//                   <div style={{ gridColumn:"1 / -1" }}>
//                     <FieldLabel>Role Purpose</FieldLabel>
//                     <textarea className="ae-textarea" placeholder="Why does this role exist? What does it convert, enable, or protect for the organisation…" {...register("role_purpose")} />
//                   </div>
//                 </div>
//               </CardSection>

//               {/* ══════ 5. Key Responsibilities ══════ */}
//               <CardSection title="Key Responsibilities" icon="🎯">
//                 <FieldLabel>Add responsibilities (press Enter or comma to add each, or paste a list)</FieldLabel>
//                 <TagInput value={responsibilities} onChange={setResponsibilities} placeholder="e.g. Draft floor plans, Inspect structural work…" />
//                 <p style={{ margin:"6px 0 0", fontSize:11, color:THEME.textMuted }}>{responsibilities.length} responsibilit{responsibilities.length === 1 ? "y" : "ies"} added</p>
//               </CardSection>

//               {/* ══════ 6. Authority & Decision Rights ══════ */}
//               <CardSection title="Authority & Decision Rights" icon="🔐">
//                 <p style={{ margin:"0 0 16px", fontSize:12, color:THEME.textMuted, lineHeight:1.6 }}>
//                   Define what this role can decide independently, what must be escalated, and what is outside its authority.
//                 </p>
//                 <AuthorityBuilder value={authority} onChange={setAuthority} />
//               </CardSection>

//               {/* ══════ 7. Deliverables ══════ */}
//               <CardSection title="Deliverables" icon="📅">
//                 <p style={{ margin:"0 0 16px", fontSize:12, color:THEME.textMuted, lineHeight:1.6 }}>
//                   Define the expected outputs for this role across daily, weekly, and monthly cadences.
//                 </p>
//                 <DeliverablesBuilder value={deliverables} onChange={setDeliverables} />
//               </CardSection>

//               {/* ══════ 8. KPIs & Performance Metrics ══════ */}
//               <CardSection title="KPIs & Performance Metrics" icon="📊">
//                 <p style={{ margin:"0 0 16px", fontSize:12, color:THEME.textMuted, lineHeight:1.6 }}>
//                   Add measurable KPIs across Delivery, Team, Approval, System, or other categories.
//                 </p>
//                 <KpiBuilder value={kpis} onChange={setKpis} />
//               </CardSection>

//               {/* ══════ 9. Strengths & Weaknesses ══════ */}
//               <CardSection title="Strengths & Areas to Improve" icon="💪">
//                 <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
//                   <div>
//                     <FieldLabel>Strengths</FieldLabel>
//                     <TagInput value={strengths} onChange={setStrengths} placeholder="e.g. Problem solving, Leadership…" />
//                     <p style={{ margin:"5px 0 0", fontSize:11, color:THEME.textMuted }}>{strengths.length} strength{strengths.length !== 1 ? "s" : ""} added</p>
//                   </div>
//                   <div>
//                     <FieldLabel>Areas to Improve (Weaknesses)</FieldLabel>
//                     <TagInput value={weaknesses} onChange={setWeaknesses} placeholder="e.g. Overthinking, Public speaking…" />
//                     <p style={{ margin:"5px 0 0", fontSize:11, color:THEME.textMuted }}>{weaknesses.length} area{weaknesses.length !== 1 ? "s" : ""} added</p>
//                   </div>
//                 </div>
//               </CardSection>

//               {/* ══════ 10. Skills & Proficiency ══════ */}
//               <CardSection title="Skills & Proficiency" icon="⚡">
//                 <SkillBuilder value={skills} onChange={setSkills} />
//               </CardSection>

//               {/* ══════ 11. Growth Index ══════ */}
//               <CardSection title="Performance Growth Index" icon="📈">
//                 <p style={{ margin:"0 0 16px", fontSize:12, color:THEME.textMuted, lineHeight:1.6 }}>
//                   Rate where this team member currently stands and what the next level target is.
//                 </p>
//                 <GrowthIndexBuilder value={growthIndex} onChange={setGrowthIndex} />
//               </CardSection>

//               {/* ══════ 12. Development Risks & Warning Ladder ══════ */}
//               <CardSection title="Development Risks & Warning Ladder" icon="⚠️">
//                 <p style={{ margin:"0 0 16px", fontSize:12, color:THEME.textMuted, lineHeight:1.6 }}>
//                   Document early warning signals, the HR review ladder, and what this role is not responsible for.
//                 </p>
//                 <RisksAndWarningBuilder value={risksWarning} onChange={setRisksWarning} />
//               </CardSection>

//               {/* ══════ 13. Compensation & Payroll ══════ */}
//               <CardSection title="Compensation & Payroll" icon="💰">
//                 <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:18 }}>
//                   <FormField label="Annual CTC"><input className="ae-input" type="text" placeholder="e.g. ₹24,00,000" {...register("ctc")} /></FormField>
//                   <FormField label="Basic Salary"><input className="ae-input" type="text" placeholder="e.g. ₹10,00,000" {...register("basic_salary")} /></FormField>
//                   <FormField label="HRA"><input className="ae-input" type="text" placeholder="e.g. ₹4,00,000" {...register("hra")} /></FormField>
//                   <FormField label="Allowances"><input className="ae-input" type="text" placeholder="e.g. ₹3,00,000" {...register("allowances")} /></FormField>
//                   <FormField label="Annual Bonus"><input className="ae-input" type="text" placeholder="e.g. ₹2,00,000" {...register("bonus")} /></FormField>
//                   <FormField label="Pay Cycle">
//                     <select className="ae-input" {...register("pay_cycle")}>
//                       <option value="">Select cycle</option>
//                       <option value="Monthly">Monthly</option>
//                       <option value="Bi-Weekly">Bi-Weekly</option>
//                       <option value="Weekly">Weekly</option>
//                     </select>
//                   </FormField>
//                   <FormField label="Pay Mode">
//                     <select className="ae-input" {...register("pay_mode")}>
//                       <option value="">Select mode</option>
//                       <option value="Bank Transfer">Bank Transfer</option>
//                       <option value="Cheque">Cheque</option>
//                       <option value="Cash">Cash</option>
//                     </select>
//                   </FormField>
//                   <FormField label="Bank Account No."><input className="ae-input" type="text" placeholder="Account number" {...register("bank_account")} /></FormField>
//                 </div>
//               </CardSection>

//               {/* ══════ 14. Work History ══════ */}
//               <CardSection title="Work History" icon="🏢">
//                 <WorkHistoryBuilder value={workHistory} onChange={setWorkHistory} />
//               </CardSection>

//               {/* ══════ 15. Education ══════ */}
//               <CardSection title="Education" icon="🎓">
//                 <EducationBuilder value={education} onChange={setEducation} />
//               </CardSection>

//               {/* ══════ 16. Emergency Contacts ══════ */}
//               <CardSection title="Emergency Contacts" icon="🚨">
//                 <EmergencyBuilder value={emergency} onChange={setEmergency} />
//               </CardSection>

//               {/* ══════ 17. Resume / CV ══════ */}
//               <CardSection title="Resume / CV" icon="📄">
//                 <FieldLabel>Upload Resume</FieldLabel>
//                 <div className={`ae-resume-zone${resumeName?" has-file":""}`}>
//                   <input type="file" id="ae-resume" accept=".pdf,.doc,.docx" {...register("resume")} onChange={handleResumeChange} />
//                   <div style={{ width:42, height:42, borderRadius:10, background:"#fff", border:`1px solid ${THEME.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>📄</div>
//                   <div style={{ flex:1 }}>
//                     <p style={{ margin:0, fontSize:13, fontWeight:700, color:THEME.brand }}>{resumeName || "Click to upload resume"}</p>
//                     <p style={{ margin:"3px 0 0", fontSize:11, color:THEME.textMuted }}>{resumeName ? "Click to replace" : "PDF, DOC, DOCX · Max 5MB"}</p>
//                   </div>
//                   {resumeName && (
//                     <button type="button" style={{ background:"none", border:"none", cursor:"pointer", color:THEME.error, fontSize:20, flexShrink:0, lineHeight:1 }}
//                       onClick={() => { setResumeName(""); setValue("resume", undefined); }}>×</button>
//                   )}
//                 </div>
//               </CardSection>

//               {/* ══════ 18. Profile Picture ══════ */}
//               <CardSection title="Profile Picture" icon="🖼️">
//                 <div style={{ display:"flex", gap:24, alignItems:"flex-start", flexWrap:"wrap" }}>
//                   <input ref={fileInputRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFileChange} />
//                   <div className={`ae-upload-zone${isPreviewed?" has-img":""}`} style={{ flex:"1 1 260px", minWidth:220, maxWidth:360 }}
//                     onClick={() => fileInputRef.current?.click()}>
//                     <div style={{ width:44, height:44, borderRadius:12, background:"#fff", border:`1px solid #D4C4A0`, display:"flex", alignItems:"center", justifyContent:"center", color:THEME.brand }}>
//                       <ImageIcon style={{ width:22, height:22 }} />
//                     </div>
//                     <p style={{ margin:0, fontSize:13, fontWeight:600, color:THEME.brand }}>{isPreviewed ? "Click to change image" : "Click to upload image"}</p>
//                     <p style={{ margin:0, fontSize:11, color:THEME.textMuted }}>PNG, JPG, GIF supported</p>
//                   </div>
//                   {isPreviewed && previewSrc && (
//                     <div style={{ position:"relative" }}>
//                       <img src={previewSrc} alt="Preview" style={{ width:100, height:100, borderRadius:14, objectFit:"cover", border:`2px solid ${THEME.brandMid}`, boxShadow:`0 4px 14px ${THEME.brand}33` }} />
//                       <button type="button" onClick={clearProfilePic} style={{ position:"absolute", top:-8, right:-8, width:22, height:22, borderRadius:"50%", background:"#fff", border:"1.5px solid #FFA39E", color:"#CF1322", fontSize:12, fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
//                     </div>
//                   )}
//                 </div>
//                 {selectedFile && <p style={{ margin:"6px 0 0", fontSize:11, color:THEME.success }}>✓ {selectedFile.name} ready to upload</p>}
//               </CardSection>

//               {/* ── Actions ── */}
//               <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
//                 <SecondaryBtn onClick={() => navigate(`/${EmpRoute.list}`)}>← Back</SecondaryBtn>
//                 <PrimaryBtn type="submit">✓ Add Member</PrimaryBtn>
//               </div>
//             </div>
//           </form>
//         )}
//       </div>
//     </>
//   );
// };

// export default AddEmployee;


