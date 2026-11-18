import React, { useEffect, useMemo, useState } from "react";
import ApiService from "../../../services/ApiService";
import { fetchPms, getEmpPms, deletePms, updatePms } from "../../../config/config";
import { getToken, isEmp } from "../../../services/useLocalStorage";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import toast from "react-hot-toast";

const THEME = {
  brand: "#887549",
  brandLight: "#F5F0E8",
  brandMid: "#C4A97D",
  brandDark: "#5C4E32",
  border: "#EDE5D5",
  rowAlt: "#FEFCF9",
  rowHover: "#FDFAF5",
  text: "#1A1A2E",
  textMuted: "#ADADAD",
  textLight: "#BDBDBD",
  error: "#CF1322",
  errorLight: "#FFF1F0",
  errorBorder: "#FFA39E",
};

const SUB_FUNCTION = {
  0: "D.C.",
  1: "P.V.",
  2: "Fire NOC",
  3: "E-Nagar Portal",
  4: "B.Permission",
  5: "Basic Details",
  6: "Study/RND",
  7: "Quotation",
  8: "Design Concept",
  9: "Consultants",
  10: "Technical Drawings",
  11: "Schedule",
  12: "Risk Matrix",
};

const CATEGORY_OPTIONS = [
  "Design",
  "Working Detailing",
  "Client Meeting",
  "Checking Drawing",
  "Internal Discussion",
  "Stop Meeting",
  "Celebration",
  "Vendor/Contractor Discussion",
  "SMC Followup",
  "SMC Reporting",
  "Site Visit",
];

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fade-in { animation: fadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner {
    width: 28px; height: 28px; border-radius: 50%;
    border: 3px solid ${THEME.brandLight};
    border-top-color: ${THEME.brand};
    animation: spin 0.8s linear infinite;
  }

  .pms-input {
    width: 100%; padding: 7px 10px; border-radius: 8px;
    border: 1.5px solid #E0D5C5; font-size: 13px;
    font-family: 'DM Sans', sans-serif; color: ${THEME.text};
    outline: none; background: #fff;
  }
  .pms-input:focus {
    border-color: ${THEME.brand};
    box-shadow: 0 0 0 3px ${THEME.brand}18;
  }

  .pms-filter {
    padding: 8px 12px; border-radius: 9px;
    border: 1.5px solid #E0D5C5; font-size: 12.5px;
    font-family: 'DM Sans', sans-serif; color: ${THEME.text};
    outline: none; background: #fff; min-width: 160px;
  }
  .pms-filter:focus {
    border-color: ${THEME.brand};
    box-shadow: 0 0 0 3px ${THEME.brand}18;
  }

  .pms-page-btn {
    min-width: 30px; height: 30px; padding: 0 8px; border-radius: 8px;
    border: 1.5px solid #E0D5C5; background: #fff; cursor: pointer;
    font-size: 12.5px; font-weight: 600; color: ${THEME.text};
    font-family: 'DM Sans', sans-serif; transition: all 0.15s;
  }
  .pms-page-btn:hover:not(:disabled) {
    border-color: ${THEME.brand}; background: ${THEME.brandLight}; color: ${THEME.brand};
  }
  .pms-page-btn:disabled {
    cursor: not-allowed; opacity: 0.4;
  }
  .pms-page-btn.active {
    background: ${THEME.brand}; border-color: ${THEME.brand}; color: #fff;
  }
`;

const td = (center = false) => ({
  padding: "11px 14px",
  borderBottom: "1px solid #F5EFE4",
  verticalAlign: "middle",
  textAlign: center ? "center" : "left",
});

function EditBtn({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title="Edit"
      style={{
        width: 30, height: 30, borderRadius: 8, cursor: "pointer",
        background: hov ? THEME.brandLight : "#fff",
        border: `1px solid ${hov ? THEME.brand : "#E0D5C5"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M13.26 4L5.05 12.69c-.31.33-.61.98-.67 1.43l-.37 3.24c-.13 1.17.71 1.97 1.87 1.77l3.22-.55c.45-.08 1.08-.41 1.39-.75l8.21-8.69c1.42-1.5 2.06-3.21-.15-5.3C16.35 1.87 14.68 2.6 13.26 4Z"
          stroke={hov ? THEME.brand : "#657488"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.89 5.05c.43 2.76 2.67 4.87 5.45 5.15M3 22h18"
          stroke={hov ? THEME.brand : "#657488"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function DeleteBtn({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title="Delete"
      style={{
        width: 30, height: 30, borderRadius: 8, cursor: "pointer",
        background: hov ? "#FFF1F0" : "#fff",
        border: `1px solid ${hov ? "#FFA39E" : "#E0D5C5"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
        <path d="M17.5 4.98c-2.77-.27-5.57-.42-8.35-.42q-2.47 0-4.95.25l-1.7.17"
          stroke="#FF5275" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m7.08 4.14.18-1.09C7.4 2.26 7.5 1.67 8.91 1.67h2.18c1.41 0 1.52.62 1.64 1.39l.18 1.08"
          stroke="#FF5275" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m15.71 7.62-.54 8.39c-.09 1.31-.17 2.32-2.49 2.32h-5.35c-2.33 0-2.4-1.01-2.49-2.32l-.54-8.39"
          stroke="#FF5275" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.61 13.75h2.78M7.91 10.42h4.17"
          stroke="#FF5275" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function SaveBtn({ onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title="Save"
      style={{
        width: 30, height: 30, borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer",
        background: disabled ? "#C4C4C4" : THEME.brand,
        border: "none",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M20 6 9 17l-5-5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function CancelBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      title="Cancel"
      style={{
        width: 30, height: 30, borderRadius: 8, cursor: "pointer",
        background: "#fff", border: "1px solid #E0D5C5",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <path d="M18 6 6 18M6 6l12 12" stroke="#657488" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/** Combined case / sub-function / client cell */
function CaseCell({ subFunction, caseId, clientName }) {
  const label = SUB_FUNCTION[subFunction];
  const hasCase = caseId || clientName;

  if (!label && !hasCase) {
    return <span style={{ fontSize: 12, color: THEME.textLight }}>—</span>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 150 }}>
      {label && (
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          width: "fit-content",
          fontSize: 10.5,
          fontWeight: 700,
          color: "#2F54EB",
          background: "#F0F5FF",
          border: "1px solid #ADC6FF",
          borderRadius: 20,
          padding: "2px 9px",
          whiteSpace: "nowrap",
        }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#2F54EB", display: "inline-block" }} />
          {label}
        </span>
      )}
      {hasCase && (
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.35 }}>
          {caseId && (
            <span style={{ fontSize: 11.5, fontWeight: 600, color: THEME.text, fontFamily: "monospace, 'DM Sans'" }}>
              {caseId}
            </span>
          )}
          {clientName && (
            <span style={{ fontSize: 11.5, color: THEME.textMuted }}>
              {clientName}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/** Category badge shown in the list view */
function CategoryBadge({ category }) {
  if (!category) {
    return <span style={{ fontSize: 12, color: THEME.textLight }}>—</span>;
  }
  return (
    <span style={{
      display: "inline-block",
      fontSize: 10.5,
      fontWeight: 700,
      color: "#389E0D",
      background: "#F6FFED",
      border: "1px solid #B7EB8F",
      borderRadius: 20,
      padding: "2px 10px",
      whiteSpace: "nowrap",
    }}>
      {category}
    </span>
  );
}

// Normalizes a created_at value down to a YYYY-MM-DD string for date-only comparison.
function toDateOnly(value) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) {
    // Fallback: try to pull a leading date-like token out of the string
    const match = String(value).match(/\d{4}-\d{2}-\d{2}/);
    return match ? match[0] : String(value).slice(0, 10);
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Builds a compact page-number list with "…" gaps, e.g. [1, "…", 4, 5, 6, "…", 12]
function buildPageList(current, total) {
  const pages = [];
  const windowSize = 1;
  const add = (p) => pages.push(p);

  add(1);
  if (current - windowSize > 2) add("…");
  for (let p = Math.max(2, current - windowSize); p <= Math.min(total - 1, current + windowSize); p++) {
    add(p);
  }
  if (current + windowSize < total - 1) add("…");
  if (total > 1) add(total);

  return pages;
}

// Sums hours+minutes across a list of records into a normalized { hours, minutes } total.
function sumDuration(list) {
  let totalMinutes = 0;
  list.forEach((item) => {
    const h = Number(item.hours) || 0;
    const m = Number(item.minutes) || 0;
    totalMinutes += h * 60 + m;
  });
  const roundedMinutes = Math.round(totalMinutes);
  return {
    hours: Math.floor(roundedMinutes / 60),
    minutes: roundedMinutes % 60,
  };
}

function List() {
  const [pmsList, setPmsList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editId, setEditId] = useState(null);
  const [editTask, setEditTask] = useState("");
  const [editHours, setEditHours] = useState("");
  const [editMinutes, setEditMinutes] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [savingId, setSavingId] = useState(null);

  // Filter state
  const [filterProject, setFilterProject] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const authHeader = {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };

  const fetchList = async () => {
    try {
      setLoading(true);
      const pmsConfig = isEmp() ? getEmpPms : fetchPms;
      const res = await ApiService(null, 0, authHeader, pmsConfig.method, pmsConfig.url);
      if (!res.data.error) setPmsList(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load PMS records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  // Unique project options, keyed by case_id (falls back to client_name if no case_id)
  const projectOptions = useMemo(() => {
    const map = new Map();
    pmsList.forEach((item) => {
      const key = item.case_id || item.client_name;
      if (key && !map.has(key)) {
        map.set(key, item.client_name ? `${key} — ${item.client_name}` : key);
      }
    });
    return Array.from(map.entries()); // [key, label]
  }, [pmsList]);

  // Unique employee options
  const employeeOptions = useMemo(() => {
    const set = new Set();
    pmsList.forEach((item) => {
      if (item.first_name) set.add(item.first_name);
    });
    return Array.from(set);
  }, [pmsList]);

  // Unique category options actually present in the data (falls back to the full list)
  const categoryOptions = useMemo(() => {
    const set = new Set();
    pmsList.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return set.size ? Array.from(set) : CATEGORY_OPTIONS;
  }, [pmsList]);

  const filteredList = useMemo(() => {
    return pmsList.filter((item) => {
      if (filterProject) {
        const key = item.case_id || item.client_name;
        if (key !== filterProject) return false;
      }
      if (filterEmployee && item.first_name !== filterEmployee) return false;
      if (filterDate && toDateOnly(item.created_at) !== filterDate) return false;
      if (filterCategory && item.category !== filterCategory) return false;
      return true;
    });
  }, [pmsList, filterProject, filterEmployee, filterDate, filterCategory]);

  // Total hours/minutes for the currently selected employee (respects the other active filters too)
  const employeeTotal = useMemo(() => {
    if (!filterEmployee) return null;
    return sumDuration(filteredList);
  }, [filteredList, filterEmployee]);

  // Reset to page 1 whenever filters or the underlying data change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterProject, filterEmployee, filterDate, filterCategory, pmsList.length]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / pageSize));

  // Clamp currentPage if it ends up out of range (e.g. after pageSize change)
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, currentPage, pageSize]);

  const clearFilters = () => {
    setFilterProject("");
    setFilterEmployee("");
    setFilterDate("");
    setFilterCategory("");
  };

  const hasActiveFilters = filterProject || filterEmployee || filterDate || filterCategory;

  const startEdit = (item) => {
    setEditId(item.id);
    setEditTask(item.task);
    setEditHours(item.hours);
     setEditMinutes(item.minutes ?? "");
    setEditCategory(item.category ?? "");
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditTask("");
    setEditHours("");
    setEditMinutes("");
    setEditCategory("");
  };

  const saveEdit = async (id) => {
    if (!editTask.trim()) {
      toast.error("Task is required");
      return;
    }
    const hoursNum = Number(editHours);
     const minutesNum = Number(editMinutes) || 0;
    if (
    (hoursNum <= 0 && minutesNum <= 0) ||
    isNaN(hoursNum) ||
    isNaN(minutesNum) ||
    minutesNum >= 60 ||
    minutesNum < 0 ||
    hoursNum < 0
  ) {
    toast.error("Enter a valid duration");
    return;
  }
    try {
      setSavingId(id);
      const res = await ApiService(
        { id, task: editTask, hours: editHours, minutes: minutesNum, category: editCategory },
        0,
        authHeader,
        updatePms.method,
        updatePms.url
      );
      if (!res.data.error) {
        toast.success(res.data.message || "Updated successfully");
        cancelEdit();
        fetchList();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setSavingId(null);
    }
  };

  const confirmDelete = (id) => {
    SwalAlert({})
      .then(async (r) => {
        if (r?.isConfirmed) await handleDelete(id);
      })
      .catch(() => toast.error("Unable to remove"));
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const res = await ApiService(null, id, authHeader, deletePms.method, deletePms.url);
      if (!res.data.error) {
        toast.success(res.data.message || "Deleted successfully");
        fetchList();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const pageList = buildPageList(currentPage, totalPages);

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", padding: "28px 24px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{
            width: 4, height: 26, borderRadius: 3,
            background: `linear-gradient(180deg, ${THEME.brand} 0%, ${THEME.brandMid} 100%)`,
          }} />
          <h1 style={{
            margin: 0, fontSize: 22, fontWeight: 800, color: THEME.text,
            fontFamily: "'Sora', sans-serif", letterSpacing: "-0.3px",
          }}>
            PMS Entries
          </h1>
        </div>
        <p style={{ margin: "0 0 16px 12px", fontSize: 12, color: THEME.textMuted }}>
          {loading
            ? "Loading…"
            : `${filteredList.length} of ${pmsList.length} record${pmsList.length !== 1 ? "s" : ""} shown`}
        </p>

        {/* Filters */}
        <div style={{
          display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10,
          marginBottom: 18, padding: "14px 16px", background: "#fff",
          border: `1px solid ${THEME.border}`, borderRadius: 12,
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 10.5, fontWeight: 700, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Project
            </label>
            <select
              className="pms-filter"
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
            >
              <option value="">All Projects</option>
              {projectOptions.map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 10.5, fontWeight: 700, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Employee
            </label>
            <select
              className="pms-filter"
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
            >
              <option value="">All Employees</option>
              {employeeOptions.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 10.5, fontWeight: 700, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Category
            </label>
            <select
              className="pms-filter"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 10.5, fontWeight: 700, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Date
            </label>
            <input
              className="pms-filter"
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              style={{ minWidth: 150 }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 10.5, fontWeight: 700, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Per Page
            </label>
            <select
              className="pms-filter"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              style={{ minWidth: 90 }}
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          {/* Total hours/minutes badge for the selected employee */}
          {employeeTotal && (
            <div style={{
              display: "flex", flexDirection: "column", gap: 4, marginLeft: "auto",
            }}>
              <label style={{ fontSize: 10.5, fontWeight: 700, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {filterEmployee}'s Total
              </label>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: 13, fontWeight: 700, color: "#fff",
                background: `linear-gradient(135deg, ${THEME.brand} 0%, ${THEME.brandMid} 100%)`,
                borderRadius: 9, padding: "8px 14px", whiteSpace: "nowrap",
              }}>
                ⏱ {employeeTotal.hours}h {employeeTotal.minutes}m
              </span>
            </div>
          )}

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              style={{
                marginTop: 18, padding: "8px 14px", borderRadius: 9, cursor: "pointer",
                background: THEME.brandLight, border: `1px solid ${THEME.brand}`,
                color: THEME.brand, fontSize: 12.5, fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0", gap: 16 }}>
            <div className="spinner" />
            <p style={{ color: THEME.textLight, fontSize: 13, margin: 0 }}>Loading records…</p>
          </div>
        )}

        {/* Empty */}
        {!loading && filteredList.length === 0 && (
          <div style={{
            textAlign: "center", padding: "64px 0", background: "#fff",
            border: `1px solid ${THEME.border}`, borderRadius: 14,
          }}>
            <div style={{ fontSize: 38, marginBottom: 10 }}>🗒️</div>
            <p style={{ color: THEME.textLight, fontSize: 14, margin: 0 }}>
              {pmsList.length === 0 ? "No PMS entries found." : "No records match the selected filters."}
            </p>
          </div>
        )}

        {/* Table */}
        {!loading && filteredList.length > 0 && (
          <div className="fade-in" style={{
            background: "#fff", border: `1px solid ${THEME.border}`, borderRadius: 14,
            overflow: "hidden", boxShadow: "0 2px 12px rgba(136,117,73,0.07)",
          }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Sans', sans-serif" }}>
                <thead>
                  <tr style={{ background: THEME.brandLight }}>
                    {["#", "Task Update", "Category", "Project", "Hours", "Created By", "Created At", "Actions"].map((h) => (
                      <th key={h} style={{
                        padding: "11px 14px", fontSize: 11, fontWeight: 700, color: THEME.brand,
                        textTransform: "uppercase", letterSpacing: "0.07em",
                        borderBottom: "2px solid #D4C4A0",
                        textAlign: h === "#" || h === "Hours" ? "center" : "left",
                        whiteSpace: "nowrap",
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedList.map((item, idx) => {
                    const isEditing = editId === item.id;
                    const rowNumber = (currentPage - 1) * pageSize + idx + 1;
                    return (
                      <tr key={item.id} style={{ background: idx % 2 === 0 ? "#fff" : THEME.rowAlt }}>
                        <td style={td(true)}>{rowNumber}</td>

                        {/* Task Update */}
                        <td style={{ ...td(), maxWidth: 320 }}>
                          {isEditing ? (
                            <textarea
                              className="pms-input"
                              value={editTask}
                              onChange={(e) => setEditTask(e.target.value)}
                              rows={2}
                              style={{ resize: "vertical" }}
                            />
                          ) : (
                            <div>
                              {item.work && (
                                <span style={{
                                  display: "inline-block",
                                  fontSize: 10.5,
                                  fontWeight: 700,
                                  color: THEME.brand,
                                  background: THEME.brandLight,
                                  border: `1px solid ${THEME.border}`,
                                  borderRadius: 6,
                                  padding: "1px 7px",
                                  marginBottom: 4,
                                }}>
                                  {item.work}
                                </span>
                              )}
                              <div style={{ fontSize: 13, color: THEME.text, lineHeight: 1.4 }}>
                                {item.task}
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Category */}
                        <td style={td()}>
                          {isEditing ? (
                            <select
                              className="pms-input"
                              value={editCategory}
                              onChange={(e) => setEditCategory(e.target.value)}
                              style={{ minWidth: 140 }}
                            >
                              <option value="">Select…</option>
                              {CATEGORY_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : (
                            <CategoryBadge category={item.category} />
                          )}
                        </td>

                        {/* Case Details (sub-function + case id + client, merged) */}
                        <td style={td()}>
                          <CaseCell
                            subFunction={item.sub_function}
                            caseId={item.case_id}
                            clientName={item.client_name}
                          />
                        </td>

                        {/* Hours */}
                        <td style={td(true)}>
                          {isEditing ? (
                            <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                            <input
                              className="pms-input"
                              type="text"
                              inputMode="decimal"
                              value={editHours}
                              onChange={(e) => setEditHours(e.target.value)}
                              style={{ textAlign: "center", width: 70 }}
                            />
                            <input
        className="pms-input"
        type="text"
        inputMode="numeric"
        value={editMinutes}
        onChange={(e) => setEditMinutes(e.target.value)}
        placeholder="M"
        style={{ textAlign: "center", width: 50 }}
      />
    </div>
                          ) : (
                            <span style={{
                              fontSize: 12, fontWeight: 700, color: THEME.brand,
                              background: THEME.brandLight, border: `1px solid ${THEME.border}`,
                              borderRadius: 20, padding: "3px 12px", whiteSpace: "nowrap",
                            }}>
                             {item.hours || 0}h {item.minutes || 0}m
                            </span>
                          )}
                        </td>

                        {/* Created By */}
                        <td style={td()}>
                          <span style={{ fontSize: 12, color: "#595959" }}>
                            {item.first_name || "—"}
                          </span>
                        </td>

                        {/* Created At */}
                        <td style={td()}>
                          <span style={{ fontSize: 12, color: "#595959", whiteSpace: "nowrap" }}>
                            {item.created_at}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={td()}>
                          <div style={{ display: "flex", gap: 6 }}>
                            {isEditing ? (
                              <>
                                <SaveBtn onClick={() => saveEdit(item.id)} disabled={savingId === item.id} />
                                <CancelBtn onClick={cancelEdit} />
                              </>
                            ) : (
                              <>
                                <EditBtn onClick={() => startEdit(item)} />
                                <DeleteBtn onClick={() => confirmDelete(item.id)} />
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                flexWrap: "wrap", gap: 10,
                padding: "12px 16px", borderTop: `1px solid ${THEME.border}`,
              }}>
                <span style={{ fontSize: 12, color: THEME.textMuted }}>
                  Page {currentPage} of {totalPages}
                </span>

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button
                    className="pms-page-btn"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    ‹
                  </button>

                  {pageList.map((p, i) =>
                    p === "…" ? (
                      <span key={`ellipsis-${i}`} style={{ padding: "0 4px", fontSize: 12, color: THEME.textLight }}>
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        className={`pms-page-btn ${p === currentPage ? "active" : ""}`}
                        onClick={() => setCurrentPage(p)}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    className="pms-page-btn"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default List;