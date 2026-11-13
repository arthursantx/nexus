import { describe, expect, it } from 'vitest';
import { estadoInicial, MES_REFERENCIA } from '../dados/demonstracao';
import { aplicarDecisao } from './decisoes';
import { AJUDA, ROTEIROS, TOUR } from './guia';
import { calcularIndicadores, emRisco, gerarDestaques } from './indicadores';
import { responder } from './intelligence';
import { calcularScore, explicarScore, faixaDoScore, impacto, PESOS_PADRAO, quadrante, validarPesos } from './priorizacao';
import { gerarCsv } from './relatorios';
import type { Iniciativa } from './tipos';
import { capacidadeLiberada, desvioOrcamento, mesesEntre, paybackMeses, resumoValor, roiProjetado } from './valor';

const todos = (n: number) => ({ alinhamento: n, financeiro: n, operacional: n, urgencia: n, viabilidade: n });

describe('priorização', () => {
  it('vai de 0 (todas as notas 1) a 100 (todas as notas 5)', () => {
    expect(calcularScore(todos(1))).toBe(0);
    expect(calcularScore(todos(5))).toBe(100);
    expect(calcularScore(todos(3))).toBe(50);
  });

  it('usa os pesos 25/25/20/15/15 por padrão', () => {
    // só alinhamento no máximo: vale o peso inteiro dele (25)
    expect(calcularScore({ alinhamento: 5, financeiro: 1, operacional: 1, urgencia: 1, viabilidade: 1 })).toBe(25);
    expect(calcularScore({ alinhamento: 1, financeiro: 1, operacional: 5, urgencia: 1, viabilidade: 1 })).toBe(20);
  });

  it('respeita pesos configurados', () => {
    const pesos = { alinhamento: 40, financeiro: 30, operacional: 10, urgencia: 10, viabilidade: 10 };
    expect(calcularScore({ alinhamento: 5, financeiro: 1, operacional: 1, urgencia: 1, viabilidade: 1 }, pesos)).toBe(40);
  });

  it('explica o score: a soma das contribuições é o próprio score', () => {
    const c = { alinhamento: 5, financeiro: 4, operacional: 3, urgencia: 2, viabilidade: 4 };
    const soma = explicarScore(c, PESOS_PADRAO).reduce((a, p) => a + p.pontos, 0);
    expect(Math.round(soma * 10) / 10).toBe(calcularScore(c));
  });

  it('classifica nas faixas 80+, 60–79, 40–59 e abaixo de 40', () => {
    expect(faixaDoScore(80)).toBe('critica');
    expect(faixaDoScore(79.9)).toBe('alta');
    expect(faixaDoScore(60)).toBe('alta');
    expect(faixaDoScore(59.9)).toBe('moderada');
    expect(faixaDoScore(40)).toBe('moderada');
    expect(faixaDoScore(39.9)).toBe('baixa');
  });

  it('exige pesos que somem 100', () => {
    expect(validarPesos(PESOS_PADRAO).valido).toBe(true);
    const r = validarPesos({ ...PESOS_PADRAO, alinhamento: 30 });
    expect(r.valido).toBe(false);
    expect(r.soma).toBe(105);
    expect(validarPesos({ ...PESOS_PADRAO, alinhamento: -5, financeiro: 55 }).valido).toBe(false);
    expect(() => calcularScore(todos(3), { ...PESOS_PADRAO, alinhamento: 30 })).toThrow(RangeError);
  });

  it('rejeita notas fora de 1 a 5', () => {
    expect(() => calcularScore({ ...todos(3), urgencia: 6 })).toThrow(RangeError);
    expect(() => calcularScore({ ...todos(3), urgencia: 0 })).toThrow(RangeError);
  });

  it('posiciona na matriz impacto × esforço', () => {
    expect(impacto({ ...todos(1), financeiro: 5, operacional: 4 })).toBe(4.5);
    expect(quadrante(4, 2)).toBe('ganho_rapido');
    expect(quadrante(4, 4)).toBe('projeto_estrategico');
    expect(quadrante(2, 2)).toBe('preenchimento');
    expect(quadrante(2, 4)).toBe('evitar');
  });
});

describe('ROI e valor', () => {
  it('calcula ROI projetado e payback', () => {
    expect(roiProjetado(300000, 100000)).toBe(2);
    expect(roiProjetado(50000, 100000)).toBe(-0.5);
    expect(roiProjetado(100000, 0)).toBeNull();
    expect(paybackMeses(120000, 240000)).toBe(6);
    expect(paybackMeses(120000, 0)).toBeNull();
  });

  it('conta meses inclusive', () => {
    expect(mesesEntre('2026-06', '2026-08')).toBe(3);
    expect(mesesEntre('2025-11', '2026-02')).toBe(4);
    expect(mesesEntre('2026-09', '2026-08')).toBe(0);
  });

  const base: Iniciativa = {
    id: 'x', organizacaoId: 'o', codigo: 'INI-900', nome: 'Teste', descricao: '', necessidadeIds: [], departamentoId: 'fin', responsavel: 'R',
    status: 'concluida', orcamento: 120000, custoRealizado: 100000, inicio: '2026-01-01', fimPrevisto: '2026-03-31', progresso: 100, risco: 'baixo',
    criterios: todos(3), esforco: 2, beneficioProjetadoAnual: 240000, inicioBeneficio: '2026-07', horasEconomizadasMes: 500, historico: [],
    medicoes: [
      { mes: '2026-07', valor: 20000, confirmado: true, fonte: 'F' },
      { mes: '2026-08', valor: 18000, confirmado: true, fonte: 'F' },
      { mes: '2026-09', valor: 22000, confirmado: false, fonte: 'F' },
      { mes: '2026-11', valor: 99999, confirmado: true, fonte: 'futuro' },
    ],
  };

  it('separa benefício confirmado de estimado e compara com o projetado no período', () => {
    const v = resumoValor(base, '2026-09');
    expect(v.projetadoNoPeriodo).toBe(60000); // 3 meses × 20 mil
    expect(v.confirmado).toBe(38000);
    expect(v.estimado).toBe(22000);
    expect(v.medido).toBe(60000);
    expect(v.realizacao).toBeCloseTo(38000 / 60000);
    expect(v.roiRealizado).toBeCloseTo((38000 - 100000) / 100000);
    expect(v.mesesMedidos).toBe(3); // ignora medição depois do mês de referência
  });

  it('não transforma horas economizadas em economia financeira', () => {
    const v = resumoValor({ ...base, horasEconomizadasMes: 10000 }, '2026-09');
    expect(v.confirmado).toBe(38000);
    expect(capacidadeLiberada(320)).toBe(2);
  });

  it('sem início de benefício, não há realização a calcular', () => {
    const v = resumoValor({ ...base, inicioBeneficio: undefined, medicoes: [] }, '2026-09');
    expect(v.realizacao).toBeNull();
    expect(v.projetadoNoPeriodo).toBe(0);
  });

  it('mede o desvio entre gasto e entrega', () => {
    expect(desvioOrcamento({ ...base, custoRealizado: 90000, progresso: 50 })).toBeCloseTo(0.25);
    expect(emRisco({ ...base, status: 'em_execucao', custoRealizado: 90000, progresso: 50 })).toBe(true);
    expect(emRisco({ ...base, status: 'concluida', custoRealizado: 90000, progresso: 50 })).toBe(false);
  });
});

describe('dados de demonstração', () => {
  const e = estadoInicial();

  it('tem o volume mínimo pedido e está marcado como demonstração', () => {
    expect(e.organizacao.demonstracao).toBe(true);
    expect(e.departamentos).toHaveLength(7);
    expect(e.necessidades.length).toBeGreaterThanOrEqual(12);
    expect(e.iniciativas.length).toBeGreaterThanOrEqual(8);
    expect(e.decisoes.length).toBeGreaterThanOrEqual(6);
    expect(new Set(e.decisoes.map((d) => d.tipo)).size).toBe(6);
    expect(new Set(e.iniciativas.map((i) => i.status)).size).toBe(8);
  });

  it('tem referências consistentes', () => {
    for (const n of e.necessidades) if (n.iniciativaId) expect(e.iniciativas.some((i) => i.id === n.iniciativaId)).toBe(true);
    for (const d of e.decisoes) {
      if (d.iniciativaId) expect(e.iniciativas.some((i) => i.id === d.iniciativaId)).toBe(true);
      if (d.necessidadeId) expect(e.necessidades.some((n) => n.id === d.necessidadeId)).toBe(true);
    }
    for (const x of [...e.necessidades, ...e.iniciativas]) expect(e.departamentos.some((d) => d.id === x.departamentoId)).toBe(true);
  });

  it('gera indicadores e destaques a partir dos dados', () => {
    const k = calcularIndicadores(e, MES_REFERENCIA);
    expect(k.necessidadesAbertas).toBe(6);
    expect(k.emRisco).toBeGreaterThanOrEqual(2);
    expect(k.beneficioConfirmado).toBe(31000 + 34000 + 35500 + 36000 + 34500 + 12000 + 11000 + 13000);
    const d = gerarDestaques(e, MES_REFERENCIA);
    expect(d.some((x) => x.texto.includes('INI-003'))).toBe(true);
    expect(d[0].tipo).toBe('alerta');
  });
});

describe('NEXUS Intelligence (modo demonstração)', () => {
  const e = estadoInicial();

  it('recomenda a necessidade aberta de maior score', () => {
    const r = responder('Quais necessidades devemos priorizar?', e, MES_REFERENCIA);
    expect(r.suficiente).toBe(true);
    expect(r.recomendacao).toContain('NEC-009');
    expect(r.dados?.length).toBe(3);
  });

  it('lista iniciativas em risco', () => {
    const r = responder('Quais iniciativas estão em risco?', e, MES_REFERENCIA);
    expect(r.dados?.some((x) => x.startsWith('INI-003'))).toBe(true);
  });

  it('responde sobre um código e avisa quando ele não existe', () => {
    expect(responder('resuma a ini-3', e, MES_REFERENCIA).dados?.[0]).toContain('Comercial');
    const r = responder('e a INI-777?', e, MES_REFERENCIA);
    expect(r.suficiente).toBe(false);
    expect(r.recomendacao).toContain('INI-777');
  });

  it('diz quando não há dados para responder', () => {
    const r = responder('Qual a previsão do tempo amanhã?', e, MES_REFERENCIA);
    expect(r.suficiente).toBe(false);
  });

  it('não soma horas economizadas como dinheiro na análise de valor', () => {
    const r = responder('As iniciativas estão entregando valor?', e, MES_REFERENCIA);
    expect(r.riscos).toContain('Horas economizadas');
  });
});

describe('CSV', () => {
  it('usa ponto e vírgula, vírgula decimal e escapa aspas', () => {
    const csv = gerarCsv(['a', 'b'], [['x;y', 1.5], ['diz "oi"', 2]]);
    expect(csv.startsWith('﻿')).toBe(true);
    expect(csv).toContain('"x;y";1,5');
    expect(csv).toContain('"diz ""oi""";2');
  });
});

describe('decisões executivas', () => {
  const e = estadoInicial();
  const ini = e.iniciativas.find((i) => i.status === 'em_execucao')!;
  const nec = e.necessidades.find((n) => n.status !== 'convertida')!;
  const base = { id: 'd-t', organizacaoId: e.organizacao.id, codigo: 'DEC-099', data: '2026-11-01', titulo: 'Teste', justificativa: 'Justificativa de teste', participantes: ['A'], responsavel: 'A', proximosPassos: 'x', prazo: '2026-12-01' };

  it('pausa muda o status da iniciativa e registra no histórico', () => {
    const n = aplicarDecisao(e, { ...base, tipo: 'pausa', iniciativaId: ini.id }, 'A', '2026-11-01T10:00:00Z');
    const i = n.iniciativas.find((x) => x.id === ini.id)!;
    expect(i.status).toBe('pausada');
    expect(i.historico.at(-1)?.descricao).toContain('DEC-099');
    expect(n.decisoes[0].codigo).toBe('DEC-099');
  });

  it('alteração de orçamento substitui o valor e exige novo orçamento', () => {
    const n = aplicarDecisao(e, { ...base, tipo: 'alteracao_orcamento', iniciativaId: ini.id, novoOrcamento: 999000 }, 'A', 'x');
    const i = n.iniciativas.find((x) => x.id === ini.id)!;
    expect(i.orcamento).toBe(999000);
    expect(i.status).toBe(ini.status);
    expect(() => aplicarDecisao(e, { ...base, tipo: 'alteracao_orcamento', iniciativaId: ini.id }, 'A', 'x')).toThrow();
  });

  it('rejeição recusa a necessidade vinculada', () => {
    const n = aplicarDecisao(e, { ...base, tipo: 'rejeicao', necessidadeId: nec.id }, 'A', 'x');
    expect(n.necessidades.find((x) => x.id === nec.id)!.status).toBe('recusada');
  });
});

describe('guia de uso', () => {
  const rotas = ['visao-geral', 'necessidades', 'priorizacao', 'portfolio', 'intelligence', 'decisoes', 'relatorios', 'valor', 'auditoria', 'guia'];
  it('tem ajuda para todas as telas do menu', () => {
    for (const r of rotas.filter((x) => x !== 'guia')) expect(AJUDA[r]?.passos.length).toBeGreaterThan(0);
  });
  it('tem roteiro para cada perfil, apontando para telas que existem', () => {
    for (const papel of ['ceo', 'cio', 'gerente_ti', 'po', 'ba', 'gestor_area'] as const) {
      expect(ROTEIROS[papel].passos.length).toBeGreaterThan(0);
      for (const p of ROTEIROS[papel].passos) expect(rotas).toContain(p.rota);
    }
    for (const p of TOUR) expect(rotas).toContain(p.rota);
  });
});

describe('perguntas em inglês', () => {
  const e = estadoInicial();
  it('entende perguntas em inglês sobre risco, orçamento, valor e área', () => {
    expect(responder('Which initiatives are at risk?', e, MES_REFERENCIA).suficiente).toBe(true);
    expect(responder('How is the budget for Finance?', e, MES_REFERENCIA).recomendacao).toContain('Financeiro');
    expect(responder('Are we delivering value?', e, MES_REFERENCIA).suficiente).toBe(true);
    expect(responder('What should we prioritize first?', e, MES_REFERENCIA).recomendacao).toMatch(/^Avançar primeiro/);
  });
});

describe('tradução', () => {
  it('traduz textos fixos e textos com números', async () => {
    const { DICIONARIO, PADROES } = await import('../i18n/en');
    const tr = (s: string): string | null => {
      if (s in DICIONARIO) return DICIONARIO[s];
      for (const [re, fn] of PADROES) { const m = s.match(re); if (m) { const r = fn(m, (x) => tr(x) ?? x); if (r !== null) return r; } }
      return null;
    };
    expect(tr('Iniciativas em risco')).toBe('Initiatives at risk');
    expect(tr('INI-003 Novo CRM comercial: 90,4% do orçamento consumido com 55% de progresso.')).toBe('INI-003 New sales CRM: 90,4% of budget consumed with 55% progress.');
    expect(tr('Decisão DEC-008: status Em execução → Pausada.')).toBe('Decision DEC-008: status In progress → Paused.');
  });
});
