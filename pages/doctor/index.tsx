import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import { GET_DOCTORS } from '@/apollo/doctor/query';
import Icon from '@/libs/components/common/Icon';
import { DoctorSpecialty } from '@/libs/components/doctor/enums/doctor.enum';

const fallbackDoctors = [
	{ _id: 'azizbek-rahimov', docFullName: 'Dr. Azizbek Rahimov', docSpecialty: DoctorSpecialty.CARDIOLOGIST, docExperience: 15, docPoints: 4.9 },
	{ _id: 'madina-karimova', docFullName: 'Dr. Madina Karimova', docSpecialty: DoctorSpecialty.GENERAL_PRACTITIONER, docExperience: 12, docPoints: 4.8 },
	{ _id: 'sardor-ergashev', docFullName: 'Dr. Sardor Ergashev', docSpecialty: DoctorSpecialty.DENTIST, docExperience: 10, docPoints: 5 },
];

const DoctorsPage = () => {
	const router = useRouter();
	const [search, setSearch] = useState('');
	const [specialty, setSpecialty] = useState('');
	useEffect(() => { if (router.isReady && typeof router.query.search === 'string') setSearch(router.query.search); }, [router.isReady, router.query.search]);
	const inquiry = { page: 1, limit: 12, sort: 'docPoints', direction: 'DESC', ...(specialty ? { docSpecialty: specialty } : {}), search: { ...(search ? { text: search } : {}) } };
	const { data, loading } = useQuery(GET_DOCTORS, { variables: { input: inquiry }, skip: !process.env.NEXT_PUBLIC_API_GRAPHQL_URL, fetchPolicy: 'cache-and-network' });
	const doctors = data?.getDoctors?.list?.length ? data.getDoctors.list : fallbackDoctors;
	const submitHandler = (event: FormEvent) => { event.preventDefault(); };
	const initials = (name?: string) => name?.split(' ').map((part) => part[0]).join('').slice(0, 2) || 'MN';
	const portraitClass = (index: number) => index === 1 ? 'teal' : index === 2 ? 'slate' : 'blue';

	return <div className="clinical-inner-page"><section className="clinical-inner-hero"><div><div className="clinical-crumb"><Link href="/">Home</Link> / Doctors</div><span className="clinical-eyebrow">OUR SPECIALISTS</span><h1>Meet the people<br /><em>behind your care.</em></h1><p>Find the right specialist for you. Every MN Hospital doctor brings expertise, empathy, and time to every appointment.</p></div></section><section className="clinical-inner-section"><h2>Find your specialist</h2><form className="clinical-filter-bar clinical-doctor-filter" onSubmit={submitHandler}><label><Icon name="search" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or specialty" aria-label="Search doctors" /></label><select value={specialty} onChange={(event) => setSpecialty(event.target.value)} aria-label="Filter by specialty"><option value="">All departments</option><option value={DoctorSpecialty.GENERAL_PRACTITIONER}>General medicine</option><option value={DoctorSpecialty.CARDIOLOGIST}>Cardiology</option><option value={DoctorSpecialty.DENTIST}>Dentistry</option><option value={DoctorSpecialty.PEDIATRICIAN}>Pediatrics</option></select><select aria-label="Filter by availability"><option>Any availability</option><option>Available today</option><option>Available this week</option></select><button className="clinical-primary-button" type="submit">Search</button></form><div className="clinical-directory-grid">{doctors.map((doctor: any, index) => <article className="clinical-directory-card" key={doctor._id}><div className={`clinical-directory-portrait clinical-portrait-${portraitClass(index)}`} style={doctor.docImage ? { backgroundImage: `linear-gradient(145deg, rgba(18, 48, 74, .1), rgba(18, 48, 74, .75)), url(${doctor.docImage})` } : undefined}><span>{initials(doctor.docFullName)}</span><b>★ {Number(doctor.docPoints ?? 0).toFixed(1)}</b></div><div className="clinical-directory-info"><div><h3>{doctor.docFullName ?? 'MN Hospital doctor'}</h3><p>{String(doctor.docSpecialty ?? 'General physician').replaceAll('_', ' ')}</p></div><div className="clinical-directory-bottom"><span>{Number(doctor.docExperience ?? 0)} years experience</span><Link href={`/appointment?doctor=${doctor._id}`}>Book →</Link></div></div></article>)}</div>{loading && <p className="clinical-query-status">Loading our specialist directory…</p>}</section></div>;
};

export default withLayoutMain(DoctorsPage);
