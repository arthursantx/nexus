# 6. Critérios de aceite

Escritos em Dado / Quando / Então. Os marcados com 🧪 têm teste automatizado em `src/dominio/dominio.test.ts`; os demais foram verificados em teste de ponta a ponta no navegador (Playwright).

**HU01 — Registrar necessidade**
- Dado um usuário com permissão, quando envia o formulário com título ≥ 5 caracteres e descrição ≥ 15, então a necessidade é criada com status "nova", código sequencial (NEC-xxx) e registro na auditoria.
- Quando o título é curto, então aparece a mensagem de erro e nada é salvo.

**HU03 — Avaliar critérios**
- 🧪 Quando alguma nota não é inteira de 1 a 5, então o cálculo é recusado com erro.
- 🧪 Dadas todas as notas 5, então o score é 100; todas 1, então o score é 0.

**HU04 — Pesos**
- 🧪 Dados pesos que somam 105, então o sistema mostra "a soma precisa ser 100" e o botão Salvar fica desabilitado.
- Dados pesos que somam 100, quando o CIO salva, então o ranking é recalculado e a mudança vai para a auditoria.
- Dado o perfil gestor de área, então os campos de peso aparecem somente leitura.

**HU05 — Comparação**
- Quando três necessidades estão marcadas, então as demais caixas ficam desabilitadas.

**HU07 — Converter**
- Quando a necessidade é convertida, então nasce uma iniciativa "proposta" com os mesmos critérios, e a necessidade passa a "convertida" com link para ela.

**HU09 — Risco**
- 🧪 Uma iniciativa está em risco quando o risco é alto **ou** o percentual gasto do orçamento supera o progresso em mais de 15 pontos.

**HU10 — Decisão**
- Dado o perfil gestor de área, então o botão "Registrar decisão" não aparece.
- 🧪 Quando uma decisão de pausa é registrada, então a iniciativa passa a "pausada" e o histórico cita o código da decisão.
- 🧪 Quando uma alteração de orçamento é registrada, então o novo orçamento substitui o anterior e o valor antigo fica no histórico; sem novo valor, a decisão é recusada.
- 🧪 Quando uma rejeição é vinculada a uma necessidade, então ela passa a "recusada".

**HU11/HU12 — Valor**
- 🧪 Benefício projetado no período = benefício anual ÷ 12 × meses desde o início do benefício até o mês de referência.
- 🧪 Realização = confirmado ÷ projetado no período; sem período, mostra "—".
- Horas economizadas aparecem como capacidade (h/mês e pessoas equivalentes), nunca somadas a reais.

**HU13 — Intelligence**
- 🧪 A resposta traz recomendação, justificativa e os dados usados.
- 🧪 Para uma pergunta fora do escopo, a resposta diz que não há dados suficientes e sugere o que pode ser perguntado.

**HU14 — Exportação**
- 🧪 O CSV usa ponto e vírgula, aspas quando necessário e BOM UTF-8, para abrir corretamente no Excel em português.

**HU15 — Auditoria**
- Toda ação de escrita gera um registro com data e hora, usuário, perfil, ação, entidade e detalhe.
