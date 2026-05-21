"use client";
import { useState, useEffect } from "react";

export default function LangToggle() {
  const [lang, setLang] = useState<"en" | "es">("en");

  useEffect(() => {
    const stored = localStorage.getItem("pokopia-lang");
    if (stored === "en" || stored === "es") setLang(stored);
  }, []);

  const toggle = () => {
    const next = lang === "en" ? "es" : "en";
    setLang(next);
    localStorage.setItem("pokopia-lang", next);
    window.location.reload();
  };

  return (
    <button className="lang-toggle" onClick={toggle} aria-label="Toggle language">
      {lang === "en" ? "ES" : "EN"}
    </button>
  );
}
