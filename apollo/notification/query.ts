import { gql } from '@apollo/client';

export const GET_MY_NOTIFICATIONS = gql`
  query GetMyNotifications($input: NotificationInquiry!) {
    getMyNotifications(input: $input) {
      list { _id notificationType notificationStatus notificationGroup notificationTitle notificationDesc notificationRefId createdAt }
      metaCounter { total }
    }
  }
`;
