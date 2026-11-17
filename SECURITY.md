# Política de segurança

O NEXUS, nesta fase 1, é uma demonstração 100% no navegador (React + Vite, publicada no
GitHub Pages):

- **Sem servidor, sem banco de dados e sem login real.** Os perfis da demonstração não usam
  senha e todos os dados são fictícios.
- **Os dados ficam só no navegador** de quem usa a demonstração (armazenamento local) e
  podem ser descartados pelo botão "Restaurar dados de demonstração".
- **Nenhuma chave, senha ou token no código.** A fase 1 não chama nenhuma API de IA; o
  assistente funciona por regras sobre os dados da tela.
- **Content Security Policy** no build publicado: só permite scripts e estilos da própria
  demonstração, do Google Fonts e do VLibras.
- **Dependências fixadas** em versões exatas (`package.json`) e deploy apenas com GitHub
  Actions oficiais.

Para uma fase com backend real, a documentação (`docs/`) prevê autenticação real e
multiempresa (PRD, fase 2) e mantém a regra de nenhuma chave de API no frontend.

## Como relatar uma vulnerabilidade

Envie os detalhes para **arthurborgess21@gmail.com**. Por favor, não abra uma issue
pública antes da correção. A resposta inicial é dada em até 7 dias.

---

**Security policy (English):** NEXUS phase 1 is a browser-only demo with fictional data,
no backend, no real login and no secrets in the code. To report a vulnerability, email
arthurborgess21@gmail.com and please avoid public issues before a fix.
