import withLayoutMain from '@/libs/components/layout/LayoutHome';
import PatientGate from '@/libs/components/workspace/PatientGate';
import PatientAppointments from '@/libs/components/workspace/PatientAppointments';
import { useWorkspaceText } from '@/libs/components/workspace/useWorkspaceText';
function Page() {
	const w = useWorkspaceText();
	return (
		<PatientGate title={w('appointment')}>
			<PatientAppointments />
		</PatientGate>
	);
}
export default withLayoutMain(Page);
