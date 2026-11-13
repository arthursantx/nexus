import { Cabecalho, Cartao, Vazio } from '../componentes/comuns';
import { useLoja } from '../dados/loja';
import { dataHora, NOME_PAPEL } from '../dominio/rotulos';

export default function Auditoria() {
  const { estado } = useLoja();
  return (
    <>
      <Cabecalho titulo="Trilha de auditoria" subtitulo="Toda alteração fica registrada com autor, perfil, data e o que mudou." />
      <Cartao>
        {estado.auditoria.length ? (
          <div className="tabela-rolagem" tabIndex={0}>
            <table className="tabela">
              <thead><tr><th>Quando</th><th>Quem</th><th>Perfil</th><th>Ação</th><th>Registro</th><th>Detalhe</th></tr></thead>
              <tbody>
                {estado.auditoria.map((a) => (
                  <tr key={a.id}>
                    <td>{dataHora(a.quando)}</td>
                    <td>{a.usuario}</td>
                    <td>{NOME_PAPEL[a.papel]}</td>
                    <td>{a.acao}</td>
                    <td><span className="codigo">{a.entidade}</span></td>
                    <td>{a.detalhe}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Vazio>Nenhuma alteração registrada.</Vazio>
        )}
      </Cartao>
    </>
  );
}
