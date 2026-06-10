import { useState } from 'react';

import { enviarNotificacaoLocalDeTeste } from '@src/services/notifications';

function mensagemErroNotificacao(err: unknown): string {
  return err instanceof Error ? err.message : 'Erro desconhecido';
}

export function useTestarNotificacao() {
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  const enviar = async () => {
    setCarregando(true);
    setMensagem('');
    setErro('');

    try {
      await enviarNotificacaoLocalDeTeste();
      setMensagem('Notificacao local enviada!');
      console.log('Notificacao local enviada');
    } catch (err) {
      setErro(mensagemErroNotificacao(err));
      console.error('Erro:', err);
    } finally {
      setCarregando(false);
    }
  };

  return { enviar, carregando, mensagem, erro };
}
