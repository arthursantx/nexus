import { useState } from 'react';
import { Cabecalho, Campo, Cartao, Vazio } from '../componentes/comuns';
import { MES_REFERENCIA } from '../dados/demonstracao';
import { useLoja } from '../dados/loja';
import { calcularScore, faixaDoScore, NOME_FAIXA } from '../dominio/priorizacao';
import { gerarCsv } from '../dominio/relatorios';
import { data, moeda, NOME_CATEGORIA, NOME_RISCO, NOME_STATUS_INICIATIVA, NOME_STATUS_NECESSIDADE, NOME_TIPO_DECISAO, percentual } from '../dominio/rotulos';
import { resumoValor } from '../dominio/valor';

type Tipo = 'necessidades' | 'iniciativas' | 'decisoes';

export default function Relatorios() {
  const { estado } = useLoja();
  const [tipo, setTipo] = useState<Tipo>('iniciativas');
  const [area, setArea] = useState('');
  const [de, setDe] = useState('2026-01-01');
  const [ate, setAte] = useState('2026-12-31');
  const dep = (id: string) => estado.departamentos.find((d) => d.id === id)?.nome ?? '';
  const noPeriodo = (d: string) => d >= de && d <= ate;

  let cabecalho: string[] = [];
  let linhas: (string | number)[][] = [];
  if (tipo === 'necessidades') {
    cabecalho = ['Código', 'Título', 'Área', 'Categoria', 'Status', 'Aberta em', 'Benefício estimado (R$)', 'Score', 'Faixa'];
    linhas = estado.necessidades
      .filter((n) => (!area || n.departamentoId === area) && noPeriodo(n.criadaEm))
      .map((n) => {
        const s = calcularScore(n.criterios, estado.pesos);
        return [n.codigo, n.titulo, dep(n.departamentoId), NOME_CATEGORIA[n.categoria], NOME_STATUS_NECESSIDADE[n.status], data(n.criadaEm), n.beneficioAnualEstimado, s, NOME_FAIXA[faixaDoScore(s)]];
      });
  } else if (tipo === 'iniciativas') {
    cabecalho = ['Código', 'Iniciativa', 'Área', 'Status', 'Progresso (%)', 'Orçamento (R$)', 'Realizado (R$)', 'Risco', 'Benefício projetado/ano (R$)', 'Benefício confirmado (R$)', 'Realização'];
    linhas = estado.iniciativas
      .filter((i) => (!area || i.departamentoId === area) && i.inicio <= ate && i.fimPrevisto >= de)
      .map((i) => {
        const v = resumoValor(i, MES_REFERENCIA);
        return [i.codigo, i.nome, dep(i.departamentoId), NOME_STATUS_INICIATIVA[i.status], i.progresso, i.orcamento, i.custoRealizado, NOME_RISCO[i.risco], i.beneficioProjetadoAnual, v.confirmado, percentual(v.realizacao)];
      });
  } else {
    cabecalho = ['Código', 'Data', 'Tipo', 'Título', 'Responsável', 'Próximo passo', 'Prazo'];
    linhas = estado.decisoes
      .filter((d) => noPeriodo(d.data))
      .filter((d) => !area || estado.iniciativas.find((i) => i.id === d.iniciativaId)?.departamentoId === area || estado.necessidades.find((n) => n.id === d.necessidadeId)?.departamentoId === area)
      .sort((a, b) => a.data.localeCompare(b.data))
      .map((d) => [d.codigo, data(d.data), NOME_TIPO_DECISAO[d.tipo], d.titulo, d.responsavel, d.proximosPassos, data(d.prazo)]);
  }

  const exportarCsv = () => {
    const blob = new Blob([gerarCsv(cabecalho, linhas)], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `nexus-${tipo}-${de}-a-${ate}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const ehMoeda = (c: string) => c.includes('(R$)');

  return (
    <>
      <Cabecalho
        titulo="Reports & Insights"
        subtitulo="Relatórios por período e área, prontos para exportar."
        acoes={
          <>
            <button type="button" className="botao botao-fantasma" onClick={() => window.print()} title="Abre a impressão do navegador; escolha “Salvar como PDF”.">Exportar PDF</button>
            <button type="button" className="botao" onClick={exportarCsv} disabled={!linhas.length}>Exportar CSV</button>
          </>
        }
      />
      <Cartao className="sem-impressao">
        <div className="filtros">
          <Campo rotulo="Relatório">
            <select value={tipo} onChange={(e) => setTipo(e.target.value as Tipo)}>
              <option value="iniciativas">Portfólio de iniciativas</option>
              <option value="necessidades">Necessidades de negócio</option>
              <option value="decisoes">Decisões executivas</option>
            </select>
          </Campo>
          <Campo rotulo="Área">
            <select value={area} onChange={(e) => setArea(e.target.value)}>
              <option value="">Todas</option>
              {estado.departamentos.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
            </select>
          </Campo>
          <Campo rotulo="De"><input type="date" value={de} onChange={(e) => setDe(e.target.value)} /></Campo>
          <Campo rotulo="Até"><input type="date" value={ate} onChange={(e) => setAte(e.target.value)} /></Campo>
        </div>
      </Cartao>
      <Cartao titulo={`${estado.organizacao.nome} · ${tipo === 'iniciativas' ? 'Portfólio de iniciativas' : tipo === 'necessidades' ? 'Necessidades de negócio' : 'Decisões executivas'} · ${data(de)} a ${data(ate)}${area ? ` · ${dep(area)}` : ''}`}>
        {linhas.length ? (
          <div className="tabela-rolagem" tabIndex={0}>
            <table className="tabela tabela-relatorio">
              <thead><tr>{cabecalho.map((c) => <th key={c} className={ehMoeda(c) ? 'num' : ''}>{c}</th>)}</tr></thead>
              <tbody>
                {linhas.map((l, i) => (
                  <tr key={i}>{l.map((v, j) => <td key={j} className={ehMoeda(cabecalho[j]) ? 'num' : ''}>{ehMoeda(cabecalho[j]) && typeof v === 'number' ? moeda(v) : v}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Vazio>Nenhum registro no período e área escolhidos.</Vazio>
        )}
        <p className="nota">{linhas.length} registro(s). Dados de demonstração da empresa fictícia {estado.organizacao.nome}.</p>
      </Cartao>
    </>
  );
}
