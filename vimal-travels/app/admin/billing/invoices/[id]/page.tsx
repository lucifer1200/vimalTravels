"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getInvoiceById, addPayment, deletePayment, updatePayment, deleteInvoice, addInvoice, saveInvoice, formatINR, fmtDate, amountToWords, getFinancialYear,
  type Invoice, type FlightItem, type PackageItem, type VisaItem, type GenericItem,
  type TrainItem, type BusItem, type HotelItem, type InvoiceStatus, type PaymentMode, COMPANY, TYPE_LABEL,
} from "@/lib/billing";
import { ArrowLeft, Printer, Share2, Plus, X, CheckCircle, ShieldCheck, Pencil, Trash2, Copy } from "lucide-react";
import { useAdminDark } from "@/lib/useAdminDark";

const STATUS_STYLE: Record<InvoiceStatus, { cls: string; label: string }> = {
  paid:      { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "PAID" },
  partial:   { cls: "bg-amber-50 text-amber-700 border-amber-200",       label: "PARTIALLY PAID" },
  due:       { cls: "bg-red-50 text-red-600 border-red-200",             label: "UNPAID" },
  cancelled: { cls: "bg-slate-100 text-slate-500 border-slate-300",      label: "CANCELLED" },
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
  const dark = useAdminDark();
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
  const [editPayId, setEditPayId] = useState<string | null>(null);
  const [editPayForm, setEditPayForm] = useState({ amount: "", mode: "bank" as PaymentMode, refNo: "", bankName: "", date: "" });
  const [delPayId, setDelPayId] = useState<string | null>(null);

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
    <div className="flex items-center justify-center h-full gap-3 text-sm" style={{ color: dark?"#938F99":"#79747E" }}>
      <div style={{ width:18, height:18, border:"2.5px solid transparent", borderTopColor:"#0077B6", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      Loading invoice...
    </div>
  );

  if (!inv) return (
    <div className="flex items-center justify-center h-full text-sm" style={{ color: dark?"#938F99":"#79747E" }}>Invoice not found</div>
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

  const handleCancel = async () => {
    await saveInvoice({ ...inv, status: "cancelled" });
    router.refresh();
  };

  const handleDuplicate = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const dup = await addInvoice({
      type:          inv.type,
      customer:      inv.customer,
      customerId:    inv.customerId,
      date:          today,
      items:         inv.items,
      subtotal:      inv.subtotal,
      serviceCharge: inv.serviceCharge,
      gstType:       inv.gstType,
      gstRate:       inv.gstRate,
      cgst:          inv.cgst,
      sgst:          inv.sgst,
      igst:          inv.igst,
      gst:           inv.gst,
      taxableAmount: inv.taxableAmount,
      fareTotal:     inv.fareTotal,
      total:         inv.total,
      notes:         inv.notes,
      status:        "due",
      payments:      [],
    });
    router.push(`/admin/billing/invoices/${dup.id}`);
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

  const openEditPay = (p: { id: string; amount: number; mode?: PaymentMode; refNo?: string; bankName?: string; date: string }) => {
    setEditPayId(p.id);
    setEditPayForm({ amount: String(p.amount), mode: p.mode || "bank", refNo: p.refNo || "", bankName: p.bankName || "", date: p.date });
  };

  const handleEditPayment = async () => {
    if (!editPayId || !editPayForm.amount) return;
    await updatePayment(inv.id, editPayId, {
      amount: parseFloat(editPayForm.amount), mode: editPayForm.mode,
      refNo: editPayForm.refNo, bankName: editPayForm.bankName, date: editPayForm.date,
    });
    setEditPayId(null);
    reload();
  };

  const handleDeletePayment = async () => {
    if (!delPayId) return;
    await deletePayment(inv.id, delPayId);
    setDelPayId(null);
    reload();
  };

  const handleWhatsApp = async () => {
    const phone = (inv.customer.mobile || "").replace(/\D/g, "");
    if (!phone) { alert("Customer mobile number not set"); return; }

    const balDue = inv.total - (inv.payments || []).reduce((s, p) => s + p.amount, 0);
    const msg = `Dear ${inv.customer.name},\n\nPlease find your invoice details from Vimal Travels:\n\nInvoice No: ${inv.invoiceNo}\nDate: ${fmtDate(inv.date)}\nService: ${TYPE_LABEL[inv.type]}\nTotal Amount: ₹${formatINR(inv.total)}${balDue > 0 ? `\nAmount Paid: ₹${formatINR(inv.total - balDue)}\n*Balance Due: ₹${formatINR(balDue)}*\n\n⚠️ Please clear your pending dues at the earliest.` : "\n\n✅ Payment received. Thank you!"}\n\n💳 *Pay via UPI:*\nUPI ID: ${COMPANY.upiId}\n\nThank you for choosing Vimal Travels!\n📞 ${COMPANY.mobile1} | ${COMPANY.mobile2}\n✉️ ${COMPANY.email}`;
    const waUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`;
    const custName = (inv.customer?.name || "Customer").replace(/[^a-zA-Z0-9\s]/g, "").trim().replace(/\s+/g, "_");
    const svcType  = TYPE_LABEL[inv.type]?.replace(/[^a-zA-Z0-9\s]/g, "").trim().replace(/\s+/g, "_") || inv.type;
    const filename = `${custName}_${svcType}.pdf`;

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
  const secTitle = { fontSize: 10, fontWeight: 700, color: "#172554", letterSpacing: "0.7px", textTransform: "uppercase" as const, marginBottom: 7 };
  const cardBase = { background: "#FFFFFF", border: "1px solid #DCE6F2", borderRadius: 12, padding: 11, boxShadow: "0 3px 12px rgba(15,23,42,0.05)" };
  const tblH = { background: "#EFF6FF", borderBottom: "1px solid #BFDBFE" };
  const thCell = (right?: boolean): React.CSSProperties => ({ padding: "7px 8px", textAlign: right ? "right" : "left", fontSize: 11, fontWeight: 700, color: "#2563EB", letterSpacing: "0.5px", textTransform: "uppercase", borderBottom: "1px solid #BFDBFE" });
  const tdRow = (alt: boolean) => ({ borderBottom: "1px solid #F1F5F9", background: alt ? "#F8FBFF" : "white" });

  const toolbarBg     = dark ? "rgba(18,18,18,0.97)" : "#FFFFFF";
  const toolbarBorder = dark ? "rgba(255,255,255,0.09)" : "#E7E0EC";
  const toolbarText   = dark ? "#E6E1E5" : "#49454F";
  const toolbarMuted  = dark ? "#938F99" : "#79747E";

  return (
    <div className="min-h-full" style={{ background: dark?"#111111":"#F4F0FF", ...S, transition:"background 0.3s ease" }}>
      <style>{`
        * { font-family: var(--font-roboto), Roboto, Inter, Arial, sans-serif; }
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
      {/* -- TOOLBAR -- */}
      <div className="print:hidden px-5 py-3 flex items-center gap-3 sticky top-0 z-10"
        style={{ background: toolbarBg, backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", borderBottom:`1px solid ${toolbarBorder}`, transition:"background 0.3s ease" }}>
        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[13px] font-semibold px-3 py-2 rounded-xl transition-all"
          style={{ color: toolbarMuted, background: dark?"rgba(255,255,255,0.04)":"#F8F8F8", border:`1px solid ${toolbarBorder}` }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = toolbarText; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = toolbarMuted; }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        {/* Invoice title */}
        <div className="flex items-center gap-2 mr-2">
          <span className="text-[15px] font-bold" style={{ color: toolbarText }}>{inv.invoiceNo}</span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{
            background: inv.status === "paid" ? (dark?"rgba(34,197,94,0.15)":"#DCFCE7") : inv.status === "partial" ? (dark?"rgba(245,158,11,0.15)":"#FEF3C7") : inv.status === "cancelled" ? (dark?"rgba(148,163,184,0.15)":"#F1F5F9") : (dark?"rgba(239,68,68,0.15)":"#FEE2E2"),
            color: inv.status === "paid" ? (dark?"#86EFAC":"#15803D") : inv.status === "partial" ? (dark?"#FDE68A":"#B45309") : inv.status === "cancelled" ? (dark?"#94A3B8":"#64748B") : (dark?"#FCA5A5":"#B91C1C"),
          }}>{inv.status.toUpperCase()}</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          {inv.status !== "cancelled" && (
            <button onClick={handleCancel}
              className="flex items-center gap-1.5 text-[13px] font-semibold px-3.5 py-2 rounded-xl transition-all"
              style={{ color:"#64748B", background: dark?"rgba(148,163,184,0.10)":"rgba(148,163,184,0.10)", border:"1px solid rgba(148,163,184,0.30)" }}>
              Cancel Invoice
            </button>
          )}
          <button onClick={() => setDelConfirm(true)}
            className="flex items-center gap-1.5 text-[13px] font-semibold px-3 py-2 rounded-xl transition-all"
            style={{ color:"#EF4444", background: dark?"rgba(239,68,68,0.10)":"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.20)" }}>
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => router.push(`/admin/billing/invoices/new?edit=${inv.id}`)}
            className="flex items-center gap-1.5 text-[13px] font-semibold px-3.5 py-2 rounded-xl transition-all"
            style={{ color: toolbarText, background: dark?"rgba(255,255,255,0.06)":"#F4F4F4", border:`1px solid ${toolbarBorder}` }}>
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
          <button onClick={() => setPayModal(true)}
            className="flex items-center gap-1.5 text-[13px] font-semibold px-3.5 py-2 rounded-xl transition-all"
            style={{ color:"#0077B6", background: dark?"rgba(0,119,182,0.12)":"rgba(0,119,182,0.08)", border:"1px solid rgba(0,119,182,0.25)" }}>
            <Plus className="w-3.5 h-3.5" /> Record Payment
          </button>
          <button onClick={handleWhatsApp} disabled={pdfLoading}
            className="flex items-center gap-1.5 text-[13px] font-semibold px-3.5 py-2 rounded-xl transition-all text-white disabled:opacity-60"
            style={{ background:"#25D366", boxShadow:"0 2px 8px rgba(37,211,102,0.30)" }}>
            <Share2 className="w-3.5 h-3.5" />
            {pdfLoading ? "Generating..." : "WhatsApp"}
          </button>
          <button onClick={handleDuplicate}
            className="flex items-center gap-1.5 text-[13px] font-semibold px-3.5 py-2 rounded-xl transition-all"
            style={{ background:dark?"rgba(255,255,255,0.08)":"#F3EFF6", color:dark?"#C4AAFF":"#7C3AED", border:`1px solid ${dark?"rgba(196,170,255,0.20)":"rgba(124,58,237,0.20)"}` }}
            title="Create a duplicate of this invoice">
            <Copy className="w-3.5 h-3.5" /> Duplicate
          </button>
          <button onClick={() => window.print()}
            className="flex items-center gap-1.5 text-[13px] font-semibold px-3.5 py-2 text-white rounded-xl transition-all"
            style={{ background:"linear-gradient(135deg,#0077B6,#0096C7)", boxShadow:"0 2px 10px rgba(0,119,182,0.35)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,119,182,0.50)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 10px rgba(0,119,182,0.35)"; }}>
            <Printer className="w-3.5 h-3.5" /> Print / PDF
          </button>
        </div>
      </div>

      {/* -- INVOICE CARD -- */}
      <div className="p-6 print:p-0 flex justify-center">
        <div
          id="invoice"
          className="bg-white w-full max-w-3xl print:shadow-none print:max-w-none"
          style={{ boxShadow: "0 4px 24px rgba(15,23,42,0.07), 0 1px 4px rgba(15,23,42,0.04)", borderRadius: 14, border: "1px solid #E3EAF3", overflow: "hidden", ...S }}
        >
          {/* -- PREMIUM RAINBOW ACCENT BAR -- */}
          <div style={{ height: 4, background: "linear-gradient(90deg, #2563EB 0%, #06B6D4 25%, #7C3AED 60%, #F59E0B 100%)" }} />

          {/* -- HEADER -- */}
          <div style={{ background: "linear-gradient(135deg, #ffffff 0%, #F0F7FF 50%, #EBF4FF 100%)", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", overflow: "hidden", borderBottom: "1px solid #DBEAFE" }}>
            {/* Aviation sky photo — subtle background */}
            <div style={{ position: "absolute", right: 0, top: 0, width: "52%", height: "100%", pointerEvents: "none", overflow: "hidden" }}>
              <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=700&auto=format&fit=crop&q=35" alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%", opacity: 0.09, WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,1) 100%)", maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,1) 100%)" }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
            {/* Left: logo + agency */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative", zIndex: 1 }}>
              <div style={{ height: 60, width: 140, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
                <img src={logoB64} alt="Vimal Travels"
                  style={{ height: 60, width: "auto", maxWidth: 140, objectFit: "contain" }}
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
                <div style={{ fontSize: 26, fontWeight: 700, color: "#172554", letterSpacing: "-0.5px", lineHeight: 1 }}>VIMAL TRAVELS</div>
                <div style={{ fontSize: 9.5, color: "#475569", marginTop: 4 }}>{COMPANY.address}</div>
                <div style={{ fontSize: 9, color: "#334155", marginTop: 2, fontWeight: 600 }}>GSTIN: {COMPANY.gstin}</div>
              </div>
            </div>
            {/* Right: badge + meta */}
            <div style={{ textAlign: "right", position: "relative", zIndex: 1 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#EFF6FF", border: "1.5px solid #93C5FD", borderRadius: 999, padding: "5px 16px", marginBottom: 8, whiteSpace: "nowrap" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#2563EB", letterSpacing: "1.2px", whiteSpace: "nowrap" }}>
                  {gstTotal > 0 ? "TAX INVOICE" : inv.type === "air-intl" ? "INTERNATIONAL AIR TICKET INVOICE" : inv.type === "air-dom" ? "DOMESTIC AIR TICKET INVOICE" : inv.type === "train" ? "TRAIN TICKET INVOICE" : inv.type === "bus" ? "BUS TICKET INVOICE" : inv.type === "hotel" ? "HOTEL BOOKING INVOICE" : inv.type === "visa" ? "VISA SERVICE INVOICE" : inv.type === "package" ? "PACKAGE INVOICE" : "INVOICE"}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-end" }}>
                {[
                  ["INVOICE NO", inv.invoiceNo],
                  ["DATE", fmtDate(inv.date)],
                  ["SERVICE", TYPE_LABEL[inv.type]],
                ].map(([lbl, val]) => (
                  <div key={lbl} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: "#64748B" }}>{lbl}</span>
                    <span style={{ fontSize: lbl === "INVOICE NO" ? 15 : 12, fontWeight: lbl === "INVOICE NO" ? 700 : 600, color: lbl === "INVOICE NO" ? "#172554" : "#1E293B", fontFamily: lbl === "INVOICE NO" ? "monospace" : "inherit" }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* -- BODY -- */}
          <div id="invoice-body" style={{ padding: "8px 12px" }}>

            {/* -- 2-CARD ROW: Bill To · Service Details -- */}
            <div className="print-mb-6" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 7 }}>
              {/* Bill To */}
              <div style={{ background: "#fff", border: "1px solid #DCE6F2", borderRadius: 11, padding: "8px 10px", boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", background: "linear-gradient(135deg,#2563EB,#06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 7, color: "white", fontWeight: 700, lineHeight: 1 }}>B</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#2563EB", textTransform: "uppercase", letterSpacing: "0.5px" }}>Bill To</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#172554", lineHeight: 1.2 }}>{inv.customer.name}</div>
                {inv.customer.mobile && <div style={{ fontSize: 11.5, color: "#64748B", marginTop: 3 }}>" {inv.customer.mobile}</div>}
                {inv.customer.address && <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2, lineHeight: 1.4 }}>{inv.customer.address}</div>}
                {inv.customer.city && <div style={{ fontSize: 11, color: "#94A3B8" }}>{inv.customer.city}{inv.customer.state ? `, ${inv.customer.state}` : ""}{inv.customer.stateCode ? ` — ${inv.customer.stateCode}` : ""}</div>}
                {inv.customer.gstin && <div style={{ fontSize: 10, color: "#2563EB", marginTop: 3, fontFamily: "monospace", fontWeight: 600, background: "#EFF6FF", display: "inline-block", padding: "2px 6px", borderRadius: 4 }}>GSTIN: {inv.customer.gstin}</div>}
              </div>

              {/* Service Details */}
              <div style={{ background: "#fff", border: "1px solid #DCE6F2", borderRadius: 11, padding: "8px 10px", boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", background: "linear-gradient(135deg,#7C3AED,#6366F1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 8, lineHeight: 1 }}></span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.5px" }}>Service Details</span>
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
                  <div key={row![0]} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 9.5, color: "#94A3B8", fontWeight: 500 }}>{row![0]}</span>
                    <span style={{ fontSize: 10.5, fontWeight: 600, color: "#1E293B" }}>{row![1]}</span>
                  </div>
                ))}
              </div>

            </div>

            {/* -- FLIGHT ITINERARY HERO (air type) -- */}
            {isAir && (
              <>
                {/* Section heading */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 7, background: "linear-gradient(135deg,#2563EB,#06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(37,99,235,0.25)" }}>
                    <span style={{ fontSize: 12, lineHeight: 1 }}></span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#172554", textTransform: "uppercase", letterSpacing: "0.8px" }}>Flight Itinerary</div>
                  <div style={{ flex: 1, height: 1.5, background: "linear-gradient(90deg,#BFDBFE,transparent)" }} />
                </div>

                {/* Premium flight cards — auto-compact when multiple items */}
                <div className="flight-cards-wrap" style={{ display: "flex", flexDirection: "column", gap: fc ? 5 : 8, marginBottom: fc ? 6 : 9 }}>
                  {inv.items.map((item) => {
                    const f = item as FlightItem;
                    const hasRet = !!(f.returnSectorFrom && f.returnDate);
                    // Size tokens: compact when 2+ items, ultra-compact when 4+ items
                    const airportSz  = fcc ? 20 : fc ? 24 : 32;
                    const paxNameSz  = fcc ? 12 : fc ? 14 : 17;
                    const pnrSz      = fcc ? 9  : fc ? 10 : 11;
                    const bodyPad    = fcc ? "6px 10px" : fc ? "9px 13px" : "13px 16px";
                    const topPad     = fcc ? "5px 11px" : fc ? "6px 12px" : "8px 14px";
                    const retAptSz   = fcc ? 15 : fc ? 18 : 22;
                    const retMt      = fcc ? 4  : fc ? 5 : 8;
                    const paxMb      = fcc ? 5  : fc ? 7 : 12;
                    const cardRadius = fc ? 10 : 14;
                    return (
                      <div key={item.id} style={{ background: "#fff", border: "1px solid #DCE6F2", borderRadius: cardRadius, overflow: "hidden", boxShadow: "0 3px 12px rgba(15,23,42,0.06)" }}>
                        {/* Top bar */}
                        <div style={{ background: "linear-gradient(90deg,#EFF6FF,#F5F0FF)", borderBottom: "1px solid #DBEAFE", padding: topPad, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            {!fc && (
                              <div style={{ width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg,#1D4ED8,#2563EB)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <span style={{ fontSize: 11, lineHeight: 1 }}></span>
                              </div>
                            )}
                            <span style={{ fontSize: fc ? 10 : 11, fontWeight: 700, color: "#172554" }}>{inv.airline || TYPE_LABEL[inv.type]}</span>
                            {f.flightNo && <span style={{ fontSize: fc ? 9 : 10, fontWeight: 600, color: "#2563EB", background: "#DBEAFE", padding: fc ? "2px 8px" : "2px 10px", borderRadius: 99, border: "1px solid #BFDBFE" }}>{f.flightNo}</span>}
                            {f.flightClass && <span style={{ fontSize: fc ? 9 : 10, fontWeight: 600, color: "#7C3AED", background: "#EDE9FE", padding: fc ? "2px 8px" : "2px 10px", borderRadius: 99, border: "1px solid #DDD6FE" }}>{f.flightClass}</span>}
                            {hasRet && f.returnFlightNo && <span style={{ fontSize: fc ? 8 : 9, color: "#6366F1", background: "#EEF2FF", padding: "2px 7px", borderRadius: 99, border: "1px solid #C7D2FE" }}> {f.returnFlightNo}{f.returnFlightClass ? ` · ${f.returnFlightClass}` : ""}</span>}
                          </div>
                          <span style={{ fontSize: fc ? 8.5 : 10, fontWeight: 700, color: "#15803D", background: "linear-gradient(135deg,#DCFCE7,#BBF7D0)", padding: fc ? "3px 10px" : "4px 13px", borderRadius: 999, border: "1px solid #86EFAC" }}>CONFIRMED</span>
                        </div>

                        {/* Boarding pass body */}
                        <div style={{ display: "flex", position: "relative" }}>

                          {/* LEFT: passenger + route */}
                          <div style={{ flex: 1, padding: bodyPad, display: "flex", flexDirection: "column" }}>
                            {/* Passenger row */}
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: paxMb }}>
                              <div>
                                <div style={{ fontSize: 7.5, fontWeight: 700, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 1 }}>Passenger</div>
                                <div style={{ fontSize: paxNameSz, fontWeight: 700, color: "#172554", lineHeight: 1.2 }}>{f.paxName}</div>
                                {(f.airlinePnr || f.paxNo) && (
                                  <div style={{ fontSize: pnrSz, fontWeight: 700, color: "#2563EB", fontFamily: "monospace", letterSpacing: "0.06em", marginTop: fc ? 2 : 4, background: "#EFF6FF", padding: fc ? "1px 5px" : "2px 8px", borderRadius: 4, display: "inline-block", border: "1px solid #BFDBFE" }}>
                                    PNR: {f.airlinePnr || `PAX ${f.paxNo}`}
                                  </div>
                                )}
                              </div>
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
                                  <span style={{ fontSize: fc ? 13 : 18, color: "#2563EB", filter: "drop-shadow(0 0 5px rgba(37,99,235,0.4))", lineHeight: 1 }}></span>
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
                                <span style={{ fontSize: 6, fontWeight: 700, color: "#6366F1", textTransform: "uppercase", flexShrink: 0, background: "#EEF2FF", padding: "1px 5px", borderRadius: 4 }}> Ret</span>
                                <div style={{ textAlign: "center" }}>
                                  <div style={{ fontSize: retAptSz, fontWeight: 700, color: "#6366F1", letterSpacing: "-0.5px", lineHeight: 1 }}>{f.returnSectorFrom}</div>
                                  <div style={{ fontSize: 6.5, color: "#94A3B8", marginTop: 1 }}>{f.returnDate ? fmtDate(f.returnDate) : ""}</div>
                                </div>
                                <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
                                  <div style={{ flex: 1, height: 1.5, background: "#C7D2FE", borderRadius: 2 }} />
                                  <span style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", fontSize: fc ? 10 : 13, color: "#6366F1", background: "white", padding: "0 3px", lineHeight: 1 }}></span>
                                </div>
                                <div style={{ textAlign: "center" }}>
                                  <div style={{ fontSize: retAptSz, fontWeight: 700, color: "#6366F1", letterSpacing: "-0.5px", lineHeight: 1 }}>{f.returnSectorTo}</div>
                                  <div style={{ fontSize: 6.5, color: "#94A3B8", marginTop: 1 }}>{f.returnDate ? fmtDate(f.returnDate) : ""}</div>
                                </div>
                              </div>
                            )}
                          </div>


                        </div>
                      </div>
                    );
                  })}
                </div>

              </>
            )}

            {/* Non-air section heading */}
            {!isAir && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#172554", letterSpacing: "0.5px", textTransform: "uppercase" }}>{isTrain ? "Train Booking" : isBus ? "Bus Booking" : isHotel ? "Hotel Reservation" : isPkg ? "Package Details" : isVisa ? "Visa Application" : "Service Entries"}</div>
                <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
              </div>
            )}

            {/* TRAIN TABLE */}
            {isTrain && (
              <div style={{ marginBottom: 8, border: "1px solid #E2E8F0", borderRadius: 10, overflow: "hidden" }}>
                <table className="w-full" style={{ fontSize: 13, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ ...tblH }}>
                      {["#","Passenger","Train","Route","Date","Class / Seat","PNR","Fare (₹)",...(gstTotal>0?["Svc (₹)"]:[])] .map((h, i) => (
                        <th key={i} style={{ ...thCell(i >= 7) }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {inv.items.map((item, i) => {
                      const t = item as TrainItem;
                      return (
                        <tr key={item.id} style={{ ...tdRow(i % 2 !== 0) }}>
                          <td style={{ padding: "6px 8px", color: "#94A3B8", width: 24, fontSize: 12 }}>{i + 1}</td>
                          <td style={{ padding: "6px 8px", fontWeight: 700, color: "#1E293B", fontSize: 13 }}>{t.paxName}</td>
                          <td style={{ padding: "6px 8px", fontFamily: "monospace", fontSize: 12 }}>
                            <div style={{ fontWeight: 700, color: "#334155" }}>{t.trainNo}</div>
                            <div style={{ color: "#64748B", fontSize: 11 }}>{t.trainName}</div>
                          </td>
                          <td style={{ padding: "6px 8px", fontFamily: "monospace", fontWeight: 700, fontSize: 13, color: "#1E293B" }}>{t.fromStation} {'->'} {t.toStation}</td>
                          <td style={{ padding: "6px 8px", fontSize: 13, fontWeight: 700, color: "#1E293B" }}>{t.travelDate ? fmtDate(t.travelDate) : ""}</td>
                          <td style={{ padding: "6px 8px", fontSize: 13 }}>
                            <span style={{ fontWeight: 700, color: "#334155" }}>{t.travelClass}</span>
                            {t.seatNo && <span style={{ color: "#94A3B8", marginLeft: 4, fontSize: 11 }}>· {t.seatNo}</span>}
                          </td>
                          <td style={{ padding: "6px 8px", fontFamily: "monospace", fontWeight: 700, color: "#172554", fontSize: 12 }}>{t.pnr}</td>
                          <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700, color: "#1E293B", fontSize: 13 }}>{formatINR(t.amount)}</td>
                          {gstTotal > 0 && <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 600, color: "#D99A22", fontSize: 13 }}>{formatINR(t.serviceCharge || 0)}</td>}
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
                <table className="w-full" style={{ fontSize: 11, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ ...tblH }}>
                      {["#","Passenger","Route","Date / Time","Seat","Ticket No","Fare (₹)",...(gstTotal>0?["Svc (₹)"]:[])] .map((h, i) => (
                        <th key={i} style={{ ...thCell(i >= 6) }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {inv.items.map((item, i) => {
                      const b = item as BusItem;
                      return (
                        <tr key={item.id} style={{ ...tdRow(i % 2 !== 0) }}>
                          <td style={{ padding: "8px 10px", color: "#94A3B8", width: 24, fontSize: 10 }}>{i + 1}</td>
                          <td style={{ padding: "8px 10px", fontWeight: 700, color: "#1E293B", fontSize: 11 }}>{b.paxName}</td>
                          <td style={{ padding: "8px 10px", fontSize: 10, color: "#334155" }}>{b.fromCity} {'->'} {b.toCity}</td>
                          <td style={{ padding: "8px 10px", fontSize: 10, color: "#334155" }}>
                            <div>{b.travelDate ? fmtDate(b.travelDate) : ""}</div>
                            {b.departTime && <div style={{ color: "#94A3B8" }}>{b.departTime}</div>}
                          </td>
                          <td style={{ padding: "8px 10px", fontFamily: "monospace", fontWeight: 600, fontSize: 10, color: "#334155" }}>{b.seatNo}</td>
                          <td style={{ padding: "8px 10px", fontFamily: "monospace", fontWeight: 600, color: "#172554", fontSize: 10 }}>{b.ticketNo}</td>
                          <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: "#1E293B", fontSize: 11 }}>{formatINR(b.amount)}</td>
                          {gstTotal > 0 && <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#D99A22", fontSize: 11 }}>{formatINR(b.serviceCharge || 0)}</td>}
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
                        {firstH?.hotelAddress && <div style={{ fontSize: 8, color: "#94A3B8", marginTop: 2 }}>" {firstH.hotelAddress}</div>}
                      </div>
                      <div style={{ textAlign: "right" }}>
                        {firstH?.hotelPhone && <div style={{ fontSize: 8.5, color: "#64748B" }}>" {firstH.hotelPhone}</div>}
                        {firstH?.hotelEmail && <div style={{ fontSize: 8.5, color: "#64748B" }}> {firstH.hotelEmail}</div>}
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
                    <table className="w-full" style={{ fontSize: 11, borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ ...tblH }}>
                          {["#","Lead Guest","Room Type","Check-In","Check-Out","Nights","Meal","HCN / Ref","Room Fare (₹)",...(gstTotal>0?["Svc (₹)"]:[])] .map((h, i) => (
                            <th key={i} style={{ ...thCell(i >= 8), whiteSpace: "nowrap" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {inv.items.map((item, i) => {
                          const h = item as HotelItem;
                          return (
                            <tr key={item.id} style={{ ...tdRow(i % 2 !== 0) }}>
                              <td style={{ padding: "8px 10px", color: "#94A3B8", width: 20, fontSize: 10 }}>{i + 1}</td>
                              <td style={{ padding: "8px 10px", fontWeight: 700, color: "#1E293B", fontSize: 11 }}>
                                {h.guestName}
                                {(h.adults || h.children) && <div style={{ fontSize: 9.5, color: "#94A3B8", marginTop: 1 }}>{h.adults || 1} ADT{(h.children || 0) > 0 ? ` · ${h.children} CHD` : ""}</div>}
                              </td>
                              <td style={{ padding: "8px 10px", color: "#334155", fontSize: 10 }}>{h.roomType}</td>
                              <td style={{ padding: "8px 10px", fontSize: 10, color: "#334155" }}>
                                <div style={{ fontWeight: 600 }}>{h.checkIn ? fmtDate(h.checkIn) : ""}</div>
                                {h.checkInTime && <div style={{ color: "#64748B", fontSize: 9 }}>{fmtTime(h.checkInTime)}</div>}
                              </td>
                              <td style={{ padding: "8px 10px", fontSize: 10, color: "#334155" }}>
                                <div style={{ fontWeight: 600 }}>{h.checkOut ? fmtDate(h.checkOut) : ""}</div>
                                {h.checkOutTime && <div style={{ color: "#64748B", fontSize: 9 }}>{fmtTime(h.checkOutTime)}</div>}
                              </td>
                              <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 700, fontSize: 11, color: "#172554" }}>{h.nights}N</td>
                              <td style={{ padding: "8px 10px", fontSize: 10, color: "#334155" }}>{h.mealPlan}</td>
                              <td style={{ padding: "8px 10px", fontFamily: "monospace", fontSize: 9.5, color: "#172554" }}>
                                {h.confirmationNo && <div>{h.confirmationNo}</div>}
                                {h.bookingRef && <div style={{ color: "#64748B" }}>{h.bookingRef}</div>}
                              </td>
                              <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: "#1E293B", fontSize: 11 }}>{formatINR(h.amount)}</td>
                              {gstTotal > 0 && <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#D99A22", fontSize: 11 }}>{formatINR(h.serviceCharge || 0)}</td>}
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
                <table className="w-full" style={{ fontSize: 11, borderCollapse: "collapse" }}>
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
                          <td style={{ padding: "8px 10px", fontWeight: 700, color: "#1E293B", fontSize: 11 }}>
                            {p.leadPax}{(p.paxCount ?? 0) > 1 ? ` +${(p.paxCount ?? 0) - 1}` : ""}
                            {p.inclusions && <div style={{ fontSize: 9, color: "#94A3B8", marginTop: 2 }}>{p.inclusions}</div>}
                          </td>
                          <td style={{ padding: "8px 10px", color: "#334155", fontSize: 11 }}>{p.destinations}</td>
                          <td style={{ padding: "8px 10px", fontSize: 11, color: "#64748B" }}>{p.travelFrom ? fmtDate(p.travelFrom) : ""} " {p.travelTo ? fmtDate(p.travelTo) : ""}</td>
                          <td style={{ padding: "8px 10px", textAlign: "right", fontSize: 11, color: "#334155" }}>{p.paxCount}</td>
                          <td style={{ padding: "8px 10px", textAlign: "right", fontSize: 11, color: "#334155" }}>{formatINR(p.perPersonRate ?? 0)}</td>
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
                <table className="w-full" style={{ fontSize: 11, borderCollapse: "collapse" }}>
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
                          <td style={{ padding: "8px 10px", fontWeight: 700, color: "#1E293B", fontSize: 11 }}>{v.applicantName}</td>
                          <td style={{ padding: "8px 10px", fontSize: 8, color: "#334155" }}>{v.visaCountry}</td>
                          <td style={{ padding: "8px 10px", fontSize: 11, color: "#64748B" }}>{v.visaType}</td>
                          <td style={{ padding: "8px 10px", textAlign: "right", fontSize: 11, color: "#334155" }}>{formatINR(v.embassyFee ?? 0)}</td>
                          <td style={{ padding: "8px 10px", textAlign: "right", fontSize: 11, color: "#334155" }}>{formatINR(v.serviceFee ?? 0)}</td>
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
                <table className="w-full" style={{ fontSize: 11, borderCollapse: "collapse" }}>
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
                          <td style={{ padding: "8px 10px", color: "#94A3B8", width: 32, fontSize: 10 }}>{i + 1}</td>
                          <td style={{ padding: "8px 10px", color: "#334155", fontSize: 11 }}>{g.description}</td>
                          <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "#1E293B", fontSize: 8 }}>{formatINR(g.amount)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* -- GST + SUMMARY + GRAND TOTAL -- */}
            <div className="print-section-gap" style={{ display: "flex", gap: 10, marginBottom: 6 }}>
              {/* Left: GST table + words */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {gstTotal > 0 && (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: "#172554", letterSpacing: "0.7px", textTransform: "uppercase" }}>GST Summary</div>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#F59E0B", flexShrink: 0 }} />
                    </div>
                    {(() => {
                      const taxLbl = isHotel ? "Service Charge" : isVisa ? "Service Fee" : isFareType ? "Service Charge" : isPkg ? "Package Value" : "Taxable Value";
                      const taxCell = (
                        <td style={{ padding: "7px 10px", textAlign: "right" }}>
                          <div style={{ fontWeight: 600, color: "#1E293B", fontSize: 9 }}>{formatINR(inv.taxableAmount || 0)}</div>
                          <div style={{ fontSize: 9, color: "#94A3B8", marginTop: 1 }}>on {taxLbl}</div>
                        </td>
                      );
                      return (
                        <div style={{ border: "1px solid #E2E8F0", borderRadius: 9, overflow: "hidden", marginBottom: 6 }}>
                          <table style={{ width: "100%", fontSize: 9, borderCollapse: "collapse" }}>
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
                                    <td style={{ padding: "7px 10px", fontSize: 9, color: "#334155" }}>CGST</td>
                                    <td style={{ padding: "7px 10px", fontSize: 9, color: "#334155" }}>{(inv.gstRate || 0) / 2}%</td>
                                    {taxCell}
                                    <td style={{ padding: "7px 10px", textAlign: "right", fontWeight: 600, color: "#1E293B", fontSize: 9 }}>{formatINR(inv.cgst || 0)}</td>
                                  </tr>
                                  <tr>
                                    <td style={{ padding: "7px 10px", fontSize: 9, color: "#334155" }}>SGST</td>
                                    <td style={{ padding: "7px 10px", fontSize: 9, color: "#334155" }}>{(inv.gstRate || 0) / 2}%</td>
                                    {taxCell}
                                    <td style={{ padding: "7px 10px", textAlign: "right", fontWeight: 600, color: "#1E293B", fontSize: 9 }}>{formatINR(inv.sgst || 0)}</td>
                                  </tr>
                                </>
                              ) : (
                                <tr>
                                  <td style={{ padding: "7px 10px", fontSize: 9, color: "#334155" }}>IGST</td>
                                  <td style={{ padding: "7px 10px", fontSize: 9, color: "#334155" }}>{inv.gstRate}%</td>
                                  {taxCell}
                                  <td style={{ padding: "7px 10px", textAlign: "right", fontWeight: 600, color: "#1E293B", fontSize: 9 }}>{formatINR(inv.igst || 0)}</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()}
                  </>
                )}
                <div style={{ padding: "6px 10px", background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: 8 }}>
                  <div style={{ fontSize: 8.5, fontWeight: 700, color: "#0369A1", letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: 3 }}>Amount in Words</div>
                  <div style={{ fontSize: 10.5, fontWeight: 600, color: "#0C4A6E" }}>{amountToWords(inv.total)}</div>
                </div>
              </div>

              {/* Right: Summary rows + Grand Total card */}
              <div style={{ minWidth: 230 }}>
                <div style={{ ...secTitle }}>Summary</div>
                <div style={{ border: "1px solid #DBEAFE", borderRadius: 10, overflow: "hidden", marginBottom: 7 }}>
                  {[
                    {
                      label: isHotel ? (gstTotal > 0 ? "Room Fare (GST Exempt)" : "Room Fare") : isFareType ? (gstTotal > 0 ? "Ticket Fare (GST Exempt)" : "Ticket Fare") : isVisa ? (gstTotal > 0 ? "Embassy / Govt Fee (Exempt)" : "Embassy / Govt Fee") : "Sub Total",
                      value: formatINR(isFareType ? (inv.fareTotal ?? inv.subtotal ?? 0) : isVisa ? embassyTotal : (inv.subtotal ?? 0)),
                    },
                    ...(isFareType || isVisa ? (gstTotal > 0 ? [{
                      label: isHotel ? "Service Charge (Taxable)" : isVisa ? "Service Fee (Taxable)" : "Service Charge (Taxable)",
                      value: formatINR(inv.taxableAmount || 0),
                    }] : []) : []),
                    ...(gstTotal > 0 ? [{ label: `GST @ ${inv.gstRate || 0}%`, value: formatINR(gstTotal) }] : []),
                  ].map((r, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 11px", borderBottom: "1px solid #F1F5F9", fontSize: 9.5, color: "#64748B" }}>
                      <span>{r.label}</span>
                      <span style={{ fontWeight: 600, color: "#1E293B", fontVariantNumeric: "tabular-nums" }}>{r.value}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 11px", fontSize: 10, background: "#EFF6FF" }}>
                    <span style={{ fontWeight: 700, color: "#1E40AF" }}>Gross Total</span>
                    <span style={{ fontWeight: 700, color: "#1E40AF", fontVariantNumeric: "tabular-nums" }}>₹{formatINR(inv.total)}</span>
                  </div>
                </div>
                {/* Grand Total card */}
                <div className="print-grand-compact" style={{ background: "linear-gradient(135deg, #1E40AF 0%, #312E81 60%, #3730A3 100%)", borderRadius: 14, padding: "11px 14px", boxShadow: "0 8px 24px rgba(30,64,175,0.20), 0 2px 8px rgba(49,46,129,0.10)", position: "relative", overflow: "hidden" }}>
                  {/* Very subtle background decoration */}
                  <div style={{ position: "absolute", right: -18, top: -18, width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.02)", pointerEvents: "none" }} />
                  <div style={{ position: "absolute", right: 30, bottom: -25, width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.015)", pointerEvents: "none" }} />
                  <div style={{ position: "absolute", left: -10, top: 10, width: 50, height: 50, borderRadius: "50%", background: "rgba(255,255,255,0.01)", pointerEvents: "none" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 6 }}>Grand Total</div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.6px", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>₹{formatINR(inv.total)}</div>
                      <div style={{ fontSize: 8.5, color: "rgba(255,255,255,0.38)", marginTop: 6 }}>All amounts in INR · Inclusive of all taxes</div>
                    </div>
                    {inv.status === "paid" ? (
                      <div style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 999, padding: "4px 11px", display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 8, color: "#4ADE80" }}>"</span>
                        <span style={{ fontSize: 7.5, fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.5px" }}>PAID</span>
                      </div>
                    ) : balance > 0 ? (
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 3 }}>Paid</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#4ADE80", fontVariantNumeric: "tabular-nums" }}>₹{formatINR(paid)}</div>
                      </div>
                    ) : null}
                  </div>
                  {balance > 0 && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: "1px", textTransform: "uppercase" }}>Balance Due</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#FCA5A5", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.3px" }}>₹{formatINR(balance)}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* -- PAYMENT HISTORY (screen only) -- */}
            {(inv.payments || []).length > 0 && (
              <div style={{ marginBottom: 8 }} className="print:hidden">
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ ...secTitle, marginBottom: 0 }}>Payment History</div>
                  <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
                  <span className={`text-[9px] font-bold uppercase px-2.5 py-1 rounded-full border ${statusCfg.cls}`}>{statusCfg.label}</span>
                </div>
                <div style={{ border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "#E2E8F0"}`, borderRadius: 12, overflow: "hidden" }}>
                  {inv.payments.map((p, i) => (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderBottom: i < inv.payments.length - 1 ? `1px solid ${dark ? "rgba(255,255,255,0.05)" : "#F1F5F9"}` : "none", background: dark ? "rgba(255,255,255,0.02)" : "#fff" }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#ECFDF3", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: dark ? "#E2E8F0" : "#1E293B" }}>
                          {p.mode === "bank" ? "Bank Transfer" : p.mode === "upi" ? "UPI Payment" : p.mode === "cash" ? "Cash" : p.mode === "cheque" ? "Cheque" : "Card"}
                        </div>
                        <div style={{ fontSize: 11, color: dark ? "#94A3B8" : "#64748B", marginTop: 2 }}>
                          {fmtDate(p.date)}{p.bankName ? ` · ${p.bankName}` : ""}{p.refNo ? ` · Ref: ${p.refNo}` : ""}
                        </div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#22C55E" }}>₹{formatINR(p.amount)}</div>
                      <div style={{ display: "flex", gap: 6 }} className="print:hidden">
                        <button onClick={() => openEditPay(p)} title="Edit" style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${dark ? "rgba(255,255,255,0.12)" : "#E2E8F0"}`, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                          <Pencil className="w-3.5 h-3.5" style={{ color: dark ? "#94A3B8" : "#64748B" }} />
                        </button>
                        <button onClick={() => setDelPayId(p.id)} title="Delete" style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid rgba(186,26,26,0.25)", background: "rgba(186,26,26,0.06)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                          <X className="w-3.5 h-3.5" style={{ color: "#B3261E" }} />
                        </button>
                      </div>
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

            {/* -- BANK + TERMS -- */}
            <div className="print-bank-terms" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 6 }}>
              {/* Payment Details */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                  <ShieldCheck style={{ width: 11, height: 11, color: "#2563EB" }} />
                  <div style={{ fontSize: 8.5, fontWeight: 700, color: "#172554", letterSpacing: "0.7px", textTransform: "uppercase" }}>Payment Details</div>
                </div>
                <div style={{ background: "#F8FBFF", border: "1px solid #DBEAFE", borderRadius: 10, padding: "7px 11px" }}>
                  {[
                    ["Account Name", "VIMAL TRAVELS"],
                    ["Bank", COMPANY.bank],
                    ["Account No", COMPANY.accountNo],
                    ["IFSC Code", COMPANY.ifsc],
                    ["Branch", COMPANY.branch],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", paddingBottom: 4, paddingTop: 4, borderBottom: "1px solid #EBF4FF" }}>
                      <span style={{ fontSize: 10, fontWeight: 500, color: "#64748B" }}>{label}</span>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: label === "Account No" || label === "IFSC Code" ? "#172554" : "#1E293B", fontFamily: label === "Account No" || label === "IFSC Code" ? "monospace" : "inherit" }}>{value}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>
                    <ShieldCheck style={{ width: 11, height: 11, color: "#2563EB" }} />
                    <span style={{ fontSize: 8.5, fontWeight: 500, color: "#2563EB" }}>Primary Business Account — Secure Transfer</span>
                  </div>
                  {/* UPI QR */}
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #EBF4FF", display: "flex", alignItems: "center", gap: 10 }}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=upi://pay?pa=${COMPANY.upiId}%26pn=Vimal+Travels`}
                      alt="UPI QR"
                      style={{ width: 70, height: 70, borderRadius: 6, border: "1px solid #DBEAFE", flexShrink: 0 }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <div>
                      <div style={{ fontSize: 8, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>Pay via UPI</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#172554", fontFamily: "monospace" }}>{COMPANY.upiId}</div>
                      <div style={{ fontSize: 8, color: "#94A3B8", marginTop: 2 }}>Scan with any UPI app</div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Terms */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: "linear-gradient(135deg,#7C3AED,#6366F1)", flexShrink: 0 }} />
                  <div style={{ fontSize: 8.5, fontWeight: 700, color: "#172554", letterSpacing: "0.7px", textTransform: "uppercase" }}>Terms & Conditions</div>
                </div>
                <div style={{ padding: "6px 10px", background: "#FFFFFF", border: "1px solid #E8ECFF", borderRadius: 10 }}>
                  <ol style={{ fontSize: 9.5, color: "#64748B", lineHeight: 1.6, paddingLeft: 16, margin: 0 }}>
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

            {/* -- SIGNATURE -- */}
            <div className="print-sig-compact" style={{ display: "grid", gridTemplateColumns: "1fr 1px 1fr", gap: 0, marginBottom: 6 }}>
              <div style={{ paddingRight: 18, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <div style={{ height: 28, borderBottom: "1.5px solid #CBD5E1", marginBottom: 5 }} />
                <div style={{ fontSize: 9, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>Customer Signature</div>
                <div style={{ fontSize: 9, color: "#94A3B8", marginTop: 1 }}>{inv.customer.name}</div>
              </div>
              <div style={{ background: "linear-gradient(to bottom, transparent, #CBD5E1, transparent)", margin: "4px 0" }} />
              <div style={{ paddingLeft: 18, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "flex-end" }}>
                <div style={{ fontSize: 16, color: "#172554", fontStyle: "italic", marginBottom: 4, fontFamily: "Georgia, serif" }}>Vimal Travels</div>
                <div style={{ height: 1.5, width: "100%", background: "linear-gradient(90deg, transparent, #CBD5E1)", marginBottom: 5 }} />
                <div style={{ fontSize: 9, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>Authorised Signatory</div>
                <div style={{ fontSize: 9, color: "#94A3B8", marginTop: 1 }}>For Vimal Travels</div>
              </div>
            </div>

            {/* -- FOOTER -- */}
            <div className="print-footer-compact" style={{ background: "linear-gradient(135deg, #F0F7FF, #F5F9FF)", border: "1px solid #DCE6F2", borderRadius: 12, padding: "7px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#2563EB", marginBottom: 3 }}>Thank you for choosing Vimal Travels!</div>
                <div style={{ fontSize: 8.5, color: "#64748B" }}>This is a computer generated invoice. Certified that the particulars are true and correct.</div>
                <div style={{ fontSize: 8.5, color: "#64748B", marginTop: 2 }}>{COMPANY.email} · {COMPANY.mobile1} / {COMPANY.mobile2}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 8.5, color: "#94A3B8", marginBottom: 2 }}>FY {fy}</div>
                <div style={{ fontSize: 9, fontWeight: 600, color: "#2563EB" }}>IATA Certified Agency</div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* -- DELETE CONFIRM MODAL -- */}
      {/* -- DELETE CONFIRM -- */}
      {delConfirm && (
        <div className="print:hidden fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.55)", backdropFilter:"blur(8px)" }}>
          <div className="w-full max-w-sm p-6 rounded-2xl" style={{ background: dark?"#1C1C1E":"#FFFFFF", border:`1px solid ${dark?"rgba(255,255,255,0.14)":"#E7E0EC"}`, boxShadow:"0 24px 64px rgba(0,0,0,0.35)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background:"rgba(186,26,26,0.12)" }}>
                <Trash2 className="w-5 h-5" style={{ color:"#B3261E" }} />
              </div>
              <div>
                <h2 className="font-bold text-[16px]" style={{ color: dark?"#E6E1E5":"#1C1B1F", fontFamily:"var(--font-roboto),Roboto,system-ui,sans-serif" }}>Delete Invoice?</h2>
                <p className="text-[13px] mt-0.5" style={{ color: dark?"#938F99":"#79747E" }}>{inv.invoiceNo} · {inv.customer.name}</p>
              </div>
            </div>
            <p className="text-[14px] mb-5" style={{ color: dark?"#938F99":"#79747E" }}>This action cannot be undone. The invoice and all payment records will be permanently deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => setDelConfirm(false)} className="flex-1 py-2.5 text-[14px] font-semibold rounded-xl transition-colors"
                style={{ color: dark?"#938F99":"#79747E", border:`1px solid ${dark?"rgba(255,255,255,0.08)":"#E7E0EC"}` }}>Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 text-[14px] font-semibold text-white rounded-xl" style={{ background:"#B3261E" }}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* -- PAYMENT MODAL -- */}
      {payModal && (
        <div className="print:hidden fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.55)", backdropFilter:"blur(8px)" }}>
          <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: dark?"#1C1C1E":"#FFFFFF", border:`1px solid ${dark?"rgba(255,255,255,0.14)":"#E7E0EC"}`, boxShadow:"0 24px 64px rgba(0,0,0,0.35)" }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom:`1px solid ${dark?"rgba(255,255,255,0.07)":"#E7E0EC"}` }}>
              <h2 className="font-bold text-[17px]" style={{ color: dark?"#E6E1E5":"#1C1B1F", fontFamily:"var(--font-roboto),Roboto,system-ui,sans-serif" }}>Record Payment</h2>
              <button onClick={() => setPayModal(false)} style={{ color: dark?"#938F99":"#79747E" }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            {saved ? (
              <div className="py-12 text-center">
                <CheckCircle className="w-14 h-14 mx-auto mb-3" style={{ color:"#22C55E" }} />
                <p className="font-bold text-[18px]" style={{ color: dark?"#E6E1E5":"#1C1B1F" }}>Payment Recorded!</p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div className="rounded-xl p-3 text-[14px]" style={{ background: dark?"rgba(239,68,68,0.12)":"#FEE2E2" }}>
                  <span style={{ color: dark?"#938F99":"#79747E" }}>Balance Due: </span>
                  <span className="font-bold" style={{ color: dark?"#FCA5A5":"#B91C1C" }}>₹{formatINR(balance)}</span>
                </div>
                {[
                  { label:"Amount (₹) *", type:"number", value:payForm.amount, onChange:(v:string)=>setPayForm(f=>({...f,amount:v})), placeholder:balance.toString(), mono:true },
                  { label:"Bank / UPI Name", type:"text", value:payForm.bankName, onChange:(v:string)=>setPayForm(f=>({...f,bankName:v})), placeholder:"ICICI Bank", mono:false },
                  { label:"Reference / UTR No", type:"text", value:payForm.refNo, onChange:(v:string)=>setPayForm(f=>({...f,refNo:v})), placeholder:"UTR / Txn reference", mono:true },
                ].map(({ label, type, value, onChange, placeholder, mono }) => (
                  <div key={label}>
                    <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: dark?"#938F99":"#79747E" }}>{label}</label>
                    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
                      className={`w-full rounded-xl px-3 py-2.5 text-[14px] focus:outline-none transition-colors${mono?" font-mono":""}`}
                      style={{ background: dark?"rgba(255,255,255,0.06)":"#FAF7FF", border:`1px solid ${dark?"rgba(255,255,255,0.14)":"#90E0EF"}`, color: dark?"#E6E1E5":"#1C1B1F" }} />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: dark?"#938F99":"#79747E" }}>Mode</label>
                    <select value={payForm.mode} onChange={e=>setPayForm(f=>({...f,mode:e.target.value as PaymentMode}))}
                      className="w-full rounded-xl px-3 py-2.5 text-[14px] focus:outline-none"
                      style={{ background: dark?"rgba(255,255,255,0.06)":"#FAF7FF", border:`1px solid ${dark?"rgba(255,255,255,0.14)":"#90E0EF"}`, color: dark?"#E6E1E5":"#1C1B1F", colorScheme: dark?"dark":"light" }}>
                      <option value="bank">Bank Transfer</option>
                      <option value="upi">UPI</option>
                      <option value="cash">Cash</option>
                      <option value="cheque">Cheque</option>
                      <option value="card">Card</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: dark?"#938F99":"#79747E" }}>Date</label>
                    <input type="date" value={payForm.date} onChange={e=>setPayForm(f=>({...f,date:e.target.value}))}
                      className="w-full rounded-xl px-3 py-2.5 text-[14px] focus:outline-none"
                      style={{ background: dark?"rgba(255,255,255,0.06)":"#FAF7FF", border:`1px solid ${dark?"rgba(255,255,255,0.14)":"#90E0EF"}`, color: dark?"#E6E1E5":"#1C1B1F" }} />
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button onClick={() => setPayModal(false)} className="flex-1 py-2.5 text-[14px] font-semibold rounded-xl"
                    style={{ color: dark?"#938F99":"#79747E", border:`1px solid ${dark?"rgba(255,255,255,0.08)":"#E7E0EC"}` }}>Cancel</button>
                  <button onClick={handleAddPayment} disabled={!payForm.amount}
                    className="flex-1 py-2.5 text-[14px] font-semibold text-white rounded-xl disabled:opacity-40"
                    style={{ background:"linear-gradient(135deg,#0077B6,#0096C7)" }}>Save Payment</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* -- EDIT PAYMENT MODAL -- */}
      {editPayId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-sm mx-4 rounded-2xl p-6 shadow-2xl" style={{ background: dark ? "#1C1B1F" : "#fff", border: `1px solid ${dark ? "rgba(255,255,255,0.10)" : "#E7E0EC"}` }}>
            <h2 className="font-bold text-[17px] mb-4" style={{ color: dark ? "#E6E1E5" : "#1C1B1F" }}>Edit Payment</h2>
            <div className="flex flex-col gap-3">
              {[
                { label: "Amount (₹)", type: "number", value: editPayForm.amount, onChange: (v: string) => setEditPayForm(f => ({ ...f, amount: v })), placeholder: "0.00" },
                { label: "Bank Name", type: "text", value: editPayForm.bankName, onChange: (v: string) => setEditPayForm(f => ({ ...f, bankName: v })), placeholder: "e.g. SBI" },
                { label: "Reference / UTR No", type: "text", value: editPayForm.refNo, onChange: (v: string) => setEditPayForm(f => ({ ...f, refNo: v })), placeholder: "UTR / Txn reference" },
              ].map(({ label, type, value, onChange, placeholder }) => (
                <div key={label}>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: dark ? "#938F99" : "#79747E" }}>{label}</label>
                  <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                    className="w-full rounded-xl px-3 py-2.5 text-[14px] focus:outline-none"
                    style={{ background: dark ? "rgba(255,255,255,0.06)" : "#FAF7FF", border: `1px solid ${dark ? "rgba(255,255,255,0.14)" : "#90E0EF"}`, color: dark ? "#E6E1E5" : "#1C1B1F" }} />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: dark ? "#938F99" : "#79747E" }}>Mode</label>
                  <select value={editPayForm.mode} onChange={e => setEditPayForm(f => ({ ...f, mode: e.target.value as PaymentMode }))}
                    className="w-full rounded-xl px-3 py-2.5 text-[14px] focus:outline-none"
                    style={{ background: dark ? "rgba(255,255,255,0.06)" : "#FAF7FF", border: `1px solid ${dark ? "rgba(255,255,255,0.14)" : "#90E0EF"}`, color: dark ? "#E6E1E5" : "#1C1B1F", colorScheme: dark ? "dark" : "light" }}>
                    <option value="bank">Bank Transfer</option>
                    <option value="upi">UPI</option>
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                    <option value="card">Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: dark ? "#938F99" : "#79747E" }}>Date</label>
                  <input type="date" value={editPayForm.date} onChange={e => setEditPayForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full rounded-xl px-3 py-2.5 text-[14px] focus:outline-none"
                    style={{ background: dark ? "rgba(255,255,255,0.06)" : "#FAF7FF", border: `1px solid ${dark ? "rgba(255,255,255,0.14)" : "#90E0EF"}`, color: dark ? "#E6E1E5" : "#1C1B1F" }} />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setEditPayId(null)} className="flex-1 py-2.5 text-[14px] font-semibold rounded-xl"
                  style={{ color: dark ? "#938F99" : "#79747E", border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "#E7E0EC"}` }}>Cancel</button>
                <button onClick={handleEditPayment} disabled={!editPayForm.amount}
                  className="flex-1 py-2.5 text-[14px] font-semibold text-white rounded-xl disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg,#0077B6,#0096C7)" }}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -- DELETE PAYMENT CONFIRM -- */}
      {delPayId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-sm mx-4 rounded-2xl p-6 shadow-2xl" style={{ background: dark ? "#1C1B1F" : "#fff", border: `1px solid ${dark ? "rgba(255,255,255,0.10)" : "#E7E0EC"}` }}>
            <div className="flex items-center gap-3 mb-3">
              <X className="w-5 h-5 text-red-600" />
              <h2 className="font-bold text-[16px]" style={{ color: dark ? "#E6E1E5" : "#1C1B1F" }}>Delete Payment?</h2>
            </div>
            <p className="text-[13px] mb-5" style={{ color: dark ? "#938F99" : "#79747E" }}>This payment record will be removed and the invoice balance will be updated.</p>
            <div className="flex gap-3">
              <button onClick={() => setDelPayId(null)} className="flex-1 py-2.5 text-[14px] font-semibold rounded-xl"
                style={{ color: dark ? "#938F99" : "#79747E", border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "#E7E0EC"}` }}>Cancel</button>
              <button onClick={handleDeletePayment}
                className="flex-1 py-2.5 text-[14px] font-semibold text-white rounded-xl"
                style={{ background: "#B3261E" }}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
