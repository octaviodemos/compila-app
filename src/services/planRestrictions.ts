import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  where,
} from 'firebase/firestore';

import type { ChallengeDifficulty } from '@src/types';

import { db } from './firebase';

export type CheckAttemptResult = {
  allowed: boolean;
  reason?: string;
};

type AttemptHoje = {
  challengeId: string;
};

function inicioDoDia(): Date {
  const data = new Date();
  data.setHours(0, 0, 0, 0);
  return data;
}

async function getUserPlano(uid: string): Promise<'free' | 'pro'> {
  if (!db) return 'free';
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return 'free';
  const plano = snap.data().plano;
  return plano === 'pro' ? 'pro' : 'free';
}

async function getAttemptsHoje(uid: string): Promise<AttemptHoje[]> {
  if (!db) return [];

  const inicio = Timestamp.fromDate(inicioDoDia());
  const attemptsCol = collection(db, 'users', uid, 'attempts');

  try {
    const q = query(attemptsCol, where('criadoEm', '>=', inicio));
    const snap = await getDocs(q);
    const items: AttemptHoje[] = [];
    snap.forEach((d) => {
      const data = d.data() as Record<string, unknown>;
      const challengeId =
        typeof data.challengeId === 'string' ? data.challengeId : '';
      if (challengeId) items.push({ challengeId });
    });
    return items;
  } catch {
    const snap = await getDocs(attemptsCol);
    const items: AttemptHoje[] = [];
    const limite = inicioDoDia().getTime();
    snap.forEach((d) => {
      const data = d.data() as Record<string, unknown>;
      const ts = data.criadoEm;
      if (!ts || typeof (ts as { toDate?: () => Date }).toDate !== 'function') {
        return;
      }
      const criadoEm = (ts as { toDate: () => Date }).toDate();
      if (criadoEm.getTime() < limite) return;
      const challengeId =
        typeof data.challengeId === 'string' ? data.challengeId : '';
      if (challengeId) items.push({ challengeId });
    });
    return items;
  }
}

export async function checkCanAttempt(
  uid: string,
  challengeDifficulty: ChallengeDifficulty,
  challengeId: string
): Promise<CheckAttemptResult> {
  const plano = await getUserPlano(uid);
  if (plano === 'pro') {
    return { allowed: true };
  }

  if (challengeDifficulty !== 'facil') {
    return {
      allowed: false,
      reason: 'Desafios médios e difíceis são exclusivos do plano Pro',
    };
  }

  const attemptsHoje = await getAttemptsHoje(uid);

  const challengeIdsDistintosHoje = new Set<string>();
  for (const attempt of attemptsHoje) {
    if (attempt.challengeId) {
      challengeIdsDistintosHoje.add(attempt.challengeId);
    }
  }

  const jaTentouOutroDesafioHoje =
    challengeIdsDistintosHoje.size > 0 &&
    !challengeIdsDistintosHoje.has(challengeId);

  if (jaTentouOutroDesafioHoje) {
    return {
      allowed: false,
      reason: 'Você atingiu o limite de 1 desafio por dia do plano gratuito',
    };
  }

  const tentativasNoDesafioAtual = attemptsHoje.filter(
    (attempt) => attempt.challengeId === challengeId
  ).length;

  if (tentativasNoDesafioAtual > 3) {
    return {
      allowed: false,
      reason:
        'Você atingiu o limite de 3 tentativas por dia do plano gratuito',
    };
  }

  return { allowed: true };
}
