// ─────────────────────────────────────────────
//  EmpApprovalProcessList.jsx  —  Approval Process (Employee View)
//  Status parsed from comma-separated string e.g. "D.C, P.V., "
// ─────────────────────────────────────────────

import React, { useEffect, useState, useCallback, useMemo, memo, useRef } from "react";
import ApiService from "../../../services/ApiService";
import { getToken,ishod } from "../../../services/useLocalStorage";
import {
  fetchEmpAllfile, fetchempdcfile, fetchempPVfile,
  fetchempFireNocfile, fetchempENagarPortalfile, fetchempBpermissionfile, getMembersdata
} from "../../../config/config";
import { ApprovalRoute,FilesRoute } from "../../../config/RouteConfig";
import { useNavigate,Link } from "react-router-dom";


// ─────────────────────────────────────────────
//  🎨  THEME
// ─────────────────────────────────────────────
const THEME = {
  brand:      "#887549",
  brandLight: "#F5F0E8",
  brandMid:   "#C4A97D",
  brandDark:  "#5C4E32",
  bg:         "#F8F5F0",
  border:     "#EDE5D5",
  rowAlt:     "#FEFCF9",
  rowHover:   "#FDFAF5",
  text:       "#1A1A2E",
  textMuted:  "#ADADAD",
  textLight:  "#BDBDBD",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing:border-box; }
  @keyframes ealFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .eal-fade { animation:ealFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes ealSpin { to{transform:rotate(360deg)} }
  .eal-spinner {
    width:28px;height:28px;border-radius:50%;
    border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};
    animation:ealSpin 0.8s linear infinite;
  }

  /* ── Tabs ── */
  .eal-tabs { display:flex;gap:6px;flex-wrap:nowrap;overflow-x:auto;padding:0;margin:0;list-style:none;scrollbar-width:none; }
  .eal-tabs::-webkit-scrollbar { display:none; }
  .eal-tab {
    padding:8px 14px;border-radius:20px;cursor:pointer;white-space:nowrap;
    font-size:12px;font-weight:600;border:1.5px solid transparent;
    background:transparent;color:#595959;transition:all 0.18s;
    font-family:'DM Sans',sans-serif;display:inline-flex;align-items:center;gap:6px;
  }
  .eal-tab:hover  { background:${THEME.brandLight};color:${THEME.brand}; }
  .eal-tab.active { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand};font-weight:700; }
  .eal-tab-count  { background:${THEME.brand};color:#fff;border-radius:20px;padding:1px 7px;font-size:10px;font-weight:800; }
  .eal-tab.active .eal-tab-count { background:${THEME.brandDark}; }

  /* ── Search ── */
  .eal-search-wrap {
    position:relative;display:flex;align-items:center;
  }
  .eal-search-icon {
    position:absolute;left:12px;font-size:14px;color:${THEME.textMuted};pointer-events:none;
  }
  .eal-search-input {
    width:260px;padding:8px 36px 8px 36px;border-radius:10px;
    border:1.5px solid ${THEME.border};background:#fff;
    font-size:13px;font-family:'DM Sans',sans-serif;color:${THEME.text};
    outline:none;transition:all 0.18s;
  }
  .eal-search-input::placeholder { color:${THEME.textLight}; }
  .eal-search-input:focus {
    border-color:${THEME.brand};
    box-shadow:0 0 0 3px rgba(136,117,73,0.12);
  }
  .eal-search-clear {
    position:absolute;right:10px;background:none;border:none;cursor:pointer;
    color:${THEME.textMuted};font-size:16px;padding:0;line-height:1;display:flex;align-items:center;
    transition:color 0.15s;
  }
  .eal-search-clear:hover { color:${THEME.brand}; }
  .eal-search-result-hint {
    font-size:11px;font-weight:600;color:${THEME.textMuted};
    background:${THEME.brandLight};border:1px solid ${THEME.border};
    border-radius:20px;padding:3px 10px;white-space:nowrap;
  }

  /* ── Table ── */
  .eal-table { width:100%;border-collapse:collapse;font-family:'DM Sans',sans-serif; }
  .eal-table th {
    padding:10px 14px;font-size:11px;font-weight:700;color:${THEME.brandDark};
    text-transform:uppercase;letter-spacing:0.07em;
    background:${THEME.brandLight};border-bottom:2px solid #D4C4A0;white-space:nowrap;
  }
  .eal-table td { padding:12px 14px;border-bottom:1px solid #F5EFE4;vertical-align:top; }
  .eal-table tbody tr:nth-child(even) { background:${THEME.rowAlt}; }
  .eal-table tbody tr:hover { background:${THEME.rowHover}; }

  /* ── Highlight match ── */
  .eal-highlight {
    background:#FFF3CD;color:#5C4E32;border-radius:3px;padding:0 2px;font-weight:700;
  }

  /* ── Progress bar ── */
  .eal-progress-track {
    width:100%;height:5px;border-radius:10px;background:#EDE5D5;overflow:hidden;margin-top:5px;
  }
  .eal-progress-fill {
    height:100%;border-radius:10px;
    background:linear-gradient(90deg,${THEME.brand},${THEME.brandMid});
    transition:width 0.4s ease;
  }


  /* ── Action dropdown ── */
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
    box-shadow:0 8px 24px rgba(0,0,0,0.12);overflow:hidden;min-width:170px;
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
//  🔧  STATUS HELPERS
// ─────────────────────────────────────────────

function parseCompletedStages(statusStr) {
  if (!statusStr) return [];
  return statusStr.split(",").map((s) => s.trim()).filter(Boolean);
}

function stageIsDone(title, completedList) {
  const norm = (s) => s.replace(/\./g, "").replace(/\s/g, "").toLowerCase();
  const t = norm(title);
  return completedList.some((c) => norm(c) === t);
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
          {ishod() && (
            <Link
              className="al-drop-item"
              to={`/${FilesRoute.edit}/${id}`}
            >
              ✏️ Edit
            </Link>
          )}
        </div>
      )}
    </div>
  );
});


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
    item.authority,
    item.village,
    item.tpscheme,
    item.op_no,
    item.fp_no,
    item.ward_no,
    item.cs_no,
    item.rs_no,
    item.b_no,
    item.subplot_no,
    item.projectType,
    item.category,
    item.land_type,
    item.hod,
  ];
  return fields.some((f) => f && String(f).toLowerCase().includes(q));
}

function highlightText(text, query) {
  if (!text || !query || !query.trim()) return text;
  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  return String(text).replace(regex, '<mark class="eal-highlight">$1</mark>');
}

const Hl = ({ text, query }) => (
  <span dangerouslySetInnerHTML={{ __html: highlightText(text, query) }} />
);


// ─────────────────────────────────────────────
//  STAGE BADGE ROW
// ─────────────────────────────────────────────
function StageBadge({ title, done, days, members, hod }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "6px 10px", borderRadius: 8,
        background: done ? "#F6FFED" : "#FAFAFA",
        border: `1.5px solid ${done ? "#B7EB8F" : THEME.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
            background: done ? "#389E0D" : "#D9D9D9",
            boxShadow: done ? "0 0 0 2px #B7EB8F" : "none",
          }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: done ? "#389E0D" : THEME.textMuted }}>
            {title}
          </span>
          {done && <span style={{ fontSize: 10, color: "#389E0D" }}>✓</span>}
        </div>

        {days !== undefined && days !== 0 && (
          <span style={{
            fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20,
            background: done ? "#F6FFED" : (days > 0 ? "#FFF1F0" : "#F6FFED"),
            color: done ? "#389E0D" : (days > 0 ? "#CF1322" : "#389E0D"),
            border: `1px solid ${done ? "#B7EB8F" : (days > 0 ? "#FFA39E" : "#B7EB8F")}`,
          }}>
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
//  STAGE PROGRESS MODAL
// ─────────────────────────────────────────────
const StageProgressModal = ({ show, onClose, fileId }) => {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && fileId) {
      setLoading(true);
      const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };
      ApiService(null, fileId, header, getMembersdata.method, getMembersdata.url)
        .then((res) => {
          setStages(res.data.data.member_names || []);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [show, fileId]);

  if (!show) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.5)", zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ background: "#fff", borderRadius: 12, width: 400, maxWidth: "90%", padding: 20, position: "relative" }}>
        <button
          onClick={onClose}
          style={{ position: "absolute", right: 15, top: 15, background: "none", border: "none", fontSize: 20, cursor: "pointer", color: THEME.textMuted }}
        >
          ×
        </button>
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
//  TABLE ROW  (memo)
// ─────────────────────────────────────────────
const EmpApprovalRow = memo(({ item, index, onAccordion, searchQuery, onOpenStageModal }) => {
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
            <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: THEME.brandLight, color: THEME.brandDark, border: `1px solid #D4C4A0` }}>
              <Hl text={item.projectType} query={searchQuery} />
            </span>
          )}
          {item.category && (
            <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: "#F9F0FF", color: "#531DAB", border: "1px solid #D3ADF7" }}>
              <Hl text={item.category} query={searchQuery} />
            </span>
          )}
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
          {(item.cs_no || item.ward_no) && (
            <span>C.S: <Hl text={item.cs_no || "—"} query={searchQuery} /> / Ward: <Hl text={item.ward_no || "—"} query={searchQuery} /></span>
          )}
          {item.subplot_no && (
            <span>Subplot: <Hl text={item.subplot_no} query={searchQuery} /></span>
          )}
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

      {/* Team & Stage Progress */}
      <td style={{ minWidth: 150, textAlign: "center" }}>
        <button
          onClick={() => onOpenStageModal(item.id)}
          style={{
            background: THEME.brandLight,
            color: THEME.brand,
            border: `1px solid ${THEME.border}`,
            padding: "6px 12px",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          👁️ View Progress
        </button>
      </td>
       {/* Action */}
        <td style={{ textAlign: "center" }}>
          <ActionMenu id={item.id}  />
        </td>
    </tr>
  );
});


// ─────────────────────────────────────────────
//  TAB CONFIG
// ─────────────────────────────────────────────
const TABS = [
  { key: "all_files",      label: "All Files"      },
  { key: "dc",             label: "D.C."           },
  { key: "pv",             label: "P.V."           },
  { key: "fire_noc",       label: "Fire NOC"       },
  { key: "e_nagar_portal", label: "E-Nagar Portal" },
  { key: "b_permission",   label: "B. Permission"  },
];


// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const EmpApprovalProcessList = () => {
  const navigate = useNavigate();
  const header   = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };

  const [loading,          setLoading]         = useState(false);
  const [activeTab,        setActiveTab]        = useState("all_files");
  const [searchQuery,      setSearchQuery]      = useState("");
  const [data,             setData]             = useState([]);
  const [dcData,           setDcData]           = useState([]);
  const [pvData,           setPvData]           = useState([]);
  const [fireNocData,      setFireNocData]      = useState([]);
  const [eNagarportalData, setENagarportalData] = useState([]);
  const [bPermissionData,  setBpermissionData]  = useState([]);

  // ── Stage progress modal state ────────────
  const [showStageModal, setShowStageModal] = useState(false);
  const [stageFileId,    setStageFileId]    = useState(null);

  const handleOpenStageModal = useCallback((id) => {
    setStageFileId(id);
    setShowStageModal(true);
  }, []);

  const searchInputRef = useRef();

  // ── 6 APIs in parallel ────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const apis = [
        fetchEmpAllfile, fetchempdcfile, fetchempPVfile,
        fetchempFireNocfile, fetchempENagarPortalfile, fetchempBpermissionfile,
      ];
      const results = await Promise.all(
        apis.map((api) => ApiService(null, 0, header, api.method, api.url))
      );
      const safe = (res) => {
        const d = res?.data?.data;
        if (Array.isArray(d)) return d;
        if (d && typeof d === "object") return [d];
        return [];
      };
      setData(safe(results[0]));
      setDcData(safe(results[1]));
      setPvData(safe(results[2]));
      setFireNocData(safe(results[3]));
      setENagarportalData(safe(results[4]));
      setBpermissionData(safe(results[5]));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, []);

  // ── Tab source (before search) ────────────
  const tabSource = useMemo(() => {
    const map = {
      all_files:      data,
      dc:             dcData,
      pv:             pvData,
      fire_noc:       fireNocData,
      e_nagar_portal: eNagarportalData,
      b_permission:   bPermissionData,
    };
    const source = map[activeTab];
    return Array.isArray(source) ? source : [];
  }, [activeTab, data, dcData, pvData, fireNocData, eNagarportalData, bPermissionData]);

  // ── Final filtered + searched data ────────
  const filteredData = useMemo(() => {
    const searched = tabSource.filter((item) => itemMatchesSearch(item, searchQuery));
    return [...searched].sort((a, b) => b.id - a.id);
  }, [tabSource, searchQuery]);

  // ── Tab counts reflect search ──────────────
  const counts = useMemo(() => {
    const allSources = {
      all_files: data, dc: dcData, pv: pvData,
      fire_noc: fireNocData, e_nagar_portal: eNagarportalData, b_permission: bPermissionData,
    };
    const result = {};
    for (const key of Object.keys(allSources)) {
      const src = Array.isArray(allSources[key]) ? allSources[key] : [];
      result[key] = searchQuery.trim()
        ? src.filter((item) => itemMatchesSearch(item, searchQuery)).length
        : src.length;
    }
    return result;
  }, [data, dcData, pvData, fireNocData, eNagarportalData, bPermissionData, searchQuery]);

  // ── Navigate on case click ────────────────
  const handleAccordionClick = useCallback(
    (id, landType) => {
      if (activeTab === "all_files" || !landType) {
        navigate(`/${ApprovalRoute.document_add}/${id}`);
        return;
      }
      const routes = {
        "D.C.":           ApprovalRoute.document_add,
        DC:               ApprovalRoute.document_add,
        "P.V.":           ApprovalRoute.pv_add,
        PV:               ApprovalRoute.pv_add,
        "Fire NOC":       ApprovalRoute.fire_noc_add,
        "E-Nagar Portal": ApprovalRoute.e_nagar_portal_add,
        "B.Permission":   ApprovalRoute.buildingpermissionadd,
        "B. Permission":  ApprovalRoute.buildingpermissionadd,
        "Site Visit":     ApprovalRoute.sitevisit,
      };
      const route = routes[landType] || ApprovalRoute.document_add;
      if (route) navigate(`/${route}/${id}`);
    },
    [navigate, activeTab],
  );

  // Clear search on tab switch
  const handleTabChange = (key) => {
    setActiveTab(key);
    setSearchQuery("");
  };

  return (
    <>
      <style>{CSS}</style>

      <div style={{ minHeight: "100vh", background: THEME.bg, fontFamily: "'DM Sans',sans-serif", padding: "28px 24px" }}>

        {/* ── Page header ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <div style={{ width: 4, height: 26, borderRadius: 3, background: `linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: THEME.text, fontFamily: "'Sora',sans-serif", letterSpacing: "-0.3px" }}>
            Approval Process
          </h1>
        </div>

        {/* ── Main card ── */}
        <div style={{ background: "#fff", border: `1px solid ${THEME.border}`, borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 12px rgba(136,117,73,0.07)" }}>

          {/* Tab bar + Search */}
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${THEME.border}`, background: "#FDFAF5" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <ul className="eal-tabs" style={{ flex: 1, minWidth: 0 }}>
                {TABS.map((t) => (
                  <li key={t.key}>
                    <button
                      className={`eal-tab${activeTab === t.key ? " active" : ""}`}
                      onClick={() => handleTabChange(t.key)}
                    >
                      {t.label}
                      <span className="eal-tab-count">{counts[t.key] ?? 0}</span>
                    </button>
                  </li>
                ))}
              </ul>

              {/* Search input */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                {searchQuery.trim() && (
                  <span className="eal-search-result-hint">
                    {filteredData.length} result{filteredData.length !== 1 ? "s" : ""}
                  </span>
                )}
                <div className="eal-search-wrap">
                  <span className="eal-search-icon">🔍</span>
                  <input
                    ref={searchInputRef}
                    className="eal-search-input"
                    type="text"
                    placeholder="Search files…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      className="eal-search-clear"
                      onClick={() => { setSearchQuery(""); searchInputRef.current?.focus(); }}
                      title="Clear search"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0", gap: 16 }}>
              <div className="eal-spinner" />
              <p style={{ color: THEME.textLight, fontSize: 13, margin: 0 }}>Loading files…</p>
            </div>
          )}

          {/* Empty */}
          {!loading && filteredData.length === 0 && (
            <div style={{ textAlign: "center", padding: "64px 0" }}>
              <div style={{ fontSize: 38, marginBottom: 10 }}>{searchQuery.trim() ? "🔍" : "📋"}</div>
              <p style={{ color: THEME.textLight, fontSize: 14, margin: 0, fontWeight: 600 }}>
                {searchQuery.trim()
                  ? `No files match "${searchQuery}"`
                  : "No files found for this category."}
              </p>
              {searchQuery.trim() && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{
                    marginTop: 12, padding: "6px 16px", borderRadius: 20,
                    border: `1.5px solid ${THEME.brand}`, background: THEME.brandLight,
                    color: THEME.brand, fontWeight: 700, fontSize: 12, cursor: "pointer",
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  Clear Search
                </button>
              )}
            </div>
          )}

          {/* Table */}
          {!loading && filteredData.length > 0 && (
            <div className="eal-fade" style={{ overflowX: "auto" }}>
              <table className="eal-table">
                <thead>
                  <tr>
                    {["#", "Case No.", "Land Details", "Authority", "Team & Stage Progress","Action"].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, idx) => (
                    <EmpApprovalRow
                      key={item.id}
                      item={item}
                      index={idx}
                      onAccordion={handleAccordionClick}
                      searchQuery={searchQuery}
                      onOpenStageModal={handleOpenStageModal}
                    />
                  ))}
                </tbody>
              </table>
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

export default EmpApprovalProcessList;