// ─────────────────────────────────────────────
//  QuestionList.jsx  —  Questions Tab (Lead Detail)
//  Same design system as FollowUp / LeadDetail
// ─────────────────────────────────────────────

import React, { useEffect, useState, useCallback, memo } from "react";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import toast from "react-hot-toast";
import ApiService from "../../../services/ApiService";
import { getToken } from "../../../services/useLocalStorage";
import { fetchAdminQuestion, deleteQuestion } from "../../../config/config";
import AddQuestion from "./Add";
import EditQuestion from "./Edit";


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
  text:       "#1A1A2E",
  textMuted:  "#ADADAD",
  textLight:  "#BDBDBD",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  @keyframes qlFadeIn {
    from { opacity:0; transform:translateY(6px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .ql-card { animation: qlFadeIn 0.25s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes qlSpin { to { transform:rotate(360deg); } }
  .ql-spinner {
    width:24px; height:24px; border-radius:50%;
    border:3px solid ${THEME.brandLight}; border-top-color:${THEME.brand};
    animation:qlSpin 0.8s linear infinite;
  }
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
      + Add Question
    </button>
  );
}

function EditIconBtn({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} title="Edit"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: 30, height: 30, borderRadius: 8, border: `1.5px solid ${hov ? THEME.brand : "#E0D5C5"}`,
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

// ─────────────────────────────────────────────
//  QUESTION CARD  — memo
// ─────────────────────────────────────────────
const QuestionCard = memo(({ item, index, onEdit, onDelete }) => (
  <div className="ql-card" style={{
    background: "#fff", border: `1px solid ${THEME.border}`, borderRadius: 14,
    overflow: "hidden", boxShadow: "0 2px 8px rgba(136,117,73,0.06)",
    animationDelay: `${index * 0.05}s`,
  }}>
    {/* Card header */}
    <div style={{
      background: THEME.brandLight, padding: "12px 16px",
      display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12,
      borderBottom: `1px solid ${THEME.border}`,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flex: 1, minWidth: 0 }}>
        {/* Q badge */}
        <div style={{
          width: 26, height: 26, borderRadius: 8, flexShrink: 0,
          background: THEME.brand, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 800, color: "#fff", fontFamily: "'Sora',sans-serif",
          marginTop: 1,
        }}>Q</div>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: THEME.brandDark, fontFamily: "'Sora',sans-serif", lineHeight: 1.5 }}>
          {item.heading || "—"}
        </p>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <EditIconBtn   onClick={() => onEdit(item.id)} />
        <DeleteIconBtn onClick={() => onDelete(item.id)} />
      </div>
    </div>

    {/* Answer body */}
    <div style={{ padding: "14px 16px" }}>
      {item.answer ? (
        <p style={{ margin: 0, fontSize: 13, color: THEME.text, lineHeight: 1.65 }}>
          {item.answer}
        </p>
      ) : (
        <p style={{ margin: 0, fontSize: 12, color: THEME.textLight, fontStyle: "italic" }}>
          No answer yet.
        </p>
      )}
    </div>
  </div>
));


// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
function QuestionList({ leadId }) {
  const [data,      setData]      = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [Id,        setId]        = useState(null);

  const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService(null, leadId, header, fetchAdminQuestion.method, fetchAdminQuestion.url);
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
        const res = await ApiService(null, id, header, deleteQuestion.method, deleteQuestion.url);
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
            {loading ? "Loading…" : `${data.length} question${data.length !== 1 ? "s" : ""}`}
          </p>
          <AddBtn onClick={() => setShowModal(true)} />
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
            <div className="ql-spinner" />
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && data.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", background: "#fff", border: `1px solid ${THEME.border}`, borderRadius: 14 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>❓</div>
            <p style={{ color: THEME.textLight, fontSize: 13, margin: 0 }}>No questions added yet.</p>
          </div>
        )}

        {/* ── Cards ── */}
        {!loading && data.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {data.map((item, index) => (
              <QuestionCard
                key={item.id}
                item={item}
                index={index}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <AddQuestion
        show={showModal}
        handleClose={() => setShowModal(false)}
        onSuccess={fetchData}
        leadId={leadId}
      />
      <EditQuestion
        editshow={editModal}
        handleeditClose={() => { setEditModal(false); setId(null); }}
        LeadId={Id}
        leadsId={leadId}
        onSuccess={fetchData}
      />
    </>
  );
}

export default QuestionList;