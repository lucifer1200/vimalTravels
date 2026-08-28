// Billing data types and Supabase helpers

// ── Core types ─────────────────────────────────────────────────────────────────

export type CustomerType   = "individual" | "corporate";
export type InvoiceType    = "air-intl" | "air-dom" | "train" | "bus" | "hotel" | "package" | "visa" | "other";
export type GSTType        = "cgst_sgst" | "igst" | "none";
export type PaymentMode    = "cash" | "upi" | "bank" | "cheque" | "card" | "other";
export type InvoiceStatus  = "paid" | "partial" | "due";
export type VoucherStatus  = "pending" | "confirmed" | "cancelled";
export type MealPlan       = "EP" | "CP" | "MAP" | "AP";

// ── Customer ──────────────────────────────────────────────────────────────────

export interface Customer {
  id?: string;
  code?: string;
  name: string;
  mobile?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  stateCode?: string;
  gstin?: string;
  type?: CustomerType;
  createdAt?: string;
}

// ── Invoice item variants ─────────────────────────────────────────────────────

export interface FlightItem {
  id?: string;
  paxNo?: string;
  paxName?: string;
  sectorFrom?: string;
  sectorTo?: string;
  flightNo?: string;
  flightClass?: string;
  travelDate?: string;
  returnSectorFrom?: string;
  returnSectorTo?: string;
  returnFlightNo?: string;
  returnFlightClass?: string;
  returnDate?: string;
  airlinePnr?: string;
  description?: string;
  amount: number;
  quantity?: number;
  serviceCharge?: number;
}

export interface TrainItem {
  id?: string;
  paxName?: string;
  trainNo?: string;
  trainName?: string;
  sectorFrom?: string;
  sectorTo?: string;
  fromStation?: string;
  toStation?: string;
  travelDate?: string;
  pnr?: string;
  class?: string;
  travelClass?: string;
  seatNo?: string;
  description?: string;
  amount: number;
  quantity?: number;
  serviceCharge?: number;
}

export interface BusItem {
  id?: string;
  paxName?: string;
  operator?: string;
  sectorFrom?: string;
  sectorTo?: string;
  fromCity?: string;
  toCity?: string;
  travelDate?: string;
  pnr?: string;
  departTime?: string;
  seatNo?: string;
  ticketNo?: string;
  description?: string;
  amount: number;
  quantity?: number;
  serviceCharge?: number;
}

export interface HotelItem {
  id?: string;
  guestName?: string;
  adults?: number;
  children?: number;
  hotelName?: string;
  hotelCity?: string;
  hotelAddress?: string;
  hotelPhone?: string;
  hotelEmail?: string;
  checkIn?: string;
  checkInTime?: string;
  checkOut?: string;
  checkOutTime?: string;
  nights?: number;
  roomType?: string;
  roomCount?: number;
  mealPlan?: MealPlan;
  confirmationNo?: string;  // HCN / Voucher No
  bookingRef?: string;      // OTA / supplier booking reference
  description?: string;
  amount: number;        // room fare — GST exempt
  serviceCharge?: number; // taxable
  quantity?: number;
}

export interface PackageItem {
  id?: string;
  leadPax?: string;
  paxCount?: number;
  destinations?: string;
  perPersonRate?: number;
  travelFrom?: string;
  travelTo?: string;
  inclusions?: string;
  totalAmount?: number;
  description?: string;
  amount: number;
  quantity?: number;
}

export interface VisaItem {
  id?: string;
  applicantName?: string;
  visaCountry?: string;
  visaType?: string;
  embassyFee?: number;
  serviceFee?: number;
  description?: string;
  amount: number;
  quantity?: number;
}

export interface GenericItem {
  id?: string;
  description: string;
  amount: number;
  quantity?: number;
}

export type InvoiceItem = FlightItem | PackageItem | VisaItem | GenericItem | TrainItem | BusItem | HotelItem;

// ── Payment ───────────────────────────────────────────────────────────────────

export interface Payment {
  id: string;
  amount: number;
  mode?: PaymentMode;
  method?: PaymentMode;  // alias
  refNo?: string;
  bankName?: string;
  date: string;
  note?: string;
}

// ── Invoice ───────────────────────────────────────────────────────────────────

export interface Invoice {
  id: string;
  invoiceNo: string;
  type: InvoiceType;
  airline?: string;
  customerId?: string;
  customer: Customer;
  date: string;
  dueDate?: string;
  items: InvoiceItem[];
  subtotal?: number;
  serviceCharge?: number;
  gstType?: GSTType;
  gstRate?: number;
  sacCode?: string;
  cgst?: number;
  sgst?: number;
  igst?: number;
  gst?: number;
  taxableAmount?: number;
  fareTotal?: number;
  financialYear?: string;
  total: number;
  notes?: string;
  status: InvoiceStatus;
  payments: Payment[];
  createdAt: string;
}

// ── Voucher ───────────────────────────────────────────────────────────────────

export interface Voucher {
  id: string;
  voucherNo: string;
  date: string;
  type: "hotel" | "transport" | "package" | "other";
  customerName: string;
  vendorName?: string;
  details?: string;
  amount: number;
  status: VoucherStatus;
  createdAt: string;
}

// ── Company constants ─────────────────────────────────────────────────────────

export const COMPANY = {
  name:      "VIMAL TRAVELS",
  address:   "No 5 Vimal Shopping Complex, MSR Main Road, Gokula, Bangalore (560054)",
  state:     "Karnataka",
  stateCode: "29",
  gstin:     "29ABYPK8170A1Z8",
  pan:       "ABYPK8170A",
  mobile1:   "9886114440",
  mobile2:   "9845679729",
  email:     "vimaltrls@gmail.com",
  bank:      "Canara Bank",
  accountNo: "3063101009711",
  ifsc:      "CNRB0003063",
  branch:    "Gokula, Bangalore",
};

// ── Labels ────────────────────────────────────────────────────────────────────

export const TYPE_LABEL: Record<InvoiceType, string> = {
  "air-intl": "International Air",
  "air-dom":  "Domestic Air",
  train:      "Train",
  bus:        "Bus",
  hotel:      "Hotel / Stay",
  package:    "Tour Package",
  visa:       "Visa Services",
  other:      "Other",
};

export const TYPE_LABEL_FULL: Record<InvoiceType, string> = {
  "air-intl": "International Air Ticket Invoice",
  "air-dom":  "Domestic Air Ticket Invoice",
  train:      "Train Ticket Invoice",
  bus:        "Bus Ticket Invoice",
  hotel:      "Hotel Accommodation Invoice",
  package:    "Tour Package Invoice",
  visa:       "Visa / Passport Invoice",
  other:      "Service Invoice",
};

// ── Supabase import ───────────────────────────────────────────────────────────

import { getSupabase } from "./supabase";

const TYPE_PREFIX: Record<InvoiceType, string> = {
  "air-intl": "ITI",
  "air-dom":  "MDI",
  train:      "VT-TRN",
  bus:        "VT-BUS",
  hotel:      "MHI",
  package:    "VT-PKG",
  visa:       "VT-VIS",
  other:      "VT-INV",
};

const TYPE_SAC: Record<InvoiceType, string> = {
  "air-intl": "998552",
  "air-dom":  "998551",
  train:      "998554",
  bus:        "998554",
  hotel:      "996311",
  package:    "998555",
  visa:       "998599",
  other:      "999999",
};

const DEFAULT_COUNTERS: Record<string, number> = {
  "air-intl": 0,
  "air-dom":  0,
  train:      0,
  bus:        0,
  hotel:      0,
  package:    0,
  visa:       0,
  other:      0,
  customer:   0,
  voucher:    0,
};

// ── Financial Year helpers ────────────────────────────────────────────────────

export function getFinancialYear(date?: string): string {
  const d = date ? new Date(date) : new Date();
  const year  = d.getFullYear();
  const month = d.getMonth() + 1; // 1-indexed
  const fyStart = month >= 4 ? year : year - 1;
  return `${String(fyStart).slice(-2)}-${String(fyStart + 1).slice(-2)}`;
}

export function fyDateRange(fy: string): { start: Date; end: Date } {
  const [s] = fy.split("-").map(Number);
  const startYear = s < 50 ? 2000 + s : 1900 + s;
  return {
    start: new Date(startYear, 3, 1),       // Apr 1
    end:   new Date(startYear + 1, 2, 31),  // Mar 31
  };
}

// ── Counter helpers (Supabase) ────────────────────────────────────────────────

async function incrementCounter(key: string): Promise<number> {
  // Upsert: increment atomically using Supabase RPC-style update
  const { data } = await getSupabase()
    .from("counters")
    .select("value")
    .eq("key", key)
    .single();

  const next = (data?.value ?? 0) + 1;

  await getSupabase()
    .from("counters")
    .upsert({ key, value: next }, { onConflict: "key" });

  return next;
}

// ── Customer CRUD ─────────────────────────────────────────────────────────────

export async function getCustomers(): Promise<Customer[]> {
  const { data, error } = await getSupabase()
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error(error); return []; }
  return (data || []).map(dbToCustomer);
}

export async function addCustomer(c: Omit<Customer, "id" | "code" | "createdAt">): Promise<Customer> {
  const seq = await incrementCounter("customer");
  const row = {
    name:       c.name,
    mobile:     c.mobile,
    phone:      c.phone,
    email:      c.email,
    address:    c.address,
    city:       c.city,
    state:      c.state,
    state_code: c.stateCode,
    gstin:      c.gstin,
    type:       c.type ?? "individual",
    code:       `CUST-${String(seq).padStart(3, "0")}`,
  };
  const { data, error } = await getSupabase().from("customers").insert(row).select().single();
  if (error) throw error;
  return dbToCustomer(data);
}

export async function updateCustomer(id: string, updates: Partial<Customer>): Promise<void> {
  const row: Record<string, unknown> = {};
  if (updates.name       !== undefined) row.name       = updates.name;
  if (updates.mobile     !== undefined) row.mobile     = updates.mobile;
  if (updates.phone      !== undefined) row.phone      = updates.phone;
  if (updates.email      !== undefined) row.email      = updates.email;
  if (updates.address    !== undefined) row.address    = updates.address;
  if (updates.city       !== undefined) row.city       = updates.city;
  if (updates.state      !== undefined) row.state      = updates.state;
  if (updates.stateCode  !== undefined) row.state_code = updates.stateCode;
  if (updates.gstin      !== undefined) row.gstin      = updates.gstin;
  if (updates.type       !== undefined) row.type       = updates.type;
  await getSupabase().from("customers").update(row).eq("id", id);
}

export async function deleteCustomer(id: string): Promise<void> {
  await getSupabase().from("customers").delete().eq("id", id);
}

export async function syncCustomerFromInvoice(inv: Invoice): Promise<void> {
  if (!inv.customer?.name) return;
  const { data } = await getSupabase()
    .from("customers")
    .select("id")
    .ilike("name", inv.customer.name)
    .limit(1);
  if (!data || data.length === 0) {
    await addCustomer(inv.customer);
  }
}

function dbToCustomer(row: Record<string, unknown>): Customer {
  return {
    id:         row.id as string,
    code:       row.code as string,
    name:       row.name as string,
    mobile:     row.mobile as string,
    phone:      row.phone as string,
    email:      row.email as string,
    address:    row.address as string,
    city:       row.city as string,
    state:      row.state as string,
    stateCode:  row.state_code as string,
    gstin:      row.gstin as string,
    type:       row.type as CustomerType,
    createdAt:  row.created_at as string,
  };
}

// ── Invoice CRUD ──────────────────────────────────────────────────────────────

export async function getInvoices(): Promise<Invoice[]> {
  const { data, error } = await getSupabase()
    .from("invoices")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error(error); return []; }
  return (data || []).map(dbToInvoice);
}

export async function nextInvoiceNo(type: InvoiceType, gstType?: GSTType, date?: string): Promise<string> {
  const fy  = getFinancialYear(date);
  const ng  = gstType === "none";
  const key = ng ? `${type}-ng-${fy}` : `${type}-${fy}`;
  const seq = await incrementCounter(key);
  const prefix = ng ? TYPE_PREFIX[type] + "NG" : TYPE_PREFIX[type];
  return `${prefix}${String(seq).padStart(8, "0")}`;
}

export async function addInvoice(
  invoice: Omit<Invoice, "id" | "invoiceNo" | "sacCode" | "createdAt" | "financialYear">
): Promise<Invoice> {
  const fy       = getFinancialYear(invoice.date);
  const invoiceNo = await nextInvoiceNo(invoice.type, invoice.gstType, invoice.date);
  const row = invoiceToDb({
    ...invoice,
    id:            crypto.randomUUID(),
    invoiceNo,
    sacCode:       TYPE_SAC[invoice.type],
    financialYear: fy,
    createdAt:     new Date().toISOString(),
  });
  const { data, error } = await getSupabase().from("invoices").insert(row).select().single();
  if (error) throw error;
  return dbToInvoice(data);
}

export async function saveInvoice(inv: Invoice): Promise<void> {
  const row = invoiceToDb(inv);
  await getSupabase().from("invoices").upsert(row, { onConflict: "id" });
}

export async function getInvoice(id: string): Promise<Invoice | undefined> {
  const { data } = await getSupabase().from("invoices").select("*").eq("id", id).single();
  return data ? dbToInvoice(data) : undefined;
}

export async function getInvoiceById(id: string): Promise<Invoice | undefined> {
  return getInvoice(id);
}

export async function deleteInvoice(id: string): Promise<void> {
  await getSupabase().from("invoices").delete().eq("id", id);
}

export async function addPayment(invoiceId: string, payment: Omit<Payment, "id">): Promise<void> {
  const inv = await getInvoice(invoiceId);
  if (!inv) return;
  if (!inv.payments) inv.payments = [];
  inv.payments.push({ ...payment, id: crypto.randomUUID() });
  const totalPaid = inv.payments.reduce((s, p) => s + p.amount, 0);
  inv.status = totalPaid >= inv.total ? "paid" : totalPaid > 0 ? "partial" : "due";
  await saveInvoice(inv);
}

export function computeStatus(inv: Invoice): InvoiceStatus {
  const paid = (inv.payments || []).reduce((s, p) => s + p.amount, 0);
  if (paid <= 0) return "due";
  if (paid >= inv.total) return "paid";
  return "partial";
}

function invoiceToDb(inv: Invoice): Record<string, unknown> {
  return {
    id:             inv.id,
    invoice_no:     inv.invoiceNo,
    type:           inv.type,
    airline:        inv.airline,
    customer_id:    inv.customerId,
    customer:       inv.customer,
    date:           inv.date,
    due_date:       inv.dueDate,
    items:          inv.items,
    subtotal:       inv.subtotal ?? 0,
    service_charge: inv.serviceCharge ?? 0,
    gst_type:       inv.gstType ?? "none",
    gst_rate:       inv.gstRate ?? 0,
    sac_code:       inv.sacCode,
    cgst:           inv.cgst ?? 0,
    sgst:           inv.sgst ?? 0,
    igst:           inv.igst ?? 0,
    gst:            inv.gst ?? 0,
    taxable_amount: inv.taxableAmount ?? 0,
    fare_total:     inv.fareTotal ?? 0,
    financial_year: inv.financialYear,
    total:          inv.total,
    notes:          inv.notes,
    status:         inv.status,
    payments:       inv.payments ?? [],
  };
}

function dbToInvoice(row: Record<string, unknown>): Invoice {
  return {
    id:            row.id as string,
    invoiceNo:     row.invoice_no as string,
    type:          row.type as InvoiceType,
    airline:       row.airline as string | undefined,
    customerId:    row.customer_id as string | undefined,
    customer:      row.customer as Customer,
    date:          row.date as string,
    dueDate:       row.due_date as string | undefined,
    items:         (row.items as InvoiceItem[]) ?? [],
    subtotal:      Number(row.subtotal ?? 0),
    serviceCharge: Number(row.service_charge ?? 0),
    gstType:       row.gst_type as GSTType | undefined,
    gstRate:       Number(row.gst_rate ?? 0),
    sacCode:       row.sac_code as string | undefined,
    cgst:          Number(row.cgst ?? 0),
    sgst:          Number(row.sgst ?? 0),
    igst:          Number(row.igst ?? 0),
    gst:           Number(row.gst ?? 0),
    taxableAmount: Number(row.taxable_amount ?? 0),
    fareTotal:     Number(row.fare_total ?? 0),
    financialYear: row.financial_year as string | undefined,
    total:         Number(row.total ?? 0),
    notes:         row.notes as string | undefined,
    status:        row.status as InvoiceStatus,
    payments:      (row.payments as Payment[]) ?? [],
    createdAt:     row.created_at as string,
  };
}

// ── Formatting ────────────────────────────────────────────────────────────────

export function formatINR(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n || 0);
}

export function fmtDate(d: string): string {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return d; }
}

export function amountToWords(amount: number): string {
  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convert(n: number): string {
    if (n === 0) return "";
    if (n < 20)  return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + convert(n % 100) : "");
    if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "");
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + convert(n % 10000000) : "");
  }

  const rupees = Math.floor(amount);
  const paise  = Math.round((amount - rupees) * 100);
  let words = (convert(rupees) || "Zero") + " Rupees";
  if (paise > 0) words += " and " + convert(paise) + " Paise";
  return words + " Only";
}
