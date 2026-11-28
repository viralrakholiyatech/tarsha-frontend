import React, { useEffect, useState, memo } from "react";
import { useParams } from "react-router-dom";
import ApiService from "../../../services/ApiService";
import { getToken } from "../../../services/useLocalStorage";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import toast from "react-hot-toast";
import { deletearchStructure, archstructuebyid } from "../../../config/config";
import { FileUrl } from "../../../config/file_url";
import AddStructurecategory from "./Modals/AddStructurecategory";
import StructureClientstatusModal from "./Modals/StructureClientstatusModal";
import StructureInternalStatus from "./Modals/StructureInternalStatus";
import ShowStructureModal from "./Modals/ShowStructureModal";
import { openFileInNewTab, getFileDisplayUrl } from "../../../services/S3Service";

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
  @keyframes stFadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  .str-fade { animation:stFadeIn 0.25s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes strSpin { to{transform:rotate(360deg)} }
  .str-spinner { width:24px;height:24px;border-radius:50%;border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};animation:strSpin 0.8s linear infinite; }

  .str-table { width:100%;border-collapse:collapse;font-family:'DM Sans',sans-serif;font-size:13px; }
  .str-table th { padding:9px 12px;font-size:10px;font-weight:700;color:${THEME.brandDark};text-transform:uppercase;letter-spacing:0.07em;background:${THEME.brandLight};border-bottom:2px solid #D4C4A0;white-space:nowrap; }
  .str-table td { padding:11px 12px;border-bottom:1px solid #F5EFE4;vertical-align:middle; }
  .str-table tbody tr:nth-child(even) { background:${THEME.rowAlt}; }
  .str-table tbody tr:hover { background:${THEME.rowHover}; }

  .str-badge { display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600; }
  .str-badge.approved { background:#F6FFED;color:#389E0D;border:1px solid #B7EB8F; }
  .str-badge.rejected { background:#FFF1F0;color:#CF1322;border:1px solid #FFA39E; }
  .str-badge.pending  { background:#FFF7E6;color:#D46B08;border:1px solid #FFD591; }

  .str-acc-header { display:flex;align-items:center;justify-content:space-between;padding:12px 16px;cursor:pointer;background:#FDFAF5;border-radius:12px;transition:background 0.15s;user-select:none; }
  .str-acc-header:hover { background:${THEME.brandLight}; }
  .str-acc-header.open { border-radius:12px 12px 0 0;background:${THEME.brandLight}; }

  .str-del-btn { width:28px;height:28px;border-radius:7px;border:1.5px solid #FFA39E;background:#FFF1F0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all 0.15s; }
  .str-del-btn:hover { background:#CF1322;border-color:#CF1322; }
  .str-del-btn:hover svg { stroke:#fff; }
  .str-btn-primary { padding:8px 16px;border-radius:10px;border:none;background:${THEME.brand};color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.18s;box-shadow:0 2px 6px ${THEME.brand}44; }
  .str-btn-primary:hover { background:${THEME.brandDark}; }
  .str-btn-sm { padding:5px 12px;border-radius:8px;border:none;background:${THEME.brand};color:#fff;font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s; }
  .str-btn-sm:hover { background:${THEME.brandDark}; }

  .str-avatar { width:28px;height:28px;border-radius:50%;object-fit:cover;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.1); }
`;

// ─────────────────────────────────────────────
//  ATOMS
// ─────────────────────────────────────────────
// Note: status values here are strings "0"/"1"/"2"
function StatusBadge({ status, onClick }) {
  const cfg = {
    1: { cls: "approved", label: "Approved" },
    2: { cls: "rejected", label: "Rejected" },
    0: { cls: "pending", label: "Pending" },
  }[String(status)] ?? { cls: "pending", label: "Pending" };
  return (
    <span
      className={`str-badge ${cfg.cls}`}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
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

const getDisplayName = (filePath) => {
  if (!filePath) return "";
  const fileName = filePath.split("/").pop();
  const withoutTimestamp = fileName.replace(/^[\d.]+_[\d.]+-/, "");
  return withoutTimestamp;
};

function FileThumb({ path }) {
  if (!path) return null;
  const isPdf = path.toLowerCase().endsWith(".pdf");
  const name = getDisplayName(path);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: "pointer",
        minWidth: 0,
      }}
      onClick={() => openFileInNewTab(path, FileUrl)}
      title={name}
    >
      {isPdf ? (
        <span style={{ fontSize: 28 }}>📄</span>
      ) : (
        <img
          src={getFileDisplayUrl(path, FileUrl)}
          alt="design"
          style={{
            width: 44,
            height: 44,
            objectFit: "cover",
            borderRadius: 6,
            border: `1px solid ${THEME.border}`,
          }}
        />
      )}
      <span
        style={{
          fontSize: 11,
          color: "#657488",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: 180,
          display: "block",
          marginTop: 3,
        }}
      >
        {name}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────
//  STRUCTURE ACCORDION
// ─────────────────────────────────────────────
const StructureAccordion = memo(
  ({ groupName, items, onInternal, onClient, onDelete, onAdd }) => {
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
          className={`str-acc-header${open ? " open" : ""}`}
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
        </div>

        {open && (
          <div style={{ overflowX: "auto" }}>
            <table className="str-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>ZED Upload</th>
                  <th>Agency Upload</th>
                  <th>Date</th>
                  <th>Agency Name</th>
                  <th>Internal Status</th>
                  <th>Client Status</th>
                  <th>Uploaded By</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
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
                  items.map((item, idx) => (
                    <tr key={item.asid}>
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
                            gap: 6,
                          }}
                        >
                        <FileThumb path={item.zed_upload} />
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
                      <td style={{ minWidth: 200 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <FileThumb path={item.agency_upload} />
                        </div>
                      </td>
                      <td
                        style={{
                          color: THEME.textMuted,
                          fontSize: 12,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.date || "—"}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {item.agency_name || "—"}
                      </td>
                      {/* Internal status */}
                      <td
                        onClick={() => onInternal(item?.asid)}
                        style={{ cursor: "pointer" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
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
                      {/* Client status */}
                      <td
                        onClick={() => onClient(item?.asid)}
                        style={{ cursor: "pointer" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <StatusBadge status={item.clientstatus} />
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
                      {/* Uploaded by */}
                      <td>
                        {item.profile_picture ? (
                          <img
                            src={`${FileUrl}/${item.profile_picture}`}
                            className="str-avatar"
                            alt="uploader"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%20width%3D%2264%22%20height%3D%2264%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2232%22%20r%3D%2232%22%20fill%3D%22%23d1d5db%22%2F%3E%3Cpath%20d%3D%22M32%2014a12%2012%200%201%200%200%2024%2012%2012%200%200%200%200-24zm0%2028c-13.3%200-24%208.5-24%2019v3h48v-3c0-10.5-10.7-19-24-19z%22%20fill%3D%22%239ca3af%22%2F%3E%3C%2Fsvg%3E";
                            }}
                          />
                        ) : (
                          "—"
                        )}
                      </td>
                      {/* Action */}
                      <td>
                        {item.internalstatus === "0" && (
                          <button
                            className="str-del-btn"
                            title="Delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(item?.asid);
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
                  ))
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
                className="str-btn-sm"
                onClick={() => onAdd(items[0]?.mad_id)}
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
function Structure() {
  const params = useParams();
  const header = {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showInternalModal, setShowInternalModal] = useState(false);
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [catgeoryData, setCatgeoryData] = useState({});
  const [catgeoryId, setCatgeoryId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await ApiService(
        null,
        params.id,
        header,
        archstructuebyid.method,
        archstructuebyid.url,
      );
      if (!res.data.error) {
        const grouped = (res.data.data || []).reduce((acc, item) => {
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

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const onRemoveStructure = (id) => {
    SwalAlert({}).then(async (r) => {
      if (!r.isConfirmed) return;
      setLoading(true);
      try {
        const res = await ApiService(
          null,
          id,
          header,
          deletearchStructure.method,
          deletearchStructure.url,
        );
        if (!res.data.error) {
          toast.success(res.data.message);
          fetchData();
        } else toast.error(res.data.message);
      } catch (e) {
        toast.error(e?.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    });
  };

  const categories = Object.entries(catgeoryData).filter(
    ([g, items]) => g.trim() && items.length > 0,
  );

  return (
    <>
      <style>{CSS}</style>

      <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
        {/* Section header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
              Structure
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
              {categories.length} categor{categories.length !== 1 ? "ies" : "y"}
            </span>
          </div>
          <button
            className="str-btn-primary"
            onClick={() => setShowModal(true)}
          >
            + Add Category
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px 0",
              gap: 12,
            }}
          >
            <div className="str-spinner" />
            <p style={{ color: THEME.textLight, fontSize: 13, margin: 0 }}>
              Loading…
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && categories.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🏗️</div>
            <p
              style={{
                color: THEME.textLight,
                fontSize: 13,
                margin: "0 0 12px",
              }}
            >
              No structure categories yet.
            </p>
          </div>
        )}

        {/* Accordions */}
        {!loading &&
          categories.map(([groupName, items]) => (
            <StructureAccordion
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
              onDelete={onRemoveStructure}
              onAdd={(id) => {
                setCatgeoryId(id);
                setShowStructureModal(true);
              }}
            />
          ))}
      </div>

      {/* Modals */}
      <AddStructurecategory
        show={showModal}
        handleClose={() => setShowModal(false)}
        id={params.id}
        onSuccess={fetchData}
      />
      <ShowStructureModal
        show={showStructureModal}
        handleClose={() => setShowStructureModal(false)}
        editID={catgeoryId}
        id={params.id}
        onSuccess={fetchData}
      />
      <StructureClientstatusModal
        show={showClientModal}
        handleClose={() => setShowClientModal(false)}
        id={catgeoryId}
        onSuccess={fetchData}
      />
      <StructureInternalStatus
        show={showInternalModal}
        handleClose={() => setShowInternalModal(false)}
        id={catgeoryId}
        onSuccess={fetchData}
      />
    </>
  );
}

export default Structure;
