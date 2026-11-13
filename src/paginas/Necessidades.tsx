import { useState } from 'react';
import { Aviso, Cabecalho, Campo, Cartao, Modal, SeloNecessidade, SeloScore, Vazio } from '../componentes/comuns';
import { useLoja } from '../dados/loja';
import { calcularScore } from '../dominio/priorizacao';
import { data, moeda, NOME_CATEGORIA, NOME_STATUS_NECESSIDADE } from '../dominio/rotulos';
import type { Categoria, StatusNecessidade } from '../dominio/tipos';

export default function Necessidades() {
  const { estado, pode, criarNecessidade } = useLoja();
  const [area, setArea] = useState('');
  const [status, setStatus] = useState('');
  const [busca, setBusca] = useState('');
  const [aberto, setAberto] = useState(false);

  const lista = estado.necessidades
    .filter((n) => (!area || n.departamentoId === area) && (!status || n.status === status))
    .filter((n) => !busca || `${n.codigo} ${n.titulo} ${n.descricao}`.toLowerCase().includes(busca.toLowerCase()))
    .map((n) => ({ n, s: calcularScore(n.criterios, estado.pesos) }))
    .sort((a, b) => b.s - a.s);

  return (
    <>
      <Cabecalho
        titulo="Business Needs"
        subtitulo="Necessidades das áreas, avaliadas com critérios únicos e com histórico de cada mudança."
        acoes={pode('registrar_necessidade') && <button type="button" className="botao" onClick={() => setAberto(true)}>Registrar necessidade</button>}
      />
      <Cartao>
        <div className="filtros">
          <Campo rotulo="Buscar"><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Código, título ou descrição" /></Campo>
          <Campo rotulo="Área">
            <select value={area} onChange={(e) => setArea(e.target.value)}>
              <option value="">Todas</option>
              {estado.departamentos.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
            </select>
          </Campo>
          <Campo rotulo="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Todos</option>
              {Object.entries(NOME_STATUS_NECESSIDADE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Campo>
        </div>
        {lista.length ? (
          <div className="tabela-rolagem" tabIndex={0}>
            <table className="tabela">
              <thead>
                <tr><th>Necessidade</th><th>Área</th><th>Categoria</th><th>Status</th><th className="num">Benefício estimado</th><th>Aberta em</th><th className="num">Score</th></tr>
              </thead>
              <tbody>
                {lista.map(({ n, s }) => (
                  <tr key={n.id}>
                    <td><a href={`#/necessidades/${n.id}`}><span className="codigo">{n.codigo}</span> {n.titulo}</a></td>
                    <td>{estado.departamentos.find((d) => d.id === n.departamentoId)?.nome}</td>
                    <td>{NOME_CATEGORIA[n.categoria]}</td>
                    <td><SeloNecessidade status={n.status as StatusNecessidade} /></td>
                    <td className="num">{moeda(n.beneficioAnualEstimado)}</td>
                    <td>{data(n.criadaEm)}</td>
                    <td className="num"><SeloScore score={s} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Vazio>Nenhuma necessidade encontrada com esses filtros.</Vazio>
        )}
      </Cartao>
      <FormNecessidade aberto={aberto} onFechar={() => setAberto(false)} onSalvar={(d) => { const n = criarNecessidade(d); setAberto(false); location.hash = `#/necessidades/${n.id}`; }} departamentos={estado.departamentos} />
    </>
  );
}

function FormNecessidade({ aberto, onFechar, onSalvar, departamentos }: {
  aberto: boolean;
  onFechar: () => void;
  onSalvar: (d: { titulo: string; descricao: string; departamentoId: string; categoria: Categoria; beneficioAnualEstimado: number; horasEconomizadasMes: number }) => void;
  departamentos: { id: string; nome: string }[];
}) {
  const [erro, setErro] = useState('');
  return (
    <Modal titulo="Registrar necessidade" aberto={aberto} onFechar={onFechar}>
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const titulo = String(f.get('titulo')).trim();
          const descricao = String(f.get('descricao')).trim();
          const beneficio = Number(f.get('beneficio'));
          const horas = Number(f.get('horas'));
          if (titulo.length < 5) return setErro('Descreva o título com pelo menos 5 caracteres.');
          if (descricao.length < 15) return setErro('Explique o problema com pelo menos 15 caracteres.');
          if (!(beneficio >= 0) || !(horas >= 0)) return setErro('Benefício e horas devem ser números maiores ou iguais a zero.');
          setErro('');
          onSalvar({ titulo, descricao, departamentoId: String(f.get('area')), categoria: f.get('categoria') as Categoria, beneficioAnualEstimado: beneficio, horasEconomizadasMes: horas });
        }}
      >
        <Campo rotulo="Título"><input name="titulo" required maxLength={120} /></Campo>
        <Campo rotulo="Qual é o problema?"><textarea name="descricao" rows={3} required maxLength={600} /></Campo>
        <div className="form-linha">
          <Campo rotulo="Área">
            <select name="area">{departamentos.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}</select>
          </Campo>
          <Campo rotulo="Categoria">
            <select name="categoria">{Object.entries(NOME_CATEGORIA).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          </Campo>
        </div>
        <div className="form-linha">
          <Campo rotulo="Benefício anual estimado (R$)" ajuda="Estimativa da área; será validada depois."><input name="beneficio" type="number" min={0} step="any" defaultValue={0} /></Campo>
          <Campo rotulo="Horas economizadas por mês"><input name="horas" type="number" min={0} defaultValue={0} /></Campo>
        </div>
        {erro && <Aviso tom="erro">{erro}</Aviso>}
        <div className="form-acoes">
          <button type="button" className="botao botao-fantasma" onClick={onFechar}>Cancelar</button>
          <button type="submit" className="botao">Registrar</button>
        </div>
      </form>
    </Modal>
  );
}
