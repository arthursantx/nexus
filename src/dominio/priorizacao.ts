import type { Criterio, Criterios, Pesos } from './tipos';

export const CRITERIOS: Criterio[] = ['alinhamento', 'financeiro', 'operacional', 'urgencia', 'viabilidade'];

export const NOME_CRITERIO: Record<Criterio, string> = {
  alinhamento: 'Alinhamento estratégico',
  financeiro: 'Impacto financeiro',
  operacional: 'Impacto operacional',
  urgencia: 'Urgência',
  viabilidade: 'Viabilidade',
};

export const PESOS_PADRAO: Pesos = { alinhamento: 25, financeiro: 25, operacional: 20, urgencia: 15, viabilidade: 15 };

export type Faixa = 'critica' | 'alta' | 'moderada' | 'baixa';

export const NOME_FAIXA: Record<Faixa, string> = {
  critica: 'Prioridade crítica',
  alta: 'Prioridade alta',
  moderada: 'Prioridade moderada',
  baixa: 'Prioridade baixa',
};

/** Os pesos são válidos quando todos são inteiros de 0 a 100 e somam exatamente 100. */
export function validarPesos(pesos: Pesos): { valido: boolean; soma: number; erro?: string } {
  const valores = CRITERIOS.map((c) => pesos[c]);
  const soma = valores.reduce((a, b) => a + b, 0);
  if (valores.some((v) => !Number.isInteger(v) || v < 0 || v > 100)) {
    return { valido: false, soma, erro: 'Cada peso deve ser um número inteiro entre 0 e 100.' };
  }
  if (soma !== 100) return { valido: false, soma, erro: `Os pesos somam ${soma}; a soma precisa ser 100.` };
  return { valido: true, soma };
}

function validarNota(nota: number, criterio: Criterio) {
  if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
    throw new RangeError(`Nota de "${criterio}" deve ser um inteiro de 1 a 5 (recebido: ${nota}).`);
  }
}

export interface Contribuicao {
  criterio: Criterio;
  nota: number;
  peso: number;
  pontos: number; // pontos obtidos neste critério
  maximo: number; // pontos possíveis (igual ao peso)
}

/**
 * Cada critério contribui com (nota − 1) / 4 do seu peso.
 * Nota 1 vale 0 ponto e nota 5 vale o peso inteiro, então o score vai de 0 a 100.
 */
export function explicarScore(criterios: Criterios, pesos: Pesos): Contribuicao[] {
  const v = validarPesos(pesos);
  if (!v.valido) throw new RangeError(v.erro);
  return CRITERIOS.map((c) => {
    validarNota(criterios[c], c);
    const pontos = ((criterios[c] - 1) / 4) * pesos[c];
    return { criterio: c, nota: criterios[c], peso: pesos[c], pontos, maximo: pesos[c] };
  });
}

export function calcularScore(criterios: Criterios, pesos: Pesos = PESOS_PADRAO): number {
  const total = explicarScore(criterios, pesos).reduce((a, c) => a + c.pontos, 0);
  return Math.round(total * 10) / 10;
}

export function faixaDoScore(score: number): Faixa {
  if (score >= 80) return 'critica';
  if (score >= 60) return 'alta';
  if (score >= 40) return 'moderada';
  return 'baixa';
}

/** Impacto (eixo Y da matriz) = média de financeiro e operacional, de 1 a 5. */
export function impacto(criterios: Criterios): number {
  return (criterios.financeiro + criterios.operacional) / 2;
}

export type Quadrante = 'ganho_rapido' | 'projeto_estrategico' | 'preenchimento' | 'evitar';

export const NOME_QUADRANTE: Record<Quadrante, string> = {
  ganho_rapido: 'Ganho rápido',
  projeto_estrategico: 'Projeto estratégico',
  preenchimento: 'Baixa prioridade',
  evitar: 'Reavaliar',
};

/** Quadrante da matriz impacto × esforço. O corte é o meio da escala (3). */
export function quadrante(impactoValor: number, esforco: number): Quadrante {
  const alto = impactoValor >= 3;
  const facil = esforco < 3;
  if (alto && facil) return 'ganho_rapido';
  if (alto) return 'projeto_estrategico';
  if (facil) return 'preenchimento';
  return 'evitar';
}

/** Explicação em texto do score, usada na tela de priorização e pelo NEXUS Intelligence. */
export function textoExplicacao(criterios: Criterios, pesos: Pesos): string {
  const partes = explicarScore(criterios, pesos)
    .slice()
    .sort((a, b) => b.pontos - a.pontos)
    .map((c) => `${NOME_CRITERIO[c.criterio]} nota ${c.nota} (${c.pontos.toFixed(1)} de ${c.maximo})`);
  return partes.join('; ');
}
