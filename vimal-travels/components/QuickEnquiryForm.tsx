"use client";
// components/QuickEnquiryForm.tsx
import { useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";

export default function QuickEnquiryForm() {
  const [form, setForm] = useState({
    fullName: "", phone: "", destination: "", travelDate: "", message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const isValid = form.fullName.trim() !== "" && form.phone.trim() !== "" && form.destination.trim() !== "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setStatus("success");
      setForm({ fullName: "", phone: "", destination: "", travelDate: "", message: "" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h3 className="font-display text-2xl font-bold text-slate-900">Enquiry Sent!</h3>
        <p className="text-gray-500 text-sm">We&apos;ll get back to you within a few hours.</p>
        <button onClick={() => setStatus("idle")} className="btn-primary text-sm mt-2">
          Send Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <input
          name="fullName" value={form.fullName} onChange={handleChange}
          placeholder="Your Full Name *"
          required
          className="input-field"
        />
        {form.fullName.trim() && <span className="absolute right-3 top-3.5 text-green-500 text-xs">✓</span>}
      </div>

      <div className="relative">
        <input
          name="phone" value={form.phone} onChange={handleChange}
          placeholder="Phone Number *"
          required
          className="input-field"
        />
        {form.phone.trim() && <span className="absolute right-3 top-3.5 text-green-500 text-xs">✓</span>}
      </div>

      <div className="relative">
        <input
          name="destination" value={form.destination} onChange={handleChange}
          placeholder="Destination / Package *"
          required
          className="input-field"
        />
        {form.destination.trim() && <span className="absolute right-3 top-3.5 text-green-500 text-xs">✓</span>}
      </div>

      <input
        name="travelDate" value={form.travelDate} onChange={handleChange}
        type="date"
        className="input-field text-gray-500"
      />

      <textarea
        name="message" value={form.message} onChange={handleChange}
        placeholder="Message (optional)"
        rows={3}
        className="input-field resize-none"
      />

      {status === "error" && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={!isValid || status === "loading"}
        className={`w-full font-semibold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 text-sm
          ${isValid
            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer"
            : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
          }`}
      >
        {status === "loading" ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
        ) : (
          <>{isValid ? "✈ Send Enquiry" : "Fill required fields to continue"}</>
        )}
      </button>

      <a
        href="https://wa.me/919886114440"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
      >
        <svg viewBox="0 0 32 32" className="w-5 h-5 fill-white"><path d="M16.004 2C8.28 2 2 8.28 2 16.004c0 2.46.637 4.77 1.756 6.782L2 30l7.44-1.726A13.93 13.93 0 0016.004 30C23.72 30 30 23.72 30 16.004 30 8.28 23.72 2 16.004 2zm0 25.428a11.71 11.71 0 01-5.978-1.635l-.43-.255-4.42 1.025 1.062-4.31-.28-.445a11.71 11.71 0 01-1.81-6.304C4.148 9.487 9.486 4.148 16.004 4.148c6.518 0 11.856 5.34 11.856 11.856 0 6.518-5.338 11.424-11.856 11.424zm6.494-8.854c-.355-.178-2.1-1.036-2.425-1.155-.325-.118-.56-.178-.797.178-.236.356-.916 1.155-1.122 1.393-.207.237-.414.266-.77.089-.355-.177-1.5-.552-2.857-1.762-1.056-.942-1.77-2.103-1.977-2.459-.207-.355-.022-.547.155-.724.16-.16.355-.414.533-.622.178-.207.237-.355.355-.592.119-.237.06-.444-.03-.622-.088-.178-.796-1.924-1.09-2.635-.287-.693-.58-.598-.797-.61l-.68-.01c-.237 0-.622.089-.948.444-.325.356-1.24 1.214-1.24 2.96 0 1.745 1.27 3.43 1.447 3.667.178.237 2.5 3.82 6.057 5.357.847.365 1.508.583 2.024.746.85.27 1.625.232 2.238.14.682-.1 2.1-.858 2.396-1.687.296-.83.296-1.54.207-1.688-.088-.148-.325-.237-.68-.414z"/></svg>
        Chat on WhatsApp
      </a>
    </form>
  );
}
