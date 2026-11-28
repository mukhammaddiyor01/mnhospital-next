import { ReactNode } from 'react';
import Link from 'next/link';
import Icon from '@/libs/components/common/Icon';
import { MessageKey } from '@/libs/i18n/messages';
import { useTranslation } from '@/libs/i18n/useTranslation';

type StaffRole = 'doctor' | 'receptionist' | 'admin';
const portals: Record<StaffRole, {
	label: MessageKey;
	title: MessageKey;
	intro: MessageKey;
	overview: MessageKey;
	icon: string;
	features: { label: MessageKey; icon: string }[];
}> = {
	doctor: {
		label: 'auth.doctorPortal', title: 'auth.doctorWelcome', intro: 'auth.doctorIntro',
		overview: 'dashboard.doctorTitle', icon: 'stethoscope',
		features: [
			{ label: 'dashboard.myServices', icon: 'medical_services' },
			{ label: 'dashboard.myAppointments', icon: 'calendar_month' },
			{ label: 'dashboard.myReports', icon: 'description' },
		],
	},
	receptionist: {
		label: 'dashboard.receptionistSignin', title: 'dashboard.receptionistSignin', intro: 'dashboard.signinIntro',
		overview: 'dashboard.receptionistTitle', icon: 'support_agent',
		features: [
			{ label: 'dashboard.receptionQueue', icon: 'format_list_bulleted' },
			{ label: 'dashboard.patients', icon: 'groups' },
			{ label: 'dashboard.appointments', icon: 'calendar_month' },
		],
	},
	admin: {
		label: 'dashboard.kicker', title: 'dashboard.adminSignin', intro: 'dashboard.signinIntro',
		overview: 'dashboard.adminTitle', icon: 'admin_panel_settings',
		features: [
			{ label: 'dashboard.doctors', icon: 'stethoscope' },
			{ label: 'dashboard.receptionists', icon: 'support_agent' },
			{ label: 'dashboard.patients', icon: 'groups' },
		],
	},
};

const StaffSignInShell = ({ role, children }: { role: StaffRole; children: ReactNode }) => {
	const t = useTranslation();
	const portal = portals[role];
	return (
		<div className={`clinical-role-signin clinical-role-signin--${role}`}>
			<div className="clinical-role-signin-card">
				<aside className="clinical-role-signin-visual" aria-labelledby="staff-portal-overview">
					<Link className="clinical-role-signin-brand" href="/">
						<span><Icon name="local_hospital" /></span>
						<strong>MN Hospital</strong>
					</Link>
					<div className="clinical-role-signin-art" aria-hidden="true">
						<span className="clinical-role-signin-orbit clinical-role-signin-orbit--outer" />
						<span className="clinical-role-signin-orbit clinical-role-signin-orbit--inner" />
						<span className="clinical-role-signin-emblem"><Icon name={portal.icon} /></span>
						{role === 'doctor' && <svg className="clinical-role-signin-pulse" viewBox="0 0 280 60" fill="none"><path d="M0 30h66l10-12 13 25 16-42 19 58 15-29h141" /></svg>}
						{role === 'receptionist' && <div className="clinical-role-signin-queue">{[1, 2, 3].map((number) => <span key={number}><b>0{number}</b><i /><Icon name="check" /></span>)}</div>}
						{role === 'admin' && <><span className="clinical-role-signin-crosshair clinical-role-signin-crosshair--one">+</span><span className="clinical-role-signin-crosshair clinical-role-signin-crosshair--two">+</span><span className="clinical-role-signin-scan" /></>}
					</div>
					<div className="clinical-role-signin-visual-copy">
						<span className="clinical-role-signin-kicker">{t('dashboard.kicker')}</span>
						<h2 id="staff-portal-overview">{t(portal.overview)}</h2>
						<ul>{portal.features.map((feature) => <li key={feature.label}><Icon name={feature.icon} /><span>{t(feature.label)}</span></li>)}</ul>
					</div>
					<span className="clinical-role-signin-index" aria-hidden="true">MN / {role === 'doctor' ? '01' : role === 'receptionist' ? '02' : '03'}</span>
				</aside>
				<section className="clinical-role-signin-content" aria-labelledby="staff-signin-heading">
					<span className="clinical-role-signin-badge"><Icon name={portal.icon} />{t(portal.label)}</span>
					<h1 id="staff-signin-heading" className={role === 'admin' ? 'clinical-role-signin-glitch' : undefined}>
						{t(portal.title)}
						{role === 'admin' && <><span className="clinical-role-signin-glitch-copy clinical-role-signin-glitch-copy--cyan" aria-hidden="true">{t(portal.title)}</span><span className="clinical-role-signin-glitch-copy clinical-role-signin-glitch-copy--pink" aria-hidden="true">{t(portal.title)}</span></>}
					</h1>
					<p className="clinical-role-signin-intro">{t(portal.intro)}</p>
					{children}
					<Link className="clinical-role-signin-return" href="/account/signin"><Icon name="arrow_back" />{t('auth.patientSignin')}</Link>
					<p className="clinical-role-signin-access"><Icon name="lock" />{t('dashboard.restrictedIntro')}</p>
				</section>
			</div>
		</div>
	);
};

export default StaffSignInShell;
