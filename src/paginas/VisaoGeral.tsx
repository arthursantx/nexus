import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Cabecalho, Cartao, Kpi, SeloScore, SeloStatus } from '../componentes/comuns';
import { MES_REFERENCIA } from '../dados/demonstracao';
import { useLoja } from '../dados/loja';
import { calcularIndicadores, gerarDestaques, necessidadeAberta } from '../dominio/indicadores';
import { calcularScore } from '../dominio/priorizacao';
import { mesAno, moeda, moedaCurta, numero, percentual, STATUS_INICIATIVA } from '../dominio/rotulos';
import { capacidadeLiberada } from '../dominio/valor';

export default function VisaoGeral() {
  const { estado } = useLoja();
  const k = calcularIndicadores(estado, MES_REFERENCIA);
  const destaques = gerarDestaques(estado, MES_REFERENCIA);

  const porArea = estado.departamentos
    .map((d) => {
      const lst = estado.iniciativas.filter((i) => i.departamentoId === d.id && i.status !== 'cancelada' && i.status !== 'proposta');
      return { area: d.sigla, nome: d.nome, Orçado: lst.reduce((a, i) => a + i.orcamento, 0), Realizado: lst.reduce((a, i) => a + i.custoRealizado, 0) };
    })
    .filter((x) => x.Orçado > 0);

  const topNecessidades = estado.necessidades
    .filter(necessidadeAberta)
    .map((n) => ({ n, s: calcularScore(n.criterios, estado.pesos) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 5);

  return (
    <>
      <Cabecalho titulo="Executive Overview" subtitulo={`Indicadores calculados a partir dos dados cadastrados · valores até ${mesAno(MES_REFERENCIA)}`} />

      <div className="kpis">
        <Kpi rotulo="Necessidades abertas" valor={String(k.necessidadesAbertas)} detalhe={`${k.necessidadesCriticasSemIniciativa} com prioridade crítica`} />
        <Kpi rotulo="Iniciativas ativas" valor={String(k.iniciativasAtivas)} detalhe={`${k.emExecucao} em execução`} />
        <Kpi rotulo="Orçamento ativo" valor={moedaCurta(k.orcamentoAtivo)} detalhe={`${moedaCurta(k.custoRealizado)} realizados no total`} />
        <Kpi rotulo="Iniciativas em risco" valor={String(k.emRisco)} tom={k.emRisco ? 'alerta' : undefined} detalhe="Risco alto ou gasto à frente da entrega" />
        <Kpi rotulo="Benefício projetado" valor={moedaCurta(k.beneficioProjetadoAnual)} detalhe="por ano, iniciativas aprovadas" />
        <Kpi rotulo="Benefício confirmado" valor={moedaCurta(k.beneficioConfirmado)} tom="positivo" detalhe={`${percentual(k.realizacao)} do projetado no período`} />
        <Kpi rotulo="Benefício estimado" valor={moedaCurta(k.beneficioEstimado)} detalhe="medido, aguardando validação" />
        <Kpi rotulo="Capacidade liberada" valor={`${numero(k.horasMes)} h/mês`} detalhe={`≈ ${numero(capacidadeLiberada(k.horasMes))} pessoas · não é economia financeira`} />
      </div>

      <div className="grade-2">
        <Cartao titulo="Executive Highlights">
          {destaques.length ? (
            <ul className="destaques">
              {destaques.map((d, i) => (
                <li key={i} className={`destaque destaque-${d.tipo}`}>
                  <span className="destaque-marca" aria-hidden="true" />
                  {d.link ? <a href={d.link}>{d.texto}</a> : d.texto}
                </li>
              ))}
            </ul>
          ) : (
            <p className="vazio">Sem destaques no momento.</p>
          )}
        </Cartao>

        <Cartao titulo="Orçamento por área">
          <div className="grafico" role="img" aria-label="Gráfico de barras com orçamento e custo realizado por área">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={porArea} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e8ef" />
                <XAxis dataKey="area" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(v) => moedaCurta(v)} tickLine={false} axisLine={false} width={70} />
                <Tooltip formatter={(v: number) => moeda(v)} labelFormatter={(l) => porArea.find((x) => x.area === l)?.nome ?? l} />
                <Legend />
                <Bar dataKey="Orçado" fill="#2756d8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Realizado" fill="#8eadff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Cartao>
      </div>

      <div className="grade-2">
        <Cartao titulo="Prioridades em aberto" acoes={<a href="#/priorizacao" className="link">Ver priorização</a>}>
          <table className="tabela">
            <thead>
              <tr><th>Necessidade</th><th>Área</th><th className="num">Score</th></tr>
            </thead>
            <tbody>
              {topNecessidades.map(({ n, s }) => (
                <tr key={n.id}>
                  <td><a href={`#/necessidades/${n.id}`}><span className="codigo">{n.codigo}</span> {n.titulo}</a></td>
                  <td>{estado.departamentos.find((d) => d.id === n.departamentoId)?.sigla}</td>
                  <td className="num"><SeloScore score={s} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Cartao>

        <Cartao titulo="Portfólio por status" acoes={<a href="#/portfolio" className="link">Ver portfólio</a>}>
          <ul className="status-lista">
            {STATUS_INICIATIVA.map((s) => {
              const n = estado.iniciativas.filter((i) => i.status === s).length;
              return (
                <li key={s}>
                  <SeloStatus status={s} />
                  <span className="status-contagem">{n}</span>
                </li>
              );
            })}
          </ul>
        </Cartao>
      </div>
    </>
  );
}
