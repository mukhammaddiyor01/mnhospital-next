import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery as useApolloQuery } from "@apollo/client";
import { GET_DOCTORS } from "@/apollo/doctor/query";
import { DoctorSort } from "@/libs/components/doctor/enums/doctor.enum";
import { GET_SERVICES } from "@/apollo/service/query";
import { GET_ARTICLES } from "@/apollo/article/query";
import { ArticleStatus } from "@/libs/components/article/enums/article.enum";
import { Article } from "@/libs/components/article/types/article";
import { ArticleCard } from "@/libs/components/article/ArticleCard";
import Icon from "../common/Icon";
import { resolveApiAsset } from "@/libs/config";
import { ClinicalDoctorCard, ClinicalServiceCard } from "./types/clinical-home";
import DepartmentSwiper from "./DepartmentSwiper";
import { useTranslation } from "@/libs/i18n/useTranslation";
import { useDoctorSpecialtyLabel } from "@/libs/i18n/useDoctorSpecialtyLabel";

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
const ClinicalHome = () => {
  const t = useTranslation();
  const specialtyLabel = useDoctorSpecialtyLabel();
  const [activeSlide, setActiveSlide] = useState(0);
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
  const services: ClinicalServiceCard[] = (servicesQuery.data?.getServices?.list ?? []).filter(
    (service: ClinicalServiceCard, index: number, list: ClinicalServiceCard[]) =>
      list.findIndex((item) => `${item.serviceTitle}|${item.serviceDesc}`.trim().toLowerCase() === `${service.serviceTitle}|${service.serviceDesc}`.trim().toLowerCase()) === index,
  );
  const doctors: ClinicalDoctorCard[] = doctorsQuery.data?.getDoctors?.list ?? [];
  const articles: Article[] = articlesQuery.data?.getArticles?.list ?? [];
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
        <div className="clinical-center-column">
          <section className="clinical-hero-card">
            <span className="clinical-home-label">{t('home.accreditation')}</span>
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

          <section className="clinical-content-section" id="departments">
            <SectionHeading
              kicker={t('home.departments.kicker')}
              title={t('home.departments.title')}
              linkLabel={t('home.departments.link')}
              linkHref="/service"
            />
            {services.length ? <DepartmentSwiper services={services} /> : <p className="clinical-empty-state">{t('home.emptyServices')}</p>}
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
            {doctors.length ? <div className="clinical-doctor-grid">
              {doctors.map((doctor, index) => (
                <article className="clinical-doctor-card" key={doctor._id}>
                  <div
                    className={`clinical-doctor-portrait clinical-portrait-${index === 1 ? "teal" : index === 2 ? "slate" : "blue"}${doctor.docImage ? '' : ' is-placeholder'}`}
                  >
                    {doctor.docImage ? (
                      <span
                        className="clinical-api-doctor-image"
                        style={{ backgroundImage: `url(${resolveApiAsset(doctor.docImage)})` }}
                        role="img"
                        aria-label={doctor.docFullName || doctor.docNick || t('doctors.nameFallback')}
                      />
                    ) : (
                      initials(doctor.docFullName || doctor.docNick)
                    )}
                  </div>
                  <h3>{doctor.docFullName || doctor.docNick || t('doctors.nameFallback')}</h3>
                  <b>{specialtyLabel(doctor.docSpecialty)}</b>
                  {Number(doctor.docExperience) > 0 && <p>{doctor.docExperience} {t('home.doctor.years')}</p>}
                  <Link
                    className="clinical-doctor-book"
                    href={`/appointment?doctor=${doctor._id}`}
                  >
                    {t('home.doctor.book')}
                  </Link>
                </article>
              ))}
            </div> : <p className="clinical-empty-state">{t('home.emptyDoctors')}</p>}
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
            {articles.length ? <div className="clinical-article-grid">
              {articles.slice(0, 3).map((article) => (
                <ArticleCard article={article} key={article._id} />
              ))}
            </div> : <p className="clinical-empty-state">{t('home.emptyArticles')}</p>}
          </section>

          <section className="clinical-next-step" id="booking">
            <div>
              <span className="clinical-section-kicker">{t('home.cta.kicker')}</span>
              <h2>{t('home.cta.title1')}{' '}{t('home.cta.title2')}</h2>
              <p>{t('home.cta.intro')}</p>
            </div>
            <Link className="clinical-primary-button" href="/appointment">{t('home.cta.schedule')} <Icon name="arrow_forward" /></Link>
          </section>
        </div>
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
export default ClinicalHome;
