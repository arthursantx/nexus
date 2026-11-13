import { useEffect, useState } from 'react';
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

const MENU = [
  { rota: 'visao-geral', nome: 'Executive Overview', icone: '◧' },
  { rota: 'necessidades', nome: 'Business Needs', icone: '◇' },
  { rota: 'priorizacao', nome: 'Strategic Prioritization', icone: '△' },
  { rota: 'portfolio', nome: 'Technology Portfolio', icone: '▦' },
  { rota: 'intelligence', nome: 'NEXUS Intelligence', icone: '✦' },
  { rota: 'decisoes', nome: 'Executive Decisions', icone: '◉' },
  { rota: 'relatorios', nome: 'Reports & Insights', icone: '▤' },
  { rota: 'valor', nome: 'Value Tracking', icone: '↗' },
  { rota: 'auditoria', nome: 'Trilha de auditoria', icone: '≡' },
];

function lerRota(): string[] {
  const h = window.location.hash.replace(/^#\/?/, '');
  return h ? h.split('/') : ['visao-geral'];
}

export default function App() {
  const { usuario, sair, estado, restaurar } = useLoja();
  const [rota, setRota] = useState(lerRota);
  const [menuAberto, setMenuAberto] = useState(false);

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
                  {m.nome}
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
            onClick={() => { if (confirm('Restaurar os dados de demonstração? Suas alterações neste navegador serão descartadas.')) restaurar(); }}
          >
            Restaurar dados de demonstração
          </button>
        </div>
      </aside>
      <div className="principal">
        <div className="faixa-demo" role="region" aria-label="Aviso de demonstração">
          <strong>Demonstração</strong> · Vértice Group é uma empresa fictícia e todos os dados são de exemplo. As alterações ficam salvas só neste navegador.
          <button type="button" className="menu-movel" aria-expanded={menuAberto} onClick={() => setMenuAberto((v) => !v)}>
            Menu
          </button>
        </div>
        <main id="conteudo" tabIndex={-1}>
          {conteudo}
        </main>
      </div>
    </div>
  );
}
