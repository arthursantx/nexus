import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Cabecalho, Cartao, Kpi } from '../componentes/comuns';
import { MES_REFERENCIA } from '../dados/demonstracao';
import { useLoja } from '../dados/loja';
import { mesAno, moeda, moedaCurta, numero, percentual } from '../dominio/rotulos';
import { capacidadeLiberada, paybackMeses, resumoValor, roiProjetado } from '../dominio/valor';

export default function Valor() {
  const { estado } = useLoja();
  const comMedicao = estado.iniciativas.filter((i) => i.inicioBeneficio);
  const [sel, setSel] = useState(comMedicao[0]?.id ?? '');
  const linhas = estado.iniciativas
    .filter((i) => i.status !== 'cancelada' && i.status !== 'proposta')
    .map((i) => ({ i, v: resumoValor(i, MES_REFERENCIA) }));

  const grafico = linhas
    .filter((x) => x.v.projetadoNoPeriodo > 0)
    .map((x) => ({ nome: x.i.codigo, titulo: x.i.nome, Projetado: Math.round(x.v.projetadoNoPeriodo), Confirmado: x.v.confirmado, Estimado: x.v.estimado }));

  const escolhida = estado.iniciativas.find((i) => i.id === sel);
  const mensal = escolhida
    ? escolhida.medicoes.map((m) => ({ mes: mesAno(m.mes), Projetado: Math.round(escolhida.beneficioProjetadoAnual / 12), Medido: m.valor, situacao: m.confirmado ? 'confirmado' : 'estimado' }))
    : [];

  const confirmado = linhas.reduce((a, x) => a + x.v.confirmado, 0);
  const estimado = linhas.reduce((a, x) => a + x.v.estimado, 0);
  const projetado = linhas.reduce((a, x) => a + x.v.projetadoNoPeriodo, 0);
  const horas = linhas.filter((x) => x.i.status === 'concluida').reduce((a, x) => a + x.i.horasEconomizadasMes, 0);

  return (
    <>
      <Cabecalho titulo="Value Tracking" subtitulo={`O benefício prometido foi entregue? Medições até ${mesAno(MES_REFERENCIA)}.`} />
      <div className="kpis">
        <Kpi rotulo="Projetado no período" valor={moedaCurta(projetado)} detalhe="desde o início do benefício de cada iniciativa" />
        <Kpi rotulo="Confirmado" valor={moedaCurta(confirmado)} tom="positivo" detalhe={`${percentual(projetado ? confirmado / projetado : null)} do projetado`} />
        <Kpi rotulo="Estimado" valor={moedaCurta(estimado)} detalhe="medido, aguardando validação" />
        <Kpi rotulo="Capacidade liberada" valor={`${numero(horas)} h/mês`} detalhe={`≈ ${numero(capacidadeLiberada(horas))} pessoas em tempo integral`} />
      </div>
      <p className="faixa-modo">
        <strong>Como contamos o valor.</strong> Benefício <em>confirmado</em> é o validado pela área (por exemplo, pelo financeiro). <em>Estimado</em> é o medido e ainda não validado.
        Horas economizadas liberam a equipe para outras tarefas, mas só viram economia se houver redução de custo comprovada; por isso aparecem separadas.
      </p>

      <div className="grade-2">
        <Cartao titulo="Projetado × confirmado por iniciativa">
          <div className="grafico" role="img" aria-label="Gráfico de barras comparando benefício projetado, confirmado e estimado por iniciativa">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={grafico} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e8ef" />
                <XAxis dataKey="nome" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(v) => moedaCurta(v)} width={70} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v: number) => moeda(v)} labelFormatter={(l) => grafico.find((g) => g.nome === l)?.titulo ?? l} />
                <Legend />
                <Bar dataKey="Projetado" fill="#c3cddf" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Confirmado" stackId="m" fill="#1f8a5b" />
                <Bar dataKey="Estimado" stackId="m" fill="#e0a526" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Cartao>
        <Cartao
          titulo="Evolução mensal"
          acoes={
            <label className="campo campo-inline">
              <span className="visualmente-oculto">Iniciativa</span>
              <select value={sel} onChange={(e) => setSel(e.target.value)}>
                {comMedicao.map((i) => <option key={i.id} value={i.id}>{i.codigo} {i.nome}</option>)}
              </select>
            </label>
          }
        >
          <div className="grafico" role="img" aria-label="Gráfico de linhas com benefício projetado e medido por mês">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={mensal} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e8ef" />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(v) => moedaCurta(v)} width={70} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v: number, n, p) => [moeda(v), n === 'Medido' ? `Medido (${p.payload.situacao})` : n]} />
                <Legend />
                <Line dataKey="Projetado" stroke="#8a95a8" strokeDasharray="5 5" dot={false} />
                <Line dataKey="Medido" stroke="#2756d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Cartao>
      </div>

      <Cartao titulo="Retorno por iniciativa">
        <div className="tabela-rolagem" tabIndex={0}>
          <table className="tabela">
            <thead>
              <tr><th>Iniciativa</th><th className="num">Investimento</th><th className="num">Benefício/ano projetado</th><th className="num">ROI projetado</th><th className="num">Payback</th><th className="num">Confirmado</th><th className="num">Realização</th><th className="num">ROI realizado</th></tr>
            </thead>
            <tbody>
              {linhas.map(({ i, v }) => {
                const pb = paybackMeses(i.orcamento, i.beneficioProjetadoAnual);
                return (
                  <tr key={i.id}>
                    <td><a href={`#/portfolio/${i.id}`}><span className="codigo">{i.codigo}</span> {i.nome}</a></td>
                    <td className="num">{moeda(i.orcamento)}</td>
                    <td className="num">{moeda(i.beneficioProjetadoAnual)}</td>
                    <td className="num">{percentual(roiProjetado(i.beneficioProjetadoAnual, i.orcamento))}</td>
                    <td className="num">{pb ? `${pb.toFixed(1)} meses` : '—'}</td>
                    <td className="num">{v.mesesMedidos ? moeda(v.confirmado) : '—'}</td>
                    <td className="num">{percentual(v.realizacao)}</td>
                    <td className="num">{v.mesesMedidos ? percentual(v.roiRealizado) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="nota">ROI projetado = (benefício anual − investimento) ÷ investimento. ROI realizado = (benefício confirmado − custo realizado) ÷ custo realizado, acumulado até {mesAno(MES_REFERENCIA)}.</p>
      </Cartao>
    </>
  );
}
