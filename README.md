# NEXUS — Strategic Technology Management Platform

**Do pedido da área ao valor medido: uma visão única de necessidades, prioridades, portfólio, decisões e retorno dos investimentos em tecnologia.**

🔗 **Demonstração:** https://arthursantx.github.io/nexus/
📄 **Documentação:** [docs/](docs/)

> **Fase 1 — demonstração funcional.** Roda inteira no navegador, com dados de uma empresa **fictícia** (Vértice Group). Não há backend, login real nem banco de dados nesta fase: as alterações ficam salvas só no seu navegador. O que falta para produção está no [roadmap](docs/10-roadmap.md).

## O problema

Pedidos de tecnologia chegam de todas as áreas, sem critério comum. A priorização vira disputa, as decisões não ficam registradas e, quando o projeto termina, ninguém confere se o benefício prometido apareceu.

## O que o NEXUS faz

| Módulo | Para quê |
|---|---|
| **Executive Overview** | Indicadores do portfólio, iniciativas em risco e destaques gerados a partir dos dados |
| **Business Needs** | Registro das necessidades das áreas, com avaliação e histórico |
| **Strategic Prioritization** | Score de 0 a 100 com cinco critérios e pesos configuráveis, matriz impacto × esforço e comparação lado a lado |
| **Technology Portfolio** | Iniciativas em tabela, quadro por status e linha do tempo |
| **NEXUS Intelligence** | Perguntas em linguagem natural respondidas **só com os dados cadastrados** |
| **Executive Decisions** | Registro de decisões (aprovação, rejeição, repriorização, orçamento, pausa, encerramento), com efeito nos registros vinculados |
| **Reports & Insights** | Relatórios por período e área, exportação em CSV e PDF |
| **Value Tracking** | Benefício projetado × confirmado × estimado, ROI e payback |
| **Trilha de auditoria** | Quem alterou o quê, e quando |
| **Comece aqui** | Tour guiado, roteiro por perfil, ajuda de cada tela e glossário |
| **Português e inglês** | Toda a interface em PT e EN, inclusive as respostas do Intelligence (link direto: `?lang=en`) |
| **Acessibilidade** | Tamanho do texto, alto contraste, fonte de leitura facilitada, espaçamento, destaque de links, pausa de animações, guia de leitura e Libras (VLibras) |

Para experimentar, abra a demonstração e entre com um dos perfis (CEO, CIO/CTO, gerente de TI, PO, analista de negócio ou gestor de área). Cada perfil tem permissões diferentes.

**Primeira vez?** Na primeira visita aparece o convite para um tour guiado de dois minutos. O menu **Comece aqui** mostra o caminho de uma demanda, por onde começar em cada perfil, o que cada tela faz e um glossário. Em todas as telas há o botão **Como usar esta tela** com o passo a passo.

## In English

NEXUS connects business needs, strategic prioritization, the technology portfolio, executive decisions and measured value in one place. Open the demo with `?lang=en` (https://arthursantx.github.io/nexus/?lang=en) or use the PT/EN switch at the top of any screen.

## Regras que importam

- **Score explicável:** cada critério contribui com (nota − 1) ÷ 4 × peso, e a tela mostra quanto cada um somou. Os pesos precisam somar 100. → [matriz de priorização](docs/11-matriz-de-priorizacao.md)
- **Confirmado ≠ estimado:** benefício validado pela área aparece separado do benefício só medido.
- **Horas ≠ dinheiro:** horas economizadas aparecem como capacidade liberada, não como economia em reais.
- **Intelligence sem invenção:** quando não há dados para responder, a resposta diz isso.

Todas as regras estão em [docs/07-regras-de-negocio.md](docs/07-regras-de-negocio.md), com o arquivo que implementa cada uma.

## Tecnologia

React 18 · TypeScript · Vite · Recharts · Vitest · GitHub Actions · GitHub Pages

As regras de negócio ficam em `src/dominio`, em funções puras e testadas, separadas das telas. → [arquitetura](docs/08-arquitetura.md) · [decisões de arquitetura](docs/12-adrs.md)

```bash
npm install
npm run dev     # ambiente local
npm test        # testes de domínio
npm run build   # checagem de tipos + build
```

## Documentação

1. [Visão do produto](docs/01-visao-do-produto.md)
2. [PRD](docs/02-prd.md)
3. [Processos (AS-IS / TO-BE)](docs/03-processos.md)
4. [Personas](docs/04-personas.md)
5. [Histórias de usuário](docs/05-historias-de-usuario.md)
6. [Critérios de aceite](docs/06-criterios-de-aceite.md)
7. [Regras de negócio](docs/07-regras-de-negocio.md)
8. [Arquitetura](docs/08-arquitetura.md)
9. [Modelo de dados](docs/09-modelo-de-dados.md)
10. [Roadmap](docs/10-roadmap.md)
11. [Matriz de priorização](docs/11-matriz-de-priorizacao.md)
12. [ADRs](docs/12-adrs.md)

## Limites conhecidos

- Perfis e permissões são simulados no navegador: servem para demonstrar o modelo de acesso, **não** são segurança.
- O Intelligence da fase 1 funciona por regras, sem IA generativa; entende um conjunto limitado de perguntas.
- O esquema em `prisma/schema.prisma` é **planejado** para a fase 2 e ainda não é usado.
- Os números da Vértice Group são inventados para demonstração e não representam nenhuma empresa real.

## Segurança e licença

- **Segurança:** demonstração sem backend, sem senhas e sem chaves no código; Content Security Policy no build publicado. Detalhes e como relatar falhas em [`SECURITY.md`](SECURITY.md).
- **Privacidade:** os dados ficam só no navegador de quem usa. Ver [privacidade e termos](https://arthursantx.github.io/privacidade/).
- **Licença:** todos os direitos reservados ([`LICENSE`](LICENSE)). O código está público para consulta e avaliação, não para reutilização.

## Autoria

Produto idealizado por **Arthur Borges**: problema, módulos, regras de negócio e critérios. Implementação feita com apoio de IA (Claude), com revisão e testes.

[Portfólio](https://arthursantx.github.io) · [LinkedIn](https://www.linkedin.com/in/arthurborgessantos/)
