import React, { useEffect, useState, memo } from "react";
import { useParams } from "react-router-dom";
import ApiService from "../../../services/ApiService";
import { getToken } from "../../../services/useLocalStorage";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import toast from "react-hot-toast";
import {
  getarch3dbyid,
  deletearchThreed,
  updatearchthreedstage,
} from "../../../config/config";
import { FileUrl } from "../../../config/file_url";
import AddThreeDcategory from "./Modals/AddThreeDcategory";
import UpdateThreedCatModal from "./Modals/UpdateThreedCatModal";
import ThreedClientstatusModal from "./Modals/ThreedClientstatusModal";
import Add3dinernalStatus from "./Modals/Add3dinternalStatus";
import AddThreedModal from "./Modals/AddThreedModal";
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
  @keyframes tdFadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  .td-fade { animation:tdFadeIn 0.25s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes tdSpin { to{transform:rotate(360deg)} }
  .td-spinner { width:24px;height:24px;border-radius:50%;border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};animation:tdSpin 0.8s linear infinite; }

  .td-table { width:100%;border-collapse:collapse;font-family:'DM Sans',sans-serif;font-size:13px; }
  .td-table th { padding:9px 12px;font-size:10px;font-weight:700;color:${THEME.brandDark};text-transform:uppercase;letter-spacing:0.07em;background:${THEME.brandLight};border-bottom:2px solid #D4C4A0;white-space:nowrap; }
  .td-table td { padding:11px 12px;border-bottom:1px solid #F5EFE4;vertical-align:middle; }
  .td-table tbody tr:nth-child(even) { background:${THEME.rowAlt}; }
  .td-table tbody tr:hover { background:${THEME.rowHover}; }

  .td-badge { display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600; }
  .td-badge.approved { background:#F6FFED;color:#389E0D;border:1px solid #B7EB8F; }
  .td-badge.rejected { background:#FFF1F0;color:#CF1322;border:1px solid #FFA39E; }
  .td-badge.pending  { background:#FFF7E6;color:#D46B08;border:1px solid #FFD591; }
  .td-badge.click    { cursor:pointer; }

  .td-acc-header { display:flex;align-items:center;justify-content:space-between;padding:12px 16px;cursor:pointer;background:#FDFAF5;border-radius:12px;transition:background 0.15s;user-select:none; }
  .td-acc-header:hover { background:${THEME.brandLight}; }
  .td-acc-header.open  { border-radius:12px 12px 0 0;background:${THEME.brandLight}; }

  .td-edit-btn { width:28px;height:28px;border-radius:7px;border:1.5px solid ${THEME.border};background:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all 0.15s;flex-shrink:0; }
  .td-edit-btn:hover { background:${THEME.brandLight};border-color:${THEME.brand}; }
  .td-del-btn  { width:28px;height:28px;border-radius:7px;border:1.5px solid #FFA39E;background:#FFF1F0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all 0.15s; }
  .td-del-btn:hover { background:#CF1322;border-color:#CF1322; }
  .td-del-btn:hover svg { stroke:#fff; }

  .td-btn-primary { padding:8px 16px;border-radius:10px;border:none;background:${THEME.brand};color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.18s;box-shadow:0 2px 6px ${THEME.brand}44; }
  .td-btn-primary:hover { background:${THEME.brandDark}; }
  .td-btn-sm { padding:5px 12px;border-radius:8px;border:none;background:${THEME.brand};color:#fff;font-size:11px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s; }
  .td-btn-sm:hover { background:${THEME.brandDark}; }
  .td-avatar { width:28px;height:28px;border-radius:50%;object-fit:cover;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.1); }
`;

// ─────────────────────────────────────────────
//  ATOMS
// ─────────────────────────────────────────────
function StatusBadge({ status, onClick }) {
  const cfg = {
    1: { cls: "approved", label: "Approved" },
    2: { cls: "rejected", label: "Rejected" },
    0: { cls: "pending", label: "Pending" },
  }[status] ?? { cls: "pending", label: "Pending" };
  return (
    <span
      className={`td-badge ${cfg.cls}${onClick ? " click" : ""}`}
      onClick={onClick}
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
//  3D ACCORDION
// ─────────────────────────────────────────────
const ThreedAccordion = memo(
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
          className={`td-acc-header${open ? " open" : ""}`}
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
            className="td-edit-btn"
            title="Edit"
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

        {/* Body */}
        {open && (
          <div style={{ overflowX: "auto" }}>
            <table className="td-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Description</th>
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
                      colSpan={7}
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
                      <td>
                        <p
                          style={{
                            margin: "0 0 2px",
                            fontSize: 13,
                            fontWeight: 600,
                            color: THEME.text,
                          }}
                        >
                          {item.vendor}
                        </p>
                        {item.phone && (
                          <span
                            style={{ fontSize: 11, color: THEME.textMuted }}
                          >
                            {item.phone}
                          </span>
                        )}
                      </td>
                    <td style={{ minWidth: 200 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                                        gap: 6,
                          }}
                        >
                          <FileThumb path={item.designphoto} />
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
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <StatusBadge
                            status={item.internalstatus}
                            // onClick={() => onInternal(items?.tdid)}
                             onClick={() => {
                           
                              onInternal(item?.tdid);
                            }}
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
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <StatusBadge
                            status={item.clientstatus}
                            // onClick={() => onClient(items?.tdid)}
                            onClick={() => {
                         
                              onClient(item?.tdid);
                            }}
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
                            gap: 8,
                          }}
                        >
                          {item.review_profile && (
                            <img
                              src={`${FileUrl}/${item.review_profile}`}
                              className="td-avatar"
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
                      <td>
                        {item.clientstatus === 0 && (
                          <button
                            className="td-del-btn"
                            title="Delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(item?.tdid);
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
              <button className="td-btn-sm" onClick={() => onAdd(items[0]?.id)}>
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
function ThreeD() {
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
  const [stageCompleted, setStageCompleted] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await ApiService(
        null,
        params.id,
        header,
        getarch3dbyid.method,
        getarch3dbyid.url,
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

  useEffect(() => {
    fetchData();
  }, [params.id]);



  const onRemovespaceplanning = (id) => {
    SwalAlert({}).then(async (r) => {
      if (!r.isConfirmed) return;
      setLoading(true);
      try {
        const res = await ApiService(
          null,
          id,
          header,
          deletearchThreed.method,
          deletearchThreed.url,
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
        updatearchthreedstage.method,
        updatearchthreedstage.url,
      );
    } catch (e) {
      console.error(e);
    }
  };

  const categories = Object.entries(catgeoryData).filter(
    ([g, items]) => g.trim() && items.length > 0,
  );

  return (
    <>
      <style>{CSS}</style>

      <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
        {/* ── Section header ── */}
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
              3D Designs
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
          <button className="td-btn-primary" onClick={() => setShowModal(true)}>
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
            <div className="td-spinner" />
            <p style={{ color: THEME.textLight, fontSize: 13, margin: 0 }}>
              Loading…
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && categories.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🧊</div>
            <p
              style={{
                color: THEME.textLight,
                fontSize: 13,
                margin: "0 0 12px",
              }}
            >
              No 3D categories yet.
            </p>
          </div>
        )}

        {/* Accordions */}
        {!loading &&
          categories.map(([groupName, items]) => (
            <ThreedAccordion
              key={groupName}
              groupName={groupName}
              items={items}
              onInternal={(tdid) => {
           
                setCatgeoryId(tdid);
                setShowInternalModal(true);
              }}
              onClient={(tdid) => {
           
                setCatgeoryId(tdid);
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
          ))}

        {/* Stage completed */}
        {!loading && (
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
              id="stage_completed_3d"
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
              htmlFor="stage_completed_3d"
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
        )}
      </div>

      {/* Modals */}
      <AddThreeDcategory
        show={showModal}
        handleClose={() => setShowModal(false)}
        id={params.id}
        onSuccess={fetchData}
      />
      <UpdateThreedCatModal
        show={showcatModal}
        handleClose={() => setShowcatModal(false)}
        editId={catgeoryId}
        onSuccess={fetchData}
      />
      <AddThreedModal
        show={showSpaceModal}
        handleClose={() => setShowSpaceModal(false)}
        id={catgeoryId}
        params={params.id}
        onSuccess={fetchData}
      />
      <ThreedClientstatusModal
        show={showClientModal}
        handleClose={() => setShowClientModal(false)}
        id={catgeoryId}
        onSuccess={fetchData}
      />
      <Add3dinernalStatus
        show={showInternalModal}
        handleClose={() => setShowInternalModal(false)}
        id={catgeoryId}
        onSuccess={fetchData}
      />
    </>
  );
}

export default ThreeD;
