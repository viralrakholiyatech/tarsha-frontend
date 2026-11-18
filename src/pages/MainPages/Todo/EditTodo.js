import React, { useEffect, useState } from "react";
import ApiService from "../../../services/ApiService";
import {
  updateMeetingTask,
  fetchActiveEmployee,
  fetchallStage,
  fetchallproject,
  getDepartment,
  getTodosById,
} from "../../../config/config";
import { getToken } from "../../../services/useLocalStorage";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
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
  @keyframes etFadeIn {
    from { opacity:0; transform:translateY(8px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .et-fade { animation: etFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes etSpin { to { transform:rotate(360deg); } }

  .et-input {
    width:100%; padding:9px 12px; border-radius:10px;
    border:1.5px solid #E0D5C5; font-size:13px;
    font-family:'DM Sans',sans-serif; color:#1A1A2E;
    outline:none; background:#fff; transition:border-color 0.15s;
    appearance:auto;
  }
  .et-input:focus { border-color:${THEME.brand}; box-shadow:0 0 0 3px ${THEME.brand}18; }
  .et-input::placeholder { color:${THEME.textLight}; }

  .et-radio { display:none; }
  .et-radio-label {
    display:inline-flex; align-items:center; gap:7px;
    padding:8px 16px; border-radius:20px; cursor:pointer;
    font-size:13px; font-weight:600; border:1.5px solid #E0D5C5;
    background:#fff; color:#595959; transition:all 0.18s;
    font-family:'DM Sans',sans-serif; user-select:none;
  }
  .et-radio:checked + .et-radio-label {
    background:${THEME.brandLight}; color:${THEME.brand};
    border-color:${THEME.brand};
  }
    .et-textarea {
  width:100%; padding:9px 12px; border-radius:10px;
  border:1.5px solid #E0D5C5; font-size:13px;
  font-family:'DM Sans',sans-serif; color:#1A1A2E;
  outline:none; background:#fff; transition:border-color 0.15s;
  resize:vertical; min-height:80px; line-height:1.5;
}
.et-textarea:focus { border-color:${THEME.brand}; box-shadow:0 0 0 3px ${THEME.brand}18; }
.et-textarea::placeholder { color:${THEME.textLight}; }

  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:${THEME.brandLight}; }
  ::-webkit-scrollbar-thumb { background:${THEME.brandMid}; border-radius:10px; }
`;

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
      {required && <span style={{ color: "#CF1322", marginLeft: 3 }}>*</span>}
    </label>
  );
}

function Field({ children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>{children}</div>
  );
}

function CardSection({ title, children }) {
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
          {title}
        </h2>
      </div>
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

function SecondaryBtn({ children, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button"
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

/** Skeleton shimmer for loading state */
function Skeleton({ w = "100%", h = 38, radius = 10 }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: radius,
        background:
          "linear-gradient(90deg,#F5EFE8 25%,#EDE5D5 50%,#F5EFE8 75%)",
        backgroundSize: "200% 100%",
        animation: "etShimmer 1.4s infinite",
      }}
    />
  );
}

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
function EditTodo() {
  const navigate = useNavigate();
  const params = useParams();

  const [project, setProject] = useState([]);
  const [emp, setEmp] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    department: "",
    dropdown: "",
    assign_task: "myself",
    task: "",
    project: "",
    status: "",
    priority: "",
    sub_function: "",
    hours: "",
    minutes: "",
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

  const getproject = async () => {
    try {
      const h = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService(
        null,
        0,
        h,
        fetchallStage.method,
        fetchallStage.url,
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

  const fetchTodo = async () => {
    setLoading(true);
    try {
      const h = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService(
        null,
        parseInt(params?.id),
        h,
        getTodosById.method,
        getTodosById.url,
      );
      if (!res.data.error) {
        const data = res.data.data[0];
        const assignTask = data?.assign_to
          ? "assignto"
          : data?.contributon
            ? "collabration"
            : "myself";
        setFormData({
          id: parseInt(params?.id),
          department: data?.mst_department_id ?? "",
          task: data?.task ?? "",
          project: data?.project_id ?? "",
          assign_task: assignTask,
          dropdown: data?.assign_to ?? data?.contributon ?? "",
          status: data?.status ?? "",
          priority: data?.priority ?? "",
          sub_function: data?.sub_function ?? "",
          hours: data?.hours ?? "",
          minutes: data?.minutes ?? "",
        });
      } else {
        toast.error(res.data?.message);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEmployees();
    getproject();
    fetchDepartment();
    fetchTodo();
  }, []);

  // ── Submit ────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await ApiService(
        formData,
        0,
        authHeader,
        updateMeetingTask.method,
        updateMeetingTask.url,
      );
      if (res.status === 200 && !res.data.error) {
        toast.success(res.data.message || "Task updated successfully");
        navigate(`/${TodosRoute.list}`);
      } else {
        toast.error(res.data?.message || "An error occurred");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const set = (key) => (e) =>
    setFormData((f) => ({ ...f, [key]: e.target.value }));

  // ── Render ────────────────────────────────

  return (
    <>
      <style>{`
        ${GLOBAL_CSS}
        @keyframes etShimmer {
          0%   { background-position:200% 0; }
          100% { background-position:-200% 0; }
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: THEME.bg,
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
              Edit Task
            </h1>
            <p
              style={{
                margin: "2px 0 0 0",
                fontSize: 12,
                color: THEME.textMuted,
              }}
            >
              ID #{params?.id}
            </p>
          </div>
        </div>

        {loading ? (
          /* Skeleton loading state */
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[1, 2].map((n) => (
              <div
                key={n}
                style={{
                  background: "#fff",
                  border: `1px solid ${THEME.border}`,
                  borderRadius: 14,
                  padding: "22px 24px",
                  boxShadow: "0 2px 10px rgba(136,117,73,0.06)",
                }}
              >
                <Skeleton w={120} h={14} radius={6} />
                <div
                  style={{
                    marginTop: 20,
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
                    gap: 16,
                  }}
                >
                  {Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i}>
                        <Skeleton w={80} h={10} radius={4} />
                        <div style={{ marginTop: 6 }}>
                          <Skeleton h={38} />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="et-fade">
            {/* ── Section 1: Task Info ── */}
            <CardSection title="Task Information">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: 16,
                }}
              >
                <Field>
                  <FieldLabel required>Task</FieldLabel>
                  <textarea
                    type="text"
                    className="et-textarea"
                    placeholder="Describe the task…"
                    value={formData.task}
                    onChange={set("task")}
                    rows={3}
                  />
                </Field>

                <Field>
                  <FieldLabel>Project</FieldLabel>
                  <select
                    className="et-input"
                    value={formData.project}
                    onChange={set("project")}
                  >
                    <option value="">Select Project</option>
                    {project.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.case_id}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field>
                  <FieldLabel>Department</FieldLabel>
                  <select
                    className="et-input"
                    value={formData.department}
                    onChange={set("department")}
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
                  <FieldLabel>Team Member</FieldLabel>
                  <select
                    className="et-input"
                    value={formData.dropdown}
                    onChange={set("dropdown")}
                  >
                    <option value="">Select Member</option>
                    {emp.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field>
                  <FieldLabel>Hours</FieldLabel>
                  <input
                    type="text"
                    className="et-input"
                    placeholder="e.g. 2.5"
                    value={formData.hours}
                    onChange={set("hours")}
                  />
                </Field>
                <Field>
                  <FieldLabel>Minutes</FieldLabel>
                  <input
                    type="number"
                    className="et-input"
                    placeholder="e.g. 30"
                    min="0"
                    max="59"
                    value={formData.minutes}
                    onChange={set("minutes")}
                  />
                </Field>
              </div>
            </CardSection>

            {/* ── Section 2: Assignment + Status ── */}
            <CardSection title="Assignment & Status">
              <div
                style={{ display: "flex", flexDirection: "column", gap: 20 }}
              >
                {/* Assign to radio pills */}
                <div>
                  <FieldLabel>Assign Task To</FieldLabel>
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                      marginTop: 4,
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
                          id={`er-${value}`}
                          name="assign_task"
                          value={value}
                          className="et-radio"
                          checked={formData.assign_task === value}
                          onChange={set("assign_task")}
                        />
                        <label
                          htmlFor={`er-${value}`}
                          className="et-radio-label"
                        >
                          {label}
                        </label>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Priority + Status in a row */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: 16,
                  }}
                >
                  <Field>
                    <FieldLabel>Priority</FieldLabel>
                    <select
                      className="et-input"
                      value={formData.priority}
                      onChange={set("priority")}
                    >
                      <option value="">-- Select --</option>
                      <option value="0">🟢 Low</option>
                      <option value="1">🟡 Medium</option>
                      <option value="2">🔴 High</option>
                    </select>
                  </Field>

                  <Field>
                    <FieldLabel>Sub Function</FieldLabel>
                    <select
                      className="et-input"
                      value={formData.sub_function}
                      onChange={set("sub_function")}
                    >
                      <option value="">-- Select --</option>
                      <option value="0">D.C.</option>
                      <option value="1">P.V.</option>
                      <option value="2">Fire noc</option>
                      <option value="3">E-nagar Portal</option>
                      <option value="4">B.permission</option>
                      <option value="5">Basic Details</option>
                      <option value="6">Study/RND</option>
                      <option value="7">Quotation</option>
                      <option value="8">Design Concept</option>
                      <option value="9">Consulatnts</option>
                      <option value="10">Technical Drawings</option>
                      <option value="11">Schedule</option>
                      <option value="12">Risk Matrix</option>
                    </select>
                  </Field>

                  <Field>
                    <FieldLabel>Status</FieldLabel>
                    <select
                      className="et-input"
                      value={formData.status}
                      onChange={set("status")}
                    >
                      <option value="">-- Select --</option>
                      <option value="0">⏳ Pending</option>
                      <option value="1">✓ Completed</option>
                    </select>
                  </Field>
                </div>
              </div>
            </CardSection>

            {/* ── Action buttons ── */}
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}
            >
              <SecondaryBtn onClick={() => navigate(`/${TodosRoute.list}`)}>
                ← Back
              </SecondaryBtn>
              <PrimaryBtn
                type="submit"
                onClick={handleSubmit}
                disabled={submitting}
              >
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
                        animation: "etSpin 0.7s linear infinite",
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
        )}
      </div>
    </>
  );
}

export default EditTodo;
