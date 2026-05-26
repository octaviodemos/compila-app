import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import { db } from '@src/services/firebase';
import type { ChallengeDifficulty, ChallengeExample } from '@src/types';

export type SeedChallenge = {
  id: string;
  titulo: string;
  descricao: string;
  exemplos: ChallengeExample[];
  dificuldade: ChallengeDifficulty;
  pontos: number;
  language: 'javascript';
  ativo: boolean;
};

export const CHALLENGES: SeedChallenge[] = [
  {
    id: 'soma-dos-digitos',
    titulo: 'Soma dos Dígitos',
    descricao:
      'Dado um número inteiro N, calcule a soma de todos os seus dígitos e imprima o resultado.',
    exemplos: [
      { entrada: '123', saida: '6' },
      { entrada: '9999', saida: '36' },
      { entrada: '5', saida: '5' },
    ],
    dificuldade: 'facil',
    pontos: 10,
    language: 'javascript',
    ativo: true,
  },
  {
    id: 'inverter-string',
    titulo: 'Inverter String',
    descricao:
      'Receba uma string e retorne a versão invertida dela. Considere apenas os caracteres da string original.',
    exemplos: [
      { entrada: '"compila"', saida: '"alipmoc"' },
      { entrada: '"abc"', saida: '"cba"' },
      { entrada: '"a"', saida: '"a"' },
    ],
    dificuldade: 'facil',
    pontos: 10,
    language: 'javascript',
    ativo: true,
  },
  {
    id: 'verificar-palindromo',
    titulo: 'Verificar Palíndromo',
    descricao:
      'Dada uma string, verifique se ela é um palíndromo (lê-se igual de trás para frente). Ignore diferenças entre maiúsculas e minúsculas. Retorne true ou false.',
    exemplos: [
      { entrada: '"arara"', saida: 'true' },
      { entrada: '"Compila"', saida: 'false' },
      { entrada: '"Ovo"', saida: 'true' },
    ],
    dificuldade: 'medio',
    pontos: 15,
    language: 'javascript',
    ativo: true,
  },
  {
    id: 'numero-primo',
    titulo: 'Número Primo',
    descricao:
      'Dado um número inteiro N >= 2, verifique se ele é primo. Retorne true se for, false caso contrário.',
    exemplos: [
      { entrada: '2', saida: 'true' },
      { entrada: '9', saida: 'false' },
      { entrada: '17', saida: 'true' },
    ],
    dificuldade: 'medio',
    pontos: 15,
    language: 'javascript',
    ativo: true,
  },
  {
    id: 'fibonacci',
    titulo: 'Fibonacci',
    descricao:
      'Dado um número N >= 0, retorne o N-ésimo termo da sequência de Fibonacci, sendo fib(0) = 0 e fib(1) = 1.',
    exemplos: [
      { entrada: '0', saida: '0' },
      { entrada: '7', saida: '13' },
      { entrada: '10', saida: '55' },
    ],
    dificuldade: 'dificil',
    pontos: 20,
    language: 'javascript',
    ativo: true,
  },
];

export async function seedIfEmpty(): Promise<number> {
  if (!db) return 0;

  const challengesCol = collection(db, 'challenges');
  const snap = await getDocs(challengesCol);

  if (snap.size >= CHALLENGES.length) return 0;

  const idsExistentes = new Set<string>();
  snap.forEach((d) => idsExistentes.add(d.id));

  let inseridos = 0;
  for (const challenge of CHALLENGES) {
    if (idsExistentes.has(challenge.id)) continue;
    const { id, ...payload } = challenge;
    await setDoc(doc(db, 'challenges', id), {
      ...payload,
      criadoEm: serverTimestamp(),
    });
    inseridos += 1;
  }
  return inseridos;
}
