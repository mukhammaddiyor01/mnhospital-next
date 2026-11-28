import { MemberStatus } from '@/libs/components/member/enums/member.enum';

export interface AdminDoctor {
  _id: string;
  docNick: string;
  docFullName: string;
  docMail?: string;
  docPhone: string;
  docSpecialty?: string;
  docRoom: string;
  memberStatus: MemberStatus;
  createdAt: string;
}

export interface AdminReceptionist {
  _id: string;
  receptionistNick: string;
  receptionistFullName: string;
  receptionistPhone: string;
  receptionistMail: string;
  memberStatus: MemberStatus;
  createdAt: string;
}

export type AdminServiceStatus = 'ACTIVE' | 'RESERVED' | 'STARTED' | 'ENDED' | 'INACTIVE' | 'UNAVAILABLE' | 'DELETED';

export interface AdminServiceItem {
  _id: string;
  serviceName: string;
  serviceTitle: string;
  serviceType: string;
  servicePrice: number;
  serviceStatus: AdminServiceStatus;
  memberId: string;
  createdAt: string;
}

export interface AdminList<T> {
  list: T[];
  metaCounter: { total?: number }[];
}
