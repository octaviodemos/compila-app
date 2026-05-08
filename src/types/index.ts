export type ChallengeLanguage = 'javascript' | 'python';

export interface Challenge {
  id: string;
  titulo: string;
  descricao: string;
  exemplos: string[];
  dificuldade: string;
  pontos: number;
  language: ChallengeLanguage;
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
