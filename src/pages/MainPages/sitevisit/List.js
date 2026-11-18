// ─────────────────────────────────────────────
//  SiteVisitList.jsx  —  Site Visit Tab
//  Same design system as MeetingScheduleList
// ─────────────────────────────────────────────

import React, { useEffect, useState, useCallback, memo } from "react";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import toast from "react-hot-toast";
import ApiService from "../../../services/ApiService";
import { getToken } from "../../../services/useLocalStorage";
import { fetchAdminSitevisit, deleteSitevisit } from "../../../config/config";
import { FileUrl } from "../../../config/file_url";
import AddSitevist from "./Add";
import EditSitevist from "./Edit";


// ─────────────────────────────────────────────
//  🎨  THEME
// ─────────────────────────────────────────────
const THEME = {
  brand:      "#887549",
  brandLight: "#F5F0E8",
  brandMid:   "#C4A97D",
  brandDark:  "#5C4E32",
  border:     "#EDE5D5",
  rowAlt:     "#FEFCF9",
  rowHover:   "#FDFAF5",
  text:       "#1A1A2E",
  textMuted:  "#ADADAD",
  textLight:  "#BDBDBD",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  @keyframes svFadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
  .sv-fade { animation: svFadeIn 0.25s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes svSpin { to { transform:rotate(360deg); } }
  .sv-spinner {
    width:24px; height:24px; border-radius:50%;
    border:3px solid ${THEME.brandLight}; border-top-color:${THEME.brand};
    animation:svSpin 0.8s linear infinite;
  }
  .sv-table { width:100%; border-collapse:collapse; font-family:'DM Sans',sans-serif; }
  .sv-table th {
    padding:10px 14px; font-size:11px; font-weight:700;
    color:${THEME.brandDark}; text-transform:uppercase; letter-spacing:0.07em;
    background:${THEME.brandLight}; border-bottom:2px solid #D4C4A0;
    white-space:nowrap;
  }
  .sv-table td {
    padding:11px 14px; font-size:13px; color:${THEME.text};
    border-bottom:1px solid #F5EFE4; vertical-align:middle;
  }
  .sv-table tbody tr:nth-child(even) { background:${THEME.rowAlt}; }
  .sv-table tbody tr:hover { background:${THEME.rowHover}; }

  /* Image thumbnail hover zoom */
  .sv-thumb { transition:transform 0.2s, box-shadow 0.2s; }
  .sv-thumb:hover { transform:scale(1.08); box-shadow:0 4px 14px rgba(0,0,0,0.18); }
`;


// ─────────────────────────────────────────────
//  🧩  ATOMS
// ─────────────────────────────────────────────

function AddBtn({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: "8px 16px", borderRadius: 10, border: "none",
        background: hov ? THEME.brandDark : THEME.brand,
        color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
        fontFamily: "'Sora',sans-serif", transition: "all 0.18s",
        boxShadow: `0 2px 6px ${THEME.brand}44`,
      }}>
      + Add Site Visit
    </button>
  );
}

function EditIconBtn({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} title="Edit"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: 30, height: 30, borderRadius: 8,
        border: `1.5px solid ${hov ? THEME.brand : "#E0D5C5"}`,
        background: hov ? THEME.brandLight : "#fff", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: hov ? THEME.brand : "#657488", transition: "all 0.15s",
      }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M13.26 4L5.05 12.69C4.74 13.02 4.44 13.67 4.38 14.12L4.01 17.36C3.88 18.53 4.72 19.33 5.88 19.13L9.1 18.58C9.55 18.5 10.18 18.17 10.49 17.83L18.7 9.14C20.12 7.64 20.76 5.93 18.55 3.84C16.35 1.77 14.68 2.5 13.26 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M11.89 5.45C12.32 8.21 14.56 10.32 17.34 10.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 22H21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

function DeleteIconBtn({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} title="Delete"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: 30, height: 30, borderRadius: 8,
        border: `1.5px solid ${hov ? "#FF4D4F" : "#FFA39E"}`,
        background: hov ? "#FFF1F0" : "#fff", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: hov ? "#FF4D4F" : "#FF8096", transition: "all 0.15s",
      }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 20 20" fill="none">
        <path d="M17.5 4.98c-2.775-.275-5.567-.417-8.35-.417q-2.475 0-4.95.25l-1.7.167" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="m7.083 4.142.183-1.092C7.4 2.258 7.5 1.667 8.908 1.667h2.183c1.408 0 1.517.625 1.642 1.392l.183 1.083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="m15.707 7.617-.542 8.392c-.092 1.308-.167 2.325-2.492 2.325h-5.35c-2.325 0-2.4-1.017-2.492-2.325l-.542-8.392" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8.607 13.75h2.775M7.913 10.417h4.167" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

/** Image or PDF thumbnail */
function MediaThumb({ image }) {
  if (!image) return <span style={{ fontSize: 12, color: THEME.textLight }}>—</span>;

  const isPdf = image.toLowerCase().endsWith(".pdf");
  return (
    <a href={`${FileUrl}/${image}`} target="_blank" rel="noreferrer"
      style={{ display: "inline-block" }}>
      {isPdf ? (
        <div style={{
          width: 42, height: 42, borderRadius: 8, background: "#FFF1F0",
          border: "1.5px solid #FFA39E", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 20,
        }} title="View PDF">📄</div>
      ) : (
        <img
          src={`${FileUrl}/${image}`} alt="Site visit"
          className="sv-thumb"
          style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8, border: `1.5px solid ${THEME.border}` }}
          onError={(e) => { e.target.style.display = "none"; }}
        />
      )}
    </a>
  );
}

// ─────────────────────────────────────────────
//  TABLE ROW  —  memo
// ─────────────────────────────────────────────
const SiteVisitRow = memo(({ item, index, onEdit, onDelete }) => (
  <tr>
    {/* Index */}
    <td style={{ color: THEME.textMuted, fontWeight: 700, fontSize: 12, width: 32 }}>{index + 1}</td>

    {/* Date */}
    <td>
      {item.date ? (
        <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "#F6FFED", color: "#389E0D", border: "1px solid #B7EB8F", whiteSpace: "nowrap" }}>
          📍 {item.date}
        </span>
      ) : "—"}
    </td>

    {/* Visitor */}
    <td>
      {item.visitor_name ? (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: `linear-gradient(135deg,${THEME.brand},${THEME.brandMid})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
            {item.visitor_name[0]?.toUpperCase()}
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: THEME.text }}>{item.visitor_name}</span>
        </span>
      ) : "—"}
    </td>

    {/* Observation — truncated */}
    <td style={{ maxWidth: 200 }}>
      <span style={{ fontSize: 12, color: "#595959", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {item.observation || "—"}
      </span>
    </td>

    {/* Site Visit For */}
    <td>
      {item.site_visit_for ? (
        <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: THEME.brandLight, color: THEME.brandDark, border: `1px solid #D4C4A0` }}>
          {item.site_visit_for}
        </span>
      ) : "—"}
    </td>

    {/* Image */}
    <td><MediaThumb image={item.image} /></td>

    {/* Actions */}
    <td style={{ textAlign: "center" }}>
      <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
        <EditIconBtn   onClick={() => onEdit(item.id)} />
        <DeleteIconBtn onClick={() => onDelete(item.id)} />
      </div>
    </td>
  </tr>
));


// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
function SiteVisitList({ leadId }) {
  const [data,      setData]      = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [Id,        setId]        = useState(null);

  const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService(null, leadId, header, fetchAdminSitevisit.method, fetchAdminSitevisit.url);
      if (!res.data.error) setData(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [leadId]);

  useEffect(() => { fetchData(); }, [leadId]);

  const handleDelete = useCallback((id) => {
    SwalAlert({}).then(async (result) => {
      if (!result?.isConfirmed) return;
      setLoading(true);
      try {
        const res = await ApiService(null, id, header, deleteSitevisit.method, deleteSitevisit.url);
        if (!res.data.error) { toast.success(res.data.message); fetchData(); }
        else { toast.error(res.data.message); }
      } catch (err) { toast.error(err?.response?.data?.message || "Something went wrong"); }
      finally { setLoading(false); }
    });
  }, [fetchData]);

  const handleEdit = useCallback((id) => { setId(id); setEditModal(true); }, []);

  return (
    <>
      <style>{CSS}</style>

      <div style={{ fontFamily: "'DM Sans',sans-serif" }}>

        {/* ── Toolbar ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <p style={{ margin: 0, fontSize: 12, color: THEME.textMuted, fontWeight: 600 }}>
            {loading ? "Loading…" : `${data.length} visit${data.length !== 1 ? "s" : ""}`}
          </p>
          <AddBtn onClick={() => setShowModal(true)} />
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
            <div className="sv-spinner" />
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && data.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", background: "#fff", border: `1px solid ${THEME.border}`, borderRadius: 14 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🏗️</div>
            <p style={{ color: THEME.textLight, fontSize: 13, margin: 0 }}>No site visits recorded yet.</p>
          </div>
        )}

        {/* ── Table ── */}
        {!loading && data.length > 0 && (
          <div className="sv-fade" style={{ borderRadius: 12, border: `1px solid ${THEME.border}`, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table className="sv-table">
                <thead>
                  <tr>
                    {["#", "Date", "Visitor", "Observation", "Inspection For", "Image", "Actions"].map((h, i) => (
                      <th key={h} style={{ textAlign: i === 6 ? "center" : "left" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, idx) => (
                    <SiteVisitRow
                      key={item.id}
                      item={item}
                      index={idx}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <AddSitevist
        show={showModal}
        handleClose={() => setShowModal(false)}
        onSuccess={fetchData}
        leadId={leadId}
      />
      <EditSitevist
        editshow={editModal}
        handleeditClose={() => { setEditModal(false); setId(null); }}
        LeadId={Id}
        leadsId={leadId}
        onSuccess={fetchData}
      />
    </>
  );
}

export default SiteVisitList;