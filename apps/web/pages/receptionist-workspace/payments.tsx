import WorkspacePage from '@/libs/components/workspace/WorkspacePage';
import PaymentManagement from '@/libs/components/workspace/PaymentManagement';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useWorkspaceText } from '@/libs/components/workspace/useWorkspaceText';
export default function Page() {
	const w = useWorkspaceText();
	return (
		<WorkspacePage role={MemberType.RECEPTIONIST} title={w('payments')}>
			<PaymentManagement role={MemberType.RECEPTIONIST} />
		</WorkspacePage>
	);
}
