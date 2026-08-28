"use client";
import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAdminDark } from "@/lib/useAdminDark";
import {
  getCustomers, addCustomer, addInvoice, getInvoice, saveInvoice,
  type Customer, type InvoiceType, type GSTType,
  type FlightItem, type PackageItem, type VisaItem,
  type GenericItem, type TrainItem, type BusItem, type HotelItem, type InvoiceItem,
} from "@/lib/billing";
import {
  Plus, Trash2, X, Search, Plane, Package, FileCheck,
  FileText, Train, Bus, ArrowLeft, Pencil,
  Bell, User, Globe, Hotel, Upload, Sparkles,
} from "lucide-react";

/* -- types -- */
const TYPES: { value: InvoiceType; label: string; icon: any }[] = [
  { value: "air-intl", label: "Air (Intl)", icon: Globe },
  { value: "air-dom",  label: "Air (Dom)",  icon: Plane },
  { value: "train",    label: "Train",      icon: Train },
  { value: "bus",      label: "Bus",        icon: Bus },
  { value: "hotel",    label: "Hotel",      icon: Hotel },
  { value: "package",  label: "Package",    icon: Package },
  { value: "visa",     label: "Visa",       icon: FileCheck },
  { value: "other",    label: "Other",      icon: FileText },
];

const AIRLINES = ["Air India","IndiGo","SpiceJet","Vistara","GoFirst","Thai Airways","Emirates","Singapore Airlines","Qatar Airways","Lufthansa","British Airways","Etihad","Flydubai","Air Arabia","Cathay Pacific","Malaysia Airlines","Sri Lankan Airlines","Oman Air"];
const SAC_CODES: Record<InvoiceType, string> = {
  "air-intl":"998552","air-dom":"998551",train:"998554",bus:"998554",
  hotel:"996311",package:"998555",visa:"998599",other:"999999",
};
const GST_RATES: Record<InvoiceType, number[]> = {
  "air-intl":[18,5,0],"air-dom":[18,5,0],train:[18,0],bus:[18,0],
  hotel:[18,12,0],package:[5,18,0],visa:[18,0],other:[18,0],
};

const emptyFlight  = (): FlightItem  => ({ id: crypto.randomUUID(), paxNo:"", paxName:"", sectorFrom:"", sectorTo:"", flightNo:"", flightClass:"", travelDate:"", returnSectorFrom:"", returnSectorTo:"", returnFlightNo:"", returnFlightClass:"", returnDate:"", airlinePnr:"", amount:0, serviceCharge:0 });
const emptyTrain   = (): TrainItem   => ({ id: crypto.randomUUID(), paxName:"", trainNo:"", trainName:"", fromStation:"", toStation:"", travelDate:"", travelClass:"SL", seatNo:"", pnr:"", amount:0, serviceCharge:0 });
const emptyBus     = (): BusItem     => ({ id: crypto.randomUUID(), paxName:"", operator:"", fromCity:"", toCity:"", travelDate:"", departTime:"", seatNo:"", ticketNo:"", amount:0, serviceCharge:0 });
const emptyHotel   = (): HotelItem   => ({ id: crypto.randomUUID(), guestName:"", adults:1, children:0, hotelName:"", hotelCity:"", hotelAddress:"", hotelPhone:"", hotelEmail:"", checkIn:"", checkInTime:"14:00", checkOut:"", checkOutTime:"12:00", nights:1, roomType:"Deluxe Room", roomCount:1, mealPlan:"CP", confirmationNo:"", bookingRef:"", amount:0, serviceCharge:0 });
const emptyPackage = (): PackageItem => ({ id: crypto.randomUUID(), leadPax:"", paxCount:1, destinations:"", perPersonRate:0, travelFrom:"", travelTo:"", inclusions:"", totalAmount:0, amount:0 });
const emptyVisa    = (): VisaItem    => ({ id: crypto.randomUUID(), applicantName:"", visaCountry:"", visaType:"Tourist", embassyFee:0, serviceFee:0, amount:0 });
const emptyGeneric = (): GenericItem => ({ id: crypto.randomUUID(), description:"", amount:0 });

const newItem = (t: InvoiceType): InvoiceItem => {
  if (t === "air-intl" || t === "air-dom") return emptyFlight();
  if (t === "train")   return emptyTrain();
  if (t === "bus")     return emptyBus();
  if (t === "hotel")   return emptyHotel();
  if (t === "package") return emptyPackage();
  if (t === "visa")    return emptyVisa();
  return emptyGeneric();
};

const calcItemTaxable = (item: InvoiceItem, type: InvoiceType): number => {
  if (type === "air-intl" || type === "air-dom") return (item as FlightItem).serviceCharge || 0;
  if (type === "train")   return (item as TrainItem).serviceCharge || 0;
  if (type === "bus")     return (item as BusItem).serviceCharge || 0;
  if (type === "hotel")   return (item as HotelItem).serviceCharge || 0;
  if (type === "package") { const p = item as PackageItem; return (p.perPersonRate||0)*(p.paxCount||1); }
  if (type === "visa")    return (item as VisaItem).serviceFee || 0;
  return (item as GenericItem).amount || 0;
};
const calcItemFare = (item: InvoiceItem, type: InvoiceType): number => {
  if (type === "air-intl" || type === "air-dom") return (item as FlightItem).amount || 0;
  if (type === "train")   return (item as TrainItem).amount || 0;
  if (type === "bus")     return (item as BusItem).amount || 0;
  if (type === "hotel")   return (item as HotelItem).amount || 0;
  if (type === "visa")    return (item as VisaItem).embassyFee || 0;
  return 0;
};

/* -- shared input style (dark-aware) -- */
const inpBase = "w-full rounded-xl px-3 py-3 text-[14px] focus:outline-none transition-colors";
const inp = (dark: boolean) => `${inpBase}`;
const inpStyle = (dark: boolean): React.CSSProperties => ({
  background: dark ? "rgba(255,255,255,0.07)" : "#FAF7FF",
  border: `1px solid ${dark ? "rgba(255,255,255,0.12)" : "#90E0EF"}`,
  color: dark ? "#E6E1E5" : "#1C1B1F",
  colorScheme: dark ? "dark" : "light",
});
const lblStyle = (dark: boolean): React.CSSProperties => ({
  display:"block", fontSize:"12px", fontWeight:700,
  textTransform:"uppercase", letterSpacing:"0.06em",
  marginBottom:"7px", color: dark ? "#A9A4B0" : "#6B6573",
});
const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

/* -- PDF text extraction (pdfjs-dist via lib/parseBooking — works on real PDFs) -- */
interface PdfExtracted {
  paxName?: string; pnr?: string; amount?: string;
  route?: string; sectorFrom?: string; sectorTo?: string;
  flightNo?: string; date?: string; phone?: string; airline?: string;
}

const AIRLINE_NAMES = ["IndiGo","Air India","SpiceJet","Vistara","GoFirst","AirAsia","Akasa Air","Emirates","Qatar Airways","Singapore Airlines","Etihad","British Airways","Lufthansa","Air France","Thai Airways","Malaysia Airlines","Oman Air","Gulf Air","Flydubai","Air Arabia","Air India Express"];

const AIRLINE_CODE_MAP: Record<string, string> = {
  "6E":"IndiGo","AI":"Air India","SG":"SpiceJet","UK":"Vistara","G8":"GoFirst",
  "I5":"AirAsia India","QP":"Akasa Air","EK":"Emirates","QR":"Qatar Airways",
  "SQ":"Singapore Airlines","EY":"Etihad","BA":"British Airways","LH":"Lufthansa",
  "TG":"Thai Airways","MH":"Malaysia Airlines","WY":"Oman Air","FZ":"Flydubai",
  "G9":"Air Arabia","IX":"Air India Express",
};

function convertDateToISO(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr.replace(/^[A-Za-z]+,?\s*/, "").trim());
    if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
  } catch {}
  return "";
}

function extractFromPdfText(text: string): PdfExtracted {
  const out: PdfExtracted = {};

  // PNR — IndiGo: "PNR / Booking Ref P4ERVB", Air Arabia: "PNR: 614UB2"
  const pnrM =
    text.match(/PNR\s*[\/|]\s*Booking\s+Ref\s+([A-Z0-9]{4,8})/i) ||
    text.match(/\bPNR\s*[:/]\s*([A-Z0-9]{5,10})/i) ||
    text.match(/Booking\s*(?:Ref|ID|No)[.:\s]+([A-Z0-9]{5,12})/i) ||
    text.match(/\b([A-Z]{1,2}[0-9]{4,6}|[A-Z0-9]{6})\b/);
  if (pnrM) out.pnr = pnrM[pnrM.length - 1];

  // Amount
  const amtM = text.match(/(?:INR|Rs\.?|Total\s*Fare|Grand\s*Total)\s*[:\s]*([\d,]+(?:\.\d{1,2})?)/i);
  if (amtM) out.amount = amtM[1].replace(/,/g, "");

  // Route — IndiGo: "Sector JRG-BLR", any: "BLR -> TAS" or "BLR-TAS"
  const sectorM =
    text.match(/Sector\s+([A-Z]{3})["\-]([A-Z]{3})/i) ||
    text.match(/\b([A-Z]{3})["\-->]([A-Z]{3})\b/);
  if (sectorM) {
    out.sectorFrom = sectorM[1];
    out.sectorTo   = sectorM[2];
    out.route      = `${sectorM[1]}"${sectorM[2]}`;
  }

  // Flight — IATA 2-char code (letter+digit, digit+letter, 2 letters) + space/hyphen + digits
  // Requires separator to avoid matching aircraft type "A321" as "A3"+"21"
  const flightM = text.match(/\b([A-Z][0-9]|[0-9][A-Z]|[A-Z]{2})[\s-]+(\d{2,4})\b/);
  if (flightM) {
    out.flightNo = `${flightM[1].toUpperCase()} ${flightM[2]}`;
    if (AIRLINE_CODE_MAP[flightM[1].toUpperCase()]) out.airline = AIRLINE_CODE_MAP[flightM[1].toUpperCase()];
  }
  if (!out.airline) {
    for (const a of AIRLINE_NAMES) {
      if (text.toLowerCase().includes(a.toLowerCase())) { out.airline = a; break; }
    }
  }

  // Date — IndiGo: "12:50, 23 Aug 2026" -> captures "23 Aug 2026"
  const dateM =
    text.match(/\d{1,2}:\d{2},\s*(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})/) ||
    text.match(/(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})/) ||
    text.match(/([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})/);
  if (dateM) out.date = dateM[1];

  // Phone
  const phM = text.match(/(?:\+91|91)?[ -]?([6-9]\d{9})\b/);
  if (phM) out.phone = phM[1];

  // Passenger — IndiGo: "MS Annie vincent Das Adult", Air Arabia: "MS SEBIYA SAKTHI"
  const titleNameM =
    text.match(/\b(?:MS|MR|MRS)\.?\s+([A-Za-z][a-zA-Z\s]+?)\s+(?:Adult|Child|Infant)/i) ||
    text.match(/\b(?:MS|MR|MRS)\.?\s+([A-Z]{2,}(?:\s+[A-Z]{2,}){1,3})\b/);
  if (titleNameM) {
    out.paxName = titleNameM[1].trim().toUpperCase().replace(/\s+/g, " ");
  } else {
    const nameLabel = text.match(/(?:passenger|pax|name|traveller)\s*[:\-]\s*([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+){1,3})/i);
    if (nameLabel) out.paxName = nameLabel[1].toUpperCase();
  }

  return out;
}

/* -- Entry modal -- */
function EntryModal({
  type, initial, onSave, onSaveMany, onClose, dark, onExtractName, gstType,
}: {
  type: InvoiceType;
  initial: InvoiceItem;
  onSave: (item: InvoiceItem) => void;
  onSaveMany?: (items: InvoiceItem[]) => void;
  onClose: () => void;
  dark: boolean;
  onExtractName?: (name: string) => void;
  gstType?: string;
}) {
  const [item, setItem] = useState<InvoiceItem>({ ...initial });
  const upd = (updates: Partial<InvoiceItem>) => setItem((p) => ({ ...p, ...updates }));

  const isPaxForm = type === "air-intl" || type === "air-dom" || type === "train" || type === "bus" || type === "visa";
  const initPax = (initial as any).paxName
    ? [{ id: crypto.randomUUID(), paxNo: (initial as any).paxNo || "001", paxName: (initial as any).paxName || "" }]
    : [{ id: crypto.randomUUID(), paxNo: "001", paxName: "" }];
  const [paxRows, setPaxRows] = useState<{ id: string; paxNo: string; paxName: string }[]>(initPax);

  const [extracted, setExtracted]   = useState<PdfExtracted | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const pdfRef = useRef<HTMLInputElement>(null);

  const handlePdf = useCallback(async (file: File) => {
    if (!file || file.type !== "application/pdf") { alert("Please select a PDF file"); return; }
    setPdfLoading(true);
    setExtracted(null);
    try {
      const { extractTextFromPdf, parseMmtText } = await import("@/lib/parseBooking");
      const text = await extractTextFromPdf(file);
      // Debug: log extracted text so we can tune regex patterns
      console.log("=== PDF EXTRACTED TEXT ===\n", text.substring(0, 1500));

      if (type === "hotel") {
        // Hotel booking PDF (MMT / Goibibo / Booking.com)
        const parsed = parseMmtText(text);
        setExtracted({
          paxName:  parsed.guestName      || undefined,
          pnr:      parsed.confirmationNo || undefined,
          flightNo: parsed.hotelName      || undefined,
          route:    parsed.hotelCity      || undefined,
          date:     parsed.checkIn        || undefined,
          airline:  parsed.nights ? `${parsed.nights} nights` : undefined,
        });
        const updates: Partial<HotelItem> = {};
        if (parsed.guestName)      updates.guestName      = parsed.guestName;
        if (parsed.hotelName)      updates.hotelName      = parsed.hotelName;
        if (parsed.hotelCity)      updates.hotelCity      = parsed.hotelCity;
        if (parsed.checkIn)        updates.checkIn        = parsed.checkIn;
        if (parsed.checkOut)       updates.checkOut       = parsed.checkOut;
        if (parsed.nights)         updates.nights         = parsed.nights;
        if (parsed.roomType)       updates.roomType       = parsed.roomType;
        if (parsed.mealPlan)       updates.mealPlan       = parsed.mealPlan;
        if (parsed.confirmationNo) updates.confirmationNo = parsed.confirmationNo;
        upd(updates as Partial<InvoiceItem>);
      } else {
        // Flight / Train / Bus / Visa PDF
        const ext = extractFromPdfText(text);
        setExtracted(ext);
        if (type === "air-intl" || type === "air-dom") {
          const updates: Partial<FlightItem> = {};
          if (ext.paxName)    updates.paxName    = ext.paxName;
          if (ext.sectorFrom) updates.sectorFrom = ext.sectorFrom;
          if (ext.sectorTo)   updates.sectorTo   = ext.sectorTo;
          if (ext.flightNo)   updates.flightNo   = ext.flightNo;
          if (ext.pnr)        updates.airlinePnr = ext.pnr;
          if (ext.amount)     updates.amount     = parseFloat(ext.amount) || 0;
          if (ext.date)       updates.travelDate = convertDateToISO(ext.date);
          upd(updates as Partial<InvoiceItem>);
          if (ext.paxName) { setPaxRows(r => r.map((p,i) => i===0 ? {...p, paxName: ext.paxName!} : p)); onExtractName?.(ext.paxName); }
        } else if (type === "train") {
          const updates: Partial<TrainItem> = {};
          if (ext.paxName) updates.paxName    = ext.paxName;
          if (ext.pnr)     updates.pnr        = ext.pnr;
          if (ext.amount)  updates.amount     = parseFloat(ext.amount) || 0;
          if (ext.date)    updates.travelDate = convertDateToISO(ext.date);
          upd(updates as Partial<InvoiceItem>);
          if (ext.paxName) { setPaxRows(r => r.map((p,i) => i===0 ? {...p, paxName: ext.paxName!} : p)); onExtractName?.(ext.paxName); }
        } else if (type === "visa") {
          if (ext.paxName) { upd({ applicantName: ext.paxName } as Partial<InvoiceItem>); setPaxRows(r => r.map((p,i) => i===0 ? {...p, paxName: ext.paxName!} : p)); onExtractName?.(ext.paxName); }
        }
      }
    } catch (err) {
      console.error("PDF extraction error:", err);
      alert("Could not read PDF. Please fill in details manually.");
    } finally {
      setPdfLoading(false);
    }
  }, [type]);

  const isPaxType = type === "air-intl" || type === "air-dom" || type === "train" || type === "bus" || type === "visa" || type === "hotel";

  const modalBg = dark ? "#1C1C1E" : "#FFFFFF";
  const modalBorder = dark ? "rgba(255,255,255,0.10)" : "#E7E0EC";
  const textPrimary = dark ? "#E6E1E5" : "#1C1B1F";
  const textMuted = dark ? "#938F99" : "#79747E";
  const sectionBg = dark ? "rgba(255,255,255,0.04)" : "#F7F2FF";
  const sectionBorder = dark ? "rgba(255,255,255,0.08)" : "#E7E0EC";
  const accentBg = dark ? "rgba(0,119,182,0.15)" : "#EDE7F6";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.55)", backdropFilter:"blur(8px)" }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background:modalBg, border:`1px solid ${modalBorder}`, boxShadow:"0 24px 64px rgba(0,0,0,0.4)" }}>
        <input ref={pdfRef} type="file" accept="application/pdf" className="hidden"
          onChange={(e) => e.target.files?.[0] && handlePdf(e.target.files[0])} />
        <div className="flex items-center justify-between px-6 py-4 sticky top-0 z-10" style={{ background:modalBg, borderBottom:`1px solid ${dark?"rgba(255,255,255,0.07)":"#E7E0EC"}` }}>
          <h3 className="font-bold text-[17px]" style={{ color:textPrimary, fontFamily:"var(--font-roboto),Roboto,system-ui,sans-serif" }}>
            {type === "air-intl" || type === "air-dom" ? "Passenger Details"
              : type === "train" ? "Train Booking" : type === "bus" ? "Bus Booking"
              : type === "visa" ? "Visa Applicant" : type === "package" ? "Package Details"
              : type === "hotel" ? "Hotel Booking" : "Service Entry"}
          </h3>
          <div className="flex items-center gap-2">
            {isPaxType && (
              <button onClick={() => pdfRef.current?.click()}
                className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg border transition-colors"
                style={{ background:"rgba(34,197,94,0.12)", color:"#16A34A", borderColor:"rgba(34,197,94,0.25)" }}>
                {pdfLoading
                  ? <><div className="w-3 h-3 border-2 border-green-300 border-t-green-600 rounded-full animate-spin"/><span>Scanning PDF...</span></>
                  : <><Upload className="w-3 h-3"/><span>Import PDF</span></>
                }
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color:textMuted }}><X className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Extracted data banner */}
        {extracted && Object.keys(extracted).length > 0 && (
          <div className="mx-6 mt-4 rounded-xl p-3 flex flex-wrap gap-2" style={{ background:"rgba(34,197,94,0.10)", border:"1px solid rgba(34,197,94,0.25)" }}>
            <div className="flex items-center gap-1.5 w-full mb-1">
              <Sparkles className="w-3.5 h-3.5" style={{ color:"#16A34A" }}/>
              <span className="text-xs font-bold" style={{ color:"#16A34A" }}>Extracted from PDF — fields auto-filled below</span>
              <button onClick={() => setExtracted(null)} className="ml-auto text-green-400 hover:text-green-600"><X className="w-3.5 h-3.5"/></button>
            </div>
            {(type === "hotel" ? [
              { k:"paxName",  l:"Guest" },
              { k:"pnr",      l:"Booking ID" },
              { k:"flightNo", l:"Hotel" },
              { k:"route",    l:"City" },
              { k:"date",     l:"Check-in" },
              { k:"airline",  l:"Stay" },
            ] : [
              { k:"paxName",  l:"Name" },
              { k:"pnr",      l:"PNR" },
              { k:"route",    l:"Route" },
              { k:"flightNo", l:"Flight" },
              { k:"amount",   l:"Fare ₹" },
              { k:"date",     l:"Date" },
              { k:"airline",  l:"Airline" },
            ]).filter(f => (extracted as any)[f.k]).map(f => (
              <span key={f.k} className="text-[11px] px-2 py-1 rounded-md font-medium"
                style={{ background:"#DCFCE7", color:"#15803D" }}>
                {f.l}: {(extracted as any)[f.k]}
              </span>
            ))}
          </div>
        )}

        <div className="p-6 space-y-4">
          {/* Air */}
          {(type === "air-intl" || type === "air-dom") && (() => {
            const f = item as FlightItem;
            const scStyle: React.CSSProperties = { background: dark?"rgba(251,191,36,0.10)":"#FFFBEB", border:`1px solid ${dark?"rgba(251,191,36,0.25)":"#FDE68A"}`, color: dark?"#FCD34D":"#92400E" };
            return (
              <>
                <div className="space-y-2">
                  {paxRows.map((pr, idx) => (
                    <div key={pr.id} className="grid grid-cols-4 gap-3 items-end">
                      <div><label style={lblStyle(dark)}>Pax No</label><input value={pr.paxNo} onChange={(e)=>setPaxRows(r=>r.map((p,i)=>i===idx?{...p,paxNo:e.target.value}:p))} placeholder="001" className={inp(dark)} style={inpStyle(dark)} /></div>
                      <div className="col-span-3 flex gap-2 items-end">
                        <div className="flex-1"><label style={lblStyle(dark)}>Passenger Name</label><input value={pr.paxName} onChange={(e)=>setPaxRows(r=>r.map((p,i)=>i===idx?{...p,paxName:e.target.value.toUpperCase()}:p))} placeholder="RAJESH KUMAR" className={`${inp(dark)} uppercase font-semibold`} style={inpStyle(dark)} /></div>
                        {paxRows.length > 1 && <button onClick={()=>setPaxRows(r=>r.filter((_,i)=>i!==idx))} className="mb-0.5 p-2 rounded-lg" style={{ color:"#B3261E", border:`1px solid rgba(179,38,30,0.3)` }}>✕</button>}
                      </div>
                    </div>
                  ))}
                  <button onClick={()=>setPaxRows(r=>[...r,{id:crypto.randomUUID(),paxNo:String(r.length+1).padStart(3,"0"),paxName:""}])} className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg" style={{ color: dark?"#90E0EF":"#0077B6", border:`1px solid ${dark?"rgba(255,255,255,0.12)":"#90E0EF"}` }}>+ Add Passenger</button>
                </div>
                <div className="p-3 rounded-xl space-y-3" style={{ background:sectionBg, border:`1px solid ${sectionBorder}` }}>
                  <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color:textMuted }}>Outbound</p>
                  <div className="grid grid-cols-5 gap-3">
                    <div><label style={lblStyle(dark)}>From</label><input value={f.sectorFrom} onChange={(e) => upd({sectorFrom:e.target.value.toUpperCase()})} placeholder="DEL" maxLength={3} className={`${inp(dark)} font-mono text-center uppercase`} style={inpStyle(dark)} /></div>
                    <div><label style={lblStyle(dark)}>To</label><input value={f.sectorTo} onChange={(e) => upd({sectorTo:e.target.value.toUpperCase()})} placeholder="BOM" maxLength={3} className={`${inp(dark)} font-mono text-center uppercase`} style={inpStyle(dark)} /></div>
                    <div><label style={lblStyle(dark)}>Flight No</label><input value={f.flightNo} onChange={(e) => upd({flightNo:e.target.value.toUpperCase()})} placeholder="AI-102" className={`${inp(dark)} font-mono uppercase`} style={inpStyle(dark)} /></div>
                    <div><label style={lblStyle(dark)}>Class</label><input value={f.flightClass} onChange={(e) => upd({flightClass:e.target.value.toUpperCase()})} placeholder="Y" maxLength={2} className={`${inp(dark)} font-mono text-center uppercase`} style={inpStyle(dark)} /></div>
                    <div><label style={lblStyle(dark)}>Date</label><input type="date" value={f.travelDate} onChange={(e) => upd({travelDate:e.target.value})} className={inp(dark)} style={inpStyle(dark)} /></div>
                  </div>
                </div>
                <div className="p-3 rounded-xl space-y-3" style={{ background:sectionBg, border:`1px solid ${sectionBorder}` }}>
                  <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color:textMuted }}>Return (optional)</p>
                  <div className="grid grid-cols-5 gap-3">
                    <input value={f.returnSectorFrom} onChange={(e) => upd({returnSectorFrom:e.target.value.toUpperCase()})} placeholder="BOM" maxLength={3} className={`${inp(dark)} font-mono text-center uppercase`} style={inpStyle(dark)} />
                    <input value={f.returnSectorTo} onChange={(e) => upd({returnSectorTo:e.target.value.toUpperCase()})} placeholder="DEL" maxLength={3} className={`${inp(dark)} font-mono text-center uppercase`} style={inpStyle(dark)} />
                    <input value={f.returnFlightNo} onChange={(e) => upd({returnFlightNo:e.target.value.toUpperCase()})} placeholder="AI-103" className={`${inp(dark)} font-mono uppercase`} style={inpStyle(dark)} />
                    <input value={f.returnFlightClass} onChange={(e) => upd({returnFlightClass:e.target.value.toUpperCase()})} placeholder="Y" maxLength={2} className={`${inp(dark)} font-mono text-center uppercase`} style={inpStyle(dark)} />
                    <input type="date" value={f.returnDate} onChange={(e) => upd({returnDate:e.target.value})} className={inp(dark)} style={inpStyle(dark)} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label style={lblStyle(dark)}>Airline PNR / Ticket No</label><input value={f.airlinePnr} onChange={(e) => upd({airlinePnr:e.target.value.toUpperCase()})} placeholder="098-76543210" className={`${inp(dark)} font-mono uppercase tracking-widest`} style={inpStyle(dark)} /></div>
                  <div>
                    <label style={lblStyle(dark)}>Base Fare (₹) <span style={{ color:textMuted, fontWeight:400 }}>— exempt</span></label>
                    <input type="number" value={f.amount||""} onChange={(e) => upd({amount:parseFloat(e.target.value)||0})} placeholder="4500" className={`${inp(dark)} font-bold`} style={{ ...inpStyle(dark), color: dark?"#90E0EF":"#0077B6" }} />
                  </div>
                  {gstType !== "none" && (
                    <div>
                      <label style={lblStyle(dark)}>Service Charge (₹)</label>
                      <input type="number" value={f.serviceCharge||""} onChange={(e) => upd({serviceCharge:parseFloat(e.target.value)||0})} placeholder="500" className={`${inp(dark)} font-bold`} style={scStyle} />
                    </div>
                  )}
                </div>
              </>
            );
          })()}

          {/* Train */}
          {type === "train" && (() => {
            const t = item as TrainItem;
            const scStyle: React.CSSProperties = { background: dark?"rgba(251,191,36,0.10)":"#FFFBEB", border:`1px solid ${dark?"rgba(251,191,36,0.25)":"#FDE68A"}`, color: dark?"#FCD34D":"#92400E" };
            return (
              <>
                <div className="space-y-2">
                  {paxRows.map((pr, idx) => (
                    <div key={pr.id} className="flex gap-2 items-end">
                      <div className="flex-1"><label style={lblStyle(dark)}>Passenger Name</label><input value={pr.paxName} onChange={(e)=>setPaxRows(r=>r.map((p,i)=>i===idx?{...p,paxName:e.target.value.toUpperCase()}:p))} placeholder="RAHUL KUMAR" className={`${inp(dark)} uppercase font-semibold`} style={inpStyle(dark)}/></div>
                      {paxRows.length > 1 && <button onClick={()=>setPaxRows(r=>r.filter((_,i)=>i!==idx))} className="mb-0.5 p-2 rounded-lg" style={{ color:"#B3261E", border:`1px solid rgba(179,38,30,0.3)` }}>✕</button>}
                    </div>
                  ))}
                  <button onClick={()=>setPaxRows(r=>[...r,{id:crypto.randomUUID(),paxNo:String(r.length+1).padStart(3,"0"),paxName:""}])} className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg" style={{ color: dark?"#90E0EF":"#0077B6", border:`1px solid ${dark?"rgba(255,255,255,0.12)":"#90E0EF"}` }}>+ Add Passenger</button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label style={lblStyle(dark)}>Train No</label><input value={t.trainNo} onChange={(e)=>upd({trainNo:e.target.value})} placeholder="16591" className={`${inp(dark)} font-mono`} style={inpStyle(dark)}/></div>
                  <div><label style={lblStyle(dark)}>Train Name</label><input value={t.trainName} onChange={(e)=>upd({trainName:e.target.value.toUpperCase()})} placeholder="HAMPI EXP" className={`${inp(dark)} uppercase`} style={inpStyle(dark)}/></div>
                </div>
                <div className="grid grid-cols-5 gap-3">
                  <div><label style={lblStyle(dark)}>From</label><input value={t.fromStation} onChange={(e)=>upd({fromStation:e.target.value.toUpperCase()})} placeholder="SBC" maxLength={5} className={`${inp(dark)} font-mono text-center uppercase`} style={inpStyle(dark)}/></div>
                  <div><label style={lblStyle(dark)}>To</label><input value={t.toStation} onChange={(e)=>upd({toStation:e.target.value.toUpperCase()})} placeholder="MYS" maxLength={5} className={`${inp(dark)} font-mono text-center uppercase`} style={inpStyle(dark)}/></div>
                  <div><label style={lblStyle(dark)}>Class</label><select value={t.travelClass} onChange={(e)=>upd({travelClass:e.target.value})} className={inp(dark)} style={inpStyle(dark)}>{["SL","3A","2A","1A","CC","EC","GN"].map(c=><option key={c}>{c}</option>)}</select></div>
                  <div><label style={lblStyle(dark)}>Date</label><input type="date" value={t.travelDate} onChange={(e)=>upd({travelDate:e.target.value})} className={inp(dark)} style={inpStyle(dark)}/></div>
                  <div><label style={lblStyle(dark)}>Seat/Berth</label><input value={t.seatNo} onChange={(e)=>upd({seatNo:e.target.value.toUpperCase()})} placeholder="S4 B24" className={`${inp(dark)} font-mono uppercase`} style={inpStyle(dark)}/></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label style={lblStyle(dark)}>PNR</label><input value={t.pnr} onChange={(e)=>upd({pnr:e.target.value.toUpperCase()})} placeholder="1234567890" className={`${inp(dark)} font-mono uppercase tracking-widest`} style={inpStyle(dark)}/></div>
                  <div><label style={lblStyle(dark)}>Ticket Fare (₹)</label><input type="number" value={t.amount||""} onChange={(e)=>upd({amount:parseFloat(e.target.value)||0})} className={`${inp(dark)} font-bold`} style={{ ...inpStyle(dark), color: dark?"#90E0EF":"#0077B6" }}/></div>
                  {gstType !== "none" && <div><label style={lblStyle(dark)}>Service Charge (₹) </label><input type="number" value={t.serviceCharge||""} onChange={(e)=>upd({serviceCharge:parseFloat(e.target.value)||0})} className={`${inp(dark)} font-bold`} style={scStyle}/></div>}
                </div>
              </>
            );
          })()}

          {/* Bus */}
          {type === "bus" && (() => {
            const b = item as BusItem;
            const scStyle: React.CSSProperties = { background: dark?"rgba(251,191,36,0.10)":"#FFFBEB", border:`1px solid ${dark?"rgba(251,191,36,0.25)":"#FDE68A"}`, color: dark?"#FCD34D":"#92400E" };
            return (
              <>
                <div className="space-y-2">
                  {paxRows.map((pr, idx) => (
                    <div key={pr.id} className="flex gap-2 items-end">
                      <div className="flex-1"><label style={lblStyle(dark)}>Passenger Name</label><input value={pr.paxName} onChange={(e)=>setPaxRows(r=>r.map((p,i)=>i===idx?{...p,paxName:e.target.value.toUpperCase()}:p))} placeholder="SURESH KUMAR" className={`${inp(dark)} uppercase font-semibold`} style={inpStyle(dark)}/></div>
                      {paxRows.length > 1 && <button onClick={()=>setPaxRows(r=>r.filter((_,i)=>i!==idx))} className="mb-0.5 p-2 rounded-lg" style={{ color:"#B3261E", border:`1px solid rgba(179,38,30,0.3)` }}>✕</button>}
                    </div>
                  ))}
                  <button onClick={()=>setPaxRows(r=>[...r,{id:crypto.randomUUID(),paxNo:String(r.length+1).padStart(3,"0"),paxName:""}])} className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg" style={{ color: dark?"#90E0EF":"#0077B6", border:`1px solid ${dark?"rgba(255,255,255,0.12)":"#90E0EF"}` }}>+ Add Passenger</button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label style={lblStyle(dark)}>From</label><input value={b.fromCity} onChange={(e)=>upd({fromCity:e.target.value})} placeholder="Bangalore" className={inp(dark)} style={inpStyle(dark)}/></div>
                  <div><label style={lblStyle(dark)}>To</label><input value={b.toCity} onChange={(e)=>upd({toCity:e.target.value})} placeholder="Mumbai" className={inp(dark)} style={inpStyle(dark)}/></div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div><label style={lblStyle(dark)}>Date</label><input type="date" value={b.travelDate} onChange={(e)=>upd({travelDate:e.target.value})} className={inp(dark)} style={inpStyle(dark)}/></div>
                  <div><label style={lblStyle(dark)}>Depart Time</label><input type="time" value={b.departTime} onChange={(e)=>upd({departTime:e.target.value})} className={inp(dark)} style={inpStyle(dark)}/></div>
                  <div><label style={lblStyle(dark)}>Seat No</label><input value={b.seatNo} onChange={(e)=>upd({seatNo:e.target.value.toUpperCase()})} placeholder="A12" className={`${inp(dark)} font-mono uppercase`} style={inpStyle(dark)}/></div>
                  <div><label style={lblStyle(dark)}>Ticket / PNR</label><input value={b.ticketNo} onChange={(e)=>upd({ticketNo:e.target.value.toUpperCase()})} placeholder="KS1234567" className={`${inp(dark)} font-mono uppercase`} style={inpStyle(dark)}/></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label style={lblStyle(dark)}>Ticket Fare (₹)</label><input type="number" value={b.amount||""} onChange={(e)=>upd({amount:parseFloat(e.target.value)||0})} className={`${inp(dark)} font-bold`} style={{ ...inpStyle(dark), color: dark?"#90E0EF":"#0077B6" }}/></div>
                  {gstType !== "none" && <div><label style={lblStyle(dark)}>Service Charge (₹) </label><input type="number" value={b.serviceCharge||""} onChange={(e)=>upd({serviceCharge:parseFloat(e.target.value)||0})} className={`${inp(dark)} font-bold`} style={scStyle}/></div>}
                </div>
              </>
            );
          })()}

          {/* Hotel */}
          {type === "hotel" && (() => {
            const h = item as HotelItem;
            const nights = h.checkIn && h.checkOut
              ? Math.max(1, Math.round((new Date(h.checkOut).getTime() - new Date(h.checkIn).getTime()) / 86400000))
              : h.nights || 1;
            const scStyle: React.CSSProperties = { background: dark?"rgba(251,191,36,0.10)":"#FFFBEB", border:`1px solid ${dark?"rgba(251,191,36,0.25)":"#FDE68A"}`, color: dark?"#FCD34D":"#92400E" };
            return (
              <>
                {/* Lead Guest */}
                <div className="p-3 rounded-xl space-y-3" style={{ background:sectionBg, border:`1px solid ${sectionBorder}` }}>
                  <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color:textMuted }}>Lead Guest</p>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="col-span-2">
                      <label style={lblStyle(dark)}>Guest Name (Lead)</label>
                      <input value={h.guestName} onChange={(e)=>upd({guestName:e.target.value.toUpperCase()})} placeholder="RAHUL SHARMA" className={`${inp(dark)} uppercase font-semibold`} style={inpStyle(dark)}/>
                    </div>
                    <div>
                      <label style={lblStyle(dark)}>Adults</label>
                      <input type="number" min="1" value={h.adults||1} onChange={(e)=>upd({adults:parseInt(e.target.value)||1})} className={inp(dark)} style={inpStyle(dark)}/>
                    </div>
                    <div>
                      <label style={lblStyle(dark)}>Children</label>
                      <input type="number" min="0" value={h.children||0} onChange={(e)=>upd({children:parseInt(e.target.value)||0})} className={inp(dark)} style={inpStyle(dark)}/>
                    </div>
                  </div>
                </div>

                {/* Property */}
                <div className="p-3 rounded-xl space-y-3" style={{ background:accentBg, border:`1px solid ${dark?"rgba(0,119,182,0.2)":"#90E0EF"}` }}>
                  <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: dark?"#90E0EF":"#0077B6" }}>Property</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label style={lblStyle(dark)}>Hotel Name</label>
                      <input value={h.hotelName} onChange={(e)=>upd({hotelName:e.target.value})} placeholder="The Leela Palace" className={`${inp(dark)} font-semibold`} style={inpStyle(dark)}/>
                    </div>
                    <div>
                      <label style={lblStyle(dark)}>City / Destination</label>
                      <input value={h.hotelCity} onChange={(e)=>upd({hotelCity:e.target.value})} placeholder="Bengaluru" className={inp(dark)} style={inpStyle(dark)}/>
                    </div>
                    <div className="col-span-2">
                      <label style={lblStyle(dark)}>Hotel Address</label>
                      <input value={h.hotelAddress||""} onChange={(e)=>upd({hotelAddress:e.target.value})} placeholder="Street, Area, City, Country" className={inp(dark)} style={inpStyle(dark)}/>
                    </div>
                    <div>
                      <label style={lblStyle(dark)}>Hotel Phone</label>
                      <input value={h.hotelPhone||""} onChange={(e)=>upd({hotelPhone:e.target.value})} placeholder="+91 80 1234 5678" className={inp(dark)} style={inpStyle(dark)}/>
                    </div>
                    <div>
                      <label style={lblStyle(dark)}>Hotel Email</label>
                      <input value={h.hotelEmail||""} onChange={(e)=>upd({hotelEmail:e.target.value})} placeholder="reservations@hotel.com" className={inp(dark)} style={inpStyle(dark)}/>
                    </div>
                  </div>
                </div>

                {/* Stay Details */}
                <div className="p-3 rounded-xl space-y-3" style={{ background:sectionBg, border:`1px solid ${sectionBorder}` }}>
                  <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color:textMuted }}>Stay Details</p>
                  <div className="grid grid-cols-4 gap-3">
                    <div><label style={lblStyle(dark)}>Check-In Date</label><input type="date" value={h.checkIn} onChange={(e)=>upd({checkIn:e.target.value})} className={inp(dark)} style={inpStyle(dark)}/></div>
                    <div><label style={lblStyle(dark)}>Check-In Time</label><input type="time" value={h.checkInTime||"14:00"} onChange={(e)=>upd({checkInTime:e.target.value})} className={inp(dark)} style={inpStyle(dark)}/></div>
                    <div><label style={lblStyle(dark)}>Check-Out Date</label><input type="date" value={h.checkOut} onChange={(e)=>upd({checkOut:e.target.value})} className={inp(dark)} style={inpStyle(dark)}/></div>
                    <div><label style={lblStyle(dark)}>Check-Out Time</label><input type="time" value={h.checkOutTime||"12:00"} onChange={(e)=>upd({checkOutTime:e.target.value})} className={inp(dark)} style={inpStyle(dark)}/></div>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label style={lblStyle(dark)}>Nights</label>
                      <div className="rounded-xl px-3 py-2.5 text-[14px] font-bold text-center" style={{ background:accentBg, color: dark?"#90E0EF":"#0077B6", border:`1px solid ${dark?"rgba(0,119,182,0.25)":"#90E0EF"}` }}>{nights}N</div>
                    </div>
                    <div><label style={lblStyle(dark)}>Rooms</label><input type="number" min="1" value={h.roomCount} onChange={(e)=>upd({roomCount:parseInt(e.target.value)||1})} className={inp(dark)} style={inpStyle(dark)}/></div>
                    <div><label style={lblStyle(dark)}>Room Type</label><input value={h.roomType} onChange={(e)=>upd({roomType:e.target.value})} placeholder="Deluxe Room" className={inp(dark)} style={inpStyle(dark)}/></div>
                    <div>
                      <label style={lblStyle(dark)}>Meal Plan</label>
                      <select value={h.mealPlan} onChange={(e)=>upd({mealPlan:e.target.value as any})} className={inp(dark)} style={inpStyle(dark)}>
                        <option value="EP">EP — Room Only</option>
                        <option value="CP">CP — Breakfast</option>
                        <option value="MAP">MAP — Breakfast &amp; Dinner</option>
                        <option value="AP">AP — All Meals</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label style={lblStyle(dark)}>HCN / Conf. No <span style={{ color:textMuted, fontWeight:400, fontSize:"10px" }}>— hotel confirmation</span></label>
                      <input value={h.confirmationNo} onChange={(e)=>upd({confirmationNo:e.target.value.toUpperCase()})} placeholder="HTL123456" className={`${inp(dark)} font-mono uppercase`} style={inpStyle(dark)}/>
                    </div>
                    <div>
                      <label style={lblStyle(dark)}>Booking Ref <span style={{ color:textMuted, fontWeight:400, fontSize:"10px" }}>— OTA / supplier ref</span></label>
                      <input value={h.bookingRef||""} onChange={(e)=>upd({bookingRef:e.target.value.toUpperCase()})} placeholder="NH21187503256920" className={`${inp(dark)} font-mono uppercase`} style={inpStyle(dark)}/>
                    </div>
                  </div>
                </div>

                {/* Fare */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={lblStyle(dark)}>Room Amount (₹) <span style={{ color:textMuted, fontWeight:400, fontSize:"10px" }}>— GST exempt</span></label>
                    <input type="number" value={h.amount||""} onChange={(e)=>upd({amount:parseFloat(e.target.value)||0})} placeholder="8500" className={`${inp(dark)} font-bold`} style={{ ...inpStyle(dark), color: dark?"#90E0EF":"#0077B6" }}/>
                  </div>
                  {gstType !== "none" && (
                    <div>
                      <label style={lblStyle(dark)}>Service Charge (₹) </label>
                      <input type="number" value={h.serviceCharge||""} onChange={(e)=>upd({serviceCharge:parseFloat(e.target.value)||0})} placeholder="500" className={`${inp(dark)} font-bold`} style={scStyle}/>
                    </div>
                  )}
                </div>
              </>
            );
          })()}

          {/* Package */}
          {type === "package" && (() => {
            const p = item as PackageItem;
            return (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-3"><label style={lblStyle(dark)}>Lead Passenger</label><input value={p.leadPax} onChange={(e)=>upd({leadPax:e.target.value.toUpperCase()})} placeholder="NARENDRA SHARMA" className={`${inp(dark)} uppercase font-semibold`} style={inpStyle(dark)}/></div>
                  <div><label style={lblStyle(dark)}>No. of Pax</label><input type="number" min="1" value={p.paxCount} onChange={(e)=>upd({paxCount:parseInt(e.target.value)||1})} className={inp(dark)} style={inpStyle(dark)}/></div>
                  <div><label style={lblStyle(dark)}>Rate / Person (₹)</label><input type="number" value={p.perPersonRate||""} onChange={(e)=>upd({perPersonRate:parseFloat(e.target.value)||0})} className={`${inp(dark)} font-bold`} style={{ ...inpStyle(dark), color: dark?"#90E0EF":"#0077B6" }}/></div>
                  <div><label style={lblStyle(dark)}>Total</label><div className="rounded-xl px-3 py-2.5 text-[14px] font-bold" style={{ background:accentBg, color: dark?"#90E0EF":"#0077B6", border:`1px solid ${dark?"rgba(0,119,182,0.25)":"#90E0EF"}` }}>{fmt((p.perPersonRate||0)*(p.paxCount||1))}</div></div>
                  <div className="col-span-3"><label style={lblStyle(dark)}>Destinations</label><input value={p.destinations} onChange={(e)=>upd({destinations:e.target.value.toUpperCase()})} placeholder="MYSORE · COORG · OOTY" className={`${inp(dark)} uppercase`} style={inpStyle(dark)}/></div>
                  <div><label style={lblStyle(dark)}>Travel From</label><input type="date" value={p.travelFrom} onChange={(e)=>upd({travelFrom:e.target.value})} className={inp(dark)} style={inpStyle(dark)}/></div>
                  <div><label style={lblStyle(dark)}>Travel To</label><input type="date" value={p.travelTo} onChange={(e)=>upd({travelTo:e.target.value})} className={inp(dark)} style={inpStyle(dark)}/></div>
                  <div className="col-span-3"><label style={lblStyle(dark)}>Inclusions</label><input value={p.inclusions} onChange={(e)=>upd({inclusions:e.target.value})} placeholder="Hotel · Meals · Transport..." className={inp(dark)} style={inpStyle(dark)}/></div>
                </div>
              </>
            );
          })()}

          {/* Visa */}
          {type === "visa" && (() => {
            const v = item as VisaItem;
            const scStyle: React.CSSProperties = { background: dark?"rgba(251,191,36,0.10)":"#FFFBEB", border:`1px solid ${dark?"rgba(251,191,36,0.25)":"#FDE68A"}`, color: dark?"#FCD34D":"#92400E" };
            return (
              <div className="grid grid-cols-3 gap-3">
                <div><label style={lblStyle(dark)}>Applicant Name</label><input value={v.applicantName} onChange={(e)=>upd({applicantName:e.target.value.toUpperCase()})} placeholder="FULL NAME" className={`${inp(dark)} uppercase font-semibold`} style={inpStyle(dark)}/></div>
                <div><label style={lblStyle(dark)}>Country</label><input value={v.visaCountry} onChange={(e)=>upd({visaCountry:e.target.value})} placeholder="Thailand" className={inp(dark)} style={inpStyle(dark)}/></div>
                <div><label style={lblStyle(dark)}>Visa Type</label><input value={v.visaType} onChange={(e)=>upd({visaType:e.target.value})} placeholder="Tourist" className={inp(dark)} style={inpStyle(dark)}/></div>
                <div><label style={lblStyle(dark)}>Embassy Fee (₹)</label><input type="number" value={v.embassyFee||""} onChange={(e)=>upd({embassyFee:parseFloat(e.target.value)||0})} className={inp(dark)} style={inpStyle(dark)}/></div>
                <div><label style={lblStyle(dark)}>Service Fee (₹) </label><input type="number" value={v.serviceFee||""} onChange={(e)=>upd({serviceFee:parseFloat(e.target.value)||0})} className={`${inp(dark)} font-bold`} style={scStyle}/></div>
                <div><label style={lblStyle(dark)}>Total</label><div className="rounded-xl px-3 py-2.5 text-[14px] font-bold" style={{ background:accentBg, color: dark?"#90E0EF":"#0077B6", border:`1px solid ${dark?"rgba(0,119,182,0.25)":"#90E0EF"}` }}>{fmt((v.embassyFee||0)+(v.serviceFee||0))}</div></div>
              </div>
            );
          })()}

          {/* Other */}
          {type === "other" && (() => {
            const g = item as GenericItem;
            return (
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2"><label style={lblStyle(dark)}>Description</label><input value={g.description} onChange={(e)=>upd({description:e.target.value})} placeholder="Service description..." className={inp(dark)} style={inpStyle(dark)}/></div>
                <div><label style={lblStyle(dark)}>Amount (₹)</label><input type="number" value={g.amount||""} onChange={(e)=>upd({amount:parseFloat(e.target.value)||0})} className={`${inp(dark)} font-bold`} style={{ ...inpStyle(dark), color: dark?"#90E0EF":"#0077B6" }}/></div>
              </div>
            );
          })()}
        </div>

        <div className="px-6 py-4 flex justify-end gap-3" style={{ borderTop:`1px solid ${dark?"rgba(255,255,255,0.07)":"#E7E0EC"}` }}>
          <button onClick={onClose} className="px-4 py-2.5 text-[14px] font-semibold rounded-xl" style={{ color:textMuted, border:`1px solid ${dark?"rgba(255,255,255,0.08)":"#E7E0EC"}` }}>Cancel</button>
          <button onClick={() => {
            if (isPaxForm && paxRows.length > 1 && onSaveMany) {
              const shared = { ...item };
              const entries = paxRows.map((pr) => ({ ...shared, id: crypto.randomUUID(), paxNo: pr.paxNo, paxName: pr.paxName, applicantName: pr.paxName } as InvoiceItem));
              onSaveMany(entries);
            } else {
              const firstPax = paxRows[0];
              onSave({ ...item, paxNo: firstPax?.paxNo ?? (item as any).paxNo, paxName: firstPax?.paxName ?? (item as any).paxName, applicantName: firstPax?.paxName ?? (item as any).applicantName } as InvoiceItem);
            }
          }} className="px-5 py-2.5 text-[14px] font-semibold text-white rounded-xl" style={{ background:"linear-gradient(135deg,#0077B6,#0096C7)" }}>
            Save Entry{isPaxForm && paxRows.length > 1 ? ` (${paxRows.length} pax)` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -- Row summary helpers -- */
function getRowLabel(item: InvoiceItem, type: InvoiceType) {
  if (type === "air-intl" || type === "air-dom") {
    const f = item as FlightItem;
    return { name: f.paxName || "—", sub: f.airlinePnr ? `ADT · Ticket: ${f.airlinePnr}` : "ADT" };
  }
  if (type === "train")   { const t = item as TrainItem;   return { name: t.paxName || "—", sub: t.pnr ? `PNR: ${t.pnr}` : t.trainName }; }
  if (type === "bus")     { const b = item as BusItem;     return { name: b.paxName || "—", sub: b.ticketNo || b.seatNo }; }
  if (type === "hotel")   { const h = item as HotelItem;   return { name: h.guestName || "—", sub: h.confirmationNo ? `Conf: ${h.confirmationNo}` : (h.mealPlan || "") }; }
  if (type === "package") { const p = item as PackageItem; return { name: p.leadPax || "—", sub: `${p.paxCount} pax` }; }
  if (type === "visa")    { const v = item as VisaItem;    return { name: v.applicantName || "—", sub: `${v.visaCountry} · ${v.visaType}` }; }
  const g = item as GenericItem; return { name: g.description || "—", sub: "" };
}

function getRowRoute(item: InvoiceItem, type: InvoiceType) {
  if (type === "air-intl" || type === "air-dom") { const f = item as FlightItem; return f.sectorFrom && f.sectorTo ? `${f.sectorFrom} -> ${f.sectorTo}` : "—"; }
  if (type === "train")   { const t = item as TrainItem;   return t.fromStation && t.toStation ? `${t.fromStation} -> ${t.toStation}` : "—"; }
  if (type === "bus")     { const b = item as BusItem;     return b.fromCity && b.toCity ? `${b.fromCity} -> ${b.toCity}` : "—"; }
  if (type === "hotel")   { const h = item as HotelItem;   return h.hotelName ? `${h.hotelName}${h.hotelCity ? `, ${h.hotelCity}` : ""}` : "—"; }
  if (type === "package") { const p = item as PackageItem; return p.destinations || "—"; }
  return "";
}

function getRowFlightDate(item: InvoiceItem, type: InvoiceType) {
  if (type === "air-intl" || type === "air-dom") { const f = item as FlightItem; return { flight: f.flightNo, date: f.travelDate }; }
  if (type === "train")   { const t = item as TrainItem;   return { flight: `${t.trainNo||""} ${t.travelClass||""}`.trim(), date: t.travelDate }; }
  if (type === "bus")     { const b = item as BusItem;     return { flight: b.departTime || "", date: b.travelDate }; }
  if (type === "hotel")   { const h = item as HotelItem;   return { flight: `${h.nights||1}N · ${h.roomType||""}`.trim(), date: h.checkIn }; }
  if (type === "package") { const p = item as PackageItem; return { flight: "", date: p.travelFrom }; }
  return { flight: "", date: "" };
}

/* -- Table header labels -- */
function colHeaders(type: InvoiceType) {
  const isFare = type === "air-intl" || type === "air-dom" || type === "train" || type === "bus" || type === "hotel";
  return {
    col3: type === "air-intl" || type === "air-dom" ? "FLIGHT / DATE"
      : type === "train" ? "TRAIN / DATE" : type === "bus" ? "BUS / DATE"
      : type === "hotel" ? "NIGHTS / CHECK-IN" : type === "package" ? "TRAVEL DATE" : "DATE",
    col4: isFare ? (type === "hotel" ? "ROOM FARE" : "BASE FARE") : type === "visa" ? "EMBASSY FEE" : "AMOUNT",
    col5: isFare ? "TAXABLE" : type === "visa" ? "SERVICE FEE" : "",
  };
}

/* -- Main page -- */
function NewInvoiceContent() {
  const dark = useAdminDark();
  const router       = useRouter();
  const searchParams = useSearchParams();
  const initType     = (searchParams.get("type") as InvoiceType) || "air-intl";

  const editId = searchParams.get("edit");

  const [type,    setType]    = useState<InvoiceType>(initType);
  const [airline, setAirline] = useState("");
  const [date,    setDate]    = useState(new Date().toISOString().split("T")[0]);
  const [gstType, setGstType] = useState<GSTType>("cgst_sgst");
  const [gstRate, setGstRate] = useState(GST_RATES[initType][0]);
  const [sacCode, setSacCode] = useState(SAC_CODES[initType]);
  const [notes,   setNotes]   = useState("");
  const [items,   setItems]   = useState<InvoiceItem[]>([]);

  const [customers,    setCustomers]    = useState<Customer[]>([]);
  const [custSearch,   setCustSearch]   = useState("");
  const [custDropdown, setCustDropdown] = useState(false);
  const [customer,     setCustomer]     = useState<Customer | null>(null);
  const [addingCust,   setAddingCust]   = useState(false);
  const [newCust,      setNewCust]      = useState({ name:"", mobile:"", gstin:"", city:"", address:"", state:"Karnataka", stateCode:"29", type:"individual" as const });

  const [modalItem,    setModalItem]    = useState<InvoiceItem | null>(null);
  const [editingId,    setEditingId]    = useState<string | null>(null);
  const [saving,       setSaving]       = useState(false);

  useEffect(() => {
    const load = async () => {
      setCustomers(await getCustomers());
      if (editId) {
        const inv = await getInvoice(editId);
        if (inv) {
          setType(inv.type);
          setAirline(inv.airline || "");
          setDate(inv.date);
          setGstType(inv.gstType || "cgst_sgst");
          setGstRate(inv.gstRate || GST_RATES[inv.type][0]);
          setSacCode(inv.sacCode || SAC_CODES[inv.type]);
          setNotes(inv.notes || "");
          setItems(inv.items);
          setCustomer(inv.customer);
        }
      }
    };
    load();
  }, [editId]);

  const changeType = (t: InvoiceType) => {
    setType(t); setItems([]);
    setSacCode(SAC_CODES[t]); setGstRate(GST_RATES[t][0]);
  };

  const openAdd  = () => { setEditingId(null); setModalItem(newItem(type)); };
  const openEdit = (item: InvoiceItem) => { setEditingId(item.id ?? null); setModalItem({ ...item }); };

  const saveEntry = (item: InvoiceItem) => {
    if (editingId) {
      setItems((prev) => prev.map((i) => i.id === editingId ? item : i));
    } else {
      setItems((prev) => [...prev, item]);
    }
    setModalItem(null); setEditingId(null);
  };

  const saveManyEntries = (newItems: InvoiceItem[]) => {
    setItems((prev) => [...prev, ...newItems]);
    setModalItem(null); setEditingId(null);
  };

  const isFareType   = type === "air-intl" || type === "air-dom" || type === "train" || type === "bus" || type === "hotel";
  const isVisa       = type === "visa";
  const fareTotal    = items.reduce((s, i) => s + calcItemFare(i, type), 0);
  const taxableTotal = items.reduce((s, i) => s + calcItemTaxable(i, type), 0);
  // subtotal = base amount shown on invoice before GST
  // For fare types: fareTotal (ticket/room) shown separately; for visa: combined; for others: taxable amount
  const subtotal     = isFareType ? fareTotal : isVisa ? fareTotal + taxableTotal : taxableTotal;
  const cgst  = gstType === "cgst_sgst" ? (taxableTotal * gstRate) / 200 : 0;
  const sgst  = gstType === "cgst_sgst" ? (taxableTotal * gstRate) / 200 : 0;
  const igst  = gstType === "igst"      ? (taxableTotal * gstRate) / 100 : 0;
  // total MUST include service charges (taxableTotal) for fare types — they're charged to customer
  const total = isFareType
    ? fareTotal + taxableTotal + cgst + sgst + igst
    : subtotal + cgst + sgst + igst;

  const filteredCusts = customers.filter(
    (c) => c.name.toLowerCase().includes(custSearch.toLowerCase()) || (c.mobile || "").includes(custSearch)
  ).slice(0, 8);

  const saveNewCust = async () => {
    if (!newCust.name || !newCust.mobile) return;
    const c = await addCustomer({ ...newCust, email:"" });
    setCustomers(await getCustomers()); setCustomer(c);
    setAddingCust(false); setCustDropdown(false);
  };

  const handleSave = async () => {
    if (!customer || items.length === 0) return;
    setSaving(true);
    try {
      const processed = items.map((item) => {
        if (type === "package") { const p = item as PackageItem; return { ...p, totalAmount: (p.perPersonRate||0) * (p.paxCount||1), amount: (p.perPersonRate||0) * (p.paxCount||1) }; }
        if (type === "visa")    { const v = item as VisaItem; return { ...v, amount: (v.embassyFee||0) + (v.serviceFee||0) }; }
        return item;
      });

      if (editId) {
        const existing = await getInvoice(editId);
        if (existing) {
          await saveInvoice({
            ...existing,
            type, airline, customerId: customer.id, customer, date,
            items: processed, subtotal, taxableAmount: taxableTotal, fareTotal,
            gstType, gstRate, cgst, sgst, igst, total, notes,
          });
          router.push(`/admin/billing/invoices/${existing.id}`);
        }
        return;
      }

      const inv = await addInvoice({
        type, airline, customerId: customer.id, customer, date,
        items: processed, subtotal, taxableAmount: taxableTotal, fareTotal,
        gstType, gstRate, cgst, sgst, igst, total, notes, status: "due", payments: [],
      });
      router.push(`/admin/billing/invoices/${inv.id}`);
    } finally { setSaving(false); }
  };

  const cols = colHeaders(type);
  const addLabel = type === "air-intl" || type === "air-dom" ? "Add Passenger"
    : type === "visa" ? "Add Applicant" : type === "package" ? "Add Package"
    : type === "train" ? "Add Passenger" : type === "bus" ? "Add Passenger"
    : type === "hotel" ? "Add Room" : "Add Row";

  /* Dark-aware token shortcuts */
  const pageBg  = dark ? "#111111" : "#F4F0FF";
  const cardBg  = dark ? "#1C1C1E" : "#FFFFFF";
  const cardBdr = dark ? "rgba(255,255,255,0.10)" : "#E7E0EC";
  const txtP    = dark ? "#E6E1E5" : "#1C1B1F";
  const txtM    = dark ? "#938F99" : "#79747E";
  const accentC = dark ? "#90E0EF" : "#0077B6";
  const accentBg2 = dark ? "rgba(0,119,182,0.12)" : "#EDE7F6";
  const hoverRow = dark ? "rgba(255,255,255,0.03)" : "#FAFAFA";

  return (
    <div className="min-h-full" style={{ background:pageBg, fontFamily:"var(--font-roboto,Roboto,system-ui,sans-serif)" }}>
      {/* Top bar */}
      <div className="px-6 py-3 flex items-center gap-4 sticky top-0 z-10" style={{ background: dark?"rgba(20,20,20,0.92)":"rgba(255,255,255,0.92)", backdropFilter:"blur(16px)", borderBottom:`1px solid ${cardBdr}` }}>
        <button onClick={() => router.back()} style={{ color:txtM }}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[17px] font-bold" style={{ color:txtP, fontFamily:"var(--font-roboto),Roboto,system-ui,sans-serif" }}>{editId ? "Edit Invoice" : "Create New Invoice"}</h1>

        {/* Stepper */}
        <div className="flex items-center gap-2 ml-6 text-[13px] font-semibold">
          <span className="flex items-center gap-1.5" style={{ color:accentC }}>
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white" style={{ background:accentC }}>1</span>
            Invoice Details
          </span>
          <div className="w-12 h-px mx-1" style={{ background:cardBdr }} />
          <span className="flex items-center gap-1.5" style={{ color:txtM }}>
            <span className="w-5 h-5 border-2 rounded-full flex items-center justify-center text-[10px]" style={{ borderColor:cardBdr }}>2</span>
            Payment &amp; Preview
          </span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color:txtM }} />
            <input placeholder="Search anything..." className="pl-8 pr-4 py-1.5 text-[13px] rounded-lg w-44 focus:outline-none"
              style={{ background: dark?"rgba(255,255,255,0.06)":"#F4F0FF", border:`1px solid ${cardBdr}`, color:txtP }} />
          </div>
          <button className="p-1.5" style={{ color:txtM }}><Bell className="w-4 h-4" /></button>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white" style={{ background:"linear-gradient(135deg,#0077B6,#0096C7)" }}>
            <User className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Invoice Type */}
        <div className="rounded-2xl p-5" style={{ background:cardBg, border:`1px solid ${cardBdr}` }}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-1 h-5 rounded-full" style={{ background:"linear-gradient(180deg,#0077B6,#0096C7)" }} />
            <p className="text-[15px] font-bold" style={{ color:txtP }}>Invoice Type</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {TYPES.map((t) => {
              const active = type === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => changeType(t.value)}
                  className="flex flex-col items-center gap-2 py-3.5 px-4 rounded-2xl transition-all min-w-[84px]"
                  style={{
                    border: `2px solid ${active ? accentC : cardBdr}`,
                    background: active ? accentBg2 : (dark ? "rgba(255,255,255,0.03)" : "#FAFAFA"),
                    color: active ? accentC : txtM,
                    boxShadow: active ? (dark ? "0 0 16px rgba(0,119,182,0.35)" : "0 4px 16px rgba(0,119,182,0.18)") : "none",
                  }}
                >
                  <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: active ? (dark?"rgba(0,119,182,0.30)":"rgba(0,119,182,0.14)") : (dark?"rgba(255,255,255,0.06)":"#F0ECFA") }}>
                    <t.icon className="w-5 h-5" style={{ color: active ? accentC : txtM }} />
                  </div>
                  <span className="text-[12px] font-semibold">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Invoice Details + Bill To (two column) */}
        <div className="grid grid-cols-5 gap-4">
          {/* Invoice Details */}
          <div className="col-span-3 rounded-2xl p-5" style={{ background:cardBg, border:`1px solid ${cardBdr}` }}>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-1 h-5 rounded-full" style={{ background:"linear-gradient(180deg,#0077B6,#0096C7)" }} />
              <p className="text-[15px] font-bold" style={{ color:txtP }}>Invoice Details</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={lblStyle(dark)}>Invoice Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inp(dark)} style={inpStyle(dark)} />
              </div>
              <div>
                <label style={lblStyle(dark)}>SAC Code</label>
                <input value={sacCode} onChange={(e) => setSacCode(e.target.value)} className={`${inp(dark)} font-mono`} style={inpStyle(dark)} />
              </div>
              {(type === "air-intl" || type === "air-dom") && (
                <div className="col-span-2">
                  <label style={lblStyle(dark)}>Airline Selection</label>
                  <select value={airline} onChange={(e) => setAirline(e.target.value)} className={inp(dark)} style={inpStyle(dark)}>
                    <option value="">Select airline...</option>
                    {AIRLINES.map((a) => <option key={a}>{a}</option>)}
                  </select>
                </div>
              )}
              {(type === "train" || type === "bus") && (
                <div className="col-span-2">
                  <label style={lblStyle(dark)}>{type === "train" ? "Train Operator" : "Bus Operator"}</label>
                  <input value={airline} onChange={(e) => setAirline(e.target.value)} placeholder={type === "train" ? "Indian Railways / IRCTC" : "KSRTC / VRL Travels..."} className={inp(dark)} style={inpStyle(dark)} />
                </div>
              )}
              <div>
                <label style={lblStyle(dark)}>GST Type</label>
                <select value={gstType} onChange={(e) => setGstType(e.target.value as GSTType)} className={inp(dark)} style={inpStyle(dark)}>
                  <option value="cgst_sgst">CGST + SGST (Intra-state)</option>
                  <option value="igst">IGST (Inter-state)</option>
                  <option value="none">Without GST</option>
                </select>
              </div>
              {gstType !== "none" && (
                <div>
                  <label style={lblStyle(dark)}>GST Rate</label>
                  <select value={gstRate} onChange={(e) => setGstRate(Number(e.target.value))} className={inp(dark)} style={inpStyle(dark)}>
                    {GST_RATES[type].map((r) => <option key={r} value={r}>{r}%</option>)}
                  </select>
                </div>
              )}
              <div className="col-span-2">
                <label style={lblStyle(dark)}>Notes (optional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any notes for the customer..." rows={2} className={`${inp(dark)} resize-none`} style={inpStyle(dark)} />
              </div>
            </div>
          </div>

          {/* Bill To */}
          <div className="col-span-2 rounded-2xl p-5" style={{ background:cardBg, border:`1px solid ${cardBdr}` }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-1 h-5 rounded-full" style={{ background:"linear-gradient(180deg,#0077B6,#0096C7)" }} />
                <p className="text-[15px] font-bold" style={{ color:txtP }}>Bill To</p>
              </div>
              {!customer && (
                <button onClick={() => setAddingCust(true)} className="text-[13px] font-semibold flex items-center gap-1" style={{ color:accentC }}>
                  <Plus className="w-3 h-3" /> New Customer
                </button>
              )}
            </div>

            {customer ? (
              <div className="rounded-xl p-4" style={{ background:accentBg2, border:`1px solid ${dark?"rgba(0,119,182,0.2)":"#90E0EF"}` }}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-[14px]" style={{ color:accentC }}>{customer.name}</div>
                    {customer.city && <div className="text-[12px] mt-0.5" style={{ color:txtM }}>{customer.city}{customer.state ? `, ${customer.state}` : ""}</div>}
                    {customer.gstin && <div className="text-[12px] mt-1 font-mono font-semibold" style={{ color:accentC }}>GSTIN: {customer.gstin}</div>}
                  </div>
                  <button onClick={() => { setCustomer(null); setCustSearch(""); }} className="text-[12px] font-semibold shrink-0" style={{ color:accentC }}>Change</button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color:txtM }}>Customer Search</p>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color:txtM }} />
                  <input
                    value={custSearch}
                    onChange={(e) => { setCustSearch(e.target.value); setCustDropdown(true); }}
                    onFocus={() => setCustDropdown(true)}
                    placeholder="Search by name or mobile..."
                    className={`${inp(dark)} pl-8`}
                    style={inpStyle(dark)}
                  />
                </div>
                {custDropdown && filteredCusts.length > 0 && (
                  <div className="rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto" style={{ background:cardBg, border:`1px solid ${cardBdr}` }}>
                    {filteredCusts.map((c) => (
                      <button key={c.id} onClick={() => { setCustomer(c); setCustDropdown(false); setCustSearch(""); }}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 transition-colors text-left" style={{ color:txtP }}>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold text-white" style={{ background:"linear-gradient(135deg,#0077B6,#0096C7)" }}>{c.name.charAt(0)}</div>
                        <div>
                          <div className="text-[14px] font-semibold" style={{ color:txtP }}>{c.name}</div>
                          <div className="text-[12px]" style={{ color:txtM }}>{c.mobile || c.phone || ""}{c.gstin ? ` · ${c.gstin}` : ""}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {addingCust && (
                  <div className="mt-3 rounded-xl p-4 space-y-3" style={{ background:accentBg2, border:`1px solid ${dark?"rgba(0,119,182,0.2)":"#90E0EF"}` }}>
                    <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color:accentC }}>Quick Add Customer</p>
                    {[
                      { v:newCust.name, p:"Name *", k:"name", mono:false },
                      { v:newCust.mobile, p:"Mobile *", k:"mobile", mono:false },
                      { v:newCust.gstin, p:"GSTIN (optional)", k:"gstin", mono:true },
                      { v:newCust.city, p:"City", k:"city", mono:false },
                      { v:newCust.address, p:"Address (optional)", k:"address", mono:false },
                    ].map(({v,p,k,mono}) => (
                      <input key={k} value={v}
                        onChange={(e)=>setNewCust(f=>({...f,[k]: k==="gstin"?e.target.value.toUpperCase():e.target.value}))}
                        placeholder={p} className={`${inp(dark)}${mono?" font-mono":""}`} style={inpStyle(dark)} />
                    ))}
                    <select value={newCust.type} onChange={(e)=>setNewCust(f=>({...f,type:e.target.value as any}))}
                      className={inp(dark)} style={inpStyle(dark)}>
                      <option value="individual">Individual</option>
                      <option value="corporate">Corporate</option>
                    </select>
                    <div className="flex gap-2">
                      <button onClick={()=>setAddingCust(false)} className="flex-1 py-1.5 text-[13px] font-semibold rounded-xl" style={{ color:txtM, border:`1px solid ${cardBdr}` }}>Cancel</button>
                      <button onClick={saveNewCust} disabled={!newCust.name||!newCust.mobile} className="flex-1 py-1.5 text-[13px] font-semibold text-white rounded-xl disabled:opacity-40" style={{ background:"linear-gradient(135deg,#0077B6,#0096C7)" }}>Add &amp; Select</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Service Entries table */}
        <div className="rounded-2xl p-5" style={{ background:cardBg, border:`1px solid ${cardBdr}` }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-5 rounded-full" style={{ background:"linear-gradient(180deg,#0077B6,#0096C7)" }} />
              <p className="text-[15px] font-bold" style={{ color:txtP }}>Service Entries</p>
            </div>
            <button onClick={openAdd} className="flex items-center gap-2 text-[13px] font-bold text-white px-4 py-2.5 rounded-xl"
              style={{ background:"linear-gradient(135deg,#0077B6,#0096C7)", boxShadow:"0 4px 14px rgba(0,119,182,0.35)" }}>
              <Plus className="w-3.5 h-3.5" /> {addLabel}
            </button>
          </div>

          {items.length === 0 ? (
            <div className="border-2 border-dashed rounded-2xl py-12 text-center flex flex-col items-center gap-3" style={{ borderColor:cardBdr }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: dark ? "rgba(0,119,182,0.15)" : "rgba(0,119,182,0.08)" }}>
                <Plus className="w-7 h-7" style={{ color:accentC }} />
              </div>
              <div>
                <p className="text-[14px] font-semibold" style={{ color:txtM }}>No entries yet</p>
                <p className="text-[12px] mt-0.5" style={{ color: dark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.30)" }}>Click the button above to add</p>
              </div>
              <button onClick={openAdd} className="text-[13px] font-bold px-4 py-2 rounded-xl text-white" style={{ background:"linear-gradient(135deg,#0077B6,#0096C7)" }}>+ {addLabel}</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[14px]">
                <thead>
                  <tr style={{ borderBottom:`1px solid ${cardBdr}`, background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,119,182,0.04)" }}>
                    <th className="text-left py-2.5 px-3 rounded-l-lg text-[11px] font-bold uppercase tracking-wider" style={{ color:txtM }}>
                      {type === "visa" ? "APPLICANT" : type === "package" ? "LEAD PAX" : type === "hotel" ? "GUEST" : type === "other" ? "DESCRIPTION" : "PAX NAME"}
                    </th>
                    {type !== "other" && (
                      <th className="text-left pb-2.5 text-[11px] font-bold uppercase tracking-wider pr-4" style={{ color:txtM }}>{type === "hotel" ? "HOTEL" : "ROUTE"}</th>
                    )}
                    {type !== "other" && type !== "visa" && (
                      <th className="text-left pb-2.5 text-[11px] font-bold uppercase tracking-wider pr-4" style={{ color:txtM }}>{cols.col3}</th>
                    )}
                    <th className="text-right pb-2.5 text-[11px] font-bold uppercase tracking-wider pr-4" style={{ color:txtM }}>{cols.col4}</th>
                    {cols.col5 && (
                      <th className="text-right pb-2.5 text-[11px] font-bold uppercase tracking-wider pr-4" style={{ color:txtM }}>{cols.col5}</th>
                    )}
                    <th className="text-right pb-2.5 text-[11px] font-bold uppercase tracking-wider" style={{ color:txtM }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const row = getRowLabel(item, type);
                    const route = getRowRoute(item, type);
                    const fd = getRowFlightDate(item, type);
                    const fare = calcItemFare(item, type);
                    const taxable = calcItemTaxable(item, type);
                    return (
                      <tr key={item.id} style={{ borderBottom:`1px solid ${cardBdr}` }}
                        onMouseEnter={e=>(e.currentTarget.style.background=hoverRow)}
                        onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                        <td className="py-3 pr-4">
                          <div className="font-semibold text-[14px]" style={{ color:txtP }}>{row.name}</div>
                          {row.sub && <div className="text-[12px] mt-0.5" style={{ color:txtM }}>{row.sub}</div>}
                        </td>
                        {type !== "other" && (
                          <td className="py-3 pr-4 font-semibold text-[14px]" style={{ color:txtP }}>{route || "—"}</td>
                        )}
                        {type !== "other" && type !== "visa" && (
                          <td className="py-3 pr-4">
                            <div className="font-semibold text-[14px]" style={{ color:txtP }}>{fd.flight || "—"}</div>
                            {fd.date && <div className="text-[12px] mt-0.5" style={{ color:txtM }}>{fd.date}</div>}
                          </td>
                        )}
                        <td className="py-3 pr-4 text-right font-semibold" style={{ color:txtP }}>
                          {fare > 0 ? fmt(fare) : isFareType ? <span style={{ color:txtM }}>—</span> : fmt(taxable)}
                        </td>
                        {cols.col5 && (
                          <td className="py-3 pr-4 text-right font-semibold" style={{ color:"#D97706" }}>{fmt(taxable)}</td>
                        )}
                        <td className="py-3 text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg" style={{ color:txtM }}><Pencil className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setItems((p) => p.filter((i) => i.id !== item.id))} className="p-1.5 rounded-lg" style={{ color:"#B3261E" }}><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Invoice Summary */}
        <div className="flex justify-end">
          <div className="rounded-2xl p-5 w-96" style={{ background:cardBg, border:`1px solid ${cardBdr}`, boxShadow: dark ? "0 8px 32px rgba(0,0,0,0.4)" : "0 8px 32px rgba(0,119,182,0.10)" }}>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-1 h-5 rounded-full" style={{ background:"linear-gradient(180deg,#0077B6,#0096C7)" }} />
              <p className="text-[15px] font-bold" style={{ color:txtP }}>Invoice Summary</p>
            </div>
            <div className="space-y-2.5 text-[14px]">
              {isFareType ? (
                <>
                  <div className="flex justify-between" style={{ color:txtP }}>
                    <span>{type === "hotel" ? "Room Fare" : "Ticket Fare"} <span className="text-[10px] px-1.5 py-0.5 rounded ml-1" style={{ background: dark?"rgba(255,255,255,0.08)":"#F4F0FF", color:txtM }}>exempt</span></span>
                    <span className="font-semibold">{fmt(fareTotal)}</span>
                  </div>
                  {gstType !== "none" && (
                    <div className="flex justify-between" style={{ color:"#D97706" }}>
                      <span>Service Charge <span className="text-[10px] px-1.5 py-0.5 rounded ml-1" style={{ background:"rgba(217,119,6,0.12)", color:"#D97706" }}>taxable</span></span>
                      <span className="font-semibold">{fmt(taxableTotal)}</span>
                    </div>
                  )}
                </>
              ) : isVisa ? (
                <>
                  <div className="flex justify-between" style={{ color:txtP }}><span>Embassy Fee</span><span className="font-semibold">{fmt(fareTotal)}</span></div>
                  {gstType !== "none" && <div className="flex justify-between" style={{ color:"#D97706" }}><span>Service Fee <span className="text-[10px] px-1.5 py-0.5 rounded ml-1" style={{ background:"rgba(217,119,6,0.12)", color:"#D97706" }}>taxable</span></span><span className="font-semibold">{fmt(taxableTotal)}</span></div>}
                </>
              ) : (
                <div className="flex justify-between" style={{ color:txtP }}><span>Taxable Amount</span><span className="font-semibold">{fmt(taxableTotal)}</span></div>
              )}
              {gstType === "cgst_sgst" && (
                <>
                  <div className="flex justify-between" style={{ color:txtM }}><span>CGST ({gstRate/2}%)</span><span>{fmt(cgst)}</span></div>
                  <div className="flex justify-between" style={{ color:txtM }}><span>SGST ({gstRate/2}%)</span><span>{fmt(sgst)}</span></div>
                </>
              )}
              {gstType === "igst" && (
                <div className="flex justify-between" style={{ color:txtM }}><span>IGST ({gstRate}%)</span><span>{fmt(igst)}</span></div>
              )}
              <div className="pt-3 mt-1" style={{ borderTop:`1px solid ${cardBdr}` }}>
                <div className="flex justify-between font-bold text-[17px] px-3 py-2.5 rounded-xl" style={{ background: dark ? "rgba(0,119,182,0.15)" : "rgba(0,119,182,0.08)" }}>
                  <span style={{ color:txtP }}>Grand Total</span>
                  <span style={{ color:accentC }}>{fmt(total)}</span>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <button
                onClick={handleSave}
                disabled={!customer || items.length === 0 || saving}
                className="w-full py-3.5 text-[15px] font-bold text-white rounded-xl disabled:opacity-40 transition-all"
                style={{ background:"linear-gradient(135deg,#0077B6,#0096C7)", boxShadow: (!customer || items.length === 0 || saving) ? "none" : "0 6px 20px rgba(0,119,182,0.45)" }}
              >
                {saving ? (editId ? "Saving..." : "Creating...") : (editId ? "Save Changes" : "Create Invoice")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Entry Modal */}
      {modalItem && (
        <EntryModal
          type={type}
          initial={modalItem}
          onSave={saveEntry}
          onSaveMany={saveManyEntries}
          onClose={() => { setModalItem(null); setEditingId(null); }}
          dark={dark}
          onExtractName={(name) => { if (!customer) setCustSearch(name); }}
          gstType={gstType}
        />
      )}
    </div>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-400 text-sm">Loading...</div>}>
      <NewInvoiceContent />
    </Suspense>
  );
}
