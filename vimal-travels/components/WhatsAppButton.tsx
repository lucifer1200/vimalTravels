"use client";
import { motion } from "framer-motion";

export default function WhatsAppButton() {
  return (
    <motion.a
      href="https://wa.me/919886114440?text=Hi%20Vimal%20Travels!%20I%27m%20interested%20in%20a%20travel%20package."
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18, delay: 1.2 }}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.92 }}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 text-white rounded-full shadow-xl flex items-center justify-center"
    >
      {/* Ping ring */}
      <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-40" />
      {/* WhatsApp SVG */}
      <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white relative z-10" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.004 2C8.28 2 2 8.28 2 16.004c0 2.46.637 4.77 1.756 6.782L2 30l7.44-1.726A13.93 13.93 0 0016.004 30C23.72 30 30 23.72 30 16.004 30 8.28 23.72 2 16.004 2zm0 25.428a11.71 11.71 0 01-5.978-1.635l-.43-.255-4.42 1.025 1.062-4.31-.28-.445a11.71 11.71 0 01-1.81-6.304C4.148 9.487 9.486 4.148 16.004 4.148c6.518 0 11.856 5.34 11.856 11.856 0 6.518-5.338 11.424-11.856 11.424zm6.494-8.854c-.355-.178-2.1-1.036-2.425-1.155-.325-.118-.56-.178-.797.178-.236.356-.916 1.155-1.122 1.393-.207.237-.414.266-.77.089-.355-.177-1.5-.552-2.857-1.762-1.056-.942-1.77-2.103-1.977-2.459-.207-.355-.022-.547.155-.724.16-.16.355-.414.533-.622.178-.207.237-.355.355-.592.119-.237.06-.444-.03-.622-.088-.178-.796-1.924-1.09-2.635-.287-.693-.58-.598-.797-.61l-.68-.01c-.237 0-.622.089-.948.444-.325.356-1.24 1.214-1.24 2.96 0 1.745 1.27 3.43 1.447 3.667.178.237 2.5 3.82 6.057 5.357.847.365 1.508.583 2.024.746.85.27 1.625.232 2.238.14.682-.1 2.1-.858 2.396-1.687.296-.83.296-1.54.207-1.688-.088-.148-.325-.237-.68-.414z"/>
      </svg>
    </motion.a>
  );
}
