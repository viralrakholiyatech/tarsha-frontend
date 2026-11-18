import React, { useEffect, useState, useRef } from "react";
import ApiService from "../../../services/ApiService";
import { useNavigate } from "react-router-dom";
import { getToken } from "../../../services/useLocalStorage";
import toast from "react-hot-toast";
import { AttendanceRoute } from "../../../config/RouteConfig";
import { fetchAllattendance } from "../../../config/config";
import MapModal from "./MapModal";
import { MdKeyboardArrowRight } from "react-icons/md";
import { FaMapMarkerAlt } from "react-icons/fa";

const BRAND       = "#887549";
const BRAND_LIGHT = "#F5F0E8";
const BRAND_MID   = "#C4A97D";
const BRAND_DARK  = "#5C4E32";

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHS_FULL  = ["January","February","March","April","May","June","July","August","September","October","November","December"];

/* ── Helpers ── */
function formatDateHeading(dateStr) {
  // dateStr like "12 Mar 2025"
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return `${d.getDate()} ${MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}`;
}

function AttStatusBadge({ attType }) {
  const map = {
    1: { bg: "#E8F5E9", color: "#2E7D32", border: "#A5D6A7", label: "Present" },
    2: { bg: "#FFF8E1", color: "#E65100", border: "#FFCC80", label: "Half Day" },
    3: { bg: "#FFEBEE", color: "#C62828", border: "#EF9A9A", label: "Absent" },
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
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: s.color, display: "inline-block",
      }} />
      {s.label}
    </span>
  );
}

/* ── Month Dropdown ── */
function MonthDropdown({ options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "9px 16px", borderRadius: 10,
          background: open ? BRAND : "#fff",
          border: `1.5px solid ${open ? BRAND : "#E0D5C5"}`,
          color: open ? "#fff" : BRAND,
          fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 14,
          cursor: "pointer", transition: "all 0.18s",
          boxShadow: open ? `0 4px 16px ${BRAND}33` : "0 1px 4px rgba(0,0,0,0.06)",
          whiteSpace: "nowrap",
        }}
      >
        📅 {selected}
        <span style={{
          fontSize: 10, marginLeft: 2, display: "inline-block",
          transform: open ? "rotate(180deg)" : "rotate(0)",
          transition: "transform 0.2s",
        }}>▾</span>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0,
          background: "#fff", borderRadius: 12, border: "1px solid #EDE5D5",
          boxShadow: "0 8px 32px rgba(136,117,73,0.15)",
          minWidth: 160, zIndex: 999,
          maxHeight: 280, overflowY: "auto",
          animation: "fadeIn 0.18s ease",
        }}>
          {[...options].reverse().map((opt, i) => {
            const isActive = opt === selected;
            return (
              <div key={i}
                onClick={() => { onChange(opt); setOpen(false); }}
                style={{
                  padding: "9px 16px", fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#fff" : "#434343",
                  background: isActive ? BRAND : "transparent",
                  cursor: "pointer", transition: "background 0.12s",
                  borderBottom: i < options.length - 1 ? "1px solid #F5EFE4" : "none",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = BRAND_LIGHT; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                {opt}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Nav Button ── */
function NavBtn({ label, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 4,
        padding: "8px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600,
        background: hov ? BRAND : "#fff",
        border: `1.5px solid ${hov ? BRAND : "#E0D5C5"}`,
        color: hov ? "#fff" : BRAND,
        cursor: "pointer", transition: "all 0.18s",
        fontFamily: "'Sora', sans-serif",
        boxShadow: hov ? `0 4px 14px ${BRAND}33` : "0 1px 4px rgba(0,0,0,0.05)",
        whiteSpace: "nowrap",
      }}
    >
      {label} <MdKeyboardArrowRight style={{ fontSize: 16 }} />
    </button>
  );
}

/* ── Date Group Card ── */
function DateGroupCard({ date, meetings, presentCount, totalemp, onShowLocation }) {
  const weekday = new Date(date).toLocaleDateString("en-US", { weekday: "long" });

  return (
    <div style={{
      background: "#fff",
      border: "1px solid #EDE5D5",
      borderRadius: 14,
      overflow: "hidden",
      boxShadow: "0 2px 12px rgba(136,117,73,0.07)",
      marginBottom: 18,
    }}
    className="fade-in"
    >
      {/* Date header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "13px 20px",
        background: BRAND_LIGHT,
        borderBottom: "1px solid #EDE5D5",
        flexWrap: "wrap", gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_MID} 100%)`,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            color: "#fff", flexShrink: 0,
          }}>
            <span style={{ fontSize: 14, fontWeight: 800, lineHeight: 1 }}>
              {new Date(date).getDate()}
            </span>
            <span style={{ fontSize: 9, fontWeight: 600, opacity: 0.85 }}>
              {MONTHS_SHORT[new Date(date).getMonth()]}
            </span>
          </div>
          <div>
            <p style={{
              margin: 0, fontSize: 15, fontWeight: 700, color: BRAND_DARK,
              fontFamily: "'Sora', sans-serif",
            }}>
              {formatDateHeading(date)}
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "#212121" }}>{weekday}</p>
          </div>
        </div>

        {/* Present counter */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{
            padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700,
            background: "#E8F5E9", color: "#2E7D32", border: "1px solid #A5D6A7",
          }}>
            ✓ {presentCount} Present
          </span>
          {totalemp && (
            <span style={{
              padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700,
              background: "#fff", color: BRAND, border: `1px solid #D4C4A0`,
            }}>
              / {totalemp} Total
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{
          width: "100%", borderCollapse: "collapse",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          <thead>
            <tr style={{ background: "#FDFAF5" }}>
              {["#", "Employee", "Check In", "Break", "Check Out", "Status"].map((h, i) => (
                <th key={i} style={{
                  padding: "9px 16px",
                  fontSize: 11, fontWeight: 700, color: BRAND,
                  textTransform: "uppercase", letterSpacing: "0.07em",
                  borderBottom: "1px solid #EDE5D5",
                  textAlign: i === 0 ? "center" : "left",
                  whiteSpace: "nowrap",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {meetings.map((record, idx) => (
              <AttRow
                key={record.id}
                record={record}
                idx={idx}
                isLast={idx === meetings.length - 1}
                onShowLocation={onShowLocation}
              />
            ))}
          </tbody>
        </table>
      </div>
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
      {/* Sr */}
      <td style={{
        padding: "11px 16px", textAlign: "center",
        borderBottom: isLast ? "none" : "1px solid #F5EFE4",
        fontSize: 12, color: "#BDBDBD", fontWeight: 600,
      }}>
        {idx + 1}
      </td>

      {/* Name */}
      <td style={{
        padding: "11px 16px",
        borderBottom: isLast ? "none" : "1px solid #F5EFE4",
        whiteSpace: "nowrap",
      }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#1A1A2E" }}>
          {record.first_name} {record.last_name}
        </span>
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
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "#4CAF50", display: "inline-block",
            }} />
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
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "#EF5350", display: "inline-block",
            }} />
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
                cursor: "pointer", transition: "all 0.15s",
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
function SummaryStats({ data, selectedMonthYear }) {
  const present  = data.filter((r) => r.att_type === 1).length;
  const halfday  = data.filter((r) => r.att_type === 2).length;
  const absent   = data.filter((r) => r.att_type === 3).length;

  const stats = [
    { label: "Present",  value: present,  color: "#2E7D32", bg: "#E8F5E9", border: "#A5D6A7" },
    { label: "Half Day", value: halfday,  color: "#E65100", bg: "#FFF8E1", border: "#FFCC80" },
    { label: "Absent",   value: absent,   color: "#C62828", bg: "#FFEBEE", border: "#EF9A9A" },
    { label: "Records",  value: data.length, color: BRAND, bg: BRAND_LIGHT, border: "#D4C4A0" },
  ];

  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 22, flexWrap: "wrap" }}>
      {stats.map((s) => (
        <div key={s.label} style={{
          flex: "1 1 110px", background: "#fff",
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
const List = () => {
  const navigate = useNavigate();

  const currentDate       = new Date();
  const currentMonthIndex = currentDate.getMonth();
  const currentYear       = currentDate.getFullYear();
  const startYear         = currentYear - 1;
  const monthYearOptions  = [];

  for (let year = startYear; year <= currentYear; year++) {
    for (let mi = 0; mi < 12; mi++) {
      if (year === currentYear && mi > currentMonthIndex) break;
      monthYearOptions.push(`${MONTHS_SHORT[mi]} ${year}`);
    }
  }

  const defaultSelected = `${MONTHS_SHORT[currentMonthIndex]} ${currentYear}`;
  const [attendanceData, setAttendanceData]   = useState([]);
  const [totalemp, setTotalEmp]               = useState("");
  const [loading, setLoading]                 = useState(false);
  const [selectedMonthYear, setSelectedMonthYear] = useState(defaultSelected);
  const [showModal, setShowModal]             = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState({
    checkIn: { latitude: 0, longitude: 0 },
    checkOut: { latitude: 0, longitude: 0 },
  });

  const header = {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };

  const getEmployeeData = async () => {
    try {
      setLoading(true);
      const res = await ApiService(null, 0, header, fetchAllattendance.method, fetchAllattendance.url);
      if (!res.data.error) {
        setAttendanceData(res.data.attendance_data);
        setTotalEmp(res.data.total_employee);
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

  const filteredData = attendanceData.filter((r) => {
    const d = new Date(r.date);
    return `${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}` === selectedMonthYear;
  });

  const groupedData = filteredData.reduce((acc, r) => {
    const d = new Date(r.date);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    if (!acc[key]) acc[key] = { meetings: [], presentCount: 0 };
    acc[key].meetings.push(r);
    if (r.att_type === 1) acc[key].presentCount += 1;
    return acc;
  }, {});

  // Sort dates descending
  const sortedDates = Object.keys(groupedData).sort((a, b) => new Date(b) - new Date(a));

  const handleShowLocation = (lat, lng, outLat, outLng) => {
    setSelectedCoordinates({
      checkIn:  { latitude: lat,    longitude: lng    },
      checkOut: { latitude: outLat, longitude: outLng },
    });
    setShowModal(true);
  };

  const [selMonth, selYear] = selectedMonthYear.split(" ");
  const monthIdx = MONTHS_SHORT.indexOf(selMonth);

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
        minHeight: "100vh",
        fontFamily: "'DM Sans', sans-serif", padding: "28px 24px",
      }}>

        {/* ── Header ── */}
        <div style={{
          display: "flex", alignItems: "flex-start",
          justifyContent: "space-between", flexWrap: "wrap",
          gap: 14, marginBottom: 22,
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{
                width: 4, height: 26, borderRadius: 3,
                background: `linear-gradient(180deg, ${BRAND} 0%, ${BRAND_MID} 100%)`,
              }} />
              <h1 style={{
                margin: 0, fontSize: 22, fontWeight: 800, color: "#1A1A2E",
                fontFamily: "'Sora', sans-serif", letterSpacing: "-0.3px",
              }}>
                Attendance
              </h1>
            </div>
            <p style={{ margin: "0 0 0 12px", fontSize: 12, color: "#ADADAD" }}>
              {MONTHS_FULL[monthIdx]} {selYear}
              {totalemp ? ` · ${totalemp} employees` : ""}
            </p>
          </div>

          {/* Actions Row */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <NavBtn label="Leave"         onClick={() => navigate(`/${AttendanceRoute.leavelist}`)} />
            <NavBtn label="Month Data"    onClick={() => navigate(`/${AttendanceRoute.monthlist}`)} />
           
            <MonthDropdown
              options={monthYearOptions}
              selected={selectedMonthYear}
              onChange={setSelectedMonthYear}
            />
          </div>
        </div>

        {/* ── Stats ── */}
        {!loading && filteredData.length > 0 && (
          <SummaryStats data={filteredData} selectedMonthYear={selectedMonthYear} />
        )}

        {/* ── Loading ── */}
        {loading && (
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "80px 0", gap: 16,
          }}>
            <div className="spinner" />
            <p style={{ color: "#BFBFBF", fontSize: 13, margin: 0 }}>Loading attendance data…</p>
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && sortedDates.length === 0 && (
          <div style={{
            textAlign: "center", padding: "64px 0",
            background: "#fff", border: "1px solid #EDE5D5",
            borderRadius: 14,
          }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🗓️</div>
            <p style={{ color: "#BFBFBF", fontSize: 14, margin: 0 }}>
              No attendance records for {selectedMonthYear}
            </p>
          </div>
        )}

        {/* ── Date Groups ── */}
        {!loading && sortedDates.map((date, i) => (
          <div key={date} style={{ animationDelay: `${i * 0.06}s` }}>
            <DateGroupCard
              date={date}
              meetings={groupedData[date].meetings}
              presentCount={groupedData[date].presentCount}
              totalemp={totalemp}
              onShowLocation={handleShowLocation}
            />
          </div>
        ))}
      </div>

      <MapModal
        latitude={selectedCoordinates.checkIn?.latitude || 0}
        longitude={selectedCoordinates.checkIn?.longitude || 0}
        outLatitude={selectedCoordinates.checkOut?.latitude || 0}
        outLongitude={selectedCoordinates.checkOut?.longitude || 0}
        show={showModal}
        handleClose={() => setShowModal(false)}
      />
    </>
  );
};

export default List;