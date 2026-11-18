import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { GetDate, todayDate } from "../../../services/DateAndTimeService";
import { getToken } from "../../../services/useLocalStorage";
import useValidator from "../../../services/Validation";
import toast from "react-hot-toast";
import { FileUrl } from "../../../config/file_url";
import { SiteRoute } from "../../../config/RouteConfig";
import ApiService from "../../../services/ApiService";
import {
  getsitesbyid,
  updatesites,
  getchecklist,
  fetchActiveEmployee,
  getfileDatabyId,
  getDepartment,
  fetchallStage,
} from "../../../config/config";
import { getCustomers } from "../../../services/CustomerService";
import axios from "axios";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaMapLocationDot } from "react-icons/fa6";

// ─────────────────────────────────────────────
//  🎨  THEME  —  change colours here
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

// ─────────────────────────────────────────────
//  🔗  API base URL for existing signatures
// ─────────────────────────────────────────────
const FILE_BASE = FileUrl; // 🔧 change if your API URL changes

// ─────────────────────────────────────────────
//  📝  GLOBAL CSS  (same as Add.jsx)
// ─────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }

  .si-input {
    width: 100%; padding: 9px 12px; border-radius: 10px;
    border: 1.5px solid #E0D5C5; font-size: 13px;
    font-family: 'DM Sans', sans-serif; color: #434343;
    background: #fff; outline: none; transition: border-color 0.18s, box-shadow 0.18s;
    appearance: auto;
  }
  .si-input:focus {
    border-color: ${THEME.brand};
    box-shadow: 0 0 0 3px ${THEME.brand}22;
  }
  .si-input::placeholder { color: ${THEME.textLight}; }
  .si-input[type="file"]  { padding: 7px 12px; cursor: pointer; }
  .si-radio { accent-color: ${THEME.brand}; width: 15px; height: 15px; cursor: pointer; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fade-in { animation: fadeIn 0.3s ease both; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner {
    width: 26px; height: 26px; border-radius: 50%;
    border: 3px solid ${THEME.brandLight};
    border-top-color: ${THEME.brand};
    animation: spin 0.8s linear infinite;
  }

  @media (max-width: 640px) { .form-row-grid { grid-template-columns: 1fr !important; } }
`;

// ─────────────────────────────────────────────
//  🧩  SHARED UI PIECES  (same API as Add.jsx)
// ─────────────────────────────────────────────

function Card({ children, style }) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${THEME.border}`,
        borderRadius: 14,
        padding: "22px 24px",
        boxShadow: "0 2px 10px rgba(136,117,73,0.06)",
        marginBottom: 18,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
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
          height: 18,
          borderRadius: 2,
          background: `linear-gradient(180deg, ${THEME.brand} 0%, ${THEME.brandMid} 100%)`,
        }}
      />
      <p
        style={{
          margin: 0,
          fontSize: 13,
          fontWeight: 700,
          color: THEME.brand,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          fontFamily: "'Sora', sans-serif",
        }}
      >
        {children}
      </p>
    </div>
  );
}

function Label({ children, required }) {
  return (
    <label
      style={{
        display: "block",
        marginBottom: 6,
        fontSize: 13,
        fontWeight: 600,
        color: "#434343",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {children}
      {required && <span style={{ color: THEME.error, marginLeft: 3 }}>*</span>}
    </label>
  );
}

function FieldError({ children }) {
  if (!children) return null;
  return (
    <p
      style={{
        margin: "4px 0 0",
        fontSize: 11,
        color: THEME.error,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {children}
    </p>
  );
}

function Row({ children, cols = 2 }) {
  return (
    <div
      className="form-row-grid"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gap: 16,
        marginBottom: 16,
      }}
    >
      {children}
    </div>
  );
}

function InfoTile({ label, value, children }) {
  return (
    <div
      style={{
        background: THEME.brandLight,
        border: "1px solid #D4C4A0",
        borderRadius: 10,
        padding: "10px 14px",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 11,
          fontWeight: 600,
          color: THEME.brandMid,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </p>
      <div
        style={{
          marginTop: 4,
          fontSize: 13,
          fontWeight: 600,
          color: THEME.brandDark,
        }}
      >
        {children || value || (
          <span style={{ color: THEME.textLight }}>N/A</span>
        )}
      </div>
    </div>
  );
}

function Btn({
  label,
  type = "button",
  variant = "primary",
  onClick,
  disabled,
}) {
  const [hov, setHov] = useState(false);
  const isPrimary = variant === "primary";
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
        fontSize: 14,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "'Sora', sans-serif",
        transition: "all 0.18s",
        background: isPrimary
          ? hov
            ? THEME.brandDark
            : THEME.brand
          : hov
            ? THEME.brandLight
            : "#fff",
        border: `1.5px solid ${isPrimary ? (hov ? THEME.brandDark : THEME.brand) : "#E0D5C5"}`,
        color: isPrimary ? "#fff" : hov ? THEME.brand : "#595959",
        boxShadow: isPrimary ? `0 2px 8px ${THEME.brand}33` : "none",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {label}
    </button>
  );
}

/** Shows existing uploaded signature with a View link + new upload input */
function SignatureField({ label, name, existingPath, onChange, required }) {
  const existingUrl = existingPath ? `${FILE_BASE}/${existingPath}` : null;
  const isPdf = existingPath?.toLowerCase().endsWith(".pdf");

  return (
    <div>
      <Label required={required}>{label}</Label>

      {/* Existing signature preview */}
      {existingUrl && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 10,
            padding: "8px 12px",
            background: THEME.brandLight,
            border: `1px solid #D4C4A0`,
            borderRadius: 10,
          }}
        >
          {isPdf ? (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: "#FFF1F0",
                border: "1px solid #FFA39E",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                flexShrink: 0,
              }}
            >
              📄
            </div>
          ) : (
            <img
              src={existingUrl}
              alt="Current signature"
              style={{
                width: 40,
                height: 40,
                objectFit: "cover",
                borderRadius: 8,
                border: `1px solid ${THEME.border}`,
              }}
            />
          )}
          <div style={{ flex: 1 }}>
            <p
              style={{
                margin: 0,
                fontSize: 11,
                color: THEME.brandMid,
                fontWeight: 600,
              }}
            >
              Current Signature
            </p>
          </div>
          <a
            href={existingUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "4px 12px",
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 600,
              background: "#fff",
              border: `1px solid #D4C4A0`,
              color: THEME.brand,
              textDecoration: "none",
            }}
          >
            View ↗
          </a>
        </div>
      )}

      <input className="si-input" type="file" name={name} onChange={onChange} />
      <p style={{ margin: "5px 0 0", fontSize: 11, color: THEME.textMuted }}>
        {existingUrl
          ? "Upload to replace current signature"
          : "Accepted: JPG, PNG, PDF"}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const Edit = () => {
  const navigate = useNavigate();
  const params = useParams();

  // ── Form state ────────────────────────────
  const [sites, setSites] = useState({
    mst_type_id: "",
    department: "",
    mst_inspection_checklist_id: "",
    others_text: "",
    mst_file_project_id: "",
    key_observation: "",
    remarks: "",
    site_incharge: "",
    authorized_person: "",
    review_by: "",
    client_sign: "",
    review_by_sign: "",
    created_at: "",
  });

  // ── Dropdown / data state ─────────────────
  const [departments, setDepartments] = useState([]);
  const [project, setProject] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [secondDropdownOptions, setSecondDropdownOptions] = useState([]);
  const [filedata, setFileData] = useState(null);

  // ── Visit category state ──────────────────
  const [visitCategory, setVisitCategory] = useState("Interior Work");

  // ── UI state ──────────────────────────────
  const [loading, setLoading] = useState(false);

  const [validator, showValidationMessage] = useValidator({
    rules: { remarks: "required|max:255" },
  });

  // ── Helpers ───────────────────────────────

  const authHeader = { Authorization: `Bearer ${getToken()}` };

  const handleInput = (e) => {
    const { name, value } = e.target;
    showValidationMessage(true);
    setSites((prev) => ({ ...prev, [name]: value }));
  };

  const onFileInput = (e) => {
    const { name } = e.target;
    setSites((prev) => ({ ...prev, [name]: e.target.files[0] }));
  };

  const goBack = () => navigate(`/${SiteRoute.list}`);

  // ── API calls ──────────────────────────────

  /** Load existing site record by ID */
  const loadSiteData = async () => {
    try {
      setLoading(true);
      const header = { ...authHeader, "Content-Type": "application/json" };
      const res = await ApiService(
        null,
        parseInt(params.id),
        header,
        getsitesbyid.method,
        getsitesbyid.url,
      );
      if (!res.data.error) {
        const d = res.data.data[0];
        setSites({
          department: d.department || "",
          mst_type_id: d.mst_type_id || "",
          mst_inspection_checklist_id: d.mst_inspection_checklist_id || "",
          mst_file_project_id: d.mst_file_project_id || "",
          others_text: d.others_text || "",
          key_observation: d.key_observation || "",
          remarks: d.remarks || "",
          site_incharge: d.site_incharge || "",
          authorized_person: d.authorized_person || "",
          review_by: d.review_by || "",
          client_sign: d.client_sign || "",
          review_by_sign: d.review_by_sign || "",
          created_at: d.created_at
            ? GetDate(d.created_at, "YYYY-MM-DD")
            : todayDate(),
        });
        // Set visit category label for radio button display
        if (d.mst_type_id == "42") setVisitCategory("Civil Work");
        else if (d.mst_type_id == "43") setVisitCategory("Interior Work");
      } else {
        toast.error(res.data.message);
        navigate(`/${SiteRoute.list}`);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.error) toast.error(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFileDataById = async (fileId) => {
    if (!fileId) return;
    try {
      const res = await axios.get(`${getfileDatabyId.url}/${fileId}`, {
        headers: authHeader,
      });
      if (!res.data.error) setFileData(res.data.data[0]);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await ApiService(
        null,
        0,
        authHeader,
        getDepartment.method,
        getDepartment.url,
      );
      if (!res.data.error) setDepartments(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await ApiService(
        null,
        0,
        authHeader,
        fetchallStage.method,
        fetchallStage.url,
      );
      if (!res.data.error) setProject(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchChecklist = async () => {
    try {
      const res = await axios.get(getchecklist.url, { headers: authHeader });
      if (!res.data.error) {
        const options = res.data.data.map((item) => ({
          id: item.id,
          types: item.mst_type_id,
          title: item.title,
        }));
        setSecondDropdownOptions(options);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await ApiService(
        null,
        0,
        authHeader,
        fetchActiveEmployee.method,
        fetchActiveEmployee.url,
      );
      if (!res.data.error) setEmployees(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Load file details whenever mst_file_project_id changes
  useEffect(() => {
    if (sites.mst_file_project_id) fetchFileDataById(sites.mst_file_project_id);
  }, [sites.mst_file_project_id]);

  useEffect(() => {
    loadSiteData();
    fetchDepartments();
    fetchProjects();
    fetchChecklist();
    fetchEmployees();
  }, []);

  // ── Submit ────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validator.allValid()) {
      showValidationMessage(true);
      return;
    }

    const formData = new FormData();
    Object.keys(sites).forEach((key) => formData.append(key, sites[key]));
    formData.append("id", params.id);

    try {
      setLoading(true);
      const header = { ...authHeader, "Content-Type": "multipart/form-data" };
      const res = await ApiService(
        formData,
        0,
        header,
        updatesites.method,
        updatesites.url,
      );
      if (!res.data.error) {
        toast.success(res.data.message);
        showValidationMessage(false);
        navigate(`/${SiteRoute.list}`);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div
        style={{
          minHeight: "100vh",
          fontFamily: "'DM Sans', sans-serif",
          padding: "28px 24px",
        }}
      >
        {/* ── Page Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  width: 4,
                  height: 26,
                  borderRadius: 3,
                  background: `linear-gradient(180deg, ${THEME.brand} 0%, ${THEME.brandMid} 100%)`,
                }}
              />
              <h1
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 800,
                  color: THEME.text,
                  fontFamily: "'Sora', sans-serif",
                  letterSpacing: "-0.3px",
                }}
              >
                Edit Site Inspection
              </h1>
            </div>
            <p
              style={{
                margin: "0 0 0 12px",
                fontSize: 12,
                color: THEME.textMuted,
              }}
            >
              Update the fields below and save your changes.
            </p>
          </div>
          <Btn label="← Back" variant="outline" onClick={goBack} />
        </div>

        {loading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "80px 0",
              gap: 16,
            }}
          >
            <div className="spinner" />
            <p style={{ color: THEME.textLight, fontSize: 13, margin: 0 }}>
              Loading inspection data…
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="fade-in">
            {/* ── Section 1: Department & Project ── */}
            <Card>
              <SectionTitle>Project Details</SectionTitle>
              <Row>
                <div>
                  <Label required>Department</Label>
                  <select
                    className="si-input"
                    name="department"
                    value={sites.department}
                    onChange={(e) =>
                      setSites((prev) => ({
                        ...prev,
                        department: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label required>Project</Label>
                  <select
                    className="si-input"
                    name="mst_file_project_id"
                    value={sites.mst_file_project_id}
                    onChange={handleInput}
                  >
                    <option value="">Select Project</option>
                    {project.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.case_id} — {p.first_name} {p.last_name}
                      </option>
                    ))}
                  </select>
                  <FieldError>
                    {validator.message(
                      "File",
                      sites.mst_file_project_id,
                      "required",
                    )}
                  </FieldError>
                </div>
              </Row>

              {/* File detail tiles */}
              {filedata && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: 12,
                    marginTop: 4,
                  }}
                >
                  <InfoTile
                    label="Company Name"
                    value={filedata.company_name}
                  />
                  <InfoTile
                    label="Project Type"
                    value={filedata.project_type}
                  />
                  <InfoTile label="Category" value={filedata.category_type} />
                  <InfoTile label="Address" value={filedata.address} />
                  <InfoTile label="Location">
                    <div
                      style={{ display: "flex", gap: 10, alignItems: "center" }}
                    >
                      <Link
                        to={`https://www.google.com/maps?q=${filedata.lat},${filedata.long}`}
                        target="_blank"
                      >
                        <FaMapMarkerAlt
                          style={{ color: "#F44336", fontSize: 16 }}
                        />
                      </Link>
                      <Link
                        to={filedata.google_location || "#"}
                        target="_blank"
                      >
                        <FaMapLocationDot
                          style={{ color: "#28a745", fontSize: 16 }}
                        />
                      </Link>
                    </div>
                  </InfoTile>
                </div>
              )}
            </Card>

            {/* ── Section 2: Visit Category ── */}
            <Card>
              <SectionTitle>Visit Category</SectionTitle>
              <Row>
                <div>
                  <Label>Category Type</Label>
                  <div
                    style={{
                      display: "flex",
                      gap: 20,
                      alignItems: "center",
                      marginTop: 8,
                    }}
                  >
                    {[
                      { label: "Civil Work", value: "42" },
                      { label: "Interior Work", value: "43" },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          fontSize: 13,
                          fontWeight: 500,
                          cursor: "pointer",
                          color: "#434343",
                        }}
                      >
                        <input
                          type="radio"
                          className="si-radio"
                          name="mst_type_id"
                          checked={sites.mst_type_id == opt.value}
                          onChange={() => {
                            setVisitCategory(opt.label);
                            handleInput({
                              target: { name: "mst_type_id", value: opt.value },
                            });
                          }}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>{visitCategory} Sub-type</Label>
                  <select
                    className="si-input"
                    name="mst_inspection_checklist_id"
                    value={sites.mst_inspection_checklist_id}
                    onChange={(e) => {
                      const val = e.target.value;
                      const selected = secondDropdownOptions.find(
                        (o) => o.id === parseInt(val),
                      );
                      setSites((prev) => ({
                        ...prev,
                        mst_inspection_checklist_id: val,
                        others_text:
                          selected?.title !== "Other" ? "" : prev.others_text,
                      }));
                    }}
                  >
                    <option value="">Select Sub-option</option>
                    {secondDropdownOptions
                      .filter((o) => o.types === parseInt(sites.mst_type_id))
                      .map((o, i) => (
                        <option key={i} value={o.id}>
                          {o.title}
                        </option>
                      ))}
                  </select>
                  {(() => {
                    const selected = secondDropdownOptions.find(
                      (o) => o.id === parseInt(sites.mst_inspection_checklist_id)
                    );
                    return selected?.title === "Other" ? (
                      <div style={{ marginTop: 12 }}>
                        <Label>Please specify</Label>
                        <input
                          className="si-input"
                          type="text"
                          name="others_text"
                          placeholder="Describe the sub-type…"
                          value={sites.others_text}
                          onChange={handleInput}
                        />
                      </div>
                    ) : null;
                  })()}
                </div>
              </Row>
            </Card>

            {/* ── Section 3: Observations ── */}
            <Card>
              <SectionTitle>Observations & Remarks</SectionTitle>
              <Row>
                <div>
                  <Label required>Key Observation</Label>
                  <textarea
                    className="si-input"
                    name="key_observation"
                    placeholder="Type key observations here…"
                    rows={5}
                    value={sites.key_observation}
                    onChange={handleInput}
                    style={{ resize: "vertical" }}
                  />
                  <FieldError>
                    {validator.message(
                      "Key Observation",
                      sites.key_observation,
                      "required",
                    )}
                  </FieldError>
                </div>
                <div>
                  <Label required>Remarks</Label>
                  <textarea
                    className="si-input"
                    name="remarks"
                    placeholder="Type remarks here…"
                    rows={5}
                    value={sites.remarks}
                    onChange={handleInput}
                    style={{ resize: "vertical" }}
                  />
                  <FieldError>
                    {validator.message(
                      "remarks",
                      sites.remarks,
                      "required|max:255",
                    )}
                  </FieldError>
                </div>
              </Row>
            </Card>

            {/* ── Section 4: Personnel ── */}
            <Card>
              <SectionTitle>Personnel</SectionTitle>
              <Row>
                <div>
                  <Label required>Site Incharge</Label>
                  <input
                    className="si-input"
                    type="text"
                    name="site_incharge"
                    placeholder="Enter name"
                    value={sites.site_incharge}
                    onChange={handleInput}
                  />
                  <FieldError>
                    {validator.message(
                      "Site Incharge",
                      sites.site_incharge,
                      "required",
                    )}
                  </FieldError>
                </div>
                <div>
                  <Label required>Client / Authorized Person</Label>
                  <input
                    className="si-input"
                    type="text"
                    name="authorized_person"
                    placeholder="Enter name"
                    value={sites.authorized_person}
                    onChange={handleInput}
                  />
                  <FieldError>
                    {validator.message(
                      "Authorized Person",
                      sites.authorized_person,
                      "required",
                    )}
                  </FieldError>
                </div>
              </Row>
              <Row cols={2}>
                <div>
                  <Label required>Reviewed By</Label>
                  <select
                    className="si-input"
                    name="review_by"
                    value={sites.review_by}
                    onChange={handleInput}
                  >
                    <option value="">— Select —</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.first_name} {e.last_name}
                      </option>
                    ))}
                  </select>
                  <FieldError>
                    {validator.message(
                      "Reviewed By",
                      sites.review_by,
                      "required",
                    )}
                  </FieldError>
                </div>
              </Row>
            </Card>

            {/* ── Section 5: Signatures ── */}
            <Card>
              <SectionTitle>Signatures</SectionTitle>
              <Row>
                {/* Client Signature — shows existing + upload to replace */}
                <SignatureField
                  label="Client Signature"
                  name="client_sign"
                  existingPath={
                    typeof sites.client_sign === "string"
                      ? sites.client_sign
                      : null
                  }
                  onChange={onFileInput}
                  required
                />
                {/* Authorized Person Signature */}
                <SignatureField
                  label="Authorized Person Signature"
                  name="review_by_sign"
                  existingPath={
                    typeof sites.review_by_sign === "string"
                      ? sites.review_by_sign
                      : null
                  }
                  onChange={onFileInput}
                  required
                />
              </Row>
            </Card>

            {/* ── Action buttons ── */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
                marginTop: 8,
              }}
            >
              <Btn label="Back" variant="outline" onClick={goBack} />
              <Btn
                label="🖨 Print"
                variant="outline"
                onClick={() => window.print()}
              />
              <Btn label="Save Changes" variant="primary" type="submit" />
            </div>
          </form>
        )}
      </div>
    </>
  );
};

export default Edit;
