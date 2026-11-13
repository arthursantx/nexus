import { useState } from 'react';
import { Barra, Cabecalho, Cartao, SeloRisco, SeloStatus } from '../componentes/comuns';
import { useLoja } from '../dados/loja';
import { emRisco } from '../dominio/indicadores';
import { data, moeda, NOME_STATUS_INICIATIVA, percentual, STATUS_INICIATIVA } from '../dominio/rotulos';
import type { Iniciativa } from '../dominio/tipos';

type Visao = 'tabela' | 'cartoes' | 'linha';

export default function Portfolio() {
  const { estado } = useLoja();
  const [visao, setVisao] = useState<Visao>('tabela');
  const [area, setArea] = useState('');
  const lista = estado.iniciativas.filter((i) => !area || i.departamentoId === area);
  const dep = (id: string) => estado.departamentos.find((d) => d.id === id);

  return (
    <>
      <Cabecalho titulo="Technology Portfolio" subtitulo="Todas as iniciativas, do pedido aprovado ao benefício medido." />
      <div className="barra-ferramentas">
        <div className="segmentado" role="group" aria-label="Forma de visualização">
          {(['tabela', 'cartoes', 'linha'] as Visao[]).map((v) => (
            <button key={v} type="button" aria-pressed={visao === v} onClick={() => setVisao(v)}>
              {v === 'tabela' ? 'Tabela' : v === 'cartoes' ? 'Cartões' : 'Linha do tempo'}
            </button>
          ))}
        </div>
        <label className="campo campo-inline">
          <span>Área</span>
          <select value={area} onChange={(e) => setArea(e.target.value)}>
            <option value="">Todas</option>
            {estado.departamentos.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
          </select>
        </label>
      </div>

      {visao === 'tabela' && (
        <Cartao>
          <div className="tabela-rolagem" tabIndex={0}>
            <table className="tabela">
              <thead>
                <tr><th>Iniciativa</th><th>Área</th><th>Status</th><th>Progresso</th><th className="num">Orçamento</th><th className="num">Realizado</th><th>Risco</th><th>Fim previsto</th></tr>
              </thead>
              <tbody>
                {lista.map((i) => (
                  <tr key={i.id} className={emRisco(i) ? 'linha-alerta' : ''}>
                    <td><a href={`#/portfolio/${i.id}`}><span className="codigo">{i.codigo}</span> {i.nome}</a></td>
                    <td>{dep(i.departamentoId)?.sigla}</td>
                    <td><SeloStatus status={i.status} /></td>
                    <td className="celula-progresso"><Barra valor={i.progresso} /> {i.progresso}%</td>
                    <td className="num">{moeda(i.orcamento)}</td>
                    <td className="num">{moeda(i.custoRealizado)} <small>({percentual(i.orcamento ? i.custoRealizado / i.orcamento : null)})</small></td>
                    <td><SeloRisco risco={i.risco} /></td>
                    <td>{data(i.fimPrevisto)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Cartao>
      )}

      {visao === 'cartoes' && (
        <div className="quadro">
          {STATUS_INICIATIVA.map((s) => {
            const col = lista.filter((i) => i.status === s);
            return (
              <section key={s} className="quadro-coluna" aria-label={NOME_STATUS_INICIATIVA[s]}>
                <h2>{NOME_STATUS_INICIATIVA[s]} <span>{col.length}</span></h2>
                {col.map((i) => <CartaoIniciativa key={i.id} i={i} area={dep(i.departamentoId)?.nome ?? ''} />)}
              </section>
            );
          })}
        </div>
      )}

      {visao === 'linha' && <LinhaDoTempo lista={lista} />}
    </>
  );
}

function CartaoIniciativa({ i, area }: { i: Iniciativa; area: string }) {
  return (
    <a href={`#/portfolio/${i.id}`} className={`cartao-ini ${emRisco(i) ? 'cartao-ini-alerta' : ''}`}>
      <span className="codigo">{i.codigo}</span>
      <strong>{i.nome}</strong>
      <span className="nota">{area} · {i.responsavel}</span>
      <Barra valor={i.progresso} />
      <span className="cartao-ini-rodape">{moeda(i.orcamento)} <SeloRisco risco={i.risco} /></span>
    </a>
  );
}

function LinhaDoTempo({ lista }: { lista: Iniciativa[] }) {
  const validas = lista.filter((i) => i.status !== 'cancelada');
  if (!validas.length) return <Cartao><p className="vazio">Nada para mostrar.</p></Cartao>;
  const ini = Math.min(...validas.map((i) => Date.parse(i.inicio)));
  const fim = Math.max(...validas.map((i) => Date.parse(i.fimPrevisto)));
  const total = fim - ini;
  const pos = (d: string) => ((Date.parse(d) - ini) / total) * 100;
  const anos: number[] = [];
  for (let a = new Date(ini).getUTCFullYear(); a <= new Date(fim).getUTCFullYear(); a++) anos.push(a);
  const hoje = pos(new Date().toISOString().slice(0, 10));
  return (
    <Cartao>
      <div className="linha-tempo">
        <div className="linha-tempo-escala" aria-hidden="true">
          {anos.map((a) => {
            const p = pos(`${a}-01-01`);
            return p >= 0 && p <= 100 ? <span key={a} style={{ left: `${p}%` }}>{a}</span> : null;
          })}
        </div>
        {validas
          .slice()
          .sort((a, b) => a.inicio.localeCompare(b.inicio))
          .map((i) => (
            <div key={i.id} className="linha-tempo-linha">
              <a href={`#/portfolio/${i.id}`} className="linha-tempo-nome"><span className="codigo">{i.codigo}</span> {i.nome}</a>
              <div className="linha-tempo-trilho">
                <span
                  className={`linha-tempo-barra st-${i.status}`}
                  style={{ left: `${pos(i.inicio)}%`, width: `${Math.max(1.5, pos(i.fimPrevisto) - pos(i.inicio))}%` }}
                  title={`${data(i.inicio)} a ${data(i.fimPrevisto)} · ${NOME_STATUS_INICIATIVA[i.status]}`}
                >
                  <span className="visualmente-oculto">{data(i.inicio)} a {data(i.fimPrevisto)}, {NOME_STATUS_INICIATIVA[i.status]}</span>
                </span>
                {hoje >= 0 && hoje <= 100 && <span className="linha-tempo-hoje" style={{ left: `${hoje}%` }} aria-hidden="true" />}
              </div>
            </div>
          ))}
      </div>
      <p className="nota">A linha vertical marca a data de hoje.</p>
    </Cartao>
  );
}
