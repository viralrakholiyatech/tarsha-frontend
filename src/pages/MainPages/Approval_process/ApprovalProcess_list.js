import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  memo,
  useRef,
} from "react";
import ApiService from "../../../services/ApiService";
import { getToken, isAdmin } from "../../../services/useLocalStorage";
import {
  deleteapproval,
  fetchAllfile,
  fetchPVfile,
  fetchDCfile,
  fetchFireNocfile,
  fetchENagarPortalfile,
  fetchBpermissionfile,
  getMembersdata,
} from "../../../config/config";
import toast from "react-hot-toast";
import {
  ApprovalRoute,
  FilesRoute,
  FileExpenseRoute,
} from "../../../config/RouteConfig";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import { useNavigate, Link } from "react-router-dom";
import FileDetailsModal from "../../../components/FileDetailsModal";
import ServiceUpdateModal from "../../../components/ServiceUpdateModal";

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
  @keyframes apFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .ap-fade { animation:apFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes apSpin { to{transform:rotate(360deg)} }
  .ap-spinner {
    width:28px;height:28px;border-radius:50%;
    border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};
    animation:apSpin 0.8s linear infinite;
  }

  /* ── Tabs ── */
  .ap-tabs { display:flex;gap:6px;flex-wrap:nowrap;overflow-x:auto;padding:0;margin:0;list-style:none;scrollbar-width:none; }
  .ap-tabs::-webkit-scrollbar { display:none; }
  .ap-tab {
    padding:8px 14px;border-radius:20px;cursor:pointer;white-space:nowrap;
    font-size:12px;font-weight:600;border:1.5px solid transparent;
    background:transparent;color:#595959;transition:all 0.18s;
    font-family:'DM Sans',sans-serif;display:inline-flex;align-items:center;gap:6px;
  }
  .ap-tab:hover  { background:${THEME.brandLight};color:${THEME.brand}; }
  .ap-tab.active { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand};font-weight:700; }
  .ap-tab-count  { background:${THEME.brand};color:#fff;border-radius:20px;padding:1px 7px;font-size:10px;font-weight:800; }
  .ap-tab.active .ap-tab-count { background:${THEME.brandDark}; }

  /* ── Search ── */
  .ap-search-wrap {
    position:relative;display:flex;align-items:center;
  }
  .ap-search-icon {
    position:absolute;left:12px;font-size:14px;color:${THEME.textMuted};pointer-events:none;
  }
  .ap-search-input {
    width:260px;padding:8px 36px 8px 36px;border-radius:10px;
    border:1.5px solid ${THEME.border};background:#fff;
    font-size:13px;font-family:'DM Sans',sans-serif;color:${THEME.text};
    outline:none;transition:all 0.18s;
  }
  .ap-search-input::placeholder { color:${THEME.textLight}; }
  .ap-search-input:focus {
    border-color:${THEME.brand};
    box-shadow:0 0 0 3px rgba(136,117,73,0.12);
  }
  .ap-search-clear {
    position:absolute;right:10px;background:none;border:none;cursor:pointer;
    color:${THEME.textMuted};font-size:16px;padding:0;line-height:1;display:flex;align-items:center;
    transition:color 0.15s;
  }
  .ap-search-clear:hover { color:${THEME.brand}; }
  .ap-search-result-hint {
    font-size:11px;font-weight:600;color:${THEME.textMuted};
    background:${THEME.brandLight};border:1px solid ${THEME.border};
    border-radius:20px;padding:3px 10px;white-space:nowrap;
  }

  /* ── Table ── */
  .ap-table { width:100%;border-collapse:collapse;font-family:'DM Sans',sans-serif; }
  .ap-table th {
    padding:10px 14px;font-size:11px;font-weight:700;color:${THEME.brandDark};
    text-transform:uppercase;letter-spacing:0.07em;
    background:${THEME.brandLight};border-bottom:2px solid #D4C4A0;white-space:nowrap;
  }
  .ap-table td { padding:12px 14px;border-bottom:1px solid #F5EFE4;vertical-align:top; }
  .ap-table tbody tr:nth-child(even) { background:${THEME.rowAlt}; }
  .ap-table tbody tr:hover { background:${THEME.rowHover}; }

  /* ── Highlight match ── */
  .ap-highlight {
    background:#FFF3CD;color:#5C4E32;border-radius:3px;padding:0 2px;font-weight:700;
  }

  /* ── Status Cards ── */
  .ap-status-card {
    cursor:pointer;
    transition:transform 0.15s, box-shadow 0.15s, outline 0.15s;
    outline:2.5px solid transparent;
    outline-offset:2px;
  }
  .ap-status-card:hover {
    transform:translateY(-2px);
    box-shadow:0 4px 16px rgba(136,117,73,0.13);
  }
  .ap-status-card.active-filter {
    box-shadow:0 4px 16px rgba(136,117,73,0.18);
  }

  /* ── Action dropdown ── */
  .ap-menu-wrap { position:relative;display:inline-block; }
  .ap-menu-btn {
    width:32px;height:32px;border-radius:8px;cursor:pointer;
    background:transparent;border:1.5px solid ${THEME.border};
    display:flex;align-items:center;justify-content:center;
    font-size:18px;color:${THEME.textMuted};transition:all 0.15s;
  }
  .ap-menu-btn:hover { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand}; }
  .ap-dropdown {
    position:absolute;right:0;top:38px;z-index:200;
    background:#fff;border:1px solid ${THEME.border};border-radius:12px;
    box-shadow:0 8px 24px rgba(0,0,0,0.12);overflow:hidden;min-width:170px;
  }
  .ap-drop-item {
    display:block;width:100%;padding:10px 16px;font-size:13px;font-weight:600;
    border:none;background:transparent;cursor:pointer;text-align:left;
    color:${THEME.text};transition:background 0.15s;font-family:'DM Sans',sans-serif;text-decoration:none;
  }
  .ap-drop-item:hover        { background:${THEME.brandLight};color:${THEME.brand}; }
  .ap-drop-item.danger:hover { background:#FFF1F0;color:#CF1322; }

  ::-webkit-scrollbar { width:5px;height:5px; }
  ::-webkit-scrollbar-track { background:${THEME.brandLight}; }
  ::-webkit-scrollbar-thumb { background:${THEME.brandMid};border-radius:10px; }
`;

// ─────────────────────────────────────────────
//  🔧  STATUS HELPERS
// ─────────────────────────────────────────────
const norm = (s) => String(s ?? "").replace(/\./g, "").replace(/\s/g, "").toLowerCase();

function parseCompletedStages(statusStr) {
  if (!statusStr) return [];
  if (Array.isArray(statusStr)) return statusStr.map(String).map((s) => s.trim()).filter(Boolean);
  return String(statusStr).split(",").map((s) => s.trim()).filter(Boolean);
}
function stageIsDone(title, completedList) {
  const t = norm(title);
  return completedList.some((c) => norm(c) === t);
}

function getFileStatus(item) {
  const stages = item.member_names;
  if (!Array.isArray(stages) || stages.length === 0) return "hold";

  const doneCount = stages.filter((s) =>
    stageIsDone(s.title, parseCompletedStages(s.status))
  ).length;

  if (doneCount === stages.length) return "completed";
  if (doneCount > 0) return "ongoing";
  return "hold";
}

// ─────────────────────────────────────────────
//  🔍  SEARCH HELPER
// ─────────────────────────────────────────────

function itemMatchesSearch(item, query) {
  if (!query || !query.trim()) return true;
  const q = query.trim().toLowerCase();
  const fields = [
    item.case_id,
    item.client_name,
    item.project_name,
    item.authority,
    item.village,
    item.tpscheme,
    item.op_no,
    item.fp_no,
    item.ward_no,
    item.cs_no,
    item.rs_no,
    item.b_no,
    item.projectType,
    item.category,
    item.land_type,
    item.hod,
    ...(item.member_names?.map((m) => m.member_names) || []),
    ...(item.member_names?.map((m) => m.title) || []),
  ];
  return fields.some((f) => f && String(f).toLowerCase().includes(q));
}

function highlightText(text, query) {
  if (!text || !query || !query.trim()) return text;
  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  return String(text).replace(regex, '<mark class="ap-highlight">$1</mark>');
}

const Hl = ({ text, query }) => (
  <span dangerouslySetInnerHTML={{ __html: highlightText(text, query) }} />
);

// ─────────────────────────────────────────────
//  STAGE BADGE
// ─────────────────────────────────────────────
function StageBadge({ title, done, days, members, hod }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 10px",
          borderRadius: 8,
          background: done ? "#F6FFED" : "#FAFAFA",
          border: `1.5px solid ${done ? "#B7EB8F" : THEME.border}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              flexShrink: 0,
              background: done ? "#389E0D" : "#D9D9D9",
              boxShadow: done ? "0 0 0 2px #B7EB8F" : "none",
            }}
          />
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: done ? "#389E0D" : THEME.textMuted,
            }}
          >
            {title}
          </span>
          {done && <span style={{ fontSize: 10, color: "#389E0D" }}>✓</span>}
        </div>

        {days !== undefined && days !== 0 && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "1px 7px",
              borderRadius: 20,
              background: done ? "#F6FFED" : days > 0 ? "#FFF1F0" : "#F6FFED",
              color: done ? "#389E0D" : days > 0 ? "#CF1322" : "#389E0D",
              border: `1px solid ${done ? "#B7EB8F" : days > 0 ? "#FFA39E" : "#B7EB8F"}`,
            }}
          >
            {days > 0 ? `+${days}d` : `${days}d`}
          </span>
        )}
      </div>

      {(hod || members) && (
        <p style={{ margin: "2px 0 0 22px", fontSize: 10, color: THEME.textMuted }}>
          👤 {[hod, members].filter(Boolean).join(", ")}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
//  ACTION DROPDOWN
// ─────────────────────────────────────────────
const ActionMenu = memo(({ data, onView, onDelete, onUpdate }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {isAdmin() && (
        <Link
          to={`/${FileExpenseRoute.list}/${data.id}`}
          title="Expenses"
          style={{
            width: 32, height: 32, borderRadius: 8,
            border: `1.5px solid ${THEME.border}`,
            background: "#fff", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 15, textDecoration: "none",
            color: THEME.brand, transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = THEME.brandLight;
            e.currentTarget.style.borderColor = THEME.brand;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#fff";
            e.currentTarget.style.borderColor = THEME.border;
          }}
        >
          💰
        </Link>
      )}

      <div className="ap-menu-wrap" ref={ref}>
        <button className="ap-menu-btn" onClick={() => setOpen((o) => !o)}>
          ⋮
        </button>
        {open && (
          <div className="ap-dropdown" onClick={() => setOpen(false)}>
            {isAdmin() && (
              <button className="ap-drop-item" onClick={() => onView(data.id)}>
                👁 View
              </button>
            )}
            <Link className="ap-drop-item" to={`/${FilesRoute.edit}/${data.id}`}>
              ✏️ Edit
            </Link>
            {isAdmin() && (
              <>
                <button className="ap-drop-item danger" onClick={() => onDelete(data.id)}>
                  🗑 Delete
                </button>
                <button className="ap-drop-item" onClick={() => onUpdate(data.id)}>
                  🔄 Update Service
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────
//  TABLE ROW  (memo)
// ─────────────────────────────────────────────
const ApprovalRow = memo(
  ({ item, index, onAccordion, onView, onDelete, onUpdate, searchQuery, onOpenStageModal }) => {
    const completedStages = useMemo(
      () => parseCompletedStages(item.status),
      [item.status],
    );

    return (
      <tr>
        <td style={{ color: THEME.textMuted, fontWeight: 700, fontSize: 12, width: 36, paddingTop: 16 }}>
          {index + 1}
        </td>

        {/* Case No. */}
        <td>
          <button
            onClick={() => onAccordion(item.id, item.land_type)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}
          >
            <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: THEME.brand, textDecoration: "underline dotted", textUnderlineOffset: 3 }}>
              <Hl text={item.case_id} query={searchQuery} />
              {item.client_name && (
                <span style={{ fontWeight: 400, color: THEME.textMuted }}>
                  {" "}(<Hl text={item.client_name} query={searchQuery} />)
                </span>
              )}
            </p>
            {item.project_name && (
              <p style={{ margin: "2px 0 6px", fontSize: 12, color: THEME.textMuted }}>
                <Hl text={item.project_name} query={searchQuery} />
              </p>
            )}
          </button>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {item.projectType && (
              <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: THEME.brandLight, color: THEME.brandDark, border: "1px solid #D4C4A0" }}>
                <Hl text={item.projectType} query={searchQuery} />
              </span>
            )}
            {item.category && (
              <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: "#F9F0FF", color: "#531DAB", border: "1px solid #D3ADF7" }}>
                <Hl text={item.category} query={searchQuery} />
              </span>
            )}
            {item.tentative_design === "yes" && (
              <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: "#FFF7E6", color: "#D46B08", border: "1px solid #FFD591" }}>
                Tentative
              </span>
            )}
            {/* STATUS PILL */}
            {(() => {
              const status = getFileStatus(item);
              const cfg = {
                completed: { bg: "#F6FFED", color: "#389E0D", border: "#B7EB8F", label: "✓ Completed" },
                ongoing:   { bg: "#FFF7E6", color: "#D46B08", border: "#FFD591", label: "↻ Ongoing" },
                hold:      { bg: "#F5F5F5", color: "#595959", border: "#D9D9D9", label: "⏸ Hold" },
              }[status];
              return (
                <span style={{ display: "inline-block", marginTop: 5, padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                  {cfg.label}
                </span>
              );
            })()}
          </div>
        </td>

        {/* Land Details */}
        <td style={{ maxWidth: 200, fontSize: 12, color: "#595959" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {(item.village || item.tpscheme) && (
              <span>🏘️ <Hl text={[item.village, item.tpscheme].filter(Boolean).join(", ")} query={searchQuery} /></span>
            )}
            {(item.op_no || item.fp_no) && (
              <span>O.P: <Hl text={item.op_no || "—"} query={searchQuery} /> / F.P: <Hl text={item.fp_no || "—"} query={searchQuery} /></span>
            )}
            {item.ward_no && <span>Ward: <Hl text={item.ward_no} query={searchQuery} /></span>}
            {item.cs_no && <span>C.S: <Hl text={item.cs_no} query={searchQuery} /></span>}
            {(item.rs_no || item.b_no) && (
              <span>R.S: <Hl text={item.rs_no || "—"} query={searchQuery} /> / B: <Hl text={item.b_no || "—"} query={searchQuery} /></span>
            )}
          </div>
        </td>

        {/* Authority */}
        <td style={{ whiteSpace: "nowrap" }}>
          {item.authority ? (
            <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "#F0F5FF", color: "#2F54EB", border: "1px solid #ADC6FF" }}>
              <Hl text={item.authority} query={searchQuery} />
            </span>
          ) : "—"}
        </td>

        {/* Stage Progress */}
        <td style={{ minWidth: 150, textAlign: "center" }}>
          <button
            onClick={() => onOpenStageModal(item.id, item.status)}
            style={{ background: THEME.brandLight, color: THEME.brand, border: `1px solid ${THEME.border}`, padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            👁️ View Progress
          </button>
        </td>

        {/* Action */}
        <td style={{ verticalAlign: "middle" }}>
          <ActionMenu data={item} onView={onView} onDelete={onDelete} onUpdate={onUpdate} />
        </td>
      </tr>
    );
  },
);

// ─────────────────────────────────────────────
//  TAB CONFIG
// ─────────────────────────────────────────────
const TABS = [
  { key: "all_files",      label: "All Files" },
  { key: "dc",             label: "D.C." },
  { key: "pv",             label: "P.V." },
  { key: "fire_noc",       label: "Fire NOC" },
  { key: "e_nagar_portal", label: "E-Nagar Portal" },
  { key: "b_permission",   label: "B. Permission" },
];

const TAB_API_MAP = {
  all_files:      fetchAllfile,
  dc:             fetchDCfile,
  pv:             fetchPVfile,
  fire_noc:       fetchFireNocfile,
  e_nagar_portal: fetchENagarPortalfile,
  b_permission:   fetchBpermissionfile,
};

// ─────────────────────────────────────────────
//  STATUS CARD CONFIG
// ─────────────────────────────────────────────
const STATUS_CARDS = [
  { key: "completed", label: "✅ Completed", color: "#389E0D" },
  { key: "ongoing",   label: "↻ Ongoing",   color: "#D46B08" },
  { key: "hold",      label: "⏸ Hold",      color: "#595959" },
];

const PAGE_SIZE = 25;

// ─────────────────────────────────────────────
//  STAGE PROGRESS MODAL
// ─────────────────────────────────────────────
const StageProgressModal = ({ show, onClose, fileId, itemStatus }) => {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && fileId) {
      setLoading(true);
      const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };
      ApiService(null, fileId, header, getMembersdata.method, getMembersdata.url)
        .then((res) => setStages(res.data.data.member_names || []))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [show, fileId]);

  if (!show) return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 12, width: 400, maxWidth: "90%", padding: 20, position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", right: 15, top: 15, background: "none", border: "none", fontSize: 20, cursor: "pointer", color: THEME.textMuted }}>×</button>
        <h3 style={{ margin: "0 0 15px 0", fontSize: 18, color: THEME.brandDark }}>Stage Progress</h3>

        {loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>Loading...</div>
        ) : stages.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px", color: THEME.textMuted }}>No stages found.</div>
        ) : (
          <div style={{ maxHeight: 400, overflowY: "auto", paddingRight: 5 }}>
            {stages.map((stage, i) => (
              <StageBadge
                key={i}
                title={stage.title}
      done={stageIsDone(stage.title, parseCompletedStages(stage.status))}
                days={stage.days}
                members={stage.member_names}
                hod={stage.hod}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const ApprovalProcessList = () => {
  const navigate = useNavigate();
  const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };

  // ── Core state ───────────────────────────
  const [loading, setLoading]             = useState(false);
  const [activeTab, setActiveTab]         = useState("all_files");
  const [showModal, setShowModal]         = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [FileId, setFileId]               = useState("");
  const [searchQuery, setSearchQuery]     = useState("");
  const [searchInput, setSearchInput]     = useState(""); // debounced input
  const [page, setPage]                   = useState(1);
  const [statusFilter, setStatusFilter]   = useState(null);

  // ── Stage modal state ────────────────────
  const [showStageModal, setShowStageModal] = useState(false);
  const [stageFileId, setStageFileId]       = useState(null);
  const [stageItemStatus, setStageItemStatus] = useState(null);

  // ── Per-tab lazy data cache ──────────────
  const [tabCache, setTabCache]     = useState({});
  const [loadedTabs, setLoadedTabs] = useState(new Set());

  const searchInputRef = useRef();

  // ── Debounce search input (300 ms) ───────
  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ── Helpers ──────────────────────────────
  const safeData = useCallback((res) => {
    const d = res?.data?.data;
    if (Array.isArray(d)) return d;
    if (d && typeof d === "object") return [d];
    return [];
  }, []);

  // ── Fetch one tab's data (lazy) ──────────
  const fetchTab = useCallback(
    async (tabKey) => {
      const api = TAB_API_MAP[tabKey];
      if (!api) return;
      setLoading(true);
      try {
        const res = await ApiService(null, 0, header, api.method, api.url);
        setTabCache((prev) => ({ ...prev, [tabKey]: safeData(res) }));
        setLoadedTabs((prev) => new Set([...prev, tabKey]));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [safeData],
  );

  const getTabData = useCallback((key) => tabCache[key] || [], [tabCache]);

  // Convenience alias for the "All Files" dataset (used by status cards)
  const allFilesData = getTabData("all_files");

  // Refresh current tab (used after delete / update)
  const fetchAll = useCallback(() => fetchTab(activeTab), [fetchTab, activeTab]);

  // Load the active tab when first visited
  useEffect(() => {
    if (!loadedTabs.has(activeTab)) {
      fetchTab(activeTab);
    }
  }, [activeTab, loadedTabs, fetchTab]);

  // Reset page when tab / search / filter changes
  useEffect(() => { setPage(1); }, [activeTab, searchQuery, statusFilter]);

  // ── Derived data ─────────────────────────
  const tabSource = useMemo(() => {
    const src = getTabData(activeTab);
    return Array.isArray(src) ? src : [];
  }, [activeTab, tabCache]);

  const filteredData = useMemo(() => {
    let list = tabSource;
    if (searchQuery.trim()) list = list.filter((item) => itemMatchesSearch(item, searchQuery));
    if (statusFilter)       list = list.filter((item) => getFileStatus(item) === statusFilter);
    return [...list].sort((a, b) => b.id - a.id);
  }, [tabSource, searchQuery, statusFilter]);

  const pagedData  = useMemo(() => filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filteredData, page]);
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

  // Tab counts: active tab uses filtered length; others use raw cache length
  const counts = useMemo(() => {
    const result = {};
    for (const key of Object.keys(TAB_API_MAP)) {
      if (key === activeTab) {
        result[key] = filteredData.length;
      } else {
        result[key] = getTabData(key).length;
      }
    }
    return result;
  }, [activeTab, tabCache, filteredData]);

  // Summary cards always use the all_files dataset
  const statusCounts = useMemo(() => ({
    completed: allFilesData.filter((i) => getFileStatus(i) === "completed").length,
    ongoing:   allFilesData.filter((i) => getFileStatus(i) === "ongoing").length,
    hold:      allFilesData.filter((i) => getFileStatus(i) === "hold").length,
  }), [allFilesData]);

  // ── Handlers ─────────────────────────────
  const handleAccordionClick = useCallback(
    (id, landType) => {
      if (activeTab === "all_files" || !landType) {
        navigate(`/${ApprovalRoute.document_add}/${id}`);
        return;
      }
      const routes = {
        "D.C.": ApprovalRoute.document_add,
        DC: ApprovalRoute.document_add,
        "P.V.": ApprovalRoute.pv_add,
        PV: ApprovalRoute.pv_add,
        "Fire NOC": ApprovalRoute.fire_noc_add,
        "E-Nagar Portal": ApprovalRoute.e_nagar_portal_add,
        "B.Permission": ApprovalRoute.buildingpermissionadd,
        "B. Permission": ApprovalRoute.buildingpermissionadd,
        "Site Visit": ApprovalRoute.sitevisit,
      };
      const route = routes[landType] || ApprovalRoute.document_add;
      if (route) navigate(`/${route}/${id}`);
    },
    [navigate, activeTab],
  );

  const onDelete = useCallback(
    (id) => {
      SwalAlert({}).then(async (result) => {
        if (!result.isConfirmed) return;
        try {
          const res = await ApiService(null, parseInt(id), header, deleteapproval.method, deleteapproval.url);
          if (!res.data.error) { toast.success(res.data.message); fetchAll(); }
          else toast.error(res.data.message);
        } catch (err) {
          toast.error(err?.response?.data?.message || "Something went wrong");
        }
      });
    },
    [fetchAll],
  );

  const onView   = useCallback((id) => { setFileId(id); setShowModal(true); }, []);
  const onUpdate = useCallback((id) => { setFileId(id); setShowUpdateModal(true); }, []);

  const handleOpenStageModal = useCallback((id, status) => {
    setStageFileId(id);
    setStageItemStatus(status);
    setShowStageModal(true);
  }, []);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setSearchInput("");
    setSearchQuery("");
    setStatusFilter(null);
    setPage(1);
  };

  const handleStatusCardClick = (key) => setStatusFilter((prev) => (prev === key ? null : key));

  // ── Pagination helper ─────────────────────
  const renderPageButtons = () => {
    const pages = [];
    let start = Math.max(1, page - 3);
    let end = Math.min(totalPages, start + 6);
    if (end - start < 6) start = Math.max(1, end - 6);
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  };

  // ── Render ────────────────────────────────
  return (
    <>
      <style>{CSS}</style>

      <div style={{ minHeight: "100vh", background: THEME.bg, fontFamily: "'DM Sans',sans-serif", padding: "28px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <div style={{ width: 4, height: 26, borderRadius: 3, background: `linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: THEME.text, fontFamily: "'Sora',sans-serif", letterSpacing: "-0.3px" }}>
            Approval Process
          </h1>
        </div>

        {/* Status Summary Cards */}
        {!loading && allFilesData.length > 0 && (
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            {STATUS_CARDS.map((s) => (
              <div
                key={s.key}
                className={`ap-status-card${statusFilter === s.key ? " active-filter" : ""}`}
                onClick={() => handleStatusCardClick(s.key)}
                style={{
                  background: "#fff", border: `1px solid ${THEME.border}`, borderRadius: 10,
                  padding: "10px 16px", borderTop: `3px solid ${s.color}`, minWidth: 110,
                  outline: statusFilter === s.key ? `2.5px solid ${s.color}` : "2.5px solid transparent",
                  outlineOffset: 2, position: "relative", userSelect: "none",
                }}
              >
                {statusFilter === s.key && (
                  <div style={{ position: "absolute", top: 6, right: 8, width: 7, height: 7, borderRadius: "50%", background: s.color }} />
                )}
                <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: statusFilter === s.key ? s.color : THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", transition: "color 0.15s" }}>{s.label}</p>
                <p style={{ margin: "3px 0 0", fontSize: 18, fontWeight: 800, color: s.color, fontFamily: "'Sora',sans-serif" }}>{statusCounts[s.key]}</p>
                <p style={{ margin: "2px 0 0", fontSize: 10, color: THEME.textMuted, fontWeight: 500 }}>{statusFilter === s.key ? "Click to clear" : "Click to filter"}</p>
              </div>
            ))}
          </div>
        )}

        {/* Main Card */}
        <div style={{ background: "#fff", border: `1px solid ${THEME.border}`, borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 12px rgba(136,117,73,0.07)" }}>

          {/* Tab bar + Search */}
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${THEME.border}`, background: "#FDFAF5" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <ul className="ap-tabs" style={{ flex: 1, minWidth: 0 }}>
                {TABS.map((t) => (
                  <li key={t.key}>
                    <button
                      className={`ap-tab${activeTab === t.key ? " active" : ""}`}
                      onClick={() => handleTabChange(t.key)}
                    >
                      {t.label}
                      <span className="ap-tab-count">{counts[t.key] ?? 0}</span>
                    </button>
                  </li>
                ))}
              </ul>

              {/* Search */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                {(searchQuery.trim() || statusFilter) && (
                  <span className="ap-search-result-hint">
                    {filteredData.length} result{filteredData.length !== 1 ? "s" : ""}
                  </span>
                )}
                <div className="ap-search-wrap">
                  <span className="ap-search-icon">🔍</span>
                  <input
                    ref={searchInputRef}
                    className="ap-search-input"
                    type="text"
                    placeholder="Search files…"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                  {searchInput && (
                    <button
                      className="ap-search-clear"
                      onClick={() => { setSearchInput(""); setSearchQuery(""); searchInputRef.current?.focus(); }}
                      title="Clear search"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Active Filter Banner */}
          {statusFilter && (
            <div style={{ padding: "8px 20px", background: "#FDFAF5", borderBottom: `1px solid ${THEME.border}`, fontSize: 12, fontWeight: 600, color: THEME.brand, display: "flex", alignItems: "center", gap: 8 }}>
              <span>
                Showing{" "}
                <strong style={{ color: STATUS_CARDS.find((s) => s.key === statusFilter)?.color }}>
                  {STATUS_CARDS.find((s) => s.key === statusFilter)?.label}
                </strong>{" "}
                files ({filteredData.length})
              </span>
              <button
                onClick={() => setStatusFilter(null)}
                style={{ background: THEME.brandLight, border: `1px solid ${THEME.border}`, borderRadius: 20, cursor: "pointer", color: THEME.brand, fontWeight: 800, fontSize: 12, padding: "1px 10px", fontFamily: "'DM Sans',sans-serif" }}
              >
                × Clear filter
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0", gap: 16 }}>
              <div className="ap-spinner" />
              <p style={{ color: THEME.textLight, fontSize: 13, margin: 0 }}>Loading files…</p>
            </div>
          )}

          {/* Empty */}
          {!loading && filteredData.length === 0 && (
            <div style={{ textAlign: "center", padding: "64px 0" }}>
              <div style={{ fontSize: 38, marginBottom: 10 }}>
                {searchQuery.trim() || statusFilter ? "🔍" : "📋"}
              </div>
              <p style={{ color: THEME.textLight, fontSize: 14, margin: 0, fontWeight: 600 }}>
                {searchQuery.trim()
                  ? `No files match "${searchQuery}"`
                  : statusFilter
                  ? `No ${statusFilter} files found.`
                  : "No files found for this category."}
              </p>
              {(searchQuery.trim() || statusFilter) && (
                <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12 }}>
                  {searchQuery.trim() && (
                    <button
                      onClick={() => { setSearchInput(""); setSearchQuery(""); }}
                      style={{ padding: "6px 16px", borderRadius: 20, border: `1.5px solid ${THEME.brand}`, background: THEME.brandLight, color: THEME.brand, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
                    >
                      Clear Search
                    </button>
                  )}
                  {statusFilter && (
                    <button
                      onClick={() => setStatusFilter(null)}
                      style={{ padding: "6px 16px", borderRadius: 20, border: `1.5px solid ${THEME.brand}`, background: THEME.brandLight, color: THEME.brand, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
                    >
                      Clear Filter
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Table */}
          {!loading && filteredData.length > 0 && (
            <div className="ap-fade" style={{ overflowX: "auto" }}>
              <table className="ap-table">
                <thead>
                  <tr>
                    {["#", "Case No.", "Land Details", "Authority", "Team & Stage Progress", "Action"].map((h, i) => (
                      <th key={h} style={{ textAlign: i === 5 ? "center" : "left" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedData.map((item, idx) => (
                    <ApprovalRow
                      key={item.id}
                      item={item}
                      index={(page - 1) * PAGE_SIZE + idx}
                      onAccordion={handleAccordionClick}
                      onView={onView}
                      onDelete={onDelete}
                      onUpdate={onUpdate}
                      searchQuery={searchQuery}
                      onOpenStageModal={handleOpenStageModal}
                    />
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderTop: `1px solid ${THEME.border}`, background: "#FDFAF5", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, color: THEME.textMuted, fontWeight: 600 }}>
                    Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredData.length)} of {filteredData.length}
                  </span>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      style={{ padding: "5px 14px", borderRadius: 8, border: `1.5px solid ${THEME.border}`, background: page === 1 ? THEME.brandLight : "#fff", color: page === 1 ? THEME.textLight : THEME.brand, cursor: page === 1 ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}
                    >← Prev</button>
                    {renderPageButtons().map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        style={{ width: 32, height: 32, borderRadius: 8, border: `1.5px solid ${p === page ? THEME.brand : THEME.border}`, background: p === page ? THEME.brand : "#fff", color: p === page ? "#fff" : THEME.text, fontWeight: p === page ? 800 : 500, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
                      >{p}</button>
                    ))}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      style={{ padding: "5px 14px", borderRadius: 8, border: `1.5px solid ${THEME.border}`, background: page === totalPages ? THEME.brandLight : "#fff", color: page === totalPages ? THEME.textLight : THEME.brand, cursor: page === totalPages ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}
                    >Next →</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <FileDetailsModal show={showModal} handleClose={() => setShowModal(false)} fileId={FileId} />
      <ServiceUpdateModal show={showUpdateModal} handleClose={() => setShowUpdateModal(false)} fileId={FileId} onSuccess={fetchAll} />
      <StageProgressModal show={showStageModal} onClose={() => setShowStageModal(false)} fileId={stageFileId} itemStatus={stageItemStatus} />
    </>
  );
};

export default ApprovalProcessList;