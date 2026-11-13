import { useState } from 'react';
import { Aviso, Cabecalho, Campo, Cartao, Modal, Vazio } from '../componentes/comuns';
import { useLoja } from '../dados/loja';
import { data, NOME_TIPO_DECISAO } from '../dominio/rotulos';
import type { TipoDecisao } from '../dominio/tipos';

const EFEITO: Record<TipoDecisao, string> = {
  aprovacao: 'Efeito: a iniciativa vinculada passa a "Aprovada"; a necessidade vinculada passa a "Priorizada".',
  rejeicao: 'Efeito: a iniciativa vinculada passa a "Cancelada"; a necessidade vinculada passa a "Recusada".',
  repriorizacao: 'Efeito: nenhum status muda; a decisão fica no histórico dos registros vinculados.',
  alteracao_orcamento: 'Efeito: o orçamento da iniciativa vinculada é substituído pelo novo valor.',
  pausa: 'Efeito: a iniciativa vinculada passa a "Pausada".',
  encerramento: 'Efeito: a iniciativa vinculada passa a "Concluída" (progresso 100%).',
};

export default function Decisoes() {
  const { estado, pode, registrarDecisao, usuario } = useLoja();
  const [tipo, setTipo] = useState('');
  const [tipoForm, setTipoForm] = useState<TipoDecisao>('aprovacao');
  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState('');
  const lista = estado.decisoes.filter((d) => !tipo || d.tipo === tipo).sort((a, b) => b.data.localeCompare(a.data));

  return (
    <>
      <Cabecalho
        titulo="Executive Decisions"
        subtitulo="Decision Log: o que foi decidido, por quê, quem participou e qual é o próximo passo."
        acoes={pode('registrar_decisao') && <button type="button" className="botao" onClick={() => setAberto(true)}>Registrar decisão</button>}
      />
      <div className="barra-ferramentas">
        <label className="campo campo-inline">
          <span>Tipo</span>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Todos</option>
            {Object.entries(NOME_TIPO_DECISAO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
      </div>
      {lista.length ? (
        <ol className="decisoes">
          {lista.map((d) => {
            const ini = estado.iniciativas.find((i) => i.id === d.iniciativaId);
            const nec = estado.necessidades.find((n) => n.id === d.necessidadeId);
            return (
              <li key={d.id} className="decisao">
                <div className="decisao-topo">
                  <span className={`selo dt-${d.tipo}`}>{NOME_TIPO_DECISAO[d.tipo]}</span>
                  <span className="codigo">{d.codigo}</span>
                  <time>{data(d.data)}</time>
                </div>
                <h2>{d.titulo}</h2>
                <p>{d.justificativa}</p>
                <dl className="ficha ficha-compacta">
                  {ini && <div><dt>Iniciativa</dt><dd><a href={`#/portfolio/${ini.id}`}>{ini.codigo} {ini.nome}</a></dd></div>}
                  {nec && <div><dt>Necessidade</dt><dd><a href={`#/necessidades/${nec.id}`}>{nec.codigo} {nec.titulo}</a></dd></div>}
                  <div><dt>Participantes</dt><dd>{d.participantes.join(', ')}</dd></div>
                  <div><dt>Responsável</dt><dd>{d.responsavel}</dd></div>
                  <div><dt>Próximo passo</dt><dd>{d.proximosPassos} <em>até {data(d.prazo)}</em></dd></div>
                </dl>
              </li>
            );
          })}
        </ol>
      ) : (
        <Cartao><Vazio>Nenhuma decisão deste tipo.</Vazio></Cartao>
      )}

      <Modal titulo="Registrar decisão" aberto={aberto} onFechar={() => setAberto(false)}>
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const titulo = String(f.get('titulo')).trim();
            const justificativa = String(f.get('justificativa')).trim();
            const proximosPassos = String(f.get('passos')).trim();
            const participantes = String(f.get('participantes')).split(',').map((p) => p.trim()).filter(Boolean);
            if (titulo.length < 5 || justificativa.length < 15) return setErro('Preencha o título e uma justificativa de pelo menos 15 caracteres.');
            if (!participantes.length || !proximosPassos || !f.get('prazo')) return setErro('Informe participantes, próximo passo e prazo.');
            const tipoNovo = f.get('tipo') as TipoDecisao;
            const novoOrcamento = tipoNovo === 'alteracao_orcamento' ? Number(f.get('orcamento')) : undefined;
            if (tipoNovo === 'alteracao_orcamento' && (!f.get('iniciativa') || !(novoOrcamento! > 0))) return setErro('Para alterar orçamento, escolha a iniciativa e informe o novo valor.');
            setErro('');
            registrarDecisao({
              novoOrcamento,
              data: String(f.get('data')),
              tipo: f.get('tipo') as TipoDecisao,
              titulo,
              justificativa,
              participantes,
              responsavel: String(f.get('responsavel')),
              proximosPassos,
              prazo: String(f.get('prazo')),
              iniciativaId: String(f.get('iniciativa')) || undefined,
              necessidadeId: String(f.get('necessidade')) || undefined,
            });
            setAberto(false);
          }}
        >
          <div className="form-linha">
            <Campo rotulo="Tipo">
              <select name="tipo" value={tipoForm} onChange={(e) => setTipoForm(e.target.value as TipoDecisao)}>{Object.entries(NOME_TIPO_DECISAO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
            </Campo>
            <Campo rotulo="Data"><input name="data" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /></Campo>
          </div>
          <Campo rotulo="Título"><input name="titulo" required maxLength={140} /></Campo>
          <Campo rotulo="Justificativa"><textarea name="justificativa" rows={3} required /></Campo>
          <div className="form-linha">
            <Campo rotulo="Iniciativa (opcional)">
              <select name="iniciativa"><option value="">Nenhuma</option>{estado.iniciativas.map((i) => <option key={i.id} value={i.id}>{i.codigo} {i.nome}</option>)}</select>
            </Campo>
            <Campo rotulo="Necessidade (opcional)">
              <select name="necessidade"><option value="">Nenhuma</option>{estado.necessidades.map((n) => <option key={n.id} value={n.id}>{n.codigo} {n.titulo}</option>)}</select>
            </Campo>
          </div>
          {tipoForm === 'alteracao_orcamento' && (
            <Campo rotulo="Novo orçamento (R$)" ajuda="Substitui o orçamento atual da iniciativa; o valor anterior fica no histórico."><input name="orcamento" type="number" min={1} step="any" required /></Campo>
          )}
          <Aviso tom="info">{EFEITO[tipoForm]}</Aviso>
          <Campo rotulo="Participantes" ajuda="Separados por vírgula."><input name="participantes" defaultValue={usuario?.nome} /></Campo>
          <div className="form-linha">
            <Campo rotulo="Responsável">
              <select name="responsavel" defaultValue={usuario?.nome}>{estado.usuarios.map((u) => <option key={u.id}>{u.nome}</option>)}</select>
            </Campo>
            <Campo rotulo="Prazo do próximo passo"><input name="prazo" type="date" required /></Campo>
          </div>
          <Campo rotulo="Próximo passo"><input name="passos" required /></Campo>
          {erro && <Aviso tom="erro">{erro}</Aviso>}
          <div className="form-acoes">
            <button type="button" className="botao botao-fantasma" onClick={() => setAberto(false)}>Cancelar</button>
            <button type="submit" className="botao">Registrar</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
