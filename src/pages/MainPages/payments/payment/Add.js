// ─────────────────────────────────────────────
//  AddPayments.jsx  —  Add Payment
// ─────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PaymentRoute } from "../../../../config/RouteConfig";
import { getToken } from "../../../../services/useLocalStorage";
import { useForm } from "react-hook-form";
import { todayDate } from "../../../../services/DateAndTimeService";
import { floatPattern } from "../../../../services/Pattern";
import {
  fetchActiveEmployee,
  addPaymentExpense,
  getReceiptfile,
  getExpenseLedgers,
} from "../../../../config/config";
import ApiService from "../../../../services/ApiService";
import toast from "react-hot-toast";
import Select from "react-select";
import S3FileUpload from "../../../../components/S3FileUpload";

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
    .afe-upload-zone {
  border:2px dashed #D4C4A0;border-radius:12px;
  padding:20px 16px;text-align:center;cursor:pointer;
  background:#FDFAF5;transition:all 0.18s;position:relative;
}
.afe-upload-zone:hover { border-color:#887549;background:#F5F0E8; }
.afe-upload-zone input[type=file] {
  position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;
}
.afe-upload-zone.has-file { border-color:#887549;background:#F5F0E8; }

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

function UploadZone({ name, label, onChange, file, required }) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <div className={`afe-upload-zone${file ? " has-file" : ""}`}>
        <input
          type="file"
          name={name}
          onChange={onChange}
          accept="image/*,.pdf"
        />
        {file ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              pointerEvents: "none",
            }}
          >
            <span style={{ fontSize: 22 }}>✅</span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: THEME.brand,
                maxWidth: 160,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {file.name}
            </span>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              pointerEvents: "none",
            }}
          >
            <span style={{ fontSize: 22 }}>📎</span>
            <span
              style={{ fontSize: 12, color: THEME.textMuted, fontWeight: 600 }}
            >
              Click to upload
            </span>
            <span style={{ fontSize: 11, color: THEME.textLight }}>
              JPG, PNG, PDF
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const AddPayments = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [files, setFiles] = useState([]);
  const [fileData, setFileData] = useState(null);
  const [ledgerGroups, setLedgerGroups] = useState([]);
  const [mode, setMode] = useState("cash"); // 'cash' | 'bank'
  const [selectedServices, setSelectedServices] = useState([]);
  const [showExtraFields, setShowExtraFields] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [files_upload, setFilesUpload] = useState({
    receipt_image: null,
    submitters_img1: null,
    submitters_img2: null,
    submitters_img3: null,
  });

  const {
    register,
    formState: { errors },
    setValue,
    handleSubmit,
  } = useForm({ mode: "onChange" });

  // ── Fetch API Data ──────────────────────────
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

  // keep hidden field in sync with mode state
  const handleModeChange = (val) => {
    setMode(val);
    setValue("mode", val, { shouldValidate: true });
  };

  // ── Submit Handler ──────────────────────────
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const header = {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "multipart/form-data",
      };
      const body = new FormData();
      body.append("date", data.date);
      body.append("project_id", data.project_id);
      body.append("ledger_group_id", data.ledger_group_id);
      body.append("mode", data.mode);
      body.append("amount", data.amount);
      body.append("via_employee_id", data.via_employee_id || "");
      body.append("remarks", data.remarks || "");
      body.append("services", selectedServices[0] || "");
      if (showExtraFields) {
        body.append("extra_name", data.extra_name || "");
        body.append("extra_mobile", data.extra_mobile || "");
      }
      if (files_upload.receipt_image)
        body.append("receipt_image", files_upload.receipt_image);
      if (files_upload.submitters_img1)
        body.append("submitters_img1", files_upload.submitters_img1);
      if (files_upload.submitters_img2)
        body.append("submitters_img2", files_upload.submitters_img2);
      if (files_upload.submitters_img3)
        body.append("submitters_img3", files_upload.submitters_img3);

      const res = await ApiService(
        body,
        0,
        header,
        addPaymentExpense.method,
        addPaymentExpense.url,
      );
      if (!res.data.error) {
        toast.success(res.data.message || "Payment added successfully!");
        navigate(`/${PaymentRoute.expense}`);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ── Options Mapping ─────────────────────────
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

  // ── Render ──────────────────────────────────
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
            Add Payment
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
                    defaultValue={todayDate()}
                    {...register("date")}
                  />
                </div>

                {/* Project */}
                <div>
                  <FieldLabel>Project (File Name)</FieldLabel>
                  <Select
                    options={projectOptions}
                    isSearchable
                    placeholder="Select project / file…"
                    // styles={selectStyles(!!errors.project_id)}
                    onChange={(opt) => {
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
                      validate: (v) =>
                        !showAttachments ||
                        !!v ||
                        "Project is required when this ledger is selected",
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
                              onClick={() => {
                                setSelectedServices((prev) =>
                                  prev.includes(app.name) ? [] : [app.name],
                                );
                              }}
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
                                {/* Checkbox indicator */}
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
                  marginBottom: showExtraFields ? 0 : 16,
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
                    onChange={(opt) => {
                      setValue("ledger_group_id", opt?.value, {
                        shouldValidate: true,
                      });
                      setShowExtraFields(opt?.value === 9);
                      setShowAttachments(opt?.value === 10);
                      if (opt?.value !== 9) {
                        setValue("extra_name", "");
                        setValue("extra_mobile", "");
                      }
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
                    onChange={(opt) =>
                      setValue("via_employee_id", opt?.value, {
                        shouldValidate: true,
                      })
                    }
                  />
                  <input type="hidden" {...register("via_employee_id")} />
                </div>
              </div>

              {/* Extra fields — shown only when ledger id = 9 */}
              {showExtraFields && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                    marginBottom: 16,
                    marginTop: 16,
                  }}
                >
                  <div>
                    <FieldLabel required>Name</FieldLabel>
                    <input
                      type="text"
                      placeholder="Enter name…"
                      className={`ad-input${errors.extra_name ? " error" : ""}`}
                      {...register("extra_name", {
                        required: showExtraFields ? "Name is required" : false,
                      })}
                    />
                    <ErrorMsg message={errors.extra_name?.message} />
                  </div>
                  <div>
                    <FieldLabel required>Mobile No</FieldLabel>
                    <input
                      type="text"
                      placeholder="Enter mobile number…"
                      className={`ad-input${errors.extra_mobile ? " error" : ""}`}
                      {...register("extra_mobile", {
                        required: showExtraFields
                          ? "Mobile No is required"
                          : false,
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: "Enter a valid 10-digit mobile number",
                        },
                      })}
                    />
                    <ErrorMsg message={errors.extra_mobile?.message} />
                  </div>
                </div>
              )}

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
                  <input
                    type="hidden"
                    defaultValue="cash"
                    {...register("mode")}
                  />
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
            {/* ── Attachments — shown only when ledger id = 10 ── */}
            {showAttachments && (
              <CardSection title="Attachments" icon="📎">
                <div style={{ marginBottom: 14 }}>
                  <S3FileUpload
                    folder="payment/receipts"
                    label="Receipt (Bill / Invoice)"
                    value={files_upload.receipt_image}
                    onChange={(url) =>
                      setFilesUpload((p) => ({ ...p, receipt_image: url }))
                    }
                    onRemove={() =>
                      setFilesUpload((p) => ({ ...p, receipt_image: "" }))
                    }
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 14,
                  }}
                >
                  <S3FileUpload
                    folder="payment/submitters"
                    label="Submitter Image 1"
                    value={files_upload.submitters_img1}
                    onChange={(url) =>
                      setFilesUpload((p) => ({ ...p, submitters_img1: url }))
                    }
                    onRemove={() =>
                      setFilesUpload((p) => ({ ...p, submitters_img1: "" }))
                    }
                  />
                  <S3FileUpload
                    folder="payment/submitters"
                    label="Submitter Image 2"
                    value={files_upload.submitters_img2}
                    onChange={(url) =>
                      setFilesUpload((p) => ({ ...p, submitters_img2: url }))
                    }
                    onRemove={() =>
                      setFilesUpload((p) => ({ ...p, submitters_img2: "" }))
                    }
                  />
                  <S3FileUpload
                    folder="payment/submitters"
                    label="Submitter Image 3"
                    value={files_upload.submitters_img3}
                    onChange={(url) =>
                      setFilesUpload((p) => ({ ...p, submitters_img3: url }))
                    }
                    onRemove={() =>
                      setFilesUpload((p) => ({ ...p, submitters_img3: "" }))
                    }
                  />
                </div>
              </CardSection>
            )}

            {/* ── Actions ── */}
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}
            >
              <SecondaryBtn
                onClick={() => navigate(`/${PaymentRoute.expense}`)}
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
                    Saving…
                  </>
                ) : (
                  "✓ Add Payment"
                )}
              </PrimaryBtn>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddPayments;
