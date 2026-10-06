import withLayoutMain from '@/libs/components/layout/LayoutHome';
import PatientGate from '@/libs/components/workspace/PatientGate';
import PatientBookings from '@/libs/components/workspace/PatientBookings';
import { useWorkspaceText } from '@/libs/components/workspace/useWorkspaceText';
function Page() {
	const w = useWorkspaceText();
	return (
		<PatientGate title={w('bookings')}>
			<PatientBookings />
		</PatientGate>
	);
}
export default withLayoutMain(Page);
