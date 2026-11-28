import { useRef, useState } from 'react';
import type { Swiper as SwiperInstance } from 'swiper';
import HeroSwiper, { heroSlides } from './HeroSwiper';
import DoctorSwiper from './DoctorSwiper';
import ArticleSwiper from './ArticleSwiper';
import Link from 'next/link';
import { useQuery as useApolloQuery } from '@apollo/client';
import { GET_DOCTORS } from '@/apollo/doctor/query';
import { DoctorSort } from '@/libs/components/doctor/enums/doctor.enum';
import { GET_SERVICES } from '@/apollo/service/query';
import { GET_ARTICLES } from '@/apollo/article/query';
import { ArticleStatus } from '@/libs/components/article/enums/article.enum';
import { Article } from '@/libs/components/article/types/article';
import Icon from '../common/Icon';
import AdvertisementRail from '../advertisement/AdvertisementRail';
import RightAdvertisementRail from '../advertisement/RightAdvertisementRail';
import { ClinicalDoctorCard, ClinicalServiceCard } from './types/clinical-home';
import DepartmentSwiper from './DepartmentSwiper';
import DiscountedServices from './DiscountedServices';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useWorkspaceText } from '@/libs/components/workspace/useWorkspaceText';
import { useClinicSettings } from '@/libs/payments/useClinicSettings';

const ClinicalHome = () => {
	const t = useTranslation();
	const w = useWorkspaceText();
	const clinic = useClinicSettings();
	const [activeSlide, setActiveSlide] = useState(0);
	const hero = useRef<SwiperInstance | null>(null);
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
				limit: 8,
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
				limit: 8,
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
							<HeroSwiper onSlideChange={setActiveSlide} onReady={(swiper) => { hero.current = swiper; }} />
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
											onClick={() => hero.current?.slideTo(index)}
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
							note=""
						/>
						<Metric
							value={doctorsQuery.error || doctorsQuery.loading && !doctorsQuery.data ? '—' : String(doctorsQuery.data?.getDoctors?.metaCounter?.[0]?.total ?? 0)}
							label={t('home.metric.doctors')}
							note={t('home.metric.doctorsNote')}
						/>
						<Metric
							value={articlesQuery.error || articlesQuery.loading && !articlesQuery.data ? '—' : String(articlesQuery.data?.getArticles?.metaCounter?.[0]?.total ?? 0)}
							label={w('articles')}
							note=""
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
						{!!doctors.length && <DoctorSwiper doctors={doctors} />}
					</section>
					<DiscountedServices />
					<section
						className="clinical-content-section clinical-articles"
						id="articles"
					>
						<SectionHeading
							title={t('home.articles.title')}
							linkLabel={t('home.articles.link')}
							linkHref="/article"
						/>
						{articlesQuery.loading && !articles.length && <p role="status">{t('dashboard.loading')}</p>}
						{articlesQuery.error && !articles.length && <p role="alert">{w('catalogUnavailable')}</p>}
						{!!articles.length && <ArticleSwiper articles={articles} />}
					</section>

					<section className="clinical-trust-section">
						<div>
							<h2>{t('home.trust.title')}</h2>
							<p>{t('home.trust.intro')}</p>
						</div>
						<div className="clinical-trust-grid">
							<TrustItem
								icon="medical_services"
								title={t('home.trust.accredited')}
								text={t('home.trust.accreditedText')}
							/>
							<TrustItem
								icon="calendar_month"
								title={t('home.trust.labs')}
								text={t('home.trust.labsText')}
							/>
							<TrustItem
								icon="payments"
								title={t('home.trust.personal')}
								text={t('home.trust.personalText')}
							/>
						</div>
					</section>

					<section className="clinical-cta-card" id="booking">
						<div>
							<h2>
								{t('home.cta.title1')}
								<br />
								{t('home.cta.title2')}
							</h2>
							<p>{t('home.cta.intro')}</p>
						</div>
						<div className="clinical-cta-actions">
							<Link className="clinical-light-button" href="/appointment">
								<Icon name="edit_calendar" /> {t('home.cta.schedule')}
							</Link>
						</div>
					</section>
				</div>
				<RightAdvertisementRail />
			</div>
		</div>
	);
};

const SectionHeading = ({
	title,
	linkLabel,
	linkHref,
}: {
	title: string;
	linkLabel: string;
	linkHref: string;
}) => (
	<div className="clinical-section-heading">
		<div>
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
		{note && <small>{note}</small>}
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
export default ClinicalHome;
