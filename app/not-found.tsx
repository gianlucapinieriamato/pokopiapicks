import NavBtn from "@/app/components/NavBtn";

export default function NotFound() {
  return (
    <div className="detail-wrap text-center pt-[60px]">
      <div className="card max-w-[480px] mx-auto">
        <div className="font-outfit font-extrabold text-[3rem] tracking-[-0.02em] leading-none mb-3">404</div>
        <p className="section-sub">That page doesn&apos;t exist in Pokopia Picks.</p>
        <div className="mt-6 flex gap-3 justify-center flex-wrap">
          <NavBtn href="/">Home</NavBtn>
          <NavBtn href="/pokedex">Pokédex</NavBtn>
        </div>
      </div>
    </div>
  );
}
