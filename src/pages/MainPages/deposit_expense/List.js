// ─────────────────────────────────────────────
//  DepositList.jsx  —  All Deposits
//  Same design system as InteriorList / PostList
// ─────────────────────────────────────────────

import React, { useEffect, useState, useMemo, useCallback, memo } from "react";
import { deleteDepositById, getDeposit } from "../../../config/config";
import ApiService from "../../../services/ApiService";
import { getToken } from "../../../services/useLocalStorage";
import { useNavigate } from "react-router-dom";
import { DepositExpenseRoute } from "../../../config/RouteConfig";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import toast from "react-hot-toast";


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
  * { box-sizing: border-box; }
  @keyframes dlFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .dl-fade { animation:dlFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes dlSpin { to{transform:rotate(360deg)} }
  .dl-spinner { width:28px;height:28px;border-radius:50%;border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};animation:dlSpin 0.8s linear infinite; }

  .dl-search {
    padding:9px 14px 9px 36px;border-radius:10px;
    border:1.5px solid #E0D5C5;font-size:13px;
    font-family:'DM Sans',sans-serif;color:#1A1A2E;
    outline:none;background:#fff;width:220px;
    transition:border-color 0.15s,box-shadow 0.15s;
  }
  .dl-search:focus { border-color:${THEME.brand};box-shadow:0 0 0 3px ${THEME.brand}18; }
  .dl-search::placeholder { color:${THEME.textLight}; }

  .dl-table { width:100%;border-collapse:collapse;font-family:'DM Sans',sans-serif; }
  .dl-table th {
    padding:10px 14px;font-size:11px;font-weight:700;color:${THEME.brandDark};
    text-transform:uppercase;letter-spacing:0.07em;
    background:${THEME.brandLight};border-bottom:2px solid #D4C4A0;white-space:nowrap;
    cursor:pointer;user-select:none;
  }
  .dl-table th:hover { background:#EDE5D5; }
  .dl-table td { padding:12px 14px;border-bottom:1px solid #F5EFE4;vertical-align:middle; }
  .dl-table tbody tr:nth-child(even) { background:${THEME.rowAlt}; }
  .dl-table tbody tr:hover { background:${THEME.rowHover}; }

  .dl-add-btn {
    padding:9px 20px;border-radius:10px;border:none;
    background:${THEME.brand};color:#fff;font-size:13px;font-weight:700;
    cursor:pointer;font-family:'Sora',sans-serif;transition:all 0.18s;
    box-shadow:0 2px 8px ${THEME.brand}44;display:inline-flex;align-items:center;gap:6px;
  }
  .dl-add-btn:hover { background:${THEME.brandDark}; }

  .dl-icon-btn {
    width:32px;height:32px;border-radius:8px;border:1.5px solid ${THEME.border};
    background:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;
    transition:all 0.15s;
  }
  .dl-icon-btn.edit:hover  { background:${THEME.brandLight};border-color:${THEME.brand}; }
  .dl-icon-btn.del:hover   { background:#FFF1F0;border-color:#FFA39E; }

  .dl-pg-btn {
    padding:5px 10px;border-radius:7px;border:1.5px solid ${THEME.border};
    background:#fff;cursor:pointer;font-size:12px;font-weight:600;color:#595959;
    font-family:'DM Sans',sans-serif;transition:all 0.15s;
  }
  .dl-pg-btn:hover:not(:disabled) { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand}; }
  .dl-pg-btn:disabled { opacity:0.35;cursor:not-allowed; }

  ::-webkit-scrollbar{width:5px;height:5px;}
  ::-webkit-scrollbar-track{background:${THEME.brandLight};}
  ::-webkit-scrollbar-thumb{background:${THEME.brandMid};border-radius:10px;}
`;

const PAGE_SIZE = 20;

// ─── Format date nicely ─────────────────────
function fmtDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
  } catch { return dateStr; }
}

// ─── Table row ───────────────────────────────
const DepositRow = memo(({ item, index, onEdit, onDelete }) => (
  <tr>
    <td style={{ color:THEME.textMuted, fontWeight:700, fontSize:12, width:40 }}>{index + 1}</td>
    <td>
      <span style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:600, background:THEME.brandLight, color:THEME.brandDark, border:`1px solid #D4C4A0` }}>
        📅 {fmtDate(item.Date)}
      </span>
    </td>
    <td>
      <span style={{ fontSize:14, fontWeight:800, color:THEME.brand, fontFamily:"'Sora',sans-serif" }}>
        ₹ {parseFloat(item.amount || 0).toLocaleString("en-IN")}
      </span>
    </td>
    <td style={{ maxWidth:240, fontSize:12, color:"#595959" }}>
      {item.Description || <span style={{ color:THEME.textLight }}>—</span>}
    </td>
    <td>
      <span style={{ fontSize:12, fontWeight:600, color:THEME.text }}>{item.Team || "—"}</span>
    </td>
    <td>
      <div style={{ display:"flex", gap:8 }}>
        <button className="dl-icon-btn edit" title="Edit" onClick={() => onEdit(item.id)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={THEME.brand} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button className="dl-icon-btn del" title="Delete" onClick={() => onDelete(item.id)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#CF1322" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </div>
    </td>
  </tr>
));


// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const DepositList = () => {
  const navigate = useNavigate();
  const header   = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };

  const [deposit,   setDeposit]   = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [search,    setSearch]    = useState("");
  const [sortCol,   setSortCol]   = useState("Date");
  const [sortDesc,  setSortDesc]  = useState(true);
  const [page,      setPage]      = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService(null, 0, header, getDeposit.method, getDeposit.url);
      if (!res.data.error && Array.isArray(res.data.data)) {
        const rows = res.data.data.map((el) => ({
          id:          el.id,
          Date:        el.date,
          amount:      el.amount,
          Description: el.description,
          Team:        el.team_fullname,
        }));
        setDeposit(rows.sort((a, b) => new Date(b.Date) - new Date(a.Date)));
      }
    } catch (e) { console.error(e); toast.error("Something went wrong"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, []);

  const onEdit = useCallback((id) => navigate(`/${DepositExpenseRoute.edit}/${id}`), [navigate]);

  const onDelete = useCallback((id) => {
    SwalAlert({}).then(async (result) => {
      if (!result?.isConfirmed) return;
      setLoading(true);
      try {
        const res = await ApiService(null, id, header, deleteDepositById.method, deleteDepositById.url);
        if (!res.data.error) {
          setDeposit((prev) => prev.filter((d) => parseInt(d.id) !== parseInt(id)));
          toast.success(res.data.message);
        } else { toast.error(res.data.message); }
      } catch (e) { toast.error(e?.response?.data?.message || "Something went wrong"); }
      finally { setLoading(false); }
    });
  }, []);

  // ── Sort & filter ─────────────────────────
  const toggleSort = (col) => {
    if (sortCol === col) setSortDesc((d) => !d);
    else { setSortCol(col); setSortDesc(true); }
    setPage(0);
  };

  const processed = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = deposit.filter((r) =>
      !q ||
      (r.Date || "").toLowerCase().includes(q) ||
      String(r.amount || "").includes(q) ||
      (r.Description || "").toLowerCase().includes(q) ||
      (r.Team || "").toLowerCase().includes(q)
    );
    return [...filtered].sort((a, b) => {
      const av = sortCol === "Date" ? new Date(a[sortCol]) : a[sortCol] ?? "";
      const bv = sortCol === "Date" ? new Date(b[sortCol]) : b[sortCol] ?? "";
      return sortDesc ? (bv > av ? 1 : -1) : (av > bv ? 1 : -1);
    });
  }, [deposit, search, sortCol, sortDesc]);

  const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE));
  const pageData   = processed.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const sortIcon = (col) => sortCol === col ? (sortDesc ? " ↓" : " ↑") : "";

  // ── Total amount ──────────────────────────
  const totalAmount = useMemo(() => processed.reduce((s, r) => s + parseFloat(r.amount || 0), 0), [processed]);

  return (
    <>
      <style>{CSS}</style>

      <div style={{ minHeight:"100vh", background:THEME.bg, fontFamily:"'DM Sans',sans-serif", padding:"28px 24px" }}>

        {/* ── Header ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:4, height:26, borderRadius:3, background:`linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
            <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:THEME.text, fontFamily:"'Sora',sans-serif", letterSpacing:"-0.3px" }}>
              All Deposits
            </h1>
          </div>
          <button className="dl-add-btn" onClick={() => navigate(`/${DepositExpenseRoute.add}`)}>
            + Add Deposit
          </button>
        </div>

        {/* ── Stats bar ── */}
        {!loading && deposit.length > 0 && (
          <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
            {[
              { label:"Total Records", value:deposit.length, color:THEME.brand },
              { label:"Filtered",      value:processed.length, color:"#2F54EB" },
              { label:"Total Amount",  value:`₹ ${totalAmount.toLocaleString("en-IN")}`, color:"#389E0D" },
            ].map((s) => (
              <div key={s.label} style={{ background:"#fff", border:`1px solid ${THEME.border}`, borderRadius:10, padding:"10px 18px", borderTop:`3px solid ${s.color}`, boxShadow:"0 2px 8px rgba(136,117,73,0.06)", minWidth:140 }}>
                <p style={{ margin:0, fontSize:10, fontWeight:700, color:THEME.textMuted, textTransform:"uppercase", letterSpacing:"0.07em" }}>{s.label}</p>
                <p style={{ margin:"3px 0 0", fontSize:18, fontWeight:800, color:s.color, fontFamily:"'Sora',sans-serif" }}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Main card ── */}
        <div style={{ background:"#fff", border:`1px solid ${THEME.border}`, borderRadius:14, overflow:"hidden", boxShadow:"0 2px 12px rgba(136,117,73,0.07)" }}>

          {/* Search bar */}
          <div style={{ padding:"14px 20px", borderBottom:`1px solid ${THEME.border}`, background:"#FDFAF5", display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ position:"relative", flex:1, maxWidth:280 }}>
              <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", fontSize:14, color:THEME.textMuted }}>🔍</span>
              <input className="dl-search" type="search" placeholder="Search deposits…"
                value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"80px 0", gap:16 }}>
              <div className="dl-spinner" />
              <p style={{ color:THEME.textLight, fontSize:13, margin:0 }}>Loading deposits…</p>
            </div>
          )}

          {/* Empty */}
          {!loading && processed.length === 0 && (
            <div style={{ textAlign:"center", padding:"64px 0" }}>
              <div style={{ fontSize:38, marginBottom:10 }}>💰</div>
              <p style={{ color:THEME.textLight, fontSize:14, margin:0 }}>No deposits found.</p>
            </div>
          )}

          {/* Table */}
          {!loading && processed.length > 0 && (
            <div className="dl-fade" style={{ overflowX:"auto" }}>
              <table className="dl-table">
                <thead>
                  <tr>
                    <th style={{ width:40 }}>#</th>
                    {[
                      { key:"Date",        label:"Date"        },
                      { key:"amount",      label:"Amount"      },
                      { key:"Description", label:"Description" },
                      { key:"Team",        label:"Team Member" },
                    ].map((col) => (
                      <th key={col.key} onClick={() => toggleSort(col.key)}>
                        {col.label}{sortIcon(col.key)}
                      </th>
                    ))}
                    <th style={{ textAlign:"center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((item, idx) => (
                    <DepositRow
                      key={item.id}
                      item={item}
                      index={page * PAGE_SIZE + idx}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"flex-end", gap:8, padding:"12px 20px", borderTop:`1px solid ${THEME.border}` }}>
              <button className="dl-pg-btn" onClick={() => setPage(0)}        disabled={page === 0}>«</button>
              <button className="dl-pg-btn" onClick={() => setPage((p) => p - 1)} disabled={page === 0}>‹</button>
              <span style={{ fontSize:12, fontWeight:600, color:THEME.textMuted }}>
                {page + 1} of {totalPages}
              </span>
              <button className="dl-pg-btn" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1}>›</button>
              <button className="dl-pg-btn" onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}>»</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DepositList;