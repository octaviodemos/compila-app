import AsyncStorage from '@react-native-async-storage/async-storage';

export const WIDGET_STREAK_KEY = '@compila/widget/streak';

export type WidgetStreakData = {
  sequencia: number;
  atualizadoEm: string;
};

/**
 * Lê os dados de sequência salvos pelo app. Usado dentro do
 * widget task handler, que roda em um contexto headless.
 */
export async function readWidgetStreak(): Promise<WidgetStreakData> {
  try {
    const raw = await AsyncStorage.getItem(WIDGET_STREAK_KEY);
    if (!raw) return { sequencia: 0, atualizadoEm: '' };
    const parsed = JSON.parse(raw) as Partial<WidgetStreakData>;
    return {
      sequencia:
        typeof parsed.sequencia === 'number' && Number.isFinite(parsed.sequencia)
          ? parsed.sequencia
          : 0,
      atualizadoEm:
        typeof parsed.atualizadoEm === 'string' ? parsed.atualizadoEm : '',
    };
  } catch {
    return { sequencia: 0, atualizadoEm: '' };
  }
}

/** Salva a sequência atual para o widget consumir. */
export async function writeWidgetStreak(sequencia: number): Promise<void> {
  try {
    const data: WidgetStreakData = {
      sequencia: Number.isFinite(sequencia) ? sequencia : 0,
      atualizadoEm: new Date().toISOString(),
    };
    await AsyncStorage.setItem(WIDGET_STREAK_KEY, JSON.stringify(data));
  } catch {
    // Falha silenciosa: o widget apenas mostrará o último valor conhecido.
  }
}
