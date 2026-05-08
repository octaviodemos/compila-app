import { GoogleGenerativeAI } from '@google/generative-ai';

import type { Challenge, ChallengeLanguage } from '@/src/types';

const MODEL = 'gemini-2.0-flash';

const JSON_CHALLENGE_CONFIG = {
  responseMimeType: 'application/json' as const,
  temperature: 0.75,
};

const JSON_EVAL_CONFIG = {
  responseMimeType: 'application/json' as const,
  temperature: 0.35,
};

function requireGeminiKey(): string {
  const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!key) {
    throw new Error('Defina EXPO_PUBLIC_GEMINI_API_KEY no arquivo .env');
  }
  return key;
}

function parseChallengeJson(
  raw: string,
  expectedLanguage: ChallengeLanguage
): Challenge {
  const trimmed = raw.trim();
  const parsed = JSON.parse(trimmed) as unknown;
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Resposta inválida da API');
  }
  const o = parsed as Record<string, unknown>;
  const exemplos = o.exemplos;
  if (!Array.isArray(exemplos) || !exemplos.every((e) => typeof e === 'string')) {
    throw new Error('Campo exemplos inválido');
  }
  const lang = o.language;
  const language: ChallengeLanguage =
    lang === 'javascript' || lang === 'python' ? lang : expectedLanguage;
  if (
    typeof o.id !== 'string' ||
    typeof o.titulo !== 'string' ||
    typeof o.descricao !== 'string' ||
    typeof o.dificuldade !== 'string' ||
    typeof o.pontos !== 'number'
  ) {
    throw new Error('Estrutura do desafio incompleta');
  }
  return {
    id: o.id,
    titulo: o.titulo,
    descricao: o.descricao,
    exemplos,
    dificuldade: o.dificuldade,
    pontos: o.pontos,
    language,
  };
}

function parseEvaluationJson(raw: string): {
  correct: boolean;
  feedback: string;
  points: number;
} {
  const trimmed = raw.trim();
  const parsed = JSON.parse(trimmed) as unknown;
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Resposta de avaliação inválida');
  }
  const o = parsed as Record<string, unknown>;
  if (
    typeof o.correct !== 'boolean' ||
    typeof o.feedback !== 'string' ||
    typeof o.points !== 'number'
  ) {
    throw new Error('Estrutura da avaliação incompleta');
  }
  return {
    correct: o.correct,
    feedback: o.feedback,
    points: o.points,
  };
}

export async function generateChallenge(
  language: ChallengeLanguage
): Promise<Challenge> {
  const genAI = new GoogleGenerativeAI(requireGeminiKey());
  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: JSON_CHALLENGE_CONFIG,
  });

  const prompt = [
    'Gere um único desafio de programação em português.',
    `A solução esperada deve ser pensada na linguagem: ${language}.`,
    'Responda APENAS com um objeto JSON válido, sem markdown, sem texto fora do JSON.',
    'Chaves obrigatórias: id (string uuid v4), titulo, descricao, exemplos (array de strings curtas),',
    'dificuldade (exatamente uma de: fácil, médio, difícil), pontos (inteiro 10 a 100 coerente com a dificuldade),',
    `language (exatamente a string "${language}").`,
  ].join(' ');

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  if (!text) {
    throw new Error('Resposta vazia da API');
  }
  return parseChallengeJson(text, language);
}

export async function evaluateAnswer(
  challenge: Challenge,
  userAnswer: string
): Promise<{ correct: boolean; feedback: string; points: number }> {
  const genAI = new GoogleGenerativeAI(requireGeminiKey());
  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: JSON_EVAL_CONFIG,
  });

  const challengeJson = JSON.stringify({
    id: challenge.id,
    titulo: challenge.titulo,
    descricao: challenge.descricao,
    exemplos: challenge.exemplos,
    dificuldade: challenge.dificuldade,
    pontos: challenge.pontos,
    language: challenge.language,
  });

  const prompt = [
    'Você é avaliador de desafios de programação.',
    'O desafio (JSON):',
    challengeJson,
    'Resposta do usuário (código ou texto):',
    userAnswer.trim() || '(vazio)',
    'Avalie se a resposta atende ao enunciado e aos exemplos.',
    'Responda APENAS com JSON válido, sem markdown, com as chaves:',
    'correct (boolean), feedback (string em português, clara e educativa),',
    `points (número inteiro de 0 a ${challenge.pontos}, sendo ${challenge.pontos} se estiver totalmente correto).`,
  ].join('\n');

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  if (!text) {
    throw new Error('Resposta vazia da API');
  }
  return parseEvaluationJson(text);
}
