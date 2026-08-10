"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  getInvoices, formatINR, fmtDate,
  type Invoice, type InvoiceType, type InvoiceStatus, TYPE_LABEL,
} from "@/lib/billing";
import { Plus, Search, FileText, Plane, Package, FileCheck, Train, Bus, Hotel, TrendingUp, CheckCircle, AlertCircle, X, ChevronRight } from "lucide-react";

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; dot: string; text: string; bg: string }> = {
  paid:    { label: "Paid",    dot: "#22C55E", text: "#15803D", bg: "#DCFCE7" },
  partial: { label: "Partial", dot: "#F59E0B", text: "#B45309", bg: "#FEF3C7" },
  due:     { label: "Due",     dot: "#EF4444", text: "#B91C1C", bg: "#FEE2E2" },
};

const TYPE_CONFIG: Record<string, { icon: any; bg: string; color: string; short: string }> = {
  "air-intl": { icon: Plane,     bg: "#DBEAFE", color: "#1D4ED8", short: "Intl Air"  },
  "air-dom":  { icon: Plane,     bg: "#EDE9FE", color: "#6D28D9", short: "Dom Air"   },
  train:      { icon: Train,     bg: "#D1FAE5", color: "#047857", short: "Train"     },
  bus:        { icon: Bus,       bg: "#FEF3C7", color: "#B45309", short: "Bus"       },
  hotel:      { icon: Hotel,     bg: "#CFFAFE", color: "#0E7490", short: "Hotel"     },
  package:    { icon: Package,   bg: "#FCE7F3", color: "#BE185D", short: "Package"   },
  visa:       { icon: FileCheck, bg: "#E0F2FE", color: "#0369A1", short: "Visa"      },
  other:      { icon: FileText,  bg: "#F1F5F9", color: "#475569", short: "Other"     },
};

type Filter = "all" | InvoiceType | InvoiceStatus;

function Avatar({ name }: { name: string }) {
  const hue = Array.from(name).reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold text-white select-none"
      style={{ background: `hsl(${hue},52%,44%)` }}>
      {initials}
    </div>
  );
}

const glass = {
  background: "rgba(255,255,255,0.88)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.70)",
  boxShadow: "0 4px 20px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.03)",
} as const;

const card = {
  background: "#FFFFFF",
  border: "1px solid #F1F5F9",
  boxShadow: "0 2px 12px rgba(15,23,42,0.05)",
} as const;

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState<Filter>("all");
  const [mounted,  setMounted]  = useState(false);

  useEffect(() => { getInvoices().then(setInvoices); setMounted(true); }, []);

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase();
    const matchSearch =
      inv.customer?.name?.toLowerCase().includes(q) ||
      inv.invoiceNo.toLowerCase().includes(q);
    const matchFilter = filter === "all" || inv.type === filter || inv.status === filter;
    return matchSearch && matchFilter;
  });

  const paid    = invoices.filter((i) => i.status === "paid");
  const due     = invoices.filter((i) => i.status === "due");
  const partial = invoices.filter((i) => i.status === "partial");
  const totalRevenue = paid.reduce((s, i) => s + i.total, 0);

  const typeTabs: { label: string; value: Filter }[] = [
    { label: "All",       value: "all"      },
    { label: "Air Intl",  value: "air-intl" },
    { label: "Air Dom",   value: "air-dom"  },
    { label: "Train",     value: "train"    },
    { label: "Bus",       value: "bus"      },
    { label: "Hotel",     value: "hotel"    },
    { label: "Package",   value: "package"  },
    { label: "Visa",      value: "visa"     },
  ];

  const statusTabs: { label: string; value: Filter; count: number; dot: string }[] = [
    { label: "Due",     value: "due",     count: due.length,     dot: "#EF4444" },
    { label: "Partial", value: "partial", count: partial.length, dot: "#F59E0B" },
    { label: "Paid",    value: "paid",    count: paid.length,    dot: "#22C55E" },
  ];

  return (
    <div className="min-h-full" style={{ fontFamily: "Inter,system-ui,sans-serif" }}>

      {/* ── STICKY GLASS HEADER ── */}
      <div className="sticky top-0 z-20 px-5 pt-4 pb-3">
        <div className="rounded-2xl px-5 py-3 flex items-center gap-4" style={glass}>
          <div className="min-w-0">
            <h1 className="font-bold text-lg leading-tight" style={{ color: "#0F172A", letterSpacing: "-0.03em" }}>
              Invoices
            </h1>
            <p className="text-[11px] font-medium" style={{ color: "#94A3B8" }}>
              {invoices.length} total · {due.length} due · {partial.length} partial
            </p>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-[300px] hidden md:block relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#94A3B8" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer or invoice #…"
              className="w-full pl-9 pr-8 py-2 rounded-xl text-[13px] focus:outline-none transition-all"
              style={{ background: "#F1F5F9", border: "1px solid #E2E8F0", color: "#0F172A" }}
              onFocus={e => { e.currentTarget.style.borderColor = "#93C5FD"; e.currentTarget.style.background = "#EFF6FF"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.background = "#F1F5F9"; }}
            />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#94A3B8" }}>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="ml-auto shrink-0">
            <Link
              href="/admin/billing/invoices/new"
              className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2.5 rounded-[14px] transition-all hover:-translate-y-px"
              style={{ background: "#2563EB", boxShadow: "0 2px 8px rgba(37,99,235,0.30)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(37,99,235,0.40)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(37,99,235,0.30)"; }}
            >
              <Plus className="w-4 h-4" /> New Invoice
            </Link>
          </div>
        </div>
      </div>

      <div className="px-5 pb-6 space-y-4">

        {/* ── KPI CHIPS ── */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          initial="hidden"
          animate={mounted ? "show" : "hidden"}
          variants={{ show: { transition: { staggerChildren: 0.07 } } }}
        >
          {[
            { label: "Total Invoices",   value: invoices.length,                icon: FileText,    color: "#2563EB", bg: "#EFF6FF" },
            { label: "Paid",             value: paid.length,                    icon: CheckCircle, color: "#15803D", bg: "#DCFCE7" },
            { label: "Outstanding",      value: due.length + partial.length,    icon: AlertCircle, color: "#B91C1C", bg: "#FEE2E2" },
            { label: "Revenue (Paid)",   value: `₹${formatINR(totalRevenue)}`,  icon: TrendingUp,  color: "#7C3AED", bg: "#F5F3FF" },
          ].map((s) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              className="rounded-[20px] p-4 flex items-center gap-3.5"
              style={card}
            >
              <div className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0"
                style={{ background: s.bg }}>
                <s.icon className="w-4.5 h-4.5" style={{ color: s.color }} />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.08em]" style={{ color: "#94A3B8" }}>{s.label}</div>
                <div className="font-bold text-[18px] tabular-nums leading-tight mt-0.5" style={{ color: "#0F172A", letterSpacing: "-0.02em" }}>
                  {s.value}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── FILTER CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="rounded-[20px] overflow-hidden"
          style={card}
        >
          {/* Mobile search */}
          <div className="md:hidden border-b border-slate-100 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#94A3B8" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoices…"
              className="w-full pl-11 pr-4 py-3.5 text-sm bg-transparent focus:outline-none"
              style={{ color: "#0F172A" }}
            />
          </div>

          {/* Type tabs */}
          <div className="flex items-center gap-1 px-3 py-2.5 border-b overflow-x-auto" style={{ borderColor: "#F8FAFC" }}>
            {typeTabs.map((t) => {
              const tc = TYPE_CONFIG[t.value as string];
              const active = filter === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => setFilter(t.value)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
                  style={{
                    background: active ? (tc ? tc.bg : "#EFF6FF") : "transparent",
                    color: active ? (tc ? tc.color : "#1D4ED8") : "#94A3B8",
                    border: active ? `1px solid ${tc ? tc.color + "25" : "#BFDBFE"}` : "1px solid transparent",
                  }}
                >
                  {tc && <tc.icon className="w-3 h-3" />}
                  {t.label}
                </button>
              );
            })}
            <div className="w-px h-4 mx-1 shrink-0" style={{ background: "#E2E8F0" }} />
            {statusTabs.map((t) => {
              const active = filter === t.value;
              const sc = STATUS_CONFIG[t.value as InvoiceStatus];
              return (
                <button
                  key={t.value}
                  onClick={() => setFilter(t.value)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
                  style={{
                    background: active ? sc.bg : "transparent",
                    color: active ? sc.text : "#94A3B8",
                    border: active ? `1px solid ${t.dot}25` : "1px solid transparent",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: t.dot }} />
                  {t.label}
                  <span className="ml-0.5 opacity-60">({t.count})</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ── TABLE ── */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="rounded-[20px] py-20 text-center"
            style={card}
          >
            <FileText className="w-10 h-10 mx-auto mb-3" style={{ color: "#E2E8F0" }} />
            <p className="text-sm font-semibold" style={{ color: "#94A3B8" }}>
              {search ? "No matching invoices" : "No invoices yet"}
            </p>
            {!search && (
              <Link href="/admin/billing/invoices/new"
                className="inline-flex items-center gap-1.5 text-sm mt-2.5 font-bold" style={{ color: "#2563EB" }}>
                <Plus className="w-3.5 h-3.5" /> Create first invoice
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-[20px] overflow-hidden"
            style={card}
          >
            {/* Table header */}
            <div
              className="grid px-5 py-2.5 text-[10px] font-bold uppercase"
              style={{
                gridTemplateColumns: "1.4fr 1.8fr 1.1fr 0.9fr 1fr 90px",
                background: "#F8FAFC",
                borderBottom: "1px solid #F1F5F9",
                color: "#94A3B8",
                letterSpacing: "0.06em",
              }}
            >
              <span>Invoice</span>
              <span>Customer</span>
              <span className="hidden md:block">Type</span>
              <span className="hidden md:block">Date</span>
              <span className="text-right">Amount</span>
              <span className="text-center">Status</span>
            </div>

            {/* Rows */}
            {filtered.map((inv, idx) => {
              const tc = TYPE_CONFIG[inv.type] || TYPE_CONFIG.other;
              const Icon = tc.icon;
              const paidAmt = (inv.payments || []).reduce((s, p) => s + p.amount, 0);
              const sc = STATUS_CONFIG[inv.status];
              return (
                <motion.div
                  key={inv.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.05 * Math.min(idx, 8) }}
                >
                  <Link
                    href={`/admin/billing/invoices/${inv.id}`}
                    className="grid items-center px-5 py-4 group transition-colors"
                    style={{
                      gridTemplateColumns: "1.4fr 1.8fr 1.1fr 0.9fr 1fr 90px",
                      borderBottom: "1px solid #F8FAFC",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(37,99,235,0.025)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    {/* Invoice # */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0"
                        style={{ background: tc.bg }}>
                        <Icon className="w-3.5 h-3.5" style={{ color: tc.color }} />
                      </div>
                      <span className="font-mono text-xs font-bold transition-colors group-hover:text-blue-700"
                        style={{ color: "#2563EB" }}>
                        {inv.invoiceNo}
                      </span>
                    </div>

                    {/* Customer */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar name={inv.customer?.name || "?"} />
                      <div className="min-w-0">
                        <div className="font-semibold text-[13px] truncate transition-colors group-hover:text-blue-600"
                          style={{ color: "#0F172A" }}>
                          {inv.customer?.name}
                        </div>
                        {inv.customer?.city && (
                          <div className="text-[11px] font-medium truncate" style={{ color: "#94A3B8" }}>
                            {inv.customer.city}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Type */}
                    <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg w-fit"
                      style={{ background: tc.bg, color: tc.color }}>
                      <Icon className="w-3 h-3" />
                      {tc.short}
                    </span>

                    {/* Date */}
                    <span className="text-[12px] font-medium hidden md:block" style={{ color: "#94A3B8" }}>
                      {fmtDate(inv.date)}
                    </span>

                    {/* Amount */}
                    <div className="text-right">
                      <div className="font-bold text-[13px] tabular-nums" style={{ color: "#0F172A", letterSpacing: "-0.015em" }}>
                        ₹{formatINR(inv.total)}
                      </div>
                      {inv.status === "partial" && (
                        <div className="text-[11px] font-semibold tabular-nums mt-0.5" style={{ color: "#B45309" }}>
                          ₹{formatINR(paidAmt)} paid
                        </div>
                      )}
                    </div>

                    {/* Status */}
                    <div className="flex justify-center">
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase px-2.5 py-1 rounded-full"
                        style={{ background: sc.bg, color: sc.text, letterSpacing: "0.04em" }}>
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: sc.dot }} />
                        {sc.label}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}

            {/* Footer */}
            <div className="px-5 py-3 flex items-center justify-between"
              style={{ borderTop: "1px solid #F1F5F9", background: "#FAFBFC" }}>
              <span className="text-[11px] font-medium" style={{ color: "#94A3B8" }}>
                {filtered.length} of {invoices.length} invoices
              </span>
              {filtered.length > 0 && (
                <span className="text-[11px] font-bold" style={{ color: "#1E3A8A" }}>
                  Total: ₹{formatINR(filtered.reduce((s, i) => s + i.total, 0))}
                </span>
              )}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
