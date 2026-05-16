"use client";
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface Props {
  target: string; // e.g. "19+", "5000+", "99%", "2007"
  duration?: number;
}

function parseTarget(target: string): { num: number; suffix: string; prefix: string } {
  const prefix = target.startsWith("₹") ? "₹" : "";
  const cleaned = target.replace(/[₹,]/g, "");
  const suffix = cleaned.replace(/[0-9]/g, "");
  const num = parseInt(cleaned.replace(/\D/g, ""), 10);
  return { num, suffix, prefix };
}

export default function AnimatedCounter({ target, duration = 1800 }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const { num } = parseTarget(target);
    const start = Date.now();
    const step = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(eased * num));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);

  const { suffix, prefix } = parseTarget(target);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString("en-IN")}{suffix}
    </span>
  );
}
