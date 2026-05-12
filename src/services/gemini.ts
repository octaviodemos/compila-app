import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

import type { Challenge, EvaluateResult } from '@/src/types/index';

if (
  process.env.EXPO_PUBLIC_GEMINI_API_KEY &&
  !process.env.GOOGLE_GENERATIVE_AI_API_KEY
) {
  process.env.GOOGLE_GENERATIVE_AI_API_KEY =
    process.env.EXPO_PUBLIC_GEMINI_API_KEY;
}

// usar gemini-2.0-flash-lite que tem limite mais generoso
const model = google('gemini-2.0-flash-lite');

export async function evaluateAnswer(
  challenge: Challenge,
  userAnswer: string
): Promise<EvaluateResult> {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error('Defina GOOGLE_GENERATIVE_AI_API_KEY no arquivo .env');
  }

  const prompt = `
Você é um avaliador de código. Avalie a resposta do usuário para o seguinte desafio de programação.

Desafio: ${challenge.titulo}
Descrição: ${challenge.descricao}
Exemplos:
${challenge.exemplos.map((e) => `Entrada: ${e.entrada} → Saída: ${e.saida}`).join('\n')}

Resposta do usuário:
${userAnswer}

Retorne APENAS um JSON válido, sem markdown, sem texto adicional:
{
  "correct": true ou false,
  "feedback": "explicação em português do que o usuário acertou ou errou",
  "points": número de 0 até ${challenge.pontos}
}
`;

  const { text } = await generateText({
    model,
    prompt,
    temperature: 0.3,
  });

  if (!text) {
    throw new Error('Resposta inválida do Gemini');
  }

  try {
    const json = JSON.parse(text) as Record<string, unknown>;
    return {
      correct: Boolean(json.correct),
      feedback: String(json.feedback),
      points: Number(json.points),
    };
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match?.[0]) {
      try {
        const json = JSON.parse(match[0]) as Record<string, unknown>;
        return {
          correct: Boolean(json.correct),
          feedback: String(json.feedback),
          points: Number(json.points),
        };
      } catch {
        throw new Error('Resposta inválida do Gemini');
      }
    }
    throw new Error('Resposta inválida do Gemini');
  }
}
