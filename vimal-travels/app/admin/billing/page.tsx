"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  getInvoices, getCustomers, formatINR, fmtDate,
  type Invoice, TYPE_LABEL,
} from "@/lib/billing";
import {
  Plus, Plane, Package, FileCheck, Train, Bus, FileText, Hotel,
  Users, TrendingUp, TrendingDown, AlertCircle, ChevronRight,
  ArrowUpRight, CreditCard, Search, Lock,
} from "lucide-react";
import { getSession } from "@/lib/auth";

/* ── Type icon map ── */
const TYPE_ICON: Record<string, typeof Plane> = {
  "air-intl": Plane, "air-dom": Plane, train: Train,
  bus: Bus, package: Package, visa: FileCheck, hotel: Hotel, other: FileText,
};

/* ── Glass surface tokens ── */
const glass = {
  background: "rgba(255,255,255,0.82)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.62)",
  boxShadow: "0 4px 20px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.03)",
} as const;

const glassHover = "0 10px 32px rgba(15,23,42,0.09), 0 2px 6px rgba(15,23,42,0.04)";

/* ── Initials avatar ── */
function Avatar({ name }: { name: string }) {
  const parts = name.trim().split(" ");
  const letters = parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : name.slice(0, 2);
  const hue = Array.from(name).reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 select-none"
      style={{ background: `hsl(${hue},50%,46%)` }}
    >
      {letters.toUpperCase()}
    </div>
  );
}

/* ── Mini sparkline ── */
function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2 || values.every(v => v === 0)) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values.filter(v => v > 0), 0);
  const range = max - min || 1;
  const W = 76, H = 28;
  const pts = values.map((v, i): [number, number] => [
    (i / (values.length - 1)) * W,
    H - ((v - min) / range) * (H - 6) - 3,
  ]);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `M0,${H} ${pts.map(p => `L${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ")} L${W},${H} Z`;
  const id = color.replace(/[^a-z0-9]/gi, "s");
  const last = pts[pts.length - 1];
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible", display: "block" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.16" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={color} />
    </svg>
  );
}

/* ── Bar chart ── */
type MonthBar = { label: string; billed: number };

function BarChart({ data }: { data: MonthBar[] }) {
  const max = Math.max(...data.map(d => d.billed), 1);
  const H = 160;

  const fmt = (v: number) => {
    if (v === 0) return "0";
    if (v >= 100000) return `${(v / 100000).toFixed(0)}L`;
    if (v >= 1000)   return `${(v / 1000).toFixed(0)}K`;
    return `${v}`;
  };

  return (
    <div className="flex gap-2">
      {/* Y-axis */}
      <div className="relative shrink-0" style={{ width: 32, height: H + 24 }}>
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
          <div key={pct} className="absolute flex items-center justify-end pr-1"
            style={{ bottom: 24 + pct * H - 6, width: 32 }}>
            <span className="text-[9px] font-semibold" style={{ color: "#CBD5E1" }}>
              {i === 0 ? "0" : fmt(max * pct)}
            </span>
          </div>
        ))}
      </div>

      {/* Bars */}
      <div className="flex-1 relative" style={{ height: H + 24 }}>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map(pct => (
          <div key={pct} className="absolute left-0 right-0"
            style={{ bottom: 24 + pct * H, borderTop: "1px solid rgba(226,232,240,0.55)" }} />
        ))}

        {/* Bar columns */}
        <div className="absolute bottom-6 left-0 right-0 flex items-end gap-2" style={{ height: H }}>
          {data.map((d, i) => {
            const pct = d.billed / max;
            const isLast = i === data.length - 1;
            return (
              <div key={d.label} className="flex-1 relative group flex flex-col items-center">
                {/* Tooltip */}
                {d.billed > 0 && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none z-20">
                    <div className="rounded-xl px-2.5 py-1.5 text-[10px] font-bold whitespace-nowrap"
                      style={{ background: "#0F172A", color: "#F8FAFC", boxShadow: "0 6px 16px rgba(15,23,42,0.28)" }}>
                      ₹{formatINR(d.billed)}
                    </div>
                    <div className="w-2 h-2 bg-slate-900 rotate-45 mx-auto -mt-1" />
                  </div>
                )}
                <div className="w-full flex items-end" style={{ height: H }}>
                  <motion.div
                    className="w-full"
                    initial={{ height: 0 }}
                    animate={{ height: Math.max(pct * H, d.billed > 0 ? 3 : 0) }}
                    transition={{ duration: 0.65, delay: i * 0.06, ease: [0.34, 1.12, 0.64, 1] }}
                    style={{
                      borderRadius: "6px 6px 0 0",
                      background: isLast
                        ? "linear-gradient(180deg, #3B82F6 0%, #2563EB 100%)"
                        : d.billed > 0
                          ? "linear-gradient(180deg, #BFDBFE 0%, #DBEAFE 100%)"
                          : "transparent",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* X labels */}
        <div className="absolute bottom-0 left-0 right-0 flex gap-2">
          {data.map((d, i) => (
            <div key={d.label} className="flex-1 text-center">
              <span className="text-[9px] font-semibold"
                style={{ color: i === data.length - 1 ? "#2563EB" : "#94A3B8" }}>
                {d.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Fade-up variant ── */
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
};

/* ── Status chip config ── */
const STATUS_CHIP: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  paid:    { bg: "#DCFCE7", text: "#15803D", dot: "#22C55E", label: "Paid"    },
  partial: { bg: "#FEF3C7", text: "#B45309", dot: "#F59E0B", label: "Partial" },
  due:     { bg: "#FEE2E2", text: "#B91C1C", dot: "#EF4444", label: "Due"     },
};

/* ════════════════════════════════════════════════ */
export default function BillingDashboard() {
  const [invoices,     setInvoices]     = useState<Invoice[]>([]);
  const [customers,    setCustomers]    = useState(0);
  const [mounted,      setMounted]      = useState(false);
  const [search,       setSearch]       = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [invs, custs] = await Promise.all([getInvoices(), getCustomers()]);
      setInvoices(invs);
      setCustomers(custs.length);
      const s = getSession();
      setIsSuperAdmin(s?.role === "super_admin");
      setMounted(true);
    };
    load();
  }, []);

  /* ── Derived values (same logic as before) ── */
  const totalBilled  = invoices.reduce((s, i) => s + i.total, 0);
  const totalPaid    = invoices.reduce((s, i) => s + (i.payments || []).reduce((ps, p) => ps + p.amount, 0), 0);
  const outstanding  = totalBilled - totalPaid;
  const now          = new Date();

  const chartData: MonthBar[] = Array.from({ length: 8 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (7 - i), 1);
    const billed = invoices
      .filter(inv => {
        const id = new Date(inv.date);
        return id.getMonth() === d.getMonth() && id.getFullYear() === d.getFullYear();
      })
      .reduce((s, inv) => s + inv.total, 0);
    return { label: d.toLocaleString("en-IN", { month: "short" }), billed };
  });

  const sparkValues  = chartData.map(d => d.billed);
  const prevBilled   = sparkValues[sparkValues.length - 2] ?? 0;
  const currBilled   = sparkValues[sparkValues.length - 1] ?? 0;
  const trendPct     = prevBilled > 0 ? ((currBilled - prevBilled) / prevBilled) * 100 : 0;
  const trendUp      = trendPct >= 0;

  const needsAttention = invoices.filter(i => i.status === "due" || i.status === "partial").slice(0, 5);
  const recent         = invoices.slice(0, 8);

  /* ── KPI card definitions ── */
  const stats = [
    { label: "Total Billed",  value: `₹${formatINR(totalBilled)}`, sub: `${invoices.length} invoices`,   icon: TrendingUp,   accent: "#2563EB", tint: "#EFF6FF", spark: "#3B82F6", showTrend: true  },
    { label: "Outstanding",   value: `₹${formatINR(outstanding)}`,  sub: `${invoices.filter(i => i.status !== "paid").length} unpaid`,  icon: AlertCircle,  accent: "#D97706", tint: "#FFFBEB", spark: "#F59E0B", showTrend: false },
    { label: "Collected",     value: `₹${formatINR(totalPaid)}`,    sub: now.toLocaleString("en-IN", { month: "long" }),                icon: ArrowUpRight, accent: "#16A34A", tint: "#F0FDF4", spark: "#22C55E", showTrend: true  },
    { label: "Customers",     value: customers.toLocaleString("en-IN"), sub: "active clients",                                          icon: Users,        accent: "#7C3AED", tint: "#FAF5FF", spark: "#8B5CF6", showTrend: false },
  ];

  return (
    <div className="min-h-full" style={{ fontFamily: "Inter,system-ui,sans-serif" }}>

      {/* ══ TOP BAR ══ */}
      <div className="sticky top-0 z-20 px-5 pt-4 pb-3">
        <div className="rounded-2xl px-5 py-3 flex items-center gap-4" style={glass}>
          {/* Title */}
          <div className="min-w-0">
            <h1 className="font-bold text-lg leading-tight" style={{ color: "#0F172A", letterSpacing: "-0.03em" }}>
              Dashboard
            </h1>
            <p className="text-[11px] font-medium" style={{ color: "#94A3B8" }}>
              {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-[280px] hidden md:block relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#94A3B8" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search invoices, customers…"
              className="w-full pl-9 pr-12 py-2 rounded-xl text-[13px] focus:outline-none transition-all"
              style={{
                background: "#F1F5F9",
                border: "1px solid #E2E8F0",
                color: "#0F172A",
              }}
              onFocus={e => { e.currentTarget.style.borderColor = "#93C5FD"; e.currentTarget.style.background = "#EFF6FF"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.background = "#F1F5F9"; }}
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-semibold px-1.5 py-0.5 rounded"
              style={{ background: "#E2E8F0", color: "#94A3B8" }}>
              ⌘K
            </kbd>
          </div>

          {/* New Invoice */}
          <div className="ml-auto shrink-0">
            <Link
              href="/admin/billing/invoices/new"
              className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2.5 rounded-[14px] transition-all hover:-translate-y-px"
              style={{
                background: "#2563EB",
                boxShadow: "0 2px 8px rgba(37,99,235,0.30)",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(37,99,235,0.40)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(37,99,235,0.30)"; }}
            >
              <Plus className="w-4 h-4" /> New Invoice
            </Link>
          </div>
        </div>
      </div>

      {/* ══ CONTENT ══ */}
      <div className="px-5 pb-6 space-y-5">

        {/* ── KPI CARDS ── */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          initial="hidden"
          animate={mounted ? "show" : "hidden"}
          variants={{ show: { transition: { staggerChildren: 0.07 } } }}
        >
          {stats.map((s) => {
            const isFinancial = s.label !== "Customers";
            const locked = isFinancial && !isSuperAdmin;
            return (
              <motion.div
                key={s.label}
                variants={fadeUp}
                className="rounded-[20px] p-5 relative overflow-hidden"
                style={glass}
                whileHover={{ y: -2, boxShadow: glassHover }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
              >
                {/* Lock overlay for admin */}
                {locked && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-[20px]"
                    style={{ background: "rgba(248,250,252,0.85)", backdropFilter: "blur(6px)" }}>
                    <Lock className="w-5 h-5 mb-1.5" style={{ color: "#94A3B8" }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#CBD5E1" }}>Super Admin Only</span>
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-[11px] font-semibold" style={{ color: "#94A3B8", letterSpacing: "0.02em" }}>
                      {s.label}
                    </span>
                    {s.showTrend && mounted && isSuperAdmin && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: trendUp ? "#DCFCE7" : "#FEE2E2", color: trendUp ? "#15803D" : "#B91C1C" }}>
                          {trendUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                          {trendPct > 0 ? "+" : ""}{trendPct.toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="w-9 h-9 rounded-[12px] flex items-center justify-center shrink-0" style={{ background: s.tint }}>
                    <s.icon className="w-4 h-4" style={{ color: s.accent }} />
                  </div>
                </div>

                {/* Value */}
                <div className="font-bold tabular-nums leading-none mb-1"
                  style={{ color: "#0F172A", fontSize: "22px", letterSpacing: "-0.03em" }}>
                  {s.value}
                </div>
                <div className="text-[11px] font-semibold" style={{ color: s.accent }}>{s.sub}</div>

                {/* Sparkline */}
                {mounted && sparkValues.some(v => v > 0) && (
                  <div className="mt-3 flex justify-end" style={{ opacity: 0.65 }}>
                    <Sparkline values={sparkValues} color={s.spark} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── CHART + OUTSTANDING ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Revenue chart */}
          <motion.div
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="lg:col-span-2 rounded-[20px] p-6 relative overflow-hidden"
            style={glass}
          >
            {/* Lock overlay for admin */}
            {!isSuperAdmin && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-[20px]"
                style={{ background: "rgba(248,250,252,0.88)", backdropFilter: "blur(8px)" }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                  style={{ background: "linear-gradient(135deg,#EFF6FF,#DBEAFE)", border: "1px solid #BFDBFE" }}>
                  <Lock className="w-5 h-5" style={{ color: "#2563EB" }} />
                </div>
                <p className="font-bold text-sm mb-1" style={{ color: "#1E293B" }}>Revenue Data Restricted</p>
                <p className="text-xs" style={{ color: "#94A3B8" }}>Only Super Admin can view financial reports</p>
              </div>
            )}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-bold text-base leading-tight" style={{ color: "#0F172A", letterSpacing: "-0.02em" }}>Revenue Overview</h2>
                <p className="text-[12px] font-medium mt-0.5" style={{ color: "#94A3B8" }}>8-month billing trend</p>
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                <span className="flex items-center gap-1.5" style={{ color: "#94A3B8" }}>
                  <span className="w-2 h-2 rounded-sm inline-block" style={{ background: "#DBEAFE" }} /> Prior months
                </span>
                <span className="flex items-center gap-1.5 font-semibold" style={{ color: "#2563EB" }}>
                  <span className="w-2 h-2 rounded-sm inline-block" style={{ background: "#2563EB" }} /> Current
                </span>
              </div>
            </div>
            {mounted && <BarChart data={chartData} />}
            {!mounted && <div style={{ height: 184 }} />}
          </motion.div>

          {/* Outstanding */}
          <motion.div
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.28 }}
            className="rounded-[20px] p-6"
            style={glass}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-base leading-tight" style={{ color: "#0F172A", letterSpacing: "-0.02em" }}>
                  Outstanding
                </h2>
                <p className="text-[12px] font-medium mt-0.5" style={{ color: "#94A3B8" }}>Pending payments</p>
              </div>
              <Link
                href="/admin/billing/invoices"
                className="text-[12px] font-semibold px-2.5 py-1 rounded-lg transition-colors"
                style={{ color: "#2563EB" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#EFF6FF"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                View All →
              </Link>
            </div>

            {needsAttention.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 rounded-2xl"
                style={{ background: "#F8FAFC", border: "1px dashed #E2E8F0" }}>
                <CreditCard className="w-7 h-7 mb-2" style={{ color: "#CBD5E1" }} />
                <span className="text-sm font-semibold" style={{ color: "#94A3B8" }}>All payments clear ✓</span>
              </div>
            ) : (
              <div className="space-y-0.5">
                <AnimatePresence>
                  {needsAttention.map((inv, i) => {
                    const sc = STATUS_CHIP[inv.status];
                    return (
                      <motion.div key={inv.id}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}>
                        <Link
                          href={`/admin/billing/invoices/${inv.id}`}
                          className="flex items-center gap-3 py-2.5 px-2.5 rounded-xl transition-colors group"
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F8FAFC"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                        >
                          <Avatar name={inv.customer?.name || "?"} />
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-semibold truncate transition-colors group-hover:text-blue-600"
                              style={{ color: "#0F172A" }}>
                              {inv.customer?.name}
                            </div>
                            <div className="text-[10px] font-mono font-medium mt-0.5" style={{ color: "#94A3B8" }}>
                              {inv.invoiceNo}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <span className="text-[13px] font-bold tabular-nums" style={{ color: "#0F172A", letterSpacing: "-0.015em" }}>
                              ₹{formatINR(inv.total)}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide"
                              style={{ background: sc.bg, color: sc.text }}>
                              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: sc.dot }} />
                              {sc.label}
                            </span>
                          </div>
                        </Link>
                        {i < needsAttention.length - 1 && (
                          <div className="mx-3" style={{ height: 1, background: "rgba(226,232,240,0.6)" }} />
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>

        {/* ── RECENT INVOICES ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.34 }}
          className="rounded-[20px] overflow-hidden"
          style={glass}
        >
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(241,245,249,0.9)" }}>
            <div>
              <h2 className="font-bold text-base leading-tight" style={{ color: "#0F172A", letterSpacing: "-0.02em" }}>
                Recent Invoices
              </h2>
              <p className="text-[12px] font-medium mt-0.5" style={{ color: "#94A3B8" }}>{recent.length} latest entries</p>
            </div>
            <Link
              href="/admin/billing/invoices"
              className="text-[12px] font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors"
              style={{ color: "#2563EB" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#EFF6FF"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="py-16 text-center">
              <FileText className="w-8 h-8 mx-auto mb-2" style={{ color: "#E2E8F0" }} />
              <p className="text-sm font-semibold" style={{ color: "#94A3B8" }}>No invoices yet</p>
              <Link href="/admin/billing/invoices/new"
                className="text-sm mt-1 inline-block font-semibold" style={{ color: "#2563EB" }}>
                Create first invoice →
              </Link>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div
                className="grid px-6 py-2.5 text-[10px] font-bold uppercase"
                style={{
                  gridTemplateColumns: "2fr 1.1fr 1.3fr 0.9fr 1fr 88px",
                  background: "#F8FAFC",
                  borderBottom: "1px solid #F1F5F9",
                  color: "#94A3B8",
                  letterSpacing: "0.06em",
                }}
              >
                <span>Customer</span>
                <span>Invoice #</span>
                <span>Service</span>
                <span>Date</span>
                <span className="text-right">Total</span>
                <span className="text-center">Status</span>
              </div>

              {/* Table rows */}
              {recent.map((inv, idx) => {
                const Icon = TYPE_ICON[inv.type] || FileText;
                const sc   = STATUS_CHIP[inv.status];
                return (
                  <motion.div
                    key={inv.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.38 + idx * 0.03 }}
                  >
                    <Link
                      href={`/admin/billing/invoices/${inv.id}`}
                      className="grid items-center px-6 py-3.5 group transition-colors"
                      style={{
                        gridTemplateColumns: "2fr 1.1fr 1.3fr 0.9fr 1fr 88px",
                        borderBottom: "1px solid #F8FAFC",
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F8FAFC"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={inv.customer?.name || "?"} />
                        <span className="text-[13px] font-semibold truncate transition-colors group-hover:text-blue-600"
                          style={{ color: "#0F172A" }}>
                          {inv.customer?.name}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono font-bold" style={{ color: "#2563EB" }}>
                        {inv.invoiceNo}
                      </span>
                      <div className="flex items-center gap-1.5 text-[12px]" style={{ color: "#64748B" }}>
                        <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: "#CBD5E1" }} />
                        <span className="truncate">
                          {TYPE_LABEL[inv.type].replace(" Invoice","").replace(" Ticket","")}
                        </span>
                      </div>
                      <span className="text-[12px] font-medium" style={{ color: "#94A3B8" }}>{fmtDate(inv.date)}</span>
                      <span className="text-[13px] font-bold text-right tabular-nums"
                        style={{ color: "#0F172A", letterSpacing: "-0.015em" }}>
                        ₹{formatINR(inv.total)}
                      </span>
                      <div className="flex justify-center">
                        <span
                          className="inline-flex items-center gap-1 text-[9px] font-bold uppercase px-2.5 py-1 rounded-full"
                          style={{ background: sc.bg, color: sc.text, letterSpacing: "0.04em" }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: sc.dot }} />
                          {sc.label}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </>
          )}
        </motion.div>

        {/* ── QUICK ACTIONS ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.42 }}
          className="grid grid-cols-3 gap-4"
        >
          {[
            { href: "/admin/billing/invoices/new?type=air-intl", icon: Plane,  label: "Air Ticket",    sub: "New flight invoice",  accent: "#2563EB", tint: "#EFF6FF" },
            { href: "/admin/billing/invoices/new?type=hotel",    icon: Hotel,  label: "Hotel Booking", sub: "New hotel invoice",   accent: "#0891B2", tint: "#ECFEFF" },
            { href: "/admin/billing/customers",                  icon: Users,  label: "Customers",     sub: "View master list",    accent: "#7C3AED", tint: "#FAF5FF" },
          ].map((q) => (
            <motion.div
              key={q.href}
              whileHover={{ y: -2, boxShadow: glassHover }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className="rounded-[20px]"
              style={glass}
            >
              <Link
                href={q.href}
                className="flex items-center gap-3.5 p-4 group"
              >
                <div className="w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                  style={{ background: q.tint }}>
                  <q.icon className="w-5 h-5" style={{ color: q.accent }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold transition-colors group-hover:text-blue-600"
                    style={{ color: "#0F172A" }}>
                    {q.label}
                  </div>
                  <div className="text-[11px] font-medium mt-0.5" style={{ color: "#94A3B8" }}>{q.sub}</div>
                </div>
                <ChevronRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                  style={{ color: "#CBD5E1" }} />
              </Link>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </div>
  );
}
