import React, { useState, useEffect } from "react";
import ApiService from "../../../services/ApiService";
import { getToken } from "../../../services/useLocalStorage";
import toast from "react-hot-toast";
import { fetchmonthattendancedata } from "../../../config/config";
import { useNavigate } from "react-router-dom";
import { AttendanceRoute } from "../../../config/RouteConfig";
import { MdOutlineArrowBackIosNew } from "react-icons/md";
import { FileUrl } from "../../../config/file_url";

const BRAND = "#887549";
const BRAND_LIGHT = "#F5F0E8";
const BRAND_MID = "#C4A97D";
const BRAND_DARK = "#5C4E32";

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const MONTHS_FULL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const STATUS = {
  present: { bg: "#E8F5E9", color: "#2E7D32", border: "#A5D6A7", label: "P" },
  half: { bg: "#FFF8E1", color: "#E65100", border: "#FFCC80", label: "H" },
  leave: { bg: "#EDE7F6", color: "#6A1B9A", border: "#CE93D8", label: "L" },
  absent: { bg: "#FFEBEE", color: "#C62828", border: "#EF9A9A", label: "A" },
  sunday: { bg: "#F0F0F0", color: "#BDBDBD", border: "#E0E0E0", label: "—" },
  future: { bg: "#F5F5F5", color: "#BDBDBD", border: "#E0E0E0", label: "·" },
};
const pad = (n) => String(n).padStart(2, "0");

const toYMD = (value) => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

function Avatar({ src, name }) {
  const [err, setErr] = useState(false);
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";
  if (err || !src) {
    return (
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          flexShrink: 0,
          background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_MID} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontWeight: 700,
          fontSize: 12,
        }}
      >
        {initials}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      onError={() => setErr(true)}
      style={{
        width: 34,
        height: 34,
        borderRadius: "50%",
        objectFit: "cover",
        flexShrink: 0,
      }}
    />
  );
}

function StatPill({ value, sub, label }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "#fff",
        border: `1px solid #EDE5D5`,
        borderRadius: 12,
        padding: "12px 16px",
        boxShadow: "0 1px 6px rgba(136,117,73,0.07)",
        flex: "1 1 130px",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 10,
          background: BRAND_LIGHT,
          border: `1px solid #D4C4A0`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <span
          style={{ fontSize: 15, fontWeight: 800, color: BRAND, lineHeight: 1 }}
        >
          {value}
        </span>
        {sub && (
          <span style={{ fontSize: 9, color: BRAND_MID, fontWeight: 600 }}>
            {sub}
          </span>
        )}
      </div>
      <span style={{ fontSize: 12, color: "#8C8C8C", fontWeight: 600 }}>
        {label}
      </span>
    </div>
  );
}

function MonthData() {
  const navigate = useNavigate();

  const currentDate = new Date();
  const currentMonthIndex = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const startYear = currentYear - 1;

  const monthYearOptions = [];
  for (let year = startYear; year <= currentYear; year++) {
    for (let mi = 0; mi < 12; mi++) {
      if (year === currentYear && mi > currentMonthIndex) break;
      monthYearOptions.push(`${MONTHS_SHORT[mi]} ${year}`);
    }
  }

  const defaultSelected = `${MONTHS_SHORT[currentMonthIndex]} ${currentYear}`;
  const [selectedMonthYear, setSelectedMonthYear] = useState(defaultSelected);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [monthdata, setMonthData] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const header = {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };

  const fetchData = async (month) => {
    try {
      setLoading(true);
      const res = await ApiService(
        null,
        month,
        header,
        fetchmonthattendancedata.method,
        fetchmonthattendancedata.url,
      );
      if (!res.data.error) {
        setData(res.data.attendance_data || []);
        setMonthData(res.data.monthwise || []);
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

  useEffect(() => {
    const [sel] = selectedMonthYear.split(" ");
    const mi = MONTHS_SHORT.indexOf(sel) + 1;
    fetchData(mi);
  }, [selectedMonthYear]);

  const [selMonth, selYear] = selectedMonthYear.split(" ");
  const monthIndex = MONTHS_SHORT.indexOf(selMonth);
  const daysInMonth = new Date(parseInt(selYear), monthIndex + 1, 0).getDate();
  const dateHeaders = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const today = new Date();
  const todayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const attMap = {};
monthdata.forEach((r) => {
  attMap[`${r.user_id}_${toYMD(r.date)}`] = r;
});

  // Summary stats across all employees for selected month
  const totalPresent = data.reduce(
    (s, i) => s + (Number(i.total_present) || 0),
    0,
  );
  const totalHalf = data.reduce(
    (s, i) => s + (Number(i.total_half_day) || 0),
    0,
  );
  const totalEmployees = data.length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
        .att-row:hover { background: #FDFAF5 !important; }
        .att-cell { transition: transform 0.12s; }
        .att-cell:hover { transform: scale(1.12); z-index: 2; position: relative; }
        .month-option:hover { background: ${BRAND_LIGHT} !important; color: ${BRAND} !important; }

        /* Sticky first two columns */
        .sticky-col-1 {
          position: sticky; left: 0; z-index: 3;
          background: inherit;
        }
        .sticky-col-2 {
          position: sticky; left: 190px; z-index: 3;
          background: inherit;
        }
        thead .sticky-col-1,
        thead .sticky-col-2 {
          z-index: 4;
        }

        /* Thin scrollbar */
        .att-scroll::-webkit-scrollbar { height: 6px; }
        .att-scroll::-webkit-scrollbar-track { background: #F5F0E8; border-radius: 3px; }
        .att-scroll::-webkit-scrollbar-thumb { background: ${BRAND_MID}; border-radius: 3px; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          width: 28px; height: 28px; border-radius: 50%;
          border: 3px solid ${BRAND_LIGHT};
          border-top-color: ${BRAND};
          animation: spin 0.8s linear infinite;
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          fontFamily: "'DM Sans', sans-serif",
          padding: "28px 24px",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => navigate(`/${AttendanceRoute.list}`)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "#fff",
                border: `1px solid #EDE5D5`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: BRAND,
                fontSize: 15,
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              <MdOutlineArrowBackIosNew />
            </button>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 4,
                    height: 24,
                    borderRadius: 3,
                    background: `linear-gradient(180deg, ${BRAND} 0%, ${BRAND_MID} 100%)`,
                  }}
                />
                <h1
                  style={{
                    margin: 0,
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#1A1A2E",
                    fontFamily: "'Sora', sans-serif",
                    letterSpacing: "-0.3px",
                  }}
                >
                  Attendance
                </h1>
              </div>
              <p
                style={{
                  margin: "3px 0 0 12px",
                  fontSize: 12,
                  color: "#ADADAD",
                }}
              >
                {MONTHS_FULL[monthIndex]} {selYear} · {totalEmployees} employee
                {totalEmployees !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Month Selector */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 16px",
                borderRadius: 10,
                background: dropdownOpen ? BRAND : "#fff",
                border: `1.5px solid ${dropdownOpen ? BRAND : "#E0D5C5"}`,
                color: dropdownOpen ? "#fff" : BRAND,
                fontFamily: "'Sora', sans-serif",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                transition: "all 0.18s",
                boxShadow: dropdownOpen
                  ? `0 4px 16px ${BRAND}33`
                  : "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              📅 {selectedMonthYear}
              <span
                style={{
                  fontSize: 10,
                  marginLeft: 2,
                  display: "inline-block",
                  transform: dropdownOpen ? "rotate(180deg)" : "rotate(0)",
                  transition: "transform 0.2s",
                }}
              >
                ▾
              </span>
            </button>
            {dropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  right: 0,
                  background: "#fff",
                  borderRadius: 12,
                  border: "1px solid #EDE5D5",
                  boxShadow: "0 8px 32px rgba(136,117,73,0.15)",
                  minWidth: 160,
                  zIndex: 999,
                  overflow: "hidden",
                  maxHeight: 280,
                  overflowY: "auto",
                  animation: "fadeIn 0.18s ease",
                }}
              >
                {[...monthYearOptions].reverse().map((opt, i) => (
                  <div
                    key={i}
                    className="month-option"
                    onClick={() => {
                      setSelectedMonthYear(opt);
                      setDropdownOpen(false);
                    }}
                    style={{
                      padding: "9px 16px",
                      fontSize: 13,
                      fontWeight: opt === selectedMonthYear ? 700 : 500,
                      color: opt === selectedMonthYear ? "#fff" : "#434343",
                      background:
                        opt === selectedMonthYear ? BRAND : "transparent",
                      cursor: "pointer",
                      transition: "background 0.12s",
                      borderBottom:
                        i < monthYearOptions.length - 1
                          ? "1px solid #F5EFE4"
                          : "none",
                    }}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Summary Stats ── */}
        {!loading && (
          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 22,
              flexWrap: "wrap",
            }}
            className="fade-in"
          >
            <StatPill value={totalEmployees} label="Employees" />
            <StatPill value={totalPresent} label="Total Present Days" />
            <StatPill value={totalHalf} label="Total Half Days" />
          </div>
        )}

        {/* ── Legend ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          {[
            { ...STATUS.present, text: "Present" },
            { ...STATUS.half, text: "Half Day" },
            { ...STATUS.leave, text: "Leave" },
            { ...STATUS.absent, text: "Absent" },
            { ...STATUS.sunday, text: "Sunday / Holiday" },
          ].map((s) => (
            <div
              key={s.text}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  background: s.bg,
                  border: `1px solid ${s.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 800,
                  color: s.color,
                }}
              >
                {s.label}
              </div>
              <span style={{ fontSize: 12, color: "#8C8C8C", fontWeight: 500 }}>
                {s.text}
              </span>
            </div>
          ))}
        </div>

        {/* ── Table ── */}
        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            border: "1px solid #EDE5D5",
            boxShadow: "0 2px 16px rgba(136,117,73,0.08)",
            overflow: "hidden",
          }}
        >
          {loading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "64px 0",
                gap: 16,
              }}
            >
              <div className="spinner" />
              <p style={{ color: "#BFBFBF", fontSize: 13, margin: 0 }}>
                Loading attendance data…
              </p>
            </div>
          ) : data.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🗓️</div>
              <p style={{ color: "#BFBFBF", fontSize: 14, margin: 0 }}>
                No attendance data for {MONTHS_FULL[monthIndex]} {selYear}
              </p>
            </div>
          ) : (
            <div className="att-scroll" style={{ overflowX: "auto" }}>
              <table
                style={{
                  borderCollapse: "separate",
                  borderSpacing: 0,
                  width: "100%",
                  minWidth: "max-content",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <thead>
                  <tr style={{ background: BRAND_LIGHT }}>
                    {/* Name header — sticky */}
                    <th
                      className="sticky-col-1"
                      style={{
                        padding: "12px 16px",
                        background: BRAND_LIGHT,
                        borderBottom: `2px solid #D4C4A0`,
                        borderRight: `1px solid #D4C4A0`,
                        textAlign: "left",
                        whiteSpace: "nowrap",
                        fontSize: 11,
                        fontWeight: 700,
                        color: BRAND,
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        minWidth: 190,
                      }}
                    >
                      Employee
                    </th>

                    {/* Total Present — sticky */}
                    <th
                      className="sticky-col-2"
                      style={{
                        padding: "12px 14px",
                        background: BRAND_LIGHT,
                        borderBottom: `2px solid #D4C4A0`,
                        borderRight: `1px solid #EDE5D5`,
                        textAlign: "center",
                        whiteSpace: "nowrap",
                        fontSize: 11,
                        fontWeight: 700,
                        color: BRAND,
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        minWidth: 110,
                      }}
                    >
                      Present
                    </th>

                    {/* Date columns */}
                    {dateHeaders.map((day) => {
                      const cellDate = new Date(selYear, monthIndex, day);
                      const weekday = cellDate.toLocaleDateString("en-US", {
                        weekday: "short",
                      });
                      const isSun = cellDate.getDay() === 0;
                      const isSat = cellDate.getDay() === 6;
                      const isToday =
                        cellDate.toDateString() === today.toDateString();
                      return (
                        <th
                          key={day}
                          style={{
                            padding: "8px 6px",
                            background:
                              isSun || isSat
                                ? "#EDE8DF"
                                : isToday
                                  ? `${BRAND}18`
                                  : BRAND_LIGHT,
                            borderBottom: `2px solid ${isToday ? BRAND : "#D4C4A0"}`,
                            textAlign: "center",
                            minWidth: 46,
                            fontSize: 10,
                            fontWeight: isToday ? 800 : 600,
                            color: isSun
                              ? "#BDBDBD"
                              : isToday
                                ? BRAND_DARK
                                : BRAND,
                            whiteSpace: "nowrap",
                          }}
                        >
                          <div style={{ lineHeight: 1.2 }}>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>
                              {day}
                            </div>
                            <div style={{ fontSize: 9, opacity: 0.7 }}>
                              {weekday}
                            </div>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody>
                  {data.map((item, rowIdx) => (
                    <tr
                      key={rowIdx}
                      className="att-row"
                      style={{
                        background: rowIdx % 2 === 0 ? "#fff" : "#FDFAF5",
                        transition: "background 0.15s",
                      }}
                    >
                      {/* Name cell — sticky */}
                      <td
                        className="sticky-col-1"
                        style={{
                          padding: "10px 16px",
                          borderBottom: "1px solid #F5EFE4",
                          borderRight: "1px solid #D4C4A0",
                          background: rowIdx % 2 === 0 ? "#fff" : "#FDFAF5",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <Avatar
                            src={
                              item.profile_picture
                                ? `${FileUrl}/${item.profile_picture.split(",")[0]}`
                                : null
                            }
                            name={`${item.first_name || ""} ${item.last_name || ""}`}
                          />
                          <div>
                            <p
                              style={{
                                margin: 0,
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#1A1A2E",
                              }}
                            >
                              {item.first_name} {item.last_name}
                            </p>
                            {item.designation && (
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 11,
                                  color: "#ADADAD",
                                }}
                              >
                                {item.designation}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Total Present — sticky */}
                      <td
                        className="sticky-col-2"
                        style={{
                          padding: "10px 14px",
                          borderBottom: "1px solid #F5EFE4",
                          borderRight: "1px solid #EDE5D5",
                          background: rowIdx % 2 === 0 ? "#fff" : "#FDFAF5",
                          textAlign: "center",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 16,
                            fontWeight: 800,
                            color: BRAND_DARK,
                          }}
                        >
                          {item.total_present_and_half}
                        </span>
                        <div
                          style={{
                            fontSize: 10,
                            color: "#212121",
                            marginTop: 1,
                          }}
                        >
                          {item.total_present}P + {item.total_half_day}H
                        </div>
                      </td>

                      {/* Attendance cells */}
                      {dateHeaders.map((day) => {
                        const cellDate = new Date(selYear, monthIndex, day);
                        const isSunday = cellDate.getDay() === 0;
                        const isFuture =
                          cellDate.getTime() > todayMidnight.getTime();
                 const formattedDate = `${selYear}-${pad(monthIndex + 1)}-${pad(day)}`;
const rec = attMap[`${item.user_id}_${formattedDate}`];

                        let s;
                        if (isSunday) s = STATUS.sunday;
                        else if (isFuture) s = STATUS.future;
                        else if (rec) {
                          if (rec.att_type === 1) s = STATUS.present;
                          else if (rec.att_type === 2) s = STATUS.half;
                          else if (rec.att_type === 3) s = STATUS.leave;
                          else if (rec.att_type === 4) s = STATUS.absent;
                          else s = STATUS.absent;
                        } else s = STATUS.absent;

                        return (
                          <td
                            key={day}
                            style={{
                              padding: "6px 4px",
                              borderBottom: "1px solid #F5EFE4",
                              textAlign: "center",
                              background: s.bg,
                            }}
                          >
                            <div
                              className="att-cell"
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 7,
                                background: s.bg,
                                border: `1px solid ${s.border}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto",
                                fontSize: 11,
                                fontWeight: 800,
                                color: s.color,
                                cursor: "default",
                              }}
                            >
                              {s.label}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default MonthData;
