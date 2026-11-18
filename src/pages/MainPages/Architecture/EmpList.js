import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  memo,
  useRef,
} from "react";
import ApiService from "../../../services/ApiService";
import { getToken } from "../../../services/useLocalStorage";
import {
  getempArch,
  getempBasicArch,
  getempStudyArch,
  getempQuotationArch,
  getempConsultantsArch,
  getempdesignconceptArch,
  getempTdArch,
  getempScheduleArch,
  getempRiskArch,
  getArchMembersData
} from "../../../config/config";
import { useNavigate, Link } from "react-router-dom";
import { ArchitectureRoute } from "../../../config/RouteConfig";

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
  @keyframes alFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .al-fade { animation:alFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes alSpin { to{transform:rotate(360deg)} }
  .al-spinner {
    width:28px;height:28px;border-radius:50%;
    border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};
    animation:alSpin 0.8s linear infinite;
  }

  .al-tabs { display:flex;gap:6px;flex-wrap:nowrap;overflow-x:auto;padding:0;margin:0;list-style:none;scrollbar-width:none;scroll-behavior:smooth; }
  .al-tabs::-webkit-scrollbar { display:none; }
  .al-tab-scroll-btn {
    display:inline-flex;align-items:center;justify-content:center;
    width:28px;height:28px;min-width:28px;border-radius:50%;
    border:1.5px solid ${THEME.border};background:#fff;color:${THEME.brand};
    cursor:pointer;transition:all 0.18s;box-shadow:0 1px 4px rgba(136,117,73,0.08);
    padding:0;flex-shrink:0;user-select:none;
  }
  .al-tab-scroll-btn:hover:not(:disabled) {
    background:${THEME.brandLight};border-color:${THEME.brand};color:${THEME.brandDark};transform:scale(1.06);
  }
  .al-tab-scroll-btn:active:not(:disabled) { transform:scale(0.95); }
  .al-tab-scroll-btn:disabled { opacity:0.3;cursor:not-allowed;box-shadow:none; }
  .al-tab {
    padding:8px 14px;border-radius:20px;cursor:pointer;white-space:nowrap;
    font-size:12px;font-weight:600;border:1.5px solid transparent;
    background:transparent;color:#595959;transition:all 0.18s;
    font-family:'DM Sans',sans-serif;display:inline-flex;align-items:center;gap:6px;
  }
  .al-tab:hover { background:${THEME.brandLight};color:${THEME.brand}; }
  .al-tab.active { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand};font-weight:700; }
  .al-tab-count { background:${THEME.brand};color:#fff;border-radius:20px;padding:1px 7px;font-size:10px;font-weight:800; }
  .al-tab.active .al-tab-count { background:${THEME.brandDark}; }

  /* ── Search ── */
  .al-search-wrap { position:relative;display:flex;align-items:center; }
  .al-search-icon { position:absolute;left:12px;font-size:14px;color:${THEME.textMuted};pointer-events:none; }
  .al-search-input {
    width:260px;padding:8px 36px 8px 36px;border-radius:10px;
    border:1.5px solid ${THEME.border};background:#fff;
    font-size:13px;font-family:'DM Sans',sans-serif;color:${THEME.text};
    outline:none;transition:all 0.18s;
  }
  .al-search-input::placeholder { color:${THEME.textLight}; }
  .al-search-input:focus {
    border-color:${THEME.brand};
    box-shadow:0 0 0 3px rgba(136,117,73,0.12);
  }
  .al-search-clear {
    position:absolute;right:10px;background:none;border:none;cursor:pointer;
    color:${THEME.textMuted};font-size:16px;padding:0;line-height:1;
    display:flex;align-items:center;transition:color 0.15s;
  }
  .al-search-clear:hover { color:${THEME.brand}; }
  .al-search-result-hint {
    font-size:11px;font-weight:600;color:${THEME.textMuted};
    background:${THEME.brandLight};border:1px solid ${THEME.border};
    border-radius:20px;padding:3px 10px;white-space:nowrap;
  }

  /* ── Highlight ── */
  .al-highlight {
    background:#FFF3CD;color:#5C4E32;border-radius:3px;padding:0 2px;font-weight:700;
  }

  /* ── Status Cards ── */
  .al-status-card {
    cursor:pointer;
    transition:transform 0.15s, box-shadow 0.15s, outline 0.15s;
    outline:2.5px solid transparent;
    outline-offset:2px;
  }
  .al-status-card:hover {
    transform:translateY(-2px);
    box-shadow:0 4px 16px rgba(136,117,73,0.13);
  }
  .al-status-card.active-filter {
    box-shadow:0 4px 16px rgba(136,117,73,0.18);
  }

  .al-table { width:100%;border-collapse:collapse;font-family:'DM Sans',sans-serif; }
  .al-table th {
    padding:10px 14px;font-size:11px;font-weight:700;color:${THEME.brandDark};
    text-transform:uppercase;letter-spacing:0.07em;
    background:${THEME.brandLight};border-bottom:2px solid #D4C4A0;white-space:nowrap;
  }
  .al-table td { padding:12px 14px;border-bottom:1px solid #F5EFE4;vertical-align:top; }
  .al-table tbody tr:nth-child(even) { background:${THEME.rowAlt}; }
  .al-table tbody tr:hover { background:${THEME.rowHover}; }

  .al-menu-wrap { position:relative;display:inline-block; }
  .al-menu-btn {
    width:32px;height:32px;border-radius:8px;cursor:pointer;
    background:transparent;border:1.5px solid ${THEME.border};
    display:flex;align-items:center;justify-content:center;
    font-size:18px;color:${THEME.textMuted};transition:all 0.15s;
  }
  .al-menu-btn:hover { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand}; }
  .al-dropdown {
    position:absolute;right:0;top:38px;z-index:200;
    background:#fff;border:1px solid ${THEME.border};border-radius:12px;
    box-shadow:0 8px 24px rgba(0,0,0,0.12);overflow:hidden;min-width:140px;
  }
  .al-drop-item {
    display:block;width:100%;padding:10px 16px;font-size:13px;font-weight:600;
    border:none;background:transparent;cursor:pointer;text-align:left;
    color:${THEME.text};transition:background 0.15s;font-family:'DM Sans',sans-serif;text-decoration:none;
  }
  .al-drop-item:hover { background:${THEME.brandLight};color:${THEME.brand}; }

  ::-webkit-scrollbar { width:5px;height:5px; }
  ::-webkit-scrollbar-track { background:${THEME.brandLight}; }
  ::-webkit-scrollbar-thumb { background:${THEME.brandMid};border-radius:10px; }
`;

// ─────────────────────────────────────────────
//  🔍  SEARCH HELPERS
// ─────────────────────────────────────────────

function itemMatchesSearch(item, query) {
  if (!query || !query.trim()) return true;
  const q = query.trim().toLowerCase();

  const fields = [
    item.case_id,
    item.client_name,
    item.project_name,
    item.address,
    item.projectType,
    item.category,
    item.landtype,
    item.hod_name,
    item.member_names,
    item.title,
    item.google_location,
  ];
  return fields.some((f) => f && String(f).toLowerCase().includes(q));
}

function highlightText(text, query) {
  if (!text || !query || !query.trim()) return text;
  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  return String(text).replace(regex, '<mark class="al-highlight">$1</mark>');
}

const Hl = ({ text, query }) => (
  <span dangerouslySetInnerHTML={{ __html: highlightText(text, query) }} />
);

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
function getArchFileStatus(item) {
  const fields = [
    item.basic_details_status,
    item.consultant_status,
    item.dc_status,
    item.quoation_status,
    item.risk_status,
    item.schedule_status,
    item.space_planning_status,
    item.drawing_status,
  ].map((s) => s?.trim());

 const isStageGreen = (s) => {
    if (!s) return false;
    const vals = String(s).split(",").map((v) => v.trim()).filter(Boolean);
    return vals.length > 0 && vals.every((v) => v === "green");
  };

  const totalStages = fields.length; // fixed at 8, nulls count against completion
  const greenCount = fields.filter(isStageGreen).length;

  if (greenCount === 0) return "hold";
  if (greenCount === totalStages) return "completed";
  return "ongoing";
}

// ─────────────────────────────────────────────
//  STAGE BADGE
// ─────────────────────────────────────────────
function ArchStageBadge({
  title,
  statusColor,
  hodName,
  memberNames,
  days,
}) {
  const done = statusColor === "green";
  const isRed = statusColor === "red";

  return (
    <div style={{ marginBottom: 6 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 10px",
          borderRadius: 8,
          background: done ? "#F6FFED" : isRed ? "#FFF1F0" : "#FAFAFA",
          border: `1.5px solid ${done ? "#B7EB8F" : isRed ? "#FFA39E" : THEME.border}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              flexShrink: 0,
              background: done ? "#389E0D" : isRed ? "#CF1322" : "#D9D9D9",
              boxShadow: done
                ? "0 0 0 2px #B7EB8F"
                : isRed
                  ? "0 0 0 2px #FFA39E"
                  : "none",
            }}
          />
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: done ? "#389E0D" : isRed ? "#CF1322" : THEME.textMuted,
            }}
          >
            {title}
          </span>
          {done && <span style={{ fontSize: 10, color: "#389E0D" }}>✓</span>}
        </div>

        {days !== undefined && days !== null && days !== 0 && (
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

      {(hodName || memberNames) && (
        <p
          style={{
            margin: "2px 0 0 22px",
            fontSize: 10,
            color: THEME.textMuted,
          }}
        >
          👤 {[hodName, memberNames].filter(Boolean).join(", ")}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
//  DROPDOWN MENU
// ─────────────────────────────────────────────
const ActionMenu = memo(({ id }) => {
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
    <div className="al-menu-wrap" ref={ref}>
      <button className="al-menu-btn" onClick={() => setOpen((o) => !o)}>
        ⋮
      </button>
      {open && (
        <div className="al-dropdown" onClick={() => setOpen(false)}>
          <Link
            className="al-drop-item"
            to={`/${ArchitectureRoute.edit}/${id}`}
          >
            ✏️ Edit
          </Link>
        </div>
      )}
    </div>
  );
});

// ─────────────────────────────────────────────
//  STAGE PROGRESS MODAL
// ─────────────────────────────────────────────
const StageProgressModal = ({ show, onClose, fileId }) => {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && fileId) {
      setLoading(true);
      const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };
      ApiService(null, fileId, header, getArchMembersData.method, getArchMembersData.url)
        .then((res) => {
          const data = res.data?.data;
          if (data && data.length > 0 && data[0].member_names) {
            setStages(data[0].member_names);
          } else {
            setStages([]);
          }
        })
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
              <ArchStageBadge
                key={i}
                title={stage.title}
                statusColor={stage.status}
                hodName={stage.hod}
                memberNames={stage.member_names}
                days={stage.days}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  TABLE ROW
// ─────────────────────────────────────────────
const ArchEmpRow = memo(
  ({
    item,
    index,
    onAccordion,
    searchQuery,
    onOpenStageModal,
  }) => {
    return (
      <tr>
        {/* # */}
        <td
          style={{
            color: THEME.textMuted,
            fontWeight: 700,
            fontSize: 12,
            width: 36,
            paddingTop: 14,
          }}
        >
          {index + 1}
        </td>

        {/* Case No. */}
        <td>
          <button
            onClick={() => onAccordion(item.id, item.landtype)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              textAlign: "left",
            }}
          >
            <p
              style={{
                margin: "0 0 2px",
                fontSize: 13,
                fontWeight: 700,
                color: THEME.brand,
                textDecoration: "underline dotted",
                textUnderlineOffset: 3,
              }}
            >
              <Hl text={item.case_id} query={searchQuery} />
              {item.client_name && (
                <span style={{ fontWeight: 400, color: THEME.textMuted }}>
                  {" "}
                  (<Hl text={item.client_name} query={searchQuery} />)
                </span>
              )}
            </p>
            {item.project_name && (
              <p
                style={{
                  margin: "2px 0 6px",
                  fontSize: 12,
                  color: THEME.textMuted,
                }}
              >
                <Hl text={item.project_name} query={searchQuery} />
              </p>
            )}
          </button>
          <div
            style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}
          >
            {item.projectType && (
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: 20,
                  fontSize: 10,
                  fontWeight: 600,
                  background: THEME.brandLight,
                  color: THEME.brandDark,
                  border: `1px solid #D4C4A0`,
                }}
              >
                <Hl text={item.projectType} query={searchQuery} />
              </span>
            )}
            {item.category && (
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: 20,
                  fontSize: 10,
                  fontWeight: 600,
                  background: "#F9F0FF",
                  color: "#531DAB",
                  border: "1px solid #D3ADF7",
                }}
              >
                <Hl text={item.category} query={searchQuery} />
              </span>
            )}
            {item.tentative_design === "1" && (
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: 20,
                  fontSize: 10,
                  fontWeight: 600,
                  background: "#FFF7E6",
                  color: "#D46B08",
                  border: "1px solid #FFD591",
                }}
              >
                Tentative
              </span>
            )}

            {/* STATUS PILL */}
            {(() => {
              const status = getArchFileStatus(item);
              const cfg = {
                completed: {
                  bg: "#F6FFED",
                  color: "#389E0D",
                  border: "#B7EB8F",
                  label: "✓ Completed",
                },
                ongoing: {
                  bg: "#FFF7E6",
                  color: "#D46B08",
                  border: "#FFD591",
                  label: "↻ Ongoing",
                },
                hold: {
                  bg: "#F5F5F5",
                  color: "#595959",
                  border: "#D9D9D9",
                  label: "⏸ Hold",
                },
              }[status];
              return (
                <span
                  style={{
                    display: "inline-block",
                    marginTop: 5,
                    padding: "2px 8px",
                    borderRadius: 20,
                    fontSize: 10,
                    fontWeight: 700,
                    background: cfg.bg,
                    color: cfg.color,
                    border: `1px solid ${cfg.border}`,
                  }}
                >
                  {cfg.label}
                </span>
              );
            })()}
          </div>
        </td>

        {/* Address */}
        <td style={{ maxWidth: 180 }}>
          <span style={{ fontSize: 12, color: "#595959" }}>
            <Hl text={item.address || "—"} query={searchQuery} />
          </span>
          {item.google_location && (
            <a
              href={item.google_location}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginTop: 4,
                fontSize: 11,
                color: "#2F54EB",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              📍 Map
            </a>
          )}
        </td>

        {/* Team & Stage Progress (Popup Modal) */}
        <td style={{ minWidth: 150, textAlign: "center", verticalAlign: "middle" }}>
          <button
            onClick={() => onOpenStageModal(item.id)}
            style={{ background: THEME.brandLight, color: THEME.brand, border: `1px solid ${THEME.border}`, padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            👁️ View Progress
          </button>
        </td>

        {/* Action */}
        <td style={{ textAlign: "center" }}>
          <ActionMenu id={item.id} />
        </td>
      </tr>
    );
  },
);

// ─────────────────────────────────────────────
//  TAB CONFIG
// ─────────────────────────────────────────────
const TABS = [
  { key: "all_files", label: "All Files" },
  { key: "basic_details", label: "Basic Details" },
  { key: "Study", label: "Study / RND" },
  { key: "quotation", label: "Quotation" },
  { key: "designconcept", label: "Design Concept" },
  { key: "consultants", label: "Consultants" },
  { key: "technical", label: "Technical Drawings" },
  { key: "schedule", label: "Schedule" },
  { key: "risk", label: "Risk Matrix" },
];

const TAB_API_MAP = {
  all_files: getempArch,
  basic_details: getempBasicArch,
  Study: getempStudyArch,
  quotation: getempQuotationArch,
  designconcept: getempdesignconceptArch,
  consultants: getempConsultantsArch,
  technical: getempTdArch,
  schedule: getempScheduleArch,
  risk: getempRiskArch,
};

// ─────────────────────────────────────────────
//  STATUS CARD CONFIG
// ─────────────────────────────────────────────
const STATUS_CARDS = [
  { key: "completed", label: "✅ Completed", color: "#389E0D" },
  { key: "ongoing", label: "↻ Ongoing", color: "#D46B08" },
  { key: "hold", label: "⏸ Hold", color: "#595959" },
];

const PAGE_SIZE = 25;

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const ArchEmpList = () => {
  const navigate = useNavigate();
  const header = useMemo(
    () => ({
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    }),
    [],
  );

  // ── Core state ───────────────────────────
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all_files");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState(""); // debounced input
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState(null);

  // ── Stage modal state ──────────────
  const [showStageModal, setShowStageModal] = useState(false);
  const [stageFileId, setStageFileId] = useState(null);

  // ── Per-tab lazy data cache ──────────────
  const [tabCache, setTabCache] = useState({});
  const [loadedTabs, setLoadedTabs] = useState(new Set());

  const searchInputRef = useRef();
  const tabsRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = tabsRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
  }, []);

  const scrollTabs = (direction) => {
    const el = tabsRef.current;
    if (!el) return;
    const scrollAmount = 260;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
    setTimeout(checkScroll, 320);
  };

  useEffect(() => {
    checkScroll();
    const el = tabsRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
      return () => {
        el.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [checkScroll]);

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
    [header, safeData],
  );

  const getTabData = useCallback((key) => tabCache[key] || [], [tabCache]);

  // Convenience alias for the "All Files" dataset (used by status cards)
  const allFilesData = getTabData("all_files");

  // Load the active tab when first visited
  useEffect(() => {
    if (!loadedTabs.has(activeTab)) {
      fetchTab(activeTab);
    }
  }, [activeTab, loadedTabs, fetchTab]);

  // Reset page when tab / search / filter changes
  useEffect(() => {
    setPage(1);
  }, [activeTab, searchQuery, statusFilter]);

  // ── Derived data ─────────────────────────
  const tabSource = useMemo(() => {
    const src = getTabData(activeTab);
    return Array.isArray(src) ? src : [];
  }, [activeTab, getTabData]);

  const filteredData = useMemo(() => {
    let list = tabSource;
    if (searchQuery.trim()) {
      list = list.filter((item) => itemMatchesSearch(item, searchQuery));
    }
    if (statusFilter) {
      list = list.filter((item) => getArchFileStatus(item) === statusFilter);
    }
    return [...list].sort((a, b) => b.id - a.id);
  }, [tabSource, searchQuery, statusFilter]);

  const pagedData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredData.slice(start, start + PAGE_SIZE);
  }, [filteredData, page]);

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
  }, [activeTab, getTabData, filteredData]);

  useEffect(() => {
    checkScroll();
  }, [counts, activeTab, checkScroll]);

  // Summary cards always use the all_files dataset
  const statusCounts = useMemo(() => {
    const total = allFilesData.length;
    const completed = allFilesData.filter(
      (i) => getArchFileStatus(i) === "completed",
    ).length;
    const ongoing = allFilesData.filter(
      (i) => getArchFileStatus(i) === "ongoing",
    ).length;
    const hold = allFilesData.filter(
      (i) => getArchFileStatus(i) === "hold",
    ).length;

    return { total, completed, ongoing, hold };
  }, [allFilesData]);

  // ── Actions ───────────────────────────────
  const handleAccordionClick = useCallback(
    (id, landType) => {
      if (activeTab === "all_files" || !landType) {
        navigate(`/${ArchitectureRoute.basicdetails}/${id}`);
        return;
      }
      const routes = {
        "Basic Details": ArchitectureRoute.basicdetails,
        "Study/RND": ArchitectureRoute.study,
        Study: ArchitectureRoute.study,
        Quotation: ArchitectureRoute.quotation,
        "Design Concept": ArchitectureRoute.documents,
        Consultants: ArchitectureRoute.consultants,
        "Technical Drawing": ArchitectureRoute.drawing,
        "Technical Drawings": ArchitectureRoute.drawing,
        Schedule: ArchitectureRoute.schedule,
        "Risk Matrix": ArchitectureRoute.riskMatrix,
        "Site Visit": ArchitectureRoute.sitevisit,
      };
      const route = routes[landType] || ArchitectureRoute.basicdetails;
      if (route) navigate(`/${route}/${id}`);
    },
    [navigate, activeTab],
  );

  const handleOpenStageModal = useCallback((id) => {
    setStageFileId(id);
    setShowStageModal(true);
  }, []);

  // Clear search + status filter on tab switch
  const handleTabChange = (key) => {
    setActiveTab(key);
    setSearchInput("");
    setSearchQuery("");
    setStatusFilter(null);
    setPage(1);
  };

  // Toggle status filter (click same card again to deselect)
  const handleStatusCardClick = (key) => {
    setStatusFilter((prev) => (prev === key ? null : key));
  };

  // ── Pagination helper ─────────────────────
  const renderPageButtons = () => {
    const pages = [];
    let start = Math.max(1, page - 3);
    let end = Math.min(totalPages, start + 6);

    if (end - start < 6) {
      start = Math.max(1, end - 6);
    }

    for (let p = start; p <= end; p++) {
      pages.push(p);
    }
    return pages;
  };

  // ── Render ────────────────────────────────
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
        {/* ── Header ── */}
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
            My Architecture Projects
          </h1>
        </div>

        {/* ── Status Summary Cards ── */}
        {!loading && allFilesData.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 20,
              flexWrap: "wrap",
            }}
          >
            {STATUS_CARDS.map((s) => (
              <div
                key={s.key}
                className={`al-status-card${
                  statusFilter === s.key ? " active-filter" : ""
                }`}
                onClick={() => handleStatusCardClick(s.key)}
                style={{
                  background: "#fff",
                  border: `1px solid ${THEME.border}`,
                  borderRadius: 10,
                  padding: "10px 16px",
                  borderTop: `3px solid ${s.color}`,
                  minWidth: 110,
                  outline:
                    statusFilter === s.key
                      ? `2.5px solid ${s.color}`
                      : "2.5px solid transparent",
                  outlineOffset: 2,
                  position: "relative",
                  userSelect: "none",
                }}
              >
                {/* Active indicator dot */}
                {statusFilter === s.key && (
                  <div
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 8,
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: s.color,
                    }}
                  />
                )}
                <p
                  style={{
                    margin: 0,
                    fontSize: 10,
                    fontWeight: 700,
                    color: statusFilter === s.key ? s.color : THEME.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    transition: "color 0.15s",
                  }}
                >
                  {s.label}
                </p>
                <p
                  style={{
                    margin: "3px 0 0",
                    fontSize: 18,
                    fontWeight: 800,
                    color: s.color,
                    fontFamily: "'Sora',sans-serif",
                  }}
                >
                  {statusCounts[s.key]}
                </p>
                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: 10,
                    color: THEME.textMuted,
                    fontWeight: 500,
                  }}
                >
                  {statusFilter === s.key
                    ? "Click to clear"
                    : "Click to filter"}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── Main card ── */}
        <div
          style={{
            background: "#fff",
            border: `1px solid ${THEME.border}`,
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 2px 12px rgba(136,117,73,0.07)",
          }}
        >
          {/* Tab bar + Search */}
          <div
            style={{
              padding: "14px 20px",
              borderBottom: `1px solid ${THEME.border}`,
              background: "#FDFAF5",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <button
                  type="button"
                  className="al-tab-scroll-btn"
                  onClick={() => scrollTabs("left")}
                  disabled={!canScrollLeft}
                  title="Scroll tabs left"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>

                <ul ref={tabsRef} className="al-tabs" style={{ flex: 1, minWidth: 0 }}>
                  {TABS.map((t) => (
                    <li key={t.key}>
                      <button
                        className={`al-tab${
                          activeTab === t.key ? " active" : ""
                        }`}
                        onClick={() => handleTabChange(t.key)}
                      >
                        {t.label}
                        <span className="al-tab-count">{counts[t.key] ?? 0}</span>
                      </button>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  className="al-tab-scroll-btn"
                  onClick={() => scrollTabs("right")}
                  disabled={!canScrollRight}
                  title="Scroll tabs right"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>

              {/* Search */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexShrink: 0,
                }}
              >
                {(searchQuery.trim() || statusFilter) && (
                  <span className="al-search-result-hint">
                    {filteredData.length} result
                    {filteredData.length !== 1 ? "s" : ""}
                  </span>
                )}
                <div className="al-search-wrap">
                  <span className="al-search-icon">🔍</span>
                  <input
                    ref={searchInputRef}
                    className="al-search-input"
                    type="text"
                    placeholder="Search projects…"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                  {searchInput && (
                    <button
                      className="al-search-clear"
                      onClick={() => {
                        setSearchInput("");
                        setSearchQuery("");
                        searchInputRef.current?.focus();
                      }}
                      title="Clear search"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Active Filter Banner ── */}
          {statusFilter && (
            <div
              style={{
                padding: "8px 20px",
                background: "#FDFAF5",
                borderBottom: `1px solid ${THEME.border}`,
                fontSize: 12,
                fontWeight: 600,
                color: THEME.brand,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>
                Showing{" "}
                <strong
                  style={{
                    color: STATUS_CARDS.find((s) => s.key === statusFilter)
                      ?.color,
                  }}
                >
                  {STATUS_CARDS.find((s) => s.key === statusFilter)?.label}
                </strong>{" "}
                projects ({filteredData.length})
              </span>
              <button
                onClick={() => setStatusFilter(null)}
                style={{
                  background: THEME.brandLight,
                  border: `1px solid ${THEME.border}`,
                  borderRadius: 20,
                  cursor: "pointer",
                  color: THEME.brand,
                  fontWeight: 800,
                  fontSize: 12,
                  padding: "1px 10px",
                  fontFamily: "'DM Sans',sans-serif",
                }}
              >
                × Clear filter
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "80px 0",
                gap: 16,
              }}
            >
              <div className="al-spinner" />
              <p style={{ color: THEME.textLight, fontSize: 13, margin: 0 }}>
                Loading projects…
              </p>
            </div>
          )}

          {/* Empty */}
          {!loading && filteredData.length === 0 && (
            <div style={{ textAlign: "center", padding: "64px 0" }}>
              <div style={{ fontSize: 38, marginBottom: 10 }}>
                {searchQuery.trim() || statusFilter ? "🔍" : "🏗️"}
              </div>
              <p
                style={{
                  color: THEME.textLight,
                  fontSize: 14,
                  margin: 0,
                  fontWeight: 600,
                }}
              >
                {searchQuery.trim()
                  ? `No projects match "${searchQuery}"`
                  : statusFilter
                    ? `No ${statusFilter} projects found.`
                    : "No projects found for this category."}
              </p>
              {(searchQuery.trim() || statusFilter) && (
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    justifyContent: "center",
                    marginTop: 12,
                  }}
                >
                  {searchQuery.trim() && (
                    <button
                      onClick={() => {
                        setSearchInput("");
                        setSearchQuery("");
                      }}
                      style={{
                        padding: "6px 16px",
                        borderRadius: 20,
                        border: `1.5px solid ${THEME.brand}`,
                        background: THEME.brandLight,
                        color: THEME.brand,
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: "pointer",
                        fontFamily: "'DM Sans',sans-serif",
                      }}
                    >
                      Clear Search
                    </button>
                  )}
                  {statusFilter && (
                    <button
                      onClick={() => setStatusFilter(null)}
                      style={{
                        padding: "6px 16px",
                        borderRadius: 20,
                        border: `1.5px solid ${THEME.brand}`,
                        background: THEME.brandLight,
                        color: THEME.brand,
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: "pointer",
                        fontFamily: "'DM Sans',sans-serif",
                      }}
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
            <div className="al-fade" style={{ overflowX: "auto" }}>
              <table className="al-table">
                <thead>
                  <tr>
                    {[
                      "#",
                      "Case No.",
                      "Address",
                      "Team & Stage Progress",
                      "Action",
                    ].map((h, i) => (
                      <th
                        key={h}
                        style={{ textAlign: i === 4 ? "center" : "left" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedData.map((item, idx) => (
                    <ArchEmpRow
                      key={item.id}
                      item={item}
                      index={(page - 1) * PAGE_SIZE + idx}
                      onAccordion={handleAccordionClick}
                      searchQuery={searchQuery}
                      onOpenStageModal={handleOpenStageModal}
                    />
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 20px",
                    borderTop: `1px solid ${THEME.border}`,
                    background: "#FDFAF5",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: THEME.textMuted,
                      fontWeight: 600,
                    }}
                  >
                    Showing {(page - 1) * PAGE_SIZE + 1}–
                    {Math.min(page * PAGE_SIZE, filteredData.length)} of{" "}
                    {filteredData.length}
                  </span>
                  <div
                    style={{ display: "flex", gap: 6, alignItems: "center" }}
                  >
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      style={{
                        padding: "5px 14px",
                        borderRadius: 8,
                        border: `1.5px solid ${THEME.border}`,
                        background: page === 1 ? THEME.brandLight : "#fff",
                        color: page === 1 ? THEME.textLight : THEME.brand,
                        cursor: page === 1 ? "not-allowed" : "pointer",
                        fontWeight: 700,
                        fontSize: 13,
                        fontFamily: "'DM Sans',sans-serif",
                      }}
                    >
                      ← Prev
                    </button>
                    {renderPageButtons().map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          border: `1.5px solid ${
                            p === page ? THEME.brand : THEME.border
                          }`,
                          background: p === page ? THEME.brand : "#fff",
                          color: p === page ? "#fff" : THEME.text,
                          fontWeight: p === page ? 800 : 500,
                          fontSize: 13,
                          cursor: "pointer",
                          fontFamily: "'DM Sans',sans-serif",
                        }}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      style={{
                        padding: "5px 14px",
                        borderRadius: 8,
                        border: `1.5px solid ${THEME.border}`,
                        background:
                          page === totalPages ? THEME.brandLight : "#fff",
                        color:
                          page === totalPages ? THEME.textLight : THEME.brand,
                        cursor: page === totalPages ? "not-allowed" : "pointer",
                        fontWeight: 700,
                        fontSize: 13,
                        fontFamily: "'DM Sans',sans-serif",
                      }}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <StageProgressModal
        show={showStageModal}
        onClose={() => setShowStageModal(false)}
        fileId={stageFileId}
      />
    </>
  );
};

export default ArchEmpList;