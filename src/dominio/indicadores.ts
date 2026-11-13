import { calcularScore, faixaDoScore } from './priorizacao';
import { NOME_STATUS_INICIATIVA, moeda, percentual } from './rotulos';
import type { Estado, Iniciativa, Necessidade } from './tipos';
import { desvioOrcamento, resumoValor } from './valor';

const ATIVAS = new Set(['aprovada', 'em_planejamento', 'em_execucao', 'pausada']);

export interface Indicadores {
  necessidadesAbertas: number;
  necessidadesCriticasSemIniciativa: number;
  iniciativasAtivas: number;
  emExecucao: number;
  orcamentoAtivo: number;
  custoRealizado: number;
  beneficioProjetadoAnual: number;
  beneficioConfirmado: number;
  beneficioEstimado: number;
  realizacao: number | null;
  emRisco: number;
  horasMes: number;
  scoreMedio: number | null;
}

export function necessidadeAberta(n: Necessidade) {
  return n.status === 'nova' || n.status === 'em_analise' || n.status === 'priorizada';
}

/** Iniciativa em risco: risco alto declarado ou gasto mais de 15 pontos à frente da entrega. */
export function emRisco(ini: Iniciativa): boolean {
  if (!ATIVAS.has(ini.status)) return false;
  return ini.risco === 'alto' || desvioOrcamento(ini) > 0.15;
}

export function calcularIndicadores(e: Estado, mesReferencia: string): Indicadores {
  const abertas = e.necessidades.filter(necessidadeAberta);
  const ativas = e.iniciativas.filter((i) => ATIVAS.has(i.status));
  const contaveis = e.iniciativas.filter((i) => i.status !== 'cancelada' && i.status !== 'proposta');
  const valores = contaveis.map((i) => resumoValor(i, mesReferencia));
  const confirmado = valores.reduce((a, v) => a + v.confirmado, 0);
  const projetadoPeriodo = valores.reduce((a, v) => a + v.projetadoNoPeriodo, 0);
  const scores = abertas.map((n) => calcularScore(n.criterios, e.pesos));
  return {
    necessidadesAbertas: abertas.length,
    necessidadesCriticasSemIniciativa: abertas.filter((n) => faixaDoScore(calcularScore(n.criterios, e.pesos)) === 'critica').length,
    iniciativasAtivas: ativas.length,
    emExecucao: e.iniciativas.filter((i) => i.status === 'em_execucao').length,
    orcamentoAtivo: ativas.reduce((a, i) => a + i.orcamento, 0),
    custoRealizado: contaveis.reduce((a, i) => a + i.custoRealizado, 0),
    beneficioProjetadoAnual: contaveis.reduce((a, i) => a + i.beneficioProjetadoAnual, 0),
    beneficioConfirmado: confirmado,
    beneficioEstimado: valores.reduce((a, v) => a + v.estimado, 0),
    realizacao: projetadoPeriodo > 0 ? confirmado / projetadoPeriodo : null,
    emRisco: e.iniciativas.filter(emRisco).length,
    horasMes: contaveis.filter((i) => i.status === 'concluida' || i.status === 'em_execucao').reduce((a, i) => a + i.horasEconomizadasMes, 0),
    scoreMedio: scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : null,
  };
}

export interface Destaque {
  tipo: 'alerta' | 'atencao' | 'positivo';
  texto: string;
  link?: string;
}

/** Destaques executivos gerados apenas a partir dos dados cadastrados. */
export function gerarDestaques(e: Estado, mesReferencia: string): Destaque[] {
  const d: Destaque[] = [];
  for (const ini of e.iniciativas) {
    if (!ATIVAS.has(ini.status)) continue;
    const desvio = desvioOrcamento(ini);
    if (desvio > 0.15) {
      d.push({
        tipo: 'alerta',
        texto: `${ini.codigo} ${ini.nome}: ${percentual(ini.custoRealizado / ini.orcamento)} do orçamento consumido com ${ini.progresso}% de progresso.`,
        link: `#/portfolio/${ini.id}`,
      });
    } else if (ini.risco === 'alto') {
      d.push({ tipo: 'alerta', texto: `${ini.codigo} ${ini.nome} está com risco alto (${NOME_STATUS_INICIATIVA[ini.status].toLowerCase()}).`, link: `#/portfolio/${ini.id}` });
    }
  }
  const criticas = e.necessidades
    .filter(necessidadeAberta)
    .map((n) => ({ n, s: calcularScore(n.criterios, e.pesos) }))
    .filter((x) => x.s >= 80)
    .sort((a, b) => b.s - a.s);
  for (const { n, s } of criticas.slice(0, 2)) {
    d.push({ tipo: 'atencao', texto: `${n.codigo} ${n.titulo} tem score ${s} (crítico) e ainda não virou iniciativa.`, link: `#/necessidades/${n.id}` });
  }
  for (const ini of e.iniciativas) {
    const v = resumoValor(ini, mesReferencia);
    if (v.realizacao !== null && v.mesesMedidos >= 2) {
      if (v.realizacao >= 0.9) {
        d.push({ tipo: 'positivo', texto: `${ini.codigo} ${ini.nome} entregou ${percentual(v.realizacao)} do benefício projetado no período (${moeda(v.confirmado)} confirmados).`, link: `#/valor` });
      } else if (v.realizacao < 0.6) {
        d.push({ tipo: 'atencao', texto: `${ini.codigo} ${ini.nome} confirmou só ${percentual(v.realizacao)} do benefício projetado no período.`, link: `#/valor` });
      }
    }
  }
  const ordem = { alerta: 0, atencao: 1, positivo: 2 };
  return d.sort((a, b) => ordem[a.tipo] - ordem[b.tipo]);
}
