import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useLocalStorage, {
  getUserRoles,
  superAccess,
} from "../../services/useLocalStorage";
import toast, { Toaster } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { mailPattern } from "../../services/Pattern";
import ApiService from "../../services/ApiService";
import { userlogin } from "../../config/config";
import { dashboard } from "../../config/RouteConfig";
import { FileUrl } from "../../config/file_url";

// ─────────────────────────────────────────────
//  🎨  THEME
// ─────────────────────────────────────────────
const T = {
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
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

  @keyframes lgFadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes lgSpin    { to{transform:rotate(360deg)} }
  @keyframes lgPulse   { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.08)} }
  @keyframes lgFloat   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }

  /* ── Layout ── */
  .lg-root {
    min-height:100vh;display:flex;font-family:'DM Sans',sans-serif;
    background:${T.bg};
  }

  /* ── Left panel ── */
  .lg-left {
    flex:0 0 460px;width:460px;background:#fff;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    padding:48px 52px;border-right:1.5px solid ${T.border};
    animation:lgFadeUp 0.5s cubic-bezier(0.4,0,0.2,1) both;
  }
  @media (max-width:768px) {
    .lg-right { display:none; }
    .lg-left  { flex:1;width:100%;border-right:none; }
  }

  /* ── Right panel ── */
  .lg-right {
    flex:1;background:linear-gradient(135deg,${T.brandDark} 0%,${T.brand} 50%,${T.brandMid} 100%);
    display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;
  }
  /* Decorative circles */
  .lg-circle {
    position:absolute;border-radius:50%;background:rgba(255,255,255,0.06);
  }

  /* ── Logo ── */
  .lg-logo { margin-bottom:36px;align-self:flex-start; }
  .lg-logo img { height:40px; }

  /* ── Heading ── */
  .lg-heading {
    align-self:flex-start;margin-bottom:32px;
  }
  .lg-heading h1 {
    font-size:26px;font-weight:800;color:${T.text};
    font-family:'Sora',sans-serif;letter-spacing:-0.5px;line-height:1.2;
    margin-bottom:6px;
  }
  .lg-heading p { font-size:13px;color:${T.textMuted}; }

  /* ── Form ── */
  .lg-form { width:100%; }

  .lg-label {
    display:block;margin-bottom:6px;
    font-size:11px;font-weight:700;color:${T.textMuted};
    text-transform:uppercase;letter-spacing:0.07em;
  }

  .lg-input-wrap { position:relative;margin-bottom:6px; }
  .lg-input-icon {
    position:absolute;left:13px;top:50%;transform:translateY(-50%);
    font-size:15px;color:${T.textMuted};pointer-events:none;
  }
  .lg-input {
    width:100%;padding:11px 13px 11px 40px;border-radius:12px;
    border:1.5px solid #E0D5C5;font-size:14px;
    font-family:'DM Sans',sans-serif;color:${T.text};
    outline:none;background:#fff;
    transition:border-color 0.15s,box-shadow 0.15s;
  }
  .lg-input:focus { border-color:${T.brand};box-shadow:0 0 0 3px ${T.brand}18; }
  .lg-input::placeholder { color:${T.textLight}; }
  .lg-input.error { border-color:${T.error};background:${T.errorBg}; }

  /* Password toggle */
  .lg-eye {
    position:absolute;right:12px;top:50%;transform:translateY(-50%);
    background:none;border:none;cursor:pointer;color:${T.textMuted};
    font-size:16px;padding:2px;transition:color 0.15s;
  }
  .lg-eye:hover { color:${T.brand}; }

  .lg-error { font-size:11px;color:${T.error};margin-bottom:12px;display:flex;align-items:center;gap:4px; }

  /* ── Submit button ── */
  .lg-btn {
    width:100%;padding:13px;border-radius:12px;border:none;
    background:linear-gradient(135deg,${T.brand} 0%,${T.brandMid} 100%);
    color:#fff;font-size:14px;font-weight:700;cursor:pointer;
    font-family:'Sora',sans-serif;
    transition:all 0.2s;box-shadow:0 4px 16px ${T.brand}44;
    display:flex;align-items:center;justify-content:center;gap:8px;
    margin-top:8px;
  }
  .lg-btn:hover:not(:disabled) { transform:translateY(-1px);box-shadow:0 6px 20px ${T.brand}55; }
  .lg-btn:disabled { background:#C4C4C4;box-shadow:none;cursor:not-allowed; }

  /* ── Spinner ── */
  .lg-spinner {
    width:18px;height:18px;border-radius:50%;
    border:2px solid rgba(255,255,255,0.4);border-top-color:#fff;
    animation:lgSpin 0.7s linear infinite;
  }

  /* ── Right panel content ── */
  .lg-right-content {
    position:relative;z-index:2;text-align:center;padding:40px;
    animation:lgFadeUp 0.6s 0.2s cubic-bezier(0.4,0,0.2,1) both;
  }
  .lg-right-img {
    width:320px;max-width:80%;
    animation:lgFloat 4s ease-in-out infinite;
    filter:drop-shadow(0 20px 40px rgba(0,0,0,0.25));
  }
  .lg-right-title {
    font-size:22px;font-weight:800;color:#fff;
    font-family:'Sora',sans-serif;margin-top:28px;letter-spacing:-0.3px;
  }
  .lg-right-sub { font-size:13px;color:rgba(255,255,255,0.65);margin-top:8px;line-height:1.5; }

  /* ── Feature pills ── */
  .lg-pills { display:flex;gap:8px;justify-content:center;margin-top:20px;flex-wrap:wrap; }
  .lg-pill {
    padding:5px 14px;border-radius:20px;font-size:11px;font-weight:600;
    background:rgba(255,255,255,0.15);color:rgba(255,255,255,0.9);
    border:1px solid rgba(255,255,255,0.2);
  }

  ::-webkit-scrollbar{width:5px;}
  ::-webkit-scrollbar-track{background:${T.brandLight};}
  ::-webkit-scrollbar-thumb{background:${T.brandMid};border-radius:10px;}
`;

// ─────────────────────────────────────────────
//  🚀  MAIN COMPONENT
// ─────────────────────────────────────────────
const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  useEffect(() => {
    if (location.state?.sessionExpired) {
      toast.error("Your session has expired after 3 hours. Please sign in again.");
    }
  }, [location]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const header = { "Content-Type": "application/json" };
      const email = data.email?.trim() || "";
      const password = data.password?.trim() || "";

      if (!email || !password) {
        toast.error("Please fill in all fields");
        return;
      }

      const company_code = data.company_code?.trim() || "";

      const res = await ApiService(
        { email, password, company_code },
        0,
        header,
        userlogin.method,
        userlogin.url,
      );
      if (!res.data.error) {
        const p = res.data.data;

        // Save isolated tenant database & company identity
        if (p.db_name) {
          localStorage.setItem("tenant_db", p.db_name);
        }
        if (p.company_code) {
          localStorage.setItem("company_code", p.company_code);
        }
        if (p.company_logo) {
          localStorage.setItem("company_logo", p.company_logo);
        }
        if (p.features) {
          const feats = typeof p.features === "string" ? p.features : JSON.stringify(p.features);
          localStorage.setItem("company_features", feats);
        }
        if (p.token) {
          localStorage.setItem("token", p.token);
        }
        localStorage.setItem("login_time", Date.now().toString());

        let parsedFeats = [];
        try {
          parsedFeats = typeof p.features === "string" ? JSON.parse(p.features) : (p.features || []);
        } catch (e) {
          parsedFeats = [];
        }

        useLocalStorage("userinfo", {
          username: p.username || "",
          profile_picture: p.profile_picture || "",
          fullname: p.fullname || "",
          first_name: p.first_name || "",
          last_name: p.last_name || "",
          user_email: p.email || "",
          token: p.token || "",
          company_logo: p.company_logo || "",
          firm_name: p.firm_name || "",
          db_name: p.db_name || "",
          company_code: p.company_code || "",
          features: parsedFeats,
        });

        toast.success(res.data.message);
        navigate(`/${dashboard.list}`);
      } else {
        toast.error(res.data.message);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <Toaster position="top-right" />

      <main className="lg-root">
        {/* ── Left: Login form ── */}
        <div className="lg-left">
          {/* Company Logo */}
          <div className="lg-logo" style={{ marginBottom: 20 }}>
            <img
              src={
                localStorage.getItem("company_logo") || "/img/tarsha_logo.png"
              }
              alt="Company Logo"
              style={{ maxHeight: 42, maxWidth: 180, objectFit: "contain" }}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/img/tarsha_logo.png";
              }}
            />
          </div>

          {/* Heading */}
          <div className="lg-heading">
            <h1>Hi, Welcome Back! 👋</h1>
            <p>Sign in to your account to continue</p>
          </div>

          {/* Form */}
          <form
            className="lg-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label className="lg-label">Email Address</label>
              <div className="lg-input-wrap">
                <span className="lg-input-icon">✉️</span>
                <input
                  id="email"
                  type="text"
                  placeholder="Enter your email"
                  className={`lg-input${errors.email ? " error" : ""}`}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: mailPattern,
                      message: "Invalid email address",
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="lg-error">⚠ {errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              <label className="lg-label">Password</label>
              <div className="lg-input-wrap">
                <span className="lg-input-icon">🔒</span>
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  className={`lg-input${errors.password ? " error" : ""}`}
                  style={{ paddingRight: 40 }}
                  {...register("password", {
                    required: "Password is required",
                  })}
                />
                <button
                  type="button"
                  className="lg-eye"
                  onClick={() => setShowPass((v) => !v)}
                  tabIndex={-1}
                >
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
              {errors.password && (
                <p className="lg-error">⚠ {errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button type="submit" className="lg-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="lg-spinner" />
                  Signing in…
                </>
              ) : (
                <>Sign In →</>
              )}
            </button>
          </form>

          {/* Footer */}
          <p
            style={{
              marginTop: 28,
              fontSize: 11,
              color: T.textLight,
              textAlign: "center",
            }}
          >
            © {new Date().getFullYear()} Zaid Excel Design. All rights reserved.
          </p>
        </div>

        {/* ── Right: Branding panel ── */}
        <div className="lg-right">
          {/* Decorative circles */}
          {[
            { w: 400, h: 400, top: "-100px", right: "-100px" },
            { w: 300, h: 300, bottom: "-80px", left: "-80px" },
            { w: 200, h: 200, top: "40%", right: "15%" },
          ].map((c, i) => (
            <div
              key={i}
              className="lg-circle"
              style={{
                width: c.w,
                height: c.h,
                top: c.top,
                right: c.right,
                bottom: c.bottom,
                left: c.left,
              }}
            />
          ))}

          <div className="lg-right-content">
            <img
              src={`${FileUrl}/img/contact_img_white.png`}
              alt="Welcome"
              className="lg-right-img"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <p className="lg-right-title">Design. Build. Deliver.</p>
            <p className="lg-right-sub">
              Manage your entire project pipeline —<br />
              approvals, architecture, interior and more.
            </p>
            <div className="lg-pills">
              {[
                "Approvals",
                "Architecture",
                "Interior",
                "Meetings",
                "Tasks",
              ].map((p) => (
                <span key={p} className="lg-pill">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Login;
