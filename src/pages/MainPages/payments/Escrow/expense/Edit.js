// ─────────────────────────────────────────────
//  EditExpense.jsx  —  Edit Expense
// ─────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PaymentRoute } from "../../../../../config/RouteConfig";
import { getToken } from "../../../../../services/useLocalStorage";
import { useForm } from "react-hook-form";
import { todayDate } from "../../../../../services/DateAndTimeService";
import { floatPattern } from "../../../../../services/Pattern";
import {
  fetchActiveEmployee,
  updateEscrowExpenses,
  getEscrowExpensesById,
  getReceiptfile,
  getExpenseLedgers,
} from "../../../../../config/config";
import ApiService from "../../../../../services/ApiService";
import toast from "react-hot-toast";
import Select from "react-select";
import { FileUrl } from "../../../../../config/file_url";
import S3FileUpload from "../../../../../components/S3FileUpload";

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
  .ad-input:focus { border-color:#887549;box-shadow:0 0 0 3px #88754918; }
  .ad-input::placeholder { color:#BDBDBD; }
  .ad-input.error { border-color:#FFA39E;background:#FFF1F0; }

  .mode-btn {
    flex:1;padding:10px 0;border-radius:10px;border:1.5px solid #E0D5C5;
    background:#fff;font-size:13px;font-weight:600;cursor:pointer;
    font-family:'DM Sans',sans-serif;color:#595959;
    transition:all 0.18s;
  }
  .mode-btn.active {
    background:#887549;border-color:#887549;color:#fff;
    box-shadow:0 2px 8px #88754944;
  }
  .mode-btn:not(.active):hover {
    border-color:#887549;color:#887549;background:#F5F0E8;
  }

  ::-webkit-scrollbar{width:5px;}
  ::-webkit-scrollbar-track{background:#F5F0E8;}
  ::-webkit-scrollbar-thumb{background:#C4A97D;border-radius:10px;}
`;

const selectStyles = (hasError) => ({
  control: (base, state) => ({
    ...base,
    border: `1.5px solid ${hasError ? THEME.errorBorder : state.isFocused ? THEME.brand : "#E0D5C5"}`,
    borderRadius: 10,
    minHeight: 42,
    boxShadow: state.isFocused ? `0 0 0 3px ${THEME.brand}18` : "none",
    fontFamily: "'DM Sans',sans-serif",
    fontSize: 13,
    background: hasError ? THEME.errorBg : "#fff",
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
});

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
          alignItems: "flex-start",
          gap: 8,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            width: 3,
            minHeight: 16,
            borderRadius: 2,
            background: `linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)`,
            marginTop: 2,
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

function PrimaryBtn({ children, type = "button", disabled }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type={type}
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

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const EditExpense = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [files, setFiles] = useState([]);
  const [fileData, setFileData] = useState(null);
  const [ledgerGroups, setLedgerGroups] = useState([]);
  const [mode, setMode] = useState("cash");
  const [paymentRaw, setPaymentRaw] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [existingImage, setExistingImage] = useState(null);

  // ── react-select controlled values ──
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedLedger, setSelectedLedger] = useState(null);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [receiptCleared, setReceiptCleared] = useState(false);

  const {
    register,
    formState: { errors },
    setValue,
    handleSubmit,
    watch,
  } = useForm({ mode: "onChange" });

  // ── Load dropdowns ──────────────────────────
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const h = { Authorization: `Bearer ${getToken()}` };
        const res = await ApiService(
          null,
          0,
          h,
          fetchActiveEmployee.method,
          fetchActiveEmployee.url,
        );
        if (!res.data.error && Array.isArray(res.data.data))
          setEmployees(res.data.data);
      } catch (e) {
        console.error(e);
      }
    };

    const loadFiles = async () => {
      try {
        const h = { Authorization: `Bearer ${getToken()}` };
        const res = await ApiService(
          null,
          0,
          h,
          getReceiptfile.method,
          getReceiptfile.url,
        );
        if (!res.data.error && Array.isArray(res.data.data))
          setFiles(res.data.data);
      } catch (e) {
        console.error(e);
      }
    };

    const loadLedgers = async () => {
      try {
        const h = { Authorization: `Bearer ${getToken()}` };
        const res = await ApiService(
          null,
          0,
          h,
          getExpenseLedgers.method,
          getExpenseLedgers.url,
        );
        if (!res.data.error && Array.isArray(res.data.data))
          setLedgerGroups(res.data.data);
      } catch (e) {
        console.error(e);
      }
    };

    loadEmployees();
    loadFiles();
    loadLedgers();
  }, []);

  // ── Load expense by ID ──────────────────────
  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const h = { Authorization: `Bearer ${getToken()}` };
        const res = await ApiService(
          null,
          0,
          h,
          getEscrowExpensesById.method,
          `${getEscrowExpensesById.url}/${id}`,
        );
        const rec = res.data?.data;
        if (!res.data.error && rec) {
          setPaymentRaw(rec);
          setValue("date", rec.date ? rec.date.split("T")[0] : todayDate());
          setValue("project_id", rec.project_id);
          setValue("ledger_group_id", rec.ledger_group_id);
          setValue("amount", String(rec.amount));
          setValue("remarks", rec.remarks || "");
          setValue("via_employee_id", rec.via_employee_id);
          setValue("mode", rec.mode || "cash");
          setValue("name", rec.name || ""); // ← pre-fill name
          setValue("mobile", rec.mobile || ""); // ← pre-fill mobile
          setMode(rec.mode || "cash");
          if (rec.receipt_image) setExistingImage(rec.receipt_image);
          setSelectedServices(rec.services ? [rec.services] : []);
        }
      } catch (e) {
        console.error(e);
      }
    };
    if (id) fetchPayment();
  }, [id]);

  // ── Match Select options once both are ready ──
  useEffect(() => {
    if (!paymentRaw || !files.length) return;
    const matched = files.find((f) => f.id === parseInt(paymentRaw.project_id));
    if (matched) {
      setSelectedProject({
        value: matched.id,
        label: `${matched.case_id} — ${matched.first_name}`,
        data: matched,
      });
      setFileData(matched);
    }
  }, [paymentRaw, files]);

  useEffect(() => {
    if (!paymentRaw || !ledgerGroups.length) return;
    const matched = ledgerGroups.find(
      (l) => l.id === paymentRaw.ledger_group_id,
    );
    if (matched)
      setSelectedLedger({
        value: matched.id,
        label: matched.name || `Ledger ${matched.id}`,
      });
  }, [paymentRaw, ledgerGroups]);

  useEffect(() => {
    if (!paymentRaw || !employees.length) return;
    const matched = employees.find(
      (e) => e.id === parseInt(paymentRaw.via_employee_id),
    );
    if (matched)
      setSelectedEmp({
        value: matched.id,
        label: `${matched.first_name} ${matched.last_name}`,
      });
  }, [paymentRaw, employees]);

  // ── Mode toggle ─────────────────────────────
  const handleModeChange = (val) => {
    setMode(val);
    setValue("mode", val, { shouldValidate: true });
  };

  // ── File upload ───────────────────────────────
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setValue("receipt", e.target.files[0], { shouldValidate: true });
      setExistingImage(null); // replaced
    }
  };

  // ── Submit ──────────────────────────────────
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const header = {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "multipart/form-data",
      };
      // const body = {
      //   id,
      //   date: data.date,
      //   project_id: data.project_id,
      //   ledger_group_id: data.ledger_group_id,
      //   mode: data.mode,
      //   amount: data.amount,
      //   via_employee_id: data.via_employee_id,
      //   remarks: data.remarks,
      //   services: selectedServices[0] || null,
      //   name: data.name, // ← included in payload
      //   mobile: data.mobile, // ← included in payload
      // };

      const formData = new FormData();
      formData.append("id", id);
      formData.append("date", data.date);
      formData.append("project_id", data.project_id);
      formData.append("ledger_group_id", data.ledger_group_id);
      formData.append("remarks", data.remarks);
      formData.append("mode", data.mode);
      formData.append("amount", data.amount);
      formData.append("name", data.name);
      formData.append("mobile", data.mobile);
      if (data.via_employee_id)
        formData.append("via_employee_id", data.via_employee_id);
      if (data.receipt) {
        formData.append("receipt_image", data.receipt);
      } else if (receiptCleared) {
        formData.append("receipt_image_cleared", "true");
      }
      if (selectedServices.length > 0) formData.append("services", selectedServices[0]);

      const res = await ApiService(
        formData,
        0,
        header,
        updateEscrowExpenses.method,
        updateEscrowExpenses.url,
      );
      if (!res.data.error) {
        toast.success(res.data.message || "Expense updated successfully!");
        navigate(`/${PaymentRoute.escrowExpense}`);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ── Options ─────────────────────────────────
  const empOptions = employees.map((e) => ({
    value: e.id,
    label: `${e.first_name} ${e.last_name}`,
  }));

  const projectOptions = files.map((f) => ({
    value: f.id,
    label: `${f.case_id} — ${f.first_name}`,
    data: f,
  }));

  const ledgerOptions = ledgerGroups.map((l) => ({
    value: l.id,
    label: l.name || `Ledger ${l.id}`,
  }));

  // ── Render ───────────────────────────────────
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
        {/* Header */}
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
            Edit Expense
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="ad-fade">
            {/* ── Project Details ── */}
            <CardSection title="Project Details" icon="🏗">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                {/* Date */}
                <div>
                  <FieldLabel>Date</FieldLabel>
                  <input
                    type="date"
                    className={`ad-input${errors.date ? " error" : ""}`}
                    {...register("date")}
                  />
                </div>

                {/* Project — now required */}
                <div>
                  <FieldLabel required>Project (File Name)</FieldLabel>
                  <Select
                    options={projectOptions}
                    isSearchable
                    placeholder="Select project / file…"
                    styles={selectStyles(!!errors.project_id)}
                    value={selectedProject}
                    onChange={(opt) => {
                      setSelectedProject(opt);
                      setValue("project_id", opt?.value, {
                        shouldValidate: true,
                      });
                      setFileData(opt?.data || null);
                      setSelectedServices([]);
                    }}
                  />
                  <input
                    type="hidden"
                    {...register("project_id", {
                      required: "Project is required",
                    })}
                  />
                  <ErrorMsg message={errors.project_id?.message} />
                </div>
              </div>

              {/* Auto-populated File Details */}
              {fileData && (
                <div
                  style={{
                    marginTop: 16,
                    padding: "14px 16px",
                    background: THEME.brandLight,
                    borderRadius: 10,
                    border: `1px solid ${THEME.brand}33`,
                  }}
                >
                  <div style={{ marginBottom: 12 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 11,
                        color: THEME.brand,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                      }}
                    >
                      Client Name
                    </p>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: 14,
                        color: THEME.text,
                        fontWeight: 600,
                      }}
                    >
                      {fileData.first_name} {fileData.last_name}
                    </p>
                  </div>
                  {/* Land Details — only show fields that have a value */}
                  {(() => {
                    const landFields = [
                      { label: "FP No", value: fileData.fp_no },
                      { label: "Ward No", value: fileData.ward_no },
                      { label: "TP Scheme", value: fileData.tpscheme },
                      { label: "CS No", value: fileData.cs_no },
                      { label: "B No", value: fileData.b_no },
                      { label: "OP No", value: fileData.op_no },
                      { label: "RS No", value: fileData.rs_no },
                    ].filter((f) => f.value && f.value.trim() !== "");

                    if (landFields.length === 0) return null;

                    return (
                      <div style={{ marginBottom: 14 }}>
                        <p
                          style={{
                            margin: "0 0 8px",
                            fontSize: 11,
                            color: THEME.brand,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.07em",
                          }}
                        >
                          Land Details
                        </p>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fill, minmax(140px, 1fr))",
                            gap: 8,
                          }}
                        >
                          {landFields.map((f) => (
                            <div
                              key={f.label}
                              style={{
                                padding: "8px 10px",
                                borderRadius: 8,
                                background: "#fff",
                                border: `1px solid ${THEME.border}`,
                              }}
                            >
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 10,
                                  color: THEME.textMuted,
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.06em",
                                }}
                              >
                                {f.label}
                              </p>
                              <p
                                style={{
                                  margin: "3px 0 0",
                                  fontSize: 13,
                                  color: THEME.text,
                                  fontWeight: 600,
                                }}
                              >
                                {f.value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {fileData.applications?.length > 0 && (
                    <div>
                      <p
                        style={{
                          margin: "0 0 8px",
                          fontSize: 11,
                          color: THEME.brand,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                        }}
                      >
                        Services{" "}
                        <span
                          style={{
                            color: THEME.textMuted,
                            fontWeight: 500,
                            textTransform: "none",
                            fontSize: 10,
                          }}
                        >
                          (tap to select)
                        </span>
                      </p>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                        }}
                      >
                        {fileData.applications.map((app, i) => {
                          const isSelected = selectedServices.includes(
                            app.name,
                          );
                          return (
                            <div
                              key={i}
                              onClick={() =>
                                setSelectedServices((prev) =>
                                  prev.includes(app.name) ? [] : [app.name],
                                )
                              }
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "10px 12px",
                                borderRadius: 8,
                                cursor: "pointer",
                                border: `1.5px solid ${isSelected ? THEME.brand : THEME.border}`,
                                background: isSelected
                                  ? THEME.brandLight
                                  : "#fff",
                                transition: "all 0.15s",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                }}
                              >
                                <div
                                  style={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: 5,
                                    flexShrink: 0,
                                    border: `2px solid ${isSelected ? THEME.brand : "#C4A97D"}`,
                                    background: isSelected
                                      ? THEME.brand
                                      : "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "all 0.15s",
                                  }}
                                >
                                  {isSelected && (
                                    <svg
                                      width="10"
                                      height="10"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="#fff"
                                      strokeWidth="3"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                  )}
                                </div>
                                <span
                                  style={{
                                    fontSize: 13,
                                    color: isSelected
                                      ? THEME.brandDark
                                      : THEME.text,
                                    fontWeight: isSelected ? 700 : 600,
                                  }}
                                >
                                  {app.name}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {selectedServices.length > 0 && (
                        <p
                          style={{
                            margin: "8px 0 0",
                            fontSize: 11,
                            color: THEME.brand,
                            fontWeight: 600,
                          }}
                        >
                          ✓ {selectedServices.length} service
                          {selectedServices.length > 1 ? "s" : ""} selected
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardSection>

            {/* ── Payment Info ── */}
            <CardSection title="Payment Info" icon="💳">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  marginBottom: 16,
                }}
              >
                {/* Ledger Group */}
                <div>
                  <FieldLabel required>Ledger Group</FieldLabel>
                  <Select
                    options={ledgerOptions}
                    isSearchable
                    placeholder="Select ledger group…"
                    styles={selectStyles(!!errors.ledger_group_id)}
                    value={selectedLedger}
                    onChange={(opt) => {
                      setSelectedLedger(opt);
                      setValue("ledger_group_id", opt?.value, {
                        shouldValidate: true,
                      });
                    }}
                  />
                  <input
                    type="hidden"
                    {...register("ledger_group_id", {
                      required: "Ledger Group is required",
                    })}
                  />
                  <ErrorMsg message={errors.ledger_group_id?.message} />
                </div>

                {/* Via Employee */}
                <div>
                  <FieldLabel>Via Employee</FieldLabel>
                  <Select
                    options={empOptions}
                    isSearchable
                    placeholder="Select employee…"
                    styles={selectStyles(!!errors.via_employee_id)}
                    value={selectedEmp}
                    onChange={(opt) => {
                      setSelectedEmp(opt);
                      setValue("via_employee_id", opt?.value, {
                        shouldValidate: true,
                      });
                    }}
                  />
                  <input type="hidden" {...register("via_employee_id")} />
                </div>
              </div>

              {/* ── Name & Mobile — always required ── */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  marginBottom: 16,
                }}
              >
                <div>
                  <FieldLabel required>Name</FieldLabel>
                  <input
                    type="text"
                    placeholder="Enter name…"
                    className={`ad-input${errors.name ? " error" : ""}`}
                    {...register("name", {
                      required: "Name is required",
                    })}
                  />
                  <ErrorMsg message={errors.name?.message} />
                </div>
                <div>
                  <FieldLabel required>Mobile No</FieldLabel>
                  <input
                    type="text"
                    placeholder="Enter mobile number…"
                    className={`ad-input${errors.mobile ? " error" : ""}`}
                    {...register("mobile", {
                      required: "Mobile No is required",
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Enter a valid 10-digit mobile number",
                      },
                    })}
                  />
                  <ErrorMsg message={errors.mobile?.message} />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  marginBottom: 16,
                }}
              >
                {/* Amount */}
                <div>
                  <FieldLabel required>Amount</FieldLabel>
                  <input
                    type="text"
                    placeholder="e.g. 5000.00"
                    className={`ad-input${errors.amount ? " error" : ""}`}
                    {...register("amount", {
                      required: "Amount is required",
                      pattern: {
                        value: floatPattern,
                        message: "Enter a valid amount",
                      },
                      validate: (v) =>
                        parseFloat(v) > 0 || "Must be greater than zero",
                    })}
                  />
                  <ErrorMsg message={errors.amount?.message} />
                </div>

                {/* Mode */}
                <div>
                  <FieldLabel>Mode</FieldLabel>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      className={`mode-btn${mode === "cash" ? " active" : ""}`}
                      onClick={() => handleModeChange("cash")}
                    >
                      💵 Cash
                    </button>
                    <button
                      type="button"
                      className={`mode-btn${mode === "bank" ? " active" : ""}`}
                      onClick={() => handleModeChange("bank")}
                    >
                      🏦 Bank
                    </button>
                  </div>
                  <input type="hidden" {...register("mode")} />
                </div>

                {/* Receipt Upload */}
                <div>
                  <FieldLabel>Receipt (File/Image)</FieldLabel>
                  <S3FileUpload
                    folder="escrow/receipts"
                    value={watch("receipt") || existingImage}
                    onChange={(url) => {
                      setValue("receipt", url, { shouldValidate: true });
                      setExistingImage(null);
                      setReceiptCleared(false);
                    }}
                    onRemove={() => {
                      setValue("receipt", "", { shouldValidate: true });
                      setExistingImage(null);
                      setReceiptCleared(true);
                    }}
                  />
                  <input type="hidden" {...register("receipt")} />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <FieldLabel>Remarks</FieldLabel>
                <textarea
                  rows={3}
                  placeholder="Add any remarks or context…"
                  className="ad-input"
                  {...register("remarks")}
                />
              </div>
            </CardSection>

            {/* ── Actions ── */}
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}
            >
              <SecondaryBtn
                onClick={() => navigate(`/${PaymentRoute.escrowExpense}`)}
              >
                ← Back
              </SecondaryBtn>
              <PrimaryBtn type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        border: "2px solid #ffffff88",
                        borderTopColor: "#fff",
                        display: "inline-block",
                        animation: "adSpin 0.7s linear infinite",
                      }}
                    />
                    Updating…
                  </>
                ) : (
                  "✓ Update Expense"
                )}
              </PrimaryBtn>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditExpense;
