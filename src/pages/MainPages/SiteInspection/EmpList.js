import React, { useEffect, useState, useMemo } from "react";
import { deletesites, getempsitebyId } from "../../../config/config";
import ApiService from "../../../services/ApiService";
import { getToken } from "../../../services/useLocalStorage";
import { FileUrl, eyeButtonSvg } from "../../../config/file_url";
import { useNavigate } from "react-router-dom";
import { SiteRoute } from "../../../config/RouteConfig";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import toast from "react-hot-toast";


// ─────────────────────────────────────────────
//  🎨  THEME  —  change colours here
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


// ─────────────────────────────────────────────
//  📋  TABLE COLUMNS
//  label    → header text
//  key      → field name from API
//  bold     → bold cell text
//  badge    → "gold" | "blue" renders as pill
//  truncate → ellipsis overflow (use with width)
//  width    → max-width in px
//  type     → "sign" renders ClientSign widget
//  center   → centre-align
// ─────────────────────────────────────────────
const COLUMNS = [
  { label: "#",             key: "__index",        center: true             },
  { label: "Date",          key: "created_at",                              },
  { label: "File / Case",   key: "case_id",        bold: true               },
  { label: "Department",    key: "department",     badge: "gold"            },
  { label: "Client",        key: "client_name"                              },
  { label: "Inspected By",  key: "inspectedby"                              },
  { label: "Site Incharge", key: "site_incharge"                            },
  { label: "Category",      key: "visit_category", badge: "blue"            },
  { label: "Work",          key: "visit_work",     truncate: true, width:160},
  { label: "Client Sign",   key: "client_sign",    type: "sign"             },
];


// ─────────────────────────────────────────────
//  🏷  BADGE COLOUR MAP  —  add more here
// ─────────────────────────────────────────────
const BADGE = {
  gold: { bg: THEME.brandLight, color: THEME.brand,  border: "#D4C4A0" },
  blue: { bg: "#F0F5FF",        color: "#2F54EB",    border: "#ADC6FF" },
};


// ─────────────────────────────────────────────
//  📄  ROWS PER PAGE
// ─────────────────────────────────────────────
const PAGE_SIZE = 10;


// ─────────────────────────────────────────────
//  📝  GLOBAL CSS
// ─────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fade-in { animation: fadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner {
    width: 28px; height: 28px; border-radius: 50%;
    border: 3px solid ${THEME.brandLight};
    border-top-color: ${THEME.brand};
    animation: spin 0.8s linear infinite;
  }
`;


// ─────────────────────────────────────────────
//  🔧  HELPERS
// ─────────────────────────────────────────────

/** <td> base style */
function tdStyle(isLast, center = false) {
  return {
    padding: "11px 14px",
    borderBottom: isLast ? "none" : "1px solid #F5EFE4",
    textAlign: center ? "center" : "left",
    verticalAlign: "middle",
  };
}

/** Filter rows by search query across all string fields */
function applySearch(rows, query) {
  if (!query.trim()) return rows;
  const q = query.toLowerCase();
  return rows.filter((r) =>
    Object.values(r).some((v) => String(v || "").toLowerCase().includes(q))
  );
}


// ─────────────────────────────────────────────
//  🧩  SMALL UI PIECES
// ─────────────────────────────────────────────

/** Pill badge */
function Badge({ text, type = "gold" }) {
  if (!text) return <span style={{ color: THEME.textLight }}>—</span>;
  const s = BADGE[type] || BADGE.gold;
  return (
    <span style={{
      padding: "2px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      {text}
    </span>
  );
}

/** Client signature — image thumbnail or PDF icon */
function ClientSign({ sign }) {
  const FILE_BASE = "https://webappapi.zaidexceldesign.com"; // 🔧 change if URL changes
  if (!sign) return <span style={{ color: THEME.textLight, fontSize: 12 }}>—</span>;

  const url   = `${FILE_BASE}/${sign}`;
  const isPdf = sign.toLowerCase().endsWith(".pdf");

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block" }}>
      {isPdf ? (
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: "#FFF1F0", border: "1px solid #FFA39E",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18,
        }}>📄</div>
      ) : (
        <img
          src={url}
          alt="Client signature"
          style={{
            width: 44, height: 44, objectFit: "cover",
            borderRadius: 8, border: `1px solid ${THEME.border}`,
            transition: "transform 0.15s",
          }}
          onMouseEnter={(e) => { e.target.style.transform = "scale(1.1)"; }}
          onMouseLeave={(e) => { e.target.style.transform = "scale(1)"; }}
        />
      )}
    </a>
  );
}

/** Search input */
function SearchInput({ value, onChange }) {
  return (
    <div style={{ position: "relative" }}>
      <span style={{
        position: "absolute", left: 11, top: "50%",
        transform: "translateY(-50%)", color: THEME.brandMid,
        fontSize: 13, pointerEvents: "none",
      }}>🔍</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search inspections…"
        style={{
          paddingLeft: 32, paddingRight: 12,
          paddingTop: 8, paddingBottom: 8,
          borderRadius: 10, border: `1.5px solid #E0D5C5`,
          fontSize: 13, color: "#434343",
          fontFamily: "'DM Sans', sans-serif",
          outline: "none", width: 220, background: "#fff",
          transition: "border-color 0.18s",
        }}
        onFocus={(e) => { e.target.style.borderColor = THEME.brand; }}
        onBlur={(e)  => { e.target.style.borderColor = "#E0D5C5"; }}
      />
    </div>
  );
}

/** Primary / outline header button */
function ActionBtn({ label, icon, onClick, variant = "primary" }) {
  const [hovered, setHovered] = useState(false);
  const isPrimary = variant === "primary";
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "8px 16px", borderRadius: 10,
        fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
        fontFamily: "'Sora', sans-serif", cursor: "pointer",
        transition: "all 0.18s",
        background: isPrimary
          ? (hovered ? THEME.brandDark : THEME.brand) : (hovered ? THEME.brandLight : "#fff"),
        border: `1.5px solid ${isPrimary ? (hovered ? THEME.brandDark : THEME.brand) : "#E0D5C5"}`,
        color: isPrimary ? "#fff" : (hovered ? THEME.brand : "#595959"),
        boxShadow: isPrimary
          ? (hovered ? `0 4px 14px ${THEME.brand}55` : `0 2px 8px ${THEME.brand}33`)
          : "0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
      {label}
    </button>
  );
}

/** Pagination bar */
function Pagination({ page, total, canPrev, canNext, onFirst, onPrev, onNext, onLast }) {
  const btnStyle = (disabled) => ({
    width: 32, height: 32, borderRadius: 8, cursor: disabled ? "default" : "pointer",
    background: disabled ? "#F5F5F5" : "#fff",
    border: `1px solid ${disabled ? "#E8E8E8" : "#E0D5C5"}`,
    color: disabled ? THEME.textLight : THEME.brand,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 14, fontWeight: 700, transition: "all 0.15s",
  });
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "flex-end",
      gap: 6, padding: "12px 20px",
      borderTop: "1px solid #F5EFE4", background: "#FDFAF5",
    }}>
      <button style={btnStyle(!canPrev)} onClick={onFirst} disabled={!canPrev}>«</button>
      <button style={btnStyle(!canPrev)} onClick={onPrev}  disabled={!canPrev}>‹</button>
      <span style={{ fontSize: 13, color: "#595959", fontWeight: 600, padding: "0 8px" }}>
        Page <span style={{ color: THEME.brand }}>{page}</span> of {total}
      </span>
      <button style={btnStyle(!canNext)} onClick={onNext} disabled={!canNext}>›</button>
      <button style={btnStyle(!canNext)} onClick={onLast} disabled={!canNext}>»</button>
    </div>
  );
}


// ─────────────────────────────────────────────
//  📊  STATS BAR
// ─────────────────────────────────────────────
function StatsBar({ sites }) {
  // 🔧 Add or remove stat tiles here
  const stats = [
    {
      label: "Total",
      value: sites.length,
      color: THEME.brand, bg: THEME.brandLight, border: "#D4C4A0",
    },
  ];

  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 22, flexWrap: "wrap" }}>
      {stats.map((s) => (
        <div key={s.label} style={{
          flex: "0 1 160px", background: "#fff",
          border: `1px solid ${s.border}`, borderRadius: 12,
          padding: "13px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: s.bg, border: `1px solid ${s.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: s.color }}>{s.value}</span>
          </div>
          <span style={{ fontSize: 12, color: "#8C8C8C", fontWeight: 600 }}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}


// ─────────────────────────────────────────────
//  🏗  TABLE ROW
// ─────────────────────────────────────────────
function SiteRow({ site, rowNumber, isLast }) {
  const [hovered, setHovered] = useState(false);

  // Renders cell content based on column config
  function renderCell(col) {
    if (col.key === "__index") return rowNumber;
    if (col.type === "sign")   return <ClientSign sign={site[col.key]} />;
    if (col.badge)             return <Badge text={site[col.key]} type={col.badge} />;

    const value = site[col.key] || "—";
    return (
      <span style={{
        fontSize: 13,
        fontWeight: col.bold ? 600 : 400,
        color: col.bold ? THEME.text : "#434343",
        ...(col.truncate
          ? { display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: col.width || 160 }
          : { whiteSpace: "nowrap" }
        ),
      }}>
        {value}
      </span>
    );
  }

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? THEME.rowHover : rowNumber % 2 === 0 ? "#fff" : THEME.rowAlt,
        transition: "background 0.15s",
      }}
    >
      {COLUMNS.map((col) => (
        <td key={col.key} style={tdStyle(isLast, col.center)}>
          {renderCell(col)}
        </td>
      ))}
    </tr>
  );
}


// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const EmpList = () => {
  const navigate = useNavigate();

  const [sites,     setSites]     = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [search,    setSearch]    = useState("");
  const [pageIndex, setPageIndex] = useState(0);

  const authHeader = {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };

  // ── API calls ──────────────────────────────

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await ApiService(null, 0, authHeader, getempsitebyId.method, getempsitebyId.url);

      if (!res.data.error) {
        const payload = res.data.data;
        if (Array.isArray(payload) && payload.length > 0) {
          const rows = payload.map((el) => ({
            id:              el.id,
            created_at:      el.created_at,
            case_id:         el.case_id,
            department:      el.department,
            client_name:     el.client_name,
            inspectedby:     el.inspectedby,
            site_incharge:   el.site_incharge,
            visit_category:  el.visit_category,
            visit_work:      el.visit_work,
            client_sign:     el.client_sign,
          }));

          // Sort newest first
          rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setSites(rows);
        }
      } else {
        toast.error(res.data.message || "Failed to load");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const deleteSite = async (id) => {
    try {
      setLoading(true);
      const res = await ApiService(null, id, authHeader, deletesites.method, deletesites.url);
      if (!res.data.error) {
        setSites((prev) => prev.filter((s) => parseInt(s.id) !== parseInt(id)));
        toast.success(res.data.message);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id) => {
    SwalAlert({})
      .then(async (result) => { if (result?.isConfirmed) await deleteSite(id); })
      .catch(() => toast.error("Unable to remove"));
  };

  useEffect(() => { fetchData(); }, []);

  // ── Derived data ───────────────────────────

  const filtered = useMemo(() => applySearch(sites, search), [sites, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(pageIndex, totalPages - 1);
  const pageData   = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const canPrev = safePage > 0;
  const canNext = safePage < totalPages - 1;

  // Reset to page 0 when search changes
  const handleSearch = (val) => { setSearch(val); setPageIndex(0); };

  // ── Render ─────────────────────────────────

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div style={{
        minHeight: "100vh", 
        fontFamily: "'DM Sans', sans-serif",
        padding: "28px 24px",
      }}>

        {/* Page header */}
        <div style={{
          display: "flex", alignItems: "flex-start",
          justifyContent: "space-between", flexWrap: "wrap",
          gap: 14, marginBottom: 22,
        }}>
          {/* Title */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{
                width: 4, height: 26, borderRadius: 3,
                background: `linear-gradient(180deg, ${THEME.brand} 0%, ${THEME.brandMid} 100%)`,
              }} />
              <h1 style={{
                margin: 0, fontSize: 22, fontWeight: 800,
                color: THEME.text, fontFamily: "'Sora', sans-serif", letterSpacing: "-0.3px",
              }}>
                Site Inspections
              </h1>
            </div>
            <p style={{ margin: "0 0 0 12px", fontSize: 12, color: THEME.textMuted }}>
              {loading ? "Loading…" : `${filtered.length} record${filtered.length !== 1 ? "s" : ""} found`}
            </p>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <SearchInput value={search} onChange={handleSearch} />
            <ActionBtn label="Add" icon="+" variant="primary" onClick={() => navigate(`/${SiteRoute.add}`)} />
          </div>
        </div>

        {/* Stats */}
        {!loading && sites.length > 0 && <StatsBar sites={filtered} />}

        {/* Loading spinner */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0", gap: 16 }}>
            <div className="spinner" />
            <p style={{ color: THEME.textLight, fontSize: 13, margin: 0 }}>Loading inspections…</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div style={{
            textAlign: "center", padding: "64px 0",
            background: "#fff", border: `1px solid ${THEME.border}`, borderRadius: 14,
          }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🏗️</div>
            <p style={{ color: THEME.textLight, fontSize: 14, margin: 0 }}>
              {search ? `No results for "${search}"` : "No site inspections found."}
            </p>
          </div>
        )}

        {/* Table */}
        {!loading && filtered.length > 0 && (
          <div className="fade-in" style={{
            background: "#fff", border: `1px solid ${THEME.border}`,
            borderRadius: 14, overflow: "hidden",
            boxShadow: "0 2px 12px rgba(136,117,73,0.07)",
          }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Sans', sans-serif" }}>

                {/* Column headers — driven by COLUMNS array */}
                <thead>
                  <tr style={{ background: THEME.brandLight }}>
                    {COLUMNS.map((col) => (
                      <th key={col.key} style={{
                        padding: "11px 14px",
                        fontSize: 11, fontWeight: 700, color: THEME.brand,
                        textTransform: "uppercase", letterSpacing: "0.07em",
                        borderBottom: `2px solid #D4C4A0`,
                        textAlign: col.center ? "center" : "left",
                        whiteSpace: "nowrap",
                      }}>
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {pageData.map((site, idx) => (
                    <SiteRow
                      key={site.id}
                      site={site}
                      rowNumber={safePage * PAGE_SIZE + idx + 1}
                      isLast={idx === pageData.length - 1}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                page={safePage + 1}
                total={totalPages}
                canPrev={canPrev}
                canNext={canNext}
                onFirst={() => setPageIndex(0)}
                onPrev={() => setPageIndex((p) => p - 1)}
                onNext={() => setPageIndex((p) => p + 1)}
                onLast={() => setPageIndex(totalPages - 1)}
              />
            )}
          </div>
        )}

      </div>
    </>
  );
};

export default EmpList;




// import React, { useEffect, useState } from "react";
// import { deletesites, getempsitebyId } from "../../../config/config";
// import ApiService from "../../../services/ApiService";
// import { GetDate } from "../../../services/DateAndTimeService";
// import { getToken } from "../../../services/useLocalStorage";
// import { FileUrl, eyeButtonSvg } from "../../../config/file_url";
// import { Link, useNavigate } from "react-router-dom";
// import { SiteRoute } from "../../../config/RouteConfig";
// import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
// import toast from "react-hot-toast";
// import {
//   useSortBy,
//   useTable,
//   usePagination,
//   useGlobalFilter,
//   useRowSelect,
// } from "react-table";
// import { MyLoader } from "../../../UtilsComponent/MyLoader";
// import { ReactSVG } from "react-svg";
// //sites_Expense
// const EmpList = () => {
//   const navigate = useNavigate();

//   let FileUrl = "https://webappapi.zaidexceldesign.com";
//   var header = {
//     Authorization: `Bearer ${getToken()}`,
//     ["Content-type"]: "application/json",
//   };
//   const [sites, setSites] = useState([]);
//   const [userId, setUserId] = useState("");
//   const [loading, setLoading] = useState(false);

//   const hname = {
//     created_at: "created_at",
//     department: "department",
//     client_name: "client_name",
//     inspectedby: "inspectedby",
//     site_incharge: "site_incharge",
//     visit_category: "visit_category",
//     visit_work: "visit_work",
//     client_sign: "client_sign",
//     case_id: "case_id",
//     action: "action",
//   };

//   const columns = React.useMemo(
//     () => [
//       {
//         Header: "Sr. No.",
//         accessor: (row, i) => i + 1,
//       },
//       {
//         Header: "Date",
//         accessor: `${hname.created_at}`,
//       },
//       {
//         Header: "Client",
//         accessor: `${hname.client_name}`,
//       },
//       {
//         Header: "Inspected By",
//         accessor: `${hname.inspectedby}`,
//       },
//       {
//         Header: "Site Incharge",
//         accessor: `${hname.site_incharge}`,
//       },
//       {
//         Header: "Visit Category",
//         accessor: `${hname.visit_category}`,
//       },
//       {
//         Header: "Visit Work",
//         accessor: `${hname.visit_work}`,
//       },
//       {
//         Header: "Client Sign",
//         accessor: `${hname.client_sign}`,
//         Cell: ({ row }) => (
//           <div style={{ position: "relative" }}>
//             {console.log(
//               "Image source:",
//               `${FileUrl}/${row.values[hname.client_sign]}`
//             )}
//             {row.values[hname.client_sign] ? (
//               <React.Fragment>
//                 <a
//                   href={`${FileUrl}/${row.values[hname.client_sign]}`}
//                   style={{
//                     position: "absolute",
//                     right: "-8px",
//                     top: "50%",
//                   }}
//                   target="_blank"
//                 >
//                   <ReactSVG
//                     src={`${eyeButtonSvg}`}
//                     wrapper="span"
//                     beforeInjection={(svg) => {
//                       // svg.classList.add('svg-class-name')
//                       svg.setAttribute("style", "width: 20px");
//                     }}
//                   />
//                 </a>
//               </React.Fragment>
//             ) : (
//               "No Image"
//             )}
//           </div>
//         ),
//       },
//     ],
//     []
//   );

//   const {
//     getTableProps,
//     getTableBodyProps,
//     headerGroups,
//     rows,
//     prepareRow,
//     canPreviousPage,
//     page,
//     canNextPage,
//     pageOptions,
//     pageCount,
//     gotoPage,
//     nextPage,
//     previousPage,
//     setPageSize,
//     setGlobalFilter,
//     state: { pageIndex, pageSize, globalFilter },
//   } = useTable(
//     {
//       columns,
//       data: sites,
//       initialState: { hiddenColumns: ["id"], pageIndex: 0, pageSize: 10 },
//     },

//     useGlobalFilter,
//     useSortBy,
//     usePagination
//   );

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const res = await ApiService(
//         null,
//         0,
//         header,
//         getempsitebyId.method,
//         getempsitebyId.url
//       );
//       console.log("res", res);
//       if (!res?.data?.error) {
//         setLoading(false);

//         const payload = res?.data?.data;
//         if (Array.isArray(payload) && payload.length > 0) {
//           const rows = [];

//           payload.forEach((element) => {
//             rows.push({
//               id: element?.id,
//               // [hname.created_at]: element?.created_at
//               //   ? GetDate(element?.created_at, "DD-MMM-YYYY")
//               //   : "-",
//               [hname.created_at]: element?.created_at,
//               [hname.client_name]: element?.client_name,
//               [hname.inspectedby]: element?.inspectedby,
//               [hname.site_incharge]: element?.site_incharge,
//               [hname.visit_category]: element?.visit_category,
//               [hname.visit_work]: element?.visit_work,
//               [hname.client_sign]: element?.client_sign,
//               [hname.case_id]: element?.case_id,
//               [hname.department]: element?.department,

//               // [hname.action]:element?.id
//             });
//           });
//           // Sort the rows in descending order based on the 'date' property
//           const sortedRows = rows.sort(
//             (a, b) =>
//               new Date(b[hname.created_at]) - new Date(a[hname.created_at])
//           );

//           setSites(sortedRows);

//           // setSites(rows);
//         }
//       } else {
//         setLoading(false);
//       }
//     } catch (err) {
//       setLoading(false);

//       console.log(err);
//       toast.error("Something went wrong");
//     }
//   };

//   const removeRow = (id) => {
//     try {
//       setSites((prevState) => {
//         return prevState.filter((d) => {
//           return parseInt(d?.id) != parseInt(id);
//         });
//       });
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const removesites = async (id) => {
//     try {
//       setLoading(true);

//       const res = await ApiService(
//         null,
//         id,
//         header,
//         deletesites.method,
//         deletesites.url
//       );
//       if (!res?.data?.error) {
//         setLoading(false);

//         removeRow(id);
//         toast.success(res?.data?.message);
//       } else {
//         setLoading(false);

//         toast.error(res?.data?.message);
//       }
//     } catch (err) {
//       setLoading(false);

//       console.log(err);
//       toast.error(
//         err?.response?.data?.message
//           ? err?.response?.data?.message
//           : "Something went wrong"
//       );
//     }
//   };

//   const onRemovesites = (id) => {
//     SwalAlert({})
//       .then(async (result) => {
//         if (result?.isConfirmed) {
//           await removesites(id);
//         }
//       })
//       .catch((err) => {
//         console.log(err);
//         toast.error("Unable to remove");
//       });
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const handleAdd = () => {
//     navigate(`/${SiteRoute.add}`);
//   };

//   return (
//     <div className="content__wrapper">
//       <section className="page-content">
//         <div className="page-title mobile-title">
//           <h1 className="h4 mb-0">Site Inspection</h1>
//           {/*<p className="mb-4">Online Process</p>*/}
//         </div>
//         <div className="row">
//           <div className="col-md-12">
//             <div className="zed__table card">
//               <h5 className="text-shadow-yellow px-2 mb-4">
//                 All Site Inspection
//               </h5>
//               <div className="row">
//                 <div className="col-lg-3 col-8">
//                   <GlobalFilter
//                     filter={globalFilter}
//                     setFilter={setGlobalFilter}
//                   />
//                 </div>
//                 <div className="col-md-4">
//                   <button className="form_save_btn" onClick={handleAdd}>
//                     Add
//                   </button>
//                 </div>
//               </div>
//               <div className="table-responsive">
//                 {loading ? (
//                   <MyLoader value={false} />
//                 ) : (
//                   <table className="table datatable" {...getTableProps()}>
//                     <thead>
//                       {headerGroups.map((headerGroup) => (
//                         <tr {...headerGroup.getHeaderGroupProps()}>
//                           {headerGroup.headers.map((column) => (
//                             <th
//                               {...column.getHeaderProps(
//                                 column.getSortByToggleProps()
//                               )}
//                             >
//                               {column.render("Header")}
//                               <span>
//                                 {column.isSorted
//                                   ? column.isSortedDesc
//                                     ? " 🔽"
//                                     : " 🔼"
//                                   : ""}
//                               </span>
//                             </th>
//                           ))}
//                         </tr>
//                       ))}
//                     </thead>
//                     <tbody {...getTableBodyProps()}>
//                       {/* {rows.map(row => { */}
//                       {page.map((row) => {
//                         prepareRow(row);
//                         return (
//                           <tr {...row.getRowProps()}>
//                             {row.cells.map((cell) => {
//                               return (
//                                 <td {...cell.getCellProps()}>
//                                   {cell.render("Cell")}
//                                 </td>
//                               );
//                             })}
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                     <tfoot>
//                       <td colSpan={5}>
//                         <div className="pagination justify-content-end align-items-center">
//                           <button
//                             className="pagination_button"
//                             onClick={() => gotoPage(0)}
//                             disabled={!canPreviousPage}
//                           >
//                             {"<<"}
//                           </button>
//                           <button
//                             className="pagination_button"
//                             onClick={() => previousPage()}
//                             disabled={!canPreviousPage}
//                           >
//                             {"<"}
//                           </button>
//                           <span>
//                             Page{" "}
//                             <strong>
//                               {pageIndex + 1} of {pageOptions.length}
//                             </strong>
//                           </span>
//                           <button
//                             className="pagination_button"
//                             onClick={() => nextPage()}
//                             disabled={!canNextPage}
//                           >
//                             {">"}
//                           </button>
//                           <button
//                             className="pagination_button"
//                             onClick={() => gotoPage(pageCount - 1)}
//                             disabled={!canNextPage}
//                           >
//                             {">>"}
//                           </button>
//                         </div>
//                       </td>
//                     </tfoot>
//                   </table>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default EmpList;

// const GlobalFilter = ({ filter, setFilter }) => {
//   return (
//     <span>
//       <input
//         className="form-control"
//         type={"search"}
//         style={{ margin: "5px" }}
//         value={filter}
//         onChange={(e) => setFilter(e.target.value)}
//         placeholder="Search"
//       />
//     </span>
//   );
// };


// ─────────────────────────────────────────────
//  EmpList.jsx  —  Employee Site Inspection
//  All colours, columns, and config at the TOP.
// ─────────────────────────────────────────────