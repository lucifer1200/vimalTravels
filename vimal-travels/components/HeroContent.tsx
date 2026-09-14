"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HeroContent() {
  return (
    <div className="max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="inline-flex items-center gap-2 bg-blue-600 rounded-full px-3 py-1 mb-6"
      >
        <span className="text-white text-xs font-semibold uppercase tracking-wider">IATA Certified Travel Agency</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
      >
        Bengaluru&apos;s Trusted Travel Partner for Tours,{" "}
        <span className="text-blue-300">Visa &amp; Passport</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.35 }}
        className="text-gray-200 text-lg leading-relaxed mb-8 max-w-xl"
      >
        Seamlessly navigating global borders since 2007. Whether it&apos;s a dream vacation or business travel, our experts handle every detail.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="flex flex-wrap gap-4"
      >
        <Link href="/packages" className="btn-primary px-8 py-3.5">Explore Packages</Link>
        <Link href="/contact" className="btn-outline px-8 py-3.5">Get Free Quote</Link>
      </motion.div>
    </div>
  );
}
