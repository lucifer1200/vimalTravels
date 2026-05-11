// components/Footer.tsx
import Link from "next/link";
import { Plane, MapPin, Phone, Mail, Facebook, Instagram, Youtube, Twitter } from "lucide-react";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Tour Packages", href: "/packages" },
  { label: "Passport & Visa", href: "/passport-visa" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

const services = [
  "Domestic Tour Packages",
  "International Tour Packages",
  "Flight Ticket Booking",
  "Hotel Booking",
  "Passport Assistance",
  "Visa Processing",
  "Honeymoon Packages",
  "Group Tours",
  "Cruise Booking",
  "Travel Insurance",
  "Car Rentals",
  "Foreign Exchange",
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <Link href="/" className="flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Plane className="w-5 h-5 text-white -rotate-45" />
            </div>
            <span className="font-display text-xl font-bold text-white">Vimal Travels</span>
          </Link>
          <p className="text-gray-400 text-sm leading-relaxed mb-5">
            Your trusted travel partner in Bengaluru. We specialize in domestic & international tours, visa processing, and passport assistance since 2007.
          </p>
          <div className="flex gap-3">
            {[Facebook, Instagram, Youtube, Twitter].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-blue-400 font-semibold text-xs uppercase tracking-widest mb-4">Quick Links</h4>
          <ul className="space-y-2">
            {quickLinks.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="text-gray-400 hover:text-blue-400 text-sm transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div>
          <h4 className="text-blue-400 font-semibold text-xs uppercase tracking-widest mb-4">Our Services</h4>
          <ul className="space-y-2">
            {services.map((s) => (
              <li key={s}>
                <Link href="/services" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">
                  {s}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-blue-400 font-semibold text-xs uppercase tracking-widest mb-4">Contact Us</h4>
          <ul className="space-y-4">
            <li className="flex gap-3 text-sm text-gray-400">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              5, Vimal Shopping Complex, MS Ramaiah Rd, opp. divya msr gateway, Gokula Extension, Mathikere, Bengaluru, Karnataka 560054
            </li>
            <li>
              <a href="tel:+919886114440" className="flex gap-3 text-sm text-gray-400 hover:text-blue-400 transition-colors">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                +91 98861 14440
              </a>
            </li>
            <li>
              <a href="mailto:vimaltrls@gmail.com" className="flex gap-3 text-sm text-gray-400 hover:text-blue-400 transition-colors">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                vimaltrls@gmail.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-gray-500">
          <p>© 2007–2025 Vimal Travels. All rights reserved.</p>
          <p>Bengaluru, Karnataka, India</p>
        </div>
      </div>
    </footer>
  );
}

