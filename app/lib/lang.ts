"use client";
import { useState, useEffect } from "react";

export type Lang = "en" | "es";

export function useLang(): Lang {
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    const stored = localStorage.getItem("pokopia-lang");
    if (stored === "en" || stored === "es") setLang(stored as Lang);
  }, []);
  return lang;
}
