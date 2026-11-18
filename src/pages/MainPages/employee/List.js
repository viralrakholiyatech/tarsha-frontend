import React, { useEffect, useState, useMemo, useCallback, memo } from "react";
import { GetEmployees, DeleteEmployee } from "../../../services/EmployeeService";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Cordinator, getToken, isEmp } from "../../../services/useLocalStorage";
import toast from "react-hot-toast";
import { EmpRoute, login } from "../../../config/RouteConfig";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import { cordinator } from "../../../config/RoleConfig";
import TransferTaskModal from "./TransferTaskModal";
import { FileUrl } from "../../../config/file_url";


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
  @keyframes elFadeIn {
    from { opacity:0; transform:translateY(8px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .el-fade { animation: elFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes elSpin { to { transform:rotate(360deg); } }
  .el-spinner {
    width:28px; height:28px; border-radius:50%;
    border:3px solid ${THEME.brandLight};
    border-top-color:${THEME.brand};
    animation:elSpin 0.8s linear infinite;
  }
  /* Search input */
  .el-search {
    padding:8px 14px 8px 36px; border-radius:10px;
    border:1.5px solid #E0D5C5; font-size:13px;
    font-family:'DM Sans',sans-serif; color:#1A1A2E;
    outline:none; background:#fff; width:220px;
    transition:border-color 0.15s, width 0.2s;
  }
  .el-search:focus { border-color:${THEME.brand}; box-shadow:0 0 0 3px ${THEME.brand}18; width:260px; }
  .el-search::placeholder { color:${THEME.textLight}; }

  /* Sort arrow */
  .el-th-sort { cursor:pointer; user-select:none; white-space:nowrap; }
  .el-th-sort:hover { color:${THEME.brand}; }

  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background:${THEME.brandLight}; }
  ::-webkit-scrollbar-thumb { background:${THEME.brandMid}; border-radius:10px; }
`;


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
      + Add Member
    </button>
  );
}

function StatusBadge({ active }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: active ? "#F6FFED" : "#FFF1F0",
      color:       active ? "#389E0D" : "#CF1322",
      border:     `1px solid ${active ? "#B7EB8F" : "#FFA39E"}`,
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: active ? "#389E0D" : "#CF1322" }} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

/** Edit icon */
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

/** Delete (trash) icon */
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

// /** View (eye) icon */
// function ViewIconBtn({ to }) {
//   const [hov, setHov] = useState(false);
//   return (
//     <Link to={to} title="View Profile"
//       onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
//       style={{ color: hov ? THEME.brand : "#657488", transition: "color 0.15s", padding: 4, display: "inline-flex" }}>
//       <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none">
//         <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
//         <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
//       </svg>
//     </Link>
//   );
// }

/** Transfer icon btn — shown for inactive employees */
function TransferIconBtn({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} title="Transfer Tasks"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, opacity: hov ? 1 : 0.7, transition: "opacity 0.15s" }}>
      <img src={`${FileUrl}/img/icons/transfer.svg`} alt="Transfer" style={{ width: 16, height: 16 }} />
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

/** Stats bar */
function StatsBar({ employees }) {
  const total    = employees.length;
  const active   = employees.filter((e) => e._active).length;
  const inactive = total - active;

  const stats = [
    { label: "Total",    value: total,    color: THEME.brand, bg: THEME.brandLight, border: "#D4C4A0" },
    { label: "Active",   value: active,   color: "#389E0D",   bg: "#F6FFED",        border: "#B7EB8F" },
    { label: "Inactive", value: inactive, color: "#CF1322",   bg: "#FFF1F0",        border: "#FFA39E" },
  ];

  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
      {stats.map((s) => (
        <div key={s.label} style={{
          flex: "0 1 150px", background: "#fff", border: `1px solid ${s.border}`,
          borderRadius: 12, padding: "12px 16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, border: `1px solid ${s.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</span>
          </div>
          <span style={{ fontSize: 12, color: "#8C8C8C", fontWeight: 600 }}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
//  TABLE ROW  — memo for performance
// ─────────────────────────────────────────────
const EmpRow = memo(({ emp, index, onEdit, onDelete, onTransfer }) => {
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
      <td style={tdStyle(true)}>{index + 1}</td>

      {/* Name + profile link */}
      <td style={tdStyle()}>
        <Link
          to={`/${EmpRoute.team_profile_details}/${emp._id}`}
          style={{ fontSize: 13, fontWeight: 600, color: THEME.text, textDecoration: "none" }}
          onClick={() => localStorage.setItem("selectedEmployeeName", emp._firstName)}
        >
          {emp._firstName} {emp._lastName}
        </Link>
      </td>

      <td style={tdStyle()}>
        <span style={{ fontSize: 12, color: "#595959" }}>{emp.email || "—"}</span>
      </td>

      <td style={tdStyle()}>
        <span style={{ fontSize: 12, color: "#595959", whiteSpace: "nowrap" }}>{emp.phone || "—"}</span>
      </td>

      <td style={tdStyle()}>
        {emp.departmentName ? (
          <span style={{
            display: "inline-block", padding: "2px 10px", borderRadius: 20,
            fontSize: 11, fontWeight: 600, background: THEME.brandLight,
            color: THEME.brandDark, border: `1px solid #D4C4A0`,
          }}>
            {emp.departmentName}
          </span>
        ) : "—"}
      </td>

      <td style={tdStyle()}>
        <span style={{ fontSize: 12, color: "#595959" }}>{emp.RolesName || "—"}</span>
      </td>

      <td style={tdStyle()}>
        <StatusBadge active={emp._active} />
      </td>

      <td style={tdStyle()}>
        <span style={{ fontSize: 12, color: "#595959", whiteSpace: "nowrap" }}>{emp.created_at || "—"}</span>
      </td>

      {/* Actions */}
      {!Cordinator(cordinator) && (
        <td style={{ ...tdStyle(true), whiteSpace: "nowrap" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
            {/* <ViewIconBtn to={`/${EmpRoute.team_profile_details}/${emp._id}`} /> */}
            <EditIconBtn onClick={() => onEdit(emp._id)} />
            <DeleteIconBtn onClick={() => onDelete(emp._id)} />
            {!emp._active && <TransferIconBtn onClick={() => onTransfer(emp._id)} />}
          </div>
        </td>
      )}
    </tr>
  );
});

const tdStyle = (center = false) => ({
  padding: "11px 14px",
  borderBottom: "1px solid #F5EFE4",
  verticalAlign: "middle",
  textAlign: center ? "center" : "left",
});

const HEADERS = ["#", "Name", "Email", "Mobile", "Department", "Role", "Status", "Created At", "Actions"];
const SORT_KEYS = [null, "_firstName", "email", "phone", "departmentName", "RolesName", "_active", "created_at", null];


// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const EmployeeList = () => {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [employees,  setEmployees]  = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [search,     setSearch]     = useState("");
  const [pageIndex,  setPageIndex]  = useState(0);
  const [sortKey,    setSortKey]    = useState("_firstName");
  const [sortAsc,    setSortAsc]    = useState(true);
  const [showModal,  setShowModal]  = useState(false);
  const [editId,     setEditId]     = useState(null);

  // ── Fetch ─────────────────────────────────

  const getEmployeeData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await GetEmployees(getToken());
      if (!res.data.error) {
        const payload = res.data.data || [];
        setEmployees(payload.map((e) => ({
          _id:        e.id,
          _firstName: e.first_name,
          _lastName:  e.last_name,
          _active:    !!e.active,
          email:       e.email,
          phone:       e.phone,
          departmentName: e.departmentName,
          RolesName:   e.RolesName,
          created_at:  e.created_at,
        })));
      } else {
        toast.error(res.data.message);
        setTimeout(() => navigate(`/${login.list}`, { state: { from: location }, replace: true }), 1500);
      }
    } catch (err) {
      setLoading(false);
      if (err?.response?.data?.error) {
        toast.error(err.response.data.message);
        setTimeout(() => navigate(`/${login.list}`, { state: { from: location }, replace: true }), 1500);
      }
    }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { getEmployeeData(); }, []);

  // ── Delete ────────────────────────────────

  const handleDelete = useCallback((id) => {
    SwalAlert({}).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await DeleteEmployee(id, getToken());
          if (!res.data.error) {
            toast.success(res.data.message);
            setEmployees((prev) => prev.filter((e) => e._id !== id));
          } else { toast.error(res.data.message); }
        } catch (err) {
          toast.error(err?.response?.data?.message || "Something went wrong");
        }
      }
    });
  }, []);

  const handleEdit     = useCallback((id) => navigate(`/${EmpRoute.edit}/${id}`), []);
  const handleTransfer = useCallback((id) => { setEditId(id); setShowModal(true); }, []);

  // ── Filter + Sort + Paginate ──────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return employees.filter((e) =>
      !q ||
      `${e._firstName} ${e._lastName}`.toLowerCase().includes(q) ||
      e.email?.toLowerCase().includes(q) ||
      e.phone?.includes(q) ||
      e.departmentName?.toLowerCase().includes(q) ||
      e.RolesName?.toLowerCase().includes(q)
    );
  }, [employees, search]);

  // const sorted = useMemo(() => {
  //   if (!sortKey) return filtered;
  //   return [...filtered].sort((a, b) => {
  //     const av = String(a[sortKey] ?? "").toLowerCase();
  //     const bv = String(b[sortKey] ?? "").toLowerCase();
  //     return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
  //   });
  // }, [filtered, sortKey, sortAsc]);

  const sorted = useMemo(() => {
  let data = [...filtered];

  // Always show active employees first
  data.sort((a, b) => {
    if (a._active === b._active) return 0;
    return a._active ? -1 : 1; // active first
  });

  // Then apply selected column sorting
  if (sortKey) {
    data.sort((a, b) => {
      const av = String(a[sortKey] ?? "").toLowerCase();
      const bv = String(b[sortKey] ?? "").toLowerCase();

      if (a._active !== b._active) {
        return a._active ? -1 : 1; // keep active first
      }

      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }

  return data;
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

      <div style={{ minHeight: "100vh", fontFamily: "'DM Sans',sans-serif", padding: "28px 24px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ width: 4, height: 26, borderRadius: 3, background: `linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: THEME.text, fontFamily: "'Sora',sans-serif", letterSpacing: "-0.3px" }}>
                All Team Members
              </h1>
            </div>
            <p style={{ margin: "0 0 0 12px", fontSize: 12, color: THEME.textMuted }}>
              {loading ? "Loading…" : `${filtered.length} member${filtered.length !== 1 ? "s" : ""} found`}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{ position: "relative" }}>
              <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: THEME.textLight, pointerEvents: "none" }}
                xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input type="search" className="el-search"
                placeholder="Search members…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPageIndex(0); }}
              />
            </div>
            <AddBtn onClick={() => navigate(`/${EmpRoute.add}`)} />
          </div>
        </div>

        {/* Stats */}
        {!loading && employees.length > 0 && <StatsBar employees={employees} />}

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0", gap: 16 }}>
            <div className="el-spinner" />
            <p style={{ color: THEME.textLight, fontSize: 13, margin: 0 }}>Loading team members…</p>
          </div>
        )}

        {/* Empty */}
        {!loading && sorted.length === 0 && (
          <div style={{ textAlign: "center", padding: "64px 0", background: "#fff", border: `1px solid ${THEME.border}`, borderRadius: 14 }}>
            <div style={{ fontSize: 38, marginBottom: 10 }}>👥</div>
            <p style={{ color: THEME.textLight, fontSize: 14, margin: 0 }}>
              {search ? "No members match your search." : "No team members found."}
            </p>
            {search && (
              <button onClick={() => setSearch("")} style={{ marginTop: 12, padding: "7px 16px", borderRadius: 10, border: `1px solid ${THEME.border}`, background: THEME.brandLight, color: THEME.brand, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Table */}
        {!loading && sorted.length > 0 && (
          <div className="el-fade" style={{ background: "#fff", border: `1px solid ${THEME.border}`, borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 12px rgba(136,117,73,0.07)" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Sans',sans-serif" }}>
                <thead>
                  <tr style={{ background: THEME.brandLight }}>
                    {HEADERS.map((h, i) => {
                      const key = SORT_KEYS[i];
                      return (
                        <th key={h}
                          className={key ? "el-th-sort" : ""}
                          onClick={() => handleSort(key)}
                          style={{
                            padding: "11px 14px", fontSize: 11, fontWeight: 700, color: sortKey === key ? THEME.brand : THEME.brandDark,
                            textTransform: "uppercase", letterSpacing: "0.07em",
                            borderBottom: "2px solid #D4C4A0",
                            textAlign: (i === 0 || i === HEADERS.length - 1) ? "center" : "left",
                            whiteSpace: "nowrap",
                          }}>
                          {h}{key && sortIcon(key)}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((emp, idx) => (
                    <EmpRow
                      key={emp._id}
                      emp={emp}
                      index={safePage * PAGE_SIZE + idx}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onTransfer={handleTransfer}
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

      <TransferTaskModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        id={editId}
      />
    </>
  );
};

export default EmployeeList;