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
  const model = google('gemini-2.5-flash-lite');

  const exemplosFormatados = challenge.exemplos
    .map((e, i) => `Exemplo ${i + 1}: entrada = ${e.entrada}, saída esperada = ${e.saida}`)
    .join('\n');

  const respostaUsuario = userAnswer.trim() || '(resposta vazia)';

  const prompt = `Você é um professor de programação avaliando a resposta de um aluno iniciante em ${challenge.language}.
Seja didático, honesto e gentil. Escreva o feedback em português do Brasil, em tom encorajador, mas sem inventar elogios quando a resposta estiver errada ou incompleta.

DESAFIO
Título: ${challenge.titulo}
Dificuldade: ${challenge.dificuldade}
Linguagem alvo: ${challenge.language}
Pontuação máxima: ${challenge.pontos}

Descrição:
${challenge.descricao}

Exemplos esperados:
${exemplosFormatados}

RESPOSTA DO ALUNO
"""
${respostaUsuario}
"""

COMO AVALIAR
1. Identifique o que o aluno entregou: código completo, código parcial/pseudocódigo, apenas o valor de saída de um exemplo, apenas a entrada copiada, texto explicando a ideia, ou resposta vazia/sem sentido.
2. Verifique se a lógica (mental ou implementada) produz a saída correta para CADA exemplo. Quando o aluno entregou só um número/string, considere se esse valor coincide com a saída esperada de algum exemplo (acerto parcial) ou se é apenas a entrada copiada (não conta como acerto).
3. Atribua pontos de forma proporcional:
   - 0: resposta vazia, fora do tema, ou apenas a entrada copiada.
   - até ${Math.max(1, Math.floor(challenge.pontos * 0.3))}: ideia no caminho certo mas sem código ou com erros graves.
   - até ${Math.max(1, Math.floor(challenge.pontos * 0.7))}: código quase certo, falha em algum caso ou tem bug pequeno.
   - ${challenge.pontos}: solução correta para todos os exemplos. Defina "correct" como true APENAS nesse caso.

FORMATO DO FEEDBACK (campo "feedback")
Escreva 2 a 4 frases curtas cobrindo nesta ordem:
- O que está certo (se houver).
- O que está errado ou faltando, citando exemplo concreto quando possível.
- Próximo passo prático que o aluno pode tentar (sem dar a resposta pronta).
Se a resposta for vazia ou sem sentido, oriente o aluno a escrever o código em ${challenge.language} usando os exemplos como guia.

FORMATO DA SAÍDA
Responda APENAS com JSON válido, sem markdown, sem cercas de código, sem texto antes ou depois. Use exatamente este schema:
{"correct": boolean, "feedback": string, "points": integer entre 0 e ${challenge.pontos}}`;

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
