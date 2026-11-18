// ─────────────────────────────────────────────
//  PaymentList.jsx  —  Payment List Page
// ─────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PaymentRoute } from "../../../config/RouteConfig";
import { getToken } from "../../../services/useLocalStorage";
import { getPayments, deletePayment } from "../../../config/config";
import ApiService from "../../../services/ApiService";
import toast from "react-hot-toast";


// ─────────────────────────────────────────────
//  🎨  THEME
// ─────────────────────────────────────────────
const THEME = {
  brand:       "#887549",
  brandLight:  "#F5F0E8",
  brandMid:    "#C4A97D",
  brandDark:   "#5C4E32",
  bg:          "#F8F5F0",
  border:      "#EDE5D5",
  text:        "#1A1A2E",
  textMuted:   "#ADADAD",
  textLight:   "#BDBDBD",
  error:       "#CF1322",
  errorBg:     "#FFF1F0",
  success:     "#389E0D",
  successBg:   "#F6FFED",
  successBdr:  "#B7EB8F",
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }

  @keyframes elFadeIn  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes elSpin    { to{transform:rotate(360deg)} }
  @keyframes elRowIn   { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }
  @keyframes elPulse   { 0%,100%{opacity:1} 50%{opacity:.4} }

  .el-fade  { animation:elFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  .el-row   { animation:elRowIn  0.22s cubic-bezier(0.4,0,0.2,1) both; }

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

  .el-badge {
    display:inline-flex;align-items:center;gap:4px;
    padding:3px 9px;border-radius:20px;font-size:11px;font-weight:700;
    font-family:'DM Sans',sans-serif;letter-spacing:0.02em;
  }

  .el-icon-btn {
    width:30px;height:30px;border-radius:8px;border:none;
    display:inline-flex;align-items:center;justify-content:center;
    cursor:pointer;font-size:14px;transition:all 0.15s;
  }

  ::-webkit-scrollbar{height:5px;width:5px;}
  ::-webkit-scrollbar-track{background:#F5F0E8;}
  ::-webkit-scrollbar-thumb{background:#C4A97D;border-radius:10px;}

  .el-skeleton { animation:elPulse 1.4s ease-in-out infinite; background:#EDE5D5; border-radius:6px; }
`;

// Dynamic badge colors — generates a consistent color per category name
function getCategoryColor(categoryName) {
  if (!categoryName) return { bg:"#F5F0E8", color:"#887549", border:"#C4A97D", dot:"#887549" };
  const presets = [
    { bg:"#F6FFED", color:"#389E0D", border:"#B7EB8F", dot:"#52C41A" },
    { bg:"#FFF1F0", color:"#CF1322", border:"#FFA39E", dot:"#FF4D4F" },
    { bg:"#E6F7FF", color:"#0958D9", border:"#91CAFF", dot:"#1677FF" },
    { bg:"#FFF7E6", color:"#D46B08", border:"#FFD591", dot:"#FA8C16" },
    { bg:"#F9F0FF", color:"#531DAB", border:"#D3ADF7", dot:"#722ED1" },
    { bg:"#E6FFFB", color:"#08979C", border:"#87E8DE", dot:"#13C2C2" },
    { bg:"#FFF0F6", color:"#C41D7F", border:"#FFADD2", dot:"#EB2F96" },
  ];
  // deterministic index from string
  const idx = categoryName.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % presets.length;
  return presets[idx];
}

const PAGE_SIZES = [10, 25, 50];


// ─────────────────────────────────────────────
//  🧩  ATOMS
// ─────────────────────────────────────────────

function CategoryBadge({ category }) {
  const c = getCategoryColor(category);
  return (
    <span className="el-badge" style={{ background:c.bg, color:c.color, border:`1px solid ${c.border}` }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:c.dot, display:"inline-block" }} />
      {category ? category.charAt(0).toUpperCase() + category.slice(1) : "—"}
    </span>
  );
}

function PrimaryBtn({ children, onClick, disabled }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ padding:"9px 20px", borderRadius:10, border:"none", background:disabled ? "#C4C4C4" : hov ? THEME.brandDark : THEME.brand, color:"#fff", fontSize:13, fontWeight:700, cursor:disabled?"not-allowed":"pointer", fontFamily:"'Sora',sans-serif", transition:"all 0.18s", boxShadow:disabled?"none":`0 2px 8px ${THEME.brand}44`, display:"inline-flex", alignItems:"center", gap:6 }}>
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
      <div style={{ fontSize:44, marginBottom:12 }}>📂</div>
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
          <div className="el-skeleton" style={{ height:14, width: i === 0 ? 80 : i === cols-1 ? 60 : "70%" }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Confirm Delete Modal ────────────────────
function ConfirmModal({ open, onConfirm, onCancel, loading }) {
  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.35)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"#fff", borderRadius:16, padding:"28px 32px", width:360, boxShadow:"0 20px 60px rgba(0,0,0,0.18)", fontFamily:"'DM Sans',sans-serif" }}>
        <div style={{ fontSize:32, textAlign:"center", marginBottom:12 }}>🗑️</div>
        <h3 style={{ margin:"0 0 8px", textAlign:"center", fontSize:16, fontWeight:700, color:THEME.text, fontFamily:"'Sora',sans-serif" }}>Delete Payment?</h3>
        <p style={{ margin:"0 0 22px", textAlign:"center", fontSize:13, color:THEME.textMuted }}>This action cannot be undone.</p>
        <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
          <button onClick={onCancel} style={{ padding:"9px 22px", borderRadius:10, border:`1.5px solid #E0D5C5`, background:"#fff", color:"#595959", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} style={{ padding:"9px 22px", borderRadius:10, border:"none", background:loading?"#ccc":THEME.error, color:"#fff", fontSize:13, fontWeight:700, cursor:loading?"not-allowed":"pointer", fontFamily:"'Sora',sans-serif", display:"inline-flex", alignItems:"center", gap:6 }}>
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

  const [entries,    setEntries]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [deleting,   setDeleting]   = useState(false);
  const [deleteId,   setDeleteId]   = useState(null);

  // Filters
  const [search,     setSearch]     = useState("");
  const [filterCat,  setFilterCat]  = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo,   setFilterTo]   = useState("");

  // Pagination
  const [page,      setPage]      = useState(1);
  const [pageSize,  setPageSize]  = useState(10);

  // ── Fetch ───────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const h = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService(null, 0, h, getPayments.method, getPayments.url);
      if (!res.data.error && Array.isArray(res.data.data)) setEntries(res.data.data);
      else toast.error(res.data.message || "Failed to load payments");
    } catch (e) { toast.error("Failed to load payments"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Delete ──────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const h = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService({ id: deleteId }, 0, h, deletePayment.method, deletePayment.url);
      if (!res.data.error) {
        toast.success(res.data.message || "Payment deleted");
        setDeleteId(null);
        load();
      } else { toast.error(res.data.message); }
    } catch (e) { toast.error("Delete failed"); }
    finally { setDeleting(false); }
  };

  // ── Unique categories from data (dynamic) ───
  const categoryOptions = [...new Set(entries.map(e => e.category_name).filter(Boolean))].sort();

  // ── Filter + Search ─────────────────────────
  const filtered = entries.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      e.name?.toLowerCase().includes(q) ||
      e.mobile_no?.toString().includes(q) ||
      e.remarks?.toLowerCase().includes(q) ||
      e.category_name?.toLowerCase().includes(q);
    const matchCat  = !filterCat  || e.category_name === filterCat;
    const matchFrom = !filterFrom || new Date(e.date) >= new Date(filterFrom);
    const matchTo   = !filterTo   || new Date(e.date) <= new Date(filterTo);
    return matchSearch && matchCat && matchFrom && matchTo;
  });

  // Totals
  const totalAmount = filtered.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

  // ── Pagination ───────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);

  const resetPage = () => setPage(1);

  // ── Format helpers ───────────────────────────
  const fmtDate = (d) => {
    if (!d) return "—";
    const dt = new Date(d);
    return dt.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
  };
  const fmtAmt = (v) => {
    const n = parseFloat(v);
    return isNaN(n) ? "—" : `₹${n.toLocaleString("en-IN", { minimumFractionDigits:2 })}`;
  };

  const COL_COUNT = 7; // #, date, category, name, mobile, amount, actions

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <ConfirmModal open={!!deleteId} loading={deleting} onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />

      <div style={{ minHeight:"100vh", background:THEME.bg, fontFamily:"'DM Sans',sans-serif", padding:"28px 24px" }}>

        {/* ── Page Header ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:12 }} className="el-fade">
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:4, height:26, borderRadius:3, background:`linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
            <div>
              <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:THEME.text, fontFamily:"'Sora',sans-serif", letterSpacing:"-0.3px" }}>
                Payment List
              </h1>
              <p style={{ margin:0, fontSize:12, color:THEME.textMuted, marginTop:2 }}>
                {loading ? "Loading…" : `${filtered.length} record${filtered.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
          <PrimaryBtn onClick={() => navigate(`/${PaymentRoute.add}`)}>+ Add Payment</PrimaryBtn>
        </div>

        {/* ── Summary Cards ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }} className="el-fade">
          {[
            { label:"Total Payments", value: loading ? "—" : filtered.length,     icon:"📋", color:THEME.brand },
            { label:"Total Amount",   value: loading ? "—" : fmtAmt(totalAmount), icon:"💰", color:"#389E0D" },
            { label:"Categories",     value: loading ? "—" : [...new Set(filtered.map(e=>e.category_name).filter(Boolean))].length, icon:"🏷️", color:"#0958D9" },
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
                  placeholder="Name, mobile, category, remarks…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); resetPage(); }}
                />
              </div>
            </div>

            {/* Category — dynamic from data */}
            <div>
              <label style={{ display:"block", marginBottom:5, fontSize:11, fontWeight:700, color:THEME.textMuted, textTransform:"uppercase", letterSpacing:"0.07em" }}>Category</label>
              <select
                className="el-input" style={{ width:"100%", cursor:"pointer" }}
                value={filterCat}
                onChange={(e) => { setFilterCat(e.target.value); resetPage(); }}
              >
                <option value="">All categories</option>
                {categoryOptions.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
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
          </div>

          {/* Clear filters */}
          {(search || filterCat || filterFrom || filterTo) && (
            <div style={{ marginTop:10, display:"flex", justifyContent:"flex-end" }}>
              <button
                onClick={() => { setSearch(""); setFilterCat(""); setFilterFrom(""); setFilterTo(""); resetPage(); }}
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
                  {["#", "Date", "Category", "Name", "Mobile No.", "Amount", "Remarks", "Actions"].map((h) => (
                    <th key={h} style={{ padding:"11px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:THEME.brand, textTransform:"uppercase", letterSpacing:"0.07em", whiteSpace:"nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={COL_COUNT + 1} />)
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={COL_COUNT + 1}><EmptyState /></td></tr>
                ) : (
                  paginated.map((entry, idx) => (
                    <tr
                      key={entry.id}
                      className="el-tr el-row"
                      style={{ borderBottom:`1px solid ${THEME.border}`, animationDelay:`${idx * 0.03}s` }}
                    >
                      {/* # */}
                      <td style={{ padding:"13px 16px", fontSize:12, color:THEME.textMuted, fontWeight:600, whiteSpace:"nowrap" }}>
                        {(page - 1) * pageSize + idx + 1}
                      </td>

                      {/* Date */}
                      <td style={{ padding:"13px 16px", fontSize:13, color:THEME.text, whiteSpace:"nowrap" }}>
                        {fmtDate(entry.date)}
                      </td>

                      {/* Category — uses category_name from API */}
                      <td style={{ padding:"13px 16px" }}>
                        <CategoryBadge category={entry.category_name} />
                      </td>

                      {/* Name — uses name from API */}
                      <td style={{ padding:"13px 16px", fontSize:13, color:THEME.text, maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {entry.name || "—"}
                      </td>

                      {/* Mobile */}
                      <td style={{ padding:"13px 16px", fontSize:13, color:THEME.text, whiteSpace:"nowrap", fontFamily:"monospace", letterSpacing:"0.04em" }}>
                        {entry.mobile_no || "—"}
                      </td>

                      {/* Amount */}
                      <td style={{ padding:"13px 16px", fontSize:13, fontWeight:700, color:THEME.brandDark, whiteSpace:"nowrap" }}>
                        {fmtAmt(entry.amount)}
                      </td>

                      {/* Remarks */}
                      <td style={{ padding:"13px 16px", fontSize:12, color:THEME.textMuted, maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {entry.remarks || <span style={{ color:THEME.textLight }}>—</span>}
                      </td>

                      {/* Actions */}
                      <td style={{ padding:"13px 16px" }}>
                        <div style={{ display:"flex", gap:6 }}>
                          <button
                            className="el-icon-btn"
                            title="Edit"
                            onClick={() => navigate(`/${PaymentRoute.edit}/${entry.id}`)}
                            style={{ background:THEME.brandLight, color:THEME.brand }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = THEME.brand; e.currentTarget.style.color = "#fff"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = THEME.brandLight; e.currentTarget.style.color = THEME.brand; }}
                          >
                            ✏️
                          </button>
                          <button
                            className="el-icon-btn"
                            title="Delete"
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

              {/* Page size + info */}
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:12, color:THEME.textMuted }}>Rows per page:</span>
                <select
                  className="el-input"
                  style={{ width:70, padding:"5px 8px", fontSize:12 }}
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); resetPage(); }}
                >
                  {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span style={{ fontSize:12, color:THEME.textMuted }}>
                  {(page-1)*pageSize+1}–{Math.min(page*pageSize, filtered.length)} of {filtered.length}
                </span>
              </div>

              {/* Page buttons */}
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <PaginationBtn label="«" onClick={() => setPage(1)}      disabled={page === 1} />
                <PaginationBtn label="‹" onClick={() => setPage(p=>p-1)} disabled={page === 1} />

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                  const n = start + i;
                  return n <= totalPages ? (
                    <PaginationBtn key={n} label={n} onClick={() => setPage(n)} active={page === n} />
                  ) : null;
                })}

                <PaginationBtn label="›" onClick={() => setPage(p=>p+1)} disabled={page === totalPages} />
                <PaginationBtn label="»" onClick={() => setPage(totalPages)} disabled={page === totalPages} />
              </div>
            </div>
          )}
        </div>

      </div>
    </>
  );
};

// ─── Pagination Button ───────────────────────
function PaginationBtn({ label, onClick, disabled, active }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        minWidth:32, height:32, borderRadius:8, border:`1.5px solid ${active ? THEME.brand : hov ? THEME.brandMid : "#E0D5C5"}`,
        background: active ? THEME.brand : hov ? THEME.brandLight : "#fff",
        color: active ? "#fff" : disabled ? THEME.textLight : THEME.text,
        fontSize:13, fontWeight:600, cursor:disabled?"not-allowed":"pointer",
        fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s",
        display:"inline-flex", alignItems:"center", justifyContent:"center",
      }}
    >
      {label}
    </button>
  );
}

export default PaymentList;