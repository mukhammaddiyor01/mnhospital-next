import { gql } from '@apollo/client';

export const GET_MY_CONVERSATIONS = gql`
  query GetMyConversations($input: ChatInquiry!) {
    getMyConversations(input: $input) {
      list { _id conversationType participants { participantId participantType displayName image } lastMessageAt createdAt updatedAt }
      total
    }
  }
`;

export const GET_MY_MESSAGES = gql`
  query GetMyMessages($conversationId: String!, $input: ChatInquiry!) {
    getMyMessages(conversationId: $conversationId, input: $input) {
      list { _id conversationId senderId senderType messageContent replyToMessageId readAt createdAt updatedAt }
      total
    }
  }
`;
