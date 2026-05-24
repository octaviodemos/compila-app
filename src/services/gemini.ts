import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

import type { Challenge, EvaluateResult } from '@src/types/index';

export async function evaluateAnswer(
  challenge: Challenge,
  userAnswer: string
): Promise<EvaluateResult> {
  const apiKey = process.env.EXPO_PUBLIC_LLM_API_KEY;
  if (!apiKey) {
    throw new Error('Defina EXPO_PUBLIC_LLM_API_KEY no arquivo .env');
  }

  const google = createGoogleGenerativeAI({ apiKey });
  // const model = google('gemma-3-27b-it');
  const model = google('gemini-2.0-flash-lite');

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
    throw new Error('Resposta inválida do modelo');
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
        throw new Error('Resposta inválida do modelo');
      }
    }
    throw new Error('Resposta inválida do modelo');
  }
}
