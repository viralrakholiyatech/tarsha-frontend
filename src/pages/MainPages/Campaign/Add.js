

import React, { useState, useEffect } from "react";
import Select from "react-select";
import toast from "react-hot-toast";
import { getToken } from "../../../services/useLocalStorage";
import ApiService from "../../../services/ApiService";
import { fetchpostData, AddOrUpdateCampaign } from "../../../config/config";
import { CampaignRoute } from "../../../config/RouteConfig";
import { useNavigate } from "react-router-dom";
import S3FileUpload from "../../../components/S3FileUpload";

const THEME = {
  brand:       "#887549",
  brandLight:  "#F5F0E8",
  brandMid:    "#C4A97D",
  brandDark:   "#5C4E32",
  bg:          "#F8F5F0",
  border:      "#EDE5D5",
  text:        "#1A1A2E",
  textMuted:   "#ADADAD",
  textLight:   "#BDBDBD",
  error:       "#CF1322",
  errorBg:     "#FFF1F0",
  errorBorder: "#FFA39E",
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }
  @keyframes acFadeIn {
    from { opacity:0; transform:translateY(8px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .ac-fade { animation: acFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes acSpin { to { transform:rotate(360deg); } }

  .ac-input {
    width:100%; padding:10px 13px; border-radius:10px;
    border:1.5px solid #E0D5C5; font-size:13px;
    font-family:'DM Sans',sans-serif; color:#1A1A2E;
    outline:none; background:#fff;
    transition:border-color 0.15s, box-shadow 0.15s;
    appearance:auto;
  }
  .ac-input:focus { border-color:${THEME.brand}; box-shadow:0 0 0 3px ${THEME.brand}18; }
  .ac-input::placeholder { color:${THEME.textLight}; }

  .ac-upload {
    border:2px dashed #D4C4A0; border-radius:12px;
    padding:22px 20px; text-align:center; cursor:pointer;
    background:${THEME.brandLight}; transition:all 0.18s;
    display:flex; flex-direction:column; align-items:center; gap:8px;
  }
  .ac-upload:hover { border-color:${THEME.brand}; background:#F0E8D8; }
  .ac-upload input[type=file] { display:none; }

  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:${THEME.brandLight}; }
  ::-webkit-scrollbar-thumb { background:${THEME.brandMid}; border-radius:10px; }
`;

const selectStyles = {
  control: (base, state) => ({
    ...base,
    border: `1.5px solid ${state.isFocused ? THEME.brand : "#E0D5C5"}`,
    borderRadius: 10, minHeight: 42,
    boxShadow: state.isFocused ? `0 0 0 3px ${THEME.brand}18` : "none",
    fontFamily: "'DM Sans',sans-serif", fontSize: 13,
    "&:hover": { borderColor: THEME.brand },
  }),
  option: (base, state) => ({
    ...base,
    background: state.isSelected ? THEME.brand : state.isFocused ? THEME.brandLight : "#fff",
    color: state.isSelected ? "#fff" : THEME.text,
    fontSize: 13, cursor: "pointer",
  }),
  placeholder: (base) => ({ ...base, color: THEME.textLight, fontSize: 13 }),
  singleValue:  (base) => ({ ...base, color: THEME.text, fontSize: 13 }),
  multiValue: (base) => ({ ...base, background: THEME.brandLight, borderRadius: 20 }),
  multiValueLabel: (base) => ({ ...base, color: THEME.brand, fontSize: 12, fontWeight: 600 }),
  multiValueRemove: (base) => ({ ...base, color: THEME.brand, ":hover": { background: THEME.brand, color: "#fff" } }),
};

const BUDGET_OPTIONS = [
  { value: "1", label: "📅 Monthly" },
  { value: "2", label: "📅 Weekly"  },
  { value: "3", label: "📅 Daily"   },
];

const PLATFORM_OPTIONS = [
  { value: "1", label: "📸 Instagram" },
  { value: "2", label: "💼 LinkedIn"  },
  { value: "3", label: "👥 Facebook"  },
];


// ─────────────────────────────────────────────
//  🧩  ATOMS
// ─────────────────────────────────────────────

function FieldLabel({ children, required }) {
  return (
    <label style={{
      display: "block", marginBottom: 5,
      fontSize: 11, fontWeight: 700, color: THEME.textMuted,
      textTransform: "uppercase", letterSpacing: "0.07em",
    }}>
      {children}{required && <span style={{ color: THEME.error, marginLeft: 3 }}>*</span>}
    </label>
  );
}

function CardSection({ title, icon, children }) {
  return (
    <div style={{
      background: "#fff", border: `1px solid ${THEME.border}`, borderRadius: 14,
      padding: "22px 24px", marginBottom: 16,
      boxShadow: "0 2px 10px rgba(136,117,73,0.06)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <div style={{ width: 3, height: 16, borderRadius: 2, background: `linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
        <h2 style={{ margin: 0, fontSize: 12, fontWeight: 700, color: THEME.brand, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "'Sora',sans-serif" }}>
          {icon && <span style={{ marginRight: 6 }}>{icon}</span>}{title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function PrimaryBtn({ children, type = "button", onClick, disabled }) {
  const [hov, setHov] = useState(false);
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: "10px 24px", borderRadius: 10, border: "none",
        background: disabled ? "#C4C4C4" : hov ? THEME.brandDark : THEME.brand,
        color: "#fff", fontSize: 13, fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "'Sora',sans-serif", transition: "all 0.18s",
        boxShadow: disabled ? "none" : `0 2px 8px ${THEME.brand}44`,
        display: "inline-flex", alignItems: "center", gap: 6,
      }}>
      {children}
    </button>
  );
}

function SecondaryBtn({ children, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: "10px 24px", borderRadius: 10,
        border: `1.5px solid ${hov ? THEME.brand : "#E0D5C5"}`,
        background: hov ? THEME.brandLight : "#fff",
        color: hov ? THEME.brand : "#595959",
        fontSize: 13, fontWeight: 600, cursor: "pointer",
        fontFamily: "'DM Sans',sans-serif", transition: "all 0.18s",
      }}>
      {children}
    </button>
  );
}


// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
function AddCampaign() {
  const navigate = useNavigate();

  const [loading,    setLoading]    = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [post,       setPost]       = useState([]);
  const [fileName,   setFileName]   = useState("");

  const [formData, setFormData] = useState({
    name: "", budget: "", budget_type: "", postId: "",
    description: "", start_date: "", start_time: "",
    end_date: "", end_time: "", platform: "",
    target_people: "", location: "", screenshot: "",
  });

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const header = { Authorization: `Bearer ${getToken()}` };
        const res = await ApiService(null, 0, header, fetchpostData.method, fetchpostData.url);
        if (!res.data.error)
          console.log("res-->",res)
          setPost((res.data.data || []).map((item) => ({ value: item.id, label: item.name })));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("name",              formData.name);
      form.append("budget",            formData.budget);
      form.append("budget_type",       formData.budget_type);
      form.append("post_id",           formData.postId);
      form.append("description",       formData.description);
      form.append("start_date",        formData.start_date);
      form.append("start_time",        formData.start_time);
      form.append("end_date",          formData.end_date);
      form.append("end_time",          formData.end_time);
      form.append("campaign_platform", formData.platform);
      form.append("target_people",     formData.target_people);
      form.append("target_location",   formData.location);
      form.append("screenshot",        formData.screenshot || "");

      const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "multipart/form-data" };
      const res = await ApiService(form, 0, header, AddOrUpdateCampaign.method, AddOrUpdateCampaign.url);

      if (!res.data.error) {
        toast.success("Campaign added successfully!");
        navigate(`/${CampaignRoute.list}`);
      } else { toast.error(res.data.message); }
    } catch { toast.error("Something went wrong."); }
    finally { setSubmitting(false); }
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div style={{ minHeight: "100vh",  fontFamily: "'DM Sans',sans-serif", padding: "28px 24px" }}>

        {/* ── Page Header ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
          <div style={{ width: 4, height: 26, borderRadius: 3, background: `linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: THEME.text, fontFamily: "'Sora',sans-serif", letterSpacing: "-0.3px" }}>
            Add Campaign
          </h1>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0", gap: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", border: `3px solid ${THEME.brandLight}`, borderTopColor: THEME.brand, animation: "acSpin 0.8s linear infinite" }} />
            <p style={{ color: THEME.textLight, fontSize: 13, margin: 0 }}>Loading…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="ac-fade">

              {/* ── Section 1: Campaign Info ── */}
              <CardSection title="Campaign Information" icon="📣">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>

                  <div>
                    <FieldLabel required>Campaign Name</FieldLabel>
                    <input className="ac-input" type="text" name="name"
                      placeholder="Enter campaign name…"
                      value={formData.name} onChange={handleInput} />
                  </div>

                  <div>
                    <FieldLabel required>Budget</FieldLabel>
                    <input className="ac-input" type="text" name="budget"
                      placeholder="e.g. 5000"
                      value={formData.budget} onChange={handleInput} />
                  </div>

                  <div>
                    <FieldLabel>Budget Type</FieldLabel>
                    <Select
                      options={BUDGET_OPTIONS} isSearchable
                      placeholder="Select type…" styles={selectStyles}
                      value={BUDGET_OPTIONS.find((o) => o.value === formData.budget_type) || null}
                      onChange={(opt) => setFormData((p) => ({ ...p, budget_type: opt?.value || "" }))}
                    />
                  </div>

                  <div style={{ gridColumn: "span 2" }}>
                    <FieldLabel>Description</FieldLabel>
                    <input className="ac-input" type="text" name="description"
                      placeholder="Describe your campaign…"
                      value={formData.description} onChange={handleInput} />
                  </div>

                  <div>
                    <FieldLabel>Linked Post</FieldLabel>
                    <Select
                      options={post} isSearchable
                      placeholder="Select post…" styles={selectStyles}
                      value={post.find((o) => o.value === formData.postId) || null}
                      onChange={(opt) => setFormData((p) => ({ ...p, postId: opt?.value || "" }))}
                    />
                  </div>

                </div>
              </CardSection>

              {/* ── Section 2: Schedule ── */}
              <CardSection title="Campaign Schedule" icon="📅">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
                  <div>
                    <FieldLabel>Start Date</FieldLabel>
                    <input className="ac-input" type="date" name="start_date"
                      value={formData.start_date} onChange={handleInput} />
                  </div>
                  <div>
                    <FieldLabel>Start Time</FieldLabel>
                    <input className="ac-input" type="time" name="start_time"
                      value={formData.start_time} onChange={handleInput} />
                  </div>
                  <div>
                    <FieldLabel>End Date</FieldLabel>
                    <input className="ac-input" type="date" name="end_date"
                      value={formData.end_date} onChange={handleInput} />
                  </div>
                  <div>
                    <FieldLabel>End Time</FieldLabel>
                    <input className="ac-input" type="time" name="end_time"
                      value={formData.end_time} onChange={handleInput} />
                  </div>
                </div>
              </CardSection>

              {/* ── Section 3: Targeting ── */}
              <CardSection title="Targeting" icon="🎯">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>

                  <div>
                    <FieldLabel>Platform</FieldLabel>
                    <Select
                      options={PLATFORM_OPTIONS} isMulti isSearchable
                      placeholder="Select platforms…" styles={selectStyles}
                      value={PLATFORM_OPTIONS.filter((o) =>
                        formData.platform?.split(",").includes(o.value)
                      )}
                      onChange={(sel) => setFormData((p) => ({
                        ...p, platform: sel ? sel.map((o) => o.value).join(",") : "",
                      }))}
                    />
                  </div>

                  <div>
                    <FieldLabel>Target Audience</FieldLabel>
                    <input className="ac-input" type="text" name="target_people"
                      placeholder="e.g. 25–40 yr homeowners"
                      value={formData.target_people} onChange={handleInput} />
                  </div>

                  <div>
                    <FieldLabel>Target Location</FieldLabel>
                    <input className="ac-input" type="text" name="location"
                      placeholder="e.g. Ahmedabad, Gujarat"
                      value={formData.location} onChange={handleInput} />
                  </div>

                </div>
              </CardSection>

              {/* ── Section 4: Screenshot ── */}
              <CardSection title="Campaign Screenshot" icon="🖼️">
                <div style={{ maxWidth: 380 }}>
                  <S3FileUpload
                    label="Campaign Screenshot"
                    value={formData.screenshot}
                    onChange={(url) => setFormData((p) => ({ ...p, screenshot: url }))}
                    onRemove={() => setFormData((p) => ({ ...p, screenshot: "" }))}
                    folder="campaign/screenshots"
                    accept="image/*,application/pdf"
                  />
                </div>
              </CardSection>

              {/* ── Actions ── */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <SecondaryBtn onClick={() => navigate(`/${CampaignRoute.list}`)}>← Back</SecondaryBtn>
                <PrimaryBtn type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #ffffff88", borderTopColor: "#fff", display: "inline-block", animation: "acSpin 0.7s linear infinite" }} />
                      Saving…
                    </>
                  ) : "✓ Add Campaign"}
                </PrimaryBtn>
              </div>

            </div>
          </form>
        )}
      </div>
    </>
  );
}

export default AddCampaign;