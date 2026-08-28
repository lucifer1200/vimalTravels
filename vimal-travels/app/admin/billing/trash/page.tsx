"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, RotateCcw, X, AlertTriangle } from "lucide-react";
import { getDeletedInvoices, restoreInvoice, permanentDeleteInvoice, type Invoice } from "@/lib/billing";
import { useAdminDark } from "@/lib/useAdminDark";

const TYPE_LABEL: Record<string, string> = {
  "air-intl": "Intl Flight", "air-dom": "Dom Flight",
  train: "Train", bus: "Bus", hotel: "Hotel",
  package: "Package", visa: "Visa", other: "Other",
};

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatINR(n: number) {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function TrashPage() {
  const dark = useAdminDark();
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [confirm,  setConfirm]  = useState<string | null>(null); // id to permanently delete
  const [busy,     setBusy]     = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const data = await getDeletedInvoices();
    setInvoices(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleRestore(id: string) {
    setBusy(id);
    await restoreInvoice(id);
    await load();
    setBusy(null);
  }

  async function handlePermanentDelete(id: string) {
    setBusy(id);
    await permanentDeleteInvoice(id);
    setConfirm(null);
    await load();
    setBusy(null);
  }

  const bg    = dark ? "#111111" : "#F8F8FC";
  const card  = dark ? "rgba(28,28,38,0.95)" : "#FFFFFF";
  const border= dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const text  = dark ? "#E6E1E5" : "#1C1B1F";
  const sub   = dark ? "#938F99" : "#79747E";

  return (
    <div style={{ minHeight: "100vh", background: bg, padding: "24px 20px", fontFamily: "var(--font-roboto), Roboto, system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(186,26,26,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Trash2 style={{ width: 18, height: 18, color: "#B3261E" }} />
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: text, margin: 0, letterSpacing: "-0.4px" }}>Trash</h1>
          <p style={{ fontSize: 12, color: sub, margin: 0 }}>Deleted invoices — restore or permanently remove</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 60 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2.5px solid #0077B6", borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />
        </div>
      ) : invoices.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 80, gap: 12 }}>
          <Trash2 style={{ width: 48, height: 48, color: sub, opacity: 0.4 }} />
          <p style={{ color: sub, fontSize: 15, margin: 0 }}>Trash is empty</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 860 }}>
          {invoices.map(inv => (
            <div key={inv.id}
              style={{
                background: card,
                border: `1px solid ${border}`,
                borderRadius: 16,
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}>
              {/* Type badge */}
              <div style={{ flexShrink: 0, width: 76, height: 26, borderRadius: 8, background: "rgba(186,26,26,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#B3261E", letterSpacing: "0.05em" }}>{TYPE_LABEL[inv.type] ?? inv.type}</span>
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: text }}>{inv.invoiceNo}</span>
                  <span style={{ fontSize: 12, color: sub }}>{inv.customer?.name ?? "—"}</span>
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 2, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: sub }}>Date: {formatDate(inv.date)}</span>
                  <span style={{ fontSize: 11, color: sub }}>Deleted: {formatDate(inv.deletedAt)}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: dark ? "#90E0EF" : "#0077B6" }}>₹{formatINR(inv.total)}</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button
                  disabled={busy === inv.id}
                  onClick={() => handleRestore(inv.id)}
                  title="Restore"
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 12px", borderRadius: 10, border: `1px solid ${dark ? "rgba(0,150,199,0.35)" : "rgba(0,119,182,0.30)"}`,
                    background: dark ? "rgba(0,150,199,0.12)" : "rgba(0,119,182,0.06)",
                    color: dark ? "#90E0EF" : "#0077B6",
                    fontSize: 12, fontWeight: 700, cursor: "pointer",
                    opacity: busy === inv.id ? 0.5 : 1,
                  }}>
                  <RotateCcw style={{ width: 13, height: 13 }} />
                  Restore
                </button>
                <button
                  disabled={busy === inv.id}
                  onClick={() => setConfirm(inv.id)}
                  title="Delete permanently"
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 12px", borderRadius: 10, border: "1px solid rgba(186,26,26,0.30)",
                    background: "rgba(186,26,26,0.08)",
                    color: "#B3261E",
                    fontSize: 12, fontWeight: 700, cursor: "pointer",
                    opacity: busy === inv.id ? 0.5 : 1,
                  }}>
                  <X style={{ width: 13, height: 13 }} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm permanent delete modal */}
      {confirm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 20, padding: "28px 28px 22px", maxWidth: 380, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.35)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <AlertTriangle style={{ width: 22, height: 22, color: "#B3261E", flexShrink: 0 }} />
              <span style={{ fontSize: 16, fontWeight: 800, color: text }}>Delete Permanently?</span>
            </div>
            <p style={{ fontSize: 13, color: sub, lineHeight: 1.6, marginBottom: 20 }}>
              This invoice will be <strong>permanently removed</strong> and cannot be recovered. Are you sure?
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setConfirm(null)}
                style={{ padding: "8px 18px", borderRadius: 10, border: `1px solid ${border}`, background: "transparent", color: sub, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={() => handlePermanentDelete(confirm)} disabled={!!busy}
                style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: "#B3261E", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: busy ? 0.6 : 1 }}>
                {busy ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
