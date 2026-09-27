import Link from 'next/link';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import Icon from '@/libs/components/common/Icon';
import { DoctorSpecialty } from '@/libs/components/doctor/enums/doctor.enum';

const doctorList = [
	{ id: 'azizbek-rahimov', initials: 'AR', name: 'Dr. Azizbek Rahimov', role: 'Senior Cardiologist', specialty: DoctorSpecialty.CARDIOLOGIST, experience: 15, rating: 4.9, next: 'Tomorrow, 10:00 AM' },
	{ id: 'madina-karimova', initials: 'MK', name: 'Dr. Madina Karimova', role: 'General Physician', specialty: DoctorSpecialty.GENERAL_PRACTITIONER, experience: 12, rating: 4.8, next: 'Today, 2:30 PM' },
	{ id: 'sardor-ergashev', initials: 'SE', name: 'Dr. Sardor Ergashev', role: 'Dentist', specialty: DoctorSpecialty.DENTIST, experience: 10, rating: 5.0, next: 'Today, 4:00 PM' },
];

const DoctorsPage = () => (
	<div className="inner-page"><div className="container"><div className="page-intro"><span className="eyebrow">Meet the people behind your care</span><h1>Find the right specialist.</h1><p>Our team of medical professionals is dedicated to providing clinical precision with empathetic care.</p></div><div className="doctor-grid">{doctorList.map((doctor) => <article className="doctor-card" key={doctor.id}><div className="doctor-avatar"><span>{doctor.initials}</span><div className="doctor-rating"><Icon name="star" /> {doctor.rating.toFixed(1)}</div></div><div className="doctor-info"><span className="doctor-specialty">{doctor.role}</span><h3>{doctor.name}</h3><p><Icon name="work_history" /> {doctor.experience}+ years experience</p><p><Icon name="calendar_today" /> Next available: {doctor.next}</p></div><div className="doctor-actions"><Link className="button button-outline" href={`/doctor/${doctor.id}`}>View Profile</Link><Link className="button button-primary" href={`/appointment?doctor=${doctor.id}`}>Book</Link></div></article>)}</div></div></div>
);

export default withLayoutMain(DoctorsPage);
