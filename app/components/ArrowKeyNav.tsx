"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ArrowKeyNav({ prevSlug, nextSlug }: { prevSlug: string | null; nextSlug: string | null }) {
  const { push } = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft" && prevSlug) push(`/pokemon/${prevSlug}`);
      if (e.key === "ArrowRight" && nextSlug) push(`/pokemon/${nextSlug}`);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prevSlug, nextSlug, push]);

  return null;
}
