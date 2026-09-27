import Link from 'next/link';
import Icon from '../common/Icon';
import SectionHeading from '../common/SectionHeading';
import { DoctorSpecialty } from '../doctor/enums/doctor.enum';
import { HomeDoctorCard } from './types/homepage';
import { useQuery } from '@apollo/client';
import { GET_DOCTORS } from '@/apollo/doctor/query';

const initialDoctors: HomeDoctorCard[] = [
	{ _id: 'azizbek-rahimov', docFullName: 'Dr. Azizbek Rahimov', docSpecialty: DoctorSpecialty.CARDIOLOGIST, docExperience: 15, docPoints: 4.9, role: 'Cardiologist', image: 'AR', availability: 'Tomorrow, 10:00 AM' },
	{ _id: 'madina-karimova', docFullName: 'Dr. Madina Karimova', docSpecialty: DoctorSpecialty.GENERAL_PRACTITIONER, docExperience: 12, docPoints: 4.8, role: 'General Physician', image: 'MK', availability: 'Today, 2:30 PM' },
	{ _id: 'sardor-ergashev', docFullName: 'Dr. Sardor Ergashev', docSpecialty: DoctorSpecialty.DENTIST, docExperience: 10, docPoints: 5.0, role: 'Dentist', image: 'SE', availability: 'Today, 4:00 PM' },
];

const FeaturedDoctors = () => {
	const { data, loading } = useQuery(GET_DOCTORS, {
		variables: { input: { page: 1, limit: 3, sort: 'docPoints', direction: 'DESC', search: {} } },
		skip: !process.env.NEXT_PUBLIC_API_GRAPHQL_URL,
		fetchPolicy: 'cache-and-network',
	});
	const doctors: HomeDoctorCard[] = data?.getDoctors?.list?.length ? data.getDoctors.list.map((doctor: any) => ({ _id: doctor._id, docFullName: doctor.docFullName, docSpecialty: doctor.docSpecialty, docExperience: doctor.docExperience, docPoints: doctor.docPoints, role: String(doctor.docSpecialty ?? 'General Practitioner').replaceAll('_', ' '), image: doctor.docFullName?.split(' ').map((part: string) => part[0]).join('').slice(0, 2), availability: doctor.docRoom ? `Room ${doctor.docRoom}` : 'Available today' })) : initialDoctors;

	return (
	<section className="doctors-section">
		<div className="container">
			<SectionHeading eyebrow="Meet your care team" title="Experienced people. Personal care." description="Meet our team of specialists dedicated to your health and well-being." linkLabel="View all doctors" linkHref="/doctor" />
			<div className="doctor-grid">
				{doctors.map((doctor) => (
					<article className="doctor-card" key={doctor._id}>
						<div className="doctor-avatar"><span>{doctor.image}</span><div className="doctor-rating"><Icon name="star" /> {doctor.docPoints.toFixed(1)}</div></div>
						<div className="doctor-info"><span className="doctor-specialty">{doctor.role}</span><h3>{doctor.docFullName}</h3><p><Icon name="work_history" /> {doctor.docExperience}+ years experience</p><p><Icon name="calendar_today" /> Next available: {doctor.availability}</p></div>
						<div className="doctor-actions"><Link className="button button-outline" href={`/doctor/${doctor._id}`}>View Profile</Link><Link className="button button-primary" href={`/appointment?doctor=${doctor._id}`}>Book</Link></div>
					</article>
				))}
			</div>
			{loading && <span className="query-status">Refreshing our care team…</span>}
		</div>
	</section>
 	);
};

export default FeaturedDoctors;
