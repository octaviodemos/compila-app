import { useRef, useState } from 'react';
import { Platform } from 'react-native';

import { forcarEstadoWidget } from '@src/services/widgetSync';
import type { EstadoOfensiva } from '@src/widgets/StreakWidget';

type ItemCiclo = {
  estado: EstadoOfensiva;
  sequencia: number;
  label: string;
};

// Ordem em que os estados aparecem a cada toque no botão de teste.
const CICLO: ItemCiclo[] = [
  { estado: 'emDia', sequencia: 7, label: 'Em dia (resolvido hoje)' },
  { estado: 'pendente', sequencia: 7, label: 'Pendente (durante o dia)' },
  { estado: 'aviso', sequencia: 7, label: 'Aviso (início da noite)' },
  { estado: 'critico', sequencia: 7, label: 'Crítico (última chance)' },
  { estado: 'zero', sequencia: 0, label: 'Sem ofensiva' },
];

export function useTestarOfensiva() {
  const indiceRef = useRef(0);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const proximoEstado = async () => {
    setCarregando(true);
    setErro('');
    setMensagem('');
    try {
      if (Platform.OS !== 'android') {
        setErro('O widget só existe no Android.');
        return;
      }
      const item = CICLO[indiceRef.current];
      if (!item) return;
      await forcarEstadoWidget(item.estado, item.sequencia);
      setMensagem(`Widget agora: ${item.label}`);
      indiceRef.current = (indiceRef.current + 1) % CICLO.length;
    } catch (e) {
      setErro(
        e instanceof Error ? e.message : 'Não foi possível atualizar o widget.'
      );
    } finally {
      setCarregando(false);
    }
  };

  return { proximoEstado, mensagem, erro, carregando };
}
