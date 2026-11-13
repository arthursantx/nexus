import { aplicarDecisao } from '../dominio/decisoes';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { validarPesos } from '../dominio/priorizacao';
import { NOME_STATUS_INICIATIVA, NOME_TIPO_DECISAO, pode, type Permissao } from '../dominio/rotulos';
import type { Criterios, Decisao, Estado, Iniciativa, MedicaoValor, Necessidade, Pesos, Risco, StatusIniciativa, StatusNecessidade, Usuario } from '../dominio/tipos';
import { estadoInicial, ORG, VERSAO_DADOS } from './demonstracao';

/*
 * Camada de dados da fase 1: o estado fica no navegador (localStorage), separado por organização.
 * As operações abaixo são as mesmas que a API da fase 2 vai expor; trocar a persistência não muda as telas.
 */

const CHAVE = `nexus:${ORG}:v${VERSAO_DADOS}`;
const CHAVE_SESSAO = `nexus:${ORG}:usuario`;

function carregar(): Estado {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (bruto) {
      const e = JSON.parse(bruto) as Estado;
      if (e.versao === VERSAO_DADOS) return e;
    }
  } catch {
    /* armazenamento indisponível: segue com os dados de demonstração */
  }
  return estadoInicial();
}

function salvar(e: Estado) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(e));
  } catch {
    /* navegação privada: os dados valem só nesta visita */
  }
}

export class ErroPermissao extends Error {}

export interface NovaNecessidade {
  titulo: string;
  descricao: string;
  departamentoId: string;
  categoria: Necessidade['categoria'];
  beneficioAnualEstimado: number;
  horasEconomizadasMes: number;
}

export interface Conversao {
  nome: string;
  responsavel: string;
  orcamento: number;
  beneficioProjetadoAnual: number;
  inicio: string;
  fimPrevisto: string;
}

export interface AtualizacaoIniciativa {
  status: StatusIniciativa;
  progresso: number;
  custoRealizado: number;
  risco: Risco;
}

interface Loja {
  estado: Estado;
  usuario: Usuario | null;
  entrar(id: string): void;
  sair(): void;
  pode(p: Permissao): boolean;
  criarNecessidade(d: NovaNecessidade): Necessidade;
  avaliarNecessidade(id: string, criterios: Criterios, esforco: number, status: StatusNecessidade): void;
  converter(necessidadeId: string, d: Conversao): Iniciativa;
  atualizarIniciativa(id: string, d: AtualizacaoIniciativa): void;
  registrarMedicao(iniciativaId: string, m: MedicaoValor): void;
  registrarDecisao(d: Omit<Decisao, 'id' | 'organizacaoId' | 'codigo'>): Decisao;
  definirPesos(p: Pesos): void;
  restaurar(): void;
}

const Contexto = createContext<Loja | null>(null);

const proximoCodigo = (prefixo: string, codigos: string[]) =>
  `${prefixo}-${String(codigos.reduce((max, c) => Math.max(max, Number(c.split('-')[1]) || 0), 0) + 1).padStart(3, '0')}`;

const agora = () => new Date().toISOString();
const hoje = () => new Date().toISOString().slice(0, 10);

export function ProvedorLoja({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>(carregar);
  const [usuarioId, setUsuarioId] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(CHAVE_SESSAO);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    salvar(estado);
  }, [estado]);
  useEffect(() => {
    try {
      if (usuarioId) sessionStorage.setItem(CHAVE_SESSAO, usuarioId);
      else sessionStorage.removeItem(CHAVE_SESSAO);
    } catch {
      /* ignora */
    }
  }, [usuarioId]);

  const usuario = estado.usuarios.find((u) => u.id === usuarioId) ?? null;

  const loja = useMemo<Loja>(() => {
    const exigir = (p: Permissao) => {
      if (!usuario || !pode(usuario.papel, p)) throw new ErroPermissao('Seu perfil não tem permissão para esta ação.');
    };
    /** Aplica a mudança e registra a trilha de auditoria. */
    const mudar = (fn: (e: Estado) => Estado, acao: string, entidade: string, detalhe: string) =>
      setEstado((e) => {
        const novo = fn(e);
        const registro = { id: `a${Date.now()}${Math.random().toString(36).slice(2, 6)}`, quando: agora(), usuario: usuario!.nome, papel: usuario!.papel, acao, entidade, detalhe };
        return { ...novo, auditoria: [registro, ...novo.auditoria] };
      });

    return {
      estado,
      usuario,
      entrar: (id) => setUsuarioId(id),
      sair: () => setUsuarioId(null),
      pode: (p) => !!usuario && pode(usuario.papel, p),

      criarNecessidade(d) {
        exigir('registrar_necessidade');
        const n: Necessidade = {
          ...d,
          id: `nec-${Date.now()}`,
          organizacaoId: estado.organizacao.id,
          codigo: proximoCodigo('NEC', estado.necessidades.map((x) => x.codigo)),
          solicitante: usuario!.nome,
          status: 'nova',
          criterios: { alinhamento: 3, financeiro: 3, operacional: 3, urgencia: 3, viabilidade: 3 },
          esforco: 3,
          criadaEm: hoje(),
          historico: [{ quando: agora(), autor: usuario!.nome, descricao: 'Necessidade registrada.' }],
        };
        mudar((e) => ({ ...e, necessidades: [n, ...e.necessidades] }), 'Registrou necessidade', n.codigo, n.titulo);
        return n;
      },

      avaliarNecessidade(id, criterios, esforco, status) {
        exigir('avaliar_necessidade');
        const n = estado.necessidades.find((x) => x.id === id)!;
        mudar(
          (e) => ({
            ...e,
            necessidades: e.necessidades.map((x) =>
              x.id === id ? { ...x, criterios, esforco, status, historico: [...x.historico, { quando: agora(), autor: usuario!.nome, descricao: 'Critérios e status atualizados.' }] } : x,
            ),
          }),
          'Avaliou necessidade',
          n.codigo,
          `Status: ${status}; esforço ${esforco}.`,
        );
      },

      converter(necessidadeId, d) {
        exigir('gerir_iniciativa');
        const n = estado.necessidades.find((x) => x.id === necessidadeId)!;
        const nova: Iniciativa = {
          id: `ini-${Date.now()}`,
          organizacaoId: estado.organizacao.id,
          codigo: proximoCodigo('INI', estado.iniciativas.map((x) => x.codigo)),
          nome: d.nome,
          descricao: n.descricao,
          necessidadeIds: [n.id],
          departamentoId: n.departamentoId,
          responsavel: d.responsavel,
          status: 'proposta',
          orcamento: d.orcamento,
          custoRealizado: 0,
          inicio: d.inicio,
          fimPrevisto: d.fimPrevisto,
          progresso: 0,
          risco: 'medio',
          criterios: n.criterios,
          esforco: n.esforco,
          beneficioProjetadoAnual: d.beneficioProjetadoAnual,
          medicoes: [],
          horasEconomizadasMes: n.horasEconomizadasMes,
          historico: [{ quando: agora(), autor: usuario!.nome, descricao: `Criada a partir de ${n.codigo}.` }],
        };
        mudar(
          (e) => ({
            ...e,
            iniciativas: [nova, ...e.iniciativas],
            necessidades: e.necessidades.map((x) =>
              x.id === necessidadeId
                ? { ...x, status: 'convertida', iniciativaId: nova.id, historico: [...x.historico, { quando: agora(), autor: usuario!.nome, descricao: `Convertida na iniciativa ${nova.codigo}.` }] }
                : x,
            ),
          }),
          'Converteu necessidade em iniciativa',
          `${n.codigo} → ${nova.codigo}`,
          d.nome,
        );
        return nova;
      },

      atualizarIniciativa(id, d) {
        exigir('gerir_iniciativa');
        const i = estado.iniciativas.find((x) => x.id === id)!;
        mudar(
          (e) => ({
            ...e,
            iniciativas: e.iniciativas.map((x) =>
              x.id === id ? { ...x, ...d, historico: [...x.historico, { quando: agora(), autor: usuario!.nome, descricao: `Atualizada: ${NOME_STATUS_INICIATIVA[d.status]}, ${d.progresso}%.` }] } : x,
            ),
          }),
          'Atualizou iniciativa',
          i.codigo,
          `${NOME_STATUS_INICIATIVA[d.status]}, ${d.progresso}% concluída, realizado R$ ${d.custoRealizado}.`,
        );
      },

      registrarMedicao(iniciativaId, med) {
        exigir('registrar_valor');
        const i = estado.iniciativas.find((x) => x.id === iniciativaId)!;
        mudar(
          (e) => ({
            ...e,
            iniciativas: e.iniciativas.map((x) =>
              x.id === iniciativaId
                ? { ...x, inicioBeneficio: x.inicioBeneficio ?? med.mes, medicoes: [...x.medicoes.filter((y) => y.mes !== med.mes), med].sort((a, b) => a.mes.localeCompare(b.mes)) }
                : x,
            ),
          }),
          'Registrou medição',
          i.codigo,
          `${med.mes}: R$ ${med.valor} (${med.confirmado ? 'confirmado' : 'estimado'}).`,
        );
      },

      registrarDecisao(d) {
        exigir('registrar_decisao');
        const nova: Decisao = { ...d, id: `dec-${Date.now()}`, organizacaoId: estado.organizacao.id, codigo: proximoCodigo('DEC', estado.decisoes.map((x) => x.codigo)) };
        aplicarDecisao(estado, nova, usuario!.nome, agora()); // valida antes de gravar
        mudar((e) => aplicarDecisao(e, nova, usuario!.nome, agora()), 'Registrou decisão', nova.codigo, `${NOME_TIPO_DECISAO[nova.tipo]}: ${nova.titulo}`);
        return nova;
      },

      definirPesos(p) {
        exigir('editar_pesos');
        const v = validarPesos(p);
        if (!v.valido) throw new RangeError(v.erro);
        mudar((e) => ({ ...e, pesos: p }), 'Alterou pesos da priorização', 'Matriz', Object.values(p).join(' / '));
      },

      restaurar() {
        setEstado(estadoInicial());
      },
    };
  }, [estado, usuario]);

  return <Contexto.Provider value={loja}>{children}</Contexto.Provider>;
}

export function useLoja(): Loja {
  const l = useContext(Contexto);
  if (!l) throw new Error('useLoja fora do ProvedorLoja');
  return l;
}
