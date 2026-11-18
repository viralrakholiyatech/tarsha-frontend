// ─────────────────────────────────────────────
//  CustomerList.jsx  —  All Customers
//  Same design system as EmployeeList / ListAdmin
// ─────────────────────────────────────────────

import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import { deleteCustomer } from "../../../services/CustomerService";
import { getToken } from "../../../services/useLocalStorage";
import toast from "react-hot-toast";
import { CustRoute } from "../../../config/RouteConfig";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import ApiService from "../../../services/ApiService";
import { fetchCust } from "../../../config/config";
import AddModal from "../client/Add";
import EditModal from "../client/Edit";


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

const PAGE_SIZE = 15;

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }
  @keyframes clFadeIn {
    from { opacity:0; transform:translateY(8px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .cl-fade { animation: clFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes clSpin { to { transform:rotate(360deg); } }
  .cl-spinner {
    width:28px; height:28px; border-radius:50%;
    border:3px solid ${THEME.brandLight};
    border-top-color:${THEME.brand};
    animation:clSpin 0.8s linear infinite;
  }
  .cl-search {
    padding:8px 14px 8px 36px; border-radius:10px;
    border:1.5px solid #E0D5C5; font-size:13px;
    font-family:'DM Sans',sans-serif; color:#1A1A2E;
    outline:none; background:#fff; width:220px;
    transition:border-color 0.15s, width 0.2s;
  }
  .cl-search:focus { border-color:${THEME.brand}; box-shadow:0 0 0 3px ${THEME.brand}18; width:260px; }
  .cl-search::placeholder { color:${THEME.textLight}; }
  .cl-th { cursor:pointer; user-select:none; white-space:nowrap; }
  .cl-th:hover { color:${THEME.brand}; }

  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background:${THEME.brandLight}; }
  ::-webkit-scrollbar-thumb { background:${THEME.brandMid}; border-radius:10px; }
`;

// ─────────────────────────────────────────────
//  🧩  ATOMS
// ─────────────────────────────────────────────

function AddBtn({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: "9px 18px", borderRadius: 10, border: "none",
        background: hov ? THEME.brandDark : THEME.brand,
        color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
        fontFamily: "'Sora',sans-serif", transition: "all 0.18s",
        boxShadow: `0 2px 8px ${THEME.brand}44`, whiteSpace: "nowrap",
      }}>
      + Add Customer
    </button>
  );
}

function EditIconBtn({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} title="Edit"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, color: hov ? THEME.brand : "#657488", transition: "color 0.15s" }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none">
        <path d="M13.26 4L5.05 12.69C4.74 13.02 4.44 13.67 4.38 14.12L4.01 17.36C3.88 18.53 4.72 19.33 5.88 19.13L9.1 18.58C9.55 18.5 10.18 18.17 10.49 17.83L18.7 9.14C20.12 7.64 20.76 5.93 18.55 3.84C16.35 1.77 14.68 2.5 13.26 4Z" stroke="currentColor" strokeWidth="1.8" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M11.89 5.45C12.32 8.21 14.56 10.32 17.34 10.6" stroke="currentColor" strokeWidth="1.8" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 22H21" stroke="currentColor" strokeWidth="1.8" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

function DeleteIconBtn({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} title="Delete"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, color: hov ? "#FF4D4F" : "#FF8096", transition: "color 0.15s" }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 20 20" fill="none">
        <path d="M17.5 4.98c-2.775-.275-5.567-.417-8.35-.417q-2.475 0-4.95.25l-1.7.167" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="m7.083 4.142.183-1.092C7.4 2.258 7.5 1.667 8.908 1.667h2.183c1.408 0 1.517.625 1.642 1.392l.183 1.083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="m15.707 7.617-.542 8.392c-.092 1.308-.167 2.325-2.492 2.325h-5.35c-2.325 0-2.4-1.017-2.492-2.325l-.542-8.392" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8.607 13.75h2.775M7.913 10.417h4.167" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

function Pagination({ page, total, canPrev, canNext, onFirst, onPrev, onNext, onLast }) {
  const btn = (disabled) => ({
    width: 30, height: 30, borderRadius: 8,
    background: disabled ? "#F5F5F5" : "#fff",
    border: `1px solid ${disabled ? "#E8E8E8" : "#E0D5C5"}`,
    color: disabled ? THEME.textLight : THEME.brand,
    cursor: disabled ? "default" : "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 14, fontWeight: 700, transition: "all 0.15s",
  });
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6, padding: "12px 20px", borderTop: "1px solid #F5EFE4", background: "#FDFAF5" }}>
      <button style={btn(!canPrev)} onClick={onFirst} disabled={!canPrev}>«</button>
      <button style={btn(!canPrev)} onClick={onPrev}  disabled={!canPrev}>‹</button>
      <span style={{ fontSize: 13, color: "#595959", fontWeight: 600, padding: "0 8px" }}>
        Page <span style={{ color: THEME.brand }}>{page}</span> of {total}
      </span>
      <button style={btn(!canNext)} onClick={onNext} disabled={!canNext}>›</button>
      <button style={btn(!canNext)} onClick={onLast} disabled={!canNext}>»</button>
    </div>
  );
}

/** Customer initials avatar */
function InitialsAvatar({ name, company }) {
  const initial = (name?.[0] ?? company?.[0] ?? "C").toUpperCase();
  return (
    <div style={{
      width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
      background: `linear-gradient(135deg,${THEME.brand} 0%,${THEME.brandMid} 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 13, fontWeight: 700, color: "#fff",
    }}>{initial}</div>
  );
}

// ─────────────────────────────────────────────
//  TABLE ROW  —  memo for performance
// ─────────────────────────────────────────────
const CustomerRow = memo(({ cust, index, onEdit, onDelete }) => {
  const [hov, setHov] = useState(false);
  return (
    <tr
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? THEME.rowHover : index % 2 === 0 ? "#fff" : THEME.rowAlt,
        transition: "background 0.15s",
      }}
    >
      <td style={td("center")}>
        <span style={{ fontSize: 12, fontWeight: 700, color: THEME.textMuted }}>{index + 1}</span>
      </td>

      {/* Name + avatar */}
      <td style={td()}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <InitialsAvatar name={cust.first_name} company={cust.company_name} />
          <span style={{ fontSize: 13, fontWeight: 600, color: THEME.text }}>{cust.first_name || "—"}</span>
        </div>
      </td>

      {/* Company */}
      <td style={td()}>
        {cust.company_name ? (
          <span style={{
            display: "inline-block", padding: "3px 10px", borderRadius: 20,
            fontSize: 11, fontWeight: 600,
            background: THEME.brandLight, color: THEME.brandDark,
            border: `1px solid #D4C4A0`,
          }}>
            🏢 {cust.company_name}
          </span>
        ) : "—"}
      </td>

      {/* Email */}
      <td style={td()}>
        <a href={`mailto:${cust.email}`} style={{ fontSize: 12, color: "#2F54EB", textDecoration: "none" }}
          onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
          onMouseLeave={(e) => e.target.style.textDecoration = "none"}>
          {cust.email || "—"}
        </a>
      </td>

      {/* Mobile */}
      <td style={td()}>
        <span style={{ fontSize: 12, color: "#595959", whiteSpace: "nowrap" }}>{cust.mobile || "—"}</span>
      </td>

      {/* Actions */}
      <td style={{ ...td("center") }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
          <EditIconBtn   onClick={() => onEdit(cust.id)} />
          <DeleteIconBtn onClick={() => onDelete(cust.id)} />
        </div>
      </td>
    </tr>
  );
});

const td = (align = "left") => ({
  padding: "11px 14px",
  borderBottom: "1px solid #F5EFE4",
  verticalAlign: "middle",
  textAlign: align,
});

const HEADERS      = ["#", "Name", "Company", "Email", "Mobile", "Actions"];
const SORT_KEYS    = [null, "first_name", "company_name", "email", "mobile", null];
const HEADER_ALIGN = ["center", "left", "left", "left", "left", "center"];


// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const CustomerList = () => {
  const [custData,       setCustData]       = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [search,         setSearch]         = useState("");
  const [pageIndex,      setPageIndex]      = useState(0);
  const [sortKey,        setSortKey]        = useState("first_name");
  const [sortAsc,        setSortAsc]        = useState(true);
  const [showModal,      setShowModal]      = useState(false);
  const [editShowModal,  setEditShowModal]  = useState(false);
  const [clientId,       setClientId]       = useState(null);

  const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };

  // ── Fetch ─────────────────────────────────

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService(null, 0, header, fetchCust.method, fetchCust.url);
      if (!res.data.error) {
        const payload = res.data?.data || [];
        setCustData(payload.map((e) => ({
          id:           e.id,
          first_name:   e.first_name,
          company_name: e.company_name,
          email:        e.email,
          mobile:       e.phone,
        })));
      } else { toast.error(res.data?.message); }
    } catch (err) {
      toast.error(err?.response?.data?.message || "An error occurred");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCustomers(); }, []);

  // ── Delete ────────────────────────────────

  const handleDelete = useCallback((id) => {
    SwalAlert({}).then(async (result) => {
      if (!result.isConfirmed) return;
      setLoading(true);
      try {
        const res = await deleteCustomer(id, getToken());
        if (!res.data.error) {
          toast.success(res.data?.message);
          fetchCustomers();
        } else { toast.error(res.data?.message || "Unable to delete"); }
      } catch (err) {
        toast.error(err?.response?.data?.message || "Something went wrong");
      } finally { setLoading(false); }
    });
  }, [fetchCustomers]);

  const handleEdit = useCallback((id) => { setClientId(id); setEditShowModal(true); }, []);

  // ── Filter + Sort + Paginate ──────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return custData;
    return custData.filter((c) =>
      c.first_name?.toLowerCase().includes(q) ||
      c.company_name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.mobile?.includes(q)
    );
  }, [custData, search]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = String(a[sortKey] ?? "").toLowerCase();
      const bv = String(b[sortKey] ?? "").toLowerCase();
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [filtered, sortKey, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage   = Math.min(pageIndex, totalPages - 1);
  const pageData   = sorted.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const handleSort = (key) => {
    if (!key) return;
    if (sortKey === key) setSortAsc((a) => !a);
    else { setSortKey(key); setSortAsc(true); }
    setPageIndex(0);
  };

  const sortIcon = (key) => {
    if (sortKey !== key) return <span style={{ opacity: 0.25, marginLeft: 3 }}>↕</span>;
    return <span style={{ color: THEME.brand, marginLeft: 3 }}>{sortAsc ? "↑" : "↓"}</span>;
  };

  // ── Render ────────────────────────────────

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div style={{ minHeight: "100vh",   fontFamily: "'DM Sans',sans-serif", padding: "28px 24px" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ width: 4, height: 26, borderRadius: 3, background: `linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: THEME.text, fontFamily: "'Sora',sans-serif", letterSpacing: "-0.3px" }}>
                All Customers
              </h1>
            </div>
            <p style={{ margin: "0 0 0 12px", fontSize: 12, color: THEME.textMuted }}>
              {loading ? "Loading…" : `${filtered.length} customer${filtered.length !== 1 ? "s" : ""} found`}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{ position: "relative" }}>
              <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: THEME.textLight, pointerEvents: "none" }}
                xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input type="search" className="cl-search"
                placeholder="Search customers…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPageIndex(0); }}
              />
            </div>
            <AddBtn onClick={() => setShowModal(true)} />
          </div>
        </div>

        {/* ── Stats bar ── */}
        {!loading && custData.length > 0 && (
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            {[
              { label: "Total Customers", value: custData.length,                            color: THEME.brand,  bg: THEME.brandLight, border: "#D4C4A0" },
              { label: "With Company",    value: custData.filter((c) => c.company_name).length, color: "#2F54EB", bg: "#F0F5FF",        border: "#ADC6FF" },
              { label: "With Email",      value: custData.filter((c) => c.email).length,     color: "#389E0D",    bg: "#F6FFED",        border: "#B7EB8F" },
            ].map((s) => (
              <div key={s.label} style={{
                flex: "0 1 160px", background: "#fff", border: `1px solid ${s.border}`,
                borderRadius: 12, padding: "12px 16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: s.color, fontFamily: "'Sora',sans-serif" }}>{s.value}</span>
                </div>
                <span style={{ fontSize: 11, color: "#8C8C8C", fontWeight: 600, lineHeight: 1.3 }}>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0", gap: 16 }}>
            <div className="cl-spinner" />
            <p style={{ color: THEME.textLight, fontSize: 13, margin: 0 }}>Loading customers…</p>
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && sorted.length === 0 && (
          <div style={{ textAlign: "center", padding: "64px 0", background: "#fff", border: `1px solid ${THEME.border}`, borderRadius: 14 }}>
            <div style={{ fontSize: 38, marginBottom: 10 }}>🤝</div>
            <p style={{ color: THEME.textLight, fontSize: 14, margin: 0 }}>
              {search ? "No customers match your search." : "No customers found."}
            </p>
            {search && (
              <button onClick={() => setSearch("")} style={{ marginTop: 12, padding: "7px 16px", borderRadius: 10, border: `1px solid ${THEME.border}`, background: THEME.brandLight, color: THEME.brand, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                Clear search
              </button>
            )}
          </div>
        )}

        {/* ── Table ── */}
        {!loading && sorted.length > 0 && (
          <div className="cl-fade" style={{ background: "#fff", border: `1px solid ${THEME.border}`, borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 12px rgba(136,117,73,0.07)" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Sans',sans-serif" }}>
                <thead>
                  <tr style={{ background: THEME.brandLight }}>
                    {HEADERS.map((h, i) => {
                      const key = SORT_KEYS[i];
                      return (
                        <th key={h}
                          className={key ? "cl-th" : ""}
                          onClick={() => handleSort(key)}
                          style={{
                            padding: "11px 14px", fontSize: 11, fontWeight: 700,
                            color: sortKey === key ? THEME.brand : THEME.brandDark,
                            textTransform: "uppercase", letterSpacing: "0.07em",
                            borderBottom: "2px solid #D4C4A0", whiteSpace: "nowrap",
                            textAlign: HEADER_ALIGN[i],
                          }}>
                          {h}{key && sortIcon(key)}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((cust, idx) => (
                    <CustomerRow
                      key={cust.id}
                      cust={cust}
                      index={safePage * PAGE_SIZE + idx}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <Pagination
                page={safePage + 1} total={totalPages}
                canPrev={safePage > 0} canNext={safePage < totalPages - 1}
                onFirst={() => setPageIndex(0)}
                onPrev={() => setPageIndex((p) => p - 1)}
                onNext={() => setPageIndex((p) => p + 1)}
                onLast={() => setPageIndex(totalPages - 1)}
              />
            )}
          </div>
        )}
      </div>

      <AddModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        onSuccess={fetchCustomers}
      />
      <EditModal
        editshow={editShowModal}
        handleeditClose={() => { setEditShowModal(false); setClientId(null); }}
        clientId={clientId}
        onSuccess={fetchCustomers}
      />
    </>
  );
};

export default CustomerList;