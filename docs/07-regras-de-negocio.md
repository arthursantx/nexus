# 7. Regras de negócio

Cada regra aponta para o código que a implementa.

## Priorização — `src/dominio/priorizacao.ts`

| ID | Regra |
|---|---|
| RN01 | Cinco critérios: alinhamento estratégico, impacto financeiro, impacto operacional, urgência e viabilidade. |
| RN02 | Cada nota é um inteiro de 1 a 5. Fora disso, o cálculo é recusado. |
| RN03 | Pesos padrão: 25 / 25 / 20 / 15 / 15. Cada peso é um inteiro de 0 a 100 e **a soma precisa ser exatamente 100**. |
| RN04 | Contribuição de um critério = (nota − 1) ÷ 4 × peso. O score é a soma, de 0 a 100. |
| RN05 | Faixas: 80 ou mais = crítica · 60 a 79 = alta · 40 a 59 = moderada · abaixo de 40 = baixa. |
| RN06 | Impacto (eixo da matriz) = média das notas de impacto financeiro e impacto operacional. Esforço é avaliado à parte, de 1 a 5. |
| RN07 | Quadrantes (corte em 3): impacto ≥ 3 e esforço < 3 = ganho rápido; impacto ≥ 3 e esforço ≥ 3 = projeto estratégico; impacto < 3 e esforço < 3 = baixa prioridade; impacto < 3 e esforço ≥ 3 = reavaliar. |
| RN08 | O score é apoio à decisão, não substitui a decisão da liderança. |

## Portfólio e risco — `src/dominio/indicadores.ts`, `src/dominio/valor.ts`

| ID | Regra |
|---|---|
| RN09 | Iniciativas ativas: aprovada, em planejamento, em execução e pausada. |
| RN10 | Desvio = % do orçamento gasto − % de progresso. |
| RN11 | Em risco = ativa **e** (risco alto **ou** desvio acima de 15 pontos). |

## Decisões — `src/dominio/decisoes.ts`

| ID | Regra |
|---|---|
| RN12 | Aprovação → iniciativa "aprovada" / necessidade "priorizada". |
| RN13 | Rejeição → iniciativa "cancelada" / necessidade "recusada". |
| RN14 | Pausa → "pausada". Encerramento → "concluída" com progresso 100%. |
| RN15 | Alteração de orçamento exige iniciativa vinculada e novo valor maior que zero. |
| RN16 | Repriorização não muda status; fica no histórico. |
| RN17 | Necessidade já convertida em iniciativa não tem o status alterado por decisão. |

## Valor — `src/dominio/valor.ts`

| ID | Regra |
|---|---|
| RN18 | ROI projetado = (benefício anual − investimento) ÷ investimento. |
| RN19 | Payback (meses) = investimento ÷ (benefício anual ÷ 12). |
| RN20 | Benefício projetado no período = benefício anual ÷ 12 × meses desde o início do benefício até o mês de referência (inclusive). |
| RN21 | Medição **confirmada** = validada pela área (ex.: financeiro). **Estimada** = medida e ainda não validada. As duas nunca se somam num único "realizado". |
| RN22 | Realização = confirmado ÷ projetado no período. |
| RN23 | Horas economizadas são **capacidade liberada** (h/mês; 160 h = 1 pessoa em tempo integral). Não são convertidas em reais, porque só viram economia com redução de custo comprovada. |

## Acesso — `src/dominio/rotulos.ts`

Todos os perfis consultam tudo. Ações de escrita:

| Ação | CEO | CIO/CTO | Gerente de TI | PO | Analista | Gestor de área |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| Registrar necessidade | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Avaliar necessidade | | ✓ | ✓ | ✓ | ✓ | |
| Editar pesos | ✓ | ✓ | | | | |
| Gerir iniciativa | | ✓ | ✓ | ✓ | | |
| Registrar decisão | ✓ | ✓ | | | | |
| Registrar medição de valor | | ✓ | ✓ | ✓ | ✓ | |

> Na demonstração, a checagem é feita no navegador. Em produção ela precisa existir também no servidor (ver [ADR-004](12-adrs.md)).

## Auditoria

| ID | Regra |
|---|---|
| RN24 | Toda escrita gera um registro com data/hora, usuário, perfil, ação, entidade e detalhe. |
| RN25 | Registros de auditoria não são editáveis pela interface. |
