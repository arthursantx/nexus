# 10. Roadmap

| Fase | Entrega | Situação |
|---|---|---|
| **1. Demonstração funcional** | Todos os módulos no navegador, regras de negócio testadas, dados fictícios, deploy no GitHub Pages | ✅ publicada |
| **2. Produto mínimo** | API Node/TypeScript, PostgreSQL com Prisma, login (SSO/OIDC), permissões no servidor, multiempresa | planejada |
| **3. Intelligence com IA** | LLM no servidor com os dados do usuário como contexto, respostas com citação das fontes e registro das perguntas | planejada |
| **4. Integrações** | Importação de custos do ERP, sincronização com Jira/Azure DevOps, notificações | ideia |

## Fase 2 em detalhe

1. Mover `src/dominio` para um pacote compartilhado entre frontend e API.
2. Criar o banco a partir de `prisma/schema.prisma` e migrar os dados de exemplo como seed.
3. Substituir a loja local por chamadas à API, mantendo as mesmas funções de domínio.
4. Implementar login e checagem de permissão em cada rota.
5. Testes de integração da API e testes de ponta a ponta no CI.

## Riscos conhecidos

- **Qualidade da avaliação:** o score só é tão bom quanto as notas. Mitigação: comparação lado a lado, explicação do score e histórico de quem avaliou.
- **Benefício inflado:** áreas tendem a superestimar ganhos. Mitigação: separação explícita entre confirmado e estimado.
- **IA respondendo além dos dados:** mitigação descrita na [arquitetura](08-arquitetura.md); na fase 1 o motor é por regras justamente para evitar isso.
