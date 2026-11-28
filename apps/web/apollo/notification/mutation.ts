import { gql } from '@apollo/client';

export const MARK_MY_NOTIFICATION_READ = gql`
  mutation MarkMyNotificationRead($notificationId: String!) {
    markMyNotificationRead(notificationId: $notificationId) { _id notificationStatus }
  }
`;

export const MARK_ALL_MY_NOTIFICATIONS_READ = gql`
  mutation MarkAllMyNotificationsRead {
    markAllMyNotificationsRead
  }
`;

export const ARCHIVE_MY_NOTIFICATION = gql`
  mutation ArchiveMyNotification($notificationId: String!) {
    archiveMyNotification(notificationId: $notificationId) { _id notificationStatus }
  }
`;
