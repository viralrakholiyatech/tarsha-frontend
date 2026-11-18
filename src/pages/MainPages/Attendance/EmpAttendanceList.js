import React, { useEffect, useState, useRef } from "react";
import ApiService from "../../../services/ApiService";
import { useNavigate } from "react-router-dom";
import { getToken } from "../../../services/useLocalStorage";
import toast from "react-hot-toast";
import { AttendanceRoute } from "../../../config/RouteConfig";
import { fetchAttendancebyTeam } from "../../../config/config";
import MapModal from "./MapModal";
import { FaMapMarkerAlt } from "react-icons/fa";

const BRAND       = "#887549";
const BRAND_LIGHT = "#F5F0E8";
const BRAND_MID   = "#C4A97D";
const BRAND_DARK  = "#5C4E32";

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHS_FULL  = ["January","February","March","April","May","June","July","August","September","October","November","December"];

/* ── Format date as "12 March 2025, Mon" ── */
function formatRowDate(raw) {
  const d = new Date(raw);
  if (isNaN(d)) return raw;
  const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
  return `${d.getDate()} ${MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}, ${weekday}`;
}

/* ── Status Badge ── */
function AttStatusBadge({ attType }) {
  const map = {
    1: { bg: "#E8F5E9", color: "#2E7D32", border: "#A5D6A7", label: "Present",  dot: "#4CAF50" },
    2: { bg: "#FFF8E1", color: "#E65100", border: "#FFCC80", label: "Half Day", dot: "#FF9800" },
    3: { bg: "#FFEBEE", color: "#C62828", border: "#EF9A9A", label: "Absent",   dot: "#EF5350" },
  };
  const s = map[attType];
  if (!s) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
      {s.label}
    </span>
  );
}

/* ── Month Group Card ── */
function MonthGroupCard({ monthYear, meetings, presentCount, absentCount, onShowLocation }) {
  const [collapsed, setCollapsed] = useState(false);
  const halfdayCount = meetings.filter((r) => r.att_type === 2).length;

  // Parse "Jan 2025" → full month name
  const [ms, yr] = monthYear.split(" ");
  const mi = MONTHS_SHORT.indexOf(ms);
  const fullMonth = mi >= 0 ? `${MONTHS_FULL[mi]} ${yr}` : monthYear;

  return (
    <div style={{
      background: "#fff",
      border: "1px solid #EDE5D5",
      borderRadius: 14,
      overflow: "hidden",
      boxShadow: "0 2px 12px rgba(136,117,73,0.07)",
      marginBottom: 20,
    }}
    className="fade-in"
    >
      {/* Month Header */}
      <div
        onClick={() => setCollapsed((c) => !c)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "13px 20px",
          background: BRAND_LIGHT,
          borderBottom: collapsed ? "none" : "1px solid #EDE5D5",
          cursor: "pointer", userSelect: "none",
          flexWrap: "wrap", gap: 10,
        }}
      >
        {/* Left: month + count */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_MID} 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", flexShrink: 0,
          }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.02em" }}>
              {mi >= 0 ? MONTHS_SHORT[mi].toUpperCase() : "—"}
            </span>
          </div>
          <div>
            <p style={{
              margin: 0, fontSize: 15, fontWeight: 700, color: BRAND_DARK,
              fontFamily: "'Sora', sans-serif",
            }}>
              {fullMonth}
            </p>
            <p style={{ margin: 0, fontSize: 12, color: BRAND_MID }}>
              {meetings.length} record{meetings.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Right: stat pills + chevron */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{
            padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
            background: "#E8F5E9", color: "#2E7D32", border: "1px solid #A5D6A7",
          }}>
            ✓ {presentCount} Present
          </span>
          {halfdayCount > 0 && (
            <span style={{
              padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
              background: "#FFF8E1", color: "#E65100", border: "1px solid #FFCC80",
            }}>
              ½ {halfdayCount} Half
            </span>
          )}
          <span style={{
            padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
            background: "#FFEBEE", color: "#C62828", border: "1px solid #EF9A9A",
          }}>
            ✗ {absentCount} Absent
          </span>
          <span style={{
            fontSize: 13, color: "#BFBFBF", marginLeft: 4,
            display: "inline-block",
            transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}>▾</span>
        </div>
      </div>

      {/* Table */}
      {!collapsed && (
        <>
          {/* Column headers */}
          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%", borderCollapse: "collapse",
              fontFamily: "'DM Sans', sans-serif",
            }}>
              <thead>
                <tr style={{ background: "#FDFAF5" }}>
                  {["Date",  "Check In", "Break", "Check Out", "Status"].map((h, i) => (
                    <th key={i} style={{
                      padding: "9px 16px",
                      fontSize: 11, fontWeight: 700, color: BRAND,
                      textTransform: "uppercase", letterSpacing: "0.07em",
                      borderBottom: "1px solid #EDE5D5",
                      textAlign: "left", whiteSpace: "nowrap",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {meetings.map((record, idx) => (
                  <AttRow
                    key={record.id || idx}
                    record={record}
                    idx={idx}
                    isLast={idx === meetings.length - 1}
                    onShowLocation={onShowLocation}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Attendance Row ── */
function AttRow({ record, idx, isLast, onShowLocation }) {
  const [hov, setHov] = useState(false);
  return (
    <tr
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "#FDFAF5" : idx % 2 === 0 ? "#fff" : "#FEFCF9",
        transition: "background 0.15s",
      }}
    >
      {/* Date */}
      <td style={{
        padding: "11px 16px",
        borderBottom: isLast ? "none" : "1px solid #F5EFE4",
        whiteSpace: "nowrap", fontSize: 13, color: "#595959", fontWeight: 500,
      }}>
        {formatRowDate(record.date)}
      </td>

      

      {/* Check In */}
      <td style={{
        padding: "11px 16px",
        borderBottom: isLast ? "none" : "1px solid #F5EFE4",
        whiteSpace: "nowrap",
      }}>
        {record.formatted_checkin ? (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            fontSize: 13, fontWeight: 600, color: "#2E7D32",
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4CAF50", display: "inline-block" }} />
            {record.formatted_checkin}
          </span>
        ) : (
          <span style={{ color: "#BDBDBD", fontSize: 13 }}>—</span>
        )}
      </td>

      {/* Break */}
      <td style={{
        padding: "11px 16px",
        borderBottom: isLast ? "none" : "1px solid #F5EFE4",
        whiteSpace: "nowrap",
      }}>
        {record.total_break_minutes ? (
          <span style={{
            padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
            background: "#FFF8E1", color: "#E65100", border: "1px solid #FFCC80",
          }}>
            {record.total_break_minutes} min
          </span>
        ) : (
          <span style={{ color: "#BDBDBD", fontSize: 13 }}>—</span>
        )}
      </td>

      {/* Check Out */}
      <td style={{
        padding: "11px 16px",
        borderBottom: isLast ? "none" : "1px solid #F5EFE4",
        whiteSpace: "nowrap",
      }}>
        {record.formatted_checkout ? (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            fontSize: 13, fontWeight: 600, color: "#C62828",
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#EF5350", display: "inline-block" }} />
            {record.formatted_checkout}
          </span>
        ) : (
          <span style={{ color: "#BDBDBD", fontSize: 13 }}>—</span>
        )}
      </td>

      {/* Status + Map */}
      <td style={{
        padding: "11px 16px",
        borderBottom: isLast ? "none" : "1px solid #F5EFE4",
        whiteSpace: "nowrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {record.latitude && record.longitude && (
            <button
              onClick={() => onShowLocation(
                record.latitude, record.longitude,
                record.out_latitude || null, record.out_longitude || null
              )}
              title="View Location"
              style={{
                width: 28, height: 28, borderRadius: 7,
                background: "#FFEBEE", border: "1px solid #EF9A9A",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#FFCDD2"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#FFEBEE"; }}
            >
              <FaMapMarkerAlt style={{ color: "#F44336", fontSize: 12 }} />
            </button>
          )}
          <AttStatusBadge attType={record.att_type} />
        </div>
      </td>
    </tr>
  );
}

/* ── Summary Stats ── */
function SummaryStats({ groupedData }) {
  const allRecords = Object.values(groupedData).flatMap((g) => g.meetings);
  const present  = allRecords.filter((r) => r.att_type === 1).length;
  const halfday  = allRecords.filter((r) => r.att_type === 2).length;
  const absent   = allRecords.filter((r) => r.att_type === 3).length;

  const stats = [
    { label: "Total Records", value: allRecords.length, color: BRAND,     bg: BRAND_LIGHT, border: "#D4C4A0" },
    { label: "Present",       value: present,           color: "#2E7D32", bg: "#E8F5E9",   border: "#A5D6A7" },
    { label: "Half Day",      value: halfday,           color: "#E65100", bg: "#FFF8E1",   border: "#FFCC80" },
    { label: "Absent",        value: absent,            color: "#C62828", bg: "#FFEBEE",   border: "#EF9A9A" },
  ];

  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 22, flexWrap: "wrap" }}>
      {stats.map((s) => (
        <div key={s.label} style={{
          flex: "1 1 120px", background: "#fff",
          border: `1px solid ${s.border}`, borderRadius: 12,
          padding: "13px 16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: s.bg, border: `1px solid ${s.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: s.color }}>{s.value}</span>
          </div>
          <span style={{ fontSize: 12, color: "#8C8C8C", fontWeight: 600 }}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Main ── */
const EmpAttedanceList = () => {
  const navigate = useNavigate();

  const [attendanceData, setAttendanceData]   = useState([]);
  const [loading, setLoading]                 = useState(false);
  const [showModal, setShowModal]             = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState({
    checkIn:  { latitude: 0, longitude: 0 },
    checkOut: { latitude: 0, longitude: 0 },
  });

  const header = {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };

  const getEmployeeData = async () => {
    try {
      setLoading(true);
      const res = await ApiService(null, 0, header, fetchAttendancebyTeam.method, fetchAttendancebyTeam.url);
      if (!res.data.error) {
        setAttendanceData(res.data.attendance_data);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.error) toast.error(err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { getEmployeeData(); }, []);

  /* Group by Month Year */
  const groupedData = attendanceData.reduce((acc, r) => {
    const d = new Date(r.date);
    const key = `${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
    if (!acc[key]) acc[key] = { meetings: [], presentCount: 0, absentCount: 0 };
    acc[key].meetings.push(r);
    if (r.att_type === 1) acc[key].presentCount += 1;
    if (r.att_type === 3) acc[key].absentCount  += 1;
    return acc;
  }, {});

  const sortedGroups = Object.entries(groupedData).sort(
    (a, b) => new Date(`01 ${b[0]}`) - new Date(`01 ${a[0]}`)
  );

  const handleShowLocation = (lat, lng, outLat, outLng) => {
    setSelectedCoordinates({
      checkIn:  { latitude: lat,    longitude: lng    },
      checkOut: { latitude: outLat, longitude: outLng },
    });
    setShowModal(true);
  };

  return (
    <>
      <style>{`
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
          border: 3px solid ${BRAND_LIGHT};
          border-top-color: ${BRAND};
          animation: spin 0.8s linear infinite;
        }
      `}</style>

      <div style={{
        minHeight: "100vh", background: "#F8F5F0",
        fontFamily: "'DM Sans', sans-serif", padding: "28px 24px",
      }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{
              width: 4, height: 26, borderRadius: 3,
              background: `linear-gradient(180deg, ${BRAND} 0%, ${BRAND_MID} 100%)`,
            }} />
            <h1 style={{
              margin: 0, fontSize: 22, fontWeight: 800, color: "#1A1A2E",
              fontFamily: "'Sora', sans-serif", letterSpacing: "-0.3px",
            }}>
              My Attendance
            </h1>
          </div>
          <p style={{ margin: "0 0 0 12px", fontSize: 12, color: "#ADADAD" }}>
            Grouped month-wise · {sortedGroups.length} month{sortedGroups.length !== 1 ? "s" : ""} of records
          </p>
        </div>

        {/* ── Summary Stats ── */}
        {!loading && sortedGroups.length > 0 && (
          <SummaryStats groupedData={groupedData} />
        )}

        {/* ── Loading ── */}
        {loading && (
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "80px 0", gap: 16,
          }}>
            <div className="spinner" />
            <p style={{ color: "#BFBFBF", fontSize: 13, margin: 0 }}>Loading attendance…</p>
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && sortedGroups.length === 0 && (
          <div style={{
            textAlign: "center", padding: "64px 0",
            background: "#fff", border: "1px solid #EDE5D5",
            borderRadius: 14,
          }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🗓️</div>
            <p style={{ color: "#BFBFBF", fontSize: 14, margin: 0 }}>No attendance records found.</p>
          </div>
        )}

        {/* ── Month Groups ── */}
        {!loading && sortedGroups.map(([monthYear, { meetings, presentCount, absentCount }], i) => (
          <div key={monthYear} style={{ animationDelay: `${i * 0.07}s` }}>
            <MonthGroupCard
              monthYear={monthYear}
              meetings={meetings}
              presentCount={presentCount}
              absentCount={absentCount}
              onShowLocation={handleShowLocation}
            />
          </div>
        ))}
      </div>

      <MapModal
        latitude={selectedCoordinates.checkIn?.latitude  || 0}
        longitude={selectedCoordinates.checkIn?.longitude || 0}
        outLatitude={selectedCoordinates.checkOut?.latitude  || 0}
        outLongitude={selectedCoordinates.checkOut?.longitude || 0}
        show={showModal}
        handleClose={() => setShowModal(false)}
      />
    </>
  );
};

export default EmpAttedanceList;  