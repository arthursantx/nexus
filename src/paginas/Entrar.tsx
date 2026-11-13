import { BotaoAcessibilidade } from '../componentes/Acessibilidade';
import { useLoja } from '../dados/loja';
import { SeletorIdioma } from '../i18n/contexto';
import { NOME_PAPEL } from '../dominio/rotulos';

const RESUMO: Record<string, string> = {
  ceo: 'Visão executiva, pesos da priorização e decisões.',
  cio: 'Acesso completo: portfólio, priorização, decisões e valor.',
  gerente_ti: 'Gestão de iniciativas e registro de valor.',
  po: 'Converte necessidades e acompanha entregas.',
  ba: 'Avalia necessidades e registra medições de valor.',
  gestor_area: 'Registra necessidades da área e acompanha o andamento.',
};

export default function Entrar() {
  const { estado, entrar } = useLoja();
  return (
    <main className="entrar">
      <div className="ferramentas ferramentas-entrar">
        <SeletorIdioma escuro />
        <BotaoAcessibilidade escuro />
      </div>
      <div className="entrar-caixa">
        <div className="marca marca-grande">
          <span className="marca-simbolo" aria-hidden="true">N</span>
          <div>
            <strong>NEXUS</strong>
            <span>Strategic Technology Management Platform</span>
          </div>
        </div>
        <h1>Da necessidade de negócio à decisão executiva.</h1>
        <p className="entrar-texto">
          Esta é uma demonstração com a empresa fictícia <strong>{estado.organizacao.nome}</strong>. Escolha um perfil para entrar; cada um tem permissões
          diferentes, como em uma empresa real. Nenhuma senha é necessária. Na primeira visita, um tour de dois minutos mostra como usar cada tela.
        </p>
        <ul className="perfis">
          {estado.usuarios.map((u) => (
            <li key={u.id}>
              <button type="button" className={`perfil ${u.papel === 'cio' ? 'perfil-recomendado' : ''}`} onClick={() => entrar(u.id)}>
                <span className="avatar" aria-hidden="true">{u.nome.split(' ').map((p) => p[0]).slice(0, 2).join('')}</span>
                <span>
                  <strong>{u.nome}</strong>
                  {u.papel === 'cio' && <b className="recomendado">Recomendado para conhecer o sistema</b>}
                  <em>{NOME_PAPEL[u.papel]}</em>
                  <small>{RESUMO[u.papel]}</small>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="entrar-nota">
          Projeto idealizado por <a href="https://arthursantx.github.io/projetos/nexus/">Arthur Borges</a> · <a href="https://github.com/arthursantx/nexus">código no GitHub</a>
        </p>
      </div>
    </main>
  );
}
