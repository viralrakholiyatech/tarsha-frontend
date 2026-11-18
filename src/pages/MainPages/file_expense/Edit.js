// ─────────────────────────────────────────────
//  EditFileExpense.jsx  —  Edit File Expense
//  Same design as AddFileExpense
// ─────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GetDate, todayDate } from "../../../services/DateAndTimeService";
import { getRole, getToken } from "../../../services/useLocalStorage";
import useValidator from "../../../services/Validation";
import { FileUrl } from "../../../config/file_url";
import toast from "react-hot-toast";
import ApiService from "../../../services/ApiService";
import {
  fetchFileExpenseById,
  updateFileExpenseById,
  fetchallStage,
  updateFileExpenseByIdForAdmin,
} from "../../../config/config";
import { FileExpenseRoute } from "../../../config/RouteConfig";
import { adminKey } from "../../../config/RoleConfig";
import axios from "axios";
import { Link } from "react-router-dom";
import { getfileDatabyId } from "../../../config/config";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaMapLocationDot } from "react-icons/fa6";

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
  @keyframes efeFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .efe-fade { animation:efeFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes efeSpin { to{transform:rotate(360deg)} }
  .efe-spinner { width:28px;height:28px;border-radius:50%;border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};animation:efeSpin 0.8s linear infinite; }

  .efe-input, .efe-select, .efe-textarea {
    width:100%;padding:10px 13px;border-radius:10px;
    border:1.5px solid #E0D5C5;font-size:13px;
    font-family:'DM Sans',sans-serif;color:#1A1A2E;
    outline:none;background:#fff;appearance:auto;
    transition:border-color 0.15s,box-shadow 0.15s;
    resize:vertical;
  }
  .efe-input:focus,.efe-select:focus,.efe-textarea:focus {
    border-color:${THEME.brand};box-shadow:0 0 0 3px ${THEME.brand}18;
  }
  .efe-input::placeholder,.efe-textarea::placeholder { color:${THEME.textLight}; }

  /* Upload zone */
  .efe-upload-zone {
    border:2px dashed #D4C4A0;border-radius:12px;
    padding:16px;text-align:center;cursor:pointer;
    background:#FDFAF5;transition:all 0.18s;position:relative;
    flex:1;
  }
  .efe-upload-zone:hover { border-color:${THEME.brand};background:${THEME.brandLight}; }
  .efe-upload-zone input[type=file] {
    position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;
  }
  .efe-upload-zone.has-file { border-color:${THEME.brand};background:${THEME.brandLight}; }

  /* View link button */
  .efe-view-btn {
    padding:8px 14px;border-radius:10px;border:1.5px solid #ADC6FF;
    background:#F0F5FF;color:#2F54EB;font-size:12px;font-weight:700;
    cursor:pointer;text-decoration:none;white-space:nowrap;
    display:inline-flex;align-items:center;gap:5px;transition:all 0.15s;
    font-family:'DM Sans',sans-serif;
  }
  .efe-view-btn:hover { background:#2F54EB;color:#fff;border-color:#2F54EB; }

  ::-webkit-scrollbar{width:5px;}
  ::-webkit-scrollbar-track{background:${THEME.brandLight};}
  ::-webkit-scrollbar-thumb{background:${THEME.brandMid};border-radius:10px;}
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

function Grid({ children, cols = "repeat(auto-fill, minmax(220px, 1fr))" }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: cols, gap: 14 }}>
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

// ─── Upload zone with existing-file preview link ─
function UploadZone({ name, label, onChange, newFile, existingUrl }) {
  const hasNew = !!newFile;
  const hasExisting = !!existingUrl;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <FieldLabel>{label}</FieldLabel>
      <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
        <div className={`efe-upload-zone${hasNew ? " has-file" : ""}`}>
          <input
            type="file"
            name={name}
            onChange={onChange}
            accept="image/*,application/pdf"
          />
          {hasNew ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                pointerEvents: "none",
              }}
            >
              <span style={{ fontSize: 18 }}>✅</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: THEME.brand,
                  maxWidth: 130,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {newFile.name}
              </span>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                pointerEvents: "none",
              }}
            >
              <span style={{ fontSize: 18 }}>📎</span>
              <span
                style={{
                  fontSize: 11,
                  color: THEME.textMuted,
                  fontWeight: 600,
                }}
              >
                Click to upload
              </span>
              {hasExisting && (
                <span style={{ fontSize: 10, color: THEME.textLight }}>
                  Current file saved
                </span>
              )}
            </div>
          )}
        </div>
        {hasExisting && (
          <a
            href={`${FileUrl}/${existingUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="efe-view-btn"
          >
            👁 View
          </a>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const EditFileExpense = () => {
  const navigate = useNavigate();
  const params = useParams();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [imageUrls, setImageUrls] = useState({
    receipt_image: "",
    submitters_img1: "",
    submitters_img2: "",
    submitters_img3: "",
  });
  const [filedata, setFileData] = useState("");
  const [validator, showValidationMessage] = useValidator();

  const [expense, setExpense] = useState({
    amount: "",
    mst_file_id: "",
    description: "",
    date: "",
    receipt_image: null,
    submitters_img1: null,
    submitters_img2: null,
    submitters_img3: null,
  });

  // ── Load files + expense data in parallel ─
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const h = { Authorization: `Bearer ${getToken()}` };
        const hj = {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        };

        const [filesRes, expRes] = await Promise.all([
          ApiService(null, 0, h, fetchallStage.method, fetchallStage.url),
          ApiService(
            null,
            parseInt(params.id),
            hj,
            fetchFileExpenseById.method,
            fetchFileExpenseById.url,
          ),
        ]);

        if (!filesRes.data.error && Array.isArray(filesRes.data.data))
          setFileList(filesRes.data.data);

        if (!expRes.data.error && expRes.data.data?.length > 0) {
          const d = expRes.data.data[0];
          setExpense((p) => ({
            ...p,
            amount: d.amount || "",
            mst_file_id: d.mst_file_id || "",
            description: d.description || "",
            date: GetDate(d.date, "YYYY-MM-DD") || todayDate(),
          }));
          if (d.mst_file_id) fetchFileDataById(d.mst_file_id);
          setImageUrls({
            receipt_image:
              d.receipt_image && d.receipt_image !== "null"
                ? d.receipt_image
                : "",
            submitters_img1:
              d.submitters_img1 && d.submitters_img1 !== "null"
                ? d.submitters_img1
                : "",
            submitters_img2:
              d.submitters_img2 && d.submitters_img2 !== "null"
                ? d.submitters_img2
                : "",
            submitters_img3:
              d.submitters_img3 && d.submitters_img3 !== "null"
                ? d.submitters_img3
                : "",
          });
        } else if (expRes.data.error) {
          toast.error(expRes.data.message);
          navigate(`/${FileExpenseRoute.list}`);
        }
      } catch (e) {
        console.error(e);
        toast.error(e?.response?.data?.message || "Failed to load data");
        navigate(`/${FileExpenseRoute.list}`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id]);

  const handleBack = () => {
    const files = localStorage.getItem("files");
    const path = localStorage.getItem("wallet");
    if (files && path) {
      localStorage.removeItem("files");
      navigate(path);
    } else {
      navigate(`/${FileExpenseRoute.list}`);
    }
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    showValidationMessage(true);
    setExpense((p) => ({ ...p, [name]: value }));
  };

  const onFileInput = (e) => {
    const file = e.target.files[0];
    const name = e.target.name;
    setExpense((p) => ({ ...p, [name]: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    for (const key of Object.keys(expense)) {
      if (expense[key] !== null && expense[key] !== undefined)
        formData.append(key, expense[key]);
    }
    formData.append("id", parseInt(params.id));

    setSubmitting(true);
    try {
      const header = {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "multipart/form-data",
      };
      const updateObj =
        getRole() === adminKey
          ? { ...updateFileExpenseByIdForAdmin }
          : { ...updateFileExpenseByIdForAdmin };
      const res = await ApiService(
        formData,
        0,
        header,
        updateObj.method,
        updateObj.url,
      );
      if (!res.data.error) {
        toast.success(res.data.message);
        navigate(`/${FileExpenseRoute.list}`);
      } else {
        toast.error(res.data.message);
        navigate(`/${FileExpenseRoute.list}`);
      }
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const fetchFileDataById = async (fileId) => {
    try {
      const res = await axios.get(`${getfileDatabyId.url}/${fileId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.data.error) setFileData(res.data.data[0]);
    } catch (err) {
      console.error(err);
    }
  };

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
        <div className="efe-spinner" />
        <p style={{ color: THEME.textLight, fontSize: 13 }}>
          Loading expense data…
        </p>
      </div>
    );
  }

  function InfoTile({ label, value, children }) {
    return (
      <div
        style={{
          background: THEME.brandLight,
          border: `1px solid #D4C4A0`,
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
              Edit File Expense
            </h1>
            <p
              style={{
                margin: "2px 0 0",
                fontSize: 12,
                color: THEME.textMuted,
              }}
            >
              ID #{params.id}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="efe-fade">
            {/* ── 1. Expense Info ── */}
            <CardSection title="Expense Info" icon="🧾">
              <div style={{ marginBottom: 14 }}>
                <FieldLabel required>Description</FieldLabel>
                <textarea
                  className="efe-textarea"
                  rows={3}
                  name="description"
                  placeholder="Describe this expense…"
                  onChange={handleInput}
                  value={expense.description}
                />
                {validator.message(
                  "description",
                  expense.description,
                  "required",
                  { className: "text-danger" },
                )}
              </div>

              <Grid>
                <div>
                  <FieldLabel required>Amount</FieldLabel>
                  <input
                    className="efe-input"
                    type="text"
                    name="amount"
                    placeholder="e.g. 2500"
                    onChange={handleInput}
                    value={expense.amount}
                  />
                  {validator.message(
                    "amount",
                    expense.amount,
                    "required|numeric",
                    { className: "text-danger" },
                  )}
                </div>
                <div>
                  <FieldLabel required>Date</FieldLabel>
                  <input
                    className="efe-input"
                    type="date"
                    name="date"
                    onChange={handleInput}
                    value={expense.date}
                  />
                  {validator.message("date", expense.date, "required", {
                    className: "text-danger",
                  })}
                </div>
                <div>
                  <FieldLabel required>File Name</FieldLabel>
                  <select
                    className="efe-select"
                    name="mst_file_id"
                    onChange={(e) => {
                      fetchFileDataById(e.target.value);
                      handleInput(e);
                    }}
                    value={expense.mst_file_id}
                  >
                    <option value="">Select file…</option>
                    {fileList.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.case_id} — ({f.first_name} {f.last_name})
                      </option>
                    ))}
                  </select>
                  {validator.message("File", expense.mst_file_id, "required", {
                    className: "text-danger",
                  })}
                </div>
              </Grid>
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
                  {(filedata.fp_no ||
                    filedata.ward_no ||
                    filedata.tpscheme ||
                    filedata.cs_no ||
                    filedata.b_no ||
                    filedata.op_no ||
                    filedata.rs_no) && (
                    <InfoTile label="Land Details">
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        {[
                          { label: "FP No", value: filedata.fp_no },
                          { label: "Ward No", value: filedata.ward_no },
                          { label: "TP Scheme", value: filedata.tpscheme },
                          { label: "CS No", value: filedata.cs_no },
                          { label: "B No", value: filedata.b_no },
                          { label: "OP No", value: filedata.op_no },
                          { label: "RS No", value: filedata.rs_no },
                        ]
                          .filter((row) => row.value && row.value.trim() !== "")
                          .map((row) => (
                            <div
                              key={row.label}
                              style={{ display: "flex", gap: 6, fontSize: 12 }}
                            >
                              <span
                                style={{
                                  color: THEME.brandMid,
                                  fontWeight: 700,
                                  minWidth: 68,
                                }}
                              >
                                {row.label}:
                              </span>
                              <span
                                style={{
                                  color: THEME.brandDark,
                                  fontWeight: 600,
                                }}
                              >
                                {row.value}
                              </span>
                            </div>
                          ))}
                      </div>
                    </InfoTile>
                  )}
                </div>
              )}
            </CardSection>

            {/* ── 2. Attachments ── */}
            <CardSection title="Attachments" icon="📎">
              <div style={{ marginBottom: 14 }}>
                <UploadZone
                  name="receipt_image"
                  label="Receipt *"
                  onChange={onFileInput}
                  newFile={expense.receipt_image}
                  existingUrl={imageUrls.receipt_image}
                />
              </div>
              <Grid cols="repeat(3, 1fr)">
                {[
                  { name: "submitters_img1", label: "Submitter Image 1" },
                  { name: "submitters_img2", label: "Submitter Image 2" },
                  { name: "submitters_img3", label: "Submitter Image 3" },
                ].map((img) => (
                  <UploadZone
                    key={img.name}
                    name={img.name}
                    label={img.label}
                    onChange={onFileInput}
                    newFile={expense[img.name]}
                    existingUrl={imageUrls[img.name]}
                  />
                ))}
              </Grid>
            </CardSection>

            {/* ── Actions ── */}
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}
            >
              <SecondaryBtn onClick={handleBack}>← Back</SecondaryBtn>
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
                        animation: "efeSpin 0.7s linear infinite",
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
};

export default EditFileExpense;
