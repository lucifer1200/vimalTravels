import { CheckCircle, Clock, Shield, FileText, MessageCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "Visa Agent in Bangalore — Schengen, USA, UK, UAE, Singapore | Vimal Travels",
  description:
    "Expert visa agent in Bangalore. Schengen, USA, UK, UAE, Singapore & 30+ countries. 99% success rate, IATA certified. Offices in Mathikere & New BEL Road. Call +91 98861 14440.",
  alternates: { canonical: "/services/visa-agent-bangalore" },
  openGraph: {
    title: "Visa Agent in Bangalore — Vimal Travels",
    description: "Schengen, USA, UK, UAE, Singapore visa assistance in Bangalore. 99% success rate. Two offices: Mathikere & New BEL Road.",
    url: "https://www.vimaltravels.in/services/visa-agent-bangalore",
  },
};

const visas = [
  { country: "Schengen (Europe)", countries: "France, Germany, Italy, Spain & 24 more", time: "10–15 working days", highlight: true },
  { country: "UAE / Dubai",       countries: "Tourist & Business",                        time: "2–3 working days",   highlight: false },
  { country: "USA",               countries: "B1/B2 Tourist & Business",                  time: "30–60 working days", highlight: false },
  { country: "UK",                countries: "Tourist & Business",                        time: "15–20 working days", highlight: false },
  { country: "Singapore",         countries: "Tourist & Business",                        time: "3–5 working days",   highlight: false },
  { country: "Thailand",          countries: "Tourist (On Arrival Guide)",                time: "Same day",           highlight: false },
  { country: "Malaysia",          countries: "eNTRI / eVISA",                             time: "Same day",           highlight: false },
  { country: "Vietnam",           countries: "Tourist & Business",                        time: "3–5 working days",   highlight: false },
  { country: "Sri Lanka",         countries: "ETA Online",                                time: "Same day",           highlight: false },
  { country: "Australia",         countries: "Tourist & Student",                         time: "10–15 working days", highlight: false },
  { country: "Canada",            countries: "Tourist & Business",                        time: "20–30 working days", highlight: false },
  { country: "China",             countries: "Tourist & Business",                        time: "7–10 working days",  highlight: false },
];

const steps = [
  { step: "01", title: "Free Consultation",    desc: "Tell us your destination and travel dates. We advise on visa type, requirements, and timeline." },
  { step: "02", title: "Document Checklist",   desc: "We give you a precise, updated checklist for your specific visa category and embassy." },
  { step: "03", title: "Document Review",      desc: "Bring your documents to either office. We check every paper for completeness and accuracy." },
  { step: "04", title: "Application Filing",   desc: "We prepare and submit the application on your behalf, tracking it until a decision is made." },
];

export default function VisaAgentBangalorePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[55vh] flex items-center pt-20 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600&q=85"
          alt="Visa agent in Bangalore — Vimal Travels"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <ScrollReveal direction="up">
            <div className="max-w-2xl">
              <p className="section-label text-blue-300 mb-3">Visa Assistance · Bengaluru</p>
              <h1 className="font-display text-4xl md:text-5xl text-white font-bold leading-tight">
                Visa Agent in Bangalore — Schengen, USA, UK &amp; 30+ Countries
              </h1>
              <p className="text-gray-200 mt-4 text-lg">IATA certified visa consultants serving Bengaluru since 2007. 99% visa success rate.</p>
              <div className="flex flex-wrap gap-3 mt-6">
                <Link href="/contact" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg text-sm transition-colors">
                  Get Visa Help →
                </Link>
                <a href="tel:+919886114440" className="border-2 border-white text-white hover:bg-white hover:text-blue-900 font-semibold px-6 py-3 rounded-lg text-sm transition-colors">
                  Call +91 98861 14440
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-blue-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[["99%", "Visa Success Rate"], ["30+", "Countries Covered"], ["19+", "Years Experience"], ["5000+", "Visas Processed"]].map(([val, label]) => (
              <div key={label}>
                <div className="font-display text-4xl font-bold text-white mb-1">{val}</div>
                <div className="text-blue-200 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visa list */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <p className="section-label mb-2">VISA SERVICES</p>
            <h2 className="font-display text-3xl font-bold text-slate-900 mb-2">Countries We Process Visas For</h2>
            <p className="text-gray-500 text-sm mb-8">Processing times are indicative. Actual time depends on embassy workload and your application type.</p>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visas.map((v, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 50}>
                <div className={`card p-4 flex items-center justify-between hover:border-blue-200 ${v.highlight ? "border-blue-400 bg-blue-50" : ""}`}>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">{v.country}</h3>
                    <p className="text-gray-400 text-xs mt-0.5">{v.countries}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <div className="text-xs text-blue-600 font-medium flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />{v.time}
                    </div>
                    <Link href="/contact" className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-1 block">
                      Enquire →
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <p className="text-center text-gray-500 text-sm mt-6">
            Don't see your country?{" "}
            <Link href="/contact" className="text-blue-600 hover:underline font-medium">Contact us</Link> — we process 30+ countries.
          </p>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <p className="section-label mb-2">HOW IT WORKS</p>
            <h2 className="font-display text-3xl font-bold text-slate-900 mb-8">Our Visa Application Process</h2>
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

      {/* Why Vimal */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <p className="section-label mb-2">WHY CHOOSE US</p>
            <h2 className="font-display text-3xl font-bold text-slate-900 mb-8">Why Bengalureans Trust Vimal Travels for Visa</h2>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Shield,      title: "IATA Certified Agency",         desc: "Officially certified travel agent with 19+ years of visa processing experience." },
              { icon: CheckCircle, title: "99% Visa Approval Rate",        desc: "We pre-check every document to eliminate rejections before submission." },
              { icon: FileText,    title: "Updated Embassy Requirements",  desc: "We track embassy policy changes daily so your application is always compliant." },
              { icon: Clock,       title: "Fast Processing Available",     desc: "Urgent visa processing for last-minute travel plans." },
              { icon: Shield,      title: "Rejection Case Support",        desc: "Visa rejected? We analyse, reapply and handle the appeal process." },
              { icon: CheckCircle, title: "Head Office + Branch in North Bangalore", desc: "Head Office in Mathikere (560054), Branch in New BEL Road (560094). No travel to South Bangalore." },
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
                <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">Need Visa Help? Talk to Our Experts</h2>
                <p className="text-blue-200 text-sm">Visit Mathikere or New BEL Road office. Mon–Sat 10:30 AM – 8:00 PM.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Link href="/contact" className="bg-white text-blue-900 hover:bg-blue-50 font-bold px-7 py-3 rounded-lg transition-colors text-center text-sm">
                  Get Free Consultation →
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
