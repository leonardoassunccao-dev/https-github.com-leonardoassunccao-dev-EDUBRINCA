
import { Subject, GradeLevel, ClassLevel, ActivityType } from '../types';

export const LOCAL_OBJECTIVES: Record<Subject, string[]> = {
  'Português': [
    'Desenvolver a fluência leitora e compreensão de textos curtos.',
    'Identificar substantivos e adjetivos em frases simples.',
    'Praticar a escrita ortográfica e o uso de pontuação básica.',
    'Ampliar o vocabulário através de contos e fábulas.'
  ],
  'Matematica': [
    'Resolver situações-problema envolvendo adição e subtração.',
    'Identificar figuras geométricas e suas características.',
    'Compreender o sistema de numeração decimal (unidade, dezena).',
    'Introduzir conceitos de medidas de tempo e comprimento.'
  ],
  'Ciências': [
    'Classificar animais vertebrados e invertebrados.',
    'Identificar as partes das plantas e suas funções.',
    'Compreender a importância da reciclagem e preservação ambiental.',
    'Observar os estados físicos da água na natureza.'
  ],
  'História': [
    'Identificar mudanças e permanências na história da família.',
    'Compreender a importância das datas comemorativas locais.',
    'Explorar a história do bairro e da comunidade escolar.',
    'Conhecer profissões do passado e do presente.'
  ],
  'Geografia': [
    'Identificar diferentes tipos de paisagens (natural e cultural).',
    'Localizar pontos de referência no trajeto casa-escola.',
    'Compreender a relação entre campo e cidade.',
    'Explorar os diferentes meios de transporte e comunicação.'
  ]
};

export const LOCAL_STEPS_TEMPLATES = [
  { time: '10 min', title: 'Acolhida e Roda de Conversa', description: 'Receber os alunos com uma música temática e perguntar o que eles já sabem sobre [TEMA].' },
  { time: '15 min', title: 'Explicação Teórica', description: 'Apresentar os conceitos fundamentais de [TEMA] de forma visual, usando cartazes ou o quadro.' },
  { time: '20 min', title: 'Atividade Prática', description: 'Realizar exercícios de fixação em grupo ou duplas para aplicar o conteúdo de [TEMA].' },
  { time: '5 min', title: 'Encerramento', description: 'Revisar os pontos principais e esclarecer dúvidas finais dos alunos.' }
];

export const getLocalActivityQuestions = (theme: string, type: ActivityType, count: number): any[] => {
  const questions = [];
  for (let i = 1; i <= count; i++) {
    questions.push({
      instruction: `Exercício ${i} sobre ${theme}`,
      content: `Baseado no que estudamos hoje, escreva ou desenhe sobre ${theme} no espaço abaixo.\n____________________________________________________\n____________________________________________________`,
      answer: 'Resposta pessoal baseada no conteúdo de sala.'
    });
  }
  return questions;
};
