import type { Theme } from './skeleton.js';

/**
 * Roteiro-referência canônico dos diálogos coerentes (estilo Duolingo Stories/DuoRadio).
 *
 * Cada tema tem UM diálogo coerente entre dois personagens:
 *  - 'A' = Byte (o mascote robô)
 *  - 'B' = Lia (a amiga gata exploradora)
 *
 * As falas formam uma conversa de verdade (pergunta → resposta lógica), usando só o
 * vocabulário do tema. Este arquivo é a FONTE DE VERDADE: define título, cenário, ordem
 * das falas, quem fala e o texto em português. Cada idioma fornece apenas o texto-alvo
 * (tokenizado) + romanização, alinhado por índice em `data/<code>.dialogue.json`.
 */

export type Speaker = 'A' | 'B';

export interface RefTurn {
  /** 'A' = Byte, 'B' = Lia */
  sp: Speaker;
  /** Texto em português (legenda/gabarito). */
  pt: string;
}

export interface RefDialogue {
  /** Título curto da cena (PT). */
  title: string;
  /** Descrição da cena para enquadrar história/podcast (PT). */
  setting: string;
  /** Falas em ordem; alternam pergunta/resposta de forma coerente. */
  turns: RefTurn[];
}

export const DIALOGUE_REFERENCE: Record<Theme, RefDialogue> = {
  greetings: {
    title: 'Um bom encontro',
    setting: 'Byte encontra a amiga Lia na rua e os dois se cumprimentam.',
    turns: [
      { sp: 'A', pt: 'Olá! Bom dia!' },
      { sp: 'B', pt: 'Bom dia! Tudo bem?' },
      { sp: 'A', pt: 'Tudo bem, obrigado! E você?' },
      { sp: 'B', pt: 'Estou bem! Prazer em ver você.' },
      { sp: 'A', pt: 'Até logo, amiga!' },
      { sp: 'B', pt: 'Tchau! Até logo!' },
    ],
  },
  numbers_colors: {
    title: 'Contando e colorindo',
    setting: 'Lia mostra a sua casa e os seus bichinhos para o Byte.',
    turns: [
      { sp: 'A', pt: 'Quantos gatos você tem?' },
      { sp: 'B', pt: 'Eu tenho dois gatos.' },
      { sp: 'A', pt: 'De que cor é a sua casa?' },
      { sp: 'B', pt: 'A minha casa é azul.' },
      { sp: 'A', pt: 'Eu vejo três flores vermelhas.' },
      { sp: 'B', pt: 'Que bonito!' },
    ],
  },
  family: {
    title: 'A família da Lia',
    setting: 'Lia mostra uma foto e apresenta a sua família ao Byte.',
    turns: [
      { sp: 'A', pt: 'Esta é a sua família?' },
      { sp: 'B', pt: 'Sim, esta é a minha mãe.' },
      { sp: 'A', pt: 'E quem é ele?' },
      { sp: 'B', pt: 'Ele é o meu pai. Tenho um irmão também.' },
      { sp: 'A', pt: 'A sua família é grande!' },
      { sp: 'B', pt: 'Eu amo a minha família.' },
    ],
  },
  food: {
    title: 'Hora do lanche',
    setting: 'Byte e Lia preparam um lanche juntos na cozinha.',
    turns: [
      { sp: 'A', pt: 'Você quer comer?' },
      { sp: 'B', pt: 'Sim, eu como pão e queijo.' },
      { sp: 'A', pt: 'Você quer beber água?' },
      { sp: 'B', pt: 'Não, eu gosto de café.' },
      { sp: 'A', pt: 'A sopa está pronta!' },
      { sp: 'B', pt: 'Obrigada, a sopa é boa.' },
    ],
  },
  animals_nature: {
    title: 'Um passeio na natureza',
    setting: 'Byte e Lia passeiam e observam os animais e a natureza.',
    turns: [
      { sp: 'A', pt: 'Olha, eu vejo um pássaro!' },
      { sp: 'B', pt: 'O pássaro está na árvore.' },
      { sp: 'A', pt: 'O seu cachorro é grande?' },
      { sp: 'B', pt: 'Sim, e o gato dorme na cama.' },
      { sp: 'A', pt: 'O sol está bonito hoje.' },
      { sp: 'B', pt: 'Eu gosto do rio e das flores.' },
    ],
  },
  home_daily: {
    title: 'Em casa',
    setting: 'Byte visita a casa da Lia e conhece cada cômodo.',
    turns: [
      { sp: 'A', pt: 'Onde está a chave?' },
      { sp: 'B', pt: 'A chave está na mesa.' },
      { sp: 'A', pt: 'A sua casa é grande?' },
      { sp: 'B', pt: 'A casa é pequena, mas eu gosto dela.' },
      { sp: 'A', pt: 'Onde você come?' },
      { sp: 'B', pt: 'Eu como na cozinha.' },
    ],
  },
  verbs_actions: {
    title: 'Planos para o dia',
    setting: 'Byte e Lia decidem o que fazer hoje.',
    turns: [
      { sp: 'A', pt: 'O que você quer fazer hoje?' },
      { sp: 'B', pt: 'Eu quero comer e dormir.' },
      { sp: 'A', pt: 'Você gosta de ler?' },
      { sp: 'B', pt: 'Sim, eu gosto de ler e escrever.' },
      { sp: 'A', pt: 'Vamos andar na cidade?' },
      { sp: 'B', pt: 'Sim, vamos!' },
    ],
  },
  body_health: {
    title: 'Cuidando da saúde',
    setting: 'Lia não está bem e o Byte ajuda.',
    turns: [
      { sp: 'A', pt: 'Você está bem?' },
      { sp: 'B', pt: 'Não, eu tenho dor de cabeça.' },
      { sp: 'A', pt: 'Você precisa de um médico?' },
      { sp: 'B', pt: 'Sim, eu quero um remédio.' },
      { sp: 'A', pt: 'Cuide da sua saúde!' },
      { sp: 'B', pt: 'Obrigada, agora estou melhor.' },
    ],
  },
  work_school: {
    title: 'Dia de escola',
    setting: 'Byte e Lia conversam sobre a escola.',
    turns: [
      { sp: 'A', pt: 'Você vai à escola hoje?' },
      { sp: 'B', pt: 'Sim, eu tenho uma prova.' },
      { sp: 'A', pt: 'O professor é bom?' },
      { sp: 'B', pt: 'Sim, eu gosto da escola.' },
      { sp: 'A', pt: 'Eu leio um livro novo.' },
      { sp: 'B', pt: 'Eu escrevo no meu caderno.' },
    ],
  },
  time_weather: {
    title: 'Como está o tempo?',
    setting: 'Byte e Lia falam sobre o clima do dia.',
    turns: [
      { sp: 'A', pt: 'Como está o tempo hoje?' },
      { sp: 'B', pt: 'Hoje está frio e tem chuva.' },
      { sp: 'A', pt: 'E amanhã?' },
      { sp: 'B', pt: 'Amanhã o dia será bonito.' },
      { sp: 'A', pt: 'Eu gosto da manhã.' },
      { sp: 'B', pt: 'O céu está azul agora.' },
    ],
  },
  travel: {
    title: 'Uma viagem',
    setting: 'Lia se prepara para uma viagem e o Byte ajuda.',
    turns: [
      { sp: 'A', pt: 'Para onde você vai viajar?' },
      { sp: 'B', pt: 'Eu vou para a cidade de trem.' },
      { sp: 'A', pt: 'Onde fica o hotel?' },
      { sp: 'B', pt: 'O hotel fica perto da praia.' },
      { sp: 'A', pt: 'Você tem o bilhete?' },
      { sp: 'B', pt: 'Sim, e o meu passaporte também.' },
    ],
  },
  conversation: {
    title: 'Um bom dia',
    setting: 'Byte e Lia conversam sobre como estão se sentindo.',
    turns: [
      { sp: 'A', pt: 'Como você está hoje?' },
      { sp: 'B', pt: 'Eu estou muito feliz!' },
      { sp: 'A', pt: 'Por quê?' },
      { sp: 'B', pt: 'Porque hoje é um bom dia.' },
      { sp: 'A', pt: 'Eu gosto muito de você.' },
      { sp: 'B', pt: 'Você é uma boa amiga.' },
    ],
  },
};

/** Ordem temática dos diálogos (igual ao currículo). */
export const DIALOGUE_THEMES = Object.keys(DIALOGUE_REFERENCE) as Theme[];
