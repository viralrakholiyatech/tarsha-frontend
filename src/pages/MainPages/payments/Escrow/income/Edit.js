// ─────────────────────────────────────────────
//  EditIncome.jsx  —  Edit Receipt
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
  updateEscrowIncome,
  getEscrowIncomeById,
  getReceiptfile,
} from "../../../../../config/config";
import ApiService from "../../../../../services/ApiService";
import toast from "react-hot-toast";
import Select from "react-select";
import { FileUrl } from "../../../../../config/file_url";

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

function CardSection({ title, icon, subtitle, children }) {
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
        <div>
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
          {subtitle && (
            <p
              style={{
                margin: "3px 0 0",
                fontSize: 13,
                fontWeight: 600,
                color: THEME.text,
                fontFamily: "'Sora',sans-serif",
                letterSpacing: "-0.2px",
              }}
            >
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
const EditIncome = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [files, setFiles] = useState([]);
  const [fileData, setFileData] = useState(null);

  const [selectedService, setSelectedService] = useState(null);
  const [mode, setMode] = useState("cash");

  // ── selected option states for react-select ──
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedEmp, setSelectedEmp] = useState(null);

  const {
    register,
    formState: { errors },
    setValue,
    handleSubmit,
  } = useForm({ mode: "onChange" });
  useEffect(() => {
  register("project_id");
  register("via_employee_id");
}, [register]);

  // ── Load all dropdowns + receipt data ────────
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

    const fetchReceipt = async () => {
      try {
        const h = { Authorization: `Bearer ${getToken()}` };
        const res = await ApiService(
          null,
          0,
          h,
          getEscrowIncomeById.method,
          `${getEscrowIncomeById.url}/${id}`,
        );
        // API returns data as object not array
        const rec = res.data?.data;
        if (!res.data.error && rec) {
          setValue("date", rec.date ? rec.date.split("T")[0] : todayDate());
          setValue("project_id", rec.project_id);

          setValue("amount", rec.amount);
          setValue("remarks", rec.remarks || "");
          setValue("via_employee_id", rec.via_employee_id);

          if (rec.services) setSelectedService(rec.services);
          setMode(rec.mode || "cash");
          setValue("mode", rec.mode || "cash");

          // Store IDs so we can match options once dropdowns load
          // Options may not be loaded yet — handled in second useEffect below
        }
      } catch (e) {
        console.error(e);
      }
    };

    loadEmployees();
    loadFiles();
    if (id) fetchReceipt();
  }, [id, setValue]);



  // ─────────────────────────────────────────────
  //  Cleaner approach: store raw receipt in state
  //  and apply Select options once both are ready
  // ─────────────────────────────────────────────
  const [receiptRaw, setReceiptRaw] = useState(null);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const h = { Authorization: `Bearer ${getToken()}` };
        const res = await ApiService(
          null,
          0,
          h,
          getEscrowIncomeById.method,
          `${getEscrowIncomeById.url}/${id}`,
        );
        const rec = res.data?.data;
        if (!res.data.error && rec) {
          setReceiptRaw(rec);
          setValue("date", rec.date ? rec.date.split("T")[0] : todayDate());
          setValue("project_id", rec.project_id);
          setValue("amount", String(rec.amount));
          setValue("remarks", rec.remarks || "");
          setValue("via_employee_id", rec.via_employee_id);
        }
      } catch (e) {
        console.error(e);
      }
    };
    if (id) fetchReceipt();
  }, [id]);

  // ── Match Select options once both data + options are ready ──
  useEffect(() => {
    if (!receiptRaw || !files.length) return;
    const matched = files.find((f) => f.id === parseInt(receiptRaw.project_id)); // ← parseInt
    if (matched) {
      const opt = {
        value: matched.id,
        label: `${matched.case_id} — ${matched.first_name}`,
        data: matched,
      };
      setSelectedProject(opt);
      setFileData(matched);
    }
  }, [receiptRaw, files]);



  useEffect(() => {
    if (!receiptRaw || !employees.length) return;
    const matched = employees.find((e) => e.id === receiptRaw.via_employee_id);
    if (matched)
      setSelectedEmp({
        value: matched.id,
        label: `${matched.first_name} ${matched.last_name}`,
      });
  }, [receiptRaw, employees]);

  // ── Submit ────────────────────────────────────
const onSubmit = async (data) => {
  setLoading(true);
  try {
    const header = {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    };

    const body = {
      id: id,
      date: data.date,
      project_id: data.project_id,
      remarks: data.remarks || "",
      amount: data.amount,
      mode: mode,
      ...(data.via_employee_id && { via_employee_id: data.via_employee_id }),
      ...(selectedService && { services: selectedService }),
    };

    const res = await ApiService(
      body,
      0,
      header,
      updateEscrowIncome.method,
      updateEscrowIncome.url,
    );
    if (!res.data.error) {
      toast.success(res.data.message || "Receipt updated successfully!");
      navigate(`/${PaymentRoute.escrowIncome}`);
    } else {
      toast.error(res.data.message);
    }
  } catch (err) {
    toast.error(err?.response?.data?.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};

  // ── Options ───────────────────────────────────
  const empOptions = employees.map((e) => ({
    value: e.id,
    label: `${e.first_name} ${e.last_name}`,
  }));

  const projectOptions = files.map((f) => ({
    value: f.id,
    label: `${f.case_id} — ${f.first_name}`,
    data: f,
  }));

  // ── Render ────────────────────────────────────
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
            Edit Receipt
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

                {/* Project */}
                <div>
                  <FieldLabel>Project (File Name)</FieldLabel>
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
                      setSelectedService(null);
                    }}
                  />
        
                </div>
              </div>

              {/* File Details */}
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
    { label: "FP No",      value: fileData.fp_no },
    { label: "Ward No",    value: fileData.ward_no },
    { label: "TP Scheme",  value: fileData.tpscheme },
    { label: "CS No",      value: fileData.cs_no },
    { label: "B No",       value: fileData.b_no },
    { label: "OP No",      value: fileData.op_no },
    { label: "RS No",      value: fileData.rs_no },
  ].filter((f) => f.value && f.value.trim() !== "");

  if (landFields.length === 0) return null;

  return (
    <div style={{ marginBottom: 14 }}>
      <p style={{
        margin: "0 0 8px",
        fontSize: 11,
        color: THEME.brand,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.07em",
      }}>
        Land Details
      </p>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        gap: 8,
      }}>
        {landFields.map((f) => (
          <div key={f.label} style={{
            padding: "8px 10px",
            borderRadius: 8,
            background: "#fff",
            border: `1px solid ${THEME.border}`,
          }}>
            <p style={{
              margin: 0,
              fontSize: 10,
              color: THEME.textMuted,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}>
              {f.label}
            </p>
            <p style={{
              margin: "3px 0 0",
              fontSize: 13,
              color: THEME.text,
              fontWeight: 600,
            }}>
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
                          const isSelected = selectedService === app.name;
                          return (
                            <div
                              key={i}
                              onClick={() =>
                                setSelectedService(isSelected ? null : app.name)
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
                              <span
                                style={{
                                  fontSize: 13,
                                  color: isSelected
                                    ? THEME.brand
                                    : THEME.textMuted,
                                  fontWeight: 700,
                                }}
                              >
                                {app.price != null
                                  ? `₹${parseFloat(app.price).toLocaleString("en-IN")}`
                                  : "—"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      {selectedService && (
                        <p
                          style={{
                            margin: "8px 0 0",
                            fontSize: 11,
                            color: THEME.brand,
                            fontWeight: 600,
                          }}
                        >
                          ✓ {selectedService} selected
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardSection>

            {/* ── Receipt Info ── */}
            <CardSection title="Receipt Info" icon="🧾">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr ",
                  gap: 16,
                  marginBottom: 16,
                }}
              >
                

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
                
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr  1fr",
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
                      onClick={() => {
                        setMode("cash");
                        setValue("mode", "cash");
                      }}
                    >
                      💵 Cash
                    </button>
                    <button
                      type="button"
                      className={`mode-btn${mode === "bank" ? " active" : ""}`}
                      onClick={() => {
                        setMode("bank");
                        setValue("mode", "bank");
                      }}
                    >
                      🏦 Bank
                    </button>
                  </div>
                  <input type="hidden" {...register("mode")} />
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
              <SecondaryBtn onClick={() => navigate(`/${PaymentRoute.escrowIncome}`)}>
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
                  "✓ Update Receipt"
                )}
              </PrimaryBtn>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditIncome;
