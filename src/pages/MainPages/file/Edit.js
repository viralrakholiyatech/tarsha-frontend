import React, { useState, useEffect } from "react";
import { getToken, isEmp } from "../../../services/useLocalStorage";
import toast from "react-hot-toast";
import { getCustomers } from "../../../services/CustomerService";
import axios from "axios";
import {
  getCategory,
  getVillage,
  fetchHod,
  gettpscheme,
  getProjectDetails,
  updateNewFile,
  getNewFilesById,
  fetchActiveEmployee,
  getDaysbyId,
  deleteFile,
  fetchInteriorCatgory,
  fetcharchitectureCategory,
  getcity,
} from "../../../config/config";
import ApiService from "../../../services/ApiService";
import Select from "react-select";
import { useParams, useNavigate } from "react-router-dom";
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
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }
  @keyframes efFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .ef-fade { animation:efFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes efSpin { to{transform:rotate(360deg)} }
  .ef-spinner { width:28px;height:28px;border-radius:50%;border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};animation:efSpin 0.8s linear infinite; }

  @keyframes overlayFadeIn { from{opacity:0} to{opacity:1} }
  @keyframes modalSlideIn { from{opacity:0;transform:translateY(-16px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }

  .ef-input, .ef-select {
    width:100%;padding:10px 13px;border-radius:10px;
    border:1.5px solid #E0D5C5;font-size:13px;
    font-family:'DM Sans',sans-serif;color:#1A1A2E;
    outline:none;background:#fff;appearance:auto;
    transition:border-color 0.15s,box-shadow 0.15s;
  }
  .ef-input:focus,.ef-select:focus { border-color:${THEME.brand};box-shadow:0 0 0 3px ${THEME.brand}18; }
  .ef-input::placeholder { color:${THEME.textLight}; }
  .ef-input:disabled,.ef-select:disabled { background:#F9F7F4;color:${THEME.textMuted};cursor:not-allowed;border-color:#EDE5D5; }
  .ef-input[readonly] { background:#F9F7F4;color:${THEME.textMuted};cursor:default; }

  .ef-dt { width:100%;border-collapse:collapse;font-size:13px;font-family:'DM Sans',sans-serif; }
  .ef-dt th { padding:10px 12px;font-size:11px;font-weight:700;color:${THEME.brandDark};text-transform:uppercase;letter-spacing:0.07em;background:${THEME.brandLight};border-bottom:2px solid #D4C4A0;white-space:nowrap; }
  .ef-dt td { padding:8px 10px;border-bottom:1px solid #F5EFE4;vertical-align:middle; }
  .ef-dt tbody tr:nth-child(even) { background:#FEFCF9; }
  .ef-dt tbody tr:hover { background:#FDFAF5; }
  .ef-locked-row td { opacity:0.7; }

  .ef-delete-btn {
    display:inline-flex;align-items:center;justify-content:center;
    width:32px;height:32px;border-radius:8px;border:1.5px solid #FFCDD2;
    background:#FFF5F5;color:#CF1322;cursor:pointer;
    transition:all 0.15s;flex-shrink:0;
  }
  .ef-delete-btn:hover { background:#CF1322;color:#fff;border-color:#CF1322;box-shadow:0 2px 8px #CF132244; }
  .ef-delete-btn:disabled { opacity:0.4;cursor:not-allowed; }

  ::-webkit-scrollbar{width:5px;height:5px;}
  ::-webkit-scrollbar-track{background:${THEME.brandLight};}
  ::-webkit-scrollbar-thumb{background:${THEME.brandMid};border-radius:10px;}
`;

const selectStyles = (disabled) => ({
  control: (base, state) => ({
    ...base,
    border: `1.5px solid ${state.isFocused && !disabled ? THEME.brand : "#E0D5C5"}`,
    borderRadius: 10,
    minHeight: 40,
    boxShadow:
      state.isFocused && !disabled ? `0 0 0 3px ${THEME.brand}18` : "none",
    fontFamily: "'DM Sans',sans-serif",
    fontSize: 13,
    background: disabled ? "#F9F7F4" : "#fff",
    "&:hover": { borderColor: disabled ? "#E0D5C5" : THEME.brand },
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
  singleValue: (base) => ({
    ...base,
    color: disabled ? THEME.textMuted : THEME.text,
    fontSize: 13,
  }),
  multiValue: (base) => ({
    ...base,
    background: THEME.brandLight,
    borderRadius: 20,
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: THEME.brand,
    fontSize: 12,
    fontWeight: 600,
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: THEME.brand,
    ":hover": { background: THEME.brand, color: "#fff" },
  }),
});

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

// ─────────────────────────────────────────────
//  🗑️  DELETE CONFIRM MODAL
// ─────────────────────────────────────────────
function DeleteConfirmModal({ onConfirm, onCancel, deleting }) {
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
          width: 360,
          maxWidth: "90vw",
          boxShadow: "0 20px 60px rgba(26,26,46,0.2)",
          animation: "modalSlideIn 0.22s cubic-bezier(0.4,0,0.2,1) both",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: "#FFF5F5",
            border: "1.5px solid #FFCDD2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
              stroke="#CF1322"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 11v4M14 11v4"
              stroke="#CF1322"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <h3
          style={{
            margin: "0 0 6px",
            fontSize: 16,
            fontWeight: 700,
            color: THEME.text,
            fontFamily: "'Sora',sans-serif",
          }}
        >
          Delete this row?
        </h3>
        <p
          style={{
            margin: "0 0 22px",
            fontSize: 13,
            color: THEME.textMuted,
            lineHeight: 1.5,
          }}
        >
          This will permanently remove this assignment record. This action
          cannot be undone.
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            disabled={deleting}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 10,
              border: "1.5px solid #E0D5C5",
              background: "#fff",
              color: "#595959",
              fontSize: 13,
              fontWeight: 600,
              cursor: deleting ? "not-allowed" : "pointer",
              fontFamily: "'DM Sans',sans-serif",
              transition: "all 0.15s",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 10,
              border: "none",
              background: deleting ? "#E57373" : "#CF1322",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: deleting ? "not-allowed" : "pointer",
              fontFamily: "'Sora',sans-serif",
              transition: "all 0.15s",
              boxShadow: "0 2px 8px #CF132244",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {deleting ? (
              <>
                <span
                  style={{
                    width: 13,
                    height: 13,
                    borderRadius: "50%",
                    border: "2px solid #ffffff66",
                    borderTopColor: "#fff",
                    display: "inline-block",
                    animation: "efSpin 0.7s linear infinite",
                  }}
                />
                Deleting…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Yes, Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

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
          width: 360,
          maxWidth: "90vw",
          boxShadow: "0 20px 60px rgba(26,26,46,0.2)",
          animation: "modalSlideIn 0.22s cubic-bezier(0.4,0,0.2,1) both",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: THEME.brandLight,
            border: `1.5px solid ${THEME.brandMid}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 6L9 17l-5-5"
              stroke={THEME.brand}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h3
          style={{
            margin: "0 0 6px",
            fontSize: 16,
            fontWeight: 700,
            color: THEME.text,
            fontFamily: "'Sora',sans-serif",
          }}
        >
          Save changes?
        </h3>
        <p
          style={{
            margin: "0 0 22px",
            fontSize: 13,
            color: THEME.textMuted,
            lineHeight: 1.5,
          }}
        >
          Are you sure you want to update this file with the changes you've
          made?
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          <button
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
              transition: "all 0.15s",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={saving}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 10,
              border: "none",
              background: saving ? THEME.brandMid : THEME.brand,
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
              fontFamily: "'Sora',sans-serif",
              transition: "all 0.15s",
              boxShadow: `0 2px 8px ${THEME.brand}44`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {saving ? (
              <>
                <span
                  style={{
                    width: 13,
                    height: 13,
                    borderRadius: "50%",
                    border: "2px solid #ffffff66",
                    borderTopColor: "#fff",
                    display: "inline-block",
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

// Trash icon SVG
function TrashIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 11v4M14 11v4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
function EditFile() {
  const params = useParams();
  const navigate = useNavigate();
  const header = {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [custData, setCustData] = useState([]);
  const [projecttype, setProjecttype] = useState([]);
  const [villages, setVillages] = useState([]);
   const [city, setcity] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [tpscheme, setTpscheme] = useState([]);
  const [hod, setHoD] = useState([]);
  const [projectDetails, setProjectDetails] = useState([]);
  const [totalDays, setTotalDays] = useState("");
  const [emp, setEmp] = useState([]);
  const [archdata, setArchData] = useState([]);
  const [preFilledRows, setPreFilledRows] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [saveModal, setSaveModal] = useState(false);

  // ── Delete modal state ──
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    index: null,
    rowId: null,
  });
  const [deleting, setDeleting] = useState(false);

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
  });

  const [dynamicFields, setDynamicFields] = useState([
    {
      project_name: "",
      assign_to_hod: "",
      assign_members: [],
      days: "",
      hours:"",
      assign_on: "",
      completed_by: "",
    },
  ]);

  const topDisabled = isEmp();
  const isRowLocked = (index) => {
    if (!isEmp()) return false;
    if (submitted) return true;
    return preFilledRows.includes(index);
  };

  // ── Load all in parallel ──────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const h = { Authorization: `Bearer ${getToken()}` };
        const hj = {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        };

        const [custRes, ptRes, hodRes, pdRes, empRes, vilRes,cityRes, tpRes, daysRes] =
          await Promise.all([
            getCustomers(getToken()),
            ApiService(null, 0, h, getCategory.method, getCategory.url),
            ApiService(null, 0, h, fetchHod.method, fetchHod.url),
            ApiService(
              null,
              0,
              h,
              getProjectDetails.method,
              getProjectDetails.url,
            ),
            ApiService(
              null,
              0,
              h,
              fetchActiveEmployee.method,
              fetchActiveEmployee.url,
            ),
            ApiService(null, 0, hj, getVillage.method, getVillage.url),
            ApiService(null, 0, hj, getcity.method, getcity.url),
            ApiService(null, 0, hj, gettpscheme.method, gettpscheme.url),
            ApiService(null, params.id, h, getDaysbyId.method, getDaysbyId.url),
          ]);

        if (!custRes.data.error) setCustData(custRes.data.data || []);
        if (!ptRes.data.error) setProjecttype(ptRes.data.data || []);
        if (!hodRes.data.error) setHoD(hodRes.data.data || []);
        if (!pdRes.data.error) setProjectDetails(pdRes.data.data || []);
        if (!empRes.data.error)
          setEmp(
            (empRes.data.data || []).map((m) => ({
              value: m.id,
              label: `${m.first_name} ${m.last_name}`,
            })),
          );
        if (!vilRes.data.error) setVillages(vilRes.data.data || []);
         if (!cityRes.data.error) setcity(cityRes.data.data || []);
        if (!tpRes.data.error) setTpscheme(tpRes.data.data || []);
        if (!daysRes.data.error)
          setTotalDays(daysRes.data.data?.[0]?.no_of_days || "");

        const [catRes, archRes] = await Promise.all([
          axios.get(fetchInteriorCatgory.url, {
            headers: { Authorization: `Bearer ${getToken()}` },
          }),
          axios.get(fetcharchitectureCategory.url, {
            headers: { Authorization: `Bearer ${getToken()}` },
          }),
        ]);
        setCategoryData(catRes.data.data || []);
        setArchData(archRes.data.data || []);

        // Main file data
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
          setProject({
            client_id: d0.client_id || "",
            company_name: d0.company_name || "",
            email: d0.email || "",
            phone: d0.phone || "",
            project_name: d0.project_name || "",
            project_type: d0.project_type || "",
            category: d0.category || "",
            archcategory: d0.archcategory || "",
            authority: d0.authority || "",
            address: d0.address || "",
            google_location: d0.google_location || "",
            lat: d0.lat || "",
            long: d0.long || "",
            land_type: d0.land_type || "",
            village: d0.village || "",
            city:d0.city||"",
            tpscheme: d0.tpscheme || "",
            op_no: d0.op_no || "",
            fp_no: d0.fp_no || "",
            moje: d0.moje || "",
            rs_no: d0.rs_no || "",
            ward_no: d0.ward_no || "",
            cs_no: d0.cs_no || "",
            b_no: d0.b_no || "",
          });

          const mapped = Data.map((item) => ({
            Application_number: item.ID || "",
            project_name: item.Application_number || "",
            assign_to_hod: item.assign_to_hod || "",
            assign_members: JSON.parse(item.assign_members || "[]"),
            days: item.days || "",
            hours:item.hours || '',
            assign_on: item.assign_on
              ? item.assign_on.slice(0, 10)
              : new Date().toISOString().slice(0, 10),
            completed_by: item.completed_by
              ? item.completed_by.slice(0, 10)
              : "",
          }));
          setDynamicFields(mapped);

          const filled = mapped.reduce((acc, f, i) => {
            if (
              (Array.isArray(f.assign_members) && f.assign_members.length) ||
              f.days ||
              f.completed_by
            )
              acc.push(i);
            return acc;
          }, []);
          setPreFilledRows(filled);
        }
      } catch (e) {
        console.error(e);
        toast.error("Failed to load data");
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
      return next;
    });
  };

  const handleDynamicChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...dynamicFields];
    updated[index][name] = value;
    const fmt = (d) => d.toISOString().split("T")[0];

    if (name === "days") {
      const total = updated.reduce((a, f) => a + (parseInt(f.days) || 0), 0);
      if (total > totalDays) {
        alert(
          `Total days cannot exceed ${totalDays}. Currently entered: ${total}`,
        );
        updated[index].days = "";
      }
    }
    if (name === "days" || name === "assign_on") {
      if (index === 0 && !updated[index].assign_on)
        updated[index].assign_on = fmt(new Date());
      const d = new Date(updated[index].assign_on);
      const days = parseInt(updated[index].days) || 0;
      if (!isNaN(d.getTime()) && days > 0) {
        const cb = new Date(d);
        cb.setDate(d.getDate() + days);
        updated[index].completed_by = fmt(cb);
        if (index + 1 < updated.length) updated[index + 1].assign_on = fmt(cb);
      } else {
        updated[index].completed_by = "";
      }
    }
    setDynamicFields(updated);
  };

  const handleEmpChange = (sel, index) => {
    const updated = [...dynamicFields];
    updated[index].assign_members = sel.map((s) => s.value);
    setDynamicFields(updated);
  };

  // ── Delete handlers ──────────────────────
  const openDeleteModal = (index) => {
    const rowId = dynamicFields[index]?.Application_number || null;
    setDeleteModal({ open: true, index, rowId });
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setDeleteModal({ open: false, index: null, rowId: null });
  };

  const confirmDelete = async () => {
    const { index, rowId } = deleteModal;
    setDeleting(true);
    try {
      if (rowId) {
        // Hit the deleteFile API with the row's ID
        const h = { Authorization: `Bearer ${getToken()}` };
        const res = await ApiService(
          null,
          rowId,
          h,
          deleteFile.method,
          deleteFile.url,
        );
        if (res.data?.error) {
          toast.error("Failed to delete. Please try again.");
          return;
        }
      }
      // Remove row from local state
      const updated = dynamicFields.filter((_, i) => i !== index);
      setDynamicFields(updated);

      // Re-compute preFilledRows indices after removal
      setPreFilledRows((prev) =>
        prev.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i)),
      );

      toast.success("Row deleted successfully");
      setDeleteModal({ open: false, index: null, rowId: null });
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while deleting");
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaveModal(true);
  };

  const confirmSave = async () => {
    setSubmitting(true);
    try {
      const res = await ApiService(
        { ...project, dynamicFields, ID: params.id },
        0,
        header,
        updateNewFile.method,
        updateNewFile.url,
      );
      if (res.status === 200) {
        toast.success("File updated successfully");
        if (isEmp()) {
          const filled = dynamicFields.reduce((acc, f, i) => {
            if (
              (Array.isArray(f.assign_members) && f.assign_members.length) ||
              f.days ||
              f.completed_by
            )
              acc.push(i);
            return acc;
          }, []);
          setPreFilledRows(filled);
          setSubmitted(true);
        } else {
          navigate(`/${ApprovalRoute.approval_list}`);
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while submitting");
    } finally {
      setSubmitting(false);
      setSaveModal(false);
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setSubmitting(true);
  //   try {
  //     const res = await ApiService({ ...project, dynamicFields, ID: params.id }, 0, header, updateNewFile.method, updateNewFile.url);
  //     if (res.status === 200) {
  //       toast.success("File updated successfully");
  //       if (isEmp()) {
  //         const filled = dynamicFields.reduce((acc, f, i) => {
  //           if ((Array.isArray(f.assign_members) && f.assign_members.length) || f.days || f.completed_by) acc.push(i);
  //           return acc;
  //         }, []);
  //         setPreFilledRows(filled); setSubmitted(true);
  //       } else {
  //         navigate(`/${ApprovalRoute.approval_list}`);
  //       }
  //     }
  //   } catch (e) { console.error(e); toast.error("An error occurred while submitting"); }
  //   finally { setSubmitting(false); }
  // };

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
        <div className="ef-spinner" />
        <p style={{ color: THEME.textLight, fontSize: 13 }}>
          Loading file data…
        </p>
      </div>
    );
  }

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      {/* ── Delete Confirmation Modal ── */}
      {deleteModal.open && (
        <DeleteConfirmModal
          onConfirm={confirmDelete}
          onCancel={closeDeleteModal}
          deleting={deleting}
        />
      )}

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
              Edit File
            </h1>
            <p
              style={{
                margin: "2px 0 0",
                fontSize: 12,
                color: THEME.textMuted,
              }}
            >
              File #{params.id}
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
                    <option value="">-- Select --</option>
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
                    placeholder="Enter name…"
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
                <div style={{ gridColumn: "span 2" }}>
                  <FieldLabel>Address</FieldLabel>
                  <input
                    className="ef-input"
                    type="text"
                    name="address"
                    placeholder="Enter address…"
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
                    placeholder="Paste link…"
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

            {/* ── 4. Assignment Table ── */}
            <CardSection title="Project Assignment" icon="👥">
              {totalDays && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 14,
                    padding: "6px 14px",
                    borderRadius: 20,
                    background: THEME.brandLight,
                    border: `1px solid #D4C4A0`,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: THEME.textMuted,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Total Days Allocated
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: THEME.brand,
                      fontFamily: "'Sora',sans-serif",
                    }}
                  >
                    {totalDays}
                  </span>
                </div>
              )}
              <div
                style={{
                  overflowX: "auto",
                  borderRadius: 10,
                  border: `1px solid ${THEME.border}`,
                }}
              >
                <table className="ef-dt">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Application Name</th>
                      <th>Assign HOD</th>
                      <th>Assign Members</th>
                      <th>Days</th>
                        <th>Hours</th>
                      <th>Assign On</th>
                      <th>Completed By</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dynamicFields.map((field, idx) => {
                      const locked = isRowLocked(idx);
                      return (
                        <tr key={idx} className={locked ? "ef-locked-row" : ""}>
                          <td
                            style={{
                              color: THEME.textMuted,
                              fontWeight: 700,
                              fontSize: 12,
                              width: 36,
                            }}
                          >
                            {idx + 1}
                            {locked && (
                              <span
                                style={{
                                  display: "block",
                                  fontSize: 10,
                                  color: THEME.textLight,
                                }}
                              >
                                🔒
                              </span>
                            )}
                          </td>
                          <td style={{ minWidth: 160 }}>
                            <select
                              className="ef-select"
                              name="project_name"
                              onChange={(e) => handleDynamicChange(idx, e)}
                              value={field.project_name}
                              disabled={topDisabled}
                            >
                              <option value="">-- Select --</option>
                              {projectDetails.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.title}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td style={{ minWidth: 160 }}>
                            <select
                              className="ef-select"
                              name="assign_to_hod"
                              onChange={(e) => handleDynamicChange(idx, e)}
                              value={field.assign_to_hod}
                              disabled={topDisabled}
                            >
                              <option value="">-- Select --</option>
                              {hod.map((h) => (
                                <option key={h.id} value={h.id}>
                                  {h.first_name} {h.last_name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td style={{ minWidth: 220 }}>
                            <Select
                              isMulti
                              isSearchable
                              placeholder="Select members…"
                              styles={selectStyles(locked)}
                              options={emp}
                              isDisabled={locked}
                              value={(Array.isArray(field.assign_members)
                                ? field.assign_members
                                : []
                              )
                                .map((id) => emp.find((o) => o.value === id))
                                .filter(Boolean)}
                              onChange={(sel) => handleEmpChange(sel, idx)}
                            />
                          </td>
                          <td style={{ minWidth: 100 }}>
                            <input
                              className="ef-input"
                              type="number"
                              name="days"
                              placeholder="Days"
                              onChange={(e) => handleDynamicChange(idx, e)}
                              value={field.days}
                              disabled={locked}
                            />
                          </td>
                          <td style={{ minWidth: 100 }}>
                            <input
                              className="ef-input"
                              type="number"
                              name="hours"
                              placeholder="Hours"
                              onChange={(e) => handleDynamicChange(idx, e)}
                              value={field.hours}
                              disabled={locked}
                            />
                          </td>
                          <td style={{ minWidth: 140 }}>
                            <input
                              className="ef-input"
                              type="date"
                              name="assign_on"
                              onChange={(e) => handleDynamicChange(idx, e)}
                              value={field.assign_on}
                              disabled={locked}
                            />
                          </td>
                          <td style={{ minWidth: 140 }}>
                            <input
                              className="ef-input"
                              type="date"
                              name="completed_by"
                              onChange={(e) => handleDynamicChange(idx, e)}
                              value={field.completed_by}
                              disabled={locked}
                            />
                          </td>
                          {/* ── Delete Action ── */}
                          <td style={{ width: 52, textAlign: "center" }}>
                            <button
                              type="button"
                              className="ef-delete-btn"
                              title="Delete this row"
                              disabled={locked || submitting}
                              onClick={() => openDeleteModal(idx)}
                            >
                              <TrashIcon />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
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

export default EditFile;
