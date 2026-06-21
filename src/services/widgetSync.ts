import React from 'react';
import { Platform } from 'react-native';

import { StreakWidget } from '@src/widgets/StreakWidget';
import { writeWidgetStreak } from '@src/widgets/widgetStorage';

/**
 * Salva a sequência atual e pede ao Android para atualizar o widget
 * na tela inicial imediatamente. É no-op fora do Android.
 */
export async function syncStreakWidget(sequencia: number): Promise<void> {
  await writeWidgetStreak(sequencia);

  if (Platform.OS !== 'android') return;

  try {
    // Import dinâmico evita carregar o módulo nativo em iOS/web.
    const { requestWidgetUpdate } = await import('react-native-android-widget');
    await requestWidgetUpdate({
      widgetName: 'Streak',
      renderWidget: () => React.createElement(StreakWidget, { sequencia }),
      widgetNotFound: () => {
        // Widget ainda não foi adicionado à tela inicial: nada a fazer.
      },
    });
  } catch {
    // Falha silenciosa: o widget atualizará no próximo ciclo periódico.
  }
}
