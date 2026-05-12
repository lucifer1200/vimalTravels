"use client";
// components/Navbar.tsx
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, Plane } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/packages", label: "Packages" },
  { href: "/passport-visa", label: "Passport & Visa" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white border-b border-gray-100 ${
        scrolled ? "shadow-md py-2" : "py-3"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-blue-700 transition-colors">
            <Plane className="w-5 h-5 text-white -rotate-45" />
          </div>
          <span className="font-display text-xl font-bold text-slate-900">
            Vimal <span className="text-blue-600">Travels</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors relative group ${
                isActive(l.href)
                  ? "text-blue-600"
                  : "text-slate-600 hover:text-blue-600"
              }`}
            >
              {l.label}
              <span
                className={`absolute -bottom-1 left-0 h-0.5 bg-blue-600 transition-all duration-200 ${
                  isActive(l.href) ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex flex-col items-end text-xs text-slate-600">
            <a href="tel:+919886114440" className="flex items-center gap-1 font-medium hover:text-blue-600 transition-colors">
              <Phone className="w-3.5 h-3.5" />
              +91 98861 14440
            </a>
            <a href="tel:+919845679729" className="flex items-center gap-1 font-medium hover:text-blue-600 transition-colors">
              <Phone className="w-3.5 h-3.5" />
              +91 98456 79729
            </a>
          </div>
          <Link href="/contact" className="bg-slate-900 hover:bg-blue-600 text-white font-semibold text-sm py-2.5 px-5 rounded-lg transition-colors">
            Get a Quote
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-blue-50 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          open ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white border-t border-gray-100 px-4 py-4 shadow-lg">
          <nav className="flex flex-col gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`py-2.5 px-3 rounded-lg font-medium transition-colors text-sm ${
                  isActive(l.href)
                    ? "text-blue-600 bg-blue-50"
                    : "text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3">
            <a href="tel:+919886114440" className="flex items-center gap-2 text-slate-700 font-medium text-sm">
              <Phone className="w-4 h-4 text-blue-600" />
              +91 98861 14440
            </a>
            <a href="tel:+919845679729" className="flex items-center gap-2 text-slate-700 font-medium text-sm">
              <Phone className="w-4 h-4 text-blue-600" />
              +91 98456 79729
            </a>
            <Link href="/contact" className="btn-primary text-center text-sm">
              Get a Quote
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

