/**
 * Dados de DEMONSTRAÇÃO da empresa fictícia Vértice Group.
 * Pessoas, valores e projetos são inventados para mostrar o funcionamento da plataforma.
 */
import { PESOS_PADRAO } from '../dominio/priorizacao';
import type { Categoria, Criterios, Decisao, Estado, Iniciativa, MedicaoValor, Necessidade, StatusNecessidade } from '../dominio/tipos';

export const ORG = 'vertice';
/** Último mês fechado considerado nos cálculos de valor da demonstração. */
export const MES_REFERENCIA = '2026-10';
export const VERSAO_DADOS = 1;

const c = (alinhamento: number, financeiro: number, operacional: number, urgencia: number, viabilidade: number): Criterios => ({
  alinhamento,
  financeiro,
  operacional,
  urgencia,
  viabilidade,
});

function nec(
  n: number,
  titulo: string,
  descricao: string,
  departamentoId: string,
  solicitante: string,
  categoria: Categoria,
  status: StatusNecessidade,
  criterios: Criterios,
  esforco: number,
  beneficioAnualEstimado: number,
  horasEconomizadasMes: number,
  criadaEm: string,
  iniciativa?: number,
): Necessidade {
  const id = `nec-${n}`;
  const historico = [{ quando: `${criadaEm}T09:00:00`, autor: solicitante, descricao: 'Necessidade registrada.' }];
  if (status !== 'nova') historico.push({ quando: `${criadaEm}T15:00:00`, autor: 'Camila Duarte', descricao: 'Critérios avaliados pela análise de negócios.' });
  if (iniciativa) historico.push({ quando: `${criadaEm}T17:00:00`, autor: 'Ricardo Matos', descricao: `Convertida na iniciativa INI-${String(iniciativa).padStart(3, '0')}.` });
  return {
    id,
    organizacaoId: ORG,
    codigo: `NEC-${String(n).padStart(3, '0')}`,
    titulo,
    descricao,
    departamentoId,
    solicitante,
    categoria,
    status,
    criterios,
    esforco,
    beneficioAnualEstimado,
    horasEconomizadasMes,
    criadaEm,
    iniciativaId: iniciativa ? `ini-${iniciativa}` : undefined,
    historico,
  };
}

const m = (mes: string, valor: number, confirmado: boolean, fonte: string): MedicaoValor => ({ mes, valor, confirmado, fonte });

function ini(n: number, dados: Omit<Iniciativa, 'id' | 'organizacaoId' | 'codigo' | 'historico'> & { criadaEm: string }): Iniciativa {
  const { criadaEm, ...resto } = dados;
  return {
    id: `ini-${n}`,
    organizacaoId: ORG,
    codigo: `INI-${String(n).padStart(3, '0')}`,
    ...resto,
    historico: [{ quando: `${criadaEm}T10:00:00`, autor: 'Ricardo Matos', descricao: 'Iniciativa criada a partir da necessidade.' }],
  };
}

function dec(n: number, d: Omit<Decisao, 'id' | 'organizacaoId' | 'codigo'>): Decisao {
  return { id: `dec-${n}`, organizacaoId: ORG, codigo: `DEC-${String(n).padStart(3, '0')}`, ...d };
}

export function estadoInicial(): Estado {
  return {
    versao: VERSAO_DADOS,
    organizacao: { id: ORG, nome: 'Vértice Group', demonstracao: true },
    departamentos: [
      { id: 'fin', nome: 'Financeiro', sigla: 'FIN' },
      { id: 'com', nome: 'Comercial', sigla: 'COM' },
      { id: 'ops', nome: 'Operações', sigla: 'OPS' },
      { id: 'rh', nome: 'Recursos Humanos', sigla: 'RH' },
      { id: 'jur', nome: 'Jurídico', sigla: 'JUR' },
      { id: 'atd', nome: 'Atendimento ao Cliente', sigla: 'ATD' },
      { id: 'ti', nome: 'Tecnologia', sigla: 'TI' },
    ],
    usuarios: [
      { id: 'u1', nome: 'Helena Prado', papel: 'ceo' },
      { id: 'u2', nome: 'Ricardo Matos', papel: 'cio' },
      { id: 'u3', nome: 'Juliana Reis', papel: 'gerente_ti' },
      { id: 'u4', nome: 'Bruno Teixeira', papel: 'po' },
      { id: 'u5', nome: 'Camila Duarte', papel: 'ba' },
      { id: 'u6', nome: 'Marcos Lima', papel: 'gestor_area', departamentoId: 'ops' },
    ],
    pesos: { ...PESOS_PADRAO },
    necessidades: [
      nec(1, 'Conciliação bancária manual', 'A equipe confere extratos e lançamentos linha a linha em planilhas todos os dias.', 'fin', 'Patrícia Gomes', 'eficiencia', 'convertida', c(4, 5, 5, 4, 4), 2, 400000, 320, '2025-11-10', 1),
      nec(2, 'Clientes não consultam faturas sozinhos', 'Pedidos de segunda via e consulta de faturas chegam todos pelo telefone.', 'atd', 'Sérgio Alves', 'experiencia_cliente', 'convertida', c(5, 4, 4, 3, 3), 4, 600000, 480, '2025-12-02', 2),
      nec(3, 'Funil de vendas controlado em planilhas', 'Cada vendedor mantém a própria planilha; a diretoria não enxerga o funil consolidado.', 'com', 'Fernanda Rocha', 'receita', 'convertida', c(5, 5, 3, 4, 3), 4, 900000, 200, '2026-01-15', 3),
      nec(4, 'Indicadores divergentes entre áreas', 'Financeiro e Comercial apresentam números diferentes para a mesma receita.', 'ti', 'Juliana Reis', 'dados', 'convertida', c(5, 3, 4, 3, 3), 4, 300000, 120, '2026-02-03', 4),
      nec(5, 'Cálculo da folha com retrabalho', 'Ajustes manuais de horas extras geram retrabalho todo fechamento.', 'rh', 'Lúcia Martins', 'eficiencia', 'convertida', c(3, 4, 4, 4, 5), 2, 216000, 160, '2026-01-20', 5),
      nec(6, 'Contratos vencem sem aviso', 'Renovações automáticas acontecem porque ninguém é avisado do vencimento.', 'jur', 'André Costa', 'compliance', 'convertida', c(3, 3, 3, 4, 5), 2, 150000, 40, '2026-05-12', 6),
      nec(7, 'Rotas de entrega definidas manualmente', 'A programação de rotas é feita na véspera, sem considerar trânsito e janelas de entrega.', 'ops', 'Marcos Lima', 'eficiencia', 'convertida', c(4, 4, 5, 3, 2), 4, 380000, 260, '2026-02-18', 7),
      nec(8, 'Alto volume de chamados repetitivos', 'Cerca de metade dos chamados são dúvidas simples sobre pedidos e prazos.', 'atd', 'Sérgio Alves', 'experiencia_cliente', 'convertida', c(3, 3, 4, 3, 4), 3, 200000, 300, '2026-07-01', 8),
      nec(9, 'Previsão de fluxo de caixa feita à mão', 'A projeção semanal de caixa depende de consolidar cinco planilhas diferentes.', 'fin', 'Patrícia Gomes', 'dados', 'priorizada', c(5, 5, 4, 4, 3), 3, 250000, 60, '2026-08-25'),
      nec(10, 'Acessos a sistemas sem revisão periódica', 'Ex-colaboradores e trocas de área mantêm acessos antigos por meses.', 'ti', 'Juliana Reis', 'seguranca', 'em_analise', c(5, 3, 4, 5, 4), 2, 80000, 30, '2026-09-10'),
      nec(11, 'Onboarding de colaboradores em papel', 'Documentos de admissão circulam impressos entre RH, gestor e TI.', 'rh', 'Lúcia Martins', 'eficiencia', 'nova', c(3, 2, 3, 3, 4), 2, 60000, 50, '2026-10-02'),
      nec(12, 'Comissões calculadas em planilha', 'O cálculo de comissões leva três dias e gera contestações dos vendedores.', 'com', 'Fernanda Rocha', 'receita', 'em_analise', c(4, 4, 3, 3, 4), 2, 120000, 70, '2026-09-28'),
      nec(13, 'Pesquisa de satisfação sem consolidação', 'As respostas ficam no formulário e ninguém analisa os resultados.', 'atd', 'Sérgio Alves', 'experiencia_cliente', 'nova', c(3, 2, 2, 2, 4), 1, 30000, 10, '2026-10-15'),
      nec(14, 'Inventário sem leitura de código de barras', 'A contagem de estoque é digitada à mão e diverge do sistema.', 'ops', 'Marcos Lima', 'eficiencia', 'priorizada', c(4, 4, 4, 3, 4), 2, 140000, 90, '2026-09-03'),
      nec(15, 'Aplicativo próprio para reserva de salas', 'Pedido de um aplicativo interno para reservar salas de reunião.', 'ti', 'Juliana Reis', 'infraestrutura', 'recusada', c(1, 1, 2, 2, 4), 3, 10000, 5, '2026-08-01'),
    ],
    iniciativas: [
      ini(1, {
        nome: 'Conciliação bancária automatizada', descricao: 'Integração com os extratos bancários e regras automáticas de conciliação.', necessidadeIds: ['nec-1'],
        departamentoId: 'fin', responsavel: 'Bruno Teixeira', status: 'concluida', orcamento: 180000, custoRealizado: 172000, inicio: '2026-01-26', fimPrevisto: '2026-04-30',
        progresso: 100, risco: 'baixo', criterios: c(4, 5, 5, 4, 4), esforco: 2, beneficioProjetadoAnual: 420000, inicioBeneficio: '2026-05', horasEconomizadasMes: 320, criadaEm: '2026-01-21',
        medicoes: [m('2026-05', 31000, true, 'Financeiro'), m('2026-06', 34000, true, 'Financeiro'), m('2026-07', 35500, true, 'Financeiro'), m('2026-08', 36000, true, 'Financeiro'), m('2026-09', 34500, true, 'Financeiro'), m('2026-10', 35000, false, 'Estimativa do PO')],
      }),
      ini(2, {
        nome: 'Portal de autoatendimento do cliente', descricao: 'Portal para consulta de faturas, segunda via e acompanhamento de pedidos.', necessidadeIds: ['nec-2'],
        departamentoId: 'atd', responsavel: 'Bruno Teixeira', status: 'em_execucao', orcamento: 450000, custoRealizado: 310000, inicio: '2026-03-02', fimPrevisto: '2026-12-18',
        progresso: 62, risco: 'medio', criterios: c(5, 4, 4, 3, 3), esforco: 4, beneficioProjetadoAnual: 600000, horasEconomizadasMes: 480, criadaEm: '2026-02-20', medicoes: [],
      }),
      ini(3, {
        nome: 'Novo CRM comercial', descricao: 'Implantação de CRM com funil único, metas e previsão de vendas.', necessidadeIds: ['nec-3'],
        departamentoId: 'com', responsavel: 'Juliana Reis', status: 'em_execucao', orcamento: 520000, custoRealizado: 470000, inicio: '2026-03-16', fimPrevisto: '2026-11-30',
        progresso: 55, risco: 'alto', criterios: c(5, 5, 3, 4, 3), esforco: 4, beneficioProjetadoAnual: 900000, horasEconomizadasMes: 200, criadaEm: '2026-03-10', medicoes: [],
      }),
      ini(4, {
        nome: 'Base única de indicadores corporativos', descricao: 'Modelo de dados e painéis com uma única definição para receita, margem e custos.', necessidadeIds: ['nec-4'],
        departamentoId: 'ti', responsavel: 'Camila Duarte', status: 'em_planejamento', orcamento: 380000, custoRealizado: 40000, inicio: '2026-10-01', fimPrevisto: '2027-05-28',
        progresso: 10, risco: 'medio', criterios: c(5, 3, 4, 3, 3), esforco: 4, beneficioProjetadoAnual: 300000, horasEconomizadasMes: 120, criadaEm: '2026-09-16', medicoes: [],
      }),
      ini(5, {
        nome: 'Automação da folha de pagamento', descricao: 'Integração do ponto eletrônico com a folha e regras de horas extras.', necessidadeIds: ['nec-5'],
        departamentoId: 'rh', responsavel: 'Bruno Teixeira', status: 'concluida', orcamento: 120000, custoRealizado: 126000, inicio: '2026-02-09', fimPrevisto: '2026-06-26',
        progresso: 100, risco: 'baixo', criterios: c(3, 4, 4, 4, 5), esforco: 2, beneficioProjetadoAnual: 216000, inicioBeneficio: '2026-07', horasEconomizadasMes: 160, criadaEm: '2026-02-02',
        medicoes: [m('2026-07', 12000, true, 'RH e Financeiro'), m('2026-08', 11000, true, 'RH e Financeiro'), m('2026-09', 13000, true, 'RH e Financeiro'), m('2026-10', 12500, false, 'Estimativa do RH')],
      }),
      ini(6, {
        nome: 'Gestão de contratos com alertas', descricao: 'Repositório de contratos com alertas de vencimento e renovação.', necessidadeIds: ['nec-6'],
        departamentoId: 'jur', responsavel: 'Camila Duarte', status: 'aprovada', orcamento: 95000, custoRealizado: 0, inicio: '2026-11-16', fimPrevisto: '2027-02-26',
        progresso: 0, risco: 'baixo', criterios: c(3, 3, 3, 4, 5), esforco: 2, beneficioProjetadoAnual: 150000, horasEconomizadasMes: 40, criadaEm: '2026-05-20', medicoes: [],
      }),
      ini(7, {
        nome: 'Roteirização inteligente da frota', descricao: 'Ferramenta de roteirização com janelas de entrega e trânsito.', necessidadeIds: ['nec-7'],
        departamentoId: 'ops', responsavel: 'Juliana Reis', status: 'pausada', orcamento: 260000, custoRealizado: 140000, inicio: '2026-04-06', fimPrevisto: '2026-10-30',
        progresso: 40, risco: 'alto', criterios: c(4, 4, 5, 3, 2), esforco: 4, beneficioProjetadoAnual: 380000, horasEconomizadasMes: 260, criadaEm: '2026-03-25', medicoes: [],
      }),
      ini(8, {
        nome: 'Assistente virtual de atendimento', descricao: 'Respostas automáticas para dúvidas frequentes sobre pedidos e prazos.', necessidadeIds: ['nec-8'],
        departamentoId: 'atd', responsavel: 'Bruno Teixeira', status: 'em_avaliacao', orcamento: 140000, custoRealizado: 0, inicio: '2027-01-11', fimPrevisto: '2027-04-30',
        progresso: 0, risco: 'medio', criterios: c(3, 3, 4, 3, 4), esforco: 3, beneficioProjetadoAnual: 200000, horasEconomizadasMes: 300, criadaEm: '2026-07-14', medicoes: [],
      }),
      ini(9, {
        nome: 'Migração do ERP para nuvem', descricao: 'Troca do ERP local por uma versão em nuvem.', necessidadeIds: [],
        departamentoId: 'ti', responsavel: 'Juliana Reis', status: 'cancelada', orcamento: 900000, custoRealizado: 60000, inicio: '2026-02-02', fimPrevisto: '2027-06-30',
        progresso: 8, risco: 'alto', criterios: c(3, 2, 3, 2, 1), esforco: 5, beneficioProjetadoAnual: 250000, horasEconomizadasMes: 0, criadaEm: '2026-01-12', medicoes: [],
      }),
      ini(10, {
        nome: 'Assinatura eletrônica de documentos', descricao: 'Assinatura digital para contratos e documentos internos.', necessidadeIds: [],
        departamentoId: 'jur', responsavel: 'Camila Duarte', status: 'proposta', orcamento: 60000, custoRealizado: 0, inicio: '2027-02-01', fimPrevisto: '2027-04-30',
        progresso: 0, risco: 'baixo', criterios: c(3, 2, 3, 2, 5), esforco: 1, beneficioProjetadoAnual: 90000, horasEconomizadasMes: 60, criadaEm: '2026-10-20', medicoes: [],
      }),
    ],
    decisoes: [
      dec(1, { data: '2026-01-20', tipo: 'aprovacao', titulo: 'Aprovar a conciliação bancária automatizada', iniciativaId: 'ini-1', necessidadeId: 'nec-1', justificativa: 'Maior ganho de eficiência com baixo esforço; payback abaixo de seis meses.', participantes: ['Helena Prado', 'Ricardo Matos', 'Patrícia Gomes'], responsavel: 'Ricardo Matos', proximosPassos: 'Iniciar em fevereiro com o PO Bruno Teixeira.', prazo: '2026-02-02' }),
      dec(2, { data: '2026-03-10', tipo: 'aprovacao', titulo: 'Aprovar o novo CRM comercial', iniciativaId: 'ini-3', necessidadeId: 'nec-3', justificativa: 'Alinhamento direto à meta de crescimento de receita do ano.', participantes: ['Helena Prado', 'Ricardo Matos', 'Fernanda Rocha'], responsavel: 'Ricardo Matos', proximosPassos: 'Contratar o fornecedor e montar o time.', prazo: '2026-03-31' }),
      dec(3, { data: '2026-04-22', tipo: 'encerramento', titulo: 'Cancelar a migração do ERP para nuvem', iniciativaId: 'ini-9', justificativa: 'Esforço muito alto para o benefício previsto; a versão atual tem suporte até 2029.', participantes: ['Helena Prado', 'Ricardo Matos', 'Juliana Reis'], responsavel: 'Ricardo Matos', proximosPassos: 'Reavaliar no planejamento de 2028.', prazo: '2027-09-30' }),
      dec(4, { data: '2026-06-18', tipo: 'alteracao_orcamento', titulo: 'Ampliar o orçamento do portal de autoatendimento', iniciativaId: 'ini-2', justificativa: 'Inclusão do módulo de acompanhamento de pedidos, pedido pelo Atendimento.', participantes: ['Ricardo Matos', 'Bruno Teixeira', 'Sérgio Alves'], responsavel: 'Ricardo Matos', proximosPassos: 'Atualizar o cronograma com o novo escopo.', prazo: '2026-07-03' }),
      dec(5, { data: '2026-08-05', tipo: 'pausa', titulo: 'Pausar a roteirização da frota', iniciativaId: 'ini-7', justificativa: 'Fornecedor não cumpriu a integração com o sistema de pedidos; custo subindo sem entrega.', participantes: ['Helena Prado', 'Ricardo Matos', 'Marcos Lima'], responsavel: 'Juliana Reis', proximosPassos: 'Avaliar troca de fornecedor e apresentar alternativa.', prazo: '2026-11-28' }),
      dec(6, { data: '2026-09-15', tipo: 'repriorizacao', titulo: 'Antecipar a base única de indicadores', iniciativaId: 'ini-4', necessidadeId: 'nec-4', justificativa: 'A previsão de caixa (NEC-009) depende de dados consolidados; a base de indicadores vira pré-requisito.', participantes: ['Ricardo Matos', 'Camila Duarte', 'Patrícia Gomes'], responsavel: 'Camila Duarte', proximosPassos: 'Iniciar o planejamento em outubro.', prazo: '2026-10-01' }),
      dec(7, { data: '2026-10-08', tipo: 'rejeicao', titulo: 'Não desenvolver aplicativo próprio de reserva de salas', necessidadeId: 'nec-15', justificativa: 'A ferramenta de agenda já contratada resolve a necessidade sem custo adicional.', participantes: ['Ricardo Matos', 'Juliana Reis'], responsavel: 'Juliana Reis', proximosPassos: 'Publicar orientação de uso da agenda corporativa.', prazo: '2026-10-31' }),
    ],
    auditoria: [
      { id: 'a1', quando: '2026-10-08T16:20:00', usuario: 'Ricardo Matos', papel: 'cio', acao: 'Registrou decisão', entidade: 'DEC-007', detalhe: 'Rejeição: aplicativo de reserva de salas.' },
      { id: 'a2', quando: '2026-10-20T11:05:00', usuario: 'Camila Duarte', papel: 'ba', acao: 'Criou iniciativa', entidade: 'INI-010', detalhe: 'Assinatura eletrônica de documentos (proposta).' },
      { id: 'a3', quando: '2026-11-03T09:40:00', usuario: 'Bruno Teixeira', papel: 'po', acao: 'Registrou medição', entidade: 'INI-005', detalhe: 'Outubro/26: R$ 12.500 (estimado).' },
    ],
  };
}
