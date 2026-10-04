import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { GET_DOCTOR } from '@/apollo/doctor/query';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import Icon from '@/libs/components/common/Icon';
import { resolveApiAsset } from '@/libs/config';
import CommentsSection from '@/libs/components/comment/CommentsSection';
import { ReferenceGroup } from '@/libs/components/comment/enums/comment.enum';
import FollowButton from '@/libs/components/follow/FollowButton';
import DoctorProfileExtras from '@/libs/components/doctor/DoctorProfileExtras';

const DoctorDetailPage = () => {
	const router = useRouter();
	const [doctorId, setDoctorId] = useState('');
	useEffect(() => {
		if (!router.isReady) return;
		const routeId = typeof router.query.doctorId === 'string' ? router.query.doctorId : window.location.pathname.split('/').filter(Boolean).at(-1) ?? '';
		setDoctorId(routeId);
	}, [router.isReady, router.query.doctorId]);
	const isApiDoctor = /^[a-f\d]{24}$/i.test(doctorId);
	const { data, loading, error, refetch } = useQuery(GET_DOCTOR, {
		variables: { doctorId },
		skip: !router.isReady || !isApiDoctor || !process.env.NEXT_PUBLIC_API_GRAPHQL_URL,
	});
	const doctor = data?.getDoctor;
	const fallbackName = doctorId.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
	const name = doctor?.docFullName ?? (fallbackName || 'MN Hospital specialist');
	const specialty = String(doctor?.docSpecialty ?? 'Medical specialist').replaceAll('_', ' ');
	const initials = name.split(' ').map((part: string) => part[0]).join('').slice(0, 2);

	return <div className="clinical-inner-page">
		<section className="clinical-inner-hero clinical-doctor-profile-hero"><div><div className="clinical-crumb"><Link href="/">Home</Link> / <Link href="/doctor">Doctors</Link> / Profile</div><span className="clinical-eyebrow">SPECIALIST PROFILE</span><h1>{loading ? 'Loading specialist…' : name}</h1><p>{doctor?.docDesc ?? 'Evidence-based care, clear communication, and a treatment plan built around the patient.'}</p></div></section>
		<section className="clinical-inner-section clinical-doctor-profile">
			<div className="clinical-profile-portrait" style={doctor?.docImage ? { backgroundImage: `linear-gradient(145deg, rgba(18, 48, 74, .05), rgba(18, 48, 74, .7)), url(${resolveApiAsset(doctor.docImage)})` } : undefined}><span>{initials}</span></div>
			<div className="clinical-profile-copy"><span className="clinical-section-kicker">{specialty}</span><h2>{name}</h2><p>{doctor?.docDesc ?? 'This profile is shown in preview mode until a matching doctor record is available from the API.'}</p><div className="clinical-profile-facts"><span><Icon name="workspace_premium" /><b>{doctor?.docExperience ?? 10}+ years</b><small>Experience</small></span><span><Icon name="groups" /><b>{doctor?.docPatients ?? 0}</b><small>Patients</small></span><span><Icon name="star" /><b>{Number(doctor?.docPoints ?? 0).toFixed(1)}</b><small>Rating</small></span><span><Icon name="person_add" /><b>{doctor?.docFollowers ?? 0}</b><small>Followers</small></span><span><Icon name="group" /><b>{doctor?.docFollowings ?? 0}</b><small>Following</small></span></div>{error && <p className="clinical-form-error">The specialist profile could not be loaded. Please return to the directory and try again.</p>}<div className="clinical-profile-actions"><Link className="clinical-primary-button" href={`/appointment?doctor=${doctorId}`}>Book an appointment <Icon name="arrow_forward" /></Link>{doctor && <FollowButton targetId={doctor._id} kind="doctor" initialFollowing={Boolean(doctor.meFollowed?.[0]?.myFollowing)} onChanged={refetch} />}<Link className="clinical-secondary-button" href="/doctor">All doctors</Link></div></div>
		</section>
		{doctor && <DoctorProfileExtras doctorId={doctor._id} />}
		{doctor && <CommentsSection targetId={doctor._id} group={ReferenceGroup.DOCTOR} />}
	</div>;
};

export default withLayoutMain(DoctorDetailPage);
