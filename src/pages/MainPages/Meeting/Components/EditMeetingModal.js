// ─────────────────────────────────────────────
//  EditMeetingModal.jsx
//  ✅ Bug fix: participants patch (remove one → saves correctly)
//  ✅ Confirm modal when Facilitator changes → "Make HOD a team member?"
//  ✅ Confirm modal when Participants change → "Update department too?"
//  Brand design — no Bootstrap modal classes
// ─────────────────────────────────────────────

import React, { useEffect, useState, useRef, useCallback } from "react";
import ApiService from "../../../../services/ApiService";
import { getToken } from "../../../../services/useLocalStorage";
import toast from "react-hot-toast";
import {
  getmstdepartment,
  fetchActiveEmployee,
  updatemstMeeting,
  getmstmeetingbyid,
} from "../../../../config/config";
import Select from "react-select";

// ─────────────────────────────────────────────
//  THEME
// ─────────────────────────────────────────────
const T = {
  brand:      "#887549",
  brandLight: "#F5F0E8",
  brandMid:   "#C4A97D",
  brandDark:  "#5C4E32",
  bg:         "#F8F5F0",
  border:     "#EDE5D5",
  text:       "#1A1A2E",
  textMuted:  "#8B8B9A",
  textLight:  "#BDBDBD",
  error:      "#CF1322",
  errorBg:    "#FFF1F0",
  warning:    "#D46B08",
  warningBg:  "#FFF7E6",
  warningBdr: "#FFD591",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
  * { box-sizing:border-box; }
  @keyframes emFadeIn  { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
  @keyframes emSlideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes emSpin    { to{transform:rotate(360deg)} }

  /* ── Overlay ── */
  .em-overlay {
    position:fixed;inset:0;z-index:1050;
    background:rgba(26,26,46,0.45);
    backdrop-filter:blur(4px);
    display:flex;align-items:center;justify-content:center;
    padding:16px;
  }

  /* ── Main dialog ── */
  .em-dialog {
    background:#fff;border-radius:18px;width:100%;max-width:500px;
    box-shadow:0 24px 64px rgba(136,117,73,0.20);
    animation:emFadeIn 0.22s cubic-bezier(0.4,0,0.2,1);
    overflow:hidden;
  }
  .em-header {
    padding:18px 22px 14px;
    border-bottom:1px solid ${T.border};background:#FDFAF5;
    display:flex;align-items:center;justify-content:space-between;
  }
  .em-header-left { display:flex;align-items:center;gap:10px; }
  .em-header-bar  { width:3px;height:18px;border-radius:2px;background:linear-gradient(180deg,${T.brand},${T.brandMid}); }
  .em-header-title { margin:0;font-size:15px;font-weight:800;color:${T.text};font-family:'Sora',sans-serif; }
  .em-close {
    width:30px;height:30px;border-radius:8px;
    border:1.5px solid ${T.border};background:#fff;
    cursor:pointer;display:flex;align-items:center;justify-content:center;
    font-size:16px;color:${T.textMuted};transition:all 0.15s;line-height:1;
  }
  .em-close:hover { background:#FFF1F0;border-color:#FFA39E;color:${T.error}; }

  .em-body { padding:20px 22px; }

  /* ── Field ── */
  .em-field { margin-bottom:16px; }
  .em-label {
    display:block;font-size:11px;font-weight:700;
    color:${T.textMuted};text-transform:uppercase;letter-spacing:0.07em;margin-bottom:7px;
  }
  .em-select, .em-input {
    width:100%;padding:10px 13px;border-radius:10px;
    border:1.5px solid #E0D5C5;background:#fff;
    font-size:13px;font-family:'DM Sans',sans-serif;color:${T.text};
    outline:none;transition:border-color 0.15s,box-shadow 0.15s;
    appearance:none;-webkit-appearance:none;
  }
  .em-select:focus, .em-input:focus {
    border-color:${T.brand};box-shadow:0 0 0 3px rgba(136,117,73,0.13);
  }

  /* react-select brand override */
  .em-rselect .select__control {
    border-radius:10px !important;border:1.5px solid #E0D5C5 !important;
    box-shadow:none !important;min-height:42px !important;
    font-family:'DM Sans',sans-serif;font-size:13px;
  }
  .em-rselect .select__control--is-focused {
    border-color:${T.brand} !important;
    box-shadow:0 0 0 3px rgba(136,117,73,0.13) !important;
  }
  .em-rselect .select__multi-value {
    background:${T.brandLight} !important;border-radius:6px !important;
  }
  .em-rselect .select__multi-value__label { color:${T.brandDark} !important;font-weight:600 !important; }
  .em-rselect .select__multi-value__remove:hover { background:${T.brand} !important;color:#fff !important; }
  .em-rselect .select__option--is-focused { background:${T.brandLight} !important; }
  .em-rselect .select__option--is-selected { background:${T.brand} !important; }
  .em-rselect .select__placeholder { color:${T.textLight} !important; }

  /* ── Status badge select ── */
  .em-status-active   { color:#389E0D;font-weight:700; }
  .em-status-inactive { color:${T.error};font-weight:700; }

  /* ── Footer ── */
  .em-footer {
    padding:14px 22px;border-top:1px solid ${T.border};
    background:#FDFAF5;display:flex;justify-content:flex-end;gap:10px;
  }
  .em-btn-submit {
    padding:10px 22px;border-radius:10px;border:none;
    background:${T.brand};color:#fff;font-size:13px;font-weight:700;
    cursor:pointer;font-family:'Sora',sans-serif;
    transition:all 0.18s;box-shadow:0 2px 8px rgba(136,117,73,0.36);
    display:flex;align-items:center;gap:7px;
  }
  .em-btn-submit:hover:not(:disabled) { background:${T.brandDark}; }
  .em-btn-submit:disabled { background:#C4C4C4;box-shadow:none;cursor:not-allowed; }
  .em-btn-cancel {
    padding:10px 20px;border-radius:10px;border:1.5px solid ${T.border};
    background:#fff;color:#595959;font-size:13px;font-weight:600;
    cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.18s;
  }
  .em-btn-cancel:hover { background:${T.brandLight};color:${T.brand};border-color:${T.brand}; }

  .em-spinner {
    width:14px;height:14px;border-radius:50%;
    border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;
    animation:emSpin 0.7s linear infinite;flex-shrink:0;
  }

  /* ── CONFIRM DIALOG ── */
  .em-confirm-overlay {
    position:fixed;inset:0;z-index:1100;
    background:rgba(26,26,46,0.5);backdrop-filter:blur(6px);
    display:flex;align-items:center;justify-content:center;padding:16px;
  }
  .em-confirm-box {
    background:#fff;border-radius:16px;width:100%;max-width:380px;
    box-shadow:0 20px 60px rgba(0,0,0,0.18);
    padding:28px 26px 22px;text-align:center;
    animation:emSlideUp 0.22s cubic-bezier(0.4,0,0.2,1);
  }
  .em-confirm-icon {
    font-size:38px;margin-bottom:14px;line-height:1;
    display:block;
  }
  .em-confirm-title {
    font-family:'Sora',sans-serif;font-size:16px;font-weight:800;
    color:${T.text};margin-bottom:8px;
  }
  .em-confirm-body {
    font-size:13px;color:${T.textMuted};line-height:1.6;margin-bottom:22px;
  }
  .em-confirm-body strong { color:${T.text};font-weight:700; }
  .em-confirm-actions { display:flex;gap:10px;justify-content:center; }
  .em-confirm-yes {
    flex:1;padding:10px;border-radius:10px;border:none;
    background:${T.brand};color:#fff;font-size:13px;font-weight:700;
    cursor:pointer;font-family:'Sora',sans-serif;transition:all 0.18s;
    box-shadow:0 2px 8px rgba(136,117,73,0.3);
  }
  .em-confirm-yes:hover { background:${T.brandDark}; }
  .em-confirm-no {
    flex:1;padding:10px;border-radius:10px;
    border:1.5px solid ${T.border};background:#fff;
    color:#595959;font-size:13px;font-weight:600;
    cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.18s;
  }
  .em-confirm-no:hover { background:${T.brandLight};color:${T.brand};border-color:${T.brand}; }

  /* ── Warning banner ── */
  .em-warn-banner {
    background:${T.warningBg};border:1px solid ${T.warningBdr};
    border-radius:10px;padding:10px 14px;margin-bottom:14px;
    display:flex;align-items:center;gap:8px;
    font-size:12px;font-weight:600;color:${T.warning};
  }
`;

// ─────────────────────────────────────────────
//  CONFIRM DIALOG
// ─────────────────────────────────────────────
function ConfirmDialog({ icon, title, body, onYes, onNo }) {
  return (
    <div className="em-confirm-overlay" onClick={onNo}>
      <div className="em-confirm-box" onClick={e=>e.stopPropagation()}>
        <span className="em-confirm-icon">{icon}</span>
        <p className="em-confirm-title">{title}</p>
        <p className="em-confirm-body" dangerouslySetInnerHTML={{ __html:body }} />
        <div className="em-confirm-actions">
          <button className="em-confirm-no" onClick={onNo}>No, Cancel</button>
          <button className="em-confirm-yes" onClick={onYes}>Yes, Proceed</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  MAIN MODAL
// ─────────────────────────────────────────────
const EditMeetingModal = ({ show, handleClose, id, onSuccess }) => {
  const header = { Authorization:`Bearer ${getToken()}`, "Content-Type":"application/json" };

  // ── State ──────────────────────────────────
  const [formData,   setFormData]   = useState({
    id:"", department_name:"", facilator:"", participants:[], status:"",
  });
  const [origData,   setOrigData]   = useState(null); // snapshot of saved data
  const [hod,        setHod]        = useState([]);
  const [emp,        setEmp]        = useState([]);
  const [department, setDepartment] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ── Confirm dialog state ───────────────────
  const [confirm,    setConfirm]    = useState(null); // null | { icon, title, body, resolve }
  const pendingSubmitRef = useRef(null);

  // ── Fetch ──────────────────────────────────
  const fetchdata = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await ApiService(null, id, header, getmstmeetingbyid.method, getmstmeetingbyid.url);
      if (!res.data.error) {
        const p = res.data.data[0];
        const parsed = {
          id:              p.id,
          department_name: p.mst_department_id || "",
          facilator:       p.facilator         || "",
          participants:    p.participants
            ? p.participants.split(",").map(Number).filter(Boolean)
            : [],
          status:          p.status ?? "",
        };
        setFormData(parsed);
        setOrigData(parsed); // save original snapshot
      }
    } catch(e){console.error(e);}
    finally{setLoading(false);}
  }, [id]);

  const fetchdepartment = useCallback(async () => {
    try {
      const res = await ApiService(null, 0, header, getmstdepartment.method, getmstdepartment.url);
      if (!res.data.error) setDepartment(res.data.data || []);
    } catch(e){console.error(e);}
  }, []);

  const getEmployees = useCallback(async () => {
    try {
      const res = await ApiService(null, 0, { Authorization:`Bearer ${getToken()}` }, fetchActiveEmployee.method, fetchActiveEmployee.url);
      if (!res.data.error) {
        const payload = res.data.data || [];
        setHod(payload);
        setEmp(payload.map(m=>({ value:m.id, label:`${m.first_name} ${m.last_name}` })));
      }
    } catch(e){console.error(e);}
  }, []);

  useEffect(() => {
    if (show && id) { getEmployees(); fetchdata(); fetchdepartment(); }
  }, [show, id]);

  // ── Handlers ──────────────────────────────
  const handleChange = (e) => {
    setFormData(p => ({ ...p, [e.target.name]:e.target.value }));
  };

  // ✅ FIX: participants stored as array of numbers; react-select returns option objects
  const handleParticipantsChange = (selectedOptions) => {
    const ids = (selectedOptions || []).map(opt => Number(opt.value));
    setFormData(p => ({ ...p, participants:[...ids] }));
  };

  // ── Confirm helper ────────────────────────
  // Returns a Promise<boolean> that resolves when user clicks Yes/No
  const askConfirm = (config) =>
    new Promise((resolve) => {
      setConfirm({ ...config, resolve });
    });

  const handleConfirmYes = () => {
    const resolve = confirm?.resolve;
    setConfirm(null);
    resolve?.(true);
  };
  const handleConfirmNo = () => {
    const resolve = confirm?.resolve;
    setConfirm(null);
    resolve?.(false);
  };

  // ── Submit ────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!origData) return;

    const facilatorChanged    = String(formData.facilator) !== String(origData.facilator);
    const participantsChanged = JSON.stringify([...formData.participants].sort()) !==
                                JSON.stringify([...origData.participants].sort());

    // Check facilitator change first → warn to add HOD as team member
    if (facilatorChanged) {
      const yes = await askConfirm({
        icon:  "👑",
        title: "Change Facilitator?",
        body:  `You changed the facilitator.<br/><strong>Please make sure the new Facilitator (HOD) is added as a team member</strong> in the participants list before saving.`,
      });
      if (!yes) return;
    }

    // Check participants change → warn about department
    if (participantsChanged && !facilatorChanged) {
      const yes = await askConfirm({
        icon:  "🏢",
        title: "Participants Changed",
        body:  `You updated the participants list.<br/><strong>Please ensure the correct Department is selected</strong> for the updated team.`,
      });
      if (!yes) return;
    }

    // ── Actual API call ────────────────────
    setSubmitting(true);
    try {
      // ✅ FIX: send participants as comma-separated string (matches original API contract)
      const payload = {
        ...formData,
        participants: formData.participants.join(","),
      };
      const res = await ApiService(payload, 0, header, updatemstMeeting.method, updatemstMeeting.url);
      if (res.status === 200 && !res.data.error) {
        toast.success(res.data.message);
        handleClose();
        onSuccess?.();
      } else {
        toast.error(res.data?.message || "An error occurred");
      }
    } catch(e){
      console.error(e);
      toast.error("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  // react-select value (must match option objects)
  const selectedParticipants = formData.participants
    .map(id => emp.find(opt => opt.value === Number(id)))
    .filter(Boolean);

  if (!show) return null;

  return (
    <>
      <style>{CSS}</style>

      {/* Main overlay */}
      <div className="em-overlay" onClick={handleClose}>
        <div className="em-dialog" onClick={e=>e.stopPropagation()}>

          {/* Header */}
          <div className="em-header">
            <div className="em-header-left">
              <div className="em-header-bar" />
              <h5 className="em-header-title">Edit  Daily Review Meeting</h5>
            </div>
            <button type="button" className="em-close" onClick={handleClose}>✕</button>
          </div>

          {/* Body */}
          <div className="em-body">
            {loading ? (
              <div style={{ display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 0",gap:12 }}>
                <div style={{ width:22,height:22,borderRadius:"50%",border:`3px solid ${T.brandLight}`,borderTopColor:T.brand,animation:"emSpin 0.8s linear infinite" }} />
                <span style={{ fontSize:13,color:T.textMuted }}>Loading…</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>

                {/* Department */}
                <div className="em-field">
                  <label className="em-label" htmlFor="em-dept">Department</label>
                  <select id="em-dept" name="department_name" className="em-select"
                    value={formData.department_name} onChange={handleChange}>
                    <option value="">— Select —</option>
                    {department.map(d=>(
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                {/* Facilitator */}
                <div className="em-field">
                  <label className="em-label" htmlFor="em-fac">Facilitator</label>
                  {origData && String(formData.facilator) !== String(origData.facilator) && (
                    <div className="em-warn-banner">
                      ⚠️ Facilitator changed — remember to add the new HOD to team members.
                    </div>
                  )}
                  <select id="em-fac" name="facilator" className="em-select"
                    value={formData.facilator} onChange={handleChange}>
                    <option value="">— Select —</option>
                    {hod.map(h=>(
                      <option key={h.id} value={h.id}>{h.first_name} {h.last_name}</option>
                    ))}
                  </select>
                </div>

                {/* Participants */}
                <div className="em-field">
                  <label className="em-label">
                    Participants
                    {selectedParticipants.length > 0 && (
                      <span style={{ marginLeft:6,padding:"1px 8px",borderRadius:20,fontSize:10,fontWeight:700,background:T.brandLight,color:T.brandDark,border:`1px solid #D4C4A0`,textTransform:"none" }}>
                        {selectedParticipants.length} selected
                      </span>
                    )}
                  </label>
                  <Select
                    isMulti
                    options={emp}
                    value={selectedParticipants}
                    onChange={handleParticipantsChange}
                    className="em-rselect"
                    classNamePrefix="select"
                    placeholder="Select participants…"
                    closeMenuOnSelect={false}
                    noOptionsMessage={()=>"No employees found"}
                  />
                </div>

                {/* Status */}
                <div className="em-field">
                  <label className="em-label" htmlFor="em-status">Status</label>
                  <select id="em-status" name="status" className="em-select"
                    value={formData.status} onChange={handleChange}>
                    <option value="">— Select —</option>
                    <option value="0">Active</option>
                    <option value="1">Inactive</option>
                  </select>
                </div>

                {/* Footer inside form for submit */}
                <div className="em-footer" style={{ margin:"0 -22px -20px",borderRadius:"0 0 18px 18px" }}>
                  <button type="button" className="em-btn-cancel" onClick={handleClose}>Cancel</button>
                  <button type="submit" className="em-btn-submit" disabled={submitting}>
                    {submitting && <span className="em-spinner" />}
                    {submitting ? "Saving…" : "Save Changes"}
                  </button>
                </div>

              </form>
            )}
          </div>
        </div>
      </div>

      {/* Confirm dialog — rendered above main modal */}
      {confirm && (
        <ConfirmDialog
          icon={confirm.icon}
          title={confirm.title}
          body={confirm.body}
          onYes={handleConfirmYes}
          onNo={handleConfirmNo}
        />
      )}
    </>
  );
};

export default EditMeetingModal;