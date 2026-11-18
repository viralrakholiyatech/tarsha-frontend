import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import { Link } from "react-router-dom";
import ApiService from "../../../services/ApiService";
import { getToken } from "../../../services/useLocalStorage";
import { getAlltentative } from "../../../config/config";
import { TentativeRoute } from "../../../config/RouteConfig";
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

// Type colors for pills + stat cards
const TYPE_STYLES = {
  architecture: { bg: "#E6F4FF", color: "#0958D9", border: "#91CAFF", label: "Architecture" },
  interior:     { bg: "#F9F0FF", color: "#531DAB", border: "#D3ADF7", label: "Interior" },
  approval:     { bg: "#FFF7E6", color: "#D46B08", border: "#FFD591", label: "Approval" },
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing:border-box; }
  @keyframes tlFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .tl-fade { animation:tlFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes tlSpin { to{transform:rotate(360deg)} }
  .tl-spinner {
    width:28px;height:28px;border-radius:50%;
    border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};
    animation:tlSpin 0.8s linear infinite;
  }

  .tl-search {
    padding:9px 14px 9px 36px;border-radius:10px;border:1.5px solid #E0D5C5;
    font-size:13px;font-family:'DM Sans',sans-serif;color:#1A1A2E;
    outline:none;background:#fff;width:220px;
    transition:border-color 0.15s,box-shadow 0.15s;
  }
  .tl-search:focus { border-color:${THEME.brand};box-shadow:0 0 0 3px ${THEME.brand}18; }
  .tl-search::placeholder { color:${THEME.textLight}; }

  .tl-table { width:100%;border-collapse:collapse;font-family:'DM Sans',sans-serif; }
  .tl-table th {
    padding:10px 14px;font-size:11px;font-weight:700;color:${THEME.brandDark};
    text-transform:uppercase;letter-spacing:0.07em;
    background:${THEME.brandLight};border-bottom:2px solid #D4C4A0;white-space:nowrap;
    cursor:pointer;user-select:none;
  }
  .tl-table th:hover { background:#EDE5D5; }
  .tl-table td { padding:12px 14px;border-bottom:1px solid #F5EFE4;vertical-align:top; }
  .tl-table tbody tr:nth-child(even) { background:${THEME.rowAlt}; }
  .tl-table tbody tr:hover { background:${THEME.rowHover}; }

  .tl-pg-btn {
    padding:5px 10px;border-radius:7px;border:1.5px solid ${THEME.border};
    background:#fff;cursor:pointer;font-size:12px;font-weight:600;color:#595959;
    font-family:'DM Sans',sans-serif;transition:all 0.15s;
  }
  .tl-pg-btn:hover:not(:disabled) { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand}; }
  .tl-pg-btn:disabled { opacity:0.35;cursor:not-allowed; }

  ::-webkit-scrollbar { width:5px;height:5px; }
  ::-webkit-scrollbar-track { background:${THEME.brandLight}; }
  ::-webkit-scrollbar-thumb { background:${THEME.brandMid};border-radius:10px; }
`;

const PAGE_SIZE = 20;

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
//  Helper: parse `tentative_types` into an array of lowercase strings.
//  Handles CSV strings, JSON strings, and actual arrays.
// ─────────────────────────────────────────────
const parseTypes = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((v) => String(v).trim().toLowerCase()).filter(Boolean);
  if (typeof raw === "string") {
    const s = raw.trim();
    if (!s) return [];
    // try JSON first
    if (s.startsWith("[")) {
      try {
        const arr = JSON.parse(s);
        if (Array.isArray(arr))
          return arr.map((v) => String(v).trim().toLowerCase()).filter(Boolean);
      } catch (_) {}
    }
    return s.split(",").map((v) => v.trim().toLowerCase()).filter(Boolean);
  }
  return [];
};

function EditBtn({ to }) {
  const [hov, setHov] = useState(false);
  return (
    <Link
      to={to}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "5px 12px",
        borderRadius: 8,
        border: `1.5px solid ${hov ? THEME.brand : "#E0D5C5"}`,
        background: hov ? THEME.brandLight : "#fff",
        color: hov ? THEME.brand : "#595959",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
        textDecoration: "none",
        transition: "all 0.15s",
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      ✏️ Edit
    </Link>
  );
}

function UpdateBtn({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "5px 12px",
        borderRadius: 8,
        border: `1.5px solid ${hov ? THEME.brand : "#E0D5C5"}`,
        background: hov ? THEME.brandLight : "#fff",
        color: hov ? THEME.brand : "#595959",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
        transition: "all 0.15s",
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      🔄 Service
    </button>
  );
}

// ─────────────────────────────────────────────
//  TYPE PILL
// ─────────────────────────────────────────────
const TypePill = ({ type }) => {
  const s = TYPE_STYLES[type];
  if (!s) return null;
  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: 20,
        fontSize: 10,
        fontWeight: 700,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
};

// ─────────────────────────────────────────────
//  TABLE ROW
// ─────────────────────────────────────────────
const TentativeRow = memo(({ item, index, onUpdate }) => {
  const types = parseTypes(item.tentative_types);

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
        <p style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 700, color: THEME.brand }}>
          {item.case_id}
          {item.client_name && (
            <span style={{ fontWeight: 400, color: THEME.textMuted }}>
              {" "}({item.client_name})
            </span>
          )}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
          {item.project_name && (
            <p style={{ margin: 0, fontSize: 12, color: THEME.textMuted }}>
              {item.project_name}
            </p>
          )}
          <span
            style={{
              padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700,
              background: "#FFF7E6", color: "#D46B08", border: "1px solid #FFD591",
            }}
          >
            Tentative
          </span>
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {item.projectType && (
            <span
              style={{
                padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600,
                background: THEME.brandLight, color: THEME.brandDark, border: `1px solid #D4C4A0`,
              }}
            >
              {item.projectType}
            </span>
          )}
          {item.category && (
            <span
              style={{
                padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600,
                background: "#F9F0FF", color: "#531DAB", border: "1px solid #D3ADF7",
              }}
            >
              {item.category}
            </span>
          )}
        </div>
      </td>

      {/* Tentative Types */}
      <td>
        {types.length > 0 ? (
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {types.map((t) => (
              <TypePill key={t} type={t} />
            ))}
          </div>
        ) : (
          <span style={{ color: THEME.textLight, fontSize: 12 }}>—</span>
        )}
      </td>

{/* Land Details */}
<td style={{ maxWidth: 220, minWidth: 180, fontSize: 12, color: "#595959" }}>
  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
    {item.address && (
      <div
        title={item.address}
        style={{
          display: "flex",
          gap: 5,
          alignItems: "flex-start",
          paddingBottom: 6,
          marginBottom: 3,
          borderBottom: `1px dashed ${THEME.border}`,
          lineHeight: 1.4,
          wordBreak: "break-word",
          overflowWrap: "anywhere",
          whiteSpace: "normal",
        }}
      >
        <span style={{ flexShrink: 0 }}>📍</span>
        <span
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          <Hl text={item.address}  />
        </span>
      </div>
    )}

    {/* {(item.village || item.tpscheme) && (
      <span>🏘️ <Hl text={[item.village, item.tpscheme].filter(Boolean).join(", ")}  /></span>
    )}
    {(item.op_no || item.fp_no) && (
      <span>O.P: <Hl text={item.op_no || "—"}  /> / F.P: <Hl text={item.fp_no || "—"}  /></span>
    )}
    {item.ward_no && <span>Ward: <Hl text={item.ward_no}  /></span>}
    {item.cs_no && <span>C.S: <Hl text={item.cs_no}  /></span>}
    {(item.rs_no || item.b_no) && (
      <span>R.S: <Hl text={item.rs_no || "—"}  /> / B: <Hl text={item.b_no || "—"}  /></span>
    )} */}
  </div>
</td>

      {/* Authority */}
      <td>
        {item.authority ? (
          <span
            style={{
              padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
              background: "#F0F5FF", color: "#2F54EB", border: "1px solid #ADC6FF",
              whiteSpace: "nowrap",
            }}
          >
            {item.authority}
          </span>
        ) : ("—")}
      </td>

      <td style={{ whiteSpace: "nowrap" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <EditBtn to={`/${TentativeRoute.edit}/${item.id}`} />
          <UpdateBtn onClick={() => onUpdate(item.id)} />
        </div>
      </td>
    </tr>
  );
});

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const TentativeList = () => {
  const header = {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState("id");
  const [sortDesc, setSortDesc] = useState(true);
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all"); // all | architecture | interior | approval

  const handleUpdate = useCallback((id) => {
    setActiveId(id);
    setModalOpen(true);
  }, []);

  const fetchdata = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService(
        null, 0, header,
        getAlltentative.method, getAlltentative.url,
      );

      if (!res.data.error)
        setData(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchdata(); }, []);

  const toggleSort = (col) => {
    if (sortCol === col) setSortDesc((d) => !d);
    else {
      setSortCol(col);
      setSortDesc(true);
    }
    setPage(0);
  };

  // ── Step 1: Only show tentative=yes with at least one type ──
  const tentativeRows = useMemo(() => {
    return data
      .filter((r) => r.tentative_design === "yes")
      .map((r) => ({ ...r, _types: parseTypes(r.tentative_types) }))
      
  }, [data]);

  // ── Step 2: Counts per type (across full tentative dataset) ──
  const typeCounts = useMemo(() => {
    const counts = { architecture: 0, interior: 0, approval: 0 };
    tentativeRows.forEach((r) => {
      r._types.forEach((t) => {
        if (counts[t] !== undefined) counts[t] += 1;
      });
    });
    return counts;
  }, [tentativeRows]);

  // ── Step 3: Apply search + type filter + sort ──
  const processed = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = tentativeRows.filter((r) => {
      const matchSearch =
        !q ||
        (r.case_id || "").toLowerCase().includes(q) ||
        (r.client_name || "").toLowerCase().includes(q) ||
        (r.project_name || "").toLowerCase().includes(q) ||
        (r.authority || "").toLowerCase().includes(q) ||
        (r.projectType || "").toLowerCase().includes(q);
      const matchType = typeFilter === "all" || r._types.includes(typeFilter);
      return matchSearch && matchType;
    });
    return [...filtered].sort((a, b) => (sortDesc ? b.id - a.id : a.id - b.id));
  }, [tentativeRows, search, sortCol, sortDesc, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE));
  const pageData = processed.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const sortIcon = (col) => (sortCol === col ? (sortDesc ? " ↓" : " ↑") : "");

  // ── Stat cards ──
  const statCards = [
    { key: "all", label: "Total Tentative", value: tentativeRows.length, color: THEME.brand },
    { key: "architecture", label: "Architecture", value: typeCounts.architecture, color: TYPE_STYLES.architecture.color },
    { key: "interior",     label: "Interior",     value: typeCounts.interior,     color: TYPE_STYLES.interior.color },
    { key: "approval",     label: "Approval",     value: typeCounts.approval,     color: TYPE_STYLES.approval.color },
  ];

  return (
    <>
      <style>{CSS}</style>

      <ServiceUpdateModal
        show={modalOpen}
        handleClose={() => { setModalOpen(false); setActiveId(null); }}
        fileId={activeId}
        onSuccess={() => { fetchdata(); }}
      />

      <div style={{ minHeight: "100vh", background: THEME.bg, fontFamily: "'DM Sans',sans-serif", padding: "28px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <div
            style={{
              width: 4, height: 26, borderRadius: 3,
              background: `linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)`,
            }}
          />
          <h1
            style={{
              margin: 0, fontSize: 22, fontWeight: 800, color: THEME.text,
              fontFamily: "'Sora',sans-serif", letterSpacing: "-0.3px",
            }}
          >
            Tentative Projects
          </h1>
        </div>

        {/* Stats bar — clickable to filter */}
        {!loading && tentativeRows.length > 0 && (
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            {statCards.map((s) => {
              const active = typeFilter === s.key;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => { setTypeFilter(s.key); setPage(0); }}
                  style={{
                    background: active ? "#fff" : "#fff",
                    border: active ? `2px solid ${s.color}` : `1px solid ${THEME.border}`,
                    borderRadius: 10,
                    padding: "10px 18px",
                    borderTop: `3px solid ${s.color}`,
                    boxShadow: active
                      ? `0 4px 12px ${s.color}33`
                      : "0 2px 8px rgba(136,117,73,0.06)",
                    minWidth: 130,
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "inherit",
                    transition: "all 0.18s",
                  }}
                >
                  <p
                    style={{
                      margin: 0, fontSize: 10, fontWeight: 700,
                      color: THEME.textMuted, textTransform: "uppercase",
                      letterSpacing: "0.07em",
                    }}
                  >
                    {s.label}
                  </p>
                  <p
                    style={{
                      margin: "3px 0 0", fontSize: 18, fontWeight: 800,
                      color: s.color, fontFamily: "'Sora',sans-serif",
                    }}
                  >
                    {s.value}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {/* Main card */}
        <div
          style={{
            background: "#fff", border: `1px solid ${THEME.border}`,
            borderRadius: 14, overflow: "hidden",
            boxShadow: "0 2px 12px rgba(136,117,73,0.07)",
          }}
        >
          {/* Search */}
          <div
            style={{
              padding: "14px 20px",
              borderBottom: `1px solid ${THEME.border}`,
              background: "#FDFAF5",
              display: "flex", alignItems: "center",
              gap: 10, flexWrap: "wrap",
            }}
          >
            <div style={{ position: "relative", flex: 1, maxWidth: 280 }}>
              <span
                style={{
                  position: "absolute", left: 11, top: "50%",
                  transform: "translateY(-50%)", fontSize: 14, color: THEME.textMuted,
                }}
              >
                🔍
              </span>
              <input
                className="tl-search"
                type="search"
                placeholder="Search projects…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              />
            </div>
            {typeFilter !== "all" && (
              <span style={{ fontSize: 12, color: THEME.textMuted }}>
                Showing: <strong style={{ color: TYPE_STYLES[typeFilter]?.color }}>
                  {TYPE_STYLES[typeFilter]?.label}
                </strong>
                {" · "}
                <button
                  type="button"
                  onClick={() => { setTypeFilter("all"); setPage(0); }}
                  style={{
                    background: "none", border: "none", padding: 0,
                    color: THEME.brand, cursor: "pointer", fontWeight: 600,
                    fontSize: 12,
                  }}
                >
                  Clear
                </button>
              </span>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0", gap: 16 }}>
              <div className="tl-spinner" />
              <p style={{ color: THEME.textLight, fontSize: 13, margin: 0 }}>Loading projects…</p>
            </div>
          )}

          {/* Empty */}
          {!loading && processed.length === 0 && (
            <div style={{ textAlign: "center", padding: "64px 0" }}>
              <div style={{ fontSize: 38, marginBottom: 10 }}>📐</div>
              <p style={{ color: THEME.textLight, fontSize: 14, margin: 0 }}>
                No tentative projects found.
              </p>
            </div>
          )}

          {/* Table */}
          {!loading && processed.length > 0 && (
            <div className="tl-fade" style={{ overflowX: "auto" }}>
              <table className="tl-table">
                <thead>
                  <tr>
                    <th style={{ width: 36 }}>#</th>
                    <th onClick={() => toggleSort("case_id")}>
                      Case No.{sortIcon("case_id")}
                    </th>
                    <th>Tentative Types</th>
                    <th>Land Details</th>
                    <th onClick={() => toggleSort("authority")}>
                      Authority{sortIcon("authority")}
                    </th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((item, idx) => (
                    <TentativeRow
                      key={item.id}
                      item={item}
                      index={page * PAGE_SIZE + idx}
                      onUpdate={handleUpdate}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div
              style={{
                display: "flex", alignItems: "center",
                justifyContent: "flex-end", gap: 8,
                padding: "12px 20px", borderTop: `1px solid ${THEME.border}`,
              }}
            >
              <button className="tl-pg-btn" onClick={() => setPage(0)} disabled={page === 0}>«</button>
              <button className="tl-pg-btn" onClick={() => setPage((p) => p - 1)} disabled={page === 0}>‹</button>
              <span style={{ fontSize: 12, fontWeight: 600, color: THEME.textMuted }}>
                {page + 1} of {totalPages}
              </span>
              <button className="tl-pg-btn" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1}>›</button>
              <button className="tl-pg-btn" onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}>»</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TentativeList;