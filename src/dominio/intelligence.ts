/**
 * NEXUS Intelligence — modo demonstração.
 *
 * Responde perguntas usando SOMENTE os dados cadastrados na plataforma, com regras determinísticas.
 * Não chama nenhum modelo de IA externo: na fase 2, a integração com um modelo de linguagem roda no
 * servidor (a chave fica em variável de ambiente, nunca no navegador) e recebe estes mesmos dados como contexto.
 */
import { emRisco, necessidadeAberta } from './indicadores';
import { calcularScore, faixaDoScore, NOME_FAIXA, textoExplicacao } from './priorizacao';
import { moeda, NOME_RISCO, NOME_STATUS_INICIATIVA, NOME_STATUS_NECESSIDADE, NOME_TIPO_DECISAO, data, percentual } from './rotulos';
import type { Estado, Iniciativa, Necessidade } from './tipos';
import { desvioOrcamento, paybackMeses, resumoValor, roiProjetado } from './valor';

export interface Resposta {
  suficiente: boolean;
  recomendacao: string;
  justificativa?: string;
  dados?: string[];
  impacto?: string;
  riscos?: string;
  proximaAcao?: string;
}

const SUGESTOES =
  'Posso responder sobre prioridades, riscos do portfólio, orçamento por área, valor entregue, decisões recentes, uma área específica (ex.: "Financeiro") ou um código (ex.: "INI-003" ou "NEC-005").';

export const PERGUNTAS_EXEMPLO = [
  'Quais necessidades devemos priorizar agora?',
  'Quais iniciativas estão em risco?',
  'Como está o orçamento por área?',
  'As iniciativas estão entregando o valor prometido?',
  'Resuma a situação da INI-003',
  'Quais foram as últimas decisões da diretoria?',
];

function normalizar(t: string) {
  return t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function insuficiente(motivo: string): Resposta {
  return { suficiente: false, recomendacao: `${motivo} ${SUGESTOES}` };
}

/** Nomes alternativos das áreas, para perguntas em inglês. */
const APELIDOS: Record<string, string[]> = {
  fin: ['finance', 'financial'],
  com: ['sales', 'commercial'],
  ops: ['operations'],
  rh: ['human resources', 'hr '],
  jur: ['legal'],
  atd: ['customer service', 'support'],
  ti: ['technology', ' it '],
};

export function responder(pergunta: string, e: Estado, mesReferencia: string): Resposta {
  const q = normalizar(pergunta);
  if (!q.trim()) return insuficiente('Escreva uma pergunta.');

  const codigo = q.match(/\b(ini|nec|dec)-?(\d{1,3})\b/);
  if (codigo) {
    const cod = `${codigo[1].toUpperCase()}-${codigo[2].padStart(3, '0')}`;
    const ini = e.iniciativas.find((i) => i.codigo === cod);
    if (ini) return sobreIniciativa(ini, e, mesReferencia);
    const nec = e.necessidades.find((n) => n.codigo === cod);
    if (nec) return sobreNecessidade(nec, e);
    return insuficiente(`Não existe nenhum registro com o código ${cod} na base.`);
  }

  const depto = e.departamentos.find(
    (d) => q.includes(normalizar(d.nome)) || new RegExp(`\\b${normalizar(d.sigla)}\\b`).test(q) || (APELIDOS[d.id] ?? []).some((a) => q.includes(a)),
  );

  if (/(prioriz|prioridade|primeiro|comecar|proximo passo|o que fazer|priorit|first|start|next step|what should)/.test(q)) return prioridades(e, depto?.id);
  if (/(risco|atras|estour|problema|preocup|alerta|risk|late|delay|overrun|problem|alert|concern)/.test(q)) return riscos(e);
  if (/(orcamento|custo|invest|gasto|budget|cost|spend)/.test(q)) return orcamento(e, depto?.id);
  if (/(valor|retorno|roi|beneficio|economia|entreg|value|return|benefit|saving|deliver)/.test(q)) return valor(e, mesReferencia);
  if (/(decis|decid|aprov|approv)/.test(q)) return decisoes(e);
  if (depto) return area(e, depto.id);
  return insuficiente('Não encontrei nos dados do NEXUS informação para responder a essa pergunta.');
}

function prioridades(e: Estado, departamentoId?: string): Resposta {
  const lista = e.necessidades
    .filter(necessidadeAberta)
    .filter((n) => !departamentoId || n.departamentoId === departamentoId)
    .map((n) => ({ n, s: calcularScore(n.criterios, e.pesos) }))
    .sort((a, b) => b.s - a.s);
  if (!lista.length) return insuficiente('Não há necessidades abertas para priorizar com esse filtro.');
  const top = lista.slice(0, 3);
  const [p] = top;
  return {
    suficiente: true,
    recomendacao: `Avançar primeiro com ${p.n.codigo} ${p.n.titulo} (score ${p.s}, ${NOME_FAIXA[faixaDoScore(p.s)].toLowerCase()}).`,
    justificativa: `Pela matriz com os pesos atuais, o score se compõe assim: ${textoExplicacao(p.n.criterios, e.pesos)}.`,
    dados: top.map((x) => `${x.n.codigo} ${x.n.titulo}: score ${x.s}, benefício estimado ${moeda(x.n.beneficioAnualEstimado)}/ano, esforço ${x.n.esforco}/5`),
    impacto: `As três primeiras somam ${moeda(top.reduce((a, x) => a + x.n.beneficioAnualEstimado, 0))} de benefício anual estimado pelas áreas (ainda não validado).`,
    riscos: 'O benefício informado na abertura é uma estimativa da área solicitante; precisa ser revisado antes da aprovação.',
    proximaAcao: `Converter ${p.n.codigo} em iniciativa e levar à próxima reunião de portfólio com orçamento e responsável definidos.`,
  };
}

function riscos(e: Estado): Resposta {
  const lista = e.iniciativas.filter(emRisco);
  if (!lista.length) {
    return { suficiente: true, recomendacao: 'Nenhuma iniciativa ativa está em risco pelos critérios atuais (risco alto ou gasto mais de 15 pontos à frente da entrega).' };
  }
  const pior = lista.slice().sort((a, b) => desvioOrcamento(b) - desvioOrcamento(a))[0];
  return {
    suficiente: true,
    recomendacao: `Revisar primeiro ${pior.codigo} ${pior.nome}.`,
    justificativa: 'Uma iniciativa entra nesta lista quando o risco declarado é alto ou quando o orçamento consumido está mais de 15 pontos percentuais à frente do progresso.',
    dados: lista.map(
      (i) => `${i.codigo} ${i.nome}: ${percentual(i.custoRealizado / i.orcamento)} do orçamento usado, ${i.progresso}% concluída, risco ${NOME_RISCO[i.risco].toLowerCase()}, fim previsto ${data(i.fimPrevisto)}`,
    ),
    impacto: `${lista.length} iniciativa(s) somando ${moeda(lista.reduce((a, i) => a + i.orcamento, 0))} de orçamento.`,
    riscos: 'Sem revisão, o padrão é estourar orçamento ou prazo e atrasar o benefício projetado.',
    proximaAcao: `Pedir ao responsável (${pior.responsavel}) um replanejamento e registrar a decisão no Decision Log.`,
  };
}

function orcamento(e: Estado, departamentoId?: string): Resposta {
  const ativas = e.iniciativas.filter((i) => i.status !== 'cancelada' && i.status !== 'proposta' && (!departamentoId || i.departamentoId === departamentoId));
  if (!ativas.length) return insuficiente('Não há iniciativas com orçamento para esse filtro.');
  const porArea = e.departamentos
    .map((d) => {
      const lst = ativas.filter((i) => i.departamentoId === d.id);
      return { d, orc: lst.reduce((a, i) => a + i.orcamento, 0), gasto: lst.reduce((a, i) => a + i.custoRealizado, 0) };
    })
    .filter((x) => x.orc > 0)
    .sort((a, b) => b.orc - a.orc);
  const total = porArea.reduce((a, x) => a + x.orc, 0);
  const gasto = porArea.reduce((a, x) => a + x.gasto, 0);
  return {
    suficiente: true,
    recomendacao: `${porArea[0].d.nome} concentra ${percentual(porArea[0].orc / total)} do orçamento de tecnologia em andamento.`,
    dados: porArea.map((x) => `${x.d.nome}: ${moeda(x.orc)} orçados, ${moeda(x.gasto)} realizados (${percentual(x.gasto / x.orc)})`),
    impacto: `Total orçado: ${moeda(total)}. Total realizado: ${moeda(gasto)}.`,
    riscos: 'O orçamento considera iniciativas aprovadas, em planejamento, em execução, pausadas e concluídas; propostas não entram.',
    proximaAcao: 'Comparar a distribuição com as prioridades estratégicas do ano na próxima revisão de portfólio.',
  };
}

function valor(e: Estado, mes: string): Resposta {
  const com = e.iniciativas.map((i) => ({ i, v: resumoValor(i, mes) })).filter((x) => x.v.realizacao !== null);
  if (!com.length) return insuficiente('Ainda não há iniciativas com benefício em medição.');
  const confirmado = com.reduce((a, x) => a + x.v.confirmado, 0);
  const projetado = com.reduce((a, x) => a + x.v.projetadoNoPeriodo, 0);
  const baixo = com.filter((x) => (x.v.realizacao ?? 0) < 0.6);
  return {
    suficiente: true,
    recomendacao:
      baixo.length > 0
        ? `Investigar ${baixo.map((x) => x.i.codigo).join(', ')}: estão abaixo de 60% do benefício projetado.`
        : 'As iniciativas em medição estão próximas do benefício projetado; manter o acompanhamento mensal.',
    justificativa: 'Só conta como entregue o benefício confirmado pela área responsável. Valores medidos e ainda não validados aparecem separados.',
    dados: com.map((x) => `${x.i.codigo} ${x.i.nome}: ${moeda(x.v.confirmado)} confirmados de ${moeda(x.v.projetadoNoPeriodo)} projetados (${percentual(x.v.realizacao)})`),
    impacto: `Realização total: ${percentual(confirmado / projetado)} (${moeda(confirmado)} de ${moeda(projetado)}).`,
    riscos: 'Horas economizadas não foram somadas como economia financeira: só viram dinheiro se houver redução de custo comprovada.',
    proximaAcao: 'Pedir às áreas a validação das medições pendentes até o fechamento do mês.',
  };
}

function decisoes(e: Estado): Resposta {
  const ult = e.decisoes.slice().sort((a, b) => b.data.localeCompare(a.data)).slice(0, 4);
  if (!ult.length) return insuficiente('Não há decisões registradas.');
  return {
    suficiente: true,
    recomendacao: `A decisão mais recente foi "${ult[0].titulo}" (${NOME_TIPO_DECISAO[ult[0].tipo].toLowerCase()}, ${data(ult[0].data)}).`,
    dados: ult.map((d) => `${d.codigo} · ${data(d.data)} · ${NOME_TIPO_DECISAO[d.tipo]}: ${d.titulo}`),
    proximaAcao: `Acompanhar o próximo passo da ${ult[0].codigo}: ${ult[0].proximosPassos} (prazo ${data(ult[0].prazo)}).`,
  };
}

function area(e: Estado, depId: string): Resposta {
  const d = e.departamentos.find((x) => x.id === depId)!;
  const necs = e.necessidades.filter((n) => n.departamentoId === depId);
  const inis = e.iniciativas.filter((i) => i.departamentoId === depId);
  if (!necs.length && !inis.length) return insuficiente(`Não há registros da área ${d.nome}.`);
  const abertas = necs.filter(necessidadeAberta);
  return {
    suficiente: true,
    recomendacao: abertas.length ? `A área ${d.nome} tem ${abertas.length} necessidade(s) aberta(s); a de maior score é ${top(abertas, e)}.` : `A área ${d.nome} não tem necessidades abertas.`,
    dados: [
      ...inis.map((i) => `${i.codigo} ${i.nome}: ${NOME_STATUS_INICIATIVA[i.status].toLowerCase()}, ${i.progresso}% concluída`),
      ...abertas.map((n) => `${n.codigo} ${n.titulo}: ${NOME_STATUS_NECESSIDADE[n.status].toLowerCase()}, score ${calcularScore(n.criterios, e.pesos)}`),
    ],
    impacto: `Orçamento da área em iniciativas: ${moeda(inis.filter((i) => i.status !== 'cancelada').reduce((a, i) => a + i.orcamento, 0))}.`,
  };
}

function top(lista: Necessidade[], e: Estado) {
  const m = lista.map((n) => ({ n, s: calcularScore(n.criterios, e.pesos) })).sort((a, b) => b.s - a.s)[0];
  return `${m.n.codigo} ${m.n.titulo} (score ${m.s})`;
}

function sobreIniciativa(i: Iniciativa, e: Estado, mes: string): Resposta {
  const v = resumoValor(i, mes);
  const roi = roiProjetado(i.beneficioProjetadoAnual, i.orcamento);
  const pb = paybackMeses(i.orcamento, i.beneficioProjetadoAnual);
  const desvio = desvioOrcamento(i);
  const dep = e.departamentos.find((d) => d.id === i.departamentoId)?.nome;
  return {
    suficiente: true,
    recomendacao:
      emRisco(i)
        ? `${i.codigo} precisa de revisão: o gasto está à frente da entrega ou o risco é alto.`
        : `${i.codigo} segue dentro do esperado; manter o acompanhamento.`,
    justificativa: `${NOME_STATUS_INICIATIVA[i.status]}, ${i.progresso}% concluída, ${percentual(i.orcamento ? i.custoRealizado / i.orcamento : null)} do orçamento usado (desvio de ${(desvio * 100).toFixed(0)} pontos).`,
    dados: [
      `Área: ${dep}. Responsável: ${i.responsavel}.`,
      `Orçamento ${moeda(i.orcamento)}; realizado ${moeda(i.custoRealizado)}.`,
      `Benefício projetado ${moeda(i.beneficioProjetadoAnual)}/ano; ROI projetado em 12 meses ${percentual(roi)}; payback ${pb ? pb.toFixed(1) + ' meses' : '—'}.`,
      v.realizacao !== null ? `Benefício confirmado ${moeda(v.confirmado)} de ${moeda(v.projetadoNoPeriodo)} projetados no período (${percentual(v.realizacao)}).` : 'Benefício ainda não está em medição.',
    ],
    impacto: i.horasEconomizadasMes ? `Libera cerca de ${i.horasEconomizadasMes} horas/mês de equipe (capacidade, não economia financeira).` : undefined,
    riscos: `Risco declarado: ${NOME_RISCO[i.risco].toLowerCase()}. Fim previsto: ${data(i.fimPrevisto)}.`,
    proximaAcao: emRisco(i) ? `Registrar uma decisão (repriorização, ajuste de orçamento ou pausa) após conversar com ${i.responsavel}.` : 'Atualizar progresso e medições no fechamento do mês.',
  };
}

function sobreNecessidade(n: Necessidade, e: Estado): Resposta {
  const s = calcularScore(n.criterios, e.pesos);
  return {
    suficiente: true,
    recomendacao:
      n.status === 'convertida'
        ? `${n.codigo} já virou iniciativa; acompanhe pelo portfólio.`
        : `${n.codigo} está com ${NOME_FAIXA[faixaDoScore(s)].toLowerCase()} (score ${s}).`,
    justificativa: textoExplicacao(n.criterios, e.pesos),
    dados: [`Status: ${NOME_STATUS_NECESSIDADE[n.status]}.`, `Benefício estimado pela área: ${moeda(n.beneficioAnualEstimado)}/ano.`, `Esforço estimado: ${n.esforco}/5.`],
    proximaAcao: n.status === 'convertida' ? undefined : 'Validar a estimativa de benefício com o financeiro antes de converter.',
  };
}
