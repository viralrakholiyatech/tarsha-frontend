// ─────────────────────────────────────────────
//  PaymentList.jsx  —  Payment List Page
// ─────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PaymentRoute } from "../../../../config/RouteConfig";
import { getToken,getUserId,isAdmin  } from "../../../../services/useLocalStorage";
import { getPaymentExpenses, deletePaymentExpenses } from "../../../../config/config";
import ApiService from "../../../../services/ApiService";
import toast from "react-hot-toast";
import { openFileInNewTab } from "../../../../services/S3Service";
import { FileUrl } from "../../../../config/file_url";

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
  text:       "#1A1A2E",
  textMuted:  "#ADADAD",
  textLight:  "#BDBDBD",
  error:      "#CF1322",
  errorBg:    "#FFF1F0",
  success:    "#389E0D",
  successBg:  "#F6FFED",
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }

  @keyframes elFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes elSpin   { to{transform:rotate(360deg)} }
  @keyframes elRowIn  { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }
  @keyframes elPulse  { 0%,100%{opacity:1} 50%{opacity:.4} }

  .el-fade { animation:elFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  .el-row  { animation:elRowIn  0.22s cubic-bezier(0.4,0,0.2,1) both; }

  .el-input {
    padding:9px 13px;border-radius:10px;
    border:1.5px solid #E0D5C5;font-size:13px;
    font-family:'DM Sans',sans-serif;color:#1A1A2E;
    outline:none;background:#fff;
    transition:border-color 0.15s,box-shadow 0.15s;
  }
  .el-input:focus { border-color:#887549;box-shadow:0 0 0 3px #88754918; }
  .el-input::placeholder { color:#BDBDBD; }

  .el-tr:hover td { background:#FDFAF5 !important; }
  .el-tr { cursor:default; transition:background 0.12s; }

  .el-icon-btn {
    width:30px;height:30px;border-radius:8px;border:none;
    display:inline-flex;align-items:center;justify-content:center;
    cursor:pointer;font-size:14px;transition:all 0.15s;
  }

  ::-webkit-scrollbar{height:5px;width:5px;}
  ::-webkit-scrollbar-track{background:#F5F0E8;}
  ::-webkit-scrollbar-thumb{background:#C4A97D;border-radius:10px;}

  .el-skeleton { animation:elPulse 1.4s ease-in-out infinite; background:#EDE5D5; border-radius:6px; }

  .mode-badge {
    display:inline-flex;align-items:center;gap:4px;
    padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;
    text-transform:uppercase;letter-spacing:0.06em;
    font-family:'DM Sans',sans-serif;
  }
`;

const PAGE_SIZES = [10, 25, 50];

// ─────────────────────────────────────────────
//  🧩  ATOMS
// ─────────────────────────────────────────────

function PrimaryBtn({ children, onClick, disabled }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding:"9px 20px", borderRadius:10, border:"none", background:disabled ? "#C4C4C4" : hov ? THEME.brandDark : THEME.brand, color:"#fff", fontSize:13, fontWeight:700, cursor:disabled ? "not-allowed" : "pointer", fontFamily:"'Sora',sans-serif", transition:"all 0.18s", boxShadow:disabled ? "none" : `0 2px 8px ${THEME.brand}44`, display:"inline-flex", alignItems:"center", gap:6 }}
    >
      {children}
    </button>
  );
}

function Spinner({ size = 18 }) {
  return (
    <span style={{ width:size, height:size, borderRadius:"50%", border:`2px solid ${THEME.brandLight}`, borderTopColor:THEME.brand, display:"inline-block", animation:"elSpin 0.7s linear infinite" }} />
  );
}

function EmptyState() {
  return (
    <div style={{ padding:"56px 0", textAlign:"center" }}>
      <div style={{ fontSize:44, marginBottom:12 }}>💳</div>
      <p style={{ margin:0, fontSize:14, fontWeight:600, color:THEME.text, fontFamily:"'Sora',sans-serif" }}>No payments found</p>
      <p style={{ margin:"4px 0 0", fontSize:12, color:THEME.textMuted, fontFamily:"'DM Sans',sans-serif" }}>Try adjusting your search or filters</p>
    </div>
  );
}

function SkeletonRow({ cols }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding:"14px 16px" }}>
          <div className="el-skeleton" style={{ height:14, width: i === 0 ? 80 : i === cols - 1 ? 60 : "70%" }} />
        </td>
      ))}
    </tr>
  );
}

function ModeBadge({ mode }) {
  const isBank = mode?.toLowerCase() === "bank";
  return (
    <span
      className="mode-badge"
      style={{
        background: isBank ? "#E6F4FF" : "#F6FFED",
        color:      isBank ? "#0958D9" : "#389E0D",
        border:     `1px solid ${isBank ? "#91CAFF" : "#B7EB8F"}`,
      }}
    >
      {isBank ? "🏦" : "💵"} {isBank ? "Bank" : "Cash"}
    </span>
  );
}

function ConfirmModal({ open, onConfirm, onCancel, loading }) {
  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.35)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"#fff", borderRadius:16, padding:"28px 32px", width:360, boxShadow:"0 20px 60px rgba(0,0,0,0.18)", fontFamily:"'DM Sans',sans-serif" }}>
        <div style={{ fontSize:32, textAlign:"center", marginBottom:12 }}>🗑️</div>
        <h3 style={{ margin:"0 0 8px", textAlign:"center", fontSize:16, fontWeight:700, color:THEME.text, fontFamily:"'Sora',sans-serif" }}>
          Delete Payment?
        </h3>
        <p style={{ margin:"0 0 22px", textAlign:"center", fontSize:13, color:THEME.textMuted }}>
          This action cannot be undone.
        </p>
        <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
          <button
            onClick={onCancel}
            style={{ padding:"9px 22px", borderRadius:10, border:`1.5px solid #E0D5C5`, background:"#fff", color:"#595959", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm} disabled={loading}
            style={{ padding:"9px 22px", borderRadius:10, border:"none", background:loading ? "#ccc" : THEME.error, color:"#fff", fontSize:13, fontWeight:700, cursor:loading ? "not-allowed" : "pointer", fontFamily:"'Sora',sans-serif", display:"inline-flex", alignItems:"center", gap:6 }}
          >
            {loading ? <><Spinner size={14} /> Deleting…</> : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const PaymentList = () => {
  const navigate = useNavigate();

  const [entries,  setEntries]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Filters
  const [search,     setSearch]     = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo,   setFilterTo]   = useState("");
  const [filterMode, setFilterMode] = useState(""); // '' | 'cash' | 'bank'

  // Pagination
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(10);


    const userId = getUserId(); // already imported
const isAdminUser = isAdmin(); 

const toLocalDate = (d) => {
  const dt = new Date(d);
  const year  = dt.getFullYear();
  const month = String(dt.getMonth() + 1).padStart(2, "0");
  const day   = String(dt.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const todayStr = toLocalDate(new Date());

  // ── Fetch ───────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const h = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService(null, 0, h, getPaymentExpenses.method, getPaymentExpenses.url);
      if (!res.data.error && Array.isArray(res.data.data)) setEntries(res.data.data);
      else toast.error(res.data.message || "Failed to load payments");
    } catch (e) {
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Delete ──────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const h = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService({ id: deleteId }, 0, h, deletePaymentExpenses.method, deletePaymentExpenses.url);
      if (!res.data.error) {
        toast.success(res.data.message || "Payment deleted");
        setDeleteId(null);
        load();
      } else {
        toast.error(res.data.message);
      }
    } catch (e) {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

   const filtered = entries.filter((e) => {
  if (String(userId) === "290") {
    const entryDate = e.created_at ? toLocalDate(new Date(e.created_at)) : null;
    if (entryDate !== todayStr) return false;
  }

  const q = search.toLowerCase();
  const matchSearch =
    !q ||
    e.project_name?.toLowerCase().includes(q) ||
    e.client_name?.toLowerCase().includes(q) ||
    e.via_employee_name?.toLowerCase().includes(q) ||
    e.remarks?.toLowerCase().includes(q);
  const matchFrom = !filterFrom || new Date(e.date) >= new Date(filterFrom);
  const matchTo   = !filterTo   || new Date(e.date) <= new Date(filterTo);
  const matchMode = !filterMode || e.mode === filterMode;
  return matchSearch && matchFrom && matchTo && matchMode;
});

  // ── Filter + Search ─────────────────────────
  // const filtered = entries.filter((e) => {
  //   const q = search.toLowerCase();
  //   const matchSearch =
  //     !q ||
  //     e.project_name?.toLowerCase().includes(q) ||
  //     e.client_name?.toLowerCase().includes(q) ||
  //     e.via_employee_name?.toLowerCase().includes(q) ||
  //     e.remarks?.toLowerCase().includes(q);
  //   const matchFrom = !filterFrom || new Date(e.date) >= new Date(filterFrom);
  //   const matchTo   = !filterTo   || new Date(e.date) <= new Date(filterTo);
  //   const matchMode = !filterMode || e.mode?.toLowerCase() === filterMode;
  //   return matchSearch && matchFrom && matchTo && matchMode;
  // });

  const totalAmount = filtered.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  const cashAmount  = filtered.filter((e) => e.mode?.toLowerCase() === "cash").reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  const bankAmount  = filtered.filter((e) => e.mode?.toLowerCase() === "bank").reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);
  const resetPage  = () => setPage(1);

  const fmtDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
  };
  const fmtAmt = (v) => {
    const n = parseFloat(v);
    return isNaN(n) ? "—" : `₹${n.toLocaleString("en-IN", { minimumFractionDigits:2 })}`;
  };

  const COL_COUNT = 8; // #, Date, Project, Client, Via Employee, Mode, Amount, Actions

  const hasFilters = search || filterFrom || filterTo || filterMode;

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <ConfirmModal open={!!deleteId} loading={deleting} onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />

      <div style={{ minHeight:"100vh", background:THEME.bg, fontFamily:"'DM Sans',sans-serif", padding:"28px 24px" }}>

        {/* ── Header ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:12 }} className="el-fade">
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:4, height:26, borderRadius:3, background:`linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
            <div>
              <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:THEME.text, fontFamily:"'Sora',sans-serif", letterSpacing:"-0.3px" }}>
                Payments
              </h1>
              <p style={{ margin:0, fontSize:12, color:THEME.textMuted, marginTop:2 }}>
                {loading ? "Loading…" : `${filtered.length} record${filtered.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
          <PrimaryBtn onClick={() => navigate(`/${PaymentRoute.addexpense}`)}>+ Add Payment Expense</PrimaryBtn>
        </div>

        {/* ── Summary Cards ── */}
        {isAdminUser && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }} className="el-fade">
          {[
            { label:"Total Payments", value: loading ? "—" : filtered.length,   icon:"📋", color:THEME.brand   },
            { label:"Cash Amount",    value: loading ? "—" : fmtAmt(cashAmount), icon:"💵", color:"#389E0D"    },
            { label:"Bank Amount",    value: loading ? "—" : fmtAmt(bankAmount), icon:"🏦", color:"#0958D9"    },
          ].map((s) => (
            <div key={s.label} style={{ background:"#fff", border:`1px solid ${THEME.border}`, borderRadius:14, padding:"16px 20px", boxShadow:"0 2px 10px rgba(136,117,73,0.06)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                <span style={{ fontSize:18 }}>{s.icon}</span>
                <span style={{ fontSize:11, fontWeight:700, color:THEME.textMuted, textTransform:"uppercase", letterSpacing:"0.07em" }}>{s.label}</span>
              </div>
              <div style={{ fontSize:22, fontWeight:800, color:s.color, fontFamily:"'Sora',sans-serif" }}>{s.value}</div>
            </div>
          ))}
        </div>
        )}

        {/* ── Filters ── */}
        <div style={{ background:"#fff", border:`1px solid ${THEME.border}`, borderRadius:14, padding:"16px 20px", marginBottom:16, boxShadow:"0 2px 10px rgba(136,117,73,0.06)" }} className="el-fade">
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:12, alignItems:"end" }}>

            {/* Search */}
            <div>
              <label style={{ display:"block", marginBottom:5, fontSize:11, fontWeight:700, color:THEME.textMuted, textTransform:"uppercase", letterSpacing:"0.07em" }}>Search</label>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", fontSize:14, color:THEME.textMuted }}>🔍</span>
                <input
                  className="el-input"
                  style={{ paddingLeft:32, width:"100%" }}
                  placeholder="Project, client, employee, remarks…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); resetPage(); }}
                />
              </div>
            </div>

            {/* From Date */}
            <div>
              <label style={{ display:"block", marginBottom:5, fontSize:11, fontWeight:700, color:THEME.textMuted, textTransform:"uppercase", letterSpacing:"0.07em" }}>From Date</label>
              <input type="date" className="el-input" style={{ width:"100%" }} value={filterFrom} onChange={(e) => { setFilterFrom(e.target.value); resetPage(); }} />
            </div>

            {/* To Date */}
            <div>
              <label style={{ display:"block", marginBottom:5, fontSize:11, fontWeight:700, color:THEME.textMuted, textTransform:"uppercase", letterSpacing:"0.07em" }}>To Date</label>
              <input type="date" className="el-input" style={{ width:"100%" }} value={filterTo} onChange={(e) => { setFilterTo(e.target.value); resetPage(); }} />
            </div>

            {/* Mode Filter */}
            <div>
              <label style={{ display:"block", marginBottom:5, fontSize:11, fontWeight:700, color:THEME.textMuted, textTransform:"uppercase", letterSpacing:"0.07em" }}>Mode</label>
              <select
                className="el-input"
                style={{ width:"100%" }}
                value={filterMode}
                onChange={(e) => { setFilterMode(e.target.value); resetPage(); }}
              >
                <option value="">All</option>
                <option value="cash">💵 Cash</option>
                <option value="bank">🏦 Bank</option>
              </select>
            </div>
          </div>

          {hasFilters && (
            <div style={{ marginTop:10, display:"flex", justifyContent:"flex-end" }}>
              <button
                onClick={() => { setSearch(""); setFilterFrom(""); setFilterTo(""); setFilterMode(""); resetPage(); }}
                style={{ fontSize:12, color:THEME.brand, background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}
              >
                ✕ Clear filters
              </button>
            </div>
          )}
        </div>

        {/* ── Table ── */}
        <div style={{ background:"#fff", border:`1px solid ${THEME.border}`, borderRadius:14, overflow:"hidden", boxShadow:"0 2px 10px rgba(136,117,73,0.06)" }} className="el-fade">
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:"'DM Sans',sans-serif" }}>
              <thead>
                <tr style={{ background:THEME.brandLight, borderBottom:`1px solid ${THEME.border}` }}>
                  {["#","Date","Project","Client","Via Employee","Mode","Amount","Actions"].map((h) => (
                    <th key={h} style={{ padding:"11px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:THEME.brand, textTransform:"uppercase", letterSpacing:"0.07em", whiteSpace:"nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={COL_COUNT} />)
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={COL_COUNT}><EmptyState /></td></tr>
                ) : (
                  paginated.map((entry, idx) => (
                    <tr key={entry.id} className="el-tr el-row" style={{ borderBottom:`1px solid ${THEME.border}`, animationDelay:`${idx * 0.03}s` }}>
                      <td style={{ padding:"13px 16px", fontSize:12, color:THEME.textMuted, fontWeight:600, whiteSpace:"nowrap" }}>
                        {(page - 1) * pageSize + idx + 1}
                      </td>
                      <td style={{ padding:"13px 16px", fontSize:13, color:THEME.text, whiteSpace:"nowrap" }}>
                        {fmtDate(entry.date)}
                      </td>
                      <td style={{ padding:"13px 16px", fontSize:13, color:THEME.text, maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {entry.project_name || "—"}
                      </td>
                      <td style={{ padding:"13px 16px", fontSize:13, color:THEME.text, whiteSpace:"nowrap" }}>
                        {entry.client_name || "—"}
                      </td>
                      <td style={{ padding:"13px 16px", fontSize:13, color:THEME.text, whiteSpace:"nowrap" }}>
                        {entry.via_employee_name || "—"}
                      </td>
                      <td style={{ padding:"13px 16px", whiteSpace:"nowrap" }}>
                        <ModeBadge mode={entry.mode} />
                      </td>
                      <td style={{ padding:"13px 16px", fontSize:13, fontWeight:700, color:THEME.brandDark, whiteSpace:"nowrap" }}>
                        {fmtAmt(entry.amount)}
                      </td>
                      <td style={{ padding:"13px 16px" }}>
                        <div style={{ display:"flex", gap:6 }}>
                          {entry.receipt_image && (
                            <button
                              className="el-icon-btn" title="View Receipt"
                              onClick={() => openFileInNewTab(entry.receipt_image, FileUrl)}
                              style={{ background:"#E6F4FF", color:"#0958D9" }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = "#0958D9"; e.currentTarget.style.color = "#fff"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = "#E6F4FF"; e.currentTarget.style.color = "#0958D9"; }}
                            >
                              📎
                            </button>
                          )}
                          <button
                            className="el-icon-btn" title="Edit"
                            onClick={() => navigate(`/${PaymentRoute.editexpense}/${entry.id}`)}
                            style={{ background:THEME.brandLight, color:THEME.brand }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = THEME.brand; e.currentTarget.style.color = "#fff"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = THEME.brandLight; e.currentTarget.style.color = THEME.brand; }}
                          >
                            ✏️
                          </button>
                          <button
                            className="el-icon-btn" title="Delete"
                            onClick={() => setDeleteId(entry.id)}
                            style={{ background:"#FFF1F0", color:THEME.error }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = THEME.error; e.currentTarget.style.color = "#fff"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "#FFF1F0"; e.currentTarget.style.color = THEME.error; }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          {!loading && filtered.length > 0 && (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 20px", borderTop:`1px solid ${THEME.border}`, flexWrap:"wrap", gap:10 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:12, color:THEME.textMuted }}>Rows per page:</span>
                <select
                  className="el-input"
                  style={{ width:70, padding:"5px 8px", fontSize:12 }}
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); resetPage(); }}
                >
                  {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <span style={{ fontSize:12, color:THEME.textMuted }}>
                  {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
                </span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <PaginationBtn label="«" onClick={() => setPage(1)}              disabled={page === 1} />
                <PaginationBtn label="‹" onClick={() => setPage((p) => p - 1)}  disabled={page === 1} />
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                  const n = start + i;
                  return n <= totalPages ? (
                    <PaginationBtn key={n} label={n} onClick={() => setPage(n)} active={page === n} />
                  ) : null;
                })}
                <PaginationBtn label="›" onClick={() => setPage((p) => p + 1)}  disabled={page === totalPages} />
                <PaginationBtn label="»" onClick={() => setPage(totalPages)}     disabled={page === totalPages} />
              </div>
            </div>
          )}
        </div>

      </div>
    </>
  );
};

function PaginationBtn({ label, onClick, disabled, active }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ minWidth:32, height:32, borderRadius:8, border:`1.5px solid ${active ? THEME.brand : hov ? THEME.brandMid : "#E0D5C5"}`, background:active ? THEME.brand : hov ? THEME.brandLight : "#fff", color:active ? "#fff" : disabled ? THEME.textLight : THEME.text, fontSize:13, fontWeight:600, cursor:disabled ? "not-allowed" : "pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s", display:"inline-flex", alignItems:"center", justifyContent:"center" }}
    >
      {label}
    </button>
  );
}

export default PaymentList;