import Link from 'next/link';
import WorkspacePage from '@/libs/components/workspace/WorkspacePage';
import ResourcePanel from '@/libs/components/workspace/ResourcePanel';
import { doctorBookings } from '@/libs/components/workspace/doctorResources';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useWorkspaceText } from '@/libs/components/workspace/useWorkspaceText';

export default function DoctorBookings() {
	const w = useWorkspaceText();
	return <WorkspacePage role={MemberType.DOCTOR} title={w('bookings')}>
		<p>{w('bookingFlow')}</p>
		<div className="clinical-resource-actions"><Link href="/doctor-workspace/appointments">{w('appointment')}</Link></div>
		<ResourcePanel config={doctorBookings} />
	</WorkspacePage>;
}
