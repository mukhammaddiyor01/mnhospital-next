import StaffRolePage from '@/libs/components/dashboard/StaffRolePage';
import AccountProfileEditor from '@/libs/components/workspace/AccountProfileEditor';
import { MemberType } from '@/libs/components/member/enums/member.enum';

export default function ProfilePage() {
	return (
		<StaffRolePage role={MemberType.RECEPTIONIST} titleKey="dashboard.profileLink" introKey="staff.profileIntro">
			<AccountProfileEditor role={MemberType.RECEPTIONIST} />
		</StaffRolePage>
	);
}
