import React, { useEffect, useState, memo } from "react";
import { useParams } from "react-router-dom";
import ApiService from "../../../services/ApiService";
import { getToken } from "../../../services/useLocalStorage";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import toast from "react-hot-toast";
import {
  fetchconceptcategorybyid,
  deleteConcept,
} from "../../../config/config";
import { FileUrl } from "../../../config/file_url";
import { openFileInNewTab, getFileDisplayUrl } from "../../../services/S3Service";
import DcCategoryModal from "./Modals/DcCategoryModal";
import DcInternalstatusModal from "./Modals/DcInternalstatusModal";
import DcClientstatusModal from "./Modals/DcClientstatusModal";
import AddDcModal from "./Modals/AddDcModal";
import UpdateDcCategoryModal from "./Modals/UpdateDcCategoryModal";

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
  @keyframes idcFadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  .idc-fade { animation:idcFadeIn 0.25s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes idcSpin { to{transform:rotate(360deg)} }
  .idc-spinner { width:24px;height:24px;border-radius:50%;border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};animation:idcSpin 0.8s linear infinite; }

  .idc-table { width:100%;border-collapse:collapse;font-family:'DM Sans',sans-serif;font-size:13px; }
  .idc-table th { padding:9px 12px;font-size:10px;font-weight:700;color:${THEME.brandDark};text-transform:uppercase;letter-spacing:0.07em;background:${THEME.brandLight};border-bottom:2px solid #D4C4A0;white-space:nowrap; }
  .idc-table td { padding:11px 12px;border-bottom:1px solid #F5EFE4;vertical-align:middle; }
  .idc-table tbody tr:nth-child(even) { background:${THEME.rowAlt}; }
  .idc-table tbody tr:hover { background:${THEME.rowHover}; }

  /* status: string "0"/"1"/"2" */
  .idc-badge { display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600; }
  .idc-badge.approved  { background:#F6FFED;color:#389E0D;border:1px solid #B7EB8F; }
  .idc-badge.rejected  { background:#FFF1F0;color:#CF1322;border:1px solid #FFA39E; }
  .idc-badge.pending   { background:#FFF7E6;color:#D46B08;border:1px solid #FFD591; }
  .idc-badge.clickable { cursor:pointer; }
  .idc-badge.disabled  { opacity:0.45;cursor:not-allowed; }

  .idc-acc-header { display:flex;align-items:center;justify-content:space-between;padding:12px 16px;cursor:pointer;background:#FDFAF5;border-radius:12px;transition:background 0.15s;user-select:none; }
  .idc-acc-header:hover { background:${THEME.brandLight}; }
  .idc-acc-header.open { border-radius:12px 12px 0 0;background:${THEME.brandLight}; }

  .idc-edit-btn { width:28px;height:28px;border-radius:7px;border:1.5px solid ${THEME.border};background:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all 0.15s;flex-shrink:0; }
  .idc-edit-btn:hover { background:${THEME.brandLight};border-color:${THEME.brand}; }
  .idc-del-btn { width:28px;height:28px;border-radius:7px;border:1.5px solid #FFA39E;background:#FFF1F0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all 0.15s; }
  .idc-del-btn:hover { background:#CF1322;border-color:#CF1322; }
  .idc-del-btn:hover svg { stroke:#fff; }
  .idc-btn-primary { padding:8px 16px;border-radius:10px;border:none;background:${THEME.brand};color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.18s;box-shadow:0 2px 6px ${THEME.brand}44; }
  .idc-btn-primary:hover { background:${THEME.brandDark}; }
  .idc-btn-sm { padding:5px 12px;border-radius:8px;border:none;background:${THEME.brand};color:#fff;font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s; }
  .idc-btn-sm:hover { background:${THEME.brandDark}; }

  .idc-avatar { width:28px;height:28px;border-radius:50%;object-fit:cover;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.1); }
`;

// ─────────────────────────────────────────────
//  ATOMS  — string status "0"/"1"/"2"
// ─────────────────────────────────────────────
function StatusBadge({ status, onClick, disabled }) {
  const cfg = {
    1: { cls: "approved", label: "Approved" },
    2: { cls: "rejected", label: "Rejected" },
    0: { cls: "pending", label: "Pending" },
  }[String(status)] ?? { cls: "pending", label: "Pending" };
  return (
    <span
      className={`idc-badge ${cfg.cls}${onClick && !disabled ? " clickable" : ""}${disabled ? " disabled" : ""}`}
      onClick={disabled ? undefined : onClick}
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

const getDisplayName = (filePath) => {
  if (!filePath) return "";
  const fileName = filePath.split("/").pop(); // get last part after /
  const withoutTimestamp = fileName.replace(/^[\d.]+_[\d.]+-/, ""); // remove timestamp prefix
  return withoutTimestamp;
};

// ─────────────────────────────────────────────
//  CONCEPT ACCORDION
// ─────────────────────────────────────────────
const ConceptAccordion = memo(
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
        {/* Header */}
        <div
          className={`idc-acc-header${open ? " open" : ""}`}
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
            className="idc-edit-btn"
            title="Edit category"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(items[0]?.mc_id);
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

        {/* Body */}
        {open && (
          <div style={{ overflowX: "auto" }}>
            <table className="idc-table">
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
                      No designs added.
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => {
                      const isPdf = item.design_photo
                      ?.toLowerCase()
                      .endsWith(".pdf");
                    return (
                    <tr key={item.id}>
                      <td
                        style={{
                          color: THEME.textMuted,
                          fontWeight: 700,
                          width: 36,
                        }}
                      >
                        {idx + 1}
                      </td>

                      {/* Design */}
                  <td style={{ minWidth: 200 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            {item.design_photo &&
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
                                    window.open(
                                      `${FileUrl}/${item.design_photo}`,
                                      "_blank",
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
                                    title={getDisplayName(item.design_photo)}
                                  >
                                    {getDisplayName(item.design_photo)}
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
                                    window.open(
                                      `${FileUrl}/${item.design_photo}`,
                                      "_blank",
                                    )
                                  }
                                >
                                  <img
                                    src={`${FileUrl}/${item.design_photo}`}
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
                                    title={getDisplayName(item.design_photo)}
                                  >
                                    {getDisplayName(item.design_photo)}
                                  </span>
                                </div>
                              ))}

                            {item?.remark && (
                              <span style={{ fontSize: 13, color: "#657488" }}>
                                {item?.remark}
                              </span>
                            )}
                          </div>
                        </td>

                      {/* Internal review — string status */}
                      <td
                        onClick={() => onInternal(item?.cid)}
                        style={{ cursor: "pointer" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <StatusBadge
                            status={item.internalstatus}
                            onClick={() => onInternal(item?.cid)}
                          />
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

                      {/* Client review — disabled until internal approved */}
                      <td
                        onClick={() =>
                          item.internalstatus === "1"
                            ? onClient(item?.cid)
                            : null
                        }
                        style={{
                          cursor:
                            item.internalstatus === "1"
                              ? "pointer"
                              : "not-allowed",
                          opacity: item.internalstatus === "1" ? 1 : 0.5,
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
                            disabled={item.internalstatus !== "1"}
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

                      {/* Uploaded by */}
                      <td>
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
                              className="idc-avatar"
                              alt="reviewer"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%20width%3D%2264%22%20height%3D%2264%22%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2232%22%20r%3D%2232%22%20fill%3D%22%23d1d5db%22%2F%3E%3Cpath%20d%3D%22M32%2014a12%2012%200%201%200%200%2024%2012%2012%200%200%200%200-24zm0%2028c-13.3%200-24%208.5-24%2019v3h48v-3c0-10.5-10.7-19-24-19z%22%20fill%3D%22%239ca3af%22%2F%3E%3C%2Fsvg%3E";
                              }}
                            />
                          )}
                          {item.date && (
                            <span
                              style={{ fontSize: 11, color: THEME.textMuted }}
                            >
                              {item.date}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action */}
                      <td>
                        {item.clientstatus === "0" &&
                          item.internalstatus === "0" && (
                            <button
                              className="idc-del-btn"
                              title="Delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(item?.cid);
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
                  )
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
                className="idc-btn-sm"
                onClick={() => onAdd(items[0]?.mc_id)}
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
function DesignConcept() {
  const params = useParams();
  const header = {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showInternalModal, setShowInternalModal] = useState(false);
  const [showSpaceModal, setShowSpaceModal] = useState(false);
  const [showcatModal, setShowcatModal] = useState(false);
  const [catgeoryData, setCatgeoryData] = useState({});
  const [catgeoryId, setCatgeoryId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await ApiService(
        null,
        params.id,
        header,
        fetchconceptcategorybyid.method,
        fetchconceptcategorybyid.url,
      );
      if (!res.data.error) {
        const grouped = (res.data.data || []).reduce((acc, item) => {
          const cat = item.title ?? "uncategorized";
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

  const onRemovedc = (id) => {
    SwalAlert({}).then(async (r) => {
      if (!r.isConfirmed) return;
      setLoading(true);
      try {
        const res = await ApiService(
          null,
          id,
          header,
          deleteConcept.method,
          deleteConcept.url,
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

      <div style={{ fontFamily: "'DM Sans',sans-serif" }} className="idc-fade">
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
              Design Concept
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
            className="idc-btn-primary"
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
            <div className="idc-spinner" />
            <p style={{ color: THEME.textLight, fontSize: 13, margin: 0 }}>
              Loading…
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && categories.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🎨</div>
            <p
              style={{
                color: THEME.textLight,
                fontSize: 13,
                margin: "0 0 12px",
              }}
            >
              No design concept categories yet.
            </p>
            <button
              className="idc-btn-primary"
              onClick={() => setShowModal(true)}
            >
              + Add Category
            </button>
          </div>
        )}

        {/* Accordions */}
        {!loading &&
          categories.map(([groupName, items]) => (
            <ConceptAccordion
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
              onDelete={onRemovedc}
              onAdd={(id) => {
                setCatgeoryId(id);
                setShowSpaceModal(true);
              }}
              onEdit={(id) => {
                setCatgeoryId(id);
                setShowcatModal(true);
              }}
            />
          ))}
      </div>

      {/* Modals */}
      <DcCategoryModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        id={params.id}
        onSuccess={fetchData}
      />
      <UpdateDcCategoryModal
        show={showcatModal}
        handleClose={() => setShowcatModal(false)}
        editId={catgeoryId}
        onSuccess={fetchData}
      />
      <AddDcModal
        show={showSpaceModal}
        handleClose={() => setShowSpaceModal(false)}
        id={catgeoryId}
        params={params.id}
        onSuccess={fetchData}
      />
      <DcInternalstatusModal
        show={showInternalModal}
        handleClose={() => setShowInternalModal(false)}
        id={catgeoryId}
        onSuccess={fetchData}
      />
      <DcClientstatusModal
        show={showClientModal}
        handleClose={() => setShowClientModal(false)}
        id={catgeoryId}
        onSuccess={fetchData}
      />
    </>
  );
}

export default DesignConcept;
