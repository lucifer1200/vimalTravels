"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getInvoiceById, addPayment, deleteInvoice, formatINR, fmtDate, amountToWords, getFinancialYear,
  type Invoice, type FlightItem, type PackageItem, type VisaItem, type GenericItem,
  type TrainItem, type BusItem, type HotelItem, type InvoiceStatus, type PaymentMode, COMPANY, TYPE_LABEL,
} from "@/lib/billing";
import { ArrowLeft, Printer, Share2, Plus, X, CheckCircle, ShieldCheck, Pencil, Trash2 } from "lucide-react";

const STATUS_STYLE: Record<InvoiceStatus, { cls: string; label: string }> = {
  paid:    { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "PAID" },
  partial: { cls: "bg-amber-50 text-amber-700 border-amber-200",       label: "PARTIALLY PAID" },
  due:     { cls: "bg-red-50 text-red-600 border-red-200",             label: "UNPAID" },
};

/* thin divider */
const Divider = () => <div style={{ height: 1, background: "#e2e8f0", margin: "0 0 20px" }} />;

/* section label */
const Label = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 10, fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>
    {children}
  </div>
);

export default function InvoiceViewPage() {
  const params = useParams();
  const router = useRouter();
  const [inv, setInv]           = useState<Invoice | null>(null);
  const [loading, setLoading]   = useState(true);
  const [payModal, setPayModal] = useState(false);
  const [delConfirm, setDelConfirm] = useState(false);
  const [payForm, setPayForm]  = useState({
    amount: "", mode: "bank" as PaymentMode, refNo: "", bankName: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [saved, setSaved] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [logoB64, setLogoB64] = useState<string>("/vimal-logo.jpeg");

  useEffect(() => {
    setLoading(true);
    getInvoiceById(params.id as string).then((data) => {
      if (data) setInv(data);
      setLoading(false);
    });
  }, [params.id]);

  useEffect(() => {
    fetch("/vimal-logo.jpeg")
      .then(r => r.blob())
      .then(blob => new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onloadend = () => res(reader.result as string);
        reader.readAsDataURL(blob);
      }))
      .then(b64 => setLogoB64(b64))
      .catch(() => {});
  }, []);

  const reload = () => {
    getInvoiceById(params.id as string).then((data) => { if (data) setInv(data); });
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full gap-3 text-slate-400 text-sm">
      <div style={{ width: 18, height: 18, border: "2px solid #CBD5E1", borderTopColor: "#2563EB", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      Loading invoice...
    </div>
  );

  if (!inv) return (
    <div className="flex items-center justify-center h-full text-slate-400 text-sm">Invoice not found</div>
  );

  const paid       = (inv.payments || []).reduce((s, p) => s + p.amount, 0);
  const balance    = inv.total - paid;
  const statusCfg  = STATUS_STYLE[inv.status];
  const isAir      = inv.type === "air-intl" || inv.type === "air-dom";
  const isTrain    = inv.type === "train";
  const isBus      = inv.type === "bus";
  const isHotel    = inv.type === "hotel";
  const isFareType = isAir || isTrain || isBus || isHotel;
  const isPkg      = inv.type === "package";
  const isVisa     = inv.type === "visa";
  const embassyTotal = isVisa ? (inv.subtotal || 0) - (inv.taxableAmount || 0) : 0;
  const gstTotal   = (inv.cgst || 0) + (inv.sgst || 0) + (inv.igst || 0);
  const fy         = inv.financialYear || getFinancialYear(inv.date);
  // Compact mode when multiple items — keeps invoice on 1 A4 page
  const n = inv.items.length;
  const fc  = n >= 2; // compact
  const fcc = n >= 4; // ultra compact

  const handleDelete = async () => {
    await deleteInvoice(inv.id);
    router.push("/admin/billing/invoices");
  };

  const handleAddPayment = async () => {
    if (!payForm.amount || !parseFloat(payForm.amount)) return;
    await addPayment(inv.id, {
      amount: parseFloat(payForm.amount), mode: payForm.mode,
      refNo: payForm.refNo, bankName: payForm.bankName, date: payForm.date,
    });
    setSaved(true);
    setTimeout(() => { setSaved(false); setPayModal(false); reload(); }, 1200);
  };

  const handleWhatsApp = async () => {
    const phone = (inv.customer.mobile || "").replace(/\D/g, "");
    if (!phone) { alert("Customer mobile number not set"); return; }

    const msg = `Dear ${inv.customer.name},\n\nPlease find your invoice from Vimal Travels:\n\nInvoice No: ${inv.invoiceNo}\nDate: ${fmtDate(inv.date)}\nService: ${TYPE_LABEL[inv.type]}\nAmount: ₹${formatINR(inv.total)}\n\nThank you for choosing Vimal Travels!\n📞 ${COMPANY.mobile1} | ${COMPANY.mobile2}\n✉ ${COMPANY.email}`;
    const waUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`;
    const filename = `${inv.invoiceNo.replace(/\//g, "-")}.pdf`;

    const element = document.getElementById("invoice");
    if (!element) { window.open(waUrl, "_blank"); return; }

    setPdfLoading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const opt = {
        margin: [5, 7, 5, 7] as [number, number, number, number],
        filename,
        image: { type: "jpeg" as const, quality: 0.97 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
      };
      await html2pdf().set(opt).from(element).save();
      window.open(waUrl, "_blank");
    } catch (err) {
      console.error("PDF error:", err);
      window.open(waUrl, "_blank"); // fallback: just open WhatsApp
    } finally {
      setPdfLoading(false);
    }
  };

  const F = { fontFamily: "var(--font-inter,'Inter',system-ui,sans-serif)" };

  const S = { fontFamily: "Inter, Arial, sans-serif" };
  const secTitle = { fontSize: 8.5, fontWeight: 700, color: "#172554", letterSpacing: "0.7px", textTransform: "uppercase" as const, marginBottom: 6 };
  const cardBase = { background: "#FFFFFF", border: "1px solid #DCE6F2", borderRadius: 12, padding: 11, boxShadow: "0 3px 12px rgba(15,23,42,0.05)" };
  const tblH = { background: "#EFF6FF", borderBottom: "1px solid #BFDBFE" };
  const thCell = (right?: boolean): React.CSSProperties => ({ padding: "7px 10px", textAlign: right ? "right" : "left", fontSize: 7, fontWeight: 700, color: "#2563EB", letterSpacing: "0.5px", textTransform: "uppercase", borderBottom: "1px solid #BFDBFE" });
  const tdRow = (alt: boolean) => ({ borderBottom: "1px solid #F1F5F9", background: alt ? "#F8FBFF" : "white" });

  return (
    <div className="min-h-full" style={{ background: "#F3F7FC", ...S }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { font-family: Inter, Arial, sans-serif; }
        @media print{
          *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important}
          body{background:white!important}
          .print\\:hidden{display:none!important}
          @page{margin:5mm 7mm;size:A4 portrait}
          /* Tighten all section gaps for print so everything fits on one page */
          #invoice { border-radius:0!important; box-shadow:none!important; border:none!important; }
          #invoice-body > * { margin-bottom:6px!important; }
          .print-mb-6 { margin-bottom:6px!important; }
          .print-mb-7 { margin-bottom:7px!important; }
          .print-p-compact { padding:6px 10px!important; }
          .print-words-compact { padding:5px 9px!important; }
          .print-sig-compact { margin-bottom:4px!important; }
          .print-footer-compact { padding:8px 12px!important; }
          .print-grand-compact { padding:11px 14px!important; }
          .print-bank-terms { gap:10px!important; margin-bottom:6px!important; }
          .print-section-gap { margin-bottom:7px!important; }
          /* Multi-item: extra print compression so all cards fit on 1 A4 page */
          .flight-cards-wrap { gap:4px!important; margin-bottom:5px!important; }
          .flight-card-body  { padding:5px 9px!important; }
          .flight-card-top   { padding:3px 9px!important; }
          .flight-card-stub  { width:80px!important; padding:5px 7px!important; }
          .invoice-body      { padding:8px 13px!important; }
          .cards-3col        { margin-bottom:6px!important; }
          .itinerary-heading { margin-bottom:4px!important; }
          .inv-gst-details   { margin-bottom:5px!important; padding:5px 10px!important; }
        }
      `}</style>
      {/* ── TOOLBAR ── */}
      <div className="print:hidden bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Invoices
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDelConfirm(true)}
            className="flex items-center gap-1.5 text-sm font-semibold px-3.5 py-2 border border-red-200 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
          <button
            onClick={() => router.push(`/admin/billing/invoices/new?edit=${inv.id}`)}
            className="flex items-center gap-1.5 text-sm font-semibold px-3.5 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
          <button
            onClick={() => setPayModal(true)}
            className="flex items-center gap-1.5 text-sm font-semibold px-3.5 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Record Payment
          </button>
          <button
            onClick={handleWhatsApp}
            disabled={pdfLoading}
            className="flex items-center gap-1.5 text-sm font-semibold px-3.5 py-2 rounded-lg transition-colors text-white disabled:opacity-60"
            style={{ background: "#25d366" }}
          >
            <Share2 className="w-3.5 h-3.5" />
            {pdfLoading ? "Generating PDF…" : "WhatsApp + PDF"}
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-sm font-semibold px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> Print / PDF
          </button>
        </div>
      </div>

      {/* ── INVOICE CARD ── */}
      <div className="p-6 print:p-0 flex justify-center">
        <div
          id="invoice"
          className="bg-white w-full max-w-3xl print:shadow-none print:max-w-none"
          style={{ boxShadow: "0 4px 24px rgba(15,23,42,0.07), 0 1px 4px rgba(15,23,42,0.04)", borderRadius: 14, border: "1px solid #E3EAF3", overflow: "hidden", ...S }}
        >
          {/* ── PREMIUM RAINBOW ACCENT BAR ── */}
          <div style={{ height: 4, background: "linear-gradient(90deg, #2563EB 0%, #06B6D4 25%, #7C3AED 60%, #F59E0B 100%)" }} />

          {/* ── HEADER ── */}
          <div style={{ background: "linear-gradient(135deg, #ffffff 0%, #F0F7FF 50%, #EBF4FF 100%)", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", overflow: "hidden", borderBottom: "1px solid #DBEAFE" }}>
            {/* Aviation sky photo — subtle background */}
            <div style={{ position: "absolute", right: 0, top: 0, width: "52%", height: "100%", pointerEvents: "none", overflow: "hidden" }}>
              <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=700&auto=format&fit=crop&q=35" alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%", opacity: 0.09, WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,1) 100%)", maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,1) 100%)" }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
            {/* Left: logo + agency */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative", zIndex: 1 }}>
              <div style={{ height: 44, width: 120, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src={logoB64} alt="Vimal Travels"
                  style={{ height: 44, width: "auto", maxWidth: 120, objectFit: "contain" }}
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    el.style.display = "none";
                    const box = el.parentElement!;
                    box.style.cssText = "width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#1E3A8A,#2563EB);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(37,99,235,0.3);flex-shrink:0";
                    const s = document.createElement("span");
                    s.textContent = "VT";
                    s.style.cssText = "font-weight:700;font-size:13px;color:white;";
                    box.appendChild(s);
                  }} />
              </div>
              <div>
                <div style={{ fontSize: 23, fontWeight: 700, color: "#172554", letterSpacing: "-0.5px", lineHeight: 1 }}>VIMAL TRAVELS</div>
                <div style={{ fontSize: 8.5, fontWeight: 600, color: "#2563EB", letterSpacing: "1px", textTransform: "uppercase", marginTop: 2.5 }}>Premium Travel Services</div>
                <div style={{ fontSize: 7.5, color: "#64748B", marginTop: 2 }}>{COMPANY.address}</div>
                <div style={{ fontSize: 7, color: "#94A3B8", marginTop: 1 }}>GSTIN: {COMPANY.gstin}</div>
              </div>
            </div>
            {/* Right: badge + meta */}
            <div style={{ textAlign: "right", position: "relative", zIndex: 1 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#EFF6FF", border: "1.5px solid #93C5FD", borderRadius: 999, padding: "5px 16px", marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#2563EB", letterSpacing: "1.2px" }}>✈ TAX INVOICE</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-end" }}>
                {[
                  ["INVOICE NO", inv.invoiceNo],
                  ["DATE", fmtDate(inv.date)],
                  ["SERVICE", TYPE_LABEL[inv.type]],
                ].map(([lbl, val]) => (
                  <div key={lbl} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                    <span style={{ fontSize: 7, fontWeight: 500, color: "#94A3B8" }}>{lbl}</span>
                    <span style={{ fontSize: lbl === "INVOICE NO" ? 11 : 8.5, fontWeight: lbl === "INVOICE NO" ? 700 : 600, color: lbl === "INVOICE NO" ? "#172554" : "#1E293B", fontFamily: lbl === "INVOICE NO" ? "monospace" : "inherit" }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── BODY ── */}
          <div id="invoice-body" style={{ padding: "13px 16px" }}>

            {/* ── 3-CARD ROW: Bill To · Service Details · Fare Snapshot ── */}
            <div className="print-mb-6" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 9 }}>
              {/* Bill To */}
              <div style={{ background: "#fff", border: "1px solid #DCE6F2", borderRadius: 11, padding: "8px 10px", boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", background: "linear-gradient(135deg,#2563EB,#06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 7, color: "white", fontWeight: 700, lineHeight: 1 }}>B</span>
                  </div>
                  <span style={{ fontSize: 7, fontWeight: 700, color: "#2563EB", textTransform: "uppercase", letterSpacing: "0.5px" }}>Bill To</span>
                </div>
                <div style={{ fontSize: 9.5, fontWeight: 700, color: "#172554", lineHeight: 1.2 }}>{inv.customer.name}</div>
                {inv.customer.mobile && <div style={{ fontSize: 7, color: "#64748B", marginTop: 2 }}>📞 {inv.customer.mobile}</div>}
                {inv.customer.address && <div style={{ fontSize: 7, color: "#94A3B8", marginTop: 1, lineHeight: 1.3 }}>{inv.customer.address}</div>}
                {inv.customer.city && <div style={{ fontSize: 7, color: "#94A3B8" }}>{inv.customer.city}{inv.customer.state ? `, ${inv.customer.state}` : ""}{inv.customer.stateCode ? ` — ${inv.customer.stateCode}` : ""}</div>}
                {inv.customer.gstin && <div style={{ fontSize: 7, color: "#2563EB", marginTop: 3, fontFamily: "monospace", fontWeight: 600, background: "#EFF6FF", display: "inline-block", padding: "1px 5px", borderRadius: 4 }}>GSTIN: {inv.customer.gstin}</div>}
              </div>

              {/* Service Details */}
              <div style={{ background: "#fff", border: "1px solid #DCE6F2", borderRadius: 11, padding: "8px 10px", boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", background: "linear-gradient(135deg,#7C3AED,#6366F1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 8, lineHeight: 1 }}>✈</span>
                  </div>
                  <span style={{ fontSize: 7, fontWeight: 700, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.5px" }}>Service Details</span>
                </div>
                {([
                  ["Type", TYPE_LABEL[inv.type]],
                  inv.airline ? ["Airline", inv.airline] : null,
                  isAir && inv.items.length > 0 && (inv.items[0] as FlightItem).airlinePnr ? ["PNR", (inv.items[0] as FlightItem).airlinePnr] : null,
                  isTrain && inv.items.length > 0 ? ["PNR", (inv.items[0] as TrainItem).pnr] : null,
                  ["SAC Code", inv.sacCode],
                  inv.gstType !== "none" ? ["GST Type", inv.gstType === "cgst_sgst" ? "CGST + SGST" : "IGST"] : null,
                  inv.customer.stateCode ? ["Supply", `${inv.customer.state} (${inv.customer.stateCode})`] : null,
                ] as (string[] | null)[]).filter(Boolean).map(row => (
                  <div key={row![0]} style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                    <span style={{ fontSize: 7, color: "#94A3B8", fontWeight: 500 }}>{row![0]}</span>
                    <span style={{ fontSize: 7.5, fontWeight: 600, color: "#1E293B" }}>{row![1]}</span>
                  </div>
                ))}
              </div>

              {/* Fare Snapshot — compact secondary card, no duplicate Grand Total */}
              <div style={{ background: "#fff", border: "1px solid #DCE6F2", borderRadius: 11, padding: "8px 10px", boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", background: "linear-gradient(135deg,#06B6D4,#0EA5E9)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 8, color: "white", fontWeight: 700, lineHeight: 1 }}>₹</span>
                  </div>
                  <span style={{ fontSize: 7, fontWeight: 700, color: "#0891B2", textTransform: "uppercase", letterSpacing: "0.5px" }}>Fare Snapshot</span>
                </div>
                {([
                  [isHotel ? "Room Fare" : isFareType ? "Ticket Fare" : isVisa ? "Embassy Fee" : "Sub Total", formatINR(isFareType ? (inv.fareTotal ?? inv.subtotal ?? 0) : isVisa ? embassyTotal : (inv.subtotal ?? 0))],
                  (isFareType || isVisa) ? [isVisa ? "Service Fee" : "Service Charge", formatINR(inv.taxableAmount || 0)] : null,
                  gstTotal > 0 ? [`GST @ ${inv.gstRate || 0}%`, formatINR(gstTotal)] : null,
                ] as (string[] | null)[]).filter(Boolean).map(row => (
                  <div key={row![0]} style={{ display: "flex", justifyContent: "space-between", marginBottom: 2.5 }}>
                    <span style={{ fontSize: 7, color: "#94A3B8", fontWeight: 500 }}>{row![0]}</span>
                    <span style={{ fontSize: 7.5, fontWeight: 600, color: "#1E293B" }}>₹{row![1]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── FLIGHT ITINERARY HERO (air type) ── */}
            {isAir && (
              <>
                {/* Section heading */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 7, background: "linear-gradient(135deg,#2563EB,#06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(37,99,235,0.25)" }}>
                    <span style={{ fontSize: 12, lineHeight: 1 }}>✈</span>
                  </div>
                  <div style={{ fontSize: 9.5, fontWeight: 700, color: "#172554", textTransform: "uppercase", letterSpacing: "0.8px" }}>Flight Itinerary</div>
                  <div style={{ flex: 1, height: 1.5, background: "linear-gradient(90deg,#BFDBFE,transparent)" }} />
                  {inv.airline && <span style={{ fontSize: 7.5, fontWeight: 700, color: "#2563EB", background: "linear-gradient(135deg,#EFF6FF,#DBEAFE)", padding: "3px 11px", borderRadius: 99, border: "1px solid #BFDBFE" }}>{inv.airline}</span>}
                </div>

                {/* Premium flight cards — auto-compact when multiple items */}
                <div className="flight-cards-wrap" style={{ display: "flex", flexDirection: "column", gap: fc ? 5 : 8, marginBottom: fc ? 6 : 9 }}>
                  {inv.items.map((item) => {
                    const f = item as FlightItem;
                    const hasRet = !!(f.returnSectorFrom && f.returnDate);
                    // Size tokens: compact when 2+ items, ultra-compact when 4+ items
                    const airportSz  = fcc ? 16 : fc ? 19 : 24;
                    const paxNameSz  = fcc ? 9  : fc ? 10 : 12;
                    const pnrSz      = fcc ? 7  : fc ? 7.5 : 8;
                    const bodyPad    = fcc ? "5px 9px" : fc ? "7px 11px" : "11px 14px";
                    const topPad     = fcc ? "4px 10px" : fc ? "5px 11px" : "7px 13px";
                    const retAptSz   = fcc ? 13 : fc ? 15 : 18;
                    const retMt      = fcc ? 4  : fc ? 5 : 8;
                    const stubW      = fcc ? 82 : fc ? 92 : 108;
                    const stubPad    = fcc ? "6px 7px" : fc ? "8px 9px" : "12px 11px";
                    const fareNumSz  = fcc ? 11 : fc ? 12 : 15;
                    const paxMb      = fcc ? 4  : fc ? 6 : 10;
                    const cardRadius = fc ? 10 : 14;
                    return (
                      <div key={item.id} style={{ background: "#fff", border: "1px solid #DCE6F2", borderRadius: cardRadius, overflow: "hidden", boxShadow: "0 3px 12px rgba(15,23,42,0.06)" }}>
                        {/* Top bar */}
                        <div style={{ background: "linear-gradient(90deg,#EFF6FF,#F5F0FF)", borderBottom: "1px solid #DBEAFE", padding: topPad, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            {!fc && (
                              <div style={{ width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg,#1D4ED8,#2563EB)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <span style={{ fontSize: 11, lineHeight: 1 }}>✈</span>
                              </div>
                            )}
                            <span style={{ fontSize: fc ? 8 : 9, fontWeight: 700, color: "#172554" }}>{inv.airline || TYPE_LABEL[inv.type]}</span>
                            {f.flightNo && <span style={{ fontSize: fc ? 7 : 7.5, fontWeight: 600, color: "#2563EB", background: "#DBEAFE", padding: fc ? "1px 7px" : "2px 9px", borderRadius: 99, border: "1px solid #BFDBFE" }}>{f.flightNo}</span>}
                            {f.flightClass && <span style={{ fontSize: fc ? 7 : 7.5, fontWeight: 600, color: "#7C3AED", background: "#EDE9FE", padding: fc ? "1px 7px" : "2px 9px", borderRadius: 99, border: "1px solid #DDD6FE" }}>{f.flightClass}</span>}
                            {hasRet && f.returnFlightNo && <span style={{ fontSize: fc ? 6.5 : 7, color: "#6366F1", background: "#EEF2FF", padding: "1px 6px", borderRadius: 99, border: "1px solid #C7D2FE" }}>↩ {f.returnFlightNo}{f.returnFlightClass ? ` · ${f.returnFlightClass}` : ""}</span>}
                          </div>
                          <span style={{ fontSize: fc ? 6.5 : 7.5, fontWeight: 700, color: "#15803D", background: "linear-gradient(135deg,#DCFCE7,#BBF7D0)", padding: fc ? "2px 8px" : "3px 11px", borderRadius: 999, border: "1px solid #86EFAC" }}>✓ CONFIRMED</span>
                        </div>

                        {/* Boarding pass body */}
                        <div style={{ display: "flex", position: "relative" }}>

                          {/* LEFT: passenger + route */}
                          <div style={{ flex: 1, padding: bodyPad, display: "flex", flexDirection: "column" }}>
                            {/* Passenger row */}
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: paxMb }}>
                              <div>
                                <div style={{ fontSize: 6, fontWeight: 700, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 1 }}>Passenger</div>
                                <div style={{ fontSize: paxNameSz, fontWeight: 700, color: "#172554", lineHeight: 1.2 }}>{f.paxName}</div>
                                {(f.airlinePnr || f.paxNo) && (
                                  <div style={{ fontSize: pnrSz, fontWeight: 700, color: "#2563EB", fontFamily: "monospace", letterSpacing: "0.06em", marginTop: fc ? 2 : 4, background: "#EFF6FF", padding: fc ? "1px 5px" : "2px 8px", borderRadius: 4, display: "inline-block", border: "1px solid #BFDBFE" }}>
                                    PNR: {f.airlinePnr || `PAX ${f.paxNo}`}
                                  </div>
                                )}
                              </div>
                              {!fc && (
                                <div style={{ textAlign: "right" }}>
                                  <div style={{ fontSize: 6.5, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>Class</div>
                                  <div style={{ fontSize: 8.5, fontWeight: 700, color: "#172554" }}>{f.flightClass || "Economy"}</div>
                                </div>
                              )}
                            </div>

                            {/* Route */}
                            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                              <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: airportSz, fontWeight: 700, color: "#172554", letterSpacing: "-0.8px", lineHeight: 1 }}>{f.sectorFrom}</div>
                                <div style={{ fontSize: fc ? 6.5 : 7, color: "#64748B", marginTop: 2, fontWeight: 500 }}>{f.travelDate ? fmtDate(f.travelDate) : ""}</div>
                              </div>
                              <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
                                <div style={{ flex: 1, height: 1.5, background: "linear-gradient(90deg,#BAE6FD,#2563EB,#818CF8)", borderRadius: 2 }} />
                                <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", background: "white", padding: "1px 4px", lineHeight: 1 }}>
                                  <span style={{ fontSize: fc ? 13 : 18, color: "#2563EB", filter: "drop-shadow(0 0 5px rgba(37,99,235,0.4))", lineHeight: 1 }}>✈</span>
                                </div>
                              </div>
                              <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: airportSz, fontWeight: 700, color: "#172554", letterSpacing: "-0.8px", lineHeight: 1 }}>{f.sectorTo}</div>
                                <div style={{ fontSize: fc ? 6.5 : 7, color: "#64748B", marginTop: 2, fontWeight: 500 }}>{f.travelDate ? fmtDate(f.travelDate) : ""}</div>
                              </div>
                            </div>

                            {/* Return */}
                            {hasRet && (
                              <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: retMt, paddingTop: retMt, borderTop: "1px dashed #C7D2FE" }}>
                                <span style={{ fontSize: 6, fontWeight: 700, color: "#6366F1", textTransform: "uppercase", flexShrink: 0, background: "#EEF2FF", padding: "1px 5px", borderRadius: 4 }}>↩ Ret</span>
                                <div style={{ textAlign: "center" }}>
                                  <div style={{ fontSize: retAptSz, fontWeight: 700, color: "#6366F1", letterSpacing: "-0.5px", lineHeight: 1 }}>{f.returnSectorFrom}</div>
                                  <div style={{ fontSize: 6.5, color: "#94A3B8", marginTop: 1 }}>{f.returnDate ? fmtDate(f.returnDate) : ""}</div>
                                </div>
                                <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
                                  <div style={{ flex: 1, height: 1.5, background: "#C7D2FE", borderRadius: 2 }} />
                                  <span style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", fontSize: fc ? 10 : 13, color: "#6366F1", background: "white", padding: "0 3px", lineHeight: 1 }}>✈</span>
                                </div>
                                <div style={{ textAlign: "center" }}>
                                  <div style={{ fontSize: retAptSz, fontWeight: 700, color: "#6366F1", letterSpacing: "-0.5px", lineHeight: 1 }}>{f.returnSectorTo}</div>
                                  <div style={{ fontSize: 6.5, color: "#94A3B8", marginTop: 1 }}>{f.returnDate ? fmtDate(f.returnDate) : ""}</div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Perforated tear line */}
                          <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 12 }}>
                            <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", width: 12, height: 6, background: "#F3F7FC", borderRadius: "0 0 8px 8px", border: "1px solid #DCE6F2", borderTop: "none", zIndex: 2 }} />
                            <div style={{ width: 0, height: "100%", borderLeft: "1.5px dashed #93C5FD", marginLeft: 6 }} />
                            <div style={{ position: "absolute", bottom: -1, left: "50%", transform: "translateX(-50%)", width: 12, height: 6, background: "#F3F7FC", borderRadius: "8px 8px 0 0", border: "1px solid #DCE6F2", borderBottom: "none", zIndex: 2 }} />
                          </div>

                          {/* RIGHT: fare stub */}
                          <div style={{ width: stubW, flexShrink: 0, padding: stubPad, background: "linear-gradient(160deg,#F8FBFF 0%,#EFF6FF 100%)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: fc ? 6 : 10, position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, #BFDBFE 1px, transparent 1px)", backgroundSize: "9px 9px", opacity: 0.35, pointerEvents: "none" }} />
                            <div style={{ position: "relative", textAlign: "center", width: "100%" }}>
                              <div style={{ fontSize: 6, fontWeight: 700, color: "#2563EB", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>Base Fare</div>
                              <div style={{ fontSize: fareNumSz, fontWeight: 700, color: "#172554", fontVariantNumeric: "tabular-nums" }}>₹{formatINR(f.amount)}</div>
                            </div>
                            <div style={{ width: "65%", height: 0, borderTop: "1.5px dashed #BFDBFE" }} />
                            <div style={{ position: "relative", textAlign: "center", width: "100%" }}>
                              <div style={{ fontSize: 6, fontWeight: 700, color: "#F59E0B", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>Svc Charge</div>
                              <div style={{ fontSize: fareNumSz, fontWeight: 700, color: "#D97706", fontVariantNumeric: "tabular-nums" }}>₹{formatINR(f.serviceCharge || 0)}</div>
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Invoice & GST Details — max 5 cols, multi-segment PNR support */}
                {(() => {
                  // Collect all PNRs across all segments (multi-leg support)
                  const allPnrs = inv.items
                    .map((it) => (it as FlightItem).airlinePnr)
                    .filter(Boolean)
                    .filter((v, i, a) => a.indexOf(v) === i); // unique
                  const pnrDisplay = allPnrs.length > 0 ? allPnrs.join(" · ") : null;

                  const cols: [string, string][] = ([
                    ["Service", TYPE_LABEL[inv.type]],
                    ...(inv.airline ? [["Airline", inv.airline]] : []),
                    ...(pnrDisplay ? [["PNR", pnrDisplay]] : []),
                    ["SAC Code", inv.sacCode || "996425"],
                    ...(inv.customer.stateCode ? [["Place of Supply", `${inv.customer.state} (${inv.customer.stateCode})`]] : []),
                    ...(inv.gstType !== "none" ? [["GST Type", inv.gstType === "cgst_sgst" ? "CGST + SGST" : "IGST"]] : []),
                  ] as [string, string][]).slice(0, 5); // hard cap at 5 columns

                  return (
                    <div style={{ background: "#F8FBFF", border: "1px solid #DCE6F2", borderRadius: 10, padding: "8px 13px", marginBottom: 9 }}>
                      <div style={{ fontSize: 7, fontWeight: 700, color: "#2563EB", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 7 }}>Invoice &amp; GST Details</div>
                      <div style={{ display: "flex", gap: 0 }}>
                        {cols.map(([label, value], i) => (
                          <div key={label} style={{ flex: 1, padding: "0 9px", borderRight: i < cols.length - 1 ? "1px solid #DCE6F2" : "none", minWidth: 0 }}>
                            <div style={{ fontSize: 6.5, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
                            <div style={{ fontSize: 7.5, fontWeight: 600, color: "#1E293B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </>
            )}

            {/* Non-air section heading */}
            {!isAir && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                <div style={{ fontSize: 8.5, fontWeight: 700, color: "#172554", letterSpacing: "0.5px", textTransform: "uppercase" }}>{isTrain ? "Train Booking" : isBus ? "Bus Booking" : isHotel ? "Hotel Reservation" : isPkg ? "Package Details" : isVisa ? "Visa Application" : "Service Entries"}</div>
                <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
              </div>
            )}

            {/* TRAIN TABLE */}
            {isTrain && (
              <div style={{ marginBottom: 16, border: "1px solid #E2E8F0", borderRadius: 10, overflow: "hidden" }}>
                <table className="w-full" style={{ fontSize: 8, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ ...tblH }}>
                      {["#","Passenger","Train","Route","Date","Class / Seat","PNR","Fare (₹)","Svc (₹)"].map((h, i) => (
                        <th key={i} style={{ ...thCell(i >= 7) }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {inv.items.map((item, i) => {
                      const t = item as TrainItem;
                      return (
                        <tr key={item.id} style={{ ...tdRow(i % 2 !== 0) }}>
                          <td style={{ padding: "8px 10px", color: "#94A3B8", width: 24, fontSize: 8 }}>{i + 1}</td>
                          <td style={{ padding: "8px 10px", fontWeight: 600, color: "#1E293B", fontSize: 8 }}>{t.paxName}</td>
                          <td style={{ padding: "8px 10px", fontFamily: "monospace", fontSize: 8 }}>
                            <div style={{ fontWeight: 600, color: "#334155" }}>{t.trainNo}</div>
                            <div style={{ color: "#64748B" }}>{t.trainName}</div>
                          </td>
                          <td style={{ padding: "8px 10px", fontFamily: "monospace", fontSize: 8, color: "#334155" }}>{t.fromStation} → {t.toStation}</td>
                          <td style={{ padding: "8px 10px", fontSize: 8, color: "#334155" }}>{t.travelDate ? fmtDate(t.travelDate) : ""}</td>
                          <td style={{ padding: "8px 10px", fontSize: 8 }}>
                            <span style={{ fontWeight: 600, color: "#334155" }}>{t.travelClass}</span>
                            {t.seatNo && <span style={{ color: "#94A3B8", marginLeft: 4 }}>· {t.seatNo}</span>}
                          </td>
                          <td style={{ padding: "8px 10px", fontFamily: "monospace", fontWeight: 600, color: "#172554", fontSize: 8 }}>{t.pnr}</td>
                          <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#1E293B", fontSize: 8 }}>{formatINR(t.amount)}</td>
                          <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#D99A22", fontSize: 8 }}>{formatINR(t.serviceCharge || 0)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* BUS TABLE */}
            {isBus && (
              <div style={{ marginBottom: 16, border: "1px solid #E2E8F0", borderRadius: 10, overflow: "hidden" }}>
                <table className="w-full" style={{ fontSize: 8, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ ...tblH }}>
                      {["#","Passenger","Route","Date / Time","Seat","Ticket No","Fare (₹)","Svc (₹)"].map((h, i) => (
                        <th key={i} style={{ ...thCell(i >= 6) }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {inv.items.map((item, i) => {
                      const b = item as BusItem;
                      return (
                        <tr key={item.id} style={{ ...tdRow(i % 2 !== 0) }}>
                          <td style={{ padding: "8px 10px", color: "#94A3B8", width: 24, fontSize: 8 }}>{i + 1}</td>
                          <td style={{ padding: "8px 10px", fontWeight: 600, color: "#1E293B", fontSize: 8 }}>{b.paxName}</td>
                          <td style={{ padding: "8px 10px", fontSize: 8, color: "#334155" }}>{b.fromCity} → {b.toCity}</td>
                          <td style={{ padding: "8px 10px", fontSize: 8, color: "#334155" }}>
                            <div>{b.travelDate ? fmtDate(b.travelDate) : ""}</div>
                            {b.departTime && <div style={{ color: "#94A3B8" }}>{b.departTime}</div>}
                          </td>
                          <td style={{ padding: "8px 10px", fontFamily: "monospace", fontWeight: 600, fontSize: 8, color: "#334155" }}>{b.seatNo}</td>
                          <td style={{ padding: "8px 10px", fontFamily: "monospace", fontWeight: 600, color: "#172554", fontSize: 8 }}>{b.ticketNo}</td>
                          <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#1E293B", fontSize: 8 }}>{formatINR(b.amount)}</td>
                          <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#D99A22", fontSize: 8 }}>{formatINR(b.serviceCharge || 0)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* HOTEL */}
            {isHotel && (() => {
              const firstH = inv.items[0] as HotelItem;
              const fmtTime = (t?: string) => {
                if (!t) return "";
                const [hh, mm] = t.split(":");
                const h = parseInt(hh), m = parseInt(mm);
                return `${h % 12 || 12}:${String(m).padStart(2,"0")} ${h >= 12 ? "PM" : "AM"}`;
              };
              return (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ ...cardBase, marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#172554" }}>{firstH?.hotelName || "Hotel"}</div>
                        <div style={{ fontSize: 8.5, color: "#64748B", marginTop: 2 }}>{firstH?.hotelCity}</div>
                        {firstH?.hotelAddress && <div style={{ fontSize: 8, color: "#94A3B8", marginTop: 2 }}>📍 {firstH.hotelAddress}</div>}
                      </div>
                      <div style={{ textAlign: "right" }}>
                        {firstH?.hotelPhone && <div style={{ fontSize: 8.5, color: "#64748B" }}>📞 {firstH.hotelPhone}</div>}
                        {firstH?.hotelEmail && <div style={{ fontSize: 8.5, color: "#64748B" }}>✉ {firstH.hotelEmail}</div>}
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, background: "#F8FAFC", borderRadius: 8, padding: "8px 10px" }}>
                      {[
                        { label: "CHECK-IN", value: firstH?.checkIn ? fmtDate(firstH.checkIn) : "—", sub: firstH?.checkInTime ? fmtTime(firstH.checkInTime) : "" },
                        { label: "CHECK-OUT", value: firstH?.checkOut ? fmtDate(firstH.checkOut) : "—", sub: firstH?.checkOutTime ? fmtTime(firstH.checkOutTime) : "" },
                        { label: "DURATION", value: `${firstH?.nights || inv.items.length}N`, sub: `${inv.items.length} Room${inv.items.length > 1 ? "s" : ""}` },
                        { label: "MEAL PLAN", value: firstH?.mealPlan === "EP" ? "Room Only" : firstH?.mealPlan === "CP" ? "Breakfast" : firstH?.mealPlan === "MAP" ? "B&D" : firstH?.mealPlan === "AP" ? "All Meals" : firstH?.mealPlan || "—", sub: "" },
                        { label: "GUESTS", value: `${firstH?.adults || 1} Adult${(firstH?.adults || 1) > 1 ? "s" : ""}`, sub: (firstH?.children || 0) > 0 ? `${firstH?.children} Child` : "" },
                      ].map(({ label, value, sub }) => (
                        <div key={label} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 7, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
                          <div style={{ fontSize: 9, fontWeight: 700, color: "#172554" }}>{value}</div>
                          {sub && <div style={{ fontSize: 7.5, color: "#64748B" }}>{sub}</div>}
                        </div>
                      ))}
                    </div>
                    {(firstH?.bookingRef || firstH?.confirmationNo) && (
                      <div style={{ display: "flex", gap: 20, fontSize: 8, marginTop: 8, paddingTop: 8, borderTop: "1px solid #E2E8F0" }}>
                        {firstH?.bookingRef && <div><span style={{ color: "#94A3B8", marginRight: 4 }}>BOOKING REF</span><span style={{ fontFamily: "monospace", fontWeight: 600, color: "#172554" }}>{firstH.bookingRef}</span></div>}
                        {firstH?.confirmationNo && <div><span style={{ color: "#94A3B8", marginRight: 4 }}>HCN / VOUCHER NO</span><span style={{ fontFamily: "monospace", fontWeight: 600, color: "#172554" }}>{firstH.confirmationNo}</span></div>}
                      </div>
                    )}
                  </div>
                  <div style={{ border: "1px solid #E2E8F0", borderRadius: 10, overflow: "hidden" }}>
                    <table className="w-full" style={{ fontSize: 8, borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ ...tblH }}>
                          {["#","Lead Guest","Room Type","Check-In","Check-Out","Nights","Meal","HCN / Ref","Room Fare (₹)","Svc (₹)"].map((h, i) => (
                            <th key={i} style={{ ...thCell(i >= 8), whiteSpace: "nowrap" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {inv.items.map((item, i) => {
                          const h = item as HotelItem;
                          return (
                            <tr key={item.id} style={{ ...tdRow(i % 2 !== 0) }}>
                              <td style={{ padding: "8px 10px", color: "#94A3B8", width: 20, fontSize: 8 }}>{i + 1}</td>
                              <td style={{ padding: "8px 10px", fontWeight: 600, color: "#1E293B", fontSize: 8 }}>
                                {h.guestName}
                                {(h.adults || h.children) && <div style={{ fontSize: 7.5, color: "#94A3B8", marginTop: 1 }}>{h.adults || 1} ADT{(h.children || 0) > 0 ? ` · ${h.children} CHD` : ""}</div>}
                              </td>
                              <td style={{ padding: "8px 10px", color: "#334155", fontSize: 8 }}>{h.roomType}</td>
                              <td style={{ padding: "8px 10px", fontSize: 8, color: "#334155" }}>
                                <div style={{ fontWeight: 600 }}>{h.checkIn ? fmtDate(h.checkIn) : ""}</div>
                                {h.checkInTime && <div style={{ color: "#64748B", fontSize: 7.5 }}>{fmtTime(h.checkInTime)}</div>}
                              </td>
                              <td style={{ padding: "8px 10px", fontSize: 8, color: "#334155" }}>
                                <div style={{ fontWeight: 600 }}>{h.checkOut ? fmtDate(h.checkOut) : ""}</div>
                                {h.checkOutTime && <div style={{ color: "#64748B", fontSize: 7.5 }}>{fmtTime(h.checkOutTime)}</div>}
                              </td>
                              <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 700, fontSize: 8, color: "#172554" }}>{h.nights}N</td>
                              <td style={{ padding: "8px 10px", fontSize: 8, color: "#334155" }}>{h.mealPlan}</td>
                              <td style={{ padding: "8px 10px", fontFamily: "monospace", fontSize: 7.5, color: "#172554" }}>
                                {h.confirmationNo && <div>{h.confirmationNo}</div>}
                                {h.bookingRef && <div style={{ color: "#64748B" }}>{h.bookingRef}</div>}
                              </td>
                              <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#1E293B", fontSize: 8 }}>{formatINR(h.amount)}</td>
                              <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#D99A22", fontSize: 8 }}>{formatINR(h.serviceCharge || 0)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}

            {/* PACKAGE TABLE */}
            {isPkg && (
              <div style={{ marginBottom: 16, border: "1px solid #E2E8F0", borderRadius: 10, overflow: "hidden" }}>
                <table className="w-full" style={{ fontSize: 8, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ ...tblH }}>
                      {["Lead Passenger","Destination","Travel Period","Pax","Rate / Person","Amount (₹)"].map((h, i) => (
                        <th key={i} style={{ ...thCell(i >= 3) }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {inv.items.map((item, i) => {
                      const p = item as PackageItem;
                      return (
                        <tr key={item.id} style={{ ...tdRow(i % 2 !== 0) }}>
                          <td style={{ padding: "8px 10px", fontWeight: 600, color: "#1E293B", fontSize: 8 }}>
                            {p.leadPax}{(p.paxCount ?? 0) > 1 ? ` +${(p.paxCount ?? 0) - 1}` : ""}
                            {p.inclusions && <div style={{ fontSize: 7.5, color: "#94A3B8", marginTop: 2 }}>{p.inclusions}</div>}
                          </td>
                          <td style={{ padding: "8px 10px", color: "#334155", fontSize: 8 }}>{p.destinations}</td>
                          <td style={{ padding: "8px 10px", fontSize: 8, color: "#64748B" }}>{p.travelFrom ? fmtDate(p.travelFrom) : ""} – {p.travelTo ? fmtDate(p.travelTo) : ""}</td>
                          <td style={{ padding: "8px 10px", textAlign: "right", fontSize: 8, color: "#334155" }}>{p.paxCount}</td>
                          <td style={{ padding: "8px 10px", textAlign: "right", fontSize: 8, color: "#334155" }}>{formatINR(p.perPersonRate ?? 0)}</td>
                          <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#1E293B", fontSize: 8 }}>{formatINR((p.perPersonRate ?? 0) * (p.paxCount ?? 0))}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* VISA TABLE */}
            {isVisa && (
              <div style={{ marginBottom: 16, border: "1px solid #E2E8F0", borderRadius: 10, overflow: "hidden" }}>
                <table className="w-full" style={{ fontSize: 8, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ ...tblH }}>
                      {["Applicant","Country","Visa Type","Embassy Fee","Service Fee","Total (₹)"].map((h, i) => (
                        <th key={i} style={{ ...thCell(i >= 3) }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {inv.items.map((item, i) => {
                      const v = item as VisaItem;
                      return (
                        <tr key={item.id} style={{ ...tdRow(i % 2 !== 0) }}>
                          <td style={{ padding: "8px 10px", fontWeight: 600, color: "#1E293B", fontSize: 8 }}>{v.applicantName}</td>
                          <td style={{ padding: "8px 10px", fontSize: 8, color: "#334155" }}>{v.visaCountry}</td>
                          <td style={{ padding: "8px 10px", fontSize: 8, color: "#64748B" }}>{v.visaType}</td>
                          <td style={{ padding: "8px 10px", textAlign: "right", fontSize: 8, color: "#334155" }}>{formatINR(v.embassyFee ?? 0)}</td>
                          <td style={{ padding: "8px 10px", textAlign: "right", fontSize: 8, color: "#334155" }}>{formatINR(v.serviceFee ?? 0)}</td>
                          <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#1E293B", fontSize: 8 }}>{formatINR((v.embassyFee ?? 0) + (v.serviceFee ?? 0))}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* OTHER TABLE */}
            {inv.type === "other" && (
              <div style={{ marginBottom: 16, border: "1px solid #E2E8F0", borderRadius: 10, overflow: "hidden" }}>
                <table className="w-full" style={{ fontSize: 8, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ ...tblH }}>
                      {["#","Description","Amount (₹)"].map((h, i) => (
                        <th key={i} style={{ ...thCell(i === 2) }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {inv.items.map((item, i) => {
                      const g = item as GenericItem;
                      return (
                        <tr key={item.id} style={{ ...tdRow(i % 2 !== 0) }}>
                          <td style={{ padding: "8px 10px", color: "#94A3B8", width: 32, fontSize: 8 }}>{i + 1}</td>
                          <td style={{ padding: "8px 10px", color: "#334155", fontSize: 8 }}>{g.description}</td>
                          <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#1E293B", fontSize: 8 }}>{formatINR(g.amount)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── GST + SUMMARY + GRAND TOTAL ── */}
            <div className="print-section-gap" style={{ display: "flex", gap: 12, marginBottom: 9 }}>
              {/* Left: GST table + words */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
                  <div style={{ fontSize: 8.5, fontWeight: 700, color: "#172554", letterSpacing: "0.7px", textTransform: "uppercase" }}>GST Summary</div>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#F59E0B", flexShrink: 0 }} />
                </div>
                {(() => {
                  const taxLbl = isHotel ? "Service Charge" : isVisa ? "Service Fee" : isFareType ? "Service Charge" : isPkg ? "Package Value" : "Taxable Value";
                  const taxCell = (
                    <td style={{ padding: "6px 9px", textAlign: "right" }}>
                      <div style={{ fontWeight: 600, color: "#1E293B", fontSize: 8 }}>{formatINR(inv.taxableAmount || 0)}</div>
                      <div style={{ fontSize: 7, color: "#94A3B8", marginTop: 1 }}>on {taxLbl}</div>
                    </td>
                  );
                  return (
                    <div style={{ border: "1px solid #E2E8F0", borderRadius: 9, overflow: "hidden", marginBottom: 6 }}>
                      <table style={{ width: "100%", fontSize: 8, borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ ...tblH }}>
                            {["Category","Rate","Taxable Amt","GST Amt"].map((h, i) => (
                              <th key={i} style={{ ...thCell(i >= 2) }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {inv.gstType === "cgst_sgst" ? (
                            <>
                              <tr style={{ borderBottom: "1px solid #F1F5F9" }}>
                                <td style={{ padding: "6px 9px", fontSize: 8, color: "#334155" }}>CGST</td>
                                <td style={{ padding: "6px 9px", fontSize: 8, color: "#334155" }}>{(inv.gstRate || 0) / 2}%</td>
                                {taxCell}
                                <td style={{ padding: "6px 9px", textAlign: "right", fontWeight: 600, color: "#1E293B", fontSize: 8 }}>{formatINR(inv.cgst || 0)}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: "6px 9px", fontSize: 8, color: "#334155" }}>SGST</td>
                                <td style={{ padding: "6px 9px", fontSize: 8, color: "#334155" }}>{(inv.gstRate || 0) / 2}%</td>
                                {taxCell}
                                <td style={{ padding: "6px 9px", textAlign: "right", fontWeight: 600, color: "#1E293B", fontSize: 8 }}>{formatINR(inv.sgst || 0)}</td>
                              </tr>
                            </>
                          ) : inv.gstType === "igst" ? (
                            <tr>
                              <td style={{ padding: "6px 9px", fontSize: 8, color: "#334155" }}>IGST</td>
                              <td style={{ padding: "6px 9px", fontSize: 8, color: "#334155" }}>{inv.gstRate}%</td>
                              {taxCell}
                              <td style={{ padding: "6px 9px", textAlign: "right", fontWeight: 600, color: "#1E293B", fontSize: 8 }}>{formatINR(inv.igst || 0)}</td>
                            </tr>
                          ) : (
                            <tr>
                              <td colSpan={4} style={{ padding: "6px 9px", color: "#94A3B8", textAlign: "center", fontStyle: "italic", fontSize: 8 }}>GST not applicable for this invoice</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
                {gstTotal > 0 && (
                  <div className="print-words-compact" style={{ padding: "7px 10px", background: "#FFF9E8", border: "1px solid #F4D98B", borderRadius: 8, marginBottom: 6 }}>
                    <div style={{ fontSize: 7, fontWeight: 700, color: "#A16207", letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: 2 }}>Tax in Words</div>
                    <div style={{ fontSize: 7.5, fontWeight: 500, color: "#78350F" }}>{amountToWords(gstTotal)}</div>
                  </div>
                )}
                <div className="print-words-compact" style={{ padding: "7px 10px", background: "#FFF9E8", border: "1px solid #F4D98B", borderRadius: 8 }}>
                  <div style={{ fontSize: 7, fontWeight: 700, color: "#A16207", letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: 2 }}>Amount in Words</div>
                  <div style={{ fontSize: 7.5, fontWeight: 500, color: "#78350F" }}>{amountToWords(inv.total)}</div>
                </div>
              </div>

              {/* Right: Summary rows + Grand Total card */}
              <div style={{ minWidth: 230 }}>
                <div style={{ ...secTitle }}>Summary</div>
                <div style={{ border: "1px solid #DBEAFE", borderRadius: 10, overflow: "hidden", marginBottom: 7 }}>
                  {[
                    {
                      label: isHotel ? "Room Fare (GST Exempt)" : isFareType ? "Ticket Fare (GST Exempt)" : isVisa ? "Embassy / Govt Fee (Exempt)" : "Sub Total",
                      value: formatINR(isFareType ? (inv.fareTotal ?? inv.subtotal ?? 0) : isVisa ? embassyTotal : (inv.subtotal ?? 0)),
                    },
                    ...(isFareType || isVisa ? [{
                      label: isHotel ? "Service Charge (Taxable)" : isVisa ? "Service Fee (Taxable)" : "Service Charge (Taxable)",
                      value: formatINR(inv.taxableAmount || 0),
                    }] : []),
                    ...(gstTotal > 0 ? [{ label: `GST @ ${inv.gstRate || 0}%`, value: formatINR(gstTotal) }] : []),
                  ].map((r, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", borderBottom: "1px solid #F1F5F9", fontSize: 8, color: "#64748B" }}>
                      <span>{r.label}</span>
                      <span style={{ fontWeight: 600, color: "#1E293B", fontVariantNumeric: "tabular-nums" }}>{r.value}</span>
                    </div>
                  ))}
                  {paid > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", borderBottom: "1px solid #F1F5F9", fontSize: 8, background: "#ECFDF3" }}>
                      <span style={{ fontWeight: 600, color: "#16A34A" }}>Amount Paid</span>
                      <span style={{ fontWeight: 700, color: "#16A34A", fontVariantNumeric: "tabular-nums" }}>₹{formatINR(paid)}</span>
                    </div>
                  )}
                  {inv.status !== "paid" && (
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", fontSize: 8, background: "#FEF2F2" }}>
                      <span style={{ fontWeight: 600, color: "#DC2626" }}>Balance Due</span>
                      <span style={{ fontWeight: 700, color: "#DC2626", fontVariantNumeric: "tabular-nums" }}>₹{formatINR(balance)}</span>
                    </div>
                  )}
                </div>
                {/* Grand Total card */}
                <div className="print-grand-compact" style={{ background: "linear-gradient(135deg, #1E40AF 0%, #312E81 60%, #3730A3 100%)", borderRadius: 14, padding: "15px 17px", boxShadow: "0 8px 24px rgba(30,64,175,0.20), 0 2px 8px rgba(49,46,129,0.10)", position: "relative", overflow: "hidden" }}>
                  {/* Very subtle background decoration */}
                  <div style={{ position: "absolute", right: -18, top: -18, width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.02)", pointerEvents: "none" }} />
                  <div style={{ position: "absolute", right: 30, bottom: -25, width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.015)", pointerEvents: "none" }} />
                  <div style={{ position: "absolute", left: -10, top: 10, width: 50, height: 50, borderRadius: "50%", background: "rgba(255,255,255,0.01)", pointerEvents: "none" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
                    <div>
                      <div style={{ fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 6 }}>Grand Total</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.6px", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>₹{formatINR(inv.total)}</div>
                      <div style={{ fontSize: 7, color: "rgba(255,255,255,0.38)", marginTop: 6 }}>All amounts in INR · Inclusive of all taxes</div>
                    </div>
                    {inv.status === "paid" && (
                      <div style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 999, padding: "4px 11px", display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 8, color: "#4ADE80" }}>✓</span>
                        <span style={{ fontSize: 7.5, fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.5px" }}>PAID</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── PAYMENT HISTORY (screen only) ── */}
            {(inv.payments || []).length > 0 && (
              <div style={{ marginBottom: 8 }} className="print:hidden">
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ ...secTitle, marginBottom: 0 }}>Payment History</div>
                  <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
                  <span className={`text-[9px] font-bold uppercase px-2.5 py-1 rounded-full border ${statusCfg.cls}`}>{statusCfg.label}</span>
                </div>
                <div style={{ border: "1px solid #E2E8F0", borderRadius: 10, overflow: "hidden" }}>
                  {inv.payments.map((p, i) => (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderBottom: i < inv.payments.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#ECFDF3", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 9, fontWeight: 600, color: "#1E293B" }}>
                          {p.mode === "bank" ? "Bank Transfer" : p.mode === "upi" ? "UPI Payment" : p.mode === "cash" ? "Cash" : p.mode === "cheque" ? "Cheque" : "Card"}
                        </div>
                        <div style={{ fontSize: 8, color: "#94A3B8" }}>{p.bankName && `${p.bankName}`}{p.refNo ? ` · Ref: ${p.refNo}` : ""}{p.date ? ` · ${fmtDate(p.date)}` : ""}</div>
                      </div>
                      <div style={{ fontSize: 9, fontWeight: 600, color: "#1E293B" }}>₹{formatINR(p.amount)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {inv.notes && (
              <div style={{ marginBottom: 8, padding: "6px 10px", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 7 }}>
                <div style={{ fontSize: 7, fontWeight: 700, color: "#92400E", letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: 3 }}>Notes</div>
                <p style={{ fontSize: 8, color: "#78350F", margin: 0, lineHeight: 1.5 }}>{inv.notes}</p>
              </div>
            )}

            {/* ── BANK + TERMS ── */}
            <div className="print-bank-terms" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13, marginBottom: 9 }}>
              {/* Payment Details */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
                  <ShieldCheck style={{ width: 11, height: 11, color: "#2563EB" }} />
                  <div style={{ fontSize: 8.5, fontWeight: 700, color: "#172554", letterSpacing: "0.7px", textTransform: "uppercase" }}>Payment Details</div>
                </div>
                <div style={{ background: "#F8FBFF", border: "1px solid #DBEAFE", borderRadius: 10, padding: "10px 12px" }}>
                  {[
                    ["Account Name", "VIMAL TRAVELS"],
                    ["Bank", COMPANY.bank],
                    ["Account No", COMPANY.accountNo],
                    ["IFSC Code", COMPANY.ifsc],
                    ["Branch", COMPANY.branch],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", paddingBottom: 5, paddingTop: 5, borderBottom: "1px solid #EBF4FF" }}>
                      <span style={{ fontSize: 7, fontWeight: 500, color: "#64748B" }}>{label}</span>
                      <span style={{ fontSize: 8, fontWeight: 600, color: label === "Account No" || label === "IFSC Code" ? "#172554" : "#1E293B", fontFamily: label === "Account No" || label === "IFSC Code" ? "monospace" : "inherit" }}>{value}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 7, display: "flex", alignItems: "center", gap: 4 }}>
                    <ShieldCheck style={{ width: 10, height: 10, color: "#2563EB" }} />
                    <span style={{ fontSize: 7, fontWeight: 500, color: "#2563EB" }}>Primary Business Account — Secure Transfer</span>
                  </div>
                </div>
              </div>
              {/* Terms */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: "linear-gradient(135deg,#7C3AED,#6366F1)", flexShrink: 0 }} />
                  <div style={{ fontSize: 8.5, fontWeight: 700, color: "#172554", letterSpacing: "0.7px", textTransform: "uppercase" }}>Terms & Conditions</div>
                </div>
                <div style={{ padding: "9px 12px", background: "#FFFFFF", border: "1px solid #E8ECFF", borderRadius: 10 }}>
                  <ol style={{ fontSize: 7, color: "#64748B", lineHeight: 1.4, paddingLeft: 14, margin: 0 }}>
                    <li style={{ marginBottom: 4 }}>Payment is due within 15 days of invoice date.</li>
                    <li style={{ marginBottom: 4 }}>Interest @ 24% p.a. will be charged on delayed payments.</li>
                    <li style={{ marginBottom: 4 }}>No refund without original invoice.</li>
                    <li style={{ marginBottom: 4 }}>Cheque in favour of <strong>&quot;Vimal Travels&quot;</strong>. Bangalore jurisdiction.</li>
                    <li style={{ marginBottom: 4 }}>Quote invoice no. <strong>{inv.invoiceNo}</strong> in all communications.</li>
                    {isAir && <li>GST credit subject to statutory timelines.</li>}
                  </ol>
                </div>
              </div>
            </div>

            {/* ── SIGNATURE ── */}
            <div className="print-sig-compact" style={{ display: "grid", gridTemplateColumns: "1fr 1px 1fr", gap: 0, marginBottom: 6 }}>
              <div style={{ paddingRight: 18, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <div style={{ height: 28, borderBottom: "1.5px solid #CBD5E1", marginBottom: 5 }} />
                <div style={{ fontSize: 7, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>Customer Signature</div>
                <div style={{ fontSize: 7, color: "#94A3B8", marginTop: 1 }}>{inv.customer.name}</div>
              </div>
              <div style={{ background: "linear-gradient(to bottom, transparent, #CBD5E1, transparent)", margin: "4px 0" }} />
              <div style={{ paddingLeft: 18, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "flex-end" }}>
                <div style={{ fontSize: 14, color: "#172554", fontStyle: "italic", marginBottom: 4, fontFamily: "Georgia, serif" }}>Vimal Travels</div>
                <div style={{ height: 1.5, width: "100%", background: "linear-gradient(90deg, transparent, #CBD5E1)", marginBottom: 5 }} />
                <div style={{ fontSize: 7, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>Authorised Signatory</div>
                <div style={{ fontSize: 7, color: "#94A3B8", marginTop: 1 }}>For Vimal Travels</div>
              </div>
            </div>

            {/* ── FOOTER ── */}
            <div className="print-footer-compact" style={{ background: "linear-gradient(135deg, #F0F7FF, #F5F9FF)", border: "1px solid #DCE6F2", borderRadius: 12, padding: "11px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 600, color: "#2563EB", marginBottom: 3 }}>✈ Thank you for choosing Vimal Travels!</div>
                <div style={{ fontSize: 7, color: "#64748B" }}>This is a computer generated invoice. Certified that the particulars are true and correct.</div>
                <div style={{ fontSize: 7, color: "#64748B", marginTop: 2 }}>{COMPANY.email} · {COMPANY.mobile1} / {COMPANY.mobile2}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 7, color: "#94A3B8", marginBottom: 2 }}>FY {fy}</div>
                <div style={{ fontSize: 7.5, fontWeight: 600, color: "#2563EB" }}>IATA Certified Agency</div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── DELETE CONFIRM MODAL ── */}
      {delConfirm && (
        <div className="print:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Delete Invoice?</h2>
                <p className="text-sm text-slate-500 mt-0.5">{inv.invoiceNo} · {inv.customer.name}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-5">This action cannot be undone. The invoice and all payment records will be permanently deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => setDelConfirm(false)} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} className="flex-1 py-2.5 text-sm font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PAYMENT MODAL ── */}
      {payModal && (
        <div className="print:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900">Record Payment</h2>
              <button onClick={() => setPayModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            {saved ? (
              <div className="py-12 text-center">
                <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
                <p className="font-bold text-slate-800 text-lg">Payment Recorded!</p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div className="bg-red-50 rounded-lg p-3 text-sm">
                  <span className="text-slate-500">Balance Due: </span>
                  <span className="font-bold text-red-600">₹{formatINR(balance)}</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Amount (₹) *</label>
                  <input
                    type="number"
                    value={payForm.amount}
                    onChange={(e) => setPayForm((f) => ({ ...f, amount: e.target.value }))}
                    placeholder={balance.toString()}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Mode</label>
                    <select
                      value={payForm.mode}
                      onChange={(e) => setPayForm((f) => ({ ...f, mode: e.target.value as PaymentMode }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                    >
                      <option value="bank">Bank Transfer</option>
                      <option value="upi">UPI</option>
                      <option value="cash">Cash</option>
                      <option value="cheque">Cheque</option>
                      <option value="card">Card</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Date</label>
                    <input
                      type="date"
                      value={payForm.date}
                      onChange={(e) => setPayForm((f) => ({ ...f, date: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Bank / UPI Name</label>
                  <input
                    value={payForm.bankName}
                    onChange={(e) => setPayForm((f) => ({ ...f, bankName: e.target.value }))}
                    placeholder="ICICI Bank"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Reference / UTR No</label>
                  <input
                    value={payForm.refNo}
                    onChange={(e) => setPayForm((f) => ({ ...f, refNo: e.target.value }))}
                    placeholder="UTR / Txn reference"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => setPayModal(false)}
                    className="flex-1 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddPayment}
                    disabled={!payForm.amount}
                    className="flex-1 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
                  >
                    Save Payment
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
