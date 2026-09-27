import Link from 'next/link';
import { useQuery, useReactiveVar } from '@apollo/client';
import { GET_MEMBER } from '@/apollo/member/query';
import { userVar } from '@/apollo/store';
import { logOut } from '@/libs/auth';
import Icon from '@/libs/components/common/Icon';
import { resolveApiAsset } from '@/libs/config';

const PatientProfile = () => {
	const session = useReactiveVar(userVar);
	const { data, loading, error } = useQuery(GET_MEMBER, {
		variables: { memberId: session._id },
		skip: !session._id,
		fetchPolicy: 'cache-and-network',
	});
	const member = data?.getMember ?? session;
	const displayName = member.memberFullName || member.memberNick || 'MN Hospital patient';
	const initials = displayName.split(' ').map((part: string) => part[0]).join('').slice(0, 2).toUpperCase();

	if (!session._id) return <section className="clinical-inner-section clinical-auth-gate"><span className="clinical-profile-large"><Icon name="lock" /></span><span className="clinical-section-kicker">PATIENT PORTAL</span><h2>Sign in to view your care profile.</h2><p>Your appointments, account details, and hospital activity are protected.</p><div><Link className="clinical-primary-button" href="/account/signin">Sign In</Link><Link className="clinical-secondary-button" href="/account/join">Create account</Link></div></section>;

	return <>
		<section className="clinical-inner-section clinical-patient-profile">
			<div className="clinical-patient-identity"><span className="clinical-profile-large" style={member.memberImage ? { backgroundImage: `url(${resolveApiAsset(member.memberImage)})` } : undefined}>{member.memberImage ? null : initials}</span><div><span className="clinical-section-kicker">{String(member.memberType ?? 'PATIENT').replaceAll('_', ' ')}</span><h2>{displayName}</h2><p>@{member.memberNick} · {String(member.memberStatus ?? 'ACTIVE').toLowerCase()}</p></div></div>
			<div className="clinical-profile-contact"><span><Icon name="call" /><small>Phone</small><b>{member.memberPhone || 'Not provided'}</b></span><span><Icon name="mail" /><small>Email</small><b>{member.memberMail || 'Not provided'}</b></span><span><Icon name="verified_user" /><small>Account</small><b>{String(member.memberAuthType ?? 'PHONE').replaceAll('_', ' ')}</b></span></div>
			{loading ? <p className="clinical-query-status">Refreshing your profile…</p> : null}{error ? <p className="clinical-form-error">Live profile data is unavailable. Showing your secure session details.</p> : null}
		</section>
		<section className="clinical-mypage-grid">
			<Link href="/appointment"><Icon name="calendar_month" /><div><h3>Book an appointment</h3><p>Choose a service, specialist, and available time.</p></div><Icon name="arrow_forward" /></Link>
			<Link href="/doctor"><Icon name="stethoscope" /><div><h3>Find a specialist</h3><p>Browse doctors by name and medical specialty.</p></div><Icon name="arrow_forward" /></Link>
			<Link href="/service"><Icon name="medical_services" /><div><h3>Explore services</h3><p>Review active hospital services and departments.</p></div><Icon name="arrow_forward" /></Link>
			<button type="button" onClick={() => void logOut()}><Icon name="logout" /><div><h3>Sign out</h3><p>Securely close your current patient session.</p></div><Icon name="arrow_forward" /></button>
		</section>
	</>;
};

export default PatientProfile;
