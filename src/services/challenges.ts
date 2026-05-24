import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    increment,
    limit,
    orderBy,
    query,
    serverTimestamp,
    where,
    writeBatch,
} from 'firebase/firestore';

import type { Challenge, EvaluateResult } from '@src/types';

import { db } from './firebase';

const exemploParSeparador = ' | ';
const exemploSetaSeparador = ' → ';

function parseExemplosFromString(raw: string): Challenge['exemplos'] {
  const result: Challenge['exemplos'] = [];
  for (const segmento of raw.split(exemploParSeparador)) {
    const trecho = segmento.trim();
    if (!trecho) continue;
    const indiceSeta = trecho.indexOf(exemploSetaSeparador);
    if (indiceSeta === -1) continue;
    const esquerda = trecho.slice(0, indiceSeta).trim();
    const direita = trecho
      .slice(indiceSeta + exemploSetaSeparador.length)
      .trim();
    const entradaMatch = esquerda.match(/^Entrada:\s*(.+)$/i);
    const saidaMatch = direita.match(/^Saída:\s*(.+)$/i);
    if (!entradaMatch?.[1] || !saidaMatch?.[1]) continue;
    result.push({
      entrada: entradaMatch[1].trim(),
      saida: saidaMatch[1].trim(),
    });
  }
  return result;
}

function parseExemplosFromFirestore(
  exemplosRaw: unknown
): Challenge['exemplos'] {
  if (Array.isArray(exemplosRaw)) {
    const exemplos: Challenge['exemplos'] = [];
    for (const item of exemplosRaw) {
      if (
        typeof item === 'object' &&
        item !== null &&
        'entrada' in item &&
        'saida' in item &&
        typeof (item as { entrada: unknown }).entrada === 'string' &&
        typeof (item as { saida: unknown }).saida === 'string'
      ) {
        exemplos.push({
          entrada: (item as { entrada: string }).entrada,
          saida: (item as { saida: string }).saida,
        });
      }
    }
    return exemplos;
  }
  if (typeof exemplosRaw === 'string') {
    return parseExemplosFromString(exemplosRaw);
  }
  return [];
}

function mapDocToChallenge(id: string, data: Record<string, unknown>): Challenge {
  const exemplos = parseExemplosFromFirestore(data.exemplos);

  const lang = data.language;
  const language =
    lang === 'javascript' || lang === 'python' ? lang : 'javascript';

  const diff = data.dificuldade;
  const dificuldade =
    diff === 'facil' || diff === 'medio' || diff === 'dificil'
      ? diff
      : 'facil';

  const pontos =
    typeof data.pontos === 'number' && Number.isFinite(data.pontos)
      ? data.pontos
      : 10;

  return {
    id,
    titulo: typeof data.titulo === 'string' ? data.titulo : '',
    descricao: typeof data.descricao === 'string' ? data.descricao : '',
    exemplos,
    dificuldade,
    pontos,
    language,
    ativo: data.ativo === true,
  };
}

export async function getTodayChallenge(): Promise<Challenge | null> {
  if (!db) {
    throw new Error('Firestore não configurado.');
  }

  const q = query(
    collection(db, 'challenges'),
    where('ativo', '==', true),
    orderBy('criadoEm', 'desc'),
    limit(1)
  );

  const snap = await getDocs(q);
  if (snap.empty) {
    return null;
  }

  const docSnap = snap.docs[0]!;
  const data = docSnap.data() as Record<string, unknown>;
  return mapDocToChallenge(docSnap.id, data);
}

export async function saveAttempt(
  uid: string,
  challenge: Challenge,
  answer: string,
  result: EvaluateResult
): Promise<void> {
  if (!db) {
    throw new Error('Firestore não configurado.');
  }

  const attemptsCol = collection(db, 'users', uid, 'attempts');
  const attemptPayload = {
    challengeId: challenge.id,
    titulo: challenge.titulo,
    acertou: result.correct,
    pontos: result.points,
    feedback: result.feedback,
    resposta: answer,
    criadoEm: serverTimestamp(),
  };

  if (result.correct && result.points > 0) {
    const batch = writeBatch(db);
    const attemptRef = doc(attemptsCol);
    batch.set(attemptRef, attemptPayload);
    const userRef = doc(db, 'users', uid);
    batch.update(userRef, {
      pontuacao: increment(result.points),
    });
    await batch.commit();
    return;
  }

  await addDoc(attemptsCol, attemptPayload);
}

export async function getUserPontuacao(uid: string): Promise<number> {
  if (!db) return 0;
  const userSnap = await getDoc(doc(db, 'users', uid));
  if (!userSnap.exists()) return 0;
  const v = userSnap.data()?.pontuacao;
  return typeof v === 'number' && Number.isFinite(v) ? v : 0;
}

export type AttemptListItem = {
  id: string;
  titulo: string;
  acertou: boolean;
  pontos: number;
  criadoEm: Date | null;
};

export async function getUserAttempts(
  uid: string
): Promise<AttemptListItem[]> {
  if (!db) return [];

  const q = query(
    collection(db, 'users', uid, 'attempts'),
    orderBy('criadoEm', 'desc')
  );
  const snap = await getDocs(q);
  const items: AttemptListItem[] = [];
  snap.forEach((d) => {
    const data = d.data() as Record<string, unknown>;
    const ts = data.criadoEm;
    let criadoEm: Date | null = null;
    if (ts && typeof (ts as { toDate?: () => Date }).toDate === 'function') {
      criadoEm = (ts as { toDate: () => Date }).toDate();
    }
    items.push({
      id: d.id,
      titulo: typeof data.titulo === 'string' ? data.titulo : '',
      acertou: data.acertou === true,
      pontos: typeof data.pontos === 'number' ? data.pontos : 0,
      criadoEm,
    });
  });
  return items;
}
