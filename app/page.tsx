import ClientBoot from "./client-boot";
export default function Home() {
  return (
    <>
      <a className="skip" href="#app-root">
        Ir à produção
      </a>
      <header>
        <a className="brand" href="/">
          CADÊNCIA<span>A ORDEM INVISÍVEL DAS COISAS</span>
        </a>
        <a href="/api-docs.html">Método e API ↗</a>
      </header>
      <main>
        <section className="timeline-area">
          <div className="scene-number">
            <span>PRODUÇÃO / ENQUADRAMENTO TEMPORAL</span>
            <span>CPM — FIM → INÍCIO</span>
          </div>
          <div className="film-title">
            <span>TODA ESTREIA TEM UM ANTES.</span>
            <h2>
              Encontre
              <br />o que não
              <br />
              <em>pode esperar.</em>
            </h2>
          </div>
          <canvas
            id="timeline"
            role="img"
            aria-label="Cronograma das etapas com caminho crítico e folgas, detalhado na tabela"
          />
          <div className="legend">
            <span>■ CAMINHO CRÍTICO</span>
            <span>■ ETAPA COM FOLGA</span>
            <span>┆ PRAZO</span>
          </div>
          <figure>
            <img
              src="/media/subject.webp"
              width="1200"
              height="800"
              loading="lazy"
              alt="Bastidores reais de uma produção, referência para um cronograma fictício"
            />
            <figcaption>Da ideia à última luz.</figcaption>
          </figure>
        </section>
        <section id="app-root">Montando a produção…</section>
      </main>
      <footer>
        <span>Uma experiência de Gustavo Paz</span>
        <a href="/credits.html">Créditos ↗</a>
        <a href="https://github.com/gustapaz/cadencia">Código ↗</a>
        <button id="motion-toggle" aria-pressed="false">
          Pausar movimento
        </button>
      </footer>
      <ClientBoot />
    </>
  );
}
