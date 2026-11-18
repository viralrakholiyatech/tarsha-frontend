import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { superAdminApi } from "./superAdminApi";

/* ─── Architectural grid background ─────────────────────────── */
const ArchGrid = () => (
  <svg
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <pattern id="grid-sm" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
        <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(123,92,68,0.06)" strokeWidth="0.7"/>
      </pattern>
      <pattern id="grid-lg" x="0" y="0" width="192" height="192" patternUnits="userSpaceOnUse">
        <rect width="192" height="192" fill="url(#grid-sm)"/>
        <path d="M 192 0 L 0 0 0 192" fill="none" stroke="rgba(123,92,68,0.1)" strokeWidth="1"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid-lg)"/>
    <line x1="0" y1="75%" x2="65%" y2="0" stroke="rgba(123,92,68,0.05)" strokeWidth="1.2"/>
    <line x1="15%" y1="100%" x2="95%" y2="0" stroke="rgba(123,92,68,0.04)" strokeWidth="0.8"/>
    <circle cx="78%" cy="68%" r="160" fill="none" stroke="rgba(196,169,125,0.06)" strokeWidth="1"/>
    <circle cx="78%" cy="68%" r="110" fill="none" stroke="rgba(123,92,68,0.05)" strokeWidth="0.7"/>
    <circle cx="78%" cy="68%" r="60"  fill="none" stroke="rgba(196,169,125,0.07)" strokeWidth="0.7"/>
  </svg>
);

/* ─── Constellation canvas ───────────────────────────────────── */
const Constellation = () => {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const dots = Array.from({ length: 24 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.3 + 0.3,
      vx: (Math.random() - 0.5) * 0.14,
      vy: (Math.random() - 0.5) * 0.14,
      a: Math.random() * 0.3 + 0.07,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > canvas.width) d.vx *= -1;
        if (d.y < 0 || d.y > canvas.height) d.vy *= -1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(123,92,68,${d.a})`;
        ctx.fill();
      });
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(123,92,68,${0.055 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <canvas
      ref={ref}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
};

/* ─── Line-style input ───────────────────────────────────────── */
const LineInput = ({ label, type, value, onChange, placeholder, autoFocus }) => {
  const [focused, setFocused] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const isPass = type === "password";

  return (
    <div style={{ marginBottom: "34px" }}>
      <label style={{
        display: "block",
        fontSize: "9.5px",
        fontWeight: "700",
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: focused ? "#7B5C44" : "#B0957C",
        marginBottom: "11px",
        transition: "color 0.2s",
        fontFamily: "Georgia, serif",
      }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={isPass ? (showPwd ? "text" : "password") : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
          required
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            padding: "12px 0",
            paddingRight: isPass ? "32px" : "0",
            background: "transparent",
            border: "none",
            borderBottom: `1.5px solid ${focused ? "#7B5C44" : "#DDD0C0"}`,
            color: "#2C1E14",
            fontSize: "15px",
            fontFamily: "Georgia, serif",
            outline: "none",
            transition: "border-color 0.3s",
            caretColor: "#7B5C44",
            boxSizing: "border-box",
          }}
        />
        {/* Animated gold line */}
        <div style={{
          position: "absolute",
          bottom: 0, left: 0,
          height: "1.5px",
          width: focused ? "100%" : "0%",
          background: "linear-gradient(90deg,#7B5C44,#C4A97D,#9B7E65)",
          transition: "width 0.38s cubic-bezier(0.4,0,0.2,1)",
        }} />
        {isPass && (
          <button type="button" onClick={() => setShowPwd(s => !s)}
            style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#B0957C", padding: "4px" }}>
            {showPwd
              ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
            }
          </button>
        )}
      </div>
    </div>
  );
};

/* ─── Main Login Page ────────────────────────────────────────── */
const SuperAdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("superadmin@tarsha.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [mounted, setMounted]   = useState(false);

  useEffect(() => {
    if (superAdminApi.getToken()) navigate("/super-admin/dashboard");
    setTimeout(() => setMounted(true), 80);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await superAdminApi.login(email, password);
      if (res && !res.error) navigate("/super-admin/dashboard");
      else setError(res.message || "Invalid credentials. Please try again.");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Cannot connect to server. Ensure backend is running on port 7600.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .sal-root { min-height:100vh; display:flex; font-family:'DM Sans',sans-serif; background:#F8F3ED; }

        /* Left brand */
        .sal-left {
          flex:1; position:relative; overflow:hidden;
          display:flex; flex-direction:column; justify-content:space-between;
          padding:60px 68px;
          background:linear-gradient(148deg,#FDF9F5 0%,#F3EAE0 60%,#EAD9C8 100%);
          border-right:1px solid #E0D0BC;
        }
        .sal-left-top { position:relative; z-index:2; }
        .sal-left-bot { position:relative; z-index:2; }

        .sal-eyebrow {
          display:inline-flex; align-items:center; gap:10px;
          font-size:9.5px; font-weight:700; letter-spacing:0.22em;
          text-transform:uppercase; color:#9B7E65; margin-bottom:52px;
        }
        .sal-eyebrow-bar { display:inline-block; width:30px; height:1px; background:#C4A97D; }

        .sal-headline {
          font-family:'Cormorant Garamond',Georgia,serif;
          font-size:clamp(38px,4vw,58px); font-weight:300;
          line-height:1.1; color:#2C1E14; letter-spacing:-0.5px;
          margin-bottom:26px;
        }
        .sal-headline em { font-style:italic; color:#7B5C44; }

        .sal-desc {
          font-size:13.5px; font-weight:300; color:#8A6E5A;
          line-height:1.8; max-width:400px;
        }

        .sal-stats {
          display:flex; border-top:1px solid #D9C9B4; padding-top:44px; gap:0;
        }
        .sal-stat { flex:1; padding-right:36px; }
        .sal-stat + .sal-stat { padding-left:36px; border-left:1px solid #D9C9B4; }
        .sal-stat-n {
          font-family:'Cormorant Garamond',Georgia,serif;
          font-size:42px; font-weight:400; color:#7B5C44;
          line-height:1; letter-spacing:-1px;
        }
        .sal-stat-l {
          font-size:9.5px; font-weight:600; letter-spacing:0.12em;
          text-transform:uppercase; color:#B0957C; margin-top:8px;
        }

        /* Right form */
        .sal-right {
          width:520px; min-width:380px;
          display:flex; flex-direction:column; justify-content:center;
          padding:80px 68px; background:#FFFFFF; position:relative; overflow:hidden;
        }
        .sal-right::before {
          content:''; position:absolute; top:-220px; right:-220px;
          width:560px; height:560px; border-radius:50%;
          background:radial-gradient(circle,rgba(196,169,125,0.06) 0%,transparent 70%);
          pointer-events:none;
        }
        .sal-right::after {
          content:''; position:absolute; bottom:-120px; left:-80px;
          width:320px; height:320px; border-radius:50%;
          background:radial-gradient(circle,rgba(123,92,68,0.04) 0%,transparent 70%);
          pointer-events:none;
        }

        /* Logo */
        .sal-logo { margin-bottom:60px; position:relative; z-index:2; }
        .sal-logo img { max-width:220px; height:auto; }

        /* Secure badge */
        .sal-badge {
          display:inline-flex; align-items:center; gap:8px;
          font-size:9.5px; font-weight:700; letter-spacing:0.16em;
          text-transform:uppercase; color:#A8927C; margin-bottom:22px;
          position:relative; z-index:2;
        }
        .sal-badge-dot {
          width:7px; height:7px; border-radius:50%; background:#7B5C44;
          animation:bdotPulse 2.5s ease-in-out infinite;
          box-shadow:0 0 0 0 rgba(123,92,68,0.4);
        }
        @keyframes bdotPulse {
          0%  { box-shadow:0 0 0 0 rgba(123,92,68,0.4); }
          70% { box-shadow:0 0 0 7px rgba(123,92,68,0); }
          100%{ box-shadow:0 0 0 0 rgba(123,92,68,0); }
        }

        /* Title */
        .sal-title {
          font-family:'Cormorant Garamond',Georgia,serif;
          font-size:32px; font-weight:400; color:#2C1E14;
          letter-spacing:-0.3px; margin-bottom:5px;
          position:relative; z-index:2;
        }
        .sal-sub {
          font-size:13px; font-weight:400; color:#A8927C;
          margin-bottom:48px; position:relative; z-index:2;
        }

        /* Error */
        .sal-err {
          padding:13px 18px; background:#FDF4F3;
          border-left:3px solid #B96E6C; border-radius:0 4px 4px 0;
          font-size:13px; color:#813A38; margin-bottom:24px;
          position:relative; z-index:2; line-height:1.5;
        }

        /* Form */
        .sal-form { position:relative; z-index:2; }

        /* Submit button */
        .sal-btn {
          width:100%; padding:17px 24px; margin-top:6px;
          border:none; border-radius:0;
          background:#7B5C44; color:#FDF9F5;
          font-family:'DM Sans',sans-serif;
          font-size:10.5px; font-weight:700; letter-spacing:0.22em;
          text-transform:uppercase; cursor:pointer;
          position:relative; overflow:hidden; transition:background 0.3s;
        }
        .sal-btn::before {
          content:''; position:absolute; inset:0;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent);
          transform:translateX(-100%);
          transition:transform 0.65s cubic-bezier(0.4,0,0.2,1);
        }
        .sal-btn:hover:not(:disabled)::before { transform:translateX(100%); }
        .sal-btn:hover:not(:disabled) { background:#6A4E3A; }
        .sal-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .sal-btn-inner { display:flex; align-items:center; justify-content:center; gap:10px; }

        .sal-dot {
          display:inline-block; width:4px; height:4px;
          border-radius:50%; background:#FDF9F5;
          animation:sdot 1.2s ease-in-out infinite;
        }
        .sal-dot:nth-child(2){animation-delay:0.18s}
        .sal-dot:nth-child(3){animation-delay:0.36s}
        @keyframes sdot {
          0%,80%,100%{transform:scale(0.5);opacity:0.35}
          40%{transform:scale(1);opacity:1}
        }

        /* Footer note */
        .sal-foot {
          margin-top:44px; padding-top:26px;
          border-top:1px solid #F0E8DF;
          font-size:10.5px; color:#C4A97D;
          text-align:center; letter-spacing:0.07em;
          position:relative; z-index:2;
        }

        /* Entrance */
        .sal-in { opacity:0; transform:translateY(16px); transition:opacity 0.6s ease,transform 0.6s ease; }
        .sal-in.show { opacity:1; transform:translateY(0); }

        @media(max-width:820px){
          .sal-left { display:none; }
          .sal-right { width:100%; min-width:unset; padding:48px 32px; }
        }
      `}</style>

      <div className="sal-root">
        {/* ── Left ── */}
        <div className="sal-left">
          <ArchGrid />
          <Constellation />

          <div className="sal-left-top">
            <div className="sal-eyebrow">
              <span className="sal-eyebrow-bar" />
              Master Control Center
            </div>
            <h1 className="sal-headline">
              Built to manage<br />
              <em>every workspace</em><br />
              from one place.
            </h1>
            <p className="sal-desc">
              Provision tenant databases, control subscription access,
              assign feature modules and monitor all clients —
              all from your private master console.
            </p>
          </div>

          <div className="sal-left-bot">
            <div className="sal-stats">
              <div className="sal-stat">
                <div className="sal-stat-n">195</div>
                <div className="sal-stat-l">Tables provisioned</div>
              </div>
              <div className="sal-stat">
                <div className="sal-stat-n">2s</div>
                <div className="sal-stat-l">DB creation time</div>
              </div>
              <div className="sal-stat">
                <div className="sal-stat-n">∞</div>
                <div className="sal-stat-l">Tenant companies</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right ── */}
        <div className="sal-right">
          {/* Real Tarsha logo */}
          <div className={`sal-logo sal-in ${mounted ? "show" : ""}`} style={{ transitionDelay: "0.04s" }}>
            <img src="/img/tarsha_logo.png" alt="Tarsha Tech" />
          </div>

          <div className={`sal-badge sal-in ${mounted ? "show" : ""}`} style={{ transitionDelay: "0.14s" }}>
            <span className="sal-badge-dot" />
            Super Admin — Secure Access
          </div>

          <div className={`sal-in ${mounted ? "show" : ""}`} style={{ transitionDelay: "0.2s" }}>
            <h2 className="sal-title">Sign in</h2>
            <p className="sal-sub">Access your master control panel</p>
          </div>

          {error && <div className="sal-err">{error}</div>}

          <form className="sal-form" onSubmit={handleSubmit}>
            <div className={`sal-in ${mounted ? "show" : ""}`} style={{ transitionDelay: "0.28s" }}>
              <LineInput label="Email Address" type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="superadmin@tarsha.com" autoFocus />
            </div>
            <div className={`sal-in ${mounted ? "show" : ""}`} style={{ transitionDelay: "0.36s" }}>
              <LineInput label="Password" type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password" />
            </div>
            <div className={`sal-in ${mounted ? "show" : ""}`} style={{ transitionDelay: "0.44s" }}>
              <button type="submit" disabled={loading} className="sal-btn">
                <span className="sal-btn-inner">
                  {loading
                    ? <><span className="sal-dot"/><span className="sal-dot"/><span className="sal-dot"/></>
                    : "Sign In to Console"
                  }
                </span>
              </button>
            </div>
          </form>

          <div className={`sal-foot sal-in ${mounted ? "show" : ""}`} style={{ transitionDelay: "0.52s" }}>
            Tarsha Tech · Master DB:&nbsp;
            <span style={{ fontWeight: 600, color: "#9B7E65" }}>master_admin</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default SuperAdminLogin;
