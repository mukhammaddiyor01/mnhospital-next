import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery as useApolloQuery } from '@apollo/client';
import { useQuery as useReactQuery } from '@tanstack/react-query';
import { GET_DOCTORS } from '@/apollo/doctor/query';
import { DoctorSort } from '@/libs/components/doctor/enums/doctor.enum';
import { GET_SERVICES } from '@/apollo/service/query';
import type { HospitalStatus } from '@/pages/api/hospital-status';
import Icon from '../common/Icon';
import { resolveApiAsset } from '@/libs/config';
import AdvertisementRail from '../advertisement/AdvertisementRail';
import { ClinicalDoctorCard, ClinicalServiceCard } from './types/clinical-home';
import { DoctorSpecialty } from '../doctor/enums/doctor.enum';

const heroSlides = [
	{ image: '/img/hospital-care-1.png', alt: 'A doctor welcoming a patient in a bright hospital atrium', title: 'Care that starts with listening', description: 'Expert guidance in a welcoming space.' },
	{ image: '/img/hospital-care-2.png', alt: 'Hospital clinicians working together to care for patients', title: 'One team, focused on you', description: 'Specialists working together at every step.' },
	{ image: '/img/hospital-care-3.png', alt: 'A doctor speaking with a patient in a modern consultation room', title: 'Confidence in every conversation', description: 'Personal attention backed by modern medicine.' },
];
const DOCTOR_IMAGES = [
	'https://lh3.googleusercontent.com/aida-public/AB6AXuDyGWUmFaFNNKb39AJE2xMhslQLzNLzJvaV_C_9Krb8blYzpIbKB7-spdN-HGAPziwGDPwyuwIiAb77hACMeb6AQ_wRu9qnvwdmeQs3D9TdWlhWn3f78PiYFMjxgTYn2FGg0f6xr_K1gLONVx6khPETq6iGluZx-MJAtu84nKKcG0pfq_jhGec8giKsl0oYuvkjrzm4Td0BY-QaSK8n90bSxiDDmECyQ69ZD9DAjNOaqrXouUgC9Zw',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuD6yiFf39ntPB3zOaXegzPZfEanLkr6CcEvLg8kQKR9WmxBrvu-_yz5Ko22NOqXOaquAZQui5_J6leE0Ae428cNUYCCSCCip7BE7HUbXkWxYOZt9vUC0JheTuVFm0jxg4CxuJhX1a8VUsk5yrqv9hSo7JutCqVtJt57toFqNis2Gtz71_4OwS2MwWuF-zVj6n7QlaqJhv0smjm_wc5ZBZxWpfIu6HxZ3KHfcgEoh58wsGcj8kFKcwQ',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuB-mbDyUuqUDcqyZuuhM1q7mFK-kJcQXKCHL8T20_8rGXJXjnrUtO9fZT3TC8RDiWXHZXARLNduo4IVHidgnoFGeOkDJs5uc1Sx_67db8cGVIgf-4za0rnCla_tMMnO7Dx1WG5CXtdlZ1Qy6go7V6UELLYXNygWUzwvHVAs8DjNIEZ9cJ1GUc_02SJkbzOHhwvx1ApHldVPoPSpGjwBdir4_9p6veXvsFFapywtvqo_sE0l5RBr6cU',
];
const defaultStatus: HospitalStatus = { yearsExperience: '25+', expertDoctors: '150+', patientSatisfaction: '99%', emergencyCare: '24/7' };

const fallbackServices: ClinicalServiceCard[] = [
	{ _id: 'cardiology', serviceTitle: 'Cardiology & Vascular', serviceDesc: 'Comprehensive interventional cardiology, electrophysiology, cardiac rehabilitation, and minimally invasive bypass procedures.', servicePrice: 250000, serviceViews: 856, serviceType: 'CARDIOLOGY', serviceRank: 1 },
	{ _id: 'neurology', serviceTitle: 'Neurology & Brain Sciences', serviceDesc: 'Advanced stroke intervention, neuro-oncology, spinal cord reconstruction, and computerized functional neuroimaging.', servicePrice: 220000, serviceViews: 642, serviceType: 'NEUROLOGY', serviceRank: 2 },
	{ _id: 'orthopedics', serviceTitle: 'Orthopedics & Sports Rehab', serviceDesc: 'Precision robotic joint replacement, sports injury arthroscopy, pediatric spine stabilization, and kinematic recovery.', servicePrice: 180000, serviceViews: 512, serviceType: 'ORTHOPEDICS', serviceRank: 3 },
	{ _id: 'pediatrics', serviceTitle: 'Pediatrics & Child Health', serviceDesc: 'Child-centered neonatal intensive care, developmental neurology, pediatric cardiology, and adolescent psychological support.', servicePrice: 180000, serviceViews: 512, serviceType: 'PEDIATRICS', serviceRank: 4 },
];

const fallbackDoctors: ClinicalDoctorCard[] = [
	{ _id: 'eleanor-vance', docFullName: 'Dr. Eleanor Vance', docSpecialty: DoctorSpecialty.CARDIOLOGIST, docExperience: 18, docPoints: 4.9, docImage: DOCTOR_IMAGES[0] },
	{ _id: 'marcus-chen', docFullName: 'Dr. Marcus Chen', docSpecialty: DoctorSpecialty.NEUROLOGIST, docExperience: 15, docPoints: 5, docImage: DOCTOR_IMAGES[1] },
	{ _id: 'sarah-jenkins', docFullName: 'Dr. Sarah Jenkins', docSpecialty: DoctorSpecialty.PEDIATRICIAN, docExperience: 12, docPoints: 4.9, docImage: DOCTOR_IMAGES[2] },
];

const iconForService = (serviceType?: string) => ({ CARDIOLOGY: 'cardiology', NEUROLOGY: 'neurology', ORTHOPEDICS: 'orthopedics', PEDIATRICS: 'child_care' }[serviceType ?? ''] ?? 'medical_services');
const labelForService = (serviceType?: string) => String(serviceType ?? 'Clinical service').replaceAll('_', ' ');
const serviceName = (service: ClinicalServiceCard) => service.serviceTitle ?? 'Clinical service';
const doctorRole = (specialty?: string) => {
	if (specialty === DoctorSpecialty.CARDIOLOGIST) return 'Chief Interventional Cardiologist';
	if (specialty === DoctorSpecialty.NEUROLOGIST) return 'Head of Neurosurgery';
	if (specialty === DoctorSpecialty.PEDIATRICIAN) return 'Senior Pediatric Specialist';
	return labelForService(specialty).toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const ClinicalHome = () => {
	const [notice, setNotice] = useState('');
	const [activeSlide, setActiveSlide] = useState(0);
	useEffect(() => {
		const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % heroSlides.length), 3000);
		return () => window.clearInterval(timer);
	}, []);
	const servicesQuery = useApolloQuery(GET_SERVICES, { variables: { input: { page: 1, limit: 6, sort: 'serviceViews', direction: 'DESC', search: {} } }, skip: !process.env.NEXT_PUBLIC_API_GRAPHQL_URL, fetchPolicy: 'cache-and-network' });
	const doctorsQuery = useApolloQuery(GET_DOCTORS, { variables: { input: { page: 1, limit: 3, sort: DoctorSort.POINTS, direction: 'DESC', search: {} } }, skip: !process.env.NEXT_PUBLIC_API_GRAPHQL_URL, fetchPolicy: 'cache-and-network' });
	const { data: hospitalStatus = defaultStatus } = useReactQuery<HospitalStatus>({
		queryKey: ['hospital-status'],
		queryFn: async () => {
			const response = await fetch('/api/hospital-status');
			if (!response.ok) throw new Error('Hospital status is unavailable');
			return response.json();
		},
		initialData: defaultStatus,
	});

	const usingFallbackServices = !servicesQuery.data?.getServices?.list?.length;
	const usingFallbackDoctors = !doctorsQuery.data?.getDoctors?.list?.length;
	const services: ClinicalServiceCard[] = usingFallbackServices ? fallbackServices : servicesQuery.data.getServices.list.map((service: ClinicalServiceCard) => ({ ...service, serviceTitle: service.serviceTitle ?? 'Clinical service', serviceDesc: service.serviceDesc ?? 'Care from the MN Hospital clinical team.' }));
	const doctors: ClinicalDoctorCard[] = usingFallbackDoctors ? fallbackDoctors : doctorsQuery.data.getDoctors.list;
	const initials = (name?: string) => name?.replace(/^Dr\.\s*/i, '').split(' ').map((part) => part[0]).join('').slice(0, 2) || 'MN';

	return <div className="clinical-home"><div className="clinical-workspace" id="home">
		<AdvertisementRail side="left" />
		<div className="clinical-center-column">
			<section className="clinical-hero-card"><div className="clinical-accreditation"><Icon name="verified" /> NABH &amp; JCI ACCREDITED EXCELLENCE</div><h1>Clinical Precision &amp; Empathetic Care</h1><p>MN Hospital combines advanced robotic surgery suites, AI-assisted diagnostic imaging, and world-renowned multidisciplinary specialists to deliver patient-centered healthcare designed for swift recovery.</p><div className="clinical-hero-actions"><Link className="clinical-primary-button" href="/appointment"><Icon name="calendar_month" /> Book an Appointment</Link><Link className="clinical-secondary-button" href="/service"><Icon name="medical_services" /> Explore Services</Link></div><div className="clinical-hero-visual" role="region" aria-label="MN Hospital care highlights"><div className="clinical-hero-slides">{heroSlides.map((slide, index) => <div className={`clinical-hero-slide ${activeSlide === index ? 'is-active' : ''}`} aria-hidden={activeSlide !== index} key={slide.image}><Image src={slide.image} alt={slide.alt} fill priority={index === 0} sizes="(max-width: 1120px) calc(100vw - 64px), 768px" /></div>)}</div><div className="clinical-hero-image-overlay" /><div className="clinical-visual-copy"><span className="clinical-emergency-icon"><Icon name="favorite" /></span><span><strong>{heroSlides[activeSlide].title}</strong><small>{heroSlides[activeSlide].description}</small></span></div><div className="clinical-hero-dots" aria-label="Choose a hospital highlight">{heroSlides.map((slide, index) => <button type="button" className={activeSlide === index ? 'is-active' : ''} aria-label={`Show image ${index + 1}: ${slide.title}`} aria-current={activeSlide === index ? 'true' : undefined} onClick={() => setActiveSlide(index)} key={slide.image} />)}</div></div></section>

			<section className="clinical-metrics"><Metric value={hospitalStatus.yearsExperience} label="Years Experience" note="Pioneering medicine" /><Metric value={hospitalStatus.expertDoctors} label="Expert Doctors" note="Board-certified specialists" /><Metric value={hospitalStatus.patientSatisfaction} label="Patient Satisfaction" note="Verified survey ratings" teal /><Metric value={hospitalStatus.emergencyCare} label="Emergency Care" note="Always available" /></section>

			<section className="clinical-content-section" id="departments"><SectionHeading kicker="SPECIALIZED CENTERS OF EXCELLENCE" title="Core Departments" linkLabel="View All Specializations" linkHref="/service" /><div className="clinical-department-grid">{services.slice(0, 4).map((service, index) => <article className="clinical-department" key={service._id}><div className="clinical-department-top"><span className="clinical-dept-icon"><Icon name={iconForService(service.serviceType)} /></span><span className="clinical-dept-status">{usingFallbackServices ? ['Cath Lab 24/7', 'Stroke Center', 'Robotic Joint Care', 'NICU Level III'][index] : labelForService(service.serviceType)}</span></div><h3>{serviceName(service)}</h3><p>{service.serviceDesc}</p><div className="clinical-dept-bottom"><span>{usingFallbackServices ? ['14 Surgeons • 98.6% Success', '11 Specialists • Rapid TPA', '16 Consultants • MAKO Robotic', '18 Pediatricians • Warm Care'][index] : `${Number(service.serviceViews ?? 0).toLocaleString('ko-KR')} views`}</span><Link href={usingFallbackServices ? '/service' : `/service/${service._id}`}>Explore <Icon name="chevron_right" /></Link></div></article>)}</div></section>

			<section className="clinical-content-section clinical-doctors" id="doctors"><SectionHeading kicker="LEADING MEDICAL MINDS" title="Featured Doctors" linkLabel="Explore All Doctors" linkHref="/doctor" /><div className="clinical-doctor-grid">{doctors.map((doctor, index) => <article className="clinical-doctor-card" key={doctor._id}><div className={`clinical-doctor-portrait clinical-portrait-${index === 1 ? 'teal' : index === 2 ? 'slate' : 'blue'}`}>{doctor.docImage ? (usingFallbackDoctors ? <Image src={doctor.docImage} alt={`${doctor.docFullName}, ${doctorRole(doctor.docSpecialty)}`} fill sizes="(max-width: 680px) calc(100vw - 64px), 245px" /> : <span className="clinical-api-doctor-image" style={{ backgroundImage: `url(${resolveApiAsset(doctor.docImage)})` }} />) : initials(doctor.docFullName)}<span className="clinical-rating"><Icon name="star" /> {Number(doctor.docPoints ?? 0).toFixed(1)} ({[320, 275, 410][index] ?? 120}+ reviews)</span></div><h3>{doctor.docFullName}</h3><b>{doctorRole(doctor.docSpecialty)}</b><p>{index === 0 ? 'MD, FACC' : index === 1 ? 'MD, PhD' : 'MBBS, FAAP'} • {Number(doctor.docExperience ?? 0)} Years Exp.</p><Link className="clinical-doctor-book" href={`/appointment?doctor=${doctor._id}`}>Book Consultation</Link></article>)}</div></section>

			<section className="clinical-trust-section"><div><span className="clinical-section-kicker">THE STANDARD OF HEALING</span><h2>Why Patients Choose MN Hospital</h2><p>We integrate compassionate clinical empathy with world-class tertiary healthcare standards to ensure optimal clinical outcomes and swift patient recuperation.</p></div><div className="clinical-trust-grid"><TrustItem icon="verified_user" title="Accredited Excellence" text="Fully certified by international Joint Commission International (JCI) and national healthcare audit boards for zero-compromise safety." /><TrustItem icon="biotech" title="Modern Diagnostic Labs" text="In-house 3T MRI, 128-slice dual source CT scanners, automated pathology, and same-day electronic test result delivery." /><TrustItem icon="favorite" title="Personalized Care" text="Dedicated patient coordinators, transparent billing plans, bedside telemetry, and post-discharge recovery monitoring." /></div></section>

			<section className="clinical-testimonials" id="journal"><div className="clinical-testimonials-heading"><span className="clinical-section-kicker">VOICES OF HEALING</span><h2>What Our Patients Say</h2></div><div className="clinical-testimonial-grid"><Testimonial initials="RH" name="Rebecca Henderson" role="Cardiac Recovery Patient">“The cardiology wing treated my husband with exceptional urgency. Dr. Vance took the time to explain every detail before the angioplasty. We felt safe, respected, and thoroughly cared for.”</Testimonial><Testimonial initials="DL" name="David Lockwood" role="Parent of Orthopedic Patient">“My daughter required specialized orthopedic surgery following a gymnastics fracture. The pediatric orthopedic staff was empathetic, gentle, and the robotic precision made recovery shockingly fast.”</Testimonial></div></section>

			<section className="clinical-cta-card" id="booking"><div><span className="clinical-cta-kicker"><Icon name="access_alarm" /> Same-Day Consultation Slots Available</span><h2>Ready to Experience<br />World-Class Clinical Care?</h2><p>Book with our top consultants online in less than 2 minutes or reach out directly to our 24/7 care concierge.</p></div><div className="clinical-cta-actions"><button className="clinical-light-button" onClick={() => setNotice('Appointment scheduling is ready — choose a doctor and preferred time.')}><Icon name="edit_calendar" /> Schedule an Appointment</button><a href="tel:+18005550199"><Icon name="call" /> Urgent Helpline: +1 (800) 555-0199</a></div></section><p className="clinical-notice" aria-live="polite">{notice}</p>
		</div>
		<AdvertisementRail side="right" />
	</div></div>;
};

const SectionHeading = ({ kicker, title, linkLabel, linkHref }: { kicker: string; title: string; linkLabel: string; linkHref: string }) => <div className="clinical-section-heading"><div><span className="clinical-section-kicker">{kicker}</span><h2>{title}</h2></div><Link href={linkHref}>{linkLabel} <Icon name="arrow_forward" /></Link></div>;
const Metric = ({ value, label, note, teal }: { value: string; label: string; note: string; teal?: boolean }) => <div className={teal ? 'teal' : ''}><strong>{value}</strong><span>{label}</span><small>{note}</small></div>;
const TrustItem = ({ icon, title, text }: { icon: string; title: string; text: string }) => <article><span><Icon name={icon} /></span><h3>{title}</h3><p>{text}</p></article>;
const Testimonial = ({ initials, name, role, children }: { initials: string; name: string; role: string; children: string }) => <article className="clinical-testimonial"><div className="clinical-stars">★★★★★</div><blockquote>{children}</blockquote><div className="clinical-patient"><span>{initials}</span><div><strong>{name}</strong><small>{role}</small></div></div></article>;

export default ClinicalHome;
