import StaffRolePage from '@/libs/components/dashboard/StaffRolePage';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { NotificationsPage } from '@/pages/mypage/notifications';

export default function DoctorNotifications() { return <StaffRolePage role={MemberType.DOCTOR} titleKey="notifications.title" introKey="notifications.intro"><NotificationsPage embedded /></StaffRolePage>; }
