/** Geração de CSV (separador ";" e BOM para abrir corretamente no Excel em português). */
export function gerarCsv(cabecalho: string[], linhas: (string | number)[][]): string {
  const escapar = (v: string | number) => {
    const t = typeof v === 'number' ? String(v).replace('.', ',') : v;
    return /[;"\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
  };
  return '﻿' + [cabecalho, ...linhas].map((l) => l.map(escapar).join(';')).join('\r\n');
}
