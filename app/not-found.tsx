import Link from "next/link";

export default function NotFound() {
  return (
    <div className="detail-wrap text-center pt-[60px]">
      <div className="card max-w-[480px] mx-auto">
        <div className="pkmn-name text-[3rem] mb-3">404</div>
        <p className="section-sub">That page doesn&apos;t exist in Pokopia Picks.</p>
        <div className="mt-6 flex gap-3 justify-center flex-wrap">
          <Link href="/" className="pkmn-nav-btn">Home</Link>
          <Link href="/pokedex" className="pkmn-nav-btn">Pokédex</Link>
        </div>
      </div>
    </div>
  );
}
