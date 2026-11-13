import { useEffect, useState } from 'react';
import { Tour } from './componentes/Tour';
import { BotaoAcessibilidade } from './componentes/Acessibilidade';
import { SeletorIdioma } from './i18n/contexto';
import { t } from './i18n/motor';
import { AJUDA } from './dominio/guia';
import { MENU } from './menu';
import Guia from './paginas/Guia';
import { useLoja } from './dados/loja';
import { NOME_PAPEL } from './dominio/rotulos';
import Auditoria from './paginas/Auditoria';
import Decisoes from './paginas/Decisoes';
import Entrar from './paginas/Entrar';
import IniciativaDetalhe from './paginas/IniciativaDetalhe';
import Intelligence from './paginas/Intelligence';
import NecessidadeDetalhe from './paginas/NecessidadeDetalhe';
import Necessidades from './paginas/Necessidades';
import Portfolio from './paginas/Portfolio';
import Priorizacao from './paginas/Priorizacao';
import Relatorios from './paginas/Relatorios';
import Valor from './paginas/Valor';
import VisaoGeral from './paginas/VisaoGeral';



const CHAVE_TOUR = 'nexus:tour-visto';

function lerRota(): string[] {
  const h = window.location.hash.replace(/^#\/?/, '');
  return h ? h.split('/') : ['visao-geral'];
}

export default function App() {
  const { usuario, sair, estado, restaurar } = useLoja();
  const [rota, setRota] = useState(lerRota);
  const [menuAberto, setMenuAberto] = useState(false);
  const [tour, setTour] = useState<number | null>(null);
  const [convite, setConvite] = useState(false);

  useEffect(() => {
    if (!usuario) return;
    try {
      if (!localStorage.getItem(CHAVE_TOUR)) setConvite(true);
    } catch {
      /* sem armazenamento: não mostra o convite */
    }
  }, [usuario]);

  const marcarVisto = () => {
    setConvite(false);
    try {
      localStorage.setItem(CHAVE_TOUR, '1');
    } catch {
      /* ignora */
    }
  };
  const iniciarTour = () => { marcarVisto(); setTour(0); };

  useEffect(() => {
    const mudar = () => {
      setRota(lerRota());
      setMenuAberto(false);
      document.getElementById('conteudo')?.focus();
    };
    window.addEventListener('hashchange', mudar);
    return () => window.removeEventListener('hashchange', mudar);
  }, []);

  if (!usuario) return <Entrar />;

  const [pagina, id] = rota;
  let conteudo;
  switch (pagina) {
    case 'guia':
      conteudo = <Guia onTour={iniciarTour} />;
      break;
    case 'necessidades':
      conteudo = id ? <NecessidadeDetalhe id={id} /> : <Necessidades />;
      break;
    case 'priorizacao':
      conteudo = <Priorizacao />;
      break;
    case 'portfolio':
      conteudo = id ? <IniciativaDetalhe id={id} /> : <Portfolio />;
      break;
    case 'intelligence':
      conteudo = <Intelligence />;
      break;
    case 'decisoes':
      conteudo = <Decisoes />;
      break;
    case 'relatorios':
      conteudo = <Relatorios />;
      break;
    case 'valor':
      conteudo = <Valor />;
      break;
    case 'auditoria':
      conteudo = <Auditoria />;
      break;
    default:
      conteudo = <VisaoGeral />;
  }

  return (
    <div className="app">
      <a className="pular" href="#conteudo" onClick={(e) => { e.preventDefault(); document.getElementById('conteudo')?.focus(); }}>
        Pular para o conteúdo
      </a>
      <aside className={`lateral ${menuAberto ? 'aberta' : ''}`}>
        <div className="marca">
          <span className="marca-simbolo" aria-hidden="true">N</span>
          <div>
            <strong>NEXUS</strong>
            <span>{estado.organizacao.nome}</span>
          </div>
        </div>
        <nav aria-label="Módulos">
          <ul>
            {MENU.map((m) => (
              <li key={m.rota}>
                <a href={`#/${m.rota}`} aria-current={pagina === m.rota || (!MENU.some((x) => x.rota === pagina) && m.rota === 'visao-geral') ? 'page' : undefined}>
                  <span aria-hidden="true">{m.icone}</span>
                  <span className="menu-texto">
                    {m.nome}
                    {m.dica && <small>{m.dica}</small>}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="lateral-rodape">
          <div className="usuario">
            <span className="avatar" aria-hidden="true">{usuario.nome.split(' ').map((p) => p[0]).slice(0, 2).join('')}</span>
            <div>
              <strong>{usuario.nome}</strong>
              <span>{NOME_PAPEL[usuario.papel]}</span>
            </div>
          </div>
          <button type="button" className="botao botao-fantasma" onClick={sair}>Trocar perfil</button>
          <button
            type="button"
            className="link-discreto"
            onClick={() => { if (confirm(t('Restaurar os dados de demonstração? Suas alterações neste navegador serão descartadas.'))) restaurar(); }}
          >
            Restaurar dados de demonstração
          </button>
        </div>
      </aside>
      <div className="principal">
        <div className="faixa-demo" role="region" aria-label="Aviso de demonstração">
          <p><strong>Demonstração</strong> · Vértice Group é uma empresa fictícia e todos os dados são de exemplo. As alterações ficam salvas só neste navegador.</p>
          <div className="ferramentas">
            <SeletorIdioma />
            <BotaoAcessibilidade />
          </div>
          <button type="button" className="menu-movel" aria-expanded={menuAberto} onClick={() => setMenuAberto((v) => !v)}>
            Menu
          </button>
        </div>
        <main id="conteudo" tabIndex={-1}>
          {convite && tour === null && (
            <div className="convite" role="region" aria-label="Primeira visita">
              <div>
                <strong>Primeira vez no NEXUS?</strong>
                <span>Um tour de dois minutos mostra para que serve cada tela e por onde começar.</span>
              </div>
              <div className="convite-acoes">
                <button type="button" className="botao" onClick={iniciarTour}>Fazer o tour</button>
                <button type="button" className="botao botao-fantasma" onClick={marcarVisto}>Agora não</button>
              </div>
            </div>
          )}
          {AJUDA[pagina] && !id && (
            <details className="ajuda-tela" key={pagina}>
              <summary>Como usar esta tela</summary>
              <p>{AJUDA[pagina].paraQue}</p>
              <ol>{AJUDA[pagina].passos.map((t, i) => <li key={i}>{t}</li>)}</ol>
              {AJUDA[pagina].dica && <p className="nota"><strong>Dica:</strong> {AJUDA[pagina].dica}</p>}
              <a href="#/guia" className="link">Ver o guia completo</a>
            </details>
          )}
          {conteudo}
        </main>
        {tour !== null && <Tour passo={tour} onPasso={setTour} onFechar={() => setTour(null)} />}
      </div>
    </div>
  );
}
