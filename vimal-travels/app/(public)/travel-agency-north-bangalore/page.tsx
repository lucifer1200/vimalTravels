import { MapPin, Phone, Clock, Star, CheckCircle, MessageCircle } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "Travel Agency in Mathikere, New BEL Road & North Bangalore | Vimal Travels",
  description:
    "Vimal Travels — trusted travel agency in Mathikere, New BEL Road, RMV 2nd Stage, Hebbal, Yeshwanthpur & across North Bangalore. IATA certified, 19+ years. Visit us for tours, visa & passport.",
  alternates: { canonical: "/travel-agency-north-bangalore" },
  openGraph: {
    title: "Travel Agency in North Bangalore — Vimal Travels",
    description:
      "2 offices in North Bangalore: Mathikere (560054) & New BEL Road (560094). Tours, visa & passport. Call +91 98861 14440.",
    url: "https://www.vimaltravels.in/travel-agency-north-bangalore",
  },
};

const localAreas = [
  "Mathikere", "New BEL Road", "RMV 2nd Stage", "Hebbal", "Yeshwanthpur",
  "Rajajinagar", "Malleshwaram", "Nagarbhavi", "Sanjay Nagar", "MS Ramaiah Road",
  "Gokula Extension", "AGS Layout", "Jaladarsini Layout", "Sadashivanagar",
];

const services = [
  { title: "Tour Packages", desc: "Domestic & international trips customised for your budget and dates." },
  { title: "Visa Assistance", desc: "Schengen, USA, UAE, UK, Singapore & 30+ countries." },
  { title: "Passport Services", desc: "New passport, Tatkal, renewal — full documentation help." },
  { title: "Flight Booking", desc: "Best fares across all airlines with group booking discounts." },
  { title: "Hotel Booking", desc: "Budget to 5-star — we get you verified rates." },
  { title: "Honeymoon Packages", desc: "Romantic getaways crafted for couples." },
];

export default function LocalNorthBangalorePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-blue-900 pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <p className="section-label text-blue-300 mb-3">North Bangalore's Travel Experts</p>
            <h1 className="font-display text-4xl md:text-5xl text-white font-bold leading-tight max-w-3xl">
              Travel Agency in Mathikere, New BEL Road &amp; North Bangalore
            </h1>
            <p className="text-blue-200 mt-4 text-lg max-w-2xl">
              Two offices serving Mathikere, RMV 2nd Stage, Hebbal, Yeshwanthpur, Rajajinagar and the whole of North Bengaluru since 2007.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <a href="tel:+919886114440" className="bg-white text-blue-900 hover:bg-blue-50 font-bold px-6 py-3 rounded-lg text-sm transition-colors">
                Call +91 98861 14440
              </a>
              <a href="https://wa.me/919886114440" className="border-2 border-white text-white hover:bg-white hover:text-blue-900 font-semibold px-6 py-3 rounded-lg flex items-center gap-2 text-sm transition-colors">
                <MessageCircle className="w-4 h-4" /> WhatsApp Us
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Offices */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <p className="section-label mb-2">OUR OFFICES</p>
            <h2 className="font-display text-3xl font-bold text-slate-900 mb-8">Two Convenient Locations in North Bengaluru</h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                branch: "Head Office — Mathikere",
                address: "5, Vimal Shopping Complex, MS Ramaiah Rd, opp. Divya MSR Gateway, Gokula Extension, Mathikere, Bengaluru 560054",
                landmarks: "Near MS Ramaiah Hospital, MS Ramaiah Institute of Technology",
                phone: "+91 98861 14440",
                mapUrl: "https://maps.google.com/?q=Vimal+Travels+Mathikere+Bangalore",
              },
              {
                branch: "Branch — New BEL Road",
                address: "1st Floor, 17, New BEL Rd, opp. to Printo, next to Bata showroom, AGS Layout, R.M.V. 2nd Stage, Bengaluru 560094",
                landmarks: "Near BEL Circle, RMV 2nd Stage, close to Hebbal flyover",
                phone: "+91 98456 79729",
                mapUrl: "https://maps.google.com/?q=Vimal+Travels+New+BEL+Road+Bangalore",
              },
            ].map((o, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 100}>
                <div className="card p-6 h-full">
                  <h3 className="font-display text-lg font-bold text-blue-700 mb-3">{o.branch}</h3>
                  <div className="flex gap-3 mb-3">
                    <MapPin className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-gray-600 text-sm">{o.address}</p>
                  </div>
                  <div className="flex gap-3 mb-3">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <p className="text-gray-500 text-xs">{o.landmarks}</p>
                  </div>
                  <div className="flex gap-3 mb-4">
                    <Phone className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <a href={`tel:${o.phone.replace(/\s/g, "")}`} className="text-blue-600 font-medium text-sm hover:underline">{o.phone}</a>
                  </div>
                  <a href={o.mapUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline font-medium">
                    Get Directions on Google Maps →
                  </a>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <div className="mt-4 card p-4 flex items-center gap-3 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-blue-500 shrink-0" />
            <span><strong>Business Hours:</strong> Monday to Saturday, 10:30 AM – 8:00 PM (Both offices)</span>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <p className="section-label mb-2">WHAT WE OFFER</p>
            <h2 className="font-display text-3xl font-bold text-slate-900 mb-8">Travel Services at Our North Bangalore Offices</h2>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 80}>
                <div className="card p-5 h-full">
                  <h3 className="font-semibold text-slate-900 mb-1 text-sm">{s.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <p className="section-label mb-2">WHY CHOOSE VIMAL TRAVELS</p>
            <h2 className="font-display text-3xl font-bold text-slate-900 mb-6">North Bangalore's Most Trusted Travel Agency</h2>
            <p className="text-gray-500 max-w-3xl mb-10 leading-relaxed">
              Residents of Mathikere, New BEL Road, RMV 2nd Stage, Hebbal, Yeshwanthpur, Rajajinagar, Malleshwaram and surrounding areas have trusted Vimal Travels for 19+ years. We are an IATA certified agency with 4.9★ Google rating and over 5,000 satisfied families.
            </p>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { stat: "19+", label: "Years in North Bangalore" },
              { stat: "5000+", label: "Happy Families" },
              { stat: "4.9★", label: "Google Rating" },
              { stat: "2", label: "Offices Near You" },
            ].map((s, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 80}>
                <div className="card p-6 text-center">
                  <div className="font-display text-3xl font-bold text-blue-600 mb-1">{s.stat}</div>
                  <div className="text-gray-600 text-sm">{s.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Local Areas */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <p className="section-label mb-2">AREAS WE SERVE</p>
            <h2 className="font-display text-3xl font-bold text-slate-900 mb-6">Serving All Areas Across North Bengaluru</h2>
            <p className="text-gray-500 mb-8 text-sm leading-relaxed max-w-2xl">
              Our two offices in Mathikere and New BEL Road are easily accessible from all parts of North Bengaluru. Whether you live in Hebbal, Yeshwanthpur, Rajajinagar or Nagarbhavi — you're never far from us.
            </p>
          </ScrollReveal>
          <div className="flex flex-wrap gap-2">
            {localAreas.map((area) => (
              <span key={area} className="bg-white border border-blue-100 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">
                {area}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews teaser */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <p className="section-label mb-2">CUSTOMER REVIEWS</p>
            <h2 className="font-display text-3xl font-bold text-slate-900 mb-8">What Our Neighbours Say</h2>
          </ScrollReveal>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { name: "Suresh K.", area: "Mathikere", text: "Been using Vimal Travels for 8 years for all my family trips. Right around the corner from my home. Always reliable, transparent pricing." },
              { name: "Priya R.", area: "RMV 2nd Stage", text: "Got my Schengen visa done here — smooth process, zero stress. The New BEL Road branch is very convenient. Highly recommend." },
              { name: "Rahul M.", area: "Hebbal", text: "Booked our Bali honeymoon package. Best rates I found anywhere. The team is so knowledgeable and patient. Will come back for our next trip." },
            ].map((r, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 100}>
                <div className="card p-5">
                  <div className="flex gap-0.5 mb-2">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">"{r.text}"</p>
                  <div className="text-slate-900 font-semibold text-sm">{r.name}</div>
                  <div className="text-gray-400 text-xs">{r.area}, Bengaluru</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-900 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal direction="zoom">
            <h2 className="font-display text-3xl font-bold text-white mb-3">Visit Us at Either Office Today</h2>
            <p className="text-blue-200 mb-8 text-sm">Mon–Sat: 10:30 AM – 8:00 PM · Mathikere (560054) · New BEL Road (560094)</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/contact" className="bg-white text-blue-900 hover:bg-blue-50 font-bold px-7 py-3 rounded-lg transition-colors text-sm">
                Plan My Trip →
              </Link>
              <a href="tel:+919886114440" className="border-2 border-white text-white hover:bg-white hover:text-blue-900 font-semibold px-7 py-3 rounded-lg transition-colors text-sm">
                Call Now
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
