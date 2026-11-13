import { useEffect, useRef, useState } from 'react';
import { useIdioma } from '../i18n/contexto';

/** Painel de acessibilidade: as mesmas opções do portfólio de Arthur Borges. */

const CHAVE = 'nexus:acessibilidade';
export const ESCALAS = [1, 1.15, 1.3, 1.5];
const OPCOES = ['contraste', 'leitura', 'espacamento', 'links', 'movimento', 'guia', 'libras'] as const;
type Opcao = (typeof OPCOES)[number];
export type Preferencias = { escala: number } & Record<Opcao, boolean>;

const NOMES: Record<Opcao, string> = {
  contraste: 'Alto contraste',
  leitura: 'Fonte de leitura facilitada',
  espacamento: 'Mais espaço entre letras e linhas',
  links: 'Destacar links e botões',
  movimento: 'Pausar animações',
  guia: 'Guia de leitura',
  libras: 'Tradução para Libras (VLibras)',
};

export function normalizarPreferencias(bruto: unknown): Preferencias {
  const d = (bruto && typeof bruto === 'object' ? bruto : {}) as Record<string, unknown>;
  const e = Number(d.escala);
  const pref = { escala: Number.isInteger(e) && e >= 0 && e < ESCALAS.length ? e : 0 } as Preferencias;
  for (const o of OPCOES) pref[o] = d[o] === true;
  return pref;
}

function ler(): Preferencias {
  try {
    return normalizarPreferencias(JSON.parse(localStorage.getItem(CHAVE) || '{}'));
  } catch {
    return normalizarPreferencias({});
  }
}

let guia: HTMLDivElement | null = null;
const moverGuia = (e: PointerEvent) => { if (guia) guia.style.top = `${e.clientY}px`; };
function definirGuia(ativo: boolean) {
  if (ativo && !guia) {
    guia = document.createElement('div');
    guia.className = 'a11y-guia';
    guia.setAttribute('aria-hidden', 'true');
    guia.style.top = '50%';
    document.body.appendChild(guia);
    window.addEventListener('pointermove', moverGuia, { passive: true });
  } else if (!ativo && guia) {
    guia.remove();
    guia = null;
    window.removeEventListener('pointermove', moverGuia);
  }
}

function carregarFonteLeitura() {
  if (document.querySelector('[data-fonte-leitura]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&display=swap';
  link.dataset.fonteLeitura = '';
  document.head.appendChild(link);
}

let librasCarregado = false;
function carregarLibras() {
  // Widget oficial do Governo Federal (vlibras.gov.br). Só é baixado se a pessoa ativar a opção.
  if (librasCarregado) {
    document.querySelector('[vw]')?.removeAttribute('hidden');
    return;
  }
  librasCarregado = true;
  const caixa = document.createElement('div');
  caixa.setAttribute('vw', '');
  caixa.className = 'enabled';
  caixa.innerHTML = '<div vw-access-button class="active"></div><div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';
  document.body.appendChild(caixa);
  const script = document.createElement('script');
  script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
  script.onload = () => {
    try {
      const w = window as unknown as { VLibras?: { Widget: new (url: string) => unknown } };
      if (w.VLibras) new w.VLibras.Widget('https://vlibras.gov.br/app');
      window.dispatchEvent(new Event('load'));
    } catch {
      /* serviço indisponível */
    }
  };
  document.body.appendChild(script);
}

function aplicar(pref: Preferencias, idioma: string) {
  const raiz = document.documentElement;
  raiz.style.setProperty('--a11y-escala', String(ESCALAS[pref.escala]));
  (['contraste', 'leitura', 'espacamento', 'links', 'movimento'] as const).forEach((o) => raiz.classList.toggle(`a11y-${o}`, pref[o]));
  if (pref.leitura) carregarFonteLeitura();
  definirGuia(pref.guia);
  if (pref.libras && idioma === 'pt') carregarLibras();
  else document.querySelector('[vw]')?.setAttribute('hidden', '');
}

export function aplicarPreferenciasSalvas() {
  let idioma = 'pt';
  try {
    idioma = localStorage.getItem('nexus:idioma') === 'en' ? 'en' : 'pt';
  } catch {
    /* ignora */
  }
  aplicar(ler(), idioma);
}

export function BotaoAcessibilidade({ escuro = false }: { escuro?: boolean }) {
  const { idioma } = useIdioma();
  const [aberto, setAberto] = useState(false);
  const [pref, setPref] = useState<Preferencias>(ler);
  const painel = useRef<HTMLDivElement>(null);
  const botao = useRef<HTMLButtonElement>(null);

  useEffect(() => { aplicar(pref, idioma); }, [pref, idioma]);

  useEffect(() => {
    if (!aberto) return;
    painel.current?.querySelector('button')?.focus();
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') { setAberto(false); botao.current?.focus(); } };
    const clique = (e: MouseEvent) => {
      const alvo = e.target as Node;
      if (!painel.current?.contains(alvo) && !botao.current?.contains(alvo)) setAberto(false);
    };
    document.addEventListener('keydown', tecla);
    document.addEventListener('mousedown', clique);
    return () => { document.removeEventListener('keydown', tecla); document.removeEventListener('mousedown', clique); };
  }, [aberto]);

  const mudar = (m: Partial<Preferencias>) => {
    const novo = normalizarPreferencias({ ...pref, ...m });
    setPref(novo);
    try {
      localStorage.setItem(CHAVE, JSON.stringify(novo));
    } catch {
      /* ignora */
    }
  };

  return (
    <>
      <button ref={botao} type="button" className={`a11y-botao ${escuro ? 'a11y-botao-escuro' : ''}`} aria-expanded={aberto} aria-controls="painel-a11y" onClick={() => setAberto((v) => !v)}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm8 6.5-5.5 1V21a1 1 0 0 1-2 0v-5h-1v5a1 1 0 0 1-2 0V9.5L4 8.5a1 1 0 0 1 .35-1.97L12 7.8l7.65-1.27A1 1 0 1 1 20 8.5Z" /></svg>
        <span>Acessibilidade</span>
      </button>
      {aberto && (
        <div ref={painel} className="a11y-painel" id="painel-a11y" role="dialog" aria-labelledby="a11y-titulo">
          <div className="a11y-cabeca">
            <h2 id="a11y-titulo">Acessibilidade</h2>
            <button type="button" className="a11y-fechar" onClick={() => { setAberto(false); botao.current?.focus(); }}>
              <span aria-hidden="true">×</span>
              <span className="visualmente-oculto">Fechar painel de acessibilidade</span>
            </button>
          </div>
          <div role="group" aria-labelledby="a11y-tamanho">
            <p id="a11y-tamanho" className="a11y-rotulo">Tamanho do texto</p>
            <div className="a11y-tamanho">
              <button type="button" disabled={pref.escala === 0} onClick={() => mudar({ escala: pref.escala - 1 })}>
                <span aria-hidden="true">A−</span><span className="visualmente-oculto">Diminuir texto</span>
              </button>
              <output aria-live="polite">{Math.round(ESCALAS[pref.escala] * 100)}%</output>
              <button type="button" disabled={pref.escala === ESCALAS.length - 1} onClick={() => mudar({ escala: pref.escala + 1 })}>
                <span aria-hidden="true">A+</span><span className="visualmente-oculto">Aumentar texto</span>
              </button>
            </div>
          </div>
          <ul className="a11y-opcoes">
            {OPCOES.filter((o) => o !== 'libras' || idioma === 'pt').map((o) => (
              <li key={o}>
                <button type="button" aria-pressed={pref[o]} onClick={() => mudar({ [o]: !pref[o] })}>
                  <span className="a11y-chave" aria-hidden="true" />
                  {NOMES[o]}
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="a11y-restaurar" onClick={() => mudar(normalizarPreferencias({}))}>Restaurar padrão</button>
          <p className="a11y-nota">Suas escolhas ficam salvas neste navegador. O NEXUS também respeita a preferência de movimento reduzido do seu sistema.</p>
        </div>
      )}
    </>
  );
}
