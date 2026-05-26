export type Achievement = {
  id: string;
  nome: string;
  descricao: string;
  emoji: string;
  cor: string;
  desbloqueada: boolean;
};

export type AchievementStats = {
  pontuacao: number;
  sequencia: number;
  totalAcertos: number;
};

type CriterioFn = (stats: AchievementStats) => boolean;

type AchievementDefinicao = {
  id: string;
  nome: string;
  descricao: string;
  emoji: string;
  cor: string;
  criterio: CriterioFn;
};

const DEFINICOES: AchievementDefinicao[] = [
  {
    id: 'primeiro-passo',
    nome: 'Primeiro Passo',
    descricao: 'Complete seu primeiro desafio',
    emoji: '🥇',
    cor: '#CA8A04',
    criterio: ({ totalAcertos }) => totalAcertos >= 1,
  },
  {
    id: 'persistente',
    nome: 'Persistente',
    descricao: 'Mantenha uma sequência de 7 dias',
    emoji: '🔥',
    cor: '#EA580C',
    criterio: ({ sequencia }) => sequencia >= 7,
  },
  {
    id: 'focado',
    nome: 'Focado',
    descricao: 'Acerte 10 desafios no total',
    emoji: '🎯',
    cor: '#DC2626',
    criterio: ({ totalAcertos }) => totalAcertos >= 10,
  },
  {
    id: 'logico',
    nome: 'Lógico',
    descricao: 'Acerte 50 desafios no total',
    emoji: '🧠',
    cor: '#7C3AED',
    criterio: ({ totalAcertos }) => totalAcertos >= 50,
  },
  {
    id: 'imbativel',
    nome: 'Imbatível',
    descricao: 'Alcance 1.000 pontos',
    emoji: '🏆',
    cor: '#B45309',
    criterio: ({ pontuacao }) => pontuacao >= 1000,
  },
  {
    id: 'lendario',
    nome: 'Lendário',
    descricao: 'Mantenha uma sequência de 30 dias',
    emoji: '👑',
    cor: '#5B21B6',
    criterio: ({ sequencia }) => sequencia >= 30,
  },
];

export function calculateAchievements(
  pontuacao: number,
  sequencia: number,
  totalAcertos: number
): Achievement[] {
  const stats: AchievementStats = { pontuacao, sequencia, totalAcertos };
  return DEFINICOES.map(({ criterio, ...resto }) => ({
    ...resto,
    desbloqueada: criterio(stats),
  }));
}
