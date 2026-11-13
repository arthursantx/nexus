import type { Papel } from './tipos';

/** Textos de ajuda do NEXUS: o que cada tela faz, por onde cada perfil começa e o tour guiado. */

export interface AjudaTela {
  nome: string; // nome em português, ao lado do nome do módulo
  paraQue: string;
  passos: string[];
  dica?: string;
}

export const AJUDA: Record<string, AjudaTela> = {
  'visao-geral': {
    nome: 'Visão geral',
    paraQue: 'É o painel da diretoria: mostra, em uma tela, quanto está sendo pedido, quanto está sendo gasto, o que está em risco e o retorno que já apareceu.',
    passos: [
      'Leia os oito indicadores do topo. Cada um diz de onde vem o número.',
      'Em “Executive Highlights”, veja os alertas gerados a partir dos dados. Clique em um alerta para abrir o registro.',
      'Use “Prioridades em aberto” e “Portfólio por status” para ir direto às listas completas.',
    ],
    dica: 'Benefício confirmado é o que a área validou. Estimado ainda não foi validado. Os dois nunca são somados.',
  },
  necessidades: {
    nome: 'Necessidades de negócio',
    paraQue: 'É onde as áreas registram os problemas que a tecnologia pode resolver. Tudo começa aqui.',
    passos: [
      'Clique em “Registrar necessidade”, descreva o problema, a área, o benefício estimado por ano e as horas que seriam economizadas.',
      'Abra uma necessidade para ver o detalhe e o histórico de mudanças.',
      'Quem avalia (analista, PO, gerente de TI ou CIO) clica em “Avaliar” e dá notas de 1 a 5 nos cinco critérios.',
      'Depois de avaliada e aprovada, use “Converter em iniciativa” para transformá-la em um projeto do portfólio.',
    ],
    dica: 'Use a busca e os filtros de área e status para achar uma necessidade rapidamente.',
  },
  priorizacao: {
    nome: 'Priorização estratégica',
    paraQue: 'Ordena as necessidades abertas com o mesmo critério para todas, para a conversa sobre o que fazer primeiro ficar objetiva.',
    passos: [
      'Confira os pesos dos cinco critérios. CEO e CIO podem mudar, desde que a soma dê 100.',
      'Veja o ranking: o score vai de 0 a 100 e a faixa diz se a prioridade é crítica, alta, moderada ou baixa.',
      'Na matriz impacto × esforço, identifique os ganhos rápidos (muito impacto, pouco esforço).',
      'Marque até três necessidades no ranking para compará-las lado a lado, critério por critério.',
    ],
    dica: 'O score apoia a decisão; ele não decide sozinho. A decisão fica registrada em “Executive Decisions”.',
  },
  portfolio: {
    nome: 'Portfólio de tecnologia',
    paraQue: 'Lista todas as iniciativas, com status, progresso, orçamento, gasto e risco.',
    passos: [
      'Escolha a forma de ver: tabela, cartões por status ou linha do tempo.',
      'Linhas destacadas estão em risco: risco alto ou gasto bem à frente do progresso.',
      'Abra uma iniciativa e use “Atualizar andamento” para registrar status, progresso, custo e risco.',
      'Depois que a iniciativa entra em produção, use “Registrar medição” para lançar o benefício de cada mês.',
    ],
  },
  intelligence: {
    nome: 'Assistente de análise',
    paraQue: 'Responde perguntas sobre o portfólio usando só os dados cadastrados, e mostra os números que usou.',
    passos: [
      'Clique em uma das perguntas de exemplo ou escreva a sua.',
      'Leia a resposta por partes: recomendação, justificativa, dados, impacto, riscos e próxima ação.',
      'Se a pergunta não puder ser respondida com os dados, o assistente avisa e sugere o que perguntar.',
    ],
    dica: 'Experimente perguntar por uma área (“Financeiro”) ou por um código (“INI-003”).',
  },
  decisoes: {
    nome: 'Decisões executivas',
    paraQue: 'É o registro oficial do que a diretoria decidiu, por quê, quem participou e qual é o próximo passo.',
    passos: [
      'CEO e CIO clicam em “Registrar decisão” e escolhem o tipo: aprovação, rejeição, repriorização, alteração de orçamento, pausa ou encerramento.',
      'Vincule a decisão a uma iniciativa ou necessidade. O formulário mostra o efeito antes de salvar.',
      'Ao salvar, o status (ou o orçamento) do registro vinculado muda e a decisão entra no histórico dele.',
    ],
  },
  relatorios: {
    nome: 'Relatórios',
    paraQue: 'Gera relatórios de portfólio, necessidades ou decisões por período e por área.',
    passos: [
      'Escolha o tipo de relatório, a área e o período.',
      'Confira a tabela na tela.',
      'Clique em “Exportar CSV” para abrir no Excel ou em “Exportar PDF” e escolha “Salvar como PDF” na janela de impressão.',
    ],
  },
  valor: {
    nome: 'Acompanhamento de valor',
    paraQue: 'Responde à pergunta mais importante depois da entrega: o benefício prometido apareceu?',
    passos: [
      'Compare projetado, confirmado e estimado em cada iniciativa no gráfico de barras.',
      'Escolha uma iniciativa no gráfico de linhas para ver mês a mês.',
      'Na tabela, veja ROI projetado, payback e ROI realizado.',
    ],
    dica: 'Horas economizadas aparecem como capacidade liberada da equipe, não como dinheiro, porque só viram economia se houver corte de custo comprovado.',
  },
  auditoria: {
    nome: 'Histórico de alterações',
    paraQue: 'Mostra quem alterou o quê e quando. Ninguém consegue editar esses registros pela tela.',
    passos: ['Use para conferir mudanças recentes, como pesos alterados, decisões registradas e medições lançadas.'],
  },
};

export interface PassoRoteiro {
  rota: string;
  texto: string;
}

/** Por onde começar, de acordo com o perfil. */
export const ROTEIROS: Record<Papel, { objetivo: string; passos: PassoRoteiro[] }> = {
  ceo: {
    objetivo: 'Saber se o investimento em tecnologia está trazendo retorno e decidir o que fazer.',
    passos: [
      { rota: 'visao-geral', texto: 'Veja os indicadores e os alertas da semana.' },
      { rota: 'valor', texto: 'Confira se o benefício prometido está sendo confirmado.' },
      { rota: 'priorizacao', texto: 'Ajuste os pesos dos critérios, se a estratégia mudou.' },
      { rota: 'decisoes', texto: 'Registre as decisões da reunião.' },
    ],
  },
  cio: {
    objetivo: 'Alocar orçamento e equipe no que dá mais resultado.',
    passos: [
      { rota: 'visao-geral', texto: 'Veja o que está em risco e as necessidades críticas paradas.' },
      { rota: 'priorizacao', texto: 'Compare as necessidades do topo do ranking.' },
      { rota: 'decisoes', texto: 'Registre aprovações, pausas e mudanças de orçamento.' },
      { rota: 'portfolio', texto: 'Acompanhe o andamento das iniciativas aprovadas.' },
    ],
  },
  gerente_ti: {
    objetivo: 'Entregar no prazo e no orçamento, com o andamento sempre atualizado.',
    passos: [
      { rota: 'portfolio', texto: 'Abra cada iniciativa e atualize status, progresso, custo e risco.' },
      { rota: 'necessidades', texto: 'Avalie as necessidades novas da sua fila.' },
      { rota: 'valor', texto: 'Registre as medições das iniciativas que já estão em produção.' },
    ],
  },
  po: {
    objetivo: 'Transformar necessidades em entregas que gerem valor medido.',
    passos: [
      { rota: 'necessidades', texto: 'Avalie as necessidades e converta as aprovadas em iniciativas.' },
      { rota: 'portfolio', texto: 'Atualize o andamento das suas iniciativas.' },
      { rota: 'valor', texto: 'Lance o benefício de cada mês, marcando se foi confirmado pela área.' },
    ],
  },
  ba: {
    objetivo: 'Avaliar os pedidos das áreas de forma justa e comparável.',
    passos: [
      { rota: 'necessidades', texto: 'Abra as necessidades novas e dê as notas dos cinco critérios.' },
      { rota: 'priorizacao', texto: 'Veja onde cada uma ficou no ranking e na matriz.' },
      { rota: 'intelligence', texto: 'Use o assistente para resumir uma área ou um código.' },
    ],
  },
  gestor_area: {
    objetivo: 'Ter o problema da sua área registrado e acompanhar o andamento.',
    passos: [
      { rota: 'necessidades', texto: 'Clique em “Registrar necessidade” e descreva o problema.' },
      { rota: 'necessidades', texto: 'Abra a necessidade depois para ver status, avaliação e histórico.' },
      { rota: 'decisoes', texto: 'Veja o que a diretoria decidiu sobre os pedidos.' },
    ],
  },
};

/** O caminho completo de uma demanda, usado no guia e no tour. */
export const CICLO = [
  { rota: 'necessidades', titulo: 'Registrar', texto: 'A área registra o problema e o benefício esperado.' },
  { rota: 'necessidades', titulo: 'Avaliar', texto: 'O analista dá notas de 1 a 5 em cinco critérios.' },
  { rota: 'priorizacao', titulo: 'Priorizar', texto: 'O score de 0 a 100 coloca tudo em um ranking único.' },
  { rota: 'decisoes', titulo: 'Decidir', texto: 'A diretoria aprova, rejeita ou pausa, com justificativa.' },
  { rota: 'portfolio', titulo: 'Executar', texto: 'A iniciativa é acompanhada: progresso, gasto e risco.' },
  { rota: 'valor', titulo: 'Medir', texto: 'O benefício de cada mês é comparado com o prometido.' },
];

/** Passos do tour guiado: cada passo abre uma tela e explica o que ela faz. */
export const TOUR = [
  { rota: 'guia', titulo: 'Bem-vindo ao NEXUS', texto: 'Este tour mostra cada tela em cerca de dois minutos. Você pode sair a qualquer momento e rever tudo depois em “Comece aqui”.' },
  ...['visao-geral', 'necessidades', 'priorizacao', 'decisoes', 'portfolio', 'valor', 'intelligence', 'relatorios'].map((r) => ({
    rota: r,
    titulo: AJUDA[r].nome,
    texto: AJUDA[r].paraQue,
  })),
  { rota: 'guia', titulo: 'Pronto', texto: 'Em cada tela há um botão “Como usar esta tela” com o passo a passo. Esta página, “Comece aqui”, mostra por onde começar no seu perfil.' },
];
