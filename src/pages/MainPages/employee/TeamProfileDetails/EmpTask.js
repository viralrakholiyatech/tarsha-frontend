// ─────────────────────────────────────────────
//  EmpTask.jsx  —  Employee Task List
//  Same brand design system as the rest of app
// ─────────────────────────────────────────────

import React, { useEffect, useState, memo } from "react";
import ApiService from "../../../../services/ApiService";
import { fetchTeamTaskbyId } from "../../../../config/config";
import { getToken } from "../../../../services/useLocalStorage";
import StatusModal from "../../Todo/StatusModal";
import CounterDataModal from "../../Todo/CounterDataModal";
import { useParams } from "react-router-dom";
import { FileUrl } from "../../../../config/file_url";
import { getFileDisplayUrl } from "../../../../services/S3Service";


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
  @keyframes etFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .et-fade { animation:etFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes etSpin { to{transform:rotate(360deg)} }
  .et-spinner {
    width:28px;height:28px;border-radius:50%;
    border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};
    animation:etSpin 0.8s linear infinite;
  }

  /* ── Table ── */
  .et-table { width:100%;border-collapse:collapse;font-family:'DM Sans',sans-serif; }
  .et-table th {
    padding:10px 14px;font-size:11px;font-weight:700;color:${THEME.brandDark};
    text-transform:uppercase;letter-spacing:0.07em;
    background:${THEME.brandLight};border-bottom:2px solid #D4C4A0;white-space:nowrap;
  }
  .et-table td {
    padding:13px 14px;border-bottom:1px solid #F5EFE4;vertical-align:middle;
  }
  .et-table tbody tr:nth-child(even) { background:${THEME.rowAlt}; }
  .et-table tbody tr:hover { background:${THEME.rowHover}; }

  /* ── Priority flag ── */
  .et-priority {
    display:inline-flex;align-items:center;gap:5px;
    padding:2px 9px;border-radius:20px;font-size:10px;font-weight:700;
    white-space:nowrap;
  }
  .et-priority.High   { background:#FFF1F0;color:#CF1322;border:1px solid #FFA39E; }
  .et-priority.Medium { background:#FFF7E6;color:#D46B08;border:1px solid #FFD591; }
  .et-priority.Low    { background:#F6FFED;color:#389E0D;border:1px solid #B7EB8F; }

  /* ── Status badge ── */
  .et-status {
    display:inline-flex;align-items:center;gap:5px;
    padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;
    cursor:pointer;transition:all 0.15s;white-space:nowrap;border:1px solid transparent;
  }
  .et-status.pending   { background:#FFF7E6;color:#D46B08;border-color:#FFD591; }
  .et-status.pending:hover { background:#D46B08;color:#fff; }
  .et-status.completed { background:#F6FFED;color:#389E0D;border-color:#B7EB8F; }
  .et-status.completed:hover { background:#389E0D;color:#fff; }

  /* ── Counter badge ── */
  .et-counter {
    min-width:20px;height:20px;border-radius:20px;padding:0 6px;
    background:${THEME.brand};color:#fff;font-size:10px;font-weight:800;
    display:inline-flex;align-items:center;justify-content:center;
    cursor:pointer;transition:all 0.15s;
  }
  .et-counter:hover { background:${THEME.brandDark}; }

  /* ── Avatar stack ── */
  .et-avatar-stack { display:flex;align-items:center; }
  .et-avatar {
    width:26px;height:26px;border-radius:50%;border:2px solid #fff;
    object-fit:cover;margin-left:-6px;box-shadow:0 1px 3px rgba(0,0,0,0.1);flex-shrink:0;
  }
  .et-avatar:first-child { margin-left:0; }

  /* ── Search ── */
  .et-search {
    padding:9px 14px 9px 36px;border-radius:10px;border:1.5px solid #E0D5C5;font-size:13px;
    font-family:'DM Sans',sans-serif;color:#1A1A2E;outline:none;background:#fff;width:220px;
    transition:border-color 0.15s,box-shadow 0.15s;
  }
  .et-search:focus { border-color:${THEME.brand};box-shadow:0 0 0 3px ${THEME.brand}18; }
  .et-search::placeholder { color:${THEME.textLight}; }

  ::-webkit-scrollbar { width:5px;height:5px; }
  ::-webkit-scrollbar-track { background:${THEME.brandLight}; }
  ::-webkit-scrollbar-thumb { background:${THEME.brandMid};border-radius:10px; }
`;


// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
}

function AvatarStack({ profiles }) {
  if (!profiles) return <span style={{ color:THEME.textLight, fontSize:12 }}>—</span>;
  const pics = profiles.split(",").filter(Boolean);
  if (pics.length === 0) return <span style={{ color:THEME.textLight, fontSize:12 }}>—</span>;
  return (
    <div className="et-avatar-stack">
      {pics.slice(0, 5).map((src, i) => (
        <img key={i} className="et-avatar" src={getFileDisplayUrl(src, FileUrl)} alt="user"
          onError={(e) => { e.target.onerror = null; e.target.src = `${FileUrl}/default/DefaultImage.png`; }} />
      ))}
      {pics.length > 5 && (
        <div style={{
          width:26, height:26, borderRadius:"50%", border:"2px solid #fff",
          background:THEME.brandLight, marginLeft:-6,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:9, fontWeight:800, color:THEME.brand,
        }}>
          +{pics.length - 5}
        </div>
      )}
    </div>
  );
}

function PriorityFlag({ priority }) {
  const dot = { High:"#CF1322", Medium:"#D46B08", Low:"#389E0D" }[priority] || THEME.textMuted;
  return (
    <span className={`et-priority ${priority || "Low"}`}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:dot }} />
      {priority || "Low"}
    </span>
  );
}


// ─────────────────────────────────────────────
//  TABLE ROW  (memo)
// ─────────────────────────────────────────────
const TaskRow = memo(({ item, index, onStatus, onCounter }) => {
  const clientName = item.client_name || item.cllii_name || item.sclient_name || "";
  const caseId     = item.case_id     || item.caseId     || "";
  const isCompleted = item.status !== 0;
  const duePast = !isCompleted && new Date(item.due_date) < new Date();

  return (
    <tr>
      {/* # */}
      <td style={{ color:THEME.textMuted, fontWeight:700, fontSize:12, width:36 }}>{index + 1}</td>

      {/* Task */}
      <td style={{ maxWidth:320 }}>
        <div style={{ display:"flex", alignItems:"flex-start", gap:8 }}>
          <div style={{ paddingTop:2, flexShrink:0 }}>
            <PriorityFlag priority={item.priority} />
          </div>
          <div>
            <p style={{ margin:"0 0 3px", fontSize:13, fontWeight:600, color:THEME.text, lineHeight:1.4 }}>
              {item.task}
            </p>
            {(clientName || caseId) && (
              <p style={{ margin:0, fontSize:11, color:THEME.textMuted }}>
                {clientName}{caseId ? ` · ${caseId}` : ""}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Due Date */}
      <td style={{ whiteSpace:"nowrap" }}>
        <span style={{ fontSize:12, fontWeight:600, color: duePast ? "#CF1322" : THEME.text }}>
          {duePast && "⚠ "}{fmtDate(item.due_date)}
        </span>
      </td>

      {/* Status + counter */}
      <td>
        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
          <span
            className={`et-status ${isCompleted ? "completed" : "pending"}`}
            onClick={() => onStatus(item.id)}
          >
            <span style={{ width:5, height:5, borderRadius:"50%", background: isCompleted ? "#389E0D" : "#D46B08" }} />
            {isCompleted ? "Completed" : "Pending"}
          </span>
          {item.counter >= 1 && (
            <span className="et-counter" onClick={() => onCounter(item.id)}>
              {item.counter}
            </span>
          )}
        </div>
      </td>

      {/* Collaboration */}
      <td><AvatarStack profiles={item.contribution_profiles} /></td>

      {/* Assign To */}
      <td><AvatarStack profiles={item.assign_to_profiles} /></td>
    </tr>
  );
});


// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
function EmpTask() {
  const params = useParams();
  const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };

  const [editId,         setEditId]         = useState("");
  const [task,           setTask]           = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [showModal,      setShowModal]      = useState(false);
  const [showCountModal, setShowCountModal] = useState(false);
  const [search,         setSearch]         = useState("");

  const fetchtask = async () => {
    setLoading(true);
    try {
      const res = await ApiService(null, params.id, header, fetchTeamTaskbyId.method, fetchTeamTaskbyId.url);
      if (!res.data.error) setTask(res.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchtask(); }, []);

  const handleShowModal      = (id) => { setEditId(id); setShowModal(true); };
  const handleShowCountModal = (id) => { setEditId(id); setShowCountModal(true); };

  // ── Search filter ─────────────────────────
  const filtered = React.useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return task;
    return task.filter((t) =>
      (t.task || "").toLowerCase().includes(q) ||
      (t.client_name || t.cllii_name || t.sclient_name || "").toLowerCase().includes(q) ||
      (t.case_id || t.caseId || "").toLowerCase().includes(q) ||
      (t.priority || "").toLowerCase().includes(q)
    );
  }, [task, search]);

  // ── Summary counts ────────────────────────
  const pending   = task.filter((t) => t.status === 0).length;
  const completed = task.filter((t) => t.status !== 0).length;
  const overdue   = task.filter((t) => t.status === 0 && new Date(t.due_date) < new Date()).length;

  return (
    <>
      <style>{CSS}</style>

      <div style={{ minHeight:"100vh", background:THEME.bg, fontFamily:"'DM Sans',sans-serif", padding:"28px 24px" }}>

        {/* ── Header ── */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
          <div style={{ width:4, height:26, borderRadius:3, background:`linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
          <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:THEME.text, fontFamily:"'Sora',sans-serif", letterSpacing:"-0.3px" }}>
            Tasks
          </h1>
        </div>

        {/* ── Stats bar ── */}
        {!loading && task.length > 0 && (
          <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
            {[
              { label:"Total",     value:task.length, color:THEME.brand  },
              { label:"Pending",   value:pending,     color:"#D46B08"    },
              { label:"Completed", value:completed,   color:"#389E0D"    },
              { label:"Overdue",   value:overdue,     color:"#CF1322"    },
            ].map((s) => (
              <div key={s.label} style={{ background:"#fff", border:`1px solid ${THEME.border}`, borderRadius:10, padding:"10px 18px", borderTop:`3px solid ${s.color}`, boxShadow:"0 2px 8px rgba(136,117,73,0.06)", minWidth:110 }}>
                <p style={{ margin:0, fontSize:10, fontWeight:700, color:THEME.textMuted, textTransform:"uppercase", letterSpacing:"0.07em" }}>{s.label}</p>
                <p style={{ margin:"3px 0 0", fontSize:20, fontWeight:800, color:s.color, fontFamily:"'Sora',sans-serif" }}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Main card ── */}
        <div style={{ background:"#fff", border:`1px solid ${THEME.border}`, borderRadius:14, overflow:"hidden", boxShadow:"0 2px 12px rgba(136,117,73,0.07)" }}>

          {/* Search bar */}
          <div style={{ padding:"14px 20px", borderBottom:`1px solid ${THEME.border}`, background:"#FDFAF5", display:"flex", alignItems:"center" }}>
            <div style={{ position:"relative", flex:1, maxWidth:280 }}>
              <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", fontSize:14, color:THEME.textMuted }}>🔍</span>
              <input className="et-search" type="search" placeholder="Search tasks…"
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"80px 0", gap:16 }}>
              <div className="et-spinner" />
              <p style={{ color:THEME.textLight, fontSize:13, margin:0 }}>Loading tasks…</p>
            </div>
          )}

          {/* Empty */}
          {!loading && filtered.length === 0 && (
            <div style={{ textAlign:"center", padding:"64px 0" }}>
              <div style={{ fontSize:40, marginBottom:10 }}>✅</div>
              <p style={{ color:THEME.textLight, fontSize:14, margin:0 }}>No tasks found.</p>
            </div>
          )}

          {/* Table */}
          {!loading && filtered.length > 0 && (
            <div className="et-fade" style={{ overflowX:"auto" }}>
              <table className="et-table">
                <thead>
                  <tr>
                    <th style={{ width:36 }}>#</th>
                    <th>Task</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Collaboration</th>
                    <th>Assign To</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, idx) => (
                    <TaskRow
                      key={item.id}
                      item={item}
                      index={idx}
                      onStatus={handleShowModal}
                      onCounter={handleShowCountModal}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <StatusModal      show={showModal}      handleClose={() => setShowModal(false)}      id={editId} />
      <CounterDataModal show={showCountModal} handleClose={() => setShowCountModal(false)} id={editId} />
    </>
  );
}

export default EmpTask;