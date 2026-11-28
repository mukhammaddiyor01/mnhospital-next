import WorkspacePage from '@/libs/components/workspace/WorkspacePage';
import BookingManagement from '@/libs/components/workspace/BookingManagement';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useWorkspaceText } from '@/libs/components/workspace/useWorkspaceText';
export default function Page() {
	const w = useWorkspaceText();
	return (
		<WorkspacePage role={MemberType.RECEPTIONIST} title={w('bookings')}>
			<BookingManagement role={MemberType.RECEPTIONIST} />
		</WorkspacePage>
	);
}
