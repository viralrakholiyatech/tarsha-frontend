import React, { useEffect } from "react";
import {
  Battery, BatteryCharging, BatteryWarning,
  Wifi, WifiOff, PowerOff, Users, Clock, Calendar, X,
} from "lucide-react";

// ─────────────────────────────────────────────
//  🎨  BRAND THEME (matches your other components)
// ─────────────────────────────────────────────
const T = {
  brand:      "#887549",
  brandLight: "#F5F0E8",
  brandMid:   "#C4A97D",
  brandDark:  "#5C4E32",
  bg:         "#F8F5F0",
  border:     "#EDE5D5",
  text:       "#1A1A2E",
  textMuted:  "#ADADAD",
  textLight:  "#BDBDBD",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }

  /* ── Panel ── */
  .cp-panel {
    width: 340px;
    height: 100vh;
    background: ${T.bg};
    border-right: 1.5px solid ${T.border};
    display: flex;
    flex-direction: column;
    font-family: 'DM Sans', sans-serif;
    z-index: 10;
    box-shadow: 2px 0 16px rgba(136,117,73,0.08);
  }

  /* ── Header ── */
  .cp-header {
    padding: 18px 20px 14px;
    background: #fff;
    border-bottom: 1.5px solid ${T.border};
    flex-shrink: 0;
  }
  .cp-header-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
  }
  .cp-header-bar {
    width: 4px; height: 22px; border-radius: 3px;
    background: linear-gradient(180deg, ${T.brand} 0%, ${T.brandMid} 100%);
  }
  .cp-header-title {
    margin: 0;
    font-family: 'Sora', sans-serif;
    font-size: 14px;
    font-weight: 800;
    color: ${T.text};
    letter-spacing: -0.2px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  /* ── Section label ── */
  .cp-section-label {
    font-size: 10px;
    font-weight: 700;
    color: ${T.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.09em;
    margin: 0 0 10px;
  }

  /* ── Stats row ── */
  .cp-stats {
    display: flex;
    gap: 8px;
  }
  .cp-stat {
    flex: 1;
    background: ${T.brandLight};
    border: 1px solid ${T.border};
    border-radius: 10px;
    padding: 8px 12px;
    text-align: center;
  }
  .cp-stat-val {
    font-family: 'Sora', sans-serif;
    font-size: 18px;
    font-weight: 800;
    color: ${T.brand};
    line-height: 1;
  }
  .cp-stat-label {
    font-size: 10px;
    font-weight: 600;
    color: ${T.textMuted};
    margin-top: 2px;
  }

  /* ── Member card ── */
  .cp-member {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 14px;
    background: #fff;
    border: 1.5px solid ${T.border};
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.18s;
    position: relative;
    overflow: hidden;
  }
  .cp-member::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    background: transparent;
    border-radius: 12px 0 0 12px;
    transition: background 0.18s;
  }
  .cp-member:hover {
    border-color: ${T.brandMid};
    background: ${T.brandLight};
  }
  .cp-member.selected {
    border-color: ${T.brand};
    background: ${T.brandLight};
    box-shadow: 0 0 0 1px ${T.brand};
  }
  .cp-member.selected::before {
    background: linear-gradient(180deg, ${T.brand}, ${T.brandMid});
  }

  /* ── Avatar ── */
  .cp-avatar-wrap { position: relative; flex-shrink: 0; }
  .cp-avatar {
    width: 38px; height: 38px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; color: #fff;
    font-family: 'Sora', sans-serif;
  }
  .cp-avatar-dot {
    position: absolute;
    bottom: -2px; right: -2px;
    width: 14px; height: 14px;
    border-radius: 50%;
    border: 2px solid #fff;
    display: flex; align-items: center; justify-content: center;
  }

  /* ── Member info ── */
  .cp-member-name {
    font-size: 13px;
    font-weight: 700;
    color: ${T.text};
    margin: 0 0 2px;
    font-family: 'DM Sans', sans-serif;
  }
  .cp-member-sub {
    font-size: 11px;
    color: ${T.textMuted};
    display: flex;
    align-items: center;
    gap: 5px;
  }

  /* ── Battery pill ── */
  .cp-battery {
    margin-left: auto;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 3px;
    flex-shrink: 0;
  }
  .cp-battery-val {
    font-size: 11px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 3px;
  }
  .cp-battery-bar {
    width: 36px; height: 4px;
    border-radius: 10px;
    background: ${T.border};
    overflow: hidden;
  }
  .cp-battery-fill {
    height: 100%;
    border-radius: 10px;
    transition: width 0.4s ease;
  }

  /* ── Form controls ── */
  .cp-label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    color: ${T.brandDark};
    text-transform: uppercase;
    letter-spacing: 0.07em;
    margin-bottom: 6px;
  }
  .cp-select, .cp-date {
    width: 100%;
    padding: 9px 12px;
    border-radius: 10px;
    border: 1.5px solid ${T.border};
    background: #fff;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    color: ${T.text};
    outline: none;
    transition: all 0.18s;
    appearance: none;
    -webkit-appearance: none;
    cursor: pointer;
  }
  .cp-select:focus, .cp-date:focus {
    border-color: ${T.brand};
    box-shadow: 0 0 0 3px rgba(136,117,73,0.12);
  }

  /* ── Info banner ── */
  .cp-info-banner {
    background: ${T.brandLight};
    border: 1px solid ${T.border};
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 11px;
    color: ${T.brandDark};
    font-weight: 600;
    display: flex;
    align-items: flex-start;
    gap: 8px;
    line-height: 1.5;
  }

  /* ── Clear button ── */
  .cp-clear-btn {
    display: flex; align-items: center; gap: 4px;
    padding: 4px 10px;
    border-radius: 20px;
    border: 1.5px solid ${T.border};
    background: #fff;
    font-size: 10px;
    font-weight: 700;
    color: ${T.textMuted};
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.15s;
  }
  .cp-clear-btn:hover {
    border-color: ${T.brand};
    color: ${T.brand};
    background: ${T.brandLight};
  }

  /* ── Timeline ── */
  .cp-timeline-header {
    padding: 12px 16px;
    background: #fff;
    border-bottom: 1.5px solid ${T.border};
    position: sticky;
    top: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .cp-timeline-header-icon {
    width: 26px; height: 26px;
    border-radius: 8px;
    background: ${T.brandLight};
    border: 1px solid ${T.border};
    display: flex; align-items: center; justify-content: center;
    color: ${T.brand};
  }
  .cp-time-slot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    border-left: 3px solid transparent;
    cursor: pointer;
    transition: all 0.15s;
    border-bottom: 1px solid ${T.border}22;
  }
  .cp-time-slot:hover {
    background: ${T.brandLight};
    border-left-color: ${T.brandMid};
  }
  .cp-time-slot.active {
    background: ${T.brandLight};
    border-left-color: ${T.brand};
  }
  .cp-time-val {
    font-family: 'Sora', monospace;
    font-size: 12px;
    font-weight: 700;
    color: ${T.text};
  }
  .cp-time-slot.active .cp-time-val { color: ${T.brand}; }
  .cp-time-badge {
    font-size: 10px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 20px;
  }

  /* ── Scrollbar ── */
  .cp-scroll::-webkit-scrollbar { width: 4px; }
  .cp-scroll::-webkit-scrollbar-track { background: ${T.brandLight}; }
  .cp-scroll::-webkit-scrollbar-thumb { background: ${T.brandMid}; border-radius: 10px; }

  /* ── Loading spinner ── */
  @keyframes cpSpin { to { transform: rotate(360deg); } }
  .cp-spinner {
    width: 24px; height: 24px; border-radius: 50%;
    border: 3px solid ${T.brandLight};
    border-top-color: ${T.brand};
    animation: cpSpin 0.8s linear infinite;
  }

  .cp-members-scroll {
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-right: 2px;
  }
  .cp-members-scroll::-webkit-scrollbar { width: 4px; }
  .cp-members-scroll::-webkit-scrollbar-track { background: ${T.brandLight}; }
  .cp-members-scroll::-webkit-scrollbar-thumb { background: ${T.brandMid}; border-radius: 10px; }
`;

// ─── Helpers ────────────────────────────────────────────────
function getBatteryColor(level) {
  if (level <= 20) return "#CF1322";
  if (level <= 50) return "#D46B08";
  return "#389E0D";
}

function getStatusConfig(status) {
  switch (status) {
    case "online":
      return { icon: <Wifi size={9} />, label: "Online", color: "#389E0D", dot: "#389E0D" };
    case "gps-lost":
      return { icon: <WifiOff size={9} />, label: "No GPS", color: "#D46B08", dot: "#D46B08" };
    default:
      return { icon: <PowerOff size={9} />, label: "Offline", color: T.textMuted, dot: "#D9D9D9" };
  }
}

// ─────────────────────────────────────────────
//  🚀  COMPONENT
// ─────────────────────────────────────────────
const ControlPanel = ({
  currentMode,
  teamMembers,
  selectedMemberId,
  setSelectedMemberId,
  selectedDate,
  setSelectedDate,
  timeSlots,
  selectedTime,
  setSelectedTime,
  mockData,
  onMemberSelect,
  historyLoading,
}) => {
  const sortedMembers = [...teamMembers].sort((a, b) => {
    const order = { online: 0, "gps-lost": 1, off: 2 };
    return (order[a.status] ?? 3) - (order[b.status] ?? 3);
  });

  const onlineCount = teamMembers.filter((m) => m.status === "online").length;
  const offlineCount = teamMembers.filter((m) => m.status === "off").length;
  const gpsLostCount = teamMembers.filter((m) => m.status === "gps-lost").length;

  const membersWithHistory = teamMembers.filter(
    (m) => mockData[m.id] && mockData[m.id][selectedDate],
  );

  useEffect(() => {
    if (currentMode === "member") {
      const currentExists = teamMembers.some(
        (m) => String(m.id) === String(selectedMemberId)
      );
      if (!selectedMemberId || !currentExists) {
        if (membersWithHistory.length > 0) {
          setSelectedMemberId(membersWithHistory[0].id);
        }
      }
    }
  }, [selectedDate, mockData, teamMembers, currentMode, selectedMemberId]);

  // ── Mode label for header ──
  const modeLabel = {
    live:   "Live Tracking",
    member: "Member History",
    team:   "Team Time Travel",
  }[currentMode] || "Tracking";

  return (
    <>
      <style>{CSS}</style>
      <div className="cp-panel">

        {/* ── Header ── */}
        <div className="cp-header">
          <div className="cp-header-brand">
            <div className="cp-header-bar" />
            <h2 className="cp-header-title">{modeLabel}</h2>
          </div>

          {/* Live mode stats */}
          {currentMode === "live" && (
            <div className="cp-stats">
              <div className="cp-stat">
                <div className="cp-stat-val" style={{ color: "#389E0D" }}>{onlineCount}</div>
                <div className="cp-stat-label">Online</div>
              </div>
              <div className="cp-stat">
                <div className="cp-stat-val" style={{ color: "#D46B08" }}>{gpsLostCount}</div>
                <div className="cp-stat-label">No GPS</div>
              </div>
              <div className="cp-stat">
                <div className="cp-stat-val" style={{ color: T.textMuted }}>{offlineCount}</div>
                <div className="cp-stat-label">Offline</div>
              </div>
              <div className="cp-stat">
                <div className="cp-stat-val">{teamMembers.length}</div>
                <div className="cp-stat-label">Total</div>
              </div>
            </div>
          )}

          {/* Member mode filters */}
          {currentMode === "member" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label className="cp-label">Team Member</label>
                <select
                  className="cp-select"
                  value={selectedMemberId ? String(selectedMemberId) : ""}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                >
                  {teamMembers.length === 0 ? (
                    <option value="">No members available</option>
                  ) : (
                    teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}{!mockData[m.id]?.[selectedDate] ? " (No History)" : ""}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="cp-label">Date</label>
                <input
                  type="date"
                  className="cp-date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div className="cp-info-banner">
                <Users size={13} style={{ color: T.brand, flexShrink: 0, marginTop: 1 }} />
                <span>{membersWithHistory.length} member(s) have history for {selectedDate}</span>
              </div>
            </div>
          )}

          {/* Team mode filters */}
          {currentMode === "team" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label className="cp-label">Date</label>
                <input
                  type="date"
                  className="cp-date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div className="cp-info-banner">
                <Clock size={13} style={{ color: T.brand, flexShrink: 0, marginTop: 1 }} />
                <span>Pick a time slot below to see where everyone was at that exact moment.</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Live: member list ── */}
        {currentMode === "live" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 0 }}>
            {/* Clear selection row */}
            {selectedMemberId && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
                <button className="cp-clear-btn" onClick={() => setSelectedMemberId(null)}>
                  <X size={10} /> Clear selection
                </button>
              </div>
            )}

            <div className="cp-members-scroll" style={{ maxHeight: "calc(100vh - 210px)" }}>
              {sortedMembers.map((member) => {
                const sc = getStatusConfig(member.status);
                const bColor = getBatteryColor(member.battery);
                const isOff = member.status === "off";
                const isSelected = selectedMemberId === member.id;

                return (
                  <div
                    key={member.id}
                    className={`cp-member${isSelected ? " selected" : ""}`}
                    onClick={() => onMemberSelect(member.id)}
                  >
                    {/* Avatar */}
                    <div className="cp-avatar-wrap">
                      <div
                        className="cp-avatar"
                        style={{
                          backgroundColor: member.color,
                          opacity: isOff ? 0.5 : 1,
                          filter: isOff ? "grayscale(1)" : "none",
                          borderRadius: 10,
                        }}
                      >
                        {member.initials}
                      </div>
                      <div
                        className="cp-avatar-dot"
                        style={{ backgroundColor: sc.dot }}
                      >
                        <span style={{ color: "#fff", display: "flex", alignItems: "center" }}>
                          {sc.icon}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="cp-member-name">{member.name}</p>
                      <div className="cp-member-sub">
                        <span style={{ color: sc.color, fontWeight: 700 }}>{sc.label}</span>
                        {member.currentLocation?.address && (
                          <>
                            <span>·</span>
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 90 }}>
                              {member.currentLocation.address.split(" ")[0]}…
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Battery */}
                    <div className="cp-battery">
                      <div className="cp-battery-val" style={{ color: bColor }}>
                        <span>{member.battery}%</span>
                        {member.battery > 90
                          ? <BatteryCharging size={12} />
                          : member.battery < 20
                            ? <BatteryWarning size={12} />
                            : <Battery size={12} />}
                      </div>
                      <div className="cp-battery-bar">
                        <div
                          className="cp-battery-fill"
                          style={{ width: `${member.battery}%`, background: bColor }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Timeline (member + team modes) ── */}
        {(currentMode === "member" || currentMode === "team") && (
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }} className="cp-scroll">
            {/* Timeline header */}
            <div className="cp-timeline-header">
              <div className="cp-timeline-header-icon">
                <Clock size={13} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: T.brandDark, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Timeline · 15 min intervals
              </span>
            </div>

            {historyLoading ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 40 }}>
                <div className="cp-spinner" />
                <p style={{ fontSize: 12, color: T.textMuted, fontWeight: 600, margin: 0 }}>Loading history…</p>
              </div>
            ) : (
              <div>
                {timeSlots.map((time) => {
                  const recorded = currentMode === "member"
                    ? !!mockData[selectedMemberId]?.[selectedDate]?.[time]
                    : null;
                  const isActive = time === selectedTime;

                  return (
                    <div
                      key={time}
                      className={`cp-time-slot${isActive ? " active" : ""}`}
                      onClick={() => setSelectedTime(time)}
                    >
                      <span className="cp-time-val">{time}</span>

                      {currentMode === "member" && (
                        <span
                          className="cp-time-badge"
                          style={recorded
                            ? { background: "#F6FFED", color: "#389E0D", border: "1px solid #B7EB8F" }
                            : { background: "#F5F5F5", color: T.textMuted, border: `1px solid ${T.border}` }
                          }
                        >
                          {recorded ? "✓ recorded" : "no data"}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </>
  );
};

export default ControlPanel;


