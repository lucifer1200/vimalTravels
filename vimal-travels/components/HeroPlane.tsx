"use client";
import { motion, useReducedMotion } from "framer-motion";

const destinations = [
  { label: "🏔️ Kashmir",   delay: 0.5,  x: "12%",  bottom: "28%" },
  { label: "🌴 Bali",       delay: 1.2,  x: "72%",  bottom: "20%" },
  { label: "🗼 Paris",       delay: 1.8,  x: "55%",  bottom: "38%" },
  { label: "🏙️ Singapore",  delay: 2.4,  x: "30%",  bottom: "15%" },
  { label: "🕌 Dubai",       delay: 3.0,  x: "82%",  bottom: "42%" },
];

// Bezier path keyframes: plane flies from bottom-left → top-right
const planeX  = ["-8%",  "15%",  "40%",  "68%",  "108%"];
const planeY  = ["82%",  "60%",  "42%",  "28%",  "10%"];
const planeR  = [-5, -12, -20, -24, -28]; // tilt upward as it climbs

export default function HeroPlane() {
  const reduced = useReducedMotion();
  if (reduced) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">

      {/* ── SVG Flight Path Trail ── */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 600"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Glowing base path */}
        <motion.path
          d="M -80 490 Q 360 120 1520 60"
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="2"
          strokeDasharray="10 8"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.4, delay: 0.2, ease: "easeOut" }}
        />
        {/* Bright animated dot racing along the path */}
        <motion.circle r="3" fill="rgba(255,255,255,0.9)">
          <animateMotion
            dur="6s"
            repeatCount="indefinite"
            path="M -80 490 Q 360 120 1520 60"
          />
        </motion.circle>
      </svg>

      {/* ── Flying Plane ── */}
      <motion.div
        className="absolute"
        style={{ left: 0, top: 0 }}
        initial={{ x: "-8%", y: "82%" }}
        animate={{
          x: planeX,
          y: planeY,
          rotate: planeR,
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          repeatDelay: 3.5,
          ease: [0.4, 0, 0.2, 1],
          times: [0, 0.25, 0.5, 0.75, 1],
        }}
      >
        {/* Glow */}
        <div className="absolute inset-0 blur-md scale-150 opacity-40">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
            <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
          </svg>
        </div>
        {/* Plane icon */}
        <svg width="38" height="38" viewBox="0 0 24 24" fill="white" className="drop-shadow-lg">
          <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
        </svg>
      </motion.div>

      {/* ── Floating Destination Chips ── */}
      {destinations.map((d) => (
        <motion.div
          key={d.label}
          className="absolute"
          style={{ left: d.x, bottom: d.bottom }}
          initial={{ opacity: 0, y: 20, scale: 0.85 }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: [20, 0, -8, -20],
            scale: [0.85, 1, 1, 0.9],
          }}
          transition={{
            duration: 4,
            delay: d.delay,
            repeat: Infinity,
            repeatDelay: 6,
            ease: "easeOut",
          }}
        >
          <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-full px-3 py-1.5 text-white text-xs font-semibold shadow-lg whitespace-nowrap">
            {d.label}
          </div>
        </motion.div>
      ))}

      {/* ── Subtle floating cloud blobs ── */}
      {[
        { size: 80,  x: "15%", y: "25%", delay: 0,   dur: 18 },
        { size: 55,  x: "65%", y: "55%", delay: 4,   dur: 22 },
        { size: 45,  x: "85%", y: "20%", delay: 8,   dur: 15 },
      ].map((c, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/5 backdrop-blur-sm"
          style={{ width: c.size, height: c.size * 0.55, left: c.x, top: c.y }}
          animate={{ x: [0, 18, 0], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: c.dur, delay: c.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
