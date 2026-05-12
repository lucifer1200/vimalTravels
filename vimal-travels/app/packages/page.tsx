// app/packages/page.tsx
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, MessageCircle, Info } from "lucide-react";
import type { Metadata } from "next";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "Tour Packages — Vimal Travels",
  description: "Browse our domestic and international tour packages with best prices.",
};

const domesticPackages = [
  { title: "Kashmir Paradise",   duration: "6N / 7D", price: "₹17,999", highlights: ["Dal Lake Shikara Ride", "Gulmarg Snow & Gondola", "Pahalgam Valley", "Sonamarg Glacier"],          image: "https://images.unsplash.com/photo-1568454537842-d933259bb258?w=800&q=85",   tag: "Most Popular" },
  { title: "Kerala Backwaters",  duration: "5N / 6D", price: "₹14,999", highlights: ["Alleppey Houseboat Stay", "Munnar Tea Hills", "Ayurvedic Spa", "Cochin Heritage Walk"],             image: "https://images.unsplash.com/photo-1593693411515-c20261bcad6e?w=800&q=85",  tag: "Family Favourite" },
  { title: "Goa Beach Escape",   duration: "3N / 4D", price: "₹12,999", highlights: ["North & South Goa Beaches", "Beach Shacks & Nightlife", "Water Sports", "Old Goa Churches"],        image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=85",   tag: "Weekend Getaway" },
  { title: "Rajasthan Royal",    duration: "5N / 6D", price: "₹19,999", highlights: ["Jaipur Pink City", "Amber Fort Tour", "Udaipur Pichola Lake", "Heritage Palace Walk"],              image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=85",   tag: "Heritage Tour" },
  { title: "Andaman Islands",    duration: "5N / 6D", price: "₹21,499", highlights: ["Radhanagar Beach", "Scuba Diving & Snorkeling", "Neil Island", "Glass Bottom Boat"],               image: "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=800&q=85",   tag: "Beach Paradise" },
  { title: "Himachal Adventure", duration: "6N / 7D", price: "₹22,999", highlights: ["Manali Snowfields", "Rohtang Pass", "Shimla Mall Road", "Solang Valley"],                          image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=85",   tag: "Adventure" },
];

const internationalPackages = [
  { title: "Vietnam Explorer",    duration: "5N / 6D", price: "₹47,999",  highlights: ["Ha Long Bay Cruise", "Hoi An Old Town", "Hanoi Street Food", "Cu Chi Tunnels"],              image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=85",  tag: "New Destination" },
  { title: "Singapore Delight",   duration: "4N / 5D", price: "₹42,999",  highlights: ["Marina Bay Sands", "Sentosa Island", "Gardens by the Bay", "Universal Studios"],             image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=85",  tag: "Most Booked" },
  { title: "Bali Escape",         duration: "5N / 6D", price: "₹29,999",  highlights: ["Ubud Rice Terraces", "Tanah Lot Temple", "Kuta Beach Sunset", "Monkey Forest"],              image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=85",  tag: "Honeymoon Special" },
  { title: "Thailand Adventure",  duration: "5N / 6D", price: "₹26,999",  highlights: ["Bangkok Temples", "Pattaya Beach", "Floating Markets", "Coral Island"],                      image: "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=800&q=85",  tag: "Group Favourite" },
  { title: "Malaysia Explorer",   duration: "5N / 6D", price: "₹14,999",  highlights: ["Petronas Towers", "Langkawi Island", "Genting Highlands", "Batu Caves"],                     image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=85",  tag: "Budget Friendly" },
  { title: "Philippines",         duration: "5N / 6D", price: "₹35,999",  highlights: ["Palawan Island", "El Nido Beach", "Boracay White Sand", "Island Hopping"],                   image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&q=85",  tag: "Paradise" },
  { title: "Dubai Experience",    duration: "4N / 5D", price: "₹52,999",  highlights: ["Burj Khalifa Visit", "Desert Safari", "Dubai Mall & Fountain", "Dhow Cruise"],               image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=85",  tag: "Luxury" },
  { title: "Europe Tour",         duration: "9N / 10D", price: "₹1,74,999", highlights: ["Paris Eiffel Tower", "Switzerland Alps", "Rome Colosseum", "Amsterdam Canals"],            image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=85",  tag: "Dream Trip" },
];

function PackageCard({ p, i }: { p: typeof domesticPackages[0]; i: number }) {
  return (
    <ScrollReveal direction="up" delay={i * 80}>
      <div className="card overflow-hidden group h-full flex flex-col">
        <div className="relative h-52 overflow-hidden shrink-0">
          <Image src={p.image} alt={p.title} fill className="object-cover pkg-img" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute top-3 left-3">
            <span className="bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">{p.tag}</span>
          </div>
          <div className="absolute top-3 right-3">
            <span className="bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">{p.duration}</span>
          </div>
          <div className="absolute bottom-3 left-4">
            <h3 className="font-display font-bold text-white text-lg drop-shadow">{p.title}</h3>
          </div>
        </div>
        <div className="p-4 flex flex-col flex-1">
          <ul className="space-y-1.5 mb-4 flex-1">
            {p.highlights.map((h) => (
              <li key={h} className="flex items-center gap-2 text-xs text-gray-600">
                <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                {h}
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div>
              <div className="text-xs text-gray-400">Starting from*</div>
              <div className="font-bold text-blue-600 text-xl">{p.price}</div>
            </div>
            <Link href="/contact" className="bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
              Enquire →
            </Link>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}

function Disclaimer() {
  return (
    <div className="flex items-start gap-2 mt-8 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
      <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
      <p className="text-xs text-blue-700">
        <span className="font-semibold">* Price Disclaimer:</span> All prices are indicative and per person on twin sharing basis. Rates may vary based on travel dates, availability, airline fares, and seasonal demand. Final pricing will be confirmed at the time of booking. Contact us for the latest rates.
      </p>
    </div>
  );
}

export default function PackagesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[55vh] flex items-center pt-20 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=85"
          alt="Packages hero"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <ScrollReveal direction="up">
            <div className="max-w-2xl">
              <p className="section-label text-blue-300 mb-3">Explore</p>
              <h1 className="font-display text-4xl md:text-5xl text-white font-bold leading-tight">Tour Packages</h1>
              <p className="text-gray-200 mt-4 text-lg">Handpicked experiences for every traveler and every budget.</p>
              <div className="flex gap-8 mt-8">
                {[["6+", "Domestic Destinations"], ["8+", "International Destinations"], ["19+", "Years of Expertise"]].map(([val, label]) => (
                  <div key={label}>
                    <div className="font-display text-3xl font-bold text-blue-300">{val}</div>
                    <div className="text-gray-300 text-xs mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Domestic */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="flex items-center justify-between mb-10">
              <div>
                <p className="section-label mb-1">Explore India</p>
                <h2 className="font-display text-3xl font-bold text-slate-900">Domestic Packages</h2>
              </div>
              <span className="hidden md:flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-semibold px-4 py-2 rounded-full border border-blue-100">
                🇮🇳 {domesticPackages.length} Destinations
              </span>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {domesticPackages.map((p, i) => <PackageCard key={i} p={p} i={i} />)}
          </div>
          <Disclaimer />
        </div>
      </section>

      {/* International */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="flex items-center justify-between mb-10">
              <div>
                <p className="section-label mb-1">Explore the World</p>
                <h2 className="font-display text-3xl font-bold text-slate-900">International Packages</h2>
              </div>
              <span className="hidden md:flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-semibold px-4 py-2 rounded-full border border-blue-100">
                🌍 {internationalPackages.length} Destinations
              </span>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {internationalPackages.map((p, i) => <PackageCard key={i} p={p} i={i} />)}
          </div>
          <Disclaimer />
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="zoom">
            <div className="bg-blue-900 rounded-2xl p-10 md:px-14 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">Don't See What You Want?</h2>
                <p className="text-blue-200 text-sm">We create fully custom itineraries for any destination, any budget!</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Link href="/contact" className="bg-white text-blue-900 hover:bg-blue-50 font-bold px-7 py-3 rounded-lg transition-colors text-center text-sm">
                  Get a Custom Quote →
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
