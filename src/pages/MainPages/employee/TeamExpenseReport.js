import React, { useEffect, useState, useCallback, useMemo, memo, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import ApiService from "../../../services/ApiService";
import {
  deleteFileExpenseForAdmin, getDepositExpenseByTeamId,
  getDepositExpenseByTeamIdForPdf, checkFileExpense,
} from "../../../config/config";
import { GetDate } from "../../../services/DateAndTimeService";
import {
  DepositExpenseRoute, FileExpenseRoute, OfficeExpenseRoute,
} from "../../../config/RouteConfig";
import { getToken, superAccess } from "../../../services/useLocalStorage";
import { adminKey, subadmin } from "../../../config/RoleConfig";
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
  * { box-sizing:border-box; }
  @keyframes terFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .ter-fade { animation:terFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes terSpin { to{transform:rotate(360deg)} }
  .ter-spinner {
    width:28px;height:28px;border-radius:50%;
    border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};
    animation:terSpin 0.8s linear infinite;
  }

  .ter-date {
    padding:9px 13px;border-radius:10px;border:1.5px solid #E0D5C5;font-size:13px;
    font-family:'DM Sans',sans-serif;color:#1A1A2E;outline:none;background:#fff;
    transition:border-color 0.15s,box-shadow 0.15s;
  }
  .ter-date:focus { border-color:${THEME.brand};box-shadow:0 0 0 3px ${THEME.brand}18; }

  .ter-btn-primary {
    padding:9px 18px;border-radius:10px;border:none;background:${THEME.brand};color:#fff;
    font-size:13px;font-weight:700;cursor:pointer;font-family:'Sora',sans-serif;
    transition:all 0.18s;display:inline-flex;align-items:center;gap:6px;
  }
  .ter-btn-primary:hover    { background:${THEME.brandDark}; }
  .ter-btn-primary:disabled { background:#C4C4C4;cursor:not-allowed; }

  .ter-btn-outline {
    padding:9px 18px;border-radius:10px;border:1.5px solid ${THEME.border};
    background:#fff;color:#595959;font-size:13px;font-weight:600;cursor:pointer;
    font-family:'DM Sans',sans-serif;transition:all 0.18s;display:inline-flex;align-items:center;gap:6px;
  }
  .ter-btn-outline:hover { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand}; }

  .ter-status-select {
    padding:5px 10px;border-radius:8px;border:1.5px solid #E0D5C5;font-size:12px;
    font-family:'DM Sans',sans-serif;color:#1A1A2E;outline:none;background:#fff;
    cursor:pointer;transition:border-color 0.15s;
  }
  .ter-status-select:focus { border-color:${THEME.brand}; }

  .ter-table { width:100%;border-collapse:collapse;font-family:'DM Sans',sans-serif; }
  .ter-table th {
    padding:10px 14px;font-size:11px;font-weight:700;color:${THEME.brandDark};
    text-transform:uppercase;letter-spacing:0.07em;
    background:${THEME.brandLight};border-bottom:2px solid #D4C4A0;white-space:nowrap;
    cursor:pointer;user-select:none;
  }
  .ter-table th:hover { background:#EDE5D5; }
  .ter-table td { padding:12px 14px;border-bottom:1px solid #F5EFE4;vertical-align:middle; }
  .ter-table tbody tr:nth-child(even) { background:${THEME.rowAlt}; }
  .ter-table tbody tr:hover { background:${THEME.rowHover}; }

  .ter-menu-wrap { position:relative;display:inline-block; }
  .ter-menu-btn {
    width:30px;height:30px;border-radius:7px;cursor:pointer;
    background:transparent;border:1.5px solid ${THEME.border};
    display:flex;align-items:center;justify-content:center;
    font-size:16px;color:${THEME.textMuted};transition:all 0.15s;
  }
  .ter-menu-btn:hover { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand}; }
  .ter-dropdown {
    position:absolute;right:0;top:36px;z-index:300;background:#fff;
    border:1px solid ${THEME.border};border-radius:12px;
    box-shadow:0 8px 24px rgba(0,0,0,0.12);overflow:hidden;min-width:150px;
  }
  .ter-drop-item {
    display:block;width:100%;padding:9px 15px;font-size:12px;font-weight:600;
    border:none;background:transparent;cursor:pointer;text-align:left;
    color:${THEME.text};transition:background 0.15s;font-family:'DM Sans',sans-serif;text-decoration:none;
  }
  .ter-drop-item:hover        { background:${THEME.brandLight};color:${THEME.brand}; }
  .ter-drop-item.danger:hover { background:#FFF1F0;color:#CF1322; }

  .ter-pg-btn {
    padding:5px 10px;border-radius:7px;border:1.5px solid ${THEME.border};
    background:#fff;cursor:pointer;font-size:12px;font-weight:600;color:#595959;
    font-family:'DM Sans',sans-serif;transition:all 0.15s;
  }
  .ter-pg-btn:hover:not(:disabled) { background:${THEME.brandLight};color:${THEME.brand};border-color:${THEME.brand}; }
  .ter-pg-btn:disabled { opacity:0.35;cursor:not-allowed; }

  ::-webkit-scrollbar { width:5px;height:5px; }
  ::-webkit-scrollbar-track { background:${THEME.brandLight}; }
  ::-webkit-scrollbar-thumb { background:${THEME.brandMid};border-radius:10px; }
`;

const PAGE_SIZE = 10;

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
function fmtAmt(num) {
  return parseFloat(num || 0).toLocaleString("en-IN");
}

function getExpenseTypeLabel(num) {
  return { 1:"Deposit", 2:"File Expense", 3:"Office Expense" }[num] || "—";
}

function TypeBadge({ typeId }) {
  const cfg = {
    1: { bg:"#F6FFED", color:"#389E0D", border:"#B7EB8F", label:"Deposit" },
    2: { bg:THEME.brandLight, color:THEME.brandDark, border:"#D4C4A0", label:"File Expense" },
    3: { bg:"#F0F5FF", color:"#2F54EB", border:"#ADC6FF", label:"Office Expense" },
  }[typeId] || { bg:"#F5F5F5", color:"#8C8C8C", border:"#D9D9D9", label:"—" };

  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:600, background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}`, whiteSpace:"nowrap" }}>
      {cfg.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const cfg = {
    1: { bg:"#F6FFED", color:"#389E0D", border:"#B7EB8F", label:"Approved" },
    0: { bg:"#FFF7E6", color:"#D46B08", border:"#FFD591", label:"Pending"  },
    2: { bg:"#FFF1F0", color:"#CF1322", border:"#FFA39E", label:"Rejected" },
  }[status] || { bg:"#F5F5F5", color:"#8C8C8C", border:"#D9D9D9", label:"Unknown" };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:600, background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}` }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:cfg.color }} />
      {cfg.label}
    </span>
  );
}

const StatusCell = memo(({ rowId, initialStatus, typeId }) => {
  const [status, setStatus] = useState(initialStatus);
  const header = { Authorization:`Bearer ${getToken()}`, "Content-Type":"application/json" };

  if (!superAccess([adminKey, subadmin])) {
    return <StatusBadge status={status} />;
  }

  const handleChange = async (e) => {
    const val = e.target.value;
    setStatus(parseInt(val));
    try {
      const res = await ApiService({ is_approved: val, id: parseInt(rowId) }, 0, header, checkFileExpense.method, checkFileExpense.url);
      if (!res.data.error) toast.success(res.data.message);
      else toast.error(res.data.message);
    } catch (err) { toast.error(err?.response?.data?.message || "Something went wrong"); }
  };

  return (
    <select value={status} onChange={handleChange} className="ter-status-select">
      <option value="0">Pending</option>
      <option value="1">Approved</option>
      <option value="2">Rejected</option>
    </select>
  );
});

const ActionMenu = memo(({ typeId, id, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  if (!superAccess()) return null;

  return (
    <div className="ter-menu-wrap" ref={ref}>
      <button className="ter-menu-btn" onClick={() => setOpen((o) => !o)}>⋮</button>
      {open && (
        <div className="ter-dropdown" onClick={() => setOpen(false)}>
          {typeId === 1 && (
            <Link className="ter-drop-item"
              to={`/${DepositExpenseRoute.edit}/${id}`}
              onClick={() => localStorage.setItem("expanse","expanse")}>
              ✏️ Edit
            </Link>
          )}
          {typeId === 2 && (
            <>
              <Link className="ter-drop-item"
                to={`/${FileExpenseRoute.preview}/${id}`}
                onClick={() => localStorage.setItem("preview","preview")}>
                👁 Preview
              </Link>
              <Link className="ter-drop-item"
                to={`/${FileExpenseRoute.edit}/${id}`}
                onClick={() => localStorage.setItem("files","files")}>
                ✏️ Edit
              </Link>
              <button className="ter-drop-item danger" onClick={() => onDelete(id)}>🗑 Delete</button>
            </>
          )}
          {typeId === 3 && (
            <>
              <Link className="ter-drop-item" to={`/${OfficeExpenseRoute.preview}/${id}`}>👁 Preview</Link>
              <Link className="ter-drop-item" to={`/${OfficeExpenseRoute.edit}/${id}`}>✏️ Edit</Link>
              <button className="ter-drop-item danger" onClick={() => onDelete(id)}>🗑 Delete</button>
            </>
          )}
        </div>
      )}
    </div>
  );
});

const ExpenseRow = memo(({ item, index, onDelete }) => (
  <tr>
    <td style={{ color:THEME.textMuted, fontWeight:700, fontSize:12, width:36 }}>{index + 1}</td>
    <td><TypeBadge typeId={item.type_id} /></td>
    <td style={{ fontSize:12, fontWeight:600, color:THEME.textMuted, whiteSpace:"nowrap" }}>{item.Date || "—"}</td>
    <td style={{ fontSize:12, color:"#595959", maxWidth:140 }}>{item.File || "—"}</td>
    <td>
      <span style={{ fontSize:14, fontWeight:800, color: item.type_id === 1 ? "#389E0D" : "#CF1322", fontFamily:"'Sora',sans-serif" }}>
        {item.type_id === 1 ? "+" : "−"} ₹ {fmtAmt(item.Amount)}
      </span>
    </td>
    <td style={{ fontSize:12, color:"#595959", maxWidth:200 }}>{item.Description || "—"}</td>
    <td><StatusCell rowId={item.id} initialStatus={item.status} typeId={item.type_id} /></td>
    <td style={{ textAlign:"center" }}><ActionMenu typeId={item.type_id} id={item.id} onDelete={onDelete} /></td>
  </tr>
));


// ─────────────────────────────────────────────
//  🖨️  PDF / PRINT BUILDER
// ─────────────────────────────────────────────
function buildPrintHTML({ rows, teamName, dateRange, additionalInfo }) {
  const STATUS_LABEL = { 1:"Approved", 0:"Pending", 2:"Rejected" };
  const STATUS_COLOR = {
    1: { bg:"#F6FFED", color:"#389E0D", border:"#B7EB8F" },
    0: { bg:"#FFF7E6", color:"#D46B08", border:"#FFD591" },
    2: { bg:"#FFF1F0", color:"#CF1322", border:"#FFA39E" },
  };
  const TYPE_LABEL = { 1:"Deposit", 2:"File Expense", 3:"Office Expense" };
  const TYPE_COLOR = {
    1: { bg:"#F6FFED", color:"#389E0D", border:"#B7EB8F" },
    2: { bg:"#F5F0E8", color:"#5C4E32", border:"#D4C4A0" },
    3: { bg:"#F0F5FF", color:"#2F54EB", border:"#ADC6FF" },
  };

  const dateLabel =
    dateRange.start_date && dateRange.end_date
      ? `${dateRange.start_date} to ${dateRange.end_date}`
      : "All Dates";

  const totalDeposit = rows.filter(r => r.type_id === 1).reduce((s, r) => s + parseFloat(r.Amount || 0), 0);
  const totalExpense = rows.filter(r => r.type_id !== 1).reduce((s, r) => s + parseFloat(r.Amount || 0), 0);
  const balance      = totalDeposit - totalExpense;

  const rowsHTML = rows.map((item, idx) => {
    const sc = STATUS_COLOR[item.status] || { bg:"#f5f5f5", color:"#888", border:"#ddd" };
    const tc = TYPE_COLOR[item.type_id]  || { bg:"#f5f5f5", color:"#888", border:"#ddd" };
    const isDeposit = item.type_id === 1;
    return `
      <tr>
        <td class="num">${idx + 1}</td>
        <td>
          <span class="badge" style="background:${tc.bg};color:${tc.color};border:1px solid ${tc.border}">
            ${TYPE_LABEL[item.type_id] || "—"}
          </span>
        </td>
        <td class="date-cell">${item.Date || "—"}</td>
        <td class="file-cell">${item.File || "—"}</td>
        <td class="amount-cell" style="color:${isDeposit ? "#389E0D" : "#CF1322"}">
          ${isDeposit ? "+" : "−"} ₹ ${fmtAmt(item.Amount)}
        </td>
        <td class="desc-cell">${item.Description || "—"}</td>
        <td>
          <span class="badge" style="background:${sc.bg};color:${sc.color};border:1px solid ${sc.border}">
            ${STATUS_LABEL[item.status] ?? "—"}
          </span>
        </td>
      </tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Team Expense Report — ${teamName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
    * { box-sizing:border-box; margin:0; padding:0; }

    body {
      font-family:'DM Sans',sans-serif;
      color:#1A1A2E;
      background:#fff;
      padding:28px 32px;
      font-size:12px;
    }

    /* ── Header ── */
    .print-header {
      display:flex;align-items:flex-start;justify-content:space-between;
      padding-bottom:16px;border-bottom:3px solid #887549;margin-bottom:16px;
    }
    .print-title {
      font-family:'Sora',sans-serif;font-size:22px;font-weight:800;
      color:#1A1A2E;letter-spacing:-0.3px;
    }
    .print-subtitle { font-size:11px;color:#ADADAD;margin-top:3px; }
    .brand-label {
      font-family:'Sora',sans-serif;font-size:15px;font-weight:800;
      color:#887549;letter-spacing:1px;text-align:right;
    }
    .brand-date { font-size:10px;color:#ADADAD;margin-top:2px;text-align:right; }

    /* ── Stats ── */
    .stats-row { display:flex;gap:10px;margin-bottom:18px;flex-wrap:wrap; }
    .stat-box {
      border:1px solid #EDE5D5;border-radius:8px;padding:8px 16px;
      min-width:130px;flex:1;
    }
    .stat-label { font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#ADADAD; }
    .stat-value { font-family:'Sora',sans-serif;font-size:16px;font-weight:800;margin-top:2px; }

    /* ── Table ── */
    table { width:100%;border-collapse:collapse;font-size:11px; }
    thead tr { background:#F5F0E8; }
    th {
      padding:9px 10px;font-size:9px;font-weight:700;text-transform:uppercase;
      letter-spacing:0.07em;color:#5C4E32;border-bottom:2px solid #D4C4A0;
      text-align:left;white-space:nowrap;
    }
    td { padding:9px 10px;border-bottom:1px solid #F5EFE4;vertical-align:middle; }
    tbody tr:nth-child(even) { background:#FEFCF9; }

    td.num { color:#ADADAD;font-weight:700;width:28px; }
    td.amount-cell { font-family:'Sora',sans-serif;font-weight:800;font-size:12px;white-space:nowrap; }
    td.date-cell { white-space:nowrap;font-weight:600;color:#595959; }
    td.file-cell { max-width:140px; }
    td.desc-cell { color:#595959;max-width:180px; }

    .badge {
      display:inline-block;padding:2px 9px;border-radius:20px;
      font-size:10px;font-weight:700;white-space:nowrap;
    }

    /* ── Summary footer row ── */
    tfoot tr { background:#F5F0E8; }
    tfoot td {
      padding:10px 10px;font-weight:700;font-size:11px;
      border-top:2px solid #D4C4A0;
    }
    .tfoot-label {
      font-family:'Sora',sans-serif;font-weight:800;color:#5C4E32;
      text-transform:uppercase;letter-spacing:0.05em;font-size:9px;
    }
    .tfoot-amount { font-family:'Sora',sans-serif;font-weight:800;font-size:13px; }

    /* ── Balance section ── */
    .balance-section {
      margin-top:16px;padding:12px 16px;border-radius:10px;
      border:1px solid #D4C4A0;background:#F5F0E8;
      display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;
    }
    .balance-label { font-size:11px;font-weight:700;color:#5C4E32;text-transform:uppercase;letter-spacing:0.07em; }
    .balance-value { font-family:'Sora',sans-serif;font-size:20px;font-weight:800; }

    /* ── Footer ── */
    .print-footer {
      margin-top:20px;padding-top:12px;border-top:1px solid #EDE5D5;
      display:flex;justify-content:space-between;font-size:9px;color:#BDBDBD;
    }

    @media print {
      body { padding:10px 14px; }
      @page { margin:8mm;size:A4 landscape; }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="print-header">
    <div>
      <div class="print-title">Team Expense Report</div>
      <div class="print-subtitle">
        Team: <strong style="color:#887549">${teamName || "—"}</strong>
        &nbsp;|&nbsp; Period: ${dateLabel}
        &nbsp;|&nbsp; Generated: ${new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" })}
        at ${new Date().toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" })}
      </div>
    </div>
    <div>
      <div class="brand-label">EXPENSE REPORT</div>
      <div class="brand-date">Printed: ${new Date().toLocaleDateString("en-IN")}</div>
    </div>
  </div>

  <!-- Stats -->
  <div class="stats-row">
    ${[
      { label:"Total Records",   value: rows.length,                                   color:"#887549" },
      { label:"Total Deposit",   value:`₹ ${fmtAmt(additionalInfo.total_deposit)}`,   color:"#389E0D" },
      { label:"Total Expense",   value:`₹ ${fmtAmt(additionalInfo.total_expense)}`,   color:"#CF1322" },
      { label:"Balance",         value:`₹ ${fmtAmt(additionalInfo.total_balance)}`,   color: additionalInfo.total_balance >= 0 ? "#389E0D" : "#CF1322" },
      { label:"Approved",        value: rows.filter(r => r.status === 1).length,       color:"#389E0D" },
      { label:"Pending",         value: rows.filter(r => r.status === 0).length,       color:"#D46B08" },
    ].map(s => `
      <div class="stat-box" style="border-top:3px solid ${s.color}">
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
        <th>Type</th>
        <th>Date</th>
        <th>File</th>
        <th>Amount</th>
        <th>Description</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>${rowsHTML}</tbody>
    <tfoot>
      <tr>
        <td colspan="4" class="tfoot-label">
          Filtered Total &mdash; ${rows.length} record${rows.length !== 1 ? "s" : ""}
        </td>
        <td>
          <div class="tfoot-amount" style="color:#389E0D">+ ₹ ${fmtAmt(totalDeposit)}</div>
          <div class="tfoot-amount" style="color:#CF1322;margin-top:2px">− ₹ ${fmtAmt(totalExpense)}</div>
        </td>
        <td colspan="2"></td>
      </tr>
    </tfoot>
  </table>

  <!-- Balance -->
  <div class="balance-section">
    <span class="balance-label">Net Balance (Deposit − Expense)</span>
    <span class="balance-value" style="color:${balance >= 0 ? "#389E0D" : "#CF1322"}">
      ₹ ${fmtAmt(balance)}
    </span>
  </div>

  <!-- Footer -->
  <div class="print-footer">
    <span>Team Expense Report &mdash; Confidential</span>
    <span>
      Deposit: ₹ ${fmtAmt(totalDeposit)} &nbsp;|&nbsp;
      Expense: ₹ ${fmtAmt(totalExpense)} &nbsp;|&nbsp;
      Balance: ₹ ${fmtAmt(balance)}
    </span>
  </div>

  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`;
}


// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const TeamExpenseReport = () => {
  const params = useParams();
  const header = { Authorization:`Bearer ${getToken()}`, "Content-Type":"application/json" };

  const [expenses,       setExpenses]       = useState([]);
  const [extraExpenses,  setExtraExpenses]  = useState([]);
  const [additionalInfo, setAdditionalInfo] = useState({ team:"", total_deposit:0, total_expense:0, total_balance:0 });
  const [dateRange,      setDateRange]      = useState({ start_date:"", end_date:"" });
  const [loading,        setLoading]        = useState(false);
  const [sortCol,        setSortCol]        = useState("Date");
  const [sortDesc,       setSortDesc]       = useState(true);
  const [page,           setPage]           = useState(0);

  const buildRows = (payload) =>
    payload.map((el) => ({
      id:          el.id,
      type_id:     parseInt(el.expense_type),
      Type:        getExpenseTypeLabel(el.expense_type),
      Date:        el.date ? GetDate(el.date, "DD-MM-YYYY") : "—",
      File:        el.file_name || "",
      Amount:      el.amount,
      Description: el.description || "",
      status:      el.is_approved,
    }));

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService(null, params.id, header, getDepositExpenseByTeamId.method, getDepositExpenseByTeamId.url);
      if (!res.data.error) {
        const td = res.data.team_data?.[0];
        const totalDeposit = res.data.total_deposit || 0;
        const totalExpense = res.data.total_expense || 0;
        setAdditionalInfo({
          team:          td?.team_fullname || "",
          total_deposit: totalDeposit,
          total_expense: totalExpense,
          total_balance: totalDeposit - totalExpense,
        });
        if (Array.isArray(res.data.data) && res.data.data.length > 0) {
          const rows = buildRows(res.data.data);
          setExpenses(rows);
          setExtraExpenses(rows);
        }
      }
    } catch (e) { console.error(e); toast.error(e?.response?.data?.message || "Something went wrong"); }
    finally { setLoading(false); }
  }, [params.id]);

  useEffect(() => { fetchData(); }, []);

  // ── Date range filter ─────────────────────
  useEffect(() => {
    if (dateRange.start_date && dateRange.end_date) {
      const fetch = async () => {
        setLoading(true);
        try {
          const url = `${getDepositExpenseByTeamIdForPdf.url}/${params.id}?start_date=${dateRange.start_date}&end_date=${dateRange.end_date}`;
          const res = await ApiService(null, 0, header, getDepositExpenseByTeamIdForPdf.method, url);
          if (!res.data.error && Array.isArray(res.data.data) && res.data.data.length > 0) {
            setExpenses(buildRows(res.data.data));
          } else { setExpenses([]); }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
      };
      fetch();
    } else if (!dateRange.start_date && !dateRange.end_date) {
      setExpenses([...extraExpenses]);
    }
  }, [dateRange]);

  const clearFilters = () => {
    setDateRange({ start_date:"", end_date:"" });
    setExpenses([...extraExpenses]);
    setPage(0);
  };

  // ── 🖨️ Client-side PDF/Print ─────────────
  const handleExportPDF = useCallback(() => {
    if (expenses.length === 0) {
      toast.error("No data to export.");
      return;
    }
    const html = buildPrintHTML({
      rows:           expenses,           // ALL currently visible rows (respects date filter)
      teamName:       additionalInfo.team,
      dateRange,
      additionalInfo,
    });
    const win = window.open("", "_blank", "width=1150,height=800");
    if (!win) {
      toast.error("Popup blocked — please allow popups for this site.");
      return;
    }
    win.document.write(html);
    win.document.close();
  }, [expenses, additionalInfo, dateRange]);

  // ── Delete ────────────────────────────────
  const onDelete = useCallback((id) => {
    SwalAlert({}).then(async (result) => {
      if (!result?.isConfirmed || isNaN(parseInt(id))) return;
      setLoading(true);
      try {
        const res = await ApiService(null, parseInt(id), header, deleteFileExpenseForAdmin.method, deleteFileExpenseForAdmin.url);
        if (!res.data.error) {
          setExpenses((p) => p.filter((v) => v.id != id));
          setExtraExpenses((p) => p.filter((v) => v.id != id));
          toast.success(res.data.message);
        } else toast.error(res.data.message);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    });
  }, []);

  // ── Sort ──────────────────────────────────
  const toggleSort = (col) => {
    if (sortCol === col) setSortDesc((d) => !d);
    else { setSortCol(col); setSortDesc(true); }
    setPage(0);
  };

  const sorted = useMemo(() => {
    return [...expenses].sort((a, b) => {
      const av = String(a[sortCol] ?? "");
      const bv = String(b[sortCol] ?? "");
      return sortDesc ? bv.localeCompare(av) : av.localeCompare(bv);
    });
  }, [expenses, sortCol, sortDesc]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageData   = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const sortIcon   = (col) => sortCol === col ? (sortDesc ? " ↓" : " ↑") : "";

  return (
    <>
      <style>{CSS}</style>

      <div style={{ fontFamily:"'DM Sans',sans-serif", padding:"20px 0 0" }}>

        {/* ── Date filter + Export (admin only) ── */}
        {superAccess([adminKey, subadmin]) && (
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center", marginBottom:16, padding:"0 4px" }}>
            <input className="ter-date" type="date" value={dateRange.start_date}
              onChange={(e) => setDateRange((p) => ({ ...p, start_date:e.target.value }))} />
            <input className="ter-date" type="date" value={dateRange.end_date}
              onChange={(e) => setDateRange((p) => ({ ...p, end_date:e.target.value }))} />

            {/* ✅ Replaced broken PHP redirect with client-side print */}
            <button
              className="ter-btn-primary"
              onClick={handleExportPDF}
              disabled={expenses.length === 0}
            >
              📄 Export PDF
            </button>

            <button className="ter-btn-outline" onClick={clearFilters}>
              ↺ Reset
            </button>
          </div>
        )}

        {/* ── Summary tiles ── */}
        <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
          {[
            { label:"Team",          value: additionalInfo.team || "—",                    color: THEME.brand  },
            { label:"Total Deposit", value:`₹ ${fmtAmt(additionalInfo.total_deposit)}`,   color:"#389E0D"     },
            { label:"Total Expense", value:`₹ ${fmtAmt(additionalInfo.total_expense)}`,   color:"#CF1322"     },
            { label:"Balance",       value:`₹ ${fmtAmt(additionalInfo.total_balance)}`,   color: additionalInfo.total_balance >= 0 ? "#389E0D" : "#CF1322" },
          ].map((s) => (
            <div key={s.label} style={{ background:"#fff", border:`1px solid ${THEME.border}`, borderRadius:10, padding:"10px 18px", borderTop:`3px solid ${s.color}`, boxShadow:"0 2px 8px rgba(136,117,73,0.06)", flex:1, minWidth:140 }}>
              <p style={{ margin:0, fontSize:10, fontWeight:700, color:THEME.textMuted, textTransform:"uppercase", letterSpacing:"0.07em" }}>{s.label}</p>
              <p style={{ margin:"3px 0 0", fontSize:17, fontWeight:800, color:s.color, fontFamily:"'Sora',sans-serif" }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Main table card ── */}
        <div style={{ background:"#fff", border:`1px solid ${THEME.border}`, borderRadius:14, overflow:"hidden", boxShadow:"0 2px 12px rgba(136,117,73,0.07)" }}>

          {loading && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"60px 0", gap:16 }}>
              <div className="ter-spinner" />
              <p style={{ color:THEME.textLight, fontSize:13, margin:0 }}>Loading report…</p>
            </div>
          )}

          {!loading && sorted.length === 0 && (
            <div style={{ textAlign:"center", padding:"56px 0" }}>
              <div style={{ fontSize:38, marginBottom:10 }}>💰</div>
              <p style={{ color:THEME.textLight, fontSize:14, margin:0 }}>No expense records found.</p>
            </div>
          )}

          {!loading && sorted.length > 0 && (
            <div className="ter-fade" style={{ overflowX:"auto" }}>
              <table className="ter-table">
                <thead>
                  <tr>
                    <th style={{ width:36 }}>#</th>
                    {[
                      { key:"Type",        label:"Type"        },
                      { key:"Date",        label:"Date"        },
                      { key:"File",        label:"File"        },
                      { key:"Amount",      label:"Amount"      },
                      { key:"Description", label:"Description" },
                      { key:"status",      label:"Status"      },
                    ].map((col) => (
                      <th key={col.key} onClick={() => toggleSort(col.key)}>
                        {col.label}{sortIcon(col.key)}
                      </th>
                    ))}
                    {superAccess() && <th style={{ textAlign:"center" }}>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((item, idx) => (
                    <ExpenseRow
                      key={`${item.id}-${item.type_id}`}
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
              <button className="ter-pg-btn" onClick={() => setPage(0)}             disabled={page === 0}>«</button>
              <button className="ter-pg-btn" onClick={() => setPage((p) => p - 1)} disabled={page === 0}>‹</button>
              <span style={{ fontSize:12, fontWeight:600, color:THEME.textMuted }}>{page + 1} of {totalPages}</span>
              <button className="ter-pg-btn" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1}>›</button>
              <button className="ter-pg-btn" onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}>»</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TeamExpenseReport;