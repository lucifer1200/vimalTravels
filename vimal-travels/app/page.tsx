// app/page.tsx
import Image from "next/image";
import Link from "next/link";
import { Award, Users, Calendar, CheckCircle, MapPin, Globe, FileText, BookOpen, Phone, MessageCircle, Star, Shield, Clock } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import TestimonialsSection from "@/components/TestimonialsSection";

const stats = [
  { icon: Calendar, value: "2007", label: "Established", sub: "Over a decade of service" },
  { icon: Award, value: "19+", label: "Years Experience", sub: "Industry leading expertise" },
  { icon: Users, value: "5000+", label: "Happy Families", sub: "Creating lasting memories" },
  { icon: Shield, value: "99%", label: "Visa Success Rate", sub: "Trusted processing" },
];

const services = [
  {
    icon: MapPin,
    title: "Holiday Packages",
    desc: "Curated domestic and international tours designed for luxury, adventure, and comfort.",
    href: "/packages",
  },
  {
    icon: FileText,
    title: "Visa Assistance",
    desc: "Professional documentation and filing for all types of visas with end-to-end guidance.",
    href: "/passport-visa",
  },
  {
    icon: BookOpen,
    title: "Passport Services",
    desc: "Hassle-free passport applications, renewals, and corrections with expert supervision.",
    href: "/passport-visa",
  },
];

const packages = [
  {
    title: "Kashmir Paradise",
    highlights: ["Shikara Ride on Dal Lake", "Gulmarg Gondola Access", "Luxury Houseboat Stay"],
    price: "₹17,999",
    duration: "6N / 7D",
    image: "https://images.unsplash.com/photo-1625047508494-c459c2a9d4a9?w=600&q=80",
    tag: "Top Rated",
  },
  {
    title: "Kerala",
    highlights: ["Munnar Tea Gardens", "Thekkady Wildlife", "Ayurvedic Spa Session"],
    price: "₹14,999",
    duration: "5N / 6D",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&q=80",
    tag: "Popular",
  },
  {
    title: "Bali Escape",
    highlights: ["Ubud Rice Terraces", "Tanah Lot Temple", "Kuta Beach Sunset"],
    price: "₹29,999",
    duration: "5N / 6D",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80",
    tag: "International",
  },
  {
    title: "Singapore Delight",
    highlights: ["Marina Bay Sands", "Sentosa Island", "Gardens by the Bay"],
    price: "₹42,999",
    duration: "4N / 5D",
    image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&q=80",
    tag: "Popular",
  },
];

const whyUs = [
  { label: "24/7 Travel Support", icon: Phone },
  { label: "Customized Itineraries", icon: MapPin },
  { label: "Best Price Guarantee", icon: Award },
  { label: "Verified Partners", icon: CheckCircle },
  { label: "Expert Consultants", icon: Users },
  { label: "Fast Visa Processing", icon: Clock },
];

export default function HomePage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center pt-20">
        <Image
          src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1600&q=85"
          alt="Kerala backwaters"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 hero-overlay" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-blue-600 rounded-full px-3 py-1 mb-6">
              <span className="text-white text-xs font-semibold uppercase tracking-wider">IATA Certified Travel Agency</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Your Trusted Travel Partner for Tours,{" "}
              <span className="text-blue-300">Visa &amp; Passport</span>
            </h1>
            <p className="text-gray-200 text-lg leading-relaxed mb-8 max-w-xl">
              Seamlessly navigating global borders since 2007. Whether it&apos;s a dream vacation or business travel, our experts handle every detail.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/packages" className="btn-primary px-8 py-3.5">Explore Packages</Link>
              <Link href="/contact" className="btn-outline px-8 py-3.5">Get Free Quote</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-blue-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 100}>
                <div>
                  <div className="font-display text-5xl md:text-6xl font-bold text-white mb-2">{s.value}</div>
                  <div className="text-blue-100 font-semibold text-sm">{s.label}</div>
                  <div className="text-blue-300 text-xs mt-1">{s.sub}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="mb-14">
              <p className="section-label mb-2">OUR EXPERTISE</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 max-w-xl leading-tight">
                Everything you need for a global journey
              </h2>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-6">
            {services.map((s, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 100}>
                <div className="card p-6 h-full">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                    <s.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{s.desc}</p>
                  <Link href={s.href} className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1">
                    Learn More →
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PACKAGES ── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="section-label mb-2">FEATURED TOURS</p>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900">Popular Travel Packages</h2>
                <p className="text-gray-500 mt-2 text-sm">Discover curated experiences for the modern explorer.</p>
              </div>
              <Link href="/packages" className="hidden md:inline-flex text-blue-600 hover:text-blue-700 font-medium text-sm items-center gap-1">
                View All →
              </Link>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {packages.map((pkg, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 80}>
                <div className="card overflow-hidden group">
                  <div className="relative h-44 overflow-hidden">
                    <Image src={pkg.image} alt={pkg.title} fill className="object-cover pkg-img" />
                    <div className="absolute top-3 left-3">
                      <span className="bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">{pkg.tag}</span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">{pkg.duration}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display font-bold text-slate-900 mb-2">{pkg.title}</h3>
                    <ul className="space-y-1 mb-3">
                      {pkg.highlights.map((h) => (
                        <li key={h} className="flex items-center gap-2 text-xs text-gray-600">
                          <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          {h}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <div>
                        <div className="text-xs text-gray-400">Starting from</div>
                        <div className="font-bold text-blue-600 text-lg">{pkg.price}</div>
                      </div>
                      <Link href="/contact" className="bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
                        Enquire Now
                      </Link>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <ScrollReveal direction="left">
              <div>
                <p className="section-label mb-3">WHY CHOOSE US</p>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mb-5 leading-tight">
                  Trusted by 5000+ Families Across India
                </h2>
                <p className="text-gray-500 leading-relaxed mb-8">
                  With 19+ years in the travel industry, Vimal Travels has built a reputation for reliability, expertise, and personalized service. We&apos;re not just booking agents — we&apos;re your travel partners.
                </p>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {whyUs.map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                        <item.icon className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{item.label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href="/contact" className="btn-primary">Plan My Trip</Link>
                  <a href="tel:+919886114440" className="btn-outline-blue">Call Us Now</a>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right">
              <div className="relative h-[460px] rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80"
                  alt="Happy travelers"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white rounded-xl p-4 shadow-lg flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                      <Star className="w-5 h-5 text-white fill-white" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">4.9/5 Rating on Google</div>
                      <div className="text-xs text-gray-500">Based on 500+ verified reviews</div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <TestimonialsSection />

      {/* ── CTA ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="zoom">
            <div className="bg-blue-900 rounded-2xl p-10 md:px-14 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">Ready to Plan Your Dream Vacation?</h2>
                <p className="text-blue-200 text-sm">Contact us today for a free consultation and personalized quote.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Link href="/contact" className="bg-white text-blue-900 hover:bg-blue-50 font-bold px-7 py-3 rounded-lg transition-colors text-center text-sm">
                  Enquire Now →
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

