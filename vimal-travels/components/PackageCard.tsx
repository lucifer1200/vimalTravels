"use client";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import ScrollReveal from "@/components/ScrollReveal";

interface Package {
  title: string;
  duration: string;
  price: string;
  highlights: string[];
  image: string;
  tag: string;
}

export default function PackageCard({ p, i }: { p: Package; i: number }) {
  const reduced = useReducedMotion();
  return (
    <ScrollReveal direction="up" delay={i * 80}>
      <motion.div
        whileHover={{ y: -6, boxShadow: "0 20px 48px rgba(37,99,235,0.13)" }}
        transition={{ type: "spring", stiffness: 280, damping: 20 }}
        className="bg-white rounded-xl border border-gray-100 overflow-hidden group h-full flex flex-col"
      >
        <div className="relative h-52 overflow-hidden shrink-0">
          {/* Mini plane sweep on hover */}
          {!reduced && (
            <motion.div
              className="absolute top-3 z-20 pointer-events-none"
              initial={{ x: "-12%", opacity: 0 }}
              whileHover={{ x: "110%", opacity: [0, 1, 1, 0] }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white" className="drop-shadow rotate-90">
                <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
              </svg>
            </motion.div>
          )}
          <Image
            src={p.image}
            alt={p.title}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.07]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
          <div className="absolute top-3 left-3">
            <span className="bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
              {p.tag}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <span className="bg-black/50 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
              {p.duration}
            </span>
          </div>
          <div className="absolute bottom-3 left-4">
            <h3 className="font-display font-bold text-white text-lg drop-shadow-lg">{p.title}</h3>
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
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/contact"
                className="bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors block"
              >
                Enquire →
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </ScrollReveal>
  );
}
