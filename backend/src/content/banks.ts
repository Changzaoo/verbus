import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import type { Theme } from './skeleton.js';

/** Palavra de vocabulário: PT -> idioma. Para escrita não-latina o `term` usa "nativo (romanização)". */
export interface Term {
  pt: string;
  term: string;
}

/** Frase de aprendizado (estilo Duolingo). `term` vem TOKENIZADO (palavras separadas por espaço). */
export interface Sentence {
  pt: string;
  term: string;
  roman?: string;
}

export interface Bank {
  words: Partial<Record<Theme, Term[]>>;
  sentences: Partial<Record<Theme, Sentence[]>>;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, 'data');

/** Bancos embutidos mínimos (fallback caso falte o arquivo do idioma). */
const BUILTIN_WORDS: Record<string, Partial<Record<Theme, Term[]>>> = {
  en: {
    greetings: [{ pt: 'olá', term: 'hello' }, { pt: 'tchau', term: 'goodbye' }, { pt: 'obrigado', term: 'thank you' }, { pt: 'por favor', term: 'please' }, { pt: 'sim', term: 'yes' }, { pt: 'não', term: 'no' }],
    numbers_colors: [{ pt: 'um', term: 'one' }, { pt: 'dois', term: 'two' }, { pt: 'três', term: 'three' }, { pt: 'vermelho', term: 'red' }, { pt: 'azul', term: 'blue' }, { pt: 'verde', term: 'green' }],
    family: [{ pt: 'mãe', term: 'mother' }, { pt: 'pai', term: 'father' }, { pt: 'irmão', term: 'brother' }, { pt: 'irmã', term: 'sister' }, { pt: 'amigo', term: 'friend' }, { pt: 'família', term: 'family' }],
    food: [{ pt: 'água', term: 'water' }, { pt: 'pão', term: 'bread' }, { pt: 'maçã', term: 'apple' }, { pt: 'leite', term: 'milk' }, { pt: 'café', term: 'coffee' }, { pt: 'arroz', term: 'rice' }],
    animals_nature: [{ pt: 'cachorro', term: 'dog' }, { pt: 'gato', term: 'cat' }, { pt: 'pássaro', term: 'bird' }, { pt: 'peixe', term: 'fish' }, { pt: 'árvore', term: 'tree' }, { pt: 'sol', term: 'sun' }],
    home_daily: [{ pt: 'casa', term: 'house' }, { pt: 'porta', term: 'door' }, { pt: 'mesa', term: 'table' }, { pt: 'cama', term: 'bed' }, { pt: 'cadeira', term: 'chair' }, { pt: 'janela', term: 'window' }],
    travel: [{ pt: 'cidade', term: 'city' }, { pt: 'rua', term: 'street' }, { pt: 'carro', term: 'car' }, { pt: 'hotel', term: 'hotel' }, { pt: 'mapa', term: 'map' }, { pt: 'praia', term: 'beach' }],
    conversation: [{ pt: 'amor', term: 'love' }, { pt: 'feliz', term: 'happy' }, { pt: 'hoje', term: 'today' }, { pt: 'amanhã', term: 'tomorrow' }, { pt: 'bonito', term: 'beautiful' }, { pt: 'grande', term: 'big' }],
  },
  es: {
    greetings: [{ pt: 'olá', term: 'hola' }, { pt: 'tchau', term: 'adiós' }, { pt: 'obrigado', term: 'gracias' }, { pt: 'por favor', term: 'por favor' }, { pt: 'sim', term: 'sí' }, { pt: 'não', term: 'no' }],
    numbers_colors: [{ pt: 'um', term: 'uno' }, { pt: 'dois', term: 'dos' }, { pt: 'três', term: 'tres' }, { pt: 'vermelho', term: 'rojo' }, { pt: 'azul', term: 'azul' }, { pt: 'verde', term: 'verde' }],
    family: [{ pt: 'mãe', term: 'madre' }, { pt: 'pai', term: 'padre' }, { pt: 'irmão', term: 'hermano' }, { pt: 'irmã', term: 'hermana' }, { pt: 'amigo', term: 'amigo' }, { pt: 'família', term: 'familia' }],
    food: [{ pt: 'água', term: 'agua' }, { pt: 'pão', term: 'pan' }, { pt: 'maçã', term: 'manzana' }, { pt: 'leite', term: 'leche' }, { pt: 'café', term: 'café' }, { pt: 'arroz', term: 'arroz' }],
    animals_nature: [{ pt: 'cachorro', term: 'perro' }, { pt: 'gato', term: 'gato' }, { pt: 'pássaro', term: 'pájaro' }, { pt: 'peixe', term: 'pez' }, { pt: 'árvore', term: 'árbol' }, { pt: 'sol', term: 'sol' }],
    home_daily: [{ pt: 'casa', term: 'casa' }, { pt: 'porta', term: 'puerta' }, { pt: 'mesa', term: 'mesa' }, { pt: 'cama', term: 'cama' }, { pt: 'cadeira', term: 'silla' }, { pt: 'janela', term: 'ventana' }],
    travel: [{ pt: 'cidade', term: 'ciudad' }, { pt: 'rua', term: 'calle' }, { pt: 'carro', term: 'coche' }, { pt: 'hotel', term: 'hotel' }, { pt: 'mapa', term: 'mapa' }, { pt: 'praia', term: 'playa' }],
    conversation: [{ pt: 'amor', term: 'amor' }, { pt: 'feliz', term: 'feliz' }, { pt: 'hoje', term: 'hoy' }, { pt: 'amanhã', term: 'mañana' }, { pt: 'bonito', term: 'bonito' }, { pt: 'grande', term: 'grande' }],
  },
  fr: {
    greetings: [{ pt: 'olá', term: 'bonjour' }, { pt: 'tchau', term: 'au revoir' }, { pt: 'obrigado', term: 'merci' }, { pt: 'por favor', term: "s'il vous plaît" }, { pt: 'sim', term: 'oui' }, { pt: 'não', term: 'non' }],
    numbers_colors: [{ pt: 'um', term: 'un' }, { pt: 'dois', term: 'deux' }, { pt: 'três', term: 'trois' }, { pt: 'vermelho', term: 'rouge' }, { pt: 'azul', term: 'bleu' }, { pt: 'verde', term: 'vert' }],
    family: [{ pt: 'mãe', term: 'mère' }, { pt: 'pai', term: 'père' }, { pt: 'irmão', term: 'frère' }, { pt: 'irmã', term: 'sœur' }, { pt: 'amigo', term: 'ami' }, { pt: 'família', term: 'famille' }],
    food: [{ pt: 'água', term: 'eau' }, { pt: 'pão', term: 'pain' }, { pt: 'maçã', term: 'pomme' }, { pt: 'leite', term: 'lait' }, { pt: 'café', term: 'café' }, { pt: 'arroz', term: 'riz' }],
    animals_nature: [{ pt: 'cachorro', term: 'chien' }, { pt: 'gato', term: 'chat' }, { pt: 'pássaro', term: 'oiseau' }, { pt: 'peixe', term: 'poisson' }, { pt: 'árvore', term: 'arbre' }, { pt: 'sol', term: 'soleil' }],
    home_daily: [{ pt: 'casa', term: 'maison' }, { pt: 'porta', term: 'porte' }, { pt: 'mesa', term: 'table' }, { pt: 'cama', term: 'lit' }, { pt: 'cadeira', term: 'chaise' }, { pt: 'janela', term: 'fenêtre' }],
    travel: [{ pt: 'cidade', term: 'ville' }, { pt: 'rua', term: 'rue' }, { pt: 'carro', term: 'voiture' }, { pt: 'hotel', term: 'hôtel' }, { pt: 'mapa', term: 'carte' }, { pt: 'praia', term: 'plage' }],
    conversation: [{ pt: 'amor', term: 'amour' }, { pt: 'feliz', term: 'heureux' }, { pt: 'hoje', term: "aujourd'hui" }, { pt: 'amanhã', term: 'demain' }, { pt: 'bonito', term: 'beau' }, { pt: 'grande', term: 'grand' }],
  },
};

/** Carrega o banco de um idioma: arquivo gerado por agentes (com palavras + frases) ou embutido. */
export function loadBank(code: string): Bank | null {
  const path = join(DATA_DIR, `${code}.bank.json`);
  if (existsSync(path)) {
    try {
      const data = JSON.parse(readFileSync(path, 'utf-8')) as {
        themes?: Partial<Record<Theme, Term[]>>;
        sentences?: Partial<Record<Theme, Sentence[]>>;
      };
      if (data.themes) return { words: data.themes, sentences: data.sentences ?? {} };
    } catch (e) {
      console.warn(`[banks] ${code}.bank.json inválido:`, (e as Error).message);
    }
  }
  const w = BUILTIN_WORDS[code];
  return w ? { words: w, sentences: {} } : null;
}
