import { Cabecalho, Cartao } from '../componentes/comuns';
import { useLoja } from '../dados/loja';
import { AJUDA, CICLO, ROTEIROS } from '../dominio/guia';
import { NOME_PAPEL } from '../dominio/rotulos';
import { NOME_MODULO } from '../menu';

export default function Guia({ onTour }: { onTour: () => void }) {
  const { usuario } = useLoja();
  if (!usuario) return null;
  const roteiro = ROTEIROS[usuario.papel];

  return (
    <>
      <Cabecalho
        titulo="Comece aqui"
        subtitulo="Como o NEXUS funciona e por onde começar no seu perfil."
        acoes={<button type="button" className="botao" onClick={onTour}>Fazer o tour guiado</button>}
      />

      <Cartao titulo="O caminho de uma demanda">
        <p className="nota-guia">O NEXUS acompanha cada pedido de tecnologia do começo ao fim. Cada etapa tem uma tela:</p>
        <ol className="ciclo">
          {CICLO.map((c, i) => (
            <li key={c.titulo}>
              <a href={`#/${c.rota}`}>
                <span className="ciclo-numero" aria-hidden="true">{i + 1}</span>
                <strong>{c.titulo}</strong>
                <span>{c.texto}</span>
                <small>{NOME_MODULO[c.rota]}</small>
              </a>
            </li>
          ))}
        </ol>
      </Cartao>

      <Cartao titulo={`Por onde começar: ${NOME_PAPEL[usuario.papel]}`}>
        <p className="nota-guia"><strong>Seu objetivo:</strong> {roteiro.objetivo}</p>
        <ol className="roteiro">
          {roteiro.passos.map((p, i) => (
            <li key={i}>
              <span>{p.texto}</span>
              <a href={`#/${p.rota}`} className="link">Abrir {NOME_MODULO[p.rota]}</a>
            </li>
          ))}
        </ol>
        <p className="nota">Para ver o sistema por outro ângulo, use “Trocar perfil” no menu lateral. Cada perfil tem permissões diferentes.</p>
      </Cartao>

      <Cartao titulo="O que cada tela faz">
        <div className="telas-guia">
          {Object.entries(AJUDA).map(([rota, a]) => (
            <details key={rota} className="tela-guia">
              <summary>
                <strong>{NOME_MODULO[rota]}</strong>
                <span>{a.nome}</span>
              </summary>
              <p>{a.paraQue}</p>
              <ol>{a.passos.map((p, i) => <li key={i}>{p}</li>)}</ol>
              {a.dica && <p className="nota"><strong>Dica:</strong> {a.dica}</p>}
              <a href={`#/${rota}`} className="link">Abrir esta tela</a>
            </details>
          ))}
        </div>
      </Cartao>

      <Cartao titulo="Palavras que aparecem no sistema">
        <dl className="glossario">
          <div><dt>Necessidade</dt><dd>Um problema de uma área que a tecnologia pode resolver. Código NEC-000.</dd></div>
          <div><dt>Iniciativa</dt><dd>O projeto criado para resolver uma ou mais necessidades. Código INI-000.</dd></div>
          <div><dt>Score</dt><dd>Nota de 0 a 100 calculada com os cinco critérios e seus pesos.</dd></div>
          <div><dt>Faixa</dt><dd>Crítica (80 ou mais), alta (60 a 79), moderada (40 a 59) ou baixa (abaixo de 40).</dd></div>
          <div><dt>Em risco</dt><dd>Iniciativa ativa com risco alto ou com gasto mais de 15 pontos à frente do progresso.</dd></div>
          <div><dt>Confirmado × estimado</dt><dd>Confirmado é o benefício validado pela área; estimado foi medido, mas ainda não validado.</dd></div>
          <div><dt>Capacidade liberada</dt><dd>Horas por mês que a equipe deixou de gastar. 160 horas equivalem a uma pessoa em tempo integral.</dd></div>
        </dl>
      </Cartao>
    </>
  );
}
