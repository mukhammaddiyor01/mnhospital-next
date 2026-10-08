import WorkspacePage from '@/libs/components/workspace/WorkspacePage';
import AccountProfileEditor from '@/libs/components/workspace/AccountProfileEditor';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useWorkspaceText } from '@/libs/components/workspace/useWorkspaceText';

export default function AdminProfilePage() {
	const w = useWorkspaceText();
	return (
		<WorkspacePage role={MemberType.ADMIN} title={w('accountProfile')}>
			<AccountProfileEditor role={MemberType.ADMIN} />
		</WorkspacePage>
	);
}
