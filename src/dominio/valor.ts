import type { Iniciativa } from './tipos';

/** Diferença em meses entre dois meses AAAA-MM (inclusive): de 2026-06 a 2026-08 são 3 meses. */
export function mesesEntre(inicio: string, fim: string): number {
  const [ai, mi] = inicio.split('-').map(Number);
  const [af, mf] = fim.split('-').map(Number);
  return Math.max(0, (af - ai) * 12 + (mf - mi) + 1);
}

/**
 * ROI projetado em 12 meses: (benefício anual projetado − investimento) / investimento.
 * Retorna null quando não há investimento para dividir.
 */
export function roiProjetado(beneficioAnual: number, investimento: number): number | null {
  if (investimento <= 0) return null;
  return (beneficioAnual - investimento) / investimento;
}

/** Meses para recuperar o investimento com o benefício projetado. null quando não há benefício. */
export function paybackMeses(investimento: number, beneficioAnual: number): number | null {
  if (beneficioAnual <= 0) return null;
  return investimento / (beneficioAnual / 12);
}

export interface ResumoValor {
  projetadoNoPeriodo: number; // quanto deveria ter rendido desde o início do benefício
  medido: number; // tudo o que foi medido (estimado + confirmado)
  confirmado: number; // apenas o que a área validou
  estimado: number; // medido, mas ainda não validado
  realizacao: number | null; // confirmado / projetado no período
  roiRealizado: number | null; // (confirmado − custo realizado) / custo realizado
  mesesMedidos: number;
}

/**
 * Compara o benefício projetado com o que foi medido até `mesReferencia`.
 * Horas economizadas NÃO entram aqui: liberam capacidade da equipe, mas só viram economia
 * financeira se houver redução de custo comprovada, e então devem ser registradas como medição.
 */
export function resumoValor(ini: Iniciativa, mesReferencia: string): ResumoValor {
  const medicoes = ini.medicoes.filter((m) => m.mes <= mesReferencia);
  const confirmado = medicoes.filter((m) => m.confirmado).reduce((a, m) => a + m.valor, 0);
  const medido = medicoes.reduce((a, m) => a + m.valor, 0);
  const meses = ini.inicioBeneficio ? mesesEntre(ini.inicioBeneficio, mesReferencia) : 0;
  const projetadoNoPeriodo = (ini.beneficioProjetadoAnual / 12) * meses;
  return {
    projetadoNoPeriodo,
    medido,
    confirmado,
    estimado: medido - confirmado,
    realizacao: projetadoNoPeriodo > 0 ? confirmado / projetadoNoPeriodo : null,
    roiRealizado: ini.custoRealizado > 0 ? (confirmado - ini.custoRealizado) / ini.custoRealizado : null,
    mesesMedidos: medicoes.length,
  };
}

/** Consumo do orçamento comparado ao progresso: positivo quando o gasto está à frente da entrega. */
export function desvioOrcamento(ini: Iniciativa): number {
  if (ini.orcamento <= 0) return 0;
  return ini.custoRealizado / ini.orcamento - ini.progresso / 100;
}

/** Horas por mês convertidas em capacidade equivalente (pessoas em tempo integral, 160 h/mês). */
export function capacidadeLiberada(horasMes: number): number {
  return horasMes / 160;
}
