import React, { useState, useEffect } from "react";
import { getToken, isEmp } from "../../../services/useLocalStorage";
import toast from "react-hot-toast";
import { getCustomers } from "../../../services/CustomerService";
import axios from "axios";
import {
  getCategory,
  getVillage,
  gettpscheme,
  updateNewFile,
  getNewFilesById,
  fetchInteriorCatgory,
  fetcharchitectureCategory,
  getcity,
} from "../../../config/config";
import ApiService from "../../../services/ApiService";
import { useParams, useNavigate } from "react-router-dom";
import { TentativeRoute } from "../../../config/RouteConfig";

// ─────────────────────────────────────────────
//  🎨  THEME (matches Approval Edit)
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
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }
  @keyframes efFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .ef-fade { animation:efFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes efSpin { to{transform:rotate(360deg)} }
  .ef-spinner { width:28px;height:28px;border-radius:50%;border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};animation:efSpin 0.8s linear infinite; }

  @keyframes overlayFadeIn { from{opacity:0} to{opacity:1} }
  @keyframes modalSlideIn { from{opacity:0;transform:scale(0.95) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }

  .ef-input, .ef-select {
    width: 100%;
    padding: 9px 13px;
    border-radius: 9px;
    border: 1.5px solid ${THEME.border};
    background: #fff;
    color: ${THEME.text};
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: border-color 0.18s, box-shadow 0.18s;
  }
  .ef-input:focus, .ef-select:focus {
    border-color: ${THEME.brand};
    box-shadow: 0 0 0 3px rgba(136,117,73,0.12);
  }
  .ef-input[readonly], .ef-select:disabled {
    background: #FAF8F5;
    color: #7A7A7A;
    cursor: not-allowed;
  }
`;

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
  "SUDA",
];

// ─────────────────────────────────────────────
//  CONFIRM SAVE MODAL
// ─────────────────────────────────────────────
function SaveConfirmModal({ onConfirm, onCancel, saving }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(26,26,46,0.45)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "overlayFadeIn 0.2s ease both",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "28px 32px",
          width: 380,
          maxWidth: "90vw",
          boxShadow: "0 20px 60px rgba(26,26,46,0.2)",
          animation: "modalSlideIn 0.22s cubic-bezier(0.4,0,0.2,1) both",
          textAlign: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: THEME.brandLight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <span style={{ fontSize: 24 }}>💾</span>
        </div>

        <h3
          style={{
            margin: "0 0 6px",
            fontSize: 17,
            fontWeight: 700,
            color: THEME.text,
            fontFamily: "'Sora',sans-serif",
          }}
        >
          Save Changes?
        </h3>
        <p
          style={{
            margin: "0 0 24px",
            fontSize: 13,
            color: THEME.textMuted,
            lineHeight: 1.5,
          }}
        >
          Are you sure you want to update this tentative project?
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 10,
              border: "1.5px solid #E0D5C5",
              background: "#fff",
              color: "#595959",
              fontSize: 13,
              fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer",
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={saving}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 10,
              border: "none",
              background: saving ? "#C4C4C4" : THEME.brand,
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
              fontFamily: "'Sora',sans-serif",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {saving ? (
              <>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    border: "2px solid #ffffff88",
                    borderTopColor: "#fff",
                    animation: "efSpin 0.7s linear infinite",
                  }}
                />
                Saving…
              </>
            ) : (
              "Yes, Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  FORM ATOMS
// ─────────────────────────────────────────────
function FieldLabel({ children, required }) {
  return (
    <label
      style={{
        display: "block",
        fontSize: 11,
        fontWeight: 700,
        color: THEME.brandDark,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        marginBottom: 5,
        fontFamily: "'DM Sans',sans-serif",
      }}
    >
      {children}
      {required && <span style={{ color: THEME.error, marginLeft: 3 }}>*</span>}
    </label>
  );
}

function CardSection({ title, icon, children }) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${THEME.border}`,
        borderRadius: 14,
        padding: "22px 24px",
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
          paddingBottom: 12,
          borderBottom: `1px solid ${THEME.border}`,
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

function Grid({ children, style }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 14,
        ...style,
      }}
    >
      {children}
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

function RadioGroup({ name, value, onChange, options, disabled }) {
  return (
    <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
      {options.map((opt) => (
        <label
          key={opt.value}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            cursor: disabled ? "not-allowed" : "pointer",
            fontFamily: "'DM Sans', sans-serif",
            color: THEME.text,
            userSelect: "none",
          }}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={onChange}
            disabled={disabled}
            style={{ accentColor: THEME.brand, cursor: "pointer" }}
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
//  🚀  MAIN EDIT TENTATIVE COMPONENT
// ─────────────────────────────────────────────
function EditTentative() {
  const params = useParams();
  const navigate = useNavigate();
  const header = {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveModal, setSaveModal] = useState(false);

  const [custData, setCustData] = useState([]);
  const [projecttype, setProjecttype] = useState([]);
  const [villages, setVillages] = useState([]);
  const [city, setCity] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [archdata, setArchData] = useState([]);
  const [tpscheme, setTpscheme] = useState([]);

  const [project, setProject] = useState({
    case_id: "",
    client_id: "",
    company_name: "",
    email: "",
    phone: "",
    project_name: "",
    project_type: "",
    category: "",
    archcategory: "",
    authority: "",
    file_type: "online",
    fire_noc: "no",
    tentative_design: "yes",
    tentative_types: [],
    address: "",
    google_location: "",
    lat: "",
    long: "",
    land_type: "",
    village: "",
    city: "",
    tpscheme: "",
    op_no: "",
    fp_no: "",
    moje: "",
    rs_no: "",
    ward_no: "",
    cs_no: "",
    b_no: "",
  });

  const topDisabled = isEmp();

  // ── Load All Master & Record Data ──────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const h = { Authorization: `Bearer ${getToken()}` };
        const hj = {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        };

        const [custRes, ptRes, vilRes, cityRes, tpRes, catRes, archRes] =
          await Promise.all([
            getCustomers(getToken()),
            ApiService(null, 0, h, getCategory.method, getCategory.url),
            ApiService(null, 0, hj, getVillage.method, getVillage.url),
            ApiService(null, 0, hj, getcity.method, getcity.url),
            ApiService(null, 0, hj, gettpscheme.method, gettpscheme.url),
            axios.get(fetchInteriorCatgory.url, {
              headers: { Authorization: `Bearer ${getToken()}` },
            }),
            axios.get(fetcharchitectureCategory.url, {
              headers: { Authorization: `Bearer ${getToken()}` },
            }),
          ]);

        if (!custRes.data.error) setCustData(custRes.data.data || []);
        if (!ptRes.data.error) setProjecttype(ptRes.data.data || []);
        if (!vilRes.data.error) setVillages(vilRes.data.data || []);
        if (!cityRes.data.error) setCity(cityRes.data.data || []);
        if (!tpRes.data.error) setTpscheme(tpRes.data.data || []);
        setCategoryData(catRes.data?.data || []);
        setArchData(archRes.data?.data || []);

        // Load Record Data
        const dataRes = await ApiService(
          null,
          params.id,
          hj,
          getNewFilesById.method,
          getNewFilesById.url,
        );

        if (!dataRes.data?.error) {
          const Data = dataRes.data.data;
          const d0 = Data[0] || {};

          // Parse tentative types
          let parsedTypes = [];
          if (Array.isArray(d0.tentative_types)) {
            parsedTypes = d0.tentative_types;
          } else if (typeof d0.tentative_types === "string" && d0.tentative_types.trim()) {
            parsedTypes = d0.tentative_types
              .split(",")
              .map((s) => s.trim().toLowerCase())
              .filter(Boolean);
          }

          setProject({
            case_id: d0.case_id || "",
            client_id: d0.client_id || "",
            company_name: d0.company_name || "",
            email: d0.email || "",
            phone: d0.phone || "",
            project_name: d0.project_name || "",
            project_type: d0.project_type || "",
            category: d0.category || "",
            archcategory: d0.archcategory || "",
            authority: d0.authority || "",
            file_type: d0.file_type || "online",
            fire_noc: d0.fire_noc || "no",
            tentative_design: d0.tentative_design || "yes",
            tentative_types: parsedTypes,
            address: d0.address || "",
            google_location: d0.google_location || "",
            lat: d0.lat || "",
            long: d0.long || "",
            land_type: d0.land_type || "",
            village: d0.village || "",
            city: d0.city || "",
            tpscheme: d0.tpscheme || "",
            op_no: d0.op_no || "",
            fp_no: d0.fp_no || "",
            moje: d0.moje || "",
            rs_no: d0.rs_no || "",
            ward_no: d0.ward_no || "",
            cs_no: d0.cs_no || "",
            b_no: d0.b_no || "",
          });
        }
      } catch (e) {
        console.error(e);
        toast.error("Failed to load project details");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id]);

  const handleInput = (e) => {
    const { name, value } = e.target;
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
  };

  const handleTentativeTypeToggle = (value) => {
    setProject((p) => {
      const current = Array.isArray(p.tentative_types) ? p.tentative_types : [];
      const exists = current.includes(value);
      return {
        ...p,
        tentative_types: exists
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!project.client_id) {
      toast.error("Please select a client");
      return;
    }
    if (!project.project_type) {
      toast.error("Please select project type");
      return;
    }
    setSaveModal(true);
  };

  const confirmSave = async () => {
    setSubmitting(true);
    try {
      const res = await ApiService(
        {
          ...project,
          dynamicFields: [], // No Project Assignment needed
          ID: params.id,
        },
        0,
        header,
        updateNewFile.method,
        updateNewFile.url,
      );

      if (res.status === 200 || !res.data?.error) {
        toast.success("Tentative project updated successfully");
        navigate(`/${TentativeRoute.list}`);
      } else {
        toast.error(res.data?.message || "Failed to update tentative project");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while updating");
    } finally {
      setSubmitting(false);
      setSaveModal(false);
    }
  };

  if (loading) {
    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <div
          style={{
            minHeight: "70vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <div className="ef-spinner" />
          <span style={{ fontSize: 13, color: THEME.textMuted }}>
            Loading project details…
          </span>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      {saveModal && (
        <SaveConfirmModal
          onConfirm={confirmSave}
          onCancel={() => setSaveModal(false)}
          saving={submitting}
        />
      )}

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
            gap: 10,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 4,
              height: 28,
              borderRadius: 3,
              background: `linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)`,
            }}
          />
          <div>
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
              Edit Tentative Project
            </h1>
            <p
              style={{
                margin: "2px 0 0",
                fontSize: 12,
                color: THEME.textMuted,
              }}
            >
              File #{params.id} {project.case_id ? `• ${project.case_id}` : ""}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="ef-fade">
            {/* ── 1. Client Details ── */}
            <CardSection title="Client Details" icon="👤">
              <Grid>
                <div>
                  <FieldLabel required>Client Name</FieldLabel>
                  <select
                    className="ef-select"
                    name="client_id"
                    onChange={handleInput}
                    value={project.client_id}
                    disabled={topDisabled}
                  >
                    <option value="">-- Select Client --</option>
                    {custData.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.first_name} {r.last_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <FieldLabel>Company Name</FieldLabel>
                  <input
                    className="ef-input"
                    type="text"
                    value={project.company_name}
                    readOnly
                  />
                </div>
                <div>
                  <FieldLabel>Email ID</FieldLabel>
                  <input
                    className="ef-input"
                    type="email"
                    value={project.email}
                    readOnly
                  />
                </div>
                <div>
                  <FieldLabel>Phone No.</FieldLabel>
                  <input
                    className="ef-input"
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
                  <FieldLabel>Project Name</FieldLabel>
                  <input
                    className="ef-input"
                    type="text"
                    name="project_name"
                    placeholder="Enter project name…"
                    onChange={handleInput}
                    value={project.project_name}
                    readOnly={topDisabled}
                  />
                </div>
                <div>
                  <FieldLabel required>Project Type</FieldLabel>
                  <select
                    className="ef-select"
                    name="project_type"
                    onChange={handleInput}
                    value={project.project_type}
                    disabled={topDisabled}
                  >
                    <option value="">-- Select --</option>
                    {projecttype.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <FieldLabel>Interior Category</FieldLabel>
                  <select
                    className="ef-select"
                    name="category"
                    onChange={handleInput}
                    value={project.category}
                    disabled={topDisabled}
                  >
                    <option value="">-- Select --</option>
                    {categoryData.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <FieldLabel>Architecture Category</FieldLabel>
                  <select
                    className="ef-select"
                    name="archcategory"
                    onChange={handleInput}
                    value={project.archcategory}
                    disabled={topDisabled}
                  >
                    <option value="">-- Select --</option>
                    {archdata.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <FieldLabel>Authority</FieldLabel>
                  <select
                    className="ef-select"
                    name="authority"
                    onChange={handleInput}
                    value={project.authority}
                    disabled={topDisabled}
                  >
                    <option value="">-- Select --</option>
                    {AUTHORITY_OPTIONS.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <FieldLabel>File Type</FieldLabel>
                  <RadioGroup
                    name="file_type"
                    value={project.file_type}
                    onChange={handleInput}
                    disabled={topDisabled}
                    options={[
                      { value: "online", label: "Online" },
                      { value: "offline", label: "Offline" },
                    ]}
                  />
                </div>
                <div>
                  <FieldLabel>Fire NOC</FieldLabel>
                  <RadioGroup
                    name="fire_noc"
                    value={project.fire_noc}
                    onChange={handleInput}
                    disabled={topDisabled}
                    options={[
                      { value: "yes", label: "Yes" },
                      { value: "no", label: "No" },
                    ]}
                  />
                </div>

                {/* ── Tentative Design & Types ── */}
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
                    disabled={topDisabled}
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
                        style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
                      >
                        {[
                          { value: "architecture", label: "🏛️ Architecture" },
                          { value: "interior", label: "🛋️ Interior" },
                          { value: "approval", label: "📑 Approval Process" },
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
                                cursor: topDisabled ? "not-allowed" : "pointer",
                                userSelect: "none",
                                transition: "all 0.18s",
                                boxShadow: checked
                                  ? "0 2px 6px rgba(136,117,73,0.15)"
                                  : "none",
                              }}
                            >
                              <input
                                type="checkbox"
                                value={opt.value}
                                checked={checked}
                                disabled={topDisabled}
                                onChange={() =>
                                  handleTentativeTypeToggle(opt.value)
                                }
                                style={{
                                  accentColor: THEME.brand,
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

                <div style={{ gridColumn: "span 2" }}>
                  <FieldLabel>Address</FieldLabel>
                  <input
                    className="ef-input"
                    type="text"
                    name="address"
                    placeholder="Enter full address…"
                    onChange={handleInput}
                    value={project.address}
                    readOnly={topDisabled}
                  />
                </div>
                <div>
                  <FieldLabel>Google Location</FieldLabel>
                  <input
                    className="ef-input"
                    type="text"
                    name="google_location"
                    placeholder="Paste maps link…"
                    onChange={handleInput}
                    value={project.google_location}
                    readOnly={topDisabled}
                  />
                </div>
                <div>
                  <FieldLabel>Latitude</FieldLabel>
                  <input
                    className="ef-input"
                    type="text"
                    name="lat"
                    placeholder="e.g. 21.1702"
                    onChange={handleInput}
                    value={project.lat}
                    readOnly={topDisabled}
                  />
                </div>
                <div>
                  <FieldLabel>Longitude</FieldLabel>
                  <input
                    className="ef-input"
                    type="text"
                    name="long"
                    placeholder="e.g. 72.8311"
                    onChange={handleInput}
                    value={project.long}
                    readOnly={topDisabled}
                  />
                </div>
              </Grid>
            </CardSection>

            {/* ── 3. Land Details ── */}
            <CardSection title="Land Details" icon="🗺️">
              <Grid>
                <div>
                  <FieldLabel>Village</FieldLabel>
                  <select
                    className="ef-select"
                    name="village"
                    onChange={handleInput}
                    value={project.village}
                    disabled={topDisabled}
                  >
                    <option value="">Select Village</option>
                    {villages.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <FieldLabel>City</FieldLabel>
                  <select
                    className="ef-select"
                    name="city"
                    onChange={handleInput}
                    value={project.city}
                    disabled={topDisabled}
                  >
                    <option value="">Select City</option>
                    {city.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <FieldLabel>Land Type</FieldLabel>
                  <select
                    className="ef-select"
                    name="land_type"
                    onChange={handleInput}
                    value={project.land_type}
                    disabled={topDisabled}
                  >
                    <option value="">Select type</option>
                    <option value="tp">TP</option>
                    <option value="non_tp">NON TP</option>
                    <option value="gamtal">GAMTAL</option>
                  </select>
                </div>
              </Grid>

              {project.land_type === "tp" && (
                <Grid style={{ marginTop: 14 }}>
                  <div>
                    <FieldLabel>TP Scheme</FieldLabel>
                    <select
                      className="ef-select"
                      name="tpscheme"
                      onChange={handleInput}
                      value={project.tpscheme}
                      disabled={topDisabled}
                    >
                      <option value="">Select TP Scheme</option>
                      {tpscheme.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.tpscheme}
                        </option>
                      ))}
                    </select>
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
                        className="ef-input"
                        name={n}
                        placeholder="Type…"
                        onChange={handleInput}
                        value={project[n]}
                        readOnly={topDisabled}
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
                        className="ef-input"
                        name={n}
                        placeholder="Type…"
                        onChange={handleInput}
                        value={project[n]}
                        readOnly={topDisabled}
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
                        className="ef-input"
                        name={n}
                        placeholder="Type…"
                        onChange={handleInput}
                        value={project[n]}
                        readOnly={topDisabled}
                      />
                    </div>
                  ))}
                </Grid>
              )}
            </CardSection>

            {/* ── Actions (No Project Assignment) ── */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 20,
              }}
            >
              <SecondaryBtn
                onClick={() => navigate(`/${TentativeRoute.list}`)}
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
                        animation: "efSpin 0.7s linear infinite",
                      }}
                    />
                    Saving…
                  </>
                ) : (
                  "✓ Save Changes"
                )}
              </PrimaryBtn>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

export default EditTentative;
