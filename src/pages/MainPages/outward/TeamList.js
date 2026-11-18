import { BACKEND_URL } from "../../../config/backend";
// ─────────────────────────────────────────────
//  EmpOutwardList.jsx  —  Outward List (Employee)
//  Same design as AdminOutwardList — no delete
// ─────────────────────────────────────────────

import React, { useEffect, useState, useMemo, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../../../services/useLocalStorage";
import toast from "react-hot-toast";
import { OutwardRoute } from "../../../config/RouteConfig";
import ApiService from "../../../services/ApiService";
import { fetchOutwardTeamList } from "../../../config/config";
import { getFileDisplayUrl, openFileInNewTab } from "../../../services/S3Service";


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

const FileBaseUrl = BACKEND_URL;

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }
  @keyframes eolFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .eol-fade { animation:eolFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes eolSpin { to{transform:rotate(360deg)} }
  .eol-spinner { width:28px;height:28px;border-radius:50%;border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};animation:eolSpin 0.8s linear infinite; }

  .eol-search {
    padding:9px 14px 9px 36px;border-radius:10px;border:1.5px solid #E0D5C5;font-size:13px;
    font-family:'DM Sans',sans-serif;color:#1A1A2E;outline:none;background:#fff;width:220px;
    transition:border-color 0.15s,box-shadow 0.15s;
  }
  .eol-search:focus { border-color:${THEME.brand};box-shadow:0 0 0 3px ${THEME.brand}18; }
  .eol-search::placeholder { color:${THEME.textLight}; }

  .eol-table { width:100%;border-collapse:collapse;font-family:'DM Sans',sans-serif; }
  .eol-table th {
    padding:10px 14px;font-size:11px;font-weight:700;color:${THEME.brandDark};
    text-transform:uppercase;letter-spacing:0.07em;background:${THEME.brandLight};
    border-bottom:2px solid #D4C4A0;white-space:nowrap;cursor:pointer;user-select:none;
  }
  .eol-table th:hover { background:#EDE5D5; }
  .eol-table td { padding:11px 14px;border-bottom:1px solid #F5EFE4;vertical-align:middle; }
  .eol-table tbody tr:nth-child(even) { background:${THEME.rowAlt}; }
  .eol-table tbody tr:hover { background:${THEME.rowHover}; }

  .eol-add-btn {
    padding:9px 20px;border-radius:10px;border:none;background:${THEME.brand};color:#fff;
    font-size:13px;font-weight:700;cursor:pointer;font-family:'Sora',sans-serif;transition:all 0.18s;
    box-shadow:0 2px 8px ${THEME.brand}44;display:inline-flex;align-items:center;gap:6px;
  }
  .eol-add-btn:hover { background:${THEME.brandDark}; }

  .eol-view-btn {
    padding:5px 10px;border-radius:8px;border:1.5px solid #ADC6FF;
    background:#F0F5FF;color:#2F54EB;font-size:11px;font-weight:700;
    cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:4px;
    transition:all 0.15s;font-family:'DM Sans',sans-serif;white-space:nowrap;
  }
  .eol-view-btn:hover { background:#2F54EB;color:#fff;border-color:#2F54EB; }

  .eol-pg-btn {
    padding:5px 10px;border-radius:7px;border:1.5px solid ${THEME.border};
    background:#fff;cursor:pointer;font-size:12px;font-weight:600;color:#595959;
    font-family:'DM Sans',sans-serif;transition:all 0.15s;
  }
  .eol-pg-btn:hover:not(:disabled) { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand}; }
  .eol-pg-btn:disabled { opacity:0.35;cursor:not-allowed; }

  ::-webkit-scrollbar{width:5px;height:5px;}
  ::-webkit-scrollbar-track{background:${THEME.brandLight};}
  ::-webkit-scrollbar-thumb{background:${THEME.brandMid};border-radius:10px;}
`;

const PAGE_SIZE = 20;

function fmtDate(d) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }); }
  catch { return d; }
}

// ─── Table row — no delete ───────────────────
const OutwardRow = memo(({ item, index }) => (
  <tr>
    <td style={{ color:THEME.textMuted, fontWeight:700, fontSize:12, width:40 }}>{index + 1}</td>
    <td>
      <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, background:THEME.brandLight, color:THEME.brandDark, border:`1px solid #D4C4A0`, whiteSpace:"nowrap" }}>
        📅 {fmtDate(item.Date)}
      </span>
    </td>
    <td style={{ fontSize:12, fontWeight:600, color:THEME.text }}>{item.Client || "—"}</td>
    <td>
      {item.Project ? (
        <span style={{ padding:"2px 8px", borderRadius:20, fontSize:11, fontWeight:600, background:"#F0F5FF", color:"#2F54EB", border:"1px solid #ADC6FF" }}>
          {item.Project}
        </span>
      ) : "—"}
    </td>
    <td style={{ fontSize:12, color:"#595959", maxWidth:160 }}>{item.Item || "—"}</td>
    <td style={{ fontSize:12, color:"#595959" }}>{item.GivenTo || "—"}</td>
    <td style={{ fontSize:12, color:"#595959" }}>{item.GivenContact || "—"}</td>
    <td style={{ fontSize:12, fontWeight:600, color:THEME.text }}>{item.GivenBy || "—"}</td>
    <td>
      {item.Signature ? (
        <a
          href={getFileDisplayUrl(item.Signature, `${FileBaseUrl}/public`)}
          onClick={(e) => { e.preventDefault(); openFileInNewTab(item.Signature, `${FileBaseUrl}/public`); }}
          target="_blank"
          rel="noopener noreferrer"
          className="eol-view-btn"
        >
          👁 Sign
        </a>
      ) : <span style={{ color:THEME.textLight, fontSize:11 }}>—</span>}
    </td>
    <td>
      {item.Photo ? (
        <a
          href={getFileDisplayUrl(item.Photo, `${FileBaseUrl}/public`)}
          onClick={(e) => { e.preventDefault(); openFileInNewTab(item.Photo, `${FileBaseUrl}/public`); }}
          target="_blank"
          rel="noopener noreferrer"
          className="eol-view-btn"
        >
          📷 Photo
        </a>
      ) : <span style={{ color:THEME.textLight, fontSize:11 }}>—</span>}
    </td>
  </tr>
));

const COLS = [
  { key:"Date",         label:"Date"          },
  { key:"Client",       label:"Client"        },
  { key:"Project",      label:"Project"       },
  { key:"Item",         label:"Item"          },
  { key:"GivenTo",      label:"Given To"      },
  { key:"GivenContact", label:"Given Contact" },
  { key:"GivenBy",      label:"Given By"      },
  { key:"Signature",    label:"Signature"     },
  { key:"Photo",        label:"Photo"         },
];


// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const EmpOutwardList = () => {
  const navigate = useNavigate();
  const header   = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };

  const [custData, setCustData] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [search,   setSearch]   = useState("");
  const [sortCol,  setSortCol]  = useState("Date");
  const [sortDesc, setSortDesc] = useState(true);
  const [page,     setPage]     = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService(null, 0, header, fetchOutwardTeamList.method, fetchOutwardTeamList.url);
      if (!res.data.error && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setCustData(res.data.data.map((el) => ({
          id:          el.id,
          Date:        el.created_at,
          Client:      el.client_name,
          Project:     el.case_id,
          Item:        el.item,
          GivenTo:     el.received_from,
          GivenContact:el.received_contact,
          GivenBy:     el.collected,
          Signature:   el.signature,
          Photo:       el.photo,
        })));
      } else if (res.data.error) {
        toast.error(res.data.message);
      }
    } catch (e) { console.error(e); toast.error(e?.response?.data?.message || "An error occurred"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, []);

  const toggleSort = (col) => {
    if (sortCol === col) setSortDesc((d) => !d);
    else { setSortCol(col); setSortDesc(true); }
    setPage(0);
  };

  const processed = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = custData.filter((r) =>
      !q ||
      (r.Client || "").toLowerCase().includes(q) ||
      (r.Project || "").toLowerCase().includes(q) ||
      (r.Item || "").toLowerCase().includes(q) ||
      (r.GivenTo || "").toLowerCase().includes(q) ||
      (r.GivenContact || "").toLowerCase().includes(q) ||
      (r.GivenBy || "").toLowerCase().includes(q)
    );
    return [...filtered].sort((a, b) => {
      const av = sortCol === "Date" ? new Date(a[sortCol]) : String(a[sortCol] ?? "");
      const bv = sortCol === "Date" ? new Date(b[sortCol]) : String(b[sortCol] ?? "");
      return sortDesc ? (bv > av ? 1 : -1) : (av > bv ? 1 : -1);
    });
  }, [custData, search, sortCol, sortDesc]);

  const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE));
  const pageData   = processed.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const sortIcon   = (col) => sortCol === col ? (sortDesc ? " ↓" : " ↑") : "";

  return (
    <>
      <style>{CSS}</style>

      <div style={{ minHeight:"100vh", background:THEME.bg, fontFamily:"'DM Sans',sans-serif", padding:"28px 24px" }}>

        {/* ── Header ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:4, height:26, borderRadius:3, background:`linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
            <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:THEME.text, fontFamily:"'Sora',sans-serif", letterSpacing:"-0.3px" }}>
              Outward List
            </h1>
          </div>
          <button className="eol-add-btn" onClick={() => navigate(`/${OutwardRoute.add}`)}>
            + Add Outward
          </button>
        </div>

        {/* ── Stats bar ── */}
        {!loading && custData.length > 0 && (
          <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
            {[
              { label:"Total Records", value:custData.length,  color:THEME.brand },
              { label:"Filtered",      value:processed.length, color:"#2F54EB"   },
            ].map((s) => (
              <div key={s.label} style={{ background:"#fff", border:`1px solid ${THEME.border}`, borderRadius:10, padding:"10px 18px", borderTop:`3px solid ${s.color}`, boxShadow:"0 2px 8px rgba(136,117,73,0.06)", minWidth:130 }}>
                <p style={{ margin:0, fontSize:10, fontWeight:700, color:THEME.textMuted, textTransform:"uppercase", letterSpacing:"0.07em" }}>{s.label}</p>
                <p style={{ margin:"3px 0 0", fontSize:18, fontWeight:800, color:s.color, fontFamily:"'Sora',sans-serif" }}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Main card ── */}
        <div style={{ background:"#fff", border:`1px solid ${THEME.border}`, borderRadius:14, overflow:"hidden", boxShadow:"0 2px 12px rgba(136,117,73,0.07)" }}>

          {/* Search */}
          <div style={{ padding:"14px 20px", borderBottom:`1px solid ${THEME.border}`, background:"#FDFAF5", display:"flex", alignItems:"center" }}>
            <div style={{ position:"relative", flex:1, maxWidth:280 }}>
              <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", fontSize:14, color:THEME.textMuted }}>🔍</span>
              <input className="eol-search" type="search" placeholder="Search outwards…"
                value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
            </div>
          </div>

          {loading && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"80px 0", gap:16 }}>
              <div className="eol-spinner" />
              <p style={{ color:THEME.textLight, fontSize:13, margin:0 }}>Loading outward list…</p>
            </div>
          )}

          {!loading && processed.length === 0 && (
            <div style={{ textAlign:"center", padding:"64px 0" }}>
              <div style={{ fontSize:38, marginBottom:10 }}>📤</div>
              <p style={{ color:THEME.textLight, fontSize:14, margin:0 }}>No outward records found.</p>
            </div>
          )}

          {!loading && processed.length > 0 && (
            <div className="eol-fade" style={{ overflowX:"auto" }}>
              <table className="eol-table">
                <thead>
                  <tr>
                    <th style={{ width:40 }}>#</th>
                    {COLS.map((col) => (
                      <th key={col.key} onClick={() => toggleSort(col.key)}>
                        {col.label}{sortIcon(col.key)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((item, idx) => (
                    <OutwardRow
                      key={item.id}
                      item={item}
                      index={page * PAGE_SIZE + idx}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && totalPages > 1 && (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"flex-end", gap:8, padding:"12px 20px", borderTop:`1px solid ${THEME.border}` }}>
              <button className="eol-pg-btn" onClick={() => setPage(0)}             disabled={page === 0}>«</button>
              <button className="eol-pg-btn" onClick={() => setPage((p) => p - 1)} disabled={page === 0}>‹</button>
              <span style={{ fontSize:12, fontWeight:600, color:THEME.textMuted }}>{page + 1} of {totalPages}</span>
              <button className="eol-pg-btn" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1}>›</button>
              <button className="eol-pg-btn" onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}>»</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EmpOutwardList;