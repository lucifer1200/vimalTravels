"use client";
// app/admin/enquiries/page.tsx
import { useState, useEffect } from "react";
import { CheckCircle, Clock, XCircle, RefreshCw, Loader2, Phone, MapPin, Calendar, MessageSquare } from "lucide-react";

interface Enquiry {
  _id: string;
  fullName: string;
  phone: string;
  destination: string;
  travelDate?: string;
  message?: string;
  status: "new" | "contacted" | "closed";
  createdAt: string;
}

const STATUS_CONFIG = {
  new: { label: "New", color: "bg-blue-100 text-blue-700", icon: Clock },
  contacted: { label: "Contacted", color: "bg-yellow-100 text-yellow-700", icon: Phone },
  closed: { label: "Closed", color: "bg-green-100 text-green-700", icon: CheckCircle },
};

export default function AdminEnquiries() {
  const [token, setToken] = useState("");
  const [authed, setAuthed] = useState(false);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "new" | "contacted" | "closed">("all");

  const fetchEnquiries = async (t: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/enquiries", {
        headers: { "x-admin-token": t },
      });
      if (res.status === 401) { setError("Invalid token."); setAuthed(false); return; }
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setEnquiries(data.data);
      setAuthed(true);
    } catch (e: any) {
      setError(e.message || "Failed to load enquiries.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/enquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success) {
        setEnquiries((prev) => prev.map((e) => (e._id === id ? { ...e, status: status as any } : e)));
      }
    } catch (e) {
      alert("Failed to update status.");
    }
  };

  const filtered = filter === "all" ? enquiries : enquiries.filter((e) => e.status === filter);

  if (!authed) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center pt-20">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-7 h-7 text-orange-400" />
            </div>
            <h1 className="font-display text-2xl font-bold text-navy-900">Admin Panel</h1>
            <p className="text-gray-500 text-sm mt-1">Vimal Travels — Enquiry Manager</p>
          </div>

          {error && <p className="text-red-500 text-sm text-center mb-4 bg-red-50 py-2 rounded-lg">{error}</p>}

          <input
            type="password"
            placeholder="Enter admin token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchEnquiries(token)}
            className="input-field mb-4"
          />
          <button
            onClick={() => fetchEnquiries(token)}
            disabled={!token || loading}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Login
          </button>
        </div>
      </div>
    );
  }

  const counts = {
    all: enquiries.length,
    new: enquiries.filter((e) => e.status === "new").length,
    contacted: enquiries.filter((e) => e.status === "contacted").length,
    closed: enquiries.filter((e) => e.status === "closed").length,
  };

  return (
    <div className="min-h-screen bg-cream pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-navy-900">Enquiry Manager</h1>
            <p className="text-gray-500 text-sm mt-1">{enquiries.length} total enquiries</p>
          </div>
          <button
            onClick={() => fetchEnquiries(token)}
            className="btn-navy flex items-center gap-2 text-sm py-2.5"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["all", "new", "contacted", "closed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${
                filter === f
                  ? "bg-navy-800 text-white shadow-md"
                  : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {f} ({counts[f]})
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No enquiries found.</div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((e) => {
              const cfg = STATUS_CONFIG[e.status];
              const StatusIcon = cfg.icon;
              return (
                <div key={e._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-navy-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {e.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-navy-900">{e.fullName}</h3>
                          <p className="text-gray-400 text-xs">
                            {new Date(e.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4 text-orange-400 shrink-0" />
                          <a href={`tel:${e.phone}`} className="hover:text-orange-500 transition-colors">{e.phone}</a>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
                          {e.destination}
                        </div>
                        {e.travelDate && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4 text-orange-400 shrink-0" />
                            {new Date(e.travelDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </div>
                        )}
                        {e.message && (
                          <div className="flex items-start gap-2 text-gray-600 sm:col-span-2">
                            <MessageSquare className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                            <span className="text-xs">{e.message}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status + Actions */}
                    <div className="flex flex-col gap-2 shrink-0">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {cfg.label}
                      </span>
                      <select
                        value={e.status}
                        onChange={(ev) => updateStatus(e._id, ev.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-300 cursor-pointer"
                      >
                        <option value="new">Mark as New</option>
                        <option value="contacted">Mark as Contacted</option>
                        <option value="closed">Mark as Closed</option>
                      </select>
                      <a
                        href={`https://wa.me/91${e.phone.replace(/\D/g, "")}?text=Hi ${encodeURIComponent(e.fullName)}, this is Vimal Travels regarding your enquiry for ${encodeURIComponent(e.destination)}.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-center transition-colors"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
