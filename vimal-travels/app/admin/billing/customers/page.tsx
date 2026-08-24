"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getCustomers, addCustomer, updateCustomer, deleteCustomer, getInvoices, formatINR, fmtDate,
  amountToWords, type Customer, type CustomerType, type Invoice, type InvoiceStatus, TYPE_LABEL, COMPANY,
} from "@/lib/billing";
import { Plus, Search, Pencil, Trash2, X, Users, Building2, User, Star, BookOpen, ChevronRight, Plane, Package, FileCheck, FileText, Train, Bus, Hotel, Printer } from "lucide-react";
import { useAdminDark } from "@/lib/useAdminDark";

const FONT = "var(--font-roboto), Roboto, system-ui, sans-serif";

const TYPE_ICON: Record<string, any> = {
  "air-intl": Plane, "air-dom": Plane, train: Train, bus: Bus,
  hotel: Hotel, package: Package, visa: FileCheck, other: FileText,
};
const TYPE_COLOR: Record<string, string> = {
  "air-intl":"#1D4ED8","air-dom":"#6D28D9",train:"#047857",bus:"#B45309",
  hotel:"#0E7490",package:"#BE185D",visa:"#0369A1",other:"#475569",
};
const TYPE_BG: Record<string, string> = {
  "air-intl":"#DBEAFE","air-dom":"#EDE9FE",train:"#D1FAE5",bus:"#FEF3C7",
  hotel:"#CFFAFE",package:"#FCE7F3",visa:"#E0F2FE",other:"#F1F5F9",
};
const STATUS_DOT: Record<InvoiceStatus, string> = { paid:"#22C55E", partial:"#F59E0B", due:"#EF4444" };
const STATUS_LBL: Record<InvoiceStatus, string> = { paid:"Paid", partial:"Partial", due:"Due" };

const EMPTY: Omit<Customer, "id" | "code" | "createdAt"> = {
  name: "", mobile: "", email: "", address: "", city: "", state: "Karnataka",
  stateCode: "29", gstin: "", type: "individual",
};

function Initials({ name }: { name: string }) {
  const hue = Array.from(name).reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-[13px] font-bold text-white"
      style={{ background: `hsl(${hue},50%,46%)`, boxShadow:`0 2px 8px hsl(${hue},50%,46%,0.35)` }}>
      {initials}
    </div>
  );
}

function printLedger(cust: Customer, custInvoices: Invoice[]) {
  const totalBilled  = custInvoices.reduce((s, i) => s + i.total, 0);
  const totalPaid    = custInvoices.reduce((s, i) => (i.payments || []).reduce((sp, p) => sp + p.amount, 0) + s, 0);
  const outstanding  = totalBilled - totalPaid;
  const today        = new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });

  const statusStyle: Record<string, string> = {
    paid:    "background:#dcfce7;color:#15803d;border:1px solid #86efac",
    partial: "background:#fef9c3;color:#854d0e;border:1px solid #fde047",
    due:     "background:#fee2e2;color:#dc2626;border:1px solid #fca5a5",
  };
  const statusLabel: Record<string, string> = { paid:"PAID", partial:"PARTIAL", due:"DUE" };

  const rows = custInvoices.map((inv, i) => {
    const paid = (inv.payments || []).reduce((s, p) => s + p.amount, 0);
    const bal  = inv.total - paid;
    const st   = inv.status || "due";
    return `<tr style="border-bottom:1px solid #f1f5f9;background:${i%2===0?"white":"#f8fbff"}">
      <td style="padding:9px 12px;font-size:11px;color:#94a3b8">${i+1}</td>
      <td style="padding:9px 12px;font-family:monospace;font-weight:700;font-size:11.5px;color:#0077B6">${inv.invoiceNo}</td>
      <td style="padding:9px 12px;font-size:11px;color:#334155">${fmtDate(inv.date)}</td>
      <td style="padding:9px 12px;font-size:11px;color:#334155">${TYPE_LABEL[inv.type]}</td>
      <td style="padding:9px 12px;font-size:11.5px;text-align:right;font-weight:600;color:#172554">₹${formatINR(inv.total)}</td>
      <td style="padding:9px 12px;font-size:11.5px;text-align:right;color:#16a34a;font-weight:600">${paid>0?"₹"+formatINR(paid):"—"}</td>
      <td style="padding:9px 12px;font-size:11.5px;text-align:right;color:${bal>0?"#dc2626":"#16a34a"};font-weight:700">${bal>0?"₹"+formatINR(bal):"—"}</td>
      <td style="padding:9px 12px;text-align:center"><span style="font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;${statusStyle[st]}">${statusLabel[st]}</span></td>
    </tr>`;
  }).join("");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
  <title>Ledger — ${cust.name}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
  <style>*{box-sizing:border-box;margin:0;padding:0;font-family:Inter,Arial,sans-serif}body{background:#F3F7FC;color:#1e293b}@media print{*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}body{background:white!important;margin:0;padding:0}.no-print{display:none!important}@page{margin:8mm 10mm;size:A4}.card{box-shadow:none!important;border:none!important;border-radius:0!important;margin:0!important;max-width:100%!important}}.card{background:white;max-width:210mm;margin:20px auto;box-shadow:0 4px 24px rgba(15,23,42,0.08);border-radius:14px;border:1px solid #E3EAF3;overflow:hidden}table{width:100%;border-collapse:collapse}th{background:#F3EFF6;color:#0077B6;padding:9px 12px;font-size:10px;font-weight:700;letter-spacing:0.06em;text-align:left;border-bottom:1.5px solid #90E0EF}th.r{text-align:right}.no-print{display:block}@media print{.no-print{display:none}}</style>
  </head><body>
  <div style="max-width:210mm;margin:0 auto;padding:16px;text-align:right;display:flex;justify-content:flex-end;gap:10px" class="no-print">
    <button onclick="window.print()" style="background:linear-gradient(135deg,#0077B6,#0096C7);color:white;border:none;padding:10px 24px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(0,119,182,0.25)">Print / Save PDF</button>
  </div>
  <div class="card">
    <div style="height:4px;background:linear-gradient(90deg,#0077B6 0%,#0096C7 50%,#90E0EF 100%)"></div>
    <div style="background:linear-gradient(135deg,#ffffff 0%,#F3EFF6 50%,#EDE7F6 100%);padding:16px 24px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #90E0EF">
      <div style="display:flex;align-items:center;gap:12px">
        <img src="/vimal-logo.jpeg" alt="Vimal Travels" style="height:44px;width:auto;max-width:120px;object-fit:contain"/>
        <div>
          <div style="font-size:22px;font-weight:700;color:#1C1B1F;letter-spacing:-0.5px;line-height:1">VIMAL TRAVELS</div>
          <div style="font-size:8px;font-weight:600;color:#0077B6;letter-spacing:1px;text-transform:uppercase;margin-top:2px">Premium Travel Services</div>
          <div style="font-size:10px;color:#64748B;margin-top:2px">${COMPANY.address} · GSTIN: ${COMPANY.gstin}</div>
        </div>
      </div>
      <div style="text-align:right">
        <div style="display:inline-flex;align-items:center;gap:6px;background:#EDE7F6;border:1.5px solid #90E0EF;border-radius:999px;padding:5px 16px;margin-bottom:8px">
          <span style="font-size:10px;font-weight:700;color:#0077B6;letter-spacing:1.2px">CUSTOMER LEDGER</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:3px;align-items:flex-end">
          <span style="font-size:13px;font-weight:700;color:#1C1B1F">${cust.name}</span>
          <span style="font-size:11px;color:#49454F">As on ${today}</span>
        </div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0;background:#FAF7FF;border-bottom:1px solid #E7E0EC">
      <div style="padding:14px 20px;border-right:1px solid #E7E0EC">
        <div style="font-size:9px;font-weight:700;color:#0077B6;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px">Bill To</div>
        <div style="font-size:15px;font-weight:700;color:#1C1B1F">${cust.name}</div>
        ${cust.mobile ? `<div style="font-size:10px;color:#64748B;margin-top:3px">" ${cust.mobile}</div>` : ""}
        ${cust.city ? `<div style="font-size:10px;color:#94A3B8;margin-top:1px">${cust.city}${cust.state?`, ${cust.state}`:""}</div>` : ""}
      </div>
      <div style="padding:14px 20px;border-right:1px solid #E7E0EC;text-align:center">
        <div style="font-size:9px;font-weight:700;color:#0077B6;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px">Total Billed</div>
        <div style="font-size:22px;font-weight:700;color:#1C1B1F;letter-spacing:-0.5px">₹${formatINR(totalBilled)}</div>
        <div style="font-size:10px;color:#94A3B8;margin-top:2px">${custInvoices.length} invoice${custInvoices.length!==1?"s":""}</div>
      </div>
      <div style="padding:14px 20px;display:grid;grid-template-columns:1fr 1fr;gap:0">
        <div style="padding-right:14px;border-right:1px solid #E2E8F0;text-align:center">
          <div style="font-size:9px;font-weight:700;color:#16A34A;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px">Paid</div>
          <div style="font-size:18px;font-weight:700;color:#16A34A">₹${formatINR(totalPaid)}</div>
        </div>
        <div style="padding-left:14px;text-align:center">
          <div style="font-size:9px;font-weight:700;color:${outstanding>0?"#DC2626":"#16A34A"};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px">Outstanding</div>
          <div style="font-size:18px;font-weight:700;color:${outstanding>0?"#DC2626":"#16A34A"}">₹${formatINR(outstanding)}</div>
        </div>
      </div>
    </div>
    <div style="padding:16px 20px">
      <div style="font-size:9px;font-weight:700;color:#1C1B1F;letter-spacing:0.8px;text-transform:uppercase;margin-bottom:10px">Invoice History</div>
      <table>
        <thead><tr><th>#</th><th>Invoice No</th><th>Date</th><th>Service</th><th class="r">Amount</th><th class="r">Paid</th><th class="r">Balance</th><th style="text-align:center">Status</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr style="background:#F3EFF6;border-top:1.5px solid #90E0EF">
            <td colspan="4" style="padding:10px 12px;font-size:11px;font-weight:700;color:#1C1B1F">TOTAL</td>
            <td style="padding:10px 12px;text-align:right;font-weight:700;font-size:12px;color:#1C1B1F">₹${formatINR(totalBilled)}</td>
            <td style="padding:10px 12px;text-align:right;font-weight:700;font-size:12px;color:#16a34a">₹${formatINR(totalPaid)}</td>
            <td style="padding:10px 12px;text-align:right;font-weight:700;font-size:12px;color:${outstanding>0?"#dc2626":"#16a34a"}">₹${formatINR(outstanding)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
    ${outstanding > 0 ? `<div style="margin:0 20px 14px;padding:9px 14px;background:#FFF9E8;border:1px solid #FCD34D;border-radius:9px;font-size:11px"><span style="color:#B45309;font-weight:700">Outstanding: </span><span style="color:#78350F;font-style:italic">${amountToWords(outstanding)}</span></div>` : `<div style="margin:0 20px 14px;padding:9px 14px;background:#F0FDF4;border:1px solid #86EFAC;border-radius:9px;font-size:11px;color:#16a34a;font-weight:600;text-align:center">" All invoices fully paid</div>`}
    <div style="background:#F3EFF6;border-top:1px solid #E7E0EC;padding:10px 20px;display:flex;justify-content:space-between;align-items:center">
      <div><div style="font-size:9px;font-weight:600;color:#0077B6;margin-bottom:2px"> Thank you for choosing Vimal Travels!</div><div style="font-size:10px;color:#64748B">${COMPANY.email} · ${COMPANY.mobile1} / ${COMPANY.mobile2}</div></div>
      <div style="text-align:right"><div style="font-size:9px;color:#94A3B8">Generated on ${today}</div></div>
    </div>
  </div>
  </body></html>`;

  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); }
}

export default function CustomersPage() {
  const dark = useAdminDark();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices,  setInvoices]  = useState<Invoice[]>([]);
  const [search,    setSearch]    = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | CustomerType>("all");
  const [modal,     setModal]     = useState<null | "add" | "edit">(null);
  const [form,      setForm]      = useState<Omit<Customer, "id" | "code" | "createdAt">>(EMPTY);
  const [editId,    setEditId]    = useState<string | null>(null);
  const [delId,     setDelId]     = useState<string | null>(null);
  const [ledgerCust, setLedgerCust] = useState<Customer | null>(null);

  useEffect(() => { reload(); }, []);
  const reload = async () => {
    const [c, i] = await Promise.all([getCustomers(), getInvoices()]);
    setCustomers(c); setInvoices(i);
  };

  const corporate  = customers.filter((c) => c.type === "corporate");
  const individual = customers.filter((c) => c.type === "individual");
  const withGstin  = customers.filter((c) => !!c.gstin);

  const filtered = customers.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.mobile || "").includes(search) ||
      (c.gstin || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.city || "").toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || c.type === typeFilter;
    return matchSearch && matchType;
  });

  const openAdd  = () => { setForm(EMPTY); setModal("add"); };
  const openEdit = (c: Customer) => {
    setForm({ name:c.name, mobile:c.mobile, email:c.email, address:c.address, city:c.city, state:c.state, stateCode:c.stateCode, gstin:c.gstin, type:c.type });
    setEditId(c.id ?? null); setModal("edit");
  };
  const save = async () => {
    if (!form.name || !form.mobile) return;
    if (modal === "add") await addCustomer(form);
    else if (editId)     await updateCustomer(editId, form);
    setModal(null); await reload();
  };
  const confirmDelete = async () => {
    if (delId) { await deleteCustomer(delId); setDelId(null); await reload(); }
  };

  /* -- Theme tokens -- */
  const T = dark ? {
    bg:         "#111111",
    text:       "#E6E1E5",
    textSub:    "#CAC4D0",
    textMuted:  "#938F99",
    cardBg:     "rgba(28,28,30,0.98)",
    cardBorder: "rgba(255,255,255,0.10)",
    divider:    "rgba(255,255,255,0.06)",
    primary:    "#90E0EF",
    primaryBg:  "rgba(255,255,255,0.08)",
    inputBg:    "rgba(255,255,255,0.07)",
    inputBorder:"rgba(255,255,255,0.14)",
    rowHover:   "rgba(255,255,255,0.04)",
    tblHead:    "rgba(255,255,255,0.03)",
    badge:      { corp: { bg:"rgba(124,58,237,0.18)", text:"#C4AAFF", border:"rgba(124,58,237,0.3)" }, ind: { bg:"rgba(255,255,255,0.06)", text:"#938F99", border:"rgba(255,255,255,0.10)" } },
    statBg:     "rgba(28,28,30,0.98)",
    modalBg:    "#1C1C1E",
    modalBorder:"rgba(255,255,255,0.12)",
  } : {
    bg:         "#F4F0FF",
    text:       "#1C1B1F",
    textSub:    "#49454F",
    textMuted:  "#79747E",
    cardBg:     "rgba(255,255,255,0.88)",
    cardBorder: "rgba(255,255,255,0.65)",
    divider:    "rgba(0,119,182,0.08)",
    primary:    "#0077B6",
    primaryBg:  "#F3EFF6",
    inputBg:    "#FAF7FF",
    inputBorder:"#90E0EF",
    rowHover:   "rgba(0,119,182,0.04)",
    tblHead:    "#FAF7FF",
    badge:      { corp: { bg:"#EDE7F6", text:"#0077B6", border:"#90E0EF" }, ind: { bg:"#F4F0FF", text:"#79747E", border:"#CAC4D0" } },
    statBg:     "#FFFFFF",
    modalBg:    "#FFFFFF",
    modalBorder:"#E7E0EC",
  };

  const glass = { background: T.cardBg, backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", border:`1px solid ${T.cardBorder}`, boxShadow: dark?"0 4px 20px rgba(0,0,0,0.28)":"0 4px 20px rgba(0,119,182,0.07)", transition:"background 0.3s ease" } as const;

  const inp = `w-full border rounded-xl px-3 py-2.5 text-[14px] focus:outline-none transition-colors`;
  const lbl = "block text-[11px] font-bold uppercase tracking-wider mb-1.5";

  return (
    <div className="min-h-full" style={{ fontFamily: FONT, transition:"background 0.3s ease" }}>

      {/* -- STICKY HEADER -- */}
      <div className="sticky top-0 z-20 px-5 pt-4 pb-3">
        <div className="rounded-2xl px-5 py-3 flex items-center gap-4" style={glass}>
          <div className="min-w-0">
            <h1 className="font-bold text-lg leading-tight" style={{ color: T.text, letterSpacing: "-0.03em", fontFamily: FONT }}>Customers</h1>
            <p className="text-[12px] font-medium mt-0.5" style={{ color: T.textMuted }}>{customers.length} in master</p>
          </div>
          <div className="flex-1 max-w-[280px] hidden md:block relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: T.textMuted }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, mobile, city..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-[13px] focus:outline-none transition-all"
              style={{ background: T.inputBg, border: `1px solid ${T.inputBorder}`, color: T.text }}
              onFocus={e => { e.currentTarget.style.borderColor = dark?"rgba(208,188,255,0.5)":"rgba(0,119,182,0.5)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = T.inputBorder; }} />
          </div>
          <div className="ml-auto">
            <button onClick={openAdd}
              className="flex items-center gap-2 text-[14px] font-semibold text-white px-4 py-2.5 rounded-[14px] transition-all hover:-translate-y-px"
              style={{ background: "linear-gradient(135deg,#0077B6,#0096C7)", boxShadow: "0 2px 8px rgba(0,119,182,0.35)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(0,119,182,0.50)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,119,182,0.35)"; }}>
              <Plus className="w-4 h-4" /> Add Customer
            </button>
          </div>
        </div>
      </div>

      <div className="px-5 pb-6 space-y-4">

        {/* -- STATS -- */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label:"Total Customers", value: customers.length,  icon: Users,     accent: dark?"#0096C7":"#0077B6", tint: dark?"rgba(0,119,182,0.18)":"#F3EFF6" },
            { label:"Corporate",       value: corporate.length,  icon: Building2, accent: dark?"#C4AAFF":"#7C3AED", tint: dark?"rgba(124,58,237,0.18)":"#EDE7F6" },
            { label:"Individual",      value: individual.length, icon: User,      accent: dark?"#6EE7A6":"#16A34A", tint: dark?"rgba(34,197,94,0.14)":"#F0FDF4"  },
            { label:"GST Registered",  value: withGstin.length,  icon: Star,      accent: dark?"#FBB760":"#D97706", tint: dark?"rgba(245,158,11,0.15)":"#FFFBEB" },
          ].map((s) => (
            <div key={s.label} style={{ background: T.statBg, border:`1px solid ${T.cardBorder}`, borderRadius:16, padding:"16px 18px", display:"flex", alignItems:"center", gap:14, boxShadow: dark?"0 4px 16px rgba(0,0,0,0.22)":"0 3px 10px rgba(0,119,182,0.06)", transition:"background 0.3s ease", position:"relative", overflow:"hidden" }}>
              <div style={{ width:44, height:44, borderRadius:13, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, background: s.tint }}>
                <s.icon style={{ width:22, height:22, color: s.accent }} />
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color: T.textMuted, textTransform:"uppercase", letterSpacing:"0.6px" }}>{s.label}</div>
                <div style={{ fontSize:26, fontWeight:700, color: T.text, marginTop:2, letterSpacing:"-0.04em" }}>{s.value}</div>
              </div>
              <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${s.accent},${s.accent}88)`, borderRadius:"0 0 16px 16px", opacity:0.7 }} />
            </div>
          ))}
        </div>

        {/* -- FILTER BAR -- */}
        <div style={{ background: T.cardBg, border:`1px solid ${T.cardBorder}`, borderRadius:16, padding:"12px 14px", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", overflow:"hidden", position:"relative" }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg,#0077B6,#0096C7,transparent)", opacity:0.5 }} />
          <div className="flex gap-3 items-center">
            <div className="relative flex-1 md:hidden">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: T.textMuted }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers..."
                style={{ width:"100%", paddingLeft:36, paddingRight:16, paddingTop:9, paddingBottom:9, background: T.inputBg, border:`1px solid ${T.inputBorder}`, borderRadius:10, fontSize:14, color: T.text, outline:"none" }} />
            </div>
            <div className="flex gap-1.5">
              {(["all", "individual", "corporate"] as const).map((t) => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  style={{ padding:"7px 16px", borderRadius:10, fontSize:13, fontWeight:600, cursor:"pointer", border:"none", transition:"all 0.15s",
                    background: typeFilter===t ? "linear-gradient(135deg,#0077B6,#0096C7)" : (dark?"rgba(255,255,255,0.06)":"#F3EFF6"),
                    color: typeFilter===t ? "white" : T.textMuted, textTransform:"capitalize" }}>
                  {t === "all" ? "All Types" : t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* -- TABLE -- */}
        {filtered.length === 0 ? (
          <div style={{ background: T.cardBg, border:`1px solid ${T.cardBorder}`, borderRadius:16, padding:"80px 0", textAlign:"center" }}>
            <div style={{ width:68, height:68, borderRadius:"50%", background:`linear-gradient(135deg,${dark?"rgba(0,119,182,0.20)":"rgba(0,119,182,0.12)"},${dark?"rgba(0,150,199,0.10)":"rgba(0,150,199,0.06)"})`, border:`1.5px solid ${dark?"rgba(0,119,182,0.30)":"rgba(0,119,182,0.20)"}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
              <Users style={{ width:28, height:28, color: dark?"#48CAE4":"#0077B6" }} />
            </div>
            <p style={{ color: T.textMuted, fontSize:14, fontWeight:500 }}>{search ? "No matching customers" : "No customers yet"}</p>
            {!search && (
              <button onClick={openAdd} style={{ display:"inline-flex", alignItems:"center", gap:6, color: T.primary, fontSize:14, marginTop:8, fontWeight:600, background:"none", border:"none", cursor:"pointer" }}>
                <Plus style={{ width:14, height:14 }} /> Add first customer
              </button>
            )}
          </div>
        ) : (
          <div style={{ background: T.cardBg, border:`1px solid ${T.cardBorder}`, borderRadius:16, overflow:"hidden", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", boxShadow: dark?"0 4px 20px rgba(0,0,0,0.28)":"0 3px 12px rgba(0,119,182,0.07)" }}>
            <table className="w-full" style={{ fontSize:14, borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background: T.tblHead, borderBottom:`1.5px solid ${T.divider}` }}>
                  {["Customer","Mobile","City","GSTIN","Type","Actions"].map((h, i) => (
                    <th key={h} style={{ textAlign: i===5?"right":"left", padding:"11px 16px", fontSize:11, fontWeight:700, color: T.primary, letterSpacing:"0.5px", textTransform:"uppercase" }}
                      className={i===2?"hidden md:table-cell":i===3?"hidden lg:table-cell":""}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} style={{ borderBottom:`1px solid ${T.divider}`, transition:"background 0.15s, box-shadow 0.15s" }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = T.rowHover; el.style.boxShadow = `inset 3px 0 0 ${dark?"#48CAE4":"#0077B6"}`; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.boxShadow = "none"; }}>
                    <td style={{ padding:"13px 16px" }}>
                      <div className="flex items-center gap-3">
                        <Initials name={c.name} />
                        <div>
                          <div style={{ fontWeight:600, color: T.text, fontSize:14 }}>{c.name}</div>
                          <div style={{ fontSize:11, color: T.textMuted, fontFamily:"monospace", marginTop:2 }}>{c.code}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:"13px 16px", color: T.textSub, fontSize:14 }}>{c.mobile}</td>
                    <td style={{ padding:"13px 16px", color: T.textMuted, fontSize:13 }} className="hidden md:table-cell">{c.city || <span style={{ color: T.textMuted }}>—</span>}</td>
                    <td style={{ padding:"13px 16px" }} className="hidden lg:table-cell">
                      {c.gstin ? (
                        <span style={{ fontFamily:"monospace", fontSize:12, color: T.primary, background: T.primaryBg, padding:"2px 8px", borderRadius:6, border:`1px solid ${T.cardBorder}` }}>{c.gstin}</span>
                      ) : <span style={{ color: T.textMuted }}>—</span>}
                    </td>
                    <td style={{ padding:"13px 16px" }}>
                      <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:11, fontWeight:700, textTransform:"uppercase", padding:"4px 11px", borderRadius:999,
                        background: c.type==="corporate" ? T.badge.corp.bg : T.badge.ind.bg,
                        color: c.type==="corporate" ? T.badge.corp.text : T.badge.ind.text,
                        border:`1px solid ${c.type==="corporate" ? T.badge.corp.border : T.badge.ind.border}` }}>
                        {c.type==="corporate" ? <Building2 style={{ width:10, height:10 }} /> : <User style={{ width:10, height:10 }} />}
                        {c.type}
                      </span>
                    </td>
                    <td style={{ padding:"13px 16px" }}>
                      <div className="flex items-center gap-1.5 justify-end">
                        <button onClick={() => setLedgerCust(c)} style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 11px", background: T.primaryBg, border:`1px solid ${T.cardBorder}`, borderRadius:8, color: T.primary, fontSize:12, fontWeight:600, cursor:"pointer" }}>
                          <BookOpen style={{ width:13, height:13 }} /> Ledger
                        </button>
                        <button onClick={() => openEdit(c)} style={{ padding:"7px", background: dark?"rgba(255,255,255,0.06)":"#F8FAFC", border:`1px solid ${T.divider}`, borderRadius:8, color: T.textMuted, cursor:"pointer", display:"flex" }}>
                          <Pencil style={{ width:13, height:13 }} />
                        </button>
                        <button onClick={() => setDelId(c.id ?? null)} style={{ padding:"7px", background:"rgba(186,26,26,0.10)", border:"1px solid rgba(186,26,26,0.20)", borderRadius:8, color:"#B3261E", cursor:"pointer", display:"flex" }}>
                          <Trash2 style={{ width:13, height:13 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding:"9px 16px", borderTop:`1px solid ${T.divider}`, background: T.tblHead }}>
              <span style={{ fontSize:12, color: T.textMuted }}>Showing {filtered.length} of {customers.length} customers</span>
            </div>
          </div>
        )}
      </div>

      {/* -- ADD/EDIT MODAL -- */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.50)", backdropFilter:"blur(8px)" }}
          onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="w-full max-w-lg rounded-2xl overflow-hidden" style={{ background: T.modalBg, border:`1px solid ${T.modalBorder}`, boxShadow:"0 24px 64px rgba(0,0,0,0.35)", fontFamily: FONT }}>
            <div style={{ height:3, background:"linear-gradient(90deg,#0077B6,#0096C7,#48CAE4)" }} />
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom:`1px solid ${T.divider}` }}>
              <div className="flex items-center gap-2.5">
                <div style={{ width:3, height:20, borderRadius:2, background:"linear-gradient(180deg,#0077B6,#0096C7)", flexShrink:0 }} />
                <h2 className="font-bold text-[17px]" style={{ color: T.text, fontFamily:"var(--font-roboto),Roboto,system-ui,sans-serif" }}>{modal==="add" ? "Add Customer" : "Edit Customer"}</h2>
              </div>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg transition-colors" style={{ color: T.textMuted }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = T.rowHover; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={lbl} style={{ color: T.textMuted }}>Customer Type</label>
                <div className="flex gap-2">
                  {(["individual", "corporate"] as CustomerType[]).map((t) => (
                    <button key={t} onClick={() => setForm((f) => ({ ...f, type: t }))}
                      className="flex-1 py-2.5 text-[14px] font-semibold rounded-xl border transition-colors capitalize flex items-center justify-center gap-2"
                      style={{ background: form.type===t ? "linear-gradient(135deg,#0077B6,#0096C7)" : (dark?"rgba(255,255,255,0.06)":"#FAF7FF"), color: form.type===t ? "white" : T.textSub, border: form.type===t ? "none" : `1px solid ${T.inputBorder}` }}>
                      {t==="corporate" ? <Building2 className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={lbl} style={{ color: T.textMuted }}>Full Name *</label>
                  <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Customer name" className={inp} style={{ background: T.inputBg, border:`1px solid ${T.inputBorder}`, color: T.text }} />
                </div>
                <div>
                  <label className={lbl} style={{ color: T.textMuted }}>Mobile *</label>
                  <input value={form.mobile} onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))} placeholder="9886114440" className={inp} style={{ background: T.inputBg, border:`1px solid ${T.inputBorder}`, color: T.text }} />
                </div>
                <div>
                  <label className={lbl} style={{ color: T.textMuted }}>Email</label>
                  <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="email@company.com" className={inp} style={{ background: T.inputBg, border:`1px solid ${T.inputBorder}`, color: T.text }} />
                </div>
                <div className="col-span-2">
                  <label className={lbl} style={{ color: T.textMuted }}>Address</label>
                  <textarea value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Street address" rows={2} className={`${inp} resize-none`} style={{ background: T.inputBg, border:`1px solid ${T.inputBorder}`, color: T.text }} />
                </div>
                <div>
                  <label className={lbl} style={{ color: T.textMuted }}>City</label>
                  <input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} placeholder="Bangalore" className={inp} style={{ background: T.inputBg, border:`1px solid ${T.inputBorder}`, color: T.text }} />
                </div>
                <div>
                  <label className={lbl} style={{ color: T.textMuted }}>State</label>
                  <input value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} placeholder="Karnataka" className={inp} style={{ background: T.inputBg, border:`1px solid ${T.inputBorder}`, color: T.text }} />
                </div>
                <div>
                  <label className={lbl} style={{ color: T.textMuted }}>State Code</label>
                  <input value={form.stateCode} onChange={(e) => setForm((f) => ({ ...f, stateCode: e.target.value }))} placeholder="29" className={inp} style={{ background: T.inputBg, border:`1px solid ${T.inputBorder}`, color: T.text }} />
                </div>
                <div>
                  <label className={lbl} style={{ color: T.textMuted }}>GSTIN</label>
                  <input value={form.gstin} onChange={(e) => setForm((f) => ({ ...f, gstin: e.target.value.toUpperCase() }))} placeholder="29AAECI2916C1ZT" className={`${inp} font-mono`} style={{ background: T.inputBg, border:`1px solid ${T.inputBorder}`, color: T.text }} />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 flex justify-end gap-3" style={{ borderTop:`1px solid ${T.divider}` }}>
              <button onClick={() => setModal(null)} className="px-4 py-2 text-[14px] font-semibold rounded-xl transition-colors" style={{ color: T.textMuted }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = T.rowHover; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>Cancel</button>
              <button onClick={save} disabled={!form.name || !form.mobile}
                className="px-5 py-2 text-[14px] font-semibold text-white rounded-xl transition-all disabled:opacity-40"
                style={{ background:"linear-gradient(135deg,#0077B6,#0096C7)", boxShadow:"0 2px 8px rgba(0,119,182,0.30)" }}>
                {modal==="add" ? "Add Customer" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -- DELETE CONFIRM -- */}
      {delId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.50)", backdropFilter:"blur(8px)" }}>
          <div className="rounded-2xl p-6 max-w-sm w-full" style={{ background: T.modalBg, border:`1px solid ${T.modalBorder}`, boxShadow:"0 24px 64px rgba(0,0,0,0.35)", fontFamily: FONT }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background:"rgba(186,26,26,0.12)" }}>
              <Trash2 className="w-5 h-5" style={{ color:"#B3261E" }} />
            </div>
            <h3 className="font-bold text-[17px] mb-1" style={{ color: T.text, fontFamily:"var(--font-roboto),Roboto,system-ui,sans-serif" }}>Delete Customer?</h3>
            <p className="text-[14px] mb-5" style={{ color: T.textMuted }}>This cannot be undone. Existing invoices will not be affected.</p>
            <div className="flex gap-3">
              <button onClick={() => setDelId(null)} className="flex-1 py-2.5 text-[14px] font-semibold rounded-xl transition-colors" style={{ color: T.textMuted, border:`1px solid ${T.divider}` }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = T.rowHover; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 text-[14px] font-semibold text-white rounded-xl transition-colors" style={{ background:"#B3261E" }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* -- LEDGER SLIDE-IN -- */}
      {ledgerCust && (() => {
        const custInvoices = invoices.filter((inv) => inv.customerId === ledgerCust.id || inv.customer?.name?.toLowerCase() === ledgerCust.name?.toLowerCase());
        const totalBilled = custInvoices.reduce((s, i) => s + i.total, 0);
        const totalPaid   = custInvoices.reduce((s, i) => (i.payments || []).reduce((sp, p) => sp + p.amount, 0) + s, 0);
        const outstanding = totalBilled - totalPaid;
        return (
          <>
            <div className="fixed inset-0 z-40" style={{ background:"rgba(0,0,0,0.35)" }} onClick={() => setLedgerCust(null)} />
            <div className="fixed right-0 top-0 h-full w-full max-w-lg z-50 flex flex-col" style={{ background: T.modalBg, borderLeft:`1px solid ${T.modalBorder}`, boxShadow:"-4px 0 32px rgba(0,0,0,0.20)", fontFamily: FONT }}>
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom:`1px solid ${T.divider}` }}>
                <div className="flex items-center gap-3">
                  <Initials name={ledgerCust.name} />
                  <div>
                    <div className="font-bold text-[16px]" style={{ color: T.text }}>{ledgerCust.name}</div>
                    <div className="text-[12px] mt-0.5" style={{ color: T.textMuted }}>{ledgerCust.mobile} · {ledgerCust.city || "—"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => printLedger(ledgerCust, custInvoices)}
                    className="flex items-center gap-1.5 text-[12px] font-bold px-3 py-1.5 rounded-xl transition-colors"
                    style={{ background: T.primaryBg, color: T.primary, border:`1px solid ${T.cardBorder}` }}>
                    <Printer className="w-3.5 h-3.5" /> Print Ledger
                  </button>
                  <button onClick={() => setLedgerCust(null)} className="p-1.5 rounded-lg" style={{ color: T.textMuted }}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 p-4" style={{ borderBottom:`1px solid ${T.divider}` }}>
                {[
                  { label:"Total Billed", value:`₹${formatINR(totalBilled)}`, color: T.text },
                  { label:"Paid",         value:`₹${formatINR(totalPaid)}`,   color:"#22C55E" },
                  { label:"Outstanding",  value:`₹${formatINR(outstanding)}`, color: outstanding>0?"#EF4444":"#22C55E" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: dark?"rgba(255,255,255,0.04)":"#FAF7FF", border:`1px solid ${T.divider}` }}>
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: T.textMuted }}>{s.label}</div>
                    <div className="font-bold text-[14px] mt-1 tabular-nums" style={{ color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto">
                {custInvoices.length === 0 ? (
                  <div className="py-20 text-center">
                    <FileText className="w-10 h-10 mx-auto mb-3" style={{ color: T.textMuted }} />
                    <p className="text-[14px]" style={{ color: T.textMuted }}>No invoices for this customer</p>
                    <Link href="/admin/billing/invoices/new" className="inline-flex items-center gap-1.5 text-[14px] mt-2 font-semibold" style={{ color: T.primary }}>
                      <Plus className="w-3.5 h-3.5" /> Create Invoice
                    </Link>
                  </div>
                ) : (
                  <div style={{ borderColor: T.divider }}>
                    {custInvoices.map((inv) => {
                      const Icon = TYPE_ICON[inv.type] || FileText;
                      const invPaid = (inv.payments || []).reduce((s, p) => s + p.amount, 0);
                      const invBal  = inv.total - invPaid;
                      return (
                        <Link key={inv.id} href={`/admin/billing/invoices/${inv.id}`}
                          className="flex items-center gap-3 px-5 py-4 transition-colors group"
                          style={{ borderBottom:`1px solid ${T.divider}` }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = T.rowHover; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                          <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                            style={{ background: TYPE_BG[inv.type] || "#F1F5F9" }}>
                            <Icon className="w-4 h-4" style={{ color: TYPE_COLOR[inv.type] || "#475569" }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[12px] font-bold" style={{ color: T.primary }}>{inv.invoiceNo}</span>
                              <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                style={{ background: STATUS_DOT[inv.status] + "22", color: STATUS_DOT[inv.status] }}>
                                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: STATUS_DOT[inv.status] }} />
                                {STATUS_LBL[inv.status]}
                              </span>
                            </div>
                            <div className="text-[12px] mt-0.5" style={{ color: T.textMuted }}>{TYPE_LABEL[inv.type]} · {fmtDate(inv.date)}</div>
                            {invBal > 0 && inv.status !== "paid" && (
                              <div className="text-[12px] font-semibold mt-0.5" style={{ color:"#EF4444" }}>Due: ₹{formatINR(invBal)}</div>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-bold text-[14px] tabular-nums" style={{ color: T.text }}>₹{formatINR(inv.total)}</div>
                            {invPaid > 0 && <div className="text-[12px] font-semibold" style={{ color:"#22C55E" }}>₹{formatINR(invPaid)} paid</div>}
                          </div>
                          <ChevronRight className="w-4 h-4 shrink-0 transition-colors" style={{ color: T.textMuted }} />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="px-6 py-3 flex items-center justify-between" style={{ borderTop:`1px solid ${T.divider}` }}>
                <span className="text-[12px]" style={{ color: T.textMuted }}>{custInvoices.length} invoice{custInvoices.length!==1?"s":""}</span>
                <Link href="/admin/billing/invoices/new" className="flex items-center gap-1.5 text-[12px] font-bold transition-colors" style={{ color: T.primary }}>
                  <Plus className="w-3.5 h-3.5" /> New Invoice
                </Link>
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
}
