"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, FileText, BookOpen } from "lucide-react";

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

export default function ServicesSection() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {services.map((s, i) => (
        <motion.div
          key={i}
          whileHover={{ y: -6, boxShadow: "0 16px 40px rgba(37,99,235,0.12)" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="card p-6 h-full"
        >
          <motion.div
            whileHover={{ scale: 1.15, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4"
          >
            <s.icon className="w-5 h-5 text-blue-600" />
          </motion.div>
          <h3 className="font-display text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-4">{s.desc}</p>
          <Link href={s.href} className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1">
            Learn More →
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
