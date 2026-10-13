import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import withLayoutMain from "@/libs/components/layout/LayoutHome";
import { GET_DOCTORS } from "@/apollo/doctor/query";
import Icon from "@/libs/components/common/Icon";
import {
  DoctorSort,
  DoctorSpecialty,
} from "@/libs/components/doctor/enums/doctor.enum";
import DoctorDirectoryCard from "@/libs/components/doctor/DoctorDirectoryCard";
import cardStyles from "@/libs/components/common/DirectoryCard.module.scss";
import { Doctor, Doctors } from "@/libs/components/doctor/types/doctor";
import { useTranslation } from "@/libs/i18n/useTranslation";
import { useWorkspaceText } from "@/libs/components/workspace/useWorkspaceText";
import { useDoctorSpecialtyLabel } from "@/libs/i18n/useDoctorSpecialtyLabel";
import type { GetServerSideProps } from 'next';
import { publicCatalogProps, type PublicCatalogProps } from '@/libs/seo/server';

type DoctorsPageProps = PublicCatalogProps<Doctors> & { initialSearch: string };
const doctorInquiry = (text: string, page = 1, specialty = '') => ({
  page, limit: 12, sort: DoctorSort.POINTS, direction: 'DESC',
  ...(specialty ? { docSpecialty: specialty } : {}),
  search: { ...(text ? { text } : {}) },
});

export const getServerSideProps: GetServerSideProps<DoctorsPageProps> = async ({ query, res }) => {
  const initialSearch = typeof query.search === 'string' ? query.search : '';
  return { props: { ...await publicCatalogProps<Doctors>(GET_DOCTORS, 'getDoctors', doctorInquiry(initialSearch), res), initialSearch } };
};

const DoctorsPage = ({ initialCatalog, initialInquiryKey, initialSearch }: DoctorsPageProps) => {
  const t = useTranslation();
  const w = useWorkspaceText();
  const specialtyLabel = useDoctorSpecialtyLabel();
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [specialty, setSpecialty] = useState("");
  const [appliedSearch, setAppliedSearch] = useState(initialSearch);
  const [page, setPage] = useState(1);
  useEffect(() => {
    if (router.isReady) {
      const value = typeof router.query.search === "string" ? router.query.search : "";
      setSearch(value);
      setAppliedSearch(value);
      setPage(1);
    }
  }, [router.isReady, router.query.search]);
  const inquiry = doctorInquiry(appliedSearch, page, specialty);
  const { data, previousData, loading, error } = useQuery(GET_DOCTORS, {
    variables: { input: inquiry },
    fetchPolicy: "cache-and-network",
    ssr: false,
  });
  const initial = JSON.stringify(inquiry) === initialInquiryKey ? initialCatalog : null;
  const result = data?.getDoctors ?? previousData?.getDoctors ?? (!error ? initial : null);
  const doctors = result?.list ?? [];
  const total = result?.metaCounter?.[0]?.total ?? 0;
  const submitHandler = (event: FormEvent) => {
    event.preventDefault();
    setAppliedSearch(search.trim());
    setPage(1);
  };

  return (
    <div className="clinical-inner-page">
      <section className="clinical-inner-hero">
        <div>
          <div className="clinical-crumb">
            <Link href="/">{t("nav.home")}</Link> / {t("nav.doctors")}
          </div>
          <span className="clinical-eyebrow">{t("doctors.eyebrow")}</span>
          <h1>
            {t("doctors.hero1")}
            <br />
            <em>{t("doctors.hero2")}</em>
          </h1>
          <p>{t("doctors.intro")}</p>
          <Link href="/visit-guide">{t("visit.title")} <Icon name="arrow_forward" /></Link>
        </div>
      </section>
      <section className="clinical-inner-section">
        <h2>{t("doctors.find")}</h2>
        <form
          className="clinical-filter-bar clinical-doctor-filter"
          onSubmit={submitHandler}
        >
          <label>
            <Icon name="search" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("doctors.searchPlaceholder")}
              aria-label={t("doctors.searchAria")}
            />
          </label>
          <select
            value={specialty}
            onChange={(event) => { setSpecialty(event.target.value); setPage(1); }}
            aria-label={t("doctors.filterSpecialty")}
          >
            <option value="">{t("doctors.allDepartments")}</option>
            {Object.values(DoctorSpecialty).map((value) => (
              <option key={value} value={value}>
                {specialtyLabel(value)}
              </option>
            ))}
          </select>

          <button className="clinical-primary-button" type="submit">
            {t("doctors.search")}
          </button>
        </form>
        <div className={cardStyles.grid} aria-busy={loading}>
          {doctors.map((doctor: Doctor) => (
            <DoctorDirectoryCard doctor={doctor} key={doctor._id} />
          ))}
        </div>
        {!error && total > 12 && <nav className="clinical-directory-pagination" aria-label={t("directory.pagination")}>
          <button type="button" disabled={page <= 1 || loading} onClick={() => setPage(value => value - 1)}>{t("directory.previous")}</button>
          <span aria-live="polite">{page} / {Math.ceil(total / 12)}</span>
          <button type="button" disabled={page * 12 >= total || loading} onClick={() => setPage(value => value + 1)}>{t("directory.next")}</button>
        </nav>}
        {error && <p role="alert">{w("catalogUnavailable")}</p>}
        {!loading && !error && !doctors.length && <p>{w("catalogEmpty")}</p>}
        {loading && (
          <p className="clinical-query-status">{t("doctors.loading")}</p>
        )}
      </section>
    </div>
  );
};

export default withLayoutMain(DoctorsPage);
