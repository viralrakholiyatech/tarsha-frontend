import React, { useState, useEffect } from "react";
import { getToken } from "../../../services/useLocalStorage";
import toast from "react-hot-toast";
import { getCustomers } from "../../../services/CustomerService";
import axios from "axios";
import {
  getCategory,
  getVillage,
  fetchHod,
  gettpscheme,
  getProjectDetails,
  addNewFile,
  getCaseId,
  getProjectTypes,
  fetchActiveEmployee,
  fetchInteriorCatgory,
  fetcharchitectureCategory,
  getcity,
} from "../../../config/config";
import ApiService from "../../../services/ApiService";
import SubmitModal from "../../../components/SubmitModal";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { ApprovalRoute } from "../../../config/RouteConfig";

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
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }
  @keyframes afFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .af-fade { animation:afFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes afSpin { to{transform:rotate(360deg)} }
  .af-spinner { width:28px;height:28px;border-radius:50%;border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};animation:afSpin 0.8s linear infinite; }

  .af-input, .af-select {
    width:100%;padding:10px 13px;border-radius:10px;
    border:1.5px solid #E0D5C5;font-size:13px;
    font-family:'DM Sans',sans-serif;color:#1A1A2E;
    outline:none;background:#fff;appearance:auto;
    transition:border-color 0.15s,box-shadow 0.15s;
  }
  .af-input:focus,.af-select:focus { border-color:${THEME.brand};box-shadow:0 0 0 3px ${THEME.brand}18; }
  .af-input::placeholder { color:${THEME.textLight}; }
  .af-input[readonly] { background:#F9F7F4;color:${THEME.textMuted};cursor:default; }
  .af-input.error,.af-select.error { border-color:${THEME.errorBorder};background:${THEME.errorBg}; }

  /* Radio pills */
  .af-radio { display:none; }
  .af-radio-label {
    padding:7px 16px;border-radius:20px;cursor:pointer;
    font-size:12px;font-weight:600;border:1.5px solid #E0D5C5;
    background:#fff;color:#8C8C8C;transition:all 0.18s;
    font-family:'DM Sans',sans-serif;user-select:none;display:inline-block;
  }
  .af-radio:checked + .af-radio-label { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand}; }

  /* Dynamic rows table */
  .af-dt { width:100%;border-collapse:collapse;font-size:13px;font-family:'DM Sans',sans-serif; }
  .af-dt th { padding:10px 12px;font-size:11px;font-weight:700;color:${THEME.brandDark};text-transform:uppercase;letter-spacing:0.07em;background:${THEME.brandLight};border-bottom:2px solid #D4C4A0;white-space:nowrap; }
  .af-dt td { padding:8px 10px;border-bottom:1px solid #F5EFE4;vertical-align:middle; }
  .af-dt tbody tr:nth-child(even) { background:#FEFCF9; }

  ::-webkit-scrollbar{width:5px;height:5px;}
  ::-webkit-scrollbar-track{background:${THEME.brandLight};}
  ::-webkit-scrollbar-thumb{background:${THEME.brandMid};border-radius:10px;}
`;

const selectStyles = {
  control: (base, state) => ({
    ...base,
    border: `1.5px solid ${state.isFocused ? THEME.brand : "#E0D5C5"}`,
    borderRadius: 10,
    minHeight: 42,
    boxShadow: state.isFocused ? `0 0 0 3px ${THEME.brand}18` : "none",
    fontFamily: "'DM Sans',sans-serif",
    fontSize: 13,
    "&:hover": { borderColor: THEME.brand },
  }),
  option: (base, state) => ({
    ...base,
    background: state.isSelected
      ? THEME.brand
      : state.isFocused
        ? THEME.brandLight
        : "#fff",
    color: state.isSelected ? "#fff" : THEME.text,
    fontSize: 13,
    cursor: "pointer",
  }),
  placeholder: (base) => ({ ...base, color: THEME.textLight, fontSize: 13 }),
  singleValue: (base) => ({ ...base, color: THEME.text, fontSize: 13 }),
};

const PROJECT_OPTIONS = [
  { label: "Approval Process", value: "approval_process" },
  { label: "Architecture Design", value: "architecture_design" },
  { label: "Interior Design", value: "interior_design" },
];

const PROJECT_TITLES = {
  approval_process: "AP",
  architecture_design: "AD",
  interior_design: "ID",
};

const AUTHORITY_OPTIONS = [
  "Rander Zone",
  "Limbayat Zone",
  "Athwa Zone",
  "Udhana Zone",
  "Katargam Zone",
  "Central Zone",
  "CTDO",
  "BUADA",
  "Dhanera",
"Varachha Zone (East)",
"New Sarthana Zone",
"Bahumali",
 "Navsari",
"SUDA"
];

const EMPTY_FIELD = { project_name: "", assign_to_hod: "", days: "", date: "" };

// ─────────────────────────────────────────────
//  🧩  ATOMS
// ─────────────────────────────────────────────

function FieldLabel({ children, required }) {
  return (
    <label
      style={{
        display: "block",
        marginBottom: 5,
        fontSize: 11,
        fontWeight: 700,
        color: THEME.textMuted,
        textTransform: "uppercase",
        letterSpacing: "0.07em",
      }}
    >
      {children}
      {required && <span style={{ color: THEME.error, marginLeft: 3 }}>*</span>}
    </label>
  );
}

function ErrorMsg({ message }) {
  if (!message) return null;
  return (
    <p
      style={{
        margin: "4px 0 0",
        fontSize: 11,
        color: THEME.error,
        display: "flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      ⚠ {message}
    </p>
  );
}

function CardSection({ title, icon, children }) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${THEME.border}`,
        borderRadius: 14,
        padding: "20px 24px",
        marginBottom: 16,
        boxShadow: "0 2px 10px rgba(136,117,73,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            width: 3,
            height: 16,
            borderRadius: 2,
            background: `linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)`,
          }}
        />
        <h2
          style={{
            margin: 0,
            fontSize: 12,
            fontWeight: 700,
            color: THEME.brand,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            fontFamily: "'Sora',sans-serif",
          }}
        >
          {icon && <span style={{ marginRight: 6 }}>{icon}</span>}
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function Grid({ children, cols = 4 }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 14,
      }}
    >
      {children}
    </div>
  );
}

function RadioGroup({ name, value, options, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
      {options.map((opt) => (
        <React.Fragment key={opt.value}>
          <input
            type="radio"
            id={`${name}-${opt.value}`}
            name={name}
            value={opt.value}
            className="af-radio"
            checked={value === opt.value}
            onChange={onChange}
          />
          <label htmlFor={`${name}-${opt.value}`} className="af-radio-label">
            {opt.label}
          </label>
        </React.Fragment>
      ))}
    </div>
  );
}

function PrimaryBtn({ children, type = "button", onClick, disabled }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "10px 24px",
        borderRadius: 10,
        border: "none",
        background: disabled ? "#C4C4C4" : hov ? THEME.brandDark : THEME.brand,
        color: "#fff",
        fontSize: 13,
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "'Sora',sans-serif",
        transition: "all 0.18s",
        boxShadow: disabled ? "none" : `0 2px 8px ${THEME.brand}44`,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      {children}
    </button>
  );
}

function SecondaryBtn({ children, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "10px 24px",
        borderRadius: 10,
        border: `1.5px solid ${hov ? THEME.brand : "#E0D5C5"}`,
        background: hov ? THEME.brandLight : "#fff",
        color: hov ? THEME.brand : "#595959",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "'DM Sans',sans-serif",
        transition: "all 0.18s",
      }}
    >
      {children}
    </button>
  );
}

function GhostBtn({ children, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "7px 14px",
        borderRadius: 8,
        border: `1.5px solid ${hov ? THEME.brand : "#E0D5C5"}`,
        background: hov ? THEME.brandLight : "#fff",
        color: hov ? THEME.brand : "#595959",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "'DM Sans',sans-serif",
        transition: "all 0.18s",
      }}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
function AddFile() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [FileId, setFileId] = useState(1);
  const [fileName, setFileName] = useState("");
  const [errors, setErrors] = useState({});
  const [dynErrors, setDynErrors] = useState([
    { project_name: "", assign_to_hod: "", days: "", date: "" },
  ]);

  // Lookup data
  const [custData, setCustData] = useState([]);
  const [projecttype, setProjecttype] = useState([]);
  const [villages, setVillages] = useState([]);
  const [city,setCity]= useState([])
  const [tpscheme, setTpscheme] = useState([]);
  const [hod, setHoD] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [archdata, setArchData] = useState([]);

  const [project, setProject] = useState({
    client_id: "",
    company_name: "",
    email: "",
    phone: "",
    project_name: "",
    project_type: "",
    category: "",
    archcategory: "",
    authority: "",
    address: "",
    google_location: "",
    lat: "",
    long: "",
    land_type: "",
    village: "",
    city:"",
    tpscheme: "",
    op_no: "",
    fp_no: "",
    moje: "",
    rs_no: "",
    ward_no: "",
    cs_no: "",
    b_no: "",
    file_type: "",
    fire_noc: "",
    writeMonth: "",
    writeYear: "",
    selectedFile: "",
    tentative_design: "",
    tentative_types: [],
  });

  const [dynamicFields, setDynamicFields] = useState([{ ...EMPTY_FIELD }]);

  // ── Load data in parallel ─────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const h = { Authorization: `Bearer ${getToken()}` };
        const hj = {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        };

        const [custRes, ptRes, hodRes, vilRes,cityRes, tpRes, caseRes] =
          await Promise.all([
            getCustomers(getToken()),
            ApiService(null, 0, h, getCategory.method, getCategory.url),
            ApiService(null, 0, h, fetchHod.method, fetchHod.url),
            ApiService(null, 0, hj, getVillage.method, getVillage.url),
            ApiService(null,0,hj,getcity.method,getcity.url),
            ApiService(null, 0, hj, gettpscheme.method, gettpscheme.url),
            ApiService(null, 0, h, getCaseId.method, getCaseId.url),
          ]);

        if (!custRes.data.error) setCustData(custRes.data.data || []);
        if (!ptRes.data.error)
          setProjecttype(
            (ptRes.data.data || []).map((d) => ({
              value: d.id,
              label: d.name,
            })),
          );
        if (!hodRes.data.error) setHoD(hodRes.data.data || []);
        if (!vilRes.data.error)
          setVillages(
            (vilRes.data.data || []).map((d) => ({
              value: d.id,
              label: d.name,
            })),
          );
          if(!cityRes.data.error)
            setCity((cityRes.data.data || []).map((d) => ({
              value: d.id,
              label: d.name,
            })),
          );
        if (!tpRes.data.error)
          setTpscheme(
            (tpRes.data.data || []).map((d) => ({
              value: d.id,
              label: d.tpscheme,
            })),
          );
        if (!caseRes.data.error) setFileId(caseRes.data.data?.[0]?.id ?? 0);

        const [catRes, archRes] = await Promise.all([
          axios.get(fetchInteriorCatgory.url, {
            headers: { Authorization: `Bearer ${getToken()}` },
          }),
          axios.get(fetcharchitectureCategory.url, {
            headers: { Authorization: `Bearer ${getToken()}` },
          }),
        ]);
        setCategoryData(
          (catRes.data.data || []).map((d) => ({ value: d.id, label: d.name })),
        );
        setArchData(
          (archRes.data.data || []).map((d) => ({
            value: d.id,
            label: d.name,
          })),
        );
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const FileIds = (FileId === undefined || FileId === null ? 0 : FileId) + 1;

  const handleInput = (e, actionMeta) => {
    let name, value;
    if (actionMeta) {
      name = actionMeta.name;
      value = e ? e.value : "";
    } else {
      name = e.target.name;
      value = e.target.value;
    }
    setProject((p) => {
      const next = { ...p, [name]: value };
      if (name === "client_id") {
        const c = custData.find((x) => x.id === parseInt(value));
        next.company_name = c?.company_name || "";
        next.email = c?.email || "";
        next.phone = c?.phone || "";
      }
      if (name === "tentative_design" && value !== "yes") {
        next.tentative_types = [];
      }
      return next;
    });
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleTentativeTypeToggle = (value) => {
    setProject((p) => {
      const exists = p.tentative_types.includes(value);
      return {
        ...p,
        tentative_types: exists
          ? p.tentative_types.filter((v) => v !== value)
          : [...p.tentative_types, value],
      };
    });
  };

  const handleDynamicChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...dynamicFields];
    updated[index][name] = value;
    if (name === "project_name") {
      setFileName(
        updated.map((f) => PROJECT_TITLES[f.project_name] || "").join(""),
      );
    }
    setDynamicFields(updated);
    setDynErrors((prev) => {
      const next = [...prev];
      if (next[index]) next[index] = { ...next[index], [name]: "" };
      return next;
    });
  };

  const addField = () => {
    setDynamicFields((p) => [...p, { ...EMPTY_FIELD }]);
    setDynErrors((p) => [
      ...p,
      { project_name: "", assign_to_hod: "", days: "", date: "" },
    ]);
  };

  const removeField = (index) => {
    const updated = dynamicFields.filter((_, i) => i !== index);
    setFileName(
      updated.map((f) => PROJECT_TITLES[f.project_name] || "").join(""),
    );
    setDynamicFields(updated);
    setDynErrors((p) => p.filter((_, i) => i !== index));
  };

  const selectedProjectNames = dynamicFields.map((f) => f.project_name);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const now = new Date();
    const monthMap = {
      Jan: "01",
      Feb: "02",
      Mar: "03",
      Apr: "04",
      May: "05",
      Jun: "06",
      Jul: "07",
      Aug: "08",
      Sep: "09",
      Oct: "10",
      Nov: "11",
      Dec: "12",
    };
    const monthName = now.toLocaleString("default", { month: "short" });
    const month = monthMap[monthName] || "01";
    const year = now.getFullYear();
    const caseNumber = `ZED/PR0${project.writeMonth || month}${project.writeYear || year}/00${project.selectedFile || FileIds}/${fileName}`;

    const newErrors = {};
    if (!project.client_id) newErrors.client_id = "Client is required";
    if (!project.project_name?.trim())
      newErrors.project_name = "Project name is required";
    if (!project.address?.trim()) newErrors.address = "Address is required";
    if (!project.google_location?.trim())
      newErrors.google_location = "Google location is required";
    if (!project.project_type)
      newErrors.project_type = "Project type is required";

    // const dynE = dynamicFields.map((f) => ({
    //   project_name: !f.project_name ? "Required" : "",
    //   assign_to_hod: !f.assign_to_hod ? "Required" : "",
    //   days: !f.days ? "Required" : "",
    // }));
    // const hasDynErr = dynE.some(
    //   (e) => e.project_name || e.assign_to_hod || e.days,
    // );

    const isTentative = project.tentative_design === "yes";
    if (isTentative && project.tentative_types.length === 0) {
      newErrors.tentative_types = "Select at least one tentative type";
    }

    const dynE = dynamicFields.map((f) => ({
      project_name: !isTentative && !f.project_name ? "Required" : "",
      assign_to_hod: !isTentative && !f.assign_to_hod ? "Required" : "",
      days: !isTentative && !f.days ? "Required" : "",
      date: !isTentative && !f.date ? "Required" : "",
    }));
    const hasDynErr =
      !isTentative &&
      dynE.some((e) => e.project_name || e.assign_to_hod || e.days || e.date);

    if (Object.keys(newErrors).length || hasDynErr) {
      setErrors(newErrors);
      setDynErrors(dynE);
      return;
    }

    setSubmitting(true);
    try {
      const header = {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      };
      const res = await ApiService(
        {
          ...project,
          dynamicFields,
          caseId: caseNumber,
          tentative_design: project.tentative_design,
          tentative_types:
            project.tentative_design === "yes" ? project.tentative_types : [],
        },
        0,
        header,
        addNewFile.method,
        addNewFile.url,
      );
      if (res.status === 201) {
        toast.success("File added successfully");
        setShowModal(true);
      } else {
        toast.error("Failed to add file");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: THEME.bg,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <div className="af-spinner" />
        <p style={{ color: THEME.textLight, fontSize: 13 }}>Loading data…</p>
      </div>
    );
  }

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div
        style={{
          minHeight: "100vh",
          background: THEME.bg,
          fontFamily: "'DM Sans',sans-serif",
          padding: "28px 24px",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 4,
              height: 26,
              borderRadius: 3,
              background: `linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)`,
            }}
          />
          <h1
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 800,
              color: THEME.text,
              fontFamily: "'Sora',sans-serif",
              letterSpacing: "-0.3px",
            }}
          >
            Add New File
          </h1>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="af-fade">
            {/* ── 1. Client Details ── */}
            <CardSection title="Client Details" icon="👤">
              <Grid>
                <div>
                  <FieldLabel required>Client Name</FieldLabel>
                  <select
                    className={`af-select${errors.client_id ? " error" : ""}`}
                    name="client_id"
                    onChange={handleInput}
                    value={project.client_id}
                  >
                    <option value="">-- Select --</option>
                    {custData.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.first_name} {r.last_name}
                      </option>
                    ))}
                  </select>
                  <ErrorMsg message={errors.client_id} />
                </div>
                <div>
                  <FieldLabel>Company Name</FieldLabel>
                  <input
                    className="af-input"
                    type="text"
                    value={project.company_name}
                    readOnly
                  />
                </div>
                <div>
                  <FieldLabel>Email ID</FieldLabel>
                  <input
                    className="af-input"
                    type="email"
                    value={project.email}
                    readOnly
                  />
                </div>
                <div>
                  <FieldLabel>Phone No.</FieldLabel>
                  <input
                    className="af-input"
                    type="text"
                    value={project.phone}
                    readOnly
                  />
                </div>
              </Grid>
            </CardSection>

            {/* ── 2. Project Details ── */}
            <CardSection title="Project Details" icon="📋">
              <Grid>
                <div>
                  <FieldLabel required>Project Name</FieldLabel>
                  <input
                    className={`af-input${errors.project_name ? " error" : ""}`}
                    type="text"
                    name="project_name"
                    placeholder="Enter name…"
                    onChange={handleInput}
                    value={project.project_name}
                  />
                  <ErrorMsg message={errors.project_name} />
                </div>
                <div>
                  <FieldLabel required>Project Type</FieldLabel>
                  <Select
                    options={projecttype}
                    isSearchable
                    placeholder="Select type…"
                    styles={selectStyles}
                    value={
                      projecttype.find(
                        (o) => o.value === project.project_type,
                      ) || null
                    }
                    onChange={(opt) =>
                      handleInput(opt, { name: "project_type" })
                    }
                  />
                  <ErrorMsg message={errors.project_type} />
                </div>
                <div>
                  <FieldLabel>Interior Category</FieldLabel>
                  <Select
                    options={categoryData}
                    isSearchable
                    placeholder="Select…"
                    styles={selectStyles}
                    value={
                      categoryData.find((o) => o.value === project.category) ||
                      null
                    }
                    onChange={(opt) => handleInput(opt, { name: "category" })}
                  />
                </div>
                <div>
                  <FieldLabel>Architecture Category</FieldLabel>
                  <Select
                    options={archdata}
                    isSearchable
                    placeholder="Select…"
                    styles={selectStyles}
                    value={
                      archdata.find((o) => o.value === project.archcategory) ||
                      null
                    }
                    onChange={(opt) =>
                      handleInput(opt, { name: "archcategory" })
                    }
                  />
                </div>
                <div>
                  <FieldLabel>Authority</FieldLabel>
                  <select
                    className="af-select"
                    name="authority"
                    onChange={handleInput}
                    value={project.authority}
                  >
                    <option value="">-- Select --</option>
                    {AUTHORITY_OPTIONS.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <FieldLabel required>Address</FieldLabel>
                  <input
                    className={`af-input${errors.address ? " error" : ""}`}
                    type="text"
                    name="address"
                    placeholder="Enter address…"
                    onChange={handleInput}
                    value={project.address}
                  />
                  <ErrorMsg message={errors.address} />
                </div>
                <div>
                  <FieldLabel required>Google Location</FieldLabel>
                  <input
                    className={`af-input${errors.google_location ? " error" : ""}`}
                    type="text"
                    name="google_location"
                    placeholder="Paste link…"
                    onChange={handleInput}
                    value={project.google_location}
                  />
                  <ErrorMsg message={errors.google_location} />
                </div>
                <div>
                  <FieldLabel>Latitude</FieldLabel>
                  <input
                    className="af-input"
                    type="text"
                    name="lat"
                    placeholder="e.g. 21.17"
                    onChange={handleInput}
                    value={project.lat}
                  />
                </div>
                <div>
                  <FieldLabel>Longitude</FieldLabel>
                  <input
                    className="af-input"
                    type="text"
                    name="long"
                    placeholder="e.g. 72.83"
                    onChange={handleInput}
                    value={project.long}
                  />
                </div>
              </Grid>
            </CardSection>

            {/* ── 3. Land Details ── */}
            <CardSection title="Land Details" icon="🗺️">
              <Grid>
                <div>
                  <FieldLabel>Village</FieldLabel>
                  <Select
                    options={villages}
                    isSearchable
                    placeholder="Select village…"
                    styles={selectStyles}
                    value={
                      villages.find((o) => o.value === project.village) || null
                    }
                    onChange={(opt) => handleInput(opt, { name: "village" })}
                  />
                </div>

                  <div>
                  <FieldLabel>City</FieldLabel>
                  <Select
                    options={city}
                    isSearchable
                    placeholder="Select city.."
                    styles={selectStyles}
                    value={
                      city.find((o) => o.value === project.city) || null
                    }
                    onChange={(opt) => handleInput(opt, { name: "city" })}
                  />
                </div>
                <div>
                  <FieldLabel>Land Type</FieldLabel>
                  <select
                    className={`af-select`}
                    name="land_type"
                    onChange={handleInput}
                    value={project.land_type}
                  >
                    <option value="">Select type</option>
                    <option value="tp">TP</option>
                    <option value="non_tp">NON TP</option>
                    <option value="gamtal">GAMTAL</option>
                  </select>
               
                </div>
              </Grid>

              {/* TP Fields */}
              {project.land_type === "tp" && (
                <Grid style={{ marginTop: 14 }}>
                  <div>
                    <FieldLabel>TP Scheme</FieldLabel>
                    <Select
                      options={tpscheme}
                      isSearchable
                      placeholder="Select…"
                      styles={selectStyles}
                      value={
                        tpscheme.find((o) => o.value === project.tpscheme) ||
                        null
                      }
                      onChange={(opt) => handleInput(opt, { name: "tpscheme" })}
                    />
                  </div>
                  {[
                    ["op_no", "O.P. No."],
                    ["fp_no", "F.P. No."],
                    ["b_no", "B. No."],
                    ["rs_no", "R.S. No."],
                  ].map(([n, l]) => (
                    <div key={n}>
                      <FieldLabel>{l}</FieldLabel>
                      <input
                        className="af-input"
                        name={n}
                        placeholder="Type…"
                        onChange={handleInput}
                        value={project[n]}
                      />
                    </div>
                  ))}
                </Grid>
              )}

              {project.land_type === "non_tp" && (
                <Grid style={{ marginTop: 14 }}>
                  {[
                    ["moje", "Moje"],
                    ["b_no", "B. No."],
                    ["rs_no", "R.S. No."],
                  ].map(([n, l]) => (
                    <div key={n}>
                      <FieldLabel>{l}</FieldLabel>
                      <input
                        className="af-input"
                        name={n}
                        placeholder="Type…"
                        onChange={handleInput}
                        value={project[n]}
                      />
                    </div>
                  ))}
                </Grid>
              )}

              {project.land_type === "gamtal" && (
                <Grid style={{ marginTop: 14 }}>
                  {[
                    ["ward_no", "Ward No."],
                    ["cs_no", "C.S. No."],
                    ["b_no", "B. No."],
                    ["rs_no", "R.S. No."],
                  ].map(([n, l]) => (
                    <div key={n}>
                      <FieldLabel>{l}</FieldLabel>
                      <input
                        className="af-input"
                        name={n}
                        placeholder="Type…"
                        onChange={handleInput}
                        value={project[n]}
                      />
                    </div>
                  ))}
                </Grid>
              )}
            </CardSection>

            {/* ── 4. File ID ── */}
            <CardSection title="File ID" icon="🗂️">
              <Grid>
                <div>
                  <FieldLabel>Month</FieldLabel>
                  <input
                    className="af-input"
                    type="text"
                    name="writeMonth"
                    placeholder="e.g. 03"
                    onChange={handleInput}
                    value={project.writeMonth}
                  />
                </div>
                <div>
                  <FieldLabel>Year</FieldLabel>
                  <input
                    className="af-input"
                    type="text"
                    name="writeYear"
                    placeholder="e.g. 2025"
                    onChange={handleInput}
                    value={project.writeYear}
                  />
                </div>
                <div>
                  <FieldLabel>File ID Override</FieldLabel>
                  <input
                    className="af-input"
                    type="text"
                    name="selectedFile"
                    placeholder={`Auto: ${FileIds}`}
                    onChange={handleInput}
                    value={project.selectedFile}
                  />
                </div>
                {fileName && (
                  <div style={{ gridColumn: "span 1" }}>
                    <FieldLabel>Case No. Preview</FieldLabel>
                    <div
                      style={{
                        padding: "10px 13px",
                        borderRadius: 10,
                        background: THEME.brandLight,
                        border: `1px solid #D4C4A0`,
                        fontSize: 12,
                        fontWeight: 700,
                        color: THEME.brandDark,
                        fontFamily: "'Sora',sans-serif",
                      }}
                    >
                      ZED/PR0{project.writeMonth || "--"}
                      {project.writeYear || "--"}/00
                      {project.selectedFile || FileIds}/{fileName}
                    </div>
                  </div>
                )}
              </Grid>
            </CardSection>

            {/* ── 5. Project Assignment ── */}
            <CardSection title="Project Assignment" icon="👥">
              <div
                style={{
                  overflowX: "auto",
                  borderRadius: 10,
                  border: `1px solid ${THEME.border}`,
                  marginBottom: 12,
                }}
              >
                <table className="af-dt">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Application Name</th>
                      <th>Assign HOD</th>
                      <th>No. of Days</th>
                      <th>Start Date</th>
                      <th style={{ width: 44 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {dynamicFields.map((field, idx) => (
                      <tr key={idx}>
                        <td
                          style={{
                            color: THEME.textMuted,
                            fontWeight: 700,
                            fontSize: 12,
                            width: 36,
                          }}
                        >
                          {idx + 1}
                        </td>
                        <td style={{ minWidth: 180 }}>
                          <select
                            className={`af-select${dynErrors[idx]?.project_name ? " error" : ""}`}
                            name="project_name"
                            onChange={(e) => handleDynamicChange(idx, e)}
                            value={field.project_name}
                          >
                            <option value="">-- Select --</option>
                            {PROJECT_OPTIONS.map((opt) => (
                              <option
                                key={opt.value}
                                value={opt.value}
                                disabled={
                                  selectedProjectNames.includes(opt.value) &&
                                  field.project_name !== opt.value
                                }
                              >
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <ErrorMsg message={dynErrors[idx]?.project_name} />
                        </td>
                        <td style={{ minWidth: 160 }}>
                          <select
                            className={`af-select${dynErrors[idx]?.assign_to_hod ? " error" : ""}`}
                            name="assign_to_hod"
                            onChange={(e) => handleDynamicChange(idx, e)}
                            value={field.assign_to_hod}
                          >
                            <option value="">-- Select --</option>
                            {hod.map((h) => (
                              <option key={h.id} value={h.id}>
                                {h.first_name} {h.last_name}
                              </option>
                            ))}
                          </select>
                          <ErrorMsg message={dynErrors[idx]?.assign_to_hod} />
                        </td>
                        <td style={{ minWidth: 100 }}>
                          <input
                            className={`af-input${dynErrors[idx]?.days ? " error" : ""}`}
                            type="number"
                            name="days"
                            placeholder="Days"
                            onChange={(e) => handleDynamicChange(idx, e)}
                            value={field.days}
                          />
                          <ErrorMsg message={dynErrors[idx]?.days} />
                        </td>
                        <td style={{ minWidth: 150 }}>
                          <input
                            className={`af-input${dynErrors[idx]?.date ? " error" : ""}`}
                            type="date"
                            name="date"
                            onChange={(e) => handleDynamicChange(idx, e)}
                            value={field.date}
                          />
                          <ErrorMsg message={dynErrors[idx]?.date} />
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => removeField(idx)}
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 7,
                                border: "1.5px solid #FFA39E",
                                background: "#FFF1F0",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#CF1322",
                                fontSize: 14,
                                transition: "all 0.15s",
                              }}
                            >
                              ×
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <GhostBtn onClick={addField}>+ Add Row</GhostBtn>
              </div>
            </CardSection>

            {/* ── 6. Options ── */}
            <CardSection title="Additional Options" icon="⚙️">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: 20,
                }}
              >
                <div
                  style={{
                    gridColumn:
                      project.tentative_design === "yes" ? "span 2" : "auto",
                  }}
                >
                  <FieldLabel>Tentative Design</FieldLabel>
                  <RadioGroup
                    name="tentative_design"
                    value={project.tentative_design}
                    onChange={handleInput}
                    options={[
                      { value: "yes", label: "✅ Yes" },
                      { value: "no", label: "❌ No" },
                    ]}
                  />

                  {project.tentative_design === "yes" && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: "12px 14px",
                        background: THEME.brandLight,
                        border: `1px dashed ${THEME.brandMid}`,
                        borderRadius: 10,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: THEME.brandDark,
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                          marginBottom: 8,
                        }}
                      >
                        Select Tentative Type(s)
                      </div>
                      <div
                        style={{ display: "flex", gap: 16, flexWrap: "wrap" }}
                      >
                        {[
                          { value: "architecture", label: "Architecture" },
                          { value: "interior", label: "Interior" },
                          { value: "approval", label: "Approval" },
                        ].map((opt) => {
                          const checked = project.tentative_types.includes(
                            opt.value,
                          );
                          return (
                            <label
                              key={opt.value}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "7px 14px",
                                borderRadius: 20,
                                border: `1.5px solid ${checked ? THEME.brand : "#E0D5C5"}`,
                                background: checked ? "#fff" : "#fff",
                                color: checked ? THEME.brand : "#595959",
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                                userSelect: "none",
                                transition: "all 0.18s",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() =>
                                  handleTentativeTypeToggle(opt.value)
                                }
                                style={{
                                  accentColor: THEME.brand,
                                  width: 15,
                                  height: 15,
                                  cursor: "pointer",
                                }}
                              />
                              {opt.label}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <FieldLabel>File Type</FieldLabel>
                  <RadioGroup
                    name="file_type"
                    value={project.file_type}
                    onChange={handleInput}
                    options={[
                      { value: "online", label: "🌐 Online" },
                      { value: "offline", label: "📁 Offline" },
                    ]}
                  />
                </div>
                <div>
                  <FieldLabel>Fire NOC</FieldLabel>
                  <RadioGroup
                    name="fire_noc"
                    value={project.fire_noc}
                    onChange={handleInput}
                    options={[
                      { value: "yes", label: "🔥 Yes" },
                      { value: "no", label: "—  No" },
                    ]}
                  />
                </div>
              </div>
            </CardSection>

            {/* ── Actions ── */}
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}
            >
              <SecondaryBtn
                onClick={() => navigate(`/${ApprovalRoute.approval_list}`)}
              >
                ← Back
              </SecondaryBtn>
              <PrimaryBtn type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        border: "2px solid #ffffff88",
                        borderTopColor: "#fff",
                        display: "inline-block",
                        animation: "afSpin 0.7s linear infinite",
                      }}
                    />
                    Saving…
                  </>
                ) : (
                  "✓ Add File"
                )}
              </PrimaryBtn>
            </div>
          </div>
        </form>
      </div>

      <SubmitModal
        show={showModal}
        handleClose={() => {
          setShowModal(false);
          window.location.reload();
        }}
        fileId={FileIds}
        MonthId={project.writeMonth}
        YearId={project.writeYear}
        selectedFileID={project.selectedFile}
        fileName={fileName}
      />
    </>
  );
}

export default AddFile;
