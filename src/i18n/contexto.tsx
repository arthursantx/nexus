import { createContext, useContext } from 'react';
import type { Idioma } from '../dominio/rotulos';

export const ContextoIdioma = createContext<{ idioma: Idioma; trocar: (i: Idioma) => void }>({ idioma: 'pt', trocar: () => {} });
export const useIdioma = () => useContext(ContextoIdioma);

/** Botões PT / EN. */
export function SeletorIdioma({ escuro = false }: { escuro?: boolean }) {
  const { idioma, trocar } = useIdioma();
  return (
    <div className={`idiomas ${escuro ? 'idiomas-escuro' : ''}`} role="group" aria-label="Idioma">
      {(['pt', 'en'] as const).map((i) => (
        <button key={i} type="button" lang={i === 'en' ? 'en' : 'pt-BR'} aria-pressed={idioma === i} onClick={() => trocar(i)} translate="no">
          <span aria-hidden="true">{i.toUpperCase()}</span>
          <span className="visualmente-oculto">{i === 'en' ? 'English' : 'Português'}</span>
        </button>
      ))}
    </div>
  );
}
