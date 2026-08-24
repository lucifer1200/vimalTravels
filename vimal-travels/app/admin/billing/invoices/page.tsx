"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  getInvoices, formatINR, fmtDate, saveInvoice,
  type Invoice, type InvoiceType, type InvoiceStatus, TYPE_LABEL,
} from "@/lib/billing";
import { Plus, Search, FileText, Plane, Package, FileCheck, Train, Bus, Hotel, TrendingUp, CheckCircle, AlertCircle, X, ChevronRight, Calendar, ChevronLeft, Download, MessageCircle } from "lucide-react";
const ChevRight = ChevronRight;
import { useAdminDark } from "@/lib/useAdminDark";
import { getSession } from "@/lib/auth";

const FONT = "var(--font-roboto), Roboto, system-ui, sans-serif";

const TYPE_CONFIG: Record<string, { icon: any; bg: string; color: string; short: string; darkBg: string; darkColor: string }> = {
  "air-intl": { icon: Plane,     bg:"#DBEAFE", color:"#1D4ED8", short:"Intl Air", darkBg:"rgba(29,78,216,0.18)", darkColor:"#93C5FD" },
  "air-dom":  { icon: Plane,     bg:"#EDE9FE", color:"#6D28D9", short:"Dom Air",  darkBg:"rgba(109,40,217,0.18)",darkColor:"#C4B5FD" },
  train:      { icon: Train,     bg:"#D1FAE5", color:"#047857", short:"Train",    darkBg:"rgba(4,120,87,0.18)",  darkColor:"#6EE7B7" },
  bus:        { icon: Bus,       bg:"#FEF3C7", color:"#B45309", short:"Bus",      darkBg:"rgba(180,83,9,0.18)",  darkColor:"#FDE68A" },
  hotel:      { icon: Hotel,     bg:"#CFFAFE", color:"#0E7490", short:"Hotel",    darkBg:"rgba(14,116,144,0.18)",darkColor:"#67E8F9" },
  package:    { icon: Package,   bg:"#FCE7F3", color:"#BE185D", short:"Package",  darkBg:"rgba(190,24,93,0.18)", darkColor:"#F9A8D4" },
  visa:       { icon: FileCheck, bg:"#E0F2FE", color:"#0369A1", short:"Visa",     darkBg:"rgba(3,105,161,0.18)", darkColor:"#7DD3FC" },
  other:      { icon: FileText,  bg:"#F1F5F9", color:"#475569", short:"Other",    darkBg:"rgba(71,85,105,0.18)", darkColor:"#94A3B8" },
};

type Filter = "all" | InvoiceType | InvoiceStatus;
type DatePeriod = "all" | "today" | "week" | "month" | "fy" | "custom";

function getFYBounds(now: Date) {
  const m = now.getMonth(); // 0-indexed; March=2, April=3
  const y = now.getFullYear();
  const fyStart = m >= 3 ? new Date(y, 3, 1) : new Date(y - 1, 3, 1);
  const fyEnd   = m >= 3 ? new Date(y + 1, 2, 31, 23, 59, 59) : new Date(y, 2, 31, 23, 59, 59);
  const fyLabel = m >= 3 ? `FY ${y}-${String(y + 1).slice(2)}` : `FY ${y - 1}-${String(y).slice(2)}`;
  return { fyStart, fyEnd, fyLabel };
}

function matchPeriod(invDate: string, period: DatePeriod, now: Date, customFrom?: string, customTo?: string): boolean {
  if (period === "all") return true;
  const d = new Date(invDate);
  if (period === "today") return d.toDateString() === now.toDateString();
  if (period === "week") {
    const cutoff = new Date(now); cutoff.setDate(now.getDate() - 6); cutoff.setHours(0,0,0,0);
    return d >= cutoff;
  }
  if (period === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  if (period === "fy") { const { fyStart, fyEnd } = getFYBounds(now); return d >= fyStart && d <= fyEnd; }
  if (period === "custom" && customFrom && customTo) {
    const from = new Date(customFrom); from.setHours(0,0,0,0);
    const to   = new Date(customTo);   to.setHours(23,59,59,999);
    return d >= from && d <= to;
  }
  return true;
}

/* -- Mini Calendar Date Range Picker -- */
function DateRangePicker({ from, to, onApply, onClose, dark }: {
  from: string; to: string;
  onApply: (f: string, t: string) => void;
  onClose: () => void;
  dark: boolean;
}) {
  // toDS converts a Date to "YYYY-MM-DD" (renamed to avoid shadowing the billing import)
  const toDS = (d: Date): string => {
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return yy + "-" + mm + "-" + dd;
  };

  const todayD = new Date();
  todayD.setHours(0, 0, 0, 0);
  const todayStr = toDS(todayD);

  const [viewYear,  setViewYear]  = useState(from ? Number(from.slice(0, 4)) : todayD.getFullYear());
  const [viewMonth, setViewMonth] = useState(from ? Number(from.slice(5, 7)) - 1 : todayD.getMonth());
  const [start, setStart] = useState(from || "");
  const [end,   setEnd]   = useState(to   || "");
  const [hover, setHover] = useState("");

  const PRI  = "#0077B6";
  const BG   = dark ? "#1C1C1E" : "#ffffff";
  const BDR  = dark ? "rgba(255,255,255,0.12)" : "#E2E8F0";
  const TXT  = dark ? "#E6E1E5" : "#1E293B";
  const MUT  = dark ? "#64748B" : "#94A3B8";
  const RNGB = dark ? "rgba(0,119,182,0.20)" : "rgba(0,119,182,0.10)";

  const MNAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DNAMES = ["Su","Mo","Tu","We","Th","Fr","Sa"];

  const goBack = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const goFwd = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // Build 42 cells (6 weeks)
  const cells: Array<{ ds: string; day: number; cur: boolean }> = [];
  const fd = new Date(viewYear, viewMonth, 1).getDay(); // first day of month (0=Sun)
  const dim = new Date(viewYear, viewMonth + 1, 0).getDate(); // days in month
  // prev month tail
  const prevDim = new Date(viewYear, viewMonth, 0).getDate();
  for (let i = 0; i < fd; i++) {
    const day = prevDim - fd + 1 + i;
    cells.push({ ds: toDS(new Date(viewYear, viewMonth - 1, day)), day, cur: false });
  }
  // current month
  for (let day = 1; day <= dim; day++) {
    cells.push({ ds: toDS(new Date(viewYear, viewMonth, day)), day, cur: true });
  }
  // next month head
  for (let day = 1; cells.length < 42; day++) {
    cells.push({ ds: toDS(new Date(viewYear, viewMonth + 1, day)), day, cur: false });
  }

  const lo = start && end ? (start <= end ? start : end) : start;
  const hi = start && end ? (start <= end ? end   : start) : end;
  const hLo = start && !end && hover ? (start <= hover ? start : hover) : "";
  const hHi = start && !end && hover ? (start <= hover ? hover : start) : "";

  const handleDay = (ds: string) => {
    if (!start || (start && end)) { setStart(ds); setEnd(""); setHover(""); }
    else { setEnd(ds); setHover(""); }
  };

  const canApply = !!(lo && hi);

  return (
    <div style={{
      width: 308, borderRadius: 16,
      background: BG, border: "1px solid " + BDR,
      boxShadow: dark ? "0 20px 60px rgba(0,0,0,0.7)" : "0 20px 60px rgba(0,0,0,0.18)",
    }}>

      {/* Month nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid " + BDR }}>
        <button onClick={goBack} style={{ all: "unset", cursor: "pointer", color: MUT, display: "flex", padding: 4 }}>
          <ChevronLeft size={16} />
        </button>
        <span style={{ fontSize: 13, fontWeight: 700, color: TXT }}>{MNAMES[viewMonth]} {viewYear}</span>
        <button onClick={goFwd} style={{ all: "unset", cursor: "pointer", color: MUT, display: "flex", padding: 4 }}>
          <ChevRight size={16} />
        </button>
      </div>

      {/* Day-name header */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", padding: "10px 12px 4px" }}>
        {DNAMES.map(n => (
          <div key={n} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: MUT }}>{n}</div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: "flex", flexWrap: "wrap", padding: "0 12px 12px" }}>
        {cells.map(({ ds, day, cur }, idx) => {
          const isSel  = ds === lo || ds === hi;
          const isRng  = !!(lo && hi && ds > lo && ds < hi);
          const isHRng = !!(hLo && hHi && ds > hLo && ds < hHi);
          const isTod  = ds === todayStr;

          const bg = isSel ? PRI
            : isTod ? (dark ? "rgba(0,119,182,0.35)" : "rgba(0,119,182,0.15)")
            : (isRng || isHRng) ? RNGB
            : "transparent";
          const fg = isSel ? "#ffffff" : cur ? TXT : MUT;

          return (
            <div
              key={idx}
              onClick={() => cur && handleDay(ds)}
              onMouseEnter={() => { if (cur && start && !end) setHover(ds); }}
              onMouseLeave={() => setHover("")}
              style={{
                width: "14.285714%",
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: cur ? "pointer" : "default",
              }}>
              <div style={{
                width: 30, height: 30,
                borderRadius: "50%",
                background: bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: isSel ? 700 : 500,
                color: fg,
                opacity: cur ? 1 : 0.35,
                boxShadow: isSel ? "0 2px 8px rgba(0,119,182,0.4)" : "none",
                outline: isTod && !isSel ? "2px solid rgba(0,119,182,0.35)" : "none",
                outlineOffset: 1,
              }}>
                {day}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected range label */}
      {(lo || hi) && (
        <div style={{ margin: "0 12px 10px", padding: "7px 12px", borderRadius: 10, background: dark ? "rgba(0,119,182,0.15)" : "rgba(0,119,182,0.08)", fontSize: 12, fontWeight: 600, color: PRI, display: "flex", alignItems: "center", gap: 6 }}>
          <Calendar size={12} />
          {lo || "-"} {'->'} {hi || "pick end date"}
        </div>
      )}

      {/* Presets */}
      <div style={{ display: "flex", gap: 6, padding: "0 12px 12px" }}>
        {([
          { l: "Today", f: () => { setStart(todayStr); setEnd(todayStr); } },
          { l: "Last 7 days", f: () => { const s = new Date(todayD); s.setDate(s.getDate() - 6); setStart(toDS(s)); setEnd(todayStr); } },
          { l: "This Month", f: () => { setStart(toDS(new Date(viewYear, viewMonth, 1))); setEnd(toDS(new Date(viewYear, viewMonth + 1, 0))); } },
        ] as const).map(p => (
          <button key={p.l} onClick={p.f}
            style={{ all: "unset", flex: 1, textAlign: "center", padding: "5px 0", borderRadius: 8, border: "1px solid " + BDR, cursor: "pointer", fontSize: 11, fontWeight: 600, color: MUT }}>
            {p.l}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, padding: "0 12px 12px" }}>
        <button onClick={onClose}
          style={{ all: "unset", flex: 1, textAlign: "center", padding: "9px 0", borderRadius: 10, border: "1px solid " + BDR, cursor: "pointer", fontSize: 13, fontWeight: 600, color: MUT }}>
          Cancel
        </button>
        <button disabled={!canApply} onClick={() => canApply && onApply(lo!, hi!)}
          style={{ all: "unset", flex: 1, textAlign: "center", padding: "9px 0", borderRadius: 10, cursor: canApply ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 700, color: "#fff", background: "linear-gradient(135deg,#0077B6,#0096C7)", boxShadow: canApply ? "0 4px 14px rgba(0,119,182,0.45)" : "none", opacity: canApply ? 1 : 0.45 }}>
          Apply
        </button>
      </div>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const hue = Array.from(name).reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[12px] font-bold text-white select-none"
      style={{ background: `hsl(${hue},48%,44%)` }}>
      {initials}
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
};

function InvoicesPageContent() {
  const dark = useAdminDark();
  const searchParams = useSearchParams();
  const [invoices,      setInvoices]      = useState<Invoice[]>([]);
  const [search,        setSearch]        = useState(searchParams.get("search") ?? "");
  const [filter,        setFilter]        = useState<Filter>("all");
  const [datePeriod,    setDatePeriod]    = useState<DatePeriod>("all");
  const [customFrom,    setCustomFrom]    = useState("");
  const [customTo,      setCustomTo]      = useState("");
  const [showCalendar,  setShowCalendar]  = useState(false);
  const [calPos, setCalPos] = useState({ top: 0, right: 0 });
  const calBtnRef = useRef<HTMLButtonElement>(null);
  const [mounted,       setMounted]       = useState(false);
  const [isSuperAdmin,  setIsSuperAdmin]  = useState(false);
  const [selected,      setSelected]      = useState<Set<string>>(new Set());
  const [bulkLoading,   setBulkLoading]   = useState(false);

  const toggleSelect = (id: string) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const toggleSelectAll = () => {
    const unpaid = filtered.filter(i => i.status !== "paid").map(i => i.id);
    setSelected(prev => prev.size === unpaid.length ? new Set() : new Set(unpaid));
  };

  const bulkMarkPaid = async () => {
    if (selected.size === 0) return;
    setBulkLoading(true);
    try {
      const toUpdate = invoices.filter(i => selected.has(i.id) && i.status !== "paid");
      await Promise.all(toUpdate.map(inv => saveInvoice({ ...inv, status: "paid" })));
      const fresh = await getInvoices();
      setInvoices(fresh);
      setSelected(new Set());
    } finally {
      setBulkLoading(false);
    }
  };

  useEffect(() => {
    getInvoices().then(setInvoices);
    setMounted(true);
    const s = getSession();
    setIsSuperAdmin(s?.role === "super_admin");
  }, []);

  const now = new Date();
  const { fyLabel } = getFYBounds(now);

  const periodFiltered = invoices.filter((inv) => matchPeriod(inv.date, datePeriod, now, customFrom, customTo));

  const filtered = periodFiltered.filter((inv) => {
    const q = search.toLowerCase();
    const matchSearch = !q || inv.customer?.name?.toLowerCase().includes(q) || inv.invoiceNo.toLowerCase().includes(q);
    const matchFilter = filter === "all" || inv.type === filter || inv.status === filter;
    return matchSearch && matchFilter;
  });

  const paid    = periodFiltered.filter((i) => i.status === "paid");
  const due     = periodFiltered.filter((i) => i.status === "due");
  const partial = periodFiltered.filter((i) => i.status === "partial");
  const totalRevenue = paid.reduce((s, i) => s + i.total, 0);

  const typeTabs: { label: string; value: Filter }[] = [
    { label:"All",      value:"all"      },
    { label:"Air Intl", value:"air-intl" },
    { label:"Air Dom",  value:"air-dom"  },
    { label:"Train",    value:"train"    },
    { label:"Bus",      value:"bus"      },
    { label:"Hotel",    value:"hotel"    },
    { label:"Package",  value:"package"  },
    { label:"Visa",     value:"visa"     },
  ];

  const statusTabs: { label: string; value: Filter; count: number; dot: string; bg: string; text: string }[] = [
    { label:"Due",     value:"due",     count:due.length,     dot:"#EF4444", bg: dark?"rgba(239,68,68,0.15)":"#FEE2E2",  text: dark?"#FCA5A5":"#B91C1C" },
    { label:"Partial", value:"partial", count:partial.length, dot:"#F59E0B", bg: dark?"rgba(245,158,11,0.15)":"#FEF3C7", text: dark?"#FDE68A":"#B45309" },
    { label:"Paid",    value:"paid",    count:paid.length,    dot:"#22C55E", bg: dark?"rgba(34,197,94,0.15)":"#DCFCE7",  text: dark?"#86EFAC":"#15803D" },
  ];

  /* -- Theme tokens -- */
  const T = dark ? {
    text:       "#E6E1E5",
    textMuted:  "#938F99",
    textSub:    "#CAC4D0",
    primary:    "#90E0EF",
    cardBg:     "rgba(28,28,30,0.98)",
    cardBorder: "rgba(255,255,255,0.10)",
    divider:    "rgba(255,255,255,0.06)",
    shadow:     "0 4px 20px rgba(0,0,0,0.40)",
    tblHead:    "rgba(255,255,255,0.03)",
    rowHover:   "rgba(255,255,255,0.04)",
    searchBg:   "rgba(255,255,255,0.07)",
    searchBorder:"rgba(255,255,255,0.14)",
    chipInactive:"rgba(255,255,255,0.04)",
    footerBg:   "rgba(255,255,255,0.02)",
  } : {
    text:       "#1C1B1F",
    textMuted:  "#79747E",
    textSub:    "#49454F",
    primary:    "#0077B6",
    cardBg:     "rgba(255,255,255,0.88)",
    cardBorder: "rgba(255,255,255,0.65)",
    divider:    "rgba(0,119,182,0.08)",
    shadow:     "0 4px 20px rgba(0,119,182,0.07)",
    tblHead:    "#FAF7FF",
    rowHover:   "rgba(0,119,182,0.04)",
    searchBg:   "#FAF7FF",
    searchBorder:"#90E0EF",
    chipInactive:"transparent",
    footerBg:   "#FAF7FF",
  };

  const glass = { background: T.cardBg, backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:`1px solid ${T.cardBorder}`, boxShadow: T.shadow, transition:"background 0.3s ease" } as const;

  return (
    <div className="min-h-full" style={{ fontFamily: FONT }}>

      {/* -- STICKY HEADER -- */}
      <div className="sticky top-0 z-20 px-5 pt-4 pb-3">
        <div className="rounded-2xl px-5 py-3 flex items-center gap-4" style={glass}>
          <div className="min-w-0">
            <h1 className="font-bold text-lg leading-tight" style={{ color: T.text, letterSpacing:"-0.03em", fontFamily:"var(--font-roboto),Roboto,system-ui,sans-serif" }}>Invoices</h1>
            <p className="text-[12px] font-medium" style={{ color: T.textMuted }}>
              {periodFiltered.length} invoice{periodFiltered.length !== 1 ? "s" : ""}
              {datePeriod !== "all" && <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ background: dark?"rgba(0,119,182,0.2)":"rgba(0,119,182,0.10)", color: T.primary }}>
                {datePeriod === "today" ? "Today" : datePeriod === "week" ? "Last 7 days" : datePeriod === "month" ? "This month" : datePeriod === "custom" ? `${customFrom} -> ${customTo}` : fyLabel}
              </span>}
              {" · "}{due.length} due · {partial.length} partial
            </p>
          </div>
          <div className="flex-1 max-w-[300px] hidden md:block relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: T.textMuted }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customer or invoice #..."
              className="w-full pl-9 pr-8 py-2 rounded-xl text-[13px] focus:outline-none transition-all"
              style={{ background: T.searchBg, border:`1px solid ${T.searchBorder}`, color: T.text }}
              onFocus={e => { e.currentTarget.style.borderColor = dark?"rgba(208,188,255,0.5)":"rgba(0,119,182,0.4)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = T.searchBorder; }} />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: T.textMuted }}>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <button onClick={() => exportCSV(filtered)}
              className="flex items-center gap-1.5 text-[13px] font-semibold px-3 py-2.5 rounded-[12px] transition-all"
              style={{ background:dark?"rgba(255,255,255,0.07)":"#F3EFF6", color:dark?"#90E0EF":"#0077B6", border:`1px solid ${dark?"rgba(255,255,255,0.12)":"rgba(0,119,182,0.15)"}` }}
              title="Export current list to CSV">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <Link href="/admin/billing/invoices/new"
              className="flex items-center gap-2 text-[14px] font-semibold text-white px-4 py-2.5 rounded-[14px] transition-all hover:-translate-y-px"
              style={{ background:"linear-gradient(135deg,#0077B6,#0096C7)", boxShadow:"0 2px 8px rgba(0,119,182,0.35)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(0,119,182,0.50)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,119,182,0.35)"; }}>
              <Plus className="w-4 h-4" /> New Invoice
            </Link>
          </div>
        </div>
      </div>

      <div className="px-5 pb-6 space-y-4">

        {/* -- KPI CHIPS -- */}
        <motion.div className={`grid gap-4 ${isSuperAdmin ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-3"}`}
          initial="hidden" animate={mounted ? "show" : "hidden"}
          variants={{ show:{ transition:{ staggerChildren:0.07 } } }}>
          {[
            {
              label: "Total Invoices", value: periodFiltered.length, sub: `${invoices.length} all time`,
              icon: FileText, accent: dark?"#48CAE4":"#0077B6", tint: dark?"rgba(0,119,182,0.18)":"#EFF8FF",
            },
            {
              label: "Paid", value: paid.length,
              sub: isSuperAdmin ? `₹${formatINR(totalRevenue)} collected` : `${paid.length} invoice${paid.length!==1?"s":""}`,
              icon: CheckCircle, accent: dark?"#6EE7A6":"#15803D", tint: dark?"rgba(34,197,94,0.14)":"#DCFCE7",
            },
            {
              label: "Outstanding", value: due.length + partial.length,
              sub: `${due.length} due · ${partial.length} partial`,
              icon: AlertCircle, accent: dark?"#FCA5A5":"#B91C1C", tint: dark?"rgba(239,68,68,0.14)":"#FEE2E2",
            },
            ...(isSuperAdmin ? [{
              label: "Revenue (Paid)", value:`₹${formatINR(totalRevenue)}`,
              sub: `from ${paid.length} paid invoices`,
              icon: TrendingUp, accent: dark?"#93C5FD":"#1D4ED8", tint: dark?"rgba(29,78,216,0.18)":"#DBEAFE",
            }] : []),
          ].map((s) => (
            <motion.div key={s.label} variants={fadeUp} className="rounded-[20px] p-5 flex items-center gap-3.5" style={{ ...glass, position:"relative", overflow:"hidden" }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: s.tint }}>
                <s.icon className="w-5 h-5" style={{ color: s.accent }} />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: T.textMuted }}>{s.label}</div>
                <div className="font-bold text-[22px] tabular-nums leading-tight mt-0.5" style={{ color: T.text, letterSpacing:"-0.02em" }}>{s.value}</div>
                <div className="text-[11px] mt-0.5 truncate" style={{ color: T.textMuted }}>{s.sub}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* -- FILTER TABS -- */}
        <motion.div initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.2,duration:0.3 }}
          className="rounded-[20px]" style={{ ...glass, overflow:"visible" }}>
          {/* Mobile search */}
          <div className="md:hidden border-b relative" style={{ borderColor: T.divider }}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: T.textMuted }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoices..."
              className="w-full pl-11 pr-4 py-3.5 text-[14px] bg-transparent focus:outline-none" style={{ color: T.text }} />
          </div>

          {/* Date Period Row */}
          <div className="relative" style={{ borderBottom:`1px solid ${T.divider}`, borderRadius:"20px 20px 0 0" }}>
            <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto">
              {([
                { label:"All Time",    value:"all"   as DatePeriod },
                { label:"Today",       value:"today"  as DatePeriod },
                { label:"Last 7 Days", value:"week"   as DatePeriod },
                { label:"This Month",  value:"month"  as DatePeriod },
                { label: fyLabel,      value:"fy"     as DatePeriod },
              ]).map((p) => {
                const active = datePeriod === p.value;
                return (
                  <button key={p.value} onClick={() => { setDatePeriod(p.value); setShowCalendar(false); }}
                    className="px-4 py-1.5 rounded-xl text-[13px] font-semibold transition-all whitespace-nowrap"
                    style={{
                      background: active ? (dark?"#0096C7":"#0077B6") : (dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)"),
                      color: active ? "#ffffff" : T.textMuted,
                      border: "none",
                      boxShadow: active ? "0 2px 8px rgba(0,119,182,0.30)" : "none",
                    }}>
                    {p.label}
                  </button>
                );
              })}
              {/* Custom Range button */}
              <button ref={calBtnRef}
                onClick={() => {
                  if (calBtnRef.current) {
                    const r = calBtnRef.current.getBoundingClientRect();
                    setCalPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
                  }
                  setShowCalendar(v => !v);
                  setDatePeriod("custom");
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[13px] font-semibold transition-all whitespace-nowrap shrink-0"
                style={{
                  background: datePeriod === "custom" ? (dark?"#0096C7":"#0077B6") : (dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.04)"),
                  color: datePeriod === "custom" ? "#ffffff" : T.textMuted,
                  border: "none",
                  boxShadow: datePeriod === "custom" ? "0 2px 8px rgba(0,119,182,0.30)" : "none",
                }}>
                <Calendar className="w-3 h-3" />
                {datePeriod === "custom" && customFrom && customTo
                  ? `${customFrom} -> ${customTo}`
                  : "Custom Range"}
              </button>
              {datePeriod !== "all" && (
                <button onClick={() => { setDatePeriod("all"); setCustomFrom(""); setCustomTo(""); setShowCalendar(false); }}
                  className="ml-auto shrink-0 p-1 rounded-lg" style={{ color: T.textMuted }}>
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            {/* Calendar portal — renders at body level to escape stacking context */}
          </div>

          {/* Type + Status Row — single scrollable row */}
          <div className="flex items-center gap-1.5 px-4 py-3 overflow-x-auto" style={{ borderRadius:"0 0 20px 20px" }}>
            {typeTabs.map((t) => {
              const tc = TYPE_CONFIG[t.value as string];
              const active = filter === t.value;
              return (
                <button key={t.value} onClick={() => setFilter(t.value)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all whitespace-nowrap"
                  style={{
                    background: active ? (tc ? (dark ? tc.darkBg : tc.bg) : (dark?"rgba(0,119,182,0.20)":"#EFF8FF")) : "transparent",
                    color: active ? (tc ? (dark ? tc.darkColor : tc.color) : T.primary) : T.textMuted,
                    border: active ? `1.5px solid ${tc ? (dark ? tc.darkColor+"50" : tc.color+"30") : "rgba(0,119,182,0.30)"}` : "1.5px solid transparent",
                    boxShadow: active ? (dark?"0 2px 10px rgba(0,0,0,0.25)":"0 2px 8px rgba(0,0,0,0.08)") : "none",
                  }}>
                  {tc && <tc.icon className="w-3 h-3" />}
                  {t.label}
                </button>
              );
            })}
            <div className="w-px h-4 mx-1 shrink-0" style={{ background: T.divider }} />
            {statusTabs.map((t) => {
              const active = filter === t.value;
              return (
                <button key={t.value} onClick={() => setFilter(t.value)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all whitespace-nowrap"
                  style={{
                    background: active ? t.bg : "transparent",
                    color: active ? t.text : T.textMuted,
                    border: active ? `1.5px solid ${t.dot}40` : "1.5px solid transparent",
                    boxShadow: active ? `0 2px 8px ${t.dot}25` : "none",
                  }}>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: active ? t.dot : T.textMuted, boxShadow: active ? `0 0 5px ${t.dot}` : "none" }} />
                  {t.label}
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black" style={{ background: active ? (dark?"rgba(0,0,0,0.2)":"rgba(0,0,0,0.10)") : (dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.05)"), color: active ? t.text : T.textMuted }}>{t.count}</span>
                </button>
              );
            })}
            {filter !== "all" && (
              <button onClick={() => setFilter("all")} className="ml-auto shrink-0 p-1.5 rounded-lg" style={{ color: T.textMuted }}>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Calendar portal — at body level, escapes all stacking contexts */}
        {showCalendar && typeof window !== "undefined" && createPortal(
          <div style={{ position:"fixed", top: calPos.top, right: calPos.right, zIndex: 999999 }}>
            <DateRangePicker
              from={customFrom} to={customTo} dark={dark}
              onApply={(f, t) => { setCustomFrom(f); setCustomTo(t); setDatePeriod("custom"); setShowCalendar(false); }}
              onClose={() => { setShowCalendar(false); if (datePeriod === "custom" && !customFrom) setDatePeriod("all"); }}
            />
          </div>,
          document.body
        )}

        {/* -- BULK ACTION BAR -- */}
        {selected.size !== 0 && (
          <motion.div initial={{ opacity:0,y:-8 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.25 }}
            className="rounded-[16px] px-4 py-3 flex items-center gap-3"
            style={{ background:dark?"rgba(0,119,182,0.18)":"#DBEAFE", border:`1px solid ${dark?"rgba(0,119,182,0.35)":"rgba(0,119,182,0.30)"}` }}>
            <span className="text-[13px] font-bold" style={{ color:dark?"#90E0EF":"#1D4ED8" }}>{selected.size} selected</span>
            <div className="flex-1" />
            <button onClick={() => setSelected(new Set())} className="text-[12px] font-semibold px-3 py-1.5 rounded-lg"
              style={{ color:dark?"#90E0EF":"#1D4ED8" }}>
              Clear
            </button>
            <button onClick={bulkMarkPaid} disabled={bulkLoading}
              className="flex items-center gap-1.5 text-[13px] font-bold px-4 py-1.5 rounded-[10px] text-white transition-all disabled:opacity-50"
              style={{ background:"linear-gradient(135deg,#16A34A,#15803D)", boxShadow:"0 2px 8px rgba(22,163,74,0.35)" }}>
              <CheckCircle className="w-3.5 h-3.5" />
              {bulkLoading ? "Marking..." : "Mark as Paid"}
            </button>
          </motion.div>
        )}

        {/* -- TABLE -- */}
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="rounded-[20px] py-16 text-center flex flex-col items-center gap-3" style={glass}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: dark?"rgba(0,119,182,0.15)":"rgba(0,119,182,0.08)" }}>
              <FileText className="w-7 h-7" style={{ color: T.primary }} />
            </div>
            <div>
              <p className="text-[15px] font-bold" style={{ color: T.text }}>
                {search ? `No results for "${search}"` : datePeriod !== "all" ? "No invoices in this period" : "No invoices yet"}
              </p>
              <p className="text-[13px] mt-1" style={{ color: T.textMuted }}>
                {search ? "Try a different name or invoice number" : datePeriod !== "all" ? "Try a different date range" : "Create your first invoice to get started"}
              </p>
            </div>
            {!search && datePeriod === "all" && (
              <Link href="/admin/billing/invoices/new"
                className="inline-flex items-center gap-1.5 text-[13px] font-bold text-white px-4 py-2 rounded-xl mt-1"
                style={{ background:"linear-gradient(135deg,#0077B6,#0096C7)", boxShadow:"0 4px 14px rgba(0,119,182,0.35)" }}>
                <Plus className="w-3.5 h-3.5" /> Create Invoice
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.25 }}
            className="rounded-[20px] overflow-hidden" style={glass}>
            {/* Header */}
            <div className="grid px-5 py-3 text-[11px] font-bold uppercase items-center"
              style={{ gridTemplateColumns:"28px 1.4fr 1.8fr 1.1fr 0.9fr 1fr 90px 36px", background: T.tblHead, borderBottom:`1px solid ${T.divider}`, color: T.primary, letterSpacing:"0.06em" }}>
              <div onClick={toggleSelectAll} className="cursor-pointer w-4 h-4 rounded border-2 flex items-center justify-center"
                style={{ borderColor: T.primary, background: selected.size !== 0 ? (dark?"#0096C7":"#0077B6") : "transparent" }}>
                {selected.size !== 0 && <span className="text-white text-[8px] font-black">&#10003;</span>}
              </div>
              <span>Invoice</span>
              <span>Customer</span>
              <span className="hidden md:block">Type</span>
              <span className="hidden md:block">Date</span>
              <span className="text-right">Amount</span>
              <span className="text-center">Status</span>
              <span></span>
            </div>

            {/* Rows */}
            {filtered.map((inv, idx) => {
              const tc = TYPE_CONFIG[inv.type] || TYPE_CONFIG.other;
              const Icon = tc.icon;
              const paidAmt = (inv.payments || []).reduce((s, p) => s + p.amount, 0);
              const invDays = Math.floor((new Date().getTime() - new Date(inv.date).getTime()) / 86400000);
              const isOverdue = inv.status !== "paid" && invDays > 30;
              const sc = dark
                ? { paid:{bg:"rgba(34,197,94,0.15)",text:"#86EFAC",dot:"#22C55E"}, partial:{bg:"rgba(245,158,11,0.15)",text:"#FDE68A",dot:"#F59E0B"}, due:{bg:"rgba(239,68,68,0.15)",text:"#FCA5A5",dot:"#EF4444"} }[inv.status]
                : { paid:{bg:"#DCFCE7",text:"#15803D",dot:"#22C55E"}, partial:{bg:"#FEF3C7",text:"#B45309",dot:"#F59E0B"}, due:{bg:"#FEE2E2",text:"#B91C1C",dot:"#EF4444"} }[inv.status];
              return (
                <motion.div key={inv.id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.05*Math.min(idx,8) }}>
                  <Link href={`/admin/billing/invoices/${inv.id}`}
                    className="grid items-center px-5 py-4 group transition-colors"
                    style={{ gridTemplateColumns:"28px 1.4fr 1.8fr 1.1fr 0.9fr 1fr 90px 36px", borderBottom:`1px solid ${T.divider}` }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = T.rowHover; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                    {inv.status !== "paid" ? (
                      <div onClick={e => { e.preventDefault(); e.stopPropagation(); toggleSelect(inv.id); }}
                        className="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 cursor-pointer"
                        style={{ borderColor: selected.has(inv.id) ? (dark?"#0096C7":"#0077B6") : T.textMuted, background: selected.has(inv.id) ? (dark?"#0096C7":"#0077B6") : "transparent" }}>
                        {selected.has(inv.id) && <span className="text-white text-[8px] font-black">&#10003;</span>}
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 opacity-30"
                        style={{ borderColor: T.textMuted }}>
                        <span className="text-[8px] font-black" style={{ color: T.textMuted }}>&#10003;</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                        style={{ background: dark ? tc.darkBg : tc.bg }}>
                        <Icon className="w-3.5 h-3.5" style={{ color: dark ? tc.darkColor : tc.color }} />
                      </div>
                      <span className="font-mono text-[12px] font-bold" style={{ color: T.primary }}>{inv.invoiceNo}</span>
                    </div>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar name={inv.customer?.name || "?"} />
                      <div className="min-w-0">
                        <div className="font-semibold text-[14px] truncate" style={{ color: T.text }}>{inv.customer?.name}</div>
                        {inv.customer?.city && <div className="text-[12px] font-medium truncate" style={{ color: T.textMuted }}>{inv.customer.city}</div>}
                      </div>
                    </div>
                    <span className="hidden md:inline-flex items-center gap-1.5 text-[12px] font-bold px-2.5 py-1 rounded-xl w-fit"
                      style={{ background: dark ? tc.darkBg : tc.bg, color: dark ? tc.darkColor : tc.color }}>
                      <Icon className="w-3 h-3" />{tc.short}
                    </span>
                    <div className="hidden md:flex flex-col gap-0.5">
                      <span className="text-[13px] font-medium" style={{ color: T.textMuted }}>{fmtDate(inv.date)}</span>
                      {isOverdue && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full w-fit"
                          style={{ background: dark?"rgba(239,68,68,0.18)":"#FEE2E2", color: dark?"#FCA5A5":"#B91C1C" }}>
                          {invDays}d overdue
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[14px] tabular-nums" style={{ color: T.text, letterSpacing:"-0.015em" }}>₹{formatINR(inv.total)}</div>
                      {inv.status === "partial" && (
                        <div className="text-[12px] font-semibold tabular-nums mt-0.5" style={{ color: dark?"#FDE68A":"#B45309" }}>₹{formatINR(paidAmt)} paid</div>
                      )}
                    </div>
                    <div className="flex justify-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full"
                        style={{ background: sc.bg, color: sc.text, letterSpacing:"0.04em" }}>
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: sc.dot }} />
                        {inv.status}
                      </span>
                    </div>
                    {(() => {
                      const phone = inv.customer?.mobile || inv.customer?.phone;
                      if (!phone) return <div />;
                      const bal = inv.total - paidAmt;
                      const msg = `Dear ${inv.customer?.name},\n\nReminder for Invoice ${inv.invoiceNo}.\nBalance Due: Rs.${formatINR(bal)}\n\nVimal Travels: 9886114440`;
                      const url = `https://wa.me/91${phone.replace(/\D/g,"").slice(-10)}?text=${encodeURIComponent(msg)}`;
                      return (
                        <a href={url} target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                          style={{ background: dark?"rgba(37,211,102,0.13)":"#DCFCE7", color:"#15803D" }}
                          title="Send WhatsApp reminder">
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      );
                    })()}
                  </Link>
                </motion.div>
              );
            })}

            {/* Footer */}
            <div className="px-5 py-3 flex items-center justify-between flex-wrap gap-2" style={{ borderTop:`1px solid ${T.divider}`, background: T.footerBg }}>
              <span className="text-[12px] font-medium" style={{ color: T.textMuted }}>
                {filtered.length} of {periodFiltered.length} invoice{periodFiltered.length !== 1 ? "s" : ""}
                {datePeriod !== "all" && <span className="ml-1.5 font-semibold" style={{ color: T.primary }}>({datePeriod === "today" ? "Today" : datePeriod === "week" ? "Last 7 days" : datePeriod === "month" ? "This month" : datePeriod === "custom" ? `${customFrom}->${customTo}` : fyLabel})</span>}
              </span>
              {filtered.length > 0 && isSuperAdmin && (() => {
                const tot = filtered.reduce((s, i) => s + i.total, 0);
                const col = filtered.reduce((s, i) => s + (i.payments||[]).reduce((ps,p)=>ps+p.amount,0), 0);
                return (
                  <div className="flex items-center gap-3 text-[12px] font-semibold">
                    <span style={{ color: dark?"#86EFAC":"#15803D" }}>Collected ₹{formatINR(col)}</span>
                    <span style={{ color: T.textMuted }}>·</span>
                    <span style={{ color: T.primary }}>Total ₹{formatINR(tot)}</span>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function exportCSV(invoices: Invoice[]) {
  const headers = ["Invoice No","Date","Customer","Mobile","Service","Status","Total","Paid","Balance","GST Type","CGST","SGST","IGST"];
  const rows = invoices.map(inv => {
    const paid = (inv.payments || []).reduce((s, p) => s + p.amount, 0);
    return [
      inv.invoiceNo,
      inv.date,
      inv.customer?.name || "",
      inv.customer?.mobile || inv.customer?.phone || "",
      inv.type,
      inv.status,
      inv.total,
      paid,
      inv.total - paid,
      inv.gstType || "",
      inv.cgst || 0,
      inv.sgst || 0,
      inv.igst || 0,
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(",");
  });
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `vimal-travels-invoices-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function InvoicesPage() {
  return (
    <Suspense fallback={null}>
      <InvoicesPageContent />
    </Suspense>
  );
}
