"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Download, FileText, BarChart2, TrendingUp } from "lucide-react";
import { getInvoices, formatINR, type Invoice } from "@/lib/billing";
import { useAdminDark } from "@/lib/useAdminDark";
import { getSession } from "@/lib/auth";

const FONT = "var(--font-roboto), Roboto, system-ui, sans-serif";

const TYPE_LABELS: Record<string, string> = {
  "air-intl":"Intl Air", "air-dom":"Dom Air",
  train:"Train", bus:"Bus", hotel:"Hotel",
  package:"Package", visa:"Visa", other:"Other",
};

interface MonthRow {
  key: string;
  label: string;
  month: number;
  year: number;
  invoices: number;
  revenue: number;
  paid: number;
  outstanding: number;
  cgst: number;
  sgst: number;
  igst: number;
  gstTotal: number;
  taxableAmt: number;
}

interface ServiceRow {
  type: string;
  label: string;
  invoiceCount: number;
  revenue: number;
  paid: number;
  outstanding: number;
}

function buildMonths(invoices: Invoice[]): MonthRow[] {
  const map = new Map<string, MonthRow>();
  for (const inv of invoices) {
    const d = new Date(inv.date);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    const label = d.toLocaleString("en-IN", { month: "long", year: "numeric" });
    const paidAmt = (inv.payments || []).reduce((s: number, p: {amount:number}) => s + p.amount, 0);
    const ex = map.get(key) || { key, label, month: d.getMonth()+1, year: d.getFullYear(), invoices:0, revenue:0, paid:0, outstanding:0, cgst:0, sgst:0, igst:0, gstTotal:0, taxableAmt:0 };
    ex.invoices++;
    ex.revenue     += inv.total;
    ex.paid        += paidAmt;
    ex.outstanding += inv.total - paidAmt;
    ex.cgst        += inv.cgst  || 0;
    ex.sgst        += inv.sgst  || 0;
    ex.igst        += inv.igst  || 0;
    ex.gstTotal    += (inv.cgst||0) + (inv.sgst||0) + (inv.igst||0);
    ex.taxableAmt  += inv.taxableAmount || inv.serviceCharge || 0;
    map.set(key, ex);
  }
  return Array.from(map.values()).sort((a,b) => (b.year*100+b.month)-(a.year*100+a.month));
}

function buildServices(invoices: Invoice[]): ServiceRow[] {
  const map = new Map<string, ServiceRow>();
  for (const inv of invoices) {
    const type = inv.type || "other";
    const paidAmt = (inv.payments || []).reduce((s: number, p: {amount:number}) => s + p.amount, 0);
    const ex = map.get(type) || { type, label: TYPE_LABELS[type]||type, invoiceCount:0, revenue:0, paid:0, outstanding:0 };
    ex.invoiceCount++;
    ex.revenue     += inv.total;
    ex.paid        += paidAmt;
    ex.outstanding += inv.total - paidAmt;
    map.set(type, ex);
  }
  return Array.from(map.values()).sort((a,b) => b.revenue-a.revenue);
}

function exportCSV(rows: MonthRow[], services: ServiceRow[], view: string) {
  let headers: string[], data: string[][];
  if (view === "gst") {
    headers = ["Month","Invoices","Taxable Amt","CGST 9%","SGST 9%","IGST 18%","Total GST"];
    data = rows.map(r => [r.label, String(r.invoices), r.taxableAmt.toFixed(2), r.cgst.toFixed(2), r.sgst.toFixed(2), r.igst.toFixed(2), r.gstTotal.toFixed(2)]);
  } else if (view === "service") {
    headers = ["Service","Invoices","Revenue","Collected","Outstanding","Collection %"];
    data = services.map(r => [r.label, String(r.invoiceCount), r.revenue.toFixed(2), r.paid.toFixed(2), r.outstanding.toFixed(2), r.revenue>0?`${Math.round((r.paid/r.revenue)*100)}%`:"0%"]);
  } else {
    headers = ["Month","Invoices","Total Revenue","Collected","Outstanding"];
    data = rows.map(r => [r.label, String(r.invoices), r.revenue.toFixed(2), r.paid.toFixed(2), r.outstanding.toFixed(2)]);
  }
  const csv = [headers, ...data].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type:"text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `vimal-${view}-report-${new Date().toISOString().slice(0,10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

type View = "revenue" | "gst" | "service";

export default function ReportsPage() {
  const dark = useAdminDark();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [mounted,  setMounted]  = useState(false);
  const [isSuper,  setIsSuper]  = useState(false);
  const [view,     setView]     = useState<View>("revenue");

  useEffect(() => {
    getInvoices().then(setInvoices);
    setMounted(true);
    const s = getSession();
    setIsSuper(s?.role === "super_admin");
  }, []);

  const T = dark ? {
    text:"#E6E1E5", textMuted:"#938F99", textSub:"#CAC4D0" as string,
    cardBg:"rgba(28,28,30,0.95)", cardBorder:"rgba(255,255,255,0.10)",
    cardShadow:"0 4px 20px rgba(0,0,0,0.40)", divider:"rgba(255,255,255,0.06)",
    tblHead:"rgba(255,255,255,0.03)", rowHover:"rgba(255,255,255,0.04)",
  } : {
    text:"#1C1B1F", textMuted:"#79747E", textSub:"#49454F" as string,
    cardBg:"rgba(255,255,255,0.85)", cardBorder:"rgba(255,255,255,0.65)",
    cardShadow:"0 4px 20px rgba(0,119,182,0.06)", divider:"rgba(0,119,182,0.08)",
    tblHead:"rgba(0,119,182,0.04)", rowHover:"rgba(0,119,182,0.04)",
  };
  const glass = { background:T.cardBg, backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:`1px solid ${T.cardBorder}`, boxShadow:T.cardShadow };

  const months   = buildMonths(invoices);
  const services = buildServices(invoices);

  const totRevenue     = months.reduce((s,m) => s+m.revenue, 0);
  const totPaid        = months.reduce((s,m) => s+m.paid, 0);
  const totOutstanding = months.reduce((s,m) => s+m.outstanding, 0);
  const totGST         = months.reduce((s,m) => s+m.gstTotal, 0);
  const totCGST        = months.reduce((s,m) => s+m.cgst, 0);
  const totSGST        = months.reduce((s,m) => s+m.sgst, 0);
  const totIGST        = months.reduce((s,m) => s+m.igst, 0);
  const totTaxable     = months.reduce((s,m) => s+m.taxableAmt, 0);

  if (!mounted) return null;

  if (!isSuper) return (
    <div className="min-h-full flex items-center justify-center" style={{ fontFamily:FONT }}>
      <div className="text-center">
        <p className="text-lg font-bold" style={{ color:T.text }}>Super Admin Only</p>
        <Link href="/admin/billing" className="text-sm mt-2 inline-block" style={{ color:"#0077B6" }}>Back</Link>
      </div>
    </div>
  );

  const TILES: { id: View; label: string; value: string; sub: string; color: string; bg: string; border: string }[] = [
    {
      id: "revenue",
      label: "Total Billed",
      value: `Rs.${formatINR(totRevenue)}`,
      sub: `Rs.${formatINR(totPaid)} collected`,
      color: dark?"#90E0EF":"#0077B6",
      bg:    dark?"rgba(144,224,239,0.10)":"rgba(0,119,182,0.07)",
      border:dark?"rgba(144,224,239,0.25)":"rgba(0,119,182,0.22)",
    },
    {
      id: "gst",
      label: "Total GST",
      value: totGST > 0 ? `Rs.${formatINR(totGST)}` : "--",
      sub: `CGST ${totCGST>0?`Rs.${formatINR(totCGST)}`:"--"} + SGST ${totSGST>0?`Rs.${formatINR(totSGST)}`:"--"}`,
      color: dark?"#C4AAFF":"#7C3AED",
      bg:    dark?"rgba(196,170,255,0.10)":"#FAF5FF",
      border:dark?"rgba(196,170,255,0.25)":"rgba(124,58,237,0.20)",
    },
    {
      id: "service",
      label: "Service Breakdown",
      value: `${services.length} types`,
      sub: services[0] ? `Top: ${services[0].label}` : "No data",
      color: dark?"#6EE7B7":"#047857",
      bg:    dark?"rgba(110,231,183,0.10)":"#F0FDF4",
      border:dark?"rgba(110,231,183,0.25)":"rgba(4,120,87,0.20)",
    },
  ];

  return (
    <div className="min-h-full" style={{ fontFamily:FONT }}>
      {/* Header */}
      <div className="sticky top-0 z-20 px-5 pt-4 pb-3">
        <div className="rounded-2xl px-5 py-3 flex items-center gap-4" style={glass}>
          <Link href="/admin/billing" className="p-2 rounded-xl transition-colors" style={{ color:T.textMuted }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = dark?"rgba(255,255,255,0.07)":"#F3EFF6"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-bold text-lg leading-tight" style={{ color:T.text, letterSpacing:"-0.03em", fontFamily:FONT }}>Reports</h1>
            <p className="text-[11px] font-medium" style={{ color:T.textMuted }}>Click a card to explore month-wise data</p>
          </div>
          <div className="ml-auto">
            <button onClick={() => exportCSV(months, services, view)} disabled={months.length===0 && services.length===0}
              className="flex items-center gap-1.5 text-[13px] font-semibold px-3.5 py-2 rounded-[12px] transition-all disabled:opacity-50"
              style={{ background:dark?"rgba(124,58,237,0.18)":"#FAF5FF", color:dark?"#C4AAFF":"#7C3AED", border:`1px solid ${dark?"rgba(196,170,255,0.25)":"rgba(124,58,237,0.20)"}` }}>
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="px-5 pb-6 space-y-4">

        {/* Clickable summary tiles */}
        <motion.div initial={{ opacity:0,y:14 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TILES.map(tile => (
            <button key={tile.id} onClick={() => setView(tile.id)}
              className="rounded-[20px] p-5 text-left transition-all"
              style={{
                background: view===tile.id ? tile.bg : (dark?"rgba(28,28,30,0.70)":"rgba(255,255,255,0.60)"),
                border: `2px solid ${view===tile.id ? tile.color : (dark?"rgba(255,255,255,0.07)":"rgba(0,0,0,0.06)")}`,
                boxShadow: view===tile.id ? `0 0 0 1px ${tile.border}, 0 8px 24px ${tile.border}` : "none",
                backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
                transform: view===tile.id ? "translateY(-2px)" : "none",
              }}>
              <div className="text-[11px] font-bold uppercase tracking-[0.08em] mb-2" style={{ color: view===tile.id ? tile.color : T.textMuted }}>{tile.label}</div>
              <div className="text-[24px] font-black tabular-nums leading-none mb-1.5" style={{ color: view===tile.id ? tile.color : T.text, letterSpacing:"-0.03em" }}>{tile.value}</div>
              <div className="text-[11px] font-medium" style={{ color:T.textMuted }}>{tile.sub}</div>
              {view===tile.id && (
                <div className="mt-3 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color:tile.color }}>Viewing below ↓</div>
              )}
            </button>
          ))}
        </motion.div>

        {/* Month-wise detail table */}
        <AnimatePresence mode="wait">
          {view === "revenue" && (
            <motion.div key="revenue" initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-6 }} transition={{ duration:0.25 }}
              className="rounded-[20px] overflow-hidden" style={glass}>
              <div className="flex items-center gap-2.5 px-6 py-4" style={{ borderBottom:`1px solid ${T.divider}` }}>
                <TrendingUp className="w-4 h-4" style={{ color:dark?"#90E0EF":"#0077B6" }} />
                <h2 className="font-bold text-base" style={{ color:T.text, fontFamily:FONT }}>Month-wise Revenue</h2>
              </div>
              {months.length === 0 ? <div className="py-16 text-center text-[14px]" style={{ color:T.textMuted }}>No data yet</div> : (
                <>
                  <div className="overflow-x-auto">
                  <div style={{ minWidth:520 }}>
                  <div className="grid px-6 py-3 text-[11px] font-bold uppercase"
                    style={{ gridTemplateColumns:"2fr 0.7fr 1.3fr 1.3fr 1.3fr", background:T.tblHead, borderBottom:`1px solid ${T.divider}`, color:dark?"#90E0EF":"#0077B6", letterSpacing:"0.06em" }}>
                    <span>Month</span><span className="text-center">Invoices</span>
                    <span className="text-right">Total</span><span className="text-right">Collected</span><span className="text-right">Outstanding</span>
                  </div>
                  {months.map(m => (
                    <div key={m.key} className="grid px-6 py-3.5 transition-colors"
                      style={{ gridTemplateColumns:"2fr 0.7fr 1.3fr 1.3fr 1.3fr", borderBottom:`1px solid ${T.divider}` }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = T.rowHover; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                      <span className="text-[13px] font-semibold" style={{ color:T.text }}>{m.label}</span>
                      <span className="text-[13px] text-center tabular-nums" style={{ color:T.textMuted }}>{m.invoices}</span>
                      <span className="text-[13px] text-right tabular-nums font-bold" style={{ color:T.text }}>Rs.{formatINR(m.revenue)}</span>
                      <span className="text-[13px] text-right tabular-nums" style={{ color:"#22C55E" }}>Rs.{formatINR(m.paid)}</span>
                      <span className="text-[13px] text-right tabular-nums" style={{ color: m.outstanding>0 ? (dark?"#FCA5A5":"#B91C1C") : T.textMuted }}>
                        {m.outstanding>0 ? `Rs.${formatINR(m.outstanding)}` : "--"}
                      </span>
                    </div>
                  ))}
                  <div className="grid px-6 py-3.5"
                    style={{ gridTemplateColumns:"2fr 0.7fr 1.3fr 1.3fr 1.3fr", background:dark?"rgba(144,224,239,0.06)":"rgba(0,119,182,0.04)", borderTop:`2px solid ${dark?"rgba(144,224,239,0.20)":"rgba(0,119,182,0.18)"}` }}>
                    <span className="text-[13px] font-black" style={{ color:T.text }}>TOTAL</span>
                    <span className="text-[13px] text-center tabular-nums font-bold" style={{ color:T.text }}>{months.reduce((s,m)=>s+m.invoices,0)}</span>
                    <span className="text-[14px] text-right tabular-nums font-black" style={{ color:dark?"#90E0EF":"#0077B6" }}>Rs.{formatINR(totRevenue)}</span>
                    <span className="text-[13px] text-right tabular-nums font-bold" style={{ color:"#22C55E" }}>Rs.{formatINR(totPaid)}</span>
                    <span className="text-[13px] text-right tabular-nums font-bold" style={{ color:dark?"#FCA5A5":"#B91C1C" }}>Rs.{formatINR(totOutstanding)}</span>
                  </div>
                  </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {view === "gst" && (
            <motion.div key="gst" initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-6 }} transition={{ duration:0.25 }}
              className="rounded-[20px] overflow-hidden" style={glass}>
              <div className="flex items-center gap-2.5 px-6 py-4" style={{ borderBottom:`1px solid ${T.divider}` }}>
                <FileText className="w-4 h-4" style={{ color:dark?"#C4AAFF":"#7C3AED" }} />
                <h2 className="font-bold text-base" style={{ color:T.text, fontFamily:FONT }}>Month-wise GST</h2>
                <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full font-semibold" style={{ background:dark?"rgba(196,170,255,0.15)":"#F5F3FF", color:dark?"#C4AAFF":"#7C3AED" }}>
                  Taxable: Rs.{formatINR(totTaxable)}
                </span>
              </div>
              {months.length === 0 ? <div className="py-16 text-center text-[14px]" style={{ color:T.textMuted }}>No GST data yet</div> : (
                <>
                  <div className="overflow-x-auto"><div style={{ minWidth:560 }}>
                  <div className="grid px-6 py-3 text-[11px] font-bold uppercase"
                    style={{ gridTemplateColumns:"1.8fr 0.7fr 1.1fr 1fr 1fr 1fr 1fr", background:T.tblHead, borderBottom:`1px solid ${T.divider}`, color:dark?"#C4AAFF":"#7C3AED", letterSpacing:"0.06em" }}>
                    <span>Month</span><span className="text-center">Inv</span>
                    <span className="text-right">Taxable</span><span className="text-right">CGST</span>
                    <span className="text-right">SGST</span><span className="text-right">IGST</span><span className="text-right">Total GST</span>
                  </div>
                  {months.map(m => (
                    <div key={m.key} className="grid px-6 py-3.5 transition-colors"
                      style={{ gridTemplateColumns:"1.8fr 0.7fr 1.1fr 1fr 1fr 1fr 1fr", borderBottom:`1px solid ${T.divider}` }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = T.rowHover; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                      <span className="text-[13px] font-semibold" style={{ color:T.text }}>{m.label}</span>
                      <span className="text-[13px] text-center tabular-nums" style={{ color:T.textMuted }}>{m.invoices}</span>
                      <span className="text-[13px] text-right tabular-nums" style={{ color:T.textSub }}>Rs.{formatINR(m.taxableAmt)}</span>
                      <span className="text-[13px] text-right tabular-nums" style={{ color:m.cgst>0?(dark?"#C4AAFF":"#7C3AED"):T.textMuted }}>{m.cgst>0?`Rs.${formatINR(m.cgst)}`:"--"}</span>
                      <span className="text-[13px] text-right tabular-nums" style={{ color:m.sgst>0?(dark?"#C4AAFF":"#7C3AED"):T.textMuted }}>{m.sgst>0?`Rs.${formatINR(m.sgst)}`:"--"}</span>
                      <span className="text-[13px] text-right tabular-nums" style={{ color:m.igst>0?(dark?"#60C0DC":"#0891B2"):T.textMuted }}>{m.igst>0?`Rs.${formatINR(m.igst)}`:"--"}</span>
                      <span className="text-[13px] text-right tabular-nums font-bold" style={{ color:m.gstTotal>0?(dark?"#C4AAFF":"#7C3AED"):T.textMuted }}>{m.gstTotal>0?`Rs.${formatINR(m.gstTotal)}`:"--"}</span>
                    </div>
                  ))}
                  <div className="grid px-6 py-3.5"
                    style={{ gridTemplateColumns:"1.8fr 0.7fr 1.1fr 1fr 1fr 1fr 1fr", background:dark?"rgba(124,58,237,0.08)":"#FAF5FF", borderTop:`2px solid ${dark?"rgba(196,170,255,0.25)":"rgba(124,58,237,0.20)"}` }}>
                    <span className="text-[13px] font-black" style={{ color:T.text }}>TOTAL</span>
                    <span className="text-[13px] text-center tabular-nums font-bold" style={{ color:T.text }}>{months.reduce((s,m)=>s+m.invoices,0)}</span>
                    <span className="text-[13px] text-right tabular-nums font-bold" style={{ color:T.text }}>Rs.{formatINR(totTaxable)}</span>
                    <span className="text-[13px] text-right tabular-nums font-bold" style={{ color:dark?"#C4AAFF":"#7C3AED" }}>Rs.{formatINR(totCGST)}</span>
                    <span className="text-[13px] text-right tabular-nums font-bold" style={{ color:dark?"#C4AAFF":"#7C3AED" }}>Rs.{formatINR(totSGST)}</span>
                    <span className="text-[13px] text-right tabular-nums font-bold" style={{ color:dark?"#60C0DC":"#0891B2" }}>Rs.{formatINR(totIGST)}</span>
                    <span className="text-[15px] text-right tabular-nums font-black" style={{ color:dark?"#C4AAFF":"#7C3AED" }}>Rs.{formatINR(totGST)}</span>
                  </div>
                  </div></div>
                </>
              )}
            </motion.div>
          )}

          {view === "service" && (
            <motion.div key="service" initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-6 }} transition={{ duration:0.25 }}
              className="rounded-[20px] overflow-hidden" style={glass}>
              <div className="flex items-center gap-2.5 px-6 py-4" style={{ borderBottom:`1px solid ${T.divider}` }}>
                <BarChart2 className="w-4 h-4" style={{ color:dark?"#6EE7B7":"#047857" }} />
                <h2 className="font-bold text-base" style={{ color:T.text, fontFamily:FONT }}>Service-wise Revenue</h2>
              </div>
              {services.length === 0 ? <div className="py-16 text-center text-[14px]" style={{ color:T.textMuted }}>No data yet</div> : (
                <>
                  <div className="overflow-x-auto"><div style={{ minWidth:420 }}>
                  <div className="grid px-6 py-3 text-[11px] font-bold uppercase"
                    style={{ gridTemplateColumns:"2fr 0.7fr 1.2fr 1.2fr 1.2fr", background:T.tblHead, borderBottom:`1px solid ${T.divider}`, color:dark?"#6EE7B7":"#047857", letterSpacing:"0.06em" }}>
                    <span>Service</span><span className="text-center">Invoices</span>
                    <span className="text-right">Revenue</span><span className="text-right">Collected</span><span className="text-right">Outstanding</span>
                  </div>
                  {services.map(row => {
                    const pct = row.revenue > 0 ? (row.paid/row.revenue)*100 : 0;
                    return (
                      <div key={row.type} className="grid px-6 py-4 transition-colors"
                        style={{ gridTemplateColumns:"2fr 0.7fr 1.2fr 1.2fr 1.2fr", borderBottom:`1px solid ${T.divider}` }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = T.rowHover; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                        <div>
                          <div className="text-[13px] font-semibold" style={{ color:T.text }}>{row.label}</div>
                          <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background:dark?"rgba(255,255,255,0.06)":"rgba(0,0,0,0.06)", width:"75%" }}>
                            <div className="h-full rounded-full transition-all" style={{ width:`${pct}%`, background:pct>=80?"#22C55E":pct>=50?"#F59E0B":"#EF4444" }} />
                          </div>
                          <div className="text-[10px] mt-0.5 font-semibold" style={{ color:T.textMuted }}>{Math.round(pct)}% collected</div>
                        </div>
                        <span className="text-[13px] text-center tabular-nums self-center" style={{ color:T.textMuted }}>{row.invoiceCount}</span>
                        <span className="text-[13px] text-right tabular-nums font-bold self-center" style={{ color:T.text }}>Rs.{formatINR(row.revenue)}</span>
                        <span className="text-[13px] text-right tabular-nums self-center" style={{ color:"#22C55E" }}>Rs.{formatINR(row.paid)}</span>
                        <span className="text-[13px] text-right tabular-nums self-center font-semibold"
                          style={{ color:row.outstanding>0?(dark?"#FCA5A5":"#B91C1C"):T.textMuted }}>
                          {row.outstanding>0?`Rs.${formatINR(row.outstanding)}`:"--"}
                        </span>
                      </div>
                    );
                  })}
                  <div className="grid px-6 py-3.5"
                    style={{ gridTemplateColumns:"2fr 0.7fr 1.2fr 1.2fr 1.2fr", background:dark?"rgba(110,231,183,0.06)":"#F0FDF4", borderTop:`2px solid ${dark?"rgba(110,231,183,0.20)":"rgba(4,120,87,0.18)"}` }}>
                    <span className="text-[13px] font-black" style={{ color:T.text }}>TOTAL</span>
                    <span className="text-[13px] text-center tabular-nums font-bold" style={{ color:T.text }}>{services.reduce((s,r)=>s+r.invoiceCount,0)}</span>
                    <span className="text-[14px] text-right tabular-nums font-black" style={{ color:dark?"#6EE7B7":"#047857" }}>Rs.{formatINR(services.reduce((s,r)=>s+r.revenue,0))}</span>
                    <span className="text-[13px] text-right tabular-nums font-bold" style={{ color:"#22C55E" }}>Rs.{formatINR(services.reduce((s,r)=>s+r.paid,0))}</span>
                    <span className="text-[13px] text-right tabular-nums font-bold" style={{ color:dark?"#FCA5A5":"#B91C1C" }}>Rs.{formatINR(services.reduce((s,r)=>s+r.outstanding,0))}</span>
                  </div>
                  </div></div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
