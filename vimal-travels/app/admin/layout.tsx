"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, FileText, BarChart2, Trash2,
  LogOut, PanelLeftClose, PanelLeftOpen, Eye, EyeOff,
  ShieldCheck, Shield, User, Lock, BarChart3, Globe, Moon, Sun,
} from "lucide-react";
import { seedUsers, attemptLogin, getSession, clearSession, type Session } from "@/lib/auth";

const NAV = [
  { href: "/admin/billing",           icon: LayoutDashboard, label: "Dashboard", superOnly: false },
  { href: "/admin/billing/customers", icon: Users,           label: "Customers", superOnly: false },
  { href: "/admin/billing/invoices",  icon: FileText,        label: "Invoices",  superOnly: false },
  { href: "/admin/billing/reports",   icon: BarChart2,       label: "Reports",   superOnly: true  },
  { href: "/admin/billing/trash",     icon: Trash2,          label: "Trash",     superOnly: false },
];

const HERO = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&auto=format&fit=crop&q=80";

const FEATURES = [
  { icon: Shield,    title: "Secure Access",      desc: "Role-based authentication" },
  { icon: BarChart3, title: "Real-Time Insights", desc: "Data that drives decisions" },
  { icon: Globe,     title: "Seamless Control",   desc: "Powerful travel operations" },
];

/* M3 font */
const FONT = "var(--font-roboto), Roboto, system-ui, sans-serif";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [session,   setSession]   = useState<Session | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [username,  setUsername]  = useState("");
  const [password,  setPassword]  = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [err,       setErr]       = useState("");
  const [signing,   setSigning]   = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [dark,      setDark]      = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    seedUsers().then(() => {
      setSession(getSession());
      setLoading(false);
    });
    const saved = localStorage.getItem("vt_dark");
    if (saved === "1") setDark(true);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("vt_dark", next ? "1" : "0");
    window.dispatchEvent(new CustomEvent("vt-theme", { detail: { dark: next } }));
  };

  const login = async () => {
    if (!username || !password) return;
    setSigning(true); setErr("");
    const s = await attemptLogin(username, password);
    if (s) { setSession(s); } else { setErr("Invalid username or password"); }
    setSigning(false);
  };

  const logout = () => {
    clearSession(); setSession(null); setUsername(""); setPassword("");
    router.push("/admin");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#141218" }}>
      <div className="w-8 h-8 rounded-full animate-spin" style={{ border: "2.5px solid #0077B6", borderTopColor: "transparent" }} />
    </div>
  );

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     LOGIN SCREEN
  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  if (!session) {
    return (
      <div className="min-h-screen flex overflow-hidden" style={{ fontFamily: FONT, background:"#020817" }}>

        {/* â•â• LEFT — TRAVEL HERO â•â• */}
        <div className="relative hidden md:flex md:w-[52%] flex-col overflow-hidden" style={{ minHeight:"100vh" }}>
          <img src={HERO} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ filter:"brightness(0.48) saturate(1.25)" }} />
          <div className="absolute inset-0" style={{ background:"linear-gradient(135deg,rgba(2,8,23,0.94) 0%,rgba(0,55,100,0.42) 55%,rgba(2,8,23,0.08) 100%)" }} />
          <div className="absolute inset-0" style={{ background:"linear-gradient(to right,rgba(2,8,23,0) 62%,rgba(2,8,23,1) 100%)" }} />
          <div className="absolute" style={{ top:"25%",left:"4%",width:560,height:560,background:"radial-gradient(circle,rgba(0,119,182,0.20) 0%,transparent 65%)",filter:"blur(90px)" }} />
          <div className="absolute" style={{ bottom:"10%",right:"4%",width:260,height:260,background:"radial-gradient(circle,rgba(72,202,228,0.12) 0%,transparent 70%)",filter:"blur(55px)" }} />

          <div className="relative z-10 flex flex-col h-full p-10 xl:p-14">
            <motion.div initial={{ opacity:0,x:-16 }} animate={{ opacity:1,x:0 }} transition={{ duration:0.6,ease:[0.22,1,0.36,1] }} className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                style={{ background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.14)",backdropFilter:"blur(12px)" }}>
                <img src="/vimal-logo.jpeg" alt="" className="w-8 h-8 object-contain"
                  onError={(e) => { const el=e.target as HTMLImageElement; el.style.display="none"; const b=el.parentElement!; b.style.background="linear-gradient(135deg,#0077B6,#0096C7)"; const s=document.createElement("span"); s.textContent="VT"; s.style.cssText="font-weight:800;font-size:12px;color:white;"; b.appendChild(s); }} />
              </div>
              <div>
                <div className="font-black text-white tracking-[0.08em]" style={{ fontSize:13 }}>VIMAL TRAVELS</div>
                <div className="font-semibold tracking-[0.22em] uppercase" style={{ fontSize:9,color:"#48CAE4" }}>Admin Portal</div>
              </div>
            </motion.div>

            <div className="flex-1 flex flex-col justify-center">
              <motion.div initial={{ opacity:0,y:40 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.75,delay:0.12,ease:[0.22,1,0.36,1] }}>
                <div className="flex items-center gap-3 mb-7">
                  <div style={{ width:28,height:2,borderRadius:2,background:"linear-gradient(90deg,#48CAE4,#0096C7)" }} />
                  <span className="font-bold uppercase tracking-[0.32em]" style={{ fontSize:10,color:"#48CAE4" }}>Command Center</span>
                </div>
                <h1 style={{ fontSize:56,fontWeight:900,color:"#F0F9FF",lineHeight:1.02,letterSpacing:"-2.5px",marginBottom:22 }}>
                  Manage.<br />Monitor.<br />
                  <span style={{ background:"linear-gradient(90deg,#48CAE4,#90E0EF,#ADE8F4)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>
                    Elevate.
                  </span>
                </h1>
                <p style={{ color:"#5A90BC",fontSize:15,lineHeight:1.75,maxWidth:320 }}>
                  Your unified platform for invoices, customers, GST, and travel operations.
                </p>
              </motion.div>
            </div>

            <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.6,delay:0.38,ease:[0.22,1,0.36,1] }}
              className="flex gap-0 rounded-2xl overflow-hidden"
              style={{ background:"rgba(0,8,30,0.52)",border:"1px solid rgba(255,255,255,0.08)",backdropFilter:"blur(24px)" }}>
              {FEATURES.map((f,i) => (
                <div key={f.title} className="flex-1 flex items-center gap-2.5 px-4 py-4"
                  style={{ borderRight:i<2?"1px solid rgba(255,255,255,0.06)":"none" }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background:"linear-gradient(135deg,rgba(0,119,182,0.30),rgba(0,150,199,0.18))",border:"1px solid rgba(72,202,228,0.18)" }}>
                    <f.icon className="w-3.5 h-3.5" style={{ color:"#90E0EF" }} />
                  </div>
                  <div>
                    <div className="font-bold leading-tight" style={{ fontSize:11,color:"#CBD5E1" }}>{f.title}</div>
                    <div className="font-medium mt-0.5" style={{ fontSize:9,color:"#3D5A7A" }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* â•â• RIGHT — LOGIN PANEL â•â• */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-10 relative" style={{ background:"#020817" }}>
          <div className="absolute inset-0 opacity-[0.022]" style={{ backgroundImage:"radial-gradient(circle,#48CAE4 1px,transparent 1px)",backgroundSize:"30px 30px" }} />
          <div className="absolute top-0 right-0 w-96 h-96 opacity-15" style={{ background:"radial-gradient(circle,#0077B6 0%,transparent 70%)",filter:"blur(90px)" }} />
          <div className="absolute bottom-0 left-0 w-64 h-64 opacity-10" style={{ background:"radial-gradient(circle,#0096C7 0%,transparent 70%)",filter:"blur(70px)" }} />

          <motion.div initial={{ opacity:0,y:24 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.6,delay:0.1,ease:[0.22,1,0.36,1] }}
            className="relative z-10 w-full" style={{ maxWidth:440 }}>

            <div className="rounded-3xl px-8 pt-7 pb-7 overflow-hidden" style={{
              background:"rgba(8,14,30,0.92)",
              border:"1px solid rgba(0,150,199,0.22)",
              backdropFilter:"blur(32px)",WebkitBackdropFilter:"blur(32px)",
              boxShadow:"0 0 0 1px rgba(0,119,182,0.08),0 28px 72px rgba(0,0,0,0.70),0 0 80px rgba(0,119,182,0.10)",
              position:"relative",
            }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"linear-gradient(90deg,#005F92,#0096C7,#48CAE4)" }} />

              <motion.div initial={{ scale:0.9,opacity:0 }} animate={{ scale:1,opacity:1 }} transition={{ duration:0.5,delay:0.2,ease:[0.22,1,0.36,1] }}
                className="flex flex-col items-center mb-7">
                <div className="relative w-16 h-16 mb-5">
                  <div className="absolute inset-0 rounded-2xl" style={{ background:"radial-gradient(circle,rgba(0,150,199,0.4) 0%,transparent 70%)",filter:"blur(12px)",transform:"scale(1.5)" }} />
                  <div className="w-full h-full rounded-2xl flex items-center justify-center overflow-hidden relative"
                    style={{ background:"rgba(255,255,255,0.06)",border:"1.5px solid rgba(0,150,199,0.28)" }}>
                    <img src="/vimal-logo.jpeg" alt="Vimal Travels" className="w-11 h-11 object-contain"
                      onError={(e) => { const el=e.target as HTMLImageElement; el.style.display="none"; const b=el.parentElement!; b.style.background="linear-gradient(135deg,#0077B6,#0096C7)"; const s=document.createElement("span"); s.textContent="VT"; s.style.cssText="font-weight:800;font-size:18px;color:white;"; b.appendChild(s); }} />
                  </div>
                </div>
                <h2 className="font-bold mb-1.5" style={{ fontSize:24,color:"#F0F9FF",letterSpacing:"-0.6px" }}>Welcome back</h2>
                <p style={{ fontSize:13,color:"#4A6A8A" }}>Sign in to your admin portal</p>
              </motion.div>

              <AnimatePresence>
                {err && (
                  <motion.div initial={{ opacity:0,height:0,marginBottom:0 }} animate={{ opacity:1,height:"auto",marginBottom:20 }} exit={{ opacity:0,height:0,marginBottom:0 }}
                    className="rounded-2xl px-4 py-3 text-sm text-center"
                    style={{ background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.18)",color:"#FCA5A5" }}>
                    {err}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mb-4">
                <label className="block mb-2 font-bold uppercase tracking-[0.14em]" style={{ fontSize:10,color:"#4A6A8A" }}>Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:"#4A6A8A" }} />
                  <input type="text" value={username} onChange={e => { setUsername(e.target.value); setErr(""); }} onKeyDown={e => e.key==="Enter" && login()}
                    placeholder="Enter your username" autoComplete="username"
                    className="w-full rounded-2xl pl-11 pr-4 py-3.5 transition-all focus:outline-none"
                    style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(0,150,199,0.18)",color:"#E2E8F0",fontSize:14 }}
                    onFocus={e => { e.currentTarget.style.borderColor="rgba(72,202,228,0.55)"; e.currentTarget.style.background="rgba(0,150,199,0.06)"; e.currentTarget.style.boxShadow="0 0 0 3px rgba(0,150,199,0.10)"; }}
                    onBlur={e => { e.currentTarget.style.borderColor="rgba(0,150,199,0.18)"; e.currentTarget.style.background="rgba(255,255,255,0.03)"; e.currentTarget.style.boxShadow="none"; }} />
                </div>
              </div>

              <div className="mb-5">
                <label className="block mb-2 font-bold uppercase tracking-[0.14em]" style={{ fontSize:10,color:"#4A6A8A" }}>Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:"#4A6A8A" }} />
                  <input type={showPass?"text":"password"} value={password} onChange={e => { setPassword(e.target.value); setErr(""); }} onKeyDown={e => e.key==="Enter" && login()}
                    placeholder="Enter your password" autoComplete="current-password"
                    className="w-full rounded-2xl pl-11 pr-12 py-3.5 transition-all focus:outline-none"
                    style={{ background:"rgba(255,255,255,0.03)",border:"1px solid rgba(0,150,199,0.18)",color:"#E2E8F0",fontSize:14 }}
                    onFocus={e => { e.currentTarget.style.borderColor="rgba(72,202,228,0.55)"; e.currentTarget.style.background="rgba(0,150,199,0.06)"; e.currentTarget.style.boxShadow="0 0 0 3px rgba(0,150,199,0.10)"; }}
                    onBlur={e => { e.currentTarget.style.borderColor="rgba(0,150,199,0.18)"; e.currentTarget.style.background="rgba(255,255,255,0.03)"; e.currentTarget.style.boxShadow="none"; }} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors" style={{ color:"#4A6A8A" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color="#48CAE4"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color="#4A6A8A"}>
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <motion.button onClick={login} disabled={signing}
                whileHover={{ y:-1,boxShadow:"0 14px 40px rgba(0,150,199,0.55)" }}
                whileTap={{ scale:0.98 }} transition={{ type:"spring",stiffness:400,damping:22 }}
                className="w-full flex items-center justify-center gap-2.5 font-bold text-white rounded-2xl py-4 mb-5"
                style={{ fontSize:14,background:"linear-gradient(90deg,#005F92 0%,#0096C7 55%,#48CAE4 100%)",boxShadow:"0 4px 24px rgba(0,150,199,0.40),0 1px 0 rgba(255,255,255,0.10) inset",letterSpacing:"0.02em" }}>
                {signing ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Signing in…</span></>
                ) : (
                  <><span>Sign In</span><motion.span animate={{ x:[0,4,0] }} transition={{ repeat:Infinity,duration:2.2,ease:"easeInOut" }} style={{ display:"inline-block" }}>→</motion.span></>
                )}
              </motion.button>

              <div className="flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3 h-3" style={{ color:"#2A4060" }} />
                <span style={{ fontSize:11,color:"#2A4060" }}>Secured with SHA-256 encryption</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const isSuperAdmin = session.role === "super_admin";

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     AUTHENTICATED LAYOUT
  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  return (
    <div
      data-theme={dark ? "dark" : "light"}
      className="flex h-screen overflow-hidden print:block print:h-auto print:overflow-visible md:p-3 md:gap-3"
      style={{
        fontFamily: FONT,
        background: dark
          ? "#111111"
          : "radial-gradient(ellipse 65% 55% at 8% 0%,rgba(0,119,182,0.06) 0%,transparent 65%),radial-gradient(ellipse 55% 65% at 92% 0%,rgba(0,150,199,0.045) 0%,transparent 60%),#F4F0FF",
        transition: "background 0.3s ease",
      }}
    >
      {/* ── SIDEBAR — desktop only ── */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 224 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="hidden md:flex flex-col shrink-0 print:hidden overflow-hidden relative"
        style={{
          borderRadius: "24px",
          background: dark ? "rgba(20,20,20,0.85)" : "rgba(255,255,255,0.80)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: dark ? "1px solid rgba(0,119,182,0.18)" : "1px solid rgba(255,255,255,0.72)",
          boxShadow: dark
            ? "0 8px 30px rgba(0,0,0,0.30),0 1px 3px rgba(0,0,0,0.20)"
            : "0 8px 30px rgba(0,119,182,0.08),0 1px 3px rgba(0,119,182,0.04)",
          minHeight: 0,
          transition: "background 0.3s ease, border 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 relative z-10">
          <div className="shrink-0 flex items-center justify-center" style={{ width:32,height:32 }}>
            <img src="/vimal-logo.jpeg" alt="Vimal Travels" style={{ height:32,width:"auto",maxWidth:32,objectFit:"contain" }}
              onError={(e) => { const el=e.target as HTMLImageElement; el.style.display="none"; const box=el.parentElement!; box.style.cssText="width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#0077B6,#0096C7);display:flex;align-items:center;justify-content:center;flex-shrink:0"; const s=document.createElement("span"); s.textContent="VT"; s.style.cssText="font-weight:700;font-size:11px;color:white;"; box.appendChild(s); }} />
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div initial={{ opacity:0,x:-8 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-8 }} transition={{ duration:0.18 }} className="min-w-0 overflow-hidden">
                <div className="font-bold text-sm leading-none truncate" style={{ color: dark?"#E6E1E5":"#1C1B1F" }}>Vimal Travels</div>
                <div className="text-[10px] mt-0.5 tracking-wide truncate font-medium" style={{ color: dark?"#938F99":"#79747E" }}>Admin Portal</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mx-4 mb-3" style={{ height:1,background: dark?"linear-gradient(90deg,transparent,rgba(0,119,182,0.40),transparent)":"linear-gradient(90deg,transparent,rgba(0,119,182,0.28),transparent)" }} />

        {/* Role badge */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="mx-4 mb-3 flex items-center gap-2.5 rounded-2xl px-3 py-2.5"
              style={{
                background: isSuperAdmin
                  ? (dark ? "rgba(0,119,182,0.20)" : "rgba(0,119,182,0.08)")
                  : (dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"),
                border: isSuperAdmin
                  ? (dark ? "1px solid rgba(0,119,182,0.35)" : "1px solid rgba(0,119,182,0.22)")
                  : (dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.07)"),
                boxShadow: isSuperAdmin ? (dark?"0 2px 8px rgba(0,119,182,0.15)":"0 2px 6px rgba(0,119,182,0.08)") : "none",
              }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background: isSuperAdmin ? "linear-gradient(135deg,#0077B6,#0096C7)" : (dark?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.10)"), display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow: isSuperAdmin?"0 2px 6px rgba(0,119,182,0.35)":"none" }}>
                <span style={{ color:"white", fontSize:9, fontWeight:800, letterSpacing:"0.5px" }}>{session.displayName.split(" ").map((w: string) => w[0]).join("").slice(0,2).toUpperCase()}</span>
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold truncate" style={{ color: isSuperAdmin ? (dark?"#90E0EF":"#0077B6") : (dark?"#CAC4D0":"#49454F") }}>{session.displayName}</div>
                <div className="flex items-center gap-1 mt-0.5">
                  {isSuperAdmin ? <ShieldCheck className="w-2.5 h-2.5 shrink-0" style={{ color: dark?"#90E0EF":"#0077B6" }} /> : <Shield className="w-2.5 h-2.5 shrink-0" style={{ color: dark?"#938F99":"#79747E" }} />}
                  <div className="text-[9px] truncate" style={{ color: dark?"#938F99":"#79747E" }}>{isSuperAdmin ? "Full Access" : "Limited Access"}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!collapsed && (
          <div className="px-4 mb-2">
            <span className="text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: dark?"#49454F":"#CAC4D0" }}>Navigation</span>
          </div>
        )}

        <nav className="flex-1 px-2.5 space-y-0.5 overflow-y-auto pb-4 relative z-10">
          {NAV.filter(item => !item.superOnly || isSuperAdmin).map((item) => {
            const isActive = item.href === "/admin/billing"
              ? pathname === "/admin/billing" || pathname === "/admin"
              : pathname.startsWith(item.href);
            const activeBg  = dark ? "rgba(208,188,255,0.16)" : "#EADDFF";
            const activeCol = dark ? "#90E0EF" : "#0077B6";
            return (
              <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined}
                className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-all relative"
                style={{ background: isActive ? activeBg : "transparent", color: isActive ? activeCol : (dark?"#938F99":"#79747E"), boxShadow: isActive ? (dark?"0 0 14px rgba(0,119,182,0.22)":"0 0 10px rgba(0,119,182,0.12)") : "none", fontWeight: isActive ? 700 : 500 }}
                onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = dark?"rgba(208,188,255,0.08)":"rgba(0,119,182,0.07)"; (e.currentTarget as HTMLElement).style.color = activeCol; } }}
                onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = dark?"#938F99":"#79747E"; } }}>
                {isActive && <motion.div layoutId="activeBar" className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full" style={{ background: activeCol }} transition={{ duration:0.2 }} />}
                <item.icon className="w-4 h-4 shrink-0" style={{ color: isActive ? activeCol : (dark?"#49454F":"#CAC4D0") }} />
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span initial={{ opacity:0,x:-6 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-6 }} transition={{ duration:0.15 }} className="truncate">
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        <div className="relative z-10">
          <div className="mx-4 mb-3" style={{ height:1,background: dark?"linear-gradient(90deg,transparent,rgba(0,119,182,0.40),transparent)":"linear-gradient(90deg,transparent,rgba(0,119,182,0.28),transparent)" }} />
          <div className="px-2.5 pb-4 space-y-0.5">
            {/* Dark mode toggle */}
            <button onClick={toggleDark} title={dark ? "Switch to light mode" : "Switch to dark mode"}
              className="flex items-center gap-3 px-2.5 py-2 rounded-xl w-full transition-all text-sm"
              style={{ background: dark?"rgba(144,224,239,0.12)":"rgba(0,119,182,0.09)", color: dark?"#90E0EF":"#0077B6", border:`1px solid ${dark?"rgba(144,224,239,0.22)":"rgba(0,119,182,0.18)"}` }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = dark?"rgba(144,224,239,0.20)":"rgba(0,119,182,0.16)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = dark?"rgba(144,224,239,0.12)":"rgba(0,119,182,0.09)"; }}>
              <div style={{ width:32, height:18, borderRadius:9, background: dark?"#0096C7":"rgba(0,119,182,0.25)", border:`1px solid ${dark?"#48CAE4":"rgba(0,119,182,0.45)"}`, position:"relative", flexShrink:0, transition:"all 0.25s" }}>
                <div style={{ position:"absolute", top:2, left: dark?14:2, width:12, height:12, borderRadius:"50%", background: dark?"#FFFFFF":"#0077B6", transition:"left 0.25s cubic-bezier(0.4,0,0.2,1)", boxShadow:"0 1px 3px rgba(0,0,0,0.30)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {dark ? <Sun style={{ width:7, height:7, color:"#0096C7" }} /> : <Moon style={{ width:7, height:7, color:"#FFFFFF" }} />}
                </div>
              </div>
              <AnimatePresence initial={false}>
                {!collapsed && (<motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.15 }} className="text-xs font-bold">{dark?"Light Mode":"Dark Mode"}</motion.span>)}
              </AnimatePresence>
            </button>
            {/* Collapse */}
            <button onClick={() => setCollapsed(!collapsed)} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="flex items-center gap-3 px-2.5 py-2 rounded-xl w-full transition-all text-sm"
              style={{ color: dark?"#938F99":"#79747E" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.05)"; (e.currentTarget as HTMLElement).style.color = dark?"#CAC4D0":"#49454F"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = dark?"#938F99":"#79747E"; }}>
              {collapsed ? <PanelLeftOpen className="w-4 h-4 shrink-0" /> : <PanelLeftClose className="w-4 h-4 shrink-0" />}
              <AnimatePresence initial={false}>
                {!collapsed && (<motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.15 }} className="text-xs font-medium">Collapse</motion.span>)}
              </AnimatePresence>
            </button>
            {/* Logout */}
            <button onClick={logout}
              className="flex items-center gap-3 px-2.5 py-2 rounded-xl w-full transition-all text-sm"
              style={{ color: dark?"#938F99":"#79747E" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(186,26,26,0.10)"; (e.currentTarget as HTMLElement).style.color = "#B3261E"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = dark?"#938F99":"#79747E"; }}>
              <LogOut className="w-4 h-4 shrink-0" />
              <AnimatePresence initial={false}>
                {!collapsed && (<motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.15 }} className="text-xs font-medium">Sign Out</motion.span>)}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.aside>

      <main className="flex-1 overflow-auto print:block pb-16 md:pb-0" style={{ minWidth:0 }}>
        {children}
      </main>

      {/* ── BOTTOM NAV — mobile only ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center print:hidden"
        style={{
          background: dark ? "rgba(20,20,20,0.95)" : "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          borderTop: dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,119,182,0.12)",
          boxShadow: dark ? "0 -4px 20px rgba(0,0,0,0.30)" : "0 -4px 20px rgba(0,119,182,0.08)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}>
        {NAV.filter(item => !item.superOnly || isSuperAdmin).map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-all"
              style={{ color: active ? (dark?"#48CAE4":"#0077B6") : (dark?"#938F99":"#79747E") }}>
              <item.icon className="w-5 h-5" />
              <span style={{ fontSize:9, fontWeight:700, letterSpacing:"0.04em" }}>{item.label}</span>
              {active && <div style={{ width:16, height:2, borderRadius:2, background: dark?"#48CAE4":"#0077B6", marginTop:-2 }} />}
            </Link>
          );
        })}
        <button onClick={logout} className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1"
          style={{ color: dark?"#938F99":"#79747E" }}>
          <LogOut className="w-5 h-5" />
          <span style={{ fontSize:9, fontWeight:700, letterSpacing:"0.04em" }}>Sign Out</span>
        </button>
      </nav>
    </div>
  );
}
