import { useEffect, useRef, useState } from 'react';
import { Cabecalho } from '../componentes/comuns';
import { MES_REFERENCIA } from '../dados/demonstracao';
import { useLoja } from '../dados/loja';
import { PERGUNTAS_EXEMPLO, responder, type Resposta } from '../dominio/intelligence';

interface Mensagem {
  autor: 'usuario' | 'nexus';
  texto?: string;
  resposta?: Resposta;
}

const SECOES: [keyof Resposta, string][] = [
  ['justificativa', 'Justificativa'],
  ['dados', 'Dados utilizados'],
  ['impacto', 'Impacto esperado'],
  ['riscos', 'Riscos'],
  ['proximaAcao', 'Próxima ação'],
];

export default function Intelligence() {
  const { estado } = useLoja();
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState('');
  const fim = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fim.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [mensagens]);

  const perguntar = (q: string) => {
    if (!q.trim()) return;
    setMensagens((m) => [...m, { autor: 'usuario', texto: q }, { autor: 'nexus', resposta: responder(q, estado, MES_REFERENCIA) }]);
    setTexto('');
  };

  return (
    <>
      <Cabecalho titulo="NEXUS Intelligence" subtitulo="Perguntas sobre o portfólio, respondidas apenas com os dados cadastrados na plataforma." />
      <p className="faixa-modo">
        <strong>Modo demonstração.</strong> As respostas vêm de regras sobre os dados do NEXUS, sem modelo de IA externo. Na fase 2, um modelo de linguagem roda no servidor
        com a chave em variável de ambiente e recebe estes mesmos dados como contexto.
      </p>
      <div className="chat">
        <div className="chat-mensagens" aria-live="polite">
          {!mensagens.length && (
            <div className="chat-vazio">
              <p>Experimente uma destas perguntas:</p>
              <ul className="sugestoes">
                {PERGUNTAS_EXEMPLO.map((p) => (
                  <li key={p}><button type="button" onClick={() => perguntar(p)}>{p}</button></li>
                ))}
              </ul>
            </div>
          )}
          {mensagens.map((m, i) =>
            m.autor === 'usuario' ? (
              <p key={i} className="msg msg-usuario">{m.texto}</p>
            ) : (
              <article key={i} className={`msg msg-nexus ${m.resposta!.suficiente ? '' : 'msg-insuficiente'}`}>
                <h3>{m.resposta!.suficiente ? 'Recomendação' : 'Dados insuficientes'}</h3>
                <p>{m.resposta!.recomendacao}</p>
                {SECOES.map(([k, rotulo]) => {
                  const v = m.resposta![k];
                  if (!v) return null;
                  return (
                    <div key={k} className="msg-secao">
                      <h4>{rotulo}</h4>
                      {Array.isArray(v) ? <ul>{v.map((x, j) => <li key={j}>{x}</li>)}</ul> : <p>{String(v)}</p>}
                    </div>
                  );
                })}
              </article>
            ),
          )}
          <div ref={fim} />
        </div>
        <form className="chat-entrada" onSubmit={(e) => { e.preventDefault(); perguntar(texto); }}>
          <label htmlFor="pergunta" className="visualmente-oculto">Sua pergunta</label>
          <input id="pergunta" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Pergunte sobre prioridades, riscos, orçamento, valor ou um código (ex.: INI-003)" autoComplete="off" />
          <button type="submit" className="botao" disabled={!texto.trim()}>Perguntar</button>
        </form>
      </div>
    </>
  );
}
