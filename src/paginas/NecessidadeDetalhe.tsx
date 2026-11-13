import { useState } from 'react';
import { Aviso, Barra, Cabecalho, Campo, Cartao, Modal, SeloFaixa, SeloNecessidade, SeloScore, Vazio } from '../componentes/comuns';
import { useLoja } from '../dados/loja';
import { calcularScore, CRITERIOS, explicarScore, impacto, NOME_CRITERIO, NOME_QUADRANTE, quadrante } from '../dominio/priorizacao';
import { data, dataHora, moeda, NOME_CATEGORIA, NOME_STATUS_NECESSIDADE } from '../dominio/rotulos';
import type { Criterios, StatusNecessidade } from '../dominio/tipos';

export default function NecessidadeDetalhe({ id }: { id: string }) {
  const { estado, pode, avaliarNecessidade, converter } = useLoja();
  const n = estado.necessidades.find((x) => x.id === id);
  const [avaliando, setAvaliando] = useState(false);
  const [convertendo, setConvertendo] = useState(false);
  if (!n) return <Vazio>Necessidade não encontrada. <a href="#/necessidades">Voltar para a lista</a>.</Vazio>;

  const score = calcularScore(n.criterios, estado.pesos);
  const partes = explicarScore(n.criterios, estado.pesos);
  const dep = estado.departamentos.find((d) => d.id === n.departamentoId);
  const ini = estado.iniciativas.find((i) => i.id === n.iniciativaId);
  const podeConverter = pode('gerir_iniciativa') && !n.iniciativaId && n.status !== 'recusada';

  return (
    <>
      <a href="#/necessidades" className="voltar">← Business Needs</a>
      <Cabecalho
        titulo={`${n.codigo} · ${n.titulo}`}
        subtitulo={`${dep?.nome} · ${NOME_CATEGORIA[n.categoria]} · aberta por ${n.solicitante} em ${data(n.criadaEm)}`}
        acoes={
          <>
            {pode('avaliar_necessidade') && n.status !== 'convertida' && <button type="button" className="botao botao-fantasma" onClick={() => setAvaliando(true)}>Avaliar</button>}
            {podeConverter && <button type="button" className="botao" onClick={() => setConvertendo(true)}>Converter em iniciativa</button>}
          </>
        }
      />
      <div className="grade-2">
        <Cartao titulo="Problema">
          <p>{n.descricao}</p>
          <dl className="ficha">
            <div><dt>Status</dt><dd><SeloNecessidade status={n.status} /></dd></div>
            <div><dt>Benefício estimado pela área</dt><dd>{moeda(n.beneficioAnualEstimado)}/ano</dd></div>
            <div><dt>Horas economizadas</dt><dd>{n.horasEconomizadasMes} h/mês</dd></div>
            <div><dt>Esforço estimado</dt><dd>{n.esforco} de 5</dd></div>
            <div><dt>Matriz impacto × esforço</dt><dd>{NOME_QUADRANTE[quadrante(impacto(n.criterios), n.esforco)]}</dd></div>
            {ini && <div><dt>Iniciativa</dt><dd><a href={`#/portfolio/${ini.id}`}>{ini.codigo} {ini.nome}</a></dd></div>}
          </dl>
        </Cartao>
        <Cartao titulo="Por que este score?" acoes={<SeloFaixa score={score} />}>
          <p className="score-grande"><SeloScore score={score} /> <span>de 100</span></p>
          <ul className="explicacao">
            {partes.map((p) => (
              <li key={p.criterio}>
                <span>{NOME_CRITERIO[p.criterio]} <em>nota {p.nota}/5 · peso {p.peso}</em></span>
                <Barra valor={p.pontos} max={p.maximo} />
                <strong>{p.pontos.toFixed(1)} / {p.maximo}</strong>
              </li>
            ))}
          </ul>
          <p className="nota">Cada critério vale (nota − 1) ÷ 4 do seu peso. Os pesos atuais podem ser ajustados em Strategic Prioritization.</p>
        </Cartao>
      </div>
      <Cartao titulo="Histórico">
        <ol className="linha-historico">
          {n.historico.slice().reverse().map((h, i) => (
            <li key={i}><time>{dataHora(h.quando)}</time> <strong>{h.autor}</strong> {h.descricao}</li>
          ))}
        </ol>
      </Cartao>

      <FormAvaliacao
        aberto={avaliando}
        onFechar={() => setAvaliando(false)}
        inicial={n.criterios}
        esforcoInicial={n.esforco}
        statusInicial={n.status}
        onSalvar={(c, e, s) => { avaliarNecessidade(n.id, c, e, s); setAvaliando(false); }}
        pesos={estado.pesos}
      />
      <Modal titulo={`Converter ${n.codigo} em iniciativa`} aberto={convertendo} onFechar={() => setConvertendo(false)}>
        <FormConversao
          titulo={n.titulo}
          beneficio={n.beneficioAnualEstimado}
          responsaveis={estado.usuarios.filter((u) => u.papel !== 'ceo' && u.papel !== 'gestor_area').map((u) => u.nome)}
          onCancelar={() => setConvertendo(false)}
          onSalvar={(d) => { const nova = converter(n.id, d); setConvertendo(false); location.hash = `#/portfolio/${nova.id}`; }}
        />
      </Modal>
    </>
  );
}

function FormAvaliacao({ aberto, onFechar, inicial, esforcoInicial, statusInicial, onSalvar, pesos }: {
  aberto: boolean; onFechar: () => void; inicial: Criterios; esforcoInicial: number; statusInicial: StatusNecessidade;
  onSalvar: (c: Criterios, esforco: number, status: StatusNecessidade) => void; pesos: Parameters<typeof calcularScore>[1];
}) {
  const [c, setC] = useState(inicial);
  const [esforco, setEsforco] = useState(esforcoInicial);
  const [status, setStatus] = useState<StatusNecessidade>(statusInicial === 'nova' ? 'em_analise' : statusInicial);
  return (
    <Modal titulo="Avaliar necessidade" aberto={aberto} onFechar={onFechar}>
      <form className="form" onSubmit={(e) => { e.preventDefault(); onSalvar(c, esforco, status); }}>
        {CRITERIOS.map((k) => (
          <Campo key={k} rotulo={`${NOME_CRITERIO[k]}: ${c[k]}`}>
            <input type="range" min={1} max={5} step={1} value={c[k]} onChange={(e) => setC({ ...c, [k]: Number(e.target.value) })} />
          </Campo>
        ))}
        <Campo rotulo={`Esforço: ${esforco}`} ajuda="1 = muito baixo, 5 = muito alto">
          <input type="range" min={1} max={5} step={1} value={esforco} onChange={(e) => setEsforco(Number(e.target.value))} />
        </Campo>
        <Campo rotulo="Status">
          <select value={status} onChange={(e) => setStatus(e.target.value as StatusNecessidade)}>
            {(['em_analise', 'priorizada', 'recusada'] as StatusNecessidade[]).map((s) => <option key={s} value={s}>{NOME_STATUS_NECESSIDADE[s]}</option>)}
          </select>
        </Campo>
        <Aviso>Novo score: <strong>{calcularScore(c, pesos)}</strong></Aviso>
        <div className="form-acoes">
          <button type="button" className="botao botao-fantasma" onClick={onFechar}>Cancelar</button>
          <button type="submit" className="botao">Salvar avaliação</button>
        </div>
      </form>
    </Modal>
  );
}

function FormConversao({ titulo, beneficio, responsaveis, onCancelar, onSalvar }: {
  titulo: string; beneficio: number; responsaveis: string[]; onCancelar: () => void;
  onSalvar: (d: { nome: string; responsavel: string; orcamento: number; beneficioProjetadoAnual: number; inicio: string; fimPrevisto: string }) => void;
}) {
  const [erro, setErro] = useState('');
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const d = {
          nome: String(f.get('nome')).trim(),
          responsavel: String(f.get('responsavel')),
          orcamento: Number(f.get('orcamento')),
          beneficioProjetadoAnual: Number(f.get('beneficio')),
          inicio: String(f.get('inicio')),
          fimPrevisto: String(f.get('fim')),
        };
        if (d.nome.length < 5) return setErro('Dê um nome com pelo menos 5 caracteres.');
        if (!(d.orcamento > 0)) return setErro('Informe um orçamento maior que zero.');
        if (!(d.beneficioProjetadoAnual >= 0)) return setErro('O benefício projetado não pode ser negativo.');
        if (!d.inicio || !d.fimPrevisto || d.fimPrevisto < d.inicio) return setErro('A data de fim precisa ser igual ou posterior ao início.');
        onSalvar(d);
      }}
    >
      <Campo rotulo="Nome da iniciativa"><input name="nome" defaultValue={titulo} required /></Campo>
      <Campo rotulo="Responsável">
        <select name="responsavel">{responsaveis.map((r) => <option key={r}>{r}</option>)}</select>
      </Campo>
      <div className="form-linha">
        <Campo rotulo="Orçamento (R$)"><input name="orcamento" type="number" min={0} step="any" required /></Campo>
        <Campo rotulo="Benefício projetado por ano (R$)"><input name="beneficio" type="number" min={0} step="any" defaultValue={beneficio} /></Campo>
      </div>
      <div className="form-linha">
        <Campo rotulo="Início"><input name="inicio" type="date" required /></Campo>
        <Campo rotulo="Fim previsto"><input name="fim" type="date" required /></Campo>
      </div>
      {erro && <Aviso tom="erro">{erro}</Aviso>}
      <Aviso>A iniciativa nasce como “Proposta” e precisa de uma decisão de aprovação no Decision Log.</Aviso>
      <div className="form-acoes">
        <button type="button" className="botao botao-fantasma" onClick={onCancelar}>Cancelar</button>
        <button type="submit" className="botao">Criar iniciativa</button>
      </div>
    </form>
  );
}
