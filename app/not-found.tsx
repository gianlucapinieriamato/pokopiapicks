import NavBtn from "@/app/components/NavBtn";
import PageWrap from "@/app/components/PageWrap";
import Card from "@/app/components/Card";

export default function NotFound() {
  return (
    <PageWrap className="text-center pt-[60px]">
      <Card className="max-w-[480px] mx-auto">
        <div className="font-outfit font-extrabold text-[3rem] tracking-[-0.02em] leading-none mb-3">404</div>
        <p className="text-[13px] text-ink-soft mb-4 leading-relaxed">That page doesn&apos;t exist in Pokopia Picks.</p>
        <div className="mt-6 flex gap-3 justify-center flex-wrap">
          <NavBtn href="/">Home</NavBtn>
          <NavBtn href="/pokedex">Pokédex</NavBtn>
        </div>
      </Card>
    </PageWrap>
  );
}
