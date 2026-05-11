"use client";
// components/NewsletterForm.tsx
import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire up to /api/subscribe if needed
    setStatus("success");
    setEmail("");
  };

  if (status === "success") {
    return <p className="text-green-400 font-medium text-sm">✓ Subscribed! Thanks for joining.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 w-full md:w-auto">
      <input
        type="email"
        placeholder="Enter your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="flex-1 md:w-72 px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
      />
      <button type="submit" className="btn-primary whitespace-nowrap text-sm py-3">
        Subscribe
      </button>
    </form>
  );
}
