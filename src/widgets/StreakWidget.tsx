import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

type StreakWidgetProps = {
  sequencia: number;
};

// Cores alinhadas ao tema escuro do app Compila (src/theme/colors.ts).
const COLORS = {
  background: '#0F0F14',
  card: '#1A1A24',
  text: '#FFFFFF',
  textSecondary: '#6B7280',
  primary: '#7C3AED',
  accent: '#F59E0B',
};

export function StreakWidget({ sequencia }: StreakWidgetProps) {
  const label = sequencia === 1 ? 'dia seguido' : 'dias seguidos';
  const ativo = sequencia > 0;

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: COLORS.background,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Marca */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 6,
        }}
      >
        <TextWidget
          text="Compila"
          style={{
            fontSize: 13,
            color: COLORS.text,
            fontWeight: 'bold',
          }}
        />
      </FlexWidget>

      {/* Chama + número */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <TextWidget
          text={ativo ? '🔥' : '💤'}
          style={{ fontSize: 34, marginRight: 6 }}
        />
        <TextWidget
          text={String(sequencia)}
          style={{
            fontSize: 44,
            color: ativo ? COLORS.accent : COLORS.textSecondary,
            fontWeight: 'bold',
          }}
        />
      </FlexWidget>

      {/* Legenda */}
      <TextWidget
        text={label}
        style={{
          fontSize: 13,
          color: COLORS.textSecondary,
          marginTop: 2,
        }}
      />

      {/* Chamada para ação */}
      <FlexWidget
        style={{
          backgroundColor: COLORS.primary,
          borderRadius: 999,
          paddingHorizontal: 14,
          paddingVertical: 6,
          marginTop: 10,
        }}
      >
        <TextWidget
          text={ativo ? 'Manter sequência' : 'Começar hoje'}
          style={{ fontSize: 11, color: COLORS.text, fontWeight: 'bold' }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
