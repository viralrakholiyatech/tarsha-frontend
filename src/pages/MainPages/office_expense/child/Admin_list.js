// ─────────────────────────────────────────────
//  AdminOfficeExpenseList.jsx  —  All Office Expenses
//  Same design as AdminFileExpenseList
// ─────────────────────────────────────────────

import React, { useEffect, useState, useMemo, useCallback, memo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getToken } from "../../../../services/useLocalStorage";
import toast from "react-hot-toast";
import { SwalAlert } from "../../../../UtilsComponent/SwalDialog";
import ApiService from "../../../../services/ApiService";
import { deleteOfficeExpenseForAdmin, getOfficeExpenseForAdmin } from "../../../../config/config";
import { OfficeExpenseRoute } from "../../../../config/RouteConfig";


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
  @keyframes oelFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .oel-fade { animation:oelFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes oelSpin { to{transform:rotate(360deg)} }
  .oel-spinner { width:28px;height:28px;border-radius:50%;border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};animation:oelSpin 0.8s linear infinite; }

  .oel-search {
    padding:9px 14px 9px 36px;border-radius:10px;border:1.5px solid #E0D5C5;font-size:13px;
    font-family:'DM Sans',sans-serif;color:#1A1A2E;outline:none;background:#fff;width:220px;
    transition:border-color 0.15s,box-shadow 0.15s;
  }
  .oel-search:focus { border-color:${THEME.brand};box-shadow:0 0 0 3px ${THEME.brand}18; }
  .oel-search::placeholder { color:${THEME.textLight}; }

  .oel-table { width:100%;border-collapse:collapse;font-family:'DM Sans',sans-serif; }
  .oel-table th {
    padding:10px 14px;font-size:11px;font-weight:700;color:${THEME.brandDark};
    text-transform:uppercase;letter-spacing:0.07em;background:${THEME.brandLight};
    border-bottom:2px solid #D4C4A0;white-space:nowrap;cursor:pointer;user-select:none;
  }
  .oel-table th:hover { background:#EDE5D5; }
  .oel-table td { padding:12px 14px;border-bottom:1px solid #F5EFE4;vertical-align:middle; }
  .oel-table tbody tr:nth-child(even) { background:${THEME.rowAlt}; }
  .oel-table tbody tr:hover { background:${THEME.rowHover}; }

  .oel-add-btn {
    padding:9px 20px;border-radius:10px;border:none;background:${THEME.brand};color:#fff;
    font-size:13px;font-weight:700;cursor:pointer;font-family:'Sora',sans-serif;transition:all 0.18s;
    box-shadow:0 2px 8px ${THEME.brand}44;display:inline-flex;align-items:center;gap:6px;
  }
  .oel-add-btn:hover { background:${THEME.brandDark}; }

  .oel-menu-wrap { position:relative;display:inline-block; }
  .oel-menu-btn {
    width:32px;height:32px;border-radius:8px;cursor:pointer;background:transparent;
    border:1.5px solid ${THEME.border};display:flex;align-items:center;justify-content:center;
    font-size:18px;color:${THEME.textMuted};transition:all 0.15s;
  }
  .oel-menu-btn:hover { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand}; }
  .oel-dropdown {
    position:absolute;right:0;top:38px;z-index:200;background:#fff;
    border:1px solid ${THEME.border};border-radius:12px;
    box-shadow:0 8px 24px rgba(0,0,0,0.12);overflow:hidden;min-width:150px;
  }
  .oel-drop-item {
    display:block;width:100%;padding:10px 16px;font-size:13px;font-weight:600;
    border:none;background:transparent;cursor:pointer;text-align:left;
    color:${THEME.text};transition:background 0.15s;font-family:'DM Sans',sans-serif;text-decoration:none;
  }
  .oel-drop-item:hover { background:${THEME.brandLight};color:${THEME.brand}; }
  .oel-drop-item.danger:hover { background:#FFF1F0;color:#CF1322; }

  .oel-pg-btn {
    padding:5px 10px;border-radius:7px;border:1.5px solid ${THEME.border};
    background:#fff;cursor:pointer;font-size:12px;font-weight:600;color:#595959;
    font-family:'DM Sans',sans-serif;transition:all 0.15s;
  }
  .oel-pg-btn:hover:not(:disabled) { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand}; }
  .oel-pg-btn:disabled { opacity:0.35;cursor:not-allowed; }

  ::-webkit-scrollbar{width:5px;height:5px;}
  ::-webkit-scrollbar-track{background:${THEME.brandLight};}
  ::-webkit-scrollbar-thumb{background:${THEME.brandMid};border-radius:10px;}
`;

const PAGE_SIZE = 20;

// ─── Status badge ────────────────────────────
function StatusBadge({ value }) {
  const cfg = {
    Approved: { bg:"#F6FFED", color:"#389E0D", border:"#B7EB8F" },
    Pending:  { bg:"#FFF7E6", color:"#D46B08", border:"#FFD591" },
    Rejected: { bg:"#FFF1F0", color:"#CF1322", border:"#FFA39E" },
  }[value] || { bg:"#F5F5F5", color:"#8C8C8C", border:"#D9D9D9" };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}`, whiteSpace:"nowrap" }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:cfg.color }} />
      {value}
    </span>
  );
}

function fmtDate(d) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }); }
  catch { return d; }
}

// ─── Action dropdown ─────────────────────────
const ActionMenu = memo(({ id, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <div className="oel-menu-wrap" ref={ref}>
      <button className="oel-menu-btn" onClick={() => setOpen((o) => !o)}>⋮</button>
      {open && (
        <div className="oel-dropdown" onClick={() => setOpen(false)}>
          <Link className="oel-drop-item" to={`/${OfficeExpenseRoute.preview}/${id}`}>👁 Preview</Link>
          <Link className="oel-drop-item" to={`/${OfficeExpenseRoute.edit}/${id}`}>✏️ Edit</Link>
          <button className="oel-drop-item danger" onClick={() => onDelete(id)}>🗑 Delete</button>
        </div>
      )}
    </div>
  );
});

// ─── Table row ───────────────────────────────
const ExpenseRow = memo(({ item, index, onDelete }) => (
  <tr>
    <td style={{ color:THEME.textMuted, fontWeight:700, fontSize:12, width:40 }}>{index + 1}</td>
    <td>
      <span style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, background:THEME.brandLight, color:THEME.brandDark, border:`1px solid #D4C4A0`, whiteSpace:"nowrap" }}>
        📅 {fmtDate(item.Date)}
      </span>
    </td>
    <td>
      <span style={{ fontSize:14, fontWeight:800, color:THEME.brand, fontFamily:"'Sora',sans-serif" }}>
        ₹ {parseFloat(item.Amount || 0).toLocaleString("en-IN")}
      </span>
    </td>
    <td style={{ maxWidth:220, fontSize:12, color:"#595959" }}>
      {item.Description || <span style={{ color:THEME.textLight }}>—</span>}
    </td>
    <td style={{ fontSize:12, fontWeight:600, color:THEME.text }}>{item.Team || "—"}</td>
    <td><StatusBadge value={item.Status} /></td>
    <td style={{ textAlign:"center" }}><ActionMenu id={item.id} onDelete={onDelete} /></td>
  </tr>
));


// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const AdminOfficeExpenseList = () => {
  const navigate = useNavigate();
  const header   = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };

  const [expenses, setExpenses] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [search,   setSearch]   = useState("");
  const [sortCol,  setSortCol]  = useState("Date");
  const [sortDesc, setSortDesc] = useState(true);
  const [page,     setPage]     = useState(0);

  const fetchExpense = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService(null, 0, header, getOfficeExpenseForAdmin.method, getOfficeExpenseForAdmin.url);
      if (!res.data.error && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setExpenses(res.data.data.map((el) => ({
          id:          el.id,
          Date:        el.date,
          Amount:      el.amount,
          Description: el.description,
          Team:        el.team_fullname,
          Status:      el.is_approved == 1 ? "Approved" : el.is_approved == 0 ? "Pending" : "Rejected",
        })));
      }
    } catch (e) { console.error(e); toast.error(e?.response?.data?.message || "Something went wrong"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchExpense(); }, []);

  const onDelete = useCallback((id) => {
    SwalAlert({}).then(async (result) => {
      if (!result?.isConfirmed || isNaN(parseInt(id))) return;
      setLoading(true);
      try {
        const res = await ApiService(null, parseInt(id), header, deleteOfficeExpenseForAdmin.method, deleteOfficeExpenseForAdmin.url);
        if (!res.data.error) {
          setExpenses((prev) => prev.filter((v) => v.id != id));
          toast.success(res.data.message);
        } else { toast.error(res.data.message); }
      } catch (e) { console.error(e); }
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
    const filtered = expenses.filter((r) =>
      !q ||
      (r.Date || "").toLowerCase().includes(q) ||
      String(r.Amount || "").includes(q) ||
      (r.Description || "").toLowerCase().includes(q) ||
      (r.Team || "").toLowerCase().includes(q) ||
      (r.Status || "").toLowerCase().includes(q)
    );
    return [...filtered].sort((a, b) => {
      const av = sortCol === "Date" ? new Date(a[sortCol]) : String(a[sortCol] ?? "");
      const bv = sortCol === "Date" ? new Date(b[sortCol]) : String(b[sortCol] ?? "");
      return sortDesc ? (bv > av ? 1 : -1) : (av > bv ? 1 : -1);
    });
  }, [expenses, search, sortCol, sortDesc]);

  const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE));
  const pageData   = processed.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const sortIcon   = (col) => sortCol === col ? (sortDesc ? " ↓" : " ↑") : "";
  const totalAmt   = useMemo(() => processed.reduce((s, r) => s + parseFloat(r.Amount || 0), 0), [processed]);

  return (
    <>
      <style>{CSS}</style>

      <div style={{ minHeight:"100vh", background:THEME.bg, fontFamily:"'DM Sans',sans-serif", padding:"28px 24px" }}>

        {/* ── Header ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:4, height:26, borderRadius:3, background:`linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
            <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:THEME.text, fontFamily:"'Sora',sans-serif", letterSpacing:"-0.3px" }}>
              All Office Expenses
            </h1>
          </div>
          <button className="oel-add-btn" onClick={() => navigate(`/${OfficeExpenseRoute.add}`)}>
            + Add Expense
          </button>
        </div>

        {/* ── Stats bar ── */}
        {!loading && expenses.length > 0 && (
          <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
            {[
              { label:"Total Records", value:expenses.length,  color:THEME.brand  },
              { label:"Filtered",      value:processed.length, color:"#2F54EB"    },
              { label:"Total Amount",  value:`₹ ${totalAmt.toLocaleString("en-IN")}`, color:"#389E0D" },
              { label:"Approved",      value:expenses.filter((e) => e.Status === "Approved").length, color:"#389E0D" },
              { label:"Pending",       value:expenses.filter((e) => e.Status === "Pending").length,  color:"#D46B08" },
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
              <input className="oel-search" type="search" placeholder="Search expenses…"
                value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
            </div>
          </div>

          {loading && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"80px 0", gap:16 }}>
              <div className="oel-spinner" />
              <p style={{ color:THEME.textLight, fontSize:13, margin:0 }}>Loading expenses…</p>
            </div>
          )}

          {!loading && processed.length === 0 && (
            <div style={{ textAlign:"center", padding:"64px 0" }}>
              <div style={{ fontSize:38, marginBottom:10 }}>🏢</div>
              <p style={{ color:THEME.textLight, fontSize:14, margin:0 }}>No office expenses found.</p>
            </div>
          )}

          {!loading && processed.length > 0 && (
            <div className="oel-fade" style={{ overflowX:"auto", minHeight:"400px" }}>
              <table className="oel-table">
                <thead>
                  <tr>
                    <th style={{ width:40 }}>#</th>
                    {[
                      { key:"Date",        label:"Date"        },
                      { key:"Amount",      label:"Amount"      },
                      { key:"Description", label:"Description" },
                      { key:"Team",        label:"Team"        },
                      { key:"Status",      label:"Status"      },
                    ].map((col) => (
                      <th key={col.key} onClick={() => toggleSort(col.key)}>
                        {col.label}{sortIcon(col.key)}
                      </th>
                    ))}
                    <th style={{ textAlign:"center" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((item, idx) => (
                    <ExpenseRow
                      key={item.id}
                      item={item}
                      index={page * PAGE_SIZE + idx}
                      onDelete={onDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && totalPages > 1 && (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"flex-end", gap:8, padding:"12px 20px", borderTop:`1px solid ${THEME.border}` }}>
              <button className="oel-pg-btn" onClick={() => setPage(0)}             disabled={page === 0}>«</button>
              <button className="oel-pg-btn" onClick={() => setPage((p) => p - 1)} disabled={page === 0}>‹</button>
              <span style={{ fontSize:12, fontWeight:600, color:THEME.textMuted }}>{page + 1} of {totalPages}</span>
              <button className="oel-pg-btn" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1}>›</button>
              <button className="oel-pg-btn" onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}>»</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminOfficeExpenseList;