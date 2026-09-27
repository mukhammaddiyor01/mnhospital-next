import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_DOCTORS } from '@/apollo/doctor/query';
import { GET_SERVICES } from '@/apollo/service/query';
import Icon from '../common/Icon';
import AdvertisementRail from '../advertisement/AdvertisementRail';
import { ClinicalDoctorCard, ClinicalServiceCard } from './types/clinical-home';
import { DoctorSpecialty } from '../doctor/enums/doctor.enum';

const fallbackServices: ClinicalServiceCard[] = [
	{ _id: 'cardiology', serviceTitle: 'Cardiology & vascular', serviceDesc: 'Interventional cardiology, electrophysiology, rehabilitation, and minimally invasive procedures.', servicePrice: 250000, serviceViews: 856, serviceType: 'CARDIOLOGY', serviceRank: 1 },
	{ _id: 'neurology', serviceTitle: 'Neurology & brain sciences', serviceDesc: 'Advanced stroke intervention, neuro-oncology, spinal reconstruction, and neuroimaging.', servicePrice: 220000, serviceViews: 642, serviceType: 'NEUROLOGY', serviceRank: 2 },
	{ _id: 'orthopedics', serviceTitle: 'Orthopedics & spine', serviceDesc: 'Precision joint replacement, sports injury care, and modern spine surgery pathways.', servicePrice: 180000, serviceViews: 512, serviceType: 'ORTHOPEDICS', serviceRank: 3 },
	{ _id: 'womens-health', serviceTitle: 'Women’s health', serviceDesc: 'Personalized gynecology, maternity, screening, and international patient coordination.', servicePrice: 180000, serviceViews: 512, serviceType: 'WOMENS_HEALTH', serviceRank: 4 },
];

const fallbackDoctors: ClinicalDoctorCard[] = [
	{ _id: 'azizbek-rahimov', docFullName: 'Dr. Azizbek Rahimov', docSpecialty: DoctorSpecialty.CARDIOLOGIST, docExperience: 15, docPoints: 4.9 },
	{ _id: 'madina-karimova', docFullName: 'Dr. Madina Karimova', docSpecialty: DoctorSpecialty.GENERAL_PRACTITIONER, docExperience: 12, docPoints: 4.8 },
	{ _id: 'sarah-jenkins', docFullName: 'Dr. Sarah Jenkins', docSpecialty: DoctorSpecialty.PEDIATRICIAN, docExperience: 12, docPoints: 5 },
];

const iconForService = (serviceType?: string) => {
	if (serviceType === 'CARDIOLOGY') return 'favorite';
	if (serviceType === 'NEUROLOGY') return 'neurology';
	if (serviceType === 'ORTHOPEDICS') return 'orthopedics';
	if (serviceType === 'WOMENS_HEALTH') return 'spa';
	return 'stethoscope';
};

const labelForService = (serviceType?: string) => String(serviceType ?? 'Clinical service').replaceAll('_', ' ');

const doctorRole = (specialty?: string) => {
	if (specialty === DoctorSpecialty.CARDIOLOGIST) return 'Senior Cardiologist';
	if (specialty === DoctorSpecialty.GENERAL_PRACTITIONER) return 'General Physician';
	if (specialty === DoctorSpecialty.PEDIATRICIAN) return 'Pediatric Specialist';
	return labelForService(specialty).toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const serviceName = (service: ClinicalServiceCard) => service.serviceTitle ?? 'Clinical service';

const ClinicalHome = () => {
	const [notice, setNotice] = useState('');
	const servicesQuery = useQuery(GET_SERVICES, { variables: { input: { page: 1, limit: 6, sort: 'serviceViews', direction: 'DESC', search: {} } }, skip: !process.env.NEXT_PUBLIC_API_GRAPHQL_URL, fetchPolicy: 'cache-and-network' });
	const doctorsQuery = useQuery(GET_DOCTORS, { variables: { input: { page: 1, limit: 3, sort: 'docPoints', direction: 'DESC', search: {} } }, skip: !process.env.NEXT_PUBLIC_API_GRAPHQL_URL, fetchPolicy: 'cache-and-network' });

	const usingFallbackServices = !servicesQuery.data?.getServices?.list?.length;
	const services: ClinicalServiceCard[] = usingFallbackServices ? fallbackServices : servicesQuery.data.getServices.list.map((service: ClinicalServiceCard) => ({ ...service, serviceTitle: service.serviceTitle ?? 'Clinical service', serviceDesc: service.serviceDesc ?? 'Care from the MN Hospital clinical team.' }));
	const doctors: ClinicalDoctorCard[] = doctorsQuery.data?.getDoctors?.list?.length ? doctorsQuery.data.getDoctors.list : fallbackDoctors;
	const initials = (name?: string) => name?.replace(/^Dr\.\s*/i, '').split(' ').map((part) => part[0]).join('').slice(0, 2) || 'MN';
	const showNotice = (message: string) => setNotice(message);

	return <div className="clinical-home">
		<div className="clinical-workspace" id="home">
			<AdvertisementRail side="left" />

			<div className="clinical-center-column">
				<section className="clinical-hero-card"><div className="clinical-accreditation">✓ NABH &amp; JCI ACCREDITED EXCELLENCE</div><h1>Clinical precision &amp; <em>empathetic care.</em></h1><p>Advanced diagnostics, expert specialists, and patient-centered healthcare designed around a faster recovery.</p><div className="clinical-hero-actions"><Link className="clinical-primary-button" href="#booking">▣ Book an appointment</Link><Link className="clinical-secondary-button" href="#departments">＋ Explore services</Link></div><div className="clinical-hero-visual"><div className="clinical-visual-orbit" /><div className="clinical-visual-center">✚</div><div className="clinical-visual-copy"><strong>Critical trauma &amp; emergency wing</strong><span>Immediate triage access · 24 hours a day</span></div><span className="clinical-level-badge">Level 1 Trauma</span></div></section>
				<section className="clinical-metrics"><Metric value="25+" label="Years experience" note="Pioneering medicine" /><Metric value="150+" label="Expert doctors" note="Board-certified specialists" /><Metric value="99%" label="Patient satisfaction" note="Verified survey ratings" teal /><Metric value="24/7" label="Emergency care" note="Always available" /></section>

				<section className="clinical-content-section" id="departments"><SectionHeading kicker="SPECIALIZED CENTERS OF EXCELLENCE" title="Core departments" linkLabel="View all specializations →" linkHref="/service" /><div className="clinical-department-grid">{services.slice(0, 4).map((service, index) => <article className="clinical-department" key={service._id}><div className="clinical-department-top"><span className="clinical-dept-icon"><Icon name={iconForService(service.serviceType)} /></span><span className="clinical-dept-status">{usingFallbackServices ? ['Cath lab 24/7', 'Stroke center', 'Robotic assisted', 'International care'][index] : labelForService(service.serviceType)}</span></div><h3>{serviceName(service)}</h3><p>{service.serviceDesc}</p><div className="clinical-dept-bottom"><span>{usingFallbackServices ? ['14 surgeons · 98.6% success', '11 specialists · Rapid TPA', '9 surgeons · Same-day consult', 'English · 한국어 support'][index] : `${Number(service.serviceViews ?? 0).toLocaleString('ko-KR')} views`}</span><Link href={usingFallbackServices ? '/service' : `/service/${service._id}`}>Explore →</Link></div></article>)}</div></section>

				<section className="clinical-content-section clinical-doctors" id="doctors"><SectionHeading kicker="MEET THE CARE TEAM" title="Our leading specialists" linkLabel="Find a doctor →" linkHref="/doctor" /><div className="clinical-doctor-grid">{doctors.map((doctor) => <article className="clinical-doctor-card" key={doctor._id}><div className={`clinical-doctor-portrait clinical-portrait-${doctor._id === doctors[1]?._id ? 'teal' : doctor._id === doctors[2]?._id ? 'slate' : 'blue'}`} style={doctor.docImage ? { backgroundImage: `url(${doctor.docImage})` } : undefined}>{doctor.docImage ? null : initials(doctor.docFullName)}<span>★ {Number(doctor.docPoints ?? 0).toFixed(1)}</span></div><h3>{doctor.docFullName}</h3><b>{doctorRole(doctor.docSpecialty)}</b><p>MBBS, MD · {Number(doctor.docExperience ?? 0)} years experience</p><Link className="clinical-doctor-book" href={`/appointment?doctor=${doctor._id}`}>Book consultation</Link></article>)}</div></section>

				<section className="clinical-trust-section"><div><span className="clinical-section-kicker">THE STANDARD OF HEALING</span><h2>Why patients choose MN Hospital</h2><p>We combine clinical precision with human empathy to make every stage of care clearer and safer.</p></div><div className="clinical-trust-grid"><TrustItem icon="✓" title="Accredited excellence" text="International safety standards and coordinated care teams." /><TrustItem icon="⌁" title="Modern diagnostics" text="Integrated imaging, laboratory, and same-day results." /><TrustItem icon="♥" title="Personalized care" text="Dedicated coordinators and structured aftercare support." /></div></section>
				<section className="clinical-testimonial" id="journal"><div className="clinical-stars">★★★★★</div><blockquote>“The team explained every step clearly. We felt safe, respected, and thoroughly cared for.”</blockquote><div className="clinical-patient"><span>RH</span><div><strong>Rebecca Henderson</strong><small>Cardiac recovery patient</small></div></div></section>
				<section className="clinical-cta-card" id="booking"><div><span className="clinical-section-kicker">SAME-DAY CONSULTATION SLOTS AVAILABLE</span><h2>Ready to experience world-class care?</h2><p>Book with our top consultants online in less than two minutes.</p></div><div className="clinical-cta-actions"><button className="clinical-light-button" onClick={() => showNotice('Demo preview: appointment flow would open here.')}>▣ Schedule appointment</button><a href="tel:+998712000000">☎ Urgent helpline</a></div></section><p className="clinical-notice" aria-live="polite">{notice}</p>
			</div>

			<AdvertisementRail side="right" />
		</div>
	</div>;
};

const SectionHeading = ({ kicker, title, linkLabel, linkHref }: { kicker: string; title: string; linkLabel: string; linkHref: string }) => <div className="clinical-section-heading"><div><span className="clinical-section-kicker">{kicker}</span><h2>{title}</h2></div><Link href={linkHref}>{linkLabel}</Link></div>;
const Metric = ({ value, label, note, teal }: { value: string; label: string; note: string; teal?: boolean }) => <div className={teal ? 'teal' : ''}><strong>{value}</strong><span>{label}</span><small>{note}</small></div>;
const TrustItem = ({ icon, title, text }: { icon: string; title: string; text: string }) => <article><span>{icon}</span><h3>{title}</h3><p>{text}</p></article>;

export default ClinicalHome;
