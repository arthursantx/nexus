# 2. PRD — requisitos do produto

**Versão:** 0.1 (fase 1, demonstração funcional)
**Status:** implementado na demo; itens marcados "fase 2" estão planejados.

## Objetivo

Dar à diretoria e à TI uma visão única de necessidades, prioridades, portfólio, decisões e valor entregue, com critérios explícitos e trilha de auditoria.

## Módulos

| Módulo | O que faz | Fase 1 |
|---|---|---|
| Executive Overview | Indicadores do portfólio, destaques automáticos, orçamento por área, top prioridades | ✅ |
| Business Needs | Registro, busca e filtro de necessidades; detalhe com avaliação e histórico | ✅ |
| Strategic Prioritization | Pesos configuráveis (soma 100), ranking, matriz impacto × esforço, comparação lado a lado | ✅ |
| Technology Portfolio | Iniciativas em tabela, quadro por status e linha do tempo | ✅ |
| NEXUS Intelligence | Perguntas em linguagem natural respondidas **só com os dados cadastrados** | ✅ (modo regras) |
| Executive Decisions | Registro de decisões de seis tipos, com efeito no status/orçamento | ✅ |
| Reports & Insights | Relatórios por período e área, exportação CSV e PDF (impressão) | ✅ |
| Value Tracking | Projetado × confirmado × estimado, ROI, payback, capacidade liberada | ✅ |
| Trilha de auditoria | Toda alteração registra quem, quando, o quê | ✅ |
| Autenticação real e multiempresa | Login, organizações isoladas | fase 2 |
| Persistência em banco | PostgreSQL via Prisma | fase 2 |
| IA generativa | LLM no servidor, com os dados como contexto | fase 2 |

## Requisitos funcionais (resumo)

- **RF01** Registrar necessidade com título, descrição, área, categoria, benefício anual estimado e horas economizadas por mês.
- **RF02** Avaliar necessidade com notas inteiras de 1 a 5 em cinco critérios e esforço de 1 a 5.
- **RF03** Calcular score de 0 a 100 com os pesos vigentes e mostrar a contribuição de cada critério.
- **RF04** Permitir alterar os pesos apenas quando a soma for exatamente 100.
- **RF05** Converter necessidade avaliada em iniciativa, mantendo o vínculo.
- **RF06** Atualizar status, progresso, custo realizado e risco de iniciativas.
- **RF07** Registrar decisões (aprovação, rejeição, repriorização, alteração de orçamento, pausa, encerramento) com justificativa, participantes, responsável, próximos passos e prazo.
- **RF08** Registrar medições mensais de benefício, marcando se são confirmadas ou estimadas, e a fonte.
- **RF09** Responder perguntas no Intelligence citando os dados usados; quando não houver dado suficiente, dizer isso.
- **RF10** Exportar relatórios em CSV e PDF.
- **RF11** Registrar na trilha de auditoria toda criação e alteração.
- **RF12** Restringir ações conforme o perfil (matriz em [regras de negócio](07-regras-de-negocio.md)).

## Requisitos não funcionais

- Acessível (navegação por teclado, contraste AA, rótulos em formulários). Verificado com axe-core em todas as telas.
- Responsivo, sem rolagem horizontal da página no celular.
- Sem dados reais de nenhuma empresa. A demo é identificada como tal em todas as telas.
- Nenhuma chave de API no frontend.

## Fora do escopo da fase 1

Integração com ERPs e ferramentas de projeto, notificações por e-mail, workflow de aprovação em várias etapas, multi-moeda.
