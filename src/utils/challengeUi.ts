import type { Challenge, ChallengeDifficulty } from '@src/types';

export function labelDificuldade(d: ChallengeDifficulty): string {
  if (d === 'facil') return 'FÁCIL';
  if (d === 'medio') return 'MÉDIO';
  return 'DIFÍCIL';
}

export function gerarDicaDesafio(challenge: Challenge): string {
  const linguagem = challenge.language === 'python' ? 'Python' : 'JavaScript';
  const linhas = [`A resposta deve ser em ${linguagem}.`];
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
    'Teste sua lógica mentalmente com os exemplos antes de enviar.'
  );

  return linhas.join('\n\n');
}
