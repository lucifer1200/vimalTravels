// app/services/page.tsx
import { MapPin, Globe, Ticket, Hotel, BookOpen, FileText, Users, Compass, Heart, GraduationCap, Ship, Shield, Car, Banknote, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "Our Services — Vimal Travels",
  description: "Domestic & international tours, visa processing, passport assistance, flight & hotel booking, cruise, travel insurance, car rentals and more.",
};

const services = [
  { icon: MapPin,        title: "Domestic Tours",         desc: "Explore the incredible diversity of India with expertly crafted domestic packages. From snow-capped Himalayas to tropical beaches of Goa.", highlights: ["Kashmir, Himachal, Uttarakhand", "Kerala, Goa, Andaman", "Rajasthan, Gujarat heritage tours", "Group & family packages"] },
  { icon: Globe,         title: "International Tours",    desc: "Discover the world with premium international tour packages. We handle flights, hotels, sightseeing, and transfers end-to-end.", highlights: ["Southeast Asia (Thailand, Bali, Singapore)", "Middle East & Gulf", "Europe & UK", "Maldives & Mauritius"] },
  { icon: Ticket,        title: "Flight Booking",         desc: "Get the best airfare deals across all major domestic and international airlines. We compare prices for the most cost-effective routes.", highlights: ["All domestic airlines", "All major international carriers", "Connecting & multi-city flights", "Group bookings at special rates"] },
  { icon: Hotel,         title: "Hotel Booking",          desc: "From budget-friendly stays to 5-star luxury resorts, we find perfect accommodation that fits your needs and budget.", highlights: ["Budget to luxury properties", "Resort & villa bookings", "Verified & reviewed properties", "Best price guarantee"] },
  { icon: BookOpen,      title: "Passport Services",      desc: "Complete assistance for new passport applications, renewals, and Tatkal services. We guide you through every step.", highlights: ["New passport applications", "Passport renewals", "Tatkal (urgent) processing", "Document verification"] },
  { icon: FileText,      title: "Visa Processing",        desc: "Hassle-free visa processing for tourist, business, student, and transit visas for 30+ countries worldwide.", highlights: ["Tourist & business visas", "On-arrival visa guidance", "Visa documentation help", "Rejection case support"] },
  { icon: Heart,         title: "Honeymoon Packages",     desc: "Make your special journey unforgettable with curated honeymoon packages to the most romantic destinations.", highlights: ["Maldives, Bali, Paris", "Customized itineraries", "Romantic surprises arranged", "Private dining & spa"] },
  { icon: Users,         title: "Group Tours",            desc: "Organise corporate outings, family reunions, or pilgrimages with affordable group tour packages.", highlights: ["Corporate team outings", "Family & friends groups", "Pilgrimage tours", "Special group rates"] },
  { icon: GraduationCap, title: "Student Group Tours",    desc: "Educational and recreational trips tailored for schools, colleges, and student groups. Safe, budget-friendly, and memorable.", highlights: ["School & college tours", "Educational site visits", "Dedicated group coordinators", "Budget-friendly packages"] },
  { icon: Ship,          title: "Cruise Booking",         desc: "Sail the world in style with our cruise booking service. Find the perfect cruise across top global routes.", highlights: ["Indian Ocean & Asian cruises", "Mediterranean & European routes", "Family & luxury cruises", "All major cruise lines"] },
  { icon: Shield,        title: "Travel Insurance",       desc: "Travel worry-free with comprehensive insurance covering medical emergencies, trip cancellations, and baggage loss.", highlights: ["Medical & emergency cover", "Trip cancellation protection", "Baggage & document loss", "Single & multi-trip plans"] },
  { icon: Car,           title: "Car Rentals",            desc: "Comfortable and affordable car rental services for airport transfers, sightseeing, and outstation travel.", highlights: ["Airport pick-up & drop", "Outstation cab services", "AC & non-AC vehicles", "Driver-guided tours"] },
  { icon: Banknote,      title: "Foreign Exchange",       desc: "Get the best rates for foreign currency exchange for your international travel needs.", highlights: ["Competitive exchange rates", "All major currencies", "Travel cards available", "Quick & hassle-free process"] },
  { icon: Compass,       title: "Custom Travel Packages", desc: "Have a specific destination in mind? Tell us your requirements and we'll craft a fully personalized travel itinerary.", highlights: ["Fully custom itineraries", "Budget-based planning", "Private guided tours", "24/7 trip support"] },
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[55vh] flex items-center pt-20 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=85"
          alt="Services hero"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <ScrollReveal direction="up">
            <div className="max-w-2xl">
              <p className="section-label text-blue-300 mb-3">What We Offer</p>
              <h1 className="font-display text-4xl md:text-5xl text-white font-bold leading-tight">
                Comprehensive Travel Services
              </h1>
              <p className="text-gray-200 mt-4 text-lg">One-stop solution for all your travel needs — tours, visas, passports and beyond.</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-blue-900 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[["14+", "Services Offered", "All your travel needs covered"], ["30+", "Countries", "Visas processed worldwide"], ["5000+", "Happy Customers", "Trusted by families"], ["19+", "Years Experience", "Since 2007"]].map(([val, label, sub]) => (
              <div key={label}>
                <div className="font-display text-5xl md:text-6xl font-bold text-white mb-2">{val}</div>
                <div className="text-blue-100 font-semibold text-sm">{label}</div>
                <div className="text-blue-300 text-xs mt-1">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="mb-12">
              <p className="section-label mb-2">ALL SERVICES</p>
              <h2 className="font-display text-3xl font-bold text-slate-900">Everything We Offer</h2>
              <p className="text-gray-500 mt-2 text-sm">From your first enquiry to your final destination — we handle it all.</p>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 50}>
                <div className="card p-5 h-full">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
                    <s.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-display text-base font-bold text-slate-900 mb-1.5">{s.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed mb-3">{s.desc}</p>
                  <ul className="space-y-1">
                    {s.highlights.map((h) => (
                      <li key={h} className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="zoom">
            <div className="bg-blue-900 rounded-2xl p-10 md:px-14 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">Ready to Plan Your Trip?</h2>
                <p className="text-blue-200 text-sm">Contact us today for a free consultation and customized quote.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Link href="/contact" className="bg-white text-blue-900 hover:bg-blue-50 font-bold px-7 py-3 rounded-lg transition-colors text-center text-sm">
                  Get a Free Quote →
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
