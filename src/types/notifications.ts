export type PushNotificationType = 'daily_challenge' | 'reminder';

export interface PushNotificationData {
  screen?: string;
  type?: PushNotificationType;
}
