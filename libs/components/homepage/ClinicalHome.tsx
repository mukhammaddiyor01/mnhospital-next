import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery as useApolloQuery } from "@apollo/client";
import { useQuery as useReactQuery } from "@tanstack/react-query";
import { GET_DOCTORS } from "@/apollo/doctor/query";
import { DoctorSort } from "@/libs/components/doctor/enums/doctor.enum";
import { GET_SERVICES } from "@/apollo/service/query";
import { GET_ARTICLES } from "@/apollo/article/query";
import { ArticleStatus } from "@/libs/components/article/enums/article.enum";
import { Article } from "@/libs/components/article/types/article";
import {
  fallbackArticles,
  ArticleCard,
} from "@/libs/components/article/ArticleCard";
import type { HospitalStatus } from "@/pages/api/hospital-status";
import Icon from "../common/Icon";
import { resolveApiAsset } from "@/libs/config";
import AdvertisementRail from "../advertisement/AdvertisementRail";
import { ClinicalDoctorCard, ClinicalServiceCard } from "./types/clinical-home";
import { DoctorSpecialty } from "../doctor/enums/doctor.enum";
import DepartmentSwiper from "./DepartmentSwiper";
import { useTranslation } from "@/libs/i18n/useTranslation";

const heroSlides = [
  {
    image: "/img/hospital-care-1.png",
    alt: "home.slide1.alt",
    title: "home.slide1.title",
    description: "home.slide1.description",
  },
  {
    image: "/img/hospital-care-2.png",
    alt: "home.slide2.alt",
    title: "home.slide2.title",
    description: "home.slide2.description",
  },
  {
    image: "/img/hospital-care-3.png",
    alt: "home.slide3.alt",
    title: "home.slide3.title",
    description: "home.slide3.description",
  },
] as const;
const DOCTOR_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDyGWUmFaFNNKb39AJE2xMhslQLzNLzJvaV_C_9Krb8blYzpIbKB7-spdN-HGAPziwGDPwyuwIiAb77hACMeb6AQ_wRu9qnvwdmeQs3D9TdWlhWn3f78PiYFMjxgTYn2FGg0f6xr_K1gLONVx6khPETq6iGluZx-MJAtu84nKKcG0pfq_jhGec8giKsl0oYuvkjrzm4Td0BY-QaSK8n90bSxiDDmECyQ69ZD9DAjNOaqrXouUgC9Zw",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD6yiFf39ntPB3zOaXegzPZfEanLkr6CcEvLg8kQKR9WmxBrvu-_yz5Ko22NOqXOaquAZQui5_J6leE0Ae428cNUYCCSCCip7BE7HUbXkWxYOZt9vUC0JheTuVFm0jxg4CxuJhX1a8VUsk5yrqv9hSo7JutCqVtJt57toFqNis2Gtz71_4OwS2MwWuF-zVj6n7QlaqJhv0smjm_wc5ZBZxWpfIu6HxZ3KHfcgEoh58wsGcj8kFKcwQ",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB-mbDyUuqUDcqyZuuhM1q7mFK-kJcQXKCHL8T20_8rGXJXjnrUtO9fZT3TC8RDiWXHZXARLNduo4IVHidgnoFGeOkDJs5uc1Sx_67db8cGVIgf-4za0rnCla_tMMnO7Dx1WG5CXtdlZ1Qy6go7V6UELLYXNygWUzwvHVAs8DjNIEZ9cJ1GUc_02SJkbzOHhwvx1ApHldVPoPSpGjwBdir4_9p6veXvsFFapywtvqo_sE0l5RBr6cU",
];
const defaultStatus: HospitalStatus = {
  yearsExperience: "25+",
  expertDoctors: "150+",
  patientSatisfaction: "99%",
  emergencyCare: "24/7",
};

const fallbackServices: ClinicalServiceCard[] = [
  {
    _id: "cardiology",
    serviceTitle: "Cardiology & Vascular",
    serviceDesc:
      "Comprehensive interventional cardiology, electrophysiology, cardiac rehabilitation, and minimally invasive bypass procedures.",
    servicePrice: 250000,
    serviceViews: 856,
    serviceType: "CARDIOLOGY",
    serviceRank: 1,
  },
  {
    _id: "neurology",
    serviceTitle: "Neurology & Brain Sciences",
    serviceDesc:
      "Advanced stroke intervention, neuro-oncology, spinal cord reconstruction, and computerized functional neuroimaging.",
    servicePrice: 220000,
    serviceViews: 642,
    serviceType: "NEUROLOGY",
    serviceRank: 2,
  },
  {
    _id: "orthopedics",
    serviceTitle: "Orthopedics & Sports Rehab",
    serviceDesc:
      "Precision robotic joint replacement, sports injury arthroscopy, pediatric spine stabilization, and kinematic recovery.",
    servicePrice: 180000,
    serviceViews: 512,
    serviceType: "ORTHOPEDICS",
    serviceRank: 3,
  },
  {
    _id: "pediatrics",
    serviceTitle: "Pediatrics & Child Health",
    serviceDesc:
      "Child-centered neonatal intensive care, developmental neurology, pediatric cardiology, and adolescent psychological support.",
    servicePrice: 180000,
    serviceViews: 512,
    serviceType: "PEDIATRICS",
    serviceRank: 4,
  },
];

const fallbackDoctors: ClinicalDoctorCard[] = [
  {
    _id: "eleanor-vance",
    docFullName: "Dr. Eleanor Vance",
    docSpecialty: DoctorSpecialty.CARDIOLOGIST,
    docExperience: 18,
    docPoints: 4.9,
    docImage: DOCTOR_IMAGES[0],
  },
  {
    _id: "marcus-chen",
    docFullName: "Dr. Marcus Chen",
    docSpecialty: DoctorSpecialty.NEUROLOGIST,
    docExperience: 15,
    docPoints: 5,
    docImage: DOCTOR_IMAGES[1],
  },
  {
    _id: "sarah-jenkins",
    docFullName: "Dr. Sarah Jenkins",
    docSpecialty: DoctorSpecialty.PEDIATRICIAN,
    docExperience: 12,
    docPoints: 4.9,
    docImage: DOCTOR_IMAGES[2],
  },
];

const labelForService = (serviceType?: string) =>
  String(serviceType ?? "Clinical service").replaceAll("_", " ");
const doctorRole = (specialty: string | undefined, t: ReturnType<typeof useTranslation>) => {
  if (specialty === DoctorSpecialty.CARDIOLOGIST)
    return t('home.doctor.cardio');
  if (specialty === DoctorSpecialty.NEUROLOGIST) return t('home.doctor.neuro');
  if (specialty === DoctorSpecialty.PEDIATRICIAN)
    return t('home.doctor.pediatric');
  return labelForService(specialty)
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const ClinicalHome = () => {
  const t = useTranslation();
  const [notice, setNotice] = useState("");
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
        sort: "serviceViews",
        direction: "DESC",
        search: {},
      },
    },
    skip: !process.env.NEXT_PUBLIC_API_GRAPHQL_URL,
    fetchPolicy: "cache-and-network",
  });
  const doctorsQuery = useApolloQuery(GET_DOCTORS, {
    variables: {
      input: {
        page: 1,
        limit: 3,
        sort: DoctorSort.POINTS,
        direction: "DESC",
        search: {},
      },
    },
    skip: !process.env.NEXT_PUBLIC_API_GRAPHQL_URL,
    fetchPolicy: "cache-and-network",
  });
  const articlesQuery = useApolloQuery(GET_ARTICLES, {
    variables: {
      input: {
        page: 1,
        limit: 3,
        sort: "createdAt",
        direction: "DESC",
        search: { articleStatus: ArticleStatus.PUBLISHED },
      },
    },
    skip: !process.env.NEXT_PUBLIC_API_GRAPHQL_URL,
    fetchPolicy: "cache-and-network",
  });
  const { data: hospitalStatus = defaultStatus } =
    useReactQuery<HospitalStatus>({
      queryKey: ["hospital-status"],
      queryFn: async () => {
        const response = await fetch("/api/hospital-status");
        if (!response.ok) throw new Error("Hospital status is unavailable");
        return response.json();
      },
      initialData: defaultStatus,
    });

  const usingFallbackServices = !servicesQuery.data?.getServices?.list?.length;
  const usingFallbackDoctors = !doctorsQuery.data?.getDoctors?.list?.length;
  const services: ClinicalServiceCard[] = usingFallbackServices
    ? fallbackServices
    : servicesQuery.data.getServices.list.map(
        (service: ClinicalServiceCard) => ({
          ...service,
          serviceTitle: service.serviceTitle ?? "Clinical service",
          serviceDesc:
            service.serviceDesc ?? "Care from the MN Hospital clinical team.",
        }),
      );
  const doctors: ClinicalDoctorCard[] = usingFallbackDoctors
    ? fallbackDoctors
    : doctorsQuery.data.getDoctors.list;
  const articles: Article[] = articlesQuery.data?.getArticles?.list?.length
    ? articlesQuery.data.getArticles.list
    : fallbackArticles;
  const initials = (name?: string) =>
    name
      ?.replace(/^Dr\.\s*/i, "")
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2) || "MN";

  return (
    <div className="clinical-home">
      <div className="clinical-workspace" id="home">
        <AdvertisementRail side="left" />
        <div className="clinical-center-column">
          <section className="clinical-hero-card">
            <div className="clinical-accreditation">
              <Icon name="verified" /> {t('home.accreditation')}
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
            <div
              className="clinical-hero-visual"
              role="region"
              aria-label={t('home.highlights')}
            >
              <div className="clinical-hero-slides">
                {heroSlides.map((slide, index) => (
                  <div
                    className={`clinical-hero-slide ${activeSlide === index ? "is-active" : ""}`}
                    aria-hidden={activeSlide !== index}
                    key={slide.image}
                  >
                    <Image
                      src={slide.image}
                      alt={t(slide.alt)}
                      fill
                      priority={index === 0}
                      sizes="(max-width: 1120px) calc(100vw - 64px), 768px"
                    />
                  </div>
                ))}
              </div>
              <div className="clinical-hero-image-overlay" />
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
                    className={activeSlide === index ? "is-active" : ""}
                    aria-label={`${t('home.showImage')} ${index + 1}: ${t(slide.title)}`}
                    aria-current={activeSlide === index ? "true" : undefined}
                    onClick={() => setActiveSlide(index)}
                    key={slide.image}
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="clinical-metrics">
            <Metric
              value={hospitalStatus.yearsExperience}
              label={t('home.metric.years')}
              note={t('home.metric.yearsNote')}
            />
            <Metric
              value={hospitalStatus.expertDoctors}
              label={t('home.metric.doctors')}
              note={t('home.metric.doctorsNote')}
            />
            <Metric
              value={hospitalStatus.patientSatisfaction}
              label={t('home.metric.satisfaction')}
              note={t('home.metric.satisfactionNote')}
              teal
            />
            <Metric
              value={hospitalStatus.emergencyCare}
              label={t('home.metric.emergency')}
              note={t('home.metric.emergencyNote')}
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
            <div className="clinical-doctor-grid">
              {doctors.map((doctor, index) => (
                <article className="clinical-doctor-card" key={doctor._id}>
                  <div
                    className={`clinical-doctor-portrait clinical-portrait-${index === 1 ? "teal" : index === 2 ? "slate" : "blue"}`}
                  >
                    {doctor.docImage ? (
                      usingFallbackDoctors ? (
                        <Image
                          src={doctor.docImage}
                          alt={`${doctor.docFullName}, ${doctorRole(doctor.docSpecialty, t)}`}
                          fill
                          sizes="(max-width: 680px) calc(100vw - 64px), 245px"
                        />
                      ) : (
                        <span
                          className="clinical-api-doctor-image"
                          style={{
                            backgroundImage: `url(${resolveApiAsset(doctor.docImage)})`,
                          }}
                        />
                      )
                    ) : (
                      initials(doctor.docFullName)
                    )}
                    <span className="clinical-rating">
                      <Icon name="star" />{" "}
                      {Number(doctor.docPoints ?? 0).toFixed(1)} (
                      {[320, 275, 410][index] ?? 120}+ {t('home.doctor.reviews')})
                    </span>
                  </div>
                  <h3>{doctor.docFullName}</h3>
                  <b>{doctorRole(doctor.docSpecialty, t)}</b>
                  <p>
                    {index === 0
                      ? "MD, FACC"
                      : index === 1
                        ? "MD, PhD"
                        : "MBBS, FAAP"}{" "}
                    • {Number(doctor.docExperience ?? 0)} {t('home.doctor.years')}
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
                THE STANDARD OF HEALING
              </span>
              <h2>Why Patients Choose MN Hospital</h2>
              <p>
                We integrate compassionate clinical empathy with world-class
                tertiary healthcare standards to ensure optimal clinical
                outcomes and swift patient recuperation.
              </p>
            </div>
            <div className="clinical-trust-grid">
              <TrustItem
                icon="verified_user"
                title="Accredited Excellence"
                text="Fully certified by international Joint Commission International (JCI) and national healthcare audit boards for zero-compromise safety."
              />
              <TrustItem
                icon="biotech"
                title="Modern Diagnostic Labs"
                text="In-house 3T MRI, 128-slice dual source CT scanners, automated pathology, and same-day electronic test result delivery."
              />
              <TrustItem
                icon="favorite"
                title="Personalized Care"
                text="Dedicated patient coordinators, transparent billing plans, bedside telemetry, and post-discharge recovery monitoring."
              />
            </div>
          </section>

          <section className="clinical-testimonials" id="journal">
            <div className="clinical-testimonials-heading">
              <span className="clinical-section-kicker">VOICES OF HEALING</span>
              <h2>What Our Patients Say</h2>
            </div>
            <div className="clinical-testimonial-grid">
              <Testimonial
                initials="RH"
                name="Rebecca Henderson"
                role="Cardiac Recovery Patient"
              >
                “The cardiology wing treated my husband with exceptional
                urgency. Dr. Vance took the time to explain every detail before
                the angioplasty. We felt safe, respected, and thoroughly cared
                for.”
              </Testimonial>
              <Testimonial
                initials="DL"
                name="David Lockwood"
                role="Parent of Orthopedic Patient"
              >
                “My daughter required specialized orthopedic surgery following a
                gymnastics fracture. The pediatric orthopedic staff was
                empathetic, gentle, and the robotic precision made recovery
                shockingly fast.”
              </Testimonial>
            </div>
          </section>

          <section className="clinical-cta-card" id="booking">
            <div>
              <span className="clinical-cta-kicker">
                <Icon name="access_alarm" /> Same-Day Consultation Slots
                Available
              </span>
              <h2>
                Ready to Experience
                <br />
                World-Class Clinical Care?
              </h2>
              <p>
                Book with our top consultants online in less than 2 minutes or
                reach out directly to our 24/7 care concierge.
              </p>
            </div>
            <div className="clinical-cta-actions">
              <button
                className="clinical-light-button"
                onClick={() =>
                  setNotice(
                    "Appointment scheduling is ready — choose a doctor and preferred time.",
                  )
                }
              >
                <Icon name="edit_calendar" /> Schedule an Appointment
              </button>
              <a href="tel:+821000000077">
                <Icon name="call" /> Urgent Helpline: +82 10 0000-0077
              </a>
            </div>
          </section>
          <p className="clinical-notice" aria-live="polite">
            {notice}
          </p>
        </div>
        <AdvertisementRail side="right" />
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
  <div className={teal ? "teal" : ""}>
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
