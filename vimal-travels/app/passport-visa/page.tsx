// app/passport-visa/page.tsx
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, BookOpen, Clock, Shield, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "Passport & Visa Services — Vimal Travels",
  description: "Expert passport and visa assistance in Bengaluru. New applications, renewals, Tatkal and all visa types.",
};

const passportServices = [
  { title: "New Passport Application", desc: "First-time passport? We help with form filling, document checklist, and appointment booking at the PSK." },
  { title: "Passport Renewal",         desc: "Renew your expired or expiring passport with our hassle-free process. We handle all the paperwork." },
  { title: "Tatkal Passport",          desc: "Need your passport urgently? We assist with Tatkal applications for fast-track processing." },
  { title: "Minor Passport",           desc: "Passport for children under 18. We guide parents through the specific documentation needed." },
];

const visaCountries = [
  { country: "Gulf / Middle East", type: "Tourist & Business",        time: "2–3 working days" },
  { country: "Thailand",           type: "Tourist (On Arrival Guide)", time: "Same day" },
  { country: "Singapore",          type: "Tourist & Business",        time: "3–5 working days" },
  { country: "Malaysia",           type: "eNTRI / eVISA",             time: "1–2 working days" },
  { country: "Vietnam",            type: "Tourist & Business",        time: "2–3 working days" },
  { country: "Maldives",           type: "On Arrival (Free)",         time: "Guidance only" },
  { country: "Sri Lanka",          type: "ETA Online",                time: "1–2 working days" },
  { country: "UK",                 type: "Tourist & Business",        time: "15–20 working days" },
  { country: "USA",                type: "B1/B2 Tourist",             time: "30–60 working days" },
  { country: "Schengen",           type: "Multiple countries",        time: "15–20 working days" },
  { country: "Australia",          type: "Tourist & Student",         time: "10–15 working days" },
  { country: "South Africa",       type: "Tourist & Business",        time: "5–7 working days" },
];

export default function PassportVisaPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[55vh] flex items-center pt-20 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1600&q=85"
          alt="Passport and visa hero"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <ScrollReveal direction="up">
            <div className="max-w-2xl">
              <p className="section-label text-blue-300 mb-3">Documentation</p>
              <h1 className="font-display text-4xl md:text-5xl text-white font-bold leading-tight">
                Passport &amp; Visa Services
              </h1>
              <p className="text-gray-200 mt-4 text-lg">Expert assistance for all your travel documentation needs. We simplify the process so you focus on packing.</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Why choose us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="text-center mb-10">
              <p className="section-label mb-2">WHY CHOOSE US</p>
              <h2 className="font-display text-3xl font-bold text-slate-900">Trusted Documentation Experts</h2>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: CheckCircle, title: "19+ Years Experience",  desc: "Handling passports & visas since 2007" },
              { icon: Clock,       title: "Fast Processing",       desc: "Tatkal passports & express visas available" },
              { icon: Shield,      title: "100% Document Check",   desc: "We verify every document before submission" },
              { icon: BookOpen,    title: "End-to-End Support",    desc: "From forms to final stamp, we're with you" },
            ].map((item, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 100}>
                <div className="card p-6 text-center h-full">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <item.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1 text-sm">{item.title}</h3>
                  <p className="text-gray-500 text-xs">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Passport services */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="mb-10">
              <p className="section-label mb-2">DOCUMENTS</p>
              <h2 className="font-display text-3xl font-bold text-slate-900">Passport Services</h2>
              <p className="text-gray-500 mt-2 text-sm">We assist with every type of passport application from start to finish.</p>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {passportServices.map((s, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 100}>
                <div className="card p-5 h-full border-t-4 border-blue-600">
                  <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2 text-sm">{s.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Visa countries */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="mb-10">
              <p className="section-label mb-2">INTERNATIONAL</p>
              <h2 className="font-display text-3xl font-bold text-slate-900">Visa Processing</h2>
              <p className="text-gray-500 mt-2 text-sm">We process visas for 30+ countries. Here are our most popular destinations:</p>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visaCountries.map((v, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 50}>
                <div className="card p-4 flex items-center justify-between hover:border-blue-200">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">{v.country}</h3>
                    <p className="text-gray-400 text-xs mt-0.5">{v.type}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <div className="text-xs text-blue-600 font-medium flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />
                      {v.time}
                    </div>
                    <Link href="/contact" className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-1 block">
                      Enquire →
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <p className="text-center text-gray-500 text-sm mt-8">
            Don&apos;t see your country?{" "}
            <Link href="/contact" className="text-blue-600 hover:underline font-medium">Contact us</Link>
            {" "}— we process 30+ countries.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="zoom">
            <div className="bg-blue-900 rounded-2xl p-10 md:px-14 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">Need Passport or Visa Help?</h2>
                <p className="text-blue-200 text-sm">Call us or visit our Bengaluru office. We&apos;re open Mon–Sat 10:30 AM – 8:00 PM.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Link href="/contact" className="bg-white text-blue-900 hover:bg-blue-50 font-bold px-7 py-3 rounded-lg transition-colors text-center text-sm">
                  Get Started →
                </Link>
                <a href="tel:+919886114440" className="border-2 border-white text-white hover:bg-white hover:text-blue-900 font-semibold px-7 py-3 rounded-lg transition-colors flex items-center gap-2 justify-center text-sm">
                  Call Now
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
