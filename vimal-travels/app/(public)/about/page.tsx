// app/about/page.tsx
import { Award, Users, Clock, Shield, Star, CheckCircle, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "About Us — Vimal Travels",
  description: "Bengaluru's trusted travel agency since 2007. Learn about our story, team, and commitment to travelers.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[55vh] flex items-center pt-20 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=1600&q=85"
          alt="About us hero"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <ScrollReveal direction="up">
            <div className="max-w-2xl">
              <p className="section-label text-blue-300 mb-3">Our Story</p>
              <h1 className="font-display text-4xl md:text-5xl text-white font-bold leading-tight">About Vimal Travels</h1>
              <p className="text-gray-200 mt-4 text-lg">Bengaluru's trusted travel partner since 2007, helping thousands of families explore the world.</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <ScrollReveal direction="left">
              <div>
                <p className="section-label mb-2">WHO WE ARE</p>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mb-5 leading-tight">Your Journey, Our Passion</h2>
                <p className="text-gray-500 leading-relaxed mb-4">
                  Founded in 2007 in the heart of Bengaluru, Vimal Travels was born from a simple belief — that every person deserves to experience the world without stress. What started as a small travel consultancy has grown into one of Bengaluru's most trusted travel agencies.
                </p>
                <p className="text-gray-500 leading-relaxed mb-4">
                  Over the past 19+ years, we've helped thousands of families, couples, and solo travelers plan their dream vacations. From Himalayan adventures to Maldives getaways, from Schengen visas to Tatkal passports — we've done it all.
                </p>
                <p className="text-gray-500 leading-relaxed mb-6">
                  Our team of experienced travel consultants is dedicated to personalized service, competitive pricing, and round-the-clock support to ensure every journey is memorable.
                </p>
                <div className="flex flex-wrap gap-3">
                  {["IATA Certified", "19+ Years Experience", "5000+ Happy Families", "4.9★ Google Rating"].map((b) => (
                    <span key={b} className="flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Award,  value: "19+",   label: "Years Experience" },
                  { icon: Users,  value: "5000+", label: "Happy Travelers" },
                  { icon: Clock,  value: "2007",  label: "Established" },
                  { icon: Star,   value: "4.9★",  label: "Google Rating" },
                ].map((s, i) => (
                  <div key={i} className="card p-6 text-center">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <s.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="font-display text-2xl font-bold text-slate-900">{s.value}</div>
                    <div className="text-gray-500 text-sm">{s.label}</div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="text-center mb-12">
              <p className="section-label mb-2">OUR VALUES</p>
              <h2 className="font-display text-3xl font-bold text-slate-900">What We Stand For</h2>
              <p className="text-gray-500 mt-2 text-sm">The principles that guide every trip we plan.</p>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Shield, title: "Transparency",    desc: "No hidden costs. No surprises. What you see is what you pay." },
              { icon: Users,  title: "Personalization", desc: "Every trip is tailored to your unique preferences and budget." },
              { icon: Clock,  title: "Reliability",     desc: "19+ years of on-time deliveries and satisfied customers." },
              { icon: Award,  title: "Excellence",      desc: "We go above and beyond to make every journey extraordinary." },
            ].map((v, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 100}>
                <div className="card p-6 text-center h-full">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <v.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{v.title}</h3>
                  <p className="text-gray-500 text-sm">{v.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Image + text */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <ScrollReveal direction="left">
              <div className="relative h-[380px] rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&q=80"
                  alt="Travel experience"
                  fill
                  className="object-cover"
                />
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right">
              <div>
                <p className="section-label mb-2">OUR PROMISE</p>
                <h2 className="font-display text-3xl font-bold text-slate-900 mb-5 leading-tight">We're More Than a Travel Agency</h2>
                <p className="text-gray-500 leading-relaxed mb-6">
                  At Vimal Travels, we believe travel is not just about visiting places — it's about creating memories that last a lifetime. Every package we curate, every visa we process, every passport we assist with is done with the utmost care and attention to detail.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Dedicated travel consultant assigned to every booking",
                    "24/7 support during your trip — we're always reachable",
                    "Transparent pricing with no hidden charges",
                    "Strong partnerships with 100+ hotels & airlines worldwide",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/contact" className="btn-primary">Talk to Our Team →</Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="zoom">
            <div className="bg-blue-900 rounded-2xl p-10 md:px-14 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">Ready to Travel With Us?</h2>
                <p className="text-blue-200 text-sm">Join thousands of happy travelers. Let us plan your next adventure.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Link href="/contact" className="bg-white text-blue-900 hover:bg-blue-50 font-bold px-7 py-3 rounded-lg transition-colors text-center text-sm">
                  Plan My Trip →
                </Link>
                <a href="https://wa.me/919886114440" className="border-2 border-white text-white hover:bg-white hover:text-blue-900 font-semibold px-7 py-3 rounded-lg transition-colors flex items-center gap-2 justify-center text-sm">
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp Us
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
