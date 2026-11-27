import React, { useEffect, useState, useCallback, useMemo } from "react";
import ApiService from "../../../services/ApiService";
import { getProgressReport } from "../../../config/config";
import { getToken } from "../../../services/useLocalStorage";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { FilesRoute } from "../../../config/RouteConfig";

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
  rowAlt: "#FEFCF9",
  rowHover: "#FDFAF5",
  text: "#1A1A2E",
  textMuted: "#8C8C8C",
  textLight: "#BFBFBF",
  success: "#52C41A",
  successLight: "#F6FFED",
  successBorder: "#B7EB8F",
  warning: "#FAAD14",
  warningLight: "#FFFBE6",
  warningBorder: "#FFE58F",
  danger: "#FF4D4F",
  dangerLight: "#FFF1F0",
  dangerBorder: "#FFA39E",
  info: "#1890FF",
  infoLight: "#E6F7FF",
  infoBorder: "#91D5FF",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }

  @keyframes prFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  .pr-fade { animation: prFadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1) both; }

  @keyframes prSpin { to { transform: rotate(360deg); } }
  .pr-spinner {
    width: 24px; height: 24px; border-radius: 50%;
    border: 3px solid ${THEME.brandLight}; border-top-color: ${THEME.brand};
    animation: prSpin 0.75s linear infinite; display: inline-block;
  }

  /* ── Pill buttons ── */
  .pr-pill {
    padding: 7px 16px; border-radius: 20px; font-size: 12.5px; font-weight: 600;
    cursor: pointer; border: 1.5px solid ${THEME.border}; background: #fff;
    color: ${THEME.text}; transition: all 0.18s; font-family: 'DM Sans', sans-serif;
    display: inline-flex; align-items: center; gap: 6px; user-select: none;
  }
  .pr-pill:hover { background: ${THEME.brandLight}; border-color: ${THEME.brandMid}; color: ${THEME.brandDark}; }
  .pr-pill.active {
    background: ${THEME.brand}; border-color: ${THEME.brand}; color: #fff;
    font-weight: 700; box-shadow: 0 2px 8px rgba(136,117,73,0.3);
  }

  /* ── Pipeline Stepper ── */
  .pr-stepper {
    display: flex; align-items: center; gap: 4px; overflow-x: auto;
    padding: 8px 0; scrollbar-width: none;
  }
  .pr-stepper::-webkit-scrollbar { display: none; }

  .pr-step-node {
    display: flex; align-items: center; gap: 6px; padding: 6px 10px;
    border-radius: 8px; font-size: 11px; font-weight: 600; white-space: nowrap;
    border: 1px solid transparent; transition: all 0.15s; flex-shrink: 0;
  }
  .pr-step-node.done {
    background: ${THEME.successLight}; border-color: ${THEME.successBorder}; color: #274916;
  }
  .pr-step-node.current {
    background: #FFF7E6; border-color: #FFD591; color: #873800; font-weight: 700;
    box-shadow: 0 0 0 2px rgba(250, 173, 20, 0.25);
  }
  .pr-step-node.pending {
    background: #FAFAFA; border-color: #E8E8E8; color: #8C8C8C;
  }
  .pr-step-arrow {
    color: #BFBFBF; font-size: 10px; flex-shrink: 0;
  }

  /* ── Cards ── */
  .pr-card {
    background: #fff; border: 1px solid ${THEME.border}; border-radius: 14px;
    padding: 18px 22px; box-shadow: 0 2px 8px rgba(136,117,73,0.05);
    transition: box-shadow 0.2s, transform 0.2s;
  }
  .pr-card:hover {
    box-shadow: 0 6px 18px rgba(136,117,73,0.1);
  }

  .pr-search-input {
    width: 280px; padding: 8px 14px; border-radius: 10px;
    border: 1.5px solid ${THEME.border}; background: #fff;
    font-size: 13px; font-family: 'DM Sans', sans-serif; color: ${THEME.text};
    outline: none; transition: border-color 0.18s, box-shadow 0.18s;
  }
  .pr-search-input:focus {
    border-color: ${THEME.brand};
    box-shadow: 0 0 0 3px rgba(136,117,73,0.12);
  }
`;

// Service Badges
const SERVICE_BADGES = {
  approval:     { label: "Approval Process", bg: "#F9F0FF", border: "#D3ADF7", text: "#531DAB", icon: "📋" },
  architecture: { label: "Architecture",     bg: "#E6F7FF", border: "#91D5FF", text: "#096DD9", icon: "📐" },
  interior:     { label: "Interior",         bg: "#FFF7E6", border: "#FFD591", text: "#D46B08", icon: "🛋️" },
};

export default function ProgressReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("files"); // "files" | "teams"
  const [serviceFilter, setServiceFilter] = useState("all"); // "all" | "approval" | "architecture" | "interior"
  const [statusFilter, setStatusFilter] = useState("all");   // "all" | "ongoing" | "delayed" | "completed"
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const header = { Authorization: `Bearer ${getToken()}` };
      const res = await ApiService(null, 0, header, getProgressReport.method, getProgressReport.url);
      if (!res.data?.error) {
        setData(res.data.data);
      } else {
        toast.error(res.data?.message || "Failed to load progress report");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "An error occurred fetching progress report");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Filtered files
  const filteredFiles = useMemo(() => {
    if (!data?.files) return [];
    return data.files.filter((f) => {
      // Service filter
      if (serviceFilter !== "all" && f.service_key !== serviceFilter) return false;

      // Status filter
      if (statusFilter !== "all" && f.status !== statusFilter) return false;

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          f.case_id?.toLowerCase().includes(q) ||
          f.project_name?.toLowerCase().includes(q) ||
          f.client_name?.toLowerCase().includes(q) ||
          f.authority?.toLowerCase().includes(q) ||
          f.village?.toLowerCase().includes(q) ||
          f.steps?.some((s) => s.member_names?.some((m) => m.toLowerCase().includes(q)));
        if (!match) return false;
      }

      return true;
    });
  }, [data?.files, serviceFilter, statusFilter, search]);

  // Filtered team members
  const filteredMembers = useMemo(() => {
    if (!data?.team_members) return [];
    if (!search.trim()) return data.team_members;
    const q = search.toLowerCase();
    return data.team_members.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        m.department_name?.toLowerCase().includes(q) ||
        m.post_name?.toLowerCase().includes(q)
    );
  }, [data?.team_members, search]);

  const overview = data?.overview || {
    total_files: 0,
    completed_files: 0,
    ongoing_files: 0,
    delayed_files: 0,
    average_progress: 0,
    active_members_count: 0,
  };

  const departments = data?.departments || {};

  return (
    <>
      <style>{CSS}</style>

      <div style={{ minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", padding: "28px 24px" }} className="pr-fade">
        
        {/* ── Top Header ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginBottom: 24 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ width: 4, height: 22, borderRadius: 2, background: `linear-gradient(180deg, ${THEME.brand} 0%, ${THEME.brandMid} 100%)` }} />
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: THEME.text, fontFamily: "'Sora', sans-serif" }}>
                Team & File Progress Report
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: THEME.textMuted }}>
              Real-time tracking of file progress across Approval, Architecture, and Interior with step-level team ownership
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={fetchReport}
              disabled={loading}
              className="pr-pill"
              style={{ background: "#fff", borderColor: THEME.border }}
              title="Refresh"
            >
              {loading ? <span className="pr-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : "🔄"} Refresh
            </button>
          </div>
        </div>

        {/* ── Metric Cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
          {/* Total Files */}
          <div className="pr-card" style={{ borderLeft: `4px solid ${THEME.brand}` }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: THEME.textMuted, textTransform: "uppercase" }}>Total Files Tracked</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
              <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: "'Sora', sans-serif" }}>
                {overview.total_files}
              </h2>
              <span style={{ fontSize: 11, fontWeight: 600, color: THEME.brand }}>across 3 services</span>
            </div>
          </div>

          {/* Completed Files */}
          <div className="pr-card" style={{ borderLeft: `4px solid ${THEME.success}` }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: THEME.textMuted, textTransform: "uppercase" }}>Completed Files</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
              <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: THEME.success, fontFamily: "'Sora', sans-serif" }}>
                {overview.completed_files}
              </h2>
              <span style={{ fontSize: 11, fontWeight: 700, color: THEME.success, background: THEME.successLight, padding: "1px 7px", borderRadius: 10 }}>
                {overview.total_files > 0 ? Math.round((overview.completed_files / overview.total_files) * 100) : 0}% done
              </span>
            </div>
          </div>

          {/* Ongoing Files */}
          <div className="pr-card" style={{ borderLeft: `4px solid ${THEME.info}` }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: THEME.textMuted, textTransform: "uppercase" }}>Ongoing Files</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
              <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: THEME.info, fontFamily: "'Sora', sans-serif" }}>
                {overview.ongoing_files}
              </h2>
              <span style={{ fontSize: 11, fontWeight: 600, color: THEME.textMuted }}>in active stages</span>
            </div>
          </div>

          {/* Delayed / Alert */}
          <div className="pr-card" style={{ borderLeft: `4px solid ${THEME.danger}` }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: THEME.textMuted, textTransform: "uppercase" }}>Overdue / Delayed</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
              <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: THEME.danger, fontFamily: "'Sora', sans-serif" }}>
                {overview.delayed_files}
              </h2>
              <span style={{ fontSize: 11, fontWeight: 700, color: THEME.danger, background: THEME.dangerLight, padding: "1px 7px", borderRadius: 10 }}>
                needs attention
              </span>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="pr-card" style={{ borderLeft: `4px solid ${THEME.brandDark}` }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: THEME.textMuted, textTransform: "uppercase" }}>Average Progress</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
              <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: THEME.brandDark, fontFamily: "'Sora', sans-serif" }}>
                {overview.average_progress}%
              </h2>
              <span style={{ fontSize: 11, fontWeight: 600, color: THEME.textMuted }}>
                {overview.active_members_count} team members
              </span>
            </div>
          </div>
        </div>

        {/* ── Department Breakdown Bars ── */}
        <div style={{ background: "#fff", border: `1px solid ${THEME.border}`, borderRadius: 14, padding: "16px 20px", marginBottom: 24 }}>
          <p style={{ margin: "0 0 12px 0", fontSize: 13, fontWeight: 700, color: THEME.text, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Department Progress Summary
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {["approval", "architecture", "interior"].map((key) => {
              const d = departments[key] || { name: key, total_files: 0, completed_files: 0, ongoing_files: 0, delayed_files: 0, progress_percent: 0 };
              const badge = SERVICE_BADGES[key];
              return (
                <div key={key} style={{ padding: "12px 14px", borderRadius: 10, background: THEME.bg, border: `1px solid ${THEME.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span>{badge.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: badge.text }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: THEME.text }}>{d.progress_percent}%</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div style={{ width: "100%", height: 7, borderRadius: 10, background: "#E8E2D8", overflow: "hidden", marginBottom: 8 }}>
                    <div style={{ width: `${d.progress_percent}%`, height: "100%", borderRadius: 10, background: badge.text, transition: "width 0.5s ease" }} />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: THEME.textMuted }}>
                    <span>Total: <b>{d.total_files}</b> files</span>
                    <span>Done: <b style={{ color: THEME.success }}>{d.completed_files}</b></span>
                    <span>Ongoing: <b style={{ color: THEME.info }}>{d.ongoing_files}</b></span>
                    {d.delayed_files > 0 && <span>Delayed: <b style={{ color: THEME.danger }}>{d.delayed_files}</b></span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Mode Switcher & Controls ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
          
          {/* Main View Tabs */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: THEME.bg, padding: 4, borderRadius: 24, border: `1px solid ${THEME.border}` }}>
            <button
              className={`pr-pill${activeView === "files" ? " active" : ""}`}
              onClick={() => setActiveView("files")}
              style={{ border: "none" }}
            >
              📁 File & Stage Tracking ({data?.files?.length || 0})
            </button>
            <button
              className={`pr-pill${activeView === "teams" ? " active" : ""}`}
              onClick={() => setActiveView("teams")}
              style={{ border: "none" }}
            >
              👥 Team Member Progress ({data?.team_members?.length || 0})
            </button>
          </div>

          {/* Search bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="text"
              placeholder={activeView === "files" ? "Search Case ID, Project, Client, Member…" : "Search team members, department…"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-search-input"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, fontSize: 14 }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/*  VIEW 1: FILE & STAGE TRACKER                                 */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeView === "files" && (
          <div>
            {/* Filter Pills */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
              {/* Service Filter */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: THEME.textMuted, marginRight: 2 }}>Service:</span>
                {[
                  { key: "all",          label: "All Services" },
                  { key: "approval",     label: "Approval (5 Steps)" },
                  { key: "architecture", label: "Architecture (8 Steps)" },
                  { key: "interior",     label: "Interior (8 Steps)" },
                ].map((s) => (
                  <button
                    key={s.key}
                    className={`pr-pill${serviceFilter === s.key ? " active" : ""}`}
                    onClick={() => setServiceFilter(s.key)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: THEME.textMuted, marginRight: 2 }}>Status:</span>
                {[
                  { key: "all",       label: "All" },
                  { key: "ongoing",   label: "Ongoing" },
                  { key: "delayed",   label: "Delayed" },
                  { key: "completed", label: "Completed" },
                ].map((st) => (
                  <button
                    key={st.key}
                    className={`pr-pill${statusFilter === st.key ? " active" : ""}`}
                    onClick={() => setStatusFilter(st.key)}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* File List */}
            {loading ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <span className="pr-spinner" />
                <p style={{ marginTop: 12, fontSize: 13, color: THEME.textMuted }}>Loading file progress report…</p>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div style={{ background: "#fff", border: `1px solid ${THEME.border}`, borderRadius: 14, padding: "48px 24px", textAlign: "center" }}>
                <p style={{ fontSize: 24, margin: "0 0 6px 0" }}>🔍</p>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: THEME.text }}>No Files Found</h3>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: THEME.textMuted }}>Try adjusting your search or service filters</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {filteredFiles.map((file) => {
                  const sBadge = SERVICE_BADGES[file.service_key] || SERVICE_BADGES.approval;
                  return (
                    <div
                      key={`${file.service_key}_${file.id}`}
                      className="pr-card"
                      style={{
                        padding: "18px 22px",
                        borderLeft: `4px solid ${
                          file.status === "completed"
                            ? THEME.success
                            : file.status === "delayed"
                            ? THEME.danger
                            : sBadge.text
                        }`,
                      }}
                    >
                      {/* Top Info Row */}
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
                        
                        {/* File Details */}
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                            <span style={{ fontSize: 12, fontWeight: 800, padding: "2px 8px", borderRadius: 6, background: THEME.brandLight, color: THEME.brandDark }}>
                              {file.case_id}
                            </span>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: sBadge.bg, color: sBadge.text, border: `1px solid ${sBadge.border}` }}>
                              {sBadge.icon} {file.service}
                            </span>
                            {file.status === "completed" && (
                              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: THEME.successLight, color: THEME.success, border: `1px solid ${THEME.successBorder}` }}>
                                ✓ Completed
                              </span>
                            )}
                            {file.status === "delayed" && (
                              <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: THEME.dangerLight, color: THEME.danger, border: `1px solid ${THEME.dangerBorder}` }}>
                                ⚠️ Stage Overdue
                              </span>
                            )}
                          </div>

                          <h3 style={{ margin: "2px 0 4px 0", fontSize: 16, fontWeight: 700, color: THEME.text, fontFamily: "'Sora', sans-serif" }}>
                            {file.project_name}
                          </h3>

                          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 12, color: THEME.textMuted, flexWrap: "wrap" }}>
                            <span>👤 Client: <b>{file.client_name}</b></span>
                            <span>🏛️ Authority: <b>{file.authority}</b></span>
                            <span>📍 Location: <b>{[file.village, file.tpscheme].filter((v) => v && v !== "—").join(", ") || "—"}</b></span>
                          </div>
                        </div>

                        {/* Current Location Badge & Progress */}
                        <div style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 8, background: "#FDFAF5", border: `1.5px solid ${THEME.border}`, marginBottom: 6 }}>
                            <span style={{ fontSize: 12 }}>📍</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: THEME.brandDark }}>
                              {file.status === "completed" ? "All Steps Completed" : `At Step: ${file.current_step}`}
                            </span>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, fontSize: 12 }}>
                            <span style={{ color: THEME.textMuted, fontWeight: 600 }}>
                              {file.completed_steps} of {file.total_steps} steps
                            </span>
                            <span style={{ fontWeight: 800, color: THEME.brand }}>
                              {file.progress_percent}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Overall Progress Bar */}
                      <div style={{ width: "100%", height: 6, borderRadius: 10, background: "#EFE8DC", overflow: "hidden", marginBottom: 14 }}>
                        <div
                          style={{
                            width: `${file.progress_percent}%`,
                            height: "100%",
                            borderRadius: 10,
                            background:
                              file.status === "completed"
                                ? THEME.success
                                : file.status === "delayed"
                                ? THEME.danger
                                : THEME.brand,
                            transition: "width 0.4s ease",
                          }}
                        />
                      </div>

                      {/* Visual Stepper / Pipeline */}
                      <div style={{ borderTop: "1px dashed #EDE5D5", paddingTop: 10 }}>
                        <p style={{ margin: "0 0 6px 0", fontSize: 11, fontWeight: 700, color: THEME.textMuted, textTransform: "uppercase" }}>
                          Step Pipeline & Assigned Team Ownership:
                        </p>

                        <div className="pr-stepper">
                          {file.steps.map((st, sidx) => {
                            const nodeClass = st.is_done ? "done" : st.is_current ? "current" : "pending";
                            return (
                              <React.Fragment key={st.step_number}>
                                <div
                                  className={`pr-step-node ${nodeClass}`}
                                  title={`Step ${st.step_number}: ${st.title}\nStatus: ${st.is_done ? "Done" : st.is_current ? "Active / In Progress" : "Pending"}\nAssigned: ${st.member_names.join(", ") || "Unassigned"}\nHOD: ${st.hod_name || "—"}`}
                                >
                                  {/* Icon indicator */}
                                  <span style={{ fontSize: 12 }}>
                                    {st.is_done ? "✓" : st.is_current ? "●" : "○"}
                                  </span>

                                  <span>
                                    <b>{st.step_number}.</b> {st.short}
                                  </span>

                                  {/* Assigned Member Tag */}
                                  {st.member_names.length > 0 && (
                                    <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 4, background: "rgba(0,0,0,0.06)" }}>
                                      👤 {st.member_names[0]}
                                    </span>
                                  )}

                                  {/* Overdue tag */}
                                  {st.is_delayed && (
                                    <span style={{ fontSize: 9, fontWeight: 800, padding: "1px 4px", borderRadius: 4, background: THEME.danger, color: "#fff" }}>
                                      {st.remaining_days}d
                                    </span>
                                  )}
                                </div>

                                {sidx < file.steps.length - 1 && (
                                  <span className="pr-step-arrow">→</span>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/*  VIEW 2: TEAM MEMBER PROGRESS & ASSIGNMENTS                   */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeView === "teams" && (
          <div>
            {loading ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <span className="pr-spinner" />
                <p style={{ marginTop: 12, fontSize: 13, color: THEME.textMuted }}>Loading team member progress…</p>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div style={{ background: "#fff", border: `1px solid ${THEME.border}`, borderRadius: 14, padding: "48px 24px", textAlign: "center" }}>
                <p style={{ fontSize: 24, margin: "0 0 6px 0" }}>👥</p>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: THEME.text }}>No Team Members Found</h3>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="pr-card"
                    style={{
                      borderTop: `4px solid ${
                        member.delayed_tasks > 0
                          ? THEME.danger
                          : member.progress_percent === 100 && member.total_tasks > 0
                          ? THEME.success
                          : THEME.brand
                      }`,
                    }}
                  >
                    {/* Member Header */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                      <div
                        style={{
                          width: 44, height: 44, borderRadius: "50%",
                          background: THEME.brandLight, border: `1.5px solid ${THEME.brandMid}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 16, fontWeight: 800, color: THEME.brandDark,
                        }}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: THEME.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {member.name}
                        </h4>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: THEME.textMuted, marginTop: 2 }}>
                          <span style={{ fontWeight: 600, color: THEME.brandDark }}>{member.department_name}</span>
                          <span>•</span>
                          <span>{member.post_name}</span>
                        </div>
                      </div>

                      {/* Progress Badge */}
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: THEME.brand }}>
                          {member.progress_percent}%
                        </span>
                        <p style={{ margin: 0, fontSize: 10, color: THEME.textMuted, fontWeight: 600 }}>Completed</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ width: "100%", height: 7, borderRadius: 10, background: "#EFE8DC", overflow: "hidden", marginBottom: 14 }}>
                      <div
                        style={{
                          width: `${member.progress_percent}%`,
                          height: "100%",
                          borderRadius: 10,
                          background: member.delayed_tasks > 0 ? THEME.danger : THEME.brand,
                          transition: "width 0.4s ease",
                        }}
                      />
                    </div>

                    {/* Task Counts Summary */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, padding: "8px 10px", borderRadius: 8, background: THEME.bg, textAlign: "center", marginBottom: 14 }}>
                      <div>
                        <span style={{ display: "block", fontSize: 14, fontWeight: 800, color: THEME.text }}>{member.total_tasks}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: THEME.textMuted }}>Total</span>
                      </div>
                      <div>
                        <span style={{ display: "block", fontSize: 14, fontWeight: 800, color: THEME.success }}>{member.completed_tasks}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: THEME.textMuted }}>Done</span>
                      </div>
                      <div>
                        <span style={{ display: "block", fontSize: 14, fontWeight: 800, color: THEME.info }}>{member.ongoing_tasks}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: THEME.textMuted }}>Ongoing</span>
                      </div>
                      <div>
                        <span style={{ display: "block", fontSize: 14, fontWeight: 800, color: member.delayed_tasks > 0 ? THEME.danger : THEME.textMuted }}>
                          {member.delayed_tasks}
                        </span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: THEME.textMuted }}>Delayed</span>
                      </div>
                    </div>

                    {/* Assigned Files Snippet */}
                    <div>
                      <p style={{ margin: "0 0 6px 0", fontSize: 11, fontWeight: 700, color: THEME.textMuted, textTransform: "uppercase" }}>
                        Assigned Stages ({member.assigned_files.length}):
                      </p>
                      {member.assigned_files.length === 0 ? (
                        <p style={{ margin: 0, fontSize: 12, color: THEME.textLight, fontStyle: "italic" }}>No active file stages assigned</p>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 150, overflowY: "auto" }}>
                          {member.assigned_files.map((af, afIdx) => (
                            <div
                              key={afIdx}
                              style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "4px 8px", borderRadius: 6, background: af.is_done ? THEME.successLight : "#FDFAF5",
                                border: `1px solid ${af.is_done ? THEME.successBorder : THEME.border}`,
                                fontSize: 11,
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                                <span style={{ fontWeight: 700, color: THEME.brandDark }}>{af.case_id}</span>
                                <span style={{ color: THEME.textMuted }}>•</span>
                                <span style={{ color: THEME.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {af.step}
                                </span>
                              </div>

                              <span
                                style={{
                                  fontSize: 10, fontWeight: 700,
                                  color: af.is_done ? THEME.success : af.is_delayed ? THEME.danger : THEME.warning,
                                }}
                              >
                                {af.is_done ? "Done" : af.is_delayed ? "Overdue" : "In Progress"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </>
  );
}
