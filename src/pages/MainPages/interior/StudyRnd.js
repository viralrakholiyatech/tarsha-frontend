import React, { useEffect, useState, useRef, memo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ApiService from "../../../services/ApiService";
import { getToken } from "../../../services/useLocalStorage";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import { InteriorRoute } from "../../../config/RouteConfig";
import toast from "react-hot-toast";
import {
  fetchinteriorrndyid,
  upsertinteriorRnd,
  deleteSpacePlannig,
  fetchSpacePlannigbyid,
  getInteriorData,
  updatespstage,
} from "../../../config/config";
import { FileUrl } from "../../../config/file_url";
import AddCategory from "./Modals/AddSpCategory";
import InternalstatusModal from "./Modals/SpInternalStatusModal";
import ClientstatusModal from "./Modals/SpClientStatusModal";
import UpdateSpModal from "./Modals/UpdateSpModal";
import AddSpacePlanningModal from "./Modals/AddSpacePlanningModal";
import axios from "axios";
import { getfileDatabyId } from "../../../config/config";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FaMapLocationDot } from "react-icons/fa6";
import { uploadFileToS3, openFileInNewTab, getFileDisplayUrl } from "../../../services/S3Service";

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
  rowAlt: "#FEFCF9",
  rowHover: "#FDFAF5",
  text: "#1A1A2E",
  textMuted: "#ADADAD",
  textLight: "#BDBDBD",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing:border-box; }
  @keyframes stFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .ist-fade { animation:stFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes stSpin { to{transform:rotate(360deg)} }
  .ist-spinner { width:26px;height:26px;border-radius:50%;border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};animation:stSpin 0.8s linear infinite; }

  /* ── Stage tabs ── */
  .ist-tabs { display:flex;gap:6px;flex-wrap:nowrap;overflow-x:auto;padding:0;margin:0;list-style:none;scrollbar-width:none; }
  .ist-tabs::-webkit-scrollbar { display:none; }
  .ist-tab { padding:8px 14px;border-radius:20px;cursor:pointer;white-space:nowrap;font-size:12px;font-weight:600;border:1.5px solid transparent;background:transparent;color:#595959;transition:all 0.18s;font-family:'DM Sans',sans-serif; }
  .ist-tab:hover  { background:${THEME.brandLight};color:${THEME.brand}; }
  .ist-tab.active { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand};font-weight:700; }

  /* ── Sub tabs ── */
  .ist-sub-tabs { display:flex;gap:8px;flex-wrap:wrap; }
  .ist-sub-tab { padding:8px 18px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:600;border:1.5px solid ${THEME.border};background:#fff;color:#595959;transition:all 0.18s;font-family:'DM Sans',sans-serif; }
  .ist-sub-tab:hover  { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand}; }
  .ist-sub-tab.active { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand};font-weight:700; }

  /* ── Inputs ── */
  .ist-input, .ist-textarea {
    width:100%;padding:9px 13px;border-radius:10px;border:1.5px solid #E0D5C5;
    font-size:13px;font-family:'DM Sans',sans-serif;color:#1A1A2E;
    outline:none;background:#fff;transition:border-color 0.15s,box-shadow 0.15s;
  }
  .ist-input:focus, .ist-textarea:focus { border-color:${THEME.brand};box-shadow:0 0 0 3px ${THEME.brand}18; }
  .ist-input::placeholder,.ist-textarea::placeholder { color:${THEME.textLight}; }
  .ist-textarea { resize:vertical;min-height:90px; }

  /* ── Space Planning table ── */
  .ist-table { width:100%;border-collapse:collapse;font-family:'DM Sans',sans-serif;font-size:13px; }
  .ist-table th { padding:9px 12px;font-size:10px;font-weight:700;color:${THEME.brandDark};text-transform:uppercase;letter-spacing:0.07em;background:${THEME.brandLight};border-bottom:2px solid #D4C4A0;white-space:nowrap; }
  .ist-table td { padding:11px 12px;border-bottom:1px solid #F5EFE4;vertical-align:middle; }
  .ist-table tbody tr:nth-child(even) { background:${THEME.rowAlt}; }
  .ist-table tbody tr:hover { background:${THEME.rowHover}; }

  /* ── Status badge ── */
  .ist-badge { display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600; }
  .ist-badge.approved { background:#F6FFED;color:#389E0D;border:1px solid #B7EB8F; }
  .ist-badge.rejected { background:#FFF1F0;color:#CF1322;border:1px solid #FFA39E; }
  .ist-badge.pending  { background:#FFF7E6;color:#D46B08;border:1px solid #FFD591; }
  .ist-badge.disabled { opacity:0.45;cursor:not-allowed; }

  /* ── Accordion ── */
  .ist-acc-header { display:flex;align-items:center;justify-content:space-between;padding:12px 16px;cursor:pointer;background:#FDFAF5;border-radius:12px;transition:background 0.15s;user-select:none; }
  .ist-acc-header:hover { background:${THEME.brandLight}; }
  .ist-acc-header.open { border-radius:12px 12px 0 0;background:${THEME.brandLight}; }

  /* ── Buttons ── */
  .ist-del-btn { width:28px;height:28px;border-radius:7px;border:1.5px solid #FFA39E;background:#FFF1F0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all 0.15s; }
  .ist-del-btn:hover { background:#CF1322;border-color:#CF1322; }
  .ist-del-btn:hover svg { stroke:#fff; }
  .ist-edit-btn { width:28px;height:28px;border-radius:7px;border:1.5px solid ${THEME.border};background:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all 0.15s; }
  .ist-edit-btn:hover { background:${THEME.brandLight};border-color:${THEME.brand}; }
  .ist-btn-primary { padding:10px 24px;border-radius:10px;border:none;background:${THEME.brand};color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:'Sora',sans-serif;transition:all 0.18s;box-shadow:0 2px 8px ${THEME.brand}44; }
  .ist-btn-primary:hover:not(:disabled) { background:${THEME.brandDark}; }
  .ist-btn-primary:disabled { background:#C4C4C4;box-shadow:none;cursor:not-allowed; }
  .ist-btn-outline { padding:10px 24px;border-radius:10px;border:1.5px solid ${THEME.border};background:#fff;color:#595959;font-size:13px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.18s; }
  .ist-btn-outline:hover { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand}; }
  .ist-btn-sm { padding:5px 12px;border-radius:8px;border:none;background:${THEME.brand};color:#fff;font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s; }
  .ist-btn-sm:hover { background:${THEME.brandDark}; }

  /* ── Avatar ── */
  .ist-avatar { width:34px;height:34px;border-radius:50%;object-fit:cover;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.12); }
  .ist-avatar-stack { display:flex;align-items:center; }
  .ist-avatar-stack .ist-avatar { margin-left:-8px; }
  .ist-avatar-stack .ist-avatar:first-child { margin-left:0; }

  /* ── Image preview ── */
  .ist-img-preview { width:80px;height:80px;object-fit:cover;border-radius:8px;border:1.5px solid ${THEME.border};margin:4px; }

  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:${THEME.brandLight}; }
  ::-webkit-scrollbar-thumb { background:${THEME.brandMid};border-radius:10px; }
`;

// ─────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────
const STAGES = [
  { key: "basic_details", label: "Basic Details" },
  { key: "study", label: "Study/RND" },
  { key: "quotation", label: "Quotation" },
  { key: "design", label: "Design Concept" },
  { key: "consultants", label: "Consultants" },
  { key: "technical", label: "Technical Drawings" },
  { key: "schedule", label: "Schedule" },
  { key: "riskMatrix", label: "Risk Matrix" },
  { key: "sitevisit", label: "Site Visit" },
];
const ROUTE_MAP = {
  "Basic Details": InteriorRoute.basicdetails,
  Study: InteriorRoute.study,
  "Study/RND": InteriorRoute.study,
  Quotation: InteriorRoute.quotation,
  "Design Concept": InteriorRoute.concept,
  Consultants: InteriorRoute.consultants,
  "Technical Drawings": InteriorRoute.technicaldrawing,
  Schedule: InteriorRoute.schedule,
  "Risk Matrix": InteriorRoute.riskMatrix,
  "Site Visit": InteriorRoute.sitevisit,
};

// ─────────────────────────────────────────────
//  ATOMS
// ─────────────────────────────────────────────
function FieldLabel({ children }) {
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
    </label>
  );
}

function StatusBadge({ status, onClick, disabled }) {
  const cfg = {
    1: { cls: "approved", label: "Approved" },
    2: { cls: "rejected", label: "Rejected" },
    0: { cls: "pending", label: "Pending" },
  }[status] ?? { cls: "pending", label: "Pending" };
  return (
    <span
      className={`ist-badge ${cfg.cls}${disabled ? " disabled" : ""}`}
      onClick={disabled ? undefined : onClick}
      style={{ cursor: onClick && !disabled ? "pointer" : "default" }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: "currentColor",
        }}
      />
      {cfg.label}
    </span>
  );
}

function FileThumb({ path }) {
  if (!path) return null;
  const isPdf = path.toLowerCase().endsWith(".pdf");
  return isPdf ? (
    <span
      onClick={() => openFileInNewTab(path, FileUrl)}
      style={{ fontSize: 22, cursor: "pointer" }}
      title="View PDF"
    >
      📄
    </span>
  ) : (
    <img
      src={getFileDisplayUrl(path, FileUrl)}
      alt="design"
      onClick={() => openFileInNewTab(path, FileUrl)}
      style={{
        width: 44,
        height: 44,
        objectFit: "cover",
        borderRadius: 6,
        border: `1px solid ${THEME.border}`,
        cursor: "pointer",
      }}
    />
  );
}

function InfoTile({ label, value, children }) {
  return (
    <div
      style={{
        background: THEME.brandLight,
        border: `1px solid #D4C4A0`,
        borderRadius: 10,
        padding: "8px 12px",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 10,
          fontWeight: 700,
          color: THEME.brandMid,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </p>
      <div
        style={{
          marginTop: 3,
          fontSize: 12,
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

function AvatarStack({ src, alt = "User" }) {
  if (!src)
    return (
      <img
        src={"data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%20width%3D%2264%22%20height%3D%2264%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2232%22%20r%3D%2232%22%20fill%3D%22%23d1d5db%22%2F%3E%3Cpath%20d%3D%22M32%2014a12%2012%200%201%200%200%2024%2012%2012%200%200%200%200-24zm0%2028c-13.3%200-24%208.5-24%2019v3h48v-3c0-10.5-10.7-19-24-19z%22%20fill%3D%22%239ca3af%22%2F%3E%3C%2Fsvg%3E"}
        className="ist-avatar"
        style={{ marginLeft: 0 }}
        alt={alt}
      />
    );
  return (
    <div className="ist-avatar-stack">
      {src.split(",").map((p, i) => (
        <img
          key={i}
          className="ist-avatar"
          src={`${FileUrl}/${p}`}
          alt={alt}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%20width%3D%2264%22%20height%3D%2264%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2232%22%20r%3D%2232%22%20fill%3D%22%23d1d5db%22%2F%3E%3Cpath%20d%3D%22M32%2014a12%2012%200%201%200%200%2024%2012%2012%200%200%200%200-24zm0%2028c-13.3%200-24%208.5-24%2019v3h48v-3c0-10.5-10.7-19-24-19z%22%20fill%3D%22%239ca3af%22%2F%3E%3C%2Fsvg%3E";
          }}
        />
      ))}
    </div>
  );
}

const getDisplayName = (filePath) => {
  if (!filePath) return "";
  const fileName = filePath.split("/").pop(); // get last part after /
  const withoutTimestamp = fileName.replace(/^[\d.]+_[\d.]+-/, ""); // remove timestamp prefix
  return withoutTimestamp;
};

// ─────────────────────────────────────────────
//  SPACE PLANNING ACCORDION
// ─────────────────────────────────────────────
const SpaceAccordion = memo(
  ({ groupName, items, onInternal, onClient, onDelete, onAdd, onEdit }) => {
    const [open, setOpen] = useState(true);
    return (
      <div
        style={{
          border: `1px solid ${THEME.border}`,
          borderRadius: 12,
          marginBottom: 12,
          overflow: "hidden",
        }}
      >
        <div
          className={`ist-acc-header${open ? " open" : ""}`}
          onClick={() => setOpen((v) => !v)}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg
              style={{
                transition: "transform 0.2s",
                transform: open ? "rotate(180deg)" : "rotate(0)",
                flexShrink: 0,
              }}
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke={THEME.textMuted}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 700, color: THEME.text }}>
              {groupName}
            </span>
            <span
              style={{
                padding: "1px 8px",
                borderRadius: 20,
                fontSize: 10,
                fontWeight: 600,
                background: "#F0F5FF",
                color: "#2F54EB",
                border: "1px solid #ADC6FF",
              }}
            >
              {items.length} item{items.length !== 1 ? "s" : ""}
            </span>
          </div>
          <button
            type="button"
            className="ist-edit-btn"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(items[0]?.id);
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke={THEME.brand}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>

        {open && (
          <div style={{ overflowX: "auto" }}>
            <table className="ist-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Design</th>
                  <th>Internal Review</th>
                  <th>Client Review</th>
                  <th>Uploaded By</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        textAlign: "center",
                        color: THEME.textLight,
                        padding: 20,
                      }}
                    >
                      No items added.
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => {
                    const isPdf = item.materialphoto
                      ?.toLowerCase()
                      .endsWith(".pdf");
                    return (
                      <tr key={item.aspid}>
                        <td
                          style={{
                            color: THEME.textMuted,
                            fontWeight: 700,
                            width: 36,
                          }}
                        >
                          {idx + 1}
                        </td>
                        <td style={{ minWidth: 200 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            {item.materialphoto &&
                              (isPdf ? (
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    cursor: "pointer",
                                    minWidth: 0,
                                  }}
                                  onClick={() =>
                                    openFileInNewTab(
                                      item.materialphoto,
                                      FileUrl,
                                    )
                                  }
                                >
                                  <span style={{ fontSize: 28 }}>📄</span>
                                  <span
                                    style={{
                                      fontSize: 11,
                                      color: "#657488",
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      maxWidth: 180,
                                      display: "block",
                                    }}
                                    title={getDisplayName(item.materialphoto)}
                                  >
                                    {getDisplayName(item.materialphoto)}
                                  </span>
                                </div>
                              ) : (
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    cursor: "pointer",
                                    minWidth: 0,
                                  }}
                                  onClick={() =>
                                    openFileInNewTab(
                                      item.materialphoto,
                                      FileUrl,
                                    )
                                  }
                                >
                                  <img
                                    src={getFileDisplayUrl(item.materialphoto, FileUrl)}
                                    alt="Design"
                                    style={{
                                      width: 44,
                                      height: 44,
                                      objectFit: "cover",
                                      borderRadius: 6,
                                      border: `1px solid ${THEME.border}`,
                                    }}
                                  />
                                  <span
                                    style={{
                                      fontSize: 11,
                                      color: "#657488",
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      maxWidth: 180,
                                      display: "block",
                                    }}
                                    title={getDisplayName(item.materialphoto)}
                                  >
                                    {getDisplayName(item.materialphoto)}
                                  </span>
                                </div>
                              ))}
                            {/* <FileThumb path={item.materialphoto} /> */}
                            {item?.notes && (
                              <span
                                style={{
                                  fontSize: 13,
                                  color: "#657488",
                                }}
                              >
                                {item?.notes}
                              </span>
                            )}
                          </div>
                        </td>
                        <td
                          onClick={() => onInternal(item?.spid)}
                          style={{ cursor: "pointer" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            {item.review_profile && (
                              <img
                                src={`${FileUrl}/${item.review_profile}`}
                                className="ist-avatar"
                                style={{ width: 24, height: 24 }}
                                alt="reviewer"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%20width%3D%2264%22%20height%3D%2264%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2232%22%20r%3D%2232%22%20fill%3D%22%23d1d5db%22%2F%3E%3Cpath%20d%3D%22M32%2014a12%2012%200%201%200%200%2024%2012%2012%200%200%200%200-24zm0%2028c-13.3%200-24%208.5-24%2019v3h48v-3c0-10.5-10.7-19-24-19z%22%20fill%3D%22%239ca3af%22%2F%3E%3C%2Fsvg%3E";
                                }}
                              />
                            )}
                            <StatusBadge status={item.internalstatus} />
                            {item.internalremark && (
                              <span
                                title={item.internalremark}
                                style={{
                                  fontSize: 13,
                                  color: "#657488",
                                  cursor: "help",
                                }}
                              >
                                ℹ️
                              </span>
                            )}
                          </div>
                        </td>
                        <td
                          onClick={() =>
                            item.internalstatus === 1
                              ? onClient(item?.spid)
                              : null
                          }
                          style={{
                            cursor:
                              item.internalstatus === 1
                                ? "pointer"
                                : "not-allowed",
                            opacity: item.internalstatus === 1 ? 1 : 0.5,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <StatusBadge
                              status={item.clientstatus}
                              disabled={item.internalstatus !== 1}
                            />
                            {item.clientremark && (
                              <span
                                title={item.clientremark}
                                style={{
                                  fontSize: 13,
                                  color: "#657488",
                                  cursor: "help",
                                }}
                              >
                                ℹ️
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            {item.profile_picture && (
                              <img
                                src={`${FileUrl}/${item.profile_picture}`}
                                className="ist-avatar"
                                style={{ width: 24, height: 24 }}
                                alt="uploader"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%20width%3D%2264%22%20height%3D%2264%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2232%22%20r%3D%2232%22%20fill%3D%22%23d1d5db%22%2F%3E%3Cpath%20d%3D%22M32%2014a12%2012%200%201%200%200%2024%2012%2012%200%200%200%200-24zm0%2028c-13.3%200-24%208.5-24%2019v3h48v-3c0-10.5-10.7-19-24-19z%22%20fill%3D%22%239ca3af%22%2F%3E%3C%2Fsvg%3E";
                                }}
                              />
                            )}
                            {item.Date && (
                              <span
                                style={{ fontSize: 11, color: THEME.textMuted }}
                              >
                                {item.Date}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          {item.clientstatus === 0 &&
                            item.internalstatus === 0 && (
                              <button
                                type="button"
                                className="ist-del-btn"
                                title="Delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(item?.spid);
                                }}
                              >
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="#CF1322"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                  <path d="M10 11v6" />
                                  <path d="M14 11v6" />
                                </svg>
                              </button>
                            )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            <div
              style={{
                padding: "10px 16px",
                display: "flex",
                justifyContent: "flex-end",
                borderTop: `1px solid ${THEME.border}`,
              }}
            >
              <button
                type="button"
                className="ist-btn-sm"
                onClick={() => onAdd(items[0]?.id)}
              >
                + Add
              </button>
            </div>
          </div>
        )}
      </div>
    );
  },
);

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
function StudyRnd() {
  const params = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const header = {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("study");
  const [subActiveTab, setSubActiveTab] = useState("rnd");
  const [showModal, setShowModal] = useState(false);
  const [catgeoryId, setCatgeoryId] = useState(null);
  const [catgeoryData, setCatgeoryData] = useState({});
  const [hodimage, setHodImage] = useState("");
  const [teamId, setTeamId] = useState("");
  const [caseId, setCaseId] = useState("");
  const [startDate, setstartDate] = useState("");
  const [endDate, setendDate] = useState("");
  const [stageCompleted, setStageCompleted] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showInternalModal, setShowInternalModal] = useState(false);
  const [showSpaceModal, setShowSpaceModal] = useState(false);
  const [showcatModal, setShowcatModal] = useState(false);
  const [data, setData] = useState({});
  const [filedata, setFiledata] = useState(null);
  const [formData, setFormData] = useState({
    keyobservation: "",
    remark: "",
    summary: "",
    siteincharge: "",
    authorized: "",
    site_image: [],
    existing_images: [],
    report: null,
    existing_report: "",
  });

  // ── Fetchers ──────────────────────────────
  const fetchRndData = async () => {
    setLoading(true);
    try {
      const res = await ApiService(
        null,
        params.id,
        header,
        fetchinteriorrndyid.method,
        fetchinteriorrndyid.url,
      );
      if (!res.data.error) {
        const p = res.data.data;
        setFormData((prev) => ({
          ...prev,
          keyobservation: p.keyobservation || "",
          remark: p.remarks || "",
          summary: p.summary || "",
          siteincharge: p.site_incharge || "",
          authorized: p.authorized_person || "",
          existing_report: p.report || "",
          existing_images: p.image || [],
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await ApiService(
        null,
        params.id,
        header,
        fetchSpacePlannigbyid.method,
        fetchSpacePlannigbyid.url,
      );
      if (!res.data.error) {
        const payload = res.data.data || [];
        if (payload.length > 0) setStageCompleted(payload[0].is_done);
        const grouped = payload.reduce((acc, item) => {
          const cat = item.name ?? "uncategorized";
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(item);
          return acc;
        }, {});
        setCatgeoryData(grouped);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchInteriorData = async () => {
    try {
      const res = await ApiService(
        null,
        params.id,
        { Authorization: `Bearer ${getToken()}` },
        getInteriorData.method,
        getInteriorData.url,
      );
      if (!res.data.error) {
        const D = res.data.data?.find((item) => item.title === "Study/RND");
        if (D) {
          setData(D);
          setTeamId(D.assign_picture || "");
          setHodImage(D.hod_pictures || "");
          setCaseId(D.case_id || "");
          setstartDate(
            D.assign_on
              ? String(D.assign_on).split(/[T ]/)[0]
              : "",
          );
          setendDate(
            D.completed_by
              ? String(D.completed_by).split(/[T ]/)[0]
              : "",
          );
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFileDataById = async () => {
    try {
      const res = await axios.get(`${getfileDatabyId.url}/${params.id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.data.error) setFiledata(res.data.data[0]);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRndData();
    fetchData();
    fetchInteriorData();
    fetchFileDataById();
  }, [params.id]);

  const handleChange = async (e) => {
    const { name, value, files } = e.target;
    if (files) {
      if (name === "site_image") {
        const fileList = Array.from(files);
        if (!fileList.length) return;
        const toastId = toast.loading(`Uploading ${fileList.length} site images to AWS S3...`);
        try {
          setUploading(true);
          const uploadResults = await Promise.all(
            fileList.map((file) => uploadFileToS3(file, null, "interior/study"))
          );
          const keys = uploadResults.map((r) => r.key);
          setFormData((p) => ({
            ...p,
            site_image: [...(p.site_image || []), ...keys],
          }));
          toast.success("Site images uploaded to AWS S3!", { id: toastId });
        } catch (err) {
          console.error(err);
          toast.error("Failed to upload site images to AWS S3.", { id: toastId });
        } finally {
          setUploading(false);
        }
      } else if (name === "report") {
        const file = files[0];
        if (!file) return;
        const toastId = toast.loading("Uploading report to AWS S3...");
        try {
          setUploading(true);
          const { key } = await uploadFileToS3(file, null, "interior/study");
          setFormData((p) => ({ ...p, report: key }));
          toast.success("Report uploaded to AWS S3!", { id: toastId });
        } catch (err) {
          console.error(err);
          toast.error("Failed to upload report to AWS S3.", { id: toastId });
        } finally {
          setUploading(false);
        }
      }
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const handleAccordionClick = (id, label) => {
    const route = ROUTE_MAP[label];
    if (route) navigate(`/${route}/${id}`);
  };

  const handleCheckboxChange = async () => {
    const isChecked = !stageCompleted;
    setStageCompleted(isChecked);
    try {
      await ApiService(
        { stage_completed: isChecked ? 1 : 0, id: params.id },
        0,
        {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        updatespstage.method,
        updatespstage.url,
      );
    } catch (e) {
      console.error(e);
    }
  };

  const onRemovespaceplanning = (id) => {
    SwalAlert({}).then(async (r) => {
      if (!r.isConfirmed) return;
      setLoading(true);
      try {
        const res = await ApiService(
          null,
          id,
          header,
          deleteSpacePlannig.method,
          deleteSpacePlannig.url,
        );
        if (!res.data.error) {
          toast.success(res.data.message);
          fetchData();
        } else toast.error(res.data.message);
      } catch (e) {
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploading) {
      toast.error("Please wait for files to finish uploading to AWS S3");
      return;
    }
    setSubmitting(true);
    try {
      const formPayload = new FormData();
      formPayload.append("keyobservation", formData.keyobservation);
      formPayload.append("remarks", formData.remark);
      formPayload.append("summary", formData.summary);
      formPayload.append("site_incharge", formData.siteincharge);
      formPayload.append("authorized_person", formData.authorized || "");
      formPayload.append("editid", params.id);
      formData.site_image.forEach((file) =>
        formPayload.append("site_image", file),
      );
      if (formData.report) formPayload.append("report", formData.report);

      const res = await ApiService(
        formPayload,
        0,
        {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "multipart/form-data",
        },
        upsertinteriorRnd.method,
        upsertinteriorRnd.url,
      );
      if (res.status === 200 || res.status === 201) {
        toast.success(res.data.message || "Saved successfully");
        fetchRndData();
      } else toast.error(res.data.message || "Failed to save.");
    } catch (e) {
      console.error(e);
      toast.error("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const categories = Object.entries(catgeoryData).filter(
    ([g, items]) => g.trim() && items.length > 0,
  );

  return (
    <>
      <style>{CSS}</style>

      <div
        style={{
          minHeight: "100vh",
          background: THEME.bg,
          fontFamily: "'DM Sans',sans-serif",
          padding: "28px 24px",
        }}
      >
        {/* ── Top header card ── */}
        <div
          style={{
            background: "#fff",
            border: `1px solid ${THEME.border}`,
            borderRadius: 14,
            padding: "18px 20px",
            marginBottom: 14,
            boxShadow: "0 2px 8px rgba(136,117,73,0.06)",
          }}
        >
          {/* Project info row */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              marginBottom: 14,
            }}
          >
            <button
              onClick={() => navigate(-1)}
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                border: `1.5px solid ${THEME.border}`,
                background: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = THEME.brandLight)
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke={THEME.brand}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  margin: "0 0 3px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: THEME.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                }}
              >
                Project No: {caseId || "—"}
              </p>
              <h1
                style={{
                  margin: "0 0 5px",
                  fontSize: 18,
                  fontWeight: 800,
                  color: THEME.text,
                  fontFamily: "'Sora',sans-serif",
                }}
              >
                {data.project_name || "—"}
              </h1>
              {data.client_name && (
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 600,
                    background: THEME.brandLight,
                    color: THEME.brandDark,
                    border: `1px solid #D4C4A0`,
                  }}
                >
                  {data.client_name}
                </span>
              )}
            </div>
          </div>

          {/* ── File data tiles ── */}
          {filedata && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <InfoTile label="Company" value={filedata.company_name} />
              <InfoTile label="Project Type" value={filedata.project_type} />
              <InfoTile label="Category" value={filedata.category_type} />
              <InfoTile label="Address" value={filedata.address} />
              <InfoTile label="Location">
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Link
                    to={`https://www.google.com/maps?q=${filedata.lat},${filedata.long}`}
                    target="_blank"
                  >
                    <FaMapMarkerAlt
                      style={{ color: "#F44336", fontSize: 15 }}
                    />
                  </Link>
                  <Link to={filedata.google_location || "#"} target="_blank">
                    <FaMapLocationDot
                      style={{ color: "#28a745", fontSize: 15 }}
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
                    style={{ display: "flex", flexDirection: "column", gap: 3 }}
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
                      .filter((r) => r.value?.trim())
                      .map((r) => (
                        <div
                          key={r.label}
                          style={{ display: "flex", gap: 5, fontSize: 11 }}
                        >
                          <span
                            style={{
                              color: THEME.brandMid,
                              fontWeight: 700,
                              minWidth: 60,
                            }}
                          >
                            {r.label}:
                          </span>
                          <span
                            style={{ color: THEME.brandDark, fontWeight: 600 }}
                          >
                            {r.value}
                          </span>
                        </div>
                      ))}
                  </div>
                </InfoTile>
              )}
            </div>
          )}
          <ul className="ist-tabs">
            {STAGES.map((s) => (
              <li key={s.key}>
                <button
                  type="button"
                  className={`ist-tab${activeTab === s.key ? " active" : ""}`}
                  onClick={() => {
                    setActiveTab(s.key);
                    handleAccordionClick(params.id, s.label);
                  }}
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Team strip ── */}
        <div
          style={{
            background: "#fff",
            border: `1px solid ${THEME.border}`,
            borderRadius: 14,
            padding: "14px 20px",
            marginBottom: 14,
            boxShadow: "0 2px 8px rgba(136,117,73,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 20,
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ position: "relative" }}>
                  <AvatarStack src={hodimage} alt="HOD" />
                  <span
                    style={{
                      position: "absolute",
                      bottom: -4,
                      right: -4,
                      padding: "1px 5px",
                      borderRadius: 20,
                      fontSize: 8,
                      fontWeight: 800,
                      background: THEME.brand,
                      color: "#fff",
                    }}
                  >
                    LEAD
                  </span>
                </div>
                <div>
                  <p
                    style={{
                      margin: "0 0 1px",
                      fontSize: 9,
                      fontWeight: 700,
                      color: THEME.textMuted,
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                    }}
                  >
                    Core Facilitator
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      fontWeight: 700,
                      color: THEME.text,
                    }}
                  >
                    {data.hod_name || "—"}
                  </p>
                </div>
              </div>
              <div>
                <p
                  style={{
                    margin: "0 0 5px",
                    fontSize: 9,
                    fontWeight: 700,
                    color: THEME.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  Sub-function Team
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <AvatarStack src={teamId} alt="Team" />
                  {data.assign_name && (
                    <span style={{ fontSize: 12, color: THEME.textMuted }}>
                      {data.assign_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                { label: "Start", value: startDate },
                { label: "End", value: endDate },
              ].map((d) => (
                <div
                  key={d.label}
                  style={{
                    background: THEME.bg,
                    border: `1px solid ${THEME.border}`,
                    borderRadius: 10,
                    padding: "8px 14px",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 2px",
                      fontSize: 10,
                      fontWeight: 700,
                      color: THEME.textMuted,
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                    }}
                  >
                    {d.label}
                  </p>
                  <input
                    type="date"
                    value={d.value || ""}
                    disabled
                    style={{
                      border: "none",
                      background: "transparent",
                      fontSize: 13,
                      fontWeight: 600,
                      color: THEME.text,
                      outline: "none",
                      padding: 0,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main content card ── */}
        <div
          style={{
            background: "#fff",
            border: `1px solid ${THEME.border}`,
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 2px 10px rgba(136,117,73,0.06)",
          }}
        >
          {/* Sub-tab header */}
          <div
            style={{
              padding: "14px 20px",
              borderBottom: `1px solid ${THEME.border}`,
              background: "#FDFAF5",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 800,
                color: THEME.text,
                fontFamily: "'Sora',sans-serif",
              }}
            >
              Study / RND
            </h2>
            <div className="ist-sub-tabs">
              {[
                { key: "rnd", label: "RND" },
                { key: "space", label: "Space Planning" },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  className={`ist-sub-tab${subActiveTab === t.key ? " active" : ""}`}
                  onClick={() => setSubActiveTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: 20 }}>
            {/* ── RND TAB ── */}
            {subActiveTab === "rnd" && (
              <form onSubmit={handleSubmit} noValidate className="ist-fade">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <FieldLabel>Key Observation</FieldLabel>
                    <textarea
                      name="keyobservation"
                      className="ist-textarea"
                      placeholder="Type here…"
                      value={formData.keyobservation}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <FieldLabel>Remarks</FieldLabel>
                    <textarea
                      name="remark"
                      className="ist-textarea"
                      placeholder="Type here…"
                      value={formData.remark}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <FieldLabel>Summary</FieldLabel>
                    <textarea
                      name="summary"
                      className="ist-textarea"
                      placeholder="Type here…"
                      value={formData.summary}
                      onChange={handleChange}
                    />
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 14,
                      alignContent: "start",
                    }}
                  >
                    <div>
                      <FieldLabel>Site Incharge</FieldLabel>
                      <input
                        type="text"
                        name="siteincharge"
                        className="ist-input"
                        placeholder="Type here…"
                        value={formData.siteincharge}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <FieldLabel>Client / Authorized Person</FieldLabel>
                      <input
                        type="text"
                        name="authorized"
                        className="ist-input"
                        placeholder="Type here…"
                        value={formData.authorized}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Images + Report */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <FieldLabel>Site Images</FieldLabel>
                    <div
                      style={{
                        border: `2px dashed #D4C4A0`,
                        borderRadius: 10,
                        padding: "10px 14px",
                        background: "#FDFAF5",
                        fontSize: 12,
                        color: THEME.textMuted,
                        cursor: "pointer",
                        position: "relative",
                        transition: "all 0.18s",
                      }}
                    >
                      <input
                        type="file"
                        name="site_image"
                        multiple
                        onChange={handleChange}
                        style={{
                          position: "absolute",
                          inset: 0,
                          opacity: 0,
                          cursor: "pointer",
                          width: "100%",
                          height: "100%",
                        }}
                      />
                      <span>📷 Click to upload site images (multiple)</span>
                    </div>
                    {(formData.existing_images.length > 0 ||
                      formData.site_image.length > 0) && (
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          flexWrap: "wrap",
                          marginTop: 8,
                        }}
                      >
                        {formData.existing_images.map((p, i) => (
                          <img
                            key={`e-${i}`}
                            src={getFileDisplayUrl(p, FileUrl)}
                            alt={`site-${i}`}
                            className="ist-img-preview"
                            onClick={() => openFileInNewTab(p, FileUrl)}
                            style={{ cursor: "pointer" }}
                          />
                        ))}
                        {formData.site_image.map((f, i) => (
                          <img
                            key={`n-${i}`}
                            src={getFileDisplayUrl(f, FileUrl)}
                            alt={`preview-${i}`}
                            className="ist-img-preview"
                            onClick={() => openFileInNewTab(f, FileUrl)}
                            style={{ cursor: "pointer" }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <FieldLabel>Report</FieldLabel>
                    <div
                      style={{
                        border: `2px dashed #D4C4A0`,
                        borderRadius: 10,
                        padding: "10px 14px",
                        background: "#FDFAF5",
                        fontSize: 12,
                        color: THEME.textMuted,
                        cursor: "pointer",
                        position: "relative",
                        transition: "all 0.18s",
                      }}
                    >
                      <input
                        type="file"
                        name="report"
                        ref={fileInputRef}
                        onChange={handleChange}
                        style={{
                          position: "absolute",
                          inset: 0,
                          opacity: 0,
                          cursor: "pointer",
                          width: "100%",
                          height: "100%",
                        }}
                      />
                      <span>
                        📄{" "}
                        {formData.report || formData.existing_report
                          ? "Replace report…"
                          : "Click to upload report…"}
                      </span>
                    </div>
                    {(formData.report || formData.existing_report) && (
                      <div style={{ marginTop: 8 }}>
                        <span
                          onClick={() =>
                            openFileInNewTab(
                              formData.report || formData.existing_report,
                              FileUrl,
                            )
                          }
                          style={{ fontSize: 22, cursor: "pointer" }}
                          title="View Report"
                        >
                          📄
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 10,
                  }}
                >
                  <button
                    type="button"
                    className="ist-btn-outline"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="ist-btn-primary"
                    disabled={submitting || uploading}
                  >
                    {uploading ? (
                      "Uploading to S3…"
                    ) : submitting ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            border: "2px solid #ffffff88",
                            borderTopColor: "#fff",
                            display: "inline-block",
                            animation: "stSpin 0.7s linear infinite",
                          }}
                        />
                        Saving…
                      </span>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* ── SPACE PLANNING TAB ── */}
            {subActiveTab === "space" && (
              <div className="ist-fade">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 14,
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <div
                      style={{
                        width: 3,
                        height: 14,
                        borderRadius: 2,
                        background: `linear-gradient(180deg,${THEME.brand},${THEME.brandMid})`,
                      }}
                    />
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 13,
                        fontWeight: 700,
                        color: THEME.text,
                      }}
                    >
                      Space Planning
                    </h3>
                    <span
                      style={{
                        padding: "2px 10px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        background: THEME.brandLight,
                        color: THEME.brandDark,
                        border: `1px solid #D4C4A0`,
                      }}
                    >
                      {categories.length} categor
                      {categories.length !== 1 ? "ies" : "y"}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="ist-btn-primary"
                    style={{ fontSize: 11, padding: "6px 14px" }}
                    onClick={() => setShowModal(true)}
                  >
                    + Add Category
                  </button>
                </div>

                {loading ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "40px 0",
                      gap: 12,
                    }}
                  >
                    <div className="ist-spinner" />
                    <p
                      style={{
                        color: THEME.textLight,
                        fontSize: 13,
                        margin: 0,
                      }}
                    >
                      Loading…
                    </p>
                  </div>
                ) : categories.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>🏠</div>
                    <p
                      style={{
                        color: THEME.textLight,
                        fontSize: 13,
                        margin: "0 0 12px",
                      }}
                    >
                      No space planning categories yet.
                    </p>
                    <button
                      type="button"
                      className="ist-btn-primary"
                      onClick={() => setShowModal(true)}
                    >
                      + Add Category
                    </button>
                  </div>
                ) : (
                  categories.map(([groupName, items]) => (
                    <SpaceAccordion
                      key={groupName}
                      groupName={groupName}
                      items={items}
                      onInternal={(id) => {
                        setCatgeoryId(id);
                        setShowInternalModal(true);
                      }}
                      onClient={(id) => {
                        setCatgeoryId(id);
                        setShowClientModal(true);
                      }}
                      onDelete={onRemovespaceplanning}
                      onAdd={(id) => {
                        setCatgeoryId(id);
                        setShowSpaceModal(true);
                      }}
                      onEdit={(id) => {
                        setCatgeoryId(id);
                        setShowcatModal(true);
                      }}
                    />
                  ))
                )}

                {/* Stage checkbox */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 16,
                    paddingTop: 14,
                    borderTop: `1px solid ${THEME.border}`,
                  }}
                >
                  <input
                    type="checkbox"
                    id="stage_completed"
                    style={{
                      width: 16,
                      height: 16,
                      accentColor: THEME.brand,
                      cursor: "pointer",
                    }}
                    checked={!!stageCompleted}
                    onChange={handleCheckboxChange}
                  />
                  <label
                    htmlFor="stage_completed"
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: THEME.text,
                      cursor: "pointer",
                    }}
                  >
                    Mark Initial Stage as Completed
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <AddCategory
        show={showModal}
        handleClose={() => setShowModal(false)}
        id={params.id}
        onSuccess={fetchData}
      />
      <UpdateSpModal
        show={showcatModal}
        handleClose={() => setShowcatModal(false)}
        editId={catgeoryId}
        onSuccess={fetchData}
      />
      <AddSpacePlanningModal
        show={showSpaceModal}
        handleClose={() => setShowSpaceModal(false)}
        id={catgeoryId}
        params={params.id}
        onSuccess={fetchData}
      />
      <InternalstatusModal
        show={showInternalModal}
        handleClose={() => setShowInternalModal(false)}
        id={catgeoryId}
        onSuccess={fetchData}
      />
      <ClientstatusModal
        show={showClientModal}
        handleClose={() => setShowClientModal(false)}
        id={catgeoryId}
        onSuccess={fetchData}
      />
    </>
  );
}

export default StudyRnd;
