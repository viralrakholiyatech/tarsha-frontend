// ─────────────────────────────────────────────
//  AddPost.jsx  —  Add Post
//  Same design system as AddCampaign / AddEmployee
// ─────────────────────────────────────────────

import React, { useState } from "react";
import Select from "react-select";
import toast from "react-hot-toast";
import { getToken } from "../../../services/useLocalStorage";
import ApiService from "../../../services/ApiService";
import { addPost } from "../../../config/config";
import { PostRoute } from "../../../config/RouteConfig";
import { useNavigate } from "react-router-dom";
import S3FileUpload from "../../../components/S3FileUpload";
import { uploadFileToS3 } from "../../../services/S3Service";


// ─────────────────────────────────────────────
//  🎨  THEME
// ─────────────────────────────────────────────
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
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }
  @keyframes apFadeIn {
    from { opacity:0; transform:translateY(8px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .ap-fade { animation: apFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes apSpin { to { transform:rotate(360deg); } }

  .ap-input {
    width:100%; padding:10px 13px; border-radius:10px;
    border:1.5px solid #E0D5C5; font-size:13px;
    font-family:'DM Sans',sans-serif; color:#1A1A2E;
    outline:none; background:#fff;
    transition:border-color 0.15s, box-shadow 0.15s;
    resize:vertical; appearance:auto;
  }
  .ap-input:focus { border-color:${THEME.brand}; box-shadow:0 0 0 3px ${THEME.brand}18; }
  .ap-input::placeholder { color:${THEME.textLight}; }

  .ap-upload {
    border:2px dashed #D4C4A0; border-radius:12px;
    padding:20px; cursor:pointer;
    background:${THEME.brandLight}; transition:all 0.18s;
    display:flex; align-items:center; gap:12px;
  }
  .ap-upload:hover { border-color:${THEME.brand}; background:#F0E8D8; }
  .ap-upload input[type=file] { display:none; }

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

const TYPE_OPTIONS = [
  { value: "1", label: "🖼️ Image"    },
  { value: "2", label: "🎬 Video"    },
  { value: "3", label: "🎠 Carousel" },
  { value: "4", label: "📖 Story"    },
];

const PLATFORM_OPTIONS = [
  { value: "1", label: "📸 Instagram" },
  { value: "2", label: "💼 LinkedIn"  },
  { value: "3", label: "👥 Facebook"  },
  { value: "4", label: "▶️ YouTube"   }, 
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

function UploadZone({ id, label, hint, icon, fileName, fileCount, onChange, multiple }) {
  return (
    <label htmlFor={id} className="ap-upload">
      <input type="file" id={id} accept="image/*,video/*" multiple={multiple} onChange={onChange} />
      <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fff", border: `1px solid #D4C4A0`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        {fileName || fileCount ? (
          <>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: THEME.text }}>
              {fileName || `${fileCount} file${fileCount > 1 ? "s" : ""} selected`}
            </p>
            <p style={{ margin: 0, fontSize: 11, color: THEME.textMuted }}>Click to change</p>
          </>
        ) : (
          <>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: THEME.brand }}>{label}</p>
            <p style={{ margin: 0, fontSize: 11, color: THEME.textMuted }}>{hint}</p>
          </>
        )}
      </div>
    </label>
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
function AddPost() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [fileProgress, setFileProgress] = useState(0);

  const [formData, setFormData] = useState({
    post: "", type: "", schedule_Date: "",
    platform: "", caption: "", hastag: "",
    thumbnail: "", upload_file: [],
  });

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleMultipleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingFiles(true);
    setFileProgress(0);
    try {
      const uploadedUrls = [];
      for (let i = 0; i < files.length; i++) {
        const res = await uploadFileToS3(files[i], (pct) => {
          setFileProgress(Math.round(((i + pct / 100) / files.length) * 100));
        }, "post/files");
        uploadedUrls.push(res.fileUrl);
      }
      setFormData((p) => ({
        ...p,
        upload_file: [...(p.upload_file || []), ...uploadedUrls],
      }));
      toast.success(`${files.length} file(s) uploaded to AWS S3!`);
    } catch (err) {
      toast.error("Failed to upload files to AWS S3.");
    } finally {
      setUploadingFiles(false);
      setFileProgress(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("name",         formData.post);
      form.append("type",         formData.type);
      form.append("date",         formData.schedule_Date);
      form.append("platform_add", formData.platform);
      form.append("caption",      formData.caption);
      form.append("hastag",       formData.hastag);
      form.append("thumbnail",    formData.thumbnail || "");
      if (formData.upload_file?.length > 0)
        formData.upload_file.forEach((f) => form.append("post_file", f));

      const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "multipart/form-data" };
      const res = await ApiService(form, 0, header, addPost.method, addPost.url);

      if (!res.data.error) {
        toast.success("Post added successfully!");
        navigate(`/${PostRoute.list}`);
      } else { toast.error(res.data.message); }
    } catch { toast.error("Something went wrong."); }
    finally { setSubmitting(false); }
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div style={{ minHeight: "100vh", background: THEME.bg, fontFamily: "'DM Sans',sans-serif", padding: "28px 24px" }}>

        {/* ── Page Header ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
          <div style={{ width: 4, height: 26, borderRadius: 3, background: `linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: THEME.text, fontFamily: "'Sora',sans-serif", letterSpacing: "-0.3px" }}>
            Add Post
          </h1>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="ap-fade">

            {/* ── Section 1: Post Info ── */}
            <CardSection title="Post Information" icon="📝">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                <div>
                  <FieldLabel required>Post Name</FieldLabel>
                  <input className="ap-input" type="text" name="post"
                    placeholder="Enter post name…"
                    value={formData.post} onChange={handleInput} />
                </div>

                <div>
                  <FieldLabel>Type</FieldLabel>
                  <Select
                    options={TYPE_OPTIONS} isSearchable
                    placeholder="Select type…" styles={selectStyles}
                    value={TYPE_OPTIONS.find((o) => o.value === formData.type) || null}
                    onChange={(opt) => setFormData((p) => ({ ...p, type: opt?.value || "" }))}
                  />
                </div>

                <div>
                  <FieldLabel>Schedule Date</FieldLabel>
                  <input className="ap-input" type="date" name="schedule_Date"
                    value={formData.schedule_Date} onChange={handleInput} />
                </div>

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
              </div>
            </CardSection>

            {/* ── Section 2: Content ── */}
            <CardSection title="Post Content" icon="✍️">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <FieldLabel>Caption</FieldLabel>
                  <textarea className="ap-input" rows={4} name="caption"
                    placeholder="Write your caption…"
                    value={formData.caption} onChange={handleInput} />
                </div>
                <div>
                  <FieldLabel>Hashtags</FieldLabel>
                  <textarea className="ap-input" rows={4} name="hastag"
                    placeholder="#design #interior #architecture"
                    value={formData.hastag} onChange={handleInput} />
                </div>
              </div>
            </CardSection>

            {/* ── Section 3: Media ── */}
            <CardSection title="Media Files" icon="🖼️">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

                {/* Thumbnail */}
                <div>
                  <S3FileUpload
                    label="Thumbnail"
                    value={formData.thumbnail}
                    onChange={(url) => setFormData((p) => ({ ...p, thumbnail: url }))}
                    onRemove={() => setFormData((p) => ({ ...p, thumbnail: "" }))}
                    folder="post/thumbnails"
                    accept="image/*"
                  />
                </div>

                {/* Post Files (multiple S3) */}
                <div>
                  <FieldLabel>Post Files (Media)</FieldLabel>
                  <label htmlFor="ap-files" className="ap-upload" style={{ cursor: uploadingFiles ? "not-allowed" : "pointer" }}>
                    <input
                      type="file"
                      id="ap-files"
                      accept="image/*,video/*"
                      multiple
                      disabled={uploadingFiles}
                      onChange={handleMultipleFiles}
                    />
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fff", border: `1px solid #D4C4A0`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>📎</div>
                    <div>
                      {uploadingFiles ? (
                        <>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: THEME.brand }}>Uploading to S3… {fileProgress}%</p>
                          <p style={{ margin: 0, fontSize: 11, color: THEME.textMuted }}>Please wait while files upload</p>
                        </>
                      ) : (
                        <>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: THEME.brand }}>Upload post files to AWS</p>
                          <p style={{ margin: 0, fontSize: 11, color: THEME.textMuted }}>Images or videos, multiple allowed</p>
                        </>
                      )}
                    </div>
                  </label>

                  {/* Display uploaded post files list */}
                  {formData.upload_file?.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {formData.upload_file.map((url, idx) => (
                          <div key={idx} style={{ position: "relative", width: 50, height: 50, borderRadius: 8, overflow: "hidden", border: `1px solid ${THEME.border}`, background: "#fff" }}>
                            {/\.(mp4|mov|avi|webm)$/i.test(url) ? (
                              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎬</div>
                            ) : (
                              <img src={url} alt={`Post file ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setFormData((p) => ({
                                  ...p,
                                  upload_file: p.upload_file.filter((_, i) => i !== idx),
                                }));
                              }}
                              style={{
                                position: "absolute", top: 2, right: 2, background: "rgba(0,0,0,0.6)", color: "#fff",
                                border: "none", borderRadius: "50%", width: 16, height: 16, fontSize: 10, cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center", padding: 0
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, upload_file: [] }))}
                        style={{ marginTop: 6, fontSize: 12, color: THEME.error, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                      >
                        × Remove all files ({formData.upload_file.length})
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </CardSection>

            {/* ── Actions ── */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <SecondaryBtn onClick={() => navigate(`/${PostRoute.list}`)}>← Back</SecondaryBtn>
              <PrimaryBtn type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #ffffff88", borderTopColor: "#fff", display: "inline-block", animation: "apSpin 0.7s linear infinite" }} />
                    Saving…
                  </>
                ) : "✓ Add Post"}
              </PrimaryBtn>
            </div>

          </div>
        </form>
      </div>
    </>
  );
}

export default AddPost;