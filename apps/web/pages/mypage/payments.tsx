import withLayoutMain from '@/libs/components/layout/LayoutHome';
import PatientGate from '@/libs/components/workspace/PatientGate';
import PatientPayments from '@/libs/components/workspace/PatientPayments';
import { useWorkspaceText } from '@/libs/components/workspace/useWorkspaceText';
function Page() {
	const w = useWorkspaceText();
	return (
		<PatientGate title={w('payments')}>
			<PatientPayments />
		</PatientGate>
	);
}
export default withLayoutMain(Page);
