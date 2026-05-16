"use client";
import { motion, useInView } from "framer-motion";
import { useRef, ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "fade" | "zoom";
}

const variants = {
  up:    { hidden: { opacity: 0, y: 36 },        visible: { opacity: 1, y: 0 } },
  left:  { hidden: { opacity: 0, x: -36 },       visible: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 36 },        visible: { opacity: 1, x: 0 } },
  fade:  { hidden: { opacity: 0 },               visible: { opacity: 1 } },
  zoom:  { hidden: { opacity: 0, scale: 0.90 },  visible: { opacity: 1, scale: 1 } },
};

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-72px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={variants[direction]}
      transition={{
        duration: 0.65,
        delay: delay / 1000,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
