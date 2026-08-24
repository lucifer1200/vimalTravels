"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  getInvoices, getCustomers, formatINR, fmtDate,
  type Invoice, TYPE_LABEL,
} from "@/lib/billing";
import {
  Plus, Plane, Package, FileCheck, Train, Bus, FileText, Hotel,
  Users, TrendingUp, TrendingDown, AlertCircle, ChevronRight,
  ArrowUpRight, CreditCard, Search, Lock, MessageCircle,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { useAdminDark } from "@/lib/useAdminDark";

const FONT = "var(--font-roboto), Roboto, system-ui, sans-serif";

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildCatBreakdown(invoices: Invoice[]): any[] {
  const result: any[] = [];
  for (const type of Object.keys(CAT_META)) {
    const meta = CAT_META[type as keyof typeof CAT_META];
    const items = invoices.filter(inv => inv.type === type);
    if (items.length === 0) continue;
    const revenue = items.reduce((s, inv) => s + inv.total, 0);
    result.push({ type, ...meta, count: items.length, revenue });
  }
  result.sort((a, b) => b.revenue - a.revenue);
  return result;
}

const CAT_META = {
  "air-intl": { label:"Air Intl",  icon:Plane,     accent:"#0077B6", tint:"#EFF9FF", accentD:"#0096C7", tintD:"rgba(0,150,199,0.14)" },
  "air-dom":  { label:"Air Dom",   icon:Plane,     accent:"#0891B2", tint:"#ECFEFF", accentD:"#60C0DC", tintD:"rgba(96,192,220,0.14)" },
  "train":    { label:"Train",     icon:Train,     accent:"#7C3AED", tint:"#FAF5FF", accentD:"#C4AAFF", tintD:"rgba(196,170,255,0.14)" },
  "bus":      { label:"Bus",       icon:Bus,       accent:"#059669", tint:"#F0FDF4", accentD:"#6EE7A6", tintD:"rgba(110,231,166,0.14)" },
  "hotel":    { label:"Hotel",     icon:Hotel,     accent:"#D97706", tint:"#FFFBEB", accentD:"#FBB760", tintD:"rgba(251,183,96,0.14)"  },
  "package":  { label:"Package",   icon:Package,   accent:"#DB2777", tint:"#FDF2F8", accentD:"#F9A8D4", tintD:"rgba(249,168,212,0.14)" },
  "visa":     { label:"Visa",      icon:FileCheck, accent:"#0369A1", tint:"#F0F9FF", accentD:"#7DD3FC", tintD:"rgba(125,211,252,0.14)" },
  "other":    { label:"Other",     icon:FileText,  accent:"#6B7280", tint:"#F9FAFB", accentD:"#9CA3AF", tintD:"rgba(156,163,175,0.14)" },
};

const TYPE_ICON: Record<string, typeof Plane> = {
  "air-intl": Plane, "air-dom": Plane, train: Train,
  bus: Bus, package: Package, visa: FileCheck, hotel: Hotel, other: FileText,
};

function Avatar({ name }: { name: string }) {
  const parts = name.trim().split(" ");
  const letters = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : name.slice(0, 2);
  const hue = Array.from(name).reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 select-none"
      style={{ background: `hsl(${hue},45%,46%)` }}>
      {letters.toUpperCase()}
    </div>
  );
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2 || values.every(v => v === 0)) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values.filter(v => v > 0), 0);
  const range = max - min || 1;
  const W = 76, H = 28;
  const pts = values.map((v, i): [number, number] => [(i / (values.length - 1)) * W, H - ((v - min) / range) * (H - 6) - 3]);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `M0,${H} ${pts.map(p => `L${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ")} L${W},${H} Z`;
  const id = color.replace(/[^a-z0-9]/gi, "s");
  const last = pts[pts.length - 1];
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible", display: "block" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={color} />
    </svg>
  );
}

type MonthBar = { label: string; billed: number };

function BarChart({ data, dark }: { data: MonthBar[]; dark: boolean }) {
  const max = Math.max(...data.map(d => d.billed), 1);
  const H = 160;
  const fmt = (v: number) => {
    if (v === 0) return "0";
    if (v >= 100000) return `${(v / 100000).toFixed(0)}L`;
    if (v >= 1000)   return `${(v / 1000).toFixed(0)}K`;
    return `${v}`;
  };
  const gridColor = dark ? "rgba(255,255,255,0.06)" : "rgba(0,119,182,0.08)";
  const labelColor = dark ? "#49454F" : "#CAC4D0";

  return (
    <div className="flex gap-2">
      <div className="relative shrink-0" style={{ width: 32, height: H + 24 }}>
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
          <div key={pct} className="absolute flex items-center justify-end pr-1" style={{ bottom: 24 + pct * H - 6, width: 32 }}>
            <span className="text-[9px] font-semibold" style={{ color: labelColor }}>{i === 0 ? "0" : fmt(max * pct)}</span>
          </div>
        ))}
      </div>
      <div className="flex-1 relative" style={{ height: H + 24 }}>
        {[0.25, 0.5, 0.75, 1].map(pct => (
          <div key={pct} className="absolute left-0 right-0" style={{ bottom: 24 + pct * H, borderTop: `1px solid ${gridColor}` }} />
        ))}
        <div className="absolute bottom-6 left-0 right-0 flex items-end gap-2" style={{ height: H }}>
          {data.map((d, i) => {
            const pct = d.billed / max;
            const isLast = i === data.length - 1;
            return (
              <div key={d.label} className="flex-1 relative group flex flex-col items-center">
                {d.billed > 0 && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none z-20">
                    <div className="rounded-xl px-2.5 py-1.5 text-[10px] font-bold whitespace-nowrap"
                      style={{ background: dark ? "#2A2A2A" : "#1C1B1F", color: "#E6E1E5", boxShadow: "0 6px 16px rgba(0,0,0,0.30)" }}>
                      ₹{formatINR(d.billed)}
                    </div>
                    <div className="w-2 h-2 rotate-45 mx-auto -mt-1" style={{ background: dark ? "#2A2A2A" : "#1C1B1F" }} />
                  </div>
                )}
                <div className="w-full flex items-end" style={{ height: H }}>
                  <motion.div className="w-full"
                    initial={{ height: 0 }}
                    animate={{ height: Math.max(pct * H, d.billed > 0 ? 3 : 0) }}
                    transition={{ duration: 0.65, delay: i * 0.06, ease: [0.34, 1.12, 0.64, 1] }}
                    style={{
                      borderRadius: "6px 6px 0 0",
                      background: isLast
                        ? "linear-gradient(180deg,#0096C7 0%,#0077B6 100%)"
                        : d.billed > 0
                          ? (dark ? "rgba(0,119,182,0.52)" : "rgba(0,119,182,0.32)")
                          : "transparent",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="absolute bottom-0 left-0 right-0 flex gap-2">
          {data.map((d, i) => (
            <div key={d.label} className="flex-1 text-center">
              <span className="text-[9px] font-semibold" style={{ color: i === data.length - 1 ? (dark ? "#90E0EF" : "#0077B6") : labelColor }}>
                {d.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
};

export default function BillingDashboard() {
  const dark = useAdminDark();
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const [invoices,     setInvoices]     = useState<Invoice[]>([]);
  const [customers,    setCustomers]    = useState(0);
  const [mounted,      setMounted]      = useState(false);
  const [search,       setSearch]       = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const handleSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim()) {
      router.push(`/admin/billing/invoices?search=${encodeURIComponent(search.trim())}`);
    }
    if (e.key === "Escape") { setSearch(""); searchRef.current?.blur(); }
  };

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

  /* -- Derived -- */
  const totalBilled = invoices.reduce((s, i) => s + i.total, 0);
  const totalPaid   = invoices.reduce((s, i) => s + (i.payments || []).reduce((ps, p) => ps + p.amount, 0), 0);
  const outstanding = totalBilled - totalPaid;
  const now         = new Date();

  const chartData: MonthBar[] = Array.from({ length: 8 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (7 - i), 1);
    const billed = invoices.filter(inv => { const id = new Date(inv.date); return id.getMonth() === d.getMonth() && id.getFullYear() === d.getFullYear(); }).reduce((s, inv) => s + inv.total, 0);
    return { label: d.toLocaleString("en-IN", { month: "short" }), billed };
  });

  const sparkValues = chartData.map(d => d.billed);

  const needsAttention = invoices.filter(i => i.status === "due" || i.status === "partial").slice(0, 5);
  const recent         = invoices.slice(0, 8);

  const catBreakdown = buildCatBreakdown(invoices);
  const dueInvoices = invoices.filter(inv2 => inv2.status === "due" || inv2.status === "partial");
  const agingCurrent = dueInvoices.filter(inv2 => daysSince(inv2.date) <= 30);
  const agingMid     = dueInvoices.filter(inv2 => daysSince(inv2.date) >= 31 && daysSince(inv2.date) <= 60);
  const agingOverdue = dueInvoices.filter(inv2 => daysSince(inv2.date) >= 61);

  const collectionRate = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0;

  const thisMonthInvs = invoices.filter(inv => {
    const d = new Date(inv.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthInvs = invoices.filter(inv => {
    const d = new Date(inv.date);
    return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear();
  });

  const thisMBilled = thisMonthInvs.reduce((s, i) => s + i.total, 0);
  const lastMBilled = lastMonthInvs.reduce((s, i) => s + i.total, 0);
  const thisMPaid   = thisMonthInvs.reduce((s, i) => s + (i.payments||[]).reduce((ps,p)=>ps+p.amount,0), 0);
  const lastMPaid   = lastMonthInvs.reduce((s, i) => s + (i.payments||[]).reduce((ps,p)=>ps+p.amount,0), 0);
  const thisMOuts   = thisMonthInvs.reduce((s, i) => s + (i.total - (i.payments||[]).reduce((ps,p)=>ps+p.amount,0)), 0);
  const lastMOuts   = lastMonthInvs.reduce((s, i) => s + (i.total - (i.payments||[]).reduce((ps,p)=>ps+p.amount,0)), 0);
  const thisMCusts  = new Set(thisMonthInvs.map(i => i.customer?.name)).size;
  const lastMCusts  = new Set(lastMonthInvs.map(i => i.customer?.name)).size;

  function monthTrend(curr: number, prev: number) {
    if (prev === 0) return null;
    return Math.round(((curr - prev) / prev) * 100);
  }
  const gstMonth = thisMonthInvs.reduce((acc, inv) => ({
    cgst: acc.cgst + (inv.cgst || 0),
    sgst: acc.sgst + (inv.sgst || 0),
    igst: acc.igst + (inv.igst || 0),
  }), { cgst: 0, sgst: 0, igst: 0 });
  const gstMonthTotal = gstMonth.cgst + gstMonth.sgst + gstMonth.igst;

  const custMap = new Map<string, { name: string; mobile?: string; total: number; count: number }>();
  for (const inv of invoices) {
    const key = inv.customer?.name || "Unknown";
    const ex = custMap.get(key) || { name: key, mobile: inv.customer?.mobile || inv.customer?.phone, total: 0, count: 0 };
    ex.total += inv.total;
    ex.count++;
    custMap.set(key, ex);
  }
  const topCustomers = Array.from(custMap.values()).sort((a, b) => b.total - a.total).slice(0, 5);

  const today0 = new Date(); today0.setHours(0, 0, 0, 0);
  const in7 = new Date(today0); in7.setDate(in7.getDate() + 7);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const upcomingTravel: Array<{ inv: Invoice; travelDate: Date; paxName: string }> = [];
  for (const inv of invoices) {
    for (const item of inv.items as any[]) {
      const td = item.travelDate || item.checkIn || item.travelFrom;
      if (td) {
        const d = new Date(td); d.setHours(0, 0, 0, 0);
        if (d.getTime() >= today0.getTime() && d.getTime() <= in7.getTime()) {
          upcomingTravel.push({ inv, travelDate: d, paxName: item.paxName || item.guestName || item.leadPax || "" });
        }
      }
    }
  }
  upcomingTravel.sort((a, b) => a.travelDate.getTime() - b.travelDate.getTime());

  /* -- Theme tokens -- */
  const T = dark ? {
    text:      "#E6E1E5",
    textSub:   "#CAC4D0",
    textMuted: "#938F99",
    cardBg:    "rgba(28,28,30,0.95)",
    cardBorder:"rgba(255,255,255,0.10)",
    cardShadow:"0 4px 20px rgba(0,0,0,0.40),0 1px 3px rgba(0,0,0,0.30)",
    divider:   "rgba(255,255,255,0.06)",
    primary:   "#90E0EF",
    accent:    "#0077B6",
    topBarBg:  "rgba(18,18,18,0.95)",
    topBarBorder:"rgba(255,255,255,0.08)",
    searchBg:  "rgba(255,255,255,0.07)",
    searchBorder:"rgba(255,255,255,0.12)",
    rowHover:  "rgba(255,255,255,0.04)",
    tblHeader: "rgba(255,255,255,0.03)",
    lockBg:    "rgba(20,20,20,0.90)",
    emptyBg:   "rgba(255,255,255,0.03)",
    emptyBorder:"rgba(255,255,255,0.06)",
  } : {
    text:      "#1C1B1F",
    textSub:   "#49454F",
    textMuted: "#79747E",
    cardBg:    "rgba(255,255,255,0.85)",
    cardBorder:"rgba(255,255,255,0.65)",
    cardShadow:"0 4px 20px rgba(0,119,182,0.06),0 1px 3px rgba(0,119,182,0.04)",
    divider:   "rgba(0,119,182,0.08)",
    primary:   "#0077B6",
    accent:    "#0077B6",
    topBarBg:  "rgba(255,255,255,0.85)",
    topBarBorder:"rgba(255,255,255,0.65)",
    searchBg:  "#F3EFF6",
    searchBorder:"#E7E0EC",
    rowHover:  "rgba(0,119,182,0.04)",
    tblHeader: "rgba(0,119,182,0.04)",
    lockBg:    "rgba(255,255,255,0.92)",
    emptyBg:   "#FAF7FF",
    emptyBorder:"#E7E0EC",
  };

  const glass = {
    background:       T.cardBg,
    backdropFilter:   "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border:           `1px solid ${T.cardBorder}`,
    boxShadow:        T.cardShadow,
    transition:       "background 0.3s ease, border 0.3s ease",
  } as const;

  const glassHover = dark
    ? "0 10px 32px rgba(0,0,0,0.35)"
    : "0 10px 32px rgba(0,119,182,0.12)";

  /* -- Status chips -- */
  const STATUS_CHIP: Record<string, { bg: string; text: string; dot: string; label: string }> = dark ? {
    paid:    { bg: "rgba(34,197,94,0.15)",  text: "#86EFAC", dot: "#22C55E", label: "Paid"    },
    partial: { bg: "rgba(245,158,11,0.15)", text: "#FDE68A", dot: "#F59E0B", label: "Partial" },
    due:     { bg: "rgba(239,68,68,0.15)",  text: "#FCA5A5", dot: "#EF4444", label: "Due"     },
  } : {
    paid:    { bg: "#DCFCE7", text: "#15803D", dot: "#22C55E", label: "Paid"    },
    partial: { bg: "#FEF3C7", text: "#B45309", dot: "#F59E0B", label: "Partial" },
    due:     { bg: "#FEE2E2", text: "#B91C1C", dot: "#EF4444", label: "Due"     },
  };

  /* -- KPI card defs -- */
  const stats = [
    { label: "Total Billed",  value: `₹${formatINR(totalBilled)}`, sub: `${invoices.length} invoices`,   icon: TrendingUp,   accent: dark?"#0096C7":"#0077B6", tint: dark?"rgba(255,255,255,0.07)":"#F3EFF6", spark: dark?"#0096C7":"#0077B6", showTrend: true,  monthTrend: monthTrend(thisMBilled, lastMBilled) },
    { label: "Outstanding",   value: `₹${formatINR(outstanding)}`,  sub: `${invoices.filter(i => i.status !== "paid").length} unpaid`, icon: AlertCircle,  accent: dark?"#FBB760":"#D97706", tint: dark?"rgba(245,158,11,0.15)":"#FFFBEB", spark: dark?"#F59E0B":"#F59E0B", showTrend: false, monthTrend: monthTrend(thisMOuts, lastMOuts) },
    { label: "Collected",     value: `₹${formatINR(totalPaid)}`,    sub: `${collectionRate}% collected`,                                icon: ArrowUpRight, accent: dark?"#6EE7A6":"#16A34A", tint: dark?"rgba(34,197,94,0.14)":"#F0FDF4", spark: dark?"#22C55E":"#22C55E", showTrend: false, monthTrend: monthTrend(thisMPaid, lastMPaid) },
    { label: "Customers",     value: customers.toLocaleString("en-IN"), sub: "active clients",                                         icon: Users,        accent: dark?"#C4AAFF":"#7C3AED", tint: dark?"rgba(255,255,255,0.07)":"#FAF5FF", spark: dark?"#A78BFA":"#8B5CF6", showTrend: false, monthTrend: monthTrend(thisMCusts, lastMCusts) },
  ];

  return (
    <div className="min-h-full" style={{ fontFamily: FONT }}>

      {/* TOP BAR */}
      <div className="sticky top-0 z-20 px-5 pt-4 pb-3">
        <div className="rounded-2xl px-5 py-3 flex items-center gap-4" style={{
          background: T.topBarBg, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          border: `1px solid ${T.topBarBorder}`, boxShadow: T.cardShadow, transition: "background 0.3s ease",
        }}>
          <div className="min-w-0">
            <h1 className="font-bold text-lg leading-tight" style={{ color: T.text, letterSpacing: "-0.03em", fontFamily: "var(--font-roboto),Roboto,system-ui,sans-serif" }}>Dashboard</h1>
            <p className="text-[11px] font-medium" style={{ color: T.textMuted }}>
              {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>

          <div className="flex-1 max-w-[280px] hidden md:block relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: T.textMuted }} />
            <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} onKeyDown={handleSearchKey}
              placeholder="Search invoices, customers... (Enter)"
              className="w-full pl-9 pr-12 py-2 rounded-xl text-[13px] focus:outline-none transition-all"
              style={{ background: T.searchBg, border: `1px solid ${T.searchBorder}`, color: T.text }}
              onFocus={e => { e.currentTarget.style.borderColor = dark?"rgba(208,188,255,0.5)":"rgba(0,119,182,0.4)"; e.currentTarget.style.background = dark?"rgba(255,255,255,0.08)":"#EDE7F6"; }}
              onBlur={e => { e.currentTarget.style.borderColor = T.searchBorder; e.currentTarget.style.background = T.searchBg; }} />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-semibold px-1.5 py-0.5 rounded"
              style={{ background: T.divider, color: T.textMuted }}>CmdK</kbd>
          </div>

          <div className="ml-auto shrink-0">
            <Link href="/admin/billing/invoices/new"
              className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2.5 rounded-[14px] transition-all hover:-translate-y-px"
              style={{ background: "linear-gradient(135deg,#0077B6,#0096C7)", boxShadow: "0 2px 8px rgba(0,119,182,0.35)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(0,119,182,0.50)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,119,182,0.35)"; }}>
              <Plus className="w-4 h-4" /> New Invoice
            </Link>
          </div>
        </div>
      </div>

      {/* -- CONTENT -- */}
      <div className="px-5 pb-6 space-y-5">

        {/* -- KPI CARDS -- */}
        <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          initial="hidden" animate={mounted ? "show" : "hidden"}
          variants={{ show: { transition: { staggerChildren: 0.07 } } }}>
          {stats.map((s) => {
            const isFinancial = s.label !== "Customers";
            const locked = isFinancial && !isSuperAdmin;
            return (
              <motion.div key={s.label} variants={fadeUp} className="rounded-[20px] p-5 relative overflow-hidden" style={glass}
                whileHover={{ y: -2, boxShadow: glassHover }} transition={{ type: "spring", stiffness: 300, damping: 22 }}>
                {locked && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-[20px]"
                    style={{ background: T.lockBg, backdropFilter: "blur(6px)" }}>
                    <Lock className="w-5 h-5 mb-1.5" style={{ color: T.textMuted }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: T.textMuted }}>Super Admin Only</span>
                  </div>
                )}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-[11px] font-semibold" style={{ color: T.textMuted, letterSpacing: "0.02em" }}>{s.label}</span>
                    {mounted && isSuperAdmin && s.monthTrend !== null && s.monthTrend !== undefined && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{
                            background: s.monthTrend >= 0 ? (dark?"rgba(34,197,94,0.15)":"#DCFCE7") : (dark?"rgba(239,68,68,0.15)":"#FEE2E2"),
                            color: s.monthTrend >= 0 ? (dark?"#86EFAC":"#15803D") : (dark?"#FCA5A5":"#B91C1C"),
                          }}>
                          {s.monthTrend >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                          {s.monthTrend > 0 ? "+" : ""}{s.monthTrend}% vs last month
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="w-9 h-9 rounded-[12px] flex items-center justify-center shrink-0" style={{ background: s.tint }}>
                    <s.icon className="w-4 h-4" style={{ color: s.accent }} />
                  </div>
                </div>
                <div className="font-bold tabular-nums leading-none mb-1" style={{ color: T.text, fontSize: "26px", letterSpacing: "-0.04em" }}>{s.value}</div>
                <div className="text-[11px] font-semibold" style={{ color: s.accent }}>{s.sub}</div>
                {mounted && sparkValues.some(v => v > 0) && (
                  <div className="mt-3 flex justify-end" style={{ opacity: 0.65 }}>
                    <Sparkline values={sparkValues} color={s.spark} />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0" style={{ height: 3, background: `linear-gradient(90deg,${s.accent},${s.spark})`, opacity: 0.75, borderRadius: "0 0 20px 20px" }} />
              </motion.div>
            );
          })}
        </motion.div>

        {/* -- GST SUMMARY (super admin) -- */}
        {isSuperAdmin && mounted && gstMonthTotal > 0 && (
          <motion.div initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.4,delay:0.14 }}
            className="rounded-[20px] p-5" style={glass}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div style={{ width:3, height:20, borderRadius:2, background:"linear-gradient(180deg,#7C3AED,#A855F7)", flexShrink:0 }} />
                <div>
                  <h2 className="font-bold text-base leading-tight" style={{ color:T.text, letterSpacing:"-0.02em", fontFamily:FONT }}>GST Summary</h2>
                  <p className="text-[12px] font-medium mt-0.5" style={{ color:T.textMuted }}>{now.toLocaleString("en-IN",{month:"long",year:"numeric"})} collected</p>
                </div>
              </div>
              <Link href="/admin/billing/reports" className="text-[12px] font-semibold px-2.5 py-1 rounded-lg transition-colors"
                style={{ color:dark?"#C4AAFF":"#7C3AED" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = dark?"rgba(196,170,255,0.10)":"#FAF5FF"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                Full Report {'->'}
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label:"CGST (9%)",  val: gstMonth.cgst, color: dark?"#C4AAFF":"#7C3AED", bg: dark?"rgba(196,170,255,0.12)":"#FAF5FF" },
                { label:"SGST (9%)",  val: gstMonth.sgst, color: dark?"#C4AAFF":"#7C3AED", bg: dark?"rgba(196,170,255,0.12)":"#FAF5FF" },
                { label:"IGST (18%)", val: gstMonth.igst, color: dark?"#60C0DC":"#0891B2", bg: dark?"rgba(96,192,220,0.12)":"#ECFEFF" },
              ].map(g => (
                <div key={g.label} className="rounded-xl p-3.5" style={{ background:g.bg }}>
                  <div className="text-[11px] font-semibold mb-1.5" style={{ color:g.color, opacity:0.85 }}>{g.label}</div>
                  <div className="text-[18px] font-bold tabular-nums leading-none" style={{ color:T.text, letterSpacing:"-0.03em" }}>
                    {g.val > 0 ? `₹${formatINR(g.val)}` : "--"}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop:`1px solid ${T.divider}` }}>
              <span className="text-[12px] font-semibold" style={{ color:T.textMuted }}>Total GST this month</span>
              <span className="text-[15px] font-bold tabular-nums" style={{ color:dark?"#C4AAFF":"#7C3AED" }}>₹{formatINR(gstMonthTotal)}</span>
            </div>
          </motion.div>
        )}

        {/* -- TRAVEL DATE TRACKER -- */}
        {mounted && upcomingTravel.length !== 0 && (
          <motion.div initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.35,delay:0.16 }}
            className="rounded-[20px] p-5" style={{ ...glass, border:`1px solid ${dark?"rgba(245,158,11,0.30)":"rgba(245,158,11,0.35)"}` }}>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background:dark?"rgba(245,158,11,0.15)":"#FEF3C7" }}>
                <Plane className="w-4 h-4" style={{ color:dark?"#FBB760":"#D97706" }} />
              </div>
              <div>
                <h2 className="font-bold text-[13px] leading-tight" style={{ color:T.text, fontFamily:FONT }}>Upcoming Travel — Next 7 Days</h2>
                <p className="text-[11px] font-medium mt-0.5" style={{ color:T.textMuted }}>{upcomingTravel.length} booking{upcomingTravel.length !== 1 ? "s" : ""} departing soon</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {upcomingTravel.slice(0, 8).map((t, idx) => {
                const daysLeft = Math.round((t.travelDate.getTime() - today0.getTime()) / 86400000);
                return (
                  <Link key={idx} href={`/admin/billing/invoices/${t.inv.id}`}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors"
                    style={{ background:dark?"rgba(245,158,11,0.10)":"#FFFBEB", border:`1px solid ${dark?"rgba(245,158,11,0.20)":"rgba(245,158,11,0.30)"}` }}>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold truncate" style={{ color:dark?"#FBB760":"#92400E" }}>{t.paxName || t.inv.customer?.name}</div>
                      <div className="text-[10px] font-mono" style={{ color:T.textMuted }}>{t.inv.invoiceNo}</div>
                    </div>
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full shrink-0"
                      style={{ background:daysLeft === 0?"#FEE2E2":dark?"rgba(245,158,11,0.20)":"#FEF3C7", color:daysLeft === 0?"#B91C1C":dark?"#FBB760":"#92400E" }}>
                      {daysLeft === 0 ? "TODAY" : `${daysLeft}d`}
                    </span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* -- CHART + OUTSTANDING -- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          <motion.div initial={{ opacity:0,y:18 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.45,delay:0.2 }}
            className="lg:col-span-2 rounded-[20px] p-6 relative overflow-hidden" style={glass}>
            {!isSuperAdmin && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-[20px]"
                style={{ background: T.lockBg, backdropFilter: "blur(8px)" }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                  style={{ background: dark?"rgba(255,255,255,0.06)":"#F3EFF6", border: `1px solid ${T.cardBorder}` }}>
                  <Lock className="w-5 h-5" style={{ color: dark?"#90E0EF":"#0077B6" }} />
                </div>
                <p className="font-bold text-sm mb-1" style={{ color: T.text }}>Revenue Data Restricted</p>
                <p className="text-xs" style={{ color: T.textMuted }}>Only Super Admin can view financial reports</p>
              </div>
            )}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2.5">
                  <div style={{ width:3, height:20, borderRadius:2, background:"linear-gradient(180deg,#0077B6,#0096C7)", flexShrink:0 }} />
                  <h2 className="font-bold text-base leading-tight" style={{ color: T.text, letterSpacing: "-0.02em", fontFamily:"var(--font-roboto),Roboto,system-ui,sans-serif" }}>Revenue Overview</h2>
                </div>
                <p className="text-[12px] font-medium mt-1" style={{ color: T.textMuted }}>8-month billing trend</p>
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                <span className="flex items-center gap-1.5" style={{ color: T.textMuted }}>
                  <span className="w-2 h-2 rounded-sm inline-block" style={{ background: dark?"rgba(255,255,255,0.20)":"rgba(0,119,182,0.18)" }} /> Prior months
                </span>
                <span className="flex items-center gap-1.5 font-semibold" style={{ color: dark?"#90E0EF":"#0077B6" }}>
                  <span className="w-2 h-2 rounded-sm inline-block" style={{ background: dark?"#90E0EF":"#0077B6" }} /> Current
                </span>
              </div>
            </div>
            {mounted && <BarChart data={chartData} dark={dark} />}
            {!mounted && <div style={{ height: 184 }} />}
          </motion.div>

          {/* Outstanding */}
          <motion.div initial={{ opacity:0,y:18 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.45,delay:0.28 }}
            className="rounded-[20px] p-6" style={glass}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="flex items-center gap-2.5">
                  <div style={{ width:3, height:20, borderRadius:2, background:"linear-gradient(180deg,#F59E0B,#D97706)", flexShrink:0 }} />
                  <h2 className="font-bold text-base leading-tight" style={{ color: T.text, letterSpacing: "-0.02em", fontFamily:"var(--font-roboto),Roboto,system-ui,sans-serif" }}>Outstanding</h2>
                </div>
                <p className="text-[12px] font-medium mt-1" style={{ color: T.textMuted }}>Pending payments</p>
              </div>
              <Link href="/admin/billing/invoices" className="text-[12px] font-semibold px-2.5 py-1 rounded-lg transition-colors"
                style={{ color: dark?"#90E0EF":"#0077B6" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = dark?"rgba(208,188,255,0.10)":"#F3EFF6"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                View All {'->'}
              </Link>
            </div>
            {/* Aging buckets */}
            {mounted && dueInvoices.length !== 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label:"0-30 days", items: agingCurrent, color: dark?"#6EE7A6":"#16A34A", bg: dark?"rgba(34,197,94,0.12)":"#F0FDF4" },
                  { label:"31-60 days", items: agingMid,    color: dark?"#FBB760":"#D97706", bg: dark?"rgba(245,158,11,0.12)":"#FFFBEB" },
                  { label:"60+ days",  items: agingOverdue, color: dark?"#FCA5A5":"#B91C1C", bg: dark?"rgba(239,68,68,0.12)":"#FEF2F2" },
                ].map(a => (
                  <div key={a.label} className="rounded-xl px-3 py-2.5 text-center" style={{ background: a.bg }}>
                    <div className="text-[18px] font-bold tabular-nums" style={{ color: a.color }}>{a.items.length}</div>
                    <div className="text-[9px] font-semibold mt-0.5" style={{ color: a.color, opacity:0.8 }}>{a.label}</div>
                  </div>
                ))}
              </div>
            )}
            {needsAttention.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 rounded-2xl"
                style={{ background: T.emptyBg, border: `1px dashed ${T.emptyBorder}` }}>
                <CreditCard className="w-7 h-7 mb-2" style={{ color: T.textMuted }} />
                <span className="text-sm font-semibold" style={{ color: T.textMuted }}>All payments clear OK</span>
              </div>
            ) : (
              <div className="space-y-0.5">
                <AnimatePresence>
                  {needsAttention.map((inv, i) => {
                    const sc = STATUS_CHIP[inv.status];
                    const days = daysSince(inv.date);
                    const isOld = days > 30;
                    const waPhone = inv.customer?.mobile || inv.customer?.phone;
                    const waPaid = (inv.payments || []).reduce((s: number, p: {amount:number}) => s + p.amount, 0);
                    const waBal = inv.total - waPaid;
                    const waText = `Dear ${inv.customer?.name},\n\nThis is a reminder for your outstanding payment.\n\nInvoice: ${inv.invoiceNo}\nBalance Due: Rs.${formatINR(waBal)}\n\nPlease contact us.\nVimal Travels: 9886114440 | 9845679729`;
                    const waUrl = waPhone ? `https://wa.me/91${waPhone.replace(/\D/g,"").slice(-10)}?text=${encodeURIComponent(waText)}` : null;
                    return (
                      <motion.div key={inv.id} initial={{ opacity:0,x:8 }} animate={{ opacity:1,x:0 }} transition={{ delay: i * 0.06 }}>
                        <Link href={`/admin/billing/invoices/${inv.id}`}
                          className="flex items-center gap-3 py-2.5 px-2.5 rounded-xl transition-colors group"
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = T.rowHover; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                          <Avatar name={inv.customer?.name || "?"} />
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-semibold truncate" style={{ color: T.text }}>{inv.customer?.name}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <div className="text-[10px] font-mono font-medium" style={{ color: T.textMuted }}>{inv.invoiceNo}</div>
                              {isOld && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: dark?"rgba(239,68,68,0.18)":"#FEE2E2", color: dark?"#FCA5A5":"#B91C1C" }}>
                                  {days}d overdue
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <span className="text-[13px] font-bold tabular-nums" style={{ color: T.text, letterSpacing: "-0.015em" }}>₹{formatINR(inv.total)}</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide"
                              style={{ background: sc.bg, color: sc.text }}>
                              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: sc.dot }} />
                              {sc.label}
                            </span>
                          </div>
                          {waUrl && (
                            <a href={waUrl} target="_blank" rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="p-1.5 rounded-lg self-center shrink-0 transition-colors"
                              style={{ background: dark?"rgba(37,211,102,0.13)":"#DCFCE7", color:"#15803D" }}
                              title="Send WhatsApp reminder">
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </Link>
                        {i < needsAttention.length - 1 && <div className="mx-3" style={{ height: 1, background: T.divider }} />}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>

        {/* -- REVENUE BY CATEGORY (super admin) -- */}
        {isSuperAdmin && catBreakdown.length > 0 && (
          <motion.div initial={{ opacity:0,y:18 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.45,delay:0.30 }}
            className="rounded-[20px] p-6" style={glass}>
            <div className="flex items-center gap-2.5 mb-5">
              <div style={{ width:3, height:20, borderRadius:2, background:"linear-gradient(180deg,#0077B6,#0096C7)", flexShrink:0 }} />
              <div>
                <h2 className="font-bold text-base leading-tight" style={{ color: T.text, letterSpacing:"-0.02em", fontFamily:"var(--font-roboto),Roboto,system-ui,sans-serif" }}>Revenue by Category</h2>
                <p className="text-[12px] font-medium mt-0.5" style={{ color: T.textMuted }}>All-time breakdown by service type</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {catBreakdown.map((c, i) => {
                const accent = dark ? c.accentD : c.accent;
                const tint   = dark ? c.tintD   : c.tint;
                const maxRev = catBreakdown[0].revenue || 1;
                const barW   = Math.max(4, Math.round((c.revenue / maxRev) * 100));
                return (
                  <motion.div key={c.type} initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay: 0.32 + i * 0.05 }}
                    className="rounded-[16px] p-4 relative overflow-hidden" style={{ background: tint, border:`1px solid ${accent}22` }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0" style={{ background: dark?"rgba(0,0,0,0.25)":"rgba(255,255,255,0.7)" }}>
                        <c.icon className="w-3.5 h-3.5" style={{ color: accent }} />
                      </div>
                      <span className="text-[11px] font-bold" style={{ color: accent }}>{c.label}</span>
                    </div>
                    <div className="text-[20px] font-bold tabular-nums leading-none mb-1" style={{ color: T.text, letterSpacing:"-0.03em" }}>
                      ₹{formatINR(c.revenue)}
                    </div>
                    <div className="text-[10px] font-semibold mb-2.5" style={{ color: T.textMuted }}>{c.count} invoice{c.count !== 1 ? "s" : ""}</div>
                    <div className="h-1 rounded-full" style={{ background: dark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.08)" }}>
                      <div className="h-1 rounded-full transition-all" style={{ width:`${barW}%`, background: accent }} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* -- TOP CUSTOMERS (super admin) -- */}
        {isSuperAdmin && topCustomers.length !== 0 && (
          <motion.div initial={{ opacity:0,y:18 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.45,delay:0.33 }}
            className="rounded-[20px] p-6" style={glass}>
            <div className="flex items-center gap-2.5 mb-5">
              <div style={{ width:3, height:20, borderRadius:2, background:"linear-gradient(180deg,#DB2777,#F472B6)", flexShrink:0 }} />
              <div>
                <h2 className="font-bold text-base leading-tight" style={{ color:T.text, letterSpacing:"-0.02em", fontFamily:FONT }}>Top Customers</h2>
                <p className="text-[12px] font-medium mt-0.5" style={{ color:T.textMuted }}>Highest revenue clients</p>
              </div>
            </div>
            <div className="space-y-3">
              {topCustomers.map((c, rank) => {
                const barW = Math.max(6, Math.round((c.total / (topCustomers[0].total || 1)) * 100));
                const medals = ["linear-gradient(135deg,#F59E0B,#D97706)","linear-gradient(135deg,#94A3B8,#64748B)","linear-gradient(135deg,#CD7C3E,#A35C26)"];
                const medalBg = rank < 3 ? medals[rank] : "linear-gradient(135deg,#0077B6,#0096C7)";
                return (
                  <div key={c.name} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 text-white" style={{ background:medalBg }}>
                      {rank + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[13px] font-semibold truncate" style={{ color:T.text }}>{c.name}</span>
                        <span className="text-[12px] font-bold tabular-nums ml-3 shrink-0" style={{ color:dark?"#90E0EF":"#0077B6" }}>₹{formatINR(c.total)}</span>
                      </div>
                      <div className="relative h-1.5 rounded-full" style={{ background:dark?"rgba(255,255,255,0.07)":"rgba(0,119,182,0.08)" }}>
                        <div className="absolute inset-y-0 left-0 rounded-full transition-all" style={{ width:`${barW}%`, background: rank === 0 ? "linear-gradient(90deg,#F59E0B,#D97706)":"linear-gradient(90deg,#0077B6,#0096C7)" }} />
                      </div>
                      <div className="text-[10px] font-medium mt-1" style={{ color:T.textMuted }}>{c.count} invoice{c.count !== 1 ? "s" : ""}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* -- RECENT INVOICES -- */}
        <motion.div initial={{ opacity:0,y:18 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.45,delay:0.34 }}
          className="rounded-[20px] overflow-hidden" style={glass}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${T.divider}` }}>
            <div className="flex items-center gap-2.5">
              <div style={{ width:3, height:20, borderRadius:2, background:"linear-gradient(180deg,#0077B6,#0096C7)", flexShrink:0 }} />
              <div>
                <h2 className="font-bold text-base leading-tight" style={{ color: T.text, letterSpacing: "-0.02em", fontFamily:"var(--font-roboto),Roboto,system-ui,sans-serif" }}>Recent Invoices</h2>
                <p className="text-[12px] font-medium mt-0.5" style={{ color: T.textMuted }}>{recent.length} latest entries</p>
              </div>
            </div>
            <Link href="/admin/billing/invoices"
              className="text-[12px] font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors"
              style={{ color: dark?"#90E0EF":"#0077B6" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = dark?"rgba(208,188,255,0.10)":"#F3EFF6"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="py-16 text-center">
              <FileText className="w-8 h-8 mx-auto mb-2" style={{ color: T.textMuted }} />
              <p className="text-sm font-semibold" style={{ color: T.textMuted }}>No invoices yet</p>
              <Link href="/admin/billing/invoices/new" className="text-sm mt-1 inline-block font-semibold" style={{ color: dark?"#90E0EF":"#0077B6" }}>
                Create first invoice {'->'}
              </Link>
            </div>
          ) : (
            <>
              <div className="grid px-6 py-2.5 text-[10px] font-bold uppercase"
                style={{ gridTemplateColumns:"2fr 1.1fr 1.3fr 0.9fr 1fr 88px", background: T.tblHeader, borderBottom: `1px solid ${T.divider}`, color: T.textMuted, letterSpacing:"0.06em" }}>
                <span>Customer</span><span>Invoice #</span><span>Service</span><span>Date</span><span className="text-right">Total</span><span className="text-center">Status</span>
              </div>
              {recent.map((inv, idx) => {
                const Icon = TYPE_ICON[inv.type] || FileText;
                const sc   = STATUS_CHIP[inv.status];
                return (
                  <motion.div key={inv.id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay: 0.38 + idx * 0.03 }}>
                    <Link href={`/admin/billing/invoices/${inv.id}`}
                      className="grid items-center px-6 py-3.5 group transition-colors"
                      style={{ gridTemplateColumns:"2fr 1.1fr 1.3fr 0.9fr 1fr 88px", borderBottom: `1px solid ${T.divider}` }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = T.rowHover; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={inv.customer?.name || "?"} />
                        <span className="text-[13px] font-semibold truncate" style={{ color: T.text }}>{inv.customer?.name}</span>
                      </div>
                      <span className="text-[11px] font-mono font-bold" style={{ color: dark?"#90E0EF":"#0077B6" }}>{inv.invoiceNo}</span>
                      <div className="flex items-center gap-1.5 text-[12px]" style={{ color: T.textSub }}>
                        <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: T.textMuted }} />
                        <span className="truncate">{TYPE_LABEL[inv.type].replace(" Invoice","").replace(" Ticket","")}</span>
                      </div>
                      <span className="text-[12px] font-medium" style={{ color: T.textMuted }}>{fmtDate(inv.date)}</span>
                      <span className="text-[13px] font-bold text-right tabular-nums" style={{ color: T.text, letterSpacing:"-0.015em" }}>₹{formatINR(inv.total)}</span>
                      <div className="flex justify-center">
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase px-2.5 py-1 rounded-full"
                          style={{ background: sc.bg, color: sc.text, letterSpacing:"0.04em" }}>
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

        {/* -- QUICK ACTIONS -- */}
        <motion.div initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.4,delay:0.42 }} className="grid grid-cols-3 gap-4">
          {[
            { href:"/admin/billing/invoices/new?type=air-intl", icon:Plane,  label:"Air Ticket",    sub:"New flight invoice",  accent:dark?"#0096C7":"#0077B6", tint:dark?"rgba(255,255,255,0.07)":"#F3EFF6" },
            { href:"/admin/billing/invoices/new?type=hotel",    icon:Hotel,  label:"Hotel Booking", sub:"New hotel invoice",   accent:dark?"#60C0DC":"#0891B2", tint:dark?"rgba(8,145,178,0.15)":"#ECFEFF"  },
            { href:"/admin/billing/customers",                  icon:Users,  label:"Customers",     sub:"View master list",    accent:dark?"#C4AAFF":"#7C3AED", tint:dark?"rgba(255,255,255,0.07)":"#FAF5FF" },
          ].map((q) => (
            <motion.div key={q.href} whileHover={{ y:-3,boxShadow:glassHover }} transition={{ type:"spring",stiffness:320,damping:22 }} className="rounded-[20px] overflow-hidden" style={glass}>
              <div style={{ height:3, background:`linear-gradient(90deg,${q.accent},${q.accent}88)` }} />
              <Link href={q.href} className="flex items-center gap-3.5 p-5 group">
                <div className="w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105" style={{ background: q.tint }}>
                  <q.icon className="w-5 h-5" style={{ color: q.accent }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold" style={{ color: T.text }}>{q.label}</div>
                  <div className="text-[11px] font-medium mt-0.5" style={{ color: T.textMuted }}>{q.sub}</div>
                </div>
                <ChevronRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: T.textMuted }} />
              </Link>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </div>
  );
}
