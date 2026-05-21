"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ArrowKeyNav({ prevSlug, nextSlug }: { prevSlug: string | null; nextSlug: string | null }) {
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft" && prevSlug) router.push(`/pokemon/${prevSlug}`);
      if (e.key === "ArrowRight" && nextSlug) router.push(`/pokemon/${nextSlug}`);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prevSlug, nextSlug, router]);

  return null;
}
