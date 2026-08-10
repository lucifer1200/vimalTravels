"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getCustomers, addCustomer, updateCustomer, deleteCustomer, getInvoices, formatINR, fmtDate,
  amountToWords, type Customer, type CustomerType, type Invoice, type InvoiceStatus, TYPE_LABEL, COMPANY,
} from "@/lib/billing";
import { Plus, Search, Pencil, Trash2, X, Users, Building2, User, Star, BookOpen, ChevronRight, Plane, Package, FileCheck, FileText, Train, Bus, Hotel, Printer } from "lucide-react";

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
    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[12px] font-bold text-white"
      style={{ background: `hsl(${hue},55%,52%)` }}>
      {initials}
    </div>
  );
}

const inp = "w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors";
const lbl = "block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1";

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
      <td style="padding:9px 12px;font-family:monospace;font-weight:700;font-size:11.5px;color:#1d4ed8">${inv.invoiceNo}</td>
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
  <style>
    *{box-sizing:border-box;margin:0;padding:0;font-family:Inter,Arial,sans-serif}
    body{background:#F3F7FC;color:#1e293b}
    @media print{
      *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important}
      body{background:white!important;margin:0;padding:0}
      .no-print{display:none!important}
      @page{margin:8mm 10mm;size:A4}
      .card{box-shadow:none!important;border:none!important;border-radius:0!important;margin:0!important;max-width:100%!important}
    }
    .card{background:white;max-width:210mm;margin:20px auto;box-shadow:0 4px 24px rgba(15,23,42,0.08);border-radius:14px;border:1px solid #E3EAF3;overflow:hidden}
    table{width:100%;border-collapse:collapse}
    th{background:#EFF6FF;color:#1D4ED8;padding:9px 12px;font-size:10px;font-weight:700;letter-spacing:0.06em;text-align:left;border-bottom:1.5px solid #BFDBFE}
    th.r{text-align:right}
    .no-print{display:block}
    @media print{.no-print{display:none}}
  </style>
  </head><body>
  <div style="max-width:210mm;margin:0 auto;padding:16px;text-align:right;display:flex;justify-content:flex-end;gap:10px" class="no-print">
    <button id="waBtn" onclick="sendWhatsApp()" style="background:#25d366;color:white;border:none;padding:10px 20px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:8px;box-shadow:0 4px 12px rgba(37,211,102,0.3)">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
      WhatsApp + PDF
    </button>
    <button onclick="window.print()" style="background:linear-gradient(135deg,#2563EB,#4F46E5);color:white;border:none;padding:10px 24px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(37,99,235,0.25)">🖨 Print / Save PDF</button>
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
  <script>
    async function sendWhatsApp() {
      const phone = "${(cust.mobile || "").replace(/\D/g, "")}";
      if (!phone) { alert("Customer mobile number not set"); return; }
      const msg = "Dear ${cust.name},\\n\\nPlease find your account statement from Vimal Travels.\\n\\nOutstanding: ₹${formatINR(outstanding)}\\n\\nThank you for choosing Vimal Travels!\\n📞 ${COMPANY.mobile1} | ${COMPANY.mobile2}\\n✉ ${COMPANY.email}";
      const waUrl = "https://wa.me/91" + phone + "?text=" + encodeURIComponent(msg);
      const btn = document.getElementById("waBtn");
      btn.textContent = "Generating PDF…";
      btn.disabled = true;
      try {
        const el = document.querySelector(".card");
        await html2pdf().set({
          margin: [5, 7, 5, 7],
          filename: "Ledger-${cust.name.replace(/\s+/g, "-")}.pdf",
          image: { type: "jpeg", quality: 0.97 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
        }).from(el).save();
        window.open(waUrl, "_blank");
      } catch(e) {
        window.open(waUrl, "_blank");
      } finally {
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg> WhatsApp + PDF';
        btn.disabled = false;
      }
    }
  </script>
  <div class="card">
    <!-- Rainbow Accent Bar -->
    <div style="height:4px;background:linear-gradient(90deg,#2563EB 0%,#06B6D4 25%,#7C3AED 60%,#F59E0B 100%)"></div>

    <!-- Premium Light Header -->
    <div style="background:linear-gradient(135deg,#ffffff 0%,#F0F7FF 50%,#EBF4FF 100%);padding:16px 24px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #DBEAFE;position:relative;overflow:hidden">
      <div style="position:absolute;right:0;top:0;width:40%;height:100%;background:url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&auto=format&fit=crop&q=30') center/cover;opacity:0.07;mask-image:linear-gradient(to right,transparent,rgba(0,0,0,0.8));-webkit-mask-image:linear-gradient(to right,transparent,rgba(0,0,0,0.8))"></div>
      <div style="display:flex;align-items:center;gap:12px;position:relative;z-index:1">
        <img src="/vimal-logo.jpeg" alt="Vimal Travels" style="height:44px;width:auto;max-width:120px;object-fit:contain" onerror="this.style.display='none';var b=this.parentElement;b.style.cssText='width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#1E3A8A,#2563EB);display:flex;align-items:center;justify-content:center;';var s=document.createElement('span');s.textContent='VT';s.style.cssText='font-weight:700;font-size:13px;color:white;';b.appendChild(s);"/>
        <div>
          <div style="font-size:22px;font-weight:700;color:#172554;letter-spacing:-0.5px;line-height:1">VIMAL TRAVELS</div>
          <div style="font-size:8px;font-weight:600;color:#2563EB;letter-spacing:1px;text-transform:uppercase;margin-top:2px">Premium Travel Services</div>
          <div style="font-size:10px;color:#64748B;margin-top:2px">${COMPANY.address} · GSTIN: ${COMPANY.gstin}</div>
        </div>
      </div>
      <div style="text-align:right;position:relative;z-index:1">
        <div style="display:inline-flex;align-items:center;gap:6px;background:#EFF6FF;border:1.5px solid #93C5FD;border-radius:999px;padding:5px 16px;margin-bottom:8px">
          <span style="font-size:10px;font-weight:700;color:#2563EB;letter-spacing:1.2px">CUSTOMER LEDGER</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:3px;align-items:flex-end">
          <div style="display:flex;gap:8px;align-items:baseline">
            <span style="font-size:10px;font-weight:500;color:#94A3B8">CUSTOMER</span>
            <span style="font-size:13px;font-weight:700;color:#172554">${cust.name}</span>
          </div>
          <div style="display:flex;gap:8px;align-items:baseline">
            <span style="font-size:10px;font-weight:500;color:#94A3B8">AS ON</span>
            <span style="font-size:11px;font-weight:600;color:#1E293B">${today}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 3-Card Summary Row -->
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0;background:#F8FBFF;border-bottom:1px solid #DCE6F2">
      <div style="padding:14px 20px;border-right:1px solid #DCE6F2">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">
          <div style="width:14px;height:14px;border-radius:50%;background:linear-gradient(135deg,#2563EB,#06B6D4);display:flex;align-items:center;justify-content:center">
            <span style="font-size:7px;color:white;font-weight:700">B</span>
          </div>
          <span style="font-size:9px;font-weight:700;color:#2563EB;text-transform:uppercase;letter-spacing:0.5px">Bill To</span>
        </div>
        <div style="font-size:15px;font-weight:700;color:#172554">${cust.name}</div>
        ${cust.mobile ? `<div style="font-size:10px;color:#64748B;margin-top:3px">📞 ${cust.mobile}</div>` : ""}
        ${cust.city ? `<div style="font-size:10px;color:#94A3B8;margin-top:1px">${cust.city}${cust.state?`, ${cust.state}`:""}</div>` : ""}
        ${cust.gstin ? `<div style="font-size:10px;font-family:monospace;font-weight:600;color:#2563EB;margin-top:4px;background:#EFF6FF;padding:1px 6px;border-radius:4px;display:inline-block">GSTIN: ${cust.gstin}</div>` : ""}
      </div>
      <div style="padding:14px 20px;border-right:1px solid #DCE6F2;text-align:center">
        <div style="font-size:9px;font-weight:700;color:#0891B2;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px">Total Billed</div>
        <div style="font-size:22px;font-weight:700;color:#172554;letter-spacing:-0.5px">${formatINR(totalBilled)}</div>
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

    <!-- Invoice History -->
    <div style="padding:16px 20px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <div style="width:20px;height:20px;border-radius:6px;background:linear-gradient(135deg,#2563EB,#06B6D4);display:flex;align-items:center;justify-content:center">
          <span style="font-size:11px">✈</span>
        </div>
        <div style="font-size:9px;font-weight:700;color:#172554;letter-spacing:0.8px;text-transform:uppercase">Invoice History</div>
        <div style="flex:1;height:1.5px;background:linear-gradient(90deg,#BFDBFE,transparent)"></div>
      </div>
      <table>
        <thead><tr>
          <th>#</th><th>Invoice No</th><th>Date</th><th>Service</th>
          <th class="r">Amount</th><th class="r">Paid</th><th class="r">Balance</th><th style="text-align:center">Status</th>
        </tr></thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr style="background:#EFF6FF;border-top:1.5px solid #BFDBFE">
            <td colspan="4" style="padding:10px 12px;font-size:11px;font-weight:700;color:#172554">TOTAL</td>
            <td style="padding:10px 12px;text-align:right;font-weight:700;font-size:12px;color:#172554">₹${formatINR(totalBilled)}</td>
            <td style="padding:10px 12px;text-align:right;font-weight:700;font-size:12px;color:#16a34a">₹${formatINR(totalPaid)}</td>
            <td style="padding:10px 12px;text-align:right;font-weight:700;font-size:12px;color:${outstanding>0?"#dc2626":"#16a34a"}">₹${formatINR(outstanding)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Amount in Words -->
    ${outstanding > 0 ? `<div style="margin:0 20px 14px;padding:9px 14px;background:#FFF9E8;border:1px solid #FCD34D;border-radius:9px;font-size:11px">
      <span style="color:#B45309;font-weight:700;font-size:9px;text-transform:uppercase;letter-spacing:0.5px">Outstanding in Words: </span>
      <span style="color:#78350F;font-style:italic;font-weight:600">${amountToWords(outstanding)}</span>
    </div>` : `<div style="margin:0 20px 14px;padding:9px 14px;background:#F0FDF4;border:1px solid #86EFAC;border-radius:9px;font-size:11px;color:#16a34a;font-weight:600;text-align:center">✓ All invoices fully paid</div>`}

    <!-- Terms & Conditions -->
    <div style="margin:0 20px 14px;display:grid;grid-template-columns:1fr 1fr;gap:14px">
      <div>
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:7px">
          <div style="width:8px;height:8px;border-radius:2px;background:linear-gradient(135deg,#7C3AED,#6366F1);flex-shrink:0"></div>
          <div style="font-size:8px;font-weight:700;color:#172554;letter-spacing:0.7px;text-transform:uppercase">Terms &amp; Conditions</div>
        </div>
        <div style="padding:9px 12px;background:#FFFFFF;border:1px solid #E8ECFF;border-radius:10px;font-size:9px;color:#475569;line-height:1.7">
          <div>1. All payments are due as per agreed terms.</div>
          <div>2. Cancellation charges apply per airline/hotel policy.</div>
          <div>3. Vimal Travels is not liable for delays or cancellations by carriers.</div>
          <div>4. Disputes subject to Bangalore jurisdiction only.</div>
        </div>
      </div>
      <div>
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:7px">
          <div style="width:8px;height:8px;border-radius:2px;background:linear-gradient(135deg,#0EA5E9,#06B6D4);flex-shrink:0"></div>
          <div style="font-size:8px;font-weight:700;color:#172554;letter-spacing:0.7px;text-transform:uppercase">Payment Details</div>
        </div>
        <div style="padding:9px 12px;background:#FFFFFF;border:1px solid #DCE6F2;border-radius:10px;font-size:9px;color:#475569;line-height:1.8">
          <div><span style="font-weight:700;color:#172554">Bank:</span> Canara Bank, Gokula Branch</div>
          <div><span style="font-weight:700;color:#172554">A/C No:</span> 0427101073872</div>
          <div><span style="font-weight:700;color:#172554">IFSC:</span> CNRB0000427</div>
          <div><span style="font-weight:700;color:#172554">UPI:</span> vimaltrls@ybl</div>
        </div>
      </div>
    </div>

    <!-- Signature -->
    <div style="margin:0 20px 14px;display:grid;grid-template-columns:1fr 1px 1fr;gap:0">
      <div style="padding-right:20px;display:flex;flex-direction:column;justify-content:flex-end">
        <div style="height:28px;border-bottom:1.5px solid #CBD5E1;margin-bottom:5px"></div>
        <div style="font-size:7px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.5px">Customer Signature</div>
        <div style="font-size:7px;color:#94A3B8;margin-top:1px">${cust.name}</div>
      </div>
      <div style="background:linear-gradient(to bottom,transparent,#CBD5E1,transparent);margin:4px 0"></div>
      <div style="padding-left:20px;display:flex;flex-direction:column;justify-content:flex-end;align-items:flex-end">
        <div style="font-size:14px;color:#172554;font-style:italic;margin-bottom:4px;font-family:Georgia,serif">Vimal Travels</div>
        <div style="height:1.5px;width:100%;background:linear-gradient(90deg,transparent,#CBD5E1);margin-bottom:5px"></div>
        <div style="font-size:7px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.5px">Authorised Signatory</div>
        <div style="font-size:7px;color:#94A3B8;margin-top:1px">For Vimal Travels</div>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:linear-gradient(135deg,#F0F7FF,#F5F9FF);border-top:1px solid #DCE6F2;border-radius:0 0 14px 14px;padding:10px 20px;display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-size:9px;font-weight:600;color:#2563EB;margin-bottom:2px">✈ Thank you for choosing Vimal Travels!</div>
        <div style="font-size:10px;color:#64748B">${COMPANY.email} · ${COMPANY.mobile1} / ${COMPANY.mobile2}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:10px;font-weight:600;color:#2563EB">IATA Certified Agency</div>
        <div style="font-size:9px;color:#94A3B8;margin-top:1px">Generated on ${today}</div>
      </div>
    </div>
  </div>
  </body></html>`;

  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); }
}

export default function CustomersPage() {
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

  const corporate = customers.filter((c) => c.type === "corporate");
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

  const openAdd = () => { setForm(EMPTY); setModal("add"); };
  const openEdit = (c: Customer) => {
    setForm({ name:c.name, mobile:c.mobile, email:c.email, address:c.address, city:c.city, state:c.state, stateCode:c.stateCode, gstin:c.gstin, type:c.type });
    setEditId(c.id ?? null); setModal("edit");
  };

  const save = async () => {
    if (!form.name || !form.mobile) return;
    if (modal === "add") await addCustomer(form);
    else if (editId)     await updateCustomer(editId, form);
    setModal(null);
    await reload();
  };

  const confirmDelete = async () => {
    if (delId) { await deleteCustomer(delId); setDelId(null); await reload(); }
  };

  return (
    <div className="min-h-full p-6" style={{ background: "#F3F7FC", fontFamily: "Inter, Arial, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#172554", letterSpacing: "-0.3px" }}>Customers</h1>
          <p style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{customers.length} in master</p>
        </div>
        <button
          onClick={openAdd}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,#2563EB,#4F46E5)", color: "white", fontSize: 13, fontWeight: 600, padding: "9px 18px", borderRadius: 10, border: "none", cursor: "pointer", boxShadow: "0 4px 12px rgba(37,99,235,0.25)" }}
        >
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Customers",  value: customers.length,  icon: Users,      bg: "#EFF6FF", color: "#2563EB", dot: "linear-gradient(135deg,#2563EB,#06B6D4)" },
          { label: "Corporate",        value: corporate.length,  icon: Building2,  bg: "#F5F3FF", color: "#7C3AED", dot: "linear-gradient(135deg,#7C3AED,#6366F1)" },
          { label: "Individual",       value: individual.length, icon: User,       bg: "#F0FDF4", color: "#16A34A", dot: "linear-gradient(135deg,#16A34A,#22C55E)" },
          { label: "GST Registered",   value: withGstin.length,  icon: Star,       bg: "#FFFBEB", color: "#D97706", dot: "linear-gradient(135deg,#F59E0B,#D97706)" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #DCE6F2", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 3px 10px rgba(15,23,42,0.05)" }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: s.bg }}>
              <s.icon style={{ width: 18, height: 18, color: s.color }} />
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.6px" }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#172554", marginTop: 2 }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div style={{ background: "white", border: "1px solid #DCE6F2", borderRadius: 12, padding: "12px 14px", marginBottom: 14, boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#94A3B8" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, mobile, city, GSTIN..."
              style={{ width: "100%", paddingLeft: 36, paddingRight: 16, paddingTop: 9, paddingBottom: 9, background: "#F8FBFF", border: "1px solid #DCE6F2", borderRadius: 8, fontSize: 13, color: "#172554", outline: "none" }}
            />
          </div>
          <div className="flex gap-1.5">
            {(["all", "individual", "corporate"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                style={{
                  padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", transition: "all 0.15s",
                  background: typeFilter === t ? "linear-gradient(135deg,#2563EB,#4F46E5)" : "#F1F5F9",
                  color: typeFilter === t ? "white" : "#64748B",
                  textTransform: "capitalize",
                }}
              >
                {t === "all" ? "All Types" : t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Customer table */}
      {filtered.length === 0 ? (
        <div style={{ background: "white", border: "1px solid #DCE6F2", borderRadius: 12, padding: "80px 0", textAlign: "center" }}>
          <Users style={{ width: 40, height: 40, margin: "0 auto 12px", color: "#CBD5E1" }} />
          <p style={{ color: "#94A3B8", fontSize: 13, fontWeight: 500 }}>{search ? "No matching customers" : "No customers yet"}</p>
          {!search && (
            <button onClick={openAdd} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#2563EB", fontSize: 13, marginTop: 8, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
              <Plus style={{ width: 14, height: 14 }} /> Add first customer
            </button>
          )}
        </div>
      ) : (
        <div style={{ background: "white", border: "1px solid #DCE6F2", borderRadius: 12, overflow: "hidden", boxShadow: "0 3px 12px rgba(15,23,42,0.05)" }}>
          <table className="w-full" style={{ fontSize: 13, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#EFF6FF", borderBottom: "1.5px solid #BFDBFE" }}>
                <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 10, fontWeight: 700, color: "#2563EB", letterSpacing: "0.5px", textTransform: "uppercase" }}>Customer</th>
                <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 10, fontWeight: 700, color: "#2563EB", letterSpacing: "0.5px", textTransform: "uppercase" }}>Mobile</th>
                <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 10, fontWeight: 700, color: "#2563EB", letterSpacing: "0.5px", textTransform: "uppercase" }} className="hidden md:table-cell">City</th>
                <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 10, fontWeight: 700, color: "#2563EB", letterSpacing: "0.5px", textTransform: "uppercase" }} className="hidden lg:table-cell">GSTIN</th>
                <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 10, fontWeight: 700, color: "#2563EB", letterSpacing: "0.5px", textTransform: "uppercase" }}>Type</th>
                <th style={{ textAlign: "right", padding: "10px 16px", fontSize: 10, fontWeight: 700, color: "#2563EB", letterSpacing: "0.5px", textTransform: "uppercase" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid #F1F5F9" }} className="hover:bg-blue-50/30 transition-colors group">
                  <td style={{ padding: "12px 16px" }}>
                    <div className="flex items-center gap-3">
                      <Initials name={c.name} />
                      <div>
                        <div style={{ fontWeight: 600, color: "#172554", fontSize: 13 }}>{c.name}</div>
                        <div style={{ fontSize: 10, color: "#94A3B8", fontFamily: "monospace", marginTop: 2 }}>{c.code}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#475569", fontSize: 13 }}>{c.mobile}</td>
                  <td style={{ padding: "12px 16px", color: "#64748B", fontSize: 12 }} className="hidden md:table-cell">{c.city || <span style={{ color: "#CBD5E1" }}>—</span>}</td>
                  <td style={{ padding: "12px 16px" }} className="hidden lg:table-cell">
                    {c.gstin ? (
                      <span style={{ fontFamily: "monospace", fontSize: 11, color: "#2563EB", background: "#EFF6FF", padding: "2px 8px", borderRadius: 5, border: "1px solid #BFDBFE" }}>{c.gstin}</span>
                    ) : (
                      <span style={{ color: "#CBD5E1" }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                      padding: "3px 10px", borderRadius: 999,
                      background: c.type === "corporate" ? "#F5F3FF" : "#F1F5F9",
                      color: c.type === "corporate" ? "#7C3AED" : "#64748B",
                      border: `1px solid ${c.type === "corporate" ? "#DDD6FE" : "#E2E8F0"}`,
                    }}>
                      {c.type === "corporate" ? <Building2 style={{ width: 10, height: 10 }} /> : <User style={{ width: 10, height: 10 }} />}
                      {c.type}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => setLedgerCust(c)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 7, color: "#2563EB", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                        <BookOpen style={{ width: 13, height: 13 }} /> Ledger
                      </button>
                      <button onClick={() => openEdit(c)} style={{ padding: "6px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 7, color: "#64748B", cursor: "pointer", display: "flex" }}>
                        <Pencil style={{ width: 13, height: 13 }} />
                      </button>
                      <button onClick={() => setDelId(c.id ?? null)} style={{ padding: "6px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 7, color: "#EF4444", cursor: "pointer", display: "flex" }}>
                        <Trash2 style={{ width: 13, height: 13 }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: "8px 16px", borderTop: "1px solid #F1F5F9", background: "#F8FBFF" }}>
            <span style={{ fontSize: 11, color: "#94A3B8" }}>Showing {filtered.length} of {customers.length} customers</span>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900">{modal === "add" ? "Add Customer" : "Edit Customer"}</h2>
              <button onClick={() => setModal(null)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Type toggle */}
              <div>
                <label className={lbl}>Customer Type</label>
                <div className="flex gap-2">
                  {(["individual", "corporate"] as CustomerType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setForm((f) => ({ ...f, type: t }))}
                      className={`flex-1 py-2.5 text-sm font-semibold rounded-xl border transition-colors capitalize flex items-center justify-center gap-2 ${
                        form.type === t ? "bg-blue-700 text-white border-blue-700" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {t === "corporate" ? <Building2 className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={lbl}>Full Name *</label>
                  <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="INFOAVANA TECHNOLOGIES PVT LTD" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Mobile *</label>
                  <input value={form.mobile} onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))} placeholder="9886114440" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Email</label>
                  <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="email@company.com" className={inp} />
                </div>
                <div className="col-span-2">
                  <label className={lbl}>Address</label>
                  <textarea value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Street address" rows={2} className={`${inp} resize-none`} />
                </div>
                <div>
                  <label className={lbl}>City</label>
                  <input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} placeholder="Bangalore" className={inp} />
                </div>
                <div>
                  <label className={lbl}>State</label>
                  <input value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} placeholder="Karnataka" className={inp} />
                </div>
                <div>
                  <label className={lbl}>State Code</label>
                  <input value={form.stateCode} onChange={(e) => setForm((f) => ({ ...f, stateCode: e.target.value }))} placeholder="29" className={inp} />
                </div>
                <div>
                  <label className={lbl}>GSTIN</label>
                  <input value={form.gstin} onChange={(e) => setForm((f) => ({ ...f, gstin: e.target.value.toUpperCase() }))} placeholder="29AAECI2916C1ZT" className={`${inp} font-mono`} />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
              <button
                onClick={save}
                disabled={!form.name || !form.mobile}
                className="px-5 py-2 text-sm font-semibold bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white rounded-lg transition-colors"
              >
                {modal === "add" ? "Add Customer" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {delId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="w-11 h-11 bg-red-100 rounded-xl flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Delete Customer?</h3>
            <p className="text-slate-500 text-sm mb-5">This cannot be undone. Existing invoices will not be affected.</p>
            <div className="flex gap-3">
              <button onClick={() => setDelId(null)} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Customer Ledger Slide-in ── */}
      {ledgerCust && (() => {
        const custInvoices = invoices.filter(
          (inv) => inv.customerId === ledgerCust.id || inv.customer?.name?.toLowerCase() === ledgerCust.name?.toLowerCase()
        );
        const totalBilled = custInvoices.reduce((s, i) => s + i.total, 0);
        const totalPaid   = custInvoices.reduce((s, i) => (i.payments || []).reduce((sp, p) => sp + p.amount, 0) + s, 0);
        const outstanding = totalBilled - totalPaid;
        return (
          <>
            <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setLedgerCust(null)} />
            <div className="fixed right-0 top-0 h-full w-full max-w-lg z-50 bg-white shadow-2xl flex flex-col" style={{ boxShadow: "-4px 0 32px rgba(0,0,0,0.12)" }}>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Initials name={ledgerCust.name} />
                  <div>
                    <div className="font-bold text-slate-900">{ledgerCust.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{ledgerCust.mobile} · {ledgerCust.city || "—"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => printLedger(ledgerCust, custInvoices)}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print Ledger
                  </button>
                  <button onClick={() => setLedgerCust(null)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-3 gap-3 p-4 border-b border-slate-100">
                {[
                  { label: "Total Billed", value: `₹${formatINR(totalBilled)}`, color: "#0f172a" },
                  { label: "Paid",         value: `₹${formatINR(totalPaid)}`,   color: "#16a34a" },
                  { label: "Outstanding",  value: `₹${formatINR(outstanding)}`, color: outstanding > 0 ? "#dc2626" : "#16a34a" },
                ].map((s) => (
                  <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</div>
                    <div className="font-bold text-sm mt-1 tabular-nums" style={{ color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Invoice List */}
              <div className="flex-1 overflow-y-auto">
                {custInvoices.length === 0 ? (
                  <div className="py-20 text-center">
                    <FileText className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                    <p className="text-slate-400 text-sm">No invoices for this customer</p>
                    <Link href={`/admin/billing/invoices/new`} className="inline-flex items-center gap-1.5 text-blue-600 text-sm mt-2 font-semibold">
                      <Plus className="w-3.5 h-3.5" /> Create Invoice
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {custInvoices.map((inv) => {
                      const Icon = TYPE_ICON[inv.type] || FileText;
                      const invPaid = (inv.payments || []).reduce((s, p) => s + p.amount, 0);
                      const invBal  = inv.total - invPaid;
                      return (
                        <Link key={inv.id} href={`/admin/billing/invoices/${inv.id}`}
                          className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors group">
                          <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                            style={{ background: TYPE_BG[inv.type] || "#F1F5F9" }}>
                            <Icon className="w-4 h-4" style={{ color: TYPE_COLOR[inv.type] || "#475569" }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-blue-700">{inv.invoiceNo}</span>
                              <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                style={{ background: STATUS_DOT[inv.status] + "20", color: STATUS_DOT[inv.status] }}>
                                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: STATUS_DOT[inv.status] }} />
                                {STATUS_LBL[inv.status]}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">{TYPE_LABEL[inv.type]} · {fmtDate(inv.date)}</div>
                            {invBal > 0 && inv.status !== "paid" && (
                              <div className="text-[11px] text-red-500 font-semibold mt-0.5">Due: ₹{formatINR(invBal)}</div>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-bold text-sm tabular-nums text-slate-800">₹{formatINR(inv.total)}</div>
                            {invPaid > 0 && <div className="text-[11px] text-green-600 font-semibold">₹{formatINR(invPaid)} paid</div>}
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 shrink-0 transition-colors" />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-slate-100 px-6 py-3 flex items-center justify-between">
                <span className="text-xs text-slate-400">{custInvoices.length} invoice{custInvoices.length !== 1 ? "s" : ""}</span>
                <Link href={`/admin/billing/invoices/new`}
                  className="flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors">
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
