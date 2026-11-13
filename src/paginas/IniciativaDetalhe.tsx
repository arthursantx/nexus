import { useState } from 'react';
import { Aviso, Barra, Cabecalho, Campo, Cartao, Kpi, Modal, SeloRisco, SeloStatus, Vazio } from '../componentes/comuns';
import { MES_REFERENCIA } from '../dados/demonstracao';
import { useLoja } from '../dados/loja';
import { emRisco } from '../dominio/indicadores';
import { calcularScore } from '../dominio/priorizacao';
import { data, dataHora, mesAno, moeda, NOME_RISCO, NOME_STATUS_INICIATIVA, NOME_TIPO_DECISAO, percentual, STATUS_INICIATIVA } from '../dominio/rotulos';
import type { Risco, StatusIniciativa } from '../dominio/tipos';
import { desvioOrcamento, paybackMeses, resumoValor, roiProjetado } from '../dominio/valor';

export default function IniciativaDetalhe({ id }: { id: string }) {
  const { estado, pode, atualizarIniciativa, registrarMedicao } = useLoja();
  const i = estado.iniciativas.find((x) => x.id === id);
  const [editando, setEditando] = useState(false);
  const [medindo, setMedindo] = useState(false);
  if (!i) return <Vazio>Iniciativa não encontrada. <a href="#/portfolio">Voltar ao portfólio</a>.</Vazio>;

  const v = resumoValor(i, MES_REFERENCIA);
  const roi = roiProjetado(i.beneficioProjetadoAnual, i.orcamento);
  const pb = paybackMeses(i.orcamento, i.beneficioProjetadoAnual);
  const desvio = desvioOrcamento(i);
  const decisoes = estado.decisoes.filter((d) => d.iniciativaId === i.id).sort((a, b) => b.data.localeCompare(a.data));
  const necs = estado.necessidades.filter((n) => i.necessidadeIds.includes(n.id));

  return (
    <>
      <a href="#/portfolio" className="voltar">← Technology Portfolio</a>
      <Cabecalho
        titulo={`${i.codigo} · ${i.nome}`}
        subtitulo={`${estado.departamentos.find((d) => d.id === i.departamentoId)?.nome} · responsável ${i.responsavel} · ${data(i.inicio)} a ${data(i.fimPrevisto)}`}
        acoes={
          <>
            {pode('registrar_valor') && <button type="button" className="botao botao-fantasma" onClick={() => setMedindo(true)}>Registrar medição</button>}
            {pode('gerir_iniciativa') && <button type="button" className="botao" onClick={() => setEditando(true)}>Atualizar andamento</button>}
          </>
        }
      />
      {emRisco(i) && <Aviso tom="erro">Esta iniciativa está em risco: {i.risco === 'alto' ? 'risco declarado alto' : ''}{i.risco === 'alto' && desvio > 0.15 ? ' e ' : ''}{desvio > 0.15 ? `gasto ${Math.round(desvio * 100)} pontos à frente da entrega` : ''}.</Aviso>}

      <div className="kpis">
        <Kpi rotulo="Status" valor={NOME_STATUS_INICIATIVA[i.status]} detalhe={`${i.progresso}% concluída`} />
        <Kpi rotulo="Orçamento" valor={moeda(i.orcamento)} detalhe={`${moeda(i.custoRealizado)} realizados (${percentual(i.orcamento ? i.custoRealizado / i.orcamento : null)})`} tom={desvio > 0.15 ? 'alerta' : undefined} />
        <Kpi rotulo="ROI projetado (12 meses)" valor={percentual(roi)} detalhe={`Payback ${pb ? `${pb.toFixed(1)} meses` : '—'}`} />
        <Kpi rotulo="Benefício confirmado" valor={moeda(v.confirmado)} detalhe={v.realizacao !== null ? `${percentual(v.realizacao)} do projetado no período` : 'Ainda sem medição'} tom={v.realizacao !== null && v.realizacao >= 0.9 ? 'positivo' : undefined} />
      </div>

      <div className="grade-2">
        <Cartao titulo="Escopo">
          <p>{i.descricao}</p>
          <dl className="ficha">
            <div><dt>Status</dt><dd><SeloStatus status={i.status} /></dd></div>
            <div><dt>Risco</dt><dd><SeloRisco risco={i.risco} /></dd></div>
            <div><dt>Progresso</dt><dd className="celula-progresso"><Barra valor={i.progresso} /> {i.progresso}%</dd></div>
            <div><dt>Benefício projetado</dt><dd>{moeda(i.beneficioProjetadoAnual)}/ano</dd></div>
            <div><dt>Capacidade liberada</dt><dd>{i.horasEconomizadasMes} h/mês (não contabilizada como economia)</dd></div>
            <div><dt>Score de origem</dt><dd>{calcularScore(i.criterios, estado.pesos)}</dd></div>
            <div><dt>Necessidades atendidas</dt><dd>{necs.length ? necs.map((n) => <a key={n.id} href={`#/necessidades/${n.id}`}>{n.codigo} {n.titulo}</a>) : '—'}</dd></div>
          </dl>
        </Cartao>
        <Cartao titulo="Medições de valor">
          {i.medicoes.length ? (
            <table className="tabela">
              <thead><tr><th>Mês</th><th className="num">Valor</th><th>Situação</th><th>Fonte</th></tr></thead>
              <tbody>
                {i.medicoes.map((m) => (
                  <tr key={m.mes}><td>{mesAno(m.mes)}</td><td className="num">{moeda(m.valor)}</td><td>{m.confirmado ? <span className="selo selo-ok">Confirmado</span> : <span className="selo selo-pendente">Estimado</span>}</td><td>{m.fonte}</td></tr>
                ))}
              </tbody>
            </table>
          ) : (
            <Vazio>Nenhuma medição ainda. O benefício começa a ser medido quando a entrega entra em uso.</Vazio>
          )}
        </Cartao>
      </div>

      <div className="grade-2">
        <Cartao titulo="Decisões relacionadas" acoes={<a className="link" href="#/decisoes">Decision Log</a>}>
          {decisoes.length ? (
            <ul className="lista-simples">
              {decisoes.map((d) => <li key={d.id}><span className="codigo">{d.codigo}</span> {data(d.data)} · <strong>{NOME_TIPO_DECISAO[d.tipo]}</strong> · {d.titulo}</li>)}
            </ul>
          ) : (
            <Vazio>Nenhuma decisão registrada para esta iniciativa.</Vazio>
          )}
        </Cartao>
        <Cartao titulo="Histórico">
          <ol className="linha-historico">
            {i.historico.slice().reverse().map((h, k) => <li key={k}><time>{dataHora(h.quando)}</time> <strong>{h.autor}</strong> {h.descricao}</li>)}
          </ol>
        </Cartao>
      </div>

      <Modal titulo="Atualizar andamento" aberto={editando} onFechar={() => setEditando(false)}>
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            atualizarIniciativa(i.id, {
              status: f.get('status') as StatusIniciativa,
              progresso: Math.min(100, Math.max(0, Number(f.get('progresso')))),
              custoRealizado: Math.max(0, Number(f.get('custo'))),
              risco: f.get('risco') as Risco,
            });
            setEditando(false);
          }}
        >
          <div className="form-linha">
            <Campo rotulo="Status">
              <select name="status" defaultValue={i.status}>{STATUS_INICIATIVA.map((s) => <option key={s} value={s}>{NOME_STATUS_INICIATIVA[s]}</option>)}</select>
            </Campo>
            <Campo rotulo="Risco">
              <select name="risco" defaultValue={i.risco}>{(Object.keys(NOME_RISCO) as Risco[]).map((r) => <option key={r} value={r}>{NOME_RISCO[r]}</option>)}</select>
            </Campo>
          </div>
          <div className="form-linha">
            <Campo rotulo="Progresso (%)"><input name="progresso" type="number" min={0} max={100} defaultValue={i.progresso} /></Campo>
            <Campo rotulo="Custo realizado (R$)"><input name="custo" type="number" min={0} step="any" defaultValue={i.custoRealizado} /></Campo>
          </div>
          <div className="form-acoes">
            <button type="button" className="botao botao-fantasma" onClick={() => setEditando(false)}>Cancelar</button>
            <button type="submit" className="botao">Salvar</button>
          </div>
        </form>
      </Modal>

      <Modal titulo="Registrar medição de valor" aberto={medindo} onFechar={() => setMedindo(false)}>
        <FormMedicao onCancelar={() => setMedindo(false)} onSalvar={(m) => { registrarMedicao(i.id, m); setMedindo(false); }} />
      </Modal>
    </>
  );
}

function FormMedicao({ onCancelar, onSalvar }: { onCancelar: () => void; onSalvar: (m: { mes: string; valor: number; confirmado: boolean; fonte: string }) => void }) {
  const [erro, setErro] = useState('');
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const mes = String(f.get('mes'));
        const valor = Number(f.get('valor'));
        const fonte = String(f.get('fonte')).trim();
        if (!/^\d{4}-\d{2}$/.test(mes)) return setErro('Informe o mês.');
        if (!(valor >= 0)) return setErro('O valor não pode ser negativo.');
        if (!fonte) return setErro('Informe a fonte da medição.');
        onSalvar({ mes, valor, confirmado: f.get('confirmado') === 'sim', fonte });
      }}
    >
      <div className="form-linha">
        <Campo rotulo="Mês"><input name="mes" type="month" required /></Campo>
        <Campo rotulo="Benefício no mês (R$)"><input name="valor" type="number" min={0} step="any" required /></Campo>
      </div>
      <Campo rotulo="Fonte" ajuda="Quem mediu e como (ex.: Financeiro, relatório de custos)."><input name="fonte" required /></Campo>
      <Campo rotulo="Situação">
        <select name="confirmado"><option value="nao">Estimado (aguardando validação)</option><option value="sim">Confirmado pela área</option></select>
      </Campo>
      <Aviso>Registre aqui apenas ganhos em dinheiro. Horas economizadas aparecem como capacidade liberada e não são convertidas em economia.</Aviso>
      {erro && <Aviso tom="erro">{erro}</Aviso>}
      <div className="form-acoes">
        <button type="button" className="botao botao-fantasma" onClick={onCancelar}>Cancelar</button>
        <button type="submit" className="botao">Registrar</button>
      </div>
    </form>
  );
}
