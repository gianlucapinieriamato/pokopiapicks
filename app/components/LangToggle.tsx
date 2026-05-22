"use client";
import { useLang } from "@/app/lib/lang";

export default function LangToggle() {
  const lang = useLang();

  const toggle = () => {
    const next = lang === "en" ? "es" : "en";
    localStorage.setItem("pokopia-lang", next);
    window.location.reload();
  };

  return (
    <button className="lang-toggle" onClick={toggle} aria-label="Toggle language">
      {lang === "en" ? "ES" : "EN"}
    </button>
  );
}
