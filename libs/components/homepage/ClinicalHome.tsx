import cardInteraction from '@/libs/components/common/CardInteraction.module.scss';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery as useApolloQuery } from '@apollo/client';
import { GET_DOCTORS } from '@/apollo/doctor/query';
import { DoctorSort } from '@/libs/components/doctor/enums/doctor.enum';
import { GET_SERVICES } from '@/apollo/service/query';
import { GET_ARTICLES } from '@/apollo/article/query';
import { ArticleStatus } from '@/libs/components/article/enums/article.enum';
import { Article } from '@/libs/components/article/types/article';
import {
	ArticleCard,
} from '@/libs/components/article/ArticleCard';
import Icon from '../common/Icon';
import { resolveApiAsset } from '@/libs/config';
import AdvertisementRail from '../advertisement/AdvertisementRail';
import RightAdvertisementRail from '../advertisement/RightAdvertisementRail';
import { ClinicalDoctorCard, ClinicalServiceCard } from './types/clinical-home';
import { DoctorSpecialty } from '../doctor/enums/doctor.enum';
import DepartmentSwiper from './DepartmentSwiper';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useWorkspaceText } from '@/libs/components/workspace/useWorkspaceText';
import { useDoctorSpecialtyLabel } from '@/libs/i18n/useDoctorSpecialtyLabel';
import { useClinicSettings } from '@/libs/payments/useClinicSettings';

const heroSlides = [
	{
		image: '/img/hospital-care-1.png',
		alt: 'home.slide1.alt',
		title: 'home.slide1.title',
		description: 'home.slide1.description',
	},
	{
		image: '/img/hospital-care-2.png',
		alt: 'home.slide2.alt',
		title: 'home.slide2.title',
		description: 'home.slide2.description',
	},
	{
		image: '/img/hospital-care-3.png',
		alt: 'home.slide3.alt',
		title: 'home.slide3.title',
		description: 'home.slide3.description',
	},
] as const;
const doctorRole = (
	specialty: string | undefined,
	t: ReturnType<typeof useTranslation>,
	specialtyLabel: ReturnType<typeof useDoctorSpecialtyLabel>,
) => {
	if (specialty === DoctorSpecialty.CARDIOLOGIST)
		return t('home.doctor.cardio');
	if (specialty === DoctorSpecialty.NEUROLOGIST) return t('home.doctor.neuro');
	if (specialty === DoctorSpecialty.PEDIATRICIAN)
		return t('home.doctor.pediatric');
	return specialtyLabel(specialty);
};

const ClinicalHome = () => {
	const t = useTranslation();
	const specialtyLabel = useDoctorSpecialtyLabel();
	const w = useWorkspaceText();
	const clinic = useClinicSettings();
	const [notice, setNotice] = useState('');
	const [activeSlide, setActiveSlide] = useState(0);
	useEffect(() => {
		const timer = window.setInterval(
			() => setActiveSlide((current) => (current + 1) % heroSlides.length),
			3000,
		);
		return () => window.clearInterval(timer);
	}, []);
	const servicesQuery = useApolloQuery(GET_SERVICES, {
		variables: {
			input: {
				page: 1,
				limit: 6,
				sort: 'serviceViews',
				direction: 'DESC',
				search: {},
			},
		},
		fetchPolicy: 'cache-and-network',
	});
	const doctorsQuery = useApolloQuery(GET_DOCTORS, {
		variables: {
			input: {
				page: 1,
				limit: 3,
				sort: DoctorSort.POINTS,
				direction: 'DESC',
				search: {},
			},
		},
		fetchPolicy: 'cache-and-network',
	});
	const articlesQuery = useApolloQuery(GET_ARTICLES, {
		variables: {
			input: {
				page: 1,
				limit: 3,
				sort: 'createdAt',
				direction: 'DESC',
				search: { articleStatus: ArticleStatus.PUBLISHED },
			},
		},
		fetchPolicy: 'cache-and-network',
	});

	const usingFallbackServices = false;
	const services: ClinicalServiceCard[] = servicesQuery.data?.getServices?.list ?? [];
	const doctors: ClinicalDoctorCard[] = (
		doctorsQuery.data?.getDoctors?.list ?? []
	).map((doctor: ClinicalDoctorCard) => ({
		...doctor,
		docFullName:
			doctor.docFullName || doctor.docNick || t('doctors.nameFallback'),
	}));
	const articles: Article[] = articlesQuery.data?.getArticles?.list ?? [];
	const initials = (name?: string) =>
		name
			?.replace(/^Dr\.\s*/i, '')
			.split(' ')
			.map((part) => part[0])
			.join('')
			.slice(0, 2) || 'MN';

	return (
		<div className="clinical-home">
			<div className="clinical-workspace" id="home">
				<AdvertisementRail side="left" />
				<div className="clinical-center-column">
					<section className="clinical-hero-card">
						<div
							className="clinical-hero-visual"
							role="region"
							aria-label={t('home.highlights')}
						>
							<div className="clinical-hero-slides">
								{heroSlides.map((slide, index) => (
									<div
										className={`clinical-hero-slide ${activeSlide === index ? 'is-active' : ''}`}
										aria-hidden={activeSlide !== index}
										key={slide.image}
									>
										<Image
											src={slide.image}
											alt={t(slide.alt)}
											fill
											priority={index === 0}
											sizes="(max-width: 680px) calc(100vw - 24px), (max-width: 1120px) calc(100vw - 64px), 768px"
										/>
									</div>
								))}
							</div>
							<div className="clinical-hero-image-overlay" />
							<div className="clinical-hero-content">
								<div className="clinical-hero-heading">
									<strong className="clinical-hero-brand">MN Hospital</strong>
									{t('home.accreditation') !== 'MN Hospital' && (
										<div className="clinical-accreditation">
											<Icon name="verified" /> {t('home.accreditation')}
										</div>
									)}
								</div>
								<h1>{t('home.title')}</h1>
								<p>{t('home.intro')}</p>
								<div className="clinical-hero-actions">
									<Link className="clinical-primary-button" href="/appointment">
										<Icon name="calendar_month" /> {t('nav.book')}
									</Link>
									<Link className="clinical-secondary-button" href="/service">
										<Icon name="medical_services" /> {t('home.exploreServices')}
									</Link>
								</div>
							</div>
							<div className="clinical-hero-footer">
								<div className="clinical-visual-copy">
									<span className="clinical-emergency-icon">
										<Icon name="favorite" />
									</span>
									<span>
										<strong>{t(heroSlides[activeSlide].title)}</strong>
										<small>{t(heroSlides[activeSlide].description)}</small>
									</span>
								</div>
								<div
									className="clinical-hero-dots"
									aria-label={t('home.chooseHighlight')}
								>
									{heroSlides.map((slide, index) => (
										<button
											type="button"
											className={activeSlide === index ? 'is-active' : ''}
											aria-label={`${t('home.showImage')} ${index + 1}: ${t(slide.title)}`}
											aria-current={activeSlide === index ? 'true' : undefined}
											onClick={() => setActiveSlide(index)}
											key={slide.image}
										/>
									))}
								</div>
							</div>
						</div>
					</section>

					<section className="clinical-metrics">
						<Metric
							value={servicesQuery.error || servicesQuery.loading && !servicesQuery.data ? '—' : String(servicesQuery.data?.getServices?.metaCounter?.[0]?.total ?? 0)}
							label={t('nav.services')}
							note={t('nav.services')}
						/>
						<Metric
							value={doctorsQuery.error || doctorsQuery.loading && !doctorsQuery.data ? '—' : String(doctorsQuery.data?.getDoctors?.metaCounter?.[0]?.total ?? 0)}
							label={t('home.metric.doctors')}
							note={t('home.metric.doctorsNote')}
						/>
						<Metric
							value={articlesQuery.error || articlesQuery.loading && !articlesQuery.data ? '—' : String(articlesQuery.data?.getArticles?.metaCounter?.[0]?.total ?? 0)}
							label={w('articles')}
							note={t('nav.articles')}
							teal
						/>
						<Metric
							value={clinic.timeZone === 'Asia/Tashkent' ? 'UTC+5' : clinic.timeZone === 'Asia/Seoul' ? 'UTC+9' : 'UTC'}
							label={w('clinicTime')}
							note={clinic.timeZone}
						/>
					</section>

					<section className="clinical-content-section" id="departments">
						<SectionHeading
							kicker={t('home.departments.kicker')}
							title={t('home.departments.title')}
							linkLabel={t('home.departments.link')}
							linkHref="/service"
						/>
						<DepartmentSwiper
							services={services}
							usingFallback={usingFallbackServices}
						/>
					</section>

					<section
						className="clinical-content-section clinical-doctors"
						id="doctors"
					>
						<SectionHeading
							kicker={t('home.doctors.kicker')}
							title={t('home.doctors.title')}
							linkLabel={t('home.doctors.link')}
							linkHref="/doctor"
						/>
						{doctorsQuery.loading && (
							<p role="status">{t('doctors.loading')}</p>
						)}
						{doctorsQuery.error && (
							<p role="alert">{w('catalogUnavailable')}</p>
						)}
						{!doctorsQuery.loading &&
							!doctorsQuery.error &&
							!doctors.length && <p>{w('catalogEmpty')}</p>}
						<div className="clinical-doctor-grid">
							{doctors.map((doctor, index) => (
								<article className={`clinical-doctor-card ${cardInteraction.surface}`} key={doctor._id}>
									<div
										className={`clinical-doctor-portrait clinical-portrait-${index === 1 ? 'teal' : index === 2 ? 'slate' : 'blue'}`}
									>
										{doctor.docImage ? (
											<span
												className="clinical-api-doctor-image"
												role="img"
												aria-label={doctor.docFullName}
												style={{
													backgroundImage: `url(${resolveApiAsset(doctor.docImage)})`,
												}}
											/>
										) : (
											initials(doctor.docFullName)
										)}
										<span className="clinical-rating">
											<Icon name="star" />{' '}
											{Number(doctor.docPoints ?? 0).toFixed(1)}
										</span>
									</div>
									<h3><Link className={cardInteraction.primaryLink} href={`/doctor/${doctor._id}`}>{doctor.docFullName}</Link></h3>
									<b>{doctorRole(doctor.docSpecialty, t, specialtyLabel)}</b>
									<p>
										{Number(doctor.docExperience ?? 0)} {t('home.doctor.years')}
									</p>
									<Link
										className="clinical-doctor-book"
										href={`/appointment?doctor=${doctor._id}`}
									>
										{t('home.doctor.book')}
									</Link>
								</article>
							))}
						</div>
					</section>
					<section
						className="clinical-content-section clinical-articles"
						id="articles"
					>
						<SectionHeading
							kicker={t('home.articles.kicker')}
							title={t('home.articles.title')}
							linkLabel={t('home.articles.link')}
							linkHref="/article"
						/>
						<div className="clinical-article-grid">
							{articles.slice(0, 3).map((article) => (
								<ArticleCard article={article} key={article._id} />
							))}
						</div>
					</section>

					<section className="clinical-trust-section">
						<div>
							<span className="clinical-section-kicker">
								{t('home.trust.kicker')}
							</span>
							<h2>{t('home.trust.title')}</h2>
							<p>{t('home.trust.intro')}</p>
						</div>
						<div className="clinical-trust-grid">
							<TrustItem
								icon="verified_user"
								title={t('home.trust.accredited')}
								text={t('home.trust.accreditedText')}
							/>
							<TrustItem
								icon="biotech"
								title={t('home.trust.labs')}
								text={t('home.trust.labsText')}
							/>
							<TrustItem
								icon="favorite"
								title={t('home.trust.personal')}
								text={t('home.trust.personalText')}
							/>
						</div>
					</section>

					<section className="clinical-testimonials" id="journal">
						<div className="clinical-testimonials-heading">
							<span className="clinical-section-kicker">
								{t('home.testimonial.kicker')}
							</span>
							<h2>{t('home.testimonial.title')}</h2>
						</div>
						<div className="clinical-testimonial-grid">
							<Testimonial
								initials="RH"
								name="Rebecca Henderson"
								role={t('home.testimonial.role1')}
							>
								{t('home.testimonial.quote1')}
							</Testimonial>
							<Testimonial
								initials="DL"
								name="David Lockwood"
								role={t('home.testimonial.role2')}
							>
								{t('home.testimonial.quote2')}
							</Testimonial>
						</div>
					</section>

					<section className="clinical-cta-card" id="booking">
						<div>
							<span className="clinical-cta-kicker">
								<Icon name="access_alarm" /> {t('home.cta.kicker')}
							</span>
							<h2>
								{t('home.cta.title1')}
								<br />
								{t('home.cta.title2')}
							</h2>
							<p>{t('home.cta.intro')}</p>
						</div>
						<div className="clinical-cta-actions">
							<button
								className="clinical-light-button"
								onClick={() => setNotice(t('home.cta.notice'))}
							>
								<Icon name="edit_calendar" /> {t('home.cta.schedule')}
							</button>
							<a href="tel:+821000000077">
								<Icon name="call" /> {t('home.cta.helpline')}: +82 10 0000-0077
							</a>
						</div>
					</section>
					<p className="clinical-notice" aria-live="polite">
						{notice}
					</p>
				</div>
				<RightAdvertisementRail />
			</div>
		</div>
	);
};

const SectionHeading = ({
	kicker,
	title,
	linkLabel,
	linkHref,
}: {
	kicker: string;
	title: string;
	linkLabel: string;
	linkHref: string;
}) => (
	<div className="clinical-section-heading">
		<div>
			<span className="clinical-section-kicker">{kicker}</span>
			<h2>{title}</h2>
		</div>
		<Link href={linkHref}>
			{linkLabel} <Icon name="arrow_forward" />
		</Link>
	</div>
);
const Metric = ({
	value,
	label,
	note,
	teal,
}: {
	value: string;
	label: string;
	note: string;
	teal?: boolean;
}) => (
	<div className={teal ? 'teal' : ''}>
		<strong>{value}</strong>
		<span>{label}</span>
		<small>{note}</small>
	</div>
);
const TrustItem = ({
	icon,
	title,
	text,
}: {
	icon: string;
	title: string;
	text: string;
}) => (
	<article>
		<span>
			<Icon name={icon} />
		</span>
		<h3>{title}</h3>
		<p>{text}</p>
	</article>
);
const Testimonial = ({
	initials,
	name,
	role,
	children,
}: {
	initials: string;
	name: string;
	role: string;
	children: string;
}) => (
	<article className="clinical-testimonial">
		<div className="clinical-stars">★★★★★</div>
		<blockquote>{children}</blockquote>
		<div className="clinical-patient">
			<span>{initials}</span>
			<div>
				<strong>{name}</strong>
				<small>{role}</small>
			</div>
		</div>
	</article>
);

export default ClinicalHome;
