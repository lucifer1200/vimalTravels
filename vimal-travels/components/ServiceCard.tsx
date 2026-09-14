"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  title: string;
  desc: string;
  href: string;
};

export default function ServiceCard({ icon: Icon, title, desc, href }: Props) {
  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: "0 16px 40px rgba(37,99,235,0.12)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="card p-6 h-full"
    >
      <motion.div
        whileHover={{ scale: 1.15, rotate: 5 }}
        transition={{ type: "spring", stiffness: 400 }}
        className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4"
      >
        <Icon className="w-5 h-5 text-blue-600" />
      </motion.div>
      <h3 className="font-display text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed mb-4">{desc}</p>
      <Link href={href} className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1">
        Learn More →
      </Link>
    </motion.div>
  );
}
