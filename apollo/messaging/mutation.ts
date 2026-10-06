import { gql } from '@apollo/client';

export const START_DIRECT_CONVERSATION = gql`
  mutation StartDirectConversation($input: StartDirectConversationInput!) {
    startDirectConversation(input: $input) {
      _id conversationType participants { participantId participantType displayName image } lastMessageAt createdAt updatedAt
    }
  }
`;

export const SEND_DIRECT_MESSAGE = gql`
  mutation SendDirectMessage($conversationId: String!, $input: SendDirectMessageInput!) {
    sendDirectMessage(conversationId: $conversationId, input: $input) {
      _id conversationId senderId senderType messageContent replyToMessageId readAt createdAt updatedAt
    }
  }
`;

export const MARK_MY_MESSAGES_READ = gql`
  mutation MarkMyMessagesRead($conversationId: String!) {
    markMyMessagesRead(conversationId: $conversationId)
  }
`;
