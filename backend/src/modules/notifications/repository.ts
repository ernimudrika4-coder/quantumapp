import { prisma, dbAvailable } from '../../db/prisma';

export async function upsertPushSubscription(params: {
  userId: string;
  platform: string;
  endpoint: string;
  p256dh?: string;
  auth?: string;
}) {
  if (!(await dbAvailable())) return null;
  return prisma.pushSubscription.upsert({
    where: { endpoint: params.endpoint },
    update: {
      userId: params.userId,
      platform: params.platform,
      p256dh: params.p256dh,
      auth: params.auth,
      lastSeenAt: new Date(),
    },
    create: {
      userId: params.userId,
      platform: params.platform,
      endpoint: params.endpoint,
      p256dh: params.p256dh,
      auth: params.auth,
    }
  });
}

export async function listNotifications(userId: string) {
  if (!(await dbAvailable())) return null;
  return prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 50 });
}

export async function createNotification(params: {
  userId: string;
  type: string;
  title: string;
  body: string;
  dataJson?: unknown;
}) {
  if (!(await dbAvailable())) return null;
  return prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      dataJson: params.dataJson as any,
    }
  });
}

export async function markNotificationRead(userId: string, id: string) {
  if (!(await dbAvailable())) return null;
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { readAt: new Date() }
  });
}

export async function markAllNotificationsRead(userId: string) {
  if (!(await dbAvailable())) return null;
  return prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() }
  });
}

export async function listPushSubscriptionsForUser(userId: string) {
  if (!(await dbAvailable())) return null;
  return prisma.pushSubscription.findMany({ where: { userId } });
}
