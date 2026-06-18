import type { Challenge, EvaluateResult } from '@src/types';

function extrairNomeFuncao(codigo: string): string | null {
  const fonte = codigo.trim();
  const declaracao = fonte.match(/function\s+([A-Za-z_$][\w$]*)\s*\(/);
  if (declaracao?.[1]) return declaracao[1];

  const variavel = fonte.match(
    /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:function|\(|\w+\s*=>)/
  );
  if (variavel?.[1]) return variavel[1];

  return null;
}

function executarComEntrada(
  codigo: string,
  nomeFunc: string,
  entrada: string
): unknown {
  const script = `${codigo}\n${nomeFunc}(${entrada});`;
  return eval(script);
}

function valoresIguais(obtido: unknown, esperado: string): boolean {
  const obtidoTexto = String(obtido).trim();
  const esperadoTexto = esperado.trim();
  if (obtidoTexto === esperadoTexto) return true;

  const semAspas = (valor: string) =>
    valor.replace(/^["']+|["']+$/g, '').replace(/^"|"$/g, '');
  return semAspas(obtidoTexto) === semAspas(esperadoTexto);
}

export function evaluateLocally(
  challenge: Challenge,
  userAnswer: string
): EvaluateResult | null {
  if (challenge.dificuldade !== 'facil' || challenge.exemplos.length === 0) {
    return null;
  }

  const codigo = userAnswer.trim();
  if (!codigo) return null;

  const nomeFunc = extrairNomeFuncao(codigo);
  if (!nomeFunc) return null;

  try {
    for (const exemplo of challenge.exemplos) {
      let obtido: unknown;
      try {
        obtido = executarComEntrada(codigo, nomeFunc, exemplo.entrada);
      } catch {
        return null;
      }

      if (!valoresIguais(obtido, exemplo.saida)) {
        return {
          correct: false,
          points: 0,
          feedback: `Exemplo falhou — Entrada: ${exemplo.entrada}, esperado: ${exemplo.saida}, obtido: ${String(obtido)}`,
        };
      }
    }

    return {
      correct: true,
      points: challenge.pontos,
      feedback: 'Todos os exemplos passaram! Sua solução está correta.',
    };
  } catch {
    return null;
  }
}
