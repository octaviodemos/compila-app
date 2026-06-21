import AsyncStorage from '@react-native-async-storage/async-storage';

import type { EstadoOfensiva } from './StreakWidget';

export const WIDGET_STREAK_KEY = '@compila/widget/streak';

const ESTADOS_VALIDOS: EstadoOfensiva[] = [
  'emDia',
  'pendente',
  'aviso',
  'critico',
  'zero',
];

function parseEstadoForcado(valor: unknown): EstadoOfensiva | null {
  return typeof valor === 'string' &&
    (ESTADOS_VALIDOS as string[]).includes(valor)
    ? (valor as EstadoOfensiva)
    : null;
}

export type WidgetStreakData = {
  sequencia: number;
  resolvidoHoje: boolean;
  // Quando definido (modo teste), o widget usa este estado direto, ignorando
  // o cálculo por horário. Em uso normal fica null.
  estadoForcado: EstadoOfensiva | null;
  atualizadoEm: string;
};

/**
 * Lê os dados de sequência salvos pelo app. Usado dentro do
 * widget task handler, que roda em um contexto headless.
 */
export async function readWidgetStreak(): Promise<WidgetStreakData> {
  try {
    const raw = await AsyncStorage.getItem(WIDGET_STREAK_KEY);
    if (!raw) {
      return {
        sequencia: 0,
        resolvidoHoje: false,
        estadoForcado: null,
        atualizadoEm: '',
      };
    }
    const parsed = JSON.parse(raw) as Partial<WidgetStreakData>;
    return {
      sequencia:
        typeof parsed.sequencia === 'number' && Number.isFinite(parsed.sequencia)
          ? parsed.sequencia
          : 0,
      resolvidoHoje: parsed.resolvidoHoje === true,
      estadoForcado: parseEstadoForcado(parsed.estadoForcado),
      atualizadoEm:
        typeof parsed.atualizadoEm === 'string' ? parsed.atualizadoEm : '',
    };
  } catch {
    return {
      sequencia: 0,
      resolvidoHoje: false,
      estadoForcado: null,
      atualizadoEm: '',
    };
  }
}

/** Salva o estado atual da ofensiva para o widget consumir. */
export async function writeWidgetStreak(
  sequencia: number,
  resolvidoHoje: boolean,
  estadoForcado: EstadoOfensiva | null = null
): Promise<void> {
  try {
    const data: WidgetStreakData = {
      sequencia: Number.isFinite(sequencia) ? sequencia : 0,
      resolvidoHoje,
      estadoForcado,
      atualizadoEm: new Date().toISOString(),
    };
    await AsyncStorage.setItem(WIDGET_STREAK_KEY, JSON.stringify(data));
  } catch {
    // Falha silenciosa: o widget apenas mostrará o último valor conhecido.
  }
}
