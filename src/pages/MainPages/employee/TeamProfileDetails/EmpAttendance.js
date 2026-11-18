// ─────────────────────────────────────────────
//  EmpAttendance.jsx  —  Employee Attendance
//  Same brand design system as the rest of app
// ─────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import ApiService from "../../../../services/ApiService";
import { useParams } from "react-router-dom";
import { getToken } from "../../../../services/useLocalStorage";
import toast from "react-hot-toast";
import { AttendanceforTeamid } from "../../../../config/config";
import MapModal from "../../Attendance/MapModal";


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
  @keyframes eatFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .eat-fade { animation:eatFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes eatSpin { to{transform:rotate(360deg)} }
  .eat-spinner {
    width:28px;height:28px;border-radius:50%;
    border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};
    animation:eatSpin 0.8s linear infinite;
  }

  /* ── Table ── */
  .eat-table { width:100%;border-collapse:collapse;font-family:'DM Sans',sans-serif; }
  .eat-table th {
    padding:9px 14px;font-size:11px;font-weight:700;color:${THEME.brandDark};
    text-transform:uppercase;letter-spacing:0.07em;
    background:${THEME.brandLight};border-bottom:2px solid #D4C4A0;white-space:nowrap;
  }
  .eat-table td {
    padding:11px 14px;border-bottom:1px solid #F5EFE4;
    vertical-align:middle;font-size:13px;
  }
  .eat-table tbody tr:nth-child(even) { background:${THEME.rowAlt}; }
  .eat-table tbody tr:hover { background:${THEME.rowHover}; }

  /* ── Status badges ── */
  .eat-badge {
    display:inline-flex;align-items:center;gap:5px;
    padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;white-space:nowrap;
  }
  .eat-badge .dot { width:6px;height:6px;border-radius:50%; }
  .eat-badge.present  { background:#F6FFED;color:#389E0D;border:1px solid #B7EB8F; }
  .eat-badge.present .dot  { background:#389E0D; }
  .eat-badge.halfday  { background:#FFF7E6;color:#D46B08;border:1px solid #FFD591; }
  .eat-badge.halfday .dot  { background:#D46B08; }
  .eat-badge.absent   { background:#FFF1F0;color:#CF1322;border:1px solid #FFA39E; }
  .eat-badge.absent .dot   { background:#CF1322; }

  /* ── Map pin button ── */
  .eat-pin {
    width:26px;height:26px;border-radius:50%;border:1.5px solid #FFA39E;
    background:#FFF1F0;display:inline-flex;align-items:center;justify-content:center;
    cursor:pointer;transition:all 0.15s;flex-shrink:0;
  }
  .eat-pin:hover { background:#CF1322;border-color:#CF1322; }
  .eat-pin:hover svg { fill:#fff; }

  ::-webkit-scrollbar { width:5px;height:5px; }
  ::-webkit-scrollbar-track { background:${THEME.brandLight}; }
  ::-webkit-scrollbar-thumb { background:${THEME.brandMid};border-radius:10px; }
`;


// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
}

function StatusBadge({ attType }) {
  if (attType === 1) return <span className="eat-badge present"><span className="dot" />Present</span>;
  if (attType === 2) return <span className="eat-badge halfday"><span className="dot" />Half Day</span>;
  if (attType === 3) return <span className="eat-badge absent"><span className="dot" />Absent</span>;
  return null;
}

function MapPinBtn({ onClick }) {
  return (
    <button className="eat-pin" onClick={onClick} title="View location">
      <svg width="11" height="14" viewBox="0 0 12 16" fill="#CF1322" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 0C3.24 0 1 2.24 1 5c0 3.75 5 11 5 11s5-7.25 5-11c0-2.76-2.24-5-5-5zm0 6.5C5.17 6.5 4.5 5.83 4.5 5S5.17 3.5 6 3.5 7.5 4.17 7.5 5 6.83 6.5 6 6.5z"/>
      </svg>
    </button>
  );
}


// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const EmpAttendance = () => {
  const params = useParams();
  const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };

  const [attendanceData,      setAttendanceData]      = useState([]);
  const [loading,             setLoading]             = useState(false);
  const [showModal,           setShowModal]           = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState({
    checkIn:  { latitude: 0, longitude: 0 },
    checkOut: { latitude: 0, longitude: 0 },
  });

  const getEmployeeData = async () => {
    setLoading(true);
    try {
      const res = await ApiService(null, params.id, header, AttendanceforTeamid.method, AttendanceforTeamid.url);
      if (!res.data.error) {
        setAttendanceData(res.data.attendance_data || []);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally { setLoading(false); }
  };

  useEffect(() => { getEmployeeData(); }, []);

  const handleShowLocation = (lat, lng, outLat, outLng) => {
    setSelectedCoordinates({
      checkIn:  { latitude: lat  || 0, longitude: lng    || 0 },
      checkOut: { latitude: outLat || 0, longitude: outLng || 0 },
    });
    setShowModal(true);
  };

  // ── Group by month-year, sorted descending ─
  const groupedData = React.useMemo(() => {
    const acc = {};
    attendanceData.forEach((rec) => {
      const d = new Date(rec.date);
      const key = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
      if (!acc[key]) acc[key] = { meetings: [], present: 0, halfday: 0, absent: 0 };
      acc[key].meetings.push(rec);
      if (rec.att_type === 1) acc[key].present  += 1;
      else if (rec.att_type === 2) acc[key].halfday += 1;
      else if (rec.att_type === 3) acc[key].absent  += 1;
    });
    return Object.entries(acc).sort(
      ([a], [b]) => new Date(`01 ${b}`) - new Date(`01 ${a}`)
    );
  }, [attendanceData]);

  // ── Summary across all data ────────────────
  const summary = React.useMemo(() => ({
    present:  attendanceData.filter((r) => r.att_type === 1).length,
    halfday:  attendanceData.filter((r) => r.att_type === 2).length,
    absent:   attendanceData.filter((r) => r.att_type === 3).length,
    total:    attendanceData.length,
  }), [attendanceData]);

  return (
    <>
      <style>{CSS}</style>

      <div style={{ minHeight: "100vh", background: THEME.bg, fontFamily: "'DM Sans',sans-serif", padding: "28px 24px" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <div style={{ width: 4, height: 26, borderRadius: 3, background: `linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: THEME.text, fontFamily: "'Sora',sans-serif", letterSpacing: "-0.3px" }}>
            Attendance
          </h1>
        </div>

        {/* ── Stats bar ── */}
        {!loading && attendanceData.length > 0 && (
          <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
            {[
              { label: "Total Days",  value: summary.total,   color: THEME.brand  },
              { label: "Present",     value: summary.present, color: "#389E0D"    },
              { label: "Half Day",    value: summary.halfday, color: "#D46B08"    },
              { label: "Absent",      value: summary.absent,  color: "#CF1322"    },
            ].map((s) => (
              <div key={s.label} style={{
                background: "#fff", border: `1px solid ${THEME.border}`, borderRadius: 10,
                padding: "10px 18px", borderTop: `3px solid ${s.color}`,
                boxShadow: "0 2px 8px rgba(136,117,73,0.06)", minWidth: 120,
              }}>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>{s.label}</p>
                <p style={{ margin: "3px 0 0", fontSize: 20, fontWeight: 800, color: s.color, fontFamily: "'Sora',sans-serif" }}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0", gap: 16 }}>
            <div className="eat-spinner" />
            <p style={{ color: THEME.textLight, fontSize: 13, margin: 0 }}>Loading attendance…</p>
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && attendanceData.length === 0 && (
          <div style={{ textAlign: "center", padding: "64px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📅</div>
            <p style={{ color: THEME.textLight, fontSize: 14, margin: 0 }}>No attendance records found.</p>
          </div>
        )}

        {/* ── Month groups ── */}
        {!loading && groupedData.map(([monthYear, { meetings, present, halfday, absent }]) => (
          <div key={monthYear} className="eat-fade" style={{ marginBottom: 20 }}>

            {/* Month header card */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexWrap: "wrap", gap: 10, marginBottom: 10,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 3, height: 16, borderRadius: 2, background: `linear-gradient(180deg,${THEME.brand},${THEME.brandMid})` }} />
                <h2 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: THEME.text, fontFamily: "'Sora',sans-serif" }}>
                  {monthYear}
                </h2>
              </div>
              {/* Mini stats row */}
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { label: "P", value: present, color: "#389E0D", bg: "#F6FFED", border: "#B7EB8F" },
                  { label: "H", value: halfday, color: "#D46B08", bg: "#FFF7E6", border: "#FFD591" },
                  { label: "A", value: absent,  color: "#CF1322", bg: "#FFF1F0", border: "#FFA39E" },
                ].map((s) => (
                  <span key={s.label} style={{
                    padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                    display: "inline-flex", alignItems: "center", gap: 4,
                  }}>
                    {s.label}: {s.value}
                  </span>
                ))}
              </div>
            </div>

            {/* Table card */}
            <div style={{ background: "#fff", border: `1px solid ${THEME.border}`, borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 10px rgba(136,117,73,0.06)" }}>
              <div style={{ overflowX: "auto" }}>
                <table className="eat-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Check In</th>
                      <th>Break</th>
                      <th>Check Out</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meetings.map((record) => (
                      <tr key={record.id}>
                        {/* Date */}
                        <td>
                          <span style={{ fontWeight: 600, color: THEME.text }}>
                            {fmtDate(record.date)}
                          </span>
                        </td>

                        {/* Check In */}
                        <td>
                          {record.formatted_checkin ? (
                            <span style={{ color: "#389E0D", fontWeight: 600 }}>
                              {record.formatted_checkin}
                            </span>
                          ) : (
                            <span style={{ color: THEME.textLight }}>—</span>
                          )}
                        </td>

                        {/* Break */}
                        <td>
                          {record.total_break_minutes ? (
                            <span style={{ fontSize: 12, color: "#D46B08", fontWeight: 600 }}>
                              {record.total_break_minutes}
                            </span>
                          ) : (
                            <span style={{ color: THEME.textLight }}>—</span>
                          )}
                        </td>

                        {/* Check Out */}
                        <td>
                          {record.formatted_checkout ? (
                            <span style={{ color: "#CF1322", fontWeight: 600 }}>
                              {record.formatted_checkout}
                            </span>
                          ) : (
                            <span style={{ color: THEME.textLight }}>—</span>
                          )}
                        </td>

                        {/* Status + Location */}
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <StatusBadge attType={record.att_type} />
                            {record.latitude && record.longitude && (
                              <MapPinBtn
                                onClick={() => handleShowLocation(
                                  record.latitude, record.longitude,
                                  record.out_latitude || null, record.out_longitude || null,
                                )}
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>

      <MapModal
        latitude={selectedCoordinates.checkIn.latitude}
        longitude={selectedCoordinates.checkIn.longitude}
        outLatitude={selectedCoordinates.checkOut.latitude}
        outLongitude={selectedCoordinates.checkOut.longitude}
        show={showModal}
        handleClose={() => setShowModal(false)}
      />
    </>
  );
};

export default EmpAttendance;