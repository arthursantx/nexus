import { useEffect, useRef, type ReactNode } from 'react';
import { faixaDoScore, NOME_FAIXA } from '../dominio/priorizacao';
import { NOME_RISCO, NOME_STATUS_INICIATIVA, NOME_STATUS_NECESSIDADE } from '../dominio/rotulos';
import type { Risco, StatusIniciativa, StatusNecessidade } from '../dominio/tipos';

export function Cabecalho({ titulo, subtitulo, acoes }: { titulo: string; subtitulo?: string; acoes?: ReactNode }) {
  return (
    <header className="cabecalho">
      <div>
        <h1>{titulo}</h1>
        {subtitulo && <p>{subtitulo}</p>}
      </div>
      {acoes && <div className="cabecalho-acoes">{acoes}</div>}
    </header>
  );
}

export function Cartao({ titulo, children, acoes, className = '' }: { titulo?: string; children: ReactNode; acoes?: ReactNode; className?: string }) {
  return (
    <section className={`cartao ${className}`}>
      {(titulo || acoes) && (
        <div className="cartao-topo">
          {titulo && <h2>{titulo}</h2>}
          {acoes}
        </div>
      )}
      {children}
    </section>
  );
}

export function Kpi({ rotulo, valor, detalhe, tom }: { rotulo: string; valor: string; detalhe?: string; tom?: 'alerta' | 'positivo' }) {
  return (
    <div className={`kpi ${tom ? `kpi-${tom}` : ''}`}>
      <span className="kpi-rotulo">{rotulo}</span>
      <strong className="kpi-valor">{valor}</strong>
      {detalhe && <span className="kpi-detalhe">{detalhe}</span>}
    </div>
  );
}

export function SeloScore({ score }: { score: number }) {
  const f = faixaDoScore(score);
  return (
    <span className={`selo selo-${f}`} title={NOME_FAIXA[f]}>
      {score.toFixed(1)}
    </span>
  );
}

export function SeloFaixa({ score }: { score: number }) {
  const f = faixaDoScore(score);
  return <span className={`selo selo-${f}`}>{NOME_FAIXA[f]}</span>;
}

export function SeloStatus({ status }: { status: StatusIniciativa }) {
  return <span className={`selo st-${status}`}>{NOME_STATUS_INICIATIVA[status]}</span>;
}

export function SeloNecessidade({ status }: { status: StatusNecessidade }) {
  return <span className={`selo sn-${status}`}>{NOME_STATUS_NECESSIDADE[status]}</span>;
}

export function SeloRisco({ risco }: { risco: Risco }) {
  return <span className={`selo risco-${risco}`}>Risco {NOME_RISCO[risco].toLowerCase()}</span>;
}

export function Barra({ valor, max = 100, tom }: { valor: number; max?: number; tom?: string }) {
  const p = Math.max(0, Math.min(100, (valor / max) * 100));
  return (
    <span className="barra" role="img" aria-label={`${Math.round(p)}%`}>
      <span className={`barra-preenchida ${tom ?? ''}`} style={{ width: `${p}%` }} />
    </span>
  );
}

export function Vazio({ children }: { children: ReactNode }) {
  return <p className="vazio">{children}</p>;
}

export function Campo({ rotulo, children, ajuda }: { rotulo: string; children: ReactNode; ajuda?: string }) {
  return (
    <label className="campo">
      <span>{rotulo}</span>
      {children}
      {ajuda && <small>{ajuda}</small>}
    </label>
  );
}

/** Janela modal acessível: foco inicial, Esc fecha e o foco volta para quem abriu. */
export function Modal({ titulo, aberto, onFechar, children }: { titulo: string; aberto: boolean; onFechar: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!aberto) return;
    const anterior = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>('input, select, textarea, button')?.focus();
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && onFechar();
    document.addEventListener('keydown', tecla);
    return () => {
      document.removeEventListener('keydown', tecla);
      anterior?.focus();
    };
  }, [aberto, onFechar]);
  if (!aberto) return null;
  return (
    <div className="modal-fundo" onMouseDown={(e) => e.target === e.currentTarget && onFechar()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-titulo" ref={ref}>
        <div className="modal-topo">
          <h2 id="modal-titulo">{titulo}</h2>
          <button type="button" className="botao-icone" onClick={onFechar} aria-label="Fechar">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Aviso({ children, tom = 'info' }: { children: ReactNode; tom?: 'info' | 'erro' | 'ok' }) {
  return (
    <p className={`aviso aviso-${tom}`} role={tom === 'erro' ? 'alert' : 'status'}>
      {children}
    </p>
  );
}
