// ─────────────────────────────────────────────
//  Reports.jsx  —  Monthly / Project / Ledger
// ─────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from "react";
import { getToken } from "../../../../services/useLocalStorage";
import {
  getEscrowMonthlyReport,
  getEscrowProjectReport,
  getEscrowLedgerReport,
  getEscrowLedgerReportDetail,
  getEscrowProjectReportDetail,
  getEscrowMonthlyReportDetail,
} from "../../../../config/config";
import ApiService from "../../../../services/ApiService";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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
  text: "#1A1A2E",
  textMuted: "#ADADAD",
  textLight: "#BDBDBD",
  error: "#CF1322",
  success: "#389E0D",
  income: "#22C55E",
  expense: "#EF4444",
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }
  @keyframes rpFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .rp-fade { animation:rpFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes rpPulse { 0%,100%{opacity:1} 50%{opacity:.4} }
  .rp-skeleton { animation:rpPulse 1.4s ease-in-out infinite; background:#EDE5D5; border-radius:6px; }

  .rp-input {
    padding:8px 12px; border-radius:10px;
    border:1.5px solid #E0D5C5; font-size:13px;
    font-family:'DM Sans',sans-serif; color:#1A1A2E;
    outline:none; background:#fff;
    transition:border-color 0.15s, box-shadow 0.15s;
  }
  .rp-input:focus { border-color:#887549; box-shadow:0 0 0 3px #88754918; }

  .rp-tr:hover td { background:#FDFAF5 !important; }
  .rp-tr { transition:background 0.12s; }

  .rp-tab {
    padding:9px 20px; border-radius:10px; border:1.5px solid #E0D5C5;
    background:#fff; font-size:13px; font-weight:600; cursor:pointer;
    font-family:'DM Sans',sans-serif; color:#595959;
    transition:all 0.18s; white-space:nowrap;
  }
  .rp-tab.active {
    background:#887549; border-color:#887549; color:#fff;
    box-shadow:0 2px 8px #88754944;
  }
  .rp-tab:not(.active):hover {
    border-color:#887549; color:#887549; background:#F5F0E8;
  }

  ::-webkit-scrollbar{height:5px;width:5px;}
  ::-webkit-scrollbar-track{background:#F5F0E8;}
  ::-webkit-scrollbar-thumb{background:#C4A97D;border-radius:10px;}
`;

// ─────────────────────────────────────────────
//  🧩  SHARED ATOMS
// ─────────────────────────────────────────────

const fmtAmt = (v) => {
  const n = parseFloat(v || 0);
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
};

function StatusBadge({ status }) {
  const map = {
    profit: {
      label: "Profit",
      bg: "#F6FFED",
      color: "#389E0D",
      border: "#B7EB8F",
      icon: "✅",
    },
    loss: {
      label: "Loss",
      bg: "#FFF1F0",
      color: "#CF1322",
      border: "#FFA39E",
      icon: "🔴",
    },
    breakeven: {
      label: "Break Even",
      bg: "#FFFBE6",
      color: "#D48806",
      border: "#FFE58F",
      icon: "➖",
    },
  };
  const s = map[status] || map.breakeven;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        fontFamily: "'Sora',sans-serif",
      }}
    >
      {s.icon} {s.label}
    </span>
  );
}

function SummaryCard({ label, value, icon, color, sub }) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${THEME.border}`,
        borderRadius: 14,
        padding: "18px 20px",
        boxShadow: "0 2px 10px rgba(136,117,73,0.06)",
        flex: 1,
        minWidth: 160,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: THEME.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 800,
          color,
          fontFamily: "'Sora',sans-serif",
          letterSpacing: "-0.5px",
        }}
      >
        {value}
      </div>
      {sub && (
        <p style={{ margin: "4px 0 0", fontSize: 11, color: THEME.textMuted }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function CardSection({ title, icon, children }) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${THEME.border}`,
        borderRadius: 14,
        padding: "20px 24px",
        marginBottom: 20,
        boxShadow: "0 2px 10px rgba(136,117,73,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            width: 3,
            height: 16,
            borderRadius: 2,
            background: `linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)`,
          }}
        />
        <h2
          style={{
            margin: 0,
            fontSize: 12,
            fontWeight: 700,
            color: THEME.brand,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            fontFamily: "'Sora',sans-serif",
          }}
        >
          {icon && <span style={{ marginRight: 6 }}>{icon}</span>}
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${THEME.border}`,
        borderRadius: 10,
        padding: "10px 14px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        fontFamily: "'DM Sans',sans-serif",
      }}
    >
      <p
        style={{
          margin: "0 0 6px",
          fontWeight: 700,
          color: THEME.text,
          fontSize: 13,
        }}
      >
        {label}
      </p>
      {payload.map((p) => (
        <p
          key={p.name}
          style={{
            margin: "2px 0",
            fontSize: 12,
            color: p.color,
            fontWeight: 600,
          }}
        >
          {p.name}: {fmtAmt(p.value)}
        </p>
      ))}
    </div>
  );
}

function SkeletonReport() {
  return (
    <div>
      <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rp-skeleton"
            style={{ flex: 1, height: 88, borderRadius: 14 }}
          />
        ))}
      </div>
      <div
        className="rp-skeleton"
        style={{ height: 300, borderRadius: 14, marginBottom: 20 }}
      />
      <div className="rp-skeleton" style={{ height: 380, borderRadius: 14 }} />
    </div>
  );
}

function TableHead({ cols }) {
  return (
    <thead>
      <tr
        style={{
          background: THEME.brandLight,
          borderBottom: `1px solid ${THEME.border}`,
        }}
      >
        {cols.map(({ label, align }) => (
          <th
            key={label}
            style={{
              padding: "11px 16px",
              textAlign: align || "left",
              fontSize: 11,
              fontWeight: 700,
              color: THEME.brand,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function TotalsRow({ cols, totals }) {
  return (
    <tr
      style={{
        background: THEME.brandLight,
        borderTop: `2px solid ${THEME.border}`,
      }}
    >
      {cols.map(({ key, align, isLabel, isStatus }, i) => (
        <td
          key={i}
          style={{ padding: "13px 16px", textAlign: align || "left" }}
        >
          {isLabel ? (
            <span
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: THEME.brandDark,
                fontFamily: "'Sora',sans-serif",
              }}
            >
              TOTAL
            </span>
          ) : isStatus ? (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <StatusBadge
                status={
                  totals.profit > 0
                    ? "profit"
                    : totals.profit < 0
                      ? "loss"
                      : "breakeven"
                }
              />
            </div>
          ) : key ? (
            <span
              style={{
                fontSize: 13,
                fontWeight: 800,
                color:
                  key === "income"
                    ? THEME.income
                    : key === "expense"
                      ? THEME.expense
                      : totals[key] >= 0
                        ? THEME.success
                        : THEME.error,
                whiteSpace: "nowrap",
              }}
            >
              {key === "profit" && totals[key] >= 0 ? "+" : ""}
              {fmtAmt(totals[key])}
            </span>
          ) : null}
        </td>
      ))}
    </tr>
  );
}
function DetailTables({ detailRows }) {
  const incomeRows  = detailRows.filter((r) => r.type === "income");
  const expenseRows = detailRows.filter((r) => r.type === "expense");

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "—";

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

      {/* ── Income ── */}
     {/* ── Income ── */}
<div style={{ background:"#fff", border:`1px solid ${THEME.border}`, borderRadius:14, padding:"18px 20px", boxShadow:"0 2px 10px rgba(136,117,73,0.06)", overflow:"hidden" }}>
  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
    <div style={{ width:3, height:16, borderRadius:2, background:"#22C55E" }} />
    <h3 style={{ margin:0, fontSize:12, fontWeight:700, color:"#389E0D", textTransform:"uppercase", letterSpacing:"0.07em", fontFamily:"'Sora',sans-serif" }}>
      💰 Income Transactions
      <span style={{ marginLeft:8, fontSize:11, color:THEME.textMuted, fontWeight:500, textTransform:"none" }}>({incomeRows.length})</span>
    </h3>
  </div>
  <div style={{ overflowX:"auto" }}>
    <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:"'DM Sans',sans-serif" }}>
      <thead>
        <tr style={{ background:"#F6FFED", borderBottom:`1px solid #B7EB8F` }}>
          {["#","Date","Ledger","Mode","Via Emp","Service","Amount"].map((h, i) => (
            <th key={h} style={{ padding:"9px 10px", fontSize:10, fontWeight:700, color:"#389E0D", textTransform:"uppercase", letterSpacing:"0.06em", textAlign: i === 6 ? "right" : "left", whiteSpace:"nowrap" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {incomeRows.length === 0 ? (
          <tr><td colSpan={7} style={{ padding:"24px 0", textAlign:"center", color:THEME.textMuted, fontSize:12 }}>No income found</td></tr>
        ) : incomeRows.map((r, idx) => (
          <tr key={idx} className="rp-tr" style={{ borderBottom:`1px solid ${THEME.border}`, background: idx % 2 === 0 ? "#fff" : "#FAFFF7" }}>
            <td style={{ padding:"9px 10px", fontSize:11, color:THEME.textMuted, fontWeight:600 }}>{idx+1}</td>
            <td style={{ padding:"9px 10px", fontSize:11, color:THEME.text, whiteSpace:"nowrap" }}>{fmtDate(r.date)}</td>
            <td style={{ padding:"9px 10px", fontSize:11, color:THEME.text, maxWidth:80, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.ledger_name || "—"}</td>
            <td style={{ padding:"9px 10px" }}>
              {r.mode ? (
                <span style={{ display:"inline-flex", alignItems:"center", gap:3, padding:"2px 6px", borderRadius:20, fontSize:10, fontWeight:700, background: r.mode==="cash" ? "#FFF7E6" : "#E6F4FF", color: r.mode==="cash" ? "#D48806" : "#0958D9", border:`1px solid ${r.mode==="cash" ? "#FFD666" : "#91CAFF"}` }}>
                  {r.mode === "cash" ? "💵" : "🏦"} {r.mode}
                </span>
              ) : "—"}
            </td>
            <td style={{ padding:"9px 10px", fontSize:11, color:THEME.textMuted, maxWidth:80, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.via_employee?.trim() || "—"}</td>
            <td style={{ padding:"9px 10px", fontSize:11, color:THEME.textMuted, maxWidth:80, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.services || "—"}</td>
            <td style={{ padding:"9px 10px", fontSize:11, fontWeight:700, color:THEME.income, textAlign:"right", whiteSpace:"nowrap" }}>+{fmtAmt(r.amount)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

      {/* ── Expense ── */}
      <div style={{ background:"#fff", border:`1px solid ${THEME.border}`, borderRadius:14, padding:"18px 20px", boxShadow:"0 2px 10px rgba(136,117,73,0.06)", overflow:"hidden" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
          <div style={{ width:3, height:16, borderRadius:2, background:"#EF4444" }} />
          <h3 style={{ margin:0, fontSize:12, fontWeight:700, color:"#CF1322", textTransform:"uppercase", letterSpacing:"0.07em", fontFamily:"'Sora',sans-serif" }}>
            💸 Expense Transactions
            <span style={{ marginLeft:8, fontSize:11, color:THEME.textMuted, fontWeight:500, textTransform:"none" }}>({expenseRows.length})</span>
          </h3>
        </div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:"'DM Sans',sans-serif" }}>
            <thead>
              <tr style={{ background:"#FFF1F0", borderBottom:`1px solid #FFA39E` }}>
                {["#","Date","Ledger","Mode","Via Emp","Service","Amount"].map((h, i) => (
                  <th key={h} style={{ padding:"9px 10px", fontSize:10, fontWeight:700, color:"#CF1322", textTransform:"uppercase", letterSpacing:"0.06em", textAlign: i === 6 ? "right" : "left", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenseRows.length === 0 ? (
                <tr><td colSpan={7} style={{ padding:"24px 0", textAlign:"center", color:THEME.textMuted, fontSize:12 }}>No expenses found</td></tr>
              ) : expenseRows.map((r, idx) => (
                <tr key={idx} className="rp-tr" style={{ borderBottom:`1px solid ${THEME.border}`, background: idx % 2 === 0 ? "#fff" : "#FFF9F9" }}>
                  <td style={{ padding:"9px 10px", fontSize:11, color:THEME.textMuted, fontWeight:600 }}>{idx+1}</td>
                  <td style={{ padding:"9px 10px", fontSize:11, color:THEME.text, whiteSpace:"nowrap" }}>{fmtDate(r.date)}</td>
                  <td style={{ padding:"9px 10px", fontSize:11, color:THEME.text, maxWidth:80, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.ledger_name || "—"}</td>
                  <td style={{ padding:"9px 10px" }}>
                    {r.mode ? (
                      <span style={{ display:"inline-flex", alignItems:"center", gap:3, padding:"2px 6px", borderRadius:20, fontSize:10, fontWeight:700, background: r.mode==="cash" ? "#FFF7E6" : "#E6F4FF", color: r.mode==="cash" ? "#D48806" : "#0958D9", border:`1px solid ${r.mode==="cash" ? "#FFD666" : "#91CAFF"}` }}>
                        {r.mode === "cash" ? "💵" : "🏦"} {r.mode}
                      </span>
                    ) : "—"}
                  </td>
                  <td style={{ padding:"9px 10px", fontSize:11, color:THEME.textMuted, maxWidth:80, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.via_employee?.trim() || "—"}</td>
                  <td style={{ padding:"9px 10px", fontSize:11, color:THEME.textMuted, maxWidth:80, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.services || "—"}</td>
                  <td style={{ padding:"9px 10px", fontSize:11, fontWeight:700, color:THEME.expense, textAlign:"right", whiteSpace:"nowrap" }}>-{fmtAmt(r.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

function DetailModal({ open, onClose, title, rows, type }) {
  if (!open) return null;

  const totalIncome = rows
    .filter((r) => r.type === "income")
    .reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const totalExpense = rows
    .filter((r) => r.type === "expense")
    .reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const totalProfit = totalIncome - totalExpense;

  const fmtDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          width: "100%",
          maxWidth: 700,
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          fontFamily: "'DM Sans',sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            borderBottom: `1px solid ${THEME.border}`,
            background: THEME.brandLight,
            borderRadius: "16px 16px 0 0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 3,
                height: 20,
                borderRadius: 2,
                background: `linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)`,
              }}
            />
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 800,
                  color: THEME.text,
                  fontFamily: "'Sora',sans-serif",
                }}
              >
                {title}
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  color: THEME.textMuted,
                  marginTop: 2,
                }}
              >
                {rows.length} transaction{rows.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: `1.5px solid ${THEME.border}`,
              background: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              color: THEME.textMuted,
            }}
          >
            ×
          </button>
        </div>

        {/* Summary strip */}
        <div
          style={{
            display: "flex",
            gap: 12,
            padding: "14px 24px",
            borderBottom: `1px solid ${THEME.border}`,
            background: "#FDFAF5",
          }}
        >
          {[
            {
              label: "Income",
              value: fmtAmt(totalIncome),
              color: THEME.income,
            },
            {
              label: "Expense",
              value: fmtAmt(totalExpense),
              color: THEME.expense,
            },
            {
              label: "Profit / Loss",
              value: (totalProfit >= 0 ? "+" : "") + fmtAmt(totalProfit),
              color: totalProfit >= 0 ? THEME.success : THEME.error,
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                flex: 1,
                background: "#fff",
                border: `1px solid ${THEME.border}`,
                borderRadius: 10,
                padding: "10px 14px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 10,
                  fontWeight: 700,
                  color: THEME.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                }}
              >
                {s.label}
              </p>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: 16,
                  fontWeight: 800,
                  color: s.color,
                  fontFamily: "'Sora',sans-serif",
                }}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            <thead style={{ position: "sticky", top: 0 }}>
              <tr
                style={{
                  background: THEME.brandLight,
                  borderBottom: `1px solid ${THEME.border}`,
                }}
              >
                {["#", "Date", "Type", "Remarks", "Amount"].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 16px",
                      fontSize: 11,
                      fontWeight: 700,
                      color: THEME.brand,
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      textAlign: i >= 4 ? "right" : "left",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: "32px 0",
                      textAlign: "center",
                      color: THEME.textMuted,
                      fontSize: 13,
                    }}
                  >
                    No transactions found
                  </td>
                </tr>
              ) : (
                rows.map((r, idx) => (
                  <tr
                    key={idx}
                    className="rp-tr"
                    style={{
                      borderBottom: `1px solid ${THEME.border}`,
                      background: idx % 2 === 0 ? "#fff" : "#FEFCF9",
                    }}
                  >
                    <td
                      style={{
                        padding: "11px 16px",
                        fontSize: 12,
                        color: THEME.textMuted,
                        fontWeight: 600,
                      }}
                    >
                      {idx + 1}
                    </td>
                    <td
                      style={{
                        padding: "11px 16px",
                        fontSize: 13,
                        color: THEME.text,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {fmtDate(r.date)}
                    </td>
                    <td style={{ padding: "11px 16px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "2px 8px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                          background:
                            r.type === "income" ? "#F6FFED" : "#FFF1F0",
                          color: r.type === "income" ? "#389E0D" : "#CF1322",
                          border: `1px solid ${r.type === "income" ? "#B7EB8F" : "#FFA39E"}`,
                        }}
                      >
                        {r.type === "income" ? "💰 Income" : "💸 Expense"}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "11px 16px",
                        fontSize: 13,
                        color: THEME.textMuted,
                        maxWidth: 180,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.remarks || "—"}
                    </td>
                    <td
                      style={{
                        padding: "11px 16px",
                        fontSize: 13,
                        fontWeight: 700,
                        color:
                          r.type === "income" ? THEME.income : THEME.expense,
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.type === "income" ? "+" : "-"}
                      {fmtAmt(r.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  📅  TAB 1 — MONTHLY REPORT
// ─────────────────────────────────────────────
function MonthlyTab() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const [detailView, setDetailView] = useState(null);
  const [detailRows, setDetailRows] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const handleMonthClick = async (m) => {
    setDetailLoading(true);
    setDetailView(m);
    try {
      const h = { Authorization: `Bearer ${getToken()}` };
      // reuse project detail API without project_id filter — OR add a monthly detail API
      // assuming you add: getEscrowMonthlyReportDetail = GET /getEscrowMonthlyReportDetail?month=1&year=2026
      const res = await ApiService(
        null,
        0,
        h,
        getEscrowMonthlyReportDetail.method,
        `${getEscrowMonthlyReportDetail.url}?month=${m.month}&year=${year}`,
      );
      if (!res.data.error) setDetailRows(res.data.data || []);
      else toast.error(res.data.message);
    } catch {
      toast.error("Failed to load detail");
    } finally {
      setDetailLoading(false);
    }
  };

  const load = useCallback(async (yr) => {
    setLoading(true);
    try {
      const h = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService(
        null,
        0,
        h,
        getEscrowMonthlyReport.method,
        `${getEscrowMonthlyReport.url}?year=${yr}`,
      );
      if (!res.data.error) setData(res.data.data);
      else toast.error(res.data.message || "Failed to load report");
    } catch {
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(year);
  }, [year, load]);

  const totals = data?.totals || { income: 0, expense: 0, profit: 0 };
  const chartData =
    data?.months?.map((m) => ({
      name: m.month_name,
      Income: m.income,
      Expense: m.expense,
    })) || [];

  const tableCols = [
    { label: "Month" },
    { label: "Income", align: "right" },
    { label: "Expense", align: "right" },
    { label: "Profit / Loss", align: "right" },
    { label: "Status", align: "center" },
  ];
  const totalsCols = [
    { isLabel: true },
    { key: "income", align: "right" },
    { key: "expense", align: "right" },
    { key: "profit", align: "right" },
    { isStatus: true, align: "center" },
  ];
  // Add to imports at top of file:
  // getEscrowMonthlyReportDetail

  // In MonthlyTab, before the existing return:
  if (detailView) {
    const inc = detailRows
      .filter((r) => r.type === "income")
      .reduce((s, r) => s + parseFloat(r.amount || 0), 0);
    const exp = detailRows
      .filter((r) => r.type === "expense")
      .reduce((s, r) => s + parseFloat(r.amount || 0), 0);
    const prf = inc - exp;

    return (
      <div className="rp-fade">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <button
            onClick={() => {
              setDetailView(null);
              setDetailRows([]);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              borderRadius: 10,
              border: `1.5px solid ${THEME.border}`,
              background: "#fff",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              color: THEME.text,
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            ← Back
          </button>
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 800,
                color: THEME.text,
                fontFamily: "'Sora',sans-serif",
              }}
            >
              {detailView.month_name} {year}
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: THEME.textMuted,
                marginTop: 2,
              }}
            >
              Monthly breakdown
            </p>
          </div>
        </div>

        {detailLoading ? (
          <SkeletonReport />
        ) : (
          <>
            <div
              style={{
                display: "flex",
                gap: 14,
                marginBottom: 20,
                flexWrap: "wrap",
              }}
            >
              <SummaryCard
                label="Total Income"
                value={fmtAmt(inc)}
                icon="💰"
                color={THEME.income}
                sub="All receipts"
              />
              <SummaryCard
                label="Total Expense"
                value={fmtAmt(exp)}
                icon="💸"
                color={THEME.expense}
                sub="All payments"
              />
              <SummaryCard
                label="Net Profit / Loss"
                value={(prf >= 0 ? "+" : "") + fmtAmt(prf)}
                icon={prf >= 0 ? "📈" : "📉"}
                color={prf >= 0 ? THEME.success : THEME.error}
                sub={prf >= 0 ? "In profit" : "In loss"}
              />
            </div>

            {/* Income Table */}
          <DetailTables detailRows={detailRows} />
          </>
        )}
      </div>
    );
  }

  return (
    <div className="rp-fade">
      {/* Year selector */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: THEME.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            Year
          </span>
          <select
            className="rp-input"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            style={{ width: 100 }}
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <SkeletonReport />
      ) : (
        <>
          {/* Summary */}
          <div
            style={{
              display: "flex",
              gap: 14,
              marginBottom: 20,
              flexWrap: "wrap",
            }}
          >
            <SummaryCard
              label="Total Income"
              value={fmtAmt(totals.income)}
              icon="💰"
              color={THEME.income}
              sub="All receipts this year"
            />
            <SummaryCard
              label="Total Expense"
              value={fmtAmt(totals.expense)}
              icon="💸"
              color={THEME.expense}
              sub="All payments this year"
            />
            <SummaryCard
              label="Net Profit / Loss"
              value={fmtAmt(totals.profit)}
              icon={totals.profit >= 0 ? "📈" : "📉"}
              color={totals.profit >= 0 ? THEME.success : THEME.error}
              sub={totals.profit >= 0 ? "You're in profit" : "You're in loss"}
            />
          </div>

          {/* Chart */}
          <CardSection title="Monthly Breakdown" icon="📊">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 16, left: 16, bottom: 4 }}
                barCategoryGap="30%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE1" />
                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: 12,
                    fontFamily: "'DM Sans',sans-serif",
                    fill: THEME.textMuted,
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{
                    fontSize: 11,
                    fontFamily: "'DM Sans',sans-serif",
                    fill: THEME.textMuted,
                  }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{
                    fontSize: 12,
                    fontFamily: "'DM Sans',sans-serif",
                    paddingTop: 12,
                  }}
                />
                <Bar
                  dataKey="Income"
                  fill={THEME.income}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="Expense"
                  fill={THEME.expense}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardSection>

          {/* Table */}
          <CardSection title="Month-wise Summary" icon="📋">
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontFamily: "'DM Sans',sans-serif",
                }}
              >
                <TableHead cols={tableCols} />
                <tbody>
                  {data?.months?.map((m, idx) => (
                    <tr
                      key={m.month}
                      className="rp-tr"
                      style={{
                        borderBottom: `1px solid ${THEME.border}`,
                        background: idx % 2 === 0 ? "#fff" : "#FEFCF9",
                      }}
                    >
                      <td
                        style={{
                          padding: "13px 16px",
                          fontSize: 13,
                          fontWeight: 700,
                          color: THEME.brand,
                          cursor: "pointer",
                          textDecoration: "underline dotted",
                        }}
                        onClick={() => handleMonthClick(m)}
                      >
                        {m.month_name} {year}
                      </td>
                      <td
                        style={{
                          padding: "13px 16px",
                          fontSize: 13,
                          fontWeight: 600,
                          color: THEME.income,
                          textAlign: "right",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {fmtAmt(m.income)}
                      </td>
                      <td
                        style={{
                          padding: "13px 16px",
                          fontSize: 13,
                          fontWeight: 600,
                          color: THEME.expense,
                          textAlign: "right",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {fmtAmt(m.expense)}
                      </td>
                      <td
                        style={{
                          padding: "13px 16px",
                          fontSize: 13,
                          fontWeight: 700,
                          color: m.profit >= 0 ? THEME.success : THEME.error,
                          textAlign: "right",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {m.profit >= 0 ? "+" : ""}
                        {fmtAmt(m.profit)}
                      </td>
                      <td style={{ padding: "13px 16px", textAlign: "center" }}>
                        <StatusBadge status={m.status} />
                      </td>
                    </tr>
                  ))}
                  <TotalsRow cols={totalsCols} totals={totals} />
                </tbody>
              </table>
            </div>
          </CardSection>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
//  🏗  TAB 2 — PROJECT REPORT
// ─────────────────────────────────────────────
function ProjectTab() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [search, setSearch] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const [detailView, setDetailView] = useState(null); // null = list, object = detail
  const [detailRows, setDetailRows] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const handleProjectClick = async (p) => {
    setDetailLoading(true);
    setDetailView(p);
    try {
      const h = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService(
        null,
        0,
        h,
        getEscrowProjectReportDetail.method,
        `${getEscrowProjectReportDetail.url}?project_id=${p.project_id}&year=${year}`,
      );
      if (!res.data.error) setDetailRows(res.data.data || []);
      else toast.error(res.data.message);
    } catch {
      toast.error("Failed to load detail");
    } finally {
      setDetailLoading(false);
    }
  };

  const load = useCallback(async (yr) => {
    setLoading(true);
    try {
      const h = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService(
        null,
        0,
        h,
        getEscrowProjectReport.method,
        `${getEscrowProjectReport.url}?year=${yr}`,
      );
      if (!res.data.error) setData(res.data.data);
      else toast.error(res.data.message || "Failed to load report");
    } catch {
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(year);
  }, [year, load]);

  const projects = (data?.projects || []).filter(
    (p) =>
      !search ||
      p.project_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.case_id?.toLowerCase().includes(search.toLowerCase()),
  );

  const totals = projects.reduce(
    (acc, p) => ({
      income: acc.income + p.income,
      expense: acc.expense + p.expense,
      profit: acc.profit + p.profit,
    }),
    { income: 0, expense: 0, profit: 0 },
  );

  const chartData = projects.slice(0, 10).map((p) => ({
    name: p.case_id || p.project_name,
    Income: p.income,
    Expense: p.expense,
  }));

  const tableCols = [
    { label: "#" },
    { label: "Project / Case ID" },
    { label: "Client" },
    { label: "Income", align: "right" },
    { label: "Expense", align: "right" },
    { label: "Profit / Loss", align: "right" },
    { label: "Status", align: "center" },
  ];
  const totalsCols = [
    { isLabel: true },
    {},
    {},
    { key: "income", align: "right" },
    { key: "expense", align: "right" },
    { key: "profit", align: "right" },
    { isStatus: true, align: "center" },
  ];

  return (
    <div className="rp-fade">
      {/* ── Detail View ── */}
      {detailView ? (
        <div className="rp-fade">
          {/* Back button + title */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <button
              onClick={() => {
                setDetailView(null);
                setDetailRows([]);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 10,
                border: `1.5px solid ${THEME.border}`,
                background: "#fff",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                color: THEME.text,
                fontFamily: "'DM Sans',sans-serif",
                transition: "all 0.15s",
              }}
            >
              ← Back
            </button>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 800,
                  color: THEME.text,
                  fontFamily: "'Sora',sans-serif",
                }}
              >
                {detailView.case_id || detailView.project_name}
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: THEME.textMuted,
                  marginTop: 2,
                }}
              >
                {detailView.client_name} · {year}
              </p>
            </div>
          </div>

          {detailLoading ? (
            <SkeletonReport />
          ) : (
            <>
              {/* Summary strip */}
              {(() => {
                const inc = detailRows
                  .filter((r) => r.type === "income")
                  .reduce((s, r) => s + parseFloat(r.amount || 0), 0);
                const exp = detailRows
                  .filter((r) => r.type === "expense")
                  .reduce((s, r) => s + parseFloat(r.amount || 0), 0);
                const prf = inc - exp;
                return (
                  <div
                    style={{
                      display: "flex",
                      gap: 14,
                      marginBottom: 20,
                      flexWrap: "wrap",
                    }}
                  >
                    <SummaryCard
                      label="Total Income"
                      value={fmtAmt(inc)}
                      icon="💰"
                      color={THEME.income}
                      sub="All receipts"
                    />
                    <SummaryCard
                      label="Total Expense"
                      value={fmtAmt(exp)}
                      icon="💸"
                      color={THEME.expense}
                      sub="All payments"
                    />
                    <SummaryCard
                      label="Net Profit / Loss"
                      value={(prf >= 0 ? "+" : "") + fmtAmt(prf)}
                      icon={prf >= 0 ? "📈" : "📉"}
                      color={prf >= 0 ? THEME.success : THEME.error}
                      sub={prf >= 0 ? "In profit" : "In loss"}
                    />
                  </div>
                );
              })()}
              {/* Income Table */}
        <DetailTables detailRows={detailRows} />
            </>
          )}
        </div>
      ) : (
        <>
          {/* Filters */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: 11,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 14,
                  color: THEME.textMuted,
                }}
              >
                🔍
              </span>
              <input
                className="rp-input"
                style={{ paddingLeft: 32, width: 240 }}
                placeholder="Search project or case ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: THEME.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                }}
              >
                Year
              </span>
              <select
                className="rp-input"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                style={{ width: 100 }}
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <SkeletonReport />
          ) : (
            <>
              {/* Summary */}
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  marginBottom: 20,
                  flexWrap: "wrap",
                }}
              >
                <SummaryCard
                  label="Total Projects"
                  value={projects.length}
                  icon="🏗"
                  color={THEME.brand}
                  sub={`In ${year}`}
                />
                <SummaryCard
                  label="Total Income"
                  value={fmtAmt(totals.income)}
                  icon="💰"
                  color={THEME.income}
                  sub="All receipts"
                />
                <SummaryCard
                  label="Total Expense"
                  value={fmtAmt(totals.expense)}
                  icon="💸"
                  color={THEME.expense}
                  sub="All payments"
                />
                <SummaryCard
                  label="Net Profit / Loss"
                  value={fmtAmt(totals.profit)}
                  icon={totals.profit >= 0 ? "📈" : "📉"}
                  color={totals.profit >= 0 ? THEME.success : THEME.error}
                  sub={totals.profit >= 0 ? "In profit" : "In loss"}
                />
              </div>

              {/* Chart — top 10 */}
              {chartData.length > 0 && (
                <CardSection
                  title="Top 10 Projects — Income vs Expense"
                  icon="📊"
                >
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={chartData}
                      margin={{ top: 4, right: 16, left: 16, bottom: 40 }}
                      barCategoryGap="30%"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE1" />
                      <XAxis
                        dataKey="name"
                        tick={{
                          fontSize: 10,
                          fontFamily: "'DM Sans',sans-serif",
                          fill: THEME.textMuted,
                        }}
                        axisLine={false}
                        tickLine={false}
                        angle={-35}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis
                        tick={{
                          fontSize: 11,
                          fontFamily: "'DM Sans',sans-serif",
                          fill: THEME.textMuted,
                        }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        wrapperStyle={{
                          fontSize: 12,
                          fontFamily: "'DM Sans',sans-serif",
                          paddingTop: 12,
                        }}
                      />
                      <Bar
                        dataKey="Income"
                        fill={THEME.income}
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="Expense"
                        fill={THEME.expense}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardSection>
              )}

              {/* Table */}
              <CardSection title="Project-wise Summary" icon="📋">
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontFamily: "'DM Sans',sans-serif",
                    }}
                  >
                    <TableHead cols={tableCols} />
                    <tbody>
                      {projects.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            style={{
                              padding: "40px 0",
                              textAlign: "center",
                              color: THEME.textMuted,
                              fontSize: 13,
                            }}
                          >
                            No projects found
                          </td>
                        </tr>
                      ) : (
                        projects.map((p, idx) => (
                          <tr
                            key={p.project_id}
                            className="rp-tr"
                            style={{
                              borderBottom: `1px solid ${THEME.border}`,
                              background: idx % 2 === 0 ? "#fff" : "#FEFCF9",
                            }}
                          >
                            <td
                              style={{
                                padding: "13px 16px",
                                fontSize: 12,
                                color: THEME.textMuted,
                                fontWeight: 600,
                              }}
                            >
                              {idx + 1}
                            </td>

                            <td style={{ padding: "13px 16px" }}>
                              <div
                                onClick={() => handleProjectClick(p)}
                                style={{
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: THEME.brand,
                                  cursor: "pointer",
                                  textDecoration: "underline dotted",
                                }}
                              >
                                {p.case_id || "—"}
                              </div>
                              <div
                                style={{
                                  fontSize: 11,
                                  color: THEME.textMuted,
                                  marginTop: 2,
                                }}
                              >
                                {p.project_name || ""}
                              </div>
                            </td>

                            <td
                              style={{
                                padding: "13px 16px",
                                fontSize: 13,
                                color: THEME.text,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {p.client_name || "—"}
                            </td>
                            <td
                              style={{
                                padding: "13px 16px",
                                fontSize: 13,
                                fontWeight: 600,
                                color: THEME.income,
                                textAlign: "right",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {fmtAmt(p.income)}
                            </td>
                            <td
                              style={{
                                padding: "13px 16px",
                                fontSize: 13,
                                fontWeight: 600,
                                color: THEME.expense,
                                textAlign: "right",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {fmtAmt(p.expense)}
                            </td>
                            <td
                              style={{
                                padding: "13px 16px",
                                fontSize: 13,
                                fontWeight: 700,
                                color:
                                  p.profit >= 0 ? THEME.success : THEME.error,
                                textAlign: "right",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {p.profit >= 0 ? "+" : ""}
                              {fmtAmt(p.profit)}
                            </td>
                            <td
                              style={{
                                padding: "13px 16px",
                                textAlign: "center",
                              }}
                            >
                              <StatusBadge
                                status={
                                  p.profit > 0
                                    ? "profit"
                                    : p.profit < 0
                                      ? "loss"
                                      : "breakeven"
                                }
                              />
                            </td>
                          </tr>
                        ))
                      )}
                      {projects.length > 0 && (
                        <TotalsRow cols={totalsCols} totals={totals} />
                      )}
                    </tbody>
                  </table>
                </div>
              </CardSection>
            </>
          )}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
//  📒  TAB 3 — LEDGER REPORT
// ─────────────────────────────────────────────
function LedgerTab() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [search, setSearch] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const [detailView, setDetailView] = useState(null); // null = list, object = detail
  const [detailRows, setDetailRows] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const handleLedgerClick = async (l) => {
    setDetailLoading(true);
    setDetailView(l);
    try {
      const h = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService(
        null,
        0,
        h,
        getEscrowLedgerReportDetail.method,
        `${getEscrowLedgerReportDetail.url}?ledger_id=${l.ledger_id}&year=${year}`,
      );
      if (!res.data.error) setDetailRows(res.data.data || []);
      else toast.error(res.data.message);
    } catch {
      toast.error("Failed to load detail");
    } finally {
      setDetailLoading(false);
    }
  };

  const load = useCallback(async (yr) => {
    setLoading(true);
    try {
      const h = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService(
        null,
        0,
        h,
        getEscrowLedgerReport.method,
        `${getEscrowLedgerReport.url}?year=${yr}`,
      );
      if (!res.data.error) setData(res.data.data);
      else toast.error(res.data.message || "Failed to load report");
    } catch {
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(year);
  }, [year, load]);

  const ledgers = (data?.ledgers || []).filter(
    (l) =>
      !search ||
      l.ledger_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.group_name?.toLowerCase().includes(search.toLowerCase()),
  );

  const totals = ledgers.reduce(
    (acc, l) => ({
      income: acc.income + l.income,
      expense: acc.expense + l.expense,
      profit: acc.profit + l.profit,
    }),
    { income: 0, expense: 0, profit: 0 },
  );

  const chartData = ledgers.slice(0, 10).map((l) => ({
    name: l.ledger_name,
    Income: l.income,
    Expense: l.expense,
  }));

  const tableCols = [
    { label: "#" },
    { label: "Ledger Name" },
    { label: "Group" },
    { label: "Income", align: "right" },
    { label: "Expense", align: "right" },
    { label: "Profit / Loss", align: "right" },
    { label: "Status", align: "center" },
  ];
  const totalsCols = [
    { isLabel: true },
    {},
    {},
    { key: "income", align: "right" },
    { key: "expense", align: "right" },
    { key: "profit", align: "right" },
    { isStatus: true, align: "center" },
  ];

  if (detailView) {
    const inc = detailRows
      .filter((r) => r.type === "income")
      .reduce((s, r) => s + parseFloat(r.amount || 0), 0);
    const exp = detailRows
      .filter((r) => r.type === "expense")
      .reduce((s, r) => s + parseFloat(r.amount || 0), 0);
    const prf = inc - exp;
    return (
      <div className="rp-fade">
        {/* Back + title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <button
            onClick={() => {
              setDetailView(null);
              setDetailRows([]);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              borderRadius: 10,
              border: `1.5px solid ${THEME.border}`,
              background: "#fff",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              color: THEME.text,
              fontFamily: "'DM Sans',sans-serif",
              transition: "all 0.15s",
            }}
          >
            ← Back
          </button>
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 800,
                color: THEME.text,
                fontFamily: "'Sora',sans-serif",
              }}
            >
              {detailView.ledger_name}
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: THEME.textMuted,
                marginTop: 2,
              }}
            >
              {detailView.group_name} · {year}
            </p>
          </div>
        </div>

        {detailLoading ? (
          <SkeletonReport />
        ) : (
          <>
            {/* Summary */}
            <div
              style={{
                display: "flex",
                gap: 14,
                marginBottom: 20,
                flexWrap: "wrap",
              }}
            >
              <SummaryCard
                label="Total Income"
                value={fmtAmt(inc)}
                icon="💰"
                color={THEME.income}
                sub="All receipts"
              />
              <SummaryCard
                label="Total Expense"
                value={fmtAmt(exp)}
                icon="💸"
                color={THEME.expense}
                sub="All payments"
              />
              <SummaryCard
                label="Net Profit / Loss"
                value={(prf >= 0 ? "+" : "") + fmtAmt(prf)}
                icon={prf >= 0 ? "📈" : "📉"}
                color={prf >= 0 ? THEME.success : THEME.error}
                sub={prf >= 0 ? "In profit" : "In loss"}
              />
            </div>

            {/* Transactions table */}
  <DetailTables detailRows={detailRows} />
          </>
        )}
      </div>
    );
  }

  // ── List view ────────────────────────────────
  return (
    <div className="rp-fade">
      {/* Filters */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: 11,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 14,
              color: THEME.textMuted,
            }}
          >
            🔍
          </span>
          <input
            className="rp-input"
            style={{ paddingLeft: 32, width: 240 }}
            placeholder="Search ledger or group…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: THEME.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            Year
          </span>
          <select
            className="rp-input"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            style={{ width: 100 }}
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <SkeletonReport />
      ) : (
        <>
          {/* Summary */}
          <div
            style={{
              display: "flex",
              gap: 14,
              marginBottom: 20,
              flexWrap: "wrap",
            }}
          >
            <SummaryCard
              label="Total Ledgers"
              value={ledgers.length}
              icon="📒"
              color={THEME.brand}
              sub={`In ${year}`}
            />
            <SummaryCard
              label="Total Income"
              value={fmtAmt(totals.income)}
              icon="💰"
              color={THEME.income}
              sub="All receipts"
            />
            <SummaryCard
              label="Total Expense"
              value={fmtAmt(totals.expense)}
              icon="💸"
              color={THEME.expense}
              sub="All payments"
            />
            <SummaryCard
              label="Net Profit / Loss"
              value={fmtAmt(totals.profit)}
              icon={totals.profit >= 0 ? "📈" : "📉"}
              color={totals.profit >= 0 ? THEME.success : THEME.error}
              sub={totals.profit >= 0 ? "In profit" : "In loss"}
            />
          </div>

          {/* Chart */}
          {chartData.length > 0 && (
            <CardSection title="Top 10 Ledgers — Income vs Expense" icon="📊">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={chartData}
                  margin={{ top: 4, right: 16, left: 16, bottom: 40 }}
                  barCategoryGap="30%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE1" />
                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: 10,
                      fontFamily: "'DM Sans',sans-serif",
                      fill: THEME.textMuted,
                    }}
                    axisLine={false}
                    tickLine={false}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    tick={{
                      fontSize: 11,
                      fontFamily: "'DM Sans',sans-serif",
                      fill: THEME.textMuted,
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{
                      fontSize: 12,
                      fontFamily: "'DM Sans',sans-serif",
                      paddingTop: 12,
                    }}
                  />
                  <Bar
                    dataKey="Income"
                    fill={THEME.income}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Expense"
                    fill={THEME.expense}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardSection>
          )}

          {/* Table */}
          <CardSection title="Ledger-wise Summary" icon="📋">
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontFamily: "'DM Sans',sans-serif",
                }}
              >
                <TableHead cols={tableCols} />
                <tbody>
                  {ledgers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        style={{
                          padding: "40px 0",
                          textAlign: "center",
                          color: THEME.textMuted,
                          fontSize: 13,
                        }}
                      >
                        No ledgers found
                      </td>
                    </tr>
                  ) : (
                    ledgers.map((l, idx) => (
                      <tr
                        key={l.ledger_id}
                        className="rp-tr"
                        style={{
                          borderBottom: `1px solid ${THEME.border}`,
                          background: idx % 2 === 0 ? "#fff" : "#FEFCF9",
                        }}
                      >
                        <td
                          style={{
                            padding: "13px 16px",
                            fontSize: 12,
                            color: THEME.textMuted,
                            fontWeight: 600,
                          }}
                        >
                          {idx + 1}
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <span
                            onClick={() => handleLedgerClick(l)}
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: THEME.brand,
                              cursor: "pointer",
                              textDecoration: "underline dotted",
                            }}
                          >
                            {l.ledger_name || "—"}
                          </span>
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "3px 10px",
                              borderRadius: 20,
                              fontSize: 11,
                              fontWeight: 600,
                              background: THEME.brandLight,
                              color: THEME.brandDark,
                              border: `1px solid #D4C4A0`,
                            }}
                          >
                            {l.group_name || "—"}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "13px 16px",
                            fontSize: 13,
                            fontWeight: 600,
                            color: THEME.income,
                            textAlign: "right",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {fmtAmt(l.income)}
                        </td>
                        <td
                          style={{
                            padding: "13px 16px",
                            fontSize: 13,
                            fontWeight: 600,
                            color: THEME.expense,
                            textAlign: "right",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {fmtAmt(l.expense)}
                        </td>
                        <td
                          style={{
                            padding: "13px 16px",
                            fontSize: 13,
                            fontWeight: 700,
                            color: l.profit >= 0 ? THEME.success : THEME.error,
                            textAlign: "right",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {l.profit >= 0 ? "+" : ""}
                          {fmtAmt(l.profit)}
                        </td>
                        <td
                          style={{ padding: "13px 16px", textAlign: "center" }}
                        >
                          <StatusBadge
                            status={
                              l.profit > 0
                                ? "profit"
                                : l.profit < 0
                                  ? "loss"
                                  : "breakeven"
                            }
                          />
                        </td>
                      </tr>
                    ))
                  )}
                  {ledgers.length > 0 && (
                    <TotalsRow cols={totalsCols} totals={totals} />
                  )}
                </tbody>
              </table>
            </div>
          </CardSection>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const Reports = () => {
  const [activeTab, setActiveTab] = useState("monthly");
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const REPORT_PASSWORD = "zed@reports2026";

  const handleUnlock = () => {
    if (password === REPORT_PASSWORD) {
      setUnlocked(true);
      setError("");
    } else {
      setError("Incorrect password. Please try again.");
      setPassword("");
    }
  };

  const TABS = [
    { key: "monthly", label: "📅 Monthly Report" },
    { key: "project", label: "🏗 Project Report" },
    { key: "ledger", label: "📒 Ledger Report" },
  ];

  // ── Password Gate ──────────────────────────
  if (!unlocked) {
    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <div
          style={{
            minHeight: "100vh",
            background: THEME.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'DM Sans',sans-serif",
            padding: 24,
          }}
        >
          <div
            style={{
              background: "#fff",
              border: `1px solid ${THEME.border}`,
              borderRadius: 18,
              padding: "40px 36px",
              width: "100%",
              maxWidth: 400,
              boxShadow: "0 8px 40px rgba(136,117,73,0.12)",
              textAlign: "center",
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: THEME.brandLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                fontSize: 26,
              }}
            >
              🔒
            </div>

            <h2
              style={{
                margin: "0 0 6px",
                fontSize: 20,
                fontWeight: 800,
                color: THEME.text,
                fontFamily: "'Sora',sans-serif",
              }}
            >
              Reports Access
            </h2>
            <p
              style={{
                margin: "0 0 28px",
                fontSize: 13,
                color: THEME.textMuted,
              }}
            >
              Enter the password to view financial reports
            </p>

            {/* Input */}
            <div style={{ position: "relative", marginBottom: 12 }}>
              <input
                type={showPass ? "text" : "password"}
                placeholder="Enter password…"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUnlock();
                }}
                autoFocus
                style={{
                  width: "100%",
                  padding: "11px 44px 11px 14px",
                  borderRadius: 10,
                  border: `1.5px solid ${error ? THEME.error : THEME.border}`,
                  fontSize: 13,
                  fontFamily: "'DM Sans',sans-serif",
                  color: THEME.text,
                  outline: "none",
                  background: error ? THEME.errorBg : "#fff",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s",
                }}
              />
              {/* Show/hide toggle */}
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 16,
                  color: THEME.textMuted,
                  padding: 0,
                  lineHeight: 1,
                }}
              >
                {showPass ? "🙈" : "👁"}
              </button>
            </div>

            {/* Error */}
            {error && (
              <p
                style={{
                  margin: "0 0 12px",
                  fontSize: 12,
                  color: THEME.error,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  justifyContent: "center",
                }}
              >
                ⚠ {error}
              </p>
            )}

            {/* Button */}
            <button
              onClick={handleUnlock}
              style={{
                width: "100%",
                padding: "11px",
                borderRadius: 10,
                border: "none",
                background: THEME.brand,
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Sora',sans-serif",
                boxShadow: `0 2px 8px ${THEME.brand}44`,
                transition: "background 0.18s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = THEME.brandDark)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = THEME.brand)
              }
            >
              🔓 Unlock Reports
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── Reports Page ───────────────────────────
  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div
        style={{
          minHeight: "100vh",
          background: THEME.bg,
          fontFamily: "'DM Sans',sans-serif",
          padding: "28px 24px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 4,
                height: 26,
                borderRadius: 3,
                background: `linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)`,
              }}
            />
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 800,
                  color: THEME.text,
                  fontFamily: "'Sora',sans-serif",
                  letterSpacing: "-0.3px",
                }}
              >
                Income vs Expense Reports
              </h1>
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: THEME.textMuted,
                  marginTop: 2,
                }}
              >
                Financial overview across months, projects and ledgers
              </p>
            </div>
          </div>
          {/* Lock button */}
          <button
            onClick={() => {
              setUnlocked(false);
              setPassword("");
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: 10,
              border: `1.5px solid ${THEME.border}`,
              background: "#fff",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              color: THEME.textMuted,
              fontFamily: "'DM Sans',sans-serif",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = THEME.brand;
              e.currentTarget.style.color = THEME.brand;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = THEME.border;
              e.currentTarget.style.color = THEME.textMuted;
            }}
          >
            🔒 Lock
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`rp-tab${activeTab === t.key ? " active" : ""}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "monthly" && <MonthlyTab />}
        {activeTab === "project" && <ProjectTab />}
        {activeTab === "ledger" && <LedgerTab />}
      </div>
    </>
  );
};

export default Reports;
