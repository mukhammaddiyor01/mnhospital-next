import { useMemo } from 'react';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import WorkspacePage from '@/libs/components/workspace/WorkspacePage';
import ResourcePanel from '@/libs/components/workspace/ResourcePanel';
import { doctorSchedule } from '@/libs/components/workspace/doctorResources';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useWorkspaceText } from '@/libs/components/workspace/useWorkspaceText';
export default function Page() {
	const w = useWorkspaceText();
	const session = useReactiveVar(userVar);
	const config = useMemo(() => doctorSchedule(session._id), [session._id]);
	return (
		<WorkspacePage role={MemberType.DOCTOR} title={w('schedule')}>
			<ResourcePanel config={config} />
		</WorkspacePage>
	);
}
