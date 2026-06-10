import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const CANAL_PADRAO = 'default';
const ID_DESAFIO_DIARIO = 'local-desafio-diario';
const ID_LEMBRETE_DIARIO = 'local-lembrete-diario';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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
  const permitido = await garantirPermissaoNotificacoes();
  if (!permitido) return;

  await Notifications.cancelScheduledNotificationAsync(ID_DESAFIO_DIARIO).catch(
    () => {}
  );
  await Notifications.cancelScheduledNotificationAsync(ID_LEMBRETE_DIARIO).catch(
    () => {}
  );

  await Notifications.scheduleNotificationAsync({
    identifier: ID_DESAFIO_DIARIO,
    content: {
      title: 'Desafio do dia disponivel!',
      body: 'Voce tem um novo desafio disponivel. Quer tentar agora?',
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

  await Notifications.scheduleNotificationAsync({
    identifier: ID_LEMBRETE_DIARIO,
    content: {
      title: 'Voce ainda nao completou o desafio!',
      body: 'Ainda da tempo. Que tal resolver agora?',
      data: { screen: '/(tabs)/desafio', type: 'reminder' },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      channelId: CANAL_PADRAO,
      hour: 23,
      minute: 0,
    },
  });

  console.log('[Notificacoes] Agendamentos locais configurados.');
}

export async function enviarNotificacaoLocalDeTeste(): Promise<void> {
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
