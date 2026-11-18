import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  memo,
  useRef,
} from "react";
import {
  deleteCampaign,
  fetchAdmincampaign,
  StatusCampaign,
} from "../../../config/config";
import ApiService from "../../../services/ApiService";
import { getToken } from "../../../services/useLocalStorage";
import { useNavigate } from "react-router-dom";
import { CampaignRoute } from "../../../config/RouteConfig";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import toast from "react-hot-toast";
import { FileUrl } from "../../../config/file_url";
import { getFileDisplayUrl, openFileInNewTab } from "../../../services/S3Service";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
} from "date-fns";

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
  textMuted: "#ADADAD",
  textLight: "#BDBDBD",
};

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

  /* Tab pills */
  .cl-tab {
    padding:8px 16px; border-radius:20px; cursor:pointer;
    font-size:12px; font-weight:600; border:1.5px solid transparent;
    background:transparent; color:#595959; transition:all 0.18s;
    font-family:'DM Sans',sans-serif; white-space:nowrap;
  }
  .cl-tab:hover { background:${THEME.brandLight}; color:${THEME.brand}; }
  .cl-tab.active {
    background:${THEME.brandLight}; color:${THEME.brand};
    border-color:${THEME.brand}; font-weight:700;
  }

  /* Table */
  .cl-table { width:100%; border-collapse:collapse; font-family:'DM Sans',sans-serif; }
  .cl-table th {
    padding:10px 14px; font-size:11px; font-weight:700;
    color:${THEME.brandDark}; text-transform:uppercase; letter-spacing:0.07em;
    background:${THEME.brandLight}; border-bottom:2px solid #D4C4A0;
    white-space:nowrap;
  }
  .cl-table td {
    padding:11px 14px; font-size:13px; color:${THEME.text};
    border-bottom:1px solid #F5EFE4; vertical-align:middle;
  }
  .cl-table tbody tr:nth-child(even) { background:${THEME.rowAlt}; }
  .cl-table tbody tr:hover { background:${THEME.rowHover}; }

  /* Toggle switch */
  .cl-toggle { position:relative; display:inline-flex; align-items:center; cursor:pointer; }
  .cl-toggle input { opacity:0; width:0; height:0; position:absolute; }
  .cl-toggle-track {
    width:38px; height:22px; background:#E0D5C5; border-radius:11px;
    transition:background 0.2s; flex-shrink:0;
  }
  .cl-toggle input:checked ~ .cl-toggle-track { background:${THEME.brand}; }
  .cl-toggle-thumb {
    position:absolute; left:3px; top:3px;
    width:16px; height:16px; border-radius:50%;
    background:#fff; transition:transform 0.2s;
    box-shadow:0 1px 3px rgba(0,0,0,0.2);
  }
  .cl-toggle input:checked ~ .cl-toggle-thumb { transform:translateX(16px); }

  /* Calendar */
  .cal-grid {
    display:grid; grid-template-columns:repeat(7,1fr);
    border-radius:12px; overflow:hidden;
    border:1px solid ${THEME.border};
  }
  .cal-day-header {
    padding:10px; text-align:center; font-size:11px; font-weight:700;
    color:${THEME.brandDark}; text-transform:uppercase; letter-spacing:0.06em;
    background:${THEME.brandLight}; border-bottom:2px solid #D4C4A0;
  }
  .cal-cell {
    min-height:90px; padding:6px 8px; background:#fff;
    border-right:1px solid #F5EFE4; border-bottom:1px solid #F5EFE4;
    vertical-align:top; position:relative;
  }
  .cal-cell:nth-child(7n) { border-right:none; }
  .cal-cell.today { background:#FFFBF0; }
  .cal-cell.empty { background:${THEME.bg}; }
  .cal-date {
    font-size:12px; font-weight:700; color:${THEME.textMuted};
    margin-bottom:4px; display:inline-flex; align-items:center;
    justify-content:center; width:22px; height:22px; border-radius:50%;
  }
  .cal-cell.today .cal-date {
    background:${THEME.brand}; color:#fff;
  }
  .cal-event {
    font-size:10px; padding:2px 6px; margin-bottom:2px; border-radius:6px;
    overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
    cursor:pointer; font-weight:600; transition:opacity 0.15s;
  }
  .cal-event:hover { opacity:0.8; }

  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background:${THEME.brandLight}; }
  ::-webkit-scrollbar-thumb { background:${THEME.brandMid}; border-radius:10px; }
`;

const BUDGET_TYPE = { 1: "Monthly", 2: "Weekly", 3: "Daily" };
const PLATFORM_ICONS = {
  1: { label: "Instagram", color: "#E1306C", bg: "#FEE2F0" },
  2: { label: "LinkedIn",  color: "#0A66C2", bg: "#E8F1FB" },
  3: { label: "Facebook",  color: "#1877F2", bg: "#E7F0FD" },
};
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ─────────────────────────────────────────────
//  🧩  ATOMS
// ─────────────────────────────────────────────

function AddBtn({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "9px 18px",
        borderRadius: 10,
        border: "none",
        background: hov ? THEME.brandDark : THEME.brand,
        color: "#fff",
        fontSize: 13,
        fontWeight: 700,
        cursor: "pointer",
        fontFamily: "'Sora',sans-serif",
        transition: "all 0.18s",
        boxShadow: `0 2px 8px ${THEME.brand}44`,
      }}
    >
      + Add Campaign
    </button>
  );
}

function ImageModal({ url, onClose }) {
  if (!url) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        animation: "clFadeIn 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          maxWidth: "90vw",
          maxHeight: "90vh",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
          animation: "clFadeIn 0.25s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 10,
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.6)",
            border: "none",
            color: "#fff",
            fontSize: 18,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(0,0,0,0.9)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "rgba(0,0,0,0.6)")
          }
        >
          ×
        </button>
        <img
          src={url}
          alt="Campaign thumbnail"
          style={{
            display: "block",
            maxWidth: "90vw",
            maxHeight: "85vh",
            objectFit: "contain",
            background: "#000",
          }}
        />
      </div>
    </div>
  );
}

function DeleteIconBtn({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      title="Delete"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: 4,
        color: hov ? "#FF4D4F" : "#FF8096",
        transition: "color 0.15s",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          d="M17.5 4.98c-2.775-.275-5.567-.417-8.35-.417q-2.475 0-4.95.25l-1.7.167"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="m7.083 4.142.183-1.092C7.4 2.258 7.5 1.667 8.908 1.667h2.183c1.408 0 1.517.625 1.642 1.392l.183 1.083"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="m15.707 7.617-.542 8.392c-.092 1.308-.167 2.325-2.492 2.325h-5.35c-2.325 0-2.4-1.017-2.492-2.325l-.542-8.392"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.607 13.75h2.775M7.913 10.417h4.167"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

/** Custom branded toggle */
function Toggle({ checked, onChange }) {
  return (
    <label className="cl-toggle" title={checked ? "Active" : "Inactive"}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <div className="cl-toggle-track" />
      <div className="cl-toggle-thumb" />
    </label>
  );
}

const InstagramIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="5.5" stroke="#E1306C" strokeWidth="2"/>
    <circle cx="12" cy="12" r="4" stroke="#E1306C" strokeWidth="2"/>
    <circle cx="17.5" cy="6.5" r="1" fill="#E1306C"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#0A66C2" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const PLATFORM_SVG = { 1: InstagramIcon, 2: LinkedInIcon, 3: FacebookIcon };

/** Platform pills */
function PlatformPills({ platforms }) {
  if (!Array.isArray(platforms) || !platforms.length)
    return <span style={{ color: THEME.textLight }}>—</span>;
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {platforms.map((id, i) => {
        const p = PLATFORM_ICONS[String(id)];
        const SvgIcon = PLATFORM_SVG[String(id)];
        if (!p || !SvgIcon) return null;
        return (
          <span key={i} title={p.label} style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
            background: p.bg, color: p.color, border: `1px solid ${p.color}33`,
          }}>
            <SvgIcon />
            {p.label}
          </span>
        );
      })}
    </div>
  );
}

/** Month group heading */
function MonthHeading({ label }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        margin: "20px 0 10px",
      }}
    >
      <div
        style={{
          width: 3,
          height: 14,
          borderRadius: 2,
          background: `linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)`,
        }}
      />
      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: THEME.brand,
          fontFamily: "'Sora',sans-serif",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────
//  TABLE ROW  —  memo
// ─────────────────────────────────────────────
const CampaignRow = memo(
  ({ campaign, index, onDetail, onDelete, onToggle, onPreview }) => {
    const [hov, setHov] = useState(false);
    const isActive = campaign.status === "0";

    return (
      <tr
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: hov
            ? THEME.rowHover
            : index % 2 === 0
              ? "#fff"
              : THEME.rowAlt,
          transition: "background 0.15s",
        }}
      >
        <td
          style={{
            color: THEME.textMuted,
            fontWeight: 700,
            fontSize: 12,
            width: 36,
          }}
        >
          {index + 1}
        </td>

        <td>
          <span
            style={{ fontSize: 12, color: "#595959", whiteSpace: "nowrap" }}
          >
            {campaign.start_date
              ? format(new Date(campaign.start_date), "dd MMM yyyy")
              : "—"}
          </span>
        </td>

        {/* Campaign name — clickable */}
        <td>
          {/* <button onClick={() => onDetail(campaign.id)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}> */}
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: THEME.brand,
              textDecoration: "underline",
              textDecorationStyle: "dotted",
              textUnderlineOffset: 3,
            }}
          >
            {campaign.name}
          </span>
          {/* </button> */}
        </td>

        {/* Screenshot */}
        {/* Screenshot */}
        <td>
          {campaign.screenshot ? (
            <button
              onClick={() => onPreview(getFileDisplayUrl(campaign.screenshot, FileUrl))}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                fontWeight: 600,
                color: "#2F54EB",
                padding: "3px 10px",
                borderRadius: 20,
                background: "#F0F5FF",
                border: "1px solid #ADC6FF",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#D6E4FF")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#F0F5FF")
              }
            >
              🖼️ View
            </button>
          ) : (
            <span style={{ color: THEME.textLight }}>—</span>
          )}
        </td>

        {/* Budget */}
        <td>
          {campaign.budget ? (
            <span style={{ fontWeight: 700, color: THEME.text }}>
              ₹{campaign.budget}
              <span
                style={{
                  fontSize: 11,
                  color: THEME.textMuted,
                  fontWeight: 500,
                  marginLeft: 4,
                }}
              >
                /{BUDGET_TYPE[campaign.budget_type] || "—"}
              </span>
            </span>
          ) : (
            "—"
          )}
        </td>

        {/* Platforms */}
        <td>
          <PlatformPills platforms={campaign.campaign_platform} />
        </td>

        {/* Actions */}
        <td>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Toggle
              checked={isActive}
              onChange={() => onToggle(campaign.id, isActive ? "1" : "0")}
            />
            <span
              style={{
                fontSize: 11,
                color: isActive ? "#389E0D" : THEME.textMuted,
                fontWeight: 600,
                minWidth: 48,
              }}
            >
              {isActive ? "Active" : "Paused"}
            </span>
            <DeleteIconBtn onClick={() => onDelete(campaign.id)} />
          </div>
        </td>
      </tr>
    );
  },
);

// ─────────────────────────────────────────────
//  CALENDAR VIEW
// ─────────────────────────────────────────────
function CalendarView({ data, loading }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });
  const firstDayOfMonth = getDay(startOfMonth(currentMonth));

  const getCampaignsForDate = (date) =>
    data.filter((c) => {
      const d = new Date(c.start_date || c.created_at);
      return !isNaN(d) && isSameDay(d, date);
    });

  return (
    <div>
      {/* Calendar nav */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          style={{
            padding: "7px 14px",
            borderRadius: 10,
            border: `1.5px solid ${THEME.border}`,
            background: "#fff",
            cursor: "pointer",
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 13,
            color: THEME.brand,
            fontWeight: 600,
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = THEME.brandLight;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#fff";
          }}
        >
          ← Prev
        </button>
        <h3
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 800,
            color: THEME.text,
            fontFamily: "'Sora',sans-serif",
          }}
        >
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          style={{
            padding: "7px 14px",
            borderRadius: 10,
            border: `1.5px solid ${THEME.border}`,
            background: "#fff",
            cursor: "pointer",
            fontFamily: "'DM Sans',sans-serif",
            fontSize: 13,
            color: THEME.brand,
            fontWeight: 600,
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = THEME.brandLight;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#fff";
          }}
        >
          Next →
        </button>
      </div>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 0",
            color: THEME.textMuted,
          }}
        >
          Loading…
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <div className="cal-grid" style={{ minWidth: 560 }}>
            {DAY_NAMES.map((d) => (
              <div key={d} className="cal-day-header">
                {d}
              </div>
            ))}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`e${i}`} className="cal-cell empty" />
            ))}
            {daysInMonth.map((day) => {
              const cList = getCampaignsForDate(day);
              const isToday = isSameDay(day, new Date());
              return (
                <div
                  key={day.toISOString()}
                  className={`cal-cell${isToday ? " today" : ""}`}
                >
                  <div className="cal-date">{format(day, "d")}</div>
                  {cList.map((c) => (
                    <div
                      key={c.id}
                      className="cal-event"
                      style={{
                        background: c.status === "0" ? "#D9F7BE" : "#FFE7BA",
                        color: c.status === "0" ? "#237804" : "#873800",
                      }}
                      title={`${c.name} • ₹${c.budget} ${BUDGET_TYPE[c.budget_type] || ""}`}
                    >
                      {c.name}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div
        style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap" }}
      >
        {[
          { label: "Active", bg: "#D9F7BE", color: "#237804" },
          { label: "Paused", bg: "#FFE7BA", color: "#873800" },
          {
            label: "Today",
            bg: "#FFFBF0",
            color: THEME.brand,
            border: `1px solid #D4C4A0`,
          },
        ].map((l) => (
          <div
            key={l.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              fontWeight: 600,
              color: l.color,
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 4,
                background: l.bg,
                border: l.border || `1px solid ${l.color}44`,
              }}
            />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const CampaignList = () => {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("list");
  const [previewUrl, setPreviewUrl] = useState(null);

  const header = {
    Authorization: `Bearer ${getToken()}`,
    "Content-type": "application/json",
  };

  // ── Fetch ─────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService(
        null,
        0,
        header,
        fetchAdmincampaign.method,
        fetchAdmincampaign.url,
      );
      if (!res.data.error) setData(res.data.data || []);
      else toast.error(res.data.message);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);
  // Add this useEffect inside CampaignList (after other useEffects)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setPreviewUrl(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── Delete ────────────────────────────────

  const handleDelete = useCallback(
    (id) => {
      SwalAlert({}).then(async (result) => {
        if (!result?.isConfirmed) return;
        setLoading(true);
        try {
          const res = await ApiService(
            null,
            id,
            header,
            deleteCampaign.method,
            deleteCampaign.url,
          );
          if (!res.data.error) {
            toast.success(res.data.message || "Deleted");
            fetchData();
          } else {
            toast.error(res.data.message);
          }
        } catch (err) {
          toast.error(err?.response?.data?.message || "Delete failed");
        } finally {
          setLoading(false);
        }
      });
    },
    [fetchData],
  );

  // ── Toggle status ─────────────────────────

  const handleToggle = useCallback(async (id, newStatus) => {
    try {
      const res = await ApiService(
        { id, status: newStatus },
        0,
        header,
        StatusCampaign.method,
        StatusCampaign.url,
      );
      if (!res.data.error) {
        setData((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)),
        );
        toast.success("Status updated");
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error("Something went wrong");
    }
  }, []);

  // ── Group by month ────────────────────────

  const groupedData = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.id - a.id);
    const groups = {};
    sorted.forEach((item) => {
      const d = new Date(item.created_at || item.start_date);
      if (isNaN(d)) return;
      const key = format(d, "MMMM yyyy");
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  }, [data]);

  const totalActive = data.filter((c) => c.status === "0").length;

  // ── Render ────────────────────────────────

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div
        style={{
          minHeight: "100vh",
          fontFamily: "'DM Sans',sans-serif",
          padding: "28px 24px",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 14,
            marginBottom: 20,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  width: 4,
                  height: 26,
                  borderRadius: 3,
                  background: `linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)`,
                }}
              />
              <h1
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 800,
                  color: THEME.text,
                  fontFamily: "'Sora',sans-serif",
                  letterSpacing: "-0.3px",
                }}
              >
                Ad Campaigns
              </h1>
            </div>
            <p
              style={{
                margin: "0 0 0 12px",
                fontSize: 12,
                color: THEME.textMuted,
              }}
            >
              {loading
                ? "Loading…"
                : `${data.length} campaign${data.length !== 1 ? "s" : ""} · ${totalActive} active`}
            </p>
          </div>
          <AddBtn onClick={() => navigate(`/${CampaignRoute.add}`)} />
        </div>

        {/* ── Stats ── */}
        {!loading && data.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 20,
              flexWrap: "wrap",
            }}
          >
            {[
              {
                label: "Total",
                value: data.length,
                color: THEME.brand,
                bg: THEME.brandLight,
                border: "#D4C4A0",
              },
              {
                label: "Active",
                value: totalActive,
                color: "#389E0D",
                bg: "#F6FFED",
                border: "#B7EB8F",
              },
              {
                label: "Paused",
                value: data.length - totalActive,
                color: "#D46B08",
                bg: "#FFF7E6",
                border: "#FFD591",
              },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  flex: "0 1 140px",
                  background: "#fff",
                  border: `1px solid ${s.border}`,
                  borderRadius: 12,
                  padding: "12px 16px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: s.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: s.color,
                      fontFamily: "'Sora',sans-serif",
                    }}
                  >
                    {s.value}
                  </span>
                </div>
                <span
                  style={{ fontSize: 11, color: "#8C8C8C", fontWeight: 600 }}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── Tab Bar ── */}
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >
          {[
            { key: "list", label: "📋 List View" },
            { key: "calendar", label: "📅 Calendar View" },
          ].map((t) => (
            <button
              key={t.key}
              className={`cl-tab${activeTab === t.key ? " active" : ""}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── List View ── */}
        {activeTab === "list" && (
          <div className="cl-fade">
            {loading ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "80px 0",
                  gap: 16,
                }}
              >
                <div className="cl-spinner" />
                <p style={{ color: THEME.textLight, fontSize: 13, margin: 0 }}>
                  Loading campaigns…
                </p>
              </div>
            ) : Object.keys(groupedData).length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "64px 0",
                  background: "#fff",
                  border: `1px solid ${THEME.border}`,
                  borderRadius: 14,
                }}
              >
                <div style={{ fontSize: 38, marginBottom: 10 }}>📣</div>
                <p style={{ color: THEME.textLight, fontSize: 14, margin: 0 }}>
                  No campaigns yet.
                </p>
              </div>
            ) : (
              Object.keys(groupedData).map((monthKey) => (
                <div key={monthKey}>
                  <MonthHeading label={monthKey} />
                  <div
                    style={{
                      background: "#fff",
                      border: `1px solid ${THEME.border}`,
                      borderRadius: 14,
                      overflow: "hidden",
                      boxShadow: "0 2px 12px rgba(136,117,73,0.07)",
                      marginBottom: 20,
                    }}
                  >
                    <div style={{ overflowX: "auto" }}>
                      <table className="cl-table">
                        <thead>
                          <tr>
                            {[
                              "#",
                              "Date",
                              "Campaign",
                              "Thumbnail",
                              "Budget",
                              "Platform",
                              "Status / Actions",
                            ].map((h, i) => (
                              <th
                                key={h}
                                style={{
                                  textAlign: i === 6 ? "center" : "left",
                                }}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {groupedData[monthKey].map((campaign, idx) => (
                            <CampaignRow
                              key={campaign.id}
                              campaign={campaign}
                              index={idx}
                              // onDetail={(id) => navigate(`/${CampaignRoute.detail}/${id}`)}
                              onDelete={handleDelete}
                              onToggle={handleToggle}
                              onPreview={setPreviewUrl}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Calendar View ── */}
        {activeTab === "calendar" && (
          <div
            className="cl-fade"
            style={{
              background: "#fff",
              border: `1px solid ${THEME.border}`,
              borderRadius: 14,
              padding: "20px",
              boxShadow: "0 2px 12px rgba(136,117,73,0.07)",
            }}
          >
            <CalendarView data={data} loading={loading} />
          </div>
        )}
      </div>
      <ImageModal url={previewUrl} onClose={() => setPreviewUrl(null)} />
    </>
  );
};

export default CampaignList;
