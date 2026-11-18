import React, { useEffect, useState } from "react";
import ApiService from "../../../services/ApiService";
import {
  addMeetingTask,
  fetchActiveEmployee,
  getapplicationName,
  getDepartment,
  getSubFunctionLimits,
} from "../../../config/config";
import { getToken } from "../../../services/useLocalStorage";
import toast from "react-hot-toast";
import { todayDate } from "../../../services/DateAndTimeService";
import { useNavigate } from "react-router-dom";
import { TodosRoute } from "../../../config/RouteConfig";

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
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }
  @keyframes atFadeIn {
    from { opacity:0; transform:translateY(8px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .at-fade { animation: atFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }

  /* Shared input style */
  .at-input {
    width:100%; padding:9px 12px; border-radius:10px;
    border:1.5px solid #E0D5C5; font-size:13px;
    font-family:'DM Sans',sans-serif; color:#1A1A2E;
    outline:none; background:#fff; transition:border-color 0.15s;
    appearance:auto;
  }
  .at-input:focus { border-color:${THEME.brand}; box-shadow:0 0 0 3px ${THEME.brand}18; }
  .at-input::placeholder { color:${THEME.textLight}; }

  /* Radio pill */
  .at-radio { display:none; }
  .at-radio-label {
    display:inline-flex; align-items:center; gap:7px;
    padding:8px 16px; border-radius:20px; cursor:pointer;
    font-size:13px; font-weight:600; border:1.5px solid #E0D5C5;
    background:#fff; color:#595959; transition:all 0.18s;
    font-family:'DM Sans',sans-serif; user-select:none;
  }
  .at-radio:checked + .at-radio-label {
    background:${THEME.brandLight}; color:${THEME.brand};
    border-color:${THEME.brand};
  }

  /* Task row card */
  .at-task-row {
    background:#fff; border:1.5px solid ${THEME.border};
    border-radius:12px; padding:16px 18px;
    transition:border-color 0.15s;
    animation: atFadeIn 0.25s ease both;
  }
  .at-task-row:focus-within { border-color:${THEME.brandMid}; }

  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:${THEME.brandLight}; }
  ::-webkit-scrollbar-thumb { background:${THEME.brandMid}; border-radius:10px; }
`;

// ─────────────────────────────────────────────
//  🧩  UI ATOMS
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
      {required && <span style={{ color: "#CF1322", marginLeft: 3 }}>*</span>}
    </label>
  );
}

function Field({ children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>{children}</div>
  );
}

/** Primary action button */
function PrimaryBtn({ children, onClick, type = "button", disabled }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "9px 22px",
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

/** Secondary / cancel button */
function SecondaryBtn({ children, onClick, type = "button" }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type={type}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "9px 22px",
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

/** Outline add-row button */
function AddRowBtn({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "8px 16px",
        borderRadius: 10,
        cursor: "pointer",
        border: `1.5px dashed ${hov ? THEME.brand : "#C4A97D"}`,
        background: hov ? THEME.brandLight : "transparent",
        color: hov ? THEME.brand : THEME.brandMid,
        fontSize: 13,
        fontWeight: 600,
        fontFamily: "'DM Sans',sans-serif",
        transition: "all 0.18s",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Task Row
    </button>
  );
}

/** Delete (trash) icon button */
function DeleteBtn({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title="Remove row"
      style={{
        width: 34,
        height: 34,
        borderRadius: 8,
        cursor: "pointer",
        border: `1.5px solid ${hov ? "#FF4D4F" : "#FFA39E"}`,
        background: hov ? "#FFF1F0" : "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.15s",
        flexShrink: 0,
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          d="M17.498 4.983c-2.775-.275-5.567-.417-8.35-.417q-2.475 0-4.95.25l-1.7.167"
          stroke="#FF5275"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="m7.083 4.142.183-1.092C7.4 2.258 7.5 1.667 8.908 1.667h2.183c1.408 0 1.517.625 1.642 1.392l.183 1.083"
          stroke="#FF5275"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="m15.707 7.617-.542 8.392c-.092 1.308-.167 2.325-2.492 2.325h-5.35c-2.325 0-2.4-1.017-2.492-2.325l-.542-8.392"
          stroke="#FF5275"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.607 13.75h2.775"
          stroke="#FF5275"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.913 10.417h4.167"
          stroke="#FF5275"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
function AddTodo() {
  const navigate = useNavigate();

  const [project, setProject] = useState([]);
  const [emp, setEmp] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [dynamicFields, setDynamicFields] = useState([
    { project: "", sub_function: "", task: "", hours: "", minutes: "" },
  ]);
  const [formData, setFormData] = useState({
    startdate: todayDate(),
    date: todayDate(),
    department: "",
    priority: "1",
    dropdown: [],
    assign_task: "myself",
  });

  const authHeader = {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };

  // ── Loaders ───────────────────────────────

  const getEmployees = async () => {
    try {
      const h = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService(
        null,
        0,
        h,
        fetchActiveEmployee.method,
        fetchActiveEmployee.url,
      );
      if (!res.data.error)
        setEmp(
          (res.data.data || []).map((m) => ({
            value: m.id,
            label: `${m.first_name} ${m.last_name}`,
          })),
        );
    } catch (err) {
      console.error(err);
    }
  };

  const getproject = async (departmentId) => {
    try {
      const h = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService(
        null,
        departmentId,
        h,
        getapplicationName.method,
        getapplicationName.url,
      );
      if (!res.data.error) setProject(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDepartment = async () => {
    try {
      const h = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService(
        null,
        0,
        h,
        getDepartment.method,
        getDepartment.url,
      );
      if (!res.data.error) setDepartments(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getEmployees();
    getproject();
    fetchDepartment();
  }, []);

  // ── Dynamic rows ──────────────────────────

  const addField = () =>
    setDynamicFields((f) => [
      ...f,
      { project: "", sub_function: "", task: "", hours: "", minutes: "" },
    ]);

  const removeField = (idx) =>
    setDynamicFields((f) => f.filter((_, i) => i !== idx));

  const fetchLimits = async (idx, projectId, subFunction, departmentId) => {
    if (
      !projectId ||
      subFunction === "" ||
      subFunction === undefined ||
      !departmentId
    ) {
      setDynamicFields((f) =>
        f.map((row, i) =>
          i === idx ? { ...row, limits: null, loadingLimits: false } : row,
        ),
      );
      return;
    }

    setDynamicFields((f) =>
      f.map((row, i) => (i === idx ? { ...row, loadingLimits: true } : row)),
    );

    try {
      const h = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService(
        null,
        0,
        h,
        getSubFunctionLimits.method,
        `${getSubFunctionLimits.url}?project_id=${projectId}&department_id=${departmentId}&sub_function=${subFunction}`,
      );

      if (!res.data.error && res.data.data) {
        const limitsData = res.data.data;
        setDynamicFields((f) =>
          f.map((row, i) =>
            i === idx
              ? { ...row, limits: limitsData, loadingLimits: false }
              : row,
          ),
        );
      } else {
        setDynamicFields((f) =>
          f.map((row, i) =>
            i === idx ? { ...row, limits: null, loadingLimits: false } : row,
          ),
        );
      }
    } catch (err) {
      console.error("Error fetching sub-function limits:", err);
      setDynamicFields((f) =>
        f.map((row, i) => (i === idx ? { ...row, loadingLimits: false } : row)),
      );
    }
  };

  const handleDynamicChange = (idx, e) => {
    const { name, value } = e.target;
    setDynamicFields((f) => {
      const updated = f.map((row, i) =>
        i === idx ? { ...row, [name]: value } : row,
      );
      const curr = updated[idx];
      if (name === "sub_function" || name === "project") {
        fetchLimits(
          idx,
          name === "project" ? value : curr.project,
          name === "sub_function" ? value : curr.sub_function,
          formData.department,
        );
      }
      return updated;
    });
  };

  // ── Submit ────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.department) {
      toast.error("Please select a department");
      return;
    }
    const isProjectRequired = !["4", "5"].includes(formData.department);
    if (
      dynamicFields.some(
        (f) => !f.task || (isProjectRequired && !f.project) || !f.hours,
      )
    ) {
      toast.error("Please fill in all task, project, and hours fields");
      return;
    }
    setLoading(true);
    try {
      const res = await ApiService(
        { ...formData, tasks: dynamicFields },
        0,
        authHeader,
        addMeetingTask.method,
        addMeetingTask.url,
      );
      if (res.status === 201 && !res.data.error) {
        toast.success(res.data.message || "Task added successfully");
        navigate(`/${TodosRoute.list}`);
      } else if (res.data?.details?.length) {
        // Show each validation error as its own toast
        res.data.details.forEach((msg) => toast.error(msg));
      } else {
        toast.error(res.data?.message || "An error occurred");
      }
    } catch (err) {
      if (err.response?.data?.details?.length) {
        err.response.data.details.forEach((msg) => toast.error(msg));
      } else {
        toast.error(
          err.response?.data?.message || "An unexpected error occurred.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!formData.department) {
  //     toast.error("Please select a department");
  //     return;
  //   }
  //   const isProjectRequired = !["4", "5"].includes(formData.department);
  //   if (
  //     dynamicFields.some((f) => !f.task || (isProjectRequired && !f.project) || !f.hours)
  //   ) {
  //     toast.error("Please fill in all task, project, and hours fields");
  //     return;
  //   }
  //   setLoading(true);
  //   try {
  //     const res = await ApiService(
  //       { ...formData, tasks: dynamicFields },
  //       0,
  //       authHeader,
  //       addMeetingTask.method,
  //       addMeetingTask.url,
  //     );
  //     if (res.status === 201 && !res.data.error) {
  //       toast.success(res.data.message || "Task added successfully");
  //       navigate(`/${TodosRoute.list}`);
  //     } else {
  //       toast.error(res.data?.message || "An error occurred");
  //     }
  //   } catch {
  //     toast.error("An unexpected error occurred.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const isProjectRequired = !["4", "5"].includes(formData.department);

  // ── Render ────────────────────────────────

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div
        style={{
          minHeight: "100vh",
          fontFamily: "'DM Sans',sans-serif",
          padding: "28px 24px",
        }}
      >
        {/* Page header */}
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
            Add Task
          </h1>
        </div>

        <div className="at-fade">
          {/* ── Meta fields card ── */}
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
            {/* Section title */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 20,
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
                Task Details
              </h2>
            </div>

            {/* Row 1: Dept · Start · Due · Priority */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 16,
                marginBottom: 20,
              }}
            >
              <Field>
                <FieldLabel required>Department</FieldLabel>
                <select
                  className="at-input"
                  value={formData.department}
                  onChange={(e) => {
                    const deptId = e.target.value;
                    setFormData({ ...formData, department: deptId });
                    getproject(deptId);
                    dynamicFields.forEach((row, idx) => {
                      if (row.project && row.sub_function !== "") {
                        fetchLimits(idx, row.project, row.sub_function, deptId);
                      }
                    });
                  }}
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field>
                <FieldLabel required>Start Date</FieldLabel>
                <input
                  type="date"
                  className="at-input"
                  value={formData.startdate}
                  onChange={(e) =>
                    setFormData({ ...formData, startdate: e.target.value })
                  }
                />
              </Field>

              <Field>
                <FieldLabel required>Due Date</FieldLabel>
                <input
                  type="date"
                  className="at-input"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </Field>

              <Field>
                <FieldLabel>Priority</FieldLabel>
                <select
                  className="at-input"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                >
                  <option value="">-- Select --</option>
                  <option value="0">Low</option>
                  <option value="1">Medium</option>
                  <option value="2">High</option>
                </select>
              </Field>
            </div>

            {/* Row 2: Assign type + Team picker */}
            <div>
              <FieldLabel>Assign Task To</FieldLabel>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  marginBottom: formData.assign_task !== "myself" ? 16 : 0,
                }}
              >
                {[
                  { value: "myself", label: "👤 Myself" },
                  { value: "assignto", label: "➡️ Assign To" },
                  { value: "collabration", label: "🤝 Collaboration" },
                ].map(({ value, label }) => (
                  <React.Fragment key={value}>
                    <input
                      type="radio"
                      id={`ar-${value}`}
                      name="assign_task"
                      value={value}
                      className="at-radio"
                      checked={formData.assign_task === value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          assign_task: e.target.value,
                        })
                      }
                    />
                    <label htmlFor={`ar-${value}`} className="at-radio-label">
                      {label}
                    </label>
                  </React.Fragment>
                ))}
              </div>

              {formData.assign_task !== "myself" && (
                <div style={{ maxWidth: 260, marginTop: 12 }}>
                  <FieldLabel required>Team Member</FieldLabel>
                  <select
                    className="at-input"
                    onChange={(e) =>
                      setFormData({ ...formData, dropdown: e.target.value })
                    }
                  >
                    <option value="">Select Team Member</option>
                    {emp.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* ── Dynamic task rows ── */}
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
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
                  Tasks{" "}
                  <span
                    style={{
                      background: THEME.brandLight,
                      color: THEME.brand,
                      borderRadius: 20,
                      padding: "1px 8px",
                      fontSize: 11,
                      fontWeight: 800,
                      marginLeft: 4,
                    }}
                  >
                    {dynamicFields.length}
                  </span>
                </h2>
              </div>
              <AddRowBtn onClick={addField} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {dynamicFields.map((field, idx) => (
                <div key={idx} className="at-task-row">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    {/* Row index badge */}
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        flexShrink: 0,
                        background: THEME.brandLight,
                        border: `1px solid #D4C4A0`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        color: THEME.brand,
                        alignSelf: "flex-end",
                        marginBottom: 2,
                      }}
                    >
                      {idx + 1}
                    </div>

                    {/* 1. Project select */}
                    {isProjectRequired && (
                      <div style={{ flex: "1.5 1 180px" }}>
                        <FieldLabel required>Project</FieldLabel>
                        <select
                          className="at-input"
                          name="project"
                          value={field.project}
                          onChange={(e) => handleDynamicChange(idx, e)}
                        >
                          <option value="">Select Project</option>
                          {project.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.case_id} — {p.first_name} {p.last_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* 2. Sub Function select */}
                    <div style={{ flex: "1.3 1 160px" }}>
                      <FieldLabel>Sub Function</FieldLabel>
                      <select
                        className="at-input"
                        name="sub_function"
                        value={field.sub_function || ""}
                        onChange={(e) => handleDynamicChange(idx, e)}
                      >
                        <option value="">-- Select --</option>
                        <optgroup label="Approvals">
                          <option value="0">D.C.</option>
                          <option value="1">P.V.</option>
                          <option value="2">Fire noc</option>
                          <option value="3">E-nagar Portal</option>
                          <option value="4">B.permission</option>
                        </optgroup>
                        <optgroup label="Architecture / Interior">
                          <option value="5">Basic Details</option>
                          <option value="6">Study/RND</option>
                          <option value="7">Quotation</option>
                          <option value="8">Design Concept</option>
                          <option value="9">Consulatnts</option>
                          <option value="10">Technical Drawings</option>
                          <option value="11">Schedule</option>
                          <option value="12">Risk Matrix</option>
                        </optgroup>
                      </select>
                    </div>

                    {/* 3. Task input */}
                    <div style={{ flex: "2 1 200px" }}>
                      <FieldLabel required>Task</FieldLabel>
                      <input
                        type="text"
                        className="at-input"
                        name="task"
                        placeholder="Describe the task…"
                        value={field.task}
                        onChange={(e) => handleDynamicChange(idx, e)}
                      />
                    </div>

                    {/* 4. Hours input */}
                    <div style={{ flex: "0 1 100px" }}>
                      <FieldLabel>Hours</FieldLabel>
                      <input
                        type="text"
                        className="at-input"
                        name="hours"
                        placeholder="e.g. 2.5"
                        value={field.hours}
                        onChange={(e) => handleDynamicChange(idx, e)}
                      />
                    </div>

                    {/* 5. Minutes input */}
                    <div style={{ flex: "0 1 100px" }}>
                      <FieldLabel>Minutes</FieldLabel>
                      <input
                        type="number"
                        className="at-input"
                        name="minutes"
                        placeholder="e.g. 30"
                        min="0"
                        max="59"
                        value={field.minutes}
                        onChange={(e) => handleDynamicChange(idx, e)}
                      />
                    </div>

                    {/* Delete */}
                    {idx > 0 && (
                      <div style={{ alignSelf: "flex-end", paddingBottom: 2 }}>
                        <DeleteBtn onClick={() => removeField(idx)} />
                      </div>
                    )}

                    {/* Sub-function dates & hours info banner */}
                    {field.loadingLimits && (
                      <div
                        style={{
                          width: "100%",
                          padding: "6px 12px",
                          borderRadius: 8,
                          background: THEME.brandLight,
                          fontSize: 12,
                          color: THEME.brand,
                          fontFamily: "'DM Sans',sans-serif",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span
                          style={{
                            animation: "atSpin 0.7s linear infinite",
                            display: "inline-block",
                          }}
                        >
                          ↻
                        </span>
                        Loading allowed dates…
                      </div>
                    )}

                    {!field.loadingLimits && field.limits && (
                      <div
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: 10,
                          padding: "9px 14px",
                          borderRadius: 10,
                          background: "#FDFAF5",
                          border: `1.5px solid ${THEME.border}`,
                          marginTop: 4,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            flexWrap: "wrap",
                            fontSize: 12,
                            fontFamily: "'DM Sans',sans-serif",
                          }}
                        >
                          <span
                            style={{
                              color: THEME.brand,
                              fontWeight: 800,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              fontSize: 11,
                            }}
                          >
                            📅 Allowed Window:
                          </span>
                          <span style={{ color: THEME.text }}>
                            <span style={{ color: THEME.textMuted }}>
                              Start Date:
                            </span>{" "}
                            <strong style={{ color: "#237804" }}>
                              {field.limits.formatted_assign_on || "—"}
                            </strong>
                          </span>
                          <span style={{ color: THEME.border }}>•</span>
                          <span style={{ color: THEME.text }}>
                            <span style={{ color: THEME.textMuted }}>
                              End Date:
                            </span>{" "}
                            <strong style={{ color: "#CF1322" }}>
                              {field.limits.formatted_completed_by || "—"}
                            </strong>
                          </span>
                          {field.limits.hours !== null &&
                            field.limits.hours !== undefined && (
                              <>
                                <span style={{ color: THEME.border }}>•</span>
                                <span style={{ color: THEME.text }}>
                                  <span style={{ color: THEME.textMuted }}>
                                    Max Hours:
                                  </span>{" "}
                                  <strong style={{ color: THEME.brand }}>
                                    {field.limits.hours} hrs
                                  </strong>
                                </span>
                              </>
                            )}
                        </div>

                        {field.limits.start_date_ymd &&
                          field.limits.due_date_ymd && (
                            <button
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  startdate: field.limits.start_date_ymd,
                                  date: field.limits.due_date_ymd,
                                }));
                                toast.success(
                                  "Applied Start and Due Date to Task Details!",
                                );
                              }}
                              title="Set Task Details Start and Due Date to these dates"
                              style={{
                                padding: "4px 12px",
                                borderRadius: 8,
                                border: `1.5px solid ${THEME.brand}`,
                                background: THEME.brandLight,
                                color: THEME.brand,
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: "pointer",
                                fontFamily: "'DM Sans',sans-serif",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                transition: "all 0.15s",
                              }}
                            >
                              <span>⚡</span> Set as Start & Due Date
                            </button>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Action buttons ── */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <SecondaryBtn onClick={() => navigate(`/${TodosRoute.list}`)}>
              ← Back
            </SecondaryBtn>
            <PrimaryBtn type="submit" disabled={loading} onClick={handleSubmit}>
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
                      animation: "atSpin 0.7s linear infinite",
                    }}
                  />
                  Submitting…
                </>
              ) : (
                "✓ Submit Task"
              )}
            </PrimaryBtn>
            <style>{`@keyframes atSpin { to { transform:rotate(360deg); } }`}</style>
          </div>
        </div>
      </div>
    </>
  );
}

export default AddTodo;
