# 11. Matriz de priorização

## Critérios

| Critério | Pergunta que responde | Nota 1 | Nota 5 | Peso padrão |
|---|---|---|---|---|
| Alinhamento estratégico | Ajuda nos objetivos do ano? | Não se relaciona | Objetivo central | 25 |
| Impacto financeiro | Quanto gera de receita ou reduz de custo? | Irrelevante | Muito relevante | 25 |
| Impacto operacional | Quanto melhora processo, prazo ou qualidade? | Quase nada | Muda a operação | 20 |
| Urgência | O que acontece se esperar? | Nada | Multa, perda ou parada | 15 |
| Viabilidade | Dá para fazer com o que temos? | Muito difícil | Simples | 15 |

Os pesos são configuráveis em **Strategic Prioritization** e precisam somar 100.

## Cálculo

```
contribuição = (nota − 1) ÷ 4 × peso
score        = soma das contribuições   (0 a 100)
```

A nota 1 vale zero e a nota 5 vale o peso inteiro. Assim, o score usa a escala toda de 0 a 100.

### Exemplo (pesos padrão)

| Critério | Nota | Peso | Contribuição |
|---|---|---|---|
| Alinhamento | 5 | 25 | 25,0 |
| Financeiro | 4 | 25 | 18,75 |
| Operacional | 4 | 20 | 15,0 |
| Urgência | 3 | 15 | 7,5 |
| Viabilidade | 4 | 15 | 11,25 |
| **Score** | | | **77,5 → prioridade alta** |

## Faixas

| Score | Faixa |
|---|---|
| 80 a 100 | Prioridade crítica |
| 60 a 79,9 | Prioridade alta |
| 40 a 59,9 | Prioridade moderada |
| 0 a 39,9 | Prioridade baixa |

## Matriz impacto × esforço

Impacto = média de impacto financeiro e operacional (1 a 5). Esforço = estimativa de 1 a 5. Corte no 3.

|  | Esforço baixo (< 3) | Esforço alto (≥ 3) |
|---|---|---|
| **Impacto alto (≥ 3)** | Ganho rápido | Projeto estratégico |
| **Impacto baixo (< 3)** | Baixa prioridade | Reavaliar |
