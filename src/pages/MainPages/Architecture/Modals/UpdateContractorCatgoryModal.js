
import React, { useEffect, useState } from "react";
import ApiService from "../../../../services/ApiService";
import { updatearchContractorCategory, fetcharchContractorcategorybyid } from "../../../../config/config";
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

  .ucc-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45); z-index: 1040;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .ucc-dialog {
    background: #fff; border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.18);
    width: 100%; max-width: 420px;
    display: flex; flex-direction: column;
    font-family: 'DM Sans', sans-serif; overflow: hidden;
  }
  .ucc-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px; border-bottom: 1px solid ${THEME.border};
    background: #FDFAF5; flex-shrink: 0;
  }
  .ucc-body { padding: 22px 24px; display: flex; flex-direction: column; gap: 14px; }
  .ucc-footer {
    display: flex; align-items: center; justify-content: flex-end;
    gap: 10px; padding: 14px 24px;
    border-top: 1px solid ${THEME.border};
  }
  .ucc-input {
    width: 100%; padding: 9px 12px; border-radius: 10px;
    border: 1.5px solid #E0D5C5; font-size: 13px;
    font-family: 'DM Sans', sans-serif; color: ${THEME.text};
    outline: none; background: #fff;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .ucc-input:focus {
    border-color: ${THEME.brand};
    box-shadow: 0 0 0 3px ${THEME.brand}18;
  }
  .ucc-input::placeholder { color: ${THEME.textLight}; }
  .ucc-input.err {
    border-color: ${THEME.errorBorder};
    background: ${THEME.errorLight};
  }

  @keyframes uccSpin { to { transform: rotate(360deg); } }
  .ucc-page-spinner {
    width: 26px; height: 26px; border-radius: 50%;
    border: 3px solid ${THEME.brandLight}; border-top-color: ${THEME.brand};
    animation: uccSpin 0.8s linear infinite;
    margin: 20px auto; display: block;
  }
  .ucc-btn-spinner {
    width: 13px; height: 13px; border-radius: 50%;
    border: 2px solid #ffffff88; border-top-color: #fff;
    animation: uccSpin 0.7s linear infinite; display: inline-block;
  }
`;

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

function FieldLabel({ children, required }) {
  return (
    <label style={{
      display: "block", marginBottom: 6,
      fontSize: 12, fontWeight: 600, color: "#434343",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {children}
      {required && <span style={{ color: THEME.error, marginLeft: 3 }}>*</span>}
    </label>
  );
}

function FieldError({ msg }) {
  if (!msg) return null;
  return <p style={{ margin: "4px 0 0", fontSize: 11, color: THEME.error }}>{msg}</p>;
}

const UpdateContractorCatgoryModal = ({ show, handleClose, editId, onSuccess }) => {
  const [formData,   setFormData]   = useState({ id: "", name: "" });
  const [errors,     setErrors]     = useState({});
  const [fetching,   setFetching]   = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!show || !editId) return;
    const fetchData = async () => {
      try {
        setFetching(true);
        const header = {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        };
        const res = await ApiService(
          {}, editId, header,
          fetcharchContractorcategorybyid.method,
          fetcharchContractorcategorybyid.url
        );
        if ((res.status === 200 || res.status === 201) && res.data?.data?.length > 0) {
          const d = res.data.data[0];
          setFormData({ id: d.id, name: d.name || "" });
        } else {
          toast.error("Failed to fetch category data");
        }
      } catch (err) {
        console.error(err);
        toast.error("An unexpected error occurred.");
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [show, editId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((p)  => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = "Category name is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }
    setErrors({});

    try {
      setSubmitting(true);
      const header = {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      };
      const res = await ApiService(
        formData, 0, header,
        updatearchContractorCategory.method,
        updatearchContractorCategory.url
      );
      if (res.status === 200 && !res.data.error) {
        toast.success(res.data.message || "Category updated successfully");
        handleClose();
        onSuccess?.();
        setFormData({ id: "", name: "" });
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

  // ✅ KEY FIX: unmounts completely when hidden
  if (!show) return null;

  return (
    <>
      <style>{MODAL_CSS}</style>

      <div className="ucc-backdrop" onClick={handleClose}>
        <div className="ucc-dialog" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="ucc-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 3, height: 20, borderRadius: 2,
                background: `linear-gradient(180deg, ${THEME.brand} 0%, ${THEME.brandMid} 100%)`,
              }} />
              <h2 style={{
                margin: 0, fontSize: 16, fontWeight: 700,
                color: THEME.text, fontFamily: "'Sora', sans-serif",
              }}>
                Update Category
              </h2>
            </div>
            <button
              onClick={handleClose}
              style={{
                width: 32, height: 32, borderRadius: 8,
                border: `1.5px solid ${THEME.border}`, background: "#fff",
                cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 18, color: THEME.textMuted,
                lineHeight: 1,
              }}
            >×</button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit}>
            <div className="ucc-body">
              {fetching ? (
                <div className="ucc-page-spinner" />
              ) : (
                <div>
                  <FieldLabel required>Category Name</FieldLabel>
                  <input
                    type="text"
                    className={`ucc-input ${errors.name ? "err" : ""}`}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter category name…"
                    autoFocus
                  />
                  <FieldError msg={errors.name} />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="ucc-footer">
              <SecondaryBtn onClick={handleClose}>Cancel</SecondaryBtn>
              <PrimaryBtn type="submit" disabled={submitting || fetching}>
                {submitting
                  ? <><span className="ucc-btn-spinner" /> Updating…</>
                  : "✓ Update"}
              </PrimaryBtn>
            </div>
          </form>

        </div>
      </div>
    </>
  );
};

export default UpdateContractorCatgoryModal;