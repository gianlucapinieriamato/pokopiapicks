"use client";
import { useState } from "react";

export default function PkmnIcon({
  src,
  alt,
  className,
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={`icon-fallback ${className ?? ""}`}>·</div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={`img-icon ${className ?? ""}`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
