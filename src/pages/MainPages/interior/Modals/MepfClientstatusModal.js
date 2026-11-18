
import React, { useEffect, useState } from "react";
import ApiService from "../../../../services/ApiService";
import {
  updatemepfClientStatus,
  mepfClientStatusbyid,
} from "../../../../config/config";
import { getToken } from "../../../../services/useLocalStorage";
import toast from "react-hot-toast";

const THEME = {
  brand: "#887549",
  brandLight: "#F5F0E8",
  brandMid: "#C4A97D",
  brandDark: "#5C4E32",
  border: "#EDE5D5",
  text: "#1A1A2E",
  textMuted: "#ADADAD",
  textLight: "#BDBDBD",
  error: "#CF1322",
  errorLight: "#FFF1F0",
  errorBorder: "#FFA39E",
};

const MODAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }

  .sis-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45); z-index: 1040;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .sis-dialog {
    background: #fff; border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.18);
    width: 100%; max-width: 440px;
    display: flex; flex-direction: column;
    font-family: 'DM Sans', sans-serif; overflow: hidden;
  }
  .sis-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px; border-bottom: 1px solid ${THEME.border};
    background: #FDFAF5; flex-shrink: 0;
  }
  .sis-body {
    padding: 22px 24px;
    display: flex; flex-direction: column; gap: 16px;
  }
  .sis-footer {
    display: flex; align-items: center; justify-content: flex-end;
    gap: 10px; padding: 14px 24px;
    border-top: 1px solid ${THEME.border};
  }

  .sis-input, .sis-select {
    width: 100%; padding: 9px 12px; border-radius: 10px;
    border: 1.5px solid #E0D5C5; font-size: 13px;
    font-family: 'DM Sans', sans-serif; color: ${THEME.text};
    outline: none; background: #fff; appearance: auto;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .sis-input:focus, .sis-select:focus {
    border-color: ${THEME.brand};
    box-shadow: 0 0 0 3px ${THEME.brand}18;
  }
  .sis-input::placeholder { color: ${THEME.textLight}; }

  .sis-label {
    display: block; margin-bottom: 5px;
    font-size: 12px; font-weight: 600; color: #434343;
    font-family: 'DM Sans', sans-serif;
  }

  /* Status option pills */
  .sis-status-group {
    display: flex; gap: 10px;
  }
  .sis-status-opt {
    flex: 1; padding: 10px 12px; border-radius: 10px;
    border: 1.5px solid #E0D5C5; background: #fff;
    cursor: pointer; transition: all 0.15s;
    display: flex; align-items: center; gap: 8px;
    font-size: 13px; font-weight: 600;
    font-family: 'DM Sans', sans-serif; color: #595959;
  }
  .sis-status-opt:hover { background: ${THEME.brandLight}; border-color: ${THEME.brandMid}; }
  .sis-status-opt.approved {
    background: #F6FFED; border-color: #B7EB8F; color: #389E0D;
  }
  .sis-status-opt.rejected {
    background: ${THEME.errorLight}; border-color: ${THEME.errorBorder}; color: ${THEME.error};
  }

  @keyframes sisSpin { to { transform: rotate(360deg); } }
  .sis-spinner {
    width: 24px; height: 24px; border-radius: 50%;
    border: 3px solid ${THEME.brandLight}; border-top-color: ${THEME.brand};
    animation: sisSpin 0.8s linear infinite;
    margin: 32px auto; display: block;
  }
  .sis-btn-spinner {
    width: 13px; height: 13px; border-radius: 50%;
    border: 2px solid #ffffff88; border-top-color: #fff;
    animation: sisSpin 0.7s linear infinite; display: inline-block;
  }
`;

// ─────────────────────────────────────────────
//  🧩  ATOMS
// ─────────────────────────────────────────────
function PrimaryBtn({ children, type = "button", onClick, disabled }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "9px 22px",
        borderRadius: 10,
        border: "none",
        background: disabled ? "#C4C4C4" : hov ? THEME.brandDark : THEME.brand,
        color: "#fff",
        fontSize: 13,
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "'Sora', sans-serif",
        transition: "all 0.18s",
        boxShadow: disabled ? "none" : `0 2px 8px ${THEME.brand}44`,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      {children}
    </button>
  );
}

function SecondaryBtn({ children, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "9px 22px",
        borderRadius: 10,
        border: `1.5px solid ${hov ? THEME.brand : "#E0D5C5"}`,
        background: hov ? THEME.brandLight : "#fff",
        color: hov ? THEME.brand : "#595959",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
        transition: "all 0.18s",
      }}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const MepfClientstatusModal = ({ show, handleClose, id, onSuccess }) => {
  const [formData, setFormData] = useState({
    clientstatus: "",
    clientremark: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const authHeader = {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };

  useEffect(() => {
    if (show && id) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const res = await ApiService(
            {},
            id,
            authHeader,
            mepfClientStatusbyid.method,
            mepfClientStatusbyid.url,
          );
          if (
            (res.status === 200 || res.status === 201) &&
            res.data?.data?.length > 0
          ) {
            const d = res.data.data[0];
            setFormData({
              clientstatus:
                d.clientstatus != null ? String(d.clientstatus) : "",
              clientremark: d.clientremark || "",
            });
          } else {
            toast.error("Failed to fetch data");
          }
        } catch (err) {
          console.error(err);
          toast.error("An unexpected error occurred.");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [show, id]);

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleStatusSelect = (val) =>
    setFormData((p) => ({ ...p, clientstatus: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await ApiService(
        { ...formData, Id: id },
        0,
        authHeader,
        updatemepfClientStatus.method,
        updatemepfClientStatus.url,
      );
      if (res.status === 200 && !res.data.error) {
        toast.success(
          res.data.message || "Client status updated successfully",
        );
        handleClose();
        onSuccess?.();
        setFormData({ clientstatus: "", clientremark: "" });
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

  const isApproved = String(formData.clientstatus) === "1";
const isRejected = String(formData.clientstatus) === "2";

  

  return (
    <>
      <style>{MODAL_CSS}</style>

      <div className="sis-backdrop" onClick={handleClose}>
        <div className="sis-dialog" onClick={(e) => e.stopPropagation()}>
          {/* ── Header ── */}
          <div className="sis-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 3,
                  height: 20,
                  borderRadius: 2,
                  background: `linear-gradient(180deg, ${THEME.brand} 0%, ${THEME.brandMid} 100%)`,
                }}
              />
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 700,
                    color: THEME.text,
                    fontFamily: "'Sora', sans-serif",
                  }}
                >
                  Internal Review Status
                </h2>
                <p style={{ margin: 0, fontSize: 11, color: THEME.textMuted }}>
                  Set approval status and add a remark
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: `1.5px solid ${THEME.border}`,
                background: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                color: THEME.textMuted,
                lineHeight: 1,
                transition: "all 0.15s",
              }}
            >
              ×
            </button>
          </div>

          {/* ── Body ── */}
          <form onSubmit={handleSubmit}>
            <div className="sis-body">
              {loading ? (
                <div className="sis-spinner" />
              ) : (
                <>
                  {/* Status toggle cards */}
                  <div>
                    <label className="sis-label">Review Status</label>
                    <div className="sis-status-group">
                      {/* Approved */}
                      <div
                        className={`sis-status-opt ${isApproved ? "approved" : ""}`}
                        onClick={() => handleStatusSelect("1")}
                      >
                        <span
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            border: `2px solid ${isApproved ? "#52C41A" : "#D4C4A0"}`,
                            background: isApproved ? "#52C41A" : "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            transition: "all 0.15s",
                          }}
                        >
                          {isApproved && (
                            <svg
                              width="9"
                              height="9"
                              viewBox="0 0 10 10"
                              fill="none"
                            >
                              <path
                                d="M1.5 5L4 7.5L8.5 2.5"
                                stroke="#fff"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </span>
                        ✅ Approved
                      </div>

                      {/* Rejected */}
                      <div
                        className={`sis-status-opt ${isRejected ? "rejected" : ""}`}
                        onClick={() => handleStatusSelect("2")}
                      >
                        <span
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            border: `2px solid ${isRejected ? THEME.error : "#D4C4A0"}`,
                            background: isRejected ? THEME.error : "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            transition: "all 0.15s",
                          }}
                        >
                          {isRejected && (
                            <svg
                              width="9"
                              height="9"
                              viewBox="0 0 10 10"
                              fill="none"
                            >
                              <path
                                d="M1.5 5L4 7.5L8.5 2.5"
                                stroke="#fff"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </span>
                        ❌ Rejected
                      </div>
                    </div>
                  </div>

                  {/* Remark */}
                  <div>
                    <label className="sis-label">Remark</label>
                    <input
                      className="sis-input"
                      type="text"
                      name="clientremark"
                      value={formData.clientremark}
                      onChange={handleChange}
                      placeholder="Add a remark…"
                    />
                  </div>
                </>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="sis-footer">
              <SecondaryBtn onClick={handleClose}>Cancel</SecondaryBtn>
              <PrimaryBtn type="submit" disabled={submitting || loading}>
                {submitting ? (
                  <>
                    <span className="sis-btn-spinner" /> Saving…
                  </>
                ) : (
                  "✓ Save Changes"
                )}
              </PrimaryBtn>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default MepfClientstatusModal;
