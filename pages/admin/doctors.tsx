import WorkspacePage from '@/libs/components/workspace/WorkspacePage';
import ActorManagement from '@/libs/components/workspace/ActorManagement';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useWorkspaceText } from '@/libs/components/workspace/useWorkspaceText';
export default function Page() {
	const w = useWorkspaceText();
	return (
		<WorkspacePage role={MemberType.ADMIN} title={w('doctor')}>
			<ActorManagement kind="doctor" />
		</WorkspacePage>
	);
}
