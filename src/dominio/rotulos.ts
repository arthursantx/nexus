import type { Categoria, Papel, Risco, StatusIniciativa, StatusNecessidade, TipoDecisao } from './tipos';

export const NOME_PAPEL: Record<Papel, string> = {
  ceo: 'CEO',
  cio: 'CIO/CTO',
  gerente_ti: 'Gerente de TI',
  po: 'Product Owner',
  ba: 'Business Analyst',
  gestor_area: 'Gestor de área',
};

export const NOME_CATEGORIA: Record<Categoria, string> = {
  eficiencia: 'Eficiência operacional',
  receita: 'Receita',
  compliance: 'Compliance',
  experiencia_cliente: 'Experiência do cliente',
  dados: 'Dados e indicadores',
  infraestrutura: 'Infraestrutura',
  seguranca: 'Segurança',
};

export const NOME_STATUS_NECESSIDADE: Record<StatusNecessidade, string> = {
  nova: 'Nova',
  em_analise: 'Em análise',
  priorizada: 'Priorizada',
  convertida: 'Convertida em iniciativa',
  recusada: 'Recusada',
};

export const NOME_STATUS_INICIATIVA: Record<StatusIniciativa, string> = {
  proposta: 'Proposta',
  em_avaliacao: 'Em avaliação',
  aprovada: 'Aprovada',
  em_planejamento: 'Em planejamento',
  em_execucao: 'Em execução',
  pausada: 'Pausada',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};

export const STATUS_INICIATIVA = Object.keys(NOME_STATUS_INICIATIVA) as StatusIniciativa[];

export const NOME_RISCO: Record<Risco, string> = { baixo: 'Baixo', medio: 'Médio', alto: 'Alto' };

export const NOME_TIPO_DECISAO: Record<TipoDecisao, string> = {
  aprovacao: 'Aprovação',
  rejeicao: 'Rejeição',
  repriorizacao: 'Repriorização',
  alteracao_orcamento: 'Alteração de orçamento',
  pausa: 'Pausa',
  encerramento: 'Encerramento',
};

/** O que cada perfil pode fazer. Todos podem consultar. */
export type Permissao =
  | 'registrar_necessidade'
  | 'avaliar_necessidade'
  | 'editar_pesos'
  | 'gerir_iniciativa'
  | 'registrar_decisao'
  | 'registrar_valor';

const PERMISSOES: Record<Papel, Permissao[]> = {
  ceo: ['registrar_necessidade', 'editar_pesos', 'registrar_decisao'],
  cio: ['registrar_necessidade', 'avaliar_necessidade', 'editar_pesos', 'gerir_iniciativa', 'registrar_decisao', 'registrar_valor'],
  gerente_ti: ['registrar_necessidade', 'avaliar_necessidade', 'gerir_iniciativa', 'registrar_valor'],
  po: ['registrar_necessidade', 'avaliar_necessidade', 'gerir_iniciativa', 'registrar_valor'],
  ba: ['registrar_necessidade', 'avaliar_necessidade', 'registrar_valor'],
  gestor_area: ['registrar_necessidade'],
};

export function pode(papel: Papel, permissao: Permissao): boolean {
  return PERMISSOES[papel].includes(permissao);
}

export type Idioma = 'pt' | 'en';
let idiomaFormatos: Idioma = 'pt';
/** Os formatadores seguem o idioma da interface (números, datas e meses). */
export function definirIdiomaFormatos(i: Idioma) {
  idiomaFormatos = i;
}

const FORMATOS = {
  pt: {
    brl: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }),
    curto: new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }),
    num: new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }),
  },
  en: {
    brl: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'BRL', currencyDisplay: 'symbol', maximumFractionDigits: 0 }),
    curto: new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }),
    num: new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }),
  },
};

export const moeda = (v: number) => FORMATOS[idiomaFormatos].brl.format(v);
export const moedaCurta = (v: number) => `R$ ${FORMATOS[idiomaFormatos].curto.format(v)}`;
export const numero = (v: number) => FORMATOS[idiomaFormatos].num.format(v);
export const percentual = (v: number | null) => (v === null ? '—' : `${FORMATOS[idiomaFormatos].num.format(v * 100)}%`);

/** Datas AAAA-MM-DD ou ISO em dd/mm/aaaa (ou mm/dd/aaaa em inglês), sem depender do fuso do navegador. */
export function data(valor: string): string {
  const [a, m, d] = valor.slice(0, 10).split('-');
  return idiomaFormatos === 'en' ? `${m}/${d}/${a}` : `${d}/${m}/${a}`;
}

const MESES = {
  pt: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};
export function mesAno(valor: string): string {
  const [a, m] = valor.split('-');
  return `${MESES[idiomaFormatos][Number(m) - 1]}/${a.slice(2)}`;
}

export function dataHora(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(idiomaFormatos === 'en' ? 'en-US' : 'pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}
