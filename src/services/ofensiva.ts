import {
  getUserProfile,
  isDesafioResolvidoHoje,
  normalizarUserPlano,
} from '@src/services/challenges';
import { reagendarLembretesOfensiva } from '@src/services/notifications';
import { syncStreakWidget } from '@src/services/widgetSync';
import type { UserPlano } from '@src/types';

export type OfensivaStatus = {
  sequencia: number;
  resolvidoHoje: boolean;
  plano: UserPlano;
};

/**
 * Apenas LÊ o estado da ofensiva (sequência, se resolveu hoje e plano).
 * Rápido o suficiente para alimentar a UI sem efeitos colaterais.
 */
export async function lerStatusOfensiva(
  uid: string | undefined
): Promise<OfensivaStatus> {
  if (!uid) return { sequencia: 0, resolvidoHoje: false, plano: 'free' };

  try {
    const [perfil, resolvido] = await Promise.all([
      getUserProfile(uid),
      isDesafioResolvidoHoje(uid).catch(() => false),
    ]);
    return {
      sequencia: perfil?.sequencia ?? 0,
      resolvidoHoje: resolvido,
      plano: normalizarUserPlano(perfil?.plano),
    };
  } catch {
    return { sequencia: 0, resolvidoHoje: false, plano: 'free' };
  }
}

/**
 * Propaga o estado para o widget da tela inicial e reprograma os lembretes
 * escalonados. São efeitos colaterais: devem rodar em segundo plano, sem
 * bloquear a renderização da UI.
 */
export function propagarOfensiva(status: {
  sequencia: number;
  resolvidoHoje: boolean;
}): void {
  void syncStreakWidget(status.sequencia, status.resolvidoHoje).catch(() => {});
  void reagendarLembretesOfensiva({
    resolvidoHoje: status.resolvidoHoje,
    sequencia: status.sequencia,
  }).catch(() => {});
}

/**
 * Lê o estado e dispara os efeitos colaterais (sem aguardá-los). Retorna o
 * status para a UI. Usado após resolver um desafio.
 */
export async function atualizarOfensiva(
  uid: string | undefined
): Promise<OfensivaStatus> {
  const status = await lerStatusOfensiva(uid);
  propagarOfensiva(status);
  return status;
}
