import { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import PatientGate from '@/libs/components/workspace/PatientGate';
import { useWorkspaceText } from '@/libs/components/workspace/useWorkspaceText';
import { MY_PAYMENT } from '@/apollo/workspace/patientOperations';
import { userVar } from '@/apollo/store';
import { useReactiveVar } from '@apollo/client';
import { MemberType } from '@/libs/components/member/enums/member.enum';

function PaymentResultPage() {
	const w = useWorkspaceText();
	const router = useRouter();
	const session = useReactiveVar(userVar);
	const paymentId = typeof router.query.paymentId === 'string' ? router.query.paymentId : '';
	const validId = /^[a-f\d]{24}$/i.test(paymentId);
	const result = useQuery(MY_PAYMENT, {
		variables: { paymentId },
		skip: !router.isReady || !validId || !session._id || session.memberType !== MemberType.PATIENT,
		fetchPolicy: 'network-only',
	});
	const payment = result.data?.getMyPayment;
	return <PatientGate title={w('payments')}>
		<section className="clinical-inner-section clinical-resource-panel">
			{result.loading && <p role="status">{w('paymentChecking')}</p>}
			{(result.error || (router.isReady && !validId)) && <p role="alert">{w('paymentUnavailable')}</p>}
			{payment && <p>{payment.paymentAmount} {payment.paymentCurrency} · {w('status')}: {payment.paymentStatus}</p>}
			<p>{w('paymentNotice')}</p>
			<div className="clinical-resource-actions">
				{validId && <button disabled={result.loading} type="button" onClick={() => void result.refetch().catch(() => undefined)}>{w('refresh')}</button>}
				<Link href="/mypage/payments">{w('payments')}</Link>
				<Link href="/mypage/bookings">{w('bookings')}</Link>
			</div>
		</section>
	</PatientGate>;
}

export default withLayoutMain(PaymentResultPage);
