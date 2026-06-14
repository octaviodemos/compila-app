import * as Notifications from 'expo-notifications';
import { useRouter, type Href } from 'expo-router';
import { useEffect, useRef } from 'react';

import { useAuth } from '@src/hooks/useAuth';
import { agendarNotificacoesLocaisDiarias } from '@src/services/notifications';
import type { PushNotificationData } from '@src/types/notifications';

export function useNotifications() {
  const { user } = useAuth();
  const router = useRouter();
  const receivedRef = useRef<Notifications.EventSubscription | null>(null);
  const responseRef = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (!user) return;

    agendarNotificacoesLocaisDiarias().catch((error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : 'Nao foi possivel agendar notificacoes locais.';
      console.warn('[Notificacoes] Falha ao agendar:', message);
    });

    function redirecionar(notification: Notifications.Notification) {
      const screen = notification.request.content.data
        ?.screen as PushNotificationData['screen'];
      if (screen) {
        router.push(screen as Href);
      }
    }

    const lastResponse = Notifications.getLastNotificationResponse();
    if (lastResponse?.notification) {
      redirecionar(lastResponse.notification);
    }

    receivedRef.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('[Notificacoes] Recebida:', notification);
      }
    );

    responseRef.current =
      Notifications.addNotificationResponseReceivedListener((res) => {
        redirecionar(res.notification);
      });

    return () => {
      receivedRef.current?.remove();
      responseRef.current?.remove();
    };
  }, [user, router]);
}
