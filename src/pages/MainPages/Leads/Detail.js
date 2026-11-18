

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileUrl } from "../../../config/file_url";
import { SwalAlert } from "../../../UtilsComponent/SwalDialog";
import toast from "react-hot-toast";
import ApiService from "../../../services/ApiService";
import { getToken } from "../../../services/useLocalStorage";
import { fetchAdminFollowups, deleteFollowups, fetchleadsbyid, fetchterms } from "../../../config/config";
import { LeadsRoute } from "../../../config/RouteConfig";
import AddFollowup from "../followups/Add";
import EditFollowup from "../followups/Edit";
import Question from "../question/List";
import MeetingSchedule from "../Meetingschedule/List";
import Sitevisit from "../sitevisit/List";
import Proposal from "../proposal/List";
import Presentation from "../presentation/List";


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

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }
  @keyframes ldFadeIn {
    from { opacity:0; transform:translateY(8px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .ld-fade { animation: ldFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes ldSpin { to { transform:rotate(360deg); } }
  .ld-spinner {
    width:24px; height:24px; border-radius:50%;
    border:3px solid ${THEME.brandLight};
    border-top-color:${THEME.brand};
    animation:ldSpin 0.8s linear infinite;
  }

  /* Tab strip */
  .ld-tabs { display:flex; gap:6px; flex-wrap:wrap; padding:0; margin:0; list-style:none; }
  .ld-tab-btn {
    padding:8px 16px; border-radius:20px; cursor:pointer;
    font-size:12px; font-weight:600; border:1.5px solid transparent;
    background:transparent; color:#595959; transition:all 0.18s;
    font-family:'DM Sans',sans-serif; white-space:nowrap;
  }
  .ld-tab-btn:hover { background:${THEME.brandLight}; color:${THEME.brand}; }
  .ld-tab-btn.active {
    background:${THEME.brandLight}; color:${THEME.brand};
    border-color:${THEME.brand}; font-weight:700;
  }

  /* Followup table */
  .ld-table { width:100%; border-collapse:collapse; font-family:'DM Sans',sans-serif; }
  .ld-table th {
    padding:10px 14px; font-size:11px; font-weight:700;
    color:${THEME.brandDark}; text-transform:uppercase; letter-spacing:0.07em;
    background:${THEME.brandLight}; border-bottom:2px solid #D4C4A0;
    white-space:nowrap; text-align:left;
  }
  .ld-table td {
    padding:11px 14px; font-size:13px; color:${THEME.text};
    border-bottom:1px solid #F5EFE4; vertical-align:middle;
  }
  .ld-table tbody tr:hover { background:${THEME.rowHover}; }
  .ld-table tbody tr:nth-child(even) { background:${THEME.rowAlt}; }
  .ld-table tbody tr:nth-child(even):hover { background:${THEME.rowHover}; }

  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background:${THEME.brandLight}; }
  ::-webkit-scrollbar-thumb { background:${THEME.brandMid}; border-radius:10px; }
`;

const TABS = [
  { key: "followups",    label: "📞 Follow Up" },
  { key: "question",     label: "❓ Question" },
  { key: "meeting",      label: "📅 Meeting" },
  { key: "site_vist",    label: "🏗️ Site Visit" },
  { key: "proposal",     label: "📄 Proposal" },
  { key: "presentation", label: "🖥️ Presentation" },
  { key: "terms",        label: "📋 Terms" },
];


// ─────────────────────────────────────────────
//  🧩  ATOMS
// ─────────────────────────────────────────────

function AddBtn({ onClick, label = "+ Add" }) {
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
      {label}
    </button>
  );
}

function EditIconBtn({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} title="Edit"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, color: hov ? THEME.brand : "#657488", transition: "color 0.15s" }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M13.26 4L5.05 12.69C4.74 13.02 4.44 13.67 4.38 14.12L4.01 17.36C3.88 18.53 4.72 19.33 5.88 19.13L9.1 18.58C9.55 18.5 10.18 18.17 10.49 17.83L18.7 9.14C20.12 7.64 20.76 5.93 18.55 3.84C16.35 1.77 14.68 2.5 13.26 4Z" stroke="currentColor" strokeWidth="1.8" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M11.89 5.45C12.32 8.21 14.56 10.32 17.34 10.6" stroke="currentColor" strokeWidth="1.8" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 22H21" stroke="currentColor" strokeWidth="1.8" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

function DeleteIconBtn({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} title="Delete"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, color: hov ? "#FF4D4F" : "#FF8096", transition: "color 0.15s" }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="none">
        <path d="M17.5 4.98c-2.775-.275-5.567-.417-8.35-.417q-2.475 0-4.95.25l-1.7.167" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="m7.083 4.142.183-1.092C7.4 2.258 7.5 1.667 8.908 1.667h2.183c1.408 0 1.517.625 1.642 1.392l.183 1.083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="m15.707 7.617-.542 8.392c-.092 1.308-.167 2.325-2.492 2.325h-5.35c-2.325 0-2.4-1.017-2.492-2.325l-.542-8.392" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8.607 13.75h2.775M7.913 10.417h4.167" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${THEME.border}` }}>
      <span style={{ fontSize: 11, color: THEME.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
      <span style={{ fontSize: 13, color: THEME.text, fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>{value || "—"}</span>
    </div>
  );
}


// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
function LeadDetail() {
  const params   = useParams();
  const navigate = useNavigate();

  const [activeTab,     setActiveTab]     = useState("followups");
  const [loading,       setLoading]       = useState(false);
  const [followdata,    setFollowData]    = useState([]);
  const [leadsData,     setLeadsData]     = useState({});
  const [showModal,     setShowModal]     = useState(false);
  const [editModal,     setEditModal]     = useState(false);
  const [Id,            setId]            = useState(null);
  const [termdata,      setTermdata]      = useState([]);

  const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };

  // ── Fetch ─────────────────────────────────

  const fetchFollowups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService(null, params.id, header, fetchAdminFollowups.method, fetchAdminFollowups.url);
      if (!res.data.error) setFollowData(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [params.id]);

  const fetchLeadInfo = useCallback(async () => {
    try {
      const res = await ApiService(null, params.id, header, fetchleadsbyid.method, fetchleadsbyid.url);
      if (!res.data.error) setLeadsData(res.data.data?.[0] || {});
    } catch (err) { console.error(err); }
  }, [params.id]);

  const fetchTerms = useCallback(async () => {
    try {
      const res = await ApiService(null, params.id, header, fetchterms.method, fetchterms.url);
      if (!res.data.error) setTermdata(res.data.data || []);
    } catch (err) { console.error(err); }
  }, [params.id]);

  useEffect(() => {
    fetchFollowups();
    fetchLeadInfo();
    fetchTerms();
  }, []);

  // ── Delete followup ───────────────────────

  const handleDeleteFollowup = (id) => {
    SwalAlert({}).then(async (result) => {
      if (!result?.isConfirmed) return;
      setLoading(true);
      try {
        const res = await ApiService(null, id, header, deleteFollowups.method, deleteFollowups.url);
        if (!res.data.error) { toast.success(res.data.message); fetchFollowups(); }
        else { toast.error(res.data.message); }
      } catch (err) { toast.error(err?.response?.data?.message || "Something went wrong"); }
      finally { setLoading(false); }
    });
  };

  // ── Source label helper ───────────────────
  const SOURCE_MAP = { "1": "Social Media", "2": "Website", "3": "Email Campaign", "4": "Google Ads", "5": "Reference", "6": "Event" };

  // ── Render ────────────────────────────────

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div style={{ minHeight: "100vh",  fontFamily: "'DM Sans',sans-serif", padding: "28px 24px" }}>

        {/* ── Page Header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => navigate(-1)} style={{
              width: 36, height: 36, borderRadius: 10, cursor: "pointer",
              background: THEME.brandLight, border: `1px solid #D4C4A0`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: THEME.brand, fontSize: 14,
            }}>←</button>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 4, height: 26, borderRadius: 3, background: `linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
              <div>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: THEME.text, fontFamily: "'Sora',sans-serif", letterSpacing: "-0.3px" }}>
                  {leadsData.name || "Lead Detail"}
                </h1>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: THEME.textMuted }}>Lead #{params.id}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="ld-fade">

          {/* ── Lead Info Card ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 20 }}>

            {/* Contact card */}
            <div style={{ background: "#fff", border: `1px solid ${THEME.border}`, borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 10px rgba(136,117,73,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 3, height: 14, borderRadius: 2, background: `linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: THEME.brand, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "'Sora',sans-serif" }}>Contact</p>
              </div>
              <DetailRow label="Name"   value={leadsData.name} />
              <DetailRow label="Mobile" value={leadsData.mobile_no} />
              <DetailRow label="Email"  value={leadsData.email} />
              <DetailRow label="Address" value={leadsData.address} />
            </div>

            {/* Lead Info card */}
            <div style={{ background: "#fff", border: `1px solid ${THEME.border}`, borderRadius: 14, padding: "18px 20px", boxShadow: "0 2px 10px rgba(136,117,73,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 3, height: 14, borderRadius: 2, background: `linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: THEME.brand, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "'Sora',sans-serif" }}>Lead Info</p>
              </div>
              <DetailRow label="Source"  value={SOURCE_MAP[leadsData.source] || leadsData.source} />
              <DetailRow label="Service" value={
                Array.isArray(leadsData.service)
                  ? leadsData.service.map(s => ({ "1": "Interior", "2": "Architecture", "3": "Approval Process" }[String(s)] || s)).join(", ")
                  : leadsData.service
              } />
              <DetailRow label="Description" value={leadsData.description} />
            </div>
          </div>

          {/* ── Tab Card ── */}
          <div style={{ background: "#fff", border: `1px solid ${THEME.border}`, borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 12px rgba(136,117,73,0.07)" }}>

            {/* Tab bar */}
            <div style={{ padding: "16px 20px 16px", borderBottom: `1px solid ${THEME.border}`, background: "#FDFAF5", overflowX: "auto" }}>
              <ul className="ld-tabs">
                {TABS.map((t) => (
                  <li key={t.key}>
                    <button className={`ld-tab-btn${activeTab === t.key ? " active" : ""}`}
                      onClick={() => setActiveTab(t.key)}>
                      {t.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tab content */}
            <div style={{ padding: "20px" }}>

              {/* ── Follow Ups tab ── */}
              {activeTab === "followups" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                    <AddBtn onClick={() => setShowModal(true)} label="+ Add Follow Up" />
                  </div>

                  {loading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                      <div className="ld-spinner" />
                    </div>
                  ) : followdata.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "48px 0" }}>
                      <div style={{ fontSize: 34, marginBottom: 8 }}>📞</div>
                      <p style={{ color: THEME.textLight, fontSize: 13, margin: 0 }}>No follow-ups yet.</p>
                    </div>
                  ) : (
                    <div style={{ overflowX: "auto", borderRadius: 10, border: `1px solid ${THEME.border}`, overflow: "hidden" }}>
                      <table className="ld-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Date</th>
                            <th>Assigned To</th>
                            <th>Talk</th>
                            <th>Next Follow Up</th>
                            <th style={{ textAlign: "center" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {followdata.map((item, idx) => (
                            <tr key={item.id}>
                              <td style={{ color: THEME.textMuted, fontWeight: 700, fontSize: 12 }}>{idx + 1}</td>
                              <td>
                                <span style={{ fontSize: 12, color: "#595959", whiteSpace: "nowrap" }}>{item.date || "—"}</span>
                              </td>
                              <td>
                                {item.assign_person_name ? (
                                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: `linear-gradient(135deg,${THEME.brand},${THEME.brandMid})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                                      {item.assign_person_name[0]?.toUpperCase()}
                                    </div>
                                    <span style={{ fontSize: 13, fontWeight: 600 }}>{item.assign_person_name}</span>
                                  </span>
                                ) : "—"}
                              </td>
                              <td style={{ maxWidth: 220 }}>
                                <span style={{ fontSize: 12, color: "#595959", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {item.talk || "—"}
                                </span>
                              </td>
                              <td>
                                {item.next_date ? (
                                  <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: "#F0F5FF", color: "#2F54EB", border: "1px solid #ADC6FF", whiteSpace: "nowrap" }}>
                                    📅 {item.next_date}
                                  </span>
                                ) : "—"}
                              </td>
                              <td style={{ textAlign: "center" }}>
                                <div style={{ display: "flex", gap: 2, justifyContent: "center" }}>
                                  <EditIconBtn   onClick={() => { setId(item.id); setEditModal(true); }} />
                                  <DeleteIconBtn onClick={() => handleDeleteFollowup(item.id)} />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ── Delegate other tabs to sub-components ── */}
              {activeTab === "question"     && <Question      leadId={params.id} />}
              {activeTab === "meeting"      && <MeetingSchedule leadId={params.id} />}
              {activeTab === "site_vist"    && <Sitevisit      leadId={params.id} />}
              {activeTab === "proposal"     && <Proposal       leadId={params.id} />}
              {activeTab === "presentation" && <Presentation   leadId={params.id} />}
              {activeTab === "terms" && (
                <div>
                  {loading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
                      <div className="ld-spinner" />
                    </div>
                  ) : termdata.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "48px 0" }}>
                      <div style={{ fontSize: 34, marginBottom: 8 }}>📋</div>
                      <p style={{ color: THEME.textLight, fontSize: 13, margin: 0 }}>No terms & acceptance added yet.</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {termdata.map((item) => {
                        const statusMap = {
                          "1": { label: "Pending",  color: "#D46B08", bg: "#FFF7E6", border: "#FFD591" },
                          "2": { label: "Accepted", color: "#389E0D", bg: "#F6FFED", border: "#B7EB8F" },
                          "3": { label: "Rejected", color: "#CF1322", bg: "#FFF1F0", border: "#FFA39E" },
                        };
                        const st = statusMap[String(item.status)] || statusMap["1"];
                        return (
                          <div key={item.id} style={{
                            background: "#fff", border: `1px solid ${THEME.border}`,
                            borderRadius: 14, overflow: "hidden",
                            boxShadow: "0 2px 8px rgba(136,117,73,0.06)",
                          }}>
                            {/* Card header */}
                            <div style={{
                              background: THEME.brandLight, padding: "12px 18px",
                              display: "flex", alignItems: "center", justifyContent: "space-between",
                              borderBottom: `1px solid ${THEME.border}`, flexWrap: "wrap", gap: 8,
                            }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ fontSize: 18 }}>📋</span>
                                <div>
                                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: THEME.brandDark, fontFamily: "'Sora',sans-serif" }}>
                                    Terms & Acceptance
                                  </p>
                                  {item.date && (
                                    <p style={{ margin: 0, fontSize: 11, color: THEME.textMuted }}>{item.date}</p>
                                  )}
                                </div>
                              </div>
                              {/* Status badge */}
                              <span style={{
                                display: "inline-flex", alignItems: "center", gap: 5,
                                padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                                background: st.bg, color: st.color, border: `1px solid ${st.border}`,
                              }}>
                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: st.color }} />
                                {st.label}
                              </span>
                            </div>

                            {/* Terms text */}
                            <div style={{ padding: "18px 20px" }}>
                              <div style={{
                                fontSize: 13, color: THEME.text, lineHeight: 1.85,
                                whiteSpace: "pre-wrap", wordBreak: "break-word",
                                maxHeight: 400, overflowY: "auto",
                                background: THEME.bg, borderRadius: 10,
                                padding: "14px 16px", border: `1px solid ${THEME.border}`,
                                fontFamily: "'DM Sans',sans-serif",
                              }}>
                                {item.terms}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AddFollowup
        show={showModal}
        handleClose={() => setShowModal(false)}
        onSuccess={fetchFollowups}
        leadId={params.id}
      />
      <EditFollowup
        editshow={editModal}
        handleeditClose={() => { setEditModal(false); setId(null); }}
        LeadId={Id}
        leadsId={params.id}
        onSuccess={fetchFollowups}
      />
    </>
  );
}

export default LeadDetail;