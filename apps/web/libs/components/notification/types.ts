export type NotificationStatus = 'UNREAD' | 'READ' | 'ARCHIVED';

export interface NotificationItem {
  _id: string;
  notificationType: string;
  notificationStatus: NotificationStatus;
  notificationGroup: string;
  notificationTitle: string;
  notificationDesc: string;
  notificationRefId: string;
  createdAt: string;
}
