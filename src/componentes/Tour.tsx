import { useEffect, useRef } from 'react';
import { TOUR } from '../dominio/guia';

/** Tour guiado: um cartão fixo que abre cada tela e explica para que ela serve. */
export function Tour({ passo, onPasso, onFechar }: { passo: number; onPasso: (n: number) => void; onFechar: () => void }) {
  const p = TOUR[passo];
  const titulo = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (location.hash !== `#/${p.rota}`) location.hash = `#/${p.rota}`;
    const t = setTimeout(() => titulo.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [p.rota, passo]);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') onFechar(); };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [onFechar]);

  const ultimo = passo === TOUR.length - 1;
  return (
    <section className="tour" role="dialog" aria-modal="false" aria-labelledby="tour-titulo">
      <div className="tour-topo">
        <span>Tour guiado · {passo + 1} de {TOUR.length}</span>
        <button type="button" className="tour-fechar" onClick={onFechar} aria-label="Fechar o tour">×</button>
      </div>
      <div className="tour-barra" aria-hidden="true"><span style={{ width: `${((passo + 1) / TOUR.length) * 100}%` }} /></div>
      <h2 id="tour-titulo" ref={titulo} tabIndex={-1}>{p.titulo}</h2>
      <p>{p.texto}</p>
      <div className="tour-acoes">
        {passo > 0 && <button type="button" className="botao botao-fantasma" onClick={() => onPasso(passo - 1)}>Voltar</button>}
        {ultimo
          ? <button type="button" className="botao" onClick={onFechar}>Concluir</button>
          : <button type="button" className="botao" onClick={() => onPasso(passo + 1)}>Próximo</button>}
      </div>
    </section>
  );
}

