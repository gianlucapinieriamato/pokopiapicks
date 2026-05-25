import type { PokemonConst } from "@/app/lib/const";

export function sharedItemCount(a: PokemonConst, b: PokemonConst): number {
  const setA = new Set(a.categories.flatMap((cat) => cat.items.map((i) => i.slug)));
  return b.categories.flatMap((cat) => cat.items).filter((i) => setA.has(i.slug)).length;
}

export function calcScore(anchor: PokemonConst, candidate: PokemonConst): number {
  if (anchor.habitat.slug !== candidate.habitat.slug) return -1;
  const shared = sharedItemCount(anchor, candidate);
  const anchorSpecs = new Set(anchor.specialties.map((s) => s.slug));
  const candSpecs = new Set(candidate.specialties.map((s) => s.slug));
  const hasOverlap = [...candSpecs].some((s) => anchorSpecs.has(s));
  const multiplier = !hasOverlap && candSpecs.size > 0 && anchorSpecs.size > 0 ? 1.5 : 1.0;
  return Math.round(shared * multiplier);
}
