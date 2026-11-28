import { MemberType } from '@/libs/components/member/enums/member.enum';

export interface ChatParticipant {
  participantId: string;
  participantType: MemberType;
  displayName?: string | null;
  image?: string | null;
}

export interface ChatConversation {
  _id: string;
  participants: ChatParticipant[];
  lastMessageAt?: string | null;
  createdAt: string;
}

export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  senderType: MemberType;
  messageContent: string;
  readAt?: string | null;
  createdAt: string;
}
