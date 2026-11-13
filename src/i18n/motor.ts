import { definirIdiomaFormatos, type Idioma } from '../dominio/rotulos';
import { DICIONARIO, PADROES } from './en';

/**
 * Tradução da interface. O português é a língua de origem; em inglês, cada texto exibido
 * é trocado pela tradução do dicionário (textos fixos) ou de um padrão (textos com números e nomes).
 * Conteúdo digitado pelo usuário não é traduzido.
 */

const CHAVE = 'nexus:idioma';
let atual: Idioma = 'pt';
const faltando = new Set<string>();
const produzidos = new Set<string>();

export function idiomaInicial(): Idioma {
  const url = new URLSearchParams(location.search).get('lang');
  if (url === 'en' || url === 'pt') return url;
  try {
    const salvo = localStorage.getItem(CHAVE);
    if (salvo === 'en' || salvo === 'pt') return salvo;
  } catch {
    /* sem armazenamento */
  }
  return 'pt';
}

export function idioma() {
  return atual;
}

function guardar(s: string) {
  produzidos.add(s);
  return s;
}

/** Traduz um texto completo; devolve null quando não há tradução. */
export function traduzir(texto: string): string | null {
  const s = texto.replace(/\s+/g, ' ').trim();
  if (!s) return null;
  if (produzidos.has(s)) return null;
  if (s in DICIONARIO) return guardar(DICIONARIO[s]);
  for (const [re, fn] of PADROES) {
    const m = s.match(re);
    if (m) {
      const r = fn(m, (x: string) => traduzir(x) ?? x);
      if (r !== null) return guardar(r);
    }
  }
  return null;
}

/** Para textos usados no código (confirmações, título da página). */
export function t(pt: string): string {
  return atual === 'en' ? traduzir(pt) ?? pt : pt;
}

const ATRIBUTOS = ['aria-label', 'placeholder', 'title', 'alt'];
const original = new WeakMap<Node, string>();

function traduzirNo(no: Node) {
  if (no.nodeType === Node.TEXT_NODE) {
    const pai = no.parentElement;
    if (!pai || pai.closest('script,style,textarea,[translate="no"]')) return;
    const v = no.nodeValue ?? '';
    if (!v.trim()) return;
    const tr = traduzir(v);
    if (tr !== null && tr !== v.trim()) {
      original.set(no, v);
      const ini = v.match(/^\s*/)![0];
      const fim = v.match(/\s*$/)![0];
      no.nodeValue = ini + tr + fim;
    } else if (tr === null && !produzidos.has(v.trim()) && /[a-zà-ú]{3}/i.test(v) && !/^[\d\s.,%R$/:·—–+-]+$/.test(v)) {
      faltando.add(v.trim());
    }
    return;
  }
  if (no.nodeType === Node.ELEMENT_NODE) {
    const el = no as Element;
    if (el.closest('[translate="no"]')) return;
    for (const a of ATRIBUTOS) {
      const v = el.getAttribute(a);
      if (v) {
        const tr = traduzir(v);
        if (tr !== null && tr !== v) el.setAttribute(a, tr);
        else if (tr === null && !produzidos.has(v.trim())) faltando.add(v.trim());
      }
    }
    const it = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let n = it.nextNode();
    while (n) {
      if (n.nodeType === Node.TEXT_NODE) traduzirNo(n);
      else for (const a of ATRIBUTOS) {
        const e = n as Element;
        const v = e.getAttribute(a);
        if (v && !e.closest('[translate="no"]')) {
          const tr = traduzir(v);
          if (tr !== null && tr !== v) e.setAttribute(a, tr);
          else if (tr === null && !produzidos.has(v.trim())) faltando.add(v.trim());
        }
      }
      n = it.nextNode();
    }
  }
}

let observador: MutationObserver | null = null;

function ligar() {
  traduzirNo(document.body);
  document.title = traduzir(document.title) ?? document.title;
  observador = new MutationObserver((mut) => {
    for (const m of mut) {
      if (m.type === 'characterData') traduzirNo(m.target);
      else if (m.type === 'attributes') traduzirNo(m.target);
      else m.addedNodes.forEach(traduzirNo);
    }
  });
  observador.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATRIBUTOS });
}

export function aplicarIdioma(i: Idioma) {
  atual = i;
  definirIdiomaFormatos(i);
  document.documentElement.lang = i === 'en' ? 'en' : 'pt-BR';
  observador?.disconnect();
  observador = null;
  if (i === 'en') ligar();
  try {
    localStorage.setItem(CHAVE, i);
  } catch {
    /* ignora */
  }
}

/** Usado nos testes automáticos para encontrar textos sem tradução. */
(window as unknown as { __nexusFaltando: () => string[] }).__nexusFaltando = () => [...faltando].sort();
