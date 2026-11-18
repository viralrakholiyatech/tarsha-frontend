// ─────────────────────────────────────────────
//  EditPost.jsx  —  Edit Post
//  Same design system as AddPost
// ─────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import Select from "react-select";
import toast from "react-hot-toast";
import { getToken } from "../../../services/useLocalStorage";
import ApiService from "../../../services/ApiService";
import { updatePost, fetchpostbyid } from "../../../config/config";
import { PostRoute } from "../../../config/RouteConfig";
import { FileUrl } from "../../../config/file_url";
import { useNavigate, useParams } from "react-router-dom";
import S3FileUpload from "../../../components/S3FileUpload";
import { uploadFileToS3, getFileDisplayUrl } from "../../../services/S3Service";


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
  @keyframes epFadeIn {
    from { opacity:0; transform:translateY(8px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .ep-fade { animation: epFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes epSpin { to { transform:rotate(360deg); } }
  @keyframes epShimmer {
    0%   { background-position:200% 0; }
    100% { background-position:-200% 0; }
  }

  .ep-input {
    width:100%; padding:10px 13px; border-radius:10px;
    border:1.5px solid #E0D5C5; font-size:13px;
    font-family:'DM Sans',sans-serif; color:#1A1A2E;
    outline:none; background:#fff;
    transition:border-color 0.15s, box-shadow 0.15s;
    resize:vertical; appearance:auto;
  }
  .ep-input:focus { border-color:${THEME.brand}; box-shadow:0 0 0 3px ${THEME.brand}18; }
  .ep-input::placeholder { color:${THEME.textLight}; }

  .ep-upload {
    border:2px dashed #D4C4A0; border-radius:12px;
    padding:20px; cursor:pointer;
    background:${THEME.brandLight}; transition:all 0.18s;
    display:flex; align-items:center; gap:12px;
  }
  .ep-upload:hover { border-color:${THEME.brand}; background:#F0E8D8; }
  .ep-upload input[type=file] { display:none; }

  .ep-skel {
    border-radius:8px;
    background:linear-gradient(90deg,#F5EFE8 25%,#EDE5D5 50%,#F5EFE8 75%);
    background-size:200% 100%;
    animation:epShimmer 1.4s infinite;
  }

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

function SkeletonSection() {
  return (
    <div style={{ background: "#fff", border: `1px solid ${THEME.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 16, boxShadow: "0 2px 10px rgba(136,117,73,0.06)" }}>
      <div className="ep-skel" style={{ width: 100, height: 12, marginBottom: 20 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 16 }}>
        {[1, 2, 3, 4].map((n) => (
          <div key={n}>
            <div className="ep-skel" style={{ width: 70, height: 10, marginBottom: 6 }} />
            <div className="ep-skel" style={{ height: 42 }} />
          </div>
        ))}
      </div>
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
function EditPost() {
  const params   = useParams();
  const navigate = useNavigate();

  const [fetching,   setFetching]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savedThumb, setSavedThumb] = useState("");   // existing thumb URL
  const [savedImages,  setSavedImages]  = useState([]); // existing post images
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [fileProgress, setFileProgress] = useState(0);

  const [formData, setFormData] = useState({
    post: "", type: "", schedule_Date: "",
    platform: "", caption: "", hastag: "",
    thumbnail: "", upload_file: [],
  });

  // ── Fetch ─────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      try {
        const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };
        const res = await ApiService({}, params.id, header, fetchpostbyid.method, fetchpostbyid.url);
        if (res?.data?.data?.length > 0) {
          const d = res.data.data[0];
          const platformValue = Array.isArray(d.platform_add) && d.platform_add.length > 0
            ? d.platform_add.join(",") : String(d.platform_add || "");

          setFormData({
            post:          d.name          || "",
            type:          String(d.type   || ""),
            schedule_Date: d.date          || "",
            platform:      platformValue,
            caption:       d.caption       || "",
            hastag:        d.hastag        || "",
            thumbnail: null, upload_file: [],
          });

          if (d.thumbnail) setSavedThumb(d.thumbnail);
          if (Array.isArray(d.images)) setSavedImages(d.images);
        } else { toast.error("No post found."); }
      } catch (e) { toast.error("An unexpected error occurred."); }
      finally { setFetching(false); }
    };
    fetchData();
  }, [params.id]);

  // ── Handlers ─────────────────────────────
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
      form.append("id",           params.id);
      form.append("name",         formData.post);
      form.append("type",         formData.type);
      form.append("date",         formData.schedule_Date);
      form.append("platform_add", formData.platform);
      form.append("caption",      formData.caption);
      form.append("hastag",       formData.hastag);
      form.append("thumbnail",    formData.thumbnail !== undefined && formData.thumbnail !== null && formData.thumbnail !== "" ? formData.thumbnail : (savedThumb || ""));
      const allPostFiles = [
        ...savedImages.map((img) => img.post_file).filter(Boolean),
        ...(formData.upload_file || []),
      ];
      if (allPostFiles.length > 0) {
        allPostFiles.forEach((f) => form.append("post_file", f));
      } else {
        form.append("post_files_cleared", "true");
      }

      const header = { Authorization: `Bearer ${getToken()}`, "Content-Type": "multipart/form-data" };
      const res = await ApiService(form, 0, header, updatePost.method, updatePost.url);

      if (!res.data.error) {
        toast.success("Post updated successfully!");
        navigate(`/${PostRoute.list}`);
      } else { toast.error(res.data.message); }
    } catch { toast.error("Something went wrong."); }
    finally { setSubmitting(false); }
  };

  // ── Render ────────────────────────────────
  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div style={{ minHeight: "100vh", background: THEME.bg, fontFamily: "'DM Sans',sans-serif", padding: "28px 24px" }}>

        {/* ── Page Header ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
          <div style={{ width: 4, height: 26, borderRadius: 3, background: `linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)` }} />
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: THEME.text, fontFamily: "'Sora',sans-serif", letterSpacing: "-0.3px" }}>
              Edit Post
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: THEME.textMuted }}>
              {fetching ? "Loading…" : `Post #${params.id}`}
            </p>
          </div>
        </div>

        {fetching ? (
          <>
            <SkeletonSection />
            <SkeletonSection />
            <SkeletonSection />
          </>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="ep-fade">

              {/* ── Section 1: Post Info ── */}
              <CardSection title="Post Information" icon="📝">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                  <div>
                    <FieldLabel required>Post Name</FieldLabel>
                    <input className="ep-input" type="text" name="post"
                      placeholder="Enter post name…"
                      value={formData.post} onChange={handleInput} />
                  </div>

                  <div>
                    <FieldLabel>Type</FieldLabel>
                    <Select
                      options={TYPE_OPTIONS} isSearchable
                      placeholder="Select type…" styles={selectStyles}
                      value={TYPE_OPTIONS.find((o) => o.value === String(formData.type)) || null}
                      onChange={(opt) => setFormData((p) => ({ ...p, type: opt?.value || "" }))}
                    />
                  </div>

                  <div>
                    <FieldLabel>Schedule Date</FieldLabel>
                    <input className="ep-input" type="date" name="schedule_Date"
                      value={formData.schedule_Date} onChange={handleInput} />
                  </div>

                  <div>
                    <FieldLabel>Platform</FieldLabel>
                    <Select
                      options={PLATFORM_OPTIONS} isMulti isSearchable
                      placeholder="Select platforms…" styles={selectStyles}
                      value={PLATFORM_OPTIONS.filter((o) =>
                        String(formData.platform || "").split(",").includes(String(o.value))
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
                    <textarea className="ep-input" rows={4} name="caption"
                      placeholder="Write your caption…"
                      value={formData.caption} onChange={handleInput} />
                  </div>
                  <div>
                    <FieldLabel>Hashtags</FieldLabel>
                    <textarea className="ep-input" rows={4} name="hastag"
                      placeholder="#design #interior #architecture"
                      value={formData.hastag} onChange={handleInput} />
                  </div>
                </div>
              </CardSection>

              {/* ── Section 3: Media ── */}
              <CardSection title="Media Files" icon="🖼️">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

                  {/* Thumbnail */}
                  <div>
                    <FieldLabel>Thumbnail</FieldLabel>
                    <S3FileUpload
                      folder="post/thumbnails"
                      initialValue={formData.thumbnail || savedThumb}
                      onUploadSuccess={(url) => {
                        setFormData((p) => ({ ...p, thumbnail: url }));
                        setSavedThumb(url);
                      }}
                      onRemove={() => {
                        setFormData((p) => ({ ...p, thumbnail: "" }));
                        setSavedThumb("");
                      }}
                    />
                  </div>

                  {/* Post Files */}
                  <div>
                    <FieldLabel>Post Files (Images / Videos)</FieldLabel>

                    {/* Existing saved images */}
                    {savedImages.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 600, color: THEME.text }}>
                          Existing Media ({savedImages.length})
                        </p>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {savedImages.map((img, i) => {
                            const url = getFileDisplayUrl(img?.post_file, FileUrl);
                            return (
                              <div key={i} style={{ position: "relative", width: 56, height: 56 }}>
                                <img
                                  src={url}
                                  alt={`Saved ${i + 1}`}
                                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8, border: `1.5px solid ${THEME.border}` }}
                                  onError={(e) => { e.target.style.display = "none"; }}
                                />
                                <button
                                  type="button"
                                  onClick={() => setSavedImages((prev) => prev.filter((_, idx) => idx !== i))}
                                  style={{
                                    position: "absolute", top: -5, right: -5, width: 18, height: 18,
                                    borderRadius: "50%", background: THEME.error, color: "#fff",
                                    border: "none", fontSize: 11, cursor: "pointer", display: "flex",
                                    alignItems: "center", justifyContent: "center", lineHeight: 1
                                  }}
                                  title="Remove image"
                                >
                                  ×
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Newly uploaded files */}
                    {formData.upload_file?.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 600, color: THEME.brand }}>
                          Newly Uploaded to AWS ({formData.upload_file.length})
                        </p>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {formData.upload_file.map((fileUrl, i) => {
                            const url = getFileDisplayUrl(fileUrl, FileUrl);
                            return (
                              <div key={i} style={{ position: "relative", width: 56, height: 56 }}>
                                <img
                                  src={url}
                                  alt={`Uploaded ${i + 1}`}
                                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8, border: `1.5px solid ${THEME.brand}` }}
                                  onError={(e) => { e.target.style.display = "none"; }}
                                />
                                <button
                                  type="button"
                                  onClick={() => setFormData((p) => ({
                                    ...p,
                                    upload_file: p.upload_file.filter((_, idx) => idx !== i),
                                  }))}
                                  style={{
                                    position: "absolute", top: -5, right: -5, width: 18, height: 18,
                                    borderRadius: "50%", background: THEME.error, color: "#fff",
                                    border: "none", fontSize: 11, cursor: "pointer", display: "flex",
                                    alignItems: "center", justifyContent: "center", lineHeight: 1
                                  }}
                                  title="Remove image"
                                >
                                  ×
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Upload button */}
                    <label htmlFor="ep-files" className="ep-upload" style={{ cursor: uploadingFiles ? "not-allowed" : "pointer" }}>
                      <input
                        type="file"
                        id="ep-files"
                        accept="image/*,video/*"
                        multiple
                        disabled={uploadingFiles}
                        onChange={handleMultipleFiles}
                      />
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fff", border: `1px solid #D4C4A0`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                        {uploadingFiles ? "⏳" : "☁️"}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: THEME.brand }}>
                          {uploadingFiles ? `Uploading to AWS S3 (${fileProgress}%)...` : "Upload files to AWS S3"}
                        </p>
                        <p style={{ margin: 0, fontSize: 11, color: THEME.textMuted }}>
                          Images or videos (multiple allowed)
                        </p>
                      </div>
                    </label>

                    {uploadingFiles && (
                      <div style={{ marginTop: 8, background: "#E5E7EB", borderRadius: 4, height: 6, overflow: "hidden" }}>
                        <div style={{ width: `${fileProgress}%`, height: "100%", background: THEME.brand, transition: "width 0.2s" }} />
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
                      <span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #ffffff88", borderTopColor: "#fff", display: "inline-block", animation: "epSpin 0.7s linear infinite" }} />
                      Saving…
                    </>
                  ) : "✓ Save Changes"}
                </PrimaryBtn>
              </div>

            </div>
          </form>
        )}
      </div>
    </>
  );
}

export default EditPost;