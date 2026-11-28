import StaffRolePage from '@/libs/components/dashboard/StaffRolePage';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { MessagesPage } from '@/pages/mypage/messages';

export default function ReceptionistMessages() { return <StaffRolePage role={MemberType.RECEPTIONIST} titleKey="messages.title" introKey="messages.intro"><MessagesPage embedded /></StaffRolePage>; }
