import { AJUDA } from './dominio/guia';

export const MENU = [
  { rota: 'guia', nome: 'Comece aqui', icone: '?' },
  { rota: 'visao-geral', nome: 'Executive Overview', icone: '◧' },
  { rota: 'necessidades', nome: 'Business Needs', icone: '◇' },
  { rota: 'priorizacao', nome: 'Strategic Prioritization', icone: '△' },
  { rota: 'portfolio', nome: 'Technology Portfolio', icone: '▦' },
  { rota: 'intelligence', nome: 'NEXUS Intelligence', icone: '✦' },
  { rota: 'decisoes', nome: 'Executive Decisions', icone: '◉' },
  { rota: 'relatorios', nome: 'Reports & Insights', icone: '▤' },
  { rota: 'valor', nome: 'Value Tracking', icone: '↗' },
  { rota: 'auditoria', nome: 'Trilha de auditoria', icone: '≡' },
].map((m) => ({ ...m, dica: m.rota === 'guia' || m.rota === 'auditoria' ? '' : AJUDA[m.rota].nome }));

export const NOME_MODULO: Record<string, string> = Object.fromEntries(MENU.map((m) => [m.rota, m.nome]));
