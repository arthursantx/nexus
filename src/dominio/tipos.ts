/** Tipos do domínio do NEXUS. Todo registro pertence a uma organização (pronto para multiempresa). */

export type Papel = 'ceo' | 'cio' | 'gerente_ti' | 'po' | 'ba' | 'gestor_area';

export interface Usuario {
  id: string;
  nome: string;
  papel: Papel;
  departamentoId?: string;
}

export interface Departamento {
  id: string;
  nome: string;
  sigla: string;
}

/** Notas de 1 a 5 em cada critério da matriz de priorização. */
export interface Criterios {
  alinhamento: number;
  financeiro: number;
  operacional: number;
  urgencia: number;
  viabilidade: number;
}
export type Criterio = keyof Criterios;

/** Pesos em pontos percentuais; a soma precisa ser 100. */
export type Pesos = Record<Criterio, number>;

export type Categoria =
  | 'eficiencia'
  | 'receita'
  | 'compliance'
  | 'experiencia_cliente'
  | 'dados'
  | 'infraestrutura'
  | 'seguranca';

export type StatusNecessidade = 'nova' | 'em_analise' | 'priorizada' | 'convertida' | 'recusada';

export interface Evento {
  quando: string; // ISO
  autor: string;
  descricao: string;
}

export interface Necessidade {
  id: string;
  organizacaoId: string;
  codigo: string;
  titulo: string;
  descricao: string;
  departamentoId: string;
  solicitante: string;
  categoria: Categoria;
  status: StatusNecessidade;
  criterios: Criterios;
  /** Esforço estimado de 1 (baixo) a 5 (alto). */
  esforco: number;
  beneficioAnualEstimado: number;
  horasEconomizadasMes: number;
  criadaEm: string;
  iniciativaId?: string;
  historico: Evento[];
}

export type StatusIniciativa =
  | 'proposta'
  | 'em_avaliacao'
  | 'aprovada'
  | 'em_planejamento'
  | 'em_execucao'
  | 'pausada'
  | 'concluida'
  | 'cancelada';

export type Risco = 'baixo' | 'medio' | 'alto';

export interface MedicaoValor {
  mes: string; // AAAA-MM
  valor: number;
  /** true quando o benefício foi validado pela área (por exemplo, pelo financeiro). */
  confirmado: boolean;
  fonte: string;
}

export interface Iniciativa {
  id: string;
  organizacaoId: string;
  codigo: string;
  nome: string;
  descricao: string;
  necessidadeIds: string[];
  departamentoId: string;
  responsavel: string;
  status: StatusIniciativa;
  orcamento: number;
  custoRealizado: number;
  inicio: string; // AAAA-MM-DD
  fimPrevisto: string;
  progresso: number; // 0 a 100
  risco: Risco;
  criterios: Criterios;
  esforco: number;
  beneficioProjetadoAnual: number;
  /** Mês em que o benefício começa a ser contado (entrada em produção). */
  inicioBeneficio?: string; // AAAA-MM
  medicoes: MedicaoValor[];
  horasEconomizadasMes: number;
  historico: Evento[];
}

export type TipoDecisao =
  | 'aprovacao'
  | 'rejeicao'
  | 'repriorizacao'
  | 'alteracao_orcamento'
  | 'pausa'
  | 'encerramento';

export interface Decisao {
  id: string;
  organizacaoId: string;
  codigo: string;
  data: string;
  tipo: TipoDecisao;
  titulo: string;
  iniciativaId?: string;
  necessidadeId?: string;
  /** Só em alteração de orçamento: o valor que passa a valer. */
  novoOrcamento?: number;
  justificativa: string;
  participantes: string[];
  responsavel: string;
  proximosPassos: string;
  prazo: string;
}

export interface RegistroAuditoria {
  id: string;
  quando: string;
  usuario: string;
  papel: Papel;
  acao: string;
  entidade: string;
  detalhe: string;
}

export interface Organizacao {
  id: string;
  nome: string;
  demonstracao: boolean;
}

export interface Estado {
  versao: number;
  organizacao: Organizacao;
  departamentos: Departamento[];
  usuarios: Usuario[];
  pesos: Pesos;
  necessidades: Necessidade[];
  iniciativas: Iniciativa[];
  decisoes: Decisao[];
  auditoria: RegistroAuditoria[];
}
