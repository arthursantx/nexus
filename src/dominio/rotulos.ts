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

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const BRL_CURTO = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 });
const NUM = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

export const moeda = (v: number) => BRL.format(v);
export const moedaCurta = (v: number) => `R$ ${BRL_CURTO.format(v)}`;
export const numero = (v: number) => NUM.format(v);
export const percentual = (v: number | null) => (v === null ? '—' : `${NUM.format(v * 100)}%`);

/** Datas AAAA-MM-DD ou ISO em dd/mm/aaaa, sem depender do fuso do navegador. */
export function data(valor: string): string {
  const [a, m, d] = valor.slice(0, 10).split('-');
  return `${d}/${m}/${a}`;
}

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
export function mesAno(valor: string): string {
  const [a, m] = valor.split('-');
  return `${MESES[Number(m) - 1]}/${a.slice(2)}`;
}

export function dataHora(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}
