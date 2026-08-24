"use client";
import { useState, useEffect } from "react";

export function useAdminDark(): boolean {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(localStorage.getItem("vt_dark") === "1");
    const handler = (e: Event) => setDark((e as CustomEvent<{ dark: boolean }>).detail.dark);
    window.addEventListener("vt-theme", handler);
    return () => window.removeEventListener("vt-theme", handler);
  }, []);
  return dark;
}
