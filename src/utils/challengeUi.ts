import type { ChallengeDifficulty } from '@/src/types';

export function labelDificuldade(d: ChallengeDifficulty): string {
  if (d === 'facil') return 'FÁCIL';
  if (d === 'medio') return 'MÉDIO';
  return 'DIFÍCIL';
}
