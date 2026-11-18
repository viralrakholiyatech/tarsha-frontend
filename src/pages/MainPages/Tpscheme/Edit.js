import React, { useEffect, useState } from "react";
import ApiService from "../../../services/ApiService";
import { updatetpscheme, tpschemebyid, getVillage } from "../../../config/config";
import { getToken } from "../../../services/useLocalStorage";
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

  .et-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45); z-index: 1040;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .et-dialog {
    background: #fff; border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.18);
    width: 100%; max-width: 480px;
    display: flex; flex-direction: column;
    font-family: 'DM Sans', sans-serif; overflow: hidden;
  }
  .et-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px; border-bottom: 1px solid ${THEME.border};
    background: #FDFAF5; flex-shrink: 0;
  }
  .et-body   { padding: 22px 24px; }
  .et-footer {
    display: flex; align-items: center; justify-content: flex-end;
    gap: 10px; padding: 14px 24px;
    border-top: 1px solid ${THEME.border};
  }

  .et-input, .et-select {
    width: 100%; padding: 9px 12px; border-radius: 10px;
    border: 1.5px solid #E0D5C5; font-size: 13px;
    font-family: 'DM Sans', sans-serif; color: ${THEME.text};
    outline: none; background: #fff; appearance: auto;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .et-input:focus, .et-select:focus {
    border-color: ${THEME.brand};
    box-shadow: 0 0 0 3px ${THEME.brand}18;
  }
  .et-input::placeholder { color: ${THEME.textLight}; }

  .et-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
  @media (max-width: 480px) { .et-grid { grid-template-columns: 1fr; } }

  .et-label {
    display: block; margin-bottom: 5px;
    font-size: 12px; font-weight: 600; color: #434343;
    font-family: 'DM Sans', sans-serif;
  }

  @keyframes etSpin { to { transform: rotate(360deg); } }
  .et-spinner {
    width: 24px; height: 24px; border-radius: 50%;
    border: 3px solid ${THEME.brandLight}; border-top-color: ${THEME.brand};
    animation: etSpin 0.8s linear infinite;
    margin: 32px auto; display: block;
  }
  .et-inline-spinner {
    width: 16px; height: 16px; border-radius: 50%;
    border: 2px solid ${THEME.brandLight}; border-top-color: ${THEME.brand};
    animation: etSpin 0.8s linear infinite; display: inline-block;
  }
  .et-btn-spinner {
    width: 13px; height: 13px; border-radius: 50%;
    border: 2px solid #ffffff88; border-top-color: #fff;
    animation: etSpin 0.7s linear infinite; display: inline-block;
  }
`;

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
const EditModal = ({ editshow, handleeditClose, tpschemeId, onSuccess }) => {
  const [formData,      setFormData]      = useState({ tpscheme: "", village: "", id: "" });
  const [villages,      setVillages]      = useState([]);
  const [fetchLoading,  setFetchLoading]  = useState(false);
  const [villageLoading,setVillageLoading]= useState(false);
  const [submitting,    setSubmitting]    = useState(false);

  // Fetch TP scheme data
  useEffect(() => {
    if (editshow && tpschemeId) {
      const fetchData = async () => {
        try {
          setFetchLoading(true);
          const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };
          const res    = await ApiService({}, tpschemeId, header, tpschemebyid.method, tpschemebyid.url);

          if (
            (res.status === 200 || res.status === 201) &&
            res.data?.data?.length > 0
          ) {
            const d = res.data.data[0];
            setFormData({ id: d.id, village: d.village || "", tpscheme: d.tpscheme || "" });
          } else {
            toast.error("Failed to fetch TP Scheme data");
          }
        } catch (err) {
          console.error(err);
          toast.error("An unexpected error occurred.");
        } finally {
          setFetchLoading(false);
        }
      };
      fetchData();
    }
  }, [editshow, tpschemeId]);

  // Fetch villages
  const fetchVillage = async () => {
    try {
      setVillageLoading(true);
      const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };
      const res    = await ApiService(null, 0, header, getVillage.method, getVillage.url);
      if (!res.data.error) setVillages(res.data.data || []);
      else toast.error(res.data?.message);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "An error occurred");
    } finally {
      setVillageLoading(false);
    }
  };

  useEffect(() => { fetchVillage(); }, []);

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };
      const res    = await ApiService(formData, 0, header, updatetpscheme.method, updatetpscheme.url);

      if (res.status === 200 && !res.data.error) {
        toast.success(res.data.message || "TP Scheme updated successfully");
        handleeditClose();
        onSuccess?.();
        setFormData({ tpscheme: "", village: "" });
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

  if (!editshow) return null;

  return (
    <>
      <style>{MODAL_CSS}</style>

      <div className="et-backdrop" onClick={handleeditClose}>
        <div className="et-dialog" onClick={(e) => e.stopPropagation()}>

          {/* ── Header ── */}
          <div className="et-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 3, height: 20, borderRadius: 2,
                background: `linear-gradient(180deg, ${THEME.brand} 0%, ${THEME.brandMid} 100%)`,
              }} />
              <h2 style={{
                margin: 0, fontSize: 16, fontWeight: 700,
                color: THEME.text, fontFamily: "'Sora', sans-serif",
              }}>
                Edit TP Scheme
              </h2>
            </div>
            <button
              onClick={handleeditClose}
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
            <div className="et-body">
              {fetchLoading ? (
                <div className="et-spinner" />
              ) : (
                <div className="et-grid">

                  {/* Village */}
                  <div>
                    <label className="et-label">
                      Village
                      <span style={{ color: THEME.error, marginLeft: 3 }}>*</span>
                    </label>
                    {villageLoading ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 0" }}>
                        <span className="et-inline-spinner" />
                        <span style={{ fontSize: 12, color: THEME.textMuted }}>Loading…</span>
                      </div>
                    ) : (
                      <select
                        className="et-select"
                        name="village"
                        value={formData.village}
                        onChange={handleChange}
                      >
                        <option value="">— Select village —</option>
                        {villages.map((v) => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* TP Scheme */}
                  <div>
                    <label className="et-label">
                      TP Scheme
                      <span style={{ color: THEME.error, marginLeft: 3 }}>*</span>
                    </label>
                    <input
                      className="et-input"
                      type="text"
                      name="tpscheme"
                      value={formData.tpscheme}
                      onChange={handleChange}
                      placeholder="Enter TP scheme…"
                    />
                  </div>

                </div>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="et-footer">
              <SecondaryBtn onClick={handleeditClose}>Cancel</SecondaryBtn>
              <PrimaryBtn type="submit" disabled={submitting || fetchLoading}>
                {submitting
                  ? <><span className="et-btn-spinner" /> Saving…</>
                  : "✓ Save Changes"}
              </PrimaryBtn>
            </div>
          </form>

        </div>
      </div>
    </>
  );
};

export default EditModal;