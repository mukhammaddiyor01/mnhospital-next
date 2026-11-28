import { ReactNode } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useWorkspaceText } from './useWorkspaceText';
export default function PatientGate({
	children,
	title,
}: {
	children: ReactNode;
	title: string;
}) {
	const router = useRouter();
	const session = useReactiveVar(userVar);
	const w = useWorkspaceText();
	return (
		<div className="clinical-inner-page">
			<section className="clinical-inner-hero">
				<h1>{title}</h1>
				<Link href="/mypage">{w('details')}</Link>
			</section>
			{session._id && session.memberType === MemberType.PATIENT ? (
				children
			) : (
				<section className="clinical-inner-section">
					<p>{w('session')}</p>
					<Link href={`/account/signin?redirect=${encodeURIComponent(router.asPath)}`}>{w('approve')}</Link>
				</section>
			)}
		</div>
	);
}
