# 9. Modelo de dados

Na fase 1, o modelo vive em `src/dominio/tipos.ts` e é guardado como um único documento JSON no navegador. O diagrama abaixo é o modelo relacional planejado para a fase 2 (ver [`prisma/schema.prisma`](../prisma/schema.prisma)).

```mermaid
erDiagram
  ORGANIZACAO ||--o{ DEPARTAMENTO : tem
  ORGANIZACAO ||--o{ USUARIO : tem
  ORGANIZACAO ||--|| PESOS : configura
  ORGANIZACAO ||--o{ NECESSIDADE : registra
  ORGANIZACAO ||--o{ INICIATIVA : mantem
  ORGANIZACAO ||--o{ DECISAO : registra
  ORGANIZACAO ||--o{ AUDITORIA : guarda
  DEPARTAMENTO ||--o{ NECESSIDADE : origina
  DEPARTAMENTO ||--o{ INICIATIVA : patrocina
  NECESSIDADE }o--o| INICIATIVA : "convertida em"
  INICIATIVA ||--o{ MEDICAO_VALOR : mede
  INICIATIVA ||--o{ EVENTO : historico
  NECESSIDADE ||--o{ EVENTO : historico
  DECISAO }o--o| INICIATIVA : afeta
  DECISAO }o--o| NECESSIDADE : afeta

  NECESSIDADE {
    string id PK
    string codigo "NEC-001"
    string titulo
    string categoria
    string status
    int alinhamento "1 a 5"
    int financeiro "1 a 5"
    int operacional "1 a 5"
    int urgencia "1 a 5"
    int viabilidade "1 a 5"
    int esforco "1 a 5"
    decimal beneficioAnualEstimado
    decimal horasEconomizadasMes
  }
  INICIATIVA {
    string id PK
    string codigo "INI-001"
    string status "8 estados"
    decimal orcamento
    decimal custoRealizado
    int progresso "0 a 100"
    string risco
    decimal beneficioProjetadoAnual
    string inicioBeneficio "AAAA-MM"
  }
  MEDICAO_VALOR {
    string mes "AAAA-MM"
    decimal valor
    boolean confirmado
    string fonte
  }
  DECISAO {
    string id PK
    string codigo "DEC-001"
    date data
    string tipo "6 tipos"
    string justificativa
    string responsavel
    date prazo
    decimal novoOrcamento "opcional"
  }
  AUDITORIA {
    datetime quando
    string usuario
    string papel
    string acao
    string entidade
    string detalhe
  }
```

## Observações

- O score **não** é gravado: é calculado a partir das notas e dos pesos vigentes, para nunca ficar desatualizado quando os pesos mudam.
- Os códigos (NEC/INI/DEC) são sequenciais por organização.
- A auditoria é somente inserção.
