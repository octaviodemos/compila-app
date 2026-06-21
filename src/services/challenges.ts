import {
    addDoc,
    collection,
    doc,
    getCountFromServer,
    getDoc,
    getDocs,
    increment,
    limit,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
    writeBatch,
} from 'firebase/firestore';

import type { Challenge, EvaluateResult, UserPlano } from '@src/types';

import { db } from './firebase';

export type UserPublicProfile = {
  uid: string;
  username: string;
  bio: string;
  email: string;
  pontuacao: number;
  sequencia: number;
  plano: UserPlano;
};

export type RankingItem = {
  uid: string;
  username: string;
  pontuacao: number;
};

const RANKING_DEFAULT_LIMIT = 10;

function parsePlano(valor: unknown): UserPlano {
  return valor === 'pro' ? 'pro' : 'free';
}

export function normalizarUserPlano(
  valor: UserPlano | null | undefined
): UserPlano {
  return valor === 'pro' ? 'pro' : 'free';
}

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

export async function getTodayChallenge(
  plano: UserPlano
): Promise<Challenge | null> {
  if (!db) {
    throw new Error('Firestore não configurado.');
  }

  const challengesCol = collection(db, 'challenges');
  let docsOrdenados;

  if (plano === 'free') {
    try {
      const snap = await getDocs(
        query(
          challengesCol,
          where('ativo', '==', true),
          where('dificuldade', '==', 'facil')
        )
      );
      docsOrdenados = [...snap.docs];
    } catch {
      const fallback = await getDocs(
        query(challengesCol, where('ativo', '==', true))
      );
      docsOrdenados = fallback.docs.filter((d) => {
        const data = d.data() as Record<string, unknown>;
        return data.dificuldade === 'facil';
      });
    }
  } else {
    const snap = await getDocs(query(challengesCol, where('ativo', '==', true)));
    docsOrdenados = [...snap.docs];
  }

  if (docsOrdenados.length === 0) {
    return null;
  }

  docsOrdenados.sort((a, b) => a.id.localeCompare(b.id));
  const hoje = new Date();
  const diasDesdeEpoch = Math.floor(hoje.getTime() / (1000 * 60 * 60 * 24));
  const indice = diasDesdeEpoch % docsOrdenados.length;
  const docSnap = docsOrdenados[indice]!;
  const data = docSnap.data() as Record<string, unknown>;
  return mapDocToChallenge(docSnap.id, data);
}

export async function getChallengeById(id: string): Promise<Challenge | null> {
  if (!db) {
    throw new Error('Firestore não configurado.');
  }

  const snap = await getDoc(doc(db, 'challenges', id));
  if (!snap.exists()) return null;

  const data = snap.data() as Record<string, unknown>;
  return mapDocToChallenge(snap.id, data);
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
    await calculateAndUpdateStreak(uid);
    return;
  }

  await addDoc(attemptsCol, attemptPayload);
  if (result.correct) {
    await calculateAndUpdateStreak(uid);
  }
}

function formatarChaveDia(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export async function calculateAndUpdateStreak(uid: string): Promise<number> {
  if (!db) {
    throw new Error('Firestore não configurado.');
  }

  const attemptsCol = collection(db, 'users', uid, 'attempts');
  const q = query(attemptsCol, orderBy('criadoEm', 'desc'));
  const snap = await getDocs(q);

  const hoje = new Date();
  const chaveHoje = formatarChaveDia(hoje);
  const diasComAcerto = new Set<string>();

  snap.forEach((d) => {
    const data = d.data() as Record<string, unknown>;
    if (data.acertou !== true) return;
    const ts = data.criadoEm;
    if (ts && typeof (ts as { toDate?: () => Date }).toDate === 'function') {
      const dataAttempt = (ts as { toDate: () => Date }).toDate();
      diasComAcerto.add(formatarChaveDia(dataAttempt));
      return;
    }
    if (d.metadata.hasPendingWrites) {
      diasComAcerto.add(chaveHoje);
    }
  });

  let sequencia = 0;
  if (diasComAcerto.has(chaveHoje)) {
    sequencia = 1;
    const cursor = new Date(hoje);
    cursor.setDate(cursor.getDate() - 1);
    while (diasComAcerto.has(formatarChaveDia(cursor))) {
      sequencia += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
  }

  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { sequencia });

  return sequencia;
}

export async function isDesafioResolvidoHoje(uid: string): Promise<boolean> {
  if (!db) return false;

  const attemptsCol = collection(db, 'users', uid, 'attempts');
  // Busca só as tentativas mais recentes (ordenadas por data) em vez de
  // todas — basta saber se alguma de hoje foi acertada.
  const snap = await getDocs(
    query(attemptsCol, orderBy('criadoEm', 'desc'), limit(20))
  );

  const chaveHoje = formatarChaveDia(new Date());
  let resolvido = false;
  snap.forEach((d) => {
    if (resolvido) return;
    const data = d.data() as Record<string, unknown>;
    if (data.acertou !== true) return;
    const ts = data.criadoEm;
    if (ts && typeof (ts as { toDate?: () => Date }).toDate === 'function') {
      const dataAttempt = (ts as { toDate: () => Date }).toDate();
      if (formatarChaveDia(dataAttempt) === chaveHoje) resolvido = true;
      return;
    }
    if (d.metadata.hasPendingWrites) {
      resolvido = true;
    }
  });

  return resolvido;
}

export async function createUser(
  uid: string,
  data: { username: string; email: string }
): Promise<void> {
  if (!db) {
    throw new Error('Firestore não configurado.');
  }
  await setDoc(doc(db, 'users', uid), {
    username: data.username.trim(),
    email: data.email.trim(),
    pontuacao: 0,
    sequencia: 0,
    plano: 'free',
    criadoEm: serverTimestamp(),
  });
}

export async function updateUserPlano(
  uid: string,
  plano: UserPlano
): Promise<void> {
  if (!db) {
    throw new Error('Firestore não configurado.');
  }
  await updateDoc(doc(db, 'users', uid), { plano });
}

export async function getUserProfile(
  uid: string
): Promise<UserPublicProfile | null> {
  if (!db) return null;
  const userSnap = await getDoc(doc(db, 'users', uid));
  if (!userSnap.exists()) return null;
  const data = userSnap.data();
  return {
    uid,
    username: typeof data.username === 'string' ? data.username : '',
    bio: typeof data.bio === 'string' ? data.bio : '',
    email: typeof data.email === 'string' ? data.email : '',
    pontuacao:
      typeof data.pontuacao === 'number' && Number.isFinite(data.pontuacao)
        ? data.pontuacao
        : 0,
    sequencia:
      typeof data.sequencia === 'number' && Number.isFinite(data.sequencia)
        ? data.sequencia
        : 0,
    plano: parsePlano(data.plano),
  };
}

export async function updateUserProfile(
  uid: string,
  data: { username: string; bio: string }
): Promise<void> {
  if (!db) {
    throw new Error('Firestore não configurado.');
  }
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    username: data.username.trim(),
    bio: data.bio.trim(),
  });
}

export async function getRanking(
  limitTo: number = RANKING_DEFAULT_LIMIT
): Promise<RankingItem[]> {
  if (!db) return [];
  const q = query(
    collection(db, 'users'),
    orderBy('pontuacao', 'desc'),
    limit(limitTo)
  );
  const snap = await getDocs(q);
  const items: RankingItem[] = [];
  snap.forEach((d) => {
    const data = d.data() as Record<string, unknown>;
    items.push({
      uid: d.id,
      username: typeof data.username === 'string' ? data.username : '',
      pontuacao:
        typeof data.pontuacao === 'number' && Number.isFinite(data.pontuacao)
          ? data.pontuacao
          : 0,
    });
  });
  return items;
}

export async function getUserPontuacao(uid: string): Promise<number> {
  if (!db) return 0;
  const userSnap = await getDoc(doc(db, 'users', uid));
  if (!userSnap.exists()) return 0;
  const v = userSnap.data()?.pontuacao;
  return typeof v === 'number' && Number.isFinite(v) ? v : 0;
}

export async function getUserTotalAcertos(uid: string): Promise<number> {
  if (!db) return 0;
  const q = query(
    collection(db, 'users', uid, 'attempts'),
    where('acertou', '==', true)
  );
  try {
    const snap = await getCountFromServer(q);
    return snap.data().count;
  } catch {
    const fallback = await getDocs(q);
    return fallback.size;
  }
}

export type AttemptListItem = {
  id: string;
  titulo: string;
  acertou: boolean;
  pontos: number;
  feedback: string;
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
      feedback: typeof data.feedback === 'string' ? data.feedback : '',
      criadoEm,
    });
  });
  return items;
}
