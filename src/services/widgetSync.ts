import React from 'react';
import { Platform } from 'react-native';

import { StreakWidget, type EstadoOfensiva } from '@src/widgets/StreakWidget';
import { writeWidgetStreak } from '@src/widgets/widgetStorage';

/**
 * Salva o estado da ofensiva e pede ao Android para atualizar o widget
 * na tela inicial imediatamente. É no-op fora do Android. Limpa qualquer
 * estado forçado (modo teste), voltando ao comportamento normal.
 */
export async function syncStreakWidget(
  sequencia: number,
  resolvidoHoje: boolean
): Promise<void> {
  await writeWidgetStreak(sequencia, resolvidoHoje, null);

  if (Platform.OS !== 'android') return;

  try {
    const { requestWidgetUpdate } = await import('react-native-android-widget');
    await requestWidgetUpdate({
      widgetName: 'Streak',
      renderWidget: () =>
        React.createElement(StreakWidget, { sequencia, resolvidoHoje }),
      widgetNotFound: () => {
        // Widget ainda não foi adicionado à tela inicial: nada a fazer.
      },
    });
  } catch {
    // Falha silenciosa: o widget atualizará no próximo ciclo periódico.
  }
}

/**
 * Força um estado específico no widget (modo teste), independente do
 * horário. Persiste para o widget manter o estado em redimensionamentos
 * e atualizações periódicas até o próximo sync normal.
 */
export async function forcarEstadoWidget(
  estado: EstadoOfensiva,
  sequencia: number
): Promise<void> {
  const resolvidoHoje = estado === 'emDia';
  await writeWidgetStreak(sequencia, resolvidoHoje, estado);

  if (Platform.OS !== 'android') return;

  const { requestWidgetUpdate } = await import('react-native-android-widget');
  await requestWidgetUpdate({
    widgetName: 'Streak',
    renderWidget: () =>
      React.createElement(StreakWidget, {
        sequencia,
        resolvidoHoje,
        estadoForcado: estado,
      }),
    widgetNotFound: () => {
      // Widget ainda não foi adicionado à tela inicial: nada a fazer.
    },
  });
}
