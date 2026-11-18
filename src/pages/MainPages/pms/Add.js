import React, { useState, useEffect } from "react";
import ApiService from "../../../services/ApiService";
import { addPms, getPmstaskById } from "../../../config/config";
import { getToken } from "../../../services/useLocalStorage";
import toast from "react-hot-toast";

const THEME = {
  brand: "#887549",
  brandLight: "#F5F0E8",
  brandMid: "#C4A97D",
  brandDark: "#5C4E32",
  border: "#EDE5D5",
  text: "#1A1A2E",
  textMuted: "#ADADAD",
  textLight: "#BDBDBD",
  error: "#CF1322",
  errorLight: "#FFF1F0",
  errorBorder: "#FFA39E",
};

const CATEGORY_OPTIONS = [
  "Design",
  "Working Detailing",
  "Client Meeting",
  "Checking Drawing",
  "Internal Discussion",
  "Stop Meeting",
  "Celebration",
  "Vendor/Contractor Discussion",
  "SMC Followup",
  "SMC Reporting",
  "Site Visit",
];

const MODAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }

  .av-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45); z-index: 1040;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .av-dialog {
    background: #fff; border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.18);
    width: 100%; max-width: 420px;
    display: flex; flex-direction: column;
    font-family: 'DM Sans', sans-serif; overflow: hidden;
    max-height: 90vh;
  }
  .av-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px; border-bottom: 1px solid ${THEME.border};
    background: #FDFAF5; flex-shrink: 0;
  }
  .av-body   { padding: 22px 24px; overflow-y: auto; }
  .av-footer {
    display: flex; align-items: center; justify-content: flex-end;
    gap: 10px; padding: 14px 24px;
    border-top: 1px solid ${THEME.border}; flex-shrink: 0;
  }

  .av-task-title {
    padding: 10px 12px;
    border-radius: 10px;
    background: ${THEME.brandLight};
    border: 1px solid ${THEME.border};
    font-size: 13px;
    color: ${THEME.text};
    line-height: 1.5;
    word-break: break-word;
  }

  .av-hours-summary {
    display: flex;
    gap: 8px;
    margin-top: 8px;
    flex-wrap: wrap;
  }
  .av-hours-chip {
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
  }
  .av-progress-track {
    width: 100%;
    height: 6px;
    border-radius: 4px;
    background: ${THEME.border};
    overflow: hidden;
    margin-top: 8px;
  }
  .av-progress-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.2s ease, background 0.2s ease;
  }

  .av-entries-wrap {
    margin-top: 14px;
    border: 1px solid ${THEME.border};
    border-radius: 10px;
    overflow: hidden;
  }
  .av-entries-header {
    padding: 8px 12px;
    background: #FAF7F0;
    font-size: 11px;
    font-weight: 700;
    color: ${THEME.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.06em;
    border-bottom: 1px solid ${THEME.border};
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .av-entries-list {
    max-height: 150px;
    overflow-y: auto;
  }
  .av-entry-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
    padding: 8px 12px;
    border-bottom: 1px solid ${THEME.border};
    font-size: 12.5px;
  }
  .av-entry-row:last-child { border-bottom: none; }
  .av-entry-task {
    color: ${THEME.text};
    line-height: 1.4;
    word-break: break-word;
    flex: 1;
  }
  .av-entry-hours {
    flex-shrink: 0;
    padding: 2px 8px;
    border-radius: 20px;
    background: ${THEME.brandLight};
    color: ${THEME.brand};
    font-weight: 700;
    font-size: 11px;
    white-space: nowrap;
  }
  .av-entries-empty {
    padding: 14px 12px;
    text-align: center;
    font-size: 12px;
    color: ${THEME.textLight};
  }

  @keyframes avSpinTiny { to { transform: rotate(360deg); } }
  .av-entries-spinner {
    width: 11px; height: 11px; border-radius: 50%;
    border: 2px solid ${THEME.border}; border-top-color: ${THEME.brand};
    animation: avSpinTiny 0.7s linear infinite; display: inline-block;
  }

  .av-input {
    width: 100%; padding: 9px 12px; border-radius: 10px;
    border: 1.5px solid #E0D5C5; font-size: 13px;
    font-family: 'DM Sans', sans-serif; color: ${THEME.text};
    outline: none; background: #fff;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .av-input:focus {
    border-color: ${THEME.brand};
    box-shadow: 0 0 0 3px ${THEME.brand}18;
  }
  .av-input.err {
    border-color: ${THEME.errorBorder};
    background: ${THEME.errorLight};
  }
  .av-input::placeholder { color: ${THEME.textLight}; }

  .av-select {
    width: 100%; padding: 9px 12px; border-radius: 10px;
    border: 1.5px solid #E0D5C5; font-size: 13px;
    font-family: 'DM Sans', sans-serif; color: ${THEME.text};
    outline: none; background: #fff;
    transition: border-color 0.15s, box-shadow 0.15s;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23887549'><path fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/></svg>");
    background-repeat: no-repeat;
    background-position: right 12px center;
    background-size: 14px;
    cursor: pointer;
  }
  .av-select:focus {
    border-color: ${THEME.brand};
    box-shadow: 0 0 0 3px ${THEME.brand}18;
  }
  .av-select.err {
    border-color: ${THEME.errorBorder};
    background-color: ${THEME.errorLight};
  }

  .av-textarea {
    width: 100%; padding: 9px 12px; border-radius: 10px;
    border: 1.5px solid #E0D5C5; font-size: 13px;
    font-family: 'DM Sans', sans-serif; color: ${THEME.text};
    outline: none; background: #fff; resize: vertical;
    min-height: 110px; line-height: 1.5;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .av-textarea:focus {
    border-color: ${THEME.brand};
    box-shadow: 0 0 0 3px ${THEME.brand}18;
  }
  .av-textarea.err {
    border-color: ${THEME.errorBorder};
    background: ${THEME.errorLight};
  }
  .av-textarea::placeholder { color: ${THEME.textLight}; }

  @keyframes avSpin { to { transform: rotate(360deg); } }
  .av-btn-spinner {
    width: 13px; height: 13px; border-radius: 50%;
    border: 2px solid #ffffff88; border-top-color: #fff;
    animation: avSpin 0.7s linear infinite; display: inline-block;
  }
`;

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
        fontFamily: "'Sora', sans-serif",
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
        fontFamily: "'DM Sans', sans-serif",
        transition: "all 0.18s",
      }}
    >
      {children}
    </button>
  );
}

const UpdateTaskModal = ({
  show,
  handleClose,
  id,
  initialTask,
  totalHours = 0,
  totalMinutes = 0,
  usedHours = 0,
  usedMinutes = 0,
  entries = [],
  onSuccess,
}) => {
  const [category, setCategory] = useState("");
  const [taskText, setTaskText] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // "Added Updates" list — fetched from getPmstaskById (keyed by task_id),
  // falls back to the `entries` prop until/unless the fetch succeeds.
  const [taskEntries, setTaskEntries] = useState(entries);
  const [loadingEntries, setLoadingEntries] = useState(false);

  // Reset the form (category, task blank, hours/minutes blank) whenever a different row's + icon is clicked
  useEffect(() => {
    if (show) {
      setCategory("");
      setTaskText("");
      setHours("");
      setMinutes("");
      setErrors({});
    }
  }, [show, id]);

  // Fetch the latest "Added Updates" for this task whenever the modal opens
  useEffect(() => {
    if (!show || !id) return;

    const fetchTaskEntries = async () => {
      try {
        setLoadingEntries(true);
        const header = {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        };

        const res = await ApiService(
          {},
          id,
          header,
          getPmstaskById.method,
          getPmstaskById.url,
        );

        if (!res?.data?.error) {
          // API response shape: { error, message, data: [{ id, task, hours, minutes }, ...] }
          const fetched = Array.isArray(res?.data?.data) ? res.data.data : [];
          setTaskEntries(fetched);
        } else {
          toast.error(res?.data?.message || "Failed to load updates");
          setTaskEntries(entries);
        }
      } catch (err) {
        console.error(err);
        toast.error(err?.response?.data?.message || "Failed to load updates");
        setTaskEntries(entries);
      } finally {
        setLoadingEntries(false);
      }
    };

    fetchTaskEntries();
  }, [show, id]);

  // ── Totals & remaining, all computed in minutes to avoid float drift ──
  const totalHoursNum = Number(totalHours) || 0;
  const totalMinutesNum = Number(totalMinutes) || 0;
  const usedHoursNum = Number(usedHours) || 0;
  const usedMinutesNum = Number(usedMinutes) || 0;

  const totalInMinutes = totalHoursNum * 60 + totalMinutesNum;
  const usedInMinutes = usedHoursNum * 60 + usedMinutesNum;
  const remainingInMinutes = Math.max(totalInMinutes - usedInMinutes, 0);
  const remainingHours = Math.floor(remainingInMinutes / 60);
  const remainingMins = remainingInMinutes % 60;

  const hoursPartNum = Number(hours) || 0;
  const minutesPartNum = Number(minutes) || 0;
  const enteredInMinutes = hoursPartNum * 60 + minutesPartNum;

  const hasHoursInput =
    hours.toString().trim() !== "" || minutes.toString().trim() !== "";

  const projectedTotalMinutes = usedInMinutes + enteredInMinutes;
  const overLimit =
    totalInMinutes > 0 && hasHoursInput && projectedTotalMinutes > totalInMinutes;

  const progressPct =
    totalInMinutes > 0
      ? Math.min((projectedTotalMinutes / totalInMinutes) * 100, 100)
      : 0;

  const refreshEntries = async () => {
    if (!id) return;
    try {
      const header = {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      };
      const res = await ApiService(
        {},
        id,
        header,
        getPmstaskById.method,
        getPmstaskById.url,
      );
      if (!res?.data?.error) {
        const fetched = Array.isArray(res?.data?.data) ? res.data.data : [];
        setTaskEntries(fetched);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!category) newErrors.category = "Category is required";
    if (!taskText.trim()) newErrors.task = "Task is required";
    if (!hasHoursInput) {
      newErrors.hours = "Hours or minutes is required";
    } else if (minutesPartNum >= 60) {
      newErrors.hours = "Minutes must be less than 60";
    } else if (enteredInMinutes <= 0) {
      newErrors.hours = "Enter a valid duration";
    } else if (totalInMinutes > 0 && overLimit) {
      newErrors.hours = `Only ${remainingHours}h ${remainingMins}m remaining out of ${totalHoursNum}h ${totalMinutesNum}m`;
    }

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    if (!id) {
      toast.error("Missing task id");
      return;
    }
    setErrors({});

    try {
      setSubmitting(true);
      const header = {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      };

      const res = await ApiService(
        {
          id,
          category,
          task: taskText,
          hours: hoursPartNum,
          minutes: minutesPartNum,
        },
        0,
        header,
        addPms.method,
        addPms.url,
      );

      if (!res.data.error) {
        toast.success(res.data.message || "Task updated successfully");
        // Pull the fresh "Added Updates" list right after a successful add
        await refreshEntries();
        handleClose();
        onSuccess?.();
        setCategory("");
        setTaskText("");
        setHours("");
        setMinutes("");
      } else {
        toast.error(res.data?.message || "An error occurred");
      }
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "An unexpected error occurred.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <>
      <style>{MODAL_CSS}</style>

      <div className="av-backdrop" onClick={handleClose}>
        <div className="av-dialog" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="av-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 3,
                  height: 20,
                  borderRadius: 2,
                  background: `linear-gradient(180deg, ${THEME.brand} 0%, ${THEME.brandMid} 100%)`,
                }}
              />
              <h2
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 700,
                  color: THEME.text,
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                Work Done
              </h2>
            </div>
            <button
              onClick={handleClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: `1.5px solid ${THEME.border}`,
                background: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                color: THEME.textMuted,
                lineHeight: 1,
                transition: "all 0.15s",
              }}
            >
              ×
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit}>
            <div className="av-body">
              {/* Existing task shown as a read-only title */}
              <div style={{ marginBottom: 18 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    color: THEME.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Task
                </label>
                <div className="av-task-title">
                  {initialTask?.trim() ? initialTask : "—"}
                </div>

                {totalInMinutes > 0 && (
                  <>
                    <div className="av-hours-summary">
                      <span
                        className="av-hours-chip"
                        style={{
                          background: THEME.brandLight,
                          color: THEME.brand,
                          border: `1px solid ${THEME.border}`,
                        }}
                      >
                        Total: {totalHoursNum}h {totalMinutesNum}m
                      </span>
                      <span
                        className="av-hours-chip"
                        style={{
                          background: "#FFF7E6",
                          color: "#D46B08",
                          border: "1px solid #FFD591",
                        }}
                      >
                        Used: {usedHoursNum}h {usedMinutesNum}m
                      </span>
                      <span
                        className="av-hours-chip"
                        style={{
                          background:
                            remainingInMinutes > 0 ? "#F6FFED" : THEME.errorLight,
                          color: remainingInMinutes > 0 ? "#389E0D" : THEME.error,
                          border: `1px solid ${remainingInMinutes > 0 ? "#B7EB8F" : THEME.errorBorder}`,
                        }}
                      >
                        Remaining: {remainingHours}h {remainingMins}m
                      </span>
                    </div>
                    <div className="av-progress-track">
                      <div
                        className="av-progress-fill"
                        style={{
                          width: `${progressPct}%`,
                          background: overLimit ? THEME.error : THEME.brand,
                        }}
                      />
                    </div>
                  </>
                )}

                {/* List of previously added updates (task + hours + minutes), fetched via getPmstaskById */}
                <div className="av-entries-wrap">
                  <div className="av-entries-header">
                    <span>
                      Added Updates{" "}
                      {taskEntries.length > 0 ? `(${taskEntries.length})` : ""}
                    </span>
                    {loadingEntries && <span className="av-entries-spinner" />}
                  </div>
                  <div className="av-entries-list">
                    {taskEntries.length > 0 ? (
                      taskEntries.map((entry, idx) => (
                        <div className="av-entry-row" key={entry.id ?? idx}>
                          <span className="av-entry-task">
                            {entry.task?.trim() ? entry.task : "—"}
                          </span>
                          <span className="av-entry-hours">
                            {entry.hours || 0}h {entry.minutes || 0}m
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="av-entries-empty">
                        {loadingEntries
                          ? "Loading updates…"
                          : "No updates added yet"}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Category dropdown */}
              <div style={{ marginBottom: 16 }}>
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
                  Category
                  <span style={{ color: THEME.error, marginLeft: 3 }}>*</span>
                </label>
                <select
                  className={`av-select ${errors.category ? "err" : ""}`}
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setErrors((p) => ({ ...p, category: "" }));
                  }}
                >
                  <option value="" disabled>
                    Select category…
                  </option>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 11,
                      color: THEME.error,
                    }}
                  >
                    {errors.category}
                  </p>
                )}
              </div>

              {/* New task note — starts empty */}
              <div>
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
                  Update
                  <span style={{ color: THEME.error, marginLeft: 3 }}>*</span>
                </label>
                <textarea
                  className={`av-textarea ${errors.task ? "err" : ""}`}
                  value={taskText}
                  onChange={(e) => {
                    setTaskText(e.target.value);
                    setErrors((p) => ({ ...p, task: "" }));
                  }}
                  placeholder="Write your update…"
                  autoFocus
                />
                {errors.task && (
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 11,
                      color: THEME.error,
                    }}
                  >
                    {errors.task}
                  </p>
                )}
              </div>

              {/* Hours + Minutes */}
              <div style={{ marginTop: 16 }}>
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
                  Duration
                  <span style={{ color: THEME.error, marginLeft: 3 }}>*</span>
                  {totalInMinutes > 0 && (
                    <span
                      style={{
                        fontWeight: 400,
                        color: THEME.textMuted,
                        marginLeft: 6,
                      }}
                    >
                      (max {remainingHours}h {remainingMins}m remaining)
                    </span>
                  )}
                </label>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <input
                      className={`av-input ${errors.hours || overLimit ? "err" : ""}`}
                      type="text"
                      inputMode="numeric"
                      name="hours"
                      value={hours}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "" || /^\d{0,3}$/.test(v)) {
                          setHours(v);
                          setErrors((p) => ({ ...p, hours: "" }));
                        }
                      }}
                      placeholder="Hours"
                      maxLength={3}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <input
                      className={`av-input ${errors.hours || overLimit ? "err" : ""}`}
                      type="text"
                      inputMode="numeric"
                      name="minutes"
                      value={minutes}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "" || /^\d{0,2}$/.test(v)) {
                          setMinutes(v);
                          setErrors((p) => ({ ...p, hours: "" }));
                        }
                      }}
                      placeholder="Minutes"
                      maxLength={2}
                    />
                  </div>
                </div>
                {errors.hours ? (
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 11,
                      color: THEME.error,
                    }}
                  >
                    {errors.hours}
                  </p>
                ) : overLimit ? (
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 11,
                      color: THEME.error,
                    }}
                  >
                    This exceeds the remaining {remainingHours}h {remainingMins}m —
                    reduce the duration.
                  </p>
                ) : null}
              </div>
            </div>

            {/* Footer */}
            <div className="av-footer">
              <SecondaryBtn onClick={handleClose}>Cancel</SecondaryBtn>
              <PrimaryBtn type="submit" disabled={submitting || overLimit}>
                {submitting ? (
                  <>
                    <span className="av-btn-spinner" /> Updating…
                  </>
                ) : (
                  "✓ Update Task"
                )}
              </PrimaryBtn>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default UpdateTaskModal;