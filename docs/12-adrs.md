# 12. Decisões de arquitetura (ADRs)

## ADR-001 — SPA com Vite em vez de Next.js na fase 1

**Contexto.** A fase 1 precisa ser publicada de graça, com link público, e não tem backend.
**Decisão.** React + Vite gerando arquivos estáticos para o GitHub Pages, com rotas por hash (`#/portfolio`), que funcionam sem configuração de servidor.
**Consequências.** Deploy simples e gratuito. Sem renderização no servidor nem rotas de API; na fase 2 a API será um serviço separado (ou migração para um framework full-stack, se fizer sentido).

## ADR-002 — Regras de negócio em funções puras

**Contexto.** As regras precisam ser confiáveis e, depois, rodar também no servidor.
**Decisão.** Toda regra fica em `src/dominio`, sem React e sem acesso a armazenamento, com testes unitários.
**Consequências.** As regras são testáveis isoladamente e reaproveitáveis na API. Exige disciplina para não colocar lógica nas telas.

## ADR-003 — Intelligence por regras na fase 1, sem LLM

**Contexto.** Um app estático não pode guardar chave de API com segurança, e uma IA generativa pode afirmar coisas que não estão nos dados.
**Decisão.** Motor determinístico que só responde com dados cadastrados e diz quando não sabe. O modo é informado na tela.
**Consequências.** Respostas previsíveis e verificáveis, com cobertura limitada de perguntas. O LLM entra na fase 3, no servidor.

## ADR-004 — Permissões no cliente apenas na demonstração

**Contexto.** A fase 1 não tem servidor.
**Decisão.** Perfis simulados na tela de entrada, com a checagem feita na loja de estado.
**Consequências.** Bom para demonstrar o modelo de acesso, mas **não é segurança**: qualquer pessoa pode alterar o próprio navegador. Na fase 2 a checagem vai para a API.

## ADR-005 — Score calculado, não armazenado

**Contexto.** Os pesos mudam ao longo do tempo.
**Decisão.** Guardar as notas e calcular o score na hora.
**Consequências.** O ranking sempre reflete os pesos vigentes. Para saber o score que uma necessidade tinha numa data, é preciso guardar também o histórico de pesos (a auditoria já registra cada alteração).

## ADR-006 — Confirmado e estimado separados; horas não viram reais

**Contexto.** Relatórios de valor costumam misturar expectativa com resultado.
**Decisão.** Cada medição é marcada como confirmada ou estimada, e horas economizadas aparecem como capacidade, não como dinheiro.
**Consequências.** Números menores e mais honestos. O usuário precisa registrar a fonte e a validação de cada medição.
