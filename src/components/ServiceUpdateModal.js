import { PUBLIC_URL } from "../config/backend";
import React, { useEffect, useState } from "react";
import { getServicebyId, updateService, fetchHod } from "../config/config";
import ApiService from "../services/ApiService";
import { getToken } from "../services/useLocalStorage";
import toast from "react-hot-toast";

// ─────────────────────────────────────────────
//  🎨  THEME  (same as AddFile.jsx)
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

const MODAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }

  .su-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45);
    z-index: 1040;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .su-dialog {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.18);
    width: 100%; max-width: 820px;
    max-height: 90vh;
    display: flex; flex-direction: column;
    font-family: 'DM Sans', sans-serif;
    overflow: hidden;
  }
  .su-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px;
    border-bottom: 1px solid ${THEME.border};
    flex-shrink: 0;
  }
  .su-body {
    padding: 24px;
    overflow-y: auto;
    flex: 1;
  }
  .su-footer {
    display: flex; align-items: center; justify-content: flex-end;
    gap: 10px; padding: 16px 24px;
    border-top: 1px solid ${THEME.border};
    flex-shrink: 0;
  }

  /* Table */
  .su-table { width: 100%; border-collapse: collapse; font-size: 13px; font-family: 'DM Sans', sans-serif; }
  .su-table th {
    padding: 10px 12px; font-size: 11px; font-weight: 700;
    color: ${THEME.brandDark}; text-transform: uppercase;
    letter-spacing: 0.07em; background: ${THEME.brandLight};
    border-bottom: 2px solid #D4C4A0; white-space: nowrap;
  }
  .su-table td { padding: 8px 10px; border-bottom: 1px solid #F5EFE4; vertical-align: middle; }
  .su-table tbody tr:nth-child(even) { background: #FEFCF9; }

  /* Inputs */
  .su-input, .su-select {
    width: 100%; padding: 9px 12px; border-radius: 10px;
    border: 1.5px solid #E0D5C5; font-size: 13px;
    font-family: 'DM Sans', sans-serif; color: #1A1A2E;
    outline: none; background: #fff; appearance: auto;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .su-input:focus, .su-select:focus {
    border-color: ${THEME.brand};
    box-shadow: 0 0 0 3px ${THEME.brand}18;
  }
  .su-input::placeholder { color: ${THEME.textLight}; }

  @keyframes suSpin { to { transform: rotate(360deg); } }
  .su-spinner {
    width: 26px; height: 26px; border-radius: 50%;
    border: 3px solid ${THEME.brandLight};
    border-top-color: ${THEME.brand};
    animation: suSpin 0.8s linear infinite;
    margin: 40px auto; display: block;
  }
`;

// ─────────────────────────────────────────────
//  🧩  ATOMS
// ─────────────────────────────────────────────

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
        fontFamily: "'DM Sans', sans-serif",
        transition: "all 0.18s",
      }}
    >
      {children}
    </button>
  );
}

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

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const ServiceUpdateModal = ({ show, handleClose, fileId, onSuccess }) => {
  const FileUrls = PUBLIC_URL;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hod, setHoD] = useState([]);
  const [caseid, setCaseId] = useState("");
  const [fileName, setFileName] = useState("");
  const [dynamicFields, setDynamicFields] = useState([
    { project_name: "", assign_to_hod: "", days: "" },
  ]);

  const authHeader = {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };

  // ── API calls ─────────────────────────────

  const fetchHOD = async () => {
    try {
      const res = await ApiService(
        null,
        0,
        { Authorization: `Bearer ${getToken()}` },
        fetchHod.method,
        fetchHod.url,
      );
      if (!res.data.error) setHoD(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchdata = async () => {
    try {
      setLoading(true);

      // ✅ Reset state before every fetch so stale data never leaks in
      setDynamicFields([{ project_name: "", assign_to_hod: "", days: "" }]);
      setFileName("");
      setCaseId("");

      const res = await ApiService(
        null,
        fileId,
        authHeader,
        getServicebyId.method,
        getServicebyId.url,
      );
      if (!res.data?.error) {
        const payload = res.data.data;
        const mapped = payload.map((item) => ({
          project_name: item.application_name || "",
          assign_to_hod: item.assign_to_hod || "",
          days: item.no_of_days || "",
        }));
        console.log("payload",payload)

        const rawCaseId = payload[0].case_id || "";
        const baseCase = rawCaseId.includes("/")
          ? rawCaseId.substring(0, rawCaseId.lastIndexOf("/") + 1)
          : rawCaseId;
        setCaseId(baseCase);
        setDynamicFields(mapped);

        // ✅ Rebuild fileName from the fetched data
        setFileName(
          mapped.map((f) => PROJECT_TITLES[f.project_name] || "").join(""),
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchHOD();
    if (fileId) fetchdata();
  }, [fileId]);

  // ── Dynamic rows ──────────────────────────

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
  };

  const addField = () =>
    setDynamicFields((p) => [
      ...p,
      { project_name: "", assign_to_hod: "", days: "" },
    ]);

  const removeField = (index) => {
    const updated = dynamicFields.filter((_, i) => i !== index);
    setFileName(
      updated.map((f) => PROJECT_TITLES[f.project_name] || "").join(""),
    );
    setDynamicFields(updated);
  };

  const selectedProjectNames = dynamicFields.map((f) => f.project_name);

  // ── Submit ────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
     console.log("caseid:", caseid);
  console.log("fileName:", fileName);
  console.log("final caseID:", `${caseid}${fileName}`);

    try {
      setSubmitting(true);
      const res = await ApiService(
        { dynamicFields, ID: fileId, caseID: `${caseid}${fileName}` },
        0,
        authHeader,
        updateService.method,
        updateService.url,
      );
      if (res.status === 201) {
        toast.success("Service updated successfully");
        onSuccess();
        handleClose();
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while submitting.");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Reset everything when modal is closed
  useEffect(() => {
    if (!show) {
      setDynamicFields([{ project_name: "", assign_to_hod: "", days: "" }]);
      setFileName("");
      setCaseId("");
    }
  }, [show]);

  if (!show) return null;

  return (
    <>
      <style>{MODAL_CSS}</style>

      {/* Backdrop */}
      <div className="su-backdrop" onClick={handleClose}>
        {/* Dialog — stop click propagation so clicking inside doesn't close */}
        <div className="su-dialog" onClick={(e) => e.stopPropagation()}>
          {/* ── Header ── */}
          <div className="su-header">
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
                Update Service
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

          {/* ── Body ── */}
          <form onSubmit={handleSubmit}>
            <div className="su-body">
              {loading ? (
                <div className="su-spinner" />
              ) : (
                <>
                  {/* Table */}
                  <div
                    style={{
                      overflowX: "auto",
                      borderRadius: 10,
                      border: `1px solid ${THEME.border}`,
                      marginBottom: 12,
                    }}
                  >
                    <table className="su-table">
                      <thead>
                        <tr>
                          <th style={{ width: 36 }}>#</th>
                          <th>Application Name</th>
                          <th>Assign HOD</th>
                          <th>No. of Days</th>
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
                              }}
                            >
                              {idx + 1}
                            </td>

                            <td style={{ minWidth: 180 }}>
                              <select
                                className="su-select"
                                name="project_name"
                                value={field.project_name}
                                onChange={(e) => handleDynamicChange(idx, e)}
                              >
                                <option value="">-- Select --</option>
                                {PROJECT_OPTIONS.map((opt) => (
                                  <option
                                    key={opt.value}
                                    value={opt.value}
                                    disabled={
                                      selectedProjectNames.includes(
                                        opt.value,
                                      ) && field.project_name !== opt.value
                                    }
                                  >
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td style={{ minWidth: 160 }}>
                              <select
                                className="su-select"
                                name="assign_to_hod"
                                value={field.assign_to_hod}
                                onChange={(e) => handleDynamicChange(idx, e)}
                              >
                                <option value="">-- Select --</option>
                                {hod.map((h) => (
                                  <option key={h.id} value={h.id}>
                                    {h.first_name} {h.last_name}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td style={{ minWidth: 100 }}>
                              <input
                                className="su-input"
                                type="number"
                                name="days"
                                placeholder="Days"
                                value={field.days}
                                onChange={(e) => handleDynamicChange(idx, e)}
                              />
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
                                    color: THEME.error,
                                    fontSize: 16,
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

                  {/* Add Row */}
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <GhostBtn onClick={addField}>+ Add Row</GhostBtn>
                  </div>
                </>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="su-footer">
              <SecondaryBtn onClick={handleClose}>Cancel</SecondaryBtn>
              <PrimaryBtn type="submit" disabled={submitting || loading}>
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
                        animation: "suSpin 0.7s linear infinite",
                      }}
                    />
                    Saving…
                  </>
                ) : (
                  "✓ Save Changes"
                )}
              </PrimaryBtn>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ServiceUpdateModal;
