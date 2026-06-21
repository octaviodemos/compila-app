import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const CANAL_PADRAO = 'default';
const ID_DESAFIO_DIARIO = 'local-desafio-diario';
const ID_LEMBRETE_DIARIO = 'local-lembrete-diario';

// Lembretes de "ofensiva em risco" (estilo Duolingo). São agendados
// apenas para HOJE e somente quando o desafio ainda não foi resolvido.
const RISCO_15_ID = 'local-risco-15';
const RISCO_19_ID = 'local-risco-19';
const RISCO_22_ID = 'local-risco-22';
const RISCO_IDS = [RISCO_15_ID, RISCO_19_ID, RISCO_22_ID];

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

async function configurarCanalAndroid() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(CANAL_PADRAO, {
    name: 'Notificacoes gerais',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#1A56DB',
  });
}

async function garantirPermissaoNotificacoes(): Promise<boolean> {
  await configurarCanalAndroid();

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[Notificacoes] Permissao negada pelo usuario.');
    return false;
  }

  return true;
}

export async function agendarNotificacoesLocaisDiarias(): Promise<void> {
  if (Platform.OS === 'web') return;

  const permitido = await garantirPermissaoNotificacoes();
  if (!permitido) return;

  await Notifications.cancelScheduledNotificationAsync(ID_DESAFIO_DIARIO).catch(
    () => {}
  );
  // Lembrete genérico antigo das 23h foi substituído pelos lembretes de risco.
  await Notifications.cancelScheduledNotificationAsync(ID_LEMBRETE_DIARIO).catch(
    () => {}
  );

  await Notifications.scheduleNotificationAsync({
    identifier: ID_DESAFIO_DIARIO,
    content: {
      title: 'Desafio do dia disponível!',
      body: 'Você tem um novo desafio. Resolva para manter sua ofensiva 🔥',
      data: { screen: '/(tabs)/desafio', type: 'daily_challenge' },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      channelId: CANAL_PADRAO,
      hour: 10,
      minute: 0,
    },
  });
}

type ContextoOfensiva = {
  resolvidoHoje: boolean;
  sequencia: number;
};

/**
 * Reagenda (estilo Duolingo) os lembretes de "ofensiva em risco" para HOJE.
 * Cancela os antigos sempre. Só agenda novos se o desafio ainda não foi
 * resolvido e existe uma ofensiva a preservar. Os horários já passados
 * no dia são ignorados.
 */
export async function reagendarLembretesOfensiva(
  contexto: ContextoOfensiva
): Promise<void> {
  if (Platform.OS === 'web') return;

  const permitido = await garantirPermissaoNotificacoes();
  if (!permitido) return;

  for (const id of RISCO_IDS) {
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
  }

  if (contexto.resolvidoHoje || contexto.sequencia <= 0) return;

  const seq = contexto.sequencia;
  const dias = `${seq} ${seq === 1 ? 'dia' : 'dias'}`;
  const agora = new Date();

  const lembretes = [
    {
      id: RISCO_15_ID,
      hora: 15,
      title: 'Sua ofensiva está esperando',
      body: `Você ainda não resolveu o desafio de hoje. Mantenha seus ${dias} 🔥`,
    },
    {
      id: RISCO_19_ID,
      hora: 19,
      title: '⚠️ Ofensiva em risco',
      body: `Faltam poucas horas para perder seus ${dias} de ofensiva. Resolva agora!`,
    },
    {
      id: RISCO_22_ID,
      hora: 22,
      title: '🔥 Última chance!',
      body: `Resolva o desafio agora para não zerar seus ${dias} de ofensiva.`,
    },
  ];

  for (const lembrete of lembretes) {
    const quando = new Date(
      agora.getFullYear(),
      agora.getMonth(),
      agora.getDate(),
      lembrete.hora,
      0,
      0
    );
    if (quando.getTime() <= agora.getTime()) continue;

    await Notifications.scheduleNotificationAsync({
      identifier: lembrete.id,
      content: {
        title: lembrete.title,
        body: lembrete.body,
        data: { screen: '/(tabs)/desafio', type: 'streak_risk' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: quando,
        channelId: CANAL_PADRAO,
      },
    });
  }
}

export async function enviarNotificacaoLocalDeTeste(): Promise<void> {
  if (Platform.OS === 'web') {
    throw new Error('Notificacoes locais nao estao disponiveis na web.');
  }

  const permitido = await garantirPermissaoNotificacoes();
  if (!permitido) {
    throw new Error('Permissao de notificacao negada.');
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Desafio do Dia',
      body: 'Voce tem um novo desafio disponivel! Quer tentar?',
      data: { screen: '/(tabs)/desafio', type: 'daily_challenge' },
      sound: true,
    },
    trigger: null,
  });
}
