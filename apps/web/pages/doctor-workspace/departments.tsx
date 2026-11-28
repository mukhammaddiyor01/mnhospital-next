import WorkspacePage from '@/libs/components/workspace/WorkspacePage';
import ResourcePanel from '@/libs/components/workspace/ResourcePanel';
import { departments } from '@/libs/components/workspace/doctorResources';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useWorkspaceText } from '@/libs/components/workspace/useWorkspaceText';
export default function Page() {
	const w = useWorkspaceText();
	return (
		<WorkspacePage role={MemberType.DOCTOR} title={w('departments')}>
			<ResourcePanel config={departments} />
		</WorkspacePage>
	);
}
