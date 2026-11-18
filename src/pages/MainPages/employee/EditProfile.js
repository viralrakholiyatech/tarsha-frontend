import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getEmployeeById } from "../../../services/EmployeeService";
import { getToken } from "../../../services/useLocalStorage";
import toast from "react-hot-toast";
import { EmpRoute } from "../../../config/RouteConfig";
import ApiService from "../../../services/ApiService";
import {
  getDepartments,
  getPosts,
  updateEmployeeById,
} from "../../../config/config";
import { useForm } from "react-hook-form";
import {
  formclass,
  displayError,
  checkFile,
} from "../../../services/ValidationService";
import {
  alphabetSpaceWithDot,
  mailPattern,
  phonePattern,
} from "../../../services/Pattern";
import Multiselect from "multiselect-react-dropdown";
import { FileUrl } from "../../../config/file_url";
import { previewImage } from "../../../services/FormCommon";
import S3FileUpload from "../../../components/S3FileUpload";
import { getFileDisplayUrl } from "../../../services/S3Service";

// ─────────────────────────────────────────────
//  🎨  THEME
// ─────────────────────────────────────────────
const THEME = {
  brand: "#887549",
  brandLight: "#F5F0E8",
  brandMid: "#C4A97D",
  brandDark: "#5C4E32",
  bg: "#F8F5F0",
  border: "#EDE5D5",
  text: "#1A1A2E",
  textMuted: "#ADADAD",
  textLight: "#BDBDBD",
  error: "#CF1322",
  errorBg: "#FFF1F0",
  errorBorder: "#FFA39E",
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }
  @keyframes epFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .ep-fade { animation:epFadeIn 0.3s cubic-bezier(0.4,0,0.2,1) both; }
  @keyframes epSpin { to{transform:rotate(360deg)} }
  .ep-spinner { width:28px;height:28px;border-radius:50%;border:3px solid ${THEME.brandLight};border-top-color:${THEME.brand};animation:epSpin 0.8s linear infinite; }

  .ep-input, .ep-password {
    width:100%;padding:10px 13px;border-radius:10px;
    border:1.5px solid #E0D5C5;font-size:13px;
    font-family:'DM Sans',sans-serif;color:#1A1A2E;
    outline:none;background:#fff;
    transition:border-color 0.15s,box-shadow 0.15s;
  }
  .ep-input:focus, .ep-password:focus { border-color:${THEME.brand};box-shadow:0 0 0 3px ${THEME.brand}18; }
  .ep-input::placeholder, .ep-password::placeholder { color:${THEME.textLight}; }
  .ep-input.error, .ep-password.error { border-color:${THEME.errorBorder};background:${THEME.errorBg}; }

  /* Multiselect override */
  .ep-multiselect .searchWrapper {
    border:1.5px solid #E0D5C5 !important;border-radius:10px !important;
    padding:6px 10px !important;min-height:42px !important;background:#fff;
    font-family:'DM Sans',sans-serif;font-size:13px;
    transition:border-color 0.15s;
  }
  .ep-multiselect .searchWrapper:focus-within { border-color:${THEME.brand} !important;box-shadow:0 0 0 3px ${THEME.brand}18; }
  .ep-multiselect .chip { background:${THEME.brand} !important;border-radius:20px !important;font-size:11px !important; }
  .ep-multiselect .optionContainer li:hover,.ep-multiselect .optionContainer .highlight { background:${THEME.brandLight} !important;color:${THEME.brand} !important; }
  .ep-multiselect .optionContainer { border:1px solid ${THEME.border} !important;border-radius:10px !important;margin-top:4px; }

  /* Avatar upload zone */
  .ep-avatar-zone {
    width:100%;min-height:110px;border:2px dashed #D4C4A0;border-radius:12px;
    background:#FDFAF5;display:flex;align-items:center;justify-content:center;
    cursor:pointer;transition:all 0.18s;position:relative;overflow:hidden;
  }
  .ep-avatar-zone:hover { border-color:${THEME.brand};background:${THEME.brandLight}; }
  .ep-avatar-zone input { position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%; }
  .ep-avatar-zone.has-img { border-style:solid;border-color:${THEME.brand};background:${THEME.brandLight}; }

  ::-webkit-scrollbar{width:5px;}
  ::-webkit-scrollbar-track{background:${THEME.brandLight};}
  ::-webkit-scrollbar-thumb{background:${THEME.brandMid};border-radius:10px;}
`;

// ─────────────────────────────────────────────
//  🧩  ATOMS
// ─────────────────────────────────────────────
function FieldLabel({ children, required }) {
  return (
    <label
      style={{
        display: "block",
        marginBottom: 5,
        fontSize: 11,
        fontWeight: 700,
        color: THEME.textMuted,
        textTransform: "uppercase",
        letterSpacing: "0.07em",
      }}
    >
      {children}
      {required && <span style={{ color: THEME.error, marginLeft: 3 }}>*</span>}
    </label>
  );
}

function ErrorMsg({ message }) {
  if (!message) return null;
  return (
    <p
      style={{
        margin: "4px 0 0",
        fontSize: 11,
        color: THEME.error,
        display: "flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      ⚠ {message}
    </p>
  );
}

function CardSection({ title, icon, children }) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${THEME.border}`,
        borderRadius: 14,
        padding: "20px 24px",
        marginBottom: 16,
        boxShadow: "0 2px 10px rgba(136,117,73,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            width: 3,
            height: 16,
            borderRadius: 2,
            background: `linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)`,
          }}
        />
        <h2
          style={{
            margin: 0,
            fontSize: 12,
            fontWeight: 700,
            color: THEME.brand,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            fontFamily: "'Sora',sans-serif",
          }}
        >
          {icon && <span style={{ marginRight: 6 }}>{icon}</span>}
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function Grid({ children }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 14,
      }}
    >
      {children}
    </div>
  );
}

function PrimaryBtn({ children, type = "button", disabled }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type={type}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "10px 24px",
        borderRadius: 10,
        border: "none",
        background: disabled ? "#C4C4C4" : hov ? THEME.brandDark : THEME.brand,
        color: "#fff",
        fontSize: 13,
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "'Sora',sans-serif",
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
        padding: "10px 24px",
        borderRadius: 10,
        border: `1.5px solid ${hov ? THEME.brand : "#E0D5C5"}`,
        background: hov ? THEME.brandLight : "#fff",
        color: hov ? THEME.brand : "#595959",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "'DM Sans',sans-serif",
        transition: "all 0.18s",
      }}
    >
      {children}
    </button>
  );
}

// ─── get CSS class helper ─────────────────────
function inputCls(error) {
  return `ep-input${error ? " error" : ""}`;
}
function pwCls(error) {
  return `ep-password${error ? " error" : ""}`;
}

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const EditProfile = () => {
  const header = {
    Authorization: `Bearer ${getToken()}`,
    "Content-type": "application/json",
  };
  const navigate = useNavigate();
  const params = useParams();

  const {
    register,
    formState: { errors },
    setError,
    setValue,
    getValues,
    handleSubmit,
    reset,
    clearErrors,
  } = useForm({ mode: "onChange" });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveOldFile, setSaveOldFile] = useState("");
  const [isPreviewed, setIsPreviewed] = useState(false);
  const [previewSrc, setPreviewSrc] = useState("");
  const [profilePicture, setProfilePicture] = useState("");

  const [departValues, setDepartValues] = useState([]);

  // ── Load departments then employee ───────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const deptRes = await ApiService(
          null,
          0,
          header,
          getDepartments.method,
          getDepartments.url,
        );
        
        const empRes = await getEmployeeById(params.id, getToken());
        if (!empRes.data.error) {
          const emp = empRes.data.data[0];

          reset({
            id: emp.id,
            first_name: emp.first_name,
            last_name: emp.last_name,
            phone: emp.phone,
            email: emp.email,
            active: emp.active,
          });
          if (emp.profile_picture) {
            const src = getFileDisplayUrl(emp.profile_picture, FileUrl);
            setSaveOldFile(src);
            setPreviewSrc(src);
            setIsPreviewed(true);
            setProfilePicture(emp.profile_picture);
          }
        } else {
          toast.error(empRes.data.message);
          navigate("/dashboard");
        }
      } catch (e) {
        console.error(e);
        toast.error(e?.response?.data?.message || "Failed to load");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id]);

  // ── Submit ────────────────────────────────
  const onSubmit = async (data) => {
    const formData = new FormData();
    for (const key of Object.keys(data)) {
    if (profilePicture) {
      formData.append("profile_picture", profilePicture);
    } else if (data.file?.[0]) {
      formData.append("profile_picture", data.file[0]);
    }
       else if (key === "departments") {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    }
    setSubmitting(true);
    try {
      const h = {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "multipart/form-data",
      };
      const res = await ApiService(
        formData,
        0,
        h,
        updateEmployeeById.method,
        updateEmployeeById.url,
      );
      if (!res.data.error) {
        toast.success(res.data.message);
        navigate("/dashboard");
      } else toast.error(res.data.message);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };



  // ── Preview image handler ─────────────────
  const handleFileChange = (value) => {
    if (typeof value?.[0]?.name !== "undefined" && checkFile(value[0].name)) {
      const isOkay = previewImage(value[0], "#epPreviewImage");
      if (isOkay) {
        const reader = new FileReader();
        reader.onload = (e) => setPreviewSrc(e.target.result);
        reader.readAsDataURL(value[0]);
      }
      setIsPreviewed(isOkay);
      return isOkay;
    } else {
      if (!value?.[0]?.name) {
        if (saveOldFile) {
          setPreviewSrc(saveOldFile);
          setIsPreviewed(true);
        } else setIsPreviewed(false);
        return true;
      }
      setIsPreviewed(false);
      return "Invalid file";
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: THEME.bg,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <div className="ep-spinner" />
        <p style={{ color: THEME.textLight, fontSize: 13 }}>Loading profile…</p>
      </div>
    );
  }

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div
        style={{
          minHeight: "100vh",
          background: THEME.bg,
          fontFamily: "'DM Sans',sans-serif",
          padding: "28px 24px",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 4,
              height: 26,
              borderRadius: 3,
              background: `linear-gradient(180deg,${THEME.brand} 0%,${THEME.brandMid} 100%)`,
            }}
          />
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 800,
                color: THEME.text,
                fontFamily: "'Sora',sans-serif",
                letterSpacing: "-0.3px",
              }}
            >
              Edit Profile
            </h1>
            <p
              style={{
                margin: "2px 0 0",
                fontSize: 12,
                color: THEME.textMuted,
              }}
            >
              Update your personal information
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="ep-fade">
            {/* ── 1. Personal Info ── */}
            <CardSection title="Personal Information" icon="👤">
              <Grid>
                <div>
                  <FieldLabel required>First Name</FieldLabel>
                  <input
                    className={inputCls(errors.first_name)}
                    type="text"
                    placeholder="First name"
                    {...register("first_name", {
                      required: "Required",
                      pattern: {
                        value: alphabetSpaceWithDot,
                        message: "Invalid",
                      },
                    })}
                  />
                  <ErrorMsg message={errors.first_name?.message} />
                </div>
                <div>
                  <FieldLabel required>Last Name</FieldLabel>
                  <input
                    className={inputCls(errors.last_name)}
                    type="text"
                    placeholder="Last name"
                    {...register("last_name", {
                      required: "Required",
                      pattern: {
                        value: alphabetSpaceWithDot,
                        message: "Invalid",
                      },
                    })}
                  />
                  <ErrorMsg message={errors.last_name?.message} />
                </div>
                <div>
                  <FieldLabel required>Email Address</FieldLabel>
                  <input
                    className={inputCls(errors.email)}
                    type="text"
                    placeholder="email@example.com"
                    {...register("email", {
                      required: "Required",
                      pattern: { value: mailPattern, message: "Invalid email" },
                    })}
                  />
                  <ErrorMsg message={errors.email?.message} />
                </div>
                <div>
                  <FieldLabel required>Mobile Number</FieldLabel>
                  <input
                    className={inputCls(errors.phone)}
                    type="text"
                    placeholder="10-digit number"
                    {...register("phone", {
                      required: "Required",
                      pattern: {
                        value: phonePattern,
                        message: "Only 10 digit phone no.",
                      },
                    })}
                  />
                  <ErrorMsg message={errors.phone?.message} />
                </div>
              </Grid>
            </CardSection>

            

            {/* ── 3. Security ── */}
            <CardSection title="Update Password" icon="🔒">
              <Grid>
                <div>
                  <FieldLabel>New Password</FieldLabel>
                  <input
                    className={pwCls(errors.password)}
                    type="password"
                    placeholder="Leave blank to keep current"
                    {...register("password")}
                  />
                  <ErrorMsg message={errors.password?.message} />
                </div>
                <div>
                  <FieldLabel>Confirm Password</FieldLabel>
                  <input
                    className={pwCls(errors.confirm_password)}
                    type="password"
                    placeholder="Repeat new password"
                    {...register("confirm_password", {
                      validate: (v) =>
                        v === getValues("password") || "Passwords do not match",
                    })}
                  />
                  <ErrorMsg message={errors.confirm_password?.message} />
                </div>
              </Grid>
            </CardSection>

            {/* ── 4. Profile Picture ── */}
            <CardSection title="Profile Picture" icon="🖼️">
              <S3FileUpload
                label="Profile Picture (PNG, JPG, WEBP)"
                value={profilePicture}
                onChange={(url) => {
                  setProfilePicture(url);
                  setPreviewSrc(url);
                  setIsPreviewed(true);
                }}
                onRemove={() => {
                  setProfilePicture("");
                  setPreviewSrc("");
                  setIsPreviewed(false);
                }}
                accept="image/*"
                folder="employees"
              />
            </CardSection>

            {/* ── Actions ── */}
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}
            >
              <SecondaryBtn onClick={() => navigate("/dashboard")}>
                ← Back
              </SecondaryBtn>
              <PrimaryBtn type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        border: "2px solid #ffffff88",
                        borderTopColor: "#fff",
                        display: "inline-block",
                        animation: "epSpin 0.7s linear infinite",
                      }}
                    />
                    Saving…
                  </>
                ) : (
                  "✓ Save Changes"
                )}
              </PrimaryBtn>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditProfile;
