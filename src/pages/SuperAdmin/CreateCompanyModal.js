import React, { useState } from "react";
import { superAdminApi } from "./superAdminApi";
import Swal from "sweetalert2";

const ALL_FEATURES = [
  { key: "Meeting",        label: "Meetings" },
  { key: "Team",           label: "Team / HR" },
  { key: "Work",           label: "Work / Files" },
  { key: "Interior",       label: "Interior" },
  { key: "Architecture",   label: "Architecture" },
  { key: "Approval",       label: "Approval" },
  { key: "Social Media",   label: "Social Media" },
  { key: "Finance",        label: "Finance" },
  { key: "HR",             label: "HR Module" },
  { key: "Site Inspection",label: "Site Inspection" },
  { key: "Location",       label: "Location" },
  { key: "Leads",          label: "Leads / CRM" },
];

const CreateCompanyModal = ({ show, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: "",
    code: "",
    admin_name: "",
    admin_email: "",
    admin_password: "",
    admin_phone: "",
    subscription_months: 1,
    features: ["Meeting", "Team", "Work", "Site Inspection"],
  });
  const [loading, setLoading]   = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!show) return null;

  const set = (k, v) => setForm(prev => {
    const next = { ...prev, [k]: v };
    if (k === "name" && !prev.code) {
      next.code = v.toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 15);
    }
    return next;
  });

  const toggleFeature = f =>
    setForm(prev => ({
      ...prev,
      features: prev.features.includes(f)
        ? prev.features.filter(x => x !== f)
        : [...prev.features, f],
    }));

  const expectedDb = form.code
    ? `tarsha_${form.code.toLowerCase().replace(/[^a-z0-9_]/g,"_")}`
    : "tarsha_[code]";

  const handleSubmit = async e => {
    e.preventDefault();
    setErrorMsg("");
    if (!form.name || !form.code || !form.admin_email || !form.admin_password) {
      setErrorMsg("Please fill all required fields marked with *");
      return;
    }
    setLoading(true);
    try {
      const res = await superAdminApi.createCompany(form);
      if (res && !res.error) {
        Swal.fire({
          icon: "success",
          title: "Company Provisioned!",
          html: `Database <code style="color:#7B5C44">${res.data.db_name}</code> created with 195 tables and admin account ready.`,
          confirmButtonColor: "#7B5C44",
          confirmButtonText: "Done",
        });
        onSuccess();
        onClose();
      } else {
        setErrorMsg(res.message || "Failed to create company");
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .ccm-overlay {
          position:fixed; inset:0;
          background:rgba(44,30,20,0.45);
          backdrop-filter:blur(6px);
          display:flex; align-items:center; justify-content:center;
          z-index:9999; padding:20px;
        }
        .ccm-panel {
          background:#FFFFFF;
          border-radius:0;
          border-top:3px solid #7B5C44;
          width:100%; max-width:680px;
          max-height:90vh; overflow-y:auto;
          box-shadow:0 30px 80px rgba(44,30,20,0.2);
          color:#2C1E14;
          scrollbar-width:thin;
          scrollbar-color:#D9C9B4 transparent;
        }
        .ccm-head {
          display:flex; justify-content:space-between; align-items:flex-start;
          padding:32px 40px 24px; border-bottom:1px solid #EEE4D8;
        }
        .ccm-title {
          font-family:'Cormorant Garamond',Georgia,serif;
          font-size:26px; font-weight:400; color:#2C1E14; margin:0 0 4px;
        }
        .ccm-sub { font-size:12px; color:#A8927C; margin:0; }
        .ccm-close {
          background:none; border:none; font-size:22px; cursor:pointer;
          color:#B0957C; padding:4px; line-height:1;
          transition:color 0.2s;
        }
        .ccm-close:hover { color:#7B5C44; }

        .ccm-body { padding:32px 40px 40px; }
        .ccm-err {
          padding:12px 16px; background:#FDF4F3;
          border-left:3px solid #B96E6C; border-radius:0 3px 3px 0;
          font-size:13px; color:#813A38; margin-bottom:24px;
        }

        /* Field */
        .ccm-field { margin-bottom:24px; }
        .ccm-label {
          display:block; font-size:9.5px; font-weight:700;
          letter-spacing:0.16em; text-transform:uppercase;
          color:#A8927C; margin-bottom:8px;
          font-family:Georgia,serif;
        }
        .ccm-input, .ccm-select {
          width:100%; padding:11px 14px;
          background:#FAFAF8;
          border:1px solid #E0D0BC;
          border-radius:0; color:#2C1E14;
          font-size:14px; font-family:Georgia,serif;
          outline:none; transition:border-color 0.2s;
        }
        .ccm-input:focus, .ccm-select:focus { border-color:#7B5C44; }
        .ccm-input::placeholder { color:#C4A97D; }
        .ccm-hint {
          font-size:11px; color:#B0957C; margin-top:5px; display:block;
        }
        .ccm-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:20px; }

        /* Section divider */
        .ccm-section {
          display:flex; align-items:center; gap:14px;
          margin:30px 0 24px; color:#A8927C;
          font-size:9.5px; font-weight:700; letter-spacing:0.16em;
          text-transform:uppercase; font-family:Georgia,serif;
        }
        .ccm-section::after {
          content:''; flex:1; height:1px; background:#E8DCD0;
        }

        /* Feature grid */
        .ccm-features {
          display:grid; grid-template-columns:repeat(3,1fr); gap:1px;
          background:#E8DCD0; border:1px solid #E8DCD0;
          margin-bottom:4px;
        }
        .ccm-feat-item {
          display:flex; align-items:center; gap:9px;
          padding:12px 14px; cursor:pointer;
          background:#FAFAF8; font-size:12.5px; color:#5A3E2A;
          transition:background 0.15s;
        }
        .ccm-feat-item:hover { background:#F5EFE6; }
        .ccm-feat-item.on { background:#FDF9F5; color:#7B5C44; font-weight:600; }
        .ccm-feat-cb {
          width:16px; height:16px; border:1.5px solid #C4A97D;
          border-radius:2px; background:#fff; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
          transition:background 0.15s;
        }
        .ccm-feat-item.on .ccm-feat-cb { background:#7B5C44; border-color:#7B5C44; }

        /* Footer */
        .ccm-footer {
          display:flex; justify-content:flex-end; gap:12px;
          padding:20px 40px 32px; border-top:1px solid #EEE4D8;
        }
        .ccm-cancel {
          padding:11px 22px; background:transparent;
          border:1px solid #D9C9B4; color:#7B5C44;
          font-size:11px; font-weight:600; letter-spacing:0.12em;
          text-transform:uppercase; cursor:pointer;
          transition:background 0.2s;
        }
        .ccm-cancel:hover { background:#F5EFE6; }
        .ccm-submit {
          padding:11px 28px; background:#7B5C44; border:none;
          color:#FDF9F5; font-size:10.5px; font-weight:700;
          letter-spacing:0.18em; text-transform:uppercase; cursor:pointer;
          transition:background 0.25s; position:relative; overflow:hidden;
        }
        .ccm-submit:hover:not(:disabled) { background:#6A4E3A; }
        .ccm-submit:disabled { opacity:0.6; cursor:not-allowed; }
        .ccm-submit-dots { display:flex; gap:5px; justify-content:center; align-items:center; }
        .ccm-sdot {
          width:4px; height:4px; border-radius:50%; background:#FDF9F5;
          animation:csdot 1.2s ease-in-out infinite;
        }
        .ccm-sdot:nth-child(2){animation-delay:0.18s}
        .ccm-sdot:nth-child(3){animation-delay:0.36s}
        @keyframes csdot{0%,80%,100%{transform:scale(0.5);opacity:0.35}40%{transform:scale(1);opacity:1}}
      `}</style>

      <div className="ccm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="ccm-panel">
          {/* Header */}
          <div className="ccm-head">
            <div>
              <h3 className="ccm-title">New Company & Database</h3>
              <p className="ccm-sub">Automatically provisions an isolated MySQL DB with 195 empty tables + admin account</p>
            </div>
            <button className="ccm-close" onClick={onClose} disabled={loading}>&times;</button>
          </div>

          <div className="ccm-body">
            {errorMsg && <div className="ccm-err">{errorMsg}</div>}

            <form onSubmit={handleSubmit}>
              {/* Company Info */}
              <div className="ccm-section">Company Details</div>

              <div className="ccm-grid2">
                <div className="ccm-field">
                  <label className="ccm-label">Company Name *</label>
                  <input className="ccm-input" type="text" placeholder="e.g. Apex Builders Pvt Ltd"
                    value={form.name} onChange={e => set("name", e.target.value)} required />
                </div>
                <div className="ccm-field">
                  <label className="ccm-label">Company Code * (unique)</label>
                  <input className="ccm-input" type="text" placeholder="e.g. apex"
                    value={form.code} onChange={e => set("code", e.target.value)} required />
                  <span className="ccm-hint">
                    Database → <strong style={{ color: "#7B5C44" }}>{expectedDb}</strong>
                  </span>
                </div>
              </div>

              <div className="ccm-field">
                <label className="ccm-label">Subscription Duration *</label>
                <select className="ccm-select" value={form.subscription_months}
                  onChange={e => set("subscription_months", e.target.value)}>
                  <option value={1}>1 Month — Trial / Monthly</option>
                  <option value={3}>3 Months</option>
                  <option value={6}>6 Months</option>
                  <option value={12}>12 Months — Annual Plan</option>
                  <option value={24}>24 Months — 2 Years</option>
                </select>
              </div>

              {/* Admin Account */}
              <div className="ccm-section">Initial Admin Account</div>

              <div className="ccm-grid2">
                <div className="ccm-field">
                  <label className="ccm-label">Admin Full Name</label>
                  <input className="ccm-input" type="text" placeholder="e.g. John Doe"
                    value={form.admin_name} onChange={e => set("admin_name", e.target.value)} />
                </div>
                <div className="ccm-field">
                  <label className="ccm-label">Admin Phone</label>
                  <input className="ccm-input" type="text" placeholder="e.g. 9876543210"
                    value={form.admin_phone} onChange={e => set("admin_phone", e.target.value)} />
                </div>
              </div>
              <div className="ccm-grid2">
                <div className="ccm-field">
                  <label className="ccm-label">Admin Email *</label>
                  <input className="ccm-input" type="email" placeholder="admin@company.com"
                    value={form.admin_email} onChange={e => set("admin_email", e.target.value)} required />
                </div>
                <div className="ccm-field">
                  <label className="ccm-label">Admin Password *</label>
                  <input className="ccm-input" type="password" placeholder="Temporary password"
                    value={form.admin_password} onChange={e => set("admin_password", e.target.value)} required />
                </div>
              </div>

              {/* Features */}
              <div className="ccm-section">Plan Modules</div>
              <div className="ccm-features">
                {ALL_FEATURES.map(f => {
                  const on = form.features.includes(f.key);
                  return (
                    <div key={f.key} className={`ccm-feat-item${on ? " on" : ""}`}
                      onClick={() => toggleFeature(f.key)}>
                      <div className="ccm-feat-cb">
                        {on && <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>}
                      </div>
                      {f.label}
                    </div>
                  );
                })}
              </div>
              <span className="ccm-hint" style={{ marginBottom: "8px", display: "block" }}>
                {form.features.length} modules selected — these control which sidebar items are visible
              </span>
            </form>
          </div>

          {/* Footer */}
          <div className="ccm-footer">
            <button className="ccm-cancel" onClick={onClose} disabled={loading}>Cancel</button>
            <button className="ccm-submit" disabled={loading} onClick={handleSubmit}>
              {loading
                ? <span className="ccm-submit-dots">
                    <span className="ccm-sdot"/><span className="ccm-sdot"/><span className="ccm-sdot"/>
                  </span>
                : "Provision Company & DB"
              }
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateCompanyModal;
