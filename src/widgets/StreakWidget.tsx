import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

type StreakWidgetProps = {
  sequencia: number;
  resolvidoHoje: boolean;
  // Dimensões reais do widget (dp), vindas do widgetInfo. Quando presentes,
  // são usadas no lugar de 'match_parent' para o conteúdo caber exatamente
  // na área do widget e nunca transbordar/cortar a moldura.
  width?: number;
  height?: number;
  // Modo teste: força um estado específico, ignorando o cálculo por horário.
  estadoForcado?: EstadoOfensiva;
};

export type EstadoOfensiva =
  | 'emDia'
  | 'pendente'
  | 'aviso'
  | 'critico'
  | 'zero';

// Cores alinhadas ao tema escuro do app Compila (src/theme/colors.ts).
const COLORS = {
  background: '#0F0F14',
  backgroundCritico: '#1A0C0C',
  text: '#FFFFFF',
  textSecondary: '#6B7280',
  primary: '#7C3AED',
  fogo: '#F59E0B',
  verde: '#1D9E75',
  amarelo: '#EF9F27',
  vermelho: '#E24B4A',
  vermelhoClaro: '#F09595',
  transparente: '#00000000',
};

// Limiares de horario (Duolingo-style): conforme a noite avanca sem
// resolver, o widget fica mais urgente.
const HORA_AVISO = 18;
const HORA_CRITICO = 21;

export function computeEstadoOfensiva(
  sequencia: number,
  resolvidoHoje: boolean,
  hora: number
): EstadoOfensiva {
  if (resolvidoHoje) return 'emDia';
  if (sequencia <= 0) return 'zero';
  if (hora >= HORA_CRITICO) return 'critico';
  if (hora >= HORA_AVISO) return 'aviso';
  return 'pendente';
}

type EstiloEstado = {
  bg: string;
  borderColor: string;
  icone: string;
  corNumero: string;
  legenda: string;
  corLegenda: string;
};

function estiloPorEstado(estado: EstadoOfensiva): EstiloEstado {
  switch (estado) {
    case 'emDia':
      return {
        bg: COLORS.background,
        borderColor: COLORS.verde,
        icone: '🔥',
        corNumero: COLORS.fogo,
        legenda: '✓ Em dia',
        corLegenda: COLORS.verde,
      };
    case 'aviso':
      return {
        bg: COLORS.background,
        borderColor: COLORS.amarelo,
        icone: '⚠️',
        corNumero: COLORS.amarelo,
        legenda: 'Não perca!',
        corLegenda: COLORS.amarelo,
      };
    case 'critico':
      return {
        bg: COLORS.backgroundCritico,
        borderColor: COLORS.vermelho,
        icone: '🔥',
        corNumero: COLORS.vermelho,
        legenda: 'Última chance!',
        corLegenda: COLORS.vermelhoClaro,
      };
    case 'zero':
      return {
        bg: COLORS.background,
        borderColor: COLORS.transparente,
        icone: '💤',
        corNumero: COLORS.textSecondary,
        legenda: 'Começar hoje',
        corLegenda: COLORS.textSecondary,
      };
    case 'pendente':
    default:
      return {
        bg: COLORS.background,
        borderColor: COLORS.transparente,
        icone: '🔥',
        corNumero: COLORS.fogo,
        legenda: 'Resolva hoje',
        corLegenda: COLORS.textSecondary,
      };
  }
}

export function StreakWidget({
  sequencia,
  resolvidoHoje,
  width,
  height,
  estadoForcado,
}: StreakWidgetProps) {
  const hora = new Date().getHours();
  const estado =
    estadoForcado ?? computeEstadoOfensiva(sequencia, resolvidoHoje, hora);
  const s = estiloPorEstado(estado);
  const temBorda = s.borderColor !== COLORS.transparente;
  const frameColor = temBorda ? s.borderColor : s.bg;

  const rootWidth: number | 'match_parent' =
    typeof width === 'number' && width > 0 ? width : 'match_parent';
  const rootHeight: number | 'match_parent' =
    typeof height === 'number' && height > 0 ? height : 'match_parent';

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: rootHeight,
        width: rootWidth,
        backgroundColor: COLORS.transparente,
        padding: 6,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <FlexWidget
        style={{
          height: 'match_parent',
          width: 'match_parent',
          backgroundColor: frameColor,
          borderRadius: 22,
          padding: temBorda ? 3 : 0,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <FlexWidget
          style={{
            height: 'match_parent',
            width: 'match_parent',
            backgroundColor: s.bg,
            borderRadius: temBorda ? 19 : 22,
            paddingHorizontal: 10,
            paddingVertical: 8,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TextWidget
            text="Compila"
            style={{ fontSize: 13, color: COLORS.text, fontWeight: 'bold' }}
          />

          <FlexWidget
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 6,
            }}
          >
            <TextWidget
              text={s.icone}
              style={{ fontSize: 32, marginRight: 6 }}
            />
            <TextWidget
              text={String(sequencia)}
              style={{ fontSize: 42, color: s.corNumero, fontWeight: 'bold' }}
            />
          </FlexWidget>

          <TextWidget
            text={s.legenda}
            style={{
              fontSize: 12,
              color: s.corLegenda,
              marginTop: 4,
              fontWeight: 'bold',
            }}
          />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}
