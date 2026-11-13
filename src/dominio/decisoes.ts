import { moeda, NOME_STATUS_INICIATIVA, NOME_STATUS_NECESSIDADE } from './rotulos';
import type { Decisao, Estado, Iniciativa, Necessidade, StatusIniciativa, StatusNecessidade, TipoDecisao } from './tipos';

/** Efeito de cada tipo de decisão sobre a iniciativa vinculada. Repriorização e alteração de orçamento não mudam o status. */
const STATUS_INICIATIVA_APOS: Partial<Record<TipoDecisao, StatusIniciativa>> = {
  aprovacao: 'aprovada',
  rejeicao: 'cancelada',
  pausa: 'pausada',
  encerramento: 'concluida',
};

/** Efeito sobre a necessidade vinculada (quando ela ainda não virou iniciativa). */
const STATUS_NECESSIDADE_APOS: Partial<Record<TipoDecisao, StatusNecessidade>> = {
  aprovacao: 'priorizada',
  rejeicao: 'recusada',
};

/**
 * Aplica a decisão aos registros vinculados e devolve o novo estado, com o motivo no histórico de cada um.
 * Alteração de orçamento exige `novoOrcamento` maior que zero e uma iniciativa vinculada.
 */
export function aplicarDecisao(e: Estado, d: Decisao, autor: string, quando: string): Estado {
  if (d.tipo === 'alteracao_orcamento') {
    if (!d.iniciativaId) throw new RangeError('Alteração de orçamento precisa de uma iniciativa vinculada.');
    if (!(typeof d.novoOrcamento === 'number' && d.novoOrcamento > 0)) throw new RangeError('Informe o novo orçamento (maior que zero).');
  }
  const iniciativas = e.iniciativas.map((i): Iniciativa => {
    if (i.id !== d.iniciativaId) return i;
    const status = STATUS_INICIATIVA_APOS[d.tipo] ?? i.status;
    const orcamento = d.tipo === 'alteracao_orcamento' ? d.novoOrcamento! : i.orcamento;
    const mudancas: string[] = [];
    if (status !== i.status) mudancas.push(`status ${NOME_STATUS_INICIATIVA[i.status]} → ${NOME_STATUS_INICIATIVA[status]}`);
    if (orcamento !== i.orcamento) mudancas.push(`orçamento ${moeda(i.orcamento)} → ${moeda(orcamento)}`);
    const descricao = `Decisão ${d.codigo}${mudancas.length ? `: ${mudancas.join('; ')}` : ' registrada'}.`;
    return { ...i, status, orcamento, progresso: status === 'concluida' ? 100 : i.progresso, historico: [...i.historico, { quando, autor, descricao }] };
  });
  const necessidades = e.necessidades.map((n): Necessidade => {
    if (n.id !== d.necessidadeId) return n;
    const novo = n.status === 'convertida' ? undefined : STATUS_NECESSIDADE_APOS[d.tipo];
    const status = novo ?? n.status;
    const descricao = `Decisão ${d.codigo}${status !== n.status ? `: status ${NOME_STATUS_NECESSIDADE[n.status]} → ${NOME_STATUS_NECESSIDADE[status]}` : ' registrada'}.`;
    return { ...n, status, historico: [...n.historico, { quando, autor, descricao }] };
  });
  return { ...e, decisoes: [d, ...e.decisoes], iniciativas, necessidades };
}
