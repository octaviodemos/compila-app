export type ChallengeLanguage = 'javascript' | 'python';

export type ChallengeDifficulty = 'facil' | 'medio' | 'dificil';

export interface ChallengeExample {
  entrada: string;
  saida: string;
}

export interface Challenge {
  id: string;
  titulo: string;
  descricao: string;
  exemplos: ChallengeExample[];
  dificuldade: ChallengeDifficulty;
  pontos: number;
  language: ChallengeLanguage;
  ativo?: boolean;
}

export interface UserProfile {
  id: string;
  nomeExibicao: string;
  email: string;
  pontosTotais: number;
  nivel: number;
}

export interface Attempt {
  id: string;
  desafioId: string;
  usuarioId: string;
  dataIso: string;
  pontosObtidos: number;
  concluido: boolean;
}

export interface EvaluateResult {
  correct: boolean;
  feedback: string;
  points: number;
}
