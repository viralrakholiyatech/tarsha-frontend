import React, { useEffect, useState } from "react";
import ApiService from "../../../../services/ApiService";
import { UpdateFees, fetchFeesbyId } from "../../../../config/config";
import { getToken } from "../../../../services/useLocalStorage";
import toast from "react-hot-toast";

const THEME = {
  brand:       "#887549",
  brandLight:  "#F5F0E8",
  brandMid:    "#C4A97D",
  brandDark:   "#5C4E32",
  border:      "#EDE5D5",
  text:        "#1A1A2E",
  textMuted:   "#ADADAD",
  textLight:   "#BDBDBD",
  error:       "#CF1322",
  errorLight:  "#FFF1F0",
  errorBorder: "#FFA39E",
};

const MODAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }

  .uf-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45); z-index: 1040;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .uf-dialog {
    background: #fff; border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.18);
    width: 100%; max-width: 440px;
    display: flex; flex-direction: column;
    font-family: 'DM Sans', sans-serif; overflow: hidden;
  }
  .uf-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px; border-bottom: 1px solid ${THEME.border};
    background: #FDFAF5; flex-shrink: 0;
  }
  .uf-body {
    padding: 22px 24px;
    display: flex; flex-direction: column; gap: 14px;
  }
  .uf-footer {
    display: flex; align-items: center; justify-content: flex-end;
    gap: 10px; padding: 14px 24px;
    border-top: 1px solid ${THEME.border};
  }

  .uf-input {
    width: 100%; padding: 9px 12px; border-radius: 10px;
    border: 1.5px solid #E0D5C5; font-size: 13px;
    font-family: 'DM Sans', sans-serif; color: ${THEME.text};
    outline: none; background: #fff;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .uf-input:focus {
    border-color: ${THEME.brand};
    box-shadow: 0 0 0 3px ${THEME.brand}18;
  }
  .uf-input::placeholder { color: ${THEME.textLight}; }

  .uf-label {
    display: block; margin-bottom: 5px;
    font-size: 12px; font-weight: 600; color: #434343;
    font-family: 'DM Sans', sans-serif;
  }

  /* Status pills */
  .uf-status-group { display: flex; gap: 8px; }
  .uf-status-pill {
    flex: 1; padding: 9px 8px; border-radius: 10px;
    border: 1.5px solid #E0D5C5; background: #fff;
    cursor: pointer; transition: all 0.15s;
    font-size: 12px; font-weight: 600;
    font-family: 'DM Sans', sans-serif; color: #595959;
    text-align: center;
  }
  .uf-status-pill.pending.active  { background: #FFFBE6; border-color: #FFE58F; color: #D48806; }
  .uf-status-pill.approved.active { background: #F6FFED; border-color: #B7EB8F; color: #389E0D; }
  .uf-status-pill.rejected.active { background: ${THEME.errorLight}; border-color: ${THEME.errorBorder}; color: ${THEME.error}; }

  @keyframes ufSpin { to { transform: rotate(360deg); } }
  .uf-spinner {
    width: 24px; height: 24px; border-radius: 50%;
    border: 3px solid ${THEME.brandLight}; border-top-color: ${THEME.brand};
    animation: ufSpin 0.8s linear infinite;
    margin: 40px auto; display: block;
  }
  .uf-btn-spinner {
    width: 13px; height: 13px; border-radius: 50%;
    border: 2px solid #ffffff88; border-top-color: #fff;
    animation: ufSpin 0.7s linear infinite; display: inline-block;
  }
`;

const STATUS_OPTIONS = [
  { value: "0", label: "⏳ Pending",  cls: "pending"  },
  { value: "1", label: "✅ Approved", cls: "approved" },
  { value: "2", label: "❌ Rejected", cls: "rejected" },
];

const EMPTY = { price: "", status: "0", remark: "", id: "" };

// ─────────────────────────────────────────────
//  🧩  ATOMS
// ─────────────────────────────────────────────
function PrimaryBtn({ children, type = "button", onClick, disabled }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type={type} onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: "9px 22px", borderRadius: 10, border: "none",
        background: disabled ? "#C4C4C4" : hov ? THEME.brandDark : THEME.brand,
        color: "#fff", fontSize: 13, fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "'Sora', sans-serif", transition: "all 0.18s",
        boxShadow: disabled ? "none" : `0 2px 8px ${THEME.brand}44`,
        display: "inline-flex", alignItems: "center", gap: 6,
      }}
    >{children}</button>
  );
}

function SecondaryBtn({ children, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button" onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: "9px 22px", borderRadius: 10,
        border: `1.5px solid ${hov ? THEME.brand : "#E0D5C5"}`,
        background: hov ? THEME.brandLight : "#fff",
        color: hov ? THEME.brand : "#595959",
        fontSize: 13, fontWeight: 600, cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif", transition: "all 0.18s",
      }}
    >{children}</button>
  );
}

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const UpdateFeesModal = ({ show, handleClose, editId, onSuccess }) => {
  const [formData,   setFormData]   = useState(EMPTY);
  const [loading,    setLoading]    = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const authHeader = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };

  useEffect(() => {
    if (show && editId) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const res = await ApiService({}, editId, authHeader, fetchFeesbyId.method, fetchFeesbyId.url);
          if (
            (res.status === 200 || res.status === 201) &&
            res.data?.data?.length > 0
          ) {
            const d = res.data.data[0];
            setFormData({
              id:     d.id            || "",
              price:  d.price         || "",
              status: String(d.status ?? "0"),
              remark: d.remark        || "",
            });
          } else {
            toast.error("Failed to fetch fees data");
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
  }, [show, editId]);

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await ApiService(formData, 0, authHeader, UpdateFees.method, UpdateFees.url);
      if (res.status === 200 && !res.data.error) {
        toast.success(res.data.message || "Fees updated successfully");
        handleClose();
        onSuccess?.();
        setFormData(EMPTY);
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
      <style>{MODAL_CSS}</style>

      <div className="uf-backdrop" onClick={handleClose}>
        <div className="uf-dialog" onClick={(e) => e.stopPropagation()}>

          {/* ── Header ── */}
          <div className="uf-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 3, height: 20, borderRadius: 2,
                background: `linear-gradient(180deg, ${THEME.brand} 0%, ${THEME.brandMid} 100%)`,
              }} />
              <div>
                <h2 style={{
                  margin: 0, fontSize: 16, fontWeight: 700,
                  color: THEME.text, fontFamily: "'Sora', sans-serif",
                }}>
                  Update Fees
                </h2>
                <p style={{ margin: 0, fontSize: 11, color: THEME.textMuted }}>
                  Edit fee amount and approval status
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              style={{
                width: 32, height: 32, borderRadius: 8,
                border: `1.5px solid ${THEME.border}`, background: "#fff",
                cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 18, color: THEME.textMuted,
                lineHeight: 1, transition: "all 0.15s",
              }}
            >×</button>
          </div>

          {/* ── Body ── */}
          <form onSubmit={handleSubmit}>
            <div className="uf-body">
              {loading ? (
                <div className="uf-spinner" />
              ) : (
                <>
                  {/* Price */}
                  <div>
                    <label className="uf-label">
                      Price (₹)
                      <span style={{ color: THEME.error, marginLeft: 3 }}>*</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <span style={{
                        position: "absolute", left: 10, top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: 13, fontWeight: 700, color: THEME.brandMid,
                        pointerEvents: "none",
                      }}>₹</span>
                      <input
                        className="uf-input"
                        type="text"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="0.00"
                        style={{ paddingLeft: 26 }}
                      />
                    </div>
                  </div>

                  {/* Status pills */}
                  <div>
                    <label className="uf-label">Status</label>
                    <div className="uf-status-group">
                      {STATUS_OPTIONS.map((opt) => (
                        <div
                          key={opt.value}
                          className={`uf-status-pill ${opt.cls} ${formData.status === opt.value ? "active" : ""}`}
                          onClick={() => setFormData((p) => ({ ...p, status: opt.value }))}
                        >
                          {opt.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Remark */}
                  <div>
                    <label className="uf-label">Remark</label>
                    <input
                      className="uf-input"
                      type="text"
                      name="remark"
                      value={formData.remark}
                      onChange={handleChange}
                      placeholder="Add a remark…"
                    />
                  </div>
                </>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="uf-footer">
              <SecondaryBtn onClick={handleClose}>Cancel</SecondaryBtn>
              <PrimaryBtn type="submit" disabled={submitting || loading}>
                {submitting
                  ? <><span className="uf-btn-spinner" /> Saving…</>
                  : "✓ Save Changes"}
              </PrimaryBtn>
            </div>
          </form>

        </div>
      </div>
    </>
  );
};

export default UpdateFeesModal;