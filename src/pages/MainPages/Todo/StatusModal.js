import React, { useEffect, useState } from "react";
import ApiService from "../../../services/ApiService";
import { updateMeetingTaskStatus, fetchtaskById } from "../../../config/config";
import { getToken } from "../../../services/useLocalStorage";
import toast from "react-hot-toast";

const T = {
  brand:      "#887549",
  brandLight: "#F5F0E8",
  brandMid:   "#C4A97D",
  brandDark:  "#5C4E32",
  bg:         "#F8F5F0",
  border:     "#EDE5D5",
  text:       "#1A1A2E",
  textMuted:  "#8C8C8C",
  textLight:  "#BDBDBD",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

  @keyframes sm-in  { from{opacity:0} to{opacity:1} }
  @keyframes sm-up  { from{opacity:0;transform:translateY(22px) scale(0.97)} to{opacity:1;transform:none} }
  @keyframes sm-spin{ to{transform:rotate(360deg)} }
  @keyframes sm-fade{ from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }

  .sm-overlay {
    position:fixed;inset:0;z-index:1050;
    background:rgba(20,18,14,0.52);
    backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);
    display:flex;align-items:center;justify-content:center;padding:16px;
    animation:sm-in 0.18s ease both;
  }
  .sm-panel {
    background:#fff;width:100%;max-width:460px;
    border-radius:20px;overflow:hidden;
    box-shadow:0 28px 64px rgba(136,117,73,0.22),0 4px 16px rgba(0,0,0,0.08);
    animation:sm-up 0.26s cubic-bezier(0.22,1,0.36,1) both;
  }

  /* Header */
  .sm-hd {
    display:flex;align-items:center;justify-content:space-between;
    padding:18px 22px 15px;
    background:linear-gradient(120deg,${T.brandLight} 0%,#fff 60%);
    border-bottom:1.5px solid ${T.border};
  }
  .sm-hd-left { display:flex;align-items:center;gap:11px; }
  .sm-icon {
    width:38px;height:38px;border-radius:10px;
    background:${T.brandLight};border:1.5px solid ${T.border};
    display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;
  }
  .sm-title {
    margin:0;font-size:16px;font-weight:800;color:${T.text};
    font-family:'Sora',sans-serif;letter-spacing:-0.2px;
  }
  .sm-subtitle { margin:2px 0 0;font-size:11px;color:${T.textMuted};font-family:'DM Sans',sans-serif; }
  .sm-x {
    width:30px;height:30px;border-radius:8px;cursor:pointer;
    border:1.5px solid ${T.border};background:#fff;
    display:flex;align-items:center;justify-content:center;
    color:${T.textMuted};font-size:13px;font-weight:700;
    transition:all 0.14s;font-family:'DM Sans',sans-serif;line-height:1;
  }
  .sm-x:hover { background:${T.brandLight};border-color:${T.brand};color:${T.brandDark}; }

  /* Body */
  .sm-body { padding:22px; }

  /* Field */
  .sm-field { margin-bottom:16px;animation:sm-fade 0.22s ease both; }
  .sm-label {
    display:block;margin-bottom:6px;font-size:11px;font-weight:700;
    text-transform:uppercase;letter-spacing:0.07em;color:${T.textMuted};
    font-family:'DM Sans',sans-serif;
  }
  .sm-select, .sm-input, .sm-textarea {
    width:100%;padding:10px 14px;border-radius:11px;
    border:1.5px solid ${T.border};background:#fff;
    font-size:13px;font-family:'DM Sans',sans-serif;color:${T.text};
    outline:none;transition:border-color 0.15s,box-shadow 0.15s;
    appearance:none;-webkit-appearance:none;
  }
  .sm-select-wrap { position:relative; }
  .sm-select-wrap::after {
    content:'';position:absolute;right:13px;top:50%;transform:translateY(-50%);
    width:0;height:0;pointer-events:none;
    border-left:4px solid transparent;border-right:4px solid transparent;
    border-top:5px solid ${T.brandMid};
  }
  .sm-select:focus,.sm-input:focus,.sm-textarea:focus {
    border-color:${T.brand};box-shadow:0 0 0 3px ${T.brand}1A;
  }
  .sm-textarea { resize:vertical;min-height:80px;line-height:1.5; }

  /* Status toggle buttons */
  .sm-toggle { display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:0; }
  .sm-toggle-btn {
    padding:10px 0;border-radius:11px;border:1.5px solid ${T.border};
    background:#fff;cursor:pointer;font-size:13px;font-weight:600;
    font-family:'DM Sans',sans-serif;color:${T.textMuted};
    transition:all 0.15s;display:flex;align-items:center;justify-content:center;gap:6px;
  }
  .sm-toggle-btn:hover { border-color:${T.brandMid};background:${T.brandLight};color:${T.brandDark}; }
  .sm-toggle-btn.active-pending {
    background:#FFF1F0;border-color:#FFBBB8;color:#CF1322;font-weight:700;
  }
  .sm-toggle-btn.active-done {
    background:#F6FFED;border-color:#B7EB8F;color:#389E0D;font-weight:700;
  }

  /* Conditional section */
  .sm-conditional { animation:sm-fade 0.2s ease both; }

  /* Divider */
  .sm-divider {
    border:none;border-top:1.5px dashed ${T.border};margin:18px 0;
  }

  /* Footer */
  .sm-footer {
    display:flex;gap:10px;justify-content:flex-end;
    padding:0 22px 20px;
  }
  .sm-btn-cancel {
    padding:9px 20px;border-radius:11px;border:1.5px solid ${T.border};
    background:#fff;font-size:13px;font-weight:600;cursor:pointer;
    color:${T.textMuted};font-family:'DM Sans',sans-serif;transition:all 0.14s;
  }
  .sm-btn-cancel:hover { background:${T.bg};border-color:${T.brandMid};color:${T.brandDark}; }
  .sm-btn-submit {
    padding:9px 22px;border-radius:11px;border:none;
    background:linear-gradient(135deg,${T.brand} 0%,${T.brandMid} 100%);
    font-size:13px;font-weight:700;cursor:pointer;color:#fff;
    font-family:'DM Sans',sans-serif;transition:all 0.15s;
    box-shadow:0 3px 10px ${T.brand}40;display:flex;align-items:center;gap:7px;
  }
  .sm-btn-submit:hover { box-shadow:0 5px 16px ${T.brand}55;transform:translateY(-1px); }
  .sm-btn-submit:active { transform:translateY(0); }
  .sm-btn-submit:disabled { opacity:0.6;cursor:not-allowed;transform:none; }

  /* Spinner */
  .sm-spinner {
    width:14px;height:14px;border-radius:50%;
    border:2px solid rgba(255,255,255,0.4);border-top-color:#fff;
    animation:sm-spin 0.7s linear infinite;
  }

  /* Info note */
  .sm-note {
    display:flex;align-items:flex-start;gap:8px;
    padding:10px 13px;border-radius:10px;
    background:#FFF7E6;border:1px solid #FFD591;
    font-size:12px;color:#7C5E00;font-family:'DM Sans',sans-serif;line-height:1.45;
    margin-bottom:16px;
  }
`;

const StatusModal = ({ show, handleClose, id, onSuccess }) => {
  const [loading,    setLoading]    = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData,   setFormData]   = useState({ status:"", reason:"", remarks:"", newDate:null });

  const header = {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };

  const fetchdata = async () => {
    try {
      setLoading(true);
      const res = await ApiService(null, id, header, fetchtaskById.method, fetchtaskById.url);
      if (!res.data?.error) {
        const p = res.data.data[0];
        setFormData({ status: p?.status?.toString() || "", reason: p?.reason || "", remarks: p?.remarks || "", newDate: null });
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (show && id) fetchdata(); }, [id, show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = { ...formData, id, newDate: formData.newDate === "" ? null : formData.newDate };
      const res = await ApiService(payload, 0, header, updateMeetingTaskStatus.method, updateMeetingTaskStatus.url);
      if (res.status === 200 && !res.data.error) {
        toast.success(res.data.message || "Task updated successfully");
        handleClose();
        onSuccess?.();
        setFormData({ status:"", reason:"", remarks:"", newDate:null });
      } else {
        toast.error(res.data?.message || "An error occurred");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <>
      <style>{CSS}</style>
      <div className="sm-overlay" onClick={handleClose}>
        <div className="sm-panel" onClick={(e) => e.stopPropagation()}>

          {/* ── Header ── */}
          <div className="sm-hd">
            <div className="sm-hd-left">
              <div className="sm-icon">✏️</div>
              <div>
                <p className="sm-title">Update Task</p>
                <p className="sm-subtitle">Change status &amp; add remarks</p>
              </div>
            </div>
            <button className="sm-x" onClick={handleClose}>✕</button>
          </div>

          {/* ── Body ── */}
          <div className="sm-body">
            {loading ? (
              <div style={{ textAlign:"center", padding:"32px 0" }}>
                <div className="sm-spinner" style={{ margin:"0 auto 10px", borderTopColor:T.brand, borderColor:T.border, width:24, height:24, borderWidth:3 }} />
                <p style={{ color:T.textLight, fontSize:13, margin:0, fontFamily:"'DM Sans',sans-serif" }}>Loading task…</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>

                {/* Status toggle */}
                <div className="sm-field">
                  <label className="sm-label">Status</label>
                  <div className="sm-toggle">
                    <button
                      type="button"
                      className={`sm-toggle-btn${formData.status === "0" ? " active-pending" : ""}`}
                      onClick={() => setFormData({ ...formData, status:"0", reason:"", remarks:"", newDate:null })}
                    >
                      🔴 Pending
                    </button>
                    <button
                      type="button"
                      className={`sm-toggle-btn${formData.status === "1" ? " active-done" : ""}`}
                      onClick={() => setFormData({ ...formData, status:"1", reason:"", remarks:"", newDate:null })}
                    >
                      ✅ Completed
                    </button>
                  </div>
                </div>

                {/* Conditional: Pending fields */}
                {formData.status === "0" && (
                  <div className="sm-conditional">
                    <hr className="sm-divider" />

                    {/* Reason */}
                    <div className="sm-field">
                      <label className="sm-label">Reason</label>
                      <div className="sm-select-wrap">
                        <select
                          className="sm-select"
                          name="reason"
                          value={formData.reason}
                          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        >
                          <option value="">-- Select reason --</option>
                          <option value="0">👥 Team</option>
                          <option value="1">🤝 Client</option>
                        </select>
                      </div>
                    </div>

                    {/* Next date — only for Client */}
                    {formData.reason === "1" && (
                      <div className="sm-field" style={{ animationDelay:"0.05s" }}>
                        <div className="sm-note">
                          <span>📅</span>
                          <span>Client delay — please set the next follow-up date.</span>
                        </div>
                        <label className="sm-label">Next Date</label>
                        <input
                          type="date"
                          className="sm-input"
                          name="newDate"
                          value={formData.newDate || ""}
                          onChange={(e) => setFormData({ ...formData, newDate: e.target.value })}
                        />
                      </div>
                    )}

                    {/* Remarks */}
                    <div className="sm-field" style={{ animationDelay:"0.08s" }}>
                      <label className="sm-label">Remarks</label>
                      <textarea
                        className="sm-textarea"
                        name="remarks"
                        placeholder="Describe what's blocking this task…"
                        value={formData.remarks}
                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>

          {/* ── Footer ── */}
          {!loading && (
            <div className="sm-footer">
              <button className="sm-btn-cancel" type="button" onClick={handleClose}>
                Cancel
              </button>
              <button
                className="sm-btn-submit"
                type="button"
                disabled={submitting || !formData.status}
                onClick={handleSubmit}
              >
                {submitting
                  ? <><div className="sm-spinner" /> Saving…</>
                  : <>💾 Update Status</>
                }
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default StatusModal;