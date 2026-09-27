import { makeVar } from '@apollo/client';
import { MemberSession } from '@/libs/components/member/types/member';

export const userVar = makeVar<MemberSession>({ _id: '', memberNick: '' });
