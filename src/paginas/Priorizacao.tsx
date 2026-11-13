import { useEffect, useRef, useState } from 'react';
import { CartesianGrid, Label, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from 'recharts';
import { Aviso, Barra, Cabecalho, Campo, Cartao, SeloFaixa, SeloScore } from '../componentes/comuns';
import { useLoja } from '../dados/loja';
import { necessidadeAberta } from '../dominio/indicadores';
import { calcularScore, CRITERIOS, explicarScore, impacto, NOME_CRITERIO, NOME_QUADRANTE, PESOS_PADRAO, quadrante, validarPesos } from '../dominio/priorizacao';
import { moeda } from '../dominio/rotulos';
import type { Pesos } from '../dominio/tipos';

export default function Priorizacao() {
  const { estado, pode, definirPesos } = useLoja();
  const [pesos, setPesos] = useState<Pesos>(estado.pesos);
  const [salvo, setSalvo] = useState(false);
  const [comparar, setComparar] = useState<string[]>([]);
  const v = validarPesos(pesos);
  const ativos = v.valido ? pesos : estado.pesos;

  const lista = estado.necessidades
    .filter(necessidadeAberta)
    .map((n) => ({ n, s: calcularScore(n.criterios, ativos), imp: impacto(n.criterios) }))
    .sort((a, b) => b.s - a.s);

  const pontos = lista.map((x) => ({ x: x.n.esforco, y: x.imp, z: x.s, nome: `${x.n.codigo} ${x.n.titulo}`, score: x.s }));
  const alterado = CRITERIOS.some((c) => pesos[c] !== estado.pesos[c]);

  // O Recharts marca cada ponto com role="img" sem nome; o gráfico inteiro já tem descrição.
  const grafico = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = grafico.current;
    if (!el) return;
    const limpar = () => el.querySelectorAll('[role="img"]').forEach((n) => n.removeAttribute('role'));
    limpar();
    const obs = new MutationObserver(limpar);
    obs.observe(el, { subtree: true, childList: true, attributes: true, attributeFilter: ['role'] });
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <Cabecalho titulo="Strategic Prioritization" subtitulo="Matriz ponderada de 0 a 100. A pontuação apoia a conversa; a decisão continua sendo da liderança." />

      <div className="grade-2">
        <Cartao titulo="Pesos dos critérios">
          <form
            className="pesos"
            onSubmit={(e) => {
              e.preventDefault();
              definirPesos(pesos);
              setSalvo(true);
            }}
          >
            {CRITERIOS.map((c) => (
              <Campo key={c} rotulo={NOME_CRITERIO[c]}>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={pesos[c]}
                  disabled={!pode('editar_pesos')}
                  onChange={(e) => { setSalvo(false); setPesos({ ...pesos, [c]: Number(e.target.value) }); }}
                />
              </Campo>
            ))}
            <p className={`soma ${v.valido ? '' : 'soma-erro'}`}>Soma: <strong>{v.soma}</strong> / 100</p>
            {!v.valido && <Aviso tom="erro">{v.erro} Enquanto isso, o ranking usa os pesos salvos.</Aviso>}
            {salvo && <Aviso tom="ok">Pesos salvos e registrados na trilha de auditoria.</Aviso>}
            {pode('editar_pesos') ? (
              <div className="form-acoes">
                <button type="button" className="botao botao-fantasma" onClick={() => { setPesos(PESOS_PADRAO); setSalvo(false); }}>Voltar ao padrão</button>
                <button type="submit" className="botao" disabled={!v.valido || !alterado}>Salvar pesos</button>
              </div>
            ) : (
              <p className="nota">Somente CEO e CIO/CTO alteram os pesos. Seu perfil pode simular, mas não salvar.</p>
            )}
          </form>
        </Cartao>

        <Cartao titulo="Matriz impacto × esforço">
          <div className="grafico" role="figure" aria-label="Gráfico de dispersão das necessidades abertas por impacto e esforço">
            <div ref={grafico}>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 24, left: 0 }}>
                <CartesianGrid stroke="#e4e8ef" />
                <XAxis type="number" dataKey="x" domain={[0.5, 5.5]} ticks={[1, 2, 3, 4, 5]} name="Esforço">
                  <Label value="Esforço" position="bottom" offset={4} />
                </XAxis>
                <YAxis type="number" dataKey="y" domain={[0.5, 5.5]} ticks={[1, 2, 3, 4, 5]} name="Impacto" width={40}>
                  <Label value="Impacto" angle={-90} position="insideLeft" />
                </YAxis>
                <ZAxis type="number" dataKey="z" range={[60, 400]} />
                <ReferenceLine x={3} stroke="#b9c3d4" strokeDasharray="4 4" />
                <ReferenceLine y={3} stroke="#b9c3d4" strokeDasharray="4 4" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    const p = payload?.[0]?.payload as (typeof pontos)[number] | undefined;
                    return p ? <div className="dica"><strong>{p.nome}</strong><br />Score {p.score} · impacto {p.y} · esforço {p.x}</div> : null;
                  }}
                />
                <Scatter
                  data={pontos}
                  shape={(props: { cx?: number; cy?: number; size?: number }) => (
                    <circle cx={props.cx} cy={props.cy} r={Math.sqrt((props.size ?? 64) / Math.PI)} fill="#2756d8" fillOpacity={0.75} />
                  )}
                />
              </ScatterChart>
            </ResponsiveContainer>
            </div>
          </div>
          <ul className="quadrantes">
            <li><strong>{NOME_QUADRANTE.ganho_rapido}</strong> alto impacto, esforço baixo</li>
            <li><strong>{NOME_QUADRANTE.projeto_estrategico}</strong> alto impacto, esforço alto</li>
            <li><strong>{NOME_QUADRANTE.preenchimento}</strong> baixo impacto, esforço baixo</li>
            <li><strong>{NOME_QUADRANTE.evitar}</strong> baixo impacto, esforço alto</li>
          </ul>
        </Cartao>
      </div>

      <Cartao titulo="Ranking das necessidades abertas" acoes={<span className="nota">Marque até 3 para comparar</span>}>
        <div className="tabela-rolagem" tabIndex={0}>
          <table className="tabela">
            <thead>
              <tr><th><span className="visualmente-oculto">Comparar</span></th><th>#</th><th>Necessidade</th><th>Quadrante</th><th className="num">Benefício estimado</th><th>Faixa</th><th className="num">Score</th></tr>
            </thead>
            <tbody>
              {lista.map(({ n, s, imp }, i) => (
                <tr key={n.id}>
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`Comparar ${n.codigo}`}
                      checked={comparar.includes(n.id)}
                      disabled={!comparar.includes(n.id) && comparar.length >= 3}
                      onChange={(e) => setComparar(e.target.checked ? [...comparar, n.id] : comparar.filter((x) => x !== n.id))}
                    />
                  </td>
                  <td>{i + 1}</td>
                  <td><a href={`#/necessidades/${n.id}`}><span className="codigo">{n.codigo}</span> {n.titulo}</a></td>
                  <td>{NOME_QUADRANTE[quadrante(imp, n.esforco)]}</td>
                  <td className="num">{moeda(n.beneficioAnualEstimado)}</td>
                  <td><SeloFaixa score={s} /></td>
                  <td className="num"><SeloScore score={s} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Cartao>

      {comparar.length >= 2 && (
        <Cartao titulo="Comparação">
          <div className="comparacao" style={{ gridTemplateColumns: `repeat(${comparar.length}, minmax(0, 1fr))` }}>
            {comparar.map((id) => {
              const n = estado.necessidades.find((x) => x.id === id)!;
              const s = calcularScore(n.criterios, ativos);
              return (
                <div key={id} className="comparacao-coluna">
                  <h3><span className="codigo">{n.codigo}</span> {n.titulo}</h3>
                  <p><SeloScore score={s} /> <SeloFaixa score={s} /></p>
                  <ul className="explicacao">
                    {explicarScore(n.criterios, ativos).map((p) => (
                      <li key={p.criterio}>
                        <span>{NOME_CRITERIO[p.criterio]} <em>nota {p.nota}</em></span>
                        <Barra valor={p.pontos} max={p.maximo} />
                        <strong>{p.pontos.toFixed(1)}</strong>
                      </li>
                    ))}
                  </ul>
                  <p className="nota">Esforço {n.esforco}/5 · {moeda(n.beneficioAnualEstimado)}/ano estimados</p>
                </div>
              );
            })}
          </div>
        </Cartao>
      )}
    </>
  );
}
