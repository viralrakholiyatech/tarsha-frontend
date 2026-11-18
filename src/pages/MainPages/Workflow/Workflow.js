import React, { useEffect, useState, useMemo, useCallback } from "react";
import Select from "react-select";
import toast from "react-hot-toast";
import ApiService from "../../../services/ApiService";
import {
  fetchtaskforAdmin,
  fetchtaskforHod,
  updateTaskcheck,
  fetchActiveEmployee,
  fetchPms,
  getWorkflowMeetingClarity,
  getWorkflowTeamMembers,
} from "../../../config/config";
import { getToken, isAdmin, ishod, getUserId } from "../../../services/useLocalStorage";
import { FileUrl } from "../../../config/file_url";
import PerformanceModal from "../Meeting/Components/PerformanceModal";
import ClarityFocusModal from "../Meeting/Components/ClarityFocusModal";

// ─────────────────────────────────────────────
//  🎨  THEME
// ─────────────────────────────────────────────
const THEME = {
  brand: "#887549",
  brandLight: "#F5F0E8",
  brandMid: "#C4A97D",
  brandDark: "#5C4E32",
  bg: "#F8F5F0",
  cardBg: "#FFFFFF",
  border: "#EDE5D5",
  borderLight: "#F0EBE0",
  text: "#1A1A2E",
  textMuted: "#8C8C8C",
  textLight: "#BDBDBD",
  doneBg: "#F6FFED",
  doneBorder: "#B7EB8F",
  doneText: "#389E0D",
  pendingBg: "#FFF7E6",
  pendingBorder: "#FFD591",
  pendingText: "#D46B08",
  clarity1Bg: "#E6F7F0",
  clarity1Border: "#B5E8D5",
  clarity2Bg: "#FFF7E6",
  clarity2Border: "#FFE2B3",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  
  .wf-root {
    min-height: 100vh;
    background: ${THEME.bg};
    font-family: 'DM Sans', sans-serif;
    padding: 24px 28px;
    box-sizing: border-box;
    color: ${THEME.text};
  }

  @keyframes wfFadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .wf-fade { animation: wfFadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1) both; }

  @keyframes wfSpin {
    to { transform: rotate(360deg); }
  }
  .wf-spinner {
    width: 22px; height: 22px; border-radius: 50%;
    border: 2.5px solid ${THEME.brandLight};
    border-top-color: ${THEME.brand};
    animation: wfSpin 0.7s linear infinite;
    display: inline-block;
  }

  /* Grid Layouts */
  .wf-3col-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(320px, 1fr));
    gap: 20px;
    align-items: start;
  }
  @media (max-width: 1200px) {
    .wf-3col-grid {
      grid-template-columns: 1fr;
    }
  }

  .wf-stacked-grid {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  /* Column Container */
  .wf-column {
    background: #FFFFFF;
    border: 1.5px solid ${THEME.border};
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 18px rgba(136, 117, 73, 0.05);
    display: flex;
    flex-direction: column;
    min-height: 520px;
  }

  .wf-col-header {
    padding: 16px 20px;
    background: #FDFAF5;
    border-bottom: 1.5px solid ${THEME.border};
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .wf-col-body {
    padding: 16px;
    overflow-y: auto;
    max-height: 720px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .wf-col-body::-webkit-scrollbar { width: 5px; }
  .wf-col-body::-webkit-scrollbar-track { background: ${THEME.brandLight}; }
  .wf-col-body::-webkit-scrollbar-thumb { background: ${THEME.brandMid}; border-radius: 6px; }

  /* Item Cards */
  .wf-card {
    background: #FFFFFF;
    border: 1.2px solid ${THEME.border};
    border-radius: 12px;
    padding: 14px;
    transition: all 0.15s ease;
  }
  .wf-card:hover {
    border-color: ${THEME.brandMid};
    box-shadow: 0 4px 14px rgba(136, 117, 73, 0.08);
  }

  /* Checkbox Item */
  .wf-checkbox {
    width: 18px;
    height: 18px;
    accent-color: ${THEME.brand};
    cursor: pointer;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .wf-btn {
    border: none;
    outline: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.15s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
`;

// Priority Configurations
const PRIORITY_CFG = {
  2: { label: "High", color: "#CF1322", bg: "#FFF1F0", border: "#FFA39E" },
  1: { label: "Medium", color: "#D46B08", bg: "#FFF7E6", border: "#FFD591" },
  0: { label: "Low", color: "#389E0D", bg: "#F6FFED", border: "#B7EB8F" },
};

const selectStyles = {
  control: (base, state) => ({
    ...base,
    borderRadius: 10,
    borderColor: state.isFocused ? THEME.brand : "#E0D5C5",
    boxShadow: state.isFocused ? `0 0 0 3px ${THEME.brand}22` : "none",
    fontSize: 13,
    minHeight: 38,
    minWidth: 220,
    fontFamily: "'DM Sans', sans-serif",
    "&:hover": { borderColor: THEME.brand },
  }),
  option: (base, state) => ({
    ...base,
    fontSize: 13,
    background: state.isSelected
      ? THEME.brand
      : state.isFocused
      ? THEME.brandLight
      : "#fff",
    color: state.isSelected ? "#fff" : THEME.text,
    fontFamily: "'DM Sans', sans-serif",
  }),
  singleValue: (base) => ({ ...base, fontSize: 13, color: THEME.text, fontWeight: 500 }),
  menu: (base) => ({
    ...base,
    borderRadius: 10,
    border: `1px solid ${THEME.border}`,
    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
    zIndex: 9999,
  }),
};

// Date helpers
const toDateStr = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const getTodayStr = () => toDateStr(new Date());

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// ─────────────────────────────────────────────
//  WORKFLOW MAIN COMPONENT
// ─────────────────────────────────────────────
const Workflow = () => {
  const userIsAdmin = useMemo(() => isAdmin(), []);
  const userIsHod = useMemo(() => ishod(), []);
  const defaultLabel = userIsAdmin ? "All Team Members" : "All Department Members";

  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [teamMembers, setTeamMembers] = useState([]);
  const [departmentName, setDepartmentName] = useState("");
  const [selectedTeam, setSelectedTeam] = useState({
    value: "",
    label: defaultLabel,
  });

  // Layout View mode: 3-column side-by-side or stacked
  const [viewMode, setViewMode] = useState("columns"); // 'columns' | 'stacked'

  // Data states
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [taskFilter, setTaskFilter] = useState("all"); // 'all' | 'pending' | 'completed'

  const [loadingPms, setLoadingPms] = useState(false);
  const [pmsList, setPmsList] = useState([]);
  const [pmsCategoryFilter, setPmsCategoryFilter] = useState("all");

  const [loadingClarity, setLoadingClarity] = useState(false);
  const [clarityData, setClarityData] = useState([]);

  // Modals for editing Top 2-3 Outcomes and Focus Goals
  const [editClarityId, setEditClarityId] = useState(null);
  const [showTopModal, setShowTopModal] = useState(false);
  const [showFocusModal, setShowFocusModal] = useState(false);

  const authHeader = useMemo(
    () => ({
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    }),
    []
  );

  // Allowed member IDs for HOD department scoping
  const allowedMemberIds = useMemo(() => {
    return teamMembers.map((m) => String(m.value)).filter(Boolean);
  }, [teamMembers]);

  // ── Fetch active team members (department-scoped for HOD) ──
  const fetchEmployees = useCallback(async () => {
    try {
      const res = await ApiService(
        null,
        0,
        authHeader,
        getWorkflowTeamMembers.method,
        getWorkflowTeamMembers.url
      );
      if (!res.data.error) {
        const isServerAdmin = res.data.isAdmin;
        const allOptionLabel = isServerAdmin ? "All Team Members" : "All Department Members";
        const members = res.data.data || [];
        if (members.length > 0 && members[0].department_name) {
          setDepartmentName(members[0].department_name);
        }

        // Deduplicate team members by user id
        const seenIds = new Set();
        const opts = [];
        members.forEach((m) => {
          const idStr = String(m.id);
          if (idStr && !seenIds.has(idStr)) {
            seenIds.add(idStr);
            const fullName = `${m.first_name || ""} ${m.last_name || ""}`.trim();
            opts.push({
              value: idStr,
              label: fullName || `User #${idStr}`,
              profile_picture: m.profile_picture,
              department_name: m.department_name,
            });
          }
        });

        setTeamMembers([{ value: "", label: allOptionLabel }, ...opts]);
        setSelectedTeam((prev) => (prev && prev.value ? prev : { value: "", label: allOptionLabel }));
      }
    } catch (err) {
      console.error("Failed to load employees", err);
    }
  }, [authHeader]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // ── 1. Fetch Tasks (Todos) ──
  const loadTasks = useCallback(async () => {
    setLoadingTasks(true);
    try {
      const params = new URLSearchParams();
      params.append("start_date", selectedDate);
      params.append("end_date", selectedDate);
      if (selectedTeam?.value) {
        params.append("assign_to", selectedTeam.value);
      }
      const qs = `?${params.toString()}`;
      // Use HOD-specific task endpoint if current user is HOD and not superadmin
      const taskApiConfig = userIsHod && !userIsAdmin ? fetchtaskforHod : fetchtaskforAdmin;
      const res = await ApiService(
        null,
        0,
        authHeader,
        taskApiConfig.method,
        `${taskApiConfig.url}${qs}`
      );
      if (!res.data.error) {
        setTasks(res.data.data || []);
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error("Error loading tasks", err);
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  }, [selectedDate, selectedTeam, authHeader, userIsHod, userIsAdmin]);

  // ── 2. Fetch PMS ──
  const loadPms = useCallback(async () => {
    setLoadingPms(true);
    try {
      const params = new URLSearchParams();
      params.append("date", selectedDate);
      if (selectedTeam?.value) {
        params.append("user_id", selectedTeam.value);
      }
      const qs = `?${params.toString()}`;
      const res = await ApiService(
        null,
        0,
        authHeader,
        fetchPms.method,
        `${fetchPms.url}${qs}`
      );
      if (!res.data.error) {
        const data = res.data.data || [];
        // Apply robust client-side filter fallback for date & user
        const filtered = data.filter((item) => {
          // Check date match
          if (item.date_raw) {
            if (item.date_raw !== selectedDate) return false;
          } else if (item.created_at) {
            const d = new Date(item.created_at);
            if (!isNaN(d)) {
              if (toDateStr(d) !== selectedDate) return false;
            }
          }
          // Check team user match
          if (selectedTeam?.value) {
            const uid = String(item.user_id || item.created_by || "");
            if (uid && uid !== String(selectedTeam.value)) return false;
            if (!uid && selectedTeam.label && item.first_name) {
              if (!selectedTeam.label.toLowerCase().includes(item.first_name.toLowerCase())) {
                return false;
              }
            }
          } else if (!userIsAdmin && userIsHod && allowedMemberIds.length > 0) {
            // For HOD viewing all department members, ensure user is within department members
            const uid = String(item.user_id || item.created_by || "");
            if (uid && !allowedMemberIds.includes(uid)) return false;
          }
          return true;
        });
        setPmsList(filtered);
      } else {
        setPmsList([]);
      }
    } catch (err) {
      console.error("Error loading PMS", err);
      setPmsList([]);
    } finally {
      setLoadingPms(false);
    }
  }, [selectedDate, selectedTeam, authHeader, userIsAdmin, userIsHod, allowedMemberIds]);

  // ── 3. Fetch Operation Meeting Clarity (Top 2-3 Outcomes & Focus Goals) ──
  const loadClarity = useCallback(async () => {
    setLoadingClarity(true);
    try {
      const params = new URLSearchParams();
      params.append("date", selectedDate);
      if (selectedTeam?.value) {
        params.append("user_id", selectedTeam.value);
      }
      const qs = `?${params.toString()}`;
      const res = await ApiService(
        null,
        0,
        authHeader,
        getWorkflowMeetingClarity.method,
        `${getWorkflowMeetingClarity.url}${qs}`
      );
      if (!res.data.error) {
        let payload = res.data.data || [];
        if (!userIsAdmin && userIsHod && !selectedTeam?.value && allowedMemberIds.length > 0) {
          payload = payload.filter((c) => allowedMemberIds.includes(String(c.user_id)));
        }
        setClarityData(payload);
      } else {
        setClarityData([]);
      }
    } catch (err) {
      console.error("Error loading Meeting Clarity", err);
      setClarityData([]);
    } finally {
      setLoadingClarity(false);
    }
  }, [selectedDate, selectedTeam, authHeader, userIsAdmin, userIsHod, allowedMemberIds]);

  // Trigger loads when date or selected team changes
  const reloadAll = useCallback(() => {
    loadTasks();
    loadPms();
    loadClarity();
  }, [loadTasks, loadPms, loadClarity]);

  useEffect(() => {
    reloadAll();
  }, [reloadAll]);

  // Handle task status toggle
  const handleTaskStatusToggle = async (taskId, currentStatus) => {
    const nextStatus = currentStatus === 1 || currentStatus === "1" ? "0" : "1";
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: nextStatus === "1" ? 1 : 0 } : t
      )
    );
    try {
      const res = await ApiService(
        { task_id: taskId, status: nextStatus },
        0,
        authHeader,
        updateTaskcheck.method,
        updateTaskcheck.url
      );
      if (!res.data.error) {
        toast.success(nextStatus === "1" ? "Task marked completed" : "Task marked pending");
      } else {
        toast.error("Failed to update status");
        loadTasks();
      }
    } catch (err) {
      toast.error("Failed to update task");
      loadTasks();
    }
  };

  // Date navigation
  const shiftDate = (days) => {
    const cur = new Date(selectedDate + "T00:00:00");
    cur.setDate(cur.getDate() + days);
    setSelectedDate(toDateStr(cur));
  };

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const isDone = t.status === 1 || t.status === "1";
      if (taskFilter === "pending") return !isDone;
      if (taskFilter === "completed") return isDone;
      return true;
    });
  }, [tasks, taskFilter]);

  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 1 || t.status === "1").length;
    const pending = total - completed;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, pct };
  }, [tasks]);

  // Unique categories in PMS
  const pmsCategories = useMemo(() => {
    const set = new Set();
    pmsList.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [pmsList]);

  // Filtered PMS
  const filteredPms = useMemo(() => {
    return pmsList.filter((item) => {
      if (pmsCategoryFilter !== "all" && item.category !== pmsCategoryFilter) {
        return false;
      }
      return true;
    });
  }, [pmsList, pmsCategoryFilter]);

  // PMS total hours calculation
  const pmsTotalTime = useMemo(() => {
    let mins = 0;
    filteredPms.forEach((p) => {
      const h = Number(p.hours) || 0;
      const m = Number(p.minutes) || 0;
      mins += h * 60 + m;
    });
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return { hours, minutes, totalMins: mins };
  }, [filteredPms]);

  return (
    <>
      <style>{CSS}</style>

      <div className="wf-root">
        {/* ── Top Bar / Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 4,
                  height: 28,
                  borderRadius: 3,
                  background: `linear-gradient(180deg, ${THEME.brand} 0%, ${THEME.brandMid} 100%)`,
                }}
              />
              <h1
                style={{
                  margin: 0,
                  fontSize: 24,
                  fontWeight: 800,
                  fontFamily: "'Sora', sans-serif",
                  color: THEME.text,
                  letterSpacing: "-0.4px",
                }}
              >
                Daily Workflow
              </h1>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  background: THEME.brandLight,
                  color: THEME.brandDark,
                  border: `1px solid ${THEME.brandMid}`,
                }}
              >
                {userIsAdmin
                  ? "ADMIN DASHBOARD"
                  : departmentName
                  ? `HOD DASHBOARD • ${departmentName.toUpperCase()}`
                  : "HOD DASHBOARD"}
              </span>
            </div>
            <p
              style={{
                margin: "4px 0 0 14px",
                fontSize: 13,
                color: THEME.textMuted,
              }}
            >
              Unified view of Tasks, PMS Time Logs, and Operation Meeting Outcomes & Goals
            </p>
          </div>

          {/* View mode toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#FFFFFF",
              border: `1.5px solid ${THEME.border}`,
              borderRadius: 10,
              padding: 3,
              gap: 2,
            }}
          >
            <button
              onClick={() => setViewMode("columns")}
              style={{
                padding: "6px 12px",
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                background: viewMode === "columns" ? THEME.brand : "transparent",
                color: viewMode === "columns" ? "#fff" : THEME.textMuted,
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.15s ease",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="3" width="5" height="18" rx="1" />
                <rect x="10" y="3" width="5" height="18" rx="1" />
                <rect x="17" y="3" width="5" height="18" rx="1" />
              </svg>
              3 Columns
            </button>
            <button
              onClick={() => setViewMode("stacked")}
              style={{
                padding: "6px 12px",
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                background: viewMode === "stacked" ? THEME.brand : "transparent",
                color: viewMode === "stacked" ? "#fff" : THEME.textMuted,
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.15s ease",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="3" width="18" height="5" rx="1" />
                <rect x="3" y="10" width="18" height="5" rx="1" />
                <rect x="3" y="17" width="18" height="5" rx="1" />
              </svg>
              Stacked
            </button>
          </div>
        </div>

        {/* ── Filters Bar ── */}
        <div
          style={{
            background: "#FFFFFF",
            border: `1.5px solid ${THEME.border}`,
            borderRadius: 14,
            padding: "16px 20px",
            marginBottom: 20,
            boxShadow: "0 2px 10px rgba(136, 117, 73, 0.04)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          {/* Left filters: Date & Team */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            {/* Team Filter */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: THEME.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Team Member
              </span>
              <div style={{ minWidth: 230 }}>
                <Select
                  value={selectedTeam}
                  onChange={(opt) => setSelectedTeam(opt || { value: "", label: "All Team Members" })}
                  options={teamMembers}
                  styles={selectStyles}
                  placeholder="Select Team Member"
                  isClearable={false}
                />
              </div>
            </div>

            {/* Date Filter */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: THEME.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Workflow Date
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                  type="button"
                  onClick={() => shiftDate(-1)}
                  className="wf-btn"
                  title="Previous Day"
                  style={{
                    padding: "8px 10px",
                    background: "#FFFFFF",
                    border: "1.5px solid #E0D5C5",
                    color: THEME.text,
                  }}
                >
                  ◀
                </button>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "1.5px solid #E0D5C5",
                    fontSize: 13,
                    fontFamily: "'DM Sans', sans-serif",
                    color: THEME.text,
                    background: "#FFFFFF",
                    outline: "none",
                    fontWeight: 600,
                  }}
                />
                <button
                  type="button"
                  onClick={() => shiftDate(1)}
                  className="wf-btn"
                  title="Next Day"
                  style={{
                    padding: "8px 10px",
                    background: "#FFFFFF",
                    border: "1.5px solid #E0D5C5",
                    color: THEME.text,
                  }}
                >
                  ▶
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDate(getTodayStr())}
                  className="wf-btn"
                  style={{
                    padding: "8px 12px",
                    background: selectedDate === getTodayStr() ? THEME.brandLight : "#FFFFFF",
                    border: `1.5px solid ${selectedDate === getTodayStr() ? THEME.brand : "#E0D5C5"}`,
                    color: selectedDate === getTodayStr() ? THEME.brand : THEME.text,
                  }}
                >
                  Today
                </button>
              </div>
            </div>
          </div>

          {/* Right info & Refresh button */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: THEME.text,
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                {formatDisplayDate(selectedDate)}
              </div>
              <div style={{ fontSize: 11, color: THEME.textMuted }}>
                {selectedTeam.label}
              </div>
            </div>

            <button
              onClick={reloadAll}
              className="wf-btn"
              style={{
                padding: "8px 14px",
                background: THEME.brand,
                color: "#FFFFFF",
                borderRadius: 10,
              }}
              title="Refresh all data"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* ── Top Summary / KPI Cards ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {/* Tasks KPI */}
          <div
            style={{
              background: "#FFFFFF",
              border: `1.5px solid ${THEME.border}`,
              borderRadius: 14,
              padding: "16px 20px",
              boxShadow: "0 2px 10px rgba(136, 117, 73, 0.04)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: THEME.textMuted, textTransform: "uppercase" }}>
                Tasks (Todos)
              </span>
              <span
                style={{
                  background: THEME.brandLight,
                  color: THEME.brandDark,
                  padding: "2px 8px",
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {taskStats.pct}% Done
              </span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Sora', sans-serif", color: THEME.text }}>
              {taskStats.total} <span style={{ fontSize: 13, fontWeight: 600, color: THEME.textMuted }}>Tasks</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6, fontSize: 12 }}>
              <span style={{ color: "#389E0D", fontWeight: 600 }}>✓ {taskStats.completed} completed</span>
              <span style={{ color: "#D46B08", fontWeight: 600 }}>⏳ {taskStats.pending} pending</span>
            </div>
          </div>

          {/* PMS KPI */}
          <div
            style={{
              background: "#FFFFFF",
              border: `1.5px solid ${THEME.border}`,
              borderRadius: 14,
              padding: "16px 20px",
              boxShadow: "0 2px 10px rgba(136, 117, 73, 0.04)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: THEME.textMuted, textTransform: "uppercase" }}>
                PMS Work Time
              </span>
              <span
                style={{
                  background: "#E6F7F0",
                  color: "#08979C",
                  padding: "2px 8px",
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                Logged
              </span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Sora', sans-serif", color: THEME.brand }}>
              {pmsTotalTime.hours}h {pmsTotalTime.minutes}m
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, fontSize: 12, color: THEME.textMuted }}>
              <span>{filteredPms.length} entries recorded</span>
            </div>
          </div>

          {/* Op Meeting Clarity KPI */}
          <div
            style={{
              background: "#FFFFFF",
              border: `1.5px solid ${THEME.border}`,
              borderRadius: 14,
              padding: "16px 20px",
              boxShadow: "0 2px 10px rgba(136, 117, 73, 0.04)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: THEME.textMuted, textTransform: "uppercase" }}>
                Meeting Outcomes
              </span>
              <span
                style={{
                  background: "#FFF7E6",
                  color: "#D46B08",
                  padding: "2px 8px",
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                Goals
              </span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Sora', sans-serif", color: THEME.text }}>
              {clarityData.length}{" "}
              <span style={{ fontSize: 13, fontWeight: 600, color: THEME.textMuted }}>
                {clarityData.length === 1 ? "Member" : "Members"}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, fontSize: 12, color: THEME.textMuted }}>
              <span>🏆 Top Outcomes & 🎯 Focus Goals</span>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            ALL THREE MODULES SHOWN AT ONE TIME (SIDE-BY-SIDE OR STACKED)
        ───────────────────────────────────────────────────────────── */}
        <div className={viewMode === "columns" ? "wf-3col-grid" : "wf-stacked-grid"}>
          
          {/* =========================================================
              SECTION 1: TASKS (TODOS)
             ========================================================= */}
          <div className="wf-column wf-fade">
            <div className="wf-col-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>📋</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, fontFamily: "'Sora', sans-serif" }}>
                    Tasks (Todos)
                  </h3>
                  <span style={{ fontSize: 11, color: THEME.textMuted }}>
                    {tasks.length} {tasks.length === 1 ? "task" : "tasks"} scheduled
                  </span>
                </div>
              </div>

              {/* Status Filter buttons */}
              <div style={{ display: "flex", gap: 4, background: THEME.brandLight, padding: 3, borderRadius: 8 }}>
                {["all", "pending", "completed"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setTaskFilter(st)}
                    style={{
                      border: "none",
                      padding: "4px 8px",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: taskFilter === st ? 700 : 500,
                      background: taskFilter === st ? THEME.brand : "transparent",
                      color: taskFilter === st ? "#fff" : THEME.text,
                      cursor: "pointer",
                      textTransform: "capitalize",
                    }}
                  >
                    {st === "all" ? "All" : st === "pending" ? "Pending" : "Done"}
                  </button>
                ))}
              </div>
            </div>

            <div className="wf-col-body">
              {loadingTasks ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div className="wf-spinner" />
                  <p style={{ margin: "10px 0 0", fontSize: 12, color: THEME.textMuted }}>Loading tasks…</p>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "48px 16px",
                    background: "#FDFAF5",
                    borderRadius: 12,
                    border: `1.5px dashed ${THEME.border}`,
                  }}
                >
                  <span style={{ fontSize: 32, display: "block", marginBottom: 8 }}>📝</span>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: THEME.text }}>No tasks found</p>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: THEME.textMuted }}>
                    No tasks match the selected date or team member.
                  </p>
                </div>
              ) : (
                filteredTasks.map((t) => {
                  const isDone = t.status === 1 || t.status === "1";
                  const priority = PRIORITY_CFG[t.priority] || PRIORITY_CFG[1];
                  const usedH = Number(t.used_hours) || 0;
                  const usedM = Number(t.used_minutes) || 0;
                  const totalH = Number(t.hours) || 0;
                  const totalM = Number(t.minutes) || 0;
                  const hasHours = totalH > 0 || totalM > 0 || usedH > 0 || usedM > 0;

                  return (
                    <div
                      key={t.id}
                      className="wf-card"
                      style={{
                        background: isDone ? "#FCFFFB" : "#FFFFFF",
                        borderLeft: `4px solid ${isDone ? "#52C41A" : priority.color}`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <input
                          type="checkbox"
                          className="wf-checkbox"
                          checked={isDone}
                          onChange={() => handleTaskStatusToggle(t.id, t.status)}
                          title="Click to toggle status"
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              margin: "0 0 6px",
                              fontSize: 13,
                              fontWeight: 600,
                              lineHeight: 1.4,
                              color: isDone ? THEME.textMuted : THEME.text,
                              textDecoration: isDone ? "line-through" : "none",
                              wordBreak: "break-word",
                            }}
                          >
                            {t.task || t.title || "Untitled Task"}
                          </p>

                          {/* Project & Client tag */}
                          {(t.case_id || t.project_name || t.client_name) && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                flexWrap: "wrap",
                                marginBottom: 8,
                                fontSize: 11,
                              }}
                            >
                              {t.case_id && (
                                <span
                                  style={{
                                    background: THEME.brandLight,
                                    color: THEME.brandDark,
                                    padding: "2px 6px",
                                    borderRadius: 4,
                                    fontWeight: 700,
                                  }}
                                >
                                  {t.case_id}
                                </span>
                              )}
                              {t.project_name && (
                                <span style={{ color: THEME.textMuted }}>{t.project_name}</span>
                              )}
                              {t.client_name && (
                                <span style={{ color: THEME.brand, fontWeight: 600 }}>• {t.client_name}</span>
                              )}
                            </div>
                          )}

                          {/* Footer: Assignee, Priority, Hours */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              flexWrap: "wrap",
                              gap: 6,
                              marginTop: 6,
                              paddingTop: 6,
                              borderTop: `1px solid ${THEME.borderLight}`,
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              {t.first_name ? (
                                <span
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    background: "#F5F5F5",
                                    padding: "2px 8px",
                                    borderRadius: 12,
                                    color: THEME.text,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                  }}
                                >
                                  👤 {t.first_name} {t.last_name || ""}
                                </span>
                              ) : null}

                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  padding: "2px 6px",
                                  borderRadius: 4,
                                  background: priority.bg,
                                  color: priority.color,
                                  border: `1px solid ${priority.border}`,
                                }}
                              >
                                {priority.label}
                              </span>
                            </div>

                            {hasHours && (
                              <span style={{ fontSize: 11, color: THEME.textMuted, fontWeight: 500 }}>
                                ⏱️ {usedH}h {usedM}m / {totalH}h {totalM}m
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* =========================================================
              SECTION 2: PMS (PROJECT MANAGEMENT TIME LOGS)
             ========================================================= */}
          <div className="wf-column wf-fade">
            <div className="wf-col-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>⏱️</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, fontFamily: "'Sora', sans-serif" }}>
                    PMS (Time Logs)
                  </h3>
                  <span style={{ fontSize: 11, color: THEME.textMuted }}>
                    Total logged: <strong style={{ color: THEME.brand }}>{pmsTotalTime.hours}h {pmsTotalTime.minutes}m</strong>
                  </span>
                </div>
              </div>

              {/* Category dropdown if multiple exist */}
              {pmsCategories.length > 0 && (
                <select
                  value={pmsCategoryFilter}
                  onChange={(e) => setPmsCategoryFilter(e.target.value)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: 8,
                    border: `1.5px solid #E0D5C5`,
                    fontSize: 11,
                    fontWeight: 600,
                    color: THEME.text,
                    background: "#FFFFFF",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="all">All Categories</option>
                  {pmsCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="wf-col-body">
              {loadingPms ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div className="wf-spinner" />
                  <p style={{ margin: "10px 0 0", fontSize: 12, color: THEME.textMuted }}>Loading PMS records…</p>
                </div>
              ) : filteredPms.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "48px 16px",
                    background: "#FDFAF5",
                    borderRadius: 12,
                    border: `1.5px dashed ${THEME.border}`,
                  }}
                >
                  <span style={{ fontSize: 32, display: "block", marginBottom: 8 }}>⌛</span>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: THEME.text }}>No PMS entries found</p>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: THEME.textMuted }}>
                    No work hours have been recorded for this date and team member.
                  </p>
                </div>
              ) : (
                filteredPms.map((p) => {
                  const durationStr = `${p.hours || 0}h ${p.minutes || 0}m`;
                  return (
                    <div
                      key={p.id}
                      className="wf-card"
                      style={{
                        background: "#FFFFFF",
                        borderLeft: `4px solid ${THEME.brand}`,
                      }}
                    >
                      {/* Top: Employee & Time */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 8,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <img
                            src={`${FileUrl}/${p.profile_picture}`}
                            alt="User"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `${FileUrl}/img/profile.jpeg`;
                            }}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: `1px solid ${THEME.border}`,
                            }}
                          />
                          <span style={{ fontSize: 13, fontWeight: 700, color: THEME.text }}>
                            {p.first_name} {p.last_name || ""}
                          </span>
                        </div>

                        {/* Duration badge */}
                        <span
                          style={{
                            padding: "3px 10px",
                            borderRadius: 12,
                            background: THEME.brandLight,
                            color: THEME.brandDark,
                            fontSize: 12,
                            fontWeight: 700,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            border: `1px solid ${THEME.brandMid}`,
                          }}
                        >
                          ⏱️ {durationStr}
                        </span>
                      </div>

                      {/* Task / Work Description */}
                      <div style={{ marginBottom: 8 }}>
                        {p.task && (
                          <p
                            style={{
                              margin: "0 0 4px",
                              fontSize: 13,
                              fontWeight: 600,
                              color: THEME.text,
                              lineHeight: 1.4,
                            }}
                          >
                            {p.task}
                          </p>
                        )}
                        {p.work && p.work !== p.task && (
                          <p
                            style={{
                              margin: 0,
                              fontSize: 12,
                              color: THEME.textMuted,
                              lineHeight: 1.4,
                            }}
                          >
                            {p.work}
                          </p>
                        )}
                      </div>

                      {/* Project, Category, Date info */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: 6,
                          paddingTop: 8,
                          borderTop: `1px solid ${THEME.borderLight}`,
                          fontSize: 11,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          {p.category && (
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: 12,
                                background: "#E6F7F0",
                                color: "#006D75",
                                fontWeight: 600,
                                fontSize: 10,
                              }}
                            >
                              🏷️ {p.category}
                            </span>
                          )}
                          {p.case_id && (
                            <span
                              style={{
                                padding: "2px 6px",
                                borderRadius: 4,
                                background: "#F5F5F5",
                                color: THEME.text,
                                fontWeight: 600,
                                fontSize: 10,
                              }}
                            >
                              {p.case_id}
                            </span>
                          )}
                          {p.client_name && (
                            <span style={{ color: THEME.brandDark, fontWeight: 600, fontSize: 11 }}>
                              {p.client_name}
                            </span>
                          )}
                        </div>

                        {p.created_at && (
                          <span style={{ color: THEME.textLight, fontSize: 10 }}>{p.created_at}</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* =========================================================
              SECTION 3: OPERATION MEETING (TOP 2-3 OUTCOMES & FOCUS GOALS)
             ========================================================= */}
          <div className="wf-column wf-fade">
            <div className="wf-col-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>🎯</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, fontFamily: "'Sora', sans-serif" }}>
                    Operation Meeting Clarity
                  </h3>
                  <span style={{ fontSize: 11, color: THEME.textMuted }}>
                    Top 2–3 Outcomes & Strategic Focus Goals
                  </span>
                </div>
              </div>

              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 14,
                  fontSize: 11,
                  fontWeight: 700,
                  background: THEME.brandLight,
                  color: THEME.brandDark,
                }}
              >
                {clarityData.length} {clarityData.length === 1 ? "Record" : "Records"}
              </span>
            </div>

            <div className="wf-col-body">
              {loadingClarity ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div className="wf-spinner" />
                  <p style={{ margin: "10px 0 0", fontSize: 12, color: THEME.textMuted }}>
                    Loading Operational Meeting Goals…
                  </p>
                </div>
              ) : clarityData.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "48px 16px",
                    background: "#FDFAF5",
                    borderRadius: 12,
                    border: `1.5px dashed ${THEME.border}`,
                  }}
                >
                  <span style={{ fontSize: 32, display: "block", marginBottom: 8 }}>🎯</span>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: THEME.text }}>
                    No Operation Meeting Clarity
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: THEME.textMuted }}>
                    No outcomes or focus goals logged for this date. Ensure an operational meeting exists.
                  </p>
                </div>
              ) : (
                clarityData.map((item) => {
                  const isVerified = item.verified === 1 || item.verified === "1";
                  return (
                    <div
                      key={item.id}
                      className="wf-card"
                      style={{
                        background: "#FFFFFF",
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      {/* Participant Header */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          borderBottom: `1px solid ${THEME.borderLight}`,
                          paddingBottom: 8,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <img
                            src={`${FileUrl}/${item.profile_picture}`}
                            alt="User"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `${FileUrl}/img/profile.jpeg`;
                            }}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: `1.5px solid ${THEME.border}`,
                            }}
                          />
                          <div>
                            <div
                              style={{
                                fontSize: 14,
                                fontWeight: 700,
                                color: THEME.text,
                                fontFamily: "'Sora', sans-serif",
                              }}
                            >
                              {item.first_name} {item.last_name || ""}
                            </div>
                            {item.department_name && (
                              <div style={{ fontSize: 11, color: THEME.textMuted, fontWeight: 500 }}>
                                {item.department_name}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Verified Badge */}
                        <div style={{ textAlign: "right" }}>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: 12,
                              fontSize: 10,
                              fontWeight: 700,
                              background: isVerified ? "#F6FFED" : "#F5F5F5",
                              color: isVerified ? "#389E0D" : THEME.textMuted,
                              border: `1px solid ${isVerified ? "#B7EB8F" : "#D9D9D9"}`,
                            }}
                          >
                            {isVerified ? "✓ Verified" : "○ Unverified"}
                          </span>
                        </div>
                      </div>

                      {/* ── Box 1: Top 2–3 Outcomes ── */}
                      <div
                        style={{
                          background: THEME.clarity1Bg,
                          border: `1.2px solid ${THEME.clarity1Border}`,
                          borderRadius: 10,
                          padding: 12,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 8,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 800,
                              color: "#005A36",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            🏆 Top 2–3 Outcomes
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditClarityId(item.id);
                              setShowTopModal(true);
                            }}
                            className="wf-btn"
                            title="Edit Top 2-3 Outcomes"
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: 6,
                              background: "#FFFFFF",
                              border: `1px solid ${THEME.clarity1Border}`,
                              color: THEME.brandDark,
                              padding: 0,
                            }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          <div>
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: "#006D44",
                                textTransform: "uppercase",
                                display: "block",
                                marginBottom: 3,
                              }}
                            >
                              Key Highlight
                            </span>
                            <div
                              style={{ fontSize: 12, color: THEME.text, lineHeight: 1.5 }}
                              dangerouslySetInnerHTML={{
                                __html:
                                  item.clarity_1_key_highlight ||
                                  "<span style='color:#999;font-style:italic'>Not filled</span>",
                              }}
                            />
                          </div>
                          <div>
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: "#006D44",
                                textTransform: "uppercase",
                                display: "block",
                                marginBottom: 3,
                              }}
                            >
                              Key Action
                            </span>
                            <div
                              style={{ fontSize: 12, color: THEME.text, lineHeight: 1.5 }}
                              dangerouslySetInnerHTML={{
                                __html:
                                  item.clarity_1_key_action ||
                                  "<span style='color:#999;font-style:italic'>Not filled</span>",
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* ── Box 2: Focus → Tactical / Strategic Goals ── */}
                      <div
                        style={{
                          background: THEME.clarity2Bg,
                          border: `1.2px solid ${THEME.clarity2Border}`,
                          borderRadius: 10,
                          padding: 12,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 8,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 800,
                              color: "#874D00",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            🎯 Focus → Tactical / Strategic Goals
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditClarityId(item.id);
                              setShowFocusModal(true);
                            }}
                            className="wf-btn"
                            title="Edit Focus Goals"
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: 6,
                              background: "#FFFFFF",
                              border: `1px solid ${THEME.clarity2Border}`,
                              color: "#874D00",
                              padding: 0,
                            }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          <div>
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: "#AD6800",
                                textTransform: "uppercase",
                                display: "block",
                                marginBottom: 3,
                              }}
                            >
                              Key Highlight
                            </span>
                            <div
                              style={{ fontSize: 12, color: THEME.text, lineHeight: 1.5 }}
                              dangerouslySetInnerHTML={{
                                __html:
                                  item.clarity_2_key_highlight ||
                                  "<span style='color:#999;font-style:italic'>Not filled</span>",
                              }}
                            />
                          </div>
                          <div>
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: "#AD6800",
                                textTransform: "uppercase",
                                display: "block",
                                marginBottom: 3,
                              }}
                            >
                              Key Action
                            </span>
                            <div
                              style={{ fontSize: 12, color: THEME.text, lineHeight: 1.5 }}
                              dangerouslySetInnerHTML={{
                                __html:
                                  item.clarity_2_key_action ||
                                  "<span style='color:#999;font-style:italic'>Not filled</span>",
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Remark if available */}
                      {item.remark && (
                        <div
                          style={{
                            fontSize: 11,
                            color: "#7C5E00",
                            background: "#FFFBE6",
                            padding: "6px 10px",
                            borderRadius: 6,
                            border: "1px solid #FFE58F",
                          }}
                        >
                          💬 <strong>Remark:</strong> {item.remark}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ── Interactive Modals for Top Outcomes & Focus Goals ── */}
        {showTopModal && editClarityId && (
          <PerformanceModal
            editId={editClarityId}
            onClose={() => {
              setShowTopModal(false);
              setEditClarityId(null);
            }}
            onSuccess={() => {
              setShowTopModal(false);
              setEditClarityId(null);
              loadClarity();
            }}
          />
        )}

        {showFocusModal && editClarityId && (
          <ClarityFocusModal
            editId={editClarityId}
            onClose={() => {
              setShowFocusModal(false);
              setEditClarityId(null);
            }}
            onSuccess={() => {
              setShowFocusModal(false);
              setEditClarityId(null);
              loadClarity();
            }}
          />
        )}
      </div>
    </>
  );
};

export default Workflow;
