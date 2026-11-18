// ─────────────────────────────────────────────
//  AdminFileExpenseList.jsx  —  All File Expenses
//  Same design system as DepositList / InteriorList
// ─────────────────────────────────────────────

import React, { useEffect, useState, useMemo, useCallback, memo, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getToken } from "../../../../services/useLocalStorage";
import ApiService from "../../../../services/ApiService";
import toast from "react-hot-toast";
import { SwalAlert } from "../../../../UtilsComponent/SwalDialog";
import {
  deleteFileExpenseForAdmin,
  getFileExpenseForAdmin,
  getFileExpenseOfAdminbyid,
  checkFileExpense,
} from "../../../../config/config";
import { FileExpenseRoute } from "../../../../config/RouteConfig";


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
  @keyframes felFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .fel-fade { animation:felFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes felSpin { to{transform:rotate(360deg)} }
  .fel-spinner { width:28px;height:28px;border-radius:50%;border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};animation:felSpin 0.8s linear infinite; }

  .fel-search {
    padding:9px 14px 9px 36px;border-radius:10px;
    border:1.5px solid #E0D5C5;font-size:13px;
    font-family:'DM Sans',sans-serif;color:#1A1A2E;
    outline:none;background:#fff;width:220px;
    transition:border-color 0.15s,box-shadow 0.15s;
  }
  .fel-search:focus { border-color:${THEME.brand};box-shadow:0 0 0 3px ${THEME.brand}18; }
  .fel-search::placeholder { color:${THEME.textLight}; }

  /* ── Filter controls ── */
  .fel-filter-select {
    padding:9px 32px 9px 12px;border-radius:10px;
    border:1.5px solid #E0D5C5;font-size:13px;
    font-family:'DM Sans',sans-serif;color:#1A1A2E;
    outline:none;background:#fff;
    appearance:none;-webkit-appearance:none;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23ADADAD' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat:no-repeat;background-position:right 10px center;
    cursor:pointer;transition:border-color 0.15s,box-shadow 0.15s;min-width:160px;max-width:200px;
  }
  .fel-filter-select:focus { border-color:${THEME.brand};box-shadow:0 0 0 3px ${THEME.brand}18; }

  .fel-date-input {
    padding:9px 12px;border-radius:10px;
    border:1.5px solid #E0D5C5;font-size:13px;
    font-family:'DM Sans',sans-serif;color:#1A1A2E;
    outline:none;background:#fff;
    transition:border-color 0.15s,box-shadow 0.15s;cursor:pointer;
  }
  .fel-date-input:focus { border-color:${THEME.brand};box-shadow:0 0 0 3px ${THEME.brand}18; }
  .fel-date-input::-webkit-calendar-picker-indicator { opacity:0.5;cursor:pointer; }

  .fel-filter-label {
    font-size:11px;font-weight:700;color:${THEME.brandDark};
    text-transform:uppercase;letter-spacing:0.07em;
    font-family:'DM Sans',sans-serif;white-space:nowrap;
  }

  .fel-clear-btn {
    padding:7px 14px;border-radius:8px;border:1.5px solid #E0D5C5;
    background:#fff;font-size:12px;font-weight:600;color:${THEME.textMuted};
    cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;
    display:inline-flex;align-items:center;gap:5px;white-space:nowrap;
  }
  .fel-clear-btn:hover { background:#FFF1F0;color:#CF1322;border-color:#FFA39E; }

  .fel-filter-row {
    display:flex;align-items:flex-end;gap:14px;flex-wrap:wrap;
    padding:12px 20px;border-bottom:1px solid ${THEME.border};background:#FDFAF5;
  }

  .fel-filter-group { display:flex;flex-direction:column;gap:5px; }

  .fel-active-chip {
    display:inline-flex;align-items:center;gap:5px;
    padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;
    background:${THEME.brandLight};color:${THEME.brandDark};border:1px solid #D4C4A0;
  }
  .fel-active-chip button {
    background:none;border:none;cursor:pointer;color:${THEME.brandDark};
    padding:0;font-size:13px;line-height:1;display:flex;align-items:center;
  }
  .fel-active-chip button:hover { color:#CF1322; }

  .fel-table { width:100%;border-collapse:collapse;font-family:'DM Sans',sans-serif; }
  .fel-table th {
    padding:10px 14px;font-size:11px;font-weight:700;color:${THEME.brandDark};
    text-transform:uppercase;letter-spacing:0.07em;
    background:${THEME.brandLight};border-bottom:2px solid #D4C4A0;white-space:nowrap;
    cursor:pointer;user-select:none;
  }
  .fel-table th:hover { background:#EDE5D5; }
  .fel-table td { padding:12px 14px;border-bottom:1px solid #F5EFE4;vertical-align:middle; }
  .fel-table tbody tr:nth-child(even) { background:${THEME.rowAlt}; }
  .fel-table tbody tr:hover { background:${THEME.rowHover}; }

  .fel-add-btn {
    padding:9px 20px;border-radius:10px;border:none;
    background:${THEME.brand};color:#fff;font-size:13px;font-weight:700;
    cursor:pointer;font-family:'Sora',sans-serif;transition:all 0.18s;
    box-shadow:0 2px 8px ${THEME.brand}44;display:inline-flex;align-items:center;gap:6px;
  }
  .fel-add-btn:hover { background:${THEME.brandDark}; }

  /* ── Print button ── */
  .fel-print-btn {
    padding:9px 20px;border-radius:10px;border:1.5px solid ${THEME.brand};
    background:#fff;color:${THEME.brand};font-size:13px;font-weight:700;
    cursor:pointer;font-family:'Sora',sans-serif;transition:all 0.18s;
    display:inline-flex;align-items:center;gap:6px;
  }
  .fel-print-btn:hover { background:${THEME.brandLight}; }

  .fel-icon-btn {
    width:30px;height:30px;border-radius:7px;border:1.5px solid ${THEME.border};
    background:#fff;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;
    transition:all 0.15s;text-decoration:none;
  }
  .fel-icon-btn.view:hover    { background:#F0F5FF;border-color:#ADC6FF; }
  .fel-icon-btn.edit:hover    { background:${THEME.brandLight};border-color:${THEME.brand}; }
  .fel-icon-btn.del:hover     { background:#FFF1F0;border-color:#FFA39E; }

  /* Action menu dropdown */
  .fel-menu-wrap { position:relative;display:inline-block; }
  .fel-menu-btn {
    width:32px;height:32px;border-radius:8px;cursor:pointer;
    background:transparent;border:1.5px solid ${THEME.border};
    display:flex;align-items:center;justify-content:center;
    font-size:18px;color:${THEME.textMuted};transition:all 0.15s;
  }
  .fel-menu-btn:hover { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand}; }
  .fel-dropdown {
    position:absolute;right:0;top:38px;z-index:200;
    background:#fff;border:1px solid ${THEME.border};border-radius:12px;
    box-shadow:0 8px 24px rgba(0,0,0,0.12);overflow:hidden;min-width:150px;
  }
  .fel-drop-item {
    display:block;width:100%;padding:10px 16px;font-size:13px;font-weight:600;
    border:none;background:transparent;cursor:pointer;text-align:left;
    color:${THEME.text};transition:background 0.15s;font-family:'DM Sans',sans-serif;text-decoration:none;
  }
  .fel-drop-item:hover { background:${THEME.brandLight};color:${THEME.brand}; }
  .fel-drop-item.danger:hover { background:#FFF1F0;color:#CF1322; }

  .fel-pg-btn {
    padding:5px 10px;border-radius:7px;border:1.5px solid ${THEME.border};
    background:#fff;cursor:pointer;font-size:12px;font-weight:600;color:#595959;
    font-family:'DM Sans',sans-serif;transition:all 0.15s;
  }
  .fel-pg-btn:hover:not(:disabled) { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand}; }
  .fel-pg-btn:disabled { opacity:0.35;cursor:not-allowed; }

  /* Inline status dropdown */
  .fel-status-wrap { position:relative;display:inline-block; }
  .fel-status-badge-btn {
    display:inline-flex;align-items:center;gap:5px;
    padding:3px 10px 3px 8px;border-radius:20px;font-size:11px;font-weight:600;
    border:1px solid;cursor:pointer;background:none;font-family:'DM Sans',sans-serif;
    transition:opacity 0.15s;white-space:nowrap;
  }
  .fel-status-badge-btn:hover { opacity:0.8; }
  .fel-status-menu {
    position:absolute;left:0;top:32px;z-index:300;
    background:#fff;border:1px solid ${THEME.border};border-radius:12px;
    box-shadow:0 8px 24px rgba(0,0,0,0.13);overflow:hidden;min-width:140px;
  }
  .fel-status-item {
    display:flex;align-items:center;gap:8px;width:100%;
    padding:9px 14px;font-size:12px;font-weight:600;
    border:none;background:transparent;cursor:pointer;text-align:left;
    color:${THEME.text};transition:background 0.13s;font-family:'DM Sans',sans-serif;
  }
  .fel-status-item:hover { background:${THEME.brandLight}; }
  .fel-status-item-dot { width:8px;height:8px;border-radius:50%;flex-shrink:0; }
  .fel-status-saving { opacity:0.55;pointer-events:none; }

  ::-webkit-scrollbar{width:5px;height:5px;}
  ::-webkit-scrollbar-track{background:${THEME.brandLight};}
  ::-webkit-scrollbar-thumb{background:${THEME.brandMid};border-radius:10px;}
`;

const PAGE_SIZE = 20;

// ─── Status config ────────────────────────────
const STATUS_CFG = {
  Approved: { bg:"#F6FFED", color:"#389E0D", border:"#B7EB8F", dot:"#389E0D", apiVal:"1" },
  Pending:  { bg:"#FFF7E6", color:"#D46B08", border:"#FFD591", dot:"#D46B08", apiVal:"0" },
  Rejected: { bg:"#FFF1F0", color:"#CF1322", border:"#FFA39E", dot:"#CF1322", apiVal:"2" },
};

// ─── Static badge (used inside dropdown trigger) ──────────
function StatusBadge({ value }) {
  const cfg = STATUS_CFG[value] || { bg:"#F5F5F5", color:"#8C8C8C", border:"#D9D9D9", dot:"#8C8C8C" };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}`, whiteSpace:"nowrap" }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:cfg.dot }} />
      {value}
    </span>
  );
}

// ─── Inline status dropdown ───────────────────
const StatusDropdown = memo(({ id, value, onStatusChange }) => {
  const [open,   setOpen]   = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const cfg = STATUS_CFG[value] || { bg:"#F5F5F5", color:"#8C8C8C", border:"#D9D9D9", dot:"#8C8C8C" };

  const handleSelect = async (label, apiVal) => {
    if (label === value) { setOpen(false); return; }
    setOpen(false);
    setSaving(true);
    await onStatusChange(id, apiVal, label);
    setSaving(false);
  };

  return (
    <div className="fel-status-wrap" ref={ref}>
      <button
        className={`fel-status-badge-btn${saving ? " fel-status-saving" : ""}`}
        style={{ background:cfg.bg, color:cfg.color, borderColor:cfg.border }}
        onClick={() => !saving && setOpen((o) => !o)}
        title="Click to change status"
      >
        <span style={{ width:5, height:5, borderRadius:"50%", background:cfg.dot }} />
        {saving ? "Saving…" : value}
        <span style={{ fontSize:9, marginLeft:2, opacity:0.6 }}>▾</span>
      </button>

      {open && (
        <div className="fel-status-menu">
          {Object.entries(STATUS_CFG).map(([label, c]) => (
            <button
              key={label}
              className="fel-status-item"
              onClick={() => handleSelect(label, c.apiVal)}
            >
              <span className="fel-status-item-dot" style={{ background:c.dot }} />
              {label}
              {label === value && <span style={{ marginLeft:"auto", fontSize:10, color:THEME.textMuted }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

// ─── Format date ─────────────────────────────
function fmtDate(dateStr) {
  if (!dateStr) return "—";
  try { return new Date(dateStr).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }); }
  catch { return dateStr; }
}

// ─── Normalize date string to YYYY-MM-DD for comparison ──────────────────────
function toYMD(dateStr) {
  if (!dateStr) return "";
  try { return new Date(dateStr).toISOString().slice(0, 10); }
  catch { return ""; }
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
    <div className="fel-menu-wrap" ref={ref}>
      <button className="fel-menu-btn" onClick={() => setOpen((o) => !o)}>⋮</button>
      {open && (
        <div className="fel-dropdown" onClick={() => setOpen(false)}>
          <Link className="fel-drop-item" to={`/${FileExpenseRoute.preview}/${id}`}>👁 Preview</Link>
          <Link className="fel-drop-item" to={`/${FileExpenseRoute.edit}/${id}`}>✏️ Edit</Link>
          <button className="fel-drop-item danger" onClick={() => onDelete(id)}>🗑 Delete</button>
        </div>
      )}
    </div>
  );
});

// ─── Table row ───────────────────────────────
const ExpenseRow = memo(({ item, index, onDelete, onStatusChange }) => (
  <tr>
    <td style={{ color:THEME.textMuted, fontWeight:700, fontSize:12, width:40 }}>{index + 1}</td>
    <td>
      <span style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, background:THEME.brandLight, color:THEME.brandDark, border:`1px solid #D4C4A0`, whiteSpace:"nowrap" }}>
        📅 {fmtDate(item.Date)}
      </span>
    </td>
    <td style={{ maxWidth:180 }}>
      <div style={{ fontSize:12, fontWeight:700, color:THEME.text }}>
        {item.File || <span style={{ color:THEME.textLight }}>—</span>}
      </div>
      {item.ClientName && (
        <div style={{ marginTop:4, fontSize:11, fontWeight:600, color:"#2F54EB", display:"inline-flex", alignItems:"center", gap:3 }}>
          👤 {item.ClientName}
        </div>
      )}
    </td>
    <td>
      <span style={{ fontSize:14, fontWeight:800, color:THEME.brand, fontFamily:"'Sora',sans-serif" }}>
        ₹ {parseFloat(item.Amount || 0).toLocaleString("en-IN")}
      </span>
    </td>
    <td style={{ maxWidth:200, fontSize:12, color:"#595959" }}>
      {item.Description || <span style={{ color:THEME.textLight }}>—</span>}
    </td>
    <td style={{ fontSize:12, fontWeight:600, color:THEME.text }}>{item.Team || "—"}</td>
    <td>
      <StatusDropdown id={item.id} value={item.Status} onStatusChange={onStatusChange} />
    </td>
    <td style={{ textAlign:"center" }}><ActionMenu id={item.id} onDelete={onDelete} /></td>
  </tr>
));


// ─────────────────────────────────────────────
//  🖨️  PRINT HELPER
// ─────────────────────────────────────────────
function buildPrintHTML({ rows, title, filters, totalAmount }) {
  const filtersText = [
    filters.client    && `Client: ${filters.client}`,
    filters.dateFrom  && `From: ${fmtDate(filters.dateFrom)}`,
    filters.dateTo    && `To: ${fmtDate(filters.dateTo)}`,
    filters.search    && `Search: "${filters.search}"`,
  ].filter(Boolean).join("  |  ");

  const statusColors = {
    Approved: { bg:"#F6FFED", color:"#389E0D", border:"#B7EB8F" },
    Pending:  { bg:"#FFF7E6", color:"#D46B08", border:"#FFD591" },
    Rejected: { bg:"#FFF1F0", color:"#CF1322", border:"#FFA39E" },
  };

  const rowsHTML = rows.map((item, idx) => {
    const sc = statusColors[item.Status] || { bg:"#f5f5f5", color:"#888", border:"#ddd" };
    return `
      <tr>
        <td class="num">${idx + 1}</td>
        <td>${fmtDate(item.Date)}</td>
        <td>
          <strong>${item.File || "—"}</strong>
          ${item.ClientName ? `<br/><span class="client">${item.ClientName}</span>` : ""}
        </td>
        <td class="amount">₹ ${parseFloat(item.Amount || 0).toLocaleString("en-IN")}</td>
        <td class="desc">${item.Description || "—"}</td>
        <td>${item.Team || "—"}</td>
        <td>
          <span class="status-badge" style="background:${sc.bg};color:${sc.color};border:1px solid ${sc.border}">
            ${item.Status}
          </span>
        </td>
      </tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'DM Sans', sans-serif;
      color: #1A1A2E;
      background: #fff;
      padding: 28px 32px;
      font-size: 12px;
    }

    /* ── Header ── */
    .print-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding-bottom: 16px;
      border-bottom: 3px solid #887549;
      margin-bottom: 16px;
    }
    .print-title {
      font-family: 'Sora', sans-serif;
      font-size: 22px;
      font-weight: 800;
      color: #1A1A2E;
      letter-spacing: -0.3px;
    }
    .print-subtitle {
      font-size: 11px;
      color: #ADADAD;
      margin-top: 3px;
    }
    .print-logo-area {
      text-align: right;
    }
    .print-logo-area .brand {
      font-family: 'Sora', sans-serif;
      font-size: 16px;
      font-weight: 800;
      color: #887549;
      letter-spacing: 1px;
    }
    .print-logo-area .date {
      font-size: 10px;
      color: #ADADAD;
      margin-top: 2px;
    }

    /* ── Filters / summary bar ── */
    .print-meta {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 14px;
      align-items: center;
    }
    .meta-chip {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 700;
      background: #F5F0E8;
      color: #5C4E32;
      border: 1px solid #D4C4A0;
    }
    .filters-line {
      font-size: 10px;
      color: #ADADAD;
      margin-bottom: 10px;
    }

    /* ── Stats row ── */
    .stats-row {
      display: flex;
      gap: 10px;
      margin-bottom: 18px;
      flex-wrap: wrap;
    }
    .stat-box {
      border: 1px solid #EDE5D5;
      border-radius: 8px;
      padding: 8px 14px;
      min-width: 110px;
      border-top: 3px solid #887549;
    }
    .stat-box .stat-label {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: #ADADAD;
    }
    .stat-box .stat-value {
      font-family: 'Sora', sans-serif;
      font-size: 16px;
      font-weight: 800;
      margin-top: 2px;
    }

    /* ── Table ── */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    thead tr {
      background: #F5F0E8;
    }
    th {
      padding: 9px 10px;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: #5C4E32;
      border-bottom: 2px solid #D4C4A0;
      text-align: left;
      white-space: nowrap;
    }
    td {
      padding: 9px 10px;
      border-bottom: 1px solid #F5EFE4;
      vertical-align: middle;
    }
    tbody tr:nth-child(even) { background: #FEFCF9; }

    td.num { color: #ADADAD; font-weight: 700; width: 30px; }
    td.amount { font-family: 'Sora', sans-serif; font-weight: 800; color: #887549; font-size: 12px; white-space: nowrap; }
    td.desc { color: #595959; max-width: 180px; }
    .client { color: #2F54EB; font-weight: 600; font-size: 10px; }

    .status-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 700;
      white-space: nowrap;
    }

    /* ── Total row ── */
    tfoot tr {
      background: #F5F0E8;
    }
    tfoot td {
      padding: 10px 10px;
      font-weight: 700;
      font-size: 12px;
      border-top: 2px solid #D4C4A0;
    }
    tfoot .total-label {
      font-family: 'Sora', sans-serif;
      font-weight: 800;
      color: #5C4E32;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-size: 10px;
    }
    tfoot .total-amount {
      font-family: 'Sora', sans-serif;
      font-weight: 800;
      color: #389E0D;
      font-size: 14px;
    }

    /* ── Footer ── */
    .print-footer {
      margin-top: 20px;
      padding-top: 12px;
      border-top: 1px solid #EDE5D5;
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: #BDBDBD;
    }

    @media print {
      body { padding: 12px 16px; }
      @page { margin: 10mm; size: A4 landscape; }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="print-header">
    <div>
      <div class="print-title">${title}</div>
      <div class="print-subtitle">Generated on ${new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" })} at ${new Date().toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" })}</div>
    </div>
    <div class="print-logo-area">
      <div class="brand">FILE EXPENSES</div>
      <div class="date">Printed: ${new Date().toLocaleDateString("en-IN")}</div>
    </div>
  </div>

  <!-- Active Filters -->
  ${filtersText ? `<div class="filters-line">Active Filters: ${filtersText}</div>` : ""}

  <!-- Stats -->
  <div class="stats-row">
    ${[
      { label:"Total Records", value: rows.length, color:"#887549" },
      { label:"Total Amount",  value:`₹ ${totalAmount.toLocaleString("en-IN")}`, color:"#389E0D" },
      { label:"Approved",      value: rows.filter(r=>r.Status==="Approved").length, color:"#389E0D" },
      { label:"Pending",       value: rows.filter(r=>r.Status==="Pending").length,  color:"#D46B08" },
      { label:"Rejected",      value: rows.filter(r=>r.Status==="Rejected").length, color:"#CF1322" },
    ].map(s => `
      <div class="stat-box" style="border-top-color:${s.color}">
        <div class="stat-label">${s.label}</div>
        <div class="stat-value" style="color:${s.color}">${s.value}</div>
      </div>
    `).join("")}
  </div>

  <!-- Table -->
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Date</th>
        <th>File / Client</th>
        <th>Amount</th>
        <th>Description</th>
        <th>Team</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHTML}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="3" class="total-label">Grand Total (${rows.length} records)</td>
        <td class="total-amount">₹ ${totalAmount.toLocaleString("en-IN")}</td>
        <td colspan="3"></td>
      </tr>
    </tfoot>
  </table>

  <!-- Footer -->
  <div class="print-footer">
    <span>File Expense Report &mdash; Confidential</span>
    <span>Total: ${rows.length} records &nbsp;|&nbsp; Amount: ₹ ${totalAmount.toLocaleString("en-IN")}</span>
  </div>

  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`;
}


// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const AdminFileExpenseList = () => {
  const navigate = useNavigate();
  const params   = useParams();
  const header   = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };

  const [expenses,   setExpenses]   = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [search,     setSearch]     = useState("");
  const [sortCol,    setSortCol]    = useState("Date");
  const [sortDesc,   setSortDesc]   = useState(true);
  const [page,       setPage]       = useState(0);

  // ── Filter state ─────────────────────────
  const [filterClient,    setFilterClient]    = useState("");
  const [filterDateFrom,  setFilterDateFrom]  = useState("");
  const [filterDateTo,    setFilterDateTo]    = useState("");

  const fetchExpense = useCallback(async () => {
    setLoading(true);
    try {
      const isFiltered = !!params?.id;
      const res = await ApiService(
        null,
        isFiltered ? params.id : 0,
        header,
        isFiltered ? getFileExpenseOfAdminbyid.method : getFileExpenseForAdmin.method,
        isFiltered ? getFileExpenseOfAdminbyid.url    : getFileExpenseForAdmin.url
      );
      if (!res.data.error && Array.isArray(res.data.data) && res.data.data.length > 0) {
        const rows = res.data.data.map((el) => ({
          id:          el.id,
          Date:        el.date,
          File:        el.file_name,
          ClientName:  el.client_name || "",
          Amount:      el.amount,
          Description: el.description,
          Team:        el.team_fullname,
          Status:      el.is_approved == 1 ? "Approved" : el.is_approved == 0 ? "Pending" : "Rejected",
        }));
        setExpenses(rows.sort((a, b) => new Date(b.Date) - new Date(a.Date)));
      }
    } catch (e) { console.error(e); toast.error(e?.response?.data?.message || "Something went wrong"); }
    finally { setLoading(false); }
  }, [params?.id]);

  useEffect(() => { fetchExpense(); }, []);

  const onDelete = useCallback((id) => {
    SwalAlert({}).then(async (result) => {
      if (!result?.isConfirmed || isNaN(parseInt(id))) return;
      setLoading(true);
      try {
        const res = await ApiService(null, parseInt(id), header, deleteFileExpenseForAdmin.method, deleteFileExpenseForAdmin.url);
        if (!res.data.error) {
          setExpenses((prev) => prev.filter((v) => v.id != id));
          toast.success(res.data.message);
        } else { toast.error(res.data.message); }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    });
  }, []);

  const onStatusChange = useCallback(async (id, apiVal, label) => {
    try {
      const res = await ApiService(
        { is_approved: apiVal, id: parseInt(id) },
        0,
        { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
        checkFileExpense.method,
        checkFileExpense.url
      );
      if (!res.data.error) {
        setExpenses((prev) =>
          prev.map((e) => e.id === id ? { ...e, Status: label } : e)
        );
        toast.success(res.data.message || `Status updated to ${label}`);
      } else {
        toast.error(res.data.message);
      }
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Failed to update status");
    }
  }, []);

  // ── Unique client names for the dropdown ──
  const clientNameOptions = useMemo(() => {
    const names = [...new Set(expenses.map((e) => e.ClientName).filter(Boolean))];
    return names.sort((a, b) => a.localeCompare(b));
  }, [expenses]);

  // ── Sort & filter ─────────────────────────
  const toggleSort = (col) => {
    if (sortCol === col) setSortDesc((d) => !d);
    else { setSortCol(col); setSortDesc(true); }
    setPage(0);
  };

  // ── Clear all filters ─────────────────────
  const hasActiveFilters = search || filterClient || filterDateFrom || filterDateTo;
  const clearAllFilters = () => {
    setSearch("");
    setFilterClient("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setPage(0);
  };

  const processed = useMemo(() => {
    const q = search.toLowerCase();

    const filtered = expenses.filter((r) => {
      const matchSearch = !q ||
        (r.Date || "").toLowerCase().includes(q) ||
        (r.File || "").toLowerCase().includes(q) ||
        (r.ClientName || "").toLowerCase().includes(q) ||
        String(r.Amount || "").includes(q) ||
        (r.Description || "").toLowerCase().includes(q) ||
        (r.Team || "").toLowerCase().includes(q) ||
        (r.Status || "").toLowerCase().includes(q);

      const matchClient = !filterClient || r.ClientName === filterClient;

      const rowDate = toYMD(r.Date);
      const matchFrom = !filterDateFrom || rowDate >= filterDateFrom;
      const matchTo   = !filterDateTo   || rowDate <= filterDateTo;

      return matchSearch && matchClient && matchFrom && matchTo;
    });

    return [...filtered].sort((a, b) => {
      const av = sortCol === "Date" ? new Date(a[sortCol]) : String(a[sortCol] ?? "");
      const bv = sortCol === "Date" ? new Date(b[sortCol]) : String(b[sortCol] ?? "");
      return sortDesc ? (bv > av ? 1 : -1) : (av > bv ? 1 : -1);
    });
  }, [expenses, search, filterClient, filterDateFrom, filterDateTo, sortCol, sortDesc]);

  const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE));
  const pageData   = processed.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const sortIcon   = (col) => sortCol === col ? (sortDesc ? " ↓" : " ↑") : "";

  const totalAmount = useMemo(() => processed.reduce((s, r) => s + parseFloat(r.Amount || 0), 0), [processed]);

  // ── 🖨️ Print handler ──────────────────────
  const handlePrint = useCallback(() => {
    const title = params?.id ? "File Expenses" : "All File Expenses";
    const html = buildPrintHTML({
      rows: processed,
      title,
      filters: {
        client:   filterClient,
        dateFrom: filterDateFrom,
        dateTo:   filterDateTo,
        search,
      },
      totalAmount,
    });
    const win = window.open("", "_blank", "width=1100,height=750");
    if (!win) { toast.error("Popup blocked — please allow popups for this site."); return; }
    win.document.write(html);
    win.document.close();
  }, [processed, filterClient, filterDateFrom, filterDateTo, search, totalAmount, params?.id]);

  return (
    <>
      <style>{CSS}</style>

      <div style={{ minHeight:"100vh", background:THEME.bg, fontFamily:"'DM Sans',sans-serif", padding:"28px 24px" }}>

        {/* ── Header ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:4, height:26, borderRadius:3, background:`linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
            <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:THEME.text, fontFamily:"'Sora',sans-serif", letterSpacing:"-0.3px" }}>
              {params?.id ? "File Expenses" : "All File Expenses"}
            </h1>
          </div>

          {/* ── Button group ── */}
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {/* Print button — only show when there's data */}
            {!loading && processed.length > 0 && (
              <button className="fel-print-btn" onClick={handlePrint} title="Print filtered expenses">
                🖨️ Print
              </button>
            )}
            <button className="fel-add-btn" onClick={() => navigate(`/${FileExpenseRoute.add}`)}>
              + Add Expense
            </button>
          </div>
        </div>

        {/* ── Stats bar ── */}
        {!loading && expenses.length > 0 && (
          <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
            {[
              { label:"Total Records",    value:expenses.length,           color:THEME.brand   },
              { label:"Filtered",         value:processed.length,          color:"#2F54EB"      },
              { label:"Total Amount",     value:`₹ ${totalAmount.toLocaleString("en-IN")}`, color:"#389E0D" },
              { label:"Approved",         value:expenses.filter((e) => e.Status === "Approved").length, color:"#389E0D" },
              { label:"Pending",          value:expenses.filter((e) => e.Status === "Pending").length,  color:"#D46B08" },
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

          {/* ── Search + Filters row ── */}
          <div className="fel-filter-row">

            {/* Keyword search */}
            <div className="fel-filter-group">
              <span className="fel-filter-label">Search</span>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", fontSize:14, color:THEME.textMuted }}>🔍</span>
                <input
                  className="fel-search"
                  type="search"
                  placeholder="Search expenses…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                />
              </div>
            </div>

            {/* Client Name dropdown */}
            <div className="fel-filter-group">
              <span className="fel-filter-label">👤 Client</span>
              <select
                className="fel-filter-select"
                value={filterClient}
                onChange={(e) => { setFilterClient(e.target.value); setPage(0); }}
              >
                <option value="">All Clients</option>
                {clientNameOptions.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div className="fel-filter-group">
              <span className="fel-filter-label">📅 From</span>
              <input
                className="fel-date-input"
                type="date"
                value={filterDateFrom}
                max={filterDateTo || undefined}
                onChange={(e) => { setFilterDateFrom(e.target.value); setPage(0); }}
              />
            </div>

            {/* Date To */}
            <div className="fel-filter-group">
              <span className="fel-filter-label">📅 To</span>
              <input
                className="fel-date-input"
                type="date"
                value={filterDateTo}
                min={filterDateFrom || undefined}
                onChange={(e) => { setFilterDateTo(e.target.value); setPage(0); }}
              />
            </div>

            {/* Clear button */}
            {hasActiveFilters && (
              <div className="fel-filter-group" style={{ justifyContent:"flex-end" }}>
                <span className="fel-filter-label" style={{ visibility:"hidden" }}>x</span>
                <button className="fel-clear-btn" onClick={clearAllFilters}>
                  ✕ Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* ── Active filter chips ── */}
          {(filterClient || filterDateFrom || filterDateTo) && (
            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", padding:"8px 20px", borderBottom:`1px solid ${THEME.border}`, background:"#FDFAF5" }}>
              <span style={{ fontSize:11, fontWeight:700, color:THEME.textMuted, textTransform:"uppercase", letterSpacing:"0.07em" }}>Active:</span>

              {filterClient && (
                <span className="fel-active-chip">
                  👤 {filterClient}
                  <button onClick={() => { setFilterClient(""); setPage(0); }}>×</button>
                </span>
              )}
              {filterDateFrom && (
                <span className="fel-active-chip">
                  From: {fmtDate(filterDateFrom)}
                  <button onClick={() => { setFilterDateFrom(""); setPage(0); }}>×</button>
                </span>
              )}
              {filterDateTo && (
                <span className="fel-active-chip">
                  To: {fmtDate(filterDateTo)}
                  <button onClick={() => { setFilterDateTo(""); setPage(0); }}>×</button>
                </span>
              )}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"80px 0", gap:16 }}>
              <div className="fel-spinner" />
              <p style={{ color:THEME.textLight, fontSize:13, margin:0 }}>Loading expenses…</p>
            </div>
          )}

          {/* Empty */}
          {!loading && processed.length === 0 && (
            <div style={{ textAlign:"center", padding:"64px 0" }}>
              <div style={{ fontSize:38, marginBottom:10 }}>🧾</div>
              <p style={{ color:THEME.textLight, fontSize:14, margin:0 }}>No expenses found.</p>
              {hasActiveFilters && (
                <button className="fel-clear-btn" style={{ marginTop:12 }} onClick={clearAllFilters}>
                  ✕ Clear Filters
                </button>
              )}
            </div>
          )}

          {/* Table */}
          {!loading && processed.length > 0 && (
            <div className="fel-fade" style={{ overflowX:"auto" }}>
              <table className="fel-table">
                <thead>
                  <tr>
                    <th style={{ width:40 }}>#</th>
                    {[
                      { key:"Date",        label:"Date"        },
                      { key:"File",        label:"File"        },
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
                      onStatusChange={onStatusChange}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"flex-end", gap:8, padding:"12px 20px", borderTop:`1px solid ${THEME.border}` }}>
              <button className="fel-pg-btn" onClick={() => setPage(0)}             disabled={page === 0}>«</button>
              <button className="fel-pg-btn" onClick={() => setPage((p) => p - 1)} disabled={page === 0}>‹</button>
              <span style={{ fontSize:12, fontWeight:600, color:THEME.textMuted }}>{page + 1} of {totalPages}</span>
              <button className="fel-pg-btn" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1}>›</button>
              <button className="fel-pg-btn" onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}>»</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminFileExpenseList;