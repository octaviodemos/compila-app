import type { Challenge, ChallengeDifficulty } from '@src/types';

export const LINGUAGENS_ACEITAS =
  'C, Kotlin, Python, JavaScript, C#, Go e outras';

export function textoAceitaMultiplasLinguagens(): string {
  return `Aceita qualquer linguagem: ${LINGUAGENS_ACEITAS}.`;
}

export function textoRespostaMultiLinguagem(): string {
  return `Use a linguagem que preferir — ${LINGUAGENS_ACEITAS}.`;
}

export function labelDificuldade(d: ChallengeDifficulty): string {
  if (d === 'facil') return 'FÁCIL';
  if (d === 'medio') return 'MÉDIO';
  return 'DIFÍCIL';
}

export function gerarDicaDesafio(challenge: Challenge): string {
  const linhas = [textoRespostaMultiLinguagem()];
  const primeiro = challenge.exemplos[0];

  if (primeiro) {
    linhas.push(
      `No primeiro exemplo, a entrada "${primeiro.entrada}" deve produzir a saída "${primeiro.saida}".`
    );
  }

  if (challenge.exemplos.length > 1) {
    linhas.push(
      'Compare todos os exemplos para identificar o padrão antes de escrever o código.'
    );
  }

  linhas.push(
    'O importante é a lógica correta — a linguagem escolhida não importa para a avaliação.'
  );

  return linhas.join('\n\n');
}
