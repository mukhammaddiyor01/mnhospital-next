import StaffRolePage from '@/libs/components/dashboard/StaffRolePage';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { MessagesPage } from '@/pages/mypage/messages';

export default function DoctorMessages() { return <StaffRolePage role={MemberType.DOCTOR} titleKey="messages.title" introKey="messages.intro"><MessagesPage embedded /></StaffRolePage>; }
