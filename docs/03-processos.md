# 3. Processos

## Processo atual típico (AS-IS)

```mermaid
flowchart LR
  A[Área tem um problema] --> B[Pede à TI por e-mail ou reunião]
  B --> C{TI tem capacidade?}
  C -- não --> D[Pedido fica na fila sem critério]
  C -- sim --> E[Projeto começa]
  D --> F[Área escala para a diretoria]
  F --> E
  E --> G[Projeto termina]
  G --> H[Benefício não é medido]
```

Problemas: critério implícito, decisões sem registro, nenhuma verificação de valor.

## Processo com o NEXUS (TO-BE)

```mermaid
flowchart LR
  A[Gestor da área registra a necessidade] --> B[Analista avalia os 5 critérios e o esforço]
  B --> C[Score e posição no ranking]
  C --> D{Comitê decide}
  D -- aprova --> E[Iniciativa criada e vinculada]
  D -- rejeita --> R[Necessidade recusada com justificativa]
  E --> F[Execução: status, progresso, custo, risco]
  F --> G{Desvio ou risco alto?}
  G -- sim --> H[Destaque no Executive Overview]
  H --> D
  G -- não --> I[Entrada em produção]
  I --> J[Medições mensais de benefício]
  J --> K[Confirmado × projetado no Value Tracking]
```

Toda seta que muda dados gera um registro na trilha de auditoria.

## Ciclo de vida da necessidade

```mermaid
stateDiagram-v2
  [*] --> nova
  nova --> em_analise: avaliação iniciada
  em_analise --> priorizada: notas preenchidas
  priorizada --> convertida: vira iniciativa
  nova --> recusada
  em_analise --> recusada
  priorizada --> recusada
```

## Ciclo de vida da iniciativa

```mermaid
stateDiagram-v2
  [*] --> proposta
  proposta --> em_avaliacao
  em_avaliacao --> aprovada: decisão de aprovação
  em_avaliacao --> cancelada: decisão de rejeição
  aprovada --> em_planejamento
  em_planejamento --> em_execucao
  em_execucao --> pausada: decisão de pausa
  pausada --> em_execucao
  em_execucao --> concluida: decisão de encerramento
  pausada --> cancelada
```
