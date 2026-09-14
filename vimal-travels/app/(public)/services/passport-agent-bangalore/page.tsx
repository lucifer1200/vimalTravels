import { BookOpen, Clock, CheckCircle, Shield, FileText, MessageCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "Passport Agent in Bangalore — Tatkal, Renewal & New Passport | Vimal Travels",
  description:
    "Reliable passport agent in Bangalore. New passport, Tatkal, renewal, minor passport. Full documentation help. Offices in Mathikere & New BEL Road, Bengaluru. Call +91 98861 14440.",
  alternates: { canonical: "/services/passport-agent-bangalore" },
  openGraph: {
    title: "Passport Agent in Bangalore — Vimal Travels",
    description: "New passport, Tatkal & renewal assistance in Bangalore. Two offices: Mathikere & New BEL Road. Call +91 98861 14440.",
    url: "https://www.vimaltravels.in/services/passport-agent-bangalore",
  },
};

const services = [
  {
    title: "New Passport Application",
    desc: "First-time passport? We handle form filling (eForm), document checklist, appointment booking at the Passport Seva Kendra (PSK), and accompany you through every step.",
    items: ["Aadhaar, PAN, birth certificate check", "eForm submission guidance", "PSK appointment booking", "Pre-submission document review"],
  },
  {
    title: "Passport Renewal",
    desc: "Renewing an expired or expiring passport? We streamline the entire process so you avoid delays and common mistakes.",
    items: ["10-year renewal (adults)", "Name/address change applications", "Damage or lost passport reapplication", "All document types accepted"],
  },
  {
    title: "Tatkal Passport",
    desc: "Travelling urgently? Tatkal service processes your passport in 1–3 working days at the PSK. We make sure your application qualifies and is error-free.",
    items: ["Emergency & urgent travel cases", "Higher success rate with expert preparation", "Supporting documents for Tatkal criteria", "Same-day appointment guidance"],
  },
  {
    title: "Minor Passport",
    desc: "Passport for children under 18. Additional documentation and both parents' consent required. We guide parents through the complete procedure.",
    items: ["Birth certificate verification", "School bonafide letter guidance", "Parents' consent & documents", "Both fresh & renewal applications"],
  },
];

const steps = [
  { step: "01", title: "Visit Either Office", desc: "Walk into our Mathikere or New BEL Road office. No prior appointment needed." },
  { step: "02", title: "Document Check",    desc: "We review all your original documents against the latest PSK requirements." },
  { step: "03", title: "eForm & Booking",   desc: "We fill your online eForm, pay the fee, and book your PSK appointment slot." },
  { step: "04", title: "PSK Visit",         desc: "You attend the PSK. We brief you fully so the biometrics visit is smooth." },
];

export default function PassportAgentBangalorePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[55vh] flex items-center pt-20 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=1600&q=85"
          alt="Passport agent in Bangalore — Vimal Travels"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <ScrollReveal direction="up">
            <div className="max-w-2xl">
              <p className="section-label text-blue-300 mb-3">Passport Services · Bengaluru</p>
              <h1 className="font-display text-4xl md:text-5xl text-white font-bold leading-tight">
                Passport Agent in Bangalore — Tatkal, Renewal &amp; New Passport
              </h1>
              <p className="text-gray-200 mt-4 text-lg">Complete passport assistance near you. Offices in Mathikere &amp; New BEL Road, Bengaluru.</p>
              <div className="flex flex-wrap gap-3 mt-6">
                <Link href="/contact" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg text-sm transition-colors">
                  Get Passport Help →
                </Link>
                <a href="tel:+919886114440" className="border-2 border-white text-white hover:bg-white hover:text-blue-900 font-semibold px-6 py-3 rounded-lg text-sm transition-colors">
                  Call +91 98861 14440
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-blue-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[["19+", "Years Experience"], ["1–3", "Days Tatkal"], ["100%", "Doc Accuracy Check"], ["2", "Offices Near You"]].map(([val, label]) => (
              <div key={label}>
                <div className="font-display text-4xl font-bold text-white mb-1">{val}</div>
                <div className="text-blue-200 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <p className="section-label mb-2">PASSPORT SERVICES</p>
            <h2 className="font-display text-3xl font-bold text-slate-900 mb-8">All Types of Passport Applications</h2>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 gap-5">
            {services.map((s, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 100}>
                <div className="card p-6 h-full border-t-4 border-blue-600">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-display text-base font-bold text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed mb-3">{s.desc}</p>
                  <ul className="space-y-1">
                    {s.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-xs text-gray-600">
                        <CheckCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <p className="section-label mb-2">HOW IT WORKS</p>
            <h2 className="font-display text-3xl font-bold text-slate-900 mb-8">Simple 4-Step Passport Process</h2>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 100}>
                <div className="card p-5 h-full">
                  <div className="text-blue-400 font-display font-bold text-2xl mb-2">{s.step}</div>
                  <h3 className="font-semibold text-slate-900 mb-2 text-sm">{s.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Documents needed */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <p className="section-label mb-2">REQUIRED DOCUMENTS</p>
            <h2 className="font-display text-3xl font-bold text-slate-900 mb-2">Basic Documents for New Passport (Adults)</h2>
            <p className="text-gray-500 text-sm mb-8">Requirements vary by application type. Our team will give you a precise checklist during your consultation.</p>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "Aadhaar Card (original + photocopy)",
              "PAN Card",
              "Birth Certificate or 10th Marksheet",
              "Address proof (Aadhaar / bank statement)",
              "2 passport-size photographs (white background)",
              "Completed eForm (online application)",
              "Fee payment receipt from PSP portal",
              "Existing passport (for renewals)",
            ].map((doc) => (
              <div key={doc} className="flex items-start gap-3 card p-4">
                <FileText className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">{doc}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-gray-500">
            <strong>Note:</strong> Tatkal and minor passport applications require additional documents.{" "}
            <Link href="/contact" className="text-blue-600 hover:underline font-medium">Contact us for the full checklist.</Link>
          </p>
        </div>
      </section>

      {/* Why Vimal */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <p className="section-label mb-2">WHY CHOOSE US</p>
            <h2 className="font-display text-3xl font-bold text-slate-900 mb-8">Bengaluru's Trusted Passport Consultants</h2>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Shield,      title: "19+ Years Experience",           desc: "Handling passport applications since 2007. We know every PSK requirement by heart." },
              { icon: CheckCircle, title: "Zero Rejection Policy",           desc: "We verify every document before submission to prevent delays and rejections." },
              { icon: Clock,       title: "Tatkal Available",               desc: "Urgent travel? We process Tatkal applications for fast-track passport delivery." },
              { icon: BookOpen,    title: "Updated PSK Requirements",       desc: "Ministry of External Affairs updates tracked daily. Your checklist is always current." },
              { icon: Shield,      title: "Two Offices in North Bangalore",  desc: "Conveniently located in Mathikere (560054) and New BEL Road (560094)." },
              { icon: CheckCircle, title: "End-to-End Service",             desc: "From form filling to PSK appointment — we handle it all. You just bring the documents." },
            ].map((item, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 80}>
                <div className="card p-5 flex gap-4 h-full">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm mb-1">{item.title}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="zoom">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">Need Passport Assistance in Bangalore?</h2>
                <p className="text-blue-200 text-sm">Visit us at Mathikere or New BEL Road. Mon–Sat 10:30 AM – 8:00 PM.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Link href="/contact" className="bg-white text-blue-900 hover:bg-blue-50 font-bold px-7 py-3 rounded-lg transition-colors text-center text-sm">
                  Book Consultation →
                </Link>
                <a href="https://wa.me/919886114440" className="border-2 border-white text-white hover:bg-white hover:text-blue-900 font-semibold px-7 py-3 rounded-lg transition-colors flex items-center gap-2 justify-center text-sm">
                  <MessageCircle className="w-4 h-4" /> WhatsApp Us
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
