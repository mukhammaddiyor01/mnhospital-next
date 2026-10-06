import withLayoutMain from '@/libs/components/layout/LayoutHome';
import PatientGate from '@/libs/components/workspace/PatientGate';
import PatientCart from '@/libs/components/workspace/PatientCart';
import { useWorkspaceText } from '@/libs/components/workspace/useWorkspaceText';
function Page() {
	const w = useWorkspaceText();
	return (
		<PatientGate title={w('cart')}>
			<PatientCart />
		</PatientGate>
	);
}
export default withLayoutMain(Page);
