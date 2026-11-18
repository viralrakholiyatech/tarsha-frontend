// ─────────────────────────────────────────────
//  DocumentList.jsx  —  Document Clearance List
//  Brand design — removes Bootstrap Accordion + Tab/Nav
// ─────────────────────────────────────────────

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  memo,
} from "react";
import { useNavigate, Link } from "react-router-dom";
import ApiService from "../../../services/ApiService";
import { getToken } from "../../../services/useLocalStorage";
import { deletedocument, fetchAllfile } from "../../../config/config";
import toast from "react-hot-toast";
import { ApprovalRoute, FilesRoute } from "../../../config/RouteConfig";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";

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

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing:border-box; }
  @keyframes dlFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .dl-fade { animation:dlFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes dlSpin { to{transform:rotate(360deg)} }
  .dl-spinner { width:28px;height:28px;border-radius:50%;border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};animation:dlSpin 0.8s linear infinite; }

  /* ── Land-type tab pills ── */
  .dl-tab-pills { display:flex;gap:10px;flex-wrap:wrap; }
  .dl-tab-pill {
    display:flex;align-items:center;justify-content:space-between;gap:10px;
    padding:10px 18px;border-radius:12px;cursor:pointer;
    border:2px solid ${THEME.border};background:#fff;
    font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;color:#595959;
    transition:all 0.18s;min-width:130px;
  }
  .dl-tab-pill:hover  { border-color:${THEME.brand};background:${THEME.brandLight};color:${THEME.brand}; }
  .dl-tab-pill.active { border-color:${THEME.brand};background:${THEME.brandLight};color:${THEME.brand};box-shadow:0 2px 10px ${THEME.brand}22; }
  .dl-tab-pill .dl-count {
    padding:2px 8px;border-radius:20px;font-size:11px;font-weight:800;
    background:${THEME.brand};color:#fff;
  }
  .dl-tab-pill.active .dl-count { background:${THEME.brandDark}; }

  /* ── Accordion row card ── */
  .dl-row-card {
    background:#fff;border:1.5px solid ${THEME.border};border-radius:12px;
    margin-bottom:10px;overflow:hidden;
    box-shadow:0 2px 8px rgba(136,117,73,0.05);transition:border-color 0.18s;
  }
  .dl-row-card:hover { border-color:${THEME.brandMid}; }

  /* ── Row header ── */
  .dl-row-header {
    display:grid;grid-template-columns:40px 1fr 1fr 1fr 1fr 100px 36px;
    align-items:center;gap:8px;padding:12px 16px;cursor:pointer;
    background:#FDFAF5;transition:background 0.15s;
  }
  .dl-row-header:hover { background:${THEME.brandLight}; }
  .dl-row-header.open  { background:${THEME.brandLight};border-bottom:1px solid ${THEME.border}; }

  /* ── Action menu ── */
  .dl-action-wrap { position:relative; }
  .dl-action-btn {
    width:30px;height:30px;border-radius:8px;border:1.5px solid ${THEME.border};
    background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;
    font-size:16px;color:${THEME.textMuted};transition:all 0.15s;
  }
  .dl-action-btn:hover { background:${THEME.brandLight};border-color:${THEME.brand};color:${THEME.brand}; }
  .dl-action-menu {
    position:absolute;right:0;top:34px;z-index:100;background:#fff;
    border:1.5px solid ${THEME.border};border-radius:10px;min-width:130px;
    box-shadow:0 8px 24px rgba(0,0,0,0.10);overflow:hidden;
  }
  .dl-action-item {
    display:block;padding:9px 14px;font-size:13px;font-weight:500;
    color:${THEME.text};text-decoration:none;cursor:pointer;
    transition:background 0.12s;border:none;background:transparent;width:100%;text-align:left;font-family:'DM Sans',sans-serif;
  }
  .dl-action-item:hover { background:${THEME.brandLight};color:${THEME.brand}; }
  .dl-action-item.del   { color:#CF1322; }
  .dl-action-item.del:hover { background:#FFF1F0; }

  /* ── Prop detail row ── */
  .dl-prop-row { display:flex;flex-wrap:wrap;gap:16px;padding:14px 16px;background:${THEME.bg}; }
  .dl-prop-item { }
  .dl-prop-label { font-size:9px;font-weight:700;color:${THEME.textMuted};text-transform:uppercase;letter-spacing:0.08em;margin-bottom:2px; }
  .dl-prop-value { font-size:13px;font-weight:600;color:${THEME.text}; }

  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:${THEME.brandLight}; }
  ::-webkit-scrollbar-thumb { background:${THEME.brandMid};border-radius:10px; }
`;

// ─────────────────────────────────────────────
//  LAND TYPE TABS
// ─────────────────────────────────────────────
const TABS = [
  { key: "tp", label: "TP" },
  { key: "non_tp", label: "Non TP" },
  { key: "gamtal", label: "Gamtal" },
];

// ─────────────────────────────────────────────
//  ACTION MENU  (click-outside close)
// ─────────────────────────────────────────────
function ActionMenu({ item, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="dl-action-wrap" ref={ref}>
      <button
        className="dl-action-btn"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        ⋮
      </button>
      {open && (
        <div className="dl-action-menu">
          <Link
            className="dl-action-item"
            to={`/${FilesRoute.edit}/${item.ID}`}
            onClick={() => setOpen(false)}
          >
            ✏️ Edit
          </Link>
          <button
            className="dl-action-item del"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onDelete(item.id);
            }}
          >
            🗑 Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
//  DOCUMENT ROW  (accordion)
// ─────────────────────────────────────────────
const DocumentRow = memo(({ item, index, onDelete, onNavigate }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="dl-row-card">
      {/* Header row */}
      <div
        className={`dl-row-header${open ? " open" : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        {/* # */}
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: THEME.textMuted,
            textAlign: "center",
          }}
        >
          {index + 1}
        </span>
        {/* Case ID */}
        <div>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 700,
              color: THEME.brand,
              cursor: "pointer",
            }}
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(item.id);
            }}
          >
            {item.case_id}
          </p>
        </div>
        {/* Client */}
        <p style={{ margin: 0, fontSize: 13, color: THEME.text }}>
          {item.first_name} {item.last_name}
        </p>
        {/* Village */}
        <p style={{ margin: 0, fontSize: 12, color: THEME.textMuted }}>
          {item.name || "—"}
        </p>
        {/* TP Scheme */}
        <p style={{ margin: 0, fontSize: 12, color: THEME.textMuted }}>
          {item.tpscheme || "—"}
        </p>
        {/* Actions */}
        <div onClick={(e) => e.stopPropagation()}>
          <ActionMenu item={item} onDelete={onDelete} />
        </div>
        {/* Chevron */}
        <svg
          style={{
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0)",
            justifySelf: "center",
          }}
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke={THEME.textMuted}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Expanded property details */}
      {open && (
        <div className="dl-prop-row">
          {[
            { label: "O.P. No.", value: item.op_no },
            { label: "F.P. No.", value: item.fp_no },
            { label: "Subplot No.", value: item.subplot_no },
            { label: "R.S. No.", value: item.rs_no },
            { label: "B. No.", value: item.b_no },
          ].map((p) => (
            <div key={p.label} className="dl-prop-item">
              <p className="dl-prop-label">{p.label}</p>
              <p className="dl-prop-value">{p.value || "N/A"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const DocumentList = () => {
  const navigate = useNavigate();
  const header = {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("tp");

  const fetchdata = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService(
        null,
        0,
        header,
        fetchAllfile.method,
        fetchAllfile.url,
      );
      if (!res.data.error)
        setData(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchdata();
  }, []);

  // ── Counts ───────────────────────────────
  const counts = useMemo(
    () => ({
      tp: data.filter((d) => d.land_type === "tp").length,
      non_tp: data.filter((d) => d.land_type === "non_tp").length,
      gamtal: data.filter((d) => d.land_type === "gamtal").length,
    }),
    [data],
  );

  // ── Filtered + sorted ────────────────────
  const filteredData = useMemo(() => {
    return [...data]
      .filter((d) => d.land_type === activeTab)
      .sort((a, b) => b.id - a.id);
  }, [data, activeTab]);

  const removeTodo = async (id) => {
    try {
      const res = await ApiService(
        null,
        parseInt(id),
        header,
        deletedocument.method,
        deletedocument.url,
      );
      if (!res.data.error) {
        toast.success(res.data.message);
        fetchdata();
      } else toast.error(res.data.message);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Something went wrong");
    }
  };

  const onRemoveTodo = (id) => {
    SwalAlert({}).then(async (r) => {
      if (r.isConfirmed) await removeTodo(id);
    });
  };

  return (
    <>
      <style>{CSS}</style>

      <div
        style={{
          minHeight: "100vh",
          background: THEME.bg,
          fontFamily: "'DM Sans',sans-serif",
          padding: "28px 24px",
        }}
      >
        {/* ── Page header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 20,
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
            Document Clearance
          </h1>
        </div>

        {/* ── Land-type tabs ── */}
        <div
          style={{
            background: "#fff",
            border: `1px solid ${THEME.border}`,
            borderRadius: 14,
            padding: "16px 20px",
            marginBottom: 18,
            boxShadow: "0 2px 8px rgba(136,117,73,0.06)",
          }}
        >
          <div className="dl-tab-pills">
            {TABS.map((t) => (
              <button
                key={t.key}
                className={`dl-tab-pill${activeTab === t.key ? " active" : ""}`}
                onClick={() => setActiveTab(t.key)}
              >
                <span>{t.label}</span>
                <span className="dl-count">{counts[t.key]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Main card ── */}
        <div
          style={{
            background: "#fff",
            border: `1px solid ${THEME.border}`,
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 2px 10px rgba(136,117,73,0.06)",
          }}
        >
          {/* Column header */}
          {!loading && filteredData.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "40px 1fr 1fr 1fr 1fr 100px 36px",
                gap: 8,
                padding: "9px 16px",
                borderBottom: `1px solid ${THEME.border}`,
                background: THEME.brandLight,
              }}
            >
              {["#", "Case No.", "Client", "Village", "TP Scheme", "", ""].map(
                (h, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: THEME.brandDark,
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                    }}
                  >
                    {h}
                  </span>
                ),
              )}
            </div>
          )}

          <div style={{ padding: "12px 12px" }}>
            {/* Loading */}
            {loading && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "60px 0",
                  gap: 16,
                }}
              >
                <div className="dl-spinner" />
                <p style={{ color: THEME.textLight, fontSize: 13, margin: 0 }}>
                  Loading documents…
                </p>
              </div>
            )}

            {/* Empty */}
            {!loading && filteredData.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ fontSize: 38, marginBottom: 10 }}>📄</div>
                <p style={{ color: THEME.textLight, fontSize: 14, margin: 0 }}>
                  No {TABS.find((t) => t.key === activeTab)?.label} documents
                  found.
                </p>
              </div>
            )}

            {/* Document rows */}
            {!loading && filteredData.length > 0 && (
              <div className="dl-fade">
                {filteredData.map((item, idx) => (
                  <DocumentRow
                    key={item.id}
                    item={item}
                    index={idx}
                    onDelete={onRemoveTodo}
                    onNavigate={(id) =>
                      navigate(`/${ApprovalRoute.document_add}/${id}`)
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DocumentList;
