// PDF booking parser — extracts MMT / Booking.com / Goibibo details from raw PDF text
// No API calls required — pure regex on pdfjs-extracted text

import type { MealPlan, VoucherStatus } from "./billing";

export interface ParsedBooking {
  confirmationNo: string;
  date: string;
  status: VoucherStatus;
  guestName: string;
  adultCount: number;
  childCount: number;
  nights: number;
  roomCount: number;
  roomType: string;
  mealPlan: MealPlan;
  checkIn: string;
  checkOut: string;
  checkInTime: string;
  checkOutTime: string;
  hotelName: string;
  hotelCity: string;
  hotelAddress: string;
  hotelContact: string;
  hotelEmail: string;
  hotelStars: number;
  amenities: string;
  importantInfo: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseDateStr(raw: string): string {
  if (!raw) return "";
  try {
    const clean = raw.replace(/^[A-Za-z]+,?\s*/, "").trim(); // strip "Wed, "
    const d = new Date(clean);
    if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
  } catch {}
  return "";
}

function deduplicateName(name: string): string {
  if (!name) return "";
  const words = name.trim().split(/\s+/);
  const half = Math.floor(words.length / 2);
  if (half >= 1) {
    const a = words.slice(0, half).join(" ").toLowerCase();
    const b = words.slice(half).join(" ").toLowerCase();
    if (a === b) {
      return words.slice(0, half)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
    }
  }
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

function mealPlanCode(raw: string): MealPlan {
  const s = (raw || "").toLowerCase();
  if (s.includes("all meal") || s === "ap") return "AP";
  if (s.includes("breakfast") && (s.includes("dinner") || s.includes("lunch") || s.includes("map"))) return "MAP";
  if (s.includes("breakfast") || s === "cp") return "CP";
  return "EP";
}

// ── Main parser ───────────────────────────────────────────────────────────────

export function parseMmtText(rawText: string): Partial<ParsedBooking> {
  // Fix broken time strings like "12:\n00 PM" → "12:00 PM"
  let text = rawText
    .replace(/(\d{1,2}:)\s*\n\s*(\d{2}\s*[AP]M)/gi, "$1$2")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  const result: Partial<ParsedBooking> = {};

  // Booking ID
  const bidM = text.match(/Booking (?:ID|No\.?|Number)\s*[:\-–]?\s*\n?([A-Z0-9\-]+)/i);
  if (bidM) result.confirmationNo = bidM[1].trim();

  // Booking Date
  const bdM = text.match(/Booking Date\s*\n([\w\s,]+\d{4})/i);
  if (bdM) result.date = parseDateStr(bdM[1].trim());

  // Status
  if (/BOOKING CONFIRMED/i.test(text)) result.status = "confirmed";
  else if (/BOOKING CANCELLED/i.test(text)) result.status = "cancelled";
  else result.status = "pending";

  // Reservation: "7 Night | 2 Adults, 0 Children | 1 Room"
  const resM = text.match(
    /Reservation for\s*[-–]\s*(\d+)\s*Night[s]?\s*\|\s*(\d+)\s*Adult[s]?,\s*(\d+)\s*Children\s*\|\s*(\d+)\s*Room/i
  );
  if (resM) {
    result.nights     = parseInt(resM[1]);
    result.adultCount = parseInt(resM[2]);
    result.childCount = parseInt(resM[3]);
    result.roomCount  = parseInt(resM[4]);
  } else {
    // Fallback: "X Night(s)" anywhere
    const nM = text.match(/(\d+)\s*Nights?/i);
    if (nM) result.nights = parseInt(nM[1]);
    // adults fallback
    const aM = text.match(/(\d+)\s*Adult\(s\)/i);
    if (aM) result.adultCount = parseInt(aM[1]);
    const cM = text.match(/,?\s*(\d+)\s*Children/i);
    if (cM) result.childCount = parseInt(cM[1]);
    const rM = text.match(/(\d+)\s*Room(?!\s*Type)/i);
    if (rM) result.roomCount = parseInt(rM[1]);
  }

  // Room Type: "Room 1 – Standard Double Room"
  const rtM = text.match(/Room \d+\s*[-–]\s*(.+)/i);
  if (rtM) result.roomType = rtM[1].trim();

  // Meal Plan
  const mpM = text.match(/Meal Plan\s*[-–:]\s*([^\n]+)/i);
  if (mpM) result.mealPlan = mealPlanCode(mpM[1].trim());

  // Guest Name: "Basheer ahmed Basheer ahmed (Primary Guest)"
  const gnM = text.match(/([A-Za-z\s]+?)\s*\(Primary Guest\)/i);
  if (gnM) result.guestName = deduplicateName(gnM[1].trim()).toUpperCase();

  // Amenities block after "Room Type and Amenities"
  const amM = text.match(/Room Type and Amenities\s*\n([\s\S]+?)(?=Guest Details|Room \d|\n{3,})/i);
  if (amM) {
    result.amenities = amM[1]
      .replace(/\n/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim()
      .replace(/\.$/, "");
  }

  // Check Out: time then date on next line
  const coM = text.match(/Check Out\s*\n([\d: APMam-]+)\n([\w,\s]+\d{4})/i);
  if (coM) {
    result.checkOutTime = coM[1].trim();
    result.checkOut     = parseDateStr(coM[2].trim());
  }

  // Check In: time then date
  const ciM = text.match(/Check In\s*\n([\d: APMam-]+)\n([\w,\s]+\d{4})/i);
  if (ciM) {
    result.checkInTime = ciM[1].trim();
    result.checkIn     = parseDateStr(ciM[2].trim());
  }

  // Hotel city from "Hotel in Maldives | …"
  const hcM = text.match(/Hotel in ([^|,\n\r]+)/i);
  if (hcM) result.hotelCity = hcM[1].trim();

  // Hotel name: line immediately after "Hotel in … Nights"
  const hnM = text.match(/Hotel in [^\n]+\n([^\n]+)/i);
  if (hnM) result.hotelName = hnM[1].trim();

  // Hotel address: line after hotel name in the hotel section
  const haM = text.match(/Hotel in [^\n]+\n[^\n]+\n([^\n]+)/i);
  if (haM) result.hotelAddress = haM[1].trim();

  // Contacts — hotel is the 2nd occurrence (1st is Vimal Travels' own contact)
  const allContacts = Array.from(text.matchAll(/Contact Number\s*[-–:]\s*([^\n]+)/gi));
  if (allContacts.length >= 2) result.hotelContact = allContacts[1][1].trim();
  else if (allContacts.length === 1) result.hotelContact = allContacts[0][1].trim();

  // Emails — hotel is 2nd occurrence
  const allEmails = Array.from(text.matchAll(/Email ID\s*[-–:]\s*([^\n]+)/gi));
  if (allEmails.length >= 2) result.hotelEmail = allEmails[1][1].trim();
  else if (allEmails.length === 1) result.hotelEmail = allEmails[0][1].trim();

  // Important info after "Must read"
  const iiM = text.match(/Must read\s*\n([\s\S]+?)(?=Hotel Amenities|Guest Profile|$)/i);
  if (iiM) {
    result.importantInfo = iiM[1]
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 5)
      .join("|");
  }

  // Star count: count ★ chars if present
  const starM = text.match(/(★+)/);
  if (starM) result.hotelStars = Math.min(5, starM[1].length);
  else result.hotelStars = 3;

  return result;
}

// ── PDF text extraction (browser-only, uses pdfjs-dist + Tesseract OCR fallback) ──

export async function extractTextFromPdf(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const buffer = await file.arrayBuffer();
  const pdf    = await pdfjs.getDocument({ data: buffer }).promise;

  // First try standard text extraction
  const pageTexts: string[] = [];
  let totalItems = 0;
  for (let p = 1; p <= pdf.numPages; p++) {
    const page    = await pdf.getPage(p);
    const content = await page.getTextContent();
    const lines   = content.items
      .map((item: any) => ("str" in item ? item.str : ""))
      .filter((s: string) => s.trim().length > 0);
    totalItems += lines.length;
    pageTexts.push(lines.join("\n"));
  }

  // If PDF has no text items (path-rendered fonts like IndiGo, Air Arabia) → OCR
  if (totalItems === 0) {
    return ocrPdf(pdf);
  }

  return pageTexts.join("\n");
}

// Render PDF page to canvas, then OCR with Tesseract.js
async function ocrPdf(pdf: any): Promise<string> {
  // Only OCR page 1 — contains all key booking info (PNR, pax name, route, date)
  const page     = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 2.5 }); // higher scale = better OCR accuracy

  const canvas     = document.createElement("canvas");
  canvas.width     = viewport.width;
  canvas.height    = viewport.height;
  const ctx        = canvas.getContext("2d")!;
  await page.render({ canvasContext: ctx, viewport }).promise;

  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng");
  const { data: { text } } = await worker.recognize(canvas);
  await worker.terminate();

  return text;
}

// ── Convenience: extract + parse in one call ──────────────────────────────────

export async function importBookingPdf(file: File): Promise<Partial<ParsedBooking>> {
  const text = await extractTextFromPdf(file);
  return parseMmtText(text);
}
