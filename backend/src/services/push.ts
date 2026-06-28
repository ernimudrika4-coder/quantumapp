import webpush from 'web-push';
import { env } from '../config/env';

export function configureWebPush() {
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) return false;
  webpush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
  return true;
}

export async function sendWebPush(subscription: webpush.PushSubscription, payload: Record<string, unknown>) {
  return webpush.sendNotification(subscription, JSON.stringify(payload));
}
