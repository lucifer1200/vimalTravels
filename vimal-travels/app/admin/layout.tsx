"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, FileText,
  LogOut, PanelLeftClose, PanelLeftOpen, Eye, EyeOff,
  ShieldCheck, Shield, User, Lock, BarChart3, Zap, Globe,
} from "lucide-react";
import { seedUsers, attemptLogin, getSession, clearSession, type Session } from "@/lib/auth";

const NAV = [
  { href: "/admin/billing",           icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/billing/customers", icon: Users,           label: "Customers" },
  { href: "/admin/billing/invoices",  icon: FileText,        label: "Invoices"  },
];

const IF = { fontFamily: "Inter,system-ui,sans-serif" };

/* ── HERO IMAGE (cinematic travel) ── */
const HERO = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&auto=format&fit=crop&q=80";

/* ── Feature items ── */
const FEATURES = [
  { num: "01", icon: Shield,     title: "Secure Access",       desc: "Role-based authentication" },
  { num: "02", icon: BarChart3,  title: "Real-Time Insights",  desc: "Data that drives decisions" },
  { num: "03", icon: Globe,      title: "Seamless Control",    desc: "Powerful travel operations" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [session,   setSession]   = useState<Session | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [username,  setUsername]  = useState("");
  const [password,  setPassword]  = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [err,       setErr]       = useState("");
  const [signing,   setSigning]   = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    seedUsers().then(() => {
      setSession(getSession());
      setLoading(false);
    });
  }, []);

  const login = async () => {
    if (!username || !password) return;
    setSigning(true);
    setErr("");
    const s = await attemptLogin(username, password);
    if (s) { setSession(s); } else { setErr("Invalid username or password"); }
    setSigning(false);
  };

  const logout = () => {
    clearSession();
    setSession(null);
    setUsername("");
    setPassword("");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#050B18" }}>
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  /* ════════════════════════════════════════════════════════════
     LOGIN SCREEN
  ════════════════════════════════════════════════════════════ */
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row overflow-hidden" style={{ background: "#050B18", fontFamily: "Inter,system-ui,sans-serif" }}>

        {/* ══ LEFT — TRAVEL HERO (55%) ══ */}
        <div className="relative md:w-[55%] h-64 md:h-screen flex-shrink-0 overflow-hidden">
          {/* Cinematic photo — slightly more visible */}
          <img src={HERO} alt="" className="absolute inset-0 w-full h-full object-cover object-center" style={{ filter: "brightness(0.72) saturate(1.1)" }} />

          {/* Dark gradient overlay — heavier on left for text, lighter center-right */}
          <div className="absolute inset-0" style={{
            background: "linear-gradient(110deg, rgba(5,11,24,0.88) 0%, rgba(8,18,37,0.65) 45%, rgba(5,11,24,0.30) 100%)",
          }} />

          {/* Subtle blue glow */}
          <div className="absolute" style={{ bottom: "20%", left: "10%", width: 360, height: 360, background: "radial-gradient(circle, rgba(37,99,235,0.14) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />

          {/* Noise grain overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
            backgroundSize: "200px 200px",
          }} />

          {/* Content — hidden on mobile (except logo) */}
          <div className="relative z-10 h-full flex flex-col p-8 md:p-12">

            {/* Logo top-left */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
                <img src="/vimal-logo.jpeg" alt="Vimal Travels" className="w-7 h-7 object-contain"
                  onError={(e) => {
                    const el = e.target as HTMLImageElement; el.style.display = "none";
                    const b = el.parentElement!; b.style.background = "linear-gradient(135deg,#2563eb,#6366f1)";
                    const s = document.createElement("span"); s.textContent = "VT";
                    s.style.cssText = "font-weight:800;font-size:12px;color:white;"; b.appendChild(s);
                  }} />
              </div>
              <span className="text-white font-bold text-sm tracking-wide hidden md:block">VIMAL TRAVELS</span>
            </motion.div>

            {/* Hero text — desktop only */}
            <div className="hidden md:flex flex-col flex-1 justify-center">
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center gap-2 mb-5">
                  <div style={{ width: 20, height: 1.5, background: "linear-gradient(90deg,#3B82F6,#6366F1)" }} />
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: "#60A5FA" }}>Admin Command Center</p>
                </div>
                <h1 className="font-bold leading-[1.05] mb-5" style={{ fontSize: 52, color: "#F8FAFC", letterSpacing: "-2px" }}>
                  Manage.<br />
                  Monitor.<br />
                  <span style={{ background: "linear-gradient(92deg, #60A5FA 0%, #818CF8 45%, #A78BFA 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    Elevate Travel.
                  </span>
                </h1>
                <div className="mb-6" style={{ width: 40, height: 1.5, background: "linear-gradient(90deg,#3B82F6,#8B5CF6)", borderRadius: 2 }} />
                <p className="text-[15px] leading-[1.7] max-w-xs" style={{ color: "#7B93B8" }}>
                  Your command center for bookings, customers, and travel operations.
                </p>
              </motion.div>
            </div>

            {/* Feature bar — desktop only */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="hidden md:flex items-stretch gap-0 rounded-2xl overflow-hidden"
              style={{ background: "rgba(8,18,40,0.45)", border: "1px solid rgba(255,255,255,0.09)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
            >
              {FEATURES.map((f, i) => (
                <div key={f.num} className="flex-1 px-4 py-3.5 flex items-center gap-3 transition-all cursor-default"
                  style={{ borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.08)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.15) 100%)", border: "1px solid rgba(129,140,248,0.2)" }}>
                    <f.icon className="w-3.5 h-3.5" style={{ color: "#A5B4FC" }} />
                  </div>
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.18em] mb-0.5" style={{ color: "#3B5278" }}>{f.num}</div>
                    <div className="text-[11px] font-bold leading-tight" style={{ color: "#CBD5E1" }}>{f.title}</div>
                    <div className="text-[9.5px] mt-0.5" style={{ color: "#4A6080" }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* ══ RIGHT — LOGIN PANEL (45%) ══ */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-10 relative"
          style={{ background: "linear-gradient(160deg, #081225 0%, #050B18 100%)" }}>

          {/* Subtle dot pattern */}
          <div className="absolute inset-0 opacity-[0.025]" style={{
            backgroundImage: "radial-gradient(circle, #60A5FA 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }} />

          {/* Top purple glow */}
          <div className="absolute top-0 right-0 w-80 h-80 opacity-20" style={{
            background: "radial-gradient(circle, #6366F1 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none",
          }} />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full"
            style={{ maxWidth: 480 }}
          >
            {/* ── LOGIN CARD ── */}
            <div className="rounded-3xl px-9 pt-7 pb-6" style={{
              background: "rgba(15,28,56,0.82)",
              border: "1px solid rgba(100,120,200,0.18)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              boxShadow: "0 0 0 1px rgba(99,130,255,0.07), 0 24px 64px rgba(0,0,0,0.50), 0 0 80px rgba(37,99,235,0.09)",
            }}>

              {/* Logo + heading — compact group */}
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center mb-6"
              >
                <div className="relative w-14 h-14 mb-4">
                  <div className="absolute inset-0 rounded-2xl" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)", filter: "blur(10px)", transform: "scale(1.4)" }} />
                  <div className="w-full h-full rounded-2xl flex items-center justify-center overflow-hidden relative"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1.5px solid rgba(99,130,255,0.22)" }}>
                    <img src="/vimal-logo.jpeg" alt="Vimal Travels" className="w-10 h-10 object-contain"
                      onError={(e) => {
                        const el = e.target as HTMLImageElement; el.style.display = "none";
                        const b = el.parentElement!; b.style.background = "linear-gradient(135deg,#2563eb,#6366f1)";
                        const s = document.createElement("span"); s.textContent = "VT";
                        s.style.cssText = "font-weight:800;font-size:16px;color:white;"; b.appendChild(s);
                      }} />
                  </div>
                </div>
                <h2 className="font-bold text-[22px] mb-1" style={{ color: "#F8FAFC", letterSpacing: "-0.5px" }}>Welcome Back!</h2>
                <p className="text-[13px]" style={{ color: "#64748B" }}>Sign in to Vimal Travels Admin Portal</p>
              </motion.div>

              {/* Error */}
              <AnimatePresence>
                {err && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="rounded-xl px-4 py-3 text-sm text-center"
                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#FCA5A5" }}
                  >
                    {err}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Username */}
              <div className="mb-3">
                <label className="block mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: "#64748B" }}>Username</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px]" style={{ color: "#64748B" }} id="user-icon" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => { setUsername(e.target.value); setErr(""); }}
                    onKeyDown={e => e.key === "Enter" && login()}
                    placeholder="Enter your username"
                    autoComplete="username"
                    className="w-full rounded-xl pl-10 pr-4 py-3 text-[13.5px] transition-all focus:outline-none"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "#E2E8F0" }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = "rgba(99,102,241,0.55)";
                      e.currentTarget.style.background = "rgba(99,102,241,0.06)";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.10)";
                      const ic = document.getElementById("user-icon"); if (ic) ic.style.color = "#818CF8";
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                      e.currentTarget.style.boxShadow = "none";
                      const ic = document.getElementById("user-icon"); if (ic) ic.style.color = "#64748B";
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-3">
                <label className="block mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: "#64748B" }}>Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px]" style={{ color: "#64748B" }} id="lock-icon" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setErr(""); }}
                    onKeyDown={e => e.key === "Enter" && login()}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full rounded-xl pl-10 pr-11 py-3 text-[13.5px] transition-all focus:outline-none"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "#E2E8F0" }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = "rgba(99,102,241,0.55)";
                      e.currentTarget.style.background = "rgba(99,102,241,0.06)";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.10)";
                      const ic = document.getElementById("lock-icon"); if (ic) ic.style.color = "#818CF8";
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                      e.currentTarget.style.boxShadow = "none";
                      const ic = document.getElementById("lock-icon"); if (ic) ic.style.color = "#64748B";
                    }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: "#64748B" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#818CF8"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#64748B"}>
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me + Forgot password */}
              <div className="flex items-center justify-between mb-5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded accent-indigo-500 cursor-pointer"
                    style={{ accentColor: "#6366F1", borderColor: "rgba(148,163,184,0.4)" }} />
                  <span className="text-[12px]" style={{ color: "#94A3B8" }}>Remember me</span>
                </label>
                <button type="button" className="text-[12px] font-medium transition-colors"
                  style={{ color: "#818CF8" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#A5B4FC"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#818CF8"}>
                  Forgot password?
                </button>
              </div>

              {/* Sign In button — always vibrant */}
              <motion.button
                onClick={login}
                disabled={signing}
                whileHover={{ y: -2, boxShadow: "0 12px 36px rgba(99,102,241,0.50)" }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className="w-full flex items-center justify-center gap-2.5 font-bold text-white rounded-xl py-3.5 text-[14px] mb-4"
                style={{
                  background: "linear-gradient(135deg, #2563EB 0%, #6366F1 55%, #8B5CF6 100%)",
                  boxShadow: "0 4px 22px rgba(99,102,241,0.38), 0 1px 0 rgba(255,255,255,0.12) inset",
                  letterSpacing: "0.01em",
                }}
              >
                {signing ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Signing in…</span></>
                ) : (
                  <>
                    <span>Sign In</span>
                    <motion.span
                      animate={{ x: [0, 3, 0] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                      style={{ display: "inline-block" }}
                    >→</motion.span>
                  </>
                )}
              </motion.button>

              {/* Divider + SSO */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.10)" }} />
                <span className="text-[11px] font-semibold" style={{ color: "#475569" }}>or</span>
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.10)" }} />
              </div>

              <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold transition-all"
                style={{ background: "rgba(30,45,75,0.55)", border: "1px solid rgba(100,120,170,0.30)", color: "#CBD5E1" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(30,45,75,0.75)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(100,120,200,0.45)"; (e.currentTarget as HTMLElement).style.color = "#E2E8F0"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(30,45,75,0.55)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(100,120,170,0.30)"; (e.currentTarget as HTMLElement).style.color = "#CBD5E1"; }}>
                <ShieldCheck className="w-3.5 h-3.5" style={{ color: "#94A3B8" }} />
                Sign in with SSO
              </button>

              {/* Security badge */}
              <div className="flex items-center justify-center gap-1.5 mt-4">
                <ShieldCheck className="w-3 h-3" style={{ color: "#64748B" }} />
                <span className="text-[12px]" style={{ color: "#64748B" }}>Secured with SHA-256 encryption</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const isSuperAdmin = session.role === "super_admin";

  /* ════════════════════════════════════════════════════════════
     AUTHENTICATED LAYOUT
  ════════════════════════════════════════════════════════════ */
  return (
    <div
      className="admin-root flex h-screen overflow-hidden print:block print:h-auto print:overflow-visible"
      style={{
        ...IF,
        padding: "12px",
        gap: "12px",
        background: [
          "radial-gradient(ellipse 65% 55% at 8% 0%, rgba(59,130,246,0.06) 0%, transparent 65%)",
          "radial-gradient(ellipse 55% 65% at 92% 0%, rgba(99,102,241,0.045) 0%, transparent 60%)",
          "radial-gradient(ellipse 45% 55% at 85% 100%, rgba(139,92,246,0.035) 0%, transparent 55%)",
          "#F6F8FC",
        ].join(", "),
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: ".admin-root h1,.admin-root h2,.admin-root h3,.admin-root h4{font-family:Inter,system-ui,sans-serif}" }} />

      {/* ── SIDEBAR ── */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 224 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-col shrink-0 print:hidden overflow-hidden relative"
        style={{
          borderRadius: "24px",
          background: "rgba(255,255,255,0.76)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.65)",
          boxShadow: "0 8px 30px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.03)",
          minHeight: 0,
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 relative z-10">
          <div className="shrink-0 flex items-center justify-center" style={{ width: 32, height: 32 }}>
            <img src="/vimal-logo.jpeg" alt="Vimal Travels"
              style={{ height: 32, width: "auto", maxWidth: 32, objectFit: "contain" }}
              onError={(e) => {
                const el = e.target as HTMLImageElement; el.style.display = "none";
                const box = el.parentElement!;
                box.style.cssText = "width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#2563eb,#6366f1);display:flex;align-items:center;justify-content:center;flex-shrink:0";
                const s = document.createElement("span"); s.textContent = "VT";
                s.style.cssText = "font-weight:700;font-size:11px;color:white;"; box.appendChild(s);
              }} />
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.18 }} className="min-w-0 overflow-hidden">
                <div className="font-bold text-sm leading-none truncate" style={{ color: "#0F172A" }}>Vimal Travels</div>
                <div className="text-[10px] mt-0.5 tracking-wide truncate font-medium" style={{ color: "#94A3B8" }}>Admin Portal</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mx-4 mb-3" style={{ height: 1, background: "rgba(15,23,42,0.07)" }} />

        {/* Role badge */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="mx-4 mb-3 flex items-center gap-2 rounded-xl px-3 py-2"
              style={{
                background: isSuperAdmin ? "linear-gradient(135deg,rgba(37,99,235,0.08),rgba(99,102,241,0.08))" : "rgba(15,23,42,0.04)",
                border: isSuperAdmin ? "1px solid rgba(37,99,235,0.15)" : "1px solid rgba(15,23,42,0.07)",
              }}>
              {isSuperAdmin
                ? <ShieldCheck className="w-3.5 h-3.5 shrink-0" style={{ color: "#2563EB" }} />
                : <Shield className="w-3.5 h-3.5 shrink-0" style={{ color: "#64748B" }} />}
              <div className="min-w-0">
                <div className="text-[10px] font-bold truncate" style={{ color: isSuperAdmin ? "#2563EB" : "#475569" }}>{session.displayName}</div>
                <div className="text-[9px] truncate" style={{ color: "#94A3B8" }}>{isSuperAdmin ? "Full Access" : "Limited Access"}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!collapsed && (
          <div className="px-4 mb-2">
            <span className="text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: "#CBD5E1" }}>Navigation</span>
          </div>
        )}

        <nav className="flex-1 px-2.5 space-y-0.5 overflow-y-auto pb-4 relative z-10">
          {NAV.map((item) => {
            const isActive = item.href === "/admin/billing"
              ? pathname === "/admin/billing" || pathname === "/admin"
              : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined}
                className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-all relative"
                style={{ background: isActive ? "#DBEAFE" : "transparent", color: isActive ? "#2563EB" : "#64748B" }}
                onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = "rgba(37,99,235,0.07)"; (e.currentTarget as HTMLElement).style.color = "#2563EB"; } }}
                onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#64748B"; } }}>
                {isActive && <motion.div layoutId="activeBar" className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full" style={{ background: "#2563EB" }} transition={{ duration: 0.2 }} />}
                <item.icon className="w-4 h-4 shrink-0" style={{ color: isActive ? "#2563EB" : "#94A3B8" }} />
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }} transition={{ duration: 0.15 }} className="truncate">
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        <div className="relative z-10">
          <div className="mx-4 mb-3" style={{ height: 1, background: "rgba(15,23,42,0.07)" }} />
          <div className="px-2.5 pb-4 space-y-0.5">
            <button onClick={() => setCollapsed(!collapsed)} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="flex items-center gap-3 px-2.5 py-2 rounded-xl w-full transition-all text-sm" style={{ color: "#94A3B8" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(15,23,42,0.05)"; (e.currentTarget as HTMLElement).style.color = "#64748B"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#94A3B8"; }}>
              {collapsed ? <PanelLeftOpen className="w-4 h-4 shrink-0" /> : <PanelLeftClose className="w-4 h-4 shrink-0" />}
              <AnimatePresence initial={false}>
                {!collapsed && (<motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="text-xs font-medium">Collapse</motion.span>)}
              </AnimatePresence>
            </button>
            <button onClick={logout}
              className="flex items-center gap-3 px-2.5 py-2 rounded-xl w-full transition-all text-sm" style={{ color: "#94A3B8" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)"; (e.currentTarget as HTMLElement).style.color = "#DC2626"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#94A3B8"; }}>
              <LogOut className="w-4 h-4 shrink-0" />
              <AnimatePresence initial={false}>
                {!collapsed && (<motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="text-xs font-medium">Sign Out</motion.span>)}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.aside>

      <main className="flex-1 overflow-auto print:block" style={{ minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
