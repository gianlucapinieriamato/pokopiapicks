import Link from "next/link";

export default function NotFound() {
  return (
    <div className="detail-wrap" style={{ textAlign: "center", paddingTop: 60 }}>
      <div className="card" style={{ maxWidth: 480, margin: "0 auto" }}>
        <div className="pkmn-name" style={{ fontSize: "3rem", marginBottom: 12 }}>404</div>
        <p className="section-sub">That page doesn&apos;t exist in Pokopia Picks.</p>
        <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" className="pkmn-nav-btn">Home</Link>
          <Link href="/pokedex" className="pkmn-nav-btn">Pokédex</Link>
        </div>
      </div>
    </div>
  );
}
