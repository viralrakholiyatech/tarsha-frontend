import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../../../services/useLocalStorage";
import toast from "react-hot-toast";
import { PostRoute } from "../../../config/RouteConfig";
import ApiService from "../../../services/ApiService";
import { fetchAdminpost, StatusPost } from "../../../config/config";
import { FileUrl } from "../../../config/file_url";
import { DeletePost } from "../../../services/EmployeeService";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import { format } from "date-fns";
import { getFileDisplayUrl } from "../../../services/S3Service";

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

const PAGE_SIZE = 15;

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }
  @keyframes plFadeIn {
    from { opacity:0; transform:translateY(8px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .pl-fade { animation: plFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes plSpin { to { transform:rotate(360deg); } }
  .pl-spinner {
    width:28px; height:28px; border-radius:50%;
    border:3px solid ${THEME.brandLight};
    border-top-color:${THEME.brand};
    animation:plSpin 0.8s linear infinite;
  }
  .pl-search {
    padding:8px 14px 8px 36px; border-radius:10px;
    border:1.5px solid #E0D5C5; font-size:13px;
    font-family:'DM Sans',sans-serif; color:#1A1A2E;
    outline:none; background:#fff; width:220px;
    transition:border-color 0.15s, width 0.2s;
  }
  .pl-search:focus { border-color:${THEME.brand}; box-shadow:0 0 0 3px ${THEME.brand}18; width:260px; }
  .pl-search::placeholder { color:${THEME.textLight}; }
  .pl-th { cursor:pointer; user-select:none; white-space:nowrap; }
  .pl-th:hover { color:${THEME.brand}; }
  .pl-thumb { transition:transform 0.2s, box-shadow 0.2s; border-radius:8px; }
  .pl-thumb:hover { transform:scale(1.1); box-shadow:0 4px 12px rgba(0,0,0,0.2); }
  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background:${THEME.brandLight}; }
  ::-webkit-scrollbar-thumb { background:${THEME.brandMid}; border-radius:10px; }
`;

// ─── Lookup maps ───────────────────────────
const STATUS_MAP = {
  0: { label: "Pending", color: "#D46B08", bg: "#FFF7E6", border: "#FFD591" },
  1: { label: "Approved", color: "#389E0D", bg: "#F6FFED", border: "#B7EB8F" },
  2: { label: "Rejected", color: "#CF1322", bg: "#FFF1F0", border: "#FFA39E" },
};

const TYPE_MAP = { 1: "🖼️ Image", 2: "🎬 Video", 3: "🎠 Carousel", 4 : "📖 Story" };

const PLATFORM_MAP = {
  1: { label: "Instagram", color: "#E1306C", bg: "#FEE2F0" },
  2: { label: "LinkedIn", color: "#0A66C2", bg: "#E8F1FB" },
  3: { label: "Facebook", color: "#1877F2", bg: "#E7F0FD" },
  4: { label: "YouTube",   color: "#FF0000", bg: "#FFE8E8" }, 
};

const InstagramIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="2"
      y="2"
      width="20"
      height="20"
      rx="5.5"
      stroke="#E1306C"
      strokeWidth="2"
    />
    <circle cx="12" cy="12" r="4" stroke="#E1306C" strokeWidth="2" />
    <circle cx="17.5" cy="6.5" r="1" fill="#E1306C" />
  </svg>
);

const LinkedInIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="#0A66C2"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const FacebookIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="#1877F2"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const YouTubeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="#FF0000" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#fff"/>
  </svg>
);
const PLATFORM_SVG = { 1: InstagramIcon, 2: LinkedInIcon, 3: FacebookIcon, 4: YouTubeIcon };


function parsePlatforms(value) {
  if (!value) return [];
  if (Array.isArray(value))
    return value.flatMap((v) => String(v).split(",")).map((v) => v.trim());
  if (typeof value === "string") return value.split(",").map((v) => v.trim());
  return [String(value)];
}



// ─────────────────────────────────────────────
//  🧩  ATOMS
// ─────────────────────────────────────────────

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
        }}
      >
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
          alt="Post preview"
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
        whiteSpace: "nowrap",
      }}
    >
      + Add Post
    </button>
  );
}

function EditIconBtn({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      title="Edit"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: 4,
        color: hov ? THEME.brand : "#657488",
        transition: "color 0.15s",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M13.26 4L5.05 12.69C4.74 13.02 4.44 13.67 4.38 14.12L4.01 17.36C3.88 18.53 4.72 19.33 5.88 19.13L9.1 18.58C9.55 18.5 10.18 18.17 10.49 17.83L18.7 9.14C20.12 7.64 20.76 5.93 18.55 3.84C16.35 1.77 14.68 2.5 13.26 4Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.89 5.45C12.32 8.21 14.56 10.32 17.34 10.6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 22H21"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
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
        width="17"
        height="17"
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

function Pagination({
  page,
  total,
  canPrev,
  canNext,
  onFirst,
  onPrev,
  onNext,
  onLast,
}) {
  const btn = (disabled) => ({
    width: 30,
    height: 30,
    borderRadius: 8,
    background: disabled ? "#F5F5F5" : "#fff",
    border: `1px solid ${disabled ? "#E8E8E8" : "#E0D5C5"}`,
    color: disabled ? THEME.textLight : THEME.brand,
    cursor: disabled ? "default" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 700,
    transition: "all 0.15s",
  });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 6,
        padding: "12px 20px",
        borderTop: "1px solid #F5EFE4",
        background: "#FDFAF5",
      }}
    >
      <button style={btn(!canPrev)} onClick={onFirst} disabled={!canPrev}>
        «
      </button>
      <button style={btn(!canPrev)} onClick={onPrev} disabled={!canPrev}>
        ‹
      </button>
      <span
        style={{
          fontSize: 13,
          color: "#595959",
          fontWeight: 600,
          padding: "0 8px",
        }}
      >
        Page <span style={{ color: THEME.brand }}>{page}</span> of {total}
      </span>
      <button style={btn(!canNext)} onClick={onNext} disabled={!canNext}>
        ›
      </button>
      <button style={btn(!canNext)} onClick={onLast} disabled={!canNext}>
        »
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
//  TABLE ROW  —  memo
// ─────────────────────────────────────────────
const PostRow = memo(
  ({ post, index, onEdit, onDelete, onPreview, onStatusChange }) => {
    const [hov, setHov] = useState(false);
    const status = STATUS_MAP[post.status] || {
      label: "Unknown",
      color: THEME.textMuted,
      bg: "#F5F5F5",
      border: "#E8E8E8",
    };
    const platforms = parsePlatforms(post.platform_add);

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
        {/* Index */}
        <td style={td("center")}>
          <span
            style={{ fontSize: 12, fontWeight: 700, color: THEME.textMuted }}
          >
            {index + 1}
          </span>
        </td>

        {/* Thumbnail */}
        {/* <td style={td("center")}>
          {post.thumbnail ? (
            <button
              onClick={() => onPreview(`${FileUrl}/${post.thumbnail}`)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <img
                src={`${FileUrl}/${post.thumbnail}`}
                alt="Thumbnail"
                className="pl-thumb"
                style={{
                  width: 48,
                  height: 48,
                  objectFit: "cover",
                  border: `1.5px solid ${THEME.border}`,
                  borderRadius: 8,
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </button>
          ) : (
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                background: THEME.brandLight,
                border: `1px solid ${THEME.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              🖼️
            </div>
          )}
        </td> */}
        {/* // 5. In PostRow — show name under thumbnail (update the Thumbnail <td>) */}
        <td style={td("center")}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 5,
            }}
          >
            {post.thumbnail ? (
              <button
                onClick={() => onPreview(getFileDisplayUrl(post.thumbnail, FileUrl))}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <img
                  src={getFileDisplayUrl(post.thumbnail, FileUrl)}
                  alt="Thumbnail"
                  className="pl-thumb"
                  style={{
                    width: 48,
                    height: 48,
                    objectFit: "cover",
                    border: `1.5px solid ${THEME.border}`,
                    borderRadius: 8,
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </button>
            ) : (
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  background: THEME.brandLight,
                  border: `1px solid ${THEME.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                }}
              >
                🖼️
              </div>
            )}
            {post.name && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: THEME.text,
                 
                  textAlign: "center",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {post.name}
              </span>
            )}
          </div>
        </td>

        {/* Date */}
        <td style={td()}>
          {post.date ? (
            <span
              style={{ fontSize: 12, color: "#595959", whiteSpace: "nowrap" }}
            >
              {format(new Date(post.date), "dd MMM yyyy")}
            </span>
          ) : (
            "—"
          )}
        </td>

        {/* Platform */}
        <td style={td()}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {platforms.length === 0
              ? "—"
              : platforms.map((id) => {
                  const p = PLATFORM_MAP[id];
                  const SvgIcon = PLATFORM_SVG[id];
                  return p && SvgIcon ? (
                    <span
                      key={id}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "3px 10px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 600,
                        background: p.bg,
                        color: p.color,
                        border: `1px solid ${p.color}33`,
                      }}
                    >
                      <SvgIcon />
                      {p.label}
                    </span>
                  ) : null;
                })}
          </div>
        </td>

        {/* Type */}
        <td style={td()}>
          {post.type ? (
            <span
              style={{
                display: "inline-block",
                padding: "3px 10px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 600,
                background: "#F9F0FF",
                color: "#531DAB",
                border: "1px solid #D3ADF7",
              }}
            >
              {TYPE_MAP[post.type] || post.type}
            </span>
          ) : (
            "—"
          )}
        </td>

        {/* Status */}
        <td style={td()}>
          <select
            value={post.status}
            onChange={(e) => onStatusChange(post.id, e.target.value)}
            style={{
              padding: "4px 10px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 700,
              background: status.bg,
              color: status.color,
              border: `1px solid ${status.border}`,
              cursor: "pointer",
              outline: "none",
              appearance: "auto",
              fontFamily: "'DM Sans',sans-serif",
            }}
          >
            <option value={0}>● Pending</option>
            <option value={1}>● Approved</option>
            <option value={2}>● Rejected</option>
          </select>
        </td>

        {/* Actions */}
        <td style={td("center")}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <EditIconBtn onClick={() => onEdit(post.id)} />
            <DeleteIconBtn onClick={() => onDelete(post.id)} />
          </div>
        </td>
      </tr>
    );
  },
);

const td = (align = "left") => ({
  padding: "11px 14px",
  borderBottom: "1px solid #F5EFE4",
  verticalAlign: "middle",
  textAlign: align,
});

const HEADERS = [
  "#",
  "Thumbnail",
  "Date",
  "Platform",
  "Type",
  "Status",
  "Actions",
];
const HEADER_ALIGN = [
  "center",
  "center",
  "left",
  "left",
  "left",
  "left",
  "center",
];

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const PostList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null); // null = show all

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [sortKey, setSortKey] = useState("date");
  const [sortAsc, setSortAsc] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const header = {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };

  // ── Fetch ─────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService(
        null,
        0,
        header,
        fetchAdminpost.method,
        fetchAdminpost.url,
      );
      if (!res.data.error) {
        const payload = res.data?.data || [];
        setData(
          payload.map((e) => ({
            id: e.id,
            name: e.name,
            date: e.date,
            platform_add: e.platform_add,
          status: Number(e.status),
            thumbnail: e.thumbnail,
            type: e.type,
          })),
        );
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStatusChange = useCallback(async (id, newStatus) => {
    try {
      const res = await ApiService(
        { id, status: newStatus },
        0,
        header,
        StatusPost.method,
        StatusPost.url, // ← replace with your config key
      );
      if (!res.data.error) {
        toast.success("Status updated");
        setData((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, status: Number(newStatus) } : p,
          ),
        );
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error("Something went wrong");
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setPreviewUrl(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── Delete ────────────────────────────────
  const handleDelete = useCallback((id) => {
    SwalAlert({}).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        const res = await DeletePost(id, getToken());
        if (!res.data.error) {
          toast.success(res.data.message);
          setData((prev) => prev.filter((e) => e.id !== id));
        } else {
          toast.error(res.data.message);
        }
      } catch (err) {
        toast.error(err?.response?.data?.message || "Something went wrong");
      }
    });
  }, []);

  const handleEdit = useCallback(
    (id) => navigate(`/${PostRoute.edit}/${id}`),
    [],
  );

  // ── Filter + Sort + Paginate ──────────────
  // 3. Replace the filtered useMemo to include statusFilter
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.filter((d) => {
      const matchSearch =
        !q ||
        d.date?.includes(q) ||
        (d.name || "").toLowerCase().includes(q) ||
        String(d.platform_add || "")
          .toLowerCase()
          .includes(q) ||
        (TYPE_MAP[d.type] || "").toLowerCase().includes(q) ||
        (STATUS_MAP[d.status]?.label || "").toLowerCase().includes(q);

      const matchStatus = statusFilter === null || Number(d.status) === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [data, search, statusFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = String(a[sortKey] ?? "").toLowerCase();
      const bv = String(b[sortKey] ?? "").toLowerCase();
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [filtered, sortKey, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(pageIndex, totalPages - 1);
  const pageData = sorted.slice(
    safePage * PAGE_SIZE,
    (safePage + 1) * PAGE_SIZE,
  );

  const handleSort = (key) => {
    if (sortKey === key) setSortAsc((a) => !a);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
    setPageIndex(0);
  };

  // Quick stats
  const approved = data.filter((d) => d.status == 1).length;
  const pending = data.filter((d) => d.status == 0).length;
  const rejected = data.filter((d) => d.status == 2).length;

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div
        style={{
          minHeight: "100vh",
          background: THEME.bg,
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
                Post List
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
                : `${filtered.length} post${filtered.length !== 1 ? "s" : ""} found`}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <div style={{ position: "relative" }}>
              <svg
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: THEME.textLight,
                  pointerEvents: "none",
                }}
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <input
                type="search"
                className="pl-search"
                placeholder="Search posts…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPageIndex(0);
                }}
              />
            </div>
            <AddBtn onClick={() => navigate(`/${PostRoute.add}`)} />
          </div>
        </div>

        {/* ── Stats bar ── */}
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
  { label: "Total Posts", value: data.length,  color: THEME.brand,  bg: THEME.brandLight, border: "#D4C4A0", filter: null      },
  { label: "Approved",    value: approved,      color: "#389E0D",    bg: "#F6FFED",        border: "#B7EB8F", filter: 1         },
  { label: "Pending",     value: pending,       color: "#D46B08",    bg: "#FFF7E6",        border: "#FFD591", filter: 0         },
  { label: "Rejected",    value: rejected,      color: "#CF1322",    bg: "#FFF1F0",        border: "#FFA39E", filter: 2         },
].map((s) => {
  const isActive = statusFilter === s.filter;
  return (
    <div
      key={s.label}
      onClick={() => { setStatusFilter(isActive ? null : s.filter); setPageIndex(0); }}
      style={{
        flex: "0 1 150px",
        background: isActive ? s.bg : "#fff",
        border: `${isActive ? "2px" : "1px"} solid ${isActive ? s.color : s.border}`,
        borderRadius: 12,
        padding: "12px 16px",
        boxShadow: isActive ? `0 4px 12px ${s.color}33` : "0 2px 8px rgba(0,0,0,0.04)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        cursor: "pointer",
        transition: "all 0.18s",
        transform: isActive ? "translateY(-2px)" : "none",
      }}
    >
      <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: s.color, fontFamily: "'Sora',sans-serif" }}>{s.value}</span>
      </div>
      <span style={{ fontSize: 11, color: isActive ? s.color : "#8C8C8C", fontWeight: isActive ? 700 : 600 }}>{s.label}</span>
    </div>
  );
})}
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "80px 0",
              gap: 16,
            }}
          >
            <div className="pl-spinner" />
            <p style={{ color: THEME.textLight, fontSize: 13, margin: 0 }}>
              Loading posts…
            </p>
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && sorted.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "64px 0",
              background: "#fff",
              border: `1px solid ${THEME.border}`,
              borderRadius: 14,
            }}
          >
            <div style={{ fontSize: 38, marginBottom: 10 }}>📸</div>
            <p style={{ color: THEME.textLight, fontSize: 14, margin: 0 }}>
              {search ? "No posts match your search." : "No posts found."}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  marginTop: 12,
                  padding: "7px 16px",
                  borderRadius: 10,
                  border: `1px solid ${THEME.border}`,
                  background: THEME.brandLight,
                  color: THEME.brand,
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* ── Table ── */}
        {!loading && sorted.length > 0 && (
          <div
            className="pl-fade"
            style={{
              background: "#fff",
              border: `1px solid ${THEME.border}`,
              borderRadius: 14,
              overflow: "hidden",
              boxShadow: "0 2px 12px rgba(136,117,73,0.07)",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontFamily: "'DM Sans',sans-serif",
                }}
              >
                <thead>
                  <tr style={{ background: THEME.brandLight }}>
                    {HEADERS.map((h, i) => {
                      const sortable = h === "Date";
                      return (
                        <th
                          key={h}
                          className={sortable ? "pl-th" : ""}
                          onClick={
                            sortable ? () => handleSort("date") : undefined
                          }
                          style={{
                            padding: "11px 14px",
                            fontSize: 11,
                            fontWeight: 700,
                            color:
                              sortKey === "date" && sortable
                                ? THEME.brand
                                : THEME.brandDark,
                            textTransform: "uppercase",
                            letterSpacing: "0.07em",
                            borderBottom: "2px solid #D4C4A0",
                            whiteSpace: "nowrap",
                            textAlign: HEADER_ALIGN[i],
                          }}
                        >
                          {h}
                          {sortable && (
                            <span style={{ marginLeft: 3, color: THEME.brand }}>
                              {sortAsc ? "↑" : "↓"}
                            </span>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((post, idx) => (
                    <PostRow
                      key={post.id}
                      post={post}
                      index={safePage * PAGE_SIZE + idx}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onPreview={setPreviewUrl}
                      onStatusChange={handleStatusChange} // ← add
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <Pagination
                page={safePage + 1}
                total={totalPages}
                canPrev={safePage > 0}
                canNext={safePage < totalPages - 1}
                onFirst={() => setPageIndex(0)}
                onPrev={() => setPageIndex((p) => p - 1)}
                onNext={() => setPageIndex((p) => p + 1)}
                onLast={() => setPageIndex(totalPages - 1)}
              />
            )}
          </div>
        )}
      </div>
      <ImageModal url={previewUrl} onClose={() => setPreviewUrl(null)} />
    </>
  );
};

export default PostList;
