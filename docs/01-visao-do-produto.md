# 1. Visão do produto

## Problema

Em muitas empresas, os pedidos de tecnologia chegam por e-mail, reunião e corredor. Cada área defende o seu, a priorização vira disputa de quem fala mais alto e, depois que um projeto termina, ninguém confere se o benefício prometido apareceu.

O resultado é previsível: orçamento espalhado em iniciativas de baixo retorno, necessidades críticas paradas na fila e uma diretoria sem uma visão única do portfólio.

## Proposta

O **NEXUS** é uma plataforma de gestão estratégica de tecnologia. Ele acompanha o ciclo inteiro:

```
necessidade da área → avaliação por critérios → priorização → iniciativa → decisão da diretoria → execução → valor medido
```

Três ideias guiam o produto:

1. **Um só critério para todo mundo.** Toda necessidade recebe nota nos mesmos cinco critérios, com pesos definidos pela liderança. O score é explicável: dá para ver quanto cada critério contribuiu.
2. **Decisão registrada.** Aprovações, rejeições, repriorizações e cortes ficam guardados com justificativa, participantes, responsável e prazo.
3. **Valor medido, não prometido.** O benefício projetado é comparado mês a mês com o confirmado. Horas economizadas aparecem separadas de dinheiro economizado, porque não são a mesma coisa.

## Para quem

CEO, CIO/CTO, gerentes de TI, Product Owners, analistas de negócio e gestores das áreas. Os perfis estão detalhados em [personas](04-personas.md).

## O que esta versão é (e o que não é)

Esta é a **fase 1: demonstração funcional**. Ela roda inteira no navegador, com dados de uma empresa fictícia (Vértice Group), e serve para validar o fluxo e as regras de negócio.

Ela **não** tem backend, login real nem banco de dados. Os perfis de acesso são simulados e os dados ficam no `localStorage` do navegador. O caminho para produção está no [roadmap](10-roadmap.md).

## Indicadores de sucesso (para uma implantação real)

| Indicador | Como medir |
|---|---|
| Necessidades avaliadas com critérios | % de necessidades com as cinco notas preenchidas |
| Tempo até a decisão | dias entre o registro da necessidade e a decisão da diretoria |
| Realização de benefício | benefício confirmado ÷ benefício projetado no período |
| Decisões rastreáveis | % de mudanças de orçamento/status com decisão registrada |

Esses indicadores são propostas para uma implantação real. A demonstração não coleta dados de uso.
