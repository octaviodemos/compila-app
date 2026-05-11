export function mensagemErroAuth(codigo: string): string {
  const mapa: Record<string, string> = {
    'auth/invalid-email': 'E-mail inválido. Verifique e tente novamente.',
    'auth/user-disabled': 'Esta conta foi desativada.',
    'auth/user-not-found': 'Não encontramos uma conta com esse e-mail.',
    'auth/wrong-password': 'Senha incorreta.',
    'auth/invalid-credential':
      'E-mail ou senha incorretos. Tente novamente.',
    'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
    'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
    'auth/network-request-failed':
      'Erro de conexão. Verifique a internet.',
    'auth/too-many-requests':
      'Muitas tentativas. Aguarde um momento e tente de novo.',
  };
  return (
    mapa[codigo] ??
    'Não foi possível concluir a operação. Tente novamente em instantes.'
  );
}
